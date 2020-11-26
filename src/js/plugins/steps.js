import el from '../modules/element.js';
import plugins from '../modules/plugins.js';
import data from '../modules/data.js';
import observers from '../modules/observers.js';

const title = "Steps to success";
const key = 'steps';
const optional = true;

let observer;
let plugin;

const steps = {};

const allPoints = data.getPoints('answers');

const addObserver = (target, frame) => {
    observer = new MutationObserver(mutationsList => {
        const node = mutationsList.pop().target;
        const title = el.$('.sb-modal-title', node);
        if (title && title.textContent.trim() === 'Rankings') {
            init(target, frame);
        }
    });
    observers.add(observer, target, {
        childList: true
    });
}

const init = (modal, frame) => {
    el.$$('.sb-modal-list li', modal).forEach(element => {
        const values = element.textContent.match(/([^\(]+) \((\d+)\)/);
        steps[values[1]] = parseInt(values[2], 10);
    });
    steps['Queen Bee'] = allPoints;
    el.$('.sb-modal-close', modal).click();
    observers.remove(observer);
    update(frame);
}

const update = (frame) => {
    frame.innerHTML = '';
    const ownPoints = data.getPoints('foundTerms');

    for (const [key, value] of Object.entries(steps)) {
        frame.append(el.create({
            tag: 'tr',
            classNames: ownPoints >= value ? ['done'] : [],
            cellTag: 'td',
            cellData: [key, value]
        }));
    };
}


export default {
    add: (app, gameContainer) => {

        plugin = el.create({
            tag: 'details',
            text: [title, 'summary']
        });


        const content = el.create({
            tag: 'table'
        });
        const frame = el.create({
            tag: 'tbody'
        });
        content.append(frame);

        plugin.addEventListener('toggle', event => {
            if (plugin.open && !frame.hasChildNodes()) {
                addObserver(el.$('.sb-modal-wrapper'), frame);
                el.$('.sb-progress', gameContainer).click();
            }
        });

        plugin.append(content);

        app.addEventListener('sbaUpdateComplete', evt => {
            update(frame);
        });

        return plugins.add(app, plugin, key, title, optional);
    },
    remove: () => {
        plugin = plugins.remove(plugin, key, title);
        observers.remove(observer);
        return true;
    }
}