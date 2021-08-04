import date from 'date-and-time';
import fs from 'fs-extra';
import settings from '../../../modules/settings/settings.js';

const dataDir = process.cwd() + '/' + settings.get('mock.data');
const games = dataDir + '/data.json';
const defaults = dataDir + '/test.json';

const getDateBlock = (day = false, offset = false) => {
    let now;
    if (!day && !offset) {
        now = new Date();
    } else {
        now = new Date(day);
        now.setDate(day.getDate() + offset);
    }
    let tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
        now,
        displayWeekday: date.format(now, 'dddd'),
        displayDate: date.format(now, 'MMMM D, YYYY'),
        printDate: date.format(now, 'YYYY-MM-DD'),
        expiration: parseInt(tomorrow.getTime() / 1000)
    }
}

const getDates = () => {
    const today = getDateBlock();
    return {
        today,
        yesterday: getDateBlock(today.now, -1)
    }
}

const getSubDivisions = (answers, centerLetter) => {
    const validLetters = Array.from(new Set(answers.join('').split('')));
    return {
        validLetters,
        outerLetters: validLetters.filter(letter => letter !== centerLetter),
        pangrams: answers.filter(term => !validLetters.filter(letter => !term.split('').includes(letter)).length)
    }
}

const gameData = (options = {}) => {
    let pool;
    let keys;
    let tDate;
    let yDate;
    const dates = getDates();

    if (!options.test && fs.existsSync(games)) {
        pool = fs.readJsonSync(games);
        keys = Object.keys(pool);
        keys.sort();
        tDate = games.current && pool[games.current] ? games.current : keys[Math.floor(Math.random() * keys.length)];
        yDate = keys.indexOf(tDate) + 1;
        if (!pool[yDate]) {
            for (let i = 0; i < keys.length; i++) {
                yDate = keys[0];
                if (yDate !== tDate) {
                    break;
                }
            }
        }
    } else {
        pool = fs.readJsonSync(defaults);
        keys = Object.keys(pool);
        tDate = keys[1];
        yDate = keys[0];
    }

    const extras = {
        freeExpiration: 0,
        editor: 'Spelling Bee Assistant QA'
    }

    return {
        today: {
            ...pool[tDate],
            ...getSubDivisions(pool[tDate].answers, pool[tDate].centerLetter),
            ...dates.today,
            ...extras,
            ...{
                id: tDate
            }
        },
        yesterday: {
            ...pool[yDate],
            ...getSubDivisions(pool[yDate].answers, pool[yDate].centerLetter),
            ...dates.yesterday,
            ...extras,
            ...{
                id: yDate
            }
        }
    }
}

export default gameData;