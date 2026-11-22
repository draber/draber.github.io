import fs from "fs";
import path from "path";

/**
 * Builds the extension's manifest.json
 * @param {Object} setup package.json and config.json, see bootstrap.getSetup()
 * @param {String} scriptFile name of the script the extension loads
 * @returns {Object}
 */
const getManifest = (setup, scriptFile) => {
    const target = new URL(setup.targetUrl);
    return {
        manifest_version: 3,
        name: setup.label,
        description: setup.description,
        homepage_url: setup.url,
        version: setup.version,
        content_scripts: [
            {
                matches: [`${target.href}*`],
                js: ["content.js"],
                run_at: "document_start",
            },
        ],
        icons: fs
            .readdirSync(`${setup.buildPath}/assets`)
            .filter((file) => path.extname(file) === ".png" && /(\d+)/.test(file))
            .reduce((result, file) => {
                let key = file.match(/(\d+)/).shift();
                result[key] = `assets/${path.basename(file)}`;
                return result;
            }, {}),
        web_accessible_resources: [
            {
                resources: [scriptFile],
                matches: [`${target.origin}/*`],
            },
        ],
        host_permissions: [`${target.origin}/*`],
    };
};

/**
 * Rollup plugin, writes manifest.json next to the script
 * @param {Object} setup
 * @param {String} scriptFile
 */
function manifestBuilder(setup, scriptFile) {
    return {
        name: "manifest-builder",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "manifest.json",
                source: JSON.stringify(getManifest(setup, scriptFile), null, "\t"),
            });
        },
    };
}

export default manifestBuilder;
