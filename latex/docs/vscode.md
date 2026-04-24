# VS Code workspace settings

Editor wiring that turns "you have config files" into "format-on-save, lint-on-save and one-click build just work". The other configs in this stack (`.latexindent.yaml`, `.chktexrc` and `.latexmkrc`) define **what** the rules are; the `.vscode/` files make those rules fire automatically the moment a save hits disk and bind a build keybinding to `latexmk`.

## Contents

|           file            | purpose                                                                  |
| :-----------------------: | :----------------------------------------------------------------------- |
|  `.vscode/settings.json`  | Workspace settings: build recipe, format on save, lint on save, SyncTeX. |
| `.vscode/extensions.json` | Recommended extensions; the editor prompts you on open.                  |

## Where does it go?

Project root, **as-is**:

```text
.vscode/settings.json
.vscode/extensions.json
```

Both files belong in the project repo and are committed to git. They configure the workspace, not the user, which is the whole point. When a teammate clones the repo, their editor adopts the same rules.

## What does `settings.json` do? Group by group

The file groups settings into six small clusters. The keys below are the actual setting names; the live file has them in plain JSON without comments.

### Build recipe

```jsonc
"latex-workshop.latex.recipes": [
    { "name": "latexmk", "tools": ["latexmk"] }
],
"latex-workshop.latex.recipe.default": "latexmk",
"latex-workshop.latex.tools": [
    {
        "name": "latexmk",
        "command": "latexmk",
        "args": ["-pdf", "-interaction=nonstopmode", "-file-line-error", "%DOC%"],
        "env": {}
    }
]
```

A single recipe, named `latexmk`, that invokes `latexmk` with the same flags the `Makefile`'s `make build` target uses. The recipe is bound to the editor's "Build LaTeX project" command (default keybinding `CTRL+ALT+b`).

Because `latexmk` reads `.latexmkrc` (see [`./latexmk.md`](./latexmk.md)), the engine choice, output directory, biber settings and `-shell-escape` flag all come along automatically. The args here are just the latexmk-driver-level flags that do not belong in `.latexmkrc`.

### Output directory

```jsonc
"latex-workshop.latex.outDir": "build"
```

Matches `$out_dir = 'build'` in `.latexmkrc`. Without this, LaTeX Workshop would look for the PDF in the project root and display "file not found" after every successful build.

### Auto-clean

```jsonc
"latex-workshop.latex.autoClean.run": "onBuilt",
"latex-workshop.latex.clean.fileTypes": [
    "*.aux", "*.bbl", "*.blg", "*.idx", "*.ind", "*.lof", "*.lot",
    "*.out", "*.toc", "*.acn", "*.acr", "*.alg", "*.glg", "*.glo",
    "*.gls", "*.fls", "*.log", "*.fdb_latexmk", "*.snm", "*.synctex(busy)",
    "*.synctex.gz", "*.nav", "*.vrb", "*.bcf", "*.run.xml",
    "*.bak0", "*.bak1", "*.bak2"
]
```

After every successful build, the editor wipes stale auxiliary files. The list overlaps with `latexmk -C` and the `Makefile`'s `clean` target, but `autoClean.run: "onBuilt"` runs **after every build**, not just on demand, so the working tree stays clean between edits.

The `*.bak0/1/2` entries cover `latexindent`'s overwrite-mode backups. The check-mode stragglers (`*.bak`, `*.tmp.bak`, `*.tmp.tex`) are not in this list because the Makefile's `clean-indent-tmp` target handles them; see [`./latexindent.md`](./latexindent.md).

### Linting

```jsonc
"latex-workshop.linting.chktex.enabled": true,
"latex-workshop.linting.chktex.exec.path": "chktex",
"latex-workshop.linting.run": "onSave"
```

Run `chktex` on every save and surface results in the Problems panel. `chktex` reads `.chktexrc` automatically; warning-number suppression comes from the `Makefile`'s `CHKTEX_NOWARN` (the editor uses chktex's defaults plus the system rcfile, slightly different from the Makefile's set, see the note below).

> The editor's `chktex` invocation does **not** automatically inherit `CHKTEX_NOWARN` from the `Makefile`. To match exactly, either add a `latex-workshop.chktex.args` setting (the extension supports it) or accept the small mismatch, running `make lint` locally always uses the canonical set.

### Formatting

```jsonc
"latex-workshop.formatting.latexindent.path": "latexindent",
"latex-workshop.formatting.latexindent.args": [
    "-c", "%DIR%/",
    "-y=defaultIndent: '    '",
    "%TMPFILE%"
],

"[latex]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "James-Yu.latex-workshop",
    "editor.tabSize": 4,
    "editor.insertSpaces": true
},
"[bibtex]": {
    "editor.tabSize": 4,
    "editor.insertSpaces": true
}
```

