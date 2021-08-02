import UAParser from 'ua-parser-js';

const device = options => {
    const result = UAParser(options.ua);

    const browser = result.browser.name + ' ' + result.browser.version;
    const os = result.os.name + ' ' + result.os.version;

    return {
        feedback: `\n\n\n----\nDevice summary:\nPage: %s\nBrowser: ${browser}\nOS: ${os}\nScreen Resolution: %s x %s\nViewport Size: %s x %s\nTimezone: %s\nRegi: %s\nDigi: %s\nXwd: %s\nHd: %s\nPage View: %s\n`,
        description: `${browser} on ${os}`,
        layout: result.engine.name,
        manufacturer: result.device.brand,
        name: result.browser.name,
        prerelease: null,
        product: null,
        ua: options.ua,
        version: result.browser.version,
        os: {
            architecture: result.cpu.architecture,
            family: result.os.name,
            version: result.os.version
        }
    }
}

export default device;