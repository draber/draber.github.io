/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import TablePane from './tablePane.js';
import Popup from './popup.js';
import fn from 'fancy-node';

/**
 * YourProgress plugin
 *
 * @param {App} app
 * @returns {Plugin} YourProgress
 */
class YourProgress extends TablePane {

    /**
     * Display pop-up
     * @returns {YourProgress}
     */
    display() {
        const points = data.getPoints('foundTerms');
        const max = data.getPoints('answers');
        const next = this.getPointsToNextTier();
        const progress = points * 100 / max;

        let content;

        if (next) {
            content = fn.span({
                content: [
                    'You are currently at ',
                    fn.b({
                        content: points + '/' + max
                    }),
                    ' points or ',
                    fn.b({
                        content: Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100) + '%'
                    }),
                    '. You need ',
                    fn.b({
                        content: next - points
                    }),
                    ' more points to go to the next level.',
                ]
            })
        } else {
            content = fn.span({
                content: [
                    'Congratulations, you’ve found all ',
                    fn.b({
                        content: points
                    }),
                    ' points!',
                ]
            })
        }

        this.popup
            .setContent('subtitle', fn.span({
                content
            }))
            .setContent('body', this.getPane())
            .toggle(true);

        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const maxPoints = data.getPoints('answers');
        return [
            ['Beginner', 0],
            ['Good Start', 2],
            ['Moving Up', 5],
            ['Good', 8],
            ['Solid', 15],
            ['Nice', 25],
            ['Great', 40],
            ['Amazing', 50],
            ['Genius', 70],
            ['Queen Bee', 100]
        ].map(entry => {
            return [entry[0], Math.round(entry[1] / 100 * maxPoints), entry[1]];
        })
    }

    /**
     * Get current tier
     * @returns {Array}
     */
    getCurrentTier() {
        return this.getData().filter(entry => entry[1] <= data.getPoints('foundTerms')).pop()[1];
    }

    /**
     * Get points to nex tier
     * @returns {Number|null}
     */
    getPointsToNextTier() {
        const remainders = this.getData().filter(entry => entry[1] > data.getPoints('foundTerms')).shift();
        return remainders ? remainders[1] : null;
    }

    /**
     * Rankings constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Milestones', 'The number of points required for each level', {
            cssMarkers: {
                completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
                preeminent: rowData => rowData[1] === this.getCurrentTier()
            },

            hasHeadRow: false,
            hasHeadCol: false
        });

        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title);

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        this.shortcuts = [{
            combo: "Shift+Alt+M",
            method: "display"
        }]

    }
}

export default YourProgress;