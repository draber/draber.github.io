import el from './element.js';
import observers from './observers.js';
import settings from './settings.js';
import data from './data.js';


const addObserver = (app, target) => {
	observers.add(new MutationObserver(mutationsList => {
		// we're only interested in the very last mutation
		app.dispatchEvent(new CustomEvent('sbaUpdate', {
			detail: {
				text: mutationsList.pop().addedNodes[0]
			}
		}));
	}), target, {
		childList: true
	});
}

/**
 * export widget
 */
export default function widget(container) {

	const resultList = el.$('.sb-wordlist-items', container);

	const app = el.create({
		attributes: {
			draggable: true
		},
		data: {
			id: settings.get('repo')
		},
		classNames: ['sba'],
		events: {
			sbaDestroy: evt => {
				observers.removeAll();
				evt.target.remove();
			},
			sbaDarkMode: evt => {
				if (evt.detail.enabled) {
					document.body.classList.add('sba-dark');
				} else {
					document.body.classList.remove('sba-dark');
				}
			}
		}
	});


	data.init(app, resultList);

	addObserver(app, resultList);

	app.dispatchEvent(new CustomEvent('sbaDarkMode', {
		detail: {
			enabled: settings.get('darkMode')
		}
	}));

	return app;
}