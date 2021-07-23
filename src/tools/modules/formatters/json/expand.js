import beautify from 'beautify';

const expand = json => {
    return beautify(json, {
        format: 'json'
    })
}

export default expand;