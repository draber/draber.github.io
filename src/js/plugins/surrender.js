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

	/**
	 * Helps to make sure that the missing terms can only be appended once
	 * @type {boolean}
	 */
	usedOnce = false;

	/**
	 * Build a single entry for the term list
	 * @param {String} term
	 * @returns {HTMLElement}
	 */
	buildEntry(term) {
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
	resolve(resultList) {
		if (this.usedOnce) {
			return false;
		}
		this.app.observer.disconnect();
		data.getList('remainders').forEach(term => resultList.append(this.buildEntry(term)));
		this.usedOnce = true;
		return true;
	};

	constructor(app) {

		super(app, 'Surrender', {
			canChangeState: true
		});

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
				click: () => this.resolve(el.$('.sb-wordlist-items', app.game))
			}
		}));
		this.ui.append(el.summary({
			text: this.title
		}), pane);

		this.add();
	}
}

export default Surrender;