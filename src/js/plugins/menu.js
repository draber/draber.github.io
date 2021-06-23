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
					const li = evt.target.closest('li');					
					const target = li.dataset.target === this.app.key ? this.app : this.app.plugins.get(li.dataset.target);
					const nextState = !target.getState();
					target.toggle(nextState);
					li.dataset.state = nextState;
					if(target === this.app){
						this.app.gameWrapper.dataset.sbaActive = nextState.toString();
					}
				}
			},
			content: el.li({
				attributes: {
					title: this.app.title
				},
				data: {
					target: this.app.key,
					state: !!this.app.getState(),
					icon: 'checkbox'
				},
				content: `Toggle ${settings.get('title')}`
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

		app.on(prefix('pluginsReady'), evt => {
			evt.detail.forEach((plugin, key) => {
				if (!plugin.canChangeState || plugin === this) {
					return false;
				}
				pane.append(el.li({
					attributes: {
						title: plugin.description
					},
					data: {
						target: key,
						state: !!plugin.getState(),
						icon: plugin.menuIcon
					},
					content: plugin.title
				}));
			})
		})

		app.on(prefix('destroy'), () => this.ui.remove());
	}
}

export default Menu;