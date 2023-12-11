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
  CopyPasteBase,
  GridBase,
  GridFeatureManager,
  Location
} from "./chunk-GGOYEX2W.js";
import {
  Delayable_default,
  InstancePlugin,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/feature/ColumnAutoWidth.js
var storeListenerName = "store";
var ColumnAutoWidth = class extends Delayable_default(InstancePlugin) {
  //endregion
  //region Internals
  static get pluginConfig() {
    return {
      after: {
        bindStore: "bindStore",
        unbindStore: "unbindStore",
        renderRows: "syncAutoWidthColumns",
        onInternalResize: "onInternalResize"
      },
      assign: [
        "columnAutoWidthPending",
        "syncAutoWidthColumns"
      ]
    };
  }
  construct(config) {
    super.construct(config);
    const { store } = this.client;
    store && this.bindStore(store);
  }
  doDestroy() {
    this.unbindStore();
    super.doDestroy();
  }
  bindStore(store) {
    this.lastSync = null;
    store.ion({
      name: storeListenerName,
      [`change${this.client.asyncEventSuffix}`]: "onStoreChange",
      thisObj: this
    });
  }
  unbindStore() {
    this.detachListeners(storeListenerName);
  }
  get columnAutoWidthPending() {
    return this.lastSync === null || this.hasTimeout("syncAutoWidthColumns");
  }
  onStoreChange({ action }) {
    if (action !== "move") {
      const me = this, { cellEdit } = me.client.features;
      ++me.storeGeneration;
      if ((cellEdit == null ? void 0 : cellEdit.isEditing) && !cellEdit.editingStoppedByTapOutside) {
        me.syncAutoWidthColumns();
      } else if (!me.client.refreshSuspended) {
        me.setTimeout({ fn: "syncAutoWidthColumns", delay: me.delay, cancelOutstanding: true });
      } else {
        me.client.rowManager.once("renderDone", () => me.syncAutoWidthColumns());
      }
    }
  }
  // Handle scenario with Grid being inside DIV with display none, and no width. Sync column widths after being shown
  onInternalResize(element, newWidth, newHeight, oldWidth) {
    if (oldWidth === 0) {
      this.lastSync = null;
      this.syncAutoWidthColumns();
    }
  }
  syncAutoWidthColumns() {
    const me = this, {
      client,
      storeGeneration
    } = me;
    if (client.splitFrom) {
      return;
    }
    if (me.lastSync !== storeGeneration) {
      me.lastSync = storeGeneration;
      let autoWidth, resizingColumns;
      for (const column of client.columns.visibleColumns) {
        autoWidth = column.autoWidth;
        if (autoWidth) {
          if (autoWidth === true) {
            autoWidth = me.default;
          }
          client.resizingColumns = resizingColumns = true;
          column.resizeToFitContent(autoWidth);
        }
      }
      if (resizingColumns) {
        client.resizingColumns = false;
        client.afterColumnsResized();
      }
    }
    if (me.hasTimeout("syncAutoWidthColumns")) {
      me.clearTimeout("syncAutoWidthColumns");
    }
  }
  //endregion
};
__publicField(ColumnAutoWidth, "$name", "ColumnAutoWidth");
//region Config
__publicField(ColumnAutoWidth, "configurable", {
  /**
   * The default `autoWidth` option for columns with `autoWidth: true`. This can
   * be a single number for the minimum column width, or an array of two numbers
   * for the `[minWidth, maxWidth]`.
   * @config {Number|Number[]}
   */
  default: null,
  /**
   * The amount of time (in milliseconds) to delay after a store modification
   * before synchronizing `autoWidth` columns.
   * @config {Number}
   * @default
   */
  delay: 0
});
ColumnAutoWidth.prototype.storeGeneration = 0;
ColumnAutoWidth._$name = "ColumnAutoWidth";
GridFeatureManager.registerFeature(ColumnAutoWidth, true);

// ../Grid/lib/Grid/feature/RowCopyPaste.js
var actions = {
  cut: 1,
  copy: 1,
  paste: 1
};
var RowCopyPaste = class extends CopyPasteBase {
  constructor() {
    super(...arguments);
    // Used in events to separate events from different features from each other
    __publicField(this, "entityName", "row");
  }
  construct(grid, config) {
    super.construct(grid, config);
    grid.rowManager.ion({
      beforeRenderRow: "onBeforeRenderRow",
      thisObj: this
    });
    this.grid = grid;
  }
  onBeforeRenderRow({ row, record }) {
    var _a;
    row.cls["b-cut-row"] = this.isCut && ((_a = this.cutData) == null ? void 0 : _a.includes(record));
  }
  isActionAvailable({ actionName, event }) {
    var _a;
    const { grid } = this, { cellEdit } = grid.features, { target } = event;
    if (actions[actionName]) {
      return !this.disabled && globalThis.getSelection().toString().length === 0 && (!cellEdit || !cellEdit.isEditing) && (actionName === "copy" || !this.copyOnly) && // Do not allow cut or paste if copyOnly flag is set
      ((_a = grid.selectedRecords) == null ? void 0 : _a.length) > 0 && // No key action when no selected records
      (!target || Boolean(target.closest(".b-gridbase:not(.b-schedulerbase) .b-grid-subgrid,.b-grid-subgrid:not(.b-timeaxissubgrid)")));
    }
  }
  async copy() {
    await this.copyRows();
  }
  async cut() {
    await this.copyRows(true);
  }
  paste(referenceRecord) {
    return this.pasteRows((referenceRecord == null ? void 0 : referenceRecord.isModel) ? referenceRecord : null);
  }
  /**
   * Copy or cut rows to clipboard to paste later
   *
   * @fires beforeCopy
   * @fires copy
   * @param {Boolean} [isCut] Copies by default, pass `true` to cut
   * @category Common
   * @on-owner
   * @async
   */
  async copyRows(isCut = false) {
    const { client, entityName } = this, records = this.selectedRecords.filter((r) => !r.readOnly || !isCut);
    if (!records.length || client.readOnly) {
      return;
    }
    await this.writeToClipboard(records, isCut);
    client.trigger("copy", { records, isCut, entityName });
  }
  // Called from Clipboardable when cutData changes
  setIsCut(record, isCut) {
    var _a;
    (_a = this.grid.rowManager.getRowById(record)) == null ? void 0 : _a.toggleCls("b-cut-row", isCut);
    record.meta.isCut = isCut;
  }
  // Called from Clipboardable when cutData changes
  handleCutData({ source }) {
    var _a;
    if (source !== this && ((_a = this.cutData) == null ? void 0 : _a.length)) {
      this.grid.store.remove(this.cutData);
    }
  }
  /**
   * Called from Clipboardable after writing a non-string value to the clipboard
   * @param eventRecords
   * @returns {String}
   * @private
   */
  stringConverter(records) {
    const { rowManager } = this.grid, cells = records.flatMap((r) => {
      var _a;
      return (_a = rowManager.getRowById(r)) == null ? void 0 : _a.cells.map((c) => new Location(c));
    });
    return this.cellsToString(cells.filter((c) => c));
  }
  // Called from Clipboardable before writing to the clipboard
  async beforeCopy({ data, isCut }) {
    return await this.client.trigger("beforeCopy", { records: data, isCut, entityName: this.entityName });
  }
  /**
   * Paste rows below selected or passed record
   *
   * @fires beforePaste
   * @param {Core.data.Model} [record] Paste below this record, or currently selected record if left out
   * @category Common
   * @on-owner
   */
  async pasteRows(record) {
    var _a, _b, _c;
    const me = this, { client, isCut, entityName } = me, referenceRecord = record || client.selectedRecord;
    if (client.readOnly || client.isTreeGrouped) {
      return [];
    }
    const records = await me.readFromClipboard({ referenceRecord }, true), isOwn = me.clipboardData === records;
    if (!Array.isArray(records) || !(records == null ? void 0 : records.length) || client.store.tree && isCut && records.some((rec) => rec.contains(referenceRecord, true))) {
      return [];
    }
    me.sortByIndex(records);
    const idMap = {}, recordsToProcess = me.extractParents(records, idMap, isOwn);
    await me.insertCopiedRecords(recordsToProcess, referenceRecord);
    if (client.isDestroying) {
      return;
    }
    if (isCut) {
      await me.clearClipboard();
    } else {
      client.selectedRecords = recordsToProcess;
    }
    client.trigger("paste", {
      records: recordsToProcess,
      originalRecords: records,
      referenceRecord,
      isCut,
      entityName
    });
    me.clipboard.triggerPaste(me);
    (_c = (_b = (_a = client.getRowFor(recordsToProcess[recordsToProcess.length - 1])) == null ? void 0 : _a.cells) == null ? void 0 : _b[0]) == null ? void 0 : _c.focus();
    return recordsToProcess;
  }
  // Called from Clipboardable before finishing the internal clipboard read
  async beforePaste({ referenceRecord, data, text, isCut }) {
    const records = data !== text ? data : [];
    return await this.client.trigger("beforePaste", {
      records,
      referenceRecord,
      isCut,
      entityName: this.entityName,
      data
    });
  }
  /**
   * Called from Clipboardable after reading from clipboard, and it is determined that the clipboard data is
   * "external"
   * @param json
   * @private
   */
  stringParser(clipboardData) {
    return this.setFromStringData(clipboardData, true).modifiedRecords;
  }
  /**
   * A method used to generate the name for a copy-pasted record. By defaults appends "- 2", "- 3" as a suffix. Override
   * it to provide your own naming of pasted records.
   *
   * @param {Core.data.Model} record The new record being pasted
   * @returns {String}
   */
  generateNewName(record) {
    const originalName = record.getValue(this.nameField);
    let counter = 2;
    while (this.client.store.findRecord(this.nameField, `${originalName} - ${counter}`)) {
      counter++;
    }
    return `${originalName} - ${counter}`;
  }
  insertCopiedRecords(toInsert, recordReference) {
    const { store } = this.client, insertAt = store.indexOf(recordReference) + 1;
    if (store.tree) {
      return recordReference.parent.insertChild(toInsert, recordReference.nextSibling, false, {
        // Specify node to insert before in the ordered tree. It allows to paste to a
        // correct place both ordered and visual.
        // Covered by TaskOrderedWbs.t.js
        orderedBeforeNode: recordReference.nextOrderedSibling
      });
    } else {
      return store.insert(insertAt, toInsert);
    }
  }
  get selectedRecords() {
    const records = [...this.client.selectedRecords];
    this.client.selectedCells.forEach((cell) => {
      if (!records.includes(cell.record)) {
        records.push(cell.record);
      }
    });
    return records;
  }
  getMenuItemText(action, addRowSpecifier = false) {
    const me = this;
    let text = me[action + "RecordText"];
    if (addRowSpecifier) {
      text += ` (${me.selectedRecords.length > 1 ? me.rowSpecifierTextPlural : me.rowSpecifierText})`;
    }
    return text;
  }
  populateCellMenu({ record, items, cellSelector }) {
    var _a;
    const me = this, {
      client,
      rowOptionsOnCellContextMenu
    } = me, cellCopyPaste = ((_a = client.features.cellCopyPaste) == null ? void 0 : _a.enabled) === true, targetIsCell = cellCopyPaste && client.isCellSelected(cellSelector);
    if (!client.readOnly && !client.isTreeGrouped && (record == null ? void 0 : record.isSpecialRow) === false && (cellCopyPaste ? client.selectedRows.length : client.selectedRecords.length) && (!targetIsCell || me.rowOptionsOnCellContextMenu)) {
      if (!me.copyOnly) {
        items.cut = {
          text: me.getMenuItemText("cut", targetIsCell && rowOptionsOnCellContextMenu),
          localeClass: me,
          icon: "b-icon b-icon-cut",
          weight: 135,
          disabled: record.readOnly,
          onItem: () => me.cut()
        };
        items.paste = {
          text: me.getMenuItemText("paste", targetIsCell && rowOptionsOnCellContextMenu),
          localeClass: me,
          icon: "b-icon b-icon-paste",
          weight: 140,
          onItem: () => me.paste(record),
          disabled: me.hasClipboardData() === false
        };
      }
      items.copy = {
        text: me.getMenuItemText("copy", targetIsCell && rowOptionsOnCellContextMenu),
        localeClass: me,
        cls: "b-separator",
        icon: "b-icon b-icon-copy",
        weight: 120,
        onItem: () => me.copy()
      };
    }
  }
  /**
   * Sort array of records ASC by its indexes stored in indexPath
   * @param {Core.data.Model[]} array array to sort
   * @private
   */
  sortByIndex(array) {
    const { store } = this.client;
    return array.sort((rec1, rec2) => {
      const idx1 = rec1.indexPath, idx2 = rec2.indexPath;
      if (!array.includes(rec1.parent) && !array.includes(rec2.parent)) {
        return store.indexOf(rec1) - store.indexOf(rec2);
      }
      if (idx1.length === idx2.length) {
        for (let i = 0; i < idx1.length; i++) {
          if (idx1[i] < idx2[i]) {
            return -1;
          }
          if (idx1[i] > idx2[i]) {
            return 1;
          }
        }
        return 0;
      } else {
        return idx1.length - idx2.length;
      }
    });
  }
  /**
   * Iterates over passed pre-sorted list of records and reassembles hierarchy of records.
   * @param {Core.data.Model[]} taskRecords array of records to extract parents from
   * @param {Object} idMap Empty object which will contain map linking original id with copied record
   * @returns {Core.data.Model[]} Returns array of new top-level nodes with children filled
   * @private
   */
  extractParents(taskRecords, idMap, generateNames = true) {
    const me = this, { store } = me.client;
    if (store.tree) {
      taskRecords.forEach((node) => {
        node.traverse((n) => {
          const parents = n.getTopParent(true);
          if (!taskRecords.includes(n) && (!me.isCut || !taskRecords.some((rec) => parents.includes(rec)))) {
            taskRecords.push(n);
          }
        });
      });
    }
    const result = taskRecords.reduce((parents, node) => {
      let copy;
      const parentId = node.parentId || node.meta.modified;
      if (me.isCut) {
        copy = node;
        copy.meta.isCut = false;
      } else {
        copy = node.copy();
        if (generateNames) {
          copy[me.nameField] = me.generateNewName(copy);
        }
        copy.data.expanded = node.isExpanded(me.client.store);
      }
      idMap[node.id] = copy;
      if (node.parent === store.rootNode) {
        parents.push(copy);
      } else if (parentId in idMap) {
        idMap[parentId].appendChild(copy, true);
      } else {
        parents.push(copy);
      }
      return parents;
    }, []);
    result.forEach((parent) => {
      parent.sortOrderedChildren(true, true);
    });
    return result;
  }
};
__publicField(RowCopyPaste, "$name", "RowCopyPaste");
__publicField(RowCopyPaste, "type", "rowCopyPaste");
__publicField(RowCopyPaste, "pluginConfig", {
  assign: [
    "copyRows",
    "pasteRows"
  ],
  chain: [
    "populateCellMenu"
  ]
});
__publicField(RowCopyPaste, "configurable", {
  /**
   * The field to use as the name field when updating the name of copied records
   * @config {String}
   * @default
   */
  nameField: "name",
  keyMap: {
    // Weight to give CellCopyPaste priority
    "Ctrl+C": { weight: 10, handler: "copy" },
    "Ctrl+X": { weight: 10, handler: "cut" },
    "Ctrl+V": { weight: 10, handler: "paste" }
  },
  copyRecordText: "L{copyRecord}",
  cutRecordText: "L{cutRecord}",
  pasteRecordText: "L{pasteRecord}",
  rowSpecifierText: "L{row}",
  rowSpecifierTextPlural: "L{rows}",
  localizableProperties: [
    "copyRecordText",
    "cutRecordText",
    "pasteRecordText",
    "rowSpecifierText",
    "rowSpecifierTextPlural"
  ],
  /**
   * Adds `Cut (row)`, `Copy (row)` and `Paste (row)` options when opening a context menu on a selected cell when
   * {@link Grid.view.mixin.GridSelection#config-selectionMode cellSelection} and
   * {@link Grid.feature.CellCopyPaste} is active. Default behaviour will only provide row copy/paste actions on a
   * selected row.
   * @config {Boolean}
   * @default
   */
  rowOptionsOnCellContextMenu: false
});
RowCopyPaste.featureClass = "b-row-copypaste";
RowCopyPaste._$name = "RowCopyPaste";
GridFeatureManager.registerFeature(RowCopyPaste, true, "Grid");
GridFeatureManager.registerFeature(RowCopyPaste, false, "Gantt");
GridFeatureManager.registerFeature(RowCopyPaste, false, "SchedulerPro");
GridFeatureManager.registerFeature(RowCopyPaste, false, "ResourceHistogram");

// ../Grid/lib/Grid/view/Grid.js
var Grid = class extends GridBase {
  static get $name() {
    return "Grid";
  }
  // Factoryable type name
  static get type() {
    return "grid";
  }
};
Grid.initClass();
Grid._$name = "Grid";

export {
  ColumnAutoWidth,
  RowCopyPaste,
  Grid
};
//# sourceMappingURL=chunk-SL4DGZHQ.js.map
