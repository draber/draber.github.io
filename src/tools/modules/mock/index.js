import create from './create.js'
import evaluate from './evaluate.js'
import minimist from 'minimist';
import logger from '../logger/index.js';
import {
    types
} from './common.js';

const args = minimist(process.argv.slice(2));

const serve = target => {
    logger.info(target)
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
                logger.error(`Mock: Invalid value ${args[arg]}`);
                return false;
            }
            return fn[arg](args[arg]);
        }
    }

    logger.error(`Mock: Invalid option ${Object.keys(args)[1]}`);
    return false;
})()

export default run;