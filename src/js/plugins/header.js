import el from '../modules/element.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';
import icon from '../modules/icons.js';
import {
    prefix
} from '../modules/string.js';


const buildIcons = config => {
    const icons = {};
    for (const [key, entry] of Object.entries(config)) {
        const data = icon.getData(key);
        let title;        
        if(entry.attributes && entry.attributes.title){
            title = el.title({
                text: entry.attributes.title,
                svg: true
            });
            delete entry.attributes.title;
        }
        const svg = el.svg({
            events: entry.events,
            classNames: [
                prefix('icon ' + key)
            ].concat(entry.classNames | []),
            attributes: {
                ...{
                    viewBox: `0 0 ${data.width} ${data.height}`
                },
                ...(entry.attributes || {})
            },
            svg: true
        });
        svg.append(el.path({
            attributes: {
                d: data.path
            },
            svg: true
        }));
        if(title) {
            svg.append(title);
        }
        icons[key] = svg;
    }
    return icons;
}

/**
 * Header plugin
 * 
 * @param {App} app
 * @returns {Plugin} Header
 */
class Header extends Plugin {
    constructor(app) {

        super(app, settings.get('title'), {
            key: 'header'
        });

        this.ui = el.div();

        const icons = buildIcons({
            darkMode: {
                events: {
                    click: () => {
                        const plugin = app.registry.get('DarkMode');
                        plugin.toggle(!plugin.isActive())
                    }
                },
                attributes: {
                    title: 'Toggle dark mode'
                }
            },
            options: {
                events: {
                    click: () => {
                        const plugin = app.registry.get('SetUp');
                        plugin.toggle(!plugin.isActive())
                    }
                },
                attributes: {
                    title: 'Toggle option panel'
                }
            },
            arrowDown: {
                events: {
                    click: () => app.toggle(!app.isActive())
                },
                attributes: {
                    title: 'Toggle size'
                }
            }
        })


        // add title closer and minimizer
        this.ui.append(el.div({
                text: this.title,
                classNames: ['header']
            }), icons.darkMode, icons.options, icons.arrowDown

        );


        this.add();
    }
}

export default Header;