import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';

const title = "Spoilers";
const key = 'spoilers';
const optional = true;

let plugin;

const tbody = el.create({ tag: 'tbody'});

const getCellData = () => {
	const counts = {};
	const answers = data.getList('answers');
	const foundTerms = data.getList('foundTerms');
	const pangramCount = data.getCount('pangrams');
	const foundPangramCount = data.getCount('foundPangrams');
	const cellData = [
		[
			'Pangrams',
			foundPangramCount,
			pangramCount - foundPangramCount,
			pangramCount
		]
	];
    answers.forEach(term => {
        counts[term.length] = counts[term.length] || {
            found: 0,
            missing: 0,
            total: 0
        };
        if (foundTerms.includes(term)) {
            counts[term.length].found++;
        } else {
            counts[term.length].missing++;
        }
        counts[term.length].total++;
	});
	let keys = Object.keys(counts);
	keys.sort((a, b) => a - b);
	keys.forEach(count => {
		cellData.push([
			count + ' ' + (count > 1 ? 'letters' : 'letter'),
			counts[count].found,
			counts[count].missing,
			counts[count].total
		]);
	});
    return cellData;
};

const update = () => {
	tbody.innerHTML = ''; 
	getCellData().forEach(cellData => {
		tbody.append(el.create({
			tag: 'tr',
			cellData: cellData
		}));
	});
}

export default {
	add: (app, game) => {
	
		if (settings.get(key) === false) {
			return false;
		}
	
		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
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
