'use strict';

/**
 * Worker Pool — Concurrent virtual user execution
 * Simulates N virtual users making requests concurrently with ramp-up.
 */

const { makeRequest } = require('./http-client');

/**
 * Run a full load scenario: spawn virtual users, each making requests to all
 * routes, collecting check evaluations and raw timing data.
 *
 * @param {object}   scenario     - Scenario config (name, users, rampUp, loops)
 * @param {object[]} routes       - Array of route definitions {id, path, name}
 * @param {object[]} checkDefs    - All 300 check definitions
 * @param {string}   baseUrl      - Base URL of the application
 * @param {object}   options
 * @param {number}   options.requestTimeout - ms
 * @param {number}   options.thinkTime     - ms pause between requests per VU
 * @param {Function} options.onProgress    - callback(completedRequests, totalRequests)
 * @returns {Promise<ScenarioResult>}
 */
async function runScenario(scenario, routes, checkDefs, baseUrl, options = {}) {
  const { users, rampUp, loops, name: scenarioName } = scenario;
  const { requestTimeout = 10000, thinkTime = 100, onProgress } = options;

  const totalRequests = users * routes.length * loops;
  let completedRequests = 0;

  // Group checks by routeId for quick lookup
  const checksByRoute = {};
  for (const check of checkDefs) {
    if (!checksByRoute[check.routeId]) checksByRoute[check.routeId] = [];
    checksByRoute[check.routeId].push(check);
  }

  // Raw per-request results: { checkId, passed, timing, userId, loop, routeId, routePath, timestamp }
  const allEvaluations = [];

  // Ramp-up: stagger VU start times
  const rampUpMs = rampUp * 1000;
  const vuDelay  = users > 1 ? rampUpMs / (users - 1) : 0;

  const vuPromises = Array.from({ length: users }, (_, vuIndex) => {
    const startDelay = Math.round(vuIndex * vuDelay);
    return runVirtualUser({
      vuIndex,
      startDelay,
      routes,
      loops,
      checksByRoute,
      baseUrl,
      requestTimeout,
      thinkTime,
      scenarioName,
      onRequestComplete: (evaluations) => {
        allEvaluations.push(...evaluations);
        completedRequests++;
        if (onProgress) onProgress(completedRequests, totalRequests);
      },
    });
  });

  await Promise.all(vuPromises);

  return {
    scenarioName,
    users,
    loops,
    totalRequests: completedRequests,
    evaluations:   allEvaluations,
  };
}

/**
 * Simulates a single virtual user making requests to all routes N times.
 */
async function runVirtualUser({
  vuIndex,
  startDelay,
  routes,
  loops,
  checksByRoute,
  baseUrl,
  requestTimeout,
  thinkTime,
  scenarioName,
  onRequestComplete,
}) {
  if (startDelay > 0) {
    await sleep(startDelay);
  }

  for (let loop = 0; loop < loops; loop++) {
    for (const route of routes) {
      const url = `${baseUrl}${route.path}`;
      const response = await makeRequest(url, { timeout: requestTimeout });

      // Evaluate all checks for this route
      const checks = checksByRoute[route.id] || [];
      const evaluations = checks.map(check => {
        let passed = false;
        try { passed = !!check.fn(response); } catch (_) { passed = false; }
        return {
          checkId:      check.id,
          checkName:    check.name,
          checkCategory:check.category,
          checkGroup:   check.group,
          routeId:      route.id,
          routeName:    route.name,
          routePath:    route.path,
          passed,
          status:       response.status,
          timing:       { ...response.timing },
          timedOut:     response.timedOut,
          error:        response.error,
          vuIndex,
          loop,
          scenarioName,
          timestamp:    Date.now(),
        };
      });

      onRequestComplete(evaluations);

      // Think time between requests
      if (thinkTime > 0) await sleep(thinkTime);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runScenario };
