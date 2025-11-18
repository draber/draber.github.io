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
    var targetUrl = "https://www.nytimes.com/puzzles/spelling-bee";

    var version = "5.2.0";

    const storageKey = `${prefix$1}-settings`;
    const state = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix$1,
        support: support,
        targetUrl: targetUrl,
        options: JSON.parse(localStorage.getItem(storageKey) || "{}"),
    };
    const saveOptions = () => {
        localStorage.setItem(storageKey, JSON.stringify(state.options));
    };
    const migrateToVersion5 = () => {
        if (typeof state.options.darkMode !== "boolean") return;
        console.warn(`⚠️ ${state.label} detected legacy settings format. Performing migration to 5.0.0...`);
        const migrated = {};
        const obsoleteKeys = ["darkModeColors", "yourProgress", "version", "oldVersion", "score", "community"];
        const removeSubkeys = ["enabled", "shortcuts"];
        for (const [key, value] of Object.entries(state.options)) {
            if (obsoleteKeys.includes(key)) continue;
            if (key === "darkMode") continue;
            if (typeof value === "object") {
                const cleaned = { ...value };
                removeSubkeys.forEach(k => delete cleaned[k]);
                migrated[key] = cleaned;
            }
        }
        if ("darkMode" in state.options) {
            const scheme = {
                mode: !!state.options.darkMode ? "dark" : "light",
                hsl: {
                    hue: 0,
                    sat: 0,
                    lig: 7,
                },
            };
            if (typeof state.options.darkModeColors === "object") {
                scheme.hsl = Object.assign(scheme.hsl, state.options.darkModeColors);
            }
            migrated.darkMode = scheme;
        }
        state.options = {
            ...migrated,
            version: "5.0.0",
            oldVersion: state.options.version || null
        };
        saveOptions();
    };
    migrateToVersion5();
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
            if (typeof current[part] !== "object") {
                if (typeof current[part] !== "undefined") {
                    console.error(`${part} is not an object`);
                    return false;
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

    let lists;
    const sbData = window.gameData.today;
    let app;
    const completeLists = () => {
        lists.foundPangrams = lists.foundTerms.filter(term => lists.pangrams.includes(term));
        lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
        app.trigger(prefix('refreshUi'));
    };
    const initLists = foundTerms => {
        lists = {
            answers: sbData.answers,
            pangrams: sbData.pangrams,
            letters: sbData.validLetters,
            foundTerms: foundTerms
        };
        completeLists();
    };
    const getList = type => {
        return lists[type];
    };
    const getId = () => {
        return sbData.id;
    };
    const getDate = () => {
        return {
            display: sbData.displayDate,
            print: sbData.printDate,
        }
    };
    const getCenterLetter = () => {
        return sbData.centerLetter;
    };
    const getCount = type => {
        return lists[type].length;
    };
    const getPoints = type => {
        const data = lists[type];
        let points = 0;
        data.forEach(term => {
            if (lists.pangrams.includes(term)) {
                points += term.length + 7;
            } else if (term.length > 4) {
                points += term.length;
            } else {
                points += 1;
            }
        });
        return points;
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
    const updateLists = term => {
        lists.foundTerms.push(term);
        completeLists();
    };
    const init$1 = (_app, foundTerms) => {
        app = _app;
        initLists(foundTerms);
        app.on(prefix('newWord'), evt => {
            updateLists(evt.detail);
        });
    };
    var data = {
        init: init$1,
        getList,
        getCount,
        getPoints,
        getId,
        getDate,
        getCenterLetter,
        getFoundAndTotal
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

    const isEmptyObject = (obj) => {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    };

    let container;
    const cells = {};
    const actionButtons = {};
    const hitActionButton = (action) => {
        return new Promise((resolve) => {
            if (!actionButtons[action]) {
                return resolve();
            }
            const evtOpts = { bubbles: true, cancelable: true };
            const feedbackClass = prefix("no-feedback", "d");
            actionButtons[action].classList.add(feedbackClass);
            actionButtons[action].dispatchEvent(new Event("touchstart", evtOpts));
            setTimeout(() => {
                actionButtons[action].dispatchEvent(new Event("touchend", evtOpts));
                actionButtons[action].classList.remove(feedbackClass);
                resolve();
            }, 50);
        });
    };
    const deleteLetter = () => hitActionButton("delete");
    const submitWord = () => hitActionButton("submit");
    const typeLetter = (letter) => {
        return new Promise((resolve) => {
            const cell = getCellByLetter(letter);
            if (!cell) {
                return resolve();
            }
            const polygon = fn.$('polygon', cell);
            const evtOpts = { bubbles: true, cancelable: true };
            polygon.dispatchEvent(new Event("touchstart", evtOpts));
            setTimeout(() => {
                polygon.dispatchEvent(new Event("touchend", evtOpts));
                resolve();
            }, 50);
        });
    };
    const typeWord = (word, slow=false) => {
        const letters = [...word.toLowerCase()];
        let chain = Promise.resolve();
        const delay = slow ?  250 : 0;
        letters.forEach((letter) => {
            chain = chain
                .then(() => typeLetter(letter))
                .then(() => new Promise((res) => setTimeout(res, delay)));
        });
        return chain
            .then(() => new Promise((res) => setTimeout(res, delay)))
            .then(() => submitWord());
    };
    const deleteWord = () => {
        const input = fn.$(".sb-hive-input-content.non-empty", container);
        if (!input) {
            return Promise.resolve();
        }
        const count = input.children.length;
        let chain = Promise.resolve();
        for (let i = 0; i < count; i++) {
            chain = chain.then(() => deleteLetter());
        }
        return chain;
    };
    const getCells = () => {
        if (isEmptyObject(cells)) {
            fn.$$(".sb-hive .hive-cell", container).forEach((cell) => {
                cells[cell.textContent.trim()] = cell;
            });
        }
        return cells;
    };
    const getCellByLetter = (letter) => {
        return cells[letter] || null;
    };
    const init = (_container) => {
        container = _container;
        ["submit", "delete", "shuffle"].forEach((action) => {
            actionButtons[action] = fn.$(`.hive-action__${action}`, container);
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

    const findCloseButton = (app) => {
        for (let selector of [
            ".pz-moment__frame.on-stage .pz-moment__close",
            ".pz-moment__frame.on-stage .pz-moment__close_text",
            ".sb-modal-close",
        ]) {
            const closer = fn.$(selector, app.gameWrapper);
            if (closer) {
                return closer;
            }
        }
        return false;
    };

    class PopupBuilder {
        enableKeyClose() {
            document.addEventListener("keyup", (evt) => {
                const popupCloser = findCloseButton(this.app);
                if (popupCloser && evt.code === "Escape") {
                    popupCloser.click();
                }
            });
            return this;
        }
        enableCanvasClose() {
            this.app.modalWrapper.addEventListener("pointerup", (evt) => {
                const inner = fn.$(".sb-modal-frame", this.app.modalWrapper);
                if (inner && !inner.contains(evt.target)) {
                    findCloseButton(this.app).click();
                }
            });
            return this;
        }
        getTarget() {
            const dataUi = prefix("popup-container", "d");
            let container = fn.$(`[data-ui="${dataUi}"]`);
            if (!container) {
                container = fn.template({
                    data: {
                        ui: dataUi,
                    },
                });
                fn.$("body").append(container);
            }
            return container;
        }
        create() {
            return fn.div({
                classNames: ["sb-modal-frame", prefix("pop-up", "d")],
                aria: {
                    role: "button",
                },
                data: {
                    ui: this.key,
                },
                events: {
                    click: (e) => {
                        e.stopPropagation();
                    },
                },
                content: [
                    fn.div({
                        classNames: ["sb-modal-top"],
                        content: fn.div({
                            aria: {
                                role: "button",
                            },
                            classNames: ["sb-modal-close"],
                            content: "×",
                            events: {
                                click: () => {
                                    this.toggle(false);
                                },
                            },
                        }),
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
            });
        }
        setContent(part, content) {
            if (!this.parts[part]) {
                console.error(`Unknown target ${part}`);
                return this;
            }
            this.parts[part] = fn.empty(this.parts[part]);
            this.parts[part].append(fn.toNode(content));
            return this;
        }
        toggle(state) {
            const closer = findCloseButton(this.app);
            if(!this.isOpen && closer) {
                closer.click();
            }
            if (!state && closer) {
                closer.click();
            }
            if (state) {
                this.app.modalWrapper.append(this.ui);
                this.modalSystem.classList.add("sb-modal-open");
                this.isOpen = true;
            } else {
                this.getTarget().append(this.ui);
                this.modalSystem.classList.remove("sb-modal-open");
                this.isOpen = false;
            }
            return this;
        }
        constructor(app, key) {
            this.key = key;
            this.app = app;
            this.isOpen = false;
            this.modalSystem = this.app.modalWrapper.closest(".sb-modal-system");
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
                    classNames: ["sb-modal-message", "sba-modal-footer"],
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
            this.enableKeyClose().enableCanvasClose();
            this.getTarget().append(this.ui);
        }
    }

    const utils = (self) => ({
        isValidHsl(hsl) {
            return hsl && !isEmptyObject(hsl) && !isNaN(hsl.hue) && !isNaN(hsl.sat) && !isNaN(hsl.lig);
        },
        ensureValidHsl(hsl) {
            if(self.isValidHsl(hsl)) {
                return hsl;
            }
            let scheme = settings.get(`options.${self.key}`);
            if(scheme?.hsl && self.isValidHsl(scheme.hsl)) {
                return scheme.hsl;
            }
            return {
                hue: 0,
                sat: 0,
                lig: 7,
            };
        },
        isValidMode(mode){
            return mode && ['dark', 'light'].includes(mode);
        },
        ensureValidMode(mode){
            if(self.isValidMode(mode)) {
                return mode;
            }
            return (self.usesSystemDarkMode() ? "dark" : "light");
        },
        ensureValidColorScheme(requestedScheme = null) {
            let scheme = requestedScheme || settings.get(`options.${self.key}`) || {};
            scheme.mode = self.ensureValidMode(scheme.mode);
            scheme.hsl = self.ensureValidHsl(scheme.hsl);
            return scheme;
        },
        isValidColorScheme(scheme = null) {
            return scheme && !isEmptyObject(scheme) && self.isValidHsl(scheme.hsl) && isValidMode(scheme.mode);
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
            const currentSwatch = fn.$("input:checked", this.popup.ui);
            setTimeout(()=> {
                currentSwatch.focus();
            }, 1000);
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
                            content: `Spelling Bee Assistant’s dark mode has been turned off because 
                    another dark theme (likely from the NYT) was detected.`,
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
                evt.detail.forEach((plugin, key) => {
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
            return Math.min(Math.round((value * 100) / this.maxAsNumber), 100);
        }
    }

    class ProgressBar extends Plugin {
        run(evt) {
            this.progress.update(data.getPoints("foundTerms"));
            return this;
        }
        constructor(app) {
            super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
                runEvt: prefix('refreshUi'),
                addMethod: 'before',
            });
            this.progress = new ProgressBuilder(data.getPoints("foundTerms"), data.getPoints("answers"));
            this.ui = this.progress.ui;
            this.target = fn.$('.sb-wordlist-heading', this.app.gameWrapper);
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
        const answers = data.getList("answers").sort();
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
        constructor(title, open = false) {
            this.title = title;
            this.open = open;
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
            let partial = evt.detail?.textContent?.trim() || '';
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
            return !this.ui.classList.contains('inactive')
        }
        toggle() {
            this.ui.classList.toggle('inactive', this.getState());
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
                classNames: ['inactive']
            });
            this.target = fn.$(".sb-controls", this.app.gameWrapper);
            this.shortcuts = [
                {
                    combo: "Shift+Alt+E",
                    method: 'toggle',
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
            this.detailsBuilder = new DetailsBuilder(this.title, false);
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
            }).ui
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
            }).ui
        }
        togglePopup() {
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            const summaryElements = [];
            Object.keys(this.summaryFields).forEach(fieldName => {
                summaryElements.push(this.createSummaryTable(fieldName));
            });
            const body = fn.div({
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
            this.popup.setContent("subtitle", getDescription()).setContent("body", body).toggle(true);
            return this;
        }
        constructor(app) {
            super(app, "Milestones", "The number of points required for each level", {runEvt: prefix("refreshUi")});
            this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);
            this.summaryFields = {
                points: "Points",
                terms: "Words",
                pangrams: "Pangrams",
            };
            this.menu = {
                action: 'popup'
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
                                            return `Yes - there's one perfect pangram today.`;
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
            const foundTerms = data.getList('foundTerms');
            const pangrams = data.getList('pangrams');
            const pane = fn.ul({
                classNames: ['sb-modal-wordlist-items']
            });
            data.getList('answers').forEach(term => {
                pane.append(fn.li({
                    content: [
                        fn.span({
                            classNames: foundTerms.includes(term) ? ['check', 'checked'] : ['check']
                        }), fn.span({
                            classNames: pangrams.includes(term) ? ['sb-anagram', 'pangram'] : ['sb-anagram'],
                            content: term
                        })
                    ]
                }));
            });
            return [
                fn.div({
                    content: data.getList('letters').join(''),
                    classNames: ['sb-modal-letters']
                }),
                pane
            ]
        }
        togglePopup() {
            if(this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup
                .setContent('body', this.buildContent())
                .toggle(true);
            return this;
        }
        constructor(app) {
            super(app, 'Today’s Answers', 'Reveals the solution of the game', {
                key: 'todaysAnswers'
            });
            this.marker = prefix('resolved', 'd');
            this.popup = new PopupBuilder(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', data.getDate().display);
            this.menu = {
                action: 'popup',
                icon: 'warning'
            };
            this.shortcuts = [{
                combo: "Shift+Alt+T",
                method: "togglePopup"
            }];
        }
    }

    class PangramHighlighter extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
        run(evt) {
            const pangrams = data.getList("pangrams");
            const container = evt?.detail ?? this.app.resultList;
            fn.$$("li", container).forEach((node) => {
                const term = node.textContent;
                if (pangrams.includes(term) || fn.$(".pangram", node)) {
                    node.classList.add(this.marker);
                }
            });
            return this;
        }
        constructor(app) {
            super(app, "Highlight PangramHl", "", {
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
            if (!evt.target.classList.contains('sb-anagram') || !evt.target.closest('.sb-anagram')) {
                return false;
            }
            if (evt.button === 0) {
                window.open(`https://www.google.com/search?q=${evt.target.textContent}`, prefix());
                return true;
            }
        }
        run(evt = null) {
            [this.app.modalWrapper, this.app.resultList.parentElement].forEach(container => {
                container.addEventListener('pointerup', this.listener);
                container.classList.add(prefix('googlified', 'd'));
            });
            return this;
        }
        constructor(app) {
            super(app, 'Googlify', 'Link all result terms to Google');
            this.run();
        }
    }

    var css = "[data-sba-theme]{--dhue: 0;--dsat: 0%;--dlig: 7%;--link-hue: 206;--shadow-light-color: hsl(49, 96%, 50%, 0.35);--shadow-dark-color: hsl(49, 96%, 50%, 0.7);--highlight-text-color: hsl(0, 0%, 0%)}[data-sba-theme=light]{--text-color:#000;--site-text-color:rgba(0,0,0,.9);--body-bg-color:#fff;--modal-bg-color:hsla(0,0%,100%,.85);--border-color:hsl(0,0%,86%);--area-bg-color:hsl(0,0%,90%);--invalid-color:hsl(0,0%,63%);--menu-hover-color:hsl(0,0%,96%);--head-row-bg-color:hsl(0,0%,96%);--card-color:hsla(52,93%,55%,.1);--link-color:hsl(var(--link-hue), 45%, 38%);--link-visited-color:hsl(var(--link-hue), 45%, 53%);--link-hover-color:hsl(var(--link-hue), 45%, 53%);--sba-success-color:hsl(112,93%,35%);--sba-error-color:hsl(352,93%,35%);--toggle-on-bg-color:hsl(90,62%,40%);--toggle-off-bg-color:hsl(0,0%,65%);--toggle-handle-color:#fff;--toggle-border-color:hsl(0,0%,90%)}[data-sba-theme=dark]{--text-color:hsl(var(--dhue), var(--dsat), 85%);--site-text-color:hsl(var(--dhue), var(--dsat), 100%, 0.9);--body-bg-color:hsl(var(--dhue), var(--dsat), var(--dlig));--modal-bg-color:hsl(var(--dhue), var(--dsat), var(--dlig), 0.85);--border-color:hsl(var(--dhue), var(--dsat), 20%);--area-bg-color:hsl(var(--dhue), var(--dsat), 22%);--invalid-color:hsl(var(--dhue), var(--dsat), 40%);--menu-hover-color:hsl(var(--dhue), var(--dsat), 22%);--head-row-bg-color:hsl(var(--dhue), var(--dsat), 13%);--card-color:hsl(var(--dhue), var(--dsat), 22%);--link-color:hsl(var(--link-hue), 90%, 64%);--link-visited-color:hsl(var(--link-hue), 90%, 76%);--link-hover-color:hsl(var(--link-hue), 90%, 76%);--sba-success-color:hsl(112,93%,55%);--sba-error-color:hsl(352,93%,41%);--toggle-on-bg-color:hsl(90,62%,50%);--toggle-off-bg-color:#ccc;--toggle-handle-color:hsl(var(--dhue), var(--dsat), 22%);--toggle-border-color:hsl(var(--dhue), var(--dsat), 22%)}body{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-field{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-wrapper .sb-modal-message a{color:var(--link-color)}body .pz-game-wrapper .sb-modal-message a:visited{color:var(--link-visited-color)}body .pz-game-wrapper .sb-modal-message a:hover{color:var(--link-hover-color)}body .pz-game-wrapper .sb-progress-marker .sb-progress-value,body .pz-game-wrapper .hive-cell:first-child .cell-fill{background:var(--sb-yellow);fill:var(--sb-yellow);color:var(--highlight-text-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-fill,body .pz-game-wrapper .hive-cell .cell-fill{fill:var(--area-bg-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-letter{fill:var(--text-color)}body[data-sba-theme=dark]{scrollbar-color:var(--invalid-color) var(--body-bg-color)}body[data-sba-theme=dark] .sb-message{color:var(--text-color)}body[data-sba-theme=dark] #conversion-banner{background:inherit}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__content{color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.primary{background:var(--area-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary{background:var(--head-row-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary:hover{background:var(--area-bg-color)}body[data-sba-theme=dark] .pz-game-wrapper,body[data-sba-theme=dark] #js-hook-pz-moment__loading{background:var(--body-bg-color) !important;color:var(--text-color)}body[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}body[data-sba-theme=dark] .pangram-message .sb-message{background:var(--sb-yellow);color:var(--highlight-text-color)}body[data-sba-theme=dark] .pz-modal__button.white,body[data-sba-theme=dark] .pz-footer,body[data-sba-theme=dark] .pz-moment,body[data-sba-theme=dark] .sb-modal-scrim{background:var(--modal-bg-color) !important;color:var(--text-color) !important}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.primary,body[data-sba-theme=dark] .pz-footer .pz-moment__button.primary,body[data-sba-theme=dark] .pz-moment .pz-moment__button.primary,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.primary{background:var(--area-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.primary:hover,body[data-sba-theme=dark] .pz-footer .pz-moment__button.primary:hover,body[data-sba-theme=dark] .pz-moment .pz-moment__button.primary:hover,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.secondary,body[data-sba-theme=dark] .pz-footer .pz-moment__button.secondary,body[data-sba-theme=dark] .pz-moment .pz-moment__button.secondary,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.secondary{background:var(--head-row-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-modal__button.white .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .pz-footer .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .pz-moment .pz-moment__button.secondary:hover,body[data-sba-theme=dark] .sb-modal-scrim .pz-moment__button.secondary:hover{background:var(--area-bg-color)}body[data-sba-theme=dark] .hive-action__shuffle{position:relative}body[data-sba-theme=dark] .sb-progress-value{font-weight:bold}body[data-sba-theme=dark] .pz-icon-close{filter:invert(1)}body[data-sba-theme=dark].pz-mobile .pz-toolbar-button,body[data-sba-theme=dark].pz-mobile .pz-dropdown__button,body[data-sba-theme=dark].pz-desktop .pz-toolbar-button,body[data-sba-theme=dark].pz-desktop .pz-dropdown__button{background-color:rgba(0,0,0,0) !important}body[data-sba-theme=dark] .pz-dropdown .pz-dropdown__show+.pz-dropdown__list .pz-dropdown__menu-item{background-color:var(--body-bg-color)}body[data-sba-theme=dark] .pz-moment__frame.pz-moment__welcome *{color:var(--text-color)}body[data-sba-theme=dark] .sb-toggle-icon,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow,body[data-sba-theme=dark] .hive-action__shuffle{background-position:-1000px}body[data-sba-theme=dark] .sb-toggle-icon:after,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow:after,body[data-sba-theme=dark] .hive-action__shuffle:after{content:\"\";opacity:.85;top:0;left:0;bottom:0;right:0;position:absolute;z-index:0;filter:invert(1);background-image:inherit;background-repeat:inherit;background-position:center;background-size:inherit}#js-logo-nav rect{fill:var(--body-bg-color)}#js-logo-nav path{fill:var(--text-color)}.pz-moment__loading{color:#000}.pz-nav__hamburger-inner,.pz-nav__hamburger-inner::before,.pz-nav__hamburger-inner::after{background-color:var(--text-color)}.pz-nav{width:100%;background:var(--body-bg-color)}.sb-modal-wrapper .sb-modal-frame{border:1px solid var(--border-color);background:var(--body-bg-color);color:var(--text-color)}.sb-modal-wrapper .sb-modal-frame.stats .sb-modal-header{background:var(--body-bg-color)}.sb-modal-wrapper .sb-modal-frame.stats .sb-stats-bar{background:var(--body-bg-color);color:var(--text-color)}.sb-modal-wrapper .sb-modal-frame.stats .sb-stats-bar__text{color:#333}.sb-modal-wrapper .sb-modal-ranks__list tr:not(.sb-modal-ranks__current){color:var(--text-color)}.sb-modal-wrapper .pz-modal__title,.sb-modal-wrapper .sb-modal-close{color:var(--text-color)}.sb-modal-wrapper .sb-modal-body .sb-modal-buttons-container button.button-primary{background:var(--area-bg-color);color:var(--text-color)}.sb-modal-wrapper .sb-modal-body .sb-modal-buttons-container button.button-primary:hover{background:var(--invalid-color);color:var(--body-bg-color)}.sb-modal-wrapper .sb-modal-body .sb-modal-buttons-container button.button-secondary{background:var(--head-row-bg-color);color:var(--text-color)}.sb-modal-wrapper .sb-modal-body .sb-modal-buttons-container button.button-secondary:hover{background:var(--area-bg-color)}.pz-moment__close::before,.pz-moment__close::after{background:var(--text-color)}.pz-moment__close_text{color:currentColor}.pz-modal__button.white:hover{background:var(--area-bg-color)}.sb-input-invalid{color:var(--invalid-color)}.sb-toggle-expand{box-shadow:none}.sb-input-bright,.sb-progress-dot.completed::after{color:var(--sb-yellow)}.hive-cell .cell-fill{stroke:var(--body-bg-color)}.hive-cell .cell-letter{fill:var(--text-color)}.hive-cell.center .cell-letter{fill:var(--highlight-text-color)}.hive-action{background-color:var(--body-bg-color);color:var(--text-color)}.hive-action.push-active{background:var(--menu-hover-color)}[data-sba-theme] .sb-modal-wordlist-items li,.sb-wordlist-items-pag>li,.pz-ad-box,.pz-game-toolbar,.pz-spelling-bee-wordlist,.hive-action,.sb-wordlist-box,.sb-message{border-color:var(--border-color)}.sb-toggle-expand{background:var(--body-bg-color)}.sb-progress-line,.sb-progress-dot::after,.pz-nav::after{background:var(--border-color)}.sb-bob{background-color:var(--border-color)}.sb-bob.active{background-color:var(--text-color)}:root{--sba-cell-inline-padding: 2px;--sba-cell-block-padding: 3px}body:has(.pz-moment__congrats.on-stage) [data-ui=menu]{display:none}.hive-action.push-active.sba-no-feedback{background:var(--body-bg-color) !important}.sba-toggle-switch:where([type=checkbox][role=switch]){-webkit-appearance:none;-moz-appearance:none;appearance:none;position:relative;color:var(--toggle-border-color);font-size:inherit;width:2em;height:1em;box-sizing:content-box;border:1px solid;border-radius:1em;vertical-align:text-bottom;margin:auto;cursor:pointer;background:var(--toggle-off-bg-color)}.sba-toggle-switch:where([type=checkbox][role=switch])::before{content:\"\";position:absolute;top:50%;left:0;transform:translate(0, -50%);box-sizing:border-box;width:.7em;height:.7em;margin:0 .15em;border:1px solid;border-radius:50%;background:var(--toggle-handle-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):checked{background:var(--toggle-on-bg-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):checked::before{left:1em;background:var(--toggle-handle-color)}.sba-toggle-switch:where([type=checkbox][role=switch]):disabled{opacity:.4}.sba{background:var(--body-bg-color);border-radius:6px;border-style:solid;border-width:1px}.sba *:focus{outline:0}.sba ::selection{background:rgba(0,0,0,0)}.sba details{font-size:90%;margin-bottom:1px}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid var(--border-color)}[data-ui].inactive{display:none}[data-ui] b,[data-ui] strong{font-weight:bold}[data-ui] i,[data-ui] em{font-style:italic}[data-ui] .sb-modal-body{padding-block-end:20px}details .sba-data-pane{border-top:none;margin-bottom:2px}.sb-modal-wrapper{--sba-cell-inline-padding: 7px}.sb-modal-wrapper .sba-data-pane{font-size:95%}.sb-modal-wrapper i{font-style:italic}.sba-data-pane{border:1px solid var(--border-color);border-collapse:collapse}.sba-data-pane.sba-thead-th-bold thead th{font-weight:bold}.sba-data-pane.sba-table-full-width{width:100%;table-layout:fixed}.sba-data-pane.sba-small-txt{font-size:85%}.sba-data-pane.sba-th-upper th{text-transform:uppercase}.sba-data-pane.sba-equal-cols[data-cols=\"3\"] :is(th,td){width:33.3333333333%}.sba-data-pane.sba-equal-cols[data-cols=\"4\"] :is(th,td){width:25%}.sba-data-pane.sba-equal-cols[data-cols=\"5\"] :is(th,td){width:20%}.sba-data-pane.sba-equal-cols[data-cols=\"6\"] :is(th,td){width:16.6666666667%}.sba-data-pane.sba-equal-cols[data-cols=\"7\"] :is(th,td){width:14.2857142857%}.sba-data-pane.sba-equal-cols[data-cols=\"8\"] :is(th,td){width:12.5%}.sba-data-pane.sba-equal-cols[data-cols=\"9\"] :is(th,td){width:11.1111111111%}.sba-data-pane.sba-equal-cols[data-cols=\"10\"] :is(th,td){width:10%}.sba-data-pane .sba-preeminent{font-weight:bold;border-bottom:2px solid var(--sb-yellow) !important}.sba-data-pane .sba-completed td,.sba-data-pane td.sba-completed{color:var(--invalid-color);font-weight:normal}.sba-data-pane .sba-hidden{display:none}.sba-data-pane caption{text-align:start;padding:var(--sba-cell-block-padding) var(--sba-cell-inline-padding);line-height:1.75;font-weight:700}.sba-data-pane :is(th,td){border:1px solid var(--border-color);border-top:none;padding:var(--sba-cell-block-padding) var(--sba-cell-inline-padding);white-space:nowrap;text-align:center}.sba-data-pane th{background-color:var(--head-row-bg-color)}[data-ui=community] .sb-modal-body{margin-block-end:0}[data-ui=community] h4{font-weight:700;font-family:nyt-franklin,sans-serif;font-size:18px;margin:0 0 1px 0}[data-ui=community] p{margin:0 0 2px 0;font-size:16px}[data-ui=community] em{display:block;font-weight:500;font-size:14px;font-family:nyt-franklin,sans-serif}[data-ui=community] li{margin:0 0 12px 0}[data-ui=community] li ul{padding-left:20px;list-style:disc}[data-ui=community] li ul li{margin:0}[data-ui=community] li ul li a{color:var(--link-color)}[data-ui=community] li ul li a:hover{color:var(--link-hover-color)}[data-ui=milestones]{--flex-gap: 12px}[data-ui=milestones] .sba-milestone-table-wrapper{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--flex-gap)}[data-ui=milestones] figcaption{padding:10px var(--sba-cell-inline-padding)}[data-ui=milestones] b{font-weight:700}[data-ui=milestones] progress{border-width:0;height:5px}[data-ui=milestones] .sba-col{width:calc(50% - var(--flex-gap)/2);min-width:145px}[data-ui=milestones] .sba-summaries{width:calc(48% - var(--flex-gap)/2);min-width:139px}[data-ui=milestones] .sba-summaries .sba-data-pane{table-layout:fixed;margin-block-end:var(--flex-gap)}[data-ui=milestones] .sba-summaries tr :is(td,th){text-align:center}[data-ui=milestones] .sba-tiers{width:calc(52% - var(--flex-gap)/2);min-width:149px}[data-ui=milestones] .sba-tiers .sba-data-pane .sba-preeminent:not(.sba-queen-bee){border-bottom:1px solid var(--border-color) !important}[data-ui=milestones] .sba-tiers .sba-queen-bee.sba-preeminent th::before{content:\"\";display:inline-block;background:no-repeat url(/games-assets/v2/assets/sb-stats-queen-bee.svg);width:19px;height:12px;margin-right:4px}[data-ui=milestones] .sba-data-pane{width:100%}[data-ui=milestones] .sba-data-pane td.sba-progress-box{padding:0}[data-ui=milestones] .sba-data-pane tr.sba-completed :is(th,td){color:var(--invalid-color)}[data-ui=milestones] .sba-data-pane tbody th{text-align:start}[data-ui=milestones] .sba-data-pane tbody td:nth-child(n+2){max-width:100px}[data-ui=header]{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px;justify-content:space-between;align-items:center}[data-ui=header] svg{fill:var(--text-color)}[data-ui=header] .sba-tool-btn{padding:1px;width:12px;aspect-ratio:1/1;display:inline-block;cursor:pointer}progress{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0;padding:0;background:rgba(0,0,0,0);display:block;height:10px;border:1px var(--border-color) solid}progress::-webkit-progress-bar{background-color:rgba(0,0,0,0)}progress::-webkit-progress-value{background-color:var(--sb-yellow);height:4px}progress::-moz-progress-bar{background-color:var(--sb-yellow)}[data-ui=progressBar]{border-width:0 0 1px 0;height:6px}[data-ui=spillTheBeans]{text-align:center;padding:14px 0;font-size:38px;margin-top:-24px}[data-ui=menu]{position:relative;z-index:1}@keyframes pulse-fade{0%{text-shadow:rgba(255,0,0,.5) 1px 0 0;opacity:1}80%{text-shadow:rgba(255,0,0,0) 1px 0 20px}100%{opacity:0;text-shadow:none}}[data-ui=menu]:has([data-icon=new] svg) #sba-menu-entry-point::after{content:\"•\";animation:pulse-fade 9s ease-out 1 forwards;animation-delay:3s;color:rgba(255,0,0,.75);font-size:1.2em;position:absolute;top:0;right:3px}[data-ui=menu] .pane{color:var(--text-color);background:var(--body-bg-color);border:1px var(--border-color) solid;padding:5px;width:179px}[data-ui=menu] li{position:relative;line-height:1.8;white-space:nowrap;cursor:pointer;overflow:hidden;display:block;padding:5px 9px 5px 36px;font-size:18px}[data-ui=menu] li[data-icon=new]:has(svg){background:color-mix(in srgb, var(--games-yellow) 15%, transparent)}[data-ui=menu] li::before,[data-ui=menu] li::after{position:absolute;display:block}[data-ui=menu] li[data-icon=checkmark].checked::after{content:\"✔\";color:var(--sb-yellow);top:3px;left:10px;font-size:20px}[data-ui=menu] li[data-target=darkMode],[data-ui=menu] li[data-icon=sba]{border-top:1px solid var(--border-color)}[data-ui=menu] li[data-icon=sba]{color:currentColor}[data-ui=menu] li[data-icon=sba]:hover{color:var(--link-hover-color);text-decoration:underline}[data-ui=menu] li svg{display:inline-block;width:20px;height:20px;position:absolute;left:7px;top:10px}[data-ui=menu] li svg .shape{fill:var(--text-color)}[data-ui=menu] li svg .content{fill:var(--sb-yellow)}[data-ui=darkMode] .hive{width:auto;padding:0;flex-grow:2;display:flex}[data-ui=darkMode] .hive-cell{position:static;margin:auto;border:1px solid var(--border-color);padding:20px;width:168px;height:100%;border-radius:6px}[data-ui=darkMode] .cell-letter{font-size:8px;font-weight:600}[data-ui=darkMode] .sba-toggle-label{padding-inline-end:10px}[data-ui=darkMode] .sba-header-wrap{display:flex;justify-content:space-between}.sba-color-selector{display:flex;justify-content:space-around;gap:20px}.sba-color-selector .sba-dark-mode-preview{width:calc(40% - 10px);aspect-ratio:62.4/64.8}.sba-color-selector .sba-dark-mode-preview svg{width:100%;aspect-ratio:inherit;display:block}.sba-color-selector .sba-dark-mode-preview .sba-cell{fill:var(--area-bg-color)}.sba-color-selector .sba-dark-mode-preview .sba-cell text{fill:var(--text-color)}.sba-color-selector .sba-dark-mode-preview .sba-center-cell{fill:var(--sb-yellow)}.sba-color-selector .sba-dark-mode-preview .sba-center-cell text{fill:var(--highlight-text-color)}.sba-color-selector .sba-dark-mode-preview text{font-weight:700;font-size:6px;text-transform:uppercase;dominant-baseline:middle;text-anchor:middle;pointer-events:none}.sba-color-selector .sba-swatches{display:flex;flex-wrap:wrap;list-style:none;justify-content:space-around;padding:0;width:calc(60% - 10px)}.sba-color-selector .sba-swatches li{position:relative;overflow:hidden;width:25%;aspect-ratio:1/1;padding:2px}.sba-color-selector .sba-swatches li:has([for=sbaH360]){width:100%;line-height:50px;aspect-ratio:auto;height:auto}.sba-color-selector .sba-swatches label{border:1px var(--border-color) solid;display:block;overflow:hidden;cursor:pointer;text-align:center;height:100%}.sba-color-selector .sba-swatches label[for=sbaH360]{color:var(--highlight-text-color)}.sba-color-selector .sba-swatches input{position:absolute;left:-100px}.sba-color-selector .sba-swatches input:checked~label:not([for=sbaH360]){border-color:var(--sb-yellow)}.sba-googlified .sb-anagram{cursor:pointer}.sba-googlified .sb-anagram:hover{text-decoration:underline;color:var(--link-hover-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) *{color:var(--text-color);border-color:var(--border-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) *::selection{background-color:var(--body-bg-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) .pz-dropdown__arrow{border-top-color:var(--text-color);border-bottom-color:var(--text-color);border-right-color:rgba(0,0,0,0);border-left-color:rgba(0,0,0,0)}.pz-mobile .pz-toolbar-button__sba{color:var(--text-color)}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]){background-color:var(--body-bg-color) !important}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]):hover{background:var(--menu-hover-color)}[data-sba-theme=dark] #portal-game-toolbar i,[data-sba-theme=dark] #js-mobile-toolbar i{filter:invert(1);background-color:rgba(0,0,0,0)}[data-sba-theme=dark] .conversion-banner__icon{filter:invert(1)}[data-sba-theme=dark] :is(.sb-stats-bar-rank__word-count,.sb-stats-bar-rank__text){filter:contrast(99%);color:#999}[data-sba-theme] .sb-modal-wordlist-items li .check.checked{border:none;height:auto;transform:none}[data-sba-theme] .sb-modal-wordlist-items li .check.checked::after{position:relative;content:\"✔\";color:var(--sb-yellow);top:4px;font-size:16px}[data-sba-theme] .sb-modal-header .sb-modal-letters{position:relative;top:-5px}.pz-toolbar-button:hover,[data-ui=menu] li:hover{background:var(--menu-hover-color);color:var(--text-color)}.pz-toolbar-button::selection,[data-ui=menu] li::selection{background-color:rgba(0,0,0,0)}[data-sba-submenu=true] [data-ui=menu]{background:var(--menu-hover-color);color:var(--text-color)}[data-ui=shortcuts] tbody tr th{text-align:start}[data-ui=shortcuts] tbody tr td:last-child{font-size:16px;cursor:pointer}[data-ui=shortcuts] tbody tr td:last-child::selection{color:currentColor;background-color:rgba(0,0,0,0)}[data-ui=shortcuts] tbody tr td:last-child[data-enabled=true]{color:var(--sba-success-color)}[data-ui=shortcuts] tbody tr td:last-child[data-enabled=false]{color:var(--sba-error-color)}[data-ui=grid] table{margin-left:-20px;width:calc(100% + 40px)}[data-ui=grid] tbody tr:last-child td{background-color:var(--head-row-bg-color)}[data-ui=grid] tbody tr td{padding:5px 0 !important}[data-ui=grid] tbody tr td:last-of-type{background-color:var(--head-row-bg-color)}.sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.sba summary{list-style:none;padding:1px 15px 0 21px}.sba summary::marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li{position:relative}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li.sba-pangram{font-weight:700;border-bottom:2px var(--sb-yellow) solid}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks{position:absolute;right:0;bottom:3px}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks mark{display:none}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-s-active .sba-mark-s{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-p-active .sba-mark-p{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-d-active .sba-mark-d{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-c-active .sba-mark-c{display:inline-block}[data-sba-theme] mark{background:rgba(0,0,0,0);font-size:11px;pointer-events:none;text-transform:uppercase}[data-sba-theme] mark::after{content:\" \"}[data-sba-theme] mark:last-of-type::after{content:normal}[data-sba-theme] mark::selection{background-color:rgba(0,0,0,0)}[data-sba-theme] .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;font-size:13px;border-top:1px solid var(--border-color);padding:10px 10px 0 10px}.sb-modal-frame .sb-modal-content{scrollbar-color:var(--invalid-color) var(--body-bg-color)}.sb-modal-frame .sb-modal-content::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}.sba-container{display:none}.sba{margin:var(--sba-app-margin);width:var(--sba-app-width);padding:var(--sba-app-padding);box-sizing:border-box}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}[data-ui=menu] .pane{display:none}.pz-mobile [data-ui=menu]{display:flex;align-items:center;height:100%;padding:0 6px;top:2px}[data-sba-submenu=true] .pz-mobile-dropdown.show .pz-dropdown__list{display:none}[data-sba-submenu=true] .pz-game-toolbar{position:relative;z-index:4}[data-sba-submenu=true] [data-ui=menu] .pane{display:block;position:absolute;right:-16px;top:45px}[data-sba-submenu=true].pz-desktop .pane{right:-16px;top:55px}[data-sba-active=true]{--sba-app-width: 100px;--sba-app-padding: 0;--sba-app-margin: 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px}[data-sba-active=true] .sba-container{display:block;position:absolute;top:50%;transform:translate(0, -50%);right:var(--sba-game-offset);z-index:1}[data-sba-active=true] .sba{border-color:rgba(0,0,0,0)}[data-sba-active=true] [data-ui=header]{display:none}[data-sba-active=true] .sb-expanded .sba-container{visibility:hidden;pointer-events:none}[data-sba-active=true] .sb-content-box{max-width:var(--sba-game-width);justify-content:space-between;position:relative}[data-sba-active=true] .sb-controls-box{max-width:calc(100vw - var(--sba-app-width))}@media(max-width: 370px){[data-sba-active=true] .sb-hive{width:70%}[data-sba-active=true].pz-spelling-bee-wordlist .hive-action:not(.hive-action__shuffle){font-size:.9em;margin:0 4px 8px;padding:23px 0}[data-sba-active=true] .hive-action:not(.hive-action__shuffle){width:71px;min-width:auto}[data-sba-active=true] [data-ui=milestones] .sb-modal-body{padding-inline:calc(var(--flex-gap)/2)}[data-sba-active=true] [data-ui=milestones] .sba-queen-bee.sba-preeminent th::before{content:normal}}@media(max-width: 450px){[data-ui=grid] table{table-layout:auto}[data-ui=grid] table.sba-data-pane tbody th{width:28px !important}[data-ui=grid] table.sba-data-pane thead th:first-of-type{width:28px !important}[data-ui=grid] table.sba-data-pane :is(thead,tbody) tr :is(th,td){width:auto;font-size:90%}}[data-sba-active] .pz-game-toolbar .pz-row{padding:0}@media(min-width: 516px){[data-sba-active] .pz-game-toolbar .pz-row{padding:0 12px}[data-sba-active].pz-desktop .sba{left:-175px}[data-ui=overview] .sba-data-pane tbody th{text-transform:none;width:31%}[data-ui=overview] .sba-data-pane tbody td{width:23%}[data-ui=overview] .sba-data-pane tbody tr:nth-child(1) th::after{content:\"ords\"}[data-ui=overview] .sba-data-pane tbody tr:nth-child(2) th::after{content:\"oints\"}[data-ui=overview] .sba-data-pane thead th{width:23%}[data-ui=overview] .sba-data-pane thead th:first-of-type{width:31%}[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 5px}[data-sba-active=true] .sba{border-color:var(--border-color)}[data-sba-active=true] [data-ui=header]{display:flex}}@media(min-width: 900px){[data-sba-submenu=true].pz-desktop [data-ui=menu] .pane{right:0;top:55px}[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 8px;--sba-app-margin: 66px 0 0 0}[data-sba-active=true] .sb-content-box{padding:0 var(--sba-game-offset)}[data-sba-active=true] .sb-controls-box{max-width:none}[data-sba-active=true] .sba-container{position:static;transform:none}[data-sba-active=true] .sb-expanded .sba-container{z-index:1}[data-sba-active=true].pz-desktop .sba{left:-191px}}@media(min-width: 768px){[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-body{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-header{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;width:calc(100% - 112px);margin:-8px auto 15px}}\n";

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
    const currentVersion = settings.get('options.version') || '0';
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
        if (typeof existing !== "string") {
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
    class Menu extends Plugin {
        getTarget() {
            return this.app.envIs("mobile") ? fn.$("#js-mobile-toolbar") : fn.$("#portal-game-toolbar > div:last-of-type");
        }
        add() {
            if (!this.app.envIs("mobile")) {
                return super.add();
            }
            const navContainer = fn.$("#js-global-nav");
            if (navContainer.classList.contains("show-mobile-toolbar")) {
                return super.add();
            }
            const observer = new MutationObserver((mutationList) => {
                for (let mutation of mutationList) {
                    if (
                        mutation.type === "attributes" &&
                        mutation.attributeName === "class" &&
                        mutation.target.classList.contains("show-mobile-toolbar")
                    ) {
                        observer.disconnect();
                        return super.add();
                    }
                }
            });
            observer.observe(navContainer, {
                attributes: true,
            });
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
        resetSubmenu() {
            setTimeout(() => {
                this.app.domSet("submenu", false);
            }, 300);
        }
        constructor(app) {
            super(app, "Menu", "");
            this.target = this.getTarget();
            if (this.app.envIs("mobile")) {
                this.addMethod = "after";
            }
            const classNames = [
                "pz-toolbar-button__sba",
                this.app.envIs("mobile") ? "pz-nav__toolbar-item" : "pz-toolbar-button",
            ];
            this.resetSubmenu();
            const pane = fn.ul({
                classNames: ["pane"],
                data: {
                    ui: "submenu",
                },
                events: {
                    pointerup: (evt) => {
                        if (evt.target.nodeName === "A") {
                            this.resetSubmenu();
                            evt.target.click();
                            return true;
                        }
                        const entry = evt.target.closest("li");
                        if (!entry || evt.button !== 0) {
                            this.resetSubmenu();
                            return true;
                        }
                        const component = this.getComponent(entry);
                        switch (entry.dataset.action) {
                            case "boolean": {
                                this.resetSubmenu();
                                component.toggle();
                                entry.classList.toggle("checked", component.getState());
                                break;
                            }
                            case "popup":
                                this.resetSubmenu();
                                component.togglePopup();
                                break;
                            default:
                                this.resetSubmenu();
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
            this.ui = fn.div({
                events: {
                    pointerup: (evt) => {
                        newItems.markSeen();
                        if (evt.button !== 0) {
                            return true;
                        }
                        if (!evt.target.dataset.action) {
                            this.app.domSet("submenu", !this.app.domGet("submenu"));
                        }
                    },
                },
                content: [
                    fn.span({
                        attributes: {
                            id: prefix("menu-entry-point", "d"),
                        },
                        content: settings.get("title"),
                    }),
                    pane,
                ],
                aria: {
                    role: "presentation",
                },
                classNames,
            });
            document.addEventListener("keyup", (evt) => {
                if (this.app.domGet("submenu") === true && /^(Ent|Esc|Key|Dig)/.test(evt.code)) {
                    this.app.domSet("submenu", false);
                }
            });
            fn.$("#pz-game-root").addEventListener("pointerdown", (evt) => {
                if (this.app.domGet("submenu") === true) {
                    this.app.domSet("submenu", false);
                }
            });
            app.on(prefix("pluginsReady"), (evt) => {
                evt.detail.forEach((plugin, key) => {
                    if (!plugin.menu || !plugin.menu.action) {
                        return false;
                    }
                    let icon = plugin.menu.icon || null;
                    const data = {
                        component: key,
                        action: plugin.menu.action,
                    };
                    let classNames = [];
                    if (plugin.menu.action === "boolean") {
                        data.icon = "checkmark";
                        if (plugin.getState()) {
                            classNames = ["checked"];
                        }
                    } else if (icon) {
                        data.icon = icon;
                    }
                    pane.append(
                        fn.li({
                            classNames,
                            attributes: {
                                title: fn.toNode(plugin.description).textContent,
                            },
                            data,
                            content: icon && svgIcons[icon] ? [svgIcons[icon], plugin.title] : plugin.title,
                        })
                    );
                });
                pane.append(
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
                    })
                );
            });
            app.on(prefix("destroy"), () => this.ui.remove());
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
            if (this.popup.isOpen) {
                this.popup.toggle(false);
                return this;
            }
            this.popup.setContent("subtitle", this.description).setContent("body", this.createTable()).toggle(true);
            return this;
        }
        createTable() {
            return (new TableBuilder(buildDataMatrix(), {
                hasHeadRow: true,
                hasHeadCol: true,
                classNames: [
                    "data-pane",
                    "th-upper",
                    "equal-cols",
                    "small-txt"]
                    .map((name) => prefix(name, "d"))
                    .concat(["pane"]),
                cellCallbacks: [markCompletedRatioCells]
            })).ui;
        }
        run(env) {
            this.popup.setContent("body", this.createTable());
            return this;
        }
        constructor(app) {
            super(app, "Grid", "The number of words by length and by first letter.", {runEvt: prefix("refreshUi")});
            this.popup = new PopupBuilder(this.app, this.key).setContent("title", this.title);
            this.menu = {
                action: "popup",
            };
            this.panelBtn = fn.span({
                classNames: ['sba-tool-btn'],
                events: {
                    pointerup: () => this.togglePopup()
                },
                attributes:{
                    title: this.title
                },
                content: gridIcon
            });
            this.shortcuts = [
                {
                    combo: "Shift+Alt+G",
                    method: "togglePopup",
                },
            ];
        }
    }

    class NytShortcuts extends Plugin {
        toggleYesterday() {
            this.triggerPopup(".pz-toolbar-button__yesterday");
        }
        toggleStats() {
            this.triggerPopup(".pz-toolbar-button__stats");
        }
        triggerPopup(selector) {
            let popupCloser = findCloseButton(this.app);
            if (popupCloser) {
                setTimeout(hive.deleteLetter, 50);
                popupCloser.click();
            } else {
                fn.$(selector)?.click();
            }
        }
        constructor(app) {
            super(app, "NYT Shortcuts", "Adds keyboard shortcuts to native NYT popups", { key: "nytShortcuts" });
            this.shortcuts = [
                { combo: "Shift+Alt+Y", method: "toggleYesterday", label: `Yesterday's Answers` },
                { combo: "Shift+Alt+I", method: "toggleStats", label: `Statistics` },
            ].map((shortcut) => ({ ...shortcut, origin: "nyt" }));
        }
    }

    let registry = new Map();
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
                .map((part) => (modifierMap.has(part) ? modifierMap.get(part).human : part.replace(/^Digit|^Key/, "")))
                .join(" + ")
        );
    };
    const requiresDeletion = (combo, app) => {
        const key = getCharacterKey(normalizeCombo(combo));
        let pool = findCloseButton(app) ? characterKeys.sba : characterKeys.sba.join(characterKeys.nyt);
        return key && pool.includes(key);
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
        hive.deleteLetter().then(entry.callback());
        return true;
    };
    const set = (combo, shortcut) => {
        combo = normalizeCombo(combo);
        if (!isValidShortcut(shortcut)) {
            return false;
        }
        if(!shortcut.human){
            shortcut.human = comboToHuman(shortcut.combo);
        }
        if(typeof shortcut.enabled === 'undefined'){
            shortcut.enabled = true;
        }
        registry.set(combo, shortcut);
        settings.set(`options.${shortcut.module}.shortcuts.${shortcut.combo}`, shortcut);
    };
    const add = (shortcut) => {
        if (!isValidShortcut(shortcut)) {
            throw new Error("Invalid shortcut");
        }
        shortcut.combo = normalizeCombo(shortcut);
        const overrides = settings.get(`options.${shortcut.module}.shortcuts.${shortcut.combo}`) || {};
        Object.assign(shortcut, { enabled: true }, overrides, {
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
            aria: {
                role: "switch",
            },
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

    const plugins = new Map();
    const register = (Plugin, app) => {
        const instance = new Plugin(app);
        instance.add();
        plugins.set(instance.key, instance);
        (instance.shortcuts || []).map((instanceShortcut) => {
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
        getSyncData() {
            return Array.from(fn.$$('li', this.resultList)).map(li => li.textContent.trim());
        }
        envIs(env) {
            return document.body.classList.contains("pz-" + env);
        }
        focusGame() {
            if (!this.envIs("desktop")) {
                return false;
            }
            fn.$(".pz-moment__welcome.on-stage .pz-moment__button").addEventListener(
                "pointerup",
                () => {
                    window.scrollTo(0, 0);
                    const titlebarRect = fn.$(".pz-game-title-bar").getBoundingClientRect();
                    const targetOffsetTop = titlebarRect.top + titlebarRect.height - fn.$(".pz-game-header").offsetHeight;
                    window.scrollTo(0, targetOffsetTop);
                },
                false
            );
            return true;
        }
        load() {
            fn.waitFor(".sb-wordlist-items-pag", this.gameWrapper).then((resultList) => {
                this.observer = this.buildObserver();
                this.modalWrapper = fn.$("#portal-game-modals .sb-modal-wrapper", this.gameWrapper);
                this.resultList = resultList;
                data.init(this, this.getSyncData());
                hive.init(fn.$('.sb-controls-box', this.gameWrapper));
                this.add();
                this.domSet("active", true);
                shortcutRegistry.add(this.shortcut);
                this.registerPlugins();
                this.trigger(prefix("refreshUi"), null);
                document.dispatchEvent(new Event(prefix("ready")));
                document.addEventListener("keydown", (event) => {
                    if (!shortcutRegistry.getSbaShortcutEntry(event)) {
                        return;
                    }
                    if (!shortcutRegistry.requiresDeletion(event, this)) {
                        shortcutRegistry.handleShortcut(event);
                    } else {
                        this._lastShortcutEvent = event;
                    }
                });
                this.on(prefix("newInput"), (event) => {
                    if (this._lastShortcutEvent) {
                        shortcutRegistry.handleShortcut(this._lastShortcutEvent);
                        this._lastShortcutEvent = null;
                    }
                });
                this.focusGame();
            });
        }
        getState() {
            return this.domGet("active");
        }
        toggle() {
            this.domSet("active", !this.getState());
            return this;
        }
        buildObserver() {
            const observer = new MutationObserver((mutationList) => {
                mutationList.forEach((mutation) => {
                    if (!(mutation.target instanceof HTMLElement)) {
                        return false;
                    }
                    switch (true) {
                        case mutation.type === "childList" && mutation.target.isSameNode(this.modalWrapper):
                            if (fn.$(".sb-modal-frame.yesterday", mutation.target)) {
                                this.trigger(prefix("yesterday"), mutation.target);
                            }
                            break;
                        case mutation.type === "childList" && mutation.target.classList.contains("sb-hive-input-content"):
                            this.trigger(prefix("newInput"), mutation.target);
                            break;
                        case mutation.type === "childList" &&
                            mutation.target.isSameNode(this.resultList) &&
                            !!mutation.addedNodes.length &&
                            !!mutation.addedNodes[0].textContent.trim() &&
                            mutation.addedNodes[0] instanceof HTMLElement:
                            this.trigger(prefix("newWord"), mutation.addedNodes[0].textContent.trim());
                            break;
                    }
                });
            });
            const args = {
                target: this.gameWrapper,
                options: {
                    childList: true,
                    subtree: true,
                    attributes: true,
                },
            };
            observer.observe(args.target, args.options);
            return observer;
        }
        buildUi() {
            const events = {};
            events[prefix("destroy")] = () => {
                this.observer.disconnect();
                this.container.remove();
                this.domUnset("theme");
            };
            const classNames = [settings.get("prefix")];
            return fn.div({
                data: {
                    id: this.key,
                    version: settings.get("version"),
                },
                classNames,
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
            fn.$(".sb-content-box", this.gameWrapper).prepend(this.container);
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
            this.shortcut = {
                combo: "Shift+Alt+A",
                label: "Assistant Panel",
                module: this.key,
                callback: () => this.toggle(),
            };
            this.load();
        }
    }

    new App(fn.$('#js-hook-game-wrapper'));

})();
