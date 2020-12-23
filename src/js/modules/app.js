import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';

const getEntryCoords = () => {
    const breakPoints = [
        '(max-width: 350px)', // left: 12px; top: 735px; minimized
        '(max-width: 370px)', // left: 12px; top: 735px; minimized
        '(max-width: 443.98px)', // left: 12px; top: 654px; minimized
        '(max-width: 991.98px)',
        '(min-width: 444px)',
        '(min-width: 768px)'
    ]

    breakPoints.forEach(point => {
        if (window.matchMedia(point)) {
            console.loh(point)
        }
    })
}



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

        /**
         * Reposition app on load , window.resize, window.orientationchange
         */
        const reposition = () => {
            const oldState = this.isActive();
            const appRect = this.ui.getBoundingClientRect();
            const toolbar = el.$('#portal-game-toolbar');
            const toolbarRect = toolbar.getBoundingClientRect();
            let position;
            let relRect
            if (document.documentElement.clientWidth < 768) {
                relRect = el.$('.sb-wordlist-box', this.game).getBoundingClientRect();
                toolbar.style.justifyContent = 'left';
                position = {
                    left: relRect.right - appRect.width + 'px',
                    top: (toolbarRect.top + window.pageYOffset) - 8 + 'px'
                }
                this.toggle(false);
            }
            Object.assign(this.ui.style, position);
        }

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

        const observer = new MutationObserver(mutationsList => {
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.isEqualNode(this.ui)) {
                        reposition();
                    }
                })
            });

        })

        observer.observe(document.body, {
            childList: true
        });

        document.body.append(this.ui);

        window.addEventListener('orientationchange', () => {
            reposition();
        })
    };
}

export default App;