/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import { create } from "fancy-node";

/**
 * Recursively renders any fn-compatible object structure.
 * Designed for output from dataToObj(), but works with any valid fn-compatible tree.
 *
 * @typedef {Object} RenderableObject
 * @property {string} tag - The HTML/SVG tag name (e.g. "div", "table").
 * @property {Array<string|Node|RenderableObject>} [content] - Child elements, strings, or nested objects.
 * @property {Object} [attributes] - Plain attributes like id, title, etc.
 * @property {Object} [style] - Inline style declarations.
 * @property {Object} [data] - Data attributes (data-*)
 * @property {Object} [aria] - ARIA attributes
 * @property {Object} [events] - Event listeners (e.g. onclick)
 * @property {Array<string>|DOMTokenList} [classNames] - CSS classes to apply
 * @property {boolean} [isSvg=false] - Whether to create an SVG element
 *
 * @param {Object} obj
 * @returns {Node}
 */
export const render = (obj) => {
    const defaults = {
        tag: "div",
        content: [],
        attributes: {},
        style: {},
        data: {},
        aria: {},
        events: {},
        classNames: [],
        isSvg: false,
    };
    const merged = {
        ...defaults,
        ...obj,
        content: castToArray(obj.content).map((item) =>
            typeof item === "string" || !isNaN(item) || item instanceof Node ? item : render(item)
        ),
    };

    return create(merged);
};

/**
 * Normalizes content into an array.
 * - `undefined` or `null` → []
 * - Arrays → returned as-is
 * - Anything else → wrapped in a one-element array
 *
 * @param {*} content - The input to normalize.
 * @returns {Array} An array guaranteed to be iterable.
 */
const castToArray = (content) => {
    if (typeof content === "undefined" || content === null) {
        return [];
    }
    if (Array.isArray(content)) {
        return content;
    }
    return [content];
};
