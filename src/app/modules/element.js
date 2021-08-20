/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * Build an Element or DocumentFragment from just about anything
 * @param content
 * @returns {Element|DocumentFragment|HTMLElement|DocumentFragment|DocumentFragment}
 */
const cast = content => {

    if (typeof content === 'undefined') {
        return document.createDocumentFragment();
    }

    // HTML or SVG element or DocumentFragment, a single node either way
    if (content instanceof Element || content instanceof DocumentFragment) {
        return content;
    }

    // numeric values are treated as strings
    if (typeof content === 'number') {
        content = content.toString();
    }

    // HTML, text or a mix
    if (typeof content === 'string' ||
        content instanceof String
    ) {
        // either HTML or SVG
        const mime = content.includes('<svg') ? 'image/svg+xml' : 'text/html';
        const doc = (new DOMParser()).parseFromString(content, mime);
        let node;
        // if the string is HTML or text
        if (doc.body) {
            node = document.createDocumentFragment();
            const children = Array.from(doc.body.childNodes);
            children.forEach(elem => {
                node.append(elem);
            })
        }
        // if the string is SVG
        else {
            node = doc.documentElement;
        }
        return node;
    }
    console.error('Expected Element|DocumentFragment|String|HTMLCode|SVGCode, got', content);
}

/**
 * Container object for all functions
 */
const fn = {
    /**
     * Returns first element that matches CSS selector {selector}.
     * Querying can optionally be restricted to {container}’s descendants
     * @param {String} selector
     * @param {HTMLElement} container
     * @return {HTMLElement || null}
     * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
     */
    $: (selector, container = null) => {
        return typeof selector === 'string' ? (container || document).querySelector(selector) : selector || null;
    },

    /**
     * Returns all elements that match CSS selector {selector} as an array.
     * Querying can optionally be restricted to {container}’s descendants
     * @param {String} selector
     * @param {HTMLElement} container
     * @return {Array}
     * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
     */
    $$: (selector, container = null) => {
        return [].slice.call((container || document).querySelectorAll(selector));
    },

    /**
     * Wait for an element to be present in the DOM
     * @param selector
     * @param container
     * @returns {Promise<HTMLElement>}
     */
    waitFor: function (selector, container = null) {
        return new Promise(resolve => {
            const getElement = () => {
                const resultList = fn.$(selector, container);
                if (resultList) {
                    resolve(resultList);
                } else {
                    requestAnimationFrame(getElement);
                }
            };
            getElement();
        })
    },

    /**
     * Convert whatever form of HTML to a single element or fragment
     * The actual conversion is mostly done by cast()
     * @param {Element|DocumentFragment|Iterable|String|HTMLCode|SVGCode} content
     * @return {Element|DocumentFragment}
     */
    toNode: (content) => {

        // cast non-iterables to array
        if (!content.forEach || typeof content.forEach !== 'function') {
            content = [content];
        }

        // cast all parts to Elements or DocumentFragments
        content = content.map(entry => cast(entry));

        if (content.length === 1) {
            return content[0]
        } else {
            const fragment = document.createDocumentFragment();
            // Array.from avoids problems with live collections
            content.forEach(entry => {
                fragment.append(entry);
            })
            return fragment;

        }
    },

    /**
     * Empty an element whilst avoiding `innerHTML`;
     * @param {HTMLElement} element
     * @returns
     */
    empty: element => {
        while (element.lastChild) {
            element.lastChild.remove();
        }
        element.textContent = '';
        return element;
    }
}

/**
 * Create elements conveniently
 * @param tag: String
 * @param content: Element|NodeList|Array|String|HTMLCode
 * @param attributes: Object
 * @param style: Object
 * @param data: Object
 * @param events: Object
 * @param classNames: Array
 * @param isSvg: Boolean
 * @returns {HTMLElement}
 * @todo Distinguish between attributes and properties
 */
const create = function ({
                             tag,
                             content,
                             attributes = {},
                             style = {},
                             data = {},
                             events = {},
                             classNames = [],
                             isSvg
                         } = {}) {
    const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    if (tag === 'a' && attributes.href && !content) {
        content = (new URL(attributes.href)).hostname;
    }
    for (let [key, value] of Object.entries(attributes)) {
        if (isSvg) {
            el.setAttributeNS(null, key, value.toString());
        } else if (key === 'role' || key.startsWith('aria-')) {
            // won't work for `checked` etc.
            el.setAttribute(key, value);
        } else if (value !== false) {
            el[key] = value.toString();
        }
    }
    for (let [key, value] of Object.entries(data)) {
        value = value.toString();
        el.dataset[key] = value;
    }
    for (const [event, fn] of Object.entries(events)) {
        el.addEventListener(event, fn, false);
    }
    Object.assign(el.style, style);
    if (classNames.length) {
        el.classList.add(...classNames);
    }
    if (typeof content !== 'undefined') {
        el.append(fn.toNode(content));
    }
    return el;
};

/**
 * Dispatcher for the `create()`, `$` and `$$`
 * Examples (for $, $$ see docs on the functions):
 * @example
 * el.div() returns a div element, where `div` can be any element
 * el.a({
 *     content: HTMLElement|NodeList|Array|String|HTMLCode,
 *     attributes: {
 *         href: 'http://example.com'
 *     },
 *     style: {
 *         color: 'red'
 *     },
 *     data: {
 *         foo: 'bar'
 *     },
 *     events: {
 *         click: () => alert('quux')
 *     },
 *     classNames: [
 *         'boom'
 *     ],
 *     isSvg: true|false (default)
 * })
 * returns the element `<a href="http://example.com" style="color: red" data-foo="bar" class="boom">My link</a>` that issues an alert when clicked
 */
const el = new Proxy(fn, {
    /**
     * Either build an element or retrieve one or multiple from the DOM
     * @param target
     * @param prop
     * @returns {function(): (*)}
     */
    get(target, prop) {
        return function () {
            const args = Array.from(arguments);
            if (Object.prototype.hasOwnProperty.call(target, prop) && typeof target[prop] === 'function') {
                target[prop].bind(target);
                return target[prop].apply(null, args);
            }
            return create({
                ...{
                    tag: prop
                },
                ...args.shift()
            });
        }
    }
});

export default el;