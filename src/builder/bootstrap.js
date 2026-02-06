import minimist from "minimist";
import config from "../config/config.json" with { type: "json" };
import pkg from "../../package.json" with { type: "json" };

const args = minimist(process.argv.slice(2));
const env =
    args["config-env"] && args["config-env"] === "prod" ? "prod" : "dev";

const outputFile = env === "dev" ? `${pkg.name}.js` : `${pkg.name}.min.js`;

const setup = {
    ...pkg,
    ...config,
    ...{ env },
    ...{
        paths: {
            input: "src/js/main.js",
            extOutput: `${config.buildPath}/${outputFile}`,
            bmlOutput: `${config.bmlPath}/${outputFile}`,
        },
    },
};

export default setup;
