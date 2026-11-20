/**
 * Notice for browsers in which parts of the assistant don't work, currently Kiwi
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

const kiwi = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Kiwi Chrome/124.0.0.0 Mobile Safari/537.36";
const vivaldi = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36";
const desktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36";

const load = async () => {
    vi.resetModules();
    return (await import("../src/js/widgets/browserNotice.js")).default;
};

const notice = () => document.querySelector('[data-ui="sba-kiwi"]');

describe("browser notice", () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = "";
        vi.useRealTimers();
    });

    it("recognizes Kiwi by its user agent", async () => {
        const browserNotice = await load();
        expect(browserNotice.isKiwi(kiwi)).toBe(true);
        expect(browserNotice.isKiwi(vivaldi)).toBe(false);
        expect(browserNotice.isKiwi(desktop)).toBe(false);
    });

    it("shows the notice in Kiwi, with a link to switching", async () => {
        const browserNotice = await load();
        expect(browserNotice.check(kiwi)).not.toBeNull();
        expect(notice().textContent).toContain("Vivaldi");
        expect(notice().querySelector("a").href).toContain("#mobile-installation");
    });

    it("stays quiet in other browsers", async () => {
        const browserNotice = await load();
        expect(browserNotice.check(vivaldi)).toBeNull();
        expect(browserNotice.check(desktop)).toBeNull();
        expect(notice()).toBeNull();
    });

    it("stays away for 30 days after closing", async () => {
        const browserNotice = await load();
        browserNotice.check(kiwi);
        notice().querySelector("button").click();
        expect(notice()).toBeNull();

        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(Date.now() + 29 * 86400000);
        expect(browserNotice.check(kiwi)).toBeNull();
        vi.setSystemTime(Date.now() + 2 * 86400000);
        expect(browserNotice.check(kiwi)).not.toBeNull();
    });
});
