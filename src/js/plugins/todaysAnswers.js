/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';
import fn from 'fancy-node';

/**
 * TodaysAnswers plugin
 *
 * @param {App} app
 * @returns {Plugin} TodaysAnswers
 */
class TodaysAnswers extends Plugin {

    /**
     * Display pop-up
     * @param {Event} evt
     * @returns {TodaysAnswers}
     */
    display() {
        const foundTerms = data.getList('foundTerms');
        const pangrams = data.getList('pangrams');

        const pane = fn.ul({
            classNames: ['sb-modal-wordlist-items']
        })

        data.getList('answers').forEach(term => {
            pane.append(fn.li({
                content: [
                    fn.span({
                        classNames: foundTerms.includes(term) ? ['check', 'checked'] : ['check']
                    }), fn.span({
                        classNames: pangrams.includes(term) ? ['sb-anagram', 'pangram'] : ['sb-anagram'],
                        content: term
                    })
                ]
            }));
        });

        this.popup
            .setContent('body', [
                fn.div({
                    content: data.getList('letters').join(''),
                    classNames: ['sb-modal-letters']
                }),
                pane
            ])
            .toggle(true);

        return this;
    }

    /**
     * TodaysAnswers constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Today’s Answers', 'Reveals the solution of the game', {
            canChangeState: true,
            defaultState: false,
            key: 'todaysAnswers'
        });

        this.marker = prefix('resolved', 'd');
        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title)
            .setContent('subtitle', data.getDate().display);

        this.menuAction = 'popup';
        this.menuIcon = 'warning';

        this.shortcuts = [{
            combo: "Shift+Alt+A",
            method: "display"
        }];
    }
}

export default TodaysAnswers;