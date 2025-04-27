/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {prefix} from "../utils/string.js";
import fn from 'fancy-node';
import {isEmptyObject} from "../utils/utils.js";

/**
 * Reference to the main SBA App instance
 * @type {App}
 */
let app;

/**
 * Reference to the hive container element
 * @type {HTMLElement}
 */
let container;

/**
 * Map of hive cells by letter (A–Z)
 * @type {Object.<string, HTMLElement>}
 */
const cells = {};

/**
 * Cached hive action buttons (submit, delete, shuffle)
 * @type {Object.<string, HTMLElement>}
 */
const actionButtons = {};

/**
 * Dispatches a touch event on one of the hive action buttons ("delete", "submit", etc.).
 * Applies the SBA no-feedback class during the event to suppress default NYT feedback.
 *
 * @param {string} action - The hive action (e.g. "delete", "submit", "shuffle")
 * @returns {Promise<void>}
 */
const hitActionButton = (action) => {
    return new Promise((resolve) => {
        if (!actionButtons[action]) {
            return resolve();
        }

        const evtOpts = {bubbles: true, cancelable: true};
        const feedbackClass = prefix("no-feedback", "d");

        actionButtons[action].classList.add(feedbackClass);
        actionButtons[action].dispatchEvent(new Event("touchstart", evtOpts));

        setTimeout(() => {
            actionButtons[action].dispatchEvent(new Event("touchend", evtOpts));
            actionButtons[action].classList.remove(feedbackClass);
            resolve();
        }, 50);
    });
};

/**
 * Simulates pressing the delete button once.
 * @returns {Promise<void>}
 */
const deleteLetter = () => hitActionButton("delete");

/**
 * Simulates pressing the submit button.
 * @returns {Promise<void>}
 */
const submitWord = () => hitActionButton("submit");

/**
 * Simulates pressing a letter on the hive.
 *
 * @param {string} letter - A single lowercase character
 * @returns {Promise<void>}
 */
const typeLetter = (letter) => {
    return new Promise((resolve) => {
        const el = getCellByLetter(letter);
        if (!el) {
            return resolve();
        }

        const evtOpts = {bubbles: true, cancelable: true};
        el.dispatchEvent(new Event("touchstart", evtOpts));

        setTimeout(() => {
            el.dispatchEvent(new Event("touchend", evtOpts));
            resolve();
        }, 50);
    });
};

/**
 * Simulates typing a full word into the hive and submitting it.
 *
 * @param {string} word - The word to type
 * @returns {Promise<void>}
 */
const typeWord = (word) => {
    const letters = [...word.toLowerCase()];
    let chain = Promise.resolve();
    letters.forEach((letter) => {
        chain = chain.then(() => typeLetter(letter));
    });
    return chain.then(() => submitWord());
};

/**
 * Deletes the entire current input by simulating repeated delete presses.
 *
 * @returns {Promise<void>}
 */
const deleteWord = () => {
    const input = fn.$('.sb-hive-input-content.non-empty', container);
    if (!input) {
        return Promise.resolve();
    }

    const count = input.children.length;
    let chain = Promise.resolve();
    for (let i = 0; i < count; i++) {
        chain = chain.then(() => deleteLetter());
    }
    return chain;
};

/**
 * Returns a map of all hive cells by their letter.
 *
 * @returns {Object.<string, HTMLElement>}
 */
const getCells = () => {
    if (isEmptyObject(cells)) {
        fn.$$(".sb-hive .hive-cell", container).forEach((cell) => {
            cells[cell.textContent.trim()] = cell;
        });
    }
    return cells;
};

/**
 * Returns a hive cell element by its letter.
 *
 * @param {string} letter - The letter (A–Z) to find
 * @returns {HTMLElement|null}
 */
const getCellByLetter = (letter) => {
    return cells[letter] || null;
};

/**
 * Initializes the hive input controller.
 *
 * @param {App} _app - The SBA App instance
 * @param {HTMLElement} _container - The container element for the hive
 */
const init = (_app, _container) => {
    app = _app;
    container = _container;
    ['submit', 'delete', 'shuffle'].forEach(action => {
        actionButtons[action] = fn.$(`.hive-action__${action}`, container);
    });
};

export default {
    init,
    getCells,
    getCellByLetter,
    deleteWord,
    deleteLetter,
    typeWord,
    typeLetter
};
