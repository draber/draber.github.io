/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import TablePane from "./tablePane.js";
import Popup from "./popup.js";
import { prefix } from "../utils/string.js";
import gridIcon from "../assets/grid.svg";
import fn from "fancy-node";
import shortcutRegistry from "../modules/shortcutRegistry.js";
import { getToggleButton } from "../utils/ui.js";

/**
 * Grid plugin
 *
 * @param {App} app
 * @returns {Plugin} Grid
 */
class ShortcutScreen extends TablePane {
    /**
     * Toggle pop-up
     * @returns {ShortcutScreen}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.setContent("subtitle", this.description).setContent("body", this.getPane()).toggle(true);

        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const rows = [["", "Shortcut", "State"]];
        shortcutRegistry.getRegistry().forEach((shortcut) => {
            const toggleBtn = getToggleButton(shortcut.combo, shortcut.enabled, (evt) => {
                const shortcut = shortcutRegistry.get(evt.target.closest("input").id);
                shortcut.enabled = !shortcut.enabled;
                // save new state
                shortcutRegistry.set(shortcut.combo, shortcut);
            });
            rows.push([shortcut.label, shortcut.human, toggleBtn]);
        });

        return rows;
    }

    /**
     * Grid constructor
     * @param {App} app
     */
    constructor(app) {
        super(
            app,
            "Shortcuts",
            "This is a list of all SBA shortcuts. Each one triggers a feature — for example, opening and closing a panel. If a shortcut conflicts with your system or browser, you can disable it here.",
            {
                classNames: ["tbody-th-start", "thead-th-bold"].map((name) => prefix(name, "d"))
            }
        );

        this.popup = new Popup(this.app, this.key).setContent("title", this.title);

        this.menuAction = "popup";
        this.menuIcon = "null";
        this.panelBtn = fn.span({
            classNames: ["sba-tool-btn"],
            events: {
                pointerup: () => this.togglePopup(),
            },
            attributes: {
                title: `Show ${this.title}`,
            },
            content: gridIcon,
        });

        this.shortcuts = [
            {
                combo: "Shift+Alt+S",
                method: "togglePopup",
            },
        ];
    }
}

export default ShortcutScreen;
