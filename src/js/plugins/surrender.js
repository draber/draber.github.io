import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';
import observers from '../modules/observers.js';


const title = "Surrender";
const key = 'surrender';
const optional = true;

let plugin;

const pangrams = window.gameData.today.pangrams;

/**
 * Build a single entry for the term list
 *
 * @param term
 * @returns {*}
 */
const buildEntry = term => {
	const entry = el.create({
		tag: 'li',
		classNames: pangrams.includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
	});
	entry.append(el.create({
		tag: 'a',
		text: term,
		attributes: {
			href: `https://www.google.com/search?q=${term}`,
			target: '_blank'
		}
	}));
	return entry;
};

/**
 * Display the solution after confirmation
 */
const resolve = (resultList) => {
	observers.removeAll();
	data.getList('remainders').forEach(term => {
		resultList.append(buildEntry(term));
	});
};

export default {
	add: (app, game) => {

		if (settings.get(key) === false) {
			return false;
		}

		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
		});

		const frame = el.create({
			classNames: ['frame']
		});

		const button = el.create({
			tag: 'button',
			classNames: ['hive-action'],
			text: 'Display answers',
			attributes: {
				type: 'button'
			},
			events: {
				click: function (evt) {
					resolve(el.$('.sb-wordlist-items', game));
				}
			}
		});
		frame.append(button);

		plugin.append(frame);

		return plugins.add(app, plugin, key, title, optional);
	},
	remove: () => {
		plugin = plugins.remove(plugin, key, title);
		return true;
	}
}