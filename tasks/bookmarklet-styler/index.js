#!/usr/bin/env node

const sass = require('sass');
const fs = require('fs');
const minimist = require('minimist');
const version = 'v1.0.0';

const argv = minimist(process.argv.slice(2), {
    alias: { 
        m: 'mode', 
        h: 'help',
        v: 'version' 
    },
    string: [ 'mode' ]
});

const help = () => {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    process.exit(0);
}

const die = (msg) => {
    console.error(msg);
    //process.exit(1);
}

if (argv.help) {
    help();
}

if (argv.version) {
    console.log(version);
    //process.exit(0);
}

let errorMsg;
let source;
let target;
let styles;

if(argv._.length !== 3) {
    help();
}


// enclose with {{}}, remove {{}} that might have been used in the -m option
argv.marker = `{{${argv.marker.replace(/^{+|}+$/g, '')}}}`;


/**
 * Check if the file is SASS or CSS
 * @param {String} fileName
 * @return bool 
 */
const isSass = fileName => {
    const extMatch = fileName.toLowerCase().match(/\.(sass|scss|css)$/);
    if(extMatch === null){
        console.error('Style sheets must have any of the extensions .css, .sass or .scss');
        process.exit(1);
    }
    return extMatch[1] !== 'css';
}

/**
 * Read the source and transform it to CSS if required
 * @param {String} fileName 
 * @return {String}
 */
const renderStyles = (fileName, outputStyle) => {  
    if(!isSass(fileName)) {
        return fs.readFileSync(program.style, 'utf8');
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


const applyStyle = () => {    
    const js = fs.readFileSync(source, 'utf8');
    const css = renderStyles(styles, argv.mode || 'nested');
    fs.writeFile(target, js.replace(argv.marker, css), err => {
        if (err) {
            die(err);
        }
    });
}

