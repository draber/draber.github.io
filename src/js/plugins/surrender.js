import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import DisclosureBox from './disclosureBox.js';

/**
 * Surrender plugin
 * 
 * @param {App} app
 * @returns {Plugin} Surrender
 */
class Surrender extends DisclosureBox {

	/**
	 *
	 * @param {Event} evt
	 * @returns {Plugin}
	 */
	run(evt) {
		const args = this.app.getObserverArgs();
		this.app.observer.disconnect();
		if (this.isResolved) {
			el.$$('.' + this.marker, this.app.resultList).forEach(termContainer => {
				termContainer.parentElement.remove();
			});
		} else if (evt.type === 'pointerup') {
			data.getList('remainders').forEach(term => this.app.resultList.append(this.buildEntry(term)));
		}
		this.isResolved = !this.isResolved;
		this.app.observer.observe(args.target, args.options);
		this.app.trigger(prefix('refreshUi'));
		return this;
	}

	/**
	 * Build a single entry for the term list
	 * @param {String} term
	 * @returns {HTMLElement}
	 */
	buildEntry(term) {
		const classNames = ['sb-anagram', this.marker];
		return el.li({
			content: el.span({
				content: term,
				classNames
			})
		});
	}

	/**
	 * Surrender constructor
	 * @param {App} app
	 */
	constructor(app) {

		super(app, 'Surrender', 'Reveals the solution of the game', {
			canChangeState: true,
			runEvt: prefix('newInput')
		});

		this.marker = prefix('resolved', 'd');

		this.isResolved = false;

		this.pane = el.div({
			classNames: ['pane'],
			content: el.button({
				tag: 'button',
				classNames: ['hive-action'],
				content: 'Display answers',
				attributes: {
					type: 'button'
				},
				events: {
					pointerup: evt => this.run(evt)
				}
			})
		});
	}
}

export default Surrender;