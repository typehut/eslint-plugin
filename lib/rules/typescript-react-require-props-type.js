"use strict";

const t = require("../utils/types");
const findAncestor = require("../utils/find-ancestor");

/**
 * @typedef {"requirePropsType"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  requirePropsType: "Props type must be provided to a React component.",
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
    description: "require an props type to be provided to a React component",

    category: "Best Practices",

    recommended: "error",
    url: "https://github.com/typehut/eslint-plugin/blob/main/docs/rules/typescript-react-require-props-type.md",
  },

  fixable: null,
  messages: errors,
  schema,

  type: "problem",
};

/**
 * see if it only has children
 * @param {Array} properties object properties
 * @returns {boolean} result
 */
function hasChildrenOnly(properties) {
  return (
    properties.length &&
    !properties.some((property) => property.key.name !== "children")
  );
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
      messageId: "requirePropsType",
    });
  }

  /**
   * Core function of the rule
   * @param {TSQualifiedName} node target node
   * @returns {void}
   */
  function rule(node) {
    if (t.isReactFunctionComponent(node)) {
      const variableDeclarator = findAncestor(node, (ancestor) =>
        t.isVariableDeclarator(ancestor)
      );

      if (!variableDeclarator.init.params.length) {
        return;
      }

      const props = variableDeclarator.init.params[0];

      if (t.isObjectPattern(props) && hasChildrenOnly(props.properties)) {
        return;
      }

      if (!node.parent.typeParameters) {
        reportError(node);
        return;
      }

      if (node.parent.typeParameters.params.length === 0) {
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
