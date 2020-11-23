// helpers
import el from './modules/element.js';
import widget from './modules/widget.js';
import settings from './modules/settings.js';
import data from './modules/data.js';
import observers from './modules/observers.js';
import styles from './modules/styles.js';

// plugins
import scoreSoFar from './plugins/scoreSoFar.js';
import setUp from './plugins/setUp.js';
import spillTheBeans from './plugins/spillTheBeans.js';
import spoilers from './plugins/spoilers.js';
import surrender from './plugins/surrender.js';
import footer from './plugins/footer.js';

// containers
const gameContainer = el.$('.sb-content-box');
const resultContainer = el.$('.sb-wordlist-items', gameContainer);

// initialize instance, destroy old one before
if (window.gameData) {
	const oldInstance = el.$(`[data-id="${settings.get('repo')}"]`, gameContainer);
	if (oldInstance) {
		oldInstance.dispatchEvent(new Event('destroy'));
	}

	const app = widget(resultContainer, {
		text: settings.get('title'),
		classNames: ['sba'],
		draggable: true,
		data: {
			id: settings.get('repo')
		},
		events: {
			destroy: function () {
				observers.removeAll();
				styles.remove();
				this.remove();
			}
		}
	});

	app.addEventListener('sbadarkMode', evt => {
		console.log(evt.detail)
        if(evt.detail.enabled){
            document.body.classList.add('sba-dark');
        }
        else {
            document.body.classList.remove('sba-dark');
        }
	});
	app.dispatchEvent(new CustomEvent('sbadarkMode', {
		detail: {
			enabled: settings.get('darkMode')
		}
	}))
	
	data.init(app, resultContainer);

	scoreSoFar.add(app);
	spoilers.add(app);
	spillTheBeans.add(app, el.$('.sb-hive-input-content', gameContainer));
	surrender.add(app, resultContainer);
	setUp.add(app);
	footer.add(app);
	styles.add();
	gameContainer.append(app);
	app.dispatchEvent(new Event('sbaLaunchComplete'));
}
