/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import selectors, { classNames, required } from "./selectors.js";

/**
 * Adapter between SBA and the NYT page.
 * All reading from and reaching into the NYT DOM goes through this module, nothing else in SBA
 * should know a NYT selector. Selectors themselves live in `selectors.js`.
 */

/**
 * Cached game wrapper, it is part of the static markup and never replaced
 * @type {HTMLElement|null}
 */
let gameWrapper = null;

/**
 * The outermost game element, static markup
 * @returns {HTMLElement|null}
 */
const getGameWrapper = () => {
    if (!gameWrapper || !gameWrapper.isConnected) {
        gameWrapper = fn.$(selectors.gameWrapper);
    }
    return gameWrapper;
};

/**
 * Find an element by selector name, by default inside the game wrapper
 * @param {String} name key in `selectors`
 * @param {HTMLElement|Document|null} container
 * @returns {HTMLElement|null}
 */
const find = (name, container = getGameWrapper()) => {
    return container ? fn.$(selectors[name], container) : null;
};

/**
 * Find all elements by selector name, by default inside the game wrapper
 * @param {String} name key in `selectors`
 * @param {HTMLElement|Document|null} container
 * @returns {HTMLElement[]}
 */
const findAll = (name, container = getGameWrapper()) => {
    return container ? fn.$$(selectors[name], container) : [];
};

/**
 * Today's game data as provided by the NYT in `window.gameData`
 * @returns {{answers: String[], pangrams: String[], validLetters: String[], centerLetter: String, id: Number, displayDate: String, printDate: String}}
 * @throws {Error} if the data is missing or incomplete
 */
const getGameData = () => {
    const today = window.gameData?.today;
    if (!today || !Array.isArray(today.answers) || !Array.isArray(today.pangrams) || !Array.isArray(today.validLetters)) {
        throw new Error("window.gameData.today is missing or incomplete");
    }
    return today;
};

/**
 * Whether the page runs in the desktop or the mobile layout
 * @param {String} env `desktop` or `mobile`
 * @returns {Boolean}
 */
const isEnv = (env) => document.body.classList.contains(classNames[env]);

/**
 * The toolbar the SBA menu button is attached to, depends on the environment
 * @returns {HTMLElement|null}
 */
const getToolbar = () => (isEnv("mobile") ? fn.$(selectors.mobileToolbar) : fn.$(selectors.desktopToolbar));

/**
 * The global navigation, on mobile it hosts the toolbar
 * @returns {HTMLElement|null}
 */
const getGlobalNav = () => fn.$(selectors.globalNav);

/**
 * Whether the mobile toolbar is visible
 * @param {HTMLElement} nav
 * @returns {Boolean}
 */
const isMobileToolbarVisible = (nav) => nav.classList.contains(classNames.mobileToolbarVisible);

/**
 * Wait for the result list, it is rendered once the NYT has loaded the user's progress.
 * Everything else in the game can be assumed to be ready by then.
 * @returns {Promise<HTMLElement>}
 */
const waitForResultList = () => fn.waitFor(selectors.resultList, getGameWrapper());

/**
 * Read the term from an item of the result list.
 * Since 2026-06-02 an item can contain two child nodes, both of them containing the term.
 * @param {HTMLElement} item
 * @returns {String}
 */
const getTermFromListItem = (item) => {
    const elem = item.childElementCount > 1 ? item.firstElementChild : item;
    return elem.textContent.trim();
};

/**
 * All terms found so far
 * @param {HTMLElement} resultList
 * @returns {String[]}
 */
const getFoundTerms = (resultList) => fn.$$("li", resultList).map(getTermFromListItem);

/**
 * Whether an item of a word list (result list, Yesterday's Answers) is marked as pangram by the NYT
 * @param {HTMLElement} item
 * @returns {Boolean}
 */
const isMarkedAsPangram = (item) => !!fn.$(selectors.pangram, item);

/**
 * Whether an element is a term that can be linked, e.g. to Google
 * @param {EventTarget} elem
 * @returns {Boolean}
 */
