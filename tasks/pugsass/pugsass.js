#!/usr/bin/env node

const sass = require('sass');
const fs = require('fs');

/**
 * Convert the bookmarklet console version to a PUG link
 * 
 * @param {String} source 
 * @param {String} target
 * @param {String} outputStyle 
 */
const convert = (source, target, outputStyle) => {
    const result = sass.renderSync(
        {
            file: source,
            omitSourceMapUrl: true,
            outputStyle: outputStyle
        }
    );
    const pug = `style() ${result.css.toString()}`;
    fs.writeFile(target, pug, err => {
        if (err) {
            console.error(err);
        }
    });
};

module.exports = convert;
