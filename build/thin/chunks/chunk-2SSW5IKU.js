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
  Container,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/base/UndoRedoBase.js
var UndoRedoBase = class extends Container {
  static get configurable() {
    return {
      // Documented on subclasses
      project: null,
      stm: null,
      /**
       * Configure as `true` to show "Undo" and "Redo" as button texts. The buttons always have a tooltip
       * as a hint to the user as to their purpose.
       * @config {Boolean}
       */
      text: null,
      /**
       * Button color for the undo and redo buttons. See {@link Core.widget.Button#config-color}.
       * @config {String}
       */
      color: null,
      /**
       * Configure as `true` to show "0" badge on the undo and redo buttons when they have no actions
       * left to perform. By default when there are no actions, no badge is displayed.
       * @config {Boolean}
       */
      showZeroActionBadge: null,
      cls: "b-undo-controls b-toolbar",
      layoutStyle: {
        alignItems: "stretch",
        flexFlow: "row nowrap",
        overflow: "visible"
      },
      items: {
        undoBtn: {
          type: "button",
          icon: "b-icon-undo",
          tooltip: "L{UndoRedo.UndoLastAction}",
          onAction: "up.onUndo"
          // 'up.' means method is on a parent Widget.
        },
        transactionsCombo: {
          type: "combo",
          valueField: "idx",
          editable: false,
          store: {},
          emptyText: "L{UndoRedo.NoActions}",
          onAction: "up.onTransactionSelected",
          displayValueRenderer: "up.transactionsDisplayValueRenderer"
        },
        redoBtn: {
          type: "button",
          icon: "b-icon-redo",
          tooltip: "L{UndoRedo.RedoLastAction}",
          onAction: "up.onRedo"
        }
      },
      // This is treated as atomic by the Toolbar's menu overflow processing.
      overflowable: true
    };
  }
  afterConstruct() {
    this.updateUndoRedoControls();
  }
  updateStm(stm) {
    this.detachListeners("undoredo");
    stm == null ? void 0 : stm.ion({
      name: "undoredo",
      recordingstop: "updateUndoRedoControls",
      restoringstop: "updateUndoRedoControls",
      queueReset: "updateUndoRedoControls",
      disabled: "updateUndoRedoControls",
      thisObj: this
    });
  }
  changeItems(items) {
    const { undoBtn, redoBtn } = items;
    if (this.color) {
      undoBtn && (undoBtn.color = this.color);
      redoBtn && (redoBtn.color = this.color);
    }
    if (this.text) {
      undoBtn && (undoBtn.text = "L{UndoRedo.Undo}");
      redoBtn && (redoBtn.text = "L{UndoRedo.Redo}");
    }
    return super.changeItems(items);
  }
  updateProject(project) {
    this.stm = project.stm;
  }
  fillUndoRedoCombo() {
    const { transactionsCombo } = this.widgetMap;
    transactionsCombo && (transactionsCombo.items = [[0, "Original data"], ...this.stm.queue.map((title, idx) => [idx + 1, title || `Transaction ${idx + 1}`])]);
  }
  updateUndoRedoControls() {
    const {
      stm,
      showZeroActionBadge
    } = this, {
      undoBtn,
      redoBtn,
      transactionsCombo
    } = this.widgetMap;
    undoBtn.badge = stm.position || (showZeroActionBadge ? "0" : "");
    redoBtn.badge = stm.length - stm.position || (showZeroActionBadge ? "0" : "");
    undoBtn.disabled = !stm.canUndo;
    redoBtn.disabled = !stm.canRedo;
    this.fillUndoRedoCombo();
    if (transactionsCombo) {
      transactionsCombo.disabled = transactionsCombo.store.count <= 1;
    }
  }
  transactionsDisplayValueRenderer(record, combo) {
    var _a;
    const stmPos = ((_a = this.stm) == null ? void 0 : _a.position) || 0;
    return `${stmPos} undo actions / ${combo.store.count - stmPos - 1} redo actions`;
  }
  onUndo() {
    this.stm.canUndo && this.stm.undo();
  }
  onRedo() {
    this.stm.canRedo && this.stm.redo();
  }
  onTransactionSelected(combo) {
    const { stm } = this, delta = stm.position - combo.value;
    if (delta > 0) {
      stm.canUndo && stm.undo(delta);
    } else if (delta < 0) {
      stm.canRedo && stm.redo(-delta);
    }
  }
};
__publicField(UndoRedoBase, "$name", "UndoRedoBase");
__publicField(UndoRedoBase, "type", "undoredobase");
UndoRedoBase.initClass();
UndoRedoBase._$name = "UndoRedoBase";

export {
  UndoRedoBase
};
//# sourceMappingURL=chunk-2SSW5IKU.js.map
