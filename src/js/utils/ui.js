/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import { prefix } from "./string.js";

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