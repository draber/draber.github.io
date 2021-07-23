import compact from './compact.js';

const compress = css => {
    return compact(css).replace(/\n+/g, '');
}

export default compress;