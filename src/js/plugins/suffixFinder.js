/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import * as oddCases from "./suffixFinder.wordlist.json" assert { type: "json" };
import Plugin from "../modules/plugin.js";
import { prefix } from "../utils/string.js";
import DetailsBuilder from "../widgets/detailsBuilder.js";
import TableBuilder from "../widgets/tableBuilder.js";
import data from "../modules/data.js";

export default class SuffixFinder extends Plugin {
    hasSuffix(term) {
        for (const suffix of this.suffixes) {
            if (term.endsWith(suffix)) {
                return true;
            }
        }
        return false;
    }

    addToLookup(suffix, stem, term) {
        if (!this.lookup[suffix]) {
            this.lookup[suffix] = {};
        }
        this.lookup[suffix][stem] = term;
    }

    buildStemList(term, suffix) {
        let baseStem = term.slice(0, -suffix.length);
        let stems = [baseStem, baseStem + "e"];

        if (baseStem.length > 1 && baseStem.at(-1) === baseStem.at(-2)) {
            stems.push(baseStem.slice(0, -1));
        }

        if (baseStem.endsWith("y")) {
            stems.push(baseStem.slice(0, -1) + "ie");
        }

        if (baseStem.endsWith("k")) {
            stems.push(baseStem.slice(0, -1) + "c");
        }
        return stems.filter((stem) => this.nonSuffixedTerms.includes(stem));
    }

    findSuffixes() {
        for (const term of this.suffixedTerms) {
            for (const suffix of this.suffixes) {
                const stems = this.buildStemList(term, suffix);
                if (stems.length === 0) {
                    continue;
                }
                let matched = false;
                for (const stem of stems) {
                    if (oddCases[suffix]?.[stem] === term) {
                        this.addToLookup(suffix, stem, term);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    this.addToLookup(suffix, stems[0], term);
                }
            }
        }
        return this.lookup;
    }
    togglePane() {
        return this.detailsBuilder.togglePane();
    }

    run(evt) {
        this.detailsBuilder.update(this.createTable());
        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        console.log(this.findSuffixes());
        const dataGrid = [["", "✓", "?", "∑"]];
        const remainders = data.getList("remainders");
        for (const [suffix, pairings] of Object.entries(this.findSuffixes())) {
            const pairingVals = Object.values(pairings);
            const sum = pairingVals.length;
            const missing = pairingVals.filter((term) => remainders.includes(term)).length;
            dataGrid.push(["-" + suffix, sum - missing, missing, sum]);
        }
        return dataGrid;
    }

    createTable() {
        return new TableBuilder(this.getData(), {
            hasHeadRow: true,
            hasHeadCol: false,
            classNames: ["data-pane", "th-upper", "table-full-width", "equal-cols", "small-txt"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            rowCallbacks: [
                (rowData, rowIdx, rowObj) => {
                    if (rowData[2] === 0) {
                        rowObj.classNames.push(prefix("completed", "d"));
                    }
                },
            ],
        }).ui;
    }

    /**
     * Suffix Finder constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Suffixes", "Finds words with suffixes", { runEvt: prefix("refreshUi") });

        this.lookup = {};

        const letters = data.getList("letters");
        const validTerms = data.getList("answers"); // @todo remainders

        /**
         * Filters suffixes that could actually appear based on current puzzle letters.
         */
        this.suffixes = ["able", "al", "ed", "ee", "er", "ible", "ic", "ing", "ion", "ly", "ment", "ness", "y"].filter(
            (suffix) => [...suffix].every((char) => letters.includes(char))
        );

        this.suffixedTerms = validTerms.filter((term) => this.hasSuffix(term));
        this.nonSuffixedTerms = validTerms.filter((term) => !this.hasSuffix(term));

        this.detailsBuilder = new DetailsBuilder(this.title, false);
        this.ui = this.detailsBuilder.ui;

        this.shortcuts = [
            {
                combo: "Shift+Alt+U",
                method: "togglePane",
            },
        ];
    }
}
