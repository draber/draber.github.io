(function () {
    'use strict';

    var label = "Spelling Bee Assistant";
    var title = "Assistant";
    var url = "https://spelling-bee-assistant.app/";
    var prefix$1 = "sba";
    var support = {
    	url: "https://ko-fi.com/sbassistant",
    	text: "Tip Jar"
    };
    var issues = "https://github.com/draber/draber.github.io/issues";
    var targetUrl = "https://www.nytimes.com/puzzles/spelling-bee";

    var version = "6.0.0";

    const storageKey = `${prefix$1}-settings`;
    const schema = 1;
    const migrations = {};
    const storage = {
        read() {
            try {
                return localStorage.getItem(storageKey);
            } catch (err) {
                console.warn(`${label}: can't read the settings, using defaults`, err);
                return null;
            }
        },
        write(value) {
            try {
                localStorage.setItem(storageKey, value);
            } catch (err) {
                console.warn(`${label}: can't save the settings`, err);
            }
        },
        backup(raw) {
            try {
                localStorage.setItem(`${storageKey}-broken`, raw);
            } catch (err) {
            }
        },
    };
    const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
    const loadOptions = () => {
        const raw = storage.read();
        if (raw === null) {
            return { schema };
        }
        let options;
        try {
            options = JSON.parse(raw);
        } catch (err) {
            options = null;
        }
        if (!isPlainObject(options)) {
            console.warn(`${label}: the stored settings are unusable, starting with defaults. A copy is in ${storageKey}-broken`);
            storage.backup(raw);
            return { schema };
        }
        if (typeof options.schema !== "number") {
            delete options.version;
            delete options.oldVersion;
            options.schema = 1;
        }
        if (options.schema > schema) {
            return options;
        }
        while (options.schema < schema) {
            const next = options.schema + 1;
            try {
                options = migrations[next] ? migrations[next](options) : options;
            } catch (err) {
                console.warn(`${label}: migration to settings schema ${next} failed, starting with defaults`, err);
                storage.backup(raw);
                return { schema };
            }
            options.schema = next;
        }
        return options;
    };
    const state = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix$1,
        support: support,
        issues: issues,
        targetUrl: targetUrl,
        options: loadOptions(),
    };
    const saveOptions = () => {
        storage.write(JSON.stringify(state.options));
    };
    const get$1 = (path) => {
        const parts = path.split(".");
        let current = state;
        for (const part of parts) {
            if (typeof current !== "object" || !(part in current)) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    };
    const set$1 = (path, value) => {
        const parts = path.split(".");
        const last = parts.pop();
        let current = state;
        for (const part of parts) {
            if (!isPlainObject(current[part])) {
                if (typeof current[part] !== "undefined") {
                    console.warn(`${label}: replacing the outdated value of ${part} in the settings`);
                }
                current[part] = {};
            }
            current = current[part];
        }
        current[last] = value;
        saveOptions();
        return true;
    };
    const remove = (path) => {
        const parts = path.split(".");
        const last = parts.pop();
        let current = state;
        for (const part of parts) {
            if (typeof current[part] !== "object") {
                return false;
            }
            current = current[part];
        }
        if (last in current) {
            delete current[last];
            saveOptions();
            return true;
        }
        return false;
    };
    const getAll = () => JSON.parse(JSON.stringify(state));
    var settings = {
        get: get$1,
        set: set$1,
        delete: remove,
        getAll,
    };

    const pf = settings.get('prefix');
    const camel = term => {
        return term.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return '';
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };
    const dash = term => {
        return term.replace(/[\W_]+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    };
    const prefix = (term = '', mode = 'c') => {
        switch (mode) {
            case 'c':
                return camel(pf + '_' + term);
            case 'd':
                return dash(pf + term.charAt(0).toUpperCase() + term.slice(1));
            default:
                return pf + term;
        }
    };

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var src;
    var hasRequiredSrc;

    function requireSrc () {
    	if (hasRequiredSrc) return src;
    	hasRequiredSrc = 1;
    	const cast = (content) => {
    	    if (typeof content === "undefined") {
    	        return document.createDocumentFragment();
    	    }
    	    if (content instanceof Node) {
    	        return content;
    	    }
    	    if (typeof content === "number") {
    	        content = content.toString();
    	    }
    	    if (typeof content === "string" || content instanceof String) {
    	        if (!/<(.*)>/.test(content)) {
    	            return document.createTextNode(content);
    	        }
    	        let node;
    	        const mime = content.includes("<svg") ? "image/svg+xml" : "text/html";
    	        const doc = new DOMParser().parseFromString(content, mime);
    	        if (doc.body) {
    	            node = document.createDocumentFragment();
    	            const children = Array.from(doc.body.childNodes);
    	            children.forEach((elem) => {
    	                node.append(elem);
    	            });
    	            return node;
    	        }
    	        else {
    	            return doc.documentElement;
    	        }
    	    }
    	    console.error("Expected Element|DocumentFragment|String|HTMLCode|SVGCode, got", content);
    	};
    	const obj = {
    	    $: (selector, container = null) => {
    	        return typeof selector === "string" ? (container || document).querySelector(selector) : selector || null;
    	    },
    	    $$: (selector, container = null) => {
    	        return [].slice.call((container || document).querySelectorAll(selector));
    	    },
    	    waitFor: function (selector, container = null) {
    	        return new Promise((resolve) => {
    	            const getElement = () => {
    	                const element = obj.$(selector, container);
    	                if (element) {
    	                    resolve(element);
    	                } else {
    	                    requestAnimationFrame(getElement);
    	                }
    	            };
    	            getElement();
    	        });
    	    },
    	    toNode: (content) => {
    	        if (!content.forEach || typeof content.forEach !== "function") {
    	            content = [content];
    	        }
    	        content = content.map((entry) => cast(entry));
    	        if (content.length === 1) {
    	            return content[0];
    	        } else {
    	            const fragment = document.createDocumentFragment();
    	            content.forEach((entry) => {
    	                fragment.append(entry);
    	            });
    	            return fragment;
    	        }
    	    },
    	    empty: (element) => {
    	        while (element.lastChild) {
    	            element.lastChild.remove();
    	        }
    	        element.textContent = "";
    	        return element;
    	    },
    	};
    	const create = function ({
    	    tag,
    	    content,
    	    attributes = {},
    	    style = {},
    	    data = {},
    	    aria = {},
    	    events = {},
    	    classNames = [],
    	    isSvg = false,
    	} = {}) {
    	    const el = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
    	    const fixes = {
    	        htmlFor: "for",
    	        className: "class"
    	    };
    	    const propToAttr = (prop) => Object.keys(fixes).includes(prop) ? fixes[prop] : prop;
    	    if (attributes.style) {
    	        const styleAttr = {};
    	        attributes.style.split(";").forEach((rule) => {
    	            const parts = rule.split(":").map((entry) => entry.trim());
    	            styleAttr[parts[0]] = parts[1];
    	        });
    	        style = {
    	            ...styleAttr,
    	            ...style,
    	        };
    	        delete attributes.style;
    	    }
    	    Object.assign(el.style, style);
    	    for (let [key, value] of Object.entries(attributes)) {
    	        if (isSvg) {
    	            el.setAttributeNS(null, key, value.toString());
    	        } else if (value !== false) {
    	            el.setAttribute(propToAttr(key), value.toString());
    	        }
    	    }
    	    for (let [key, value] of Object.entries(aria)) {
    	        key = key === "role" ? key : "aria-" + key;
    	        el.setAttribute(key.toLowerCase(), value);
    	    }
    	    for (let [key, value] of Object.entries(data)) {
    	        value = value.toString();
    	        el.dataset[key] = value;
    	    }
    	    for (const [event, fn] of Object.entries(events)) {
    	        el.addEventListener(event, fn, false);
    	    }
    	    if (classNames.length) {
    	        el.classList.add(...Array.from(classNames));
    	    }
    	    if (typeof content !== "undefined") {
    	        el.append(obj.toNode(content));
    	    }
    	    return el;
    	};
    	obj.create = create;
    	src = new Proxy(obj, {
    	    get(target, prop) {
    	        return function () {
    	            const args = Array.from(arguments);
    	            if (Object.prototype.hasOwnProperty.call(target, prop) && target[prop] instanceof Function) {
    	                target[prop].bind(target);
    	                return target[prop].apply(null, args);
    	            }
    	            return create({
    	                ...{
    	                    tag: prop,
    	                },
    	                ...args.shift(),
    	            });
    	        };
    	    },
    	});
    	return src;
    }

    var srcExports = requireSrc();
    var fn = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

    const selectors = {
        gameWrapper: "#js-hook-game-wrapper",
        gameRoot: "#pz-game-root",
        titleBar: ".pz-game-title-bar",
        gameHeader: ".pz-game-header",
        toolbar: ".pz-toolbar-right",
        globalNav: "#js-global-nav",
        toolbarHosts: ["#js-hook-game-wrapper", "#js-global-nav"],
        contentBox: ".sb-content-box",
        controlsBox: ".sb-controls-box",
        controls: ".sb-controls",
        hiveCell: ".sb-hive .hive-cell",
        hiveInput: ".sb-hive-input-content",
        resultList: ".sb-wordlist-items-pag",
        wordlistHeading: ".sb-wordlist-heading",
        term: ".sb-anagram",
        pangram: ".pangram",
        modalWrapper: ".sb-modal-wrapper",
        yesterdayFrame: ".sb-modal-frame:is(.yesterday, .yesterdayNew)",
        modalClosers: [
            ".pz-moment__frame.on-stage .pz-moment__close",
            ".pz-moment__frame.on-stage .pz-moment__close_text",
            ".sb-modal-close",
        ],
        toolbarButtons: {
            yesterday: ".pz-toolbar-button__yesterday",
            stats: ".pz-toolbar-button__stats",
        },
    };
    const classNames = {
        desktop: "pz-desktop",
        mobile: "pz-mobile",
        hiveInput: "sb-hive-input-content",
        hiveInputNonEmpty: "non-empty",
        modalWrapper: "sb-modal-wrapper",
        hiveActionPrefix: "hive-action__",
    };
    const required = {
        gameWrapper: "the whole assistant",
        contentBox: "the assistant panel",
        controlsBox: "the hive, shortcuts",
        controls: "Spill the Beans",
        hiveCell: "Dark Mode preview, typing words",
        resultList: "word and point counts",
        wordlistHeading: "the progress bar",
    };

    const simulatedMissing = (() => {
        try {
            const names = (localStorage.getItem("sba-simulate-missing") || "").split(",").map((name) => name.trim()).filter(Boolean);
            if (names.length) {
                console.warn(`Spelling Bee Assistant: simulating a broken NYT page, not found: ${names.join(", ")}`);
            }
            return new Set(names);
        } catch (e) {
            return new Set();
        }
    })();
    const matchesNothing = "#sba-simulated-missing";
    const sel = new Proxy(selectors, {
        get(target, name) {
            const value = target[name];
            if (!simulatedMissing.has(name)) {
                return value;
            }
            if (Array.isArray(value)) {
                return value.map(() => matchesNothing);
            }
            if (value && typeof value === "object") {
                return Object.fromEntries(Object.keys(value).map((key) => [key, matchesNothing]));
            }
            return matchesNothing;
        },
    });
    let gameWrapper$1 = null;
    const getGameWrapper = () => {
        if (!gameWrapper$1 || !gameWrapper$1.isConnected) {
            gameWrapper$1 = fn.$(sel.gameWrapper);
        }
        return gameWrapper$1;
    };
    const find = (name, container = getGameWrapper()) => {
        return container ? fn.$(sel[name], container) : null;
    };
    const findAll = (name, container = getGameWrapper()) => {
        return container ? fn.$$(sel[name], container) : [];
    };
    const getGameData = () => {
        const today = simulatedMissing.has("gameData") ? undefined : window.gameData?.today;
        if (!today || !Array.isArray(today.answers) || !Array.isArray(today.pangrams) || !Array.isArray(today.validLetters)) {
            throw new Error("window.gameData.today is missing or incomplete");
        }
        return today;
    };
    const isEnv = (env) => document.body.classList.contains(classNames[env]);
    const isRendered = (elem) => !!elem && elem.getClientRects().length > 0;
    const getToolbar = () => {
        const toolbars = fn.$$(sel.toolbar);
        const rendered = toolbars.find(isRendered);
        if (rendered) {
            return rendered;
        }
        const inNav = (toolbar) => !!toolbar.closest(sel.globalNav);
        const preferred = toolbars.find((toolbar) => inNav(toolbar) === isEnv("mobile"));
        return preferred || toolbars[0] || null;
    };
    const getToolbarHosts = () => sel.toolbarHosts.map((selector) => fn.$(selector)).filter(Boolean);
    const waitForElement = (lookup, description, timeout) => {
        return new Promise((resolve, reject) => {
            const found = lookup();
            if (found) {
                resolve(found);
                return;
            }
            const observer = new MutationObserver(() => {
                const elem = lookup();
                if (elem) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(elem);
                }
            });
            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`${description} not found within ${timeout / 1000}s`));
            }, timeout);
            observer.observe(document.body, { childList: true, subtree: true });
        });
    };
    const waitForResultList = (timeout = 10000) => {
        if (!getGameWrapper()) {
            return Promise.reject(new Error(`${selectors.gameWrapper} not found`));
        }
        return waitForElement(() => find("resultList"), selectors.resultList, timeout);
    };
    const waitForToolbar = (timeout = 10000) => waitForElement(() => getToolbar(), selectors.toolbar, timeout);
    const getTermFromListItem = (item) => {
        const elem = fn.$(sel.term, item) || (item.childElementCount > 1 ? item.firstElementChild : item);
        return elem.textContent.trim();
    };
    const getFoundTerms = (resultList) => fn.$$("li", resultList).map(getTermFromListItem);
    const isMarkedAsPangram = (item) => !!fn.$(sel.pangram, item);
    const isTerm = (elem) => elem instanceof Element && elem.matches(sel.term);
    const isHiveInput = (node) => node instanceof Element && node.classList.contains(classNames.hiveInput);
    const findYesterdayModal = (nodes) => {
        for (const node of nodes) {
            if (!(node instanceof Element)) {
                continue;
            }
            const frame = node.matches(sel.yesterdayFrame) ? node : fn.$(sel.yesterdayFrame, node);
            if (frame) {
                return frame;
            }
        }
        return null;
    };
    const findModalCloser = () => {
        for (const selector of sel.modalClosers) {
            const closer = fn.$(selector, getGameWrapper());
            if (closer) {
                return closer;
            }
        }
        return null;
    };
    const closeModal = () => {
        const closer = findModalCloser();
        if (closer) {
            closer.click();
        }
        return !!closer;
    };
    const clickToolbarButton = (name) => {
        const button = fn.$(sel.toolbarButtons[name], getToolbar()) || fn.$(sel.toolbarButtons[name]);
        if (button) {
            button.click();
        }
        return !!button;
    };
    const getHiveCells = () => {
        const cells = {};
        findAll("hiveCell").forEach((cell) => {
            cells[cell.textContent.trim()] = cell;
        });
        return cells;
    };
    const getHiveActionButton = (action) => fn.$(`.${classNames.hiveActionPrefix}${action}`, find("controlsBox"));
    const getHiveInput = () => {
        const input = find("hiveInput");
        return input && input.classList.contains(classNames.hiveInputNonEmpty) ? input : null;
    };
    const selfCheck = () => {
        const problems = [];
        try {
            getGameData();
        } catch (e) {
            problems.push({ name: "gameData", selector: "window.gameData.today", impact: "everything" });
        }
        for (const [name, impact] of Object.entries(required)) {
            const found = name === "gameWrapper" ? getGameWrapper() : find(name);
            if (!found) {
                problems.push({ name, selector: selectors[name], impact });
            }
        }
        return {
            ok: problems.length === 0,
            problems,
        };
    };
    var nyt = {
        selectors,
        getGameWrapper,
        find,
        findAll,
        getGameData,
        isEnv,
        getToolbar,
        getToolbarHosts,
        waitForResultList,
        waitForToolbar,
        getTermFromListItem,
        getFoundTerms,
        isMarkedAsPangram,
        isTerm,
        isHiveInput,
        findYesterdayModal,
        findModalCloser,
        closeModal,
        clickToolbarButton,
        getHiveCells,
        getHiveActionButton,
        getHiveInput,
        selfCheck,
    };

    let lists;
    let sbData;
    let app;
    const completeLists = () => {
        lists.foundPangrams = lists.foundTerms.filter((term) => lists.pangrams.includes(term));
        lists.remainders = lists.answers.filter((term) => !lists.foundTerms.includes(term));
        app.trigger(prefix("refreshUi"));
    };
    const initLists = (foundTerms) => {
        lists = {
            answers: [...sbData.answers],
            pangrams: [...sbData.pangrams],
            letters: [...sbData.validLetters],
            foundTerms: [...foundTerms],
        };
        completeLists();
    };
    const getList = (type) => {
        return lists[type];
    };
    const getId = () => {
        return sbData.id;
    };
    const getDate = () => {
        return {
            display: sbData.displayDate,
            print: sbData.printDate,
        };
    };
    const getCenterLetter = () => {
        return sbData.centerLetter;
    };
    const getCount = (type) => {
        return lists[type].length;
    };
    const getTermPoints = (term) => {
        if (lists.pangrams.includes(term)) {
            return term.length + 7;
        }
        return term.length > 4 ? term.length : 1;
    };
    const getPoints = (type) => {
        return lists[type].reduce((points, term) => points + getTermPoints(term), 0);
    };
    const getFoundAndTotal = (type) => {
        switch (type) {
            case "points":
                return {
                    found: getPoints("foundTerms"),
                    total: getPoints("answers"),
                };
            case "terms":
                return {
                    found: getCount("foundTerms"),
                    total: getCount("answers"),
                };
            case "pangrams":
                return {
                    found: getCount("foundPangrams"),
                    total: getCount("pangrams"),
                };
            default:
                console.warn(`[data] getFoundAndTotal: Unsupported type "${type}"`);
                return {
                    found: 0,
                    total: 0,
                };
        }
    };
    const updateLists = (term) => {
        if (lists.foundTerms.includes(term)) {
            return;
        }
        lists.foundTerms.push(term);
        completeLists();
    };
    const init$1 = (_app, foundTerms) => {
        app = _app;
        sbData = nyt.getGameData();
        initLists(foundTerms);
        app.on(prefix("newWord"), (evt) => {
            updateLists(evt.detail);
        });
    };
    var data = {
        init: init$1,
        getList,
        getCount,
        getPoints,
        getTermPoints,
        getId,
        getDate,
        getCenterLetter,
        getFoundAndTotal,
    };

    let cells = null;
    const actionButtons = {};
    const touchDuration = 50;
    const touch = (elem) => {
        return new Promise((resolve) => {
            const evtOpts = { bubbles: true, cancelable: true };
            elem.dispatchEvent(new Event("touchstart", evtOpts));
            setTimeout(() => {
                elem.dispatchEvent(new Event("touchend", evtOpts));
                resolve();
            }, touchDuration);
        });
    };
    const hitActionButton = (action) => {
        const button = actionButtons[action];
        if (!button) {
            return Promise.resolve();
        }
        const feedbackClass = prefix("no-feedback", "d");
        button.classList.add(feedbackClass);
        return touch(button).then(() => {
            button.classList.remove(feedbackClass);
        });
    };
    const deleteLetter = () => hitActionButton("delete");
    const submitWord = () => hitActionButton("submit");
    const getCells = () => {
        if (!cells || !Object.keys(cells).length) {
            cells = nyt.getHiveCells();
        }
        return cells;
    };
    const getCellByLetter = (letter) => {
        return getCells()[letter.toLowerCase()] || null;
    };
    const typeLetter = (letter) => {
        const cell = getCellByLetter(letter);
        const polygon = cell ? fn.$("polygon", cell) : null;
        return polygon ? touch(polygon) : Promise.resolve();
    };
    const typeWord = (word, slow = false) => {
        const delay = slow ? 250 : 0;
        const wait = () => new Promise((resolve) => setTimeout(resolve, delay));
        let chain = Promise.resolve();
        [...word.toLowerCase()].forEach((letter) => {
            chain = chain.then(() => typeLetter(letter)).then(wait);
        });
        return chain.then(wait).then(() => submitWord());
    };
    const deleteWord = () => {
        const input = nyt.getHiveInput();
        let chain = Promise.resolve();
        if (!input) {
            return chain;
        }
        for (let i = 0; i < input.children.length; i++) {
            chain = chain.then(() => deleteLetter());
        }
        return chain;
    };
    const init = () => {
        ["submit", "delete", "shuffle"].forEach((action) => {
            actionButtons[action] = nyt.getHiveActionButton(action);
        });
    };
    var hive = {
        init,
        getCells,
        getCellByLetter,
        deleteWord,
        deleteLetter,
        typeWord,
        typeLetter,
    };

    class Widget {
        hasUi() {
            return this.ui instanceof HTMLElement;
        }
        on(type, action) {
            if (this.hasUi()) {
                this.ui.addEventListener(type, action);
            }
            return this;
        }
        trigger(type, data) {
            if (this.hasUi()) {
                this.ui.dispatchEvent(data ? new CustomEvent(type, {
                    detail: data
                }) : new Event(type));
            }
            return this;
        }
        constructor(title, {
            key
        } = {}) {
            if (!title) {
                throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
            }
            this.title = title;
            this.key = key || camel(title);
            this.ui = null;
        }
    }

    class Plugin extends Widget {
        attach() {
            if (!this.hasUi()) {
                return this;
            }
            this.ui.dataset.ui = this.key;
            (this.target || this.app.ui)[this.addMethod](this.ui);
            return this;
        }
        add() {
            return this.attach();
        }
        run(evt) {
            return this;
        }
        constructor(app, title, description, { key, runEvt, addMethod } = {}) {
            super(title, {
                key
            });
            this.target;
            this.description = description || "";
            this.app = app;
            this.addMethod = addMethod || "append";
            this.shortcuts = [];
            if (runEvt) {
                this.app.on(runEvt, (evt) => {
                    this.run(evt);
                });
            }
        }
    }

    var moveIcon = "<svg version=\"1.1\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n <path d=\"m12 0-4 4h3v7h-7v-3l-4 4 4 4v-3h7v7h-3l4 4 4-4h-3v-7h7v3l4-4-4-4v3h-7v-7h3z\"/>\n</svg>\n";

    var closeIcon = "<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n <path d=\"m19.5 21.8-7.44-7.47-7.47 7.47-2.37-2.37 7.47-7.47-7.47-7.47 2.37-2.37 7.47 7.47 7.44-7.47 2.37 2.37-7.44 7.47 7.44 7.47z\"/>\n</svg>\n";

    const instances = new Set();
    const viewportMargin = 8;
    const smallScreen = "(max-width: 767.98px)";
    class PopupBuilder {
        static isAnyOpen() {
            return [...instances].some((popup) => popup.isOpen);
        }
        static closeAll() {
            let closed = false;
            instances.forEach((popup) => {
                if (popup.isOpen && !popup.isFloating) {
                    popup.toggle(false);
                    closed = true;
                }
            });
            return closed;
        }
        get isOpen() {
            return this.state === "open" && this.ui.isConnected;
        }
        get isFloating() {
            return this.ui.getAttribute("popover") === "manual";
        }
        applyMode() {
            if (!this.floating || this.isOpen) {
                return this;
            }
            const type = this.canDrag() ? "manual" : "auto";
            if (this.ui.getAttribute("popover") !== type) {
                this.ui.setAttribute("popover", type);
            }
            return this;
        }
        get isMoved() {
            return !!this.position;
        }
        create() {
            const topBar = [
                fn.button({
                    attributes: {
                        type: "button",
                        title: "Close",
                    },
                    aria: {
                        label: "Close",
                    },
                    classNames: ["sb-modal-close"],
                    content: this.floating ? closeIcon : "×",
                    events: {
                        click: () => this.toggle(false),
                    },
                }),
            ];
            if (this.floating) {
                topBar.unshift(
                    fn.span({
                        classNames: [prefix("window-title", "d")],
                    }),
                    fn.span({
                        attributes: {
                            title: "Drag to move",
                        },
                        aria: {
                            hidden: "true",
                        },
                        classNames: [prefix("move-handle", "d")],
                        content: moveIcon,
                    }),
                );
            }
            return fn.div({
                attributes: {
                    id: this.id,
                    popover: this.floating ? "manual" : "auto",
                },
                aria: {
                    role: "dialog",
                },
                classNames: [prefix("popover", "d")].concat(this.floating ? [prefix("floating", "d")] : []),
                data: {
                    ui: this.key,
                },
                events: {
                    beforetoggle: (evt) => this.onBeforeToggle(evt),
                    toggle: (evt) => evt.newState === "closed" && this.applyMode(),
                },
                content: fn.div({
                    classNames: ["sb-modal-frame", prefix("pop-up", "d")],
                    content: [
                        fn.div({
                            classNames: ["sb-modal-top"],
                            content: topBar,
                        }),
                        fn.div({
                            classNames: ["sb-modal-content"],
                            content: [
                                fn.div({
                                    classNames: ["sb-modal-header"],
                                    content: [this.parts.title, this.parts.subtitle],
                                }),
                                this.parts.body,
                                this.parts.footer,
                            ],
                        }),
                    ],
                }),
            });
        }
        setContent(part, content) {
            if (!this.parts[part]) {
                console.error(`Unknown target ${part}`);
                return this;
            }
            this.parts[part] = fn.empty(this.parts[part]);
            this.parts[part].append(fn.toNode(content));
            if (part === "title" && this.floating) {
                fn.$(`.${prefix("window-title", "d")}`, this.ui).textContent = this.parts.title.textContent;
            }
            return this;
        }
        onBeforeToggle(evt) {
            this.state = evt.newState;
            if (evt.newState !== "open") {
                return;
            }
            nyt.closeModal();
            if (this.isMoved) {
                this.ui.style.left = `${this.position.x}px`;
                this.ui.style.top = `${this.position.y}px`;
            }
        }
        toggle(state) {
            if (state === this.isOpen) {
                return this;
            }
            if (state) {
                this.ui.showPopover();
            } else {
                this.ui.hidePopover();
            }
            return this;
        }
        moveTo(position) {
            const rect = this.ui.getBoundingClientRect();
            const maxX = Math.max(viewportMargin, window.innerWidth - rect.width - viewportMargin);
            const maxY = Math.max(viewportMargin, window.innerHeight - rect.height - viewportMargin);
            this.position = {
                x: Math.round(Math.min(Math.max(position.x, viewportMargin), maxX)),
                y: Math.round(Math.min(Math.max(position.y, viewportMargin), maxY)),
            };
            this.ui.style.left = `${this.position.x}px`;
            this.ui.style.top = `${this.position.y}px`;
            return this.position;
        }
        canDrag() {
            return !window.matchMedia?.(smallScreen).matches;
        }
        coversViewportCenter() {
            const rect = this.ui.getBoundingClientRect();
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            return rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y;
        }
        resetPosition() {
            this.position = null;
            this.ui.classList.remove(prefix("moved", "d"));
            this.ui.style.removeProperty("left");
            this.ui.style.removeProperty("top");
            return this;
        }
        enableDragging() {
            const handle = fn.$(".sb-modal-top", this.ui);
            let start = null;
            let dragged = false;
            handle.addEventListener("pointerdown", (evt) => {
                if (!this.canDrag() || evt.button !== 0 || evt.target.closest("button")) {
                    return;
                }
                const rect = this.ui.getBoundingClientRect();
                start = { pointerX: evt.clientX, pointerY: evt.clientY, x: rect.left, y: rect.top };
                dragged = false;
                handle.setPointerCapture?.(evt.pointerId);
                this.ui.classList.add(prefix("dragging", "d"));
                evt.preventDefault();
            });
            handle.addEventListener("pointermove", (evt) => {
                if (!start) {
                    return;
                }
                dragged = true;
                if (!this.ui.classList.contains(prefix("moved", "d"))) {
                    this.ui.classList.add(prefix("moved", "d"));
                }
                this.moveTo({
                    x: start.x + evt.clientX - start.pointerX,
                    y: start.y + evt.clientY - start.pointerY,
                });
            });
            const stop = () => {
                if (start && dragged && this.coversViewportCenter()) {
                    this.resetPosition();
                }
                start = null;
                dragged = false;
                this.ui.classList.remove(prefix("dragging", "d"));
            };
            handle.addEventListener("pointerup", stop);
            handle.addEventListener("pointercancel", stop);
            handle.addEventListener("dblclick", (evt) => {
                if (this.canDrag() && !evt.target.closest("button")) {
                    this.resetPosition();
                }
            });
            return this;
        }
        onKeyDown = (evt) => {
            if (evt.key !== "Escape" || !this.isOpen || !this.isFloating) {
                return;
            }
            const regularOpen = [...instances].some((popup) => !popup.isFloating && popup.isOpen);
            const menuOpen = !!fn.$('[data-ui="submenu"][data-sba-open="true"]');
            if (!regularOpen && !menuOpen && !nyt.findModalCloser()) {
                this.toggle(false);
            }
        };
        constructor(app, key, { floating = false } = {}) {
            this.key = key;
            this.id = prefix(`popover-${key}`, "d");
            this.app = app;
            this.state = "closed";
            this.floating = floating;
            this.position = null;
            this.parts = {
                title: fn.h3({
                    classNames: ["sb-modal-title"],
                }),
                subtitle: fn.p({
                    classNames: ["sb-modal-message"],
                }),
                body: fn.div({
                    classNames: ["sb-modal-body"],
                }),
                footer: fn.div({
                    classNames: ["sb-modal-message", prefix("modal-footer", "d")],
                    content: [
                        fn.a({
                            content: settings.get("label"),
                            attributes: {
                                href: settings.get("url"),
                                target: prefix(),
                            },
                        }),
                    ],
                }),
            };
            this.ui = this.create();
            if (this.floating) {
                this.enableDragging();
                document.addEventListener("keydown", this.onKeyDown, true);
                this.applyMode();
                this.smallScreenQuery = window.matchMedia?.(smallScreen);
                this.onScreenChange = () => this.applyMode();
                this.smallScreenQuery?.addEventListener?.("change", this.onScreenChange);
            }
            document.body.append(this.ui);
            instances.add(this);
            app.on(prefix("destroy"), () => {
                document.removeEventListener("keydown", this.onKeyDown, true);
                this.smallScreenQuery?.removeEventListener?.("change", this.onScreenChange);
                this.ui.remove();
                instances.delete(this);
            });
        }
    }

    const isEmptyObject = (obj) => {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    };

    const utils = (self) => ({
        isValidHsl(hsl) {
            return !!hsl && !isEmptyObject(hsl) && !isNaN(hsl.hue) && !isNaN(hsl.sat) && !isNaN(hsl.lig);
        },
        ensureValidHsl(hsl) {
            if (self.isValidHsl(hsl)) {
                return hsl;
            }
            const scheme = settings.get(`options.${self.key}`);
            if (scheme?.hsl && self.isValidHsl(scheme.hsl)) {
                return scheme.hsl;
            }
            return {
                hue: 0,
                sat: 0,
                lig: 7,
            };
        },
        isValidMode(mode) {
            return ["dark", "light"].includes(mode);
        },
        ensureValidMode(mode) {
            if (self.isValidMode(mode)) {
                return mode;
            }
            return self.usesSystemDarkMode() ? "dark" : "light";
        },
        ensureValidColorScheme(requestedScheme = null) {
            const scheme = { ...(requestedScheme || settings.get(`options.${self.key}`) || {}) };
            scheme.mode = self.ensureValidMode(scheme.mode);
            scheme.hsl = self.ensureValidHsl(scheme.hsl);
            return scheme;
        },
        isValidColorScheme(scheme = null) {
            return !!scheme && !isEmptyObject(scheme) && self.isValidHsl(scheme.hsl) && self.isValidMode(scheme.mode);
        },
        usesNonSbaDarkMode() {
            const rgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
            if (!rgb || (rgb.length === 4 && parseInt(rgb[3]) === 0)) {
                return false;
            }
            const [r, g, b] = rgb.map(Number);
            const toLinear = (v) => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            };
            const [R, G, B] = [r, g, b].map(toLinear);
            const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
            return luminance < 0.5;
        },
        usesSbaDarkMode() {
            return self.ensureValidColorScheme().mode === "dark";
        },
        usesSystemDarkMode() {
            const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
            return !!darkMode.matches;
        },
        colorSchemesAreEqual(a, b) {
            return a.mode === b.mode && a.hsl.hue === b.hsl.hue && a.hsl.sat === b.hsl.sat && a.hsl.lig === b.hsl.lig;
        },
        cssHslFromColorScheme(scheme) {
            return `hsl(${scheme.hsl.hue}, ${scheme.hsl.sat}%, ${scheme.hsl.lig}%)`;
        },
    });

    const ui = (self) => ({
        getSwatch(scheme, content = "") {
            let isCurrent = self.colorSchemesAreEqual(scheme, self.ensureValidColorScheme());
            let btnConfig = structuredClone(scheme);
            let background;
            if (scheme.mode === "light") {
                btnConfig.hsl = {
                    hue: 360,
                    sat: 100,
                    lig: 100,
                };
                background = self.cssHslFromColorScheme(btnConfig);
            }
            else {
                background = self.cssHslFromColorScheme({
                    ...scheme,
                    hsl: {
                      ...scheme.hsl,
                      lig: 22,
                    },
                  });
            }
            return fn.li({
                content: [
                    fn.input({
                        attributes: {
                            name: "color-picker",
                            type: "radio",
                            value: btnConfig.hsl.hue,
                            checked: isCurrent,
                            id: prefix("h" + btnConfig.hsl.hue),
                        },
                        events: {
                            change: () => {
                                self.applyColorScheme(scheme);
                            },
                        },
                    }),
                    fn.label({
                        attributes: {
                            htmlFor: prefix("h" + btnConfig.hsl.hue),
                        },
                        style: {
                            background
                        },
                        content,
                    }),
                ],
            });
        },
        getSwatches() {
            const swatches = fn.ul({
                classNames: [prefix("swatches", "d")],
            });
            const lig = 7;
            for (let hue = 0; hue < 360; hue += 30) {
                const sat = hue === 0 ? 0 : 25;
                swatches.append(self.getSwatch({ mode: "dark", hsl: { hue, sat, lig } }));
            }
            swatches.append(self.getSwatch({ mode: "light", hsl: { hue: 0, sat: 0, lig }} , "Return to Light Mode"));
            return swatches;
        },
        getHive() {
            const translate = ({ x, y }) => `translate(${x} ${y})`;
            const canonicalOrder = ["c", "nw", "n", "ne", "se", "s", "sw"];
            const hiveLayout = {
                c: { x: 19.2, y: 22.01 },
                nw: { x: 0, y: 11.01 },
                n: { x: 19.2, y: 0.01 },
                ne: { x: 38.4, y: 11.01 },
                se: { x: 38.4, y: 33.01 },
                s: { x: 19.2, y: 44.01 },
                sw: { x: 0, y: 33.01 },
            };
            const symbol = fn.symbol({
                isSvg: true,
                attributes: {
                    id: prefix("cell-tpl", "d"),
                },
                content: fn.polygon({
                    isSvg: true,
                    attributes: {
                        points: "18,0 24,10.39 18,20.78 6,20.78 0,10.39 6,0",
                    },
                }),
            });
            const defs = fn.defs({
                isSvg: true,
                content: symbol,
            });
            const elements = [defs];
            let i = 0;
            for(const [letter, cell] of Object.entries(hive.getCells())) {
                const orientation = canonicalOrder[i];
                elements.push(
                    fn.g({
                        isSvg: true,
                        attributes: {
                            transform: translate(hiveLayout[orientation]),
                        },
                        classNames: [i === 0 ? "center-cell" : "cell"].map((name) => prefix(name, "d")),
                        content: [
                            fn.use({
                                isSvg: true,
                                attributes: {
                                    href: `#${prefix("cell-tpl", "d")}`,
                                },
                            }),
                            fn.text({
                                isSvg: true,
                                attributes: {
                                    x: 12,
                                    y: 11,
                                },
                                content: letter,
                            }),
                        ],
                    })
                );
                i++;
            }
            return fn.div({
                classNames: [prefix("dark-mode-preview", "d")],
                content: fn.svg({
                    isSvg: true,
                    attributes: {
                        viewBox: "0 0 62.4 64.8",
                    },
                    content: elements,
                }),
            });
        },
    });

    class DarkMode extends Plugin {
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup.toggle(true);
            fn.$("input:checked", this.popup.ui)?.focus();
            return this;
        }
        applyColorScheme(scheme) {
            scheme = this.ensureValidColorScheme(scheme);
            document.body.dataset[prefix("theme")] = scheme.mode;
            document.body.style.setProperty("--dhue", scheme.hsl.hue);
            document.body.style.setProperty("--dsat", scheme.hsl.sat + "%");
            document.body.style.setProperty("--dlig", scheme.hsl.lig + "%");
            settings.set(`options.${this.key}.hsl`, scheme.hsl);
            settings.set(`options.${this.key}.mode`, scheme.mode);
            return this;
        }
        toggleColorScheme() {
            const scheme = this.ensureValidColorScheme();
            scheme.mode = scheme.mode === "dark" ? "light" : "dark";
            return this.applyColorScheme(scheme);
        }
        constructor(app) {
            super(app, "Dark Mode", "Choose your vibe: shades for morning people and night owls.");
            Object.assign(this, utils(this), ui(this));
            let found3rdPartyDm = false;
            if (this.usesNonSbaDarkMode()) {
                this.applyColorScheme({ mode: "dark" });
                found3rdPartyDm = true;
            } else {
                this.applyColorScheme(settings.get(`options.${this.key}`));
            }
            this.menu = {
                action: "popup",
            };
            this.shortcuts = [
                {
                    combo: "Shift+Alt+D",
                    method: "toggleColorScheme",
                    label: "Dark Mode",
                },
                {
                    combo: "Shift+Alt+K",
                    method: "togglePopup",
                    label: "Dark Mode Colors",
                },
            ];
            this.popup = new PopupBuilder(this.app, this.key);
            if (!found3rdPartyDm) {
                this.popup
                    .setContent("title", this.title)
                    .setContent("subtitle", this.description)
                    .setContent(
                        "body",
                        fn.div({
                            classNames: [prefix("color-selector", "d")],
                            content: [this.getSwatches(), this.getHive()],
                        })
                    );
            } else {
                this.popup.setContent("title", "Dark Mode disabled").setContent(
                    "subtitle",
                    fn.toNode([
                        fn.p({
                            content: `Spelling Bee Assistant’s dark mode has been turned off because another dark theme (likely from the NYT) was detected.`,
                        }),
                        fn.p({
                            content: `If you prefer SBA’s dark mode, consider disabling the other one.`,
                        }),
                    ])
                );
            }
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings.get("title"), "", {
                key: "header",
            });
            const toolbar = fn.div({
                classNames: ["sba-toolbar"],
            });
            app.on(prefix("pluginsReady"), (evt) => {
                evt.detail.forEach((plugin) => {
                    if (plugin.panelBtn) {
                        toolbar.append(plugin.panelBtn);
                    }
                });
            });
            this.ui = fn.div({
                content: [
                    fn.div({
                        classNames: ["sba-title"],
                        content: this.title,
                    }),
                    toolbar,
                ],
            });
        }
    }

    class ProgressBuilder {
        constructor(valueAsNumber, maxAsNumber) {
            this.maxAsNumber = maxAsNumber;
            this.valueInPercent = this.toPercent(valueAsNumber);
            this.element = null;
        }
        render() {
            this.element = fn.progress({
                attributes: {
                    max: 100,
                    value: this.valueInPercent,
                    title: `Progress: ${this.valueInPercent}%`,
                },
            });
            return this.element;
        }
        get ui() {
            return this.element || this.render();
        }
        update(valueAsNumber) {
            if (!this.element) {
                this.render();
            }
            this.valueInPercent = this.toPercent(valueAsNumber);
            this.element.value = this.valueInPercent;
            this.element.title = `Progress: ${this.valueInPercent}%`;
            return this;
        }
        toPercent(value) {
            if (!this.maxAsNumber) {
                return 0;
            }
            return Math.min(Math.round((value * 100) / this.maxAsNumber), 100);
        }
    }

    class ProgressBar extends Plugin {
        run(evt) {
            this.progress.update(data.getPoints("foundTerms"));
            return this;
        }
        constructor(app) {
            super(app, "Progress Bar", "Displays your progress as a yellow bar", {
                runEvt: prefix("refreshUi"),
                addMethod: "before",
            });
            this.progress = new ProgressBuilder(data.getPoints("foundTerms"), data.getPoints("answers"));
            this.ui = this.progress.ui;
            this.target = nyt.find("wordlistHeading");
        }
    }

    const dataToObj = (
        data,
        { hasHeadRow = true, hasHeadCol = true, rowCallbacks = [], cellCallbacks = [], caption = "", classNames = [] } = {}
    ) => {
        const skeleton = getTableSkeleton();
        if (caption) {
            skeleton.caption.content.push(caption);
        }
        let cellCnt = 0;
        data.forEach((rowData, rowIdx) => {
            if(rowIdx === 0) {
                cellCnt = rowData.length;
            }
            const rowObj = {
                tag: "tr",
                content: [],
                classNames: [],
                attributes: {},
            };
            const trTarget = hasHeadRow && rowIdx === 0 ? "thead" : "tbody";
            rowData.forEach((cellData, cellIdx) => {
                let cellTag = "td";
                if (hasHeadRow && rowIdx === 0) {
                    cellTag = "th";
                } else if (hasHeadCol && cellIdx === 0) {
                    cellTag = "th";
                }
                const cellObj = {
                    tag: cellTag,
                    content: cellData,
                    classNames: [],
                };
                cellCallbacks.forEach((cb) => {
                    cb({
                        cellData,
                        rowIdx,
                        cellIdx,
                        rowData,
                        rowObj,
                        cellObj,
                        tableData: data,
                    });
                });
                rowObj.content.push(cellObj);
            });
            skeleton[trTarget].content.push(rowObj);
            rowCallbacks.forEach((cb) => cb(rowData, rowIdx, rowObj, skeleton));
        });
        return finalizeSkeleton(skeleton, cellCnt, classNames);
    };
    const getTableSkeleton = () => {
        const skeleton = {};
        ["caption", "thead", "tbody", "tfoot"].forEach((tag) => {
            skeleton[tag] = {
                tag,
                content: [],
            };
        });
        return skeleton;
    };
    const finalizeSkeleton = (skeleton, cellCnt, classNames = []) => {
        const content = Object.values(skeleton).filter((part) => {
            return Array.isArray(part.content) && part.content.length > 0;
        });
        return {
            tag: "table",
            content,
            classNames,
            data: {
                cols: cellCnt,
            }
        };
    };
    const insertAfterCurrentRow = (skeleton, currentRow, newRow, section = "tbody") => {
        const target = skeleton[section]?.content;
        if (!target) {
            return;
        }
        const index = target.indexOf(currentRow);
        if (index === -1) {
            target.push(newRow);
        } else {
            target.splice(index + 1, 0, newRow);
        }
    };
    const buildFirstLetterTableData = (n) => {
        const answers = [...data.getList("answers")].sort();
        const remainders = data.getList("remainders");
        const stats = {};
        const tpl = { found: 0, missing: 0, total: 0 };
        for (const word of answers) {
            const key = word.slice(0, n);
            if (!stats[key]) stats[key] = { ...tpl };
            if (remainders.includes(word)) {
                stats[key].missing++;
            } else {
                stats[key].found++;
            }
            stats[key].total++;
        }
        const rows = [["", "✓", "?", "∑"]];
        for (const [key, { found, missing, total }] of Object.entries(stats)) {
            rows.push([key, found, missing, total]);
        }
        return rows;
    };
    const buildWordLengthTableData = () => {
        const counts = {};
        const header = ["", "✓", "?", "∑"];
        const rows = [];
        const answers = data.getList("answers");
        const found = new Set(data.getList("foundTerms"));
        for (const term of answers) {
            const len = term.length;
            if (!counts[len]) {
                counts[len] = { found: 0, missing: 0, total: 0 };
            }
            if (found.has(term)) {
                counts[len].found++;
            } else {
                counts[len].missing++;
            }
            counts[len].total++;
        }
        Object.keys(counts)
            .sort((a, b) => a - b)
            .forEach((len) => {
                const { found, missing, total } = counts[len];
                rows.push([len, found, missing, total]);
            });
        return [header, ...rows];
    };
    var tableUtils = {
        dataToObj,
        insertAfterCurrentRow,
        buildFirstLetterTableData,
        buildWordLengthTableData,
    };

    const render = (obj) => {
        const defaults = {
            tag: "div",
            content: [],
            attributes: {},
            style: {},
            data: {},
            aria: {},
            events: {},
            classNames: [],
            isSvg: false,
        };
        const merged = {
            ...defaults,
            ...obj,
            content: castToArray(obj.content).map((item) =>
                typeof item === "string" || !isNaN(item) || item instanceof Node ? item : render(item)
            ),
        };
        return srcExports.create(merged);
    };
    const castToArray = (content) => {
        if (typeof content === "undefined" || content === null) {
            return [];
        }
        if (Array.isArray(content)) {
            return content;
        }
        return [content];
    };

    class TableBuilder {
        constructor(
            data,
            {
                caption = "",
                hasHeadRow = true,
                hasHeadCol = true,
                rowCallbacks = [],
                cellCallbacks = [],
                classNames = []
            } = {}
        ) {
            this.data = data;
            this.caption = caption;
            this.hasHeadRow = hasHeadRow;
            this.hasHeadCol = hasHeadCol;
            this.rowCallbacks = rowCallbacks;
            this.cellCallbacks = cellCallbacks;
            this.classNames = classNames;
            this.element = null;
        }
        render() {
            const obj = tableUtils.dataToObj(this.data, {
                caption: this.caption,
                hasHeadRow: this.hasHeadRow,
                hasHeadCol: this.hasHeadCol,
                rowCallbacks: this.rowCallbacks,
                cellCallbacks: this.cellCallbacks,
                classNames: this.classNames
            });
            this.element = render(obj);
            return this.element;
        }
        get ui() {
            return this.element || this.render();
        }
    }
    function buildStandardTable(data, rowCallbacks = [], cellCallbacks=[]) {
        return (new TableBuilder(data, {
            hasHeadRow: true,
            hasHeadCol: true,
            classNames: [
                "data-pane",
                "th-upper",
                "table-full-width",
                "equal-cols",
                "small-txt"
            ].map((name) => prefix(name, "d")).concat(["pane"]),
            rowCallbacks,
            cellCallbacks
        })).ui;
    }

    class DetailsBuilder {
      update(newContent) {
        if (!this.element) {
          this.render();
        }
        this.content.replaceWith(newContent);
        this.content = newContent;
        return this;
      }
      render() {
        this.element = fn.details({
          content: [
            fn.summary({
              content: this.title,
            }),
            this.content,
          ],
          attributes: {
            open: this.open,
            name: this.name
          },
        });
        return this.element;
      }
      togglePane() {
        this.element.open = !this.element.open;
        return this;
      }
      get ui() {
        return this.element || this.render();
      }
      constructor(title, open = false, name = "") {
        this.title = title;
        this.open = open;
        this.name = name;
        this.content = fn.div();
        this.element = null;
      }
    }

    class Overview extends Plugin {
        togglePane() {
            return this.detailsBuilder.togglePane();
        }
        run(evt) {
            this.detailsBuilder.update(this.createTable());
            return this;
        }
        getData() {
            const keys = ["foundTerms", "remainders", "answers"];
            return [
                ["", "✓", "?", "∑"],
                ["W"].concat(keys.map((key) => data.getCount(key))),
                ["P"].concat(keys.map((key) => data.getPoints(key))),
            ];
        }
        createTable() {
            return buildStandardTable(this.getData());
        }
        constructor(app) {
            super(app, "Overview", "The number of words and points and how many have been found", {
                runEvt: prefix("refreshUi")
            });
            this.detailsBuilder = new DetailsBuilder(this.title, true);
            this.ui = this.detailsBuilder.ui;
            this.shortcuts = [
                {
                    combo: "Shift+Alt+O",
                    method: "togglePane",
                },
            ];
        }
    }

    class SpillTheBeans extends Plugin {
        run(evt) {
            const partial = evt.detail?.textContent?.trim() || "";
            let emoji = "🙂";
            if (!partial) {
                emoji = "😐";
            } else if (!data.getList("remainders").filter((term) => term.startsWith(partial)).length) {
                emoji = "🙁";
            }
            this.ui.textContent = emoji;
            return this;
        }
        getState() {
            return !this.ui.classList.contains("inactive");
        }
        toggle() {
            this.ui.classList.toggle("inactive", this.getState());
            return this;
        }
        constructor(app) {
            super(app, "Spill the beans", "An emoji that shows if the last letter was right or wrong", {
                runEvt: prefix("newInput"),
                addMethod: "prepend",
            });
            this.menu = {
                action: "boolean",
            };
            this.ui = fn.div({
                content: "😐",
                classNames: ["inactive"],
            });
            this.target = nyt.find("controls");
            this.shortcuts = [
                {
                    combo: "Shift+Alt+E",
                    method: "toggle",
                },
            ];
        }
    }

    class LetterCount extends Plugin {
        togglePane() {
            return this.detailsBuilder.togglePane();
        }
        run(evt) {
            this.detailsBuilder.update(this.createTable());
            return this;
        }
        constructor(app) {
            super(app, "Letter count", "The number of words by length", {runEvt: prefix("refreshUi")});
            this.detailsBuilder = new DetailsBuilder(this.title, false);
            this.ui = this.detailsBuilder.ui;
            this.shortcuts = [
                {
                    combo: "Shift+Alt+L",
                    method: "togglePane",
                },
            ];
        }
        getData() {
            return tableUtils.buildWordLengthTableData();
        }
        createTable() {
            return buildStandardTable(this.getData(),[
                (rowData, rowIdx, rowObj) => {
                    if (rowData[2] === 0) {
                        rowObj.classNames.push(prefix("completed", "d"));
                    }
                },
            ]);
        }
    }

    class StartSequence extends Plugin {
        togglePane() {
            return this.detailsBuilder.togglePane();
        }
        run(evt) {
            this.detailsBuilder.update(this.createTable());
            return this;
        }
        constructor(app, title, description, {letterCnt, shortcuts} = {}) {
            super(app, title, description, {runEvt: prefix("refreshUi")});
            this.detailsBuilder = new DetailsBuilder(this.title, false, 'startSequence');
            this.ui = this.detailsBuilder.ui;
            this.shortcuts = shortcuts;
            this.letterCnt = letterCnt;
        }
        getData() {
            return tableUtils.buildFirstLetterTableData(this.letterCnt);
        }
        createTable() {
            return buildStandardTable(this.getData(),[
                (rowData, rowIdx, rowObj) => {
                    if (rowData[2] === 0) {
                        rowObj.classNames.push(prefix("completed", "d"));
                    }
                    if (rowData[0] === data.getCenterLetter()) {
                        rowObj.classNames.push(prefix("preeminent", "d"));
                    }
                },
            ]);
        }
    }

    class FirstLetter extends StartSequence {
        constructor(app) {
            super(app, "First letter", "The number of words by first letter", {
                shortcuts: [
                    {
                        combo: "Shift+Alt+F",
                        method: "togglePane",
                    },
                ],
                letterCnt: 1
            });
        }
    }

    class FirstTwoLetters extends StartSequence {
        constructor(app) {
            super(app, "First two letters", "The number of words by the first two letters", {
                shortcuts: [
                    {
                        combo: "Shift+Alt+2",
                        method: "togglePane",
                    },
                ],
                letterCnt: 2
            });
        }
    }

    class Pangrams extends Plugin {
        togglePane() {
            return this.detailsBuilder.togglePane();
        }
        run(evt) {
            this.detailsBuilder.update(this.createTable());
            return this;
        }
        getData() {
            const pangramCount = data.getCount("pangrams");
            const foundPangramCount = data.getCount("foundPangrams");
            return [
                ["✓", "?", "∑"],
                [foundPangramCount, pangramCount - foundPangramCount, pangramCount],
            ];
        }
        createTable() {
            return (new TableBuilder(this.getData(), {
                hasHeadRow: true,
                hasHeadCol: false,
                classNames: ["data-pane", "th-upper", "table-full-width", "equal-cols", "small-txt"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"]),
                rowCallbacks: [
                    (rowData, rowIdx, rowObj) => {
                        if (rowData[1] === 0) {
                            rowObj.classNames.push(prefix("completed", "d"));
                        }
                    },
                ],
            })).ui;
        }
        constructor(app) {
            super(app, "Pangrams", "The number of pangrams", { runEvt: prefix("refreshUi") });
            this.detailsBuilder = new DetailsBuilder(this.title, false);
            this.ui = this.detailsBuilder.ui;
            this.shortcuts = [
                {
                    combo: "Shift+Alt+P",
                    method: "togglePane",
                },
            ];
        }
    }

    const tiers = [
        ["Beginner", 0],
        ["Good Start", 2],
        ["Moving Up", 5],
        ["Good", 8],
        ["Solid", 15],
        ["Nice", 25],
        ["Great", 40],
        ["Amazing", 50],
        ["Genius", 70],
        ["Queen Bee", 100]
    ];
    const getSummaryTableData = (fieldName) => {
        const achievements = data.getFoundAndTotal(fieldName);
        return [
            ["✓", "?", "∑"],
            [achievements.found, achievements.total - achievements.found, achievements.total],
        ];
    };
    const getMilestoneData = (reversed = true) => {
        const pointObj = data.getFoundAndTotal("points");
        const rows = [["", "To reach"]];
        const tierData = reversed ? tiers.toReversed() : tiers;
        tierData.forEach((entry) => {
            rows.push([entry[0], Math.round((entry[1] / 100) * pointObj.total)]);
        });
        return rows;
    };
    const getCurrentTier = (pointObj) => {
        const tier = getMilestoneData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] <= pointObj.found)
            .pop();
        return {
            name: tier[0],
            value: tier[1],
            additionalPoints: pointObj.found - tier[1],
        };
    };
    const getNextTier = (pointObj) => {
        const nextTier = getMilestoneData(false)
            .filter((entry) => !isNaN(entry[1]) && entry[1] > pointObj.found)
            .shift();
        return nextTier && nextTier.length
            ? {
                name: nextTier[0],
                value: nextTier[1],
                missingPoints: nextTier[1] - pointObj.found,
            }
            : {
                name: null,
                value: null,
                missingPoints: 0,
            };
    };
    const getDescription = () => {
        const pointObj = data.getFoundAndTotal("points");
        const currentTier = getCurrentTier(pointObj);
        const nextTier = getNextTier(pointObj);
        return nextTier.name && pointObj.found < pointObj.total
            ? [
                `You’re at "`,
                fn.b({content: currentTier.name}),
                `" and just `,
                fn.b({content: nextTier.missingPoints}),
                ` ${nextTier.missingPoints !== 1 ? "points" : "point"} away from "`,
                fn.b({content: nextTier.name}),
                `".`,
            ]
            : `You’ve completed today’s puzzle. Here’s a recap.`;
    };
    const getMilestoneTableRowCallbacks = () => {
        return [
            (rowData, rowIdx, rowObj, skeleton) => {
                const pointObj = data.getFoundAndTotal("points");
                const currentTier = getCurrentTier(pointObj);
                const nextTier = getNextTier(pointObj);
                if(rowIdx > 0){
                    rowObj.classNames.push(prefix(rowData[0], "d"));
                }
                if (rowData[1] < pointObj.found && rowData[1] !== currentTier.value) {
                    rowObj.classNames.push(prefix("completed", "d"));
                }
                if (rowData[1] === currentTier.value) {
                    rowObj.classNames.push(prefix("preeminent", "d"));
                    if(rowIdx !== 1) {
                        getProgressbarInjectionCallback(
                            currentTier.additionalPoints,
                            nextTier.value - currentTier.value,
                            rowObj,
                            skeleton
                        );
                    }
                }
            },
        ];
    };
    const getSummaryTableRowCallbacks = () => {
        return [
            (rowData, rowIdx, rowObj, skeleton) => {
                if (rowIdx === 1) {
                    getProgressbarInjectionCallback(
                        rowData[0],
                        rowData[2],
                        rowObj,
                        skeleton
                    );
                }
            },
        ];
    };
    const getProgressbarInjectionCallback = (points, max, rowObj, skeleton) => {
        const tableRow = {
            tag: "tr",
            content: [
                {
                    tag: "td",
                    classNames: [prefix("progress-box", "d")],
                    attributes: {colspan: rowObj.content.length},
                    content: (new ProgressBuilder(points, max)).ui
                }
            ]
        };
        tableUtils.insertAfterCurrentRow(skeleton, rowObj, tableRow);
    };

    class Milestones extends Plugin {
        createSummaryTable(fieldName) {
            return new TableBuilder(getSummaryTableData(fieldName), {
                hasHeadRow: true,
                hasHeadCol: false,
                classNames: ["data-pane", "thead-th-bold"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"]),
                caption: this.summaryFields[fieldName],
                rowCallbacks: getSummaryTableRowCallbacks()
            }).ui;
        }
        createMilestoneTable() {
            return new TableBuilder(getMilestoneData(true), {
                hasHeadRow: true,
                hasHeadCol: true,
                classNames: ["data-pane", "thead-th-bold"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"]),
                caption: "Tiers",
                rowCallbacks: getMilestoneTableRowCallbacks()
            }).ui;
        }
        createBody() {
            const summaryElements = Object.keys(this.summaryFields).map((fieldName) => this.createSummaryTable(fieldName));
            return fn.div({
                classNames: [prefix("milestone-table-wrapper", "d")],
                content: [
                    fn.figure({
                        content: summaryElements,
                        classNames: ["col", "summaries"].map((name) => prefix(name, "d")),
                    }),
                    fn.figure({
                        content: this.createMilestoneTable(),
                        classNames: ["col", "tiers"].map((name) => prefix(name, "d")),
                    }),
                ],
            });
        }
        run() {
            if (this.popup.isOpen) {
                this.popup.setContent("subtitle", getDescription()).setContent("body", this.createBody());
            }
            return this;
        }
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup.setContent("subtitle", getDescription()).setContent("body", this.createBody()).toggle(true);
            return this;
        }
        constructor(app) {
            super(app, "Milestones", "The number of points required for each level", { runEvt: prefix("refreshUi") });
            this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);
            this.summaryFields = {
                points: "Points",
                terms: "Words",
                pangrams: "Pangrams",
            };
            this.menu = {
                action: "popup",
            };
            this.shortcuts = [
                {
                    combo: "Shift+Alt+M",
                    method: "togglePopup",
                },
            ];
        }
    }

    class Community extends Plugin {
        hasGeniusNo4Letters() {
            const maxPoints = data.getPoints("answers");
            const no4LetterPoints = maxPoints - data.getList("answers").filter((term) => term.length === 4).length;
            return no4LetterPoints >= Math.round((70 / 100) * maxPoints);
        }
        getPerfectPangramCount() {
            return data.getList("pangrams").filter((term) => term.length === 7).length;
        }
        hasBingo() {
            return Array.from(new Set(data.getList("answers").map((term) => term.charAt(0)))).length === 7;
        }
        nytCommunity() {
            const date = data.getDate().print;
            const href = `https://www.nytimes.com/${date.replace(
            /-/g,
            "/"
        )}/crosswords/spelling-bee-forum.html#commentsContainer`;
            return fn.a({
                content: "NYT Spelling Bee Forum for today’s game",
                attributes: {
                    href,
                    target: prefix(),
                },
            });
        }
        redditCommunity() {
            return fn.a({
                content: "NYT Spelling Bee Puzzle on Reddit",
                attributes: {
                    href: "https://www.reddit.com/r/NYTSpellingBee/",
                    target: prefix(),
                },
            });
        }
        tomtitBaobab() {
            return fn.a({
                content: "Tomtit & Baobab: A Bee-Inspired Podcast",
                attributes: {
                    href: "https://pod.link/1614136488",
                    target: prefix(),
                },
            });
        }
        bluesky() {
            const hashtags = ["hivemind", "nytspellingbee", "nytbee", "nytsb"].map((tag) =>
                fn.a({
                    content: `#${tag}`,
                    attributes: {
                        href: `https://bsky.app/hashtag/${tag}`,
                        target: prefix(),
                    },
                })
            );
            return fn.toNode([
                "Bluesky hashtags: ",
                ...hashtags.flatMap((tag, i, arr) => (i < arr.length - 1 ? [tag, ", "] : [tag])),
            ]);
        }
        nytSpotlight() {
            const href = `https://www.nytimes.com/spotlight/spelling-bee-forum`;
            return fn.a({
                content: "NYT Spelling Bee Forums",
                attributes: {
                    href,
                    target: prefix(),
                },
            });
        }
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup.toggle(true);
            return this;
        }
        constructor(app) {
            super(app, "Community", "A collection of resources and trivia suggested by the community.");
            this.shortcuts = [
                {
                    combo: "Shift+Alt+C",
                    method: "togglePopup",
                },
            ];
            this.menu = {
                action: "popup",
            };
            const features = fn.ul({
                content: [
                    fn.li({
                        content: [
                            fn.h4({
                                content: "Is there a perfect pangram today?",
                            }),
                            fn.p({
                                content: (() => {
                                    const pp = this.getPerfectPangramCount();
                                    switch (pp) {
                                        case 0:
                                            return `No, not today.`;
                                        case 1:
                                            return `Yes - there’s one perfect pangram today.`;
                                        default:
                                            return `Yes - there are ${pp} perfect pangrams today.`;
                                    }
                                })(),
                            }),
                            fn.em({
                                content: "A “perfect” pangram uses all seven letters exactly once.",
                            }),
                        ],
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: "Is today a Bingo day?",
                            }),
                            fn.p({
                                content: this.hasBingo() ? "Yes - today is a Bingo day!" : "No - not today.",
                            }),
                            fn.em({
                                content: '"Bingo" means each puzzle letter starts at least one word in the list.',
                            }),
                        ],
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: "Can you reach Genius without using any 4-letter words?",
                            }),
                            fn.p({
                                content: this.hasGeniusNo4Letters() ? "Yes - today you can!" : "No - not today.",
                            }),
                        ],
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: "Social Media",
                            }),
                            fn.ul({
                                content: [
                                    fn.li({
                                        content: this.nytCommunity(),
                                    }),
                                    fn.li({
                                        content: this.nytSpotlight(),
                                    }),
                                    fn.li({
                                        content: this.redditCommunity(),
                                    }),
                                    fn.li({
                                        content: this.tomtitBaobab(),
                                    }),
                                    fn.li({
                                        content: this.bluesky(),
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });
            this.popup = new PopupBuilder(this.app, this.key)
                .setContent("title", this.title)
                .setContent("subtitle", this.description)
                .setContent("body", features);
        }
    }

    class TodaysAnswers extends Plugin {
        buildContent() {
            const foundTerms = data.getList("foundTerms");
            const pangrams = data.getList("pangrams");
            const pane = fn.ul({
                classNames: ["sb-modal-wordlist-items"],
            });
            data.getList("answers").forEach((term) => {
                pane.append(
                    fn.li({
                        content: [
                            fn.span({
                                classNames: foundTerms.includes(term) ? ["check", "checked"] : ["check"],
                            }),
                            fn.span({
                                classNames: pangrams.includes(term) ? ["sb-anagram", "pangram"] : ["sb-anagram"],
                                content: term,
                            }),
                        ],
                    }),
                );
            });
            return [
                fn.div({
                    content: data.getList("letters").join(""),
                    classNames: ["sb-modal-letters"],
                }),
                pane,
            ];
        }
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup.setContent("body", this.buildContent()).toggle(true);
            return this;
        }
        constructor(app) {
            super(app, "Today’s Answers", "Reveals the solution of the game", {
                key: "todaysAnswers",
            });
            this.popup = new PopupBuilder(this.app, this.key)
                .setContent("title", this.title)
                .setContent("subtitle", data.getDate().display);
            this.menu = {
                action: "popup",
                icon: "warning",
            };
            this.shortcuts = [
                {
                    combo: "Shift+Alt+T",
                    method: "togglePopup",
                },
            ];
        }
    }

    class PangramHighlighter extends Plugin {
        run(evt) {
            const pangrams = data.getList("pangrams");
            const container = evt?.detail ?? this.app.resultList;
            fn.$$("li", container).forEach((node) => {
                if (pangrams.includes(nyt.getTermFromListItem(node)) || nyt.isMarkedAsPangram(node)) {
                    node.classList.add(this.marker);
                }
            });
            return this;
        }
        constructor(app) {
            super(app, "Pangram Highlighter", "Marks pangrams in the word lists", {
                key: "pangramHighlighter",
                runEvt: prefix("refreshUi"),
            });
            this.marker = prefix("pangram", "d");
            this.app.on(prefix("yesterday"), (evt) => {
                this.run(evt);
            });
            this.run();
        }
    }

    class Googlify extends Plugin {
        listener(evt) {
            if (evt.button !== 0 || !nyt.isTerm(evt.target)) {
                return false;
            }
            window.open(`https://www.google.com/search?q=${encodeURIComponent(evt.target.textContent.trim())}`, prefix());
            return true;
        }
        run() {
            this.containers.forEach((container) => {
                container.addEventListener("pointerup", this.listener, true);
                container.classList.add(prefix("googlified", "d"));
            });
            return this;
        }
        constructor(app) {
            super(app, "Googlify", "Link all result terms to Google");
            this.containers = [document.body];
            this.app.on(prefix("destroy"), () => {
                this.containers.forEach((container) => {
                    container.removeEventListener("pointerup", this.listener, true);
                    container.classList.remove(prefix("googlified", "d"));
                });
            });
            this.run();
        }
    }

    var css = "[data-sba-theme]{--dhue: 0;--dsat: 0%;--dlig: 7%;--link-hue: 206;--shadow-light-color: hsl(49, 96%, 50%, 0.35);--shadow-dark-color: hsl(49, 96%, 50%, 0.7);--highlight-text-color: hsl(0, 0%, 0%)}[data-sba-theme=light]{--text-color:#000;--site-text-color:rgba(0,0,0,.9);--body-bg-color:#fff;--modal-bg-color:hsla(0,0%,100%,.85);--border-color:hsl(0,0%,86%);--area-bg-color:hsl(0,0%,90%);--invalid-color:hsl(0,0%,63%);--menu-hover-color:hsl(0,0%,96%);--head-row-bg-color:hsl(0,0%,96%);--card-color:hsla(52,93%,55%,.1);--link-color:hsl(var(--link-hue), 45%, 38%);--link-visited-color:hsl(var(--link-hue), 45%, 53%);--link-hover-color:hsl(var(--link-hue), 45%, 53%);--sba-success-color:hsl(112,93%,35%);--sba-error-color:hsl(352,93%,35%);--toggle-on-bg-color:hsl(90,62%,40%);--toggle-off-bg-color:hsl(0,0%,65%);--toggle-handle-color:#fff;--toggle-border-color:hsl(0,0%,90%)}[data-sba-theme=dark]{--text-color:hsl(var(--dhue), var(--dsat), 85%);--site-text-color:hsl(var(--dhue), var(--dsat), 100%, 0.9);--body-bg-color:hsl(var(--dhue), var(--dsat), var(--dlig));--modal-bg-color:hsl(var(--dhue), var(--dsat), var(--dlig), 0.85);--border-color:hsl(var(--dhue), var(--dsat), 20%);--area-bg-color:hsl(var(--dhue), var(--dsat), 22%);--invalid-color:hsl(var(--dhue), var(--dsat), 40%);--menu-hover-color:hsl(var(--dhue), var(--dsat), 22%);--head-row-bg-color:hsl(var(--dhue), var(--dsat), 13%);--card-color:hsl(var(--dhue), var(--dsat), 22%);--link-color:hsl(var(--link-hue), 90%, 64%);--link-visited-color:hsl(var(--link-hue), 90%, 76%);--link-hover-color:hsl(var(--link-hue), 90%, 76%);--sba-success-color:hsl(112,93%,55%);--sba-error-color:hsl(352,93%,41%);--toggle-on-bg-color:hsl(90,62%,50%);--toggle-off-bg-color:#ccc;--toggle-handle-color:hsl(var(--dhue), var(--dsat), 22%);--toggle-border-color:hsl(var(--dhue), var(--dsat), 22%)}body{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-field{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-wrapper .sb-modal-message a{color:var(--link-color)}body .pz-game-wrapper .sb-modal-message a:visited{color:var(--link-visited-color)}body .pz-game-wrapper .sb-modal-message a:hover{color:var(--link-hover-color)}body .pz-game-wrapper .sb-progress-marker .sb-progress-value,body .pz-game-wrapper .hive-cell:first-child .cell-fill{background:var(--sb-yellow);fill:var(--sb-yellow);color:var(--highlight-text-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-fill,body .pz-game-wrapper .hive-cell .cell-fill{fill:var(--area-bg-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-letter{fill:var(--text-color)}body[data-sba-theme=dark]{scrollbar-color:var(--invalid-color) var(--body-bg-color)}body[data-sba-theme=dark] .sb-message{color:var(--text-color)}body[data-sba-theme=dark] #conversion-banner{background:inherit}body[data-sba-theme=dark] [class*=ToolbarAdapter-module_toolbarContainer]{--text: var(--text-color);border-top-color:rgba(0,0,0,0);background:rgba(0,0,0,0)}body[data-sba-theme=dark] [class*=ToolbarAdapter-module_toolbarContainer] .pz-dropdown *:hover{color:#fff}body[data-sba-theme=dark] [class*=ToolbarAdapter-module_toolbarContainer] i{filter:invert(1)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__content{color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.primary{background:var(--area-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary{background:var(--head-row-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary:hover{background:var(--area-bg-color)}body[data-sba-theme=dark] .pz-game-wrapper,body[data-sba-theme=dark] #js-hook-pz-moment__loading{background:var(--body-bg-color) !important;color:var(--text-color)}body[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}body[data-sba-theme=dark] .pangram-message .sb-message{background:var(--sb-yellow);color:var(--highlight-text-color)}body[data-sba-theme=dark] .pz-modal__button.white,body[data-sba-theme=dark] .pz-footer,body[data-sba-theme=dark] .pz-moment,body[data-sba-theme=dark] .sb-modal-scrim{background:var(--modal-bg-color) !important;color:var(--text-color) !important}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.primary,body[data-sba-theme=dark] .pz-footer .pz-moment__button.primary,body[data-sba-theme=dark] .pz-moment .pz-moment__button.primary,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.primary{background:var(--area-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.primary:hover,body[data-sba-theme=dark] .pz-footer .pz-moment__button.primary:hover,body[data-sba-theme=dark] .pz-moment .pz-moment__button.primary:hover,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.secondary,body[data-sba-theme=dark] .pz-footer .pz-moment__button.secondary,body[data-sba-theme=dark] .pz-moment .pz-moment__button.secondary,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.secondary{background:var(--head-row-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .pz-footer .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .pz-moment .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.secondary:hover{background:var(--area-bg-color)}body[data-sba-theme=dark] .hive-action__shuffle{position:relative}body[data-sba-theme=dark] .sb-progress-value{font-weight:bold}body[data-sba-theme=dark] .pz-icon-close{filter:invert(1)}body[data-sba-theme=dark].pz-mobile .pz-toolbar-button,body[data-sba-theme=dark].pz-mobile .pz-dropdown__button,body[data-sba-theme=dark].pz-desktop .pz-toolbar-button,body[data-sba-theme=dark].pz-desktop .pz-dropdown__button{background-color:rgba(0,0,0,0) !important}body[data-sba-theme=dark] .pz-dropdown .pz-dropdown__show+.pz-dropdown__list .pz-dropdown__menu-item{background-color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-moment__frame.pz-moment__welcome *{color:var(--text-color)}body[data-sba-theme=dark] .sb-toggle-icon,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow,body[data-sba-theme=dark] .hive-action__shuffle{background-position:-1000px}body[data-sba-theme=dark] .sb-toggle-icon:after,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow:after,body[data-sba-theme=dark] .hive-action__shuffle:after{content:\"\";opacity:.85;top:0;left:0;bottom:0;right:0;position:absolute;z-index:0;filter:invert(1);background-image:inherit;background-repeat:inherit;background-position:center;background-size:inherit}#js-logo-nav rect{fill:var(--body-bg-color)}#js-logo-nav path{fill:var(--text-color)}.pz-moment__loading{color:#000}.pz-nav__hamburger-inner,.pz-nav__hamburger-inner::before,.pz-nav__hamburger-inner::after{background-color:var(--text-color)}.pz-nav{width:100%;background:var(--body-bg-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-frame{border:1px solid var(--border-color);background:var(--body-bg-color);color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-frame.stats .sb-modal-header{background:var(--body-bg-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-frame.stats .sb-stats-bar{background:var(--body-bg-color);color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-frame.stats .sb-stats-bar__text{color:#333}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-ranks__list tr:not(.sb-modal-ranks__current){color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .pz-modal__title,:is(.sb-modal-wrapper,.sba-popover) .sb-modal-close{color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-body .sb-modal-buttons-container button.button-primary{background:var(--area-bg-color);color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-body .sb-modal-buttons-container button.button-primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-body .sb-modal-buttons-container button.button-secondary{background:var(--head-row-bg-color);color:var(--text-color)}:is(.sb-modal-wrapper,.sba-popover) .sb-modal-body .sb-modal-buttons-container button.button-secondary:hover{background:var(--area-bg-color)}.pz-moment__close::before,.pz-moment__close::after{background:var(--text-color)}.pz-moment__close_text{color:currentColor}.pz-modal__button.white:hover{background:var(--area-bg-color)}.sb-input-invalid{color:var(--invalid-color)}.sb-toggle-expand{box-shadow:none}.sb-input-bright,.sb-progress-dot.completed::after{color:var(--sb-yellow)}.hive-cell .cell-fill{stroke:var(--body-bg-color)}.hive-cell .cell-letter{fill:var(--text-color)}.hive-cell.center .cell-letter{fill:var(--highlight-text-color)}.hive-action{background-color:var(--body-bg-color);color:var(--text-color)}.hive-action.push-active{background:var(--menu-hover-color)}[data-sba-theme] .sb-modal-wordlist-items li,.sb-wordlist-items-pag>li,.pz-ad-box,.pz-game-toolbar,.pz-spelling-bee-wordlist,.hive-action,.sb-wordlist-box,.sb-message{border-color:var(--border-color)}.sb-toggle-expand{background:var(--body-bg-color)}.sb-progress-line,.sb-progress-dot::after,.pz-nav::after{background:var(--border-color)}.sb-bob{background-color:var(--border-color)}.sb-bob.active{background-color:var(--text-color)}:root{--sba-cell-inline-padding: 2px;--sba-cell-block-padding: 3px}body:has(.pz-moment__congrats.on-stage) [data-ui=menu]{display:none}.hive-action.push-active.sba-no-feedback{background:var(--body-bg-color) !important}.sba-toggle-switch:where([type=checkbox][role=switch]){-webkit-appearance:none;-moz-appearance:none;appearance:none;position:relative;color:var(--toggle-border-color);font-size:inherit;width:2em;height:1em;box-sizing:content-box;border:1px solid;border-radius:1em;vertical-align:text-bottom;margin:auto;cursor:pointer;background:var(--toggle-off-bg-color)}.sba-toggle-switch:where([type=checkbox][role=switch])::before{content:\"\";position:absolute;top:50%;left:0;transform:translate(0, -50%);box-sizing:border-box;width:.7em;height:.7em;margin:0 .15em;border:1px solid;border-radius:50%;background:var(--toggle-handle-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):checked{background:var(--toggle-on-bg-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):checked::before{left:1em;background:var(--toggle-handle-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):disabled{opacity:.4}.sba{background:var(--body-bg-color);border-radius:6px;border-style:solid;border-width:1px}.sba *:focus{outline:0}.sba ::selection{background:rgba(0,0,0,0)}.sba details{font-size:90%;margin-bottom:1px}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid var(--border-color)}[data-ui].inactive{display:none}[data-ui] b,[data-ui] strong{font-weight:bold}[data-ui] i,[data-ui] em{font-style:italic}[data-ui] .sb-modal-body{padding-block-end:20px}details .sba-data-pane{border-top:none;margin-bottom:2px}:is(.sb-modal-wrapper,.sba-popover){--sba-cell-inline-padding: 7px}:is(.sb-modal-wrapper,.sba-popover) .sba-data-pane{font-size:95%}:is(.sb-modal-wrapper,.sba-popover) i{font-style:italic}.sba-data-pane{border:1px solid var(--border-color);border-collapse:collapse}.sba-data-pane.sba-thead-th-bold thead th{font-weight:bold}.sba-data-pane.sba-table-full-width{width:100%;table-layout:fixed}.sba-data-pane.sba-small-txt{font-size:85%}.sba-data-pane.sba-th-upper th{text-transform:uppercase}.sba-data-pane.sba-equal-cols[data-cols=\"3\"] :is(th,td){width:33.3333333333%}.sba-data-pane.sba-equal-cols[data-cols=\"4\"] :is(th,td){width:25%}.sba-data-pane.sba-equal-cols[data-cols=\"5\"] :is(th,td){width:20%}.sba-data-pane.sba-equal-cols[data-cols=\"6\"] :is(th,td){width:16.6666666667%}.sba-data-pane.sba-equal-cols[data-cols=\"7\"] :is(th,td){width:14.2857142857%}.sba-data-pane.sba-equal-cols[data-cols=\"8\"] :is(th,td){width:12.5%}.sba-data-pane.sba-equal-cols[data-cols=\"9\"] :is(th,td){width:11.1111111111%}.sba-data-pane.sba-equal-cols[data-cols=\"10\"] :is(th,td){width:10%}.sba-data-pane .sba-preeminent{font-weight:bold;border-bottom:2px solid var(--sb-yellow) !important}.sba-data-pane .sba-completed td,.sba-data-pane td.sba-completed{color:var(--invalid-color);font-weight:normal}.sba-data-pane .sba-hidden{display:none}.sba-data-pane caption{text-align:start;padding:var(--sba-cell-block-padding) var(--sba-cell-inline-padding);line-height:1.75;font-weight:700}.sba-data-pane :is(th,td){border:1px solid var(--border-color);border-top:none;padding:var(--sba-cell-block-padding) var(--sba-cell-inline-padding);white-space:nowrap;text-align:center}.sba-data-pane th{background-color:var(--head-row-bg-color)}[data-ui=community] .sb-modal-body{margin-block-end:0}[data-ui=community] h4{font-weight:700;font-family:nyt-franklin,sans-serif;font-size:18px;margin:0 0 1px 0}[data-ui=community] p{margin:0 0 2px 0;font-size:16px}[data-ui=community] em{display:block;font-weight:500;font-size:14px;font-family:nyt-franklin,sans-serif}[data-ui=community] li{margin:0 0 12px 0}[data-ui=community] li ul{padding-left:20px;list-style:disc}[data-ui=community] li ul li{margin:0}[data-ui=community] li ul li a{color:var(--link-color)}[data-ui=community] li ul li a:hover{color:var(--link-hover-color)}[data-ui=milestones]{--flex-gap: 12px}[data-ui=milestones] .sba-milestone-table-wrapper{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--flex-gap)}[data-ui=milestones] figcaption{padding:10px var(--sba-cell-inline-padding)}[data-ui=milestones] b{font-weight:700}[data-ui=milestones] progress{border-width:0;height:5px}[data-ui=milestones] .sba-col{width:calc(50% - var(--flex-gap)/2);min-width:145px}[data-ui=milestones] .sba-summaries{width:calc(48% - var(--flex-gap)/2);min-width:139px}[data-ui=milestones] .sba-summaries .sba-data-pane{table-layout:fixed;margin-block-end:var(--flex-gap)}[data-ui=milestones] .sba-summaries tr :is(td,th){text-align:center}[data-ui=milestones] .sba-tiers{width:calc(52% - var(--flex-gap)/2);min-width:149px}[data-ui=milestones] .sba-tiers .sba-data-pane .sba-preeminent:not(.sba-queen-bee){border-bottom:1px solid var(--border-color) !important}[data-ui=milestones] .sba-tiers .sba-queen-bee.sba-preeminent th::before{content:\"\";display:inline-block;background:no-repeat url(/games-assets/v2/assets/sb-stats-queen-bee.svg);width:19px;height:12px;margin-right:4px}[data-ui=milestones] .sba-data-pane{width:100%}[data-ui=milestones] .sba-data-pane td.sba-progress-box{padding:0}[data-ui=milestones] .sba-data-pane tr.sba-completed :is(th,td){color:var(--invalid-color)}[data-ui=milestones] .sba-data-pane tbody th{text-align:start}[data-ui=milestones] .sba-data-pane tbody td:nth-child(n+2){max-width:100px}[data-ui=header]{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px;justify-content:space-between;align-items:center}[data-ui=header] svg{fill:var(--text-color)}[data-ui=header] .sba-tool-btn{appearance:none;background:none;border:0;color:inherit;padding:1px;width:14px;aspect-ratio:1/1;display:inline-block;cursor:pointer}progress{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0;padding:0;background:rgba(0,0,0,0);display:block;height:10px;border:1px var(--border-color) solid}progress::-webkit-progress-bar{background-color:rgba(0,0,0,0)}progress::-webkit-progress-value{background-color:var(--sb-yellow);height:4px}progress::-moz-progress-bar{background-color:var(--sb-yellow)}[data-ui=progressBar]{border-width:0 0 1px 0;height:6px}[data-ui=spillTheBeans]{text-align:center;padding:14px 0;font-size:38px;margin-top:-24px}:where(button.pz-toolbar-button__sba){appearance:none;background:none;border:0;margin:0;color:inherit;font:inherit;line-height:inherit;letter-spacing:inherit;cursor:pointer}[data-ui=menu]{position:relative;z-index:1;anchor-name:--sba-menu}@keyframes pulse-fade{0%{text-shadow:rgba(255,0,0,.5) 1px 0 0;opacity:1}80%{text-shadow:rgba(255,0,0,0) 1px 0 20px}100%{opacity:0;text-shadow:none}}[data-ui=menu].sba-has-new #sba-menu-entry-point::after{content:\"•\";animation:pulse-fade 9s ease-out 1 forwards;animation-delay:3s;color:rgba(255,0,0,.75);font-size:1.2em;position:absolute;top:0;right:3px}[data-ui=submenu]{position:fixed;inset:auto;margin:6px 0 0;position-anchor:--sba-menu;position-area:block-end span-inline-start;position-try-fallbacks:flip-inline;color:var(--text-color);background:var(--body-bg-color);border:1px var(--border-color) solid;padding:5px;width:179px;max-height:calc(100dvh - 60px);overflow-y:auto;list-style:none;font-family:nyt-franklin,sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.15)}[data-ui=submenu] li{position:relative;line-height:1.8;white-space:nowrap;cursor:pointer;overflow:hidden;display:block;padding:5px 9px 5px 36px;font-size:18px}[data-ui=submenu] li[data-icon=new]:has(svg){background:color-mix(in srgb, var(--games-yellow) 15%, transparent)}[data-ui=submenu] li::before,[data-ui=submenu] li::after{position:absolute;display:block}[data-ui=submenu] li[data-icon=checkmark].checked::after{content:\"✔\";color:var(--sb-yellow);top:3px;left:10px;font-size:20px}[data-ui=submenu] li[data-target=darkMode],[data-ui=submenu] li[data-icon=sba]{border-top:1px solid var(--border-color)}[data-ui=submenu] li[data-icon=sba]{color:currentColor}[data-ui=submenu] li[data-icon=sba]:hover{color:var(--link-hover-color);text-decoration:underline}[data-ui=submenu] li svg{display:inline-block;width:20px;height:20px;position:absolute;left:7px;top:10px}[data-ui=submenu] li svg .shape{fill:var(--text-color)}[data-ui=submenu] li svg .content{fill:var(--sb-yellow)}[data-ui=darkMode] .hive{width:auto;padding:0;flex-grow:2;display:flex}[data-ui=darkMode] .hive-cell{position:static;margin:auto;border:1px solid var(--border-color);padding:20px;width:168px;height:100%;border-radius:6px}[data-ui=darkMode] .cell-letter{font-size:8px;font-weight:600}[data-ui=darkMode] .sba-toggle-label{padding-inline-end:10px}[data-ui=darkMode] .sba-header-wrap{display:flex;justify-content:space-between}.sba-color-selector{display:flex;justify-content:space-around;gap:20px}.sba-color-selector .sba-dark-mode-preview{width:calc(40% - 10px);aspect-ratio:62.4/64.8}.sba-color-selector .sba-dark-mode-preview svg{width:100%;aspect-ratio:inherit;display:block}.sba-color-selector .sba-dark-mode-preview .sba-cell{fill:var(--area-bg-color)}.sba-color-selector .sba-dark-mode-preview .sba-cell text{fill:var(--text-color)}.sba-color-selector .sba-dark-mode-preview .sba-center-cell{fill:var(--sb-yellow)}.sba-color-selector .sba-dark-mode-preview .sba-center-cell text{fill:var(--highlight-text-color)}.sba-color-selector .sba-dark-mode-preview text{font-weight:700;font-size:6px;text-transform:uppercase;dominant-baseline:middle;text-anchor:middle;pointer-events:none}.sba-color-selector .sba-swatches{display:flex;flex-wrap:wrap;list-style:none;justify-content:space-around;padding:0;width:calc(60% - 10px)}.sba-color-selector .sba-swatches li{position:relative;overflow:hidden;width:25%;aspect-ratio:1/1;padding:2px}.sba-color-selector .sba-swatches li:has([for=sbaH360]){width:100%;line-height:50px;aspect-ratio:auto;height:auto}.sba-color-selector .sba-swatches label{border:1px var(--border-color) solid;display:block;overflow:hidden;cursor:pointer;text-align:center;height:100%}.sba-color-selector .sba-swatches label[for=sbaH360]{color:var(--highlight-text-color)}.sba-color-selector .sba-swatches input{position:absolute;left:-100px}.sba-color-selector .sba-swatches input:checked~label:not([for=sbaH360]){border-color:var(--sb-yellow)}.sba-googlified .sb-anagram{cursor:pointer}.sba-googlified .sb-anagram:hover{text-decoration:underline;color:var(--link-hover-color)}:is(#portal-game-toolbar,#js-mobile-toolbar,.pz-toolbar-right) *{color:var(--text-color);border-color:var(--border-color)}:is(#portal-game-toolbar,#js-mobile-toolbar,.pz-toolbar-right) *::selection{background-color:var(--body-bg-color)}:is(#portal-game-toolbar,#js-mobile-toolbar,.pz-toolbar-right) .pz-dropdown__arrow{border-top-color:var(--text-color);border-bottom-color:var(--text-color);border-right-color:rgba(0,0,0,0);border-left-color:rgba(0,0,0,0)}.pz-mobile .pz-toolbar-button__sba{color:var(--text-color)}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]){background-color:var(--body-bg-color) !important}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]):hover{background:var(--menu-hover-color)}[data-sba-theme=dark] #portal-game-toolbar i,[data-sba-theme=dark] #js-mobile-toolbar i,[data-sba-theme=dark] .pz-toolbar-right i{filter:invert(1);background-color:rgba(0,0,0,0)}[data-sba-theme=dark] .conversion-banner__icon{filter:invert(1)}[data-sba-theme=dark] :is(.sb-stats-bar-rank__word-count,.sb-stats-bar-rank__text){filter:contrast(99%);color:#999}[data-sba-theme] .sb-modal-wordlist-items li .check.checked{border:none;height:auto;transform:none}[data-sba-theme] .sb-modal-wordlist-items li .check.checked::after{position:relative;content:\"✔\";color:var(--sb-yellow);top:4px;font-size:16px}[data-sba-theme] .sb-modal-header .sb-modal-letters{position:relative;top:-5px}.pz-toolbar-button:hover,[data-ui=submenu] li:hover{background:var(--menu-hover-color);color:var(--text-color)}.pz-toolbar-button::selection,[data-ui=submenu] li::selection{background-color:rgba(0,0,0,0)}[data-ui=menu].sba-open{background:var(--menu-hover-color);color:var(--text-color)}[data-ui=shortcuts] tbody tr th{text-align:start}[data-ui=shortcuts] tbody tr td:last-child{font-size:16px;cursor:pointer}[data-ui=shortcuts] tbody tr td:last-child::selection{color:currentColor;background-color:rgba(0,0,0,0)}[data-ui=shortcuts] tbody tr td:last-child[data-enabled=true]{color:var(--sba-success-color)}[data-ui=shortcuts] tbody tr td:last-child[data-enabled=false]{color:var(--sba-error-color)}[data-ui=grid] table{width:100%}[data-ui=grid] tbody tr:last-child td{background-color:var(--head-row-bg-color)}[data-ui=grid] tbody tr td{padding:var(--sba-grid-cell-padding, 5px 0) !important}[data-ui=grid] tbody tr td:last-of-type{background-color:var(--head-row-bg-color)}.sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.sba summary{list-style:none;padding:1px 15px 0 21px}.sba summary::marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li{position:relative}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li.sba-pangram{font-weight:700;border-bottom:2px var(--sb-yellow) solid}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks{position:absolute;right:0;bottom:3px}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks mark{display:none}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-s-active .sba-mark-s{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-p-active .sba-mark-p{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-d-active .sba-mark-d{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-c-active .sba-mark-c{display:inline-block}[data-sba-theme] mark{background:rgba(0,0,0,0);font-size:11px;pointer-events:none;text-transform:uppercase}[data-sba-theme] mark::after{content:\" \"}[data-sba-theme] mark:last-of-type::after{content:normal}[data-sba-theme] mark::selection{background-color:rgba(0,0,0,0)}.sb-modal-frame .sb-modal-content{scrollbar-color:var(--invalid-color) var(--body-bg-color)}.sb-modal-frame .sb-modal-content::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}.sba-container{display:none}.sba{margin:var(--sba-app-margin);width:var(--sba-app-width);padding:var(--sba-app-padding);box-sizing:border-box}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}[data-sba-active=true]{--sba-app-width: 100px;--sba-app-padding: 0;--sba-app-margin: 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px}[data-sba-active=true] .sba-container{display:block;position:absolute;inset-block:0;height:fit-content;max-height:100%;margin-block:auto;overflow-y:auto;right:var(--sba-game-offset);z-index:1}[data-sba-active=true] .sba{border-color:rgba(0,0,0,0)}[data-sba-active=true] [data-ui=header]{display:none}[data-sba-active=true] .sb-expanded .sba-container{visibility:hidden;pointer-events:none}[data-sba-active=true] .sb-content-box{max-width:var(--sba-game-width);justify-content:space-between;position:relative}[data-sba-active=true] .sb-controls-box{max-width:calc(100vw - var(--sba-app-width))}@media(max-width: 370px){[data-sba-active=true] .sb-hive{width:70%}[data-sba-active=true].pz-spelling-bee-wordlist .hive-action:not(.hive-action__shuffle){font-size:.9em;margin:0 4px 8px;padding:23px 0}[data-sba-active=true] .hive-action:not(.hive-action__shuffle){width:71px;min-width:auto}[data-sba-active=true] [data-ui=milestones] .sb-modal-body{padding-inline:calc(var(--flex-gap)/2)}[data-sba-active=true] [data-ui=milestones] .sba-queen-bee.sba-preeminent th::before{content:normal}}@media(max-width: 450px){[data-ui=grid] table{table-layout:auto}[data-ui=grid] table.sba-data-pane tbody th{width:28px !important}[data-ui=grid] table.sba-data-pane thead th:first-of-type{width:28px !important}[data-ui=grid] table.sba-data-pane :is(thead,tbody) tr :is(th,td){width:auto;font-size:90%}}[data-sba-active] .pz-game-toolbar .pz-row{padding:0}@media(min-width: 516px){[data-sba-active] .pz-game-toolbar .pz-row{padding:0 12px}[data-sba-active].pz-desktop .sba{left:-175px}[data-ui=overview] .sba-data-pane tbody th{text-transform:none;width:31%}[data-ui=overview] .sba-data-pane tbody td{width:23%}[data-ui=overview] .sba-data-pane tbody tr:nth-child(1) th::after{content:\"ords\"}[data-ui=overview] .sba-data-pane tbody tr:nth-child(2) th::after{content:\"oints\"}[data-ui=overview] .sba-data-pane thead th{width:23%}[data-ui=overview] .sba-data-pane thead th:first-of-type{width:31%}[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 5px}[data-sba-active=true] .sba{border-color:var(--border-color)}[data-sba-active=true] [data-ui=header]{display:flex}}@media(min-width: 900px){[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 8px;--sba-app-margin: 66px 0 0 0}[data-sba-active=true] .sb-content-box{padding:0 var(--sba-game-offset)}[data-sba-active=true] .sb-controls-box{max-width:none}[data-sba-active=true] .sba-container{position:static;height:auto;max-height:none;margin-block:0;overflow-y:visible}[data-sba-active=true] .sb-expanded .sba-container{z-index:1}[data-sba-active=true].pz-desktop .sba{left:-191px}}.sba-popover,.sba-popover *{box-sizing:border-box}.sba-popover{border:0;padding:0;background:rgba(0,0,0,0);color:var(--text-color);overflow:visible;inset:0;margin:auto;width:fit-content;max-width:calc(100vw - 16px);height:fit-content;max-height:calc(100dvh - 48px)}.sba-popover .sb-modal-frame{position:relative;top:auto;bottom:auto;margin:0;max-height:calc(100dvh - 48px);text-align:start}.sba-popover .sba-modal-footer{width:auto;align-self:stretch;margin:0 var(--horizontal-spacing-4, 24px) 16px}.sba-popover::backdrop{background:hsla(0,0%,100%,.85);background:var(--modal-bg-color, hsla(0, 0%, 100%, 0.85))}.sba-popover.sba-floating[popover=manual]::backdrop{display:none}.sba-popover.sba-floating .sb-modal-top{align-items:center;cursor:move;touch-action:none}.sba-popover.sba-floating :is(.sba-move-handle,.sb-modal-close){display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;padding:0;line-height:1}.sba-popover.sba-floating :is(.sba-move-handle,.sb-modal-close) svg{width:100%;height:100%;fill:var(--text-color)}.sba-popover.sba-floating .sba-move-handle{margin-inline-end:16px}.sba-popover.sba-floating.sba-moved{--sba-cell-block-padding: 3px;--sba-cell-inline-padding: 4px;--sba-grid-cell-padding: 3px 0;inset:auto;margin:0;box-shadow:0 4px 24px rgba(0,0,0,.2);border-radius:6px}.sba-popover.sba-floating.sba-moved .sb-modal-frame{width:min(420px,100vw - 16px);overflow:hidden}.sba-popover.sba-floating.sba-moved .sb-modal-top{min-height:0;padding:7px 10px 7px 12px;border-bottom:1px solid var(--border-color)}.sba-popover.sba-floating.sba-moved .sba-window-title{display:block;font-weight:700}.sba-popover.sba-floating.sba-moved .sb-modal-close{margin:0}.sba-popover.sba-floating.sba-moved .sb-modal-header{display:none}.sba-popover.sba-floating.sba-moved .sb-modal-content .sb-modal-body{padding:2px;margin:0}.sba-popover.sba-floating.sba-moved .sba-data-pane{font-size:13px;line-height:1.3}.sba-popover.sba-floating.sba-moved .sba-modal-footer{margin:0;padding:2px 10px 6px;border:0;font-size:11px;line-height:1.2}.sba-popover.sba-dragging{user-select:none;opacity:.9}:where(.sba-popover) :where(.sb-modal-frame){display:flex;flex-direction:column;max-height:inherit;border:1px solid var(--border-color);border-radius:6px;background:var(--body-bg-color);color:var(--text-color);font-family:nyt-franklin,sans-serif}:where(.sba-popover) :where(.sb-modal-top){display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:8px 8px 0;flex-shrink:0}:where(.sba-popover) :where(.sb-modal-close){appearance:none;background:none;border:0;padding:0 6px;color:var(--text-color);cursor:pointer;line-height:1;font-size:32px;font-weight:300}:where(.sba-popover) :where(.sba-window-title){display:none;flex-grow:1;font:700 14px/1.2 nyt-franklin,sans-serif;text-align:start}:where(.sba-popover) :where(.sb-modal-content){overflow-y:auto}:where(.sba-popover) :where(.sb-modal-header,.sb-modal-body){padding-inline:24px}:where(.sba-popover) :where(.sb-modal-header){margin-block-end:16px}:where(.sba-popover) :where(.sb-modal-title){font-family:nyt-karnakcondensed,georgia,serif;font-weight:700;font-size:34px;line-height:1.1;margin:0 0 8px}:where(.sba-popover) :where(.sb-modal-message){font-size:16px;line-height:1.4;margin:0}:where(.sba-popover) :where(.sb-modal-body){font-size:16px}:where(.sba-popover) :where(figure){margin:0}:where(.sba-popover) :where(.sba-modal-footer){padding:10px 10px 0;border-top:1px solid var(--border-color);text-align:right;font-size:13px}:where(.sba-popover) :where(.sba-modal-footer) a{color:var(--link-color, inherit)}:where(.sba-popover) :where(.sb-modal-letters){font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-block-end:12px}:where(.sba-popover) :where(.sb-modal-wordlist-items){list-style:none;padding:0;margin:0;columns:3 140px}:where(.sba-popover) :where(.sb-modal-wordlist-items) li{display:flex;gap:6px;align-items:baseline;break-inside:avoid;padding:2px 0}:where(.sba-popover) :where(.sb-modal-wordlist-items) .pangram{font-weight:700}@media(min-width: 992px){.pz-desktop .sba-popover:not(.sba-moved) .sb-modal-content :is(.sb-modal-header,.sb-modal-body){padding-right:var(--horizontal-spacing-7, 56px)}.pz-desktop .sba-popover:not(.sba-moved) .sba-modal-footer{margin-inline:var(--horizontal-spacing-7, 56px)}}@media(max-width: 767.98px){.sba-popover{width:calc(100vw - 16px)}.sba-popover.sba-floating .sb-modal-top{cursor:auto;touch-action:auto}.sba-popover.sba-floating .sba-move-handle{display:none}}\n";

    class Styles extends Plugin {
        constructor(app) {
            super(app, 'Styles', '');
            this.target = fn.$('head');
            this.ui = fn.style({
                content: css
            });
            app.on(prefix('destroy'), () => this.ui.remove());
        }
    }

    var iconWarning = "<svg version=\"1.1\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\r\n <path class=\"content\" d=\"M11.998 4.625l9.228 15.98H2.773z\"/>\r\n <path class=\"shape\" d=\"m12.006 1.5059a.75.75 0 00-.64844.375l-11.252 19.488a.75.75 0 00.65039 1.125h22.506a.75.75 0 00.64844-1.125l-11.254-19.488a.75.75 0 00-.65039-.375zm.001953 2.25 9.9531 17.238h-19.906l9.9531-17.238z\"/>\r\n <path fill=\"#000\" d=\"m13.44 9.4763-.317 7.306h-2.247l-.317-7.306zm-.048 10.262h-2.785v-1.82h2.785z\"/>\r\n</svg>";

    var iconCoffee = "<svg viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M2.042 15.915c-.418-.09-.867-.402-1.116-.776-.192-.289-.273-.558-.3-1C.561 13.06.517 5.163.574 4.573c.017-.185.032-.232.099-.314a.774.774 0 01.18-.156l.102-.059 7.291.007c6.859.006 7.304.01 7.52.053 1.545.312 2.778 1.251 3.324 2.531.125.293.21.592.284 1.008.089.492.09 1.307.004 1.734-.35 1.725-1.687 3.002-3.553 3.393a5.827 5.827 0 01-1.218.13c-.255.005-.427.02-.464.04-.102.055-.13.155-.147.528-.027.6-.119.996-.32 1.387-.253.492-.614.795-1.163.978l-.196.065-2.762.029c-3.94.04-7.293.034-7.513-.013zm13.386-4.909c.38-.033.602-.094.892-.243a2.398 2.398 0 001.257-1.645c.054-.266.055-.91.002-1.193-.166-.873-.74-1.596-1.492-1.88-.321-.12-.51-.142-1.232-.142h-.665l-.171.153-.008 2.365c-.004 1.3 0 2.392.008 2.426.008.033.046.09.083.124.067.062.078.063.538.063.258 0 .613-.013.788-.028z\" fill=\"#fff\"/><path d=\"M7.158 13.565c.191.064.255 0 .255 0s2.228-2.037 3.246-3.247c.892-1.082.955-2.8-.573-3.501-1.527-.7-2.8.764-2.8.764a2.508 2.508 0 00-3.502-.382l-.063.064c-.764.827-.51 2.228.063 2.992a38.304 38.304 0 003.247 3.183z\" fill=\"#ff5e5b\"/><path class=\"shape\" d=\"M.984 3.495a.266.266 0 00-.038.003c-.51.071-.903.498-.93 1.013a.266.266 0 000 .014v.191c0 .003-.064 6.17.064 9.56a.266.266 0 000 .004 2.364 2.364 0 002.368 2.225c.002 0 6.42 0 9.485-.064h.445a.266.266 0 00.064-.007c.965-.241 1.523-.842 1.803-1.481.244-.556.26-1.096.27-1.54 1.708.003 3.202-.561 4.19-1.59 1.036-1.077 1.523-2.622 1.193-4.35a4.436 4.436 0 00-1.96-3.04 5.15 5.15 0 00-2.95-.938zm.033.532h13.97a4.617 4.617 0 012.649.843.266.266 0 00.007.005 3.903 3.903 0 011.728 2.682.266.266 0 00.003.01c.304 1.58-.133 2.93-1.053 3.888s-2.338 1.522-4.024 1.461a.266.266 0 00-.276.268c0 .432-.034 1.032-.264 1.555-.227.519-.625.963-1.43 1.17h-.395a.266.266 0 00-.005 0c-3.048.064-9.48.063-9.48.063a.266.266 0 00-.002 0A1.823 1.823 0 01.612 14.25C.486 10.89.55 4.718.55 4.718a.266.266 0 000-.002v-.178a.545.545 0 01.467-.51zm13.271 1.886a.266.266 0 00-.266.268v4.583a.266.266 0 00.26.266c.48.012.961-.009 1.439-.065a.266.266 0 00.027-.005 2.4 2.4 0 001.86-2.557 2.535 2.535 0 00-.564-1.622 2.178 2.178 0 00-1.81-.868zm.267.534h.688a.266.266 0 00.009 0 1.643 1.643 0 011.37.656.266.266 0 00.006.01c.297.364.457.822.45 1.292a.266.266 0 00.002.03 1.862 1.862 0 01-1.443 2.002c-.359.041-.72.048-1.081.048z\"/></svg>";

    var iconNew = "<svg version=\"1.1\" viewBox=\"0 0 32 32\" xmlns=\"http://www.w3.org/2000/svg\">\r\n <path d=\"m2 6v20h24.1l4.05-7.2v-5.13l-4.96-7.68z\" fill=\"#fff\" stroke-width=\"0\"/>\r\n <path d=\"m31.4 13.9-5-8c-0.73-1.17-2.01-1.88-3.39-1.88h-19c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h19c1.38 0 2.66-0.711 3.39-1.88l5-8c0.812-1.3 0.812-2.94 0-4.24zm-1.7 3.18-5 8c-0.367 0.588-1 0.939-1.7 0.939h-19c-1.1 0-2-0.898-2-2v-16c0-1.1 0.897-2 2-2h19c0.693 0 1.33 0.352 1.7 0.939l5 8c0.403 0.645 0.403 1.48 0 2.12z\" fill=\"#a10000\"/>\r\n <path d=\"m26.9 12-2.14 8h-1.51l-1.59-5.88-1.45 5.88h-1.48l-2.19-8h1.53l1.55 5.83 1.44-5.83h1.46l1.59 5.83 1.52-5.83zm-10.8 8h-5.2v-8h5.14v1.19h-3.7v2.17h2.98v1.16h-2.98v2.24h3.76zm-6.96 0h-1.4l-3.04-5.11q-0.0703-0.117-0.229-0.381-0.0703-0.117-0.217-0.369v5.86h-1.16v-8h1.59l2.8 4.71q0.0352 0.0586 0.51 0.861v-5.57h1.14z\" fill=\"#a10000\"/>\r\n</svg>\r\n";

    var iconBee = "<svg width=\"442pt\" height=\"348pt\" version=\"1.1\" viewBox=\"0 0 442 348\" xmlns=\"http://www.w3.org/2000/svg\">\n <path d=\"m271 207c-0.645 0-1.3-0.0703-1.95-0.223l-19.2-4.38c-4.71-1.07-7.66-5.76-6.59-10.5 1.07-4.71 5.75-7.68 10.5-6.59l19.2 4.38c4.71 1.07 7.66 5.76 6.59 10.5-0.926 4.06-4.53 6.82-8.53 6.82zm-166-67.5c-11.9-6.34-22.9-13.4-31.4-20.4-33-26.9-43.7-64.6-24.9-87.7 18.8-23.1 57.9-20.2 90.9 6.73 11.1 9.05 24.1 23 35.3 38.2 4.02-13.2 9.17-25.9 14.6-35.7 19-33.9 51.3-49.5 75.1-36.1 23.9 13.3 27.5 49 8.57 82.9-8.34 14.9-22.3 32-36.7 45.5 53.7 15.9 91 56.7 111 84.7l85.7-4e-3c4.83 0 8.75 3.92 8.75 8.75s-3.92 8.75-8.75 8.75h-74.1c3.58 5.89 5.62 9.81 6.04 10.6 1.21 2.38 1.27 5.19 0.152 7.61-1.77 3.84-44.7 94.2-175 94.2-130 0-187-102-190-106-1.15-2.08-1.39-4.53-0.691-6.8 0.898-2.91 21.6-66.7 105-94.9zm21.9 181c-37.1-77.5-34-132-27.7-160-7.62 3.16-14.6 6.6-20.9 10.3-2.48 8.36-16.5 64.3 23.1 139 7.94 3.92 16.4 7.48 25.6 10.5zm1.62-268c-14.7-12-31-18.3-44.3-18.3-9.14 0-16.9 2.97-21.9 9.1-12.3 15.1-2.48 42.8 22.4 63 11.3 9.19 28 19 44.8 26.4 28.8 12.6 48.8 13.8 53 8.66 1.13-1.38 1.34-3.7 1.33-5.4-0.0625-8.34-5.06-20.2-12.6-32.7-0.0547-0.0859-0.105-0.176-0.16-0.258-11.2-18.5-27.9-38.4-42.6-50.5zm129 27.2c13.9-24.8 13.1-50.8-1.84-59.1-14.9-8.32-37.4 4.58-51.3 29.4-6.85 12.2-13.2 29.9-17 46.8 6.15 10.7 10.7 21.3 12.6 30.6 5.1 0.301 10.1 0.824 15 1.57 15.9-12.7 33.4-32.8 42.6-49.3zm80.5 156h-18.2c-4.83 0-8.75-3.92-8.75-8.75s3.92-8.75 8.75-8.75h5.21c-23.5-29.3-63.7-66.6-119-72.9-0.168 0.68-0.406 1.35-0.723 2.01-13.2 27.6-15.9 97.9 30.3 179 27.4-5.6 48.9-15.8 65.4-27.1-12.2-1.87-27-7.99-43.3-22.9-3.55-3.26-3.79-8.8-0.531-12.4 3.26-3.55 8.8-3.81 12.4-0.531 32.4 29.7 54.8 15.9 56.1 15.1 11.3-11.7 18-22.3 21.1-27.7-1.87-3.25-4.98-8.41-9.25-14.7zm-142 94.7c-42.2-76-41.1-137-35.4-170-7.43-1.16-15-3.23-22.1-5.64-5.32 12.5-23.6 70.2 34.2 175 5.75 0.477 11.7 0.762 17.7 0.762 1.92 0 3.67-0.168 5.55-0.207zm-142-52.3c-10.9-30.8-13.7-57-13.2-76.9-13.5 15.1-20.1 29-22.7 35.4 4.41 6.93 16.2 23.9 35.9 41.5z\"/>\n <g transform=\"translate(-267 -474)\">\n  <path d=\"m395 526c-14.7-12-31-18.3-44.3-18.3-9.14 0-16.9 2.97-21.9 9.1-12.3 15.1-2.48 42.8 22.4 63 11.3 9.19 28 19 44.8 26.4 28.8 12.6 48.8 13.8 53 8.66 1.13-1.38 1.34-3.7 1.33-5.4-0.0624-8.34-5.06-20.2-12.6-32.7-0.0547-0.0859-0.105-0.176-0.16-0.258-11.2-18.5-27.9-38.4-42.6-50.5zm129 27.2c13.9-24.8 13.1-50.8-1.84-59.1-14.9-8.32-37.4 4.58-51.3 29.4-6.85 12.2-13.2 29.9-17 46.8 6.15 10.7 10.7 21.3 12.6 30.6 5.1 0.301 10.1 0.824 15 1.57 15.9-12.7 33.4-32.8 42.6-49.3z\" fill=\"#fff\"/>\n  <path d=\"m394 794c-37.1-77.5-34-132-27.7-160-7.62 3.16-14.6 6.6-20.9 10.3-2.48 8.36-16.5 64.3 23.1 139 7.94 3.92 16.4 7.48 25.6 10.5zm80-175c-0.168 0.68-0.407 1.35-0.724 2.01-13.2 27.6-15.9 97.9 30.3 179 27.4-5.6 48.9-15.8 65.4-27.1-12.3-1.87-27-7.99-43.3-22.9-3.55-3.26-3.79-8.8-0.53-12.4 3.26-3.55 8.8-3.81 12.4-0.532 32.4 29.7 54.8 15.9 56.1 15.1 11.3-11.7 18-22.3 21.1-27.7-1.87-3.25-4.98-8.41-9.25-14.7v6e-3h-18.2c-4.83 0-8.75-3.92-8.75-8.75s3.92-8.75 8.75-8.75h5.21c-23.5-29.3-63.7-66.6-119-72.9zm44.3 40.3c0.723-0.0198 1.46 0.0516 2.2 0.221l19.3 4.38c4.71 1.07 7.66 5.76 6.59 10.5-0.926 4.06-4.53 6.82-8.53 6.82h-1e-3c-0.645 0-1.3-0.07-1.95-0.223l-19.2-4.38c-4.71-1.07-7.66-5.76-6.59-10.5 0.903-3.97 4.37-6.71 8.27-6.81zm-54.8 145c-42.2-76-41.1-137-35.4-170-7.43-1.16-15-3.23-22.1-5.64-5.32 12.5-23.6 70.2 34.2 175 5.75 0.477 11.7 0.762 17.7 0.762 1.92 0 3.67-0.168 5.55-0.207zm-142-52.3c-10.9-30.8-13.7-57-13.2-76.9-13.5 15.1-20.1 29-22.7 35.4 4.41 6.93 16.2 23.9 35.9 41.5z\" fill=\"#f8cd05\"/>\n </g>\n</svg>\n";

    const versionToString = (version) => version.split(".").slice(0, 2).join("-");
    const currentVersion = settings.get("version") || "0";
    const versionKey = `newItems-${versionToString(currentVersion)}`;
    const maxDays = 4;
    const isActive = true;
    const shouldHighlightNewItems = () => {
        const { seen, installDate } = settings.get(`options.${versionKey}`) || {};
        if (seen === true) {
            return false;
        }
        if (typeof installDate === "number") {
            const now = Date.now();
            const days = (now - installDate) / (1000 * 60 * 60 * 24);
            if (days >= maxDays) {
                markSeen();
                return false;
            }
        }
        return true;
    };
    const markSeen = () => {
        settings.set(`options.${versionKey}.seen`, true);
    };
    const ensureInstallDate = () => {
        const existing = settings.get(`options.${versionKey}.installDate`);
        if (typeof existing !== "number") {
            settings.set(`options.${versionKey}.installDate`, Date.now());
        }
    };
    var newItems = {
        isActive,
        shouldHighlightNewItems,
        markSeen,
        ensureInstallDate,
    };

    const svgIcons = {
        warning: iconWarning,
        coffee: iconCoffee,
        new: iconNew,
        bee: iconBee,
    };
    newItems.ensureInstallDate();
    if (!newItems.shouldHighlightNewItems()) {
        delete svgIcons.new;
    }
    const paneOffset = 6;
    const supportsAnchors = !!globalThis.CSS?.supports?.("anchor-name: --sba-menu");
    class Menu extends Plugin {
        ensure() {
            fn.$$(".pz-toolbar-button__sba").forEach((elem) => {
                if (elem !== this.ui) {
                    elem.remove();
                }
            });
            const toolbar = nyt.getToolbar();
            if (toolbar && toolbar.lastElementChild !== this.ui) {
                toolbar.append(this.ui);
            }
            return this;
        }
        add() {
            this.ensure();
            this.observer = new MutationObserver(() => this.ensure());
            nyt.getToolbarHosts().forEach((host) => {
                this.observer.observe(host, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ["class"],
                });
            });
            let timer;
            this.onResize = () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.ensure(), 150);
            };
            window.addEventListener("resize", this.onResize);
            return this;
        }
        getComponent(entry) {
            if (entry.dataset.component === this.app.key) {
                return this.app;
            }
            if (this.app.plugins.has(entry.dataset.component)) {
                return this.app.plugins.get(entry.dataset.component);
            }
            return null;
        }
        positionPane() {
            const rect = this.ui.getBoundingClientRect();
            this.pane.style.top = `${Math.round(rect.bottom + paneOffset)}px`;
            this.pane.style.right = `${Math.max(paneOffset, Math.round(window.innerWidth - rect.right))}px`;
        }
        handleEntry(evt) {
            const entry = evt.target.closest("li");
            if (!entry || evt.target.closest("a")) {
                this.pane.hidePopover();
                return;
            }
            const component = this.getComponent(entry);
            this.pane.hidePopover();
            switch (entry.dataset.action) {
                case "boolean":
                    component.toggle();
                    entry.classList.toggle("checked", component.getState());
                    break;
                case "popup":
                    component.togglePopup();
                    break;
            }
        }
        buildEntry(plugin, key) {
            const icon = plugin.menu.icon || null;
            const data = {
                component: key,
                action: plugin.menu.action,
            };
            const classNames = [];
            if (plugin.menu.action === "boolean") {
                data.icon = "checkmark";
                if (plugin.getState()) {
                    classNames.push("checked");
                }
            } else if (icon) {
                data.icon = icon;
            }
            return fn.li({
                classNames,
                attributes: {
                    title: fn.toNode(plugin.description).textContent,
                },
                data,
                content: icon && svgIcons[icon] ? [svgIcons[icon], plugin.title] : plugin.title,
            });
        }
        constructor(app) {
            super(app, "Menu", "");
            const paneId = prefix("menu-pane", "d");
            this.paneOpen = false;
            this.pane = fn.ul({
                attributes: {
                    id: paneId,
                    popover: "auto",
                },
                classNames: ["pane"],
                data: {
                    ui: "submenu",
                },
                events: {
                    click: (evt) => this.handleEntry(evt),
                    beforetoggle: (evt) => {
                        this.paneOpen = evt.newState === "open";
                        this.pane.dataset[prefix("open")] = this.paneOpen;
                        this.ui.classList.toggle(prefix("open", "d"), this.paneOpen);
                        if (this.paneOpen) {
                            newItems.markSeen();
                            if (!supportsAnchors) {
                                this.positionPane();
                            }
                        }
                    },
                },
                content: fn.li({
                    classNames: this.app.getState() ? ["checked"] : [],
                    attributes: {
                        title: this.app.title,
                    },
                    data: {
                        component: this.app.key,
                        icon: "checkmark",
                        action: "boolean",
                    },
                    content: `Show ${settings.get("title")}`,
                }),
            });
            this.ui = fn.button({
                attributes: {
                    type: "button",
                    popovertarget: paneId,
                },
                aria: {
                    haspopup: "menu",
                },
                data: {
                    ui: this.key,
                },
                classNames: ["pz-toolbar-button", "pz-toolbar-button__sba"],
                content: fn.span({
                    attributes: {
                        id: prefix("menu-entry-point", "d"),
                    },
                    content: settings.get("title"),
                }),
            });
            document.body.append(this.pane);
            this.onKeyUp = (evt) => {
                if (/^(Ent|Key|Dig)/.test(evt.code) && this.paneOpen) {
                    this.pane.hidePopover();
                }
            };
            document.addEventListener("keyup", this.onKeyUp);
            app.on(prefix("pluginsReady"), (evt) => {
                evt.detail.forEach((plugin, key) => {
                    if (plugin.menu?.action) {
                        this.pane.append(this.buildEntry(plugin, key));
                    }
                });
                this.pane.append(
                    fn.li({
                        attributes: {
                            title: settings.get("support.text"),
                        },
                        data: {
                            icon: prefix(),
                            component: prefix("web"),
                            action: "link",
                        },
                        content: fn.a({
                            content: [iconCoffee, settings.get("support.text")],
                            attributes: {
                                href: settings.get("support.url"),
                                target: prefix(),
                            },
                        }),
                    }),
                );
                this.ui.classList.toggle(prefix("has-new", "d"), !!fn.$('[data-icon="new"] svg', this.pane));
            });
            app.on(prefix("destroy"), () => {
                this.observer?.disconnect();
                window.removeEventListener("resize", this.onResize);
                document.removeEventListener("keyup", this.onKeyUp);
                this.ui.remove();
                this.pane.remove();
            });
        }
    }

    function buildDataMatrix() {
        const foundTerms = data.getList("foundTerms");
        const allTerms = data.getList("answers");
        const allLetters = Array.from(new Set(allTerms.map((t) => t[0]))).sort();
        const allLengths = Array.from(new Set(allTerms.map((t) => t.length))).sort((a, b) => a - b);
        allLetters.push("∑");
        allLengths.push("∑");
        const header = [""].concat(allLetters);
        const matrix = [header];
        const letterTpl = Object.fromEntries(allLetters.map((l) => [l, {fnd: 0, all: 0}]));
        const rows = Object.fromEntries(allLengths.map((len) => [len, structuredClone(letterTpl)]));
        for (const term of allTerms) {
            const letter = term[0];
            const len = term.length;
            const buckets = [
                [len, letter],
                [len, "∑"],
                ["∑", letter],
                ["∑", "∑"],
            ];
            for (const [r, c] of buckets) {
                rows[r][c].all++;
                if (foundTerms.includes(term)) {
                    rows[r][c].fnd++;
                }
            }
        }
        for (const [len, cols] of Object.entries(rows)) {
            const row = [len];
            for (const col of allLetters) {
                const cell = cols[col];
                row.push(cell.all > 0 ? `${cell.fnd}/${cell.all}` : "-");
            }
            matrix.push(row);
        }
        return matrix;
    }
    const markCompletedRatioCells = ({cellData, cellObj}) => {
        if (typeof cellData === "string") {
            const parts = cellData.split("/");
            if (parts.length === 2 && parts[0] === parts[1]) {
                cellObj.classNames.push(prefix("completed", "d"));
            }
        }
    };

    var gridIcon = "<svg version=\"1.1\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\r\n <path d=\"m0 0v24h24v-24h-24zm2 2h9v9h-9v-9zm11 0h9v9h-9v-9zm-11 11h9v9h-9v-9zm11 0h9v9h-9v-9z\" stroke-dasharray=\"0.5, 0.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"/>\r\n</svg>\r\n";

    class Grid extends Plugin {
        togglePopup() {
            this.popup.toggle(!this.popup.isOpen);
            return this;
        }
        createTable() {
            return new TableBuilder(buildDataMatrix(), {
                hasHeadRow: true,
                hasHeadCol: true,
                classNames: ["data-pane", "th-upper", "equal-cols", "small-txt"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"]),
                cellCallbacks: [markCompletedRatioCells],
            }).ui;
        }
        run() {
            this.popup.setContent("body", this.createTable());
            return this;
        }
        constructor(app) {
            super(app, "Grid", "The number of words by length and by first letter.", { runEvt: prefix("refreshUi") });
            this.popup = new PopupBuilder(this.app, this.key, { floating: true })
                .setContent("title", this.title)
                .setContent("subtitle", this.description)
                .setContent("body", this.createTable());
            this.menu = {
                action: "popup",
                icon: "new",
            };
            this.panelBtn = fn.button({
                classNames: [prefix("tool-btn", "d")],
                attributes: {
                    type: "button",
                    title: this.title,
                    popovertarget: this.popup.id,
                },
                aria: {
                    label: this.title,
                },
                content: gridIcon,
            });
            this.shortcuts = [
                {
                    combo: "Shift+Alt+G",
                    method: "togglePopup",
                },
            ];
        }
    }

    const deleteDelay = 50;
    class NytShortcuts extends Plugin {
        toggleYesterday() {
            return this.triggerPopup("yesterday");
        }
        toggleStats() {
            return this.triggerPopup("stats");
        }
        triggerPopup(name) {
            if (nyt.closeModal()) {
                setTimeout(hive.deleteLetter, deleteDelay);
            } else if (!PopupBuilder.closeAll()) {
                nyt.clickToolbarButton(name);
            }
            return this;
        }
        constructor(app) {
            super(app, "NYT Shortcuts", "Adds keyboard shortcuts to native NYT pop-ups", { key: "nytShortcuts" });
            this.shortcuts = [
                { combo: "Shift+Alt+Y", method: "toggleYesterday", label: "Yesterday’s Answers" },
                { combo: "Shift+Alt+I", method: "toggleStats", label: "Statistics" },
            ].map((shortcut) => ({ ...shortcut, origin: "nyt" }));
        }
    }

    const registry = new Map();
    const modifierMap = new Map([
        ["ctrl", { canonical: "Control", human: "Ctrl" }],
        ["control", { canonical: "Control", human: "Ctrl" }],
        ["alt", { canonical: "Alt", human: "Alt" }],
        ["altgr", { canonical: "AltGraph", human: "AltGr" }],
        ["altgraph", { canonical: "AltGraph", human: "AltGr" }],
        ["meta", { canonical: "Meta", human: "Meta" }],
        ["shift", { canonical: "Shift", human: "Shift" }],
    ]);
    const order = Array.from(new Set(Array.from(modifierMap.values()).map((m) => m.canonical)));
    const characterKeys = { nyt: [], sba: [] };
    const registerCharacterKey = (shortcut) => {
        const key = getCharacterKey(shortcut.combo);
        if (!key || !/^[A-Z]$/.test(key)) {
            return;
        }
        characterKeys[shortcut.origin || "sba"].push(key);
    };
    const getCharacterKey = (combo) => {
        const match = combo.match(/(?:^|\+)(?:Key|Digit)?([A-Za-z0-9])(?:\+|$)/i);
        return match ? match[1].toUpperCase() : "";
    };
    const comboToHuman = (combo) => {
        return (
            combo
                .split("+")
                .map((part) => {
                    const modifier = modifierMap.get(part.toLowerCase());
                    return modifier ? modifier.human : part.replace(/^Digit|^Key/, "");
                })
                .join(" + ")
        );
    };
    const requiresDeletion = (combo) => {
        const key = getCharacterKey(normalizeCombo(combo));
        const pool = nyt.findModalCloser() ? characterKeys.sba : characterKeys.sba.concat(characterKeys.nyt);
        return !!key && pool.includes(key);
    };
    const isValidShortcut = (obj) =>
        obj && typeof obj === "object" && typeof obj.combo === "string" && typeof obj.callback === "function";
    const normalizeCombo = (data) => {
        if (data instanceof KeyboardEvent) {
            const parts = [];
            order.forEach((modifier) => {
                if (data.getModifierState(modifier)) {
                    parts.push(modifier);
                }
            });
            parts.push(data.code);
            data = parts;
        }
        if (isValidShortcut(data)) {
            data = data.combo;
        }
        if (typeof data === "string") {
            data = data.replace(/\s+/g, "");
            const charKey = getCharacterKey(data);
            data = data
                .split("+")
                .map((part) =>
                    part.toUpperCase() === charKey ? (!isNaN(part) ? "Digit" : "Key") + part.toUpperCase() : part
                );
        }
        if (!Array.isArray(data)) {
            throw new Error("Unsupported input type for combo normalization");
        }
        const code = data.filter((part) => part.startsWith("Key") || part.startsWith("Digit")).join("");
        data = data
            .filter((part) => part !== code)
            .map((part) => {
                part = part.toLowerCase();
                if (!modifierMap.has(part)) {
                    return part.charAt(0).toUpperCase() + part.slice(1);
                }
                return modifierMap.get(part).canonical;
            });
        data.sort();
        if (code) {
            data.push(code);
        }
        return data.join("+");
    };
    const getSbaShortcutEntry = (event) => get(normalizeCombo(event));
    const handleShortcut = (event) => {
        const entry = getSbaShortcutEntry(event);
        if (!entry || !entry.enabled) {
            return false;
        }
        event.preventDefault();
        if (!getCharacterKey(normalizeCombo(event))) {
            entry.callback();
            return true;
        }
        hive.deleteLetter().then(() => entry.callback());
        return true;
    };
    const set = (combo, shortcut) => {
        combo = normalizeCombo(combo);
        if (!isValidShortcut(shortcut)) {
            return false;
        }
        if (!shortcut.human) {
            shortcut.human = comboToHuman(shortcut.combo);
        }
        if (typeof shortcut.enabled === "undefined") {
            shortcut.enabled = true;
        }
        registry.set(combo, shortcut);
        settings.set(`options.${shortcut.module}.shortcuts.${shortcut.combo}`, { enabled: shortcut.enabled });
        return true;
    };
    const add = (shortcut) => {
        if (!isValidShortcut(shortcut)) {
            throw new Error("Invalid shortcut");
        }
        shortcut.combo = normalizeCombo(shortcut);
        const stored = settings.get(`options.${shortcut.module}.shortcuts.${shortcut.combo}`);
        Object.assign(shortcut, {
            enabled: typeof stored?.enabled === "boolean" ? stored.enabled : true,
            human: comboToHuman(shortcut.combo),
        });
        if (registry.has(shortcut.combo)) {
            console.warn(`Ignoring ${shortcut.human}, this shortcut is already registered`);
            return false;
        }
        registerCharacterKey(shortcut);
        delete shortcut.origin;
        set(shortcut.combo, shortcut);
        return true;
    };
    const getRegistry = () => {
        return registry;
    };
    const get = (input) => {
        const combo = normalizeCombo(input);
        if (!registry.has(combo)) {
            return false;
        }
        return registry.get(combo);
    };
    var shortcutRegistry = {
        set,
        add,
        get,
        normalizeCombo,
        handleShortcut,
        getCharacterKey,
        requiresDeletion,
        getSbaShortcutEntry,
        getRegistry,
    };

    const getToggleButton = (id, checked, callback, labelText = "", labelPosition = "before") => {
        const toggleBtn = fn.input({
            attributes: {
                type: "checkbox",
                id,
                role: "switch",
                checked,
            },
            classNames: [prefix("toggle-switch", "d")],
            events: {
                change: (event) => callback(event),
            },
        });
        if (!labelText) {
            return toggleBtn;
        }
        const label = fn.label({
            attributes: {
                htmlFor: id,
            },
            content: labelText,
            classNames: [prefix("toggle-label", "d")],
        });
        switch (labelPosition) {
            case "wrap":
                label.append(toggleBtn);
                label.classList.add(prefix("toggle-container", "d"));
                return label;
            case "before":
                return fn.span({
                    classNames: [prefix("toggle-container", "d")],
                    content: [label, toggleBtn],
                });
            case "after":
                return fn.span({
                    classNames: [prefix("toggle-container", "d")],
                    content: [toggleBtn, label],
                });
        }
    };

    class ShortcutScreen extends Plugin {
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup
                .setContent("subtitle", this.description)
                .setContent("body", this.createTable())
                .toggle(true);
            return this;
        }
        createTable() {
            return (new TableBuilder(this.getData(), {
                hasHeadRow: true,
                hasHeadCol: true,
                classNames: ["data-pane", "tbody-th-start", "thead-th-bold"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"])
            })).ui;
        }
        getData() {
            const rows = [["", "Shortcut", "State"]];
            shortcutRegistry.getRegistry().forEach((shortcut) => {
                const toggleBtn = getToggleButton(shortcut.combo, shortcut.enabled, (evt) => {
                    const shortcut = shortcutRegistry.get(evt.target.closest("input").id);
                    shortcut.enabled = !shortcut.enabled;
                    shortcutRegistry.set(shortcut.combo, shortcut);
                });
                rows.push([shortcut.label, shortcut.human, toggleBtn]);
            });
            return rows;
        }
        constructor(app) {
            let msg = [`This is a list of all SBA shortcuts. Each one triggers a feature — for example, opening and closing a panel. 
            If a shortcut conflicts with your system or browser, you can disable it here.`,];
            if (app.envIs("mobile")) {
                msg.push(fn.i({
                    content: `Note: On mobile devices, keyboard shortcuts may be limited or unavailable, depending on your setup.`,
                }));
            }
            super(app, "Shortcuts", msg.map((part) => fn.p({content: part})));
            this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);
            this.menu = {
                action: "popup"
            };
            this.shortcuts = [{
                combo: "Shift+Alt+S", method: "togglePopup",
            },];
        }
    }

    const getPlugins$1 = () => {
        return {
            Header,
            Overview,
            LetterCount,
            FirstLetter,
            FirstTwoLetters,
            Pangrams,
            ProgressBar,
            SpillTheBeans,
            Grid,
            DarkMode,
            PangramHighlighter,
            Googlify,
            Styles,
            Menu,
            Milestones,
            Community,
            ShortcutScreen,
            TodaysAnswers,
            NytShortcuts,
        };
    };

    const dismissKey = `${settings.get("prefix")}-outage-dismissed`;
    const today = () => new Date().toISOString().slice(0, 10);
    const isDismissed = () => {
        try {
            return localStorage.getItem(dismissKey) === today();
        } catch (e) {
            return false;
        }
    };
    const dismiss = () => {
        try {
            localStorage.setItem(dismissKey, today());
        } catch (e) {
        }
    };
    const reportUrl = (problems) => {
        const title = `SBA ${settings.get("version")} doesn't start`;
        const body = [
            `Version: ${settings.get("version")}`,
            `Date: ${today()}`,
            `Browser: ${navigator.userAgent}`,
            `Viewport: ${window.innerWidth}px`,
            "",
            "Not found or failed:",
            ...problems.map((problem) => `- ${problem}`),
        ].join("\n");
        return `${settings.get("issues")}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    };
    const show = (problems) => {
        console.warn(
            `${settings.get("label")} ${settings.get("version")} can't run on this version of the NYT page:\n` +
                problems.map((problem) => `- ${problem}`).join("\n"),
        );
        document.body.dataset[`${settings.get("prefix")}Outage`] = JSON.stringify(problems);
        if (isDismissed() || document.querySelector(`[data-ui="${settings.get("prefix")}-outage"]`)) {
            return null;
        }
        const link = (href, text) =>
            fn.a({
                content: text,
                attributes: { href, target: "_blank", rel: "noopener" },
                style: { color: "inherit", textDecoration: "underline", marginRight: "16px" },
            });
        const notice = fn.div({
            attributes: { popover: "manual", role: "status" },
            data: { ui: `${settings.get("prefix")}-outage` },
            style: {
                position: "fixed",
                inset: "auto 16px auto auto",
                top: "16px",
                margin: "0",
                maxWidth: "min(420px, calc(100vw - 32px))",
                padding: "14px 40px 14px 16px",
                border: "1px solid #ccc",
                borderLeft: "6px solid #f7da21",
                borderRadius: "6px",
                background: "#fff",
                color: "#121212",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                font: "15px/1.4 nyt-franklin, Helvetica, Arial, sans-serif",
                textAlign: "left",
            },
            content: [
                fn.strong({
                    content: settings.get("label"),
                    style: { display: "block", marginBottom: "4px" },
                }),
                fn.p({
                    content:
                        "can’t run right now. There have been changes to the Spelling Bee page and the assistant needs an update. A fix is on the way!",
                    style: { margin: "0 0 8px" },
                }),
                fn.p({
                    content: [link(settings.get("url"), "News and updates"), link(reportUrl(problems), "Report the problem")],
                    style: { margin: "0", fontSize: "13px" },
                }),
                fn.button({
                    content: "×",
                    attributes: { type: "button", title: "Close" },
                    aria: { label: "Close" },
                    style: {
                        position: "absolute",
                        top: "6px",
                        right: "8px",
                        border: "0",
                        background: "none",
                        color: "inherit",
                        font: "300 26px/1 Helvetica, Arial, sans-serif",
                        cursor: "pointer",
                        padding: "0 4px",
                    },
                    events: {
                        click: () => {
                            dismiss();
                            notice.remove();
                        },
                    },
                }),
            ],
        });
        document.body.append(notice);
        notice.showPopover?.();
        return notice;
    };
    var outageNotice = {
        show,
    };

    const plugins = new Map();
    const register = (Plugin, app) => {
        const instance = new Plugin(app);
        instance.add();
        plugins.set(instance.key, instance);
        (instance.shortcuts || []).forEach((instanceShortcut) => {
            const { method, ...remainder } = instanceShortcut;
            const shortcut = {
                ...remainder,
                label: instanceShortcut.label || instance.title,
                module: instance.key,
                callback: () => instance[method](),
            };
            shortcutRegistry.add(shortcut);
        });
    };
    const getPlugins = () => plugins;
    const getPluginByKey = (key) => {
        if (!plugins.has(key)) {
            throw new Error(`Plugin with key "${key}" not found.`);
        }
        return plugins.get(key);
    };
    var pluginRegistry = {
        getPlugins,
        getPluginByKey,
        register,
    };

    class App extends Widget {
        static resultListTimeout = 10000;
        domSet(key, value) {
            document.body.dataset[prefix(key)] = value;
            return this;
        }
        domUnset(key) {
            delete document.body.dataset[prefix(key)];
            return this;
        }
        domGet(key) {
            if (typeof document.body.dataset[prefix(key)] === "undefined") {
                return false;
            }
            return JSON.parse(document.body.dataset[prefix(key)]);
        }
        envIs(env) {
            return nyt.isEnv(env);
        }
        focusGame() {
            const titleBar = nyt.find("titleBar", document);
            const gameHeader = nyt.find("gameHeader", document);
            if (!this.envIs("desktop") || !titleBar || !gameHeader) {
                return false;
            }
            window.scrollTo(0, 0);
            const titlebarRect = titleBar.getBoundingClientRect();
            window.scrollTo(0, titlebarRect.top + titlebarRect.height - gameHeader.offsetHeight);
            return true;
        }
        fail(problems) {
            this.failed = true;
            this.ui.dispatchEvent(new Event(prefix("destroy")));
            outageNotice.show(problems);
            return this;
        }
        load() {
            return Promise.all([nyt.waitForResultList(App.resultListTimeout), nyt.waitForToolbar(App.resultListTimeout)])
                .then(([resultList]) => {
                    const { ok, problems } = nyt.selfCheck();
                    if (!ok) {
                        this.fail(problems.map((problem) => `${problem.selector} not found (${problem.impact})`));
                        return;
                    }
                    try {
                        this.start(resultList);
                    } catch (error) {
                        console.error(error);
                        this.fail([`start failed: ${error.message}`]);
                    }
                })
                .catch((error) => this.fail([error.message]));
        }
        start(resultList) {
            this.resultList = resultList;
            this.observer = this.buildObserver();
            data.init(this, nyt.getFoundTerms(resultList));
            hive.init();
            this.add();
            this.domSet("active", true);
            shortcutRegistry.add(this.shortcut);
            this.registerPlugins();
            this.trigger(prefix("refreshUi"), null);
            document.dispatchEvent(new Event(prefix("ready")));
            document.addEventListener("keydown", this.onKeyDown);
            document.addEventListener("keyup", this.onKeyUp);
            this.on(prefix("newInput"), () => {
                if (this.pendingShortcut) {
                    shortcutRegistry.handleShortcut(this.pendingShortcut);
                    this.pendingShortcut = null;
                }
            });
            this.focusGame();
        }
        onKeyDown = (event) => {
            if (!shortcutRegistry.getSbaShortcutEntry(event)) {
                return;
            }
            if (!shortcutRegistry.requiresDeletion(event)) {
                shortcutRegistry.handleShortcut(event);
            } else {
                this.pendingShortcut = event;
            }
        };
        onKeyUp = (event) => {
            if (event.code === "Escape") {
                nyt.closeModal();
            }
        };
        getState() {
            return this.domGet("active");
        }
        toggle() {
            this.domSet("active", !this.getState());
            return this;
        }
        handleMutation(mutation) {
            if (mutation.type !== "childList" || !(mutation.target instanceof HTMLElement)) {
                return;
            }
            if (nyt.isHiveInput(mutation.target)) {
                this.trigger(prefix("newInput"), mutation.target);
                return;
            }
            if (mutation.target === this.resultList) {
                const item = mutation.addedNodes[0];
                if (item instanceof HTMLElement && item.textContent.trim()) {
                    this.trigger(prefix("newWord"), nyt.getTermFromListItem(item));
                }
                return;
            }
            const yesterday = nyt.findYesterdayModal(mutation.addedNodes);
            if (yesterday) {
                this.trigger(prefix("yesterday"), yesterday);
            }
        }
        buildObserver() {
            const observer = new MutationObserver((mutationList) => {
                mutationList.forEach((mutation) => this.handleMutation(mutation));
            });
            observer.observe(this.gameWrapper, {
                childList: true,
                subtree: true,
            });
            return observer;
        }
        buildUi() {
            const events = {};
            events[prefix("destroy")] = () => {
                this.observer?.disconnect();
                document.removeEventListener("keydown", this.onKeyDown);
                document.removeEventListener("keyup", this.onKeyUp);
                this.container.remove();
                this.domUnset("theme");
                this.domUnset("active");
                this.domUnset("health");
            };
            return fn.div({
                data: {
                    id: this.key,
                    version: settings.get("version"),
                },
                classNames: [settings.get("prefix")],
                events,
            });
        }
        registerPlugins() {
            Object.values(getPlugins$1()).forEach((plugin) => {
                pluginRegistry.register(plugin, this);
            });
            this.plugins = pluginRegistry.getPlugins();
            this.trigger(prefix("pluginsReady"), this.plugins);
            return this;
        }
        add() {
            this.container.append(this.ui);
            nyt.find("contentBox").prepend(this.container);
            return this;
        }
        constructor(gameWrapper) {
            super(settings.get("label"), {
                key: prefix("app"),
            });
            const oldInstance = fn.$(`[data-id="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix("destroy")));
            }
            this.gameWrapper = gameWrapper;
            this.ui = this.buildUi();
            this.container = fn.div({
                classNames: [prefix("container", "d")],
            });
            this.pendingShortcut = null;
            this.shortcut = {
                combo: "Shift+Alt+A",
                label: "Assistant Panel",
                module: this.key,
                callback: () => this.toggle(),
            };
            this.ready = this.load();
        }
    }

    const gameWrapper = nyt.getGameWrapper();
    if (gameWrapper) {
        new App(gameWrapper);
    } else {
        outageNotice.show([`${nyt.selectors.gameWrapper} not found`]);
    }

})();
