import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';

/**
 * {HTMLElement}
 */
let plugin;

/**
 * Display name
 * @type {string}
 */
const title = 'Header';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'header';

/**
 * Can't be removed by the user
 * @type {boolean}
 */
const optional = false;

/**
 * Drag start parameters
 * @type {Object}
 */
let params;

/**
 * Assign drag start parameters
 * @param evt
 * @param game
 * @returns {{minT: number, maxT: number, margT, maxL: number, offX: number, offY: number}}
 */
const getDragParams = (evt, game) => {
    const gRect = game.getBoundingClientRect();
    const aRect = evt.target.getBoundingClientRect();
    const minT = gRect.top + window.pageYOffset;
    const pRect = plugin.parentElement.getBoundingClientRect();
    const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;

    return {
        maxL: document.documentElement.clientWidth - aRect.width,
        minT: minT,
        maxT: minT + gAvailH,
        offX: evt.clientX - aRect.x,
        offY: evt.clientY - aRect.y,
        margT: parseInt(getComputedStyle(evt.target).marginTop, 10)
    };
}

/**
 * Get corrected drop position
 * @param evt
 * @returns {{top: string, left: string}}
 */
const getDropPosition = evt => {
    let left = Math.max(0, (evt.clientX - params.offX));
    left = Math.min(left, (params.maxL)) + 'px';
    let top = Math.max(params.minT, (evt.clientY + window.pageYOffset - params.margT - params.offY));
    top = Math.min(top, params.maxT) + 'px';
    return {
        left,
        top
    };
}

/**
 * Implement drag/drop
 * @param {HTMLElement} app
 * @param {HTMLElement} game
 */
const makeDraggable = (app, game) => {

    // ensure correct drag icon
    game.addEventListener('dragover', evt => {
        evt.preventDefault();
    });

    // make app more transparent and get coordinates
    app.addEventListener('dragstart', evt => {
        evt.target.style.opacity = '.2';
        params = getDragParams(evt, game);
    }, false);

    // place app at new position and restore opacity
    app.addEventListener('dragend', evt => {
        Object.assign(evt.target.style, getDropPosition(evt));
        evt.target.style.opacity = '1';
    });
}


export default {
    /**
     * Create and attach plugin
     * @param {HTMLElement} app
     * @param {HTMLElement} game
     * @returns {HTMLElement} plugin
     */
    add: (app, game) => {
        plugin = el.create();
        // add title
        const title = el.create({
            text: settings.get('title'),
            attributes: {
                title: 'Hold the mouse down to drag'
            },
            classNames: ['dragger']
        });
        plugin.append(title);
        // add closer
        const closer = el.create({
            tag: 'span',
            text: '×',
            attributes: {
                title: 'Close'
            },
            classNames: ['closer'],
            events: {
                click: () => {
                    app.dispatchEvent(new Event('sbaDestroy'))
                }
            }
        });
        plugin.append(closer);
        makeDraggable(app, game);
        return plugins.add(app, plugin, key, title, optional);
    },
    /**
     * Remove plugin
     * @returns null
     */
    remove: () => {
        return plugins.remove(plugin, key, title);
    }
}
