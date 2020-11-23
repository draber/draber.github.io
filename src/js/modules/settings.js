import * as pkg from '../../../package.json';
import * as config from '../../config/config.json';

const stored = JSON.parse(localStorage.getItem('sba-settings') || '{}')

const get = key => {
    return settings[key] || settings.options[key] || null;
};

const set = (key, value) => {
    settings.options[key] = value;
    localStorage.setItem('sba-settings', JSON.stringify(settings.options));
};

const getAll = () => {
    return settings;
}

const getStored = () => {
    return stored;
}

let settings = {
    label: config.label,
    title: config.title,
    url: config.url,
    repo: config.repo,
    version: pkg.version,
    options: {
        ...{
            darkMode: {
                v: stored.darkMode ? stored.darkMode.v : document.body.classList.contains('sba-dark'),
                t: 'Dark Mode'
            }
        },
        ...stored
    }
};

export default {
    get,
    set,
    getAll,
    getStored
}