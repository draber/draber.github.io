/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import PopupBuilder from "../widgets/popupBuilder.js";
import fn from "fancy-node";
import {prefix} from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import {
    getMilestoneData,
    getDescription,
    getMilestoneTableRowCallbacks,
    getSummaryTableData,
    getSummaryTableRowCallbacks
} from "../utils/milestones.utils.js";
import TableBuilder from "../widgets/tableBuilder.js";

/**
 * Milestones plugin
 *
 * @param {App} app
 * @returns {Plugin} Milestones
 */
export default class Milestones extends Plugin {

    createSummaryTable(fieldName) {
        return new TableBuilder(getSummaryTableData(fieldName), {
            hasHeadRow: true,
            hasHeadCol: false,
            classNames: ["data-pane", "thead-th-bold"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            caption: this.summaryFields[fieldName],
            rowCallbacks: getSummaryTableRowCallbacks()
        }).ui
    }


    createMilestoneTable() {
        return new TableBuilder(getMilestoneData(true), {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: ["data-pane", "thead-th-bold"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            caption: "Tiers",
            rowCallbacks: getMilestoneTableRowCallbacks()
        }).ui
    }

    /**
     * Toggle the milestone popup open or closed.
     * Builds all necessary DOM structure and content dynamically.
     * @returns {Milestones}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }

        const summaryElements = [];
        Object.keys(this.summaryFields).forEach(fieldName => {
            summaryElements.push(this.createSummaryTable(fieldName));
        })

        const body = fn.div({
            classNames: [prefix("milestone-table-wrapper", "d")],
            content: [
                fn.figure({
                    content: summaryElements,
                    classNames: ["col", "summaries"].map((name) => prefix(name, "d")),
                }),
                fn.figure({
                    content: this.createMilestoneTable(),
                    classNames: ["col", "tiers"].map((name) => prefix(name, "d")),
                }),
            ],
        });

        this.popup.setContent("subtitle", getDescription()).setContent("body", body).toggle(true);

        return this;
    }

    /**
     * Milestones constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Milestones", "The number of points required for each level", {runEvt: prefix("refreshUi")});


        this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);

        this.summaryFields = {
            points: "Points",
            terms: "Words",
            pangrams: "Pangrams",
        };

        this.menu = {
            action: 'popup'
        }

        this.shortcuts = [
            {
                combo: "Shift+Alt+M",
                method: "togglePopup",
            },
        ];
    }
}