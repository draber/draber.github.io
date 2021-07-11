const puppeteer = require('puppeteer');
const {
    write
} = require('../compiler/modules/file.js');

exports.load = async (url, target) => {
    const browser = await puppeteer.launch({
        args: [
            '--shm-size=1gb',
        ],
    });
    const page = await browser.newPage();
    let msg = {
        status: 200,
        url,
        contents: 'Nothing happened'
    }

    // Emitted when the page emits an error event (for example, the page crashes)
    page.on('error', error => {
        msg = {
            ...msg,
            ...{
                status: 500,
                contents: `${error} on ${msg.url}`
            }
        }
        browser.close()
    });

    // Emitted when a request, which is produced by the page, fails
    page.on('requestfailed', request => {
        msg = {
            ...msg,
            ...{
                status: 500,
                contents: `No results from ${msg.url}`
            }
        }
        browser.close()
    });

    // Emitted when a response is received
    page.on('response', response => {
        if (![200, 301].includes(response.status())) {
            msg = {
                ...msg,
                ...{
                    status: response.status(),
                    contents: `${response.statusText()} on ${msg.url}`
                }
            }
        }
    });

    try {
        await page.goto(url);

        const sel = {
            launch: '.on-stage .pz-moment__button-wrapper .pz-moment__button.primary',
            hive: '.pz-game-wrapper .sb-hive',
            resources: '[src*="games-assets/v2/spelling-bee"], [href*="games-assets/v2/spelling-bee"]'
        }

        await page.waitForSelector(sel.launch);
        await page.click(sel.launch);
        await page.waitForSelector(sel.hive).then(async () => {
            let html = await page.evaluate(() => document.documentElement.outerHTML);
            write(target, html);
        });



    } catch (e) {
        msg.status = 500;
        msg.contents = `Error: ${e.message}`;
    }
    await browser.close();
    return msg;
};