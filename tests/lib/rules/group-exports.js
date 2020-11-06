"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/group-exports");

const errors = {
    named: { messageId: "ExportNamedDeclaration" },
    commonjs: { messageId: "AssignmentExpression" }
};

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
}).run("group-exports", rule, {
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
            errors: [
                errors.named,
                errors.named,
                errors.named
            ]
        },
        {
            code: `export { method1 } from './module-1'
export { method2 } from './module-1'`,
            output: "export { method1, method2 } from './module-1'\n\n",
            errors: [
                errors.named,
                errors.named
            ]
        },
        {
            code: `
            module.exports = {}
            module.exports.test = true
            module.exports.another = true`,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = {}
            module.exports.test = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = { test: true }
            module.exports.another = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports.test = true
            module.exports.another = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            exports.test = true
            module.exports.another = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = () => {}
            module.exports.attached = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = function () {}
            module.exports.attached = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = () => {}
            exports.test = true
            exports.another = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = "non-object"
            module.exports.attached = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs
            ]
        },
        {
            code: `
            module.exports = "non-object"
            module.exports.attached = true
            module.exports.another = true
        `,
            output: null,
            errors: [
                errors.commonjs,
                errors.commonjs,
                errors.commonjs
            ]
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
            errors: [
                errors.named,
                errors.named,
                errors.named
            ]
        },
        {
            code: `export type { type1 } from './module-1'
export type { type2 } from './module-1'`,
            output: "export type { type1, type2 } from './module-1'\n\n",
            errors: [
                errors.named,
                errors.named
            ]
        },
        {
            code: `export const { foo: foo1, bar: { bar: bar1 }, hoge: [hoge1, hoge2] } = { foo: "foo", bar: { bar: "bar" }, hoge: ["hoge1", "hoge2"] }
export const foo2 = "foo2"`,
            output: `const { foo: foo1, bar: { bar: bar1 }, hoge: [hoge1, hoge2] } = { foo: "foo", bar: { bar: "bar" }, hoge: ["hoge1", "hoge2"] }
const foo2 = "foo2"
export { foo1, bar1, hoge1, hoge2, foo2 }`,
            errors: [
                errors.named,
                errors.named,
                errors.named
            ]
        }
    ]
});
