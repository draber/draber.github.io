import load from './browser.js';
import {
    paths
} from './common.js';
import settings from '../settings.js';
import finalize from '../finalize/index.js'
import mockData from './data.js';
import logger from '../logger/index.js';
import fs from 'fs-extra';

const create = async type => {

    return await load(settings.get('targetUrl'), {
            title: settings.get('label') + ' QA - Mock',
            mockData
        })
        .then(data => {
            for (let [key, entries] of Object.entries(data)) {
                entries = entries.map(entry => {
                    entry.local = paths[type].base + '/' + entry.rel;
                    return entry;
                })
            }
            fs.copySync(settings.get('mock.resources'), paths[type].assets)
            finalize(data);
            logger.success(`Finished creating ${type}`);
            process.exit();
        })
        .catch(e => {
            logger.error(`Failed creating ${type}`);
            process.exit();
        })

}

export default create;