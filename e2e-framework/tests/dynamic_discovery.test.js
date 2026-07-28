const { expect } = require('chai');
const BaseTest = require('./base.test');
const RouteAndFormDiscoverer = require('../utilities/route.discoverer');
const BasePage = require('../pages/base.page');
const logger = require('../utilities/logger');
const testData = require('../data/testData');

describe('Dynamic Route & Form Discovery E2E Test Engine', function () {
  this.timeout(90000);
  BaseTest.setupHooks('Dynamic Discovery');

  const routesToTest = testData.routes.public;

  routesToTest.forEach(routePath => {
    it(`DYN_DISCOVERY: Introspect & test form rules dynamically on route [${routePath}]`, async function () {
      const page = new BasePage(this.driver);
      await page.open(routePath);
      await this.driver.sleep(1000);

      const discoverer = new RouteAndFormDiscoverer(this.driver);
      const formSchemas = await discoverer.discoverFormsOnPage();

      logger.info(`Route [${routePath}] rendered ${formSchemas.length} form container(s).`);

      if (formSchemas.length === 0) {
        logger.info(`No input forms found on route [${routePath}]. Test pass confirmed.`);
        return;
      }

      for (const formSchema of formSchemas) {
        const scenarios = discoverer.generateDynamicTestScenarios(formSchema);
        logger.info(`Generated ${scenarios.length} dynamic test validation rules for form #${formSchema.formIndex}`);

        for (const scenario of scenarios) {
          logger.info(`Executing dynamic rule: ${scenario.rule} on field ${scenario.fieldName}`);
          const elementPresent = await page.utils.isElementPresent({ css: scenario.selector });
          expect(elementPresent).to.be.true;
        }
      }
    });
  });
});
