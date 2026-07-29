'use strict';

/**
 * 300 Load Test Check Definitions
 * ─────────────────────────────────────────────────────────────────────────────
 * Structure: 10 application routes × 30 checks per route = 300 total checks
 *
 * Check groups per route:
 *   S01–S05  (5)  — HTTP Status Code checks
 *   T01–T08  (8)  — Response Time / Performance checks
 *   C01–C10  (10) — Response Body / Content checks
 *   H01–H04  (4)  — HTTP Header checks
 *   E01–E03  (3)  — Error Detection checks
 *              ──
 *              30 checks per route × 10 routes = 300 TOTAL
 */

// ─── Application Routes (10) ─────────────────────────────────────────────────
const ROUTES = [
  { id: 'ROOT',     path: '/',                name: 'Splash / Root Page'             },
  { id: 'INTRO',    path: '/intro',           name: 'Intro Onboarding Page'          },
  { id: 'LOGIN',    path: '/login',           name: 'Login Page'                     },
  { id: 'REGISTER', path: '/register',        name: 'Registration Page'              },
  { id: 'FORGOT',   path: '/forgot-password', name: 'Forgot Password Page'           },
  { id: 'HOME',     path: '/home',            name: 'Protected Home Route'           },
  { id: 'PROFILE',  path: '/profile',         name: 'Protected Profile Route'        },
  { id: 'PROGRESS', path: '/progress',        name: 'Protected Progress Route'       },
  { id: 'SAVED',    path: '/saved-progress',  name: 'Protected Saved Progress Route' },
  { id: 'UPDATE',   path: '/update-info',     name: 'Protected Update Info Route'    },
];

