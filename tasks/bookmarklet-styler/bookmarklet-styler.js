#!/usr/bin/env node

const sass = require('sass');
const fs = require('fs');

/**
 * Check if the file is SASS or CSS
 * 
 * @param {String} stylesheet
 * @return bool 
 */
const isSass = stylesheet => {
    const extMatch = stylesheet.toLowerCase().match(/\.(sass|scss|css)$/);
    if(extMatch === null){
        console.error('Style sheets must have any of the extensions .css, .sass or .scss');
        process.exit(1);
    }
    return extMatch[1] !== 'css';
}

/**
 * Read the source and transform it to CSS if required
 * 
 * @param {String} fileName 
 * @return {String}
 */
const renderStyles = (fileName, outputStyle) => {  
    if(!isSass(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    }
    const result = sass.renderSync(
        {
            file: fileName,
            omitSourceMapUrl: true,
            outputStyle: outputStyle
        }
    );
    return result.css.toString();
}

/**
 * Add the styles to a copy of the JavaScript file
 * 
 * @param {String} source 
 * @param {String} stylesheet 
 * @param {String} target 
 * @param {String} marker 
 * @param {String} outputStyle 
 */
const convert = (source, stylesheet, target, marker, outputStyle) => {    
    const js = fs.readFileSync(source, 'utf8');
    const css = renderStyles(stylesheet, outputStyle);
    fs.writeFile(target, js.replace(`{{${marker}}}`, css), error => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
    });
}

module.exports = convert;
