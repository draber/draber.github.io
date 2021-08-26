import expand from './expand.js';
import compress from './compress.js';
import compact from './compact.js';
import console from 'a-nicer-console';;

const formatters = {
    expand,
    compress,
    compact
}

const html = (html, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        console.error(`htmlFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](html);
}

export default html;