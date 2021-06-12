import settings from '../modules/settings.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

/**
 * Footer plugin
 * @param {App} app
 * @returns {Plugin} Footer
 */
class Footer extends Plugin {

    /**
     * Footer constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, `${settings.get('label')}`, '', {
            key: 'footer'
        });

        this.ui = el.a({
            content: this.title,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
        });
    }
}

export default Footer;
