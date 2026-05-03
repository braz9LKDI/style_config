# `latex/`

Self-contained code-style kit for LaTeX projects: papers, theses, books and slide decks. Drop the whole folder into a new project root, install the tools, run `make check`, done. Every config file in this folder is consumed by another file in this folder, no cross-stack references.

## Contents

|           file            |                               tool                                |
| :-----------------------: | :---------------------------------------------------------------: |
|      `.editorconfig`      |          EditorConfig (encoding / EOL / indent baseline)          |
|    `.latexindent.yaml`    |                latexindent (formatter for `.tex`)                 |
|        `.chktexrc`        |             ChkTeX (linter, bug-class warnings only)              |
|       `.latexmkrc`        |          latexmk (build pipeline, biber and output dir)           |
|       `.gitignore`        |         TeX artifacts, latexindent backups, minted cache          |
|  `.vscode/settings.json`  |        Format-on-save, lint-on-save, build recipe, SyncTeX        |
| `.vscode/extensions.json` |             Extension recommendations (auto-prompted)             |
|        `Makefile`         | `format` / `lint` / `build` / `check` / `watch` / `clean` targets |

## Adopting this stack

1. Copy the folder into the new project's root:

    ```bash
    cp -a style_config/latex/. /path/to/new-project/
    ```

    The `.` after `latex/` matters — it copies hidden dotfiles too.

2. Adjust the project-specific knobs in `.latexmkrc`:
    - Set `@default_files` to your top-level `.tex` file (default: `main.tex`).

    - Change `$pdf_mode` if you need `lualatex` (`4`) or `xelatex` (`5`).

    - Drop `-shell-escape` from `$pdflatex` if you do not use `minted` or any other shell-escape package.

    Update the matching `MAIN := main` line at the top of `Makefile` if your top-level file is not `main.tex`.

3. Install TeX Live and the Perl dependencies (see [Required tools](#required-tools) below).

4. Install the recommended editor extensions (your editor will prompt on first open).

5. Reformat any existing source in one go:

    ```bash
    make format
    ```

6. Verify:

    ```bash
    make check
    ```

## Make targets

After copying:

|         target          | what does it do?                                                                |
| :---------------------: | :------------------------------------------------------------------------------ |
|      `make build`       | Compile once with `latexmk` (reads `.latexmkrc`).                               |
|      `make watch`       | `latexmk -pvc`: continuous build + PDF reload on save.                          |
|      `make format`      | Rewrite every `.tex` with `latexindent -s -w -m -l`, then clean leaked backups. |
|   `make format-check`   | Fail if any `.tex` is not `latexindent`-clean. CI / pre-commit gate.            |
|       `make lint`       | Run `chktex` on every `.tex`; non-zero exit on any warning.                     |
|      `make check`       | `format-check` + `lint` + `build`. **What CI should run.**                      |
|      `make clean`       | `latexmk -C` + `rm -rf build/ _minted-*/` + remove indent backups.              |
| `make clean-indent-tmp` | Delete `latexindent` stragglers (`*.bak*`, `*.tmp.bak`, `*.tmp.tex`).           |
|       `make help`       | List all targets.                                                               |

## Per-tool details

For per-rule explanations, before/after examples and override patterns, see the docs:

- [`docs/editorconfig.md`](./docs/editorconfig.md): EditorConfig.

- [`docs/latexindent.md`](./docs/latexindent.md): latexindent (formatter).

- [`docs/chktex.md`](./docs/chktex.md): ChkTeX (linter, including the `CHKTEX_NOWARN` table).

- [`docs/latexmk.md`](./docs/latexmk.md): latexmk (engine, output dir, biber, clean-up).

- [`docs/vscode.md`](./docs/vscode.md): VS Code workspace settings + extensions.

## Required tools

All TeX tools except Vale (optional, future) ship with TeX Live 2023+. On Arch:

```bash
sudo pacman -S --needed texlive-meta biber
```

`latexindent` is a Perl script and depends on several CPAN modules that TeX Live does **not** bundle. On Arch these are split between the official repos and AUR:

```bash
# Official repos
sudo pacman -S --needed perl-yaml-tiny

# AUR (use yay, paru, or similar)
yay -S perl-file-homedir
```

The full runtime dependency list for `latexindent`:

- `YAML::Tiny`: reads `.latexindent.yaml`.

- `File::HomeDir`: locates per-user config.

- `Unicode::GCString` (from `perl-unicode-linebreak`): correct grapheme handling, required when using `-m`.

- `Log::Log4perl`, `Log::Dispatch` and `Log::Dispatch::FileRotate`: logging framework, initialized unconditionally even if you never look at the log.

## Common per-project tweaks

After copying, most projects need at least one of these adjustments:

- **Engine swap**: change `$pdf_mode` in `.latexmkrc` and the build-recipe args in `.vscode/settings.json` together. See [`docs/latexmk.md`](./docs/latexmk.md#switching-engines) and [`docs/vscode.md`](./docs/vscode.md#different-engine).

- **No `minted` / `pythontex`**: drop `-shell-escape` from `.latexmkrc`'s `$pdflatex`, drop `_minted-*/` from `$clean_ext` and from the `.gitignore`.

- **Custom citation commands**: extend `WipeArg` in `.chktexrc` with the new command names (e.g. `\fullcite:{}`). See [`docs/chktex.md`](./docs/chktex.md#per-project-tweaks).

- **Custom table environments**: add the environment name to `lookForAlignDelims` in `.latexindent.yaml`. See [`docs/latexindent.md`](./docs/latexindent.md#per-project-tweaks).

- **Different top-level file**: update `MAIN` in `Makefile` and `@default_files` in `.latexmkrc`.

## Possible future additions

Things I have not set up yet but might want later:

- **Prose linting with [`Vale`][vale]**: a `make prose` target running `vale --minAlertLevel=warning chapters/*.tex`. Needs a `.vale.ini` with the `LaTeX` scope enabled and a `styles/` folder with [`write-good`][vale-writegood] or [`proselint`][vale-proselint].

- **Pre-commit hooks** with [`pre-commit`][precommit]: block commits that fail `make format-check` or `make lint`. Existing hooks for `latexindent`, `chktex` and `textidote`.

- **Switch to [`tex-fmt`][texfmt]**: a Rust-native rewrite of `latexindent` that is ~100x faster and has no Perl dependency hell. Currently young, but worth watching.

[vale]: https://vale.sh
[vale-writegood]: https://github.com/errata-ai/write-good
[vale-proselint]: https://github.com/errata-ai/proselint
[precommit]: https://pre-commit.com
[texfmt]: https://github.com/WGUNDERWOOD/tex-fmt
