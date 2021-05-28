# @typehut/typescript-react-require-props-type
> require an props type to be provided to a React component
> - ⭐️ This rule is included in `plugin:@typehut/recommended` preset.

Because the `react/prop-types` rule of `eslint-plugin-react` cannot trace the type of props from the type annotation of the variable declaration of the function expression, I created a rule that only checks for the existence of the type of props.

It is recommended that you also add `"react/prop-types": "off"` to your configuration when using it.

## Rule Details

This rule checks for the existence of the type of props in the React component.

## Options

No options

## Implementation

- [Rule source](../../lib/rules/typescript-react-require-props-type.js)
- [Test source](../../tests/lib/rules/typescript-react-require-props-type.js)
