'use strict';

/**
 * Metrics Aggregator
 * Computes per-check pass rates and overall performance statistics
 * from raw evaluation data collected by the worker pool.
 */

/**
 * Aggregate raw evaluations into structured metrics.
 *
 * @param {object[]} evaluations    - Raw evaluation records from all scenarios
 * @param {object[]} checkDefs      - All 300 check definitions (for labels)
 * @param {number}   passThreshold  - % pass rate to consider a check "passing" (default 95)
 * @returns {AggregatedMetrics}
 */
function aggregateMetrics(evaluations, checkDefs, passThreshold = 95) {
  // ─── Per-check aggregation ─────────────────────────────────────────────────
  const checkMap = {};
  for (const def of checkDefs) {
    checkMap[def.id] = {
      id:          def.id,
      name:        def.name,
      category:    def.category,
      group:       def.group,
      routeId:     def.routeId,
      routeName:   def.routeName,
      routePath:   def.routePath,
      totalEvals:  0,
      passCount:   0,
      failCount:   0,
      passRate:    0,
      status:      'PENDING', // PASS | FAIL | DEGRADED
    };
  }

  const allTimings = [];

  for (const ev of evaluations) {
    const c = checkMap[ev.checkId];
    if (!c) continue;
    c.totalEvals++;
    if (ev.passed) c.passCount++; else c.failCount++;
    // Collect response timings from T08 checks (one timing per request)
    if (ev.checkGroup === 'T' && ev.checkId.endsWith('_T08')) {
      allTimings.push(ev.timing.total);
    }
  }

  // Compute pass rates and statuses
  let totalChecksPassing = 0;
  let totalChecksFailing  = 0;

  for (const c of Object.values(checkMap)) {
    if (c.totalEvals === 0) {
      c.passRate = 0;
      c.status   = 'NOT_RUN';
      totalChecksFailing++;
    } else {
      c.passRate = parseFloat(((c.passCount / c.totalEvals) * 100).toFixed(2));
      if (c.passRate >= passThreshold) {
        c.status = 'PASS';
        totalChecksPassing++;
      } else if (c.passRate >= 50) {
        c.status = 'DEGRADED'; // Performance degraded under load — not a hard failure
        totalChecksFailing++;
      } else {
        c.status = 'FAIL';
        totalChecksFailing++;
      }
    }
  }

  // ─── Per-route aggregation ────────────────────────────────────────────────
  const routeMap = {};
  for (const ev of evaluations) {
    const key = ev.routeId;
    if (!routeMap[key]) {
      routeMap[key] = { routeId: key, routeName: ev.routeName, routePath: ev.routePath, timings: [], errors: 0, total: 0 };
    }
    routeMap[key].total++;
    if (ev.timing) routeMap[key].timings.push(ev.timing.total);
    if (ev.error)  routeMap[key].errors++;
  }

  const routeStats = Object.values(routeMap).map(r => ({
    ...r,
    ...computeTimingStats(r.timings),
    errorRate: r.total > 0 ? parseFloat(((r.errors / r.total) * 100).toFixed(2)) : 0,
    timings: undefined, // strip raw data
  }));

  // ─── Global performance stats ─────────────────────────────────────────────
  const globalStats = computeTimingStats(allTimings);

  // Total HTTP requests made
  const totalHttpRequests = evaluations.filter(e => e.checkId.endsWith('_T08')).length;
  const totalErrors       = evaluations.filter(e => e.checkId.endsWith('_E03') && !e.passed).length;
  const errorRate         = totalHttpRequests > 0
    ? parseFloat(((totalErrors / totalHttpRequests) * 100).toFixed(2))
    : 0;

  // Throughput: requests per second (across all scenarios combined)
  const timestamps = evaluations.map(e => e.timestamp).filter(Boolean);
  let throughput = 0;
  if (timestamps.length > 0 && allTimings.length > 0) {
    const durationMs = Math.max(...timestamps) - Math.min(...timestamps);
    throughput = durationMs > 0
      ? parseFloat((totalHttpRequests / (durationMs / 1000)).toFixed(2))
      : 0;
  }

  return {
    summary: {
      totalChecks:        checkDefs.length,     // 300
      checksPassing:      totalChecksPassing,
      checksFailing:      totalChecksFailing,
      passRate:           parseFloat(((totalChecksPassing / checkDefs.length) * 100).toFixed(2)),
      totalHttpRequests,
      errorRate,
      throughput,         // req/s
      ...globalStats,
    },
    checks:     Object.values(checkMap),
    routeStats,
  };
}

/**
 * Compute timing statistics from an array of millisecond values.
 */
function computeTimingStats(timings) {
  if (!timings || timings.length === 0) {
    return { avg: 0, min: 0, max: 0, p90: 0, p95: 0, p99: 0, median: 0, count: 0 };
  }
  const sorted = [...timings].sort((a, b) => a - b);
  const count  = sorted.length;
  const sum    = sorted.reduce((a, b) => a + b, 0);

  return {
    count,
    avg:    Math.round(sum / count),
    min:    sorted[0],
    max:    sorted[count - 1],
    median: sorted[Math.floor(count * 0.50)],
    p90:    sorted[Math.floor(count * 0.90)],
    p95:    sorted[Math.floor(count * 0.95)],
    p99:    sorted[Math.floor(count * 0.99)] || sorted[count - 1],
  };
}

module.exports = { aggregateMetrics, computeTimingStats };
