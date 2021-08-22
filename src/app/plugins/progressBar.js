import {
    prefix
} from '../modules/string.js';
/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ProgressBar
 */
class ProgressBar extends Plugin {

    /**
     * Get current progress in % and refresh the bar
     * @param {Event} evt
     * @returns {Plugin}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        let progress = data.getPoints('foundTerms') * 100 / data.getPoints('answers');
        progress = Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100);
        this.ui.value = progress;
        this.ui.textContent = progress + '%';
        this.ui.title = `Progress: ${progress}%`;
        return this;
    }

    /**
     * ProgressBar constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
            canChangeState: true,
            runEvt: prefix('refreshUi'),
            addMethod: 'before'
        });

        this.ui = el.progress({
            attributes: {
                max: 100
            }
        })

        app.on(prefix('pluginsReady'), evt => {
            if (this.app.plugins.has('yourProgress')) {
                this.ui.style.cursor = 'pointer';
                this.ui.addEventListener('pointerup', () => {
                    this.app.plugins.get('yourProgress').display();
                });
            }
        })

        this.target = el.$('.sb-wordlist-heading', this.app.gameWrapper);

        this.toggle(this.getState());
    }
}

export default ProgressBar;