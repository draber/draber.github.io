import { describe, it, expect, beforeEach } from "vitest";
import nyt from "../src/js/nyt/nyt.js";
import { loadGame } from "./support/game.js";

describe("NYT adapter", () => {
    beforeEach(() => loadGame());

    it("finds every required element in the fixture", () => {
        const { ok, problems } = nyt.selfCheck();
        expect(problems).toEqual([]);
        expect(ok).toBe(true);
    });

    it("reports missing elements with selector and impact", () => {
        document.querySelector(".sb-wordlist-heading").remove();
        const { ok, problems } = nyt.selfCheck();
        expect(ok).toBe(false);
        expect(problems).toEqual([{ name: "wordlistHeading", selector: ".sb-wordlist-heading", impact: "the progress bar" }]);
    });

    it("reports missing game data", () => {
        delete window.gameData;
        expect(() => nyt.getGameData()).toThrow();
        expect(nyt.selfCheck().problems.map((p) => p.name)).toContain("gameData");
    });

    it("never uses hashed CSS module classes", () => {
        const all = JSON.stringify(nyt.selectors);
        expect(all).not.toMatch(/\._[a-z]+_[a-z0-9]{5}_\d+/i);
    });

    it("reads terms from list items with one or two child nodes", async () => {
        const list = await nyt.waitForResultList();
        expect(nyt.getFoundTerms(list)).toEqual(["tint", "entrains"]);
    });

    it("detects the environment", () => {
        expect(nyt.isEnv("desktop")).toBe(true);
        expect(nyt.isEnv("mobile")).toBe(false);
        expect(nyt.getToolbar()).toBe(document.querySelector("#pz-game-root .pz-toolbar-right"));
    });

    it("uses the mobile toolbar on mobile", () => {
        loadGame({ env: "mobile" });
        expect(nyt.getToolbar()).toBe(document.querySelector("#js-mobile-toolbar .pz-toolbar-right"));
    });

    it("maps hive cells by letter and finds the action buttons", () => {
        expect(Object.keys(nyt.getHiveCells())).toEqual(["a", "t", "i", "n", "e", "r", "s"]);
        expect(nyt.getHiveActionButton("delete").classList.contains("hive-action__delete")).toBe(true);
    });

    it("returns the hive input only when something has been typed", () => {
        expect(nyt.getHiveInput()).toBeNull();
        const input = document.querySelector(".sb-hive-input-content");
        input.classList.add("non-empty");
        expect(nyt.getHiveInput()).toBe(input);
        expect(nyt.isHiveInput(input)).toBe(true);
    });

    it("finds Yesterday's Answers inside a subtree rendered on demand", () => {
        const system = document.createElement("div");
        system.className = "sb-modal-system";
        system.innerHTML = '<div class="sb-modal-scrim"><div class="sb-modal-wrapper"><div class="sb-modal-frame yesterday"></div></div></div>';
        expect(nyt.findYesterdayModal([document.createTextNode("x"), system])).toBe(system.querySelector(".yesterday"));
        expect(nyt.findYesterdayModal([document.createElement("div")])).toBeNull();
    });

    it("recognizes the Yesterday's Answers modal by its old and its new class", () => {
        ["yesterday", "yesterdayNew"].forEach((name) => {
            const frame = document.createElement("div");
            frame.className = `sb-modal-frame ${name}`;
            expect(nyt.findYesterdayModal([frame])).toBe(frame);
        });
    });

    it("reads terms from Yesterday's Answers items with check mark and screen reader text", () => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="check checked"></span><span class="sb-anagram" aria-hidden="true">hippo</span><span class="visually-hidden">hippo</span>';
        expect(nyt.getTermFromListItem(li)).toBe("hippo");
    });

    it("closes an open NYT modal", () => {
        expect(nyt.closeModal()).toBe(false);
        const system = document.createElement("div");
        system.innerHTML = '<div class="sb-modal-frame"><div class="sb-modal-close">×</div></div>';
        let clicked = 0;
        system.querySelector(".sb-modal-close").addEventListener("click", () => clicked++);
        document.querySelector(".sb-game-moment").append(system);
        expect(nyt.closeModal()).toBe(true);
        expect(clicked).toBe(1);
    });

    it("closes the Genius screen with 'Keep playing', but never a moment that is done", () => {
        const root = document.querySelector("#pz-game-root");
        // a moment that is done: still in the DOM, hidden
        const done = document.createElement("div");
        done.className = "pz-moment pz-moment__welcome";
        done.innerHTML = '<button type="button" class="pz-moment__close_text">Close</button>';
        done.querySelector("button").checkVisibility = () => false;
        let clickedDone = 0;
        done.querySelector("button").addEventListener("click", () => clickedDone++);
        root.append(done);
        expect(nyt.closeModal()).toBe(false);

        const genius = document.createElement("div");
        genius.className = "pz-moment pz-moment__congrats";
        genius.innerHTML =
            '<div class="pz-moment__container"><button type="button" class="pz-moment__close_text"><span class="inner-text">Keep playing</span></button></div>';
        let clicked = 0;
        genius.querySelector("button").addEventListener("click", () => clicked++);
        root.append(genius);

        expect(nyt.isMomentShowing()).toBe(true);
        expect(nyt.closeModal()).toBe(true);
        expect(clicked).toBe(1);
        expect(clickedDone).toBe(0);
    });

    it("finds modal closers by test id and by the close icon, if the class names change", () => {
        const root = document.querySelector("#pz-game-root");
        const byTestId = document.createElement("div");
        byTestId.innerHTML = '<button type="button" data-testid="sb-modal-close" aria-label="Close modal">×</button>';
        root.append(byTestId);
        expect(nyt.findModalCloser()).toBe(byTestId.querySelector("button"));
        byTestId.remove();

        const byIcon = document.createElement("div");
        byIcon.innerHTML = '<button type="button"><span>Close</span><i class="pz-icon pz-icon-close"></i></button>';
        root.append(byIcon);
        expect(nyt.findModalCloser()).toBe(byIcon.querySelector("button"));
    });

    it("counts the loading spinner as a screen in front of the game", () => {
        expect(nyt.isMomentShowing()).toBe(false);
        const loader = document.createElement("div");
        loader.className = "pz-loader-container";
        document.querySelector("#pz-game-root").append(loader);
        expect(nyt.isMomentShowing()).toBe(true);
        loader.checkVisibility = () => false;
        expect(nyt.isMomentShowing()).toBe(false);
    });

    it("clicks toolbar buttons", () => {
        let clicked = 0;
        document.querySelector("#pz-game-root .pz-toolbar-button__yesterday").addEventListener("click", () => clicked++);
        expect(nyt.clickToolbarButton("yesterday")).toBe(true);
        expect(clicked).toBe(1);
    });
});
