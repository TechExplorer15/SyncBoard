/**
 * Babel configuration for Jest test environment only.
 * Transforms ESM-only packages (like fractional-indexing) to CJS
 * so Jest can require() them.
 *
 * This does NOT affect production runtime — Node.js 22 handles
 * ESM require() natively. This is only needed for Jest's module system.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
};
