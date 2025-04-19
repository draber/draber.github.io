/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TableUtils from "../utils/table.utils.js";
import { render } from "../utils/render.fn.js";
import {prefix} from "../utils/string.js";

/**
 * DynamicTable is a lightweight utility to generate an HTML table
 * from raw 2D data using the `dataToObj()` and `render()` pipeline.
 *
 * It supports optional caption, header row/column, and row-level callbacks.
 * The rendered DOM node is cached after first creation.
 */
export default class TableBuilder {
    /**
     * @param {Array<Array<any>>} data - The 2D table data.
     * @param {Object} options - Table rendering options.
     * @param {string} [options.caption=""] - Optional table caption.
     * @param {boolean} [options.hasHeadRow=true] - Whether the first row is a header row.
     * @param {boolean} [options.hasHeadCol=true] - Whether the first column is a header column.
     * @param {Array<Function>} [options.rowCallbacks=[]] - Optional callbacks for customizing rows.
     * @param {Array<Function>} [options.cellCallbacks=[]] - Optional callbacks for customizing cells.
     */
    constructor(
        data,
        {
            caption = "",
            hasHeadRow = true,
            hasHeadCol = true,
            rowCallbacks = [],
            cellCallbacks = [],
            classNames = []
        } = {}
    ) {
        this.data = data;
        this.caption = caption;
        this.hasHeadRow = hasHeadRow;
        this.hasHeadCol = hasHeadCol;
        this.rowCallbacks = rowCallbacks;
        this.cellCallbacks = cellCallbacks;
        this.classNames = classNames;
        this.element = null;
    }

    /**
     * Generates and returns a new <table> element based on the input data.
     * Also caches the result for reuse unless `data` changes externally.
     * @returns {HTMLElement} A complete table element.
     */
    render() {
        const obj = TableUtils.dataToObj(this.data, {
            caption: this.caption,
            hasHeadRow: this.hasHeadRow,
            hasHeadCol: this.hasHeadCol,
            rowCallbacks: this.rowCallbacks,
            cellCallbacks: this.cellCallbacks,
            classNames: this.classNames
        });

        this.element = render(obj);
        return this.element;
    }

    /**
     * Returns the rendered table node, using the cached version if available.
     * Triggers rendering if it hasn't been called yet.
     */
    get ui() {
        return this.element || this.render();
    }
}


/**
 * Builds a standardized DynamicTable with SBA-style classnames and layout.
 *
 * @param {Array<Array<any>>} data - 2D table data
 * @param {Array<Function>} [rowCallbacks=[]]
 * @param {Array<Function>} [cellCallbacks=[]]
 * @returns {HTMLElement}
 */
export function buildStandardTable(data, rowCallbacks = [], cellCallbacks=[]) {
    return (new TableBuilder(data, {
        hasHeadRow: true,
        hasHeadCol: true,
        classNames: [
            "data-pane",
            "th-upper",
            "table-full-width",
            "equal-cols",
            "small-txt"
        ].map((name) => prefix(name, "d")).concat(["pane"]),
        rowCallbacks,
        cellCallbacks
    })).ui;
}
