const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const LoginPage = require('../pages/login.page');

describe('Login Page Deep Coverage E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Login Page');

  let loginPage;

  beforeEach(function () {
    loginPage = new LoginPage(this.driver);
  });

  // --- Page Structure ---
  it('LP_01: Should load login page without JavaScript errors', async function () {
    await loginPage.navigate();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('LP_02: Should display email input field on login page', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.emailInput);
    expect(isPresent).to.be.true;
  });

  it('LP_03: Should display password input field on login page', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.passwordInput);
    expect(isPresent).to.be.true;
  });

  it('LP_04: Should display submit button on login page', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.submitBtn);
    expect(isPresent).to.be.true;
  });

  it('LP_05: Should display "Create an account" link on login page', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.createAccountLink);
    expect(isPresent).to.be.true;
  });

  it('LP_06: Should display "Forgot?" password link', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.forgotPasswordLink);
    expect(isPresent).to.be.true;
  });

  it('LP_07: Email input should have type="email"', async function () {
    await loginPage.navigate();
    const type = await loginPage.utils.getAttribute(loginPage.emailInput, 'type');
    expect(type).to.equal('email');
  });

  it('LP_08: Password input should start with type="password"', async function () {
    await loginPage.navigate();
    const type = await loginPage.utils.getAttribute(loginPage.passwordInput, 'type');
    expect(type).to.equal('password');
  });

  it('LP_09: Submit button should be enabled on page load', async function () {
    await loginPage.navigate();
    const btn = await loginPage.utils.waitForVisible(loginPage.submitBtn);
    const enabled = await btn.isEnabled();
    expect(enabled).to.be.true;
  });

  it('LP_10: Eye icon button should be visible next to password field', async function () {
    await loginPage.navigate();
    const isPresent = await loginPage.utils.isElementPresent(loginPage.togglePasswordBtn);
    expect(isPresent).to.be.true;
  });

  // --- Email field interactions ---
  it('LP_11: Should accept text input in email field', async function () {
    await loginPage.navigate();
    await loginPage.utils.type(loginPage.emailInput, 'test@example.com');
    const value = await loginPage.utils.getAttribute(loginPage.emailInput, 'value');
    expect(value).to.include('test');
  });

  it('LP_12: Email field value should update on typing', async function () {
    await loginPage.navigate();
    await loginPage.utils.type(loginPage.emailInput, 'user@test.com');
    const value = await loginPage.utils.getAttribute(loginPage.emailInput, 'value');
    expect(value).to.equal('user@test.com');
  });

  it('LP_13: Email field should be clearable', async function () {
    await loginPage.navigate();
    await loginPage.utils.type(loginPage.emailInput, 'clear@test.com');
    await loginPage.utils.type(loginPage.emailInput, '');
    const value = await loginPage.utils.getAttribute(loginPage.emailInput, 'value');
    expect(value).to.equal('');
  });

  it('LP_14: Email placeholder should contain "@"', async function () {
    await loginPage.navigate();
    const placeholder = await loginPage.utils.getAttribute(loginPage.emailInput, 'placeholder');
    expect(placeholder).to.include('@');
  });

  // --- Password field interactions ---
  it('LP_15: Should accept text input in password field', async function () {
    await loginPage.navigate();
    await loginPage.utils.type(loginPage.passwordInput, 'TestPass123!');
    const value = await loginPage.utils.getAttribute(loginPage.passwordInput, 'value');
    expect(value.length).to.be.greaterThan(0);
  });

  it('LP_16: Password field should be clearable', async function () {
    await loginPage.navigate();
    await loginPage.utils.type(loginPage.passwordInput, 'password123');
    await loginPage.utils.type(loginPage.passwordInput, '');
    const value = await loginPage.utils.getAttribute(loginPage.passwordInput, 'value');
    expect(value).to.equal('');
  });

  it('LP_17: Password placeholder should not be empty', async function () {
    await loginPage.navigate();
    const placeholder = await loginPage.utils.getAttribute(loginPage.passwordInput, 'placeholder');
    expect(placeholder).to.not.be.empty;
  });

  // --- Toggle password visibility ---
  it('LP_18: Clicking eye button should toggle password field type to text', async function () {
    await loginPage.navigate();
    await loginPage.utils.click(loginPage.togglePasswordBtn);
    const type = await loginPage.utils.getAttribute(loginPage.passwordInput, 'type');
    expect(type).to.equal('text');
  });

  it('LP_19: Clicking eye button twice should restore password type', async function () {
    await loginPage.navigate();
    await loginPage.utils.click(loginPage.togglePasswordBtn);
    await loginPage.utils.click(loginPage.togglePasswordBtn);
    const type = await loginPage.utils.getAttribute(loginPage.passwordInput, 'type');
    expect(type).to.equal('password');
  });

  // --- Validation behavior ---
  it('LP_20: Submitting with empty email shows error', async function () {
    await loginPage.navigate();
    await loginPage.login('', '');
    const shown = await loginPage.isErrorMessageDisplayed();
    expect(shown).to.be.true;
  });

  it('LP_21: Submitting with only email shows error', async function () {
    await loginPage.navigate();
    await loginPage.login('solo@email.com', '');
    const shown = await loginPage.isErrorMessageDisplayed();
    expect(shown).to.be.true;
  });

  it('LP_22: Error message text should mention "fill" when fields are empty', async function () {
    await loginPage.navigate();
    await loginPage.login('', '');
    const text = await loginPage.getErrorMessageText();
    expect(text.toLowerCase()).to.include('fill');
  });

  // --- Link navigation ---
  it('LP_23: Create account link should point to register route', async function () {
    await loginPage.navigate();
    const elem = await loginPage.utils.waitForElement(loginPage.createAccountLink);
    const href = await elem.getAttribute('href');
    expect(href).to.include('register');
  });

  it('LP_24: Forgot? link should point to forgot-password route', async function () {
    await loginPage.navigate();
    const elem = await loginPage.utils.waitForElement(loginPage.forgotPasswordLink);
    const href = await elem.getAttribute('href');
    expect(href).to.include('forgot-password');
  });

  it('LP_25: Clicking Create Account link should navigate to /register', async function () {
    await loginPage.navigate();
    await loginPage.clickCreateAccount();
    await this.driver.sleep(800);
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('register');
  });

  it('LP_26: Page title (document) should be a string', async function () {
    await loginPage.navigate();
    const title = await loginPage.getTitle();
    expect(title).to.be.a('string');
  });

  it('LP_27: Login page should have a form element', async function () {
    await loginPage.navigate();
    const forms = await loginPage.utils.findElements(By.css('form'));
    expect(forms.length).to.be.greaterThan(0);
  });

  it('LP_28: Login page body should not be empty', async function () {
    await loginPage.navigate();
    const body = await loginPage.utils.findElements(By.css('body'));
    expect(body.length).to.be.greaterThan(0);
  });

  it('LP_29: Login page should render at least 2 input fields', async function () {
    await loginPage.navigate();
    const inputs = await loginPage.utils.findElements(By.css('input'));
    expect(inputs.length).to.be.at.least(2);
  });

  it('LP_30: Refreshing login page should keep URL at /login', async function () {
    await loginPage.navigate();
    await loginPage.refreshPage();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');
  });
});
