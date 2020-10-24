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
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/typescript-react-require-props-suffix.md"
        },

        fixable: null,
        messages: {
            enforceFC: "React component must be of type `React.FC`.",
            enforceFunctionComponent: "React component must be of type `React.FunctionComponent`."
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

                const enforceFC = (context.options[0] || "fc").toLowerCase() === "fc";
                const enforceFunctionComponent = !enforceFC;
                const isDeprecatedType = node.right.name === "SFC" || node.right.name === "StatelessComponent";

                if (enforceFC && (node.right.name === "FunctionComponent" || isDeprecatedType)) {
                    reportError(node, "enforceFC");
                    return;
                }

                if (enforceFunctionComponent && (node.right.name === "FC" || isDeprecatedType)) {
                    reportError(node, "enforceFunctionComponent");
                }

            }
        };
    }
};
