#!/usr/bin/env node

const fs = require('fs');
const DatauriParser = require('datauri/parser');
const isImage = require('is-image');

/**
 * Get the normalized form of an image extension
 * 
 * @param {String} path // or file name
 */
const getNormalisedImageExtension = path => {
    const extension = path.substring(path.lastIndexOf('.') + 1);
    return ['.jpg','.jpeg','.jpe','.jfif','.jif'].includes(extension) ? '.jpeg' : extension;
}

/**
 * Include files recursively in another file (max depth: 1)
 * 
 * @param {String} contents 
 * @param {Integer} counter 
 */
const resolveIncludes = (contents, counter = 0) => {
    // avoid endless recursion 
    if (counter > 3) {
        console.error(`Too much recursion in ${source}`);
        process.exit(3);
    }
    [...contents.matchAll(/{{include\(([^}]+)\)}}/g)].forEach(record => {
        try {
            const include = fs.readFileSync(record[1], 'utf8');
            let replacement;
            // include images as data URI
            if(isImage(record[1])) {
                const parser = new DatauriParser();                
                replacement = parser.format(getNormalisedImageExtension(record[1]), include).content;
            }
            else {
                replacement = resolveIncludes(include, counter + 1);
            }
            contents = contents.replace(record[0], replacement);
        }
        catch (error) {
            console.error(error.message);
        }
    });
    return contents;
}

module.exports = resolveIncludes;
