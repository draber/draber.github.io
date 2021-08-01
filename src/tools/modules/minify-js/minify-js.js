import {
    minify
} from 'terser';

/**
 * Creates minified JS
 * @param path
 * @returns {Promise<string>}
 */
const minifyJs = async uncompressed => {
    let min = await minify(uncompressed.trim(), {
        mangle: true,
        ecma: 2020,
        compress: {
            arguments: true
        }
    });
    return min.code;
}

export default minifyJs;