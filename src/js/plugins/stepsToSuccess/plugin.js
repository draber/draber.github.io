import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import data from '../../modules/data.js';
import observers from '../../modules/observers.js';
import pf from '../../modules/prefixer.js';


/**
 * Steps to Success plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 */
class stepsToSuccess {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;
        this.title = 'Steps to success';
        this.key = 'stepsToSuccess';
        this.optional = true;

        let observer;

        /**
         * The different rankings of the game
         * @type {{}}
         */
        const steps = {};

        /**
         * Watch the result list for changes
         * Partially initializes the observer, the rest is done in `observers.js` via `pluginManager.js`
         * @param {HTMLElement} target
         * @param {HTMLElement} frame
         * @returns {{args: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
         */
        const initObserver = (target, frame) => {
            const _observer = new MutationObserver(mutationsList => {
                const node = mutationsList.pop().target;
                const title = el.$('.sb-modal-title', node);
                if (title && title.textContent.trim() === 'Rankings') {
                    target.parentElement.style.opacity = 0;
                    retrieveRankings(target, frame);
                }
            });
            return {
                observer: _observer,
                target: target,
                config: {
                    childList: true
                }
            }
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
            observers.remove(observer);
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

        // has the user has disabled the plugin?
        if (pluginManager.isEnabled(this.key, true)) {

            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary']
            });

            // add and populate content pane
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
            observers.add(observer);
            el.$('.sb-progress', args[0]).click();

            this.ui.append(pane);

            // update on demand
            this.app.addEventListener(pf('updateComplete'), () => {
                update(frame);
            });
        }
    }
}

export default stepsToSuccess;