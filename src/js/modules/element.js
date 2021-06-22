const fn = {
    /**
     * Returns first element that matches CSS selector {expr}.
     * Querying can optionally be restricted to {container}’s descendants
     * @param {String} expr
     * @param {HTMLElement} container
     * @return {HTMLElement || null}
     * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
     */
    $: (expr, container = null) => {
        return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
    },

    /**
     * Returns all elements that match CSS selector {expr} as an array.
     * Querying can optionally be restricted to {container}’s descendants
     * @param {String} expr
     * @param {HTMLElement} container
     * @return {Array}
     * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
     */
    $$: (expr, container = null) => {
        return [].slice.call((container || document).querySelectorAll(expr));
    },

    /**
     * Convert whatever form of HTML to a single element or fragment
     * @param {Element|DocumentFragment|Iterable|String|HTMLCode} content
     * @return {Element|DocumentFragment}
     */
    toNode: (content) => {
        const fragment = document.createDocumentFragment();

        if (typeof content === 'undefined') {
            return fragment;
        }

        // HTML or SVG element or DocumentFragment, a single node either way
        if (content instanceof Element || content instanceof DocumentFragment) {
            return content;
        }

        // numeric values are acted to string
        if (typeof content === 'number') {
            content = content.toString();
        }

        // HTML, text or a mix
        if (typeof content === 'string' ||
            content instanceof String
        ) {
            const doc = (new DOMParser()).parseFromString(content, 'text/html');
            content = doc.body.childNodes;
        }

        // anything iterable
        if(typeof content.forEach === 'function') {
            // Array.from avoids problems with live collections
            Array.from(content).forEach(element => {
                fragment.append(element);
            })
            return fragment;
        }

        console.error('Expected Element|DocumentFragment|Iterable|String|HTMLCode, got', content);
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
 * @returns {*}
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