import data from '../modules/data.js';
import TablePane from './tablePane.js';
import el from '../modules/element.js';

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
            ['Words'].concat(keys.map(key => data.getCount(key))),
            ['Points'].concat(keys.map(key => data.getPoints(key)))
        ];
    }

    /**
     * Score constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Score', 'The number of words and points and how many have been found');

        this.ui = el.details({
            attributes: {
                open: true
            },
            content: [
                el.summary({
                    content: this.title
                }),
                this.getPane()
            ]
        });
    }
}

export default Score;