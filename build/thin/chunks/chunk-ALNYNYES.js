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
  Grid
} from "./chunk-SL4DGZHQ.js";

// ../Grid/lib/Grid/view/TreeGrid.js
var TreeGrid = class extends Grid {
  static get $name() {
    return "TreeGrid";
  }
  // Factoryable type name
  static get type() {
    return "treegrid";
  }
  static get configurable() {
    return {
      /**
       * The store instance or config object that holds the records to be displayed by this TreeGrid. If assigning
       * a store instance, it must be configured with `tree: true`.
       *
       * A store will be created if none is specified.
       * @config {Core.data.Store|StoreConfig} store
       * @category Common
       */
      store: {
        tree: true
      }
    };
  }
  //region Plugged in functions / inherited configs
  /**
   * Collapse an expanded node or expand a collapsed. Optionally forcing a certain state.
   *
   * @function toggleCollapse
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to toggle
   * @param {Boolean} [collapse] Force collapse (true) or expand (false)
   * @param {Boolean} [skipRefresh] Set to true to not refresh rows (if calling in batch)
   * @async
   * @category Feature shortcuts
   */
  /**
   * Collapse a single node.
   *
   * @function collapse
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to collapse
   * @async
   * @category Feature shortcuts
   */
  /**
   * Expand a single node.
   *
   * @function expand
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to expand
   * @async
   * @category Feature shortcuts
   */
  /**
   * Expands parent nodes to make this node "visible".
   *
   * @function expandTo
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node
   * @async
   * @category Feature shortcuts
   */
  //endregion
  /* disconnect doc comment */
  //region Store
  updateStore(store, was) {
    if (store && !store.tree) {
      throw new Error("TreeGrid requires a Store configured with tree : true");
    }
    super.updateStore(store, was);
  }
  //endregion
};
TreeGrid.initClass();
TreeGrid._$name = "TreeGrid";

export {
  TreeGrid
};
//# sourceMappingURL=chunk-ALNYNYES.js.map
