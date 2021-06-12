import data from '../modules/data.js';
import TablePane from './tablePane.js';

/**
 * Steps to success plugin
 * 
 * @param {App} app
 * @returns {Plugin} StepsToSuccess
 */
class StepsToSuccess extends TablePane {

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
            return [entry[0], Math.round(entry[1] / 100 * maxPoints)];
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
     * StepsToSuccess constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Steps to success', 'The number of points required for each level', {
            canChangeState: true
        });

        /**
         * Conditions ander which a line in the table should be marked with the class `sba-{$key}`
         * @type {{preeminent: (function(*): boolean), completed: (function(*))}}
         */
        this.cssMarkers = {
            completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
            preeminent: rowData => rowData[1] === this.getCurrentTier()
        }
    }
}

export default StepsToSuccess;
