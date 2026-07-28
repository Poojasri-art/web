const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class ExcelReporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.testResults = [];
    this.failedTests = [];
    this.executionLogs = [];
    this.startTime = new Date();
    this.endTime = null;
  }

  recordTestResult(testData) {
    // testData = { id, module, scenario, browser, status, startTime, endTime, duration, url, failureReason, screenshotPath }
    this.testResults.push(testData);
    if (testData.status === 'FAILED') {
      this.failedTests.push({
        testName: testData.scenario,
        failureReason: testData.failureReason || 'N/A',
        screenshotPath: testData.screenshotPath || 'N/A',
        browser: testData.browser || config.browser,
        url: testData.url || config.baseUrl
      });
    }
  }

  logStep(testName, stepDescription, result = 'PASS', remarks = '') {
    this.executionLogs.push({
      timestamp: new Date().toISOString(),
      testName,
      stepDescription,
      result,
      remarks
    });
  }

  async generateReport() {
    this.endTime = new Date();
    const durationSec = Math.round((this.endTime - this.startTime) / 1000);

    const total = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    const skipped = this.testResults.filter(t => t.status === 'SKIPPED').length;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';

    // Sheet 1: Summary
    const summarySheet = this.workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 35 }
    ];
    summarySheet.addRows([
      { metric: 'Execution Date', value: this.startTime.toLocaleString() },
      { metric: 'Environment', value: config.baseUrl },
      { metric: 'Total Tests', value: total },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration', value: `${durationSec} seconds` }
    ]);
    this._styleHeaderRow(summarySheet);

    // Sheet 2: Test Cases
    const testCasesSheet = this.workbook.addWorksheet('Test Cases');
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 12 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'scenario', width: 35 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 22 },
      { header: 'End Time', key: 'endTime', width: 22 },
      { header: 'Duration (ms)', key: 'duration', width: 15 }
    ];
    this.testResults.forEach(item => {
      const row = testCasesSheet.addRow(item);
      const statusCell = row.getCell('status');
      if (item.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } }; // Light Green
      } else if (item.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } }; // Light Red
      }
    });
    this._styleHeaderRow(testCasesSheet);

    // Sheet 3: Failed Tests
    const failedSheet = this.workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 45 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 45 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'URL', key: 'url', width: 35 }
    ];
    this.failedTests.forEach(item => failedSheet.addRow(item));
    this._styleHeaderRow(failedSheet);

    // Sheet 4: Execution Logs
    const logsSheet = this.workbook.addWorksheet('Execution Logs');
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step Description', key: 'stepDescription', width: 45 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];
    this.executionLogs.forEach(item => logsSheet.addRow(item));
    this._styleHeaderRow(logsSheet);

    // Ensure output directory exists
    const excelDir = path.resolve(config.paths.excel);
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const reportPath = path.join(excelDir, 'E2E_Report.xlsx');
    await this.workbook.xlsx.writeFile(reportPath);
    logger.info(`Excel E2E Report generated successfully: ${reportPath}`);
    return reportPath;
  }

  _styleHeaderRow(worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } }; // Dark Blue Header
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }
}

// Global Singleton for session reporting
const globalReporter = new ExcelReporter();
module.exports = globalReporter;
