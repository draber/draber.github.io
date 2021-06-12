import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

/**
 * Details plugin
 * 
 * @param {App} app
 * @returns {Plugin} DisclosureBox
 */
class DisclosureBox extends Plugin {


    /**
     * Build and add the widget
     */
    add(method = 'append') {
        this.ui = el.details({
            attributes: {
                open: this.open
            },
            content: [
                el.summary({
                    content: this.title
                }),
                this.pane
            ]
        });

		super.add(method);
    }

    /**
     * DisclosureBox constructor
     * @param app: App
     * @param title: String
     * @param description: String
     * @param canChangeState: Boolean
     * @param defaultState: Boolean
     * @param open: Boolean
     * @param runEvt: String
     */
	constructor(app, title, description, {
        canChangeState,
        defaultState = true,
        open = false,
        runEvt
    } = {})  {

		super(app, title, description, {
			canChangeState,
            defaultState,
            runEvt
		});

        this.title = title;
        this.open = open;
	}
}

export default DisclosureBox;
