import TrBaseMarker from './trBaseMarker.js';

/**
 * TrHideCompleted plugin
 * Hide lines in which you have found all items
 *
 * @param {App} app
 * @returns {Plugin} TrHideCompleted
 */
class TrHideCompleted extends TrBaseMarker {

    constructor(app) {

        super(app, 'Hide completed', 'Hide lines in which all items have been found', {
            canChangeState: true,
            defaultState: false,
            marker: 'completed',
            className: 'hidden'
        });
        this.add();
    }
}

export default TrHideCompleted;
