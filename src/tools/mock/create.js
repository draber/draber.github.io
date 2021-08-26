import load from './browser.js';
import {
    paths
} from './common.js';
import settings from '../modules/settings/settings.js';
import finalize from '../modules/finalize/finalize.js'
import console from 'a-nicer-console';;
import fs from 'fs-extra';

const create = async type => {

    return await load(settings.get('targetUrl'), {
            title: settings.get('label') + ' QA - Mock'
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
            console.success(`Finished creating ${type}`);
            process.exit();
        })
        .catch(e => {
            console.error(`Failed creating ${type}`);
            process.exit();
        })

}

export default create;