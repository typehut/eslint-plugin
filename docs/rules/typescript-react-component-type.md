# @croutonn/typescript-react-component-type
> enforce `FC` and `FunctionComponent` types to one or the other
> - ⭐️ This rule is included in `plugin:@croutonn/recommended` preset.

By enforcing or not suppressing the React component type, a sense of unity is created.
You can also enforce `React.FunctionComponent` if "Do not omit" is recommended as a style guide for naming.

## Rule Details

This rule enforces the React component type to either `React.FC` or `React.FunctionComponent`.

## Options

This rule has either a string option:

- `"FC"` (default) enforces consistent use of `React.FC`
- `"FunctionComponent"` enforces consistent use of `React.FunctionComponent`

## Implementation

- [Rule source](../../lib/rules/typescript-react-component-type.js)
- [Test source](../../tests/lib/rules/typescript-react-component-type.js)
