# @croutonn/typescript-react-component-type
> enforce `FC` and `FunctionComponent` types to one or the other
> - ⭐️ This rule is included in `plugin:@croutonn/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

By enforcing or not suppressing the React component type, a sense of unity is created.
You can also enforce `React.FunctionComponent` if "Do not omit" is recommended as a style guide for naming.

## Rule Details

This rule enforces the React component type to either `React.FC` or `React.FunctionComponent`.
(Similarly, enforce rules on `VFC` and `VoidFunctionComponent`.)

## Options

This rule has either a string option:

- `"omit"` (default) enforces consistent use of `React.FC` and `React.VFC`
- `"raw"` enforces consistent use of `React.FunctionComponent` and `React.VoidFunctionComponent`

## Implementation

- [Rule source](../../lib/rules/typescript-react-component-type.js)
- [Test source](../../tests/lib/rules/typescript-react-component-type.js)
