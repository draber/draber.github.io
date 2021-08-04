/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
 import {
    prefix
} from './string.js';

/**
 * Word lists
 * @type {{remainders: [], answers: object, pangrams: [string], foundPangrams: [], foundTerms: []}}
 */
let lists;

/**
 * Game data
 */
const sbData = window.gameData.today;

/**
 * Main application
 */
let app;

/**
 * Build array of terms subdivided into pangrams, found words and such
 */
const completeLists = () => {
    lists.foundPangrams = lists.foundTerms.filter(term => lists.pangrams.includes(term));
    lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
    app.trigger(prefix('refreshUi'));
}

/**
 * Build word lists
 * @param {Array} foundTerms
 */
const initLists = foundTerms => {
    lists = {
        answers: sbData.answers,
        pangrams: sbData.pangrams,
        letters: sbData.validLetters,
        foundTerms: foundTerms
    }
    completeLists();
}

/**
 * Returns a list
 * @param {String} type
 * @returns {Array}
 */
const getList = type => {
    return lists[type];
}

/**
 * Returns the gameId
 * @returns {String}
 */
const getId = () => {
    return sbData.id;
}

/**
 * Retrieve the date in different formats
 * @returns {{print, display}}
 */
const getDate = () => {
    return {
        display: sbData.displayDate,
        print: sbData.printDate,
    }
}


/**
 * Returns the gameId
 * @returns {String}
 */
const getCenterLetter = () => {
    return sbData.centerLetter;
}

/**
 * Returns the number of words in given list
 * @param {String} type
 * @returns {number}
 */
const getCount = type => {
    return lists[type].length;
}

/**
 * Returns the number of points in given list
 * @param {String} type
 * @returns {number}
 */
const getPoints = type => {
    const data = lists[type];
    let points = 0;
    data.forEach(term => {
        if (lists.pangrams.includes(term)) {
            points += term.length + 7;
        } else if (term.length > 4) {
            points += term.length;
        } else {
            points += 1;
        }
    });
    return points;
};

/**
 * Update word lists
 * @param {String} term
 */
const updateLists = term => {
    lists.foundTerms.push(term);
    completeLists();
};

/**
 * Build initial word lists
 * @param {App} _app
 * @param {Array} foundTerms
 */
const init = (_app, foundTerms) => {
    app = _app;
    initLists(foundTerms);
    app.on(prefix('newWord'), evt => {
        updateLists(evt.detail)
    });
}

export default {
    init,
    getList,
    getCount,
    getPoints,
    getId,
    getDate,
    getCenterLetter
}
