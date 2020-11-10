#!/usr/bin/env node

const fs = require('fs');
const bookmarklet = require('bookmarklet');
const compare = require('node-version-compare');
const fileIncluder = require('file-includer');

const sourceJs = __dirname + '/../../js/source.js';
const consoleJs = __dirname + '/../../js/console.js';
const bookmarkletHref = __dirname + '/../../bookmarklet/bookmarklet.href';
const indexTpl = __dirname + '/../../html/index.tpl';
const indexHtml = __dirname + '/../../../index.html';
const packageJson = __dirname + '/../../../package.json';
const versionTxt = __dirname + '/../../version.txt';

/**
 * Write version to a text file
 */
const buildVersionTxt = () => {
	const packageVersion = JSON.parse(fs.readFileSync(packageJson, 'utf8')).version;
	const oldVersion = fs.existsSync(versionTxt) ? fs.readFileSync(versionTxt, 'utf8') : '0';
	if(compare(packageVersion, oldVersion) !== 0) {
		fs.writeFile(versionTxt, packageVersion, error => {
		    if (error) {
		        console.error(error);
		        process.exit(1);
		    }
		});
	}
}

/**
 * Build index page
 */
const buildIndexHtml = () => {
    buildVersionTxt();
    fs.writeFile(indexHtml, fileIncluder(indexTpl), error => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
    }); 
};

/**
 * Build bookmarklet
 */
const buildBookmarkletHref = () => {
    const js = fs.readFileSync(consoleJs, 'utf8');
    const bm = bookmarklet.convert(js, {
        style: false,
        script: false
    });
    fs.writeFile(bookmarkletHref, bm, error => {
        if (error) {
            console.error(error);
        }
    });
};

/**
 * Build console version
 */
const buildConsoleJs = () => {
    buildVersionTxt();
    fs.writeFile(consoleJs, fileIncluder(sourceJs), error => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
    }); 
};


exports.console = buildConsoleJs;
exports.index = buildIndexHtml;
exports.bookmarklet = buildBookmarkletHref;
