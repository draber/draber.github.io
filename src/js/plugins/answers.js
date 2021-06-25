import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';

/**
 * Answers plugin
 * 
 * @param {App} app
 * @returns {Plugin} Answers
 */
class Answers extends Plugin {

	/**
	 *
	 * @param {Event} evt
	 * @returns {Plugin}
	 */
	toggle(state) {

		if (!state) {
			this.popup.toggle(state);
			return this;
		}

		const foundTerms = data.getList('foundTerms');
		const pangrams = data.getList('pangrams');

		const pane = el.ul({
			classNames: ['sb-modal-wordlist-items']
		})

		data.getList('answers').forEach(term => {
			pane.append(el.li({
				classNames: pangrams.includes(term) ? ['pangram'] : [],
				content: [
					el.span({
						classNames: foundTerms.includes(term) ? ['check', 'checked'] : ['check']
					}), el.span({
						classNames: ['sb-anagram'],
						content: term
					})
				]
			}));
		});

		this.popup
			.setContent('title', this.title)
			.setContent('subtitle', data.getDate())
			.setContent('body', [
				el.div({
					content: data.getList('letters').join(''),
					classNames: ['sb-modal-letters']
				}), 
				pane
			])
			.toggle(state);

		return this;
	}

	/**
	 * Answers constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Today’s Answers', 'Reveals the solution of the game', {
			canChangeState: true,
			defaultState: false
		});

		this.marker = prefix('resolved', 'd');
		this.popup = new Popup(this.key);

		this.menuIcon = 'warning';
	}
}

export default Answers;