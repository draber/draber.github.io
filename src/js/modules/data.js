import el from './element.js';

/**
 * Word lists
 * @type {{remainders: [], answers: *, pangrams: [string], foundPangrams: [], foundTerms: []}}
 */
const lists = {
    answers: window.gameData.today.answers,
    pangrams: window.gameData.today.pangrams,
    foundTerms: [],
    foundPangrams: [],
    remainders: []
};

/**
 * Returns a list
 * @param type
 * @returns {*}
 */
const getList = type => {
    return lists[type];
}

/**
 * Returns the number of words in given list
 * @param type
 * @returns {number}
 */
const getCount = type => {
    return lists[type].length;
}

/**
 * Returns the number of points in given list
 * @param type
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
 * @param {HTMLElement} app
 * @param {HTMLElement} resultList
 */
const updateLists = (app, resultList) => {
    lists.foundTerms = [];
    lists.foundPangrams = [];

    el.$$('li', resultList).forEach(node => {
        const term = node.textContent;
        lists.foundTerms.push(term);
        if (lists.pangrams.includes(term)) {
            lists.foundPangrams.push(term);
            node.classList.add('sb-pangram');
        }
    });
    lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
    app.dispatchEvent(new Event('sbaUpdateComplete'));
};

/**
 * Build initial word lists
 * @param {HTMLElement} app
 * @param {HTMLElement} resultList
 */
const init = (app, resultList) => {
    updateLists(app, resultList);
    app.addEventListener('sbaUpdate', () => {
        updateLists(app, resultList);
    });
}

export default {
    init,
    getList,
    getCount,
    getPoints
}
