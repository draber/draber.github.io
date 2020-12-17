import el from '../modules/element.js';
import plugin from '../modules/plugin.js';

/**
 * Set-up plugin
 * 
 * @param {app} app
 * @returns {plugin} setUp
 */
class setUp extends plugin {
	constructor(app) {

		super(app, 'Set-up');

		const pane = el.ul({
			classNames: ['pane']
		});

		/**
		 * Populate the pane
		 * @param {HTMLElement} pane
		 */
		const populate = (pane) => {
			app.registry.forEach((plugin, key) => {
				if (!plugin.optional) {
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
				click: function (evt) {
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

export default setUp;
