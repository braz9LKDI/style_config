# markdownlint

[`markdownlint`][markdownlint] catches structural issues in Markdown: heading-level skips, mixed list markers, missing fenced-code language tags, broken reference links. Layout (line wrapping and indent) is handled by Prettier, see [`prettier.md`](./prettier.md).

## Contents

|         file          | purpose                                        |
| :-------------------: | :--------------------------------------------- |
| `.markdownlint.jsonc` | Rule overrides on top of the default rule set. |
| `.markdownlintignore` | Glob list of files / directories to skip.      |

## Where does it go?

Project root:

```text
.markdownlint.jsonc
.markdownlintignore
```

## Tool

[markdownlint][markdownlint] is run via [`markdownlint-cli2`][markdownlint-cli2] and the [`davidanson.vscode-markdownlint`][ext-markdownlint] editor extension.

Install:

```bash
npm install --save-dev markdownlint-cli2
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|      script       | what does it do?                              |
| :---------------: | :-------------------------------------------- |
| `npm run lint:md` | Run `markdownlint-cli2` on every `*.md` file. |

## What does it enforce?

```json
{
    // https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
    "default": true,
    "MD013": false, // Line length, let Prettier handle wrapping
    "MD041": false // First line does not have to be a top-level heading
}
```

`"default": true` enables all ~55 rules (named `MD001`..`MD059`); the keys below disable specific ones.

## Rule-by-rule (the disabled ones)

### `MD007: { "indent": 4 }` (unordered list indentation)

Nested list items use 4-space indentation instead of the default 2 spaces.

## `"MD010": { "spaces_per_tab": 4 }`

Hard tab characters are equivalent to 4 spaces instead of the default 1 space.

### `MD013: false` (line length)

Disabled. Prettier's `proseWrap: "never"` keeps each paragraph on one long line, which produces clean diffs (a one-word change shows up as one line, not five). `MD013` would warn on every line over 80 chars; the two settings would fight.

```md
<!-- This is fine in our config -->

This is a long paragraph that explains some concept in detail and would normally be hard-wrapped at 80 columns, but we let Prettier control wrapping and Prettier prefers no wrap.
```

### `"MD033": { "allowed_elements": ["br"] }`

Allow `<br>` HTML tags for line breaks in Markdown table cells.

### `MD041: false` (first line must be a top-level heading)

Disabled. Useful for content with frontmatter, badges, or admonitions before the title:

```md
---
title: Post
date: 2024-01-01
---

[![CI](badge.svg)](ci.yml)

# My post

...
```

Without this override, the YAML frontmatter or the badge line would trigger the rule.

## Examples (rules still enabled)

The full list lives at [markdownlint Rules][markdownlint-rules]; here are the ones that fire most often:

### `MD001` (heading-level increment)

Headings must increment by one level at a time. Do not skip from `#` straight to `###`.

```md
<!-- Bad -->

# Title

### Subsection <!-- skipped ## -->

<!-- Good -->

# Title

## Section

### Subsection
```

### `MD003` (heading style consistency)

Pick one heading style and stick with it.

```md
<!-- Bad: ATX and Setext mixed -->

# Title

## Subtitle

<!-- Good: all ATX -->

# Title

## Subtitle
```

### `MD004` (list marker style)

Use one bullet character throughout a document.

```md
<!-- Bad -->

- item 1

* item 2

- item 3

<!-- Good -->

- item 1
- item 2
- item 3
```

### `MD009` (trailing spaces)

No trailing spaces (except the rare `  ` line break, which Prettier converts to `\` anyway).

### `MD012` (multiple consecutive blanks)

Collapse triple-blank-line "paragraph breaks" to a single blank line.

```md
<!-- Bad -->

First paragraph.

Second paragraph.

<!-- Good -->

First paragraph.

Second paragraph.
```

### `MD018` (no-space after hash on a heading)

```md
<!-- Bad -->

#Heading

<!-- Good -->

# Heading
```

### `MD022` (blanks around headings)

A heading must have a blank line before and after.

```md
<!-- Bad -->

Some text.

## Heading

More text.

<!-- Good -->

Some text.

## Heading

More text.
```

### `MD031` (blanks around fenced code blocks)

Same idea of `MD022`, for code blocks.

### `MD034` (bare URLs)

Wrap bare URLs in `<...>` or use a real link.

```md
<!-- Bad -->

See https://example.com for details.

<!-- Good -->

See <https://example.com> for details. See [the docs](https://example.com) for details.
```

### `MD040` (fenced code blocks should specify a language)

````md
<!-- Bad -->

```
echo hi
```

<!-- Good -->

```bash
echo hi
```
````

### `MD042` (no empty links)

```md
<!-- Bad -->

[click here]()

<!-- Good -->

[click here](https://example.com)
```

### `MD046` (code-block style)

Use fenced code blocks (` ``` `), not indented ones.

## `.markdownlintignore`

```gitignore
node_modules/
```

Same syntax as `.gitignore`. Add anything generated, vendored, or copied verbatim from elsewhere:

```gitignore
node_modules/
build/
dist/
public/
CHANGELOG.md # Auto-generated
docs/api/    # Generated API reference
LICENSE.md   # Third-party text, not ours to lint
```

### `markdownlint-cli2 --fix`

`markdownlint-cli2` supports a partial `--fix`: it auto-fixes whitespace, list markers, blank-line spacing, but leaves semantic errors (heading skips, missing language tags and empty links) for the author.

|              rule              | auto-fixable? |
| :----------------------------: | :-----------: |
|    `MD009` trailing spaces     |      yes      |
|    `MD012` multiple blanks     |      yes      |
| `MD022` blanks around headings |      yes      |
|   `MD031` blanks around code   |      yes      |
|    `MD040` missing language    |    **no**     |
|       `MD042` empty link       |    **no**     |
|        `MD034` bare URL        |    **no**     |

## Per-project overrides

### Disable a rule globally

Add to `.markdownlint.jsonc`:

```jsonc
{
    "default": true,
    "MD013": false,
    "MD041": false,
    "MD024": false, // duplicate headings, useful for changelogs
}
```

### Disable a rule per file (inline)

```md
<!-- markdownlint-disable MD033 -->
<details><summary>raw HTML allowed below</summary>

content...

</details>
<!-- markdownlint-enable MD033 -->
```

### Allow specific HTML tags

`MD033` (no-inline-html) is enabled by default but lets you whitelist tags:

```jsonc
{
    "MD033": { "allowed_elements": ["details", "summary", "kbd", "br"] },
}
```

## When do these files need to be edited?

- Add an `MDxxx: false` line whenever a rule conflicts with a writing style you actually use (e.g. `MD024: false` for changelogs that repeat `## [version]` headings).

- Extend `.markdownlintignore` with any generated docs.

[markdownlint]: https://github.com/DavidAnson/markdownlint
[markdownlint-rules]: https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[ext-markdownlint]: https://marketplace.visualstudio.com/items?itemName=davidanson.vscode-markdownlint
