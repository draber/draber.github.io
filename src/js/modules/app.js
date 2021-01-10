import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';


// noinspection JSUnresolvedVariable
/**
 * App container
 * @param {HTMLElement} game
 * @returns {App} app
 */
class App extends Widget {

    /**
     * Register all plugins
     * @param plugins
     * @returns {Widget}
     */
    registerPlugins(plugins) {
        for (const [key, plugin] of Object.entries(plugins)) {
            this.registry.set(key, new plugin(this));
        }
        this.trigger(prefix('pluginsReady'), this.registry);
        return this.registerTools();
    }

    /**
     * Register tools for tool bar
     * @returns {Widget}
     */
    registerTools() {
        this.registry.forEach(plugin => {
            if (plugin.tool) {
                this.toolButtons.set(plugin.key, plugin.tool);
            }
        })
        this.enableTool('arrowDown', 'Maximize assistant', 'Minimize assistant');
        this.tool.classList.add('minimizer');
        this.toolButtons.set(this.key, this.tool);
        return this.trigger(prefix('toolsReady'), this.toolButtons);
    }

    /**
     * Builds the app
     * @param {HTMLElement} game
     */
    constructor(game) {

        super(settings.get('label'), {
            canChangeState: true,
            key: prefix('app'),
        });
        this.game = game;

        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        this.registry = new Map();
        this.toolButtons = new Map();

        this.parent = el.div({
            classNames: [prefix('container')]
        });

        const resultList = el.$('.sb-wordlist-items', game);
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.parent.remove();
        };

        this.isDraggable = true;

        this.ui = el.div({
            attributes: {
                draggable: this.isDraggable
            },
            data: {
                id: this.key
            },
            classNames: [settings.get('prefix')],
            events: events
        });

        /**
         * The element that is used to drag the app
         * @type {HTMLElement}
         */
        this.dragHandle = this.ui;

        /**
         * The area in which the app can be dragged
         * @type {HTMLElement}
         */
        this.dragArea = this.game;

        /**
         * The offset from the borders of the drag area in px
         * @type {int|{top: int, right: int, bottom: int, left: int}}
         */
        this.dragOffset = 12;

        data.init(this, resultList);

        this.observer = (() => {
            const observer = new MutationObserver(mutationsList => this.trigger(prefix('newWord'), mutationsList.pop().addedNodes[0]));
            observer.observe(resultList, {
                childList: true
            });
            return observer;
        })();

        // minimize on smaller screens
        const mql = window.matchMedia('(max-width: 1196px)');
        mql.addEventListener('change', evt => this.toggle(!evt.currentTarget.matches));
        mql.dispatchEvent(new Event('change'));

        const wordlistToggle = el.$('.sb-toggle-expand');
        wordlistToggle.addEventListener('click', () => {
            this.ui.style.display = el.$('.sb-toggle-icon-expanded', wordlistToggle) ? 'none' : 'block';
        })
        if (el.$('.sb-toggle-icon-expanded', wordlistToggle)) {
            wordlistToggle.dispatchEvent(new Event('click'));
        }

        this.toggle(this.getState());
        this.parent.append(this.ui);
        game.before(this.parent);
    }
}

export default App;