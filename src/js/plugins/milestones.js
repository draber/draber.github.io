/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import PopupBuilder from "../widgets/popupBuilder.js";
import fn from "fancy-node";
import {prefix} from "../utils/string.js";
import {getProgressBar} from "../utils/ui.js";
import SummaryTable from "./summaryTable.js";
import Plugin from "../modules/plugin.js";
import {getCurrentTier, getDataArray, getDescription, getNextTier, getRowCallbacks} from "../utils/milestones.utils.js";
import TableBuilder from "../widgets/tableBuilder.js";

/**
 * Milestones plugin
 *
 * @param {App} app
 * @returns {Plugin} Milestones
 */
export default class Milestones extends Plugin {

    /**
     * Run method of the main table, i.e., tiers
     * @param {Event} evt - The event that triggered the run.
     * @returns {Milestones}
     */
    run(evt) {
        const insertionPoint = fn.$("tbody .sba-preeminent", this.pane);
        const pointObj = data.getFoundAndTotal("points");
        const currentTier = getCurrentTier(pointObj);
        const nextTier = getNextTier(pointObj);
        if (!insertionPoint || !nextTier.value) {
            return this;
        }

        insertionPoint.after(
            fn.tr({
                content: fn.td({
                    attributes: {
                        colSpan: fn.$("thead tr", this.pane).children.length,
                    },
                    classNames: [prefix("progress-box", "d")],
                    content: getProgressBar(currentTier.additionalPoints, nextTier.value - currentTier.value),
                }),
            })
        );
        return this;
    }

    createTable() {
        return new TableBuilder(this.getData(), {
            hasHeadRow: true,
            hasHeadCol: false,
            classNames: ["data-pane", "thead-th-bold"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            caption: "Tiers",
            rowCallbacks: getRowCallbacks()
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
        Object.values(this.summaryTblObjects).forEach((tblObj) => {
            summaryElements.push(tblObj.getPane());
        });

        const body = fn.div({
            classNames: [prefix("milestone-table-wrapper", "d")],
            content: [
                fn.figure({
                    content: summaryElements,
                    classNames: ["col", "summaries"].map((name) => prefix(name, "d")),
                }),
                fn.figure({
                    content: this.createTable(),
                    classNames: ["col", "tiers"].map((name) => prefix(name, "d")),
                }),
            ],
        });

        this.popup.setContent("subtitle", getDescription()).setContent("body", body).toggle(true);

        return this;
    }

    /**
     * Generate the rows for the milestone tier table.
     * @param {boolean} [reversed=true] - Whether to reverse the tier order.
     * @returns {Array[]} A 2D array of table rows.
     */
    getData(reversed = true) {
        return getDataArray(reversed);
    }

    /**
     * Milestones constructor
     * Mind you that this one handles two types of tables. "Tiers" and "Summaries".
     * Tiers is the main table, build by extending the TablePane class.
     * The summary tables are built by creating a new instance of SummaryTable for each summary table.
     * @param {App} app
     */
    constructor(app) {
        super(app, "Milestones", "The number of points required for each level", {runEvt: prefix("refreshUi")});


        this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);



        this.summaryTblObjects = {};
        const summaryFields = {
            points: "Points",
            terms: "Words",
            pangrams: "Pangrams",
        };
        for (const [fieldName, title] of Object.entries(summaryFields)) {
            this.summaryTblObjects[fieldName] = new SummaryTable(app, title, "", fieldName, {
                classNames: ["thead-th-bold"].map((name) => prefix(name, "d")),
                caption: title,
                hasHeadCol: false,
            });
        }

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