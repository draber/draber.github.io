import expand from './expand.js';
import compress from './compress.js';
import logger from '../../logger/logger.js';

const formatters = {
    expand,
    compress
}

const json = (json, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        logger.error(`jsonFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](json);
}

export default json;