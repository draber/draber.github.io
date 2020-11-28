import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';
import observers from '../modules/observers.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Surrender';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'surrender';

/**
 * Can be removed by the user
 * @type {boolean}
 */
const optional = true;


/**
 * Build a single entry for the term list
 * @param {String} term
 * @returns {HTMLElement}
 */
const buildEntry = term => {
	const entry = el.create({
		tag: 'li',
		classNames: data.getList('pangrams').includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
	});
	entry.append(el.create({
		tag: 'a',
		text: term,
		attributes: {
			href: `https://www.google.com/search?q=${term}`,
			target: '_blank'
		}
	}));
	return entry;
};

/**
 * Display the solution
 */
const resolve = (resultList) => {
	observers.removeAll();
	data.getList('remainders').forEach(term => {
		resultList.append(buildEntry(term));
	});
};

export default {
	/**
	 * Create and attach plugin
	 * @param {HTMLElement} app
	 * @param {HTMLElement} game
	 * @returns {HTMLElement|boolean} plugin
	 */
	add: (app, game) => {

		if (settings.get(key) === false) {
			return false;
		}
		// add content pane
		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
		});
		const pane = el.create({
			classNames: ['pane']
		});
		const button = el.create({
			tag: 'button',
			classNames: ['hive-action'],
			text: 'Display answers',
			attributes: {
				type: 'button'
			},
			events: {
				click: function () {
					resolve(el.$('.sb-wordlist-items', game));
				}
			}
		});
		pane.append(button);
		plugin.append(pane);

		return plugins.add(app, plugin, key, title, optional);
	},
	/**
	 * Remove plugin
	 * @returns null
	 */
	remove: () => {
		return plugins.remove(plugin, key, title);
	}
}