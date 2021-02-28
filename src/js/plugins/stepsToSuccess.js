import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Steps to success plugin
 * 
 * @param {App} app
 * @returns {Plugin} StepsToSuccess
 */
class StepsToSuccess extends Plugin {

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
     * Populate/update pane
     * @param {HTMLElement} pane
     */
    getCurrentTier() {
        return this.getData().filter(entry => entry[1] <= data.getPoints('foundTerms')).pop()[1];
    }

    constructor(app) {

        super(app, 'Steps to success', {
            canChangeState: true
        });

        this.ui = el.details();

        // add and populate content pane        
        const pane = tbl.get(this.getData(), null, this.getCurrentTier());

        this.ui.append(el.summary({
            text: this.title
        }), pane);

        // update on demand
        app.on(prefix('wordsUpdated'), () => {
            tbl.get(this.getData(), pane, this.getCurrentTier());
        });

        this.add();
    }
}

export default StepsToSuccess;