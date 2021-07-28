import settings from '../settings.js';

const paths = {};
const types = ['current', 'reference'];

const resources = {
    html: 'site.html',
    gameData: 'game-data.json',
    report: 'report.md',
    meta: 'meta-data.json',
    assets: 'games-assets/v2/'
}

types.forEach(type => {
    const base = settings.get(`mock.${type}`);
    paths[type] = {
        base
    }
    for (let [key, resource] of Object.entries(resources)) {
        paths[type][key] = base + '/' + resource;
    }
})

export {
    types,
    paths
};