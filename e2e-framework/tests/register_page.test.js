const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const RegisterPage = require('../pages/register.page');

describe('Register Page Deep Coverage E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Register Page');

  let registerPage;

  beforeEach(function () {
    registerPage = new RegisterPage(this.driver);
  });

  // --- Page Load ---
  it('RP_01: Should load register page at /register route', async function () {
    await registerPage.navigate();
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/register');
  });

  it('RP_02: Should load register page at /signup route', async function () {
    await registerPage.open('/signup');
    const url = await registerPage.getCurrentUrl();
    expect(url).to.match(/register|signup/);
  });

  // --- Field Presence ---
  it('RP_03: Should display email input field', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.emailInput);
    expect(present).to.be.true;
  });

  it('RP_04: Should display age input field', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.ageInput);
    expect(present).to.be.true;
  });

  it('RP_05: Should display gender select dropdown', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.genderSelect);
    expect(present).to.be.true;
  });

  it('RP_06: Should display password input field', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.passwordInput);
    expect(present).to.be.true;
  });

  it('RP_07: Should display submit button', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.submitBtn);
    expect(present).to.be.true;
  });

  it('RP_08: Should display Sign In link', async function () {
    await registerPage.navigate();
    const present = await registerPage.utils.isElementPresent(registerPage.signInLink);
    expect(present).to.be.true;
  });

  // --- Field Type Validation ---
  it('RP_09: Email field should have type="email"', async function () {
    await registerPage.navigate();
    const type = await registerPage.utils.getAttribute(registerPage.emailInput, 'type');
    expect(type).to.equal('email');
  });

  it('RP_10: Age field should have type="number"', async function () {
    await registerPage.navigate();
    const type = await registerPage.utils.getAttribute(registerPage.ageInput, 'type');
    expect(type).to.equal('number');
  });

  it('RP_11: Password field should have type="password"', async function () {
    await registerPage.navigate();
    const type = await registerPage.utils.getAttribute(registerPage.passwordInput, 'type');
    expect(type).to.equal('password');
  });

  // --- Field Name Attributes ---
  it('RP_12: Email field should have name="email"', async function () {
    await registerPage.navigate();
    const name = await registerPage.utils.getAttribute(registerPage.emailInput, 'name');
    expect(name).to.equal('email');
  });

  it('RP_13: Age field should have name="age"', async function () {
    await registerPage.navigate();
    const name = await registerPage.utils.getAttribute(registerPage.ageInput, 'name');
    expect(name).to.equal('age');
  });

  it('RP_14: Gender field should have name="gender"', async function () {
    await registerPage.navigate();
    const name = await registerPage.utils.getAttribute(registerPage.genderSelect, 'name');
    expect(name).to.equal('gender');
  });

  it('RP_15: Password field should have name="password"', async function () {
    await registerPage.navigate();
    const name = await registerPage.utils.getAttribute(registerPage.passwordInput, 'name');
    expect(name).to.equal('password');
  });

  // --- Field Interactions ---
  it('RP_16: Should type into email field', async function () {
    await registerPage.navigate();
    await registerPage.utils.type(registerPage.emailInput, 'typed@test.com');
    const value = await registerPage.utils.getAttribute(registerPage.emailInput, 'value');
    expect(value).to.equal('typed@test.com');
  });

  it('RP_17: Should type into age field', async function () {
    await registerPage.navigate();
    await registerPage.utils.type(registerPage.ageInput, '25');
    const value = await registerPage.utils.getAttribute(registerPage.ageInput, 'value');
    expect(value).to.equal('25');
  });

  it('RP_18: Should type into password field', async function () {
    await registerPage.navigate();
    await registerPage.utils.type(registerPage.passwordInput, 'SecurePass123!');
    const value = await registerPage.utils.getAttribute(registerPage.passwordInput, 'value');
    expect(value.length).to.be.greaterThan(0);
  });

  it('RP_19: Email field placeholder should contain "@"', async function () {
    await registerPage.navigate();
    const ph = await registerPage.utils.getAttribute(registerPage.emailInput, 'placeholder');
    expect(ph).to.include('@');
  });

  it('RP_20: Age field placeholder should mention age example', async function () {
    await registerPage.navigate();
    const ph = await registerPage.utils.getAttribute(registerPage.ageInput, 'placeholder');
    expect(ph).to.not.be.empty;
  });

  // --- Gender Dropdown ---
  it('RP_21: Gender dropdown should have at least 2 options', async function () {
    await registerPage.navigate();
    const select = await registerPage.utils.waitForVisible(registerPage.genderSelect);
    const options = await select.findElements({ tagName: 'option' });
    expect(options.length).to.be.at.least(2);
  });

  it('RP_22: Gender dropdown should contain "Male" option', async function () {
    await registerPage.navigate();
    const select = await registerPage.utils.waitForVisible(registerPage.genderSelect);
    const options = await select.findElements({ tagName: 'option' });
    const texts = await Promise.all(options.map(o => o.getText()));
    expect(texts).to.include('Male');
  });

  it('RP_23: Gender dropdown should contain "Female" option', async function () {
    await registerPage.navigate();
    const select = await registerPage.utils.waitForVisible(registerPage.genderSelect);
    const options = await select.findElements({ tagName: 'option' });
    const texts = await Promise.all(options.map(o => o.getText()));
    expect(texts).to.include('Female');
  });

  // --- Validation ---
  it('RP_24: Submitting empty form should show error message', async function () {
    await registerPage.navigate();
    await registerPage.utils.click(registerPage.submitBtn);
    const shown = await registerPage.isErrorMessageDisplayed();
    expect(shown).to.be.true;
  });

  it('RP_25: Register page should have a form element', async function () {
    await registerPage.navigate();
    const forms = await registerPage.utils.findElements(By.css('form'));
    expect(forms.length).to.be.greaterThan(0);
  });

  it('RP_26: Sign In link should point to /login', async function () {
    await registerPage.navigate();
    const elem = await registerPage.utils.waitForElement(registerPage.signInLink);
    const href = await elem.getAttribute('href');
    expect(href).to.include('login');
  });

  it('RP_27: Clicking Sign In should navigate to /login', async function () {
    await registerPage.navigate();
    await registerPage.utils.click(registerPage.signInLink);
    await this.driver.sleep(800);
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RP_28: Page should have at least 3 input fields', async function () {
    await registerPage.navigate();
    const inputs = await registerPage.utils.findElements(By.css('input'));
    expect(inputs.length).to.be.at.least(3);
  });

  it('RP_29: Refreshing register page should keep URL at /register', async function () {
    await registerPage.navigate();
    await registerPage.refreshPage();
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('register');
  });

  it('RP_30: Submit button should be enabled on page load', async function () {
    await registerPage.navigate();
    const btn = await registerPage.utils.waitForVisible(registerPage.submitBtn);
    const enabled = await btn.isEnabled();
    expect(enabled).to.be.true;
  });
});
