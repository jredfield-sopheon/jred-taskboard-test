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
  Styleable_default
} from "./chunks/chunk-VCPKNRNI.js";
import {
  ProjectCombo
} from "./chunks/chunk-3VT4LA4Q.js";
import {
  UndoRedoBase
} from "./chunks/chunk-2SSW5IKU.js";
import "./chunks/chunk-JHLZS7IF.js";
import {
  Slider
} from "./chunks/chunk-CYP557IJ.js";
import {
  Featureable_default,
  FilterField,
  Responsive_default
} from "./chunks/chunk-XMY3DSSV.js";
import {
  AbstractCrudManager,
  AbstractCrudManagerMixin_default,
  AbstractCrudManagerValidation_default,
  AjaxTransport_default,
  AssignmentModel,
  AssignmentModelMixin_default,
  AssignmentStore,
  AssignmentStoreMixin_default,
  CrudManager,
  CrudManagerView_default,
  DependencyBaseModel,
  DependencyModel,
  DependencyStore,
  DependencyStoreMixin_default,
  EventModel,
  EventModelMixin_default,
  EventStore,
  EventStoreMixin_default,
  GetEventsMixin_default,
  JsonEncoder_default,
  PartOfProject_default,
  ProjectCrudManager_default,
  ProjectModel,
  ProjectModelCommon_default,
  ProjectModelMixin_default,
  ProjectModelTimeZoneMixin_default,
  RecurrenceModel,
  RecurringEventsMixin_default,
  RecurringTimeSpan_default,
  RecurringTimeSpansMixin_default,
  ResourceModel,
  ResourceModelMixin_default,
  ResourceStore,
  ResourceStoreMixin_default,
  ResourceTimeRangeModel,
  ResourceTimeRangeStore,
  TimeRangeModel,
  TimeRangeStore,
  TimeSpan,
  TimeZonedDatesMixin_default
} from "./chunks/chunk-KVD75ID2.js";
import {
  AvatarRendering,
  ColorField,
  Draggable_default,
  Droppable_default
} from "./chunks/chunk-4LHHPUQ6.js";
import {
  GridRowModel
} from "./chunks/chunk-4NB7OJYA.js";
import {
  ArrayHelper,
  AsyncHelper,
  Base,
  BrowserHelper,
  Button,
  ColorPicker,
  Combo,
  ContextMenuBase,
  DomHelper,
  DomSync,
  Editor,
  EventHelper,
  Events_default,
  Factoryable_default,
  Field,
  InstancePlugin,
  LocaleHelper,
  Model,
  ObjectHelper,
  Panel,
  Pluggable_default,
  Popup,
  Rectangle,
  ScrollManager,
  Scroller,
  State_default,
  Store,
  StringHelper,
  Tooltip,
  VersionHelper,
  Widget,
  __privateAdd,
  __privateGet,
  __privateSet,
  __publicField
} from "./chunks/chunk-MZVS5JQA.js";

// lib/TaskBoard/feature/TaskBoardFeature.js
var TaskBoardFeature = class extends InstancePlugin.mixin(Factoryable_default) {
  // This makes all feature config changes after initialization recompose TaskBoard
  onConfigChange(args) {
    if (!this.isConfiguring && !this.isDestroying) {
      this.client.recompose();
    }
    super.onConfigChange(args);
  }
};
__publicField(TaskBoardFeature, "factoryable", {});
__publicField(TaskBoardFeature, "configurable", {});
TaskBoardFeature._$name = "TaskBoardFeature";

// lib/TaskBoard/feature/ColumnDrag.js
var ColumnDrag = class extends TaskBoardFeature {
  initialCompose() {
    const me = this;
    me.draggable = ColumnZone.new({
      dragRootElement: me.disabled ? null : me.client.bodyWrapElement,
      dropRootElement: me.client.bodyWrapElement,
      owner: me,
      internalListeners: {
        beforeDragStart: "onBeforeDragStart",
        dragStart: "onDragStart",
        thisObj: me
      }
    }, me.draggable);
  }
  doDestroy() {
    var _a;
    (_a = this.draggable) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  doDisable(disable) {
    super.doDisable(disable);
    if (this.draggable) {
      this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
    }
  }
  movePrev(columnRecord) {
    const { columns } = this.client;
    columns.move(columnRecord, columns.getPrev(columnRecord));
  }
  moveNext(columnRecord) {
    const { columns } = this.client, beforeIndex = Math.min(columns.indexOf(columnRecord) + 2, columns.count);
    columns.move(columnRecord, columns.getAt(beforeIndex));
  }
  populateColumnHeaderMenu({ items, columnRecord }) {
    const { client } = this, { columns, rtl } = client;
    if (!client.readOnly && !this.disabled) {
      items.moveColumnLeft = {
        text: "L{TaskBoard.moveColumnLeft}",
        icon: "b-fw-icon b-icon-left",
        disabled: columnRecord === columns[rtl ? "last" : "first"],
        weight: 200,
        onItem: () => this["move" + (rtl ? "Next" : "Prev")](columnRecord)
      };
      items.moveColumnRight = {
        text: "L{TaskBoard.moveColumnRight}",
        icon: "b-fw-icon b-icon-right",
        disabled: columnRecord === columns[rtl ? "first" : "last"],
        weight: 300,
        onItem: () => this["move" + (rtl ? "Prev" : "Next")](columnRecord)
      };
    }
  }
  onBeforeDragStart({ drag, event }) {
    return this.client.trigger("beforeColumnDrag", { drag, event, columnRecord: drag.columnRecord });
  }
  onDragStart({ drag, event }) {
    return this.client.trigger("columnDragStart", { drag, event, columnRecord: drag.columnRecord });
  }
};
__publicField(ColumnDrag, "$name", "ColumnDrag");
__publicField(ColumnDrag, "type", "columnDrag");
__publicField(ColumnDrag, "pluginConfig", {
  after: ["initialCompose", "populateColumnHeaderMenu"]
});
ColumnDrag.initClass();
var ColumnZone = class extends Base.mixin(Draggable_default, Droppable_default, Events_default) {
  static get configurable() {
    return {
      dragSelector: ".b-taskboard-column-header, .b-taskboard-column-header *",
      dragItemSelector: ".b-taskboard-column-header",
      // Column has multiple parts (header + one element per swimlane), going to add cls manually to them
      draggingItemCls: null,
      dragProxy: {
        type: "default",
        async open(drag) {
          const { owner } = this, {
            itemElement,
            startEvent,
            columnRecord
          } = drag, taskBoard = owner.owner.client, headerBounds = Rectangle.from(itemElement, owner.dragRootElement), proxyOffset = EventHelper.getClientPoint(startEvent).getDelta(headerBounds), proxy = DomHelper.createElement({
            className: "b-taskboard-column-drag-proxy",
            parent: owner.dragRootElement,
            style: {
              // Using fixed top, only draggable horizontally
              top: headerBounds.y,
              // Offset from cursor to be positioned over original column
              left: EventHelper.getClientPoint(startEvent).translate(proxyOffset[0], 0).x,
              // Need a fixed width on the proxy, since columns width might be flexed etc
              width: itemElement.getBoundingClientRect().width
            },
            // Don't want it being removed while dragging
            retainElement: true
          }), elements = [itemElement, ...taskBoard.getColumnElements(columnRecord)];
          Object.assign(drag, {
            proxy,
            elements,
            proxyOffset
          });
          elements.forEach((element, i) => {
            const columnClone = element.cloneNode(true), bounds = element.getBoundingClientRect();
            element.originalWidth = bounds.width;
            element.originalHeight = bounds.height;
            if (element.matches(".b-taskboard-column")) {
              const swimlane = element.closest(".b-taskboard-swimlane"), header = DomSync.getChild(swimlane, "header"), body = DomSync.getChild(swimlane, "body"), swimlaneClone = swimlane.cloneNode(), headerClone = header == null ? void 0 : header.cloneNode(true), bodyClone = body.cloneNode();
              let height = swimlane.getBoundingClientRect().height;
              if (i === elements.length - 1) {
                const paddingBottom = DomHelper.getStyleValue(element.parentElement, "padding-bottom");
                height -= parseFloat(paddingBottom);
              }
              swimlaneClone.style.flex = `0 0 ${height}px`;
              headerClone && swimlaneClone.appendChild(headerClone);
              bodyClone.appendChild(columnClone);
              swimlaneClone.appendChild(bodyClone);
              proxy.appendChild(swimlaneClone);
            } else {
              proxy.appendChild(columnClone);
            }
            element.classList.add("b-drag-original");
          });
        },
        dragMove({ proxy, event, proxyOffset }) {
          const position = EventHelper.getClientPoint(event).translate(proxyOffset[0], 0);
          proxy.style.left = `${position.x}px`;
        }
      }
    };
  }
  setupDragContext(event) {
    const result = super.setupDragContext(event), { client } = this.owner;
    result.scrollManager = client.scrollManager;
    result.monitoringConfig = {
      scrollables: [{
        element: client.bodyElement,
        direction: "horizontal"
      }]
    };
    return result;
  }
  // Populate the drag context early, to have something to take decisions on in beforeDragStart listeners
  startDrag(drag) {
    drag.columnRecord = this.owner.client.resolveColumnRecord(drag.itemElement);
    return super.startDrag(drag);
  }
  dragStart(drag) {
    this.owner.client.suspendResponsiveness();
    drag.wasStarted = true;
  }
  dragEnter(drag) {
    if (!drag.itemElement.matches(this.dragItemSelector)) {
      return false;
    }
    if (!drag.dropIndicators) {
      drag.dropIndicators = drag.elements.map((element, i) => DomHelper.createElement({
        className: "b-taskboard-column-drop-indicator",
        elementData: {
          dropIndicator: true,
          // Tag along the element, to be able to return the drop indicator to its position for
          // invalid drop targets. NOTE: Currently not used
          element
        },
        // Use same size as dragged column had originally
        style: {
          width: element.originalWidth,
          height: element.originalHeight
        }
      }));
      this.insertDropIndicators(drag, drag.columnRecord);
    }
  }
  insertDropIndicators(drag, beforeColumnRecord) {
    const { client } = this.owner, insertAt = client.columns.indexOf(beforeColumnRecord);
    drag.dropIndicators.forEach((dropIndicator, i) => {
      var _a, _b;
      if (i === 0) {
        const headerContainer = DomSync.getChild(client.bodyElement, "header"), actualHeaders = [...headerContainer.children];
        ArrayHelper.remove(actualHeaders, dropIndicator);
        headerContainer.insertBefore(dropIndicator, actualHeaders[insertAt]);
      } else {
        const swimlaneRecord = (_b = (_a = client.swimlanes) == null ? void 0 : _a.getAt(i - 1)) != null ? _b : { domId: "default" }, swimlaneBody = DomSync.getChild(client.getSwimlaneElement(swimlaneRecord), "body"), actualColumns = [...swimlaneBody.children];
        ArrayHelper.remove(actualColumns, dropIndicator);
        swimlaneBody.insertBefore(dropIndicator, actualColumns[insertAt]);
      }
    });
  }
  updateValidity(drag, valid) {
    drag.proxy.classList.toggle("b-invalid", !valid);
    drag.dropIndicators.forEach((dropIndicator) => dropIndicator.classList.toggle("b-invalid", !valid));
    drag.invalid = !valid;
  }
  dragMove(drag) {
    var _a;
    const { client } = this.owner, documentRoot = client.documentRoot, proxyBounds = Rectangle.from(drag.proxy, void 0, true), overElement = documentRoot.elementFromPoint(proxyBounds.center.x, proxyBounds.y), columnHeaderElement = overElement == null ? void 0 : overElement.closest(".b-taskboard-column-header");
    if (drag.invalid) {
      drag.valid = false;
    }
    if (!((_a = overElement == null ? void 0 : overElement.elementData) == null ? void 0 : _a.dropIndicator) && columnHeaderElement) {
      const targetBounds = Rectangle.from(columnHeaderElement);
      let beforeColumn = client.resolveColumnRecord(columnHeaderElement);
      if (proxyBounds.center.x > targetBounds.center.x) {
        beforeColumn = client.columns.getNext(beforeColumn);
      }
      this.insertDropIndicators(drag, beforeColumn);
      const shouldTrigger = drag.beforeColumn !== beforeColumn;
      drag.beforeColumn = beforeColumn;
      if (shouldTrigger) {
        const result = client.trigger("columnDrag", { drag, columnRecord: drag.columnRecord, beforeColumn });
        this.updateValidity(drag, result !== false);
      }
    }
  }
  async dragDrop(drag) {
    const { client } = this.owner, { columns } = client, {
      columnRecord,
      beforeColumn,
      elements,
      dropIndicators,
      proxy
    } = drag;
    if (drag.invalid || await client.trigger("beforeColumnDrop", { drag, columnRecord, beforeColumn }) === false) {
      drag.valid = false;
    } else {
      drag.finalizer = new Promise((resolve) => {
        function commit() {
          proxy.remove();
          dropIndicators.forEach((dropIndicator) => dropIndicator.remove());
          elements.forEach((element) => element.classList.remove("b-drag-original"));
          client.suspendDomTransition();
          beforeColumn !== void 0 && columns.move(columnRecord, beforeColumn);
          client.resumeDomTransition();
          client.trigger("columnDrop", { drag, columnRecord, beforeColumn });
          client.trigger("columnDragEnd", { drag, columnRecord, beforeColumn });
          client.resumeResponsiveness();
          resolve();
        }
        proxy.classList.add("b-dropping");
        DomHelper.alignTo(
          proxy,
          Rectangle.from(dropIndicators[0], void 0, true)
        );
        if (DomHelper.getPropertyTransitionDuration(proxy, "transform")) {
          EventHelper.onTransitionEnd({
            element: proxy,
            property: "transform",
            handler: commit,
            thisObj: client
          });
        } else {
          commit();
        }
      });
    }
  }
  dragLeave(drag) {
  }
  doAbort(drag) {
    const { client } = this.owner, { dropIndicators, proxy, columnRecord, elements } = drag;
    if (proxy) {
      let finalizeAbort = function() {
        proxy.remove();
        dropIndicators.forEach((dropIndicator) => dropIndicator.remove());
        elements.forEach((element) => element.classList.remove("b-drag-original"));
        client.trigger("columnDragAbortFinalized");
      };
      proxy.classList.add("b-dropping");
      dropIndicators.forEach((dropIndicator, i) => {
        const original = drag.elements[i];
        dropIndicator.classList.remove("b-invalid");
        original.parentElement.insertBefore(dropIndicator, original);
      });
      DomHelper.alignTo(
        proxy,
        Rectangle.from(dropIndicators[0], void 0, true)
      );
      if (DomHelper.getPropertyTransitionDuration(proxy, "transform")) {
        EventHelper.onTransitionEnd({
          element: proxy,
          property: "transform",
          handler: finalizeAbort,
          thisObj: client
          // For timer cleanup
        });
      } else {
        finalizeAbort();
      }
    }
    client.trigger("columnDragAbort", { drag, columnRecord });
    if (drag.wasStarted) {
      client.trigger("columnDragEnd", { drag, columnRecord });
    }
  }
  dragEnd(drag) {
    if (!drag.valid || drag.aborted) {
      this.doAbort(drag);
    }
  }
};
ColumnDrag._$name = "ColumnDrag";

// lib/TaskBoard/feature/ColumnHeaderMenu.js
var ColumnHeaderMenu = class extends ContextMenuBase {
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push(...["populateColumnHeaderMenu", "populateColumnHeader", "onColumnHeaderClick"]);
    return config;
  }
  //region Events
  /**
   * This event fires on the owning TaskBoard before the menu is shown for a column header.
   * Allows manipulation of the items to show in the same way as in the {@link #config-processItems}.
   *
   * Returning `false` from a listener prevents the menu from being shown.
   *
   * @event columnHeaderMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<string,MenuItemConfig>} items Menu item configs
   * @param {TaskBoard.model.ColumnModel} columnRecord The column
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard after the context menu is shown for a column header.
   * @event cellMenuShow
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<string,MenuItemConfig>} items Menu item configs
   * @param {TaskBoard.model.ColumnModel} columnRecord The column
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard when an item is selected in the column header menu.
   * @event cellMenuItem
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {TaskBoard.model.ColumnModel} columnRecord The column
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard when a check item is toggled in the column header menu.
   * @event cellMenuToggleItem
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {TaskBoard.model.ColumnModel} columnRecord The column
   * @param {Boolean} checked Checked or not
   * @on-owner
   */
  //endregion
  //region Type assertions
  changeItems(items) {
    ObjectHelper.assertObject(items, "features.columnHeaderMenu.items");
    return items;
  }
  changeProcessItems(fn) {
    ObjectHelper.assertFunction(fn, "features.columnHeaderMenu.processItems");
    return fn;
  }
  //endregion
  // Inject a "button" into column headers
  populateColumnHeader({ columnHeaderConfig }) {
    if (!this.disabled) {
      columnHeaderConfig.children.padder.children.menu = {
        tag: "button",
        class: {
          "b-column-header-button": 1,
          "b-taskboard-column-header-menu-button": 1,
          "b-fw-icon": 1,
          "b-icon-menu-horizontal": 1
        }
      };
    }
  }
  // Populate menu events with taskboard specifics
  getDataFromEvent(event) {
    return ObjectHelper.assign(super.getDataFromEvent(event), event.taskBoardData);
  }
  // Add default menu items
  populateColumnHeaderMenu({ items, columnRecord }) {
    const { client } = this;
    if (!client.readOnly) {
      items.addTask = {
        text: "L{TaskBoard.addTask}",
        icon: "b-fw-icon b-icon-add",
        weight: 100,
        onItem() {
          client.addTask(columnRecord);
        }
      };
    }
  }
  // Detect "button" click
  onColumnHeaderClick(args) {
    const { event } = args;
    if (event.target.matches(".b-column-header-button")) {
      this.showContextMenu(event, { target: event.target, align: "t90-b90" });
    }
  }
  doDisable(disable) {
    super.doDisable(disable);
    !this.isConfiguring && this.client.recompose();
  }
  get showMenu() {
    return true;
  }
};
__publicField(ColumnHeaderMenu, "$name", "ColumnHeaderMenu");
__publicField(ColumnHeaderMenu, "type", "columnHeaderMenu");
__publicField(ColumnHeaderMenu, "configurable", {
  /**
   * A function called before displaying the menu that allows manipulations of its items.
   * Returning `false` from this function prevents the menu from being shown.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *   features         : {
   *       columnHeaderMenu : {
   *           processItems({ columnRecord, items }) {
   *              // Push an extra item for the todo column
   *              if (columnRecord.id === 'todo') {
   *                  items.finishAll = {
   *                      text : 'Finish all',
   *                      icon : 'b-fa-fw b-fa-check'
   *                      onItem({ columnRecord }) {
   *                          columnRecord.tasks.forEach(taskRecord => taskRecord.status = 'done');
   *                      }
   *                  };
   *               }
   *           }
   *       }
   *   }
   * });
   * ```
   *
   * @config {Function}
   * @param {Object} context An object with information about the menu being shown
   * @param {TaskBoard.model.ColumnModel} context.columnRecord The column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean>} context.items An object containing the
   *   {@link Core.widget.MenuItem menu item} configs keyed by their id
   * @param {Event} context.event The DOM event object that triggered the show
   * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
   * @preventable
   */
  processItems: null,
  /**
   * This is a preconfigured set of items used to create the default context menu.
   *
   * The `items` provided by this feature are listed in the intro section of this class. You can configure
   * existing items by passing a configuration object to the keyed items.
   *
   * To remove existing items, set corresponding keys `null`:
   *
   * ```javascript
   * const scheduler = new Scheduler({
   *     features : {
   *         columnHeaderMenu : {
   *             items : {
   *                 addTask : null
   *             }
   *         }
   *     }
   * });
   * ```
   *
   * See the class description for more examples.
   *
   * @config {Object<string,MenuItemConfig|Boolean|null>} items
   */
  items: null,
  menu: {
    anchor: true
  },
  type: "columnHeader",
  triggerEvent: false
  /**
   * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<String,String>>} keyMap
   */
  /**
   * @hideconfigs type, triggerEvent
   */
});
TaskBoardFeature.register(ColumnHeaderMenu.type, ColumnHeaderMenu);
ColumnHeaderMenu._$name = "ColumnHeaderMenu";

// lib/TaskBoard/feature/ColumnToolbars.js
var ColumnToolbars = class extends TaskBoardFeature {
  constructor() {
    super(...arguments);
    // Holds exising toolbars, keyed by location, column and swimlane
    __publicField(this, "columnMap", /* @__PURE__ */ new Map());
  }
  doDestroy() {
    for (const [, toolbar] of this.columnMap) {
      toolbar.destroy();
    }
    super.doDestroy();
  }
  //region Type assertions
  changeTopItems(items) {
    ObjectHelper.assertObject(items, "features.columnToolbars.topItems");
    return items;
  }
  changeBottomItems(items) {
    ObjectHelper.assertObject(items, "features.columnToolbars.bottomItems");
    return items;
  }
  changeProcessItems(fn) {
    ObjectHelper.assertFunction(fn, "features.columnToolbars.processItems");
    return fn;
  }
  //endregion
  //region Toolbars
  // removeToolbar(location) {
  //     const columnMap = this.columnMap;
  //
  //     for (const [key, toolbar] of columnMap) {
  //         if (key.startsWith(location)) {
  //             toolbar.destroy();
  //             columnMap.delete(toolbar);
  //         }
  //     }
  // }
  //
  // changeTopItems(items, old) {
  //     if (old && !items) {
  //         this.removeToolbar('top');
  //     }
  //
  //     return items;
  // }
  //
  // changeBottomItems(items, old) {
  //     if (old && !items) {
  //         this.removeToolbar('items');
  //     }
  //
  //     return items;
  // }
  // Creates or retrieves a toolbar instance for the requested column/swimlane intersection
  getToolbar(location, columnRecord, swimlaneRecord) {
    var _a, _b;
    const me = this, { columnMap, client, namedItems } = me, items = me[`${location}Items`], key = `${location}_._${columnRecord.domId}_._${(_a = swimlaneRecord == null ? void 0 : swimlaneRecord.domId) != null ? _a : "default"}`;
    let toolbar = columnMap.get(key);
    if (!toolbar) {
      const clonedItems = {};
      ObjectHelper.getTruthyKeys(items).map((ref) => {
        const namedItem = namedItems[ref], item = items[ref];
        clonedItems[ref] = ObjectHelper.merge(
          // Default listeners + decorate with records
          {
            internalListeners: {
              click: "onClick",
              change: "onChange",
              thisObj: me
            },
            columnRecord,
            swimlaneRecord
          },
          // Merge with any matched named item
          namedItem,
          // And any supplied config
          item
        );
      });
      if (((_b = me.processItems) == null ? void 0 : _b.call(me, { items: clonedItems, location, columnRecord, swimlaneRecord })) === false) {
        return null;
      }
      toolbar = client.add({
        type: "toolbar",
        cls: `b-taskboard-column-${location[0]}bar`,
        overflow: null,
        monitorResize: false,
        contentElMutationObserver: false,
        items: clonedItems,
        dataset: {
          role: `${location}-toolbar`,
          domTransition: true
        }
      });
      columnMap.set(key, toolbar);
    }
    return toolbar.element;
  }
  populateColumn({ columnConfig, columnRecord, swimlaneRecord }) {
    const me = this;
    if (!me.disabled) {
      if (ObjectHelper.getTruthyKeys(me.topItems).length) {
        DomHelper.merge(columnConfig, {
          children: {
            "tbar > body": me.getToolbar("top", columnRecord, swimlaneRecord)
          }
        });
      }
      if (ObjectHelper.getTruthyKeys(me.bottomItems).length) {
        columnConfig.children.bbar = me.getToolbar("bottom", columnRecord, swimlaneRecord);
      }
    }
  }
  removeColumnToolbar(location, columnId, swimlaneId) {
    const { columnMap, client } = this, key = `${location}_._${columnId}_._${swimlaneId}`, toolbar = columnMap.get(key);
    if (toolbar) {
      client.remove(toolbar);
      client.setTimeout(() => toolbar.destroy(), 0);
      columnMap.delete(key);
    }
  }
  removeColumnToolbars(columnId, swimlaneId) {
    this.removeColumnToolbar("top", columnId, swimlaneId);
    this.removeColumnToolbar("bottom", columnId, swimlaneId);
  }
  onRemoveColumnElement({ columnId, swimlaneRecord }) {
    var _a;
    this.removeColumnToolbars(columnId, (_a = swimlaneRecord.id) != null ? _a : "default");
  }
  onRemoveSwimlaneElement({ swimlaneId }) {
    for (const column of this.client.columns) {
      this.removeColumnToolbars(column.id, swimlaneId);
    }
  }
  //endregion
  //region Predefined items events
  onAddClick({ source }) {
    this.client.addTask(source.columnRecord, source.swimlaneRecord);
  }
  //endregion
  //region Generic events
  onChange({ source }) {
    this.trigger("itemChange", {
      item: source,
      columnRecord: source.columnRecord,
      swimlaneRecord: source.swimlaneRecord
    });
  }
  onClick({ source }) {
    this.trigger("itemClick", {
      item: source,
      columnRecord: source.columnRecord,
      swimlaneRecord: source.swimlaneRecord
    });
  }
  //endregion
};
__publicField(ColumnToolbars, "$name", "ColumnToolbars");
__publicField(ColumnToolbars, "type", "columnToolbars");
__publicField(ColumnToolbars, "configurable", {
  /**
   * Items to add to the top toolbar, in object format.
   *
   *
   * ```javascript
   * new TaskBoard({
   *    features : {
   *        columnToolbars : {
   *            topItems : {
   *                clearButton : {
   *                    icon    : 'b-fa-trash',
   *                    onClick : ...
   *                }
   *            }
   *        }
   *    }
   * });
   * ```
   *
   * @config {Object<String,ContainerItemConfig|Boolean|null>}
   */
  topItems: null,
  /**
   * Items to add to the bottom toolbar, in object format.
   *
   * To remove existing items, set corresponding keys to `null`.
   *
   * ```javascript
   * new TaskBoard({
   *    features : {
   *        columnToolbars : {
   *            bottomItems : {
   *                clearButton : {
   *                    icon    : 'b-fa-trash',
   *                    onClick : ...
   *                }
   *            }
   *        }
   *    }
   * });
   * ```
   *
   * @config {Object<String,ContainerItemConfig|Boolean|null>}
   */
  bottomItems: {
    addTask: true
  },
  // Predefined items that can be used in topItems and/or bottomItems
  namedItems: {
    addTask: {
      type: "button",
      icon: "b-icon-add",
      tooltip: "L{TaskBoard.addTask}",
      ariaLabel: "L{TaskBoard.addTask}",
      internalListeners: {
        click: "onAddClick"
      }
    }
  },
  /**
   * A function called before displaying the toolbar that allows manipulations of its items.
   * Returning `false` from this function prevents the menu being shown.
   *
   * ```javascript
   * features         : {
   *    columnToolbars : {
   *         processItems({ items, location, columnRecord, swimlaneRecord }) {
   *             // Add or hide existing items here as needed
   *             items.myAction = {
   *                 text   : 'Cool action',
   *                 icon   : 'b-fa-ban',
   *                 onClick : () => console.log(`Clicked button for ${columnRecord.text}`)
   *             };
   *
   *            if (columnRecord.id === 'done') {
   *                items.addTask = false
   *            }
   *         }
   *     }
   * },
   * ```
   *
   * @config {Function}
   * @param {Object} context An object with information about the toolbar being shown
   * @param {Object<String,ContainerItemConfig>} context.items An object containing the toolbar item configs keyed by ref
   * @param {'top'|'bottom'} context.location Toolbar location, "top" or "bottom"
   * @param {TaskBoard.model.ColumnModel} context.columnRecord Record representing toolbars column
   * @param {TaskBoard.model.SwimlaneModel} context.swimlaneRecord Record representing toolbars swimlane
   * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
   * @preventable
   */
  processItems: null
});
__publicField(ColumnToolbars, "pluginConfig", {
  chain: ["populateColumn", "onRemoveColumnElement", "onRemoveSwimlaneElement"]
});
ColumnToolbars.initClass();
ColumnToolbars._$name = "ColumnToolbars";

// lib/TaskBoard/view/item/TaskItem.js
var TaskItem = class extends Base.mixin(Factoryable_default) {
  static getEditorConfig({ config, item }) {
    const editor = config.editor !== null && (config.editor || item.defaultEditor);
    if (typeof editor === "string") {
      return {
        type: editor
      };
    }
    return editor;
  }
};
__publicField(TaskItem, "factoryable", {});
__publicField(TaskItem, "configurable", {
  /**
   * Task field whose value item will act on (usually display it). Defaults to use the key in the items object.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    features : {
   *        taskItems : {
   *            items : {
   *                // Will use "prio" as its field
   *                prio  : { type : 'textitem' },
   *                // Will use "status" as its field
   *                state : { type : 'textitem', field : 'status' }
   *            }
   *        }
   *    }
   * });
   * ```
   *
   * @config {String} field
   * @category Common
   */
  /**
   * Style definition in string or object form.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    features : {
   *        taskItems : {
   *            items : {
   *                prio  : { type : 'textitem', style : { color : 'red' } }
   *            }
   *        }
   *    }
   * });
   * ```
   *
   * @config {String|Object} style
   * @category Common
   */
  /**
   * Specify `true` to hide the task item.
   *
   * @config {Boolean} hidden
   * @category Common
   */
  /**
   * Flex order, can be used to re-order task items.
   *
   * @config {Number} order
   * @default 1
   * @category Common
   */
  /**
   * CSS class to add.
   *
   * @config {String} cls
   * @category Common
   */
  /**
   * Widget type or config to use as the editor for this item. Used in the inline task editor.
   * Set to `null` to not use an editor for this item.
   *
   * @config {String|Object} editor
   * @default text
   * @category Common
   */
});
__publicField(TaskItem, "defaultEditor", { type: "text" });
TaskItem._$name = "TaskItem";

// lib/TaskBoard/feature/SimpleTaskEdit.js
var actions = {
  editNext: 1,
  cancel: 1,
  editPrevious: 1,
  complete: 1
};
var SimpleTaskEdit = class extends TaskBoardFeature {
  //region Type assertions
  changeAddNewAtEnd(addNewAtEnd) {
    ObjectHelper.assertBoolean(addNewAtEnd, "features.simpleTaskEdit.addNewAtEnd");
    return addNewAtEnd;
  }
  //endregion
  /**
   * Starts inline editing of the supplied task, optionally for a specific item on its card.
   * @on-owner
   * @param {TaskBoard.model.TaskModel} taskRecord Task record to edit
   * @param {HTMLElement} [element] Card element or card item element to edit. Resolves element from the passed record
   * if left out.
   * @returns {Boolean} Returns `true` if editing started, `false` if it did not.
   */
  editTask(taskRecord, element) {
    const me = this, taskBoard = me.client;
    if (!element) {
      element = taskBoard.getTaskElement(taskRecord);
    }
    const taskItem = taskBoard.resolveTaskItem(element), itemElement = taskItem.element, itemEditorConfig = TaskItem.getEditorConfig(taskItem);
    if (!itemEditorConfig) {
      return false;
    }
    if (me.disabled || taskRecord.readOnly || taskBoard.trigger("beforeSimpleTaskEdit", { simpleTaskEdit: me, taskRecord, field: taskItem.config.field }) === false) {
      return true;
    }
    element.focus();
    const editor = me.editor = Editor.new({
      owner: taskBoard,
      appendTo: itemElement.parentNode,
      scrollAction: "realign",
      cls: "b-simple-task-editor",
      completeKey: null,
      cancelKey: null,
      inputField: {
        autoSelect: true,
        name: taskItem.config.field,
        ...itemEditorConfig
      },
      align: {
        align: "c-c",
        allowTargetOut: false
      },
      internalListeners: {
        complete: "onEditorComplete",
        cancel: "onEditorCancel",
        finishEdit: "onEditorFinishEdit",
        thisObj: me
      }
    }, me.editorConfig);
    me.currentElement = itemElement;
    itemElement.classList.add("b-editing");
    const color = DomHelper.getStyleValue(itemElement, "color");
    editor.element.style.color = color;
    editor.inputField.element.style.color = color;
    editor.element.retainElement = true;
    taskBoard.getTaskElement(taskRecord).scrollIntoView({
      block: "nearest"
    });
    itemElement.scrollIntoView({
      block: "nearest"
    });
    editor.startEdit({
      target: taskItem.element,
      record: taskRecord,
      field: taskItem.config.field
    });
    return true;
  }
  // Edit previous task item
  async editPrevious(event) {
    const me = this, { client, editor } = me, taskRecord = editor.record, cardElement = client.getTaskElement(taskRecord), itemElements = Array.from(cardElement.querySelectorAll(".b-taskboard-taskitem.b-editable")), index = itemElements.indexOf(me.currentElement) - 1;
    if (await me.complete(event)) {
      if (index >= 0) {
        me.editTask(taskRecord, itemElements[index]);
      } else {
        const prevTaskRecord = client.getPreviousTask(taskRecord, false);
        if (prevTaskRecord) {
          const prevCardElement = client.getTaskElement(prevTaskRecord), prevItemElements = Array.from(prevCardElement.querySelectorAll(".b-taskboard-taskitem.b-editable"));
          me.editTask(prevTaskRecord, prevItemElements[prevItemElements.length - 1]);
        }
      }
    }
  }
  // Edit next task item
  async editNext(event) {
    const me = this, { client, editor } = me, taskRecord = editor.record, cardElement = client.getTaskElement(taskRecord), itemElements = Array.from(cardElement.querySelectorAll(".b-taskboard-taskitem.b-editable")), index = itemElements.indexOf(me.currentElement) + 1;
    if (await me.complete(event)) {
      if (index < itemElements.length) {
        me.editTask(taskRecord, itemElements[index]);
      } else {
        const nextTaskRecord = client.getNextTask(taskRecord, false);
        if (nextTaskRecord) {
          me.editTask(nextTaskRecord);
        } else if (me.addNewAtEnd) {
          client.addTask(client.getColumn(taskRecord), client.getSwimlane(taskRecord));
        }
      }
    }
  }
  complete(event) {
    return this.editor.completeEdit(null, event);
  }
  cancel(event) {
    this.editor.cancelEdit(event);
  }
  // Start editing when activating task (enter/dblclick)
  onActivateTask({ taskRecord, event }) {
    if (this.editTask(taskRecord, event.target)) {
      event.preventDefault();
    }
  }
  onEditorComplete({ source }) {
    this.client.trigger("simpleTaskEditComplete", { simpleTaskEdit: this, taskRecord: source.record, field: source.dataField });
  }
  onEditorCancel({ source }) {
    this.client.trigger("simpleTaskEditCancel", { simpleTaskEdit: this, taskRecord: source.record, field: source.dataField });
  }
  onEditorFinishEdit() {
    const me = this, { editor } = me;
    editor == null ? void 0 : editor.setTimeout(() => {
      if (me.editor === editor) {
        me.currentElement = null;
        me.editor = null;
      }
      editor.destroy();
    }, 0);
  }
  // All keyMap actions require that we are editing
  isActionAvailable({ actionName }) {
    if (actions[actionName]) {
      return Boolean(this.editor);
    }
  }
};
__publicField(SimpleTaskEdit, "$name", "SimpleTaskEdit");
__publicField(SimpleTaskEdit, "type", "simpleTaskEdit");
__publicField(SimpleTaskEdit, "configurable", {
  /**
   * Pressing `Enter` in last item on last task in a column adds a new task.
   * @config {Boolean}
   * @default
   */
  addNewAtEnd: true,
  /**
   * A configuration object for the {@link Core.widget.Editor} used by this feature. Useful when you want to
   * validate the value being set by the end user (see {@link Core.widget.Editor#event-beforeComplete}).
   *
   * @config {EditorConfig}
   */
  editorConfig: {},
  /**
   * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<String,String>}
   */
  keyMap: {
    Enter: "editNext",
    Escape: "cancel",
    "Ctrl+Enter": "complete",
    "Shift+Enter": "editPrevious"
  }
});
__publicField(SimpleTaskEdit, "pluginConfig", {
  assign: ["editTask"],
  before: ["onActivateTask"]
});
SimpleTaskEdit.initClass();
SimpleTaskEdit._$name = "SimpleTaskEdit";

