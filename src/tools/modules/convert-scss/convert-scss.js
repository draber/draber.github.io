import substituteVars from '../substitute-vars/substitute-vars.js';
import sass from 'sass';
import compact from '../formatters/css/compact.js';

/**
 * Convert SCSS to CSS, but without the annoyances, but with variable substitution
 * 
 * @param {Object} options
 * @see https://sass-lang.com/documentation/js-api for signature
 * @returns {String}
 */
const convertScss = options => {
    let postCompact = false;
    if (options.outputStyle === 'compact') {
        options.outputStyle = 'compressed';
        postCompact = true;
    }
    let css = sass.renderSync(options).css.toString()
        .replace(/\uFEFF/gu, '')
        .replace(/\\n/g, '');
    css = substituteVars(css);
    if (postCompact) {
        css = compact(css);
    }
    return css;
}

export default convertScss;