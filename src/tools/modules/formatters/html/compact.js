import expand from './expand.js';

const compact = html => {
    return expand(html)
        .split('\n')
        .map(entry => entry.trim())
        .join('\n');
}

export default compact;