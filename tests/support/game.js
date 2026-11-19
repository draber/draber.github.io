import fs from "fs";
import path from "path";

const fixture = fs.readFileSync(path.join(import.meta.dirname, "../fixtures/nyt-game.html"), "utf8");

/**
 * Today's game used by all tests
 * Letters: a (center), t, i, n, e, r, s
 * Pangrams use all seven letters: artesian, entrains, trainees
 * Found in the fixture: tint, entrains (rendered with two child nodes, like the NYT does since 2026-06-02)
 */
export const gameData = {
    today: {
        id: 12345,
        displayDate: "November 18, 2026",
        printDate: "2026-11-18",
        centerLetter: "a",
        outerLetters: ["t", "i", "n", "e", "r", "s"],
        validLetters: ["a", "t", "i", "n", "e", "r", "s"],
        pangrams: ["artesian", "entrains", "trainees"],
        answers: ["artesian", "entrains", "trainees", "attain", "tint", "anti", "rant", "stair", "train", "satin", "titan", "tiara"],
    },
};

/**
 * Put the fixture into the document and provide `window.gameData`
 * @param {Object} [options]
 * @param {String} [options.env="desktop"]
 */
export const loadGame = ({ env = "desktop" } = {}) => {
    document.body.className = `pz-page pz-${env}`;
    document.body.innerHTML = fixture;
    window.gameData = structuredClone(gameData);
    localStorage.clear();
};

/**
 * Wait for the app to be ready
 * @returns {Promise<void>}
 */
export const whenReady = () =>
    new Promise((resolve) => {
        document.addEventListener("sbaReady", () => resolve(), { once: true });
    });

/**
 * Load the fixture and start a fresh app
 * @param {Object} [options] see `loadGame()`
 * @returns {Promise<App>}
 */
export const startApp = async (options) => {
    loadGame(options);
    const { default: App } = await import("../../src/js/modules/app.js");
    const ready = whenReady();
    const app = new App(document.querySelector("#js-hook-game-wrapper"));
    await ready;
    return app;
};

/**
 * Let mutation observers and promise callbacks run
 * @param {Number} [ms=0]
 */
export const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pointer click: pointerdown, pointerup and click, as in a browser
 * @param {Element} elem
 */
export const pointerClick = (elem) => {
    const opts = { bubbles: true, cancelable: true, button: 0 };
    elem.dispatchEvent(new MouseEvent("pointerdown", opts));
    elem.dispatchEvent(new MouseEvent("pointerup", opts));
    elem.dispatchEvent(new MouseEvent("click", opts));
};

/**
 * Press a key with modifiers
 * @param {String} code e.g. KeyG
 * @param {Object} [modifiers]
 */
export const press = (code, { shiftKey = false, altKey = false } = {}) => {
    const key = code === "Escape" ? "Escape" : code.replace(/^Key|^Digit/, "");
    const opts = { bubbles: true, cancelable: true, code, key, shiftKey, altKey };
    document.dispatchEvent(new KeyboardEvent("keydown", opts));
    document.dispatchEvent(new KeyboardEvent("keyup", opts));
};
