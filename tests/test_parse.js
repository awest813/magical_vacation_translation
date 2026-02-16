const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Shim for glossary if needed by other functions in parse.js
global.glossary = {};

const code = fs.readFileSync(path.join(__dirname, '../tools/lib/parse.js'), 'utf8');
eval(code);

function testComputeWidth() {
  console.log("Running testComputeWidth...");

  // Test happy path: known characters
  const widthA = computeWidth("A");
  console.log(`- Width of 'A': ${widthA}`);
  assert.strictEqual(widthA, 7, "Width of 'A' should be 7");

  const widthSpace = computeWidth(" ");
  console.log(`- Width of ' ': ${widthSpace}`);
  assert.strictEqual(widthSpace, 3, "Width of ' ' should be 3");

  // Test string with multiple characters
  const widthABC = computeWidth("ABC");
  console.log(`- Width of 'ABC': ${widthABC}`);
  // 'A'=7, 'B'=6, 'C'=6
  assert.strictEqual(widthABC, 7 + 6 + 6, "Width of 'ABC' should be 19");

  // Test edge case: unknown characters
  const unknownChar = "\x01";
  const widthUnknown = computeWidth(unknownChar);
  console.log(`- Width of unknown char '\\x01': ${widthUnknown}`);

  // We expect this to be 0 after our fix.
  // Currently it will be NaN, so this assertion will fail.
  assert.strictEqual(widthUnknown, 0, "Width of unknown character should be 0");

  console.log("testComputeWidth passed!");
}

try {
  testComputeWidth();
  console.log("All tests passed!");
} catch (err) {
  console.error("Test failed!");
  console.error(err);
  process.exit(1);
}
