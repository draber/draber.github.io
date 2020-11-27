import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';

const title = 'Header';
const key = 'header';
const optional = false;

let plugin;

let params;

const getDragParams = (evt, game) => {
    const gRect = game.getBoundingClientRect();
    const aRect = evt.target.getBoundingClientRect();
    const aStyle = getComputedStyle(evt.target);
    const minT = gRect.top + window.pageYOffset;
    const pRect = el.$(`[data-plugin="${key}"]`).getBoundingClientRect();
    const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height; // - margin?

    const result = {
        maxL: document.documentElement.clientWidth - aRect.width,
        minT: minT,
        maxT: minT + gAvailH,
        offX: evt.clientX - aRect.x,
        offY: evt.clientY - aRect.y,
        margT: parseInt(aStyle.marginTop, 10)
    };

    return result;
}

/**
 * 
 * @param {*} evt 
 */
const getDropPosition = evt => {
    let left = Math.max(0, (evt.clientX - params.offX));
    left = Math.min(left, (params.maxL)) + 'px';
    let top = Math.max(params.minT, (evt.clientY + window.pageYOffset - params.margT - params.offY));
    top = Math.min(top, params.maxT) + 'px';
    console.log('end', top, params.maxT, evt.clientY, params.offY);
    return {
        left,
        top
    };
}

/**
 * Implement drag/drop
 * @param app
 * @returns {*}
 */
const makeDraggable = (app, game) => {

    game.addEventListener('dragover', evt => {
        evt.preventDefault();
    });

    app.addEventListener('dragstart', evt => {
        evt.target.style.opacity = .2;
        params = getDragParams(evt, game);
        console.log('start', params)
    }, false);

    app.addEventListener('dragend', evt => {
        Object.assign(evt.target.style, getDropPosition(evt));
        evt.target.style.opacity = 1;
    });
}


export default {
    add: (app, game) => {

        plugin = el.create();
        const title = el.create({
            text: settings.get('title'),
            attributes: {
                title: 'Hold the mouse down to drag'
            },
            classNames: ['dragger']
        });
        plugin.append(title);

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
    remove: () => {
        plugin = plugins.remove(plugin, key, title);
        return true;
    }
}