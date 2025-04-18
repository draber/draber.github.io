/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import PopupBuilder from "../widgets/popupBuilder.js";
import {prefix} from "../utils/string.js";
import fn from "fancy-node";
import shortcutRegistry from "../modules/shortcutRegistry.js";
import {getToggleButton} from "../utils/ui.js";
import Plugin from "../modules/plugin.js";
import TableBuilder from "../widgets/tableBuilder.js";

/**
 * ShortcutScreen plugin
 *
 * @param {App} app
 * @returns {Plugin} Grid
 */
export default class ShortcutScreen extends Plugin {
    /**
     * Toggle pop-up
     * @returns {ShortcutScreen}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.setContent("subtitle", this.description).setContent("body", this.createTable()).toggle(true);

        return this;
    }

    createTable() {
        return (new TableBuilder(this.getData(), {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: ["data-pane", "tbody-th-start", "thead-th-bold"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"])
        })).ui;
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
        let msg = [`This is a list of all SBA shortcuts. Each one triggers a feature — for example, opening and closing a panel. 
            If a shortcut conflicts with your system or browser, you can disable it here.`,];
        if (app.envIs("mobile")) {
            msg.push(fn.i({
                content: `Note: On mobile devices, keyboard shortcuts may be limited or unavailable, depending on your setup.`,
            }));
        }
        super(app, "Shortcuts", msg.map((part) => fn.p({content: part})));

        this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);

        this.menu = {
            action: "popup",
        };


        this.shortcuts = [{
            combo: "Shift+Alt+S", method: "togglePopup",
        },];
    }
}
