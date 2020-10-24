"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/typescript-react-require-props-suffix");

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
}).run("typescript-react-require-props-suffix", rule, {
    valid: [
        "const App: React.FC = ()=> null;",
        "const App: React.FC<IAnimalProps> = ()=> null;",
        "const App: React.FC<AnimalProps> = ()=> null;",
        "const App: React.FC<AnimalProps> = ()=> {return (<div></div>)}",
        "const App: React.FC<AnimalProps> = ({children})=> {return (<div></div>)}",
        "const App = ()=> null;"
    ],
    invalid: [{
        code: "const App: React.FC<IAnimal> = ()=> null;",
        errors: [
            {
                messageId: "requireSuffix",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.FC<Props> = ()=> null;",
        errors: [
            {
                messageId: "requireSuffix",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.FC<IAnimalprops> = ()=> null;",
        errors: [
            {
                messageId: "requireSuffix",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.FC<> = ()=> null;",
        errors: [
            {
                messageId: "requireSuffix",
                line: 1,
                column: 12
            }
        ]
    }]
});
