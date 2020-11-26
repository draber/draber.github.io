// helpers
import el from './modules/element.js';
import widget from './modules/app.js';
import settings from './modules/settings.js';
import styles from './modules/styles.js';

// plugins
import scoreSoFar from './plugins/scoreSoFar.js';
import setUp from './plugins/setUp.js';
import spillTheBeans from './plugins/spillTheBeans.js';
import spoilers from './plugins/spoilers.js';
import header from './plugins/header.js';
import surrender from './plugins/surrender.js';
import steps from './plugins/steps.js';
import footer from './plugins/footer.js';

// containers
const gameContainer = el.$('#pz-game-root');
const resultContainer = el.$('.sb-wordlist-items', gameContainer);

// initialize instance, destroy old one before
if (window.gameData) {
	const oldInstance = el.$(`[data-id="${settings.get('repo')}"]`, gameContainer);
	if (oldInstance) {
		oldInstance.dispatchEvent(new Event('sbaDestroy'));
	}

	const app = widget(gameContainer);

	header.add(app);
	scoreSoFar.add(app);
	spoilers.add(app);
	spillTheBeans.add(app, el.$('.sb-hive-input-content', gameContainer));
	surrender.add(app, resultContainer);
	steps.add(app, gameContainer);
	setUp.add(app);
	footer.add(app);
	styles.add(app);
	gameContainer.append(app);
	app.dispatchEvent(new Event('sbaLaunchComplete'));
}
