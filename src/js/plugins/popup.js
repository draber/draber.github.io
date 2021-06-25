import el from "../modules/element";
import {
    prefix
} from "../modules/string";
import settings from "../modules/settings";


/**
 * Plugin base class
 */
class Popup {

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
                    })
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
        if (!state && closer) {
            closer.click();
        }

        if (state) {
            this.modalWrapper.append(this.ui);
            this.modalSystem.classList.add('sb-modal-open');
        } else {
            this.getTarget().append(this.ui);
            this.modalSystem.classList.remove('sb-modal-open');
        }

        return this;
    }


    /**
     * Build an instance
     * @param key
     */
    constructor(key) {

        this.key = key;

        this.state = false;

        this.modalSystem = el.$('.sb-modal-system');
        this.modalWrapper = el.$('.sb-modal-wrapper', this.modalSystem);

        this.parts = {
            title: el.h3({
                classNames: ['sb-modal-title']
            }),

            subtitle: el.p({
                classNames: ['sb-modal-message']
            }),

            body: el.div({
                classNames: ['sb-modal-body']
            }),

            footer: el.div({
                classNames: ['sb-modal-message', 'sba-modal-footer'],
                content: [
                    el.a({
                        content: settings.get('label'),
                        attributes: {
                            href: settings.get('url'),
                            target: '_blank'
                        }
                    })
                ]
            })
        }

        this.ui = this.create();

        this.getTarget().append(this.ui);
    }

}

export default Popup;