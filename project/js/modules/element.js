// everything DOM element related

/**
 * Create elements conveniently
 * @param tag
 * @param text
 * @param classNames
 * @param attributes
 * @returns {*}
 */
export default element = ({
    tag = 'div',
    text = '',
    classNames = [],
    attributes = {}
} = {}) => {
    const element = document.createElement(tag);
    if (classNames.length) {
        element.classList.add(...classNames);
    }
    if (Array.isArray(text)) {
        text = text.join(' ');
    }
    if (text) {
        element.textContent = text;
    }
    for (const [key, value] of Object.entries(attributes)) {
        if (value) {
            element.setAttribute(key, value);
        }
    }
    return element;
}
