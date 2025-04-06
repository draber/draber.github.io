/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import TablePane from "./tablePane.js";
import Popup from "./popup.js";
import fn from "fancy-node";
import { prefix } from "../modules/string.js";
import { getProgressBar } from "../modules/helpers.js";
import SummaryTable from "./summaryTable.js";

/**
 * Milestones plugin
 *
 * @param {App} app
 * @returns {Plugin} Milestones
 */
class Milestones extends TablePane {
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.setContent("subtitle", this.description).setContent("body", this.getPane()).toggle(true);
        return this;
    }

    /**
     * Run method of the main table, i.e. tiers
     * @param {Event} evt - The event that triggered the run.
     * @returns {Milestones}
     */
    run(evt) {
        super.run(evt);
        const insertionPoint = fn.$("tbody .sba-preeminent", this.pane);
        const pointObj = data.getFoundAndTotal("points");
        const currentTier = this.getCurrentTier(pointObj);
        const nextTier = this.getNextTier(pointObj);
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

    /**
     * Build description stating the current tier and next tier, points and such
     * @returns {Array|String}
     */
    getDescription() {
        const pointObj = data.getFoundAndTotal("points");
        const currentTier = this.getCurrentTier(pointObj);
        const nextTier = this.getNextTier(pointObj);

        const description =
            nextTier.name && pointObj.found < pointObj.total
                ? [
                      `You’re at "`,
                      fn.b({ content: currentTier.name }),
                      `" and just `,
                      fn.b({ content: nextTier.missingPoints }),
                      ` ${nextTier.missingPoints !== 1 ? "points" : "point"} away from "`,
                      fn.b({ content: nextTier.name }),
                      `".`,
                  ]
                : `You’ve completed today’s puzzle. Here’s a recap.`;

        return description;
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

        this.description = this.getDescription();

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
                    content: this.getPane(),
                    classNames: ["col", "tiers"].map((name) => prefix(name, "d")),
                }),
            ],
        });

        this.popup.setContent("subtitle", this.getDescription()).setContent("body", body).toggle(true);

        return this;
    }

    /**
     * Generate the rows for the milestone tier table.
     * @param {boolean} [reversed=true] - Whether to reverse the tier order.
     * @returns {Array[]} A 2D array of table rows.
     */
    getData(reversed = true) {
        const pointObj = data.getFoundAndTotal("points");
        const rows = [["", "To reach"]];
        const tiers = reversed ? this.tiers.toReversed() : this.tiers;
        tiers.forEach((entry) => {
            rows.push([entry[0], Math.round((entry[1] / 100) * pointObj.total)]);
        });
        return rows;
    }

    /**
     * Get the current tier the user has reached.
     * @param {{found: number, max: number}} pointObj
     * @returns {{name: string, value: number, additionalPoints: number}} The matching tier.
     */
    getCurrentTier(pointObj) {
        const tier = this.getData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] <= pointObj.found)
            .pop();
        return {
            name: tier[0],
            value: tier[1],
            additionalPoints: pointObj.found - tier[1],
        };
    }

    /**
     * Get the next upcoming tier based on current score.
     * @param {{found: number, max: number}} pointObj
     * @returns {{name?: string, value?: number, missingPoints: number}} Next tier info or missingPoints = 0 if none.
     */
    getNextTier(pointObj) {
        /*
         * pointObj.found is the number of points the user has found
         * nextTier[1] is the number of points required for the next tier
         * missingPoints is the difference between the next tier and the points the user has already achieved
         */
        const nextTier = this.getData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] > pointObj.found)
            .shift();

        return nextTier && nextTier.length
            ? {
                  name: nextTier[0],
                  value: nextTier[1],
                  missingPoints: nextTier[1] - pointObj.found,
              }
            : {
                  name: null,
                  value: null,
                  missingPoints: 0,
              };
    }

    /**
     * Milestones constructor
     * Mind you that this one handles two types of tables. "Tiers" and "Summaries".
     * Tiers is the main table, build by extending the TablePane class.
     * The summary tables are built by creating a new instance of SummaryTable for each summary table.
     * @param {App} app
     */
    constructor(app) {
        super(app, "Milestones", "The number of points required for each level", {
            classNames: ["thead-th-bold"].map((name) => prefix(name, "d")),
            caption: "Tiers",
        });

        // Tier thresholds based on the actual game code
        this.tiers = [
            ["Beginner", 0],
            ["Good Start", 2],
            ["Moving Up", 5],
            ["Good", 8],
            ["Solid", 15],
            ["Nice", 25],
            ["Great", 40],
            ["Amazing", 50],
            ["Genius", 70],
            ["Queen Bee", 100],
            // add next field when debugging a finished game
            // ["Super Bee", 150],
        ];
        this.cssMarkers = {
            completed: (rowData) => {
                const pointObj = data.getFoundAndTotal("points");
                const currentTier = this.getCurrentTier(pointObj);
                return rowData[1] < pointObj.found && rowData[1] !== currentTier.value;
            },
            preeminent: (rowData) => rowData[1] === this.getCurrentTier(data.getFoundAndTotal("points")).value,
        };

        this.popup = new Popup(this.app, this.key).setContent("title", this.title);

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

        this.menuAction = "popup";
        this.menuIcon = "null";

        this.shortcuts = [
            {
                combo: "Shift+Alt+M",
                method: "togglePopup",
            },
        ];
    }
}

export default Milestones;
