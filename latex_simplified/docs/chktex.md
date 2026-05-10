# ChkTeX

`ChkTeX` owns **what code does** in the LaTeX sense, bug-class warnings like missing `~` before `\cite`, wrong dashes (`-` vs `--` vs `---`), `$$...$$` math, unbalanced braces. It does not format whitespace, see [`./latexindent.md`](./latexindent.md) for that.

## Contents

|    file     | purpose                                                                 |
| :---------: | :---------------------------------------------------------------------- |
| `.chktexrc` | Project-specific command-list overrides; merges with the system rcfile. |

## Where does it go?

Project root:

```text
.chktexrc
```

## Tool

[`ChkTeX`][chktex] is a C tool that ships with TeX Live. It reads `.tex` files and reports numbered warnings. Run `man chktex` for the full warning list.

Install (already on every TeX Live install):

```bash
sudo pacman -S --needed texlive-meta
```

Editor extension: [`james-yu.latex-workshop`][ext-latex-workshop] runs ChkTeX on save and surfaces results in the Problems panel; see [`./vscode.md`](./vscode.md).

## Anatomy of the config

```ini
WipeArg
{
    \addbibresource:{}
}
```

> That is it. Almost nothing and that is deliberate.

## What does `.chktexrc` do?

The local rcfile merges with the system rcfile, it does not replace it. The system rc already knows common commands like `\input`, `\include`, `\cite`, `\ref`, `\label`, and `\graphicspath`.

This stack adds one local override:

```properties
WipeArg
{
    \addbibresource:{}
}
```

`\addbibresource` comes from `biblatex`. Without the `WipeArg` entry, ChkTeX treats the bibliography file path as text and may warn about punctuation or spacing inside `references.bib`.

The `:{}` means "this command takes one mandatory argument and ChkTeX should ignore that argument while linting."

## Warning suppression

This simplified stack does not ship a `Makefile`, so warning-number suppression is not centralized here. That is intentional:

- `.chktexrc` is for command behavior like `WipeArg` and `Silent`.

- Warning numbers are suppressed with command-line flags, for example `-n 36`.

For a one-off command:

```bash
chktex -q -I0 -l .chktexrc -n 1 -n 12 -n 13 -n 24 -n 36 -n 37 main.tex
```

|      flag      | what does it do?                                     |
| :------------: | :--------------------------------------------------- |
|      `-q`      | Quiet output; no per-file headers.                   |
|     `-I0`      | Do not recursively lint files pulled in by `\input`. |
| `-l .chktexrc` | Load this project's local rcfile.                    |
|     `-n N`     | Suppress warning number `N` for this run.            |

If you want a canonical command-line lint gate, use the full [`/latex/`](/latex/README.md) stack. Its `Makefile` carries the `CHKTEX_NOWARN` list.

## Bug-class warnings worth keeping

These are examples ChkTeX is good at catching:

```latex
% Missing nonbreaking space before a citation
See \cite{knuth1984}.        % Bad
See~\cite{knuth1984}.        % Good

% Wrong dash length for a range
pages 100-110                % Bad
pages 100--110               % Good

% Plain TeX display math
$$ E = mc^2 $$                % Bad
\[ E = mc^2 \]                % Good

% Space before punctuation
The result is : 42            % Bad
The result is: 42             % Good
```

## Per-project tweaks

### Adding a custom command to `WipeArg`

Anytime the project introduces a command whose arguments should not be linted (e.g. a custom `\citeauthor`, `\fullcite`, or a tikz environment that takes nested LaTeX as a string), add it to `.chktexrc`:

```properties
WipeArg
{
    \addbibresource:{}
    \fullcite:{}
    \mycustomcite:{}{}
}
```

The `:{}{}` syntax encodes the argument signature. See `man chktex` and the system `chktexrc` for examples.

### Suppressing one line

Suppress a warning in source when it is a true one-off:

```latex
% chktex 36
See \cite{author2020}(p. 42).
```

Put the magic comment on the line before the warning.

### Matching editor and command-line warnings

LaTeX Workshop runs ChkTeX on save, but it does not know about any ad hoc shell command you use in CI. If exact parity matters, configure the editor's ChkTeX args in `.vscode/settings.json` or move to the full `latex/` stack.

## When does this file need to be edited?

- Extend `WipeArg` with custom commands whose arguments should not be linted.

- Do not duplicate system rcfile entries like `\cite`, `\ref`, or `\label`.

- Do not put warning numbers directly in `.chktexrc`; pass them as `chktex -n N` flags.

[chktex]: https://www.nongnu.org/chktex
[ext-latex-workshop]: https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop
