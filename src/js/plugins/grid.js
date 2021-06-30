import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';

/**
 * Grid plugin
 * 
 * @param {App} app
 * @returns {Plugin} Grid
 */
class Grid extends Plugin {

	run() {

        this.popup
            .setContent('subtitle', this.description)
            .setContent('body', this.table.getPane())
            .toggle(true);

        return this;
    }

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		let counts = {};
		const foundTerms = data.getList('foundTerms');
		const allTerms = data.getList('answers');
		const cols = Array.from(new Set(data.getList('answers').map(entry => entry.charAt(0))));
		cols.sort();
		const cellData = [];
		allTerms.forEach(term => {
			const first = term.charAt(0);
			counts[term.length] = counts[term.length] || (() => {
				const tpl = {};
				cols.forEach(letter => {
					tpl[letter] = {
						found: 0,
						total: 0
					}
				});
				return tpl;
			})();
			if (foundTerms.includes(term)) {
				counts[term.length][first].found++;
			}
			counts[term.length][first].total++;
		});
		let keys = Object.keys(counts);
		keys.sort((a, b) => a - b);
		cellData.push([''].concat(cols).concat(['∑']));
		for (let [count, values] of Object.entries(counts)) {
			const row = [count];
			let total = 0;
			let found = 0;
			Object.values(values).forEach(value => {
				total += value.total;
				found += value.found;
				row.push(value.total > 0 ? `${value.found}/${value.total}` : '-');
			})
			row.push(`${found}/${total}`);
			cellData.push(row);
		}

		console.log(cellData)
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

        this.popup = new Popup(this.key)
            .setContent('title', this.title);

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        this.table = new TablePane(app, this.getData);
	}
}
export default Grid;