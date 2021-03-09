import TrBaseMarker from './trBaseMarker.js';

/**
 * Greyout Completed plugin
 *
 * @param {App} app
 * @returns {Plugin} TrMarkCompleted
 */
class TrMarkCompleted extends TrBaseMarker {

    constructor(app) {

        super(app, 'Grey out completed', {
            canChangeState: true,
            marker: 'completed'
        });

        this.add();
    }
}

export default TrMarkCompleted;