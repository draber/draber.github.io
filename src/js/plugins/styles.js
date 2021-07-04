/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import css from '../../css/widget.css';
import Plugin from '../modules/plugin.js';

/**
 * Styles plugin
 * 
 * @param {App} app
 * @returns {Plugin} Styles
 */
class Styles extends Plugin {

    /**
     * Modify media queries for `min-width: 768px` to hit only when the assistant is _not_ displayed.
     * Add  media queries for `min-width: 900px` that hit only when the assistant is displayed.
     * @returns {Styles|boolean}
     */
    modifyMq() {
        const sheet = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.startsWith('https://www.nytimes.com/games-assets/v2/spelling-bee'));
        if (!sheet) {
            return false;
        }
        const rules = sheet.cssRules;
        if (!rules) {
            return false;
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
                if(typeof rules[l].cssRules.forEach !== 'function') {
                   continue;
                }
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
        return this;
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

        setTimeout(() => {
            this.modifyMq();
        }, 200);
    }
}

export default Styles;