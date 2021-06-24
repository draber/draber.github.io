import el from '../modules/element.js';
import {
	prefix
} from '../modules/string.js';

/**
 * TablePane plugin
 * 
 * @param {App} app
 * @returns {Plugin} TablePane
 */
class TablePane {

	/**
	 * Build/refresh pane
	 * @returns {TablePane}
	 */
	run() {
		this.pane = el.empty(this.pane);
		const tbody = el.tbody();
		this.getData().forEach((rowData, i) => {
			const classNames = [];
			for (const [marker, fn] of Object.entries(this.cssMarkers)) {
				if (fn(rowData, i)) {
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

	getPane() {
		return this.pane;
	}

	/**
	 * TablePane constructor
	 * @param {App} app
	 * @param {String} title
	 * @param {String} description
	 * @param {Boolean} canChangeState
	 * @param {Boolean} defaultState
	 * @param {String} runEvt
	 */
	constructor(app, getData, cssMarkers = {}) {

		app.on(prefix('refreshUi'), evt => {
			this.run();
		});

		this.cssMarkers = cssMarkers;
		this.getData = getData;
		this.pane = el.table({
			classNames: ['pane', prefix('dataPane', 'd')]
		});
	}
}

export default TablePane;