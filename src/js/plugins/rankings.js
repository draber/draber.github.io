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

    run() {

        const points = data.getPoints('foundTerms');
        const max = data.getPoints('answers');
        const missing = this.getNextTier();

        let content;

        if(points < max) {
            content = el.span({
                content: [
                    'You are currently at ',
                    el.b({
                        content: points + '/' + max
                    }),
                    ' points or ',
                    el.b({
                        content: Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100) + '%'
                    }),
                    '. You need ',
                    el.b({
                        content: this.getNextTier()
                    }),
                    ' more points to go to the next level.',
                ]
            })
        }
        else {
            content = el.span({
                content: [
                    'Congratulations, you’ve found all ',
                    el.b({
                        content: points
                    }),
                    ' points!',
                ]
            })
        }

        const progress = points * 100 / max;

        this.popup
            .setContent('subtitle', el.span({
                content
            }))
            .setContent('body', this.table.getPane())
            .toggle(true);

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
     * Get current tier
     * @param {String}
     */
    getNextTier() {
        const remainders = this.getData().filter(entry => entry[1] > data.getPoints('foundTerms')).pop();
        return remainders ? remainders[1] : null;
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

        this.popup = new Popup(this.key)
            .setContent('title', this.title);

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        this.table = new TablePane(app, this.getData, {
            completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
            preeminent: rowData => rowData[1] === this.getCurrentTier()
        })
    }
}

export default Rankings;