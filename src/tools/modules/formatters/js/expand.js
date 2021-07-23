import beautify from 'beautify';

const expand = js => {
    return beautify(js, {
        format: 'js'
    })
}

export default expand;