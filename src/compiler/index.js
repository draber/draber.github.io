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
const cssUtils = require('./modules/cssUtils.js');

const args = minimist(process.argv.slice(2));


/**
 * Creates manifest code for extension
 * @returns {String}
 */
const getExtTemplate = template => {
    const contents = read(settings.get(template));
    settings.set('sbaFileName', path.basename(settings.get('extension.sba-min')));
    return substituteVars(contents, settings);
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
    let css = sass.renderSync({
        file: path,
        outputStyle: 'compressed'
    }).css.toString();
    css = cssUtils.handleCustomProps(css, {
        prefix: settings.get('prefix')
    });
    css = cssUtils.removeBom(css);
    css = substituteVars(css, settings);
    return css;
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
 * @param {String|Array} type
 */
const getFileKeys = type => {
    const types = {
        appcss: [
            'scss.widget'
        ],
        site: [
            'html.template',
            'scss.site',
            'scss.colors',
            'js.plain'
        ],
        extension: [
            'extension.manifest.template',
            'js.plain'
        ],
        bookmarklet: [
            'bookmarklet.html.template',
            'js.plain',
            'bookmarklet.js.template'
        ]
    }
    if (type === '*') {
        return types;
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
        case 'scss.widget':
            tasks = [{
                contents: getCss(settings.get('scss.widget')),
                savePath: settings.get('css.widget')
            }];
            break;
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
        case 'extension.manifest.template':
            tasks = [{
                contents: await getExtTemplate('extension.manifest.template'),
                savePath: settings.get('extension.manifest.output')
            }];
            break;
        case 'html.template':
            tasks = [{
                contents: substituteVars(read(settings.get('bookmarklet.js.template')), settings),
                savePath: settings.get('bookmarklet.js.plain')
            }, {
                contents: await getHtml(settings.get('html.template'), settings.get('bookmarklet.js.plain')),
                savePath: settings.get('html.output')
            }];
            break;
        case 'js.plain':
            contents = await getMinifiedJs(settings.get('js.plain'));
            tasks = [{
                contents,
                savePath: settings.get('extension.sba-min')
            }, {
                contents,
                savePath: settings.get('bookmarklet.cdn.local')
            }, {
                contents: read(settings.get('js.plain')),
                savePath: settings.get('extension.sba')
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
    log(`Watching changes on \n - ${files.join('\n - ')}`, 'info');
}

/**
 * Watch (-w) or build (default)
 */
const compile = (async () => {
    if (!args.t) {
        const keys = Object.keys(getFileKeys('*'));
        log(`Usage:
compiler -t <type> [<options>]
types: \n  ${keys.join('\n  ')}
options:
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