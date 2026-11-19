/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";
import { prefix } from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import iconWarning from "../assets/warning.svg";
import iconCoffee from "../assets/kofi.svg";
import iconNew from "../assets/new.svg";
import iconBee from "../assets/sba-bee.svg";
import fn from "fancy-node";
import nyt from "../nyt/nyt.js";
import newItems from "../utils/newItems.js";

const svgIcons = {
    warning: iconWarning,
    coffee: iconCoffee,
    new: iconNew,
    bee: iconBee,
};

newItems.ensureInstallDate();
if (!newItems.shouldHighlightNewItems()) {
    delete svgIcons.new;
}

/**
 * Distance between menu button and menu pane, only used without CSS anchor positioning
 * @type {Number}
 */
const paneOffset = 6;

/**
 * CSS anchor positioning places the pane, see `[data-ui="submenu"]` in _sba.scss.
 * Baseline since January 2026, older browsers fall back to `positionPane()`.
 * @type {Boolean}
 */
const supportsAnchors = !!globalThis.CSS?.supports?.("anchor-name: --sba-menu");

/**
 * Menu plugin
 *
 * The button joins the NYT toolbar, right after "More", and looks like the other toolbar buttons.
 * The list of entries is a popover in the browser's top layer, it can't be covered by anything on the page.
 *
 * @param {App} app
 * @returns {Plugin} Menu
 */
class Menu extends Plugin {
    /**
     * Make sure the button is the last item of the toolbar on screen.
     * The NYT re-renders its toolbars (on almost every click on mobile) and switches between the desktop and the
     * mobile toolbar by viewport width. Moving the button only when necessary keeps this from looping.
     * @returns {Menu}
     */
    ensure() {
        // copies without listeners, e.g. from a toolbar re-rendered via innerHTML
        fn.$$(".pz-toolbar-button__sba").forEach((elem) => {
            if (elem !== this.ui) {
                elem.remove();
            }
        });
        const toolbar = nyt.getToolbar();
        if (toolbar && toolbar.lastElementChild !== this.ui) {
            toolbar.append(this.ui);
        }
        return this;
    }

