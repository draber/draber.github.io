/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fs from "fs";
import chalk from "chalk";
import minimist from "minimist";

const args = minimist(process.argv.slice(2));

/**
 * Mode, one variable for all cases
 * - dev  (default): CSS, unminified JS
 * - prod (-p):      CSS, unminified and minified JS, extension zip
 * - watch (-w):     like dev, then rebuilds on changes
 */
export const mode = args.w ? "watch" : args.p ? "prod" : "dev";

/**
 * Read a JSON file. Read on every build rather than imported once, so that the watcher sees changes
 * @param {String} file
 * @returns {Object}
 */
export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/**
 * Package data merged with src/config/config.json, read fresh for each build
 * @returns {Object}
 */
export const getSetup = () => ({
    ...readJson("./package.json"),
    ...readJson("./src/config/config.json"),
});

/**
 * Files and folders used by more than one builder
 */
export const config = {
    // shared by CSS and JS, a change here rebuilds both
    breakpoints: "./src/config/breakpoints.json",
};

/**
 * Colored logger with a fixed format, `logger.success("CSS: done")`
 */
export const logger = (() => {
    const colors = {
        error: "#FF5E5B",
        warn: "#FFBA5B",
        info: "#699cea",
        success: "#ACDB4E",
        log: "#FFFFFF",
    };

    function format(arg, color) {
        if (arg instanceof Error) {
            return chalk.hex(color)(arg.stack || arg.message);
        }
        if (typeof arg === "object") {
            return chalk.hex(color)(JSON.stringify(arg, null, 2));
        }
        const argArr = String(arg).split(":");
        if (argArr.length < 2) {
            return chalk.hex(color)(arg);
        }
        const type = chalk.hex("#fff")((argArr.shift() + ":").padEnd(9, " "));
        const msg = chalk.hex(color)(argArr.join(":"));
        return `${type} ${msg}`;
    }

    const fn = {};
    for (const [type, color] of Object.entries(colors)) {
        fn[type] = (...args) => {
            const log = console[type] ? console[type] : console.log;
            log(...args.map((arg) => format(arg, color)));
        };
    }
    return fn;
})();
