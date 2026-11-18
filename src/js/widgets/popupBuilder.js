/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import settings from "../modules/settings.js";
import fn from "fancy-node";
import nyt from "../nyt/nyt.js";
import moveIcon from "../assets/move.svg";

/**
 * All pop-ups, used to answer `PopupBuilder.isAnyOpen()` and for `PopupBuilder.closeAll()`
 * @type {Set<PopupBuilder>}
 */
const instances = new Set();

/**
 * Minimum distance between a moved pop-up and the edge of the viewport
 * @type {Number}
 */
const viewportMargin = 8;

/**
 * Builder for SBA pop-ups.
 *
 * Pop-ups use the Popover API: they live in the browser's top layer, independent of the NYT's DOM.
 *
 * Regular pop-ups are `popover="auto"`: they close with Escape or a click outside,
 * and only one of them is open at a time.
 *
 * Floating pop-ups are `popover="manual"`, like a window: no backdrop, the game stays usable,
 * they close only with × or Escape and stay open when other pop-ups open. They can be dragged by their
 * title bar; once moved, they turn into a compact window with a small title. The position is kept
 * until the page is reloaded.
 *
 * The markup mimics the pop-ups of Spelling Bee.
 */
class PopupBuilder {
    /**
     * Whether any SBA pop-up is open
     * @returns {Boolean}
     */
    static isAnyOpen() {
        return [...instances].some((popup) => popup.isOpen);
    }

    /**
     * Close all regular SBA pop-ups, floating ones stay open
     * @returns {Boolean} true if a pop-up has been closed
     */
    static closeAll() {
        let closed = false;
        instances.forEach((popup) => {
            if (popup.isOpen && !popup.floating) {
                popup.toggle(false);
                closed = true;
            }
        });
        return closed;
    }

    /**
     * Whether this pop-up is currently displayed
     * @returns {Boolean}
     */
    get isOpen() {
        return this.state === "open" && this.ui.isConnected;
    }

    /**
     * Whether this floating pop-up has been moved and is shown as compact window
     * @returns {Boolean}
     */
    get isMoved() {
        return !!this.position;
    }

