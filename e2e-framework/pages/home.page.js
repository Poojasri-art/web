const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class HomePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.welcomeBanner = By.xpath("//h1[contains(text(), 'Welcome back') or contains(text(), 'CogniSync') or contains(text(), 'Dashboard')]");
    this.startSessionBtn = By.xpath("//button[contains(text(), 'Start') or contains(text(), 'Session') or contains(text(), 'Begin')]");
    this.moduleCards = By.css('.card, [class*="card"]');
    this.profileAvatar = By.xpath("//div[contains(@style, 'userAvatar') or contains(text(), 'User')]");
  }

  async navigate() {
    await this.open('/home');
  }

  async isDashboardLoaded() {
    return await this.utils.isElementDisplayed(this.welcomeBanner);
  }

  async clickStartSession() {
    if (await this.utils.isElementPresent(this.startSessionBtn)) {
      await this.utils.click(this.startSessionBtn);
    }
  }
}

module.exports = HomePage;
