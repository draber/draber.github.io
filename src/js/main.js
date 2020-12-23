import el from './modules/element.js';
import App from './modules/app.js';
import plugins from './modules/importer.js';

(new App(el.$('#pz-game-root'))).registerPlugins(plugins).registerTools();
