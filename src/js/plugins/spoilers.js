import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Spoilers plugin
 * 
 * @param {App} app
 * @returns {Plugin} Spoilers
 */
class Spoilers extends Plugin {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const counts = {};
		const pangramCount = data.getCount('pangrams');
		const foundPangramCount = data.getCount('foundPangrams');
		const cellData = [
			['', '✓', '?', '∑'],
			[
				'Pangrams',
				foundPangramCount,
				pangramCount - foundPangramCount,
				pangramCount
			]
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
		return cellData;
	}

	constructor(app) {

		super(app, 'Spoilers', {
			canChangeState: true
		});

		this.ui = el.details();

		// add and populate content pane        
		const pane = tbl.get(this.getData());

		this.ui.append(el.summary({
			text: this.title
		}), pane);

		// update on demand
		app.on(prefix('wordsUpdated'), () => {
			tbl.get(this.getData(), pane);
		});

		this.add();
	}
}
export default Spoilers;