import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import data from '../../modules/data.js';
import observers from '../../modules/observers.js';

/**
 * Surrender plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 */
class surrender {
	constructor(app, ...args) {

		this.app = app;
		this.args = args;
		this.title = 'Surrender';
		this.key = 'surrender';
		this.optional = true;
		
		let usedOnce = false;
		
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
		 * @param {HTMLElement} resultList
		 * @returns {Boolean} 
		 */
		const resolve = (resultList) => {
			if(usedOnce) {
				return false;
			}
			observers.removeAll();
			data.getList('remainders').forEach(term => {
				resultList.append(buildEntry(term));
			});
			usedOnce = true;
			return true;
		};

		// has the user has disabled the plugin?
		if (pluginManager.isEnabled(this.key, true)) {

			// add content pane
			this.ui = el.create({
				tag: 'details',
				text: [this.title, 'summary']
			});
			const pane = el.create({
				classNames: ['pane']
			});
			pane.append(el.create({
				tag: 'button',
				classNames: ['hive-action'],
				text: 'Display answers',
				attributes: {
					type: 'button'
				},
				events: {
					click: function () {
						resolve(el.$('.sb-wordlist-items', args[0]));
					}
				}
			}));
			this.ui.append(pane);
		}
	}
}

export default surrender;
