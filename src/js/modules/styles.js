import css from "../../css/widget.css";
import el from './element.js';

/**
 * @type {HTMLElement}
 */
let styles;

export default {
	/**
	 * Adds the app `<style>` to `<head>`
	 * @param app
	 */
	add: (app) => {		
		styles = el.create({
			tag: 'style',
			// (Dart) Sass adds a BOM to CSS with Unicode characters
			// `rollup-plugin-string` converts linebreaks to `\n`
			text: css.replace(/(\uFEFF|\\n)/gu, '')
		});
		app.addEventListener('sbaDestroy', () => {
			styles.remove();
		})
		return el.$('head').append(styles);
	},
	/**
	 * Remove `<style>`
	 */
	remove: () => {
		return styles.remove();
	}
}
