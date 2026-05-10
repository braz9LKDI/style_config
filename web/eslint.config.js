import js from "@eslint/js";
import globals from "globals";


export default [
  {
    ignores: [
      "node_modules/",
    ],
  },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
    ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      camelcase: ["error", { properties: "never" }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "no-implicit-globals": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-param-reassign": "error",
      "no-shadow": "error",
      "consistent-return": "error",
    },
  },
  {
    files: ["scripts/**/*.js", "*.config.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      camelcase: ["error", { properties: "never" }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-param-reassign": "error",
      "no-shadow": "error",
    },
  },
];
