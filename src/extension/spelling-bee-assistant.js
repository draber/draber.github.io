(function () {
    'use strict';

    const fn = {
        $: (expr, container = null) => {
            return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
        },
        $$: (expr, container = null) => {
            return [].slice.call((container || document).querySelectorAll(expr));
        },
        toNode: (content) => {
            const fragment = document.createDocumentFragment();
            if (typeof content === 'undefined') {
                return fragment;
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
                const doc = (new DOMParser()).parseFromString(content, 'text/html');
                content = doc.body.childNodes;
            }
            if(typeof content.forEach === 'function') {
                Array.from(content).forEach(element => {
                    fragment.append(element);
                });
                return fragment;
            }
            console.error('Expected Element|DocumentFragment|Iterable|String|HTMLCode, got', content);
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
        if (tag === 'a' && attributes.href && !content) {
            content = (new URL(attributes.href)).hostname;
        }
        for (let [key, value] of Object.entries(attributes)) {
            if (isSvg) {
                el.setAttributeNS(null, key, value.toString());
            } else if (key === 'role' || key.startsWith('aria-')) {
                el.setAttribute(key, value);
            } else if (value !== false) {
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
        if (typeof content !== 'undefined') {
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
    var mobileThreshold = "900";

    var version = "3.2.1";

    const settings = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix$1,
        repo: repo,
        targetUrl: targetUrl,
        mobileThreshold: mobileThreshold,
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
        return sbData.displayDate;
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

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), '', {
                key: 'header'
            });
            this.ui = el.div({
                content: el.div({
                    content: this.title,
                    classNames: ['header']
                })
            });
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

    class ProgressBar extends Plugin {
        run(evt) {
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

    class SpillTheBeans extends Plugin {
        run(evt) {
            let emoji = '🙂';
            if (!evt.detail) {
                emoji = '😐';
            }
            else if (!data.getList('remainders').filter(term => term.startsWith(evt.detail)).length) {
                emoji = '🙁';
            }
            this.ui.textContent = emoji;
        }
        constructor(app) {
            super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
                canChangeState: true,
                runEvt: prefix('newInput'),
                addMethod: 'prepend'
            });
            this.ui = el.div({
                content: '😐'
            });
            this.target = el.$('.sb-controls', this.app.gameWrapper);
            this.toggle(this.getState());
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
                classNames: ['sb-modal-frame', 'left-aligned', prefix('pop-up', 'd')],
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
                console.error(`Unknown target ${part}`);
                return this;
            }
            this.parts[part] = el.empty(this.parts[part]);
            this.parts[part].append(el.toNode(content));
            return this;
        }
        toggle(state) {
            const closer = el.$('.sb-modal-close', this.modalWrapper);
            if (!this.getState() && closer) {
                closer.click();
            }
            if (state) {
                this.modalWrapper.append(this.ui);
                this.modalSystem.classList.add('sb-modal-open');
                this.state = true;
            } else {
                this.getTarget().append(this.ui);
                this.modalSystem.classList.remove('sb-modal-open');
                this.state = false;
            }
            this.app.trigger(prefix('popup'), {
                plugin: this
            });
            return this;
        }
        getState() {
            return this.state;
        }
        constructor(app, title, description, {
            key
        } = {}) {
            super(app, title, description, {
                key,
                canChangeState: true,
                defaultState: false
            });
            this.state = false;
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

    class Surrender extends Plugin {
    	getDescription() {
    		return el.div({
    			classNames: ['sb-modal-date__today'],
    			content: data.getDate()
    		})
    	}
    	toggle() {
    		const answers = data.getList('answers');
    		const foundTerms = data.getList('foundTerms');
    		const pangrams = data.getList('pangrams');
    		const googlify = this.app.plugins.get('googlify');
    		const highlightPangrams = this.app.plugins.get('highlightPangrams');
    		const letters = el.div({
    			content: data.getList('letters').join(''),
    			classNames: ['sb-modal-letters']
    		});
    		const classNames = ['sb-modal-wordlist-items'];
    		const events = {};
    		if(googlify) {
    			classNames.push(prefix('googlified', 'd'));
    			events.pointerup = googlify.listener;
    		}
    		const pane = el.ul({
    			classNames,
    			events
    		});
    		answers.forEach(term => {
    			const checkClass = ['check'];
    			if (foundTerms.includes(term)) {
    				checkClass.push('checked');
    			}
    			let li = el.li({
    				content: [
    					el.span({
    						classNames: checkClass
    					}), el.span({
    						classNames: ['sb-anagram'],
    						content: term
    					})
    				]
    			});
    			if (highlightPangrams && pangrams.includes(term)) {
    				li.classList.add(highlightPangrams.marker);
    			}
    			pane.append(li);
    		});
    		this.popup.setContent('body', [letters, pane]).toggle(!this.popup.getState());
    		return this;
    	}
    	constructor(app) {
    		super(app, 'Surrender', 'Reveals the solution of the game', {
    			canChangeState: true
    		});
    		this.marker = prefix('resolved', 'd');
    		this.popup = new Popup(this.app, 'Today’s Answers', this.getDescription(), {
    			key: this.key + 'PopUp'
    		});
    		this.popup.add();
    		this.ui = this.popup.ui;
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
                    node.classList.toggle(this.marker, this.getState());
                }
            });
            this.app.observer.observe(args.target, args.options);
            return this;
        }
        constructor(app) {
            super(app, 'Highlight Pangrams', '', {
                canChangeState: false,
    			runEvt: prefix('refreshUi')
            });
            this.marker = prefix('pangram', 'd');
            this.run();
        }
    }

    class Googlify extends Plugin {
        toggle(state) {
            super.toggle(state);
            return this.run();
        }
        listener(evt) {
            if(!evt.target.classList.contains('sb-anagram') || !evt.target.closest('.sb-anagram')){
                return false;
            }
            if(evt.button === 0) {
               return window.open(`https://www.google.com/search?q=${evt.target.textContent}`, prefix());
            }
        }
        run() {
            const method = `${this.getState() ? 'add' : 'remove'}EventListener`;
            this.app.resultList[method]('pointerup', this.listener);
            this.app.resultList.classList.toggle(prefix('googlified', 'd'), this.getState());
            return this;
        }
        constructor(app) {
            super(app, 'Googlify', 'Link all result terms to Google', {
                canChangeState: false
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
                    target: prefix()
                }
            });
        }
    }

    var css = "[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 3px;--sba-app-margin: 64px 0 0 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px }@media(min-width: 968px){[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 5px}}[data-sba-theme=light]{--text-color:#000;--site-text-color:rgba(0,0,0,.9);--link-color:#326891;--link-visited-color:#326891;--link-hover-color:#5f8ab1;--body-bg-color:#fff;--modal-bg-color:rgba(255,255,255,.85);--border-color:#dcdcdc;--area-bg-color:#e6e6e6;--invalid-color:#a2a2a2;--card-color:rgba(248,205,5,.1);--success-color:#248a17}[data-sba-theme=dark]{--text-color:#e7eae1;--site-text-color:rgba(255,255,255,.9);--link-color:#51a9f7;--link-visited-color:#8dc6f8;--link-hover-color:#8dc6f8;--body-bg-color:#111;--modal-bg-color:rgba(17,17,17,.85);--border-color:#333;--area-bg-color:#393939;--invalid-color:#666;--card-color:#393939;--success-color:#47c537}html{--highlight-color: rgb(248, 205, 5);--shadow-light-color: rgba(248, 205, 5, .35);--shadow-dark-color: rgba(248, 205, 5, .7)}[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 3px;--sba-app-margin: 64px 0 0 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px }@media(min-width: 968px){[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 5px}}.sba-pop-up[data-ui=setUpPopUp] li{position:relative;margin:0 0 5px 22px}.sba-pop-up[data-ui=setUpPopUp] label{cursor:pointer;overflow:hidden}.sba-pop-up[data-ui=setUpPopUp] label:before{content:\"\";border:2px solid var(--border-color);width:14px;height:14px;display:inline-block;border-radius:3px;position:absolute;left:-21px;top:4px}.sba-pop-up[data-ui=setUpPopUp] input{position:absolute;left:-40px;top:-12px;visibility:hidden;cursor:pointer}.sba-pop-up[data-ui=setUpPopUp] input:checked:after{content:\"✔\";color:var(--highlight-color);position:absolute;top:3px;left:16px;font-size:20px;visibility:visible}.sba-pop-up[data-ui=setUpPopUp] b{font-weight:bold}.sba-pop-up[data-ui=setUpPopUp] i{font-style:italic}.sba-pop-up[data-ui=setUpPopUp] i::before{content:\" - \"}[data-sba-theme=dark]{background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-moment__loading{color:#000}[data-sba-theme=dark] .pz-game-wrapper{background:inherit !important;color:inherit}[data-sba-theme=dark] .pz-nav__hamburger-inner,[data-sba-theme=dark] .pz-nav__hamburger-inner::before,[data-sba-theme=dark] .pz-nav__hamburger-inner::after{background-color:var(--text-color)}[data-sba-theme=dark] .pz-nav{width:100%;background:var(--body-bg-color)}[data-sba-theme=dark] .pz-nav__logo{filter:invert(1)}[data-sba-theme=dark] .sb-modal-scrim{background:var(--modal-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-modal__title,[data-sba-theme=dark] .sb-modal-close{color:var(--text-color)}[data-sba-theme=dark] .sb-modal-frame,[data-sba-theme=dark] .pz-modal__button.white{background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .pz-modal__button.white:hover{background:var(--area-bg-color)}[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}[data-sba-theme=dark] .sb-input-invalid{color:var(--invalid-color)}[data-sba-theme=dark] .sb-toggle-expand{box-shadow:none}[data-sba-theme=dark] .sb-progress-marker .sb-progress-value,[data-sba-theme=dark] .hive-cell.center .cell-fill{background:var(--highlight-color);fill:var(--highlight-color);color:var(--body-bg-color)}[data-sba-theme=dark] .sb-input-bright{color:var(--highlight-color)}[data-sba-theme=dark] .hive-cell.outer .cell-fill{fill:var(--area-bg-color)}[data-sba-theme=dark] .cell-fill{stroke:var(--body-bg-color)}[data-sba-theme=dark] .cell-letter{fill:var(--text-color)}[data-sba-theme=dark] .hive-cell.center .cell-letter{fill:var(--body-bg-color)}[data-sba-theme=dark] .pz-toolbar-button:hover,[data-sba-theme=dark] [data-ui=launcher] label:hover{background:var(--area-bg-color);color:var(--text-color)}[data-sba-theme=dark] .hive-action:not(.hive-action__shuffle){background:var(--body-bg-color);color:var(--text-color)}[data-sba-theme=dark] .hive-action:not(.hive-action__shuffle):hover{background:var(--area-bg-color)}[data-sba-theme=dark] .hive-action__shuffle{filter:invert(100%)}[data-sba-theme=dark] *:not(.hive-action__shuffle):not(.sba-pangram):not(.sba-preeminent){border-color:var(--border-color) !important}.sba{margin:64px 0 0 0;width:var(--sba-app-width);padding:var(--sba-app-padding);box-sizing:border-box;background:var(--body-bg-color);border-width:1px;border-color:var(--border-color);border-radius:6px;border-style:solid}.sba.inactive{display:none}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba [data-ui=header]{display:flex;gap:8px}.sba [data-ui=header] .toolbar{display:flex;align-items:stretch;gap:1px}.sba [data-ui=header] .toolbar div{padding:10px 3px 2px 3px}.sba [data-ui=header] svg{width:11px;cursor:pointer;fill:currentColor}.sba .header{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px}.sba progress{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0 0 2px 0;height:6px;padding:0;border:1px var(--border-color) solid;background:transparent;display:block}.sba progress.inactive{display:none}.sba progress::-webkit-progress-bar{background-color:transparent}.sba progress::-webkit-progress-value{background-color:var(--highlight-color);height:4px}.sba progress::-moz-progress-bar{background-color:var(--highlight-color)}.sba details{font-size:90%;margin-bottom:1px}.sba details.inactive{display:none}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sba .pane{border:1px solid var(--border-color);border-top:none;width:100%;font-size:85%;margin-bottom:2px}.sba table{border-collapse:collapse;table-layout:fixed}.sba tr.sba-preeminent{font-weight:bold;border-bottom:2px solid var(--highlight-color) !important}.sba tr.sba-completed{color:var(--invalid-color);font-weight:normal}.sba tr.sba-hidden{display:none}.sba td{border:1px solid var(--border-color);border-top:none;white-space:nowrap;text-align:center;padding:3px 0;width:26px}.sba td:first-of-type{text-align:left;width:auto;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:3px 3px}.sba [data-ui=scoreSoFar] tbody tr:first-child td,.sba [data-ui=spoilers] tbody tr:first-child td,.sba [data-ui=startingWith…] tbody tr:first-child td{font-weight:bold;font-size:92%}.sba [data-ui=startingWith…] tbody tr td:first-child{text-align:center;text-transform:uppercase}.sba [data-ui=footer]{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-ui=footer]:hover{opacity:.8;text-decoration:underline}.sba ul.pane{padding:5px}.sba [data-ui=surrender] .pane{padding:10px 5px}.sba [data-ui=surrender] button{margin:0 auto;display:block;font-size:100%;white-space:nowrap;padding:12px 10px}.sba label{cursor:pointer;position:relative;line-height:19px;white-space:nowrap}.sba label input{position:relative;top:2px;margin:0 5px 0 0}[data-ui=spillTheBeans]{text-align:center;padding:14px 0;font-size:280%}[data-ui=spillTheBeans].inactive{display:none}[data-ui=launcher]{position:relative;z-index:1}[data-ui=launcher] .pane{position:absolute;background:var(--body-bg-color);border:1px var(--border-color) solid;top:55px;right:180px}[data-ui=launcher] .pane li{line-height:1.4;white-space:nowrap}[data-ui=launcher] .pane li:first-child{margin-top:5px}[data-ui=launcher] .pane label{display:block;padding:5px 10px;font-size:16px}.sba-googlified .sb-anagram{cursor:pointer}.sba-googlified .sb-anagram:hover{text-decoration:underline;color:var(--link-hover-color)}.sba{margin:var(--sba-app-margin);width:var(--sba-app-width);padding:var(--sba-app-padding)}[data-sba-active=true] .sb-content-box{max-width:var(--sba-game-width);justify-content:space-between;position:relative}[data-sba-active=true] .sb-controls-box{max-width:calc(100vw - var(--sba-app-width))}[data-sba-active=true] .sba-container{position:absolute;top:50%;transform:translate(0, -50%);right:var(--sba-game-offset)}@media(min-width: 900px){[data-sba-active=true] .sb-content-box{padding:0 var(--sba-game-offset)}[data-sba-active=true] .sb-controls-box{max-width:none}[data-sba-active=true] .sba-container{position:static;transform:none}}.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items-pag>li.sba-pangram{border-bottom:2px var(--highlight-color) solid}.sb-wordlist-items-pag>li.sb-anagram a{color:var(--invalid-color)}.sb-modal-scrim{z-index:6}.pz-desktop .sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.pz-desktop .sba summary{list-style:none;padding:1px 15px 0 21px}.pz-desktop .sba summary::marker{display:none}.pz-desktop .sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme].pz-spelling-bee-congrats .sba-pop-up.left-aligned .sb-modal-content .sba-pangram{font-weight:700;border-bottom:2px var(--highlight-color) solid}[data-sba-theme].pz-spelling-bee-congrats .sba-pop-up.left-aligned .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;font-size:13px;display:flex;flex-direction:row-reverse;justify-content:space-between;align-items:center;text-align:right;border-top:1px solid var(--border-color);padding-top:10px}[data-sba-theme].pz-spelling-bee-congrats .sba-pop-up.left-aligned .sb-modal-content .sba-modal-footer button{padding:6px 10px;margin:0}[data-sba-theme].pz-spelling-bee-congrats .left-aligned .sb-modal-content .sb-modal-body::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}@media(min-width: 768px){[data-sba-theme].pz-page .sba-pop-up.left-aligned .sb-modal-content .sb-modal-body{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.left-aligned .sb-modal-content .sb-modal-header{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.left-aligned .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;width:calc(100% - 112px);margin:-8px auto 15px}}@media(max-width: 767.98px){.sba [data-ui=spillTheBeans] .spill-title{display:none}.pz-mobile .sba-pop-up b{display:block}.pz-mobile .sba-pop-up i{margin-bottom:5px}.pz-mobile .sba-pop-up i::before{content:normal}}";

    class Styles extends Plugin {
        modifyMq() {
            let rules;
            let sheet;
            for (let _sheet of document.styleSheets) {
                if (_sheet.href && _sheet.href.startsWith('https://www.nytimes.com/games-assets/v2/spelling-bee')) {
                    sheet = _sheet;
                    break;
                }
            }
            rules = sheet.rules;
            if (!rules) {
                return
            }
            let l = rules.length;
            for (let i = 0; i < l; i++) {
                if (rules[i] instanceof CSSMediaRule && rules[i].conditionText.includes('min-width: 768px') && !rules[i].cssText.includes('.sb-modal')) {
                    const newRule = rules[i].cssText.replace('min-width: 768px', `min-width: ${settings$1.get('mobileThreshold')}px`).replace(/(?:\\[rn]|[\r\n]+)+/g, '').replace(/\s+/g, ' ');
                    sheet.deleteRule(i);
                    sheet.insertRule(newRule, i);
                }
            }
        }
        constructor(app) {
            super(app, 'Styles', '');
            this.target = el.$('head');
            this.ui = el.style({
                content: css
            });
            app.on(prefix('destroy'), () => this.ui.remove());
            this.add();
            this.modifyMq();
        }
    }

    class Menu extends Plugin {
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
    	run(evt) {
    		return super.toggle();
    	}
    	constructor(app) {
    		super(app, 'Launcher', '');
    		this.target = this.getTarget();
    		const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];
    		const pane = el.ul({
    			classNames: ['pane'],
    			events: {
    				click: evt => {
    					if (evt.target.tagName === 'INPUT') {
    						if (evt.target.name === this.app.key) {
    							const nextState = !this.app.getState();
    							this.app.toggle(nextState);
    							this.app.gameWrapper.dataset.sbaActive = nextState.toString();
    						} else {
    							app.plugins.get(evt.target.name).toggle(evt.target.checked);
    						}
    					}
    				}
    			},
    			content: el.li({
    				attributes: {
    					title: this.app.title
    				},
    				content: el.label({
    					content: [
    						el.input({
    							attributes: {
    								type: 'checkbox',
    								name: this.app.key,
    								checked: !!this.app.getState()
    							}
    						}),
    						`Toggle ${settings$1.get('title')}`
    					]
    				})
    			})
    		});
    		this.ui = el.div({
    			content: [
    				settings$1.get('title'),
    				pane
    			],
    			attributes: {
    				role: 'presentation'
    			},
    			classNames
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
    					attributes: {
    						title: plugin.description
    					},
    					content: el.label({
    						content: [
    							input,
    							plugin.title
    						]
    					})
    				}));
    				defaults.set(key, {
    					input,
    					default: !!plugin.defaultState
    				});
    			});
    		});
    		app.on(prefix('destroy'), () => this.ui.remove());
    	}
    }

    const getPlugins = app => {
         return {
              DarkMode,
              Header,
              ProgressBar,
              ScoreSoFar,
              Spoilers,
              StartingWith,
              SpillTheBeans,
              HighlightPangrams,
              Googlify,
              Footer,
              Styles,
              Menu,
              StepsToSuccess,
              Surrender
         }
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
        getGameState() {
            const splash = el.$('#js-hook-pz-moment__welcome', this.gameWrapper);
            const contentBox = el.$('.sb-content-box', this.gameWrapper);
            if (!splash) {
                return -1;
            }
            if (contentBox && contentBox.classList.contains('sb-game-locked')) {
                return 0;
            }
            if (!contentBox.classList.contains('sb-game-locked')) {
                return 1;
            }
        }
        getSyncData() {
            let sync = localStorage.getItem('sb-today');
            if (!sync) {
                return null;
            }
            sync = JSON.parse(sync);
            if (!sync.id || sync.id !== data.getId()) {
                return null;
            }
            return sync.words || [];
        }
        envIs(env) {
            return document.body.classList.contains('pz-' + env);
        }
        async getResults() {
            let tries = 10;
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
        async waitForGameState(threshold) {
            let tries = 50;
            return await new Promise(resolve => {
                const interval = setInterval(() => {
                    const state = this.getGameState();
                    if (!tries || this.getGameState() >= threshold) {
                        resolve(state);
                        clearInterval(interval);
                    }
                    tries--;
                }, 300);
            });
        }
        load() {
            if (this.isLoaded) {
                return false;
            }
            this.observer = this.buildObserver();
            this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
            this.resultList = el.$('.sb-wordlist-items-pag', this.gameWrapper);
            this.waitForGameState(1)
                .then(() => {
                    this.add();
                    this.gameWrapper.dataset.sbaActive = this.getState();
                    this.registerPlugins();
                    this.trigger(prefix('refreshUi'));
                    this.isLoaded = true;
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
            Object.values(getPlugins()).forEach(plugin => {
                const instance = new plugin(this);
                instance.add();
                this.plugins.set(instance.key, instance);
            });
            this.trigger(prefix('pluginsReady'), this.plugins);
            return this;
        }
        add() {
            this.container.append(this.ui);
            el.$('.sb-content-box', this.gameWrapper).append(this.container);
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
            this.ui = this.buildUi();
            this.container = el.div({
                classNames: [prefix('container', 'd')]
            });
            this.isLoaded = false;
            this.getResults()
                .then(results => {
                    data.init(this, results);
                })
                .then(() => {
                    this.waitForGameState(0)
                        .then(state => {
                            if (state === 0) {
                                el.$('.pz-moment__button-wrapper .pz-moment__button.primary', this.gameWrapper).addEventListener('pointerup', () => {
                                    this.load();
                                });
                            } else {
                                this.load();
                            }
                        });
                });
        }
    }

    new App(el.$('#js-hook-game-wrapper'));

}());
