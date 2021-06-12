(function () {
    'use strict';

    const fn = {
        $: (expr, container = null) => {
            return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
        },
        $$: (expr, container = null) => {
            return [].slice.call((container || document).querySelectorAll(expr));
        },
        toNode: content => {
            if (content instanceof Element) {
                return content;
            }
            if(typeof content === 'number') {
                content = content .toString();
            }
            if (typeof content === 'string'
            || content instanceof String
            ) {
                const doc = (new DOMParser()).parseFromString(content, 'text/html');
                content = doc.body.childNodes;
            }
            if (content instanceof NodeList
                || (Array.isArray(content)
                && content.some(node => node.nodeType === 1))
                ) {
                const fragment = document.createDocumentFragment();
                content.forEach(element => {
                    fragment.append(element);
                });
                return fragment;
            }
            console.error('Expected Element|NodeList|Array|String|HTMLCode, got', content);
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
        events = {},
        classNames = [],
        isSvg
    } = {}) {
        const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        if(tag === 'a' && attributes.href && !content) {
            content = (new URL(attributes.href)).hostname;
        }
        for (let [key, value] of Object.entries(attributes)) {
            if (isSvg) {
                el.setAttributeNS(null, key, value.toString());
            }
            else if(key === 'role' || key.startsWith('aria-')){
                el.setAttribute(key, value);
            }
            else if(value !== false) {
                el[key] = value.toString();
            }
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
        if(typeof content !== 'undefined') {
            el.append(fn.toNode(content));
        }
        return el;
    };
    const el = new Proxy(fn, {
        get(target, prop) {
            return function () {
                const args = Array.from(arguments);
                if (Object.prototype.hasOwnProperty.call(target, prop) && typeof target[prop] === 'function') {
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

    var label = "Spelling Bee Assistant";
    var title = "Assistant";
    var url = "https://spelling-bee-assistant.app/";
    var repo = "draber/draber.github.io.git";
    var targetUrl = "https://www.nytimes.com/puzzles/spelling-bee";
    var prefix$1 = "sba";

    var version = "3.2.1";

    const settings = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix$1,
        repo: repo,
        targetUrl: targetUrl,
        options: JSON.parse(localStorage.getItem(prefix$1 + '-settings') || '{}')
    };
    const saveOptions = () => {
        localStorage.setItem(settings.prefix + '-settings', JSON.stringify(settings.options));
    };
    if(settings.options.version && settings.options.version !== settings.version){
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
    const prefix = (term, mode = 'c') => {
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
        app.trigger(prefix('refreshUi'), { newData: true });
    };
    const initLists = foundTerms => {
        lists = {
            answers: sbData.answers,
            pangrams: sbData.pangrams,
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
        getCenterLetter
    };

    var css = "[data-sba-theme=light]{--text-color:#000;--site-text-color:rgba(0,0,0,.9);--link-color:#326891;--link-visited-color:#326891;--link-hover-color:#5f8ab1;--body-bg-color:#fff;--modal-bg-color:rgba(255,255,255,.85);--border-color:#dcdcdc;--area-bg-color:#e6e6e6;--invalid-color:#a2a2a2;--card-color:rgba(248,205,5,.1);--success-color:#248a17}[data-sba-theme=dark]{--text-color:#e7eae1;--site-text-color:rgba(255,255,255,.9);--link-color:#51a9f7;--link-visited-color:#8dc6f8;--link-hover-color:#8dc6f8;--body-bg-color:#111;--modal-bg-color:rgba(17,17,17,.85);--border-color:#333;--area-bg-color:#393939;--invalid-color:#666;--card-color:#393939;--success-color:#47c537}html{--highlight-color: rgb(248, 205, 5);--shadow-light-color: rgba(248, 205, 5, .35);--shadow-dark-color: rgba(248, 205, 5, .7)}.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items-pag>li.sba-pangram{border-bottom:2px var(--highlight-color) solid}.sb-wordlist-items-pag>li.sb-anagram a{color:var(--invalid-color)}.sb-modal-scrim{z-index:6}[data-sba-theme=dark]{background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-moment__loading{color:#000}[data-sba-theme=dark] .pz-game-wrapper{background:inherit !important;color:inherit}[data-sba-theme=dark] .pz-nav__hamburger-inner,[data-sba-theme=dark] .pz-nav__hamburger-inner::before,[data-sba-theme=dark] .pz-nav__hamburger-inner::after{background-color:var(--text-color)}[data-sba-theme=dark] .pz-nav{width:100%;background:var(--body-bg-color)}[data-sba-theme=dark] .pz-nav__logo{filter:invert(1)}[data-sba-theme=dark] .sb-modal-scrim{background:var(--modal-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-modal__title,[data-sba-theme=dark] .sb-modal-close{color:var(--text-color)}[data-sba-theme=dark] .sb-modal-frame,[data-sba-theme=dark] .pz-modal__button.white{background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-modal__button.white:hover{background:var(--area-bg-color)}[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}[data-sba-theme=dark] .sb-input-invalid{color:var(--invalid-color)}[data-sba-theme=dark] .sb-toggle-expand{box-shadow:none}[data-sba-theme=dark] .sb-progress-marker .sb-progress-value,[data-sba-theme=dark] .hive-cell.center .cell-fill{background:var(--highlight-color);fill:var(--highlight-color);color:var(--body-bg-color)}[data-sba-theme=dark] .sb-input-bright{color:var(--highlight-color)}[data-sba-theme=dark] .hive-cell.outer .cell-fill{fill:var(--area-bg-color)}[data-sba-theme=dark] .cell-fill{stroke:var(--body-bg-color)}[data-sba-theme=dark] .cell-letter{fill:var(--text-color)}[data-sba-theme=dark] .hive-cell.center .cell-letter{fill:var(--body-bg-color)}[data-sba-theme=dark] .pz-toolbar-button:hover{background:var(--area-bg-color);color:var(--text-color)}[data-sba-theme=dark] .hive-action:not(.hive-action__shuffle){background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .hive-action:not(.hive-action__shuffle):hover{background:var(--area-bg-color)}[data-sba-theme=dark] .hive-action__shuffle{filter:invert(100%)}[data-sba-theme=dark] *:not(.hive-action__shuffle):not(.sba-pangram):not(.sba-preeminent){border-color:var(--border-color) !important}[data-ui=setUp] li{position:relative;margin:0 0 5px 22px}[data-ui=setUp] label{cursor:pointer;overflow:hidden}[data-ui=setUp] label:before{content:\"\";border:2px solid var(--border-color);width:14px;height:14px;display:inline-block;border-radius:3px;position:absolute;left:-21px;top:4px}[data-ui=setUp] input{position:absolute;left:-40px;top:-12px;visibility:hidden;cursor:pointer}[data-ui=setUp] input:checked:after{content:\"✔\";color:var(--highlight-color);position:absolute;top:3px;left:16px;font-size:20px;visibility:visible}[data-ui=setUp] b{font-weight:bold}[data-ui=setUp] i{font-style:italic}[data-ui=setUp] i::before{content:\" - \"}.sbaContainer{width:100%;max-width:1080px;margin:0 auto;height:0;overflow-y:visible;position:relative;z-index:5}[data-sba-has-overlay=true] .sbaContainer{z-index:-1}[data-sba-has-overlay=true] .pz-game-wrapper{background:transparent !important}[data-sba-has-overlay=true] .sb-expanded{background:var(--body-bg-color)}.sba{position:absolute;left:100%;top:121px;z-index:3;width:160px;box-sizing:border-box;padding:0 8px 5px;background:var(--body-bg-color);border-width:1px;border-color:var(--border-color);border-radius:6px;border-style:solid}.sba.inactive{display:none}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba [data-ui=header]{display:flex;gap:8px}.sba [data-ui=header] .toolbar{display:flex;align-items:stretch;gap:1px}.sba [data-ui=header] .toolbar div{padding:10px 3px 2px 3px}.sba [data-ui=header] svg{width:11px;cursor:pointer;fill:currentColor}.sba .header{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px}.sba progress{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0 0 2px 0;height:6px;padding:0;border:1px var(--border-color) solid;background:transparent;display:block}.sba progress.inactive{display:none}.sba progress::-webkit-progress-bar{background-color:transparent}.sba progress::-webkit-progress-value{background-color:var(--highlight-color);height:4px}.sba progress::-moz-progress-bar{background-color:var(--highlight-color)}.sba details{font-size:90%;margin-bottom:1px}.sba details.inactive{display:none}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sba .pane{border:1px solid var(--border-color);border-top:none;width:100%;font-size:85%;margin-bottom:2px}.sba table{border-collapse:collapse;table-layout:fixed}.sba tr.sba-preeminent{font-weight:bold;border-bottom:2px solid var(--highlight-color) !important}.sba tr.sba-completed{color:var(--invalid-color);font-weight:normal}.sba tr.sba-hidden{display:none}.sba td{border:1px solid var(--border-color);border-top:none;white-space:nowrap;text-align:center;padding:3px 0;width:26px}.sba td:first-of-type{text-align:left;width:auto;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:3px 3px}.sba [data-ui=scoreSoFar] tbody tr:first-child td,.sba [data-ui=spoilers] tbody tr:first-child td,.sba [data-ui=startingWith…] tbody tr:first-child td{font-weight:bold;font-size:92%}.sba [data-ui=startingWith…] tbody tr td:first-child{text-align:center;text-transform:uppercase}.sba [data-ui=footer]{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-ui=footer]:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:8px 6px 0;text-align:center}.sba .spill{text-align:center;padding:14px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-ui=surrender] .pane{padding:10px 5px}.sba [data-ui=surrender] button{margin:0 auto;display:block;font-size:100%;white-space:nowrap;padding:12px 10px}.sba label{cursor:pointer;position:relative;line-height:19px;white-space:nowrap}.sba label input{position:relative;top:2px;margin:0 5px 0 0}.pz-desktop .sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.pz-desktop .sba summary{list-style:none;padding:1px 15px 0 21px}.pz-desktop .sba summary::marker{display:none}.pz-desktop .sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme].pz-spelling-bee-congrats [data-ui=setUp].left-aligned .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;font-size:13px;display:flex;flex-direction:row-reverse;justify-content:space-between;align-items:center;text-align:right;border-top:1px solid var(--border-color);padding-top:10px}[data-sba-theme].pz-spelling-bee-congrats [data-ui=setUp].left-aligned .sb-modal-content .sba-modal-footer button{padding:6px 10px;margin:0}[data-sba-theme].pz-spelling-bee-congrats .left-aligned .sb-modal-content .sb-modal-body::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}@media(max-width: 1444px){.sbaContainer{max-width:none}.sba{top:15px;left:12px}}@media(min-width: 992px){[data-sba-theme].pz-page [data-ui=setUp] h4{font-size:20px}}@media(min-width: 768px){[data-sba-theme].pz-page [data-ui=setUp].left-aligned .sb-modal-content .sb-modal-body{padding-right:56px}[data-sba-theme].pz-page [data-ui=setUp].left-aligned .sb-modal-content .sb-modal-header{padding-right:56px}[data-sba-theme].pz-page [data-ui=setUp].left-aligned .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;width:calc(100% - 112px);margin:-8px auto 15px}}@media(max-width: 767.98px){.sba{width:130px;top:158px;left:auto;right:12px;padding:0 5px 3px}.sba [data-ui=spillTheBeans] .spill-title{display:none}.pz-mobile [data-ui=setUp] b{display:block}.pz-mobile [data-ui=setUp] i{margin-bottom:5px}.pz-mobile [data-ui=setUp] i::before{content:normal}}";

    const icons = {
        options: {
            children: {
                path: 'M16 14c0-2.203-1.797-4-4-4s-4 1.797-4 4 1.797 4 4 4 4-1.797 4-4zm8-1.703v3.469c0 .234-.187.516-.438.562l-2.891.438a8.86 8.86 0 01-.609 1.422c.531.766 1.094 1.453 1.672 2.156.094.109.156.25.156.391s-.047.25-.141.359c-.375.5-2.484 2.797-3.016 2.797a.795.795 0 01-.406-.141l-2.156-1.687a9.449 9.449 0 01-1.422.594c-.109.953-.203 1.969-.453 2.906a.573.573 0 01-.562.438h-3.469c-.281 0-.531-.203-.562-.469l-.438-2.875a9.194 9.194 0 01-1.406-.578l-2.203 1.672c-.109.094-.25.141-.391.141s-.281-.063-.391-.172c-.828-.75-1.922-1.719-2.578-2.625a.607.607 0 01.016-.718c.531-.719 1.109-1.406 1.641-2.141a8.324 8.324 0 01-.641-1.547l-2.859-.422A.57.57 0 010 15.705v-3.469c0-.234.187-.516.422-.562l2.906-.438c.156-.5.359-.969.609-1.437a37.64 37.64 0 00-1.672-2.156c-.094-.109-.156-.234-.156-.375s.063-.25.141-.359c.375-.516 2.484-2.797 3.016-2.797.141 0 .281.063.406.156L7.828 5.94a9.449 9.449 0 011.422-.594c.109-.953.203-1.969.453-2.906a.573.573 0 01.562-.438h3.469c.281 0 .531.203.562.469l.438 2.875c.484.156.953.344 1.406.578l2.219-1.672c.094-.094.234-.141.375-.141s.281.063.391.156c.828.766 1.922 1.734 2.578 2.656a.534.534 0 01.109.344c0 .141-.047.25-.125.359-.531.719-1.109 1.406-1.641 2.141.266.5.484 1.016.641 1.531l2.859.438a.57.57 0 01.453.562z'
            },
            width: 24,
            height: 28
        },
        darkMode: {
            children: {
                path: 'M12.018 1.982A12.018 12.018 0 000 14a12.018 12.018 0 0012.018 12.018A12.018 12.018 0 0024.036 14 12.018 12.018 0 0012.018 1.982zm0 3.293A8.725 8.725 0 0120.743 14a8.725 8.725 0 01-8.725 8.725z'
            },
            width: 24,
            height: 28
        }
    };
    const getIcon = key => {
        if (!icons[key]) {
            console.error(`Icon ${key} doesn't exist`);
            return false;
        }
        const icon = icons[key];
        const svg = el.svg({
            attributes: {
                ...{
                    viewBox: `0 0 ${icon.width} ${icon.height}`
                }
            },
            isSvg: true
        });
        for (const [type, d] of Object.entries(icon.children)) {
            svg.append(el[type]({
                attributes: {
                    d
                },
                isSvg: true
            }));
        }
        return svg;
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
        enableTool(iconKey, textToActivate, textToDeactivate) {
            this.tool = el.div({
                events: {
                    click: () => {
                        this.toggle(!this.getState());
                        this.tool.title = this.getState() ? textToDeactivate : textToActivate;
                    }
                },
                attributes: {
                    title: this.getState() ? textToDeactivate : textToActivate
                },
                data: {
                    tool: this.key
                },
                content: getIcon(iconKey)
            });
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
        attach(method = 'append') {
            if (!this.hasUi()) {
                return this;
            }
            this.ui.dataset.ui = this.key;
            (this.target || this.app.ui)[method](this.ui);
            return this;
        }
        add(method = 'append') {
            return this.attach(method);
        }
        run(evt) {
            return this;
        }
        constructor(app, title, description, {
            key,
            canChangeState,
            defaultState,
            runEvt
        } = {}) {
            super(title, {
                key,
                canChangeState,
                defaultState
            });
            this.target;
            this.description = description || '';
            this.app = app;
            if (runEvt) {
                this.app.on(runEvt, evt => {
                    this.run(evt);
                });
            }
        }
    }

    class Styles extends Plugin {
        constructor(app) {
            super(app, 'Styles', '');
            this.target = el.$('head');
            this.ui = el.style({
                content: css
            });
            app.on(prefix('destroy'), () => this.ui.remove());
            this.add();
        }
    }

    class Launcher extends Plugin {
        getTarget() {
            let target;
            if (this.app.envIs('mobile')) {
                target = el.$('#js-mobile-toolbar');
            } else {
                target = el.div({
                    content: el.$$('#portal-game-toolbar > span')
                });
                el.$('#portal-game-toolbar').append(target);
            }
            return target;
        }
        constructor(app) {
            super(app, 'Launcher', '');
            this.target = this.getTarget();
            const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];
            this.ui = el.span({
                content: settings$1.get('title'),
                events: {
                    click: () => {
                        const nextState = !this.app.getState();
                        this.app.toggle(nextState);
                        this.app.gameWrapper.dataset.sbaActive = nextState.toString();
                    }
                },
                attributes: {
                    role: 'presentation'
                },
                classNames
            });
            app.on(prefix('destroy'), () => this.ui.remove());
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
            this.enableTool('darkMode', 'Dark mode on', 'Dark mode off');
            this.toggle(this.getState());
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), '', {
                key: 'header'
            });
            this.ui = el.div();
            app.dragHandle = el.div({
                content: this.title,
                classNames: ['header']
            });
            this.ui.append(app.dragHandle);
            app.on(prefix('toolsReady'), evt => {
                const toolbar = el.div({
                    classNames: ['toolbar']
                });
                evt.detail.forEach(tool => {
                    toolbar.append(tool);
                });
                this.ui.append(toolbar);
                return this;
            });
        }
    }

    class Popup extends Plugin {
        getTarget() {
            const dataUi = prefix('popup-container', 'd');
            let container = el.$(`[data-ui="${dataUi}"]`);
            if (!container) {
                container = el.template({
                    data: {
                        ui: dataUi
                    }
                });
                el.$('body').append(container);
            }
            return container;
        }
        create() {
            const frame = el.div({
                classNames: ['sb-modal-frame', 'left-aligned'],
                attributes: {
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
                    el.div({
                        attributes: {
                            role: 'button'
                        },
                        classNames: ['sb-modal-close'],
                        content: '×',
                        events: {
                            click: () => {
                                this.toggle(false);
                            }
                        }
                    }),
                    el.div({
                        classNames: ['sb-modal-content'],
                        content: [
                            el.div({
                                classNames: ['sb-modal-header'],
                                content: [this.parts.title, this.parts.subtitle]
                            }),
                            this.parts.body,
                            this.parts.footer
                        ]
                    })
                ]
            });
            return frame;
        }
        setContent(part, content) {
            if (!this.parts[part]) {
                return !!console.error(`Unknown target ${part}`);
            }
            this.parts[part] = el.empty(this.parts[part]);
            this.parts[part].append(el.toNode(content));
            return true;
        }
        toggle(state) {
            const closer = el.$('.sb-modal-close', this.modalWrapper);
            if (!this.getState() && closer) {
                closer.click();
            }
            if (state) {
                this.modalWrapper.append(this.ui);
                this.modalSystem.classList.add('sb-modal-open');
            } else {
                this.getTarget().append(this.ui);
                this.modalSystem.classList.remove('sb-modal-open');
            }
            super.toggle(state);
            this.app.trigger(prefix('popup'), {
                plugin: this
            });
            return this;
        }
        constructor(app, title, description, {
            key
        } = {}) {
            super(app, title, description, {
                key,
                canChangeState: true,
                defaultState: false
            });
            this.modalSystem = el.$('.sb-modal-system');
            this.modalWrapper = el.$('.sb-modal-wrapper', this.modalSystem);
            this.parts = {
                title: el.h3({
                    classNames: ['sb-modal-title'],
                    content: title
                }),
                subtitle: el.p({
                    classNames: ['sb-modal-message'],
                    content: description
                }),
                body: el.div({
                    classNames: ['sb-modal-body']
                }),
                footer: el.div({
                    classNames: ['sb-modal-message', 'sba-modal-footer'],
                    content: [
                        el.a({
                            content: settings$1.get('label') + ' v' + settings$1.get('version'),
                            attributes: {
                                href: settings$1.get('url'),
                                target: '_blank'
                            }
                        })
                    ]
                })
            };
            if (!this.app.popups) {
                this.app.popups = new Map();
            }
            if (!this.app.popups.has(key)) {
                this.app.popups.set(key, this.create());
            }
            this.target = this.getTarget();
            this.ui = this.app.popups.get(key);
        }
    }

    class SetUp extends Popup {
    	constructor(app) {
    		super(app, settings$1.get('label'), 'Configure the assistant the way you want it.', {
    			canChangeState: true,
    			defaultState: false,
    			key: 'setUp'
    		});
    		const pane = el.ul({
    			classNames: ['pane'],
    			events: {
    				click: evt => {
    					if (evt.target.tagName === 'INPUT') {
    						app.plugins.get(evt.target.name).toggle(evt.target.checked);
    					}
    				},
    				toggle: evt => {
    					if (!evt.target.open) {
    						this.toggle(false);
    					}
    				}
    			}
    		});
            app.on(prefix('popup'), evt => {
    			if(evt.detail.plugin === this && this.getState()){
    				const options = settings$1.get('options');
    				el.$$('input', pane).forEach(input => {
    					input.checked = !!options[input.name];
    				});
    			}
    		});
    		app.on(prefix('pluginsReady'), evt => {
    			const defaults = new Map();
    			evt.detail.forEach((plugin, key) => {
    				if (!plugin.canChangeState || plugin === this) {
    					return false;
    				}
    				const input = el.input({
    					attributes: {
    						type: 'checkbox',
    						name: key,
    						checked: !!plugin.getState()
    					}
    				});
    				pane.append(el.li({
    					content: el.label({
    						content: [
    							input,
    							el.b({
    								content: plugin.title
    							}),
    							el.i({
    								content: plugin.description
    							})
    						]
    					})
    				}));
    				defaults.set(key, {
    					input,
    					default: !!plugin.defaultState
    				});
    			});
    			this.setContent('body', pane);
    			this.parts.footer.append(el.div({
    				classNames: [prefix('factory-reset', 'd')],
    				content: el.button({
    					classNames: ['hive-action'],
    					content: 'Reset to defaults',
    					attributes: {
    						type: 'text'
    					},
    					events: {
    						'click': () => {
    							defaults.forEach(value => {
    								if (value.input.checked !== value.default) {
    									value.input.click();
    								}
    							});
    						}
    					}
    				})
    			}));
    		});
    		this.setState(false);
    		this.enableTool('options', 'Show set-up', 'Hide set-up');
    	}
    }

    class ProgressBar extends Plugin {
        run(evt) {
    		if(!evt.detail.newData){
    			return this;
    		}
            let progress = data.getPoints('foundTerms') * 100 / data.getPoints('answers');
            progress = Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100);
            this.ui.value = progress;
            this.ui.textContent = el.toNode(progress + '%');
            this.ui.title = `Progress: ${progress}%`;
            return this;
        }
        constructor(app) {
            super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
                canChangeState: true,
                runEvt: prefix('refreshUi')
            });
            this.ui = el.progress({
                attributes: {
                    max: 100
                }
            });
        }
    }

    class DisclosureBox extends Plugin {
        add(method = 'append') {
            this.ui = el.details({
                attributes: {
                    open: this.open
                },
                content: [
                    el.summary({
                        content: this.title
                    }),
                    this.pane
                ]
            });
    		super.add(method);
        }
    	constructor(app, title, description, {
            canChangeState,
            defaultState = true,
            open = false,
            runEvt
        } = {})  {
    		super(app, title, description, {
    			canChangeState,
                defaultState,
                runEvt
    		});
            this.title = title;
            this.open = open;
    	}
    }

    class TablePane extends DisclosureBox {
    	run(evt) {
    		if(!evt.detail.newData){
    			return this;
    		}
    		this.pane = el.empty(this.pane);
    		const tbody = el.tbody();
    		this.getData().forEach((rowData, i) => {
    			const classNames = [];
    			for (const [marker, fn] of Object.entries(this.cssMarkers)) {
    				if(fn(rowData, i)) {
    					classNames.push(prefix(marker, 'd'));
    				}
    			}
    			tbody.append(el.tr({
    				classNames,
    				content: rowData.map(cellData => el.td({
    					content: cellData
    				}))
    			}));
    		});
    		this.pane.append(tbody);
    		return this;
    	}
    	constructor(app, title, description, {
            canChangeState,
            defaultState = true,
            open = false,
    		runEvt = prefix('refreshUi')
        } = {}) {
    		super(app, title, description, {
    			canChangeState,
    			defaultState,
    			open,
    			runEvt
    		});
    		this.cssMarkers = {};
    		this.pane = el.table({
    			classNames: ['pane']
    		});
    	}
    }

    class ScoreSoFar extends TablePane {
        getData() {
            const keys = ['foundTerms', 'remainders', 'answers'];
            return [
                ['', '✓', '?', '∑'],
                ['Words'].concat(keys.map(key => data.getCount(key))),
                ['Points'].concat(keys.map(key => data.getPoints(key)))
            ];
        }
        constructor(app) {
            super(app, 'Score so far', 'The number of words and points and how many have been found', {
                canChangeState: true,
                open: true
            });
        }
    }

    class SpillTheBeans extends DisclosureBox {
        run(evt) {
            let emoji = '🙂';
            if (!evt.detail) {
                emoji = '😐';
            }
            else if (!data.getList('remainders').filter(term => term.startsWith(evt.detail)).length) {
                emoji = '🙁';
            }
            this.reaction.textContent = emoji;
        }
        constructor(app) {
            super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
                canChangeState: true,
                runEvt: prefix('newInput')
            });
            this.reaction = el.div({
                content: '😐',
                classNames: ['spill']
            });
            this.pane = el.div({
                classNames: ['pane'],
                content: [
                    el.div({
                        content: 'Watch my reaction!',
                        classNames: ['spill-title']
                    }),
                    this.reaction
                ]
            });
        }
    }

    class Spoilers extends TablePane {
    	getData() {
    		const counts = {};
    		const pangramCount = data.getCount('pangrams');
    		const foundPangramCount = data.getCount('foundPangrams');
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
    				count + ' ' + (count > 1 ? 'letters' : 'letter'),
    				counts[count].found,
    				counts[count].missing,
    				counts[count].total
    			]);
    		});
    		cellData.push([
    			'Pangrams',
    			foundPangramCount,
    			pangramCount - foundPangramCount,
    			pangramCount
    		]);
    		return cellData;
    	}
    	constructor(app) {
    		super(app, 'Spoilers', 'The number of words by length, also the number of pangrams', {
    			canChangeState: true
    		});
    		this.cssMarkers = {
    			completed: (rowData, i) => i > 0 && rowData[2] === 0,
    			preeminent: (rowData, i) => i > 0 && rowData[0] === 'Pangrams',
    		};
    	}
    }

    class StartingWith extends TablePane {
    	getData() {
    		const letters = {};
    		const answers = data.getList('answers').sort((a, b) => {
    			if (a.startsWith(this.centerLetter)) {
    				return -1;
    			}
    			if (b.startsWith(this.centerLetter)) {
    				return 1;
    			}
    			return a < b ? -1 : 1;
    		});
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
    		super(app, 'Starting with…', 'The number of words by first letter', {
    			canChangeState: true
    		});
    		this.cssMarkers = {
    			completed: (rowData, i) => i > 0 && rowData[2] === 0,
    			preeminent: (rowData, i) => i > 0 && rowData[0] === data.getCenterLetter()
    		};
    	}
    }

    class StepsToSuccess extends TablePane {
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
                return [entry[0], Math.round(entry[1] / 100 * maxPoints)];
            })
        }
        getCurrentTier() {
            return this.getData().filter(entry => entry[1] <= data.getPoints('foundTerms')).pop()[1];
        }
        constructor(app) {
            super(app, 'Steps to success', 'The number of points required for each level', {
                canChangeState: true
            });
            this.cssMarkers = {
                completed: rowData => rowData[1] < data.getPoints('foundTerms') && rowData[1] !== this.getCurrentTier(),
                preeminent: rowData => rowData[1] === this.getCurrentTier()
            };
        }
    }

    class Surrender extends DisclosureBox {
    	run(evt) {
    		const args = this.app.getObserverArgs();
    		this.app.observer.disconnect();
    		if (this.isResolved) {
    			el.$$('.' + this.marker, this.app.resultList).forEach(termContainer => {
    				termContainer.parentElement.remove();
    			});
    		} else if (evt.type === 'pointerup') {
    			data.getList('remainders').forEach(term => this.app.resultList.append(this.buildEntry(term)));
    		}
    		this.isResolved = !this.isResolved;
    		this.app.observer.observe(args.target, args.options);
    		this.app.trigger(prefix('refreshUi', {
    			newData: false
    		}));
    		return this;
    	}
    	buildEntry(term) {
    		const classNames = ['sb-anagram', this.marker];
    		return el.li({
    			content: el.span({
    				content: term,
    				classNames
    			})
    		});
    	}
    	constructor(app) {
    		super(app, 'Surrender', 'Reveals the solution of the game', {
    			canChangeState: true,
    			runEvt: prefix('newInput')
    		});
    		this.marker = prefix('resolved', 'd');
    		this.isResolved = false;
    		this.pane = el.div({
    			classNames: ['pane'],
    			content: el.button({
    				tag: 'button',
    				classNames: ['hive-action'],
    				content: 'Display answers',
    				attributes: {
    					type: 'button'
    				},
    				events: {
    					pointerup: evt => this.run(evt)
    				}
    			})
    		});
    	}
    }

    class HighlightPangrams extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
        run(evt) {
            const args = this.app.getObserverArgs();
            this.app.observer.disconnect();
            const pangrams = data.getList('pangrams');
            el.$$('li', this.app.resultList).forEach(node => {
                const term = node.textContent;
                if (pangrams.includes(term)) {
                    node.classList.toggle(prefix('pangram', 'd'), this.getState());
                }
            });
            this.app.observer.observe(args.target, args.options);
            return this;
        }
        constructor(app) {
            super(app, 'Highlight pangrams', 'Highlights pangrams in the result list', {
                canChangeState: true
            });
            this.observerBlocker = 'refreshUi';
            this.run();
        }
    }

    class Googlify extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
        run() {
            const args = this.app.getObserverArgs();
            this.app.observer.disconnect();
            const fn = this.getState() ? this.link : this.unlink;
            el.$$('li', this.app.resultList).forEach(node => {
                fn(node);
            });
            this.app.observer.observe(args.target, args.options);
            return this;
        }
        link(node){
            if (el.$('a', node)) {
                return false;
            }
            node.append(el.a({
                content: node.firstChild,
                attributes: {
                    href: `https://www.google.com/search?q=${encodeURI(node.textContent)}`,
                    target: 'google'
                }
            }));
        }
        unlink(node) {
            const link = el.$('a', node);
            if (!link) {
                return false;
            }
            const original = link.firstChild.cloneNode(true);
            node = el.empty(node);
            node.append(original);
        }
        constructor(app) {
            super(app, 'Googlify', 'Link all result terms to Google', {
                canChangeState: true,
    			runEvt: prefix('refreshUi')
            });
            this.run();
        }
    }

    class Footer extends Plugin {
        constructor(app) {
            super(app, `${settings$1.get('label')}`, '', {
                key: 'footer'
            });
            this.ui = el.a({
                content: this.title,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
        }
    }

    class Positioning extends Plugin {
        add() {
            const stored = this.getState();
            this.position = stored && Object.prototype.toString.call(stored) === '[object Object]' ? stored : this.getPosition();
            this.reposition();
            this.enableDrag();
            return super.add();
        }
        getOffset(offset) {
            return !isNaN(offset) ? {
                top: offset,
                right: offset,
                bottom: offset,
                left: offset
            } : {
                ...{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                ...offset
            }
        }
        getRectangles() {
            return {
                canvas: this.app.dragArea.getBoundingClientRect(),
                appContainer: this.app.ui.parentNode.getBoundingClientRect(),
                app: this.app.ui.getBoundingClientRect()
            }
        }
        getBoundaries() {
            return {
                top: {
                    min: this.offset.top,
                    max: this.rectangles.canvas.height - this.rectangles.app.height - this.offset.bottom
                },
                left: {
                    min: this.offset.left - this.rectangles.appContainer.left,
                    max: this.rectangles.canvas.width - this.rectangles.appContainer.left - this.rectangles.app.width - this.offset.right
                }
            }
        }
        validatePosition(position) {
            if (position) {
                this.position = position;
            }
            const boundaries = this.getBoundaries();
            this.position.left = Math.min(boundaries.left.max, Math.max(boundaries.left.min, this.position.left));
            this.position.top = Math.min(boundaries.top.max, Math.max(boundaries.top.min, this.position.top));
            return this.position;
        }
        getMouse(evt) {
            return {
                left: evt.screenX,
                top: evt.screenY
            }
        }
        getPosition(evt) {
            let coords;
            if (evt) {
                const mouse = this.getMouse(evt);
                coords = {
                    left: this.position.left + mouse.left - this.mouse.left,
                    top: this.position.top += mouse.top - this.mouse.top
                };
            } else {
                const style = getComputedStyle(this.app.ui);
                let left = parseInt(style.left);
                if (style.left.endsWith('%')) {
                    left = left * parseInt(getComputedStyle(el.$('.sbaContainer')).width) / 100;
                }
                coords = {
                    top: parseInt(style.top),
                    left
                };
            }
            return this.validatePosition(coords);
        }
        reposition() {
            this.validatePosition();
            Object.assign(this.app.ui.style, {
                left: this.position.left + 'px',
                top: this.position.top + 'px'
            });
            this.toggle(this.getState() ? this.position : false);
            return this;
        }
        enableDrag() {
            this.app.dragHandle.style.cursor = 'move';
            this.app.on('pointerdown', evt => {
                    this.isLastTarget = evt.target.isSameNode(this.app.dragHandle);
                }).on('pointerup', () => {
                    this.isLastTarget = false;
                }).on('dragend', evt => {
                    this.position = this.getPosition(evt);
                    this.reposition();
                    evt.target.style.opacity = '1';
                }).on('dragstart', evt => {
                    if (!this.isLastTarget) {
                        evt.preventDefault();
                        return false;
                    }
                    evt.target.style.opacity = '.2';
                    this.position = this.getPosition();
                    this.mouse = this.getMouse(evt);
                })
                .on('dragover', evt => evt.preventDefault());
            this.app.dragArea.addEventListener('dragover', evt => evt.preventDefault());
            return this;
        }
        toggle(state) {
            return super.toggle(state ? this.position : state);
        }
        constructor(app) {
            super(app, 'Memorize position', 'Places the assistant where it had been moved to last time', {
                key: 'positioning',
                canChangeState: true,
                defaultState: false
            });
            this.mouse;
            this.offset = this.getOffset(this.app.dragOffset || 0);
            this.isLastTarget = false;
            this.rectangles = this.getRectangles();
            ['orientationchange', 'resize'].forEach(handler => {
                window.addEventListener(handler, () => {
                    this.rectangles = this.getRectangles();
                    this.reposition();
                });
            });
        }
    }

    const plugins = {
         Styles,
         Launcher,
         DarkMode,
         Header,
         SetUp,
         ProgressBar,
         ScoreSoFar,
         Spoilers,
         StartingWith,
         SpillTheBeans,
         StepsToSuccess,
         Surrender,
         HighlightPangrams,
         Googlify,
         Footer,
         Positioning
    };
    const getPlugins = app => {
         if(!app.envIs('desktop')){
              delete plugins.Positioning;
         }
         return plugins
    };

    class App extends Widget {
        getObserverArgs() {
            return {
                target: this.gameWrapper,
                options: {
                    childList: true,
                    subtree: true,
                    attributes: true
                }
            }
        }
        gameIsUnlocked() {
            const splash = el.$('#js-hook-pz-moment__welcome', this.gameWrapper);
            const contentBox = el.$('.sb-content-box', this.gameWrapper);
            return splash && contentBox && !contentBox.classList.contains('sb-game-locked');
        }
        getSyncData() {
            let sync = localStorage.getItem('sb-today');
            if (!sync) {
                return false;
            }
            sync = JSON.parse(sync);
            if (!sync.id || sync.id !== data.getId()) {
                return false;
            }
            return sync.words || [];
        }
        envIs(env) {
            return document.body.classList.contains('pz-' + env);
        }
        async getResults() {
            let tries = 50;
            return await new Promise(resolve => {
                const interval = setInterval(() => {
                    const syncResults = this.getSyncData();
                    if (syncResults || !tries) {
                        resolve(syncResults || []);
                        clearInterval(interval);
                    }
                    tries--;
                }, 300);
            });
        }
        async waitForUnlock() {
            let tries = 200;
            return await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (!tries || this.gameIsUnlocked()) {
                        resolve(true);
                        clearInterval(interval);
                    }
                    tries--;
                }, 300);
            });
        }
        buildObserver() {
            const observer = new MutationObserver(mutationList => {
                mutationList.forEach(mutation => {
                    if (!(mutation.target instanceof HTMLElement)) {
                        return false;
                    }
                    switch (true) {
                        case mutation.type === 'attributes' &&
                        mutation.target.classList.contains('sb-content-box'):
                            document.body.dataset[prefix('hasOverlay')] = mutation.target.classList.contains('sb-expanded');
                            break;
                        case mutation.type === 'childList' &&
                        mutation.target.isSameNode(this.modalWrapper):
                            document.body.dataset[prefix('hasOverlay')] = !!mutation.target.hasChildNodes();
                            break;
                        case mutation.type === 'childList' &&
                        mutation.target.classList.contains('sb-hive-input-content'):
                            this.trigger(prefix('newInput'), mutation.target.textContent.trim());
                            break;
                        case mutation.type === 'childList' &&
                        mutation.target.isSameNode(this.resultList) &&
                        !!mutation.addedNodes.length &&
                        !!mutation.addedNodes[0].textContent.trim() &&
                        mutation.addedNodes[0] instanceof HTMLElement:
                            this.trigger(prefix('newWord'), mutation.addedNodes[0].textContent.trim());
                            break;
                    }
                });
            });
            const args = this.getObserverArgs();
            observer.observe(args.target, args.options);
            return observer;
        }
        setDragProps() {
            this.dragHandle = this.ui;
            this.dragArea = this.gameWrapper;
            this.dragOffset = {
                top: 69,
                right: 12,
                bottom: 12,
                left: 12
            };
        }
        buildUi() {
            const events = {};
            events[prefix('destroy')] = () => {
                this.observer.disconnect();
                this.container.remove();
                delete document.body.dataset[prefix('theme')];
            };
            const classNames = [settings$1.get('prefix')];
            if (this.getState() === false) {
                classNames.push('inactive');
            }
            return el.div({
                attributes: {
                    draggable: this.envIs('desktop')
                },
                data: {
                    id: this.key,
                    version: settings$1.get('version')
                },
                classNames,
                events
            });
        }
        registerPlugins() {
            this.plugins = new Map();
            Object.values(getPlugins(this)).forEach(plugin => {
                const instance = new plugin(this);
                instance.add();
                this.plugins.set(instance.key, instance);
            });
            this.trigger(prefix('pluginsReady'), this.plugins);
            return this.registerTools();
        }
        registerTools() {
            this.toolButtons = new Map();
            this.plugins.forEach(plugin => {
                if (plugin.tool) {
                    this.toolButtons.set(plugin.key, plugin.tool);
                }
            });
            return this.trigger(prefix('toolsReady'), this.toolButtons);
        }
        add() {
            this.container.append(this.ui);
            if (this.envIs('mobile')) {
                el.$('.sb-controls-box', this.gameWrapper).append(this.container);
            } else {
                this.gameWrapper.before(this.container);
            }
        }
        constructor(gameWrapper) {
            super(settings$1.get('label'), {
                canChangeState: true,
                key: prefix('app'),
            });
            const oldInstance = el.$(`[data-id="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix('destroy')));
            }
            this.gameWrapper = gameWrapper;
            Promise.all([this.getResults(), this.waitForUnlock()])
                .then(values => {
                    this.ui = this.buildUi();
                    this.setDragProps();
                    this.observer = this.buildObserver();
                    this.container = el.div({
                        classNames: [prefix('container')]
                    });
                    this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
                    this.resultList = el.$('.sb-wordlist-items-pag', this.gameWrapper);
                    data.init(this, values[0]);
                    this.add();
                    this.gameWrapper.dataset.sbaActive = this.getState();
                    this.registerPlugins();
                    this.trigger(prefix('refreshUi'), {
                        newData: true
                    });
                });
        }
    }

    new App(el.$('#js-hook-game-wrapper'));

}());
