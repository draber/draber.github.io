/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from "../modules/element";
import {
    prefix
} from "../modules/string";
import Plugin from '../modules/plugin.js';


/**
 * Popup base class
 */
class Popup extends Plugin {

    /**
     * Enable closing the popup by clicking on the x button
     * @returns {Popup}
     */
    enableKeyClose() {
        document.addEventListener('keyup', evt => {
            this.app.popupCloser = this.getCloseButton();
            if (this.app.popupCloser && evt.code === 'Escape') {
                this.app.popupCloser.click();
            }
            delete(this.app.popupCloser);
        })
        return this;
    }

    /**
     * Create a pop-up, this mimics the pop-ups already available in Spelling Bee
     * @returns {HTMLElement}
     */
    buildUi() {
        this.panelHolder = el.div({
            classNames: [prefix('panel-holder', 'd')],
        })
        return el.div({
            classNames: ['sb-modal-frame', prefix('pop-up', 'd')],
            attributes: {
                role: 'button'
            },
            events: {
                click: e => {
                    e.stopPropagation();
                }
            },
            content: [
                el.div({
                    classNames: ['sb-modal-top'],
                    content: el.div({
                        attributes: {
                            role: 'button'
                        },
                        classNames: ['sb-modal-close'],
                        content: '×',
                        events: {
                            click: () => {
                                this.toggle(false)
                            }
                        }
                    }),
                }),
                this.panelHolder
            ]
        });
    }

    /**
     * Set any part of the content the content of the popup
     * @param {String} part
     * @param {Element|NodeList|Array|String} content
     */
    display(panel) {
        this.panel = panel;
        this.panelHolder.append(panel.ui);
        this.toggle(true);
        return this;
    }

    /**
     * Get the close button of the various pop-up formats
     * @returns {HTMLElement|Boolean}
     */
    getCloseButton() {
        for (let selector of ['.pz-moment__frame.on-stage .pz-moment__close', '.sb-modal-close']) {
            const closer = el.$(selector, this.app.gameWrapper);
            if (closer) {
                return closer;
            }
        }
        return false;
    }

    /**
     * Open/close popup
     * @param state
     * @returns {Popup}
     */
    toggle(state) {
        const closer = this.getCloseButton();
        if (!state && closer) {
            closer.click();
        }

        if (state) {
            this.app.modalWrapper.append(this.ui);
            this.modalSystem.classList.add('sb-modal-open');
        } else {
            this.target.append(this.ui);
            this.panel.reset();
            this.modalSystem.classList.remove('sb-modal-open');
        }

        return this;
    }

    /**
     * Build an instance
     * @param app
     * @param key
     */
    constructor(app) {        

        super(app, 'popup');

        this.state = false;

        this.modalSystem = this.app.modalWrapper.closest('.sb-modal-system');
        this.target = this.app.componentContainer;
        this.ui = this.buildUi();
        this.enableKeyClose();
    }

}

export default Popup;