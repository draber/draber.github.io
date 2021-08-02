const env = options => {
    return {
        version: options.version,
        api: '/mock/game-data',
        tagx: '/mock/data-layer',
        gtm: '/mock/gtm',
        name: 'prod'
    }
}

export default env;