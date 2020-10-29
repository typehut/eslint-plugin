"use strict";

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("estree").Node} ASTNode
 */

/**
 * Whether the node is React Function Component
 * @param {ASTNode} node ast node
 * @returns {boolean} result
 */
function isReactFunctionComponent(node) {
    return node.left.name === "React" &&
          (node.right.name === "FC" || node.right.name === "FunctionComponent" || node.right.name === "VFC" || node.right.name === "VoidFunctionComponent");
}

/**
 * Get the ancestor that is variable declarator
 * @param {ASTNode} node ast node
 * @returns {ASTNode} variable declarator node
 */
function getVariableDeclaratorAncestor(node) {
    if (node.type === "VariableDeclarator") {
        return node;
    }
    return getVariableDeclaratorAncestor(node.parent);
}

/**
 * @type RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "require an props type to be provided to a React component",

            category: "Best Practices",

            recommended: "error",
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/typescript-react-require-props-type.md"
        },

        fixable: null,
        messages: {
            requirePropsType: "Props type must be provided to a React component."
        },
        schema: [],

        type: "problem"
    },

    create(context) {

        /**
         * Report a error to linter
         * @param {ASTNode} node ast node
         * @returns {void}
         */
        function reportError(node) {
            context.report({
                node,
                messageId: "requirePropsType"
            });
        }

        return {

            /**
             * Process TSQualifiedName node
             * @param {ASTNode} node code node
             * @returns {void}
             */
            TSQualifiedName(node) {
                if (isReactFunctionComponent(node)) {
                    const variableDeclarator = getVariableDeclaratorAncestor(node);

                    if (!variableDeclarator.init.params.length) {
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
        };
    }
};
