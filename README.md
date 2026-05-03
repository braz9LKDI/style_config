# Style config

My personal code-style baselines, organized by **stack**. Each top-level folder is a self-contained kit: copy the whole folder into a new project, install the dependencies, done. No cross-stack references, no cherry-picking from multiple folders.

## Philosophy

- **Formatting is not a discussion**: Prettier (or `latexindent` for LaTeX) decides. I never hand-tune whitespace, quote style or line breaks.

- **Lint what matters**: ESLint / Stylelint / html-validate / markdownlint / ChkTeX catch real bugs and enforce naming conventions, not stylistic trivia the formatter already owns.

- **Per-project configs**: each repo carries its own config files so CI, Git hooks and teammates all see the same rules. No global editor dependency.

- **Format on save**: feedback is instant. If a file is wrong on disk, the tools tell me before I commit.

- **Self-contained stacks**: every config in a stack folder consumes only siblings of that same folder. No `web/foo` referencing `markdown/bar`. Copy one folder, get a complete kit.

## Stacks

|               stack               |           languages            |                          tools                           |
| :-------------------------------: | :----------------------------: | :------------------------------------------------------: |
|      [`web/`](web/README.md)      |  HTML, CSS, JavaScript, JSON   | Prettier, ESLint, Stylelint, html-validate, EditorConfig |
| [`markdown/`](markdown/README.md) | Markdown (notes, blogs, docs)  |           Prettier, markdownlint, EditorConfig           |
|    [`latex/`](latex/README.md)    | LaTeX (papers, theses, slides) |               latexindent, ChkTeX, latexmk               |

Each stack folder ships:

- All the config files (`.editorconfig`, `.prettierrc.json`, `eslint.config.js`, etc.).

- A `.vscode/` folder wiring format-on-save and lint-on-save to those configs.

- A `package.sample.json` (or `Makefile` for LaTeX) with the npm scripts and `devDependencies` to merge into your project.

- A stack-level `README.md` explaining what is in the box and how to adopt it.

- For `web/` and `markdown/`, a `docs/` subfolder with one detailed file per tool (per-rule explanations, before/after examples and override patterns).

## Adopting a stack

1. Pick the stack that matches the project. Most projects fit one cleanly:
    - A frontend or full-stack web app -> [`web/`](web/README.md).

    - A documentation repo, blog, or notebook -> [`markdown/`](markdown/README.md).

    - An academic paper or book -> [`latex/`](latex/README.md).

2. Copy the whole folder into the project root. The dotfile-aware copy is:

    ```bash
    cp -a style_config/<stack>/. /path/to/new-project/
    ```

3. Follow the stack's own README for the install steps. The shape is always the same:
    1. Merge `package.sample.json` into your `package.json` (or use the LaTeX `Makefile` directly).

    2. `npm install`.

    3. Install the recommended editor extensions when your editor prompts you.

    4. `npm run fix` to clean up the existing codebase.

    5. `npm run check` to verify.

## Mixing stacks

The stacks are independent but compatible. A real project occasionally needs more than one:

- A web app with a Markdown changelog and READMEs -> adopt `web/`, then drop `.markdownlint.jsonc` + `.markdownlintignore` from `markdown/` on top and add the `lint:md` script. Stack-level READMEs cover this.

- A docs site that ships JS / CSS code samples -> adopt `markdown/`, then borrow `eslint.config.js` and `.stylelintrc.json` from `web/`.

The shared bits (`.editorconfig`, `.prettierrc.json`) are byte-identical across `web/` and `markdown/`, so combining them never conflicts.

## Possible future stacks

Things I have not set up yet but might add later:

- **`node/`**: CLI tools / Node servers (JS + JSON, no HTML or CSS).

- **`typescript/`**: `web/` plus `typescript-eslint` and TS-aware Prettier wiring.

- **`python/`**: `ruff` + `black` + `editorconfig`.

- **`dotnet/`**: `.editorconfig` + `dotnet format` rules.

And cross-cutting niceties:

- Pre-commit hooks with [`husky`](https://typicode.github.io/husky) and [`lint-staged`](https://github.com/okonet/lint-staged) to block bad commits.

- A GitHub Actions workflow template per stack running `npm run check` (or `make check` for LaTeX).

## Bonus: personal global-ish defaults

The per-project approach above is what teams and CI need. **Solo scratch-coding** is different, when working in a throwaway directory under `~/projects/` or `~/code/`, copying a whole stack folder is overkill. The root-level [.prettierrc.json](.prettierrc.json) and [.editorconfig](.editorconfig) are the lightweight fallback pair to drop into a parent directory above scratch work: Prettier handles formatter choices, EditorConfig handles editor whitespace basics.

Good locations:

- **`~/<workroot>/`**: a parent directory of scratch projects, for example `~/code/.prettierrc.json` plus `~/code/.editorconfig`. Both tools search upward from the file being edited or formatted.

- **`~/.editorconfig`**: a home-wide EditorConfig fallback. Use this only if you want those whitespace defaults across files under your home directory.

Prettier intentionally has no true global config, so the parent-directory `.prettierrc.json` is a personal scratch-work convention, not a replacement for project config. Per-project configs **always win**: closer Prettier configs are found first, and stack-level `.editorconfig` files use `root = true` to stop editor lookup above the project.
