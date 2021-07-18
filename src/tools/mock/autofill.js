(() => {
    const today = window.gameData.today;
    let subset = [];
    [4, 5].forEach(length => {
        subset = subset.concat(today.answers.filter(entry => entry.length === length).slice(0, 6 - length));
    })
    subset = subset.concat(today.pangrams.slice(0, 1));
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
})()