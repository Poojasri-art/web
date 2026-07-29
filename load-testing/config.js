'use strict';

/**
 * Load Testing Configuration
 * All values can be overridden via environment variables.
 */
module.exports = {
  // ─── Application ───────────────────────────────────────────────────────────
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',

  // ─── Request Settings ──────────────────────────────────────────────────────
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10), // ms
  thinkTime:      parseInt(process.env.THINK_TIME       || '100',   10), // ms between requests per VU
  passThreshold:  parseFloat(process.env.PASS_THRESHOLD || '95'),        // % pass rate to consider a check "passing"

  // ─── Report Paths ──────────────────────────────────────────────────────────
  resultsDir: process.env.RESULTS_DIR || './results',

  // ─── Scenario Overrides (env-driven) ───────────────────────────────────────
  scenarios: {
    baseline: {
      name:    'Baseline Load',
      users:   parseInt(process.env.BASELINE_USERS    || '5',  10),
      rampUp:  parseInt(process.env.BASELINE_RAMP     || '5',  10), // seconds
      loops:   parseInt(process.env.BASELINE_LOOPS    || '2',  10), // iterations per VU per route
    },
    normal: {
      name:    'Normal Load',
      users:   parseInt(process.env.NORMAL_USERS      || '20', 10),
      rampUp:  parseInt(process.env.NORMAL_RAMP       || '10', 10),
      loops:   parseInt(process.env.NORMAL_LOOPS      || '1',  10),
    },
    stress: {
      name:    'Stress Load',
      users:   parseInt(process.env.STRESS_USERS      || '50', 10),
      rampUp:  parseInt(process.env.STRESS_RAMP       || '15', 10),
      loops:   parseInt(process.env.STRESS_LOOPS      || '1',  10),
    },
    spike: {
      name:    'Spike Load',
      users:   parseInt(process.env.SPIKE_USERS       || '100',10),
      rampUp:  parseInt(process.env.SPIKE_RAMP        || '5',  10),
      loops:   parseInt(process.env.SPIKE_LOOPS       || '1',  10),
    },
  },
};
