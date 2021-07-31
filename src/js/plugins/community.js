/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';
import el from '../modules/element.js';
import Popup from './popup.js';

/**
 * Community plugin
 *
 * @param {App} app
 * @returns {Plugin} Community
 */
class Community extends Plugin {

    hasGeniusNo4Letters() {
        const maxPoints = data.getPoints('answers');
        const no4LetterPoints = maxPoints - data.getList('answers').filter(term => term.length === 4).length;
        return no4LetterPoints >= Math.round(70 / 100 * maxPoints);
    }

    getPerfectPangramCount() {
        return data.getList('pangrams').filter(term => term.length === 7).length;
    }

    hasBingo() {
        return Array.from(new Set(data.getList('answers').map(term => term.charAt[0]))).length === 7;
    }

    nytCommunity() {
        const date = data.getDate().print;
        const href = `https://www.nytimes.com/${date.replace(/-/g, '/')}/crosswords/spelling-bee-${date}.html#commentsContainer`;
        return el.a({
            content: 'Offcial NYT Spelling Bee Forum (URL changes daily!)',
            attributes: {
                href,
                target: prefix()
            }
        })
    }

    nytSpotlight() {
        const date = data.getDate().print;
        const href = `https://www.nytimes.com/spotlight/spelling-bee-forum`;
        return el.a({
            content: 'List of all NYT Spelling Bee Forums so far',
            attributes: {
                href,
                target: prefix()
            }
        })
    }

    redditCommunity() {
        return el.a({
            content: 'NY Times Spelling Bee Puzzle at Reddit',
            attributes: {
                href: 'https://www.reddit.com/r/NYTSpellingBee/',
                target: prefix()
            }
        })
    }

    /**
     * Display pop-up
     * @param {Event} evt
     * @returns {Community}
     */
    display() {
        this.popup.toggle(true);
        return this;
    }

    /**
     * Community constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Community', 'Offical and not so offical Spelling Bee resources.', {
            canChangeState: true
        });

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        const features = el.ul({
            content: [
                el.li({
                    content: [
                        el.h4({
                            content: 'Does this game feature Perfect Pangrams?'
                        }), 
                        el.p({
                            content: (() => {
                                const pp = this.getPerfectPangramCount();
                                switch (true) {
                                    case pp === 0:
                                        return `There is no Perfect Pangram in today’s game`;
                                    case pp === 1:
                                        return `There is ${pp} Perfect Pangram in today’s game`;
                                    default:
                                        return `There are ${pp} Perfect Pangrams in today’s game`;
                                }
                            })()
                        }), 
                        el.em({
                            content: 'Pangrams that use each letter only once are called "perfect" by the community.'
                        })
                    ]
                }),
                el.li({
                    content: [
                        el.h4({
                            content: 'Does it classify as "Bingo"?'
                        }),
                        el.p({
                            content: this.hasBingo() ? 'Yes, today is Bingo day!' : 'Sorry, it doesn’t today'
                        }),
                        el.em({
                            content: '"Bingo" means that all seven letters in the puzzle are used to start at least one word in the word list.'
                        })
                    ]
                }),
                el.li({
                    content: [
                        el.h4({
                            content: 'Is it possible to reach Genius without using 4-letter words today?'
                        }),
                        el.p({
                            content: this.hasGeniusNo4Letters() ? 'Yes, it is!' : 'Sorry, it isn’t'
                        })
                    ]
                }),
                el.li({
                    content: [
                        el.h4({
                            content: 'Forums'
                        }),
                        el.ul({
                            content: [
                                el.li({
                                    content: this.nytCommunity()
                                }),
                                el.li({
                                    content: this.nytSpotlight()
                                }),
                                el.li({
                                    content: this.redditCommunity()
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title)
            .setContent('subtitle', this.description)            
            .setContent('body', features);

    }
}

export default Community;