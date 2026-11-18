/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import PopupBuilder from "../widgets/popupBuilder.js";
import { prefix } from "../utils/string.js";
import { buildDataMatrix, markCompletedRatioCells } from "../utils/grid.utils.js";
import Plugin from "../modules/plugin.js";
import TableBuilder from "../widgets/tableBuilder.js";
import gridIcon from "../assets/grid.svg";
import fn from "fancy-node";

/**
 * Grid plugin
 *
 * Number of words by length and by first letter, like the grid in the NYT's daily hints.
 * On desktop the pop-up can be pinned: it then stays open, updates live and can be moved around.
 *
 * @param {App} app
 * @returns {Plugin} Grid
 */
export default class Grid extends Plugin {
    /**
     * Toggle pop-up
     * @returns {Grid}
     */
    togglePopup() {
        this.popup.toggle(!this.popup.isOpen);
        return this;
    }

    /**
     * Build the table
     * @returns {HTMLElement}
     */
    createTable() {
        return new TableBuilder(buildDataMatrix(), {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: ["data-pane", "th-upper", "equal-cols", "small-txt"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            cellCallbacks: [markCompletedRatioCells],
        }).ui;
    }

    /**
     * Refresh the table, keeps a pinned grid up to date
     * @returns {Grid}
     */
    run() {
        this.popup.setContent("body", this.createTable());
        return this;
    }

    /**
     * Grid constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Grid", "The number of words by length and by first letter.", { runEvt: prefix("refreshUi") });

        this.popup = new PopupBuilder(this.app, this.key, { pinnable: true })
            .setContent("title", this.title)
            .setContent("subtitle", this.description)
            .setContent("body", this.createTable());

        // restore a pinned grid once the app is complete
        this.app.on(prefix("pluginsReady"), () => this.popup.restore());

        // new in 6.0: pinnable grid
        this.menu = {
            action: "popup",
            icon: "new",
        };

        // `popovertarget` rather than a click handler: a click outside closes the pop-up before the handler would run
        this.panelBtn = fn.button({
            classNames: [prefix("tool-btn", "d")],
            attributes: {
                type: "button",
                title: this.title,
                popovertarget: this.popup.id,
            },
            aria: {
                label: this.title,
            },
            content: gridIcon,
        });

        this.shortcuts = [
            {
                combo: "Shift+Alt+G",
                method: "togglePopup",
            },
        ];
    }
}
