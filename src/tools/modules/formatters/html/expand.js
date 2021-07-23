import beautify from 'beautify';

const expand = html => {
    return beautify(html, {
        format: 'html'
    })
}

export default expand;