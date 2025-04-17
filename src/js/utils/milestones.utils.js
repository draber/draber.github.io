// Tier thresholds in percent based on the actual game code
import data from "../modules/data.js";
import fn from "fancy-node";
import {prefix} from "./string.js";

const tiers = [
    ["Beginner", 0],
    ["Good Start", 2],
    ["Moving Up", 5],
    ["Good", 8],
    ["Solid", 15],
    ["Nice", 25],
    ["Great", 40],
    ["Amazing", 50],
    ["Genius", 70],
    ["Queen Bee", 100]
];

/**
 * Generate the rows for the milestone tier table.
 * @param {boolean} [reversed=true] - Whether to reverse the tier order.
 * @returns {Array[]} A 2D array of table rows.
 */
export const getDataArray = (reversed = true) => {
    const pointObj = data.getFoundAndTotal("points");
    const rows = [["", "To reach"]];
    const tierData = reversed ? tiers.toReversed() : tiers;
    tierData.forEach((entry) => {
        rows.push([entry[0], Math.round((entry[1] / 100) * pointObj.total)]);
    });
    return rows;
}

/**
 * Get the current tier the user has reached.
 * @param {{found: number, max: number}} pointObj
 * @returns {{name: string, value: number, additionalPoints: number}} The matching tier.
 */
export const getCurrentTier = (pointObj) => {
    const tier = getDataArray(false)
        .filter((entry) => !isNaN(entry[1]) && entry[1] <= pointObj.found)
        .pop();
    return {
        name: tier[0],
        value: tier[1],
        additionalPoints: pointObj.found - tier[1],
    };
}

/**
 * Get the next upcoming tier based on current score.
 * @param {{found: number, max: number}} pointObj
 * @returns {{name?: string, value?: number, missingPoints: number}} Next tier info or missingPoints = 0 if none.
 */
export const getNextTier = (pointObj) => {
    /*
     * pointObj.found is the number of points the user has found
     * nextTier[1] is the number of points required for the next tier
     * missingPoints is the difference between the next tier and the points the user has already achieved
     */
    const nextTier = getDataArray(false)
        .filter((entry) => !isNaN(entry[1]) && entry[1] > pointObj.found)
        .shift();

    return nextTier && nextTier.length
        ? {
            name: nextTier[0],
            value: nextTier[1],
            missingPoints: nextTier[1] - pointObj.found,
        }
        : {
            name: null,
            value: null,
            missingPoints: 0,
        };
}

/**
 * Build description stating the current tier and next tier, points and such
 * @returns {Array|String}
 */
export const getDescription = () => {
    const pointObj = data.getFoundAndTotal("points");
    const currentTier = getCurrentTier(pointObj);
    const nextTier = getNextTier(pointObj);

    return nextTier.name && pointObj.found < pointObj.total
        ? [
            `You’re at "`,
            fn.b({content: currentTier.name}),
            `" and just `,
            fn.b({content: nextTier.missingPoints}),
            ` ${nextTier.missingPoints !== 1 ? "points" : "point"} away from "`,
            fn.b({content: nextTier.name}),
            `".`,
        ]
        : `You’ve completed today’s puzzle. Here’s a recap.`;
}

export const getRowCallbacks = () => {
    return [
        (rowData, rowIdx, rowObj) => {
            const pointObj = data.getFoundAndTotal("points");
            const currentTier = getCurrentTier(pointObj);
            if (rowData[1] < pointObj.found && rowData[1] !== currentTier.value) {
                rowObj.classNames.push(prefix("completed", "d"));
            }
            if(rowData[1] === currentTier.value){
                rowObj.classNames.push(prefix("completed", "d"));
            }
        }
    ];
}