"use strict";

const t = require("../utils/types");

/**
 * @typedef {"enforceExportsLast"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  enforceExportsLast: "Export statements should appear at the end of the file",
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
    description:
      "This rule enforces that all exports are declared at the bottom of the file. This rule will report any export declarations that comes before any non-export statements.",

    category: "Best Practices",

    recommended: true,
    url: "https://github.com/typehut/eslint-plugin/blob/main/docs/rules/exports-last.md",
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
  const sourceCode = context.getSourceCode();

  return {
    Program({ body }) {
      const lastNonExportStatementIndex = body.reduce((acc, item, index) => {
        if (!t.isExportStatement(item)) {
          return index;
        }
        return acc;
      }, -1);

      if (lastNonExportStatementIndex === -1) {
        return;
      }

      const newCode = body
        .slice(0, lastNonExportStatementIndex + 1)
        .map((node) => ({
          node,
          code: sourceCode.getText(node),
          isExportStatement: t.isExportStatement(node),
        }))
        .sort((a, b) => {
          if (a.isExportStatement && !b.isExportStatement) {
            return 1;
          }
          if (a.isExportStatement === b.isExportStatement) {
            return 0;
          }
          return -1;
        })
        .map((node) => node.code)
        .join("\n");

      const start = body[0].range[0];
      const end = body.slice(0, lastNonExportStatementIndex + 1).slice(-1)[0]
        .range[1];

      let fixed = false;

      /**
       * @param {RuleFixer} fixer
       * @returns {RuleFix}
       */
      function fix(fixer) {
        if (fixed) {
          return null;
        }
        fixed = true;
        return fixer.replaceTextRange([start, end], newCode);
      }

      body.slice(0, lastNonExportStatementIndex).forEach((node) => {
        if (!t.isExportStatement(node)) {
          return;
        }
        context.report({
          node,
          messageId: "enforceExportsLast",
          fix,
        });
      });
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
