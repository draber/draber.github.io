import date from 'date-and-time';

const rawData = {
    today: {
        printDate: '2020-04-22',
        centerLetter: 'a',
        answers: ['airway', 'airy', 'aria', 'arid', 'array', 'award', 'away', 'awry', 'daddy', 'dairy', 'diary', 'draw', 'dray', 'dryad', 'dyad', 'radar', 'radii', 'raid', 'razz', 'ward', 'wary', 'wayward', 'wizard', 'wizardry', 'yard'],
    },
    yesterday: {
        centerLetter: 'o',
        answers: ['clog', 'college', 'cologne', 'eggnog', 'gecko', 'geek', 'gelee', 'gene', 'glee', 'glen', 'goggle', 'gone', 'gong', 'google', 'googol', 'goon', 'loge', 'logo', 'long', 'longneck', 'ogee', 'ogle', 'oolong'],
    }
}

const gameData = () => {
    let i = 2;
    for (let entries of Object.values(rawData)) {
        let now = new Date(2030, 8, i);
        entries.displayWeekday = date.format(now, 'dddd');
        entries.displayDate = date.format(now, 'MMMM D, YYYY');
        entries.printDate = date.format(now, 'YYYY-MM-DD');
        entries.expiration = (now.getTime() / 1000) + 86400;
        entries.id = i;
        entries.validLetters = Array.from(new Set(entries.answers.join('').split('')));
        entries.outerLetters = entries.validLetters.filter(letter => letter !== entries.centerLetter);
        entries.pangrams = entries.answers.filter(term => !entries.validLetters.filter(letter => !term.split('').includes(letter)).length);
        entries.freeExpiration = 0;
        entries.editor = 'Spelling Bee Assistant QA';
        i--;
    }

    return rawData;
}

export default gameData;