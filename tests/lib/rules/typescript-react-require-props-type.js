"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/typescript-react-require-props-type");

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
}).run("typescript-react-require-props-type", rule, {
    valid: [
        "const App: React.FC<IAnimalProps> = ()=> null;",
        "const App: React.VFC<IAnimalProps> = ()=> null;",
        "const App: React.FunctionComponent<IAnimalProps> = ()=> null;",
        "const App: React.VoidFunctionComponent<IAnimalProps> = ()=> null;",
        "const App: React.FC = ()=> null;"
    ],
    invalid: [{
        code: "const App: React.FC = ({ foo })=> null;",
        errors: [
            {
                messageId: "requirePropsType",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.VFC = ({ foo })=> null;",
        errors: [
            {
                messageId: "requirePropsType",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.FunctionComponent = ({ foo })=> null;",
        errors: [
            {
                messageId: "requirePropsType",
                line: 1,
                column: 12
            }
        ]
    },
    {
        code: "const App: React.VoidFunctionComponent = ({ foo })=> null;",
        errors: [
            {
                messageId: "requirePropsType",
                line: 1,
                column: 12
            }
        ]
    }
    ]
});
