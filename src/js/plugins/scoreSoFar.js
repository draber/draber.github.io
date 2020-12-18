import el from '../modules/element.js';
import data from '../modules/data.js';
import { prefix } from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * Populate/update pane
 * @param {HTMLElement} tbody
 */
const update = (tbody) => {
    tbody.innerHTML = '';
    [
        ['', 'Found', 'Missing', 'Total'],
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
    ].forEach(rowData => {
        const tr = el.tr();
        rowData.forEach(cellData => {
            tr.append(el.td({
                text: cellData
            }))
        })
        tbody.append(tr);
    });
}

/**
 * Score so far plugin
 * 
 * @param {App} app
 * @returns {Plugin} ScoreSoFar
 */
class ScoreSoFar extends Plugin {
    constructor(app) {

        super(app, 'Score so far', {
            canDeactivate: true
        });

        this.ui = el.details({
            attributes: {
                open: true
            }
        });

        // add and populate content pane        
        const pane = el.table({
            classNames: ['pane']
        });
        const tbody = el.tbody();
        pane.append(tbody);
        update(tbody);

        this.ui.append(el.summary({
            text: this.title
        }), pane);

        // update on demand
        app.on(prefix('wordsUpdated'), () => update(tbody));

        this.add();
    }
}

export default ScoreSoFar;
