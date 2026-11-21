/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import nyt from "../nyt/nyt.js";
import settings from "./settings.js";
import timing from "../utils/timing.js";
import notice from "../widgets/notice.js";

/**
 * Diagnostics: a plain text report for bug reports.
 *
 * Only harmless facts: versions, what was found, when, and counts.
 * Never words of the game, user ids, cookies or storage contents, people paste this into public issues.
 */

/**
 * Seconds with one decimal, or a dash
 * @param {Number|undefined} ms
 * @returns {String}
 */
const seconds = (ms) => (typeof ms === "number" && ms > 0 ? `${(ms / 1000).toFixed(1)}s` : "–");

/**
 * @param {Boolean} value
 * @returns {String}
 */
const check = (value) => (value ? "✓" : "✗");

/**
 * Browser name and version, platform
 * @returns {String}
 */
const describeBrowser = () => {
    const ua = navigator.userAgent;
    const brands = (navigator.userAgentData?.brands || []).filter(({ brand }) => !/not.?a.?brand|chromium/i.test(brand));
    let browser = brands.length ? `${brands[0].brand} ${brands[0].version}` : "";
    if (/\bKiwi\b/.test(ua)) {
        browser = "Kiwi";
    } else if (!browser) {
        const match = ua.match(/(Edg|Firefox|Chrome|Version)\/(\d+)/);
        browser = match ? `${{ Edg: "Edge", Version: "Safari" }[match[1]] || match[1]} ${match[2]}` : "unknown";
    }
    const platform = navigator.userAgentData?.platform || (ua.match(/Android|iPhone|iPad|Windows|Mac OS X|Linux/) || ["unknown"])[0];
    return `${browser} · ${platform}`;
};

/**
 * Where the toolbar and the menu button are
 * @returns {String}
 */
const describeToolbar = () => {
    const toolbar = nyt.getToolbar();
    const where = !toolbar ? "missing" : toolbar.closest(nyt.selectors.globalNav) ? "in the navigation" : "in the game";
    const button = document.querySelector(`button[data-ui="menu"]`);
    const buttonWhere = !button ? "missing" : toolbar?.contains(button) ? "in the toolbar" : "elsewhere";
    return `Toolbar: ${where} · Menu button: ${buttonWhere}`;
};

/**
 * Game date and how many words have been found, numbers only
 * @returns {String}
 */
const describeGame = () => {
    try {
        const game = nyt.getGameData();
        const resultList = nyt.find("resultList");
        const found = resultList ? nyt.getFoundTerms(resultList).length : "?";
        return `Game: ${game.printDate} · found ${found} of ${game.answers.length}`;
    } catch (e) {
        return "Game: no data";
    }
};

/**
 * The report
 * @returns {String}
 */
const report = () => {
    const navigation = performance.getEntriesByType?.("navigation")?.[0];
    const { marks } = timing;
    const { ok, problems } = nyt.selfCheck();
    const outage = document.body.dataset[`${settings.get("prefix")}Outage`];
    let schema = "?";
    try {
        schema = settings.get("options.schema") ?? "?";
    } catch (e) {
        // keep "?"
    }

    return [
        `${settings.get("label")} ${settings.get("version")} (${timing.source}) · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
        `${describeBrowser()} · ${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x · ${nyt.isEnv("mobile") ? "mobile" : "desktop"} layout`,
        "",
        "Start (seconds since the page was opened)",
        `  page: html ${seconds(navigation?.domContentLoadedEventEnd)} · loaded ${seconds(navigation?.loadEventEnd)}`,
        `  assistant: code ${seconds(marks.script)} · first click ${seconds(marks.click)} · game ${seconds(marks.game)} · ${marks.failed ? `gave up ${seconds(marks.failed)}` : `ready ${seconds(marks.ready)}`}`,
        "",
        ok ? "Self check: all found ✓" : `Self check: ${problems.length} missing ✗`,
        ...problems.map(({ name, selector }) => `  ✗ ${name}: ${selector}`),
        describeToolbar(),
        `Screen in front of the game: ${nyt.isMomentShowing() ? "yes" : "no"} · Close button visible: ${nyt.findModalCloser() ? "yes" : "no"}`,
        `Browser: popover ${check("showPopover" in HTMLElement.prototype)} · anchor positioning ${check(
            !!globalThis.CSS?.supports?.("anchor-name: --a") && !!CSS.supports("position-area: block-end"),
        )} · checkVisibility ${check("checkVisibility" in Element.prototype)} · :has ${check(!!globalThis.CSS?.supports?.("selector(:has(a))"))}`,
        `Settings: schema ${schema} · dark mode ${document.body.dataset[`${settings.get("prefix")}Theme`] === "dark" ? "on" : "off"}`,
        describeGame(),
        `Outage: ${outage ? JSON.parse(outage).join("; ") : "–"}`,
        "",
        `User agent: ${navigator.userAgent}`,
    ].join("\n");
};

/**
 * Copy the report to the clipboard and say so. Without clipboard access the report goes to the console.
 * @returns {Promise<Boolean>} whether it could be copied
 */
const copy = () => {
    const text = report();
    const done = (copied) => {
        document.querySelector(`[data-ui="${settings.get("prefix")}-diagnostics"]`)?.remove();
        if (!copied) {
            console.info(text);
        }
        notice.show({
            key: "diagnostics",
            text: copied
                ? "The diagnostics have been copied to the clipboard. Paste them into your message or issue."
                : "The clipboard isn’t accessible, the diagnostics are in the browser console (F12).",
            dismissDays: 0,
        });
        return copied;
    };
    if (!navigator.clipboard?.writeText) {
        return Promise.resolve(done(false));
    }
    return navigator.clipboard.writeText(text).then(
        () => done(true),
        () => done(false),
    );
};

export default {
    report,
    copy,
};
