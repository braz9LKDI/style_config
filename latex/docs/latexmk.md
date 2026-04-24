# latexmk

`latexmk` owns **the build pipeline**: looping `pdflatex`, `biber` and `makeindex` until cross-references stabilize. Think of it as `make` for LaTeX documents, except smart enough to know that `\ref{}` needs two passes.

## Contents

|     file     | purpose                                                             |
| :----------: | :------------------------------------------------------------------ |
| `.latexmkrc` | Engine selection, output directory, biber settings, clean-up rules. |

## Where does it go?

Project root:

```text
.latexmkrc
```

## Tool

[`latexmk`][latexmk] is a Perl build driver that ships with TeX Live. It reads `.latexmkrc` (Perl syntax) and decides what to run, in what order, how many times. The single-command replacement for "did I run `bibtex` after the last edit?".

Install (already on every TeX Live install):

```bash
sudo pacman -S --needed texlive-meta biber
```

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] uses `latexmk` as its default build recipe; see [`./vscode.md`](./vscode.md).

## Make targets

|    target    | what does it do?                                               |
| :----------: | :------------------------------------------------------------- |
| `make build` | One full build with `latexmk` (reads `.latexmkrc`).            |
| `make watch` | `latexmk -pvc`: rebuild on every save, auto-reload PDF viewer. |
| `make clean` | `latexmk -C` plus `rm -rf build/ _minted-*/`.                  |
| `make check` | `format-check` + `lint` + `build`. CI gate.                    |

## Anatomy of the config

```perl
$pdf_mode = 1;

$out_dir = 'build';
$aux_dir = 'build';

$pdflatex = 'pdflatex -shell-escape -halt-on-error -file-line-error '
          . '-interaction=nonstopmode %O %S';

$bibtex_use = 2;
$biber = 'biber --validate-datamodel %O %S';

$clean_ext = '_minted-%R nav snm vrb run.xml bbl bcf';

$max_repeat = 5;

@default_files = ('main.tex');
```

## Setting-by-setting

### `$pdf_mode = 1`

Compile with `pdflatex`. The other engine modes:

| mode |  engine  | when should you use it?                                                                       |
| :--: | :------: | :-------------------------------------------------------------------------------------------- |
| `1`  | pdflatex | Most projects. Fast, mature, supports every package.                                          |
| `4`  | lualatex | Need OpenType fonts (`fontspec`), Unicode source without `inputenc`, or LuaTeX-only packages. |
| `5`  | xelatex  | Same use-cases as lualatex; preferred when you need the `polyglossia` ecosystem.              |

`pdflatex` is the project default because `inputenc` + `fontenc` + `lmodern` covers 95% of needs. Switch to `4` if you hit a missing-glyph problem with `pdflatex` (e.g. the project includes Greek or CJK).

### `$out_dir = 'build'` and `$aux_dir = 'build'`

Every artifact (`.aux`, `.log`, `.toc`, `.bbl`, the final PDF, etc.) goes to `./build/`. Keeps the repo root clean and makes `git status` actually useful.

`$out_dir` is where the PDF lands. `$aux_dir` is where intermediate files go. They are separate options because some projects split them; this kit collapses them into one directory.

The `.gitignore` lists `/build/` so the directory is never accidentally committed.

### `$pdflatex = '... -shell-escape -halt-on-error -file-line-error -interaction=nonstopmode %O %S'`

The full `pdflatex` command, broken down:

|            flag            | what does it do?                                                                    |
| :------------------------: | :---------------------------------------------------------------------------------- |
|      `-shell-escape`       | Allow `\write18` (shell-out) — required by the `minted` package.                    |
|      `-halt-on-error`      | Stop on the first error instead of prompting. Essential for CI.                     |
|     `-file-line-error`     | Emit errors as `file:line: message`. Editors parse this into clickable diagnostics. |
| `-interaction=nonstopmode` | Never prompt for user input, bare `pdflatex` will pause on missing files.           |
|          `%O %S`           | latexmk placeholders for "options" and "source". Required.                          |

If your project does **not** use `minted` or any other `\write18` package, drop `-shell-escape` to harden against malicious source files.

### `$bibtex_use = 2` and `$biber = 'biber --validate-datamodel %O %S'`

`$bibtex_use = 2` tells latexmk to **always** run a bibliography pass when needed (the alternative `1` only runs it if the `.bbl` is missing).

The biber command:

|          flag          | what does it do?                                                                                                          |
| :--------------------: | :------------------------------------------------------------------------------------------------------------------------ |
| `--validate-datamodel` | Catch malformed `.bib` entries. Without this, biber accepts almost anything and silently produces garbled bibliographies. |
|        `%O %S`         | latexmk placeholders. Required.                                                                                           |

This kit assumes `biblatex` with `backend=biber`. If your project uses classic `bibtex`, drop `$biber` and set `$bibtex = 'bibtex %O %S'`.

