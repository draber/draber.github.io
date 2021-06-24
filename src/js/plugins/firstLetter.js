import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

/**
 * FirstLetter plugin
 * 
 * @param {App} app
 * @returns {Plugin} FirstLetter
 */
class FirstLetter extends Plugin {

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
	 * FirstLetter constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'First letter', 'The number of words by first letter', {
			canChangeState: true
		});
		
        const table = new TablePane(this.app, this.getData, {
			completed: (rowData, i) => i > 0 && rowData[2] === 0,
			preeminent: (rowData, i) => i > 0 && rowData[0] === data.getCenterLetter()
		})

        this.ui = el.details({
            content: [
                el.summary({
                    content: this.title
                }),
                table.getPane()
            ]
        });
	}
}

export default FirstLetter;
