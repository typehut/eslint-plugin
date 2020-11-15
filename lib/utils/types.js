"use strict";

const t = require("@babel/types");

/**
 * @param {string} fieldName
 * @returns {boolean}
 */
function createHasListField(fieldName) {
  return (node = {}) =>
    Array.isArray(node[fieldName]) && node[fieldName].length > 0;
}

const hasDeclarations = createHasListField("declarations");
const hasElements = createHasListField("elements");
const hasProperties = createHasListField("properties");
const hasSpecifiers = createHasListField("specifiers");

/**
 * @param {ASTNode} node
 * @returns {boolean}
 */
function isAliasedExportSpecifier(node) {
  return t.isExportSpecifier(node) && node.local.name !== node.exported.name;
}

/**
 * @param {ASTNode} node
 * @returns {boolean}
 */
function isExportStatement(node) {
  return (
    t.isExportDefaultDeclaration(node) ||
    t.isExportNamedDeclaration(node) ||
    t.isExportAllDeclaration(node)
  );
}

/**
 * @param {ASTNode} node
 * @returns {boolean}
 */
function isTypeExport(node) {
  return isExportStatement(node) && node.exportKind === "type";
}

/**
 * @param {ASTNode} node
 * @returns {boolean}
 */
function isValueExport(node) {
  return isExportStatement(node) && node.exportKind === "value";
}

/**
 * Whether the node is React Function Component
 * @param {ASTNode} node
 * @returns {boolean}
 */
function isReactFunctionComponent(node) {
  return (
    node.left.name === "React" &&
    (node.right.name === "FC" ||
      node.right.name === "FunctionComponent" ||
      node.right.name === "VFC" ||
      node.right.name === "VoidFunctionComponent" ||
      node.right.name === "StatelessComponent")
  );
}

module.exports = {
  ...t,
  isAliasedExportSpecifier,
  isExportStatement,
  isTypeExport,
  isValueExport,
  isReactFunctionComponent,
  hasDeclarations,
  hasElements,
  hasProperties,
  hasSpecifiers,
};
