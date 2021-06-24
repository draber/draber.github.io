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
    getTarget() {
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
            classNames: ['sb-modal-frame', 'left-aligned', prefix('pop-up', 'd')],
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
            content: [
                el.div({
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
                el.div({
                    classNames: ['sb-modal-content'],
                    content: [
                        el.div({
                            classNames: ['sb-modal-header'],
                            content: [this.parts.title, this.parts.subtitle]
                        }),
                        this.parts.body,
                        this.parts.footer
                    ]
                })
            ]
        });
        return frame;
    }

    /**
     * Set any part of the content the content of the popup
     * @param {String} part
     * @param {Element|NodeList|Array|String} content
     */
    setContent(part, content) {
        if (!this.parts[part]) {
            console.error(`Unknown target ${part}`);
            return this;
        }
        this.parts[part] = el.empty(this.parts[part]);
        this.parts[part].append(el.toNode(content));
        return this;
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
            this.state = true;
        } else {
            this.getTarget().append(this.ui);
            this.modalSystem.classList.remove('sb-modal-open');
            this.state = false;
        }

        this.app.trigger(prefix('popup'), {
            plugin: this
        })

        return this;
    }

    getState() {
        return this.state;
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

        this.state = false;

        this.modalSystem = el.$('.sb-modal-system');
        this.modalWrapper = el.$('.sb-modal-wrapper', this.modalSystem);

        this.parts = {
            title: el.h3({
                classNames: ['sb-modal-title'],
                content: title
            }),

            subtitle: el.p({
                classNames: ['sb-modal-message'],
                content: description
            }),

            body: el.div({
                classNames: ['sb-modal-body']
            }),

            footer: el.div({
                classNames: ['sb-modal-message', 'sba-modal-footer'],
                content: [
                    el.a({
                        content: settings.get('label') + ' ' + settings.get('version'),
                        attributes: {
                            href: settings.get('url'),
                            target: '_blank'
                        }
                    })
                ]

            })
        }


        if (!this.app.popups) {
            this.app.popups = new Map();
        }

        if (!this.app.popups.has(key)) {
            this.app.popups.set(key, this.create());
        }

        this.target = this.getTarget();
        this.ui = this.app.popups.get(key);
    }

}

export default Popup;