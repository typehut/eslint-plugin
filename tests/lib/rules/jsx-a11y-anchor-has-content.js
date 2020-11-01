"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/jsx-a11y-anchor-has-content");

const expectedError = {
    messageId: "error",
    type: "JSXOpeningElement"
};

new RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        ecmaVersion: 2015,
        ecmaFeatures: {
            jsx: true
        },
        lib: ["dom", "dom.iterable", "esnext"],
        sourceType: "module"
    }
}).run("jsx-a11y-anchor-has-content", rule, {
    valid: [
        "<div />;",
        "<a>Foo</a>",
        "<a><Bar /></a>",
        "<a>{foo}</a>",
        "<a>{foo.bar}</a>",
        '<a dangerouslySetInnerHTML={{ __html: "foo" }} />',
        "<a children={children} />",
        "<Trans components={[<a href=\"foo\" />]} />"
    ],
    invalid: [
        { code: "<a />", errors: [expectedError] },
        { code: "<a><Bar aria-hidden /></a>", errors: [expectedError] },
        { code: "<a>{undefined}</a>", errors: [expectedError] },
        { code: "<Trans components={[<a href=\"foo\" />]} />", options: [{ ignoreAttributeInner: false }], errors: [expectedError] }
    ]
});
