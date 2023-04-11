import cleanup from "rollup-plugin-cleanup";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-import-css";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import svg from "rollup-plugin-svg-import";
import terser from "@rollup/plugin-terser";
import manifestBuilder from "./manifest-builder.js";
import contentFileBuilder from "./content-file-builder.js";
import setup from "./bootstrap.js";

const plugins = [
    cleanup(),
    css(),
    commonjs(),
    contentFileBuilder(),
    json(),
    manifestBuilder(),
    resolve(),
    svg({ stringify: true }),
];

if (setup.env === "prod") {
    plugins.push(terser());
}

export default {
    input: setup.paths.input,
    plugins,
    output: {
        file: setup.paths.extOutput,
        format: "iife",
    },
};
