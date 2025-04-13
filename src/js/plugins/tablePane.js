/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import fn from "fancy-node";

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
        this.pane = fn.empty(this.pane);
        const tbody = fn.tbody();
        const data = this.getData();
        if (this.caption) {
            this.pane.append(fn.caption({ content: this.caption }));
        }
        if (this.hasHeadRow) {
            this.pane.append(this.buildHead(data.shift()));
        }
        const l = data.length;
        let colCnt = 0;
        data.forEach((rowData, i) => {
            colCnt = rowData.length;
            const classNames = [];
            for (const [marker, func] of Object.entries(this.cssMarkers)) {
                if (func(rowData, i, l)) {
                    classNames.push(prefix(marker, "d"));
                }
            }
            const tr = fn.tr({
                classNames,
            });
            rowData.forEach((cellData, rInd) => {
                const tag = rInd === 0 && this.hasHeadCol ? "th" : "td";
                tr.append(
                    fn[tag]({
                        content: cellData,
                    })
                );
            });
            tbody.append(tr);
        });
        this.pane.dataset.cols = colCnt;
        this.pane.append(tbody);
        return this;
    }

    /**
     * Build thead
     * @param {Array} rowData
     * @returns {HTMLElement}
     */
    buildHead(rowData) {
        return fn.thead({
            content: fn.tr({
                content: rowData.map((cellData) =>
                    fn.th({
                        content: cellData,
                    })
                ),
            }),
        });
    }

    /**
     * Retrieve table view
     * @returns {HTMLElement}
     */
    getPane() {
        return this.pane;
    }

    /**
     * @typedef {Object} configObj
     * @property {Object} [cssMarkers={}]
     * @property {boolean} [hasHeadRow=true]
     * @property {boolean} [hasHeadCol=true]
     * @property {string[]} [classNames=[]]
     * @property {Object} [events={}]
     * @property {string} [caption='']
     */

    /**
     * @param {App} app
     * @param {string} title
     * @param {string} description
     * @param {configObj} [config={}]
     */
    constructor(
        app,
        title,
        description,
        {
            cssMarkers = {},
            hasHeadRow = true,
            hasHeadCol = true,
            classNames = [],
            events = {},
            caption = "",
        } = {}
    ) {
        super(app, title, description);

        app.on(prefix("refreshUi"), () => {
            this.run();
        });

        this.cssMarkers = cssMarkers;
        this.hasHeadRow = hasHeadRow;
        this.hasHeadCol = hasHeadCol;
        this.caption = caption;
        this.pane = fn.table({
            classNames: ["pane", prefix("dataPane", "d")].concat(classNames),
            events,
        });
    }
}

export default TablePane;
