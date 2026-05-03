# ChkTeX

`ChkTeX` owns **what code does** in the LaTeX sense, bug-class warnings like missing `~` before `\cite`, wrong dashes (`-` vs `--` vs `---`), `$$...$$` math, unbalanced braces. It does not format whitespace, see [`./latexindent.md`](./latexindent.md) for that.

## Contents

|    file     | purpose                                                                 |
| :---------: | :---------------------------------------------------------------------- |
| `.chktexrc` | Project-specific command-list overrides; merges with the system rcfile. |

Warning-number suppression (e.g. silencing warning 36 because it false-positives on `\cite{...}(...)` ) is **not** in this file. It lives in the `Makefile` as the `CHKTEX_NOWARN` variable, see below.

## Where does it go?

Project root:

```text
.chktexrc
```

## Tool

[`ChkTeX`][chktex] is a C tool that ships with TeX Live. It reads `.tex` files and reports warnings numbered roughly 1 through 46. Run `man chktex` for the full list.

Install (already on every TeX Live install):

```bash
sudo pacman -S --needed texlive-meta
```

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] runs `chktex` on save and surfaces results in the Problems panel; see [`./vscode.md`](./vscode.md).

## Make targets

|    target    | what does it do?                                                   |
| :----------: | :----------------------------------------------------------------- |
| `make lint`  | Run `chktex` over every `.tex` file; non-zero exit on any warning. |
| `make check` | `format-check` + `lint` + `build`. CI gate.                        |

## Anatomy of the config

```ini
WipeArg
{
    \addbibresource:{}
}
```

> That is it. Almost nothing and that is deliberate.

## Two facts that drive the minimalism

### The local rcfile **merges** with the system rcfile

`chktex -l .chktexrc` **add** to whatever is in `/etc/texmf/chktex/chktexrc` (Arch / Debian) or `<TEXMFDIST>/chktex/chktexrc`, it does not replace it. The system rc already wipes the arguments of every common command:

```tex
\input \include \cite \nocite \ref \eqref \vref \pageref
\label \index \graphicspath ...
```

Duplicating those locally would be redundant. The local `.chktexrc` is reserved for **project-specific** commands the system rc never heard of.

### `Silent { ... }` and `WipeArg { ... }` take command names, not warning numbers

The block names sound like they would silence warnings, but they do not:

- `Silent { \noindent \linebreak ... }` lists commands that are **allowed to terminate with a space** (warning 1). It does not silence warning 1; it just exempts those commands from it.

- `WipeArg { \input:{} \cite:{} ... }` lists commands whose arguments should be ignored (so `\cite{Knuth1984}` is treated as if `Knuth1984` were not there).

Trying to silence warning 36 by writing `Silent { 36 }` is a no-op.

**Warning-number suppression is done via `chktex -n N` flags** and those live in the `Makefile`, not here.

## What does`.chktexrc` do?

Just the `WipeArg` block for `\addbibresource` (used by `biblatex` with `biber` projects). Without this, `chktex` lints the bibliography file path as if it were prose and emits noise warnings for every `.bib` file referenced.

```properties
WipeArg
{
    \addbibresource:{}
}
```

The `:{}` means "the command takes one mandatory argument and we want chktex to ignore it".

## Make-target invocation

The `Makefile` runs the linter as:

```bash
chktex -q -I0 -l .chktexrc $(CHKTEX_NOWARN) "$file"
```

|      flag      | what does it do?                                                                |
| :------------: | :------------------------------------------------------------------------------ |
|      `-q`      | Quiet, only emit warnings, no per-file headers.                                 |
|     `-I0`      | Do **not** follow `\input` / `\include`.                                        |
| `-l .chktexrc` | Load the local rcfile in addition to the system one.                            |
|     `-n N`     | Suppress warning `N`. The `CHKTEX_NOWARN` variable expands to several of these. |

### Why `-I0`?

Without it, every `\include`d file gets linted multiple times, once per `\include` chain that reaches it. A thesis with `main.tex` `\include`-ing 10 chapters would lint each chapter once for the include and once for the standalone walk = ~5x inflated warning counts and unstable line-number reports. `-I0` skips include traversal; the make target lints every `.tex` file as a peer instead.

### `CHKTEX_NOWARN`

The current set of suppressed warnings:

