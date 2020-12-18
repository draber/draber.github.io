/**
 * Drag start parameters
 * @type {Object}
 */
let params;

/**
 * Start dragging only when initiated on the header
 * @type {boolean}
 */
let isLastTarget = false;

/**
 * Assign drag start parameters
 * @param {widget} app
 * @param {Event} evt
 * @param {HTMLElement} visualContainer 
 * @param {*} trigger 
 * @returns {{minT: number, maxT: number, margT, maxL: number, offX: number, offY: number}}
 */
const getDragParams = (evt, app, visualContainer, trigger) => {
    const gRect = visualContainer.getBoundingClientRect();
    const aRect = app.ui.getBoundingClientRect();
    const minT = gRect.top + window.pageYOffset;
    const pRect = trigger.ui.parentElement.getBoundingClientRect();
    const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;

    return {
        maxL: document.documentElement.clientWidth - aRect.width,
        minT: minT,
        maxT: minT + gAvailH,
        offX: evt.screenX - aRect.x,
        offY: evt.screenY - aRect.y,
        margT: parseInt(getComputedStyle(app.ui).marginTop, 10)
    };
}

/**
 * Get corrected drop position
 * @param evt
 * @returns {{top: string, left: string}}
 */
const getDropPosition = evt => {
    let left = Math.max(0, (evt.screenX - params.offX));
    left = Math.min(left, (params.maxL)) + 'px';
    let top = Math.max(params.minT, (evt.screenY + window.pageYOffset - params.margT - params.offY));
    top = Math.min(top, params.maxT) + 'px';
    return {
        left,
        top
    };
}

const enableDrag = (app, visualContainer, trigger) => {

    if(!app.ui.draggable){
        return false;
    }

    // ensure correct drag icon
    [app.ui, visualContainer].forEach(element => {
        element.addEventListener('dragover', evt => evt.preventDefault());
    });

    app.on('pointerdown', evt => {
        isLastTarget = !!evt.target.closest(`[data-ui="${trigger.key}`);
    }).on('pointerup', () => {
        isLastTarget = false;
    }).on('dragend', evt => {
        Object.assign(app.ui.style, getDropPosition(evt));
        evt.target.style.opacity = '1';
    }).on('dragstart', evt => {
        if (!isLastTarget) {
            evt.preventDefault();
            return false;
        }
        app.ui.style.opacity = '.2';
        params = getDragParams(evt, app, visualContainer, trigger);
    }, false);
}



export default enableDrag;