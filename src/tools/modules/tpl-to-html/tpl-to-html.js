import sizeOf from 'image-size';
import substituteVars from '../substitute-vars/substitute-vars.js';


/**
 * Creates HTML code for web site
 * @param path
 * @param jsPath
 * @returns {Promise<String>}
 */
 const convert = template => {
    const images = template.matchAll(/(?<src>src="(?<img>assets\/img\/[^?]+)\?{{version}}-{{cacheId}}")/g);
    for (const match of images) {
        const dimensions = sizeOf(match.groups.img);
        const sizeAttr = `width="${dimensions.width}" height="${dimensions.height}"`;
        const replacement = `${match.groups.src} ${sizeAttr}`;
        template = template.replace(match.groups.src, replacement);
    }
    return substituteVars(template);
}

export default convert;