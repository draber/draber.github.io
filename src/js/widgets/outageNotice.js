/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";
import notice from "./notice.js";
import diagnostics from "../modules/diagnostics.js";

/**
 * Notice shown instead of the assistant when the Spelling Bee page has changed in a way SBA can't handle,
 * see widgets/notice.js. Closed, it stays away for the rest of the day.
 */

/**
 * Today as YYYY-MM-DD
 * @returns {String}
 */
const today = () => new Date().toISOString().slice(0, 10);

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
        "",
        "Diagnostics:",
        "```",
        diagnostics.report(),
        "```",
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

    return notice.show({
        key: "outage",
        text: "can’t run right now. There have been changes to the Spelling Bee page and the assistant needs an update. A fix is on the way!",
        links: [
            { href: settings.get("url"), text: "News and updates" },
            { href: reportUrl(problems), text: "Report the problem" },
            { onClick: () => diagnostics.copy(), text: "Copy diagnostics" },
        ],
    });
};

export default {
    show,
};
