/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.js'],
  testTimeout: 15000,
  verbose: true,

  /**
   * fractional-indexing is ESM-only (uses `export`).
   * By default Jest ignores node_modules from transforms.
   * This pattern says: "ignore all node_modules EXCEPT fractional-indexing".
   * babel-jest (bundled with Jest) will then transform it to CJS.
   */
  transformIgnorePatterns: [
    '/node_modules/(?!fractional-indexing/)',
  ],
};
