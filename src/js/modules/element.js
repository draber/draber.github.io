/**
 * Returns first element that matches CSS selector {expr}.
 * Querying can optionally be restricted to {container}’s descendants
 * 
 * @param {String} expr 
 * @param {HTMLElement} container 
 * @return {HTMLElement || null}
 * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
 */
const $ = (expr, container) => {
	return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
}


/**
 * Returns all elements that match CSS selector {expr} as an array.
 * Querying can optionally be restricted to {container}’s descendants
 * 
 * @param {String} expr 
 * @param {HTMLElement} container 
 * @return {Array}
 * @see https://lea.verou.me/2015/04/jquery-considered-harmful/
 */
const $$ = (expr, container) => {
	return [].slice.call((container || document).querySelectorAll(expr));
}

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

const labeledCheckbox = ({
	text = '',
	classNames = [],
	attributes = {},
	events = {}
} = {}) => {
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
 * 
 * @param tag
 * @param text
 * @param classNames
 * @param attributes
 * @returns {HTMLElement}
 */
const create = ({
	tag = 'div',
	text = '',
	classNames = [],
	attributes = {},
	data = {},
	events = {},
	cellData = [],
	cellTag = 'td'
} = {}) => {
	if (tag === 'tr' && cellData.length) {
		return tableRow({ classNames, events, cellData, cellTag });
	}
	if (tag === 'input' && attributes.type === 'checkbox' && text) {
		return labeledCheckbox({
			text,
			classNames,
			attributes,
			events
		});
	}
	const el = document.createElement(tag);
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
	for (const [key, val] of Object.entries(attributes)) {
		if (val !== '') {
			el.setAttribute(key, val);
		}
	}
	for (const [key, val] of Object.entries(data)) {
		el.dataset[key] = val;
	}
	for (const [event, fn] of Object.entries(events)) {
		el.addEventListener(event, fn, false);
	}
	return el;
}

/**
 * export everything
 */
export default {
	$,
	$$,
	create
}