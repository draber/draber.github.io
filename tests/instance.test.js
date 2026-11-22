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
        // a fresh page: loadGame() replaces the content of body, not its attributes, and keeps window
        delete window.sbaRunning;
        delete document.body.dataset.sbaActive;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("marks the page with the version of the copy that runs, in window, not in the DOM", async () => {
        const ready = new Promise((resolve) => document.addEventListener("sbaReady", resolve, { once: true }));
        await runCopy();
        await ready;
        expect(window.sbaRunning).toBe(pkg.version);
        expect(document.documentElement.dataset.sbaRunning).toBeUndefined();
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

    it("removes a version from before 6.1.0, which doesn't set the mark, and starts", async () => {
        // an older copy: its app element listens for the destroy event and removes itself
        const older = document.createElement("div");
        older.dataset.id = "sbaApp";
        const destroyed = vi.fn(() => older.remove());
        older.addEventListener("sbaDestroy", destroyed);
        document.querySelector(".sb-content-box").append(older);

        const ready = new Promise((resolve) => document.addEventListener("sbaReady", resolve, { once: true }));
        await runCopy();
        await ready;
        expect(destroyed).toHaveBeenCalledOnce();
        expect($$("[data-id='sbaApp']")).toHaveLength(1);
        expect(window.sbaRunning).toBe(pkg.version);
    });

    it("doesn't start either when the first copy gave up", async () => {
        window.sbaRunning = "6.1.0";
        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        await runCopy();
        await tick(50);
        expect($$("[data-id='sbaApp']")).toHaveLength(0);
        expect(document.body.dataset.sbaOutage).toBeUndefined();
        expect(info).toHaveBeenCalledOnce();
    });
});
