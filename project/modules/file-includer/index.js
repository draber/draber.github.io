#!/usr/bin/env node

const fs = require('fs');
const dataUri = require('datauri/sync');
const isImage = require('is-image');

/**
 * Include files recursively in another file (max depth: 1)
 * 
 * @param {String} source 
 * @param {Integer} counter 
 */
const resolveIncludes = (source, counter = 0) => {
    // avoid endless recursion 
    if (counter > 3) {
        console.error(`Too much recursion in ${source}`);
        process.exit(3);
    }
    let contents = fs.readFileSync(source, 'utf8');
    [...contents.matchAll(/{{include\(([^}]+)\)}}/g)].forEach(record => {
        try {
            // include images as data URI
            const replacement = isImage(record[1])
                ? dataUri(record[1]).content
                : resolveIncludes(record[1], counter + 1);
            contents = contents.replace(record[0], replacement);
        }
        catch (error) {
            console.error(error.message);
        }
    });
    return contents;
}

module.exports = resolveIncludes;
