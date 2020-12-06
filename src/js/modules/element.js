/**
 * Returns first element that matches CSS selector {expr}.
 * Querying can optionally be restricted to {container}’s descendants
 * @param {String} expr
 * @param {HTMLElement} container
 * @return {HTMLElement || null}
 * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
 */
const $ = (expr, container = null) => {
    return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
}


/**
 * Returns all elements that match CSS selector {expr} as an array.
 * Querying can optionally be restricted to {container}’s descendants
 * @param {String} expr
 * @param {HTMLElement} container
 * @return {Array}
 * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
 */
const $$ = (expr, container = null) => {
    return [].slice.call((container || document).querySelectorAll(expr));
}

/**
 * Create a table row with data
 * @param {Array} classNames
 * @param {Object} events
 * @param {Array} cellData
 * @param {String} cellTag
 * @returns {HTMLElement}
 */
const tableRow = ({
    classNames = [],
    events = {},
    cellData = [],
    cellTag = 'td'
} = {}) => {
    const row = create({
        tag: 'tr',
        classNames: classNames,
        events: events
    });
    cellData.forEach(entry => {
        row.append(create({
            tag: cellTag,
            text: entry
        }));
    });
    return row;
}
/**
 * Create a checkbox enclosed in a label
 * @param {String} text
 * @param {Array} classNames
 * @param {Object} attributes
 * @param {Object} events
 * @param {boolean} checked
 * @returns {HTMLElement}
 */
const labeledCheckbox = ({
    text = '',
    classNames = [],
    attributes = {},
    events = {},
    checked = false
} = {}) => {
    if(checked) {
        attributes.checked = 'checked';
    }
    const checkbox = create({
        tag: 'input',
        attributes: attributes,
        events: events
    });
    const label = create({
        tag: 'label',
        text: text,
        classNames: classNames
    });
    label.prepend(checkbox);
    return label;
}

/**
 * Create elements conveniently
 * @param {String} tag
 * @param {String} text
 * @param {Object} attributes
 * @param {Object} style
 * @param {Object} data
 * @param {Object} events
 * @param {Array} classNames
 * @param {Array} cellData
 * @param {String} cellTag
 * @param {boolean} checked
 * @returns {HTMLElement}
 */
const create = ({
    tag = 'div',
    text = '',
    attributes = {},
    style = {},
    data = {},
    events = {},
    classNames = [],
    cellData = [],
    cellTag = 'td',
    checked = false
} = {}) => {
    if (tag === 'tr' && cellData.length) {
        return tableRow({
            classNames,
            events,
            cellData,
            cellTag
        });
    }
    if (tag === 'input' && attributes.type === 'checkbox' && text) {
        return labeledCheckbox({
            text,
            classNames,
            attributes,
            events,
            checked
        });
    }
    const el = document.createElement(tag);
    for (const [prop, value] of Object.entries(style)) {
        el.style[prop] = value;
    }
    if (classNames.length) {
        el.classList.add(...classNames);
    }
    if (Array.isArray(text)) {
        el.append(create({
            tag: text[1],
            text: text[0]
        }));
    } else {
        el.textContent = text;
    }
    for (const [key, value] of Object.entries(attributes)) {
        if (value !== '') {
            el.setAttribute(key, value);
        }
    }
    for (const [key, value] of Object.entries(data)) {
        el.dataset[key] = value;
    }
    for (const [event, fn] of Object.entries(events)) {
        el.addEventListener(event, fn, false);
    }
    return el;
}

export default {
    $,
    $$,
    create
}