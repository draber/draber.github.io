import { describe, it, expect, beforeAll } from "vitest";
import registry from "../src/js/modules/shortcutRegistry.js";
import { loadGame } from "./support/game.js";

describe("shortcut registry", () => {
    beforeAll(() => {
        loadGame();
        registry.add({ combo: "Shift+Alt+G", module: "grid", callback: () => {} });
        registry.add({ combo: "Shift+Alt+Y", module: "nytShortcuts", origin: "nyt", callback: () => {} });
        registry.add({ combo: "Shift+Alt+I", module: "nytShortcuts", origin: "nyt", callback: () => {} });
        registry.add({ combo: "Ctrl+Alt+2", module: "test", callback: () => {} });
    });

    it("normalizes combos regardless of notation and order", () => {
        expect(registry.normalizeCombo("Shift+Alt+G")).toBe("Alt+Shift+KeyG");
        expect(registry.normalizeCombo("alt + shift + g")).toBe("Alt+Shift+KeyG");
        expect(registry.normalizeCombo(["Shift", "Alt", "KeyG"])).toBe("Alt+Shift+KeyG");
        expect(registry.normalizeCombo("Ctrl+Alt+2")).toBe("Alt+Control+Digit2");
    });

    it("normalizes keyboard events", () => {
        const evt = new KeyboardEvent("keydown", { code: "KeyG", key: "G", shiftKey: true, altKey: true });
        expect(registry.normalizeCombo(evt)).toBe("Alt+Shift+KeyG");
        expect(registry.getSbaShortcutEntry(evt).module).toBe("grid");
    });

    it("builds human readable combos", () => {
        expect(registry.get("Shift+Alt+G").human).toBe("Alt + Shift + G");
        expect(registry.get("Ctrl+Alt+2").human).toBe("Alt + Ctrl + 2");
    });

    it("deletes typed characters of SBA and NYT shortcuts", () => {
        expect(registry.requiresDeletion("Shift+Alt+G")).toBe(true);
        expect(registry.requiresDeletion("Shift+Alt+Y")).toBe(true);
        expect(registry.requiresDeletion("Shift+Alt+I")).toBe(true);
    });

    it("deletes only SBA characters while a NYT modal is open", () => {
        const modal = document.createElement("div");
        modal.innerHTML = '<div class="sb-modal-close">×</div>';
        document.querySelector(".sb-game-moment").append(modal);
        expect(registry.requiresDeletion("Shift+Alt+G")).toBe(true);
        expect(registry.requiresDeletion("Shift+Alt+Y")).toBe(false);
        modal.remove();
    });

    it("ignores duplicates", () => {
        expect(registry.add({ combo: "Alt+Shift+G", module: "other", callback: () => {} })).toBe(false);
        expect(registry.get("Shift+Alt+G").module).toBe("grid");
    });
});
