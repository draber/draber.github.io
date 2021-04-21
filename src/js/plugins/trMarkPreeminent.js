import TrBaseMarker from './trBaseMarker.js';

/**
 * TrMarkPreeminent Plugin
 * Highlight most important entry
 *
 * @param {App} app
 * @returns {Plugin} TrMarkPreeminent
 */
class TrMarkPreeminent extends TrBaseMarker {

    constructor(app) {

        super(app, 'Highlight preeminent', 'Highlights the most important line in a table', {
            canChangeState: true,
            marker: 'preeminent'
        });

        this.add();
    }
}

export default TrMarkPreeminent;