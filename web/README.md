# `web/` (Web stack)

Self-contained code-style kit for projects that mix HTML, CSS, JavaScript and JSON. Drop the whole folder into a new project root, install dependencies, done. Every config file in this folder is consumed by another file in this folder, no cross-stack references.

## Contents

|                  file                  |                         tool                          |
| :------------------------------------: | :---------------------------------------------------: |
|            `.editorconfig`             |    EditorConfig (encoding / EOL / indent baseline)    |
| `.prettierrc.json` + `.prettierignore` |      Prettier (JS / CSS / HTML / JSON formatter)      |
|           `eslint.config.js`           |          ESLint flat config (JS correctness)          |
|          `.stylelintrc.json`           |         Stylelint (CSS correctness + naming)          |
|          `.htmlvalidate.json`          |        html-validate (HTML correctness + a11y)        |
|        `.vscode/settings.json`         |         Format-on-save + lint-on-save wiring          |
|       `.vscode/extensions.json`        |       Extension recommendations (auto-prompted)       |
|         `package.sample.json`          | `scripts` + `devDependencies` to merge into your repo |

## Adopting this stack

1. Copy the folder into the new project's root:

    ```bash
    cp -a style_config/web/. /path/to/new-project/
    ```

    > The `.` after `web/` matters, it copies hidden dotfiles too.

2. Merge `package.sample.json` into your project's `package.json`. If there is no `package.json` yet, run `npm init -y` first.

3. Install dependencies:

    ```bash
    npm install
    ```

4. Install the recommended editor extensions (your editor will prompt on first open).

5. Reformat any existing code in one go:

    ```bash
    npm run fix
    ```

6. Verify:

    ```bash
    npm run check
    ```

## Scripts

After merging `package.sample.json`:

|         script         |                        what does it do?                        |
| :--------------------: | :------------------------------------------------------------: |
|    `npm run format`    |    Rewrite every supported file with Prettier (`--write`).     |
| `npm run format:check` |   Fail if anything is not Prettier-clean (CI / pre-commit).    |
|   `npm run lint:js`    |                      ESLint on JS files.                       |
|   `npm run lint:css`   |                    Stylelint on CSS files.                     |
|  `npm run lint:html`   |                  html-validate on HTML files.                  |
|     `npm run lint`     |                All three linters sequentially.                 |
|     `npm run fix`      | Prettier + `eslint --fix` + `stylelint --fix`. The big hammer. |
|    `npm run check`     |          `format:check` + `lint`. What CI should run.          |

## Per-tool details

For per-rule explanations, before/after examples and override patterns, see the docs:

- [`docs/editorconfig.md`](./docs/editorconfig.md): EditorConfig.

- [`docs/prettier.md`](./docs/prettier.md): Prettier (formatter for everything).

- [`docs/eslint.md`](./docs/eslint.md): ESLint (JS rules).

- [`docs/stylelint.md`](./docs/stylelint.md): Stylelint (CSS rules).

- [`docs/html-validate.md`](./docs/html-validate.md): html-validate (HTML correctness).

- [`docs/vscode.md`](./docs/vscode.md): VS Code workspace settings.

## Common per-project tweaks

After copying, most projects need some or all of these adjustments:

- Extend `.prettierignore` with build outputs (`dist/`, `build/`, `public/`, `.next/`, etc.) and any minified or vendored files.

- Add a `files` block in `eslint.config.js` for environments the kit does not know about (tests, web workers, service workers, edge functions and TypeScript).

- Loosen `selector-class-pattern` in `.stylelintrc.json` for BEM (`block__element--modifier`) or CSS Modules (`camelCase`).

- Disable `void-style` in `.htmlvalidate.json` if you prefer `<br>` over `<br />`.

## Stripping it down

If your project has only a subset of these languages:

- **No HTML:** delete `.htmlvalidate.json`, the `lint:html` script in `package.json` and `html-validate` from `devDependencies`. Drop the html-validate extension from `.vscode/extensions.json`.

- **No CSS:** delete `.stylelintrc.json`, the `lint:css` script, the `stylelint*` keys in `.vscode/settings.json` (`source.fixAll.stylelint` and `stylelint.validate`) and the Stylelint deps and extension.

- **No JS:** delete `eslint.config.js`, the `lint:js` script, the `eslint*` keys in `.vscode/settings.json` and the ESLint deps and extension.

## Markdown in a web project

This stack does not lint Markdown, Prettier still formats `*.md` files (so READMEs and CHANGELOGs stay tidy), but no markdownlint structure rules. If you want Markdown linting on top, copy `.markdownlint.jsonc` and `.markdownlintignore` from [`/markdown/`](/markdown/) and add the `lint:md` script and `markdownlint-cli2` dep manually. The two stacks are otherwise compatible.
