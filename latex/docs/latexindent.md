# latexindent

`latexindent` owns **how the source looks**: indentation, environment line breaks, table alignment. It does not lint semantics, see [`./chktex.md`](./chktex.md) for that.

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

[`latexindent.pl`][latexindent] is a Perl script that ships with TeX Live. It reads `.tex` files and rewrites them to match whatever rules are in `.latexindent.yaml`. The local config **merges with** the system defaults at `<TEXMFDIST>/scripts/latexindent/defaultSettings.yaml`; you only need to set what you actually want to change.

Install (everything except a handful of CPAN modules ships with TeX Live):

```bash
sudo pacman -S --needed texlive-meta perl-yaml-tiny perl-unicode-linebreak perl-log-log4perl
yay -S perl-file-homedir perl-log-dispatch perl-log-dispatch-filerotate
```

The full runtime dependency list:

- `YAML::Tiny`, `File::HomeDir`, `Unicode::GCString` (from `perl-unicode-linebreak`), `Log::Log4perl`, `Log::Dispatch`, `Log::Dispatch::FileRotate`. The Log modules are initialized unconditionally even when nothing logs, so missing them aborts every run with a stack trace.

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] handles formatter wiring inside VS Code; see [`./vscode.md`](./vscode.md).

## Make targets

|         target          | what does it do?                                               |
| :---------------------: | :------------------------------------------------------------- |
|      `make format`      | Rewrite every `.tex` file with `latexindent -s -w -m -l`.      |
|   `make format-check`   | Fail if any `.tex` would be changed by `latexindent`. CI gate. |
| `make clean-indent-tmp` | Remove `latexindent`'s leaked backup and temp files.           |

## Anatomy of the config

```yaml
defaultIndent: "    "

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

4 spaces, exactly mirroring [`../.editorconfig`](../.editorconfig). When the editor's auto-indent and `latexindent` agree on the unit, you never get a diff just from saving.

### `modifyLineBreaks: ...`

The single most important toggle in the whole file. Without `modifyLineBreaks` (and the matching `-m` flag in `make format`), `latexindent` only fixes **leading whitespace**, it leaves environment delimiters wherever you put them. Turning it on grants the formatter permission to also rewrite line breaks around `\begin{…}` / `\end{…}` / `\item`.

The four sub-keys policy:

- `BeginStartsOnOwnLine: 1`: `\begin{env}` always starts a new line.

- `BodyStartsOnOwnLine: 1`: content of `env` starts on the line after `\begin`.

- `EndStartsOnOwnLine: 1`: `\end{env}` always starts a new line.

- `EndFinishesWithLineBreak: 1`: a blank line separates `\end{env}` from whatever follows.

- `ItemStartsOnOwnLine: 1`: every `\item` on its own line. No more `\item one \item two \item three`.

- `CommandStartsOnOwnLine: 0`: **deliberately off**, with this on, every `\textbf{...}` mid-paragraph would jump to its own line and shred prose.

- `oneSentencePerLine.manipulateSentences: 0`: also **deliberately off**, I let prose wrap naturally, the diff cost of one-sentence-per-line is high and the readability win is debatable.

### Backup file controls

```yaml
onlyOneBackUp: 1
maxNumberOfBackUps: 0
cycleThroughBackUps: 0
```

These three try to suppress `*.bak0`, `*.bak1`, `*.bak2` litter from `latexindent`'s overwrite mode (`-w`). They mostly work, but **only in `-w` mode**. In `-k` (check) mode, used by `make format-check`, `latexindent` still leaks `*.bak`, `*.tmp.bak` and `*.tmp.tex`. The `Makefile`'s `clean-indent-tmp` target deletes them and runs after every `format` and `format-check`.

### `removeTrailingWhitespace`

```yaml
removeTrailingWhitespace:
    beforeProcessing: 1
    afterProcessing: 1
```

Strip trailing spaces both before parsing the file (so leading whitespace is the only whitespace `latexindent` sees) and after rewriting (so the output is clean even if rules introduced trailing whitespace). Belt and suspenders; redundant with `.editorconfig` but harmless.

### `indentAfterItems`

```yaml
indentAfterItems:
    itemize: 1
    enumerate: 1
    description: 1
```

Indent the body of list environments. Otherwise `\item` and the surrounding `\begin{itemize}` / `\end{itemize}` would all sit at the same indent level, which makes nested lists unreadable.

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

The crown jewel: tells `latexindent` to recognize `&` as a column separator inside these environments and visually align them. Without this, `tabular` and `align` blocks are just text. With it, columns line up the way you would format them by hand.

If you use a custom table-like environment (e.g. `\newenvironment{mytable}{...}{...}` wrapping `tabular*`), add it here.

## Make-target invocation

The `Makefile` runs the formatter as:

```bash
latexindent -s -w -m -l "$file"
```

| flag | what does it do?                                                                               |
| :--: | :--------------------------------------------------------------------------------------------- |
| `-s` | Silent, suppress per-file log spam.                                                            |
| `-w` | Overwrite the file in place.                                                                   |
| `-m` | Apply `modifyLineBreaks` rules, without this, the YAML's environment / item rules are ignored. |
| `-l` | Read the local `.latexindent.yaml` (in addition to the system default).                        |

For check mode (`make format-check`):

```bash
latexindent -s -m -l -k "$file" >/dev/null 2>&1
```

| flag | what does it do?                                                 |
| :--: | :--------------------------------------------------------------- |
| `-k` | Check mode: exit 0 if file is clean, 1 if it would be rewritten. |

`-k` is much faster and more reliable than diffing against a re-formatted copy.

## The temp-file dance

`latexindent` writes scratch files (`*.bak`, `*.bak[0-9]`, `*.tmp.bak`, `*.tmp.tex`) to the working directory while it works. The `onlyOneBackUp` / `maxNumberOfBackUps` settings cover overwrite mode but not check mode, so something has to clean up after every run. That's `clean-indent-tmp`:

```makefile
clean-indent-tmp:
	@find . -type f \( -name '*.bak' -o -name '*.bak[0-9]' -o -name '*.tmp.bak' -o -name '*.tmp.tex' \) \
		-not -path './build/*' -not -path './.git/*' -delete
```

Both `format` and `format-check` invoke `clean-indent-tmp` at the end. The `.gitignore` also lists these patterns so a forgotten cleanup never ends up in a commit.

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

## When do these files need to be edited?

- Add an entry under `lookForAlignDelims` whenever a new table-like environment shows up (`tabularray`, `NiceTabular`, custom `\newenvironment`).

- Toggle `BeginStartsOnOwnLine` / `EndStartsOnOwnLine` only if a project's house style genuinely differs.

- **Do not** put per-warning suppression here. `latexindent` does not lint, it only formats. Lint suppression lives in [`./chktex.md`](./chktex.md) and the `Makefile`'s `CHKTEX_NOWARN`.

[latexindent]: https://latexindentpl.readthedocs.io
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
