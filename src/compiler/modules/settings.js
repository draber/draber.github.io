#!/usr/bin/env node

const pkg = require('../../../package.json');
const config = require('../../config/config.json');

/**
 * Collection of data from `package.json`, `config.json`
 */
const settings = {
    ...pkg,
    ...config
}

/**
 * Returns a value based on a key, can also be `foo.bar`
 * @param {String} key
 * @returns {String|undefined}
 */
const get = key => {
    let current = Object.create(settings);
    for (let token of key.split('.')) {
        if (typeof current[token] === 'undefined') {
            return undefined;
        }
        current = current[token];
    }
    return current;
};

/**
 * Assign a new value to a key in settings
 * @param {String} key
 * @param {*} value
 */
const set = (key, value) => {
    const keys = key.split('.');
    const last = keys.pop();
    let current = settings;
    for (let part of keys) {
        if (!current[part]) {
            current[part] = {};
        }
        if (Object.prototype.toString.call(current) !== '[object Object]') {
            console.error(`${part} is not of the type Object`);
            return false;
        }
        current = current[part];
    }
    current[last] = value;
};


module.exports = {
    get,
    set
};