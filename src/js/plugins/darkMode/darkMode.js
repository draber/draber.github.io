import el from '../../modules/element.js';
import { prefix, camel } from '../../modules/string.js';
import plugin from '../../modules/pluginBase.js';
import settings from '../../modules/settings.js';

/**
 * Dark Mode plugin
 * 
 * @param {plugin} app
 * @returns {plugin} darkMode
 */
class darkMode extends plugin {
    constructor(app) {

        super(app);
      
        this.title = 'Dark Mode';   
        this.key = camel(this.title);       
        this.optional = true;
        this.defaultEnabled = false;

        const bodyClass = prefix('dark', 'd');        
        this.toggle = state => {
            settings.set(`options.${this.key}`, state);
            el.$('body').classList.toggle(bodyClass, state)
        }

        this.toggle(this.isEnabled());

        this.add();
    }
}

export default darkMode;