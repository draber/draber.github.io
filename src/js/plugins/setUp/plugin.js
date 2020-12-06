import el from '../../modules/element.js';
import settings from '../../modules/settings.js';
import pf from '../../modules/prefixer.js';

/**
 * Set-up plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class setUp {
	constructor(app, ...args) {

		this.app = app;
		this.args = args;
		this.title = 'Set-up';
		this.key = 'setUp';
		this.optional = false;
		
		const pane = el.create({
			tag: 'ul',
			classNames: ['pane']
		});

		/**
		 * Populate the pane
		 */
		const populate = () => {
			for (const [key, option] of Object.entries(settings.get('options'))) {
				const li = el.create({
					tag: 'li'
				});
				const labeledCheck = el.create({
					tag: 'input',
					text: option.t,
					attributes: {
						type: 'checkbox',
						name: key
					},
					checked: option.v
				});
				li.append(labeledCheck);
				pane.append(li);
			}
		}

		this.ui = el.create({
			tag: 'details',
			text: [this.title, 'summary'],
			events: {
				click: function (evt) {
					if (evt.target.tagName === 'INPUT') {
						this.app.dispatchEvent(new CustomEvent(pf(evt.target.name), {
							detail: {
								enabled: evt.target.checked
							}
						}));
					}
				}
			}
		});
		this.ui.append(pane);

		// populate when the app has started
		this.app.addEventListener(pf('launchComplete'), () => {
			populate(pane);
		});
	}
}

export default setUp;