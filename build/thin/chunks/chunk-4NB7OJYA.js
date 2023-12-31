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
  Model
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/data/GridRowModel.js
var GridRowModel = class extends Model {
  static get fields() {
    return [
      /**
       * Icon for row (used automatically in tree, feel free to use it in renderer in other cases)
       * @field {String} iconCls
       * @category Styling
       */
      {
        name: "iconCls",
        internal: true
      },
      /**
       * CSS class (or several classes divided by space) to append to row elements
       * @field {String} cls
       * @category Styling
       */
      {
        name: "cls",
        internal: true
      },
      /**
       * Used by the default implementation of {@link Grid.view.GridBase#config-getRowHeight} to determine row
       * height. Set it to use another height than the default for a the records row.
       * @field {Number} rowHeight
       * @category Styling
       */
      {
        name: "rowHeight",
        internal: true
      },
      /**
       * A link to use for this record when rendered into a {@link Grid.column.TreeColumn}.
       * @field {String} href
       * @category Tree
       */
      {
        name: "href",
        internal: true
      },
      /**
       * The target to use if this tree node provides a value for the {@link #field-href} field.
       * @field {'_self'|'_blank'|'_parent'|'_top'|null} target
       * @category Tree
       */
      {
        name: "target",
        internal: true
      }
    ];
  }
};
GridRowModel.exposeProperties();
GridRowModel._$name = "GridRowModel";

export {
  GridRowModel
};
//# sourceMappingURL=chunk-4NB7OJYA.js.map
