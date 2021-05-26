import el from './modules/element.js';
import App from './modules/app.js';
import {
    prefix
} from './modules/string.js';

const game = el.$('#pz-game-root');
const triggers = el.$$('.pz-moment__button-wrapper .pz-moment__button.primary');

triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        game.dispatchEvent(new Event(prefix('gameReady')));
    })
})

const app = new App(game);
    