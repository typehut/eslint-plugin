"use strict";

const eslint = require("eslint");

/**
 * @returns {RuleTester}
 */
function RuleTester() {
  return new eslint.RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2015,
      ecmaFeatures: {
        jsx: true,
      },
      lib: ["dom", "dom.iterable", "esnext"],
      sourceType: "module",
    },
  });
}

module.exports = RuleTester;
