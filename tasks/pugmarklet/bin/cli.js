#!/usr/bin/env node

const minimist = require('minimist');
const fs = require('fs');
const pugmarklet = require('../pugmarklet');
const package = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const argv = minimist(process.argv.slice(2), {
    alias: { 
        l: 'label', 
        t: 'title',
        h: 'help',
        v: 'version' 
    },
    default: { 
        label: 'this link',
        marker: 'Hold the mouse key down and drag this into your bookmark menu'
    },
    string: [ 'label', 'title' ]
});

// ensure argv._ is unique to avoid overwriting an input file
argv._ = Array.from(new Set(argv._));

// called with -v|--version
if (argv.version) {
    console.log(package.version);
    process.exit(0);
}

// called with -h|--help or without arguments
if(argv._.length !== 2 || argv.help) {        
    const usage = fs.readFileSync('../usage.txt', 'utf8');
    console.log(`${package.name} ${package.version}\n\n${package.description}\n\n${usage}`);
    process.exit(0);
}

// default behavior
pugmarklet(argv._[0], argv._[1], argv.label, argv.title);
