const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class IntroPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.title = By.css('h2');
    this.description = By.css('p');
    this.nextBtn = By.css('button');
    this.dots = By.xpath("//div[contains(@style, 'height: 8px') or contains(@style, 'height:8px')]");
    this.emojiDisplay = By.xpath("//span[@style[contains(.,'font-size')]]");
    this.imagePlaceholder = By.xpath("//div[contains(@style, '240px')]");
  }

  async navigate() {
    await this.open('/intro');
  }

  async getTitleText() {
    return await this.utils.getText(this.title);
  }

  async getDescriptionText() {
    return await this.utils.getText(this.description);
  }

  async clickNext() {
    await this.utils.click(this.nextBtn);
  }

  async getNextButtonText() {
    const btn = await this.utils.waitForVisible(this.nextBtn);
    return await btn.getText();
  }

  async isNextBtnDisplayed() {
    return await this.utils.isElementDisplayed(this.nextBtn);
  }
}

module.exports = IntroPage;
