import el from './element.js';
import observers from './observers.js';
import settings from './settings.js';
import data from './data.js';

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
		app.dispatchEvent(new CustomEvent('sbaUpdate', {
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
		console.error('Spelling Bee not found');
		return false;
	}
	
	const rect = el.$('.sb-content-box', game).getBoundingClientRect();

	const resultList = el.$('.sb-wordlist-items', game);
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
	observer = initObserver(app, resultList);
	observers.add(observer.observer, observer.target, observer.args);
	app.dispatchEvent(new CustomEvent('sbaDarkMode', {
		detail: {
			enabled: settings.get('darkMode')
		}
	}));
	return app;
}
