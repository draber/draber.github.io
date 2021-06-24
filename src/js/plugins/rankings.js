import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Popup from './popup.js';

/**
 * Steps to success plugin
 * 
 * @param {App} app
 * @returns {Plugin} Rankings
 */
class Rankings extends Popup {

    toggle(state) {

		if(!state) {
			this.popup.toggle(state);
			return this;
		}


		this.popup
        .setContent('subtitle', `You have currently ${data.getPoints('foundTerms')}/${data.getPoints('answers')} points.`)
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
     * Rankings constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Rankings', 'The number of points required for each level', {
            canChangeState: true,
            defaultState: false
        });

        this.popup = new Popup(this.app, this.title, this.description, {
            key: this.key + 'PopUp'
        });

        this.menuIcon = 'null';

        
        this.table = new TablePane(this.app, this.getData, {
            completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
            preeminent: rowData => rowData[1] === this.getCurrentTier()
        })

        this.toggle(false);
    }
}

export default Rankings;