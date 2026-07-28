const { By } = require('selenium-webdriver');
const logger = require('./logger');
const SeleniumUtils = require('./selenium.utils');

class RouteAndFormDiscoverer {
  constructor(driver) {
    this.driver = driver;
    this.utils = new SeleniumUtils(driver);
  }

  /**
   * Automatically introspects the current page DOM to discover forms, inputs, buttons, and validation attributes.
   * @returns {Promise<Array<Object>>} List of discovered form metadata schemas
   */
  async discoverFormsOnPage() {
    logger.info('Starting dynamic form discovery on current page...');
    
    // Execute browser script to discover all forms, input elements, validation rules
    const discoveredForms = await this.driver.executeScript(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      
      // If page has standalone input elements outside <form> tags, wrap in virtual form container
      const standaloneInputs = Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(input => !input.closest('form'));

      const formContainers = forms.length > 0 ? forms : (standaloneInputs.length > 0 ? [document.body] : []);

      return formContainers.map((container, idx) => {
        const inputElements = Array.from(container.querySelectorAll('input, select, textarea'));
        const fields = inputElements.map(el => {
          return {
            id: el.id || '',
            name: el.name || '',
            type: el.type || el.tagName.toLowerCase(),
            placeholder: el.placeholder || '',
            required: el.hasAttribute('required') || el.required || false,
            minLength: el.getAttribute('minlength') || el.minLength || null,
            maxLength: el.getAttribute('maxlength') || el.maxLength || null,
            pattern: el.getAttribute('pattern') || null,
            value: el.value || '',
            label: el.labels && el.labels.length > 0 ? el.labels[0].innerText : ''
          };
        });

        const buttons = Array.from(container.querySelectorAll('button, input[type="submit"]')).map(btn => ({
          text: btn.innerText || btn.value || '',
          type: btn.type || 'button',
          disabled: btn.disabled
        }));

        return {
          formIndex: idx + 1,
          fields,
          buttons
        };
      });
    });

    logger.info(`Discovered ${discoveredForms.length} form schemas with ${discoveredForms.reduce((acc, f) => acc + f.fields.length, 0)} total fields.`);
    return discoveredForms;
  }

  /**
   * Generates dynamic assertion test matrix for a discovered form schema.
   * @param {Object} formSchema
   * @returns {Array<Object>} Test scenarios to execute dynamically
   */
  generateDynamicTestScenarios(formSchema) {
    const scenarios = [];

    formSchema.fields.forEach(field => {
      const identifier = field.id ? `#${field.id}` : (field.name ? `[name="${field.name}"]` : `[placeholder="${field.placeholder}"]`);

      if (field.required) {
        scenarios.push({
          fieldName: field.name || field.id || identifier,
          rule: 'Required Field Validation',
          selector: identifier,
          invalidValue: '',
          expectedValid: false
        });
      }

      if (field.type === 'email') {
        scenarios.push({
          fieldName: field.name || field.id || identifier,
          rule: 'Email Format Validation',
          selector: identifier,
          invalidValue: 'invalid-email-format',
          expectedValid: false
        });
      }

      if (field.minLength && parseInt(field.minLength, 10) > 0) {
        const shortVal = 'a'.repeat(parseInt(field.minLength, 10) - 1);
        scenarios.push({
          fieldName: field.name || field.id || identifier,
          rule: `MinLength (${field.minLength}) Validation`,
          selector: identifier,
          invalidValue: shortVal,
          expectedValid: false
        });
      }
    });

    return scenarios;
  }
}

module.exports = RouteAndFormDiscoverer;
