import fs from "fs";
import path from "path";
import setup from "./bootstrap.js";

const assetDir = path.dirname(setup.paths.bmlOutput);

if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
}

fs.copyFile(setup.paths.extOutput, setup.paths.bmlOutput, (err) => {
    if (err) {
        return console.error(err);
    }
});
