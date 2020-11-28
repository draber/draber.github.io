import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import settings from '../modules/settings.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Settings';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'settings';

/**
 * Can't be removed by the user
 * @type {boolean}
 */
const optional = false;

/**
 * Populate the pane
 * @param {HTMLElement} app
 * @param {HTMLElement} pane
 */
const populate = (app, pane) => {
	for (const [key, option] of Object.entries(settings.getAll().options)) {
		const li = el.create({
			tag: 'li'
		});
		li.append(el.create({
			tag: 'input',
			text: option.t ,
			attributes: {
				type: 'checkbox',
				name: key,
				checked: option.v
			},
			events: {
				click: function () {
					const evtName = settings.get('ns') + key.charAt(0).toUpperCase() + key.slice(1);
					app.dispatchEvent(new CustomEvent(evtName, {
						detail: {
							enabled: this.checked
						}						
					}))
				}
			}
		}));
		pane.append(li);
	}
}


export default {
	/**
	 * Create and attach plugin
	 * @param {HTMLElement} app
	 * @param {HTMLElement} game
	 * @returns {HTMLElement} plugin
	 */
	add: (app, game) => {
		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
		});
		const pane = el.create({
			tag: 'ul',
			classNames: ['pane']
		});
		plugin.append(pane);

		// populate when the app has started
		app.addEventListener('sbaLaunchComplete', () => {
			populate(app, pane);
		});

		return plugins.add(app, plugin, key, title, optional);
	},
	/**
	 * Remove plugin
	 * @returns null
	 */
	remove: () => {
		return plugins.remove(plugin, key, title);
	}
}