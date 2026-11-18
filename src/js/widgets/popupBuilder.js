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

/**
 * All pop-ups, used to close them on `destroy` and to answer `PopupBuilder.isAnyOpen()`
 * @type {Set<PopupBuilder>}
 */
const instances = new Set();

/**
 * Minimum distance between a pinned pop-up and the edge of the viewport
 * @type {Number}
 */
const viewportMargin = 8;

/**
 * Builder for SBA pop-ups.
 *
 * Pop-ups use the Popover API: they live in the browser's top layer, independent of the NYT's DOM.
 * `popover="auto"` brings closing by Escape or by clicking outside and allows only one open pop-up at a time.
 * Pinnable pop-ups switch to `popover="manual"` while pinned: they stay open, don't block the game
 * and can be dragged by their title bar. Pinning is not available on mobile.
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
     * Close all SBA pop-ups that close with a click outside, i.e. all but the pinned ones
     * @returns {Boolean} true if a pop-up has been closed
     */
    static closeAll() {
        let closed = false;
        instances.forEach((popup) => {
            if (popup.isOpen && !popup.isPinned) {
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
     * Whether this pop-up is pinned
     * @returns {Boolean}
     */
    get isPinned() {
        return this.ui.classList.contains(prefix("pinned", "d"));
    }

    /**
     * Settings key for this pop-up
     * @param {String} name
     * @returns {String}
     */
    settingsKey(name) {
        return `options.${this.key}.popup.${name}`;
    }

    /**
     * Create the pop-up, this mimics the pop-ups available in Spelling Bee
     * @returns {HTMLElement}
     */
    create() {
        const topButtons = [
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

        if (this.pinnable) {
            topButtons.unshift(
                fn.button({
                    attributes: {
                        type: "button",
                        title: "Pin – keep open and move freely",
                    },
                    aria: {
                        label: "Pin",
                        pressed: "false",
                    },
                    classNames: [prefix("pin", "d")],
                    content: "📌",
                    events: {
                        click: () => this.pin(!this.isPinned),
                    },
                }),
            );
        }

        return fn.div({
            attributes: {
                id: this.id,
                popover: "auto",
            },
            aria: {
                role: "dialog",
            },
            classNames: [prefix("popover", "d")],
            data: {
                ui: this.key,
            },
            events: {
                beforetoggle: (evt) => this.onBeforeToggle(evt),
                toggle: (evt) => this.onToggle(evt),
            },
            content: fn.div({
                classNames: ["sb-modal-frame", prefix("pop-up", "d")],
                content: [
                    fn.div({
                        classNames: ["sb-modal-top"],
                        content: topButtons,
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
        if (this.isPinned) {
            const position = settings.get(this.settingsKey("position"));
            if (position) {
                this.ui.style.left = `${position.x}px`;
                this.ui.style.top = `${position.y}px`;
            }
        }
    }

    /**
     * After opening or closing: keep pinned pop-ups inside the viewport, remember whether they were open
     * @param {ToggleEvent} evt
     */
    onToggle(evt) {
        if (!this.pinnable) {
            return;
        }
        if (evt.newState === "open" && this.isPinned) {
            this.applyPosition(settings.get(this.settingsKey("position")));
        }
        settings.set(this.settingsKey("open"), evt.newState === "open");
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
     * Pin or unpin the pop-up
     * @param {Boolean} state
     * @returns {PopupBuilder}
     */
    pin(state) {
        if (!this.pinnable || state === this.isPinned) {
            return this;
        }
        const wasOpen = this.isOpen;
        // the type of popover can only be changed while it is hidden
        if (wasOpen) {
            this.ui.hidePopover();
        }
        this.ui.setAttribute("popover", state ? "manual" : "auto");
        this.ui.classList.toggle(prefix("pinned", "d"), state);
        fn.$(`.${prefix("pin", "d")}`, this.ui)?.setAttribute("aria-pressed", String(state));
        if (!state) {
            this.ui.style.removeProperty("left");
            this.ui.style.removeProperty("top");
        }
        settings.set(this.settingsKey("pinned"), state);
        if (wasOpen) {
            this.toggle(true);
        }
        return this;
    }

    /**
     * Move a pinned pop-up, keeping it inside the viewport.
     * Without a position it goes to the top right corner.
     * @param {{x: Number, y: Number}|undefined} position
     * @returns {{x: Number, y: Number}}
     */
    applyPosition(position) {
        const rect = this.ui.getBoundingClientRect();
        const maxX = Math.max(viewportMargin, window.innerWidth - rect.width - viewportMargin);
        const maxY = Math.max(viewportMargin, window.innerHeight - rect.height - viewportMargin);
        const x = Math.min(Math.max(position?.x ?? maxX, viewportMargin), maxX);
        const y = Math.min(Math.max(position?.y ?? 80, viewportMargin), maxY);
        this.ui.style.left = `${x}px`;
        this.ui.style.top = `${y}px`;
        return { x, y };
    }

    /**
     * Drag a pinned pop-up by its title bar
     * @returns {PopupBuilder}
     */
    enableDragging() {
        const handle = fn.$(".sb-modal-top", this.ui);
        let start = null;
        let position = null;

        handle.addEventListener("pointerdown", (evt) => {
            if (!this.isPinned || evt.button !== 0 || evt.target.closest("button")) {
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
            position = this.applyPosition({
                x: start.x + evt.clientX - start.pointerX,
                y: start.y + evt.clientY - start.pointerY,
            });
        });

        const stop = () => {
            if (!start) {
                return;
            }
            start = null;
            this.ui.classList.remove(prefix("dragging", "d"));
            if (position) {
                settings.set(this.settingsKey("position"), { x: Math.round(position.x), y: Math.round(position.y) });
            }
        };
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);

        return this;
    }

    /**
     * Restore the pinned state from the last session
     * @returns {PopupBuilder}
     */
    restore() {
        if (!settings.get(this.settingsKey("pinned"))) {
            return this;
        }
        this.pin(true);
        if (settings.get(this.settingsKey("open"))) {
            this.toggle(true);
        }
        return this;
    }

    /**
     * Build an instance
     * @param {App} app
     * @param {String} key
     * @param {Object} [options]
     * @param {Boolean} [options.pinnable=false] Whether the pop-up can be pinned (desktop only)
     */
    constructor(app, key, { pinnable = false } = {}) {
        this.key = key;

        /**
         * Id of the pop-up, can be used with `popovertarget`
         * @type {String}
         */
        this.id = prefix(`popover-${key}`, "d");

        this.app = app;

        this.state = "closed";

        this.pinnable = pinnable && !app.envIs("mobile");

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

        if (this.pinnable) {
            this.enableDragging();
        }

        document.body.append(this.ui);
        instances.add(this);

        app.on(prefix("destroy"), () => {
            this.ui.remove();
            instances.delete(this);
        });
    }
}

export default PopupBuilder;
