import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import pf from '../../modules/prefixer.js';
import css from "../../../css/widget.css";


/**
 * Stylesheet plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class styles {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;        
        this.title = 'Styles';        
        this.key = 'styles';   
        this.target = el.$('head');

        this.ui = el.create({
            tag: 'style',
            // - (Dart) Sass adds a BOM to CSS with Unicode characters
            // - `rollup-plugin-string` converts line-breaks to `\n`
            text: css.replace(/(\uFEFF|\\n)/gu, '')
        });
        app.addEventListener(pf('destroy'), () => {
            pluginManager.remove(this.key);
        });
    }
}

export default styles;