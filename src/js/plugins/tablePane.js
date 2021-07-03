import el from '../modules/element.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * TablePane plugin
 * 
 * @param {App} app
 * @returns {Plugin} TablePane
 */
class TablePane extends Plugin {

	/**
	 * Build/refresh pane
	 * @param evt
	 * @returns {TablePane}
	 */
	// eslint-disable-next-line no-unused-vars
	run(evt) {
		this.pane = el.empty(this.pane);
		const tbody = el.tbody();
		const data = this.getData();
		const l = data.length;
		data.forEach((rowData, i) => {
			const classNames = [];
			for (const [marker, fn] of Object.entries(this.cssMarkers)) {
				if (fn(rowData, i, l)) {
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
	 * Retrieve table view
	 * @returns {HTMLElement}
	 */
	getPane() {
		return this.pane;
	}

	constructor(app, title, description, {
		canChangeState = true,
		defaultState = true,
		cssMarkers = {}
	} = {}) {

		super(app, title, description, {
			canChangeState,
			defaultState
		});

		app.on(prefix('refreshUi'), () => {
			this.run();
		});

		this.cssMarkers = cssMarkers;
		this.pane = el.table({
			classNames: ['pane', prefix('dataPane', 'd')]
		});
	}
}

export default TablePane;