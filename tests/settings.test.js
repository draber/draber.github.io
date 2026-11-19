/**
 * Stored settings must never stop the assistant: whatever is in localStorage,
 * the worst case is a start with defaults.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

const key = "sba-settings";

/**
 * Load a fresh copy of the settings module with `raw` in localStorage, like on a page load
 * @param {String|null} raw
 */
const load = async (raw) => {
    vi.resetModules();
    localStorage.clear();
    if (raw !== null) {
        localStorage.setItem(key, raw);
    }
    return (await import("../src/js/modules/settings.js")).default;
};

const stored = () => JSON.parse(localStorage.getItem(key));

describe("settings", () => {
    beforeEach(() => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("starts empty without stored settings", async () => {
        const settings = await load(null);
        expect(settings.get("options")).toEqual({ schema: 1 });
    });

    it.each([
        ["broken JSON", "{oops"],
        ["null", "null"],
        ["an array", "[]"],
        ["a string", '"dark"'],
    ])("starts with defaults when the stored value is %s and keeps a copy", async (_, raw) => {
        const settings = await load(raw);
        expect(settings.get("options")).toEqual({ schema: 1 });
        expect(localStorage.getItem(`${key}-broken`)).toBe(raw);
        expect(settings.set("options.grid.x", 1)).toBe(true);
        expect(stored()).toEqual({ schema: 1, grid: { x: 1 } });
    });

    it("takes over 5.x settings and drops the version keys", async () => {
        const settings = await load(
            JSON.stringify({ version: "5.0.0", oldVersion: "4.3.5", darkMode: { mode: "dark", hsl: { hue: 1, sat: 2, lig: 3 } } }),
        );
        expect(settings.get("options")).toEqual({ schema: 1, darkMode: { mode: "dark", hsl: { hue: 1, sat: 2, lig: 3 } } });
    });

    it("leaves settings from a newer version alone", async () => {
        const settings = await load(JSON.stringify({ schema: 99, future: { thing: true } }));
        expect(settings.get("options.schema")).toBe(99);
        expect(settings.get("options.future.thing")).toBe(true);
    });

    it("replaces an outdated value where an object is expected now", async () => {
        const settings = await load(JSON.stringify({ schema: 1, darkMode: true }));
        expect(settings.set("options.darkMode.mode", "dark")).toBe(true);
        expect(stored().darkMode).toEqual({ mode: "dark" });
    });

    it("keeps working when localStorage is unavailable", async () => {
        const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("denied", "SecurityError");
        });
        const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new DOMException("full", "QuotaExceededError");
        });
        vi.resetModules();
        const settings = (await import("../src/js/modules/settings.js")).default;
        expect(settings.get("options")).toEqual({ schema: 1 });
        expect(settings.set("options.grid.x", 1)).toBe(true);
        expect(settings.get("options.grid.x")).toBe(1);
        getItem.mockRestore();
        setItem.mockRestore();
    });

    it("takes only `enabled` from a stored 5.x shortcut, the label comes from the code", async () => {
        await load(
            JSON.stringify({
                version: "5.0.0",
                grid: { shortcuts: { "Alt+Shift+KeyG": { combo: "Alt+Shift+KeyG", label: "Old label", method: "gone", enabled: false } } },
            }),
        );
        const registry = (await import("../src/js/modules/shortcutRegistry.js")).default;
        registry.add({ combo: "Shift+Alt+G", module: "grid", label: "Grid", method: "toggle", callback: () => {} });
        const shortcut = registry.get("Shift+Alt+G");
        expect(shortcut.label).toBe("Grid");
        expect(shortcut.method).toBe("toggle");
        expect(shortcut.enabled).toBe(false);

        registry.set(shortcut.combo, { ...shortcut, enabled: true });
        expect(stored().grid.shortcuts["Alt+Shift+KeyG"]).toEqual({ enabled: true });
    });
});
