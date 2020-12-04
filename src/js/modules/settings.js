import * as pkg from '../../../package.json';
import * as config from '../../config/config.json';

/**
 * Values from `localStorage`
 * @type {Object}
 */
const options = JSON.parse(localStorage.getItem(config.prefix + '-settings') || '{}')

/**
 * Returns a value based on a key, can also be `foo.bar`
 * @param key
 * @returns {String|undefined}
 */
const get = key => {
    let current = Object.create(settings);
    for(let token of key.split('.')) {
        if(!current[token]){
            return undefined;
        }
        current = current[token];
    }
    return current;
};

/**
 * Assign a new value to a key in settings
 * @param key
 * @param value
 */
const set = (key, value) => {
    const keys = key.split('.');
    const last = keys.pop();
    let current = settings;
    for (let part of keys) {
        if (!current[part]) {
            current[part] = {};
        }        
        if (!Object.prototype.toString.call(current) === '[object Object]') {
            console.error(`${part} is not of the type Object`);
            return false;
        }
        current = current[part];
    }
    current[last] = value;
    localStorage.setItem(config.prefix + '-settings', JSON.stringify(settings.options));
};

/**
 * Returns all settings
 * @returns {{repo: string, options: options, label: string, title: string, version: string, url: string}}
 */
const getAll = () => {
    return settings;
}

/**
 * Collection of settings from `package.json`, `config.json` and `localStorage`
 * @type {{repo: string, options: object, label: string, title: string, version: string, url: string}}
 */
const settings = {
    label: config.label,
    title: config.title,
    url: config.url,
    prefix: config.prefix,
    repo: config.repo,
    version: pkg.version,
    options: options
};

export default {
    get,
    set,
    getAll
}