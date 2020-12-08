import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import {
	prefix,
	camel
} from './string.js';


/**
 * App container
 * @param {HTMLElement} game
 * @returns {app} app
 */
class app {
	constructor(game) {
		if (!game || !window.gameData) {
			console.info(`This bookmarklet only works on ${settings.get(targetUrl)}`);
			return false;
		}

		this.title = settings.get('label');
		this.key = camel(this.title);
		this.game = game;	

		const oldInstance = el.$(`[data-id="${this.key}"]`);
		if (oldInstance) {
			oldInstance.dispatchEvent(new Event(prefix('destroy')));
		}

		this.registry = new Map();

		this.remove = () => {
			this.ui.remove();
		}

		this.on = (evt, action) => {
			this.ui.addEventListener(evt, action);
		}

		this.trigger = (evt) => {
			this.ui.dispatchEvent(evt);
		}

		const rect = el.$('.sb-content-box', game).getBoundingClientRect();

		const resultList = el.$('.sb-wordlist-items', game);
		const events = {};
		events[prefix('destroy')] = () => {
			this.remove();
		};
		this.ui = el.create({
			attributes: {
				draggable: true
			},
			style: {
				left: (rect.right + 10) + 'px',
				top: (rect.top + window.pageYOffset) + 'px',
			},
			data: {
				id: this.key
			},
			classNames: [settings.get('prefix')],
			events: events
		});

		data.init(this, resultList);
        
        this.observer = new MutationObserver(mutationsList => {
			this.trigger(new CustomEvent(prefix('update'), {
				detail: {
					text: mutationsList.pop().addedNodes[0]
				}
			}));
		})
		
		this.observer.observe(resultList, {
            childList: true
		});

		this.registerPlugins = (plugins) => {
			for (const [key, plugin] of Object.entries(plugins)) {
				this.registry.set(key, new plugin(this));
			}
		}
		
		el.$('body').append(this.ui);
	};
}

export default app;
