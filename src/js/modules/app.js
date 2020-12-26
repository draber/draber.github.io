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

    registerPlugins(plugins) {
        for (const [key, plugin] of Object.entries(plugins)) {
            this.registry.set(key, new plugin(this));
        }
        this.trigger(new CustomEvent(prefix('pluginsReady'), {
            detail: this.registry
        }))
        return this.registerTools();
    }

    registerTools() {
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

        this.parent = el.div({classNames: [prefix('container')]});
        
        const resultList = el.$('.sb-wordlist-items', game);
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.parent.remove();
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
        
        // minimize on smaller screens
        const mql = window.matchMedia('(max-width: 1196px)');
        mql.addEventListener('change', evt => this.toggle(!evt.currentTarget.matches));
        mql.dispatchEvent(new Event('change'));

        const wordlistToggle = el.$('.sb-toggle-expand');
        wordlistToggle.addEventListener('click', evt => {
            this.ui.style.display = el.$('.sb-toggle-icon-expanded', wordlistToggle) ? 'none' : 'block';
        })
        if(el.$('.sb-toggle-icon-expanded', wordlistToggle)){
            wordlistToggle.dispatchEvent(new Event('click'));
        }

        this.parent.append(this.ui);
        game.before(this.parent);
    };
}

export default App;