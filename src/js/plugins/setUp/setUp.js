import el from '../../modules/element.js';
import {
	camel
} from '../../modules/string.js';
import plugin from '../../modules/pluginBase.js';

/**
 * Set-up plugin
 * 
 * @param {app} app
 * @returns {plugin} setUp
 */
class setUp extends plugin {
	constructor(app) {

		super(app);

		this.title = 'Set-up';
		this.key = camel(this.title);
		this.optional = false;

		const pane = el.create({
			tag: 'ul',
			classNames: ['pane']
		});

		/**
		 * Populate the pane
		 * @param {HTMLElement} pane
		 */
		const populate = (pane) => {
			app.registry.forEach((plugin, key) => {
				if(!plugin.optional){
					return false;
				}
				const li = el.create({
					tag: 'li'
				});
				const labeledCheck = el.create({
					tag: 'input',
					text: plugin.title,
					attributes: {
						type: 'checkbox',
						name: key
					},
					checked: plugin.isEnabled()
				});
				li.append(labeledCheck);
				pane.append(li);
			})
		}

		this.ui = el.create({
			tag: 'details',
			text: [this.title, 'summary'],
			events: {
				click: function (evt) {
					if (evt.target.tagName === 'INPUT') {
						app.registry.get(evt.target.name).toggle(evt.target.checked);
					}
				}
			}
		});
		this.ui.append(pane);
		populate(pane);
        this.add();
	}
}

export default setUp;
