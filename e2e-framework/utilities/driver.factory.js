const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/config');
const logger = require('./logger');

class DriverFactory {
  /**
   * Builds and returns a Selenium WebDriver instance based on target browser and mode.
   * @param {string} [browserName] - Optional override for browser ('chrome'|'firefox'|'edge')
   * @param {boolean} [isHeadless] - Optional override for headless mode
   * @returns {Promise<WebDriver>}
   */
  static async createDriver(browserName = config.browser, isHeadless = config.headless) {
    const targetBrowser = (browserName || 'chrome').toLowerCase();
    logger.info(`Initializing WebDriver for browser: [${targetBrowser}] | Headless: [${isHeadless}]`);

    let driverBuilder = new Builder().forBrowser(targetBrowser);

    switch (targetBrowser) {
      case 'chrome': {
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments(`--window-size=${config.viewport.width},${config.viewport.height}`);
        options.addArguments('--disable-notifications');
        options.addArguments('--remote-allow-origins=*');
        
        if (isHeadless) {
          options.addArguments('--headless=new');
        }
        driverBuilder.setChromeOptions(options);
        break;
      }

      case 'firefox': {
        const options = new firefox.Options();
        options.windowSize({ width: config.viewport.width, height: config.viewport.height });
        if (isHeadless) {
          options.addArguments('-headless');
        }
        driverBuilder.setFirefoxOptions(options);
        break;
      }

      case 'edge': {
        const options = new edge.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments(`--window-size=${config.viewport.width},${config.viewport.height}`);
        if (isHeadless) {
          options.addArguments('--headless=new');
        }
        driverBuilder.setEdgeOptions(options);
        break;
      }

      default:
        throw new Error(`Unsupported browser: ${targetBrowser}. Supported options: chrome, firefox, edge.`);
    }

    const driver = await driverBuilder.build();
    await driver.manage().setTimeouts({
      implicit: config.implicitWait,
      pageLoad: config.pageLoadTimeout,
      script: 30000
    });

    if (!isHeadless) {
      await driver.manage().window().maximize();
    }

    return driver;
  }
}

module.exports = DriverFactory;
