# @typehut/typescript-react-require-props-suffix

> require that prop interface names be suffixed with `Props`
>
> - ⭐️ This rule is included in `plugin:@typehut/recommended` preset.

The suffix `Props` makes the code easier to read by making it clear that it is of type props for React components.

**Note: This rule works only with function components, ignoring the `SFC` and `StatelessComponent` types. .**

## Rule Details

This rule enforces the suffix `Props` on the types of props in React components.

## Options

No options

## Implementation

- [Rule source](../../lib/rules/typescript-react-require-props-suffix.js)
- [Test source](../../tests/lib/rules/typescript-react-require-props-suffix.js)
