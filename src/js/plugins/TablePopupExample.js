/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TablePane from './tablePane.js';
import Popup from './popup.js';
import {
    prefix
} from '../modules/string.js';

/**
 * TablePopupExample plugin
 *
 * @param {App} app
 * @returns {Plugin} TablePopupExample
 */
class TablePopupExample extends TablePane {

    /**
     * Toggle pop-up
     * @returns {TablePopupExample}
     */
    togglePopup() {
        if(this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup
            .setContent('subtitle', this.description)
            .setContent('body', this.getPane())
            .toggle(true);

        return this;
    }

    /**
     * Update table and mark completed cells
     * @param evt
     * @returns {TablePopupExample}
     */
    run(evt) {
        super.run(evt);
        // Table is now complete along with CSS markers, if any
        // You can now perform any additional actions on the table, like adding event listeners or modifying styles
        return this;
    }

    /**
     * Build a 2-dimesional array with the data for the table
     * @returns {Array}
     */
    getData() {
        const cellData = [['X', 'Y', 'Z']];
        // data 
        [1,2,3].forEach((i) => {
            cellData.push([i, i * 2, i * 3]);
        });
        // Example data for the table
        return cellData;
    }

    /**
     * TablePopupExample constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Table Popup Example'/* = Pop-up Heading */, 'Description, by default the tagline of the pop-up', {
            classNames: ['my-table-class'].map((name) => prefix(name, "d"))
        });

        // Popup object
        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title);

        // Make sure this is treated as a popup in the menu
        this.menuAction = 'popup';
        this.menuIcon = 'null';

        this.shortcuts = [{
            combo: "Shift+Alt+X",
            method: "togglePopup"
        }];
    }
}

export default TablePopupExample;