// lib/TaskBoard/feature/SwimlaneDrag.js
var SwimlaneDrag = class extends TaskBoardFeature {
  initialCompose() {
    const me = this;
    me.draggable = SwimlaneZone.new({
      dragRootElement: me.disabled ? null : me.client.bodyWrapElement,
      dropRootElement: me.client.bodyWrapElement,
      owner: me
    }, me.draggable);
  }
  doDisable(disable) {
    super.doDisable(disable);
    if (this.draggable) {
      this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
    }
  }
};
__publicField(SwimlaneDrag, "$name", "SwimlaneDrag");
__publicField(SwimlaneDrag, "type", "swimlaneDrag");
__publicField(SwimlaneDrag, "pluginConfig", {
  after: ["initialCompose"]
});
SwimlaneDrag.initClass();
var SwimlaneZone = class extends Base.mixin(Draggable_default, Droppable_default) {
  static get configurable() {
    return {
      dragSelector: ".b-taskboard-swimlane-header, .b-taskboard-swimlane-header *",
      dragItemSelector: ".b-taskboard-swimlane-header",
      draggingItemCls: null,
      dragProxy: {
        type: "default",
        async open(drag) {
          const { owner } = this, {
            itemElement,
            startEvent
          } = drag, taskBoard = owner.owner.client, swimlaneRecord = taskBoard.resolveSwimlaneRecord(itemElement), swimlaneElement = taskBoard.getSwimlaneElement(swimlaneRecord), padding = DomHelper.getStyleValue(
            swimlaneElement.syncIdMap.body,
            ["padding-left", "padding-right"]
          ), bounds = Rectangle.from(swimlaneElement, owner.dragRootElement).deflate(
            0,
            parseFloat(padding["padding-right"]),
            0,
            parseFloat(padding["padding-left"])
          ), proxyOffset = EventHelper.getClientPoint(startEvent).getDelta(bounds), proxy = DomHelper.createElement({
            className: "b-taskboard-swimlane-drag-proxy",
            parent: owner.dragRootElement,
            style: {
              // Using fixed top, only draggable horizontally
              top: EventHelper.getClientPoint(startEvent).translate(0, proxyOffset[1]).y,
              // Offset from cursor to be positioned over original column
              left: bounds.x,
              // Need a fixed height on the proxy, since columns width might be flexed etc
              width: bounds.width
            },
            // Don't want it being removed while dragging
            retainElement: true
          });
          Object.assign(drag, {
            proxy,
            swimlaneRecord,
            swimlaneElement,
            proxyOffset,
            // Used to size dropIndicator
            bounds
          });
          const swimlaneClone = swimlaneElement.cloneNode(true);
          proxy.appendChild(swimlaneClone);
        },
        dragMove({ proxy, event, proxyOffset }) {
          const position = EventHelper.getClientPoint(event).translate(0, proxyOffset[1]);
          proxy.style.top = `${position.y}px`;
        }
      }
    };
  }
  setupDragContext(event) {
    const result = super.setupDragContext(event), { client } = this.owner;
    result.scrollManager = client.scrollManager;
    result.monitoringConfig = {
      scrollables: [{
        element: client.bodyElement,
        direction: "vertical"
      }]
    };
    return result;
  }
  dragStart(drag) {
  }
  dragEnter(drag) {
    if (!drag.itemElement.matches(this.dragItemSelector)) {
      return false;
    }
    if (!drag.dropIndicator) {
      const { bounds } = drag;
      drag.dropIndicator = DomHelper.createElement({
        className: "b-taskboard-swimlane-drop-indicator",
        elementData: {
          dropIndicator: true
        },
        // Use same size as dragged column had originally
        style: {
          width: bounds.width,
          height: bounds.height
        }
      });
      this.insertDropIndicator(drag.dropIndicator, drag.swimlaneRecord);
      drag.swimlaneElement.classList.add("b-drag-original");
    }
  }
  insertDropIndicator(dropIndicator, beforeSwimlaneRecord) {
    const { client } = this.owner;
    client.bodyElement.insertBefore(
      dropIndicator,
      beforeSwimlaneRecord && client.getSwimlaneElement(beforeSwimlaneRecord)
    );
  }
  async dragMove(drag) {
    var _a;
    const { client } = this.owner, { documentRoot } = client, taskBoardBounds = Rectangle.from(client.element, void 0, true), proxyBounds = Rectangle.from(drag.proxy, void 0, true), overElement = proxyBounds.center.y > taskBoardBounds.bottom ? documentRoot.elementFromPoint(proxyBounds.x, proxyBounds.y) : documentRoot.elementFromPoint(proxyBounds.x, proxyBounds.center.y), swimlaneElement = overElement == null ? void 0 : overElement.closest(".b-taskboard-swimlane");
    if (!((_a = overElement == null ? void 0 : overElement.elementData) == null ? void 0 : _a.dropIndicator) && swimlaneElement) {
      const targetBounds = Rectangle.from(swimlaneElement, void 0, true);
      let beforeSwimlane = client.resolveSwimlaneRecord(swimlaneElement);
      if (proxyBounds.center.y > targetBounds.center.y) {
        beforeSwimlane = client.swimlanes.getNext(beforeSwimlane);
      }
      this.insertDropIndicator(drag.dropIndicator, beforeSwimlane);
      drag.beforeSwimlane = beforeSwimlane;
    }
  }
  async dragDrop(drag) {
    const { client } = this.owner, { swimlanes } = client, {
      swimlaneRecord,
      beforeSwimlane,
      swimlaneElement,
      dropIndicator,
      proxy
    } = drag;
    function commit() {
      proxy.remove();
      dropIndicator.remove();
      swimlaneElement.classList.remove("b-drag-original");
      beforeSwimlane !== void 0 && swimlanes.move(swimlaneRecord, beforeSwimlane);
      client.trigger("dropSwimlane", { beforeSwimlane, drag });
    }
    proxy.classList.add("b-dropping");
    DomHelper.alignTo(
      proxy,
      Rectangle.from(dropIndicator, void 0, true)
    );
    if (DomHelper.getPropertyTransitionDuration(proxy, "transform")) {
      EventHelper.onTransitionEnd({
        element: proxy,
        property: "transform",
        handler: commit,
        thisObj: client
      });
    } else {
      commit();
    }
  }
  dragLeave(drag) {
  }
};
SwimlaneDrag._$name = "SwimlaneDrag";

// lib/TaskBoard/feature/TaskDrag.js
var cardSelector = ".b-taskboard-card, .b-taskboard-card-drop-indicator";
var indexOf = (element, ignoreOriginal = false) => DomHelper.children(element.parentElement, `.b-taskboard-card${ignoreOriginal ? ":not(.b-drag-original)" : ""}, .b-first-drop-indicator`).indexOf(element);
var hasChanged = (dropIndicators) => dropIndicators.some((dropIndicator, i) => {
  return (
    // Moved to another parent is a change (another column or another swimlane)
    dropIndicator.parentElement !== dropIndicator.elementData.initialParent || // Or if first drop indicator has changed index (the others follow it, no need to check)
    i === 0 && indexOf(dropIndicator, true) !== dropIndicator.elementData.initialIndex
  );
});
var TaskDrag = class extends TaskBoardFeature {
  initialCompose() {
    const me = this;
    me.draggable = TaskZone.new({
      dragRootElement: me.disabled ? null : me.client.bodyWrapElement,
      dropRootElement: me.client.bodyWrapElement,
      owner: me,
      [me.dragTouchStartDelay != null ? "dragTouchStartDelay" : void 0]: me.dragTouchStartDelay,
      internalListeners: {
        beforeDragStart: "onBeforeDragStart",
        dragStart: "onDragStart",
        thisObj: me
      }
    }, me.draggable);
  }
  doDestroy() {
    var _a;
    super.doDestroy();
    (_a = this.draggable) == null ? void 0 : _a.destroy();
  }
  doDisable(disable) {
    super.doDisable(disable);
    if (this.draggable) {
      this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
    }
  }
  onBeforeDragStart({ drag, event }) {
    return this.client.trigger("beforeTaskDrag", { drag, event, domEvent: event, taskRecords: drag.taskRecords });
  }
  onDragStart({ drag, event }) {
    return this.client.trigger("taskDragStart", { drag, event, domEvent: event, taskRecords: drag.taskRecords });
  }
};
__publicField(TaskDrag, "$name", "TaskDrag");
__publicField(TaskDrag, "type", "taskDrag");
__publicField(TaskDrag, "pluginConfig", {
  after: ["initialCompose"]
});
__publicField(TaskDrag, "configurable", {
  /**
   * Specify `true` to enable the old behavior of moving tasks in the store on drop.
   *
   * This behaviour was made opt in since it does not play well when sharing data with other components.
   *
   * <div class="note">
   * If you are sorting tasks by a field other than `weight` and want predictable results on drop, you should
   * enable this config.
   * </div>
   *
   * @config {Boolean}
   * @default
   */
  reorderTaskRecords: false,
  /**
   * The number of milliseconds that must elapse after a `touchstart` event before it is considered a drag. If
   * movement occurs before this time, the drag is aborted. This is to allow touch swipes and scroll gestures.
   * @config {Number}
   * @default 300
   */
  dragTouchStartDelay: null
});
TaskDrag.initClass();
var TaskZone = class extends Base.mixin(Draggable_default, Droppable_default, Events_default) {
  static get configurable() {
    return {
      dragSelector: ".b-taskboard-card:not(.b-readonly)",
      dragItemSelector: ".b-taskboard-card:not(.b-readonly)",
      // Accept drops on anything within the TaskBoard
      dropTargetSelector: ".b-taskboardbase",
      // We are going to allow dragging multiple cards, will need to add cls manually to all of them
      draggingItemCls: null,
      dragProxy: {
        type: "default",
        async open(drag) {
          const {
            itemElement,
            startEvent
          } = drag, taskBoard = this.owner.owner.client, columnEl = itemElement.closest(".b-taskboard-column"), taskRecord = taskBoard.resolveTaskRecord(itemElement), proxy = drag.proxy = DomHelper.createElement({
            // Add column classes too to get exact same styles applied
            className: "b-taskboard-drag-proxy " + columnEl.className,
            role: "presentation",
            // Don't want it being removed while dragging
            retainElement: true
          }), cardClones = [];
          let taskRecords;
          if (taskBoard.selectedTasks.includes(taskRecord)) {
            taskRecords = taskBoard.selectedTasks.filter((t) => !t.readOnly).sort((a, b) => a.parentIndex - b.parentIndex);
          } else {
            taskRecords = [taskRecord];
          }
          const taskElements = taskRecords.map((r) => taskBoard.getTaskElement(r));
          Object.assign(drag, {
            taskElements,
            // Store heights, cannot measure later when original tasks are hidden
            taskHeights: /* @__PURE__ */ new Map(),
            // Offset from cursor, ignoring page scroll = client coords
            proxyOffset: EventHelper.getClientPoint(startEvent).getDelta(Rectangle.from(itemElement, null, true))
          });
          taskElements.forEach((taskElement) => {
            var _a;
            const { elementData } = taskElement, cardClone = taskElement.cloneNode(true), bounds = Rectangle.from(taskElement, itemElement);
            cardClone.style.width = bounds.width + "px";
            cardClone.style.height = bounds.height + "px";
            drag.taskHeights.set(taskElement, bounds.height);
            cardClone.style.left = bounds.x + "px";
            cardClone.style.top = bounds.y + "px";
            cardClone.taskElement = taskElement;
            cardClone.taskRecord = elementData.taskRecord;
            cardClone.originalColor = ((_a = elementData.swimlaneRecord) == null ? void 0 : _a.color) || elementData.columnRecord.color;
            proxy.appendChild(cardClone);
            cardClones.push(cardClone);
          });
          taskElements.forEach((taskElement) => taskElement.classList.add("b-drag-original"));
          await AsyncHelper.animationFrame();
          cardClones.forEach((cardClone, i) => {
            if (i > 0) {
              cardClone.style.top = 30 + i * 20 + "px";
              cardClone.style.left = 40 + i * 5 + "px";
            } else {
              cardClone.style.top = 0;
              cardClone.style.left = 0;
            }
          });
        },
        dragMove({ proxy, event, proxyOffset }) {
          const { dragRootElement } = this.owner, parentBounds = dragRootElement.getBoundingClientRect(), position = EventHelper.getClientPoint(event).translate(
            proxyOffset[0] - parentBounds.left + dragRootElement.scrollLeft,
            proxyOffset[1] - parentBounds.top + dragRootElement.scrollTop
          );
          proxy.style.top = position.y + "px";
          proxy.style.left = position.x + "px";
        }
      }
    };
  }
  configureListeners(drag) {
    const listeners = super.configureListeners(drag);
    listeners.element = this.owner.client.rootElement;
    return listeners;
  }
  setupDragContext(event) {
    const result = super.setupDragContext(event), { client } = this.owner;
    result.scrollManager = client.scrollManager;
    result.monitoringConfig = {
      scrollables: [
        {
          element: ".b-taskboard-column-body",
          direction: "vertical"
        },
        {
          element: client.bodyElement,
          direction: "both"
        }
      ]
    };
    return result;
  }
  // Populate the drag context early, to have something to take decisions on in beforeDragStart listeners
  startDrag(drag) {
    const { itemElement } = drag, taskBoard = this.owner.client, taskRecord = taskBoard.resolveTaskRecord(itemElement);
    if (taskBoard.isSelected(taskRecord)) {
      drag.taskRecords = taskBoard.selectedTasks.slice().sort((a, b) => a.parentIndex - b.parentIndex);
    } else {
      drag.taskRecords = [taskRecord];
    }
    drag.initiatedFrom = taskRecord;
    return super.startDrag(drag);
  }
  dragStart(drag) {
    const { client } = this.owner, nextSibling = drag.itemElement;
    drag.wasStarted = true;
    drag.position = "after";
    drag.targetTaskRecord = drag.initiatedFrom;
    for (const taskRecord of drag.taskRecords) {
      taskRecord.instanceMeta(client).dragging = true;
    }
    client.bodyWrapElement.appendChild(drag.proxy);
    drag.dropIndicators = drag.taskElements.map((taskElement, i) => {
      return DomHelper.createElement({
        className: {
          "b-taskboard-card-drop-indicator": 1,
          "b-first-drop-indicator": i === 0
        },
        style: {
          height: drag.taskHeights.get(taskElement)
        },
        elementData: {
          dropIndicator: true,
          // To be able to detect if it has actually moved on drop
          initialParent: taskElement.parentElement,
          initialIndex: indexOf(taskElement),
          // Tag along the taskElement, to be able to return the drop indicator to its position for
          // invalid drop targets
          taskElement
        },
        retainElement: true,
        nextSibling
      });
    });
    client.element.classList.add("b-dragging-task");
  }
  dragEnter(drag) {
    if (!drag.itemElement.matches(this.dragItemSelector)) {
      return false;
    }
  }
  // Finds the first visible direct child in a parent element
  getFirstVisibleChild(parentElement) {
    for (const element of parentElement.children) {
      if (element.offsetParent) {
        return element;
      }
    }
  }
  // Convenience shortcut to not have to pass custom card selector on each call
  getCardAt(x, y) {
    return this.owner.client.getCardAt(x, y, cardSelector);
  }
  updateValidity(drag, valid) {
    drag.proxy.classList.toggle("b-invalid", !valid);
    drag.dropIndicators.forEach((dropIndicator) => dropIndicator.classList.toggle("b-invalid", !valid));
    drag.invalid = !valid;
  }
  dragMove(drag) {
    var _a, _b, _c;
    const me = this, { client } = me.owner, { event: domEvent, dropIndicators } = drag, { clientX, clientY } = domEvent, overElement = client.documentRoot.elementFromPoint(clientX, clientY), columnElement = DomSync.getChild(overElement == null ? void 0 : overElement.closest(".b-taskboard-column"), "body.inner");
    if (drag.invalid) {
      drag.valid = false;
    }
    if (!overElement) {
      return;
    }
    if (columnElement) {
      const targetSwimlane = client.resolveSwimlaneRecord(overElement), targetColumn = client.resolveColumnRecord(overElement), tasksPerRow = targetColumn.tasksPerRow || (targetSwimlane == null ? void 0 : targetSwimlane.tasksPerRow) || client.tasksPerRow;
      let cardElement = overElement.closest(cardSelector), shouldTrigger = targetSwimlane !== drag.targetSwimlane || targetColumn !== drag.targetColumn;
      drag.targetSwimlane = targetSwimlane;
      drag.targetColumn = targetColumn;
      if (!cardElement) {
        const { cardGap } = client, columnRect = Rectangle.from(columnElement), topCard = me.getFirstVisibleChild(columnElement), top = (_a = topCard == null ? void 0 : topCard.getBoundingClientRect().top) != null ? _a : null;
        if (tasksPerRow === 1) {
          if (top !== null && clientY < top) {
            cardElement = topCard;
          } else {
            const centerX = columnRect.center.x, cardAbove = me.getCardAt(centerX, clientY - cardGap), cardBelow = me.getCardAt(centerX, clientY + cardGap);
            cardElement = cardAbove || cardBelow;
          }
        } else {
          const columnContentWidth = client.getColumnWidth(drag.targetColumn), columnPadding = (columnRect.width - columnContentWidth) / 2, innerColumnWidth = columnContentWidth / tasksPerRow, index = Math.floor((clientX - columnRect.left) / innerColumnWidth), centerX = columnRect.left + columnPadding + innerColumnWidth * (index + 0.5);
          if (top !== null && clientY < top) {
            cardElement = me.getCardAt(centerX, top);
          } else {
            const centerX2 = columnRect.center.x, cardBefore = me.getCardAt(centerX2 - cardGap, clientY), cardAfter = me.getCardAt(centerX2 + cardGap, clientY);
            cardElement = cardBefore || cardAfter;
          }
        }
      }
      if (!(cardElement == null ? void 0 : cardElement.elementData.dropIndicator)) {
        let insertBefore = false;
        if (cardElement) {
          const cardRect = Rectangle.from(cardElement), targetTaskRecord = client.resolveTaskRecord(cardElement);
          if (
            // If above center with single task per row
            tasksPerRow === 1 && clientY < cardRect.center.y || // Or left of center in multiple tasks per row
            tasksPerRow > 1 && clientX < cardRect.center.x
          ) {
            if (drag.position !== "before") {
              shouldTrigger = true;
            }
            insertBefore = cardElement;
            drag.position = "before";
          } else {
            if (drag.position !== "after") {
              shouldTrigger = true;
            }
            insertBefore = cardElement.nextElementSibling;
            drag.position = "after";
          }
          if (targetTaskRecord !== drag.targetTaskRecord) {
            shouldTrigger = true;
          }
          drag.targetTaskRecord = targetTaskRecord;
        } else {
          if (drag.position !== "last") {
            shouldTrigger = true;
          }
          drag.position = "last";
          drag.targetTaskRecord = null;
        }
        if (!((_b = insertBefore == null ? void 0 : insertBefore.elementData) == null ? void 0 : _b.dropIndicator)) {
          if (insertBefore === false) {
            dropIndicators.forEach((dropIndicator) => {
              columnElement == null ? void 0 : columnElement.appendChild(dropIndicator);
            });
          } else {
            dropIndicators.forEach((dropIndicator) => {
              ((insertBefore == null ? void 0 : insertBefore.parentElement) || columnElement).insertBefore(dropIndicator, insertBefore);
            });
          }
          drag.lastCardElement = cardElement;
        }
      }
      for (const card of drag.proxy.children) {
        if (!card.taskRecord.eventColor) {
          const color = ((_c = drag.targetSwimlane) == null ? void 0 : _c.color) || drag.targetColumn.color;
          if (card.originalColor) {
            card.classList.remove(`b-taskboard-color-${card.originalColor}`);
          }
          if (color) {
            card.originalColor = color;
            if (DomHelper.isNamedColor(color)) {
              card.classList.add(`b-taskboard-color-${color}`);
            } else {
              card.style.color = color;
            }
          }
        }
        if (drag.targetSwimlane) {
          card.dataset.lane = drag.targetSwimlane.id;
        }
        card.dataset.column = drag.targetColumn.id;
      }
      if (shouldTrigger) {
        const { taskRecords, targetTaskRecord, position } = drag, result = client.trigger(
          "taskDrag",
          { drag, taskRecords, targetSwimlane, targetColumn, targetTaskRecord, position, event: domEvent, domEvent }
        );
        me.updateValidity(drag, result !== false);
      }
    }
  }
  async dragDrop(drag) {
    const me = this, { client } = me.owner, {
      dropIndicators,
      taskRecords,
      targetSwimlane,
      targetColumn,
      targetTaskRecord,
      event: domEvent
    } = drag, event = { drag, domEvent, event: domEvent, taskRecords, targetSwimlane, targetColumn, targetTaskRecord }, changed = hasChanged(dropIndicators);
    if (!changed || !targetColumn || drag.invalid || await client.trigger("beforeTaskDrop", event) === false) {
      drag.valid = false;
    } else {
      drag.finalizer = new Promise((resolve) => {
        var _a;
        const {
          columnField,
          swimlaneField
        } = client, { taskStore } = client.project, {
          proxy
        } = drag, columnRecords = targetColumn.tasks, swimlaneRecords = targetSwimlane ? columnRecords == null ? void 0 : columnRecords.filter((task) => task[swimlaneField] === targetSwimlane.id) : columnRecords, invalid = !columnRecords;
        let moveBefore;
        if (!invalid) {
          if (drag.targetTaskRecord) {
            if (drag.position === "before") {
              moveBefore = targetTaskRecord;
            } else if (drag.position === "after") {
              const index = swimlaneRecords.indexOf(targetTaskRecord);
              moveBefore = (_a = swimlaneRecords[index + 1]) != null ? _a : null;
            }
          } else if (swimlaneRecords.length) {
            moveBefore = null;
          }
        }
        function commit() {
          var _a2;
          proxy.remove();
          dropIndicators.forEach((dropIndicator) => {
            const { taskElement } = dropIndicator.elementData;
            dropIndicator.parentElement.insertBefore(taskElement, dropIndicator);
            dropIndicator.parentElement.syncIdMap[taskElement.elementData.taskId] = taskElement;
            taskElement.classList.remove("b-drag-original");
            dropIndicator.remove();
          });
          client.suspendDomTransition();
          if (!invalid) {
            let newWeight;
            if (moveBefore) {
              const tasksBelow = swimlaneRecords.slice(swimlaneRecords.indexOf(moveBefore)), taskAbove = swimlaneRecords[swimlaneRecords.indexOf(moveBefore) - 1];
              let weightDiff;
              if (taskAbove) {
                weightDiff = Math.max(1, Math.round((moveBefore.weight - taskAbove.weight) / 2));
                newWeight = taskAbove.weight + weightDiff;
              } else {
                newWeight = Math.max(1, Math.round(moveBefore.weight / 2));
              }
              while (((_a2 = tasksBelow[0]) == null ? void 0 : _a2.weight) === newWeight) {
                weightDiff = tasksBelow[1] ? Math.max(1, Math.round((tasksBelow[1].weight - newWeight) / 2)) : 50;
                newWeight = tasksBelow[0].weight = newWeight + weightDiff;
                tasksBelow.shift();
              }
            } else {
              newWeight = swimlaneRecords.length ? swimlaneRecords[swimlaneRecords.length - 1].weight + 100 : 100;
            }
            taskRecords.forEach((taskRecord) => {
              const toSet = {
                [columnField]: targetColumn.id,
                weight: newWeight
              };
              if (targetSwimlane) {
                toSet[swimlaneField] = targetSwimlane.id;
              }
              if (client.features.taskDrag.reorderTaskRecords && moveBefore !== void 0) {
                taskStore.move(taskRecord, moveBefore);
              }
              taskRecord.set(toSet);
            });
            if (!client.features.taskDrag.reorderTaskRecords && !client.taskSorterFn) {
              client.project.taskStore.sort();
            }
          }
          client.resumeDomTransition();
          client.trigger("taskDrop", { drag, event: domEvent, taskRecords, targetSwimlane, targetColumn, moveBefore, domEvent });
          client.trigger("taskDragEnd", { drag, taskRecords, domEvent });
          client.element.classList.remove("b-dragging-task");
          for (const taskRecord of taskRecords) {
            taskRecord.instanceMeta(client).dragging = false;
          }
          resolve();
        }
        const cardClones = Array.from(proxy.children);
        proxy.classList.add("b-pre-dropping");
        cardClones[0].offsetWidth;
        proxy.classList.add("b-dropping");
        cardClones.forEach((cardClone, i) => {
          const dropClone = dropIndicators[i];
          DomHelper.alignTo(
            cardClone,
            // Ignore page scroll when trying to align element in float root to element in taskboard
            Rectangle.from(dropClone, void 0, true)
          );
        });
        if (DomHelper.getPropertyTransitionDuration(cardClones[0], "transform")) {
          EventHelper.onTransitionEnd({
            element: cardClones[0],
            property: "transform",
            handler: commit,
            thisObj: client
            // For timer cleanup
          });
        } else {
          commit();
        }
      });
    }
  }
  dragLeave(drag) {
    drag.dropIndicators.forEach((dropIndicator) => {
      const { taskElement } = dropIndicator.elementData;
      taskElement.parentElement.insertBefore(dropIndicator, taskElement);
    });
  }
  doAbort(drag) {
    const { client } = this.owner, { dropIndicators, proxy, taskRecords } = drag;
    if (proxy) {
      let finalizeAbort = function() {
        proxy.remove();
        dropIndicators.forEach((dropIndicator) => {
          dropIndicator.elementData.taskElement.classList.remove("b-drag-original");
          dropIndicator.remove();
        });
        client.element.classList.remove("b-dragging-task");
        for (const taskRecord of taskRecords) {
          taskRecord.instanceMeta(client).dragging = false;
        }
        client.trigger("taskDragAbortFinalized");
      };
      const cardClones = Array.from(proxy.children);
      proxy.classList.add("b-dropping");
      dropIndicators.forEach((dropIndicator) => {
        const { taskElement } = dropIndicator.elementData;
        dropIndicator.classList.remove("b-invalid");
        taskElement.parentElement.insertBefore(dropIndicator, taskElement);
      });
      cardClones.forEach((cardClone, i) => {
        DomHelper.alignTo(
          cardClone,
          // Ignore page scroll when trying to align element in float root to element in taskboard
          Rectangle.from(dropIndicators[i], void 0, true)
        );
      });
      if (DomHelper.getPropertyTransitionDuration(cardClones[0], "transform")) {
        EventHelper.onTransitionEnd({
          element: cardClones[0],
          property: "transform",
          handler: finalizeAbort,
          thisObj: client
          // For timer cleanup
        });
      } else {
        finalizeAbort();
      }
    }
    client.trigger("taskDragAbort", { drag, taskRecords });
    if (drag.wasStarted) {
      client.trigger("taskDragEnd", { drag, taskRecords });
    }
  }
  dragEnd(drag) {
    if ((drag.started || drag.wasStarted) && (!drag.valid || drag.aborted)) {
      this.doAbort(drag);
    }
  }
};
TaskDrag._$name = "TaskDrag";

// lib/TaskBoard/feature/TaskDragSelect.js
var TaskDragSelect = class extends TaskBoardFeature {
  constructor() {
    super(...arguments);
    __publicField(this, "state", "idle");
  }
  //region Type assertions
  changeDragThreshold(threshold) {
    ObjectHelper.assertNumber(threshold, "features.taskDragSelect.dragThreshold");
    return threshold;
  }
  //endregion
  initializeDragSelect(event) {
    const me = this, { client } = me;
    me.bounds = Rectangle.from(
      client.bodyElement,
      /* ignorePageScroll = */
      true
    );
    me.element = DomHelper.createElement({
      tag: "div",
      className: "b-dragselect-rect"
    }, { returnAll: true })[0];
    client.floatRoot.appendChild(me.element);
    client.element.classList.add("b-dragselecting");
    const cardElements = Array.from(client.element.querySelectorAll(".b-taskboard-card:not(.b-dragging-item)"));
    me.cardRectangles = cardElements.flatMap((el) => {
      const record = client.resolveTaskRecord(el);
      return record ? {
        rectangle: Rectangle.from(
          el,
          /* ignorePageScroll = */
          true
        ),
        record
      } : [];
    });
    if (!event.ctrlKey) {
      client.deselectAll();
    }
    client.navigateable = false;
    me.state = "selecting";
  }
  // Select cards intersected by the selection marquee
  updateSelection() {
    const { cardRectangles, rectangle, client } = this;
    for (let i = 0, len = cardRectangles.length; i < len; i++) {
      const cardData = cardRectangles[i], shouldSelect = rectangle.intersect(cardData.rectangle, true);
      if (shouldSelect && !cardData.selected) {
        cardData.selected = true;
        client.selectTask(cardData.record, true);
      } else if (!shouldSelect && cardData.selected) {
        cardData.selected = false;
        client.deselectTask(cardData.record);
      }
    }
  }
  //region Listeners
  onColumnMouseDown({ event }) {
    const me = this;
    if (!me.disabled && event.button === 0) {
      me.state = "considering";
      me.startX = event.clientX;
      me.startY = event.clientY;
      me.mouseUpDetacher = EventHelper.on({
        element: document,
        mouseup: "onMouseUp",
        thisObj: me
      });
    }
  }
  onMouseMove({ event }) {
    const me = this, { startX, startY } = me, { clientX, clientY } = event;
    if (me.state === "considering") {
      const deltaX = Math.abs(clientX - startX), deltaY = Math.abs(clientY - startY);
      if (deltaX > me.dragThreshold || deltaY > me.dragThreshold) {
        me.initializeDragSelect(event);
      }
    }
    if (me.state === "selecting") {
      const { element, bounds } = me, x = Math.max(clientX, bounds.left), y = Math.max(clientY, bounds.top), left = Math.min(startX, x), top = Math.min(startY, y), width = Math.abs(startX - x), height = Math.abs(startY - y), rect = new Rectangle(left, top, width, height).constrainTo(bounds);
      DomHelper.setTranslateXY(element, rect.left, rect.top);
      element.style.width = rect.width + "px";
      element.style.height = rect.height + "px";
      me.rectangle = rect;
      me.updateSelection();
    }
  }
  onMouseUp() {
    var _a, _b;
    const me = this, { client, state } = me;
    if (state === "selecting") {
      (_a = me.element) == null ? void 0 : _a.remove();
      client.element.classList.remove("b-dragselecting");
      client.setTimeout(() => client.navigateable = true, 100);
    }
    if (state === "selecting" || state === "considering") {
      me.state = "idle";
      me.startX = me.startY = me.rectangle = me.bounds = null;
    }
    (_b = me.mouseUpDetacher) == null ? void 0 : _b.call(me);
  }
  //endregion
};
__publicField(TaskDragSelect, "$name", "TaskDragSelect");
__publicField(TaskDragSelect, "type", "taskDragSelect");
__publicField(TaskDragSelect, "configurable", {
  /**
   * The amount of pixels to move pointer/mouse before it counts as a drag select operation.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    features : {
   *        taskDragSelect : {
   *            dragThreshold : 10
   *        }
   *    }
   * });
   * ```
   *
   * @config {Number}
   * @default
   */
  dragThreshold: 5
});
__publicField(TaskDragSelect, "pluginConfig", {
  chain: ["onColumnMouseDown", "onMouseMove"]
});
TaskDragSelect.initClass();
TaskDragSelect._$name = "TaskDragSelect";

// lib/TaskBoard/widget/mixin/TaskBoardLinked.js
var TaskBoardLinked_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get taskBoard() {
      return this._taskBoard || this.up((widget) => widget.isTaskBoardBase) || Widget.query((widget) => widget.isTaskBoardBase);
    }
    changeTaskBoard(taskBoard) {
      if (taskBoard && !taskBoard.isTaskBoard) {
        throw new Error(`The taskBoard config only accepts an instance of TaskBoard or a subclass thereof`);
      }
      return taskBoard;
    }
  }, __publicField(_a, "$name", "TaskBoardLinked"), __publicField(_a, "configurable", {
    /**
     * Auto detected when used within a TaskBoard. If you add the widget elsewhere, it will try to find an instance
     * of TaskBoard on page. If that fails you have to supply this config to connect it to a TaskBoard manually.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({});
     *
     * const picker = new ColumnPickerButton({
     *    taskBoard // Link it to the taskBoard instance created above
     * });
     * ```
     *
     * @config {TaskBoard.view.TaskBoard}
     * @category Common
     */
    taskBoard: null
  }), _a;
};

