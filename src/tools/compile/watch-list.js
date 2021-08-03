import path from 'path';
import settings from '../modules/settings/settings.js';

const getWatchDirs = type => {
    const dirs = type === 'site' ? [
        'html.template',
        'scss.' + type
    ] : [
        'js.input',
        'extension.templates.manifest',
        'bookmarklet.template',
        'scss.' + type
    ];
    return dirs.map(entry => path.dirname(settings.get(entry))).concat(['src/config']);
}

export default getWatchDirs;