import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

/**
 * Grid plugin
 * 
 * @param {App} app
 * @returns {Plugin} Grid
 */
class Grid extends Plugin {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const counts = {};
		const foundTerms = data.getList('foundTerms');
		const allTerms = data.getList('answers');
		let letters = new Map(data.getLetters().map(entry => [entry, { 
			found: 0, 
			total: 0 
		}]));
		let header = new Set();
		const cellData = [];
		allTerms.forEach(term => {
			const first = term.charAt(0);
			counts[term.length] = counts[term.length] || {};
			counts[term.length][first] = counts[term.length][first] || {};
			counts[term.length][first].found = counts[term.length][first].found || 0;
			counts[term.length][first].total = counts[term.length][first].total || 0;
			if (foundTerms.includes(term)) {
				counts[term.length][first].found++;
			}
			counts[term.length][first].total++;
		});
		let keys = Object.keys(counts);
		keys.sort((a, b) => a - b);
		header = Array.from(header);
		header.sort((a, b) => a - b);
		cellData.push([''].concat(header).concat(['∑']));
		console.log(cellData);
		// keys.forEach(count => {
		// 	cellData.push([
		// 		count,
		// 		counts[count].found,
		// 		counts[count].missing,
		// 		counts[count].total
		// 	]);
		// });
		console.log(counts)
		return cellData;
	}

	/**
	 * Grid constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Grid', 'The number of words by length, combined with the words by first letter', {
			canChangeState: true
		});

		// this.ui = el.details({
		//     content: [
		//         el.summary({
		//             content: this.title
		//         }),
		//         new TablePane(app, this.getData, {
		// 			completed: (rowData, i) => i > 0 && rowData[2] === 0,
		// 			preeminent: (rowData, i) => i > 0 && rowData[0] === 'Pangrams',
		// 		}).getPane()
		//     ]
		// });

		this.getData();

		this.toggle(this.getState());
	}
}
export default Grid;
