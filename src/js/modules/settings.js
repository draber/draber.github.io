import * as pkg from '../../../package.json';
import * as config from '../../config/config.json';

/**
 * Values from `localStorage`
 * @type {Object}
 */
const stored = JSON.parse(localStorage.getItem(config.prefix + '-settings') || '{}')

/**
 * Returns a value based on a key
 * @param key
 * @returns {String|null}
 */
const get = key => {
    return settings[key] || settings.options[key] || null;
};

/**
 * Assign a new value to a key in settings
 * @param key
 * @param value
 */
const set = (key, value) => {
    settings.options[key] = value;
    localStorage.setItem(config.prefix + '-settings', JSON.stringify(settings.options));
};

/**
 * Returns all settings
 * @returns {{repo: string, options: *, label: string, title: string, version: string, url: string}}
 */
const getAll = () => {
    return settings;
}

/**
 * Returns data from `localStorage`
 * @returns {any}
 */
const getStored = () => {
    return stored;
}

/**
 * Collection of settings from `package.json`, `config.json` and `localStorage`
 * @type {{repo: string, options: any, label: string, title: string, version: string, url: string}}
 */
const settings = Object.assign(
{
    label: config.label,
    title: config.title,
    url: config.url,
    prefix: config.prefix,
    repo: config.repo,
    version: pkg.version,
    options: Object.assign(
        {
            darkMode: {
                v: stored.darkMode ? stored.darkMode.v : document.body.classList.contains(config.prefix + '-dark'),
                t: 'Dark Mode'
            }
        },
        stored
    )
});

export default {
    get,
    set,
    getAll,
    getStored
}