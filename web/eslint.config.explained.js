// Tool: https://www.npmjs.com/package/eslint
import js from '@eslint/js';
import globals from 'globals';

// Flat config is an ordered array. Later blocks override earlier blocks when
// their file globs match the same file
export default [
  {
    // Keep generated dependencies out of linting
    ignores: ['node_modules/'],
  },

  // ESLint's recommended baseline catches core JavaScript correctness issues,
  // such as undefined variables, unreachable code, and invalid syntax patterns
  js.configs.recommended,

  {
    // Browser code that is shipped to the client
    files: ['js/**/*.js'],
    languageOptions: {
      // Let ESLint understand the latest stable JavaScript syntax
      ecmaVersion: 'latest',

      // Treat files as ES modules instead of classic scripts
      sourceType: 'module',

      // Allow browser globals like window, document, fetch, and localStorage
      globals: { ...globals.browser },
    },
    rules: {
      // Enforce camelCase identifiers, but allow API object properties such as user_id
      camelcase: ['error', { properties: 'never' }],

      // Require === and !== to avoid implicit type coercion
      eqeqeq: ['error', 'always'],

      // Require braces for every if/else/for/while block
      curly: ['error', 'all'],

      // Prefer block-scoped let/const over function-scoped var
      'no-var': 'error',

      // Use const when a binding is never reassigned
      'prefer-const': 'error',

      // Prefer template literals over string concatenation
      'prefer-template': 'error',

      // Prefer { name } and method() shorthand in object literals
      'object-shorthand': 'error',

      // Guard against top-level declarations leaking onto window in script contexts
      'no-implicit-globals': 'error',

      // Unused names fail lint unless intentionally prefixed with underscore
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Warn on debug logs while allowing production-relevant warnings/errors
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Avoid mutating function parameters
      'no-param-reassign': 'error',

      // Avoid reusing variable names from outer scopes
      'no-shadow': 'error',

      // Require functions to either always return a value or never return one
      'consistent-return': 'error',
    },
  },

  {
    // Node-side scripts and config files
    files: ['scripts/**/*.js', '*.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      // Allow Node globals like process, Buffer, __dirname, and module
      globals: { ...globals.node },
    },
    rules: {
      // Same practical code-quality rules as browser files
      camelcase: ['error', { properties: 'never' }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-param-reassign': 'error',
      'no-shadow': 'error',
    },
  },
];
