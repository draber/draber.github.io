/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import * as svConfig from "../../config/smartVariants.config.json" assert {type: "json"};
import Plugin from "../modules/plugin.js";
import {prefix} from "../utils/string.js";
import TableBuilder from "../widgets/tableBuilder.js";
import data from "../modules/data.js";
import fn from "fancy-node";
import PopupBuilder from "../widgets/popupBuilder.js";
import {getToggleButton} from "../utils/ui.js";
import settings from "../modules/settings.js";
import {utils} from "../utils/smartVariants.utils.js";
// import { ui } from "../utils/smartVariants.ui.js";

export default class SmartVariants extends Plugin {


    /**
     * Toggle pop-up
     * @returns {ShortcutScreen}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup
            .setContent("subtitle", this.description)
            .setContent("body", [
                this.getClaim(),
                this.createTable()
            ])
            .toggle(true);

        return this;
    }


    // addToLookup(suffix, stem, term) {
    //     if (!this.lookup[suffix]) {
    //         this.lookup[suffix] = {};
    //     }
    //     this.lookup[suffix][stem] = term;
    // }
    //
    // buildStemList(term, suffix) {
    //     let baseStem = term.slice(0, -suffix.length);
    //     let stems = [baseStem, baseStem + "e"];
    //
    //     if (baseStem.length > 1 && baseStem.at(-1) === baseStem.at(-2)) {
    //         stems.push(baseStem.slice(0, -1));
    //     }
    //
    //     if (baseStem.endsWith("y")) {
    //         stems.push(baseStem.slice(0, -1) + "ie");
    //     }
    //
    //     if (baseStem.endsWith("k")) {
    //         stems.push(baseStem.slice(0, -1) + "c");
    //     }
    //     return stems.filter((stem) => this.nonSuffixedTerms.includes(stem));
    // }

    // findSuffixes() {
    //     for (const term of this.suffixedTerms) {
    //         for (const suffix of this.suffixes) {
    //             const stems = this.buildStemList(term, suffix);
    //             if (stems.length === 0) {
    //                 continue;
    //             }
    //             let matched = false;
    //             for (const stem of stems) {
    //                 if (svConfig[suffix]?.[stem] === term) {
    //                     this.addToLookup(suffix, stem, term);
    //                     matched = true;
    //                     break;
    //                 }
    //             }
    //             if (!matched) {
    //                 this.addToLookup(suffix, stems[0], term);
    //             }
    //         }
    //     }
    //     return this.lookup;
    // }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const dataGrid = [["Prefix/Suffix", "State"]];

        const stored = settings.get(`options.${this.key}`) || {};

        // cfg.suffix ??= {};
        // cfg.suffix.ing = true;
        // localStorage.setItem("smartVariants", JSON.stringify(cfg));

        for (const [type, entries] of Object.entries(this.affixes)) {
            for (let entry of entries) {
                const id = prefix(`${type}-${entry}`, "d");
                const checked = !!stored?.[type]?.[entry];
                console.log({id, checked});

                const toggleBtn = getToggleButton(id, checked, (evt) => {
                    // const shortcut = shortcutRegistry.get(evt.target.closest("input").id);
                    // shortcut.enabled = !shortcut.enabled;
                    // // save new state
                    // shortcutRegistry.set(shortcut.combo, shortcut);
                });
                entry = type === 'prefix' ? entry + '-' : '-' + entry;
                dataGrid.push([entry, toggleBtn]);
            }
        }
        return dataGrid;
    }

    createTable() {
        return new TableBuilder(this.getData(), {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: ["data-pane", "thead-th-bold", "table-full-width", "equal-cols", "small-txt"]
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

    getClaim() {
        return fn.p({
            content: `We know – this might not be for everyone. Maybe you like the grind. 
                Maybe this feels a bit <i>too much</i> like cheating. Maybe it just makes the game
                a little less satisfying. That’s totally fine. Just toggle everything off and go back
                to playing your way. No hard feelings. SBA still loves you. 💛`
        });
    }

    /**
     * Suffix Finder constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Smart Variants", `You type <b>spell</b> – we type <b>spelling</b> for you. And <b>spelled</b>. 
                                    Less typing. More buzzing.`);

        Object.assign(this, utils(this)/*, ui(this)*/);

        this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);

        this.menu = {
            action: "popup",
            icon: 'new'
        };

        this.lookup = {};
        const validTerms = data.getList("answers");

        /**
         * Filters suffixes that could actually appear based on current puzzle letters.
         */
        this.affixes = {};
        this.affixedTerms = {};
        this.nonAffixedTerms = {};
        ['suffix', 'prefix'].forEach((type) => {
            this.affixes[type] = svConfig[type].list.toSorted();
            this.affixedTerms[type] = validTerms.filter((term) => this.hasAffix(term, type));
            this.nonAffixedTerms[type] = validTerms.filter((term) => !this.hasAffix(term, type));
        })

        this.shortcuts = [
            {
                combo: "Shift+Alt+U",
                method: "togglePopup",
            },
        ];
    }
}
