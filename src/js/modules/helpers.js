/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import { prefix } from "./string.js";

/**
 * Get the close button of the various pop-up formats
 * @returns {HTMLElement|Boolean}
 */
export const getPopupCloser = (app) => {
    for (let selector of [
        ".pz-moment__frame.on-stage .pz-moment__close",
        ".pz-moment__frame.on-stage .pz-moment__close_text",
        ".sb-modal-close",
    ]) {
        const closer = fn.$(selector, app.gameWrapper);
        if (closer) {
            return closer;
        }
    }
    return false;
};

export const manualDelete = () => {
    const el = document.querySelector(".hive-action__delete");
    if (!el) return;

    el.classList.add("sba-no-feedback");
    const evtOpts = { bubbles: true, cancelable: true };

    el.dispatchEvent(new Event("touchstart", evtOpts));
    setTimeout(() => {
        el.dispatchEvent(new Event("touchend", evtOpts));
        el.classList.remove("sba-no-feedback");
    }, 50);
};

/**
 * Create a visual progress bar element for a given value/max.
 * @param {number} value - The current value.
 * @param {number} max - The maximum possible value.
 * @returns {HTMLElement} A <progress> element.
 */
export const getProgressBar = (value, max) => {
    value = Math.min(Math.round((value * 100) / max), 100);

    return fn.progress({
        attributes: {
            max: 100,
            value,
            title: `Progress: ${value}%`,
        },
    });
};

export const getToggleButton = (id, checked, callback, labelText = "", labelPosition = "before") => {
    const toggleBtn = fn.input({
        attributes: {
            type: "checkbox",
            id,
            role: "switch",
            checked,
        },
        classNames: [prefix("toggle-switch", "d")],
        aria: {
            role: "switch",
        },
        events: {
            change: (event) => callback(event),
        },
    });

    if (!labelText) {
        return toggleBtn;
    }

    const label = fn.label({
        attributes: {
            htmlFor: id,
        },
        content: labelText,
        classNames: [prefix("toggle-label", "d")],
    });

    switch (labelPosition) {
        case "wrap":
            label.append(toggleBtn);
            label.classList.add(prefix("toggle-container", "d"));
            return label;
        case "before":
            return fn.span({
                classNames: [prefix("toggle-container", "d")],
                content: [label, toggleBtn],
            });
        case "after":
            return fn.span({
                classNames: [prefix("toggle-container", "d")],
                content: [toggleBtn, label],
            });
    }
};


