/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";

/**
 * Builds a collapsible `<details>` pane, used by the plugins in the assistant panel
 */
class DetailsBuilder {
  /**
   * Replace the content of the details element
   * @param {HTMLElement} newContent
   * @returns {DetailsBuilder}
   */
  update(newContent) {
    if (!this.element) {
      this.render();
    }

    this.content.replaceWith(newContent);
    this.content = newContent;
    return this;
  }

  /**
   * Generates and returns a new <details> element
   * @returns {HTMLElement} A complete <details> element.
   */
  render() {
    this.element = fn.details({
      content: [
        fn.summary({
          content: this.title,
        }),
        this.content,
      ],
      attributes: {
        open: this.open,
        name: this.name
      },
    });

    return this.element;
  }

  /**
   * Open or close the pane
   * @returns {DetailsBuilder}
   */
  togglePane() {
    this.element.open = !this.element.open;
    return this;
  }

  /**
   * Returns the rendered <details> element, using the cached version if available.
   * Triggers rendering if it hasn't been called yet.
   * @returns {HTMLElement}
   */
  get ui() {
    return this.element || this.render();
  }

  /**
   * Create the details wrapper for this table plugin
   *
   * @param {String} title - Title shown in the summary element
   * @param {Boolean} [open=false]
   * @param {String} [name=""] - Name of the details element, panes with the same name form an accordion
   */
  constructor(title, open = false, name = "") {
    this.title = title;
    this.open = open;
    this.name = name;
    this.content = fn.div();

    this.element = null;
  }
}

export default DetailsBuilder;
