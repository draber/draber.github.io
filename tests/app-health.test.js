import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadGame, tick } from "./support/game.js";

/**
 * All or nothing: when the NYT page has changed in a way SBA can't handle,
 * SBA doesn't start and shows a notice instead of a half-working assistant.
 */
describe("app on a changed NYT page", () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const notice = () => $('[data-ui="sba-outage"]');
    let warn;

    /**
     * Fresh modules for every test, the NYT adapter reads the simulation switch on import
     * @param {Object} [options]
     * @param {Number} [options.timeout] result list timeout in ms
     * @returns {Promise<Object>} the app and the modules used
     */
    const start = async ({ timeout } = {}) => {
        vi.resetModules();
        const { default: App } = await import("../src/js/modules/app.js");
        const { default: pluginRegistry } = await import("../src/js/modules/pluginRegistry.js");
        if (timeout) {
            App.resultListTimeout = timeout;
        }
        return { App, pluginRegistry };
    };

    /**
     * The player clicks somewhere, e.g. "Continue" on the welcome screen. The timeout counts from here.
     */
    const interact = () => document.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    /**
     * Nothing of SBA is left on the page, apart from the notice
     */
    const expectNothingOfSba = () => {
        expect($("[data-id='sbaApp']")).toBeNull();
        expect($(".pz-toolbar-button__sba")).toBeNull();
        expect($$("[popover]").filter((elem) => elem !== notice())).toHaveLength(0);
        expect(document.body.dataset.sbaActive).toBeUndefined();
    };

    beforeEach(() => {
        loadGame();
        // loadGame() replaces the content of body, not its attributes
        delete document.body.dataset.sbaOutage;
        warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it("doesn't start when something is missing, shows a notice and reports what's missing", async () => {
        $(".sb-wordlist-heading").remove();
        const { App } = await start();
        await new App($("#js-hook-game-wrapper")).ready;

        expectNothingOfSba();
        expect(notice()).not.toBeNull();
        expect(notice().textContent).toContain("can’t run right now");
        expect(JSON.parse(document.body.dataset.sbaOutage)).toEqual([".sb-wordlist-heading not found (the progress bar)"]);
        expect(warn.mock.calls.flat().join(" ")).toContain(".sb-wordlist-heading not found");
    });

    it("links to a prefilled GitHub issue with version and the problems", async () => {
        $(".sb-controls").remove();
        const { App } = await start();
        await new App($("#js-hook-game-wrapper")).ready;

        const report = [...notice().querySelectorAll("a")].find((a) => a.textContent.includes("Report"));
        const url = new URL(report.href);
        expect(url.origin + url.pathname).toBe("https://github.com/draber/draber.github.io/issues/new");
        expect(url.searchParams.get("body")).toContain(".sb-controls not found");
        expect(url.searchParams.get("body")).toMatch(/Version: \d+\.\d+\.\d+/);
    });

    it("gives up when the result list doesn't show up", async () => {
        $(".sb-wordlist-items-pag").remove();
        const { App } = await start({ timeout: 50 });
        const app = new App($("#js-hook-game-wrapper"));
        interact();
        await app.ready;

        expectNothingOfSba();
        expect(document.body.dataset.sbaOutage).toContain(".sb-wordlist-items-pag not found within");
    });

    it("waits for a result list that is rendered later", async () => {
        const list = $(".sb-wordlist-items-pag");
        const parent = list.parentElement;
        list.remove();
        const { App } = await start({ timeout: 1000 });
        const app = new App($("#js-hook-game-wrapper"));
        await tick(20);
        parent.append(list);
        await app.ready;
        expect($("[data-id='sbaApp']")).not.toBeNull();
        expect(notice()).toBeNull();
    });

    it("waits on the welcome screen as long as it takes, the game comes after 'Continue'", async () => {
        const list = $(".sb-wordlist-items-pag");
        const parent = list.parentElement;
        list.remove();
        const { App } = await start({ timeout: 30 });
        const app = new App($("#js-hook-game-wrapper"));
        // way past the timeout, but nobody has clicked yet
        await tick(120);
        expect(notice()).toBeNull();
        expect(document.body.dataset.sbaOutage).toBeUndefined();

        // "Continue": the game is rendered
        interact();
        parent.append(list);
        await app.ready;
        expect($("[data-id='sbaApp']")).not.toBeNull();
        expect(notice()).toBeNull();
    });

    it("counts the timeout from the first click", async () => {
        $(".sb-wordlist-items-pag").remove();
        const { App } = await start({ timeout: 50 });
        const app = new App($("#js-hook-game-wrapper"));
        await tick(100);
        expect(notice()).toBeNull();
        interact();
        await app.ready;
        expect(notice()).not.toBeNull();
    });

    it("gives up when there's no toolbar, the menu would be unreachable", async () => {
        $$(".pz-toolbar-right").forEach((toolbar) => toolbar.remove());
        const { App } = await start({ timeout: 50 });
        const app = new App($("#js-hook-game-wrapper"));
        interact();
        await app.ready;

        expectNothingOfSba();
        expect(document.body.dataset.sbaOutage).toContain(".pz-toolbar-right not found within");
    });

    it("waits for a toolbar that shows up after the game, like on mobile", async () => {
        const toolbars = $$(".pz-toolbar-right").map((toolbar) => [toolbar, toolbar.parentElement]);
        toolbars.forEach(([toolbar]) => toolbar.remove());
        const { App } = await start({ timeout: 1000 });
        const app = new App($("#js-hook-game-wrapper"));
        await tick(20);
        toolbars.forEach(([toolbar, parent]) => parent.append(toolbar));
        await app.ready;
        expect($("[data-id='sbaApp']")).not.toBeNull();
        expect($(".pz-toolbar-button__sba")).not.toBeNull();
        expect(notice()).toBeNull();
    });

    it("removes whatever has been added when the start fails halfway", async () => {
        const { App, pluginRegistry } = await start();
        const register = pluginRegistry.register;
        let count = 0;
        vi.spyOn(pluginRegistry, "register").mockImplementation((Plugin, app) => {
            if (++count === 10) {
                throw new Error("boom");
            }
            return register(Plugin, app);
        });
        const app = new App($("#js-hook-game-wrapper"));
        await app.ready;

        expect(app.failed).toBe(true);
        expectNothingOfSba();
        expect(document.body.dataset.sbaOutage).toContain("start failed: boom");
    });

    it("doesn't show the notice again on the same day once closed", async () => {
        $(".sb-controls").remove();
        let { App } = await start();
        await new App($("#js-hook-game-wrapper")).ready;
        notice().querySelector("button").click();
        expect(notice()).toBeNull();

        // a reload of the page: same localStorage
        const stored = { ...localStorage };
        loadGame();
        Object.entries(stored).forEach(([key, value]) => localStorage.setItem(key, value));
        $(".sb-controls").remove();
        ({ App } = await start());
        await new App($("#js-hook-game-wrapper")).ready;
        expect(notice()).toBeNull();
        // still reported in the console and on <body>
        expect(document.body.dataset.sbaOutage).toContain(".sb-controls");
    });

    it("can be simulated with the localStorage switch", async () => {
        localStorage.setItem("sba-simulate-missing", "contentBox");
        const { App } = await start();
        await new App($("#js-hook-game-wrapper")).ready;

        expectNothingOfSba();
        expect(document.body.dataset.sbaOutage).toContain(".sb-content-box not found");
        expect(warn.mock.calls.flat().join(" ")).toContain("simulating a broken NYT page");
    });
});