    /**
     * Create the pop-up, this mimics the pop-ups available in Spelling Bee
     * @returns {HTMLElement}
     */
    create() {
        const topBar = [
            fn.button({
                attributes: {
                    type: "button",
                    title: "Close",
                },
                aria: {
                    label: "Close",
                },
                classNames: ["sb-modal-close"],
                content: "×",
                events: {
                    click: () => this.toggle(false),
                },
            }),
        ];

        if (this.floating) {
            topBar.unshift(
                fn.span({
                    classNames: [prefix("window-title", "d")],
                }),
                fn.span({
                    attributes: {
                        title: "Drag to move",
                    },
                    aria: {
                        hidden: "true",
                    },
                    classNames: [prefix("move-handle", "d")],
                    content: moveIcon,
                }),
            );
        }

        return fn.div({
            attributes: {
                id: this.id,
                popover: this.floating ? "manual" : "auto",
            },
            aria: {
                role: "dialog",
            },
            classNames: [prefix("popover", "d")].concat(this.floating ? [prefix("floating", "d")] : []),
            data: {
                ui: this.key,
            },
            events: {
                beforetoggle: (evt) => this.onBeforeToggle(evt),
            },
            content: fn.div({
                classNames: ["sb-modal-frame", prefix("pop-up", "d")],
                content: [
                    fn.div({
                        classNames: ["sb-modal-top"],
                        content: topBar,
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
            }),
        });
    }

    /**
     * Set any part of the content of the popup
     * @param {String} part `title`, `subtitle`, `body` or `footer`
     * @param {Element|NodeList|Array|String} content
     * @returns {PopupBuilder}
     */
    setContent(part, content) {
        if (!this.parts[part]) {
            console.error(`Unknown target ${part}`);
            return this;
        }
        this.parts[part] = fn.empty(this.parts[part]);
        this.parts[part].append(fn.toNode(content));
        // the compact window shows the title in its title bar
        if (part === "title" && this.floating) {
            fn.$(`.${prefix("window-title", "d")}`, this.ui).textContent = this.parts.title.textContent;
        }
        return this;
    }

    /**
     * Pop-ups open and close in several ways: `toggle()`, buttons with `popovertarget`, Escape, a click outside.
     * Everything that has to happen on opening is therefore done here.
     * @param {ToggleEvent} evt
     */
    onBeforeToggle(evt) {
        this.state = evt.newState;
        if (evt.newState !== "open") {
            return;
        }
        // SBA pop-ups replace an open NYT modal, the way NYT modals replace each other
        nyt.closeModal();
        if (this.isMoved) {
            this.ui.style.left = `${this.position.x}px`;
            this.ui.style.top = `${this.position.y}px`;
        }
    }

    /**
     * Open/close pop-up
     * @param {Boolean} state
     * @returns {PopupBuilder}
     */
    toggle(state) {
        if (state === this.isOpen) {
            return this;
        }
        if (state) {
            this.ui.showPopover();
        } else {
            this.ui.hidePopover();
        }
        return this;
    }

    /**
     * Move a floating pop-up, keeping it inside the viewport
     * @param {{x: Number, y: Number}} position
     * @returns {{x: Number, y: Number}} the position actually applied
     */
    moveTo(position) {
        const rect = this.ui.getBoundingClientRect();
        const maxX = Math.max(viewportMargin, window.innerWidth - rect.width - viewportMargin);
        const maxY = Math.max(viewportMargin, window.innerHeight - rect.height - viewportMargin);
        this.position = {
            x: Math.round(Math.min(Math.max(position.x, viewportMargin), maxX)),
            y: Math.round(Math.min(Math.max(position.y, viewportMargin), maxY)),
        };
        this.ui.style.left = `${this.position.x}px`;
        this.ui.style.top = `${this.position.y}px`;
        return this.position;
    }

    /**
     * Back to the centered pop-up with title, description and footer
     * @returns {PopupBuilder}
     */
    resetPosition() {
        this.position = null;
        this.ui.classList.remove(prefix("moved", "d"));
        this.ui.style.removeProperty("left");
        this.ui.style.removeProperty("top");
        return this;
    }

    /**
     * Drag a floating pop-up by its title bar.
     * On the first move, the centered pop-up turns into a compact window at the same place.
     * A double click on the title bar restores the centered pop-up, like with windows on the desktop.
     * @returns {PopupBuilder}
     */
    enableDragging() {
        const handle = fn.$(".sb-modal-top", this.ui);
        let start = null;

        handle.addEventListener("pointerdown", (evt) => {
            if (evt.button !== 0 || evt.target.closest("button")) {
                return;
            }
            const rect = this.ui.getBoundingClientRect();
            start = { pointerX: evt.clientX, pointerY: evt.clientY, x: rect.left, y: rect.top };
            handle.setPointerCapture?.(evt.pointerId);
            this.ui.classList.add(prefix("dragging", "d"));
            evt.preventDefault();
        });

        handle.addEventListener("pointermove", (evt) => {
            if (!start) {
                return;
            }
            if (!this.ui.classList.contains(prefix("moved", "d"))) {
                this.ui.classList.add(prefix("moved", "d"));
            }
            this.moveTo({
                x: start.x + evt.clientX - start.pointerX,
                y: start.y + evt.clientY - start.pointerY,
            });
        });

        const stop = () => {
            start = null;
            this.ui.classList.remove(prefix("dragging", "d"));
        };
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);

        handle.addEventListener("dblclick", (evt) => {
            if (!evt.target.closest("button")) {
                this.resetPosition();
            }
        });

        return this;
    }

    /**
     * Escape closes floating pop-ups, unless something else is on top that Escape is meant for:
     * a regular SBA pop-up, the SBA menu or a NYT modal. Those close first.
     * Runs in the capture phase, before the browser closes a regular pop-up.
     * @param {KeyboardEvent} evt
     */
    onKeyDown = (evt) => {
        if (evt.key !== "Escape" || !this.isOpen) {
            return;
        }
        const regularOpen = [...instances].some((popup) => !popup.floating && popup.isOpen);
        const menuOpen = !!fn.$('[data-ui="submenu"][data-sba-open="true"]');
        if (!regularOpen && !menuOpen && !nyt.findModalCloser()) {
            this.toggle(false);
        }
    };

    /**
     * Build an instance
     * @param {App} app
     * @param {String} key
     * @param {Object} [options]
     * @param {Boolean} [options.floating=false] A window rather than a modal, see class description
     */
    constructor(app, key, { floating = false } = {}) {
        this.key = key;

        /**
         * Id of the pop-up, can be used with `popovertarget`
         * @type {String}
         */
        this.id = prefix(`popover-${key}`, "d");

        this.app = app;

        this.state = "closed";

        this.floating = floating;

        /**
         * Position of a moved floating pop-up, kept until the page is reloaded
         * @type {{x: Number, y: Number}|null}
         */
        this.position = null;

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
                classNames: ["sb-modal-message", prefix("modal-footer", "d")],
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

        if (this.floating) {
            this.enableDragging();
            document.addEventListener("keydown", this.onKeyDown, true);
        }

        document.body.append(this.ui);
        instances.add(this);

        app.on(prefix("destroy"), () => {
            document.removeEventListener("keydown", this.onKeyDown, true);
            this.ui.remove();
            instances.delete(this);
        });
    }
}

export default PopupBuilder;
