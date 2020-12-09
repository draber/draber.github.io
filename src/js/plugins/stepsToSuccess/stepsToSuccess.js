import el from '../../modules/element.js';
import data from '../../modules/data.js';
import { prefix } from '../../modules/string.js';
import plugin from '../../modules/pluginBase.js';

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

        let observer;

        /**
         * The different rankings of the game
         * @type {{}}
         */
        const steps = {};

        /**
         * Watch the result list for changes
         * @param {HTMLElement} target
         * @param {HTMLElement} frame
         * @returns {MutationObserver}
         */
        const initObserver = (target, frame) => {
            const observer = new MutationObserver(mutationsList => {
                const node = mutationsList.pop().target;
                const title = el.$('.sb-modal-title', node);
                if (title && title.textContent.trim() === 'Rankings') {
                    target.parentElement.style.opacity = 0;
                    retrieveRankings(target, frame);
                }
            });
            observer.observe(target, {
                childList: true
            });
            return observer;
        }

        /**
         * Collect the points from the 'Rankings' overlay
         * @param {HTMLElement} modal
         * @param {HTMLElement} frame
         */
        const retrieveRankings = (modal, frame) => {
            const allPoints = data.getPoints('answers');
            el.$$('.sb-modal-list li', modal).forEach(element => {
                const values = element.textContent.match(/([^\(]+) \((\d+)\)/);
                steps[values[1]] = parseInt(values[2], 10);
            });
            steps['Queen Bee'] = allPoints;
            modal.parentElement.style.opacity = 0;
            el.$('.sb-modal-close', modal).click();
            observer.disconnect();
            update(frame);
        }

        /**
         * Populate/update pane
         * @param {HTMLElement} frame
         */
        const update = (frame) => {
            frame.innerHTML = '';
            const tier = Object.values(steps).filter(entry => entry <= data.getPoints('foundTerms')).pop();
            for (const [key, value] of Object.entries(steps)) {
                frame.append(el.create({
                    tag: 'tr',
                    classNames: value === tier ? ['sba-current'] : [],
                    cellTag: 'td',
                    cellData: [key, value]
                }));
            }
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
        pane.append(frame);

        const popUpCloser = el.$('.sb-modal-buttons-section .pz-button__wrapper>button, sb-modal-close', el.$('.sb-modal-wrapper'));
        if(popUpCloser){
            popUpCloser.click();
        }
        const modal = el.$('.sb-modal-wrapper');
        observer = initObserver(modal, frame);
        el.$('.sb-progress', app.game).click();

        this.ui.append(pane);

        // update on demand
        app.on(prefix('newWord'), () => {
            update(frame);
        });
        
        this.add();
    }
}

export default stepsToSuccess;
