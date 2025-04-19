/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import settings from "../modules/settings.js";
import fn from "fancy-node";
import { findCloseButton } from "../utils/popup.ui.js";

/**
 * Plugin base class
 */
class PopupBuilder {
    /**
     * Enable closing the popup by clicking on the x button
     * @returns {PopupBuilder}
     */
    enableKeyClose() {
        document.addEventListener("keyup", (evt) => {
            const popupCloser = findCloseButton(this.app);
            if (popupCloser && evt.code === "Escape") {
                popupCloser.click();
            }
        });
        return this;
    }

    /**
     * Enable closing the popup by clicking on the x button
     * @returns {PopupBuilder}
     */
    enableCanvasClose() {
        this.app.modalWrapper.addEventListener("pointerup", (evt) => {
            const inner = fn.$(".sb-modal-frame", this.app.modalWrapper);
            if (inner && !inner.contains(evt.target)) {
                findCloseButton(this.app).click();
            }
        });
        return this;
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
     * Open/close popup
     * @param state
     * @returns {PopupBuilder}
     */
    toggle(state) {
        const closer = findCloseButton(this.app);

        // some other popup
        if(!this.isOpen && closer) {
            closer.click();
        }

        // force close self
        if (!state && closer) {
            closer.click();
        }

        if (state) {
            this.app.modalWrapper.append(this.ui);
            this.modalSystem.classList.add("sb-modal-open");
            this.isOpen = true;
        } else {
            this.getTarget().append(this.ui);
            this.modalSystem.classList.remove("sb-modal-open");
            this.isOpen = false;
        }

        return this;
    }

    /**
     * Build an instance
     * @param app
     * @param key
     */
    constructor(app, key) {
        this.key = key;

        this.app = app;

        this.isOpen = false;

        this.modalSystem = this.app.modalWrapper.closest(".sb-modal-system");

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

        this.enableKeyClose().enableCanvasClose();

        this.getTarget().append(this.ui);
    }
}

export default PopupBuilder;
