import pluginManager from '../../modules/pluginManager.js';
import el from '../../modules/element.js';
import pf from '../../modules/prefixer.js';

/**
 * Dark Mode plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class darkMode {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;
        this.ui = pluginManager.noUi;        
        this.title = 'Dark Mode';        
        this.key = 'darkMode';        
        this.optional = true;
        this.defaultState = false;

        // has the user has disabled the plugin?
        if (pluginManager.isEnabled(this.key, this.defaultState)) {
            el.$('body').classList.add(pf('dark', 'd'));
        } else {
            el.$('body').classList.remove(pf('dark', 'd'));
        }
    }
}

export default darkMode;