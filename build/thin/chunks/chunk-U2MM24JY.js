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
  Column,
  ColumnStore,
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  NumberFormat
} from "./chunk-6ZLMCHE5.js";
import {
  Delayable_default,
  DomHelper,
  InstancePlugin,
  ObjectHelper,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/column/NumberColumn.js
var NumberColumn = class extends Column {
  static get defaults() {
    return {
      filterType: "number",
      /**
       * The format to use for rendering numbers.
       *
       * By default, the locale's default number formatter is used. For `en-US`, the
       * locale default is a maximum of 3 decimal digits, using thousands-based grouping.
       * This would render the number `1234567.98765` as `'1,234,567.988'`.
       *
       * @config {String|NumberFormatConfig}
       */
      format: ""
    };
  }
  //endregion
  //region Init
  get defaultEditor() {
    const { format, name, max, min, step, largeStep, align } = this;
    return ObjectHelper.cleanupProperties({
      type: "numberfield",
      format,
      name,
      max,
      min,
      step,
      largeStep,
      textAlign: align
    });
  }
  get formatter() {
    const me = this, { format } = me;
    let formatter = me._formatter;
    if (!formatter || me._lastFormat !== format) {
      me._formatter = formatter = NumberFormat.get(me._lastFormat = format);
    }
    return formatter;
  }
  formatValue(value) {
    if (value != null) {
      value = this.formatter.format(value);
      if (this.unit) {
        value = `${value}${this.unit}`;
      }
    }
    return value != null ? value : "";
  }
  /**
   * Renderer that displays a formatted number in the cell. If you create a custom renderer, and want to include the
   * formatted number you can call `defaultRenderer` from it.
   *
   * ```javascript
   * new Grid({
   *     columns: [
   *         {
   *             type   : 'number',
   *             text   : 'Total cost',
   *             field  : 'totalCost',
   *             format : {
   *                 style    : 'currency',
   *                 currency : 'USD'
   *             },
   *             renderer({ value }) {
   *                  return `Total cost: ${this.defaultRenderer({ value })}`;
   *             }
   *         }
   *     ]
   * }
   * ```
   *
   * @param {Object} rendererData The data object passed to the renderer
   * @param {Number} rendererData.value The value to display
   * @returns {String} Formatted number
   */
  defaultRenderer({ value }) {
    return this.formatValue(value);
  }
};
//region Config
__publicField(NumberColumn, "type", "number");
// Type to use when auto adding field
__publicField(NumberColumn, "fieldType", "number");
__publicField(NumberColumn, "fields", [
  "format",
  /**
   * The minimum value for the field used during editing.
   * @config {Number} min
   * @category Common
   */
  "min",
  /**
   * The maximum value for the field used during editing.
   * @config {Number} max
   * @category Common
   */
  "max",
  /**
   * Step size for the field used during editing.
   * @config {Number} step
   * @category Common
   */
  "step",
  /**
   * Large step size for the field used during editing. In effect for `SHIFT + click/arrows`
   * @config {Number} largeStep
   * @category Common
   */
  "largeStep",
  /**
   * Unit to append to displayed value.
   * @config {String} unit
   * @category Common
   */
  "unit"
]);
ColumnStore.registerColumnType(NumberColumn, true);
NumberColumn.exposeProperties();
NumberColumn._$name = "NumberColumn";

// ../Grid/lib/Grid/column/TreeColumn.js
var currentParentHasIcon = false;
var TreeColumn = class extends Column {
  static get defaults() {
    return {
      tree: true,
      hideable: false,
      minWidth: 150
    };
  }
  static get fields() {
    return [
      /**
       * The icon to use for the collapse icon in collapsed state
       * @config {String|null} expandIconCls
       */
      { name: "expandIconCls", defaultValue: "b-icon b-icon-tree-expand" },
      /**
       * The icon to use for the collapse icon in expanded state
       * @config {String|null} collapseIconCls
       */
      { name: "collapseIconCls", defaultValue: "b-icon b-icon-tree-collapse" },
      /**
       * The icon to use for the collapse icon in expanded state
       * @config {String|null} collapsedFolderIconCls
       */
      { name: "collapsedFolderIconCls" },
      /**
       * The icon to use for the collapse icon in expanded state
       * @config {String|null} expandedFolderIconCls
       */
      { name: "expandedFolderIconCls" },
      /**
       * Size of the child indent in em. Resulting indent is indentSize multiplied by child level.
       * @config {Number} indentSize
       * @default 1.7
       */
      { name: "indentSize", defaultValue: 1.7 },
      /**
       * The icon to use for the leaf nodes in the tree
       * @config {String|null} leafIconCls
       */
      { name: "leafIconCls", defaultValue: "b-icon b-icon-tree-leaf" },
      { name: "editTargetSelector", defaultValue: ".b-tree-cell-value" },
      /**
       * Renderer function, used to format and style the content displayed in the cell. Return the cell text you
       * want to display. Can also affect other aspects of the cell, such as styling.
       *
       * <div class="note">
       * As the TreeColumn adds its own cell content to the column, there is a limit to what is supported in the
       * renderer function in comparison with an ordinary
       * {@link Grid.column.Column#config-renderer Column renderer}. Most notably is that changing `cellElement`
       * content can yield unexpected results as it will be updated later in the rendering process.
       * </div>
       *
       * You can also return a {@link Core.helper.DomHelper#typedef-DomConfig} object describing the markup
       * ```javascript
       * new Grid({
       *     columns : [
       *         {
       *              type  : 'tree',
       *              field : 'name'
       *              text  : 'Name',
       *              renderer : ({ record }) => {
       *                  return {
       *                      class : 'myClass',
       *                      children : [
       *                          {
       *                              tag : 'i',
       *                              class : 'fa fa-pen'
       *                          },
       *                          {
       *                              tag : 'span',
       *                              html : record.name
       *                          }
       *                      ]
       *                  };
       *              }
       *         }
       *     ]
       * });
       * ```
       *
       * You can modify the row element too from inside a renderer to add custom CSS classes:
       *
       * ```javascript
       * new Grid({
       *     columns : [
       *         {
       *             type     : 'tree',
       *             field    : 'name',
       *             text     : 'Name',
       *             renderer : ({ record, row }) => {
       *                // Add special CSS class to new rows that have not yet been saved
       *               row.cls.newRow = record.isPhantom;
       *
       *               return record.name;
       *         }
       *     ]
       * });
       * ```
       *
       * @config {Function} renderer
       * @param {Object} renderData Object containing renderer parameters
       * @param {HTMLElement} renderData.cellElement Cell element, for adding CSS classes, styling etc. Can be `null` in case of export
       * @param {*} renderData.value Value to be displayed in the cell
       * @param {Core.data.Model} renderData.record Record for the row
       * @param {Grid.column.Column} renderData.column This column
       * @param {Grid.view.Grid} renderData.grid This grid
       * @param {Grid.row.Row} renderData.row Row object. Can be null in case of export. Use the
       *   {@link Grid.row.Row#function-assignCls row's API} to manipulate CSS class names.
       * @param {Object} renderData.size Set `size.height` to specify the desired row height for the current row.
       *   Largest specified height is used, falling back to configured {@link Grid/view/Grid#config-rowHeight}
       *   in case none is specified. Can be null in case of export
       * @param {Number} renderData.size.height Set this to request a certain row height
       * @param {Number} renderData.size.configuredHeight Row height that will be used if none is requested
       * @param {Boolean} renderData.isExport True if record is being exported to allow special handling during export.
       * @param {Boolean} renderData.isMeasuring True if the column is being measured for a `resizeToFitContent` call.
       *   In which case an advanced renderer might need to take different actions.
       * @returns {String|DomConfig|null}
       *
       * @category Rendering
       */
      "renderer"
    ];
  }
  constructor(config, store) {
    super(...arguments);
    const me = this;
    me.shouldHtmlEncode = me.htmlEncode;
    me.setData("htmlEncode", false);
    if (me.renderer) {
      me.originalRenderer = me.renderer;
    }
    me.renderer = me.treeRenderer.bind(me);
  }
  /**
   * A column renderer that is automatically added to the column with { tree: true }. It adds padding and node icons
   * to the cell to make the grid appear to be a tree. The original renderer is called in the process.
   * @private
   */
  treeRenderer(renderData) {
    var _a, _b, _c, _d, _e, _f;
    const me = this, {
      grid,
      cellElement,
      row,
      record,
      isExport
    } = renderData, gridMeta = record.instanceMeta(grid.store), isCollapsed = !record.isLeaf && gridMeta.collapsed, innerConfig = {
      className: "b-tree-cell-value"
    }, children = [innerConfig], result = {
      className: {
        "b-tree-cell-inner": 1
      },
      tag: record.href ? "a" : "div",
      href: record.href,
      target: record.target,
      children
    };
    let outputIsObject, iconCls, { value } = renderData, renderingColumn = me;
    const parentRenderer = grid.isTreeGrouped && !record.isLeaf && grid.features.treeGroup.parentRenderer;
    if (me.originalRenderer || parentRenderer) {
      let rendererHtml;
      if (parentRenderer) {
        if (record.field) {
          renderingColumn = grid.columns.get(record.field);
          value = renderingColumn.isWidgetColumn ? value : (_b = (_a = renderingColumn.renderer || renderingColumn.defaultRenderer) == null ? void 0 : _a.call(
            renderingColumn,
            {
              ...renderData,
              column: renderingColumn,
              value: record.name,
              isTreeGroup: true
            }
          )) != null ? _b : record.name;
        }
        rendererHtml = grid.features.treeGroup.parentRenderer({
          field: record.field,
          value,
          column: renderingColumn,
          record: record.firstGroupChild,
          grid
        });
      } else {
        rendererHtml = me.originalRenderer(renderData);
      }
      const hasFrameworkRenderer = (_c = grid.hasFrameworkRenderer) == null ? void 0 : _c.call(grid, {
        cellContent: rendererHtml,
        renderingColumn
      });
      outputIsObject = typeof rendererHtml === "object" && !hasFrameworkRenderer;
      value = hasFrameworkRenderer ? "" : rendererHtml === false ? cellElement.innerHTML : rendererHtml;
      renderData.rendererHtml = rendererHtml;
    }
    if (!outputIsObject) {
      value = String(value != null ? value : "");
    }
    if (isExport) {
      return value;
    }
    if (!record.isLeaf) {
      const isCollapsed2 = !record.isExpanded(grid.store), expanderIconCls = isCollapsed2 ? me.expandIconCls : me.collapseIconCls, folderIconCls = isCollapsed2 ? me.collapsedFolderIconCls : me.expandedFolderIconCls;
      cellElement.classList.add("b-tree-parent-cell");
      children.unshift({
        tag: "i",
        className: {
          "b-tree-expander": 1,
          [expanderIconCls]: 1,
          "b-empty-parent": !gridMeta.isLoadingChildren && (record.children !== true && !((_d = record.children) == null ? void 0 : _d.length))
        }
      });
      currentParentHasIcon = iconCls = renderData.iconCls || record.iconCls || folderIconCls;
    } else {
      cellElement.classList.add("b-tree-leaf-cell");
      iconCls = renderData.iconCls || record.iconCls || me.leafIconCls;
    }
    if (iconCls) {
      children.splice(children.length - 1, 0, {
        tag: "i",
        className: {
          "b-tree-icon": 1,
          [iconCls]: 1
        }
      });
    }
    if (row.isRow && !record.isLeaf) {
      row.setAttribute("aria-expanded", !isCollapsed);
      if (isCollapsed) {
        row.removeAttribute("aria-owns");
      } else {
        for (const region in grid.subGrids) {
          const el = row.elements[region];
          DomHelper.setAttributes(el, {
            "aria-owns": ((_e = record.children) == null ? void 0 : _e.length) ? (_f = record.children) == null ? void 0 : _f.map((r) => `${grid.id}-${region}-${r.id}`).join(" ") : null
          });
        }
      }
    }
    if (Array.isArray(value)) {
      innerConfig.children = value;
    } else if (outputIsObject) {
      Object.assign(innerConfig, value);
    } else if (renderingColumn.shouldHtmlEncode || !value.includes("<")) {
      result.className["b-text-value"] = 1;
      innerConfig.text = value;
    } else {
      innerConfig.html = value;
    }
    const padding = record.childLevel * me.indentSize + (record.isLeaf ? currentParentHasIcon ? 2 : iconCls ? 0.5 : 0.4 : 0);
    result.style = `padding-inline-start:${padding}em`;
    return result;
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, with special handling for the renderer
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    result.renderer = this.originalRenderer;
    return result;
  }
};
__publicField(TreeColumn, "$name", "TreeColumn");
__publicField(TreeColumn, "type", "tree");
ColumnStore.registerColumnType(TreeColumn, true);
TreeColumn.exposeProperties();
TreeColumn._$name = "TreeColumn";

// ../Grid/lib/Grid/feature/Tree.js
var immediatePromise = Promise.resolve();
var Tree = class extends InstancePlugin.mixin(Delayable_default) {
  // Plugin configuration. This plugin chains some functions in Grid.
  static get pluginConfig() {
    return {
      assign: ["collapseAll", "expandAll", "collapse", "expand", "expandTo", "toggleCollapse"],
      chain: ["onElementPointerUp", "onElementClick", "bindStore", "beforeRenderRow"]
    };
  }
  //endregion
  //region Init
  construct(client, config) {
    super.construct(client, config);
    if (!this.treeColumn) {
      console.info("To use the tree feature, one column should be configured with `type: 'tree'`");
    }
    client.store && this.bindStore(client.store);
  }
  doDisable(disable) {
    if (disable) {
      throw new Error("Tree feature cannot be disabled");
    }
  }
  get store() {
    return this.client.store;
  }
  get treeColumn() {
    const me = this, { columns } = me.client;
    if (!me._treeColumn || !columns.includes(me._treeColumn)) {
      me._treeColumn = columns.find((column) => column.isTreeColumn);
    }
    return me._treeColumn;
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      beforeLoadChildren: "onBeforeLoadChildren",
      loadChildren: "onLoadChildren",
      loadChildrenException: "onLoadChildrenException",
      beforeToggleNode: "onBeforeToggleNode",
      thisObj: this
    });
  }
  //endregion
  //region Expand & collapse
  /**
   * Collapse an expanded node or expand a collapsed. Optionally forcing a certain state.
   * This function is exposed on Grid and can thus be called as `grid.toggleCollapse()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to toggle
   * @param {Boolean} [collapse] Force collapse (true) or expand (false)
   * @on-owner
   * @category Tree
   */
  async toggleCollapse(idOrRecord, collapse) {
    if (idOrRecord == null) {
      throw new Error("Tree#toggleCollapse must be passed a record");
    }
    const me = this, { store, client } = me, { rowManager } = client, record = store.getById(idOrRecord), meta = record.instanceMeta(store);
    record.generation++;
    if (await store.toggleCollapse(record, collapse)) {
      const row = rowManager.getRowFor(record);
      if (row && record.ancestorsExpanded()) {
        row.render(null, null, false);
      }
      if (!me.isTogglingNode) {
        client.element.classList.add("b-toggling-node");
        me.isTogglingNode = true;
        me.requestAnimationFrame(() => {
          client.element.classList.remove("b-toggling-node");
          me.isTogglingNode = false;
        });
      }
      client.trigger(meta.collapsed ? "collapseNode" : "expandNode", { record });
      client.trigger("toggleNode", { record, collapse: meta.collapsed });
    }
  }
  /**
   * Collapse a single node.
   * This function is exposed on Grid and can thus be called as `grid.collapse()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to collapse
   * @on-owner
   * @category Tree
   */
  async collapse(idOrRecord) {
    return this.toggleCollapse(idOrRecord, true);
  }
  /**
   * Expand a single node.
   * This function is exposed on Grid and can thus be called as `grid.expand()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to expand
   * @on-owner
   * @category Tree
   */
  async expand(idOrRecord) {
    return this.toggleCollapse(idOrRecord, false);
  }
  onBeforeToggleNode({ record, collapse }) {
    this.client.trigger("beforeToggleNode", { record, collapse });
  }
  onBeforeLoadChildren({ source: store, params }) {
    const parent = store.getById(params[store.modelClass.idField]), row = this.client.rowManager.getRowFor(parent);
    row == null ? void 0 : row.addCls("b-loading-children");
  }
  onLoadChildren({ source: store, params }) {
    const parent = store.getById(params[store.modelClass.idField]), row = this.client.rowManager.getRowFor(parent);
    row == null ? void 0 : row.removeCls("b-loading-children");
  }
  onLoadChildrenException({ record }) {
    const row = this.client.rowManager.getRowFor(record);
    row == null ? void 0 : row.removeCls("b-loading-children");
  }
  /**
   * Expand or collapse all nodes, as specified by param, starting at the passed node (which defaults to the root node)
   * @param {Boolean} [collapse] Set to true to collapse, false to expand (defaults to true)
   * @param {Core.data.Model} [topNode] The topmost node from which to cascade a collapse.
   * Defaults to the {@link Core.data.Store#property-rootNode}. Not included in the cascade if
   * the root node is being used.
   * @category Tree
   */
  async expandOrCollapseAll(collapse = true, topNode = this.store.rootNode) {
    const { client, store } = this, { animateTreeNodeToggle } = client, promises = [], childRecords = [];
    client.trigger("beforeToggleAllNodes", { collapse });
    client.animateTreeNodeToggle = false;
    store.suspendEvents();
    store.traverse((record) => {
      const gridMeta = record.instanceMeta(store);
      if (!record.isLeaf) {
        if (collapse && !gridMeta.collapsed) {
          this.toggleCollapse(record, true);
          childRecords.push(...record.children);
        } else if (!collapse && gridMeta.collapsed) {
          if (Array.isArray(record.children)) {
            childRecords.push(...record.children);
          }
          promises.push(this.toggleCollapse(record, false));
        }
      }
    }, topNode, topNode === store.rootNode);
    store.resumeEvents();
    return (collapse ? immediatePromise : Promise.all(promises)).then(() => {
      client.refreshRows(collapse);
      if (childRecords.length) {
        if (collapse) {
          store.trigger("remove", { records: childRecords, isCollapse: true, isCollapseAll: true });
        } else {
          store.trigger("add", { records: childRecords, isExpand: true, isExpandAll: true });
        }
      }
      client.trigger("toggleAllNodes", { collapse });
      client.animateTreeNodeToggle = animateTreeNodeToggle;
    });
  }
  /**
   * Collapse all nodes.
   * This function is exposed on Grid and can thus be called as `grid.collapseAll()`
   * @on-owner
   * @category Tree
   */
  async collapseAll() {
    return this.expandOrCollapseAll(true);
  }
  /**
   * Expand all nodes.
   * This function is exposed on Grid and can thus be called as `grid.expandAll()`
   * @on-owner
   * @category Tree
   */
  async expandAll() {
    return this.expandOrCollapseAll(false);
  }
  /**
   * Expands parent nodes to make this node "visible".
   * This function is exposed on Grid and can thus be called as `grid.expandTo()`
   * @param {String|Number|Core.data.Model|String[]|Number[]|Core.data.Model[]} idOrRecord Record (the node itself),
   * or id of a node. Also accepts arrays of the same types.
   * @param {Boolean} [scrollIntoView=true] A flag letting you control whether to scroll the record into view
   * @on-owner
   * @async
   * @category Tree
   */
  async expandTo(idOrRecord, scrollIntoView = true) {
    var _a, _b, _c, _d;
    const me = this, { store, client } = me, { animateTreeNodeToggle } = client;
    if (Array.isArray(idOrRecord)) {
      if (idOrRecord.length > 0) {
        client.suspendRefresh();
        for (let i = idOrRecord.length - 1; i >= 0; i--) {
          const record2 = store.getById(idOrRecord[i]);
          if (i === 0) {
            (_a = client.resumeRefresh) == null ? void 0 : _a.call(client);
            client.rowManager.refresh();
          }
          await ((_b = me.expandTo) == null ? void 0 : _b.call(me, record2, i === 0));
        }
      }
      return;
    }
    const record = store.getById(idOrRecord);
    if (record.instanceMeta(me.store).hiddenByCollapse === false) {
      return;
    }
    client.animateTreeNodeToggle = false;
    if (!record.ancestorsExpanded()) {
      const parents = [];
      for (let parent = record.parent; parent && !parent.isRoot; parent = parent.parent) {
        if (!parent.isExpanded(store)) {
          parents.unshift(parent);
        }
      }
      client.suspendRefresh();
      for (const parent of parents) {
        if (!me.isDestroyed) {
          await me.toggleCollapse(parent, false);
        }
      }
      (_c = client.resumeRefresh) == null ? void 0 : _c.call(client);
      (_d = client.refreshRows) == null ? void 0 : _d.call(client);
    }
    client.animateTreeNodeToggle = animateTreeNodeToggle;
    if (!me.isDestroyed && scrollIntoView) {
      await client.scrollRowIntoView(record);
    }
  }
  //endregion
  //region Events
  /**
   * Called when user clicks somewhere in the grid. Expand/collapse node on icon click.
   * @private
   */
  onElementPointerUp(event) {
    const me = this, target = event.target, cellData = me.client.getCellDataFromEvent(event), clickedExpander = target.closest(".b-tree-expander");
    if (clickedExpander || me.expandOnCellClick && (cellData == null ? void 0 : cellData.record.isParent)) {
      me.toggleCollapse(cellData.record);
    }
  }
  onElementClick(event) {
    if (event.target.closest(".b-tree-expander")) {
      event.preventDefault();
    }
  }
  /**
   * Called on key down in grid. Expand/collapse node on [space]
   * @private
   */
  toggleCollapseByKey() {
    const { focusedCell } = this.client;
    if ((focusedCell == null ? void 0 : focusedCell.rowIndex) > -1 && !focusedCell.isActionable) {
      this.toggleCollapse(focusedCell.id);
      return true;
    }
    return false;
  }
  //endregion
  //region Rendering
  beforeRenderRow({ record, cls }) {
    if (!record.isLeaf) {
      const isCollapsed = !record.isExpanded(this.client.store);
      cls["b-tree-parent-row"] = 1;
      cls["b-tree-collapsed"] = isCollapsed;
      cls["b-tree-expanded"] = !isCollapsed;
      cls["b-loading-children"] = record.instanceMeta(this.client).isLoadingChildren;
    } else {
      cls["b-tree-parent-row"] = 0;
      cls["b-tree-collapsed"] = 0;
      cls["b-tree-expanded"] = 0;
      cls["b-loading-children"] = 0;
    }
  }
  //endregion
  // Expands tree if single column.
  // Called by default on ArrowRight
  expandIfSingleColumn() {
    if (this.client.columns.count === 1) {
      return this.expandByKey();
    }
    return false;
  }
  // Expands tree on Shift+ArrowRight by default.
  expandByKey() {
    const me = this, { client } = me, { focusedCell } = client, record = focusedCell == null ? void 0 : focusedCell.record;
    if (record && (focusedCell == null ? void 0 : focusedCell.column.tree) && record.isParent && record.instanceMeta(client.store).collapsed) {
      me.expand(record);
      return true;
    }
    return false;
  }
  collapseIfSingleColumn() {
    if (this.client.columns.count === 1) {
      return this.collapseByKey();
    }
    return false;
  }
  collapseByKey() {
    const me = this, { client } = me, { focusedCell } = client, record = focusedCell == null ? void 0 : focusedCell.record;
    if ((focusedCell == null ? void 0 : focusedCell.column.tree) && record) {
      if (record.isParent && !record.instanceMeta(client.store).collapsed) {
        me.collapse(record);
        return true;
      }
      if (record.parent && !record.parent.isRoot) {
        client.deselectAll();
        client.focusCell({
          record: record.parent,
          column: focusedCell.column
        });
        return true;
      }
    }
    return false;
  }
};
//region Config
__publicField(Tree, "$name", "Tree");
__publicField(Tree, "configurable", {
  /**
   * Expand parent nodes when clicking on their cell
   * @prp {Boolean}
   * @default
   */
  expandOnCellClick: false,
  /**
   * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<String,String>}
   */
  keyMap: {
    " ": "toggleCollapseByKey",
    ArrowRight: "expandIfSingleColumn",
    "Shift+ArrowRight": "expandByKey",
    ArrowLeft: "collapseIfSingleColumn",
    "Shift+ArrowLeft": "collapseByKey"
  }
});
Tree.featureClass = "b-tree";
Tree._$name = "Tree";
GridFeatureManager.registerFeature(Tree, false, "Grid");
GridFeatureManager.registerFeature(Tree, true, "TreeGrid");

export {
  NumberColumn,
  TreeColumn,
  Tree
};
//# sourceMappingURL=chunk-U2MM24JY.js.map
