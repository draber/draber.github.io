/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * runner.js – runs the builders one after the other in a single process, and the watcher
 *
 * npm run dev    CSS -> JS -> copy to assets/js
 * npm run build  CSS -> JS (unminified and minified) -> copy to assets/js -> zip
 * npm run watch  like dev, then rebuilds on changes
 *
 * The order matters: the JS embeds the CSS, the bookmarklet copy and the zip take the finished JS.
 */
import path from "path";
import chokidar from "chokidar";
import { mode, logger, config } from "./bootstrap.js";
import * as css from "./cssBuilder.js";
import * as js from "./jsBuilder.js";
import * as copy from "./copyBuilder.js";
import * as zip from "./zipBuilder.js";

const builders = mode === "prod" ? [css, js, copy, zip] : [css, js, copy];

/**
 * Runs the given builders in order, stops at the first error
 * @param {Object[]} list
 * @returns {Promise<Boolean>} true when all of them succeeded
 */
async function run(list) {
    for (const builder of list) {
        try {
            await builder.build();
        } catch (err) {
            logger.error(`${builder.id}: Build failed`, err);
            return false;
        }
    }
    return true;
}

/**
 * Small debounce helper
 */
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

if (mode === "watch") {
    await run(builders);

    const resolved = (dir) => path.resolve(dir) + path.sep;
    const isIn = (file, dir) => path.resolve(file).startsWith(resolved(dir));

    // the CSS build writes into src/js, that's not a change to react to
    const cssOutput = path.resolve("./src/js/assets/app.css");
    const watchPaths = [css.dirs.in, js.dirs.in, "./src/config", "./package.json"].map((p) => path.resolve(p));

    // a change to CSS needs the JS too, the JS embeds the CSS; breakpoints.json is read by both
    const buildersFor = (file) => {
        if (isIn(file, css.dirs.in) || path.resolve(file) === path.resolve(config.breakpoints)) {
            return [css, js, copy];
        }
        return [js, copy];
    };

    // one rebuild at a time; changes during a rebuild are collected and built afterwards
    let pending = new Set();
    let running = false;
    const rebuild = debounce(async () => {
        if (running) {
            return;
        }
        running = true;
        while (pending.size) {
            const files = [...pending];
            pending = new Set();
            const needed = new Set(files.flatMap(buildersFor));
            logger.info(`Watch: ${files.map((f) => path.relative(".", f)).join(", ")}`);
            await run(builders.filter((b) => needed.has(b)));
        }
        running = false;
    }, 200);

    const onChange = (file) => {
        if (path.resolve(file) === cssOutput) {
            return;
        }
        pending.add(file);
        rebuild();
    };

    chokidar
        .watch(watchPaths, { ignoreInitial: true, persistent: true })
        .on("change", onChange)
        .on("add", onChange)
        .on("unlink", onChange)
        .on("error", (err) => logger.error("Watch: watcher failed", err))
        .on("ready", () => logger.info("Watch: waiting for changes in src/css, src/js, src/config, package.json"));
} else {
    if (!(await run(builders))) {
        process.exitCode = 1;
    }
}
