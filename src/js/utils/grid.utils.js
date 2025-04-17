/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import {prefix} from "./string.js";

import fn from "fancy-node";

/**
 * Builds a 2D matrix of word lengths × first letters with totals ("∑").
 * Each cell shows `found/total` (e.g. "3/5"). Returns table-compatible data.
 *
 * @returns {Array<Array<string>>}
 */
export function buildDataMatrix() {
    const foundTerms = data.getList("foundTerms");
    const allTerms = data.getList("answers");

    const allLetters = Array.from(new Set(allTerms.map((t) => t[0]))).sort();
    const allLengths = Array.from(new Set(allTerms.map((t) => t.length))).sort((a, b) => a - b);

    allLetters.push("∑");
    allLengths.push("∑");

    const header = [""].concat(allLetters);
    const matrix = [header];

    const letterTpl = Object.fromEntries(allLetters.map((l) => [l, {fnd: 0, all: 0}]));

    const rows = Object.fromEntries(allLengths.map((len) => [len, structuredClone(letterTpl)]));

    for (const term of allTerms) {
        const letter = term[0];
        const len = term.length;

        const buckets = [
            [len, letter],
            [len, "∑"],
            ["∑", letter],
            ["∑", "∑"],
        ];

        for (const [r, c] of buckets) {
            rows[r][c].all++;
            if (foundTerms.includes(term)) {
                rows[r][c].fnd++;
            }
        }
    }

    for (const [len, cols] of Object.entries(rows)) {
        const row = [len];
        for (const col of allLetters) {
            const cell = cols[col];
            row.push(cell.all > 0 ? `${cell.fnd}/${cell.all}` : "-");
        }
        matrix.push(row);
    }

    return matrix;
}

/**
 * Cell-level callback for TableBuilder/dataToObj.
 * Adds a class when cell content is a matching x/y ratio.
 */
export const markCompletedRatioCells = ({cellData, cellObj}) => {
    if (typeof cellData === "string") {
        const parts = cellData.split("/");
        if (parts.length === 2 && parts[0] === parts[1]) {
            cellObj.classNames.push(prefix("completed", "d"));
        }
    }
};
