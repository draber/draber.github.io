import date from 'date-and-time';

const gameData = {
    today: {
        centerLetter: 'a',
        answers: ['airway', 'airy', 'aria', 'arid', 'array', 'award', 'away', 'awry', 'daddy', 'dairy', 'diary', 'draw', 'dray', 'dryad', 'dyad', 'radar', 'radii', 'raid', 'razz', 'ward', 'wary', 'wayward', 'wizard', 'wizardry', 'yard'],
    },
    yesterday: {
        centerLetter: 'o',
        answers: ['clog', 'college', 'cologne', 'eggnog', 'gecko', 'geek', 'gelee', 'gene', 'glee', 'glen', 'goggle', 'gone', 'gong', 'google', 'googol', 'goon', 'loge', 'logo', 'long', 'longneck', 'ogee', 'ogle', 'oolong'],
    }
}

const userType = {
    isLoggedIn: true,
    hasXwd: true,
    hasDigi: true,
    hasHd: false,
    isErsatzShortz: false,
    inShortzMode: false,
    entitlement: 'sub,cr'
}

const completeGameData = () => {
    let i = 1;
    for (let entries of Object.values(gameData)) {
        let now = new Date(2030, 8, i);
        entries.displayWeekday = date.format(now, 'dddd');
        entries.displayDate = date.format(now, 'MMMM D, YYYY');
        entries.printDate = date.format(now, 'YYYY-MM-DD');
        entries.expiration = (now.getTime() / 1000) + 24000;
        entries.id = i;
        entries.validLetters = Array.from(new Set(entries.answers.join('').split('')));
        entries.outerLetters = entries.validLetters.filter(letter => letter !== entries.centerLetter);
        entries.pangrams = entries.answers.filter(term => !entries.validLetters.filter(letter => !term.split('').includes(letter)).length);
        entries.freeExpiration = 0;
        entries.editor = 'Spelling Bee Assistant QA';
        i++;
    }

    return gameData;
}

export default {
    gameData: completeGameData(),
    userType
};