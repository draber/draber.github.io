/**
 * Content script of the extension, adds the assistant as soon as the HTML is there. It waits for the game itself
 * (see nyt.waitForResultList()), so there's no need to wait for the page's `load` event, which can take many
 * seconds (ads, trackers).
 * @param {Object} setup package.json and config.json, see bootstrap.getSetup()
 * @param {String} scriptFile name of the script the extension loads
 * @returns {String}
 */
const getContent = (setup, scriptFile) => `(() => {
    const id = '${setup.name}';
    const inject = () => {
        if (document.getElementById(id)) {
            return;
        }
        const el = document.createElement('script');
        el.async = true;
        el.src = chrome.runtime.getURL('${scriptFile}');
        el.id = id;
        (document.body || document.documentElement).append(el);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject, { once: true });
    } else {
        inject();
    }
})();`;

/**
 * Rollup plugin, writes content.js next to the script
 * @param {Object} setup
 * @param {String} scriptFile
 */
function contentFileBuilder(setup, scriptFile) {
    return {
        name: "content-file-builder",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "content.js",
                source: getContent(setup, scriptFile),
            });
        },
    };
}

export default contentFileBuilder;
