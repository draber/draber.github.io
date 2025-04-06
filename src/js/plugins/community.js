/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../modules/string.js";
import Plugin from "../modules/plugin.js";
import data from "../modules/data.js";
import Popup from "./popup.js";
import fn from "fancy-node";

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
        const maxPoints = data.getPoints("answers");
        const no4LetterPoints = maxPoints - data.getList("answers").filter((term) => term.length === 4).length;
        return no4LetterPoints >= Math.round((70 / 100) * maxPoints);
    }

    /**
     * How many pangrams are there, if any
     * @returns {Number}
     */
    getPerfectPangramCount() {
        return data.getList("pangrams").filter((term) => term.length === 7).length;
    }

    /**
     * Will each letter serve as a starting letter at least once?
     * @returns {Boolean}
     */
    hasBingo() {
        return Array.from(new Set(data.getList("answers").map((term) => term.charAt(0)))).length === 7;
    }

    /**
     * Link to the daily forum at NYT
     * @returns {HTMLElement}
     */
    nytCommunity() {
        const date = data.getDate().print;
        const href = `https://www.nytimes.com/${date.replace(
            /-/g,
            "/"
        )}/crosswords/spelling-bee-forum.html#commentsContainer`;
        return fn.a({
            content: "NYT Spelling Bee Forum for today’s game",
            attributes: {
                href,
                target: prefix(),
            },
        });
    }

    /**
     * Links to popular Bluesky hashtags
     * @returns {Node}
     */
    bluesky() {
        const hashtags = ["hivemind", "nytspellingbee", "nytbee", "nytsb"].map((tag) =>
            fn.a({
                content: `#${tag}`,
                attributes: {
                    href: `https://bsky.app/hashtag/${tag}`,
                    target: prefix(),
                },
            })
        );
        return fn.toNode(["Bluesky hashtags: ", ...hashtags.flatMap((tag, i, arr) =>
            i < arr.length - 1 ? [tag, ", "] : [tag]
        )]);
    }

    /**
     * Link to NYT's SB forum portal
     * @returns {HTMLElement}
     */
    nytSpotlight() {
        const href = `https://www.nytimes.com/spotlight/spelling-bee-forum`;
        return fn.a({
            content: "NYT Spelling Bee Forums",
            attributes: {
                href,
                target: prefix(),
            },
        });
    }

    /**
     * Toggle pop-up
     * @param {Event} evt
     * @returns {Community}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.toggle(true);
        return this;
    }

    /**
     * Community constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Community", "A collection of resources and trivia suggested by the community.", {
            canChangeState: true,
        });

        this.shortcuts = [
            {
                combo: "Shift+Alt+C",
                method: "togglePopup",
            },
        ];

        this.menuAction = "popup";
        this.menuIcon = "null";

        const features = fn.ul({
            content: [
                fn.li({
                    content: [
                        fn.h4({
                            content: "Is there a perfect pangram today?",
                        }),
                        fn.p({
                            content: (() => {
                                const pp = this.getPerfectPangramCount();
                                switch (pp) {
                                    case 0:
                                        return `No, not today.`;
                                    case 1:
                                        return `Yes - there's one perfect pangram today.`;
                                    default:
                                        // there have never been more then three pangrams, so this should be good enough
                                        return `Yes - there are ${pp} perfect pangrams today.`;
                                }
                            })(),
                        }),
                        fn.em({
                            content: "A “perfect” pangram uses all seven letters exactly once.",
                        }),
                    ],
                }),
                fn.li({
                    content: [
                        fn.h4({
                            content: 'Is today a Bingo day?',
                        }),
                        fn.p({
                            content: this.hasBingo() ? "Yes - today is a Bingo day!" : "No - not today.",
                        }),
                        fn.em({
                            content:
                                '"Bingo" means each puzzle letter starts at least one word in the list.',
                        }),
                    ],
                }),
                fn.li({
                    content: [
                        fn.h4({
                            content: "Can you reach Genius without using any 4-letter words?",
                        }),
                        fn.p({
                            content: this.hasGeniusNo4Letters() ? "Yes - today you can!" : "No - not today.",
                        }),
                    ],
                }),
                fn.li({
                    content: [
                        fn.h4({
                            content: "Forums and Hashtags",
                        }),
                        fn.ul({
                            content: [
                                fn.li({
                                    content: this.nytCommunity(),
                                }),
                                fn.li({
                                    content: this.nytSpotlight(),
                                }),
                                fn.li({
                                    content: this.bluesky(),
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });

        this.popup = new Popup(this.app, this.key)
            .setContent("title", this.title)
            .setContent("subtitle", this.description)
            .setContent("body", features);
    }
}

export default Community;
