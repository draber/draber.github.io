import el from '../modules/element.js';
import data from '../modules/data.js';
import Plugin from '../modules/plugin.js';

/**
 * Surrender plugin
 * 
 * @param {App} app
 * @returns {Plugin} Surrender
 */
class Surrender extends Plugin {
	constructor(app) {

		super(app, 'Surrender', {
			canDeactivate: true
		});

		let usedOnce = false;

		/**
		 * Build a single entry for the term list
		 * @param {String} term
		 * @returns {HTMLElement}
		 */
		const buildEntry = term => {
			const entry = el.li({
				classNames: data.getList('pangrams').includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
			});
			entry.append(el.a({
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
			if (usedOnce) {
				return false;
			}
			app.observer.disconnect();
			data.getList('remainders').forEach(term => resultList.append(buildEntry(term)));
			usedOnce = true;
			return true;
		};

        this.ui = el.details();
		
		const pane = el.div({
			classNames: ['pane']
		});
		pane.append(el.button({
			tag: 'button',
			classNames: ['hive-action'],
			text: 'Display answers',
			attributes: {
				type: 'button'
			},
			events: {
				click: () => resolve(el.$('.sb-wordlist-items', app.game))
			}
		}));
		this.ui.append(el.summary({
            text: this.title
		}), pane);
		
		this.add();
	}
}

export default Surrender;