// lib/TaskBoard/widget/base/ColorBoxCombo.js
var ColorBoxCombo = class extends Combo.mixin(TaskBoardLinked_default) {
  afterConstruct() {
    if (!this.showBoxForNoColor && !this.value) {
      this.element.classList.add("b-colorless");
    }
  }
  syncInputFieldValue(...args) {
    const me = this, { color } = me.record || {};
    let className = "b-colorbox";
    if (color) {
      if (DomHelper.isNamedColor(color)) {
        className += ` b-taskboard-color-${color}`;
      } else {
        me.colorBox.style.color = color;
      }
    }
    me.colorBox.className = className;
    if (!me.showBoxForNoColor) {
      me.element.classList.toggle("b-colorless", !color);
    }
    super.syncInputFieldValue(...args);
  }
  get innerElements() {
    return [
      {
        reference: "colorBox",
        className: "b-colorbox"
      },
      ...super.innerElements
    ];
  }
};
__publicField(ColorBoxCombo, "$name", "ColorBoxCombo");
__publicField(ColorBoxCombo, "type", "colorboxcombo");
__publicField(ColorBoxCombo, "configurable", {
  displayField: "text",
  valueField: "id",
  editable: false,
  showBoxForNoColor: false,
  listItemTpl({ text, color }) {
    let html = StringHelper.encodeHtml(text);
    if (color) {
      if (DomHelper.isNamedColor(color)) {
        html = `<div class="b-colorbox b-taskboard-color-${color}"></div>` + html;
      } else {
        html = `<div class="b-colorbox" style="color : ${color}"></div>` + html;
      }
    }
    return html;
  },
  picker: {
    cls: "b-colorbox-picker"
  }
});
ColorBoxCombo._$name = "ColorBoxCombo";

// lib/TaskBoard/widget/ColumnCombo.js
var ColumnCombo = class extends ColorBoxCombo {
  changeStore() {
    return this.taskBoard.columns.chain();
  }
};
__publicField(ColumnCombo, "$name", "ColumnCombo");
__publicField(ColumnCombo, "type", "columncombo");
ColumnCombo.initClass();
ColumnCombo._$name = "ColumnCombo";

// lib/TaskBoard/widget/ResourcesCombo.js
var ResourcesCombo = class extends Combo.mixin(TaskBoardLinked_default) {
  get innerElements() {
    if (this.peekConfig("multiSelect") || this._multiSelect) {
      return super.innerElements;
    }
    return [
      { reference: "avatarContainer" },
      this.inputElement
    ];
  }
  syncInputFieldValue(...args) {
    const me = this;
    if (!me.multiSelect) {
      const resourceRecord = me.record;
      if (resourceRecord) {
        DomSync.sync({
          targetElement: me.avatarContainer,
          domConfig: {
            className: "b-resourcescombo-avatar-container",
            children: [
              me.avatarRendering.getResourceAvatar({
                resourceRecord,
                initials: resourceRecord.initials,
                color: resourceRecord.color,
                iconCls: resourceRecord.iconCls,
                imageUrl: resourceRecord.image === false ? null : resourceRecord.imageUrl || (me.taskBoard.resourceImagePath || "") + (resourceRecord.image || ""),
                dataset: {
                  btip: StringHelper.encodeHtml(resourceRecord.name)
                }
              })
            ]
          }
        });
      }
    }
    super.syncInputFieldValue(...args);
  }
  changeStore() {
    return this.taskBoard.project.resourceStore.chain();
  }
  changeAvatarRendering(value, old) {
    old == null ? void 0 : old.destroy();
    if (value) {
      return new AvatarRendering({
        element: this.element
      });
    }
  }
};
__publicField(ResourcesCombo, "$name", "ResourcesCombo");
__publicField(ResourcesCombo, "type", "resourcescombo");
__publicField(ResourcesCombo, "configurable", {
  displayField: "name",
  valueField: "id",
  multiSelect: true,
  editable: false,
  listItemTpl(resourceRecord) {
    const { avatarRendering, taskBoard } = this.owner;
    return DomHelper.createElement(avatarRendering.getResourceAvatar({
      resourceRecord,
      initials: resourceRecord.initials,
      color: resourceRecord.color,
      iconCls: resourceRecord.iconCls,
      imageUrl: resourceRecord.image === false ? null : resourceRecord.imageUrl || (taskBoard.resourceImagePath || "") + (resourceRecord.image || "")
    })).outerHTML + StringHelper.encodeHtml(resourceRecord.name);
  },
  picker: {
    cls: "b-resources-picker"
  },
  chipView: {
    scrollable: null,
    itemTpl(resourceRecord) {
      const { avatarRendering, taskBoard } = this.owner;
      return DomHelper.createElement(avatarRendering.getResourceAvatar({
        resourceRecord,
        initials: resourceRecord.initials,
        color: resourceRecord.color,
        iconCls: resourceRecord.iconCls,
        imageUrl: resourceRecord.image === false ? null : resourceRecord.imageUrl || (taskBoard.resourceImagePath || "") + (resourceRecord.image || ""),
        dataset: {
          btip: StringHelper.encodeHtml(resourceRecord.name)
        }
      })).outerHTML;
    }
  },
  avatarRendering: {
    value: true,
    $config: "nullify"
  }
});
ResourcesCombo.initClass();
ResourcesCombo._$name = "ResourcesCombo";

// lib/TaskBoard/widget/SwimlaneCombo.js
var SwimlaneCombo = class extends ColorBoxCombo {
  changeStore() {
    return this.taskBoard.swimlanes.chain();
  }
};
__publicField(SwimlaneCombo, "$name", "SwimlaneCombo");
__publicField(SwimlaneCombo, "type", "swimlanecombo");
SwimlaneCombo.initClass();
SwimlaneCombo._$name = "SwimlaneCombo";

// lib/TaskBoard/widget/TaskColorPicker.js
var TaskColorPicker = class extends ColorPicker {
};
__publicField(TaskColorPicker, "$name", "TaskColorPicker");
__publicField(TaskColorPicker, "type", "taskcolorpicker");
__publicField(TaskColorPicker, "configurable", {
  // These are the colors available by default for TaskBoard
  colorClasses: [
    { color: "red", text: "Red" },
    { color: "pink", text: "Pink" },
    { color: "purple", text: "Purple" },
    { color: "deep-purple", text: "Deep purple" },
    { color: "indigo", text: "Indigo" },
    { color: "blue", text: "Blue" },
    { color: "light-blue", text: "Light blue" },
    { color: "cyan", text: "Cyan" },
    { color: "teal", text: "Teal" },
    { color: "green", text: "Green" },
    { color: "light-green", text: "Light green" },
    { color: "lime", text: "Lime" },
    { color: "yellow", text: "Yellow" },
    { color: "amber", text: "Amber" },
    { color: "orange", text: "Orange" },
    { color: "deep-orange", text: "Deep orange" }
  ],
  colorClassPrefix: "b-taskboard-background-color-",
  /**
   * @hideconfigs colors
   */
  colors: null
});
TaskColorPicker.initClass();
TaskColorPicker._$name = "TaskColorPicker";

// lib/TaskBoard/widget/TaskColorCombo.js
var TaskColorCombo = class extends ColorField {
};
__publicField(TaskColorCombo, "$name", "TaskColorCombo");
__publicField(TaskColorCombo, "type", "taskcolorcombo");
__publicField(TaskColorCombo, "configurable", {
  picker: {
    type: "taskcolorpicker"
  },
  name: "eventColor",
  clearable: true
});
TaskColorCombo.initClass();
TaskColorCombo._$name = "TaskColorCombo";

// lib/TaskBoard/widget/TaskEditor.js
var TaskEditor = class extends Popup.mixin(TaskBoardLinked_default) {
  changeItems(items, old) {
    const { taskBoard } = this, { column, swimlane, resources } = items;
    if (taskBoard) {
      if (column) {
        if (!column.name) {
          column.name = taskBoard.columnField;
        }
        if (!column.label) {
          column.label = StringHelper.capitalize(taskBoard.columnField);
        }
      }
      if (swimlane) {
        if (!taskBoard.swimlaneField || !taskBoard.swimlanes) {
          items.swimlane = null;
        } else {
          if (!swimlane.name) {
            swimlane.name = taskBoard.swimlaneField;
          }
          if (!swimlane.label) {
            swimlane.label = StringHelper.capitalize(taskBoard.swimlaneField);
          }
        }
      }
      if (!taskBoard.project.resourceStore.count) {
        items.resources = null;
      }
      if (taskBoard.project.eventStore.usesSingleAssignment && resources) {
        resources.multiSelect = false;
      }
    } else {
      items.column = items.swimlane = items.resources = null;
    }
    return super.changeItems(items, old);
  }
  processItemsObject(items, namedItems, result) {
    for (const ref in items) {
      const item = items[ref];
      if (item && !("name" in item)) {
        item.name = ref;
      }
    }
    return super.processItemsObject(items, namedItems, result);
  }
  updateAutoUpdateRecord(autoUpdate) {
    this.bbar.hidden = autoUpdate;
  }
  updateRecord(record) {
    super.updateRecord(record);
    if (record) {
      this.element.dataset.taskId = record.id;
    }
  }
  onSaveClick() {
    const me = this, { record, owner } = me, { resources, ...values } = me.values;
    if (me.isValid) {
      if ((owner == null ? void 0 : owner.trigger("beforeSave", { record, values: me.values, editor: me })) === false) {
        return;
      }
      owner == null ? void 0 : owner.trigger("save", { record, values: me.values, editor: me });
      me.close();
      record.set(values);
      if (resources) {
        record.resources = resources;
      }
    }
  }
  onCancelClick() {
    var _a, _b;
    const me = this;
    if (((_a = me.owner) == null ? void 0 : _a.trigger("beforeCancel", { editor: me })) === false) {
      return;
    }
    (_b = me.owner) == null ? void 0 : _b.trigger("cancel", { editor: me });
    me.close();
  }
  onInternalKeyDown(event) {
    const me = this;
    if (me.saveAndCloseOnEnter && !me.readOnly && event.key === "Enter") {
      event.preventDefault();
      if (me.autoUpdateRecord) {
        if (me.isValid) {
          event.target.blur();
          me.close();
        }
      } else {
        me.onSaveClick();
      }
    }
    super.onInternalKeyDown(event);
  }
};
__publicField(TaskEditor, "$name", "TaskEditor");
__publicField(TaskEditor, "type", "taskboardtaskeditor");
__publicField(TaskEditor, "configurable", {
  /**
   * Center the editor in browser viewport space. Defaults to true for desktop browsers using a pointer device
   * @config {Boolean}
   * @default
   * @category Common
   */
  centered: true,
  /**
   * Show an opaque mask below the editor when shown.
   *
   * Clicking the mask closes the editor.
   *
   * @config {Boolean}
   * @default true
   * @category Common
   */
  modal: { closeOnMaskTap: true },
  /**
   * Shows a tool used to close the editor in the header.
   * @config {Boolean}
   * @default
   * @category Common
   */
  closable: true,
  /**
   * By default the editor automatically updates the edited task when a field is changed. Set this to `false`
   * to show Save / Cancel buttons and take manual control of the updating.
   *
   * @config {Boolean}
   * @default
   * @category Common
   */
  autoUpdateRecord: true,
  /**
   * Update fields if the {@link #config-record} changes
   * @config {Boolean}
   */
  autoUpdateFields: true,
  /**
   * True to save and close the editor if ENTER is pressed.
   * (The save part only applies when configured with `autoUpdateRecord : false`)
   *
   * @config {Boolean}
   * @default
   * @category Common
   */
  saveAndCloseOnEnter: true,
  draggable: {
    handleSelector: ".b-panel-header"
  },
  autoShow: false,
  anchor: true,
  closeAction: "destroy",
  scrollAction: "realign",
  title: "L{TaskBoard.editTask}",
  defaults: {
    labelWidth: "30%"
  },
  width: "30em",
  items: {
    name: { type: "text", label: "L{TaskBoard.name}", weight: 100 },
    description: { type: "textarea", label: "L{TaskBoard.description}", height: "5em", weight: 200 },
    resources: { type: "resourcescombo", label: "L{TaskBoard.resources}", weight: 300 },
    color: { type: "taskcolorcombo", label: "L{TaskBoard.color}", name: "eventColor", weight: 400 },
    column: { type: "columncombo", weight: 500 },
    swimlane: { type: "swimlanecombo", weight: 600 }
  },
  bbar: {
    hidden: true,
    items: {
      saveButton: { text: "L{TaskBoard.save}", onClick: "up.onSaveClick", weight: 100 },
      cancelButton: { text: "L{TaskBoard.cancel}", onClick: "up.onCancelClick", weight: 200 }
    }
  },
  // We want to maximize on phones and tablets
  maximizeOnMobile: true
});
TaskEditor.initClass();
TaskEditor._$name = "TaskEditor";

// lib/TaskBoard/feature/TaskEdit.js
var TaskEdit = class extends TaskBoardFeature {
  constructor() {
    super(...arguments);
    __publicField(this, "editor", null);
  }
  doDestroy() {
    var _a;
    (_a = this.editor) == null ? void 0 : _a.destroy();
  }
  //region Type assertions
  changeEditorConfig(editorConfig) {
    ObjectHelper.assertObject(editorConfig, "features.taskEdit.editorConfig");
    return editorConfig;
  }
  changeEditorType(editorType) {
    ObjectHelper.assertString(editorType, "features.taskEdit.editorType");
    return editorType;
  }
  changeItems(items) {
    ObjectHelper.assertObject(items, "features.taskEdit.items");
    return items;
  }
  changeProcessItems(processItems) {
    ObjectHelper.assertFunction(processItems, "features.taskEdit.processItems");
    return processItems;
  }
  //endregion
  /**
   * Edit the supplied task in the task editor.
   *
   * ```javascript
   * taskBoard.editTask(taskStore.first);
   * ```
   *
   * @param {TaskBoard.model.TaskModel} taskRecord Task to edit
   * @param {HTMLElement} [element] Optionally an element to align to, by default it tries to resolve one from the
   * supplied task when the editor is configured to not be centered.
   * @on-owner
   * @category Common
   */
  async editTask(taskRecord, element = null) {
    var _a, _b;
    const me = this, { client } = me, columnRecord = client.getColumn(taskRecord), swimlaneRecord = client.swimlaneField && ((_a = client.swimlanes) == null ? void 0 : _a.getById(taskRecord.getValue(client.swimlaneField)));
    if (me.disabled) {
      return;
    }
    if (await client.trigger("beforeTaskEdit", { taskRecord }) === false) {
      return;
    }
    if (me.isEditing) {
      me.cancelEdit();
    }
    const editorClass = Widget.resolveType(me.editorType), combinedItems = editorClass.mergeConfigs(editorClass.$meta.config.items, me.items), processResult = (_b = me.processItems) == null ? void 0 : _b.call(me, { items: combinedItems, taskRecord, columnRecord, swimlaneRecord });
    if (processResult === false) {
      return;
    }
    const editor = me.editor = editorClass.new({
      items: combinedItems,
      owner: client,
      readOnly: taskRecord.readOnly
    }, me.editorConfig);
    client.trigger("beforeTaskEditShow", { taskRecord, editor });
    editor.record = taskRecord;
    if (editor.centered || !BrowserHelper.isHoverableDevice) {
      editor.show();
    } else {
      Scroller.scrollIntoView(element != null ? element : client.getTaskElement(taskRecord));
      editor.showBy(element != null ? element : client.getTaskElement(taskRecord));
    }
    editor.isVisible && editor.ion({
      hide: me.onEditorHide,
      thisObj: me
    });
  }
  cancelEdit() {
  }
  onActivateTask({ taskRecord, event }) {
    if (!event.defaultPrevented) {
      this.editTask(taskRecord);
    }
  }
  populateTaskMenu({ items, taskRecord }) {
    if (!this.client.readOnly && !this.disabled) {
      items.editTask = {
        text: "L{TaskBoard.editTask}",
        icon: "b-fw-icon b-icon-edit",
        weight: 100,
        onItem: () => this.editTask(taskRecord),
        disabled: taskRecord.readOnly
      };
    }
  }
  onEditorHide() {
    var _a;
    (_a = this.client.getTaskElement(this.editor.record)) == null ? void 0 : _a.focus();
  }
};
__publicField(TaskEdit, "$name", "TaskEdit");
__publicField(TaskEdit, "type", "taskEdit");
__publicField(TaskEdit, "configurable", {
  /**
   * Type of widget to use as the editor. Should point to a subclass of {@link TaskBoard.widget.TaskEditor} or
   * a widget mimicking its API.
   * @config {String}
   * @default
   * @category Customization
   */
  editorType: "taskboardtaskeditor",
  /**
   * Config object merged with the default configuration of the editor (by default a
   * {@link TaskBoard.widget.TaskEditor}).
   *
   * Can be used to configure any aspect of the editor:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     features : {
   *         taskEdit : {
   *             editorConfig : {
   *                 modal    : false,
   *                 centered : false
   *             }
   *         }
   *     }
   * });
   * ```
   * To customize the items in the editor, using {@link #config-items} is preferable.
   * @config {TaskEditorConfig}
   * @category Customization
   */
  editorConfig: {},
  /**
   * Items definition passed on to the configured editor (by default a {@link TaskBoard.widget.TaskEditor}).
   *
   * Can be used to add new items or modify and remove predefined items. To remove, supply `null` as the value.
   *
   * @config {Object<String,ContainerItemConfig|Boolean|null>}
   * @category Customization
   */
  items: {},
  /**
   * A function called before displaying the editor that allows manipulation of its items.
   * Returning `false` from this function prevents the editor from being shown.
   *
   * ```javascript
   * features         : {
   *    taskEdit : {
   *         processItems({ items, taskRecord, columnRecord, swimlaneRecord }) {
   *             // Manipulate existing items here as needed
   *             items.name.label = taskRecord.type === 'task' ? 'Task' : 'Issue';
   *
   *            // Remove column field when editing tasks that are done
   *            if (columnRecord.id === 'done') {
   *                items.column = false
   *            }
   *         }
   *     }
   * },
   * ```
   *
   * @config {Function}
   * @param {Object} context An object with information about the editor being shown
   * @param {Object<String,ContainerItemConfig>} context.items An object containing the editor item configs keyed by ref
   * @param {TaskBoard.model.TaskModel} context.taskRecord Record representing task being edited
   * @param {TaskBoard.model.ColumnModel} context.columnRecord Record representing tasks column
   * @param {TaskBoard.model.SwimlaneModel} context.swimlaneRecord Record representing tasks swimlane
   * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
   * @preventable
   */
  processItems: null
  // /**
  //  * The event that shall trigger showing the editor. Defaults to `eventdblclick`, set to `` or null to disable editing of existing events.
  //  * @config {String}
  //  * @default
  //  * @category Editor
  //  */
  // triggerEvent : 'eventdblclick',
  // /**
  //  * Specify `true` to put the editor in read only mode.
  //  * @config {Boolean}
  //  * @default false
  //  */
  // readOnly : null,
});
__publicField(TaskEdit, "pluginConfig", {
  assign: ["editTask"],
  chain: ["onActivateTask", "populateTaskMenu"]
});
TaskEdit.initClass();
TaskEdit._$name = "TaskEdit";

// lib/TaskBoard/feature/TaskMenu.js
var TaskMenu = class extends ContextMenuBase {
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateTaskMenu");
    return config;
  }
  //region Type assertions
  changeItems(items) {
    ObjectHelper.assertObject(items, "features.taskMenu.items");
    return items;
  }
  changeProcessItems(processItems) {
    ObjectHelper.assertFunction(processItems, "features.taskMenu.processItems");
    return processItems;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning TaskBoard before the context menu is shown for a task.
   * Allows manipulation of the items to show in the same way as in the {@link #config-processItems}.
   *
   * Returning `false` from a listener prevents the menu from being shown.
   *
   * @event taskMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<string,MenuItemConfig>} items Menu item configs
   * @param {TaskBoard.model.TaskModel} taskRecord The task
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard after the context menu is shown for a task.
   * @event taskMenuShow
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<string,MenuItemConfig>} items Menu item configs
   * @param {TaskBoard.model.TaskModel} taskRecord The task
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard when an item is selected in the task context menu.
   * @event taskMenuItem
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {TaskBoard.model.TaskModel} taskRecord The task
   * @on-owner
   */
  /**
   * This event fires on the owning TaskBoard when a check item is toggled in the task context menu.
   * @event taskMenuToggleItem
   * @on-owner
   * @param {TaskBoard.view.TaskBoard} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {TaskBoard.model.TaskModel} taskRecord The task
   * @param {Boolean} checked Checked or not
   * @on-owner
   */
  //endregion
  updateTriggerEvent(triggerEvent) {
    this.detachListeners("triggerEvent");
    if (triggerEvent) {
      this.client.ion({
        name: "triggerEvent",
        [triggerEvent]: "onTriggerEvent",
        thisObj: this
      });
    }
  }
  doDisable(disable) {
    super.doDisable(disable);
    !this.isConfiguring && this.client.recompose();
  }
  onTriggerEvent({ event }) {
    this.internalShowContextMenu(event);
  }
  /**
   * Show the context menu for a specific task, aligned to its card. Optionally aligned to an element in the card, using the supplied CSS selector.
   *
   * @param {TaskBoard.model.TaskModel} taskRecord Task to show the menu for
   * @param {String} [selector] CSS selector, to align to a specific element in the task's card
   */
  showMenuFor(taskRecord, selector = ".b-taskboard-task-menu") {
    const targetElement = this.client.getTaskElement(taskRecord), buttonElement = targetElement.querySelector(selector), eventParams = { taskRecord, columnRecord: this.client.getColumn(taskRecord), targetElement };
    let alignSpec = null;
    if (buttonElement) {
      eventParams.targetElement = buttonElement;
      alignSpec = {
        target: buttonElement
      };
    }
    this.showContextMenu(eventParams, alignSpec);
  }
  showContextMenu(eventParams, ...args) {
    if (!this.client.isSelected(eventParams.taskRecord)) {
      this.client.selectTask(eventParams.taskRecord);
    }
    super.showContextMenu(eventParams, ...args);
  }
  getDataFromEvent(event) {
    return ObjectHelper.assign(super.getDataFromEvent(event), event.taskBoardData);
  }
  populateTaskMenu({ items, taskRecord }) {
    var _a;
    const { client, disabled } = this;
    if (!client.readOnly && !disabled) {
      const { columnField, swimlaneField, selectedTasks } = client, { resourceStore, eventStore } = client.project, isSelected = selectedTasks.includes(taskRecord);
      items.column = {
        text: `L{TaskBoard.changeColumn} ${columnField}`,
        icon: "b-fw-icon b-icon-move-left-right",
        weight: 300,
        disabled: taskRecord.readOnly,
        menu: client.columns.map((col) => ({
          ref: col.id,
          text: StringHelper.encodeHtml(col.text),
          cls: "b-column-menu-item",
          isColumn: true,
          checked: taskRecord.getValue(columnField) === col.id,
          // Close menu when task is moved to a new column, looks weird to keep it open
          closeParent: true
        })),
        onItem({ item }) {
          if (item.isColumn) {
            taskRecord.setValue(columnField, item.ref);
            item.parent.items.forEach((sibling) => {
              if (sibling !== item) {
                sibling.checked = false;
              }
            });
          }
        }
      };
      if (((_a = client.swimlanes) == null ? void 0 : _a.count) && swimlaneField) {
        items.swimlane = {
          text: StringHelper.xss`L{TaskBoard.changeSwimlane} ${swimlaneField}`,
          icon: "b-fw-icon b-icon-move-up-down",
          weight: 400,
          disabled: taskRecord.readOnly,
          menu: client.swimlanes.map((lane) => ({
            ref: lane.id,
            text: StringHelper.encodeHtml(lane.text),
            isSwimlane: true,
            checked: taskRecord.getValue(swimlaneField) === lane.id,
            // Close menu when task is moved to a new swimlane, looks weird to keep it open
            closeParent: true
          })),
          onItem({ item }) {
            if (item.isSwimlane) {
              taskRecord.setValue(swimlaneField, item.ref);
              item.parent.items.forEach((sibling) => {
                if (sibling !== item) {
                  sibling.checked = false;
                }
              });
            }
          }
        };
      }
      if (resourceStore.count) {
        items.resources = {
          text: "L{TaskBoard.resources}",
          icon: "b-fw-icon b-icon-user",
          weight: 200,
          disabled: taskRecord.readOnly,
          menu: resourceStore.map(
            (resource) => {
              var _a2;
              const avatar = (_a2 = this.avatarRendering) == null ? void 0 : _a2.getResourceAvatar({
                resourceRecord: resource,
                initials: resource.initials,
                color: resource.color,
                iconCls: resource.iconCls,
                imageUrl: resource.imageUrl || (client.resourceImagePath || "") + (resource.image || "")
              });
              return {
                ref: resource.id,
                cls: "b-resource-menu-item",
                text: avatar ? {
                  className: "b-resource-menu-item-inner",
                  children: [
                    avatar,
                    StringHelper.encodeHtml(resource.name)
                  ]
                } : StringHelper.encodeHtml(resource.name),
                resource,
                checked: taskRecord.resources.includes(resource),
                // Only allow single pick in single assignment mode
                toggleGroup: eventStore.usesSingleAssignment ? "single" : null
              };
            }
          ),
          onItem({ item }) {
            if (item.resource) {
              taskRecord[item.checked ? "assign" : "unassign"](item.resource);
            }
          }
        };
      }
      items.removeTask = {
        text: isSelected && selectedTasks.length > 1 ? "L{TaskBoard.removeTasks}" : "L{TaskBoard.removeTask}",
        icon: "b-fw-icon b-icon-trash",
        cls: "b-separator",
        weight: 500,
        disabled: taskRecord.readOnly,
        onItem: () => client.removeTask(isSelected ? selectedTasks : taskRecord)
      };
    }
  }
  get showMenu() {
    return true;
  }
  updateShowAvatars(value) {
    var _a;
    (_a = this.avatarRendering) == null ? void 0 : _a.destroy();
    if (value) {
      this.avatarRendering = new AvatarRendering({
        element: this.client.element
      });
    }
  }
};
__publicField(TaskMenu, "$name", "TaskMenu");
__publicField(TaskMenu, "type", "taskMenu");
__publicField(TaskMenu, "configurable", {
  /**
   * A function called before displaying the menu that allows manipulations of its items.
   * Returning `false` from this function prevents the menu from being shown.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *   features         : {
   *       taskMenu : {
   *           processItems({ taskRecord, items }) {
   *              // Add a custom menu item for tasks with progress greater than 90
   *              if (taskRecord.progress > 90) {
   *                  items.close = {
   *                      text : 'Close',
   *                      icon : 'b-fa-fw b-fa-check',
   *                      onItem({ taskRecord }) {
   *                          taskRecord.done = true;
   *                      }
   *                  }
   *              }
   *           }
   *       }
   *   }
   * });
   * ```
   *
   * @config {Function}
   * @param {Object} context An object with information about the menu being shown
   * @param {TaskBoard.model.TaskModel} context.taskRecord The task for which the menu will be shown
   * @param {Object<string,MenuItemConfig|Boolean>} context.items An object containing the
   *   {@link Core.widget.MenuItem menu item} configs keyed by their id
   * @param {Event} context.event The DOM event object that triggered the show
   * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
   * @preventable
   */
  processItems: null,
  /**
   * This is a preconfigured set of items used to create the default context menu.
   *
   * The `items` provided by this feature are listed in the intro section of this class. You can configure
   * existing items by passing a configuration object to the keyed items.
   *
   * To remove existing items, set corresponding keys to `null`:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     features : {
   *         taskMenu : {
   *             items : {
   *                 editTask : null
   *             }
   *         }
   *     }
   * });
   * ```
   *
   * See the feature config in the above example for details.
   *
   * @config {Object<string,MenuItemConfig|Boolean|null>} items
   */
  items: null,
  type: "task",
  /**
   * The mouse / touch gesture which should show this context menu (e.g. 'taskClick' or 'taskContextMenu').
   * Set to `false` to never trigger it from UI.
   * @default
   * @config {String|Boolean}
   */
  triggerEvent: "taskContextMenu",
  /**
   * Show avatars/initials in the resource picker menu
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     features : {
   *         taskMenu : {
   *             showAvatars : false
   *         }
   *     }
   * });
   * ```
   *
   * @config {Boolean}
   * @default true
   */
  showAvatars: {
    value: true,
    $config: "nullify"
  },
  menu: {
    align: "t90-b90",
    anchor: true
  }
  /**
   * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<string,string>} keyMap
   */
  /**
   * @hideconfigs type
   */
});
TaskBoardFeature.register(TaskMenu.type, TaskMenu);
TaskMenu._$name = "TaskMenu";

// lib/TaskBoard/feature/TaskTooltip.js
var TaskTooltip = class extends TaskBoardFeature {
  //region Type assertions
  changeTemplate(template) {
    ObjectHelper.assertFunction(template, "features.taskTooltip.template");
    return template;
  }
  //endregion
  doDisable(disable) {
    super.doDisable(disable);
    if (this._tooltip) {
      this.tooltip.disabled = disable;
    }
  }
  changeTooltip(tooltip, oldTooltip) {
    const me = this, { client } = me;
    ObjectHelper.assertObject(tooltip, "features.taskTooltip.tooltip");
    oldTooltip == null ? void 0 : oldTooltip.destroy();
    if (tooltip) {
      return new Tooltip(ObjectHelper.assign({
        axisLock: "flexible",
        cls: "b-taskboard-tooltip",
        forSelector: ".b-taskboardbase:not(.b-draghelper-active) .b-taskboard-card",
        scrollAction: "realign",
        forElement: client.element,
        showOnHover: true,
        hoverDelay: 0,
        hideDelay: 100,
        anchorToTarget: true,
        allowOver: Boolean(me.config.items || me.config.tools),
        getHtml: me.getTipHtml.bind(me),
        disabled: me.disabled,
        textContent: false
      }, tooltip));
    }
  }
  getTipHtml({ tip, activeTarget }) {
    const { client } = this, taskRecord = client.resolveTaskRecord(activeTarget), columnRecord = client.resolveColumnRecord(activeTarget), swimlaneRecord = client.resolveSwimlaneRecord(activeTarget);
    if (this.template) {
      return this.template({ tip, taskRecord, columnRecord, swimlaneRecord, activeTarget });
    }
    const children = [
      {
        class: "b-taskboard-tooltip-title",
        text: taskRecord.name
      },
      {
        class: "b-taskboard-tooltip-label",
        text: StringHelper.capitalize(client.columnField)
      },
      {
        class: "b-taskboard-tooltip-value",
        text: columnRecord.text
      }
    ];
    if (swimlaneRecord) {
      children.push(
        {
          class: "b-taskboard-tooltip-label",
          text: StringHelper.capitalize(client.swimlaneField)
        },
        {
          class: "b-taskboard-tooltip-value",
          text: swimlaneRecord.text
        }
      );
    }
    if (taskRecord.resources.length) {
      children.push(
        {
          class: "b-taskboard-tooltip-label",
          text: this.L("L{TaskBoard.resources}")
        },
        {
          class: "b-taskboard-tooltip-value",
          text: taskRecord.resources.map((resourceRecord) => resourceRecord.name).join(", ")
        }
      );
    }
    return {
      children
    };
  }
  render() {
    this.getConfig("tooltip");
  }
};
__publicField(TaskTooltip, "$name", "TaskTooltip");
__publicField(TaskTooltip, "type", "taskTooltip");
__publicField(TaskTooltip, "configurable", {
  /**
   * Tooltip config object used to override the defaults, see {@link Core.widget.Tooltip#configs} for available
   * configs.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     features : {
   *         taskTooltip : {
   *             tooltip : {
   *                 hoverDelay : 100,
   *                 hideDelay  : 500
   *             }
   *         }
   *     }
   * });
   * ```
   *
   * @config {TooltipConfig}
   */
  tooltip: {
    value: {},
    // Lazy, pulled in on render to have element available
    $config: ["lazy", "nullify"]
  },
  /**
   * Function used to populate the tooltip, supply your own to override the default contents of the tooltip.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     features : {
   *         taskTooltip : {
   *             template({ taskRecord }) {
   *                 return `<b>${taskRecord.name}</b>`
   *             }
   *         }
   *     }
   * });
   * ```
   *
   * @param {Object} tipData
   * @param {TaskBoard.model.TaskModel} tipData.taskRecord Hovered task
   * @param {TaskBoard.model.ColumnModel} tipData.columnRecord The task's column
   * @param {TaskBoard.model.SwimlaneModel} tipData.swimlaneRecord The task's swimlane (if used)
   * @returns {String|DomConfig} Return an HTML string or a DOM config object
   * @config {Function}
   */
  template: null
});
__publicField(TaskTooltip, "pluginConfig", {
  chain: ["render"]
});
TaskTooltip.initClass();
TaskTooltip._$name = "TaskTooltip";

