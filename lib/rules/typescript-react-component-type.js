"use strict";

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("eslint").Rule.RuleFixer} RuleFixer
 * @typedef {import("eslint").Rule.Fix} Fix
 * @typedef {import("estree").Node} ASTNode
 */

/**
 * @type RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "enforce `FC` and `FunctionComponent` types to one or the other",

            category: "Best Practices",

            recommended: "error",
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/typescript-react-component-type.md"
        },

        fixable: "code",
        messages: {
            enforceFC: "React component must be of type `React.FC`.",
            enforceVFC: "React component must be of type `React.VFC`.",
            enforceFunctionComponent: "React component must be of type `React.FunctionComponent`.",
            enforceVoidFunctionComponent: "React component must be of type `React.VoidFunctionComponent`."
        },
        schema: [
            {
                enum: ["omit", "raw"]
            }
        ],

        type: "suggestion"
    },

    create(context) {

        /**
         * Create code fixer
         * @param {ASTNode} node source code AST
         * @param {string} type destination type
         * @returns {Function} object contains range and text
         */
        function createFixer(node, type) {
            const sourceCode = context.getSourceCode();
            const rightOperandToken = sourceCode.getFirstToken(node, { filter: t => t.type === "Identifier" && t.value === node.right.name });

            /**
             * Fixer
             * @param {RuleFixer} fixer ast node
             * @returns {Fix} object contains range and text
             */
            return fixer => fixer.replaceText(rightOperandToken, type);
        }

        /**
         * Report a error to linter
         * @param {ASTNode} node ast node
         * @param {string} to destination type
         * @returns {void}
         */
        function reportError(node, to) {
            context.report({
                node,
                messageId: `enforce${to}`,
                fix: createFixer(node, to)
            });
        }

        return {

            /**
             * Process TSQualifiedName node
             * @param {ASTNode} node code node
             * @returns {void}
             */
            TSQualifiedName(node) {
                if (node.left.name !== "React") {
                    return;
                }

                const enforceOmitting = (context.options[0] || "omit").toLowerCase() === "omit";

                if (enforceOmitting) {
                    if (node.right.name === "FunctionComponent" || node.right.name === "StatelessComponent") {
                        reportError(node, "FC");
                        return;
                    }
                    if (node.right.name === "VoidFunctionComponent") {
                        reportError(node, "VFC");

                    }
                } else {
                    if (node.right.name === "FC" || node.right.name === "SFC") {
                        reportError(node, "FunctionComponent");
                        return;
                    }
                    if (node.right.name === "VFC") {
                        reportError(node, "VoidFunctionComponent");
                    }
                }
            }
        };
    }
};
