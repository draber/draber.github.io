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
        //  document.querySelector('link[href^="https://www.nytimes.com/games-assets/v2/spelling-bee"]')
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
        const theirCond = 'min-width: 768px';
        const myCond = theirCond.replace('768', '900');
        const marker = `data-${prefix('active', 'd')}`;
        const theirMarker = `[${marker}="false"]`;
        const myMarker = `[${marker}="true"]`;
        const markerRe = new RegExp(marker, 'g');
        let newRules = [];
        let l = rules.length;
        while (l--) {
            if (rules[l] instanceof CSSMediaRule && rules[l].conditionText.includes(theirCond) && !rules[l].cssText.includes('.sb-modal')) {
                rules[l].cssRules.forEach(rule => {
                    const selectorText = rule.selectorText.split(',').map(selector => `${marker} ${selector.trim()}`).join(', ');
                    newRules.push(rule.cssText.replace(rule.selectorText, selectorText))
                });
                sheet.deleteRule(l);
            }
        }
        newRules = newRules.join('');
        const theirRule = `@media (${theirCond}) { ${newRules.replace(markerRe, theirMarker)} }`;
        const myRule = `@media (${myCond}) { ${newRules.replace(markerRe, myMarker)} }`;
        sheet.insertRule(theirRule);
        sheet.insertRule(myRule);
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