// lib/TaskBoard/model/ColumnModel.js
var ColumnModel = class extends Model {
  /**
   * Get the tasks in this column in visual order.
   * @property {TaskBoard.model.TaskModel[]}
   * @readonly
   */
  get tasks() {
    return this.taskBoard.getColumnTasks(this, true);
  }
  get taskBoard() {
    return this.firstStore.taskBoard;
  }
  /**
   * Collapse this column.
   *
   * Uses a transition by default, await the call to be certain that it has finished.
   *
   * @category Expand/collapse
   * @returns {Promise} A promise which is resolved when the column is collapsed
   */
  async collapse() {
    return this.taskBoard.collapse(this);
  }
  /**
   * Expand this column.
   *
   * Uses a transition by default, await the call to be certain that it has finished.
   *
   * @category Expand/collapse
   * @returns {Promise} A promise which is resolved when the column is expanded
   */
  async expand() {
    return this.taskBoard.expand(this);
  }
};
__publicField(ColumnModel, "$name", "ColumnModel");
__publicField(ColumnModel, "fields", [
  /**
   * This column's unique id, used to match a task to a column (which field on a task to match is specified using
   * then {@link TaskBoard.view.TaskBoardBase#config-columnField} config on TaskBoard).
   * @field {String|Number} id
   */
  /**
   * Text displayed in the column header.
   * @field {String} text
   */
  "text",
  /**
   * A tooltip string to show when hovering the column header
   * @field {String} tooltip
   */
  "tooltip",
  /**
   * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
   * class to the column. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the column.
   *
   * By default it does not visually affect the UI, but it applies a color to the column that applications can
   * leverage using `currentColor` to style it in the desired way.
   *
   * Using named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     columns : [
   *         { id : 'todo', text : 'Todo', color : 'orange', tooltip : 'These are items to be done' }
   *     ]
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-column b-taskboard-color-orange">
   * ```
   *
   * Which can the be used for example like:
   *
   * ```css
   * .b-taskboard-column-header {
   *     border-left : 5px solid currentColor; // where currentColor is the color defined by b-taskboard-color-orange
   * }
   * ```
   *
   * Using non-named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     columns : [
   *         { id : 'todo', text : 'Todo', color : 'hsl(229deg 66% 42%)' }
   *     ]
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-column" style="color: hsl(229deg 66% 42%)">
   * ```
   *
   * Predefined named colors (actual color might vary by theme):
   * <div class="b-colorbox b-inline b-taskboard-color-red"></div>red,
   * <div class="b-colorbox b-inline b-taskboard-color-pink"></div>pink,
   * <div class="b-colorbox b-inline b-taskboard-color-purple"></div>purple,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-purple"></div>deep-purple,
   * <div class="b-colorbox b-inline b-taskboard-color-indigo"></div>indigo,
   * <div class="b-colorbox b-inline b-taskboard-color-blue"></div>blue,
   * <div class="b-colorbox b-inline b-taskboard-color-light-blue"></div>light-blue,
   * <div class="b-colorbox b-inline b-taskboard-color-cyan"></div>cyan,
   * <div class="b-colorbox b-inline b-taskboard-color-teal"></div>teal,
   * <div class="b-colorbox b-inline b-taskboard-color-green"></div>green,
   * <div class="b-colorbox b-inline b-taskboard-color-light-green"></div>light-green,
   * <div class="b-colorbox b-inline b-taskboard-color-lime"></div>lime,
   * <div class="b-colorbox b-inline b-taskboard-color-yellow"></div>yellow,
   * <div class="b-colorbox b-inline b-taskboard-color-amber"></div>amber,
   * <div class="b-colorbox b-inline b-taskboard-color-orange"></div>orange,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-orange"></div>deep-orange
   *
   * @field {String} color
   */
  { name: "color", type: "string" },
  /**
   * Number of tasks per row to display in this column. Leave blank to use the setting from the
   * {@link TaskBoard.view.TaskBoardBase#config-tasksPerRow} config on TaskBoard.
   * @field {Number} tasksPerRow
   */
  "tasksPerRow",
  /**
   * Allow collapsing this column
   * @field {Boolean} collapsible=true
   */
  { name: "collapsible", type: "boolean", defaultValue: true },
  /**
   * Collapsed (`true`) or expanded (`false`)
   *
   * To expand or collapse, use {@link #function-expand} and  {@link #function-collapse} functions.
   *
   * @field {Boolean} collapsed
   * @readonly
   */
  { name: "collapsed", type: "boolean" },
  /**
   * Set to `true` to hide the column, `false` to show it again.
   * @field {Boolean} hidden
   */
  { name: "hidden", type: "boolean" },
  /**
   * Column width in px.
   * @field {Number} width
   */
  { name: "width", type: "number" },
  /**
   * Column flex, affects width.
   * @field {Number} flex
   */
  { name: "flex", type: "number" },
  /**
   * Column min-width in px. To override the default min-width specified in CSS.
   * @field {Number} minWidth
   */
  { name: "minWidth", type: "number" }
]);
ColumnModel._$name = "ColumnModel";

// lib/TaskBoard/model/TaskModel.js
var TaskModel = class extends EventModel {
};
__publicField(TaskModel, "$name", "TaskModel");
__publicField(TaskModel, "fields", [
  /**
   * Task status, for example for linking to a column on the TaskBoard.
   *
   * @field {String} status
   */
  "status",
  /**
   * Task priority, for example for linking to a swimlane on the TaskBoard.
   *
   * @field {String|Number} prio
   */
  "prio",
  /**
   * Task description, by default shown in tasks body.
   *
   * @field {String} description
   */
  "description",
  /**
   * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
   * class to the tasks card. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the card.
   *
   * If no color is specified, any color defined on the {@link TaskBoard/model/ColumnModel#field-color column} or
   * {@link TaskBoard/model/SwimlaneModel#field-color swimlane} will apply instead.
   *
   * By default it does not visually affect the UI, but it applies a color to the task that applications can
   * leverage using `currentColor` to style it in the desired way.
   *
   * Using named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     project {
   *         tasksData : [
   *             { id : 1, name : 'Important task', eventColor : 'red' }
   *         ]
   *     }
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-card b-taskboard-color-red">
   * ```
   *
   * Which can the be used for example like:
   *
   * ```css
   * .b-taskboard-card {
   *     // currentColor is the color defined by b-red
   *     border-left : 5px solid currentColor;
   * }
   * ```
   *
   * Using non-named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     project {
   *         tasksData : [
   *             { id : 1, name : 'Important task', eventColor : '#ff0000' }
   *         ]
   *     }
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-card" style="color: #ff0000">
   * ```
   *
   * Predefined named colors (actual color might vary by theme):
   * <div class="b-colorbox b-inline b-taskboard-color-red"></div>red,
   * <div class="b-colorbox b-inline b-taskboard-color-pink"></div>pink,
   * <div class="b-colorbox b-inline b-taskboard-color-purple"></div>purple,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-purple"></div>deep-purple,
   * <div class="b-colorbox b-inline b-taskboard-color-indigo"></div>indigo,
   * <div class="b-colorbox b-inline b-taskboard-color-blue"></div>blue,
   * <div class="b-colorbox b-inline b-taskboard-color-light-blue"></div>light-blue,
   * <div class="b-colorbox b-inline b-taskboard-color-cyan"></div>cyan,
   * <div class="b-colorbox b-inline b-taskboard-color-teal"></div>teal,
   * <div class="b-colorbox b-inline b-taskboard-color-green"></div>green,
   * <div class="b-colorbox b-inline b-taskboard-color-light-green"></div>light-green,
   * <div class="b-colorbox b-inline b-taskboard-color-lime"></div>lime,
   * <div class="b-colorbox b-inline b-taskboard-color-yellow"></div>yellow,
   * <div class="b-colorbox b-inline b-taskboard-color-amber"></div>amber,
   * <div class="b-colorbox b-inline b-taskboard-color-orange"></div>orange,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-orange"></div>deep-orange,
   * <div class="b-colorbox b-inline b-taskboard-color-gray"></div>gray,
   * <div class="b-colorbox b-inline b-taskboard-color-light-gray"></div>light-gray
   *
   * @field {'red'|'pink'|'purple'|'deep-purple'|'indigo'|'blue'|'light-blue'|'cyan'|'teal'|'green'|'light-green'|'lime'|'yellow'|'amber'|'orange'|'deep-orange'|'gray'|'light-gray'|String|null} eventColor
   */
  "eventColor",
  /**
   * Task weight, used by default to determine its index in a column. Higher weights are displayed further down.
   *
   * The weight is applied as a default sorter to the {@link TaskBoard/store/TaskStore}.
   *
   * When no weights are defined, task order is determined by store order.
   *
   * @field {Number} weight
   */
  { name: "weight", type: "number" },
  /**
   * Set to `true` to make the task read-only, preventing it from being edited in the UI.
   *
   * See the class description above for a live demo.
   *
   * @field {Boolean} readOnly
   */
  { name: "readOnly", type: "boolean" }
]);
TaskModel._$name = "TaskModel";

// lib/TaskBoard/store/TaskStore.js
var TaskStore = class extends EventStore {
  afterLoadData() {
    const { records } = this;
    if (this.autoAssignWeight && !records.some((r) => r.weight != null)) {
      for (let i = 0; i < records.length; i++) {
        records[i].setData("weight", (i + 1) * 100);
      }
    }
  }
};
__publicField(TaskStore, "configurable", {
  autoAssignWeight: true,
  storeId: "tasks",
  /**
   * Class used to represent records, defaults to {@link TaskBoard.model.TaskModel}
   * @config {TaskBoard.model.TaskModel}
   * @typings {typeof TaskModel}
   * @category Common
   */
  modelClass: TaskModel,
  /**
   * Configure with `true` to also remove the event when removing the last assignment from the linked
   * AssignmentStore.
   *
   * Defaults to `false` for TaskBoard since it is unexpected that a tasks disappears when unassigning the last
   * resource from it.
   *
   * @config {Boolean}
   * @default
   * @category Common
   */
  removeUnassignedEvent: false,
  /**
   * Initial sorters, format is `[{ field: 'name', ascending: false }, ...]`.
   *
   * By default the TaskStore is sorted by `weight`, tasks with higher weights are displayed further down.
   *
   * @config {Sorter[]|String[]}
   * @category Common
   */
  sorters: [
    { field: "weight", ascending: true }
  ]
});
TaskStore._$name = "TaskStore";

// lib/TaskBoard/model/ProjectModel.js
var ProjectModel2 = class extends ProjectModel.mixin(ProjectCrudManager_default) {
  construct(config) {
    if (config.tasks) {
      config.eventsData = config.tasks;
    }
    if (config.tasksData) {
      config.eventsData = config.tasksData;
    }
    if (config.taskStore) {
      config.eventStore = config.taskStore;
    }
    if (config.taskModelClass) {
      config.eventModelClass = config.taskModelClass;
    }
    if (config.taskStoreClass) {
      config.eventStoreClass = config.taskStoreClass;
    }
    super.construct(config);
    const me = this;
    me.addPrioritizedStore(me.assignmentStore);
    me.addPrioritizedStore(me.resourceStore);
    me.addPrioritizedStore(me.taskStore);
  }
  get taskStore() {
    return this.eventStore;
  }
  set taskStore(store) {
    this.eventStore = store;
  }
  get tasksData() {
    return this.eventsData;
  }
  set tasksData(data) {
    this.eventsData = data;
  }
  get tasks() {
    return this.eventsData;
  }
  set tasks(data) {
    this.events = data;
  }
  /**
   * Returns the data from the records of the projects stores, in a format that can be consumed by `loadInlineData()`.
   *
   * Used by JSON.stringify to correctly convert this project to json.
   *
   * ```javascript
   * const project = new ProjectModel({
   *     tasksData       : [...],
   *     resourcesData   : [...],
   *     assignmentsData : [...]
   * });
   *
   * const json = project.toJSON();
   *
   * // Result:
   * {
   *     taskData : [...],
   *     resourcesData : [...],
   *     assignmentsData : [...]
   * }
   * ```
   *
   * Output can be consumed by `loadInlineData()`:
   *
   * ```javascript
   * const json = project.toJSON();
   *
   * // Plug it back in later
   * project.loadInlineData(json);
   * ```
   *
   * @returns {Object}
   * @category JSON
   */
  toJSON() {
    const { taskStore, assignmentStore, resourceStore } = this, result = {
      tasksData: taskStore.toJSON()
    };
    if (assignmentStore == null ? void 0 : assignmentStore.count) {
      result.assignmentsData = assignmentStore.toJSON();
    }
    if (resourceStore == null ? void 0 : resourceStore.count) {
      result.resourcesData = resourceStore.toJSON();
    }
    return result;
  }
};
__publicField(ProjectModel2, "configurable", {
  /**
   * Get/set {@link #property-taskStore} data.
   *
   * Always returns an array of {@link TaskBoard.model.TaskModel} but also accepts an array of
   * its configuration objects as input.
   *
   * @member {TaskBoard.model.TaskModel[]} tasks
   * @accepts {TaskBoard.model.TaskModel[]|TaskModelConfig[]}
   * @category Inline data
   */
  /**
   * The initial data, to fill the {@link #property-taskStore} with. Should be an array of
   * {@link TaskBoard.model.TaskModel} or its configuration objects.
   *
   * @config {TaskBoard.model.TaskModel[]|TaskModelConfig[]} tasks
   * @category Inline data
   */
  /**
   * The initial data, to fill the {@link #property-taskStore} with.
   * Should be an array of {@link TaskBoard.model.TaskModel} instances or its configuration objects.
   *
   * @config {TaskBoard.model.TaskModel[]|TaskModelConfig[]} tasksData
   * @category Legacy inline data
   */
  /**
   * The {@link TaskBoard.store.TaskStore store} holding the tasks information.
   *
   * See also {@link TaskBoard.model.TaskModel}
   *
   * @member {TaskBoard.store.TaskStore} taskStore
   * @category Models & Stores
   */
  /**
   * An {@link TaskBoard.store.TaskStore} instance or a config object.
   * @config {TaskStoreConfig|TaskBoard.store.TaskStore} taskStore
   * @category Models & Stores
   */
  /**
   * @hideconfigs timeRanges
   *              timeRangeStore,
   *              timeRangesData,
   *              timeRangeStoreClass,
   *              resourceTimeRanges,
   *              resourceTimeRangeStore,
   *              resourceTimeRangesData,
   *              resourceTimeRangeStoreClass,
   *              eventStoreClass,
   *              eventModelClass
   */
  /**
   * @hideproperties timeRangeStore,
   *                 resourceTimeRangeStore
   */
  eventStoreClass: TaskStore,
  eventModelClass: TaskModel,
  /**
   * The constructor to create a task store instance with.
   * Should be a class, subclassing the {@link TaskBoard.store.TaskStore}.
   * @config {TaskBoard.store.TaskStore}
   * @typings {typeof TaskStore}
   * @category Models & Stores
   */
  taskStoreClass: TaskStore,
  /**
   * The constructor of the task model class, to be used in the project.
   * Will be set as the {@link Core.data.Store#config-modelClass modelClass}
   * property of the {@link #property-taskStore}.
   * @config {TaskBoard.model.TaskModel}
   * @typings {typeof TaskModel}
   * @category Models & Stores
   */
  taskModelClass: TaskModel
});
ProjectModel2._$name = "ProjectModel";

// lib/TaskBoard/model/SwimlaneModel.js
var SwimlaneModel = class extends Model {
  get taskBoard() {
    return this.firstStore.taskBoard;
  }
  /**
   * Collapse this swimlane.
   *
   * Uses a transition by default, await the call to be certain that it has finished.
   *
   * @category Expand/collapse
   * @returns {Promise} A promise which is resolved when the column is collapsed
   */
  async collapse() {
    this.taskBoard.collapse(this);
  }
  /**
   * Expand this swimlane.
   *
   * Uses a transition by default, await the call to be certain that it has finished.
   *
   * @category Expand/collapse
   * @returns {Promise} A promise which is resolved when the column is expanded
   */
  async expand() {
    return this.taskBoard.expand(this);
  }
  /**
   * Get tasks in this swimlane.
   * @property {TaskBoard.model.TaskModel[]}
   * @readonly
   */
  get tasks() {
    return [...this.taskBoard.getSwimlaneTasks(this) || []];
  }
};
__publicField(SwimlaneModel, "$name", "SwimlaneModel");
__publicField(SwimlaneModel, "fields", [
  /**
   * The swimlane's unique id, used to match a task to a swimlane (which field on a task to match is specified
   * using then {@link TaskBoard.view.TaskBoardBase#config-swimlaneField} config on TaskBoard).
   * @field {String|Number} id
   */
  /**
   * Text displayed in the swimlane header.
   * @field {String} text
   */
  { name: "text", type: "string" },
  /**
   * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
   * class to the swimlane. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the swilane.
   *
   * By default it does not visually affect the UI, but it applies a color to the swimlane that applications can
   * leverage using `currentColor` to style it in the desired way.
   *
   * Using named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     swimlanes : [
   *         { id : 'high', text : 'High', color : 'red' }
   *     ]
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-swimlane b-taskboard-color-red">
   * ```
   *
   * Which can the be used for example like:
   *
   * ```css
   * .b-taskboard-swimlane-header {
   *     border-left : 5px solid currentColor; // where currentColor is the color defined by b-red
   * }
   * ```
   *
   * Using non-named colors:
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *     swimlanes : [
   *         { id : 'high', text : 'High', color : 'hsl(229deg 66% 42%)' }
   *     ]
   * });
   * ```
   *
   * Will result in:
   *
   * ```html
   * <div class="b-taskboard-swimlane" style="color: hsl(229deg 66% 42%)">
   * ```
   *
   * Predefined named colors (actual color might vary by theme):
   * <div class="b-colorbox b-inline b-taskboard-color-red"></div>red,
   * <div class="b-colorbox b-inline b-taskboard-color-pink"></div>pink,
   * <div class="b-colorbox b-inline b-taskboard-color-purple"></div>purple,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-purple"></div>deep-purple,
   * <div class="b-colorbox b-inline b-taskboard-color-indigo"></div>indigo,
   * <div class="b-colorbox b-inline b-taskboard-color-blue"></div>blue,
   * <div class="b-colorbox b-inline b-taskboard-color-light-blue"></div>light-blue,
   * <div class="b-colorbox b-inline b-taskboard-color-cyan"></div>cyan,
   * <div class="b-colorbox b-inline b-taskboard-color-teal"></div>teal,
   * <div class="b-colorbox b-inline b-taskboard-color-green"></div>green,
   * <div class="b-colorbox b-inline b-taskboard-color-light-green"></div>light-green,
   * <div class="b-colorbox b-inline b-taskboard-color-lime"></div>lime,
   * <div class="b-colorbox b-inline b-taskboard-color-yellow"></div>yellow,
   * <div class="b-colorbox b-inline b-taskboard-color-amber"></div>amber,
   * <div class="b-colorbox b-inline b-taskboard-color-orange"></div>orange,
   * <div class="b-colorbox b-inline b-taskboard-color-deep-orange"></div>deep-orange
   *
   * @field {String} color
   */
  { name: "color", type: "string" },
  /**
   * Allow collapsing this swimlane
   * @field {Boolean} collapsible=true
   */
  { name: "collapsible", type: "boolean", defaultValue: true },
  /**
   * Collapsed (true) or expanded (False).
   *
   * To expand or collapse, use TaskBoards {@link TaskBoard.view.mixin.ExpandCollapse#function-expand} and
   * {@link TaskBoard.view.mixin.ExpandCollapse#function-collapse} functions.
   *
   * @field {Boolean} collapsed
   * @readonly
   */
  { name: "collapsed", type: "boolean" },
  /**
  * Set to `true` to hide the swimlane, `false` to show it again.
  * @field {Boolean} hidden
  */
  { name: "hidden", type: "boolean" },
  /**
   * Swimlane height in px.
   * @field {Number} height
   */
  { name: "height", type: "number" },
  /**
   * Swimlane flex, affects height.
   * @field {Number} flex
   */
  { name: "flex", type: "number" },
  /**
   * Number of tasks per row to display in this swimlane. Leave blank to use the setting from the
   * {@link TaskBoard.view.TaskBoardBase#config-tasksPerRow} config on TaskBoard.
   * @field {Number} tasksPerRow
   */
  "tasksPerRow"
]);
SwimlaneModel._$name = "SwimlaneModel";

// lib/TaskBoard/view/mixin/ExpandCollapse.js
var ExpandCollapse_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeShowCollapseInHeader(showCollapseInHeader) {
      ObjectHelper.assertBoolean(showCollapseInHeader, "showCollapseInHeader");
      return showCollapseInHeader;
    }
    //endregion
    //region Events
    /**
     * Triggered when a column is expanded.
     *
     * @event columnExpand
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     */
    /**
     * Triggered when a column is collapsed.
     *
     * @event columnCollapse
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     */
    /**
     * Triggered when the column collapsed state is toggled.
     *
     * @event columnToggle
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     * @param {Boolean} collapse `true` if the column is being collapsed.
     */
    /**
     * Triggered when a swimlane is expanded.
     *
     * @event swimlaneExpand
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     */
    /**
     * Triggered when a swimlane is collapsed.
     *
     * @event swimlaneCollapse
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     */
    /**
     * Triggered when the swimlane collapsed state is toggled.
     *
     * @event swimlaneToggle
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {Boolean} collapse `true` if the column is being collapsed.
     */
    //endregion
    //region Toggling
    /**
     * Collapse a swimlane or column.
     *
     * Await the call to be certain that the collapse transition has ended.
     *
     * ```javascript
     * await taskBoard.collapse(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @category Expand & collapse
     */
    async collapse(record) {
      return this.toggleCollapse(record, true);
    }
    /**
     * Expand a swimlane or column.
     *
     * Await the call to be certain that the expand transition has ended.
     *
     * ```javascript
     * await taskBoard.expand(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @category Expand & collapse
     */
    async expand(record) {
      return this.toggleCollapse(record, false);
    }
    /**
     * Expand or collapse a swimlane or column.
     *
     * Await the call to be certain that the expand/collapse transition has ended.
     *
     * ```javascript
     * // Toggle
     * await taskBoard.toggleCollapse(taskBoard.columns.first);
     * // Force collapse
     * await taskBoard.toggleCollapse(taskBoard.columns.first, true);
     * // Force expand
     * await taskBoard.toggleCollapse(taskBoard.columns.first, false);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @param {Boolean} [collapse] Specify to force a certain state, leave out to toggle
     * @category Expand & collapse
     * @fires columnCollapse
     * @fires columnExpand
     * @fires columnToggle
     * @fires swimlaneCollapse
     * @fires swimlaneExpand
     * @fires swimlaneToggle
     */
    async toggleCollapse(record, collapse = !record.collapsed) {
      if (record.isSwimlaneModel) {
        await this.toggleSwimlaneCollapse(record, collapse);
      } else {
        await this.toggleColumnCollapse(record, collapse);
      }
    }
    async toggleSwimlaneCollapse(swimlaneRecord, collapse = !swimlaneRecord.collapsed) {
      return new Promise((resolve) => {
        const me = this, swimlaneElement = me.getSwimlaneElement(swimlaneRecord), swimlaneBody = DomSync.getChild(swimlaneElement, "body");
        if (collapse) {
          swimlaneBody.style.height = `${swimlaneBody.getBoundingClientRect().height}px`;
        }
        EventHelper.onTransitionEnd({
          element: swimlaneBody,
          property: "height",
          handler() {
            if (collapse) {
              swimlaneElement.style.height = "";
            } else {
              swimlaneBody.style.height = "";
              swimlaneElement.style.height = `${swimlaneRecord.height}px`;
            }
            swimlaneElement.classList.remove(collapse ? "b-collapsing" : "b-expanding");
            me.recompose.flush();
            resolve();
          },
          thisObj: me
        });
        swimlaneElement.classList.add(collapse ? "b-collapsing" : "b-expanding");
        me.suspendDomTransition();
        swimlaneRecord.collapsed = collapse;
        me.trigger(`swimlane${collapse ? "Collapse" : "Expand"}`, { swimlaneRecord });
        me.trigger("swimlaneToggle", { swimlaneRecord, collapse });
        me.resumeDomTransition();
      });
    }
    async toggleColumnCollapse(columnRecord, collapse = !columnRecord.collapsed) {
      return new Promise((resolve) => {
        var _a2, _b;
        const me = this, { documentRoot } = me, columnElements = me.getColumnElements(columnRecord), headerElement = DomSync.getChild(me.bodyElement, `header.${columnRecord.domId}`), hasFixedWidth = columnRecord.width && !columnRecord.flex, cardElements = documentRoot.querySelectorAll(`.b-taskboard-card[data-column="${columnRecord.domId}"]`), cardWidth = `${(_a2 = cardElements[0]) == null ? void 0 : _a2.getBoundingClientRect().width}px`, columnWidth = `${(_b = columnElements[0]) == null ? void 0 : _b.getBoundingClientRect().width}px`;
        cardElements.forEach((card) => {
          if (collapse) {
            card.style.width = cardWidth;
          }
        });
        columnElements.unshift(headerElement);
        columnElements.forEach((element) => {
          if (collapse) {
            if (!hasFixedWidth) {
              element.style.width = columnWidth;
            }
            element.classList.add("b-collapsing");
          } else {
            element.classList.add("b-expanding");
          }
        });
        EventHelper.onTransitionEnd({
          element: headerElement,
          property: "width",
          handler() {
            cardElements.forEach((card) => {
              if (!collapse) {
                card.style.width = "";
              }
            });
            columnElements.forEach((element) => {
              if (!collapse) {
                if (!hasFixedWidth) {
                  element.style.width = "";
                }
                element.classList.remove("b-expanding");
              } else {
                element.classList.remove("b-collapsing");
              }
            });
            me.recompose.flush();
            me.scrollable.syncOverflowState();
            resolve();
          },
          thisObj: me
        });
        headerElement.offsetWidth;
        me.suspendDomTransition();
        columnRecord.collapsed = collapse;
        me.trigger(`column${collapse ? "Collapse" : "Expand"}`, { columnRecord });
        me.trigger("columnToggle", { columnRecord, collapse });
        me.resumeDomTransition();
      });
    }
    //endregion
    //region Rendering
    // Inject expander icon + expand/collapsed state cls in column headers
    populateColumnHeader(args) {
      var _a2;
      (_a2 = super.populateColumnHeader) == null ? void 0 : _a2.call(this, args);
      const { showCollapseInHeader, collapseTitle, hasSwimlanes, showCollapseTooltip } = this, { columnRecord, columnHeaderConfig } = args, { text, collapsed, collapsible } = columnRecord;
      DomHelper.merge(columnHeaderConfig, {
        class: {
          "b-collapsed": collapsed,
          "b-rotate-title": collapsed && !collapseTitle && !hasSwimlanes
        },
        style: {
          minWidth: collapsed ? null : columnRecord.minWidth
        },
        children: {
          padder: {
            children: {
              expander: showCollapseInHeader && collapsible && {
                tag: "button",
                class: {
                  "b-taskboard-column-expander": 1,
                  "b-fw-icon": 1,
                  "b-icon-expand-column": 1
                },
                dataset: {
                  btip: showCollapseTooltip ? StringHelper.xss`${this.L(collapsed ? "L{TaskBoard.expand}" : "L{TaskBoard.collapse}", text)}` : null
                }
              }
            }
          }
        }
      });
    }
    // Inject expand/collapsed state cls in columns
    populateColumn(args) {
      var _a2;
      (_a2 = super.populateColumn) == null ? void 0 : _a2.call(this, args);
      const { columnRecord, columnConfig } = args, { collapsed } = columnRecord;
      columnConfig.class["b-collapsed"] = collapsed;
      if (collapsed) {
        columnConfig.style.minWidth = null;
      }
    }
    // Inject expander icon + expand/collapsed state cls in swimlanes
    populateSwimlane(args) {
      var _a2;
      (_a2 = super.populateColumn) == null ? void 0 : _a2.call(this, args);
      const { swimlaneRecord, swimlaneConfig } = args;
      if (swimlaneRecord) {
        const { showCollapseInHeader, showCollapseTooltip } = this, { text, collapsed, collapsible } = swimlaneRecord;
        DomHelper.merge(swimlaneConfig, {
          class: {
            "b-collapsed": collapsed,
            "b-collapsible": collapsible
          },
          children: {
            header: {
              children: {
                title: {
                  children: {
                    // Before text
                    "expander > text": showCollapseInHeader && collapsible && {
                      tag: "button",
                      class: {
                        "b-taskboard-swimlane-expander": 1,
                        "b-icon": 1,
                        "b-icon-expand-row": 1
                      },
                      dataset: {
                        btip: showCollapseTooltip ? StringHelper.xss`${this.L(collapsed ? "L{TaskBoard.expand}" : "L{TaskBoard.collapse}", text)}` : null
                      }
                    }
                  }
                }
              }
            },
            body: {
              [collapsed ? "inert" : null]: true
            }
          }
        });
      }
    }
    //endregion
    //region Listeners
    onColumnHeaderClick({ event, columnRecord }) {
      if (event.target.matches(".b-taskboard-column-expander") || columnRecord.collapsed) {
        this.toggleCollapse(columnRecord);
      }
    }
    onColumnClick({ columnRecord }) {
      if (columnRecord.collapsed) {
        this.toggleCollapse(columnRecord);
      }
    }
    onSwimlaneHeaderClick({ swimlaneRecord }) {
      this.toggleCollapse(swimlaneRecord);
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "ExpandCollapse"), __publicField(_a, "configurable", {
    /**
     * Show an icon to expand/collapse columns and swimlanes in their headers.
     *
     * Programmatic expand/collapse works independently of this setting, it only affects the UI.
     *
     * @config {Boolean}
     * @default
     * @category Common
     */
    showCollapseInHeader: true,
    /**
     * Specify `true` to hide the column title instead of rotating it on collapse.
     *
     * Used by default with swimlanes, since the title will overlap the swimlane header otherwise.
     *
     * @config {Boolean}
     * @default
     * @category Misc
     */
    collapseTitle: false,
    /**
     * By default, a tooltip showing `Expand XX`/`Collapse XX` is shown when hovering the expand/collapse icon for
     * a column or swimlane. To disable the tooltip, set this to `false`.
     * @prp {Boolean}
     * @default
     * @category Misc
     */
    showCollapseTooltip: true
  }), _a;
};

