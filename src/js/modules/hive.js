/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import fn from "fancy-node";
import nyt from "../nyt/nyt.js";

/**
 * Hive cells by letter, filled on first access
 * @type {Object.<String, HTMLElement>|null}
 */
let cells = null;

/**
 * Hive action buttons (submit, delete, shuffle)
 * @type {Object.<String, HTMLElement|null>}
 */
const actionButtons = {};

/**
 * Time between the simulated touchstart and touchend events
 * @type {Number}
 */
const touchDuration = 50;

/**
 * Simulate a touch on an element
 * @param {Element} elem
 * @returns {Promise<void>}
 */
const touch = (elem) => {
    return new Promise((resolve) => {
        const evtOpts = { bubbles: true, cancelable: true };
        elem.dispatchEvent(new Event("touchstart", evtOpts));
        setTimeout(() => {
            elem.dispatchEvent(new Event("touchend", evtOpts));
            resolve();
        }, touchDuration);
    });
};

/**
 * Dispatches a touch event on one of the hive action buttons ("delete", "submit", etc.).
 * Applies the SBA no-feedback class during the event to suppress default NYT feedback.
 *
 * @param {String} action - The hive action (e.g. "delete", "submit", "shuffle")
 * @returns {Promise<void>}
 */
const hitActionButton = (action) => {
    const button = actionButtons[action];
    if (!button) {
        return Promise.resolve();
    }
    const feedbackClass = prefix("no-feedback", "d");
    button.classList.add(feedbackClass);
    return touch(button).then(() => {
        button.classList.remove(feedbackClass);
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
 * Returns a map of all hive cells by their letter.
 *
 * @returns {Object.<String, HTMLElement>}
 */
const getCells = () => {
    if (!cells || !Object.keys(cells).length) {
        cells = nyt.getHiveCells();
    }
    return cells;
};

/**
 * Returns a hive cell element by its letter.
 *
 * @param {String} letter - A single letter
 * @returns {HTMLElement|null}
 */
const getCellByLetter = (letter) => {
    return getCells()[letter.toLowerCase()] || null;
};

/**
 * Simulates pressing a letter on the hive.
 *
 * @param {String} letter - A single character
 * @returns {Promise<void>}
 */
const typeLetter = (letter) => {
    const cell = getCellByLetter(letter);
    const polygon = cell ? fn.$("polygon", cell) : null;
    return polygon ? touch(polygon) : Promise.resolve();
};

/**
 * Simulates typing a full word into the hive and submitting it.
 *
 * @param {String} word - The word to type
 * @param {Boolean} slow - If true, types with delay (e.g. for voice input)
 * @returns {Promise<void>}
 */
const typeWord = (word, slow = false) => {
    const delay = slow ? 250 : 0;
    const wait = () => new Promise((resolve) => setTimeout(resolve, delay));
    let chain = Promise.resolve();

    [...word.toLowerCase()].forEach((letter) => {
        chain = chain.then(() => typeLetter(letter)).then(wait);
    });

    // extra delay before submit
    return chain.then(wait).then(() => submitWord());
};

/**
 * Deletes the entire current input by simulating repeated delete presses.
 *
 * @returns {Promise<void>}
 */
const deleteWord = () => {
    const input = nyt.getHiveInput();
    let chain = Promise.resolve();
    if (!input) {
        return chain;
    }
    for (let i = 0; i < input.children.length; i++) {
        chain = chain.then(() => deleteLetter());
    }
    return chain;
};

/**
 * Initializes the hive input controller.
 */
const init = () => {
    ["submit", "delete", "shuffle"].forEach((action) => {
        actionButtons[action] = nyt.getHiveActionButton(action);
    });
};

export default {
    init,
    getCells,
    getCellByLetter,
    deleteWord,
    deleteLetter,
    typeWord,
    typeLetter,
};
