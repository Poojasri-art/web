const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[name="password"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorMessage = By.xpath("//div[contains(@style, 'rgba(255, 59, 48') or contains(text(), 'Please fill') or contains(text(), 'error')]");
    this.createAccountLink = By.xpath("//a[contains(text(), 'Create an account')]");
    this.forgotPasswordLink = By.xpath("//a[contains(text(), 'Forgot?')]");
    this.togglePasswordBtn = By.css('button[type="button"]');
  }

  async navigate() {
    await this.open('/login');
  }

  async login(email, password) {
    if (email !== null && email !== undefined) {
      await this.utils.type(this.emailInput, email);
    }
    if (password !== null && password !== undefined) {
      await this.utils.type(this.passwordInput, password);
    }
    await this.utils.click(this.submitBtn);
  }

  async getErrorMessageText() {
    return await this.utils.getText(this.errorMessage);
  }

  async isErrorMessageDisplayed() {
    return await this.utils.isElementDisplayed(this.errorMessage);
  }

  async clickCreateAccount() {
    await this.utils.click(this.createAccountLink);
  }

  async clickForgotPassword() {
    await this.utils.click(this.forgotPasswordLink);
  }
}

module.exports = LoginPage;
