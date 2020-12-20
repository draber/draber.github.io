import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';
import enableDrag from '../modules/draggable.js';

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
            attributes: {
                title: 'Hold the mouse down to drag'
            },
            classNames: ['dragger']
        }), el.span({
            attributes: {
                title: 'Minimize'
            },
            classNames: ['minimizer'],
            events: {
                click: () => {
                    console.log('toggle app')
                    app.toggle(!app.isActive())
                }
            }
        }), el.span({
            text: '×',
            attributes: {
                title: 'Close'
            },
            classNames: ['closer'],
            events: {
                click: () => app.trigger(new Event(prefix('destroy')))
            }
        }));

        enableDrag(app, app.game, this);
        this.add();
    }
}

export default Header;
