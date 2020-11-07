#!/usr/bin/env node

const sass = require('sass');
const {Command} = require('commander');
const fs = require('fs');

const program = new Command();

program
    .version('v1.0.0')
    .description('Converts SASS to CSS and wraps it in a pug <style> element')
    .arguments('<source> <target>')
    .on('--help', function () {
        console.log('');
        console.log('Example: pugsass scss/style.scss pug/style.pug');
    })
    .action((source, target) => {
        const result = sass.renderSync(
            {
                file: source,
                omitSourceMapUrl: true,
                outputStyle: 'compressed'
            }
        );
        const pug = `style() ${result.css.toString()}`;
        fs.writeFile(target, pug, err => {
            if (err) {
                console.error(err);
            }
        });
    })
    .parse(process.argv);
    