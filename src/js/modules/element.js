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
    }
}

/**
 * Create elements conveniently
 * @param {{tag: String, text: String, attributes: Object, style: Object, data: Object, events: Object, classNames: Array, svg: Boolean}}
 * @returns {HTMLElement}
 */
const create = function ({
    tag,
    text = '',
    attributes = {},
    style = {},
    data = {},
    events = {},
    classNames = [],
    svg
} = {}) {
    const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    el.textContent = text;
    for (const [key, value] of Object.entries(attributes)) {
        if (svg) {
            el.setAttributeNS(null, key, value);
        } else {
            el[key] = value;
        }
    }    
    for (const [key, value] of Object.entries(data)) {
        el.dataset[key] = value;
    }
    for (const [event, fn] of Object.entries(events)) {
        el.addEventListener(event, fn, false);
    }
    Object.assign(el.style, style);
    if (classNames.length) {
        el.classList.add(...classNames);
    }
    return el;
};

/**
 * Dispatcher for the `create()`, `$` and `$$`
 * Examples (for $, $$ see docs on the functions):
 * el.div() returns a div element, where `div` can be any element
 * el.a({
 *     text: "My link",
 *     attributes: {
 *         href: 'http://example.com'
 *     },
 *     style: {
 *         color: 'red'
 *     },
 *     data = {
 *         foo: 'bar'
 *     },
 *     events = {
 *         click: () => alert('quux')
 *     },
 *     classNames = [
 *         'boom'
 *     ]
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
            const args = Array.prototype.slice.call(arguments);
            if (target.hasOwnProperty(prop) && typeof target[prop] === 'function') {
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