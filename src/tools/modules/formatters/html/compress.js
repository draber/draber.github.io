const compress = html => {
    return html.replace(/(\r|\n)+/g, '')
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><');
}

export default compress;