import el from './modules/element.js';
import App from './modules/app.js';

const gameWrapper = el.$('#js-hook-game-wrapper');
const triggers = el.$$('.pz-moment__button-wrapper .pz-moment__button.primary');

let app;

triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        if(!app) {
            app = new App(gameWrapper);
        }
    })
})
    