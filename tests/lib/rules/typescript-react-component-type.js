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
            options: ["omit"]
        },
        {
            code: "const App: React.FunctionComponent = ()=> null;",
            options: ["raw"]
        },
        {
            code: "const App: React.VFC = ()=> null;",
            options: ["omit"]
        },
        {
            code: "const App: React.VoidFunctionComponent = ()=> null;",
            options: ["raw"]
        }
    ],
    invalid: [
        {
            code: "const App: React.FunctionComponent = ()=> null;",
            output: "const App: React.FC = ()=> null;",
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
            output: "const App: React.FunctionComponent = ()=> null;",
            options: ["raw"],
            errors: [
                {
                    messageId: "enforceFunctionComponent",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.VoidFunctionComponent = ()=> null;",
            output: "const App: React.VFC = ()=> null;",
            errors: [
                {
                    messageId: "enforceVFC",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.VFC = ()=> null;",
            output: "const App: React.VoidFunctionComponent = ()=> null;",
            options: ["raw"],
            errors: [
                {
                    messageId: "enforceVoidFunctionComponent",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.SFC = ()=> null;",
            output: "const App: React.FunctionComponent = ()=> null;",
            options: ["raw"],
            errors: [
                {
                    messageId: "enforceFunctionComponent",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            code: "const App: React.StatelessComponent = ()=> null;",
            output: "const App: React.FC = ()=> null;",
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
