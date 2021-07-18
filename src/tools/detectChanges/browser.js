import beautify from 'beautify';
import fs from 'fs';
import path from 'path';
import logger from '../modules/logger/logger.js';
import init from '../modules/browser/init.js';


const load = async (url, paths) => {

    const navi = await init();
    const browser = navi.browser;
    const page = navi.page;
    let msg = navi.msg;

    try {
        await page.goto(url);

        const sel = {
            launch: '.on-stage .pz-moment__button-wrapper .pz-moment__button.primary',
            hive: '.pz-game-wrapper .sb-hive',
            text: 'text',
            sbCss: 'https://www.nytimes.com/games-assets/v2/spelling-bee',
            obsolete: '.pz-ad-box, #pz-gdpr, #adBlockCheck, .pz-moment__info-date, .pz-game-title-bar, link, script, meta, style, iframe, body > header, body > footer'
        }

        // wait for main page
        await page.waitForSelector(sel.launch);
        await page.click(sel.launch);
        await page.waitForSelector(sel.hive);

        // fetch and save game data
        let gameData = await page.evaluate('gameData');
        gameData = beautify(JSON.stringify(gameData), {
            format: 'json'
        });
        fs.writeFileSync(paths.data, gameData);

        const cssRules = await page.evaluate(sel => {
            const sheet = Array.from(document.styleSheets).filter(entry => entry.href && entry.href.startsWith(sel.sbCss)).pop();
            const cssArr = [];
            sheet.cssRules.forEach(rule => {
                cssArr.push(rule.cssText.replace(/\\n/g, '').replace(/\s+/g, ' '));
            })
            return cssArr.join('\n');
        }, sel)
        fs.writeFileSync(paths.styles, cssRules);

        // remove obsolete elements
        await page.evaluate(sel => {
            document.querySelectorAll(sel.obsolete).forEach(element => element.remove());
        }, sel);

        // normalize <text> elements
        await page.evaluate(sel => {
            document.querySelectorAll(sel.text).forEach(element => element.textContent = 'x');
        }, sel);

        // add new stylesheet
        await page.evaluate(href => {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.querySelector('head').append(link);
        }, './' + path.basename(paths.styles));

        // store minimal HTML
        let html = await page.evaluate(() => document.documentElement.outerHTML);
        html = beautify(html.replace(/&nbsp;/g, ' '), {
            format: 'html'
        });
        fs.writeFileSync(paths.clean, html);

        return true;

    } catch (e) {
        msg.status = 500;
        msg.contents = `Error: ${e.message}`;        
        logger.error(msg);
    }
    await browser.close();
    return msg;
};

export {
    load
}