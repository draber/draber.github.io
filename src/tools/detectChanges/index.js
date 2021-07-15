import beautify from 'beautify';
import {
    load
} from './browser.js';
import date from 'date-and-time';
import {
    read,
    write
} from '../modules/file.js';
import format from './format.js';
import fs from 'fs';
import log from '../modules/logger.js';
import path from 'path';
import settings from '../modules/settings.js';
import url from 'url';
import validate from '../modules/validators/validate.js';
import {
    DOMParser
} from 'xmldom';
import minimist from 'minimist';


const args = minimist(process.argv.slice(2));
const debug = !!args.d;

const here = path.dirname(url.fileURLToPath(
    import.meta.url));
const storage = path.dirname(here) + '/storage';
const today = date.format(new Date(), 'YYYY-MM-DD');

const issues = {
    current: today,
    ref: 'reference'
}

const types = {
    clean: 'clean-site.html',
    data: 'data.json',
    report: 'report.md',
    styles: 'styles.css'
}

const domParseConf = {
    locator: {},
    errorHandler: {
        warning: w => {},
        error: e => {},
        fatalError: e => {
            log(e, 'error')
        }
    }
}

const domParse = string => {
    return new DOMParser(domParseConf).parseFromString(string);
}

const getAssetPath = (type, issue) => {
    return `${storage}/${issues[issue]}/${types[type]}`;
}



const evaluate = () => {
    let msg = format.heading('Report ' + today, 1);
    ['clean', 'styles', 'data'].forEach(type => {
        let current = read(getAssetPath(type, 'current'));
        let ref = read(getAssetPath(type, 'ref'));
        switch (type) {
            case 'data':
                const schema = read(`${here}/schema.json`);
                msg += format.heading('Data Schema Comparison', 2) +
                    format.fromValidation(validate.jsonSchema(JSON.parse(current), JSON.parse(schema)));
                break;
            case 'styles':
                msg += format.heading('Styles', 2) +
                    format.fromValidation(validate.cssEquality(beautify(ref, {
                        format: 'css'
                    }), beautify(current, {
                        format: 'css'
                    })));
                break;
            case 'clean':
                msg += format.heading('Dom Comparison', 2) +
                    format.fromValidation(validate.domEquality(domParse(ref), domParse(current)));
                break;
        }
    });
    write(getAssetPath('report', 'current'), msg);
}


const detectChanges = (async () => {

    const paths = {
        clean: getAssetPath('clean', 'current'),
        data: getAssetPath('data', 'current'),
        styles: getAssetPath('styles', 'current')
    }

    let dumpExists = true;  
    Object.values(paths).forEach(path => {
        if(!fs.existsSync(path)){
            dumpExists = false;
        }
    })


    if (debug || !dumpExists) {
        const dir = path.dirname(paths.clean);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        await load(settings.get('targetUrl'), paths)
            .then(() => {
                evaluate();
                process.exit();
            })
    } else {
        evaluate();
        process.exit();
    }

})();

export default detectChanges;