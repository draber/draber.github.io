/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020 Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from "../modules/plugin.js";
import tableUtils from "../utils/table.utils.js";
import {prefix} from "../utils/string.js";
import DetailsBuilder from "../widgets/detailsBuilder.js";
import {buildStandardTable} from '../widgets/tableBuilder.js'

export default class LetterCount extends Plugin {
    togglePane() {
        return this.detailsBuilder.togglePane();
    }

    run(evt) {
        this.detailsBuilder.update(this.createTable());
        return this;
    }

    constructor(app) {
        super(app, "Letter count", "The number of words by length", {runEvt: prefix("refreshUi")});

        this.detailsBuilder = new DetailsBuilder(this.title, false);
        this.ui = this.detailsBuilder.ui;

        this.shortcuts = [
            {
                combo: "Shift+Alt+L",
                method: "togglePane",
            },
        ];
    }

    getData() {
        return tableUtils.buildWordLengthTableData();
    }

    createTable() {
        return buildStandardTable(this.getData(),[
            (rowData, rowIdx, rowObj) => {
                if (rowData[2] === 0) {
                    rowObj.classNames.push(prefix("completed", "d"));
                }
            },
        ]);
    }
}
