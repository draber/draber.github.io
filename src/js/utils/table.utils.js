/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * Converts raw table data into a structured object representation.
 *
 * @param {Array<Array<any>>} data - The raw 2D data array (rows and cells).
 * @param {Object} [options] - Optional configuration.
 * @param {boolean} [options.hasHeadRow=true] - Whether the first row should go into <thead>.
 * @param {boolean} [options.hasHeadCol=true] - Whether the first column of each row should be <th>.
 * @param {Array<Function>} [options.rowCallbacks=[]] - Functions applied to each row object. Signature: (rowData, rowIdx, currentRow, skeleton) => void
 * @param {string|Node} [options.caption=""] - Optional table caption.
 * @returns {{tag: string, content: Array}} A complete table object.
 */
const dataToObj = (data, { hasHeadRow = true, hasHeadCol = true, rowCallbacks = [], caption = "" } = {}) => {
    const skeleton = getTableSkeleton();

    if (caption) {
        skeleton.caption.content.push(caption);
    }

    data.forEach((rowData, rowIdx) => {
        const rowObj = {
            tag: "tr",
            content: [],
            classNames: [],
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

    return finalizeSkeleton(skeleton);
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
 * @returns {{tag: string, content: Array}} A finalized table object ready for further processing.
 */
const finalizeSkeleton = (skeleton) => {
    const content = Object.values(skeleton).filter((part) => {
        return Array.isArray(part.content) && part.content.length > 0;
    });
    return {
        tag: "table",
        content,
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

export default {
    dataToObj,
    insertAfterCurrentRow,
};
