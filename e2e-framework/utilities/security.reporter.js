const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class SecurityReporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.testResults = [];
    this.failedTests = [];
    this.executionLogs = [];
    this.startTime = new Date();
    this.endTime = null;
  }

  recordTestResult(testData) {
    // testData = { id, category, name, description, expectedResult, actualResult, status, browser, duration }
    this.testResults.push(testData);
    if (testData.status === 'FAILED') {
      this.failedTests.push({
        testId: testData.id,
        category: testData.category,
        testName: testData.name,
        failureReason: testData.actualResult || 'N/A',
        browser: testData.browser || config.browser
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
    const summarySheet = this._getOrCreateWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 35 }
    ];
    summarySheet.addRows([
      { metric: 'Execution Date', value: this.startTime.toLocaleString() },
      { metric: 'Environment', value: config.baseUrl },
      { metric: 'Total Security Tests', value: total },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration', value: `${durationSec} seconds` }
    ]);
    this._styleHeaderRow(summarySheet);

    // Sheet 2: Vulnerability Test Cases
    const testCasesSheet = this._getOrCreateWorksheet('Vulnerability Test Cases');
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Vulnerability Category', key: 'category', width: 25 },
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Expected Result', key: 'expectedResult', width: 35 },
      { header: 'Actual Result', key: 'actualResult', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Execution Time (ms)', key: 'duration', width: 20 }
    ];
    this.testResults.forEach(item => {
      const row = testCasesSheet.addRow(item);
      const statusCell = row.getCell('status');
      if (item.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
      } else if (item.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
      }
    });
    this._styleHeaderRow(testCasesSheet);

    // Sheet 3: Failed Tests
    const failedSheet = this._getOrCreateWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 45 },
      { header: 'Browser', key: 'browser', width: 15 }
    ];
    this.failedTests.forEach(item => failedSheet.addRow(item));
    this._styleHeaderRow(failedSheet);

    // Ensure output directory exists
    const excelDir = path.resolve(config.paths.excel);
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const reportPath = path.join(excelDir, 'Security_Report.xlsx');
    await this.workbook.xlsx.writeFile(reportPath);
    logger.info(`Excel Security Report generated successfully: ${reportPath}`);
    return reportPath;
  }

  _styleHeaderRow(worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030A0' } }; // Purple for Security
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  _getOrCreateWorksheet(name) {
    const existing = this.workbook.getWorksheet(name);
    if (existing) {
      this.workbook.removeWorksheet(existing.id);
    }
    return this.workbook.addWorksheet(name);
  }
}

const globalSecurityReporter = new SecurityReporter();
module.exports = globalSecurityReporter;
