const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class NavigationComponent extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardBtn = By.xpath("//button[.//span[text()='Dashboard']]");
    this.progressBtn = By.xpath("//button[.//span[text()='Progress']]");
    this.settingsBtn = By.xpath("//button[.//span[text()='Settings']]");
    this.signOutBtn = By.xpath("//button[.//span[text()='Sign Out']]");
    this.userNameLabel = By.xpath("//div[contains(@style, 'userName') or contains(@class, 'user')]");
    this.brandLogo = By.xpath("//span[contains(text(), 'CogniSync')]");
  }

  async goToDashboard() {
    await this.utils.click(this.dashboardBtn);
  }

  async goToProgress() {
    await this.utils.click(this.progressBtn);
  }

  async goToSettings() {
    await this.utils.click(this.settingsBtn);
  }

  async signOut() {
    await this.utils.click(this.signOutBtn);
  }

  async isUserSignedIn() {
    return await this.utils.isElementDisplayed(this.signOutBtn);
  }
}

module.exports = NavigationComponent;
