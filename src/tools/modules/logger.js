#!/usr/bin/env node

/**
 * Available console colors
 * @type {{bgBlack: string, fgBlue: string, hidden: string, bgWhite: string, bright: string, bgMagenta: string, dim: string, blink: string, reverse: string, fgBlack: string, fgYellow: string, bgCyan: string, bgYellow: string, fgWhite: string, underscore: string, fgMagenta: string, reset: string, bgRed: string, bgBlue: string, fgRed: string, bgGreen: string, fgGreen: string, fgCyan: string}}
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    fgBlack: '\x1b[30m',
    fgRed: '\x1b[31m',
    fgGreen: '\x1b[32m',
    fgYellow: '\x1b[33m',
    fgBlue: '\x1b[34m',
    fgMagenta: '\x1b[35m',
    fgCyan: '\x1b[36m',
    fgWhite: '\x1b[37m',
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
}

/**
 * Colors for common message types
 * @type {{success: string, warning: string, error: string, info: string}}
 */
const msgTypes = {
    error: colors.fgRed,
    warning: colors.fgYellow,
    info: colors.fgBlue,
    success: colors.fgGreen
}

/**
 * Retrieve a color from msgTypes or default to reset
 * @param type
 * @returns {string}
 */
const getColor = type => {
    return msgTypes[type] ? `${msgTypes[type]}%s${colors.reset}` : `${colors.reset}%s${colors.reset}`
}

/**
 * Fancy colorized console.log
 * @param msg
 * @param type
 */
const log = (msg, type) => {
    console.log(getColor(type), msg);
}

module.exports = log;