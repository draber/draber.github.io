import expand from './expand.js';

const compact = css => {
    return expand(css).replace(/(\r|\n)\}/g, '}%EOL%')
        .replace(/\s+/g, ' ')
        .replace(/\s*(\(|\)|\{|\}|:|;|,)\s*/g, '$1')
        .replace(/;}/g, '}')
        .replace(/\n\s/g, '\n')
        .replace(/[\w\.-@]+\{\}/g, '')
        .split('%EOL%')
        .map(line => line.trim())
        .join('\n');
}

export default compact;