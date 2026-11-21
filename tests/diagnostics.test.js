/**
 * Diagnostics: harmless facts for bug reports, never words of the game
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadGame } from "./support/game.js";

const load = async () => {
    vi.resetModules();
    return {
        diagnostics: (await import("../src/js/modules/diagnostics.js")).default,
        timing: (await import("../src/js/utils/timing.js")).default,
    };
};

describe("diagnostics", () => {
    beforeEach(() => {
        loadGame();
        delete document.body.dataset.sbaOutage;
    });

    it("reports version, self check, toolbar and counts", async () => {
        const { diagnostics, timing } = await load();
        timing.mark("game");
        timing.mark("ready");
        const report = diagnostics.report();
        expect(report).toMatch(/^Spelling Bee Assistant \d+\.\d+\.\d+ \(\w+\)/);
        expect(report).toContain("Self check: all found ✓");
        expect(report).toMatch(/Toolbar: in the (game|navigation)/);
        expect(report).toMatch(/Game: \d{4}-\d{2}-\d{2} · found \d+ of \d+/);
        expect(report).toMatch(/assistant: code [\d.]+s · first click – · game [\d.]+s · ready [\d.]+s/);
        expect(report).toContain("Outage: –");
    });

    it("never contains words of the game", async () => {
        const { diagnostics } = await load();
        const report = diagnostics.report().toLowerCase();
        const words = window.gameData.today.answers;
        // whole words only, short answers like "deck" could be part of other text
        const leaked = words.filter((word) => new RegExp(`\\b${word}\\b`).test(report.replace(/user agent:.*$/m, "")));
        expect(leaked).toEqual([]);
    });

    it("lists what's missing and the outage", async () => {
        document.querySelector(".sb-controls").remove();
        document.body.dataset.sbaOutage = JSON.stringify([".sb-controls not found"]);
        const { diagnostics } = await load();
        const report = diagnostics.report();
        expect(report).toMatch(/Self check: \d+ missing ✗/);
        expect(report).toContain("✗ controls: .sb-controls");
        expect(report).toContain("Outage: .sb-controls not found");
    });

    it("copies to the clipboard and says so, or falls back to the console", async () => {
        const { diagnostics } = await load();
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
        expect(await diagnostics.copy()).toBe(true);
        expect(writeText.mock.calls[0][0]).toContain("Self check");
        expect(document.querySelector('[data-ui="sba-diagnostics"]').textContent).toContain("copied to the clipboard");

        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
        expect(await diagnostics.copy()).toBe(false);
        expect(info).toHaveBeenCalled();
        expect(document.querySelectorAll('[data-ui="sba-diagnostics"]')).toHaveLength(1);
        expect(document.querySelector('[data-ui="sba-diagnostics"]').textContent).toContain("console");
        info.mockRestore();
    });

    it("is part of the outage notice: a copy link and in the prefilled issue", async () => {
        vi.resetModules();
        const outageNotice = (await import("../src/js/widgets/outageNotice.js")).default;
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const notice = outageNotice.show([".sb-controls not found"]);
        const links = [...notice.querySelectorAll("a")];
        expect(links.map((a) => a.textContent)).toContain("Copy diagnostics");
        const issue = links.find((a) => a.textContent === "Report the problem").href;
        expect(decodeURIComponent(issue)).toContain("Diagnostics:");
        expect(decodeURIComponent(issue)).toContain("Self check");
    });
});
