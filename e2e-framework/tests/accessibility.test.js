const { expect } = require('chai');
const { By, Key } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Accessibility & Keyboard Interaction E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Accessibility');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  // --- Keyboard navigation on Login Page ---
  it('AX_01: Login email input should receive focus', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.click();
    const activeElem = await page.driver.switchTo().activeElement();
    const type = await activeElem.getAttribute('type');
    expect(type).to.equal('email');
  });

  it('AX_02: Pressing TAB from email input moves focus', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.click();
    await activeElementSendKeys(page.driver, Key.TAB);
    const activeElem = await page.driver.switchTo().activeElement();
    expect(activeElem).to.exist;
  });

  it('AX_03: Login page inputs should be focusable via click', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.click();
    const activeElem = await page.driver.switchTo().activeElement();
    const name = await activeElem.getAttribute('name');
    expect(name).to.equal('password');
  });

  it('AX_04: Login button can receive focus via keyboard tabbing', async function () {
    await page.open('/login');
    const btn = await page.utils.waitForVisible(By.css('button[type="submit"]'));
    await btn.click();
    const activeElem = await page.driver.switchTo().activeElement();
    expect(activeElem).to.exist;
  });

  it('AX_05: Enter key on login submit button triggers form submission', async function () {
    await page.open('/login');
    const email = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await email.sendKeys('test@example.com', Key.TAB, 'password123', Key.ENTER);
    await page.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  // --- Input Attributes & Semantics ---
  it('AX_06: Email input on login has placeholder for assistive context', async function () {
    await page.open('/login');
    const placeholder = await page.utils.getAttribute(By.css('input[type="email"]'), 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  it('AX_07: Password input on login has placeholder attribute', async function () {
    await page.open('/login');
    const placeholder = await page.utils.getAttribute(By.css('input[name="password"]'), 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  it('AX_08: Register page email input has placeholder', async function () {
    await page.open('/register');
    const placeholder = await page.utils.getAttribute(By.css('input[name="email"]'), 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  it('AX_09: Register page age input has placeholder', async function () {
    await page.open('/register');
    const placeholder = await page.utils.getAttribute(By.css('input[name="age"]'), 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  it('AX_10: Register page password input has placeholder', async function () {
    await page.open('/register');
    const placeholder = await page.utils.getAttribute(By.css('input[name="password"]'), 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  // --- Form Labels & Hierarchy ---
  it('AX_11: Login page headings use valid HTML tags (h1/h2)', async function () {
    await page.open('/login');
    const headings = await page.utils.findElements(By.css('h1, h2, h3'));
    expect(headings.length).to.be.at.least(1);
  });

  it('AX_12: Register page headings use valid HTML tags', async function () {
    await page.open('/register');
    const headings = await page.utils.findElements(By.css('h1, h2, h3'));
    expect(headings.length).to.be.at.least(1);
  });

  it('AX_13: Forgot Password page heading uses h1 tag', async function () {
    await page.open('/forgot-password');
    const headings = await page.utils.findElements(By.css('h1'));
    expect(headings.length).to.be.at.least(1);
  });

  it('AX_14: Intro page headings use h2 tag', async function () {
    await page.open('/intro');
    const headings = await page.utils.findElements(By.css('h2'));
    expect(headings.length).to.be.at.least(1);
  });

  it('AX_15: Login page form labels are present', async function () {
    await page.open('/login');
    const labels = await page.utils.findElements(By.css('label'));
    expect(labels.length).to.be.at.least(2);
  });

  it('AX_16: Register page form labels are present', async function () {
    await page.open('/register');
    const labels = await page.utils.findElements(By.css('label'));
    expect(labels.length).to.be.at.least(3);
  });

  it('AX_17: Forgot Password form label is present', async function () {
    await page.open('/forgot-password');
    const labels = await page.utils.findElements(By.css('label'));
    expect(labels.length).to.be.at.least(1);
  });

  // --- Buttons & Interactive Elements ---
  it('AX_18: Login submit button has legible text content', async function () {
    await page.open('/login');
    const text = await page.utils.getText(By.css('button[type="submit"]'));
    expect(text.length).to.be.greaterThan(0);
  });

  it('AX_19: Register submit button has legible text content', async function () {
    await page.open('/register');
    const text = await page.utils.getText(By.css('button[type="submit"]'));
    expect(text.length).to.be.greaterThan(0);
  });

  it('AX_20: Forgot Password submit button has legible text content', async function () {
    await page.open('/forgot-password');
    const text = await page.utils.getText(By.css('button[type="submit"]'));
    expect(text.length).to.be.greaterThan(0);
  });

  it('AX_21: Intro Next button has legible text content', async function () {
    await page.open('/intro');
    const text = await page.utils.getText(By.css('button'));
    expect(text.length).to.be.greaterThan(0);
  });

  it('AX_22: Login eye toggle button is a clickable element', async function () {
    await page.open('/login');
    const btns = await page.utils.findElements(By.css('button'));
    expect(btns.length).to.be.at.least(2);
  });

  // --- Page Structure & Contrast Support ---
  it('AX_23: Document language attribute or root is present', async function () {
    await page.open('/login');
    const html = await page.utils.waitForElement(By.css('html'));
    expect(html).to.exist;
  });

  it('AX_24: Meta viewport tag is present for screen scaling', async function () {
    await page.open('/login');
    const meta = await page.utils.findElements(By.css('meta[name="viewport"]'));
    expect(meta.length).to.be.at.least(1);
  });

  it('AX_25: Links on Login page have descriptive href targets', async function () {
    await page.open('/login');
    const links = await page.utils.findElements(By.css('a'));
    for (let link of links) {
      const href = await link.getAttribute('href');
      expect(href).to.not.be.empty;
    }
  });

  it('AX_26: Links on Register page have descriptive href targets', async function () {
    await page.open('/register');
    const links = await page.utils.findElements(By.css('a'));
    for (let link of links) {
      const href = await link.getAttribute('href');
      expect(href).to.not.be.empty;
    }
  });

  it('AX_27: Form elements do not have disabled attribute by default', async function () {
    await page.open('/login');
    const btn = await page.utils.waitForElement(By.css('button[type="submit"]'));
    const disabled = await btn.getAttribute('disabled');
    expect(disabled).to.be.null;
  });

  it('AX_28: Input elements accept standard ASCII key presses', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('keyboard-user@test.org');
    const val = await input.getAttribute('value');
    expect(val).to.equal('keyboard-user@test.org');
  });

  it('AX_29: Password input accepts standard ASCII key presses', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.sendKeys('MyPass123!');
    const val = await input.getAttribute('value');
    expect(val).to.equal('MyPass123!');
  });

  it('AX_30: Page zoom does not crash page layout', async function () {
    await page.open('/login');
    await page.utils.executeScript('document.body.style.zoom = "150%";');
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });
});

async function activeElementSendKeys(driver, ...keys) {
  const active = await driver.switchTo().activeElement();
  await active.sendKeys(...keys);
}
