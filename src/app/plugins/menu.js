/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import settings from '../modules/settings.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import iconWarning from '../../assets/svg/warning.svg';
import iconCoffee from '../../assets/svg/kofi.svg';


const svgIcons = {
    warning: iconWarning,
    coffee: iconCoffee
}


/**
 * Menu plugin
 *
 * @param {App} app
 * @returns {Plugin} Menu
 */
class Menu extends Plugin {

    /**
     * Get element to which the launcher will be attached to
     * @returns {HTMLElement}
     */
    getTarget() {
        return this.app.envIs('mobile') ? el.$('#js-mobile-toolbar') : el.$('#portal-game-toolbar > div:last-of-type');
    }

    /**
     * Get plugin or app from clicked entry
     * @param entry
     * @returns {Menu|App|null}
     */
    getComponent(entry) {
        if (entry.dataset.component === this.app.key) {
            return this.app
        }
        if (this.app.plugins.has(entry.dataset.component)) {
            return this.app.plugins.get(entry.dataset.component);
        }
        return null;
    }

    /**
     * Menu constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Menu', '');
        this.target = this.getTarget();
        const classNames = ['pz-toolbar-button__sba', this.app.envIs('mobile') ? 'pz-nav__toolbar-item' : 'pz-toolbar-button'];
        this.app.domSet('submenu', false);

        /**
         * List of options
         */
        const pane = el.ul({
            classNames: ['pane'],
            data: {
                ui: 'submenu'
            },
            events: {
                pointerup: evt => {
                    const entry = evt.target.closest('li');
                    if (!entry || evt.button !== 0) {
                        return false;
                    }
                    const component = this.getComponent(entry);
                    switch (entry.dataset.action) {
                        case 'boolean': {
                            let nextState = !component.getState();
                            component.toggle(nextState);
                            entry.classList.toggle('checked', nextState);
                            if (component === this.app) {
                                this.app.toggle(nextState);
                            }
                            break;
                        }
                        case 'popup':
                            this.app.domSet('submenu', false);
                            component.display();
                            break;
                        default:
                            setTimeout(() => {
                                this.app.domSet('submenu', false);
                            }, 60)
                    }
                }
            },
            content: el.li({
                classNames: this.app.getState() ? ['checked'] : [],
                attributes: {
                    title: this.app.title
                },
                data: {
                    component: this.app.key,
                    icon: 'checkmark',
                    action: 'boolean'
                },
                content: `Show ${settings.get('title')}`
            })
        });

        this.ui = el.div({
            events: {
                pointerup: evt => {
                    if (!evt.target.dataset.action) {
                        this.app.domSet('submenu', !this.app.domGet('submenu'));
                    }
                }
            },
            content: [
                settings.get('title'),
                pane
            ],
            attributes: {
                role: 'presentation'
            },
            classNames
        })

        document.addEventListener('keyup', evt => {
            if (this.app.domGet('submenu') === true && /^(Ent|Esc|Key|Dig)/.test(evt.code)) {
                this.app.domSet('submenu', false)
            }
        });

        el.$('#pz-game-root').addEventListener('pointerdown', () => {
            if (this.app.domGet('submenu') === true) {
                this.app.domSet('submenu', false)
            }
        });

        app.on(prefix('pluginsReady'), evt => {
            evt.detail.forEach((plugin, key) => {
                if (!plugin.canChangeState || plugin === this) {
                    return false;
                }
                const action = plugin.menuAction || 'boolean';
                const icon = plugin.menuIcon || null;
                pane.append(el.li({
                    classNames: action === 'boolean' && plugin.getState() ? ['checked'] : [],
                    attributes: {
                        title: plugin.description
                    },
                    data: {
                        component: key,
                        icon: action === 'boolean' ? 'checkmark' : icon,
                        action
                    },
                    content: svgIcons[icon] ? [svgIcons[icon], plugin.title] : plugin.title
                }));
            })
            pane.append(el.li({
                attributes: {
                    title: settings.get('support.text')
                },
                data: {
                    icon: prefix(),
                    component: prefix('web'),
                    action: 'link'
                },
                content: el.a({
                    content: [
                        iconCoffee,
                        settings.get('support.text'),
                    ],
                    attributes: {
                        href: settings.get('support.url'),
                        target: prefix()
                    }
                })
            }))
        })



        app.on(prefix('destroy'), () => this.ui.remove());
    }
}

export default Menu;