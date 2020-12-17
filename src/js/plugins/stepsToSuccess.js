import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import plugin from '../modules/plugin.js';

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
         * Highest possible number of points
         * @type {number}
         */
        const maxPoints = data.getPoints('answers');

        /**
         * Rankings, pulled from original game source
         * @type {Array}
         */
        const rankings = [
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
        ].map(entry => {
            return [entry[0], Math.round(entry[1] / 100 * maxPoints)];
        });

        /**
         * Populate/update pane
         * @param {HTMLElement} frame
         */
        const update = (frame) => {
            frame.innerHTML = '';
            const ownPoints = data.getPoints('foundTerms');
            const tier = rankings.filter(entry => entry[1] <= ownPoints).pop()[1];
            rankings.forEach(value => {
                const tr = el.tr({                    
                    classNames: value[1] === tier ? ['sba-current'] : []
                });
                [value[0], value[1]].forEach(cellData => {
                    tr.append(el.td({
                        text:cellData
                    }))
                })
                frame.append(tr);
            })
        }	

        this.ui = el.details({
            classNames: !this.isEnabled() ? ['inactive'] : []
        });

        const pane = el.table({
            classNames: ['pane']
        });
        const frame = el.tbody();

        update(frame);

        pane.append(frame);

        this.ui.append(el.summary({
            text: this.title
        }), pane);

        // update on demand
        app.on(prefix('wordsUpdated'), () => update(frame));

        this.add();
    }
}

export default stepsToSuccess;