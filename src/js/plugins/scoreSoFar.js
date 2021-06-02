import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Score so far plugin
 * 
 * @param {App} app
 * @returns {Plugin} ScoreSoFar
 */
class ScoreSoFar extends Plugin {

    /**
     * Build table data set
     * @returns {(string[]|(string|number)[])[]}
     */
    getData() {
        return [
            ['', '✓', '?', '∑'],
            [
                'Words',
                data.getCount('foundTerms'),
                data.getCount('remainders'),
                data.getCount('answers')
            ],
            [
                'Points',
                data.getPoints('foundTerms'),
                data.getPoints('remainders'),
                data.getPoints('answers')
            ]
        ];
    }

    /**
     * Build plugin
     * @param app
     */
    constructor(app) {

        super(app, 'Score so far', 'The number of words and points and how many have been found', {
            canChangeState: true
        });

        // content pane        
        const pane = el.table({
            classNames: ['pane']
        });

        this.ui = el.details({
            attributes: {
                open: true
            },
            html: [
                el.summary({
                    text: this.title
                }),
                pane
            ]
        });

        // update on demand
        app.on(prefix('wordsUpdated'), () => {
            tbl.get(this.getData(), pane);
        })

        this.add();
    }
}

export default ScoreSoFar;