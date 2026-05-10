# EditorConfig

Universal editor settings shared by every project, regardless of language. One file, one purpose: stop whitespace drift between machines and editors.

## Contents

|      file       |                             purpose                              |
| :-------------: | :--------------------------------------------------------------: |
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
```

## Option-by-option

### `root = true`

Stops EditorConfig from walking up the directory tree past this file. Without it, a stray `.editorconfig` in your home directory could silently override the project's settings.

### `charset = utf-8`

Saves files as UTF-8 with no BOM. Avoids the classic "weird characters" bug on Windows when sharing files with Linux/macOS teammates.

### `end_of_line = lf`

Unix line endings (`\n`), even on Windows. Combined with `core.autocrlf=false` in your `.gitconfig`, this guarantees identical bytes on every machine.

### `insert_final_newline = true`

Adds a trailing newline at the end of every file. POSIX requires it; many tools (`cat`, `git diff` and shell `read`) misbehave without it.

### `trim_trailing_whitespace = true`

Strips trailing spaces and tabs on save.

### `indent_style` and `indent_size`

Default indentation: 4 spaces, no tabs.

## Examples

### Diff caused by missing EditorConfig

Two developers, no `.editorconfig`. One is on VS Code (default 4 spaces), the other on Sublime Text (default tab):

```diff
- def foo():
-     return 1 <- 4 spaces
+ def foo():
+ →return 1    <- tab
```

Every save flips the indentation, every commit shows the whole file as changed. EditorConfig fixes it permanently.

### Trailing whitespace cleanup

Save the following file in any editor configured for `.editorconfig`:

```python
def greet(name):···
    return f"Hello, {name}"···
```

(`···` = trailing spaces). On save, you get:

```python
def greet(name):
    return f"Hello, {name}"
```

## Per-project overrides

Most projects do not need to override anything, but the spec supports per-glob overrides. Common cases:

```ini
# Go uses tabs by convention
[*.go]
indent_style = tab
```

Add the block at the bottom of `.editorconfig`. Globs are matched in order, last match wins.

[editorconfig]: https://editorconfig.org
[ext-editorconfig]: https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig
