import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import settings from '../modules/settings.js';

/**
 * Launcher plugin
 * 
 * @param {App} app
 * @returns {Plugin} Launcher
 */
class Launcher extends Plugin {

    buildUiAndTarget() {
        let classNames = ['pz-toolbar-button__sba'];
        if (this.app.envIs('mobile')) {
            this.target = el.$('#js-mobile-toolbar');
            classNames.push('pz-nav__toolbar-item');
        } else {
            this.target = el.div();
            el.$$('#portal-game-toolbar > span').forEach(button => {
                this.target.append(button);
            })
            el.$('#portal-game-toolbar').append(this.target);
            classNames.push('pz-toolbar-button');
        }
        this.ui = el.span({
            text: settings.get('title'),
            events: {
                click: () => {
                    this.app.toggle(!this.app.getState())
                }
            },
            attributes: {
                role: 'presentation'
            },
            classNames
        })
    }

    constructor(app) {

        super(app, 'Launcher');

        this.buildUiAndTarget();
        app.on(prefix('destroy'), () => this.ui.remove());
        this.add();
    }
}

export default Launcher;