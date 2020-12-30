#!/usr/bin/env node

const log = require('./logger.js');

const handleError = error => {
    log(error.message, 'error');
    log(error.stack, 'info');
    process.exit();
}

module.exports = handleError;