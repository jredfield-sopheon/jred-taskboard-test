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
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  FunctionHelper,
  InstancePlugin,
  ObjectHelper,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/feature/TreeGroup.js
var TreeGroup = class extends InstancePlugin {
  construct(grid, config) {
    this.treeColumn = grid.columns.find((col) => col.isTreeColumn);
    super.construct(grid, config);
    this._levels = this._levels || [];
    if (!grid.hasFeature("tree")) {
      throw new Error("The TreeGroup feature requires the Tree feature to be enabled");
    }
  }
  applyPluginConfig() {
    this.scheduleRefreshGroups = FunctionHelper.createBuffered(this.refreshGroups, this.refreshGroupsTimeout, this);
    return super.applyPluginConfig(...arguments);
  }
  processParentData(parentData) {
    const me = this;
    if (me.parentCls) {
      parentData.cls = me.parentCls;
    }
  }
  processTransformedData(transformedData) {
  }
  async waitForReadiness() {
    var _a;
    const me = this;
    if (me.originalStore.isLoading) {
      await me.originalStore.await("load", false);
      if (me.isDestroyed) {
        return;
      }
    }
    const { crudManager } = this.client;
    if (crudManager) {
      if (crudManager.isLoadingOrSyncing || crudManager._autoLoadPromise) {
        await crudManager.await("requestDone");
      }
      if (me.isDestroyed) {
        return;
      }
      await ((_a = me.client.project) == null ? void 0 : _a.commitAsync());
    }
  }
  async applyLevels(levels) {
    var _a;
    const me = this, { client, treeColumn } = me;
    let { store } = client, result = null, treeColumnField;
    const { modelClass } = store;
    if ((treeColumn == null ? void 0 : treeColumn.field) && modelClass.getFieldDefinition(treeColumn.field)) {
      treeColumnField = modelClass.getFieldDataSource(treeColumn.field);
    }
    levels = levels || [];
    if (levels.length === 0 && me.isConfiguring) {
      return;
    }
    me._levels = levels;
    me.isApplying++;
    client.suspendRefresh();
    if (!me.originalStore) {
      me.originalStore = store;
      store = new store.constructor({
        reapplyFilterOnAdd: true,
        reapplyFilterOnUpdate: true,
        tree: true,
        modelClass: store.modelClass,
        load: (_a = store.load) == null ? void 0 : _a.bind(store),
        commit: store.commit.bind(store)
      });
      client.store = store;
      me.originalStore.ion({
        name: "originalStore",
        refresh: me.onOriginalStoreRefresh,
        add: me.onOriginalStoreChanged,
        remove: me.onOriginalStoreChanged,
        removeAll: me.onOriginalStoreChanged,
        thisObj: me
      });
    }
    await me.waitForReadiness();
    if (me.isDestroyed) {
      return;
    }
    if (levels.length > 0) {
      const leafLinks = me.originalStore.getAllDataRecords(false).flatMap((record) => record.isLeaf ? record.link() : []);
      leafLinks.forEach((record) => record.setInstanceMeta(store.id, { collapsed: false }));
      store.data = leafLinks;
      result = store.treeify(levels, (parentData) => {
        if (treeColumnField) {
          ObjectHelper.setPath(parentData, treeColumnField, parentData.key);
        }
        me.processParentData(parentData);
      });
      me.processTransformedData(result);
      await me.trigger("beforeDataLoad", { store, data: result.children });
      store.data = result.children;
    } else {
      client.store = me.originalStore;
      me.detachListeners("originalStore");
      me.originalStore = null;
    }
    me.isApplying--;
    client.resumeRefresh(false);
    if (client.isPainted) {
      client.renderRows(false);
    }
    client.trigger("treeGroupChange", { levels });
  }
  doDisable(disable) {
    if (disable) {
      this.clearGroups();
    }
    super.doDisable(disable);
  }
  onOriginalStoreChanged() {
    this.scheduleRefreshGroups();
  }
  onOriginalStoreRefresh({ action }) {
    if (action === "dataset" || action === "filter") {
      this.scheduleRefreshGroups();
    }
  }
  updateLevels(levels, old) {
    const me = this, { client } = me;
    if (me.hideGroupedColumns) {
      old == null ? void 0 : old.forEach((field) => {
        field = field.fieldName || field;
        if (!levels.some((level) => (level.fieldName || level) === field)) {
          client.columns.get(field).show();
        }
      });
      levels == null ? void 0 : levels.forEach((field) => {
        field = field.fieldName || field;
        if (!old || !old.some((fn) => fn.fieldName === field)) {
          client._suspendRenderContentsOnColumnsChanged = true;
          client.columns.get(field).hide();
          client._suspendRenderContentsOnColumnsChanged = false;
        }
      });
    }
    if (levels || !me.isConfiguring) {
      me.updatePromise = me.applyLevels(levels);
      client.renderContents();
    }
  }
  /**
   *
   * Transforms the data according to the supplied levels.
   *
   * Yields the same result as assigning to {@link #property-levels}.
   *
   * ```javascript
   * // Transform into a tree with two parent levels
   * grid.group('status', record => (record.percentDone % 10) * 10);
   * ```
   *
   * @param {Array<String|Grid.column.Column|Function(Core.data.Model) : any>} levels Field names or functions use to generate parents in resulting tree.
   * @on-owner
   * @category Common
   */
  async group(levels) {
    ObjectHelper.assertArray(levels, "group()");
    await this.applyLevels(levels);
  }
  /**
   * Clears the previously applied transformation, restoring data to its initial state.
   *
   * Yields the same result as assigning `null` to {@link #property-levels}.
   *
   * ```javascript
   * // Restore original data
   * grid.clearGroups();
   * ```
   * @on-owner
   * @category Common
   */
  async clearGroups() {
    if (this.isGrouped) {
      this.levels = [];
      await this.updatePromise;
    }
  }
  /**
   * Refreshes the store tree grouping by re-applying the current transformation.
   *
   * ```javascript
   * // Refresh groups
   * grid.refreshGroups();
   * ```
   * @on-owner
   * @category Common
   * @private
   */
  refreshGroups() {
    var _a;
    return (_a = this.applyLevels) == null ? void 0 : _a.call(this, this._levels);
  }
  /**
   * Indicates if the feature has applied grouping and the component uses
   * a transformed version of the store.
   * @property {Boolean}
   */
  get isGrouped() {
    return this._levels.length > 0;
  }
  /**
   * Supply items for headers context menu.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this, groupable = column.groupable !== false && !column.isTreeColumn;
    let separator = false;
    if (groupable && !me.isGroupedByField(column.field)) {
      items.groupAsc = {
        text: "L{group}",
        localeClass: me,
        icon: "b-fw-icon b-icon-group-asc",
        separator: true,
        weight: 400,
        disabled: me.disabled,
        onItem: () => me.addGrouper(column)
      };
      separator = true;
    }
    if (me.isGrouped) {
      if (me.isGroupedByField(column.field)) {
        items.groupRemove = {
          text: "L{stopGroupingThisColumn}",
          localeClass: me,
          icon: "b-fw-icon b-icon-clear",
          separator: !separator,
          weight: 420,
          disabled: me.disabled,
          onItem: () => me.removeGrouper(column)
        };
        separator = true;
      }
      items.groupRemoveAll = {
        text: "L{stopGrouping}",
        localeClass: me,
        icon: "b-fw-icon b-icon-clear",
        separator: !separator,
        weight: 420,
        disabled: me.disabled,
        onItem: () => me.clearGroups()
      };
    }
  }
  addGrouper(column) {
    this.levels = this.levels.concat(column.field);
  }
  isGroupedByField(field) {
    return this.levels.find((groupFn) => groupFn.fieldName === field);
  }
  removeGrouper(column) {
    this.levels.splice(this.levels.findIndex((groupFn) => groupFn.fieldName === column.field), 1);
    this.levels = this.levels.slice();
  }
};
__publicField(TreeGroup, "$name", "TreeGroup");
__publicField(TreeGroup, "configurable", {
  /**
   * An array of model field names or functions used to determine the levels in the resulting tree.
   *
   * When supplying a function, it will be called for each leaf in the original data, and it is expected to return
   * an atomic value used to determine which parent the leaf will be added to at that level.
   *
   * ```javascript
   * const grid = new TreeGrid({
   *     features : {
   *         treeGroup : {
   *             levels : [
   *                 // First level is determined by the value of the status field
   *                 'status',
   *                 // Second level by the result of this function
   *                 // (which puts percentdone 0-9 in one group, 10-19 into another and so on)
   *                 record => (record.percentDone % 10) * 10
   *             ]
   *         }
   *     }
   * });
   * ```
   *
   * The function form can also be used as a formatter/renderer of sorts, simply by returning a string:
   *
   * ```javascript
   * const grid = new TreeGrid({
   *     features : {
   *         treeGroup : {
   *             levels : [
   *                 record => `Status: ${record.status}`
   *             ]
   *         }
   *     }
   * });
   * ```
   *
   * Assigning `null` restores the tree structure to its original state.
   *
   * @prp {Array<String|Function(Core.data.Model) : any>} levels
   */
  levels: [],
  /**
   * CSS class to apply to the generated parents.
   *
   * @config {String}
   * @default
   */
  parentCls: "b-generated-parent",
  /**
   * A function letting you format the text shown in the generated parent group levels. This method will be provided
   * with the value produced by the column representing the grouped level. Each column's renderer method will be
   * provided an extra `isTreeGroup` param to indicate that the value will be used for a generated parent. `cellElement`
   * and other DOM specific args will be in the context of the tree column.
   *
   * ```javascript
   * const grid = new Grid({
   *     features : {
   *         treeGroup : {
   *             hideGroupedColumns : true,
   *             levels             : [
   *                 'priority'
   *             ],
   *             parentRenderer({ field, value, column, record }) {
   *                 // For generated group parent, prefix with the grouped column text
   *                 return column.text + ': ' + value;
   *             }
   *         }
   *     }
   * })
   * ```
   *
   * @config {Function}
   * @param {Object} data The rendering data representing the generated tree parent record
   * @param {String} data.field The field representing this group level (e.g. 'priority')
   * @param {*} data.value The value representing this group level (e.g. 'high')
   * @param {Grid.column.Column} data.column The value representing this group level (e.g. 'high')
   * @param {Core.data.Model} data.record The first record for this parent
   * @returns {String}
   */
  parentRenderer: null,
  /**
   * True to hide grouped columns. Only supported when using String to define levels.
   *
   * @config {Boolean}
   */
  hideGroupedColumns: null,
  /**
   * The number of milliseconds to wait after {@link #function-scheduleRefreshGroups} call
   * before actually refreshing groups.
   * Each further {@link #function-scheduleRefreshGroups} call during that timeout will restart the timer.
   * @config {Number}
   * @default
   * @private
   */
  refreshGroupsTimeout: 100
});
__publicField(TreeGroup, "pluginConfig", {
  chain: ["populateHeaderMenu"],
  assign: ["group", "clearGroups", "refreshGroups"]
});
__publicField(TreeGroup, "properties", {
  isApplying: 0,
  /**
   * The original store used by the component before applying grouping. Use this to modify / load data
   * while tree grouping is active.
   * @property {Core.data.Store}
   * @readonly
   */
  originalStore: null
});
TreeGroup._$name = "TreeGroup";
GridFeatureManager.registerFeature(TreeGroup);

export {
  TreeGroup
};
//# sourceMappingURL=chunk-3P2EDKHK.js.map
