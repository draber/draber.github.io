import Popup from './popup.js';
import Plugin from '../modules/plugin.js';
import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DarkModeConfig
 */
class DarkModeConfig extends Plugin {



    /**
     * Toggle dark mode
     * @param state
     * @returns {DarkModeConfig}
     */
    toggle(state) {

        this.popup
            .setContent('title', this.title)
            .setContent('subtitle', this.description)
            .setContent('body', this.pane)
            .toggle(state);
    }


    /**
     * DarkModeConfig constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Dark Mode Colors', 'Select your favorite Dark Mode color scheme.', {
            canChangeState: true,
            defaultState: {
                hue: 0,
                sat: 0
            }
        });

        this.state = this.getState();

        this.menuAction = 'popup';
        this.menuIcon = 'null';

        const swatches = el.div({
            classNames: [prefix('swatches', 'd')]
        });

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 45;
            swatches.append(el.label({
                style: {
                    background: `hsl(${hue}, ${sat}%, 7%)`
                },
                content: el.input({
                    attributes: {
                        name: 'color-picker',
                        type: 'radio',
                        value: hue,
                        checked: hue === this.state.hue
                    },
                    events: {
                        change: () => {
                            document.body.style.setProperty('--h-base', hue);
                            document.body.style.setProperty('--s-base', sat + '%');
                            this.state = {
                                hue,
                                sat
                            }
                            super.toggle(this.state);
                        }
                    }
                })
            }))
        }

        this.menuIcon = 'null';
        this.popup = new Popup(this.key);
        this.pane = el.div({
            classNames: [prefix('color-selector', 'd')],
            content: [
                swatches,
                el.div({
                    content: el.svg({
                        attributes: {
                            viewBox: `0 0 24 21`
                        },
                        content: el.path({
                            isSvg: true,
                            attributes: {
                                d: 'M18 21H6L0 10.5 6 0h12l6 10.5z'
                            }
                        })
                    })
                }),
                el.span({
                    content: 'S'
                })
            ]
        })
        
        document.body.style.setProperty('--h-base', this.state.hue);
        document.body.style.setProperty('--s-base', this.state.sat + '%');
    }
}

export default DarkModeConfig;