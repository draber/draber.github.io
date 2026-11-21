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
    // The toolbar with Stats, Yesterday and More. Depending on the viewport width the NYT renders it in the game
    // (desktop, deep inside #pz-game-root) or in the navigation (mobile, #js-mobile-toolbar). Not tied to a path on purpose.
    toolbar: ".pz-toolbar-right",
    // where the mobile toolbar lives
    globalNav: "#js-global-nav",
    // static containers of the toolbars, they survive when React re-renders the toolbars
    toolbarHosts: ["#js-hook-game-wrapper", "#js-global-nav"],

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
    // full-screen "moments" in front of the game: welcome, congratulations (Genius, Queen Bee) …
    // The game itself isn't rendered while one is shown. Moments that are done stay in the DOM, hidden.
    // also the loading spinner, shown between "Continue" and the game
    moment: ".pz-moment, .pz-loader-container",
    // only visible ones count, see nyt.findModalCloser()
    // Two families as of Nov 2026: moments (Genius) and modals (Stats, Yesterday's Answers, How to play).
    // `data-testid` attributes are for the NYT's own tests and tend to outlive class names.
    modalClosers: [
        // "Keep playing ×" on moments like the Genius screen
        ".pz-moment__close_text",
        // × on modals like Stats, Yesterday's Answers, How to play
        ".sb-modal-close, [data-testid='sb-modal-close']",
        // net for anything else that closes with the NYT's close icon
        "button:has(> .pz-icon-close)",
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
