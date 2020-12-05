// Source: https://jestjs.io/docs/en/configuration#testsequencer-string
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Run tests in alphabetical order
    // (this is done so the ~testCleanup.test.js file runs last)
    const copyTests = Array.from(tests);
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
  }
}

module.exports = CustomSequencer;