/**
 * Create elements conveniently
 * @param tagName
 * @param text
 * @param classNames
 * @param attributes
 * @returns {*}
 */
const createElement = (tagName, {
    text = '',
    classNames = [],
    attributes = {}
} = {}) => {
    const element = document.createElement(tagName);
    if (classNames.length) {
        element.classList.add(...classNames);
    }
    if (text !== '') {
        element.textContent = text;
    }
    for (const [key, value] of Object.entries(attributes)) {
        if (value) {
            element.setAttribute(key, value);
        }
    }
    return element;
}

/**
 * Implement drag/drop
 * @param container
 * @returns {*}
 */
const buildDragMechanism = (container) => {

    gameContainer.addEventListener('dragstart', function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move"
    });

    gameContainer.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    container.draggable = true;
    const dragger = createElement('div', {
        classNames: ['dragger'],
        text: 'Assistant',
        attributes: {
            title: 'Hold the mouse down to drag assistant'
        }
    });

    container.addEventListener('dragstart', function (event) {
        event.stopPropagation();
        const style = getComputedStyle(this);
        container.classList.add('dragging');
        this.dataset.right = style.getPropertyValue('right');
        this.dataset.top = style.getPropertyValue('top');
        this.dataset.mouseX = event.clientX;
        this.dataset.mouseY = event.clientY;
    }, false);

    container.addEventListener('dragend', function (event) {
        event.stopPropagation();
        const mouseDiffX = event.clientX - this.dataset.mouseX;
        const mouseDiffY = event.clientY - this.dataset.mouseY;
        this.style.right = parseInt(this.dataset.right) - mouseDiffX + 'px';
        this.style.top = parseInt(this.dataset.top) + mouseDiffY + 'px';
        container.classList.remove('dragging');
    }, false);

    return dragger;
}

/**
 * Build app closer (the little x in the top right corner)
 *
 * @returns {*}
 */
const buildCloser = () => {
    const closer = createElement('span', {
        classNames: ['closer'],
        text: '×',
        attributes: {
            title: 'Close assistant'
        }
    });
    closer.addEventListener('click', function () {
        window.gameData.assistant = false;
        styles.remove();
        observer.disconnect();
        this.parentNode.remove();
    });
    return closer;
}

const createWidgetContainer = ({
    text = '',
    classNames = [],
    attributes = {},
    closer = {
        title: 'Close {text}',
        event: 'widgetClose'
    },
    options = {
        draggable: true,
        closable: true
    }
} = {}) => {
    const container = createElement('div', {
        classNames: classNames,
        attributes: attributes
    });
    if(options.draggable){
        container.append(buildDragMechanism(container));
    }
    if(options.closer !== false) {
        container.append(buildCloser(closer));
    }
    return container;
}

export { createElement }
