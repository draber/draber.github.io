import el from '../modules/element.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';
import { prefix } from '../modules/string.js';

/**
 * Header plugin
 * 
 * @param {App} app
 * @returns {Plugin} Header
 */
class Header extends Plugin {

    /**
     * Header constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, settings.get('title'), '', {
            key: 'header'
        });

        this.ui = el.a({
            content: this.title,
            attributes: {
                href: settings.get('url'),
                target: prefix(),
                title: (new URL(settings.get('url'))).hostname 
            }
        });
    }
}

export default Header;