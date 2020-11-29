import el from './element.js';
import observers from './observers.js';
import settings from './settings.js';
import data from './data.js';
import prefix from './prefixer.js';

/**
 * Watches for changes as the user types
 * @type {{args: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
 */
let observer;

/**
 * Watch the result list for changes
 * Partially initializes the observer, the rest is done in `observers.js`
 * @param app
 * @param target
 * @returns {{args: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
 */
const initObserver = (app, target) => {
	const _observer = new MutationObserver(mutationsList => {
		// we're only interested in the very last mutation
		app.dispatchEvent(new CustomEvent(prefix('update'), {
			detail: {
				text: mutationsList.pop().addedNodes[0]
			}
		}));
	});
	return {
		observer: _observer, target: target, args: {
			childList: true
		}
	}
}

/**
 * Build app container
 * @param {HTMLElement|null} game
 * @returns {HTMLElement|boolean}
 */
export default function widget(game) {	
    if(!game || !window.gameData) {
        console.info('This bookmarklet only works on https://www.nytimes.com/puzzles/spelling-bee');
        return false;
    }	
	const rect = el.$('.sb-content-box', game).getBoundingClientRect();

	const resultList = el.$('.sb-wordlist-items', game);
	const events = {};
	events[prefix('destroy')] = evt => {
		observers.removeAll();
		evt.target.remove();
	};
	events[prefix('darkMode')] = evt => {
		if (evt.detail.enabled) {
			document.body.classList.add(prefix('dark', 'd'));
		} else {
			document.body.classList.remove(prefix('dark', 'd'));
		}
	};
	const app = el.create({
		attributes: {
			draggable: true
		},
		style: {
			left: (rect.right + 10) + 'px',
			top: (rect.top + window.pageYOffset) + 'px',
		},
		data: {
			id: settings.get('repo')
		},
		classNames: [settings.get('prefix')],
		events: events
	});

	data.init(app, resultList);
	observer = initObserver(app, resultList);
	observers.add(observer.observer, observer.target, observer.args);
	app.dispatchEvent(new CustomEvent(prefix('darkMode'), {
		detail: {
			enabled: settings.get('darkMode')
		}
	}));
	return app;
}
