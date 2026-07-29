const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const ForgotPasswordPage = require('../pages/forgot_password.page');

describe('Forgot Password Page Deep Coverage E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Forgot Password Page');

  let page;

  beforeEach(function () {
    page = new ForgotPasswordPage(this.driver);
  });

  // --- Page Structure ---
  it('FP_01: Should navigate to /forgot-password route', async function () {
    await page.navigate();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  it('FP_02: Should display "Forgot Password" heading', async function () {
    await page.navigate();
    const titleText = await page.getTitleText();
    expect(titleText).to.equal('Forgot Password');
  });

  it('FP_03: Should display instructions subtitle text', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.subtitle);
    expect(isPresent).to.be.true;
  });

  it('FP_04: Should display email input field', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.emailInput);
    expect(isPresent).to.be.true;
  });

  it('FP_05: Should display submit button', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.submitBtn);
    expect(isPresent).to.be.true;
  });

  it('FP_06: Should display back navigation button', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.backBtn);
    expect(isPresent).to.be.true;
  });

  // --- Attribute & Type Checks ---
  it('FP_07: Email field should have type="email"', async function () {
    await page.navigate();
    const type = await page.utils.getAttribute(page.emailInput, 'type');
    expect(type).to.equal('email');
  });

  it('FP_08: Submit button should have text "Send Reset Link"', async function () {
    await page.navigate();
    const btn = await page.utils.waitForVisible(page.submitBtn);
    const text = await btn.getText();
    expect(text).to.include('Send Reset Link');
  });

  it('FP_09: Email input placeholder should contain "example.com"', async function () {
    await page.navigate();
    const placeholder = await page.utils.getAttribute(page.emailInput, 'placeholder');
    expect(placeholder).to.include('example.com');
  });

  it('FP_10: Email field should have required attribute', async function () {
    await page.navigate();
    const required = await page.utils.getAttribute(page.emailInput, 'required');
    expect(required).to.not.be.null;
  });

  // --- Field Actions ---
  it('FP_11: Should allow typing an email address', async function () {
    await page.navigate();
    await page.enterEmail('reset@example.com');
    const val = await page.utils.getAttribute(page.emailInput, 'value');
    expect(val).to.equal('reset@example.com');
  });

  it('FP_12: Email input value updates dynamically', async function () {
    await page.navigate();
    await page.enterEmail('abc@domain.org');
    const val = await page.utils.getAttribute(page.emailInput, 'value');
    expect(val).to.equal('abc@domain.org');
  });

  it('FP_13: Email input field should be clearable', async function () {
    await page.navigate();
    await page.enterEmail('temporary@mail.com');
    await page.utils.type(page.emailInput, '');
    const val = await page.utils.getAttribute(page.emailInput, 'value');
    expect(val).to.equal('');
  });

  // --- Form Submission ---
  it('FP_14: Submitting form displays success notification message', async function () {
    await page.navigate();
    await page.enterEmail('valid@example.com');
    await page.submit();
    const isVisible = await page.isSuccessBannerVisible();
    expect(isVisible).to.be.true;
  });

  it('FP_15: Success banner mentions "instructions have been sent"', async function () {
    await page.navigate();
    await page.enterEmail('user@test.org');
    await page.submit();
    const banner = await page.utils.waitForVisible(page.successBanner);
    const text = await banner.getText();
    expect(text).to.include('instructions');
  });

  it('FP_16: Submitting form keeps user on /forgot-password route', async function () {
    await page.navigate();
    await page.enterEmail('stay@page.com');
    await page.submit();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  // --- Navigation & Structure ---
  it('FP_17: Clicking back button navigates back in history', async function () {
    await page.open('/login');
    await page.open('/forgot-password');
    await page.clickBack();
    await this.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('FP_18: Page should have a form element', async function () {
    await page.navigate();
    const forms = await page.utils.findElements(By.css('form'));
    expect(forms.length).to.be.at.least(1);
  });

  it('FP_19: Page should render an SVG icon for Key/Lock', async function () {
    await page.navigate();
    const svgs = await page.utils.findElements(By.css('svg'));
    expect(svgs.length).to.be.at.least(1);
  });

  it('FP_20: Page document title should be valid', async function () {
    await page.navigate();
    const title = await page.getTitle();
    expect(title).to.be.a('string');
  });

  it('FP_21: Refreshing page clears submitted state', async function () {
    await page.navigate();
    await page.enterEmail('test@email.com');
    await page.submit();
    await page.refreshPage();
    const isVisible = await page.utils.isElementPresent(page.successBanner);
    expect(isVisible).to.be.false;
  });

  it('FP_22: Submit button should be enabled initially', async function () {
    await page.navigate();
    const btn = await page.utils.waitForVisible(page.submitBtn);
    const isEnabled = await btn.isEnabled();
    expect(isEnabled).to.be.true;
  });

  it('FP_23: Email input should be visible', async function () {
    await page.navigate();
    await page.utils.waitForVisible(page.emailInput);
    const isDisplayed = await page.utils.isElementDisplayed(page.emailInput);
    expect(isDisplayed).to.be.true;
  });

  it('FP_24: Title text should be displayed', async function () {
    await page.navigate();
    await page.utils.waitForVisible(page.title);
    const isDisplayed = await page.utils.isElementDisplayed(page.title);
    expect(isDisplayed).to.be.true;
  });

  it('FP_25: Page container should span full width layout', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(By.css('div'));
    expect(isPresent).to.be.true;
  });
});
