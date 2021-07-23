const compress = json => {
    return JSON.stringify(JSON.parse(json));
}

export default compress;