"use strict";

module.exports = {
    meta: {
        docs: {
            description: "enforce consistent use of `function` declarations or expressions",

            category: "Stylistic Issues",

            recommended: true,
            url: ""
        },

        fixable: null,

        messages: {
            arrow: "Expected a arrow function expression.",
            "arrow-in-top-level": "Expected a arrow function expression in top-level context.",
            expression: "Expected a function expression.",
            "expression-in-top-level": "Expected a function expression in top-level context.",
            declaration: "Expected a function declaration.",
            "declaration-in-top-level": "Expected a function declaration in top-level context."
        },

        schema: [
            {
                enum: ["arrow", "declaration", "expression"]
            },
            {
                type: "object",
                properties: {
                    topLevelStyle: {
                        enum: ["arrow", "declaration", "expression"]
                    },
                    allowExportDefaultFunctionDeclaration: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ],

        type: "suggestion"
    },

    create(context) {
        const style = context.options[0] || "arrow",
            topLevelStyle = context.options[1] ? context.options[1].topLevelStyle : style,
            enforceDeclarations = (style === "declaration"),
            enforceArrows = (style === "arrow"),
            enforceExpressions = (style === "expression"),
            enforceDeclarationTopLevel = (topLevelStyle === "declaration"),
            enforceArrowTopLevel = (topLevelStyle === "arrow"),
            enforceExpressionTopLevel = (topLevelStyle === "expression"),
            allowExportDefaultFunctionDeclaration = context.options[1] && context.options[1].allowExportDefaultFunctionDeclaration,

            stack = [];

        const nodesToCheck = {
            FunctionDeclaration(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceDeclarations && (node.parent.type !== "ExportDefaultDeclaration" || !allowExportDefaultFunctionDeclaration)) {
                    context.report({ node, messageId: style });
                }

                if (isTopLevel && !enforceDeclarationTopLevel && (node.parent.type !== "ExportDefaultDeclaration" || !allowExportDefaultFunctionDeclaration)) {
                    context.report({ node, messageId: `${topLevelStyle}-in-top-level` });
                }
            },
            "FunctionDeclaration:exit"() {
                stack.pop();
            },

            FunctionExpression(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceExpressions && node.parent.type === "VariableDeclarator") {
                    context.report({ node: node.parent, messageId: style });
                }

                if (isTopLevel && !enforceExpressionTopLevel && node.parent.type === "VariableDeclarator") {
                    context.report({ node: node.parent, messageId: `${topLevelStyle}-in-top-level` });
                }
            },
            "FunctionExpression:exit"() {
                stack.pop();
            },
            ArrowFunctionExpression(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceArrows && node.parent.type === "VariableDeclarator") {
                    context.report({ node: node.parent, messageId: style });
                }

                if (isTopLevel && !enforceArrowTopLevel && node.parent.type === "VariableDeclarator") {
                    context.report({ node: node.parent, messageId: `${topLevelStyle}-in-top-level` });
                }
            },
            "ArrowFunctionExpression:exit"() {
                stack.pop();
            }
        };

        return nodesToCheck;
    }
};
