/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fs from "fs/promises";
import postcss from "postcss";
import atImport from "postcss-import";
import nesting from "postcss-nesting";
import cssnano from "cssnano";
import breakpointProvider from "./breakpointProvider.js";
import { logger, config } from "./bootstrap.js";

export const id = "CSS";
export const dirs = {
    in: "./src/css",
};
const input = `${dirs.in}/app.css`;

// Imported by src/js/plugins/styles.js and embedded in the script, the file is under version control
const output = "./src/js/assets/app.css";

/**
 * cssnano's lite preset leaves line breaks and indentation in selector lists, this removes them.
 * Only whitespace between selectors and runs of whitespace, nothing that changes what a selector matches.
 */
const compactSelectors = () => ({
    postcssPlugin: "postcss-sba-compact-selectors",
    Rule(rule) {
        rule.selector = rule.selectors.map((selector) => selector.replace(/\s+/g, " ").trim()).join(",");
    },
});
compactSelectors.postcss = true;

/**
 * After nesting has been resolved, no at-rule may be left inside a rule. Browsers ignore e.g. `@keyframes`
 * there, postcss-nesting leaves it where it is (Sass used to move it to the top level). Fails the build.
 */
const noAtRulesInRules = () => ({
    postcssPlugin: "postcss-sba-no-at-rules-in-rules",
    OnceExit(root) {
        root.walkAtRules((atRule) => {
            if (atRule.parent?.type === "rule") {
                throw atRule.error(`@${atRule.name} inside "${atRule.parent.selector}", move it to the top level`);
            }
        });
    },
});
noAtRulesInRules.postcss = true;

/**
 * Builds src/css/app.css and its imports into a single file.
 * Always minified: dev and prod script embed the same file.
 * @returns {Promise<void>} rejects when the build fails
 */
export async function build() {
    const src = await fs.readFile(input, "utf8");
    const result = await postcss([
        atImport(),
        breakpointProvider({ file: config.breakpoints }),
        // Nesting the way Sass did it: `.a, .b { .c {} }` becomes `.a .c, .b .c`. The current edition writes
        // `:is(.a, .b) .c` instead, which gives every selector the highest specificity of the list and would
        // change the cascade. Edition 2021 also moves declarations that follow a nested rule before it,
        // which makes no difference in our sources (checked against the former Sass output).
        nesting({ edition: "2021", noIsPseudoSelector: true }),
        noAtRulesInRules(),
        compactSelectors(),
        // whitespace and comments only: no rewriting of colors, values or rules, the output stays as written
        cssnano({ preset: "lite" }),
    ]).process(src, { from: input, to: output });
    result.warnings().forEach((warning) => logger.warn(`${id}: ${warning.toString()}`));
    await fs.writeFile(output, result.css);
    logger.success(`${id}: ${input} -> ${output}`);
}
