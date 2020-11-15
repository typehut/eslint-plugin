"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/jsx-a11y-anchor-has-content");

/**
 * @typedef {import("../../../lib/rules/jsx-a11y-anchor-has-content").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");
const expectedErrors = errors(["enforceAnchorHasContent", "JSXOpeningElement"]);

ruleTester().run("jsx-a11y-anchor-has-content", rule, {
  valid: [
    "<div />;",
    "<a>Foo</a>",
    "<a><Bar /></a>",
    "<a>{foo}</a>",
    "<a>{foo.bar}</a>",
    '<a dangerouslySetInnerHTML={{ __html: "foo" }} />',
    "<a children={children} />",
    '<Trans components={[<a href="foo" />]} />',
  ],
  invalid: [
    { code: "<a />", errors: expectedErrors },
    { code: "<a><Bar aria-hidden /></a>", errors: expectedErrors },
    { code: "<a>{undefined}</a>", errors: expectedErrors },
    {
      code: '<Trans components={[<a href="foo" />]} />',
      options: [{ ignoreAttributeInner: false }],
      errors: expectedErrors,
    },
  ],
});
