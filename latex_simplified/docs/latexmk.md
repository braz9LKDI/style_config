# latexmk

`latexmk` owns **the build pipeline**: looping `pdflatex`, `biber` and `makeindex` until cross-references stabilize. In this simplified stack, there is no `.latexmkrc`; the build recipe lives directly in `.vscode/settings.json`.

## Contents

|          file           | purpose                                                             |
| :---------------------: | :------------------------------------------------------------------ |
| `.vscode/settings.json` | Inline LaTeX Workshop recipe that runs `latexmk` for the open file. |

## Tool

[`latexmk`][latexmk] is a Perl build driver that ships with TeX Live. It decides what to run, in what order, how many times. The single-command replacement for "did I run `bibtex` after the last edit?".

Install (already on every TeX Live install):

```bash
sudo pacman -S --needed texlive-meta biber
```

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] calls this recipe when you build in VS Code; see [`./vscode.md`](./vscode.md).

## The VS Code recipe

```jsonc
"latex-workshop.latex.outDir": "./build",
"latex-workshop.latex.recipes": [
  {
    "name": "latexmk",
    "tools": ["latexmk"]
  }
],
"latex-workshop.latex.recipe.default": "latexmk",
"latex-workshop.latex.tools": [
  {
    "name": "latexmk",
    "command": "latexmk",
    "args": [
      "-synctex=1",
      "-interaction=nonstopmode",
      "-file-line-error",
      "-pdf",
      "-outdir=%OUTDIR%",
      "%DOC%"
    ]
  }
]
```

## Setting-by-setting

### `latex-workshop.latex.outDir`

```jsonc
"latex-workshop.latex.outDir": "./build"
```

Every generated file goes under `./build`. This keeps the project root cleaner than a plain `pdflatex main.tex` run.

### `-synctex=1`

Write SyncTeX metadata so the editor can jump between source and PDF.

### `-interaction=nonstopmode`

Do not pause for terminal input on errors. The build finishes with diagnostics instead of hanging.

### `-file-line-error`

Print errors as `file:line: message`, which makes editor diagnostics clickable.

### `-pdf`

Use `pdflatex` and produce a PDF. This is the default engine choice for simple papers and notes.

### `-outdir=%OUTDIR%`

Write artifacts to the output directory configured above. `%OUTDIR%` is a LaTeX Workshop placeholder.

### `%DOC%`

Build the root document selected by LaTeX Workshop. In simple projects this is usually the file you have open; in multi-file projects LaTeX Workshop can infer the root from magic comments or project structure.

## Per-project tweaks

### Switching engines

For LuaLaTeX:

```jsonc
"args": [
  "-synctex=1",
  "-interaction=nonstopmode",
  "-file-line-error",
  "-lualatex",
  "-outdir=%OUTDIR%",
  "%DOC%"
]
```

For XeLaTeX, use `-xelatex`.

### Enabling shell escape

Some packages, especially `minted`, require shell escape:

```jsonc
"args": [
  "-synctex=1",
  "-interaction=nonstopmode",
  "-file-line-error",
  "-shell-escape",
  "-pdf",
  "-outdir=%OUTDIR%",
  "%DOC%"
]
```

Only enable this for trusted documents. `-shell-escape` lets TeX run external programs.

### Root document hints

In multi-file projects, add a root-file magic comment to child files:

```latex
% !TeX root = ../main.tex
```

That keeps `%DOC%` pointed at the top-level file even when you build from a chapter.

### More build policy

If the project needs a default document list, biber validation, custom clean extensions, or package-specific cache cleanup, add a `.latexmkrc` or switch to the full `latex/` stack.

## When does this config need to be edited?

- Change `-pdf` when the project switches engines.

- Add `-shell-escape` only when a package genuinely requires it.

- Change `./build` if the project already has a different artifact directory.

- Graduate to `.latexmkrc` when build behavior needs to be shared by editor, shell, and CI.

[latexmk]: https://mg.readthedocs.io/latexmk.html
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
