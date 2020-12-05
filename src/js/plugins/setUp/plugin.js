import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';
import settings from '../../modules/settings.js';
import pf from '../../modules/prefixer.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Set-up';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'setUp';

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
			events: {
				click: function (evt) {
					app.dispatchEvent(new CustomEvent(pf(key), {
						detail: {
							enabled: evt.target.checked
						}
					}))
				}
			},
			checked: option.v
		});
		li.append(labeledCheck);
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
		app.addEventListener(pf('launchComplete'), () => {
			populate(app, pane);
		});

		return plugins.add({
			app,
			plugin,
			key,
			title,
			optional
		});
	},
	/**
	 * Remove plugin
	 * @returns null
	 */
	remove: () => {
		return plugins.remove({
			plugin,
			key,
			title
		});
	}
}