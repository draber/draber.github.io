import beautify from 'beautify';
import fs, {
    read
} from 'fs';
import logger from '../modules/logger/logger.js';
import init from '../modules/browser/init.js';


const load = async (url, context) => {

    const navi = await init(url);
    const browser = navi.browser;
    const page = navi.page;
    let msg = navi.msg;

    try {
        await page.goto(url);

        context.sel = {
            launch: '.on-stage .pz-moment__button-wrapper .pz-moment__button.primary',
            hive: '.pz-game-wrapper .sb-hive',
            text: 'text',
            sbCss: 'https://www.nytimes.com/games-assets/v2/spelling-bee',
            obsolete: '.pz-ad-box, #pz-gdpr, #adBlockCheck, .pz-moment__info-date, .pz-game-title-bar, link, script, meta, style, iframe, svg, body > footer'
        }

        // wait for main page
        await page.waitForSelector(context.sel.launch);
        await page.click(context.sel.launch);
        await page.waitForSelector(context.sel.hive);

        // fetch and save game data
        let oldGameData = await page.evaluate('gameData');
        oldGameData = beautify(JSON.stringify(oldGameData), {
            format: 'json'
        });
        fs.writeFileSync(context.paths.data, oldGameData);

        const cssRules = await page.evaluate(context => {
            const sheet = Array.from(document.styleSheets).filter(entry => entry.href && entry.href.startsWith(context.sel.sbCss)).pop();
            const cssArr = [];
            sheet.cssRules.forEach(rule => {
                cssArr.push(rule.cssText.replace(/\\n/g, '').replace(/\s+/g, ' '));
            })
            return cssArr.join('\n');
        }, context)
        fs.writeFileSync(context.paths.styles, cssRules);

        // remove obsolete elements
        const downloads = await page.evaluate(context => {
            const _downloads = [];
            const toLocal = url => {
                const match = url.match(/(?<path>games-assets\/v2\/)(?<file>[^\.]+)\.(?<hash>[^\.]+)(?<ext>\..*)$/);
                return match.groups.path + match.groups.file + match.groups.ext;
            }

            document.title = 'SBA Integration Mock';

            document.documentElement.removeAttribute('style');
            document.documentElement.removeAttribute('class');

            ['label', 'hidden', 'expanded', 'haspopup'].forEach(aria => {
                document.querySelectorAll(`[aria-${aria}]`).forEach(element => {
                    element.removeAttribute(`aria-${aria}`)
                });                
            })

            document.querySelector('#js-hook-game-wrapper').removeAttribute('style');
            document.querySelector('#js-mobile-toolbar ~ .pz-nav__actions').remove();
            document.querySelector('#js-hook-pz-moment__game').classList.remove('pz-moment__frame');

            document.querySelectorAll('#portal-game-modals, #pz-game-root, #portal-game-toolbar, #js-nav-drawer, #js-mobile-toolbar, #portal-game-moments').forEach(element => {
                element.innerHTML = '';
            })
            document.querySelectorAll(context.sel.obsolete).forEach(element => {
                if (element.nodeName === 'SCRIPT') {
                    if (element.src && element.src.includes('games-assets/v2/')) {
                        element.removeAttribute('type');
                        _downloads.push(element.src);
                        element.src = toLocal(element.src);
                        return false;
                    }
                    if (element.textContent.includes('window.userType')) {
                        element.removeAttribute('type');
                        return false;
                    }
                    if (element.textContent.includes('window.gameData')) {
                        element.removeAttribute('type');
                        element.textContent = 'window.gameData = ' + context.gameData;
                        return false;
                    }
                }
                if (element.nodeName === 'LINK' && element.href && element.rel && element.rel === 'stylesheet') {
                    if (element.href.includes('games-assets/v2/')) {
                        _downloads.push(element.href);
                        element.href = toLocal(element.href);
                        element.removeAttribute('type');
                        return false;
                    }
                }
                if (element.nodeName === 'META') {

                    if (element.httpEquiv && element.httpEquiv === 'Content-Type' ||
                        element.name && element.name === 'version') {
                        return false;
                    }
                }
                if (element.id &&
                    (
                        ['responsive.js', 'native-bridge.js'].includes(element.id)
                    )
                ) {
                    return false;
                }
                element.remove()
            });
            return _downloads;
        }, context);
       // console.log(downloads)

        // store minimal HTML
        let html = await page.evaluate(() => document.documentElement.outerHTML);
        html = beautify(html.replace(/&nbsp;/g, ' '), {
            format: 'html'
        });
        fs.writeFileSync(context.paths.clean, html);

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