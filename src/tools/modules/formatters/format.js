import logger from '../modules/logger/logger.js';
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
    if (!formatters[type] || !(formatters[type] instanceof Function)) {
        logger.error(`finalize: Unknown type ${type}`);
        return false;
    }
    return formatters[type](data, format);
}

export default format;