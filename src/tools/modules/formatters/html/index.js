import expand from './expand.js';
import compress from './compress.js';
import logger from '../../logger/index.js';

const formatters = {
    expand,
    compress
}

const html = (html, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        logger.error(`htmlFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](html);
}

export default html;