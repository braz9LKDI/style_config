# ESLint

ESLint owns **what code does**, not what it looks like. Prettier already handles whitespace, semicolons and quotes (see [`./prettier.md`](./prettier.md)); ESLint enforces real rules: `===` over `==`, no `var`, no implicit globals and consistent return types.

This config uses ESLint's **flat config** (the format introduced in ESLint v9; the legacy `.eslintrc.*` cascade is no longer supported).

## Contents

|        file        | purpose                                                 |
| :----------------: | :------------------------------------------------------ |
| `eslint.config.js` | Flat config: ignore globs + browser block + Node block. |

## Where does it go?

Project root:

```text
eslint.config.js
```

> The filename **must** be exactly `eslint.config.js` (or `.mjs` / `.cjs`). ESLint v9+ does not auto-discover other names.

## Tool

[ESLint][eslint] runs as an `npm` package and as the [`dbaeumer.vscode-eslint`][ext-eslint] editor extension.

Install:

```bash
npm install --save-dev eslint @eslint/js globals
```

Editor flag (already in [`../.vscode/settings.json`](../.vscode/settings.json)):

```json
"eslint.useFlatConfig": true
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|      script       | what does it do?                                                |
| :---------------: | :-------------------------------------------------------------- |
| `npm run lint:js` | Run ESLint on every JS file.                                    |
|   `npm run fix`   | Prettier + `eslint --fix` + `stylelint --fix` (the big hammer). |

## Anatomy of the config

```js
import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["node_modules/"] },      // 1. ignore globs
    js.configs.recommended,              // 2. ESLint's "recommended" preset
    { files: ["js/**/*.js"], ... },      // 3. browser block
    { files: ["scripts/**/*.js", ...] }, // 4. Node block
];
```

Flat config is a plain array. Each object is a "config block" with optional `files`, `ignores`, `languageOptions`, `rules` and so on. **Later blocks override earlier ones for files they match**.

### Why two `files` blocks?

Different environments need different globals.

- A browser script can use `document`, `window`, `fetch`, `localStorage`, etc.

- A build script can use `process`, `__dirname`, `require`, `module`, etc.

Mixing them silently masks bugs (`process` in a browser script that ships to production fails at runtime). Splitting by `files` glob lets ESLint flag the wrong globals as `no-undef` errors.

```js
// 3. Browser scripts (client-side JS)
{
    files: ["js/**/*.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: { ...globals.browser }, // Document, window, fetch, ...
    },
    rules: { ... },
},

// 4. Node scripts (build scripts)
{
    files: ["scripts/**/*.js", "*.config.js", "eslint.config.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: { ...globals.node }, // Process, __dirname, ...
    },
    rules: { ... },
},
```

## Rule-by-rule

All rules in this config are at `error` severity unless noted. Errors fail CI; warnings do not.

### `camelcase: ["error", { properties: "never" }]`

Identifiers must be camelCase. Object properties are exempt because external APIs often use snake_case.

```js
// Bad
const user_id = 1;

// Good
const userId = 1;

// Good (properties are not enforced)
fetch("/api", { body: JSON.stringify({ user_id: 1, full_name: "Ada" }) });
```

### `eqeqeq: ["error", "always"]`

Use `===` / `!==`, never `==` / `!=`. The loose equality operator does silent type coercion that almost always hides bugs.

```js
// Bad
if (x == null) { ... }
0 == "0"   // -> true (!)
[] == false // -> true (!)

// Good
if (x === null || x === undefined) { ... }
```

### `curly: ["error", "all"]`

Always use braces, even for one-line bodies. Prevents the [Apple `goto fail`](https://en.wikipedia.org/wiki/Unreachable_code#goto_fail_bug) class of bug.

```js
// Bad
if (cond) doThing();
if (cond) doThing();

// Good
if (cond) {
    doThing();
}
```

### `no-var: "error"` + `prefer-const: "error"`

`var` is hoisted and function-scoped, practically always wrong. `let` is block-scoped; `const` is `let` plus immutability of the binding.

```js
// Bad
var x = 1;
let y = 2; // Never reassigned

// Good
const x = 1;
let z = 0;
z += 1; // `y` was const but reassigned: error
```

### `prefer-template: "error"`

Use template literals instead of `+` concatenation.

```js
// Bad
const msg = "Hello, " + name + "!";

