import Widget from './widget.js';

/**
 * Plugin base class
 */
class Plugin extends Widget {

    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @param {String} method
     * @returns {Widget}
     */
    attach(method = 'append') {
        if (!this.hasUi()) {
            return this;
        }
        this.ui.dataset.ui = this.key;
        (this.target || this.app.ui)[method](this.ui);
        return this;
    }

    /**
     * Adds plugin to DOM and registers state in local storage
     * @param {String} method
     * @returns {Widget}
     */
    add(method = 'append') {
        return this.attach(method);
    }

    /**
     * Build an instance of a plugin
     * @param {App} app
     * @param {String} title
     * @param {String} description
     * @param {{key: String, canChangeState: Boolean, defaultState: *}}
     */
    constructor(app, title, description, {
        key,
        canChangeState,
        defaultState
    } = {}) {
        super(title, {
            key,
            canChangeState,
            defaultState
        })

        /**
         * Parent element of plugin, if applicable
         * @type {undefined|HTMLElement}
         */
        this.target;

        /**
         * Description of the plugin
         * @type {String}
         */
        this.description = description || '';
    
        /**
         * App container object, not the app UI!
         * @type {App}
         */
        this.app = app;
    }
}

export default Plugin;