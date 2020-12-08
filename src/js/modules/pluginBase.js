import el from './element.js';
import settings from './settings.js';

class plugin {
    constructor(app) {

        this.app = app;

        // set some defaults
        this.defaultEnabled = true;
        this.optional = false;
        this.title = '';
        this.ui;
        this.target;

        this.hasUi = () => {
            return this.ui instanceof HTMLElement;
        }

        this.isEnabled = () => {
            const stored = settings.get(`options.${this.key}`);
            return typeof stored !== 'undefined' ? stored : this.defaultEnabled;
        }

        this.toggle = state => {
            settings.set(`options.${this.key}`, state);
            this.ui.classList.toggle('inactive', !state);
        }

        this.attach = () => {
            if (!this.hasUi()) {
                return false;
            }
            const target = this.target || el.$(`[data-ui="${this.key}"]`, app.ui) || (() => {
                const _target = el.create({
                    data: {
                        plugin: this.key
                    }
                });
                app.ui.append(_target);
                return _target;
            })();
            target.append(this.ui);
            return true;
        }

        this.add = () => {
            this.attach();
            if (this.optional) {          
                settings.set(`options.${this.key}`, this.isEnabled());
            }
        }
    }
}

export default plugin;
