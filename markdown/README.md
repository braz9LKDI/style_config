# `markdown/`

Self-contained code-style kit for Markdown writing projects: notes, blog posts, documentation sites, knowledge bases, README-only repos. Drop the whole folder into a new project root, install dependencies, done. No JavaScript, no CSS, no HTML, just Markdown plus the editor wiring to keep it consistent.

## Contents

|                  file                  |                         tool                          |
| :------------------------------------: | :---------------------------------------------------: |
|            `.editorconfig`             |    EditorConfig (encoding / EOL / indent baseline)    |
| `.prettierrc.json` + `.prettierignore` |         Prettier (Markdown / JSON formatter)          |
|         `.markdownlint.jsonc`          |        markdownlint (Markdown structure rules)        |
|         `.markdownlintignore`          |          Files / globs the linter must skip           |
|        `.vscode/settings.json`         |        Format-on-save + markdownlint auto-fix         |
|       `.vscode/extensions.json`        |       Extension recommendations (auto-prompted)       |
|         `package.sample.json`          | `scripts` + `devDependencies` to merge into your repo |

## Adopting this stack

1. Copy the folder into the new project's root: `cp -a style_config/markdown/. <project_root>`

    > The `.` after `markdown/` matters, it copies hidden dotfiles too.

2. Merge `package.sample.json` into your project's `package.json`. If there is no `package.json` yet, run `npm init -y` first.

3. Install dependencies: `npm install`

4. Install the recommended editor extensions (your editor will prompt on first open).

5. Reformat and lint any existing Markdown: `npm run fix`

6. Verify: `npm run check`

## Scripts

After merging `package.sample.json`:

|         script         | what does it do?                                                  |
| :--------------------: | :---------------------------------------------------------------- |
|    `npm run format`    | Rewrite every `.md` (and `.json`) file with Prettier (`--write`). |
| `npm run format:check` | Fail if anything is not Prettier-clean (CI / pre-commit).         |
|   `npm run lint:md`    | markdownlint on every `.md`.                                      |
|     `npm run lint`     | Same as `lint:md` (only one linter in this stack).                |
|     `npm run fix`      | Prettier + `markdownlint --fix`. The big hammer.                  |
|    `npm run check`     | `format:check` + `lint`. What CI should run.                      |

## Per-tool details

For per-rule explanations, before/after examples and override patterns, see the docs:

- [`docs/editorconfig.md`](./docs/editorconfig.md): EditorConfig.

- [`docs/prettier.md`](./docs/prettier.md): Prettier (formatter).

- [`docs/markdownlint.md`](./docs/markdownlint.md): markdownlint (structure rules).

- [`docs/vscode.md`](./docs/vscode.md): VS Code workspace settings.

## Common per-project tweaks

- Extend `.markdownlintignore` with generated docs (`docs/api/`), vendored content (`CHANGELOG.md`, `LICENSE.md`), or anything copied verbatim from elsewhere.

- Disable `MD024` ("no duplicate headings") if you write changelogs that repeat `## [version]` headings.

- Whitelist HTML elements via `MD033.allowed_elements` if you use `<details>` / `<summary>` / `<kbd>` blocks.

## What is out of scope?

- **Static-site generators** (Astro, Hugo, Jekyll, MkDocs, Docusaurus, etc.): this kit only handles the `.md` source files, not their build pipelines. The configs are framework-agnostic; layer your SSG on top.

- **Frontmatter linting**: `markdownlint` ignores YAML frontmatter by default, which is what you usually want. If you need YAML schema validation, add a separate tool (e.g. `ajv-cli`).

- **Prose grammar / style**: not in scope. If you want grammar checking, add [Vale](https://vale.sh) on top.

## Need code linting too?

If your "Markdown project" is actually a docs site that ships JS or CSS examples, copy what you need from [`/web/`](/web/):

- `eslint.config.js` + `lint:js` script + ESLint deps for code samples.

- `.stylelintrc.json` + `lint:css` script + Stylelint deps for CSS samples.

The two stacks share Prettier and EditorConfig, so they layer cleanly.
