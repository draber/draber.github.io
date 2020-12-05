import settings from '../../modules/settings.js';
import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';
import data from '../../modules/data.js';
import pf from '../../modules/prefixer.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Spoilers';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'spoilers';

/**
 * Can be removed by the user
 * @type {boolean}
 */
const optional = true;

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

export default {
	/**
	 * Create and attach plugin
	 * @param {HTMLElement} app
	 * @param {HTMLElement} game
	 * @returns {HTMLElement|null}
	 */
	add: (app, game) => {

        // if user has not disabled the plugin
        if (!plugins.isDisabled(key)) {
			plugin = el.create({
				tag: 'details',
				text: [title, 'summary']
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
			}))
			pane.append(thead);
			pane.append(tbody);
			update();
			plugin.append(pane);

			// update on demand
			app.addEventListener(pf('updateComplete'), () => {
				update();
			});
		}

		return plugins.add({
			app,
			plugin,
			key,
			title,
			optional
		});
	},
	/**
	 * Remove plugin
	 * @returns null
	 */
	remove: () => {
		return plugins.remove({
			plugin,
			key,
			title
		});
	}
}