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

    /**
     * Get element to which the launcher will be attached to
     * @returns {HTMLElement}
     */
    getTarget() {
        let target;
        if (this.app.envIs('mobile')) {
            target = el.$('#js-mobile-toolbar');
        } else {
            target = el.div({
                content: el.$$('#portal-game-toolbar > span')
            });
            el.$('#portal-game-toolbar').append(target);
        }
        return target;
    }

    /**
     * Launcher constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Launcher', '');

        this.target = this.getTarget();

        const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button']

        this.ui = el.span({
            content: settings.get('title'),
            events: {
                click: () => {
                    const nextState = !this.app.getState();
                    this.app.toggle(nextState);
                    this.app.gameWrapper.dataset.sbaActive = nextState.toString();
                }
            },
            attributes: {
                role: 'presentation'
            },
            classNames
        })

        app.on(prefix('destroy'), () => this.ui.remove());
    }
}

export default Launcher;