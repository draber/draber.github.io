import {
    load
} from './browser.js';
import fs from 'fs';
import settings from '../modules/settings.js';
import HTMLParser from 'node-html-parser';
import date from 'date-and-time';
import {
    append,
    read,
    write
} from '../modules/file.js';
import log from '../modules/logger.js';
import beautify from 'beautify';
import * as cmp from 'dom-compare';
//     compare,
//     GroupingReporter as reporter
// } from 

import {
    DOMParser
} from 'xmldom';



// tmp
const compare = cmp.default.compare;
const reporter = cmp.default.GroupingReporter;

const path = process.cwd() + '/src/tools/storage';

const issues = {
    current: date.format(new Date(), 'YYYY-MM-DD-HH') + '-00',
    ref: 'reference'
}

const types = {
    full: 'full-site.html',
    clean: 'clean-site.html',
    tokens: 'tokens.json',
    data: 'data.json',
    report: 'report.md'
}

const getAssetPath = (type, issue) => {
    return `${path}/${issues[issue]}/${types[type]}`;
}

const evaluate = () => {
    let msg = '';
    const reportFile = getAssetPath('report', 'current');
    Object.keys(types).forEach(type => {
        if (type === 'report') {
            return;
        }
        let current = read(getAssetPath(type, 'current'));
        let ref = read(getAssetPath(type, 'ref'));
        if (current === ref) {
            return;
        } else {
            switch (type) {
                case 'data':
                    break;
                case 'clean':
                    try {

                        current = new DOMParser({
                            locator: {},
                            errorHandler: {
                                warning: function (w) {},
                                error: function (e) {},
                                fatalError: function (e) {
                                    console.error(e)
                                }
                            }
                        }).parseFromString(current);
                        ref = new DOMParser({
                            locator: {},
                            errorHandler: {
                                warning: function (w) {},
                                error: function (e) {},
                                fatalError: function (e) {
                                    console.error(e)
                                }
                            }
                        }).parseFromString(ref);
                    } catch (e) {
                        msg += 'HTML Errors\n\n'
                    }
                    const result = compare(ref, current);
                    msg += JSON.stringify(reporter.getDifferences(result)) + '\n\n';
            }
        }
    });
    if (!msg) {
        msg = 'All data are equal';
    }
    write(reportFile, msg);
}

const processHtml = path => {
    const tokens = {};
    const doc = HTMLParser.parse(read(path));
    let selector;

    // tokens
    selector = '[src*="games-assets/v2/spelling-bee"],[href*="games-assets/v2/spelling-bee"]';
    doc.querySelectorAll(selector).forEach(elem => {
        const matches = (elem.getAttribute('src') || elem.getAttribute('href')).match(/spelling-bee\.([^.]+)\.(.*)/);
        if (matches.length !== 3) {
            log(`Unexpected format for "${elem}"`, 'error');
        }
        tokens[matches[2]] = matches[1];
    })

    write(getAssetPath('tokens', 'current'), JSON.stringify(tokens));

    // game data
    const gameData = doc.querySelector('#pz-game-root ~ script').textContent.trim().replace('window.gameData = ', '');
    write(getAssetPath('data', 'current'), JSON.stringify(gameData));

    // cleaner version: neutralize text
    doc.querySelectorAll('text').forEach(elem => {
        elem.textContent = 'x';
    })

    // cleaner version: remove elements that are irrelevant for comparison
    selector = '.pz-ad-box, #pz-gdpr, #adBlockCheck, .pz-moment__info-date, .pz-game-title-bar, link, script, meta, style, iframe, body > header, body > footer';
    doc.querySelectorAll(selector).forEach(elem => {
        elem.remove();
    })
    write(getAssetPath('clean', 'current'), beautify(doc.toString(), {
        format: 'html'
    }));

    evaluate();
}


const detectChanges = (async () => {

    const path = getAssetPath('full', 'current');

    if (!fs.existsSync(path)) {
        await load(settings.get('targetUrl'), path)
            .then(() => {
                processHtml(path);
            })
    } else {
        processHtml(path);
    }
    process.exit();

})();

export default detectChanges;