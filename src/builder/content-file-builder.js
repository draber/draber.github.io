import path from "path";
import setup from "./bootstrap.js";

const content = `window.addEventListener('load', () => {
    const el = document.createElement('script');
    el.async = true;
    el.src = chrome.runtime.getURL('${path.basename(setup.paths.extOutput)}');
    el.id = '${setup.name}';
    setTimeout(() => {
        document.body.append(el);
    }, 1500)
})`;

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
