import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import { prefix } from '../modules/string.js';

/**
 * Set-up plugin
 * 
 * @param {App} app
 * @returns {Plugin} SetUp
 */
class SetUp extends Plugin {
	constructor(app) {

		super(app, 'Set-up', {
			canDeactivate: true,
			defaultActive: false
		});

		const pane = el.ul({
			classNames: ['pane']
		});

		this.ui = el.details({
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

		const _toggle = this.toggle;

		this.toggle = state => {
			_toggle(state);
			this.ui.open = this.isActive();
		}

		this.enableTool('options', 'Show set-up', 'Hide set-up');

		app.on(prefix('pluginsReady'), evt => {
			evt.detail.forEach((plugin, key) => {
				if (!plugin.canDeactivate || plugin.tool) {
					return false;
				}
				const li = el.li();
				const label = el.label({
					text: plugin.title
				})
				const check = el.input({
					attributes: {
						type: 'checkbox',
						name: key,
						checked: plugin.isActive()
					}
				});
				label.prepend(check)
				li.append(label);
				pane.append(li);
			})
		})

		this.ui.append(el.summary({
			text: this.title
		}), pane);

		this.toggle(false);

		this.add();
	}
}

export default SetUp;