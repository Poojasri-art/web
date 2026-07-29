const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class SeleniumUtils {
  constructor(driver) {
    this.driver = driver;
  }

  // --- Explicit Waits ---
  async waitForElement(locator, timeout = config.explicitWait) {
    logger.info(`Waiting for element presence: ${locator.toString()}`);
    return await this.driver.wait(until.elementLocated(locator), timeout, `Element ${locator} not located within ${timeout}ms`);
  }

  async waitForVisible(locator, timeout = config.explicitWait) {
    logger.info(`Waiting for element visibility: ${locator.toString()}`);
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout, `Element ${locator} not visible within ${timeout}ms`);
    return element;
  }

  async waitForClickable(locator, timeout = config.explicitWait) {
    logger.info(`Waiting for element clickable: ${locator.toString()}`);
    const element = await this.waitForVisible(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(element), timeout, `Element ${locator} not enabled within ${timeout}ms`);
    return element;
  }

  async waitForText(locator, expectedText, timeout = config.explicitWait) {
    logger.info(`Waiting for text "${expectedText}" in locator: ${locator.toString()}`);
    const element = await this.waitForVisible(locator, timeout);
    await this.driver.wait(until.elementTextContains(element, expectedText), timeout, `Element ${locator} did not contain text "${expectedText}"`);
    return element;
  }

  async waitForUrlContains(substring, timeout = config.explicitWait) {
    logger.info(`Waiting for URL to contain: "${substring}"`);
    return await this.driver.wait(until.urlContains(substring), timeout, `URL did not contain "${substring}" within ${timeout}ms`);
  }

  // --- Core Element Actions ---
  async click(locator, timeout = config.explicitWait) {
    logger.info(`Clicking element: ${locator.toString()}`);
    const element = await this.waitForClickable(locator, timeout);
    await element.click();
  }

  async type(locator, text, clearFirst = true, timeout = config.explicitWait) {
    logger.info(`Typing into ${locator.toString()}: "${text}"`);
    const element = await this.waitForVisible(locator, timeout);
    if (clearFirst) {
      await element.clear();
    }
    await element.sendKeys(text);
  }

  async getText(locator, timeout = config.explicitWait) {
    const element = await this.waitForVisible(locator, timeout);
    const text = await element.getText();
    logger.info(`Extracted text from ${locator.toString()}: "${text}"`);
    return text.trim();
  }

  async getAttribute(locator, attributeName, timeout = config.explicitWait) {
    const element = await this.waitForElement(locator, timeout);
    return await element.getAttribute(attributeName);
  }

  // --- Dynamic Elements & Check ---
  async isElementPresent(locator, timeout = config.explicitWait) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      return true;
    } catch (e) {
      return false;
    }
  }

  async isElementDisplayed(locator, timeout = config.explicitWait) {
    try {
      const element = await this.driver.wait(until.elementLocated(locator), timeout);
      return await element.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async findElements(locator) {
    return await this.driver.findElements(locator);
  }

  // --- JavaScript Execution ---
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  async clickViaJS(locator) {
    logger.info(`Clicking via JS: ${locator.toString()}`);
    const element = await this.waitForElement(locator);
    await this.driver.executeScript('arguments[0].click();', element);
  }

  async scrollIntoView(locator) {
    logger.info(`Scrolling into view: ${locator.toString()}`);
    const element = await this.waitForElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
  }

  async scrollToBottom() {
    logger.info('Scrolling to bottom of page');
    await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
  }

  // --- Window / Tab Handling ---
  async getWindowHandles() {
    return await this.driver.getAllWindowHandles();
  }

  async switchToWindow(handle) {
    logger.info(`Switching to window handle: ${handle}`);
    await this.driver.switchTo().window(handle);
  }

  async openNewTab(url = 'about:blank') {
    logger.info(`Opening new tab: ${url}`);
    await this.driver.switchTo().newWindow('tab');
    if (url !== 'about:blank') {
      await this.driver.get(url);
    }
  }

  async closeCurrentWindow() {
    logger.info('Closing current window/tab');
    await this.driver.close();
  }

  // --- Alert Handling ---
  async acceptAlert(timeout = 5000) {
    logger.info('Waiting for alert and accepting');
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    const text = await alert.getText();
    await alert.accept();
    logger.info(`Alert accepted with message: "${text}"`);
    return text;
  }

  async dismissAlert(timeout = 5000) {
    logger.info('Waiting for alert and dismissing');
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    const text = await alert.getText();
    await alert.dismiss();
    return text;
  }

  // --- Screenshot & Failure Handling ---
  async takeScreenshot(testName) {
    try {
      const screenshotDir = path.resolve(config.paths.screenshots);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${timestamp}.png`;
      const filePath = path.join(screenshotDir, filename);

      const imageBuffer = await this.driver.takeScreenshot();
      fs.writeFileSync(filePath, imageBuffer, 'base64');
      logger.info(`Screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture screenshot: ${error.message}`);
      return null;
    }
  }

  async captureFailureArtifacts(testName, error) {
    try {
      const failureDir = path.resolve(config.paths.failures);
      if (!fs.existsSync(failureDir)) {
        fs.mkdirSync(failureDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');

      // 1. Screenshot
      const screenshotPath = path.join(failureDir, `${safeTestName}_${timestamp}_failure.png`);
      const imageBuffer = await this.driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, imageBuffer, 'base64');

      // 2. Current URL
      const currentUrl = await this.driver.getCurrentUrl().catch(() => 'Unknown URL');

      // 3. Browser Console Logs
      let consoleLogs = [];
      try {
        const logs = await this.driver.manage().logs().get('browser');
        consoleLogs = logs.map(l => `[${l.level.name}] ${l.message}`);
      } catch (e) {
        consoleLogs = ['Console log extraction not supported or unavailable'];
      }

      // 4. Save metadata JSON
      const failureDetails = {
        testName,
        timestamp,
        url: currentUrl,
        errorMessage: error.message,
        stackTrace: error.stack,
        consoleLogs,
        screenshotPath
      };

      const metaPath = path.join(failureDir, `${safeTestName}_${timestamp}_details.json`);
      fs.writeFileSync(metaPath, JSON.stringify(failureDetails, null, 2));

      logger.error(`Failure artifacts saved for [${testName}] at ${failureDir}`);
      return failureDetails;
    } catch (err) {
      logger.error(`Error saving failure artifacts: ${err.message}`);
      return null;
    }
  }

  // --- Retry Helper ---
  static async retryOperation(operationFn, maxRetries = config.retryAttempts, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operationFn();
      } catch (err) {
        lastError = err;
        logger.warn(`Operation failed (Attempt ${attempt}/${maxRetries}): ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
    }
    throw lastError;
  }
}

module.exports = SeleniumUtils;
