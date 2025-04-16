/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import Plugin from "../modules/plugin.js";
import tableUtils from "../utils/table.utils.js";
import DynamicTable from "../utils/DynamicTable.js";
import { prefix } from "../utils/string.js";
import fn from 'fancy-node';


export default class FirstThreeLetters extends Plugin {
    constructor(app) {
        super(app, "first3", "First 3 Letters", "⌘3");

        app.on(prefix("refreshUi"), () => this.run());

        const title = this.pluginName || "Table";

        this.ui = fn.details({
            content: [
                fn.summary({ content: title })
                // table will be appended later in `run()`
            ],
            attributes: { open: true }
        });

        this.togglePane = () => (this.ui.open = !this.ui.open);
        this.table = null;
    }

    getData() {
        return tableUtils.buildFirstLetterTableData(3);
    }

    createTable() {
        return new DynamicTable(this.getData(), {
           // caption: "Words grouped by first three letters",
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: ["th-upper", "table-full-width", "equal-cols", "small-txt"].map((name) => prefix(name, "d")),
            
            rowCallbacks: [
                (rowData, rowIdx, rowObj) => {
                    if (rowIdx === 0) {
                        return;
                    }
                    const found = rowData[1];
                    const total = rowData[3];
                    if (total === 1) {
                        rowObj.classNames.push("dimmed");
                    }
                    if (found === total) {
                        rowObj.classNames.push("complete");
                    }
                }
            ]
        });
    }

    run() {
        const newTable = this.createTable().table;

        if (this.table?.isConnected) {
            this.table.replaceWith(newTable);
        } else {
            this.ui.append(newTable);
        }

        this.table = newTable;
    }
}
