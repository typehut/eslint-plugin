"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/group-exports");

/**
 * @typedef {import("../../../lib/rules/group-exports").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("group-exports", rule, {
    valid: [
        "export const test = true",
        `
        export default {}
        export const test = true
        `,
        `
        const first = true
        const second = true
        export {
            first,
            second
        }
        `,
        `
        export default {}
        /* test */
        export const test = true
        `,
        `
        export default {}
        // test
        export const test = true
        `,
        `
        export const test = true
        /* test */
        export default {}
        `,
        `
        export const test = true
        // test
        export default {}
        `,
        `
        export { default as module1 } from './module-1'
        export { default as module2 } from './module-2'
        `,
        "module.exports = {} ",
        `
        module.exports = { test: true,
            another: false }
        `,
        "exports.test = true",

        `
        module.exports = {}
        const test = module.exports
        `,
        `
        exports.test = true
        const test = exports.test
        `,
        `
        module.exports = {}
        module.exports.too.deep = true
        `,
        `
        module.exports.deep.first = true
        module.exports.deep.second = true
        `,
        `
        module.exports = {}
        exports.too.deep = true
        `,
        `
        export default {}
        const test = true
        export { test }
        `,
        `
        const test = true
        export { test }
        const another = true
        export default {}
        `,
        `
        module.something.else = true
        module.something.different = true
        `,
        `
        module.exports.test = true
        module.something.different = true
        `,
        `
        exports.test = true
        module.something.different = true
        `,
        `
        unrelated = 'assignment'
        module.exports.test = true
        `,
        `
        type firstType = {
            propType: string
        };
        const first = {};
        export type { firstType };
        export { first };
        `,
        `
        type firstType = {
            propType: string
        };
        type secondType = {
            propType: string
        };
        export type { firstType, secondType };
        `,
        `
        export type { type1A, type1B } from './module-1'
        export { method1 } from './module-1'
        `
    ],
    invalid: [
        {
            code: `
            export const test = true
            export const another = true`,
            output: `
            const test = true
            const another = true
export { test, another }`,
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration", "ExportNamedDeclaration")
        },
        {
            code: `export { method1 } from './module-1'
export { method2 } from './module-1'`,
            output: "export { method1, method2 } from './module-1'\n\n",
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration")
        },
        {
            code: `
            module.exports = {}
            module.exports.test = true
            module.exports.another = true`,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = {}
            module.exports.test = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = { test: true }
            module.exports.another = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports.test = true
            module.exports.another = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            exports.test = true
            module.exports.another = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = () => {}
            module.exports.attached = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = function () {}
            module.exports.attached = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = () => {}
            exports.test = true
            exports.another = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = "non-object"
            module.exports.attached = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            module.exports = "non-object"
            module.exports.attached = true
            module.exports.another = true
        `,
            output: null,
            errors: errors("AssignmentExpression", "AssignmentExpression", "AssignmentExpression")
        },
        {
            code: `
            type firstType = {
            propType: string
            };
            type secondType = {
            propType: string
            };
            const first = {};
            export type { firstType };
            export type { secondType };
            export { first };`,
            output: `
            type firstType = {
            propType: string
            };
            type secondType = {
            propType: string
            };
            const first = {};
            
            
            
export type { firstType, secondType }
export { first }`,
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration", "ExportNamedDeclaration")
        },
        {
            code: `export type { type1 } from './module-1'
export type { type2 } from './module-1'`,
            output: "export type { type1, type2 } from './module-1'\n\n",
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration")
        },
        {
            code: `export const { foo: foo1, bar: { bar: bar1 }, hoge: [hoge1, hoge2] } = { foo: "foo", bar: { bar: "bar" }, hoge: ["hoge1", "hoge2"] }
export const foo2 = "foo2"`,
            output: `const { foo: foo1, bar: { bar: bar1 }, hoge: [hoge1, hoge2] } = { foo: "foo", bar: { bar: "bar" }, hoge: ["hoge1", "hoge2"] }
const foo2 = "foo2"
export { foo1, bar1, hoge1, hoge2, foo2 }`,
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration", "ExportNamedDeclaration")
        },
        {
            code: `export const foo = "foo"
export { foo }`,
            output: `const foo = "foo"

export { foo }`,
            errors: errors("ExportNamedDeclaration", "ExportNamedDeclaration", "ExportNamedDeclaration")
        }
    ]
});
