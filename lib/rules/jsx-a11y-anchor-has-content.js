"use strict";

const { elementType } = require("jsx-ast-utils");
const {
  arraySchema,
  generateObjSchema,
} = require("eslint-plugin-jsx-a11y/lib/util/schemas");
const hasAccessibleChild = require("eslint-plugin-jsx-a11y/lib/util/hasAccessibleChild")
  .default;
const t = require("../utils/types");
const findAncestor = require("../utils/find-ancestor");

/**
 * @typedef {"enforceAnchorHasContent"} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {
  enforceAnchorHasContent:
    "Anchors must have content and the content must be accessible by a screen reader.",
};

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [
  generateObjSchema({
    components: arraySchema,
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
      "Enforce that anchors have content and that the content is accessible to screen readers",

    category: "Best Practices",

    recommended: false,
    url:
      "https://github.com/croutonn/eslint-plugin/blob/main/docs/rules/jsx-a11y-anchor-has-content.md",
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
  return {
    JSXOpeningElement: (node) => {
      const options = context.options[0] || {};
      const {
        components = [],
        ignoreAttributeInner = true,
        attributeTracingDepth = 4,
      } = options;
      const typeCheck = ["a"].concat(components);
      const nodeType = elementType(node);

      // Only check anchor elements and custom types.
      if (typeCheck.indexOf(nodeType) === -1) {
        return;
      }
      if (hasAccessibleChild(node.parent)) {
        return;
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

      context.report({
        node,
        messageId: "enforceAnchorHasContent",
      });
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
