import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import plugin from '../modules/plugin.js';
import settings from '../modules/settings.js';

/**
 * Dark Mode plugin
 *
 * @param {app} app
 * @returns {plugin} darkMode
 */
class darkMode extends plugin {
    constructor(app) {

        super(app, 'Dark Mode', {
            optional: true,
            defaultEnabled: false
        });

        const bodyClass = prefix('dark', 'd');
        this.toggle = state => {
            settings.set(`options.${this.key}`, state);
            el.$('body').classList.toggle(bodyClass, state);
            return this;
        }

        this.toggle(this.isEnabled());
        this.add();
    }
}

export default darkMode;
