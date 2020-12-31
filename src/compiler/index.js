#!/usr/bin/env node

const fs = require('fs');
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
const sass = require('sass');
const {
    Console
} = require('console');

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
    const buffer = sass.renderSync({
        file: path
    });
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
 * Get a collection of files needed for a certain compilation
 * @param {String} type 
 */
const getFileKeys = type => {
    const types = {
        site: [
            'html.template',
            'scss.site',
            'scss.colors'
        ],
        extension: [
            'extension.template',
            'js.plain'
        ],
        bookmarklet: [
            'bookmarklet.html.template',
            'js.plain',
            'bookmarklet.js.template'
        ]
    }
    if (!types[type]) {
        errorHandler(new Error(`Unknown type ${type}`));
    }
    return types[type];
}

/**
 * Compilations that follow a change of a certain file
 * @param fileKey the key of the the file in config.json
 */
const buildPartial = async (fileKey) => {
    let contents;
    let tasks;
    switch (fileKey) {
        case 'bookmarklet.html.template':
            tasks = [{
                contents: await getHtml(settings.get('bookmarklet.html.template'), settings.get('bookmarklet.js.plain')),
                savePath: settings.get('bookmarklet.html.output')
            }];
            break;
        case 'bookmarklet.js.template':
            tasks = [{
                contents: substituteVars(read(settings.get('bookmarklet.js.template')), settings),
                savePath: settings.get('bookmarklet.js.plain')
            }];
            break;
        case 'extension.template':
            tasks = [{
                contents: await getManifest(),
                savePath: settings.get('extension.output')
            }];
            break;
        case 'html.template':
            tasks = [{
                contents: await getHtml(settings.get('html.template'), settings.get('bookmarklet.js.plain')),
                savePath: settings.get('html.output')
            }];
            break;
        case 'js.plain':
            contents = await getMinifiedJs(settings.get('js.plain'));
            tasks = [{
                contents,
                savePath: settings.get('extension.sba')
            }, {
                contents,
                savePath: settings.get('bookmarklet.cdn.local')
            }];
            break;
        case 'scss.colors':
        case 'scss.site':
            tasks = [{
                contents: getCss(settings.get('scss.site')),
                savePath: settings.get('css.site')
            }];
    }
    tasks.forEach(entry => {
        write(entry.savePath, entry.contents, `Created ${entry.savePath}`);
    });
}

/**
 * Create one or more files
 * @param type
 */
const build = async (type) => {
    getFileKeys(type).forEach(fileKey => {
        buildPartial(fileKey);
    })
    log(`Created files for task "${type}"`, 'info');
}


/**
 * Watch for file changes
 * @param {String} type
 */
const watch = async (type) => {
    const fileKeys = getFileKeys(type);
    const files = [];
    await build(type);
    fileKeys.forEach(fileKey => {
        const file = settings.get(fileKey);
        files.push(file)
        fs.watchFile(file, () => {
            log(`Change detected on ${file}`, 'info');
            buildPartial(fileKey);
        });
    })
    log(`Watching changes on \n\t- ${files.join('\n\t- ')}`, 'info');
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
    } else {
        await build(args.t);
    }
})();

module.exports = compile;