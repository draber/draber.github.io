#!/usr/bin/env node

const minimist = require('minimist');
const fs = require('fs');
const pugsass = require('../pugsass');
const package = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const argv = minimist(process.argv.slice(2), {
    alias: { 
        s: 'style',
        h: 'help',
        v: 'version' 
    },
    default: { 
        style: 'nested'
    },
    string: [ 'style' ]
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
pugsass(argv._[0], argv._[1], argv.style);
