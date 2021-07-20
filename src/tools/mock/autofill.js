(() => {
    const script = document.createElement('script');
    script.src = '/assets/js/spelling-bee-assistant.min.js';
    document.body.append(script);

    document.addEventListener('sbaReady', () => {        
        const today = window.gameData.today;
        subset = (today.pangrams.concat(today.answers.filter(entry => !today.pangrams.includes(entry)))).slice(0,16);
        subset.forEach(term => {
            term.split('').forEach(letter => {            
                window.dispatchEvent(new KeyboardEvent('keydown', {
                  key: letter
                }))
            })
            window.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter'
            }))
        })

        document.querySelector('.hive-action__submit').classList.remove('action-active');

        localStorage.removeItem('sb-today');
    })

})()