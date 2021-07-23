import date from 'date-and-time';
import msgFormat from './msgFormatter.js';
import fs from 'fs-extra';
import logger from '../logger/index.js';
import path from 'path';
import validate from '../validators/validate.js';
import _ from 'lodash';
import {
    paths
} from './common.js';
import recursive from 'recursive-readdir';
import settings from '../settings.js';

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
            const matches = path.basename(file).match(/(?<name>[^\.]+)\.(?<ext>[a-z]+)$/);
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
    for (let [type, listing] of Object.entries(files.current)) {
        for (let [key, file] of Object.entries(listing)) {
            const pair = {
                current: file,
                reference: files.reference[type][key]
            }
            if(!pair.current || !pair.reference) {
                logger.error(`Incomplete pair`);
                continue;
            }
            switch (type) {
                // case 'js':
                //     break;
                // case 'json':
                //     if (key === 'game-data') {
                //         const schema = fs.readJsonSync(settings.get('mock.schema'));
                //         result = validate.jsonSchema(pair.current, schema);
                //         msg += msgFormat.heading(key, 2);
                //     }
                //     break;
                // case 'html':
                //     result = validate.domEquality(pair.reference, pair.current);
                //     msg += msgFormat.heading(key, 2);
                //     break;
                case 'css':
                    result = validate.cssEquality(pair.reference, pair.current);
                    msg += msgFormat.heading(key, 2);
                    msg += msgFormat.fromValidation(result);
                    break;
                default:
                    continue;
            }

        }
        
        if (!_.isEmpty(result)) {
            hasResult = true;
        }
    }


    if (hasResult) {
        logger.warning(`Spelling Bee from ${today} is different from the reference version`);
    } else {
        logger.success(`Spelling Bee from ${today} is equal to the reference version`);
    }
    fs.outputFileSync(paths.current.report, msg);
}

export default evaluate();