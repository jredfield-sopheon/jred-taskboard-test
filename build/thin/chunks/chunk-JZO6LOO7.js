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
  DragHelper
} from "./chunk-6ZLMCHE5.js";
import {
  Base,
  Delayable_default,
  DomHelper,
  InstancePlugin,
  Rectangle,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/feature/RowReorder.js
var RowReorder = class extends Delayable_default(InstancePlugin) {
  static get deprecatedEvents() {
    return {
      gridRowBeforeDragStart: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowBeforeDragStart` event is deprecated, listen on this event on the Grid instead."
      },
      gridRowDragStart: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowDragStart` event is deprecated, listen on this event on the Grid instead."
      },
      gridRowDrag: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowDrag` event is deprecated, listen on this event on the Grid instead."
      },
      gridRowBeforeDropFinalize: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowBeforeDropFinalize` event is deprecated, listen on this event on the Grid instead."
      },
      gridRowDrop: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowDrop` event is deprecated, listen on this event on the Grid instead."
      },
      gridRowAbort: {
        product: "Grid",
        invalidAsOfVersion: "6.0.0",
        message: "`gridRowAbort` event is deprecated, listen on this event on the Grid instead."
      }
    };
  }
  construct(grid, config) {
    this.grid = grid;
    super.construct(...arguments);
  }
  doDestroy() {
    var _a;
    (_a = this.dragHelper) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  /**
   * Initialize drag & drop (called on first paint)
   * @private
   */
  init() {
    const me = this, { grid } = me;
    me.dragHelper = DragHelper.new({
      name: "rowReorder",
      cloneTarget: true,
      dragThreshold: 10,
      proxyTopOffset: 10,
      targetSelector: ".b-grid-row",
      lockX: true,
      dragWithin: grid.bodyContainer,
      allowDropOutside: true,
      scrollManager: grid.scrollManager,
      outerElement: me.targetSubGridElement,
      touchStartDelay: me.touchStartDelay,
      isElementDraggable: me.isElementDraggable.bind(me),
      monitoringConfig: {
        scrollables: [
          {
            element: grid.scrollable.element,
            direction: "vertical"
          }
        ]
      },
      setXY(element, x, y) {
        const { context } = this;
        if (!context.started) {
          const elementRect = Rectangle.from(context.element, this.dragWithin), pointerDownOffset = context.startPageY - globalThis.pageYOffset - context.element.getBoundingClientRect().top;
          y = elementRect.top + pointerDownOffset + this.proxyTopOffset;
        }
        DomHelper.setTranslateXY(element, x, y);
      },
      // Since parent nodes can expand after hovering, meaning original drag start position now refers to a different point in the tree
      ignoreSamePositionDrop: false,
      createProxy(element) {
        const clone = element.cloneNode(true), container = document.createElement("div");
        container.classList.add("b-row-reorder-proxy");
        clone.removeAttribute("id");
        clone.style.transform = "";
        clone.style.width = "";
        container.appendChild(clone);
        if (grid.selectedRecords.length > 1) {
          const clone2 = clone.cloneNode(true);
          clone2.classList.add("b-row-dragging-multiple");
          container.appendChild(clone2);
        }
        DomHelper.removeClsGlobally(container, "b-selected", "b-hover", "b-focused");
        return container;
      },
      internalListeners: {
        beforedragstart: "onBeforeDragStart",
        dragstart: "onDragStart",
        drag: "onDrag",
        drop: "onDrop",
        abort: "onAbort",
        reset: "onReset",
        prio: 1e4,
        // To ensure our listener is run before the relayed listeners (for the outside world)
        thisObj: me
      }
    }, me.dragHelperConfig);
    me.relayEvents(me.dragHelper, ["beforeDragStart", "dragStart", "drag", "abort"], "gridRow");
    grid.relayEvents(me.dragHelper, ["beforeDragStart", "dragStart", "drag", "abort"], "gridRow");
    me.dropIndicator = DomHelper.createElement({
      className: "b-row-drop-indicator"
    });
    me.dropOverTargetCls = ["b-row-reordering-target", "b-hover"];
  }
  get targetSubGridElement() {
    const targetSubGrid = this.grid.regions[0];
    return this.grid.subGrids[targetSubGrid].element;
  }
  //endregion
  //region Events (drop)
  isElementDraggable(el, event) {
    if (!el.closest(".b-grid-cell .b-widget")) {
      if (this.gripOnly) {
        const firstCell = el.closest(".b-grid-cell:first-child");
        if (firstCell) {
          const gripperStyle = getComputedStyle(firstCell, ":before"), offsetX = this.grid.rtl ? firstCell.getBoundingClientRect().width - event.borderOffsetX : event.borderOffsetX, onGrip = offsetX <= parseFloat(gripperStyle.width);
          if (onGrip) {
            this.client.preventDragSelect = true;
          }
          return onGrip;
        }
      } else {
        return true;
      }
    }
  }
  onBeforeDragStart({ event, source, context }) {
    const me = this, { grid } = me, { group } = grid.features, subGridEl = me.targetSubGridElement;
    if (event.target.classList.contains("b-rowexpander-shadowroot-container") || me.disabled || grid.readOnly || grid.isTreeGrouped || !subGridEl.contains(context.element)) {
      return false;
    }
    const startRecord = context.startRecord = grid.getRecordFromElement(context.element);
    if ((group == null ? void 0 : group.enabled) && Array.isArray(startRecord[grid.features.group.field])) {
      return false;
    }
    if (startRecord.readOnly || startRecord.isSpecialRow) {
      return false;
    }
    context.originalRowTop = grid.rowManager.getRowFor(startRecord).top;
    if (!grid.selectionMode.checkboxOnly) {
      if (source.startEvent.pointerType === "touch") {
        if (!grid.isSelected(startRecord)) {
          grid.selectRow({
            record: startRecord,
            addToSelection: false
          });
        }
      } else if (!grid.isSelected(startRecord) && !event.shiftKey && !event.ctrlKey) {
        grid.selectRow({
          record: startRecord
        });
      }
    }
    const selectedRecords = grid.selectedRecords.filter((r) => !r.readOnly);
    context.records = [startRecord];
    if (selectedRecords.includes(startRecord)) {
      context.records.push(...selectedRecords.filter((r) => r !== startRecord));
      context.records.sort((r1, r2) => grid.store.indexOf(r1) - grid.store.indexOf(r2));
    }
    return true;
  }
  onDragStart({ context }) {
    var _a, _b;
    const me = this, { grid } = me, { cellEdit, cellMenu, headerMenu } = grid.features;
    if (cellEdit) {
      me.cellEditDisabledState = cellEdit.disabled;
      cellEdit.disabled = true;
    }
    (_a = cellMenu == null ? void 0 : cellMenu.hideContextMenu) == null ? void 0 : _a.call(cellMenu, false);
    (_b = headerMenu == null ? void 0 : headerMenu.hideContextMenu) == null ? void 0 : _b.call(headerMenu, false);
    grid.element.classList.add("b-row-reordering");
    const focusedCell = context.element.querySelector(".b-focused");
    focusedCell == null ? void 0 : focusedCell.classList.remove("b-focused");
    context.element.firstElementChild.classList.remove("b-selected", "b-hover");
    grid.bodyContainer.appendChild(me.dropIndicator);
  }
  onDrag({ context, event }) {
    var _a;
    const me = this, { grid } = me, { store, rowManager } = grid, { clientY } = event;
    let valid = true, row = rowManager.getRowAt(clientY), overRecord, dataIndex, after, over, insertBefore;
    if (row) {
      const rowTop = row.top + grid.scrollable.element.getBoundingClientRect().top - grid.scrollable.y, quarter = row.height / 4, topQuarter = rowTop + quarter, middleY = rowTop + row.height / 2, bottomQuarter = rowTop + quarter * 3;
      dataIndex = row.dataIndex;
      overRecord = store.getAt(dataIndex);
      if (store.tree) {
        over = (overRecord.isParent || me.dropOnLeaf) && clientY > topQuarter && clientY < bottomQuarter;
      } else if (store.isGrouped) {
        over = overRecord.isGroupHeader && overRecord.meta.collapsed;
      }
      after = !over && event.clientY >= middleY;
    } else {
      if (event.pageY < grid._bodyRectangle.y) {
        dataIndex = 0;
        overRecord = store.first;
        after = false;
      } else {
        dataIndex = store.count - 1;
        overRecord = store.last;
        after = true;
      }
      row = grid.rowManager.getRow(dataIndex);
    }
    if (overRecord === me.overRecord && me.after === after && me.over === over) {
      context.valid = me.reorderValid;
      return;
    }
    if (me.overRecord !== overRecord) {
      (_a = rowManager.getRowById(me.overRecord)) == null ? void 0 : _a.removeCls(me.dropOverTargetCls);
    }
    me.overRecord = overRecord;
    me.after = after;
    me.over = over;
    if (
      // Hovering the dragged record. This is a no-op.
      // But still gather the contextual data.
      overRecord === context.startRecord || // Not allowed to drop above topmost group header or below a collapsed header
      !after && !over && dataIndex === 0 && store.isGrouped || // Not allowed to drop after last collapsed group
      after && overRecord.isGroupHeader && overRecord.meta.collapsed && store.indexOf(overRecord) === store.count - 1
    ) {
      valid = false;
    }
    if (store.tree) {
      insertBefore = after ? overRecord.nextSibling : overRecord;
      if (context.records.some((rec) => rec.contains(overRecord))) {
        valid = false;
      }
      context.parent = valid && over ? overRecord : overRecord.parent;
      me.clearTimeout(me.hoverTimer);
      if (overRecord && overRecord.isParent && !overRecord.isExpanded(store)) {
        me.hoverTimer = me.setTimeout(() => grid.expand(overRecord), me.hoverExpandTimeout);
      }
    } else {
      insertBefore = after ? store.getAt(dataIndex + 1) : overRecord;
    }
    row.toggleCls(me.dropOverTargetCls, valid && over);
    if (!over && dataIndex === store.indexOf(context.startRecord) + (after ? -1 : 1) && context.parent && context.startRecord.parent === context.parent) {
      valid = false;
    }
    row && DomHelper.setTranslateY(me.dropIndicator, Math.max(row.top + (after ? row.element.getBoundingClientRect().height : 0), 1));
    me.dropIndicator.style.visibility = over ? "hidden" : "visible";
    me.dropIndicator.classList.toggle("b-drag-invalid", !valid);
    context.insertBefore = insertBefore;
    context.valid = me.reorderValid = valid;
  }
  /**
   * Handle drop
   * @private
   */
  async onDrop(event) {
    const me = this, { client } = me, { context } = event;
    context.valid = context.valid && me.reorderValid;
    if (context.valid) {
      context.async = true;
      if (client.store.tree) {
        context.oldPositionContext = context.records.map((record) => {
          var _a;
          return {
            record,
            parentId: (_a = record.parent) == null ? void 0 : _a.id,
            parentIndex: record.parentIndex
          };
        });
      }
      let result = await me.trigger("gridRowBeforeDropFinalize", event);
      if (result === false) {
        context.valid = false;
      }
      result = await client.trigger("gridRowBeforeDropFinalize", event);
      if (result === false) {
        context.valid = false;
      }
      await me.dragHelper.animateProxyTo(me.dropIndicator, { align: "l0-l0" });
      await me.finalizeReorder(context);
    }
    me.clearTimeout(me.hoverTimer);
    me.overRecord = me.after = me.over = null;
    me.trigger("gridRowDrop", event);
    client.trigger("gridRowDrop", event);
  }
  onAbort(event) {
    this.client.trigger("gridRowDragAbort", event);
  }
  async finalizeReorder(context) {
    var _a, _b;
    const me = this, { grid } = me, { store, focusedCell } = grid;
    let { records } = context;
    context.valid = context.valid && !records.some((rec) => !store.includes(rec));
    if (context.valid) {
      let result;
      if (store.tree) {
        records = records.filter((record) => !record.parent || record.bubbleWhile((parent) => !records.includes(parent), true));
        result = await context.parent.tryInsertChild(records, me.over ? (_a = context.parent.children) == null ? void 0 : _a[0] : context.insertBefore);
        grid.rowManager.forEach((r) => r.removeCls(me.dropOverTargetCls));
        if (!context.parent.isExpanded() && ((_b = context.parent.children) == null ? void 0 : _b.length)) {
          grid.expand(context.parent);
        }
        context.valid = result !== false;
      } else if (store.isGrouped && me.over) {
        store.move(records, store.getAt(store.indexOf(context.insertBefore) + 1));
      } else {
        if (records.length > 1) {
          while (context.insertBefore && records.includes(context.insertBefore)) {
            context.insertBefore = store.getNext(context.insertBefore, false, true);
          }
        }
        store.move(records, context.insertBefore);
      }
      if ((focusedCell == null ? void 0 : focusedCell._rowIndex) >= 0) {
        grid._focusedCell = null;
        grid.focusCell({
          grid,
          record: focusedCell.record,
          columnId: focusedCell.columnId
        });
      }
      store.clearSorters();
    }
    context.finalize(context.valid);
    grid.element.classList.remove("b-row-reordering");
  }
  /**
   * Clean up on reset
   * @private
   */
  onReset() {
    const me = this, { grid } = me, cellEdit = grid.features.cellEdit;
    grid.element.classList.remove("b-row-reordering");
    if (cellEdit) {
      cellEdit.disabled = me.cellEditDisabledState;
    }
    me.dropIndicator.remove();
    DomHelper.removeClsGlobally(
      grid.element,
      ...me.dropOverTargetCls
    );
  }
  //endregion
  //region Render
  onInternalPaint({ firstPaint }) {
    if (firstPaint) {
      this.init();
    }
  }
  //endregion
  updateShowGrip(show) {
    this.grid.element.classList.toggle("b-row-reorder-with-grip", show);
  }
  get isDragging() {
    return this.dragHelper.isDragging;
  }
};
//region Events
/**
 * Fired before dragging starts, return false to prevent the drag operation.
 * @preventable
 * @event gridRowBeforeDragStart
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {Core.data.Model[]} context.records The dragged row records
 * @param {MouseEvent|TouchEvent} event
 * @on-owner
 */
/**
 * Fired when dragging starts.
 * @event gridRowDragStart
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {Core.data.Model[]} context.records The dragged row records
 * @param {MouseEvent|TouchEvent} event
 * @on-owner
 */
/**
 * Fired while the row is being dragged, in the listener function you have access to `context.insertBefore` a grid /
 * tree record, and additionally `context.parent` (a TreeNode) for trees. You can signal that the drop position is
 * valid or invalid by setting `context.valid = false;`
 * @event gridRowDrag
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {Boolean} context.valid Set this to true or false to indicate whether the drop position is valid.
 * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
 * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
 * @param {Core.data.Model[]} context.records The dragged row records
 * @param {MouseEvent} event
 * @on-owner
 */
/**
 * Fired before the row drop operation is finalized. You can return false to abort the drop operation, or a
 * Promise yielding `true` / `false` which allows for asynchronous abort (e.g. first show user a confirmation dialog).
 * @event gridRowBeforeDropFinalize
 * @preventable
 * @async
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {Boolean} context.valid Set this to true or false to indicate whether the drop position is valid
 * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
 * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
 * @param {Core.data.Model[]} context.records The dragged row records
 * @param {RecordPositionContext[]} context.oldPositionContext An array of objects with information about the previous tree position.
 * Objects contain the `record`, and its original `parentIndex` and `parentId` values
 * @param {MouseEvent} event
 * @on-owner
 */
/**
 * Fired after the row drop operation has completed, regardless of validity
 * @event gridRowDrop
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {Boolean} context.valid true or false depending on whether the drop position was valid
 * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
 * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
 * @param {Core.data.Model} context.record [DEPRECATED] The dragged row record
 * @param {Core.data.Model[]} context.records The dragged row records
 * @param {RecordPositionContext[]} context.oldPositionContext An array of objects with information about the previous tree position.
 * Objects contain the record, and its original `parentIndex` and `parentId` values
 * @param {MouseEvent} event
 * @on-owner
 */
/**
 * Fired when a row drag operation is aborted
 * @event gridRowAbort
 * @param {Core.helper.DragHelper} source
 * @param {Object} context
 * @param {MouseEvent} event
 * @on-owner
 */
//endregion
//region Init
__publicField(RowReorder, "$name", "RowReorder");
__publicField(RowReorder, "configurable", {
  /**
   * Set to `true` to show a grip icon on the left side of each row.
   * @config {Boolean}
   */
  showGrip: null,
  /**
   * Set to `true` to only allow reordering by the {@link #config-showGrip} config
   * @config {Boolean}
   */
  gripOnly: null,
  /**
   * If hovering over a parent node for this period of a time in a tree, the node will expand
   * @config {Number}
   */
  hoverExpandTimeout: 1e3,
  /**
   * The amount of milliseconds to wait after a touchstart, before a drag gesture will be allowed to start.
   * @config {Number}
   * @default
   */
  touchStartDelay: 300,
  /**
   * Enables creation of parents by dragging a row and dropping it onto a leaf row. Only works in a Grid with
   * a tree store.
   * @config {Boolean}
   */
  dropOnLeaf: false,
  /**
   * An object used to configure the internal {@link Core.helper.DragHelper} class
   * @config {DragHelperConfig}
   */
  dragHelperConfig: null
});
//endregion
//region Plugin config
__publicField(RowReorder, "pluginConfig", {
  after: ["onInternalPaint"]
});
RowReorder.featureClass = "";
RowReorder._$name = "RowReorder";
GridFeatureManager.registerFeature(RowReorder, false);

// ../Grid/lib/Grid/feature/mixin/SummaryFormatter.js
var SummaryFormatter_default = (Target) => class SummaryFormatter extends (Target || Base) {
  static get $name() {
    return "SummaryFormatter";
  }
  /**
   * Calculates sums and returns as a html table
   * @param {Grid.column.Column} column Column to calculate sum for
   * @param {Core.data.Model[]} records Records to include in calculation
   * @param {String} cls CSS class to apply to summary table
   * @param {Core.data.Model} groupRecord current group row record
   * @param {String} groupField Current groups field name
   * @param {String} groupValue Current groups value
   * @returns {String} html content
   */
  generateHtml(column, records, cls, groupRecord, groupField, groupValue) {
    const store = this.store, summaries = column.summaries || (column.sum ? [{ sum: column.sum, renderer: column.summaryRenderer }] : []);
    let html = `<div class="b-summary-wrap ${cls}">`;
    summaries.forEach((config) => {
      let type = config.sum, sum = null;
      if (type === true)
        type = "sum";
      switch (type) {
        case "sum":
        case "add":
          sum = store.sum(column.field, records);
          break;
        case "max":
          sum = store.max(column.field, records);
          break;
        case "min":
          sum = store.min(column.field, records);
          break;
        case "average":
        case "avg":
          sum = store.average(column.field, records);
          break;
        case "count":
          sum = records.length;
          break;
        case "countNotEmpty":
          sum = records.reduce((sum2, record) => {
            const value = record.getValue(column.field);
            return sum2 + (value != null ? 1 : 0);
          }, 0);
          break;
      }
      if (typeof type === "function") {
        sum = records.reduce(type, "seed" in config ? config.seed : 0);
      }
      if (sum !== null) {
        const valueCls = "b-grid-summary-value", labelHtml = config.label ? `<div class="b-grid-summary-label">${config.label}</div>` : "";
        let valueHtml = config.renderer ? config.renderer({ config, sum }) : sum, summaryHtml;
        if (valueHtml == null) {
          valueHtml = "";
        }
        if (!String(valueHtml).includes("<div>")) {
          summaryHtml = labelHtml ? `${labelHtml}<div class="${valueCls}">${valueHtml}</div>` : `<div class="${valueCls} b-nolabel">${valueHtml}</div>`;
        } else {
          summaryHtml = valueHtml;
        }
        html += summaryHtml;
      }
    });
    return `${html}</div>`;
  }
};

// ../Grid/lib/Grid/feature/Summary.js
var Summary = class extends SummaryFormatter_default(InstancePlugin) {
  //region Config
  static get configurable() {
    return {
      /**
       * Set to `true` to sum values of selected row records
       * @prp {Boolean}
       */
      selectedOnly: null,
      hideFooters: false
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["renderRows", "bindStore"]
    };
  }
  //endregion
  //region Init
  static get $name() {
    return "Summary";
  }
  construct(grid, config) {
    this.grid = grid;
    super.construct(grid, config);
    this.bindStore(grid.store);
    grid.hideFooters = this.hideFooters;
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      change: "onStoreChange",
      thisObj: this
    });
  }
  get store() {
    return this.grid.store;
  }
  doDestroy() {
    super.doDestroy();
  }
  doDisable(disable) {
    super.doDisable(disable);
    const { client } = this;
    if (disable) {
      client.element.classList.add("b-summary-disabled");
    } else {
      this.updateSummaries();
      client.element.classList.remove("b-summary-disabled");
      client.eachSubGrid((subGrid) => subGrid.scrollable.syncPartners());
    }
  }
  //endregion
  //region Render
  renderRows() {
    this.updateSummaries();
  }
  /**
   * Updates summaries. Summaries are displayed as tables in footer (styling left out to keep brief):
   * ```
   * <table>
   *     <tr><td colspan="2">0</td></tr> // { sum : 'min' } Only a calculation, span entire table
   *     <tr><td>Max</td><td>10</td></tr> // { sum : 'max', label: 'Max' } Label + calculation
   *     <tr><td>Max</td><td>10</td></tr> // { sum : 'sum', label: 'Max' } Label + calculation
   * </table>
   * ```
   * @private
   */
  updateSummaries() {
    const me = this, { grid, store } = me, cells = DomHelper.children(grid.element, ".b-grid-footer"), selectedOnly = me.selectedOnly && grid.selectedRecords.length > 0, records = (store.isFiltered ? store.storage.values : store.allRecords).filter((r) => !r.isSpecialRow && (!selectedOnly || grid.isSelected(r)));
    grid.columns.forEach((column) => {
      var _a;
      (_a = column.summaries) == null ? void 0 : _a.forEach((config) => {
        if ("seed" in config) {
          if (!("initialSeed" in config)) {
            config.initialSeed = config.seed;
          }
          if (["number", "string", "date"].includes(typeof config.initialSeed)) {
            config.seed = config.initialSeed;
          } else {
            config.seed = Object.assign({}, config.initialSeed);
          }
        }
      });
    });
    cells.forEach((cellElement) => {
      if (!cellElement.dataset.column) {
        return;
      }
      const column = grid.columns.get(cellElement.dataset.column), html = me.generateHtml(column, records, "b-grid-footer-summary");
      if (column.summaries ? column.summaries.length : column.sum ? 1 : 0) {
        if (!cellElement.children.length) {
          cellElement.innerHTML = html;
        } else {
          DomHelper.sync(html, cellElement.firstElementChild);
        }
      }
    });
  }
  //endregion
  //region Events
  /**
   * Updates summaries on store changes (except record update, handled below)
   * @private
   */
  onStoreChange({ action, changes }) {
    let shouldUpdate = true;
    if (this.disabled) {
      return;
    }
    if (action === "update") {
      shouldUpdate = Object.keys(changes).some((field) => {
        const colField = this.grid.columns.get(field);
        return Boolean(colField) && (Boolean(colField.sum) || Boolean(colField.summaries));
      });
    }
    if (shouldUpdate) {
      this.updateSummaries();
    }
  }
  //endregion
  updateSelectedOnly(value) {
    const me = this;
    me.detachListeners("selectionChange");
    if (value) {
      me.grid.ion({
        name: "selectionChange",
        selectionChange: me.refresh,
        thisObj: me
      });
    }
    me.refresh();
  }
  /**
   * Refreshes the summaries
   */
  refresh() {
    this.updateSummaries();
  }
};
Summary.featureClass = "b-summary";
Summary._$name = "Summary";
GridFeatureManager.registerFeature(Summary);

export {
  SummaryFormatter_default,
  RowReorder,
  Summary
};
//# sourceMappingURL=chunk-JZO6LOO7.js.map
