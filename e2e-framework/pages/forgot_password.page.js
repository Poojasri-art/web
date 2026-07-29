const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class ForgotPasswordPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.title = By.css('h1');
    this.subtitle = By.xpath("//p[contains(text(), 'email')]");
    this.emailInput = By.css('input[type="email"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.backBtn = By.css('button:not([type="submit"])');
    this.successBanner = By.xpath("//div[contains(text(), 'instructions') or contains(text(), 'sent')]");
  }

  async navigate() {
    await this.open('/forgot-password');
  }

  async enterEmail(email) {
    await this.utils.type(this.emailInput, email);
  }

  async submit() {
    await this.utils.click(this.submitBtn);
  }

  async isSuccessBannerVisible() {
    return await this.utils.isElementDisplayed(this.successBanner);
  }

  async getTitleText() {
    return await this.utils.getText(this.title);
  }

  async clickBack() {
    await this.utils.click(this.backBtn);
  }
}

module.exports = ForgotPasswordPage;
