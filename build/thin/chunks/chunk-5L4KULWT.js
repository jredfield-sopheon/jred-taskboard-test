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
  Splitter
} from "./chunk-PKK32ALQ.js";
import {
  SummaryFormatter_default
} from "./chunk-JZO6LOO7.js";
import {
  Column,
  ColumnStore,
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  ResizeHelper
} from "./chunk-6ZLMCHE5.js";
import {
  ArrayHelper,
  AsyncHelper,
  Base,
  BrowserHelper,
  DateHelper,
  DomHelper,
  EventHelper,
  InstancePlugin,
  Menu,
  ObjectHelper,
  Rectangle,
  __privateAdd,
  __privateGet,
  __privateSet,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/column/ColorColumn.js
var ColorColumn = class extends Column {
  construct() {
    var _a;
    super.construct(...arguments);
    const me = this, { grid } = me;
    me.menu = new Menu({
      owner: grid,
      rootElement: grid.rootElement,
      autoShow: false,
      align: "t50-b50",
      anchor: true,
      internalListeners: {
        hide() {
          me.picker.navigator.activeItem = null;
          delete me._editingRecord;
        }
      },
      items: [
        Object.assign({
          type: me.colorEditorType,
          ref: "list",
          addNoColorItem: me.addNoColorItem,
          colorSelected({ color }) {
            var _a2;
            (_a2 = me._editingRecord) == null ? void 0 : _a2.set(me.field, color);
            me.menu.hide();
          }
        }, ((_a = me.colors) == null ? void 0 : _a.length) ? { colors: me.colors } : {})
      ]
    });
  }
  applyValue(useProp, field, value) {
    if (!this.isConstructing) {
      const { picker } = this;
      if (field === "colors") {
        picker.colors = value;
      } else if (field === "addNoColorItem") {
        picker.addNoColorItem = value;
      }
    }
    super.applyValue(...arguments);
  }
  get picker() {
    return this.menu.widgetMap.list;
  }
  renderer({ value }) {
    let colorClass = "b-empty", backgroundColor = value;
    if (value) {
      const colorClassName = this.picker.getColorClassName(value);
      if (colorClassName) {
        colorClass = colorClassName;
        backgroundColor = null;
      } else {
        colorClass = "";
      }
    }
    return {
      className: "b-color-cell-inner " + colorClass,
      style: {
        backgroundColor
      },
      "data-btip": value
    };
  }
  onCellClick({ grid, record, target }) {
    if (target.classList.contains("b-color-cell-inner") && !this.readOnly && !grid.readOnly && !record.isSpecialRow && !record.readOnly) {
      const { picker, menu } = this, value = record.get(this.field);
      this._editingRecord = record;
      picker.deselectAll();
      picker.select(value);
      picker.refresh();
      menu.showBy(target);
    }
  }
};
__publicField(ColorColumn, "$name", "ColorColumn");
__publicField(ColorColumn, "type", "color");
__publicField(ColorColumn, "fields", [
  { name: "colorEditorType", defaultValue: "colorpicker" },
  /**
   * Array of CSS color strings to be able to chose from. This will override the
   * {@link Core.widget.ColorPicker#config-colors pickers default colors}.
   *
   * Provide an array of string CSS colors:
   * ```javascript
   * new Grid({
   *    columns : [
   *       {
   *          type   : 'color',
   *          field  : 'color',
   *          text   : 'Color',
   *          colors : ['#00FFFF', '#F0FFFF', '#89CFF0', '#0000FF', '#7393B3']
   *       }
   *    ]
   * });
   * ```
   * @prp {String[]}
   */
  "colors",
  /**
   * Adds an option in the picker to set no background color
   * @prp {Boolean}
   * @default true
   */
  { name: "addNoColorItem", defaultValue: true }
]);
__publicField(ColorColumn, "defaults", {
  align: "center",
  editor: null
});
ColumnStore.registerColumnType(ColorColumn);
ColorColumn._$name = "ColorColumn";

// ../Grid/lib/Grid/feature/GroupSummary.js
var GroupSummary = class extends SummaryFormatter_default(InstancePlugin) {
  //region Init
  static get $name() {
    return "GroupSummary";
  }
  static get configurable() {
    return {
      /**
       * Set to `true` to have group summaries rendered in the group header when a group is collapsed.
       *
       * Only applies when {@link #config-target} is `'footer'` (the default).
       *
       * @member {Boolean} collapseToHeader
       */
      /**
       * Configure as `true` to have group summaries rendered in the group header when a group is collapsed.
       *
       * ```javascript
       * const grid = new Grid({
       *    features : {
       *        groupSummary : {
       *            collapseToHeader : true
       *        }
       *    }
       * });
       * ```
       *
       * Only applies when {@link #config-target} is `'footer'` (the default).
       *
       * @config {Boolean}
       */
      collapseToHeader: null,
      /**
       * Where to render the group summaries to, either `header` to display them in the group header or `footer`
       * to display them in the group footer (the default).
       *
       * @member {'header'|'footer'} target
       */
      /**
       * Where to render the group summaries to, either `header` to display them in the group header or `footer`
       * to display them in the group footer (the default).
       *
       * ```javascript
       * const grid = new Grid({
       *    features : {
       *        groupSummary : {
       *            target : 'header'
       *        }
       *    }
       * });
       * ```
       *
       * @config {'header'|'footer'}
       * @default
       */
      target: "footer"
    };
  }
  construct(grid, config) {
    this.grid = grid;
    super.construct(grid, config);
    if (!grid.features.group) {
      throw new Error("Requires Group feature to work, please enable");
    }
    this.bindStore(grid.store);
    grid.rowManager.ion({
      beforeRenderRow: "onBeforeRenderRow",
      renderCell: "renderCell",
      // The feature gets to see cells being rendered after the Group feature
      // because the Group feature injects header content into group header rows
      // and adds rendering info to the cells renderData which we must comply with.
      // In particular, it calculates the isFirstColumn flag which it adds to
      // the cell renderData which we interrogate.
      prio: 1e3,
      thisObj: this
    });
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      update: "onStoreUpdate",
      // need to run before grids listener, to flag for full refresh
      prio: 1,
      thisObj: this
    });
  }
  get store() {
    return this.grid.store;
  }
  doDisable(disable) {
    this.updateTarget(this.target);
    super.doDisable(disable);
  }
  changeTarget(target) {
    ObjectHelper.assertString(target, "target");
    return target;
  }
  updateTarget(target) {
    this.store.useGroupFooters = !this.disabled && target === "footer";
    if (!this.isConfiguring) {
      this.store.group();
    }
  }
  changeCollapseToHeader(collapseToHeader) {
    ObjectHelper.assertBoolean(collapseToHeader, "collapseToHeader");
    return collapseToHeader;
  }
  updateCollapseToHeader() {
    if (!this.isConfiguring) {
      this.store.group();
    }
  }
  //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["bindStore"]
    };
  }
  //endregion
  //region Render
  /**
   * Called before rendering row contents, used to reset rows no longer used as group summary rows
   * @private
   */
  onBeforeRenderRow({ row, record }) {
    if (row.isGroupFooter && !("groupFooterFor" in record.meta)) {
      row.isGroupFooter = false;
      row.forceInnerHTML = true;
    } else if (row.isGroupHeader && !record.meta.collapsed) {
      row.eachElement(this.removeSummaryElements);
    }
  }
  removeSummaryElements(rowEl) {
  }
  /**
   * Called when a cell is rendered, styles the group rows first cell.
   * @private
   */
  renderCell({ column, cellElement, row, record, size, isFirstColumn }) {
    const me = this, { meta } = record, { rowHeight } = me.grid, isGroupHeader = "groupRowFor" in meta, isGroupFooter = "groupFooterFor" in meta, targetsHeader = me.target === "header", rowClasses = {
      "b-group-footer": 0,
      "b-header-summary": 0
    }, isSummaryTarget = (
      // Header cell should have summary content if we are targeting the header or if the group is collapsed
      // and we are configured with collapseToHeader, excluding the first column which holds the group title
      isGroupHeader && (targetsHeader || me.collapseToHeader && meta.collapsed) && !isFirstColumn || // Footer cell should have summary content if we are targeting the footer (won't render if collapsed)
      isGroupFooter && !targetsHeader
    );
    if (isGroupHeader || isGroupFooter) {
      size.height = isGroupHeader ? size.height || rowHeight : rowHeight;
    }
    if (me.store.isGrouped && isSummaryTarget && !me.disabled) {
      column.clearCell(cellElement);
      const groupRecord = isGroupHeader ? record : meta.groupRecord;
      row.isGroupFooter = isGroupFooter;
      row.isGroupHeader = isGroupHeader;
      if (isGroupFooter) {
        rowClasses["b-group-footer"] = 1;
      } else {
        rowClasses["b-header-summary"] = 1;
      }
      const heightSetting = me.updateSummaryHtml(cellElement, column, groupRecord), count = typeof heightSetting === "number" ? heightSetting : heightSetting.count;
      if (count > 1) {
        size.height += meta.collapsed && !targetsHeader ? 0 : count * rowHeight * 0.1;
      }
      if (heightSetting.height) {
        size.height += heightSetting.height;
      }
    }
    row.assignCls(rowClasses);
  }
  updateSummaryHtml(cellElement, column, groupRecord) {
    const records = groupRecord.groupChildren.slice();
    if (records[records.length - 1].isGroupFooter) {
      records.pop();
    }
    const html = this.generateHtml(column, records, "b-grid-group-summary", groupRecord, groupRecord.meta.groupField, groupRecord.meta.groupRowFor);
    if (!cellElement.children.length) {
      cellElement.innerHTML = html;
    } else {
      DomHelper.sync(html, cellElement.firstElementChild);
    }
    return column.summaries ? column.summaries.length : column.sum ? 1 : 0;
  }
  //endregion
  //region Events
  /**
   * Updates summaries on store changes (except record update, handled below)
   * @private
   */
  onStoreUpdate({ source: store, changes }) {
    if (!this.disabled && store.isGrouped) {
      if (changes && store.groupers.find((grouper) => grouper.field in changes)) {
        return;
      }
      const shouldUpdate = Object.keys(changes).some((field) => {
        const colField = this.grid.columns.get(field);
        return Boolean(colField) && (Boolean(colField.sum) || Boolean(colField.summaries));
      });
      if (shouldUpdate) {
        this.grid.forceFullRefresh = true;
      }
    }
  }
  //endregion
  /**
   * Refreshes the summaries
   */
  refresh() {
    this.grid.columns.visibleColumns.forEach((column) => {
      if (this.hasSummary(column)) {
        this.grid.refreshColumn(column);
      }
    });
  }
  hasSummary(column) {
    return column.sum || column.summaries;
  }
};
GroupSummary.featureClass = "b-group-summary";
GroupSummary._$name = "GroupSummary";
GridFeatureManager.registerFeature(GroupSummary);

