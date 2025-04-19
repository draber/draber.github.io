/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

// newItems.js
// Controls when "new" feature markers (like red dots or icons) are shown for a specific release

import settings from "../modules/settings.js";

// settings cannot handle literal dots in keys since they are seen as split mark
// also we're only interested in major.feature, not in .bug
const versionToString = (version) => version.split(".").slice(0, 2).join("-");

const currentVersion = settings.get('options.version') || '0';
const versionKey = `newItems-${versionToString(currentVersion)}`;
const maxDays = 4;

// Manually enable/disable the mechanism
const isActive = true;

/**
 * Check whether the "new" features for this version should still be shown.
 * Returns false if already seen or expired, true otherwise.
 */
const shouldHighlightNewItems = () => {
    if (!isActive) {
        return false;
    }

    const { seen, installDate } = settings.get(`options.${versionKey}`) || {};

    if (seen === true) {
        return false;
    }

    if (typeof installDate === "number") {
        const now = Date.now();
        const days = (now - installDate) / (1000 * 60 * 60 * 24);
        if (days >= maxDays) {
            markSeen();
            return false;
        }
    }

    return true;
};

/**
 * Mark the new items as seen by the user (e.g. menu opened)
 */
const markSeen = () => {
    settings.set(`options.${versionKey}.seen`, true);
};

/**
 * Set the install date if not already recorded
 */
const ensureInstallDate = () => {
    const existing = settings.get(`options.${versionKey}.installDate`);
    if (typeof existing !== "string") {
        settings.set(`options.${versionKey}.installDate`, Date.now());
    }
};

export default {
    isActive,
    shouldHighlightNewItems,
    markSeen,
    ensureInstallDate,
};
