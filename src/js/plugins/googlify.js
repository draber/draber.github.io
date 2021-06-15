import {
    prefix
} from '../modules/string.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

// noinspection SpellCheckingInspection
/**
 * Link all term to Google
 *
 * @param {App} app
 * @returns {Plugin} Googlify
 */
class Googlify extends Plugin {

    /**
     * Toggle state
     * @param {Boolean} state
     * @returns {Googlify}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add or remove pangram underlines
     * @returns {Googlify}
     */
    run() {
        const args = this.app.getObserverArgs();
        this.app.observer.disconnect();
        const fn = this.getState() ? this.link : this.unlink;
        el.$$('li', this.app.resultList).forEach(node => {
            const newNode = fn(node);
            if (!node.isSameNode(newNode)) {
                node.replaceWith(newNode)
            }
        });
        this.app.observer.observe(args.target, args.options);
        return this;
    }

    /**
     * Add link to a node
     * @param {HTMLElement} node
     */
    link(node) {
        if (el.$('a', node)) {
            return node;
        }
        const newNode = node.cloneNode(); 
        const text = node.textContent;    
        newNode.append(el.a({
            content: el.toNode(node.childNodes),
            attributes: {
                href: `https://www.google.com/search?q=${text}`,
                target: prefix()
            }
        }));
        return newNode;
    }

    /**
     * Remove link from a node
     * @param {HTMLElement} node
     */
    unlink(node) {
        const link = el.$('a', node);
        if (!link) {
            return node;
        }
        const newNode = node.cloneNode();
        newNode.append(el.toNode(link.children));
        return newNode;
    }

    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Googlify', 'Link all result terms to Google', {
            canChangeState: true,
            runEvt: prefix('refreshUi')
        });

        this.run();
    }
}

export default Googlify;