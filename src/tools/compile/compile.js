import minimist from 'minimist';
import fs from 'fs-extra';
import settings from '../modules/settings/settings.js';
import logger from '../modules/logger/logger.js';
import bundler from '../modules/bundler/bundler.js';
import minifyJs from '../modules/minify-js/minify-js.js';
import buildHtml from '../modules/tpl-to-html/tpl-to-html.js';
import bookmarklify from '../modules/bookmarklet/bookmarklet.js';
import convertScss from '../modules/convert-scss/convert-scss.js';
import path from 'path';
import substituteVars from '../modules/substitute-vars/substitute-vars.js';
import format from '../modules/formatters/format.js';
import getWatchDirs from './watch-list.js';
import _ from 'lodash';

const args = minimist(process.argv.slice(2));

let debug = !!args.d;

/**
 * Save a file
 * @param {String} path 
 * @param {String} data 
 */
const save = (path, data) => {
    fs.outputFile(path, data)
        .then(() => {
            logger.success(`Created ${path}`)
        })
        .catch(err => {
            logger.error(err)
        })
}

/**
 * Build extension in all flavors
 * @param {String} appCode 
 * @param {String} minAppCode 
 */
const buildExtensions = (appCode, minAppCode) => {
    const files = {
        manifest: settings.get('extension.templates.manifest'),
        content: settings.get('extension.templates.content'),
        readme: settings.get('extension.templates.readme')
    }
    const data = {
        manifest: fs.readJsonSync(files.manifest),
        content: fs.readFileSync(files.content, 'utf8'),
        readme: fs.readFileSync(files.readme, 'utf8')
    }
    for (const [store, options] of Object.entries(settings.get('extension.stores'))) {
        const dir = `${settings.get('extension.output')}/${store}`;
        settings.set('sbaFileName', settings.get(debug || options.enforce_unminified ? 'extension.sba' : 'extension.sba-min'));
        const manifest = substituteVars(JSON.stringify({
            ...data.manifest,
            ...options.manifest
        }));
        save(`${dir}/${path.basename(files.manifest)}`, format('json', manifest, 'expand'));
        save(`${dir}/${path.basename(files.content)}`, substituteVars(data.content));
        save(`${dir}/${path.basename(files.readme)}`, substituteVars(data.readme));
        save(`${dir}/${settings.get('extension.sba')}`, appCode);
        save(`${dir}/${settings.get('extension.sba-min')}`, minAppCode);
        fs.copySync(settings.get('extension.assets'), dir + '/assets');
    }
}

const targets = {
    site: () => {
        const template = fs.readFileSync(settings.get('html.template'), 'utf8');
        const bookmarklet = fs.readFileSync(settings.get('bookmarklet.template'), 'utf8');
        settings.set('bookmarklet.code', bookmarklify(format('js', substituteVars(bookmarklet), 'compress')));
        save(settings.get('html.output'), buildHtml(template));
        save(settings.get('css.site'), convertScss({
            file: settings.get('scss.site')
        }));
    },
    app: async () => {
        save(settings.get('css.app'), convertScss({
            file: settings.get('scss.app')
        }));
        const appCode = await bundler.build();
        const minAppCode = await minifyJs(appCode);

        // bookmarklet and plain
        save(settings.get('js.plain'), appCode);
        save(settings.get('bookmarklet.local'), minAppCode);

        // extensions
        buildExtensions(appCode, minAppCode);
    }
}


/**
 * Watch for file changes
 * @param {String} type
 */
const watch = () => {
    const dirs = getWatchDirs(args.t);
    targets[args.t]();
    dirs.forEach(dir => {
        fs.watch(dir, 'utf8', (eventType, fileName) => {
            //_.debounce(() => {
                logger.log(`Change detected on ${fileName}`);
                targets[args.t]();
           // }, 200)
        });
    })
    logger.info(`Watching changes on \n - ${dirs.join('\n - ')}`)
}

/**
 * Watch (-w) or build (default)
 */
const compile = () => {
    if (!args.t) {
        logger.error('Missing parameter -t');
        process.exit(-1);
    } else if (!Object.keys(targets).includes(args.t)) {
        logger.error(`compile: unknown type "${args.t}"`);
        process.exit(-1);
    }

    if (args.w) {
        watch();
    } else {
        targets[args.t]();
    }

};

export default compile();