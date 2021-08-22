(() => {

  const hit = key => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: key
    }))
  }
  const today = window.gameData.today;

  const subset = (today.pangrams.concat(today.answers.filter(entry => !today.pangrams.includes(entry)))).slice(0, 16);
  subset.forEach(term => {
    term.split('').forEach(letter => {
      hit(letter);
    })
    hit('Enter');
  })

  document.querySelector('.hive-action__submit').classList.remove('action-active');
  localStorage.removeItem('sb-today');

})()