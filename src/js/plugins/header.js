import settings from '../modules/settings.js';
import el from '../modules/element.js';
import plugins from '../modules/plugins.js';

const title = 'Header';
const key = 'header';
const optional = false;

let plugin;

/**
 * Implement drag/drop
 * @param app
 * @returns {*}
 */
const makeDraggable = (plugin, app) => {

    let headerHeight;
    let screenWidth;

    app.addEventListener('dragstart', (evt) => {
        headerHeight = el.$('header').clientHeight;
        screenWidth = screen.availWidth;
        evt.stopPropagation();
        const style = getComputedStyle(app);
        evt.dataTransfer.effectAllowed = 'move';
        app.classList.add('dragging');
        app.dataset.right = style.getPropertyValue('right');
        app.dataset.top = style.getPropertyValue('top');
        app.dataset.mouseX = evt.clientX;
        app.dataset.mouseY = evt.clientY;
    }, false);

    app.addEventListener('dragend', (evt) => {
        evt.stopPropagation();
        const pos = {
            x: parseInt(app.dataset.right) - (evt.clientX - app.dataset.mouseX),
            y: parseInt(app.dataset.top) + (evt.clientY - app.dataset.mouseY)
        };
        app.style.right = pos.x + 'px';
        app.style.top = pos.y + 'px';
        app.classList.remove('dragging');
        const rect = app.getBoundingClientRect();
        const neededW = rect.x + rect.width;
        console.log({rw: rect.x, sw: screenWidth, swa: neededW, px: pos.x})
        if(rect.x < 0) {
            app.style.right = pos.x + rect.x + 'px';
        }
        else if(rect.x + rect.width > screenWidth) {
            app.style.right = pos.x - (neededW - screenWidth) + 'px';
        }
        if(rect.y < headerHeight) {
            app.style.top = pos.y - (headerHeight - rect.y) + 'px';
        }
    }, false);
}

export default {
    add: (app) => {

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

        makeDraggable(plugin, app);

        return plugins.add(app, plugin, key, title, optional);
    },
    remove: () => {
        plugin = plugins.remove(plugin, key, title);
        return true;
    }
}