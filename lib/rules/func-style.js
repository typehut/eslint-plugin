"use strict";

const {
  generateObjSchema,
} = require("eslint-plugin-jsx-a11y/lib/util/schemas");
const t = require("../utils/types");
const normalizeEcmaVersion = require("../utils/normalize-ecma-version");

/**
 * @typedef {"arrow"|"expression"|"declaration"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  arrow: "Expected a arrow function expression.",
  arrowInTopLevel: "Expected a arrow function expression in top-level context.",
  expression: "Expected a function expression.",
  expressionInTopLevel: "Expected a function expression in top-level context.",
  declaration: "Expected a function declaration.",
  declarationInTopLevel:
    "Expected a function declaration in top-level context.",
};

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [
  {
    enum: ["arrow", "declaration", "expression"],
  },
  generateObjSchema({
    topLevelStyle: {
      enum: ["arrow", "declaration", "expression"],
    },
    allowExportDefaultFunctionDeclaration: { type: "boolean" },
    disableAutoFix: { type: "boolean" },
  }),
];

/**
 * @type {RuleMetaData}
 */
const meta = {
  docs: {
    description:
      "enforce consistent use of `function` declarations or expressions",

    category: "Stylistic Issues",

    recommended: true,
    url:
      "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/func-style.md",
  },

  fixable: "code",

  messages: errors,

  schema,

  type: "suggestion",
};

/**
 * @type {RuleCreator}
 */
