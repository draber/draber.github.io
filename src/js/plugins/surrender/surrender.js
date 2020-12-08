import el from '../../modules/element.js';
import data from '../../modules/data.js';
import plugin from '../../modules/pluginBase.js';
import {
	camel
} from '../../modules/string.js';

/**
 * Dark Mode plugin
 * 
 * @param {plugin} app
 * @returns {plugin} surrender
 */
class surrender extends plugin {
	constructor(app) {

		super(app);

		this.title = 'Surrender';
		this.key = camel(this.title);
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
			if (usedOnce) {
				return false;
			}
			data.getList('remainders').forEach(term => {
				resultList.append(buildEntry(term));
			});
			usedOnce = true;
			return true;
		};

		// add content pane
		this.ui = el.create({
			tag: 'details',
			text: [this.title, 'summary'],
            classNames: !this.isEnabled() ? ['inactive'] : []
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
				click: () => {
					resolve(el.$('.sb-wordlist-items', app.game));
				}
			}
		}));
		this.ui.append(pane);
		this.add();
	}
}

export default surrender;