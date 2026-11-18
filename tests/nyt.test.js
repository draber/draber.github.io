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
        expect(nyt.getToolbar()).toBe(document.querySelector(".pz-toolbar-right"));
    });

    it("uses the mobile toolbar on mobile", () => {
        loadGame({ env: "mobile" });
        expect(nyt.getToolbar()).toBe(document.querySelector("#js-mobile-toolbar"));
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

    it("measures how far a toolbar element sits below the regular buttons", () => {
        // jsdom has no layout: the text of "More" sits 2px lower than the text of "Stats"
        const bottoms = { Stats: 20, More: 21.54 };
        const getClientRects = Element.prototype.getClientRects;
        Element.prototype.getClientRects = () => [{}];
        // all in one row
        const getBoundingClientRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = () => ({ top: 0, bottom: 30 });
        const createRange = document.createRange;
        document.createRange = () => {
            let node;
            return {
                selectNodeContents: (n) => (node = n),
                getBoundingClientRect: () => ({ bottom: bottoms[node.textContent.trim()] ?? 0 }),
            };
        };
        expect(nyt.getToolbarOffset(nyt.getDropdownButton())).toBe(1.5);
        expect(nyt.getToolbarOffset(null)).toBe(0);
        // not a misalignment, a different row
        bottoms.More = 152;
        expect(nyt.getToolbarOffset(nyt.getDropdownButton())).toBe(0);
        document.createRange = createRange;
        Element.prototype.getClientRects = getClientRects;
        Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("ignores toolbar parts that aren't rendered", () => {
        // jsdom renders nothing, so nothing is measured
        expect(nyt.getDropdownButton()).toBeNull();
        expect(nyt.getToolbarOffset(document.querySelector(".pz-toolbar-button__stats"))).toBe(0);
    });

    it("clicks toolbar buttons", () => {
        let clicked = 0;
        document.querySelector(".pz-toolbar-button__yesterday").addEventListener("click", () => clicked++);
        expect(nyt.clickToolbarButton("yesterday")).toBe(true);
        expect(clicked).toBe(1);
    });
});
