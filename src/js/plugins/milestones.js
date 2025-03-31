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

/**
 * Milestones plugin
 *
 * @param {App} app
 * @returns {Plugin} Milestones
 */
class Milestones extends TablePane {
    /**
     * Get the data for a summary of achievements
     * @param {String} field
     * @returns {Object|Boolean}
     * @description
     */
    getAchievementData(field) {
        switch (field) {
            case "Points":
                return {
                    found: data.getPoints("foundTerms"),
                    max: data.getPoints("answers"),
                };
            case "Words":
                return {
                    found: data.getCount("foundTerms"),
                    max: data.getCount("answers"),
                };
            case "Pangrams":
                return {
                    found: data.getCount("foundPangrams"),
                    max: data.getCount("pangrams"),
                };
        }
        return false;
    }

    getProgressBar(value, max) {
        value = Math.min(Number(Math.round((value * 100) / max + "e2") + "e-2"), 100);

        return fn.progress({
            attributes: {
                max: 100,
                value,
                title: `Progress: ${value}%`,
            },
        });
    }

    getSummaryData(field) {
        const data = this.getAchievementData(field);
        return [
            ["✓", "?", "∑"],
            [data.found, data.max - data.found, data.max],
        ];
    }

    getSummaryTable(field) {
        const data = this.getAchievementData(field);
        const summaryTbl = this.summaryTables[field].getPane();
        const tFoot = fn.tfoot({
            content: [
                fn.tr({
                    content: [
                        fn.td({
                            attributes: {
                                colSpan: summaryTbl.querySelector("thead tr").children.length,
                            },
                            classNames: [prefix("progress-box", "d")],
                            content: this.getProgressBar(data.found, data.max),
                        }),
                    ],
                }),
            ],
        });
        summaryTbl.append(tFoot);
        return summaryTbl;
    }

    getPane() {
        const pane = super.getPane();
        const insertionPoint = pane.querySelector("tbody .sba-preeminent");
        if (!insertionPoint) {
            return pane;
        }
        const pointObj = this.getAchievementData("Points");
        const nextTier = this.getNextTier(pointObj);
        const pointsToNext = nextTier ? nextTier.diff : 0;
        insertionPoint.after(
            fn.tr({
                content: fn.td({
                    attributes: {
                        colSpan: pane.querySelector("thead tr").children.length,
                    },
                    classNames: [prefix("progress-box", "d")],
                    content: this.getProgressBar(pointObj.found, pointObj.found + pointsToNext),
                }),
            })
        );
        return pane;
    }

    /**
     * Toggle pop-up
     * @returns {Milestones}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }

        const pointObj = this.getAchievementData("Points");
        const currentTier = this.getCurrentTier(pointObj);
        const nextTier = this.getNextTier(pointObj);

        let tagLine;
        const footer =
            pointObj.found < pointObj.max
                ? [
                      ` You’re at "`,
                      fn.b({ content: currentTier.name }),
                      `" and just `,
                      fn.b({ content: nextTier.diff }),
                      ` ${nextTier.diff !== 1 ? "points" : "point"} away from "`,
                      fn.b({ content: nextTier.name }),
                      `".`,
                  ]
                : "";

        if (pointObj.found === 0) {
            tagLine = [`Let’s get started.`].concat(footer);
        } else if (nextTier.diff) {
            tagLine = [`A quick summary of your achievements so far.`].concat(footer);
        } else {
            tagLine = [`You’ve completed today’s puzzle. Here’s a recap.`];
        }

        this.summaryFields.forEach((field) => {
            this.summaryTables[field] = this.getSummaryTable(field);
        });

        const body = fn.div({
            classNames: [prefix("milestone-table-wrapper", "d")],
            content: [
                fn.figure({
                    content: Object.values(this.summaryTables),
                    classNames: ["col", "summaries"].map((name) => prefix(name, "d")),
                }),
                fn.figure({
                    content: this.getPane(),
                    classNames: ["col", "tiers"].map((name) => prefix(name, "d")),
                }),
            ],
        });

        this.popup.setContent("subtitle", tagLine).setContent("body", body).toggle(true);

        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData(reversed = true) {
        const pointObj = this.getAchievementData("Points");
        const rows = [["", "Pts.", "%"]];
        const tiers = reversed ? this.tiers.toReversed() : this.tiers;
        tiers.forEach((entry) => {
            rows.push([entry[0], Math.round((entry[1] / 100) * pointObj.max), entry[1]]);
        });
        return rows;
    }

    /**
     * Get current tier
     * @param {Object} pointObj
     * @returns {Object}
     */
    getCurrentTier(pointObj) {
        const tier = this.getData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] <= pointObj.found)
            .pop();
        return {
            name: tier[0],
            value: tier[1],
        };
    }

    /**
     * Get the next tier
     * @param {Object} pointObj
     * @returns {Object}
     */
    getNextTier(pointObj) {
        const currentTier = this.getCurrentTier(pointObj);
        const nextTier = this.getData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] > pointObj.found)
            .shift();
        return nextTier.length
            ? {
                  name: nextTier[0],
                  value: nextTier[1],
                  diff: nextTier[1] - currentTier.value,
              }
            : {
                  diff: 0,
              };
    }

    /**
     * Rankings constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Milestones", "The number of points required for each level", {
            classNames: ["thead-th-bold"].map((name) => prefix(name, "d")),
            caption: "Tiers",
        });

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
        ];

        const pointObj = this.getAchievementData("Points");
        const currentTier = this.getCurrentTier(pointObj).value;
        this.cssMarkers = {
            completed: (rowData) => rowData[1] < pointObj.found && rowData[1] !== currentTier,
            preeminent: (rowData) => rowData[1] === currentTier,
        };

        this.popup = new Popup(this.app, this.key).setContent("title", this.title);

        this.summaryFields = ["Points", "Words", "Pangrams"];
        this.summaryTables = {};
        this.summaryFields.forEach((field) => {
            this.summaryTables[field] = new TablePane(app, field, "", {
                classNames: ["thead-th-bold"].map((name) => prefix(name, "d")),
                caption: field,
                hasHeadCol: false,
            });
            this.summaryTables[field].getData = () => this.getSummaryData(field);
        });

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
