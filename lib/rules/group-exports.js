"use strict";

/**
 * @typedef {Object} RuleStackNodes
 * @property {{set: Set<ASTNode>; sources: Record<string, ASTNode>}} RuleStackNodes.modules
 * @property {{set: Set<ASTNode>; sources: Record<string, ASTNode>}} RuleStackNodes.types
 * @property {{set: Set<ASTNode>}} RuleStackNodes.commonjs
 * @property {{set: Set<ASTNode>}} RuleStackNodes.declarations
 * @property {{set: Set<ASTNode>; sources: Record<string, ASTNode>}} RuleStackNodes.moduleSpecifiers
 * @property {{set: Set<ASTNode>; sources: Record<string, ASTNode>}} RuleStackNodes.typeSpecifiers
 */

const t = require("../utils/types");
const accessorChain = require("../utils/accessor-chain");

/**
 * @typedef {"ExportNamedDeclaration"|"AssignmentExpression"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  ExportNamedDeclaration:
    "Multiple named export declarations; consolidate all named exports into a single export declaration",
  AssignmentExpression:
    "Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`",
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
      "Reports when named exports are not grouped together in a single export declaration or when multiple assignments to CommonJS module.exports or exports object are present in a single file",

    category: "Best Practices",

    recommended: true,
    url:
      "https://github.com/typehut/eslint-plugin/blob/main/docs/rules/group-exports.md",
  },

  fixable: "code",
  messages: errors,
  schema,

  type: "suggestion",
};

/**
 * @param {unknown[][]} array
 * @returns {unkown[]}
 */
function dedupeAndFlatten(array) {
  return Object.values(array)
    .filter((item) => Array.isArray(item) && item.length > 1)
    .flat();
}

/**
 * @param {Object} root0
 * @param {RuleContext} root0.context
 * @param {ASTNode} root0.nodes
 * @param {(ASTNode|[number,number])[]} root0.elementsToBeRemoved
 * @param {{modules:Record<string,ASTNode>;types:Record<string,ASTNode>}} root0.remainDeclarations
 * @returns {(target: ExportNamedDeclaration) => void}
 */
function createNodeListToRemoveProcessor({
  context,
  nodes,
  elementsToBeRemoved,
  remainDeclarations,
}) {
  const sourceCode = context.getSourceCode();

  /**
   * @param {ExportNamedDeclaration} target
   * @returns {void}
   */
  function processor(target) {
    if (target.source) {
      const specifiers = t.isTypeExport(target)
        ? nodes.typeSpecifiers.sources
        : nodes.moduleSpecifiers.sources;
      const remainDeclaration = t.isTypeExport(target)
        ? remainDeclarations.types
        : remainDeclarations.modules;

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
    } else if (target.declaration && t.isIdentifier(target.declaration)) {
      const specifiers = t.isTypeExport(target)
        ? nodes.typeSpecifiers
        : nodes.moduleSpecifiers;

      specifiers.set.add({
        local: {
          name: target.declaration.id.name,
        },
        exported: {
          name: target.declaration.id.name,
        },
      });

      // remove `export ` from declaration
      const leadingExportTokens = sourceCode.getFirstTokens(target, 2);

      elementsToBeRemoved.push([
        leadingExportTokens[0].range[0],
        leadingExportTokens[1].range[0],
      ]);
    } else if (t.isVariableDeclaration(target.declaration)) {
      context
        .getDeclaredVariables(target.declaration)
        .map((variable) => variable.name)
        .forEach((name) => {
          nodes.moduleSpecifiers.set.add({
            local: { name },
            exported: { name },
          });
        });

      // remove `export ` from declaration
      const leadingExportTokens = sourceCode.getFirstTokens(target, 2);

      elementsToBeRemoved.push([
        leadingExportTokens[0].range[0],
        leadingExportTokens[1].range[0],
      ]);
    } else if (t.hasSpecifiers(target)) {
      const specifiers = t.isTypeExport(target)
        ? nodes.typeSpecifiers
        : nodes.moduleSpecifiers;

      target.specifiers.forEach((specifier) => specifiers.set.add(specifier));

      // remove entire code of target
      elementsToBeRemoved.push(target);
    }
  }

  return processor;
}

/**
 * @param {Iterable<ExportSpecifier>} specifierSet
 * @returns {string[]}
 */
function normalizeExports(specifierSet) {
  const exports = new Set();

  specifierSet.forEach((specifier) => {
    exports.add(
      t.isAliasedExportSpecifier(specifier)
        ? `${specifier.local.name} as ${specifier.exported.name}`
        : specifier.local.name
    );
  });

  return Array.from(exports);
}

/**
 * @param {Object} root0
 * @param {RuleStackNodes} root0.nodes
 * @param {{code:string;range:[number,number]}[]} root0.replaces
 * @returns {(declarations:ExportNamedDeclaration) => void}
 */
