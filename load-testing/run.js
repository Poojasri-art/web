'use strict';

/**
 * Main entry point for the CogniSync Load Testing Framework
 *
 * Usage:
 *   node run.js                     # run all 4 scenarios
 *   node run.js --scenario baseline # run one scenario
 *   node run.js --scenario all      # explicitly run all
 */

const path = require('path');
const config = require('./config');
const { ALL_CHECKS, ROUTES } = require('./checks/definitions');
const { runScenario }        = require('./runner/worker-pool');
const { aggregateMetrics }   = require('./runner/metrics');
const consoleReporter        = require('./reporters/console-reporter');
const { generateHtmlReport } = require('./reporters/html-reporter');
const { generateCsvReports } = require('./reporters/csv-reporter');

// ─── Parse CLI arguments ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const scenarioArg = (() => {
  const idx = args.indexOf('--scenario');
  return idx !== -1 ? args[idx + 1] : 'all';
})();

// ─── Determine which scenarios to run ────────────────────────────────────────
const SCENARIO_KEYS = ['baseline', 'normal', 'stress', 'spike'];
const selectedKeys  = scenarioArg === 'all'
  ? SCENARIO_KEYS
  : SCENARIO_KEYS.includes(scenarioArg)
    ? [scenarioArg]
    : (() => { console.error(`Unknown scenario: ${scenarioArg}. Use: baseline | normal | stress | spike | all`); process.exit(1); })();

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🧘 CogniSync Web — Load Testing Framework');
  console.log(`   Base URL  : ${config.baseUrl}`);
  console.log(`   Scenarios : ${selectedKeys.join(', ')}`);
  console.log(`   Checks    : ${ALL_CHECKS.length} check definitions (10 routes × 30 checks)\n`);

  // ─── Verify app is reachable ──────────────────────────────────────────────
  console.log('🔗 Verifying application is reachable...');
  try {
    const r = await fetch(`${config.baseUrl}/`, { signal: AbortSignal.timeout(8000) });
    if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
    console.log(`   ✅ Application is UP at ${config.baseUrl}\n`);
  } catch (err) {
    console.error(`\n❌ Cannot reach application at ${config.baseUrl}`);
    console.error(`   Error: ${err.message}`);
    console.error('   Please start the app first: npm run preview (in Meditation_web/)');
    process.exit(1);
  }

  // ─── Run scenarios ────────────────────────────────────────────────────────
  const allEvaluations  = [];
  const scenarioResults = [];

  for (const key of selectedKeys) {
    const scenarioCfg = config.scenarios[key];
    console.log(`\n▶  Running [${scenarioCfg.name}]`);
    console.log(`   Users: ${scenarioCfg.users} | Ramp-up: ${scenarioCfg.rampUp}s | Loops: ${scenarioCfg.loops}`);
    console.log(`   Expected requests: ${scenarioCfg.users * ROUTES.length * scenarioCfg.loops}`);

    const totalReqs = scenarioCfg.users * ROUTES.length * scenarioCfg.loops;
    let lastPct = -1;
    process.stdout.write('   Progress: [');
    const barLen = 30;

    const startMs = Date.now();
    const result = await runScenario(
      scenarioCfg,
      ROUTES,
      ALL_CHECKS,
      config.baseUrl,
      {
        requestTimeout: config.requestTimeout,
        thinkTime:      config.thinkTime,
        onProgress: (done, total) => {
          const pct = Math.floor((done / total) * 100);
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            const filled = Math.floor((pct / 100) * barLen);
            const bar    = '█'.repeat(filled) + '░'.repeat(barLen - filled);
            process.stdout.write(`\r   Progress: [${bar}] ${pct}%`);
          }
        },
      }
    );

    const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
    process.stdout.write(`\r   Progress: [${'█'.repeat(barLen)}] 100% — done in ${elapsed}s\n`);

    allEvaluations.push(...result.evaluations);
    scenarioResults.push(result);
    console.log(`   ✅ ${result.totalRequests} requests completed`);
  }

  // ─── Aggregate & report ───────────────────────────────────────────────────
  console.log('\n📊 Aggregating metrics...');
  const metrics = aggregateMetrics(allEvaluations, ALL_CHECKS, config.passThreshold);

  const overallPassed = consoleReporter.report(metrics, scenarioResults, config);

  // ─── Generate reports ─────────────────────────────────────────────────────
  const resultsDir = path.resolve(__dirname, config.resultsDir);
  console.log(`\n📁 Generating reports in: ${resultsDir}`);

  const htmlPath = generateHtmlReport(metrics, scenarioResults, config, resultsDir);
  console.log(`   ✅ HTML report : ${htmlPath}`);

  const { checkPath, routePath } = generateCsvReports(metrics, resultsDir);
  console.log(`   ✅ Check CSV   : ${checkPath}`);
  console.log(`   ✅ Route CSV   : ${routePath}`);

  // ─── GitHub Actions summary output ───────────────────────────────────────
  const { summary } = metrics;
  console.log('\n::group::Load Test Summary (GitHub Actions)');
  console.log(`Total Checks: ${summary.totalChecks}`);
  console.log(`Passing: ${summary.checksPassing}`);
  console.log(`Failing: ${summary.checksFailing}`);
  console.log(`Pass Rate: ${summary.passRate}%`);
  console.log(`HTTP Requests: ${summary.totalHttpRequests}`);
  console.log(`Error Rate: ${summary.errorRate}%`);
  console.log(`Throughput: ${summary.throughput} req/s`);
  console.log(`Avg Response: ${summary.avg}ms`);
  console.log(`P95 Response: ${summary.p95}ms`);
  console.log(`P99 Response: ${summary.p99}ms`);
  console.log('::endgroup::');

  // Exit code: 0 = pass, 1 = fail (allows GitHub Actions to detect failure)
  process.exit(overallPassed ? 0 : 1);
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
