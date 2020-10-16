"use strict";

const { name } = require("../../package.json");

let pluginId = name;

if (name.startsWith("eslint-plugin-")) {
    pluginId = name.slice("eslint-plugin-".length);
} else {
    const match = name.match(/^(@.+)\/eslint-plugin(?:-(.+))?$/u);

    if (match) {
        if (match[2]) {
            pluginId = `${match[1]}/${match[2]}`;
        } else {
            pluginId = match[1];
        }
    }
}

module.exports = { pluginId };
