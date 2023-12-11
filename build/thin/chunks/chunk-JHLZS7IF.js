/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import {
  Field,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/TextAreaField.js
var TextAreaField = class extends Field {
  static get configurable() {
    return {
      /**
       * The resize style to apply to the `<textarea>` element.
       * @config {'none'|'both'|'horizontal'|'vertical'}
       * @default
       */
      resize: "none",
      inputAttributes: {
        tag: "textarea"
      }
    };
  }
  updateResize(resize) {
    this.input.style.resize = resize;
  }
};
__publicField(TextAreaField, "$name", "TextAreaField");
__publicField(TextAreaField, "type", "textareafield");
__publicField(TextAreaField, "alias", "textarea");
TextAreaField.initClass();
TextAreaField._$name = "TextAreaField";

export {
  TextAreaField
};
//# sourceMappingURL=chunk-JHLZS7IF.js.map
