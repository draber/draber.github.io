import el from '../../modules/element.js';
import data from '../../modules/data.js';
import {
    prefix,
    camel
} from '../../modules/string.js';
import plugin from '../../modules/pluginBase.js';


/**
 * Populate/update pane
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
 * Dark Mode plugin
 * 
 * @param {plugin} app
 * @returns {plugin} scoreSoFar
 */
class scoreSoFar extends plugin {
    constructor(app) {

        super(app);

        this.title = 'Score so far';
        this.key = camel(this.title);
        this.optional = true;

        this.ui = el.create({
            tag: 'details',
            text: [this.title, 'summary'],
            attributes: {
                open: true
            },
            classNames: !this.isEnabled ? ['inactive'] : []
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
        app.on(prefix('updateComplete'), () => {
            update(tbody);
        });

        this.add();
    }
}

export default scoreSoFar;
