# EditorConfig

Universal editor settings shared by every project, regardless of language. One file, one purpose: stop whitespace drift between machines and editors.

## Contents

|      file       | purpose                                                          |
| :-------------: | :--------------------------------------------------------------- |
| `.editorconfig` | Tells every editor the encoding, line endings and indent to use. |

## Where does it go?

Project root:

```text
.editorconfig
```

## Tool

[EditorConfig][editorconfig] is a spec, not a program. Most editors implement it natively (JetBrains, Sublime, Vim, Neovim, Emacs, RStudio and Notepad++). VS Code needs the [`editorconfig.editorconfig`][ext-editorconfig] extension.

No `npm install` required. EditorConfig has no runtime; the file is purely a hint to your editor at file-open time.

## What does it enforce?

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab
```

## Option-by-option

### `root = true`

Stops EditorConfig from walking up the directory tree past this file. Without it, a stray `.editorconfig` in your home directory could silently override the project's settings.

### `charset = utf-8`

Saves files as UTF-8 with no BOM. LaTeX with `\usepackage[utf8]{inputenc}` (or a Unicode engine like `lualatex` / `xelatex`) expects UTF-8 source, anything else produces "Package inputenc Error: Unicode character ... not set up for use with LaTeX." or silent mojibake in the rendered PDF.

### `end_of_line = lf`

Unix line endings (`\n`), even on Windows. Combined with `core.autocrlf=false` in your `.gitconfig`, this guarantees identical bytes on every machine. SyncTeX (the PDF-to-source jump feature) gets confused when line endings differ between the `.tex` source and the `.synctex.gz` index, so this matters more than it looks.

### `insert_final_newline = true`

Adds a trailing newline at the end of every file. POSIX requires it; many tools (`cat`, `git diff` and shell `read`) misbehave without it.

### `trim_trailing_whitespace = true`

Strips trailing spaces and tabs on save. `latexindent` also enforces this via `removeTrailingWhitespace` (see [`./latexindent.md`](./latexindent.md)), having both belts and suspenders means the rule fires whether you save in your editor or run `make format`.

### `indent_style` and `indent_size`

Default indentation: 4 spaces, no tabs. The 4-space choice mirrors `latexindent`'s `defaultIndent: "    "` so the formatter and the editor agree from the first keystroke. But this is overridden by:

- `[Makefile]` (`indent_style`): `make` syntax **requires** literal tab characters before recipe lines, `make` will refuse to run with spaces and emit `*** missing separator. Stop.`.

## Per-project overrides

Most LaTeX projects do not need to override anything. Common cases that do:

```ini
# .bib files are sometimes 2-space by convention
[*.bib]
indent_size = 2

# YAML data files (e.g. metadata for pandoc-based pipelines)
[*.{yml,yaml}]
indent_size = 2
```

Add the block at the bottom of `.editorconfig`. Globs are matched in order, last match wins.

[editorconfig]: https://editorconfig.org
[ext-editorconfig]: https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig
