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
				const setting = el.input({
					attributes: {
						type: 'checkbox',
						name: key,
						checked: !!plugin.getState()
					}
				});
				pane.append(el.li({
					html: el.label({
						html: [
							setting,
							el.b({
								text: plugin.title
							}),
							el.i({
								text: plugin.description
							})
						]
					})
				}));
				defaults.set(key, {
					setting,
					default: !!plugin.defaultState
				});
			})
			this.setContent(pane);
			this.puFooter.append(el.div({
				classNames: [prefix('factory-reset', 'd')],
				html: el.button({
					classNames: ['hive-action'],
					text: 'Reset to defaults',
					attributes: {
						type: 'text'
					},
					events: {
						'click': () => {
							defaults.forEach(value => {
								if (value.setting.checked !== value.default) {
									value.setting.click();
								}
							})
						}
					}

				})
			}))
		})

		// Enforce false as atrt up state
		this.setState(false);

		// Configure the launch button for this plugin
		this.enableTool('options', 'Show set-up', 'Hide set-up');	
		this.add();
	}
}

export default SetUp;