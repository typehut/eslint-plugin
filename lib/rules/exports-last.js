"use strict";

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("estree").Node} ASTNode
 * @typedef {import("eslint").Rule.RuleFixer} RuleFixer
 * @typedef {import("eslint").Rule.RuleFix} RuleFix
 */

const errors = {
    error: "Export statements should appear at the end of the file"
};

/**
 * @param {{type: string}} options
 * @returns {boolean}
 */
function isNonExportStatement({ type }) {
    return type !== "ExportDefaultDeclaration" &&
    type !== "ExportNamedDeclaration" &&
    type !== "ExportAllDeclaration";
}

/**
 * @type RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "This rule enforces that all exports are declared at the bottom of the file. This rule will report any export declarations that comes before any non-export statements.",

            category: "Best Practices",

            recommended: true,
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/exports-last.md"
        },

        fixable: "code",
        messages: errors,
        schema: [],

        type: "suggestion"
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        return {
            Program({ body }) {
                const lastNonExportStatementIndex = body.reduce((acc, item, index) => {
                    if (isNonExportStatement(item)) {
                        return index;
                    }
                    return acc;
                }, -1);

                if (lastNonExportStatementIndex === -1) {
                    return;
                }

                const newCode = body.slice(0, lastNonExportStatementIndex + 1).map(node => ({
                    node,
                    code: sourceCode.getText(node),
                    isNonExportStatement: isNonExportStatement(node)
                })).sort((a, b) => {
                    if (!a.isNonExportStatement && b.isNonExportStatement) {
                        return 1;
                    }
                    if (a.isNonExportStatement === b.isNonExportStatement) {
                        return 0;
                    }
                    return -1;
                }).map(node => node.code).join("\n");

                const start = body[0].range[0];
                const end = body.slice(0, lastNonExportStatementIndex + 1).slice(-1)[0].range[1];

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

                body.slice(0, lastNonExportStatementIndex).forEach(node => {
                    if (isNonExportStatement(node)) {
                        return;
                    }
                    context.report({
                        node,
                        messageId: "error",
                        fix
                    });
                });
            }
        };
    }
};
