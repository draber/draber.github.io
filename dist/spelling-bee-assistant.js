(function () {
    'use strict';

    const $ = (expr, container = null) => {
        return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
    };
    const $$ = (expr, container = null) => {
        return [].slice.call((container || document).querySelectorAll(expr));
    };
    const tableRow = ({
        classNames = [],
        events = {},
        cellData = [],
        cellTag = 'td'
    } = {}) => {
        const row = create({
            tag: 'tr',
            classNames: classNames,
            events: events
        });
        cellData.forEach(entry => {
            row.append(create({
                tag: cellTag,
                text: entry
            }));
        });
        return row;
    };
    const labeledCheckbox = ({
        text = '',
        classNames = [],
        attributes = {},
        events = {},
        checked = false
    } = {}) => {
        if(checked) {
            attributes.checked = 'checked';
        }
        const checkbox = create({
            tag: 'input',
            attributes: attributes,
            events: events
        });
        const label = create({
            tag: 'label',
            text: text,
            classNames: classNames
        });
        label.prepend(checkbox);
        return label;
    };
    const create = ({
        tag = 'div',
        text = '',
        attributes = {},
        style = {},
        data = {},
        events = {},
        classNames = [],
        cellData = [],
        cellTag = 'td',
        checked = false
    } = {}) => {
        if (tag === 'tr' && cellData.length) {
            return tableRow({
                classNames,
                events,
                cellData,
                cellTag
            });
        }
        if (tag === 'input' && attributes.type === 'checkbox' && text) {
            return labeledCheckbox({
                text,
                classNames,
                attributes,
                events,
                checked
            });
        }
        const el = document.createElement(tag);
        for (const [prop, value] of Object.entries(style)) {
            el.style[prop] = value;
        }
        if (classNames.length) {
            el.classList.add(...classNames);
        }
        if (Array.isArray(text)) {
            el.append(create({
                tag: text[1],
                text: text[0]
            }));
        } else {
            el.textContent = text;
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (value !== '') {
                el.setAttribute(key, value);
            }
        }
        for (const [key, value] of Object.entries(data)) {
            el.dataset[key] = value;
        }
        for (const [event, fn] of Object.entries(events)) {
            el.addEventListener(event, fn, false);
        }
        return el;
    };
    var el = {
        $,
        $$,
        create
    };

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
        app.on(new Event(prefix$1('newWord')));
    };
    const init = (app, resultList) => {
        lists = initLists();
        updateLists(app, resultList);
        app.on(prefix$1('newWord'), () => {
            updateLists(app, resultList);
        });
    };
    var data = {
        init,
        getList,
        getCount,
        getPoints
    };

    class app {
        constructor(game) {
            if (!game || !window.gameData) {
                console.info(`This bookmarklet only works on ${settings$1.get('targetUrl')}`);
                return false;
            }
            this.title = settings$1.get('label');
            this.key = camel(this.title);
            this.game = game;
            const oldInstance = el.$(`[data-id="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix$1('destroy')));
            }
            this.registry = new Map();
            this.on = (evt, action) => {
                this.ui.addEventListener(evt, action);
            };
            this.trigger = (evt) => {
                this.ui.dispatchEvent(evt);
            };
            const rect = el.$('.sb-content-box', game).getBoundingClientRect();
            const resultList = el.$('.sb-wordlist-items', game);
            const events = {};
            events[prefix$1('destroy')] = () => {
                this.observer.disconnect();
                this.ui.remove();
            };
            this.ui = el.create({
                attributes: {
                    draggable: true
                },
                style: {
                    left: (rect.right + 10) + 'px',
                    top: (rect.top + window.pageYOffset) + 'px',
                },
                data: {
                    id: this.key
                },
                classNames: [settings$1.get('prefix')],
                events: events
            });
            data.init(this, resultList);
            this.observer = new MutationObserver(() => {
                this.trigger(new Event(prefix$1('newWord')));
            });
            this.observer.observe(resultList, {
                childList: true
            });
            this.registerPlugins = (plugins) => {
                for (const [key, plugin] of Object.entries(plugins)) {
                    this.registry.set(key, new plugin(this));
                }
            };
            el.$('body').append(this.ui);
        };
    }

    class plugin {
        defaultEnabled = true;
        optional = false;
        ui;
        title;
        key;
        target;
        app;
        hasUi = () => {
            return this.ui instanceof HTMLElement;
        }
        isEnabled = () => {
            const stored = settings$1.get(`options.${this.key}`);
            return typeof stored !== 'undefined' ? stored : this.defaultEnabled;
        }
        toggle = state => {
            settings$1.set(`options.${this.key}`, state);
            this.ui.classList.toggle('inactive', !state);
        }
        attach = () => {
            if (!this.hasUi()) {
                return false;
            }
            const target = this.target || el.$(`[data-ui="${this.key}"]`, this.app.ui) || (() => {
                const _target = el.create({
                    data: {
                        plugin: this.key
                    }
                });
                this.app.ui.append(_target);
                return _target;
            })();
            target.append(this.ui);
            return true;
        }
        add = () => {
            this.attach();
            if (this.optional) {
                settings$1.set(`options.${this.key}`, this.isEnabled());
            }
        }
        constructor(app, title, {
            key,
            optional,
            defaultEnabled
        } = {}) {
            this.app = app;
            if (!app || !title) {
                throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, only 1 was passed from ${this.constructor.name}`);
            }
            this.title = title;
            this.key = key || camel(title);
            this.optional = typeof optional !== 'undefined' ? optional : this.optional;
            this.defaultEnabled = typeof defaultEnabled !== 'undefined' ? defaultEnabled : this.defaultEnabled;
        }
    }

    class darkMode extends plugin {
        constructor(app) {
            super(app, 'Dark Mode', {
                optional: true,
                defaultEnabled: false
            });
            const bodyClass = prefix$1('dark', 'd');
            this.toggle = state => {
                settings$1.set(`options.${this.key}`, state);
                el.$('body').classList.toggle(bodyClass, state);
            };
            this.toggle(this.isEnabled());
            this.add();
        }
    }

    class footer extends plugin {
        constructor(app) {
            super(app, `${settings$1.get('label')} ${settings$1.get('version')}`, {
                key: 'footer'
            });
            this.ui = el.create({
                tag: 'a',
                text: this.title,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
            this.add();
        }
    }

    class header extends plugin {
        constructor(app) {
            super(app, settings$1.get('title'), {
                key: 'header'
            });
            this.ui = el.create();
            let params;
            let isLastTarget = false;
            const getDragParams = (evt) => {
                const gRect = app.game.getBoundingClientRect();
                const aRect = evt.target.getBoundingClientRect();
                const minT = gRect.top + window.pageYOffset;
                const pRect = this.ui.parentElement.getBoundingClientRect();
                const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;
                return {
                    maxL: document.documentElement.clientWidth - aRect.width,
                    minT: minT,
                    maxT: minT + gAvailH,
                    offX: evt.screenX - aRect.x,
                    offY: evt.screenY - aRect.y,
                    margT: parseInt(getComputedStyle(evt.target).marginTop, 10)
                };
            };
            const getDropPosition = evt => {
                let left = Math.max(0, (evt.screenX - params.offX));
                left = Math.min(left, (params.maxL)) + 'px';
                let top = Math.max(params.minT, (evt.screenY + window.pageYOffset - params.margT - params.offY));
                top = Math.min(top, params.maxT) + 'px';
                return {
                    left,
                    top
                };
            };
            const makeDraggable = () => {
                [app.ui, app.game].forEach(element => {
                    element.addEventListener('dragover', evt => {
                        evt.preventDefault();
                    });
                });
                app.on('dragstart', evt => {
                    if (!isLastTarget) {
                        evt.preventDefault();
                        return false;
                    }
                    evt.target.style.opacity = '.2';
                    params = getDragParams(evt);
                }, false);
                app.on('dragend', evt => {
                    Object.assign(evt.target.style, getDropPosition(evt));
                    evt.target.style.opacity = '1';
                });
            };
            this.ui.append(el.create({
                text: this.title,
                attributes: {
                    title: 'Hold the mouse down to drag'
                },
                classNames: ['dragger']
            }));
            this.ui.append(el.create({
                tag: 'span',
                text: '×',
                attributes: {
                    title: 'Close'
                },
                classNames: ['closer'],
                events: {
                    click: () => {
                        app.trigger(new Event(prefix$1('destroy')));
                    }
                }
            }));
            this.ui.append(el.create({
                tag: 'span',
                attributes: {
                    title: 'Minimize'
                },
                classNames: ['minimizer'],
                events: {
                    click: () => {
                        app.ui.classList.toggle('minimized');
                    }
                }
            }));
            app.on('pointerdown', evt => {
                isLastTarget = !!evt.target.closest(`[data-plugin="${this.key}"]`);
            });
            app.on('pointerup', () => {
                isLastTarget = false;
            });
            makeDraggable();
            this.add();
        }
    }

    const update = (tbody) => {
        tbody.innerHTML = '';
        [
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
        ].forEach(cellData => {
            tbody.append(el.create({
                tag: 'tr',
                cellData: cellData
            }));
        });
    };
    class scoreSoFar extends plugin {
        constructor(app) {
            super(app, 'Score so far', {
                optional: true
            });
            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary'],
                attributes: {
                    open: true
                },
                classNames: !this.isEnabled() ? ['inactive'] : []
            });
            const pane = el.create({
                tag: 'table',
                classNames: ['pane']
            });
            const thead = el.create({
                tag: 'thead'
            });
            thead.append(el.create({
                tag: 'tr',
                cellTag: 'th',
                cellData: ['', 'Found', 'Missing', 'Total']
            }));
            const tbody = el.create({
                tag: 'tbody'
            });
            pane.append(thead);
            pane.append(tbody);
            update(tbody);
            this.ui.append(pane);
            app.on(prefix$1('newWord'), (evt) => {
                update(tbody);
            });
            this.add();
        }
    }

    class setUp extends plugin {
    	constructor(app) {
    		super(app, 'Set-up');
    		const pane = el.create({
    			tag: 'ul',
    			classNames: ['pane']
    		});
    		const populate = (pane) => {
    			app.registry.forEach((plugin, key) => {
    				if(!plugin.optional){
    					return false;
    				}
    				const li = el.create({
    					tag: 'li'
    				});
    				const labeledCheck = el.create({
    					tag: 'input',
    					text: plugin.title,
    					attributes: {
    						type: 'checkbox',
    						name: key
    					},
    					checked: plugin.isEnabled()
    				});
    				li.append(labeledCheck);
    				pane.append(li);
    			});
    		};
    		this.ui = el.create({
    			tag: 'details',
    			text: [this.title, 'summary'],
    			events: {
    				click: function (evt) {
    					if (evt.target.tagName === 'INPUT') {
    						app.registry.get(evt.target.name).toggle(evt.target.checked);
    					}
    				}
    			}
    		});
    		this.ui.append(pane);
    		populate(pane);
            this.add();
    	}
    }

    class spillTheBeans extends plugin {
        constructor(app) {
            super(app, 'Spill the beans', {
                optional: true
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
            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary'],
                classNames: !this.isEnabled() ? ['inactive'] : []
            });
            const pane = el.create({
                classNames: ['pane']
            });
            pane.append(el.create({
                text: 'Watch me while you type!',
                classNames: ['spill-title']
            }));
            const reaction = el.create({
                text: '😐',
                classNames: ['spill']
            });
            pane.append(reaction);
            this.ui.append(pane);
            (new MutationObserver(mutationsList => {
                reaction.textContent = react(mutationsList.pop().target.textContent.trim());
            })).observe(el.$('.sb-hive-input-content', app.game), {
                childList: true
            });
            this.add();
        }
    }

    class spoilers extends plugin {
    	constructor(app) {
    		super(app, 'Spoilers', {
    			optional: true
    		});
    		const tbody = el.create({
    			tag: 'tbody'
    		});
    		const getCellData = () => {
    			const counts = {};
    			const pangramCount = data.getCount('pangrams');
    			const foundPangramCount = data.getCount('foundPangrams');
    			const cellData = [
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
    		const update = () => {
    			tbody.innerHTML = '';
    			getCellData().forEach(cellData => {
    				tbody.append(el.create({
    					tag: 'tr',
    					cellData: cellData
    				}));
    			});
    		};
    		this.ui = el.create({
    			tag: 'details',
    			text: [this.title, 'summary'],
                classNames: !this.isEnabled() ? ['inactive'] : []
    		});
    		const pane = el.create({
    			tag: 'table',
    			classNames: ['pane']
    		});
    		const thead = el.create({
    			tag: 'thead'
    		});
    		thead.append(el.create({
    			tag: 'tr',
    			cellTag: 'th',
    			cellData: ['', 'Found', 'Missing', 'Total']
    		}));
    		pane.append(thead);
    		pane.append(tbody);
    		update();
    		this.ui.append(pane);
    		app.on(prefix$1('newWord'), () => {
    			update();
    		});
    		this.add();
    	}
    }

    class stepsToSuccess extends plugin {
        constructor(app) {
            super(app, 'Steps to success', {
                optional: true
            });
            const maxPoints = data.getPoints('answers');
            const rankings = [
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
            });
            const update = (frame) => {
                frame.innerHTML = '';
                const ownPoints = data.getPoints('foundTerms');
                const tier = rankings.filter(entry => entry[1] <= ownPoints).pop()[1];
                rankings.forEach(value => {
                    frame.append(el.create({
                        tag: 'tr',
                        classNames: value[1] === tier ? ['sba-current'] : [],
                        cellTag: 'td',
                        cellData: [value[0], value[1]]
                    }));
                });
            };
            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary'],
                classNames: !this.isEnabled() ? ['inactive'] : []
            });
            const pane = el.create({
                tag: 'table',
                classNames: ['pane']
            });
            const frame = el.create({
                tag: 'tbody'
            });
            update(frame);
            pane.append(frame);
            this.ui.append(pane);
            app.on(prefix$1('newWord'), () => {
                update(frame);
            });
            this.add();
        }
    }

    var css = "@charset \"UTF-8\";\r\n.pz-game-field {\r\n  background: inherit;\r\n  color: inherit; }\r\n\r\n.sb-wordlist-items .sb-pangram {\r\n  border-bottom: 2px #f8cd05 solid; }\r\n.sb-wordlist-items .sb-anagram a {\r\n  color: #888; }\r\n\r\n.sba-dark {\r\n  background: #111;\r\n  color: #eee; }\r\n  .sba-dark .sba {\r\n    background: #111; }\r\n    .sba-dark .sba summary {\r\n      background: #252525;\r\n      color: #eee; }\r\n  .sba-dark .pz-nav__hamburger-inner,\r\n  .sba-dark .pz-nav__hamburger-inner::before,\r\n  .sba-dark .pz-nav__hamburger-inner::after {\r\n    background-color: #eee; }\r\n  .sba-dark .pz-nav {\r\n    width: 100%;\r\n    background: #111; }\r\n  .sba-dark .pz-nav__logo {\r\n    filter: invert(1); }\r\n  .sba-dark .sb-modal-scrim {\r\n    background: rgba(17, 17, 17, 0.85);\r\n    color: #eee; }\r\n  .sba-dark .pz-modal__title {\r\n    color: #eee; }\r\n  .sba-dark .sb-modal-frame,\r\n  .sba-dark .pz-modal__button.white {\r\n    background: #111;\r\n    color: #eee; }\r\n  .sba-dark .pz-modal__button.white:hover {\r\n    background: #393939; }\r\n  .sba-dark .sb-message {\r\n    background: #393939; }\r\n  .sba-dark .sb-progress-marker .sb-progress-value,\r\n  .sba-dark .hive-cell.center .cell-fill {\r\n    background: #f7c60a;\r\n    fill: #f7c60a;\r\n    color: #111; }\r\n  .sba-dark .sb-input-bright {\r\n    color: #f7c60a; }\r\n  .sba-dark .hive-cell.outer .cell-fill {\r\n    fill: #393939; }\r\n  .sba-dark .cell-fill {\r\n    stroke: #111; }\r\n  .sba-dark .cell-letter {\r\n    fill: #eee; }\r\n  .sba-dark .hive-cell.center .cell-letter {\r\n    fill: #111; }\r\n  .sba-dark .hive-action:not(.hive-action__shuffle) {\r\n    background: #111;\r\n    color: #eee; }\r\n  .sba-dark .hive-action__shuffle {\r\n    filter: invert(100%); }\r\n  .sba-dark *:not(.hive-action__shuffle):not(.sb-pangram):not(.sba-current) {\r\n    border-color: #333 !important; }\r\n\r\n.sba {\r\n  position: absolute;\r\n  width: 200px;\r\n  background: inherit;\r\n  box-sizing: border-box;\r\n  z-index: 3;\r\n  margin: 16px 0;\r\n  padding: 0 10px 5px;\r\n  background: #fff;\r\n  border-width: 1px;\r\n  border-color: gainsboro;\r\n  border-radius: 6px;\r\n  border-style: solid; }\r\n  .sba *,\r\n  .sba *:before,\r\n  .sba *:after {\r\n    box-sizing: border-box; }\r\n  .sba *:focus {\r\n    outline: 0; }\r\n  .sba .dragger {\r\n    font-weight: bold;\r\n    cursor: move;\r\n    line-height: 32px; }\r\n  .sba .closer,\r\n  .sba .minimizer {\r\n    font-size: 18px;\r\n    font-weight: bold;\r\n    position: absolute;\r\n    top: 0;\r\n    line-height: 32px;\r\n    padding: 0 10px;\r\n    cursor: pointer; }\r\n  .sba .closer {\r\n    right: 0; }\r\n  .sba .minimizer {\r\n    right: 16px;\r\n    transform: rotate(-90deg);\r\n    transform-origin: center;\r\n    font-size: 10px;\r\n    right: 24px;\r\n    top: 1px; }\r\n    .sba .minimizer:before {\r\n      content: \"❯\"; }\r\n  .sba.minimized details {\r\n    display: none; }\r\n  .sba.minimized .minimizer {\r\n    transform: rotate(90deg);\r\n    right: 25px;\r\n    top: 0; }\r\n  .sba details {\r\n    font-size: 90%;\r\n    margin-bottom: 1px;\r\n    max-height: 800px;\r\n    transition: max-height 0.25s ease-in; }\r\n    .sba details[open] summary:before {\r\n      transform: rotate(-90deg);\r\n      left: 12px;\r\n      top: 0; }\r\n    .sba details.inactive {\r\n      height: 0;\r\n      max-height: 0;\r\n      transition: max-height 0.25s ease-out;\r\n      overflow: hidden;\r\n      margin: 0; }\r\n  .sba summary {\r\n    line-height: 24px;\r\n    padding: 0 15px 0 25px;\r\n    background: #f8cd05;\r\n    cursor: pointer;\r\n    list-style: none;\r\n    position: relative; }\r\n    .sba summary::-webkit-details-marker {\r\n      display: none; }\r\n    .sba summary:before {\r\n      content: \"❯\";\r\n      font-size: 9px;\r\n      position: absolute;\r\n      display: inline-block;\r\n      transform: rotate(90deg);\r\n      transform-origin: center;\r\n      left: 9px;\r\n      top: -1px; }\r\n  .sba .hive-action {\r\n    margin: 0 auto;\r\n    display: block;\r\n    font-size: 100%;\r\n    white-space: nowrap; }\r\n  .sba .pane {\r\n    border: 1px solid gainsboro;\r\n    border-top: none;\r\n    border-collapse: collapse;\r\n    width: 100%;\r\n    font-size: 85%;\r\n    margin-bottom: 4px; }\r\n  .sba tr:first-of-type td,\r\n  .sba tr:first-of-type th {\r\n    border-top: none; }\r\n  .sba tr td:first-of-type {\r\n    text-align: left; }\r\n  .sba tr.sba-current {\r\n    font-weight: bold;\r\n    border-bottom: 2px solid #f8cd05 !important; }\r\n  .sba th,\r\n  .sba td {\r\n    border: 1px solid gainsboro;\r\n    white-space: nowrap; }\r\n  .sba thead th {\r\n    text-align: center;\r\n    padding: 4px 0; }\r\n  .sba tbody th {\r\n    text-align: right; }\r\n  .sba tbody td {\r\n    text-align: center;\r\n    padding: 4px 6px; }\r\n  .sba [data-plugin=\"footer\"] a {\r\n    color: currentColor;\r\n    opacity: .6;\r\n    font-size: 10px;\r\n    text-align: right;\r\n    display: block;\r\n    padding-top: 8px; }\r\n    .sba [data-plugin=\"footer\"] a:hover {\r\n      opacity: .8;\r\n      text-decoration: underline; }\r\n  .sba .spill-title {\r\n    padding: 10px 6px 0px;\r\n    text-align: center; }\r\n  .sba .spill {\r\n    text-align: center;\r\n    padding: 17px 0;\r\n    font-size: 280%; }\r\n  .sba ul.pane {\r\n    padding: 5px; }\r\n  .sba [data-plugin=\"surrender\"] .pane {\r\n    padding: 10px 5px; }\r\n  .sba label {\r\n    cursor: pointer;\r\n    position: relative;\r\n    line-height: 19px; }\r\n    .sba label input {\r\n      position: relative;\r\n      top: 2px;\r\n      margin: 0 10px 0 0; }\r\n";

    class styles extends plugin {
        constructor(app) {
            super(app, 'Styles');
            this.target = el.$('head');
            this.ui = el.create({
                tag: 'style',
                text: css.replace(/(\uFEFF|\\n)/gu, '')
            });
            app.on(prefix$1('destroy'), () => {
                this.ui.remove();
            });
            this.add();
        }
    }

    class surrender extends plugin {
    	constructor(app) {
    		super(app, 'Surrender', {
    			optional: true
    		});
    		let usedOnce = false;
    		const buildEntry = term => {
    			const entry = el.create({
    				tag: 'li',
    				classNames: data.getList('pangrams').includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
    			});
    			entry.append(el.create({
    				tag: 'a',
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
    			data.getList('remainders').forEach(term => {
    				resultList.append(buildEntry(term));
    			});
    			usedOnce = true;
    			return true;
    		};
    		this.ui = el.create({
    			tag: 'details',
    			text: [this.title, 'summary'],
                classNames: !this.isEnabled() ? ['inactive'] : []
    		});
    		const pane = el.create({
    			classNames: ['pane']
    		});
    		pane.append(el.create({
    			tag: 'button',
    			classNames: ['hive-action'],
    			text: 'Display answers',
    			attributes: {
    				type: 'button'
    			},
    			events: {
    				click: () => {
    					resolve(el.$('.sb-wordlist-items', app.game));
    				}
    			}
    		}));
    		this.ui.append(pane);
    		this.add();
    	}
    }

    var plugins = {
        styles,
        darkMode,
        header,
        scoreSoFar,
        spoilers,
        spillTheBeans,
        stepsToSuccess,
        surrender,
        setUp,
        footer
    };

    (new app(el.$('#pz-game-root'))).registerPlugins(plugins);

}());
