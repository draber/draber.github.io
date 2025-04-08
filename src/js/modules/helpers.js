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
    const toggle = fn.input({
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
        return toggle;
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
            label.append(toggle);
            label.classList.add(prefix("toggle-container", "d"));
            return label;
        case "before":
            return fn.span({
                classNames: [prefix("toggle-container", "d")],
                content: [label, toggle],
            });
        case "after":
            return fn.span({
                classNames: [prefix("toggle-container", "d")],
                content: [toggle, label],
            });
    }
};

/**
 * Build a static SVG representation of the spelling bee hive.
 * Center letter is always in the yellow hex.
 *
 * @returns {HTMLElement} SVG element containing the hive.
 */
export const getHive = () => {
    const translate = ({ x, y }) => `translate(${x} ${y})`;

    // The order of the cells in the DOM of the actual game is:
    const canonicalOrder = ["c", "nw", "n", "ne", "se", "s", "sw"];

    const hiveLayout = {
        c:  { x: 19.2,  y: 22.01 }, 
        nw: { x: 0,     y: 11.01 }, 
        n:  { x: 19.2,  y: 0.01 },
        ne: { x: 38.4,  y: 11.01 },
        se: { x: 38.4,  y: 33.01 },
        s:  { x: 19.2,  y: 44.01 },
        sw: { x: 0,     y: 33.01 },
    };

    const symbol = fn.symbol({
        isSvg: true,
        attributes: {
            id: "hive-cell"
        },
        content: fn.polygon({
            isSvg: true,
            attributes: {
                points : "18,0 24,10.39 18,20.78 6,20.78 0,10.39 6,0",
                fill: "peru"
            },
            classNames: [prefix("hive-cell", "d")],
        }),
    });

    const style = fn.style({
        isSvg: true,
        content: `text {font-family:sans-serif;font-size:12px;dominant-baseline:middle;text-anchor:middle}`,
    });

    const defs = fn.defs({
        isSvg: true,
        content: [style, symbol],
    });

    const elements = [defs];

    fn.$$(".sb-hive .hive-cell").forEach((cell, i) => {
        const orientation = canonicalOrder[i];
        elements.push(fn.g({
            isSvg: true,
            attributes: {
                transform: translate(hiveLayout[orientation]),
            },
            classNames: cell.classList,
            content: [
                fn.use({
                    isSvg: true,
                    attributes: {
                        href: `#hive-cell`,
                    }
                }),
                fn.text({
                    isSvg: true,
                    attributes: {
                        x: 0,
                        y: 0,
                    },
                    content: cell.textContent.trim(),
                }),
            ],
        }));
    });

    return fn.svg({
        isSvg: true,
        attributes: {
            viewBox: "0 0 62.4 64.8"
        },
        content: elements,
    });
};