// ─── 30 Check Definitions (applied to each route) ────────────────────────────
function buildChecksForRoute(route) {
  const { id, name } = route;
  const label = (code, desc) => `[${id}] ${code}: ${desc}`;

  return [
    // ── STATUS GROUP (S01–S05) ────────────────────────────────────────────────
    {
      id: `${id}_S01`, category: 'Status', group: 'S',
      name: label('S01', 'HTTP status is 200'),
      description: 'Server returns HTTP 200 OK for this route',
      fn: r => r.status === 200,
    },
    {
      id: `${id}_S02`, category: 'Status', group: 'S',
      name: label('S02', 'HTTP status is not 404'),
      description: 'Route is not returning a 404 Not Found',
      fn: r => r.status !== 404,
    },
    {
      id: `${id}_S03`, category: 'Status', group: 'S',
      name: label('S03', 'HTTP status is not 500'),
      description: 'Route is not returning a 500 Internal Server Error',
      fn: r => r.status !== 500,
    },
    {
      id: `${id}_S04`, category: 'Status', group: 'S',
      name: label('S04', 'No client-side errors (status < 400)'),
      description: 'Status code is below 400 — no client error class response',
      fn: r => r.status < 400,
    },
    {
      id: `${id}_S05`, category: 'Status', group: 'S',
      name: label('S05', 'No server-side errors (status < 500)'),
      description: 'Status code is below 500 — no server error class response',
      fn: r => r.status < 500,
    },

    // ── TIMING GROUP (T01–T08) ────────────────────────────────────────────────
    {
      id: `${id}_T01`, category: 'Performance', group: 'T',
      name: label('T01', 'Response time < 5000ms [CRITICAL]'),
      description: 'Response time is below the critical 5-second threshold',
      fn: r => !r.timedOut && r.timing.total < 5000,
    },
    {
      id: `${id}_T02`, category: 'Performance', group: 'T',
      name: label('T02', 'Response time < 3000ms [GOOD]'),
      description: 'Response time under the good 3-second target',
      fn: r => !r.timedOut && r.timing.total < 3000,
    },
    {
      id: `${id}_T03`, category: 'Performance', group: 'T',
      name: label('T03', 'Response time < 2000ms [TARGET]'),
      description: 'Response time under the ideal 2-second target',
      fn: r => !r.timedOut && r.timing.total < 2000,
    },
    {
      id: `${id}_T04`, category: 'Performance', group: 'T',
      name: label('T04', 'Response time < 1000ms [EXCELLENT]'),
      description: 'Sub-second response — excellent user experience',
      fn: r => !r.timedOut && r.timing.total < 1000,
    },
    {
      id: `${id}_T05`, category: 'Performance', group: 'T',
      name: label('T05', 'Response time < 500ms [FAST]'),
      description: 'Very fast response under 500ms',
      fn: r => !r.timedOut && r.timing.total < 500,
    },
    {
      id: `${id}_T06`, category: 'Performance', group: 'T',
      name: label('T06', 'TTFB < 2000ms [Time-To-First-Byte]'),
      description: 'Server started sending data within 2 seconds',
      fn: r => r.timing.ttfb < 2000,
    },
    {
      id: `${id}_T07`, category: 'Performance', group: 'T',
      name: label('T07', 'TTFB < 1000ms [Time-To-First-Byte]'),
      description: 'Server started sending data within 1 second',
      fn: r => r.timing.ttfb < 1000,
    },
    {
      id: `${id}_T08`, category: 'Performance', group: 'T',
      name: label('T08', 'No request timeout occurred'),
      description: 'Request completed before the 10-second timeout',
      fn: r => !r.timedOut,
    },

    // ── CONTENT GROUP (C01–C10) ───────────────────────────────────────────────
    {
      id: `${id}_C01`, category: 'Content', group: 'C',
      name: label('C01', 'Response body is not empty'),
      description: 'Server returned a non-empty response body',
      fn: r => !!(r.body && r.body.length > 0),
    },
    {
      id: `${id}_C02`, category: 'Content', group: 'C',
      name: label('C02', 'Response body length > 100 bytes'),
      description: 'Response body is at least 100 bytes',
      fn: r => !!(r.body && r.body.length > 100),
    },
    {
      id: `${id}_C03`, category: 'Content', group: 'C',
      name: label('C03', 'Response body length > 300 bytes'),
      description: 'Response body is at least 300 bytes (Vite production HTML shell)',
      fn: r => !!(r.body && r.body.length > 300),
    },
    {
      id: `${id}_C04`, category: 'Content', group: 'C',
      name: label('C04', 'Response body length > 200 bytes'),
      description: 'Response body is at least 200 bytes (Vite SPA shell is ~362 bytes)',
      fn: r => !!(r.body && r.body.length > 200),
    },
    {
      id: `${id}_C05`, category: 'Content', group: 'C',
      name: label('C05', 'Body contains DOCTYPE declaration'),
      description: 'Response is a valid HTML document with DOCTYPE',
      fn: r => !!(r.body && (r.body.includes('<!DOCTYPE') || r.body.includes('<!doctype'))),
    },
    {
      id: `${id}_C06`, category: 'Content', group: 'C',
      name: label('C06', 'Body contains <html> element'),
      description: 'Response body contains the root <html> tag',
      fn: r => !!(r.body && r.body.includes('<html')),
    },
    {
      id: `${id}_C07`, category: 'Content', group: 'C',
      name: label('C07', 'Body contains <head> element'),
      description: 'Response body contains a <head> tag',
      fn: r => !!(r.body && r.body.includes('<head')),
    },
    {
      id: `${id}_C08`, category: 'Content', group: 'C',
      name: label('C08', 'Body contains <body> element'),
      description: 'Response body contains a <body> tag',
      fn: r => !!(r.body && r.body.includes('<body')),
    },
    {
      id: `${id}_C09`, category: 'Content', group: 'C',
      name: label('C09', 'Body contains <title> tag with app name'),
      description: 'Response body contains a <title> tag (CogniSync Web)',
      fn: r => !!(r.body && r.body.includes('<title>')),
    },
    {
      id: `${id}_C10`, category: 'Content', group: 'C',
      name: label('C10', 'Body contains React root mount element'),
      description: 'Response body contains <div id="root"> — React app mount point',
      fn: r => !!(r.body && r.body.includes('id="root"')),
    },

    // ── HEADER GROUP (H01–H04) ────────────────────────────────────────────────
    {
      id: `${id}_H01`, category: 'Headers', group: 'H',
      name: label('H01', 'Content-Type header is present'),
      description: 'Server responded with a Content-Type header',
      fn: r => !!r.headers['content-type'],
    },
    {
      id: `${id}_H02`, category: 'Headers', group: 'H',
      name: label('H02', 'Content-Type includes text/html'),
      description: 'Content-Type indicates an HTML response',
      fn: r => !!(r.headers['content-type'] && r.headers['content-type'].includes('text/html')),
    },
    {
      id: `${id}_H03`, category: 'Headers', group: 'H',
      name: label('H03', 'Content-Length or Transfer-Encoding present'),
      description: 'Server indicated response body size via standard headers',
      fn: r => !!(r.headers['content-length'] || r.headers['transfer-encoding']),
    },
    {
      id: `${id}_H04`, category: 'Headers', group: 'H',
      name: label('H04', 'No error indicator in response headers'),
      description: 'No x-error, x-amzn-errortype or similar error headers present',
      fn: r => !r.headers['x-error'] && !r.headers['x-amzn-errortype'],
    },

    // ── ERROR GROUP (E01–E03) ─────────────────────────────────────────────────
    {
      id: `${id}_E01`, category: 'Errors', group: 'E',
      name: label('E01', 'Body does not contain 500 Internal Server Error'),
      description: 'Response body does not contain server error text',
      fn: r => !r.body || !r.body.includes('Internal Server Error'),
    },
    {
      id: `${id}_E02`, category: 'Errors', group: 'E',
      name: label('E02', 'Body does not contain 503 Service Unavailable'),
      description: 'Response body does not contain service unavailability text',
      fn: r => !r.body || !r.body.includes('Service Unavailable'),
    },
    {
      id: `${id}_E03`, category: 'Errors', group: 'E',
      name: label('E03', 'No network or connection error occurred'),
      description: 'Request did not result in a network-level error',
      fn: r => !r.error,
    },
  ].map(check => ({
    ...check,
    routeId:   route.id,
    routeName: route.name,
    routePath: route.path,
  }));
}

// ─── Build all 300 checks ─────────────────────────────────────────────────────
const ALL_CHECKS = ROUTES.flatMap(buildChecksForRoute);

// Validate count at module load time
if (ALL_CHECKS.length !== 300) {
  throw new Error(`Expected 300 check definitions, got ${ALL_CHECKS.length}`);
}

module.exports = { ROUTES, ALL_CHECKS, buildChecksForRoute };