// lib/TaskBoard/view/mixin/ResponsiveCards.js
var ResponsiveCards_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    constructor() {
      super(...arguments);
      //endregion
      //region Suspend/resume responsiveness
      __publicField(this, "responsivenessSuspended", 0);
    }
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeCardSizes(cardSizes) {
      ObjectHelper.assertArray(cardSizes, "cardSizes");
      return cardSizes;
    }
    suspendResponsiveness() {
      this.responsivenessSuspended++;
    }
    resumeResponsiveness() {
      this.responsivenessSuspended--;
    }
    //endregion
    //region Calculate card size
    // Get a card size entity, very similar to a responsive level in Grid
    getCardSize(columnRecord, swimlaneRecord) {
      const me = this, { cardSizes } = me, perRow = me.getTasksPerRow(columnRecord, swimlaneRecord), columnWidth = me.getColumnWidth(columnRecord), cardWidth = (columnWidth - me.cardGap * (perRow - 1)) / perRow;
      return (cardSizes == null ? void 0 : cardSizes.find((size) => cardWidth < size.maxWidth)) || (cardSizes == null ? void 0 : cardSizes[cardSizes.length - 1]);
    }
    // Get the last reported width for a column, set by the ResizeObserver
    getColumnWidth(columnRecord) {
      return columnRecord.instanceMeta(this).width;
    }
    // Number of tasks per row to render for the requested column / swimlane intersection.
    // Prio order is columns config, swimlanes config and lastly taskboards config
    getTasksPerRow(columnRecord, swimlaneRecord) {
      return columnRecord.tasksPerRow || (swimlaneRecord == null ? void 0 : swimlaneRecord.tasksPerRow) || this.tasksPerRow;
    }
    //endregion
    //region ResizeObserver
    // ResizeObserver callback for column size changes
    onChildResize(entries) {
      const me = this;
      if (me.recompose.suspended || me.responsivenessSuspended) {
        return;
      }
      let shouldRecompose = false;
      for (const entry of entries) {
        const { target, contentRect } = entry;
        if (target.observedWidth !== contentRect.width) {
          const columnRecord = me.resolveColumnRecord(target), columnElements = columnRecord && me.columns.includes(columnRecord) && me.getColumnElements(columnRecord);
          if (!columnRecord || columnRecord.collapsed || columnRecord.hidden || !columnElements) {
            return;
          }
          columnRecord.instanceMeta(me).width = target.observedWidth = contentRect.width;
          for (const columnElement of columnElements) {
            const swimlaneRecord = me.resolveSwimlaneRecord(columnElement), cardSize = me.getCardSize(columnRecord, swimlaneRecord);
            if (cardSize && columnElement.elementData.cardSize !== cardSize.name) {
              shouldRecompose = true;
            }
          }
        }
      }
      if (shouldRecompose) {
        me.recompose.now();
        me.scrollable.syncOverflowState();
      }
    }
    // ResizeObserver used to monitor column size, observing set up in domSyncCallback
    changeResizeObserver(observer, oldObserver) {
      oldObserver == null ? void 0 : oldObserver.disconnect();
      return this.isDestroying || !ResizeObserver ? null : new ResizeObserver(this.onChildResize.bind(this));
    }
    //endregion
    //region Rendering
    populateColumn(args) {
      var _a2;
      (_a2 = super.populateColumn) == null ? void 0 : _a2.call(this, args);
      const { columnRecord, swimlaneRecord, columnConfig } = args, cardSize = args.cardSize = this.getCardSize(columnRecord, swimlaneRecord);
      if (cardSize) {
        columnConfig.class[`b-${cardSize.name}-cards`] = cardSize;
        columnConfig.elementData.cardSize = cardSize.name;
      }
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "ResponsiveCards"), __publicField(_a, "configurable", {
    /**
     * An array of {@link CardSize} objects to use as responsive levels based on card widths.
     *
     * By default, the following levels are defined:
     *
     * | Width | Name   | Cls            | Avatars | Items                       |
     * |-------|--------|----------------|---------|-----------------------------|
     * | < 50  | micro  | b-micro-cards  | 1       | Only resource avatars shown |
     * | < 75  | tiny   | b-tiny-cards   | 1       | Body text hidden            |
     * | < 175 | small  | b-small-cards  | 2       | Body text hidden            |
     * | < 300 | medium | b-medium-cards | 3       |                             |
     * | > 300 | large  | b-large-cards  | 7       |                             |
     *
     * @config {CardSize}
     * @category Common
     */
    cardSizes: [
      {
        maxWidth: 50,
        name: "micro",
        maxAvatars: 1,
        headerItems: {
          text: null
        },
        bodyItems: {
          text: null
        }
      },
      {
        maxWidth: 75,
        name: "tiny",
        maxAvatars: 1,
        bodyItems: {
          text: null
        }
      },
      {
        maxWidth: 175,
        name: "small",
        maxAvatars: 2,
        bodyItems: {
          text: null
        }
      },
      { maxWidth: 250, name: "medium", maxAvatars: 3 },
      { name: "large", maxAvatars: 7 }
    ],
    resizeObserver: {
      value: true,
      $config: ["nullify"]
    }
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardColumns.js
var transitionChangeActions = {
  remove: 1,
  move: 1,
  update: 1,
  filter: 1
};
var TaskBoardColumns_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeAutoGenerateColumns(autoGenerateColumns) {
      ObjectHelper.assertBoolean(autoGenerateColumns, "autoGenerateColumns");
      return autoGenerateColumns;
    }
    changeColumnField(columnField) {
      ObjectHelper.assertString(columnField, "columnField");
      return columnField;
    }
    //endregion
    //region Config - columnField
    updateColumnField(field, old) {
      if (old) {
        const { storage } = this.project.taskStore;
        if (old !== this.swimlaneField) {
          storage.removeIndex(old);
        }
        storage.addIndex({ property: field, unique: false });
      }
      this.shouldAutoGenerateColumns = field && this.autoGenerateColumns;
    }
    //endregion
    //region Config - columns
    changeColumns(columns) {
      return Store.from(columns, { objectify: true, modelClass: ColumnModel }, (column) => {
        if (typeof column === "string") {
          return { id: column, text: StringHelper.capitalize(column) };
        }
        return column;
      });
    }
    updateColumns(columns) {
      this.detachListeners("columns");
      if (columns) {
        (columns.$store || columns).taskBoard = this;
        columns.ion({
          change: "onColumnsChange",
          refresh: "onColumnsChange",
          thisObj: this
        });
      }
    }
    get columns() {
      const me = this, { taskStore } = me.project;
      if (me.shouldAutoGenerateColumns && taskStore.count) {
        me.columns = taskStore.getDistinctValues(me.columnField).sort();
        me.shouldAutoGenerateColumns = false;
      }
      return me._columns;
    }
    onColumnsChange({ action }) {
      if (action === "add" || action === "remove" || action === "removeAll" || action === "update") {
        this.project.taskStore.storage.invalidateIndices();
      }
      if (transitionChangeActions[action]) {
        const options = {};
        if (action === "update" || action === "remove") {
          options.addTransition = { width: 1, opacity: 1 };
          options.removeTransition = { width: 1, opacity: 1 };
        }
        this.recomposeWithDomTransition(options);
      } else {
        this.recompose();
      }
    }
    //endregion
    //region Data
    getColumnTasks(columnRecord, inVisualOrder = false) {
      const me = this, { taskStore } = me.project, set = taskStore.storage.findItem(me.columnField, columnRecord.id), tasks = set ? [...set] : [];
      if (inVisualOrder && set) {
        if (me.swimlanes) {
          const { swimlaneField } = me, swimlanes = me.swimlanes.map((r) => r.id);
          tasks.sort((a, b) => {
            const swimlaneDelta = swimlanes.indexOf(a[swimlaneField]) - swimlanes.indexOf(b[swimlaneField]);
            if (swimlaneDelta !== 0) {
              return swimlaneDelta;
            }
            if (a.weight != null || b.weight != null) {
              return a.weight - b.weight;
            }
            return taskStore.indexOf(a) - taskStore.indexOf(b);
          });
          if (swimlanes.length && swimlaneField) {
            return tasks.filter((task) => swimlanes.includes(task[swimlaneField]));
          }
        } else {
          tasks.sort((a, b) => a.weight - b.weight);
        }
      }
      return tasks;
    }
    getColumn(taskRecord) {
      return this.columns.getById(taskRecord.getValue(this.columnField));
    }
    // Next task in the same column as supplied task
    getNextTask(taskRecord, wrap = true) {
      const columnRecord = this.getColumn(taskRecord), columnTasks = columnRecord.tasks;
      let nextTaskIndex = columnTasks.indexOf(taskRecord) + 1;
      if (nextTaskIndex === columnTasks.length) {
        if (wrap) {
          nextTaskIndex = 0;
        } else {
          return null;
        }
      }
      return columnTasks[nextTaskIndex];
    }
    // Prev task in the same column as supplied task
    getPreviousTask(taskRecord, wrap = true) {
      const columnRecord = this.getColumn(taskRecord), columnTasks = columnRecord.tasks;
      let prevTaskIndex = columnTasks.indexOf(taskRecord) - 1;
      if (prevTaskIndex < 0) {
        if (wrap) {
          prevTaskIndex = columnTasks.length - 1;
        } else {
          return null;
        }
      }
      return columnTasks[prevTaskIndex];
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardColumns"), __publicField(_a, "configurable", {
    /**
     * Store containing the TaskBoard columns.
     *
     * @member {Core.data.Store} columns
     * @category Common
     */
    /**
     * Store containing the TaskBoard columns. A tasks {@link #config-columnField} is matched against the `id` of a
     * column to determine in which column it is displayed.
     *
     * Accepts an array of column records/objects/strings, a store instance, a store id or a store config object
     * used to create a new store.
     *
     * When supplying an array, a store configured with {Core.data.mixin.StoreProxy#config-objectify} is
     * automatically created. Using that config allows for a nicer interaction syntax with the columns:
     *
     * ```javascript
     * // Without objectify:
     * taskBoard.columns.getById('done').text = 'Finished';
     *
     * // With objectify:
     * taskBoard.columns.done.text = 'Finished';
     * ```
     *
     * When supplying strings, the raw string will be used as the columns `id` and a capitalized version of it is
     * used as the columns text:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *    columns : [
     *        'doing',
     *        'done'
     *    ]
     * });
     * ```
     *
     * Is equivalent to:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *    columns : [
     *        { id : 'doing', text : 'Doing' },
     *        { id : 'done', text : 'Done' }
     *    ]
     * });
     * ```
     *
     * @config {TaskBoard.model.ColumnModel[]|ColumnModelConfig[]|String[]|Core.data.Store|String|StoreConfig}
     * @category Common
     */
    columns: {},
    /**
     * Set to `true` to auto generate columns when {@link #config-columns} is undefined.
     *
     * A column will be created for each distinct value of {@link #config-columnField} on the tasks. The columns
     * will be sorted in alphabetical order. The following snippet will yield two columns, Q1 and Q2:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    columnField : 'quarter',
     *
     *    autoGenerateColumns : true,
     *
     *    project : {
     *        tasksData : [
     *            { id : 1, name : 'Inform tenants', quarter : 'Q1' },
     *            { id : 2, name : 'Renovate roofs', quarter : 'Q2' }
     *        ]
     *    }
     * });
     * ```
     *
     * @config {Boolean}
     * @category Advanced
     */
    autoGenerateColumns: false,
    /**
     * Field on a task record used to determine which column the task belongs to.
     *
     * ```javascript
     * taskBoard.columnField = 'category';
     * ```
     *
     * @member {String} columnField
     * @category Common
     */
    /**
     * Field on a task record used to determine which column the task belongs to.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    columnField : 'status',
     *
     *    columns : [
     *        'todo',
     *        'done'
     *    ],
     *
     *    project : {
     *        tasksData : [
     *            // Linked using the status field, to the done column
     *            { id : 1, name : 'Fun task', status : 'done' }
     *        ]
     *    }
     * });
     * ```
     *
     * @config {String}
     * @category Common
     */
    columnField: null
  }), __publicField(_a, "properties", {
    shouldAutoGenerateColumns: false
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardDom.js
var TaskBoardDom_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Resolve record from element
    /**
     * Retrieves a task record corresponding to the supplied element. Has to be a `.b-taskboard-card` element or
     * descendant thereof.
     *
     * ```javascript
     * const taskRecord = taskBoard.resolveTaskRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.TaskModel}
     * @category DOM
     */
    resolveTaskRecord(element) {
      var _a2;
      element = element.closest(".b-taskboard-card");
      return element && this.project.taskStore.getById((_a2 = element.elementData) == null ? void 0 : _a2.taskId);
    }
    /**
     * Retrieves a column record resolved from the supplied element. Has to be a `.b-taskboard-column` element or
     * descendant thereof (such as a card).
     *
     * ```javascript
     * const columnRecord = taskBoard.resolveColumnRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.ColumnModel}
     * @category DOM
     */
    resolveColumnRecord(element) {
      var _a2;
      element = element.closest(".b-taskboard-column, .b-taskboard-column-header");
      return element && this.columns.getById((_a2 = element.elementData) == null ? void 0 : _a2.columnId);
    }
    /**
     * Retrieves a swimlane record resolved from the supplied element. Has to be a `.b-taskboard-swimlane` element or
     * descendant thereof.
     *
     * ```javascript
     * const swimlaneRecord = taskBoard.resolveSwimlaneRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.SwimlaneModel}
     * @category DOM
     */
    resolveSwimlaneRecord(element) {
      var _a2;
      element = element.closest(".b-taskboard-swimlane");
      return element && ((_a2 = this.swimlanes) == null ? void 0 : _a2.getById(element.elementData.laneId));
    }
    //endregion
    //region Get element from record
    /**
     * Retrieves the task element (card) corresponding to the supplied task record.
     *
     * ```javascript
     * const cardElement = taskBoard.getTaskElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskElement(taskRecord) {
      const taskColumnElement = this.getTaskColumnElement(taskRecord);
      return taskColumnElement && DomSync.getChild(taskColumnElement, `body.inner.${taskRecord.domId}`);
    }
    /**
     * Retrieves the element for the column that holds the supplied task record.
     *
     * ```javascript
     * const columnElement = taskBoard.getColumnElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskColumnElement(taskRecord) {
      const columnRecord = this.columns.getById(taskRecord.getValue(this.columnField));
      return columnRecord && DomSync.getChild(this.getTaskSwimlaneElement(taskRecord), `body.${columnRecord.domId}`);
    }
    /**
     * Retrieves the element for the swimlane that holds the supplied task record.
     *
     * ```javascript
     * const swimlaneElement = taskBoard.getTaskSwimlaneElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskSwimlaneElement(taskRecord) {
      var _a2, _b;
      const laneId = ((_a2 = this.swimlanes) == null ? void 0 : _a2.count) ? (_b = this.swimlanes.getById(taskRecord.getValue(this.swimlaneField))) == null ? void 0 : _b.domId : "default";
      return DomSync.getChild(this.bodyElement, laneId);
    }
    /**
     * Retrieves the element for the supplied swimlane.
     *
     * ```javascript
     * const swimlaneElement = taskBoard.getSwimlaneElement(taskBoard.swimlanes.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getSwimlaneElement(swimlaneRecord) {
      return DomSync.getChild(this.bodyElement, swimlaneRecord.domId);
    }
    /**
     * Retrieves the element for the supplied swimlane / column intersection.
     *
     * ```javascript
     * const element = taskBoard.getSwimlaneColumnElement(taskBoard.swimlanes.first, taskBoard.columns.last);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getSwimlaneColumnElement(swimlaneRecord, columnRecord) {
      if (swimlaneRecord) {
        return DomSync.getChild(this.getSwimlaneElement(swimlaneRecord), `body.${columnRecord.domId}`);
      } else {
        return this.getColumnElement(columnRecord);
      }
    }
    /**
     * Retrieves the element for the supplied column.
     *
     * Only applicable when not using swimlanes. If you are using swimlanes, see {@link #function-getColumnElements}.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnElement(columnRecord) {
      var _a2;
      return (_a2 = this.getColumnElements(columnRecord)) == null ? void 0 : _a2[0];
    }
    /**
     * Retrieves the elements for the supplied column. When using swimlanes, a column has one element per swimlane.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnElements(columnRecord) {
      var _a2;
      if ((_a2 = this.swimlanes) == null ? void 0 : _a2.count) {
        return this.swimlanes.reduce((result, lane) => {
          if (!lane.hidden) {
            result.push(this.getSwimlaneColumnElement(lane, columnRecord));
          }
          return result;
        }, []);
      }
      return [this.getSwimlaneColumnElement({ domId: "default" }, columnRecord)];
    }
    /**
     * Retrieves the header element for the supplied column.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnHeaderElement(columnRecord) {
      return DomSync.getChild(this.bodyElement, `header.${columnRecord.domId}`);
    }
    //endregion
    //region Position based
    /**
     * Get the card element at (x, y)
     * @param {Number} x
     * @param {Number} y
     * @param {String} cardSelector
     * @returns {HTMLElement}
     * @internal
     */
    getCardAt(x, y, cardSelector2 = ".b-taskboard-card") {
      var _a2;
      return (_a2 = this.documentRoot.elementFromPoint(x, y)) == null ? void 0 : _a2.closest(cardSelector2);
    }
    //endregion
    //region Cached measurements
    cacheCSSVar(name, defaultValue) {
      const me = this;
      let size = me[`_${name}`];
      if (size == null) {
        const value = me.css[name];
        size = DomHelper.measureSize(value || defaultValue, me.element);
        if (value) {
          me[`_${name}`] = size;
        }
      }
      return size;
    }
    // Cached card gap
    get cardGap() {
      return this.cacheCSSVar("cardGap", "1em");
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardDom"), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardDomEvents.js
var TaskBoardDomEvents_default = (Target) => {
  var _a, _hoveredCardElement;
  return _a = class extends (Target || Base) {
    constructor() {
      super(...arguments);
      __privateAdd(this, _hoveredCardElement, null);
    }
    get widgetClass() {
    }
    //endregion
    //region Events
    /**
     * Triggered when a card is clicked.
     *
     * ```javascript
     * taskBoard.on('taskClick', ({ taskRecord }) => {
     *    Toast.show(`Clicked on ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a card is double clicked
     *
     * ```javascript
     * taskBoard.on('taskDblClick', ({ taskRecord }) => {
     *    Toast.show(`Double clicked on ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskDblClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when the mouse enters a card
     *
     * ```javascript
     * taskBoard.on('taskMouseEnter', ({ taskRecord }) => {
     *    Toast.show(`Mouse entered ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskMouseEnter
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when the mouse leaves a card
     *
     * ```javascript
     * taskBoard.on('taskMouseLeave', ({ taskRecord }) => {
     *    Toast.show(`Mouse left ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskMouseLeave
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a task is "activated" by pressing `Enter` or double clicking it.
     *
     * By default this leads to the task editor being shown.
     *
     * ```javascript
     * taskBoard.on('activateTask', ({ taskRecord }) => {
     *    Toast.show(`Activated ${taskRecord.name}`);
     * });
     * ```
     *
     * @event activateTask
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a task is rendered.
     *
     * This happens on initial render, when a task is added or when the task element is updated.
     *
     * Listening to this event allows you to manipulate the tasks element directly after it has been updated. Please
     * note that we strongly recommend using a `taskRenderer` to manipulate the DomConfig used to update the task for
     * most scenarios.
     *
     * If you listen for this event and manipulate the element in some way, you should also listen for
     * `removeTaskElement` and revert/clean up the changes there.
     *
     * @event renderTask
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {TaskBoard.model.TaskModel} taskRecord Task being rendered
     * @param {Boolean} isRefresh `true` if the element was updated, `false` if it was added
     * @param {HTMLElement} element Tasks element
     */
    /**
     * Triggered when all tasks in the task board are rendered
     * @event renderTasks
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {TaskBoard.model.TaskModel[]} taskRecords Tasks being rendered
     */
    /**
     * Triggered when a tasks element is removed.
     *
     * This happens when a task is removed or when it is move to another swimlane / column (in which case a `renderTask`
     * event is triggered for the new element).
     *
     * If you used listener for `renderTask` to alter the element of tasks, you should also listen for this event to
     * clean that modification up.
     *
     * @event removeTaskElement
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {String|Number} taskId Id of the task (not the record itself since it might be removed)
     * @param {HTMLElement} element Tasks element
     */
    /**
     * Triggered when a swimlane header is clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderClick', ({ swimlaneRecord }) => {
     *    Toast.show(`Clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a swimlane header is double-clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderDblClick', ({ swimlaneRecord }) => {
     *    Toast.show(`Double-clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderDblClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a swimlane header is right-clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderContextMenu', ({ swimlaneRecord }) => {
     *    Toast.show(`Right-clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderContextMenu
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    //endregion
    //region Triggering
    // Sets the domListeners up, all relayed to triggerDomEvent()
    changeDomListeners(domListeners) {
      if (domListeners) {
        for (const eventName in this.domEvents) {
          domListeners[eventName] = "triggerDomEvent";
        }
      }
      return domListeners;
    }
    // Resolve records from the passed event
    resolveEvent(event) {
      const { target } = event, taskRecord = this.resolveTaskRecord(target), columnRecord = this.resolveColumnRecord(target), swimlaneRecord = this.resolveSwimlaneRecord(target);
      return { taskRecord, columnRecord, swimlaneRecord, event };
    }
    // "Re-trigger" a dom event as one of ours, populated with records and prefixed with either 'task'  or 'column'
    // depending on event target
    triggerDomEvent(event) {
      const me = this, args = me.resolveEvent(event), name = me.domEvents[event.type], { target } = event;
      if (me.isScrolling || target.closest(".b-widget") !== me._element) {
        return;
      }
      event.taskBoardData = args;
      let result;
      if (args.taskRecord) {
        const eventName = `task${StringHelper.capitalize(name)}`;
        result = me.trigger(eventName, args);
        if (eventName === me.activateTaskEvent && !event.defaultPrevented) {
          me.trigger("activateTask", { taskRecord: args.taskRecord, event });
        }
      } else if (args.columnRecord) {
        if (target.closest(".b-taskboard-column-header")) {
          result = me.trigger(`columnHeader${StringHelper.capitalize(name)}`, args);
        } else {
          result = me.trigger(`column${StringHelper.capitalize(name)}`, args);
        }
      } else if (args.swimlaneRecord) {
        if (target.closest(".b-taskboard-swimlane-header")) {
          result = me.trigger(`swimlaneHeader${StringHelper.capitalize(name)}`, args);
        } else {
          result = me.trigger(`swimlane${StringHelper.capitalize(name)}`, args);
        }
      }
      if (result === false) {
        return;
      }
      me.trigger(name, args);
      if ((name === "mouseOver" || name === "mouseOut") && args.taskRecord) {
        const cardElement = target.closest(".b-taskboard-card");
        if (name === "mouseOver" && cardElement !== __privateGet(me, _hoveredCardElement)) {
          __privateSet(me, _hoveredCardElement, cardElement);
          me.trigger("taskMouseEnter", args);
        }
        if (name === "mouseOut" && !cardElement.contains(event.relatedTarget)) {
          __privateSet(me, _hoveredCardElement, null);
          me.trigger("taskMouseLeave", args);
        }
      }
    }
    // Called as DomSync syncs elements
    domSyncCallback({ action, domConfig, lastDomConfig, targetElement: element, syncId, jsx }) {
      var _a2, _b, _c, _d, _e, _f;
      const me = this, { elementType } = (_a2 = domConfig == null ? void 0 : domConfig.elementData) != null ? _a2 : {}, isRefresh = action === "reuseOwnElement", { reactComponent } = this;
      if (jsx && this.processTaskItemContent) {
        this.processTaskItemContent({
          jsx,
          targetElement: element,
          reactComponent,
          domConfig
        });
        return;
      }
      if (domConfig) {
        if (elementType === "task") {
          const { taskId } = domConfig.elementData, taskRecord = me.project.taskStore.getById(taskId);
          if (action === "newElement") {
            (_b = me.cardIntersectionObserver) == null ? void 0 : _b.observe(element);
          }
          if (action === "newElement" || action === "reuseOwnElement") {
            (!me.isVirtualized || taskRecord.instanceMeta(me).intersects) && me.trigger("renderTask", { taskRecord, element, isRefresh });
          } else if (action === "removeElement") {
            (_c = me.cardIntersectionObserver) == null ? void 0 : _c.unobserve(element);
            me.trigger("removeTaskElement", { taskId, element });
          }
        } else if (elementType === "column") {
          const { columnId, laneId } = domConfig.elementData, columnRecord = me.columns.getById(columnId), swimlaneRecord = laneId != null && ((_d = me.swimlanes) == null ? void 0 : _d.getById(laneId));
          if (action === "newElement" || action === "reuseOwnElement") {
            me.trigger("renderColumn", { columnRecord, swimlaneRecord, element, isRefresh });
          } else if (action === "removeElement") {
            me.trigger("removeColumnElement", { columnId, swimlaneRecord, element });
          }
        } else if (elementType === "swimlane") {
          const { laneId } = domConfig.elementData, swimlaneRecord = laneId != null && laneId !== "default" && ((_e = me.swimlanes) == null ? void 0 : _e.getById(laneId));
          if (laneId !== "default") {
            if (action === "newElement" || action === "reuseOwnElement") {
              me.trigger("renderSwimlane", { swimlaneRecord, element, isRefresh });
            } else if (action === "removeElement") {
              me.trigger("removeSwimlaneElement", { swimlaneId: laneId, element });
            }
          }
        } else if (((_f = domConfig.class) == null ? void 0 : _f["b-taskboard-column-header-padder"]) && me.resizeObserver) {
          if (action === "newElement") {
            if (!element.isResizeObserved) {
              me.resizeObserver.observe(element);
              element.isResizeObserved = true;
            }
          }
          if (action === "removeElement") {
            if (element.isResizeObserved) {
              me.resizeObserver.unobserve(element);
              delete element.isResizeObserved;
            }
          }
        }
      }
    }
    //endregion
    //region Chainable handlers
    onClick() {
    }
    onMouseMove() {
    }
    onMouseUp() {
    }
    onTaskMouseDown() {
    }
    onTaskClick() {
    }
    onTaskDblClick() {
    }
    onTaskContextMenu() {
    }
    onColumnMouseDown() {
    }
    onColumnHeaderClick(...args) {
      super.onColumnHeaderClick(...args);
    }
    onSwimlaneHeaderClick(...args) {
      super.onSwimlaneHeaderClick(...args);
    }
    onActivateTask() {
    }
    //endregion
  }, _hoveredCardElement = new WeakMap(), //region Config
  __publicField(_a, "$name", "TaskBoardDomEvents"), __publicField(_a, "configurable", {
    /**
     * The name of the event that should activate a task and trigger editing (if an editing feature is active).
     * Available options are: 'taskClick', 'taskDblClick' or null (disable)
     * @default
     * @config {'taskClick'|'taskDblClick'|null}
     * @category Advanced
     */
    activateTaskEvent: "taskDblClick",
    domEvents: {
      click: "click",
      dblclick: "dblClick",
      mouseup: "mouseUp",
      mousedown: "mouseDown",
      mousemove: "mouseMove",
      mouseover: "mouseOver",
      mouseout: "mouseOut",
      keydown: "keyDown",
      contextmenu: "contextMenu"
    },
    domListeners: {}
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardScroll.js
var TaskBoardScroll_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Scroll tracking
    onInternalPaint({ firstPaint }) {
      if (firstPaint) {
        const me = this;
        EventHelper.on({
          element: me.element,
          scroll() {
            me.isScrolling = true;
            me.onScrollEnd();
          },
          capture: true,
          thisObj: me
        });
      }
    }
    onScrollEnd() {
      this.isScrolling = false;
      if (this.recomposeOnScrollEnd) {
        this.recompose();
        this.recomposeOnScrollEnd = false;
      }
    }
    //endregion
    //region Type assertions
    changeScrollOptions(scrollOptions) {
      ObjectHelper.assertObject(scrollOptions, "scrollOptions");
      return scrollOptions;
    }
    //endregion
    //region Scroll to
    /**
     * Scroll specified swimlane into view.
     *
     * ```javascript
     * taskBoard.scrollToSwimlane('high');
     * taskBoard.scrollToSwimlane(taskBoard.swimlanes.last);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|Number|String} swimlaneOrId Swimlane or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToSwimlane(swimlaneOrId, options = this.scrollOptions) {
      const swimlane = this.swimlanes.getById(swimlaneOrId), swimlaneElement = swimlane && this.getSwimlaneElement(swimlane);
      if (swimlaneElement) {
        options = ObjectHelper.assign({
          x: false,
          animate: (options == null ? void 0 : options.animate) || (options == null ? void 0 : options.behavior) === "smooth"
        }, options);
        return Scroller.scrollIntoView(swimlaneElement, options, this.rtl);
      }
    }
    /**
     * Scroll specified column into view.
     *
     * ```javascript
     * taskBoard.scrollToColumn('backlog');
     * taskBoard.scrollToColumn(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.ColumnModel|Number|String} columnOrId Column or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToColumn(columnOrId, options = this.scrollOptions) {
      const column = this.columns.getById(columnOrId), columnElement = column && this.getColumnHeaderElement(column);
      if (columnElement) {
        options = ObjectHelper.assign({
          animate: (options == null ? void 0 : options.animate) || (options == null ? void 0 : options.behavior) === "smooth",
          y: false
        }, options);
        return Scroller.scrollIntoView(columnElement, options, this.rtl);
      }
    }
    /**
     * Scroll to the intersection between specified swimlane and column.
     *
     * ```javascript
     * taskBoard.scrollToIntersection('high', 'done');
     * taskBoard.scrollToIntersection(taskBoard.swimlanes.low, taskBoard.columns.todo);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|Number|String} swimlaneOrId Swimlane or its id
     * @param {TaskBoard.model.ColumnModel|Number|String} columnOrId Column or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToIntersection(swimlaneOrId, columnOrId, options = this.scrollOptions) {
      const swimlane = this.swimlanes.getById(swimlaneOrId), column = this.columns.getById(columnOrId), target = swimlane && column && this.getSwimlaneColumnElement(swimlane, column);
      if (target) {
        options = ObjectHelper.assign({
          animate: (options == null ? void 0 : options.animate) || (options == null ? void 0 : options.behavior) === "smooth",
          edgeOffset: 10
        }, options);
        return Scroller.scrollIntoView(target, options, this.rtl);
      }
    }
    /**
     * Scroll the specified task into view.
     *
     * ```javascript
     * taskBoard.scrollToTask(10);
     * taskBoard.scrollToTask(taskStore.first);
     * ```
     *
     * @param {TaskBoard.model.TaskModel|Number|String} taskOrId
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToTask(taskOrId, options = this.scrollOptions) {
      const me = this, taskRecord = me.project.taskStore.getById(taskOrId), taskElement = taskRecord && me.getTaskElement(taskRecord);
      if (taskElement) {
        const edgeOffset = { start: 10, end: 10, top: 10, bottom: 10 };
        if (me.stickyHeaders) {
          if (me.hasSwimlanes) {
            edgeOffset.top += me.getTaskSwimlaneElement(taskRecord).syncIdMap.header.offsetHeight;
          }
          edgeOffset.top += me.bodyElement.syncIdMap.header.offsetHeight;
        }
        if (me.isVirtualized && !me.getTaskHeight) {
          taskElement.scrollIntoView();
          await new Promise((resolve, reject) => {
            const detach = me.ion({
              renderTask({ taskRecord: renderedTaskRecord }) {
                if (renderedTaskRecord === taskRecord) {
                  detach();
                  resolve();
                }
              },
              expires: {
                delay: 200,
                alt: reject
              }
            });
          });
        }
        options = ObjectHelper.assign({
          animate: (options == null ? void 0 : options.animate) || (options == null ? void 0 : options.behavior) === "smooth",
          edgeOffset
        }, options);
        return Scroller.scrollIntoView(taskElement, options, me.rtl);
      }
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardScroll"), __publicField(_a, "configurable", {
    /**
     * Default scroll options, see the options for {@link Core.helper.util.Scroller#function-scrollIntoView}
     *
     * Defaults to:
     *
     * ```javascript
     * scrollOptions : {
     *     animate   : true,
     *     block     : 'nearest',
     *     highlight : true
     * }
     * ```
     *
     * Can be overridden per call for all scroll functions.
     *
     * @config {BryntumScrollOptions}
     * @category Advanced
     */
    scrollOptions: {
      animate: true,
      block: "nearest",
      highlight: true
    },
    testConfig: {
      scrollOptions: {
        animate: false,
        block: "nearest"
      }
    }
  }), __publicField(_a, "delayable", {
    onScrollEnd: VersionHelper.isTestEnv ? 300 : 100
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardStores.js
var TaskBoardStores_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //#region Inline data
    get assignments() {
      return this.project.assignmentStore.records;
    }
    updateAssignments(records) {
      this.project.assignmentStore.data = records;
    }
    get resources() {
      return this.project.resourceStore.records;
    }
    updateResources(records) {
      this.project.resourceStore.data = records;
    }
    get tasks() {
      return this.project.taskStore.records;
    }
    updateTasks(records) {
      this.project.taskStore.data = records;
    }
    //#endregion
    //region Type assertions
    changeNewTaskDefaults(newTaskDefaults) {
      ObjectHelper.assertObject(newTaskDefaults, "newTaskDefaults");
      return newTaskDefaults;
    }
    //endregion
    //region Project
    changeProject(project) {
      if (project && !project.isModel) {
        project = this.projectModelClass.new(project);
      }
      this.attachToProject(project);
      return project;
    }
    attachToProject(project) {
      const me = this;
      me.bindCrudManager(project);
      if (project) {
        const { taskStore } = project;
        if (taskStore) {
          const { storage } = taskStore;
          storage.addIndex({ property: me.columnField, unique: false });
          if (me.swimlaneField) {
            storage.addIndex({ property: me.swimlaneField, unique: false });
          }
          Reflect.defineProperty(taskStore.$master.modelClass.prototype, "columnSwimlaneIntersection", {
            get() {
              return this.buildIndexKey({
                [me.columnField]: this[me.columnField],
                [me.swimlaneField]: this[me.swimlaneField]
              });
            }
          });
          taskStore.$master.modelClass.prototype.buildIndexKey = function(data) {
            var _a2;
            return `${data[me.columnField]}-/-${((_a2 = me.swimlanes) == null ? void 0 : _a2.count) && data[me.swimlaneField] || "default"}`;
          };
          storage.addIndex({ property: "columnSwimlaneIntersection", unique: false, dependentOn: { [me.swimlaneField]: true, [me.columnField]: true } });
        }
        me.attachToProjectStore(project.taskStore, {
          change: "onTaskStoreChange",
          changePreCommit: "onTaskStoreEarlyChange",
          refresh: "onTaskStoreRefresh"
        });
        me.attachToProjectStore(project.assignmentStore);
        me.attachToProjectStore(project.resourceStore);
      }
    }
    // Most store changes leads to a recompose, with exception of some TaskStore changes that are transitioned
    attachToProjectStore(store, listenersConfig = {}) {
      this.detachListeners(store.$name);
      store == null ? void 0 : store.ion({
        name: store.$name,
        change: "recompose",
        refresh: "recompose",
        thisObj: this,
        ...listenersConfig
      });
    }
    //endregion
    //region Listeners
    onTaskStoreEarlyChange({ action }) {
      if (action === "add") {
        this.recomposeWithDomTransition({
          addTransition: {
            height: 1,
            opacity: 1
          }
        });
      }
    }
    onTaskStoreChange({ action, changes }) {
      const { columnField, swimlaneField } = this;
      if (action === "remove" || action === "filter" || action === "update" && (changes[columnField] || swimlaneField && changes[swimlaneField])) {
        this.recomposeWithDomTransition({
          removeTransition: {
            height: 1,
            opacity: 1
          }
        });
      } else {
        this.recompose();
      }
    }
    onTaskStoreRefresh({ action }) {
      if (action === "sort") {
        !this.taskSorterFn && this.recomposeWithDomTransition();
      } else {
        this.recompose();
      }
    }
    //endregion
    //region Utility
    /**
     * Add a new task to the specified column / swimlane intersection (swimlane is optional), scroll it into view and
     * start editing it (if an editing feature is enabled).
     *
     * By default the task is created using the data defined in the {@link #config-newTaskDefaults} combined with values
     * for the `columnField`, the `swimlaneField` and a generated `weight` to place it last. To override these or to
     * supply your own values for any field, pass the `taskData` argument.
     *
     * If project is configured to auto sync changes to backend, the sync request will be awaited before editing starts.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord Column to add the task to
     * @param {TaskBoard.model.ColumnModel} [swimlaneRecord] Swimlane to add the task to
     * @param {Object} [taskData] Data for the new task
     * @category Common
     */
    async addTask(columnRecord, swimlaneRecord = null, taskData = {}) {
      var _a2;
      const me = this, {
        swimlaneField,
        swimlanes,
        project
      } = me, columnBody = me.getColumnElement(columnRecord).syncIdMap.body, lastCard = columnBody.lastElementChild, data = {
        [me.columnField]: columnRecord.id,
        name: me.L("L{TaskBoard.newTaskName}"),
        weight: ((_a2 = project.taskStore.max("weight")) != null ? _a2 : 0) + 100,
        ...me.newTaskDefaults,
        ...taskData
      };
      let suspended = false;
      if (swimlaneField) {
        if (swimlaneRecord) {
          data[swimlaneField] = swimlaneRecord.id;
        } else if (swimlanes == null ? void 0 : swimlanes.count) {
          data[swimlaneField] = swimlanes.first.id;
        }
      }
      if (lastCard && lastCard.offsetTop + lastCard.offsetHeight > columnBody.clientHeight - 100) {
        me.suspendDomTransition();
        suspended = true;
      }
      const synced = project.autoSync && project.await("sync", false), [taskRecord] = project.taskStore.add(data);
      me.recompose.now();
      if (me.useDomTransition && !me.domTransitionSuspended) {
        await me.await("transitionedRecompose", false);
      }
      if (me.isDestroyed) {
        return;
      }
      await me.scrollToTask(taskRecord, ObjectHelper.assign({}, me.scrollOptions, { highlight: false, block: "nearest" }));
      if (me.isDestroyed) {
        return;
      }
      if (synced) {
        await synced;
        if (me.isDestroyed) {
          return;
        }
        me.recompose.now();
      }
      suspended && me.resumeDomTransition();
      if (me.features.simpleTaskEdit) {
        me.editTask(taskRecord);
      }
      return taskRecord;
    }
    /**
     * Removes one or more tasks from the linked task store (and thus the TaskBoard).
     *
     * First fires a `'beforeTaskRemove'` event, which is preventable and async. Return `false` or a promise that
     * resolves to `false` from a listener to prevent the operation.
     *
     * ```javascript
     * taskBoard.on({
     *     async beforeRemoveTask() {
     *         const result = await askForConfirmation();
     *         return result;
     *     }
     * });
     *
     * taskBoard.remove(myTask);
     * ```
     *
     * @param {TaskBoard.model.TaskModel|TaskBoard.model.TaskModel[]} taskRecord A single task or an array thereof to
     * remove from the task store.
     * @returns {Boolean} Returns `true` if the tasks were removed, `false` if the operation was prevented.
     * @category Common
     */
    async removeTask(taskRecord) {
      const taskRecords = ArrayHelper.asArray(taskRecord);
      if (await this.trigger("beforeTaskRemove", { taskRecords }) !== false) {
        this.project.taskStore.remove(taskRecords);
        return true;
      }
      return false;
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardStores"), __publicField(_a, "configurable", {
    projectModelClass: ProjectModel2,
    /**
     * The {@link TaskBoard.model.ProjectModel} instance, containing the data visualized by the TaskBoard.
     * @member {TaskBoard.model.ProjectModel} project
     * @accepts {TaskBoard.model.ProjectModel|ProjectModelConfig} project
     * @category Common
     */
    /**
     * A {@link TaskBoard.model.ProjectModel#configs project config object} or an instance that holds all stores and
     * data used by the TaskBoard.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     project : {
     *         // Use a custom task model
     *         taskModelClass : MyTaskModel,
     *
     *         // Supply inline data
     *         tasksData : [
     *             { id : 1, name: 'Task 1', ... },
     *             ...
     *         ]
     * });
     * ```
     *
     * Project has built-in crud manager functionality to handle syncing with a backend:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     project : {
     *         transport : {
     *             load : {
     *                 url : 'data/data.json'
     *             }
     *     },
     *     autoLoad : true
     * });
     *
     * Also has built-in state tracking manager functionality to handle undo/redo:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     stm : {
     *         autoRecord : true,
     *         disabled   : false
     *     }
     * });
     *
     * @config {TaskBoard.model.ProjectModel|ProjectModelConfig}
     * @category Data
     */
    project: {},
    /**
     * Inline {@link Scheduler.model.AssignmentModel assignments}, will be loaded into an internally created
     * {@link Scheduler.data.AssignmentStore}  as a part of a {@link TaskBoard.model.ProjectModel project}.
     * @prp {Scheduler.model.AssignmentModel[]|Object[]} assignments
     * @category Data
     */
    assignments: null,
    /**
     * Inline {@link Scheduler.model.ResourceModel resources}, will be loaded into an internally created
     * {@link Scheduler.data.ResourceStore} as a part of a {@link TaskBoard.model.ProjectModel project}.
     * @prp {Scheduler.model.ResourceModel[]|Object[]} resources
     * @category Data
     */
    resources: null,
    /**
     * Inline {@link TaskBoard.model.TaskModel tasks}, will be loaded into an internally created
     * {@link TaskBoard.store.TaskStore} as a part of a {@link TaskBoard.model.ProjectModel project}.
     * @prp {TaskBoard.model.TaskModel[]|Object[]} tasks
     * @category Data
     */
    tasks: null,
    /**
     * Default values to apply to task records created by task boards features (such as the column header menu and
     * the column toolbar)
     *
     * @config {TaskModelConfig}
     * @category Data
     */
    newTaskDefaults: {},
    loadMaskDefaults: {
      useTransition: true,
      showDelay: 100
    },
    /**
     * TaskBoard does not use a sync mask by default. If you want one, see
     * {@link Core.mixin.LoadMaskable#config-syncMask} for configuration options.
     *
     * @config {String|Object|null}
     * @default null
     * @category Masking
     */
    syncMask: null
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardSwimlanes.js
var TaskBoardSwimlanes_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeAutoGenerateSwimlanes(autoGenerateSwimlanes) {
      ObjectHelper.assertBoolean(autoGenerateSwimlanes, "autoGenerateSwimlanes");
      return autoGenerateSwimlanes;
    }
    changeSwimlaneField(swimlaneField) {
      ObjectHelper.assertString(swimlaneField, "swimlaneField");
      return swimlaneField;
    }
    //endregion
    //region Config - swimlaneField
    updateSwimlaneField(field, old) {
      if (!this.isConfiguring) {
        const { storage } = this.project.taskStore;
        if (old && old !== this.columnField) {
          storage.removeIndex(old);
        }
        storage.addIndex({ property: field, unique: false });
      }
      this.shouldAutoGenerateSwimlanes = field && this.autoGenerateSwimlanes;
    }
    //endregion
    //region Config - swimlanes
    changeSwimlanes(swimlanes) {
      return Store.from(swimlanes, { objectify: true, modelClass: SwimlaneModel }, (lane) => {
        if (typeof lane === "string") {
          return { id: lane, text: StringHelper.capitalize(lane) };
        }
        return lane;
      });
    }
    updateSwimlanes(swimlanes) {
      this.detachListeners("swimlanes");
      if (swimlanes) {
        (swimlanes.$store || swimlanes).taskBoard = this;
        swimlanes.ion({
          change: "onSwimlanesChange",
          refresh: "onSwimlanesChange",
          thisObj: this
        });
      }
    }
    get swimlanes() {
      const me = this, { taskStore } = me.project;
      if (me.shouldAutoGenerateSwimlanes && taskStore.count) {
        me.swimlanes = taskStore.getDistinctValues(me.swimlaneField).sort();
        me.shouldAutoGenerateSwimlanes = false;
      }
      return me._swimlanes;
    }
    onSwimlanesChange({ action }) {
      if (action === "add" || action === "remove" || action === "removeAll" || action === "update") {
        this.project.taskStore.storage.invalidateIndices();
      }
      if (action === "remove" || action === "update" || action === "filter") {
        const options = {};
        if (action === "update") {
          options.addTransition = { height: 1, opacity: 1 };
          options.removeTransition = { height: 1, opacity: 1 };
        }
        this.recomposeWithDomTransition(options);
        return;
      }
      this.recompose();
    }
    //endregion
    //region Data
    get hasSwimlanes() {
      var _a2;
      return Boolean(this.swimlaneField && ((_a2 = this.swimlanes) == null ? void 0 : _a2.count));
    }
    getSwimlaneTasks(swimlaneRecord) {
      return this.project.taskStore.storage.findItem(this.swimlaneField, swimlaneRecord.id);
    }
    getSwimlane(taskRecord) {
      var _a2;
      return this.swimlaneField && ((_a2 = this.swimlanes) == null ? void 0 : _a2.getById(taskRecord.getValue(this.swimlaneField)));
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardSwimlanes"), __publicField(_a, "configurable", {
    /**
     * Store containing the TaskBoard swimlanes.
     *
     * @member {Core.data.Store} swimlanes
     * @category Common
     */
    /**
     * Store containing the TaskBoard swimlanes. A tasks {@link #config-swimlaneField} is matched against the `id`
     * of a swimlane to determine in which swimlane it is displayed.
     *
     * Accepts an array of swimlane records/objects, a store instance, a store id or a store config object used to
     * create a new store.
     *
     * When supplying an array, a store configured with {@link Core.data.mixin.StoreProxy#config-objectify} is
     * automatically created. Using that config allows for a nicer interaction syntax with the swimlanes:
     *
     * ```javascript
     * // Without objectify:
     * taskBoard.swimlanes.getById('highprio').text = 'Important!';
     *
     * // With objectify:
     * taskBoard.swimlanes.done.text = 'Finished';
     * ```
     *
     * When supplying strings, the raw string will be used as the swimlanes `id` and a capitalized version of it is
     * used as the swimlanes text:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *    swimlanes : [
     *        'high',
     *        'low'
     *    ]
     * });
     * ```
     *
     * Is equivalent to:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *    swimlanes : [
     *        { id : 'high', text : 'High' },
     *        { id : 'low', text : 'Low' }
     *    ]
     * });
     * ```
     *
     * @config {TaskBoard.model.SwimlaneModel[]|SwimlaneModelConfig[]|Core.data.Store|String|StoreConfig}
     * @category Common
     */
    swimlanes: {},
    /**
     * Set to `true` to auto generate swimlanes when {@link #config-swimlanes} is undefined.
     *
     * A swimlane will be created for each distinct value of {@link #config-swimlaneField} on the tasks. The
     * swimlanes will be sorted in alphabetical order. The following snippet will yield two swimlanes, Q1 and Q2:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    swimlaneField : 'quarter',
     *
     *    autoGenerateSwimlanes : true,
     *
     *    project : {
     *        tasksData : [
     *            { id : 1, name : 'Inform tenants', quarter : 'Q1' },
     *            { id : 2, name : 'Renovate roofs', quarter : 'Q2' }
     *        ]
     *    }
     * });
     * ```
     *
     * @config {Boolean}
     * @category Advanced
     */
    autoGenerateSwimlanes: false,
    /**
     * Field on a task record used to determine which swimlane the task belongs to.
     *
     * ```javascript
     * taskBoard.swimlaneField = 'category';
     * ```
     *
     * @member {String} swimlaneField
     * @category Common
     */
    /**
     * Field on a task record used to determine which swimlane the task belongs to.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    // Use the "prio" field of tasks to determie which swimlane a task belongs to
     *    swimlaneField : 'prio',
     *
     *    swimlanes : [
     *        'high',
     *        'low'
     *    ],
     *
     *    project : {
     *        tasksData : [
     *            // Linked using the prio field, to the high swimlane
     *            { id : 1, name : 'Fun task', prio : 'high' }
     *        ]
     *    }
     * });
     * ```
     *
     * @config {String}
     * @category Common
     */
    swimlaneField: null
  }), __publicField(_a, "properties", {
    shouldAutoGenerateSwimlanes: false
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskBoardVirtualization.js
var TaskBoardVirtualization_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions and changers/updaters
    changeVirtualize(virtualize) {
      ObjectHelper.assertBoolean(virtualize, "virtualize");
      return virtualize;
    }
    updateVirtualize(virtualize) {
      var _a2;
      const me = this;
      (_a2 = me.cardIntersectionObserver) == null ? void 0 : _a2.disconnect();
      me.cardIntersectionObserver = null;
      if (virtualize) {
        me.cardIntersectionObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            me.onCardIntersection(entry.target, entry.isIntersecting, entry);
          }
        });
      }
      if (!this.isConfiguring && !this.isDestroying) {
        this.refreshVirtualizedCards();
      }
    }
    refreshVirtualizedCards() {
      const me = this;
      me.recompose.now();
      if (me.cardIntersectionObserver) {
        for (const taskElement of me.element.querySelectorAll(".b-taskboard-card")) {
          me.cardIntersectionObserver.observe(taskElement);
        }
      }
    }
    changeGetTaskHeight(getTaskHeight) {
      getTaskHeight && ObjectHelper.assertFunction(getTaskHeight, "getTaskHeight");
      return getTaskHeight;
    }
    updateGetTaskHeight(fn) {
      if (!this.isConfiguring && !this.isDestroying) {
        this.refreshVirtualizedCards();
      }
    }
    //endregion
    compose(domConfig) {
      domConfig.class["b-virtualized"] = this.isVirtualized;
      return super.compose(domConfig);
    }
    get isVirtualized() {
      return Boolean(this.cardIntersectionObserver);
    }
    // Flag cards as in view or out of view when their elements are intersecting the viewport (or not anymore)
    onCardIntersection(cardElement, isIntersecting, entry) {
      const me = this, { taskRecord } = cardElement.elementData, instanceMeta = taskRecord.instanceMeta(me), wasIntersecting = instanceMeta.intersects;
      if (wasIntersecting !== isIntersecting) {
        instanceMeta.intersects = isIntersecting;
        if (!isIntersecting && wasIntersecting) {
          instanceMeta.lastHeight = entry.boundingClientRect.height;
        }
        if (!me.isScrolling || me.drawOnScroll) {
          me.queueColumnRecompose(me.getColumn(taskRecord), me.getSwimlane(taskRecord));
        }
        if (me.isScrolling) {
          me.recomposeOnScrollEnd = true;
        }
      }
    }
    //region Rendering
    // Creates a DOM config for the outline of a single card
    renderCardOutline(taskRecord, columnRecord, swimlaneRecord) {
      var _a2;
      const me = this, { id, domId, weight } = taskRecord;
      return {
        id: `${me.id}-card-${domId}`,
        class: {
          "b-taskboard-card": true,
          "b-out-of-view": true
        },
        tabIndex: 0,
        dataset: {
          task: domId,
          column: columnRecord.id,
          lane: swimlaneRecord == null ? void 0 : swimlaneRecord.id,
          weight,
          domTransition: true
        },
        elementData: {
          elementType: "task",
          taskId: id,
          taskRecord,
          columnRecord,
          swimlaneRecord
        },
        style: {
          height: ((_a2 = me.getTaskHeight) == null ? void 0 : _a2.call(me, taskRecord)) || taskRecord.instanceMeta(me).lastHeight
        }
      };
    }
    // Overrides renderCard in TaskBoardBase, rendering outlines for cards out of view
    renderCard(taskRecord, columnRecord, swimlaneRecord) {
      const { isVirtualized } = this, meta = taskRecord.instanceMeta(this);
      if (isVirtualized && !meta.dragging && !meta.intersects && !this.isSelected(taskRecord)) {
        return this.renderCardOutline(taskRecord, columnRecord, swimlaneRecord);
      }
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskBoardVirtualization"), __publicField(_a, "configurable", {
    /**
     * The function is called for each task as part of the render loop, and is expected to return the height in
     * pixels for the task. Using this function is only recommended when using partial virtualized rendering, see
     * the {@link #config-virtualize} setting.
     *
     * How the height is determined is up to the application, it could for example return a fixed value:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *     getTaskHeight() {
     *         return 150;
     *     }
     * }
     * ```
     *
     * Or get the height from data:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *     getTaskHeight(taskRecord) {
     *         return taskRecord.myTaskHeight;
     *     }
     * }
     * ```
     *
     * Or use some custom application logic:
     *
     * ```javascript
     * taskBoard = new TaskBoard({
     *     getTaskHeight(taskRecord) {
     *         if (taskRecord.isCollapsed) {
     *             return 20;
     *         }
     *
     *         return taskRecord.myTaskHeight;
     *     }
     * }
     * ```
     *
     * @prp {Function}
     * @param {TaskBoard.model.TaskModel} taskRecord The task record
     * @return {Number} The height of the task in pixels
     * @category Advanced
     */
    getTaskHeight: null,
    /**
     * By turning on this setting you enable partial virtualized rendering for the board, which reduces initial
     * rendering time and makes interaction less sluggish when using thousands of tasks. The tradeoff is that
     * scrolling in most cases will be slower.
     *
     * For a nice UX, it is strongly recommended to also implement a {@link #config-getTaskHeight} function. Without
     * it, the height of tasks out of view will be unknown and the behaviour when scrolling will be less than ideal.
     *
     * <div class="note">Note that for normal datasets (depending on machine, but roughly <1000 tasks) performance
     * might be better without partial virtualized rendering, since it adds some overhead.</div>
     *
     * <div class="note">Also note that as part of the optimizations for partial virtualized rendering, the inner
     * element in columns that contain cards is absolutely positioned. This leads to column not being able to
     * automatically shrink wrap the cards, you will have to set a height on the swimlane (or task board if not
     * using swimlanes) to size things correctly.</div>
     *
     * @prp {Boolean}
     */
    virtualize: {
      value: null,
      $config: "nullify"
    },
    /**
     * Whether to draw cards on scroll, or only when scrolling ends.
     *
     * Only applies when using partial virtualized rendering (see {@link #config-getTaskHeight}).
     *
     * Setting this to `false` will boost scroll performance, but cards scrolled into view will be empty outlines
     * until scrolling ends.
     *
     * @prp {Boolean}
     */
    drawOnScroll: true
  }), _a;
};

// lib/TaskBoard/view/item/TextItem.js
var TextItem = class extends TaskItem {
  static render({ domConfig, value, taskRecord, config }) {
    if (config.field === "id" && taskRecord.hasGeneratedId) {
      domConfig.class["b-generated-id"] = 1;
      domConfig.text = "\u273B";
    } else {
      domConfig.text = taskRecord.getFieldDefinition(config.field).print(value);
    }
  }
};
__publicField(TextItem, "$name", "TextItem");
__publicField(TextItem, "type", "text");
TextItem.initClass();
TextItem._$name = "TextItem";

// lib/TaskBoard/view/item/ResourceAvatarsItem.js
var ResourceAvatarsItem = class extends TaskItem {
  static render({ taskBoard, domConfig, config, taskRecord, cardSize }) {
    var _a, _b;
    const maxAvatars = (_b = (_a = cardSize == null ? void 0 : cardSize.maxAvatars) != null ? _a : config.maxAvatars) != null ? _b : 7, { resourceImagePath } = taskBoard, { resources } = taskRecord, hasOverflow = resources.length > maxAvatars, overflowCount = resources.length - maxAvatars + 1, lastResource = resources[maxAvatars];
    let { avatarRendering } = taskBoard;
    if (!avatarRendering) {
      avatarRendering = taskBoard.avatarRendering = new AvatarRendering({
        element: taskBoard.element,
        colorPrefix: "b-taskboard-background-color-"
      });
    }
    if (!taskBoard.project.resourceStore.count) {
      return false;
    }
    ObjectHelper.merge(domConfig, {
      class: {
        "b-overlap": config.overlap
      },
      children: [
        // "Normal" avatars
        ...resources.sort((a, b) => a.name.localeCompare(b.name)).slice(0, maxAvatars - (hasOverflow ? 1 : 0)).map((resource, i) => ({
          class: {
            "b-taskboard-resource-avatar-wrap": 1
          },
          dataset: {
            resourceId: resource.id
          },
          children: [
            avatarRendering.getResourceAvatar({
              resourceRecord: resource,
              imageUrl: resource.image === false ? null : resource.imageUrl || resource.image && (resourceImagePath || "") + resource.image,
              initials: resource.initials,
              color: resource.eventColor,
              dataset: {
                btip: StringHelper.encodeHtml(resource.name)
              }
            })
          ]
        })),
        // Overflow indicating avatar
        hasOverflow && {
          class: {
            "b-taskboard-resource-avatar-overflow": 1
          },
          dataset: {
            resourceId: "$overflow",
            btip: resources.slice(-overflowCount).map((r) => StringHelper.encodeHtml(r.name)).join(", "),
            count: overflowCount
          },
          children: [
            avatarRendering.getResourceAvatar({
              resourceRecord: lastResource,
              imageUrl: lastResource.image === false ? null : lastResource.imageUrl || lastResource.image && resourceImagePath + lastResource.image,
              initials: lastResource.initials
            })
          ]
        }
      ],
      syncOptions: {
        syncIdField: "resourceId"
      }
    });
  }
  static onClick({ source: taskBoard, taskRecord, event }) {
    const element = event.target.closest(".b-resource-avatar, .b-taskboard-resource-avatar-overflow");
    if (element) {
      if (element.matches(".b-resource-avatar")) {
        const resourceRecord = taskBoard.project.resourceStore.getById(element.dataset.resourceId);
        taskBoard.trigger("resourceAvatarClick", { resourceRecord, taskRecord, element, event });
      } else {
        taskBoard.trigger("resourceAvatarOverflowClick", { taskRecord, element, event });
      }
      return false;
    }
  }
};
__publicField(ResourceAvatarsItem, "$name", "ResourceAvatarsItem");
__publicField(ResourceAvatarsItem, "type", "resourceAvatars");
/**
 * Maximum avatars to display by default. The last avatar will render an overflow indicator if the task has more
 * resources assigned.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     headerItems : {
 *         resources : {
 *             type       : 'resourceAvatars',
 *             maxAvatars : 5
 *         }
 *     }
 * });
 * ```
 *
 * Overridden by card size based settings, see {@link TaskBoard.view.mixin.ResponsiveCards}.
 *
 * @config {Number} maxAvatars
 * @default 7
 * @category Common
 */
/**
 * Specify `true` to slightly overlap avatars for tasks that have multiple resources assigned. By default, they are
 * displayed side by side.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     headerItems : {
 *         resources : {
 *             overlap : true
 *         }
 *     }
 * });
 * ```
 *
 * @config {Boolean} overlap
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * Defaults to use a {@link TaskBoard.widget.ResourcesCombo}.
 *
 * @config {String|Object} editor
 * @default resourcescombo
 * @category Common
 */
__publicField(ResourceAvatarsItem, "defaultEditor", { type: "resourcescombo", pickerWidth: "13em" });
ResourceAvatarsItem.initClass();
ResourceAvatarsItem._$name = "ResourceAvatarsItem";

// lib/TaskBoard/view/mixin/TaskItems.js
var fieldLess = {
  resourceAvatars: 1,
  separator: 1,
  taskMenu: 1
};
var taskItemSelector = ".b-taskboard-taskitem";
var afterRe = /\s*<\s*/;
var beforeRe = /\s*>\s*/;
var TaskItems_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeProcessItems(processItems) {
      ObjectHelper.assertFunction(processItems, "processItems");
      return processItems;
    }
    //endregion
    // region Configuring items
    mergeItems(items, old) {
      if (old && items) {
        items = ObjectHelper.mergeItems(old, items);
      }
      return items;
    }
    // Needed to allow reconfiguring on the fly (for responsive)
    changeHeaderItems(items, old) {
      ObjectHelper.assertObject(items, "headerItems");
      return this.mergeItems(items, old);
    }
    // Needed to allow reconfiguring on the fly (for responsive)
    changeBodyItems(items, old) {
      ObjectHelper.assertObject(items, "bodyItems");
      return this.mergeItems(items, old);
    }
    // Needed to allow reconfiguring on the fly (for responsive)
    changeFooterItems(items, old) {
      ObjectHelper.assertObject(items, "footerItems");
      return this.mergeItems(items, old);
    }
    //endregion
    //region Rendering
    // Render items to header, body or footer of the supplied task
    renderItems(taskRecord, items, target, cardSize) {
      for (const key in items) {
        const config = items[key];
        if (config && !config.hidden) {
          if (!("field" in config)) {
            if (key.includes(">")) {
              [config.field] = key.split(beforeRe);
            } else if (key.includes("<")) {
              [, config.field] = key.split(afterRe);
            } else {
              config.field = key;
            }
          }
          const { field } = config, value = taskRecord.getValue(field);
          if (value != null || fieldLess[config.type] || config.renderNull) {
            const item = TaskItem.resolveType(config.type), typeCls = `b-taskboard-${StringHelper.hyphenate(config.type)}`, domConfig = {
              class: {
                "b-taskboard-taskitem": 1,
                [typeCls]: 1,
                [config.cls]: config.cls,
                "b-editable": !taskRecord.readOnly && item.getEditorConfig({ config, item })
              },
              dataset: {
                role: `item-${field}`,
                field,
                ref: key
              },
              elementData: {
                item,
                taskRecord,
                config
              },
              style: {
                order: config.order,
                style: config.style
              }
            }, result = item.render({ taskBoard: this, domConfig, value, config, taskRecord, cardSize });
            if (result !== false) {
              target.children[key] = domConfig;
            }
          }
        }
      }
    }
    // Hook into card rendering
    populateCard(args) {
      var _a2;
      (_a2 = super.populateCard) == null ? void 0 : _a2.call(this, args);
      const me = this, { processItems } = me, { taskRecord, cardConfig, cardSize } = args, {
        headerItems: sizeHeaderItems,
        bodyItems: sizeBodyItems,
        footerItems: sizeFooterItems
      } = cardSize || {}, { header, body, footer } = cardConfig.children;
      let { headerItems, bodyItems, footerItems } = me;
      if (sizeHeaderItems || processItems) {
        headerItems = ObjectHelper.clone(headerItems);
      }
      if (sizeBodyItems || processItems) {
        bodyItems = ObjectHelper.clone(bodyItems);
      }
      if (sizeFooterItems || processItems) {
        footerItems = ObjectHelper.clone(footerItems);
      }
      sizeHeaderItems && ObjectHelper.merge(headerItems, sizeHeaderItems);
      sizeBodyItems && ObjectHelper.merge(bodyItems, sizeBodyItems);
      sizeFooterItems && ObjectHelper.merge(footerItems, sizeFooterItems);
      processItems == null ? void 0 : processItems({ headerItems, bodyItems, footerItems, taskRecord, cardSize });
      me.renderItems(taskRecord, headerItems, header, cardSize);
      me.renderItems(taskRecord, bodyItems, body, cardSize);
      me.renderItems(taskRecord, footerItems, footer, cardSize);
    }
    //endregion
    //region Listeners
    resolveTaskItem(element) {
      const taskItemElement = element.closest(taskItemSelector) || element.querySelector(`:scope > * > ${taskItemSelector}, :scope > ${taskItemSelector}`);
      if (taskItemElement) {
        return {
          ...taskItemElement.elementData,
          element: taskItemElement
        };
      }
      return null;
    }
    // Relay clicks to items
    onTaskClick(args) {
      var _a2;
      const taskItem = this.resolveTaskItem(args.event.target);
      if (taskItem) {
        const { config, item } = taskItem;
        (_a2 = item.onClick) == null ? void 0 : _a2.call(item, {
          config,
          ...args
        });
      }
      super.onTaskClick(args);
    }
    // Relay double clicks to items
    onTaskDblClick(args) {
      var _a2;
      const taskItem = this.resolveTaskItem(args.event.target);
      if (taskItem) {
        const { config, item } = taskItem;
        (_a2 = item.onDblClick) == null ? void 0 : _a2.call(item, {
          config,
          ...args
        });
      }
      super.onTaskDblClick(args);
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskItems"), __publicField(_a, "configurable", {
    /**
     * Items in card header.
     *
     * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
     *
     * Reassigning this property merges the supplied object with the configured items:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    headerItems : {
     *        status : { type : 'text' }
     *    }
     * });
     *
     * taskBoard.headerItems = {
     *     status : { hidden : true },
     *     tags   : { type : 'tags' }
     * };
     *
     * // Results in:
     * //
     * // headerItems = {
     * //     status : { type : 'text', hidden: true }
     * //     tags   : { type : 'tags' }
     * // }
     * }
     * ```
     *
     * @member {Object<String,TaskItemOptions>} headerItems
     * @category Task content
     */
    /**
     * Items to add to each card's header.
     *
     * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
     * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
     *
     * You are always required to supply a `type`, see the docs for each item type for more information on available
     * configs.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    headerItems : {
     *        status : { type : 'text' }
     *    }
     * });
     * ```
     *
     * For more information, see the {@link #class-description class description} above.
     *
     * @config {Object<String,TaskItemOptions>}
     * @category Task content
     */
    headerItems: {
      value: {
        text: { type: "text", field: "name" }
      },
      $config: {
        merge: "items"
      }
    },
    /**
     * Items to add to each card's body.
     *
     * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
     *
     * Reassigning this property merges the supplied object with the configured items:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *        status : { type : 'text' }
     *    }
     * });
     *
     * taskBoard.bodyItems = {
     *     status : { hidden : true },
     *     tags   : { type : 'tags' }
     * };
     *
     * // Results in:
     * //
     * // bodyItems = {
     * //     status : { type : 'text', hidden: true }
     * //     tags   : { type : 'tags' }
     * // }
     * }
     * ```
     *
     * @member {Object<String,TaskItemOptions>} bodyItems
     * @category Task content
     */
    /**
     * Items to add to each card's body.
     *
     * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
     * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
     *
     * You are always required to supply a `type`, see the docs for each item type for more information on available
     * configs.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *        status : { type : 'text' }
     *    }
     * });
     * ```
     *
     * For more information, see the {@link #class-description class description} above.
     *
     * @config {Object<String,TaskItemOptions>}
     * @category Task content
     */
    bodyItems: {
      value: {
        text: { type: "text", field: "description" }
      },
      $config: {
        merge: "items"
      }
    },
    /**
     * Items in card footer.
     *
     * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
     *
     * Reassigning this property merges the supplied object with the configured items:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    footerItems : {
     *        status : { type : 'text' }
     *    }
     * });
     *
     * taskBoard.footerItems = {
     *     status : { hidden : true },
     *     tags   : { type : 'tags' }
     * };
     *
     * // Results in:
     * //
     * // footerItems = {
     * //     status : { type : 'text', hidden: true }
     * //     tags   : { type : 'tags' }
     * // }
     * }
     * ```
     *
     * @member {Object<String,TaskItemOptions>} footerItems
     * @category Task content
     */
    /**
     * Items to add to each card's footer.
     *
     * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
     * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
     *
     * You are always required to supply a `type`, see the docs for each item type for more information on available
     * configs.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    footerItems : {
     *        status : { type : 'text' }
     *    }
     * });
     * ```
     *
     * For more information, see the {@link #class-description class description} above.
     *
     * @config {Object<String,TaskItemOptions>}
     * @category Task content
     */
    footerItems: {
      value: {
        resourceAvatars: { type: "resourceAvatars", field: "resources" }
      },
      $config: {
        merge: "items"
      }
    },
    /**
     * A function called on each render before adding items to a tasks card, allowing runtime manipulation of them.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     processItems({ bodyItems, taskRecord }) {
     *        // Remove the progress item for done tasks
     *        if (taskRecord.status === 'done') {
     *            bodyItems.progress = null;
     *        }
     *     }
     * });
     * ```
     *
     * NOTE: The function is only intended for manipulating the passed items, you should not update the passed
     * `taskRecord` in it since updating records triggers another round of rendering.
     *
     * @config {Function}
     * @param {Object} context
     * @param {Object<String,TaskItemOptions>} context.headerItems Item config objects for the task header, keyed by ref
     * @param {Object<String,TaskItemOptions>} context.bodyItems Item config objects for the task body, keyed by ref
     * @param {Object<String,TaskItemOptions>} context.footerItems Item config objects for the task footer, keyed by ref
     * @param {TaskBoard.model.TaskModel} context.taskRecord Record representing task to be rendered
     * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
     * @category Task content
     */
    processItems: null
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskNavigation.js
var navigationActions = ["navigateDown", "navigateLeft", "navigateUp", "navigateRight", "activate"];
var TaskNavigation_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Utility
    getTaskNear(x, y) {
      var _a2, _b, _c;
      const { documentRoot } = this, gap = DomHelper.measureSize(
        this.css.cardGap || "1em",
        this.bodyElement.querySelector(".b-taskboard-swimlane-body .b-taskboard-column")
      );
      let task = (_a2 = documentRoot.elementFromPoint(x, y)) == null ? void 0 : _a2.closest(".b-taskboard-card");
      if (!task) {
        task = (_b = documentRoot.elementFromPoint(x, y - gap)) == null ? void 0 : _b.closest(".b-taskboard-card");
      }
      if (!task) {
        task = (_c = documentRoot.elementFromPoint(x, y + gap)) == null ? void 0 : _c.closest(".b-taskboard-card");
      }
      return task;
    }
    //endregion
    //region Navigation
    focusAndOptionallySelect(taskElement, forceSelect) {
      if (taskElement) {
        const me = this, currentlyFocusedTask = me.resolveTaskRecord(document.activeElement);
        if (forceSelect && currentlyFocusedTask && !me.isSelected(currentlyFocusedTask)) {
          me.selectTask(currentlyFocusedTask, true);
        }
        if (me.selectOnNavigation || forceSelect) {
          const taskToFocus = me.resolveTaskRecord(taskElement);
          if (!me.isSelected(taskToFocus)) {
            me.selectTask(taskToFocus, forceSelect);
          } else if (forceSelect) {
            me.deselectTask(currentlyFocusedTask);
          }
        }
        taskElement.focus();
      }
    }
    // To task at same Y in next column
    navigateNext(keyEvent, select) {
      const me = this, { taskRecord, swimlaneRecord, columnRecord } = keyEvent.taskBoardData, taskElement = me.getTaskElement(taskRecord);
      let found = null, nextColumnRecord = columnRecord;
      do {
        nextColumnRecord = me.columns.getNext(nextColumnRecord, true);
        if (!nextColumnRecord.hidden) {
          const nextColumnElement = me.getSwimlaneColumnElement(swimlaneRecord, nextColumnRecord), x = Rectangle.from(nextColumnElement, null, true).center.x, y = Rectangle.from(taskElement, null, true).center.y;
          found = me.getTaskNear(x, y);
        }
      } while (!found && nextColumnRecord !== columnRecord);
      me.focusAndOptionallySelect(found, select);
    }
    // To task at same Y in prev column
    navigatePrev(keyEvent, select) {
      const me = this, { taskRecord, swimlaneRecord, columnRecord } = keyEvent.taskBoardData, taskElement = me.getTaskElement(taskRecord);
      let found = null, prevColumnRecord = columnRecord;
      do {
        prevColumnRecord = me.columns.getPrev(prevColumnRecord, true);
        if (!prevColumnRecord.hidden) {
          const prevColumnElement = me.getSwimlaneColumnElement(swimlaneRecord, prevColumnRecord), x = Rectangle.from(prevColumnElement, null, true).center.x, y = Rectangle.from(taskElement, null, true).center.y;
          found = me.getTaskNear(x, y);
        }
      } while (!found && prevColumnRecord !== columnRecord);
      me.focusAndOptionallySelect(found, select);
    }
    // Right navigates to next column for LTR and previous for RTL
    navigateRight(event, select = false) {
      this["navigate" + (this.rtl ? "Prev" : "Next")](event, select);
    }
    // Left navigates to previous column for LTR and next for RTL
    navigateLeft(event, select = false) {
      this["navigate" + (this.rtl ? "Next" : "Prev")](event, select);
    }
    // Find next task in same column (might be in next swimlane)
    navigateDown(keyEvent, select = false) {
      const { taskRecord } = keyEvent.taskBoardData, nextTask = this.getNextTask(taskRecord, true);
      this.focusAndOptionallySelect(this.getTaskElement(nextTask), select);
    }
    // Find prev task in same column (might be in prev swimlane)
    navigateUp(keyEvent, select = false) {
      const { taskRecord } = keyEvent.taskBoardData, prevTask = this.getPreviousTask(taskRecord, true);
      this.focusAndOptionallySelect(this.getTaskElement(prevTask), select);
    }
    // Activate (show editor)
    activate(event) {
      const { taskRecord } = this.resolveEvent(event);
      taskRecord && this.trigger("activateTask", { taskRecord, event });
    }
    isActionAvailable({ action, event }) {
      const taskBoardData = this.resolveEvent(event);
      event.taskBoardData = taskBoardData;
      if (action === "activate" && taskBoardData.taskRecord && event.target !== this.getTaskElement(taskBoardData.taskRecord)) {
        return false;
      }
      return Boolean((this.navigateable || !navigationActions.includes(action)) && (taskBoardData == null ? void 0 : taskBoardData.taskRecord));
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskNavigation"), __publicField(_a, "configurable", {
    // Documented on TaskBoard
    keyMap: {
      ArrowDown: "navigateDown",
      ArrowLeft: "navigateLeft",
      ArrowUp: "navigateUp",
      ArrowRight: "navigateRight",
      Enter: "activate"
    },
    navigateable: true,
    /**
     * Configure with `true` to change the default behaviour of keyboard navigation from moving focus to selecting
     * tasks:
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     selectOnNavigation : true
     * });
     * ```
     *
     * @config {Boolean|String}
     * @default
     * @category Selection
     */
    selectOnNavigation: false
  }), _a;
};

// lib/TaskBoard/view/mixin/TaskSelection.js
var TaskSelection_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    get widgetClass() {
    }
    //endregion
    //region Type assertions
    changeSelectedTasks(selectedTasks) {
      ObjectHelper.assertArray(selectedTasks, "selectedTasks");
      return selectedTasks.filter((task) => {
        var _a2;
        return ((_a2 = this.isTaskSelectable) == null ? void 0 : _a2.call(this, task)) !== false;
      });
    }
    //endregion
    //region Programmatic selection
    toggleTaskSelection(taskRecord, add = false, forceSelect = null) {
      const me = this;
      if (forceSelect == null) {
        if (me.isSelected(taskRecord)) {
          if (!add) {
            me.selectTask(taskRecord, false);
          } else {
            me.deselectTask(taskRecord);
          }
        } else {
          me.selectTask(taskRecord, add);
        }
      } else if (forceSelect) {
        me.selectTask(taskRecord, add);
      } else {
        me.deselectTask(taskRecord);
      }
    }
    /**
     * Select the supplied task, deselecting any previously selected by default.
     * @param {TaskBoard.model.TaskModel} taskRecord Task to select
     * @param {Boolean} [add] Specify `true` to add to selection instead of replacing it
     * @category Selection
     */
    selectTask(taskRecord, add = false) {
      var _a2;
      const { selectedTasks } = this, event = {
        action: "select",
        select: [taskRecord]
      };
      if (((_a2 = this.isTaskSelectable) == null ? void 0 : _a2.call(this, taskRecord)) === false) {
        return;
      }
      if (!add) {
        event.deselect = selectedTasks.slice();
        selectedTasks.length = 0;
      }
      ArrayHelper.include(selectedTasks, taskRecord);
      this.triggerSelectionChange(event);
      this.recompose();
    }
    /**
     * Deselect the supplied task.
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @category Selection
     */
    deselectTask(taskRecord) {
      ArrayHelper.remove(this.selectedTasks, taskRecord);
      this.triggerSelectionChange({
        action: "deselect",
        deselect: [taskRecord]
      });
      this.recompose();
    }
    /**
     * Deselect all tasks.
     * @category Selection
     */
    deselectAll() {
      const { selectedTasks } = this;
      if (selectedTasks.length) {
        const deselect = selectedTasks.slice();
        selectedTasks.length = 0;
        this.triggerSelectionChange({
          action: "deselect",
          deselect
        });
        this.recompose();
      }
    }
    /**
     * Check if the supplied task is selected or not
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {Boolean} Returns `true` if it is selected, `false` if not
     * @category Selection
     */
    isSelected(taskRecord) {
      return this.selectedTasks.includes(taskRecord);
    }
    triggerSelectionChange(event) {
      this.trigger("selectionChange", Object.assign({
        selection: this.selectedTasks,
        select: [],
        deselect: []
      }, event));
    }
    //endregion
    //region Listeners
    onTaskClick(bryntumEvent) {
      super.onTaskClick(bryntumEvent);
      const { event, taskRecord } = bryntumEvent;
      if (!event.defaultPrevented) {
        this.toggleTaskSelection(taskRecord, event.ctrlKey);
      }
    }
    keyboardSelect(keyEvent) {
      if (!DomHelper.isEditable(keyEvent.target)) {
        const { taskRecord } = this.resolveEvent(keyEvent);
        if (taskRecord) {
          this.toggleTaskSelection(taskRecord, false);
          return true;
        }
      }
      return false;
    }
    keyboardToggleSelect(keyEvent) {
      const { taskRecord } = this.resolveEvent(keyEvent);
      if (taskRecord) {
        this.toggleTaskSelection(taskRecord, true);
      }
    }
    onClick(event) {
      super.onClick(event);
      if (!event.taskRecord && this.navigateable) {
        this.deselectAll();
      }
    }
    selectUp(event) {
      this.navigateUp(event, true);
    }
    selectDown(event) {
      this.navigateDown(event, true);
    }
    selectLeft(event) {
      this.navigateLeft(event, true);
    }
    selectRight(event) {
      this.navigateRight(event, true);
    }
    //endregion
    //region Rendering
    populateCard(args) {
      var _a2;
      (_a2 = super.populateCard) == null ? void 0 : _a2.call(this, args);
      const { taskRecord, cardConfig } = args;
      cardConfig.class["b-selected"] = this.isSelected(taskRecord);
    }
    populateBody(args) {
      var _a2;
      (_a2 = super.populateBody) == null ? void 0 : _a2.call(this, args);
      const { bodyConfig } = args;
      bodyConfig.class["b-has-selection"] = Boolean(this.selectedTasks.length);
    }
    //endregion
  }, //region Config
  __publicField(_a, "$name", "TaskSelection"), __publicField(_a, "configurable", {
    /**
     * Selected tasks.
     * @prp {TaskBoard.model.TaskModel[]} selectedTasks
     * @category Common
     */
    selectedTasks: [],
    /**
     * A template method (empty by default) allowing you to control if a task can be selected or not.
     *
     * ```javascript
     * new TaskBoard({
     *     isTaskSelectable(taskRecord) {
     *         return taskRecord.status !== 'done';
     *     }
     * })
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord The task record
     * @returns {Boolean} `true` if the task can be selected, otherwise `false`
     * @prp {Function}
     * @category Selection
     */
    isTaskSelectable: null,
    keyMap: {
      " ": "keyboardSelect",
      "Ctrl+ ": "keyboardToggleSelect",
      "Shift+ArrowDown": "selectDown",
      "Shift+ArrowLeft": "selectLeft",
      "Shift+ArrowUp": "selectUp",
      "Shift+ArrowRight": "selectRight"
    }
  }), _a;
};

