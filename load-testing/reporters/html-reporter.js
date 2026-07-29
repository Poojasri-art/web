'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * HTML Reporter — generates a fully self-contained, styled HTML report.
 * No external CDN dependencies.
 */
function generateHtmlReport(metrics, scenarioResults, config, resultsDir) {
  fs.mkdirSync(resultsDir, { recursive: true });

  const { summary, checks, routeStats } = metrics;
  const ts = new Date().toISOString();

  // ─── Category breakdown ───────────────────────────────────────────────────
  const categories = ['Status', 'Performance', 'Content', 'Headers', 'Errors'];
  const categoryStats = categories.map(cat => {
    const catChecks = checks.filter(c => c.category === cat);
    const passing   = catChecks.filter(c => c.status === 'PASS').length;
    const degraded  = catChecks.filter(c => c.status === 'DEGRADED').length;
    const failing   = catChecks.filter(c => c.status === 'FAIL').length;
    return { cat, total: catChecks.length, passing, degraded, failing };
  });

  // ─── Check rows ───────────────────────────────────────────────────────────
  const checkRows = checks.map(c => {
    const statusClass = c.status === 'PASS' ? 'pass' : c.status === 'DEGRADED' ? 'degraded' : 'fail';
    const icon        = c.status === 'PASS' ? '✅' : c.status === 'DEGRADED' ? '⚠️' : '❌';
    const bar         = progressBar(c.passRate);
    return `
    <tr class="${statusClass}-row">
      <td class="mono">${c.id}</td>
      <td><span class="badge badge-${c.category.toLowerCase()}">${c.category}</span></td>
      <td class="mono">${c.routePath}</td>
      <td>${c.name.replace(/^\[.*?\]\s*\w+:\s*/, '')}</td>
      <td>${c.totalEvals}</td>
      <td>${c.passCount}</td>
      <td>${c.failCount}</td>
      <td>
        <div class="bar-wrap"><div class="bar bar-${statusClass}" style="width:${c.passRate}%"></div></div>
        <span class="rate">${c.passRate}%</span>
      </td>
      <td><span class="status-badge ${statusClass}">${icon} ${c.status}</span></td>
    </tr>`;
  }).join('');

  // ─── Route rows ───────────────────────────────────────────────────────────
  const routeRows = routeStats.map(r => {
    const reqCount = Math.round(r.total / 30);
    const errClass = r.errorRate > 5 ? 'fail' : r.errorRate > 0 ? 'degraded' : 'pass';
    return `
    <tr>
      <td class="mono">${r.routePath}</td>
      <td>${r.routeName}</td>
      <td>${reqCount}</td>
      <td>${r.avg}ms</td>
      <td>${r.min}ms</td>
      <td>${r.max}ms</td>
      <td>${r.p90}ms</td>
      <td>${r.p95}ms</td>
      <td>${r.p99}ms</td>
      <td><span class="status-badge ${errClass}">${r.errorRate}%</span></td>
    </tr>`;
  }).join('');

  // ─── Scenario rows ────────────────────────────────────────────────────────
  const scenarioRows = scenarioResults.map(sr => `
    <tr>
      <td>${sr.scenarioName}</td>
      <td>${sr.users}</td>
      <td>${sr.loops}</td>
      <td>${sr.totalRequests}</td>
      <td>${sr.users * 10 * sr.loops} routes × users</td>
    </tr>`).join('');

  // ─── Category cards ───────────────────────────────────────────────────────
  const categoryCards = categoryStats.map(cs => `
    <div class="cat-card">
      <div class="cat-title">${cs.cat}</div>
      <div class="cat-total">${cs.total} checks</div>
      <div class="cat-stats">
        <span class="pass-txt">✅ ${cs.passing}</span>
        ${cs.degraded > 0 ? `<span class="warn-txt">⚠️ ${cs.degraded}</span>` : ''}
        ${cs.failing  > 0 ? `<span class="fail-txt">❌ ${cs.failing}</span>`  : ''}
      </div>
    </div>`).join('');

  const overallStatus  = summary.checksFailing === 0 ? '✅ ALL CHECKS PASSED' :
                         checks.filter(c => c.status === 'FAIL').length === 0
                           ? '⚠️ DEGRADED UNDER LOAD'
                           : '❌ LOAD TEST FAILED';
  const overallClass   = summary.checksFailing === 0 ? 'pass' :
                         checks.filter(c => c.status === 'FAIL').length === 0 ? 'degraded' : 'fail';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>CogniSync Load Test Report — ${ts}</title>
  <style>
    :root {
      --bg:      #0f1117;
      --surface: #1a1d27;
      --card:    #21253a;
      --accent:  #7c6ff7;
      --green:   #22c55e;
      --yellow:  #f59e0b;
      --red:     #ef4444;
      --text:    #e2e8f0;
      --muted:   #94a3b8;
      --border:  #2d3148;
      --radius:  10px;
      --font:    'Segoe UI', system-ui, -apple-system, sans-serif;
      --mono:    'Cascadia Code', 'Fira Mono', monospace;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; padding: 24px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 1.2rem; font-weight: 600; margin: 32px 0 16px; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    h3 { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
    .subtitle { color: var(--muted); font-size: 0.9rem; margin-bottom: 32px; }

    /* Header */
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    .logo { font-size: 2rem; }
    .verdict { display: inline-block; padding: 6px 20px; border-radius: 24px; font-size: 1rem; font-weight: 700; margin-bottom: 32px; }
    .verdict.pass     { background: rgba(34,197,94,.15); color: var(--green); border: 1px solid var(--green); }
    .verdict.degraded { background: rgba(245,158,11,.15); color: var(--yellow); border: 1px solid var(--yellow); }
    .verdict.fail     { background: rgba(239,68,68,.15);  color: var(--red);   border: 1px solid var(--red); }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
    .kpi-value { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 6px; }
    .kpi-label { font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
    .kpi-value.green { color: var(--green); }
    .kpi-value.yellow{ color: var(--yellow); }
    .kpi-value.red   { color: var(--red); }
    .kpi-value.accent{ color: var(--accent); }

    /* Category cards */
    .cat-cards { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
    .cat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; min-width: 140px; }
    .cat-title { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
    .cat-total { font-size: 1.4rem; font-weight: 700; color: var(--accent); }
    .cat-stats { font-size: 0.85rem; margin-top: 6px; display: flex; gap: 10px; }
    .pass-txt { color: var(--green); }
    .warn-txt { color: var(--yellow); }
    .fail-txt { color: var(--red); }

    /* Tables */
    .table-wrap { overflow-x: auto; margin-bottom: 32px; border-radius: var(--radius); border: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    thead { background: var(--card); }
    th { padding: 10px 14px; text-align: left; font-weight: 600; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    td { padding: 9px 14px; border-top: 1px solid var(--border); vertical-align: middle; }
    tr:hover td { background: rgba(124,111,247,.04); }
    .pass-row   td { background: rgba(34,197,94,.03); }
    .degraded-row td { background: rgba(245,158,11,.04); }
    .fail-row   td { background: rgba(239,68,68,.05); }
    .mono { font-family: var(--mono); font-size: 0.78rem; }

    /* Badges */
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
    .badge-status      { background: rgba(99,102,241,.2); color: #818cf8; }
    .badge-performance { background: rgba(245,158,11,.2); color: #fbbf24; }
    .badge-content     { background: rgba(16,185,129,.2); color: #34d399; }
    .badge-headers     { background: rgba(59,130,246,.2); color: #60a5fa; }
    .badge-errors      { background: rgba(239,68,68,.2);  color: #f87171; }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.76rem; font-weight: 600; white-space: nowrap; }
    .status-badge.pass     { background: rgba(34,197,94,.15);  color: var(--green); }
    .status-badge.degraded { background: rgba(245,158,11,.15); color: var(--yellow); }
    .status-badge.fail     { background: rgba(239,68,68,.15);  color: var(--red); }

    /* Progress bars */
    .bar-wrap { width: 80px; height: 6px; background: var(--border); border-radius: 3px; display: inline-block; margin-right: 8px; vertical-align: middle; }
    .bar { height: 100%; border-radius: 3px; }
    .bar-pass     { background: var(--green); }
    .bar-degraded { background: var(--yellow); }
    .bar-fail     { background: var(--red); }
    .rate { font-size: 0.8rem; font-weight: 600; }

    /* Filter bar */
    .filter-bar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .filter-btn { background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.82rem; transition: all .2s; }
    .filter-btn:hover, .filter-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

    footer { margin-top: 40px; text-align: center; color: var(--muted); font-size: 0.8rem; }
    a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>

<div class="header">
  <div class="logo">🧘</div>
  <div>
    <h1>CogniSync Web — Load Test Report</h1>
    <p class="subtitle">Generated: ${ts} &nbsp;|&nbsp; Base URL: ${config.baseUrl}</p>
  </div>
</div>

<div class="verdict ${overallClass}">${overallStatus}</div>

<!-- KPI Grid -->
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-value accent">${summary.totalChecks}</div><div class="kpi-label">Total Checks</div></div>
  <div class="kpi"><div class="kpi-value green">${summary.checksPassing}</div><div class="kpi-label">Checks Passing</div></div>
  <div class="kpi"><div class="kpi-value ${summary.checksFailing > 0 ? 'red' : 'green'}">${summary.checksFailing}</div><div class="kpi-label">Checks Failing</div></div>
  <div class="kpi"><div class="kpi-value ${summary.passRate >= 95 ? 'green' : summary.passRate >= 70 ? 'yellow' : 'red'}">${summary.passRate}%</div><div class="kpi-label">Pass Rate</div></div>
  <div class="kpi"><div class="kpi-value accent">${summary.totalHttpRequests}</div><div class="kpi-label">HTTP Requests</div></div>
  <div class="kpi"><div class="kpi-value ${summary.errorRate > 5 ? 'red' : 'green'}">${summary.errorRate}%</div><div class="kpi-label">Error Rate</div></div>
  <div class="kpi"><div class="kpi-value accent">${summary.throughput}</div><div class="kpi-label">Throughput (req/s)</div></div>
  <div class="kpi"><div class="kpi-value ${summary.avg > 2000 ? 'red' : summary.avg > 1000 ? 'yellow' : 'green'}">${summary.avg}ms</div><div class="kpi-label">Avg Response</div></div>
  <div class="kpi"><div class="kpi-value ${summary.p95 > 3000 ? 'red' : summary.p95 > 1500 ? 'yellow' : 'green'}">${summary.p95}ms</div><div class="kpi-label">P95 Response</div></div>
  <div class="kpi"><div class="kpi-value ${summary.p99 > 5000 ? 'red' : 'yellow'}">${summary.p99}ms</div><div class="kpi-label">P99 Response</div></div>
</div>

<!-- Category breakdown -->
<h2>📊 Check Category Breakdown</h2>
<div class="cat-cards">${categoryCards}</div>

<!-- Scenario Summary -->
<h2>📋 Load Scenarios Executed</h2>
<div class="table-wrap">
  <table>
    <thead><tr><th>Scenario</th><th>Virtual Users</th><th>Loops</th><th>Total HTTP Requests</th><th>Coverage</th></tr></thead>
    <tbody>${scenarioRows}</tbody>
  </table>
</div>

<!-- Route Performance -->
<h2>🌐 Per-Route Performance</h2>
<div class="table-wrap">
  <table>
    <thead><tr><th>Route Path</th><th>Route Name</th><th>Requests</th><th>Avg</th><th>Min</th><th>Max</th><th>P90</th><th>P95</th><th>P99</th><th>Error Rate</th></tr></thead>
    <tbody>${routeRows}</tbody>
  </table>
</div>

<!-- Response Time Percentiles -->
<h2>⚡ Global Response Time Distribution</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-value green">${summary.min}ms</div><div class="kpi-label">Minimum</div></div>
  <div class="kpi"><div class="kpi-value green">${summary.median}ms</div><div class="kpi-label">Median (P50)</div></div>
  <div class="kpi"><div class="kpi-value ${summary.p90 > 2000 ? 'yellow' : 'green'}">${summary.p90}ms</div><div class="kpi-label">P90</div></div>
  <div class="kpi"><div class="kpi-value ${summary.p95 > 3000 ? 'red' : summary.p95 > 1500 ? 'yellow' : 'green'}">${summary.p95}ms</div><div class="kpi-label">P95</div></div>
  <div class="kpi"><div class="kpi-value ${summary.p99 > 5000 ? 'red' : 'yellow'}">${summary.p99}ms</div><div class="kpi-label">P99</div></div>
  <div class="kpi"><div class="kpi-value red">${summary.max}ms</div><div class="kpi-label">Maximum</div></div>
</div>

<!-- All 300 Checks -->
<h2>🔍 All 300 Check Results</h2>
<div class="filter-bar">
  <button class="filter-btn active" onclick="filterChecks('all', this)">All (300)</button>
  <button class="filter-btn" onclick="filterChecks('pass', this)">✅ Passing</button>
  <button class="filter-btn" onclick="filterChecks('degraded', this)">⚠️ Degraded</button>
  <button class="filter-btn" onclick="filterChecks('fail', this)">❌ Failed</button>
</div>
<div class="table-wrap">
  <table id="checks-table">
    <thead>
      <tr>
        <th>Check ID</th><th>Category</th><th>Route</th><th>Description</th>
        <th>Evaluations</th><th>Passed</th><th>Failed</th><th>Pass Rate</th><th>Status</th>
      </tr>
    </thead>
    <tbody>${checkRows}</tbody>
  </table>
</div>

<footer>
  CogniSync Web Load Testing Framework &nbsp;|&nbsp;
  Node.js ${process.version} &nbsp;|&nbsp;
  <a href="check-results.csv">📥 Download Check CSV</a> &nbsp;|&nbsp;
  <a href="route-stats.csv">📥 Download Route Stats CSV</a>
</footer>

<script>
function filterChecks(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const rows = document.querySelectorAll('#checks-table tbody tr');
  rows.forEach(row => {
    if (filter === 'all') { row.style.display = ''; return; }
    const hasClass = row.classList.contains(filter + '-row');
    row.style.display = hasClass ? '' : 'none';
  });
}
</script>
</body>
</html>`;

  const htmlPath = path.join(resultsDir, 'load-test-report.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  return htmlPath;
}

function progressBar(rate) {
  return `<div class="bar-wrap"><div class="bar bar-${rate >= 95 ? 'pass' : rate >= 50 ? 'degraded' : 'fail'}" style="width:${rate}%"></div></div>`;
}

module.exports = { generateHtmlReport };
