import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import css from '../../css/widget.css';
import Plugin from '../modules/plugin.js';
import settings from '../modules/settings.js';

/**
 * Styles plugin
 * 
 * @param {App} app
 * @returns {Plugin} Styles
 */
class Styles extends Plugin {

    modifyMq() {
        let rules;
        let sheet;
        for (let _sheet of document.styleSheets) {
            if (_sheet.href && _sheet.href.startsWith('https://www.nytimes.com/games-assets/v2/spelling-bee')) {
                sheet = _sheet;
                break;
            }
        }
        rules = sheet.rules;
        if (!rules) {
            return
        }
        let l = rules.length;
        for (let i = 0; i < l; i++) {
            if (rules[i] instanceof CSSMediaRule && rules[i].conditionText.includes('min-width: 768px') && !rules[i].cssText.includes('.sb-modal')) {
                const newRule = rules[i].cssText.replace('min-width: 768px', `min-width: ${settings.get('mobileThreshold')}px`).replace(/(?:\\[rn]|[\r\n]+)+/g, '').replace(/\s+/g, ' ');
                sheet.deleteRule(i);
                sheet.insertRule(newRule, i);
            }
        }
    }

    /**
     * Styles constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Styles', '');

        this.target = el.$('head');

        this.ui = el.style({
            content: css
        });
        app.on(prefix('destroy'), () => this.ui.remove());
        
        this.add();
        this.modifyMq();
    }
}

export default Styles;