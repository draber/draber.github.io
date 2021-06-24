import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

/**
 * Score so far plugin
 * 
 * @param {App} app
 * @returns {Plugin} Score
 */
class Score extends Plugin {

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

        super(app, 'Score', 'The number of words and points and how many have been found', {
            canChangeState: true,
            open: true
        });

        const table = new TablePane(this.app, this.getData)

        this.ui = el.details({
            attributes: {
                open: true
            },
            content: [
                el.summary({
                    content: this.title
                }),
                table.getPane()
            ]
        });
    }
}

export default Score;