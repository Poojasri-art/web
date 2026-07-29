const Mocha = require('mocha');
const path = require('path');

const mocha = new Mocha();
mocha.addFile(path.join(__dirname, 'vulnerability.test.js'));

try {
  mocha.loadFiles();
  const suite = mocha.suite;

  let count = 0;
  function countTests(s) {
    count += s.tests.length;
    s.suites.forEach(countTests);
  }
  countTests(suite);

  console.log('TOTAL EXECUTABLE VULNERABILITY TEST CASES:', count);

  if (count === 300) {
    console.log('✅ Validator: Test count is exactly 300. Validation passed!');
    process.exit(0);
  } else {
    console.error(`❌ Validator: Test count is ${count}, expected exactly 300. Validation failed!`);
    process.exit(1);
  }
} catch (e) {
  console.error('❌ Validator encountered error while loading tests:', e.message);
  process.exit(1);
}
