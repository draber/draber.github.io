import settings from '../modules/settings.js';
import el from '../modules/element.js';
import observers from '../modules/observers.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';

const title = "Spill the beans";
const key = 'spillTheBeans';
const optional = true;

let observer;
let plugin;

/**
 * Check if there are still starting with the search term
 * 
 * @param {String} value 
 */
const react = (value) => {
	if (!value) {
		return '😐';
	}
	if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
		return '🙁';
	};
	return '🙂';
}


const addObserver = (app, target) => {
	observer = new MutationObserver(mutationsList => {
		// we're only interested in the very last mutation
		app.dispatchEvent(new CustomEvent('sbaSpill', {
			detail: {
				text: mutationsList.pop().target.textContent.trim()
			}
		}));
	});
	observers.add(observer, target, {
		childList: true
	});
}

export default {
	add: (app, observerTarget) => {
	
		if (settings.get(key) === false) {
			return false;
		}
		addObserver(app, observerTarget);
		
	
		const frame = el.create({
			classNames: ['frame']
		});
		const description = el.create({
			text: 'Watch me while you type!',
			classNames: ['spill-title']
		})
		const reaction = el.create({
			text: '😐',
			classNames: ['spill']
		});
		frame.append(description);	
		frame.append(reaction);
	
		plugin = el.create({
			tag: 'details',
			text: [title, 'summary']
		});
		app.addEventListener('sbaSpill', evt => {
			reaction.textContent = react(evt.detail.text);
		});

		plugin.append(frame);
	
		return plugins.add(app, plugin, key, title, optional);
	},
	remove: () => {
		plugin = plugins.remove(plugin, key, title);
		observers.remove(observer);
	
		return true;
	}
}
