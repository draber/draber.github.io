import Plugin from '../modules/plugin.js';
import settings from '../modules/settings.js';

/**
 * Positioning plugin
 *
 * @param {App} app
 * @returns {Plugin} Positioning
 */
class Positioning extends Plugin {

    position;

    boundaries;

    mouse = {
        old: undefined,
        new: undefined
    }

    isLastTarget = false;

    offset = {
        top: 12,
        right: 12,
        bottom: 12,
        left: 12
    };

    calculateBoundaries() {
        const areaRect = this.app.dragArea.getBoundingClientRect();
        const parentRect = this.app.ui.parentNode.getBoundingClientRect();
        const appRect = this.app.ui.getBoundingClientRect();

        this.boundaries = {
            minTop: this.offset.top,
            maxTop: areaRect.height - appRect.height - this.offset.bottom,
            minLeft: this.offset.left - parentRect.left,
            maxLeft: areaRect.width - parentRect.left - appRect.width - this.offset.right
        }
        return this;
    }

    /**
     *
     * @param {Event} evt
     * @param {String} age old|new as in at dragStart|dragEnd
     * @returns {Positioning}
     */
    calculateMousePosition(evt, age) {
        this.mouse[age] = {
            left: evt.screenX,
            top: evt.screenY
        }
        return this;
    }

    /**
     * Get position at dragEnd, can be subject to correction in this.reposition()
     * @param evt
     * @returns {Positioning}
     */
    calculateNewPosition(evt) {
        this.calculateMousePosition(evt, 'new');
        this.position.left += this.mouse.new.left - this.mouse.old.left;
        this.position.top += this.mouse.new.top - this.mouse.old.top;
        return this.reposition();
    }

    /**
     * Position at launch or dragStart
     * @returns {Positioning}
     */
    calculateOldPosition() {
        const stored = settings.get('options.positioning');
        if (stored && !Object.prototype.toString.call(stored) === '[object Object]') {
            this.position = stored;
        } else {
            const style = getComputedStyle(this.app.ui);
            this.position = {
                top: parseInt(style.top),
                left: parseInt(style.left)
            }
        }
        return this;
    }

    /**
     * Place app on the new position, taking in account the current boundaries of the drag area
     * @returns {Positioning}
     */
    reposition() {
        if (!this.position) {
            this.calculateOldPosition();
        }
        this.calculateBoundaries();
        this.position.left = Math.min(this.boundaries.maxLeft, Math.max(this.boundaries.minLeft, this.position.left));
        this.position.top = Math.min(this.boundaries.maxTop, Math.max(this.boundaries.minTop, this.position.top));

        Object.assign(this.app.ui.style, {
            left: this.position.left + 'px',
            top: this.position.top + 'px'
        });
        if(this.getState()){
            settings.set('options.positioning', this.position);
        }
        return this;
    }

    /**
     * Launch dragging if the app says so
     * @returns {Positioning}
     */
    enableDrag() {

        const trigger = this.app.dragTrigger || this.app.ui;
        trigger.style.cursor = 'move';

        this.app.on('pointerdown', evt => {
                this.isLastTarget = evt.target.isSameNode(trigger);
            }).on('pointerup', () => {
                this.isLastTarget = false;
            }).on('dragend', evt => {
                this.calculateNewPosition(evt);
                evt.target.style.opacity = '1';
            }).on('dragstart', evt => {
                    if (!this.isLastTarget) {
                        evt.preventDefault();
                        return false;
                    }
                    evt.target.style.opacity = '.2';
                    this.calculateOldPosition().calculateMousePosition(evt, 'old');
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
        return super.toggle(state || this.position);
    }

    constructor(app) {

        super(app, 'Memorize position', {
            key: 'positioning',
            canChangeState: true
        });

        if (this.app.isDraggable) {
            this.enableDrag();
            this.add();
            if (this.getState()) {
                this.reposition();
            }
            window.addEventListener('orientationchange', this.reposition());
        }
    }
}

export default Positioning;