// lib/TaskBoard/view/item/ImageItem.js
var ImageItem = class extends TaskItem {
  static render({ domConfig, value, config }) {
    if (value) {
      Object.assign(domConfig, {
        tag: "img",
        src: (config.baseUrl || "") + value,
        draggable: false
      });
    }
  }
};
__publicField(ImageItem, "$name", "ImageItem");
__publicField(ImageItem, "type", "image");
/**
 * Url prepended to this items value.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *        picture : { type : 'image', baseUrl : 'images/' }
 *    },
 *
 *    project : {
 *        tasksData : [
 *            { id : 1, name : 'Task #1', picture : 'photo.jpg' },
 *            { id : 2, name : 'Task #2', picture : 'image.jpg' }
 *        ]
 *    }
 * });
 *
 * // Card for task #1 will render image "images/photo.jpg"
 * // Card for task #2 will render image "images/image.jpg"
 * ```
 *
 * @config {String} baseUrl
 * @category Common
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * ImageItems are un-editable by default.
 *
 * @config {String|Object} editor
 * @default null
 * @category Common
 */
__publicField(ImageItem, "defaultEditor", null);
ImageItem.initClass();
ImageItem._$name = "ImageItem";

// lib/TaskBoard/view/item/JsxItem.js
var JsxItem = class extends TaskItem {
  static render({ domConfig, config, taskRecord, value }) {
    domConfig.retainChildren = true;
    domConfig.children = [config.jsx({ value, taskRecord, config })];
  }
};
__publicField(JsxItem, "$name", "JsxItem");
__publicField(JsxItem, "type", "jsx");
/**
 * Function used to generate JSX item content.
 *
 * Return a React Element (JSX) from the function:
 *
 * ```javascript
 * import MyJsxItem from './MyJsxItem.js';
 *
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *        prio : {
 *          type : 'jsx',
 *          jsx  : ({ taskRecord }) => <MyJsxItem taskRecord={taskRecord} />
 *        }
 *    }
 * });
 * ```
 *
 * @config {Function} jsx
 * @param {TaskBoard.model.TaskModel} taskRecord Task record
 * @param {JsxItemConfig} config Item config
 * @param {Object} value Value of the configured field
 * @returns React Element (JSX)
 * @category Common
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * JsxItems are un-editable by default.
 *
 * @config {String|Object} editor
 * @default null
 * @category Common
 */
