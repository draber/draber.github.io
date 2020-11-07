var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
    alias: { m: 'mode', h: 'help' },
    string: [ 'mode' ]
});

console.log(argv._)