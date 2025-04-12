/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TablePane from "./tablePane.js";
import fn from "fancy-node";
import { prefix } from "../utils/string.js";

/**
 * DetailsPane plugin
 *
 * @param {App} app
 * @returns {Plugin} FirstLetter
 */
class DetailsPane extends TablePane {
    /**
     * Create the details wrapper for this table plugin
     *
     * @param {App} app - Reference to the main application instance
     * @param {Object} config - Configuration object
     * @param {String} config.title - Title shown in the summary element
     * @param {String} config.description - Description of the plugin
     * @param {Object} [config.options={}] - Additional options passed to the base class
     * @param {Array} [config.shortcuts=[]] - List of shortcut definitions ({ combo, method })
     * @param {boolean} [config.open=false] - Whether the details pane should start open
     */
    constructor(
        app,
        {
            title,
            description,
            shortcuts = [],
            canChangeState = false,
            defaultState = true,
            hasHeadCol = true,
            hasHeadRow = true,
            cssMarkers = {},
            classNames = ["th-upper", "table-full-width", "equal-cols", "small-txt"].map((name) => prefix(name, "d")),
            open = false,
        }
    ) {
        super(app, title, description, {
            canChangeState,
            defaultState,
            cssMarkers,
            classNames,
            hasHeadRow,
            hasHeadCol,
        });

        this.shortcuts = shortcuts;

        this.ui = fn.details({
            content: [
                fn.summary({
                    content: title,
                }),
                this.getPane(),
            ],
            attributes: {
                open,
            },
        });

        this.togglePane = () => (this.ui.open = !this.ui.open);
    }
}

export default DetailsPane;
