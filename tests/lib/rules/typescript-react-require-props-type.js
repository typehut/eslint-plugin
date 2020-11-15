"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/typescript-react-require-props-type");

/**
 * @typedef {import("../../../lib/rules/typescript-react-require-props-type").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("typescript-react-require-props-type", rule, {
  valid: [
    "const App: React.FC<IAnimalProps> = ()=> null;",
    "const App: React.VFC<IAnimalProps> = ()=> null;",
    "const App: React.FunctionComponent<IAnimalProps> = ()=> null;",
    "const App: React.VoidFunctionComponent<IAnimalProps> = ()=> null;",
    "const App: React.FC = ()=> null;",
    "const App: React.FC = ({ children: a })=> null;",
  ],
  invalid: [
    {
      code: "const App: React.FC = ({ foo })=> null;",
      errors: errors("requirePropsType"),
    },
    {
      code: "const App: React.VFC = ({ foo })=> null;",
      errors: errors("requirePropsType"),
    },
    {
      code: "const App: React.FunctionComponent = ({ foo })=> null;",
      errors: errors("requirePropsType"),
    },
    {
      code: "const App: React.VoidFunctionComponent = ({ foo })=> null;",
      errors: errors("requirePropsType"),
    },
    {
      code: "const App: React.FC = ({ children, foo })=> null;",
      errors: errors("requirePropsType"),
    },
  ],
});
