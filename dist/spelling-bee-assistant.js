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

    let observers = [];
    var observers$1 = {
        add: ({
            observer,
            target,
            config
        }) => {
            observer.observe(target, config);
            return observers.push(observer);
        },
        remove: ({
            observer
        }) => {
            observer.disconnect();
            observers = observers.filter(function (_observer) {
                return _observer !== observer;
            });
            return observers.length;
        },
        removeAll: function () {
            observers.forEach(observer => {
                this.remove({observer});
            });
            return observers.length;
        }
    };

    var version = "2.0.0";

    var label = "Spelling Bee Assistant";
    var title = "Assistant";
    var url = "https://spelling-bee-assistant.app/";
    var repo = "draber/draber.github.io.git";
    var prefix = "sba";

    const get = key => {
        let current = Object.create(settings);
        for (let token of key.split('.')) {
            if (!current[token]) {
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
    const settings = {
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        version: version,
        options: JSON.parse(localStorage.getItem(prefix + '-settings') || '{}')
    };
    var settings$1 = {
        get,
        set
    };

    const toCamelCase = term => {
        return term.replace(/[_-]+([a-z])/g, (g) => g[1].toUpperCase());
    };
    const toDashCase = term => {
        return term.match(/([A-Z])/g).reduce(
                (str, c) => str.replace(new RegExp(c), '-' + c.toLowerCase()),
                term
            )
            .substring((term.slice(0, 1).match(/([A-Z])/g)) ? 1 : 0);
    };
    function pf(term, mode = 'c') {
        switch (mode) {
            case 'c':
                return toCamelCase(settings$1.get('prefix') + '_' + term);
            case 'd':
                return toDashCase(settings$1.get('prefix') + term.charAt(0).toUpperCase() + term.slice(1));
            default:
                return term;
        }
    }

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
            const term = node.textContent;
            lists.foundTerms.push(term);
            if (lists.pangrams.includes(term)) {
                lists.foundPangrams.push(term);
                node.classList.add('sb-pangram');
            }
        });
        lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
        app.dispatchEvent(new Event(pf('updateComplete')));
    };
    const init = (app, resultList) => {
        lists = initLists();
        updateLists(app, resultList);
        app.addEventListener(pf('update'), () => {
            updateLists(app, resultList);
        });
    };
    var data = {
        init,
        getList,
        getCount,
        getPoints
    };

    const initObserver = (app, target) => {
    	const _observer = new MutationObserver(mutationsList => {
    		app.dispatchEvent(new CustomEvent(pf('update'), {
    			detail: {
    				text: mutationsList.pop().addedNodes[0]
    			}
    		}));
    	});
    	return {
    		observer: _observer,
    		target: target,
    		config: {
    			childList: true
    		}
    	}
    };
    function widget(game) {
    	if (!game || !window.gameData) {
    		console.info('This bookmarklet only works on https://www.nytimes.com/puzzles/spelling-bee');
    		return false;
    	}
    	const rect = el.$('.sb-content-box', game).getBoundingClientRect();
    	const resultList = el.$('.sb-wordlist-items', game);
    	const events = {};
    	events[pf('destroy')] = evt => {
    		observers$1.removeAll();
    		evt.target.remove();
    	};
    	const app = el.create({
    		attributes: {
    			draggable: true
    		},
    		style: {
    			left: (rect.right + 10) + 'px',
    			top: (rect.top + window.pageYOffset) + 'px',
    		},
    		data: {
    			id: settings$1.get('repo')
    		},
    		classNames: [settings$1.get('prefix')],
    		events: events
    	});
    	data.init(app, resultList);
    	observers$1.add(initObserver(app, resultList));
    	return app;
    }

    const noUi = 'noUi';
    const callback = (cb, action) => {
        if (cb && typeof cb[action] === 'function') {
            cb[action]();
        }
    };
    const addListeners = plugin => {
        const evtName = pf(plugin.key);
        plugin.app.addEventListener(evtName, evt => {
            if (evt.detail.enabled) {
                plugin(plugin.app, ...plugin.args);
            } else {
                remove(plugin);
            }
        });
    };
    const isEnabled = (key, defaultState) => {
        const stored = settings$1.get(`options.${key}.v`);
        return typeof stored !== 'undefined' ? stored : defaultState;
    };
    const attachPlugin = (plugin, defaultState) => {
        if (plugin.ui === noUi) {
            return false;
        }
        const target = plugin.target || el.$(`[data-ui="${plugin.key}"]`, plugin.app) || (() => {
            const _target = el.create({
                data: {
                    plugin: plugin.key
                }
            });
            plugin.app.append(_target);
            return _target;
        })();
        if (isEnabled(plugin.key, defaultState)) {
            target.append(plugin.ui);
        }
        return true;
    };
    const add = (plugin) => {
        const defaultState = typeof plugin.defaultState === 'undefined' ? true : plugin.defaultState;
        const optional = typeof plugin.optional === 'undefined' ? false : plugin.optional;
        const title = typeof plugin.title === 'undefined' ? '' : plugin.title;
        attachPlugin(plugin, defaultState);
        if (optional) {
            settings$1.set(`options.${plugin.key}`, {
                t: title,
                v: isEnabled(plugin.key, defaultState)
            });
        }
        addListeners(plugin);
        if (plugin.observer && plugin.observer instanceof MutationObserver) {
            observers$1.add(plugin.observer);
        }
    };
    const remove = (plugin) => {
        if (plugin.ui instanceof HTMLElement) {
            plugin.ui.remove();
        }
        if (plugin.optional) {
            settings$1.set(`options.${plugin.key}.v`, false);
        }
        if (plugin.observer && plugin.observer instanceof MutationObserver) {
            observers$1.remove(plugin.observer);
        }
        callback(plugin.cb, 'remove');
        return null;
    };
    var pluginManager = {
        add,
        remove,
        isEnabled,
        noUi
    };

    class scoreSoFar {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = 'Score so far';
            this.key = 'scoreSoFar';
            this.optional = true;
            const tbody = el.create({
                tag: 'tbody'
            });
            const update = () => {
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
            if (pluginManager.isEnabled(this.key, true)) {
                this.ui = el.create({
                    tag: 'details',
                    text: [this.title, 'summary'],
                    attributes: {
                        open: true
                    }
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
                app.addEventListener(pf('updateComplete'), () => {
                    update();
                });
            }
        }
    }

    class setUp {
    	constructor(app, ...args) {
    		this.app = app;
    		this.args = args;
    		this.title = 'Set-up';
    		this.key = 'setUp';
    		this.optional = false;
    		const pane = el.create({
    			tag: 'ul',
    			classNames: ['pane']
    		});
    		const populate = () => {
    			for (const [key, option] of Object.entries(settings$1.get('options'))) {
    				const li = el.create({
    					tag: 'li'
    				});
    				const labeledCheck = el.create({
    					tag: 'input',
    					text: option.t,
    					attributes: {
    						type: 'checkbox',
    						name: key
    					},
    					checked: option.v
    				});
    				li.append(labeledCheck);
    				pane.append(li);
    			}
    		};
    		this.ui = el.create({
    			tag: 'details',
    			text: [this.title, 'summary'],
    			events: {
    				click: function (evt) {
    					if (evt.target.tagName === 'INPUT') {
    						this.app.dispatchEvent(new CustomEvent(pf(evt.target.name), {
    							detail: {
    								enabled: evt.target.checked
    							}
    						}));
    					}
    				}
    			}
    		});
    		this.ui.append(pane);
    		this.app.addEventListener(pf('launchComplete'), () => {
    			populate();
    		});
    	}
    }

    class spillTheBeans {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = 'Spill the beans';
            this.key = 'spillTheBeans';
            this.optional = true;
            const initObserver = (target) => {
                const _observer = new MutationObserver(mutationsList => {
                    this.app.dispatchEvent(new CustomEvent(pf('spill'), {
                        detail: {
                            text: mutationsList.pop().target.textContent.trim()
                        }
                    }));
                });
                return {
                    observer: _observer,
                    target: target,
                    config: {
                        childList: true
                    }
                }
            };
            const react = (value) => {
                if (!value) {
                    return '😐';
                }
                if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
                    return '🙁';
                }
                return '🙂';
            };
            if (pluginManager.isEnabled(this.key, true)) {
                const pane = el.create({
                    classNames: ['pane']
                });
                pane.append(el.create({
                    text: 'Watch me while you type!',
                    classNames: ['spill-title']
                }));
                pane.append(el.create({
                    text: '😐',
                    classNames: ['spill']
                }));
                this.ui = el.create({
                    tag: 'details',
                    text: [this.title, 'summary']
                });
                this.ui.append(pane);
                this.observer = initObserver(el.$('.sb-hive-input-content'));
                this.app.addEventListener('sbaSpill', evt => {
                    reaction.textContent = react(evt.detail.text);
                });
            }
        }
    }

    class spoilers {
    	constructor(app, ...args) {
    		this.app = app;
    		this.args = args;
    		this.title = 'Spoilers';
    		this.key = 'spoilers';
    		this.optional = true;
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
    		if (pluginManager.isEnabled(this.key, true)) {
    			this.ui = el.create({
    				tag: 'details',
    				text: [this.title, 'summary']
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
    			this.app.addEventListener(pf('updateComplete'), () => {
    				update();
    			});
    		}
    	}
    }

    class header {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = settings$1.get('title');
            this.key = 'header';
            this.ui = el.create();
            const game = this.args[0];
            let params;
            let isLastTarget = false;
            const getDragParams = (evt) => {
                const gRect = game.getBoundingClientRect();
                const aRect = evt.target.getBoundingClientRect();
                const minT = gRect.top + window.pageYOffset;
                const pRect = plugin.parentElement.getBoundingClientRect();
                const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;
                return {
                    maxL: document.documentElement.clientWidth - aRect.width,
                    minT: minT,
                    maxT: minT + gAvailH,
                    offX: evt.clientX - aRect.x,
                    offY: evt.clientY - aRect.y,
                    margT: parseInt(getComputedStyle(evt.target).marginTop, 10)
                };
            };
            const getDropPosition = evt => {
                let left = Math.max(0, (evt.clientX - params.offX));
                left = Math.min(left, (params.maxL)) + 'px';
                let top = Math.max(params.minT, (evt.clientY + window.pageYOffset - params.margT - params.offY));
                top = Math.min(top, params.maxT) + 'px';
                return {
                    left,
                    top
                };
            };
            const makeDraggable = () => {
                [this.app, game].forEach(element => {
                    element.addEventListener('dragover', evt => {
                        evt.preventDefault();
                    });
                });
                this.app.addEventListener('dragstart', evt => {
                    if (!isLastTarget) {
                        evt.preventDefault();
                        return false;
                    }
                    evt.target.style.opacity = '.2';
                    params = getDragParams(evt);
                }, false);
                this.app.addEventListener('dragend', evt => {
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
                        this.app.dispatchEvent(new Event(pf('destroy')));
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
                        this.app.classList.toggle('minimized');
                    }
                }
            }));
            this.app.addEventListener('pointerdown', evt => {
                isLastTarget = !!evt.target.closest(`[data-plugin="${this.key}"]`);
            });
            this.app.addEventListener('pointerup', () => {
                isLastTarget = false;
            });
            makeDraggable();
        }
    }

    class surrender {
    	constructor(app, ...args) {
    		this.app = app;
    		this.args = args;
    		this.title = 'Surrender';
    		this.key = 'surrender';
    		this.optional = true;
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
    			if(usedOnce) {
    				return false;
    			}
    			observers$1.removeAll();
    			data.getList('remainders').forEach(term => {
    				resultList.append(buildEntry(term));
    			});
    			usedOnce = true;
    			return true;
    		};
    		if (pluginManager.isEnabled(this.key, true)) {
    			this.ui = el.create({
    				tag: 'details',
    				text: [this.title, 'summary']
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
    					click: function () {
    						resolve(el.$('.sb-wordlist-items', args[0]));
    					}
    				}
    			}));
    			this.ui.append(pane);
    		}
    	}
    }

    class stepsToSuccess {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = 'Steps to success';
            this.key = 'stepsToSuccess';
            this.optional = true;
            let observer;
            const steps = {};
            const initObserver = (target, frame) => {
                const _observer = new MutationObserver(mutationsList => {
                    const node = mutationsList.pop().target;
                    const title = el.$('.sb-modal-title', node);
                    if (title && title.textContent.trim() === 'Rankings') {
                        target.parentElement.style.opacity = 0;
                        retrieveRankings(target, frame);
                    }
                });
                return {
                    observer: _observer,
                    target: target,
                    config: {
                        childList: true
                    }
                }
            };
            const retrieveRankings = (modal, frame) => {
                const allPoints = data.getPoints('answers');
                el.$$('.sb-modal-list li', modal).forEach(element => {
                    const values = element.textContent.match(/([^\(]+) \((\d+)\)/);
                    steps[values[1]] = parseInt(values[2], 10);
                });
                steps['Queen Bee'] = allPoints;
                modal.parentElement.style.opacity = 0;
                el.$('.sb-modal-close', modal).click();
                observers$1.remove(observer);
                update(frame);
            };
            const update = (frame) => {
                frame.innerHTML = '';
                const tier = Object.values(steps).filter(entry => entry <= data.getPoints('foundTerms')).pop();
                for (const [key, value] of Object.entries(steps)) {
                    frame.append(el.create({
                        tag: 'tr',
                        classNames: value === tier ? ['sba-current'] : [],
                        cellTag: 'td',
                        cellData: [key, value]
                    }));
                }
            };
            if (pluginManager.isEnabled(this.key, true)) {
                this.ui = el.create({
                    tag: 'details',
                    text: [this.title, 'summary']
                });
                const pane = el.create({
                    tag: 'table',
                    classNames: ['pane']
                });
                const frame = el.create({
                    tag: 'tbody'
                });
                pane.append(frame);
                const popUpCloser = el.$('.sb-modal-buttons-section .pz-button__wrapper>button, sb-modal-close', el.$('.sb-modal-wrapper'));
                if(popUpCloser){
                    popUpCloser.click();
                }
                const modal = el.$('.sb-modal-wrapper');
                observer = initObserver(modal, frame);
                observers$1.add(observer);
                el.$('.sb-progress', args[0]).click();
                this.ui.append(pane);
                this.app.addEventListener(pf('updateComplete'), () => {
                    update(frame);
                });
            }
        }
    }

    class footer {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = `${settings$1.get('label')} ${settings$1.get('version')}`;
            this.key = 'footer';
            this.ui = el.create({
                tag: 'a',
                text: this.title,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
        }
    }

    class darkMode {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.ui = pluginManager.noUi;
            this.title = 'Dark Mode';
            this.key = 'darkMode';
            this.optional = true;
            this.defaultState = false;
            if (pluginManager.isEnabled(this.key, this.defaultState)) {
                el.$('body').classList.add(pf('dark', 'd'));
            } else {
                el.$('body').classList.remove(pf('dark', 'd'));
            }
        }
    }

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram):not(.sba-current){border-color:#333 !important}.sba{position:absolute;width:200px;background:inherit;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;background:#fff;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba .closer,.sba .minimizer{font-size:18px;font-weight:bold;position:absolute;top:0;line-height:32px;padding:0 10px;cursor:pointer}.sba .closer{right:0}.sba .minimizer{right:16px}.sba .minimizer:before{content:\"－\"}.sba.minimized details{display:none}.sba.minimized .minimizer:before{content:\"＋\"}.sba details{font-size:90%;margin-bottom:1px}.sba details[open] summary:before{content:\"－\"}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"＋\";position:absolute;left:8px}.sba .hive-action{margin:0 auto;display:block;font-size:100%;white-space:nowrap}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px}.sba tr:first-of-type td,.sba tr:first-of-type th{border-top:none}.sba tr td:first-of-type{text-align:left}.sba tr.sba-current{font-weight:bold;border-bottom:2px solid #f8cd05 !important}.sba th,.sba td{border:1px solid #dcdcdc;white-space:nowrap}.sba thead th{text-align:center;padding:4px 0}.sba tbody th{text-align:right}.sba tbody td{text-align:center;padding:4px 6px}.sba [data-plugin=footer] a{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-plugin=footer] a:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-plugin=surrender] .pane{padding:10px 5px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

    class styles {
        constructor(app, ...args) {
            this.app = app;
            this.args = args;
            this.title = 'Styles';
            this.key = 'styles';
            this.target = el.$('head');
            this.ui = el.create({
                tag: 'style',
                text: css.replace(/(\uFEFF|\\n)/gu, '')
            });
            app.addEventListener(pf('destroy'), () => {
                pluginManager.remove(this.key);
            });
        }
    }

    const game = el.$('#pz-game-root');
    const app = widget(game);
    if (app) {
        const oldInstance = el.$(`[data-id="${settings$1.get('repo')}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(pf('destroy')));
        }
        [
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
        ].forEach(plugin => {
            pluginManager.add(new plugin(app, game));
        });
        el.$('body').append(app);
        app.dispatchEvent(new Event(pf('launchComplete')));
    }

}());
