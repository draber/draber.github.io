import el from '../modules/element.js';
import DisclosureBox from './disclosureBox.js';
import {
    prefix
} from '../modules/string.js';

/**
 * TablePane plugin
 * 
 * @param {App} app
 * @returns {Plugin} TablePane
 */
class TablePane extends DisclosureBox {

	/**
	 * Build/refresh pane
	 * @param {Event} evt
	 * @returns {TablePane}
	 */
	run(evt) {
		if(!evt.detail.newData){
			return this;
		}
		this.pane = el.empty(this.pane);
		const tbody = el.tbody();
		this.getData().forEach((rowData, i) => {
			const classNames = [];
			for (const [marker, fn] of Object.entries(this.cssMarkers)) {
				if(fn(rowData, i)) {					
					classNames.push(prefix(marker, 'd')) 
				}
			}
			tbody.append(el.tr({
				classNames,
				content: rowData.map(cellData => el.td({
					content: cellData
				}))
			}));
		});
		this.pane.append(tbody);
		return this;
	}

	/**
	 * TablePane constructor
	 * @param {App} app
	 * @param {String} title
	 * @param {String} description
	 * @param {Boolean} canChangeState
	 * @param {Boolean} defaultState
	 * @param {Boolean} open
	 * @param {String} runEvt
	 */
	constructor(app, title, description, {
        canChangeState,
        defaultState = true,
        open = false,
		runEvt = prefix('refreshUi')
    } = {}) {

		super(app, title, description, {
			canChangeState,
			defaultState,
			open,
			runEvt
		});

		this.cssMarkers = {};
      
		this.pane = el.table({
			classNames: ['pane']
		});
	}
}

export default TablePane;
