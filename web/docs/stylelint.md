# Stylelint

Stylelint owns **CSS correctness and naming**, not formatting (Prettier handles whitespace, see [`./prettier.md`](./prettier.md)). This config extends [`stylelint-config-standard`][stylelint-config-standard] and adds a few extra rules to enforce kebab-case naming and short hex colors.

## Contents

|        file         | purpose                                     |
| :-----------------: | :------------------------------------------ |
| `.stylelintrc.json` | Rules, file ignores, base preset extension. |

## Where does it go?

Project root:

```text
.stylelintrc.json
```

## Tool

[Stylelint][stylelint] runs as an `npm` package and as the [`stylelint.vscode-stylelint`][ext-stylelint] editor extension.

Install:

```bash
npm install --save-dev stylelint stylelint-config-standard
```

The CLI scripts merged from [`../package.sample.json`](../package.sample.json):

|       script       | what does it do?                               |
| :----------------: | :--------------------------------------------- |
| `npm run lint:css` | Run Stylelint on every `*.css` file.           |
|   `npm run fix`    | Prettier + `eslint --fix` + `stylelint --fix`. |

## What does it enforce?

```json
{
    "extends": ["stylelint-config-standard"],
    "rules": {
        "selector-class-pattern": [
            "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
            { "message": "Expected class selector to be kebab-case" }
        ],
        "custom-property-pattern": [
            "^[a-z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*$",
            { "message": "Expected custom property to be kebab-case" }
        ],
        "color-hex-length": "short",
        "declaration-block-no-redundant-longhand-properties": true,
        "shorthand-property-no-redundant-values": true,
        "no-descending-specificity": null
    },
    "ignoreFiles": ["node_modules/**", "**/*.min.css"]
}
```

## Rule-by-rule

### `extends: ["stylelint-config-standard"]`

Inherits ~80 rules covering syntax errors (unknown properties, invalid units, duplicate properties), best practices (no `!important` abuse, no shorthand silently overriding earlier longhands) and modern-CSS conventions.

### `selector-class-pattern: "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"`

Class names must be **strict kebab-case**: lowercase letters and digits, hyphen-separated, starting with a letter.

```css
/* Good */
.button {
}
.primary-button {
}
.user-avatar-32 {
}

/* Bad */
.Button {
} /* uppercase */
.primaryButton {
} /* camelCase */
.primary_button {
} /* snake_case */
.--primary {
} /* leading non-letter */
```

Override pattern (see "Per-project overrides" below) for **BEM** or **CSS Modules**.

### `custom-property-pattern: "^[a-z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*$"`

CSS custom properties (variables) must follow the same kebab-case-ish rule, slightly more permissive (allows interior camelCase) to play nicely with design-token systems that pull from JS objects.

```css
/* Good */
:root {
    --primary-color: #fff;
    --font-size-large: 1.25rem;
    --color-background-hover: #eee;
}

/* Bad */
:root {
    --PrimaryColor: #fff; /* leading uppercase */
    --primary_color: #fff; /* snake_case */
}
```

### `color-hex-length: "short"`

Use the 3-digit form when possible.

```css
/* Good */
color: #fff;
background: #f00;

/* Bad, auto-fixable */
color: #ffffff;
background: #ff0000;
```

### `declaration-block-no-redundant-longhand-properties: true`

If you set every longhand of a shorthand, write the shorthand instead.

```css
/* Bad */
.box {
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
    margin-left: 0;
}

/* Good */
.box {
    margin: 0;
}
```

### `shorthand-property-no-redundant-values: true`

Drop repeated values in a shorthand.

```css
/* Bad */
margin: 0 0 0 0;
padding: 1rem 1rem;
border-radius: 4px 4px 4px 4px;

/* Good */
margin: 0;
padding: 1rem;
border-radius: 4px;
```

### `no-descending-specificity: null`

**Disabled**. This rule warns when a low-specificity selector appears later than a higher-specificity one targeting the same element. In practice it generates dozens of false positives in any non-trivial stylesheet (any `.foo a` followed by `a:hover` triggers it). Not worth the noise.

```css
.nav a {
    color: blue;
} /* Specificity (0,1,1) */
a:hover {
    color: red;
} /* Specificity (0,1,0), would fire the rule */
```

### `ignoreFiles: ["node_modules/**", "**/*.min.css"]`

Skip `node_modules` and minified CSS. Linting minified CSS produces line-1 errors and is never useful.

### What `--fix` auto-applies

|                         rule                         | auto-fixable? |
| :--------------------------------------------------: | :-----------: |
|                  `color-hex-length`                  |      yes      |
|       `shorthand-property-no-redundant-values`       |      yes      |
| `declaration-block-no-redundant-longhand-properties` |      yes      |
|               `selector-class-pattern`               |    **no**     |
|              `custom-property-pattern`               |    **no**     |

Identifier renames are your job, usually a project-wide find-and-replace.

### Full file before / after

Before:

```css
.MyButton {
    background-color: #ffffff;
    color: #ff0000;
    margin-top: 1rem;
    margin-right: 1rem;
    margin-bottom: 1rem;
    margin-left: 1rem;
}
```

After Prettier + `stylelint --fix` + manual rename `MyButton` -> `my-button`:

```css
.my-button {
    background-color: #fff;
    color: #f00;
    margin: 1rem;
}
```

## Per-project overrides

### BEM (`block__element--modifier`)

```json
"selector-class-pattern": [
    "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
    { "message": "Expected class selector to be BEM (block__element--modifier)" }
]
```

### CSS Modules (camelCase classes for JS interop)

```json
"selector-class-pattern": [
    "^[a-z][a-zA-Z0-9]*$",
    { "message": "Expected class selector to be camelCase (CSS Modules)" }
]
```

Matches `.button`, `.primaryButton`. Useful when JSX accesses classes as `styles.primaryButton`.

### Tailwind / utility-first

If your CSS only contains `@apply` directives and you barely write custom classes, just disable the class pattern:

```json
"selector-class-pattern": null
```

### SCSS / Less

Add the corresponding `customSyntax`:

```json
{
    "extends": ["stylelint-config-standard-scss"],
    "customSyntax": "postcss-scss"
}
```

Then `npm install --save-dev stylelint-config-standard-scss postcss-scss`.

## When do these files need to be edited?

- Loosen `selector-class-pattern` if the project uses BEM, CSS Modules, or any non-default convention.

- Switch the preset (`extends`) for SCSS / Less / styled-components.

- **Do not** add formatting rules. Prettier owns formatting.

[stylelint]: https://stylelint.io
[stylelint-config-standard]: https://github.com/stylelint/stylelint-config-standard
[ext-stylelint]: https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint
