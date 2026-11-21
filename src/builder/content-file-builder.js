import path from "path";
import setup from "./bootstrap.js";

// Adds the assistant as soon as the HTML is there. It waits for the game itself (see nyt.waitForResultList()),
// so there's no need to wait for the page's \`load\` event, which can take many seconds (ads, trackers).
const content = `(() => {
    const id = '${setup.name}';
    const inject = () => {
        if (document.getElementById(id)) {
            return;
        }
        const el = document.createElement('script');
        el.async = true;
        el.src = chrome.runtime.getURL('${path.basename(setup.paths.extOutput)}');
        el.id = id;
        (document.body || document.documentElement).append(el);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject, { once: true });
    } else {
        inject();
    }
})();`;

function contentFileBuilder() {
    return {
        name: "content-file-builder",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "content.js",
                source: content,
            });
        },
    };
}

export default contentFileBuilder;
