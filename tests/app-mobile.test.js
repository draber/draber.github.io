import { describe, it, expect, beforeAll } from "vitest";
import { startApp, pointerClick } from "./support/game.js";

describe("app on mobile", () => {
    let app;

    beforeAll(async () => {
        document.body.className = "pz-page pz-mobile";
        app = await startApp({ env: "mobile" });
    });

    it("adds the menu button to the mobile toolbar, after More", () => {
        const toolbar = document.querySelector("#js-mobile-toolbar .pz-toolbar-right");
        const button = toolbar.lastElementChild;
        expect(button.classList.contains("pz-toolbar-button__sba")).toBe(true);
        expect(button.classList.contains("pz-toolbar-button")).toBe(true);
        expect(button.previousElementSibling.classList.contains("pz-dropdown")).toBe(true);
    });

    it("comes back after the NYT re-renders the mobile toolbar", async () => {
        const mobileToolbar = document.querySelector("#js-mobile-toolbar");
        mobileToolbar.innerHTML = mobileToolbar.innerHTML.replace(/<button[^>]*pz-toolbar-button__sba[\s\S]*?<\/button>/, "");
        expect(mobileToolbar.querySelector(".pz-toolbar-button__sba")).toBeNull();
        await new Promise((resolve) => setTimeout(resolve));
        expect(mobileToolbar.querySelector(".pz-toolbar-right").lastElementChild.classList.contains("pz-toolbar-button__sba")).toBe(true);
        expect(document.querySelectorAll(".pz-toolbar-button__sba")).toHaveLength(1);
    });

    it("has a floating grid that can't be dragged on small screens", () => {
        const grid = app.plugins.get("grid").popup;
        expect(grid.ui.getAttribute("popover")).toBe("manual");
        const matchMedia = window.matchMedia;
        window.matchMedia = (query) => ({ matches: query.includes("max-width: 767"), addEventListener() {}, removeEventListener() {} });
        grid.toggle(true);
        const handle = grid.ui.querySelector(".sb-modal-top");
        const opts = (x, y) => ({ bubbles: true, button: 0, clientX: x, clientY: y });
        handle.dispatchEvent(new MouseEvent("pointerdown", opts(10, 10)));
        handle.dispatchEvent(new MouseEvent("pointermove", opts(110, 60)));
        handle.dispatchEvent(new MouseEvent("pointerup", opts(110, 60)));
        expect(grid.isMoved).toBe(false);
        expect(grid.ui.classList.contains("sba-moved")).toBe(false);
        grid.toggle(false);
        window.matchMedia = matchMedia;
    });

    it("opens pop-ups from the menu", () => {
        pointerClick(document.querySelector(".pz-toolbar-button__sba"));
        pointerClick(document.querySelector('[data-ui="submenu"] li[data-component="grid"]'));
        expect(app.plugins.get("grid").popup.isOpen).toBe(true);
    });
});
