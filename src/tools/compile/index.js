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
import expand from '../modules/formatters/json/expand.js';

const args = minimist(process.argv.slice(2));

let debug = !!args.d;

const appCode = await bundler.build();
const minAppCode = await minifyJs(appCode);

const save = (path, data) => {
    fs.outputFile(path, data)
        .then(() => {
            logger.success(`Created ${path}`)
        })
        .catch(err => {
            logger.error(err)
        })
}

const buildBookmarklet = () => {
    save(settings.get('bookmarklet.local'), minAppCode);
}

const buildWebsite = () => {
    const template = fs.readFileSync(settings.get('html.template'), 'utf8');
    settings.set('bookmarklet.code', bookmarklify(fs.readFileSync(settings.get('bookmarklet.template'))));
    save(settings.get('html.output'), buildHtml(template));
    save(settings.get('css.site'), convertScss({
        file: settings.get('scss.site')
    }));
}

const buildExtensions = () => {
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
        settings.set('sbaFileName', settings.get(debug ? 'extension.sba' : 'extension.sba-min'));
        const manifest = {
            ...data.manifest,
            ...options.manifest
        };
        save(`${dir}/${path.basename(files.manifest)}`, expand(substituteVars(JSON.stringify(manifest))));
        save(`${dir}/${path.basename(files.content)}`, substituteVars(data.content));
        save(`${dir}/${path.basename(files.readme)}`, substituteVars(data.readme));
        save(`${dir}/${settings.get('extension.sba')}`, appCode);
        save(`${dir}/${settings.get('extension.sba-min')}`, minAppCode);
        fs.copySync(settings.get('extension.assets'), dir + '/assets');
    }
}


export default buildExtensions();