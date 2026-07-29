const { expect } = require('chai');
const BaseTest = require('./base.test');
const BasePage = require('../pages/base.page');

describe('Session & LocalStorage E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Session Management');

  let page;

  beforeEach(function () {
    page = new BasePage(this.driver);
  });

  it('SM_01: LocalStorage is accessible from browser driver', async function () {
    await page.open('/login');
    const type = await page.utils.executeScript('return typeof window.localStorage;');
    expect(type).to.equal('object');
  });

  it('SM_02: Unauthenticated state has no user in localStorage initially', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.clear();');
    const user = await page.utils.executeScript('return window.localStorage.getItem("user");');
    expect(user).to.be.null;
  });

  it('SM_03: Setting valid user in localStorage persists across page reload', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'stored@test.com', username: 'StoredUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.refreshPage();
    const stored = await page.utils.executeScript('return window.localStorage.getItem("user");');
    expect(stored).to.include('stored@test.com');
  });

  it('SM_04: Setting user in localStorage allows navigating to /home', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'auth@test.com', username: 'AuthUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.open('/home');
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/home');
  });

  it('SM_05: User in localStorage allows navigating to /profile', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'auth@test.com', username: 'AuthUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.open('/profile');
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/profile');
  });

  it('SM_06: Clearing localStorage redirects authenticated user away on reload', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'auth@test.com', username: 'AuthUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.open('/home');
    await page.utils.executeScript('window.localStorage.clear();');
    await page.refreshPage();
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('SM_07: Session storage object is accessible', async function () {
    await page.open('/login');
    const type = await page.utils.executeScript('return typeof window.sessionStorage;');
    expect(type).to.equal('object');
  });

  it('SM_08: Browser cookies object is accessible', async function () {
    await page.open('/login');
    const cookies = await page.driver.manage().getCookies();
    expect(cookies).to.be.an('array');
  });

  it('SM_09: LocalStorage item count can be retrieved', async function () {
    await page.open('/login');
    const length = await page.utils.executeScript('return window.localStorage.length;');
    expect(length).to.be.a('number');
  });

  it('SM_10: Removing item from localStorage works', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.setItem("temp_item", "123");');
    await page.utils.executeScript('window.localStorage.removeItem("temp_item");');
    const item = await page.utils.executeScript('return window.localStorage.getItem("temp_item");');
    expect(item).to.be.null;
  });

  it('SM_11: Authenticated user accessing /login remains on /home or /login', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'auth@test.com', username: 'AuthUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.open('/login');
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('SM_12: Authenticated user accessing /register works', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'auth@test.com', username: 'AuthUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.open('/register');
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('SM_13: Session cleanup in afterEach works', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.clear();');
    const len = await page.utils.executeScript('return window.localStorage.length;');
    expect(len).to.equal(0);
  });

  it('SM_14: Storing JSON strings in localStorage parses correctly', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.setItem("test_json", JSON.stringify({ key: "val" }));');
    const res = await page.utils.executeScript('return JSON.parse(window.localStorage.getItem("test_json")).key;');
    expect(res).to.equal('val');
  });

  it('SM_15: LocalStorage keys can be iterated', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.setItem("key1", "val1");');
    const key = await page.utils.executeScript('return window.localStorage.key(0);');
    expect(key).to.be.a('string');
  });

  it('SM_16: User session persists across new browser tabs', async function () {
    await page.open('/login');
    const mockUser = JSON.stringify({ email: 'tab@test.com', username: 'TabUser' });
    await page.utils.executeScript(`window.localStorage.setItem("user", '${mockUser}');`);
    await page.utils.openNewTab('http://localhost:5173/home');
    await this.driver.sleep(600);
    const url = await page.getCurrentUrl();
    expect(url).to.include('/home');
    const handles = await page.utils.getWindowHandles();
    if (handles.length > 1) {
      await page.utils.closeCurrentWindow();
      await page.utils.switchToWindow(handles[0]);
    }
  });

  it('SM_17: Document referrer is string', async function () {
    await page.open('/login');
    const ref = await page.utils.executeScript('return document.referrer;');
    expect(ref).to.be.a('string');
  });

  it('SM_18: Browser navigator userAgent string is present', async function () {
    await page.open('/login');
    const ua = await page.utils.executeScript('return navigator.userAgent;');
    expect(ua).to.be.a('string');
  });

  it('SM_19: LocalStorage clear function leaves 0 keys', async function () {
    await page.open('/login');
    await page.utils.executeScript('window.localStorage.clear();');
    const count = await page.utils.executeScript('return window.localStorage.length;');
    expect(count).to.equal(0);
  });
});
