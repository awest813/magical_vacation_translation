const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock glossary
global.glossary = {
  "TEST": "TestValue"
};

const code = fs.readFileSync(path.join(__dirname, '../tools/lib/parse.js'), 'utf8');
eval(code);

function testInsertLineBreaksFix() {
  console.log("Running testInsertLineBreaksFix...");

  // We utilize the fact that itemWidths and characterWidths are global and can be modified.
  // We'll set distinct widths for index 0 and index 0x10.

  const originalItemWidths = [...itemWidths];
  const originalCharWidths = [...characterWidths];

  // Test \87 (Item)
  itemWidths[16] = 1000; // Index 0x10
  itemWidths[0] = 1;     // Index 0x00

  const inputItem = "Start \\8710 End";
  // If parsed correctly (0x10), width adds 1000+18 > 160. Result should have newline.
  // If parsed incorrectly (0x00), width adds 1+18 < 160. Result should not have newline.

  const resultItem = insertLineBreaks(inputItem, "\n");
  assert.ok(resultItem.includes("\n"), "Should parse \\8710 as item 0x10 and trigger line break. Got: " + resultItem);

  // Test \86 (Character)
  // Ensure we don't go out of bounds (characterWidths is short)
  // characterWidths length is 34. Index 16 is fine.
  characterWidths[16] = 1000;
  characterWidths[0] = 1;

  const inputChar = "Start \\8610 End";
  const resultChar = insertLineBreaks(inputChar, "\n");
  assert.ok(resultChar.includes("\n"), "Should parse \\8610 as character 0x10 and trigger line break. Got: " + resultChar);

  // Restore
  for(let i=0; i<originalItemWidths.length; i++) itemWidths[i] = originalItemWidths[i];
  for(let i=0; i<originalCharWidths.length; i++) characterWidths[i] = originalCharWidths[i];

  console.log("testInsertLineBreaksFix passed!");
}

function testSubstituteMacrosFix() {
  console.log("Running testSubstituteMacrosFix...");

  // Suppress console.log for clean output, as these functions log errors
  const originalLog = console.log;
  console.log = function() {};

  try {
      // Test missing glossary entry
      const inputMissing = "$MISSING$";
      const resultMissing = substituteMacros(inputMissing);
      assert.strictEqual(resultMissing, inputMissing, "Should return original string if glossary entry missing");

      // Test malformed input (odd number of $)
      const inputMalformed = "$TEST";
      const resultMalformed = substituteMacros(inputMalformed);
      assert.strictEqual(resultMalformed, inputMalformed, "Should return original string if '$' is missing");
  } finally {
      console.log = originalLog;
  }

  // Test successful substitution
  const inputSuccess = "Value is $TEST$.";
  const resultSuccess = substituteMacros(inputSuccess);
  assert.strictEqual(resultSuccess, "Value is TestValue.", "Should substitute correctly");

  console.log("testSubstituteMacrosFix passed!");
}

try {
  testInsertLineBreaksFix();
  testSubstituteMacrosFix();
  console.log("All fix verification tests passed!");
} catch (err) {
  console.error("Test failed!");
  console.error(err);
  process.exit(1);
}