|  flag   |                      warning text                       |                              rationale                               |
| :-----: | :-----------------------------------------------------: | :------------------------------------------------------------------: |
| `-n 1`  |            "Command terminated with space."             |     Style: `\left`, `\right` and other `\cmd` followed by space.     |
| `-n 12` |   "Interword spacing (`\ `) should perhaps be used."    |     Pedantic, fires after every abbreviation like `Mr.` / `Dr.`.     |
| `-n 13` | "Intersentence spacing (`\@`) should perhaps be used."  |       Pedantic, fires when sentences end with capital letters.       |
| `-n 24` | "Delete this space to maintain correct pagereferences." |    Pre-`\label` whitespace, sub-pixel impact on page references.     |
| `-n 36` |    "You should put a space in front of parenthesis."    |        False positives with `\cite{...}(...)` and `text(s)`.         |
| `-n 37` |   "You should avoid spaces in front of parenthesis."    | Style: `\left (` and `\right )` patterns put a space before a paren. |

These six fire on idiomatic or stylistic constructs that no human reader would call wrong. The remaining ~40 warnings stay enabled.

## Bug-class warnings the project catches

These are the warnings `make lint` will fail on. Each is a real LaTeX issue:

```latex
% Warning 2: missing ~ before \cite (allows ugly line break before the citation)
See [1] for details.         % Bad
See~\cite{knuth1984} for ... % Good

% Warning 8: hyphen used where en-dash is meant
pages 100-110                % Bad
pages 100--110               % Good

% Warning 9: $$ ... $$ math (plain TeX, breaks spacing and equation numbering)
$$ E = mc^2 $$                % Bad
\[ E = mc^2 \]                % Good

% Warning 26: space before punctuation
The result is : 42             % Bad
The result is: 42              % Good

% Warning 46: \frac used in inline math (cramped)
The ratio $\frac{a}{b}$ ...    % Bad
The ratio $a/b$ ...            % Good (or use \displaystyle)
```

Run `man chktex` for the full warning list with examples.

## Suppressed warnings: why each is in `CHKTEX_NOWARN`

Concrete cases that produced false positives:

```latex
% Warning 1: "Command terminated with space"
$\arccos \left ( \frac{ a + b }{ c } \right )$
% Personal style: \left and \right are written with a space before the delimiter,
% and spaces inside braces are kept for source readability
% Without -n 1, every \left/\right and \cmd-followed-by-space gets flagged
% Warning 12 / 13: interword / intersentence spacing
Mr. Smith arrived at 9:00.
% chktex wants `Mr.\ Smith` to fix the period-spacing
% Microtypographically correct, but unreadable in source

% Warning 24: pre-label whitespace
\section{Introduction} \label{sec:intro}
% chktex wants \section{Introduction}\label{sec:intro} (no space)
% The space affects nothing in the rendered PDF; removing it makes source harder to scan

% Warning 36: "Space in front of parenthesis"
See \cite{author2020}(p. 42).
% chktex sees \cite{...}(...) as "missing space"
% In context this is the correct way to typeset a parenthetical page reference

% Warning 37: "You should avoid spaces in front of parenthesis"
$ \arccos \left ( x + y \right ) $
% Personal style: \left ( and \right ) put a deliberate space before the paren
% Same trigger as -n 1 above; both must be suppressed for sized-delimiter math to lint cleanly
```

If a project never uses `\cite{...}(...)` patterns, you can drop `-n 36` to keep that warning enabled. Likewise, drop `-n 37` if the project does not use `\left (` / `\right )` style. Edit `CHKTEX_NOWARN` in the `Makefile` directly.

## Per-project tweaks

### Adding a custom command to `WipeArg`

Anytime the project introduces a command whose arguments should not be linted (e.g. a custom `\citeauthor`, `\fullcite`, or a tikz environment that takes nested LaTeX as a string), add it to `.chktexrc`:

```properties
WipeArg
{
    \addbibresource:{}
    \fullcite:{}
    \mycustomenv:{}{}    % takes two mandatory args
}
```

The `:{}{}` syntax encodes the argument signature. See `man chktex` and the system `chktexrc` for examples.

### Re-enabling a suppressed warning

Edit `CHKTEX_NOWARN` in the `Makefile`, **not** this file. To stop suppressing warning 36:

```makefile
CHKTEX_NOWARN := -n 1 -n 12 -n 13 -n 24
```

### Suppressing per-line, not project-wide

Instead of adding to `CHKTEX_NOWARN`, you can suppress a single line in the `.tex` source:

```latex
% chktex 36
See \cite{author2020}(p. 42).
```

Put the magic comment on the line **before** the offending construct. Useful when the warning is right 99 % of the time and you only want to silence one false positive.

## When do these files need to be edited?

- Extend `WipeArg` with any custom command whose arguments should not be linted.

- **Do not** put `-n N` flags here. They go in the `Makefile`'s `CHKTEX_NOWARN`.

- **Do not** duplicate the system rcfile's `WipeArg` entries (`\cite`, `\ref`, `\label`, etc.). They merge automatically.

[chktex]: https://www.nongnu.org/chktex
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
