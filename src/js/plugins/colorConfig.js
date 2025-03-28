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

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ColorConfig
 */
class ColorConfig extends Plugin {
    /**
     * Set hue and saturation of the dark mode theme as a body style
     * @param state
     */
    toggleColorParameters(parameters) {
        parameters = parameters || this.getColorParameters();
        console.log('toggleColorParameters',settings.get(`options.${this.key}`))
        fn.$$("[data-sba-theme]").forEach((element) => {
            element.style.setProperty("--dhue", parameters.hue);
            element.style.setProperty("--dsat", parameters.sat + "%");
        });
        return this.setColorParameters(parameters);
    }

    getColorParameters() {
        return {
            hue: settings.get(`options.${this.key}.hue`) || 0,
            sat: settings.get(`options.${this.key}.sat`) || 0,
        };
    }

    setColorParameters(parameters) {
        settings.set(`options.${this.key}`, parameters);
        console.log('setColorParameters', settings.set(`options.${this.key}`))
        return this;
    }

    /**
     * Toggle pop-up
     * @param state
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

        this.shortcuts = [{
            combo: "Shift+Alt+K",
            method: "togglePopup"
        }]


        this.toggleColorParameters();
    }
}

export default ColorConfig;
