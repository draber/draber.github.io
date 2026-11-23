/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * PostCSS plugin: named media queries from a JSON file
 *
 * breakpoints.json:   { "--config-small-screen": "(max-width: 767.98px)" }
 * CSS:                @media (--config-small-screen) { ... }
 * Output:             @media (max-width: 767.98px) { ... }
 * JS:                 matchMedia(breakpoints["--config-small-screen"])
 *
 * Same idea as the spec's @custom-media, with the definitions in JSON so JS can read them too.
 * Unknown names fail the build instead of silently never matching. Must run after postcss-import
 * so imported files are covered.
 */
import fs from "fs";

export default function breakpointProvider({ file }) {
    return {
        postcssPlugin: "postcss-sba-breakpoints",
        Once(root) {
            const queries = JSON.parse(fs.readFileSync(file, "utf8"));

            root.walkAtRules("media", (rule) => {
                rule.params = rule.params.replace(/\(\s*(--[\w-]+)\s*\)/g, (match, name) => {
                    if (!(name in queries)) {
                        throw rule.error(`Unknown media query "${name}" in ${file}`);
                    }
                    return queries[name];
                });
            });
        },
    };
}
breakpointProvider.postcss = true;
