/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Popup from './popup.js';
import {
    prefix
} from '../modules/string.js';
import gridIcon from '../assets/grid.svg';
import fn from 'fancy-node';

/**
 * Grid plugin
 *
 * @param {App} app
 * @returns {Plugin} Grid
 */
class ShortcutScreen extends TablePane {

    /**
     * 
     * 
     * For now just a copied version of the Grid plugin
     * 
     * 
     */

    /**
     * Toggle pop-up
     * @returns {ShortcutScreen}
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
     * @returns {ShortcutScreen}
     */
    run(evt) {
        super.run(evt);
        const rows = fn.$$('tr', this.pane);
        const rCnt = rows.length;
        rows.forEach((row, rInd) => {
            if (rCnt === rInd + 1) {
                return false;
            }
            const cells = fn.$$('td', row);
            const cCnt = cells.length;
            cells.forEach((cell, cInd) => {
                const cellArr = cell.textContent.trim().split('/');
                if (cInd < cCnt - 1 && cellArr.length === 2 && cellArr[0] === cellArr[1]) {
                    cell.classList.add(prefix('completed', 'd'));
                }
            })
        })

        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const rows = [
            ['Plugin', 'Action', 'Shortcut', 'Enabled']
        ];
    
        // for (const [plugin, config] of Object.entries(tmpSettings)) {
        //     const shortcuts = config.shortcuts || [];
        //     shortcuts.forEach(({ method, combo, enabled }) => {
        //         rows.push([
        //             plugin,
        //             method,
        //             combo.replace(/^Alt\+Shift\+/, ''), // for clarity
        //             enabled ? '✓' : ''
        //         ]);
        //     });
        // }
    
        return rows;
    }

    /**
     * Grid constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Shortcuts', 'SBA Shortcut Commands');

        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title);

        this.menuAction = 'popup';
        this.menuIcon = 'null';
        this.panelBtn = fn.span({
            classNames: ['sba-tool-btn'],
            events: {
                pointerup: () => this.togglePopup()
            },
            attributes:{
                title: `Show ${this.title}`
            },
            content: gridIcon
        });

        this.shortcuts = [{
            combo: "Shift+Alt+S",
            method: "togglePopup"
        }];
    }
}

export default ShortcutScreen;