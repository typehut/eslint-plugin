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
            description: "enforce consistent use of `function` declarations or expressions",

            category: "Stylistic Issues",

            recommended: true,
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/func-style.md"
        },

        fixable: "code",

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
                    },
                    disableAutoFix: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ],

        type: "suggestion"
    },

    create(context) {
        const PREFIX_COLON = /^:\s*/u,
            sourceCode = context.getSourceCode(),
            style = context.options[0] || "arrow",
            topLevelStyle = context.options[1] ? context.options[1].topLevelStyle : style,
            enforceDeclarations = (style === "declaration"),
            enforceArrows = (style === "arrow"),
            enforceExpressions = (style === "expression"),
            enforceDeclarationTopLevel = (topLevelStyle === "declaration"),
            enforceArrowTopLevel = (topLevelStyle === "arrow"),
            enforceExpressionTopLevel = (topLevelStyle === "expression"),
            allowExportDefaultFunctionDeclaration = context.options[1] && context.options[1].allowExportDefaultFunctionDeclaration,
            disableAutoFix = context.options[1] && context.options[1].disableAutoFix,
            stack = [];

        /**
         * analyze a function definition and returns a result.
         * @param {ASTNode} node target node
         * @param {ASTNode} parent parent node
         * @returns {Object} result
         */
        function analyze(node, parent) {
            const isDeclaration = node.type === "FunctionDeclaration";
            const result = {
                name: node.id.name,
                kind: "var",
                params: ((isDeclaration ? node.params : node.init.params) || []).map(t => sourceCode.getText(t)).join(", ") || null,
                typeAnnotation: null,
                typeParameters: null,
                returnType: null
            };

            if (isDeclaration) {
                result.start = node.range[0];
                result.end = node.range[1];
                result.defStart = node.range[0];
                result.defEnd = node.body.range[0];
                result.async = node.async || false;
                result.body = node.body;
            } else {
                result.kind = parent.kind;
                result.start = parent.range[0];
                result.end = parent.range[1];
                result.defStart = parent.range[0];
                result.defEnd = node.init.body.range[0];
                result.async = node.init.async || false;
                result.typeAnnotation = node.id.typeAnnotation ? sourceCode.getText(node.id.typeAnnotation).replace(PREFIX_COLON, "") : null;
                result.returnType = node.init.returnType ? sourceCode.getText(node.init.returnType).replace(PREFIX_COLON, "") : null;
                result.typeParameters = node.init.typeParameters && node.init.typeParameters.params && node.init.typeParameters.params.length ? node.init.typeParameters.params.map(t => sourceCode.getText(t)).join(", ") : null;
                result.body = node.init.body;
            }

            result.bodyText = sourceCode.getText(result.body);

            if (result.typeAnnotation && !result.returnType) {
                result.returnType = `ReturnType<${result.typeAnnotation}>`;
            }

            return result;
        }

        /**
         * Generate modified text from analysis data
         * @param {Object} data analysis data
         * @param {string} to convert to
         * @returns {string} fixed text
         */
        function generateFixedText(data, to) {
            switch (to) {
                case "declaration":
                    return `${data.async ? "async " : ""}function${data.name ? ` ${data.name}` : ""}${data.typeParameters ? `<${data.typeParameters}>` : ""}(${data.params ? data.params : ""})${data.returnType ? `: ${data.returnType}` : ""} ${data.body.type !== "BlockStatement" ? `{return ${data.bodyText}}` : ""}`;
                case "expression":
                    return `${data.kind} ${data.name}${data.typeAnnotation ? `: ${data.typeAnnotation}` : ""} = ${data.async ? "async " : ""}function${data.typeParameters ? `<${data.typeParameters}>` : ""}(${data.params ? data.params : ""})${data.returnType ? `: ${data.returnType}` : ""} ${data.body.type !== "BlockStatement" ? `{return ${data.bodyText}}` : ""}`;
                case "arrow":
                    return `${data.kind} ${data.name}${data.typeAnnotation ? `: ${data.typeAnnotation}` : ""} = ${data.async ? "async " : ""}${data.typeParameters ? `<${data.typeParameters}>` : ""}(${data.params ? data.params : ""})${data.returnType ? `: ${data.returnType}` : ""} => ${data.body.type !== "BlockStatement" ? data.bodyText : ""}`;
                default:
                    return null;
            }
        }

        /**
         * Reports a given variable declaration node.
         * @param {{node: ASTNode, messageId: string, isTopLevel: boolean}} node options
         * @returns {void}
         */
        function report({ node, messageId, isTopLevel }) {
            context.report({
                node,
                messageId,

                fix: disableAutoFix ? null : fixer => {
                    const to = isTopLevel ? topLevelStyle : style;
                    const data = analyze(node, node.parent);
                    const text = generateFixedText(data, to);
                    const range = data.body.type === "BlockStatement" ? [data.defStart, data.defEnd] : [data.start, data.end];

                    return fixer.replaceTextRange(range, text);
                }
            });
        }

        const nodesToCheck = {
            FunctionDeclaration(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceDeclarations && (node.parent.type !== "ExportDefaultDeclaration" || !allowExportDefaultFunctionDeclaration)) {
                    report({ node, messageId: style, isTopLevel });
                }

                if (isTopLevel && !enforceDeclarationTopLevel && (node.parent.type !== "ExportDefaultDeclaration" || !allowExportDefaultFunctionDeclaration)) {

                    report({ node, messageId: `${topLevelStyle}-in-top-level`, isTopLevel });
                }
            },
            "FunctionDeclaration:exit"() {
                stack.pop();
            },

            FunctionExpression(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceExpressions && node.parent.type === "VariableDeclarator") {
                    report({ node: node.parent, messageId: style, isTopLevel });
                }

                if (isTopLevel && !enforceExpressionTopLevel && node.parent.type === "VariableDeclarator") {

                    report({ node: node.parent, messageId: `${topLevelStyle}-in-top-level`, isTopLevel });
                }
            },
            "FunctionExpression:exit"() {
                stack.pop();
            },
            ArrowFunctionExpression(node) {
                stack.push(false);
                const isTopLevel = stack.length === 1;

                if (!isTopLevel && !enforceArrows && node.parent.type === "VariableDeclarator") {
                    report({ node: node.parent, messageId: style, isTopLevel });
                }

                if (isTopLevel && !enforceArrowTopLevel && node.parent.type === "VariableDeclarator") {
                    report({ node: node.parent, messageId: `${topLevelStyle}-in-top-level`, isTopLevel });
                }
            },
            "ArrowFunctionExpression:exit"() {
                stack.pop();
            }
        };

        return nodesToCheck;
    }
};
