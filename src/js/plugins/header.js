import el from '../modules/element.js';
import { prefix } from '../modules/string.js';
import settings from '../modules/settings.js';
import plugin from '../modules/pluginBase.js';

/**
 * Header plugin
 * 
 * @param {app} app
 * @returns {plugin} header
 */
class header extends plugin {
    constructor(app) {

        super(app, settings.get('title'), {
            key: 'header'
        });

        this.ui = el.create();

        /**
         * Drag start parameters
         * @type {Object}
         */
        let params;

        /**
         * Start dragging only when initiated on the header
         * @type {boolean}
         */
        let isLastTarget = false;

        /**
         * Assign drag start parameters
         * @param evt
         * @returns {{minT: number, maxT: number, margT, maxL: number, offX: number, offY: number}}
         */
        const getDragParams = (evt) => {
            const gRect = app.game.getBoundingClientRect();
            const aRect = evt.target.getBoundingClientRect();
            const minT = gRect.top + window.pageYOffset;
            const pRect = this.ui.parentElement.getBoundingClientRect();
            const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;

            return {
                maxL: document.documentElement.clientWidth - aRect.width,
                minT: minT,
                maxT: minT + gAvailH,
                offX: evt.screenX - aRect.x,
                offY: evt.screenY - aRect.y,
                margT: parseInt(getComputedStyle(evt.target).marginTop, 10)
            };
        }

        /**
         * Get corrected drop position
         * @param evt
         * @returns {{top: string, left: string}}
         */
        const getDropPosition = evt => {
            let left = Math.max(0, (evt.screenX - params.offX));
            left = Math.min(left, (params.maxL)) + 'px';
            let top = Math.max(params.minT, (evt.screenY + window.pageYOffset - params.margT - params.offY));
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
            [app.ui, app.game].forEach(element => {
                element.addEventListener('dragover', evt => {
                    evt.preventDefault();
                });
            });

            // make app more transparent and get coordinates
            app.on('dragstart', evt => {
                if (!isLastTarget) {
                    evt.preventDefault();
                    return false;
                }
                evt.target.style.opacity = '.2';
                params = getDragParams(evt);
            }, false);

            // place app at new position and restore opacity
            app.on('dragend', evt => {
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
                    app.trigger(new Event(prefix('destroy')));
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
                    app.ui.classList.toggle('minimized');
                }
            }
        }));

        app.on('pointerdown', evt => {
            isLastTarget = !!evt.target.closest(`[data-plugin="${this.key}"]`);
        });
        app.on('pointerup', () => {
            isLastTarget = false;
        });

        makeDraggable();
        this.add();        
    }
}

export default header;
