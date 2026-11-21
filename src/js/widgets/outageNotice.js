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
        // no promises: when this shows, nobody knows about the problem yet
        text: "can’t run right now. There have been changes to the Spelling Bee page and the assistant needs an update.",
        links: [{ href: diagnostics.issueUrl(), text: "Report the problem" }],
    });
};

export default {
    show,
};
