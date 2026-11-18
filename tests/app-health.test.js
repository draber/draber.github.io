import { describe, it, expect, vi } from "vitest";
import { loadGame, whenReady } from "./support/game.js";

describe("app on a changed NYT page", () => {
    it("starts anyway and reports what's missing", async () => {
        loadGame();
        document.querySelector(".sb-wordlist-heading").remove();
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { default: App } = await import("../src/js/modules/app.js");
        const ready = whenReady();
        new App(document.querySelector("#js-hook-game-wrapper"));
        await ready;

        expect(document.body.dataset.sbaHealth).toBe('["wordlistHeading"]');
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain(".sb-wordlist-heading not found, affects the progress bar");
        // the rest works
        expect(document.querySelector("[data-id='sbaApp']")).not.toBeNull();
    });
});