const isTerm = (elem) => elem instanceof Element && elem.matches(selectors.term);

/**
 * Whether a node is the hive input, i.e. the letters typed so far
 * @param {Node} node
 * @returns {Boolean}
 */
const isHiveInput = (node) => node instanceof Element && node.classList.contains(classNames.hiveInput);

/**
 * Look for the Yesterday's Answers modal among nodes added to the DOM.
 * The NYT renders its modals on demand, so the modal can be part of a larger subtree.
 * @param {NodeList|Node[]} nodes
 * @returns {HTMLElement|null} the modal frame
 */
const findYesterdayModal = (nodes) => {
    for (const node of nodes) {
        if (!(node instanceof Element)) {
            continue;
        }
        const frame = node.matches(selectors.yesterdayFrame) ? node : fn.$(selectors.yesterdayFrame, node);
        if (frame) {
            return frame;
        }
    }
    return null;
};

/**
 * Close button of an open NYT modal or "moment" (e.g. the Genius message)
 * @returns {HTMLElement|null}
 */
const findModalCloser = () => {
    for (const selector of selectors.modalClosers) {
        const closer = fn.$(selector, getGameWrapper());
        if (closer) {
            return closer;
        }
    }
    return null;
};

/**
 * Close an open NYT modal
 * @returns {Boolean} true if there was a modal to close
 */
const closeModal = () => {
    const closer = findModalCloser();
    if (closer) {
        closer.click();
    }
    return !!closer;
};

/**
 * Click a button in the NYT toolbar, e.g. to open Yesterday's Answers
 * @param {String} name key in `selectors.toolbarButtons`
 * @returns {Boolean} true if the button was found
 */
const clickToolbarButton = (name) => {
    const button = fn.$(selectors.toolbarButtons[name]);
    if (button) {
        button.click();
    }
    return !!button;
};

/**
 * Hive cells, keyed by their letter
 * @returns {Object.<String, HTMLElement>}
 */
const getHiveCells = () => {
    const cells = {};
    findAll("hiveCell").forEach((cell) => {
        cells[cell.textContent.trim()] = cell;
    });
    return cells;
};

/**
 * One of the buttons below the hive
 * @param {String} action `submit`, `delete` or `shuffle`
 * @returns {HTMLElement|null}
 */
const getHiveActionButton = (action) => fn.$(`.${classNames.hiveActionPrefix}${action}`, find("controlsBox"));

/**
 * The letters typed so far, null if nothing has been typed
 * @returns {HTMLElement|null}
 */
const getHiveInput = () => {
    const input = find("hiveInput");
    return input && input.classList.contains(classNames.hiveInputNonEmpty) ? input : null;
};

/**
 * Check whether everything SBA depends on is in place.
 * Call after `waitForResultList()` has resolved, the game is fully rendered by then.
 * @returns {{ok: Boolean, problems: Array<{name: String, selector: String, impact: String}>}}
 */
const selfCheck = () => {
    const problems = [];
    try {
        getGameData();
    } catch (e) {
        problems.push({ name: "gameData", selector: "window.gameData.today", impact: "everything" });
    }
    for (const [name, impact] of Object.entries(required)) {
        const found = name === "gameWrapper" ? getGameWrapper() : find(name);
        if (!found) {
            problems.push({ name, selector: selectors[name], impact });
        }
    }
    return {
        ok: problems.length === 0,
        problems,
    };
};

export default {
    selectors,
    getGameWrapper,
    find,
    findAll,
    getGameData,
    isEnv,
    getToolbar,
    getGlobalNav,
    isMobileToolbarVisible,
    waitForResultList,
    getTermFromListItem,
    getFoundTerms,
    isMarkedAsPangram,
    isTerm,
    isHiveInput,
    findYesterdayModal,
    findModalCloser,
    closeModal,
    clickToolbarButton,
    getHiveCells,
    getHiveActionButton,
    getHiveInput,
    selfCheck,
};
