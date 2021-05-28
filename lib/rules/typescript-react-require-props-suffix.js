"use strict";

const t = require("../utils/types");

/**
 * @typedef {"requireSuffix"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  requireSuffix: "Prop interfaces must be suffixed with `Props`.",
};

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [];

/**
 * @type {RuleMetaData}
 */
const meta = {
  docs: {
    description: "require that prop interface names be suffixed with `Props`",

    category: "Best Practices",

    recommended: "error",
    url:
      "https://github.com/typehut/eslint-plugin/blob/main/docs/rules/typescript-react-require-props-suffix.md",
  },

  fixable: null,
  messages: errors,
  schema,

  type: "suggestion",
};

/**
 * Checks if a string is suffixed with "Props".
 * @param {string} name
 * @returns {boolean}
 */
function isSuffixedWithProps(name) {
  if (typeof name !== "string") {
    return false;
  }

  const minLength = "Props".length + 1;

  return name.length >= minLength && name.endsWith("Props");
}

/**
 * @type {RuleCreator}
 */
function create(context) {
  /**
   * @param {ASTNode} node
   * @returns {void}
   */
  function reportError(node) {
    context.report({
      node,
      messageId: "requireSuffix",
    });
  }

  /**
   * Core function of the rule
   * @param {TSQualifiedName} node target node
   * @returns {void}
   */
  function rule(node) {
    if (t.isReactFunctionComponent(node) && node.parent.typeParameters) {
      if (node.parent.typeParameters.params.length === 0) {
        reportError(node);
        return;
      }

      if (!node.parent.typeParameters.params[0].typeName) {
        return;
      }

      if (
        !isSuffixedWithProps(node.parent.typeParameters.params[0].typeName.name)
      ) {
        reportError(node);
      }
    }
  }

  return {
    TSQualifiedName: rule,
  };
}

/**
 * @type {RuleModule}
 */
module.exports = {
  meta,
  create,
};