Three things wired together:

1. **Tool path and args**: the editor invokes `latexindent` with `-c %DIR%/` (use the file's directory as cache root) and `-y=defaultIndent: '    '`. The `-y` flag forces 4-space indent even if `.latexindent.yaml` is missing or malformed.

2. **Per-language formatter binding**: the `[latex]` block makes Prettier-style format-on-save fire for `.tex` files only, using `James-Yu.latex-workshop` as the formatter (which delegates to `latexindent`). Without this, save would do nothing.

3. **Whitespace mirror**: `editor.tabSize: 4` and `editor.insertSpaces: true` restate `.editorconfig` for projects where the EditorConfig extension is not installed.

The `[bibtex]` block sets the same indent unit for `.bib` files but does not enable format-on-save (`bibtex` files have no formatter in this kit).

### SyncTeX

```jsonc
"latex-workshop.synctex.afterBuild.enabled": true
```

Bidirectional jumping between source and PDF: `CTRL+click` on a line in the PDF jumps to the corresponding `.tex` source, `CTRL+ALT+J` from the source jumps to the rendered output. Requires `synctex=1` in the engine (default for `pdflatex`/`lualatex`/`xelatex`), so no extra config needed.

### File associations

```jsonc
"files.associations": {
    "*.tex": "latex",
    "*.bib": "bibtex",
    ".chktexrc": "properties",
    ".latexmkrc": "perl"
}
```

Tells the editor that:

- `.chktexrc`: properties-style file (key/value pairs with `{}` blocks). Gets the `.ini`-flavored highlighter.

- `.latexmkrc`: Perl script. Gets the Perl highlighter (and Perl errors when you mistype `$var`).

The `*.tex` and `*.bib` lines are usually redundant (LaTeX Workshop registers them automatically), but explicit beats implicit.

## What does `extensions.json` do?

A single `recommendations` array, two entries in this stack:

- `james-yu.latex-workshop`.

- `editorconfig.editorconfig`.

When a teammate first opens the workspace, VS Code shows a notification: "This workspace has extension recommendations." One click installs both.

|          extension          | what does it wire up?                                                                                                  |
| :-------------------------: | :--------------------------------------------------------------------------------------------------------------------- |
|  `james-yu.latex-workshop`  | Build via `latexmk`, lint via `chktex`, format via `latexindent`, SyncTeX, PDF preview, and the LaTeX language server. |
| `editorconfig.editorconfig` | Reads [`../.editorconfig`](../.editorconfig). VS Code does not honor `.editorconfig` natively.                         |

`latex-workshop` is the entire LaTeX experience in one extension. It reads every config file in this stack and binds keyboard shortcuts (`Ctrl+Alt+B` to build, `Ctrl+Alt+V` to preview, etc.).

## Per-project overrides

### Different engine

If your project uses `lualatex` or `xelatex`, override the build recipe args:

```jsonc
"latex-workshop.latex.tools": [
    {
        "name": "latexmk",
        "command": "latexmk",
        "args": ["-lualatex", "-interaction=nonstopmode", "-file-line-error", "%DOC%"],
        "env": {}
    }
]
```

(Replace `-pdf` with `-lualatex` or `-xelatex`.) Also update `$pdf_mode` in `.latexmkrc` accordingly; see [`./latexmk.md`](./latexmk.md).

### Disable auto-clean

If you want every artifact preserved between builds (debugging a failed `bibtex` run, for example):

```jsonc
"latex-workshop.latex.autoClean.run": "never"
```

### Disable format-on-save

If you want `latexindent` runnable on demand but never automatic:

```jsonc
"[latex]": {
    "editor.formatOnSave": false,
    "editor.defaultFormatter": "James-Yu.latex-workshop"
}
```

(Keep the formatter binding so `CTRL+SHIFT+i` still works to format manually.)

### Disable lint-on-save

If `chktex` runs are slow on a large document, switch to manual:

```jsonc
"latex-workshop.linting.run": "onType" // Or "never"
```

## When do these files need to be edited?

- Add a `[language]` block whenever the project picks up a new language (e.g. `Rmd`, `Pweave`).

- Update the build recipe args if the project switches engines or drops `-shell-escape`.

- **Do not** put rule-level configuration here. Editor settings belong in `.vscode/`; format and lint rules belong in their dedicated config files (`.latexindent.yaml`, `.chktexrc`, `.latexmkrc`).

[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
[ext-editorconfig]: https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig
