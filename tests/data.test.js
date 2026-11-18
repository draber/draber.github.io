import { describe, it, expect, beforeEach } from "vitest";
import data from "../src/js/modules/data.js";
import { loadGame } from "./support/game.js";

/**
 * Minimal stand-in for the app, data only needs events
 */
const fakeApp = () => {
    const target = new EventTarget();
    return {
        on: (type, cb) => target.addEventListener(type, cb),
        trigger: (type, detail) => target.dispatchEvent(new CustomEvent(type, { detail })),
    };
};

describe("data", () => {
    let app;

    beforeEach(() => {
        loadGame();
        app = fakeApp();
        data.init(app, ["tint", "entrains"]);
    });

    it("scores like the NYT: 4 letters 1 point, longer words 1 per letter, pangrams 7 extra", () => {
        expect(data.getTermPoints("tint")).toBe(1);
        expect(data.getTermPoints("stair")).toBe(5);
        expect(data.getTermPoints("entrains")).toBe(15);
        expect(data.getPoints("foundTerms")).toBe(16);
    });

    it("splits the lists", () => {
        expect(data.getList("foundPangrams")).toEqual(["entrains"]);
        expect(data.getCount("remainders")).toBe(10);
        expect(data.getFoundAndTotal("pangrams")).toEqual({ found: 1, total: 3 });
        expect(data.getFoundAndTotal("terms")).toEqual({ found: 2, total: 12 });
    });

    it("adds new words once and refreshes the UI", () => {
        let refreshed = 0;
        app.on("sbaRefreshUi", () => refreshed++);
        app.trigger("sbaNewWord", "stair");
        app.trigger("sbaNewWord", "stair");
        expect(data.getCount("foundTerms")).toBe(3);
        expect(refreshed).toBe(1);
    });

    it("doesn't change the NYT's game data", () => {
        data.getList("answers").sort();
        data.getList("foundTerms").push("x");
        expect(window.gameData.today.answers[0]).toBe("artesian");
        expect(window.gameData.today.answers.at(-1)).toBe("tiara");
    });
});
