/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import fn from "fancy-node";
import { prefix } from "./string.js";
import hive from "../modules/hive.js";

export const ui = (self) => ({
    /**
     * Build a single swatch
     * @param {Object} scheme {{ mode: 'light' | 'dark', hsl: { hue: number, sat: number, lig: number }}}
     * @param {String} content
     * @returns
     */
    getSwatch(scheme, content = "") {
        let isCurrent = self.colorObjectsAreEqual(scheme, self.getStoredColorScheme());
        // The color for the reset swatch are always white, it stores, however, the dark mode colors along with mode = light
        let btnConfig = structuredClone(scheme);
        let background;
        if (scheme.mode === "light") {
            btnConfig.hsl = {
                hue: 360,
                sat: 100,
                lig: 100,
            };
            background = self.cssHslFromColorScheme(btnConfig);
        }
        else {
            // Here we override it with lig: 22, which is standard for hive cells,
            // to avoid overly dark tiles and improve visibility.
            background = self.cssHslFromColorScheme({
                ...scheme,
                hsl: {
                  ...scheme.hsl,
                  lig: 22,
                },
              });
        }
        return fn.li({
            content: [
                fn.input({
                    attributes: {
                        name: "color-picker",
                        type: "radio",
                        value: btnConfig.hsl.hue,
                        checked: isCurrent,
                        id: prefix("h" + btnConfig.hsl.hue),
                    },
                    events: {
                        change: () => {
                            self.applyColorScheme(scheme);
                        },
                    },
                }),
                fn.label({
                    attributes: {
                        htmlFor: prefix("h" + btnConfig.hsl.hue),
                    },
                    style: {
                        background
                    },
                    content,
                }),
            ],
        });
    },

    /**
     * Build the swatches widget
     * @returns {HTMLElement}
     */
    getSwatches() {
        const swatches = fn.ul({
            classNames: [prefix("swatches", "d")],
        });
        // @see _colors.scss [data-sba-theme] --dlig
        const lig = 7;

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 25;
            swatches.append(self.getSwatch({ mode: "dark", hsl: { hue, sat, lig } }));
        }
        // reset button
        // keeps the last color scheme but switches to 'light', i.e. disables dark mode
        const scheme = self.getStoredColorScheme(true);
        scheme.mode = "light";
        swatches.append(self.getSwatch(scheme, "Return to Light Mode"));
        return swatches;
    },

    /**
     * Build a static SVG representation of the spelling bee hive.
     * Center letter is always in the yellow hex.
     *
     * @returns {HTMLElement} SVG element containing the hive.
     */
    getHive() {
        const translate = ({ x, y }) => `translate(${x} ${y})`;

        // The order of the cells in the DOM of the actual game is:
        const canonicalOrder = ["c", "nw", "n", "ne", "se", "s", "sw"];

        const hiveLayout = {
            c: { x: 19.2, y: 22.01 },
            nw: { x: 0, y: 11.01 },
            n: { x: 19.2, y: 0.01 },
            ne: { x: 38.4, y: 11.01 },
            se: { x: 38.4, y: 33.01 },
            s: { x: 19.2, y: 44.01 },
            sw: { x: 0, y: 33.01 },
        };

        const symbol = fn.symbol({
            isSvg: true,
            attributes: {
                id: prefix("cell-tpl", "d"),
            },
            content: fn.polygon({
                isSvg: true,
                attributes: {
                    points: "18,0 24,10.39 18,20.78 6,20.78 0,10.39 6,0",
                },
            }),
        });

        const defs = fn.defs({
            isSvg: true,
            content: symbol,
        });

        const elements = [defs];

        let i = 0;
        for(const [letter, cell] of Object.entries(hive.getCells())) {
            const orientation = canonicalOrder[i];
            elements.push(
                fn.g({
                    isSvg: true,
                    attributes: {
                        transform: translate(hiveLayout[orientation]),
                    },
                    classNames: [i === 0 ? "center-cell" : "cell"].map((name) => prefix(name, "d")),
                    content: [
                        fn.use({
                            isSvg: true,
                            attributes: {
                                href: `#${prefix("cell-tpl", "d")}`,
                            },
                        }),
                        fn.text({
                            isSvg: true,
                            attributes: {
                                x: 12,
                                y: 11,
                            },
                            content: letter,
                        }),
                    ],
                })
            );
            i++;
        }

        return fn.div({
            classNames: [prefix("dark-mode-preview", "d")],
            content: fn.svg({
                isSvg: true,
                attributes: {
                    viewBox: "0 0 62.4 64.8",
                },
                content: elements,
            }),
        });
    },
});
