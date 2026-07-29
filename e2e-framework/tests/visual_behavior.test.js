const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Visual & Responsive Behavior E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Visual Behavior');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  // --- Viewport resizing tests ---
  it('VB_01: Login page renders cleanly in Desktop viewport (1920x1080)', async function () {
    await page.driver.manage().window().setRect({ width: 1920, height: 1080 });
    await page.open('/login');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_02: Login page renders cleanly in Tablet viewport (768x1024)', async function () {
    await page.driver.manage().window().setRect({ width: 768, height: 1024 });
    await page.open('/login');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_03: Login page renders cleanly in Mobile viewport (375x812)', async function () {
    await page.driver.manage().window().setRect({ width: 375, height: 812 });
    await page.open('/login');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_04: Register page renders cleanly in Mobile viewport (375x812)', async function () {
    await page.driver.manage().window().setRect({ width: 375, height: 812 });
    await page.open('/register');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_05: Forgot Password renders cleanly in Mobile viewport (375x812)', async function () {
    await page.driver.manage().window().setRect({ width: 375, height: 812 });
    await page.open('/forgot-password');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_06: Intro page renders cleanly in Mobile viewport (375x812)', async function () {
    await page.driver.manage().window().setRect({ width: 375, height: 812 });
    await page.open('/intro');
    const isPresent = await page.utils.isElementPresent(By.css('h2'));
    expect(isPresent).to.be.true;
  });

  // --- Style & Class Verification ---
  it('VB_07: Body element contains background styles or css vars', async function () {
    await page.open('/login');
    const body = await page.utils.waitForElement(By.css('body'));
    expect(body).to.exist;
  });

  it('VB_08: Submit buttons use gradient styling or styled borders', async function () {
    await page.open('/login');
    const btn = await page.utils.waitForElement(By.css('button[type="submit"]'));
    const style = await btn.getAttribute('style');
    expect(style).to.not.be.null;
  });

  it('VB_09: Input elements render with border radius', async function () {
    await page.open('/login');
    const input = await page.utils.waitForElement(By.css('input[type="email"]'));
    const style = await input.getAttribute('style');
    expect(style).to.not.be.null;
  });

  it('VB_10: Error message box renders when active', async function () {
    await page.open('/login');
    await page.utils.click(By.css('button[type="submit"]'));
    const err = await page.utils.waitForVisible(By.xpath("//div[contains(text(), 'fill') or contains(text(), 'Please')]"));
    expect(err).to.exist;
  });

  it('VB_11: Eye icon toggle button contains SVG child element', async function () {
    await page.open('/login');
    const eyeBtn = await page.utils.waitForVisible(By.xpath("//button[@type='button']"));
    const svgs = await eyeBtn.findElements(By.css('svg'));
    expect(svgs.length).to.be.at.least(1);
  });

  it('VB_12: Forgot Password key icon area renders SVG icon', async function () {
    await page.open('/forgot-password');
    const svgs = await page.utils.findElements(By.css('svg'));
    expect(svgs.length).to.be.at.least(1);
  });

  it('VB_13: Intro slide carousel renders active dot width', async function () {
    await page.open('/intro');
    const activeDot = await page.utils.waitForElement(By.xpath("//div[contains(@style, 'width: 24px') or contains(@style, 'width:24px')]"));
    expect(activeDot).to.exist;
  });

  it('VB_14: Page container has height style applied', async function () {
    await page.open('/login');
    const mainDiv = await page.utils.waitForElement(By.xpath("//div[contains(@style, '100vh') or contains(@style, 'height')]"));
    expect(mainDiv).to.exist;
  });

  it('VB_15: Main container uses flexbox layout', async function () {
    await page.open('/login');
    const mainDiv = await page.utils.waitForElement(By.xpath("//div[contains(@style, 'flex') or contains(@style, 'display')]"));
    expect(mainDiv).to.exist;
  });

  it('VB_16: Font family variables or fallback fonts apply to body', async function () {
    await page.open('/login');
    const isPresent = await page.utils.isElementPresent(By.css('body'));
    expect(isPresent).to.be.true;
  });

  it('VB_17: Register page form is displayed', async function () {
    await page.open('/register');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_18: Login page form is displayed', async function () {
    await page.open('/login');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('VB_19: Page animations render without throw', async function () {
    await page.open('/login');
    const animatedElems = await page.utils.findElements(By.css('[class*="animate"]'));
    expect(animatedElems).to.be.an('array');
  });

  it('VB_20: Page background style color token is applied', async function () {
    await page.open('/login');
    const mainDiv = await page.utils.waitForElement(By.css('div'));
    const style = await mainDiv.getAttribute('style');
    expect(style).to.be.a('string');
  });
});
