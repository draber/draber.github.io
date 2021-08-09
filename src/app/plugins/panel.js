/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from "../modules/element";
import {
    prefix
} from "../modules/string";
import settings from "../modules/settings";


/**
 * Panel base class
 */
class Panel {

    /**
     * Create thge content of either a popup or a sidebar panel
     * @returns {HTMLElement}
     */
    buildUi() {
        return el.div({
            data: {
                ui: this.key
            },
            classNames: ['sb-modal-content'],
            content: [
                el.div({
                    classNames: ['sb-modal-header'],
                    content: [this.parts.title, this.parts.subtitle]
                }),
                this.parts.body,
                this.parts.footer
            ]
        });
    }

    reset() {
        this.target.append(this.ui);
    }

    /**
     * Set any part of the content the content of the panel
     * @param {String} part
     * @param {Element|NodeList|Array|String} content
     */
    setContent(part, content) {
        if (!this.parts[part]) {
            console.error(`Unknown target ${part}`);
            return this;
        }
        this.parts[part] = el.empty(this.parts[part]);
        this.parts[part].append(el.toNode(content));
        return this;
    }



    /**
     * Build an instance
     */
    constructor(app, key) {

        this.app = app;
        this.key = key;

        this.parts = {
            title: el.h3({
                classNames: ['sb-modal-title']
            }),

            subtitle: el.p({
                classNames: ['sb-modal-message']
            }),

            body: el.div({
                classNames: ['sb-modal-body']
            }),

            footer: el.div({
                classNames: ['sb-modal-message', 'sba-modal-footer'],
                content: [
                    el.a({
                        content: settings.get('label'),
                        attributes: {
                            href: settings.get('url'),
                            target: prefix()
                        }
                    })
                ]
            })
        }

        this.ui = this.buildUi();
        this.target = this.app.componentContainer;
        this.target.append(this.ui);
    }

}

export default Panel;