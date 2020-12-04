import settings from '../../modules/settings.js';
import el from '../../modules/element.js';
import plugins from '../../modules/plugins.js';
import data from '../../modules/data.js';
import pf from '../../modules/prefixer.js';

/**
 * {HTMLElement}
 */
let plugin = null;

/**
 * Display name
 * @type {string}
 */
const title = 'Score so far';

/**
 * Internal identifier
 * @type {string}
 */
const key = 'scoreSoFar';

/**
 * Can be removed by the user
 * @type {boolean}
 */
const optional = true;

/**
 * Updatable part of the pane
 * @type {HTMLElement}
 */
const tbody = el.create({
    tag: 'tbody'
});

/**
 * Populate/update pane
 */
const update = () => {
    tbody.innerHTML = '';
    [
        [
            'Words',
            data.getCount('foundTerms'),
            data.getCount('remainders'),
            data.getCount('answers')
        ],
        [
            'Points',
            data.getPoints('foundTerms'),
            data.getPoints('remainders'),
            data.getPoints('answers')
        ]
    ].forEach(cellData => {
        tbody.append(el.create({
            tag: 'tr',
            cellData: cellData
        }));
    });
}

export default {
    /**
     * Create and attach plugin
     * @param {HTMLElement} app
     * @param {HTMLElement} game
     * @returns {HTMLElement|null} plugin
     */
    add: (app, game) => {
        
        // if user has not disabled the plugin
        if (!plugins.isDisabled(key)) {

            plugin = el.create({
                tag: 'details',
                text: [title, 'summary'],
                attributes: {
                    open: true
                }
            });

            // add and populate content pane        
            const pane = el.create({
                tag: 'table',
                classNames: ['pane']

            });
            const thead = el.create({
                tag: 'thead'
            });
            thead.append(el.create({
                tag: 'tr',
                cellTag: 'th',
                cellData: ['', 'Found', 'Missing', 'Total']
            }))
            pane.append(thead);
            pane.append(tbody);
            update();
            plugin.append(pane);

            // update on demand
            app.addEventListener(pf('updateComplete'), () => {
                update();
            });
        }

        return plugins.add({
            app,
            plugin,
            key,
            title,
            optional
        });
    },
    /**
     * Remove plugin
     * @returns null
     */
    remove: () => {
        return plugins.remove({
            plugin,
            key,
            title
        });
    }
}