// ../Grid/lib/Grid/feature/RowResize.js
var RowResize = class extends InstancePlugin {
  //region Init
  construct(grid, config) {
    const me = this;
    super.construct(...arguments);
    me.resizer = new ResizeHelper({
      name: "rowResize",
      targetSelector: ".b-grid-row:not(.b-group-header)",
      handleContainerSelector: ".b-grid-row",
      outerElement: grid.element,
      direction: "vertical",
      dragThreshold: 1,
      handleSize: Math.min(5, grid.rowHeight * 0.1),
      internalListeners: {
        beforeresizestart: me.onBeforeResizeStart,
        resizestart: me.onResizeStart,
        resizing: me.onResizing,
        resize: me.onResize,
        cancel: me.onCancel,
        thisObj: me
      },
      allowResize(target, event) {
        var _a;
        return (_a = grid.hoveredCell) == null ? void 0 : _a.matches(me.cellSelector);
      },
      overTopHandle(event, target) {
        if (this.canResize(target, event) && target.dataset.index !== "0") {
          const topHandle = Rectangle.from(target);
          topHandle.height = this.handleSize;
          return topHandle.height > 0 && Math.abs(topHandle.top - EventHelper.getPagePoint(event).top) < this.handleSize;
        }
        return false;
      },
      internalBeforeStart(context) {
        const { edge, element } = context;
        if (edge === "top") {
          return {
            edge: "bottom",
            element: element.previousElementSibling
          };
        }
      },
      // Prevent selection as a result of mousedown on virtual handle
      onResizeHandlePointerDown(event) {
        grid.selectionDisabled = true;
        if (grid.features.rowReorder) {
          me._oldReorderDisabled = grid.features.rowReorder.disabled;
          grid.features.rowReorder.disabled = true;
        }
        grid.setTimeout(() => {
          grid.selectionDisabled = false;
        }, 10);
      }
    });
  }
  doDestroy() {
    var _a;
    (_a = this.resizer) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  //endregion
  //region Events
  onBeforeResizeStart() {
    return !this.disabled;
  }
  onResizeStart({ source, context }) {
    const { client } = this, applyGlobally = this.applyToAllRows || client.fixedRowHeight;
    context.record = client.store.getById(context.element.dataset.id);
    context.oldHeight = context.record.rowHeight;
    client.store.suspendAutoCommit();
    Object.assign(source, {
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
      // Only update live element if applying to all rows
      skipUpdatingElement: !applyGlobally
    });
    client.element.classList.add("b-row-resizing");
  }
  onResizing({ context }) {
    if (!this.applyToAllRows && !this.client.fixedRowHeight && context.valid) {
      context.record.rowHeight = context.newHeight;
    }
  }
  onResize({ context }) {
    const { client } = this;
    if (this.applyToAllRows || client.fixedRowHeight) {
      client.rowHeight = context.newHeight;
    } else if (client.selectionMode.multiSelect && client.selectedRecords.includes(context.record)) {
      client.selectedRecords.forEach((record) => record.rowHeight = context.newHeight);
    }
    this.cleanup();
  }
  /**
   * Restore row size on cancel (ESC)
   * @private
   */
  onCancel({ context }) {
    if (!this.applyToAllRows && !this.client.fixedRowHeight) {
      context.record.rowHeight = context.oldHeight;
    }
    this.cleanup();
  }
  //endregion
  cleanup() {
    const { client } = this;
    client.element.classList.remove("b-row-resizing");
    client.store.resumeAutoCommit();
    if (typeof this._oldReorderDisabled === "boolean") {
      client.features.rowReorder.disabled = this._oldReorderDisabled;
    }
  }
};
__publicField(RowResize, "$name", "RowResize");
__publicField(RowResize, "configurable", {
  /**
   * Set this to true to modify the global {@link Grid/view/Grid#config-rowHeight} which affects all grid rows.
   * @prp {Boolean}
   * @default false
   */
  applyToAllRows: null,
  /**
   * Set this to a CSS selector to only trigger row resizing in cells for a specific column.
   * @config {String}
   * @default
   */
  cellSelector: ".b-grid-cell",
  /**
   * Minimum height when resizing
   * @prp {Number}
   * @default
   */
  minHeight: 20,
  /**
   * Max height when resizing
   * @prp {Number}
   */
  maxHeight: 0
});
RowResize._$name = "RowResize";
GridFeatureManager.registerFeature(RowResize, false);

// ../Grid/lib/Grid/feature/Split.js
var startScrollOptions = Object.freeze({
  animate: false,
  block: "start"
});
var endScrollOptions = Object.freeze({
  animate: false,
  block: "end"
});
var splitterWidth = 7;
var ignoreListeners = {
  split: 1,
  unsplit: 1
};
var _ignoreColumnChanges;
var Split = class extends InstancePlugin {
  constructor() {
    super(...arguments);
    // Flag used to ignore column changes that arise from syncing columns
    __privateAdd(this, _ignoreColumnChanges, false);
    __publicField(this, "restorers", []);
  }
  doDestroy() {
    this.unsplit(true);
    super.doDestroy();
  }
  doDisable(disable) {
    const me = this;
    if (!me.isConfiguring) {
      if (disable) {
        me._disabledSplitOptions = me._splitOptions;
        me.unsplit();
      } else if (me._disabledSplitOptions) {
        me.split(me._disabledSplitOptions);
        me._disabledSplitOptions = null;
      }
    }
  }
  //region Split / unsplit
  get isSplit() {
    var _a;
    return Boolean((_a = this.widgets) == null ? void 0 : _a.length);
  }
  getClientConfig(appendTo, order, options, config = {}) {
    const { client } = this, { subGrids, regions } = client, columns = client.columns.records.slice(), subGridConfigs = ObjectHelper.assign({}, client.subGridConfigs);
    client.eachSubGrid((subGrid) => {
      const config2 = subGridConfigs[subGrid.region];
      if (subGrid.flex) {
        config2.flex = subGrid.flex;
      } else {
        config2.width = subGrid.element.style.width;
      }
    });
    if (options.atColumn && regions.length > 1 && order > 0) {
      const subGridIndex = regions.indexOf(options.atColumn.region);
      for (let i = 0; i < subGridIndex; i++) {
        const subGrid = subGrids[regions[i]];
        ArrayHelper.remove(columns, ...subGrid.columns.records);
        delete subGridConfigs[regions[i]];
      }
    }
    const clientConfig = ObjectHelper.assign({}, client.initialConfig, {
      appendTo,
      insertFirst: null,
      insertBefore: null,
      splitFrom: client,
      owner: client.owner,
      // Use no toolbar or fake empty toolbar for things to line up nicely
      tbar: client.initialConfig.tbar && order === 1 ? {
        height: client.tbar.height,
        items: [" "]
      } : null,
      // Share store & selection
      store: client.store,
      selectedRecordCollection: client.selectedRecordCollection,
      subGridConfigs,
      // Cannot directly share columns, since there is a 1-1 mapping between column and it's header
      columns: this.cloneColumns(columns),
      minHeight: 0,
      minWidth: 0
    }, config);
    for (const prop of ObjectHelper.keys(this.relayProperties)) {
      clientConfig[prop] = client[prop];
    }
    const appListeners = {};
    for (const name in client.listeners) {
      if (!ignoreListeners[name]) {
        const listeners = client.listeners[name].filter((l) => !l.$internal);
        if (listeners.length) {
          appListeners[name] = listeners;
        }
      }
    }
    clientConfig.listeners = appListeners;
    if (options.direction === "horizontal") {
      clientConfig.hideHeaders = true;
    } else if (options.direction === "both" && order !== 1) {
      clientConfig.hideHeaders = true;
    }
    delete clientConfig.data;
    delete clientConfig.adopt;
    return clientConfig;
  }
  cloneColumns(source) {
    return source.flatMap((col) => {
      if (col.meta.isSelectionColumn || col.field === "expanderActionColumn") {
        return [];
      }
      const data = { ...col.data };
      if (col.children) {
        data.children = col.children.map((child) => ({ ...child.data }));
      }
      delete data.headerRenderer;
      delete data.parentId;
      return data;
    });
  }
  cloneClient(appendTo, order, options, config) {
    const clientConfig = this.getClientConfig(appendTo, order, options, config), clone = new this.client.constructor(clientConfig);
    clone.element.classList.add("b-split-clone");
    return clone;
  }
  // Process options, deducing direction, atRecord, etc.
  processOptions(options) {
    var _a;
    const { client } = this, { atRecord, atColumn, direction } = options;
    if (!direction) {
      if (atRecord && atColumn) {
        options.direction = "both";
      } else if (atColumn) {
        options.direction = "vertical";
      } else {
        options.direction = "horizontal";
      }
    } else {
      if (direction !== "vertical" && !atRecord && client.store.count) {
        const centerY = client._bodyRectangle.height / 2 + client.scrollable.y, centerRow = (_a = client.rowManager.getRowAt(centerY, true)) != null ? _a : client.rowManager.rows[Math.ceil(client.rowManager.rows.length / 2)];
        options.atRecord = client.store.getById(centerRow.id);
      }
      if (direction !== "horizontal" && !atColumn) {
        const bounds = Rectangle.from(client.element);
        let centerX = bounds.center.x - bounds.x, subGrid = client.subGrids[client.regions[0]], i = 0, column = null;
        while (centerX > subGrid.width) {
          centerX -= subGrid.width;
          subGrid = client.subGrids[client.regions[++i]];
        }
        centerX += subGrid.scrollable.x;
        const { visibleColumns } = subGrid.columns;
        let x = 0, j = 0;
        while (x < centerX && j < visibleColumns.length) {
          column = visibleColumns[j++];
          x += column.element.offsetWidth;
        }
        options.atColumn = column;
      }
    }
    return options;
  }
  // Create element to contain the splits, it "both" mode it will hold a top container and a bottom container.
  // In single mode, it will hold the splits + splitters directly.
  createSplitContainer({ direction }) {
    const { client } = this, { element } = client;
    return this.splitContainer = DomHelper.createElement({
      parent: element.parentElement,
      className: {
        "b-split-container": 1,
        [`b-split-${direction}`]: 1,
        "b-rtl": client.rtl
      },
      style: {
        width: element.style.width,
        height: element.style.height
      },
      children: [
        // Split in one dir, use original as first child
        direction !== "both" && element,
        // Split in both directions, make two sub-containers and put original in first
        direction === "both" && {
          className: "b-split-top",
          children: [
            element
          ]
        },
        direction === "both" && {
          className: "b-split-bottom"
        }
      ]
    });
  }
  // Make the headers of all splits same height. Since headers shrinkwrap, they might differ depending on which
  // subgrids was cloned to each split
  syncHeaderHeights() {
    let maxHeaderHeight = 0;
    for (const split of this.subViews) {
      split.eachSubGrid((subGrid) => {
        if (subGrid.header.height > maxHeaderHeight) {
          maxHeaderHeight = subGrid.header.height;
        }
      });
    }
    for (const split of this.subViews) {
      split.eachSubGrid((subGrid) => {
        subGrid.header.height = maxHeaderHeight;
      });
    }
  }
  // Clones can be created with correct subgrids, in the original we might instead need to hide some when splitting
  // in a region that is not the last one (locked for example)
  toggleOriginalSubGrids(options) {
    const me = this, { client } = me, { regions } = client;
    if (options.atColumn && regions.length > 1) {
      const subGridIndex = regions.indexOf(options.atColumn.region), splits = [client];
      if (options.direction === "both") {
        splits.push(me.subViews[2]);
      }
      for (const split of splits) {
        if (subGridIndex + 1 < regions.length) {
          const isOriginal = split === client;
          const subGrid = split.subGrids[regions[subGridIndex]];
          subGrid.hideSplitter();
          isOriginal && me.restorers.push(() => subGrid.showSplitter());
          if (!subGrid.flex) {
            client.inForEachOther = true;
            subGrid.flex = 1;
            client.inForEachOther = false;
            isOriginal && me.restorers.push(() => {
              subGrid.flex = null;
              subGrid.width = subGrid._initialWidth;
            });
          }
          for (let i = subGridIndex + 1; i < regions.length; i++) {
            const subGrid2 = split.subGrids[regions[i]];
            subGrid2.hide();
            isOriginal && me.restorers.push(() => {
              subGrid2.show();
            });
          }
          if (regions.length === 2) {
            split._initialWidth = split.element.style.width;
            split._initialFlex = split.flex;
            split.width = subGrid._initialWidth;
            isOriginal && me.restorers.push(() => {
              if (split._initialFlex !== null) {
                split.flex = split._initialFlex;
              } else if (split._initialWidth !== null) {
                split.width = split._initialWidth;
              }
            });
          }
        }
      }
    }
  }
  /**
   * Split the grid into two or four parts.
   *
   * - Splits into two when passed `direction : 'vertical'`, `direction : 'horizontal'` or `atColumn` or `atRecord`.
   * - Splits into four when passed `direction : 'both'` or `atColumn` and `atRecord`.
   *
   * ```javascript
   * // Split horizontally (at the row in the center of the grid)
   * await grid.split({ direction : 'horizontal' });
   *
   * // Split both ways by a specific column and record
   * await grid.split({
   *    atRecord : grid.store.getById(10),
   *    atColumn : grid.columns.get('city')
   * });
   * ```
   *
   * To return to a single grid, call {@link #function-unsplit}.
   *
   * Note that this function is callable directly on the grid instance.
   *
   * @param {Object} [options] Split options
   * @param {'vertical'|'horizontal'|'both'} [options.direction] Split direction, 'vertical', 'horizontal' or 'both'.
   * Not needed when passing `atColumn` or `atRecord`.
   * @param {Grid.column.Column} [options.atColumn] Column to split at
   * @param {Core.data.Model} [options.atRecord] Record to split at
   * @returns {Promise} Resolves when split is complete, and subviews are scrolled to the correct position.
   * @async
   * @on-owner
   * @category Common
   */
  async split(options = {}) {
    const me = this, { client } = me;
    if (client.splitFrom) {
      return;
    }
    if (me.isSplit) {
      await me.unsplit(true);
    }
    const { rtl } = client, { atRecord, atColumn, direction } = me.processOptions(options);
    let { splitX, remainingWidth } = options, splitY = null, remainingHeight = null;
    if (atRecord) {
      await client.scrollRowIntoView(atRecord);
      const row = client.getRowFor(atRecord);
      if (!row) {
        throw new Error(`Could not find row for record ${atRecord.id}`);
      }
      splitY = Rectangle.from(row.cells[0], client.element).bottom;
      remainingHeight = Rectangle.from(client.element).height - splitY;
    }
    if (atColumn && !splitX) {
      splitX = Rectangle.from(atColumn.element, client.element).getEnd(rtl);
      remainingWidth = Rectangle.from(client.element).width - splitX - DomHelper.scrollBarWidth;
      if (rtl) {
        const x = splitX;
        splitX = remainingWidth + DomHelper.scrollBarWidth;
        remainingWidth = x - DomHelper.scrollBarWidth;
      }
    }
    const scrollPromises = [], splitContainer = me.createSplitContainer(options), { visibleColumns } = client.columns, nextColumn = atColumn ? visibleColumns[visibleColumns.indexOf(atColumn) + 1] : null, nextRecord = atRecord ? client.store.getNext(atRecord) : null;
    client.eachSubGrid((subGrid) => subGrid._initialWidth = subGrid.width);
    client.columns.commit();
    if (direction !== "both") {
      const cloneConfig = {
        flex: `0 0 ${(splitY != null ? remainingHeight : remainingWidth) - splitterWidth}px`,
        height: null
      };
      const [, clone] = me.widgets = [
        new Splitter({ appendTo: splitContainer }),
        me.cloneClient(splitContainer, direction === "vertical" ? 1 : 0, options, cloneConfig)
      ];
      if (splitX != null) {
        client.renderRows();
        if (!options.atDate) {
          scrollPromises.push(client.scrollColumnIntoView(atColumn, endScrollOptions));
          nextColumn && scrollPromises.push(clone.scrollColumnIntoView(nextColumn, startScrollOptions));
        }
      }
      if (splitY != null) {
        scrollPromises.push(clone.scrollRowIntoView(nextRecord, startScrollOptions));
      }
      client.element.classList.add("b-split-start");
      clone.element.classList.add("b-split-end");
      client.scrollable.addPartner(clone.scrollable, {
        x: direction === "horizontal",
        y: direction !== "horizontal"
      });
    } else {
      const rightConfig = {
        flex: `0 0 ${remainingWidth - splitterWidth}px`
      };
      splitContainer.lastElementChild.style.flex = `0 0 ${remainingHeight - splitterWidth}px`;
      me.widgets = [
        new Splitter({ insertBefore: splitContainer.lastElementChild }),
        // Full horizontal
        me.topSplitter = new Splitter({ appendTo: splitContainer.firstElementChild }),
        // Top vertical
        me.cloneClient(splitContainer.firstElementChild, 1, options, rightConfig),
        // Top right
        me.cloneClient(splitContainer.lastElementChild, 0, options),
        // Bottom left
        me.bottomSplitter = new Splitter({ appendTo: splitContainer.lastElementChild }),
        // Bottom vertical
        me.cloneClient(splitContainer.lastElementChild, 2, options, rightConfig)
        // Bottom right
      ];
      const topLeft = client, topRight = me.widgets[2], bottomLeft = me.widgets[3], bottomRight = me.widgets[5];
      topLeft.element.classList.add("b-split-top-start");
      topRight.element.classList.add("b-split-top-end");
      bottomLeft.element.classList.add("b-split-bottom-start");
      bottomRight.element.classList.add("b-split-bottom-end");
      if (splitX != null) {
        topLeft.renderRows();
        bottomLeft.renderRows();
        if (atColumn && !options.atDate) {
          scrollPromises.push(client.scrollColumnIntoView(atColumn, endScrollOptions));
          nextColumn && scrollPromises.push(topRight.scrollColumnIntoView(nextColumn, startScrollOptions));
        }
      }
      if (splitY != null) {
        scrollPromises.push(
          bottomLeft.scrollRowIntoView(nextRecord, startScrollOptions),
          bottomRight.scrollRowIntoView(nextRecord, startScrollOptions)
        );
      }
      topLeft.scrollable.addPartner(topRight.scrollable, "y");
      topLeft.scrollable.addPartner(bottomLeft.scrollable, "x");
      topRight.scrollable.addPartner(bottomRight.scrollable, "x");
      bottomLeft.scrollable.addPartner(bottomRight.scrollable, "y");
      me.topSplitter.ion({
        splitterMouseDown: "onSplitterMouseDown",
        drag: "onSplitterDrag",
        drop: "onSplitterDrop",
        thisObj: me
      });
      me.bottomSplitter.ion({
        splitterMouseDown: "onSplitterMouseDown",
        drag: "onSplitterDrag",
        drop: "onSplitterDrop",
        thisObj: me
      });
    }
    me.subViews = [client, ...me.widgets.filter((w) => w.isGridBase)];
    me.toggleOriginalSubGrids(options);
    me.syncHeaderHeights();
    me._splitOptions = options;
    await Promise.all(scrollPromises);
    const bounds = Rectangle.from(client.element);
    client.onInternalResize(client.element, bounds.width, bounds.height);
    client.eachSubGrid((subGrid) => {
      const subGridBounds = Rectangle.from(subGrid.element);
      subGrid.onInternalResize(subGrid.element, subGridBounds.width, subGridBounds.height);
    });
    client.scrollable.x += 0.5;
    client.scrollable.y += 0.5;
    me.startSyncingColumns();
    client.trigger("split", { subViews: me.subViews, options });
    return me.subViews;
  }
  /**
   * Remove splits, returning to a single grid.
   *
   * Note that this function is callable directly on the grid instance.
   *
   * @on-owner
   * @async
   * @category Common
   */
  async unsplit(silent = false) {
    var _a;
    const me = this, { client } = me, { element } = client;
    if (me.isSplit) {
      me.stopSyncingColumns();
      (_a = me.widgets) == null ? void 0 : _a.forEach((split) => split.destroy());
      me.widgets = null;
      client.eachSubGrid((subGrid) => subGrid.scrollable.x);
      client.scrollable.y;
      me.splitContainer.parentElement.appendChild(element);
      me.splitContainer.remove();
      me.splitContainer = null;
      element.style.flexBasis = element.style.flexGrow = "";
      element.classList.remove("b-split-top-start", "b-split-start");
      me.subViews.length = 0;
      if (!me.isDestroying) {
        client.renderRows();
        me.unsplitCleanup();
        for (const restorer of me.restorers) {
          restorer();
        }
        me.restorers.length = 0;
        await AsyncHelper.animationFrame();
        await AsyncHelper.animationFrame();
        if (me.isDestroyed) {
          return;
        }
        !silent && client.trigger("unsplit");
        me._splitOptions = null;
      }
    }
  }
  unsplitCleanup() {
  }
  //endregion
  //region Context menu
  populateCellMenu({ record, column, items }) {
    const me = this, { isSplit } = me, { splitFrom } = me.client;
    if (!me.disabled) {
      items.splitGrid = {
        text: "L{split}",
        localeClass: me,
        icon: "b-icon b-icon-split-vertical",
        weight: 500,
        separator: true,
        hidden: isSplit || splitFrom,
        menu: {
          splitHorizontally: {
            text: "L{horizontally}",
            icon: "b-icon b-icon-split-horizontal",
            localeClass: me,
            weight: 100,
            onItem() {
              me.split({ atRecord: record });
            }
          },
          splitVertically: {
            text: "L{vertically}",
            icon: "b-icon b-icon-split-vertical",
            localeClass: me,
            weight: 200,
            onItem() {
              me.split({ atColumn: column });
            }
          },
          splitBoth: {
            text: "L{both}",
            icon: "b-icon b-icon-split-both",
            localeClass: me,
            weight: 300,
            onItem() {
              me.split({ atColumn: column, atRecord: record });
            }
          }
        }
      };
      items.unsplitGrid = {
        text: "L{unsplit}",
        localeClass: me,
        icon: "b-icon b-icon-clear",
        hidden: !(isSplit || splitFrom),
        weight: 400,
        separator: true,
        onItem() {
          (splitFrom || me).unsplit();
        }
      };
    }
  }
  //endregion
  //region Syncing columns
  startSyncingColumns() {
    for (const subView of this.subViews) {
      subView.columns.ion({
        name: "columns",
        change: "onColumnsChange",
        thisObj: this
      });
    }
  }
  stopSyncingColumns() {
    this.detachListeners("columns");
  }
  onColumnsChange({
    source,
    isMove,
    action,
    /*index, */
    parent,
    records,
    changes
  }) {
    var _a, _b;
    const me = this;
    if (!__privateGet(me, _ignoreColumnChanges)) {
      __privateSet(me, _ignoreColumnChanges, true);
      for (const clone of me.subViews) {
        const { columns } = clone;
        if (source !== columns) {
          if (action === "update" && changes.region && Object.keys(changes).length === 1) {
            if (!columns.getById(records[0].id)) {
              const [column] = records, targetParent = (_a = columns.getById(me.$before.parent.id)) != null ? _a : columns.rootNode, targetBefore = me.$before.id !== null && columns.getById(me.$before.id);
              targetParent.insertChild(column.data, targetBefore);
            } else {
              columns.remove(records[0].id);
            }
            me.$before = null;
          } else if (!(isMove == null ? void 0 : isMove[records[0].id]) && isMove !== true) {
            if (action === "add") {
              const relevantColumns = records.filter((column) => clone.getSubGridFromColumn(column));
              columns.add(me.cloneColumns(relevantColumns));
            } else {
              columns.applyChangesFromStore(source);
            }
          } else if (action === "add") {
            const sourceColumn = records[0], sourceBefore = sourceColumn.nextSibling, targetColumn = columns.getById(sourceColumn.id);
            if (!targetColumn) {
              me.$before = {
                id: sourceBefore == null ? void 0 : sourceBefore.id,
                parent
              };
              __privateSet(me, _ignoreColumnChanges, false);
              continue;
            }
            if (sourceColumn.meta.isSelectionColumn) {
              __privateSet(me, _ignoreColumnChanges, false);
              continue;
            }
            const targetParent = (_b = columns.getById(parent.id)) != null ? _b : columns.rootNode, targetBefore = sourceBefore && columns.getById(sourceBefore.id);
            targetParent.insertChild(targetColumn, targetBefore);
          }
          columns.commit();
        }
      }
      source.commit();
      __privateSet(me, _ignoreColumnChanges, false);
    }
  }
  //endregion
  //region Syncing splitters
  getOtherSplitter(splitter) {
    return splitter === this.topSplitter ? this.bottomSplitter : this.topSplitter;
  }
  onSplitterMouseDown({ source, event }) {
    if (!event.handled) {
      event.handled = true;
      this.getOtherSplitter(source).onMouseDown(event);
    }
  }
  onSplitterDrag({ source, event }) {
    if (!event.handled) {
      event.handled = true;
      this.getOtherSplitter(source).onMouseMove(event);
    }
  }
  onSplitterDrop({ source, event }) {
    if (!event.handled) {
      event.handled = true;
      this.getOtherSplitter(source).onMouseUp(event);
    }
  }
  //endregion
  //region Relaying property changes & events
  // Relay relevant config changes to other splits
  afterConfigChange({ name, value }) {
    if (this.isSplit && this.relayProperties[name]) {
      this.syncSplits((split) => {
        split[name] = value;
      });
    }
  }
  // Sync listeners added at runtime to other splits
  afterAddListener(eventName, listener) {
    if (this.isSplit && !listener.$internal && !ignoreListeners[eventName]) {
      this.syncSplits((split) => split.on(eventName, listener));
    }
  }
  afterRemoveListener(eventName, listener) {
    if (!listener.$internal) {
      this.syncSplits((split) => split.un(eventName, listener));
    }
  }
  //endregion
  //region Util
  // Call a fn for all splits except the on this fn is called on
  forEachOther(fn) {
    const original = this.client.splitFrom || this.client;
    if (original.features.split.enabled && !original.inForEachOther) {
      original.inForEachOther = true;
      for (const view of original.subViews) {
        if (view !== this.client) {
          fn(view);
        }
      }
      original.inForEachOther = false;
    }
  }
  syncSplits(fn) {
    this.forEachOther(fn);
  }
  //endregion
};
_ignoreColumnChanges = new WeakMap();
__publicField(Split, "$name", "Split");
__publicField(Split, "featureClass", "");
__publicField(Split, "configurable", {
  /**
   * An array of sub-views. The first sub-view is the original grid, and the others are clones of the original.
   * See the "Accessing a sub-view" section above for more information.
   *
   * ```javascript
   * await grid.split('vertical');
   * const bottom = grid.subViews[1];
   * await bottom.scrollRowIntoView(100);
   * ```
   *
   * Note that this property is accessible directly on the grid instance.
   *
   * @member {Grid.view.Grid[]} subViews
   * @on-owner
   * @readonly
   * @category Common
   */
  subViews: [],
  // Not a config, but still defined in configurable to allow assigning it in pluginConfig,
  /**
   * Properties whose changes should be relayed to sub-views at runtime.
   *
   * Supply an object with property names as keys, and a truthy value to relay the change, or a falsy value to not
   * relay it. The object will be merged with the default values.
   *
   * By default, these properties are relayed:
   * * {@link Grid/view/Grid#property-readOnly}
   * * {@link Grid/view/Grid#property-rowHeight}
   *
   * Example of supplying a custom set of properties to relay:
   * ```javascript
   * const grid = new Grid({
   *     features : {
   *         split : {
   *             relayProperties : {
   *                 readOnly : false, // Do not relay readOnly changes
   *                 myConfig : true   // Relay changes to the myConfig property
   *             }
   *         }
   *     }
   * }
   * ```
   * @config {Object<String,Boolean>}
   */
  relayProperties: {
    value: {
      readOnly: 1,
      rowHeight: 1
    },
    $config: {
      merge: "merge"
    }
  }
});
__publicField(Split, "pluginConfig", {
  chain: ["populateCellMenu", "afterConfigChange", "afterAddListener", "afterRemoveListener"],
  assign: ["split", "unsplit", "subViews", "syncSplits"]
});
Split._$name = "Split";
GridFeatureManager.registerFeature(Split, false);

// ../Grid/lib/Grid/util/TableExporter.js
var TableExporter = class extends Base {
  static get defaultConfig() {
    return {
      /**
       * Target grid instance to export data from
       * @config {Grid.view.Grid} target
       */
      target: null,
      /**
       * Specifies a default column width if no width specified
       * @config {Number} defaultColumnWidth
       * @default
       */
      defaultColumnWidth: 100,
      /**
       * Set to `false` to export dates as they are displayed by Date column formatter
       * @config {Boolean}
       * @default
       */
      exportDateAsInstance: true,
      /**
       * If true and the grid is grouped, shows the grouped value in the first column. True by default.
       * @config {Boolean} showGroupHeader
       * @default
       */
      showGroupHeader: true,
      /**
       * An array of column configuration objects used to specify column widths, header text, and data fields to get the data from.
       * 'field' config is required. If 'text' is missing, it will read it from the grid column or the 'field' config.
       * If 'width' is missing, it will try to get it retrieved from the grid column or {@link #config-defaultColumnWidth} config.
       * If no columns provided the config will be generated from the grid columns.
       *
       * For example:
       * ```javascript
       * columns : [
       *     'firstName', // field
       *     'age', // field
       *     { text : 'Starts', field : 'start', width : 140 },
       *     { text : 'Ends', field : 'finish', width : 140 }
       * ]
       * ```
       *
       * @config {String[]|Object[]} columns
       * @default
       */
      columns: null,
      /**
       * When true and tree is being exported, node names are indented with {@link #config-indentationSymbol}
       * @config {Boolean}
       * @default
       */
      indent: true,
      /**
       * This symbol (four spaces by default) is used to indent node names when {@link #config-indent} is true
       * @config {String}
       * @default
       */
      indentationSymbol: "\xA0\xA0\xA0\xA0"
    };
  }
  /**
   * Exports grid data according to provided config
   * @param {Object} config
   * @returns {{ rows : Object[][], columns : Object[] }}
   */
  export(config = {}) {
    const me = this;
    config = ObjectHelper.assign({}, me.config, config);
    me.normalizeColumns(config);
    return me.generateExportData(config);
  }
  generateExportData(config) {
    const me = this, columns = me.generateColumns(config), rows = me.generateRows(config);
    return { rows, columns };
  }
  normalizeColumns(config) {
    const columns = config.columns || this.target.columns.visibleColumns.filter((rec) => rec.exportable !== false);
    config.columns = columns.map((col) => {
      if (typeof col === "string") {
        return this.target.columns.find((column) => column.field === col) || { field: col };
      } else {
        return col;
      }
    });
  }
  generateColumns(config) {
    return config.columns.map((col) => this.processColumn(col, config));
  }
  generateRows(config) {
    const { columns, rows } = config;
    if (columns.length === 0 || (rows == null ? void 0 : rows.length) === 0) {
      return [];
    }
    const me = this, { target } = me;
    return (rows || target.store).map((record) => me.processRecord(record, columns, config)).filter((cells) => cells == null ? void 0 : cells.length);
  }
  getColumnType(column, store = this.target.store) {
    let result = column.exportedType || "object";
    if (column.exportedType === void 0) {
      if (column.field) {
        const fieldDefinition = store.modelClass.getFieldDefinition(column.field);
        if (fieldDefinition && fieldDefinition.type !== "auto") {
          result = fieldDefinition.type;
        }
      }
    }
    return result;
  }
  /**
   * Extracts export data from the column instance
   * @param {Grid.column.Column} column
   * @param {Object} config
   * @private
   * @returns {Object}
   */
  processColumn(column, config) {
    const me = this, { target } = me, { defaultColumnWidth } = config;
    let { field, text: value, width, minWidth } = column;
    if (!(field in target.store.modelClass.fieldMap)) {
      field = "";
    }
    if (!value || !width) {
      const gridColumn = target.columns.find((col) => col.field === field);
      if (!value) {
        value = gridColumn && gridColumn.text || field;
      }
      if (width == null) {
        width = gridColumn && gridColumn.width || defaultColumnWidth;
      }
    }
    width = Math.max(width || defaultColumnWidth, minWidth || defaultColumnWidth);
    return { field, value, width, type: me.getColumnType(column) };
  }
  /**
   * Extracts export data from the record instance reading supplied column configs
   * @param {Core.data.Model|null} record If null is passed, all columns will be filled with empty strings
   * @param {Grid.column.Column[]} columns
   * @param {Object} config
   * @private
   * @returns {Object[]}
   */
  processRecord(record, columns, config) {
    const { target } = this, {
      showGroupHeader,
      indent,
      indentationSymbol
    } = config;
    let cells;
    if (!record) {
      cells = columns.map(() => "");
    } else if (record.isSpecialRow) {
      if (showGroupHeader && record.meta.groupRowFor) {
        cells = columns.map((column) => {
          return target.features.group.buildGroupHeader({
            // Create dummy element to get html from
            cellElement: DomHelper.createElement(),
            grid: target,
            record,
            column
          });
        });
      }
    } else {
      cells = columns.map((column) => {
        let value = record.getValue(column.field);
        const useRenderer = column.renderer || column.defaultRenderer;
        if (useRenderer && !(value && column.isDateColumn && config.exportDateAsInstance)) {
          value = useRenderer.call(column, {
            value,
            record,
            column,
            grid: target,
            isExport: true
          });
        }
        if (indent && column.tree) {
          value = `${indentationSymbol.repeat(record.childLevel)}${value}`;
        }
        return value;
      });
    }
    return cells;
  }
};
TableExporter._$name = "TableExporter";

// ../Grid/lib/Grid/util/BooleanUnicodeSymbol.js
var BooleanUnicodeSymbol = class {
  constructor(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
  toString() {
    return Boolean(this.value) ? "\u2713" : "";
  }
};
BooleanUnicodeSymbol._$name = "BooleanUnicodeSymbol";

// ../Grid/lib/Grid/feature/experimental/ExcelExporter.js
var ExcelExporter = class extends InstancePlugin {
  static get $name() {
    return "ExcelExporter";
  }
  static get defaultConfig() {
    return {
      /**
       * Name of the exported file
       * @config {String} filename
       * @default
       */
      filename: null,
      /**
       * Defines how dates in a cell will be formatted
       * @config {String} dateFormat
       * @default
       */
      dateFormat: "YYYY-MM-DD",
      /**
       * Exporter class to use as a data provider. {@link Grid.util.TableExporter} by default.
       * @config {Grid.util.TableExporter}
       * @typings {typeof TableExporter}
       * @default
       */
      exporterClass: TableExporter,
      /**
       * Configuration object for {@link #config-exporterClass exporter class}.
       * @config {Object}
       */
      exporterConfig: null,
      /**
       * Reference to zipcelx library. If not provided, exporter will look in the global scope.
       * @config {Object}
       */
      zipcelx: null,
      /**
       * If this config is true, exporter will convert all empty values to ''. Empty values are:
       * * undefined, null, NaN
       * * Objects/class instances that do not have toString method defined and are stringified to [object Object]
       * * functions
       * @config {Boolean}
       */
      convertEmptyValueToEmptyString: true
    };
  }
  processValue(value) {
    if (value === void 0 || value === null || Number.isNaN(value) || typeof value === "function" || typeof value === "object" && String(value) === "[object Object]") {
      return "";
    } else {
      return value;
    }
  }
  generateExportData(config) {
    const me = this, { rows, columns } = me.exporter.export(config.exporterConfig);
    return {
      rows: rows.map((row) => {
        return row.map((value, index) => {
          var _a;
          if (value instanceof Date) {
            value = DateHelper.format(value, config.dateFormat);
          } else if (typeof value === "boolean") {
            value = new BooleanUnicodeSymbol(value);
          }
          if (me.convertEmptyValueToEmptyString) {
            value = me.processValue(value);
          }
          const type = ((_a = columns[index]) == null ? void 0 : _a.type) === "number" ? "number" : "string";
          return { value, type };
        });
      }),
      columns: columns.map((col) => {
        let { field, value, width, type } = col;
        type = "string";
        return { field, value, width, type };
      })
    };
  }
  /**
   * Generate and download an Excel (.xslx), or CSV file (.csv).
   * @param {Object} config Optional configuration object, which overrides initial settings of the feature/exporter.
   * @param {String} [config.filename] Name of the exported file
   * @param {String} [config.dateFormat] Defines how dates in a cell will be formatted
   * @param {Boolean|Object} [config.csv] Set to true to output as a CSV file, or as an object where you can specify
   * delimiters.
   * @param {String} [config.csv.columnDelimiter] The CSV delimiter to separate values on one line, defaults to `,`.
   * @param {String} [config.csv.lineDelimiter] The CSV delimiter to separate lines, defaults to `\n`.
   * @param {String[]|Object[]} [config.columns] An array of column configuration objects
   * @param {Core.data.Model[]} [config.rows] An array of records to export
   * @returns {Promise} Promise that resolves when the export is completed
   */
  export(config = {}) {
    const me = this, zipcelx2 = me.zipcelx || globalThis.zipcelx;
    if (!zipcelx2) {
      throw new Error('ExcelExporter: "zipcelx" library is required');
    }
    if (me.disabled) {
      return;
    }
    config = ObjectHelper.assign({}, me.config, config);
    if (!config.filename) {
      config.filename = me.client.$$name;
    }
    const { filename } = config, { rows, columns } = me.generateExportData(config);
    if (config.csv) {
      const columnDelimiter = config.csv.columnDelimiter || ",", lineDelimiter = config.csv.lineDelimiter || "\n", headers = columns.map((col) => this.processCsvValue(col.value)).join(columnDelimiter) + lineDelimiter, text = rows.map((rowValues) => rowValues.map((obj) => this.processCsvValue(obj.value)).join(`${columnDelimiter}`)).join(lineDelimiter), blob = new Blob([headers + text], { type: "text/csv" });
      BrowserHelper.downloadBlob(blob, filename);
      return Promise.resolve();
    }
    return zipcelx2({
      filename,
      sheet: {
        data: [columns].concat(rows),
        cols: columns
      }
    });
  }
  processCsvValue(text = "") {
    return `"${String(text).replace(/"/g, '""')}"`;
  }
  construct(grid, config) {
    super.construct(grid, config);
    if (!this.zipcelx) {
      if (typeof zipcelx !== "undefined") {
        this.zipcelx = globalThis.zipcelx;
      }
    }
  }
  get exporter() {
    const me = this;
    return me._exporter || (me._exporter = me.exporterClass.new({ target: me.client }, me.exporterConfig));
  }
};
ExcelExporter._$name = "ExcelExporter";
GridFeatureManager.registerFeature(ExcelExporter, false, "Grid");

export {
  ColorColumn,
  GroupSummary,
  RowResize,
  Split,
  TableExporter,
  ExcelExporter
};
//# sourceMappingURL=chunk-5L4KULWT.js.map
