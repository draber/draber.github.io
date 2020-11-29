import settings from '../../modules/settings.js';
import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';
import data from '../../modules/data.js';
import prefix from '../../modules/prefixer.js';


/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Spill the beans';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'spillTheBeans';

/**
 * Can be removed by the user
 * @type {boolean}
 */
const optional = true;

/**
 * Watches for changes as the user types
 * @type {{args: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
 */
let observer;

/**
 * Check if there are still starting with the search term
 * @param {String} value
 */
const react = (value) => {
    if (!value) {
        return '😐';
    }
    if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
        return '🙁';
    }
    return '🙂';
}

/**
 * Watch the text input for changes
 * Partially initializes the observer, the rest is done in `observers.js` via `plugins.js`
 * @param app
 * @param target
 * @returns {{args: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
 */
const initObserver = (app, target) => {
    const _observer = new MutationObserver(mutationsList => {
        // we're only interested in the very last mutation
        app.dispatchEvent(new CustomEvent(prefix('spill'), {
            detail: {
                text: mutationsList.pop().target.textContent.trim()
            }
        }));
    });
    return {
        observer: _observer, target: target, args: {
            childList: true
        }
    }
}

export default {
    /**
     * Create and attach plugin
     * @param app
     * @param game
     * @returns {HTMLElement|boolean}
     */
    add: (app, game) => {
        // if opted out
        if (settings.get(key) === false) {
            return false;
        }
        observer = initObserver(app, el.$('.sb-hive-input-content', game));

        const pane = el.create({
            classNames: ['pane']
        });
        const description = el.create({
            text: 'Watch me while you type!',
            classNames: ['spill-title']
        })
        const reaction = el.create({
            text: '😐',
            classNames: ['spill']
        });
        pane.append(description);
        pane.append(reaction);

        plugin = el.create({
            tag: 'details',
            text: [title, 'summary']
        });
        app.addEventListener('sbaSpill', evt => {
            reaction.textContent = react(evt.detail.text);
        });
        plugin.append(pane);
        return plugins.add(app, plugin, key, title, optional, observer);
    },
    /**
     * Remove plugin
     * @returns null
     */
    remove: () => {
        return plugins.remove(plugin, key, title, observer);
    }
}
