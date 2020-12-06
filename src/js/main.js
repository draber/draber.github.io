// helpers
import el from './modules/element.js';
import widget from './modules/app.js';
import settings from './modules/settings.js';
import pf from './modules/prefixer.js';
import pluginManager from './modules/pluginManager.js';

// plugins
import scoreSoFar from './plugins/scoreSoFar/plugin.js';
import setUp from './plugins/setUp/plugin.js';
import spillTheBeans from './plugins/spillTheBeans/plugin.js';
import spoilers from './plugins/spoilers/plugin.js';
import header from './plugins/header/plugin.js';
import surrender from './plugins/surrender/plugin.js';
import stepsToSuccess from './plugins/stepsToSuccess/plugin.js';
import footer from './plugins/footer/plugin.js';
import darkMode from './plugins/darkMode/plugin.js';
import styles from './plugins/styles/plugin.js';

// initialize instance, destroy old one before
const game = el.$('#pz-game-root');

// returns false and logs an error on sites other than Spelling Bee
const app = widget(game);

if (app) {

    const oldInstance = el.$(`[data-id="${settings.get('repo')}"]`);
    if (oldInstance) {
        oldInstance.dispatchEvent(new Event(pf('destroy')));
    }

    // plugins in order of appearance
    [
        styles,
        darkMode,
        header,
        scoreSoFar, 
        spoilers, 
        spillTheBeans, 
        stepsToSuccess, 
        surrender, 
        setUp, 
        footer
    ].forEach(plugin => {
        pluginManager.add(new plugin(app, game));
    });

    el.$('body').append(app);

    app.dispatchEvent(new Event(pf('launchComplete')));
}