(function () {
    'use strict';

    var label = "Spelling Bee Assistant";
    var title = "Assistant";
    var url = "https://spelling-bee-assistant.app/";
    var prefix$1 = "sba";
    var support = {
    	url: "https://ko-fi.com/sbassistant",
    	text: "Buy me a coffee"
    };
    var targetUrl = "https://www.nytimes.com/puzzles/spelling-bee";

    var version = "4.3.12";

    const settings = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix$1,
        support: support,
        targetUrl: targetUrl,
        options: JSON.parse(localStorage.getItem(prefix$1 + '-settings') || '{}')
    };
    const saveOptions = () => {
        localStorage.setItem(settings.prefix + '-settings', JSON.stringify(settings.options));
    };
    if (settings.options.version && settings.options.version !== settings.version) {
        settings.options.oldVersion = settings.options.version;
    }
    settings.options.version = settings.version;
    saveOptions();
    const get = key => {
        let current = Object.create(settings);
        for (let token of key.split('.')) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    const set = (key, value) => {
        const keys = key.split('.');
        const last = keys.pop();
        let current = settings;
        for (let part of keys) {
            if (!current[part]) {
                current[part] = {};
            }
            if (Object.prototype.toString.call(current) !== '[object Object]') {
                console.error(`${part} is not of the type Object`);
                return false;
            }
            current = current[part];
        }
        current[last] = value;
        saveOptions();
    };
    var settings$1 = {
        get,
        set
    };

    const pf = settings$1.get('prefix');
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
    const updateLists = term => {
        lists.foundTerms.push(term);
        completeLists();
    };
    const init = (_app, foundTerms) => {
        app = _app;
        initLists(foundTerms);
        app.on(prefix('newWord'), evt => {
            updateLists(evt.detail);
        });
    };
    var data = {
        init,
        getList,
        getCount,
        getPoints,
        getId,
        getDate,
        getCenterLetter
    };

    class Widget {
        getState() {
            const stored = settings$1.get(`options.${this.key}`);
            return typeof stored !== 'undefined' ? stored : this.defaultState;
        }
        setState(state) {
            if (this.canChangeState) {
                settings$1.set(`options.${this.key}`, state);
            }
            return this;
        }
        toggle(state) {
            if (!this.canChangeState) {
                return this;
            }
            this.setState(state);
            if (this.hasUi()) {
                this.ui.classList.toggle('inactive', !state);
            }
            return this;
        }
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
            key,
            canChangeState,
            defaultState
        } = {}) {
            if (!title) {
                throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
            }
            this.title = title;
            this.key = key || camel(title);
            this.canChangeState = typeof canChangeState !== 'undefined' ? canChangeState : false;
            this.defaultState = typeof defaultState !== 'undefined' ? defaultState : true;
            this.setState(this.getState());
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
        constructor(app, title, description, {
            key,
            canChangeState,
            defaultState,
            menuIcon,
            runEvt,
            addMethod
        } = {}) {
            super(title, {
                key,
                canChangeState,
                defaultState
            });
            this.target;
            this.description = description || '';
            this.app = app;
            this.addMethod = addMethod || 'append';
            this.menuIcon = menuIcon || 'checkbox';
            if (runEvt) {
                this.app.on(runEvt, evt => {
                    this.run(evt);
                });
            }
        }
    }

    class DarkMode extends Plugin {
        toggle(state) {
            super.toggle(state);
            document.body.dataset[prefix('theme')] = state ? 'dark' : 'light';
            return this;
        }
        constructor(app) {
            super(app, 'Dark Mode', 'Applies a dark theme to this page', {
                canChangeState: true,
                defaultState: false
            });
            this.toggle(this.getState());
        }
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var src;
    var hasRequiredSrc;

    function requireSrc () {
    	if (hasRequiredSrc) return src;
    	hasRequiredSrc = 1;
    	const cast = content => {
    	    if (typeof content === 'undefined') {
    	        return document.createDocumentFragment();
    	    }
    	    if (content instanceof Element || content instanceof DocumentFragment) {
    	        return content;
    	    }
    	    if (typeof content === 'number') {
    	        content = content.toString();
    	    }
    	    if (typeof content === 'string' ||
    	        content instanceof String
    	    ) {
    	        if (!(/<(.*)>/.test(content))) {
    	            return document.createTextNode(content);
    	        }
    	        let node;
    	        const mime = content.includes('<svg') ? 'image/svg+xml' : 'text/html';
    	        const doc = (new DOMParser()).parseFromString(content, mime);
    	        if (doc.body) {
    	            node = document.createDocumentFragment();
    	            const children = Array.from(doc.body.childNodes);
    	            children.forEach(elem => {
    	                node.append(elem);
    	            });
    	            return node;
    	        }
    	        else {
    	            return doc.documentElement;
    	        }
    	    }
    	    console.error('Expected Element|DocumentFragment|String|HTMLCode|SVGCode, got', content);
    	};
    	const obj = {
    	    $: (selector, container = null) => {
    	        return typeof selector === 'string' ? (container || document).querySelector(selector) : selector || null;
    	    },
    	    $$: (selector, container = null) => {
    	        return [].slice.call((container || document).querySelectorAll(selector));
    	    },
    	    waitFor: function (selector, container = null) {
    	        return new Promise(resolve => {
    	            const getElement = () => {
    	                const element = obj.$(selector, container);
    	                if (element) {
    	                    resolve(element);
    	                } else {
    	                    requestAnimationFrame(getElement);
    	                }
    	            };
    	            getElement();
    	        })
    	    },
    	    toNode: content => {
    	        if (!content.forEach || typeof content.forEach !== 'function') {
    	            content = [content];
    	        }
    	        content = content.map(entry => cast(entry));
    	        if (content.length === 1) {
    	            return content[0]
    	        } else {
    	            const fragment = document.createDocumentFragment();
    	            content.forEach(entry => {
    	                fragment.append(entry);
    	            });
    	            return fragment;
    	        }
    	    },
    	    empty: element => {
    	        while (element.lastChild) {
    	            element.lastChild.remove();
    	        }
    	        element.textContent = '';
    	        return element;
    	    }
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
    	    isSvg = false
    	} = {}) {
    	    const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    	    new Map([
    	        ['class', 'className'],
    	        ['for', 'htmlFor'],
    	        ['tabindex', 'tabIndex'],
    	        ['nomodule', 'noModule'],
    	        ['contenteditable', 'contentEditable'],
    	        ['accesskey', 'accessKey']
    	    ]).forEach((right, wrong) => {
    	        if (typeof attributes[right] === 'undefined' && attributes[wrong]) {
    	            attributes[right] = attributes[wrong];
    	        }
    	        delete attributes[wrong];
    	    });
    	    if (attributes.style) {
    	        const styleAttr = {};
    	        attributes.style.split(';').forEach(rule => {
    	            const parts = rule.split(':').map(entry => entry.trim());
    	            styleAttr[parts[0]] = parts[1];
    	        });
    	        style = {
    	            ...styleAttr,
    	            ...style
    	        };
    	        delete attributes.style;
    	    }
    	    for (let [key, value] of Object.entries(attributes)) {
    	        if (isSvg) {
    	            el.setAttributeNS(null, key, value.toString());
    	        } else if (value !== false) {
    	            el[key] = value;
    	        }
    	    }
    	    for (let [key, value] of Object.entries(aria)) {
    	        key = key === 'role' ? key : 'aria-' + key;
    	        el.setAttribute(key.toLowerCase(), value);
    	    }
    	    for (let [key, value] of Object.entries(data)) {
    	        value = value.toString();
    	        el.dataset[key] = value;
    	    }
    	    for (const [event, fn] of Object.entries(events)) {
    	        el.addEventListener(event, fn, false);
    	    }
    	    Object.assign(el.style, style);
    	    if (classNames.length) {
    	        el.classList.add(...classNames);
    	    }
    	    if (typeof content !== 'undefined') {
    	        el.append(obj.toNode(content));
    	    }
    	    return el;
    	};
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
    	                    tag: prop
    	                },
    	                ...args.shift()
    	            });
    	        }
    	    }
    	});
    	return src;
    }

    var srcExports = requireSrc();
    var fn = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

    class Popup {
        enableKeyClose() {
            document.addEventListener('keyup', evt => {
                this.app.popupCloser = this.getCloseButton();
                if (this.app.popupCloser && evt.code === 'Escape') {
                    this.app.popupCloser.click();
                }
                delete (this.app.popupCloser);
            });
            return this;
        }
        getTarget() {
            const dataUi = prefix('popup-container', 'd');
            let container = fn.$(`[data-ui="${dataUi}"]`);
            if (!container) {
                container = fn.template({
                    data: {
                        ui: dataUi
                    }
                });
                fn.$('body').append(container);
            }
            return container;
        }
        create() {
            return fn.div({
                classNames: ['sb-modal-frame', prefix('pop-up', 'd')],
                aria: {
                    role: 'button'
                },
                data: {
                    ui: this.key
                },
                events: {
                    click: e => {
                        e.stopPropagation();
                    }
                },
                content: [
                    fn.div({
                        classNames: ['sb-modal-top'],
                        content: fn.div({
                            aria: {
                                role: 'button'
                            },
                            classNames: ['sb-modal-close'],
                            content: '×',
                            events: {
                                click: () => {
                                    this.toggle(false);
                                }
                            }
                        })
                    }),
                    fn.div({
                        classNames: ['sb-modal-content'],
                        content: [
                            fn.div({
                                classNames: ['sb-modal-header'],
                                content: [this.parts.title, this.parts.subtitle]
                            }),
                            this.parts.body,
                            this.parts.footer
                        ]
                    })
                ]
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
        getCloseButton() {
            for (let selector of [
                '.pz-moment__frame.on-stage .pz-moment__close',
                '.pz-moment__frame.on-stage .pz-moment__close_text',
                '.sb-modal-close'
            ]) {
                const closer = fn.$(selector, this.app.gameWrapper);
                if (closer) {
                    return closer;
                }
            }
            return false;
        }
        toggle(state) {
            const closer = this.getCloseButton();
            if (!state && closer) {
                closer.click();
            }
            if (state) {
                this.app.modalWrapper.append(this.ui);
                this.modalSystem.classList.add('sb-modal-open');
                this.isOpen = true;
            } else {
                this.getTarget().append(this.ui);
                this.modalSystem.classList.remove('sb-modal-open');
                this.isOpen = false;
            }
            return this;
        }
        constructor(app, key) {
            this.key = key;
            this.app = app;
            this.state = false;
            this.isOpen = false;
            this.modalSystem = this.app.modalWrapper.closest('.sb-modal-system');
            this.parts = {
                title: fn.h3({
                    classNames: ['sb-modal-title']
                }),
                subtitle: fn.p({
                    classNames: ['sb-modal-message']
                }),
                body: fn.div({
                    classNames: ['sb-modal-body']
                }),
                footer: fn.div({
                    classNames: ['sb-modal-message', 'sba-modal-footer'],
                    content: [
                        fn.a({
                            content: settings$1.get('label'),
                            attributes: {
                                href: settings$1.get('url'),
                                target: prefix()
                            }
                        })
                    ]
                })
            };
            this.ui = this.create();
            this.enableKeyClose();
            this.getTarget().append(this.ui);
        }
    }

    class ColorConfig extends Plugin {
        toggle(state) {
            fn.$$('[data-sba-theme]').forEach(element => {
                element.style.setProperty('--dhue', state.hue);
                element.style.setProperty('--dsat', state.sat + '%');
            });
            return super.toggle(state);
        }
        display() {
            this.popup.toggle(true);
            fn.$('input:checked', this.popup.ui).focus();
        }
        constructor(app) {
            super(app, 'Dark Mode Colors', 'Select your favorite color scheme for the Dark Mode.', {
                canChangeState: true,
                defaultState: {
                    hue: 0,
                    sat: 0
                }
            });
            this.menuAction = 'popup';
            this.menuIcon = 'null';
            const swatches = fn.ul({
                classNames: [prefix('swatches', 'd')]
            });
            for (let hue = 0; hue < 360; hue += 30) {
                const sat = hue === 0 ? 0 : 25;
                swatches.append(fn.li({
                    content: [
                        fn.input({
                            attributes: {
                                name: 'color-picker',
                                type: 'radio',
                                value: hue,
                                checked: hue === this.getState().hue,
                                id: prefix('h' + hue)
                            },
                            events: {
                                change: () => {
                                    this.toggle({
                                        hue,
                                        sat
                                    });
                                }
                            }
                        }),
                        fn.label({
                            attributes: {
                                htmlFor: prefix('h' + hue)
                            },
                            style: {
                                background: `hsl(${hue}, ${sat}%, 22%)`
                            }
                        })
                    ]
                }));
            }
            this.popup = new Popup(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', this.description)
                .setContent('body', fn.div({
                    classNames: [prefix('color-selector', 'd')],
                    content: [
                        swatches,
                        fn.div({
                            classNames: ['hive'],
                            content: [fn.svg({
                                classNames: ['hive-cell', 'outer'],
                                attributes: {
                                    viewBox: `0 0 24 21`
                                },
                                isSvg: true,
                                content: [fn.path({
                                    classNames: ['cell-fill'],
                                    isSvg: true,
                                    attributes: {
                                        d: 'M18 21H6L0 10.5 6 0h12l6 10.5z'
                                    }
                                }),
                                    fn.text({
                                        classNames: ['cell-letter'],
                                        attributes: {
                                            x: '50%',
                                            y: '50%',
                                            dy: '0.35em',
                                        },
                                        isSvg: true,
                                        content: 's',
                                    })
                                ]
                            })]
                        }),
                    ]
                }));
            this.popup.ui.dataset[prefix('theme')] = 'dark';
            this.toggle(this.getState());
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), '', {
                key: 'header'
            });
            this.ui = fn.div({
                content: this.title
            });
        }
    }

    class ProgressBar extends Plugin {
        run(evt) {
            let progress = data.getPoints('foundTerms') * 100 / data.getPoints('answers');
            progress = Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100);
            this.ui.value = progress;
            this.ui.textContent = progress + '%';
            this.ui.title = `Progress: ${progress}%`;
            return this;
        }
        constructor(app) {
            super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
                canChangeState: true,
                runEvt: prefix('refreshUi'),
                addMethod: 'before'
            });
            this.ui = fn.progress({
                attributes: {
                    max: 100
                }
            });
            app.on(prefix('pluginsReady'), evt => {
                if (this.app.plugins.has('yourProgress')) {
                    this.ui.style.cursor = 'pointer';
                    this.ui.addEventListener('pointerup', () => {
                        this.app.plugins.get('yourProgress').display();
                    });
                }
            });
            this.target = fn.$('.sb-wordlist-heading', this.app.gameWrapper);
            this.toggle(this.getState());
        }
    }

    class TablePane extends Plugin {
        run(evt) {
            this.pane = fn.empty(this.pane);
            const tbody = fn.tbody();
            const data = this.getData();
            if (this.hasHeadRow) {
                this.pane.append(this.buildHead(data.shift()));
            }
            const l = data.length;
            let colCnt = 0;
            data.forEach((rowData, i) => {
                colCnt = rowData.length;
                const classNames = [];
                for (const [marker, fn] of Object.entries(this.cssMarkers)) {
                    if (fn(rowData, i, l)) {
                        classNames.push(prefix(marker, 'd'));
                    }
                }
                const tr = fn.tr({
                    classNames
                });
                rowData.forEach((cellData, rInd) => {
                    const tag = rInd === 0 && this.hasHeadCol ? 'th' : 'td';
                    tr.append(fn[tag]({
                        content: cellData
                    }));
                });
                tbody.append(tr);
            });
            this.pane.dataset.cols = colCnt;
            this.pane.append(tbody);
            return this;
        }
        buildHead(rowData) {
            return fn.thead({
                content: fn.tr({
                    content: rowData.map(cellData => fn.th({
                        content: cellData
                    }))
                })
            });
        }
        getPane() {
            return this.pane;
        }
        constructor(app, title, description, {
            canChangeState = true,
            defaultState = true,
            cssMarkers = {},
            hasHeadRow = true,
            hasHeadCol = true
        } = {}) {
            super(app, title, description, {
                canChangeState,
                defaultState
            });
            app.on(prefix('refreshUi'), () => {
                this.run();
            });
            this.cssMarkers = cssMarkers;
            this.hasHeadRow = hasHeadRow;
            this.hasHeadCol = hasHeadCol;
            this.pane = fn.table({
                classNames: ['pane', prefix('dataPane', 'd')]
            });
        }
    }

    class Score extends TablePane {
        getData() {
            const keys = ['foundTerms', 'remainders', 'answers'];
            return [
                ['', '✓', '?', '∑'],
                ['W'].concat(keys.map(key => data.getCount(key))),
                ['P'].concat(keys.map(key => data.getPoints(key)))
            ];
        }
        constructor(app) {
            super(app, 'Score', 'The number of words and points and how many have been found');
            this.ui = fn.details({
                attributes: {
                    open: true
                },
                content: [
                    fn.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
        }
    }

    class SpillTheBeans extends Plugin {
        run(evt) {
            let emoji = '🙂';
            if (!evt.detail) {
                emoji = '😐';
            } else if (!data.getList('remainders').filter(term => term.startsWith(evt.detail)).length) {
                emoji = '🙁';
            }
            this.ui.textContent = emoji;
            return this;
        }
        toggle(state) {
            if (state) {
                this.app.domSet('submenu', false);
            }
            return super.toggle(state);
        }
        constructor(app) {
            super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
                canChangeState: true,
                runEvt: prefix('newInput'),
                addMethod: 'prepend'
            });
            this.ui = fn.div({
                content: '😐'
            });
            this.target = fn.$('.sb-controls', this.app.gameWrapper);
            this.toggle(false);
        }
    }

    class LetterCount extends TablePane {
        getData() {
            const counts = {};
            const cellData = [
                ['', '✓', '?', '∑']
            ];
            data.getList('answers').forEach(term => {
                counts[term.length] = counts[term.length] || {
                    found: 0,
                    missing: 0,
                    total: 0
                };
                if (data.getList('foundTerms').includes(term)) {
                    counts[term.length].found++;
                } else {
                    counts[term.length].missing++;
                }
                counts[term.length].total++;
            });
            let keys = Object.keys(counts);
            keys.sort((a, b) => a - b);
            keys.forEach(count => {
                cellData.push([
                    count,
                    counts[count].found,
                    counts[count].missing,
                    counts[count].total
                ]);
            });
            return cellData;
        }
        constructor(app) {
            super(app, 'Letter count', 'The number of words by length', {
                cssMarkers: {
                    completed: (rowData, i) => rowData[2] === 0
                }
            });
            this.ui = fn.details({
                content: [
                    fn.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    }

    let FirstLetter$1 = class FirstLetter extends TablePane {
        getData() {
            const letters = {};
            const answers = data.getList('answers').sort();
            const remainders = data.getList('remainders');
            const tpl = {
                foundTerms: 0,
                remainders: 0,
                total: 0
            };
            answers.forEach(term => {
                const letter = term.charAt(0);
                if (typeof letters[letter] === 'undefined') {
                    letters[letter] = {
                        ...tpl
                    };
                }
                if (remainders.includes(term)) {
                    letters[letter].remainders++;
                } else {
                    letters[letter].foundTerms++;
                }
                letters[letter].total++;
            });
            const cellData = [
                ['', '✓', '?', '∑']
            ];
            for (let [letter, values] of Object.entries(letters)) {
                values = Object.values(values);
                values.unshift(letter);
                cellData.push(values);
            }
            return cellData;
        }
        constructor(app) {
            super(app, 'First letter', 'The number of words by first letter', {
                cssMarkers: {
                    completed: (rowData, i) => rowData[2] === 0,
                    preeminent: (rowData, i) => rowData[0] === data.getCenterLetter()
                }
            });
            this.ui = fn.details({
                content: [
                    fn.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    };

    class FirstLetter extends TablePane {
        getData() {
            const letters = {};
            const answers = data.getList('answers').sort();
            const remainders = data.getList('remainders');
            const tpl = {
                foundTerms: 0,
                remainders: 0,
                total: 0
            };
            answers.forEach(term => {
                const bigram = term.slice(0, 2);
                if (typeof letters[bigram] === 'undefined') {
                    letters[bigram] = {
                        ...tpl
                    };
                }
                if (remainders.includes(term)) {
                    letters[bigram].remainders++;
                } else {
                    letters[bigram].foundTerms++;
                }
                letters[bigram].total++;
            });
            const cellData = [
                ['', '✓', '?', '∑']
            ];
            for (let [letter, values] of Object.entries(letters)) {
                values = Object.values(values);
                values.unshift(letter);
                cellData.push(values);
            }
            return cellData;
        }
        constructor(app) {
            super(app, 'First two letters', 'The number of words by the first two letters', {
                cssMarkers: {
                    completed: (rowData, i) => rowData[2] === 0
                }
            });
            this.ui = fn.details({
                content: [
                    fn.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    }

    class Pangrams extends TablePane {
        getData() {
            const pangramCount = data.getCount('pangrams');
            const foundPangramCount = data.getCount('foundPangrams');
            return [
                ['✓', '?', '∑'],
                [
                    foundPangramCount,
                    pangramCount - foundPangramCount,
                    pangramCount
                ]
            ];
        }
        constructor(app) {
            super(app, 'Pangrams', 'The number of pangrams', {
                cssMarkers: {
                    completed: (rowData, i) => rowData[1] === 0
                },
                hasHeadCol: false
            });
            this.ui = fn.details({
                content: [
                    fn.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    }

    class YourProgress extends TablePane {
        display() {
            const points = data.getPoints('foundTerms');
            const max = data.getPoints('answers');
            const next = this.getPointsToNextTier();
            const progress = points * 100 / max;
            let content;
            if (next) {
                content = fn.span({
                    content: [
                        'You are currently at ',
                        fn.b({
                            content: points + '/' + max
                        }),
                        ' points or ',
                        fn.b({
                            content: Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100) + '%'
                        }),
                        '. You need ',
                        fn.b({
                            content: next - points
                        }),
                        ' more points to go to the next level.',
                    ]
                });
            } else {
                content = fn.span({
                    content: [
                        'Congratulations, you’ve found all ',
                        fn.b({
                            content: points
                        }),
                        ' points!',
                    ]
                });
            }
            this.popup
                .setContent('subtitle', fn.span({
                    content
                }))
                .setContent('body', this.getPane())
                .toggle(true);
            return this;
        }
        getData() {
            const maxPoints = data.getPoints('answers');
            return [
                ['Beginner', 0],
                ['Good Start', 2],
                ['Moving Up', 5],
                ['Good', 8],
                ['Solid', 15],
                ['Nice', 25],
                ['Great', 40],
                ['Amazing', 50],
                ['Genius', 70],
                ['Queen Bee', 100]
            ].map(entry => {
                return [entry[0], Math.round(entry[1] / 100 * maxPoints), entry[1]];
            })
        }
        getCurrentTier() {
            return this.getData().filter(entry => entry[1] <= data.getPoints('foundTerms')).pop()[1];
        }
        getPointsToNextTier() {
            const remainders = this.getData().filter(entry => entry[1] > data.getPoints('foundTerms')).shift();
            return remainders ? remainders[1] : null;
        }
        constructor(app) {
            super(app, 'Your Progress', 'The number of points required for each level', {
                cssMarkers: {
                    completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
                    preeminent: rowData => rowData[1] === this.getCurrentTier()
                },
                hasHeadRow: false,
                hasHeadCol: false
            });
            this.popup = new Popup(this.app, this.key)
                .setContent('title', this.title);
            this.menuAction = 'popup';
            this.menuIcon = 'null';
        }
    }

    class Community extends Plugin {
        hasGeniusNo4Letters() {
            const maxPoints = data.getPoints('answers');
            const no4LetterPoints = maxPoints - data.getList('answers').filter(term => term.length === 4).length;
            return no4LetterPoints >= Math.round(70 / 100 * maxPoints);
        }
        getPerfectPangramCount() {
            return data.getList('pangrams').filter(term => term.length === 7).length;
        }
        hasBingo() {
            return Array.from(new Set(data.getList('answers').map(term => term.charAt(0)))).length === 7;
        }
        nytCommunity() {
            const date = data.getDate().print;
            const href = `https://www.nytimes.com/${date.replace(/-/g, '/')}/crosswords/spelling-bee-${date}.html#commentsContainer`;
            return fn.a({
                content: 'NYT Spelling Bee Forum for today’s game',
                attributes: {
                    href,
                    target: prefix()
                }
            })
        }
        twitter() {
            const hashtags = ['hivemind', 'nytspellingbee', 'nytbee', 'nytsb'].map(tag => fn.a({
                content: `#${tag}`,
                attributes: {
                    href: `https://twitter.com/hashtag/${tag}`,
                    target: prefix()
                }
            }));
            const result = [];
            hashtags.forEach(entry => {
                result.push(entry, ', ');
            });
            result.pop();
            result.push(' on Twitter');
            return result;
        }
        nytSpotlight() {
            const href = `https://www.nytimes.com/spotlight/spelling-bee-forum`;
            return fn.a({
                content: 'Portal to all NYT Spelling Bee Forums',
                attributes: {
                    href,
                    target: prefix()
                }
            })
        }
        redditCommunity() {
            return fn.a({
                content: 'NY Times Spelling Bee Puzzle on Reddit',
                attributes: {
                    href: 'https://www.reddit.com/r/NYTSpellingBee/',
                    target: prefix()
                }
            })
        }
        display() {
            this.popup.toggle(true);
            return this;
        }
        constructor(app) {
            super(app, 'Community', 'Spelling Bee resources suggested by the community', {
                canChangeState: true
            });
            this.menuAction = 'popup';
            this.menuIcon = 'null';
            const words = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
            const features = fn.ul({
                content: [
                    fn.li({
                        content: [
                            fn.h4({
                                content: 'Does today’s game have a Perfect Pangram?'
                            }),
                            fn.p({
                                content: (() => {
                                    const pp = this.getPerfectPangramCount();
                                    switch (pp) {
                                        case 0:
                                            return `No, today it doesn’t.`;
                                        case 1:
                                            return `Yes, today there’s one Perfect Pangram.`;
                                        default:
                                            return `Yes, today there are ${words[pp - 2]} Perfect Pangrams.`;
                                    }
                                })()
                            }),
                            fn.em({
                                content: 'Pangrams that use each letter only once are called "perfect" by the community.'
                            })
                        ]
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: 'Does it classify as "Bingo"?'
                            }),
                            fn.p({
                                content: this.hasBingo() ? 'Yes, today is Bingo day!' : 'No, today it doesn’t.'
                            }),
                            fn.em({
                                content: '"Bingo" means that all seven letters in the puzzle are used to start at least one word in the word list.'
                            })
                        ]
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: 'Is it possible to reach Genius without using 4-letter words?'
                            }),
                            fn.p({
                                content: this.hasGeniusNo4Letters() ? 'Yes, today it is!' : 'No, today it isn’t.'
                            })
                        ]
                    }),
                    fn.li({
                        content: [
                            fn.h4({
                                content: 'Forums and Hashtags'
                            }),
                            fn.ul({
                                content: [
                                    fn.li({
                                        content: this.nytCommunity()
                                    }),
                                    fn.li({
                                        content: this.nytSpotlight()
                                    }),
                                    fn.li({
                                        content: this.redditCommunity()
                                    }),
                                    fn.li({
                                        content: this.twitter()
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
            this.popup = new Popup(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', this.description)
                .setContent('body', features);
        }
    }

    class TodaysAnswers extends Plugin {
        display() {
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
            this.popup
                .setContent('body', [
                    fn.div({
                        content: data.getList('letters').join(''),
                        classNames: ['sb-modal-letters']
                    }),
                    pane
                ])
                .toggle(true);
            return this;
        }
        constructor(app) {
            super(app, 'Today’s Answers', 'Reveals the solution of the game', {
                canChangeState: true,
                defaultState: false,
                key: 'todaysAnswers'
            });
            this.marker = prefix('resolved', 'd');
            this.popup = new Popup(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', data.getDate().display);
            this.menuAction = 'popup';
            this.menuIcon = 'warning';
        }
    }

    class PangramHl extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
        run(evt) {
            const pangrams = data.getList('pangrams');
            const container = evt && evt.detail ? evt.detail : this.app.resultList;
            fn.$$('li', container).forEach(node => {
                const term = node.textContent;
                if (pangrams.includes(term) || fn.$('.pangram', node)) {
                    node.classList.toggle(this.marker, this.getState());
                }
            });
            return this;
        }
        constructor(app) {
            super(app, 'Highlight PangramHl', '', {
                canChangeState: false,
                runEvt: prefix('refreshUi')
            });
            this.marker = prefix('pangram', 'd');
            this.app.on(prefix('yesterday'), evt => {
                this.run(evt);
            });
            this.run();
        }
    }

    class Googlify extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
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
            const method = `${this.getState() ? 'add' : 'remove'}EventListener`;
            [this.app.modalWrapper, this.app.resultList.parentElement].forEach(container => {
                container[method]('pointerup', this.listener);
                container.classList.toggle(prefix('googlified', 'd'), this.getState());
            });
            return this;
        }
        constructor(app) {
            super(app, 'Googlify', 'Link all result terms to Google', {
                canChangeState: false
            });
            this.run();
        }
    }

    var css = "[data-sba-theme]{--dhue: 0;--dsat: 0%;--link-hue: 206;--shadow-light-color: hsl(49, 96%, 50%, 0.35);--shadow-dark-color: hsl(49, 96%, 50%, 0.7);--highlight-text-color: hsl(0, 0%, 0%)}[data-sba-theme=light]{--highlight-bg-color:hsl(52,93%,55%);--text-color:#000;--site-text-color:rgba(0,0,0,.9);--body-bg-color:#fff;--modal-bg-color:hsla(0,0%,100%,.85);--border-color:hsl(0,0%,86%);--area-bg-color:hsl(0,0%,90%);--invalid-color:hsl(0,0%,68%);--menu-hover-color:hsl(0,0%,96%);--head-row-bg-color:hsl(0,0%,96%);--card-color:hsla(52,93%,55%,.1);--link-color:hsl(var(--link-hue), 45%, 38%);--link-visited-color:hsl(var(--link-hue), 45%, 53%);--link-hover-color:hsl(var(--link-hue), 45%, 53%);--success-color:hsl(113,71%,38%)}[data-sba-theme=dark]{--highlight-bg-color:hsl(49,96%,50%);--text-color:hsl(var(--dhue), var(--dsat), 85%);--site-text-color:hsl(var(--dhue), var(--dsat), 100%, 0.9);--body-bg-color:hsl(var(--dhue), var(--dsat), 7%);--modal-bg-color:hsl(var(--dhue), var(--dsat), 7%, 0.85);--border-color:hsl(var(--dhue), var(--dsat), 20%);--area-bg-color:hsl(var(--dhue), var(--dsat), 22%);--invalid-color:hsl(var(--dhue), var(--dsat), 50%);--menu-hover-color:hsl(var(--dhue), var(--dsat), 22%);--head-row-bg-color:hsl(var(--dhue), var(--dsat), 13%);--card-color:hsl(var(--dhue), var(--dsat), 22%);--link-color:hsl(var(--link-hue), 90%, 64%);--link-visited-color:hsl(var(--link-hue), 90%, 76%);--link-hover-color:hsl(var(--link-hue), 90%, 76%);--success-color:hsl(113,90%,64%)}body{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-field{background:var(--body-bg-color);color:var(--text-color)}body[data-sba-theme=dark] .pz-game-wrapper,body[data-sba-theme=dark] #js-hook-pz-moment__loading{background:var(--body-bg-color) !important;color:var(--text-color)}body .pz-game-wrapper .sb-modal-message a{color:var(--link-color)}body .pz-game-wrapper .sb-modal-message a:visited{color:var(--link-visited-color)}body .pz-game-wrapper .sb-modal-message a:hover{color:var(--link-hover-color)}body .pz-game-wrapper .sb-progress-marker .sb-progress-value,body .pz-game-wrapper .hive-cell:first-child .cell-fill{background:var(--highlight-bg-color);fill:var(--highlight-bg-color);color:var(--highlight-text-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-fill,body .pz-game-wrapper .hive-cell .cell-fill{fill:var(--area-bg-color)}body[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}body[data-sba-theme=dark] .pangram-message .sb-message{background:var(--highlight-bg-color);color:var(--highlight-text-color)}body[data-sba-theme=dark] .hive-action__shuffle{position:relative}body[data-sba-theme=dark] .sb-progress-value{font-weight:bold}body[data-sba-theme=dark] .pz-icon-close{filter:invert(1)}body[data-sba-theme=dark].pz-mobile .pz-toolbar-button,body[data-sba-theme=dark].pz-mobile .pz-dropdown__button{background-color:rgba(0,0,0,0) !important}body[data-sba-theme=dark] .pz-moment__frame.pz-moment__welcome *{color:var(--text-color)}body[data-sba-theme=dark] .sb-toggle-icon,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow,body[data-sba-theme=dark] .hive-action__shuffle{background-position:-1000px}body[data-sba-theme=dark] .sb-toggle-icon:after,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow:after,body[data-sba-theme=dark] .hive-action__shuffle:after{content:\"\";opacity:.85;top:0;left:0;bottom:0;right:0;position:absolute;z-index:0;filter:invert(1);background-image:inherit;background-repeat:inherit;background-position:center;background-size:inherit}#js-logo-nav rect{fill:var(--body-bg-color)}#js-logo-nav path{fill:var(--text-color)}.pz-moment__loading{color:#000}.pz-nav__hamburger-inner,.pz-nav__hamburger-inner::before,.pz-nav__hamburger-inner::after{background-color:var(--text-color)}.pz-nav{width:100%;background:var(--body-bg-color)}.pz-modal__button.white,.pz-footer,.pz-moment,.sb-modal-scrim{background:var(--modal-bg-color) !important;color:var(--text-color) !important}.pz-modal__button.white .pz-moment__button.secondary,.pz-footer .pz-moment__button.secondary,.pz-moment .pz-moment__button.secondary,.sb-modal-scrim .pz-moment__button.secondary{color:#fff}.pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary{color:var(--text-color)}.pz-moment__frame:is(.pz-moment__congrats,.pz-moment__welcome) .pz-moment__button.secondary:hover{color:var(--body-bg-color)}.sb-modal-wrapper .sb-modal-frame{border:1px solid var(--border-color);background:var(--body-bg-color);color:var(--text-color)}.sb-modal-wrapper .pz-modal__title,.sb-modal-wrapper .sb-modal-close{color:var(--text-color)}.pz-moment__close::before,.pz-moment__close::after{background:var(--text-color)}.pz-moment__close_text{color:currentColor}.pz-modal__button.white:hover{background:var(--area-bg-color)}.sb-input-invalid{color:var(--invalid-color)}.sb-toggle-expand{box-shadow:none}.sb-input-bright,.sb-progress-dot.completed::after{color:var(--highlight-bg-color)}.hive-cell .cell-fill{stroke:var(--body-bg-color)}.hive-cell .cell-letter{fill:var(--text-color)}.hive-cell.center .cell-letter{fill:var(--highhlight-text-color)}.hive-action{background-color:var(--body-bg-color);color:var(--text-color)}.hive-action.push-active{background:var(--menu-hover-color)}[data-sba-theme] .sb-modal-wordlist-items li,.sb-wordlist-items-pag>li,.pz-ad-box,.pz-game-toolbar,.pz-spelling-bee-wordlist,.hive-action,.sb-wordlist-box,.sb-message{border-color:var(--border-color)}.sb-toggle-expand{background:var(--body-bg-color)}.sb-progress-line,.sb-progress-dot::after,.pz-nav::after{background:var(--border-color)}.sb-bob{background-color:var(--border-color)}.sb-bob.active{background-color:var(--text-color)}.sba{background:var(--body-bg-color);border-radius:6px;border-style:solid;border-width:1px}.sba *:focus{outline:0}.sba ::selection{background:rgba(0,0,0,0)}.sba details{font-size:90%;margin-bottom:1px}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid var(--border-color)}[data-ui].inactive{display:none}.sba-data-pane{border:1px solid var(--border-color);width:100%;font-size:85%;margin-bottom:2px;border-collapse:collapse;table-layout:fixed;border-top:none}.sba-data-pane[data-cols=\"3\"] :is(th,td){width:33.3333333333%}.sba-data-pane[data-cols=\"4\"] :is(th,td){width:25%}.sba-data-pane[data-cols=\"5\"] :is(th,td){width:20%}.sba-data-pane[data-cols=\"6\"] :is(th,td){width:16.6666666667%}.sba-data-pane[data-cols=\"7\"] :is(th,td){width:14.2857142857%}.sba-data-pane[data-cols=\"8\"] :is(th,td){width:12.5%}.sba-data-pane[data-cols=\"9\"] :is(th,td){width:11.1111111111%}.sba-data-pane[data-cols=\"10\"] :is(th,td){width:10%}.sba-data-pane th{text-transform:uppercase;background:var(--head-row-bg-color)}.sba-data-pane .sba-preeminent{font-weight:bold;border-bottom:2px solid var(--highlight-bg-color) !important}.sba-data-pane .sba-completed td,.sba-data-pane td.sba-completed{color:var(--invalid-color);font-weight:normal}.sba-data-pane .sba-hidden{display:none}.sba-data-pane :is(th,td){border:1px solid var(--border-color);border-top:none;white-space:nowrap;text-align:center;padding:3px 2px}.sba-data-pane th{background-color:var(--head-row-bg-color)}[data-ui=community] h4{font-weight:700;font-family:nyt-franklin;font-size:18px;margin:0 0 1px 0}[data-ui=community] p{margin:0 0 2px 0;font-size:16px}[data-ui=community] em{display:block;font-weight:normal;font-weight:500;font-size:14px;font-family:nyt-franklin}[data-ui=community] li{margin:0 0 12px 0}[data-ui=community] li ul{padding-left:20px;list-style:disc}[data-ui=community] li ul li{margin:0}[data-ui=community] li ul li a{color:var(--link-color)}[data-ui=community] li ul li a:hover{color:var(--link-hover-color)}[data-ui=community] .sb-modal-body{margin-top:0;padding-bottom:10px}[data-ui=yourProgress] b{font-weight:700}[data-ui=yourProgress] .sba-data-pane{margin-left:5px;max-width:300px;border:none}[data-ui=yourProgress] .sba-data-pane tr.sba-completed td{color:var(--text-color)}[data-ui=yourProgress] .sba-data-pane tr td{border:none;text-align:left;line-height:1.8}[data-ui=yourProgress] .sba-data-pane tr td:nth-child(n+2){text-align:right;width:80px}[data-ui=yourProgress] .sba-data-pane tr td:nth-child(2)::after{content:\" pts.\"}[data-ui=yourProgress] .sba-data-pane tr td:last-child::after{content:\"%\"}[data-ui=header]{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px}[data-ui=progressBar]{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0;height:6px;padding:0;background:rgba(0,0,0,0);display:block;border:none;border-bottom:1px var(--border-color) solid}[data-ui=progressBar]::-webkit-progress-bar{background-color:rgba(0,0,0,0)}[data-ui=progressBar]::-webkit-progress-value{background-color:var(--highlight-bg-color);height:4px}[data-ui=progressBar]::-moz-progress-bar{background-color:var(--highlight-bg-color)}[data-ui=spillTheBeans]{text-align:center;padding:14px 0;font-size:38px;margin-top:-24px}[data-ui=menu]{position:relative;z-index:1}[data-ui=menu] .pane{color:var(--text-color);background:var(--body-bg-color);border:1px var(--border-color) solid;padding:5px;width:179px}[data-ui=menu] li{position:relative;line-height:1.8;white-space:nowrap;cursor:pointer;overflow:hidden;display:block;padding:5px 9px 5px 36px;font-size:14px}[data-ui=menu] li::before,[data-ui=menu] li::after{position:absolute;display:block}[data-ui=menu] li[data-icon=checkmark].checked::after{content:\"✔\";color:var(--highlight-bg-color);top:3px;left:14px;font-size:16px}[data-ui=menu] li[data-target=darkModeColors],[data-ui=menu] li[data-icon=sba]{border-top:1px solid var(--border-color)}[data-ui=menu] li[data-icon=sba]{color:currentColor}[data-ui=menu] li[data-icon=sba]:hover{color:var(--link-hover-color);text-decoration:underline}[data-ui=menu] li svg{display:inline-block;width:20px;height:20px;position:absolute;left:7px;top:6px}[data-ui=menu] li svg .shape{fill:var(--text-color)}[data-ui=menu] li svg .content{fill:var(--highlight-bg-color)}.sba-color-selector{display:flex;justify-content:space-between;gap:10px}.sba-color-selector svg{width:120px;height:120px;display:block}[data-ui=darkModeColors] .hive{width:auto;padding:0;flex-grow:2;display:flex}[data-ui=darkModeColors] .hive-cell{position:static;margin:auto;border:1px solid var(--border-color);padding:20px;width:168px;height:100%;border-radius:6px}[data-ui=darkModeColors] .cell-letter{font-size:8px;font-weight:600}.sba-swatches{display:flex;flex-wrap:wrap;list-style:none;justify-content:space-around;padding:0;width:220px}.sba-swatches li{position:relative;overflow:hidden;margin-bottom:5px}.sba-swatches label{border:1px var(--border-color) solid;display:block;width:50px;height:50px;overflow:hidden;cursor:pointer}.sba-swatches input{position:absolute;left:-100px}.sba-swatches input:checked~label{border-color:var(--highlight-bg-color)}.sba-googlified .sb-anagram{cursor:pointer}.sba-googlified .sb-anagram:hover{text-decoration:underline;color:var(--link-hover-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) *{color:var(--text-color);border-color:var(--border-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) *::selection{background-color:var(--body-bg-color)}:is(#portal-game-toolbar,#js-mobile-toolbar) .pz-dropdown__arrow{border-top-color:var(--text-color);border-bottom-color:var(--text-color);border-right-color:rgba(0,0,0,0);border-left-color:rgba(0,0,0,0)}.pz-mobile .pz-toolbar-button__sba{color:var(--text-color)}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]){background-color:var(--body-bg-color) !important}:is(.pz-dropdown,.pz-mobile-dropdown) :is(button[class*=pz-dropdown__],a[class*=pz-dropdown__]):hover{background:var(--menu-hover-color)}[data-sba-theme=dark] #portal-game-toolbar i,[data-sba-theme=dark] #js-mobile-toolbar i{filter:invert(1);background-color:rgba(0,0,0,0)}[data-sba-theme=dark] .conversion-banner__icon{filter:invert(1)}[data-sba-theme=dark] :is(.sb-stats-bar-rank__word-count,.sb-stats-bar-rank__text){filter:contrast(99%);color:#999}[data-sba-theme] .sb-modal-wordlist-items li .check.checked{border:none;height:auto;transform:none}[data-sba-theme] .sb-modal-wordlist-items li .check.checked::after{position:relative;content:\"✔\";color:var(--highlight-bg-color);top:4px;font-size:16px}[data-sba-theme] .sb-modal-header .sb-modal-letters{position:relative;top:-5px}.pz-toolbar-button:hover,[data-ui=menu] li:hover{background:var(--menu-hover-color);color:var(--text-color)}.pz-toolbar-button::selection,[data-ui=menu] li::selection{background-color:rgba(0,0,0,0)}[data-sba-submenu=true] [data-ui=menu]{background:var(--menu-hover-color);color:var(--text-color)}[data-ui=grid] table{border-top:1px solid var(--border-color);margin-left:-20px;width:calc(100% + 40px)}[data-ui=grid] tbody tr:last-child td{background-color:var(--head-row-bg-color)}[data-ui=grid] tbody tr td{padding:5px 0 !important}[data-ui=grid] tbody tr td:last-of-type{background-color:var(--head-row-bg-color)}.sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.sba summary{list-style:none;padding:1px 15px 0 21px}.sba summary::marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li{position:relative}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li.sba-pangram{font-weight:700;border-bottom:2px var(--highlight-bg-color) solid}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks{position:absolute;right:0;bottom:3px}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li .sba-marks mark{display:none}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-s-active .sba-mark-s{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-p-active .sba-mark-p{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-d-active .sba-mark-d{display:inline-block}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items).sba-mark-c-active .sba-mark-c{display:inline-block}[data-sba-theme] mark{background:rgba(0,0,0,0);font-size:11px;pointer-events:none;text-transform:uppercase}[data-sba-theme] mark::after{content:\" \"}[data-sba-theme] mark:last-of-type::after{content:normal}[data-sba-theme] mark::selection{background-color:rgba(0,0,0,0)}[data-sba-theme] .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;font-size:13px;border-top:1px solid var(--border-color);padding:10px 10px 0 10px}.sb-modal-frame .sb-modal-content::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}.sba-container{display:none}.sba{margin:var(--sba-app-margin);width:var(--sba-app-width);padding:var(--sba-app-padding);box-sizing:border-box}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}[data-ui=menu] .pane{display:none}.pz-mobile [data-ui=menu]{display:flex;align-items:center;height:100%;padding:0 6px}[data-sba-submenu=true]{overflow-y:hidden}[data-sba-submenu=true] .sba{position:relative;left:-167px;top:-175px}[data-sba-submenu=true] .pz-mobile-dropdown.show .pz-dropdown__list{display:none}[data-sba-submenu=true] .pz-game-toolbar{position:relative;z-index:4}[data-sba-submenu=true] [data-ui=menu] .pane{display:block;position:absolute;right:-16px;top:45px}[data-sba-submenu=true] .sba{left:-167px;top:0px}[data-sba-submenu=true].pz-desktop .pane{right:-16px;top:55px}[data-sba-active=true]{--sba-app-width: 100px;--sba-app-padding: 0;--sba-app-margin: 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px}[data-sba-active=true] .sba-container{display:block;position:absolute;top:50%;transform:translate(0, -50%);right:var(--sba-game-offset);z-index:1}[data-sba-active=true] .sba{border-color:rgba(0,0,0,0)}[data-sba-active=true] [data-ui=header]{display:none}[data-sba-active=true][data-sba-submenu=true] .sba-container{top:0;height:0;z-index:4}[data-sba-active=true] .sb-expanded .sba-container{visibility:hidden;pointer-events:none}[data-sba-active=true] .sb-content-box{max-width:var(--sba-game-width);justify-content:space-between;position:relative}[data-sba-active=true] .sb-controls-box{max-width:calc(100vw - var(--sba-app-width))}@media(max-width: 370px){[data-sba-active=true] .sb-hive{width:70%}[data-sba-active=true].pz-spelling-bee-wordlist .hive-action:not(.hive-action__shuffle){font-size:.9em;margin:0 4px 8px;padding:23px 0}[data-sba-active=true] .hive-action:not(.hive-action__shuffle){width:71px;min-width:auto}}@media(max-width: 450px){[data-ui=grid] table{table-layout:auto}[data-ui=grid] table.sba-data-pane tbody th{width:28px !important}[data-ui=grid] table.sba-data-pane thead th:first-of-type{width:28px !important}[data-ui=grid] table.sba-data-pane :is(thead,tbody) tr :is(th,td){width:auto;font-size:90%}}[data-sba-active] .pz-game-toolbar .pz-row{padding:0}@media(min-width: 516px){[data-sba-active] .pz-game-toolbar .pz-row{padding:0 12px}[data-sba-active].pz-desktop .sba{left:-175px}[data-ui=score] .sba-data-pane tbody th{text-transform:none;width:31%}[data-ui=score] .sba-data-pane tbody td{width:23%}[data-ui=score] .sba-data-pane tbody tr:nth-child(1) th::after{content:\"ords\"}[data-ui=score] .sba-data-pane tbody tr:nth-child(2) th::after{content:\"oints\"}[data-ui=score] .sba-data-pane thead th{width:23%}[data-ui=score] .sba-data-pane thead th:first-of-type{width:31%}[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 5px}[data-sba-active=true] .sba{border-color:var(--border-color)}[data-sba-active=true] [data-ui=header]{display:block}}@media(min-width: 900px){[data-sba-submenu=true].pz-desktop [data-ui=menu] .pane{right:0;top:55px}[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 8px;--sba-app-margin: 66px 0 0 0}[data-sba-active=true] .sb-content-box{padding:0 var(--sba-game-offset)}[data-sba-active=true] .sb-controls-box{max-width:none}[data-sba-active=true] .sba-container{position:static;transform:none}[data-sba-active=true] .sb-expanded .sba-container{z-index:1}[data-sba-active=true][data-sba-submenu=true] .sba{top:-66px}[data-sba-active=true].pz-desktop .sba{left:-191px}}@media(min-width: 1298px){[data-sba-active=true][data-sba-submenu=true] .sba{left:-179px}}@media(min-width: 768px){[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-body{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-header{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;width:calc(100% - 112px);margin:-8px auto 15px}}\n";

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

    const svgIcons = {
        warning: iconWarning,
        coffee: iconCoffee
    };
    class Menu extends Plugin {
        getTarget() {
            return this.app.envIs('mobile') ? fn.$('#js-mobile-toolbar') : fn.$('#portal-game-toolbar > div:last-of-type');
        }
        add() {
            if (!this.app.envIs('mobile')) {
                return super.add();
            }
            const navContainer = fn.$('#js-global-nav');
            if (navContainer.classList.contains('show-mobile-toolbar')) {
                return super.add();
            }
            const observer = new MutationObserver(mutationList => {
                for(let mutation of mutationList){
                    if (mutation.type === 'attributes' &&
                        mutation.attributeName === 'class' &&
                        mutation.target.classList.contains('show-mobile-toolbar')) {
                        observer.disconnect();
                        return super.add();
                    }
                }
            });
            observer.observe(navContainer, {
                attributes: true
            });
        }
        getComponent(entry) {
            if (entry.dataset.component === this.app.key) {
                return this.app
            }
            if (this.app.plugins.has(entry.dataset.component)) {
                return this.app.plugins.get(entry.dataset.component);
            }
            return null;
        }
        resetSubmenu() {
            setTimeout(() => {
                this.app.domSet('submenu', false);
            }, 60);
        }
        constructor(app) {
            super(app, 'Menu', '');
            this.target = this.getTarget();
            if (this.app.envIs('mobile')) {
                this.addMethod = 'after';
            }
            const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];
            this.resetSubmenu();
            const pane = fn.ul({
                classNames: ['pane'],
                data: {
                    ui: 'submenu'
                },
                events: {
                    pointerup: evt => {
                        if(evt.target.nodeName === 'A'){
                            this.resetSubmenu();
                            evt.target.click();
                            return true;
                        }
                        const entry = evt.target.closest('li');
                        if (!entry || evt.button !== 0) {
                            this.resetSubmenu();
                            return true;
                        }
                        const component = this.getComponent(entry);
                        switch (entry.dataset.action) {
                            case 'boolean': {
                                let nextState = !component.getState();
                                component.toggle(nextState);
                                entry.classList.toggle('checked', nextState);
                                if (component === this.app) {
                                    this.app.toggle(nextState);
                                }
                                break;
                            }
                            case 'popup':
                                this.app.domSet('submenu', false);
                                component.display();
                                break;
                            default:
                                this.resetSubmenu();
                        }
                    }
                },
                content: fn.li({
                    classNames: this.app.getState() ? ['checked'] : [],
                    attributes: {
                        title: this.app.title
                    },
                    data: {
                        component: this.app.key,
                        icon: 'checkmark',
                        action: 'boolean'
                    },
                    content: `Show ${settings$1.get('title')}`
                })
            });
            this.ui = fn.div({
                events: {
                    pointerup: evt => {
                        if (evt.button !== 0) {
                            return true;
                        }
                        if (!evt.target.dataset.action) {
                            this.app.domSet('submenu', !this.app.domGet('submenu'));
                        }
                    }
                },
                content: [
                    settings$1.get('title'),
                    pane
                ],
                aria: {
                    role: 'presentation'
                },
                classNames
            });
            document.addEventListener('keyup', evt => {
                if (this.app.domGet('submenu') === true && /^(Ent|Esc|Key|Dig)/.test(evt.code)) {
                    this.app.domSet('submenu', false);
                }
            });
            fn.$('#pz-game-root').addEventListener('pointerdown', evt => {
                if (this.app.domGet('submenu') === true) {
                    this.app.domSet('submenu', false);
                }
            });
            app.on(prefix('pluginsReady'), evt => {
                evt.detail.forEach((plugin, key) => {
                    if (!plugin.canChangeState || plugin === this) {
                        return false;
                    }
                    const action = plugin.menuAction || 'boolean';
                    const icon = plugin.menuIcon || null;
                    pane.append(fn.li({
                        classNames: action === 'boolean' && plugin.getState() ? ['checked'] : [],
                        attributes: {
                            title: plugin.description
                        },
                        data: {
                            component: key,
                            icon: action === 'boolean' ? 'checkmark' : icon,
                            action
                        },
                        content: svgIcons[icon] ? [svgIcons[icon], plugin.title] : plugin.title
                    }));
                });
                pane.append(fn.li({
                    attributes: {
                        title: settings$1.get('support.text')
                    },
                    data: {
                        icon: prefix(),
                        component: prefix('web'),
                        action: 'link'
                    },
                    content: fn.a({
                        content: [
                            iconCoffee,
                            settings$1.get('support.text'),
                        ],
                        attributes: {
                            href: settings$1.get('support.url'),
                            target: prefix()
                        }
                    })
                }));
            });
            app.on(prefix('destroy'), () => this.ui.remove());
        }
    }

    class Grid extends TablePane {
        display() {
            this.popup
                .setContent('subtitle', this.description)
                .setContent('body', this.getPane())
                .toggle(true);
            return this;
        }
        run(evt) {
            super.run(evt);
            const rows = fn.$$('tr', this.pane);
            const rCnt = rows.length;
            rows.forEach((row, rInd) => {
                if (rCnt === rInd + 1) {
                    return false;
                }
                const cells = fn.$$('td', row);
                const cCnt = cells.length;
                cells.forEach((cell, cInd) => {
                    const cellArr = cell.textContent.trim().split('/');
                    if (cInd < cCnt - 1 && cellArr.length === 2 && cellArr[0] === cellArr[1]) {
                        cell.classList.add(prefix('completed', 'd'));
                    }
                });
            });
            return this;
        }
        getData() {
            const foundTerms = data.getList('foundTerms');
            const allTerms = data.getList('answers');
            const allLetters = Array.from(new Set(allTerms.map(entry => entry.charAt(0)))).concat(['∑']);
            const allDigits = Array.from(new Set(allTerms.map(term => term.length))).concat(['∑']);
            allDigits.sort((a, b) => a - b);
            allLetters.sort();
            const cellData = [[''].concat(allLetters)];
            let letterTpl = Object.fromEntries(allLetters.map(letter => [letter, {
                fnd: 0,
                all: 0
            }]));
            let rows = Object.fromEntries(allDigits.map(digit => [digit, JSON.parse(JSON.stringify(letterTpl))]));
            allTerms.forEach(term => {
                const letter = term.charAt(0);
                const digit = term.length;
                rows[digit][letter].all++;
                rows[digit]['∑'].all++;
                rows['∑'][letter].all++;
                rows['∑']['∑'].all++;
                if (foundTerms.includes(term)) {
                    rows[digit][letter].fnd++;
                    rows[digit]['∑'].fnd++;
                    rows['∑'][letter].fnd++;
                    rows['∑']['∑'].fnd++;
                }
            });
            for (let [digit, cols] of Object.entries(rows)) {
                const cellVals = [digit];
                Object.values(cols).forEach(colVals => {
                    cellVals.push(colVals.all > 0 ? `${colVals.fnd}/${colVals.all}` : '-');
                });
                cellData.push(cellVals);
            }
            return cellData;
        }
        constructor(app) {
            super(app, 'Grid', 'The number of words by length and by first letter.');
            this.popup = new Popup(this.app, this.key)
                .setContent('title', this.title);
            this.menuAction = 'popup';
            this.menuIcon = 'null';
        }
    }

    const getPlugins = () => {
        return {
            Header,
            Score,
            LetterCount,
            FirstLetter: FirstLetter$1,
            FirstTwoLetters: FirstLetter,
            Pangrams,
            ProgressBar,
            Grid,
            SpillTheBeans,
            DarkMode,
            ColorConfig,
            PangramHl,
            Googlify,
            Styles,
            Menu,
            YourProgress,
            Community,
            TodaysAnswers
        }
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
            let puzzleId = window.gameData.today.id.toString();
            let gameData;
            let lsKeysFiltered = Object.keys(localStorage).filter((key) => /^games-state-spelling_bee\/\d+$/.test(key));
            if (!lsKeysFiltered.length) {
                return [];
            }
            if (/nyt-auth-action=logout/.test(document.cookie)) {
                return [];
            }
            gameData = JSON.parse(localStorage.getItem(lsKeysFiltered.shift()) || "{}");
            if (!gameData.states) {
                return [];
            }
            gameData.states = gameData.states.filter((item) => item.puzzleId === puzzleId);
            if (!gameData.states.length) {
                return [];
            }
            return gameData.states.shift().data.answers || [];
        }
        envIs(env) {
            return document.body.classList.contains("pz-" + env);
        }
        focusGame(){
            if (!this.envIs("desktop")) {
                return false;
            }
            fn.$(".pz-moment__welcome.on-stage .pz-moment__button").addEventListener('pointerup', () => {
                window.scrollTo(0,0);
                const titlebarRect = fn.$(".pz-game-title-bar").getBoundingClientRect();
                const targetOffsetTop = titlebarRect.top + titlebarRect.height - fn.$(".pz-game-header").offsetHeight;
                window.scrollTo(0, targetOffsetTop);
            }, false);
            return true;
        }
        load() {
            fn.waitFor(".sb-wordlist-items-pag", this.gameWrapper).then((resultList) => {
                this.observer = this.buildObserver();
                data.init(this, this.getSyncData());
                this.modalWrapper = fn.$(".sb-modal-wrapper", this.gameWrapper);
                this.resultList = resultList;
                this.add();
                this.domSet("active", true);
                this.registerPlugins();
                this.trigger(prefix("refreshUi"));
                document.dispatchEvent(new Event(prefix("ready")));
                this.focusGame();
            });
        }
        getState() {
            return this.domGet("active");
        }
        toggle(state) {
            this.domSet("active", state);
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
                            this.trigger(prefix("newInput"), mutation.target.textContent.trim());
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
            const classNames = [settings$1.get("prefix")];
            return fn.div({
                data: {
                    id: this.key,
                    version: settings$1.get("version"),
                },
                classNames,
                events,
            });
        }
        registerPlugins() {
            this.plugins = new Map();
            Object.values(getPlugins()).forEach((plugin) => {
                const instance = new plugin(this);
                instance.add();
                this.plugins.set(instance.key, instance);
            });
            this.trigger(prefix("pluginsReady"), this.plugins);
            return this;
        }
        add() {
            this.container.append(this.ui);
            fn.$(".sb-content-box", this.gameWrapper).prepend(this.container);
        }
        constructor(gameWrapper) {
            super(settings$1.get("label"), {
                canChangeState: true,
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
            this.load();
        }
    }

    new App(fn.$('#js-hook-game-wrapper'));

})();
