import expand from './expand.js';
import compress from './compress.js';
import compact from './compact.js';
import logger from '../../logger/logger.js';

const formatters = {
    expand,
    compress,
    compact
}

const html = (html, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        logger.error(`htmlFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](html);
}

export default html;