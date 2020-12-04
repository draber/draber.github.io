import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';
import pf from '../../modules/prefixer.js';
import css from "../../../css/widget.css";

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Styles';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'styles';

/**
 * Remove plugin, needs to outside export (called by add())
 * @returns null
 */
const remove = () => {
    return plugins.remove({
        plugin,
        key,
        title
    });
}

/**
 * Dark Mode (no UI)
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
            tag: 'style',
            // (Dart) Sass adds a BOM to CSS with Unicode characters
            // `rollup-plugin-string` converts line-breaks to `\n`
            text: css.replace(/(\uFEFF|\\n)/gu, '')
        });
        app.addEventListener(pf('destroy'), () => {
            remove();
        })

        const target = el.$('head');

        return plugins.add({
            app,
            plugin,
            key,
            target
        });
    },

    /**
     * Remove plugin
     * @returns null
     */
    remove: remove
}