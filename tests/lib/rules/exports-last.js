"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/exports-last");

/**
 * @typedef {import("../../../lib/rules/exports-last").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("exports-last", rule, {
    valid: [

        // Empty file
        "// comment",
        `
        const foo = 'bar'
        const bar = 'baz'
        `,
        `
        const foo = 'bar'
        export {foo}
        `,
        `
        const foo = 'bar'
        export default foo
        `,

        // Only exports
        `
        export default foo
        export const bar = true
        `,
        `
        const foo = 'bar'
        export default foo
        export const bar = true
        `,

        // Multiline export
        `
        const foo = 'bar'
        export default function bar () {
            const very = 'multiline'
        }
        export const baz = true
        `,

        // Many exports
        `
        const foo = 'bar'
        export default foo
        export const so = 'many'
        export const exports = ':)'
        export const i = 'cant'
        export const even = 'count'
        export const how = 'many'
        `,

        // Export all
        `
        export * from './foo'
        `
    ],
    invalid: [

        // Default export before variable declaration
        {
            code: `export default 'bar'
const bar = true`,
            output: `const bar = true
export default 'bar'`,
            errors: errors("enforceExportsLast")
        },

        // Named export before variable declaration
        {
            code: `export const foo = 'bar'
const bar = true`,
            output: `const bar = true
export const foo = 'bar'`,
            errors: errors("enforceExportsLast")
        },

        // Export all before variable declaration
        {
            code: `export * from './foo'
const bar = true`,
            output: `const bar = true
export * from './foo'`,
            errors: errors("enforceExportsLast")
        },

        // Many exports arround variable declaration
        {
            code: `export default 'such foo many bar'
export const so = 'many'
const foo = 'bar'
export const exports = ':)'
const hoge = 'bar'
export const i = 'cant'
export const even = 'count'
export const how = 'many'`,
            output: `const foo = 'bar'
const hoge = 'bar'
export default 'such foo many bar'
export const so = 'many'
export const exports = ':)'
export const i = 'cant'
export const even = 'count'
export const how = 'many'`,
            errors:
                errors("enforceExportsLast", "enforceExportsLast", "enforceExportsLast")
        }
    ]
});
