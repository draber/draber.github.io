import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import data from '../../modules/data.js';
import pf from '../../modules/prefixer.js';

/**
 * Spoilers plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 */
class spoilers {
	constructor(app, ...args) {

		this.app = app;
		this.args = args;
		this.title = 'Spoilers';
		this.key = 'spoilers';
		this.optional = true;

		/**
		 * Updatable part of the pane
		 * @type {HTMLElement}
		 */
		const tbody = el.create({
			tag: 'tbody'
		});

		const getCellData = () => {
			const counts = {};
			const pangramCount = data.getCount('pangrams');
			const foundPangramCount = data.getCount('foundPangrams');
			const cellData = [
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
		};

		/**
		 * Populate/update pane
		 */
		const update = () => {
			tbody.innerHTML = '';
			getCellData().forEach(cellData => {
				tbody.append(el.create({
					tag: 'tr',
					cellData: cellData
				}));
			});
		}

		// has the user has disabled the plugin?
		if (pluginManager.isEnabled(this.key, true)) {

			this.ui = el.create({
				tag: 'details',
				text: [this.title, 'summary']
			});

			// add and populate content pane
			const pane = el.create({
				tag: 'table',
				classNames: ['pane']
			});
			const thead = el.create({
				tag: 'thead'
			});
			thead.append(el.create({
				tag: 'tr',
				cellTag: 'th',
				cellData: ['', 'Found', 'Missing', 'Total']
			}));
			pane.append(thead);
			pane.append(tbody);
			update();
			this.ui.append(pane);

			// update on demand
			this.app.addEventListener(pf('updateComplete'), () => {
				update();
			});
		}
	}
}

export default spoilers;