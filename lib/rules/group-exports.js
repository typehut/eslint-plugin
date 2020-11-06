"use strict";

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("eslint").Rule.RuleListener} RuleListener
 * @typedef {import("eslint").Rule.RuleFixer} RuleFixer
 * @typedef {import("eslint").Rule.RuleFix} RuleFix
 * @typedef {import("estree").Node} ASTNode
 * @typedef {import("estree").Declaration} Declaration
 * @typedef {import("estree").ExportNamedDeclaration} ExportNamedDeclaration
 * @typedef {import("estree").ExportSpecifier} ExportSpecifier
 * @typedef {import("estree").Identifier} Identifier
 */

const getLocalNames = require("../utils/get-local-names");
const errors = {
    ExportNamedDeclaration: "Multiple named export declarations; consolidate all named exports into a single export declaration",
    AssignmentExpression: "Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`"
};

/**
 * @param {Array} array
 * @returns {Array}
 */
function dedupeAndFlatten(array) {
    return Object.values(array)
        .filter(item => Array.isArray(item) && item.length > 1).flat();
}

/**
 * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
 *
 * Example:
 *
 * `module.exports = {}` => ['module', 'exports']
 * `module.exports.property = true` => ['module', 'exports', 'property']
 * @param       {Node}    node    AST Node (MemberExpression)
 * @returns     {Array}           Array with the property names in the chain
 * @private
 */
function accessorChain(node) {
    const chain = [];
    let target = node;

    do {
        chain.unshift(target.property.name);

        if (target.object.type === "Identifier") {
            chain.unshift(target.object.name);
            break;
        }

        target = target.object;
    } while (target.type === "MemberExpression");

    return chain;
}


/**
 * Create Rule
 * @param {RuleContext} context rule context
 * @returns {RuleListener} rule listener
 */
