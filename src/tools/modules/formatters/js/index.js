import expand from './expand.js';
import compress from './compress.js';
import logger from '../../logger/index.js';

const formatters = {
    expand,
    compress
}

const js = (js, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        logger.error(`jsFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](js);
}

export default js;