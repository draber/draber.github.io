import el from '../../modules/element.js';
import pf from '../../modules/prefixer.js';
import settings from '../../modules/settings.js';


/**
 * Header plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class header {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;
        this.title = settings.get('title');
        this.key = 'header';
        this.ui = el.create();

        const game = this.args[0];

        /**
         * Drag start parameters
         * @type {Object}
         */
        let params;

        /**
         * Start dragging only when initiated on the header
         * @type {Object}
         */
        let isLastTarget = false;

        /**
         * Assign drag start parameters
         * @param evt
         * @returns {{minT: number, maxT: number, margT, maxL: number, offX: number, offY: number}}
         */
        const getDragParams = (evt) => {
            const gRect = game.getBoundingClientRect();
            const aRect = evt.target.getBoundingClientRect();
            const minT = gRect.top + window.pageYOffset;
            const pRect = plugin.parentElement.getBoundingClientRect();
            const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;

            return {
                maxL: document.documentElement.clientWidth - aRect.width,
                minT: minT,
                maxT: minT + gAvailH,
                offX: evt.clientX - aRect.x,
                offY: evt.clientY - aRect.y,
                margT: parseInt(getComputedStyle(evt.target).marginTop, 10)
            };
        }

        /**
         * Get corrected drop position
         * @param evt
         * @returns {{top: string, left: string}}
         */
        const getDropPosition = evt => {
            let left = Math.max(0, (evt.clientX - params.offX));
            left = Math.min(left, (params.maxL)) + 'px';
            let top = Math.max(params.minT, (evt.clientY + window.pageYOffset - params.margT - params.offY));
            top = Math.min(top, params.maxT) + 'px';
            return {
                left,
                top
            };
        }

        /**
         * Implement drag/drop
         */
        const makeDraggable = () => {

            // ensure correct drag icon
            [this.app, game].forEach(element => {
                element.addEventListener('dragover', evt => {
                    evt.preventDefault();
                });
            });

            // make app more transparent and get coordinates
            this.app.addEventListener('dragstart', evt => {
                if (!isLastTarget) {
                    evt.preventDefault();
                    return false;
                }
                evt.target.style.opacity = '.2';
                params = getDragParams(evt);
            }, false);

            // place app at new position and restore opacity
            this.app.addEventListener('dragend', evt => {
                Object.assign(evt.target.style, getDropPosition(evt));
                evt.target.style.opacity = '1';
            });
        }



        // add title
        this.ui.append(el.create({
            text: this.title,
            attributes: {
                title: 'Hold the mouse down to drag'
            },
            classNames: ['dragger']
        }));

        // add closer
        this.ui.append(el.create({
            tag: 'span',
            text: '×',
            attributes: {
                title: 'Close'
            },
            classNames: ['closer'],
            events: {
                click: () => {
                    this.app.dispatchEvent(new Event(pf('destroy')));
                }
            }
        }));

        // add minimizer
        this.ui.append(el.create({
            tag: 'span',
            attributes: {
                title: 'Minimize'
            },
            classNames: ['minimizer'],
            events: {
                click: () => {
                    this.app.classList.toggle('minimized');
                }
            }
        }));

        this.app.addEventListener('pointerdown', evt => {
            isLastTarget = !!evt.target.closest(`[data-plugin="${this.key}"]`);
        });
        this.app.addEventListener('pointerup', () => {
            isLastTarget = false;
        });

        makeDraggable();
    }
}

export default header;