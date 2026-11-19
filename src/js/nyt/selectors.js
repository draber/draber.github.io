/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * Every CSS selector and class name SBA uses to read or reach into the NYT page lives in this file.
 * When the NYT changes their markup, this is the first (and ideally the only) place to look.
 *
 * Rules
 * - Prefer ids and `pz-*`/`sb-*` classes; they have proven to be stable over the years.
 * - Never use hashed CSS module classes such as `_moment_mlx7l_10`, they change with every NYT build.
 * - `required` entries are checked on start, see `nyt.selfCheck()`.
 *
 * Static markup (hard coded by the NYT, as of Nov 2026):
 * #js-hook-game-wrapper
 *   #portal-toast-system, #portal-game-moments, #portal-toolbar-tooltip, #portal-sb-tooltip, #portal-modal-system
 *   .pz-game-screen#js-hook-pz-moment__game
 *     #portal-game-toolbar, #portal-game-modals
 *     #pz-game-root (React root, everything below is rendered on demand)
 */
const selectors = {
    // page and environment
    gameWrapper: "#js-hook-game-wrapper",
    gameRoot: "#pz-game-root",
    titleBar: ".pz-game-title-bar",
    gameHeader: ".pz-game-header",
    // The toolbar with Stats, Yesterday and More. The NYT renders it twice, in the game and in the navigation,
    // and shows one of them depending on the viewport width. Desktop first, mobile second.
    toolbars: ["#portal-game-toolbar .pz-toolbar-right", "#js-mobile-toolbar .pz-toolbar-right"],
    // static containers of the toolbars, they survive when React re-renders the toolbars
    toolbarHosts: ["#portal-game-toolbar", "#js-global-nav"],

    // game area, all inside #pz-game-root
    contentBox: ".sb-content-box",
    controlsBox: ".sb-controls-box",
    controls: ".sb-controls",
    hiveCell: ".sb-hive .hive-cell",
    hiveInput: ".sb-hive-input-content",
    resultList: ".sb-wordlist-items-pag",
    wordlistHeading: ".sb-wordlist-heading",

    // terms in the result list and in modals
    term: ".sb-anagram",
    pangram: ".pangram",

    // NYT modals, rendered on demand below #pz-game-root
    modalWrapper: ".sb-modal-wrapper",
    // `yesterdayNew` since Nov 2026
    yesterdayFrame: ".sb-modal-frame:is(.yesterday, .yesterdayNew)",
    modalClosers: [
        ".pz-moment__frame.on-stage .pz-moment__close",
        ".pz-moment__frame.on-stage .pz-moment__close_text",
        ".sb-modal-close",
    ],

    // toolbar buttons that open NYT modals
    toolbarButtons: {
        yesterday: ".pz-toolbar-button__yesterday",
        stats: ".pz-toolbar-button__stats",
    },
};

/**
 * Class names the NYT sets on elements SBA watches
 */
export const classNames = {
    desktop: "pz-desktop",
    mobile: "pz-mobile",
    hiveInput: "sb-hive-input-content",
    hiveInputNonEmpty: "non-empty",
    modalWrapper: "sb-modal-wrapper",
    hiveActionPrefix: "hive-action__",
};

/**
 * Elements that must be present for SBA to work, checked by `nyt.selfCheck()`.
 * The key is the name in `selectors`, the value describes what breaks without it.
 */
export const required = {
    gameWrapper: "the whole assistant",
    contentBox: "the assistant panel",
    controlsBox: "the hive, shortcuts",
    controls: "Spill the Beans",
    hiveCell: "Dark Mode preview, typing words",
    resultList: "word and point counts",
    wordlistHeading: "the progress bar",
};

export default selectors;
