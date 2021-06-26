import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Popup from './popup.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

/**
 * Steps to success plugin
 * 
 * @param {App} app
 * @returns {Plugin} Rankings
 */
class Rankings extends Plugin {

    toggle(state) {

        const progress = data.getPoints('foundTerms') * 100 / data.getPoints('answers');

        this.popup
            .setContent('title', this.title)
            .setContent('subtitle', el.span({
                content: [
                    'You are currently at ',
                    el.b({
                        content: data.getPoints('foundTerms') + '/' + data.getPoints('answers')
                    }),
                    ' points or ',
                    el.b({
                        content: Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100) + '%'
                    }),
                    '.',
                ]
            }))
            .setContent('body', this.table.getPane())
            .toggle(state);

        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const maxPoints = data.getPoints('answers');
        return [
            ['Beginner', 0],
            ['Good Start', 2],
            ['Moving Up', 5],
            ['Good', 8],
            ['Solid', 15],
            ['Nice', 25],
            ['Great', 40],
            ['Amazing', 50],
            ['Genius', 70],
            ['Queen Bee', 100]
        ].map(entry => {
            return [entry[0], Math.round(entry[1] / 100 * maxPoints), entry[1]];
        })
    }

    /**
     * Get current tier
     * @param {String}
     */
    getCurrentTier() {
        return this.getData().filter(entry => entry[1] <= data.getPoints('foundTerms')).pop()[1];
    }

    /**
     * Rankings constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Your Progress', 'The number of points required for each level', {
            canChangeState: true,
            defaultState: false
        });

        this.popup = new Popup(this.key);

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        this.table = new TablePane(app, this.getData, {
            completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
            preeminent: rowData => rowData[1] === this.getCurrentTier()
        })
    }
}

export default Rankings;