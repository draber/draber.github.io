/**
 * One assistant per page: the first copy wins, every later one (extension and bookmarklet, two extensions)
 * doesn't start at all.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadGame, tick } from "./support/game.js";
import pkg from "../package.json" with { type: "json" };

/**
 * Run the bundle entry like a separate copy would: fresh modules, nothing shared but the page
 * @returns {Promise<void>}
 */
const runCopy = async () => {
    vi.resetModules();
    await import("../src/js/main.js");
};

const $$ = (selector) => [...document.querySelectorAll(selector)];

describe("one assistant per page", () => {
    beforeEach(() => {
        loadGame();
        delete document.documentElement.dataset.sbaRunning;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("marks the page with the version of the copy that runs", async () => {
        const ready = new Promise((resolve) => document.addEventListener("sbaReady", resolve, { once: true }));
        await runCopy();
        await ready;
        expect(document.documentElement.dataset.sbaRunning).toBe(pkg.version);
    });

    it("doesn't start a second copy, the first one stays untouched", async () => {
        const ready = new Promise((resolve) => document.addEventListener("sbaReady", resolve, { once: true }));
        await runCopy();
        await ready;

        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        const secondReady = vi.fn();
        document.addEventListener("sbaReady", secondReady);
        await runCopy();
        await tick(50);
        document.removeEventListener("sbaReady", secondReady);

        expect(secondReady).not.toHaveBeenCalled();
        expect($$("[data-id='sbaApp']")).toHaveLength(1);
        expect($$(".pz-toolbar-button__sba")).toHaveLength(1);
        expect($$('[data-ui="submenu"]')).toHaveLength(1);
        expect($$('[data-ui="grid"][popover]')).toHaveLength(1);
        expect($$("[data-ui='progressBar']")).toHaveLength(1);
        expect(info).toHaveBeenCalledWith(
            `Spelling Bee Assistant ${pkg.version} is already running, this copy (${pkg.version}) doesn't start.`,
        );
    });

    it("doesn't start either when the first copy gave up", async () => {
        document.documentElement.dataset.sbaRunning = "6.0.2";
        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        await runCopy();
        await tick(50);
        expect($$("[data-id='sbaApp']")).toHaveLength(0);
        expect(document.body.dataset.sbaOutage).toBeUndefined();
        expect(info).toHaveBeenCalledOnce();
    });
});