### `$clean_ext = '_minted-%R nav snm vrb run.xml bbl bcf'`

Extensions and patterns that `latexmk -C` should also remove (on top of the standard list it already cleans). The `%R` placeholder expands to the jobname (e.g. `main`), so `_minted-%R` matches the cache directory `minted` writes per document.

|       pattern       | what is it?                                                        |
| :-----------------: | :----------------------------------------------------------------- |
|    `_minted-%R`     | Code-listing cache directory. Can grow to megabytes.               |
| `nav`, `snm`, `vrb` | Beamer presentation artifacts (navigation, slide marks, verbatim). |
|      `run.xml`      | Biber control file (regenerated every run).                        |
|    `bbl`, `bcf`     | Biber bibliography output and config.                              |

If your project uses additional packages with cache files (e.g. `pythontex`'s `pythontex-files-%R/`), add their patterns here.

### `$max_repeat = 5`

Maximum number of `pdflatex` runs before latexmk gives up trying to stabilize cross-references. Five is enough for `cleveref` + `glossaries` + `biblatex` simultaneously. Increase to 7 or 8 only if you hit "Rerun to get cross-references right" warnings on the final pass.

### `@default_files = ('main.tex')`

The file `latexmk` builds when invoked with no arguments. The `Makefile` passes the file name explicitly (via the `MAIN := main` variable) so this default mainly matters for direct `latexmk` runs from the shell.

If your top-level file is `thesis.tex` or `paper.tex`, change this string accordingly.

## Make-target invocation

The `Makefile` calls `latexmk` as:

```bash
latexmk main.tex       # Make build
latexmk -pvc main.tex  # Make watch
latexmk -C             # Make clean (part of make clean)
```

|  flag  |                            what does it do?                             |
| :----: | :---------------------------------------------------------------------: |
| `-pvc` | "Preview continuously": rebuild on file change, refresh PDF viewer.     |
|  `-C`  | Clean: remove every artifact `latexmk` knows how to regenerate.         |

`-pdf`, `-interaction=nonstopmode` and `-file-line-error` are **not** passed on the command line, they come from `.latexmkrc` automatically.

The VS Code recipe in [`./vscode.md`](./vscode.md) **does** pass `-pdf -interaction=nonstopmode -file-line-error` explicitly so the editor's build matches CI even if `.latexmkrc` is missing or wrong.

## How latexmk decides whether to re-run

`latexmk` watches the `.fls` file (which `pdflatex` writes when `-recorder` is on; latexmk turns this on automatically) to track which input files were actually read. After each `pdflatex` pass:

1. Did any cross-reference change? (compare `.aux` before vs. after).

2. Did any input file change since the last run?

3. Does the bibliography need a new pass? (compare `.bcf` / `.bbl` timestamps.)

If yes to any of those, run again, up to `$max_repeat` times. If no, stop. This is what makes `latexmk` robust against the classic "I edited `\cite{}` and the `?` is still there" problem.

## Per-project tweaks

### Switching engines

For a project that needs OpenType fonts:

```perl
$pdf_mode = 4;             # lualatex
$lualatex = 'lualatex -shell-escape -halt-on-error -file-line-error '
          . '-interaction=nonstopmode %O %S';
```

For xelatex, change `4` to `5` and `$lualatex` to `$xelatex`. The flags are the same.

### Disabling shell-escape

If you do not use `minted` / `pythontex` / `gnuplottex` / any package that calls out to the shell:

```perl
$pdflatex = 'pdflatex -halt-on-error -file-line-error '
          . '-interaction=nonstopmode %O %S';
```

(Just remove `-shell-escape`.) Also drop `-shell-escape` from the VS Code recipe in [`./vscode.md`](./vscode.md) and remove `_minted-*/` from `$clean_ext`.

### Multi-document repos

If the repo builds more than one PDF (e.g. paper + slides + poster), set:

```perl
@default_files = ('paper.tex', 'slides.tex', 'poster.tex');
```

A bare `make build` then builds all three. The `Makefile`'s `MAIN := main` variable would also need updating to a list, or split into per-document targets.

### Using classic bibtex

Replace the biber block with:

```perl
$bibtex_use = 2;
$bibtex = 'bibtex %O %S';
# (delete the $biber line)
```

And switch your bibliography package back to `\usepackage[backend=bibtex]{biblatex}` or plain `\bibliographystyle{...}` + `\bibliography{...}`.

## When do these files need to be edited?

- Almost always needs per-project tweaks: the engine, the default file, whether `-shell-escape` is needed, and which `$clean_ext` artifacts to purge.

- Add patterns to `$clean_ext` whenever a new package leaves cache files behind.

- Bump `$max_repeat` only if cross-references genuinely fail to stabilize within five passes, usually the right fix is to break a `cleveref` / `glossaries` cycle, not to grant more passes.

[latexmk]: https://mg.readthedocs.io/latexmk.html
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
