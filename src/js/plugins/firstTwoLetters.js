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
class FirstTwoLetters extends DetailsPane {

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
            const bigram = term.slice(0, 2);
            if (typeof letters[bigram] === 'undefined') {
                letters[bigram] = {
                    ...tpl
                };
            }
            if (remainders.includes(term)) {
                letters[bigram].remainders++;
            } else {
                letters[bigram].foundTerms++;
            }
            letters[bigram].total++;
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
        super(app, {
            title: "First two letters",
            description: "The number of words by the first two letters",
            cssMarkers: {
                completed: (rowData, i) => rowData[2] === 0
            },
            shortcuts: [
                {
                    combo: "Shift+Alt+2",
                    method: "togglePane",
                },
            ]
        });
    }
}

export default FirstTwoLetters;