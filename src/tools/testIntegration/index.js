import {
    load
} from './browser.js';
import date from 'date-and-time';
import fs from 'fs';
import logger from '../modules/logger/logger.js';
import path from 'path';
import settings from '../modules/settings.js';
import url from 'url';
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

const getAssetPath = (type, issue) => {
    return `${storage}/${issues[issue]}/${types[type]}`;
}

const testIntegration = (async () => {

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

export default testIntegration;