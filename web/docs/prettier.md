# Prettier

Prettier owns **what code looks like**, not what it does. ESLint, Stylelint and html-validate catch real bugs (see [`./eslint.md`](./eslint.md), [`./stylelint.md`](./stylelint.md), [`./html-validate.md`](./html-validate.md)); Prettier handles every byte of whitespace, every quote, every line break. The rule of this kit: **never hand-tune formatting**, Prettier decides.

Out of the box, this config formats JavaScript, CSS, HTML, JSON and Markdown. No plugins required.

## Contents

|        file        | purpose                                                         |
| :----------------: | :-------------------------------------------------------------- |
| `.prettierrc.json` | Per-project formatting options (line width, indent and quotes). |
| `.prettierignore`  | Glob list of files Prettier must skip (lockfiles and builds).   |

## Where does it go?

Project root:

```text
.prettierrc.json
.prettierignore
```

> Prettier auto-discovers any of `.prettierrc`, `.prettierrc.json`, `.prettierrc.yaml`, `prettier.config.js` or a `prettier` key in `package.json`. Stick to one. The `.json` form is the cheapest to parse and the easiest to diff.

## Tool

[Prettier][prettier] runs as an `npm` package and as the [`esbenp.prettier-vscode`][ext-prettier] editor extension. The extension reads the same `.prettierrc.json`, so CLI and editor stay in sync.

Install:

```bash
npm install --save-dev prettier
```

Editor wiring (already in [`../.vscode/settings.json`](../.vscode/settings.json)):

```json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode"
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|         script         | what does it do?                                          |
| :--------------------: | :-------------------------------------------------------- |
|    `npm run format`    | Rewrite every supported file with Prettier (`--write`).   |
| `npm run format:check` | Fail if anything is not Prettier-clean (CI / pre-commit). |
|     `npm run fix`      | Prettier + `eslint --fix` + `stylelint --fix`.            |

## What does it enforce?

```json
{
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": false,
    "quoteProps": "as-needed",
    "trailingComma": "all",
    "bracketSpacing": true,
    "bracketSameLine": false,
    "arrowParens": "always",
    "endOfLine": "lf",
    "htmlWhitespaceSensitivity": "css"
}
```

Most of these match Prettier's own defaults; they are restated here so the file documents intent rather than relying on whatever the installed Prettier version happens to default to. The only deliberate deviation is `printWidth: 100` (Prettier's default is 80).

## Option-by-option

### `printWidth: 100`

Prettier tries to keep lines at or below 100 characters. It is a **soft** target, not a hard limit: a 200-character string literal is left alone. The number controls when Prettier picks a multi-line layout over a single-line one.

```js
// Fits in 100 cols, single line
const user = { id: 1, name: "Ada", email: "ada@example.com" };

// Over 100 cols, broken across lines
const user = {
    id: 1,
    name: "Ada Lovelace",
    email: "ada.lovelace@example.com",
    role: "admin",
};
```

The ecosystem default is 80. 100 reads better on modern wide monitors and avoids the worst Prettier-induced line-noise (callback chains broken at every dot).

### `tabWidth: 2` + `useTabs: false`

2-space indentation, never tabs. Matches [`../.editorconfig`](../.editorconfig).

In JS / CSS / HTML / JSON this is the indent unit at every nested level. In Markdown it controls nested-list indentation and code-block indentation inside lists.

### `semi: true`

Always emit JS semicolons.

```js
// Bad (semi: false)
const x = 1;
const y = 2;

