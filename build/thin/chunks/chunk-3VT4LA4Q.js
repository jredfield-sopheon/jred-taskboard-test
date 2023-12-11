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
  Combo
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/widget/ProjectCombo.js
var ProjectCombo = class extends Combo {
  static get $name() {
    return "ProjectCombo";
  }
  static get type() {
    return "projectcombo";
  }
  static get configurable() {
    return {
      /**
       * Project to reconfigure when picking an item.
       * @config {Scheduler.model.ProjectModel}
       * @category Common
       */
      project: null,
      /**
       * Field used as projects title.
       * @config {String}
       * @default
       * @category Common
       */
      displayField: "title",
      /**
       * Field used as projects load url.
       * @config {String}
       * @default
       * @category Common
       */
      valueField: "url",
      highlightExternalChange: false,
      editable: false
    };
  }
  updateProject(project) {
    var _a;
    if ((_a = project.transport.load) == null ? void 0 : _a.url) {
      this.value = project.transport.load.url;
    }
  }
  onChange({ value, userAction }) {
    if (userAction && this.project) {
      this.project.transport.load.url = value;
      this.project.load();
    }
  }
};
ProjectCombo.initClass();
ProjectCombo._$name = "ProjectCombo";

export {
  ProjectCombo
};
//# sourceMappingURL=chunk-3VT4LA4Q.js.map
