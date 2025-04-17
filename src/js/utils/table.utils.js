/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import data from "../modules/data.js";

/**
 * Converts raw table data into a structured object representation.
 *
 * @param {Array<Array<any>>} data - The raw 2D data array (rows and cells).
 * @param {Object} [options] - Optional configuration.
 * @param {boolean} [options.hasHeadRow=true] - Whether the first row should go into <thead>.
 * @param {boolean} [options.hasHeadCol=true] - Whether the first column of each row should be <th>.
 * @param {Array<Function>} [options.rowCallbacks=[]] - Functions applied to each row object. Signature: (rowData, rowIdx, currentRow, skeleton) => void
 * @param {string|Node} [options.caption=""] - Optional table caption.
 * @param {Array<String>} [options.classNames=[]] - CSS class names to be used on <table>
 * @returns {{tag: string, content: Array}} A complete table object.
 */
const dataToObj = (data, { hasHeadRow = true, hasHeadCol = true, rowCallbacks = [], caption = "", classNames=[] } = {}) => {
    const skeleton = getTableSkeleton();

    if (caption) {
        skeleton.caption.content.push(caption);
    }

    data.forEach((rowData, rowIdx) => {
        const rowObj = {
            tag: "tr",
            content: [],
            classNames: [], // not to be mixed up with classNames from the signature which aplly to the <table>
            attributes: {},
        };

        const trTarget = hasHeadRow && rowIdx === 0 ? "thead" : "tbody";

        rowData.forEach((cellData, cellIdx) => {
            let cellTag = "td";
            if (hasHeadRow && rowIdx === 0) {
                cellTag = "th";
            } else if (hasHeadCol && cellIdx === 0) {
                cellTag = "th";
            }

            rowObj.content.push({
                tag: cellTag,
                content: cellData,
            });
        });

        skeleton[trTarget].content.push(rowObj);
        rowCallbacks.forEach((cb) => cb(rowData, rowIdx, rowObj, skeleton));
    });
    
    return finalizeSkeleton(skeleton, classNames);
};

/**
 * Creates an initial table skeleton with empty sections.
 * Note: does not include the <table> element itself.
 *
 * @returns {Object<string, {tag: string, content: Array}>}
 *   An object with keys "caption", "thead", "tbody", each containing an empty section.
 */
const getTableSkeleton = () => {
    const skeleton = {};
    ["caption", "thead", "tbody", "tfoot"].forEach((tag) => {
        skeleton[tag] = {
            tag,
            content: [],
        };
    });
    return skeleton;
};

/**
 * Finalizes the table structure by removing empty parts and wrapping content in a table object.
 *
 * @param {Object<string, {tag: string, content: Array}>} skeleton - The intermediate structure.
 * @param {Array<String>} [options.classNames=[]] - CSS class names to be used on <table>
 * @returns {{tag: string, content: Array}} A finalized table object ready for further processing.
 */
const finalizeSkeleton = (skeleton, classNames = []) => {
    const content = Object.values(skeleton).filter((part) => {
        return Array.isArray(part.content) && part.content.length > 0;
    });
    return {
        tag: "table",
        content,
        classNames
    };
};

/**
 * Inserts a new row object immediately after the current one in the given skeleton section.
 *
 * @param {Object} skeleton - The table skeleton (from getTableSkeleton()).
 * @param {Object} currentRow - The row object that was just added.
 * @param {Object} newRow - The row to insert after the currentRow.
 * @param {string} section - One of "thead", "tbody", or "tfoot".
 */
const insertAfterCurrentRow = (skeleton, currentRow, newRow, section = "tbody") => {
    const target = skeleton[section]?.content;
    if (!target) return;

    const index = target.indexOf(currentRow);
    
    if (index === -1) {
        // fallback: just append if we can't find it
        target.push(newRow);
    } else {
        target.splice(index + 1, 0, newRow);
    }
};

/**
 * Builds table-friendly data grouped by the first N letters of each answer.
 *
 * Returns a 2D array suitable for use with `DynamicTable`, with rows like:
 *   ["cha", 2, 1, 3]  → first 3 letters, 2 found, 1 remaining, 3 total
 *
 * @param {number} n - Number of initial letters to group by (e.g. 1, 2, 3).
 * @returns {Array<Array<string|number>>} 2D table data with header.
 */
const buildFirstLetterTableData = (n) => {
    const answers = data.getList("answers").sort();
    const remainders = data.getList("remainders");
    const stats = {};
    const tpl = { found: 0, missing: 0, total: 0 };

    for (const word of answers) {
        const key = word.slice(0, n);
        if (!stats[key]) stats[key] = { ...tpl };
        if (remainders.includes(word)) {
            stats[key].missing++;
        } else {
            stats[key].found++;
        }
        stats[key].total++;
    }

    const rows = [["", "✓", "?", "∑"]];
    for (const [key, { found, missing, total }] of Object.entries(stats)) {
        rows.push([key, found, missing, total]);
    }

    return rows;
}

export default {
    dataToObj,
    insertAfterCurrentRow,
    buildFirstLetterTableData
};
