#!/usr/bin/env node

const fs = require('fs');
const packageJson = require(__dirname + '/../../../package.json');
const configJs = require(__dirname + '/../../config/config.json');

const config = Object.assign(packageJson, configJs);

/**
 * Add values to the config, will overwrite without confirmation!
 * 
 * @param {String} key 
 * @param {String} value 
 */
const set = (key, value) => {
    config[key] = value;
}

/**
 * Include information from main package.json
 * 
 * @param {String} contents 
 */
const insertConfigValues = (contents) => {
    [...contents.matchAll(/{{config\(([^}]+)\)}}/g)].forEach(record => {
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
module.exports.set = set; 
