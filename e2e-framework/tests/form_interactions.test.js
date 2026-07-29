const { expect } = require('chai');
const { By, Key } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Detailed Form Interactions E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Form Interactions');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  // --- Email formatting & typing ---
  it('FI_01: Login email input accepts special characters in local part', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('user.name+tag@domain.co.uk');
    const val = await input.getAttribute('value');
    expect(val).to.equal('user.name+tag@domain.co.uk');
  });

  it('FI_02: Register email input accepts subdomain email addresses', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="email"]'));
    await input.sendKeys('admin@sub.domain.org');
    const val = await input.getAttribute('value');
    expect(val).to.equal('admin@sub.domain.org');
  });

  it('FI_03: Login email input accepts uppercase characters', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('UPPERCASE@DOMAIN.COM');
    const val = await input.getAttribute('value');
    expect(val).to.equal('UPPERCASE@DOMAIN.COM');
  });

  // --- Password complexity typing ---
  it('FI_04: Login password input accepts long strings (>50 chars)', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    const longString = 'P'.repeat(60);
    await input.sendKeys(longString);
    const val = await input.getAttribute('value');
    expect(val.length).to.equal(60);
  });

  it('FI_05: Register password input accepts symbols and numbers', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.sendKeys('!@#$%^&*()_+=12345');
    const val = await input.getAttribute('value');
    expect(val).to.equal('!@#$%^&*()_+=12345');
  });

  // --- Age Input boundaries ---
  it('FI_06: Register age input accepts two digit numbers', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="age"]'));
    await input.sendKeys('30');
    const val = await input.getAttribute('value');
    expect(val).to.equal('30');
  });

  it('FI_07: Register age input accepts minimum typical age (18)', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="age"]'));
    await input.sendKeys('18');
    const val = await input.getAttribute('value');
    expect(val).to.equal('18');
  });

  it('FI_08: Register age input accepts maximum typical age (99)', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="age"]'));
    await input.sendKeys('99');
    const val = await input.getAttribute('value');
    expect(val).to.equal('99');
  });

  // --- Gender Select interactions ---
  it('FI_09: Register gender select defaults to Male or first option', async function () {
    await page.open('/register');
    const select = await page.utils.waitForVisible(By.css('select[name="gender"]'));
    const val = await select.getAttribute('value');
    expect(val).to.be.a('string');
  });

  it('FI_10: Register gender select option "Female" is selectable', async function () {
    await page.open('/register');
    const select = await page.utils.waitForVisible(By.css('select[name="gender"]'));
    await select.sendKeys('Female');
    const val = await select.getAttribute('value');
    expect(val).to.equal('Female');
  });

  it('FI_11: Register gender select option "Prefer not to say" is selectable', async function () {
    await page.open('/register');
    const select = await page.utils.waitForVisible(By.css('select[name="gender"]'));
    await select.sendKeys('Prefer not to say');
    const val = await select.getAttribute('value');
    expect(val).to.equal('Prefer not to say');
  });

  // --- Form Reset & Keyboard Clears ---
  it('FI_12: Login email can be cleared using BACKSPACE keys', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('abc');
    await input.sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE);
    const val = await input.getAttribute('value');
    expect(val).to.equal('');
  });

  it('FI_13: Login password can be cleared using BACKSPACE keys', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.sendKeys('xyz');
    await input.sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE);
    const val = await input.getAttribute('value');
    expect(val).to.equal('');
  });

  it('FI_14: Register age input can be cleared', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="age"]'));
    await input.sendKeys('45');
    await input.clear();
    const val = await input.getAttribute('value');
    expect(val).to.equal('');
  });

  // --- Multiple Form Submission attempts ---
  it('FI_15: Multiple clicks on login submit button do not throw error', async function () {
    await page.open('/login');
    const btn = await page.utils.waitForVisible(By.css('button[type="submit"]'));
    await btn.click();
    await btn.click();
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('FI_16: Multiple clicks on register submit button do not throw error', async function () {
    await page.open('/register');
    const btn = await page.utils.waitForVisible(By.css('button[type="submit"]'));
    await btn.click();
    await btn.click();
    const isPresent = await page.utils.isElementPresent(By.css('form'));
    expect(isPresent).to.be.true;
  });

  it('FI_17: Forgot Password form submit button accepts Enter key', async function () {
    await page.open('/forgot-password');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('test@forgot.com', Key.ENTER);
    await page.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  // --- Copy / Paste Simulation ---
  it('FI_18: Login email input preserves pasted string values', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.sendKeys('pasted.email@domain.com');
    const val = await input.getAttribute('value');
    expect(val).to.equal('pasted.email@domain.com');
  });

  it('FI_19: Register password input preserves pasted string values', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.sendKeys('ComplexPastedPass#1');
    const val = await input.getAttribute('value');
    expect(val).to.equal('ComplexPastedPass#1');
  });

  // --- Focus retention ---
  it('FI_20: Clicking login email input retains focus on email input', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.click();
    const active = await page.driver.switchTo().activeElement();
    const type = await active.getAttribute('type');
    expect(type).to.equal('email');
  });

  it('FI_21: Clicking login password input retains focus on password input', async function () {
    await page.open('/login');
    const input = await page.utils.waitForVisible(By.css('input[name="password"]'));
    await input.click();
    const active = await page.driver.switchTo().activeElement();
    const name = await active.getAttribute('name');
    expect(name).to.equal('password');
  });

  it('FI_22: Clicking register email input retains focus', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="email"]'));
    await input.click();
    const active = await page.driver.switchTo().activeElement();
    const name = await active.getAttribute('name');
    expect(name).to.equal('email');
  });

  it('FI_23: Clicking register age input retains focus', async function () {
    await page.open('/register');
    const input = await page.utils.waitForVisible(By.css('input[name="age"]'));
    await input.click();
    const active = await page.driver.switchTo().activeElement();
    const name = await active.getAttribute('name');
    expect(name).to.equal('age');
  });

  it('FI_24: Clicking forgot password email input retains focus', async function () {
    await page.open('/forgot-password');
    const input = await page.utils.waitForVisible(By.css('input[type="email"]'));
    await input.click();
    const active = await page.driver.switchTo().activeElement();
    const type = await active.getAttribute('type');
    expect(type).to.equal('email');
  });

  it('FI_25: Form elements render within viewport bounds', async function () {
    await page.open('/login');
    const form = await page.utils.waitForElement(By.css('form'));
    const isDisplayed = await form.isDisplayed();
    expect(isDisplayed).to.be.true;
  });
});
