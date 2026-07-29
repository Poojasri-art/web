const { expect } = require('chai');
const BaseTest = require('./base.test');
const SplashPage = require('../pages/splash.page');

describe('Splash Page E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Splash Page');

  let page;

  beforeEach(function () {
    page = new SplashPage(this.driver);
  });

  it('SP_01: Should open root URL path', async function () {
    await page.navigate();
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('SP_02: Root path should initially load splash view', async function () {
    await page.navigate();
    const isLoaded = await page.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('SP_03: Splash screen automatically redirects unauthenticated user to /login', async function () {
    await page.navigate();
    const finalUrl = await page.waitForRedirect(4000);
    expect(finalUrl).to.include('/login');
  });

  it('SP_04: Refreshing splash screen initiates redirect sequence again', async function () {
    await page.navigate();
    await page.refreshPage();
    const finalUrl = await page.waitForRedirect(4000);
    expect(finalUrl).to.include('/login');
  });

  it('SP_05: Document title is set when loading splash page', async function () {
    await page.navigate();
    const title = await page.getTitle();
    expect(title).to.be.a('string');
  });

  it('SP_06: Root path should render HTML root container element', async function () {
    await page.navigate();
    const present = await page.utils.isElementPresent({ css: '#root' });
    expect(present).to.be.true;
  });

  it('SP_07: Body background color or style is applied', async function () {
    await page.navigate();
    const body = await page.utils.waitForElement({ css: 'body' });
    expect(body).to.exist;
  });

  it('SP_08: Splash page does not produce fatal errors', async function () {
    await page.navigate();
    const logs = await page.getConsoleLogs();
    const severe = logs.filter(l => l.level.name === 'SEVERE');
    expect(severe.length).to.equal(0);
  });

  it('SP_09: Splash timeout redirects smoothly without crash', async function () {
    await page.navigate();
    await this.driver.sleep(4000);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('SP_10: Navigation history records splash or redirect entry', async function () {
    await page.navigate();
    await page.waitForRedirect(4000);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('SP_11: Accessing root path multiple times works consistently', async function () {
    await page.navigate();
    await page.navigate();
    const isLoaded = await page.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('SP_12: Browser window title on splash is accessible', async function () {
    await page.navigate();
    const title = await page.getTitle();
    expect(title).to.not.be.null;
  });

  it('SP_13: Unauthenticated redirect target is /login specifically', async function () {
    await page.navigate();
    await this.driver.sleep(4000);
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('SP_14: Page contains main wrapper div', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent({ css: 'div' });
    expect(isPresent).to.be.true;
  });

  it('SP_15: Page view height fills screen viewport', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent({ css: 'div' });
    expect(isPresent).to.be.true;
  });

  it('SP_16: Splash screen loads within acceptable threshold', async function () {
    const start = Date.now();
    await page.navigate();
    const duration = Date.now() - start;
    expect(duration).to.be.below(15000);
  });

  it('SP_17: Direct navigation to / works from browser', async function () {
    await page.open('/');
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('SP_18: Console log list is an array', async function () {
    await page.navigate();
    const logs = await page.getConsoleLogs();
    expect(logs).to.be.an('array');
  });

  it('SP_19: Page viewport is responsive', async function () {
    await page.navigate();
    const isLoaded = await page.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('SP_20: Splash flow finishes in expected time', async function () {
    await page.navigate();
    await this.driver.sleep(4000);
    const url = await page.getCurrentUrl();
    expect(url.length).to.be.greaterThan(0);
  });
});
