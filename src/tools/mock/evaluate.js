import date from 'date-and-time';
import msgFormat from './msgFormatter.js';
import fs from 'fs-extra';
import logger from '../modules/logger/logger.js';
import path from 'path';
import validate from '../modules/validators/validate.js';
import _ from 'lodash';
import {
    paths
} from './common.js';
import recursive from 'recursive-readdir';
import settings from '../modules/settings/settings.js';

const today = date.format(new Date(), 'YYYY-MM-DD');

const listFiles = async () => {
    const reference = await recursive(paths.reference.base);
    const current = await recursive(paths.current.base);
    const files = {};
    for (let [type, listing] of Object.entries({
            reference,
            current
        })) {
        files[type] = files[type] || {};
        listing.forEach(file => {
            const matches = path.basename(file).match(/(?<name>[^\.]+)\.(?<ext>[\w]+)$/);
            files[type][matches.groups.ext] = files[type][matches.groups.ext] || {};
            files[type][matches.groups.ext][matches.groups.name] = file;
        })
    }
    return files;
}

const evaluate = async () => {
    let msg = msgFormat.heading('Report ' + today, 1);
    let result;
    let hasResult = false;

    const files = await listFiles();
    const ignoreKeys = ['polyfills', 'react-bundle', 'foundation', 'foundation-game'];
    const ignoreExt = ['md', 'svg', 'woff2', 'js']
    for (let [ext, listing] of Object.entries(files.current)) {
        if (ignoreExt.includes(ext)) {
            continue;
        }
        for (let [key, file] of Object.entries(listing)) {
            const title = path.basename(files.current[ext][key]);
            if (ignoreKeys.includes(key)) {
                continue;
            }
            const pair = {
                current: file,
                reference: files.reference[ext] ? files.reference[ext][key] : undefined
            }
            if (!pair.current || !pair.reference) {
                logger.error(`Incomplete pair`, pair);
                continue;
            }
            switch (ext) {
                case 'json':
                    if (key === 'game-data') {
                        result = validate.jsonSchema(
                            fs.readJsonSync(pair.current),
                            fs.readJsonSync(settings.get('mock.schema'))
                        );
                        msg += msgFormat.heading(title, 2);
                    }
                    else {
                        result = validate.objectEquality(
                            JSON.parse(fs.readFileSync(pair.reference, 'utf8')),
                            JSON.parse(fs.readFileSync(pair.current, 'utf8'))
                        );
                        msg += msgFormat.heading(title, 2);
                    }
                    break;
                case 'html':
                    result = await validate.htmlEquality(
                        fs.readFileSync(pair.reference, 'utf8'),
                        fs.readFileSync(pair.current, 'utf8')
                    );
                    msg += msgFormat.heading(title, 2);
                    break;
                case 'css':
                    result = validate.cssEquality(
                        fs.readFileSync(pair.reference, 'utf8'),
                        fs.readFileSync(pair.current, 'utf8')
                    );
                    msg += msgFormat.heading(title, 2);
                    break;
                default:
                    continue;
            }
            msg += msgFormat.fromValidation(result);
            if (!_.isEmpty(result)) {
                hasResult = true;
            }

        }
    }


    if (hasResult) {
        logger.warning(`Spelling Bee from ${today} is different from the reference version`);
    } else {
        logger.success(`Spelling Bee from ${today} is equal to the reference version`);
    }
    fs.outputFileSync(paths.current.report, msg);
}

export default evaluate;