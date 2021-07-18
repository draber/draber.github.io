import util from 'util';
import _ from 'lodash';

const logger = {
    color: {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        underscore: '\x1b[4m',
        blink: '\x1b[5m',
        reverse: '\x1b[7m',
        hidden: '\x1b[8m',
        fgBlack: '\x1b[30m',
        fgRed: '\x1b[31m',
        fgGreen: '\x1b[32m',
        fgYellow: '\x1b[33m',
        fgBlue: '\x1b[34m',
        fgMagenta: '\x1b[35m',
        fgCyan: '\x1b[36m',
        fgWhite: '\x1b[37m',
        bgBlack: '\x1b[40m',
        bgRed: '\x1b[41m',
        bgGreen: '\x1b[42m',
        bgYellow: '\x1b[43m',
        bgBlue: '\x1b[44m',
        bgMagenta: '\x1b[45m',
        bgCyan: '\x1b[46m',
        bgWhite: '\x1b[47m'
    },
    error: function (...msg) {
        return emit(this.color.fgRed, msg);
    },
    warning: function (...msg) {
        return emit(this.color.fgYellow, msg);
    },
    info: function (...msg) {
        return emit(this.color.fgBlue, msg);
    },
    success: function (...msg) {
        return emit(this.color.fgGreen, msg);
    },
    custom: function (color, ...msg) {
        return emit(color, msg);
    },
    log: function (...msg) {
        return emit(false, msg);
    }
}

const emit = (color, msg) => {
    color = color ? `${color}%s${logger.color.reset}` : false;
    msg.forEach(part => {
        if(_.isObject(part)) {
            console.log(util.inspect(part, false, null, true))
        }
        else if(color) {
            console.log(color, part);
        }
        else {
            console.log(part);
        }
    })
}


export default logger;