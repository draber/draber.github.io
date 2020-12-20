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
        classNames = []
    } = {}) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries({
                ...{
                    textContent: text
                },
                ...attributes
            })) {
            el[key] = value;
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
        app.on(prefix$1('newWord'), (evt) => updateLists(app, resultList));
    };
    var data = {
        init,
        getList,
        getCount,
        getPoints
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
            if(!this.canDeactivate) {
                return this;
            }
            settings$1.set(`options.${this.key}`, state);
            this.ui.classList.toggle('inactive', !state);
            return this;
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
            const rect = el.$('.sb-content-box', game).getBoundingClientRect();
            const resultList = el.$('.sb-wordlist-items', game);
            const events = {};
            events[prefix$1('destroy')] = () => {
                this.observer.disconnect();
                this.ui.remove();
            };
            this.ui = el.div({
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
            this.observer = new MutationObserver(() =>  this.trigger(new Event(prefix$1('newWord'))));
            this.observer.observe(resultList, {
                childList: true
            });
            this.registerPlugins = plugins => {
                for (const [key, plugin] of Object.entries(plugins)) {
                    this.registry.set(key, new plugin(this));
                }
                return this;
            };
            el.$('body').append(this.ui);
        };
    }

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
            this.toggle(this.isActive());
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

    let params;
    let isLastTarget = false;
    const getDragParams = (evt, app, visualContainer, trigger) => {
        const gRect = visualContainer.getBoundingClientRect();
        const aRect = app.ui.getBoundingClientRect();
        const minT = gRect.top + window.pageYOffset;
        const pRect = trigger.ui.parentElement.getBoundingClientRect();
        const gAvailH = gRect.height - (gRect.top - aRect.top) - (aRect.top - pRect.top) - pRect.height;
        return {
            maxL: document.documentElement.clientWidth - aRect.width,
            minT: minT,
            maxT: minT + gAvailH,
            offX: evt.screenX - aRect.x,
            offY: evt.screenY - aRect.y,
            margT: parseInt(getComputedStyle(app.ui).marginTop, 10)
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
    const enableDrag = (app, dragArea, trigger) => {
        if(!app.ui.draggable){
            return false;
        }
        trigger.ui.style.cursor = 'move';
        app.on('pointerdown', evt => {
            isLastTarget = !!evt.target.closest(`[data-ui="${trigger.key}`);
        }).on('pointerup', () => {
            isLastTarget = false;
        }).on('dragend', evt => {
            Object.assign(app.ui.style, getDropPosition(evt));
            evt.target.style.opacity = '1';
        }).on('dragstart', evt => {
                if (!isLastTarget) {
                    evt.preventDefault();
                    return false;
                }
                app.ui.style.opacity = '.2';
                params = getDragParams(evt, app, dragArea, trigger);
            },
            false).on('dragover', evt => evt.preventDefault());
        dragArea.addEventListener('dragover', evt => evt.preventDefault());
    };

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), {
                key: 'header'
            });
            this.ui = el.div();
            this.ui.append(el.div({
                text: this.title,
                attributes: {
                    title: 'Hold the mouse down to drag'
                },
                classNames: ['dragger']
            }), el.span({
                attributes: {
                    title: 'Minimize'
                },
                classNames: ['minimizer'],
                events: {
                    click: () => {
                        console.log('toggle app');
                        app.toggle(!app.isActive());
                    }
                }
            }), el.span({
                text: '×',
                attributes: {
                    title: 'Close'
                },
                classNames: ['closer'],
                events: {
                    click: () => app.trigger(new Event(prefix$1('destroy')))
                }
            }));
            enableDrag(app, app.game, this);
            this.add();
        }
    }

    const update = (tbody) => {
        tbody.innerHTML = '';
        [
            ['', 'Found', 'Missing', 'Total'],
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
        ].forEach(rowData => {
            const tr = el.tr();
            rowData.forEach(cellData => {
                tr.append(el.td({
                    text: cellData
                }));
            });
            tbody.append(tr);
        });
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
            const pane = el.table({
                classNames: ['pane']
            });
            const tbody = el.tbody();
            pane.append(tbody);
            update(tbody);
            this.ui.append(el.summary({
                text: this.title
            }), pane);
            app.on(prefix$1('wordsUpdated'), () => update(tbody));
            this.add();
        }
    }

    class SetUp extends Plugin {
    	constructor(app) {
    		super(app, 'Set-up');
    		const pane = el.ul({
    			classNames: ['pane']
    		});
    		const populate = pane => {
    			app.registry.forEach((plugin, key) => {
    				if (!plugin.canDeactivate) {
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
    		};
    		this.ui = el.details({
    			events: {
    				click: evt => {
    					if (evt.target.tagName === 'INPUT') {
    						app.registry.get(evt.target.name).toggle(evt.target.checked);
    					}
    				}
    			}
    		});
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		populate(pane);
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

    class Spoilers extends Plugin {
    	constructor(app) {
    		super(app, 'Spoilers', {
    			canDeactivate: true
    		});
    		const tbody = el.tbody();
    		const getCellData = () => {
    			const counts = {};
    			const pangramCount = data.getCount('pangrams');
    			const foundPangramCount = data.getCount('foundPangrams');
    			const cellData = [
    				['', 'Found', 'Missing', 'Total'],
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
    			getCellData().forEach(rowData => {
    				const tr = el.tr();
    				rowData.forEach(cellData => {
    					tr.append(el.td({
    						text: cellData
    					}));
    				});
    				tbody.append(tr);
    			});
    		};
    		this.ui = el.details();
    		const pane = el.table({
    			classNames: ['pane']
    		});
    		pane.append(tbody);
    		update();
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		app.on(prefix$1('wordsUpdated'), () => update());
    		this.add();
    	}
    }

    class StepsToSuccess extends Plugin {
        constructor(app) {
            super(app, 'Steps to success', {
                canDeactivate: true
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
                    const tr = el.tr({
                        classNames: value[1] === tier ? ['sba-current'] : []
                    });
                    [value[0], value[1]].forEach(cellData => {
                        tr.append(el.td({
                            text:cellData
                        }));
                    });
                    frame.append(tr);
                });
            };
            this.ui = el.details();
            const pane = el.table({
                classNames: ['pane']
            });
            const frame = el.tbody();
            update(frame);
            pane.append(frame);
            this.ui.append(el.summary({
                text: this.title
            }), pane);
            app.on(prefix$1('wordsUpdated'), () => update(frame));
            this.add();
        }
    }

    var css = "﻿.pz-game-field{background:inherit;color:inherit}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba-dark{background:#111;color:#eee}.sba-dark .sba{background:#111}.sba-dark .sba summary{background:#252525;color:#eee}.sba-dark .pz-nav__hamburger-inner,.sba-dark .pz-nav__hamburger-inner::before,.sba-dark .pz-nav__hamburger-inner::after{background-color:#eee}.sba-dark .pz-nav{width:100%;background:#111}.sba-dark .pz-nav__logo{filter:invert(1)}.sba-dark .sb-modal-scrim{background:rgba(17,17,17,.85);color:#eee}.sba-dark .pz-modal__title{color:#eee}.sba-dark .sb-modal-frame,.sba-dark .pz-modal__button.white{background:#111;color:#eee}.sba-dark .pz-modal__button.white:hover{background:#393939}.sba-dark .sb-message{background:#393939}.sba-dark .sb-input-invalid{color:#666}.sba-dark .sb-progress-marker .sb-progress-value,.sba-dark .hive-cell.center .cell-fill{background:#f7c60a;fill:#f7c60a;color:#111}.sba-dark .sb-input-bright{color:#f7c60a}.sba-dark .hive-cell.outer .cell-fill{fill:#393939}.sba-dark .cell-fill{stroke:#111}.sba-dark .cell-letter{fill:#eee}.sba-dark .hive-cell.center .cell-letter{fill:#111}.sba-dark .hive-action:not(.hive-action__shuffle){background:#111;color:#eee}.sba-dark .hive-action__shuffle{filter:invert(100%)}.sba-dark *:not(.hive-action__shuffle):not(.sb-pangram):not(.sba-current){border-color:#333 !important}.sba{position:absolute;width:200px;background:inherit;box-sizing:border-box;z-index:3;margin:16px 0;padding:0 10px 5px;background:#fff;border-width:1px;border-color:#dcdcdc;border-radius:6px;border-style:solid}.sba *,.sba *:before,.sba *:after{box-sizing:border-box}.sba *:focus{outline:0}.sba .dragger{font-weight:bold;line-height:32px}.sba .closer,.sba .minimizer{font-size:18px;font-weight:bold;position:absolute;top:0;line-height:32px;padding:0 10px;cursor:pointer}.sba .closer{right:0}.sba .minimizer{right:16px;transform:rotate(-90deg);transform-origin:center;font-size:10px;right:24px;top:1px}.sba .minimizer:before{content:\"❯\"}.sba.inactive details{display:none}.sba.inactive .minimizer{transform:rotate(90deg);right:25px;top:0}.sba details{font-size:90%;margin-bottom:1px;max-height:800px;transition:max-height .25s ease-in}.sba details[open] summary:before{transform:rotate(-90deg);left:12px;top:0}.sba details.inactive{height:0;max-height:0;transition:max-height .25s ease-out;overflow:hidden;margin:0}.sba summary{line-height:24px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:9px;top:-1px}.sba .pane{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%;margin-bottom:4px}.sba tr:first-of-type td{border-top:none}.sba tr.sba-current{font-weight:bold;border-bottom:2px solid #f8cd05 !important}.sba td{border:1px solid #dcdcdc;white-space:nowrap;text-align:center;padding:4px 3px}.sba td:first-of-type{text-align:left}.sba [data-ui=footer]{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.sba [data-ui=footer]:hover{opacity:.8;text-decoration:underline}.sba .spill-title{padding:10px 6px 0px;text-align:center}.sba .spill{text-align:center;padding:17px 0;font-size:280%}.sba ul.pane{padding:5px}.sba [data-ui=surrender] .pane{padding:10px 5px}.sba [data-ui=surrender] button{margin:0 auto;display:block;font-size:100%;white-space:nowrap;padding:12px 20px}.sba label{cursor:pointer;position:relative;line-height:19px}.sba label input{position:relative;top:2px;margin:0 10px 0 0}\n";

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

    var plugins = {
        Styles,
        DarkMode,
        Header,
        ScoreSoFar,
        Spoilers,
        SpillTheBeans,
        StepsToSuccess,
        Surrender,
        SetUp,
        Footer
    };

    (new App(el.$('#pz-game-root'))).registerPlugins(plugins);

}());
