import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';

const title = "Score so far";
const key = 'scoreSoFar';
const optional = true;

let plugin;

const tbody = el.create({ tag: 'tbody'});

const update = () => {
	tbody.innerHTML = ''; 
	[
		[
			'Words',
			data.getCount('foundTerms'),
			data.getCount('remainders'),
			data.getCount('answers')
		],
		[
			'Points',
			data.getPoints('foundTerms'),
			data.getPoints('remainders'),
			data.getPoints('answers')
		]
	].forEach(cellData => {
		tbody.append(el.create({
			tag: 'tr',
			cellData: cellData
		}));
	});
}

export default {
	add: (app) => {

		if(settings.get(key) === false){
			return false;
		}
	
		plugin = el.create({
			tag: 'details',
			text: [title, 'summary'],
			attributes: {
				open: true
			}
		});
		
		const content = el.create({ tag: 'table'});
		const thead = el.create({ tag: 'thead'});
		thead.append(el.create({
			tag: 'tr',
			cellTag: 'th',
			cellData: ['', 'Found', 'Missing', 'Total']
		}))
		content.append(thead);
		content.append(tbody);

		update();

		plugin.append(content);

		app.addEventListener('sbaUpdateComplete', evt => {
			update();
		});
	
		return plugins.add(app, plugin, key, title, optional);
	},
	remove: () => {
		plugin = plugins.remove(plugin, key, title);	
		return true;
	}
}
