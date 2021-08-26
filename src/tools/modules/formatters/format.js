import console from 'a-nicer-console';;
import json from './json/index.js';
import html from './html/index.js';
import js from './js/index.js';
import css from './css/index.js';

const formatters = {
    json,
    html,
    js,
    css
}

const format = (type, data, format) => {
    if(format === 'keep') {
        return data;
    }
    if (!formatters[type] || !(formatters[type] instanceof Function)) {
        console.error(`format: Unknown type ${type}`);
        return false;
    }
    return formatters[type](data, format);
}

export default format;