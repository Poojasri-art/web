'use strict';

/**
 * HTTP Client with timing measurement
 * Uses Node.js 18+ built-in fetch (no external dependencies)
 */

/**
 * Makes a single HTTP GET request and returns a normalized response object
 * with timing, status, headers, and body.
 *
 * @param {string} url - Full URL to request
 * @param {object} options
 * @param {number} options.timeout - Request timeout in ms (default 10000)
 * @returns {Promise<ResponseResult>}
 */
async function makeRequest(url, options = {}) {
  const timeout = options.timeout || 10000;
  const startTime = Date.now();
  let ttfbTime = 0;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method:   'GET',
      redirect: 'follow',
      signal:   controller.signal,
      headers:  options.headers || { 'User-Agent': 'CogniSync-LoadTest/1.0' },
    });

    // Approximate TTFB as time before we start reading the body
    ttfbTime = Date.now() - startTime;
    const body = await response.text();
    clearTimeout(timer);

    const totalTime = Date.now() - startTime;

    // Normalize headers to lowercase object
    const headers = {};
    response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

    return {
      status:   response.status,
      headers,
      body,
      timing: {
        total: totalTime,
        ttfb:  ttfbTime,
      },
      timedOut: false,
      error:    null,
      url,
    };

  } catch (err) {
    clearTimeout(timer);
    const totalTime = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';

    return {
      status:   0,
      headers:  {},
      body:     '',
      timing: {
        total: totalTime,
        ttfb:  ttfbTime || totalTime,
      },
      timedOut: isTimeout,
      error:    isTimeout ? `Request timed out after ${timeout}ms` : err.message,
      url,
    };
  }
}

module.exports = { makeRequest };
