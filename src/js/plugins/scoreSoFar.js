import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import TablePane from './tablePane.js';

/**
 * Score so far plugin
 * 
 * @param {App} app
 * @returns {Plugin} ScoreSoFar
 */
class ScoreSoFar extends TablePane {

    /**
     * Build table data set
     * @returns {Array}
     */
    getData() {
        const keys = ['foundTerms', 'remainders', 'answers'];
        return [
            ['', '✓', '?', '∑'],
            ['Words'].concat(keys.map(key => data.getCount(key))),
            ['Points'].concat(keys.map(key => data.getPoints(key)))
        ];
    }

    /**
     * ScoreSoFar constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Score so far', 'The number of words and points and how many have been found', {
            canChangeState: true,
            open: true
        });
    }
}

export default ScoreSoFar;