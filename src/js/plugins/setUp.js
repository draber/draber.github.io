import el from '../modules/element.js';
import Popup from './popup.js';
import settings from '../modules/settings.js';
import {
	prefix
} from '../modules/string.js';

/**
 * Set-up plugin
 * 
 * @param {App} app
 * @returns {Plugin} SetUp
 */
class SetUp extends Popup {

	constructor(app) {

		super(app, settings.get('label'), 'Configure the assistant the way you want it.', {
			canChangeState: true,
			defaultState: false,
			key: 'setUp'
		});

		/**
		 * List of options
		 */
		const pane = el.ul({
			classNames: ['pane'],
			events: {
				click: evt => {
					if (evt.target.tagName === 'INPUT') {
						app.registry.get(evt.target.name).toggle(evt.target.checked);
					}
				},
				toggle: evt => {
					if (!evt.target.open) {
						this.toggle(false);
					}
				}
			}
		});

		/**
		 * Configure the launch button for this plugin
		 */
		this.enableTool('options', 'Show set-up', 'Hide set-up');

		app.on(prefix('pluginsReady'), evt => {
			evt.detail.forEach((plugin, key) => {
				if (!plugin.canChangeState || plugin.tool) {
					return false;
				}
				pane.append(el.li({
					html: el.label({
						html: [
							el.input({
								attributes: {
									type: 'checkbox',
									name: key,
									checked: plugin.getState()
								}
							}),
							el.b({
								text: plugin.title
							}),
							el.i({
								text: plugin.description
							})
						]
					})
				}));
			})
			this.setContent(pane);
		})

		this.add();
	}
}

export default SetUp;