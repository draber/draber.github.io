import data from '../modules/data.js';
import TablePane from './tablePane.js';

/**
 * StartingWith plugin
 * 
 * @param {App} app
 * @returns {Plugin} StartingWith
 */
class StartingWith extends TablePane {

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


	/**
	 * StartingWith constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Starting with…', 'The number of words by first letter', {
			canChangeState: true
		});

        /**
         * Conditions ander which a line in the table should be marked with the class `sba-{$key}`
         * @type {{preeminent: (function(*): boolean), completed: (function(*))}}
         */
		this.cssMarkers = {
			completed: (rowData, i) => i > 0 && rowData[2] === 0,
			preeminent: (rowData, i) => i > 0 && rowData[0] === data.getCenterLetter()
		}
	}
}

export default StartingWith;
