(() => {
  window.gameData = {
    today: {
      expiration: '1914530400',
      displayWeekday: 'Monday',
      displayDate: 'September 2, 2030',
      printDate: '2030-09-02',
      centerLetter: 'a',
      outerLetters: ['d', 'i', 'r', 'w', 'y', 'z'],
      validLetters: ['a', 'd', 'i', 'r', 'w', 'y', 'z'],
      pangrams: ['wizardry'],
      answers: ['airway', 'airy', 'aria', 'arid', 'array', 'award', 'away', 'awry', 'daddy', 'dairy', 'diary', 'draw', 'dray', 'dryad', 'dyad', 'radar', 'radii', 'raid', 'razz', 'ward', 'wary', 'wayward', 'wizard', 'wizardry', 'yard'],
      id: '1914530400',
      freeExpiration: 0,
      editor: 'Sam Ezersky'
    },
    yesterday: {
      displayWeekday: 'Sunday',
      displayDate: 'September 1, 2030',
      printDate: '2030-09-01',
      centerLetter: 'd',
      outerLetters: ['a', 'i', 'l', 'p', 'r', 'y'],
      validLetters: ['d', 'a', 'i', 'l', 'p', 'r', 'y'],
      pangrams: ['longneck'],
      answers: ['clog', 'college', 'cologne', 'eggnog', 'gecko', 'geek', 'gelee', 'gene', 'glee', 'glen', 'goggle', 'gone', 'gong', 'google', 'googol', 'goon', 'loge', 'logo', 'long', 'longneck', 'ogee', 'ogle', 'oolong'],
      id: '1914444000',
      freeExpiration: 0,
      editor: 'Sam Ezersky',
      expiration: '1914444000'
    }
  };

  document.querySelectorAll('.sb-hive text').forEach((letter, i) => {
    letter.textContent = window.gameData.today.validLetters[i];
  })

  const tmp = {};
  const containers = [document.body, document.querySelector('head')];
  containers.forEach(container => {
    const name = container.nodeName.toLowerCase();
    tmp[name] = document.createDocumentFragment();
  })
  const keep = {
    head: 'title, [data-ui="styles"], [charset="utf-8"]',
    body: '#js-hook-pz-moment__game, [data-ui="sba-popup-container"], #spelling-bee-assistant'
  }
  for (const [name, fragment] of Object.entries(tmp)) {
    const container = document.querySelector(name);
    container.querySelectorAll(keep[name]).forEach(node => {
      if (node) {
        tmp[name].append(node);
      }
    })
    container.querySelectorAll('script, link').forEach(element => {
      const src = element.src ? element.src : element.href;
      if (src && src.includes('games-assets/v2')) {
        fragment.append(element);
      } else {
        element.remove();
      }
    });
    container.querySelectorAll('*').forEach(element => {
      element.remove();
    });
    container.append(fragment);
  }


})()