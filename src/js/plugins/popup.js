import el from "../modules/element";
import {
    prefix
} from "../modules/string";
import Plugin from '../modules/plugin.js';
import settings from "../modules/settings";


/**
 * Plugin base class
 */
class Popup extends Plugin {

    /**
     * Get a reference to the `<template>` that holds the pop-ups while idle
     * Create one if it doesn't exist yet
     * @returns {*}
     */
    getContainer() {
        const dataUi = prefix('popup-container', 'd');
        let container = el.$(`[data-ui="${dataUi}"]`);
        if (!container) {
            container = el.template({
                data: {
                    ui: dataUi
                }
            });
            el.$('body').append(container);
        }
        return container;
    }

    /**
     * Create a pop-up, this mimics the pop-ups already available in Spelling Bee
     * @returns {*}
     */
    create() {
        const frame = el.div({
            classNames: ['sb-modal-frame', 'left-aligned'],
            attributes: {
                role: 'button'
            },
            data: {
                ui: this.key
            },
            events: {
                click: e => {
                    e.stopPropagation();
                }
            },
            html: [
                el.div({
                    attributes: {
                        role: 'button'
                    },
                    classNames: ['sb-modal-close'],
                    text: '×',
                    events: {
                        click: () => {
                            this.toggle(false)
                        }
                    }
                }),
                el.div({
                    classNames: ['sb-modal-content'],
                    html: [
                        el.div({
                            classNames: ['sb-modal-header'],
                            html: [this.puTitle, this.puSubTitle]
                        }),
                        this.puBody
                    ]
                })
            ]
        });
        return frame;
    }

    /**
     * 
     * @param {Element|NodeList|Array|String} body
     */
    setContent(body) {
        this.puBody.innerHTML = '';
        this.puBody.append(el.htmlToNode(body));
        this.puBody.append(this.puFooter);
    }

    /**
     * Overwrite the title
     * @param {String} title
     */
    setTitle(title) {
        this.puTitle.innerHTML = title;
    }

    /**
     * Overwrite the subtitle
     * @param {String} subTitle
     */
    setSubtitle(subTitle) {
        this.puSubTitle.innerHTML = subTitle;
    }

    /**
     * Open/close popup
     * @param state
     * @returns {Popup}
     */
    toggle(state) {
        const closer = el.$('.sb-modal-close', this.modalWrapper);
        if (!this.getState() && closer) {
            closer.click();
        }

        if (state) {
            this.modalWrapper.append(this.ui);            
            this.modalSystem.classList.add('sb-modal-open');
        } else {
            this.getContainer().append(this.ui);
            this.modalSystem.classList.remove('sb-modal-open');
        }

        super.toggle(state);
        
        this.app.trigger(prefix('popup'), {
            plugin: this
        })

        return this;
    }

    /**
     * Build an instance of a plugin
     * @param {App} app
     * @param {String} title
     * @param {String} description
     * @param key
     */
    constructor(app, title, description, {
        key
    } = {}) {

        super(app, title, description, {
            key,
            canChangeState: true,
            defaultState: false
        })

        this.modalSystem = el.$('.sb-modal-system');
        this.modalWrapper = el.$('.sb-modal-wrapper', this.modalSystem);

        this.puTitle = el.h3({
            classNames: ['sb-modal-title'],
            text: title
        });

        this.puSubTitle = el.p({
            classNames: ['sb-modal-message'],
            text: description
        });

        this.puBody = el.div({
            classNames: ['sb-modal-body']
        });

        this.puFooter = el.div({
            classNames: ['sb-modal-message', 'sba-modal-footer'],
            html: [
                el.a({
                    text: settings.get('label') + ' v' + settings.get('version'),
                    attributes: {
                        href: settings.get('url'),
                        target: '_blank'
                    }
                })
            ]

        });

        if (!this.app.popups) {
            this.app.popups = new Map();
        }

        if (!this.app.popups.has(key)) {
            this.app.popups.set(key, this.create());
        }

        this.target = this.getContainer();
        this.ui = this.app.popups.get(key);
    }

}

export default Popup;