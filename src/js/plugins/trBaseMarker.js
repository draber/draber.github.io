import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * Table row marker - base plugin
 *
 * @param {App} app
 * @returns {Plugin} TrBaseMarker
 */
class TrBaseMarker extends Plugin {

    /**
     * Toggle table row marker
     * @param {HTMLElement} plugin 
     * @returns {TrBaseMarker}
     */
    toggleDecoration(plugin) {
        el.$$('tr', plugin.ui).forEach((tr, i) => {
            const rowData = Array.from(el.$$('td', tr)).map(td => /^\d+$/.test(td.textContent) ? parseInt(td.textContent) : td.textContent);
            if (plugin.cssMarkers[this.marker](rowData, i)) {
                tr.classList.toggle(prefix(this.marker, 'd'), this.getState());
            }
        })
        return this;
    }
// isNan === isString
    /**
     * Toggle state an decorate
     * @param {Boolean} state 
     */
    toggle(state) {
        super.toggle(state);
        this.plugins.forEach(plugin => {
            this.toggleDecoration(plugin);
        })
        return this;
    }

    constructor(app, title, description, {
        canChangeState,
        marker
    } = {}) {

        super(app, title, description, {
            canChangeState
        });

        this.plugins = new Set();

        this.marker = marker;

        // update on demand
        app.on(prefix('paneUpdated'), evt => {
            if (!evt.detail ||
                !evt.detail.plugin ||
                !evt.detail.plugin.cssMarkers ||
                !evt.detail.plugin.cssMarkers[this.marker]) {
                return false;
            }
            if (!this.plugins.has(evt.detail.plugin)) {
                this.plugins.add(evt.detail.plugin);
            }
            this.toggleDecoration(evt.detail.plugin);
        });

        this.add();
    }
}

export default TrBaseMarker;