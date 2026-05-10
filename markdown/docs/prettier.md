# Prettier

Prettier owns formatting for every supported file in this stack: Markdown and JSON. The rule of this kit: **never hand-tune whitespace, line breaks, or table layout**, Prettier decides.

## Contents

|        file        | purpose                                                             |
| :----------------: | :------------------------------------------------------------------ |
| `.prettierrc.json` | Per-project formatting options (line width, indent and prose wrap). |
| `.prettierignore`  | Glob list of files Prettier must skip (lockfiles and builds).       |

## Where does it go?

Project root:

```text
.prettierrc.json
.prettierignore
```

## Tool

[Prettier][prettier] runs as an `npm` package and as the [`esbenp.prettier-vscode`][ext-prettier] editor extension. The extension reads the same `.prettierrc.json`, so CLI and editor stay in sync.

Install:

```bash
npm install --save-dev prettier
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|         script         | what does it do?                                          |
| :--------------------: | :-------------------------------------------------------- |
|    `npm run format`    | Rewrite every supported file with Prettier (`--write`).   |
| `npm run format:check` | Fail if anything is not Prettier-clean (CI / pre-commit). |

## What does it enforce?

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "bracketSpacing": true,
    "endOfLine": "lf",
    "proseWrap": "preserve"
}
```

## Why so few options?

Prettier ships ~20 formatting options. Most apply to JavaScript, TypeScript, CSS or HTML, none of which exist in this stack. Options like `semi`, `singleQuote`, `quoteProps`, `trailingComma`, `arrowParens`, `bracketSameLine` and `htmlWhitespaceSensitivity` are silently ignored when Prettier processes `.md` or `.json` files, so listing them in this stack's `.prettierrc.json` would only be misleading.

The six options above are the only ones that change anything in a Markdown-only project. If you later add JS / CSS / HTML to the project (e.g. you are writing a docs site that ships code samples), grab the full `.prettierrc.json` from [`/web/`](/web/) instead of patching this one.

## Option-by-option

### `tabWidth: 4` + `useTabs: false`

4-space indentation, never tabs. Matches [`../.editorconfig`](../.editorconfig).

In Markdown specifically, this controls:

- Nested-list indentation (each nesting level = 4 spaces).

- Indentation inside fenced code blocks that appear inside lists.

In JSON, the indent unit at every key/value level.

### `bracketSpacing: true`

Spaces inside object literals, affects how Prettier formats `.json` files:

```json
{ "foo": 1 } // Good (default)
{"foo": 1}   // Bad -> rewritten
```

### `endOfLine: "lf"`

Unix line endings on every platform. Matches [`../.editorconfig`](../.editorconfig).

### `proseWrap: "preserve"`

Keep the wrapping the author wrote. Prettier will not reflow paragraphs, and it aligns column padding inside Markdown tables so they stay visually aligned. Under `"never"` Prettier collapses table columns to the minimum width.

The alternatives:

- `"always"`: wrap every paragraph at `printWidth`. Pretty when you author, ugly to diff every time a word in the middle of a paragraph changes.

- `"never"`: collapse every paragraph onto one source line. Cleaner prose diffs, but rewrites hand-aligned tables into compact form, which is unacceptable here.

## `.prettierignore`

```gitignore
node_modules
package-lock.json
```

What it skips by default:

- `node_modules/`: third-party code, never our concern.

- `package-lock.json`: managed by `npm` itself; reformatting breaks `npm ci`.

### When do these files need to be extended?

Almost every real Markdown project needs a few more entries. Common additions:

```gitignore
# Static-site generator output (Astro, Hugo, Jekyll, MkDocs, Docusaurus, ...)
_site/
public/
dist/
build/
site/

# Auto-generated content (e.g. API reference from a code repo)
docs/api/

# CHANGELOG (managed by tooling like changesets / release-please)
CHANGELOG.md

# Vendored / mirrored docs
vendor/
third_party/
```

## When do these files need to be edited?

- `.prettierrc.json`: rarely. Changing `tabWidth` is fine; everything else has a deliberate reason and changing it churns the entire codebase. Run `npm run format` immediately after any change.

- `.prettierignore`: per-project tweaks are normal. Add generated files, vendored libraries and build outputs.

[prettier]: https://prettier.io
[ext-prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
