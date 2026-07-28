const { expect } = require('chai');
const BaseTest = require('./base.test');
const LoginPage = require('../pages/login.page');
const RegisterPage = require('../pages/register.page');

describe('Navigation & Browser History E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Navigation');

  it('NAV_01: Should navigate to public intro page and splash route', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.open('/intro');
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  it('NAV_02: Should preserve history when using browser Back and Forward buttons', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();
    expect(await loginPage.getCurrentUrl()).to.include('/login');

    const registerPage = new RegisterPage(this.driver);
    await registerPage.navigate();
    expect(await registerPage.getCurrentUrl()).to.include('/register');

    // Go Back
    await registerPage.goBack();
    await this.driver.sleep(500);
    expect(await loginPage.getCurrentUrl()).to.include('/login');

    // Go Forward
    await loginPage.goForward();
    await this.driver.sleep(500);
    expect(await registerPage.getCurrentUrl()).to.include('/register');
  });

  it('NAV_03: Should remain on current page after page refresh', async function () {
    const loginPage = new LoginPage(this.driver);
    await loginPage.navigate();
    await loginPage.refreshPage();
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });
});
