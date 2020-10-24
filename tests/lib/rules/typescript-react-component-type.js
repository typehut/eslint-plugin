"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/typescript-react-component-type");

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
}).run("typescript-react-component-type", rule, {
    valid: [
        "const App: React.FC = ()=> null;",
        "const App = ()=> null;",
        {
            code: "const App: React.FC = ()=> null;",
            options: ["FC"]
        },
        {
            code: "const App: React.FunctionComponent = ()=> null;",
            options: ["FunctionComponent"]
        }
    ],
    invalid: [
        {
            code: "const App: React.FunctionComponent = ()=> null;",
            errors: [
                {
                    messageId: "enforceFC",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.FC = ()=> null;",
            options: ["FunctionComponent"],
            errors: [
                {
                    messageId: "enforceFunctionComponent",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.SFC = ()=> null;",
            errors: [
                {
                    messageId: "enforceFC",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.StatelessComponent = ()=> null;",
            errors: [
                {
                    messageId: "enforceFC",
                    line: 1,
                    column: 12
                }
            ]
        }
    ]
});
