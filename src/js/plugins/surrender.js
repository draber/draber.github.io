import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import DisclosureBox from './disclosureBox.js';
import Popup from './popup.js';
import Googlify from './googlify.js';
import HighlightPangrams from './highlightPangrams.js';

/**
 * Surrender plugin
 * 
 * @param {App} app
 * @returns {Plugin} Surrender
 */
class Surrender extends DisclosureBox {

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
	run(evt) {
		const answers = data.getList('answers');
		const foundTerms = data.getList('foundTerms');
		const pangrams = data.getList('pangrams');

		const letters = el.div({
			content: data.getList('letters').join(''),
			classNames: ['sb-modal-letters']
		})

		const pane = el.ul({
			classNames: ['sb-modal-wordlist-items']
		})

		answers.forEach(term => {
			const checkClass = ['check'];
			if (foundTerms.includes(term)) {
				checkClass.push('checked');
			}			
			pane.append(
				this.googlifier.link(el.li({
					classNames: pangrams.includes(term) ? [this.pangramHighlighter.marker] : [],
					content: [
						el.span({
							classNames: checkClass
						}), el.span({
							classNames: ['sb-anagram'],
							content: term
						})
					]

				}))
			)
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
			runEvt: prefix('newInput')
		});

		this.marker = prefix('resolved', 'd');
		this.popup = new Popup(this.app, 'Today’s Answers', this.getDescription(), {
			key: this.key + 'PopUp'
		});

		this.popup.add();
		
		this.googlifier = new Googlify(this.app);
		this.pangramHighlighter = new HighlightPangrams(this.app);

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
