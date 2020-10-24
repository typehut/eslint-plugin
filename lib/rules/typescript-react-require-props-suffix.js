"use strict";

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("estree").Node} ASTNode
 */

/**
 * @type RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "require that prop interface names be suffixed with `Props`",

            category: "Best Practices",

            recommended: "error",
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/typescript-react-require-props-suffix.md"
        },

        fixable: null,
        messages: {
            requireSuffix: "Prop interfaces must be suffixed with `Props`."
        },
        schema: [],

        type: "suggestion"
    },

    create(context) {

        /**
         * Checks if a string is suffixed with "Props".
         * @param {string} name The string to check
         * @returns {boolean} is suffixed
         */
        function isSuffixedWithProps(name) {
            if (typeof name !== "string") {
                return false;
            }

            const minLength = "Props".length + 1;

            return name.length >= minLength && name.endsWith("Props");
        }

        /**
         * Report a error to linter
         * @param {ASTNode} node ast node
         * @returns {void}
         */
        function reportError(node) {
            context.report({
                node,
                messageId: "requireSuffix"
            });
        }

        return {

            /**
             * Process TSQualifiedName node
             * @param {ASTNode} node code node
             * @returns {void}
             */
            TSQualifiedName(node) {
                if (
                    node.left.name === "React" &&
          (node.right.name === "FC" || node.right.name === "FunctionComponent" || node.right.name === "VFC" || node.right.name === "VoidFunctionComponent") &&
          node.parent.typeParameters
                ) {
                    if (node.parent.typeParameters.params.length === 0) {
                        reportError(node);
                        return;
                    }

                    if (
                        !isSuffixedWithProps(
                            node.parent.typeParameters.params[0].typeName.name
                        )
                    ) {
                        reportError(node);
                    }
                }
            }
        };
    }
};
