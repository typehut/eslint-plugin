"use strict";

/**
 * @param {string} type
 * @param {...any} args
 * @returns {messageId: string, type: string}
 */
function errors(...args) {
    return args.map(arg => {
        const error = {};

        if (typeof arg === "string") {
            error.messageId = arg;
        } else if (Array.isArray(arg) && arg.length > 0) {
            error.messageId = arg[0];
            if (arg.length > 1) {
                error.type = arg[1];
            }
        } else if (typeof arg === "object") {
            error.messageId = arg.messageId;
            if (arg.type) {
                error.type = arg.type;
            }
        }

        return error;
    });
}

module.exports = errors;
