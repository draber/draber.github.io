import settings from '../../modules/settings.js';
import el from '../../modules/element.js';

/**
 * Link in the footer
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class footer {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;
        this.title = `${settings.get('label')} ${settings.get('version')}`;
        this.key = 'footer';

        this.ui = el.create({
            tag: 'a',
            text: this.title,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
        });
    }
}

export default footer;
