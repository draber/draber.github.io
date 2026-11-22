/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { rollup } from "rollup";
import cleanup from "rollup-plugin-cleanup";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-import-css";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import svg from "rollup-plugin-svg-import";
import terser from "@rollup/plugin-terser";
import manifestBuilder from "./manifest-builder.js";
import contentFileBuilder from "./content-file-builder.js";
import { logger, mode, getSetup } from "./bootstrap.js";

export const id = "JS";
export const dirs = {
    in: "./src/js",
};
const input = `${dirs.in}/main.js`;

/**
 * Script files of this run: unminified always, minified in prod.
 * The last one is the one the extension loads (manifest.json, content.js).
 * @param {Object} setup
 * @returns {{file: String, minify: Boolean}[]}
 */
export const getVariants = (setup) => {
    const variants = [{ file: `${setup.name}.js`, minify: false }];
    if (mode === "prod") {
        variants.push({ file: `${setup.name}.min.js`, minify: true });
    }
    return variants;
};

/**
 * Builds src/js/main.js into build/, one variant after the other
 * @returns {Promise<void>} rejects when the build fails
 */
export async function build() {
    const setup = getSetup();
    const variants = getVariants(setup);
    const loaded = variants[variants.length - 1].file;

    for (const variant of variants) {
        const extensionFiles = variant.file === loaded;
        const plugins = [
            cleanup(),
            css(),
            commonjs(),
            extensionFiles && contentFileBuilder(setup, loaded),
            json(),
            extensionFiles && manifestBuilder(setup, loaded),
            resolve(),
            svg({ stringify: true }),
            variant.minify && terser(),
        ].filter(Boolean);

        const outFile = `${setup.buildPath}/${variant.file}`;
        const bundle = await rollup({
            input,
            plugins,
            onwarn: (warning) => logger.warn(`${id}: ${warning.message}`),
        });
        try {
            await bundle.write({ file: outFile, format: "iife" });
        } finally {
            await bundle.close();
        }
        logger.success(`${id}: ${input} -> ${outFile}`);
    }
}
