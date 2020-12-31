import settings from '../modules/settings.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

/**
 * Footer plugin
 * 
 * @param {App} app
 * @returns {Plugin} Footer
 */
class Footer extends Plugin {
    constructor(app) {

        super(app, `${settings.get('label')} ${settings.get('version')}`, {
            key: 'footer'
        });

        this.ui = el.a({
            text: this.title,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
        });
        
        this.add();
    }
}

export default Footer;
