import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * StartingWith plugin
 * 
 * @param {App} app
 * @returns {Plugin} StartingWith
 */
class StartingWith extends Plugin {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const letters = {};
		const answers = data.getList('answers').sort((a, b) => {
			if (a.startsWith(this.centerLetter)) {
				return -1;
			}
			if (b.startsWith(this.centerLetter)) {
				return 1;
			}
			return a < b ? -1 : 1;
		});
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



	constructor(app) {

		super(app, 'Starting with…', 'The number of words by first letter', {
			canChangeState: true
		});

		// callback functions to conditionally add the css class `prefix(key, 'd')` to a table row
		this.cssMarkers = {
			completed: (rowData, i) => i > 0 && rowData[2] === 0,
			preeminent: (rowData, i) => i > 0 && rowData[0] === data.getCenterLetter()
		}

        // content pane        
        const pane = el.table({
            classNames: ['pane']
        });

        this.ui = el.details({
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
			app.trigger(prefix('paneUpdated'), {
				plugin: this
			})
		});

		this.add();
	}
}
export default StartingWith;