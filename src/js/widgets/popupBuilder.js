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
import icon from "../utils/icons.js";
import breakpoints from "../../config/breakpoints.json" with { type: "json" };

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
 * Below this width pop-ups take the full width (like NYT modals), dragging makes no sense there.
 * Shared with the CSS, see src/config/breakpoints.json.
 * @type {String}
 */
const smallScreen = breakpoints["--config-small-screen"];

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
 * On screens narrower than 768px there's no room for a window: floating pop-ups behave like regular ones there.
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
            if (popup.isOpen && !popup.isFloating) {
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
     * Whether this pop-up currently behaves as a window: floating pop-ups on screens 768px and wider
     * @returns {Boolean}
     */
    get isFloating() {
        return this.ui.getAttribute("popover") === "manual";
    }

    /**
     * Floating pop-ups are windows on large screens and regular pop-ups on small ones.
     * The type of popover can only be changed while it is hidden; an open pop-up switches when it closes.
     * @returns {PopupBuilder}
     */
    applyMode() {
        if (!this.floating || this.isOpen) {
            return this;
        }
        const type = this.canDrag() ? "manual" : "auto";
        if (this.ui.getAttribute("popover") !== type) {
            this.ui.setAttribute("popover", type);
        }
        return this;
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
                // floating pop-ups use icons of the same size for moving and closing, so they line up
                content: this.floating ? icon("close") : "×",
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
                ...(this.moveHint
                    ? [
                          fn.span({
                              classNames: [prefix("move-hint", "d")],
                              content: this.moveHint,
                          }),
                      ]
                    : []),
                fn.span({
                    attributes: {
                        title: "Drag to move",
                    },
                    aria: {
                        hidden: "true",
                    },
                    classNames: [prefix("move-handle", "d")],
                    content: icon("move"),
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
                // a pending switch between window and regular pop-up, see applyMode()
                // on open: crisp icons, see snapIcons()
                toggle: (evt) => (evt.newState === "closed" ? this.applyMode() : this.snapIcons()),
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
        this.snapIcons();
        return this.position;
    }

    /**
     * Shift the title bar icons onto whole device pixels.
     * The icons are drawn on a 16px grid, but a centered pop-up or the text before them
     * easily puts them at x.5, which blurs every edge.
     * @returns {PopupBuilder}
     */
    snapIcons() {
        const ratio = window.devicePixelRatio || 1;
        this.ui.querySelectorAll(".sb-modal-top svg").forEach((svg) => {
            svg.style.removeProperty("translate");
            const rect = svg.getBoundingClientRect();
            if (!rect.width) {
                return;
            }
            const dx = Math.round(rect.left * ratio) / ratio - rect.left;
            const dy = Math.round(rect.top * ratio) / ratio - rect.top;
            if (dx || dy) {
                svg.style.translate = `${dx.toFixed(3)}px ${dy.toFixed(3)}px`;
            }
        });
        return this;
    }

    /**
     * Dragging only makes sense on screens wide enough to have room next to the pop-up
     * @returns {Boolean}
     */
    canDrag() {
        return !window.matchMedia?.(smallScreen).matches;
    }

    /**
     * Whether the pop-up lies over the middle of the viewport
     * @returns {Boolean}
     */
    coversViewportCenter() {
        const rect = this.ui.getBoundingClientRect();
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        return rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y;
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
        this.snapIcons();
        return this;
    }

    /**
     * The user has found out about moving, the hint is gone for good
     * @returns {PopupBuilder}
     */
    dismissMoveHint() {
        if (this.moveHint) {
            this.moveHint = "";
            fn.$(`.${prefix("move-hint", "d")}`, this.ui)?.remove();
            settings.set(`options.${this.key}.moveHintSeen`, true);
        }
        return this;
    }

    /**
     * Drag a floating pop-up by its title bar.
     * On the first move, the centered pop-up turns into a compact window at the same place.
     * Restoring the centered pop-up, both undocumented:
     * - a double click on the title bar, like with windows on the desktop
     * - dropping the window on the middle of the viewport
     * @returns {PopupBuilder}
     */
    enableDragging() {
        const handle = fn.$(".sb-modal-top", this.ui);
        let start = null;
        let dragged = false;

        handle.addEventListener("pointerdown", (evt) => {
            if (!this.canDrag() || evt.button !== 0 || evt.target.closest("button")) {
                return;
            }
            const rect = this.ui.getBoundingClientRect();
            start = { pointerX: evt.clientX, pointerY: evt.clientY, x: rect.left, y: rect.top };
            dragged = false;
            handle.setPointerCapture?.(evt.pointerId);
            this.ui.classList.add(prefix("dragging", "d"));
            evt.preventDefault();
        });

        handle.addEventListener("pointermove", (evt) => {
            if (!start) {
                return;
            }
            dragged = true;
            this.dismissMoveHint();
            if (!this.ui.classList.contains(prefix("moved", "d"))) {
                this.ui.classList.add(prefix("moved", "d"));
            }
            this.moveTo({
                x: start.x + evt.clientX - start.pointerX,
                y: start.y + evt.clientY - start.pointerY,
            });
        });

        const stop = () => {
            if (start && dragged && this.coversViewportCenter()) {
                this.resetPosition();
            }
            start = null;
            dragged = false;
            this.ui.classList.remove(prefix("dragging", "d"));
        };
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);

        handle.addEventListener("dblclick", (evt) => {
            if (this.canDrag() && !evt.target.closest("button")) {
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
        if (evt.key !== "Escape" || !this.isOpen || !this.isFloating) {
            return;
        }
        const regularOpen = [...instances].some((popup) => !popup.isFloating && popup.isOpen);
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
     * @param {String} [options.moveHint] Floating only: label next to the move handle,
     *                                    shown on wide screens until the pop-up has been moved once
     */
    constructor(app, key, { floating = false, moveHint = "" } = {}) {
        this.key = key;

        /**
         * Id of the pop-up, can be used with `popovertarget`
         * @type {String}
         */
        this.id = prefix(`popover-${key}`, "d");

        this.app = app;

        this.state = "closed";

        this.floating = floating;

        this.moveHint = floating && !settings.get(`options.${key}.moveHintSeen`) ? moveHint : "";

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
            this.applyMode();
            this.smallScreenQuery = window.matchMedia?.(smallScreen);
            this.onScreenChange = () => this.applyMode();
            this.smallScreenQuery?.addEventListener?.("change", this.onScreenChange);
        }

        document.body.append(this.ui);
        instances.add(this);

        // a centered pop-up moves with the viewport, so do its icons
        this.onResize = () => this.isOpen && this.snapIcons();
        window.addEventListener("resize", this.onResize);

        app.on(prefix("destroy"), () => {
            document.removeEventListener("keydown", this.onKeyDown, true);
            window.removeEventListener("resize", this.onResize);
            this.smallScreenQuery?.removeEventListener?.("change", this.onScreenChange);
            this.ui.remove();
            instances.delete(this);
        });
    }
}

export default PopupBuilder;
