/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import DetailsPane from './detailsPane.js';

/**
 * FirstLetter plugin
 *
 * @param {App} app
 * @returns {Plugin} FirstLetter
 */
class FirstLetter extends DetailsPane {

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const letters = {};
        const answers = data.getList('answers').sort();
        const remainders = data.getList('remainders');
        const tpl = {
            foundTerms: 0,
            remainders: 0,
            total: 0
        }
        answers.forEach(term => {
            const letter = term.charAt(0);
            if (typeof letters[letter] === 'undefined') {
                letters[letter] = {
                    ...tpl
                };
            }
            if (remainders.includes(term)) {
                letters[letter].remainders++;
            } else {
                letters[letter].foundTerms++;
            }
            letters[letter].total++;
        })

        const cellData = [
            ['', '✓', '?', '∑']
        ];
        for (let [letter, values] of Object.entries(letters)) {
            values = Object.values(values);
            values.unshift(letter);
            cellData.push(values);
        }
        return cellData;
    }


    /**
     * FirstLetter constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'First letter', 'The number of words by first letter', {
            cssMarkers: {
                completed: (rowData, i) => rowData[2] === 0,
                preeminent: (rowData, i) => rowData[0] === data.getCenterLetter()
            },
            shortcuts: [{
                combo: "Shift+Alt+F",
                method: "togglePane"
            }]
        });
    }
}

export default FirstLetter;