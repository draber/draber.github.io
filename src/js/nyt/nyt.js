/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import timing from "../utils/timing.js";
import selectors, { classNames, required } from "./selectors.js";

/**
 * Adapter between SBA and the NYT page.
 * All reading from and reaching into the NYT DOM goes through this module, nothing else in SBA
 * should know a NYT selector. Selectors themselves live in `selectors.js`.
 */

/**
 * Simulate a broken NYT page, to see how SBA behaves when the NYT changes its markup.
 * Selector names (keys of `selectors.js`, plus `gameData`) listed in localStorage are treated as not found:
 *     localStorage.setItem("sba-simulate-missing", "contentBox, resultList")
 * then reload the page. Remove the entry to go back to normal. Does nothing without the entry.
 * @type {Set<String>}
 */
const simulatedMissing = (() => {
    try {
        const names = (localStorage.getItem("sba-simulate-missing") || "").split(",").map((name) => name.trim()).filter(Boolean);
        if (names.length) {
            console.warn(`Spelling Bee Assistant: simulating a broken NYT page, not found: ${names.join(", ")}`);
        }
        return new Set(names);
    } catch (e) {
        return new Set();
    }
})();

/**
 * A selector that matches nothing
 * @type {String}
 */
const matchesNothing = "#sba-simulated-missing";

/**
 * `selectors`, with the simulated missing ones replaced by selectors that match nothing.
 * Use this everywhere in this module instead of `selectors`.
 * @type {Object}
 */
const sel = new Proxy(selectors, {
    get(target, name) {
        const value = target[name];
        if (!simulatedMissing.has(name)) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(() => matchesNothing);
        }
        if (value && typeof value === "object") {
            return Object.fromEntries(Object.keys(value).map((key) => [key, matchesNothing]));
        }
        return matchesNothing;
    },
});

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
        gameWrapper = fn.$(sel.gameWrapper);
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
    return container ? fn.$(sel[name], container) : null;
};

/**
 * Find all elements by selector name, by default inside the game wrapper
 * @param {String} name key in `selectors`
 * @param {HTMLElement|Document|null} container
 * @returns {HTMLElement[]}
 */
const findAll = (name, container = getGameWrapper()) => {
    return container ? fn.$$(sel[name], container) : [];
};

/**
 * Today's game data as provided by the NYT in `window.gameData`
 * @returns {{answers: String[], pangrams: String[], validLetters: String[], centerLetter: String, id: Number, displayDate: String, printDate: String}}
 * @throws {Error} if the data is missing or incomplete
 */
