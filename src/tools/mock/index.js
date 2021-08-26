import create from './create.js'
import evaluate from './evaluate.js'
import minimist from 'minimist';
import console from 'a-nicer-console';
import {
    types
} from './common.js';

const args = minimist(process.argv.slice(2));

const serve = target => {
    console.info(target)
}

const run = (() => {
    const fn = {
        c: create,
        e: evaluate,
        s: serve
    }
    for (let arg of Object.keys(fn)) {
        if (args[arg]) {
            if (!types.includes(args[arg])) {
                console.error(`Mock: Invalid value ${args[arg]}`);
                return false;
            }
            return fn[arg](args[arg]);
        }
    }

    console.error(`Mock: Invalid option ${Object.keys(args)[1]}`);
    return false;
})()

export default run;