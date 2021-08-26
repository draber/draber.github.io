import compact from './compact.js';
import expand from './expand.js';
import compress from './compress.js';
import console from 'a-nicer-console';

const formatters = {
    compact,
    expand,
    compress
}

const css = (css, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        console.error(`cssFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](css);
}

export default css;