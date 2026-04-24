# VS Code workspace settings

Editor wiring that turns "you have a config file" into "format-on-save and lint-on-save just work". The other configs in this stack (Prettier, ESLint, Stylelint and html-validate) define **what** the rules are; the `.vscode/` files make those rules fire automatically the moment a save hits disk.

## Contents

|           file            | purpose                                                   |
| :-----------------------: | :-------------------------------------------------------- |
|  `.vscode/settings.json`  | Workspace settings: format on save, code actions on save. |
| `.vscode/extensions.json` | Recommended extensions; the editor prompts you on open.   |

## Where does it go?

Project root, **as-is**:

```text
.vscode/settings.json
.vscode/extensions.json
```

Both files belong in the project repo and are committed to git. They configure the workspace, not the user, which is the whole point. When a teammate clones the repo, their editor adopts the same rules.

## What does `settings.json` do? Group by group

The file groups settings into five small clusters. The keys below are the actual setting names; the live file has them in plain JSON without comments.

### Save-time triggers

- `editor.formatOnSave` (`true`): the whole pipeline rests on this. Saving runs the file's default formatter before bytes hit disk.

- `editor.defaultFormatter` (`esbenp.prettier-vscode`): Prettier is the global fallback formatter. Other formatters are bound per-language in the "Per-language formatter binding" group.

If you ever want to format on paste or as you type, add `editor.formatOnPaste` and `editor.formatOnType`.

### Lint auto-fixers on save

- `editor.codeActionsOnSave`: a map of code-action IDs -> trigger mode.
    - `source.fixAll.eslint` (`"explicit"`): runs `eslint --fix` only on a manual save (`CTRL+s`), never on auto-save or focus-change.
    - `source.fixAll.stylelint` (`"explicit"`): same pattern for Stylelint.

The `"explicit"` mode avoids the old behavior where every blur or auto-save would mid-rewrite a file you were still editing.

**Order of operations on save:**

1. Prettier reformats the buffer (`editor.formatOnSave`).

2. ESLint and Stylelint apply their `--fix` rewrites (`editor.codeActionsOnSave`).

3. The file is written to disk.

### Whitespace mirror of [`../.editorconfig`](../.editorconfig)

These restate the same rules `EditorConfig` enforces, in case the EditorConfig extension is missing:

- `editor.insertSpaces` (`true`): tab key inserts spaces, not a tab character.

- `editor.tabSize` (`4`): the indent unit is 4 spaces.

- `files.eol` (`\n`): Unix line endings.

- `files.insertFinalNewline` (`true`): one trailing `\n` at EOF.

- `files.trimTrailingWhitespace` (`true`): strip trailing whitespace on save.

### Per-language formatter binding

A `[language]` block in `settings.json` overrides `editor.defaultFormatter` for that language only. The kit binds Prettier explicitly for `javascript`, `css`, `html`, `json` and `jsonc`.

Two reasons to do this even though Prettier is already the global default:

1. Some VS Code installations have multiple formatters registered for the same language (`vscode.json-language-features`, for example, registers itself as a JSON formatter). The `[json]` binding disambiguates so Prettier wins.

2. Future-proofs against extensions that try to claim a language by default.

### Linter wiring

- `eslint.useFlatConfig` (`true`): required for ESLint v9+ flat config (`eslint.config.js`). Without it the extension still hunts for the legacy `.eslintrc.*` cascade and reports "no config found".

- `eslint.validate`: the list of languages ESLint should lint. Default here: `["javascript"]`. Add `"typescript"` and `"typescriptreact"` for TS projects.

- `stylelint.validate`: same idea for Stylelint. Default: `["css"]`. Add `"scss"`, `"less"`, or `"postcss"` if the project uses them.

## What does `extensions.json` do?

A single `recommendations` array, five entries in this stack:

- `esbenp.prettier-vscode`.

- `dbaeumer.vscode-eslint`.

- `stylelint.vscode-stylelint`.

- `editorconfig.editorconfig`.

- `html-validate.vscode-html-validate`.

When a teammate first opens the workspace, VS Code shows a notification: "This workspace has extension recommendations." One click installs everything.

|              extension               | what does it wire up?                                                                          |
| :----------------------------------: | :--------------------------------------------------------------------------------------------- |
|       `esbenp.prettier-vscode`       | Reads [`../.prettierrc.json`](../.prettierrc.json), formats on save.                           |
|       `dbaeumer.vscode-eslint`       | Reads [`../eslint.config.js`](../eslint.config.js), shows squigglies, fixes on save.           |
|     `stylelint.vscode-stylelint`     | Reads [`../.stylelintrc.json`](../.stylelintrc.json), shows squigglies, fixes on save.         |
|     `editorconfig.editorconfig`      | Reads [`../.editorconfig`](../.editorconfig). VS Code does not honor `.editorconfig` natively. |
| `html-validate.vscode-html-validate` | Reads [`../.htmlvalidate.json`](../.htmlvalidate.json); problems-panel only.                   |

### Schema warning on third-party formatters

When you open `.vscode/settings.json`, the editor underlines `esbenp.prettier-vscode` (and friends) with `Value is not accepted`. This is harmless. VS Code ships a JSON schema with the names of **built-in** formatters; any third-party extension ID is "unknown" to that schema. The setting still works once the extension is installed.

## Per-project overrides

### TypeScript

Add `typescript` (and `typescriptreact` for `.tsx`) to `eslint.validate` and bind Prettier as the formatter for those languages too:

- extend `eslint.validate` to `["javascript", "typescript", "typescriptreact"]`.

- add a `[typescript]` and a `[typescriptreact]` block, each binding `esbenp.prettier-vscode` as the default formatter.

### SCSS / Less

Extend `stylelint.validate` to include `scss`, `less` and bind Prettier per-language for them.

### Vue / Svelte

Their own ecosystem extensions (`Vue.volar`, `svelte.svelte-vscode`) typically register themselves as the default formatter. Either bind them explicitly per-language, or keep Prettier as the formatter and add a Prettier plugin (`prettier-plugin-svelte`, etc.) to `package.json`.

### Auto-organize imports

Add `source.organizeImports: "explicit"` to `editor.codeActionsOnSave` to run the language server's "organize imports" code action on save.

## When do these files need to be edited?

- Add a `[language]` block whenever the project picks up a new language.

- Extend `eslint.validate` / `stylelint.validate` for new file types.

- **Do not** put rule-level configuration here. Editor settings belong in `.vscode/`; lint and format rules belong in their dedicated config files (`eslint.config.js`, `.stylelintrc.json`, etc.).
