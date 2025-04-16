/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TableUtils from "./table.utils.js";
import { render } from "./render.fn.js";

/**
 * DynamicTable is a lightweight utility to generate an HTML table
 * from raw 2D data using the `dataToObj()` and `render()` pipeline.
 *
 * It supports optional caption, header row/column, and row-level callbacks.
 * The rendered DOM node is cached after first creation.
 */
export default class DynamicTable {
    /**
     * @param {Array<Array<any>>} data - The 2D table data.
     * @param {Object} options - Table rendering options.
     * @param {string} [options.caption=""] - Optional table caption.
     * @param {boolean} [options.hasHeadRow=true] - Whether the first row is a header row.
     * @param {boolean} [options.hasHeadCol=true] - Whether the first column is a header column.
     * @param {Array<Function>} [options.rowCallbacks=[]] - Optional callbacks for customizing rows.
     */
    constructor(
        data,
        {
            caption = "",
            hasHeadRow = true,
            hasHeadCol = true,
            rowCallbacks = [],
            classNames = []
        } = {}
    ) {
        this.data = data;
        this.caption = caption;
        this.hasHeadRow = hasHeadRow;
        this.hasHeadCol = hasHeadCol;
        this.rowCallbacks = rowCallbacks;
        this.classNames = classNames;
        this._tableNode = null;
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
            classNames: this.classNames
        });

        this._tableNode = render(obj);
        return this._tableNode;
    }

    /**
     * Returns the rendered table node, using the cached version if available.
     * Triggers rendering if it hasn't been called yet.
     */
    get table() {
        return this._tableNode || this.render();
    }
}
