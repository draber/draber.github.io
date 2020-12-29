import Plugin from '../modules/plugin.js';
import settings from '../modules/settings.js';

/**
 * Positioning plugin
 *
 * @param {App} app
 * @returns {Plugin} Positioning
 */
class Positioning extends Plugin {

    /**
     * Absolute position of the draggable object
     * @type {{top: Number, left: Number}}
     */
    position;

    /**
     * How close the draggable object can come to the edges of the drag area
     * @type {{top: Number, right: Number, bottom: number, left: Number}}
     */
    offset = {
        top: 12,
        right: 12,
        bottom: 12,
        left: 12
    };

    /**
     * Translation of the boundaries to left and top
     * @type {{minTop: Number, maxTop: Number, minLeft: number, maxLeft: Number}}
     */
    boundaries;

    /**
     * Mouse position, new = on drag start, old on dragend
     * @type {{left: Number, top: Number}}
     */
    mouse;

    /**
     * Helps to determine if the the draggable object has been dragged by the handle
     * @type {boolean}
     */
    isLastTarget = false;

    /**
     * Translate offset to boundaries
     * @returns {{minTop: Number, maxTop: Number, minLeft: Number, maxLeft: Number}}
     */
    getBoundaries() {
        const areaRect = this.app.dragArea.getBoundingClientRect();
        const parentRect = this.app.ui.parentNode.getBoundingClientRect();
        const appRect = this.app.ui.getBoundingClientRect();

        return {
            minTop: this.offset.top,
            maxTop: areaRect.height - appRect.height - this.offset.bottom,
            minLeft: this.offset.left - parentRect.left,
            maxLeft: areaRect.width - parentRect.left - appRect.width - this.offset.right
        }
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
     * @returns {Object}
     */
    getPosition(evt) {
        if (evt) {
            const mouse = this.getMouse(evt);
            return {
                left: this.position.left + mouse.left - this.mouse.left,
                top: this.position.top += mouse.top - this.mouse.top
            }
        }
        else {           
            const style = getComputedStyle(this.app.ui);
            return {
                top: parseInt(style.top),
                left: parseInt(style.left)
            }
        }
    }

    /**
     * Place app on the new position, taking in account the current boundaries of the drag area
     * @returns {Positioning}
     */
    reposition() {
        this.boundaries = this.getBoundaries();
        this.position.left = Math.min(this.boundaries.maxLeft, Math.max(this.boundaries.minLeft, this.position.left));
        this.position.top = Math.min(this.boundaries.maxTop, Math.max(this.boundaries.minTop, this.position.top));

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
                },
                false)
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

        super(app, 'Memorize position', {
            key: 'positioning',
            canChangeState: true
        });

        if (!this.app.isDraggable) {
            return this;
        }

        // current physical position
        this.position = this.getPosition();

        // possibly stored position from previous session
        const stored = this.getState();
        if (stored && Object.prototype.toString.call(stored) === '[object Object]') {
            this.position = stored;
            this.reposition();
        }

        this.enableDrag();
        this.add();
        window.addEventListener('orientationchange', () => this.reposition());
    }
}

export default Positioning;