    /**
     * Attach the button to the toolbar and keep it there.
     * Replaces waiting for the mobile toolbar, which was prone to timing issues.
     * @returns {Menu}
     */
    add() {
        this.ensure();
        this.observer = new MutationObserver(() => this.ensure());
        nyt.getToolbarHosts().forEach((host) => {
            this.observer.observe(host, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["class"],
            });
        });
        // switching between desktop and mobile toolbar can be CSS only, without DOM changes
        let timer;
        this.onResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => this.ensure(), 150);
        };
        window.addEventListener("resize", this.onResize);
        return this;
    }

    /**
     * Get plugin or app from clicked entry
     * @param {HTMLElement} entry
     * @returns {Plugin|App|null}
     */
    getComponent(entry) {
        if (entry.dataset.component === this.app.key) {
            return this.app;
        }
        if (this.app.plugins.has(entry.dataset.component)) {
            return this.app.plugins.get(entry.dataset.component);
        }
        return null;
    }

    /**
     * Place the pane below the button, right-aligned, inside the viewport.
     * Fallback for browsers without CSS anchor positioning.
     */
    positionPane() {
        const rect = this.ui.getBoundingClientRect();
        this.pane.style.top = `${Math.round(rect.bottom + paneOffset)}px`;
        this.pane.style.right = `${Math.max(paneOffset, Math.round(window.innerWidth - rect.right))}px`;
    }

    /**
     * Run the action of a menu entry
     * @param {MouseEvent} evt
     */
    handleEntry(evt) {
        const entry = evt.target.closest("li");
        // links take care of themselves
        if (!entry || evt.target.closest("a")) {
            this.pane.hidePopover();
            return;
        }
        const component = this.getComponent(entry);
        this.pane.hidePopover();
        switch (entry.dataset.action) {
            case "boolean":
                component.toggle();
                entry.classList.toggle("checked", component.getState());
                break;
            case "popup":
                component.togglePopup();
                break;
        }
    }

    /**
     * Build a menu entry for a plugin
     * @param {Plugin} plugin
     * @param {String} key
     * @returns {HTMLElement}
     */
    buildEntry(plugin, key) {
        const icon = plugin.menu.icon || null;
        const data = {
            component: key,
            action: plugin.menu.action,
        };
        const classNames = [];
        if (plugin.menu.action === "boolean") {
            data.icon = "checkmark";
            if (plugin.getState()) {
                classNames.push("checked");
            }
        } else if (icon) {
            data.icon = icon;
        }
        return fn.li({
            classNames,
            attributes: {
                title: fn.toNode(plugin.description).textContent,
            },
            data,
            content: icon && svgIcons[icon] ? [svgIcons[icon], plugin.title] : plugin.title,
        });
    }

    /**
     * Menu constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Menu", "");
        const paneId = prefix("menu-pane", "d");
        this.paneOpen = false;

        /**
         * List of options
         */
        this.pane = fn.ul({
            attributes: {
                id: paneId,
                popover: "auto",
            },
            classNames: ["pane"],
            data: {
                ui: "submenu",
            },
            events: {
                click: (evt) => this.handleEntry(evt),
                beforetoggle: (evt) => {
                    this.paneOpen = evt.newState === "open";
                    this.pane.dataset[prefix("open")] = this.paneOpen;
                    this.ui.classList.toggle(prefix("open", "d"), this.paneOpen);
                    if (this.paneOpen) {
                        newItems.markSeen();
                        if (!supportsAnchors) {
                            this.positionPane();
                        }
                    }
                },
            },
            content: fn.li({
                classNames: this.app.getState() ? ["checked"] : [],
                attributes: {
                    title: this.app.title,
                },
                data: {
                    component: this.app.key,
                    icon: "checkmark",
                    action: "boolean",
                },
                content: `Show ${settings.get("title")}`,
            }),
        });

        this.ui = fn.button({
            attributes: {
                type: "button",
                popovertarget: paneId,
            },
            aria: {
                haspopup: "menu",
            },
            data: {
                ui: this.key,
            },
            // same class as Stats and Yesterday, so it looks and sits like them
            classNames: ["pz-toolbar-button", "pz-toolbar-button__sba"],
            content: fn.span({
                attributes: {
                    id: prefix("menu-entry-point", "d"),
                },
                content: settings.get("title"),
            }),
        });

        document.body.append(this.pane);

        // letters, digits and Enter go to the game, the menu is in the way then
        this.onKeyUp = (evt) => {
            if (/^(Ent|Key|Dig)/.test(evt.code) && this.paneOpen) {
                this.pane.hidePopover();
            }
        };
        document.addEventListener("keyup", this.onKeyUp);

        app.on(prefix("pluginsReady"), (evt) => {
            evt.detail.forEach((plugin, key) => {
                if (plugin.menu?.action) {
                    this.pane.append(this.buildEntry(plugin, key));
                }
            });
            this.pane.append(
                fn.li({
                    attributes: {
                        title: settings.get("support.text"),
                    },
                    data: {
                        icon: prefix(),
                        component: prefix("web"),
                        action: "link",
                    },
                    content: fn.a({
                        content: [iconCoffee, settings.get("support.text")],
                        attributes: {
                            href: settings.get("support.url"),
                            target: prefix(),
                        },
                    }),
                }),
            );
            this.ui.classList.toggle(prefix("has-new", "d"), !!fn.$('[data-icon="new"] svg', this.pane));
        });

        app.on(prefix("destroy"), () => {
            this.observer?.disconnect();
            window.removeEventListener("resize", this.onResize);
            document.removeEventListener("keyup", this.onKeyUp);
            this.ui.remove();
            this.pane.remove();
        });
    }
}

export default Menu;
