/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import PopupBuilder from "../widgets/popupBuilder.js";
import {prefix} from "../utils/string.js";
import {buildDataMatrix} from "../utils/grid.utils.js";
import Plugin from "../modules/plugin.js";
import TableBuilder from "../widgets/tableBuilder.js";
import {markCompletedRatioCells} from "../utils/grid.utils.js";

/**
 * Grid plugin
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
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.setContent("subtitle", this.description).setContent("body", this.createTable()).toggle(true);

        return this;
    }


    createTable() {
        return (new TableBuilder(buildDataMatrix(), {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: [
                "data-pane",
                "th-upper",
                "equal-cols",
                "small-txt"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            cellCallbacks: [markCompletedRatioCells]
        })).ui;
    }

    /**
     * Grid constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, "Grid", "The number of words by length and by first letter.", {runEvt: prefix("refreshUi")});

        this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);

        this.menu = {
            action: "popup",
        };

        this.shortcuts = [
            {
                combo: "Shift+Alt+G",
                method: "togglePopup",
            },
        ];
    }
}
