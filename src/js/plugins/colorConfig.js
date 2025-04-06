/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import Popup from "./popup.js";
import Plugin from "../modules/plugin.js";
import { prefix } from "../modules/string.js";
import fn from "fancy-node";
import settings from "../modules/settings.js";
import pluginRegistry from "../modules/pluginRegistry.js";
import { getToggleButton } from "../modules/helpers.js";

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ColorConfig
 */
class ColorConfig extends Plugin {
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
        fn.$("input:checked", this.popup.ui).focus();
    }

    /**
     * ColorConfig constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Dark Mode Colors", "Select your favorite color scheme for the Dark Mode.", {
            canChangeState: true,
        });

        this.menuAction = "popup";
        this.menuIcon = "null";

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

        this.popup = new Popup(this.app, this.key)
            .setContent("title", this.title)
            .setContent("subtitle", this.description)
            .setContent(
                "body",
                fn.div({
                    classNames: [prefix("color-selector", "d")],
                    content: [
                        swatches,
                        fn.div({
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
                        }),
                    ],
                })
            );
        this.popup.ui.dataset[prefix("theme")] = "dark";

        app.on(prefix("pluginsReady"), () => {
            const darkMode = pluginRegistry.getPluginByKey("darkMode");
            const darkModeToggle = getToggleButton(
                prefix(`${this.key}-${darkMode.key}`, "d"),
                darkMode.isEnabled,
                (event) => {
                    darkMode.toggle(event.target.checked);
                },
                "Toggle Dark Mode",
                "before"
            );
            fn.$('.sb-modal-body', this.popup.ui).append(darkModeToggle);
        });

        this.shortcuts = [
            {
                combo: "Shift+Alt+K",
                method: "togglePopup",
            },
        ];

        this.toggleColorParameters();
    }
}

export default ColorConfig;
