# html-validate

[`html-validate`][html-validate] catches HTML bugs that browsers silently swallow: missing `alt` attributes, duplicate `id`s, invalid nesting, label/control mismatches, ARIA misuse. Browsers do their best to render broken HTML, which means real accessibility and SEO bugs ship to production unnoticed.

## Contents

|         file         | purpose                        |
| :------------------: | :----------------------------- |
| `.htmlvalidate.json` | Rules + base preset extension. |

## Where does it go?

Project root:

```text
.htmlvalidate.json
```

## Tool

[`html-validate`][html-validate] runs as an `npm` package and as the [`html-validate.vscode-html-validate`][ext-htmlvalidate] editor extension.

Install:

```bash
npm install --save-dev html-validate
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|       script        | what does it do?                            |
| :-----------------: | :------------------------------------------ |
| `npm run lint:html` | Run `html-validate` on every `*.html` file. |

> Note: `html-validate` has **no `--fix` mode**. All issues are fixed manually.

## What does it enforce?

```json
{
    "extends": ["html-validate:recommended"],
    "rules": {
        "void-style": ["error", { "style": "selfclosing" }],
        "no-trailing-whitespace": "error",
        "no-inline-style": "off"
    }
}
```

## Rule-by-rule

### `extends: ["html-validate:recommended"]`

Inherits ~50 rules covering the bug-class issues:

- `element-required-attributes`: `<img>` must have `src` and `alt`, `<a>` must have `href`, etc.

- `no-dup-id`: every `id="..."` must be unique on the page.

- `element-permitted-content`: e.g. `<button>` cannot contain another `<button>`, `<p>` cannot contain `<div>`.

- `wcag/h37`: `<img>` must have non-empty `alt` (decorative images use `alt=""`).

- `valid-id`: `id` values must match the HTML5 spec.

The full list lives at [html-validate.org/rules][html-validate-rules].

### `void-style: ["error", { "style": "selfclosing" }]`

Void elements (`<br>`, `<hr>`, `<img>`, `<input>`, `<meta>`, `<link>`, etc.) must be **self-closing** (`<br />` rather than `<br>`). Personal preference, XHTML-flavored HTML, which Prettier also produces.

```html
<!-- Bad -->
<br />
<hr />
<img src="a.png" alt="" />
<input type="text" name="email" />

<!-- Good -->
<br />
<hr />
<img src="a.png" alt="" />
<input type="text" name="email" />
```

To switch to the bare-tag style instead, set `"style": "omit"`.

### `no-trailing-whitespace: "error"`

Strip trailing spaces / tabs at end of line. Same as the `.editorconfig` rule, restated here so `npm run lint:html` fails on any whitespace that slipped through.

### `no-inline-style: "off"`

**Disabled**. I allow `style="..."` for prototyping and one-off tweaks. Re-enable it (`"error"`) once the project has a real CSS pipeline:

```json
"no-inline-style": "error"
```

## Examples

```html
<!-- Bad: missing alt -->
<img src="logo.png" />
<!-- Error: alt is required (WCAG H37) -->

<!-- Bad: duplicate id -->
<input id="email" type="email" />
<input id="email" type="text" />
<!-- Error: duplicate id "email" -->

<!-- Bad: invalid nesting -->
<p>
    <div>nested block in inline element</div>
</p>
<!-- Error: <div> not permitted as content of <p> -->

<!-- Bad: <a> without href -->
<a onclick="...">click</a>
<!-- Error: <a> requires href (use <button> for actions) -->

<!-- Bad: button inside button -->
<button>
    Outer
    <button>Inner</button>
</button>
<!-- Error: <button> not permitted as content of <button> -->
```

### What "self-closing" means in HTML5

HTML5 does not require the `/`, but does not forbid it either. The `/` is significant in:

- **JSX / Vue / Svelte**: required.

- **XHTML**: required.

- **HTML5**: optional, but consistent with the above frameworks.

Setting `void-style: selfclosing` means a project's HTML and component templates use the same syntax, reducing context switching.

## Per-project overrides

### Disabling rules that conflict with a framework

Some templating engines emit non-standard attributes (`v-if`, `:href`, `@click`, `wire:click`). The recommended preset's `attribute-allowed-values` may flag them as errors:

```json
{
    "extends": ["html-validate:recommended"],
    "rules": {
        "attribute-allowed-values": "off",
        "no-unknown-elements": "off",
        "void-style": ["error", { "style": "selfclosing" }],
        "no-trailing-whitespace": "error",
        "no-inline-style": "off"
    }
}
```

### Vue / Svelte templates

`html-validate` does not parse `.vue` or `.svelte` directly. Use the framework's own linter (`eslint-plugin-vue`, `eslint-plugin-svelte`) for those and keep `html-validate` for static `.html` only.

### Project-specific id pattern

```json
"valid-id": ["error", { "format": "[a-z][a-zA-Z0-9-]*" }]
```

## When do these files need to be edited?

- Disable rules that fight your templating engine (Vue, Svelte, Liquid, Jinja, Handlebars).

- Re-enable `no-inline-style` once the project has a CSS pipeline.

- Add an `elements` block to teach `html-validate` about custom elements (web components).

[html-validate]: https://html-validate.org
[html-validate-rules]: https://html-validate.org/rules/index.html
[ext-htmlvalidate]: https://marketplace.visualstudio.com/items?itemName=html-validate.vscode-html-validate
