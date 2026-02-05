import fs from "fs";
import path from "path";
import setup from "./bootstrap.js";

const target = new URL(setup.targetUrl);

const manifest = {
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
      resources: [path.basename(setup.paths.extOutput)],
      matches: [`${target.origin}/*`],
    },
  ],
  host_permissions: [`${target.origin}/*`],
};

function manifestBuilder() {
  return {
    name: "manifest-builder",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, "\t"),
      });
    },
  };
}

export default manifestBuilder;
