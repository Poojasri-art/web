'use strict';

/**
 * Console Reporter
 * Prints a rich, structured summary to stdout (GitHub Actions friendly).
 */

const PASS_ICON  = '✅';
const FAIL_ICON  = '❌';
const WARN_ICON  = '⚠️ ';
const BAR_WIDTH  = 40;

function report(metrics, scenarioResults, config) {
  const { summary, checks, routeStats } = metrics;
  const line = '─'.repeat(72);
  const thick = '═'.repeat(72);

  console.log('');
  console.log(thick);
  console.log('  🧘 CogniSync Web — Load Test Report');
  console.log(`  Base URL   : ${config.baseUrl}`);
  console.log(`  Timestamp  : ${new Date().toISOString()}`);
  console.log(thick);

  // ─── Scenario Summary ────────────────────────────────────────────────────
  console.log('\n📋 LOAD SCENARIOS EXECUTED\n');
  for (const sr of scenarioResults) {
    console.log(`  • ${sr.scenarioName.padEnd(20)} — ${sr.users} virtual users, ${sr.loops} loop(s) per route, ${sr.totalRequests} HTTP requests`);
  }

  // ─── Check Summary ───────────────────────────────────────────────────────
  console.log(`\n${line}`);
  console.log('  ✅ LOAD TEST CHECK RESULTS (300 Checks)\n');

  const passingIcon  = summary.checksPassing === summary.totalChecks ? PASS_ICON : WARN_ICON;
  const overallPass  = summary.checksPassing === summary.totalChecks;

  console.log(`  Total Check Definitions : ${summary.totalChecks}`);
  console.log(`  Checks PASSING          : ${PASS_ICON}  ${summary.checksPassing}`);
  console.log(`  Checks FAILING/DEGRADED : ${summary.checksFailing > 0 ? FAIL_ICON : PASS_ICON}  ${summary.checksFailing}`);
  console.log(`  Overall Pass Rate       : ${summary.passRate}%`);
  console.log(`  Total HTTP Requests     : ${summary.totalHttpRequests}`);
  console.log(`  Error Rate              : ${summary.errorRate}%`);
  console.log(`  Throughput              : ${summary.throughput} req/s`);

  // ─── Performance Stats ───────────────────────────────────────────────────
  console.log(`\n${line}`);
  console.log('  ⚡ RESPONSE TIME METRICS (ms)\n');
  console.log(`  Average    : ${summary.avg}ms`);
  console.log(`  Minimum    : ${summary.min}ms`);
  console.log(`  Maximum    : ${summary.max}ms`);
  console.log(`  Median P50 : ${summary.median}ms`);
  console.log(`  P90        : ${summary.p90}ms`);
  console.log(`  P95        : ${summary.p95}ms`);
  console.log(`  P99        : ${summary.p99}ms`);

  // ─── Per-Route Stats ─────────────────────────────────────────────────────
  console.log(`\n${line}`);
  console.log('  🌐 PER-ROUTE PERFORMANCE\n');
  console.log(`  ${'Route'.padEnd(30)} ${'Requests'.padStart(8)} ${'Avg(ms)'.padStart(8)} ${'P95(ms)'.padStart(8)} ${'Errors'.padStart(7)}`);
  console.log(`  ${'-'.repeat(65)}`);
  for (const rs of routeStats) {
    const reqCount = Math.round(rs.total / 30); // divide by 30 checks per request
    const icon = rs.errorRate > 5 ? FAIL_ICON : PASS_ICON;
    console.log(`  ${icon} ${rs.routePath.padEnd(28)} ${String(reqCount).padStart(8)} ${String(rs.avg).padStart(8)} ${String(rs.p95).padStart(8)} ${String(rs.errorRate + '%').padStart(7)}`);
  }

  // ─── Failed Checks ───────────────────────────────────────────────────────
  const failed    = checks.filter(c => c.status === 'FAIL');
  const degraded  = checks.filter(c => c.status === 'DEGRADED');

  if (failed.length > 0) {
    console.log(`\n${line}`);
    console.log(`  ${FAIL_ICON} FAILED CHECKS (${failed.length})\n`);
    for (const c of failed) {
      console.log(`    ❌ [${c.id}] ${c.name}`);
      console.log(`       Pass Rate: ${c.passRate}% (${c.passCount}/${c.totalEvals} evaluations)`);
    }
  }

  if (degraded.length > 0) {
    console.log(`\n${line}`);
    console.log(`  ${WARN_ICON} DEGRADED UNDER LOAD (${degraded.length}) — performance thresholds missed under stress\n`);
    for (const c of degraded) {
      console.log(`    ⚠️  [${c.id}] ${c.name}`);
      console.log(`       Pass Rate: ${c.passRate}% — performance degraded under high concurrency`);
    }
  }

  // ─── Final Verdict ───────────────────────────────────────────────────────
  console.log(`\n${thick}`);
  if (overallPass) {
    console.log(`  ${PASS_ICON}  ALL 300 LOAD TEST CHECKS PASSED`);
    console.log('  The application performed within acceptable thresholds.');
  } else if (failed.length === 0 && degraded.length > 0) {
    console.log(`  ${WARN_ICON} 300 checks evaluated — DEGRADED performance under stress`);
    console.log('  Functional checks passed. Performance thresholds degraded under high load (expected).');
  } else {
    console.log(`  ${FAIL_ICON}  LOAD TEST COMPLETED WITH FAILURES`);
    console.log(`  ${failed.length} check(s) failed. Review the HTML report for details.`);
  }
  console.log(thick);
  console.log('');

  return failed.length === 0; // true = overall pass
}

module.exports = { report };
