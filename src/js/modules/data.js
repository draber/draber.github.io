import el from './element.js';

const lists = {
    answers: window.gameData.today.answers,
    pangrams: window.gameData.today.pangrams,
    foundTerms: [],
    foundPangrams: [],
    remainders: []
};

let app;
let resultContainer;

const getList = (type) => {
    return lists[type];
}

const getCount = (type) => {
    return lists[type].length;
}

/**
 * Count the points from an array of words
 * 
 * @param {Array} data 
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
 */
const updateLists = () => {
    //@todo : use sb-today from local storage
    lists.foundTerms = [];
    lists.foundPangrams = [];

    el.$$('li', resultContainer).forEach(node => {
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


const init = (_app, _resultContainer) => {
    resultContainer = _resultContainer;
    app = _app;
    updateLists();
    app.addEventListener('sbaUpdate', evt => {
        updateLists();
    });
}


export default {
    init,
    getList,
    getCount,
    getPoints
}
