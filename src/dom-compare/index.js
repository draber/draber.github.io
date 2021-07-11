const browser = require('./browser');
const settings = require('../compiler/modules/settings.js');
const { DOMParser } = require('xmldom');
const date = require('date-and-time');
const {
    read,
    write
} = require('../compiler/modules/file.js');
const log = require('./modules/logger.js');

const data = {};


const compare = (async () => {
    const target = process.cwd() + '/src/dom-compare/storage/tmp/' + date.format(new Date(), 'YYYY-MM-DD-HH-mm-ss') + '.html'
    await browser.load(settings.get('targetUrl'), target)
    .then(() => {
        const doc = new DOMParser().parseFromString(read(target));
        const selector = '[src*="games-assets/v2/spelling-bee"],[link*="games-assets/v2/spelling-bee"]';
        doc.querySelectorAll(['src', 'link'].map(entry => `[${entry}*="${marker}"]`).join(',')).forEach(resource => {
            const matches = resource.match(/spelling-bee\.([^.]+)\.(.*)/);
            if(matches.length !== 3){
                log(`Unexpected format for "${resource}"`, 'error');                
            }
            data[matches[3]] = matches[2];
        })

        console.log(data)
    })

})();

module.exports = compare;