function create(context) {
    const sourceCode = context.getSourceCode();
    const nodes = {
        modules: {
            set: new Set(),
            sources: {}
        },
        types: {
            set: new Set(),
            sources: {}
        },
        commonjs: {
            set: new Set()
        },
        declarations: {
            set: new Set()
        },
        moduleSpecifiers: {
            set: new Set(),
            sources: {}
        },
        typeSpecifiers: {
            set: new Set(),
            sources: {}
        }
    };

    /**
     * @param {RuleFixer} fixer
     * @returns {RuleFix}
     */
    function *fix(fixer) {
        const elementsToBeRemoved = [];
        const remainDeclarations = {
            modules: {},
            types: {}
        };

        /**
         * @param {ExportNamedDeclaration} target
         * @returns {void}
         */
        function processor(target) {
            if (target.source) {
                const specifiers = target.exportKind === "type" ? nodes.typeSpecifiers.sources : nodes.moduleSpecifiers.sources;
                const remainDeclaration = target.exportKind === "type" ? remainDeclarations.types : remainDeclarations.modules;

                if (!Array.isArray(specifiers[target.source.value])) {
                    specifiers[target.source.value] = [];
                }
                specifiers[target.source.value].push(...target.specifiers);

                if (!remainDeclaration[target.source.value]) {

                    // Leave only a first export
                    remainDeclaration[target.source.value] = target;
                } else {

                    // remove entire code of target
                    elementsToBeRemoved.push(target);
                }
            } else if (target.declaration && target.declaration.id && target.declaration.id.name) {
                const specifiers = target.exportKind === "type" ? nodes.typeSpecifiers : nodes.moduleSpecifiers;

                specifiers.set.add({
                    local: {
                        name: target.declaration.id.name
                    },
                    exported: {
                        name: target.declaration.id.name
                    }
                });

                // remove `export ` from declaration
                const leadingExportTokens = sourceCode.getFirstTokens(target, 2);

                elementsToBeRemoved.push([leadingExportTokens[0].range[0], leadingExportTokens[1].range[0]]);
            } else if (target.declaration && target.declaration.type === "VariableDeclaration") {
                getLocalNames(target.declaration).forEach(name => {
                    nodes.moduleSpecifiers.set.add({
                        local: { name },
                        exported: { name }
                    });
                });

                // remove `export ` from declaration
                const leadingExportTokens = sourceCode.getFirstTokens(target, 2);

                elementsToBeRemoved.push([leadingExportTokens[0].range[0], leadingExportTokens[1].range[0]]);
            } else if (target.specifiers && target.specifiers.length > 0) {
                const specifiers = target.exportKind === "type" ? nodes.typeSpecifiers : nodes.moduleSpecifiers;

                target.specifiers.forEach(specifier => specifiers.set.add(specifier));

                // remove entire code of target
                elementsToBeRemoved.push(target);
            }
        }

        nodes.modules.set.forEach(processor);
        nodes.types.set.forEach(processor);
        dedupeAndFlatten(nodes.modules.sources).forEach(processor);
        dedupeAndFlatten(nodes.types.sources).forEach(processor);

        // Remove elements reserved
        for (const key in elementsToBeRemoved) {
            if (Object.prototype.hasOwnProperty.call(elementsToBeRemoved, key)) {
                if (Array.isArray(elementsToBeRemoved[key])) {
                    yield fixer.removeRange(elementsToBeRemoved[key]);
                    continue;
                }
                yield fixer.remove(elementsToBeRemoved[key]);
            }
        }

        // Assemble group-exports
        const codeToInsert = [];

        /**
         * @param {Iterable<ExportSpecifier>} specifierSet
         * @returns {string[]}
         */
        function normalizeExports(specifierSet) {
            const exports = [];

            specifierSet.forEach(specifier => {
                exports.push(specifier.local.name === specifier.exported.name ? specifier.local.name : `${specifier.local.name} as ${specifier.exported.name}`);
            });
            return exports;
        }

        const moduleExports = normalizeExports(nodes.moduleSpecifiers.set);
        const typeExports = normalizeExports(nodes.typeSpecifiers.set);

        if (typeExports.length > 0) {
            codeToInsert.push(`export type { ${typeExports.join(", ")} }`);
        }
        if (moduleExports.length > 0) {
            codeToInsert.push(`export { ${moduleExports.join(", ")} }`);
        }

        // Insert group-exports
        yield fixer.insertTextAfter(sourceCode.ast.body.slice(-1)[0], `\n${codeToInsert.join("\n")}`);

        // Fix aggregated exports
        const replaces = [];

        /**
         * @param {ExportNamedDeclaration[]} declarations
         * @returns {void}
         */
        function aggregatedProcessor(declarations) {
            Object.values(declarations).forEach(declaration => {
                const firstSpecifier = declaration.specifiers.slice(0, 1)[0];
                const lastSpecifier = declaration.specifiers.slice(-1)[0];
                const range = [firstSpecifier.range[0], lastSpecifier.range[1]];
                const specifiers = declaration.exportKind === "type" ? nodes.typeSpecifiers.sources[declaration.source.value] : nodes.moduleSpecifiers.sources[declaration.source.value];
                const code = normalizeExports(specifiers).join(", ");

                replaces.push({ code, range });
            });
        }

        aggregatedProcessor(remainDeclarations.modules);
        aggregatedProcessor(remainDeclarations.types);

        for (const replacer of replaces) {
            yield fixer.replaceTextRange(replacer.range, replacer.code);
        }
    }

    return {
        ExportNamedDeclaration(node) {
            const target = node.exportKind === "type" ? nodes.types : nodes.modules;

            if (!node.source) {
                target.set.add(node);
            } else if (Array.isArray(target.sources[node.source.value])) {
                target.sources[node.source.value].push(node);
            } else {
                target.sources[node.source.value] = [node];
            }
        },

        AssignmentExpression(node) {
            if (node.left.type !== "MemberExpression") {
                return;
            }

            const chain = accessorChain(node.left);

            // Assignments to module.exports
            // Deeper assignments are ignored since they just modify what's already being exported
            // (ie. module.exports.exported.prop = true is ignored)
            if (chain[0] === "module" && chain[1] === "exports" && chain.length <= 3) {
                nodes.commonjs.set.add(node);
                return;
            }

            // Assignments to exports (exports.* = *)
            if (chain[0] === "exports" && chain.length === 2) {
                nodes.commonjs.set.add(node);
            }
        },

        "Program:exit": function onExit(programNode) {

            // Report multiple `export` declarations (ES2015 modules)
            if (nodes.modules.set.size > 1) {
                nodes.modules.set.forEach(node => {
                    context.report({
                        node,
                        messageId: "ExportNamedDeclaration",
                        fix
                    });
                });
            }

            // Report multiple `aggregated exports` from the same module (ES2015 modules)
            dedupeAndFlatten(nodes.modules.sources)
                .forEach(node => {
                    context.report({
                        node,
                        messageId: "ExportNamedDeclaration",
                        fix
                    });
                });

            // Report multiple `export type` declarations (FLOW ES2015 modules)
            if (nodes.types.set.size > 1) {
                nodes.types.set.forEach(node => {
                    context.report({
                        node,
                        messageId: "ExportNamedDeclaration",
                        fix
                    });
                });
            }

            // Report multiple `aggregated type exports` from the same module (FLOW ES2015 modules)
            dedupeAndFlatten(nodes.types.sources)
                .forEach(node => {
                    context.report({
                        node,
                        messageId: "ExportNamedDeclaration",
                        fix
                    });
                });

            // Report multiple `module.exports` assignments (CommonJS)
            if (nodes.commonjs.set.size > 1) {
                nodes.commonjs.set.forEach(node => {
                    context.report({
                        node,
                        messageId: "AssignmentExpression",
                        fixable: false
                    });
                });
            }

            // Add export named declaration
            if (nodes.modules.set.size > 1 || nodes.types.set.size > 1) {
                context.report({
                    node: programNode,
                    messageId: "ExportNamedDeclaration",
                    fix
                });
            }
        }
    };
}

/**
 * @type RuleModule
 */
module.exports = {
    meta: {
        docs: {
            description: "Reports when named exports are not grouped together in a single export declaration or when multiple assignments to CommonJS module.exports or exports object are present in a single file",

            category: "Best Practices",

            recommended: true,
            url: "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/group-exports.md"
        },

        fixable: "code",
        messages: errors,
        schema: [],

        type: "suggestion"
    },

    create
};
