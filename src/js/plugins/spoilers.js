import data from '../modules/data.js';
import TablePane from './tablePane.js';

/**
 * Spoilers plugin
 * 
 * @param {App} app
 * @returns {Plugin} Spoilers
 */
class Spoilers extends TablePane {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const counts = {};
		const pangramCount = data.getCount('pangrams');
		const foundPangramCount = data.getCount('foundPangrams');
		const cellData = [
			['', '✓', '?', '∑']
		];
		data.getList('answers').forEach(term => {
			counts[term.length] = counts[term.length] || {
				found: 0,
				missing: 0,
				total: 0
			};
			if (data.getList('foundTerms').includes(term)) {
				counts[term.length].found++;
			} else {
				counts[term.length].missing++;
			}
			counts[term.length].total++;
		});
		let keys = Object.keys(counts);
		keys.sort((a, b) => a - b);
		keys.forEach(count => {
			cellData.push([
				count + ' ' + (count > 1 ? 'letters' : 'letter'),
				counts[count].found,
				counts[count].missing,
				counts[count].total
			]);
		});
		cellData.push([
			'Pangrams',
			foundPangramCount,
			pangramCount - foundPangramCount,
			pangramCount
		]);
		return cellData;
	}

	/**
	 * Spoilers constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Spoilers', 'The number of words by length, also the number of pangrams', {
			canChangeState: true
		});

        /**
         * Conditions ander which a line in the table should be marked with the class `sba-{$key}`
         * @type {{preeminent: (function(*): boolean), completed: (function(*))}}
         */
		this.cssMarkers = {
			completed: (rowData, i) => i > 0 && rowData[2] === 0,
			preeminent: (rowData, i) => i > 0 && rowData[0] === 'Pangrams',
		}
	}
}
export default Spoilers;
