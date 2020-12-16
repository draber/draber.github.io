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
 * @param {String} tag
 * @param {String} text
 * @param {Object} attributes
 * @param {Object} style
 * @param {Object} data
 * @param {Object} events
 * @returns {HTMLElement}
 */
const create = function ({
    tag,
    text = '',
    attributes = {},
    style = {},
    data = {},
    events = {},
    classNames = []
} = {}) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries({
            ...{
                textContent: text
            },
            ...attributes
        })) {
        el[key] = value;
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

const el = new Proxy(fn, {
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
