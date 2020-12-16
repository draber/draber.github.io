import el from './modules/element.js';
import app from './modules/app.js';
import plugins from './modules/importer.js';

(new app(el.$('#pz-game-root'))).registerPlugins(plugins);
