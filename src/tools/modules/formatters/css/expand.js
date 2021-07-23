import beautify from 'beautify';

const expand = css => {
    return beautify(css, {
        format: 'css'
    })
}

export default expand;