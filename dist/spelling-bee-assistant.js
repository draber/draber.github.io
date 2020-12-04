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
                                 events = {}
                             } = {}) => {
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
                        cellTag = 'td'
                    } = {}) => {
        if (tag === 'tr' && cellData.length) {
            return tableRow({classNames, events, cellData, cellTag});
        }
        if (tag === 'input' && attributes.type === 'checkbox' && text) {
            return labeledCheckbox({
                text,
                classNames,
                attributes,
                events
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
        }
        else {
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
        add: (observer, target, options) => {
            observer.observe(target, options);
            return observers.push(observer);
        },
        remove: observer => {
            observer.disconnect();
            observers = observers.filter(function (_observer) {
                return _observer !== observer;
            });
            return observers.length;
        },
        removeAll: function() {
            observers.forEach(observer => {
                this.remove(observer);
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

    const options = JSON.parse(localStorage.getItem(prefix + '-settings') || '{}');
    const get = key => {
        let current = Object.create(settings);
        for(let token of key.split('.')) {
            if(!current[token]){
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    const set = (key, value) => {
        if(typeof value === 'undefined'){
            debugger;
        }
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
    const getAll = () => {
        return settings;
    };
    const settings = {
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        version: version,
        options: options
    };
    var settings$1 = {
        get,
        set,
        getAll
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
    const pf = (term, mode = 'c') => {
        switch (mode) {
            case 'c':
                return toCamelCase(settings$1.get('prefix') + '_' + term);
            case 'd':
                return toDashCase(settings$1.get('prefix') + term.charAt(0).toUpperCase() + term.slice(1));
            default:
                return term;
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

    let observer;
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
    		args: {
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
    	observer = initObserver(app, resultList);
    	observers$1.add(observer.observer, observer.target, observer.args);
    	return app;
    }

    const noUi = 'noUi';
    const isDisabled = key => {
        return settings$1.get(`options.${key}.v`) === false;
    };
    const add = ({
        app,
        key,
        plugin,
        title = '',
        optional = false,
        observer,
        target = null
    } = {}) => {
        if(plugin !== noUi) {
            target = target || el.$(`[data-plugin="${key}"]`, app) || (() => {
                const _target = el.create({
                    data: {
                        plugin: key
                    }
                });
                app.append(_target);
                return _target;
            })();
            target.append(plugin);
        }
        if (optional) {
            settings$1.set(`options.${key}.v`, plugin instanceof HTMLElement);
            settings$1.set(`options.${key}.t`, title);
        }
        const evtName = pf(key);
        app.addEventListener(evtName, evt => {
            if (evt.detail.enabled) {
                add({
                    app,
                    plugin,
                    key,
                    title,
                    optional
                });
            } else {
                remove({
                    plugin,
                    key,
                    title
                });
            }
        });
        if (observer) {
            observers$1.add(observer.observer, observer.target, observer.args);
        }
        return plugin;
    };
    const remove = ({
        plugin,
        key = '',
        title = '',
        observer
    } = {}) => {
        if (plugin instanceof HTMLElement) {
            plugin.remove();
        }
        settings$1.set(`options.${key}.v`, false);
        if (observer) {
            observers$1.remove(observer.observer);
        }
        return null;
    };
    var plugins = {
        add,
        remove,
        isDisabled,
        noUi
    };

    let plugin = null;
    const title$1 = 'Score so far';
    const key = 'scoreSoFar';
    const optional = true;
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
    var scoreSoFar = {
        add: (app, game) => {
            if (!plugins.isDisabled(key)) {
                plugin = el.create({
                    tag: 'details',
                    text: [title$1, 'summary'],
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
                plugin.append(pane);
                app.addEventListener(pf('updateComplete'), () => {
                    update();
                });
            }
            return plugins.add({
                app,
                plugin,
                key,
                title: title$1,
                optional
            });
        },
        remove: () => {
            return plugins.remove({
                plugin,
                key,
                title: title$1
            });
        }
    };

    let plugin$1;
    const title$2 = 'Set-up';
    const key$1 = 'setUp';
    const optional$1 = false;
    const populate = (app, pane) => {
    	for (const [key, option] of Object.entries(settings$1.getAll().options)) {
    		const li = el.create({
    			tag: 'li'
    		});
    		li.append(el.create({
    			tag: 'input',
    			text: option.t,
    			attributes: {
    				type: 'checkbox',
    				name: key,
    				checked: !plugins.isDisabled(key)
    			},
    			events: {
    				click: function () {
    					app.dispatchEvent(new CustomEvent(pf(key), {
    						detail: {
    							enabled: this.checked
    						}
    					}));
    				}
    			}
    		}));
    		pane.append(li);
    	}
    };
    var setUp = {
    	add: (app, game) => {
    		plugin$1 = el.create({
    			tag: 'details',
    			text: [title$2, 'summary']
    		});
    		const pane = el.create({
    			tag: 'ul',
    			classNames: ['pane']
    		});
    		plugin$1.append(pane);
    		app.addEventListener(pf('launchComplete'), () => {
    			populate(app, pane);
    		});
    		return plugins.add({
    			app,
    			plugin: plugin$1,
    			key: key$1,
    			title: title$2,
    			optional: optional$1
    		});
    	},
    	remove: () => {
    		return plugins.remove({
    			plugin: plugin$1,
    			key: key$1,
    			title: title$2
    		});
    	}
    };

    let plugin$2;
    const title$3 = 'Spill the beans';
    const key$2 = 'spillTheBeans';
    const optional$2 = true;
    let observer$1;
    const react = (value) => {
        if (!value) {
            return '😐';
        }
        if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
            return '🙁';
        }
        return '🙂';
    };
    const initObserver$1 = (app, target) => {
        const _observer = new MutationObserver(mutationsList => {
            app.dispatchEvent(new CustomEvent(pf('spill'), {
                detail: {
                    text: mutationsList.pop().target.textContent.trim()
                }
            }));
        });
        return {
            observer: _observer,
            target: target,
            args: {
                childList: true
            }
        }
    };
    var spillTheBeans = {
        add: (app, game) => {
            if (!plugins.isDisabled(key$2)) {
                observer$1 = initObserver$1(app, el.$('.sb-hive-input-content', game));
                const pane = el.create({
                    classNames: ['pane']
                });
                const description = el.create({
                    text: 'Watch me while you type!',
                    classNames: ['spill-title']
                });
                const reaction = el.create({
                    text: '😐',
                    classNames: ['spill']
                });
                pane.append(description);
                pane.append(reaction);
                plugin$2 = el.create({
                    tag: 'details',
                    text: [title$3, 'summary']
                });
                app.addEventListener('sbaSpill', evt => {
                    reaction.textContent = react(evt.detail.text);
                });
                plugin$2.append(pane);
            }
            return plugins.add({
                app,
                plugin: plugin$2,
                key: key$2,
                title: title$3,
                optional: optional$2,
                observer: observer$1
            });
        },
        remove: () => {
            return plugins.remove({
                plugin: plugin$2,
                key: key$2,
                title: title$3,
                observer: observer$1
            });
        }
    };

    let plugin$3;
    const title$4 = 'Spoilers';
    const key$3 = 'spoilers';
    const optional$3 = true;
    const tbody$1 = el.create({
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
    const update$1 = () => {
    	tbody$1.innerHTML = '';
    	getCellData().forEach(cellData => {
    		tbody$1.append(el.create({
    			tag: 'tr',
    			cellData: cellData
    		}));
    	});
    };
    var spoilers = {
    	add: (app, game) => {
            if (!plugins.isDisabled(key$3)) {
    			plugin$3 = el.create({
    				tag: 'details',
    				text: [title$4, 'summary']
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
    			pane.append(tbody$1);
    			update$1();
    			plugin$3.append(pane);
    			app.addEventListener(pf('updateComplete'), () => {
    				update$1();
    			});
    		}
    		return plugins.add({
    			app,
    			plugin: plugin$3,
    			key: key$3,
    			title: title$4,
    			optional: optional$3
    		});
    	},
    	remove: () => {
    		return plugins.remove({
    			plugin: plugin$3,
    			key: key$3,
    			title: title$4
    		});
    	}
    };

    let plugin$4;
    const title$5 = 'Header';
    const key$4 = 'header';
    let params;
    let isLastTarget = false;
    const getDragParams = (evt, game) => {
        const gRect = game.getBoundingClientRect();
        const aRect = evt.target.getBoundingClientRect();
        const minT = gRect.top + window.pageYOffset;
        const pRect = plugin$4.parentElement.getBoundingClientRect();
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
    const makeDraggable = (app, game) => {
        [app, game].forEach(element => {
            element.addEventListener('dragover', evt => {
                evt.preventDefault();
            });
        });
        app.addEventListener('dragstart', evt => {
            if (!isLastTarget) {
                evt.preventDefault();
                return false;
            }
            evt.target.style.opacity = '.2';
            params = getDragParams(evt, game);
        }, false);
        app.addEventListener('dragend', evt => {
            Object.assign(evt.target.style, getDropPosition(evt));
            evt.target.style.opacity = '1';
        });
    };
    var header = {
        add: (app, game) => {
            plugin$4 = el.create();
            const title = el.create({
                text: settings$1.get('title'),
                attributes: {
                    title: 'Hold the mouse down to drag'
                },
                classNames: ['dragger']
            });
            plugin$4.append(title);
            const closer = el.create({
                tag: 'span',
                text: '×',
                attributes: {
                    title: 'Close'
                },
                classNames: ['closer'],
                events: {
                    click: () => {
                        app.dispatchEvent(new Event(pf('destroy')));
                    }
                }
            });
            const minimizer = el.create({
                tag: 'span',
                attributes: {
                    title: 'Minimize'
                },
                classNames: ['minimizer'],
                events: {
                    click: () => {
                        app.classList.toggle('minimized');
                    }
                }
            });
            app.addEventListener('pointerdown', evt => {
                isLastTarget = !!evt.target.closest(`[data-plugin="${key$4}"]`);
            });
            app.addEventListener('pointerup', evt => {
                isLastTarget = false;
            });
            plugin$4.append(minimizer);
            plugin$4.append(closer);
            makeDraggable(app, game);
            return plugins.add({
                app,
                plugin: plugin$4,
                key: key$4
            });
        },
        remove: () => {
            return plugins.remove({
                plugin: plugin$4,
                key: key$4,
                title: title$5
            });
        }
    };

    let plugin$5;
    const title$6 = 'Surrender';
    const key$5 = 'surrender';
    const optional$4 = true;
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
    	observers$1.removeAll();
    	data.getList('remainders').forEach(term => {
    		resultList.append(buildEntry(term));
    	});
    };
    var surrender = {
    	add: (app, game) => {
    		if (!plugins.isDisabled(key$5)) {
    			plugin$5 = el.create({
    				tag: 'details',
    				text: [title$6, 'summary']
    			});
    			const pane = el.create({
    				classNames: ['pane']
    			});
    			const button = el.create({
    				tag: 'button',
    				classNames: ['hive-action'],
    				text: 'Display answers',
    				attributes: {
    					type: 'button'
    				},
    				events: {
    					click: function () {
    						resolve(el.$('.sb-wordlist-items', game));
    					}
    				}
    			});
    			pane.append(button);
    			plugin$5.append(pane);
    		}
    		return plugins.add({
    			app,
    			plugin: plugin$5,
    			key: key$5,
    			title: title$6,
    			optional: optional$4
    		});
    	},
    	remove: () => {
    		return plugins.remove({
    			plugin: plugin$5,
    			key: key$5,
    			title: title$6
    		});
    	}
    };

    let plugin$6;
    const title$7 = 'Steps to success';
    const key$6 = 'stepsToSuccess';
    const optional$5 = true;
    let observer$2;
    const steps = {};
    const initObserver$2 = (target, frame) => {
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
            args: {
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
        observers$1.remove(observer$2.observer);
        update$2(frame);
    };
    const update$2 = (frame) => {
        frame.innerHTML = '';
        const tier = Object.values(steps).filter(entry => entry <= data.getPoints('foundTerms')).pop();
        for (const [key, value] of Object.entries(steps)) {
            frame.append(el.create({
                tag: 'tr',
                classNames: value === tier ? ['current'] : [],
                cellTag: 'td',
                cellData: [key, value]
            }));
        }
    };
    var stepsToSuccess = {
        add: (app, game) => {
            if (!plugins.isDisabled(key$6)) {
                plugin$6 = el.create({
                    tag: 'details',
                    text: [title$7, 'summary']
                });
                const pane = el.create({
                    tag: 'table',
                    classNames: ['pane']
                });
                const frame = el.create({
                    tag: 'tbody'
                });
                pane.append(frame);
                plugin$6.addEventListener('toggle', () => {
                    if (plugin$6.open && !frame.hasChildNodes()) {
                        const modal = el.$('.sb-modal-wrapper');
                        observer$2 = initObserver$2(modal, frame);
                        observers$1.add(observer$2.observer, observer$2.target, observer$2.args);
                        el.$('.sb-progress', game).click();
                    }
                });
                plugin$6.append(pane);
                app.addEventListener(pf('updateComplete'), () => {
                    update$2(frame);
                });
            }
            return plugins.add({
                app,
                plugin: plugin$6,
                key: key$6,
                title: title$7,
                optional: optional$5
            });
        },
        remove: () => {
            return plugins.remove({
                plugin: plugin$6,
                key: key$6,
                title: title$7
            });
        }
    };

    let plugin$7;
    const title$8 = 'Footer';
    const key$7 = 'footer';
    var footer = {
        add: (app, game) => {
            plugin$7 = el.create({
                tag: 'a',
                text: `${settings$1.get('label')} ${settings$1.get('version')}`,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
            return plugins.add({
                app,
                key: key$7,
                plugin: plugin$7
            });
        },
        remove: () => {
            return plugins.remove({
                plugin: plugin$7,
                key: key$7,
                title: title$8
            });
        }
    };

    let plugin$8 = plugins.noUi;
    const title$9 = 'Dark Mode';
    const key$8 = 'darkMode';
    const optional$6 = true;
    const getInitialState = () => {
        if(typeof settings$1.get(`options.${key$8}.v`) === 'undefined'){
            return false;
        }
        return !plugins.isDisabled(key$8);
    };
    var darkMode = {
        add: (app, game) => {
            app.addEventListener(pf(key$8), evt => {
                if (evt.detail.enabled) {
                    el.$('body').classList.add(pf('dark', 'd'));
                    settings$1.set(`options.${key$8}.v`, true);
                } else {
                    el.$('body').classList.remove(pf('dark', 'd'));
                    settings$1.set(`options.${key$8}.v`, false);
                }
            });
            app.dispatchEvent(new CustomEvent(pf(key$8), {
                detail: {
                    enabled: getInitialState()
                }
            }));
            return plugins.add({
                app,
                plugin: plugin$8,
                key: key$8,
                title: title$9,
                optional: optional$6
            });
        },
        remove: () => {
            app.dispatchEvent(new CustomEvent(pf(key$8), {
                detail: {
                    enabled: false
                }
            }));
        }
    };

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram){border-color:#333 !important}.sba{position:absolute;width:200px;background:inherit;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;background:#fff;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba .closer,.sba .minimizer{font-size:18px;font-weight:bold;position:absolute;top:0;line-height:32px;padding:0 10px;cursor:pointer}.sba .closer{right:0}.sba .minimizer{right:16px}.sba .minimizer:before{content:\"－\"}.sba.minimized details{display:none}.sba.minimized .minimizer:before{content:\"＋\"}.sba details{font-size:90%;margin-bottom:1px}.sba details[open] summary:before{content:\"－\"}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"＋\";position:absolute;left:8px}.sba .hive-action{margin:0 auto;display:block;font-size:100%;white-space:nowrap}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px}.sba tr:first-of-type td,.sba tr:first-of-type th{border-top:none}.sba tr td:first-of-type{text-align:left}.sba tr.current{font-weight:bold;border-bottom:2px solid #f8cd05}.sba th,.sba td{border:1px solid #dcdcdc;white-space:nowrap}.sba thead th{text-align:center;padding:4px 0}.sba tbody th{text-align:right}.sba tbody td{text-align:center;padding:4px 6px}.sba [data-plugin=footer] a{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-plugin=footer] a:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-plugin=surrender] .pane{padding:10px 5px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

    let plugin$9;
    const title$a = 'Styles';
    const key$9 = 'styles';
    const remove$1 = () => {
        return plugins.remove({
            plugin: plugin$9,
            key: key$9,
            title: title$a
        });
    };
    var styles = {
        add: (app, game) => {
            plugin$9 = el.create({
                tag: 'style',
                text: css.replace(/(\uFEFF|\\n)/gu, '')
            });
            app.addEventListener(pf('destroy'), () => {
                remove$1();
            });
            const target = el.$('head');
            return plugins.add({
                app,
                plugin: plugin$9,
                key: key$9,
                target
            });
        },
        remove: remove$1
    };

    const game = el.$('#pz-game-root');
    const app$1 = widget(game);
    if (app$1) {
        const oldInstance = el.$(`[data-id="${settings$1.get('repo')}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(pf('destroy')));
        }
        settings$1.get('prefix');
        settings$1.get('options.darkMode');
        settings$1.get('options.darkMode.v');
        settings$1.get('options.darkMode.x');
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
            plugin.add(app$1, game);
        });
        el.$('body').append(app$1);
        app$1.dispatchEvent(new Event(pf('launchComplete')));
    }

}());
