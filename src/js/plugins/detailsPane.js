/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TablePane from "./tablePane.js";
import fn from "fancy-node";

/**
 * DetailsPane plugin
 *
 * @param {App} app
 * @returns {Plugin} FirstLetter
 */
class DetailsPane extends TablePane {

    /**
     * Create the details wrapper for this table
     * @param {App} app 
     * @param {String} title 
     * @param {String} description 
     * @param {Object} options 
     */
    constructor(app, title, description, options = {}) {

        const shortcuts = options.shortcuts || [];
        delete options.shortcuts;

        super(app, title, description, options);

        this.shortcuts = shortcuts;

        this.summary = fn.summary({
            content: this.title,
        });

        this.ui = fn.details({
            content: [this.summary, this.getPane()],
        });

        this.togglePane = () => this.summary.click();

        this.toggle = (state) => {
            if (state) {
                this.app.domSet("submenu", false);
            }
            return super.toggle(state);
        }

        this.toggle(this.getState());
    }
}

export default DetailsPane;
