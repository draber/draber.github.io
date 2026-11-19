/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import settings from "../modules/settings.js";

/**
 * Notice shown instead of the assistant when the NYT page has changed in a way SBA can't handle.
 *
 * Everything here must work on a page SBA doesn't understand anymore:
 * - it lives in the top layer (popover), not in the NYT DOM, which may have changed or be re-rendered
 * - the styles are inline, SBA's stylesheet isn't loaded in this case
 * - it only uses `document.body`
 */

/**
 * Key in localStorage, the notice is dismissed for the day
 * @type {String}
 */
const dismissKey = `${settings.get("prefix")}-outage-dismissed`;

/**
 * Today as YYYY-MM-DD
 * @returns {String}
 */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Whether the user has closed the notice today
 * @returns {Boolean}
 */
const isDismissed = () => {
    try {
        return localStorage.getItem(dismissKey) === today();
    } catch (e) {
        return false;
    }
};

/**
 * Remember that the user has closed the notice today
 */
const dismiss = () => {
    try {
        localStorage.setItem(dismissKey, today());
    } catch (e) {
        // private mode or storage disabled, the notice will show again on reload
    }
};

/**
 * Link to a new GitHub issue with the details a fix needs
 * @param {String[]} problems
 * @returns {String}
 */
const reportUrl = (problems) => {
    const title = `SBA ${settings.get("version")} doesn't start`;
    const body = [
        `Version: ${settings.get("version")}`,
        `Date: ${today()}`,
        `Browser: ${navigator.userAgent}`,
        `Viewport: ${window.innerWidth}px`,
        "",
        "Not found or failed:",
        ...problems.map((problem) => `- ${problem}`),
    ].join("\n");
    return `${settings.get("issues")}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
};

/**
 * Show the notice
 * @param {String[]} problems what's missing or failed, for the console and the report
 * @returns {HTMLElement|null} the notice, null if it has been dismissed today
 */
const show = (problems) => {
    console.warn(
        `${settings.get("label")} ${settings.get("version")} can't run on this version of the NYT page:\n` +
            problems.map((problem) => `- ${problem}`).join("\n"),
    );
    document.body.dataset[`${settings.get("prefix")}Outage`] = JSON.stringify(problems);

    if (isDismissed() || document.querySelector(`[data-ui="${settings.get("prefix")}-outage"]`)) {
        return null;
    }

    const link = (href, text) =>
        fn.a({
            content: text,
            attributes: { href, target: "_blank", rel: "noopener" },
            style: { color: "inherit", textDecoration: "underline", marginRight: "16px" },
        });

    const notice = fn.div({
        attributes: { popover: "manual", role: "status" },
        data: { ui: `${settings.get("prefix")}-outage` },
        style: {
            position: "fixed",
            inset: "auto 16px auto auto",
            top: "16px",
            margin: "0",
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "14px 40px 14px 16px",
            border: "1px solid #ccc",
            borderLeft: "6px solid #f7da21",
            borderRadius: "6px",
            background: "#fff",
            color: "#121212",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            font: "15px/1.4 nyt-franklin, Helvetica, Arial, sans-serif",
            textAlign: "left",
        },
        content: [
            fn.strong({
                content: settings.get("label"),
                style: { display: "block", marginBottom: "4px" },
            }),
            fn.p({
                content:
                    "can’t run right now. There have been changes to the Spelling Bee page and the assistant needs an update. A fix is on the way!",
                style: { margin: "0 0 8px" },
            }),
            fn.p({
                content: [link(settings.get("url"), "News and updates"), link(reportUrl(problems), "Report the problem")],
                style: { margin: "0", fontSize: "13px" },
            }),
            fn.button({
                content: "×",
                attributes: { type: "button", title: "Close" },
                aria: { label: "Close" },
                style: {
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    border: "0",
                    background: "none",
                    color: "inherit",
                    font: "300 26px/1 Helvetica, Arial, sans-serif",
                    cursor: "pointer",
                    padding: "0 4px",
                },
                events: {
                    click: () => {
                        dismiss();
                        notice.remove();
                    },
                },
            }),
        ],
    });

    document.body.append(notice);
    notice.showPopover?.();
    return notice;
};

export default {
    show,
};