function create(context) {
  const PREFIX_COLON = /^:\s*/u,
    IS_GENERIC_PARSEABLE = /extends|=|,/iu,
    AVAILABLE_CONST =
      normalizeEcmaVersion(context.parserOptions.ecmaVersion || 5) >= 2015,
    sourceCode = context.getSourceCode(),
    style = context.options[0] || "arrow",
    topLevelStyle = context.options[1]
      ? context.options[1].topLevelStyle
      : style,
    enforceDeclarations = style === "declaration",
    enforceArrows = style === "arrow",
    enforceExpressions = style === "expression",
    enforceDeclarationTopLevel = topLevelStyle === "declaration",
    enforceArrowTopLevel = topLevelStyle === "arrow",
    enforceExpressionTopLevel = topLevelStyle === "expression",
    allowExportDefaultFunctionDeclaration =
      context.options[1] &&
      context.options[1].allowExportDefaultFunctionDeclaration,
    disableAutoFix = context.options[1] && context.options[1].disableAutoFix,
    stack = [];

  /**
   * @param {ASTNode} node
   * @param {ASTNode} parent
   * @returns {Object}
   */
  function analyze(node, parent) {
    const isFunctionDeclaration = t.isFunctionDeclaration(node);
    const result = {
      name: node.id.name,
      kind: AVAILABLE_CONST ? "const" : "var",
      params:
        ((isFunctionDeclaration ? node.params : node.init.params) || [])
          .map((param) => sourceCode.getText(param))
          .join(", ") || null,
      typeAnnotation: null,
      typeParameters: null,
      returnType: null,
    };

    if (isFunctionDeclaration) {
      result.start = node.range[0];
      result.end = node.range[1];
      result.defStart = node.range[0];
      result.defEnd = node.body.range[0];
      result.async = node.async || false;
      result.generator = node.generator || false;
      result.body = node.body;
      result.returnType = node.returnType
        ? sourceCode.getText(node.returnType).replace(PREFIX_COLON, "")
        : null;
      result.typeParameters =
        node.typeParameters &&
        node.typeParameters.params &&
        node.typeParameters.params.length
          ? node.typeParameters.params
              .map((param) => sourceCode.getText(param))
              .join(", ")
          : null;
    } else {
      result.kind = parent.kind;
      result.start = parent.range[0];
      result.end = parent.range[1];
      result.defStart = parent.range[0];
      result.defEnd = node.init.body.range[0];
      result.async = node.init.async || false;
      result.generator = node.init.generator || false;
      result.typeAnnotation = node.id.typeAnnotation
        ? sourceCode.getText(node.id.typeAnnotation).replace(PREFIX_COLON, "")
        : null;
      result.returnType = node.init.returnType
        ? sourceCode.getText(node.init.returnType).replace(PREFIX_COLON, "")
        : null;
      result.typeParameters =
        node.init.typeParameters &&
        node.init.typeParameters.params &&
        node.init.typeParameters.params.length
          ? node.init.typeParameters.params
              .map((param) => sourceCode.getText(param))
              .join(", ")
          : null;
      result.body = node.init.body;
    }

    result.bodyText = sourceCode.getText(result.body);

    if (result.typeAnnotation && !result.returnType) {
      result.returnType = `ReturnType<${result.typeAnnotation}>`;
    }

    return result;
  }

  /**
   * @param {Object} data analysis data
   * @param {string} config convert to
   * @returns {string} fixed text
   */
  function generateFixedText(data, config) {
    const to =
      data.generator && config !== "declaration" ? "expression" : config;

    switch (to) {
      case "declaration":
        return `${data.async ? "async " : ""}function${
          data.generator ? "* " : ""
        }${data.name ? ` ${data.name}` : ""}${
          data.typeParameters ? `<${data.typeParameters}>` : ""
        }(${data.params ? data.params : ""})${
          data.returnType ? `: ${data.returnType}` : ""
        } ${t.isBlockStatement(data.body) ? "" : `{return ${data.bodyText}}`}`;
      case "expression":
        return `${data.kind} ${data.name}${
          data.typeAnnotation ? `: ${data.typeAnnotation}` : ""
        } = ${data.async ? "async " : ""}function${data.generator ? "* " : ""}${
          data.typeParameters
            ? `<${data.typeParameters}${
                IS_GENERIC_PARSEABLE.test(data.typeParameters) ? "" : ","
              }>`
            : ""
        }(${data.params ? data.params : ""})${
          data.returnType ? `: ${data.returnType}` : ""
        } ${t.isBlockStatement(data.body) ? "" : `{return ${data.bodyText}}`}`;
      case "arrow":
        return `${data.kind} ${data.name}${
          data.typeAnnotation ? `: ${data.typeAnnotation}` : ""
        } = ${data.async ? "async " : ""}${data.generator ? "* " : ""}${
          data.typeParameters
            ? `<${data.typeParameters}${
                IS_GENERIC_PARSEABLE.test(data.typeParameters) ? "" : ","
              }>`
            : ""
        }(${data.params ? data.params : ""})${
          data.returnType ? `: ${data.returnType}` : ""
        } => ${t.isBlockStatement(data.body) ? "" : data.bodyText}`;
      default:
        return null;
    }
  }

  /**
   * @param {{node: ASTNode, messageId: string, isTopLevel: boolean}} root0
   * @returns {void}
   */
  function report({ node, messageId, isTopLevel }) {
    context.report({
      node,
      messageId,

      fix: disableAutoFix
        ? null
        : (fixer) => {
            const to = isTopLevel ? topLevelStyle : style;
            const data = analyze(node, node.parent);
            const text = generateFixedText(data, to);
            const range = t.isBlockStatement(data.body)
              ? [data.defStart, data.defEnd]
              : [data.start, data.end];

            return fixer.replaceTextRange(range, text);
          },
    });
  }

  return {
    FunctionDeclaration(node) {
      stack.push(false);
      const isTopLevel = stack.length === 1;

      if (
        !isTopLevel &&
        !enforceDeclarations &&
        (!t.isExportDefaultDeclaration(node.parent) ||
          !allowExportDefaultFunctionDeclaration)
      ) {
        report({ node, messageId: style, isTopLevel });
      }

      if (
        isTopLevel &&
        !enforceDeclarationTopLevel &&
        (!t.isExportDefaultDeclaration(node.parent) ||
          !allowExportDefaultFunctionDeclaration)
      ) {
        report({ node, messageId: `${topLevelStyle}InTopLevel`, isTopLevel });
      }
    },
    "FunctionDeclaration:exit"() {
      stack.pop();
    },

    FunctionExpression(node) {
      stack.push(false);
      const isTopLevel = stack.length === 1;
      const isGenerator = node.generator || false;

      if (
        !isTopLevel &&
        !enforceExpressions &&
        t.isVariableDeclarator(node.parent) &&
        (!enforceArrows || !isGenerator)
      ) {
        report({ node: node.parent, messageId: style, isTopLevel });
      }

      if (
        isTopLevel &&
        !enforceExpressionTopLevel &&
        t.isVariableDeclarator(node.parent) &&
        (!enforceArrowTopLevel || !isGenerator)
      ) {
        report({
          node: node.parent,
          messageId: `${topLevelStyle}InTopLevel`,
          isTopLevel,
        });
      }
    },
    "FunctionExpression:exit"() {
      stack.pop();
    },
    ArrowFunctionExpression(node) {
      stack.push(false);
      const isTopLevel = stack.length === 1;

      if (
        !isTopLevel &&
        !enforceArrows &&
        t.isVariableDeclarator(node.parent)
      ) {
        report({ node: node.parent, messageId: style, isTopLevel });
      }

      if (
        isTopLevel &&
        !enforceArrowTopLevel &&
        t.isVariableDeclarator(node.parent)
      ) {
        report({
          node: node.parent,
          messageId: `${topLevelStyle}InTopLevel`,
          isTopLevel,
        });
      }
    },
    "ArrowFunctionExpression:exit"() {
      stack.pop();
    },
  };
}

/**
 * @type {RuleModule}
 */
module.exports = {
  meta,
  create,
};
