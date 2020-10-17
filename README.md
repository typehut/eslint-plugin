# @croutonn/eslint-plugin

<!--
[![npm version](https://img.shields.io/npm/v/@croutonn/eslint-plugin.svg)](https://www.npmjs.com/package/@croutonn/eslint-plugin)
[![Downloads/month](https://img.shields.io/npm/dm/@croutonn/eslint-plugin.svg)](http://www.npmtrends.com/@croutonn/eslint-plugin)
[![Build Status](https://travis-ci.org/croutonn/eslint-plugin.svg?branch=main)](https://travis-ci.org/croutonn/eslint-plugin)
[![Coverage Status](https://codecov.io/gh/croutonn/eslint-plugin/branch/main/graph/badge.svg)](https://codecov.io/gh/croutonn/eslint-plugin)
[![Dependency Status](https://david-dm.org/croutonn/eslint-plugin.svg)](https://david-dm.org/croutonn/eslint-plugin)
-->

This is a plugin that puts the ESLint rules I have wanted into one place.

## Installation

Use [npm](https://www.npmjs.com/) or a compatibility tool to install.

```
$ npm install --save-dev eslint @croutonn/eslint-plugin
```

### Requirements

- Node.js v8.10.0 or newer versions.
- ESLint v5.16.0 or newer versions.

## Usage

Write your config file such as `.eslintrc.yml`.

```yml
plugins:
  - "@croutonn"
rules:
  "@croutonn/func-style":
    - error
    - arrow
    - topLevelStyle: declaration
```

See also [Configuring ESLint](https://eslint.org/docs/user-guide/configuring).

## Configs

- `@croutonn/recommended` ... enables the recommended rules.

## Rules

<!--RULE_TABLE_BEGIN-->
### Stylistic Issues

| Rule ID | Description |    |
|:--------|:------------|:--:|
| [@croutonn/func-style](./docs/rules/func-style.md) | enforce consistent use of `function` declarations or expressions | ⭐️✒️ |

<!--RULE_TABLE_END-->

## Semantic Versioning Policy

This plugin follows [Semantic Versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Changelog

- [GitHub Releases](https://github.com/croutonn/eslint-plugin/releases)

## Contributing

Welcome your contribution!

See also [ESLint Contribution Guide](https://eslint.org/docs/developer-guide/contributing/).

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm version <TYPE>` updates the package version. And it updates `lib/configs/recommended.js`, `lib/index.js`, and `README.md`'s rule table. See also [npm version CLI command](https://docs.npmjs.com/cli/version).
- `npm run add-rule <RULE_ID>` creates three files to add a new rule.
