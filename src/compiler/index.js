#!/usr/bin/env node

const path = require('path');
const minimist = require('minimist');
const settings = require('./modules/settings.js');
const substituteVars = require('./modules/substituteVars.js');
const bookmarklify = require('./modules/bookmarklify.js');
const log = require('./modules/logger.js');
const errorHandler = require('./modules/errorHandler.js');
const {
    minify
} = require('terser');
const {
    read,
    write
} = require('./modules/file.js');
const chokidar = require('chokidar');
const sass = require('sass');

const args = minimist(process.argv.slice(2));

/**
 * Creates manifest code for extension
 * @returns {String}
 */
const getManifest = () => {
    const template = read(settings.get('extension.template'));
    settings.set('sbaFileName', path.basename(settings.get('js.compressed')));
    return substituteVars(template, settings);
}

/**
 * Creates HTML code for web site
 * @param path
 * @param jsPath
 * @returns {Promise<String>}
 */
const getHtml = async (path, jsPath) => {
    const template = read(path);
    const bookmarklet = await getBookmarklet(jsPath);
    settings.set('bookmarklet.code', bookmarklet);
    return substituteVars(template, settings);
}

/**
 * Convert SCSS to CSS
 * @param path
 * @returns {String}
 */
const getCss = path => {
    const buffer = sass.renderSync({file: path});
    return buffer.css;
}

/**
 * Creates bookmarklet code
 * @param path
 * @returns {Promise<string>}
 */
const getBookmarklet = async (path) => {
    const js = await getMinifiedJs(path);
    return bookmarklify(js);
}

/**
 * Creates minified JS
 * @param path
 * @returns {Promise<string>}
 */
const getMinifiedJs = async (path) => {
    let min = await minify(read(path), {
        mangle: true,
        ecma: 2020,
        compress: {
            arguments: true
        }
    });
    return min.code;
}

/**
 * Create one or more files
 * @param type
 */
const build = async (type) => {
    let config;
    switch (type) {
        case 'site':
            config = [{
                contents: await getHtml(settings.get('html.template'), settings.get('js.plain')),
                savePath: settings.get('html.output')
            }, {
                contents: getCss(settings.get('scss.site')),
                savePath: settings.get('css.site')
            }];
            break;
        case 'extension':
            config = [{
                contents: await getManifest(),
                savePath: settings.get('extension.output')
            }, {
                contents: await getMinifiedJs(settings.get('js.plain')),
                savePath: settings.get('extension.sba')
            }];
            break;
        case 'bookmarklet':
            const template = read(settings.get('bookmarklet.js.template'));
            write(settings.get('bookmarklet.js.plain'), substituteVars(template, settings));
            config = [{
                contents: await getHtml(settings.get('bookmarklet.html.template'), settings.get('bookmarklet.js.plain')),
                savePath: settings.get('bookmarklet.html.output')
            }];
    }
    if (config) {
        config.forEach(entry => {
            write(entry.savePath, entry.contents, `Created ${entry.savePath}`);
        })
    }
    else {
        errorHandler(new Error(`Unknown type ${type}`));
    }
}


/**
 * Watch for file changes
 * @param {String} type
 */
const watch = async (type) => {
    let config;
    switch (type) {
        case 'site':
            config = [
                'html.template',
                'js.plain',
                'scss.site'
            ];
            break;
        case 'extension':
            config = [
                'js.plain',
                'extension.template'
            ];
            break;
        case 'bookmarklet':
            config = [
                'js.plain',
                'bookmarklet.html.template',
                'bookmarklet.js.template'
            ];
    }
    config = config.map(entry => settings.get(entry));
    log(`Watching changes on \n\t- ${config.join('\n\t- ')}`, 'info');
    const watcher = chokidar.watch(config);
    watcher
        .on('change', path => {
            log(`Change detected on ${path}`, 'info');
            build(type);
        })
        .on('unlink', path => log(`File ${path} has been removed`));
}

/**
 * Watch (-w) or build (default)
 */
const compile = (async () => {
    if (!args.t) {
        log(`Usage:
compiler -t <type> [-w]
available types: site, extension, bookmarklet
  -w: watch instead of compiling`, 'info');
        process.exit();
    }

    if (args.w) {
        await watch(args.t);
    }
    else {
        await build(args.t);
    }
})();

module.exports = compile;