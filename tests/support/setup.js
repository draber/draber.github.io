import { installPopoverShim } from "./popover-shim.js";

installPopoverShim(window);

window.matchMedia ??= () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
});
window.scrollTo = () => {};
