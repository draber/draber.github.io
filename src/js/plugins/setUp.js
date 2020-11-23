import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import settings from '../modules/settings.js';

const title = "Settings";
const key = 'settings';
const optional = false;

let plugin;

const populate = (app, frame) => {

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
				click: function (evt) {
					app.dispatchEvent(new CustomEvent(`sba${key}`, {
						detail: {
							enabled: this.checked
						}						
					}))
				}
			}
		}));
		frame.append(li);
	};
}


export default {
	add: (app) => {

		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
		});

		const frame = el.create({
			tag: 'ul',
			classNames: ['frame']
		});


		plugin.append(frame);

		app.addEventListener('sbaLaunchComplete', evt => {
			populate(app, frame);
		});

		return plugins.add(app, plugin, key, title, optional);
	},
	remove: () => {
		plugin = plugins.remove(plugin, key, title);
		return true;
	}
}