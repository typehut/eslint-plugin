"use strict";

module.exports = {
    plugins: ["@croutonn"],
    rules: {
        "func-style": "off",
        "react/prop-types": "off",
        "@croutonn/func-style": ["error", "arrow"],
        "@croutonn/typescript-react-component-type": ["raw"],
        "@croutonn/typescript-react-require-props-suffix": ["error"],
        "@croutonn/typescript-react-require-props-type": ["error"]
    }
};
