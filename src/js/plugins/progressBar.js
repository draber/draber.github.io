import {
    prefix
} from '../utils/string.js';
/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';
import fn from 'fancy-node';
import ProgressBuilder from "../widgets/progressBuilder.js";

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ProgressBar
 */
export default class ProgressBar extends Plugin {

    /**
     * Get current progress in % and refresh the bar
     * @param {Event} evt
     * @returns {Plugin}
     */
    run(evt) {
        this.progress.update(data.getPoints("foundTerms"));

        return this;
    }


    /**
     * ProgressBar constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
            runEvt: prefix('refreshUi'),
            addMethod: 'before',
        });

        this.progress = new ProgressBuilder(data.getPoints("foundTerms"), data.getPoints("answers"));
        this.ui = this.progress.ui;

        this.target = fn.$('.sb-wordlist-heading', this.app.gameWrapper);
    }
}
