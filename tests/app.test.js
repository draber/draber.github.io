import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { startApp, tick, pointerClick, press } from "./support/game.js";

const popupKeys = ["grid", "darkMode", "milestones", "community", "shortcuts", "todaysAnswers"];

describe("app", () => {
    let app;
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const plugin = (key) => app.plugins.get(key);
    const openPopups = () => $$('[popover][data-shim-open="true"]').map((elem) => elem.dataset.ui);

    beforeAll(async () => {
        app = await startApp();
    });

    afterEach(() => {
        window.__popoverShim.reset();
        vi.restoreAllMocks();
    });

    describe("start", () => {
        it("adds the assistant to the content box", () => {
            expect($(".sb-content-box > .sba-container [data-id='sbaApp']")).not.toBeNull();
            expect(document.body.dataset.sbaActive).toBe("true");
            expect(document.body.dataset.sbaHealth).toBeUndefined();
        });

        it("doesn't add anything to the NYT modal area", () => {
            expect($$(".sb-modal-system")).toHaveLength(0);
            expect($("#portal-modal-system").childElementCount).toBe(0);
        });

        it("keeps all pop-ups closed and outside the game", () => {
            popupKeys.forEach((key) => {
                const ui = plugin(key).popup.ui;
                expect(ui.parentElement).toBe(document.body);
                expect(ui.getAttribute("popover")).toBe("auto");
            });
            expect(openPopups()).toEqual([]);
        });

        it("reads the words found so far", () => {
            expect(plugin("overview").getData()[1]).toEqual(["W", 2, 10, 12]);
        });
    });

    describe("pop-ups", () => {
        it.each(popupKeys)("%s opens and closes with ×, Escape and a click outside, repeatedly", (key) => {
            const p = plugin(key);
            for (let round = 0; round < 2; round++) {
                p.togglePopup();
                expect(openPopups()).toEqual([key]);
                p.popup.ui.querySelector(".sb-modal-close").click();
                expect(p.popup.isOpen).toBe(false);

                p.togglePopup();
                press("Escape");
                expect(p.popup.isOpen).toBe(false);

                p.togglePopup();
                pointerClick($(".sb-hive"));
                expect(p.popup.isOpen).toBe(false);
            }
        });

        it("doesn't close on a click inside", () => {
            plugin("milestones").togglePopup();
            pointerClick(plugin("milestones").popup.ui.querySelector(".sb-modal-body"));
            expect(plugin("milestones").popup.isOpen).toBe(true);
        });

        it("shows one pop-up at a time", () => {
            plugin("grid").togglePopup();
            plugin("community").togglePopup();
            expect(openPopups()).toEqual(["community"]);
        });

        it("closes an open NYT modal", () => {
            const closer = document.createElement("div");
            closer.className = "sb-modal-close";
            const nytModal = document.createElement("div");
            nytModal.append(closer);
            closer.addEventListener("click", () => nytModal.remove());
            $(".sb-game-moment").append(nytModal);

            plugin("milestones").togglePopup();
            expect(nytModal.isConnected).toBe(false);
            expect(plugin("milestones").popup.isOpen).toBe(true);
        });

        it("toggles the grid with its panel button, a click outside doesn't reopen it", () => {
            const button = $(".sba-tool-btn");
            pointerClick(button);
            expect(plugin("grid").popup.isOpen).toBe(true);
            pointerClick(button);
            expect(plugin("grid").popup.isOpen).toBe(false);
        });

        it("updates an open pop-up when a word is found", async () => {
            plugin("milestones").togglePopup();
            const before = plugin("milestones").popup.ui.querySelector(".sb-modal-message").textContent;
            const li = document.createElement("li");
            li.innerHTML = '<span class="sb-anagram">trainees</span>';
            $(".sb-wordlist-items-pag").append(li);
            await tick();
            const after = plugin("milestones").popup.ui.querySelector(".sb-modal-message").textContent;
            expect(after).not.toBe(before);
            li.remove();
        });
    });

    describe("pinned grid", () => {
        it("stays open next to other pop-ups and keeps its position", () => {
            const grid = plugin("grid").popup;
            grid.toggle(true);
            grid.ui.querySelector(".sba-pin").click();
            expect(grid.isPinned).toBe(true);
            expect(grid.ui.getAttribute("popover")).toBe("manual");
            expect(grid.isOpen).toBe(true);

            plugin("community").togglePopup();
            press("Escape");
            pointerClick($(".sb-hive"));
            expect(grid.isOpen).toBe(true);
            expect(plugin("community").popup.isOpen).toBe(false);
        });

        it("can be dragged by its title bar, the position is stored", () => {
            const grid = plugin("grid").popup;
            const handle = grid.ui.querySelector(".sb-modal-top");
            const opts = (x, y) => ({ bubbles: true, button: 0, clientX: x, clientY: y });
            window.innerWidth = 1200;
            window.innerHeight = 900;
            handle.dispatchEvent(new MouseEvent("pointerdown", opts(10, 10)));
            handle.dispatchEvent(new MouseEvent("pointermove", opts(110, 60)));
            handle.dispatchEvent(new MouseEvent("pointerup", opts(110, 60)));
            const stored = JSON.parse(localStorage.getItem("sba-settings")).grid.popup.position;
            expect(stored).toEqual({ x: 100, y: 50 });
        });

        it("is restored as pinned and open in the next session", async () => {
            const grid = plugin("grid").popup;
            const { default: settings } = await import("../src/js/modules/settings.js");
            expect(settings.get("options.grid.popup.pinned")).toBe(true);
            // fresh page: not pinned yet, stored as open
            grid.ui.setAttribute("popover", "auto");
            grid.ui.classList.remove("sba-pinned");
            settings.set("options.grid.popup.open", true);
            grid.restore();
            expect(grid.isPinned).toBe(true);
            expect(grid.isOpen).toBe(true);
            expect(grid.ui.style.left).toBe("100px");
        });

        it("unpins", () => {
            const grid = plugin("grid").popup;
            grid.pin(false);
            expect(grid.ui.getAttribute("popover")).toBe("auto");
            expect(grid.ui.style.left).toBe("");
            grid.toggle(false);
        });
    });

    describe("menu", () => {
        it("puts the button into the NYT toolbar and the list into the top layer", () => {
            const button = $(".pz-toolbar-right .pz-toolbar-button__sba");
            expect(button).not.toBeNull();
            const pane = document.getElementById(button.getAttribute("popovertarget"));
            expect(pane.parentElement).toBe(document.body);
            expect(pane.getAttribute("popover")).toBe("auto");
        });

        it("opens a pop-up from an entry and closes itself", () => {
            const button = $(".pz-toolbar-button__sba");
            pointerClick(button);
            expect(openPopups()).toEqual(["submenu"]);
            pointerClick($('[data-ui="submenu"] li[data-component="grid"]'));
            expect(openPopups()).toEqual(["grid"]);
        });

        it("toggles boolean entries", () => {
            pointerClick($(".pz-toolbar-button__sba"));
            const entry = $('[data-ui="submenu"] li[data-component="spillTheBeans"]');
            const before = plugin("spillTheBeans").getState();
            pointerClick(entry);
            expect(plugin("spillTheBeans").getState()).toBe(!before);
            expect(entry.classList.contains("checked")).toBe(!before);
        });

        it("closes when the user types", () => {
            pointerClick($(".pz-toolbar-button__sba"));
            press("KeyA");
            expect(openPopups()).toEqual([]);
        });
    });

    describe("Googlify", () => {
        const pointerUp = (elem) => elem.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, button: 0 }));

        it("links terms in the result list", () => {
            const open = vi.spyOn(window, "open").mockImplementation(() => null);
            pointerUp($(".sb-wordlist-items-pag .sb-anagram"));
            expect(open).toHaveBeenCalledOnce();
            expect(open.mock.calls[0][0]).toBe("https://www.google.com/search?q=tint");
        });

        it("links terms in SBA pop-ups, also after reopening", () => {
            const open = vi.spyOn(window, "open").mockImplementation(() => null);
            plugin("todaysAnswers").togglePopup();
            plugin("todaysAnswers").togglePopup();
            plugin("todaysAnswers").togglePopup();
            pointerUp(plugin("todaysAnswers").popup.ui.querySelector(".sb-anagram"));
            expect(open).toHaveBeenCalledOnce();
        });

        it("links terms in NYT modals rendered on demand, even if they stop propagation", () => {
            const open = vi.spyOn(window, "open").mockImplementation(() => null);
            const modal = document.createElement("div");
            modal.innerHTML = '<ul><li><span class="sb-anagram">yester</span></li></ul>';
            modal.addEventListener("pointerup", (evt) => evt.stopPropagation());
            $(".sb-game-moment").append(modal);
            pointerUp(modal.querySelector(".sb-anagram"));
            expect(open).toHaveBeenCalledWith("https://www.google.com/search?q=yester", "sba");
            modal.remove();
        });
    });

    describe("Yesterday's Answers", () => {
        it("highlights pangrams when the NYT renders the modal", async () => {
            const system = document.createElement("div");
            system.className = "sb-modal-system";
            // markup as of Nov 2026: class `yesterdayNew`, check mark and screen reader text in each item
            system.innerHTML =
                '<div class="sb-modal-scrim"><div class="sb-modal-wrapper"><div class="sb-modal-frame yesterdayNew">' +
                '<ul class="sb-modal-wordlist-items">' +
                '<li><span class="check"></span><span class="sb-anagram" aria-hidden="true">artesian</span><span class="visually-hidden">artesian (pangram)</span></li>' +
                '<li><span class="check checked"></span><span class="sb-anagram" aria-hidden="true">tint</span><span class="visually-hidden">tint</span></li>' +
                "</ul></div></div></div>";
            $(".sb-game-moment").append(system);
            await tick();
            const items = system.querySelectorAll("li");
            expect(items[0].classList.contains("sba-pangram")).toBe(true);
            expect(items[1].classList.contains("sba-pangram")).toBe(false);
            system.remove();
        });
    });

    describe("shortcuts", () => {
        it("deletes the typed character, then opens the pop-up", async () => {
            press("KeyG", { shiftKey: true, altKey: true });
            expect(plugin("grid").popup.isOpen).toBe(false);

            const deleted = vi.fn();
            $(".hive-action__delete").addEventListener("touchstart", deleted, { once: true });
            // the NYT types the character into the input
            const input = $(".sb-hive-input-content");
            input.classList.add("non-empty");
            input.append(document.createElement("span"));
            await tick(80);

            expect(deleted).toHaveBeenCalledOnce();
            expect(plugin("grid").popup.isOpen).toBe(true);
            input.replaceChildren();
            input.classList.remove("non-empty");
        });

        it("opens Yesterday's Answers, or closes an open SBA pop-up first", () => {
            const yesterday = vi.fn();
            $(".pz-toolbar-button__yesterday").addEventListener("click", yesterday);
            plugin("community").togglePopup();
            plugin("nytShortcuts").toggleYesterday();
            expect(plugin("community").popup.isOpen).toBe(false);
            expect(yesterday).not.toHaveBeenCalled();
            plugin("nytShortcuts").toggleYesterday();
            expect(yesterday).toHaveBeenCalledOnce();
        });

        it("toggles the panel", () => {
            app.toggle();
            expect(document.body.dataset.sbaActive).toBe("false");
            app.toggle();
            expect(document.body.dataset.sbaActive).toBe("true");
        });
    });

    describe("restart", () => {
        it("removes the old instance completely, like when the bookmarklet runs on top of the add-on", async () => {
            // fresh modules, add-on and bookmarklet are separate bundles
            vi.resetModules();
            const { default: App } = await import("../src/js/modules/app.js");
            const ready = new Promise((resolve) => document.addEventListener("sbaReady", resolve, { once: true }));
            const second = new App(document.querySelector("#js-hook-game-wrapper"));
            await ready;
            expect($$("[data-id='sbaApp']")).toHaveLength(1);
            expect($$(".pz-toolbar-button__sba")).toHaveLength(1);
            expect($$('[data-ui="submenu"]')).toHaveLength(1);
            expect($$('[data-ui="grid"][popover]')).toHaveLength(1);
            app = second;
        });
    });
});
