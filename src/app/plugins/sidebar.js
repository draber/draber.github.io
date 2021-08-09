import {
    prefix
} from '../modules/string.js';
/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import Panel from './panel.js'

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} SideBar
 */
class SideBar extends Plugin {


    /**
     * Set any part of the content the content of the popup
     * @param {String} part
     * @param {Element|NodeList|Array|String} content
     */
     display(panel) {
        this.panel = panel;
        const slot = el.$(`[data-panel="${panel.key}"]`);
        slot.append(panel.ui);
        slot.dispatchEvent(new Event('toggle'));
        return this;
    }

    add() {
        if(screen.width < this.targetMinWidth) {
            return false;
        }
        this.app.domSet('sidebar', this.getState());
        return super.add();
    }

    toggle(state) {
        this.app.domSet('sidebar', state); 
        return super.toggle(state)
    }

    /**
     * SideBar constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Sidebar', 'Uses sidebar instead of modals', {
            canChangeState: true,
            addMethod: 'prepend'
        });

        this.targetMinWidth = 1450;


        this.ui = el.div({
            classNames: [prefix(), prefix('sidebar', 'd')]
        })

        this.target = this.app.target;

        const closeOthers = evt => {            
            if (evt.target.open) {
                el.$$('details', this.ui).forEach(details => {
                    if(!details.isSameNode(evt.target)){
                        details.open = false;
                    }
                })
            }
        }

        app.on(prefix('pluginsReady'), evt => {
            evt.detail.forEach(plugin => {
                if (!plugin.canChangeState || plugin === this) {
                    return false;
                }
                if(plugin.menuAction && plugin.menuAction === 'panel'){
                    this.ui.append(el.details({
                        data: {
                            panel: plugin.key
                        },
                        events: {
                            toggle: evt => closeOthers(evt)
                        },
                        content: [
                            el.summary({
                                content: plugin.title
                            })
                        ]
                    }))
                }
            })
        })

        this.toggle(this.getState());
    }
}

export default SideBar;