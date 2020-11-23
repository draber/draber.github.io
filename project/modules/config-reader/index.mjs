#!/usr/bin/env node


import * as packageJson from './../../../package.json';
import * as configJs from './../../../package.json';

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

const getByKey = key => {
    return key[1].split('.').reduce((entry, i) => entry[i], config);
}


export { config, getByKey, set };