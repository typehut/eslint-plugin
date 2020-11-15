"use strict";

/**
 * @typedef {{ code: string, errors: ?Array<{ message: string, type: string }>, options: ?Array<unknown>, parserOptions: ?Array<unknown> }} ESLintTestRunnerTestCase
 */

/**
 * rule options mapper factory
 * @param {Array<unknown>} ruleOptions options
 * @returns {() => ESLintTestRunnerTestCase} mapper
 */
function ruleOptionsMapperFactory(ruleOptions) {
  /**
   * mapper
   * @param {ESLintTestRunnerTestCase} param0 code
   * @returns {ESLintTestRunnerTestCase} mapper
   */
  function mapper({ code, errors, options, parserOptions }) {
    return {
      code,
      errors,

      // Flatten the array of objects in an array of one object.
      options: (options || []).concat(ruleOptions).reduce(
        (acc, item) => [
          {
            ...acc[0],
            ...item,
          },
        ],
        [{}]
      ),
      parserOptions,
    };
  }

  return mapper;
}

module.exports = ruleOptionsMapperFactory;
