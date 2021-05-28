"use strict";

/**
 * @typedef {"enforceFC"|"enforceVFC"|"enforceFunctionComponent"|"enforceVoidFunctionComponent"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  enforceFC: "React component must be of type `React.FC`.",
  enforceVFC: "React component must be of type `React.VFC`.",
  enforceFunctionComponent:
    "React component must be of type `React.FunctionComponent`.",
  enforceVoidFunctionComponent:
    "React component must be of type `React.VoidFunctionComponent`.",
};

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [
  {
    enum: ["omit", "raw"],
  },
];

/**
 * @type {RuleMetaData}
 */
const meta = {
  docs: {
    description:
      "enforce `FC` and `FunctionComponent` types to one or the other",

    category: "Best Practices",

    recommended: "error",
    url: "https://github.com/typehut/eslint-plugin/blob/main/docs/rules/typescript-react-component-type.md",
  },

  fixable: "code",
  messages: errors,
  schema,

  type: "suggestion",
};

/**
 * @param {TSQualifiedName} node
 * @returns {boolean}
 */
function isFunctionComponent(node) {
  return (
    node.right.name === "FunctionComponent" ||
    node.right.name === "StatelessComponent"
  );
}

/**
 * @param {TSQualifiedName} node
 * @returns {boolean}
 */
function isVoidFunctionComponent(node) {
  return node.right.name === "VoidFunctionComponent";
}

/**
 * @param {TSQualifiedName} node
 * @returns {boolean}
 */
function isFC(node) {
  return node.right.name === "FC" || node.right.name === "SFC";
}

/**
 * @param {TSQualifiedName} node
 * @returns {boolean}
 */
function isVFC(node) {
  return node.right.name === "VFC";
}

/**
 * @param {RuleContext} context
 * @param {TSQualifiedName} node
 * @param {string} type destination type
 * @returns {Function}
 */
function createFix(context, node, type) {
  const sourceCode = context.getSourceCode();
  const rightOperandToken = sourceCode.getFirstToken(node, {
    filter: (token) =>
      token.type === "Identifier" && token.value === node.right.name,
  });

  /**
   * @type {RuleFixer}
   */
  function fix(fixer) {
    return fixer.replaceText(rightOperandToken, type);
  }

  return fix;
}

/**
 * @type {RuleCreator}
 */
function create(context) {
  /**
   * @param {ASTNode} node
   * @param {string} to destination type
   * @returns {void}
   */
  function reportError(node, to) {
    context.report({
      node,
      messageId: `enforce${to}`,
      fix: createFix(context, node, to),
    });
  }

  /**
   * Core function of the rule
   * @param {TSQualifiedName} node target node
   * @returns {void}
   */
  function rule(node) {
    if (node.left.name !== "React") {
      return;
    }

    const enforceOmitting =
      (context.options[0] || "omit").toLowerCase() === "omit";

    if (enforceOmitting) {
      if (isFunctionComponent(node)) {
        reportError(node, "FC");
        return;
      }
      if (isVoidFunctionComponent(node)) {
        reportError(node, "VFC");
      }
    } else {
      if (isFC(node)) {
        reportError(node, "FunctionComponent");
        return;
      }
      if (isVFC(node)) {
        reportError(node, "VoidFunctionComponent");
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
