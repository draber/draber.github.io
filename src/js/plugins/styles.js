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
        const sheet = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.startsWith('https://www.nytimes.com/games-assets/v2/spelling-bee'));
        if (!sheet) {
            return false;
        }
        const theirCond = 'min-width: 768px';
        const myCond = theirCond.replace('768', '900');
        const rules = Array.from(sheet.cssRules).filter(rule => rule instanceof CSSMediaRule && rule.conditionText.includes(theirCond) && !rule.cssText.includes('.sb-modal'));
        if (!rules) {
            return
        }
        const marker = `data-${prefix('active', 'd')}`;
        const theirMarker = `[${marker}="false"]`;
        const myMarker = `[${marker}="true"]`;
        const markerRe = new RegExp(marker, 'g');
        let newRules = [];
        let l = rules.length;
        while (l--) {
            rules[l].cssRules.forEach(rule => {
                const selectorText = rule.selectorText.split(',').map(selector => `${marker} ${selector.trim()}`).join(', ');
                newRules.push(rule.cssText.replace(rule.selectorText, selectorText))
            });
            sheet.deleteRule(l);
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