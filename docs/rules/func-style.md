# @croutonn/func-style
> enforce consistent use of `function` declarations or expressions
> - ⭐️ This rule is included in `plugin:@croutonn/recommended` preset.

> enforce consistent use of `function` declarations or expressions at the top-level context.
>
> - ⭐️ This rule is included in `plugin:@croutonn/recommended` preset.

The built-in func-style rule do not enforce arrow function expressions. It is also impossible to force a different style only in the top-level context.

This rule can have three styles of arrow, declaration, and expression in the top-level and below context!

## Rule Details

This rule enforces consistent use of `function` declarations or expressions or arrow expressions.

## Options

This rule has either a string option:

- `"arrow"` (default) enforces consistent use of arrow function expression
- `"declaration"` enforces consistent use of function declarations
- `"expression"` enforces consistent use of function expression

This rule has an object option for an exception:

- `"topLevelStyle"` `arrow | declaration | expression` enforces function style in top-level context.
- `"allowExportDefaultFunctionDeclaration"` true (default: `false`) Allow declarations for the default export even if you are configuring an `arrow` or `expression`.

## Implementation

- [Rule source](../../lib/rules/func-style.js)
- [Test source](../../tests/lib/rules/func-style.js)
