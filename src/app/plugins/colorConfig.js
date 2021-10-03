/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import Popup from './popup.js';
import Plugin from '../modules/plugin.js';
import {
    prefix
} from '../modules/string.js';
import fn from 'fancy-node';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ColorConfig
 */
class ColorConfig extends Plugin {

    /**
     * Set hue and saturation of the dark mode theme as a body style
     * @param state
     */
    toggle(state) {
        fn.$$('[data-sba-theme]').forEach(element => {
            element.style.setProperty('--dhue', state.hue);
            element.style.setProperty('--dsat', state.sat + '%');
        });
        return super.toggle(state);
    }

    /**
     * Toggle dark mode color scheme
     * @param state
     * @returns {ColorConfig}
     */
    display() {
        this.popup.toggle(true);
        fn.$('input:checked', this.popup.ui).focus();
    }


    /**
     * ColorConfig constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Dark Mode Colors', 'Select your favorite color scheme for the Dark Mode.', {
            canChangeState: true,
            defaultState: {
                hue: 0,
                sat: 0
            }
        });


        this.menuAction = 'popup';
        this.menuIcon = 'null';

        const swatches = fn.ul({
            classNames: [prefix('swatches', 'd')]
        });

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 25;
            swatches.append(fn.li({
                content: [
                    fn.input({
                        attributes: {
                            name: 'color-picker',
                            type: 'radio',
                            value: hue,
                            checked: hue === this.getState().hue,
                            id: prefix('h' + hue)
                        },
                        events: {
                            change: () => {
                                this.toggle({
                                    hue,
                                    sat
                                });
                            }
                        }
                    }),
                    fn.label({
                        attributes: {
                            htmlFor: prefix('h' + hue)
                        },
                        style: {
                            background: `hsl(${hue}, ${sat}%, 22%)`
                        }
                    })
                ]
            }))
        }


        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title)
            .setContent('subtitle', this.description)
            .setContent('body', fn.div({
                classNames: [prefix('color-selector', 'd')],
                content: [
                    swatches,
                    fn.div({
                        classNames: ['hive'],
                        content: [fn.svg({
                            classNames: ['hive-cell', 'outer'],
                            attributes: {
                                viewBox: `0 0 24 21`
                            },
                            isSvg: true,
                            content: [fn.path({
                                classNames: ['cell-fill'],
                                isSvg: true,
                                attributes: {
                                    d: 'M18 21H6L0 10.5 6 0h12l6 10.5z'
                                }
                            }),
                                fn.text({
                                    classNames: ['cell-letter'],
                                    attributes: {
                                        x: '50%',
                                        y: '50%',
                                        dy: '0.35em',
                                    },
                                    isSvg: true,
                                    content: 's',
                                })
                            ]
                        })]
                    }),

                ]
            }));
        this.popup.ui.dataset[prefix('theme')] = 'dark';

        this.toggle(this.getState());
    }
}

export default ColorConfig;