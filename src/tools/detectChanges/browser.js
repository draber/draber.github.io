import beautify from 'beautify';
import fs from 'fs-extra';
import logger from '../modules/logger/logger.js';
import init from '../modules/browser/init.js';


const load = async (url, context) => {

    const navi = await init(url);
    const browser = navi.browser;
    const page = navi.page;
    let msg = navi.msg;

    let resources = {};

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
        fs.outputFileSync(context.paths.gameData, oldGameData);

        const cssRules = await page.evaluate(context => {
            const sheet = Array.from(document.styleSheets).filter(entry => entry.href && entry.href.startsWith(context.sel.sbCss)).pop();
            const cssArr = [];
            sheet.cssRules.forEach(rule => {
                cssArr.push(rule.cssText.replace(/\\n/g, '').replace(/\s+/g, ' '));
            })
            return cssArr.join('\n');
        }, context)
        fs.outputFileSync(context.paths.styles, cssRules);

        // remove obsolete elements
        resources = await page.evaluate(context => {

            const _resources = [];

            const parseUrl = url => {
                const match = url.match(/(?<path>games-assets\/v2\/)(?<file>[^\.]+)\.(?<hash>[^\.]+)(?<ext>\..*)$/);
                return {
                    remote: url,
                    local: match.groups.path + match.groups.file + match.groups.ext,
                    hash: match.groups.hash,
                    file: match.groups.file + match.groups.ext,
                    ext: match.groups.ext.substr(1),
                }
            }

            document.title = context.title;

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

            let urlData;
            document.querySelectorAll(context.sel.obsolete).forEach(element => {
                if (element.nodeName === 'SCRIPT') {
                    if (element.src && element.src.includes('games-assets/v2/')) {
                        element.removeAttribute('type');
                        urlData = parseUrl(element.src);
                        _resources.push(urlData);
                        return false;
                    }
                    if (element.id &&
                        (
                            ['responsive.js', 'native-bridge.js'].includes(element.id)
                        )
                    ) {
                        element.removeAttribute('type');
                        return false;
                    }
                }
                if (element.nodeName === 'LINK' && element.href && element.rel && element.rel === 'stylesheet') {
                    if (element.href.includes('games-assets/v2/')) {
                        element.removeAttribute('type');
                        urlData = parseUrl(element.href);
                        _resources.push(urlData);
                        return false;
                    }
                }
                if (element.nodeName === 'META') {
                    if (element.httpEquiv && element.httpEquiv === 'Content-Type' ||
                        element.name && element.name === 'version') {
                        return false;
                    }
                }
                element.remove()
            });
            const mockScript = document.createElement('script');
            for (let [key, entry] of Object.entries(context.mockData)) {
                mockScript.textContent += `window.${key} = ${JSON.stringify(entry)};\n`;
            }
            document.querySelector('head').append(mockScript);
            return _resources;
        }, context);

        fs.outputFileSync(context.paths.resources, beautify(JSON.stringify(resources), {
            format: 'json'
        }));

        // resources.forEach(async resource => {
        //     const navi = await page.goto(resource.remote);
        //     await page.waitForNavigation({ waitUntil: 'networkidle2' });
        //     const buffer = await navi.buffer();
        //     const txt = buffer.toString('utf8');
        //     resource.body = txt;
        // })

        // store minimal HTML
        let html = await page.evaluate(() => document.documentElement.outerHTML);
        resources.forEach(resource => {
            html = html.replace(resource.remote, resource.local);
        })
        html = beautify('<!DOCTYPE html>' + html.replace(/&nbsp;/g, ' ').replace(/ style=""/g, ''), {
            format: 'html'
        });

        fs.outputFileSync(context.paths.html, html);

        return {
            resources,
            html,
            oldGameData
        };

    } catch (e) {
        logger.error(msg);
    }
    await browser.close();
};

export {
    load
}