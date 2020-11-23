'use strict';
import {
    createElement,
    createCloser, 
    createDetails
} from './modules/toolkit.mjs';

//import { config, getByKey, set } from 'config-reader';
import * as config from '..config/config.json';
    // const config = {
    //     "label": "Spelling Bee Assistant",
    //     "url": "https://draber.github.io/",
    //     "twitter": "@d_raber",
    //     "ga": {
    //         "tid": "UA-182372232-1",
    //         "ec": "SBA Download"
    //     },
    //     "container": {
    //         "text": "Assistant",
    //         "attributes": {
    //             "draggable": true,
    //             "title": "Hold the mouse down to drag assistant"
    //         },
    //         "classNames": [
    //             "dragger"
    //         ],
    //         "closer": {
    //             "title": "Close assistant",
    //             "text": "×"
    //         },
    //         "panels": [{
    //                 "tag": "details",
    //                 "text": "Stats",
    //                 "attributes": {
    //                     "open": true
    //                 }
    //             },
    //             {
    //                 "tag": "details",
    //                 "text": "Spoilers"
    //             },
    //             {
    //                 "tag": "details",
    //                 "text": "Solution"
    //             }
    //         ],
    //         "footer": {
    //             "tag": "a",
    //             "text": [
    //                 "Spelling Bee Assistant",
    //                 "{{config.version}}"
    //             ],
    //             "attributes": {
    //                 "href": "https://draber.github.io/",
    //                 "target": "_blank"
    //             }
    //         }
    //     }
    // };

    /**
     * Create elements conveniently
     * @param tag
     * @param text
     * @param classNames
     * @param attributes
     * @returns {*}
     */
    const element = ({
        tag = 'div',
        text = '',
        classNames = [],
        attributes = {}
    } = {}) => {
        const element = document.createElement(tag);
        if (classNames.length) {
            element.classList.add(...classNames);
        }
        if (Array.isArray(text)) {
            text = text.join(' ');
        }
        if (text) {
            element.textContent = text;
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (value) {
                element.setAttribute(key, value);
            }
        }
        return element;
    }

    const container = (conf) => {
        const container = element({
            tag: 'aside',
            text: conf.text,
            attributes: conf.attributes || [],
            classNames: conf.classNames || []
        });
        if (conf.closer) {
            conf.closer.tag = conf.closer.tag || 'u';
            conf.closer.classNames = (conf.closer.classNames || []).concat(['closer']);
            container.append(element(conf.closer));
        }
        (conf.panels || []).forEach(data => {
            let panel;
            if (data.tag === 'details') {
                const summary = element({
                    tag: 'summary',
                    text: data.text
                });
                delete(data.text);
                panel = element(data);
                panel.append(summary);
            } else {
                panel = element(data);
            }
            container.append(panel);
        });

        if (conf.footer) {
            container.append(element(conf.footer));
        }
        return container;
    }

    console.log(container(config.container));
