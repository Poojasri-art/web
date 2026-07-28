const { expect } = require('chai');
const BaseTest = require('./base.test');
const LoginPage = require('../pages/login.page');
const RegisterPage = require('../pages/register.page');

describe('UI Elements & Visual Behavior E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('UI Components');

  it('UI_01: Should render login page brand graphics, title and submit button', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();
    const title = await loginPage.getTitle();
    expect(title).to.be.a('string');

    const submitBtn = await loginPage.utils.waitForVisible(loginPage.submitBtn);
    expect(await submitBtn.isDisplayed()).to.be.true;
  });

  it('UI_02: Should display placeholder text in login inputs', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();

    const emailPlaceholder = await loginPage.utils.getAttribute(loginPage.emailInput, 'placeholder');
    const passwordPlaceholder = await loginPage.utils.getAttribute(loginPage.passwordInput, 'placeholder');

    expect(emailPlaceholder).to.include('@');
    expect(passwordPlaceholder).to.not.be.empty;
  });

  it('UI_03: Should toggle password visibility on eye button click', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();

    const initialType = await loginPage.utils.getAttribute(loginPage.passwordInput, 'type');
    expect(initialType).to.equal('password');

    await loginPage.utils.click(loginPage.togglePasswordBtn);
    const toggledType = await loginPage.utils.getAttribute(loginPage.passwordInput, 'type');
    expect(toggledType).to.equal('text');
  });

  it('UI_04: Should navigate seamlessly between Login and Registration pages', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();
    await loginPage.clickCreateAccount();

    const registerPage = new RegisterPage(this.driver);
    await this.driver.sleep(1000);
    const url = await registerPage.getCurrentUrl();
    expect(url).to.include('/register');
  });
});
