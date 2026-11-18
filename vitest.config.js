import { defineConfig } from "vitest/config";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Load SVG and CSS files as strings, the way the Rollup build does
 */
const rawText = () => ({
    name: "raw-text",
    enforce: "pre",
    load(id) {
        const file = id.split("?")[0];
        if (/\.(svg|css)$/.test(file)) {
            return `export default ${JSON.stringify(fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "")};`;
        }
    },
});

export default defineConfig({
    plugins: [rawText()],
    resolve: {
        alias: {
            "fancy-node": fileURLToPath(new URL("./tests/support/fancy-node.js", import.meta.url)),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./tests/support/setup.js"],
        include: ["tests/**/*.test.js"],
    },
});
