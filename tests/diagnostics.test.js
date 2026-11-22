/**
 * Diagnostics: "Report the problem" in the outage notice opens a GitHub issue with a report of what doesn't work.
 * Harmless facts only, never words of the game.
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

/**
 * The report part of an issue URL
 * @param {String} url
 * @returns {String}
 */
const bodyOf = (url) => decodeURIComponent(new URL(url).searchParams.get("body"));

describe("diagnostics", () => {
    beforeEach(() => {
        loadGame();
        delete document.body.dataset.sbaOutage;
    });

    it("starts with what doesn't work, nothing when all is well", async () => {
        // jsdom has no checkVisibility(), browsers do
        Element.prototype.checkVisibility ??= function () {
            return true;
        };
        const { diagnostics, timing } = await load();
        timing.mark("game");
        timing.mark("ready");
        document.body.insertAdjacentHTML("beforeend", '<button data-ui="menu"></button>');
        document.querySelector("#pz-game-root .pz-toolbar-right").append(document.querySelector('button[data-ui="menu"]'));
        const report = diagnostics.report();
        expect(report).toMatch(/^Spelling Bee Assistant \d+\.\d+\.\d+ \(\w+\)/);
        expect(report).toContain("Problems: none detected");
        expect(report).not.toContain("✓");
        expect(report).toMatch(/Game: \d{4}-\d{2}-\d{2}, \d+ of \d+ found/);
    });

    it("lists missing elements, a missing menu button and an assistant that hasn't started", async () => {
        document.querySelector(".sb-controls").remove();
        const { diagnostics } = await load();
        const problems = diagnostics.problems();
        expect(problems).toContain(".sb-controls not found (Spill the Beans)");
        expect(problems).toContain("assistant hasn't started");
        expect(diagnostics.report()).toContain("Problems:\n- ");
    });

    it("reports an outage and a late start", async () => {
        const { diagnostics, timing } = await load();
        document.body.dataset.sbaOutage = JSON.stringify([".sb-wordlist-items-pag not found within 15s"]);
        timing.mark("failed");
        expect(diagnostics.problems()).toContain("didn't start: .sb-wordlist-items-pag not found within 15s");
        expect(decodeURIComponent(new URL(diagnostics.issueUrl()).searchParams.get("title"))).toMatch(/doesn't start$/);

        delete document.body.dataset.sbaOutage;
        const late = await load();
        late.timing.marks.game = 9000;
        late.timing.marks.ready = 19000;
        expect(late.diagnostics.problems()).toContain("assistant ready 10.0s after the game");
    });

    it("never contains words of the game", async () => {
        const { diagnostics } = await load();
        const report = diagnostics.report().toLowerCase().replace(/mozilla\/.*$/m, "");
        const leaked = window.gameData.today.answers.filter((word) => new RegExp(`\\b${word}\\b`).test(report));
        expect(leaked).toEqual([]);
    });

    it("opens a GitHub issue with room for a description and the report", async () => {
        const { diagnostics } = await load();
        const url = diagnostics.issueUrl();
        expect(url).toMatch(/^https:\/\/github\.com\/draber\/draber\.github\.io\/issues\/new\?/);
        expect(bodyOf(url)).toMatch(/^\*\*What happened\?\*\*/);
        expect(bodyOf(url)).toContain("Diagnostics (please leave as is):");
        expect(bodyOf(url)).toContain("Problems:");
    });

    it("sbaDiagnostics() works without the app, from the start; no shortcut", async () => {
        const { diagnostics } = await load();
        const open = vi.spyOn(window, "open").mockImplementation(() => null);
        diagnostics.listen();
        expect(window.sbaDiagnostics()).toContain("Problems");

        // Shift+Alt+B is no longer taken, the key goes to the game as usual
        let reachedTheGame = false;
        const spy = () => (reachedTheGame = true);
        document.addEventListener("keydown", spy);
        const event = new KeyboardEvent("keydown", { code: "KeyB", key: "B", shiftKey: true, altKey: true, bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        expect(open).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(false);
        expect(reachedTheGame).toBe(true);
        document.removeEventListener("keydown", spy);
        open.mockRestore();
    });

    it("is behind 'Report the problem' in the outage notice", async () => {
        vi.resetModules();
        const outageNotice = (await import("../src/js/widgets/outageNotice.js")).default;
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const notice = outageNotice.show([".sb-controls not found"]);
        const links = [...notice.querySelectorAll("a")].map((a) => a.textContent);
        expect(links).toEqual(["Report the problem"]);
        const url = [...notice.querySelectorAll("a")].find((a) => a.textContent === "Report the problem").href;
        expect(decodeURIComponent(new URL(url).searchParams.get("title"))).toMatch(/doesn't start$/);
        expect(bodyOf(url)).toContain("didn't start: .sb-controls not found");
    });
});
