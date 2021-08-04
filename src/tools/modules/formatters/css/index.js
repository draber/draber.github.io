import compact from './compact.js';
import expand from './expand.js';
import compress from './compress.js';
import logger from '../../logger/logger.js';

const formatters = {
    compact,
    expand,
    compress
}

const css = (css, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        logger.error(`cssFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](css);
}

export default css;