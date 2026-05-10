# VS Code workspace settings

Editor wiring that turns "you have config files" into "format-on-save, lint-on-save and one-click build just work". The other configs in this stack (`.latexindent.yaml` and `.chktexrc`) define **what** the rules are; the `.vscode/` files make those rules fire automatically the moment a save hits disk and bind a build keybinding to `latexmk`.

## Contents

|           file            | purpose                                                                  |
| :-----------------------: | :----------------------------------------------------------------------- |
|  `.vscode/settings.json`  | Workspace settings: build recipe, format on save, lint on save, SyncTeX. |
| `.vscode/extensions.json` | Recommended extensions; VS Code prompts you on open.                     |

## Where does it go?

Project root, **as-is**:

```text
.vscode/settings.json
.vscode/extensions.json
```

Both files belong in the project repo and are committed to git. They configure the workspace, not the user, which is the whole point. When a teammate clones the repo, their editor adopts the same rules.

## What does `settings.json` do?

The file is JSONC, so comments are allowed.

### Formatter selection

```jsonc
"latex-workshop.formatting.latex": "latexindent"
```

Tell LaTeX Workshop to use `latexindent` for `.tex` formatting.

### Build recipe

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

A single recipe named `latexmk`. It builds the current root document as PDF, writes outputs to `./build`, and emits clickable diagnostics.

See [`./latexmk.md`](./latexmk.md) for the flag-by-flag details.

### Auto-clean

```jsonc
"latex-workshop.latex.autoClean.run": "onBuilt",
"latex-workshop.latex.clean.fileTypes": [
    "*.aux",
    "*.bbl",
    "*.blg",
    "*.idx",
    "*.ind",
    "*.lof",
    "*.lot",
    "*.out",
    "*.toc",
    "*.acn",
    "*.acr",
    "*.alg",
    "*.glg",
    "*.glo",
    "*.gls",
    "*.fls",
    "*.log",
    "*.fdb_latexmk",
    "*.snm",
    "*.synctex(busy)",
    "*.synctex.gz",
    "*.nav",
    "*.vrb",
    "*.bcf",
    "*.run.xml",
    "*.bak0",
    "*.bak1",
    "*.bak2"
]
```

After a build, LaTeX Workshop removes common auxiliary files and `latexindent` backup files. The final PDF remains in `./build`.

This is editor cleanup, not a full repo hygiene policy. If the project needs committed ignore rules, add a `.gitignore` or use the full [`../../latex/`](../../latex/README.md) stack.

### Linting

```jsonc
"latex-workshop.linting.chktex.enabled": true,
"latex-workshop.linting.chktex.exec.path": "chktex",
"latex-workshop.linting.run": "onSave"
```

Run ChkTeX on every save and show warnings in the Problems panel. `.chktexrc` supplies local command behavior, especially `\addbibresource` argument wiping.

### Formatting

```jsonc
"latex-workshop.formatting.latexindent.path": "latexindent",
"latex-workshop.formatting.latexindent.args": [
    "-c",
    "%DIR%/",
    "-m",
    "-l=%DIR%/.latexindent.yaml",
    "%TMPFILE%"
],
"[latex]": {
    "editor.defaultFormatter": "James-Yu.latex-workshop",
    "editor.formatOnSave": true,
    "editor.tabSize": 4,
    "editor.insertSpaces": true
},
"[bibtex]": {
    "editor.tabSize": 4,
    "editor.insertSpaces": true
}
```

The `[latex]` block binds save-time formatting to LaTeX Workshop and mirrors the 4-space indent in `.latexindent.yaml`.

The `latexindent` args load `.latexindent.yaml` next to the file being formatted.

The `[bibtex]` block sets indentation for `.bib` files but does not enable a formatter.

### SyncTeX

```jsonc
"latex-workshop.synctex.afterBuild.enabled": true
```

Enable source-to-PDF and PDF-to-source jumps after builds.

### File associations

```jsonc
"files.associations": {
    "*.tex": "latex",
    "*.bib": "bibtex",
    ".chktexrc": "properties"
}
```

Make file types explicit, including `.chktexrc` syntax highlighting.

## What does `extensions.json` do?

```json
{
    "recommendations": ["james-yu.latex-workshop", "editorconfig.editorconfig"]
}
```

|          extension          | what does it wire up?                                                                                                 |
| :-------------------------: | :-------------------------------------------------------------------------------------------------------------------- |
|  `james-yu.latex-workshop`  | Build via `latexmk`, lint via ChkTeX, format via `latexindent`, SyncTeX, PDF preview, and LaTeX language support.     |
| `editorconfig.editorconfig` | Reads a project `.editorconfig` if one exists. This simplified stack does not ship one, but many projects already do. |

## Per-project overrides

### Different engine

Use LuaLaTeX:

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

Use XeLaTeX by replacing `-lualatex` with `-xelatex`.

### Disable auto-clean

```jsonc
"latex-workshop.latex.autoClean.run": "never"
```

Useful when debugging bibliography or index artifacts.

### Disable format-on-save

```jsonc
"[latex]": {
    "editor.defaultFormatter": "James-Yu.latex-workshop",
    "editor.formatOnSave": false
}
```

Keep the formatter binding so manual format still works.

### Disable lint-on-save

```jsonc
"latex-workshop.linting.run": "never"
```

Useful for very large documents where ChkTeX is distracting during drafting.

## When do these files need to be edited?

- Update the `latexmk` args when the project changes engine, output directory, or shell-escape policy.

- Add `-m` to `latexindent` args if save-time formatting should also rewrite line breaks.

- Add file associations when the project uses extra TeX-adjacent file types.

- Do not put formatter or linter rules directly in VS Code settings. Keep those in `.latexindent.yaml` and `.chktexrc`.
