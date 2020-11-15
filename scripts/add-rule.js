"use strict";

const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");
const { pluginId } = require("./lib/plugin-id");
const ruleId = process.argv[2];

// Require rule ID.
if (!ruleId) {
  console.error("Usage: npm run add-rule <RULE_ID>");
  process.exitCode = 1;
  return;
}

const docPath = path.resolve(__dirname, "../docs/rules", `${ruleId}.md`);
const rulePath = path.resolve(__dirname, "../lib/rules", `${ruleId}.js`);
const testPath = path.resolve(__dirname, "../tests/lib/rules", `${ruleId}.js`);
const docUrl = `${
  pkg.homepage.split("#")[0]
}/blob/main/docs/rules/${ruleId}.md`;

// Overwrite check.
for (const filePath of [docPath, rulePath, testPath]) {
  if (fs.existsSync(filePath)) {
    console.error(
      "%o has existed already.",
      path.relative(process.cwd(), filePath)
    );
    process.exitCode = 1;
    return;
  }
}

// Generate files.
fs.writeFileSync(
  docPath,
  `# ${pluginId}/${ruleId}
> (TODO: summary)

(TODO: why is this rule useful?)

## Rule Details

(TODO: how does this rule check code?)

## Options

(TODO: what do options exist?)
`
);

fs.writeFileSync(
  rulePath,
  `"use strict";

/**
 * @typedef {} RuleErrorId
 */

/**
 * @type {RuleMetaDataMessages}
 */
const errors = {}

/**
 * @type {RuleMetaDataSchema}
 */
const schema = [];

/**
 * @type {RuleMetaData}
 */
const meta = {
    docs: {
        // TODO: write the rule summary.
        description: "",

        // TODO: choose the rule category.
        category: "Possible Errors",
        category: "Best Practices",
        category: "Stylistic Issues",

        recommended: false,
        url: "${docUrl}"
    },

    fixable: null,
    messages: errors,
    schema,

    // TODO: choose the rule type.
    type: "problem",
    type: "suggestion",
    type: "layout"
}

/**
 * @type {RuleCreator}
 */
function create(context) {
    const sourceCode = context.getSourceCode();
    return {}
}

/**
 * @type {RuleModule}
 */
module.exports = {
    meta,
    create
};
`
);

fs.writeFileSync(
  testPath,
  `"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/${ruleId}");

/**
 * @typedef {import("../../../lib/rules/${ruleId}").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("${ruleId}", rule, {
    valid: [],
    invalid: []
});
`
);
