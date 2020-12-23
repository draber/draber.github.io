(function () {
    'use strict';

    const fn = {
        $: (expr, container = null) => {
            return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
        },
        $$: (expr, container = null) => {
            return [].slice.call((container || document).querySelectorAll(expr));
        }
    };
    const create = function ({
        tag,
        text = '',
        attributes = {},
        style = {},
        data = {},
        events = {},
        classNames = [],
        svg
    } = {}) {
        const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        el.textContent = text;
        for (const [key, value] of Object.entries(attributes)) {
            if (svg) {
                el.setAttributeNS(null, key, value);
            } else {
                el[key] = value;
            }
        }
        for (const [key, value] of Object.entries(data)) {
            el.dataset[key] = value;
        }
        for (const [event, fn] of Object.entries(events)) {
            el.addEventListener(event, fn, false);
        }
        Object.assign(el.style, style);
        if (classNames.length) {
            el.classList.add(...classNames);
        }
        return el;
    };
    const el = new Proxy(fn, {
        get(target, prop) {
            return function () {
                const args = Array.prototype.slice.call(arguments);
                if (target.hasOwnProperty(prop) && typeof target[prop] === 'function') {
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

    var version = "2.0.0";

    var label = "Spelling Bee Assistant";
    var title = "Assistant";
    var url = "https://spelling-bee-assistant.app/";
    var repo = "draber/draber.github.io.git";
    var targetUrl = "https://www.nytimes.com/puzzles/spelling-bee";
    var prefix = "sba";

    const settings = {
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        targetUrl: targetUrl,
        version: version,
        options: JSON.parse(localStorage.getItem(prefix + '-settings') || '{}')
    };
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
            if (!Object.prototype.toString.call(current) === '[object Object]') {
                console.error(`${part} is not of the type Object`);
                return false;
            }
            current = current[part];
        }
        current[last] = value;
        localStorage.setItem(prefix + '-settings', JSON.stringify(settings.options));
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
    const prefix$1 = (term, mode = 'c') => {
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
    const initLists = () => {
        return {
            answers: window.gameData.today.answers,
            pangrams: window.gameData.today.pangrams,
            foundTerms: [],
            foundPangrams: [],
            remainders: []
        }
    };
    const getList = type => {
        return lists[type];
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
    const updateLists = (app, resultList) => {
        lists.foundTerms = [];
        lists.foundPangrams = [];
        el.$$('li', resultList).forEach(node => {
            if(el.$('a', node)){
                return false;
            }
            const term = node.textContent;
            lists.foundTerms.push(term);
            if (lists.pangrams.includes(term)) {
                lists.foundPangrams.push(term);
                node.classList.add('sb-pangram');
            }
        });
        lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
        app.trigger(new Event(prefix$1('wordsUpdated')));
    };
    const init = (app, resultList) => {
        lists = initLists();
        updateLists(app, resultList);
        app.on(prefix$1('newWord'), () => updateLists(app, resultList));
    };
    var data = {
        init,
        getList,
        getCount,
        getPoints
    };

    const icons = {
        options: {
            children: {
                path: 'M16 14c0-2.203-1.797-4-4-4s-4 1.797-4 4 1.797 4 4 4 4-1.797 4-4zm8-1.703v3.469c0 .234-.187.516-.438.562l-2.891.438a8.86 8.86 0 01-.609 1.422c.531.766 1.094 1.453 1.672 2.156.094.109.156.25.156.391s-.047.25-.141.359c-.375.5-2.484 2.797-3.016 2.797a.795.795 0 01-.406-.141l-2.156-1.687a9.449 9.449 0 01-1.422.594c-.109.953-.203 1.969-.453 2.906a.573.573 0 01-.562.438h-3.469c-.281 0-.531-.203-.562-.469l-.438-2.875a9.194 9.194 0 01-1.406-.578l-2.203 1.672c-.109.094-.25.141-.391.141s-.281-.063-.391-.172c-.828-.75-1.922-1.719-2.578-2.625a.607.607 0 01.016-.718c.531-.719 1.109-1.406 1.641-2.141a8.324 8.324 0 01-.641-1.547l-2.859-.422A.57.57 0 010 15.705v-3.469c0-.234.187-.516.422-.562l2.906-.438c.156-.5.359-.969.609-1.437a37.64 37.64 0 00-1.672-2.156c-.094-.109-.156-.234-.156-.375s.063-.25.141-.359c.375-.516 2.484-2.797 3.016-2.797.141 0 .281.063.406.156L7.828 5.94a9.449 9.449 0 011.422-.594c.109-.953.203-1.969.453-2.906a.573.573 0 01.562-.438h3.469c.281 0 .531.203.562.469l.438 2.875c.484.156.953.344 1.406.578l2.219-1.672c.094-.094.234-.141.375-.141s.281.063.391.156c.828.766 1.922 1.734 2.578 2.656a.534.534 0 01.109.344c0 .141-.047.25-.125.359-.531.719-1.109 1.406-1.641 2.141.266.5.484 1.016.641 1.531l2.859.438a.57.57 0 01.453.562z'
            },
            width: 24,
            height: 28
        },
        arrowDown: {
            children: {
                path: 'M16.797 11.5a.54.54 0 01-.156.359L9.36 19.14c-.094.094-.234.156-.359.156s-.266-.063-.359-.156l-7.281-7.281c-.094-.094-.156-.234-.156-.359s.063-.266.156-.359l.781-.781a.508.508 0 01.359-.156.54.54 0 01.359.156l6.141 6.141 6.141-6.141c.094-.094.234-.156.359-.156s.266.063.359.156l.781.781a.536.536 0 01.156.359z'
            },
            width: 18,
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
            svg: true
        });
        for (const [type, d] of Object.entries(icon.children)) {
            svg.append(el[type]({
                attributes: {
                    d
                },
                svg: true
            }));
        }
        return svg;
    };

    class Widget {
        defaultActive = true;
        ui;
        title;
        key;
        canDeactivate = false;
        isActive = () => {
            const stored = settings$1.get(`options.${this.key}`);
            return typeof stored !== 'undefined' ? stored : this.defaultActive;
        }
        toggle = state => {
            if (!this.canDeactivate) {
                return this;
            }
            settings$1.set(`options.${this.key}`, state);
            this.ui.classList.toggle('inactive', !state);
            return this;
        }
        enableTool = (iconKey, textToActivate, textToDeactivate) => {
            this.tool = el.div({
                events: {
                    click: () => {
                        this.toggle(!this.isActive());
                        this.tool.title = this.isActive() ? textToDeactivate : textToActivate;
                    }
                },
                attributes: {
                    title: this.isActive() ? textToDeactivate : textToActivate
                }
            });
            this.tool.append(getIcon(iconKey));
        }
        hasUi = () => {
            return this.ui instanceof HTMLElement;
        }
        on = (evt, action) => {
            this.ui.addEventListener(evt, action);
            return this;
        }
        trigger = evt => {
            this.ui.dispatchEvent(evt);
            return this;
        }
        constructor(title, {
            key,
            canDeactivate,
            defaultActive
        } = {}) {
            if (!title) {
                throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
            }
            this.title = title;
            this.key = key || camel(title);
            this.canDeactivate = typeof canDeactivate !== 'undefined' ? canDeactivate : this.canDeactivate;
            this.defaultActive = typeof defaultActive !== 'undefined' ? defaultActive : this.defaultActive;
        }
    }

    class App extends Widget {
        constructor(game) {
            if (!game || !window.gameData) {
                console.info(`This bookmarklet only works on ${settings$1.get('targetUrl')}`);
                return false;
            }
            super(settings$1.get('label'), {
                canDeactivate: true
            });
            this.game = game;
            const oldInstance = el.$(`[data-id="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix$1('destroy')));
            }
            this.registry = new Map();
            this.toolButtons = new Map();
            this.parent = el.$('.sb-content-box', game);
            const reposition = () => {
                const oldState = this.isActive();
                const appRect = this.ui.getBoundingClientRect();
                const toolbar = el.$('#portal-game-toolbar');
                const toolbarRect = toolbar.getBoundingClientRect();
                let position;
                let relRect;
                if (document.documentElement.clientWidth < 768) {
                    relRect = el.$('.sb-wordlist-box', this.game).getBoundingClientRect();
                    toolbar.style.justifyContent = 'left';
                    position = {
                        left: relRect.right - appRect.width + 'px',
                        top: (toolbarRect.top + window.pageYOffset) - 8 + 'px'
                    };
                    this.toggle(false);
                }
                Object.assign(this.ui.style, position);
            };
            const resultList = el.$('.sb-wordlist-items', game);
            const events = {};
            events[prefix$1('destroy')] = () => {
                this.observer.disconnect();
                this.ui.remove();
            };
            this.ui = el.div({
                data: {
                    id: this.key
                },
                classNames: [settings$1.get('prefix')],
                events: events
            });
            data.init(this, resultList);
            this.observer = new MutationObserver(() => this.trigger(new Event(prefix$1('newWord'))));
            this.observer.observe(resultList, {
                childList: true
            });
            this.registerPlugins = plugins => {
                for (const [key, plugin] of Object.entries(plugins)) {
                    this.registry.set(key, new plugin(this));
                }
                this.trigger(new CustomEvent(prefix$1('pluginsReady'), {
                    detail: this.registry
                }));
                return this.registerTools();
            };
            this.registerTools = () => {
                this.registry.forEach(plugin => {
                    if (plugin.tool) {
                        this.toolButtons.set(plugin.key, plugin.tool);
                    }
                });
                this.enableTool('arrowDown', 'Maximize assistant', 'Minimize assistant');
                this.tool.classList.add('minimizer');
                this.toolButtons.set(this.key, this.tool);
                return this.trigger(new CustomEvent(prefix$1('toolsReady'), {
                    detail: this.toolButtons
                }))
            };
            const observer = new MutationObserver(mutationsList => {
                mutationsList.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.isEqualNode(this.ui)) {
                            reposition();
                        }
                    });
                });
            });
            observer.observe(document.body, {
                childList: true
            });
            document.body.append(this.ui);
            window.addEventListener('orientationchange', () => {
                reposition();
            });
        };
    }

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-input-invalid{color:#666}.sba-dark .sb-toggle-expand{box-shadow:none}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram):not(.sba-current){border-color:#333 !important}.sba{position:absolute;width:160px;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;background:#fff;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba [data-ui=header]{display:flex;gap:8px}.sba [data-ui=header] .toolbar{display:flex;align-items:stretch;gap:1px}.sba [data-ui=header] .toolbar div{padding:10px 3px 2px 3px}.sba [data-ui=header] .toolbar div:last-of-type{padding-top:8px}.sba [data-ui=header] svg{width:11px;cursor:pointer;fill:currentColor}.sba .header{font-weight:bold;line-height:32px;flex-grow:2}.sba .minimizer{transform:rotate(180deg);transform-origin:center;position:relative;top:2px}.sba.inactive details,.sba.inactive [data-ui=footer]{display:none}.sba.inactive .minimizer{transform:rotate(0deg);top:0}.sba details{font-size:90%;max-height:800px;transition:max-height .25s ease-in;margin-bottom:1px}.sba details[open] summary:before{transform:rotate(-90deg);left:12px;top:0}.sba details.inactive{height:0;max-height:0;transition:max-height .25s ease-out;overflow:hidden;margin:0}.sba summary{font-size:13px;line-height:22px;padding:0 15px 0 21px;background:#f8cd05;background:#e6e6e6;cursor:pointer;list-style:none;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:-1px}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:2px}.sba tr.sba-current{font-weight:bold;border-bottom:2px solid #f8cd05 !important}.sba td{border:1px solid #dcdcdc;border-top:none;white-space:nowrap;text-align:center;padding:4px 2px;width:30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sba td:first-of-type{text-align:left;width:auto}.sba [data-ui=scoreSoFar] tbody tr:first-child td,.sba [data-ui=spoilers] tbody tr:first-child td{font-weight:bold}.sba [data-ui=footer]{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-ui=footer]:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-ui=surrender] .pane{padding:10px 5px}.sba [data-ui=surrender] button{margin:0 auto;display:block;font-size:100%;white-space:nowrap;padding:12px 10px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}@media only screen and (max-width: 350px){.sba{left:12px;top:735px}}@media only screen and (max-width: 370px){.sba{left:12px;top:735px}}@media only screen and (max-width: 443.98px){.sba{left:12px;top:654px}}\n";

    class Plugin extends Widget {
        target;
        app;
        attach = () => {
            if (!this.hasUi()) {
                return this;
            }
            this.ui.dataset.ui = this.key;
            this.toggle(this.isActive());
            (this.target || this.app.ui).append(this.ui);
            return this;
        }
        add = () => {
            if (this.canDeactivate) {
                settings$1.set(`options.${this.key}`, this.isActive());
            }
            return this.attach();
        }
        constructor(app, title, {
            key,
            canDeactivate,
            defaultActive
        } = {}) {
            if (!app || !title) {
                throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, 'app' or 'title' missing from ${this.constructor.name}`);
            }
            super(title, { key, canDeactivate, defaultActive });
            this.app = app;
        }
    }

    class Styles extends Plugin {
        constructor(app) {
            super(app, 'Styles');
            this.target = el.$('head');
            this.ui = el.style({
                text: css.replace(/(\uFEFF|\\n)/gu, '')
            });
            app.on(prefix$1('destroy'), () => this.ui.remove());
            this.add();
        }
    }

    class DarkMode extends Plugin {
        constructor(app) {
            super(app, 'Dark Mode', {
                canDeactivate: true,
                defaultActive: false
            });
            this.toggle = state => {
                settings$1.set(`options.${this.key}`, state);
                el.$('body').classList.toggle(prefix$1('dark', 'd'), state);
                return this;
            };
            this.enableTool('darkMode', 'Dark mode on', 'Dark mode off');
            this.toggle(this.isActive());
            this.add();
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), {
                key: 'header'
            });
            this.ui = el.div();
            this.ui.append(el.div({
                    text: this.title,
                    classNames: ['header']
                })
            );
    		app.on(prefix$1('toolsReady'), evt => {
                const toolbar = el.div({
                    classNames: ['toolbar']
                });
    			evt.detail.forEach(tool => {
                    toolbar.append(tool);
                });
                this.ui.append(toolbar);
                return this;
            });
            this.add();
        }
    }

    class SetUp extends Plugin {
    	constructor(app) {
    		super(app, 'Set-up', {
    			canDeactivate: true,
    			defaultActive: false
    		});
    		const pane = el.ul({
    			classNames: ['pane']
    		});
    		this.ui = el.details({
    			events: {
    				click: evt => {
    					if (evt.target.tagName === 'INPUT') {
    						app.registry.get(evt.target.name).toggle(evt.target.checked);
    					}
    				},
    				toggle: evt => {
    					if (!evt.target.open) {
    						this.toggle(false);
    					}
    				}
    			}
    		});
    		const _toggle = this.toggle;
    		this.toggle = state => {
    			_toggle(state);
    			this.ui.open = this.isActive();
    		};
    		this.enableTool('options', 'Show set-up', 'Hide set-up');
    		app.on(prefix$1('pluginsReady'), evt => {
    			evt.detail.forEach((plugin, key) => {
    				if (!plugin.canDeactivate || plugin.tool) {
    					return false;
    				}
    				const li = el.li();
    				const label = el.label({
    					text: plugin.title
    				});
    				const check = el.input({
    					attributes: {
    						type: 'checkbox',
    						name: key,
    						checked: plugin.isActive()
    					}
    				});
    				label.prepend(check);
    				li.append(label);
    				pane.append(li);
    			});
    		});
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		this.toggle(false);
    		this.add();
    	}
    }

    const refresh = (data, table) => {
        table.innerHTML = '';
        const tbody = el.tbody();
        data.forEach((rowData) => {
            const tr = el.tr();
            rowData.forEach((cellData) => {
                tr.append(el.td({
                    text: cellData
                }));
            });
            tbody.append(tr);
        });
        table.append(tbody);
    };
    const build = data => {
        const table = el.table({
            classNames: ['pane']
        });
        refresh(data, table);
        return table;
    };
    var tbl = {
        build,
        refresh
    };

    const getData = () => {
        return [
    		['', '✓', '?', '∑'],
            [
                'Words',
                data.getCount('foundTerms'),
                data.getCount('remainders'),
                data.getCount('answers')
            ],
            [
                'Points',
                data.getPoints('foundTerms'),
                data.getPoints('remainders'),
                data.getPoints('answers')
            ]
        ];
    };
    class ScoreSoFar extends Plugin {
        constructor(app) {
            super(app, 'Score so far', {
                canDeactivate: true
            });
            this.ui = el.details({
                attributes: {
                    open: true
                }
            });
            const pane = tbl.build(getData());
            this.ui.append(el.summary({
                text: this.title
            }), pane);
    		app.on(prefix$1('wordsUpdated'), () => {
                tbl.refresh(getData(), pane);
    		});
            this.add();
        }
    }

    class SpillTheBeans extends Plugin {
        constructor(app) {
            super(app, 'Spill the beans', {
                canDeactivate: true
            });
            const react = (value) => {
                if (!value) {
                    return '😐';
                }
                if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
                    return '🙁';
                }
                return '🙂';
            };
            this.ui = el.details();
            const pane = el.div({
                classNames: ['pane']
            });
            pane.append(el.div({
                text: 'Watch me while you type!',
                classNames: ['spill-title']
            }));
            const reaction = el.div({
                text: '😐',
                classNames: ['spill']
            });
            pane.append(reaction);
            this.ui.append(el.summary({
                text: this.title
            }), pane);
            (new MutationObserver(mutationsList => {
                reaction.textContent = react(mutationsList.pop().target.textContent.trim());
            })).observe(el.$('.sb-hive-input-content', app.game), {
                childList: true
            });
            this.add();
        }
    }

    const getData$1 = () => {
    	const counts = {};
    	const pangramCount = data.getCount('pangrams');
    	const foundPangramCount = data.getCount('foundPangrams');
    	const cellData = [
    		['', '✓', '?', '∑'],
    		[
    			'Pangrams',
    			foundPangramCount,
    			pangramCount - foundPangramCount,
    			pangramCount
    		]
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
    	return cellData;
    };
    class Spoilers extends Plugin {
    	constructor(app) {
    		super(app, 'Spoilers', {
    			canDeactivate: true
    		});
    		this.ui = el.details();
    		const pane = tbl.build(getData$1());
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		app.on(prefix$1('wordsUpdated'), () => {
                tbl.refresh(getData$1(), pane);
    		});
    		this.add();
    	}
    }

    const getData$2 = () => {
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
    };
    const markCurrentTier = pane => {
        const ownPoints = data.getPoints('foundTerms');
        const currentTier = getData$2().filter(entry => entry[1] <= ownPoints).pop()[1];
        el.$$('td', pane).forEach(cell => {
            cell.parentNode.classList.remove('sba-current');
            if(parseInt(cell.textContent) === currentTier) {
                cell.parentNode.classList.add('sba-current');
            }
        });
    };
    class StepsToSuccess extends Plugin {
        constructor(app) {
            super(app, 'Steps to success', {
                canDeactivate: true
            });
            this.ui = el.details();
            const pane = tbl.build(getData$2());
            markCurrentTier(pane);
            this.ui.append(el.summary({
                text: this.title
            }), pane);
            app.on(prefix$1('wordsUpdated'), () => {
                markCurrentTier(pane);
    		});
            this.add();
        }
    }

    class Surrender extends Plugin {
    	constructor(app) {
    		super(app, 'Surrender', {
    			canDeactivate: true
    		});
    		let usedOnce = false;
    		const buildEntry = term => {
    			const entry = el.li({
    				classNames: data.getList('pangrams').includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
    			});
    			entry.append(el.a({
    				text: term,
    				attributes: {
    					href: `https://www.google.com/search?q=${term}`,
    					target: '_blank'
    				}
    			}));
    			return entry;
    		};
    		const resolve = (resultList) => {
    			if (usedOnce) {
    				return false;
    			}
    			app.observer.disconnect();
    			data.getList('remainders').forEach(term => resultList.append(buildEntry(term)));
    			usedOnce = true;
    			return true;
    		};
            this.ui = el.details();
    		const pane = el.div({
    			classNames: ['pane']
    		});
    		pane.append(el.button({
    			tag: 'button',
    			classNames: ['hive-action'],
    			text: 'Display answers',
    			attributes: {
    				type: 'button'
    			},
    			events: {
    				click: () => resolve(el.$('.sb-wordlist-items', app.game))
    			}
    		}));
    		this.ui.append(el.summary({
                text: this.title
    		}), pane);
    		this.add();
    	}
    }

    class Footer extends Plugin {
        constructor(app) {
            super(app, `${settings$1.get('label')} ${settings$1.get('version')}`, {
                key: 'footer'
            });
            this.ui = el.a({
                text: this.title,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
            this.add();
        }
    }

    var plugins = {
         Styles,
         DarkMode,
         Header,
         SetUp,
         ScoreSoFar,
         Spoilers,
         SpillTheBeans,
         StepsToSuccess,
         Surrender,
         Footer
    };

    (new App(el.$('#pz-game-root'))).registerPlugins(plugins);

}());
