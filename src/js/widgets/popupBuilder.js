/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import settings from "../modules/settings.js";
import fn from "fancy-node";
import { findNytCloseButton, modalHostKey } from "../utils/popup.ui.js";

/**
 * SBA's own modal scaffold (`.sb-modal-system > .sb-modal-scrim > .sb-modal-wrapper`).
 * Since Nov 2026 the NYT renders its modal scaffold on demand only, so SBA builds its own.
 * It is created once, inserted into the DOM while a pop-up is open and removed on close.
 * SBA never touches the NYT's scaffold.
 * @see https://github.com/draber/draber.github.io/issues/201
 * @type {HTMLElement|null}
 */
let host = null;

/**
 * The pop-up that is currently open, if any
 * @type {PopupBuilder|null}
 */
let current = null;

/**
 * App reference for the document-wide listeners, set by the first pop-up
 * @type {App|null}
 */
let appRef = null;

/**
 * Close the topmost pop-up with Escape.
 * A NYT modal can only be opened on top of an SBA pop-up, never below, so it goes first.
 * @param {KeyboardEvent} evt
 */
const onKeyUp = (evt) => {
    if (evt.code !== "Escape") {
        return;
    }
    const nytCloser = appRef ? findNytCloseButton(appRef) : false;
    if (nytCloser) {
        nytCloser.click();
        return;
    }
    if (current) {
        current.toggle(false);
    }
};

/**
 * Get the `.sb-modal-wrapper` of SBA's own modal scaffold, build the scaffold on first call.
 * The scaffold is not attached to the DOM here, see `PopupBuilder.toggle()`.
 * @returns {HTMLElement}
 */
export const getModalWrapper = () => {
    if (!host) {
        host = fn.div({
            classNames: ["sb-modal-system", "sb-modal-open"],
            data: {
                ui: modalHostKey,
            },
            content: fn.div({
                classNames: ["sb-modal-scrim"],
                content: fn.div({
                    classNames: ["sb-modal-wrapper"],
                }),
            }),
        });
        // Close on click outside the pop-up. Bound once, survives removal and re-insertion of the host.
        host.addEventListener("pointerup", (evt) => {
            if (current && !current.ui.contains(evt.target)) {
                current.toggle(false);
            }
        });
    }
    return fn.$(".sb-modal-wrapper", host);
};

/**
 * Builder for SBA pop-ups, mimics the look of the pop-ups in Spelling Bee
 */
class PopupBuilder {
    /**
     * Whether this pop-up is currently displayed
     * @returns {Boolean}
     */
    get isOpen() {
        return current === this && !!host && host.isConnected;
    }

    /**
     * Register the document-wide listeners, once for all pop-ups
     * @param {App} app
     */
    static init(app) {
        if (appRef) {
            return;
        }
        appRef = app;
        document.addEventListener("keyup", onKeyUp);
        app.on(prefix("destroy"), () => {
            document.removeEventListener("keyup", onKeyUp);
            if (host) {
                host.remove();
            }
            current = null;
        });
    }

    /**
     * Get a reference to the `<template>` that holds the pop-ups while idle
     * Create one if it doesn't exist yet
     * @returns {*}
     */
    getTarget() {
        const dataUi = prefix("popup-container", "d");
        let container = fn.$(`[data-ui="${dataUi}"]`);
        if (!container) {
            container = fn.template({
                data: {
                    ui: dataUi,
                },
            });
            fn.$("body").append(container);
        }
        return container;
    }

    /**
     * Create a pop-up, this mimics the pop-ups already available in Spelling Bee
     * @returns {HTMLElement}
     */
    create() {
        return fn.div({
            classNames: ["sb-modal-frame", prefix("pop-up", "d")],
            aria: {
                role: "button",
            },
            data: {
                ui: this.key,
            },
            events: {
                click: (e) => {
                    e.stopPropagation();
                },
            },
            content: [
                fn.div({
                    classNames: ["sb-modal-top"],
                    content: fn.div({
                        aria: {
                            role: "button",
                        },
                        classNames: ["sb-modal-close"],
                        content: "×",
                        events: {
                            click: () => {
                                this.toggle(false);
                            },
                        },
                    }),
                }),
                fn.div({
                    classNames: ["sb-modal-content"],
                    content: [
                        fn.div({
                            classNames: ["sb-modal-header"],
                            content: [this.parts.title, this.parts.subtitle],
                        }),
                        this.parts.body,
                        this.parts.footer,
                    ],
                }),
            ],
        });
    }

    /**
     * Set any part of the content of the popup
     * @param {String} part
     * @param {Element|NodeList|Array|String} content
     */
    setContent(part, content) {
        if (!this.parts[part]) {
            console.error(`Unknown target ${part}`);
            return this;
        }
        this.parts[part] = fn.empty(this.parts[part]);
        this.parts[part].append(fn.toNode(content));
        return this;
    }

    /**
     * Open/close pop-up
     * @param {Boolean} state
     * @returns {PopupBuilder}
     */
    toggle(state) {
        if (state) {
            // another SBA pop-up is open: swap content, keep the scaffold
            if (current && current !== this) {
                current.getTarget().append(current.ui);
            }
            // a NYT modal is open: close it
            const nytCloser = findNytCloseButton(this.app);
            if (nytCloser) {
                nytCloser.click();
            }
            // fill the wrapper before attaching the scaffold, so the observer sees one mutation only
            getModalWrapper().append(this.ui);
            if (!host.isConnected) {
                const contentBox = fn.$(".sb-content-box", this.app.gameWrapper);
                if (contentBox) {
                    contentBox.after(host);
                } else {
                    this.app.gameWrapper.append(host);
                }
            }
            current = this;
        } else if (current === this) {
            this.getTarget().append(this.ui);
            host.remove();
            current = null;
        }
        return this;
    }

    /**
     * Build an instance
     * @param {App} app
     * @param {String} key
     */
    constructor(app, key) {
        this.key = key;

        this.app = app;

        PopupBuilder.init(app);

        this.parts = {
            title: fn.h3({
                classNames: ["sb-modal-title"],
            }),

            subtitle: fn.p({
                classNames: ["sb-modal-message"],
            }),

            body: fn.div({
                classNames: ["sb-modal-body"],
            }),

            footer: fn.div({
                classNames: ["sb-modal-message", "sba-modal-footer"],
                content: [
                    fn.a({
                        content: settings.get("label"),
                        attributes: {
                            href: settings.get("url"),
                            target: prefix(),
                        },
                    }),
                ],
            }),
        };

        this.ui = this.create();

        this.getTarget().append(this.ui);
    }
}

export default PopupBuilder;
