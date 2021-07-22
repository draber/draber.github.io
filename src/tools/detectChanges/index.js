import {
    load
} from './browser.js';
import date from 'date-and-time';
import format from './format.js';
import fs from 'fs-extra';
import logger from '../modules/logger/logger.js';
import path from 'path';
import settings from '../modules/settings.js';
import url from 'url';
import validate from '../modules/validators/validate.js';
import {
    DOMParser
} from 'xmldom';
import _ from 'lodash';
import mockData from '../mock/data.js';
import fetch from 'node-fetch';


const here = path.dirname(url.fileURLToPath(
    import.meta.url));
const storage = path.dirname(here) + '/storage';
const today = date.format(new Date(), 'YYYY-MM-DD');

const types = {
    html: 'site.html',
    gameData: 'game-data.json',
    resources: 'resources.json',
    report: 'report.md',
    styles: 'styles.css',
    assets: 'games-assets/v2/'
}

const domParse = string => {
    return new DOMParser({
        locator: {},
        errorHandler: {
            warning: w => {},
            error: e => {},
            fatalError: e => {
                logger.error(e)
            }
        }
    }).parseFromString(string);
}

const getAssetPath = (type, issue) => {
    return `${storage}/${issue}/${types[type]}`;
}

const getReadFn = type => {
    return (types[type].endsWith('json') ? 'readJson' : 'readFile') + 'Sync';
}

const evaluate = () => {
    let msg = format.heading('Report ' + today, 1);
    let result;
    let hasResult = false;

    ['html', 'styles', 'gameData'].forEach(type => {
        let current = fs[getReadFn(type)](getAssetPath(type, 'current'), {
            encoding: 'utf8'
        });
        let ref = fs[getReadFn(type)](getAssetPath(type, 'reference'), {
            encoding: 'utf8'
        });
        switch (type) {
            case 'gameData':
                const schema = fs.readJsonSync(`${here}/schema.json`);
                result = validate.jsonSchema(current, schema);
                msg += format.heading('Data Schema Comparison', 2);
                break;
            case 'styles':
                result = validate.cssEquality(ref.split('\n'), current.split('\n'));
                msg += format.heading('Styles', 2);
                break;
            case 'html':
                result = validate.domEquality(domParse(ref), domParse(current));
                msg += format.heading('Dom Comparison', 2);
                break;
        }
        if (!_.isEmpty(result)) {
            hasResult = true;
        }
        msg += format.fromValidation(result);
    });


    if (hasResult) {
        logger.warning(`Spelling Bee from ${today} is different from the reference version`);
    } else {
        logger.success(`Spelling Bee from ${today} is equal to the reference version`);
    }
    fs.outputFileSync(getAssetPath('report', 'current'), msg);
}


const detectChanges = (async () => {

    const paths = {
        html: getAssetPath('html', 'current'),
        gameData: getAssetPath('gameData', 'current'),
        styles: getAssetPath('styles', 'current'),
        resources: getAssetPath('resources', 'current')
    }

    await load(settings.get('targetUrl'), {
            title: settings.get('label') + ' QA - Mock',
            mockData,
            paths
        })
        .then(data => {
            //logger.log(data.resources)

            evaluate();
            process.exit();
        })

})();

export default detectChanges;