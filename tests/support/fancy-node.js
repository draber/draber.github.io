/**
 * fancy-node exports a Proxy that returns an element factory for *any* property, `then` included.
 * Test runners treat such a module as a Promise and wait forever. This wrapper hides the properties
 * module loaders probe. The Rollup build is not affected.
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const fn = require("fancy-node");
const probed = ["then", "default", "__esModule"];

export default new Proxy(
    {},
    {
        get(target, prop) {
            if (typeof prop === "symbol" || probed.includes(prop)) {
                return undefined;
            }
            return fn[prop];
        },
    },
);

export const create = fn.create;
