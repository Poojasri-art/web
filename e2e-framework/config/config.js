require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome', // 'chrome' | 'firefox' | 'edge'
  headless: process.env.HEADLESS !== 'false', // default true unless explicitly set to false
  implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
  explicitWait: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '2', 10),
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || '1920', 10),
    height: parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10)
  },
  paths: {
    reports: './reports',
    failures: './reports/failures',
    screenshots: './screenshots',
    logs: './logs',
    excel: './excel'
  }
};
