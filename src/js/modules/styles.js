import css from "../../css/widget.css";
import el from './element.js';

let styles;

export default {
	add: () => {		
		styles = el.create({
			tag: 'style',
			text: css.replace(/(\uFEFF|\\n)/u, '')
		});
		return el.$('head').append(styles);
	},
	remove: () => {
		return styles.remove();
	}
}