// Good (semi: true)
const x = 1;
const y = 2;
```

ASI (automatic semicolon insertion) has subtle traps with leading `[` and `(`. Always-semis is the boring, safe choice.

### `singleQuote: false`

Use double quotes for JS strings.

```js
// Bad
const greeting = "hello";

// Good
const greeting = "hello";
```

JSX attributes, JSON values and HTML attributes are double-quoted by spec, so this keeps JS consistent with the rest of the stack.

### `quoteProps: "as-needed"`

Only quote object property keys that actually require quoting (reserved word, hyphen, dot, contains a space).

```js
// Bad
const obj = {
    name: "Ada",
    id: 1,
    "data-id": 7,
};

// Good
const obj = {
    name: "Ada",
    id: 1,
    "data-id": 7, // Quoted: hyphen is not valid in a bare identifier
};
```

The alternatives are `"consistent"` (quote all if any need quoting) and `"preserve"` (keep whatever the author wrote). `"as-needed"` produces the least visual noise.

### `trailingComma: "all"`

Trailing comma after every multi-line list element, including function parameters (ES2017+).

```js
// Bad
const items = ["a", "b", "c"];

// Good
const items = ["a", "b", "c"];

function f(a, b, c) {}
```

Cleaner diffs (adding a new item touches one line, not two) and lets you reorder lines without comma-juggling.

### `bracketSpacing: true`

Spaces inside object literals.

```js
// Bad
const o = { foo: 1 };

// Good
const o = { foo: 1 };
```

Affects `.json` formatting too:

```json
{ "foo": 1 }
```

### `bracketSameLine: false`

In multi-line HTML / JSX, the closing `>` goes on its own line.

```jsx
// Bad (bracketSameLine: true)
<button
    type="button"
    onClick={handleClick}>
    Save
</button>

// Good (bracketSameLine: false)
<button
    type="button"
    onClick={handleClick}
>
    Save
</button>
```

Same idea for HTML attributes that overflow `printWidth`.

### `arrowParens: "always"`

Parens around the single argument of an arrow function.

```js
// Bad
const double = (x) => x * 2;

// Good
const double = (x) => x * 2;
```

Two extra characters, but adding a type annotation, default value or second parameter no longer requires inserting parens, which means cleaner diffs.

### `endOfLine: "lf"`

Unix line endings on every platform. Matches [`../.editorconfig`](../.editorconfig).

### `htmlWhitespaceSensitivity: "css"`

When formatting HTML, Prettier respects the CSS `display` value of each element:

- **Inline children** (`<span>`, `<a>`, `<strong>`): whitespace between them is significant, leave it alone.

- **Block children** (`<div>`, `<section>`, `<p>`): whitespace is non-significant, free to break onto new lines and indent.

```html
<!-- Inline children: kept on one line, leading/trailing space preserved -->
<p>Hello <strong>world</strong>!</p>

<!-- Block children: broken across lines, indented -->
<section>
    <h1>Title</h1>
    <p>Body</p>
</section>
```

The alternatives are `"strict"` (treat all whitespace as significant, ugly multi-line tags) and `"ignore"` (treat all whitespace as non-significant, breaks visual rendering of inline elements).

## `.prettierignore`

```gitignore
node_modules
package-lock.json
```

What it skips by default:

- `node_modules/`: third-party code, never our concern.

- `package-lock.json`: managed by `npm` itself; reformatting breaks `npm ci`.

### When do these files need to be extended?

Almost every real project needs more entries. Common additions:

```gitignore
# Build output
dist/
build/
out/
.next/
.nuxt/

# Static-site generator output
public/
_site/
.astro/

# Coverage and test reports
coverage/
.nyc_output/

# Auto-generated API reference
docs/api/

# CHANGELOG (managed by changesets / release-please)
CHANGELOG.md

# Vendored / mirrored code
vendor/
third_party/

# Minified files
**/*.min.js
**/*.min.css
```

## Per-project overrides

Most projects do not need to change anything. The defaults are tuned for general web work. A few patterns come up often:

### Per-glob option overrides

Prettier supports an `overrides` array for per-glob options:

```json
{
    "printWidth": 100,
    "overrides": [
        {
            "files": "*.md",
            "options": { "printWidth": 80, "proseWrap": "preserve" }
        },
        {
            "files": "*.{json,jsonc}",
            "options": { "trailingComma": "none" }
        }
    ]
}
```

Each override layers on top of the top-level options for files matching `files`.

### TypeScript

Prettier handles `.ts` and `.tsx` natively. No plugin, no extra config.

### Vue / Svelte / Astro

Frameworks with custom file extensions need a plugin:

```bash
npm install --save-dev prettier-plugin-svelte
```

```json
{
    "plugins": ["prettier-plugin-svelte"]
}
```

Same pattern for `prettier-plugin-astro`. Vue 3 SFCs are supported natively.

### Tailwind class sorting

The official plugin sorts utility classes in a canonical order, eliminating bikeshedding about class order:

```bash
npm install --save-dev prettier-plugin-tailwindcss
```

```json
{
    "plugins": ["prettier-plugin-tailwindcss"]
}
```

## When do these files need to be edited?

- `.prettierrc.json`: rarely. Changing `printWidth` or `tabWidth` is fine; everything else has a deliberate reason and changing it churns the entire codebase. Run `npm run format` immediately after any change.

- `.prettierignore`: per-project tweaks are normal. Add generated files, vendored libraries and build outputs.

- **Do not** add formatting rules to ESLint or Stylelint. Prettier owns formatting; the linters own correctness.

[prettier]: https://prettier.io
[ext-prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
