import logger from '../modules/logger/logger.js';
import init from '../browser/init.js';
import fetch from 'node-fetch';


const load = async (url, context) => {

    const navi = await init(url);
    const browser = navi.browser;
    const page = navi.page;
    let msg = navi.msg;

    try {
        await page.goto(url, {
            waitUntil: 'networkidle0'
        });

        // wait for main page
        await page.waitForSelector('.on-stage .pz-moment__button-wrapper .pz-moment__button.primary');
        await page.click('.on-stage .pz-moment__button-wrapper .pz-moment__button.primary');
        await page.waitForSelector('.pz-game-wrapper .sb-hive');

        // fetch original game data
        const oldGameData = await page.evaluate('gameData');


        // remove obsolete elements
        const data = await page.evaluate(context => {

            const css = [];
            const js = [];

            const parseUrl = url => {
                const match = url.match(/(?<path>games-assets\/v2\/)(?<file>[^\.]+)\.(?<hash>[^\.]+)(?<ext>\..*)$/);
                return {
                    remote: url,
                    rel: match.groups.path + match.groups.file + match.groups.ext,
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
            const obsoletes = '.pz-ad-box, #pz-gdpr, #adBlockCheck, .pz-moment__info-date, .pz-game-title-bar, link, script, meta, style, iframe, svg, body > footer';
            document.querySelectorAll(obsoletes).forEach(element => {
                if (element.nodeName === 'SCRIPT') {
                    if (element.src && element.src.includes('games-assets/v2/')) {
                        element.removeAttribute('type');
                        urlData = parseUrl(element.src);
                        js.push({
                            ...urlData,
                            ...{
                                format: 'expand'
                            }
                        });
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
                        css.push({
                            ...urlData,
                            ...{
                                format: 'compact'
                            }
                        });
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

            return {
                css,
                js
            };
        }, context);

        const download = async type => {
            await Promise.all((data => {
                const promises = [];
                data[type].forEach(resource => {
                    promises.push(fetch(resource.remote))
                })
                return promises
            })(data))
            .then(responses => {
                return responses;
            })
            .then(responses => Promise.all(responses.map(response => response.text())))
            .then(body => {
                for (let i = 0; i < body.length; i++) {
                    data[type][i].body = body[i];
                }
            });
        }

        await download('js');
        await download('css');

        // retrieve minimal HTML
        let html = await page.evaluate(() => document.documentElement.outerHTML);

        ['js', 'css'].forEach(type => {
            data[type].forEach(resource => {
                html = html.replace(resource.remote, resource.rel);
            })
        })
        html = '<!DOCTYPE html>' + html.replace(/&nbsp;/g, ' ').replace(/ style=""/g, '');

        data.html = [{
            body: html,
            rel: 'index.html',
            format: 'expand'
        }];
        data.json = [{
            body: JSON.stringify(oldGameData),
            rel: 'game-data.json',
            format: 'expand'
        }];

        return data;

    } catch (e) {
        logger.error(msg);
    }
    await browser.close();
};

export default load;