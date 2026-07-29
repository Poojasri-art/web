const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class SplashPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.container = By.css('div');
    this.title = By.xpath("//*[contains(text(), 'CogniSync')]");
  }

  async navigate() {
    await this.open('/');
  }

  async isLoaded() {
    return await this.utils.isElementPresent({ css: 'body' });
  }

  async waitForRedirect(timeout = 5000) {
    await this.driver.sleep(timeout);
    return await this.getCurrentUrl();
  }
}

module.exports = SplashPage;
