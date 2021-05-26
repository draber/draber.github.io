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
     * @param {Element|NodeList|Array|String} html
     * @return {Element|DocumentFragment}
     */
    htmlToNode: html => { 
        if (html instanceof Element) {
            return html;
        }
        
        if((typeof html === 'string' || html instanceof String) 
            && html.trim().startsWith('<') 
            && html.trim().endsWith('>')) {        
            const wrapper = el.div();
            wrapper.innerHTML = html;
            html = wrapper.childNodes;
        }
        
        if (html instanceof NodeList || Array.isArray(html)) {       
            const fragment = document.createDocumentFragment();
            html.forEach(element => {
                fragment.append(element);
            })
            return fragment;
        }
        
        console.error('Expected Element|NodeList|Array|String, got ', html);
    }
}

/**
 * Create elements conveniently
 * @param {{tag: String, text: String, attributes: Object, style: Object, data: Object, events: Object, classNames: Array, svg: Boolean, html: Element|NodeList|Array|String}}
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
    svg,
    html
} = {}) {
    const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    if(tag === 'a' && attributes.href && !text) {
        text = (new URL(attributes.href)).hostname;
    }
    el.textContent = text;
    for (let [key, value] of Object.entries(attributes)) {
        if (svg) {
            el.setAttributeNS(null, key, value.toString());
        } 
        else if(key === 'role' || key.startsWith('aria-')){
            // won't work for `checked` etc.
            el.setAttribute(key, value);
        }
        else if(value !== false) {
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
    if(html) {
        el.append(fn.htmlToNode(html));
    }
    return el;
};

// noinspection SpellCheckingInspection
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
 *     data: {
 *         foo: 'bar'
 *     },
 *     events: {
 *         click: () => alert('quux')
 *     },
 *     classNames: [
 *         'boom'
 *     ],
 *     svg: true|false (default),
 *     html: HTMLElement|NodeList|Array|String 
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
