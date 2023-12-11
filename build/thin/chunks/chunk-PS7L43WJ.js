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
  Histogram,
  Scale
} from "./chunk-DAJIBEHV.js";
import {
  AbstractTimeRanges,
  DragBase,
  DragCreateBase,
  TooltipBase
} from "./chunk-PFWHNAB4.js";
import {
  AttachToProjectMixin_default,
  TimelineBase
} from "./chunk-MS4QMERY.js";
import {
  Column,
  ColumnStore,
  CopyPasteBase,
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  DependencyModel,
  TimeSpan
} from "./chunk-KVD75ID2.js";
import {
  ArrayHelper,
  Base,
  DateHelper,
  Delayable_default,
  DomHelper,
  DomSync,
  Duration,
  EventHelper,
  InstancePlugin,
  ObjectHelper,
  Objects,
  Popup,
  Rectangle,
  StringHelper,
  Tooltip,
  __publicField,
  parseAlign
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/column/ScaleColumn.js
var ScaleColumn = class extends Column {
  static get fields() {
    return [
      "scalePoints"
    ];
  }
  static get defaults() {
    return {
      text: "\xA0",
      width: 40,
      minWidth: 40,
      field: "scalePoints",
      cellCls: "b-scale-cell",
      editor: false,
      sortable: false,
      groupable: false,
      filterable: false,
      alwaysClearCell: false,
      scalePoints: null
    };
  }
  //endregion
  //region Constructor/Destructor
  onDestroy() {
    this.scaleWidget.destroy();
  }
  //endregion
  //region Internal
  set width(width) {
    super.width = width;
    this.scaleWidget.width = width;
  }
  get width() {
    return super.width;
  }
  applyValue(useProp, key, value) {
    if (key === "scalePoints") {
      this.scaleWidget[key] = value;
    }
    return super.applyValue(...arguments);
  }
  buildScaleWidget() {
    const me = this;
    const scaleWidget = new Scale({
      owner: me.grid,
      appendTo: me.grid.floatRoot,
      cls: "b-hide-offscreen",
      align: "right",
      scalePoints: me.scalePoints,
      monitorResize: false
    });
    Object.defineProperties(scaleWidget, {
      width: {
        get() {
          return me.width;
        },
        set(width) {
          this.element.style.width = `${width}px`;
          this._width = me.width;
        }
      },
      height: {
        get() {
          return this._height;
        },
        set(height) {
          this.element.style.height = `${height}px`;
          this._height = height;
        }
      }
    });
    scaleWidget.width = me.width;
    return scaleWidget;
  }
  get scaleWidget() {
    const me = this;
    if (!me._scaleWidget) {
      me._scaleWidget = me.buildScaleWidget();
    }
    return me._scaleWidget;
  }
  //endregion
  //region Render
  renderer({ cellElement, value, scaleWidgetConfig, scaleWidget = this.scaleWidget }) {
    ObjectHelper.assign(scaleWidget, {
      scalePoints: value || this.scalePoints,
      height: this.grid.rowHeight
    }, scaleWidgetConfig);
    scaleWidget.refresh();
    const scaleCloneElement = scaleWidget.element.cloneNode(true);
    scaleCloneElement.removeAttribute("id");
    scaleCloneElement.classList.remove("b-hide-offscreen");
    cellElement.innerHTML = "";
    cellElement.appendChild(scaleCloneElement);
  }
  //endregion
};
//region Config
__publicField(ScaleColumn, "$name", "ScaleColumn");
__publicField(ScaleColumn, "type", "scale");
__publicField(ScaleColumn, "isScaleColumn", true);
ColumnStore.registerColumnType(ScaleColumn);
ScaleColumn._$name = "ScaleColumn";

// ../Scheduler/lib/Scheduler/feature/base/ResourceTimeRangesBase.js
var ResourceTimeRangesBase = class extends InstancePlugin.mixin(AttachToProjectMixin_default) {
  static get pluginConfig() {
    return {
      chain: ["getEventsToRender", "onEventDataGenerated", "noFeatureElementsInAxis"],
      override: ["matchScheduleCell", "resolveResourceRecord"]
    };
  }
  // Let Scheduler know if we have ResourceTimeRanges in view or not
  noFeatureElementsInAxis() {
    const { timeAxis } = this.client;
    return !this.needsRefresh && this.store && !this.store.storage.values.some((t) => timeAxis.isTimeSpanInAxis(t));
  }
  //endregion
  //region Init
  doDisable(disable) {
    if (this.client.isPainted) {
      this.client.refresh();
    }
    super.doDisable(disable);
  }
  updateTabIndex() {
    if (!this.isConfiguring) {
      this.client.refresh();
    }
  }
  //endregion
  getEventsToRender(resource, events) {
    throw new Error("Implement in subclass");
  }
  // Called for each event during render, allows manipulation of render data. Adjust any resource time ranges
  // (chained function from Scheduler)
  onEventDataGenerated(renderData) {
    const me = this, { client } = me, { eventRecord, iconCls } = renderData;
    if (me.shouldInclude(eventRecord)) {
      if (client.isVertical) {
        renderData.width = renderData.resourceRecord.columnWidth || client.resourceColumnWidth;
      } else {
        renderData.top = 0;
      }
      renderData.fillSize = true;
      renderData.wrapperCls["b-sch-resourcetimerange"] = 1;
      if (me.rangeCls) {
        renderData.wrapperCls[me.rangeCls] = 1;
      }
      renderData.wrapperCls[`b-sch-color-${eventRecord.timeRangeColor}`] = eventRecord.timeRangeColor;
      me.renderContent(eventRecord, renderData);
      renderData.children.push(renderData.eventContent);
      renderData.tabIndex = me.tabIndex != null ? String(me.tabIndex) : null;
      if ((iconCls == null ? void 0 : iconCls.length) > 0) {
        renderData.children.unshift({
          tag: "i",
          className: iconCls.toString()
        });
      }
      renderData.eventId = me.generateElementId(eventRecord);
    }
  }
  renderContent(eventRecord, renderData) {
    renderData.eventContent.text = eventRecord.name;
  }
  /**
   * Generates ID from the passed time range record
   * @param {Scheduler.model.TimeSpan} record
   * @returns {String} Generated ID for the DOM element
   * @internal
   */
  generateElementId(record) {
    return record.domId;
  }
  resolveResourceTimeRangeRecord(rangeElement) {
    var _a;
    return (_a = rangeElement == null ? void 0 : rangeElement.closest(`.${this.rangeCls}`)) == null ? void 0 : _a.elementData.eventRecord;
  }
  getElementFromResourceTimeRangeRecord(record) {
    return this.client.foregroundCanvas.syncIdMap[record.domId];
  }
  resolveResourceRecord(event) {
    var _a;
    const record = this.overridden.resolveResourceRecord(...arguments);
    return record || ((_a = this.resolveResourceTimeRangeRecord(event.target || event)) == null ? void 0 : _a.resource);
  }
  shouldInclude(eventRecord) {
    throw new Error("Implement in subclass");
  }
  // Called when a ResourceTimeRangeModel is manipulated, relays to Scheduler#onInternalEventStoreChange which updates to UI
  onStoreChange(event) {
    if (event.action === "removeall" || event.action === "dataset") {
      this.needsRefresh = true;
    }
    this.client.onInternalEventStoreChange(event);
    this.needsRefresh = false;
  }
  // Override to let scheduler find the time cell from a resource time range element
  matchScheduleCell(target) {
    let cell = this.overridden.matchScheduleCell(target);
    if (!cell && this.enableMouseEvents) {
      const { client } = this, rangeElement = target.closest(`.${this.rangeCls}`);
      cell = rangeElement && client.getCell({
        record: client.isHorizontal ? rangeElement.elementData.resource : client.store.first,
        column: client.timeAxisColumn
      });
    }
    return cell;
  }
  handleRangeMouseEvent(domEvent) {
    var _a;
    const me = this, rangeElement = domEvent.target.closest(`.${me.rangeCls}`);
    if (rangeElement) {
      const eventName = (_a = EventHelper.eventNameMap[domEvent.type]) != null ? _a : StringHelper.capitalize(domEvent.type), resourceTimeRangeRecord = me.resolveResourceTimeRangeRecord(rangeElement);
      me.client.trigger(me.entityName + eventName, {
        feature: me,
        [`${me.entityName}Record`]: resourceTimeRangeRecord,
        resourceRecord: me.client.resourceStore.getById(resourceTimeRangeRecord.resourceId),
        domEvent
      });
    }
  }
  updateEnableMouseEvents(enable) {
    var _a;
    const me = this, { client } = me;
    (_a = me.mouseEventsDetacher) == null ? void 0 : _a.call(me);
    me.mouseEventsDetacher = null;
    if (enable) {
      let attachMouseEvents = function() {
        me.mouseEventsDetacher = EventHelper.on({
          element: client.foregroundCanvas,
          delegate: `.${me.rangeCls}`,
          mousedown: "handleRangeMouseEvent",
          mouseup: "handleRangeMouseEvent",
          click: "handleRangeMouseEvent",
          dblclick: "handleRangeMouseEvent",
          contextmenu: "handleRangeMouseEvent",
          mouseover: "handleRangeMouseEvent",
          mouseout: "handleRangeMouseEvent",
          thisObj: me
        });
      };
      client.whenVisible(attachMouseEvents);
    }
    client.element.classList.toggle("b-interactive-resourcetimeranges", Boolean(enable));
  }
};
//region Config
__publicField(ResourceTimeRangesBase, "configurable", {
  /**
   * Specify value to use for the tabIndex attribute of range elements
   * @config {Number}
   * @category Misc
   */
  tabIndex: null,
  entityName: "resourceTimeRange"
});
ResourceTimeRangesBase.featureClass = "";
ResourceTimeRangesBase._$name = "ResourceTimeRangesBase";

// ../Scheduler/lib/Scheduler/view/DependencyEditor.js
var DependencyEditor = class extends Popup {
  static get $name() {
    return "DependencyEditor";
  }
  static get defaultConfig() {
    return {
      items: [],
      draggable: {
        handleSelector: ":not(button,.b-field-inner)"
        // blacklist buttons and field inners
      },
      axisLock: "flexible"
    };
  }
  processWidgetConfig(widget) {
    const { dependencyEditFeature } = this;
    if (widget.ref === "lagField" && !dependencyEditFeature.showLagField) {
      return false;
    }
    if (widget.ref === "deleteButton" && !dependencyEditFeature.showDeleteButton) {
      return false;
    }
    return super.processWidgetConfig(widget);
  }
  afterShow(...args) {
    const { deleteButton } = this.widgetMap;
    if (deleteButton) {
      deleteButton.hidden = !this.record.isPartOfStore();
    }
    super.afterShow(...args);
  }
  onInternalKeyDown(event) {
    this.trigger("keyDown", { event });
    super.onInternalKeyDown(event);
  }
};
DependencyEditor._$name = "DependencyEditor";

// ../Scheduler/lib/Scheduler/feature/DependencyEdit.js
var DependencyEdit = class extends InstancePlugin {
  //region Config
  static get $name() {
    return "DependencyEdit";
  }
  static get configurable() {
    return {
      /**
       * True to hide this editor if a click is detected outside it (defaults to true)
       * @config {Boolean}
       * @default
       * @category Editor
       */
      autoClose: true,
      /**
       * True to save and close this panel if ENTER is pressed in one of the input fields inside the panel.
       * @config {Boolean}
       * @default
       * @category Editor
       */
      saveAndCloseOnEnter: true,
      /**
       * True to show a delete button in the form.
       * @config {Boolean}
       * @default
       * @category Editor widgets
       */
      showDeleteButton: true,
      /**
       * The event that shall trigger showing the editor. Defaults to `dependencydblclick`, set to empty string or
       * `null` to disable editing of dependencies.
       * @config {String}
       * @default
       * @category Editor
       */
      triggerEvent: "dependencydblclick",
      /**
       * True to show the lag field for the dependency
       * @config {Boolean}
       * @default
       * @category Editor widgets
       */
      showLagField: false,
      dependencyRecord: null,
      /**
       * Default editor configuration, used to configure the Popup.
       * @config {PopupConfig}
       * @category Editor
       */
      editorConfig: {
        title: "L{Edit dependency}",
        localeClass: this,
        closable: true,
        defaults: {
          localeClass: this
        },
        items: {
          /**
           * Reference to the from name
           * @member {Core.widget.DisplayField} fromNameField
           * @readonly
           */
          fromNameField: {
            type: "display",
            weight: 100,
            label: "L{From}"
          },
          /**
           * Reference to the to name field
           * @member {Core.widget.DisplayField} toNameField
           * @readonly
           */
          toNameField: {
            type: "display",
            weight: 200,
            label: "L{To}"
          },
          /**
           * Reference to the type field
           * @member {Core.widget.Combo} typeField
           * @readonly
           */
          typeField: {
            type: "combo",
            weight: 300,
            label: "L{Type}",
            name: "type",
            editable: false,
            valueField: "id",
            displayField: "name",
            localizeDisplayFields: true,
            buildItems: function() {
              const dialog = this.parent;
              return Object.keys(DependencyModel.Type).map((type) => ({
                id: DependencyModel.Type[type],
                name: dialog.L(type),
                localeKey: type
              }));
            }
          },
          /**
           * Reference to the lag field
           * @member {Core.widget.DurationField} lagField
           * @readonly
           */
          lagField: {
            type: "duration",
            weight: 400,
            label: "L{Lag}",
            name: "lag",
            allowNegative: true,
            highlightExternalChange: false
          }
        },
        bbar: {
          defaults: {
            localeClass: this
          },
          items: {
            foo: {
              type: "widget",
              cls: "b-label-filler"
            },
            /**
             * Reference to the save button, if used
             * @member {Core.widget.Button} saveButton
             * @readonly
             */
            saveButton: {
              color: "b-green",
              text: "L{Save}"
            },
            /**
             * Reference to the delete button, if used
             * @member {Core.widget.Button} deleteButton
             * @readonly
             */
            deleteButton: {
              color: "b-gray",
              text: "L{Delete}"
            },
            /**
             * Reference to the cancel button, if used
             * @member {Core.widget.Button} cancelButton
             * @readonly
             */
            cancelButton: {
              color: "b-gray",
              text: "L{Object.Cancel}"
            }
          }
        }
      }
    };
  }
  //endregion
  //region Init & destroy
  construct(client, config) {
    const me = this;
    client.dependencyEdit = me;
    super.construct(client, config);
    if (!client.features.dependencies) {
      throw new Error("Dependencies feature required when using DependencyEdit");
    }
    me.clientListenersDetacher = client.ion({
      [me.triggerEvent]: me.onActivateEditor,
      thisObj: me
    });
  }
  doDestroy() {
    var _a;
    this.clientListenersDetacher();
    (_a = this.editor) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  //endregion
  //region Editing
  changeEditorConfig(config) {
    const me = this, { autoClose, cls, client } = me;
    return ObjectHelper.assign({
      owner: client,
      align: "b-t",
      id: `${client.id}-dependency-editor`,
      autoShow: false,
      anchor: true,
      scrollAction: "realign",
      constrainTo: globalThis,
      autoClose,
      cls
    }, config);
  }
  //endregion
  //region Save
  get isValid() {
    return Object.values(this.editor.widgetMap).every((field) => {
      if (!field.name || field.hidden) {
        return true;
      }
      return field.isValid !== false;
    });
  }
  get values() {
    const values = {};
    this.editor.eachWidget((widget) => {
      if (!widget.name || widget.hidden)
        return;
      values[widget.name] = widget.value;
    }, true);
    return values;
  }
  /**
   * Template method, intended to be overridden. Called before the dependency record has been updated.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency record
   *
   **/
  onBeforeSave(dependencyRecord) {
  }
  /**
   * Template method, intended to be overridden. Called after the dependency record has been updated.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency record
   *
   **/
  onAfterSave(dependencyRecord) {
  }
  /**
   * Updates record being edited with values from the editor
   * @private
   */
  updateRecord(dependencyRecord) {
    const { values } = this;
    if (values.lag) {
      values.lagUnit = values.lag.unit;
      values.lag = values.lag.magnitude;
    }
    if ("type" in values) {
      dependencyRecord.fromSide != null && (values.fromSide = null);
      dependencyRecord.toSide != null && (values.toSide = null);
    }
    ObjectHelper.cleanupProperties(values, true);
    dependencyRecord.set(values);
  }
  //endregion
  //region Events
  onPopupKeyDown({ event }) {
    if (event.key === "Enter" && this.saveAndCloseOnEnter && event.target.tagName.toLowerCase() === "input") {
      event.preventDefault();
      this.onSaveClick();
    }
  }
  onSaveClick() {
    if (this.save()) {
      this.afterSave();
      this.editor.hide();
    }
  }
  async onDeleteClick() {
    if (await this.deleteDependency()) {
      this.afterDelete();
    }
    this.editor.hide();
  }
  onCancelClick() {
    this.afterCancel();
    this.editor.hide();
  }
  afterSave() {
  }
  afterDelete() {
  }
  afterCancel() {
  }
  //region Editing
  // Called from editDependency() to actually show the editor
  internalShowEditor(dependencyRecord) {
    const me = this, { client } = me, editor = me.getEditor(dependencyRecord);
    me.loadRecord(dependencyRecord);
    client.trigger("beforeDependencyEditShow", {
      dependencyEdit: me,
      dependencyRecord,
      editor
    });
    let showPoint = me.lastPointerDownCoordinate;
    if (!showPoint) {
      const center = Rectangle.from(client.element).center;
      showPoint = [center.x - editor.width / 2, center.y - editor.height / 2];
    }
    const result = editor.showBy(showPoint), labelled = [];
    let labelWidth = 0;
    editor.eachWidget((widget) => {
      const { labelElement, element } = widget;
      if (labelElement) {
        if (labelElement.getBoundingClientRect().top < element.getBoundingClientRect().top) {
          return false;
        }
        widget.labelWidth = null;
        labelWidth = Math.max(labelWidth, labelElement.offsetWidth);
        labelled.push(widget);
      }
    });
    labelled.forEach((widget) => widget.labelWidth = labelWidth);
    return result;
  }
  /**
   * Opens a popup to edit the passed dependency.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency to edit
   * @return {Promise} A Promise that yields `true` after the editor is shown
   * or `false` if some application logic vetoed the editing (see `beforeDependencyEdit` in the docs).
   */
  async editDependency(dependencyRecord) {
    const me = this, { client } = me;
    if (client.readOnly || dependencyRecord.readOnly || /**
     * Fires on the owning Scheduler or Gantt widget before an dependency is displayed in the editor.
     * This may be listened for to allow an application to take over dependency editing duties. Return `false` to
     * stop the default editing UI from being shown or a `Promise` yielding `true` or `false` for async vetoing.
     * @event beforeDependencyEdit
     * @on-owner
     * @param {Scheduler.view.Scheduler} source The scheduler
     * @param {Scheduler.feature.DependencyEdit} dependencyEdit The dependencyEdit feature
     * @param {Scheduler.model.DependencyModel} dependencyRecord The record about to be shown in the editor.
     * @preventable
     * @async
     */
    await client.trigger("beforeDependencyEdit", { dependencyEdit: me, dependencyRecord }) === false) {
      return false;
    }
    await this.internalShowEditor(dependencyRecord);
    return true;
  }
  //endregion
  //region Save
  /**
   * Gets an editor instance. Creates on first call, reuses on consecutive
   * @internal
   * @returns {Scheduler.view.DependencyEditor} Editor popup
   */
  getEditor() {
    var _a, _b, _c;
    const me = this;
    let { editor } = me;
    if (editor) {
      return editor;
    }
    editor = me.editor = DependencyEditor.new({
      dependencyEditFeature: me,
      autoShow: false,
      anchor: true,
      scrollAction: "realign",
      constrainTo: globalThis,
      autoClose: me.autoClose,
      cls: me.cls,
      rootElement: me.client.rootElement,
      internalListeners: {
        keydown: me.onPopupKeyDown,
        thisObj: me
      }
    }, me.editorConfig);
    if (editor.items.length === 0) {
      console.warn("Editor configured without any `items`");
    }
    editor.eachWidget((widget) => {
      const ref = widget.ref || widget.id;
      if (ref && !me[ref]) {
        me[ref] = widget;
      }
    });
    (_a = me.saveButton) == null ? void 0 : _a.ion({ click: "onSaveClick", thisObj: me });
    (_b = me.deleteButton) == null ? void 0 : _b.ion({ click: "onDeleteClick", thisObj: me });
    (_c = me.cancelButton) == null ? void 0 : _c.ion({ click: "onCancelClick", thisObj: me });
    return me.editor;
  }
  //endregion
  //region Delete
  /**
   * Sets fields values from record being edited
   * @private
   */
  loadRecord(dependency) {
    const me = this;
    me.fromNameField.value = dependency.fromEvent.name;
    me.toNameField.value = dependency.toEvent.name;
    if (me.lagField) {
      me.lagField.value = new Duration(dependency.lag, dependency.lagUnit);
    }
    me.editor.record = me.dependencyRecord = dependency;
  }
  //endregion
  //region Stores
  /**
   * Saves the changes (applies them to record if valid, if invalid editor stays open)
   * @private
   * @fires beforeDependencySave
   * @fires beforeDependencyAdd
   * @fires afterDependencySave
   * @returns {*}
   */
  async save() {
    var _a;
    const me = this, { client, dependencyRecord } = me;
    if (!dependencyRecord || !me.isValid) {
      return;
    }
    const { dependencyStore, values } = me;
    if (client.trigger("beforeDependencySave", {
      dependencyRecord,
      values
    }) !== false) {
      me.onBeforeSave(dependencyRecord);
      me.updateRecord(dependencyRecord);
      if (dependencyStore && !dependencyRecord.stores.length) {
        if (client.trigger("beforeDependencyAdd", { dependencyRecord, dependencyEdit: me }) === false) {
          return;
        }
        dependencyStore.add(dependencyRecord);
      }
      await ((_a = client.project) == null ? void 0 : _a.commitAsync());
      client.trigger("afterDependencySave", { dependencyRecord });
      me.onAfterSave(dependencyRecord);
    }
    return dependencyRecord;
  }
  /**
   * Delete dependency being edited
   * @private
   * @fires beforeDependencyDelete
   */
  async deleteDependency() {
    var _a;
    const { client, editor, dependencyRecord } = this;
    if (client.trigger("beforeDependencyDelete", { dependencyRecord }) !== false) {
      if (editor.containsFocus) {
        editor.revertFocus();
      }
      client.dependencyStore.remove(dependencyRecord);
      await ((_a = client.project) == null ? void 0 : _a.commitAsync());
      return true;
    }
    return false;
  }
  get dependencyStore() {
    return this.client.dependencyStore;
  }
  //endregion
  //region Events
  onActivateEditor({ dependency, event }) {
    if (!this.disabled) {
      this.lastPointerDownCoordinate = [event.clientX, event.clientY];
      this.editDependency(dependency);
    }
  }
  //endregion
};
DependencyEdit._$name = "DependencyEdit";
GridFeatureManager.registerFeature(DependencyEdit, false);

// ../Scheduler/lib/Scheduler/feature/ScheduleContext.js
var ScheduleContext = class extends InstancePlugin.mixin(Delayable_default) {
  static get $name() {
    return "ScheduleContext";
  }
  /**
   * The contextual information about which cell was clicked on and highlighted.
   *
   * When the {@link Scheduler.view.Scheduler#property-viewPreset} is changed (such as when zooming)
   * the context is cleared and the highlight is removed.
   *
   * @member {Object} context
   * @property {Scheduler.view.TimelineBase} context.source The owning Scheduler
   * @property {Date} context.date Date at mouse position
   * @property {Scheduler.model.TimeSpan} context.tick A record which encapsulates the time axis tick clicked on.
   * @property {Number} context.tickIndex The index of the time axis tick clicked on.
   * @property {Date} context.tickStartDate The start date of the current time axis tick
   * @property {Date} context.tickEndDate The end date of the current time axis tick
   * @property {Grid.row.Row} context.row Clicked row (in horizontal mode only)
   * @property {Number} context.index Index of clicked resource
   * @property {Scheduler.model.ResourceModel} context.resourceRecord Resource record
   * @property {MouseEvent} context.event Browser event
   */
  construct(client, config) {
    super.construct(client, config);
    const { triggerEvent } = this, listeners = {
      datachange: "syncContextElement",
      timeaxisviewmodelupdate: "onTimeAxisViewModelUpdate",
      presetchange: "clearContext",
      thisObj: this
    };
    if (triggerEvent === "mouseover") {
      listeners.timelineContextChange = "onTimelineContextChange";
    } else {
      if (triggerEvent === "click" || triggerEvent === "mousedown") {
        listeners.schedulecontextmenu = "onScheduleContextGesture";
      }
      Object.assign(listeners, {
        [`schedule${triggerEvent}`]: "onScheduleContextGesture",
        [`event${triggerEvent}`]: "onScheduleContextGesture",
        ...listeners
      });
    }
    client.ion(listeners);
    client.rowManager.ion({
      rowheight: "syncContextElement",
      thisObj: this
    });
  }
  changeTriggerEvent(triggerEvent) {
    if (triggerEvent === "hover" || triggerEvent === "mousemove") {
      triggerEvent = "mouseover";
    }
    return triggerEvent;
  }
  get element() {
    return this._element || (this._element = DomHelper.createElement({
      parent: this.client.timeAxisSubGridElement,
      className: "b-schedule-selected-tick"
    }));
  }
  // Handle the Client's own timelineContextChange event which it maintains on mousemove
  onTimelineContextChange({ context }) {
    this.context = context;
  }
  // Handle the scheduleclick or eventclick Scheduler events if we re not using mouseover
  onScheduleContextGesture(context) {
    this.context = context;
  }
  onTimeAxisViewModelUpdate({ source: timeAxisViewModel }) {
    var _a;
    if (timeAxisViewModel.timeAxis.includes((_a = this.context) == null ? void 0 : _a.tick)) {
      this.syncContextElement();
    } else {
      this.clearContext();
    }
  }
  clearContext() {
    this.context = null;
  }
  updateContext(context, oldContext) {
    this.syncContextElement();
  }
  syncContextElement() {
    if (this.context && this.enabled) {
      const me = this, {
        client,
        element,
        context,
        renderer
      } = me, {
        isVertical
      } = client, {
        style
      } = element, row = isVertical ? client.rowManager.rows[0] : client.getRowFor(context.resourceRecord);
      if (row) {
        const {
          tickStartDate,
          tickEndDate,
          resourceRecord
        } = context, renderData = client.currentOrientation.getTimeSpanRenderData({
          startDate: tickStartDate,
          endDate: tickEndDate,
          startDateMS: tickStartDate.getTime(),
          endDateMS: tickEndDate.getTime()
        }, resourceRecord);
        let top, width, height;
        if (isVertical) {
          top = renderData.top;
          width = renderData.resourceWidth;
          height = renderData.height;
        } else {
          top = row.top;
          width = renderData.width;
          height = row.height;
        }
        style.display = "";
        style.width = `${width}px`;
        style.height = `${height}px`;
        DomHelper.setTranslateXY(element, renderData.left, top);
        context.index = row.index;
        element.innerHTML = "";
        renderer && me.callback(renderer, me, [context, element]);
      } else {
        style.display = "none";
      }
    } else {
      this.element.style.display = "none";
    }
  }
};
__publicField(ScheduleContext, "delayable", {
  syncContextElement: "raf"
});
__publicField(ScheduleContext, "configurable", {
  /**
   * The pointer event type to use to update the context. May be `'hover'` to highlight the
   * tick context when moving the mouse across the timeline.
   * @config {'click'|'hover'|'contextmenu'|'mousedown'}
   * @default
   */
  triggerEvent: "click",
  /**
   * A function (or the name of a function) which may mutate the contents of the context overlay
   * element which tracks the active resource/tick context.
   *
   * @config {String|Function}
   * @param {TimelineContext} context The context being highlighted.
   * @param {HTMLElement} element The context highlight element. This will be empty each time.
   * @returns {void}
   */
  renderer: null,
  /**
   * The active context.
   * @member {TimelineContext} timelineContext
   * @readonly
   */
  context: {
    $config: {
      // Reject non-changes so that when using mousemove, we only update the context
      // when it changes.
      equal(c1, c2) {
        return (c1 == null ? void 0 : c1.index) === (c2 == null ? void 0 : c2.index) && (c1 == null ? void 0 : c1.tickParentIndex) === (c2 == null ? void 0 : c2.tickParentIndex) && !(((c1 == null ? void 0 : c1.tickStartDate) || 0) - ((c2 == null ? void 0 : c2.tickStartDate) || 0));
      }
    }
  }
});
ScheduleContext.featureClass = "b-scheduler-context";
ScheduleContext._$name = "ScheduleContext";
GridFeatureManager.registerFeature(ScheduleContext, false, ["Scheduler"]);

// ../Scheduler/lib/Scheduler/feature/EventCopyPaste.js
var actions = {
  cut: 1,
  copy: 1,
  paste: 1
};
var EventCopyPaste = class extends CopyPasteBase.mixin(AttachToProjectMixin_default) {
  constructor() {
    super(...arguments);
    // Used in events to separate events from different features from each other
    __publicField(this, "entityName", "event");
  }
  construct(scheduler, config) {
    super.construct(scheduler, config);
    scheduler.ion({
      eventClick: "onEventClick",
      scheduleClick: "onScheduleClick",
      projectChange: () => {
        this.clearClipboard();
        this._cellClickedContext = null;
      },
      thisObj: this
    });
  }
  get scheduler() {
    return this.client;
  }
  attachToEventStore(eventStore) {
    super.attachToEventStore(eventStore);
    delete this._eventClickedContext;
  }
  onEventDataGenerated(eventData) {
    const { assignmentRecord } = eventData;
    if (assignmentRecord) {
      eventData.cls["b-cut-item"] = assignmentRecord.meta.isCut;
    }
  }
  onEventClick(context) {
    this._cellClickedContext = null;
    this._eventClickedContext = context;
  }
  onScheduleClick(context) {
    this._cellClickedContext = context;
    this._eventClickedContext = null;
  }
  isActionAvailable({ event, actionName }) {
    var _a, _b;
    if (actions[actionName]) {
      return !this.disabled && globalThis.getSelection().toString().length === 0 && !((_a = this.client.features.cellEdit) == null ? void 0 : _a.isEditing) && Boolean(event.target.closest(".b-timeaxissubgrid")) && !((_b = this.client.focusedCell) == null ? void 0 : _b.isSpecialRow);
    }
  }
  async copy() {
    await this.copyEvents();
  }
  async cut() {
    await this.copyEvents(void 0, true);
  }
  async paste() {
    await this.pasteEvents();
  }
  /**
   * Copy events (when using single assignment mode) or assignments (when using multi assignment mode) to clipboard to
   * paste later
   * @fires beforeCopy
   * @fires copy
   * @param {Scheduler.model.EventModel[]|Scheduler.model.AssignmentModel[]} [records] Pass records to copy them,
   * leave out to copying current selection
   * @param {Boolean} [isCut] Copies by default, pass `true` to cut instead
   * @category Edit
   * @on-owner
   */
  async copyEvents(records = this.scheduler.selectedAssignments, isCut = false) {
    const me = this, { scheduler } = me;
    if (scheduler.splitFrom) {
      return scheduler.splitFrom.features.eventCopyPaste.copyEvents(records, isCut);
    }
    if (!(records == null ? void 0 : records.length)) {
      return;
    }
    let assignmentRecords = records.slice();
    if (records[0].isEventModel) {
      assignmentRecords = records.map((r) => r.assignments).flat();
    }
    if (isCut) {
      assignmentRecords = assignmentRecords.filter((a) => !a.event.readOnly);
    }
    const eventRecords = assignmentRecords.map((a) => a.event);
    if (!assignmentRecords.length || scheduler.readOnly) {
      return;
    }
    await me.writeToClipboard({ assignmentRecords, eventRecords }, isCut);
    scheduler.trigger("copy", { assignmentRecords, eventRecords, isCut, entityName: me.entityName });
    scheduler.refreshWithTransition();
    me._focusedEventOnCopy = me._eventClickedContext;
  }
  async beforeCopy({ data: { assignmentRecords, eventRecords }, isCut }) {
    return await this.scheduler.trigger(
      "beforeCopy",
      { assignmentRecords, eventRecords, isCut, entityName: this.entityName }
    );
  }
  // Called from Clipboardable when cutData changes
  handleCutData({ source }) {
    var _a;
    const me = this;
    if (source !== me && ((_a = me.cutData) == null ? void 0 : _a.length)) {
      const { assignmentRecords, eventRecords } = me.cutData[0];
      if (assignmentRecords == null ? void 0 : assignmentRecords.length) {
        me.scheduler.assignmentStore.remove(assignmentRecords);
      }
      if (eventRecords == null ? void 0 : eventRecords.length) {
        me.scheduler.eventStore.remove(eventRecords);
      }
    }
  }
  /**
   * Called from Clipboardable after writing a non-string value to the clipboard
   * @param eventRecords
   * @returns {string}
   * @private
   */
  stringConverter({ eventRecords }) {
    const rows = [];
    for (const event of eventRecords) {
      rows.push(this.eventToStringFields.map((field) => {
        const value = event[field];
        if (value instanceof Date) {
          return DateHelper.format(value, this.dateFormat);
        }
        return value;
      }).join("	"));
    }
    return rows.join("\n");
  }
  // Called from Clipboardable for each cut out record
  setIsCut({ assignmentRecords }, isCut) {
    assignmentRecords.forEach((assignment) => {
      assignment.meta.isCut = isCut;
    });
    this.scheduler.refreshWithTransition();
  }
  /**
   * Paste events or assignments to specified date and resource
   * @fires beforePaste
   * @fires paste
   * @param {Date} [date] Date where the events or assignments will be pasted
   * @param {Scheduler.model.ResourceModel} [resourceRecord] Resource to assign the pasted events or assignments to
   * @category Edit
   * @on-owner
   */
  async pasteEvents(date, resourceRecord) {
    var _a;
    const me = this, { scheduler } = me;
    if (scheduler.splitFrom) {
      return scheduler.splitFrom.features.eventCopyPaste.pasteEvents(date, resourceRecord);
    }
    const {
      entityName,
      isCut,
      _cellClickedContext,
      _eventClickedContext
    } = me, {
      eventStore,
      assignmentStore
    } = scheduler;
    if (arguments.length === 0) {
      if (_cellClickedContext) {
        date = _cellClickedContext.date;
        resourceRecord = _cellClickedContext.resourceRecord;
      } else if (me._focusedEventOnCopy !== _eventClickedContext) {
        date = _eventClickedContext.eventRecord.startDate;
        resourceRecord = _eventClickedContext.resourceRecord;
      }
    }
    if (resourceRecord) {
      resourceRecord = resourceRecord.$original;
    }
    const clipboardData = await me.readFromClipboard({ resourceRecord, date });
    if (!((_a = clipboardData == null ? void 0 : clipboardData.assignmentRecords) == null ? void 0 : _a.length)) {
      return;
    }
    const {
      assignmentRecords,
      eventRecords
    } = clipboardData;
    let toFocus = null;
    const pastedEvents = /* @__PURE__ */ new Set(), pastedEventRecords = [];
    for (const assignmentRecord of assignmentRecords) {
      let { event } = assignmentRecord;
      const targetResourceRecord = resourceRecord || assignmentRecord.resource, targetDate = date || assignmentRecord.event.startDate;
      if (pastedEvents.has(event)) {
        if (isCut) {
          assignmentRecord.remove();
        }
        continue;
      }
      pastedEvents.add(event);
      if (isCut) {
        assignmentRecord.meta.isCut = false;
        assignmentRecord.resource = targetResourceRecord;
        toFocus = assignmentRecord;
      } else if (!eventStore.usesResourceIds && (eventStore.usesSingleAssignment || me.copyPasteAction === "clone")) {
        event = event.copy();
        event.name = me.generateNewName(event);
        eventStore.add(event);
        event.assign(targetResourceRecord);
        toFocus = assignmentStore.last;
      } else if (!event.resources.includes(targetResourceRecord)) {
        const newAssignmentRecord = assignmentRecord.copy();
        newAssignmentRecord.resource = targetResourceRecord;
        [toFocus] = assignmentStore.add(newAssignmentRecord);
      }
      event.startDate = targetDate;
      if (event.constraintDate) {
        event.constraintDate = null;
      }
      pastedEventRecords.push(event);
    }
    scheduler.trigger("paste", { assignmentRecords, pastedEventRecords, eventRecords, resourceRecord, date, isCut, entityName });
    const detacher = scheduler.ion({
      renderEvent({ assignmentRecord }) {
        if (assignmentRecord === toFocus) {
          scheduler.navigateTo(assignmentRecord, { scrollIntoView: false });
          detacher();
        }
      }
    });
    if (isCut) {
      await me.clearClipboard();
    }
  }
  // Called from Clipboardable before finishing the internal clipboard read
  async beforePaste({ data: { assignmentRecords, eventRecords }, resourceRecord, isCut, date }) {
    const { scheduler } = this, eventData = {
      assignmentRecords,
      eventRecords,
      resourceRecord: resourceRecord || assignmentRecords[0].resource,
      date,
      isCut,
      entityName: this.entityName
    };
    let reason;
    if (resourceRecord == null ? void 0 : resourceRecord.readOnly) {
      reason = "resourceReadOnly";
    }
    if (!scheduler.allowOverlap) {
      const pasteWouldResultInOverlap = assignmentRecords.some(
        (assignmentRecord) => !scheduler.isDateRangeAvailable(
          assignmentRecord.event.startDate,
          assignmentRecord.event.endDate,
          isCut ? assignmentRecord.event : null,
          assignmentRecord.resource
        )
      );
      if (pasteWouldResultInOverlap) {
        reason = "overlappingEvents";
      }
    }
    if (reason) {
      scheduler.trigger("pasteNotAllowed", {
        ...eventData,
        reason
      });
      return false;
    }
    return await this.scheduler.trigger("beforePaste", eventData);
  }
  /**
   * Called from Clipboardable after reading from clipboard, and it is determined that the clipboard data is
   * "external"
   * @param json
   * @returns {Object}
   * @private
   */
  stringParser(clipboardData) {
    const { eventStore, assignmentStore } = this.scheduler, { modifiedRecords: eventRecords } = this.setFromStringData(clipboardData, true, eventStore, this.eventToStringFields), assignmentRecords = [];
    for (const event of eventRecords) {
      const assignment = new assignmentStore.modelClass({ eventId: event.id });
      assignment.event = event;
      assignmentRecords.push(assignment);
    }
    return { eventRecords, assignmentRecords };
  }
  populateEventMenu({ assignmentRecord, items }) {
    const me = this, { scheduler } = me;
    if (!scheduler.readOnly) {
      items.copyEvent = {
        text: "L{copyEvent}",
        localeClass: me,
        icon: "b-icon b-icon-copy",
        weight: 110,
        onItem: () => {
          const assignments = scheduler.isAssignmentSelected(assignmentRecord) ? scheduler.selectedAssignments : [assignmentRecord];
          me.copyEvents(assignments);
        }
      };
      items.cutEvent = {
        text: "L{cutEvent}",
        localeClass: me,
        icon: "b-icon b-icon-cut",
        weight: 120,
        disabled: assignmentRecord.event.readOnly,
        onItem: () => {
          const assignments = scheduler.isAssignmentSelected(assignmentRecord) ? scheduler.selectedAssignments : [assignmentRecord];
          me.copyEvents(assignments, true);
        }
      };
    }
  }
  populateScheduleMenu({ items, resourceRecord }) {
    const me = this, { scheduler } = me;
    if (!scheduler.readOnly && me.hasClipboardData() !== false) {
      items.pasteEvent = {
        text: "L{pasteEvent}",
        localeClass: me,
        icon: "b-icon b-icon-paste",
        disabled: scheduler.resourceStore.count === 0 || resourceRecord.readOnly,
        weight: 110,
        onItem: ({
          date,
          resourceRecord: resourceRecord2
        }) => {
          me.pasteEvents(date, resourceRecord2, scheduler.getRowFor(resourceRecord2));
        }
      };
    }
  }
  /**
   * A method used to generate the name for a copy pasted record. By defaults appends "- 2", "- 3" as a suffix.
   *
   * @param {Scheduler.model.EventModel} eventRecord The new eventRecord being pasted
   * @returns {String}
   */
  generateNewName(eventRecord) {
    const originalName = eventRecord.getValue(this.nameField);
    let counter = 2;
    while (this.client.eventStore.findRecord(this.nameField, `${originalName} - ${counter}`)) {
      counter++;
    }
    return `${originalName} - ${counter}`;
  }
};
__publicField(EventCopyPaste, "$name", "EventCopyPaste");
__publicField(EventCopyPaste, "pluginConfig", {
  assign: [
    "copyEvents",
    "pasteEvents"
  ],
  chain: [
    "populateEventMenu",
    "populateScheduleMenu",
    "onEventDataGenerated"
  ]
});
__publicField(EventCopyPaste, "configurable", {
  /**
   * The field to use as the name field when updating the name of copied records
   * @config {String}
   * @default
   */
  nameField: "name",
  /**
   * How to handle a copy paste operation when the host uses multi assignment. Either:
   *
   * - `'clone'`  - The default, clone the copied event, assigning the clone to the target resource.
   * - `'assign'` - Add an assignment for the existing event to the target resource.
   *
   * For single assignment mode, it always uses the `'clone'` behaviour.
   *
   * @config {'clone'|'assign'}
   * @default
   */
  copyPasteAction: "clone",
  /**
   * When copying events (or assignments), data will be sent to the clipboard as a tab (`\t`) and new-line (`\n`)
   * separated string with field values for fields present in this config (in specified order). The default
   * included fields are (in this order):
   * * name
   * * startDate
   * * endDate
   * * duration
   * * durationUnit
   * * allDay
   * To override, provide your own array of fields:
   * ```javascript
   * new Scheduler({
   *     features : {
   *         eventCopyPaste : {
   *             eventToStringFields : [
   *                'name',
   *                'startDate',
   *                'endDate',
   *                'percentDone'
   *             ]
   *         }
   *     }
   * });
   * ```
   * <div class="note">Please note that this config is both used for **converting** events to a string value and
   * is also used to **parse** a string value to events.</div>
   * @config {Array<String>}
   */
  eventToStringFields: ["name", "startDate", "endDate", "duration", "durationUnit", "allDay"]
});
EventCopyPaste.featureClass = "b-event-copypaste";
EventCopyPaste._$name = "EventCopyPaste";
GridFeatureManager.registerFeature(EventCopyPaste, true, "Scheduler");

// ../Scheduler/lib/Scheduler/feature/EventDrag.js
var EventDrag = class extends DragBase {
  //region Config
  static get $name() {
    return "EventDrag";
  }
  static get configurable() {
    return {
      /**
       * Template used to generate drag tooltip contents.
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventDrag : {
       *             dragTipTemplate({eventRecord, startText}) {
       *                 return `${eventRecord.name}: ${startText}`
       *             }
       *         }
       *     }
       * });
       * ```
       * @config {Function} tooltipTemplate
       * @param {Object} data Tooltip data
       * @param {Scheduler.model.EventModel} data.eventRecord
       * @param {Boolean} data.valid Currently over a valid drop target or not
       * @param {Date} data.startDate New start date
       * @param {Date} data.endDate New end date
       * @returns {String}
       */
      /**
       * Set to true to only allow dragging events within the same resource.
       * @member {Boolean} constrainDragToResource
       */
      /**
       * Set to true to only allow dragging events within the same resource.
       * @config {Boolean}
       * @default
       */
      constrainDragToResource: false,
      /**
       * Set to true to only allow dragging events to different resources, and disallow rescheduling by dragging.
       * @member {Boolean} constrainDragToTimeSlot
       */
      /**
       * Set to true to only allow dragging events to different resources, and disallow rescheduling by dragging.
       * @config {Boolean}
       * @default
       */
      constrainDragToTimeSlot: false,
      /**
       * A CSS selector specifying elements outside the scheduler element which are valid drop targets.
       * @config {String}
       */
      externalDropTargetSelector: null,
      /**
       * An empty function by default, but provided so that you can perform custom validation on the item being
       * dragged. This function is called during the drag and drop process and also after the drop is made.
       * Return `true` if the new position is valid, `false` to prevent the drag.
       *
       * ```javascript
       * features : {
       *     eventDrag : {
       *         validatorFn({ eventRecords, newResource }) {
       *             const
       *                 task  = eventRecords[0],
       *                 valid = newResource.role === task.resource.role;
       *
       *             return {
       *                 valid   : newResource.role === task.resource.role,
       *                 message : valid ? '' : 'Resource role does not match required role for this task'
       *             };
       *         }
       *     }
       * }
       * ```
       * @param {Object} context A drag drop context object
       * @param {Date} context.startDate New start date
       * @param {Date} context.endDate New end date
       * @param {Scheduler.model.AssignmentModel[]} context.assignmentRecords Assignment records which were dragged
       * @param {Scheduler.model.EventModel[]} context.eventRecords Event records which were dragged
       * @param {Scheduler.model.ResourceModel} context.newResource New resource record
       * @param {Scheduler.model.EventModel} context.targetEventRecord Currently hovering this event record
       * @param {Event} event The event object
       * @returns {Boolean|Object} `true` if this validation passes, `false` if it does not.
       *
       * Or an object with 2 properties: `valid` -  Boolean `true`/`false` depending on validity,
       * and `message` - String with a custom error message to display when invalid.
       * @config {Function}
       */
      validatorFn: (context, event) => {
      },
      /**
       * The `this` reference for the validatorFn
       * @config {Object}
       */
      validatorFnThisObj: null,
      /**
       * When the host Scheduler is `{@link Scheduler.view.mixin.EventSelection#config-multiEventSelect}: true`
       * then, there are two modes of dragging *within the same Scheduler*.
       *
       * Non unified means that all selected events are dragged by the same number of resource rows.
       *
       * Unified means that all selected events are collected together and dragged as one, and are all dropped
       * on the same targeted resource row at the same targeted time.
       * @member {Boolean} unifiedDrag
       */
      /**
       * When the host Scheduler is `{@link Scheduler.view.mixin.EventSelection#config-multiEventSelect}: true`
       * then, there are two modes of dragging *within the same Scheduler*.
       *
       * Non unified means that all selected events are dragged by the same number of resource rows.
       *
       * Unified means that all selected events are collected together and dragged as one, and are all dropped
       * on the same targeted resource row at the same targeted time.
       * @config {Boolean}
       * @default false
       */
      unifiedDrag: null,
      /**
       * A hook that allows manipulating the position the drag proxy snaps to. Manipulate the `snapTo` property
       * to alter snap position.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventDrag : {
       *             snapToPosition({ eventRecord, snapTo }) {
       *                 if (eventRecord.late) {
       *                     snapTo.x = 400;
       *                 }
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * @config {Function}
       * @param {Object} context
       * @param {Scheduler.model.AssignmentModel} context.assignmentRecord Dragged assignment
       * @param {Scheduler.model.EventModel} context.eventRecord Dragged event
       * @param {Scheduler.model.ResourceModel} context.resourceRecord Currently over this resource
       * @param {Date} context.startDate Start date for current position
       * @param {Date} context.endDate End date for current position
       * @param {Object} context.snapTo
       * @param {Number} context.snapTo.x X to snap to
       * @param {Number} context.snapTo.y Y to snap to
       * @returns {void}
       */
      snapToPosition: null,
      /**
       * A modifier key (CTRL, SHIFT, ALT, META) that when pressed will copy an event instead of moving it. Set to
       * empty string to disable copying
       * @prp {'CTRL'|'ALT'|'SHIFT'|'META'|''}
       * @default
       */
      copyKey: "SHIFT",
      /**
       * Event can be copied two ways: either by adding new assignment to an existing event ('assignment'), or
       * by copying the event itself ('event'). 'auto' mode will pick 'event' for a single-assignment mode (when
       * event has `resourceId` field) and 'assignment' mode otherwise.
       * @prp {'auto'|'assignment'|'event'}
       * @default
       */
      copyMode: "auto",
      /**
       * Mode of the current drag drop operation.
       * @member {'move'|'copy'}
       * @readonly
       */
      mode: "move",
      capitalizedEventName: null
    };
  }
  afterConstruct() {
    this.capitalizedEventName = this.capitalizedEventName || this.client.capitalizedEventName;
    super.afterConstruct(...arguments);
  }
  //endregion
  changeMode(value) {
    const { dragData, copyMode } = this;
    if ((copyMode === "event" || copyMode === "auto" || copyMode === "assignment" && !this.scheduler.eventStore.usesSingleAssignment) && (!dragData || dragData.eventRecords.every((r) => !r.isRecurring))) {
      return value;
    }
  }
  updateMode(mode) {
    if (this.dragData) {
      if (mode === "copy") {
        this.setCopying();
      } else {
        this.setMoving();
      }
      this.client.trigger("eventDragModeChange", { mode });
    }
  }
  setCopying() {
    const { dragData } = this;
    if (!dragData) {
      return;
    }
    if (!dragData.eventBarCopies.some((el) => el.isConnected)) {
      dragData.eventBarCopies.forEach((el) => {
        el.classList.add("b-drag-proxy-copy");
        el.classList.remove("b-hidden");
        dragData.context.grabbedParent.appendChild(el);
        el.retainElement = true;
      });
    } else {
      dragData.eventBarCopies.forEach((el) => {
        el.classList.remove("b-hidden");
      });
    }
  }
  setMoving() {
    const { dragData } = this;
    if (!dragData) {
      return;
    }
    dragData.eventBarCopies.forEach((el) => {
      el.classList.add("b-hidden");
    });
  }
  //region Events
  /**
   * This event is fired on the owning Scheduler after the event drag operation completes, but before changing any data.
   * It allows implementer to use asynchronous validation/finalization by setting `context.async = true`
   * in the listener, for example, to show a confirmation popup, make async data request etc.
   * In such case, implementer need to call the `context.finalize()` method manually:
   *
   * ```javascript
   *  scheduler.on('beforeeventdropfinalize', ({ context }) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // `true` to perform the drop, `false` to ignore it
   *          context.finalize(true);
   *      }, 1000);
   *  })
   * ```
   *
   * For synchronous one-time validation, simply set `context.valid` to true or false.
   * ```javascript
   *  scheduler.on('beforeeventdropfinalize', ({ context }) => {
   *      context.valid = false;
   *  })
   * ```
   * @event beforeEventDropFinalize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Object} context
   * @param {DropData} context.dropData Information about the drop points for dragged events/assignments.
   * @param {Boolean} context.async Set to `true` to not finalize the drag-drop operation immediately (e.g. to wait for user confirmation)
   * @param {Scheduler.model.EventModel[]} context.eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} context.assignmentRecords Assignment records being dragged
   * @param {Scheduler.model.EventModel} context.targetEventRecord Event record for drop target
   * @param {Scheduler.model.ResourceModel} context.newResource Resource record for drop target
   * @param {Boolean} context.valid Set this to `false` to abort the drop immediately.
   * @param {Function} context.finalize Call this method after an **async** finalization flow, to finalize the drag-drop operation. This method accepts one
   * argument: pass `true` to update records, or `false` to ignore changes
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler after event drop
   * @event afterEventDrop
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords
   * @param {Scheduler.model.EventModel[]} eventRecords
   * @param {Boolean} valid
   * @param {Object} context
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler when an event is dropped
   * @event eventDrop
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel[]} eventRecords
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords
   * @param {HTMLElement} externalDropTarget The HTML element dropped upon, if drop happened on a valid external drop target
   * @param {Boolean} isCopy
   * @param {Object} context
   * @param {Scheduler.model.EventModel} context.targetEventRecord Event record for drop target
   * @param {Scheduler.model.ResourceModel} context.newResource Resource record for drop target
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler before event dragging starts. Return `false` to prevent the action.
   * @event beforeEventDrag
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord Event record the drag starts from
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the drag starts from
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {MouseEvent} event Browser event DEPRECATED (replaced by domEvent)
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler when event dragging starts
   * @event eventDragStart
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the drag starts from
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {MouseEvent} event Browser event DEPRECATED (replaced by domEvent)
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler when event is dragged
   * @event eventDrag
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {Date} startDate Start date for the current location
   * @param {Date} endDate End date for the current location
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the drag started from
   * @param {Scheduler.model.ResourceModel} newResource Resource at the current location
   * @param {Object} context
   * @param {Boolean} context.valid Set this to `false` to signal that the current drop position is invalid.
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler after an event drag operation has been aborted
   * @event eventDragAbort
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler after an event drag operation regardless of the operation being cancelled or not
   * @event eventDragReset
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   */
  //endregion
  //region Data layer
  // Deprecated. Use this.client instead
  get scheduler() {
    return this.client;
  }
  //endregion
  //#region Drag lifecycle
  onAfterDragStart(event) {
    const me = this, { context: { element } } = event;
    super.onAfterDragStart(event);
    me.handleKeyDownOrMove(event.event);
    me.keyEventDetacher = EventHelper.on({
      // In case we drag event between scheduler focused event gets moved and focus
      // moves to the body. We only need to read the key from this event
      element: DomHelper.getRootElement(element),
      keydown: me.handleKeyDownOrMove,
      keyup: me.handleKeyUp,
      thisObj: me
    });
  }
  onDragReset(event) {
    var _a;
    super.onDragReset(event);
    (_a = this.keyEventDetacher) == null ? void 0 : _a.call(this);
    this.mode = "move";
  }
  onDrop(event) {
    var _a;
    (_a = this.dragData.eventBarCopies) == null ? void 0 : _a.forEach((el) => el.remove());
    return super.onDrop(event);
  }
  //#endregion
  //region Drag events
  getDraggableElement(el) {
    return el == null ? void 0 : el.closest(this.drag.targetSelector);
  }
  resolveEventRecord(eventElement, client = this.client) {
    return client.resolveEventRecord(eventElement);
  }
  isElementDraggable(el, event) {
    var _a;
    const me = this, { client } = me, eventElement = me.getDraggableElement(el);
    if (!eventElement || me.disabled || client.readOnly) {
      return false;
    }
    if (el.matches('[class$="-handle"]')) {
      return false;
    }
    const eventRecord = me.resolveEventRecord(eventElement, client);
    if (!eventRecord || !eventRecord.isDraggable || eventRecord.readOnly) {
      return false;
    }
    const prevented = ((_a = client[`is${me.capitalizedEventName}ElementDraggable`]) == null ? void 0 : _a.call(
      client,
      eventElement,
      eventRecord,
      el,
      event
    )) === false;
    return !prevented;
  }
  getTriggerParams(dragData) {
    const { assignmentRecords, eventRecords, resourceRecord, browserEvent: domEvent } = dragData;
    return {
      // `context` is now private, but used in WebSocketHelper
      context: dragData,
      eventRecords,
      resourceRecord,
      assignmentRecords,
      event: domEvent,
      // Deprecated, remove on  6.0?
      domEvent
    };
  }
  getGroupedToStoreResources(dragData) {
    if (dragData.resourcesInStore) {
      return dragData.resourcesInStore;
    }
    const fromScheduler = this.client, fromResourceStore = fromScheduler.isVertical ? fromScheduler.resourceStore : fromScheduler.store;
    return dragData.resourcesInStore = [...new Set(fromResourceStore.getAllDataRecords().map((r) => r.$original))].filter((r) => r.isLeaf);
  }
  getIndexDiff(dragData) {
    const me = this, fromScheduler = me.client, toScheduler = me.currentOverClient, isCrossScheduler = fromScheduler !== toScheduler, { isVertical } = toScheduler, fromResourceStore = fromScheduler.isVertical ? fromScheduler.resourceStore : fromScheduler.store, toResourceStore = isVertical ? toScheduler.resourceStore : toScheduler.store, {
      resourceRecord: fromResource,
      newResource: toResource
    } = dragData;
    let indexDiff;
    if (isCrossScheduler) {
      indexDiff = toResourceStore.indexOf(toResource) - fromResourceStore.indexOf(fromResource.$original);
    } else if (me.constainDragToResource) {
      indexDiff = 0;
    } else if (isVertical && toResourceStore.isGrouped) {
      const resourcesInStore = me.getGroupedToStoreResources(dragData);
      indexDiff = resourcesInStore.indexOf(fromResource.$original) - resourcesInStore.indexOf(toResource);
    } else {
      indexDiff = fromResourceStore.indexOf(fromResource.$original) - fromResourceStore.indexOf(toResource);
    }
    return indexDiff;
  }
  getNewResource(dragData, originalResourceRecord, indexDiff) {
    const me = this, fromScheduler = me.client, toScheduler = me.currentOverClient, isCrossScheduler = fromScheduler !== toScheduler, { isVertical } = toScheduler, fromResourceStore = fromScheduler.isVertical ? fromScheduler.resourceStore : fromScheduler.store, toResourceStore = isVertical ? toScheduler.resourceStore : toScheduler.store;
    let { newResource } = dragData;
    if (!isCrossScheduler) {
      if (indexDiff !== 0) {
        let newIndex;
        if (isVertical && toResourceStore.isGrouped) {
          const resourcesInStore = me.getGroupedToStoreResources(dragData);
          newIndex = Math.max(
            Math.min(
              resourcesInStore.indexOf(originalResourceRecord) - indexDiff,
              resourcesInStore.length - 1
            ),
            0
          );
          newResource = resourcesInStore[newIndex];
        } else {
          newIndex = Math.max(
            Math.min(
              fromResourceStore.indexOf(originalResourceRecord) - indexDiff,
              fromResourceStore.count - 1
            ),
            0
          );
          newResource = fromResourceStore.getAt(newIndex);
          if (newResource.isSpecialRow) {
            newResource = fromResourceStore.getNext(newResource, false, true) || fromResourceStore.getPrevious(newResource, false, true);
          }
        }
        newResource = newResource == null ? void 0 : newResource.$original;
      } else {
        newResource = originalResourceRecord;
      }
    } else {
      const draggedEventResourceIndex = fromResourceStore.indexOf(originalResourceRecord);
      newResource = toResourceStore.getAt(draggedEventResourceIndex + indexDiff) || newResource;
    }
    return newResource;
  }
  getDropData(dragData) {
    const indexDiff = this.getIndexDiff(dragData);
    return {
      events: dragData.eventRecords.map((eventRecord) => {
        return {
          eventRecord,
          ...this.getEventNewStartEndDates(eventRecord, dragData.timeDiff)
        };
      }),
      assignments: dragData.assignmentRecords.map((assignmentRecord) => {
        return {
          assignmentRecord,
          resourceRecord: this.getNewResource(dragData, assignmentRecord.resource, indexDiff)
        };
      })
    };
  }
  triggerBeforeEventDropFinalize(eventType, eventData, client) {
    eventData.context.dropData = this.getDropData(eventData.context);
    super.triggerBeforeEventDropFinalize(eventType, eventData, client);
  }
  triggerBeforeEventDrag(eventType, event) {
    return this.client.trigger(eventType, event);
  }
  triggerEventDrag(dragData, start) {
    this.client.trigger("eventDrag", Object.assign(this.getTriggerParams(dragData), {
      startDate: dragData.startDate,
      endDate: dragData.endDate,
      newResource: dragData.newResource
    }));
  }
  triggerDragStart(dragData) {
    this.client.navigator.skipNextClick = true;
    this.client.trigger("eventDragStart", this.getTriggerParams(dragData));
  }
  triggerDragAbort(dragData) {
    this.client.trigger("eventDragAbort", this.getTriggerParams(dragData));
  }
  triggerDragAbortFinalized(dragData) {
    this.client.trigger("eventDragAbortFinalized", this.getTriggerParams(dragData));
  }
  triggerAfterDrop(dragData, valid) {
    const me = this;
    me.currentOverClient.trigger("afterEventDrop", Object.assign(me.getTriggerParams(dragData), {
      valid
    }));
    if (!valid) {
      const { assignmentStore, eventStore } = me.client, needRefresh = me.dragData.initialAssignmentsState.find(({
        resource,
        assignment
      }, i) => {
        var _a;
        return !assignmentStore.includes(assignment) || !eventStore.includes(assignment.event) || resource.id !== ((_a = me.dragData.assignmentRecords[i]) == null ? void 0 : _a.resourceId);
      });
      if (needRefresh) {
        me.client.refresh();
      }
    }
    me.client.setTimeout(() => me.client.navigator.skipNextClick = false, 10);
  }
  handleKeyDownOrMove(event) {
    var _a, _b;
    if (this.mode !== "copy") {
      if (event.key && EventHelper.specialKeyFromEventKey(event.key) === ((_a = this.copyKey) == null ? void 0 : _a.toLowerCase()) || event[`${(_b = this.copyKey) == null ? void 0 : _b.toLowerCase()}Key`]) {
        this.mode = "copy";
      }
    }
  }
  handleKeyUp(event) {
    if (EventHelper.specialKeyFromEventKey(event.key) === this.copyKey.toLowerCase()) {
      this.mode = "move";
    }
  }
  //endregion
  //region Finalization & validation
  /**
   * Checks if an event can be dropped on the specified position.
   * @private
   * @returns {Boolean} Valid (true) or invalid (false)
   */
  isValidDrop(dragData) {
    const {
      newResource,
      resourceRecord,
      browserEvent
    } = dragData, sourceRecord = dragData.draggedEntities[0], { target } = browserEvent;
    if (!newResource) {
      return !this.constrainDragToTimeline && this.externalDropTargetSelector ? Boolean(target.closest(this.externalDropTargetSelector)) : false;
    }
    if (newResource.isSpecialRow || newResource.readOnly) {
      return false;
    }
    if (resourceRecord.$original !== newResource) {
      return !sourceRecord.event.resources.includes(newResource);
    }
    return true;
  }
  checkDragValidity(dragData, event) {
    var _a, _b, _c;
    const me = this, scheduler = me.currentOverClient;
    let result;
    if ((_a = dragData.newResource) == null ? void 0 : _a.readOnly) {
      return false;
    }
    if (!scheduler.allowOverlap && !scheduler.isDateRangeAvailable(
      dragData.startDate,
      dragData.endDate,
      dragData.draggedEntities[0],
      dragData.newResource
    )) {
      result = {
        valid: false,
        message: me.L("L{eventOverlapsExisting}")
      };
    } else {
      result = me.validatorFn.call(
        me.validatorFnThisObj || me,
        dragData,
        event
      );
    }
    if (!result || result.valid) {
      result = (_c = (_b = scheduler["checkEventDragValidity"]) == null ? void 0 : _b.call(scheduler, dragData, event)) != null ? _c : result;
    }
    return result;
  }
  //endregion
  //region Update records
  /**
   * Update events being dragged.
   * @private
   * @param context Drag data.
   */
  async updateRecords(context) {
    const me = this, fromScheduler = me.client, toScheduler = me.currentOverClient, copyKeyPressed = me.mode === "copy", { draggedEntities, timeDiff, initialAssignmentsState } = context, originalStartDate = initialAssignmentsState[0].startDate, droppedStartDate = me.adjustStartDate(originalStartDate, timeDiff);
    let result;
    if (!context.externalDropTarget) {
      if (!toScheduler.timeAxis.timeSpanInAxis(droppedStartDate, DateHelper.add(droppedStartDate, draggedEntities[0].event.durationMS, "ms"))) {
        context.valid = false;
      }
      if (context.valid) {
        fromScheduler.eventStore.suspendAutoCommit();
        toScheduler.eventStore.suspendAutoCommit();
        result = await me.updateAssignments(fromScheduler, toScheduler, context, copyKeyPressed);
        fromScheduler.eventStore.resumeAutoCommit();
        toScheduler.eventStore.resumeAutoCommit();
      }
    }
    if (context.valid) {
      toScheduler.trigger("eventDrop", Object.assign(me.getTriggerParams(context), {
        isCopy: copyKeyPressed,
        copyMode: me.copyMode,
        domEvent: context.browserEvent,
        targetEventRecord: context.targetEventRecord,
        targetResourceRecord: context.newResource,
        externalDropTarget: context.externalDropTarget
      }));
    }
    return result;
  }
  /**
   * Update assignments being dragged
   * @private
   */
  async updateAssignments(fromScheduler, toScheduler, context, copy) {
    var _a;
    const me = this, { copyMode } = me, isCrossScheduler = fromScheduler !== toScheduler, { isVertical } = toScheduler, {
      assignmentStore: fromAssignmentStore,
      eventStore: fromEventStore
    } = fromScheduler, {
      assignmentStore: toAssignmentStore,
      eventStore: toEventStore
    } = toScheduler, fromResourceStore = fromScheduler.isVertical ? fromScheduler.resourceStore : fromScheduler.store, {
      eventRecords,
      assignmentRecords,
      timeDiff,
      initialAssignmentsState,
      newResource: toResource
    } = context, { unifiedDrag } = me, useSingleAssignment = toEventStore.usesSingleAssignment || toEventStore.usesSingleAssignment !== false && fromEventStore.usesSingleAssignment, effectiveCopyMode = copyMode === "event" ? "event" : copyMode === "assignment" ? "assignment" : useSingleAssignment ? "event" : "assignment", event1Date = me.adjustStartDate(assignmentRecords[0].event.startDate, timeDiff), eventsToAdd = [], eventsToRemove = [], assignmentsToAdd = [], assignmentsToRemove = [], eventsToCheck = [], eventsToBatch = /* @__PURE__ */ new Set();
    fromScheduler.suspendRefresh();
    toScheduler.suspendRefresh();
    let updated = false, updatedEvent = false, indexDiff = me.getIndexDiff(context);
    if (isVertical) {
      eventRecords.forEach((draggedEvent, i) => {
        const eventBar = context.eventBarEls[i];
        delete draggedEvent.instanceMeta(fromScheduler).hasTemporaryDragElement;
        if (eventBar.dataset.transient) {
          eventBar.remove();
        }
      });
    }
    const eventBarEls = context.eventBarEls.slice(), addedEvents = [], copiedAssignmentsMap = {};
    for (let i = 0; i < assignmentRecords.length; i++) {
      const originalAssignment = assignmentRecords[i];
      let draggedEvent = originalAssignment.event, draggedAssignment;
      if (copy) {
        draggedAssignment = originalAssignment.copy();
        copiedAssignmentsMap[originalAssignment.id] = draggedAssignment;
      } else {
        draggedAssignment = originalAssignment;
      }
      if (!draggedAssignment.isOccurrenceAssignment && (!fromAssignmentStore.includes(originalAssignment) || !fromEventStore.includes(draggedEvent))) {
        eventBarEls[i].remove();
        eventBarEls.splice(i, 1);
        assignmentRecords.splice(i, 1);
        i--;
        continue;
      }
      const initialState = initialAssignmentsState[i], originalEventRecord = draggedEvent, originalStartDate = initialState.startDate, originalResourceRecord = initialState.resource, newStartDate = this.constrainDragToTimeSlot ? originalStartDate : unifiedDrag ? event1Date : me.adjustStartDate(originalStartDate, timeDiff);
      if (fromAssignmentStore !== toAssignmentStore) {
        const keepEvent = originalEventRecord.assignments.length > 1 || copy;
        let newAssignment;
        if (copy) {
          newAssignment = draggedAssignment;
        } else {
          newAssignment = draggedAssignment.copy();
          copiedAssignmentsMap[draggedAssignment.id] = newAssignment;
        }
        if (newAssignment.event && !useSingleAssignment) {
          newAssignment.event = newAssignment.event.id;
          newAssignment.resource = newAssignment.resource.id;
        }
        if (!copy) {
          assignmentsToRemove.push(draggedAssignment);
        }
        if (!keepEvent) {
          eventsToRemove.push(originalEventRecord);
        }
        if (copy && (copyMode === "event" || copyMode === "auto" && toEventStore.usesSingleAssignment) || !toEventStore.getById(originalEventRecord.id)) {
          draggedEvent = toEventStore.createRecord({
            ...originalEventRecord.data,
            children: (_a = originalEventRecord.children) == null ? void 0 : _a.map((child) => child.copy()),
            // If we're copying the event (not making new assignment to existing), we need to generate
            // phantom id to link event to the assignment record
            id: copy && (copyMode === "event" || copyMode === "auto") ? void 0 : originalEventRecord.id,
            // Engine gets mad if not nulled
            calendar: null
          });
          newAssignment.set({
            eventId: draggedEvent.id,
            event: draggedEvent
          });
          eventsToAdd.push(draggedEvent);
        }
        if (!useSingleAssignment) {
          assignmentsToAdd.push(newAssignment);
        }
        draggedAssignment = newAssignment;
      }
      let newResource = toResource, reassignedFrom = null;
      if (!unifiedDrag) {
        newResource = me.getNewResource(context, originalResourceRecord, indexDiff) || toResource;
      }
      const isCrossResource = draggedAssignment.resourceId !== newResource.$original.id;
      if (isCrossResource) {
        reassignedFrom = fromResourceStore.getById(draggedAssignment.resourceId);
        if (copy && fromAssignmentStore === toAssignmentStore) {
          draggedAssignment.setData({
            resource: null,
            resourceId: null
          });
          draggedAssignment.resource = newResource;
          draggedAssignment.event = toEventStore.getById(draggedAssignment.eventId);
          const shouldCopyEvent = copyMode === "event" || fromEventStore.usesSingleAssignment && copyMode === "auto";
          if (shouldCopyEvent) {
            draggedEvent = draggedEvent.copy();
            draggedEvent.meta.endDateCached = me.adjustStartDate(draggedEvent.endDate, timeDiff);
            draggedEvent.endDate = null;
            draggedAssignment.event = draggedEvent;
            if (toEventStore.usesSingleAssignment) {
              draggedEvent.resource = newResource;
              draggedEvent.resourceId = newResource.id;
            }
          }
          if (!toAssignmentStore.find((a) => a.eventId === draggedAssignment.eventId && a.resourceId === draggedAssignment.resourceId) && !assignmentsToAdd.find((r) => r.eventId === draggedAssignment.eventId && r.resourceId === draggedAssignment.resourceId)) {
            shouldCopyEvent && eventsToAdd.push(draggedEvent);
            assignmentsToAdd.push(draggedAssignment);
          }
        } else {
          draggedAssignment.resource = newResource;
        }
        draggedEvent.isEvent && eventsToBatch.add(draggedEvent);
        updated = true;
        if (draggedEvent.isOccurrence) {
          draggedEvent.set("newResource", newResource);
        }
        if (isCrossScheduler && useSingleAssignment) {
          draggedEvent.resourceId = newResource.id;
        }
      } else {
        if (copy && (copyMode === "event" || copyMode === "auto" && fromEventStore.usesSingleAssignment) && !eventsToAdd.includes(draggedEvent)) {
          draggedEvent = draggedEvent.copy();
          draggedEvent.meta.endDateCached = me.adjustStartDate(draggedEvent.endDate, timeDiff);
          draggedEvent.endDate = null;
          eventsToAdd.push(draggedEvent);
          draggedAssignment.event = draggedEvent;
          if (toEventStore.usesSingleAssignment) {
            draggedEvent.set({
              resource: newResource,
              resourceId: newResource.id
            });
          }
          assignmentsToAdd.push(draggedAssignment);
        }
      }
      if (!eventsToCheck.find((ev) => ev.draggedEvent === draggedEvent) && !DateHelper.isEqual(draggedEvent.startDate, newStartDate)) {
        while (!draggedEvent.isOccurrence && draggedEvent.isBatchUpdating) {
          draggedEvent.endBatch(true);
        }
        const shouldKeepStartDate = copy && !isCrossScheduler && !useSingleAssignment && effectiveCopyMode === "assignment" && isCrossResource;
        if (!shouldKeepStartDate) {
          draggedEvent.startDate = newStartDate;
          eventsToCheck.push({ draggedEvent, originalStartDate });
        }
        draggedEvent.isEvent && eventsToBatch.add(draggedEvent);
        updatedEvent = true;
      }
      toScheduler.processEventDrop({
        eventRecord: draggedEvent,
        resourceRecord: newResource,
        element: i === 0 ? context.context.element : context.context.relatedElements[i - 1],
        context,
        toScheduler,
        reassignedFrom,
        eventsToAdd,
        addedEvents,
        draggedAssignment
      });
      toScheduler.trigger("processEventDrop", {
        originalAssignment,
        draggedAssignment,
        context,
        copyMode,
        isCopy: copy
      });
    }
    fromAssignmentStore.remove(assignmentsToRemove);
    fromEventStore.remove(eventsToRemove);
    toAssignmentStore.add(assignmentsToAdd);
    if (copy && fromAssignmentStore === toAssignmentStore) {
      const { syncIdMap } = fromScheduler.foregroundCanvas;
      Object.entries(copiedAssignmentsMap).forEach(([originalId, cloneRecord]) => {
        const element = syncIdMap[originalId];
        delete syncIdMap[originalId];
        syncIdMap[cloneRecord.id] = element;
      });
    }
    eventsToAdd.length && addedEvents.push(...toEventStore.add(eventsToAdd));
    addedEvents == null ? void 0 : addedEvents.forEach((added) => eventsToBatch.add(added));
    if (assignmentsToRemove.length || eventsToRemove.length || assignmentsToAdd.length || eventsToAdd.length) {
      updated = true;
    }
    if (updated || updatedEvent) {
      useSingleAssignment && eventsToBatch.forEach((eventRecord) => eventRecord.beginBatch());
      await Promise.all([
        toScheduler.project !== fromScheduler.project ? toScheduler.project.commitAsync() : null,
        fromScheduler.project.commitAsync()
      ]);
      useSingleAssignment && eventsToBatch.forEach((eventRecord) => eventRecord.endBatch(false, true));
    }
    if (!updated) {
      updated = eventsToCheck.some(
        ({ draggedEvent, originalStartDate }) => !DateHelper.isEqual(draggedEvent.startDate, originalStartDate)
      );
    }
    if (!me.constrainDragToTimeline && updated) {
      for (let i = 0; i < assignmentRecords.length; i++) {
        const assignmentRecord = copiedAssignmentsMap[assignmentRecords[i].id] || assignmentRecords[i], originalDraggedEvent = assignmentRecord.event, draggedEvent = (addedEvents == null ? void 0 : addedEvents.find((r) => r.id === originalDraggedEvent.id)) || originalDraggedEvent, eventBar = context.eventBarEls[i], element = i === 0 ? context.context.element : context.context.relatedElements[i - 1], inTimeAxis = toScheduler.isInTimeAxis(draggedEvent);
        delete draggedEvent.meta.endDateCached;
        if (!copy) {
          DomSync.removeChild(eventBar.parentElement, eventBar);
        }
        if (draggedEvent.resource && (isVertical || toScheduler.rowManager.getRowFor(draggedEvent.resource)) && inTimeAxis) {
          if (!draggedEvent.parent || draggedEvent.parent.isRoot) {
            const elRect = Rectangle.from(element, toScheduler.foregroundCanvas, true);
            DomHelper.setTopLeft(element, elRect.y, elRect.x);
            DomSync.addChild(toScheduler.foregroundCanvas, element, draggedEvent.assignments[0].id);
            isCrossScheduler && toScheduler.processCrossSchedulerEventDrop({
              eventRecord: draggedEvent,
              toScheduler
            });
          }
          element.classList.remove("b-sch-event-hover", "b-active", "b-drag-proxy", "b-dragging");
          element.retainElement = false;
        }
      }
    }
    toScheduler.resumeRefresh(false);
    fromScheduler.resumeRefresh(false);
    if (assignmentRecords.length > 0) {
      if (!updated) {
        context.valid = false;
      } else {
        eventBarEls.forEach((el) => delete el.lastDomConfig);
        toScheduler.refreshWithTransition();
        if (isCrossScheduler) {
          fromScheduler.refreshWithTransition();
          toScheduler.selectedEvents = addedEvents;
        }
      }
    }
  }
  //endregion
  //region Drag data
  getProductDragContext(dragData) {
    const me = this, { currentOverClient: scheduler } = me, target = dragData.browserEvent.target, previousResolvedResource = dragData.newResource || dragData.resourceRecord, previousTargetEventRecord = dragData.targetEventRecord;
    let targetEventRecord = scheduler ? me.resolveEventRecord(target, scheduler) : null, newResource, externalDropTarget;
    if (dragData.eventRecords.includes(targetEventRecord)) {
      targetEventRecord = null;
    }
    if (me.constrainDragToResource) {
      newResource = dragData.resourceRecord;
    } else if (!me.constrainDragToTimeline) {
      newResource = me.resolveResource();
    } else if (scheduler) {
      newResource = me.resolveResource() || dragData.newResource || dragData.resourceRecord;
    }
    const { assignmentRecords, eventRecords } = dragData, isOverNewResource = previousResolvedResource !== newResource;
    let valid = Boolean(newResource && !newResource.isSpecialRow);
    if (!newResource && me.externalDropTargetSelector) {
      externalDropTarget = target.closest(me.externalDropTargetSelector);
      valid = Boolean(externalDropTarget);
    }
    return {
      valid,
      externalDropTarget,
      eventRecords,
      assignmentRecords,
      newResource,
      targetEventRecord,
      dirty: isOverNewResource || targetEventRecord !== previousTargetEventRecord,
      proxyElements: [dragData.context.element, ...dragData.context.relatedElements || []]
    };
  }
  getMinimalDragData(info) {
    const me = this, { scheduler } = me, element = me.getElementFromContext(info), eventRecord = me.resolveEventRecord(element, scheduler), resourceRecord = scheduler.resolveResourceRecord(element), assignmentRecord = scheduler.resolveAssignmentRecord(element), assignmentRecords = assignmentRecord ? [assignmentRecord] : [];
    if (assignmentRecord && (scheduler.isAssignmentSelected(assignmentRecords[0]) || me.drag.startEvent.ctrlKey && scheduler.multiEventSelect)) {
      assignmentRecords.push.apply(assignmentRecords, me.getRelatedRecords(assignmentRecord));
    }
    const eventRecords = [...new Set(assignmentRecords.map((assignment) => assignment.event))];
    return {
      eventRecord,
      resourceRecord,
      assignmentRecord,
      eventRecords,
      assignmentRecords
    };
  }
  setupProductDragData(info) {
    var _a;
    const me = this, { scheduler } = me, element = me.getElementFromContext(info), {
      eventRecord,
      resourceRecord,
      assignmentRecord,
      assignmentRecords
    } = me.getMinimalDragData(info), eventBarEls = [];
    if (me.constrainDragToResource && !resourceRecord) {
      throw new Error("Resource could not be resolved for event: " + eventRecord.id);
    }
    let dateConstraints;
    if (me.constrainDragToTimeline) {
      dateConstraints = (_a = me.getDateConstraints) == null ? void 0 : _a.call(me, resourceRecord, eventRecord);
      const constrainRectangle = me.constrainRectangle = me.getConstrainingRectangle(dateConstraints, resourceRecord, eventRecord), eventRegion = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      super.setupConstraints(
        constrainRectangle,
        eventRegion,
        scheduler.timeAxisViewModel.snapPixelAmount,
        Boolean(dateConstraints.start)
      );
    }
    assignmentRecords.forEach((assignment) => {
      let eventBarEl = scheduler.getElementFromAssignmentRecord(assignment, true);
      if (!eventBarEl) {
        eventBarEl = scheduler.currentOrientation.addTemporaryDragElement(assignment.event, assignment.resource);
      }
      eventBarEls.push(eventBarEl);
    });
    return {
      record: assignmentRecord,
      draggedEntities: assignmentRecords,
      dateConstraints: (dateConstraints == null ? void 0 : dateConstraints.start) ? dateConstraints : null,
      // Create copies of the elements
      eventBarCopies: eventBarEls.map((el) => me.createProxy(el)),
      eventBarEls
    };
  }
  getDateConstraints(resourceRecord, eventRecord) {
    var _a;
    const { scheduler } = this, externalDateConstraints = (_a = scheduler.getDateConstraints) == null ? void 0 : _a.call(scheduler, resourceRecord, eventRecord);
    let minDate, maxDate;
    if (this.constrainDragToTimeSlot) {
      minDate = eventRecord.startDate;
      maxDate = eventRecord.endDate;
    } else if (externalDateConstraints) {
      minDate = externalDateConstraints.start;
      maxDate = externalDateConstraints.end;
    }
    return {
      start: minDate,
      end: maxDate
    };
  }
  getConstrainingRectangle(dateRange, resourceRecord, eventRecord) {
    return this.scheduler.getScheduleRegion(this.constrainDragToResource && resourceRecord, eventRecord, true, dateRange && {
      start: dateRange.start,
      end: dateRange.end
    });
  }
  /**
   * Initializes drag data (dates, constraints, dragged events etc). Called when drag starts.
   * @private
   * @param info
   * @returns {*}
   */
  getDragData(info) {
    const dragData = this.getMinimalDragData(info) || {};
    return {
      ...super.getDragData(info),
      ...dragData,
      initialAssignmentsState: dragData.assignmentRecords.map((assignment) => ({
        startDate: assignment.event.startDate,
        resource: assignment.resource,
        assignment
      }))
    };
  }
  /**
   * Provide your custom implementation of this to allow additional selected records to be dragged together with the original one.
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment about to be dragged
   * @returns {Scheduler.model.AssignmentModel[]} An array of assignment records to drag together with the original
   */
  getRelatedRecords(assignmentRecord) {
    return this.scheduler.selectedAssignments.filter((selectedRecord) => selectedRecord !== assignmentRecord && !selectedRecord.resource.readOnly && selectedRecord.event.isDraggable);
  }
  /**
   * Get correct axis coordinate depending on schedulers mode (horizontal -> x, vertical -> y). Also takes milestone
   * layout into account.
   * @private
   * @param {Scheduler.model.EventModel} eventRecord Record being dragged
   * @param {HTMLElement} element Element being dragged
   * @param {Number[]} coord XY coordinates
   * @returns {Number|Number[]} X,Y or XY
   */
  getCoordinate(eventRecord, element, coord) {
    const scheduler = this.currentOverClient;
    if (scheduler.isHorizontal) {
      let x = coord[0];
      if (scheduler.milestoneLayoutMode !== "default" && eventRecord.isMilestone) {
        switch (scheduler.milestoneAlign) {
          case "center":
            x += element.offsetWidth / 2;
            break;
          case "end":
            x += element.offsetWidth;
            break;
        }
      }
      return x;
    } else {
      let y = coord[1];
      if (scheduler.milestoneLayoutMode !== "default" && eventRecord.isMilestone) {
        switch (scheduler.milestoneAlign) {
          case "center":
            y += element.offsetHeight / 2;
            break;
          case "end":
            y += element.offsetHeight;
            break;
        }
      }
      return y;
    }
  }
  /**
   * Get resource record occluded by the drag proxy.
   * @private
   * @returns {Scheduler.model.ResourceModel}
   */
  resolveResource() {
    const me = this, client = me.currentOverClient, { isHorizontal } = client, {
      context,
      browserEvent,
      dragProxy
    } = me.dragData, element = dragProxy || context.element, pageRect = Rectangle.from(element, null, true), y = client.isVertical || me.unifiedDrag ? context.clientY : pageRect.center.y, localRect = Rectangle.from(element, client.timeAxisSubGridElement, true), { x: lx, y: ly } = localRect.center, eventTarget = me.getMouseMoveEventTarget(browserEvent);
    let resource = null;
    if (client.element.contains(eventTarget)) {
      if (isHorizontal) {
        const row = client.rowManager.getRowAt(y);
        resource = row && client.store.getAt(row.dataIndex);
      } else {
        resource = client.resolveResourceRecord(client.timeAxisSubGridElement.querySelector(".b-sch-timeaxis-cell"), [lx, ly]);
      }
    }
    return resource == null ? void 0 : resource.$original;
  }
  //endregion
  //region Other stuff
  adjustStartDate(startDate, timeDiff) {
    const scheduler = this.currentOverClient;
    startDate = scheduler.timeAxis.roundDate(new Date(startDate - 0 + timeDiff), scheduler.snapRelativeToEventStartDate ? startDate : false);
    return this.constrainStartDate(startDate);
  }
  getRecordElement(assignmentRecord) {
    return this.client.getElementFromAssignmentRecord(assignmentRecord, true);
  }
  // Used by the Dependencies feature to draw lines to the drag proxy instead of the original event element
  getProxyElement(assignmentRecord) {
    var _a;
    const { dragData } = this;
    if (this.isDragging && ((_a = dragData.proxyElements) == null ? void 0 : _a.length)) {
      const index = dragData.assignmentRecords.indexOf(assignmentRecord);
      if (index >= 0) {
        return dragData.proxyElements[index];
      }
    }
    return null;
  }
  //endregion
  //#region Salesforce hooks
  getMouseMoveEventTarget(event) {
    return event.target;
  }
  //#endregion
};
EventDrag._$name = "EventDrag";
GridFeatureManager.registerFeature(EventDrag, true, "Scheduler");
GridFeatureManager.registerFeature(EventDrag, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/EventDragCreate.js
var EventDragCreate = class extends DragCreateBase {
  //endregion
  //region Events
  /**
   * Fires on the owning Scheduler after the new event has been created.
   * @event dragCreateEnd
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The new `EventModel` record.
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource for the row in which the event is being
   * created.
   * @param {MouseEvent} event The ending mouseup event.
   * @param {HTMLElement} eventElement The DOM element representing the newly created event un the UI.
   */
  /**
   * Fires on the owning Scheduler at the beginning of the drag gesture. Returning `false` from a listener prevents
   * the drag create operation from starting.
   *
   * ```javascript
   * const scheduler = new Scheduler({
   *     listeners : {
   *         beforeDragCreate({ date }) {
   *             // Prevent drag creating events in the past
   *             return date >= Date.now();
   *         }
   *     }
   * });
   * ```
   *
   * @event beforeDragCreate
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Date} date The datetime associated with the drag start point.
   */
  /**
   * Fires on the owning Scheduler after the drag start has created a new Event record.
   * @event dragCreateStart
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement The element representing the new event.
   */
  /**
   * Fires on the owning Scheduler to allow implementer to prevent immediate finalization by setting
   * `data.context.async = true` in the listener, to show a confirmation popup etc
   * ```javascript
   *  scheduler.on('beforedragcreatefinalize', ({context}) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   * @event beforeDragCreateFinalize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement The element representing the new Event record
   * @param {Object} context
   * @param {Boolean} context.async Set true to handle drag create asynchronously (e.g. to wait for user
   * confirmation)
   * @param {Function} context.finalize Call this method to finalize drag create. This method accepts one
   * argument: pass true to update records, or false, to ignore changes
   */
  /**
   * Fires on the owning Scheduler at the end of the drag create gesture whether or not
   * a new event was created by the gesture.
   * @event afterDragCreate
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement The element representing the created event record
   */
  //endregion
  //region Init
  get scheduler() {
    return this.client;
  }
  get store() {
    return this.client.eventStore;
  }
  get project() {
    return this.client.project;
  }
  updateLockLayout(lock) {
    this.dragActiveCls = `b-dragcreating${lock ? " b-dragcreate-lock" : ""}`;
  }
  //endregion
  //region Scheduler specific implementation
  handleBeforeDragCreate(drag, eventRecord, event) {
    var _a;
    const { resourceRecord } = drag;
    if (this.disabled || resourceRecord.readOnly || !this.scheduler.resourceStore.isAvailable(resourceRecord)) {
      return false;
    }
    const { scheduler } = this, isWorkingTime = !scheduler.isSchedulerPro || eventRecord.ignoreResourceCalendar || resourceRecord.isWorkingTime(drag.mousedownDate), result = isWorkingTime && scheduler.trigger("beforeDragCreate", {
      resourceRecord,
      date: drag.mousedownDate,
      event
    });
    this.dateConstraints = (_a = scheduler.getDateConstraints) == null ? void 0 : _a.call(scheduler, resourceRecord, eventRecord);
    return result;
  }
  dragStart(drag) {
    var _a;
    const me = this, { client } = me, {
      eventStore,
      assignmentStore,
      enableEventAnimations,
      enableTransactionalFeatures
    } = client, { resourceRecord } = drag, eventRecord = me.createEventRecord(drag), resourceRecords = [resourceRecord];
    eventRecord.set("duration", DateHelper.diff(eventRecord.startDate, eventRecord.endDate, eventRecord.durationUnit, true));
    eventRecord.isCreating = true;
    eventRecord.meta.isDragCreating = true;
    client.features.taskEdit && client.features.taskEdit.doCancel();
    if (me.handleBeforeDragCreate(drag, eventRecord, drag.event) === false) {
      return false;
    }
    me.captureStm(true);
    let assignmentRecords = [];
    if (resourceRecord) {
      if (eventStore.usesSingleAssignment || !enableTransactionalFeatures) {
        assignmentRecords = assignmentStore.assignEventToResource(eventRecord, resourceRecord);
      } else {
        assignmentRecords = [assignmentStore.createRecord({
          event: eventRecord,
          resource: resourceRecord
        })];
      }
    }
    if (client.trigger("beforeEventAdd", { eventRecord, resourceRecords, assignmentRecords }) === false) {
      if (eventStore.usesSingleAssignment || !enableTransactionalFeatures) {
        assignmentStore.remove(assignmentRecords);
      }
      return false;
    }
    if (me.lockLayout) {
      eventRecord.meta.excludeFromLayout = true;
    }
    (_a = client.onEventCreated) == null ? void 0 : _a.call(client, eventRecord);
    client.enableEventAnimations = false;
    eventStore.addAsync(eventRecord).then(() => client.enableEventAnimations = enableEventAnimations);
    if (!eventStore.usesSingleAssignment && enableTransactionalFeatures) {
      assignmentStore.add(assignmentRecords[0]);
    }
    client.isCreating = true;
    client.refreshRows();
    client.isCreating = false;
    drag.itemElement = drag.element = client.getElementFromEventRecord(eventRecord);
    if (!DomHelper.isInView(drag.itemElement)) {
      client.scrollable.scrollIntoView(drag.itemElement, {
        animate: true,
        edgeOffset: client.barMargin
      });
    }
    return super.dragStart(drag);
  }
  checkValidity(context, event) {
    const me = this, { client } = me;
    context.resourceRecord = me.dragging.resourceRecord;
    return (client.allowOverlap || client.isDateRangeAvailable(context.startDate, context.endDate, context.eventRecord, context.resourceRecord)) && me.createValidatorFn.call(me.validatorFnThisObj || me, context, event);
  }
  // Determine if resource already has events or not
  isRowEmpty(resourceRecord) {
    const events = this.store.getEventsForResource(resourceRecord);
    return !events || !events.length;
  }
  //endregion
  triggerBeforeFinalize(event) {
    this.client.trigger(`beforeDragCreateFinalize`, event);
  }
  /**
   * Creates an event by the event object coordinates
   * @param {Object} drag The Bryntum event object
   * @private
   */
  createEventRecord(drag) {
    const me = this, { client } = me, dimension = client.isHorizontal ? "X" : "Y", {
      timeAxis,
      eventStore,
      weekStartDay
    } = client, {
      event,
      mousedownDate
    } = drag, draggingEnd = me.draggingEnd = event[`page${dimension}`] > drag.startEvent[`page${dimension}`], eventConfig = {
      name: eventStore.modelClass.fieldMap.name.defaultValue || me.L("L{Object.newEvent}"),
      startDate: draggingEnd ? DateHelper.floor(mousedownDate, timeAxis.resolution, null, weekStartDay) : mousedownDate,
      endDate: draggingEnd ? mousedownDate : DateHelper.ceil(mousedownDate, timeAxis.resolution, null, weekStartDay)
    };
    if (client.project.isGanttProjectMixin) {
      ObjectHelper.assign(eventConfig, {
        constraintDate: eventConfig.startDate,
        constraintType: "startnoearlierthan"
      });
    }
    return eventStore.createRecord(eventConfig);
  }
  async internalUpdateRecord(context, eventRecord) {
    await super.internalUpdateRecord(context, eventRecord);
    if (!this.client.hasEventEditor) {
      context.eventRecord.isCreating = false;
    }
  }
  async finalizeDragCreate(context) {
    const { meta } = context.eventRecord;
    meta.excludeFromLayout = false;
    meta.isDragCreating = false;
    const transferred = await super.finalizeDragCreate(context);
    if (!transferred) {
      await this.freeStm(true);
    } else {
      this.hasStmCapture = false;
    }
    return transferred;
  }
  async cancelDragCreate(context) {
    await super.cancelDragCreate(context);
    await this.freeStm(false);
  }
  getTipHtml(...args) {
    const html = super.getTipHtml(...args), { element } = this.tip;
    element.classList.add("b-sch-dragcreate-tooltip");
    element.classList.toggle("b-too-narrow", this.dragging.context.tooNarrow);
    return html;
  }
  onAborted(context) {
    var _a, _b;
    const { eventRecord, resourceRecord } = context;
    (_b = (_a = this.store).unassignEventFromResource) == null ? void 0 : _b.call(_a, eventRecord, resourceRecord);
    this.store.remove(eventRecord);
  }
};
//region Config
__publicField(EventDragCreate, "$name", "EventDragCreate");
__publicField(EventDragCreate, "configurable", {
  /**
   * Locks the layout during drag create, overriding the default behaviour that uses the same rendering
   * pathway for drag creation as for already existing events.
   *
   * This more closely resembles the behaviour of versions prior to 4.2.0.
   *
   * @config {Boolean} lockLayout
   * @default false
   */
  /**
   * An empty function by default, but provided so that you can perform custom validation on the event being
   * created. Return `true` if the new event is valid, `false` to prevent an event being created.
   * @param {Object} context A drag create context
   * @param {Date} context.startDate Event start date
   * @param {Date} context.endDate Event end date
   * @param {Scheduler.model.EventModel} context.record Event record
   * @param {Scheduler.model.ResourceModel} context.resourceRecord Resource record
   * @param {Event} event The event object
   * @returns {Boolean} `true` if this validation passes
   * @config {Function}
   */
  validatorFn: () => true
});
EventDragCreate._$name = "EventDragCreate";
GridFeatureManager.registerFeature(EventDragCreate, true, "Scheduler");
GridFeatureManager.registerFeature(EventDragCreate, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/EventTooltip.js
var zeroOffset = [0, 0];
var depOffset = [
  null,
  [0, 10],
  [10, 0]
];
var EventTooltip = class extends TooltipBase {
  //region Config
  static get $name() {
    return "EventTooltip";
  }
  static get defaultConfig() {
    return {
      /**
       * Set this value to `false` to keep Tooltip visible after mouse leaves the target element.
       * @config {Boolean} autoHide
       * @default true
       */
      /**
       * A function which receives data about the event and returns a string,
       * or a Promise yielding a string (for async tooltips), to be displayed in the tooltip.
       * This method will be called with an object containing the fields below
       *
       * @config {Function} template
       * @param {Scheduler.model.EventModel} data.eventRecord Hovered event record
       * @param {Date} data.startDate Hovered event start date
       * @param {Date} data.endDate Hovered event end date
       * @param {String} data.startText Start text
       * @param {String} data.endText End text
       * @param {Core.widget.Tooltip} data.tip Current tooltip instance
       * @param {String} data.startClockHtml Predefined HTML to show the start time
       * @param {String} data.endClockHtml Predefined HTML to show the end time
       * @returns {DomConfig|String|null}
       *
       * @category Rendering
       */
      template: (data) => `
                ${data.eventRecord.name ? StringHelper.xss`<div class="b-sch-event-title">${data.eventRecord.name}</div>` : ""}
                ${data.startClockHtml}
                ${data.endClockHtml}`,
      cls: "b-sch-event-tooltip",
      monitorRecordUpdate: true,
      /**
       * Defines what to do if document is scrolled while the tooltip is visible.
       *
       * Valid values: ´null´: do nothing, ´hide´: hide the tooltip or ´realign´: realign to the target if possible.
       *
       * @config {'hide'|'realign'|null}
       * @default
       */
      scrollAction: "hide"
    };
  }
  /**
   * The event which the tooltip feature has been activated for.
   * @member {Scheduler.model.EventModel} eventRecord
   * @readonly
   */
  //endregion
  construct(client, config) {
    super.construct(client, config);
    if (typeof this.align === "string") {
      this.align = { align: this.align };
    }
  }
  onInternalPaint({ firstPaint }) {
    super.onInternalPaint(...arguments);
    if (firstPaint) {
      const { dependencies } = this.client.features;
      if (dependencies) {
        this.tooltip.ion({
          beforeAlign({ source: tooltip, offset = zeroOffset }) {
            const { edgeAligned } = parseAlign(tooltip.align.align), depTerminalOffset = dependencies.disabled || !dependencies.allowCreate ? zeroOffset : depOffset[edgeAligned];
            arguments[0].offset = [
              offset[0] + depTerminalOffset[0],
              offset[1] + depTerminalOffset[1]
            ];
          }
        });
      }
    }
  }
};
EventTooltip._$name = "EventTooltip";
GridFeatureManager.registerFeature(EventTooltip, true, "Scheduler");
GridFeatureManager.registerFeature(EventTooltip, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/StickyEvents.js
var zeroMargins = { width: 0, height: 0 };
var StickyEvents = class extends InstancePlugin {
  construct(scheduler, config) {
    super.construct(scheduler, config);
    if (scheduler.isVertical) {
      this.toUpdate = /* @__PURE__ */ new Set();
      scheduler.ion({
        scroll: "onSchedulerScroll",
        horizontalScroll: "onHorizontalScroll",
        thisObj: this,
        prio: 1e4
      });
    }
  }
  onEventDataGenerated(renderData) {
    if (this.client.isHorizontal) {
      renderData.wrapperCls["b-disable-sticky"] = renderData.eventRecord.stickyContents === false;
    } else {
      this.syncEventContentPosition(renderData, void 0, true);
      this.updateStyles();
    }
  }
  //region Vertical mode
  onSchedulerScroll() {
    if (!this.disabled) {
      this.verticalSyncAllEventsContentPosition(this.client);
    }
  }
  // Have to sync also on horizontal scroll, since we reuse elements and dom configs
  onHorizontalScroll({ subGrid }) {
    if (subGrid === this.client.timeAxisSubGrid) {
      this.verticalSyncAllEventsContentPosition(this.client);
    }
  }
  updateStyles() {
    for (const { contentEl, style } of this.toUpdate) {
      DomHelper.applyStyle(contentEl, style);
    }
    this.toUpdate.clear();
  }
  verticalSyncAllEventsContentPosition(scheduler) {
    const { resourceMap } = scheduler.currentOrientation;
    for (const eventsData of resourceMap.values()) {
      for (const { renderData, elementConfig } of Object.values(eventsData)) {
        const args = [renderData];
        if (elementConfig && renderData.eventRecord.isResourceTimeRange) {
          args.push(elementConfig.children[0]);
        }
        this.syncEventContentPosition.apply(this, args);
      }
    }
    this.toUpdate.size && this.updateStyles();
  }
  syncEventContentPosition(renderData, eventContent = renderData.eventContent, duringGeneration = false) {
    if (this.disabled || // Allow client disable stickiness for certain events
    renderData.eventRecord.stickyContents === false) {
      return;
    }
    const { client } = this, {
      eventRecord,
      resourceRecord,
      useEventBuffer,
      bufferAfterWidth,
      bufferBeforeWidth,
      top,
      height
    } = renderData, scrollPosition = client.scrollable.y, wrapperEl = duringGeneration ? null : client.getElementFromEventRecord(eventRecord, resourceRecord, true), contentEl = wrapperEl && DomSync.getChild(wrapperEl, "event.content"), meta = eventRecord.instanceMeta(client), style = typeof eventContent.style === "string" ? eventContent.style = DomHelper.parseStyle(eventContent.style) : eventContent.style || (eventContent.style = {});
    if (wrapperEl == null ? void 0 : wrapperEl.classList.contains("b-dragging")) {
      return;
    }
    let start = top, contentSize = height, end = start + contentSize;
    if (useEventBuffer) {
      start += bufferBeforeWidth;
      contentSize = contentSize - bufferBeforeWidth - bufferAfterWidth;
      end = start + contentSize;
    }
    if (start < scrollPosition && end >= scrollPosition && !eventRecord.isMilestone) {
      const contentWidth = contentEl == null ? void 0 : contentEl.offsetWidth, justify = (contentEl == null ? void 0 : contentEl.parentNode) && DomHelper.getStyleValue(contentEl.parentNode, "justifyContent"), c = justify === "center" ? (renderData.width - contentWidth) / 2 : 0, eventStart = start, eventEnd = eventStart + contentSize - 1;
      if ((!contentEl || contentWidth) && eventStart < scrollPosition && eventEnd >= scrollPosition) {
        const edgeSizes = this.getEventContentMargins(contentEl), maxOffset = contentEl ? contentSize - contentEl.offsetHeight - edgeSizes.height - c : Number.MAX_SAFE_INTEGER, offset = Math.min(scrollPosition - eventStart, maxOffset - 2);
        style.transform = offset > 0 ? `translateY(${offset}px)` : "";
        meta.stuck = true;
      } else {
        style.transform = "";
        meta.stuck = false;
      }
      if (contentEl) {
        this.toUpdate.add({
          contentEl,
          style
        });
      }
    } else if (contentEl && meta.stuck) {
      style.transform = "";
      meta.stuck = false;
      this.toUpdate.add({
        contentEl,
        style
      });
    }
  }
  // Only measure the margins of an event's contentEl once
  getEventContentMargins(contentEl) {
    if (contentEl == null ? void 0 : contentEl.classList.contains("b-sch-event-content")) {
      return DomHelper.getEdgeSize(contentEl, "margin");
    }
    return zeroMargins;
  }
  //endregion
  doDisable() {
    super.doDisable(...arguments);
    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }
};
__publicField(StickyEvents, "$name", "StickyEvents");
__publicField(StickyEvents, "type", "stickyEvents");
__publicField(StickyEvents, "pluginConfig", {
  chain: ["onEventDataGenerated"]
});
StickyEvents._$name = "StickyEvents";
GridFeatureManager.registerFeature(StickyEvents, true, "Scheduler");
GridFeatureManager.registerFeature(StickyEvents, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/TimeRanges.js
var TimeRanges = class extends AbstractTimeRanges.mixin(AttachToProjectMixin_default) {
  //region Config
  static get $name() {
    return "TimeRanges";
  }
  static get defaultConfig() {
    return {
      store: true
    };
  }
  //endregion
  //region Init & destroy
  doDestroy() {
    var _a;
    (_a = this.storeDetacher) == null ? void 0 : _a.call(this);
    super.doDestroy();
  }
  /**
   * Returns the TimeRanges which occur within the client Scheduler's time axis.
   * @property {Scheduler.model.TimeSpan[]}
   */
  get timeRanges() {
    const me = this;
    if (!me._timeRanges) {
      const { store } = me;
      let { records } = store;
      if (store.recurringEvents) {
        const {
          startDate,
          endDate
        } = me.client.timeAxis;
        records = records.flatMap((timeSpan) => {
          if (timeSpan.isRecurring) {
            return timeSpan.getOccurrencesForDateRange(startDate, endDate);
          }
          return timeSpan;
        });
      }
      if (me.currentTimeLine) {
        if (!store.recurringEvents) {
          records = records.slice();
        }
        records.push(me.currentTimeLine);
      }
      me._timeRanges = records;
    }
    return me._timeRanges;
  }
  //endregion
  //region Current time line
  attachToProject(project) {
    var _a, _b;
    super.attachToProject(project);
    const me = this;
    (_a = me.projectTimeZoneChangeDetacher) == null ? void 0 : _a.call(me);
    if (me.showCurrentTimeLine) {
      me.projectTimeZoneChangeDetacher = (_b = me.client.project) == null ? void 0 : _b.ion({ timeZoneChange: () => me.updateCurrentTimeLine() });
      if (me.currentTimeLine) {
        me.updateCurrentTimeLine();
      }
    }
  }
  initCurrentTimeLine() {
    const me = this;
    if (me.currentTimeLine || !me.showCurrentTimeLine) {
      return;
    }
    const data = typeof me.showCurrentTimeLine === "object" ? me.showCurrentTimeLine : {};
    me.currentTimeLine = me.store.modelClass.new({
      id: "currentTime",
      cls: "b-sch-current-time"
    }, data);
    me.currentTimeInterval = me.setInterval(() => me.updateCurrentTimeLine(), me.currentTimeLineUpdateInterval);
    me._timeRanges = null;
    me.updateCurrentTimeLine();
  }
  updateCurrentTimeLine() {
    var _a;
    const me = this, { currentTimeLine } = me;
    currentTimeLine.timeZone = (_a = me.project) == null ? void 0 : _a.timeZone;
    currentTimeLine.setLocalDate("startDate", /* @__PURE__ */ new Date());
    currentTimeLine.endDate = currentTimeLine.startDate;
    if (!currentTimeLine.originalData.name) {
      currentTimeLine.name = DateHelper.format(currentTimeLine.startDate, me.currentDateFormat);
    }
    me.renderRanges();
  }
  hideCurrentTimeLine() {
    const me = this;
    if (!me.currentTimeLine) {
      return;
    }
    me.clearInterval(me.currentTimeInterval);
    me.currentTimeLine = null;
    me.refresh();
  }
  updateShowCurrentTimeLine(show) {
    if (show) {
      this.initCurrentTimeLine();
    } else {
      this.hideCurrentTimeLine();
    }
  }
  //endregion
  //region Menu items
  /**
   * Adds a menu item to show/hide current time line.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateTimeAxisHeaderMenu({ items }) {
    items.currentTimeLine = {
      weight: 400,
      text: this.L("L{showCurrentTimeLine}"),
      checked: this.currentTimeLine,
      onToggle: ({ checked }) => {
        if (!this.showCurrentTimeLine) {
          this.showCurrentTimeLine = checked;
        } else {
          this.updateShowCurrentTimeLine(checked);
        }
      }
    };
  }
  //endregion
  //region Store
  attachToStore(store) {
    const me = this;
    let renderRanges = false;
    if (me.storeDetacher) {
      me.storeDetacher();
      renderRanges = true;
    }
    me.storeDetacher = store.ion({
      change: "onStoreChange",
      refresh: "onStoreChange",
      thisObj: me
    });
    me._timeRanges = null;
    renderRanges && me.renderRanges();
  }
  /**
   * Returns the {@link Core.data.Store store} used by this feature
   * @property {Core.data.Store}
   * @category Misc
   */
  get store() {
    return this.client.project.timeRangeStore;
  }
  updateStore(store) {
    const me = this, { client } = me, { project } = client;
    store = project.timeRangeStore;
    me.attachToStore(store);
    if (client.timeRanges && !client._timeRangesExposed) {
      store.add(client.timeRanges);
      delete client.timeRanges;
    }
  }
  // Called by ProjectConsumer after a new store is assigned at runtime
  attachToTimeRangeStore(store) {
    this.store = store;
  }
  resolveTimeRangeRecord(el) {
    const id = el.closest(this.baseSelector).dataset.id;
    if (id === "currentTime") {
      return this.currentTimeLine;
    }
    return this.store.getById(id);
  }
  onStoreChange({ type, action }) {
    const me = this;
    me._timeRanges = null;
    if (me.disabled || !me.client.isVisible || me.isConfiguring || type === "refresh" && action !== "batch") {
      return;
    }
    me.client.runWithTransition(() => me.renderRanges(), !me.client.refreshSuspended);
  }
  //endregion
  //region Drag
  onDragStart(event) {
    const me = this, { context } = event, record = me.resolveTimeRangeRecord(context.element.closest(me.baseSelector)), rangeBodyEl = me.getBodyElementByRecord(record);
    context.relatedElements = [rangeBodyEl];
    Object.assign(context, {
      record,
      rangeBodyEl,
      originRangeX: DomHelper.getTranslateX(rangeBodyEl),
      originRangeY: DomHelper.getTranslateY(rangeBodyEl)
    });
    super.onDragStart(event);
    me.showTip(context);
  }
  onDrop(event) {
    const { context } = event;
    if (!context.valid) {
      return this.onInvalidDrop({ context });
    }
    const me = this, { client } = me, { record } = context, box = Rectangle.from(context.rangeBodyEl), newStart = client.getDateFromCoordinate(box.getStart(client.rtl, client.isHorizontal), "round", false), wasModified = record.startDate - newStart !== 0;
    if (wasModified) {
      record.setStartDate(newStart);
    } else {
      me.drag.abort();
    }
    me.destroyTip();
    super.onDrop(event);
  }
  //endregion
  //region Resize
  onResizeStart({ context }) {
    const me = this, record = me.resolveTimeRangeRecord(context.element.closest(me.baseSelector)), rangeBodyEl = me.getBodyElementByRecord(record);
    Object.assign(context, {
      record,
      rangeBodyEl
    });
    me.showTip(context);
    super.onResizeStart(...arguments);
  }
  onResizeDrag({ context }) {
    const me = this, { rangeBodyEl } = context, { client } = me, box = Rectangle.from(context.element), startPos = box.getStart(client.rtl, client.isHorizontal), endPos = box.getEnd(client.rtl, client.isHorizontal), startDate = client.getDateFromCoordinate(startPos, "round", false), endDate = client.getDateFromCoordinate(endPos, "round", false);
    if (me.client.isVertical) {
      if (context.edge === "top") {
        DomHelper.setTranslateY(rangeBodyEl, context.newY);
      }
      rangeBodyEl.style.height = context.newHeight + "px";
    } else {
      if (context.edge === "left") {
        DomHelper.setTranslateX(rangeBodyEl, context.newX);
      }
      rangeBodyEl.style.width = context.newWidth + "px";
    }
    me.updateDateIndicator({ startDate, endDate });
  }
  onResize({ context }) {
    if (!context.valid) {
      return this.onInvalidDrop({ context });
    }
    const me = this, { client } = me, { rtl } = client, record = context.record, box = Rectangle.from(context.element), startPos = box.getStart(rtl, client.isHorizontal), endPos = box.getEnd(rtl, client.isHorizontal), newStart = client.getDateFromCoordinate(startPos, "round", false), isStart = rtl && context.edge === "right" || !rtl && context.edge === "left" || context.edge === "top", newEnd = client.getDateFromCoordinate(endPos, "round", false), wasModified = isStart && record.startDate - newStart !== 0 || newEnd && record.endDate - newEnd !== 0;
    if (wasModified && newEnd > newStart) {
      if (isStart) {
        record.setStartDate(newStart, false);
      } else {
        record.setEndDate(newEnd, false);
      }
    } else {
      me.onInvalidResize({ context });
    }
    me.destroyTip();
  }
  onInvalidResize({ context }) {
    const me = this;
    me.resize.reset();
    context.rangeBodyEl.parentElement.lastDomConfig = context.rangeBodyEl.lastDomConfig = context.element.lastDomConfig = null;
    me.renderRanges();
    me.destroyTip();
  }
  //endregion
};
__publicField(TimeRanges, "configurable", {
  /**
   * Store that holds the time ranges (using the {@link Scheduler.model.TimeSpan} model or subclass thereof).
   * A store will be automatically created if none is specified.
   * @config {Core.data.Store|StoreConfig}
   * @category Misc
   */
  store: {
    modelClass: TimeSpan
  },
  /**
   * The interval (as amount of ms) defining how frequently the current timeline will be updated
   * @config {Number}
   * @default
   * @category Misc
   */
  currentTimeLineUpdateInterval: 1e4,
  /**
   * The date format to show in the header for the current time line (when {@link #config-showCurrentTimeLine} is configured).
   * See {@link Core.helper.DateHelper} for the possible formats to use.
   * @config {String}
   * @default
   * @category Common
   */
  currentDateFormat: "HH:mm",
  /**
   * Show a line indicating current time. Either `true` or `false` or a {@link Scheduler.model.TimeSpan}
   * configuration object to apply to this special time range (allowing you to provide a custom text):
   *
   * ```javascript
   * showCurrentTimeLine : {
   *     name : 'Now'
   * }
   * ```
   *
   * The line carries the CSS class name `b-sch-current-time`, and this may be used to add custom styling to it.
   *
   * @prp {Boolean|TimeSpanConfig}
   * @default
   * @category Common
   */
  showCurrentTimeLine: false
});
TimeRanges._$name = "TimeRanges";
GridFeatureManager.registerFeature(TimeRanges, false, ["TimelineBase"]);

// ../Scheduler/lib/Scheduler/view/mixin/DelayedRecordsRendering.js
var DelayedRecordsRendering_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static get properties() {
      return {
        recordsToRefresh: /* @__PURE__ */ new Set()
      };
    }
    beforeRenderRow({ record }) {
      var _a2;
      if ((_a2 = this.recordIsReadyForRendering) == null ? void 0 : _a2.call(this, record)) {
        this.unscheduleRecordRefresh(record);
      }
      return super.beforeRenderRow(...arguments);
    }
    cleanupScheduledRecord() {
      const { rowManager, store } = this;
      for (const record of [...this.recordsToRefresh]) {
        if (!record.stores.includes(store) || !rowManager.getRowById(record)) {
          this.recordsToRefresh.delete(record);
        }
      }
    }
    renderScheduledRecords() {
      const me = this;
      if (!me.refreshSuspended) {
        me.cleanupScheduledRecord();
        const { rowManager } = me, records = [...me.recordsToRefresh], rows = records.map((record) => rowManager.getRowById(record));
        if (rows.length) {
          rowManager.renderRows(rows);
          me.trigger("scheduledRecordsRender", { records, rows });
        }
        if (me.recordsToRefresh.size) {
          me.scheduleRecordRefresh();
        }
      } else {
        me.scheduleRecordRefresh();
      }
    }
    /**
     * Cancels scheduled rows refresh.
     * @param {Core.data.Model|Core.data.Model[]|Boolean} [clearRecords=true] `true` to also clear the list of records
     * scheduled for refreshing. `false` will result only canceling the scheduled call and keeping intact
     * the list of records planned for refreshing.
     */
    unscheduleRecordRefresh(clearRecords = true) {
      const me = this;
      if (clearRecords === true) {
        me.recordsToRefresh.clear();
      } else if (clearRecords) {
        ArrayHelper.asArray(clearRecords).forEach((record) => me.recordsToRefresh.delete(record));
      }
      if (me.scheduledRecordsRefreshTimer && !me.recordsToRefresh.size) {
        me.clearTimeout(me.scheduledRecordsRefreshTimer);
      }
    }
    /**
     * Schedules the provided record row refresh.
     * @param {Core.data.Model} records Record to refresh the row of.
     */
    scheduleRecordRefresh(records) {
      const me = this;
      if (records) {
        ArrayHelper.asArray(records).forEach((record) => me.recordsToRefresh.add(record));
      }
      me.scheduledRecordsRefreshTimer = me.setTimeout({
        fn: "renderScheduledRecords",
        delay: me.scheduledRecordsRefreshTimeout,
        cancelOutstanding: true
      });
    }
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "DelayedRecordsRendering"), __publicField(_a, "configurable", {
    scheduledRecordsRefreshTimeout: 10
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/TimelineHistogramRendering.js
var TimelineHistogramRendering = class extends Base {
  construct(client) {
    super.construct();
    this.client = client;
  }
  init() {
  }
  onTimeAxisViewModelUpdate() {
    const { scrollable } = this.client.timeAxisSubGrid;
    this.updateFromHorizontalScroll(scrollable.x);
  }
  // Update header range on horizontal scroll
  updateFromHorizontalScroll(scrollX) {
    const me = this, {
      client,
      // scrollBuffer is an export only thing
      scrollBuffer
    } = me, {
      timeAxisSubGrid,
      timeAxis,
      rtl
    } = client, { width } = timeAxisSubGrid, { totalSize } = client.timeAxisViewModel, start = scrollX, returnEnd = timeAxisSubGrid.scrollable.maxX !== 0 && Math.abs(timeAxisSubGrid.scrollable.maxX) <= Math.round(start) + 5, startDate = client.getDateFromCoord({ coord: Math.max(0, start - scrollBuffer), ignoreRTL: true }), endDate = returnEnd ? timeAxis.endDate : client.getDateFromCoord({ coord: start + width + scrollBuffer, ignoreRTL: true }) || timeAxis.endDate;
    if (startDate && !client._viewPresetChanging) {
      me._visibleDateRange = { startDate, endDate, startMS: startDate.getTime(), endMS: endDate.getTime() };
      me.viewportCoords = rtl ? { left: totalSize - scrollX - width + scrollBuffer, right: totalSize - scrollX - scrollBuffer } : { left: scrollX - scrollBuffer, right: scrollX + width + scrollBuffer };
      const range = client.timeView.range = { startDate, endDate };
      client.internalOnVisibleDateRangeChange(range);
      if (!client.refreshSuspended && client.rowManager.rows.length) {
        if (client.rowManager.rows[0].id === null) {
          return;
        }
        if (me._timeAxisStartDate - timeAxis.startDate || me._timeAxisEndDate - timeAxis.endDate) {
          me._timeAxisStartDate = timeAxis.startDate;
          me._timeAxisEndDate = timeAxis.endDate;
          client.rowManager.renderRows(client.rowManager.rows);
        }
      }
    }
  }
  onViewportResize() {
  }
  refreshRows() {
  }
  get visibleDateRange() {
    return this._visibleDateRange;
  }
  translateToPageCoordinate(x) {
    const { client } = this, { scrollable } = client.timeAxisSubGrid;
    let result = x + client.timeAxisSubGridElement.getBoundingClientRect().left;
    if (client.rtl) {
      result -= scrollable.maxX - Math.abs(client.scrollLeft);
    } else {
      result -= client.scrollLeft;
    }
    return result;
  }
  translateToScheduleCoordinate(x) {
    const { client } = this, { scrollable } = client.timeAxisSubGrid;
    let result = x - client.timeAxisSubGridElement.getBoundingClientRect().left - globalThis.scrollX;
    if (client.rtl) {
      result += scrollable.maxX - Math.abs(client.scrollLeft);
    } else {
      result += client.scrollLeft;
    }
    return result;
  }
  getDateFromXY(xy, roundingMethod, local, allowOutOfRange = false) {
    const { client } = this;
    let coord = xy[0];
    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }
    coord = client.getRtlX(coord);
    return client.timeAxisViewModel.getDateFromPosition(coord, roundingMethod, allowOutOfRange);
  }
};
__publicField(TimelineHistogramRendering, "configurable", {
  scrollBuffer: 0
});
TimelineHistogramRendering._$name = "TimelineHistogramRendering";

// ../Scheduler/lib/Scheduler/view/TimelineHistogramBase.js
var histogramWidgetCleanState = {
  series: null,
  topValue: null
};
var emptyFn = () => {
};
var TimelineHistogramBase = class extends TimelineBase.mixin(DelayedRecordsRendering_default) {
  static get properties() {
    return {
      histogramDataByRecord: /* @__PURE__ */ new Map(),
      collectingDataFor: /* @__PURE__ */ new Map()
    };
  }
  updateGetRecordData(fn) {
    this._getRecordData = fn ? this.resolveCallback(fn) : null;
  }
  updateHardRefreshOnTimeAxisReconfigure(value) {
    const name = "hardRefreshOnTimeAxisReconfigure";
    if (value) {
      this.timeAxis.ion({
        name,
        endReconfigure: "onTimeAxisEndReconfigure",
        thisObj: this
      });
    } else {
      this.detachListeners(name);
    }
  }
  //endregion
  //region Constructor/Destructor
  construct(config) {
    super.construct(config);
    const me = this;
    me.scheduleRefreshRows = me.createOnFrame(me.refreshRows, [], me, true);
    me.rowManager.ion({
      beforeRowHeight: "onBeforeRowHeight",
      thisObj: me
    });
  }
  onDestroy() {
    var _a;
    this.clearHistogramDataCache();
    (_a = this._histogramWidget) == null ? void 0 : _a.destroy();
    this.barTooltip = null;
  }
  //endregion
  //region Internal
  // Used by shared features to resolve an event or task
  resolveTimeSpanRecord(element) {
  }
  getScheduleMouseEventParams(cellData, event) {
    const record = this.store.getById(cellData.id);
    return { record };
  }
  get currentOrientation() {
    if (!this._currentOrientation) {
      this._currentOrientation = new TimelineHistogramRendering(this);
    }
    return this._currentOrientation;
  }
  updateSeries(value) {
    const me = this;
    me.histogramWidget.series = value;
    me._series = me.histogramWidget.series;
    if (me.isPainted && !me.isConfiguring) {
      me.scheduleRefreshRows();
    }
  }
  getAsyncEventSuffixForStore(store) {
    return store.isAbstractPartOfProjectStoreMixin ? "PreCommit" : "";
  }
  /**
   * Schedules the component rows refresh on the next animation frame. However many time it is
   * called in one event run, it will only be scheduled to run once.
   */
  scheduleRefreshRows() {
  }
  getRowHeight() {
    return this.rowHeight;
  }
  onInternalPaint({ firstPaint }) {
    super.onInternalPaint({ firstPaint });
    if (firstPaint && this.showBarTip) {
      this.barTooltip = {};
    }
  }
  updateGetBarTip(value) {
    if (value) {
      this.barTooltipTemplate = null;
    }
    return value;
  }
  changeBarTooltip(tooltip, oldTooltip) {
    oldTooltip == null ? void 0 : oldTooltip.destroy();
    if (tooltip) {
      return tooltip.isTooltip ? tooltip : this.barTooltipClass.new({
        forElement: this.timeAxisSubGridElement,
        forSelector: ".b-histogram rect",
        hoverDelay: 0,
        trackMouse: false,
        cls: "b-celltooltip-tip",
        getHtml: this.getTipHtml.bind(this)
      }, this.showBarTip, tooltip);
    }
    return null;
  }
  async getTipHtml(args) {
    if (this.showBarTip && this.barTooltipTemplate) {
      const { activeTarget } = args, index = parseInt(activeTarget.dataset.index, 10), record = this.getRecordFromElement(activeTarget), histogramData = await this.getRecordHistogramData(record);
      return this.barTooltipTemplate({
        ...args,
        datum: this.extractHistogramDataArray(histogramData, record)[index],
        record,
        index
      });
    }
  }
  collectTicksWidth() {
    const { ticks } = this.timeAxis, prevDuration = ticks[0].endDate - ticks[0].startDate, tickDurations = { 0: prevDuration };
    let totalDuration = prevDuration, isMonotonous = true;
    for (let i = 1, { length } = ticks; i < length; i++) {
      const tick = ticks[i], duration = tick.endDate - tick.startDate;
      if (prevDuration !== duration) {
        isMonotonous = false;
      }
      totalDuration += duration;
      tickDurations[i] = duration;
    }
    if (!isMonotonous) {
      const ticksWidth = {};
      for (let i = 0, { length } = ticks; i < length; i++) {
        ticksWidth[i] = tickDurations[i] / totalDuration;
      }
      this.ticksWidth = ticksWidth;
    } else {
      this.ticksWidth = null;
    }
  }
  changeHistogramWidget(widget) {
    var _a;
    const me = this;
    if (widget && !widget.isHistogram) {
      if (me.getBarTextRenderData && !widget.getBarTextRenderData) {
        widget.getBarTextRenderData = me.getBarTextRenderData;
      }
      widget = me.histogramWidgetClass.new({
        owner: me,
        appendTo: me.element,
        height: me.rowHeight,
        width: ((_a = me.timeAxisColumn) == null ? void 0 : _a.width) || 0,
        getBarTip: !me.barTooltipTemplate && me.getBarTip || emptyFn,
        getRectClass: me.getRectClass || me.getRectClassDefault,
        getBarText: me.getBarText || me.getBarTextDefault,
        getOutlineClass: me.getOutlineClass,
        getRectConfig: me.getRectConfig
      }, widget);
      widget.suspendRefresh();
      me.getBarTextDefault = me.getBarTextDefault.bind(widget);
    }
    return widget;
  }
  // Injectable method.
  getRectClassDefault(series, rectConfig, datum) {
  }
  getBarTextDefault(datum, index) {
  }
  updateShowBarTip(value) {
    this.barTooltip = value;
  }
  //endregion
  //region Columns
  get columns() {
    return super.columns;
  }
  set columns(columns) {
    const me = this;
    super.columns = columns;
    if (!me.isDestroying) {
      me.timeAxisColumn.renderer = me.histogramRenderer.bind(me);
      me.timeAxisColumn.cellCls = me.timeAxisColumnCellCls;
    }
  }
  //endregion
  //region Events
  onHistogramDataCacheSet({ record, data }) {
    this.scheduleRecordRefresh(record);
  }
  onTimeAxisEndReconfigure() {
    if (this.hardRefreshOnTimeAxisReconfigure) {
      this.clearHistogramDataCache();
      this.scheduleRefreshRows();
    }
  }
  onStoreUpdateRecord({ record, changes }) {
    const me = this;
    if (!me.getRecordData && me.dataModelField && changes[me.dataModelField]) {
      me.clearHistogramDataCache(record);
    }
    return super.onStoreUpdateRecord(...arguments);
  }
  onStoreRemove({ records }) {
    super.onStoreRemove(...arguments);
    for (const record of records) {
      this.clearHistogramDataCache(record);
    }
  }
  onBeforeRowHeight({ height }) {
    if (this._timeAxisColumn) {
      const widget = this._histogramWidget;
      if (widget) {
        widget.height = height;
        widget.onElementResize(widget.element);
      }
    }
  }
  onTimeAxisViewModelUpdate() {
    super.onTimeAxisViewModelUpdate(...arguments);
    const widget = this._histogramWidget;
    if (widget) {
      widget.width = this.timeAxisViewModel.totalSize;
      widget.onElementResize(widget.element);
    }
    this.collectTicksWidth();
  }
  //endregion
  //region Data processing
  extractHistogramDataArray(histogramData, record) {
    return histogramData;
  }
  processRecordRenderData(renderData) {
    return renderData;
  }
  /**
   * Clears the histogram data cache for the provided record (if provided).
   * If the record is not provided clears the cache for all records.
   * @param {Core.data.Model} [record] Record to clear the cache for.
   */
  clearHistogramDataCache(record) {
    if (record) {
      this.histogramDataByRecord.delete(record);
    } else {
      this.histogramDataByRecord.clear();
    }
  }
  /**
   * Caches the provided histogram data for the given record.
   * @param {Core.data.Model} record Record to cache data for.
   * @param {Object} data Histogram data to cache.
   */
  setHistogramDataCache(record, data) {
    const eventData = { record, data };
    this.trigger("beforeHistogramDataCacheSet", eventData);
    this.histogramDataByRecord.set(eventData.record, eventData.data);
    this.trigger("histogramDataCacheSet", eventData);
  }
  /**
   * Returns entire histogram data cache if no record provided,
   * or cached data for the provided record.
   * @param {Core.data.Model} [record] Record to get the cached data for.
   * @returns {Object} The provided record cached data or all the records data cache
   * as a `Map` keyed by records.
   */
  getHistogramDataCache(record) {
    return record ? this.histogramDataByRecord.get(record) : this.histogramDataByRecord;
  }
  /**
   * Returns `true` if there is cached histogram data for the provided record.
   * @param {Core.data.Model} record Record to check the cache existence for.
   * @returns {Boolean} `True` if there is a cache for provided record.
   */
  hasHistogramDataCache(record) {
    return this.histogramDataByRecord.has(record);
  }
  finalizeDataRetrievingInternal(record, data) {
    this.collectingDataFor.delete(record);
    this.setHistogramDataCache(record, data);
    return data;
  }
  finalizeDataRetrieving(record, data) {
    if (Objects.isPromise(data)) {
      this.collectingDataFor.set(record, data);
      return data.then((data2) => this.finalizeDataRetrievingInternal(record, data2));
    }
    return this.finalizeDataRetrievingInternal(record, data);
  }
  /**
   * Retrieves the histogram data for the provided record.
   *
   * The method first checks if there is cached data for the record and returns it if found.
   * Otherwise it starts collecting data by calling {@link #config-getRecordData} (if provided)
   * or by reading it from {@link #config-dataModelField} record field.
   *
   * The method can be asynchronous depending on the provided {@link #config-getRecordData} function.
   * If the function returns a `Promise` then the method will return a wrapping `Promise` in turn that will
   * resolve with the collected histogram data.
   *
   * The method triggers {@link #event-histogramDataCacheSet} event when a record data is ready.
   *
   * @param {Core.data.Model} record Record to retrieve the histogram data for.
   * @returns {Object|Promise} The histogram data for the provided record or a `Promise` that will provide the data
   * when resolved.
   */
  getRecordHistogramData(record) {
    const me = this, { getRecordData } = me;
    let result = me.collectingDataFor.get(record) || me.getHistogramDataCache(record);
    if (!result && !me.hasHistogramDataCache(record)) {
      if (getRecordData) {
        result = getRecordData.handler.call(getRecordData.thisObj, ...arguments);
      } else {
        result = record.get(me.dataModelField);
      }
      result = me.finalizeDataRetrieving(record, result);
    }
    return result;
  }
  recordIsReadyForRendering(record) {
    return !this.collectingDataFor.has(record);
  }
  //endregion
  //region Render
  beforeRenderRow(eventData) {
    const me = this, histogramData = me.getRecordHistogramData(eventData.record);
    if (!Objects.isPromise(histogramData)) {
      const data = histogramData ? me.extractHistogramDataArray(histogramData, eventData.record) : [];
      if (!data) {
        return;
      }
      if (me.ticksWidth) {
        for (let i = 0, { length } = data; i < length; i++) {
          data[i].width = me.ticksWidth[i];
        }
      }
      const histogramConfig = Objects.merge(
        // reset topValue by default to enable its auto-detection
        { topValue: null },
        me.initialConfig.histogramWidget,
        {
          data,
          series: { ...me.series }
        }
      );
      eventData = {
        ...eventData,
        histogramConfig,
        histogramData,
        histogramWidget: me.histogramWidget
      };
      me.trigger("beforeRenderHistogramRow", eventData);
      delete eventData.eventName;
      delete eventData.source;
      delete eventData.type;
      delete eventData.oldId;
      delete eventData.row;
      delete eventData.recordIndex;
      me._recordRenderData = me.processRecordRenderData(eventData);
    }
    super.beforeRenderRow(...arguments);
  }
  applyHistogramWidgetConfig(histogramWidget = this.histogramWidget, histogramConfig) {
    Object.assign(histogramWidget, histogramWidgetCleanState, histogramConfig);
  }
  /**
   * Renders a histogram for a row.
   * The method applies passed data to the underlying {@link #property-histogramWidget} component.
   * Then the component renders charts and the method injects them into the corresponding column cell.
   * @param {HistogramRenderData} renderData Render data
   * @internal
   */
  renderRecordHistogram(renderData) {
    const me = this, { histogramData, cellElement } = renderData;
    if (!histogramData) {
      cellElement.innerHTML = "";
      return;
    }
    me.trigger("beforeRenderRecordHistogram", renderData);
    delete renderData.eventName;
    delete renderData.type;
    delete renderData.source;
    const histogramWidget = renderData.histogramWidget || me.histogramWidget;
    me.applyHistogramWidgetConfig(histogramWidget, renderData.histogramConfig);
    histogramWidget.refresh({
      // tell histogram we want it to pass renderData as an extra argument in nested calls of getBarText and
      // other configured hooks
      args: [renderData]
    });
    const histogramCloneElement = histogramWidget.element.cloneNode(true);
    histogramCloneElement.removeAttribute("id");
    histogramCloneElement.classList.remove("b-hide-offscreen");
    cellElement.innerHTML = "";
    cellElement.appendChild(histogramCloneElement);
  }
  /**
   * TimeAxis column renderer used by this view to render row histograms.
   * It first calls {@link #function-getRecordHistogramData} method to retrieve
   * the histogram data for the renderer record.
   * If the record data is ready the method renders the record histogram.
   * And in case the method returns a `Promise` the renderer just
   * schedules the record refresh for later and exits.
   *
   * @param {HistogramRenderData} renderData Object containing renderer parameters.
   * @internal
   */
  histogramRenderer(renderData) {
    const me = this, histogramData = renderData.histogramData || me.getRecordHistogramData(renderData.record);
    if (!Objects.isPromise(histogramData)) {
      Object.assign(renderData, me._recordRenderData);
      return me.renderRecordHistogram(...arguments);
    }
    return "";
  }
  /**
   * Group feature hook triggered by the feature to render group headers
   * @param {*} renderData
   * @internal
   */
  buildGroupHeader(renderData) {
    if (renderData.column === this.timeAxisColumn) {
      return this.histogramRenderer(renderData);
    }
    return this.features.group.buildGroupHeader(renderData);
  }
  //endregion
  get widgetClass() {
  }
};
//region Config
__publicField(TimelineHistogramBase, "$name", "TimelineHistogramBase");
__publicField(TimelineHistogramBase, "type", "timelinehistogrambase");
__publicField(TimelineHistogramBase, "configurable", {
  timeAxisColumnCellCls: "b-sch-timeaxis-cell b-timelinehistogram-cell",
  mode: "horizontal",
  rowHeight: 50,
  /**
   * Set to `true` if you want to display a tooltip when hovering an allocation bar. You can also pass a
   * {@link Core/widget/Tooltip#configs} config object.
   * Please use {@link #config-barTooltipTemplate} function to customize the tooltip contents.
   * @prp {Boolean|TooltipConfig}
   */
  showBarTip: false,
  barTooltip: null,
  barTooltipClass: Tooltip,
  /**
   * Object enumerating data series for the histogram.
   * The object keys are treated as the series identifiers and values are objects that
   * must contain two properties:
   *  - `type` A String, either `'bar'` or `'outline'`
   *  - `field` A String, the name of the property to use from the data objects in the {@link #config-data} option.
   *
   * ```javascript
   * histogram = new TimelineHistogram({
   *     ...
   *     series : {
   *         s1 : {
   *             type  : 'bar',
   *             field : 's1'
   *         },
   *         s2 : {
   *             type  : 'outline',
   *             field : 's2'
   *         }
   *     },
   *     store : new Store({
   *         data : [
   *             {
   *                 id            : 'r1',
   *                 name          : 'Record 1',
   *                 histogramData : [
   *                     { s1 : 200, s2 : 100 },
   *                     { s1 : 150, s2 : 50 },
   *                     { s1 : 175, s2 : 50 },
   *                     { s1 : 175, s2 : 75 }
   *                 ]
   *             },
   *             {
   *                 id            : 'r2',
   *                 name          : 'Record 2',
   *                 histogramData : [
   *                     { s1 : 100, s2 : 100 },
   *                     { s1 : 150, s2 : 125 },
   *                     { s1 : 175, s2 : 150 },
   *                     { s1 : 175, s2 : 75 }
   *                 ]
   *             }
   *         ]
   *     })
   * });
   * ```
   *
   * @config {Object<String, HistogramSeries>}
   */
  series: null,
  /**
   * Record field from which the histogram data will be collected.
   *
   * ```javascript
   * histogram = new TimelineHistogram({
   *     ...
   *     series : {
   *         s1 : {
   *             type : 'bar'
   *         }
   *     },
   *     dataModelField : 'foo',
   *     store : new Store({
   *         data : [
   *             {
   *                 id   : 'r1',
   *                 name : 'Record 1',
   *                 foo  : [
   *                     { s1 : 200 },
   *                     { s1 : 150 },
   *                     { s1 : 175 },
   *                     { s1 : 175 }
   *                 ]
   *             },
   *             {
   *                 id   : 'r2',
   *                 name : 'Record 2',
   *                 foo  : [
   *                     { s1 : 100 },
   *                     { s1 : 150 },
   *                     { s1 : 175 },
   *                     { s1 : 175 }
   *                 ]
   *             }
   *         ]
   *     })
   * });
   * ```
   *
   * Alternatively {@link #config-getRecordData} function can be used to build a
   * record's histogram data dynamically.
   * @config {String}
   * @default
   */
  dataModelField: "histogramData",
  /**
   * A function, or name of a function which builds histogram data for the provided record.
   *
   * See also {@link #config-dataModelField} allowing to load histogram data from a record field.
   *
   * @config {Function|String} getRecordData
   * @param {Core.data.Model} getRecordData.record Record to get histogram data for.
   * @param {Object} [aggregationContext] Context object passed in case the data is being retrieved
   * as a part of some parent record data collecting.
   * @returns {Object} Histogram data.
   */
  getRecordData: null,
  /**
   * When set to `true` (default) the component reacts on time axis changes
   * (zooming or changing the displayed time span), clears the histogram data cache of the records
   * and then refreshes the view.
   * @config {Boolean}
   * @default
   */
  hardRefreshOnTimeAxisReconfigure: true,
  /**
   * A Function which returns a CSS class name to add to a rectangle element.
   * The following parameters are passed:
   * @param {HistogramSeries} series The series being rendered
   * @param {DomConfig} rectConfig The rectangle configuration object
   * @param {Object} datum The datum being rendered
   * @param {Number} index The index of the datum being rendered
   * @param {HistogramRenderData} renderData Current render data giving access to the record, row and cell
   * being rendered.
   * @returns {String} CSS classes of the rectangle element
   * @config {Function}
   */
  getRectClass: null,
  /**
   * A Function which returns a CSS class name to add to a path element
   * built for an `outline` type series.
   * The following parameters are passed:
   * @param {HistogramSeries} series The series being rendered
   * @param {Object[]} data The series data
   * @param {HistogramRenderData} renderData Current render data giving access to the record, row and cell
   * being rendered.
   * @returns {String} CSS class name of the path element
   * @config {Function}
   */
  getOutlineClass(series) {
    return "";
  },
  readOnly: true,
  /**
   * A Function which returns the tooltip text to display when hovering a bar.
   * The following parameters are passed:
   * @param {HistogramSeries} series The series being rendered
   * @param {DomConfig} rectConfig The rectangle configuration object
   * @param {Object} datum The datum being rendered
   * @param {Number} index The index of the datum being rendered
   * @deprecated Since 5.0.0. Please use {@link #config-barTooltipTemplate}
   * @config {Function}
   */
  getBarTip: null,
  /**
   * A Function which returns the tooltip text to display when hovering a bar.
   * The following parameters are passed:
   * @param {Object} context The tooltip context info
   * @param {Object} context.datum The histogram bar being hovered info
   * @param {Core.widget.Tooltip} context.tip The tooltip instance
   * @param {HTMLElement} context.element The Element for which the Tooltip is monitoring mouse movement
   * @param {HTMLElement} context.activeTarget The target element that triggered the show
   * @param {Event} context.event The raw DOM event
   * @param {Core.data.Model} data.record The record which value
   * the hovered bar displays.
   * @returns {String} Tooltip HTML content
   * @config {Function}
   */
  barTooltipTemplate: null,
  /**
   * A Function which returns the text to render inside a bar.
   *
   * ```javascript
   * new TimelineHistogram({
   *     series : {
   *         foo : {
   *             type  : 'bar',
   *             field : 'foo'
   *         }
   *     },
   *     getBarText(datum) {
   *         // display the value in the bar
   *         return datum.foo;
   *     },
   *     ...
   * })
   * ```
   *
   * **Please note** that the function will be injected into the underlying
   * {@link Core/widget/graph/Histogram} component that is used under the hood
   * to render actual charts.
   * So `this` will refer to the {@link Core/widget/graph/Histogram} instance, not
   * this class instance.
   * To access the view please use `this.owner` in the function:
   *
   * ```javascript
   * new TimelineHistogram({
   *     getBarText(datum) {
   *         // "this" in the method refers core Histogram instance
   *         // get the view instance
   *         const timelineHistogram = this.owner;
   *
   *         .....
   *     },
   *     ...
   * })
   * ```
   * The following parameters are passed:
   * @param {Object} datum The datum being rendered
   * @param {Number} index The index of the datum being rendered
   * @param {HistogramSeries} series The series (provided if histogram widget
   * {@link Core/widget/graph/Histogram#config-singleTextForAllBars} is `false`)
   * @param {HistogramRenderData} renderData Current render data giving access to the record, row and cell
   * being rendered.
   * @returns {String} Text to render inside the bar
   * @config {Function}
   */
  getBarText: null,
  getRectConfig: null,
  getBarTextRenderData: void 0,
  /**
   * The class used for building the {@link #property-histogramWidget histogram widget}
   * @config {Core.widget.graph.Histogram}
   * @default
   */
  histogramWidgetClass: Histogram,
  /**
   * The underlying {@link Core/widget/graph/Histogram} component that is used under the hood
   * to render actual charts.
   * @member {Core.widget.graph.Histogram} histogramWidget
   */
  /**
   * An instance or a configuration object of the underlying {@link Core/widget/graph/Histogram}
   * component that is used under the hood to render actual charts.
   * In case a configuration object is provided the built class is defined with
   * {@link #config-histogramWidgetClass} config.
   * @config {Core.widget.graph.Histogram|HistogramConfig}
   */
  histogramWidget: {
    cls: "b-hide-offscreen b-timelinehistogram-histogram",
    omitZeroHeightBars: true,
    data: []
  },
  fixedRowHeight: true
});
TimelineHistogramBase.initClass();
TimelineHistogramBase._$name = "TimelineHistogramBase";

// ../Scheduler/lib/Scheduler/view/mixin/TimelineHistogramGrouping.js
var TimelineHistogramGrouping_default = (Target) => {
  var _a;
  return _a = class extends (Target || TimelineHistogramBase) {
    afterConfigure() {
      const me = this;
      me.internalAggregateDataEntry = me.internalAggregateDataEntry.bind(this);
      me.internalInitAggregatedDataEntry = me.internalInitAggregatedDataEntry.bind(this);
      super.afterConfigure();
      if (me.features.treeGroup) {
        me.features.treeGroup.ion({
          // reset groups cache on store grouping change
          beforeDataLoad: me.onTreeGroupBeforeDataLoad,
          thisObj: me
        });
      }
    }
    updateAggregateFunctions(value) {
      for (const [id, fn] of Object.entries(value)) {
        fn.id = id;
        if (fn.aliases) {
          for (const alias of fn.aliases) {
            value[alias] = fn;
          }
        }
      }
    }
    updateStore(store) {
      super.updateStore(...arguments);
      this.detachListeners("store");
      if (store) {
        store.ion({
          name: "store",
          // reset groups cache on store grouping change
          // Recalculation of group membership is done through sort
          group: this.onStoreGroup,
          sort: this.onStoreSort,
          thisObj: this
        });
      }
    }
    changeAggregateDataEntry(fn) {
      return this.bindCallback(fn);
    }
    changeGetDataEntryForAggregating(fn) {
      return this.bindCallback(fn);
    }
    changeInitAggregatedDataEntry(fn) {
      return this.bindCallback(fn);
    }
    //endregion
    //region Event listeners
    onHistogramDataCacheSet({ record, data }) {
      super.onHistogramDataCacheSet(...arguments);
      if (this.aggregateHistogramDataForGroups) {
        this.scheduleRecordParentsRefresh(record);
      }
    }
    onTreeGroupBeforeDataLoad() {
      if (this.aggregateHistogramDataForGroups) {
        this.resetGeneratedRecordsHistogramDataCache();
      }
    }
    onStoreGroup() {
      if (this.aggregateHistogramDataForGroups) {
        this.resetGeneratedRecordsHistogramDataCache();
      }
    }
    onStoreSort({ source }) {
      if (this.aggregateHistogramDataForGroups && source.isGrouped) {
        this.resetGeneratedRecordsHistogramDataCache();
      }
    }
    //endregion
    // Override getRecordHistogramData to support data aggregating for parents
    getRecordHistogramData(record, aggregationContext) {
      const me = this;
      let result;
      if (me.aggregateHistogramDataForGroups && me.isGroupRecord(record)) {
        result = me.collectingDataFor.get(record) || me.getHistogramDataCache(record);
        if (!result && !me.hasHistogramDataCache(record)) {
          result = me.getGroupRecordHistogramData(record, aggregationContext);
          result = me.finalizeDataRetrieving(record, result);
        }
      } else {
        result = super.getRecordHistogramData(...arguments);
      }
      return result;
    }
    //region ArrayHelper.aggregate default callbacks
    internalAggregateDataEntry(acc, ...args) {
      const { aggregateFunctions } = this;
      for (const { id, aggregate = "sum" } of Object.values(this.series)) {
        let fn;
        if (aggregate !== false && (fn = aggregateFunctions[aggregate].entry)) {
          acc = fn(id, acc, ...args);
        }
      }
      return this.aggregateDataEntry ? this.aggregateDataEntry(acc, ...args) : acc;
    }
    internalInitAggregatedDataEntry() {
      const entry = this.initAggregatedDataEntry ? this.initAggregatedDataEntry(...arguments) : {}, { aggregateFunctions } = this;
      for (const { id, aggregate = "sum" } of Object.values(this.series)) {
        const fn = aggregateFunctions[aggregate].init;
        if (fn && aggregate !== false) {
          fn(id, entry, ...arguments);
        }
      }
      return entry;
    }
    //endregion
    //region Public methods
    /**
     * Resets generated records (parents and links) data cache
     */
    resetGeneratedRecordsHistogramDataCache() {
      const { store } = this;
      for (const record of this.getHistogramDataCache().keys()) {
        if (record.isGroupHeader || record.generatedParent || record.isLinked && !store.includes(record)) {
          this.clearHistogramDataCache(record);
        }
      }
    }
    setHistogramDataCache(record, data) {
      super.setHistogramDataCache(record, data);
      if (record.isLinked) {
        super.setHistogramDataCache(record.$original, data);
      } else if (record.$links) {
        const { store } = this;
        for (const link of record.$links) {
          if (store.includes(link)) {
            super.setHistogramDataCache(link, data);
          }
        }
      }
    }
    // Override method to support links built by TreeGroup feature
    // so for the links the method will retrieve original records cache
    getHistogramDataCache(record) {
      let result = super.getHistogramDataCache(record);
      if (!result && record.isLinked) {
        result = super.getHistogramDataCache(record.$original);
      }
      return result;
    }
    /**
     * Aggregates the provided group record children histogram data.
     * If some of the provided records data is not ready yet the method returns a `Promise`
     * that's resolved once the data is ready and aggregated.
     *
     * ```javascript
     * // get parent record aggregated histogram data
     * const aggregatedData = await histogram.getGroupRecordHistogramData(record);
     * ```
     *
     * @param {Core.data.Model} record Group record.
     * @param {Object} [aggregationContext] Optional aggregation context object.
     * When provided will be used as a shared object passed through while collecting the data.
     * So can be used for some custom application purposes.
     * @returns {Object[]|Promise} Either the provided group record histogram data or a `Promise` that
     * returns the data when resolved.
     * @category Parent histogram data collecting
     */
    getGroupRecordHistogramData(record, aggregationContext = {}) {
      aggregationContext.parentRecord = record;
      const result = this.aggregateRecordsHistogramData(this.getGroupChildren(record), aggregationContext);
      return Objects.isPromise(result) ? result.then((res) => res) : result;
    }
    /**
     * Aggregates multiple records histogram data.
     * If some of the provided records data is not ready yet the method returns a `Promise`
     * that's resolved once the data is ready and aggregated.
     *
     * @param {Core.data.Model[]} records Records to aggregate data of.
     * @param {Object} [aggregationContext] Optional aggregation context object.
     * Can be used by to share some data between the aggregation steps.
     * @returns {Object[]|Promise} Either the provided group record histogram data or a `Promise` that
     * returns the data when resolved.
     * @category Parent histogram data collecting
     */
    aggregateRecordsHistogramData(records, aggregationContext = {}) {
      const me = this, recordsData = [], { parentRecord } = aggregationContext;
      let hasPromise = false;
      for (const child of records) {
        const childData = me.getRecordHistogramData(child, aggregationContext);
        hasPromise = hasPromise || Objects.isPromise(childData);
        childData && recordsData.push(childData);
      }
      if (hasPromise) {
        return Promise.all(recordsData).then((values) => {
          aggregationContext.parentRecord = parentRecord;
          values = values.filter((x) => x);
          return me.aggregateHistogramData(values, records, aggregationContext);
        });
      }
      return me.aggregateHistogramData(recordsData, records, aggregationContext);
    }
    /**
     * Indicates if the passed record represents a group header built by {@link Grid/feature/Group} feature
     * or a group built by {@link Grid/feature/TreeGroup} feature.
     *
     * @param {Core.data.Model} record The view record
     * @returns {Boolean} `true` if the record represents a group.
     * @internal
     */
    isGroupRecord(record) {
      return record.isGroupHeader || this.isTreeGrouped && record.generatedParent;
    }
    /**
     * For a record representing a group built by {@link Grid/feature/Group} or {@link Grid/feature/TreeGroup}
     * feature returns the group members.
     *
     * @param {Core.data.Model} record A group record
     * @returns {Core.data.Model[]} Records belonging to the group
     * @internal
     */
    getGroupChildren(record) {
      return record.groupChildren || record.children;
    }
    /**
     * For a record belonging to a group built by {@link Grid/feature/Group} or {@link Grid/feature/TreeGroup}
     * feature returns the group header or parent respectively.
     *
     * @param {Core.data.Model} record A member record
     * @returns {Core.data.Model} The record group header or parent record
     * @internal
     */
    getRecordParent(record) {
      const { groupParent } = record;
      return (groupParent == null ? void 0 : groupParent.get(this.store.id)) || this.isTreeGrouped && record.parent;
    }
    /**
     * Schedules refresh of the provided record's parents.
     * The method iterates up from the provided record parent to the root node
     * and schedules the iterated node rows refresh.
     * @param {Core.data.Model} record Record to refresh parent rows of.
     * @param {Boolean} [clearCache=true] `true` to reset the scheduled records histogram data cache.
     * @internal
     */
    scheduleRecordParentsRefresh(record, clearCache = true) {
      const me = this;
      let groupParent;
      while (groupParent = me.getRecordParent(record)) {
        clearCache && me.clearHistogramDataCache(groupParent);
        me.scheduleRecordRefresh(groupParent);
        record = groupParent;
      }
    }
    //endregion
    /**
     * Aggregates collected child records data to its parent.
     * The method is synchronous and is called when all the child records data is ready.
     * Override the method if you need to preprocess or postprocess parent records aggregated data:
     *
     * ````javascript
     * class MyHistogramView extends TimelineHistogram({
     *
     *     aggregateHistogramData(recordsData, records, aggregationContext) {
     *         const result = super.aggregateHistogramData(recordsData, records, aggregationContext);
     *
     *         // postprocess averageSalary series values collected for a parent record
     *         result.forEach(entry => {
     *             entry.averageSalary = entry.averageSalary / records.length;
     *         });
     *
     *         return result;
     *     }
     *
     * });
     * ```
     *
     * @param {Object[]} recordsData Child records histogram data.
     * @param {Core.data.Model[]} records Child records.
     * @param {Object} aggregationContext An object containing current shared info on the current aggregation process
     */
    aggregateHistogramData(recordsData, records, aggregationContext = {}) {
      const me = this, { aggregateFunctions } = me;
      aggregationContext.recordsData = recordsData;
      aggregationContext.records = records;
      const arrays = recordsData.map((histogramData, index) => {
        return me.extractHistogramDataArray(
          histogramData,
          records[index]
        );
      });
      const result = ArrayHelper.aggregate(
        arrays,
        me.getDataEntryForAggregating || ((entry) => entry),
        me.internalAggregateDataEntry,
        me.internalInitAggregatedDataEntry,
        aggregationContext
      );
      for (const { id, aggregate = "sum" } of Object.values(me.series)) {
        const fn = aggregateFunctions[aggregate].finalize;
        if (fn && aggregate !== false) {
          fn(id, result, ...arguments);
        }
      }
      return result;
    }
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "TimelineHistogramGrouping"), //region Configs
  __publicField(_a, "configurable", {
    /**
     * When `true` the component will automatically calculate data for group records
     * based on the groups members data by calling {@link #function-getGroupRecordHistogramData} method.
     * @config {Boolean}
     * @category Parent histogram data collecting
     * @default
     */
    aggregateHistogramDataForGroups: true,
    /**
     * A function used for aggregating child records histogram data entries to their parent entry.
     *
     * It's called for each child entry and is meant to apply the child entry values to the
     * target parent entry (provided in `aggregated` parameter).
     * The function must return the resulting aggregated entry that will be passed as `aggregated`
     * parameter to the next __aggregating__ step.
     *
     * Should be provided as a function, or name of a function in the ownership hierarchy which may be called.
     *
     * @config {Function|String} aggregateDataEntry
     * @param {Object} aggregateDataEntry.aggregated Target parent data entry to aggregate the entry into.
     * @param {Object} aggregateDataEntry.entry Current entry to aggregate into `aggregated`.
     * @param {Number} aggregateDataEntry.arrayIndex Index of current array (index of the record among other records being aggregated).
     * @param {Object[]} aggregateDataEntry.entryIndex Index of `entry` in the current array.
     * @returns {Object} Return value becomes the value of the `aggregated` parameter on the next invocation of this function.
     * @category Parent histogram data collecting
     * @default
     */
    aggregateDataEntry: null,
    /**
     * Function that extracts a record histogram data entry for aggregating.
     * By default it returns the entry as is. Override the function if you need a more complex way
     * to retrieve the value for aggregating.
     *
     * Should be provided as a function, or name of a function in the ownership hierarchy which may be called.
     *
     * @config {Function|String} getDataEntryForAggregating
     * @param {Object} getDataEntryForAggregating.entry Current data entry.
     * @returns {Object} Entry to aggregate
     * @category Parent histogram data collecting
     * @default
     */
    getDataEntryForAggregating: null,
    /**
     * A function that initializes a target group record entry.
     *
     * Should be provided as a function, or name of a function in the ownership hierarchy which may be called.
     *
     * @config {Function|String} initAggregatedDataEntry
     * @returns {Object} Target aggregated entry
     * @category Parent histogram data collecting
     * @default
     */
    initAggregatedDataEntry: null,
    aggregateFunctions: {
      sum: {
        aliases: ["add"],
        entry(seriesId, acc, entry) {
          acc[seriesId] = (acc[seriesId] || 0) + entry[seriesId];
          return acc;
        }
      },
      min: {
        entry(seriesId, acc, entry) {
          const entryValue = entry[seriesId];
          if (entryValue < (acc[seriesId] || Number.MAX_VALUE))
            acc[seriesId] = entryValue;
          return acc;
        }
      },
      max: {
        entry(seriesId, acc, entry) {
          const entryValue = entry[seriesId];
          if (entryValue > (acc[seriesId] || Number.MIN_VALUE))
            acc[seriesId] = entryValue;
          return acc;
        }
      },
      count: {
        init(seriesId, entry, entryIndex, aggregationContext) {
          entry[seriesId] = aggregationContext.arrays.length;
        }
      },
      avg: {
        entry(seriesId, acc, entry) {
          acc[seriesId] = (acc[seriesId] || 0) + entry[seriesId];
          return acc;
        },
        finalize(seriesId, data, recordsData, records, aggregationContext) {
          const cnt = aggregationContext.arrays.length;
          data.forEach((entry) => entry[seriesId] /= cnt);
        }
      }
    }
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineHistogramScaleColumn.js
var TimelineHistogramScaleColumn_default = (Target) => {
  var _a;
  return _a = class extends Target {
    updateScalePoints(scalePoints) {
      const me = this, topScalePoint = scalePoints[scalePoints.length - 1];
      if (topScalePoint) {
        me.scaleUnit = topScalePoint.unit;
        me.histogramWidget.topValue = me.getTopValueByScalePoints(scalePoints);
      }
      if (me.scaleColumn) {
        me.scaleColumn.scalePoints = scalePoints;
      }
    }
    //endregion
    //region Columns
    changeColumns(columns, currentStore) {
      const me = this, scaleColumn = me.getConfig("scaleColumn");
      if (columns && scaleColumn) {
        const isArray = Array.isArray(columns);
        let cols = columns;
        if (!isArray) {
          cols = columns.data;
        }
        let scaleColumnIndex = cols == null ? void 0 : cols.length, scaleColumnConfig = scaleColumn;
        cols.some((col, index) => {
          if (col.type === "scale") {
            scaleColumnIndex = index;
            scaleColumnConfig = ObjectHelper.assign(col, scaleColumnConfig);
            return true;
          }
        });
        cols = cols.slice();
        cols[scaleColumnIndex] = {
          type: "scale",
          ...scaleColumnConfig
        };
        if (isArray) {
          columns = cols;
        } else {
          columns.data = cols;
        }
      }
      return super.changeColumns(columns, currentStore);
    }
    updateColumns(columns, was) {
      super.updateColumns(columns, was);
      if (columns) {
        this._scaleColumn = this.columns.find((c) => c.isScaleColumn);
      }
    }
    onColumnsChanged({ action, changes, record: column, records }) {
      const { scaleColumn, columns } = this;
      if (scaleColumn && (action === "dataset" || action === "batch") && !columns.includes(scaleColumn)) {
        columns.add(scaleColumn, true);
      }
      super.onColumnsChanged(...arguments);
    }
    //endregion
    //region Data processing
    /**
     * A hook to convert scale point values to histogram ones.
     * In case they use different units.
     *
     * Override this method in a sub-class to implement your custom
     * application specific conversion.
     * @param {Number} value Scale point value
     * @param {String} unit Scale point unit
     * @internal
     */
    convertUnitsToHistogramValue(value, unit) {
      return value;
    }
    /**
     * A hook to convert histogram values to scale point ones.
     * In case they use different units.
     *
     * Override this method in a sub-class to implement your custom
     * application specific conversion.
     * @param {Number} value Scale point value
     * @param {String} unit Scale point unit
     * @internal
     */
    convertHistogramValueToUnits(value, unit) {
      return value;
    }
    extractHistogramDataArray(histogramData, record) {
      return histogramData;
    }
    getTopValueByScalePoints(scalePoints) {
      const me = this, { scaleColumn } = me, lastPoint = scalePoints[scalePoints.length - 1], { value, unit } = lastPoint;
      let rawValue = value;
      if (scaleColumn) {
        rawValue *= 1 + (scaleColumn.scaleWidget.scaleMaxPadding || 0);
      }
      return me.convertUnitsToHistogramValue(rawValue, unit || me.scaleUnit);
    }
    processRecordRenderData(renderData) {
      var _a2;
      renderData = super.processRecordRenderData(...arguments);
      if (this.scaleColumn) {
        const me = this, { record, histogramData, histogramConfig = {} } = renderData;
        let topValue = (_a2 = me.initialConfig.histogramWidget) == null ? void 0 : _a2.topValue, scalePoints = me.scalePoints || record.get(me.scalePointsModelField);
        if (!topValue) {
          if (scalePoints && me.calculateTopValueByScalePoints) {
            topValue = me.getTopValueByScalePoints(scalePoints);
          }
          if (!topValue && histogramData) {
            const histogramWidget = renderData.histogramWidget || me.histogramWidget;
            ObjectHelper.assign(histogramWidget, histogramConfig);
            topValue = histogramWidget.getDataTopValue(histogramData);
            scalePoints = [{
              value: me.convertHistogramValueToUnits(topValue, me.scaleUnit),
              text: me.convertHistogramValueToUnits(topValue, me.scaleUnit)
            }];
            topValue += me.scaleColumn.scaleWidget.scaleMaxPadding * topValue;
          }
          renderData.scaleWidgetConfig = { scalePoints };
          renderData.histogramConfig = { ...histogramConfig, topValue };
        }
      }
      return renderData;
    }
    //endregion
    //region Render
    /**
     * Group feature hook triggered by the feature to render group headers
     * @param {Object} renderData
     * @internal
     */
    buildGroupHeader(renderData) {
      if (renderData.column === this.scaleColumn) {
        return this.scaleColumn.renderer(renderData);
      }
      return super.buildGroupHeader(...arguments);
    }
    beforeRenderCell(renderData) {
      if (this.scaleColumn && renderData.column === this.scaleColumn) {
        renderData.histogramData = this.getRecordHistogramData(renderData.record);
        if (!ObjectHelper.isPromise(renderData.histogramData)) {
          Object.assign(renderData, this._recordRenderData);
        }
      }
      return super.beforeRenderCell(...arguments);
    }
    /**
     * Renders record scale column content.
     * @param {Core.data.Model} record Record to render scale for
     * @param {Object} [renderData]
     * @category Scale column
     */
    renderRecordScale(record, renderData) {
      if (this.scaleColumn) {
        const row = this.getRowFor(record), cellElement = row == null ? void 0 : row.getCell(this.scaleColumn.id);
        if (cellElement) {
          row.renderCell(cellElement);
        }
      }
    }
    get widgetClass() {
    }
    //endregion
  }, __publicField(_a, "$name", "TimelineHistogramScaleColumn"), //region Config
  __publicField(_a, "configurable", {
    /**
     * The locked grid scale column reference.
     * @member {Scheduler.column.ScaleColumn} scaleColumn
     * @readonly
     * @category Scale column
     */
    /**
     * An object with configuration for the {@link Scheduler/column/ScaleColumn}.
     *
     * Example:
     *
     * ```javascript
     * new TimelineHistogram({
     *     scaleColumn : {
     *         width : 50
     *     },
     *     ...
     * });
     * ```
     *
     * Provide `null` to the config to get rid of the column completely:
     *
     * ```javascript
     * new TimelineHistogram({
     *     // do not add scale column
     *     scaleColumn : null,
     *     ...
     * });
     * ```
     *
     * @config {Object} scaleColumn
     * @category Scale column
     */
    scaleColumn: {},
    scalePoints: null,
    scalePointsModelField: "scalePoints",
    calculateTopValueByScalePoints: true
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/TimelineHistogram.js
var TimelineHistogram = class extends TimelineHistogramBase.mixin(
  TimelineHistogramGrouping_default,
  TimelineHistogramScaleColumn_default
) {
  /**
   * Retrieves the histogram data for the provided record.
   *
   * The method first checks if there is cached data for the record and returns it if found.
   * Otherwise it starts collecting data by calling {@link #config-getRecordData} (if provided)
   * or by reading it from the {@link #config-dataModelField} record field.
   *
   * If the provided record represents a group and {@link #config-aggregateHistogramDataForGroups} is enabled
   * then the group members data is calculated with a {@link #function-getGroupRecordHistogramData} method call.
   *
   * The method can be asynchronous depending on the provided {@link #config-getRecordData} function.
   * If the function returns a `Promise` then the method will return a wrapping `Promise` in turn that will
   * resolve with the collected histogram data.
   *
   * The method triggers the {@link #event-histogramDataCacheSet} event when a record data is ready.
   *
   * @param {Core.data.Model} record Record to retrieve the histogram data for.
   * @param {Object} [aggregationContext] An optional object passed when the method is called when aggregating
   * a group members histogram data.
   *
   * See {@link #function-getGroupRecordHistogramData} and {@link Core/helper/ArrayHelper#function-aggregate-static}
   * for more details.
   * @returns {Object|Promise} The histogram data for the provided record or a `Promise` that will provide the data
   * when resolved.
   * @function getRecordHistogramData
   */
};
//region Config
__publicField(TimelineHistogram, "$name", "TimelineHistogram");
__publicField(TimelineHistogram, "type", "timelinehistogram");
TimelineHistogram.initClass();
TimelineHistogram._$name = "TimelineHistogram";

export {
  ScaleColumn,
  ResourceTimeRangesBase,
  DependencyEdit,
  ScheduleContext,
  EventCopyPaste,
  EventDrag,
  EventDragCreate,
  EventTooltip,
  StickyEvents,
  TimeRanges,
  DelayedRecordsRendering_default,
  TimelineHistogramBase,
  TimelineHistogramGrouping_default,
  TimelineHistogramScaleColumn_default,
  TimelineHistogram
};
//# sourceMappingURL=chunk-PS7L43WJ.js.map
