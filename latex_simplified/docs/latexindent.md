# latexindent

`latexindent` owns **how the source looks**: indentation, trailing whitespace, list indentation, and optionally environment / item line breaks. It does not lint semantics, see [`./chktex.md`](./chktex.md) for that.

## Contents

|        file         | purpose                                                              |
| :-----------------: | :------------------------------------------------------------------- |
| `.latexindent.yaml` | Formatter rules (indent width, environment line-break policy, etc.). |

## Where does it go?

Project root:

```text
.latexindent.yaml
```

## Tool

[`latexindent.pl`][latexindent] is a Perl script that ships with TeX Live. It reads `.tex` files and rewrites them to match whatever rules are in `.latexindent.yaml`. The local config merges with the system defaults at `<TEXMFDIST>/scripts/latexindent/defaultSettings.yaml`; you only need to set the rules you care about.

Install (everything except a handful of CPAN modules ships with TeX Live):

```bash
sudo pacman -S --needed texlive-meta perl-yaml-tiny
yay -S perl-file-homedir
```

The full runtime dependency list:

- `YAML::Tiny`: reads `.latexindent.yaml`.

- `File::HomeDir`: locates per-user config.

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] handles formatter wiring inside VS Code; see [`./vscode.md`](./vscode.md).

## VS Code invocation

The simplified stack formats through LaTeX Workshop:

```jsonc
"latex-workshop.formatting.latexindent.args": [
  "-c",
  "%DIR%/",
  "-l=%DIR%/.latexindent.yaml",
  "%TMPFILE%"
]
```

|             arg              | what does it do?                                                  |
| :--------------------------: | :---------------------------------------------------------------- |
|             `-c`             | Set the cache/log directory.                                      |
|           `%DIR%/`           | Use the source file's directory as the cache/log root.            |
|             `-m`             | Make `modifyLineBreaks` rules.                                    |
| `-l=%DIR%/.latexindent.yaml` | Load the local formatter settings next to the file being saved.   |
|         `%TMPFILE%`          | Format the temporary file LaTeX Workshop passes to `latexindent`. |

## Command-line invocation

For a one-off format from the project root:

```bash
latexindent -s -w -m -l=.latexindent.yaml main.tex
```

For a check-only pass:

```bash
latexindent -s -m -l=.latexindent.yaml -k main.tex
```

| flag | what does it do?                                                            |
| :--: | :-------------------------------------------------------------------------- |
| `-s` | Silent, suppress per-file log spam.                                         |
| `-w` | Overwrite the file in place.                                                |
| `-m` | Apply `modifyLineBreaks` rules; without it, those YAML rules are ignored.   |
| `-l` | Read the specified local YAML file in addition to the system default.       |
| `-k` | Check mode: exit 0 if the file is clean, non-zero if it would be rewritten. |

This simplified stack does not ship a `Makefile`. If command-line `format`, `format-check`, and cleanup targets matter, use [`/latex/`](/latex/README.md).

## Anatomy of the config

```yaml
defaultIndent: '    '

modifyLineBreaks:
    environments:
        BeginStartsOnOwnLine: 1
        BodyStartsOnOwnLine: 1
        EndStartsOnOwnLine: 1
        EndFinishesWithLineBreak: 1
    items:
        ItemStartsOnOwnLine: 1
    commands:
        CommandStartsOnOwnLine: 0
    oneSentencePerLine:
        manipulateSentences: 0

onlyOneBackUp: 1
maxNumberOfBackUps: 0
cycleThroughBackUps: 0

removeTrailingWhitespace:
    beforeProcessing: 1
    afterProcessing: 1

indentAfterItems:
    itemize: 1
    enumerate: 1
    description: 1

lookForAlignDelims:
    tabular: 1
    tabularx: 1
    array: 1
    matrix: 1
    pmatrix: 1
    bmatrix: 1
    align: 1
    align*: 1
```

## Setting-by-setting

### `defaultIndent: "    "`

4 spaces. The VS Code settings mirror this with `editor.tabSize: 4` and `editor.insertSpaces: true`.

### `modifyLineBreaks`

These rules give `latexindent` permission to rewrite line breaks around environments and list items, but only when the formatter is run with `-m`.

- `BeginStartsOnOwnLine: 1`: `\begin{env}` starts a new line.

- `BodyStartsOnOwnLine: 1`: content starts after `\begin{env}`.

- `EndStartsOnOwnLine: 1`: `\end{env}` starts a new line.

- `EndFinishesWithLineBreak: 1`: leave a line break after `\end{env}`.

- `ItemStartsOnOwnLine: 1`: every `\item` starts on its own line.

- `CommandStartsOnOwnLine: 0`: do not explode inline commands like `\textbf{...}` onto separate lines.

- `oneSentencePerLine.manipulateSentences: 0`: prose wrapping stays natural.

### Backup file controls

```yaml
onlyOneBackUp: 1
maxNumberOfBackUps: 0
cycleThroughBackUps: 0
```

These settings try to suppress `*.bak0`, `*.bak1`, and `*.bak2` litter when overwrite mode is used. The VS Code settings also list common backup patterns in the clean file list.

### `removeTrailingWhitespace`

```yaml
removeTrailingWhitespace:
    beforeProcessing: 1
    afterProcessing: 1
```

Strip trailing spaces both before parsing and after rewriting. This keeps the source clean even if an editor without EditorConfig support touches the file.

### `indentAfterItems`

```yaml
indentAfterItems:
    itemize: 1
    enumerate: 1
    description: 1
```

Indent list bodies so nested lists remain readable.

### `lookForAlignDelims`

```yaml
lookForAlignDelims:
    tabular: 1
    tabularx: 1
    array: 1
    matrix: 1
    pmatrix: 1
    bmatrix: 1
    align: 1
    align*: 1
```

Tell `latexindent` to recognize `&` as a column separator inside table, matrix, and equation alignment environments. This is what makes source columns line up.

## Per-project tweaks

### Custom table environments

If you have a `\newenvironment{mytable}` that should align like `tabular`, add it to `lookForAlignDelims`:

```yaml
lookForAlignDelims:
    mytable: 1
```

### Tighter or looser environment style

To collapse the trailing blank line after every environment:

```yaml
modifyLineBreaks:
    environments:
        EndFinishesWithLineBreak: 0
```

To keep `\begin{env}` on the same line as preceding content (less aggressive):

```yaml
modifyLineBreaks:
    environments:
        BeginStartsOnOwnLine: 0
```

### Line wrapping for prose

Off by default in this kit. To enable one-sentence-per-line:

```yaml
modifyLineBreaks:
    oneSentencePerLine:
        manipulateSentences: 1
        sentencesFollow:
            par: 1
            blankLine: 1
            fullStop: 1
```

## When does this file need to be edited?

- Add `lookForAlignDelims` entries for project-specific table or math environments.

- Toggle `modifyLineBreaks` only if the project's house style is different.

- Do not put ChkTeX warning suppressions here. Lint behavior belongs in [`.chktexrc`](./chktex.md) or in the command that runs `chktex`.

[latexindent]: https://latexindentpl.readthedocs.io
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
