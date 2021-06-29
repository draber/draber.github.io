import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DarkMode
 */
class DarkMode extends Plugin {

    /**
     * Toggle dark mode
     * @param state
     * @returns {DarkMode}
     */
    toggle(state) {
        super.toggle(state);
        document.body.dataset[prefix('theme')] = state ? 'dark' : 'light';
        return this;
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Dark Mode', 'Applies a dark theme to this page', {
            canChangeState: true,
            defaultState: false
        });

        el.$('.hive-action__shuffle', this.app.gameWrapper).append(el.svg({
            classNames: ['hive-shuufle'],
            attributes: {
                viewBox: `0 0 24 24`
            },
            isSvg: true,
            content: el.path({
                isSvg: true,
                attributes: {
                    d: 'M5.095 0l-.943 4.19 4.095 1.274L6.945 3.21h.006a10.099 10.099 0 0113.774 13.835l1.458.842A11.782 11.782 0 006.105 1.756zM1.807 6.048a11.782 11.782 0 00-.012 11.81v-.012a11.782 11.782 0 0016.09 4.315L18.953 24l.941-4.185-4.095-1.274 1.25 2.162A10.099 10.099 0 013.266 6.889z'
                }
            })
        }))


        // toggle body dataset
        this.toggle(this.getState());
    }
}

export default DarkMode;