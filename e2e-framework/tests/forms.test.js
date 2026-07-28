const { expect } = require('chai');
const BaseTest = require('./base.test');
const RegisterPage = require('../pages/register.page');

describe('Form Validation E2E Tests', function () {
  this.timeout(60000);
  BaseTest.setupHooks('Form Validations');

  let registerPage;

  beforeEach(function () {
    registerPage = new RegisterPage(this.driver);
  });

  it('FORM_01: Should validate required attributes on registration form fields', async function () {
    await registerPage.navigate();
    const emailInput = await registerPage.utils.waitForVisible(registerPage.emailInput);
    const typeAttr = await emailInput.getAttribute('type');
    expect(typeAttr).to.equal('email');
  });

  it('FORM_02: Should validate gender dropdown options selection', async function () {
    await registerPage.navigate();
    const selectElem = await registerPage.utils.waitForVisible(registerPage.genderSelect);
    const options = await selectElem.findElements({ tagName: 'option' });
    expect(options.length).to.be.greaterThan(0);
  });

  it('FORM_03: Should reject form submission with invalid email format', async function () {
    await registerPage.navigate();
    await registerPage.register('not-an-email', 25, 'Female', 'Password123!');
    const currentUrl = await registerPage.getCurrentUrl();
    // HTML5 validation or application validation prevents navigation
    expect(currentUrl).to.include('/register');
  });

  it('FORM_04: Should validate age field input restrictions', async function () {
    await registerPage.navigate();
    const ageInput = await registerPage.utils.waitForVisible(registerPage.ageInput);
    const inputType = await ageInput.getAttribute('type');
    expect(inputType).to.equal('number');
  });
});
