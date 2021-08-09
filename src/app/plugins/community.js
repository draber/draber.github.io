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
import Panel from './panel.js';

/**
 * Community plugin
 *
 * @param {App} app
 * @returns {Plugin} Community
 */
class Community extends Plugin {

    /**
     * Can Genius be achieved without using 4-letter words?
     * @returns {Boolean}
     */
    hasGeniusNo4Letters() {
        const maxPoints = data.getPoints('answers');
        const no4LetterPoints = maxPoints - data.getList('answers').filter(term => term.length === 4).length;
        return no4LetterPoints >= Math.round(70 / 100 * maxPoints);
    }

    /**
     * How many pangrams are there, if any
     * @returns {Integer}
     */
    getPerfectPangramCount() {
        return data.getList('pangrams').filter(term => term.length === 7).length;
    }

    /**
     * Will each letter serve as a starting letter at least once?
     * @returns {Boolean}
     */
    hasBingo() {
        return Array.from(new Set(data.getList('answers').map(term => term.charAt[0]))).length === 7;
    }

    /**
     * Link to the daily forum at NYT
     * @returns {*}
     */
    nytCommunity() {
        const date = data.getDate().print;
        const href = `https://www.nytimes.com/${date.replace(/-/g, '/')}/crosswords/spelling-bee-${date}.html#commentsContainer`;
        return el.a({
            content: 'NYT Spelling Bee Forum for today’s game',
            attributes: {
                href,
                target: prefix()
            }
        })
    }

    /**
     * Links to popular Twitter hashtags
     * @returns {*[]}
     */
    twitter() {
        const hashtags = ['hivemind', 'nytspellingbee', 'nytbee', 'nytsb'].map(tag => el.a({
            content: `#${tag}`,
            attributes: {
                href: `https://twitter.com/hashtag/${tag}`,
                target: prefix()
            }
        }));
        const result = [];
        hashtags.forEach(entry => {
            result.push(entry, ', ');
        })
        result.pop();
        result.push(' on Twitter');
        return result;
    }

    /**
     * Link to NYT's SB forum portal
     * @returns {*}
     */
    nytSpotlight() {
        const href = `https://www.nytimes.com/spotlight/spelling-bee-forum`;
        return el.a({
            content: 'Portal to all NYT Spelling Bee Forums',
            attributes: {
                href,
                target: prefix()
            }
        })
    }

    /**
     * Link to the Reddit forum
     * @returns {*}
     */
    redditCommunity() {
        return el.a({
            content: 'NY Times Spelling Bee Puzzle on Reddit',
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
    display(target) {
		target.display(this.panel);
        return this;
    }

    

    /**
     * Community constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Community', 'Spelling Bee resources suggested by the community', {
            canChangeState: true
        });

        this.menuAction = 'panel';
        this.menuIcon = 'null';
        const words = ['two','three','four', 'five','six','seven','eight','nine','ten'];

        const features = el.ul({
            content: [
                el.li({
                    content: [
                        el.h4({
                            content: 'Does today’s game have a Perfect Pangram?'
                        }),
                        el.p({
                            content: (() => {
                                const pp = this.getPerfectPangramCount();
                                switch (pp) {
                                    case 0:
                                        return `No, today it doesn’t`;
                                    case 1:
                                        return `Yes, today there’s one Perfect Pangram`;
                                    default:
                                        // there have never been more then three pangrams, so this should be good enough
                                        return `Yes, today there are ${words[pp - 2]} Perfect Pangrams`;
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
                            content: this.hasBingo() ? 'Yes, today is Bingo day!' : 'No, today it doesn’t'
                        }),
                        el.em({
                            content: '"Bingo" means that all seven letters in the puzzle are used to start at least one word in the word list.'
                        })
                    ]
                }),
                el.li({
                    content: [
                        el.h4({
                            content: 'Is it possible to reach Genius without using 4-letter words?'
                        }),
                        el.p({
                            content: this.hasGeniusNo4Letters() ? 'Yes, today it is!' : 'No, today it isn’t'
                        })
                    ]
                }),
                el.li({
                    content: [
                        el.h4({
                            content: 'Forums and Hashtags'
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
                                }),
                                el.li({
                                    content: this.twitter()
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        this.panel = new Panel(this.app, this.key)
            .setContent('title', this.title)
            .setContent('subtitle', this.description)
            .setContent('body', features);

    }
}

export default Community;