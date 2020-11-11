#!/usr/bin/env node

const fs = require('fs');
const config = require('./package.json');

/**
 * Include information from main package.json
 * 
 * @param {String} source 
 */
const insertConfigValues = (source) => {
    let contents = fs.readFileSync(source, 'utf8');
    [...contents.matchAll(/{{package\(([^}]+)\)}}/g)].forEach(record => {
        try {
            const replacement = record[1].split('.').reduce((entry, i) => entry[i], config);
            contents = contents.replace(record[0], replacement);
        }
        catch (error) {
            console.error(error.message);
        }
    });
    return contents;
}

module.exports = insertConfigValues;
