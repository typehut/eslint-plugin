"use strict";

const ruleTester = require("../utils/rule-tester");
const rule = require("../../../lib/rules/func-style");

/**
 * @typedef {import("../../../lib/rules/func-style").RuleErrorId} RuleErrorId
 * @type {(...args:(RuleErrorId|[RuleErrorId,string?]|{messageId:RuleErrorId;type?:string})[]) => Array<{messageId:RuleErrorId;type?:string}>}
 */
const errors = require("../utils/errors");

ruleTester().run("func-style", rule, {
  valid: [
    {
      code: "function foo() {}",
      options: ["declaration"],
    },
    {
      code: "const foo = () => {}",
      options: ["arrow"],
    },
    {
      code: "() => {};",
      options: ["arrow"],
    },
    {
      code: "const foo = function(){};",
      options: ["expression"],
    },
    {
      code: "function foo() {const bar = () => {};}",
      options: ["arrow", { topLevelStyle: "declaration" }],
    },
    {
      code: "const foo = () => {function bar(){}};",
      options: ["declaration", { topLevelStyle: "arrow" }],
    },
    {
      code: "const foo = function(){const bar = () => {}};",
      options: ["arrow", { topLevelStyle: "expression" }],
    },
    {
      code: "function foo() {const bar = function(){};}",
      options: ["expression", { topLevelStyle: "declaration" }],
    },
    {
      code: "export default function foo() {const bar = () => {};}",
      options: [
        "arrow",
        { topLevelStyle: "arrow", allowExportDefaultFunctionDeclaration: true },
      ],
    },
    {
      code: "var foo = function* () {}",
      options: ["arrow"],
    },
  ],
  invalid: [
    {
      code: "const foo = (bar: Bar, h=null) => {}",
      output: "function foo(bar: Bar, h=null) {}",
      options: ["declaration"],
      errors: errors("declarationInTopLevel"),
    },
    {
      code: "const foo = () => {}",
      output: "function foo() {}",
      options: ["declaration"],
      errors: errors("declarationInTopLevel"),
    },
    {
      code: "function foo() {}",
      output: "const foo = function() {}",
      options: ["expression"],
      errors: errors("expressionInTopLevel"),
    },
    {
      code: "const foo = function(){}",
      output: "function foo() {}",
      options: ["declaration"],
      errors: errors("declarationInTopLevel"),
    },
    {
      code: "function foo() {const bar = function(){}}",
      output: "function foo() {const bar = () => {}}",
      options: ["arrow", { topLevelStyle: "declaration" }],
      errors: errors("arrow"),
    },
    {
      code: "function foo() {const bar = () => {}}",
      output: "function foo() {const bar = function() {}}",
      options: ["expression", { topLevelStyle: "declaration" }],
      errors: errors("expression"),
    },
    {
      code: "function foo() {const bar = () => {}}",
      output: "function foo() {function bar() {}}",
      options: ["declaration"],
      errors: errors("declaration"),
    },
    {
      code: "async function foo() {const bar = function(){}}",
      output: "const foo = async () => {const bar = () => {}}",
      options: ["arrow"],
      errors: errors("arrowInTopLevel", "arrow"),
    },
    {
      code: "const foo = () => 1",
      output: "function foo() {return 1}",
      options: ["declaration"],
      errors: errors("declarationInTopLevel"),
    },
    {
      code: "function foo<T>(bar:T): void {}",
      output: "const foo = <T,>(bar:T): void => {}",
      options: ["arrow"],
      errors: errors("arrowInTopLevel"),
    },
    {
      code: "function foo<T>(bar:T): void {}",
      output: "const foo = function<T,>(bar:T): void {}",
      options: ["expression"],
      errors: errors("expressionInTopLevel"),
    },
    {
      code: "function* foo() {}",
      output: "const foo = function* () {}",
      options: ["expression"],
      errors: errors("expressionInTopLevel"),
    },
    {
      code: "function* foo() {}",
      output: "const foo = function* () {}",
      options: ["arrow"],
      errors: errors("arrowInTopLevel"),
    },
  ],
});
