/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";
import Plugin from "../modules/plugin.js";
import fn from "fancy-node";
import { prefix } from "../utils/string.js";
/**
 * Header plugin
 *
 * @param {App} app
 * @returns {Plugin} Header
 */
class Header extends Plugin {
    /**
     * Header constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, settings.get("title"), "", {
            key: "header",
        });

        const toolbar = fn.div({
            classNames: ["sba-toolbar"],
        });

        app.on(prefix("pluginsReady"), (evt) => {
            evt.detail.forEach((plugin, key) => {
                if (plugin.panelBtn) {
                    toolbar.append(plugin.panelBtn);
                }
            });
        });

        this.ui = fn.div({
            content: [
                fn.div({
                    classNames: ["sba-title"],
                    content: this.title,
                }),
                toolbar,
            ],
        });
    }
}

export default Header;
