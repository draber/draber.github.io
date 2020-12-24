import el from '../modules/element.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';
import { prefix } from '../modules/string.js';

/**
 * Header plugin
 * 
 * @param {App} app
 * @returns {Plugin} Header
 */
class Header extends Plugin {
    constructor(app) {

        super(app, settings.get('title'), {
            key: 'header'
        });

        this.ui = el.div();

        // add title closer and minimizer
        this.ui.append(el.div({
                text: this.title,
                classNames: ['header']
            })
        );

		app.on(prefix('toolsReady'), evt => {     
            const toolbar = el.div({
                classNames: ['toolbar']
            })     
			evt.detail.forEach(tool => {
                toolbar.append(tool);
            })
            this.ui.append(toolbar)
            return this;
        })

        this.add();
    }
}

export default Header;