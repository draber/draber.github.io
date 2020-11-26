(function () {
	'use strict';

	const $ = (expr, container) => {
		return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
	};
	const $$ = (expr, container) => {
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
		classNames = [],
		attributes = {},
		data = {},
		events = {},
		cellData = [],
		cellTag = 'td'
	} = {}) => {
		if (tag === 'tr' && cellData.length) {
			return tableRow({ classNames, events, cellData, cellTag });
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
		for (const [key, val] of Object.entries(attributes)) {
			if (val !== '') {
				el.setAttribute(key, val);
			}
		}
		for (const [key, val] of Object.entries(data)) {
			el.dataset[key] = val;
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
	        observers.push(observer);
	        return true;
	    },
	    remove: observer => {
	        observer.disconnect();
	        observers = observers.filter(function (_observer) {
	            return _observer !== observer;
	        });
	    },
	    removeAll: function() {
	        observers.forEach(observer => {
	            this.remove(observer);
	        });
	    }
	};

	var version = "2.0.0";

	var label = "Spelling Bee Assistant";
	var title = "Assistant";
	var url = "https://spelling-bee-assistant.app/";
	var repo = "draber/draber.github.io.git";

	const stored = JSON.parse(localStorage.getItem('sba-settings') || '{}');
	const get = key => {
	    return settings[key] || settings.options[key] || null;
	};
	const set = (key, value) => {
	    settings.options[key] = value;
	    localStorage.setItem('sba-settings', JSON.stringify(settings.options));
	};
	const getAll = () => {
	    return settings;
	};
	const getStored = () => {
	    return stored;
	};
	let settings = {
	    label: label,
	    title: title,
	    url: url,
	    repo: repo,
	    version: version,
	    options: {
	        ...{
	            darkMode: {
	                v: stored.darkMode ? stored.darkMode.v : document.body.classList.contains('sba-dark'),
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

	const lists = {
	    answers: window.gameData.today.answers,
	    pangrams: window.gameData.today.pangrams,
	    foundTerms: [],
	    foundPangrams: [],
	    remainders: []
	};
	let app;
	let resultContainer;
	const getList = (type) => {
	    return lists[type];
	};
	const getCount = (type) => {
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
	const updateLists = () => {
	    lists.foundTerms = [];
	    lists.foundPangrams = [];
	    el.$$('li', resultContainer).forEach(node => {
	        const term = node.textContent;
	        lists.foundTerms.push(term);
	        if (lists.pangrams.includes(term)) {
	            lists.foundPangrams.push(term);
	            node.classList.add('sb-pangram');
	        }
	    });
	    lists.remainders = lists.answers.filter(term => !lists.foundTerms.includes(term));
	    app.dispatchEvent(new Event('sbaUpdateComplete'));
	};
	const init = (_app, _resultContainer) => {
	    resultContainer = _resultContainer;
	    app = _app;
	    updateLists();
	    app.addEventListener('sbaUpdate', evt => {
	        updateLists();
	    });
	};
	var data = {
	    init,
	    getList,
	    getCount,
	    getPoints
	};

	const addObserver = (app, target) => {
		observers$1.add(new MutationObserver(mutationsList => {
			app.dispatchEvent(new CustomEvent('sbaUpdate', {
				detail: {
					text: mutationsList.pop().addedNodes[0]
				}
			}));
		}), target, {
			childList: true
		});
	};
	function widget(resultContainer) {
		const app = el.create({
			attributes: {
				draggable: true
			},
			data: {
				id: settings$1.get('repo')
			},
			classNames: ['sba'],
			events: {
				sbaDestroy: evt => {
					observers$1.removeAll();
					evt.target.remove();
				},
				sbaDarkMode: evt => {
					if (evt.detail.enabled) {
						document.body.classList.add('sba-dark');
					} else {
						document.body.classList.remove('sba-dark');
					}
				}
			}
		});
		data.init(app, resultContainer);
		addObserver(app, resultContainer);
		app.dispatchEvent(new CustomEvent('sbaDarkMode', {
			detail: {
				enabled: settings$1.get('darkMode')
			}
		}));
		return app;
	}

	var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-content-box{position:relative}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .sba summary,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram){border-color:#333 !important}.sba{position:absolute;width:200px;right:-210px;top:16px;background:inherit;z-index:3;box-sizing:border-box;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid;padding:0 10px 5px}.sba *,.sba *:before,.sba *:after{box-sizing:inherit}.sba *{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba.dragging{opacity:.5;border-style:dashed}.sba .closer{font-size:20px;font-weight:bold;position:absolute;top:0;right:0;line-height:32px;padding:0 10px;cursor:pointer}.sba details{font-size:90%;margin-bottom:1px}.sba details[open] summary:before{content:\"－\"}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"＋\";position:absolute;left:8px}.sba .hive-action{margin:0 auto;display:block;font-size:100%;white-space:nowrap}.sba .no-confirmation{display:inline-block;margin:0 0 10px 0;font-size:80%}.sba .no-confirmation input{margin:5px;position:relative;top:2px}.sba table,.sba .frame{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px;table-layout:fixed}.sba tr td:first-of-type{text-align:left}.sba tr.done{font-weight:bold}.sba tr.done:last-of-type{color:#f8cd05}.sba th,.sba td{border:1px solid #dcdcdc;padding:4px 6px}.sba thead th{text-align:center}.sba tbody th{text-align:right}.sba tbody td{text-align:center}.sba [data-plugin=footer] a{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-plugin=footer] a:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.frame{padding:5px}.sba [data-plugin=surrender] .frame{padding:10px 5px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

	let styles;
	var styles$1 = {
		add: (app) => {
			styles = el.create({
				tag: 'style',
				text: css.replace(/(\uFEFF|\\n)/u, '')
			});
			app.addEventListener('sbaDestroy', evt => {
				styles.remove();
			});
			return el.$('head').append(styles);
		},
		remove: () => {
			return styles.remove();
		}
	};

	const stored$1 = settings$1.getStored();
	const add = (app, plugin, key, title, optional) => {
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
	    const evtName = 'sba' + key.charAt(0).toUpperCase() + key.slice(1);
	    app.addEventListener(evtName, evt => {
	        if(evt.detail.enabled){
	            add(app, plugin, key, title, optional);
	        }
	        else {
	            remove(plugin, key, title);
	        }
	    });
	    slot.append(plugin);
	};
	const remove = (plugin, key, title) => {
	    if(!plugin) {
	        console.error(`Plugin "${title}" not initialized`);
	        return null;
	    }
	    const slot = el.$(`[data-plugin="${key}"]`);
	    slot.removeChild(slot.firstChild);
	    settings$1.set(key, { v: false, t: `Display ${title}` });
	    return null;
	};
	var plugins = {
	    add,
	    remove
	};

	const title$1 = "Score so far";
	const key = 'scoreSoFar';
	const optional = true;
	let plugin;
	const tbody = el.create({ tag: 'tbody'});
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
		add: (app) => {
			if(settings$1.get(key) === false){
				return false;
			}
			plugin = el.create({
				tag: 'details',
				text: [title$1, 'summary'],
				attributes: {
					open: true
				}
			});
			const content = el.create({ tag: 'table'});
			const thead = el.create({ tag: 'thead'});
			thead.append(el.create({
				tag: 'tr',
				cellTag: 'th',
				cellData: ['', 'Found', 'Missing', 'Total']
			}));
			content.append(thead);
			content.append(tbody);
			update();
			plugin.append(content);
			app.addEventListener('sbaUpdateComplete', evt => {
				update();
			});
			return plugins.add(app, plugin, key, title$1, optional);
		},
		remove: () => {
			plugin = plugins.remove(plugin, key, title$1);
			return true;
		}
	};

	const title$2 = "Settings";
	const key$1 = 'settings';
	const optional$1 = false;
	let plugin$1;
	const populate = (app, frame) => {
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
					click: function (evt) {
						const evtName = 'sba' + key.charAt(0).toUpperCase() + key.slice(1);
						app.dispatchEvent(new CustomEvent(evtName, {
							detail: {
								enabled: this.checked
							}
						}));
					}
				}
			}));
			frame.append(li);
		}};
	var setUp = {
		add: (app) => {
			plugin$1 = el.create({
				tag: 'details',
				text: [title$2, 'summary']
			});
			const frame = el.create({
				tag: 'ul',
				classNames: ['frame']
			});
			plugin$1.append(frame);
			app.addEventListener('sbaLaunchComplete', evt => {
				populate(app, frame);
			});
			return plugins.add(app, plugin$1, key$1, title$2, optional$1);
		},
		remove: () => {
			plugin$1 = plugins.remove(plugin$1, key$1, title$2);
			return true;
		}
	};

	const title$3 = "Spill the beans";
	const key$2 = 'spillTheBeans';
	const optional$2 = true;
	let observer;
	let plugin$2;
	const react = (value) => {
		if (!value) {
			return '😐';
		}
		if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
			return '🙁';
		}	return '🙂';
	};
	const addObserver$1 = (app, target) => {
		observer = new MutationObserver(mutationsList => {
			app.dispatchEvent(new CustomEvent('sbaSpill', {
				detail: {
					text: mutationsList.pop().target.textContent.trim()
				}
			}));
		});
		observers$1.add(observer, target, {
			childList: true
		});
	};
	var spillTheBeans = {
		add: (app, observerTarget) => {
			if (settings$1.get(key$2) === false) {
				return false;
			}
			addObserver$1(app, observerTarget);
			const frame = el.create({
				classNames: ['frame']
			});
			const description = el.create({
				text: 'Watch me while you type!',
				classNames: ['spill-title']
			});
			const reaction = el.create({
				text: '😐',
				classNames: ['spill']
			});
			frame.append(description);
			frame.append(reaction);
			plugin$2 = el.create({
				tag: 'details',
				text: [title$3, 'summary']
			});
			app.addEventListener('sbaSpill', evt => {
				reaction.textContent = react(evt.detail.text);
			});
			plugin$2.append(frame);
			return plugins.add(app, plugin$2, key$2, title$3, optional$2);
		},
		remove: () => {
			plugin$2 = plugins.remove(plugin$2, key$2, title$3);
			observers$1.remove(observer);
			return true;
		}
	};

	const title$4 = "Spoilers";
	const key$3 = 'spoilers';
	const optional$3 = true;
	let plugin$3;
	const tbody$1 = el.create({ tag: 'tbody'});
	const getCellData = () => {
		const counts = {};
		const answers = data.getList('answers');
		const foundTerms = data.getList('foundTerms');
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
	    answers.forEach(term => {
	        counts[term.length] = counts[term.length] || {
	            found: 0,
	            missing: 0,
	            total: 0
	        };
	        if (foundTerms.includes(term)) {
	            counts[term.length].found++;
	        } else {
	            counts[term.length].missing++;
	        }
	        counts[term.length].total++;
		});
		keys = Object.keys(counts);
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
		add: (app) => {
			if (settings$1.get(key$3) === false) {
				return false;
			}
			plugin$3 = el.create({
				tag: 'details',
				text: [title$4, 'summary']
			});
			const content = el.create({ tag: 'table'});
			const thead = el.create({ tag: 'thead'});
			thead.append(el.create({
				tag: 'tr',
				cellTag: 'th',
				cellData: ['', 'Found', 'Missing', 'Total']
			}));
			content.append(thead);
			content.append(tbody$1);
			update$1();
			plugin$3.append(content);
			app.addEventListener('sbaUpdateComplete', evt => {
				update$1();
			});
			return plugins.add(app, plugin$3, key$3, title$4, optional$3);
		},
		remove: () => {
			plugin$3 = plugins.remove(plugin$3, key$3, title$4);
			return true;
		}
	};

	const title$5 = 'Header';
	const key$4 = 'header';
	const optional$4 = false;
	let plugin$4;
	const makeDraggable = (plugin, app) => {
	    let headerHeight;
	    let screenWidth;
	    app.addEventListener('dragstart', (evt) => {
	        headerHeight = el.$('header').clientHeight;
	        screenWidth = screen.availWidth;
	        evt.stopPropagation();
	        const style = getComputedStyle(app);
	        evt.dataTransfer.effectAllowed = 'move';
	        app.classList.add('dragging');
	        app.dataset.right = style.getPropertyValue('right');
	        app.dataset.top = style.getPropertyValue('top');
	        app.dataset.mouseX = evt.clientX;
	        app.dataset.mouseY = evt.clientY;
	    }, false);
	    app.addEventListener('dragend', (evt) => {
	        evt.stopPropagation();
	        const pos = {
	            x: parseInt(app.dataset.right) - (evt.clientX - app.dataset.mouseX),
	            y: parseInt(app.dataset.top) + (evt.clientY - app.dataset.mouseY)
	        };
	        app.style.right = pos.x + 'px';
	        app.style.top = pos.y + 'px';
	        app.classList.remove('dragging');
	        const rect = app.getBoundingClientRect();
	        const neededW = rect.x + rect.width;
	        console.log({rw: rect.x, sw: screenWidth, swa: neededW, px: pos.x});
	        if(rect.x < 0) {
	            app.style.right = pos.x + rect.x + 'px';
	        }
	        else if(rect.x + rect.width > screenWidth) {
	            app.style.right = pos.x - (neededW - screenWidth) + 'px';
	        }
	        if(rect.y < headerHeight) {
	            app.style.top = pos.y - (headerHeight - rect.y) + 'px';
	        }
	    }, false);
	};
	var header = {
	    add: (app) => {
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
	                    app.dispatchEvent(new Event('sbaDestroy'));
	                }
	            }
	        });
	        plugin$4.append(closer);
	        makeDraggable(plugin$4, app);
	        return plugins.add(app, plugin$4, key$4, title, optional$4);
	    },
	    remove: () => {
	        plugin$4 = plugins.remove(plugin$4, key$4, title$5);
	        return true;
	    }
	};

	const title$6 = "Surrender";
	const key$5 = 'surrender';
	const optional$5 = true;
	let plugin$5;
	const pangrams = window.gameData.today.pangrams;
	const buildEntry = term => {
		const entry = el.create({
			tag: 'li',
			classNames: pangrams.includes(term) ? ['sb-anagram', 'sb-pangram'] : ['sb-anagram']
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
	const resolve = (resultContainer) => {
		observers$1.removeAll();
		data.getList('remainders').forEach(term => {
			resultContainer.append(buildEntry(term));
		});
	};
	var surrender = {
		add: (app, resultContainer) => {
			if (settings$1.get(key$5) === false) {
				return false;
			}
			plugin$5 = el.create({
				tag: 'details',
				text: [title$6, 'summary']
			});
			const frame = el.create({
				classNames: ['frame']
			});
			const button = el.create({
				tag: 'button',
				classNames: ['hive-action'],
				text: 'Display answers',
				attributes: {
					type: 'button'
				},
				events: {
					click: function (evt) {
						resolve(resultContainer);
					}
				}
			});
			frame.append(button);
			plugin$5.append(frame);
			return plugins.add(app, plugin$5, key$5, title$6, optional$5);
		},
		remove: () => {
			plugin$5 = plugins.remove(plugin$5, key$5, title$6);
			return true;
		}
	};

	const title$7 = "Steps to success";
	const key$6 = 'steps';
	const optional$6 = true;
	let observer$1;
	let plugin$6;
	const steps = {};
	const allPoints = data.getPoints('answers');
	const addObserver$2 = (target, frame) => {
	    observer$1 = new MutationObserver(mutationsList => {
	        const node = mutationsList.pop().target;
	        const title = el.$('.sb-modal-title', node);
	        if (title && title.textContent.trim() === 'Rankings') {
	            init$1(target, frame);
	        }
	    });
	    observers$1.add(observer$1, target, {
	        childList: true
	    });
	};
	const init$1 = (modal, frame) => {
	    el.$$('.sb-modal-list li', modal).forEach(element => {
	        const values = element.textContent.match(/([^\(]+) \((\d+)\)/);
	        steps[values[1]] = parseInt(values[2], 10);
	    });
	    steps['Queen Bee'] = allPoints;
	    el.$('.sb-modal-close', modal).click();
	    observers$1.remove(observer$1);
	    update$2(frame);
	};
	const update$2 = (frame) => {
	    frame.innerHTML = '';
	    const ownPoints = data.getPoints('foundTerms');
	    for (const [key, value] of Object.entries(steps)) {
	        frame.append(el.create({
	            tag: 'tr',
	            classNames: ownPoints >= value ? ['done'] : [],
	            cellTag: 'td',
	            cellData: [key, value]
	        }));
	    }};
	var steps$1 = {
	    add: (app, gameContainer) => {
	        plugin$6 = el.create({
	            tag: 'details',
	            text: [title$7, 'summary']
	        });
	        const content = el.create({
	            tag: 'table'
	        });
	        const frame = el.create({
	            tag: 'tbody'
	        });
	        content.append(frame);
	        plugin$6.addEventListener('toggle', event => {
	            if (plugin$6.open && !frame.hasChildNodes()) {
	                addObserver$2(el.$('.sb-modal-wrapper'), frame);
	                el.$('.sb-progress', gameContainer).click();
	            }
	        });
	        plugin$6.append(content);
	        app.addEventListener('sbaUpdateComplete', evt => {
	            update$2(frame);
	        });
	        return plugins.add(app, plugin$6, key$6, title$7, optional$6);
	    },
	    remove: () => {
	        plugin$6 = plugins.remove(plugin$6, key$6, title$7);
	        observers$1.remove(observer$1);
	        return true;
	    }
	};

	const title$8 = 'Footer';
	const key$7 = 'footer';
	const optional$7 = false;
	let plugin$7;
	var footer = {
		add: (app) => {
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
			plugin$7 = plugins.remove(plugin$7, key$7, title$8);
			return true;
		}
	};

	const gameContainer = el.$('.sb-content-box');
	const resultContainer$1 = el.$('.sb-wordlist-items', gameContainer);
	if (window.gameData) {
		const oldInstance = el.$(`[data-id="${settings$1.get('repo')}"]`, gameContainer);
		if (oldInstance) {
			oldInstance.dispatchEvent(new Event('sbaDestroy'));
		}
		const app = widget(resultContainer$1);
		header.add(app);
		scoreSoFar.add(app);
		spoilers.add(app);
		spillTheBeans.add(app, el.$('.sb-hive-input-content', gameContainer));
		surrender.add(app, resultContainer$1);
		steps$1.add(app, gameContainer);
		setUp.add(app);
		footer.add(app);
		styles$1.add(app);
		gameContainer.append(app);
		app.dispatchEvent(new Event('sbaLaunchComplete'));
	}

}());
