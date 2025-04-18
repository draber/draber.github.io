/**
 * ProgressBuilder
 *
 * Encapsulates a reusable <progress> element with updatable value logic.
 */

import fn from 'fancy-node';

export default class ProgressBuilder {

    /**
     * Create a visual progress bar element for a given value/max.
     * @param {number} valueAsNumber - The current value.
     * @param {number} maxAsNumber - The maximum possible value.
     */
    constructor(valueAsNumber, maxAsNumber) {
        this.maxAsNumber = maxAsNumber;
        this.valueInPercent = this.toPercent(valueAsNumber);
        this.element = null;
    }

    /**
     * Render the <progress> element.
     * @returns {HTMLElement} A <progress> element.
     */
    render() {
        this.element = fn.progress({
            attributes: {
                max: 100,
                value: this.valueInPercent,
                title: `Progress: ${this.valueInPercent}%`,
            },
        });

        return this.element;
    }

    /**
     * Returns the rendered element, creating it if needed.
     */
    get ui() {
        return this.element || this.render();
    }

    /**
     * Update the value of the progress bar.
     * @param {number} valueAsNumber - New current value.
     * @returns {ProgressBuilder}
     */
    update(valueAsNumber) {
        if (!this.element) {
            this.render();
        }

        this.valueInPercent = this.toPercent(valueAsNumber);
        this.element.value = this.valueInPercent;
        this.element.title = `Progress: ${this.valueInPercent}%`;

        return this;
    }

    /**
     * Convert a value into a percentage relative to max.
     * @param {number} value
     * @returns {number} value in percent (0–100)
     */
    toPercent(value) {
        return Math.min(Math.round((value * 100) / this.maxAsNumber), 100);
    }
}
