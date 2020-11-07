"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/typescript-react-require-props-suffix");

/**
 * @typedef {import("../../../lib/rules/typescript-react-require-props-suffix").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("typescript-react-require-props-suffix", rule, {
    valid: [
        "const App: React.FC = ()=> null;",
        "const App: React.FC<IAnimalProps> = ()=> null;",
        "const App: React.FC<AnimalProps> = ()=> null;",
        "const App: React.FC<AnimalProps> = ()=> {return (<div></div>)}",
        "const App: React.FC<AnimalProps> = ({children})=> {return (<div></div>)}",
        "const App = ()=> null;",
        "const App: React.FC<{}> = ()=> null;"
    ],
    invalid: [{
        code: "const App: React.FC<IAnimal> = ()=> null;",
        errors: errors("requireSuffix")
    },
    {
        code: "const App: React.FC<Props> = ()=> null;",
        errors: errors("requireSuffix")
    },
    {
        code: "const App: React.FC<IAnimalprops> = ()=> null;",
        errors: errors("requireSuffix")
    },
    {
        code: "const App: React.FC<> = ()=> null;",
        errors: errors("requireSuffix")
    }]
});
