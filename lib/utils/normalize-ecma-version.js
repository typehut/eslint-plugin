"use strict";

const NON_NUMERIC_PATTERN = /[^\d]/gu;

/**
 * Normalize EcmaVersion to correct number
 * @param {string|number} version ecmaVersion string or number
 * @returns number
 */
function normalizeEcmaVersion(version) {
    const numericVersion = parseInt(typeof version === "string" ? version.replace(NON_NUMERIC_PATTERN, "") : version, 10);

    if (numericVersion > 2000) {
        return numericVersion;
    }

    if (numericVersion < 6) {
        return numericVersion;
    }

    return numericVersion + 2009;
}

module.exports = normalizeEcmaVersion;
