import logger from '../modules/logger/logger.js';
import init from '../modules/browser/init.js';


const load = async (url) => {

    const navi = await init(url);
    const browser = navi.browser;
    const page = navi.page;
    let msg = navi.msg;

    try {
        await page.goto(url);

        const sel = {
            launch: '.on-stage .pz-moment__button-wrapper .pz-moment__button.primary',
            hive: '.pz-game-wrapper .sb-hive',
            text: 'text'
        }

        // wait for main page
        await page.waitForSelector(sel.launch);
        await page.click(sel.launch);
        await page.waitForSelector(sel.hive);

        // fetch and save game data
        let gameData = await page.evaluate('gameData');


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