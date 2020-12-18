import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

/**
 * Set-up plugin
 * 
 * @param {App} app
 * @returns {Plugin} SetUp
 */
class SetUp extends Plugin {
	constructor(app) {

		super(app, 'Set-up');

		const pane = el.ul({
			classNames: ['pane']
		});

		/**
		 * Populate the pane
		 * @param {HTMLElement} pane
		 */
		const populate = pane => {
			app.registry.forEach((plugin, key) => {
				if (!plugin.canDeactivate) {
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
						checked: plugin.isEnabled()
					}
				});
				label.prepend(check)
				li.append(label);
				pane.append(li);
			})
		}

		this.ui = el.details({
			events: {
				click: evt => {
					if (evt.target.tagName === 'INPUT') {
						app.registry.get(evt.target.name).toggle(evt.target.checked);
					}
				}
			}
		});

		this.ui.append(el.summary({
			text: this.title
		}), pane);
		
		populate(pane);
		this.add();
	}
}

export default SetUp;
