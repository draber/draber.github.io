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
import logger from '../modules/logger/logger.js';
import path from 'path';
import settings from '../modules/settings.js';
import url from 'url';
import validate from '../modules/validators/validate.js';
import {
    DOMParser
} from 'xmldom';
import minimist from 'minimist';
import _ from 'lodash';



const args = minimist(process.argv.slice(2));
const debug = !!args.d;

const here = path.dirname(url.fileURLToPath(
    import.meta.url));
const storage = path.dirname(here) + '/storage';
const today = date.format(new Date(), 'YYYY-MM-DD');

const issues = {
    current: 'daily/' + today,
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
            logger.error(e)
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
    let result;
    let hasResult = false;

    ['clean', 'styles', 'data'].forEach(type => {
        let current = read(getAssetPath(type, 'current'));
        let ref = read(getAssetPath(type, 'ref'));
        switch (type) {
            case 'data':
                const schema = read(`${here}/schema.json`);
                result = validate.jsonSchema(JSON.parse(current), JSON.parse(schema));
                msg += format.heading('Data Schema Comparison', 2);
                break;
            case 'styles':
                result = validate.cssEquality(ref.split('\n'), current.split('\n'));
                msg += format.heading('Styles', 2);
                break;
            case 'clean':
                result = validate.domEquality(domParse(ref), domParse(current));
                msg += format.heading('Dom Comparison', 2);
                break;
        }
        if(!_.isEmpty(result)) {
            hasResult = true;
        }
        msg += format.fromValidation(result);
    });   


    if (hasResult) {  
        logger.warning(`Spelling Bee from ${today} is different from the reference version`);
    }
    else {
        logger.success(`Spelling Bee from ${today} is equal to the reference version`);
    }
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
        if (!fs.existsSync(path)) {
            dumpExists = false;
        }
    })

    if (debug || !dumpExists) {
        const dir = path.dirname(paths.clean);
        if (!fs.existsSync(dir)) {
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