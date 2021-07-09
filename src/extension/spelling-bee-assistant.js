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

    var version = "4.0.0";

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

    class Popup {
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
            return el.div({
                classNames: ['sb-modal-frame', prefix('pop-up', 'd')],
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
                        })
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
        getCloseButton() {
            for(let selector of ['.pz-moment__frame.on-stage .pz-moment__close', '.sb-modal-close']) {
                const closer = el.$(selector, this.app.gameWrapper);
                if(closer) {
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
                this.getTarget().append(this.ui);
                this.modalSystem.classList.remove('sb-modal-open');
            }
            return this;
        }
        constructor(app, key) {
            this.key = key;
            this.app = app;
            this.state = false;
            this.modalSystem = this.app.modalWrapper.closest('.sb-modal-system');
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
            this.ui = this.create();
            this.enableKeyClose();
            this.getTarget().append(this.ui);
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
        display() {
            this.popup.toggle(true);
            el.$('input:checked', this.popup.ui).focus();
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
            this.menuIcon = 'null';
            this.popup = new Popup(this.app, this.key)
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
            this.popup.ui.dataset[prefix('theme')] = 'dark';
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
        display() {
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
            this.popup
                .setContent('subtitle', el.span({
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

    class TodaysAnswers extends Plugin {
    	display() {
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
    		this.popup
    			.setContent('body', [
    				el.div({
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
    			.setContent('subtitle', data.getDate());
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

    var css = "[data-sba-theme]{--dhue: 0;--dsat: 0%;--link-hue: 206;--shadow-light-color: hsl(49, 96%, 50%, 0.35);--shadow-dark-color: hsl(49, 96%, 50%, 0.7);--highlight-text-color: hsl(0, 0%, 0%)}[data-sba-theme=light]{--highlight-bg-color:#f7db22;--text-color:#000;--site-text-color:rgba(0,0,0,.9);--body-bg-color:#fff;--modal-bg-color:rgba(255,255,255,.85);--border-color:#dbdbdb;--area-bg-color:#e6e6e6;--invalid-color:#adadad;--menu-hover-color:#f5f5f5;--head-row-bg-color:#f5f5f5;--card-color:rgba(247,219,34,.1);--link-color:hsl(var(--link-hue), 45%, 38%);--link-visited-color:hsl(var(--link-hue), 45%, 53%);--link-hover-color:hsl(var(--link-hue), 45%, 53%);--success-color:#2ca61c}[data-sba-theme=dark]{--highlight-bg-color:#facd05;--text-color:hsl(var(--dhue), var(--dsat), 85%);--site-text-color:hsl(var(--dhue), var(--dsat), 100%, 0.9);--body-bg-color:hsl(var(--dhue), var(--dsat), 7%);--modal-bg-color:hsl(var(--dhue), var(--dsat), 7%, 0.85);--border-color:hsl(var(--dhue), var(--dsat), 20%);--area-bg-color:hsl(var(--dhue), var(--dsat), 22%);--invalid-color:hsl(var(--dhue), var(--dsat), 50%);--menu-hover-color:hsl(var(--dhue), var(--dsat), 22%);--head-row-bg-color:hsl(var(--dhue), var(--dsat), 13%);--card-color:hsl(var(--dhue), var(--dsat), 22%);--link-color:hsl(var(--link-hue), 90%, 64%);--link-visited-color:hsl(var(--link-hue), 90%, 76%);--link-hover-color:hsl(var(--link-hue), 90%, 76%);--success-color:#64f651}body{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-field{background:var(--body-bg-color);color:var(--text-color)}body .pz-game-wrapper{background:var(--body-bg-color) !important;color:var(--text-color)}body .pz-game-wrapper .sb-modal-message a{color:var(--link-color)}body .pz-game-wrapper .sb-modal-message a:visited{color:var(--link-visited-color)}body .pz-game-wrapper .sb-modal-message a:hover{color:var(--link-hover-color)}body .pz-game-wrapper .sb-progress-marker .sb-progress-value,body .pz-game-wrapper .hive-cell:first-child .cell-fill{background:var(--highlight-bg-color);fill:var(--highlight-bg-color);color:var(--highlight-text-color)}body .pz-game-wrapper .sba-color-selector .hive .hive-cell .cell-fill,body .pz-game-wrapper .hive-cell .cell-fill{fill:var(--area-bg-color)}body[data-sba-theme=dark] .sb-message{background:var(--area-bg-color)}body[data-sba-theme=dark] .hive-action__shuffle{position:relative}body[data-sba-theme=dark] .sb-progress-value{font-weight:bold}body[data-sba-theme=dark] .sb-toggle-icon,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow,body[data-sba-theme=dark] .hive-action__shuffle{background-position:-1000px}body[data-sba-theme=dark] .sb-toggle-icon:after,body[data-sba-theme=dark] .sb-kebob .sb-bob-arrow:after,body[data-sba-theme=dark] .hive-action__shuffle:after{content:\"\";opacity:.85;top:0;left:0;bottom:0;right:0;position:absolute;z-index:0;filter:invert(1);background-image:inherit;background-repeat:inherit;background-position:center;background-size:inherit}#js-logo-nav rect{fill:var(--body-bg-color)}#js-logo-nav path{fill:var(--text-color)}.pz-moment__loading{color:#000}.pz-nav__hamburger-inner,.pz-nav__hamburger-inner::before,.pz-nav__hamburger-inner::after{background-color:var(--text-color)}.pz-nav{width:100%;background:var(--body-bg-color)}.pz-modal__button.white,.pz-footer,.pz-moment,.sb-modal-scrim{background:var(--modal-bg-color) !important;color:var(--text-color) !important}.pz-modal__button.white .pz-moment__button.secondary,.pz-footer .pz-moment__button.secondary,.pz-moment .pz-moment__button.secondary,.sb-modal-scrim .pz-moment__button.secondary{color:#fff}.sb-modal-wrapper .sb-modal-frame{border:1px solid var(--border-color);background:var(--body-bg-color);color:var(--text-color)}.sb-modal-wrapper .pz-modal__title,.sb-modal-wrapper .sb-modal-close{color:var(--text-color)}.pz-moment__close::before,.pz-moment__close::after{background:var(--text-color)}.pz-modal__button.white:hover{background:var(--area-bg-color)}.sb-input-invalid{color:var(--invalid-color)}.sb-toggle-expand{box-shadow:none}.sb-input-bright,.sb-progress-dot.completed::after{color:var(--highlight-bg-color)}.cell-fill{stroke:var(--body-bg-color)}.cell-letter{fill:var(--text-color)}.hive-cell.center .cell-letter{fill:var(--highhlight-text-color)}.hive-action{background-color:var(--body-bg-color);color:var(--text-color)}.hive-action.push-active{background:var(--menu-hover-color)}[data-sba-theme] .sb-modal-wordlist-items li,.sb-wordlist-items-pag>li,.pz-ad-box,.pz-game-toolbar,.pz-spelling-bee-wordlist,.hive-action,.sb-wordlist-box,.sb-message{border-color:var(--border-color)}.sb-toggle-expand{background:var(--body-bg-color)}.sb-progress-line,.sb-progress-dot::after,.pz-nav::after{background:var(--border-color)}.sb-bob{background-color:var(--border-color)}.sb-bob.active{background-color:var(--text-color)}.sba{background:var(--body-bg-color);border-radius:6px;border-style:solid;border-width:1px}.sba *:focus{outline:0}.sba ::selection{background:transparent}.sba details{font-size:90%;margin-bottom:1px}.sba summary{font-size:13px;line-height:20px;padding:1px 6px 0 6px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid var(--border-color)}[data-ui].inactive{display:none}.sba-data-pane{border:1px solid var(--border-color);width:100%;font-size:85%;margin-bottom:2px;border-collapse:collapse;table-layout:fixed;border-top:none}.sba-data-pane[data-cols=\"3\"] :is(th,td){width:33.3333333333%}.sba-data-pane[data-cols=\"4\"] :is(th,td){width:25%}.sba-data-pane[data-cols=\"5\"] :is(th,td){width:20%}.sba-data-pane[data-cols=\"6\"] :is(th,td){width:16.6666666667%}.sba-data-pane[data-cols=\"7\"] :is(th,td){width:14.2857142857%}.sba-data-pane[data-cols=\"8\"] :is(th,td){width:12.5%}.sba-data-pane[data-cols=\"9\"] :is(th,td){width:11.1111111111%}.sba-data-pane[data-cols=\"10\"] :is(th,td){width:10%}.sba-data-pane th{text-transform:uppercase;background:var(--head-row-bg-color)}.sba-data-pane .sba-preeminent{font-weight:bold;border-bottom:2px solid var(--highlight-bg-color) !important}.sba-data-pane .sba-completed td,.sba-data-pane td.sba-completed{color:var(--invalid-color);font-weight:normal}.sba-data-pane .sba-hidden{display:none}.sba-data-pane :is(th,td){border:1px solid var(--border-color);border-top:none;white-space:nowrap;text-align:center;padding:3px 2px}.sba-data-pane th{background-color:var(--head-row-bg-color)}[data-ui=yourProgress] b{font-weight:700}[data-ui=yourProgress] .sba-data-pane{margin-left:5px;max-width:300px;border:none}[data-ui=yourProgress] .sba-data-pane tr.sba-completed td{color:var(--text-color)}[data-ui=yourProgress] .sba-data-pane tr td{border:none;text-align:left;line-height:1.8}[data-ui=yourProgress] .sba-data-pane tr td:nth-child(n+2){text-align:right;width:80px}[data-ui=yourProgress] .sba-data-pane tr td:nth-child(2)::after{content:\" pts.\"}[data-ui=yourProgress] .sba-data-pane tr td:last-child::after{content:\"%\"}[data-ui=header]{font-weight:bold;line-height:32px;flex-grow:2;text-indent:1px}[data-ui=progressBar]{-webkit-appearance:none;appearance:none;width:100%;border-radius:0;margin:0;height:6px;padding:0;background:transparent;display:block;border:none;border-bottom:1px var(--border-color) solid}[data-ui=progressBar]::-webkit-progress-bar{background-color:transparent}[data-ui=progressBar]::-webkit-progress-value{background-color:var(--highlight-bg-color);height:4px}[data-ui=progressBar]::-moz-progress-bar{background-color:var(--highlight-bg-color)}[data-ui=spillTheBeans]{text-align:center;padding:14px 0;font-size:38px;margin-top:-24px}[data-ui=menu]{position:relative;z-index:1}[data-ui=menu] .pane{color:var(--text-color);background:var(--body-bg-color);border:1px var(--border-color) solid;padding:5px}[data-ui=menu] li{position:relative;line-height:1.8;white-space:nowrap;cursor:pointer;overflow:hidden;display:block;padding:5px 9px 5px 28px;font-size:14px}[data-ui=menu] li::before,[data-ui=menu] li::after{position:absolute;display:block}[data-ui=menu] li[data-icon=checkmark].checked::after{content:\"✔\";color:var(--highlight-bg-color);top:3px;left:7px;font-size:16px}[data-ui=menu] li[data-icon=warning]::before{content:\"\";background:url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyLjAwNiAyLjI1NWwxMS4yNTUgMTkuNDlILjc1NXoiIGZpbGw9IiNmOGNkMDUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTMuNDQxIDkuMDAybC0uMzE3IDcuMzA2aC0yLjI0N2wtLjMxNy03LjMwNnptLS4wNDggMTAuMjYyaC0yLjc4NXYtMS44MmgyLjc4NXoiLz48L3N2Zz4=) center center/contain no-repeat;left:3px;top:6px;width:20px;height:20px}[data-ui=menu] li[data-target=darkModeColors],[data-ui=menu] li[data-icon=sba]{border-top:1px solid var(--border-color)}[data-ui=menu] li[data-icon=sba]{color:currentColor}[data-ui=menu] li[data-icon=sba]::before{content:\"\";background:url(data:image/webp;base64,UklGRkYCAABXRUJQVlA4WAoAAAAQAAAAFwAAFwAAQUxQSLgAAAABgFpt2/LmVbGJI8u8QgaIZSxqxgEYFTM7VMzMNEBPB2gVcx/xff/7/4UBImIC6F+16CWBxZsmlmH+9a7HROR4BxDmdADArZOOAKCdsyTgOguxkFMokb/oObTDyRBbN/kk+yoitfMAvr/xVevlJa5eoNzKaQN/S6dQC/Eb+PwScCQLQv1crKykJnqiAd5X9y46SrVYJXFQg5CERlSVk2LlF+s1n5iu/geF+14r8Y2x+ompsdqokf4uVlA4IGgBAABwBwCdASoYABgAPpE+m0kloyKhKAqosBIJbAAjwDeRZaSiFfn3Zr1QP9Ud0ADEskPPzxJU2pre8kHbnjqgPRfZb8zq4AD9IaAZD2vQgXhhU4vU6iI9307byI0qRvcdYUVqITfvs+c25tJHp68Tb8QbbjuwTz0j+xXnVHcdq1O53Cem6tFr6zIo8VPHzofJrvlKQnvp1W5bdpH3HE+2rDOikrPkzD5qdR91khmLUr2/65qN81K7n/5Ztjb/URQJxilNBdj/22TMy3S5+24re6Kkfvbzc9n/kNAlBuAaKYxSAgHTAELvJElqGMJ9psshwQ9Hinh1y4MVKzbf8UDf/8aFRjwHnN+c4w1Zb8LpKYQTgVuzyDsB7crn5PhK9sLJaU7CApsBz7CTzw1L6VpU0HoDsNv54wX6rtilmqIwjJzvnBL5H2aH/M7tuhCNyahJ+EDMv/cyE4Kqn918j7n693a1ovztxeo8AAA=) center center/contain no-repeat;left:5px;top:6px;width:20px;height:20px}[data-ui=menu] li[data-icon=sba]:hover{color:var(--link-hover-color);text-decoration:underline}.sba-color-selector{display:flex;justify-content:space-between;gap:10px}.sba-color-selector svg{width:120px;height:120px;display:block}[data-ui=darkModeColors] .hive{width:auto;padding:0;flex-grow:2;display:flex}[data-ui=darkModeColors] .hive-cell{position:static;margin:auto;border:1px solid var(--border-color);padding:20px;width:168px;height:100%;border-radius:6px}[data-ui=darkModeColors] .cell-letter{font-size:8px;font-weight:600}.sba-swatches{display:flex;flex-wrap:wrap;list-style:none;justify-content:space-around;padding:0;width:220px}.sba-swatches li{position:relative;overflow:hidden;margin-bottom:5px}.sba-swatches label{border:1px var(--border-color) solid;display:block;width:50px;height:50px;overflow:hidden;cursor:pointer}.sba-swatches input{position:absolute;left:-100px}.sba-swatches input:checked~label{border-color:var(--highlight-bg-color)}.sba-googlified .sb-anagram{cursor:pointer}.sba-googlified .sb-anagram:hover{text-decoration:underline;color:var(--link-hover-color)}#portal-game-toolbar [role=presentation]::selection{background:transparent}[data-sba-theme] .sb-modal-wordlist-items li .check.checked{border:none;height:auto;transform:none}[data-sba-theme] .sb-modal-wordlist-items li .check.checked::after{position:relative;content:\"✔\";color:var(--highlight-bg-color);top:4px;font-size:16px}[data-sba-theme] .sb-modal-header .sb-modal-letters{position:relative;top:-5px}.pz-toolbar-button:hover,[data-ui=menu] li:hover{background:var(--menu-hover-color);color:var(--text-color)}.pz-toolbar-button::selection,[data-ui=menu] li::selection{background-color:transparent}[data-ui=grid] table{border-top:1px solid var(--border-color)}[data-ui=grid] tbody tr:last-child td{font-weight:bold}[data-ui=grid] tbody tr td{padding:5px 0 !important}[data-ui=grid] tbody tr td:last-of-type{font-weight:bold}.pz-desktop .sba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.pz-desktop .sba summary{list-style:none;padding:1px 15px 0 21px}.pz-desktop .sba summary::marker{display:none}.pz-desktop .sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}[data-sba-theme] :is(.sb-wordlist-items-pag,.sb-modal-wordlist-items)>li.sba-pangram{font-weight:700;border-bottom:2px var(--highlight-bg-color) solid}[data-sba-theme] .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;font-size:13px;border-top:1px solid var(--border-color);padding:10px 10px 0 10px}.sb-modal-frame .sb-modal-content::after{background:linear-gradient(180deg, transparent 0%, var(--modal-bg-color) 56.65%, var(--body-bg-color) 100%)}.sba-container{display:none}.sba{margin:var(--sba-app-margin);width:var(--sba-app-width);padding:var(--sba-app-padding);box-sizing:border-box}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}[data-ui=menu] .pane{position:absolute;top:0;right:-10000px}[data-sba-submenu=true] .sba{position:relative;left:-167px;top:-175px}[data-sba-submenu=true] .pz-game-toolbar{position:relative;z-index:4}[data-sba-submenu=true] [data-ui=menu] .pane{right:-16px;top:49px}[data-sba-submenu=true] .sba{left:-163px;top:0}[data-sba-submenu=true].pz-desktop .pane{right:-16px;top:55px}[data-sba-active=true]{--sba-app-width: 100px;--sba-app-padding: 0;--sba-app-margin: 0;--sba-game-offset: 12px;--sba-game-width: 1256px;--sba-mobile-threshold: 900px}[data-sba-active=true] .sba-container{display:block;position:absolute;top:50%;transform:translate(0, -50%);right:var(--sba-game-offset);z-index:1}[data-sba-active=true] .sba{border-color:transparent}[data-sba-active=true] [data-ui=header]{display:none}[data-sba-active=true][data-sba-submenu=true] .sba-container{top:0;height:0}[data-sba-active=true] .sb-expanded .sba-container{visibility:hidden;pointer-events:none}[data-sba-active=true] .sb-content-box{max-width:var(--sba-game-width);justify-content:space-between;position:relative}[data-sba-active=true] .sb-controls-box{max-width:calc(100vw - var(--sba-app-width))}@media(max-width: 370px){[data-sba-active=true] .sb-hive{width:70%}[data-sba-active=true].pz-spelling-bee-wordlist .hive-action:not(.hive-action__shuffle){font-size:.9em;margin:0 4px 8px;padding:23px 0}[data-sba-active=true] .hive-action:not(.hive-action__shuffle){width:71px;min-width:auto}}[data-sba-active] .pz-game-toolbar .pz-row{padding:0}@media(min-width: 516px){[data-sba-active] .pz-game-toolbar .pz-row{padding:0 12px}[data-sba-active].pz-desktop .sba{left:-175px}[data-ui=score] .sba-data-pane tbody th{text-transform:none;width:31%}[data-ui=score] .sba-data-pane tbody td{width:23%}[data-ui=score] .sba-data-pane tbody tr:nth-child(1) th::after{content:\"ords\"}[data-ui=score] .sba-data-pane tbody tr:nth-child(2) th::after{content:\"oints\"}[data-ui=score] .sba-data-pane thead th{width:23%}[data-ui=score] .sba-data-pane thead th:first-of-type{width:31%}[data-sba-active=true]{--sba-app-width: 138px;--sba-app-padding: 0 5px 5px}[data-sba-active=true] .sba{border-color:var(--border-color)}[data-sba-active=true] [data-ui=header]{display:block}}@media(min-width: 900px){[data-sba-submenu=true].pz-desktop [data-ui=menu] .pane{right:0;top:55px}[data-sba-active=true]{--sba-app-width: 160px;--sba-app-padding: 0 8px 8px;--sba-app-margin: 66px 0 0 0}[data-sba-active=true] .sb-content-box{padding:0 var(--sba-game-offset)}[data-sba-active=true] .sb-controls-box{max-width:none}[data-sba-active=true] .sba-container{position:static;transform:none}[data-sba-active=true] .sb-expanded .sba-container{z-index:1}[data-sba-active=true][data-sba-submenu=true] .sba{top:-66px}[data-sba-active=true].pz-desktop .sba{left:-191px}}@media(min-width: 1298px){[data-sba-active=true][data-sba-submenu=true] .sba{left:-179px}}@media(min-width: 768px){[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-body{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sb-modal-header{padding-right:56px}[data-sba-theme].pz-page .sba-pop-up.sb-modal-frame .sb-modal-content .sba-modal-footer{text-align:right;border-top:1px solid var(--border-color);padding-top:10px;width:calc(100% - 112px);margin:-8px auto 15px}}";

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
                            case 'popup':
                                this.app.domSet('submenu', false);
                                component.display();
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
    	display() {
    		this.popup
    			.setContent('subtitle', this.description)
    			.setContent('body', this.getPane())
    			.toggle(true);
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
            FirstLetter,
            Pangrams,
            ProgressBar,
            SpillTheBeans,
            DarkMode,
            ColorConfig,
            PangramHl,
            Googlify,
            Styles,
            Menu,
            Grid,
            YourProgress,
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
            let tries = 20;
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
                    this.domSet('active', true);
                    this.registerPlugins();
                    this.trigger(prefix('refreshUi'));
                    this.isLoaded = true;
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
            const args = this.getObserverArgs();
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
            el.$('.sb-content-box', this.gameWrapper).prepend(this.container);
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