// Good
const msg = `Hello, ${name}!`;
```

### `object-shorthand: "error"`

Use shorthand syntax for object properties and methods.

```js
// Bad
const obj = {
    name: name,
    greet: function () {
        return `Hi, ${this.name}`;
    },
};

// Good
const obj = {
    name,
    greet() {
        return `Hi, ${this.name}`;
    },
};
```

### `no-implicit-globals: "error"` (browser block only)

In script (non-module) context, top-level `var` / `function` declarations leak onto `window`. Modules do not have this problem, but the rule is cheap insurance.

```js
// Bad (leaks `helper` onto window in a non-module <script>)
function helper() { ... }

// Good (explicit)
export function helper() { ... }
```

### `no-unused-vars: ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`

Unused variables / parameters are an error. Prefix with `_` to mark them intentionally unused (common when a callback receives more parameters than you need).

```js
// Bad
function handler(req, res) {
    return "ok"; // `req` and `res` both unused
}

// Good
function handler(_req, _res) {
    return "ok";
}

// Good (only `req` is unused)
function handler(_req, res) {
    res.send("ok");
}
```

### `no-console: ["warn", { allow: ["warn", "error"] }]` (browser block only)

`console.log` warns; `console.warn` and `console.error` are allowed. The intent: leave warnings/errors in production, but flag debug logs that slipped in.

```js
console.log("debug"); // Warn
console.warn("deprecated!"); // Ok
console.error(err); // Ok
```

### `no-param-reassign: "error"`

Never mutate function parameters. Pure functions are easier to reason about.

```js
// Bad
function addTax(price) {
    price = price * 1.21; // Mutates the caller's binding semantics
    return price;
}

// Good
function addTax(price) {
    return price * 1.21;
}
```

### `no-shadow: "error"`

A variable declared in an inner scope must not have the same name as one in an enclosing scope.

```js
const value = 1;

// Bad
function f(value) {
    return value + 1;
}

// Good
function f(input) {
    return input + 1;
}
```

### `consistent-return: "error"` (browser block only)

Either every code path returns a value or none does. Catches the case where one branch forgets to return.

```js
// Bad
function lookup(id) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    cache.set(id, fetchFromDb(id)); // No return -> undefined
}

// Good
function lookup(id) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    const value = fetchFromDb(id);
    cache.set(id, value);
    return value;
}
```

### What `--fix` will and will not auto-apply

`eslint --fix` (run by `npm run fix`) handles mechanical rewrites:

|        rule         | auto-fixable? |
| :-----------------: | :-----------: |
|   `prefer-const`    |      yes      |
|      `no-var`       |      yes      |
|  `prefer-template`  |      yes      |
| `object-shorthand`  |      yes      |
|      `eqeqeq`       |      yes      |
|       `curly`       |      yes      |
|     `camelcase`     |    **no**     |
|  `no-unused-vars`   |    **no**     |
| `consistent-return` |    **no**     |

Manual fixes are usually identifier renames (`user_id` -> `userId`) that you should do yourself with a refactor tool.

## Adding a new `files` block

Common cases your project may need:

### Test files (Jest / Vitest globals)

```js
import globals from "globals";

// Add to the array exported from eslint.config.js:
{
    files: ["test/**/*.js", "**/*.test.js", "**/*.spec.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: { ...globals.node, ...globals.jest },
    },
    rules: {
        "no-unused-expressions": "off",   // Chai assertions: expect(x).to.be.true
    },
},
```

### Web Workers / Service Workers

```js
{
    files: ["js/workers/**/*.js"],
    languageOptions: {
        globals: { ...globals.worker, ...globals.serviceworker },
    },
},
```

### TypeScript

Add `typescript-eslint`:

```bash
npm install --save-dev typescript-eslint
```

```js
import tseslint from "typescript-eslint";

export default [
    ...tseslint.configs.recommended,
    // Existing blocks...
];
```

## When do these files need to be edited?

- Add a new `files` block whenever a new environment (tests, workers, edge functions, etc.) appears.

- Add a rule to the `rules: {}` block whenever you find a real bug class that ESLint can detect. **Do not** add stylistic rules, Prettier owns those.

[eslint]: https://eslint.org
[ext-eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
