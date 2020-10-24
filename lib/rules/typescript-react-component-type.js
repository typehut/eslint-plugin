"use strict";

/**
 * @type import('eslint').Rule.RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "enforce `FC` and `FunctionComponent` types to one or the other",

            category: "Best Practices",

            recommended: "error",
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/typescript-react-component-type.md"
        },

        fixable: null,
        messages: {
            enforceFC: "React component must be of type `React.FC`.",
            enforceVFC: "React component must be of type `React.VFC`.",
            enforceFunctionComponent: "React component must be of type `React.FunctionComponent`.",
            enforceVoidFunctionComponent: "React component must be of type `React.VoidFunctionComponent`."
        },
        schema: [
            {
                enum: ["FC", "FunctionComponent"]
            }
        ],

        type: "suggestion"
    },

    create(context) {

        /**
         * Report a error to linter
         * @param {ASTNode} node ast node
         * @param {string} messageId error message id
         * @returns {void}
         */
        function reportError(node, messageId) {
            context.report({
                node,
                messageId
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

                const enforceOmitting = (context.options[0] || "fc").toLowerCase() === "fc";
                const isDeprecatedType = node.right.name === "SFC" || node.right.name === "StatelessComponent";

                if (enforceOmitting) {
                    if (node.right.name === "FunctionComponent" || isDeprecatedType) {
                        reportError(node, "enforceFC");
                        return;
                    }
                    if (node.right.name === "VoidFunctionComponent") {
                        reportError(node, "enforceVFC");

                    }
                } else {
                    if (node.right.name === "FC" || isDeprecatedType) {
                        reportError(node, "enforceFunctionComponent");
                        return;
                    }
                    if (node.right.name === "VFC") {
                        reportError(node, "enforceVoidFunctionComponent");
                    }
                }
            }
        };
    }
};
