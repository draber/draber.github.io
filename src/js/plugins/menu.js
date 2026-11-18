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
 * The button lives in the NYT toolbar, the list of entries is a popover in the browser's top layer.
 * This way the list can't be covered by the assistant or anything else on the page.
 *
 * @param {App} app
 * @returns {Plugin} Menu
 */
class Menu extends Plugin {
    /**
     * Attach the button to the toolbar. On mobile the toolbar is only rendered when the navigation shows it.
     * @returns {Menu}
     */
    add() {
        if (!this.app.envIs("mobile")) {
            return super.add();
        }

        const navContainer = nyt.getGlobalNav();
        if (!navContainer || nyt.isMobileToolbarVisible(navContainer)) {
            return super.add();
        }

        const observer = new MutationObserver(() => {
            if (nyt.isMobileToolbarVisible(navContainer)) {
                observer.disconnect();
                this.target = nyt.getToolbar();
                super.add();
            }
        });
        observer.observe(navContainer, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return this;
    }

    /**
     * Put the text of the SBA button and of the NYT's "More" dropdown on the same line as the other toolbar buttons.
     * "More" sits a little lower (Nov 2026), the SBA button borrows its class and comes close.
     * Both are measured against "Stats" and corrected separately; the corrections become 0 once the NYT fixes it.
     * Measured again once the fonts have loaded, they change the baseline.
     * @returns {Menu}
     */
    alignWithToolbar() {
        if (this.app.envIs("mobile")) {
            return this;
        }
        // on <body>, the NYT may re-render the toolbar and drop inline styles there
        const targets = {
            "--sba-dropdown-offset": () => nyt.getDropdownButton(),
            "--sba-menu-offset": () => this.ui,
        };
        const align = () => {
            // reset first, otherwise the measurement includes the previous correction
            Object.keys(targets).forEach((property) => document.body.style.removeProperty(property));
            Object.entries(targets).forEach(([property, getElem]) => {
                const offset = nyt.getToolbarOffset(getElem());
                if (offset) {
                    document.body.style.setProperty(property, `${-offset}px`);
                }
            });
        };
        requestAnimationFrame(align);
        document.fonts?.ready.then(() => requestAnimationFrame(align));
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
        this.target = nyt.getToolbar();
        // has to be `after` rather than `append` because the NYT rebuilds the mobile toolbar on almost every click
        if (this.app.envIs("mobile")) {
            this.addMethod = "after";
        }
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
            classNames: ["pz-toolbar-button__sba"].concat(
                this.app.envIs("mobile")
                    ? [nyt.borrowedClassNames.mobileToolbarItem]
                    : [nyt.borrowedClassNames.toolbarButton, nyt.borrowedClassNames.dropdownButton],
            ),
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

        app.on(prefix("pluginsReady"), () => this.alignWithToolbar());

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
            document.body.style.removeProperty("--sba-dropdown-offset");
            document.body.style.removeProperty("--sba-menu-offset");
            document.removeEventListener("keyup", this.onKeyUp);
            this.ui.remove();
            this.pane.remove();
        });
    }
}

export default Menu;
