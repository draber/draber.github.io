import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import plugin from '../modules/pluginBase.js';

/**
 * Steps to success plugin
 * 
 * @param {app} app
 * @returns {plugin} stepsToSuccess
 */
class stepsToSuccess extends plugin {
    constructor(app) {

        super(app, 'Steps to success', {
            optional: true
        });

        /**
         * Rankings, pulled from original game source
         * @type {Map}
         */
        const rankings = new Map([
            ['Beginner', 0],
            ['Good Start', 2],
            ['Moving Up', 5],
            ['Good', 8],
            ['Solid', 15],
            ['Nice', 25],
            ['Great', 40],
            ['Amazing', 50],
            ['Genius', 70],
            ['Queen Bee', 100]
        ]);

        /**
         * Highest possible number of points
         * @type {number}
         */
        const maxPoints = data.getPoints('answers');

        /**
         * Populate/update pane
         * @param {HTMLElement} frame
         */
        const update = (frame) => {
            frame.innerHTML = '';
            const ownPoints = data.getPoints('foundTerms');
            const tier = Array.from(rankings.values()).filter(entry => entry <= ownPoints).pop();
            rankings.forEach((perc, label) => {
                const value = Math.round(perc / 100 * maxPoints)
                frame.append(el.create({
                    tag: 'tr',
                    classNames: value === tier ? ['sba-current'] : [],
                    cellTag: 'td',
                    cellData: [label, value]
                }));
            })
        }

        this.ui = el.create({
            tag: 'details',
            text: [this.title, 'summary'],
            classNames: !this.isEnabled() ? ['inactive'] : []
        });

        const pane = el.create({
            tag: 'table',
            classNames: ['pane']
        });
        const frame = el.create({
            tag: 'tbody'
        });

        update(frame);

        pane.append(frame);

        this.ui.append(pane);

        // update on demand
        app.on(prefix('newWord'), () => {
            update(frame);
        });

        this.add();
    }
}

export default stepsToSuccess;
