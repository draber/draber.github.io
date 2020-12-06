import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import data from '../../modules/data.js';
import pf from '../../modules/prefixer.js';

/**
 * Stylesheet plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class scoreSoFar {
    constructor(app, ...args) {

        this.app = app;
        this.args = args; 
        this.title = 'Score so far';
        this.key = 'scoreSoFar';
        this.optional = true;

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

        // has the user has disabled the plugin?
        if (pluginManager.isEnabled(this.key, true)) {

            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary'],
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
            }));
            pane.append(thead);
            pane.append(tbody);
            update();
            this.ui.append(pane);

            // update on demand
            app.addEventListener(pf('updateComplete'), () => {
                update();
            });
        }
    }
}

export default scoreSoFar;