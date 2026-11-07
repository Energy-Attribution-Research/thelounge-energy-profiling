#!/usr/bin/env node
// Reads .energy/known_load.json, which only a known-load test PR adds, and prints
// "<task> <mode> <value>" for the workflow. Any mistake stops the run, so a typo can
// never turn a test PR into an unlabelled control.
//   { "task": "vitest.plugins", "mode": "repeat", "factor": 2 }   run the task 2 times in its span
//   { "task": "vitest.plugins", "mode": "busy", "seconds": 20 }   add a 20 s CPU busy loop in its span

const fs = require('fs');

const FILE = '.energy/known_load.json';

function fail(message) {
  console.error(`${FILE}: ${message}`);
  process.exit(1);
}

let load;
try {
  load = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch (error) {
  fail(`cannot read it (${error.message})`);
}

if (typeof load.task !== 'string' || !/^[\w.-]+$/.test(load.task)) {
  fail('"task" must be a span name such as vitest.plugins');
}
if (load.mode === 'repeat') {
  if (!Number.isInteger(load.factor) || load.factor < 2 || load.factor > 5) {
    fail('"factor" must be a whole number from 2 to 5 for mode "repeat"');
  }
  console.log(`${load.task} repeat ${load.factor}`);
} else if (load.mode === 'busy') {
  if (typeof load.seconds !== 'number' || load.seconds < 1 || load.seconds > 3600) {
    fail('"seconds" must be from 1 to 3600 for mode "busy"');
  }
  console.log(`${load.task} busy ${load.seconds}`);
} else {
  fail('"mode" must be "repeat" or "busy"');
}
