import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';

/**
 * TodaysAnswers plugin
 * 
 * @param {App} app
 * @returns {Plugin} TodaysAnswers
 */
class TodaysAnswers extends Plugin {

	/**
	 *
	 * @param {Event} evt
	 * @returns {Plugin}
	 */
	run() {

		const foundTerms = data.getList('foundTerms');
		const pangrams = data.getList('pangrams');

		const pane = el.ul({
			classNames: ['sb-modal-wordlist-items']
		})

		data.getList('answers').forEach(term => {
			pane.append(el.li({
				classNames: pangrams.includes(term) ? [prefix('pangram', 'd')] : [],
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
			.setContent('body', [
				el.div({
					content: data.getList('letters').join(''),
					classNames: ['sb-modal-letters']
				}),
				pane
			])
			.toggle(true);

		return this;
	}

	/**
	 * TodaysAnswers constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Today’s TodaysAnswers', 'Reveals the solution of the game', {
			canChangeState: true,
			defaultState: false,
			key: 'todaysAnswers'
		});

		this.marker = prefix('resolved', 'd');
		this.popup = new Popup(this.key)
			.setContent('title', this.title)
			.setContent('subtitle', data.getDate());

		this.menuAction = 'popup';
		this.menuIcon = 'warning';
	}
}

export default TodaysAnswers;