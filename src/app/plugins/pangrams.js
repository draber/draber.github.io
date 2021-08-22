/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import TablePane from './tablePane.js';
import el from '../modules/element.js';

/**
 * Pangrams plugin
 *
 * @param {App} app
 * @returns {Plugin} Pangrams
 */
class Pangrams extends TablePane {

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const pangramCount = data.getCount('pangrams');
        const foundPangramCount = data.getCount('foundPangrams');
        return [
            ['✓', '?', '∑'],
            [
                foundPangramCount,
                pangramCount - foundPangramCount,
                pangramCount
            ]
        ];
    }

    /**
     * Pangrams constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Pangrams', 'The number of pangrams', {
            cssMarkers: {
                completed: (rowData, i) => rowData[1] === 0
            },
            hasHeadCol: false
        });

        this.ui = el.details({
            content: [
                el.summary({
                    content: this.title
                }),
                this.getPane()
            ]
        });

        this.toggle(this.getState());
    }
}

export default Pangrams;