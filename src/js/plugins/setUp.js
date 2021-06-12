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
						app.plugins.get(evt.target.name).toggle(evt.target.checked);
					}
				},
				toggle: evt => {
					if (!evt.target.open) {
						this.toggle(false);
					}
				}
			}
		});

        app.on(prefix('popup'), evt => {
			if(evt.detail.plugin === this && this.getState()){
				const options = settings.get('options');
				el.$$('input', pane).forEach(input => {
					input.checked = !!options[input.name];
				})
			}
		});

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
					content: el.label({
						content: [
							input,
							el.b({
								content: plugin.title
							}),
							el.i({
								content: plugin.description
							})
						]
					})
				}));
				defaults.set(key, {
					input,
					default: !!plugin.defaultState
				});
			})
			this.setContent('body', pane);
			this.parts.footer.append(el.div({
				classNames: [prefix('factory-reset', 'd')],
				content: el.button({
					classNames: ['hive-action'],
					content: 'Reset to defaults',
					attributes: {
						type: 'text'
					},
					events: {
						'click': () => {
							defaults.forEach(value => {
								if (value.input.checked !== value.default) {
									value.input.click();
								}
							})
						}
					}

				})
			}))
		})

		// Enforce false as start-up state
		this.setState(false);

		// Configure the launch button for this plugin
		this.enableTool('options', 'Show set-up', 'Hide set-up');
	}
}

export default SetUp;