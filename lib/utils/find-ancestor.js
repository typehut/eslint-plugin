"use strict";

/**
 * Find ancestor by filter
 * @param {ASTNode} node target node
 * @param {(parent: ASTNode) => boolean} filter filter
 * @param {number} depth depth
 * @returns {ASTNode | null} found node
 */
function findAncestor(node, filter, depth = -1) {
    if (!node.parent || (depth !== -1 && depth < 1)) {
        return null;
    }
    if (filter(node.parent)) {
        return node.parent;
    }
    return findAncestor(node.parent, filter, depth === -1 ? depth : depth - 1);
}

module.exports = findAncestor;
