import beautify from 'beautify';
import {
    load
} from './browser.js';
import date from 'date-and-time';
import {
    read,
    write
} from '../modules/file.js';
import format from './format.js';
import fs from 'fs';
import HTMLParser from 'node-html-parser';
import log from '../modules/logger.js';
import path from 'path';
import settings from '../modules/settings.js';
import url from 'url';
import validate from '../modules/validators/validate.js';

const here = path.dirname(url.fileURLToPath(
    import.meta.url));
const storage = path.dirname(here) + '/storage';
const today = date.format(new Date(), 'YYYY-MM-DD');

const issues = {
    current: today,
    ref: 'reference'
}

const types = {
    clean: 'clean-site.html',
    tokens: 'tokens.json',
    data: 'data.json',
    report: 'report.md'
}

const getAssetPath = (type, issue) => {
    return `${storage}/${issues[issue]}/${types[type]}`;
}



const evaluate = () => {
    let msg = format.heading('Report ' + today, 1);
    ['clean', 'tokens', 'data'].forEach(type => {
        let current = read(getAssetPath(type, 'current'));
        let ref = read(getAssetPath(type, 'ref'));
        if (current === ref) {
            return;
        } else {
            switch (type) {
                case 'data':
                    const schema = read(`${here}/schema.json`);
                    msg += format.heading('Data Schema Comparison', 2) +
                        format.fromValidation(validate.jsonSchema(JSON.parse(current), JSON.parse(schema)));
                    break;
                case 'tokens':
                    msg += format.heading('Tokens', 2) +
                    format.fromValidation(validate.objectEquality(JSON.parse(ref), JSON.parse(current)));
                    break;
                    //     msg += tokenValidator(ref, current);
                    // case 'clean':
                    //     msg += htmlValidator(ref, current);
                    //     break;
            }
        }
    });
    write(getAssetPath('report', 'current'), msg);
}

const processHtml = path => {
    const tokens = {};
    const doc = HTMLParser.parse(read(path).replace(/&nbsp;/g, ' '));
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
    write(getAssetPath('data', 'current'), beautify(gameData, {
        format: 'json'
    }));

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