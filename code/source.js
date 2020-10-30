(function() {

    const resultContainer = document.querySelector('.sb-wordlist-items');
    let allPoints         = 0;
    let foundTerms        = [];
    let foundPangrams     = [];
    let remainders        = [];
    let statListing;
    let observer;

    // helper
    const createElement = (tagName, styles = {}) => {
        const element = document.createElement(tagName);
        Object.assign(element.style, styles);
        return element;
    }

    // count the points from an array of words
    const countPoints = data => {
        let points = 0;
        data.forEach(term => {
            if (gameData.today.pangrams.includes(term)) {
                points += 15;
            }
            else if (term.length > 4) {
                points += term.length;
            }
            else {
                points += 1;
            }
        });
        return points;
    }

    allPoints = countPoints(gameData.today.answers);

    // calculate the stats and populate the panel
    const updateStats = () => {
        foundTerms = [];
        foundPangrams = [];

        resultContainer.querySelectorAll('li').forEach(node => {
            const term = node.textContent;
            foundTerms.push(term);
            if (gameData.today.pangrams.includes(term)) {
                foundPangrams.push(term);
                // a bit dirty in this context but convenient
                node.style.borderBottom = '2px #f8cd05 solid';
            }
        });
        remainders = gameData.today.answers.filter(term => !foundTerms.includes(term));

        statListing.innerHTML = '';

        [
            `Words: ${foundTerms.length}/${gameData.today.answers.length}, ${remainders.length} missing`,
            `Pangrams: ${foundPangrams.length}/${gameData.today.pangrams.length}, ${gameData.today.pangrams.length - foundPangrams.length} missing`,
            `Points: ${countPoints(foundTerms)}/${allPoints}, ${countPoints(remainders)} missing`
        ].forEach(entry => {
            const entryElement = createElement('li', {
                paddingBottom: '5px'
            });
            entryElement.textContent = entry;
            statListing.append(entryElement);
        })
    };

    // build a single entry in the term list
    const buildWordListItem = term => {
        const entry = createElement('li', {
            borderBottom: gameData.today.pangrams.includes(term) ? '2px #f8cd05 solid' : '1px solid #dcdcdc',
            color: '#888',
        });
        entry.classList.add('sb-anagram');

        const link = createElement('a');
        link.href = `https://www.google.com/search?q=${term}`;
        link.target = '_blank';
        link.textContent = term;
        entry.append(link);
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

    // build the additional panels
    const buildPanels = () => {
        const gameContainer = document.querySelector('.sb-content-box');
        const types = ['Stats', 'Solution'];
        const container = createElement('div', {
            position: 'absolute',
            width: '200px',
            right: '-210px',
            top: '20px'
        });

        gameContainer.style.position = 'relative';

        types.forEach(type => {
            const panel = createElement('details', {
                fontSize: '90%',
                marginBottom: '10px'
            });

            if (type === 'Stats') {
                panel.setAttribute('open', 'open');
            }

            const summary = createElement('summary', {
                padding: '10px 15px',
                background: '#f8cd05',
                cursor: 'pointer'
            });
            summary.textContent = type;

            const content = createElement('div', {
                padding: '10px 15px'
            });

            if (type === 'Solution') {
                const button = createElement('button', {
                    boxSizing: 'border-box'
                });
                button.classList.add('pz-modal__button', 'white');
                button.type = 'button';
                button.textContent = 'Display answers';
                button.addEventListener('click', (event) => {
                    resolveGame();
                });
                content.append(button);
            }
            else {
                statListing = createElement('ul', {
                    fontSize: '85%',
                });
                content.append(statListing);
                updateStats();
            }

            panel.append(summary);
            panel.append(content);

            container.append(panel);
        });
        gameContainer.append(container);
    };



    // listen to the result container and update the panels
    observer = new MutationObserver((mutationsList, observer) => {
    	// we're only interested in the very last mutation
    	const mutation = mutationsList.pop();
    	const node = mutation.addedNodes[0];
    	if(gameData.today.pangrams.includes(node.textContent)) {
			node.style.borderBottom = '2px #f8cd05 solid';
    	}
    	updateStats();
    });
    observer.observe(resultContainer, {
        childList: true
    });

    buildPanels();
    updateStats();
}());