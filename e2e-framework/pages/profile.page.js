const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.profileTitle = By.xpath("//h1[contains(text(), 'Profile') or contains(text(), 'Settings')]");
    this.updateInfoBtn = By.xpath("//button[contains(text(), 'Update Info') or contains(text(), 'Edit Profile')]");
    this.resetAccountBtn = By.xpath("//button[contains(text(), 'Reset') or contains(text(), 'Clear Data')]");
    this.privacyBtn = By.xpath("//button[contains(text(), 'Privacy') or contains(text(), 'Policy')]");
  }

  async navigate() {
    await this.open('/profile');
  }

  async isProfileLoaded() {
    return await this.utils.isElementDisplayed(this.profileTitle);
  }
}

module.exports = ProfilePage;
