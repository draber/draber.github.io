/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import TablePane from './tablePane.js';
import fn from 'fancy-node';

/**
 * Score so far plugin
 *
 * @param {App} app
 * @returns {Plugin} Score
 */
class Score extends TablePane {

    /**
     * Build table data set
     * @returns {Array}
     */
    getData() {
        const keys = ['foundTerms', 'remainders', 'answers'];
        return [
            ['', '✓', '?', '∑'],
            ['W'].concat(keys.map(key => data.getCount(key))),
            ['P'].concat(keys.map(key => data.getPoints(key)))
        ];
    }

    /**
     * Score constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Score', 'The number of words and points and how many have been found');

        this.ui = fn.details({
            attributes: {
                open: true
            },
            content: [
                fn.summary({
                    content: this.title
                }),
                this.getPane()
            ]
        });
    }
}

export default Score;