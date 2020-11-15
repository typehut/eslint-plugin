"use strict";

const t = require("./types");

/**
 * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
 *
 * Example:
 *
 * `module.exports = {}` => ['module', 'exports']
 * `module.exports.property = true` => ['module', 'exports', 'property']
 * @param       {ASTNode}    node AST Node (MemberExpression)
 * @returns     {Array}           Array with the property names in the chain
 * @private
 */
function accessorChain(node) {
  const chain = [];
  let target = node;

  do {
    chain.unshift(target.property.name);

    if (t.isIdentifier(target.object)) {
      chain.unshift(target.object.name);
      break;
    }

    target = target.object;
  } while (t.isMemberExpression(target));

  return chain;
}

module.exports = accessorChain;
