import settings from '../../modules/settings.js';
import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Footer';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'footer';

/**
 * Can't be removed by the user
 * @type {boolean}
 */
const optional = false;

/**
 * Link in the footer
 */
export default {
    /**
     * Create and attach plugin
     * @param {HTMLElement} app
     * @param {HTMLElement} game
     * @returns {HTMLElement} plugin
     */
    add: (app, game) => {
        plugin = el.create({
            tag: 'a',
            text: `${settings.get('label')} ${settings.get('version')}`,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
        });
        return plugins.add(app, plugin, key, title, optional);
    },
    /**
     * Remove plugin
     * @returns null
     */
    remove: () => {
        return plugins.remove(plugin, key, title);
    }
}
