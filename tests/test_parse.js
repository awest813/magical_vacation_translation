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

function testProcessSpecialCharacters() {
  console.log("Running testProcessSpecialCharacters...");

  // Test normal characters
  assert.strictEqual(processSpecialCharacters("abc"), "abc");

  // Test hex escapes
  assert.strictEqual(processSpecialCharacters("\\8e"), String.fromCharCode(0x8e));
  assert.strictEqual(processSpecialCharacters("\\00"), String.fromCharCode(0x00));
  assert.strictEqual(processSpecialCharacters("\\ff"), String.fromCharCode(0xff));

  // Test newlines (should be ignored)
  assert.strictEqual(processSpecialCharacters("a\nb\nc"), "abc");

  // Test alignment character '|'
  assert.strictEqual(processSpecialCharacters("|"), String.fromCharCode(0x101));

  // Test reset alignment character '`'
  assert.strictEqual(processSpecialCharacters("`"), String.fromCharCode(0x102));

  // Test mixed input
  const input = "A\\8eB|C`D\nE";
  const expected = "A" + String.fromCharCode(0x8e) + "B" + String.fromCharCode(0x101) + "C" + String.fromCharCode(0x102) + "DE";
  assert.strictEqual(processSpecialCharacters(input), expected);

  console.log("testProcessSpecialCharacters passed!");
}

try {
  testComputeWidth();
  testProcessSpecialCharacters();
  console.log("All tests passed!");
} catch (err) {
  console.error("Test failed!");
  console.error(err);
  process.exit(1);
}
