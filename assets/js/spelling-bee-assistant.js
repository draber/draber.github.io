(function () {
    'use strict';

    const fn = {
        $: (selector, container = null) => {
            return typeof selector === 'string' ? (container || document).querySelector(selector) : selector || null;
        },
        $$: (selector, container = null) => {
            return [].slice.call((container || document).querySelectorAll(selector));
        },
        waitFor: function (selector, container = null) {
            return new Promise(resolve => {
                const getElement = () => {
                    const resultList = fn.$(selector, container);
                    if (resultList) {
                        resolve(resultList);
                    } else {
                        requestAnimationFrame(getElement);
                    }
                };
                getElement();
            })
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
            if (typeof content.forEach === 'function') {
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

    var version = "4.2.0";

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

    class Panel {
        buildUi() {
            return el.div({
                data: {
                    ui: this.key
                },
                classNames: ['sb-modal-content'],
                content: [
                    el.div({
                        classNames: ['sb-modal-header'],
                        content: [this.parts.title, this.parts.subtitle]
                    }),
                    this.parts.body,
                    this.parts.footer
                ]
            });
        }
        reset() {
            this.target.append(this.ui);
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
        constructor(app, key) {
            this.app = app;
            this.key = key;
            this.parts = {
                title: el.h3({
                    classNames: ['sb-modal-title']
                }),
                subtitle: el.p({
                    classNames: ['sb-modal-message']
                }),
                body: el.div({
                    classNames: ['sb-modal-body']
                }),
                footer: el.div({
                    classNames: ['sb-modal-message', 'sba-modal-footer'],
                    content: [
                        el.a({
                            content: settings$1.get('label'),
                            attributes: {
                                href: settings$1.get('url'),
                                target: prefix()
                            }
                        })
                    ]
                })
            };
            this.ui = this.buildUi();
            this.target = this.app.componentContainer;
            this.target.append(this.ui);
        }
    }

    class ColorConfig extends Plugin {
        toggle(state) {
            el.$$('[data-sba-theme]').forEach(element => {
                element.style.setProperty('--dhue', state.hue);
                element.style.setProperty('--dsat', state.sat + '%');
            });
            return super.toggle(state);
        }
        display(target) {
            target.display(this.panel);
            el.$('input:checked', this.panel.ui).focus();
        }
        constructor(app) {
            super(app, 'Dark Mode Colors', 'Select your favorite color scheme for the Dark Mode.', {
                canChangeState: true,
                defaultState: {
                    hue: 0,
                    sat: 0
                }
            });
            this.menuAction = 'panel';
            this.menuIcon = 'null';
            this.panelTheme = 'dark';
            const swatches = el.ul({
                classNames: [prefix('swatches', 'd')]
            });
            for (let hue = 0; hue < 360; hue += 30) {
                const sat = hue === 0 ? 0 : 25;
                swatches.append(el.li({
                    content: [
                        el.input({
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
                        el.label({
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
            this.panel = new Panel(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', this.description)
                .setContent('body', el.div({
                    classNames: [prefix('color-selector', 'd')],
                    content: [
                        swatches,
                        el.div({
                            classNames: ['hive'],
                            content: [el.svg({
                                classNames: ['hive-cell', 'outer'],
                                attributes: {
                                    viewBox: `0 0 24 21`
                                },
                                isSvg: true,
                                content: [el.path({
                                        classNames: ['cell-fill'],
                                        isSvg: true,
                                        attributes: {
                                            d: 'M18 21H6L0 10.5 6 0h12l6 10.5z'
                                        }
                                    }),
                                    el.text({
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
            this.toggle(this.getState());
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), '', {
                key: 'header'
            });
            this.ui = el.div({
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
            this.ui = el.progress({
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
            this.target = el.$('.sb-wordlist-heading', this.app.gameWrapper);
            this.toggle(this.getState());
        }
    }

    class TablePane extends Plugin {
    	run(evt) {
    		this.pane = el.empty(this.pane);
    		const tbody = el.tbody();
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
    			const tr = el.tr({
    				classNames
    			});
    			rowData.forEach((cellData, rInd) => {
    				const tag = rInd === 0 && this.hasHeadCol ? 'th' : 'td';
    				tr.append(el[tag]({
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
    		return el.thead({
    			content: el.tr({
    				content: rowData.map(cellData => el.th({
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
    		this.pane = el.table({
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
            this.ui = el.details({
                attributes: {
                    open: true
                },
                content: [
                    el.summary({
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
            }
            else if (!data.getList('remainders').filter(term => term.startsWith(evt.detail)).length) {
                emoji = '🙁';
            }
            this.ui.textContent = emoji;
            return this;
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
            this.ui = el.details({
                content: [
                    el.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    }

    class FirstLetter extends TablePane {
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
            super(app, 'First letter', 'The number of words by first letter', {
                cssMarkers: {
                    completed: (rowData, i) => rowData[2] === 0,
                    preeminent: (rowData, i) => rowData[0] === data.getCenterLetter()
                }
            });
            this.ui = el.details({
                content: [
                    el.summary({
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
            this.ui = el.details({
                content: [
                    el.summary({
                        content: this.title
                    }),
                    this.getPane()
                ]
            });
            this.toggle(this.getState());
        }
    }

    class YourProgress extends TablePane {
        display(target) {
            const points = data.getPoints('foundTerms');
            const max = data.getPoints('answers');
            const next = this.getPointsToNextTier();
            const progress = points * 100 / max;
            let content;
            if (next) {
                content = el.span({
                    content: [
                        'You are currently at ',
                        el.b({
                            content: points + '/' + max
                        }),
                        ' points or ',
                        el.b({
                            content: Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100) + '%'
                        }),
                        '. You need ',
                        el.b({
                            content: next - points
                        }),
                        ' more points to go to the next level.',
                    ]
                });
            } else {
                content = el.span({
                    content: [
                        'Congratulations, you’ve found all ',
                        el.b({
                            content: points
                        }),
                        ' points!',
                    ]
                });
            }
            this.panel
                .setContent('subtitle', el.span({
                    content
                }))
                .setContent('body', this.getPane());
                target.display(this.panel);
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
            this.panel = new Panel(this.app, this.key)
                .setContent('title', this.title);
            this.menuAction = 'panel';
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
            return Array.from(new Set(data.getList('answers').map(term => term.charAt[0]))).length === 7;
        }
        nytCommunity() {
            const date = data.getDate().print;
            const href = `https://www.nytimes.com/${date.replace(/-/g, '/')}/crosswords/spelling-bee-${date}.html#commentsContainer`;
            return el.a({
                content: 'NYT Spelling Bee Forum for today’s game',
                attributes: {
                    href,
                    target: prefix()
                }
            })
        }
        twitter() {
            const hashtags = ['hivemind', 'nytspellingbee', 'nytbee', 'nytsb'].map(tag => el.a({
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
            return el.a({
                content: 'Portal to all NYT Spelling Bee Forums',
                attributes: {
                    href,
                    target: prefix()
                }
            })
        }
        redditCommunity() {
            return el.a({
                content: 'NY Times Spelling Bee Puzzle on Reddit',
                attributes: {
                    href: 'https://www.reddit.com/r/NYTSpellingBee/',
                    target: prefix()
                }
            })
        }
        display(target) {
    		target.display(this.panel);
            return this;
        }
        constructor(app) {
            super(app, 'Community', 'Spelling Bee resources suggested by the community', {
                canChangeState: true
            });
            this.menuAction = 'panel';
            this.menuIcon = 'null';
            const words = ['two','three','four', 'five','six','seven','eight','nine','ten'];
            const features = el.ul({
                content: [
                    el.li({
                        content: [
                            el.h4({
                                content: 'Does today’s game have a Perfect Pangram?'
                            }),
                            el.p({
                                content: (() => {
                                    const pp = this.getPerfectPangramCount();
                                    switch (pp) {
                                        case 0:
                                            return `No, today it doesn’t`;
                                        case 1:
                                            return `Yes, today there’s one Perfect Pangram`;
                                        default:
                                            return `Yes, today there are ${words[pp - 2]} Perfect Pangrams`;
                                    }
                                })()
                            }),
                            el.em({
                                content: 'Pangrams that use each letter only once are called "perfect" by the community.'
                            })
                        ]
                    }),
                    el.li({
                        content: [
                            el.h4({
                                content: 'Does it classify as "Bingo"?'
                            }),
                            el.p({
                                content: this.hasBingo() ? 'Yes, today is Bingo day!' : 'No, today it doesn’t'
                            }),
                            el.em({
                                content: '"Bingo" means that all seven letters in the puzzle are used to start at least one word in the word list.'
                            })
                        ]
                    }),
                    el.li({
                        content: [
                            el.h4({
                                content: 'Is it possible to reach Genius without using 4-letter words?'
                            }),
                            el.p({
                                content: this.hasGeniusNo4Letters() ? 'Yes, today it is!' : 'No, today it isn’t'
                            })
                        ]
                    }),
                    el.li({
                        content: [
                            el.h4({
                                content: 'Forums and Hashtags'
                            }),
                            el.ul({
                                content: [
                                    el.li({
                                        content: this.nytCommunity()
                                    }),
                                    el.li({
                                        content: this.nytSpotlight()
                                    }),
                                    el.li({
                                        content: this.redditCommunity()
                                    }),
                                    el.li({
                                        content: this.twitter()
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
            this.panel = new Panel(this.app, this.key)
                .setContent('title', this.title)
                .setContent('subtitle', this.description)
                .setContent('body', features);
        }
    }

    class TodaysAnswers extends Plugin {
    	display(target) {
    		const foundTerms = data.getList('foundTerms');
    		const pangrams = data.getList('pangrams');
    		const pane = el.ul({
    			classNames: ['sb-modal-wordlist-items']
    		});
    		data.getList('answers').forEach(term => {
    			pane.append(el.li({
    				classNames: pangrams.includes(term) ? [prefix('pangram', 'd')] : [],
    				content: [
    					el.span({
    						classNames: foundTerms.includes(term) ? ['check', 'checked'] : ['check']
    					}), el.span({
    						classNames: ['sb-anagram'],
    						content: term
    					})
    				]
    			}));
    		});
    		this.panel
    			.setContent('body', [
    				el.div({
    					content: data.getList('letters').join(''),
    					classNames: ['sb-modal-letters']
    				}),
    				pane
    			]);
    		target.display(this.panel);
    		return this;
    	}
    	constructor(app) {
    		super(app, 'Today’s Answers', 'Reveals the solution of the game', {
    			canChangeState: true,
    			defaultState: false,
    			key: 'todaysAnswers'
    		});
    		this.marker = prefix('resolved', 'd');
    		this.panel = new Panel(this.app, this.key)
    			.setContent('title', this.title)
    			.setContent('subtitle', data.getDate().display);
    		this.menuAction = 'panel';
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
            el.$$('li', container).forEach(node => {
                const term = node.textContent;
                if (pangrams.includes(term) || el.$('.pangram', node)) {
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
        run(evt=null) {
            const method = `${this.getState() ? 'add' : 'remove'}EventListener`;
            [this.app.modalWrapper, this.app.resultList].forEach(container => {
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

    var css = "@charset \"UTF-8\";\n/**\n *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle\n * \n *  Copyright (C) 2020  Dieter Raber\n *  https://www.gnu.org/licenses/gpl-3.0.en.html\n */\n/**\n *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle\n * \n *  Copyright (C) 2020  Dieter Raber\n *  https://www.gnu.org/licenses/gpl-3.0.en.html\n */\n[data-sba-theme] {\n  --dhue: 0;\n  --dsat: 0%;\n  --link-hue: 206;\n  --shadow-light-color: hsl(49, 96%, 50%, 0.35);\n  --shadow-dark-color: hsl(49, 96%, 50%, 0.7);\n  --highlight-text-color: hsl(0, 0%, 0%);\n}\n\n[data-sba-theme=light] {\n  --highlight-bg-color: #f7db22;\n  --text-color: black;\n  --site-text-color: rgba(0, 0, 0, 0.9);\n  --body-bg-color: white;\n  --modal-bg-color: rgba(255, 255, 255, 0.85);\n  --border-color: #dbdbdb;\n  --area-bg-color: #e6e6e6;\n  --invalid-color: #adadad;\n  --menu-hover-color: whitesmoke;\n  --head-row-bg-color: whitesmoke;\n  --card-color: rgba(247, 219, 34, 0.1);\n  --link-color: hsl(var(--link-hue), 45%, 38%);\n  --link-visited-color: hsl(var(--link-hue), 45%, 53%);\n  --link-hover-color: hsl(var(--link-hue), 45%, 53%);\n  --success-color: #2ca61c;\n}\n\n[data-sba-theme=dark] {\n  --highlight-bg-color: #facd05;\n  --text-color: hsl(var(--dhue), var(--dsat), 85%);\n  --site-text-color: hsl(var(--dhue), var(--dsat), 100%, 0.9);\n  --body-bg-color: hsl(var(--dhue), var(--dsat), 7%);\n  --modal-bg-color: hsl(var(--dhue), var(--dsat), 7%, 0.85);\n  --border-color: hsl(var(--dhue), var(--dsat), 20%);\n  --area-bg-color: hsl(var(--dhue), var(--dsat), 22%);\n  --invalid-color: hsl(var(--dhue), var(--dsat), 50%);\n  --menu-hover-color: hsl(var(--dhue), var(--dsat), 22%);\n  --head-row-bg-color: hsl(var(--dhue), var(--dsat), 13%);\n  --card-color: hsl(var(--dhue), var(--dsat), 22%);\n  --link-color: hsl(var(--link-hue), 90%, 64%);\n  --link-visited-color: hsl(var(--link-hue), 90%, 76%);\n  --link-hover-color: hsl(var(--link-hue), 90%, 76%);\n  --success-color: #64f651;\n}\n\n/**\n *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle\n * \n *  Copyright (C) 2020  Dieter Raber\n *  https://www.gnu.org/licenses/gpl-3.0.en.html\n */\nbody {\n  background: var(--body-bg-color);\n  color: var(--text-color);\n}\nbody .pz-game-field {\n  background: var(--body-bg-color);\n  color: var(--text-color);\n}\nbody[data-sba-theme=dark] .pz-game-wrapper, body[data-sba-theme=dark] #js-hook-pz-moment__loading {\n  background: var(--body-bg-color) !important;\n  color: var(--text-color);\n}\nbody .pz-game-wrapper .sb-modal-message a {\n  color: var(--link-color);\n}\nbody .pz-game-wrapper .sb-modal-message a:visited {\n  color: var(--link-visited-color);\n}\nbody .pz-game-wrapper .sb-modal-message a:hover {\n  color: var(--link-hover-color);\n}\nbody .pz-game-wrapper .sb-progress-marker .sb-progress-value,\nbody .pz-game-wrapper .hive-cell:first-child .cell-fill {\n  background: var(--highlight-bg-color);\n  fill: var(--highlight-bg-color);\n  color: var(--highlight-text-color);\n}\nbody .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-fill,\nbody .pz-game-wrapper .hive-cell .cell-fill {\n  fill: var(--area-bg-color);\n}\nbody[data-sba-theme=dark] .sb-message {\n  background: var(--area-bg-color);\n}\nbody[data-sba-theme=dark] .hive-action__shuffle {\n  position: relative;\n}\nbody[data-sba-theme=dark] .sb-progress-value {\n  font-weight: bold;\n}\nbody[data-sba-theme=dark] .sb-toggle-icon,\nbody[data-sba-theme=dark] .sb-kebob .sb-bob-arrow,\nbody[data-sba-theme=dark] .hive-action__shuffle {\n  background-position: -1000px;\n}\nbody[data-sba-theme=dark] .sb-toggle-icon:after,\nbody[data-sba-theme=dark] .sb-kebob .sb-bob-arrow:after,\nbody[data-sba-theme=dark] .hive-action__shuffle:after {\n  content: \"\";\n  opacity: 0.85;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  position: absolute;\n  z-index: 0;\n  filter: invert(1);\n  background-image: inherit;\n  background-repeat: inherit;\n  background-position: center;\n  background-size: inherit;\n}\n\n#js-logo-nav rect {\n  fill: var(--body-bg-color);\n}\n#js-logo-nav path {\n  fill: var(--text-color);\n}\n\n.pz-moment__loading {\n  color: black;\n}\n\n.pz-nav__hamburger-inner,\n.pz-nav__hamburger-inner::before,\n.pz-nav__hamburger-inner::after {\n  background-color: var(--text-color);\n}\n\n.pz-nav {\n  width: 100%;\n  background: var(--body-bg-color);\n}\n\n.pz-modal__button.white,\n.pz-footer,\n.pz-moment,\n.sb-modal-scrim {\n  background: var(--modal-bg-color) !important;\n  color: var(--text-color) !important;\n}\n.pz-modal__button.white .pz-moment__button.secondary,\n.pz-footer .pz-moment__button.secondary,\n.pz-moment .pz-moment__button.secondary,\n.sb-modal-scrim .pz-moment__button.secondary {\n  color: white;\n}\n\n.sb-modal-wrapper .sb-modal-frame {\n  border: 1px solid var(--border-color);\n  background: var(--body-bg-color);\n  color: var(--text-color);\n}\n.sb-modal-wrapper .pz-modal__title,\n.sb-modal-wrapper .sb-modal-close {\n  color: var(--text-color);\n}\n\n.pz-moment__close::before, .pz-moment__close::after {\n  background: var(--text-color);\n}\n\n.pz-modal__button.white:hover {\n  background: var(--area-bg-color);\n}\n\n.sb-input-invalid {\n  color: var(--invalid-color);\n}\n\n.sb-toggle-expand {\n  box-shadow: none;\n}\n\n.sb-input-bright,\n.sb-progress-dot.completed::after {\n  color: var(--highlight-bg-color);\n}\n\n.cell-fill {\n  stroke: var(--body-bg-color);\n}\n\n.cell-letter {\n  fill: var(--text-color);\n}\n\n.hive-cell.center .cell-letter {\n  fill: var(--highhlight-text-color);\n}\n\n.hive-action {\n  background-color: var(--body-bg-color);\n  color: var(--text-color);\n}\n.hive-action.push-active {\n  background: var(--menu-hover-color);\n}\n\n[data-sba-theme] .sb-modal-wordlist-items li,\n.sb-wordlist-items-pag > li,\n.pz-ad-box,\n.pz-game-toolbar,\n.pz-spelling-bee-wordlist,\n.hive-action,\n.sb-wordlist-box,\n.sb-message {\n  border-color: var(--border-color);\n}\n\n.sb-toggle-expand {\n  background: var(--body-bg-color);\n}\n\n.sb-progress-line,\n.sb-progress-dot::after,\n.pz-nav::after {\n  background: var(--border-color);\n}\n\n.sb-bob {\n  background-color: var(--border-color);\n}\n.sb-bob.active {\n  background-color: var(--text-color);\n}\n\n/**\n *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle\n * \n *  Copyright (C) 2020  Dieter Raber\n *  https://www.gnu.org/licenses/gpl-3.0.en.html\n */\n.sba {\n  background: var(--body-bg-color);\n  border-radius: 6px;\n  border-style: solid;\n  border-width: 1px;\n}\n.sba *:focus {\n  outline: 0;\n}\n.sba ::selection {\n  background: transparent;\n}\n.sba details {\n  font-size: 90%;\n  margin-bottom: 1px;\n}\n.sba summary {\n  font-size: 13px;\n  line-height: 20px;\n  padding: 1px 6px 0 6px;\n  background: var(--area-bg-color);\n  color: var(--text-color);\n  cursor: pointer;\n  position: relative;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  border: 1px solid var(--border-color);\n}\n\n[data-ui].inactive {\n  display: none;\n}\n\n.sba-data-pane {\n  border: 1px solid var(--border-color);\n  width: 100%;\n  font-size: 85%;\n  margin-bottom: 2px;\n  border-collapse: collapse;\n  table-layout: fixed;\n  border-top: none;\n}\n.sba-data-pane[data-cols=\"3\"] :is(th, td) {\n  width: 33.3333333333%;\n}\n.sba-data-pane[data-cols=\"4\"] :is(th, td) {\n  width: 25%;\n}\n.sba-data-pane[data-cols=\"5\"] :is(th, td) {\n  width: 20%;\n}\n.sba-data-pane[data-cols=\"6\"] :is(th, td) {\n  width: 16.6666666667%;\n}\n.sba-data-pane[data-cols=\"7\"] :is(th, td) {\n  width: 14.2857142857%;\n}\n.sba-data-pane[data-cols=\"8\"] :is(th, td) {\n  width: 12.5%;\n}\n.sba-data-pane[data-cols=\"9\"] :is(th, td) {\n  width: 11.1111111111%;\n}\n.sba-data-pane[data-cols=\"10\"] :is(th, td) {\n  width: 10%;\n}\n.sba-data-pane th {\n  text-transform: uppercase;\n  background: var(--head-row-bg-color);\n}\n.sba-data-pane .sba-preeminent {\n  font-weight: bold;\n  border-bottom: 2px solid var(--highlight-bg-color) !important;\n}\n.sba-data-pane .sba-completed td,\n.sba-data-pane td.sba-completed {\n  color: var(--invalid-color);\n  font-weight: normal;\n}\n.sba-data-pane .sba-hidden {\n  display: none;\n}\n.sba-data-pane :is(th, td) {\n  border: 1px solid var(--border-color);\n  border-top: none;\n  white-space: nowrap;\n  text-align: center;\n  padding: 3px 2px;\n}\n.sba-data-pane th {\n  background-color: var(--head-row-bg-color);\n}\n\n[data-ui=community] h4 {\n  font-weight: 700;\n  font-family: nyt-franklin;\n  font-size: 18px;\n  margin: 0 0 1px 0;\n}\n[data-ui=community] p {\n  margin: 0 0 2px 0;\n  font-size: 16px;\n}\n[data-ui=community] em {\n  display: block;\n  font-weight: normal;\n  font-weight: 500;\n  font-size: 14px;\n  font-family: nyt-franklin;\n}\n[data-ui=community] li {\n  margin: 0 0 12px 0;\n}\n[data-ui=community] li ul {\n  padding-left: 20px;\n  list-style: disc;\n}\n[data-ui=community] li ul li {\n  margin: 0;\n}\n[data-ui=community] li ul li a {\n  color: var(--link-color);\n}\n[data-ui=community] li ul li a:hover {\n  color: var(--link-hover-color);\n}\n[data-ui=community] .sb-modal-body {\n  margin-top: 0;\n  padding-bottom: 10px;\n}\n\n[data-ui=yourProgress] b {\n  font-weight: 700;\n}\n[data-ui=yourProgress] .sba-data-pane {\n  margin-left: 5px;\n  max-width: 300px;\n  border: none;\n}\n[data-ui=yourProgress] .sba-data-pane tr.sba-completed td {\n  color: var(--text-color);\n}\n[data-ui=yourProgress] .sba-data-pane tr td {\n  border: none;\n  text-align: left;\n  line-height: 1.8;\n}\n[data-ui=yourProgress] .sba-data-pane tr td:nth-child(n+2) {\n  text-align: right;\n  width: 80px;\n}\n[data-ui=yourProgress] .sba-data-pane tr td:nth-child(2)::after {\n  content: \" pts.\";\n}\n[data-ui=yourProgress] .sba-data-pane tr td:last-child::after {\n  content: \"%\";\n}\n\n[data-ui=header] {\n  font-weight: bold;\n  line-height: 32px;\n  flex-grow: 2;\n  text-indent: 1px;\n}\n\n[data-ui=progressBar] {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 100%;\n  border-radius: 0;\n  margin: 0;\n  height: 6px;\n  padding: 0;\n  background: transparent;\n  display: block;\n  border: none;\n  border-bottom: 1px var(--border-color) solid;\n}\n[data-ui=progressBar]::-webkit-progress-bar {\n  background-color: transparent;\n}\n[data-ui=progressBar]::-webkit-progress-value {\n  background-color: var(--highlight-bg-color);\n  height: 4px;\n}\n[data-ui=progressBar]::-moz-progress-bar {\n  background-color: var(--highlight-bg-color);\n}\n\n[data-ui=spillTheBeans] {\n  text-align: center;\n  padding: 14px 0;\n  font-size: 38px;\n  margin-top: -24px;\n}\n\n[data-ui=menu] {\n  position: relative;\n  z-index: 1;\n}\n[data-ui=menu] .pane {\n  color: var(--text-color);\n  background: var(--body-bg-color);\n  border: 1px var(--border-color) solid;\n  padding: 5px;\n}\n[data-ui=menu] li {\n  position: relative;\n  line-height: 1.8;\n  white-space: nowrap;\n  cursor: pointer;\n  overflow: hidden;\n  display: block;\n  padding: 5px 9px 5px 28px;\n  font-size: 14px;\n}\n[data-ui=menu] li::before, [data-ui=menu] li::after {\n  position: absolute;\n  display: block;\n}\n[data-ui=menu] li[data-icon=checkmark].checked::after {\n  content: \"✔\";\n  color: var(--highlight-bg-color);\n  top: 3px;\n  left: 7px;\n  font-size: 16px;\n}\n[data-ui=menu] li[data-icon=warning]::before {\n  content: \"\";\n  background: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyLjAwNiAyLjI1NWwxMS4yNTUgMTkuNDlILjc1NXoiIGZpbGw9IiNmOGNkMDUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTMuNDQxIDkuMDAybC0uMzE3IDcuMzA2aC0yLjI0N2wtLjMxNy03LjMwNnptLS4wNDggMTAuMjYyaC0yLjc4NXYtMS44MmgyLjc4NXoiLz48L3N2Zz4=) center center/contain no-repeat;\n  left: 3px;\n  top: 6px;\n  width: 20px;\n  height: 20px;\n}\n[data-ui=menu] li[data-target=darkModeColors], [data-ui=menu] li[data-icon=sba] {\n  border-top: 1px solid var(--border-color);\n}\n[data-ui=menu] li[data-icon=sba] {\n  color: currentColor;\n}\n[data-ui=menu] li[data-icon=sba]::before {\n  content: \"\";\n  background: url(data:image/webp;base64,UklGRkYCAABXRUJQVlA4WAoAAAAQAAAAFwAAFwAAQUxQSLgAAAABgFpt2/LmVbGJI8u8QgaIZSxqxgEYFTM7VMzMNEBPB2gVcx/xff/7/4UBImIC6F+16CWBxZsmlmH+9a7HROR4BxDmdADArZOOAKCdsyTgOguxkFMokb/oObTDyRBbN/kk+yoitfMAvr/xVevlJa5eoNzKaQN/S6dQC/Eb+PwScCQLQv1crKykJnqiAd5X9y46SrVYJXFQg5CERlSVk2LlF+s1n5iu/geF+14r8Y2x+ompsdqokf4uVlA4IGgBAABwBwCdASoYABgAPpE+m0kloyKhKAqosBIJbAAjwDeRZaSiFfn3Zr1QP9Ud0ADEskPPzxJU2pre8kHbnjqgPRfZb8zq4AD9IaAZD2vQgXhhU4vU6iI9307byI0qRvcdYUVqITfvs+c25tJHp68Tb8QbbjuwTz0j+xXnVHcdq1O53Cem6tFr6zIo8VPHzofJrvlKQnvp1W5bdpH3HE+2rDOikrPkzD5qdR91khmLUr2/65qN81K7n/5Ztjb/URQJxilNBdj/22TMy3S5+24re6Kkfvbzc9n/kNAlBuAaKYxSAgHTAELvJElqGMJ9psshwQ9Hinh1y4MVKzbf8UDf/8aFRjwHnN+c4w1Zb8LpKYQTgVuzyDsB7crn5PhK9sLJaU7CApsBz7CTzw1L6VpU0HoDsNv54wX6rtilmqIwjJzvnBL5H2aH/M7tuhCNyahJ+EDMv/cyE4Kqn918j7n693a1ovztxeo8AAA=) center center/contain no-repeat;\n  left: 5px;\n  top: 6px;\n  width: 20px;\n  height: 20px;\n}\n[data-ui=menu] li[data-icon=sba]:hover {\n  color: var(--link-hover-color);\n  text-decoration: underline;\n}\n\n.sba-color-selector {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n}\n.sba-color-selector svg {\n  width: 120px;\n  height: 120px;\n  display: block;\n}\n\n[data-ui=darkModeColors] .hive {\n  width: auto;\n  padding: 0;\n  flex-grow: 2;\n  display: flex;\n}\n[data-ui=darkModeColors] .hive-cell {\n  position: static;\n  margin: auto;\n  border: 1px solid var(--border-color);\n  padding: 20px;\n  width: 168px;\n  height: 100%;\n  border-radius: 6px;\n}\n[data-ui=darkModeColors] .cell-letter {\n  font-size: 8px;\n  font-weight: 600;\n}\n\n.sba-swatches {\n  display: flex;\n  flex-wrap: wrap;\n  list-style: none;\n  justify-content: space-around;\n  padding: 0;\n  width: 220px;\n}\n.sba-swatches li {\n  position: relative;\n  overflow: hidden;\n  margin-bottom: 5px;\n}\n.sba-swatches label {\n  border: 1px var(--border-color) solid;\n  display: block;\n  width: 50px;\n  height: 50px;\n  overflow: hidden;\n  cursor: pointer;\n}\n.sba-swatches input {\n  position: absolute;\n  left: -100px;\n}\n.sba-swatches input:checked ~ label {\n  border-color: var(--highlight-bg-color);\n}\n\n.sba-googlified .sb-anagram {\n  cursor: pointer;\n}\n.sba-googlified .sb-anagram:hover {\n  text-decoration: underline;\n  color: var(--link-hover-color);\n}\n\n#portal-game-toolbar [role=presentation]::selection {\n  background: transparent;\n}\n\n[data-sba-theme] .sb-modal-wordlist-items li .check.checked {\n  border: none;\n  height: auto;\n  transform: none;\n}\n[data-sba-theme] .sb-modal-wordlist-items li .check.checked::after {\n  position: relative;\n  content: \"✔\";\n  color: var(--highlight-bg-color);\n  top: 4px;\n  font-size: 16px;\n}\n[data-sba-theme] .sb-modal-header .sb-modal-letters {\n  position: relative;\n  top: -5px;\n}\n\n.pz-toolbar-button:hover,\n[data-ui=menu] li:hover {\n  background: var(--menu-hover-color);\n  color: var(--text-color);\n}\n.pz-toolbar-button::selection,\n[data-ui=menu] li::selection {\n  background-color: transparent;\n}\n\n[data-ui=grid] table {\n  border-top: 1px solid var(--border-color);\n}\n[data-ui=grid] tbody tr:last-child td {\n  font-weight: bold;\n}\n[data-ui=grid] tbody tr td {\n  padding: 5px 0 !important;\n}\n[data-ui=grid] tbody tr td:last-of-type {\n  font-weight: bold;\n}\n\n.pz-desktop .sba details[open] summary:before {\n  transform: rotate(-90deg);\n  left: 10px;\n  top: 1px;\n}\n.pz-desktop .sba summary {\n  list-style: none;\n  padding: 1px 15px 0 21px;\n}\n.pz-desktop .sba summary::marker {\n  display: none;\n}\n.pz-desktop .sba summary:before {\n  content: \"❯\";\n  font-size: 9px;\n  position: absolute;\n  display: inline-block;\n  transform: rotate(90deg);\n  transform-origin: center;\n  left: 7px;\n  top: 0;\n}\n\n[data-sba-theme] :is(.sb-wordlist-items-pag, .sb-modal-wordlist-items) > li.sba-pangram {\n  font-weight: 700;\n  border-bottom: 2px var(--highlight-bg-color) solid;\n}\n[data-sba-theme] .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer {\n  text-align: right;\n  font-size: 13px;\n  border-top: 1px solid var(--border-color);\n  padding: 10px 10px 0 10px;\n}\n\n.sb-modal-frame .sb-modal-content::after {\n  background: linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%);\n}\n\n/**\n *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle\n * \n *  Copyright (C) 2020  Dieter Raber\n *  https://www.gnu.org/licenses/gpl-3.0.en.html\n */\n[data-sba-active=true] {\n  --sba-game-offset: 12px;\n  --sba-app-width: 100px;\n  --sba-app-padding: 0;\n  --sba-app-margin: 0;\n  --sba-mobile-threshold: 900px;\n  --sba-game-base-width: 1280px;\n  --sba-game-width: calc(var(--sba-game-base-width) - (2 * var(--sba-game-offset)));\n}\n[data-sba-active=true][data-sba-sidebar=true] {\n  --sba-game-base-width: 1450px;\n}\n\n.sba-container {\n  display: none;\n}\n\n[data-ui=sidebar] .sb-modal-title,\n[data-ui=sidebar] .sba-modal-footer {\n  display: none;\n}\n[data-ui=sidebar] .sb-modal-header,\n[data-ui=sidebar] .sb-modal-body {\n  padding: 0 var(--sba-game-offset) !important;\n}\n\n.sba {\n  box-sizing: border-box;\n}\n.sba[data-ui=sbaApp] {\n  width: var(--sba-app-width);\n  margin: var(--sba-app-margin);\n  padding: var(--sba-app-padding);\n}\n.sba[data-ui=sidebar] {\n  margin: var(--sba-game-offset);\n  width: 400px;\n}\n.sba *,\n.sba *:before,\n.sba *:after {\n  box-sizing: border-box;\n}\n\n[data-ui=menu] .pane {\n  position: absolute;\n  top: 0;\n  right: -10000px;\n}\n\n[data-sba-submenu=true] [data-ui=sbaApp] {\n  position: relative;\n  left: -167px;\n  top: -175px;\n}\n[data-sba-submenu=true] .pz-game-toolbar {\n  position: relative;\n  z-index: 4;\n}\n[data-sba-submenu=true] [data-ui=menu] .pane {\n  right: -16px;\n  top: 49px;\n}\n[data-sba-submenu=true] [data-ui=sbaApp] {\n  left: -163px;\n  top: 0;\n}\n[data-sba-submenu=true].pz-desktop .pane {\n  right: -16px;\n  top: 55px;\n}\n\n[data-sba-active=true] .sba-container {\n  display: block;\n  position: absolute;\n  top: 50%;\n  transform: translate(0, -50%);\n  right: var(--sba-game-offset);\n  z-index: 1;\n}\n[data-sba-active=true] .sba {\n  border-color: transparent;\n}\n[data-sba-active=true] [data-ui=header] {\n  display: none;\n}\n[data-sba-active=true][data-sba-submenu=true] .sba-container {\n  top: 0;\n  height: 0;\n}\n[data-sba-active=true] .sb-expanded .sba-container {\n  visibility: hidden;\n  pointer-events: none;\n}\n[data-sba-active=true] .sb-content-box {\n  max-width: var(--sba-game-width);\n  justify-content: space-between;\n  position: relative;\n}\n[data-sba-active=true] .sb-controls-box {\n  max-width: calc(100vw - var(--sba-app-width));\n}\n\n@media (max-width: 370px) {\n  [data-sba-active=true] .sb-hive {\n    width: 70%;\n  }\n  [data-sba-active=true].pz-spelling-bee-wordlist .hive-action:not(.hive-action__shuffle) {\n    font-size: 0.9em;\n    margin: 0 4px 8px;\n    padding: 23px 0;\n  }\n  [data-sba-active=true] .hive-action:not(.hive-action__shuffle) {\n    width: 71px;\n    min-width: auto;\n  }\n}\n[data-sba-active] .pz-game-toolbar .pz-row {\n  padding: 0;\n}\n\n@media (min-width: 516px) {\n  [data-sba-active] .pz-game-toolbar .pz-row {\n    padding: 0 12px;\n  }\n  [data-sba-active].pz-desktop [data-ui=sbaApp] {\n    left: -175px;\n  }\n\n  [data-ui=score] .sba-data-pane tbody th {\n    text-transform: none;\n    width: 31%;\n  }\n  [data-ui=score] .sba-data-pane tbody td {\n    width: 23%;\n  }\n  [data-ui=score] .sba-data-pane tbody tr:nth-child(1) th::after {\n    content: \"ords\";\n  }\n  [data-ui=score] .sba-data-pane tbody tr:nth-child(2) th::after {\n    content: \"oints\";\n  }\n  [data-ui=score] .sba-data-pane thead th {\n    width: 23%;\n  }\n  [data-ui=score] .sba-data-pane thead th:first-of-type {\n    width: 31%;\n  }\n\n  [data-sba-active=true] {\n    --sba-app-width: 138px;\n    --sba-app-padding: 0 5px 5px;\n  }\n  [data-sba-active=true] .sba {\n    border-color: var(--border-color);\n  }\n  [data-sba-active=true] [data-ui=header] {\n    display: block;\n  }\n}\n@media (min-width: 900px) {\n  [data-sba-submenu=true].pz-desktop [data-ui=menu] .pane {\n    right: 0;\n    top: 55px;\n  }\n\n  [data-sba-active=true] {\n    --sba-app-width: 160px;\n    --sba-app-padding: 0 8px 8px;\n    --sba-app-margin: 66px 0 0 0;\n  }\n  [data-sba-active=true] .sb-content-box {\n    padding: 0 var(--sba-game-offset);\n  }\n  [data-sba-active=true] .sb-controls-box {\n    max-width: none;\n  }\n  [data-sba-active=true] .sba-container {\n    position: static;\n    transform: none;\n  }\n  [data-sba-active=true] .sb-expanded .sba-container {\n    z-index: 1;\n  }\n  [data-sba-active=true][data-sba-submenu=true] [data-ui=sbaApp] {\n    top: -66px;\n  }\n  [data-sba-active=true].pz-desktop [data-ui=sbaApp] {\n    left: -191px;\n  }\n}\n@media (min-width: 1298px) {\n  [data-sba-active=true][data-sba-submenu=true] [data-ui=sbaApp] {\n    left: -179px;\n  }\n}\n@media (min-width: 768px) {\n  [data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-body {\n    padding-right: 56px;\n  }\n  [data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-header {\n    padding-right: 56px;\n  }\n  [data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer {\n    text-align: right;\n    border-top: 1px solid var(--border-color);\n    padding-top: 10px;\n    width: calc(100% - 112px);\n    margin: -8px auto 15px;\n  }\n}";

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

    class Menu extends Plugin {
        getTarget() {
            return this.app.envIs('mobile') ? el.$('#js-mobile-toolbar') : el.$('#portal-game-toolbar > div:last-of-type');
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
        constructor(app) {
            super(app, 'Menu', '');
            this.target = this.getTarget();
            const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];
            this.app.domSet('submenu', false);
            const pane = el.ul({
                classNames: ['pane'],
                data: {
                    ui: 'submenu'
                },
                events: {
                    pointerup: evt => {
                        const entry = evt.target.closest('li');
                        if (!entry || evt.button !== 0) {
                            return false;
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
                            case 'panel':
                                this.app.domSet('submenu', false);
                                const stage = this.app.domGet('sidebar') ? 'sidebar' : 'popup';
                                component.display(this.app.plugins.get(stage));
                                break;
                            default:
                                setTimeout(() => {
                                    this.app.domSet('submenu', false);
                                }, 60);
                        }
                    }
                },
                content: el.li({
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
            this.ui = el.div({
                events: {
                    pointerup: evt => {
                        if (!evt.target.dataset.action) {
                            this.app.domSet('submenu', !this.app.domGet('submenu'));
                        }
                    }
                },
                content: [
                    settings$1.get('title'),
                    pane
                ],
                attributes: {
                    role: 'presentation'
                },
                classNames
            });
            document.addEventListener('keyup', evt => {
                if (this.app.domGet('submenu') === true && /^(Ent|Esc|Key|Dig)/.test(evt.code)) {
                    this.app.domSet('submenu', false);
                }
            });
            el.$('#pz-game-root').addEventListener('pointerdown', () => {
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
                    pane.append(el.li({
                        classNames: action === 'boolean' && plugin.getState() ? ['checked'] : [],
                        attributes: {
                            title: plugin.description
                        },
                        data: {
                            component: key,
                            icon: action === 'boolean' ? 'checkmark' : (plugin.menuIcon || null),
                            action
                        },
                        content: plugin.title
                    }));
                });
                pane.append(el.li({
                    attributes: {
                        title: settings$1.get('label') + ' Website'
                    },
                    data: {
                        icon: prefix(),
                        component: prefix('web'),
                        action: 'link'
                    },
                    content: el.a({
                        content: settings$1.get('label'),
                        attributes: {
                            href: settings$1.get('url'),
                            target: prefix()
                        }
                    })
                }));
            });
            app.on(prefix('destroy'), () => this.ui.remove());
        }
    }

    class Grid extends TablePane {
    	display(target) {
    		this.panel
    			.setContent('subtitle', this.description)
    			.setContent('body', this.getPane());
    		target.display(this.panel);
    		return this;
    	}
    	run(evt) {
    		super.run(evt);
    		const rows = el.$$('tr', this.pane);
    		const rCnt = rows.length;
    		rows.forEach((row, rInd) => {
    			if(rCnt === rInd - 1) {
    				return false;
    			}
    			const cells = el.$$('td', row);
    			const cCnt = cells.length;
    			cells.forEach((cell, cInd) => {
    				const cellArr = cell.textContent.trim().split('/');
    				if(cInd < cCnt -1 && cellArr.length === 2 && cellArr[0] === cellArr[1]){
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
    		this.panel = new Panel(this.app, this.key)
    			.setContent('title', this.title);
    		this.menuAction = 'panel';
    		this.menuIcon = 'null';
    	}
    }

    class SideBar extends Plugin {
         display(panel) {
            this.panel = panel;
            const slot = el.$(`[data-panel="${panel.key}"]`);
            slot.append(panel.ui);
            slot.dispatchEvent(new Event('toggle'));
            return this;
        }
        add() {
            if(screen.width < this.targetMinWidth) {
                return false;
            }
            this.app.domSet('sidebar', this.getState());
            return super.add();
        }
        toggle(state) {
            this.app.domSet('sidebar', state);
            return super.toggle(state)
        }
        constructor(app) {
            super(app, 'Sidebar', 'Uses sidebar instead of modals', {
                canChangeState: true,
                addMethod: 'prepend'
            });
            this.targetMinWidth = 1450;
            this.ui = el.div({
                classNames: [prefix(), prefix('sidebar', 'd')]
            });
            this.target = this.app.target;
            const closeOthers = evt => {
                if (evt.target.open) {
                    el.$$('details', this.ui).forEach(details => {
                        if(!details.isSameNode(evt.target)){
                            details.open = false;
                        }
                    });
                }
            };
            app.on(prefix('pluginsReady'), evt => {
                evt.detail.forEach(plugin => {
                    if (!plugin.canChangeState || plugin === this) {
                        return false;
                    }
                    if(plugin.menuAction && plugin.menuAction === 'panel'){
                        this.ui.append(el.details({
                            data: {
                                panel: plugin.key
                            },
                            events: {
                                toggle: evt => closeOthers(evt)
                            },
                            content: [
                                el.summary({
                                    content: plugin.title
                                })
                            ]
                        }));
                    }
                });
            });
            this.toggle(this.getState());
        }
    }

    class Popup extends Plugin {
        enableKeyClose() {
            document.addEventListener('keyup', evt => {
                this.app.popupCloser = this.getCloseButton();
                if (this.app.popupCloser && evt.code === 'Escape') {
                    this.app.popupCloser.click();
                }
                delete(this.app.popupCloser);
            });
            return this;
        }
        buildUi() {
            this.panelHolder = el.div({
                classNames: [prefix('panel-holder', 'd')],
            });
            return el.div({
                classNames: ['sb-modal-frame', prefix('pop-up', 'd')],
                attributes: {
                    role: 'button'
                },
                events: {
                    click: e => {
                        e.stopPropagation();
                    }
                },
                content: [
                    el.div({
                        classNames: ['sb-modal-top'],
                        content: el.div({
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
                    }),
                    this.panelHolder
                ]
            });
        }
        display(panel) {
            this.panel = panel;
            this.panelHolder.append(panel.ui);
            this.toggle(true);
            return this;
        }
        getCloseButton() {
            for (let selector of ['.pz-moment__frame.on-stage .pz-moment__close', '.sb-modal-close']) {
                const closer = el.$(selector, this.app.gameWrapper);
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
            } else {
                this.target.append(this.ui);
                this.panel.reset();
                this.modalSystem.classList.remove('sb-modal-open');
            }
            return this;
        }
        constructor(app) {
            super(app, 'popup');
            this.state = false;
            this.modalSystem = this.app.modalWrapper.closest('.sb-modal-system');
            this.target = this.app.componentContainer;
            this.ui = this.buildUi();
            this.enableKeyClose();
        }
    }

    const getPlugins = () => {
        return {
            Header,
            Score,
            LetterCount,
            FirstLetter,
            Pangrams,
            ProgressBar,
            SpillTheBeans,
            DarkMode,
            PangramHl,
            Googlify,
            Styles,
            Menu,
            Grid,
            YourProgress,
            Community,
            ColorConfig,
            SideBar,
            Popup,
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
            if (typeof document.body.dataset[prefix(key)] === 'undefined') {
                return false;
            }
            return JSON.parse(document.body.dataset[prefix(key)]);
        }
        getSyncData() {
            let sync = localStorage.getItem('sb-today');
            if (!sync) {
                return [];
            }
            sync = JSON.parse(sync);
            return sync.words || [];
        }
        envIs(env) {
            return document.body.classList.contains('pz-' + env);
        }
        buildComponentContainer() {
            this.componentContainer = el.template({
                data: {
                    ui: prefix('component-container', 'd')
                }
            });
            document.body.append(this.componentContainer);
        }
        load() {
            el.waitFor('.sb-wordlist-items-pag', this.gameWrapper)
                .then(resultList => {
                    this.observer = this.buildObserver();
                    data.init(this, this.getSyncData());
                    this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
                    this.resultList = resultList;
                    this.target = el.$('.sb-content-box', this.gameWrapper);
                    this.buildComponentContainer();
                    this.add();
                    this.domSet('active', true);
                    this.registerPlugins();
                    this.trigger(prefix('refreshUi'));
                    document.dispatchEvent(new Event(prefix('ready')));
                    if (this.envIs('desktop')) {
                        window.scrollTo(0, 472);
                    }
                });
        }
        getState() {
            return this.domGet('active');
        }
        toggle(state) {
            this.domSet('active', state);
            return this;
        }
        buildObserver() {
            const observer = new MutationObserver(mutationList => {
                mutationList.forEach(mutation => {
                    if (!(mutation.target instanceof HTMLElement)) {
                        return false;
                    }
                    switch (true) {
                        case mutation.type === 'childList' &&
                        mutation.target.isSameNode(this.modalWrapper):
                            if (el.$('.sb-modal-frame.yesterday', mutation.target)) {
                                this.trigger(prefix('yesterday'), mutation.target);
                            }
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
            const args = {
                target: this.gameWrapper,
                options: {
                    childList: true,
                    subtree: true,
                    attributes: true
                }
            };
            observer.observe(args.target, args.options);
            return observer;
        }
        buildUi() {
            const events = {};
            events[prefix('destroy')] = () => {
                this.observer.disconnect();
                this.container.remove();
                this.domUnset('theme');
            };
            const classNames = [settings$1.get('prefix')];
            return el.div({
                data: {
                    ui: this.key,
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
            this.target.prepend(this.container);
        }
        constructor(gameWrapper) {
            super(settings$1.get('label'), {
                canChangeState: true,
                key: prefix('app'),
            });
            const oldInstance = el.$(`[data-ui="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix('destroy')));
            }
            this.gameWrapper = gameWrapper;
            this.container = el.div({
                classNames: [prefix('container', 'd')]
            });
            this.ui = this.buildUi();
            this.container.append(this.ui);
            this.load();
        }
    }

    new App(el.$('#js-hook-game-wrapper'));

}());
