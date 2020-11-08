#!/usr/bin/env node

const bookmarklet = require('bookmarklet');
const fs = require('fs');

/**
 * Convert the bookmarklet console version to a PUG link
 * 
 * @param {String} source 
 * @param {String} target 
 * @param {String} title 
 * @param {String} label 
 */
const convert = (source, target, title, label) => {
    const js = fs.readFileSync(source, 'utf8');
    const bm = bookmarklet.convert(js, {
        style: false,
        script: false
    });
    const pug = `a.bookmarklet(href="${bm}" title='${title}') ${label}`;
    fs.writeFile(target, pug, error => {
        if (error) {
            console.error(error);
        }
    });
};

module.exports = convert;