__publicField(JsxItem, "defaultEditor", null);
JsxItem.initClass();
JsxItem._$name = "JsxItem";

// lib/TaskBoard/view/item/ProgressItem.js
var ProgressItem = class extends TaskItem {
  static render({ domConfig, value, config }) {
    const percent = Math.round(100 * value / (config.max || 100)) + "%";
    domConfig.children = [
      {
        class: "b-taskboard-progress-outline",
        dataset: {
          percent
        },
        children: [
          {
            class: "b-taskboard-progress-progress",
            style: {
              width: percent
            },
            dataset: {
              percent
            }
          }
        ]
      }
    ];
    domConfig.dataset.percent = domConfig.dataset.btip = percent;
  }
};
__publicField(ProgressItem, "$name", "ProgressItem");
__publicField(ProgressItem, "type", "progress");
__publicField(ProgressItem, "configurable", {
  /**
   * Max value, at which the bar is full.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    bodyItems : {
   *        progress : { type : 'progress', max : 10 }
   *    },
   *
   *    project : {
   *        tasksData : [
   *            { id : 1, name : 'Task #1', progress : 9 }
   *        ]
   *    }
   * });
   *
   * // Task #1 bar is 9/10 filled
   * ```
   *
   * @config {Number} max
   * @default 100
   * @category Common
   */
});
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * ProgressItems are un-editable by default.
 *
 * @config {String|Object} editor
 * @default null
 * @category Common
 */
__publicField(ProgressItem, "defaultEditor", null);
ProgressItem.initClass();
ProgressItem._$name = "ProgressItem";

// lib/TaskBoard/view/item/RatingItem.js
var RatingItem = class extends TaskItem {
  static render({ domConfig, value, config }) {
    const { max = value } = config;
    domConfig.children = [];
    for (let i = 0; i < max; i++) {
      domConfig.children.push({
        tag: "i",
        class: {
          "b-icon b-icon-star": 1,
          "b-filled": i < value
        }
      });
    }
  }
};
__publicField(RatingItem, "$name", "RatingItem");
__publicField(RatingItem, "type", "rating");
/**
 * Max rating.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *       grade : { type : 'ratingitem', max : 5 }
 *    },
 *
 *    project : {
 *        tasksData : [
 *            { id : 1, name : 'Task #1', grade : 3 }
 *        ]
 *    }
 * });
 *
 * // Card for task #1 will render 3 full stars and 2 faded,
 * // for a total of 5 stars
 * ```
 *
 * @config {Number} max
 * @category Common
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * RatingItems are un-editable by default.
 *
 * @config {String|Object} editor
 * @default null
 * @category Common
 */
__publicField(RatingItem, "defaultEditor", null);
RatingItem.initClass();
RatingItem._$name = "RatingItem";

// lib/TaskBoard/view/item/SeparatorItem.js
var SeparatorItem = class extends TaskItem {
  static render({ domConfig }) {
    domConfig.tag = "hr";
  }
};
__publicField(SeparatorItem, "$name", "SeparatorItem");
__publicField(SeparatorItem, "type", "separator");
/**
 * @hideconfigs editor
 */
__publicField(SeparatorItem, "defaultEditor", null);
SeparatorItem.initClass();
SeparatorItem._$name = "SeparatorItem";

// lib/TaskBoard/widget/TagCombo.js
var TagCombo = class extends Combo.mixin(TaskBoardLinked_default) {
  afterConfigure() {
    var _a;
    const me = this;
    if (!((_a = me.store) == null ? void 0 : _a.count) && me.taskBoard && me.name) {
      const { name, separator } = me, tags = [];
      me.taskBoard.project.taskStore.forEach((task) => {
        const taskTags = task[name];
        if (taskTags) {
          if (typeof taskTags === "string") {
            tags.push(...taskTags.split(separator));
          } else {
            tags.push(...taskTags);
          }
        }
      });
      me.items = [...new Set(tags)].sort();
    }
  }
  changeValue(value, old) {
    this.$expectsString = false;
    if (this.separator && typeof value === "string") {
      value = value.split(this.separator);
      this.$expectsString = true;
    }
    super.changeValue(value, old);
  }
  get value() {
    const value = super.value;
    if (this.$expectsString) {
      return value.join(this.separator);
    }
    return value;
  }
  set value(value) {
    super.value = value;
  }
};
__publicField(TagCombo, "$name", "TagCombo");
__publicField(TagCombo, "type", "tagcombo");
__publicField(TagCombo, "configurable", {
  multiSelect: true,
  editable: false,
  /**
   * Separator used to split a string into tags. Required if data format uses a single string to represent tags.
   * @config {String}
   * @default
   */
  separator: ",",
  picker: {
    cls: "b-tag-picker"
  },
  chipView: {
    closable: false
  }
});
TagCombo.initClass();
TagCombo._$name = "TagCombo";

// lib/TaskBoard/view/item/TagsItem.js
var TagsItem = class extends TaskItem {
  static render({ domConfig, value, config }) {
    let tags;
    if (value) {
      if (typeof value === "string") {
        tags = value.split(config.separator || ",").map((str) => ({ text: str }));
      } else if (Array.isArray(value)) {
        tags = value.map((entry) => {
          if (typeof entry === "string") {
            return { text: entry };
          } else {
            return {
              text: config.textProperty && entry[config.textProperty],
              cls: config.clsProperty && entry[config.clsProperty]
            };
          }
        });
      }
      if (tags) {
        domConfig.children = tags.map((tag) => {
          const cls = "cls" in tag ? tag.cls : DomHelper.makeValidId(tag.text, "-").toLowerCase();
          return {
            class: {
              "b-taskboard-tags-tag": 1,
              [cls]: Boolean(cls)
            },
            text: tag.text
          };
        });
      }
    }
  }
};
__publicField(TagsItem, "$name", "TagsItem");
__publicField(TagsItem, "type", "tags");
/**
 * Property used to determine the text for the tag. It is plucked from an array of objects that is used as the value
 * for this item.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *       tags : { type : 'TagsItem', textProperty : 'title' }
 *    },
 *
 *    project : {
 *        tasksData : [{
 *            id : 1,
 *            name : 'Issue #1',
 *            tags : [
 *                { title : 'bug', color : 'orange' },
 *                { title : 'important', color : 'red' }
 *            ]
 *        }]
 *    }
 * });
 *
 * // Card for Issue #1 will render 2 tags, 'bug' and 'important'
 * ```
 *
 * @config {String} textProperty
 * @category Common
 */
/**
 * Property used to add a CSS class to each tag. It is plucked from an array of objects that is used as the value
 * for this item.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *       tags : { type : 'TagsItem', clsProperty : 'color' }
 *    },
 *
 *    project : {
 *        tasksData : [{
 *            id : 1,
 *            name : 'Issue #1',
 *            tags : [
 *                { title : 'bug', color : 'orange' },
 *                { title : 'important', color : 'red' }
 *            ]
 *        }]
 *    }
 * });
 *
 * // Card for Issue #1 will render 2 tags, one with cls 'orange' and one with cls 'red'
 * ```
 *
 * @config {String} clsProperty
 * @category Common
 */
/**
 * Property used to split a value string into tags.
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *       tags : { type : 'TagsItem', separator : ';' }
 *    },
 *
 *    project : {
 *        tasksData : [{
 *            id : 1,
 *            name : 'Issue #1',
 *            tags : 'bug;important'
 *        }]
 *    }
 * });
 *
 * // Card for Issue #1 will render 2 tags, 'bug' and 'important'
 * ```
 *
 * @config {String} separator
 * @default ,
 * @category Common
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * Defaults to use a {@link TaskBoard.widget.TagCombo}.
 *
 * @config {String|Object} editor
 * @default tagcombo
 * @category Common
 */
__publicField(TagsItem, "defaultEditor", { type: "tagcombo", pickerWidth: "10em" });
TagsItem.initClass();
TagsItem._$name = "TagsItem";

// lib/TaskBoard/view/item/TemplateItem.js
var TemplateItem = class extends TaskItem {
  static render({ domConfig, value, config, taskRecord }) {
    const html = config.template({ taskRecord, config, value });
    if (typeof html === "string") {
      domConfig.html = html;
    } else if (ObjectHelper.isObject(html)) {
      ObjectHelper.merge(domConfig, html);
    } else if (Array.isArray(html)) {
      domConfig.children = html;
    }
  }
};
__publicField(TemplateItem, "$name", "TemplateItem");
__publicField(TemplateItem, "type", "template");
/**
 * Template function used to generate task content.
 *
 * Return an HTML string or a DomConfig object from the function:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    bodyItems : {
 *        prio : {
 *          type     : 'template',
 *          template : ({ taskRecord }) => `<i class="b-fa b-fa-tarffic-light"></i> ${taskRecord.prio}`
 *        }
 *    }
 * });
 * ```
 *
 * @config {Function} template
 * @param {TaskBoard.model.TaskModel} taskRecord Task record
 * @param {TemplateItemConfig} config Item config
 * @param {Object} value Value of the configured field
 * @returns {String|DomConfig|DomConfig[]} HTML string, DomConfig or DomConfig array
 * @category Common
 */
/**
 * Widget type or config to use as the editor for this item. Used in the inline task editor.
 *
 * TemplateItems are un-editable by default.
 *
 * @config {String|Object} editor
 * @default null
 * @category Common
 */
/**
 * Specify as `true` to render the template item even if the backing field's value is `null` or `undefined`. Useful
 * for example to display some custom string for null values ("Empty", "Unset" etc).
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    footerItems : {
 *        category : {
 *          type       : 'template',
 *          renderNull : true,
 *          template   : ({ value }) => value ? value : 'Empty'
 *        }
 *    }
 * });
 * ```
 *
 * @config {Boolean} renderNull
 * @default false
 * @category Common
 */
__publicField(TemplateItem, "defaultEditor", null);
TemplateItem.initClass();
TemplateItem._$name = "TemplateItem";

// lib/TaskBoard/view/item/TodoListItem.js
var TodoListItem = class extends TaskItem {
  static render({ domConfig, value, config, taskRecord }) {
    if (value) {
      const {
        textField = "text",
        checkedField = "checked",
        clsField = "cls",
        checkedIcon = "b-icon b-icon-checked",
        uncheckedIcon = "b-icon b-icon-unchecked"
      } = config;
      if (this.firstRender !== false) {
        const dataField = taskRecord.getFieldDefinition(config.field);
        if (!dataField.isArrayDataField) {
          throw new Error('TodoListItem has to be mapped to a field with `type : "array"`');
        }
      }
      domConfig.children = value.map((todo, index) => ({
        class: {
          "b-taskboard-todolist-todo": 1,
          [todo[clsField]]: todo[clsField],
          "b-checked": todo[checkedField]
        },
        children: {
          icon: {
            tag: "i",
            class: todo[checkedField] ? checkedIcon : uncheckedIcon
          },
          text: {
            tag: "span",
            text: todo[textField]
          }
        },
        elementData: {
          index
        }
      }));
      this.firstRender = false;
    }
  }
  static onClick({ source: taskBoard, taskRecord, event, config }) {
    const element = event.target.closest(".b-taskboard-todolist-todo");
    if (element && !taskRecord.readOnly) {
      const { checkedField = "checked", field } = config, { index } = element.elementData, clone = taskRecord.getValue(field).slice(), todo = clone[index];
      todo[checkedField] = !todo[checkedField];
      taskRecord.setValue(field, clone);
      taskBoard.trigger("todoToggle", { taskRecord, todo, checked: todo[checkedField], element, event });
      event.preventDefault();
    }
  }
  // Prevent editor from opening when dbl clicking a todo item
  static onDblClick({ event }) {
    event.preventDefault();
  }
};
__publicField(TodoListItem, "$name", "TodoListItem");
__publicField(TodoListItem, "type", "todoList");
/**
 * Name of a property on a todo item to display as its text.
 *
 * @config {String} textField
 * @category Common
 * @default text
 */
/**
 * Name of a property on a todo item to use for the checkbox. The property is expected to be a boolean.
 *
 * @config {String} checkedField
 * @category Common
 * @default checked
 */
/**
 * Name of a property on a todo item whose value will be added as a CSS class to the todo item.
 *
 * @config {String} clsField
 * @category Common
 * @default cls
 */
// private for now:
// checkedIcon
// uncheckedIcon
/**
 * @hideconfigs editor
 */
__publicField(TodoListItem, "defaultEditor", null);
TodoListItem.initClass();
TodoListItem._$name = "TodoListItem";

// lib/TaskBoard/localization/En.js
var locale = {
  localeName: "En",
  localeDesc: "English (US)",
  localeCode: "en-US",
  GridBase: {
    loadFailedMessage: "Data loading failed!",
    syncFailedMessage: "Data synchronization failed!"
  },
  CrudManagerView: {
    serverResponseLabel: "Server response:"
  },
  TaskBoard: {
    column: "column",
    columns: "columns",
    Columns: "Columns",
    swimlane: "swimlane",
    swimlanes: "swimlanes",
    Swimlanes: "Swimlanes",
    task: "task",
    tasks: "tasks",
    addTask: "Add L{TaskBoard.task}",
    cancel: "Cancel",
    changeColumn: "Change L{TaskBoard.column}",
    changeSwimlane: "Change L{TaskBoard.swimlane}",
    collapse: (text) => `Collapse ${text}`,
    color: "Color",
    description: "Description",
    editTask: "Edit L{TaskBoard.task}",
    expand: (text) => `Expand ${text}`,
    filterColumns: "Filter L{TaskBoard.columns}",
    filterSwimlanes: "Filter L{TaskBoard.swimlanes}",
    filterTasks: "Filter L{TaskBoard.tasks}",
    moveColumnLeft: "Move L{TaskBoard.column} left",
    moveColumnRight: "Move L{TaskBoard.column} right",
    name: "Name",
    newTaskName: "New L{TaskBoard.task}",
    removeTask: "Remove L{TaskBoard.task}",
    removeTasks: "Remove L{TaskBoard.tasks}",
    resources: "Resources",
    save: "Save",
    scrollToColumn: "Scroll to L{TaskBoard.column}",
    scrollToSwimlane: "Scroll to L{TaskBoard.swimlane}",
    zoom: "Zoom"
  },
  TodoListField: {
    add: "Add",
    newTodo: "New todo"
  },
  UndoRedo: {
    UndoLastAction: "Undo",
    RedoLastAction: "Redo"
  }
};
var En_default = LocaleHelper.publishLocale(locale);

