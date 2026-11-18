/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import nyt from "../nyt/nyt.js";

/**
 * Word lists
 * @type {{answers: String[], pangrams: String[], letters: String[], foundTerms: String[], foundPangrams: String[], remainders: String[]}}
 */
let lists;

/**
 * Today's game data, read from the NYT on `init()`
 * @type {Object}
 */
let sbData;

/**
 * Main application
 * @type {App}
 */
let app;

/**
 * Build arrays of terms subdivided into pangrams, found words and such
 */
const completeLists = () => {
    lists.foundPangrams = lists.foundTerms.filter((term) => lists.pangrams.includes(term));
    lists.remainders = lists.answers.filter((term) => !lists.foundTerms.includes(term));
    app.trigger(prefix("refreshUi"));
};

/**
 * Build word lists
 * @param {String[]} foundTerms
 */
const initLists = (foundTerms) => {
    lists = {
        // copies, so that sorting or other changes in SBA can't affect the NYT's data
        answers: [...sbData.answers],
        pangrams: [...sbData.pangrams],
        letters: [...sbData.validLetters],
        foundTerms: [...foundTerms],
    };
    completeLists();
};

/**
 * Returns a list
 * @param {String} type `answers`, `pangrams`, `letters`, `foundTerms`, `foundPangrams` or `remainders`
 * @returns {String[]}
 */
const getList = (type) => {
    return lists[type];
};

/**
 * Returns the game id
 * @returns {Number}
 */
const getId = () => {
    return sbData.id;
};

/**
 * Retrieve the date in different formats
 * @returns {{display: String, print: String}}
 */
const getDate = () => {
    return {
        display: sbData.displayDate,
        print: sbData.printDate,
    };
};

/**
 * Returns the center letter
 * @returns {String}
 */
const getCenterLetter = () => {
    return sbData.centerLetter;
};

/**
 * Returns the number of words in given list
 * @param {String} type
 * @returns {Number}
 */
const getCount = (type) => {
    return lists[type].length;
};

/**
 * Returns the number of points of a single term.
 * 4-letter words score 1 point, longer words 1 point per letter, pangrams 7 extra points.
 * @param {String} term
 * @returns {Number}
 */
const getTermPoints = (term) => {
    if (lists.pangrams.includes(term)) {
        return term.length + 7;
    }
    return term.length > 4 ? term.length : 1;
};

/**
 * Returns the number of points in given list
 * @param {String} type
 * @returns {Number}
 */
const getPoints = (type) => {
    return lists[type].reduce((points, term) => points + getTermPoints(term), 0);
};

/**
 * Returns number of found vs. total items for a given type.
 *
 * @param {String} type - One of "points", "terms", or "pangrams".
 * @returns {{found: Number, total: Number}}
 */
const getFoundAndTotal = (type) => {
    switch (type) {
        case "points":
            return {
                found: getPoints("foundTerms"),
                total: getPoints("answers"),
            };
        case "terms":
            return {
                found: getCount("foundTerms"),
                total: getCount("answers"),
            };
        case "pangrams":
            return {
                found: getCount("foundPangrams"),
                total: getCount("pangrams"),
            };
        default:
            console.warn(`[data] getFoundAndTotal: Unsupported type "${type}"`);
            return {
                found: 0,
                total: 0,
            };
    }
};

/**
 * Add a newly found term
 * @param {String} term
 */
const updateLists = (term) => {
    if (lists.foundTerms.includes(term)) {
        return;
    }
    lists.foundTerms.push(term);
    completeLists();
};

/**
 * Build initial word lists
 * @param {App} _app
 * @param {String[]} foundTerms
 */
const init = (_app, foundTerms) => {
    app = _app;
    sbData = nyt.getGameData();
    initLists(foundTerms);
    app.on(prefix("newWord"), (evt) => {
        updateLists(evt.detail);
    });
};

export default {
    init,
    getList,
    getCount,
    getPoints,
    getTermPoints,
    getId,
    getDate,
    getCenterLetter,
    getFoundAndTotal,
};
