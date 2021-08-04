import expand from './expand.js';

const compact = js => {
    return expand(js)
        .split('\n')
        .map(entry => entry.trim())
        .join('\n');
}

export default compact;