import { describe, it, expect, beforeAll } from "vitest";
import { startApp, pointerClick } from "./support/game.js";

describe("app on mobile", () => {
    let app;

    beforeAll(async () => {
        document.body.className = "pz-page pz-mobile";
        app = await startApp({ env: "mobile" });
    });

    it("waits for the mobile toolbar, then adds the menu button", async () => {
        const nav = document.querySelector("#js-global-nav");
        expect(document.querySelector(".pz-toolbar-button__sba")).toBeNull();
        nav.classList.add("show-mobile-toolbar");
        await new Promise((resolve) => setTimeout(resolve));
        const button = document.querySelector("#js-mobile-toolbar + .pz-toolbar-button__sba");
        expect(button).not.toBeNull();
        expect(button.classList.contains("pz-nav__toolbar-item")).toBe(true);
    });

    it("has a floating grid with a title bar to drag", () => {
        const grid = app.plugins.get("grid").popup;
        expect(grid.ui.getAttribute("popover")).toBe("manual");
        expect(grid.ui.querySelector(".sb-modal-top .sba-move-handle")).not.toBeNull();
    });

    it("opens pop-ups from the menu", () => {
        pointerClick(document.querySelector(".pz-toolbar-button__sba"));
        pointerClick(document.querySelector('[data-ui="submenu"] li[data-component="grid"]'));
        expect(app.plugins.get("grid").popup.isOpen).toBe(true);
    });
});
