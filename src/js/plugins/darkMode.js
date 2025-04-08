/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import settings from "../modules/settings.js";
import pluginRegistry from "../modules/pluginRegistry.js";
import Plugin from "../modules/plugin.js";
import Popup from "./popup.js";
import { getToggleButton, getHive } from "../modules/helpers.js";
import { prefix } from "../modules/string.js";

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DarkMode
 */
class DarkMode extends Plugin {
    /**
     * Build the swatches widget
     * @returns {HTMLElement}
     */
    getSwatches() {
        const swatches = fn.ul({
            classNames: [prefix("swatches", "d")],
        });

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 25;
            swatches.append(
                fn.li({
                    content: [
                        fn.input({
                            attributes: {
                                name: "color-picker",
                                type: "radio",
                                value: hue,
                                checked: hue === this.getColorParameters().hue,
                                id: prefix("h" + hue),
                            },
                            events: {
                                change: () => {
                                    this.toggleColorParameters({
                                        hue,
                                        sat,
                                    });
                                },
                            },
                        }),
                        fn.label({
                            attributes: {
                                htmlFor: prefix("h" + hue),
                            },
                            style: {
                                background: `hsl(${hue}, ${sat}%, 22%)`,
                            },
                        }),
                    ],
                })
            );
        }
        return swatches;
    }

    /**
     * Creates a toggle button for dark mode.
     * @returns {HTMLElement}
     */
    getToggleButton() {
        const labelAction = () => (this.getState() ? "Disable" : "Enable");
        return getToggleButton(
            prefix(`${this.key}-toggle`, "d"),
            this.getState(),
            (event) => {
                this.toggle(event.target.checked);
                const label = fn.$("label", event.target.parentElement);
                label.textContent = labelAction();
            },
            labelAction(),
            "before"
        );
    }

    /**
     * Creates an SVG element representing a hive cell.
     * This is used as a visual element in the dark mode popup.
     * @returns {HTMLElement}
     */
    getHive() {
        return fn.div({
            classNames: ["hive"],
            content: [
                fn.svg({
                    classNames: ["hive-cell", "outer"],
                    attributes: {
                        viewBox: `0 0 24 21`,
                    },
                    isSvg: true,
                    content: [
                        fn.path({
                            classNames: ["cell-fill"],
                            isSvg: true,
                            attributes: {
                                d: "M18 21H6L0 10.5 6 0h12l6 10.5z",
                            },
                        }),
                        fn.text({
                            classNames: ["cell-letter"],
                            attributes: {
                                x: "50%",
                                y: "50%",
                                dy: "0.35em",
                            },
                            isSvg: true,
                            content: "s",
                        }),
                    ],
                }),
            ],
        });
    }

    /**
     * Applies the hue and saturation parameters of the dark mode theme
     * as CSS custom properties to all elements with the `data-sba-theme` attribute.
     * If no parameters are provided, the currently stored settings will be used.
     *
     * @param {{ hue: number, sat: number }} [parameters] - Object containing hue and saturation values.
     * @returns {this} Returns the current instance for method chaining.
     */
    toggleColorParameters(parameters) {
        parameters = parameters || this.getColorParameters();
        fn.$$("[data-sba-theme]").forEach((element) => {
            element.style.setProperty("--dhue", parameters.hue);
            element.style.setProperty("--dsat", parameters.sat + "%");
        });
        return this.setColorParameters(parameters);
    }

    /**
     * Retrieves the currently stored hue and saturation parameters from settings.
     *
     * @returns {{ hue: number, sat: number }} The current color parameters.
     */
    getColorParameters() {
        return {
            hue: settings.get(`options.${this.key}.hue`) || 0,
            sat: settings.get(`options.${this.key}.sat`) || 0,
        };
    }

    /**
     * Stores the provided hue and saturation parameters into the settings.
     *
     * @param {{ hue: number, sat: number }} parameters - The color parameters to store.
     * @returns {this} Returns the current instance for method chaining.
     */
    setColorParameters(parameters) {
        const merged = { ...settings.get(`options.${this.key}`), ...parameters };
        settings.set(`options.${this.key}`, merged);
        return this;
    }

    /**
     * Toggle pop-up
     * @returns {ColorConfig}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.toggle(true);   
        fn.$('.sba-color-selector .hive', this.popup.ui).dataset[prefix("theme")] = "dark";
        fn.$("input:checked", this.popup.ui).focus();
    }
    /**
     * Toggle dark mode
     * @param state
     * @returns {DarkMode}
     */
    toggle(state) {
        super.toggle(state);
        document.body.dataset[prefix("theme")] = state ? "dark" : "light";
        return this;
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Dark Mode", "Apply a dark theme of your choice", {
            canChangeState: true,
            defaultState: false,
        });

        this.toggle(this.getState());
        this.toggleColorParameters();

        this.menuAction = "popup";
        this.menuIcon = "null";

        this.popup = new Popup(this.app, this.key)
            .setContent("title", this.title)
            .setContent("subtitle", this.description)
            .setContent(
                "body",
                fn.div({
                    classNames: [prefix("color-selector", "d")],
                    content: [this.getSwatches(), getHive()],
                })
            );
            
        const header = fn.$(".sb-modal-header", this.popup.ui);
        const wrap = fn.div({
            classNames: [prefix("header-wrap", "d")],
            content: [fn.$(".sb-modal-title", header), this.getToggleButton()],
        });
        header.prepend(wrap);

        this.shortcuts = [
            {
                combo: "Shift+Alt+D",
                method: "toggle",
                label: "Dark Mode",
            },
            {
                combo: "Shift+Alt+K",
                method: "togglePopup",
                label: "Dark Mode Colors",
            },
        ];
    }
}

export default DarkMode;
