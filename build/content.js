(() => {
    const id = 'spelling-bee-assistant';
    const inject = () => {
        if (document.getElementById(id)) {
            return;
        }
        const el = document.createElement('script');
        el.async = true;
        el.src = chrome.runtime.getURL('spelling-bee-assistant.min.js');
        el.id = id;
        (document.body || document.documentElement).append(el);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject, { once: true });
    } else {
        inject();
    }
})();