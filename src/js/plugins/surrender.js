import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';

/**
 * Surrender plugin
 * 
 * @param {App} app
 * @returns {Plugin} Surrender
 */
class Surrender extends Plugin {

	getDescription() {
		return el.div({
			classNames: ['sb-modal-date__today'],
			content: data.getDate()
		})
	}

	/**
	 *
	 * @param {Event} evt
	 * @returns {Plugin}
	 */
	toggle() {

		const answers = data.getList('answers');
		const foundTerms = data.getList('foundTerms');
		const pangrams = data.getList('pangrams');

		const googlify = this.app.plugins.get('googlify');
		const highlightPangrams = this.app.plugins.get('highlightPangrams')

		const letters = el.div({
			content: data.getList('letters').join(''),
			classNames: ['sb-modal-letters']
		})

		const classNames = ['sb-modal-wordlist-items'];
		const events = {};
		if(googlify) {
			classNames.push(prefix('googlified', 'd'));
			events.pointerup = googlify.listener;
		}

		const pane = el.ul({
			classNames,
			events
		})

		answers.forEach(term => {
			const checkClass = ['check'];
			if (foundTerms.includes(term)) {
				checkClass.push('checked');
			}
			let li = el.li({
				content: [
					el.span({
						classNames: checkClass
					}), el.span({
						classNames: ['sb-anagram'],
						content: term
					})
				]
			});

			if (highlightPangrams && pangrams.includes(term)) {
				li.classList.add(highlightPangrams.marker);
			}

			pane.append(li);
		});

		this.popup.setContent('body', [letters, pane]).toggle(!this.popup.getState());

		return this;
	}

	/**
	 * Surrender constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Surrender', 'Reveals the solution of the game', {
			canChangeState: true,
			defaultState: false
		});

		this.marker = prefix('resolved', 'd');
		this.popup = new Popup(this.app, 'Today’s Answers', this.getDescription(), {
			key: this.key + 'PopUp'
		});

		this.popup.add();

		this.ui = this.popup.ui;
	}
}

export default Surrender;