function createAggregatedProcessor({ nodes, replaces }) {
  /**
   * @param {ExportNamedDeclaration[]} declarations
   * @returns {void}
   */
  function processor(declarations) {
    Object.values(declarations).forEach((declaration) => {
      const firstSpecifier = declaration.specifiers.slice(0, 1)[0];
      const lastSpecifier = declaration.specifiers.slice(-1)[0];
      const range = [firstSpecifier.range[0], lastSpecifier.range[1]];
      const specifiers = t.isTypeExport(declaration)
        ? nodes.typeSpecifiers.sources[declaration.source.value]
        : nodes.moduleSpecifiers.sources[declaration.source.value];
      const code = normalizeExports(specifiers).join(", ");

      replaces.push({ code, range });
    });
  }

  return processor;
}

/**
 * @param {RuleContext} context
 * @param {RuleStackNodes} nodes
 * @returns {RuleFixer}
 */
function createFix(context, nodes) {
  const sourceCode = context.getSourceCode();

  /**
   * @param {RuleFixer} fixer
   * @returns {RuleFix}
   */
  function* fix(fixer) {
    const elementsToBeRemoved = [];
    const remainDeclarations = {
      modules: {},
      types: {},
    };

    const nodeListToRemoveProcessor = createNodeListToRemoveProcessor({
      context,
      elementsToBeRemoved,
      remainDeclarations,
      nodes,
    });

    nodes.modules.set.forEach(nodeListToRemoveProcessor);
    nodes.types.set.forEach(nodeListToRemoveProcessor);
    dedupeAndFlatten(nodes.modules.sources).forEach(nodeListToRemoveProcessor);
    dedupeAndFlatten(nodes.types.sources).forEach(nodeListToRemoveProcessor);

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
    const moduleExports = normalizeExports(nodes.moduleSpecifiers.set);
    const typeExports = normalizeExports(nodes.typeSpecifiers.set);

    if (typeExports.length > 0) {
      codeToInsert.push(`export type { ${typeExports.join(", ")} }`);
    }
    if (moduleExports.length > 0) {
      codeToInsert.push(`export { ${moduleExports.join(", ")} }`);
    }

    // Insert group-exports
    yield fixer.insertTextAfter(
      sourceCode.ast.body.slice(-1)[0],
      `\n${codeToInsert.join("\n")}`
    );

    // Fix aggregated exports

    /**
     * @type {{code:string;range:[number,number]}[]}
     */
    const replaces = [];
    const aggregatedProcessor = createAggregatedProcessor({
      nodes,
      replaces,
    });

    aggregatedProcessor(remainDeclarations.modules);
    aggregatedProcessor(remainDeclarations.types);

    for (const replacer of replaces) {
      yield fixer.replaceTextRange(replacer.range, replacer.code);
    }
  }

  return fix;
}

/**
 * @type {RuleCreator}
 */
function create(context) {
  const nodes = {
    modules: {
      set: new Set(),
      sources: {},
    },
    types: {
      set: new Set(),
      sources: {},
    },
    commonjs: {
      set: new Set(),
    },
    declarations: {
      set: new Set(),
    },
    moduleSpecifiers: {
      set: new Set(),
      sources: {},
    },
    typeSpecifiers: {
      set: new Set(),
      sources: {},
    },
  };

  const fix = createFix(context, nodes);

  return {
    ExportNamedDeclaration(node) {
      const target = t.isTypeExport(node) ? nodes.types : nodes.modules;

      if (!node.source) {
        target.set.add(node);
      } else if (Array.isArray(target.sources[node.source.value])) {
        target.sources[node.source.value].push(node);
      } else {
        target.sources[node.source.value] = [node];
      }
    },

    AssignmentExpression(node) {
      if (!t.isMemberExpression(node.left)) {
        return;
      }

      const chain = accessorChain(node.left);

      // Assignments to module.exports
      // Deeper assignments are ignored since they just modify what's already being exported
      // (ie. module.exports.exported.prop = true is ignored)
      if (
        chain[0] === "module" &&
        chain[1] === "exports" &&
        chain.length <= 3
      ) {
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
        nodes.modules.set.forEach((node) => {
          context.report({
            node,
            messageId: "ExportNamedDeclaration",
            fix,
          });
        });
      }

      // Report multiple `aggregated exports` from the same module (ES2015 modules)
      dedupeAndFlatten(nodes.modules.sources).forEach((node) => {
        context.report({
          node,
          messageId: "ExportNamedDeclaration",
          fix,
        });
      });

      // Report multiple `export type` declarations (FLOW ES2015 modules)
      if (nodes.types.set.size > 1) {
        nodes.types.set.forEach((node) => {
          context.report({
            node,
            messageId: "ExportNamedDeclaration",
            fix,
          });
        });
      }

      // Report multiple `aggregated type exports` from the same module (FLOW ES2015 modules)
      dedupeAndFlatten(nodes.types.sources).forEach((node) => {
        context.report({
          node,
          messageId: "ExportNamedDeclaration",
          fix,
        });
      });

      // Report multiple `module.exports` assignments (CommonJS)
      if (nodes.commonjs.set.size > 1) {
        nodes.commonjs.set.forEach((node) => {
          context.report({
            node,
            messageId: "AssignmentExpression",
            fixable: false,
          });
        });
      }

      // Add export named declaration
      if (nodes.modules.set.size > 1 || nodes.types.set.size > 1) {
        context.report({
          node: programNode,
          messageId: "ExportNamedDeclaration",
          fix,
        });
      }
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
