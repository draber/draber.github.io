import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';

const getEntryCoords = () => {
    const breakPoints = [
        '(max-width: 350px)',
        '(max-width: 370px)',
        '(max-width: 443.98px)',
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

        this.parent = el.$('.sb-content-box', game);

        /**
         * Reposition app on load , window.resize, window.orientationchange
         */
        const reposition = () => {
            const oldState = this.isActive();
            const rect = this.parent.getBoundingClientRect();
            let position;
            position = {
                left: '10px',
                top: (rect.top + window.pageYOffset) + 'px'
            }
            // if(document.documentElement.clientWidth < this.appRect.left + this.appRect.width){
            //     this.toggle(false);
            //     position = {
            //         left: (rect.left + 200) + 'px',
            //         top: (rect.top + window.pageYOffset) + 'px'
            //     }
            // }
            // else {
            //     this.toggle(oldState);
            //     position = {
            //         left: (rect.right + 10) + 'px',
            //         top: (rect.top + window.pageYOffset) + 'px'
            //     }
            // }
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
            return this;
        }

        this.registerTools = () => {
            const toolbar = el.div({
                classNames: ['toolbar']
            })
            this.registry.forEach(plugin => {
                if (plugin.tool) {
                    toolbar.append(plugin.tool)
                }
            })
            this.enableTool('arrowDown', 'Maximize', 'Minimize');
            this.tool.classList.add('minimizer');
            toolbar.append(this.tool);
            this.registry.get('Header').ui.append(toolbar)
            return this;
        }

        el.$('body').append(this.ui);

        this.appRect = this.ui.getBoundingClientRect();
        reposition();

        window.addEventListener('orientationchange', () => {
            reposition();
        })
        //getEntryCoords();
    };
}

export default App;