import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';


/**
 * App container
 * @param {HTMLElement} game
 * @returns {App} app
 */
class App extends Widget {
    constructor(game) {
        if (!game || !window.gameData) {
            console.info(`This bookmarklet only works on ${settings.get('targetUrl')}`);
            return false;
        }

        super(settings.get('label'), {
            canDeactivate: true
        });
        this.game = game;

        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        this.registry = new Map();
        this.toolButtons = new Map();

        this.parent = el.$('.sb-content-box', game);

        const resultList = el.$('.sb-wordlist-items', game);
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.ui.remove();
        };
        this.ui = el.div({
            data: {
                id: this.key
            },
            classNames: [settings.get('prefix')],
            events: events
        });

        data.init(this, resultList);

        this.observer = new MutationObserver(() => this.trigger(new Event(prefix('newWord'))));

        this.observer.observe(resultList, {
            childList: true
        });

        this.registerPlugins = plugins => {
            for (const [key, plugin] of Object.entries(plugins)) {
                this.registry.set(key, new plugin(this));
            }
            this.trigger(new CustomEvent(prefix('pluginsReady'), {
                detail: this.registry
            }))
            return this.registerTools();
        }

        this.registerTools = () => {
            this.registry.forEach(plugin => {
                if (plugin.tool) {
                    this.toolButtons.set(plugin.key, plugin.tool);
                }
            })
            this.enableTool('arrowDown', 'Maximize assistant', 'Minimize assistant');
            this.tool.classList.add('minimizer');
            this.toolButtons.set(this.key, this.tool);
            return this.trigger(new CustomEvent(prefix('toolsReady'), {
                detail: this.toolButtons
            }))
        }

        // minimize on smaller screens
        const mql = window.matchMedia('(max-width: 1196.98px)');
        mql.addEventListener('change', evt => this.toggle(!evt.matches));
        mql.dispatchEvent(new Event('change'));

        const wordlistToggle = el.$('.sb-toggle-icon');
        el.$('.sb-toggle-expand').addEventListener('click', evt => {
            this.ui.style.display = wordlistToggle.classList.contains('sb-toggle-icon-expanded') ? 'none' : 'block';
        })

        this.parent.append(this.ui);
    };
}

export default App;