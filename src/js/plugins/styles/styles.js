import el from '../../modules/element.js';
import { prefix, camel } from '../../modules/string.js';
import css from '../../../css/widget.css';
import plugin from '../../modules/pluginBase.js';

/**
 * Dark Mode plugin
 * 
 * @param {plugin} app
 * @returns {plugin} styles
 */
class styles extends plugin {
    constructor(app) {

        super(app);

        this.app = app;       
        this.title = 'Styles';        
        this.key = camel(this.title);   
        this.target = el.$('head');

        this.ui = el.create({
            tag: 'style',
            // - (Dart) Sass adds a BOM to CSS with Unicode characters
            // - `rollup-plugin-string` converts line-breaks to `\n`
            text: css.replace(/(\uFEFF|\\n)/gu, '')
        });
        app.on(prefix('destroy'), () => {
            this.ui.remove();
        });

        this.add();
    }
}

export default styles;