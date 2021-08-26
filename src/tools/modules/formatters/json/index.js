import expand from './expand.js';
import compress from './compress.js';
import console from 'a-nicer-console';;

const formatters = {
    expand,
    compress
}

const json = (json, format) => {
    if (!formatters[format] || !(formatters[format] instanceof Function)) {
        console.error(`jsonFormat: Unknown format ${format}`);
        return false;
    }
    return formatters[format](json);
}

export default json;