const getGameData = () => {
    const today = simulatedMissing.has("gameData") ? undefined : window.gameData?.today;
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
 * Whether an element is rendered
 * @param {Element|null} elem
 * @returns {Boolean}
 */
const isRendered = (elem) => !!elem && elem.getClientRects().length > 0;

/**
 * The toolbar with Stats, Yesterday and More, the SBA menu button joins it.
 * Depending on the viewport width the NYT renders it in the game or in the navigation; this is the one on screen.
 * Without layout information (e.g. before the first paint) its location and the environment decide.
 * @returns {HTMLElement|null}
 */
const getToolbar = () => {
    const toolbars = fn.$$(sel.toolbar);
    const rendered = toolbars.find(isRendered);
    if (rendered) {
        return rendered;
    }
    const inNav = (toolbar) => !!toolbar.closest(sel.globalNav);
    const preferred = toolbars.find((toolbar) => inNav(toolbar) === isEnv("mobile"));
    return preferred || toolbars[0] || null;
};

/**
 * Static containers of the toolbars. Watch these to notice when React re-renders a toolbar.
 * @returns {HTMLElement[]}
 */
const getToolbarHosts = () => sel.toolbarHosts.map((selector) => fn.$(selector)).filter(Boolean);

/**
 * Whether an element is actually shown. Moments that are done stay in the DOM, hidden by a hashed class.
 * Browsers without `checkVisibility()` (Chrome < 105) count everything as visible.
 * @param {HTMLElement} elem
 * @returns {Boolean}
 */
const isVisible = (elem) => {
    if (!elem?.isConnected) {
        return false;
    }
    if (typeof elem.checkVisibility !== "function") {
        return true;
    }
    return elem.checkVisibility({ opacityProperty: true, visibilityProperty: true });
};

/**
 * Whether a full-screen moment (welcome, Genius …) is shown, the game isn't rendered then
 * @returns {Boolean}
 */
const isMomentShowing = () => findAll("moment").some(isVisible);

/**
 * Resolves on the first click, tap or key press on the page.
 * The game is only rendered once the player has left the welcome screen ("Continue", "Play"),
 * so there's no point in counting the time before that.
 * @returns {Promise<void>}
 */
const firstInteraction = () =>
    new Promise((resolve) => {
        const events = ["pointerdown", "keydown"];
        const done = () => {
            events.forEach((type) => document.removeEventListener(type, done, true));
            timing.mark("click");
            resolve();
        };
        events.forEach((type) => document.addEventListener(type, done, true));
    });

/**
 * Wait for an element to show up anywhere on the page.
 * The clock starts with the player's first interaction, see firstInteraction(),
 * and starts over as long as a moment (welcome, Genius …) is shown: the game simply isn't there yet.
 * @param {Function} lookup returns the element or null
 * @param {String} description for the error message
 * @param {Number} timeout milliseconds after the first interaction
 * @returns {Promise<HTMLElement>} rejects with an Error naming what's missing
 */
const waitForElement = (lookup, description, timeout) => {
    return new Promise((resolve, reject) => {
        const found = lookup();
        if (found) {
            resolve(found);
            return;
        }
        let timer = null;
        let settled = false;
        const observer = new MutationObserver(() => {
            const elem = lookup();
            if (elem) {
                settled = true;
                observer.disconnect();
                clearTimeout(timer);
                resolve(elem);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        firstInteraction().then(() => {
            if (settled) {
                return;
            }
            const expire = () => {
                // still on a moment (welcome, Genius …): the game isn't there yet, nothing is broken
                if (isMomentShowing()) {
                    timer = setTimeout(expire, timeout);
                    return;
                }
                settled = true;
                observer.disconnect();
                reject(new Error(`${description} not found within ${timeout / 1000}s`));
            };
            timer = setTimeout(expire, timeout);
        });
    });
};

/**
 * Wait for the result list, it is rendered once the player has left the welcome screen
 * and the NYT has loaded the user's progress. Everything in the game can be assumed to be ready by then.
 * Gives up `timeout` after the first interaction, the page has changed then.
 * @param {Number} [timeout=10000] milliseconds
 * @returns {Promise<HTMLElement>} rejects with an Error naming the selector
 */
const waitForResultList = (timeout = 10000) => {
    if (!getGameWrapper()) {
        return Promise.reject(new Error(`${selectors.gameWrapper} not found`));
    }
    return waitForElement(() => find("resultList"), selectors.resultList, timeout).then((resultList) => {
        timing.mark("game");
        return resultList;
    });
};

/**
 * Wait for the toolbar, on mobile it can show up after the game
 * @param {Number} [timeout=10000] milliseconds
 * @returns {Promise<HTMLElement>} rejects with an Error naming the selector
 */
const waitForToolbar = (timeout = 10000) => waitForElement(() => getToolbar(), selectors.toolbar, timeout);

/**
 * Read the term from an item of a word list (result list, Yesterday's Answers).
 * Items can contain more than the term: since 2026-06-02 the term can be there twice,
 * Yesterday's Answers adds a check mark and a text for screen readers ("word (pangram)").
 * @param {HTMLElement} item
 * @returns {String}
 */
const getTermFromListItem = (item) => {
    const elem = fn.$(sel.term, item) || (item.childElementCount > 1 ? item.firstElementChild : item);
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
const isMarkedAsPangram = (item) => !!fn.$(sel.pangram, item);

/**
 * Whether an element is a term that can be linked, e.g. to Google
 * @param {EventTarget} elem
 * @returns {Boolean}
 */
const isTerm = (elem) => elem instanceof Element && elem.matches(sel.term);

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
        const frame = node.matches(sel.yesterdayFrame) ? node : fn.$(sel.yesterdayFrame, node);
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
    const wrapper = getGameWrapper();
    if (!wrapper) {
        return null;
    }
    for (const selector of sel.modalClosers) {
        // moments that are done stay in the DOM, their buttons must not be clicked
        const closer = fn.$$(selector, wrapper).find(isVisible);
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
 * @param {String} name key in `sel.toolbarButtons`
 * @returns {Boolean} true if the button was found
 */
const clickToolbarButton = (name) => {
    // there are two toolbars, use the one on screen
    const button = fn.$(sel.toolbarButtons[name], getToolbar()) || fn.$(sel.toolbarButtons[name]);
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
    getToolbarHosts,
    waitForResultList,
    waitForToolbar,
    getTermFromListItem,
    getFoundTerms,
    isMarkedAsPangram,
    isTerm,
    isHiveInput,
    findYesterdayModal,
    findModalCloser,
    isMomentShowing,
    closeModal,
    clickToolbarButton,
    getHiveCells,
    getHiveActionButton,
    getHiveInput,
    selfCheck,
};
