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

// initialize instance, destroy old one before
if (window.gameData) {
	const game = el.$('#pz-game-root');
	const app = widget(game);

	const oldInstance = el.$(`[data-id="${settings.get('repo')}"]`);
	if (oldInstance) {
		oldInstance.dispatchEvent(new Event('sbaDestroy'));
	}
	document.body.append(app);

	// plugins in order of appearance
	[header, scoreSoFar, spoilers, spillTheBeans, steps, surrender, setUp, footer].forEach(plugin => {
		plugin.add(app, game);
	});

	styles.add(app);

	app.dispatchEvent(new Event('sbaLaunchComplete'));
}
