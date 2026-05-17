# Style config

A compact set of formatting and linting baselines for everyday projects and scratch work.

The main idea is simple: keep the actual config files clean, keep commented `.explained` copies next to the configs that need explanation and avoid maintaining a second universe of Markdown docs.

## Core

- [`.prettierrc.json`](.prettierrc.json): global Prettier defaults for languages Prettier supports.

- [`.editorconfig`](.editorconfig): global editor whitespace defaults for a broad mix of popular languages.

- `web/`: web linting and package samples.

- `markdown/`: Markdown linting and package samples.

- `latex/`: full LaTeX workflow with `Makefile` and `latexmk`.

- `latex_simplified/`: editor-first LaTeX workflow without the full automation stack.

## Usage

Copy the files you need into a project root. For scratch work, place the root `.prettierrc.json` and `.editorconfig` in a parent directory above throwaway projects.

Project-local configs closer to the file still win.

```bash
project=/path/to/project

# Global formatting baseline only
cp -a .prettierrc.json .editorconfig "$project"/

# Web setup
mkdir -p "$project/.vscode"
cp -a .web/.htmlvalidate.json web/.stylelintrc.json web/eslint.config.js web/package.sample.json "$project"/
cp -a web/.vscode/extensions.json web/.vscode/settings.json "$project/.vscode"/

# Markdown setup
mkdir -p "$project/.vscode"
cp -a .prettierrc.json .editorconfig markdown/.markdownlint.jsonc markdown/.markdownlintignore markdown/package.sample.json "$project"/
cp -a markdown/.vscode/extensions.json markdown/.vscode/settings.json "$project/.vscode"/

# Full LaTeX setup
mkdir -p "$project/.vscode"
cp -a latex/.chktexrc latex/.gitignore latex/.latexindent.yaml latex/.latexmkrc latex/Makefile "$project"/
cp -a latex/.vscode/extensions.json latex/.vscode/settings.json "$project/.vscode"/

# Simplified LaTeX setup
mkdir -p "$project/.vscode"
cp -a latex_simplified/.chktexrc latex_simplified/.gitignore latex_simplified/.latexindent.yaml "$project"/
cp -a latex_simplified/.vscode/extensions.json latex_simplified/.vscode/settings.json "$project/.vscode"/
```

## Why is there so little documentation?

I am deeply, possibly medically, obsessed with standardization. That is useful right up until every config file gets a matching essay, then the docs become a second config system.

The long documentation was removed on purpose. I do not want to maintain a pile of `.md` files that explain files which already explain themselves. The `.explained` companions are the compromise: enough context to remember why a setting exists, without creating a documentation theme park I have to inspect every time I change one comma.

If you want the older long-form explanations, check git history and look at the [commit](https://github.com/braz9LKDI/style_config/tree/946f97ab5f79d6374557c0e88d765775e2d5f008) before the documentation cleanup. They are not gone in the cosmic sense, just evicted from the working tree for being too chatty.
