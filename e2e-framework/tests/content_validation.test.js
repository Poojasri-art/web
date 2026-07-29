const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Content Validation & Copy E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Content Validation');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  // --- Brand Name Validation ---
  it('CV_01: Login page renders welcome heading "Welcome Back"', async function () {
    await page.open('/login');
    const text = await page.utils.getText(By.xpath("//h2[contains(text(), 'Welcome Back')]"));
    expect(text).to.include('Welcome Back');
  });

  it('CV_02: Register page renders brand name "CogniSync"', async function () {
    await page.open('/register');
    const text = await page.utils.getText(By.css('h1'));
    expect(text).to.include('CogniSync');
  });

  // --- Login Subtitle & Copy ---
  it('CV_03: Login page subtitle contains "journey" or "Sign in"', async function () {
    await page.open('/login');
    const subtitle = await page.utils.getText(By.xpath("//p[contains(text(), 'Sign in') or contains(text(), 'journey')]"));
    expect(subtitle.toLowerCase()).to.match(/sign in|journey/);
  });

  it('CV_04: Login email label contains "Email Address"', async function () {
    await page.open('/login');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Email')]"));
    expect(label.toLowerCase()).to.include('email');
  });

  it('CV_05: Login password label contains "Password"', async function () {
    await page.open('/login');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Password')]"));
    expect(label.toLowerCase()).to.include('password');
  });

  it('CV_06: Login submit button text contains "Sign In"', async function () {
    await page.open('/login');
    const btnText = await page.utils.getText(By.css('button[type="submit"]'));
    expect(btnText).to.include('Sign In');
  });

  it('CV_07: Login create account prompt text contains "Don\'t have an account?"', async function () {
    await page.open('/login');
    await page.utils.waitForVisible(By.xpath("//a[contains(text(),'Create an account') or contains(text(),'account')]"));
    const linkText = await page.utils.getText(By.xpath("//a[contains(text(),'Create an account') or contains(text(),'account')]"));
    expect(linkText.toLowerCase()).to.include('account');
  });

  // --- Register Page Copy ---
  it('CV_08: Register page subtitle contains "cognitive"', async function () {
    await page.open('/register');
    const subtitle = await page.utils.getText(By.css('p'));
    expect(subtitle.toLowerCase()).to.include('cognitive');
  });

  it('CV_09: Register page email label contains "Email"', async function () {
    await page.open('/register');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Email')]"));
    expect(label).to.include('Email');
  });

  it('CV_10: Register page age label contains "Age"', async function () {
    await page.open('/register');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Age')]"));
    expect(label).to.include('Age');
  });

  it('CV_11: Register page gender label contains "Gender"', async function () {
    await page.open('/register');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Gender')]"));
    expect(label).to.include('Gender');
  });

  it('CV_12: Register page password label contains "Password"', async function () {
    await page.open('/register');
    const label = await page.utils.getText(By.xpath("//label[contains(text(), 'Password')]"));
    expect(label).to.include('Password');
  });

  it('CV_13: Register submit button text contains "Sign Up"', async function () {
    await page.open('/register');
    const btnText = await page.utils.getText(By.css('button[type="submit"]'));
    expect(btnText).to.include('Sign Up');
  });

  // --- Forgot Password Copy ---
  it('CV_14: Forgot Password title text is "Forgot Password"', async function () {
    await page.open('/forgot-password');
    const text = await page.utils.getText(By.css('h1'));
    expect(text).to.equal('Forgot Password');
  });

  it('CV_15: Forgot Password subtitle mentions "instructions"', async function () {
    await page.open('/forgot-password');
    const text = await page.utils.getText(By.css('p'));
    expect(text.toLowerCase()).to.include('instructions');
  });

  it('CV_16: Forgot Password button text is "Send Reset Link"', async function () {
    await page.open('/forgot-password');
    const text = await page.utils.getText(By.css('button[type="submit"]'));
    expect(text).to.equal('Send Reset Link');
  });

  // --- Intro Copy ---
  it('CV_17: Intro slide 1 heading is "Welcome to CogniSync"', async function () {
    await page.open('/intro');
    const text = await page.utils.getText(By.css('h2'));
    expect(text).to.equal('Welcome to CogniSync');
  });

  it('CV_18: Intro slide 1 description contains "journey"', async function () {
    await page.open('/intro');
    const text = await page.utils.getText(By.css('p'));
    expect(text).to.include('journey');
  });

  // --- Error Text Content ---
  it('CV_19: Login validation error contains "fill"', async function () {
    await page.open('/login');
    await page.utils.click(By.css('button[type="submit"]'));
    const errText = await page.utils.getText(By.xpath("//div[contains(text(), 'fill') or contains(text(), 'Please')]"));
    expect(errText.toLowerCase()).to.include('fill');
  });

  it('CV_20: Register validation error contains "fill"', async function () {
    await page.open('/register');
    await page.utils.click(By.css('button[type="submit"]'));
    const errText = await page.utils.getText(By.xpath("//div[contains(text(), 'fill') or contains(text(), 'Please')]"));
    expect(errText.toLowerCase()).to.include('fill');
  });

  // --- Miscellaneous Content Checks ---
  it('CV_21: Page footer or body does not contain undefined text', async function () {
    await page.open('/login');
    const text = await page.utils.getText(By.css('body'));
    expect(text).to.not.include('undefined');
  });

  it('CV_22: Page footer or body does not contain [object Object]', async function () {
    await page.open('/login');
    const text = await page.utils.getText(By.css('body'));
    expect(text).to.not.include('[object Object]');
  });

  it('CV_23: Register page body does not contain undefined text', async function () {
    await page.open('/register');
    const text = await page.utils.getText(By.css('body'));
    expect(text).to.not.include('undefined');
  });

  it('CV_24: Forgot Password body does not contain undefined text', async function () {
    await page.open('/forgot-password');
    const text = await page.utils.getText(By.css('body'));
    expect(text).to.not.include('undefined');
  });

  it('CV_25: Intro body does not contain undefined text', async function () {
    await page.open('/intro');
    const text = await page.utils.getText(By.css('body'));
    expect(text).to.not.include('undefined');
  });
});
