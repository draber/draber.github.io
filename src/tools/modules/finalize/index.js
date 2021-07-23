import fs from 'fs-extra';
import format from '../formatters/format.js';

const finalize = data => {
    for (let [type, subset] of Object.entries(data)) {
        subset.forEach(entry => {
            const formatted = format(type, entry.body, entry.format);
            fs.outputFileSync(entry.local, formatted)
        })
    }
}

export default finalize;