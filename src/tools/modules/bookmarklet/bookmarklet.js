/**
 * Converts javascript to a bookmarklet
 * @param js
 * @returns {string}
 */
const bookmarklify = js => {
    js = `(()=>{${js}})()`;
    return `javascript:${encodeURIComponent(js)}`;
}

export default bookmarklify;