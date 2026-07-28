const DriverFactory = require('../utilities/driver.factory');
const SeleniumUtils = require('../utilities/selenium.utils');
const excelReporter = require('../utilities/excel.reporter');
const logger = require('../utilities/logger');
const config = require('../config/config');

class BaseTest {
  static setupHooks(suiteModule = 'E2E Suite') {
    let driver;
    let utils;
    let startTime;

    beforeEach(async function () {
      startTime = new Date();
      logger.info(`>>> Starting Test Scenario: [${this.currentTest.title}] in module: [${suiteModule}]`);
      driver = await DriverFactory.createDriver();
      utils = new SeleniumUtils(driver);
      this.driver = driver;
      this.utils = utils;
    });

    afterEach(async function () {
      const endTime = new Date();
      const duration = endTime - startTime;
      const testTitle = this.currentTest.title;
      const status = this.currentTest.state === 'passed' ? 'PASSED' : (this.currentTest.state === 'failed' ? 'FAILED' : 'SKIPPED');

      let failureReason = null;
      let screenshotPath = null;
      let currentUrl = config.baseUrl;

      if (status === 'FAILED' && this.currentTest.err) {
        failureReason = this.currentTest.err.message;
        try {
          const artifacts = await utils.captureFailureArtifacts(testTitle, this.currentTest.err);
          if (artifacts) {
            screenshotPath = artifacts.screenshotPath;
            currentUrl = artifacts.url;
          }
        } catch (e) {
          logger.error(`Error during failure artifact capture: ${e.message}`);
        }
      }

      // Record to Excel Reporter
      excelReporter.recordTestResult({
        id: `TC-${Math.floor(100 + Math.random() * 900)}`,
        module: suiteModule,
        scenario: testTitle,
        browser: config.browser,
        status,
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
        duration,
        url: currentUrl,
        failureReason,
        screenshotPath
      });

      excelReporter.logStep(testTitle, `Execution finished with status ${status}`, status, failureReason || 'OK');

      if (driver) {
        logger.info(`Quitting WebDriver instance for: [${testTitle}]`);
        await driver.quit().catch(() => {});
      }
    });

    after(async function () {
      await excelReporter.generateReport();
    });
  }
}

module.exports = BaseTest;
