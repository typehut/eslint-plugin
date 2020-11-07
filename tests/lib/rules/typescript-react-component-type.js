"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/typescript-react-component-type");

/**
 * @typedef {import("../../../lib/rules/typescript-react-component-type").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("typescript-react-component-type", rule, {
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
            errors: errors("enforceFC")
        },
        {
            code: "const App: React.FC = ()=> null;",
            output: "const App: React.FunctionComponent = ()=> null;",
            options: ["raw"],
            errors: errors("enforceFunctionComponent")
        },
        {
            code: "const App: React.VoidFunctionComponent = ()=> null;",
            output: "const App: React.VFC = ()=> null;",
            errors: errors("enforceVFC")
        },
        {
            code: "const App: React.VFC = ()=> null;",
            output: "const App: React.VoidFunctionComponent = ()=> null;",
            options: ["raw"],
            errors: errors("enforceVoidFunctionComponent")
        },
        {
            code: "const App: React.SFC = ()=> null;",
            output: "const App: React.FunctionComponent = ()=> null;",
            options: ["raw"],
            errors: errors("enforceFunctionComponent")
        },
        {
            code: "const App: React.StatelessComponent = ()=> null;",
            output: "const App: React.FC = ()=> null;",
            errors: errors("enforceFC")
        }
    ]
});
