import el from '../modules/element.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';

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

        this.add();
    }
}

export default Header;