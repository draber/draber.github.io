import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import plugin from '../modules/pluginBase.js';

/**
 * Populate/update pane
 * @param {HTMLElement} tbody
 */
const update = (tbody) => {
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

/**
 * Score so far plugin
 * 
 * @param {app} app
 * @returns {plugin} scoreSoFar
 */
class scoreSoFar extends plugin {
    constructor(app) {

        super(app, 'Score so far', {
            optional: true
        });

        this.ui = el.create({
            tag: 'details',
            text: [this.title, 'summary'],
            attributes: {
                open: true
            },
            classNames: !this.isEnabled() ? ['inactive'] : []
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
        }));
        const tbody = el.create({
            tag: 'tbody'
        });
        pane.append(thead);
        pane.append(tbody);
        update(tbody);
        this.ui.append(pane);

        // update on demand
        app.on(prefix('newWord'), (evt) => {
            update(tbody);
        });

        this.add();
    }
}

export default scoreSoFar;
