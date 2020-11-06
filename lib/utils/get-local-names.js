"use strict";

/**
 * @typedef {import("estree").VariableDeclaration} VariableDeclaration
 * @typedef {import("estree").VariableDeclarator} VariableDeclarator
 * @typedef {import("estree").ObjectPattern} ObjectPattern
 * @typedef {import("estree").ArrayPattern} ArrayPattern
 * @typedef {import("estree").Property} Property
 * @typedef {import("estree").Identifier} Identifier
 */

/**
 * @param {VariableDeclaration|VariableDeclarator|ObjectPattern|ArrayPattern|Property|Identifier} node
 * @returns {string[]}
 */
function getLocalNames(node) {
    switch (node.type) {
        case "VariableDeclaration":
            return node.declarations.map(declaration => getLocalNames(declaration)).flat();
        case "VariableDeclarator":
            return getLocalNames(node.id);
        case "ObjectPattern":
            return node.properties.map(property => getLocalNames(property)).flat();
        case "Property":
            return getLocalNames(node.value);
        case "ArrayPattern":
            return node.elements.map(element => getLocalNames(element)).flat();
        case "Identifier":
            return node.name;
        default:
            return [];
    }
}

module.exports = getLocalNames;
