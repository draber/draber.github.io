import el from '../modules/element.js';
import { prefix } from '../modules/string.js';
import css from '../../css/widget.css';
import Plugin from '../modules/plugin.js';

/**
 * Styles plugin
 * 
 * @param {App} app
 * @returns {Plugin} Styles
 */
class Styles extends Plugin {
    constructor(app) {

        super(app, 'Styles');

        this.target = el.$('head');

        this.ui = el.style({
            // - (Dart) Sass adds a BOM to CSS with Unicode characters
            // - `rollup-plugin-string` converts line-breaks to `\n`
            text: css.replace(/(\uFEFF|\\n)/gu, '')
        });
        app.on(prefix('destroy'), () => this.ui.remove());

        this.add();
    }
}

export default Styles;
