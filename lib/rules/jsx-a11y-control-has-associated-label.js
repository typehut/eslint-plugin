"use strict";

const { elementType, getProp, getLiteralPropValue } = require("jsx-ast-utils");
const includes = require("array-includes");
const {
  arraySchema,
  generateObjSchema,
} = require("eslint-plugin-jsx-a11y/lib/util/schemas");
const isDOMElement = require("eslint-plugin-jsx-a11y/lib/util/isDOMElement")
  .default;
const isHiddenFromScreenReader = require("eslint-plugin-jsx-a11y/lib/util/isHiddenFromScreenReader")
  .default;
const isInteractiveElement = require("eslint-plugin-jsx-a11y/lib/util/isInteractiveElement")
  .default;
const isInteractiveRole = require("eslint-plugin-jsx-a11y/lib/util/isInteractiveRole")
  .default;
const mayHaveAccessibleLabel = require("eslint-plugin-jsx-a11y/lib/util/mayHaveAccessibleLabel")
  .default;
const t = require("../utils/types");
const findAncestor = require("../utils/find-ancestor");

const ignoreList = ["link"];

/**
 * @typedef {"enforceControlHasAssociatedLabel"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  enforceControlHasAssociatedLabel:
    "A control must be associated with a text label.",
};

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [
  generateObjSchema({
    labelAttributes: arraySchema,
    controlComponents: arraySchema,
    ignoreElements: arraySchema,
    ignoreRoles: arraySchema,
    depth: {
      description: "JSX tree depth limit to check for accessible label",
      type: "integer",
      minimum: 0,
    },
    ignoreAttributeInner: { type: "boolean" },
    attributeTracingDepth: { type: "integer" },
  }),
];

/**
 * @type {RuleMetaData}
 */
const meta = {
  docs: {
    description:
      "Enforce that a control (an interactive element) has a text label",

    category: "Best Practices",

    recommended: false,
    url:
      "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/jsx-a11y-control-has-associated-label.md",
  },

  fixable: null,
  messages: errors,
  schema,

  type: "suggestion",
};

/**
 * @type {RuleCreator}
 */
function create(context) {
  const options = context.options[0] || {};
  const {
    labelAttributes = [],
    controlComponents = [],
    ignoreElements = [],
    ignoreRoles = [],
    ignoreAttributeInner = true,
    attributeTracingDepth = 4,
  } = options;

  const newIgnoreElements = new Set([...ignoreElements, ...ignoreList]);

  /**
   * Core function of the rule
   * @param {JSXElement} node target node
   * @returns {void}
   */
  function rule(node) {
    const tag = elementType(node.openingElement);
    const role = getLiteralPropValue(
      getProp(node.openingElement.attributes, "role")
    );

    // Ignore interactive elements that might get their label from a source
    // that cannot be discerned from static analysis, like
    // <label><input />Save</label>
    if (newIgnoreElements.has(tag)) {
      return;
    }

    // Ignore roles that are "interactive" but should not require a label.
    if (includes(ignoreRoles, role)) {
      return;
    }
    const props = node.openingElement.attributes;
    const nodeIsDOMElement = isDOMElement(tag);
    const nodeIsHiddenFromScreenReader = isHiddenFromScreenReader(tag, props);
    const nodeIsInteractiveElement = isInteractiveElement(tag, props);
    const nodeIsInteractiveRole = isInteractiveRole(tag, props);
    const nodeIsControlComponent = controlComponents.indexOf(tag) > -1;

    if (nodeIsHiddenFromScreenReader) {
      return;
    }

    let hasAccessibleLabel = true;

    if (
      nodeIsInteractiveElement ||
      (nodeIsDOMElement && nodeIsInteractiveRole) ||
      nodeIsControlComponent
    ) {
      // Prevent crazy recursion.
      const recursionDepth = Math.min(
        options.depth === void 0 ? 2 : options.depth,
        25
      );

      hasAccessibleLabel = mayHaveAccessibleLabel(
        node,
        recursionDepth,
        labelAttributes
      );
    }

    if (
      ignoreAttributeInner &&
      findAncestor(
        node,
        (parent) => t.isJSXAttribute(parent),
        attributeTracingDepth
      )
    ) {
      return;
    }

    if (!hasAccessibleLabel) {
      context.report({
        node: node.openingElement,
        messageId: "enforceControlHasAssociatedLabel",
      });
    }
  }

  // Create visitor selectors.
  return {
    JSXElement: rule,
  };
}

/**
 * @type {RuleModule}
 */
module.exports = {
  meta,
  create,
};
