(function() {
    'use strict';

    const resultContainer = document.querySelector('.sb-wordlist-items');
    const statListings = {};
    let foundTerms = [];
    let foundPangrams = [];
    let remainders = [];
    let allPoints = 0;
    let observer;
    let dragger;
    let styles;


    // helper to create elements convieniently
    const createElement = (tagName, {
        text = '',
        classNames = [],
        attributes = {}
    } = {}) => {
        const element = document.createElement(tagName);
        if (classNames.length) {
            element.classList.add(...classNames);
        }
        if (text !== '') {
            element.textContent = text;
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (value) {
                element.setAttribute(key, value);
            }
        }
        return element;
    }

    // Add stylesheet
    const appendStyles = () => {
        styles = createElement('style', {
            // Paste compressed CSS here
            text: `.sb-content-box{position:relative}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sb-assistant{position:absolute;width:200px;right:-210px;top:16px;background:white;z-index:3;border:1px solid #dcdcdc;border-radius:6px;padding:0 10px}.sb-assistant *{box-sizing:border-box}.sb-assistant .dragger{font-weight:bold;cursor:move;line-height:32px}.sb-assistant .closer{font-size:20px;font-weight:bold;position:absolute;top:0;right:0;line-height:32px;padding:0 10px;cursor:pointer}.sb-assistant details{font-size:90%;margin-bottom:10px}.sb-assistant summary{padding:9px 15px;background:#f8cd05;cursor:pointer}.sb-assistant .solution-content{padding:10px 15px}.sb-assistant table{border:1px solid #dcdcdc;border-collapse:collapse;width:100%;font-size:85%}.sb-assistant th,.sb-assistant td{border:1px solid #dcdcdc;padding:3px}.sb-assistant thead th{text-align:center}.sb-assistant tbody th{text-align:right}.sb-assistant tbody td{text-align:center}`
        });
        document.querySelector('head').append(styles);
    }

    // count how many words exist for each length
    const countLetters = () => {
        const letterCount = {};
        gameData.today.answers.forEach(term => {
            letterCount[term.length] = letterCount[term.length] || {
                found: 0,
                missing: 0,
                total: 0
            };
            if (foundTerms.includes(term)) {
                letterCount[term.length].found++;
            } else {
                letterCount[term.length].missing++;
            }
            letterCount[term.length].total++;
        });
        return letterCount;
    };


    // count the points from an array of words
    const countPoints = data => {
        let points = 0;
        data.forEach(term => {
            if (gameData.today.pangrams.includes(term)) {
                points += term.length + 7;
            } else if (term.length > 4) {
                points += term.length;
            } else {
                points += 1;
            }
        });
        return points;
    }

    allPoints = countPoints(gameData.today.answers);

    const calculateUpdates = () => {
        const letterCount = countLetters();
        const letterKeys = Object.keys(letterCount);
        letterKeys.sort((a, b) => a - b);
        const updates = {
            Stats: [
                [
                    'Words',
                    foundTerms.length,
                    remainders.length,
                    gameData.today.answers.length
                ],
                [
                    'Points',
                    countPoints(foundTerms),
                    countPoints(remainders),
                    allPoints
                ]
            ],
            Spoilers: [
                [
                    'Pangrams',
                    foundPangrams.length,
                    gameData.today.pangrams.length - foundPangrams.length,
                    gameData.today.pangrams.length
                ]
            ]
        }
        letterKeys.forEach(count => {
            updates.Spoilers.push([
                count + ' ' + (count > 1 ? 'letters' : 'letter'),
                letterCount[count].found,
                letterCount[count].missing,
                letterCount[count].total
            ]);
        });
        return updates;
    }

    // calculate the stats and populate the panel
    const updateStats = () => {
        foundTerms = [];
        foundPangrams = [];

        resultContainer.querySelectorAll('li').forEach(node => {
            const term = node.textContent;
            foundTerms.push(term);
            if (gameData.today.pangrams.includes(term)) {
                foundPangrams.push(term);
                node.classList.add('sb-pangram');
            }
        });
        remainders = gameData.today.answers.filter(term => !foundTerms.includes(term));

        const updates = calculateUpdates();

        for (const [key, statListing] of Object.entries(statListings)) {
            if (updates[key].length) {
                statListing.innerHTML = '';
                updates[key].forEach(entry => {
                    statListing.append(buildTableRow('td', entry));
                })
            }
        }
    };

    // build a single entry in the term list
    const buildWordListItem = term => {
        const entry = createElement('li', {
            classNames: gameData.today.pangrams.includes(term) ?
                ['sb-anagram', 'sb-pangram'] :
                ['sb-anagram']
        });
        entry.append(createElement('a', {
            text: term,
            attributes: {
                href: `https://www.google.com/search?q=${term}`,
                target: '_blank'
            }
        }));
        return entry;
    };

    // display the solution after confirmation
    const resolveGame = () => {
        if (confirm('Are you sure you want to display all answers?')) {
            observer.disconnect();
            remainders.forEach(term => {
                resultContainer.append(buildWordListItem(term));
            });
        }
    };

    const buildTableRow = (type, data) => {
        const row = createElement('tr');
        data.forEach((entry, i) => {
            row.append(createElement(i === 0 ? 'th' : type, {
                text: entry
            }));
        });
        return row;
    }

    // the little x in the top right corner
    const buildCloser = () => {
        const closer = createElement('span', {
            classNames: ['closer'],
            text: '×',
            attributes: {
                title: 'Close assistant'
            }
        });
        closer.addEventListener('click', function(event) {
            window.gameData.assistant = false;
            styles.remove();
            observer.disconnect();
            this.parentNode.remove();
        });
        return closer;
    }

    const buildDragger = (container) => {
        container.draggable = true;
        const dragger = createElement('div', {
            classNames: ['dragger'],
            text: 'Assistant',
            attributes: {
                title: 'Hold the mouse down to drag assistant'
            }
        });

        container.addEventListener('dragstart', function(event) {
            event.stopPropagation();
            const style = getComputedStyle(this);
            this.dataset.right = style.getPropertyValue('right');
            this.dataset.top  = style.getPropertyValue('top');
            this.dataset.mouseX = event.clientX;
            this.dataset.mouseY = event.clientY;
            event.dataTransfer.effectAllowed = 'move';
        }, false);

        container.addEventListener('dragend', function(event) {
            event.stopPropagation();
            const mouseDiffX = event.clientX - this.dataset.mouseX;
            const mouseDiffY = event.clientY - this.dataset.mouseY;
            this.style.right = parseInt(this.dataset.right) - mouseDiffX + 'px';
            this.style.top = parseInt(this.dataset.top) + mouseDiffY + 'px';
        }, false);

        return dragger;
    }

    // build the additional panels
    const buildPanels = () => {
        const gameContainer = document.querySelector('.sb-content-box');
        const types = ['Stats', 'Spoilers', 'Solution'];
        const container = createElement('div', {
            classNames: ['sb-assistant']
        });    

        container.append(buildDragger(container));
        container.append(buildCloser());

        types.forEach(type => {
            const panel = createElement('details', {
                attributes: {
                    open: type === 'Stats' ? 'open' : false
                }
            });

            const summary = createElement('summary', {
                text: type
            });

            let content;

            if (type === 'Solution') {
                content = createElement('div', {
                    classNames: ['solution-content']
                });
                const button = createElement('button', {
                    classNames: ['pz-modal__button', 'white'],
                    text: 'Display answers',
                    attributes: {
                        type: 'button'
                    }
                });
                button.addEventListener('pointerup', (event) => {
                    resolveGame();
                });
                content.append(button);
            } else {
                content = createElement('table');
                const thead = createElement('thead');
                thead.append(buildTableRow('th', ['', 'Found', 'Missing', 'Total']));
                statListings[type] = createElement('tbody');
                content.append(thead);
                content.append(statListings[type]);
                updateStats();
            }

            panel.append(summary);
            panel.append(content);

            container.append(panel);
        });
        gameContainer.append(container);
    };


    // listen to the result container and update the panels when adding a new term
    observer = new MutationObserver((mutationsList, observer) => {
        // we're only interested in the very last mutation
        const mutation = mutationsList.pop();
        const node = mutation.addedNodes[0];
        if (gameData.today.pangrams.includes(node.textContent)) {
            node.classList.add('sb-pangram');
        }
        updateStats();
    });
    observer.observe(resultContainer, {
        childList: true
    });


    const init = () => {
        if(window.location.pathname !== '/puzzles/spelling-bee') {
            return false;
        }        
        if(window.gameData.assistant) {
            return false;
        }
        appendStyles();
        buildPanels();
        updateStats();
        window.gameData.assistant = true;
        return true;
    }

    init();
}());
