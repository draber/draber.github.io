import el from '../modules/element.js';
import Popup from './popup.js';
import settings from '../modules/settings.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * Menu plugin
 * 
 * @param {App} app
 * @returns {Plugin} Menu
 */
class Menu extends Plugin {

	/**
	 * Get element to which the launcher will be attached to
	 * @returns {HTMLElement}
	 */
	getTarget() {
		let target;
		if (this.app.envIs('mobile')) {
			target = el.$('#js-mobile-toolbar');
		} else {
			target = el.div({
				content: el.$$('#portal-game-toolbar > span')
			});
			el.$('#portal-game-toolbar').append(target);
		}
		return target;
	}

	/**
	 *
	 * @param {Event} evt
	 * @returns {Plugin}
	 */
	run(evt) {

		return super.toggle();
	}


	constructor(app) {

		super(app, 'Launcher', '');

		this.target = this.getTarget();

		const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];



		/**
		 * List of options
		 */
		const pane = el.ul({
			classNames: ['pane'],
			events: {
				click: evt => {
					if (evt.target.tagName === 'INPUT') {
						if (evt.target.name === this.app.key) {
							const nextState = !this.app.getState();
							this.app.toggle(nextState);
							this.app.gameWrapper.dataset.sbaActive = nextState.toString();
						} else {
							app.plugins.get(evt.target.name).toggle(evt.target.checked);
						}
					}
				}
				/*,
								toggle: evt => {
									if (!evt.target.open) {
										this.toggle(false);
									}
								}*/
			},
			content: el.li({
				attributes: {
					title: this.app.title
				},
				content: el.label({
					content: [
						el.input({
							attributes: {
								type: 'checkbox',
								name: this.app.key,
								checked: !!this.app.getState()
							}
						}),
						`Toggle ${settings.get('title')}`
					]
				})
			})
		});

		this.ui = el.div({
			content: [
				settings.get('title'),
				pane
			],
			attributes: {
				role: 'presentation'
			},
			classNames
		})

		/*,
		 */


		// app.on(prefix('popup'), evt => {
		// 	if (evt.detail.plugin === this && this.getState()) {
		// 		const options = settings.get('options');
		// 		el.$$('input', pane).forEach(input => {
		// 			input.checked = !!options[input.name];
		// 		})
		// 	}
		// });

		app.on(prefix('pluginsReady'), evt => {
			const defaults = new Map();
			evt.detail.forEach((plugin, key) => {
				if (!plugin.canChangeState || plugin === this) {
					return false;
				}
				const input = el.input({
					attributes: {
						type: 'checkbox',
						name: key,
						checked: !!plugin.getState()
					}
				});
				pane.append(el.li({
					attributes: {
						title: plugin.description
					},
					content: el.label({
						content: [
							input,
							plugin.title
						]
					})
				}));
				defaults.set(key, {
					input,
					default: !!plugin.defaultState
				});
			})
		})

		app.on(prefix('destroy'), () => this.ui.remove());
	}
}

export default Menu;