import UglifyJS from 'uglify-js';

const compress = js => {
    return UglifyJS.minify(js, {
        mangle: false
    }).code;
}

export default compress;