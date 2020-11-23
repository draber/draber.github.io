import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';

const title = 'Footer';
const key = 'footer';
const optional = false;

let plugin;

export default {
	add: (app) => {
	
		plugin = el.create({
			tag: 'a',
			text: `${settings.get('label')} ${settings.get('version')}`,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
		})
	
		return plugins.add(app, plugin, key, title, optional);
	},
	remove: () => {
		plugin = plugins.remove(plugin, key, title);	
		return true;
	}
}
