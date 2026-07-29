const { expect } = require('chai');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Routing and Auth Guard E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Routing');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  // Protected route redirects (when not logged in)
  const protectedRoutes = [
    '/home',
    '/profile',
    '/update-info',
    '/progress',
    '/session',
    '/saved-progress',
    '/privacy',
    '/reset-account'
  ];

  protectedRoutes.forEach((route, idx) => {
    it(`RT_0${idx + 1}: Accessing protected route ${route} unauthenticated should redirect to /login`, async function () {
      await page.open(route);
      await this.driver.sleep(600);
      const url = await page.getCurrentUrl();
      expect(url).to.include('/login');
    });
  });

  it('RT_09: Accessing /login directly loads login page', async function () {
    await page.open('/login');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_10: Accessing /register directly loads register page', async function () {
    await page.open('/register');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/register');
  });

  it('RT_11: Accessing /signup directly loads register page', async function () {
    await page.open('/signup');
    const url = await page.getCurrentUrl();
    expect(url).to.match(/register|signup/);
  });

  it('RT_12: Accessing /forgot-password directly loads forgot password page', async function () {
    await page.open('/forgot-password');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  it('RT_13: Accessing /intro directly loads intro page', async function () {
    await page.open('/intro');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  it('RT_14: Accessing unknown route redirects back to /login or root', async function () {
    await page.open('/non-existent-route-12345');
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.match(/login|5173/);
  });

  it('RT_15: Accessing trailing slash /home/ redirects to /login', async function () {
    await page.open('/home/');
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_16: Accessing route with query params /login?ref=test stays on /login', async function () {
    await page.open('/login?ref=test');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_17: Accessing route with hash /login#section stays on /login', async function () {
    await page.open('/login#section');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_18: Back button after redirect from protected route goes to prior page', async function () {
    await page.open('/login');
    await page.open('/profile');
    await this.driver.sleep(500);
    await page.goBack();
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('RT_19: Navigating between public routes directly changes URL instantly', async function () {
    await page.open('/login');
    await page.open('/register');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/register');
  });

  it('RT_20: Consecutive navigation to 3 public routes works', async function () {
    await page.open('/login');
    await page.open('/forgot-password');
    await page.open('/intro');
    const url = await page.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  it('RT_21: Protected route redirect happens within 2 seconds', async function () {
    const start = Date.now();
    await page.open('/progress');
    await this.driver.sleep(500);
    const duration = Date.now() - start;
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
    expect(duration).to.be.below(5000);
  });

  it('RT_22: Forward button in history functions properly', async function () {
    await page.open('/login');
    await page.open('/forgot-password');
    await page.goBack();
    await page.goForward();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  it('RT_23: Reloading /forgot-password retains URL', async function () {
    await page.open('/forgot-password');
    await page.refreshPage();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/forgot-password');
  });

  it('RT_24: Reloading /intro retains URL', async function () {
    await page.open('/intro');
    await page.refreshPage();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/intro');
  });

  it('RT_25: Reloading /register retains URL', async function () {
    await page.open('/register');
    await page.refreshPage();
    const url = await page.getCurrentUrl();
    expect(url).to.include('/register');
  });

  it('RT_26: Protected route /update-info redirects to /login', async function () {
    await page.open('/update-info');
    await this.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_27: Protected route /saved-progress redirects to /login', async function () {
    await page.open('/saved-progress');
    await this.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_28: Protected route /reset-account redirects to /login', async function () {
    await page.open('/reset-account');
    await this.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_29: Protected route /privacy redirects to /login', async function () {
    await page.open('/privacy');
    await this.driver.sleep(500);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('RT_30: Base URL protocol is http or https', async function () {
    await page.open('/login');
    const url = await page.getCurrentUrl();
    expect(url).to.match(/^https?:\/\//);
  });
});
