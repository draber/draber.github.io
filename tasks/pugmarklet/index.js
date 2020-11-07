#!/usr/bin/env node

const bookmarklet = require('bookmarklet');
const {Command} = require('commander');
const fs = require('fs');

const program = new Command();

program
    .version('v1.0.0')
    .description('Convert JavaScript code to a Pug snippet with a bookmarklet link')
    .arguments('<source> <target>')
    .option('-l, --label <type>', 'Label', 'this link')
    .option('-t, --title <type>', 'Title', 'Hold the mouse key down and drag this into your bookmark menu')
    .on('--help', function () {
        console.log('');
        console.log('Example: pugmarklet js/source.js pug/bookmarklet.pug -l "My Bookmarklet"');
    })
    .action((source, target) => {
        const js = fs.readFileSync(source, 'utf8');
        const bm = bookmarklet.convert(js, {
            style: false,
            script: false
        });
        const pug = `a.bookmarklet(href="${bm}" title='${program.title}') ${program.label}`;
        fs.writeFile(target, pug, err => {
            if (err) {
                console.error(err);
            }
        });
    })
    .parse(process.argv);
