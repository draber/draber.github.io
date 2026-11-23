/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import nyt from "../nyt/nyt.js";
import settings from "./settings.js";
import timing from "../utils/timing.js";

/**
 * Diagnostics for bug reports: "Report the problem" in the outage notice opens a new GitHub issue with a report attached.
 *
 * The report starts with what doesn't work, then a little context.
 * Only harmless facts: versions, what's missing, when, and counts.
 * Never words of the game, ids, cookies or storage contents, the issue is public.
 */

/**
 * The assistant is considered late when it is ready this much later than the game, in milliseconds
 * @type {Number}
 */
const lateAfter = 3000;

/**
 * Seconds with one decimal, or a dash
 * @param {Number|undefined} ms
 * @returns {String}
 */
const seconds = (ms) => (typeof ms === "number" && ms > 0 ? `${(ms / 1000).toFixed(1)}s` : "–");

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
        browser = match ? `${{ Edg: "Edge", Version: "Safari" }[match[1]] || match[1]} ${match[2]}` : "unknown browser";
    }
    const platform = navigator.userAgentData?.platform || (ua.match(/Android|iPhone|iPad|Windows|Mac OS X|Linux/) || ["unknown platform"])[0];
    return `${browser} · ${platform}`;
};

/**
 * Browser features the assistant relies on
 * @returns {Object<String, Boolean>}
 */
const features = () => ({
    popover: "showPopover" in HTMLElement.prototype,
    "anchor positioning": !!globalThis.CSS?.supports?.("anchor-name: --a") && !!CSS.supports("position-area: block-end"),
    checkVisibility: "checkVisibility" in Element.prototype,
    ":has()": !!globalThis.CSS?.supports?.("selector(:has(a))"),
});

/**
 * Everything that doesn't work or looks odd, empty if nothing does
 * @returns {String[]}
 */
const problems = () => {
    const found = [];
    const { marks } = timing;
    const outage = document.body.dataset[`${settings.get("prefix")}Outage`];

    if (outage) {
        JSON.parse(outage).forEach((problem) => found.push(`didn't start: ${problem}`));
    } else {
        nyt.selfCheck().problems.forEach(({ selector, impact }) => found.push(`${selector} not found (${impact})`));
    }

    const toolbar = nyt.getToolbar();
    if (!toolbar) {
        found.push(`toolbar not found (${nyt.selectors.toolbar})`);
    }
    if (marks.ready) {
        const button = document.querySelector(`button[data-ui="menu"]`);
        if (!button) {
            found.push("menu button missing");
        } else if (toolbar && !toolbar.contains(button)) {
            found.push("menu button not in the toolbar");
        }
        if (marks.game && marks.ready - marks.game > lateAfter) {
            found.push(`assistant ready ${seconds(marks.ready - marks.game)} after the game`);
        }
    } else if (!marks.failed) {
        found.push(nyt.isMomentShowing() ? "assistant still waiting, a screen is in front of the game" : "assistant hasn't started");
    }

    Object.entries(features())
        .filter(([, supported]) => !supported)
        .forEach(([feature]) => found.push(`browser doesn't support ${feature}`));

    return found;
};

/**
 * The report
 * @returns {String}
 */
const report = () => {
    const navigation = performance.getEntriesByType?.("navigation")?.[0];
    const { marks } = timing;
    const list = problems();
    let game = "no data";
    try {
        const data = nyt.getGameData();
        const resultList = nyt.find("resultList");
        game = `${data.printDate}, ${resultList ? nyt.getFoundTerms(resultList).length : "?"} of ${data.answers.length} found`;
    } catch (e) {
        // keep "no data"
    }

    return [
        `${settings.get("label")} ${settings.get("version")} (${timing.source})`,
        `${describeBrowser()} · ${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x · ${nyt.isEnv("mobile") ? "mobile" : "desktop"} layout`,
        "",
        list.length ? "Problems:" : "Problems: none detected",
        ...list.map((problem) => `- ${problem}`),
        "",
        `Times: game ${seconds(marks.game)} · assistant ${marks.failed ? `gave up ${seconds(marks.failed)}` : `ready ${seconds(marks.ready)}`} · page loaded ${seconds(navigation?.loadEventEnd)}`,
        `Game: ${game} · dark mode ${document.body.dataset[`${settings.get("prefix")}Theme`] === "dark" ? "on" : "off"}`,
        `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${navigator.userAgent}`,
    ].join("\n");
};

/**
 * Title of the issue: given by the user, unless the assistant didn't start
 * @returns {String}
 */
const defaultTitle = () =>
    document.body.dataset[`${settings.get("prefix")}Outage`] ? `SBA ${settings.get("version")} doesn't start` : "";

/**
 * Link to a new GitHub issue: room for the description at the top, the report below
 * @param {String} [title]
 * @returns {String}
 */
const issueUrl = (title = defaultTitle()) => {
    const body = ["**What happened?**", "", "", "", "---", "Diagnostics (please leave as is):", "```", report(), "```"].join("\n");
    return `${settings.get("issues")}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
};

/**
 * `sbaDiagnostics()` in the console prints the report.
 * Independent of the app and available as soon as the code runs: diagnostics are needed
 * when the assistant doesn't work. Adding it twice (extension and bookmarklet) replaces the first one.
 */
const listen = () => {
    window[`${settings.get("prefix")}Diagnostics`] = () => report();
};

export default {
    problems,
    report,
    issueUrl,
    listen,
};
