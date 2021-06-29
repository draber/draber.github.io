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
 * @returns {Plugin} ColorConfig
 */
class ColorConfig extends Plugin {

    toggle(state) {
        el.$$('[data-sba-theme]').forEach(element => {
            if (state.sat) {
                element.style.setProperty('--dhue', state.hue);
                element.style.setProperty('--dsat', state.sat + '%');
            } else if (state.lgt) {
                element.style.setProperty('--lhue', state.hue);
                element.style.setProperty('--llgt', state.lgt + '%');
            }
        });
        super.toggle(state);
    }

    /**
     * Toggle dark mode
     * @param state
     * @returns {ColorConfig}
     */
    run() {
        this.popup.toggle(true);
    }


    /**
     * ColorConfig constructor
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


        this.menuAction = 'popup';
        this.menuIcon = 'null';

        const swatches = el.ul({
            classNames: [prefix('swatches', 'd')]
        });

        for (let hue = 0; hue < 360; hue += 30) {
            const sat = hue === 0 ? 0 : 45;
            swatches.append(el.li({
                content: [
                    el.input({
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
                    el.label({
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

        this.menuIcon = 'null';

        // light: hsla(30, 25%, 65%, 1)

        this.popup = new Popup(this.key)
            .setContent('title', this.title)
            .setContent('subtitle', this.description)
            .setContent('body', el.div({
                classNames: [prefix('color-selector', 'd')],
                content: [
                    swatches,
                    el.div({
                        classNames: ['hive'],
                        content: [el.svg({
                            classNames: ['hive-cell', 'outer'],
                            attributes: {
                                viewBox: `0 0 24 21`
                            },
                            isSvg: true,
                            content: [el.path({
                                    classNames: ['cell-fill'],
                                    isSvg: true,
                                    attributes: {
                                        d: 'M18 21H6L0 10.5 6 0h12l6 10.5z'
                                    }
                                }),
                                el.text({
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