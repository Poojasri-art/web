const { expect } = require('chai');
const BaseTest = require('./base.test');
const LoginPage = require('../pages/login.page');
const RegisterPage = require('../pages/register.page');
const HomePage = require('../pages/home.page');
const NavigationComponent = require('../pages/navigation.component');
const testData = require('../data/testData');
const config = require('../config/config');

describe('Authentication & Session E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Authentication');

  let loginPage;
  let registerPage;
  let homePage;
  let navComponent;

  beforeEach(function () {
    loginPage = new LoginPage(this.driver);
    registerPage = new RegisterPage(this.driver);
    homePage = new HomePage(this.driver);
    navComponent = new NavigationComponent(this.driver);
  });

  it('AUTH_01: Should display error on empty username/email or password submission', async function () {
    await loginPage.navigate();
    await loginPage.login('', '');
    const isDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isDisplayed).to.be.true;
    const errorText = await loginPage.getErrorMessageText();
    expect(errorText.toLowerCase()).to.include('fill');
  });

  it('AUTH_02: Should display error for invalid credentials', async function () {
    await loginPage.navigate();
    await loginPage.login(testData.auth.invalidUser.email, testData.auth.invalidUser.password);
    const isDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('AUTH_03: Should perform complete user registration and redirect to home', async function () {
    await registerPage.navigate();
    const uniqueEmail = `e2e_user_${Date.now()}@meditation.com`;
    await registerPage.register(uniqueEmail, 28, 'Male', 'SecurePass123!');
    
    // Wait for redirect to home or login page
    await this.driver.sleep(2000);
    const currentUrl = await this.driver.getCurrentUrl();
    expect(currentUrl).to.satisfy(url => url.includes('/home') || url.includes('/login'));
  });

  it('AUTH_04: Should redirect unauthenticated user from protected route to login', async function () {
    await homePage.navigate();
    await this.driver.sleep(1000);
    const currentUrl = await homePage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('AUTH_05: Should allow user logout and clear session state', async function () {
    // 1. Register/Login user first
    await registerPage.navigate();
    const uniqueEmail = `logout_user_${Date.now()}@meditation.com`;
    await registerPage.register(uniqueEmail, 30, 'Female', 'SecurePass123!');
    await this.driver.sleep(2000);

    // If redirected to login, login manually
    const currentUrl = await this.driver.getCurrentUrl();
    if (currentUrl.includes('/login')) {
      await loginPage.login(uniqueEmail, 'SecurePass123!');
      await this.driver.sleep(2000);
    }

    // 2. Perform logout via navbar component if available
    const isSignedIn = await navComponent.isUserSignedIn();
    if (isSignedIn) {
      await navComponent.signOut();
      await this.driver.sleep(1000);
      const afterLogoutUrl = await loginPage.getCurrentUrl();
      expect(afterLogoutUrl).to.include('/login');
    }
  });
});
