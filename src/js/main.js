// helpers
import el from './modules/element.js';
import widget from './modules/app.js';
import settings from './modules/settings.js';
import styles from './modules/styles.js';
import prefix from './modules/prefixer.js';

// plugins
import scoreSoFar from './plugins/scoreSoFar/plugin.js';
import setUp from './plugins/setUp/plugin.js';
import spillTheBeans from './plugins/spillTheBeans/plugin.js';
import spoilers from './plugins/spoilers/plugin.js';
import header from './plugins/header/plugin.js';
import surrender from './plugins/surrender/plugin.js';
import stepsToSuccess from './plugins/stepsToSuccess/plugin.js';
import footer from './plugins/footer/plugin.js';

// initialize instance, destroy old one before
const game = el.$('#pz-game-root');

// returns false and logs an error on sites other than Spelling Bee
const app = widget(game);
if (app) {

    const oldInstance = el.$(`[data-id="${settings.get('repo')}"]`);
    if (oldInstance) {
        oldInstance.dispatchEvent(new Event(prefix('destroy')));
    }
    document.body.append(app);

    // plugins in order of appearance
    [header, scoreSoFar, spoilers, spillTheBeans, stepsToSuccess, surrender, setUp, footer].forEach(plugin => {
        plugin.add(app, game);
    });

    styles.add(app);

    app.dispatchEvent(new Event(prefix('launchComplete')));
}
