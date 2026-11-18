/**
 * Minimal Popover API for jsdom, which doesn't implement it (yet).
 *
 * Covers what SBA uses:
 * - showPopover(), hidePopover(), togglePopover()
 * - `beforetoggle` and `toggle` events with `newState`/`oldState` (dispatched synchronously here)
 * - `popover="auto"`: opening one closes the other open auto popovers that don't contain it
 * - `popover="manual"`: only closes explicitly
 * - buttons with `popovertarget` toggle their target
 * - Escape closes the topmost auto popover
 * - a click outside (pointerdown + pointerup) closes auto popovers ("light dismiss");
 *   the invoking button of a popover doesn't count as outside, like in browsers
 */
export const installPopoverShim = (window) => {
    const { HTMLElement, document } = window;
    if (typeof HTMLElement.prototype.showPopover === "function") {
        return;
    }

    const open = new Set();
    const autoStack = [];

    const fire = (elem, type, oldState, newState) => {
        const evt = new window.Event(type, { cancelable: type === "beforetoggle" });
        evt.oldState = oldState;
        evt.newState = newState;
        return elem.dispatchEvent(evt);
    };

    const type = (elem) => (elem.getAttribute("popover") === "manual" ? "manual" : "auto");

    function hidePopover() {
        if (!open.has(this)) {
            return;
        }
        fire(this, "beforetoggle", "open", "closed");
        open.delete(this);
        const idx = autoStack.indexOf(this);
        if (idx > -1) {
            // closing an auto popover also closes the ones opened on top of it
            autoStack.splice(idx).reverse().forEach((elem) => {
                if (elem !== this) {
                    hidePopover.call(elem);
                }
            });
        }
        this.dataset.shimOpen = "false";
        fire(this, "toggle", "open", "closed");
    }

    function showPopover() {
        if (!this.hasAttribute("popover")) {
            throw new window.DOMException("Not a popover", "NotSupportedError");
        }
        if (!this.isConnected) {
            throw new window.DOMException("Not connected", "InvalidStateError");
        }
        if (open.has(this)) {
            return;
        }
        if (!fire(this, "beforetoggle", "closed", "open")) {
            return;
        }
        if (type(this) === "auto") {
            // keep ancestors, close everything else
            [...autoStack].reverse().forEach((elem) => {
                if (!elem.contains(this)) {
                    hidePopover.call(elem);
                }
            });
            autoStack.push(this);
        }
        open.add(this);
        this.dataset.shimOpen = "true";
        fire(this, "toggle", "closed", "open");
    }

    function togglePopover(force) {
        const state = typeof force === "boolean" ? force : !open.has(this);
        state ? showPopover.call(this) : hidePopover.call(this);
        return state;
    }

    Object.assign(HTMLElement.prototype, { showPopover, hidePopover, togglePopover });

    // popovertarget
    document.addEventListener("click", (evt) => {
        const invoker = evt.target.closest?.("[popovertarget]");
        if (!invoker) {
            return;
        }
        const target = document.getElementById(invoker.getAttribute("popovertarget"));
        if (target) {
            togglePopover.call(target);
        }
    });

    // Escape
    document.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape" && autoStack.length) {
            hidePopover.call(autoStack[autoStack.length - 1]);
        }
    });

    // light dismiss
    let downOutside = false;
    const isOutside = (target) => {
        const top = autoStack[autoStack.length - 1];
        if (!top) {
            return false;
        }
        const invoker = target.closest?.("[popovertarget]");
        if (invoker && invoker.getAttribute("popovertarget") === top.id) {
            return false;
        }
        return !top.contains(target);
    };
    document.addEventListener("pointerdown", (evt) => {
        downOutside = isOutside(evt.target);
    }, true);
    document.addEventListener("pointerup", (evt) => {
        if (downOutside && isOutside(evt.target)) {
            [...autoStack].reverse().forEach((elem) => {
                if (!elem.contains(evt.target)) {
                    hidePopover.call(elem);
                }
            });
        }
        downOutside = false;
    }, true);

    window.__popoverShim = {
        isOpen: (elem) => open.has(elem),
        reset: () => {
            [...open].forEach((elem) => hidePopover.call(elem));
        },
    };
};
