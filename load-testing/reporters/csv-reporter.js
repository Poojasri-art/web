'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * CSV Reporter — exports load test results in two CSV files:
 *   1. check-results.csv — per-check pass rate summary (300 rows)
 *   2. route-stats.csv   — per-route performance statistics
 */
function generateCsvReports(metrics, resultsDir) {
  fs.mkdirSync(resultsDir, { recursive: true });

  // ─── 1. Check Results CSV (300 rows) ─────────────────────────────────────
  const checkHeaders = [
    'Check ID', 'Category', 'Route ID', 'Route Path', 'Check Name',
    'Total Evaluations', 'Pass Count', 'Fail Count', 'Pass Rate (%)', 'Status',
  ];
  const checkRows = metrics.checks.map(c => [
    c.id, c.category, c.routeId, c.routePath, `"${c.name}"`,
    c.totalEvals, c.passCount, c.failCount, c.passRate, c.status,
  ]);
  const checkCsv = [checkHeaders.join(','), ...checkRows.map(r => r.join(','))].join('\n');
  const checkPath = path.join(resultsDir, 'check-results.csv');
  fs.writeFileSync(checkPath, checkCsv, 'utf8');

  // ─── 2. Route Stats CSV ───────────────────────────────────────────────────
  const routeHeaders = [
    'Route ID', 'Route Path', 'Route Name',
    'HTTP Requests', 'Avg (ms)', 'Min (ms)', 'Max (ms)',
    'P90 (ms)', 'P95 (ms)', 'P99 (ms)', 'Error Rate (%)',
  ];
  const routeRows = metrics.routeStats.map(r => {
    const reqs = Math.round(r.total / 30);
    return [
      r.routeId, r.routePath, `"${r.routeName}"`,
      reqs, r.avg, r.min, r.max, r.p90, r.p95, r.p99, r.errorRate,
    ];
  });
  const routeCsv = [routeHeaders.join(','), ...routeRows.map(r => r.join(','))].join('\n');
  const routePath = path.join(resultsDir, 'route-stats.csv');
  fs.writeFileSync(routePath, routeCsv, 'utf8');

  return { checkPath, routePath };
}

module.exports = { generateCsvReports };
