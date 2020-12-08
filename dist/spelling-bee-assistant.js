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
    var targetUrl$1 = "https://www.nytimes.com/puzzles/spelling-bee";
    var prefix = "sba";

    const settings = {
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        targetUrl: targetUrl$1,
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
        app.on(new Event(prefix$1('updateComplete')));
    };
    const init = (app, resultList) => {
        lists = initLists();
        updateLists(app, resultList);
        app.on(prefix$1('update'), () => {
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
    			console.info(`This bookmarklet only works on ${settings$1.get(targetUrl)}`);
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
    		this.remove = () => {
    			this.ui.remove();
    		};
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
    			this.remove();
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
            this.observer = new MutationObserver(mutationsList => {
    			this.trigger(new CustomEvent(prefix$1('update'), {
    				detail: {
    					text: mutationsList.pop().addedNodes[0]
    				}
    			}));
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
        constructor(app) {
            this.app = app;
            this.defaultEnabled = true;
            this.optional = false;
            this.title = '';
            this.ui;
            this.target;
            this.hasUi = () => {
                return this.ui instanceof HTMLElement;
            };
            this.isEnabled = () => {
                const stored = settings$1.get(`options.${this.key}`);
                return typeof stored !== 'undefined' ? stored : this.defaultEnabled;
            };
            this.toggle = state => {
                settings$1.set(`options.${this.key}`, state);
                this.ui.classList.toggle('inactive', !state);
            };
            this.attach = () => {
                if (!this.hasUi()) {
                    return false;
                }
                const target = this.target || el.$(`[data-ui="${this.key}"]`, app.ui) || (() => {
                    const _target = el.create({
                        data: {
                            plugin: this.key
                        }
                    });
                    app.ui.append(_target);
                    return _target;
                })();
                target.append(this.ui);
                return true;
            };
            this.add = () => {
                this.attach();
                if (this.optional) {
                    settings$1.set(`options.${this.key}`, this.isEnabled());
                }
            };
        }
    }

    class darkMode extends plugin {
        constructor(app) {
            super(app);
            this.title = 'Dark Mode';
            this.key = camel(this.title);
            this.optional = true;
            this.defaultEnabled = false;
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
            super(app);
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
            this.add();
        }
    }

    class header extends plugin {
        constructor(app) {
            super(app);
            this.title = settings$1.get('title');
            this.key = 'header';
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
            super(app);
            this.title = 'Score so far';
            this.key = camel(this.title);
            this.optional = true;
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
            app.on(prefix$1('updateComplete'), () => {
                update(tbody);
            });
            this.add();
        }
    }

    class setUp extends plugin {
    	constructor(app) {
    		super(app);
    		this.title = 'Set-up';
    		this.key = camel(this.title);
    		this.optional = false;
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
            super(app);
            this.title = 'Spill the beans';
            this.key = camel(this.title);
            this.optional = true;
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
    		super(app);
    		this.title = 'Spoilers';
    		this.key = camel(this.title);
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
    		this.app.on(prefix$1('updateComplete'), () => {
    			update();
    		});
    		this.add();
    	}
    }

    class stepsToSuccess extends plugin {
        constructor(app) {
            super(app);
            this.title = 'Steps to success';
            this.key = 'stepsToSuccess';
            this.optional = true;
            let observer;
            const steps = {};
            const initObserver = (target, frame) => {
                const observer = new MutationObserver(mutationsList => {
                    const node = mutationsList.pop().target;
                    const title = el.$('.sb-modal-title', node);
                    if (title && title.textContent.trim() === 'Rankings') {
                        target.parentElement.style.opacity = 0;
                        retrieveRankings(target, frame);
                    }
                });
                observer.observe(target, {
                    childList: true
                });
                return observer;
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
                observer.disconnect();
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
            pane.append(frame);
            const popUpCloser = el.$('.sb-modal-buttons-section .pz-button__wrapper>button, sb-modal-close', el.$('.sb-modal-wrapper'));
            if(popUpCloser){
                popUpCloser.click();
            }
            const modal = el.$('.sb-modal-wrapper');
            observer = initObserver(modal, frame);
            el.$('.sb-progress', app.game).click();
            this.ui.append(pane);
            app.on(prefix$1('updateComplete'), () => {
                update(frame);
            });
            this.add();
        }
    }

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram):not(.sba-current){border-color:#333 !important}.sba{position:absolute;width:200px;background:inherit;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;background:#fff;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba .closer,.sba .minimizer{font-size:18px;font-weight:bold;position:absolute;top:0;line-height:32px;padding:0 10px;cursor:pointer}.sba .closer{right:0}.sba .minimizer{right:16px;transform:rotate(-90deg);transform-origin:center;font-size:10px;right:24px;top:1px}.sba .minimizer:before{content:\"❯\"}.sba.minimized details{display:none}.sba.minimized .minimizer{transform:rotate(90deg);right:25px;top:0}.sba details{font-size:90%;margin-bottom:1px;max-height:800px;transition:max-height .25s ease-in}.sba details[open] summary:before{transform:rotate(-90deg);left:12px;top:0}.sba details.inactive{height:0;max-height:0;transition:max-height .25s ease-out;overflow:hidden;margin:0}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:9px;top:-1px}.sba .hive-action{margin:0 auto;display:block;font-size:100%;white-space:nowrap}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px}.sba tr:first-of-type td,.sba tr:first-of-type th{border-top:none}.sba tr td:first-of-type{text-align:left}.sba tr.sba-current{font-weight:bold;border-bottom:2px solid #f8cd05 !important}.sba th,.sba td{border:1px solid #dcdcdc;white-space:nowrap}.sba thead th{text-align:center;padding:4px 0}.sba tbody th{text-align:right}.sba tbody td{text-align:center;padding:4px 6px}.sba [data-plugin=footer] a{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-plugin=footer] a:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-plugin=surrender] .pane{padding:10px 5px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

    class styles extends plugin {
        constructor(app) {
            super(app);
            this.app = app;
            this.title = 'Styles';
            this.key = camel(this.title);
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
    		super(app);
    		this.title = 'Surrender';
    		this.key = camel(this.title);
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
