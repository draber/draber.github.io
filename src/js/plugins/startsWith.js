import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * StartsWith plugin
 * 
 * @param {App} app
 * @returns {Plugin} StartsWith
 */
class StartsWith extends Plugin {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const letters = {};
		const answers = data.getList('answers').sort((a, b) => {
			if(a.startsWith(this.centerLetter)) {
				return -1;
			}
			if(b.startsWith(this.centerLetter)) {
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
			if(typeof letters[letter] === 'undefined'){
				letters[letter] = { ...tpl };
			}
			if(remainders.includes(term)){
				letters[letter].remainders++;
			}
			else {
				letters[letter].foundTerms++;
			}
			letters[letter].total++;
		})

		const cellData = [['', '✓', '?', '∑']];
		for (let [letter, values] of Object.entries(letters)) {
			values = Object.values(values);
			values.unshift(letter);
			cellData.push(values);
		}
		return cellData;
	}



	constructor(app) {

		super(app, 'Starting with…', {
			canChangeState: true
		});

		this.ui = el.details();
		
		// add and populate content pane        
		const pane = tbl.get(this.getData(), null, true, data.getCenterLetter());

		this.ui.append(el.summary({
			text: this.title
		}), pane);

		// update on demand
		app.on(prefix('wordsUpdated'), () => {
			tbl.get(this.getData(), pane, true, data.getCenterLetter());
		});

		this.add();
	}
}
export default StartsWith;