# Enterprise E2E Selenium Automation Framework (Node.js & React)

Production-ready End-to-End (E2E) Selenium WebDriver Test Automation Framework built for React Web Applications using Node.js, JavaScript (ES6+), Mocha, Chai, ExcelJS, Mochawesome, Winston Logger, and GitHub Actions.

---

## 🏛 Framework Architecture

- **Pattern**: Page Object Model (POM) + Component Object Model
- **Language & Runtime**: JavaScript (ES6+) on Node.js v18+
- **Automation Engine**: Selenium WebDriver 4.x (with automated Selenium Manager binary management)
- **Test Runner & Assertions**: Mocha BDD + Chai BDD Assertions
- **Reporting**:
  - Custom Multi-Sheet Excel Reporter (`exceljs`) generating `excel/E2E_Report.xlsx`
  - Interactive HTML Reports (`mochawesome`) generating `reports/html/E2E_Test_Report.html`
- **Logging & Diagnostic Artifacts**: Winston logger (`logs/execution.log`), Failure Screenshots (`screenshots/`), Failure Traces (`reports/failures/`)
- **Dynamic Route & Form Discovery**: Custom DOM Introspection engine (`utilities/route.discoverer.js`) that automatically inspects React routes, extracts input attributes (`required`, `email`, `minlength`, `type`), and generates dynamic test assertions.
- **CI/CD Integration**: GitHub Actions pipeline (`.github/workflows/selenium-e2e.yml`) with automated matrix execution (Chrome, Firefox) and artifact archiving.

---

## 📁 Directory Structure

```
e2e-framework/
├── config/
│   └── config.js                     # Environment, timeouts & browser parameters
├── pages/
│   ├── base.page.js                  # Parent page with common navigation & browser methods
│   ├── login.page.js                 # Login page selectors & business actions
│   ├── register.page.js              # Registration page selectors & form actions
│   ├── home.page.js                   # Dashboard page object
│   ├── profile.page.js                # Profile & settings page object
│   └── navigation.component.js       # Shared Navbar/Header navigation component
├── utilities/
│   ├── driver.factory.js             # Multi-browser WebDriver builder (Chrome, Edge, Firefox, Headed/Headless)
│   ├── selenium.utils.js             # Explicit/implicit waits, JS clicks, scrolling, alerts, screenshot capture
│   ├── logger.js                     # Winston logger configuration
│   ├── excel.reporter.js             # 4-Sheet ExcelJS E2E Report Generator
│   └── route.discoverer.js           # Dynamic React route crawler & form rule inspector
├── data/
│   └── testData.js                   # Test data suites (Auth, Registration, Routes)
├── tests/
│   ├── base.test.js                  # Mocha test lifecycle hooks & telemetry handlers
│   ├── auth.test.js                  # Authentication E2E test cases
│   ├── forms.test.js                 # Form rule & input validation test cases
│   ├── ui.test.js                    # UI controls, buttons, tooltips & element test cases
│   ├── navigation.test.js            # Internal routing, back/forward history test cases
│   └── dynamic_discovery.test.js     # Automatic dynamic form discovery & rule test engine
├── reports/
│   ├── failures/                     # Failure JSON metadata, traces, and screenshots
│   └── html/                         # Mochawesome HTML report output
├── screenshots/                      # Step & assertion screenshot capture directory
├── logs/                             # Winston execution log files (execution.log, error.log)
├── excel/                            # Output directory for E2E_Report.xlsx
├── .github/workflows/
│   └── selenium-e2e.yml              # GitHub Actions CI/CD workflow pipeline
├── .mocharc.json                     # Mocha configuration file
├── package.json                      # NPM dependencies & test script definitions
└── README.md                         # Framework documentation & execution guide
```

---

## 📊 Excel Report Schema (`E2E_Report.xlsx`)

The framework automatically builds a clean, color-coded 4-sheet Excel report after execution:

1. **Sheet 1: Summary**
   - Execution Date, Environment URL, Total Tests, Passed, Failed, Skipped, Pass Percentage, Execution Duration.
2. **Sheet 2: Test Cases**
   - Test ID, Module Name, Scenario Name, Browser, Execution Status (Passed/Failed), Start Time, End Time, Duration (ms).
3. **Sheet 3: Failed Tests**
   - Test Name, Failure Reason, Screenshot File Path, Browser, URL at failure time.
4. **Sheet 4: Execution Logs**
   - Timestamp, Test Name, Step Description, Step Result, Remarks.

---

## 🚀 Getting Started & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Browser**: Google Chrome, Firefox, or Microsoft Edge installed on host system

### 1. Installation
Navigate into the framework directory and install dependencies:
```bash
cd e2e-framework
npm install
```

### 2. Running Tests Locally

#### A. Run Full Test Suite (Default Headless Chrome)
```bash
npm run test
```

#### B. Run in Headed Mode (Visible Browser Window)
```bash
npm run test:headed
```

#### C. Run Cross-Browser Tests
```bash
# Firefox Headless
npm run test:firefox

# Microsoft Edge Headless
npm run test:edge
```

#### D. Run Specific Test Suites
```bash
# Authentication tests
npm run test:auth

# Form validation tests
npm run test:forms

# UI element tests
npm run test:ui

# Navigation & history tests
npm run test:navigation

# Dynamic Route & Form Discovery engine tests
npm run test:discovery
```

---

## ⚙ Environment Configurations (`config/config.js` or `.env`)

You can customize execution parameters via environment variables or `.env` file:

```env
BASE_URL=http://localhost:5173
BROWSER=chrome
HEADLESS=true
EXPLICIT_WAIT=15000
IMPLICIT_WAIT=10000
RETRY_ATTEMPTS=2
```

---

## 🤖 GitHub Actions CI/CD Pipeline

The `.github/workflows/selenium-e2e.yml` workflow automatically runs on `push` or `pull_request`:
1. Checks out repository code.
2. Sets up Node.js 20 environment.
3. Builds and launches the React application.
4. Executes Chrome & Firefox headless test matrix.
5. Archives `E2E_Report.xlsx`, Mochawesome HTML report, logs, and screenshots as workflow build artifacts.
