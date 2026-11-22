/**
 * Icons: one way for all of them, symbols in src/js/assets/icons.svg, used with <use>.
 */
import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import { startApp } from "./support/game.js";

const sprite = fs.readFileSync("src/js/assets/icons.svg", "utf8");
const $$ = (selector) => [...document.querySelectorAll(selector)];
const href = (use) => use.getAttribute("href");

describe("icons", () => {
    beforeAll(async () => {
        await startApp();
    });

    it("puts the sprite into the page exactly once", async () => {
        expect($$("svg.sba-symbols")).toHaveLength(1);
        // more icons later, still one sprite
        const { default: icon } = await import("../src/js/utils/icons.js");
        icon("grid");
        icon("close");
        expect($$("svg.sba-symbols")).toHaveLength(1);
    });

    it("finds a symbol for every icon on the page", () => {
        const uses = $$("use").filter((use) => href(use).startsWith("#sba-icon-"));
        expect(uses.length).toBeGreaterThan(0);
        uses.forEach((use) => {
            expect(document.getElementById(href(use).slice(1)), href(use)).not.toBeNull();
        });
    });

    it("uses the sprite for the grid button, the floating pop-up and the menu", () => {
        const icons = (selector) => $$(`${selector} use`).map(href);
        expect(icons(".sba-tool-btn")).toEqual(["#sba-icon-grid"]);
        expect(icons('[data-ui="grid"] .sb-modal-top')).toEqual(["#sba-icon-move", "#sba-icon-close"]);
        expect(icons('[data-ui="submenu"]')).toEqual(expect.arrayContaining(["#sba-icon-warning", "#sba-icon-kofi"]));
        // icons are decoration, the buttons have labels
        $$("svg:has(> use)").forEach((svg) => expect(svg.getAttribute("aria-hidden")).toBe("true"));
    });

    it("keeps the sprite free of anything CSS can't reach through <use>", () => {
        const doc = new DOMParser().parseFromString(sprite, "image/svg+xml");
        const symbols = [...doc.querySelectorAll("symbol")];
        expect(symbols.map((symbol) => symbol.id).sort()).toEqual(
            ["close", "grid", "kofi", "move", "new", "warning"].map((name) => `sba-icon-${name}`),
        );
        symbols.forEach((symbol) => expect(symbol.getAttribute("viewBox"), symbol.id).toMatch(/^0 0 \d+ \d+$/));
        // classes can't be styled from outside the <use>, colours come from `fill` or the --sba-* variables
        expect(doc.querySelectorAll("[class]:not(svg)")).toHaveLength(0);
    });
});
