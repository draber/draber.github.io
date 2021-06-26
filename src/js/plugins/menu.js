import el from '../modules/element.js';
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

	getComponent(entry) {
		if(entry.dataset.component === this.app.key) {
			return this.app
		}
		if(this.app.plugins.has(entry.dataset.component)) {
			return this.app.plugins.get(entry.dataset.component);
		}
		return null;
	}


	constructor(app) {

		super(app, 'Menu', '');

		this.target = this.getTarget();

		const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];



		/**
		 * List of options
		 */
		const pane = el.ul({
			classNames: ['pane'],
			events: {
				pointerup: evt => {
					const entry = evt.target.closest('li');
					const component = this.getComponent(entry);
					if (evt.button === 0 && entry.dataset.action === 'boolean') {
						const nextState = !component.getState();
						component.toggle(nextState);
						entry.classList.toggle('checked', nextState);
						if (component === this.app) {
							this.app.gameWrapper.dataset.sbaActive = nextState.toString();
						}
					}
					else if (entry.dataset.action === 'popup'){
						component.toggle(true);
					}
				}
			},
			content: el.li({
				classNames: this.app.getState() ? ['checked'] : [],
				attributes: {
					title: this.app.title
				},
				data: {
					component: this.app.key,
					icon: 'checkmark',
					action: 'boolean'
				},
				content: `Show ${settings.get('title')}`
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
				const action = plugin.menuAction || 'boolean';
				pane.append(el.li({
					classNames: action === 'boolean' && plugin.getState() ? ['checked'] : [],
					attributes: {
						title: plugin.description
					},
					data: {				
						component: key,
						icon: action === 'boolean' ? 'checkmark' : (plugin.menuIcon || null),
						action
					},
					content: plugin.title
				}));
			})

			pane.append(el.li({
				attributes: {
					title: settings.get('label') + ' Website'
				},
				data: {
					icon: 'sba',
					component: 'sbaWeb',
					action: 'link'
				},
				content: el.a({
					content: settings.get('label'),
					attributes: {
						href: settings.get('url'),
						target: prefix()
					}
				})
			}))
		})

		app.on(prefix('destroy'), () => this.ui.remove());
	}
}

export default Menu;