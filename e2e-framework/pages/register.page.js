const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[name="email"]');
    this.ageInput = By.css('input[name="age"]');
    this.genderSelect = By.css('select[name="gender"]');
    this.passwordInput = By.css('input[name="password"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorMessage = By.xpath("//div[contains(@style, 'rgba(255, 59, 48') or contains(text(), 'Please fill') or contains(text(), 'failed')]");
    this.signInLink = By.xpath("//a[contains(text(), 'Sign In')]");
  }

  async navigate() {
    await this.open('/register');
  }

  async register(email, age, gender, password) {
    if (email !== null && email !== undefined) {
      await this.utils.type(this.emailInput, email);
    }
    if (age !== null && age !== undefined) {
      await this.utils.type(this.ageInput, age.toString());
    }
    if (gender !== null && gender !== undefined) {
      const selectElem = await this.utils.waitForVisible(this.genderSelect);
      await selectElem.sendKeys(gender);
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
}

module.exports = RegisterPage;
