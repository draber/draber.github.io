/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import settings from "../modules/settings.js";

/**
 * Small notice in the top right corner, e.g. when the assistant can't start or the browser is too old.
 *
 * Everything here must also work when SBA itself doesn't run:
 * - it lives in the top layer (popover), not in the page's DOM, which may have changed or be re-rendered
 * - the styles are inline, SBA's stylesheet may not be loaded
 * - it only uses `document.body`
 */

/**
 * Date as YYYY-MM-DD
 * @param {Number} [days=0] from today
 * @returns {String}
 */
const isoDate = (days = 0) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

/**
 * Key in localStorage, holds the last day the notice stays dismissed
 * @param {String} key
 * @returns {String}
 */
const storageKey = (key) => `${settings.get("prefix")}-${key}-dismissed`;

/**
 * Whether the user has closed the notice and it should still stay away
 * @param {String} key
 * @returns {Boolean}
 */
const isDismissed = (key) => {
    try {
        const until = localStorage.getItem(storageKey(key));
        return !!until && until >= isoDate();
    } catch (e) {
        return false;
    }
};

/**
 * Remember that the user has closed the notice
 * @param {String} key
 * @param {Number} days 1: for the rest of today
 */
const dismiss = (key, days) => {
    try {
        localStorage.setItem(storageKey(key), isoDate(days - 1));
    } catch (e) {
        // private mode or storage disabled, the notice will show again on reload
    }
};

/**
 * Show a notice
 * @param {Object} options
 * @param {String} options.key identifies the notice, e.g. "outage"
 * @param {String} options.text what the notice says, after the assistant's name
 * @param {Array<{href?: String, onClick?: Function, text: String}>} [options.links] a link or an action
 * @param {Number} [options.dismissDays=1] how long a closed notice stays away, 1 is the rest of today
 * @returns {HTMLElement|null} the notice, null if it has been dismissed or is already there
 */
const show = ({ key, text, links = [], dismissDays = 1 }) => {
    const ui = `${settings.get("prefix")}-${key}`;
    if (isDismissed(key) || document.querySelector(`[data-ui="${ui}"]`)) {
        return null;
    }

    const link = ({ href, onClick, text }) =>
        fn.a({
            content: text,
            attributes: onClick ? { href: "#", role: "button" } : { href, target: "_blank", rel: "noopener" },
            style: { color: "inherit", textDecoration: "underline", marginRight: "16px" },
            events: onClick
                ? {
                      click: (evt) => {
                          evt.preventDefault();
                          onClick();
                      },
                  }
                : {},
        });

    const notice = fn.div({
        attributes: { popover: "manual", role: "status" },
        data: { ui },
        style: {
            position: "fixed",
            inset: "auto 16px auto auto",
            top: "16px",
            margin: "0",
            boxSizing: "border-box",
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
                content: text,
                style: { margin: links.length ? "0 0 8px" : "0" },
            }),
            ...(links.length
                ? [
                      fn.p({
                          content: links.map(link),
                          style: { margin: "0", fontSize: "13px" },
                      }),
                  ]
                : []),
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
                        dismiss(key, dismissDays);
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