// lib/TaskBoard/view/TaskBoardBase.js
var weightSorter = (a, b) => a.weight - b.weight;
var TaskBoardBase = class extends Panel.mixin(
  Pluggable_default,
  State_default,
  Featureable_default,
  Styleable_default,
  CrudManagerView_default,
  ExpandCollapse_default,
  Responsive_default,
  ResponsiveCards_default,
  TaskBoardColumns_default,
  TaskBoardDom_default,
  TaskBoardDomEvents_default,
  TaskBoardScroll_default,
  TaskBoardStores_default,
  TaskBoardSwimlanes_default,
  TaskBoardVirtualization_default,
  TaskItems_default,
  TaskNavigation_default,
  TaskSelection_default
) {
  constructor() {
    super(...arguments);
    __publicField(this, "isInitiallyComposed", false);
    __publicField(this, "domTransitionSuspended", 0);
    __publicField(this, "columnRecomposeQueue", /* @__PURE__ */ new Map());
  }
  //endregion
  //region Overrides
  onPaintOverride() {
  }
  onInternalPaint(...args) {
    if (this.onPaintOverride()) {
      return;
    }
    super.onInternalPaint(...args);
  }
  //endregion
  //region Type assertions and changers/updaters
  changeResourceImagePath(resourceImagePath) {
    ObjectHelper.assertString(resourceImagePath, "resourceImagePath");
    return resourceImagePath;
  }
  changeUseDomTransition(useDomTransition) {
    ObjectHelper.assertBoolean(useDomTransition, "useDomTransition");
    return useDomTransition;
  }
  changeStickyHeaders(stickyHeaders) {
    ObjectHelper.assertBoolean(stickyHeaders, "stickyHeaders");
    return stickyHeaders;
  }
  changeScrollManager(scrollManager, oldScrollManager) {
    oldScrollManager == null ? void 0 : oldScrollManager.destroy();
    if (scrollManager) {
      return ScrollManager.new({
        element: this.element,
        owner: this
      }, scrollManager);
    }
    return null;
  }
  changeShowCountInHeader(showCountInHeader) {
    ObjectHelper.assertBoolean(showCountInHeader, "showCountInHeader");
    return showCountInHeader;
  }
  changeTasksPerRow(tasksPerRow) {
    ObjectHelper.assertNumber(tasksPerRow, "tasksPerRow");
    return tasksPerRow;
  }
  changeSwimlaneRenderer(swimlaneRenderer) {
    ObjectHelper.assertFunction(swimlaneRenderer, "swimlaneRenderer");
    return swimlaneRenderer;
  }
  changeTaskRenderer(taskRenderer) {
    ObjectHelper.assertFunction(taskRenderer, "taskRenderer");
    return taskRenderer;
  }
  changeTaskSorterFn(fn) {
    if (fn === true) {
      return weightSorter;
    }
    fn && ObjectHelper.assertFunction(fn, "taskSorterFn");
    return fn;
  }
  //endregion
  //region Recompose columns
  // Queue a column for recomposition on next frame
  queueColumnRecompose(columnRecord, swimlaneRecord) {
    this.columnRecomposeQueue.set(`${columnRecord.id}.-.${swimlaneRecord == null ? void 0 : swimlaneRecord.id}`, { columnRecord, swimlaneRecord });
    this.recomposeColumns();
  }
  // RAF function to recompose all queued columns
  recomposeColumns() {
    for (const [, { columnRecord, swimlaneRecord }] of this.columnRecomposeQueue) {
      this.recomposeColumn(columnRecord, swimlaneRecord);
    }
    this.columnRecomposeQueue.clear();
  }
  // Recompose a single column / swimlane intersection
  recomposeColumn(columnRecord, swimlaneRecord) {
    const element = this.getSwimlaneColumnElement(swimlaneRecord, columnRecord), domConfig = DomHelper.normalizeChildren(this.renderColumn(swimlaneRecord, columnRecord));
    domConfig.onlyChildren = true;
    DomSync.sync({
      targetElement: element,
      domConfig,
      callback: this.domSyncCallback,
      syncOptions: {
        syncIdField: "column",
        releaseThreshold: 0
      }
    });
  }
  //endregion
  //region Render
  // Creates a DOM config for a single card, calling any configured taskRenderer() in the process
  renderCard(taskRecord, columnRecord, swimlaneRecord) {
    var _a, _b, _c;
    const overriddenCard = super.renderCard(taskRecord, columnRecord, swimlaneRecord);
    if (overriddenCard) {
      return overriddenCard;
    }
    const me = this, { id, domId, eventColor, weight } = taskRecord, color = eventColor || (swimlaneRecord == null ? void 0 : swimlaneRecord.color) || columnRecord.color, namedColor = DomHelper.isNamedColor(color) ? color : null, cardSize = me.getCardSize(columnRecord, swimlaneRecord), cardConfig = {
      id: `${me.id}-card-${domId}`,
      class: {
        "b-taskboard-card": true,
        [`b-taskboard-color-${namedColor}`]: namedColor,
        "b-readonly": taskRecord.readOnly,
        ...taskRecord.cls
      },
      tabIndex: 0,
      dataset: {
        task: domId,
        column: columnRecord.id,
        lane: swimlaneRecord == null ? void 0 : swimlaneRecord.id,
        weight,
        domTransition: true
      },
      style: {
        color: namedColor ? null : color,
        height: (_b = (_a = me.getTaskHeight) == null ? void 0 : _a.call(me, taskRecord)) != null ? _b : null
      },
      elementData: {
        elementType: "task",
        taskId: id,
        taskRecord,
        columnRecord,
        swimlaneRecord
      },
      children: {
        header: {
          tag: "header",
          class: {
            "b-taskboard-card-header": 1
          },
          children: {},
          syncOptions: {
            syncIdField: "role"
          }
        },
        body: {
          tag: "section",
          class: {
            "b-taskboard-card-body": 1
          },
          children: {},
          syncOptions: {
            syncIdField: "role"
          }
        },
        footer: {
          tag: "footer",
          class: {
            "b-taskboard-card-footer": 1
          },
          children: {},
          syncOptions: {
            syncIdField: "role"
          }
        }
      }
    }, { children } = cardConfig, { header, body, footer } = children;
    me.populateCard({
      taskRecord,
      columnRecord,
      swimlaneRecord,
      cardConfig,
      cardSize
    });
    (_c = me.taskRenderer) == null ? void 0 : _c.call(me, {
      taskRecord,
      columnRecord,
      swimlaneRecord,
      cardConfig,
      cardSize
    });
    if (header.html == null && header.text == null && (!header.children || Object.keys(header.children).length === 0)) {
      children.header = null;
    }
    if (body.html == null && body.text == null && (!body.children || Object.keys(body.children).length === 0)) {
      children.body = null;
    }
    if (footer.html == null && footer.text == null && (!footer.children || Object.keys(footer.children).length === 0)) {
      children.footer = null;
    }
    return cardConfig;
  }
  renderColumnHeader(columnRecord) {
    var _a, _b, _c;
    const me = this, { text, id, domId, width, flex, minWidth, color, tooltip } = columnRecord, namedColor = DomHelper.isNamedColor(color) ? color : null, columnHeaderConfig = {
      id: `${me.id}-column-header-${domId}`,
      class: {
        "b-taskboard-column-header": 1,
        "b-fixed-width": width && !flex,
        [`b-taskboard-color-${namedColor}`]: namedColor,
        "b-last": columnRecord === this.columns.last
      },
      style: {
        color: namedColor ? null : color,
        width,
        flex,
        minWidth
      },
      children: {
        padder: {
          class: {
            "b-taskboard-column-header-padder": 1
          },
          children: {
            title: {
              class: {
                "b-taskboard-column-title": 1
              },
              dataset: {
                btip: tooltip
              },
              children: [
                {
                  tag: "span",
                  class: "b-column-title-text",
                  text
                },
                me.showCountInHeader && {
                  tag: "span",
                  class: {
                    "b-taskboard-column-count": 1
                  },
                  html: `(${(_b = (_a = me.getColumnTasks(columnRecord)) == null ? void 0 : _a.length) != null ? _b : 0})`
                }
              ]
            }
          }
        }
      },
      dataset: {
        column: domId,
        domTransition: true
      },
      elementData: {
        elementType: "columnHeader",
        columnId: id
      }
    };
    Tooltip.showOverflow = true;
    me.populateColumnHeader({
      columnRecord,
      columnHeaderConfig
    });
    (_c = me.columnHeaderRenderer) == null ? void 0 : _c.call(me, {
      columnRecord,
      columnHeaderConfig
    });
    return columnHeaderConfig;
  }
  renderColumn(swimlaneRecord, columnRecord) {
    var _a, _b, _c;
    const me = this, {
      taskSorterFn,
      stretchCards,
      columnField,
      swimlaneField
    } = me, {
      width,
      flex,
      id,
      domId,
      minWidth,
      color
    } = columnRecord, { taskStore } = me.project, tasks = taskStore.isTree ? taskStore.query(
      (r) => r[columnField] === id && (!swimlaneField || !swimlaneRecord || r[swimlaneField] === swimlaneRecord.id)
      // Might have no lanes
    ) : Array.from(taskStore.storage.findItem(
      "columnSwimlaneIntersection",
      `${columnRecord.id}-/-${(_a = swimlaneRecord == null ? void 0 : swimlaneRecord.id) != null ? _a : "default"}`
    ) || []), perRow = me.getTasksPerRow(columnRecord, swimlaneRecord), elementId = `${me.id}-column-${(_b = swimlaneRecord == null ? void 0 : swimlaneRecord.domId) != null ? _b : "default"}-${domId}`, namedColor = DomHelper.isNamedColor(color) ? color : null, columnConfig = {
      id: elementId,
      class: {
        "b-taskboard-column": 1,
        "b-fixed-width": width && !flex,
        [`b-${perRow}-task${perRow > 1 ? "s" : ""}-per-row`]: 1,
        "b-inline": perRow > 1,
        [`b-taskboard-color-${namedColor}`]: namedColor,
        "b-last": columnRecord === this.columns.last
      },
      style: {
        color: namedColor ? null : color,
        width,
        flex,
        minWidth
      },
      dataset: {
        column: domId,
        lane: swimlaneRecord == null ? void 0 : swimlaneRecord.id,
        domTransition: true
      },
      elementData: {
        elementType: "column",
        columnId: id,
        laneId: swimlaneRecord == null ? void 0 : swimlaneRecord.id
      },
      // Cards
      children: {
        body: {
          id: `${elementId}-body`,
          class: {
            "b-taskboard-column-body": 1
          },
          dataset: {
            role: "body",
            domTransition: true
          },
          children: [
            {
              class: {
                "b-taskboard-column-body-inner": 1
              },
              style: {
                "grid-template-columns": `repeat(${stretchCards ? Math.min(perRow, tasks.length) : perRow}, 1fr)`
              },
              dataset: {
                role: "inner",
                domTransition: true
              },
              children: (() => {
                if (taskSorterFn) {
                  tasks.sort(taskSorterFn);
                } else {
                  tasks.sort((a, b) => taskStore.indexOf(a) - taskStore.indexOf(b));
                }
                return tasks.map((taskRecord) => me.renderCard(taskRecord, columnRecord, swimlaneRecord));
              })(),
              syncOptions: {
                syncIdField: "task",
                releaseThreshold: me.isVirtualized ? 1e3 : 0
              }
            }
          ],
          syncOptions: {
            syncIdField: "role"
          }
        }
      },
      syncOptions: {
        syncIdField: "role"
      }
    };
    me.populateColumn({
      columnRecord,
      swimlaneRecord,
      columnConfig
    });
    (_c = me.columnRenderer) == null ? void 0 : _c.call(me, {
      columnRecord,
      swimlaneRecord,
      columnConfig
    });
    return columnConfig;
  }
  renderSwimlane(swimlaneRecord) {
    var _a, _b, _c;
    const me = this, { showCountInHeader, columns } = me, {
      id = "default",
      domId = "default",
      text,
      height,
      flex,
      color
    } = swimlaneRecord || {}, elementId = `${me.id}-swimlane-${domId}`, namedColor = DomHelper.isNamedColor(color) ? color : null, swimlaneConfig = {
      id: elementId,
      class: {
        "b-taskboard-swimlane": 1,
        "b-fixed-height": height && !flex,
        "b-last": !swimlaneRecord || swimlaneRecord === me.swimlanes.last,
        [`b-taskboard-color-${namedColor}`]: namedColor
      },
      style: {
        color: namedColor ? null : color,
        height,
        flex
      },
      dataset: {
        lane: domId,
        domTransition: true
      },
      elementData: {
        elementType: "swimlane",
        laneId: id
      },
      children: {
        // If a lane is defined, it has a header
        header: swimlaneRecord && {
          id: `${elementId}-header`,
          tag: "header",
          class: {
            "b-taskboard-swimlane-header": 1
          },
          dataset: {
            role: "header",
            domTransition: "preserve-padding"
          },
          children: {
            title: {
              class: {
                "b-taskboard-swimlane-title": 1
              },
              children: {
                text,
                count: showCountInHeader && {
                  tag: "span",
                  class: {
                    "b-taskboard-swimlane-count": 1
                  },
                  text: `(${(_b = (_a = me.getSwimlaneTasks(swimlaneRecord)) == null ? void 0 : _a.size) != null ? _b : 0})`
                }
              }
            }
          }
        },
        // Lane or no lane, there is always a body to contain columns
        body: {
          id: `${elementId}-body`,
          class: {
            "b-taskboard-swimlane-body": 1
          },
          dataset: {
            role: "body",
            domTransition: true
          },
          // Columns within the lane
          children: columns.map(
            (column) => !column.hidden && me.renderColumn(swimlaneRecord, column)
          ),
          syncOptions: {
            syncIdField: "column",
            releaseThreshold: 0
          }
        }
      },
      syncOptions: {
        syncIdField: "role"
      }
    };
    me.populateSwimlane({
      swimlaneRecord,
      swimlaneConfig
    });
    (_c = me.swimlaneRenderer) == null ? void 0 : _c.call(me, {
      swimlaneRecord,
      swimlaneConfig
    });
    return swimlaneConfig;
  }
  // Creates a DOM config for the entire TaskBoard, rendered to panels body
  get bodyConfig() {
    const me = this, {
      /* eslint-disable no-unused-vars */
      stickyHeaders,
      showCountInHeader,
      columns,
      columnField,
      swimlaneField,
      tasksPerRow,
      headerItems,
      bodyItems,
      footerItems,
      selectedTasks,
      showCollapseInHeader,
      showCollapseTooltip,
      taskSorterFn,
      stretchCards
      /* eslint-enable no-unused-vars */
    } = me;
    if (!me.rendered) {
      me.setTimeout(() => me.recompose(), 0);
      return {
        // Required by panel, it expects a bodyElement reference
        reference: "bodyElement",
        // Listeners are only set up on first sync, has to go here (not internalListeners no purpose, these are
        // EventHelper listeners)
        // eslint-disable-next-line bryntum/no-listeners-in-lib
        listeners: ObjectHelper.assign({ thisObj: me }, me.domListeners)
      };
    }
    const bodyConfig = {
      // Save some processing by not cloning the config, it is regenerated on every compose anyway
      skipClone: true,
      reference: "bodyElement",
      class: {
        "b-taskboard-body": 1,
        "b-sticky-headers": stickyHeaders
      },
      children: [
        // Column headers
        {
          tag: "header",
          id: `${me.id}-column-headers`,
          class: {
            "b-taskboard-column-headers": 1
          },
          children: columns.map((column) => !column.hidden && me.renderColumnHeader(column)),
          dataset: {
            lane: "header",
            domTransition: true
          },
          syncOptions: {
            syncIdField: "column"
          }
        }
      ],
      syncOptions: {
        syncIdField: "lane",
        releaseThreshold: 0,
        ignoreRefs: "children"
        // References in "children" should not be hoisted to the panel
      }
    };
    let { swimlanes } = me;
    if (!(swimlanes == null ? void 0 : swimlanes.count)) {
      swimlanes = [null];
    }
    for (const lane of swimlanes) {
      if (!(lane == null ? void 0 : lane.hidden)) {
        bodyConfig.children.push(me.renderSwimlane(lane));
      }
    }
    me.populateBody({
      bodyConfig
    });
    me.isComposed = true;
    return bodyConfig;
  }
  // For chaining, to decorate dom config
  populateCard(args) {
    var _a;
    (_a = super.populateCard) == null ? void 0 : _a.call(this, args);
  }
  populateColumn(args) {
    var _a;
    (_a = super.populateColumn) == null ? void 0 : _a.call(this, args);
  }
  populateColumnHeader(args) {
    var _a;
    (_a = super.populateColumnHeader) == null ? void 0 : _a.call(this, args);
  }
  populateSwimlane(args) {
    var _a;
    (_a = super.populateSwimlane) == null ? void 0 : _a.call(this, args);
  }
  populateBody(args) {
    var _a;
    (_a = super.populateBody) == null ? void 0 : _a.call(this, args);
  }
  afterRecompose() {
    super.afterRecompose();
    const me = this;
    if (!me.isInitiallyComposed && me.isComposed) {
      me.isInitiallyComposed = true;
      me.initialCompose();
    }
    if (me.project.taskStore.count > 0) {
      me.trigger("renderTasks", { taskRecords: me.project.taskStore.allRecords });
    }
    me.transitionRecompose = null;
  }
  // For chaining, replaces render() since we don't do full compose on render
  initialCompose() {
    this.trigger("initialCompose");
  }
  // For chaining, to react to element changes
  onRenderColumn() {
  }
  onRemoveColumnElement() {
  }
  onRenderSwimlane() {
  }
  onRemoveSwimlaneElement() {
  }
  //endregion
  //region Transition - experimental
  // Prevent dom transitions until resumed
  suspendDomTransition() {
    this.domTransitionSuspended++;
  }
  // Resume dom transitions
  resumeDomTransition() {
    this.domTransitionSuspended--;
  }
  // Recompose transitioning dom
  recomposeWithDomTransition(options) {
    const me = this;
    if (me.useDomTransition && !me.domTransitionSuspended) {
      me.transitionRecompose = {
        selector: "[data-dom-transition]",
        duration: 300,
        element: me._bodyElement,
        // _ needed to not flush recompose if we are dirty
        ...options
      };
    }
    if (me.recompose.suspended) {
      me._recomposeQueued = true;
    } else {
      me.recompose();
    }
  }
  resumeRecompose() {
    super.resumeRecompose();
    if (this._recomposeQueued) {
      this._recomposeQueued = null;
      this.recompose();
    }
  }
  //endregion
  //region Extract configs
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs for the task board, with special handling for columns
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    if (result.columns) {
      delete result.columns.modelClass;
    }
    return result;
  }
  //endregion
  // Expected by CrudManagerView
  refresh() {
    this.recompose();
  }
};
//region Config
__publicField(TaskBoardBase, "$name", "TaskBoardBase");
__publicField(TaskBoardBase, "type", "taskboardbase");
__publicField(TaskBoardBase, "featureable", {
  factory: TaskBoardFeature
});
__publicField(TaskBoardBase, "configurable", {
  /** @hideconfigs autoUpdateRecord, defaultFocus, trapFocus, showTooltipWhenDisabled */
  /** @hideproperties firstItem, lastItem, cellInfo, visibleChildCount */
  /** @hidefunctions getAt */
  layout: "vbox",
  /**
   * An object containing Feature configuration objects (or `true` if no configuration is required)
   * keyed by the Feature class name in all lowercase.
   * @config {Object}
   * @category Common
   */
  features: true,
  /**
   * An empty function by default, but provided so that you can override it. This function is called each time
   * a task is rendered into the task board. It allows you to manipulate the DOM config object used for the card
   * before it is synced to DOM, thus giving you control over styling and contents.
   *
   * NOTE: The function is intended for formatting, you should not update records in it since updating records
   * triggers another round of rendering.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    taskRenderer({ taskRecord, cardConfig }) {
   *        // Add an icon to all tasks header
   *        cardConfig.children.header.children.icon = {
   *            tag   : 'i',
   *            class : 'b-fa b-fa-beer'
   *        }
   *    }
   * });
   * ```
   *
   * For more information, see the [Customize task contents guide](#TaskBoard/guides/customization/taskcontents.md).
   *
   * @config {Function}
   * @param {Object} detail An object containing the information needed to render a task.
   * @param {TaskBoard.model.TaskModel} detail.taskRecord The task record.
   * @param {TaskBoard.model.ColumnModel} detail.columnRecord The column the task will be displayed in.
   * @param {TaskBoard.model.SwimlaneModel} detail.swimlaneRecord The swimlane the task will be displayed in.
   * @param {DomConfig} detail.cardConfig DOM config object for the cards element
   * @returns {void}
   * @category Task content
   */
  taskRenderer: null,
  /**
   * An empty function by default, but provided so that you can override it. This function is called each time
   * a swimlane is rendered into the task board. It allows you to manipulate the DOM config object used for the
   * swimlane before it is synced to DOM, thus giving you control over styling and contents.
   *
   * ```javascript
   * const taskBoard = new TaskBoard({
   *    swimlaneRenderer({ swimlaneRecord, swimlaneConfig }) {
   *        // Add an icon to all swimlane headers
   *        swimlaneConfig.children.header.children.icon = {
   *            tag   : 'i',
   *            class : 'b-fa b-fa-dog'
   *        }
   *    }
   * });
   * ```
   *
   * @config {Function}
   * @param {Object} detail An object containing the information needed to render a swimlane.
   * @param {TaskBoard.model.SwimlaneModel} detail.swimlaneRecord The swimlane.
   * @param {DomConfig} detail.swimlaneConfig DOM config object for the swimlane
   * @returns {void}
   * @category Advanced
   */
  swimlaneRenderer: null,
  /**
   * Controls how many cards are rendered to a row in each column. Can be controlled on a per column basis by
   * setting {@link TaskBoard.model.ColumnModel#field-tasksPerRow}
   *
   * ```javascript
   * new TaskBoard({
   *   tasksPerRow : 3
   * });
   * ```
   *
   * @config {Number}
   * @category Common
   */
  tasksPerRow: 1,
  /**
   * Setting this will cause cards to expand to share the available width if there are fewer than
   * {@link #config-tasksPerRow}.
   *
   * By default, the {@link #config-tasksPerRow} always applies, and if it is 3, then a single
   * card in a column will be 33% of the available width.
   *
   * To have fewer cards than the {@link #config-tasksPerRow} evenly share available column width,
   * configure this as `true`;
   * @prp {Boolean}
   * @category Common
   */
  stretchCards: null,
  /**
   * Show task count for a column in its header, appended after the title
   *
   * ```javascript
   * new TaskBoard({
   *   showCountInHeader : false
   * });
   * ```
   *
   * @config {Boolean}
   * @default
   * @category Common
   */
  showCountInHeader: true,
  /**
   * Makes column and swimlane headers sticky
   *
   * ```javascript
   * new TaskBoard({
   *   stickyHeaders : true
   * });
   * ```
   *
   * @config {Boolean}
   * @default
   * @category Common
   */
  stickyHeaders: false,
  /**
   * Experimental, animate actions that cannot be animated using CSS transitions. Currently includes:
   * * Programmatically moving tasks
   * * Moving tasks using the task editor
   * * Adding tasks
   * * Removing tasks
   * * Sorting tasks
   * * Hiding/showing/filtering columns
   * * Hiding/showing/filtering swimlanes
   *
   * ```javascript
   * new TaskBoard({
   *   useDomTransition : true
   * });
   * ```
   * **NOTE**: This flag is not supported for Lightning Web Components
   * @config {Boolean}
   * @category Experimental
   */
  useDomTransition: false,
  /**
   * Path to load resource images from. Used by the for example the resource picker in the task editor and by the
   * ResourceAvatars task item. Set this to display miniature images for each resource using their `image` field.
   *
   * **NOTE**: The path should end with a `/`:
   *
   * ```javascript
   * new TaskBoard({
   *   resourceImagePath : 'images/resources/'
   * });
   * ```
   *
   * @config {String}
   * @category Common
   */
  resourceImagePath: null,
  /**
   * CSS variable prefix, appended to the keys used in {@link #config-css}.
   *
   * Normally you do not need to change this value.
   *
   * @default
   * @config {String}
   * @category CSS
   */
  cssVarPrefix: "taskboard",
  /**
   * Configuration values for the {@link Core.util.ScrollManager} class. It is used to manage column/body
   * scrolling during task, column or swimlane drag.
   * ```javascript
   * new TaskBoard({
   *     scrollManager : {
   *         zoneWidth   : 100, // increase zone size
   *         scrollSpeed : 3    // and scroll speed
   *     }
   * })
   * ```
   * @config {ScrollManagerConfig}
   * @category Scrolling
   */
  scrollManager: {
    value: {},
    $config: ["nullify", "lazy"]
  },
  /**
   * Allows sorting tasks in the UI independent of how they are sorted in the task store.
   *
   * Specify `true` to force sorting tasks by {@link TaskBoard/model/TaskModel#field-weight}.
   *
   * Supply a [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
   * function to force a custom sort order.
   *
   * This is likely something you will want to use if combining TaskBoard with other products, sharing the
   * project. Without this, sorting tasks in for example Gantt will also rearrange the cards on the board.
   *
   * As described above it accepts either a boolean or a Function, but it always returns a sorter function.
   *
   * @prp {Function} taskSorterFn
   * @accepts {Boolean|Function}
   * @config {Function}
   * @param {TaskBoard.model.TaskModel} first The first task to compare
   * @param {TaskBoard.model.TaskModel} second The second task to compare
   * @returns {Number} Return `1` if first task is greater than second task, `-1` if the opposite is true or `0`
   * if they are equal
   * @category Advanced
   */
  taskSorterFn: null,
  /**
   * See {@link TaskBoard.view.TaskBoard#keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<String,String>} keyMap
   * @category Common
   */
  contentElMutationObserver: false,
  textContent: false,
  // We can scroll in both axes.
  // Scrollable also syncs the b-horizontal-overflow and b-vertical-overflow classes
  // to allow styles to depend upon overflow state.
  scrollable: true
});
__publicField(TaskBoardBase, "delayable", {
  recomposeColumns: "raf"
});
TaskBoardBase.initClass();
VersionHelper.setVersion("taskboard", "5.6.2");
TaskBoardBase._$name = "TaskBoardBase";

// lib/TaskBoard/view/item/TaskMenuItem.js
var TaskMenuItem = class extends TaskItem {
  static render({ taskBoard, domConfig }) {
    if (!taskBoard.features.taskMenu || taskBoard.features.taskMenu.disabled) {
      return false;
    }
    domConfig.tag = "button";
    domConfig.class["b-icon b-icon-menu-horizontal"] = 1;
  }
  static onClick({ source: taskBoard, event }) {
    var _a;
    (_a = taskBoard.features.taskMenu) == null ? void 0 : _a.showContextMenu(event, { target: event.target });
  }
};
__publicField(TaskMenuItem, "$name", "TaskMenuItem");
__publicField(TaskMenuItem, "type", "taskMenu");
/**
 * @hideconfigs editor
 */
__publicField(TaskMenuItem, "defaultEditor", null);
TaskMenuItem.initClass();
TaskMenuItem._$name = "TaskMenuItem";

// lib/TaskBoard/view/TaskBoard.js
var TaskBoard = class extends TaskBoardBase {
};
__publicField(TaskBoard, "$name", "TaskBoard");
__publicField(TaskBoard, "type", "taskboard");
__publicField(TaskBoard, "configurable", {
  //region Hidden members
  /**
   * @hideconfigs crudManager, crudManagerClass, contentElementCls, htmlCls, defaults, hideWhenEmpty, itemCls, items, layout, layoutStyle, lazyItems, namedItems, textContent, content, html, defaultBindProperty, monitorResize, ripple, tooltip, tag, textAlign, preventTooltipOnTouch
   */
  /**
   * @hideproperties $name, isSettingValues, isValid, items, layout, record, values, content, contentElement, focusElement, html, overflowElement, layoutStyle, tooltip, scrollable
   */
  /**
   * @hidefunctions attachTooltip, isOfTypeName, mixin, optionalL, callback, resolveCallback, add, getWidgetById, insert, processWidgetConfig, remove, removeAll, construct, doDestroy, updateLocalization, compose, eachAncestor, eachWidget, query, queryAll, L
   */
  /**
   * @event beforeSetRecord
   * @hide
   */
  //endregion
  features: {
    columnHeaderMenu: true,
    columnToolbars: true,
    taskDrag: true,
    taskDragSelect: true,
    taskEdit: true,
    taskMenu: true
  }
});
TaskBoard.initClass();
TaskBoard._$name = "TaskBoard";

// lib/TaskBoard/widget/ColumnFilterField.js
var ColumnFilterField = class extends FilterField.mixin(TaskBoardLinked_default) {
};
__publicField(ColumnFilterField, "$name", "ColumnFilterField");
__publicField(ColumnFilterField, "type", "columnfilterfield");
__publicField(ColumnFilterField, "configurable", {
  /**
   * @hideconfigs store, filterFunction
   */
  store: "this.taskBoard.columns",
  /**
   * The ColumnModel field name to filter by, defaults to `'text'`.
   * @config {String}
   * @default
   * @category Common
   */
  field: "text",
  /**
   * Label, defaults to a localized version of `'Filter columns'`.
   *
   * Content is determined by the `TaskBoard.filterColumns` key in the applied locale.
   *
   * @config {String}
   * @category Label
   */
  label: "L{TaskBoard.filterColumns}",
  width: "20em",
  triggers: {
    filter: {
      cls: "b-icon b-icon-filter",
      align: "start"
    }
  }
});
ColumnFilterField.initClass();
ColumnFilterField._$name = "ColumnFilterField";

// lib/TaskBoard/widget/ColumnPickerButton.js
var ColumnPickerButton = class extends Button.mixin(TaskBoardLinked_default) {
  onToggleColumn({ item }) {
    item.column.hidden = !item.checked;
  }
  // Populate menu before each show to make sure it is up to date
  onMenuBeforeShow(info) {
    super.onMenuBeforeShow(info);
    info.source.items = this.taskBoard.columns.map((column) => ({
      ref: column.id,
      text: StringHelper.encodeHtml(column.text),
      checked: !column.hidden,
      column,
      onItem: "up.onToggleColumn"
    }));
  }
};
__publicField(ColumnPickerButton, "$name", "ColumnPickerButton");
__publicField(ColumnPickerButton, "type", "columnpickerbutton");
__publicField(ColumnPickerButton, "configurable", {
  text: "L{TaskBoard.Columns}",
  icon: "b-icon-picker",
  pressedIcon: "b-icon-picker-rotated",
  iconAlign: "end",
  menuIcon: null,
  // items null needed to not be considered an object holding menu items
  menu: { items: null }
});
ColumnPickerButton.initClass();
ColumnPickerButton._$name = "ColumnPickerButton";

// lib/TaskBoard/widget/ColumnScrollButton.js
var ColumnScrollButton = class extends Button.mixin(TaskBoardLinked_default) {
  onClickColumn({ item }) {
    this.setTimeout(() => {
      var _a;
      return (_a = this.taskBoard) == null ? void 0 : _a.scrollToColumn(item.column);
    }, 100);
  }
  changeMenu(menu) {
    if (menu) {
      menu = this.taskBoard.columns.map((column) => ({
        ref: column.id,
        text: StringHelper.encodeHtml(column.text),
        column,
        onItem: "up.onClickColumn"
      }));
    }
    return super.changeMenu(menu);
  }
};
__publicField(ColumnScrollButton, "$name", "ColumnScrollButton");
__publicField(ColumnScrollButton, "type", "columnscrollbutton");
__publicField(ColumnScrollButton, "configurable", {
  text: "L{TaskBoard.scrollToColumn}",
  icon: "b-icon-picker",
  pressedIcon: "b-icon-picker-rotated",
  iconAlign: "end",
  menuIcon: null,
  menu: []
});
ColumnScrollButton.initClass();
ColumnScrollButton._$name = "ColumnScrollButton";

// lib/TaskBoard/widget/ProjectCombo.js
var ProjectCombo2 = class extends ProjectCombo.mixin(TaskBoardLinked_default) {
  updateTaskBoard(taskBoard) {
    if (taskBoard) {
      this.project = taskBoard.project;
    }
  }
  afterConfigure() {
    if (!this._taskBoard) {
      this.updateTaskBoard(this.taskBoard);
    }
  }
};
__publicField(ProjectCombo2, "$name", "ProjectCombo");
__publicField(ProjectCombo2, "type", "taskboardprojectcombo");
__publicField(ProjectCombo2, "configurable", {
  /**
   * Project to reconfigure when picking an item. Resolved automatically if a TaskBoard is configured or detected.
   * @config {TaskBoard.model.ProjectModel}
   * @category Common
   */
  project: null
});
ProjectCombo2.initClass();
ProjectCombo2._$name = "ProjectCombo";

// lib/TaskBoard/widget/SwimlaneFilterField.js
var SwimlaneFilterField = class extends FilterField.mixin(TaskBoardLinked_default) {
};
__publicField(SwimlaneFilterField, "$name", "SwimlaneFilterField");
__publicField(SwimlaneFilterField, "type", "swimlanefilterfield");
__publicField(SwimlaneFilterField, "configurable", {
  store: "this.taskBoard.swimlanes",
  field: "text",
  label: "L{TaskBoard.filterSwimlanes}",
  width: "20em",
  triggers: {
    filter: {
      cls: "b-icon b-icon-filter",
      align: "start"
    }
  }
});
SwimlaneFilterField.initClass();
SwimlaneFilterField._$name = "SwimlaneFilterField";

// lib/TaskBoard/widget/SwimlanePickerButton.js
var SwimlanePickerButton = class extends Button.mixin(TaskBoardLinked_default) {
  onToggleSwimlane({ item }) {
    item.swimlane.hidden = !item.checked;
  }
  // Populate menu before each show to make sure it is up to date
  onMenuBeforeShow(info) {
    super.onMenuBeforeShow(info);
    info.source.items = this.taskBoard.swimlanes.map((swimlane) => ({
      ref: swimlane.id,
      text: StringHelper.encodeHtml(swimlane.text),
      checked: !swimlane.hidden,
      swimlane,
      onItem: "up.onToggleSwimlane"
    }));
  }
};
__publicField(SwimlanePickerButton, "$name", "SwimlanePickerButton");
__publicField(SwimlanePickerButton, "type", "swimlanepickerbutton");
__publicField(SwimlanePickerButton, "configurable", {
  text: "L{TaskBoard.Swimlanes}",
  icon: "b-icon-picker",
  pressedIcon: "b-icon-picker-rotated",
  iconAlign: "end",
  menuIcon: null,
  // items null needed to not be considered an object holding menu items
  menu: { items: null }
});
SwimlanePickerButton.initClass();
SwimlanePickerButton._$name = "SwimlanePickerButton";

// lib/TaskBoard/widget/SwimlaneScrollButton.js
var SwimlaneScrollButton = class extends Button.mixin(TaskBoardLinked_default) {
  onClickSwimlane({ item }) {
    this.setTimeout(() => {
      var _a;
      return (_a = this.taskBoard) == null ? void 0 : _a.scrollToSwimlane(item.swimlane);
    }, 100);
  }
  changeMenu(menu) {
    if (menu) {
      menu = this.taskBoard.swimlanes.map((swimlane) => ({
        ref: swimlane.id,
        text: StringHelper.encodeHtml(swimlane.text),
        swimlane,
        onItem: "up.onClickSwimlane"
      }));
    }
    return super.changeMenu(menu);
  }
};
__publicField(SwimlaneScrollButton, "$name", "SwimlaneScrollButton");
__publicField(SwimlaneScrollButton, "type", "swimlanescrollbutton");
__publicField(SwimlaneScrollButton, "configurable", {
  text: "L{TaskBoard.scrollToSwimlane}",
  icon: "b-icon-picker",
  pressedIcon: "b-icon-picker-rotated",
  iconAlign: "end",
  menuIcon: null,
  menu: []
});
SwimlaneScrollButton.initClass();
SwimlaneScrollButton._$name = "SwimlaneScrollButton";

// lib/TaskBoard/widget/TaskFilterField.js
var TaskFilterField = class extends FilterField.mixin(TaskBoardLinked_default) {
};
__publicField(TaskFilterField, "$name", "TaskFilterField");
__publicField(TaskFilterField, "type", "taskfilterfield");
__publicField(TaskFilterField, "configurable", {
  store: "this.taskBoard.project.taskStore",
  field: "name",
  label: "L{TaskBoard.filterTasks}",
  width: "20em",
  triggers: {
    filter: {
      cls: "b-icon b-icon-filter",
      align: "start"
    }
  }
});
TaskFilterField.initClass();
TaskFilterField._$name = "TaskFilterField";

// lib/TaskBoard/widget/TodoListField.js
var TodoListField = class extends Field {
  compose() {
    const { editableItems } = this;
    return {
      class: {
        "b-editable": editableItems
      }
    };
  }
  changeList(list) {
    return Widget.create(ObjectHelper.assign({
      // List does not support remapping out of the box
      itemTpl: (record) => StringHelper.xss`<div class="b-todo-text">${record.getValue(this.textField)}</div><i class='b-todo-edit b-icon b-icon-edit' data-noselect></i>`
    }, list));
  }
  updateList(list) {
    list.ion({
      item: "onItemClick",
      thisObj: this
    });
    list.ion({
      selectionChange: "onSelectionChange",
      thisObj: this
    });
  }
  changeAddButton(button) {
    const result = Widget.create(button);
    this.ariaElement = result.element;
    return result;
  }
  updateAddButton(button) {
    button.ion({
      click: "onAddClick",
      thisObj: this
    });
  }
  get childItems() {
    return [this.list, this.addButton];
  }
  get inputElement() {
    return this.list.element;
  }
  get innerElements() {
    return super.innerElements.concat(this.addButton.element);
  }
  changeValue(value) {
    value = value || [];
    let autoUpdate = false;
    this.eachAncestor((a) => {
      if (a.autoUpdateRecord) {
        autoUpdate = true;
        return false;
      }
    });
    this.originalValue = autoUpdate ? value : ObjectHelper.clone(value);
    if (value) {
      value = ObjectHelper.clone(value);
      value.forEach((v, i) => {
        v.id = i + 1;
        v.originalIndex = i;
      });
    }
    return value;
  }
  updateValue(value) {
    if (value) {
      const me = this;
      me.list.items = value;
      me.isSettingValue = true;
      me.list.selected.values = value.filter((v) => v[me.checkedField]);
      me.isSettingValue = false;
    }
  }
  get value() {
    return this.originalValue.slice();
  }
  set value(value) {
    super.value = value;
  }
  // Cant be invalid currently
  get isValid() {
    return true;
  }
  // Edit a todo item, using overlaid editor
  editItem(record, element) {
    const me = this, editor = new Editor({
      appendTo: me.element,
      owner: me,
      cls: "b-todo-editor",
      inputField: {
        type: "text",
        triggers: {
          remove: {
            cls: "b-todo-remove b-icon-trash",
            handler() {
              me.removeItem(record);
              editor.cancelEdit();
            }
          }
        }
      },
      // Above modal
      style: "z-index : 20000",
      internalListeners: {
        complete({ value }) {
          me.originalValue[record.originalIndex][me.textField] = value;
          me.triggerFieldChange({ value: me.value, userAction: true });
        },
        finishEdit() {
          editor.destroy();
        },
        thisObj: me
      }
    });
    editor.startEdit({
      target: element,
      record,
      field: me.textField
    });
  }
  // Remove a todo item, updating both the list and the original value
  removeItem(record) {
    const me = this, { originalIndex } = record;
    me.list.store.forEach((r) => {
      if (r.parentIndex > record.parentIndex) {
        r.originalIndex--;
      }
    });
    me.list.store.remove(record);
    me.originalValue.splice(originalIndex, 1);
    me.triggerFieldChange({ value: me.value, userAction: true });
  }
  // Lists selection model is used to check/uncheck todo items. React on changes here
  onSelectionChange() {
    const me = this, { list } = me;
    if (!me.isSettingValue) {
      me.originalValue.forEach((v, i) => {
        const listRecord = list.store.getAt(i);
        if (listRecord) {
          v[me.checkedField] = list.selected.includes(listRecord);
        }
      });
      me.triggerFieldChange({ value: me.value, userAction: true });
    }
  }
  // Clicked on a list item, react if it is on the edit icon
  onItemClick({ record, event }) {
    if (event.target.matches(".b-todo-edit")) {
      this.editItem(record, event.target.closest(".b-list-item"));
    }
  }
  // Clicked the add button, add to original value and then plug it back in to not have to care about syncing it with
  // lists store
  onAddClick() {
    const me = this;
    me.originalValue.push({
      [me.textField]: me.L("L{newTodo}"),
      [me.checkedField]: false
    });
    me.value = me.originalValue;
    me.triggerFieldChange({ value: me.value, userAction: true });
  }
};
__publicField(TodoListField, "$name", "TodoListField");
__publicField(TodoListField, "type", "todolistfield");
__publicField(TodoListField, "alias", "todolist");
__publicField(TodoListField, "configurable", {
  /**
   * Name of a property on a todo item to display as its text.
   *
   * @config {String}
   * @category Common
   * @default
   */
  textField: "text",
  /**
   * Name of a property on a todo item to use for the checkbox. The property is expected to be a boolean.
   *
   * @config {String}
   * @category Common
   * @default
   */
  checkedField: "checked",
  /**
   * Configure as `false` to hide the per item edit button and the add item button. Users can still check/uncheck
   * items.
   *
   * @config {Boolean}
   * @default
   */
  editableItems: true,
  list: {
    type: "list",
    multiSelect: true,
    store: {
      fields: []
    },
    itemIconTpl() {
      return `<i class="b-todo-checkbox b-icon"></i>`;
    }
  },
  addButton: {
    type: "button",
    cls: "b-todo-add",
    icon: "b-icon-add",
    text: "L{TodoListField.add}"
  },
  role: null
});
TodoListField.initClass();
TodoListField._$name = "TodoListField";

// lib/TaskBoard/widget/UndoRedo.js
var UndoRedo = class extends UndoRedoBase.mixin(TaskBoardLinked_default) {
  construct() {
    super.construct(...arguments);
    this.stm = this.taskBoard.project.stm;
  }
};
__publicField(UndoRedo, "$name", "UndoRedo");
__publicField(UndoRedo, "type", "taskboardundoredo");
UndoRedo.initClass();
UndoRedo._$name = "UndoRedo";

// lib/TaskBoard/widget/ZoomSlider.js
var ZoomSlider = class extends Slider.mixin(TaskBoardLinked_default) {
  calculateValue(input) {
    return this.max - input + 1;
  }
  afterConstruct() {
    this.value = this.calculateValue(this.taskBoard.tasksPerRow);
  }
  onInput({ value }) {
    this.taskBoard.tasksPerRow = this.calculateValue(value);
  }
  updateValue(value) {
    super.updateValue(value);
    this.onInput({ value });
  }
  getTooltipHtml(value) {
    const tasksPerRow = this.calculateValue(value);
    return `${tasksPerRow} card${tasksPerRow === 1 ? "" : "s"} per row`;
  }
};
__publicField(ZoomSlider, "$name", "ZoomSlider");
__publicField(ZoomSlider, "type", "zoomslider");
__publicField(ZoomSlider, "configurable", {
  text: "L{TaskBoard.zoom}",
  max: 10,
  min: 1,
  // Override default to avoid hitting updater, value set in afterConstruct
  value: null,
  showValue: false
});
ZoomSlider.initClass();
ZoomSlider._$name = "ZoomSlider";
export {
  AbstractCrudManager,
  AbstractCrudManagerMixin_default as AbstractCrudManagerMixin,
  AbstractCrudManagerValidation_default as AbstractCrudManagerValidation,
  AjaxTransport_default as AjaxTransport,
  AssignmentModel,
  AssignmentModelMixin_default as AssignmentModelMixin,
  AssignmentStore,
  AssignmentStoreMixin_default as AssignmentStoreMixin,
  ColorBoxCombo,
  ColumnCombo,
  ColumnDrag,
  ColumnFilterField,
  ColumnHeaderMenu,
  ColumnModel,
  ColumnPickerButton,
  ColumnScrollButton,
  ColumnToolbars,
  CrudManager,
  CrudManagerView_default as CrudManagerView,
  DependencyBaseModel,
  DependencyModel,
  DependencyStore,
  DependencyStoreMixin_default as DependencyStoreMixin,
  EventModel,
  EventModelMixin_default as EventModelMixin,
  EventStore,
  EventStoreMixin_default as EventStoreMixin,
  ExpandCollapse_default as ExpandCollapse,
  GetEventsMixin_default as GetEventsMixin,
  GridRowModel,
  ImageItem,
  JsonEncoder_default as JsonEncoder,
  JsxItem,
  PartOfProject_default as PartOfProject,
  ProgressItem,
  ProjectCombo2 as ProjectCombo,
  ProjectCrudManager_default as ProjectCrudManager,
  ProjectModel2 as ProjectModel,
  ProjectModelCommon_default as ProjectModelCommon,
  ProjectModelMixin_default as ProjectModelMixin,
  ProjectModelTimeZoneMixin_default as ProjectModelTimeZoneMixin,
  RatingItem,
  RecurrenceModel,
  RecurringEventsMixin_default as RecurringEventsMixin,
  RecurringTimeSpan_default as RecurringTimeSpan,
  RecurringTimeSpansMixin_default as RecurringTimeSpansMixin,
  ResourceAvatarsItem,
  ResourceModel,
  ResourceModelMixin_default as ResourceModelMixin,
  ResourceStore,
  ResourceStoreMixin_default as ResourceStoreMixin,
  ResourceTimeRangeModel,
  ResourceTimeRangeStore,
  ResourcesCombo,
  ResponsiveCards_default as ResponsiveCards,
  ProjectCombo as SchedulerProjectCombo,
  ProjectModel as SchedulerProjectModel,
  SeparatorItem,
  SimpleTaskEdit,
  SwimlaneCombo,
  SwimlaneDrag,
  SwimlaneFilterField,
  SwimlaneModel,
  SwimlanePickerButton,
  SwimlaneScrollButton,
  TagCombo,
  TagsItem,
  TaskBoard,
  TaskBoardBase,
  TaskBoardColumns_default as TaskBoardColumns,
  TaskBoardDom_default as TaskBoardDom,
  TaskBoardDomEvents_default as TaskBoardDomEvents,
  TaskBoardFeature,
  TaskBoardLinked_default as TaskBoardLinked,
  TaskBoardScroll_default as TaskBoardScroll,
  TaskBoardStores_default as TaskBoardStores,
  TaskBoardSwimlanes_default as TaskBoardSwimlanes,
  TaskBoardVirtualization_default as TaskBoardVirtualization,
  TaskColorCombo,
  TaskColorPicker,
  TaskDrag,
  TaskDragSelect,
  TaskEdit,
  TaskEditor,
  TaskFilterField,
  TaskItem,
  TaskItems_default as TaskItems,
  TaskMenu,
  TaskModel,
  TaskNavigation_default as TaskNavigation,
  TaskSelection_default as TaskSelection,
  TaskStore,
  TaskTooltip,
  TemplateItem,
  TextItem,
  TimeRangeModel,
  TimeRangeStore,
  TimeSpan,
  TimeZonedDatesMixin_default as TimeZonedDatesMixin,
  TodoListField,
  TodoListItem,
  UndoRedo,
  ZoomSlider
};
//# sourceMappingURL=taskboard.module.thin.js.map
