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

    const stored = JSON.parse(localStorage.getItem(prefix + '-settings') || '{}');
    const get = key => {
        return settings[key] || settings.options[key] || null;
    };
    const set = (key, value) => {
        settings.options[key] = value;
        localStorage.setItem(prefix + '-settings', JSON.stringify(settings.options));
    };
    const getAll = () => {
        return settings;
    };
    const getStored = () => {
        return stored;
    };
    const settings = {
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        version: version,
        options: {
            ...{
                darkMode: {
                    v: stored.darkMode ? stored.darkMode.v : document.body.classList.contains(prefix + '-dark'),
                    t: 'Dark Mode'
                }
            },
            ...stored
        }
    };
    var settings$1 = {
        get,
        set,
        getAll,
        getStored
    };

    const prefix$1 = settings$1.get('prefix');
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
                return toCamelCase(prefix$1 + '_' + term);
            case 'd':
                return toDashCase(prefix$1 + term.charAt(0).toUpperCase() + term.slice(1));
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
    		observer: _observer, target: target, args: {
    			childList: true
    		}
    	}
    };
    function widget(game) {
        if(!game || !window.gameData) {
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
    	events[pf('darkMode')] = evt => {
    		if (evt.detail.enabled) {
    			document.body.classList.add(pf('dark', 'd'));
    		} else {
    			document.body.classList.remove(pf('dark', 'd'));
    		}
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
    	app.dispatchEvent(new CustomEvent(pf('darkMode'), {
    		detail: {
    			enabled: settings$1.get('darkMode')
    		}
    	}));
    	return app;
    }

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram){border-color:#333 !important}.sba{position:absolute;width:200px;background:inherit;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba .closer,.sba .minimizer{font-size:18px;font-weight:bold;position:absolute;top:0;line-height:32px;padding:0 10px;cursor:pointer}.sba .closer{right:0}.sba .minimizer{right:16px}.sba .minimizer:before{content:\"－\"}.sba.minimized details{display:none}.sba.minimized .minimizer:before{content:\"＋\"}.sba details{font-size:90%;margin-bottom:1px}.sba details[open] summary:before{content:\"－\"}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"＋\";position:absolute;left:8px}.sba .hive-action{margin:0 auto;display:block;font-size:100%;white-space:nowrap}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px}.sba tr td:first-of-type{text-align:left}.sba tr.current{font-weight:bold;color:#f8cd05}.sba th,.sba td{border:1px solid #dcdcdc;white-space:nowrap}.sba thead th{text-align:center;padding:4px 0}.sba tbody th{text-align:right}.sba tbody td{text-align:center;padding:4px 6px}.sba [data-plugin=footer] a{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-plugin=footer] a:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-plugin=surrender] .pane{padding:10px 5px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

    let styles;
    var styles$1 = {
    	add: (app) => {
    		styles = el.create({
    			tag: 'style',
    			text: css.replace(/(\uFEFF|\\n)/gu, '')
    		});
    		app.addEventListener(pf('destroy'), () => {
    			styles.remove();
    		});
    		return el.$('head').append(styles);
    	},
    	remove: () => {
    		return styles.remove();
    	}
    };

    const stored$1 = settings$1.getStored();
    const add = (app, plugin, key, title, optional, observer = null) => {
        let slot = el.$(`[data-plugin="${key}"]`, app);
        if(!slot){
            slot = el.create({
                data: {
                    plugin: key
                }});
            app.append(slot);
        }
        const available = (stored$1[key] ? stored$1[key].v : optional);
        if(optional) {
           settings$1.set(key, { v: available, t: `Display "${title}"` });
        }
        const evtName = pf(key);
        app.addEventListener(evtName, evt => {
            if(evt.detail.enabled){
                add(app, plugin, key, title, optional);
            }
            else {
                remove(plugin, key, title);
            }
        });
        if(observer) {
            observers$1.add(observer.observer, observer.target, observer.args);
        }
        slot.append(plugin);
        return plugin;
    };
    const remove = (plugin, key, title, observer = null) => {
        if(!plugin) {
            console.error(`Plugin "${title}" not initialized`);
            return null;
        }
        plugin.remove();
        settings$1.set(key, { v: false, t: `Display ${title}` });
        if(observer){
            observers$1.remove(observer.observer);
        }
        return null;
    };
    var plugins = {
        add,
        remove
    };

    let plugin;
    const title$1 = 'Score so far';
    const key = 'scoreSoFar';
    const optional = true;
    const tbody = el.create({tag: 'tbody'});
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
            if (settings$1.get(key) === false) {
                return false;
            }
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
            return plugins.add(app, plugin, key, title$1, optional);
        },
        remove: () => {
            return plugins.remove(plugin, key, title$1);
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
    			text: option.t ,
    			attributes: {
    				type: 'checkbox',
    				name: key,
    				checked: option.v
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
    		return plugins.add(app, plugin$1, key$1, title$2, optional$1);
    	},
    	remove: () => {
    		return plugins.remove(plugin$1, key$1, title$2);
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
            observer: _observer, target: target, args: {
                childList: true
            }
        }
    };
    var spillTheBeans = {
        add: (app, game) => {
            if (settings$1.get(key$2) === false) {
                return false;
            }
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
            return plugins.add(app, plugin$2, key$2, title$3, optional$2, observer$1);
        },
        remove: () => {
            return plugins.remove(plugin$2, key$2, title$3, observer$1);
        }
    };

    let plugin$3;
    const title$4 = 'Spoilers';
    const key$3 = 'spoilers';
    const optional$3 = true;
    const tbody$1 = el.create({ tag: 'tbody'});
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
    		if (settings$1.get(key$3) === false) {
    			return false;
    		}
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
    		return plugins.add(app, plugin$3, key$3, title$4, optional$3);
    	},
    	remove: () => {
    		return plugins.remove(plugin$3, key$3, title$4);
    	}
    };

    let plugin$4;
    const title$5 = 'Header';
    const key$4 = 'header';
    const optional$4 = false;
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
            if(!isLastTarget){
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
            return plugins.add(app, plugin$4, key$4, title, optional$4);
        },
        remove: () => {
            return plugins.remove(plugin$4, key$4, title$5);
        }
    };

    let plugin$5;
    const title$6 = 'Surrender';
    const key$5 = 'surrender';
    const optional$5 = true;
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
    		if (settings$1.get(key$5) === false) {
    			return false;
    		}
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
    		return plugins.add(app, plugin$5, key$5, title$6, optional$5);
    	},
    	remove: () => {
    		return plugins.remove(plugin$5, key$5, title$6);
    	}
    };

    let plugin$6;
    const title$7 = 'Steps to success';
    const key$6 = 'stepsToSuccess';
    const optional$6 = true;
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
            observer: _observer, target: target, args: {
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
            if (settings$1.get(key$6) === false) {
                return false;
            }
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
            return plugins.add(app, plugin$6, key$6, title$7, optional$6);
        },
        remove: () => {
            return plugins.remove(plugin$6, key$6, title$7);
        }
    };

    let plugin$7;
    const title$8 = 'Footer';
    const key$7 = 'footer';
    const optional$7 = false;
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
            return plugins.add(app, plugin$7, key$7, title$8, optional$7);
        },
        remove: () => {
            return plugins.remove(plugin$7, key$7, title$8);
        }
    };

    const game = el.$('#pz-game-root');
    const app = widget(game);
    if (app) {
        const oldInstance = el.$(`[data-id="${settings$1.get('repo')}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(pf('destroy')));
        }
        document.body.append(app);
        [header, scoreSoFar, spoilers, spillTheBeans, stepsToSuccess, surrender, setUp, footer].forEach(plugin => {
            plugin.add(app, game);
        });
        styles$1.add(app);
        app.dispatchEvent(new Event(pf('launchComplete')));
    }

}());
