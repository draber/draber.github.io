/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import * as config from '../../config/config.json' assert { type: 'json' };
import * as pkg from '../../../package.json' assert { type: 'json' };

/**
 * Collection of data from `package.json`, `config.json` and `localStorage`
 */
const settings = {
    version: pkg.version,
    label: config.label,
    title: config.title,
    url: config.url,
    prefix: config.prefix,
    support: config.support,
    targetUrl: config.targetUrl,
    options: JSON.parse(localStorage.getItem(config.prefix + '-settings') || '{}')
};

/**
 * Store all options in local storage
 */
const saveOptions = () => {
    localStorage.setItem(settings.prefix + '-settings', JSON.stringify(settings.options));
}

/**
 * Store the version in case something needs to be reset in a new release
 */
if (settings.options.version && settings.options.version !== settings.version) {
    settings.options.oldVersion = settings.options.version;
}

// never used so far but could come in handy if some sort of reset is requires
settings.options.version = settings.version;
saveOptions();

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
    saveOptions();
};

export default {
    get,
    set
}
