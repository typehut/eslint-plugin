"use strict";

module.exports = {
    plugins: ["@croutonn"],
    rules: {
        "func-style": "off",
        "react/prop-types": "off",
        "@croutonn/func-style": ["error", "arrow"],
        "@croutonn/group-exports": ["error"],
        "@croutonn/exports-last": ["error"],
        "@croutonn/typescript-react-component-type": ["error", "raw"],
        "@croutonn/typescript-react-require-props-suffix": ["error"],
        "@croutonn/typescript-react-require-props-type": ["error"]
    }
};
