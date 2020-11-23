import el from './element.js';
import observers from './observers.js';


const addObserver = (app, target) => {
	observers.add(new MutationObserver(mutationsList => {
		// we're only interested in the very last mutation
		app.dispatchEvent(new CustomEvent('sbaUpdate', {
			detail: {
				text: mutationsList.pop().addedNodes[0]
			}
		}));
	}), target, {
		childList: true
	});
}

/**
 * export widget
 */
export default function widget(observerTarget, {
	text = '',
	classNames = [],
	attributes = {},
	data = {},
	draggable = true,
	modal = !draggable,
	closable = draggable,
	events = {}
} = {}) {
	if (!data.id) {
		console.error('Widget must have a unique id');
		return;
	}	

	const canvas = el.create({
		data: Object.assign({
			modal: modal
		}, data),
		classNames: classNames,
		attributes: attributes,
		events: events
	});

	addObserver(canvas, observerTarget);

	const ui = el.create();

	canvas.append(ui);

	if (text) {
		const title = el.create({
			text: text,
			attributes: {
				title: 'Hold the mouse down to drag'
			},
			classNames: ['dragger']
		});
		ui.append(title);
	}

	if (closable) {
		const closer = el.create({
			tag: 'span',
			text: '×',
			attributes: {
				title: 'Close'
			},
			classNames: ['closer'],
			events: {
				click: () => {
					canvas.dispatchEvent(new Event('destroy'))
				}
			}
		});
		ui.append(closer);
	}

	return canvas;
}