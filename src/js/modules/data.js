import el from './element.js';
import {
    prefix
} from './string.js';

/**
 * Word lists
 * @type {{remainders: [], answers: object, pangrams: [string], foundPangrams: [], foundTerms: []}}
 */
let lists;

/**
 * Build word lists
 * @param {HTMLElement} resultList
 */
const initLists = resultList => {
    lists = {
        answers: window.gameData.today.answers,
        pangrams: window.gameData.today.pangrams,
        foundTerms: [],
        foundPangrams: [],
        remainders: []
    }

    el.$$('li', resultList).forEach(node => {
        if (el.$('a', node)) {
            return false;
        }
        const term = node.textContent;
        lists.foundTerms.push(term);
        if (lists.pangrams.includes(term)) {
            lists.foundPangrams.push(term);
            node.classList.add('sb-pangram');
        }
    });
    lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
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
 * @param {HTMLElement} app
 * @param {String} term
 */
const updateLists = (app, term) => {
    lists.foundTerms.push(term);
    if (lists.pangrams.includes(term)) {
        lists.foundPangrams.push(term);
        node.classList.add('sb-pangram');
    }
    lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
    app.trigger(new Event(prefix('wordsUpdated')));
};

/**
 * Build initial word lists
 * @param {app} app
 * @param {HTMLElement} resultList
 */
const init = (app, resultList) => {
    initLists(resultList);
    app.on(prefix('newWord'), (evt) => {
        updateLists(app, evt.detail)
    });
}

export default {
    init,
    getList,
    getCount,
    getPoints
}
