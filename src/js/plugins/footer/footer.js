import settings from '../../modules/settings.js';
import el from '../../modules/element.js';
import plugin from '../../modules/pluginBase.js';

/**
 * Footer plugin
 * 
 * @param {app} app
 * @returns {plugin} footer
 */
class footer extends plugin {
    constructor(app) {

        super(app);
        this.title = `${settings.get('label')} ${settings.get('version')}`;
        this.key = 'footer';

        this.ui = el.create({
            tag: 'a',
            text: this.title,
            attributes: {
                href: settings.get('url'),
                target: '_blank'
            }
        });
        this.add();
    }
}

export default footer;
