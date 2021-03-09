import TrBaseMarker from './trBaseMarker.js';

/**
 * Highlight most important entry
 *
 * @param {App} app
 * @returns {Plugin} TrMarkPreeminent
 */
class TrMarkPreeminent extends TrBaseMarker {

    constructor(app) {

        super(app, 'Highlight preeminent', {
            canChangeState: true,
            marker: 'preeminent'
        });

        this.add();
    }
}

export default TrMarkPreeminent;