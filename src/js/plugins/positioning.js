import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';

// noinspection JSUnresolvedVariable,JSUnresolvedVariable
/**
 * Positioning plugin
 *
 * @param {App} app
 * @returns {Plugin} Positioning
 */
class Positioning extends Plugin {

    /**
     * Append App.ui to DOM
     */
    add() {
        const stored = this.getState();
        this.position = stored && Object.prototype.toString.call(stored) === '[object Object]' ? stored : this.getPosition();
        this.reposition();
        this.enableDrag();
        return super.add();
    }

    /**
     * How close the draggable object can come to the edges of the drag area
     * @param {Number|Object} offset
     * @returns {{top: *, left: *, bottom: *, right: *}|{top: number, left: number, bottom: number, right: number}}
     */
    getOffset(offset) {
        return !isNaN(offset) ? {
            top: offset,
            right: offset,
            bottom: offset,
            left: offset
        } : {
            ...{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            ...offset
        }
    }

    /**
     * Collection of various BoundingClientRect
     * @returns {{app: DOMRect, canvas: DOMRect, appContainer: DOMRect}}
     */
    getRectangles() {
        return {
            canvas: this.app.dragArea.getBoundingClientRect(),
            appContainer: this.app.ui.parentNode.getBoundingClientRect(),
            app: this.app.ui.getBoundingClientRect()
        }
    }


    /**
     * Translate offset to boundaries
     * @returns {{top: {min: Number, max: number}, left: {min: number, max: number}}}
     */
    getBoundaries() {
        return {
            top: {
                min: this.offset.top,
                max: this.rectangles.canvas.height - this.rectangles.app.height - this.offset.bottom
            },
            left: {
                min: this.offset.left - this.rectangles.appContainer.left,
                max: this.rectangles.canvas.width - this.rectangles.appContainer.left - this.rectangles.app.width - this.offset.right
            }
        }
    }

    /**
     * Ensure position stays within boundaries
     * @param {Object} position
     * @returns {*|{top: Number, left: Number}}
     */
    validatePosition(position) {
        if (position) {
            this.position = position;
        }
        const boundaries = this.getBoundaries();
        this.position.left = Math.min(boundaries.left.max, Math.max(boundaries.left.min, this.position.left));
        this.position.top = Math.min(boundaries.top.max, Math.max(boundaries.top.min, this.position.top));
        return this.position;
    }

    /**
     * Computes the mouse position
     * @param {Event} evt
     * @returns {{left: Number, top: Number}}
     */
    getMouse(evt) {
        return {
            left: evt.screenX,
            top: evt.screenY
        }
    }

    /**
     * w/o evt: position at launch or dragStart
     * w/ evt: position at dragEnd, can be subject to boundary correction in this.reposition()
     * @param evt
     * @returns {*|{top: Number, left: Number}}
     */
    getPosition(evt) {
        let coords;
        if (evt) {
            const mouse = this.getMouse(evt);
            coords = {
                left: this.position.left + mouse.left - this.mouse.left,
                top: this.position.top += mouse.top - this.mouse.top
            }

        } else {
            const style = getComputedStyle(this.app.ui);
            let left = parseInt(style.left);
            // convert left to px if needed
            if (style.left.endsWith('%')) {
                left = left * parseInt(getComputedStyle(el.$('.sbaContainer')).width) / 100;
            }
            coords = {
                top: parseInt(style.top),
                left
            }
        }
        return this.validatePosition(coords);
    }

    /**
     * Place app on the new position, taking in account the current boundaries of the drag area
     * @returns {Positioning}
     */
    reposition() {
        this.validatePosition();
        Object.assign(this.app.ui.style, {
            left: this.position.left + 'px',
            top: this.position.top + 'px'
        });
        this.toggle(this.getState() ? this.position : false);
        return this;
    }

    /**
     * Launch dragging if the app says so
     * @returns {Positioning}
     */
    enableDrag() {

        this.app.dragHandle.style.cursor = 'move';
        this.app.on('pointerdown', evt => {
                this.isLastTarget = evt.target.isSameNode(this.app.dragHandle);
            }).on('pointerup', () => {
                this.isLastTarget = false;
            }).on('dragend', evt => {
                this.position = this.getPosition(evt);
                this.reposition()
                evt.target.style.opacity = '1';
            }).on('dragstart', evt => {
                if (!this.isLastTarget) {
                    evt.preventDefault();
                    return false;
                }
                evt.target.style.opacity = '.2';
                this.position = this.getPosition();
                this.mouse = this.getMouse(evt);
            })
            .on('dragover', evt => evt.preventDefault());

        this.app.dragArea.addEventListener('dragover', evt => evt.preventDefault());
        return this;
    }

    /**
     * Memorize last state or coordinates
     * @param {Boolean} state
     * @returns {Widget}
     */
    toggle(state) {
        return super.toggle(state ? this.position : state);
    }

    /**
     * Make app draggable
     * @param app
     */
    constructor(app) {

        super(app, 'Memorize position', 'Places the assistant where it had been moved to last time', {
            key: 'positioning',
            canChangeState: true,
            defaultState: false
        });

        /**
         * Mouse position, new = on drag start, old on dragend
         * @type {{left: Number, top: Number}}
         */
        this.mouse;

        /**
         * How close the draggable object can come to the edges of the drag area
         * @type {{top: *, left: *, bottom: *, right: *}|{top: number, left: number, bottom: number, right: number}}
         */
        this.offset = this.getOffset(this.app.dragOffset || 0);

        /**
         * Helps to determine if the the draggable object has been dragged by the handle
         * @type {boolean}
         */
        this.isLastTarget = false;

        this.rectangles = this.getRectangles();

        ['orientationchange', 'resize'].forEach(handler => {
            window.addEventListener(handler, () => {
                this.rectangles = this.getRectangles();
                this.reposition();
            });
        })

        this.add();
    }
}

export default Positioning;