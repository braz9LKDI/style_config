# `latex_simplified/`

Editor-first code-style kit for small LaTeX projects or existing repos that already have their own build and git hygiene. It is the light version of [`/latex/`](/latex/README.md): keep `latexindent`, ChkTeX, and VS Code's LaTeX Workshop wiring; skip the `Makefile` and `.latexmkrc`.

Use this when you want format-on-save, lint-on-save, and a simple `latexmk` build recipe without adopting the full LaTeX automation stack.

## Contents

|           file            |                             tool                              |
| :-----------------------: | :-----------------------------------------------------------: |
|      `.editorconfig`      |        EditorConfig (encoding / EOL / indent baseline)        |
|    `.latexindent.yaml`    |              latexindent (formatter for `.tex`)               |
|        `.chktexrc`        |          ChkTeX (linter, command argument overrides)          |
|       `.gitignore`        |            TeX artifacts and latexindent backups.             |
|  `.vscode/settings.json`  | Format-on-save, lint-on-save, `latexmk` build recipe, SyncTeX |
| `.vscode/extensions.json` |           Extension recommendations (auto-prompted)           |

## Adopting this stack

1. Copy the folder into the new project's root:

    ```bash
    cp -a style_config/latex_simplified/. /path/to/new-project/
    ```

    The `.` after `latex_simplified/` matters, it copies hidden dotfiles too.

2. Install TeX Live tools. On Arch:

    ```bash
    sudo pacman -S --needed texlive-meta biber perl-yaml-tiny
    yay -S perl-file-homedir
    ```

3. Install the recommended editor extensions (VS Code will prompt on first open).

4. Open the project in VS Code and save a `.tex` file. LaTeX Workshop formats with `latexindent` and lints with ChkTeX.

5. Build from the LaTeX Workshop command (`Ctrl+Alt+B`) or the TeX sidebar. The recipe runs `latexmk` and writes artifacts to `./build`.

## Editor workflows

|      action       | what happens?                                                                |
| :---------------: | :--------------------------------------------------------------------------- |
|    Save `.tex`    | Format with `latexindent`; lint with ChkTeX.                                 |
| Build in VS Code  | Run `latexmk -pdf` with SyncTeX and `./build` output.                        |
| Open PDF preview  | Use LaTeX Workshop's built-in PDF viewer.                                    |
| Sync source / PDF | Jump between `.tex` source and rendered PDF after builds.                    |
| Clean after build | Remove common aux files and `latexindent` backup files from the output flow. |

## Per-tool details

For per-rule explanations, command examples, and override patterns, see the docs:

- [`docs/editorconfig.md`](./docs/editorconfig.md): EditorConfig.

- [`docs/latexindent.md`](./docs/latexindent.md): latexindent (formatter).

- [`docs/chktex.md`](./docs/chktex.md): ChkTeX (linter and `.chktexrc` behavior).

- [`docs/latexmk.md`](./docs/latexmk.md): the inline `latexmk` build recipe in VS Code.

- [`docs/vscode.md`](./docs/vscode.md): VS Code workspace settings + extensions.

## Common per-project tweaks

- **Different engine**: replace `-pdf` in `.vscode/settings.json` with `-lualatex` or `-xelatex`. See [`docs/latexmk.md`](./docs/latexmk.md#switching-engines).

- **Needs `minted` / shell escape**: add `-shell-escape` to the `latexmk` args. Only do this for trusted documents.

- **Custom table environments**: add the environment name to `lookForAlignDelims` in `.latexindent.yaml`. See [`docs/latexindent.md`](./docs/latexindent.md#custom-table-environments).

- **Custom citation commands**: extend `WipeArg` in `.chktexrc` with the new command names. See [`docs/chktex.md`](./docs/chktex.md#adding-a-custom-command-to-wipearg).

## When to use `latex/` instead

Use the full [`latex/`](/latex/README.md) stack for papers, theses, books, CI, or any project where command-line checks should be canonical. That stack adds a `Makefile`, `.latexmkrc`, and `make check`.
