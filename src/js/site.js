(function () {
    // simulate display of `.sb-modal-list`
    const modalList = document.querySelector('.sb-modal-list');
    const progress = document.querySelector('.sb-progress');
    const modalWrapper = document.querySelector('.sb-modal-wrapper');
    const input = document.querySelector('.sb-hive-input-content');
    const data = window.gameData.today;
    const foundTerms = [];
    document.querySelectorAll('.sb-wordlist-items li').forEach(node => {
        foundTerms.push(node.textContent.trim());
    });
    const remainders = data.answers.filter(term => !foundTerms.includes(term));

    document.querySelector('#random-term').textContent= remainders[Math.floor(Math.random() * remainders.length)];

    progress.addEventListener('click', () => {
        modalWrapper.append(modalList);
    });
    document.querySelectorAll('[data-trigger]').forEach(trigger => {
        trigger.addEventListener('click', function(evt){
            document.querySelector(`[data-plugin="${this.dataset.trigger}"] details`).open = true;
        })
    })
    // input.addEventListener('focus', evt => {
    //     document.querySelector('[data-plugin="spillTheBeans"] details').open = true;
    // })
    input.addEventListener('keydown', evt => {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.key === 'Backspace' && input.hasChildNodes()) {
            input.lastChild.remove();
            return false;
        } else if (!(/^[a-zA-Z]$/.test(evt.key))) {
            return false;
        }
        const txt = document.createElement('span');
        txt.textContent = evt.key.toLowerCase();
        if (evt.key === data.centerLetter) {
            txt.classList.add('highlight');
        }
        input.append(txt);
    })
}())