
import logger from '../logger/index.js'
import puppeteer from 'puppeteer';

const init = async url => {
    const browser = await puppeteer.launch();
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
        logger.error(msg);
    });
    
    // Emitted when a request, which is produced by the page, fails
    page.on('requestfailed', request => {
        msg = {
            ...msg,
            ...{
                status: 404,
                contents: `No results from ${msg.url}`
            }
        }
        logger.error(msg);
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

    return {
        page,
        browser,
        msg
    }
}

export default init;

