/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import sprite from "../assets/icons.svg";
import { prefix } from "./string.js";

/**
 * All icons of the assistant, one way: symbols in src/js/assets/icons.svg, used with <use>.
 *
 * The sprite goes into the page once, hidden, the first time an icon is needed. It stays when the assistant
 * is removed, it's invisible and costs nothing. Colours: icons take the `fill` of the surrounding <svg>
 * from the CSS; yellow and red parts use --sba-yellow and --sba-red (custom properties reach into <use>,
 * selectors don't).
 */

/**
 * Class of the sprite's <svg>, `sba-symbols`
 * @type {String}
 */
const spriteClass = prefix("symbols", "d");

/**
 * Put the sprite into the page, unless it's there already
 */
const ensureSprite = () => {
    if (!document.querySelector(`svg.${spriteClass}`)) {
        document.body.append(fn.toNode(sprite));
    }
};

/**
 * Id of a symbol, `sba-icon-grid` for `grid`
 * @param {String} name
 * @returns {String}
 */
const symbolId = (name) => `${prefix("icon", "d")}-${name}`;

/**
 * An icon from the sprite
 * @param {String} name e.g. `grid`, see the ids in icons.svg
 * @returns {SVGElement} <svg aria-hidden="true"><use href="#sba-icon-grid"/></svg>
 */
const icon = (name) => {
    ensureSprite();
    return fn.svg({
        isSvg: true,
        attributes: {
            focusable: "false",
        },
        aria: {
            hidden: "true",
        },
        content: fn.use({
            isSvg: true,
            attributes: {
                href: `#${symbolId(name)}`,
            },
        }),
    });
};

export default icon;
export { symbolId };
