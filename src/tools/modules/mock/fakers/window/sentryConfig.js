const sentryConfig = options => {
    return {
        dsn: `${options.req.protocol}://abc@${options.req.ip}:${options.req.port}/1234567`,
        release: options.release
    }
}

export default sentryConfig;