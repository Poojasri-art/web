const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const IntroPage = require('../pages/intro.page');

describe('Intro Page Onboarding E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Intro Page');

  let page;

  beforeEach(function () {
    page = new IntroPage(this.driver);
  });

  // --- Slide 1 ---
  it('IP_01: Should navigate to /intro route', async function () {
    await page.navigate();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  it('IP_02: First slide title should be "Welcome to CogniSync"', async function () {
    await page.navigate();
    const text = await page.getTitleText();
    expect(text).to.equal('Welcome to CogniSync');
  });

  it('IP_03: First slide description should contain "cognitive enhancement"', async function () {
    await page.navigate();
    const desc = await page.getDescriptionText();
    expect(desc).to.include('cognitive enhancement');
  });

  it('IP_04: First slide button text should be "Next"', async function () {
    await page.navigate();
    const btnText = await page.getNextButtonText();
    expect(btnText).to.equal('Next');
  });

  it('IP_05: Should render 3 pagination dots', async function () {
    await page.navigate();
    const dots = await page.utils.findElements(page.dots);
    expect(dots.length).to.equal(3);
  });

  it('IP_06: Should display image placeholder area', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.imagePlaceholder);
    expect(isPresent).to.be.true;
  });

  // --- Slide 2 ---
  it('IP_07: Clicking Next switches to second slide', async function () {
    await page.navigate();
    await page.clickNext();
    const title = await page.getTitleText();
    expect(title).to.equal('Daily Exercises');
  });

  it('IP_08: Second slide description mentions "exercises"', async function () {
    await page.navigate();
    await page.clickNext();
    const desc = await page.getDescriptionText();
    expect(desc).to.include('exercises');
  });

  it('IP_09: Second slide button text remains "Next"', async function () {
    await page.navigate();
    await page.clickNext();
    const btnText = await page.getNextButtonText();
    expect(btnText).to.equal('Next');
  });

  it('IP_10: Second slide maintains /intro URL route', async function () {
    await page.navigate();
    await page.clickNext();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  // --- Slide 3 ---
  it('IP_11: Clicking Next twice switches to third slide', async function () {
    await page.navigate();
    await page.clickNext();
    await page.clickNext();
    const title = await page.getTitleText();
    expect(title).to.equal('Track Your Growth');
  });

  it('IP_12: Third slide description mentions "analytics"', async function () {
    await page.navigate();
    await page.clickNext();
    await page.clickNext();
    const desc = await page.getDescriptionText();
    expect(desc).to.include('analytics');
  });

  it('IP_13: Third slide button text changes to "Get Started"', async function () {
    await page.navigate();
    await page.clickNext();
    await page.clickNext();
    const btnText = await page.getNextButtonText();
    expect(btnText).to.equal('Get Started');
  });

  // --- Onboarding Completion & Navigation ---
  it('IP_14: Clicking "Get Started" on slide 3 redirects to /login', async function () {
    await page.navigate();
    await page.clickNext();
    await page.clickNext();
    await page.clickNext();
    await this.driver.sleep(800);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  // --- Additional Visual & Layout Verification ---
  it('IP_15: Next button is visible on slide 1', async function () {
    await page.navigate();
    await page.utils.waitForVisible(page.nextBtn);
    const isDisplayed = await page.isNextBtnDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('IP_16: Title element is visible on slide 1', async function () {
    await page.navigate();
    await page.utils.waitForVisible(page.title);
    const isDisplayed = await page.utils.isElementDisplayed(page.title);
    expect(isDisplayed).to.be.true;
  });

  it('IP_17: Description element is visible on slide 1', async function () {
    await page.navigate();
    const isDisplayed = await page.utils.isElementDisplayed(page.description);
    expect(isDisplayed).to.be.true;
  });

  it('IP_18: Emoji span element is present inside placeholder', async function () {
    await page.navigate();
    const isPresent = await page.utils.isElementPresent(page.emojiDisplay);
    expect(isPresent).to.be.true;
  });

  it('IP_19: Page should render without console crashes', async function () {
    await page.navigate();
    const logs = await page.getConsoleLogs();
    const severeLogs = logs.filter(l => l.level.name === 'SEVERE');
    expect(severeLogs.length).to.equal(0);
  });

  it('IP_20: Refreshing page resets carousel to slide 1', async function () {
    await page.navigate();
    await page.clickNext();
    await page.refreshPage();
    const title = await page.getTitleText();
    expect(title).to.equal('Welcome to CogniSync');
  });

  it('IP_21: Active dot style indicates current slide', async function () {
    await page.navigate();
    const dots = await page.utils.findElements(page.dots);
    const width = await dots[0].getAttribute('style');
    expect(width).to.include('24px');
  });

  it('IP_22: Inactive dots have smaller width style', async function () {
    await page.navigate();
    const dots = await page.utils.findElements(page.dots);
    const width = await dots[1].getAttribute('style');
    expect(width).to.include('8px');
  });

  it('IP_23: Second dot becomes active on slide 2', async function () {
    await page.navigate();
    await page.clickNext();
    const dots = await page.utils.findElements(page.dots);
    const width = await dots[1].getAttribute('style');
    expect(width).to.include('24px');
  });

  it('IP_24: Third dot becomes active on slide 3', async function () {
    await page.navigate();
    await page.clickNext();
    await page.clickNext();
    const dots = await page.utils.findElements(page.dots);
    const width = await dots[2].getAttribute('style');
    expect(width).to.include('24px');
  });

  it('IP_25: Page title document tag is valid string', async function () {
    await page.navigate();
    const title = await page.getTitle();
    expect(title).to.be.a('string');
  });
});
