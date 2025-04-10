/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import fn from "fancy-node";
import { prefix } from "../modules/string.js";

export const ui = (self) => ({

    /**
     * Build a single swatch
     * @param {Object} {{ hue: number, sat: number, lig: number }} hslObj
     * @param {String} text
     * @returns
     */
    getSwatch(hslObj, text = "") {
        const mode = self.getModeFromHsl(hslObj);
        return fn.li({
            content: [
                fn.input({
                    attributes: {
                        name: "color-picker",
                        type: "radio",
                        value: hslObj.hue,
                        checked: self.hslObjsAreEqual(hslObj, self.getColorParameters(mode)),
                        id: prefix("h" + hslObj.hue),
                    },
                    events: {
                        change: () => {
                            self.toggleColorScheme(hslObj);
                        },
                    },
                }),
                fn.label({
                    attributes: {
                        htmlFor: prefix("h" + hslObj.hue),
                    },
                    style: {
                        background: `hsl(${hslObj.hue}, ${hslObj.sat}%, ${hslObj.lig}%)`,
                    },
                    content: text,
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

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 25;
            swatches.append(self.getSwatch({hue, sat, lig: 22}));
        }
        swatches.append(self.getSwatch(this.getHslDefaults("light"), "Return to Light Mode"));
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

        fn.$$(".sb-hive .hive-cell").forEach((cell, i) => {
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
                                y: 12,
                            },
                            content: cell.textContent.trim(),
                        }),
                    ],
                })
            );
        });

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
