const config = require('../config/config');
const SeleniumUtils = require('../utilities/selenium.utils');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.utils = new SeleniumUtils(driver);
  }

  async open(path = '') {
    const fullUrl = `${config.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    logger.info(`Navigating to URL: ${fullUrl}`);
    await this.driver.get(fullUrl);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async refreshPage() {
    logger.info('Refreshing current page');
    await this.driver.navigate().refresh();
  }

  async goBack() {
    logger.info('Navigating back in browser history');
    await this.driver.navigate().back();
  }

  async goForward() {
    logger.info('Navigating forward in browser history');
    await this.driver.navigate().forward();
  }

  async getConsoleLogs() {
    try {
      const logs = await this.driver.manage().logs().get('browser');
      return logs;
    } catch (e) {
      return [];
    }
  }
}

module.exports = BasePage;
