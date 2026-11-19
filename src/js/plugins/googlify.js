/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import nyt from "../nyt/nyt.js";

// noinspection SpellCheckingInspection
/**
 * Googlify plugin
 *
 * Links all terms in the game to a Google search: result list, SBA pop-ups and NYT modals such as Yesterday's Answers.
 *
 * @param {App} app
 * @returns {Plugin} Googlify
 */
class Googlify extends Plugin {
    /**
     * Search for term in Google
     * @param {PointerEvent} evt
     * @returns {Boolean}
     */
    listener(evt) {
        if (evt.button !== 0 || !nyt.isTerm(evt.target)) {
            return false;
        }
        window.open(`https://www.google.com/search?q=${encodeURIComponent(evt.target.textContent.trim())}`, prefix());
        return true;
    }

    /**
     * Listen on <body>, it contains the game as well as the SBA pop-ups.
     * NYT modals are rendered on demand, hence event delegation.
     * Capture phase, so the NYT's own handlers can't stop the event first.
     * @returns {Googlify}
     */
    run() {
        this.containers.forEach((container) => {
            container.addEventListener("pointerup", this.listener, true);
            container.classList.add(prefix("googlified", "d"));
        });
        return this;
    }

    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Googlify", "Link all result terms to Google");

        this.containers = [document.body];

        this.app.on(prefix("destroy"), () => {
            this.containers.forEach((container) => {
                container.removeEventListener("pointerup", this.listener, true);
                container.classList.remove(prefix("googlified", "d"));
            });
        });

        this.run();
    }
}

export default Googlify;
