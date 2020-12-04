import settings from '../../modules/settings.js';
import plugins from '../../modules/plugins.js';
import el from '../../modules/element.js';
import pf from '../../modules/prefixer.js';

/**
 * {HTMLElement}
 */
let plugin = plugins.noUi;

/**
 * Display name
 * @type {string}
 */
const title = 'Dark Mode';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'darkMode';

/**
 * Can be removed by the user
 * @type {boolean}
 */
const optional = true;

/**
 * Initial state
 * @returns {boolean}
 */
const getInitialState = () => {
    // never used = no dark mode
    if(typeof settings.get(`options.${key}.v`) === 'undefined'){
        return false;
    }
    return !plugins.isDisabled(key);
}

/**
 * Dark Mode (no UI)
 */
export default {
    /**
     * Create and attach plugin
     * @param {HTMLElement} app
     * @param {HTMLElement} game
     * @returns {null} plugin
     */
    add: (app, game) => {
        app.addEventListener(pf(key), evt => {
            if (evt.detail.enabled) {
                el.$('body').classList.add(pf('dark', 'd'));
                settings.set(`options.${key}.v`, true);
            } else {
                el.$('body').classList.remove(pf('dark', 'd'));
                settings.set(`options.${key}.v`, false);
            }
        });

        app.dispatchEvent(new CustomEvent(pf(key), {
            detail: {
                enabled: getInitialState()
            }
        }));

        return plugins.add({
            app,
            plugin,
            key,
            title,
            optional
        });
    },

    /**
     * Remove plugin
     * @returns null
     */
    remove: () => {
        app.dispatchEvent(new CustomEvent(pf(key), {
            detail: {
                enabled: false
            }
        }));
    }
}