import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Popup from './popup.js';

/**
 * Grid plugin
 * 
 * @param {App} app
 * @returns {Plugin} Grid
 */
class Grid extends TablePane {

	display() {

		this.popup
			.setContent('subtitle', this.description)
			.setContent('body', this.getPane())
			.toggle(true);

		return this;
	}

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const foundTerms = data.getList('foundTerms');
		const allTerms = data.getList('answers');
		const allLetters = Array.from(new Set(allTerms.map(entry => entry.charAt(0)))).concat(['∑']);
		const allDigits = Array.from(new Set(allTerms.map(term => term.length))).concat(['∑']);
		allDigits.sort((a, b) => a - b);
		allLetters.sort();
		const cellData = [[''].concat(allLetters)];
		let letterTpl = Object.fromEntries(allLetters.map(letter => [letter, {
			fnd: 0,
			all: 0
		}]));
		let rows = Object.fromEntries(allDigits.map(digit => [digit, JSON.parse(JSON.stringify(letterTpl))]));

		allTerms.forEach(term => {
			const letter = term.charAt(0);
			const digit = term.length;
			rows[digit][letter].all++;
			rows[digit]['∑'].all++;
			rows['∑'][letter].all++;
			rows['∑']['∑'].all++;
			if (foundTerms.includes(term)) {
				rows[digit][letter].fnd++;
				rows[digit]['∑'].fnd++;
				rows['∑'][letter].fnd++;
				rows['∑']['∑'].fnd++;
			}
		})

		for (let [digit, cols] of Object.entries(rows)) {
			const cellVals = [digit];
			Object.values(cols).forEach(colVals => {
				cellVals.push(colVals.all > 0 ? `${colVals.fnd}/${colVals.all}` : '-');
			})
			cellData.push(cellVals);
		}

		return cellData;
	}

	/**
	 * Grid constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Grid', 'The number of words by length and by first letter');

		this.popup = new Popup(this.app, this.key)
			.setContent('title', this.title);

		this.menuAction = 'popup';
		this.menuIcon = 'null';
	}
}
export default Grid;