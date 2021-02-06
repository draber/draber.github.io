import el from './modules/element.js';
import App from './modules/app.js';
import data from './modules/data.js';
import plugins from './modules/importer.js';

const app = new App(el.$('#pz-game-root'));
app.getResults()
    .then(foundTerms => {
        data.init(app, foundTerms)
        app.registerPlugins(plugins);
    });

