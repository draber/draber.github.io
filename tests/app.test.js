import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { startApp, tick, pointerClick, press } from "./support/game.js";

const popupKeys = ["grid", "darkMode", "milestones", "community", "shortcuts", "todaysAnswers"];
const regularPopupKeys = popupKeys.filter((key) => key !== "grid");

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
                expect(ui.getAttribute("popover")).toBe(key === "grid" ? "manual" : "auto");
            });
            expect(openPopups()).toEqual([]);
        });

        it("reads the words found so far", () => {
            expect(plugin("overview").getData()[1]).toEqual(["W", 2, 10, 12]);
        });
    });

    describe("pop-ups", () => {
        it.each(regularPopupKeys)("%s opens and closes with ×, Escape and a click outside, repeatedly", (key) => {
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

        it("shows one regular pop-up at a time", () => {
            plugin("milestones").togglePopup();
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

    describe("floating grid", () => {
        const grid = () => plugin("grid").popup;

        it("closes with × and Escape, repeatedly", () => {
            for (let round = 0; round < 2; round++) {
                grid().toggle(true);
                grid().ui.querySelector(".sb-modal-close").click();
                expect(grid().isOpen).toBe(false);
                grid().toggle(true);
                press("Escape");
                expect(grid().isOpen).toBe(false);
            }
        });

        it("stays open on a click outside and when other pop-ups open", () => {
            grid().toggle(true);
            pointerClick($(".sb-hive"));
            plugin("community").togglePopup();
            expect(openPopups().sort()).toEqual(["community", "grid"]);
        });

        it("lets Escape close what's on top first", () => {
            grid().toggle(true);
            plugin("community").togglePopup();
            press("Escape");
            expect(openPopups()).toEqual(["grid"]);
            press("Escape");
            expect(openPopups()).toEqual([]);
        });

        it("leaves Escape to an open NYT modal", () => {
            grid().toggle(true);
            const closer = document.createElement("div");
            closer.className = "sb-modal-close";
            const nytModal = document.createElement("div");
            nytModal.append(closer);
            closer.addEventListener("click", () => nytModal.remove());
            $(".sb-game-moment").append(nytModal);
            press("Escape");
            expect(nytModal.isConnected).toBe(false);
            expect(grid().isOpen).toBe(true);
        });

        it("opens centered with title and description", () => {
            grid().toggle(true);
            expect(grid().isMoved).toBe(false);
            expect(grid().ui.classList.contains("sba-moved")).toBe(false);
            expect(grid().ui.querySelector(".sba-window-title").textContent).toBe("Grid");
            expect(grid().ui.querySelector(".sba-move-hint").textContent).toBe("New: you can now move the grid");
        });

        it("turns into a compact window when dragged and remembers the position until reload", () => {
            grid().toggle(true);
            const handle = grid().ui.querySelector(".sb-modal-top");
            const opts = (x, y) => ({ bubbles: true, button: 0, clientX: x, clientY: y });
            window.innerWidth = 1200;
            window.innerHeight = 900;
            handle.dispatchEvent(new MouseEvent("pointerdown", opts(10, 10)));
            handle.dispatchEvent(new MouseEvent("pointermove", opts(110, 60)));
            handle.dispatchEvent(new MouseEvent("pointerup", opts(110, 60)));
            expect(grid().ui.classList.contains("sba-moved")).toBe(true);
            expect(grid().position).toEqual({ x: 100, y: 50 });
            // the hint has done its job
            expect(grid().ui.querySelector(".sba-move-hint")).toBeNull();
            expect(JSON.parse(localStorage.getItem("sba-settings")).grid.moveHintSeen).toBe(true);

            grid().toggle(false);
            grid().ui.style.left = "";
            grid().toggle(true);
            expect(grid().ui.style.left).toBe("100px");
            expect(grid().ui.classList.contains("sba-moved")).toBe(true);
            // nothing stored beyond the page
            expect(localStorage.getItem("sba-settings")).not.toContain("position");
        });

        it("goes back to the centered pop-up on a double click on the title bar", () => {
            const before = { ...grid().position };
            grid().ui.querySelector(".sb-modal-close").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
            expect(grid().position).toEqual(before);
            grid().ui.querySelector(".sb-modal-top").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
            expect(grid().isMoved).toBe(false);
            expect(grid().ui.classList.contains("sba-moved")).toBe(false);
            expect(grid().ui.style.left).toBe("");
            grid().position = before;
        });

        it("goes back to the centered pop-up when dropped on the middle of the viewport", () => {
            const before = { ...grid().position };
            const handle = grid().ui.querySelector(".sb-modal-top");
            const opts = (x, y) => ({ bubbles: true, button: 0, clientX: x, clientY: y });
            // jsdom has no layout, pretend the window lies over the middle
            const rect = vi.spyOn(grid().ui, "getBoundingClientRect").mockReturnValue({ left: 500, right: 700, top: 400, bottom: 500, width: 200, height: 100 });
            handle.dispatchEvent(new MouseEvent("pointerdown", opts(0, 0)));
            // a click without moving doesn't count
            handle.dispatchEvent(new MouseEvent("pointerup", opts(0, 0)));
            expect(grid().isMoved).toBe(true);
            handle.dispatchEvent(new MouseEvent("pointerdown", opts(0, 0)));
            handle.dispatchEvent(new MouseEvent("pointermove", opts(5, 5)));
            handle.dispatchEvent(new MouseEvent("pointerup", opts(5, 5)));
            expect(grid().isMoved).toBe(false);
            rect.mockRestore();
            grid().position = before;
            grid().ui.classList.add("sba-moved");
        });

        it("uses icons of the same size for moving and closing", () => {
            expect(grid().ui.querySelector(".sb-modal-close svg")).not.toBeNull();
            expect(grid().ui.querySelector(".sba-move-handle svg")).not.toBeNull();
            expect(plugin("milestones").popup.ui.querySelector(".sb-modal-close").textContent).toBe("×");
        });

        it("turns into a regular pop-up below 768px, an open one when it closes", () => {
            const matchMedia = window.matchMedia;
            const small = (matches) => {
                window.matchMedia = () => ({ matches, addEventListener() {}, removeEventListener() {} });
            };
            small(true);
            grid().applyMode();
            expect(grid().ui.getAttribute("popover")).toBe("auto");
            small(false);
            grid().applyMode();
            expect(grid().ui.getAttribute("popover")).toBe("manual");

            grid().toggle(true);
            small(true);
            grid().applyMode();
            expect(grid().ui.getAttribute("popover")).toBe("manual");
            grid().toggle(false);
            expect(grid().ui.getAttribute("popover")).toBe("auto");

            small(false);
            grid().applyMode();
            window.matchMedia = matchMedia;
        });

        it("doesn't start dragging from the close button", () => {
            const before = { ...grid().position };
            const close = grid().ui.querySelector(".sb-modal-close");
            close.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 0, clientY: 0 }));
            grid().ui.querySelector(".sb-modal-top").dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 300, clientY: 300 }));
            expect(grid().position).toEqual(before);
        });
    });

    describe("menu", () => {
        it("puts the button into the NYT toolbar and the list into the top layer", () => {
            const toolbar = $("#pz-game-root .pz-toolbar-right");
            const button = toolbar.lastElementChild;
            expect(button.classList.contains("pz-toolbar-button__sba")).toBe(true);
            // looks like its neighbours
            expect(button.classList.contains("pz-toolbar-button")).toBe(true);
            expect(button.dataset.ui).toBe("menu");
            const pane = document.getElementById(button.getAttribute("popovertarget"));
            expect(pane.parentElement).toBe(document.body);
            expect(pane.getAttribute("popover")).toBe("auto");
        });

        it("comes back when the NYT re-renders the toolbar", async () => {
            const old = $("#pz-game-root .pz-toolbar-right");
            const rerendered = old.cloneNode(true);
            rerendered.querySelector(".pz-toolbar-button__sba").remove();
            old.replaceWith(rerendered);
            await tick();
            expect(rerendered.lastElementChild.classList.contains("pz-toolbar-button__sba")).toBe(true);
            expect($$(".pz-toolbar-button__sba")).toHaveLength(1);
        });

        it("removes a copy of its own button, e.g. from a toolbar re-rendered via innerHTML", async () => {
            const toolbar = $("#pz-game-root .pz-toolbar-right");
            const copy = $(".pz-toolbar-button__sba").cloneNode(true);
            toolbar.prepend(copy);
            await tick();
            expect(copy.isConnected).toBe(false);
            expect($$(".pz-toolbar-button__sba")).toHaveLength(1);
        });

        it("leaves the button of another copy of the assistant alone instead of fighting over the last place", async () => {
            const toolbar = $("#pz-game-root .pz-toolbar-right");
            const own = $(".pz-toolbar-button__sba");
            const other = own.cloneNode(true);
            other.dataset.sbaInstance = "another-copy";
            toolbar.append(other);
            await tick();
            // no back and forth: the other button stays, this one steps back
            expect(other.isConnected).toBe(true);
            expect(toolbar.lastElementChild).toBe(other);
            other.remove();
            await tick();
            expect(toolbar.lastElementChild).toBe(own);
        });

        it("stays the last item when the NYT adds a button", async () => {
            const toolbar = $("#pz-game-root .pz-toolbar-right");
            const extra = document.createElement("button");
            toolbar.append(extra);
            await tick();
            expect(toolbar.lastElementChild.classList.contains("pz-toolbar-button__sba")).toBe(true);
            extra.remove();
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

    describe("focus", () => {
        // a mousedown whose default is prevented doesn't move the focus
        const mousedown = (elem) => {
            const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
            elem.dispatchEvent(event);
            return event.defaultPrevented;
        };

        it("stays with the game when SBA's buttons and headings are clicked", () => {
            expect(mousedown($(".sba summary"))).toBe(true);
            expect(mousedown($(".sba .sba-tool-btn"))).toBe(true);
            expect(mousedown($(".pz-toolbar-button__sba"))).toBe(true);
            expect(mousedown(plugin("grid").popup.ui.querySelector(".sb-modal-close"))).toBe(true);
            // also on what's inside a button, e.g. the icon
            expect(mousedown($(".sba .sba-tool-btn svg"))).toBe(true);
        });

        it("leaves form fields, other content and the NYT's own buttons alone", () => {
            expect(mousedown(plugin("darkMode").popup.ui.querySelector("input"))).toBe(false);
            expect(mousedown($(".sba .sba-data-pane"))).toBe(false);
            expect(mousedown($(".hive-action__delete"))).toBe(false);
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
            $("#pz-game-root .pz-toolbar-button__yesterday").addEventListener("click", yesterday);
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
            // a reload forgets where the grid was
            expect(second.plugins.get("grid").popup.isMoved).toBe(false);
            app = second;
        });
    });
});
