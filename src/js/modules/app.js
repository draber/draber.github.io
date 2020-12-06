import el from './element.js';
import observers from './observers.js';
import settings from './settings.js';
import data from './data.js';
import pf from './prefixer.js';

/**
 * Watch the result list for changes
 * Partially initializes the observer, the rest is done in `observers.js`
 * @param app
 * @param target
 * @returns {{config: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
 */
const initObserver = (app, target) => {
	const _observer = new MutationObserver(mutationsList => {
		// we're only interested in the very last mutation
		app.dispatchEvent(new CustomEvent(pf('update'), {
			detail: {
				text: mutationsList.pop().addedNodes[0]
			}
		}));
	});
	return {
		observer: _observer,
		target: target,
		config: {
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
	if (!game || !window.gameData) {
		console.info('This bookmarklet only works on https://www.nytimes.com/puzzles/spelling-bee');
		return false;
	}
	const rect = el.$('.sb-content-box', game).getBoundingClientRect();

	const resultList = el.$('.sb-wordlist-items', game);
	const events = {};
	events[pf('destroy')] = evt => {
		observers.removeAll();
		evt.target.remove();
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
	observers.add(initObserver(app, resultList));
	return app;
}