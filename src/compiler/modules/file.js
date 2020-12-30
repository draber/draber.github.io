#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const handleError = require('./errorHandler.js');
const log = require('./logger.js');

/**
 * Read a file synchronously and handle errors
 * @param filePath
 * @returns {String}
 */
const read = filePath => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        handleError(error);
    }
}

const write = (filePath, data, message) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    try {
        fs.writeFileSync(filePath, data);
        if(message){
            log(message, 'success')
        }
    } catch (error) {
        handleError(error);
    }
}

module.exports.read = read;
module.exports.write = write;
