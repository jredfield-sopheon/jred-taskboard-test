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
  NumberColumn
} from "./chunk-U2MM24JY.js";
import {
  AttachToProjectMixin_default,
  ClockTemplate,
  TaskEditStm_default
} from "./chunk-MS4QMERY.js";
import {
  ColumnStore,
  GridFeatureManager,
  HeaderMenu
} from "./chunk-GGOYEX2W.js";
import {
  DragHelper,
  ResizeHelper
} from "./chunk-6ZLMCHE5.js";
import {
  DependencyBaseModel,
  DependencyModel,
  TimeSpan
} from "./chunk-KVD75ID2.js";
import {
  Draggable_default,
  Droppable_default
} from "./chunk-4LHHPUQ6.js";
import {
  ArrayHelper,
  Base,
  BrowserHelper,
  DateHelper,
  Delayable_default,
  DomHelper,
  DomSync,
  Duration,
  EventHelper,
  IdHelper,
  InstancePlugin,
  ObjectHelper,
  Objects,
  Rectangle,
  StringHelper,
  Tooltip,
  VersionHelper,
  WalkHelper,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/column/DurationColumn.js
var DurationColumn = class extends NumberColumn {
  constructor() {
    super(...arguments);
    __publicField(this, "compositeField", true);
  }
  //region Config
  static get $name() {
    return "DurationColumn";
  }
  static get type() {
    return "duration";
  }
  static get isGanttColumn() {
    return true;
  }
  static get fields() {
    return [
      /**
       * Precision of displayed duration, defaults to use {@link Scheduler.view.Scheduler#config-durationDisplayPrecision}.
       * Specify an integer value to override that setting, or `false` to use raw value
       * @config {Number|Boolean} decimalPrecision
       */
      { name: "decimalPrecision", defaultValue: 1 }
    ];
  }
  static get defaults() {
    return {
      /**
       * Min value
       * @config {Number}
       */
      min: null,
      /**
       * Max value
       * @config {Number}
       */
      max: null,
      /**
       * Step size for spin button clicks.
       * @member {Number} step
       */
      /**
       * Step size for spin button clicks. Also used when pressing up/down keys in the field.
       * @config {Number}
       * @default
       */
      step: 1,
      /**
       * Large step size, defaults to 10 * `step`. Applied when pressing SHIFT and stepping either by click or
       * using keyboard.
       * @config {Number}
       * @default 10
       */
      largeStep: 0,
      field: "fullDuration",
      text: "L{Duration}",
      instantUpdate: true,
      // Undocumented, used by Filter feature to get type of the filter field
      filterType: "duration",
      sortable(durationEntity1, durationEntity2) {
        const ms1 = durationEntity1.getValue(this.field), ms2 = durationEntity2.getValue(this.field);
        return ms1 - ms2;
      }
    };
  }
  construct() {
    super.construct(...arguments);
    const sortFn = this.sortable;
    this.sortable = (...args) => sortFn.call(this, ...args);
  }
  get defaultEditor() {
    const { max, min, step, largeStep } = this;
    return ObjectHelper.cleanupProperties({
      type: "duration",
      name: this.field,
      max,
      min,
      step,
      largeStep
    });
  }
  //endregion
  //region Internal
  get durationUnitField() {
    return `${this.field}Unit`;
  }
  roundValue(duration) {
    const nbrDecimals = typeof this.grid.durationDisplayPrecision === "number" ? this.grid.durationDisplayPrecision : this.decimalPrecision, multiplier = Math.pow(10, nbrDecimals), rounded = Math.round(duration * multiplier) / multiplier;
    return rounded;
  }
  formatValue(duration, durationUnit) {
    if (duration instanceof Duration) {
      durationUnit = duration.unit;
      duration = duration.magnitude;
    }
    duration = this.roundValue(duration);
    return duration + " " + DateHelper.getLocalizedNameOfUnit(durationUnit, duration !== 1);
  }
  //endregion
  //region Render
  defaultRenderer({ value, record, isExport }) {
    const type = typeof value, durationValue = type === "number" ? value : value == null ? void 0 : value.magnitude, durationUnit = type === "number" ? record.getValue(this.durationUnitField) : value == null ? void 0 : value.unit;
    if (typeof durationValue !== "number") {
      return isExport ? "" : null;
    }
    return this.formatValue(durationValue, durationUnit);
  }
  //endregion
  // Used with CellCopyPaste as fullDuration doesn't work via record.get
  toClipboardString({ record }) {
    return record.getValue(this.field).toString();
  }
  fromClipboardString({ string, record }) {
    const duration = DateHelper.parseDuration(string, true, this.durationUnit);
    if (duration && "magnitude" in duration) {
      return duration;
    }
    return record.fullDuration;
  }
  calculateFillValue({ value, record }) {
    return this.fromClipboardString({ string: value, record });
  }
};
ColumnStore.registerColumnType(DurationColumn);
DurationColumn._$name = "DurationColumn";

// ../Scheduler/lib/Scheduler/feature/base/DragBase.js
var DragBase = class extends InstancePlugin {
  //region Config
  static get defaultConfig() {
    return {
      // documented on Schedulers EventDrag feature and Gantt's TaskDrag
      tooltipTemplate: (data) => `
                <div class="b-sch-tip-${data.valid ? "valid" : "invalid"}">
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                    <div class="b-sch-tip-message">${data.message}</div>
                </div>
            `,
      /**
       * Specifies whether or not to show tooltip while dragging event
       * @prp {Boolean}
       * @default
       */
      showTooltip: true,
      /**
       * When enabled, the event being dragged always "snaps" to the exact start date that it will have after drop.
       * @config {Boolean}
       * @default
       */
      showExactDropPosition: false,
      /*
       * The store from which the dragged items are mapped to the UI.
       * In Scheduler's implementation of this base class, this will be
       * an EventStore, in Gantt's implementations, this will be a TaskStore.
       * Because both derive from this base, we must refer to it as this.store.
       * @private
       */
      store: null,
      /**
       * An object used to configure the internal {@link Core.helper.DragHelper} class
       * @config {DragHelperConfig}
       */
      dragHelperConfig: null,
      tooltipCls: "b-eventdrag-tooltip"
    };
  }
  static get configurable() {
    return {
      /**
       * Set to `false` to allow dragging tasks outside the client Scheduler.
       * Useful when you want to drag tasks between multiple Scheduler instances
       * @config {Boolean}
       * @default
       */
      constrainDragToTimeline: true,
      // documented on Schedulers EventDrag feature, not used for Gantt
      constrainDragToResource: true,
      constrainDragToTimeSlot: false,
      /**
       * Yields the {@link Core.widget.Tooltip} which tracks the event during a drag operation.
       * @member {Core.widget.Tooltip} tip
       */
      /**
       * A config object to allow customization of the {@link Core.widget.Tooltip} which tracks
       * the event during a drag operation.
       * @config {TooltipConfig}
       */
      tip: {
        $config: ["lazy", "nullify"],
        value: {
          align: {
            align: "b-t",
            allowTargetOut: true
          },
          autoShow: true,
          updateContentOnMouseMove: true
        }
      },
      /**
       * The `eventDrag`and `taskDrag` events are normally only triggered when the drag operation will lead to a
       * change in date or assignment. By setting this config to `false`, that logic is bypassed to trigger events
       * for each native mouse move event.
       * @prp {Boolean}
       */
      throttleDragEvent: true
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["onInternalPaint"]
    };
  }
  //endregion
  //region Init
  internalSnapToPosition(snapTo) {
    var _a;
    const { dragData } = this;
    (_a = this.snapToPosition) == null ? void 0 : _a.call(this, {
      assignmentRecord: dragData.assignmentRecord,
      eventRecord: dragData.eventRecord,
      resourceRecord: dragData.newResource || dragData.resourceRecord,
      startDate: dragData.startDate,
      endDate: dragData.endDate,
      snapTo
    });
  }
  buildDragHelperConfig() {
    const me = this, {
      client,
      constrainDragToTimeline,
      constrainDragToResource,
      constrainDragToTimeSlot,
      dragHelperConfig = {}
    } = me, { timeAxisViewModel, isHorizontal } = client, lockY = isHorizontal ? constrainDragToResource : constrainDragToTimeSlot, lockX = isHorizontal ? constrainDragToTimeSlot : constrainDragToResource;
    if (me.externalDropTargetSelector) {
      dragHelperConfig.dropTargetSelector = `.b-timeaxissubgrid,${me.externalDropTargetSelector}`;
    }
    return Objects.merge({
      name: me.constructor.name,
      // useful when debugging with multiple draggers
      positioning: "absolute",
      lockX,
      lockY,
      minX: true,
      // Allows dropping with start before time axis
      maxX: true,
      // Allows dropping with end after time axis
      constrain: false,
      cloneTarget: !constrainDragToTimeline,
      // If we clone event dragged bars, we assume ownership upon drop so we can reuse the element and have animations
      removeProxyAfterDrop: false,
      dragWithin: constrainDragToTimeline ? null : document.body,
      hideOriginalElement: true,
      dropTargetSelector: ".b-timelinebase",
      // A CSS class added to drop target while dragging events
      dropTargetCls: me.externalDropTargetSelector ? "b-drop-target" : "",
      outerElement: client.timeAxisSubGridElement,
      targetSelector: client.eventSelector,
      scrollManager: constrainDragToTimeline ? client.scrollManager : null,
      createProxy: (el) => me.createProxy(el),
      snapCoordinates: ({ element, newX, newY }) => {
        const { dragData } = me, timeline = this.currentOverClient;
        if (me.constrainDragToTimeline && !me.constrainDragToTimeSlot && (me.showExactDropPosition || timeAxisViewModel.snap)) {
          const draggedEventRecord = dragData.draggedEntities[0].event || dragData.draggedEntities[0], coordinate = me.getCoordinate(draggedEventRecord, element, [newX, newY]), snappedDate = timeline.fillTicks && client.timeAxis.isContinuous ? dragData.startDate : timeAxisViewModel.getDateFromPosition(coordinate, "round"), { calendar } = draggedEventRecord;
          if (!calendar || snappedDate && calendar.isWorkingTime(snappedDate, DateHelper.add(snappedDate, draggedEventRecord.fullDuration))) {
            const snappedPosition = snappedDate && timeAxisViewModel.getPositionFromDate(snappedDate);
            if (snappedDate && snappedDate >= client.startDate && snappedPosition != null) {
              if (isHorizontal) {
                newX = snappedPosition;
              } else {
                newY = snappedPosition;
              }
            }
          }
        }
        const snapTo = { x: newX, y: newY };
        me.internalSnapToPosition(snapTo);
        return snapTo;
      },
      internalListeners: {
        beforedragstart: "onBeforeDragStart",
        dragstart: "onDragStart",
        afterdragstart: "onAfterDragStart",
        drag: "onDrag",
        drop: "onDrop",
        abort: "onDragAbort",
        abortFinalized: "onDragAbortFinalized",
        reset: "onDragReset",
        thisObj: me
      }
    }, dragHelperConfig, {
      isElementDraggable: (el, event) => {
        return (!dragHelperConfig || !dragHelperConfig.isElementDraggable || dragHelperConfig.isElementDraggable(el, event)) && me.isElementDraggable(el, event);
      }
    });
  }
  /**
   * Called when scheduler is rendered. Sets up drag and drop and hover tooltip.
   * @private
   */
  onInternalPaint({ firstPaint }) {
    var _a;
    const me = this, { client } = me;
    (_a = me.drag) == null ? void 0 : _a.destroy();
    me.drag = DragHelper.new(me.buildDragHelperConfig());
    if (firstPaint) {
      client.rowManager.ion({
        changeTotalHeight: () => {
          var _a2;
          return me.updateYConstraint((_a2 = me.dragData) == null ? void 0 : _a2[`${client.scheduledEventName}Record`]);
        },
        thisObj: me
      });
    }
    if (me.showTooltip) {
      me.clockTemplate = new ClockTemplate({
        scheduler: client
      });
    }
  }
  doDestroy() {
    var _a, _b, _c;
    (_a = this.drag) == null ? void 0 : _a.destroy();
    (_b = this.clockTemplate) == null ? void 0 : _b.destroy();
    (_c = this.tip) == null ? void 0 : _c.destroy();
    super.doDestroy();
  }
  get tipId() {
    return `${this.client.id}-event-drag-tip`;
  }
  changeTip(tip, oldTip) {
    const me = this;
    if (tip) {
      const result = Tooltip.reconfigure(oldTip, Tooltip.mergeConfigs({
        forElement: me.element,
        id: me.tipId,
        getHtml: me.getTipHtml.bind(me),
        cls: me.tooltipCls,
        owner: me.client
      }, tip), {
        owner: me.client,
        defaults: {
          type: "tooltip"
        }
      });
      result.ion({ innerHtmlUpdate: "updateDateIndicator", thisObj: me });
      return result;
    } else {
      oldTip == null ? void 0 : oldTip.destroy();
    }
  }
  //endregion
  //region Drag events
  createProxy(element) {
    const proxy = element.cloneNode(true);
    delete proxy.id;
    proxy.classList.add(`b-sch-${this.client.mode}`);
    return proxy;
  }
  onBeforeDragStart({ context, event }) {
    var _a;
    const me = this, { client } = me, dragData = me.getMinimalDragData(context, event), eventRecord = dragData == null ? void 0 : dragData[`${client.scheduledEventName}Record`], resourceRecord = dragData.resourceRecord;
    if (client.readOnly || me.disabled || !eventRecord || eventRecord.isDraggable === false || eventRecord.readOnly || (resourceRecord == null ? void 0 : resourceRecord.readOnly)) {
      return false;
    }
    context.pointerStartDate = client.getDateFromXY([context.startClientX, context.startPageY], null, false);
    const result = me.triggerBeforeEventDrag(
      `before${client.capitalizedEventName}Drag`,
      {
        ...dragData,
        event,
        // to be deprecated
        context: {
          ...context,
          ...dragData
        }
      }
    ) !== false;
    if (result) {
      me.updateYConstraint(eventRecord, resourceRecord);
      (_a = client[`before${client.capitalizedEventName}DragStart`]) == null ? void 0 : _a.call(client, context, dragData);
    }
    return result;
  }
  onAfterDragStart({ context, event }) {
  }
  /**
   * Returns true if a drag operation is active
   * @property {Boolean}
   * @readonly
   */
  get isDragging() {
    var _a;
    return (_a = this.drag) == null ? void 0 : _a.isDragging;
  }
  // Checked by dependencies to determine if live redrawing is needed
  get isActivelyDragging() {
    return this.isDragging && !this.finalizing;
  }
  /**
   * Triggered when dragging of an event starts. Initializes drag data associated with the event being dragged.
   * @private
   */
  onDragStart({ context, event }) {
    var _a, _b, _c;
    const me = this, client = (_a = me.findClientFromTarget(event, context)) != null ? _a : me.client;
    me.currentOverClient = client;
    me.drag.unifiedProxy = me.unifiedDrag;
    me.onMouseOverNewTimeline(client, true);
    const dragData = me.dragData = me.getDragData(context);
    me.suspendElementRedrawing(context.element);
    if (me.showTooltip && me.tip) {
      const tipTarget = dragData.context.dragProxy ? dragData.context.dragProxy.firstChild : context.element;
      me.tip.showBy(tipTarget);
    }
    me.triggerDragStart(dragData);
    (_b = client[`after${client.capitalizedEventName}DragStart`]) == null ? void 0 : _b.call(client, context, dragData);
    const {
      eventMenu,
      taskMenu
    } = client.features, menuFeature = eventMenu || taskMenu;
    (_c = menuFeature == null ? void 0 : menuFeature.hideContextMenu) == null ? void 0 : _c.call(menuFeature, false);
  }
  updateDateIndicator() {
    const { startDate, endDate } = this.dragData, { tip, clockTemplate } = this, endDateElement = tip.element.querySelector(".b-sch-tooltip-enddate");
    clockTemplate.updateDateIndicator(tip.element, startDate);
    endDateElement && clockTemplate.updateDateIndicator(endDateElement, endDate);
  }
  findClientFromTarget(event, context) {
    let { target } = event;
    if (/^touch/.test(event.type)) {
      const center = Rectangle.from(context.element, null, true).center;
      target = DomHelper.elementFromPoint(center.x, center.y);
    }
    const client = Widget.fromElement(target, "timelinebase");
    return (client == null ? void 0 : client.isResourceHistogram) ? null : client;
  }
  /**
   * Triggered while dragging an event. Updates drag data, validation etc.
   * @private
   */
  onDrag({ context, event }) {
    const me = this, dd = me.dragData, start = dd.startDate;
    let client;
    if (me.constrainDragToTimeline) {
      client = me.client;
    } else {
      client = me.findClientFromTarget(event, dd.context);
    }
    me.updateDragContext(context, event);
    if (!client) {
      return;
    }
    if (client !== me.currentOverClient) {
      me.onMouseOverNewTimeline(client);
    }
    if (dd.dirty || !me.throttleDragEvent) {
      const valid = dd.valid;
      me.triggerEventDrag(dd, start);
      if (valid !== dd.valid) {
        dd.context.valid = dd.externalDragValidity = dd.valid;
      }
    }
    if (me.showTooltip && me.tip) {
      me.tip.lastAlignSpec.allowTargetOut = !dd.valid;
      me.tip.realign();
    }
  }
  onMouseOverNewTimeline(newTimeline, initial) {
    const me = this, { drag: { lockX, lockY } } = me, scrollables = [];
    me.currentOverClient.element.classList.remove("b-dragging-" + me.currentOverClient.scheduledEventName);
    newTimeline.element.classList.add("b-dragging-" + newTimeline.scheduledEventName);
    if (!initial) {
      me.currentOverClient.scrollManager.stopMonitoring();
    }
    if (!lockX) {
      scrollables.push({
        element: newTimeline.timeAxisSubGrid.scrollable.element,
        direction: "horizontal"
      });
    }
    if (!lockY) {
      scrollables.push({
        element: newTimeline.scrollable.element,
        direction: "vertical"
      });
    }
    newTimeline.scrollManager.startMonitoring({
      scrollables,
      callback: me.drag.onScrollManagerScrollCallback
    });
    me.currentOverClient = newTimeline;
  }
  triggerBeforeEventDropFinalize(eventType, eventData, client) {
    client.trigger(eventType, eventData);
  }
  /**
   * Triggered when dropping an event. Finalizes the operation.
   * @private
   */
  onDrop({ context, event }) {
    var _a;
    const me = this, { currentOverClient, dragData } = me;
    let modified = false;
    currentOverClient == null ? void 0 : currentOverClient.scrollManager.stopMonitoring();
    (_a = me.tip) == null ? void 0 : _a.hide();
    context.valid = context.valid && me.isValidDrop(dragData);
    me.drag.removeProxyAfterDrop = Boolean(dragData.externalDropTarget);
    if (context.valid && dragData.startDate && dragData.endDate) {
      let beforeDropTriggered = false;
      dragData.finalize = async (valid) => {
        if (beforeDropTriggered || dragData.async) {
          await me.finalize(valid);
        } else {
          context.valid = context.valid && valid;
        }
      };
      me.triggerBeforeEventDropFinalize(`before${currentOverClient.capitalizedEventName}DropFinalize`, {
        context: dragData,
        domEvent: event
      }, currentOverClient);
      beforeDropTriggered = true;
      context.async = dragData.async;
      if (!context.async && !dragData.externalDropTarget) {
        modified = dragData.startDate - dragData.origStart !== 0 || dragData.newResource !== dragData.resourceRecord;
      }
    }
    if (!context.async) {
      me.finalize(dragData.valid && context.valid && modified);
    }
  }
  onDragAbort({ context }) {
    var _a, _b;
    const me = this;
    me.isAborting = true;
    (_a = me.currentOverClient) == null ? void 0 : _a.scrollManager.stopMonitoring();
    me.client.currentOrientation.onDragAbort({ context, dragData: me.dragData });
    me.resetDraggedElements();
    (_b = me.tip) == null ? void 0 : _b.hide();
    me.triggerDragAbort(me.dragData);
  }
  // Fired after any abort animation has completed (the point where we want to trigger redraw of progress lines etc)
  onDragAbortFinalized({ context }) {
    var _a, _b;
    const me = this;
    me.triggerDragAbortFinalized(me.dragData);
    (_b = (_a = me.client)[`after${me.client.capitalizedEventName}DragAbortFinalized`]) == null ? void 0 : _b.call(_a, context, me.dragData);
    me.isAborting = false;
  }
  // For the drag across multiple schedulers, tell all involved scroll managers to stop monitoring
  onDragReset({ source: dragHelper }) {
    var _a;
    const me = this, currentTimeline = me.currentOverClient;
    if ((_a = dragHelper.context) == null ? void 0 : _a.started) {
      me.resetDraggedElements();
      currentTimeline.trigger(`${currentTimeline.scheduledEventName}DragReset`);
    }
    currentTimeline == null ? void 0 : currentTimeline.element.classList.remove(`b-dragging-${currentTimeline.scheduledEventName}`);
    me.dragData = null;
  }
  resetDraggedElements() {
    const { dragData } = this, { eventBarEls, draggedEntities } = dragData;
    this.resumeRecordElementRedrawing(dragData.record);
    draggedEntities.forEach((record, i) => {
      this.resumeRecordElementRedrawing(record);
      eventBarEls[i].classList.remove(this.drag.draggingCls);
      eventBarEls[i].retainElement = false;
    });
    dragData.context.element.retainElement = false;
  }
  /**
   * Triggered internally on invalid drop.
   * @private
   */
  onInternalInvalidDrop(abort) {
    var _a;
    const me = this, { context } = me.drag;
    (_a = me.tip) == null ? void 0 : _a.hide();
    me.triggerAfterDrop(me.dragData, false);
    context.valid = false;
    if (abort) {
      me.drag.abort();
    }
  }
  //endregion
  //region Finalization & validation
  /**
   * Called on drop to update the record of the event being dropped.
   * @private
   * @param {Boolean} updateRecords Specify true to update the record, false to treat as invalid
   */
  async finalize(updateRecords) {
    const me = this, { dragData, currentOverClient } = me, clientEventTipFeature = currentOverClient.features.taskTooltip || currentOverClient.features.eventTooltip;
    if (!dragData || me.finalizing) {
      return;
    }
    const { context, draggedEntities, externalDropTarget } = dragData;
    let result;
    me.finalizing = true;
    draggedEntities.forEach((record, i) => {
      me.resumeRecordElementRedrawing(record);
      dragData.eventBarEls[i].classList.remove(me.drag.draggingCls);
      dragData.eventBarEls[i].retainElement = false;
    });
    context.element.retainElement = false;
    if (externalDropTarget && dragData.valid || updateRecords) {
      result = me.updateRecords(dragData);
      if (!externalDropTarget && Objects.isPromise(result)) {
        context.async = true;
        await result;
      }
      if (!dragData.valid) {
        me.onInternalInvalidDrop(true);
      } else {
        if (context.async) {
          context.finalize();
        }
        if (externalDropTarget) {
          me.client.refreshRows(false);
        }
        me.triggerAfterDrop(dragData, true);
      }
    } else {
      me.onInternalInvalidDrop(context.async || dragData.async);
    }
    me.finalizing = false;
    if (clientEventTipFeature == null ? void 0 : clientEventTipFeature.enabled) {
      clientEventTipFeature.disabled = true;
      currentOverClient.setTimeout(() => {
        clientEventTipFeature.disabled = false;
      }, 200);
    }
    return result;
  }
  //endregion
  //region Drag data
  getEventNewStartEndDates(eventRecord, timeDiff) {
    let startDate = this.adjustStartDate(eventRecord.startDate, timeDiff);
    let endDate;
    if (eventRecord.graph) {
      startDate = eventRecord.run("skipNonWorkingTime", startDate);
      endDate = eventRecord.run("calculateProjectedXDateWithDuration", startDate, true, eventRecord.duration);
    } else {
      endDate = DateHelper.add(startDate, eventRecord.fullDuration);
    }
    return { startDate, endDate };
  }
  /**
   * Updates drag data's dates and validity (calls #validatorFn if specified)
   * @private
   */
  updateDragContext(info, event) {
    var _a, _b, _c;
    const me = this, { drag } = me, dd = me.dragData, client = me.currentOverClient, { isHorizontal } = client, [record] = dd.draggedEntities, eventRecord = record.isAssignment ? record.event : record, lastDragStartDate = dd.startDate, constrainToTimeSlot = me.constrainDragToTimeSlot || (isHorizontal ? drag.lockX : drag.lockY);
    dd.browserEvent = event;
    Object.assign(dd, me.getProductDragContext(dd));
    if (constrainToTimeSlot) {
      dd.timeDiff = 0;
    } else {
      let timeDiff;
      if (client.timeAxis.isContinuous || dd.startsOutsideView && dd.endsOutsideView) {
        const timeAxisPosition = client.isHorizontal ? (_a = info.pageX) != null ? _a : info.startPageX : (_b = info.pageY) != null ? _b : info.startPageY, pointerDate = client.getDateFromCoordinate(timeAxisPosition, null, false, true);
        timeDiff = dd.timeDiff = pointerDate - info.pointerStartDate;
        if (timeDiff !== null) {
          Object.assign(dd, me.getEventNewStartEndDates(eventRecord, timeDiff));
          if (dd.valid) {
            dd.timeDiff = dd.startDate - dd.origStart;
          }
        }
      } else {
        const range = me.resolveStartEndDates(info.element);
        dd.valid = Boolean(range.startDate && range.endDate);
        if (dd.valid) {
          timeDiff = range.startDate - dd.origStart;
        }
        if (timeDiff !== void 0) {
          if (eventRecord.graph) {
            dd.startDate = eventRecord.run("skipNonWorkingTime", range.startDate);
            dd.endDate = eventRecord.run("calculateProjectedXDateWithDuration", range.startDate, true, eventRecord.duration);
          } else {
            dd.startDate = range.startDate;
            dd.endDatee = range.endDate;
          }
        }
        dd.timeDiff = timeDiff;
      }
    }
    const positionDirty = dd.dirty = dd.dirty || lastDragStartDate - dd.startDate !== 0;
    if (dd.valid) {
      if (me.constrainDragToTimeline && (dd.endDate <= client.timeAxis.startDate || dd.startDate >= client.timeAxis.endDate)) {
        dd.valid = false;
        dd.context.message = me.L("L{EventDrag.noDropOutsideTimeline}");
      } else if (positionDirty || dd.externalDropTarget) {
        const result = dd.externalDragValidity = !event || info.pageX && me.checkDragValidity(dd, event);
        if (!result || typeof result === "boolean") {
          dd.valid = result !== false;
          dd.context.message = "";
        } else {
          dd.valid = result.valid !== false;
          dd.context.message = result.message;
        }
      } else {
        dd.valid = dd.externalDragValidity !== false && ((_c = dd.externalDragValidity) == null ? void 0 : _c.valid) !== false;
      }
    } else {
      dd.valid = false;
    }
    dd.context.valid = dd.valid;
  }
  suspendRecordElementRedrawing(record, suspend = true) {
    this.suspendElementRedrawing(this.getRecordElement(record), suspend);
    record.instanceMeta(this.client).retainElement = suspend;
  }
  resumeRecordElementRedrawing(record) {
    this.suspendRecordElementRedrawing(record, false);
  }
  suspendElementRedrawing(element, suspend = true) {
    if (element) {
      element.retainElement = suspend;
    }
  }
  resumeElementRedrawing(element) {
    this.suspendElementRedrawing(element, false);
  }
  /**
   * Initializes drag data (dates, constraints, dragged events etc). Called when drag starts.
   * @private
   * @param info
   * @returns {*}
   */
  getDragData(info) {
    const me = this, { client, drag } = me, productDragData = me.setupProductDragData(info), {
      record,
      eventBarEls,
      draggedEntities
    } = productDragData, { startEvent } = drag, timespan = record.isAssignment ? record.event : record, origStart = timespan.startDate, origEnd = timespan.endDate, timeAxis = client.timeAxis, startsOutsideView = origStart < timeAxis.startDate, endsOutsideView = origEnd > timeAxis.endDate, multiSelect = client.isSchedulerBase ? client.multiEventSelect : client.selectionMode.multiSelect, coordinate = me.getCoordinate(timespan, info.element, [info.elementStartX, info.elementStartY]), clientCoordinate = me.getCoordinate(timespan, info.element, [info.startClientX, info.startClientY]);
    me.suspendRecordElementRedrawing(record);
    draggedEntities.forEach((record2) => me.suspendRecordElementRedrawing(record2));
    if (record.isAssignment) {
      client.selectAssignment(record, startEvent.ctrlKey && multiSelect);
    } else {
      client.selectEvent(record, startEvent.ctrlKey && multiSelect);
    }
    const dragData = {
      context: info,
      ...productDragData,
      sourceDate: startsOutsideView ? origStart : client.getDateFromCoordinate(coordinate),
      screenSourceDate: client.getDateFromCoordinate(clientCoordinate, null, false),
      startDate: origStart,
      endDate: origEnd,
      timeDiff: 0,
      origStart,
      origEnd,
      startsOutsideView,
      endsOutsideView,
      duration: origEnd - origStart,
      browserEvent: startEvent
      // So we can know if SHIFT/CTRL was pressed
    };
    eventBarEls.forEach((el) => el.classList.remove("b-sch-event-hover", "b-active"));
    if (eventBarEls.length > 1) {
      info.relatedElements = eventBarEls.slice(1);
    }
    return dragData;
  }
  //endregion
  //region Constraints
  // private
  setupConstraints(constrainRegion, elRegion, tickSize, constrained) {
    const me = this, xTickSize = !me.showExactDropPosition && tickSize > 1 ? tickSize : 0, yTickSize = 0;
    if (constrained) {
      me.setXConstraint(constrainRegion.left, constrainRegion.right - elRegion.width, xTickSize);
    } else {
      me.setXConstraint(true, true, xTickSize);
    }
    me.setYConstraint(constrainRegion.top, constrainRegion.bottom - elRegion.height, yTickSize);
  }
  updateYConstraint(eventRecord, resourceRecord) {
    const me = this, { client } = me, { context } = me.drag, tickSize = client.timeAxisViewModel.snapPixelAmount;
    if (context && !me.drag.lockY) {
      let constrainRegion;
      if (me.constrainDragToTimeline) {
        constrainRegion = client.getScheduleRegion(resourceRecord, eventRecord);
      } else {
        me.setYConstraint(null, null, tickSize);
        return;
      }
      me.setYConstraint(
        constrainRegion.top,
        constrainRegion.bottom - context.element.offsetHeight,
        tickSize
      );
    } else {
      me.setYConstraint(null, null, tickSize);
    }
  }
  setXConstraint(iLeft, iRight, iTickSize) {
    const { drag } = this;
    drag.minX = iLeft;
    drag.maxX = iRight;
  }
  setYConstraint(iUp, iDown, iTickSize) {
    const { drag } = this;
    drag.minY = iUp;
    drag.maxY = iDown;
  }
  //endregion
  //region Other stuff
  adjustStartDate(startDate, timeDiff) {
    const rounded = this.client.timeAxis.roundDate(
      new Date(startDate - 0 + timeDiff),
      this.client.snapRelativeToEventStartDate ? startDate : false
    );
    return this.constrainStartDate(rounded);
  }
  resolveStartEndDates(draggedElement) {
    const timeline = this.currentOverClient, { timeAxis } = timeline, proxyRect = Rectangle.from(draggedElement.querySelector(timeline.eventInnerSelector), timeline.timeAxisSubGridElement), dd = this.dragData, [record] = dd.draggedEntities, eventRecord = record.isAssignment ? record.event : record, fillSnap = timeline.fillTicks && timeline.snapRelativeToEventStartDate, totalDurationMS = eventRecord.endDate - eventRecord.startDate;
    let {
      start: startDate,
      end: endDate
    } = timeline.getStartEndDatesFromRectangle(proxyRect, fillSnap ? null : "round", totalDurationMS, true);
    if (startDate && endDate) {
      if (fillSnap) {
        const offsetMS = eventRecord.startDate - DateHelper.startOf(eventRecord.startDate, timeAxis.unit), proxyMS = endDate - startDate, offsetPx = offsetMS / proxyMS * proxyRect.width;
        proxyRect.deflate(offsetPx, 0, 0, offsetPx);
        const proxyStart = proxyRect.getStart(timeline.rtl, !timeline.isVertical);
        startDate = timeline.getDateFromCoordinate(proxyStart, null, true);
        startDate = timeAxis.roundDate(startDate, eventRecord.startDate);
      }
      startDate = this.adjustStartDate(startDate, 0);
      if (!dd.startsOutsideView) {
        if (!timeAxis.dateInAxis(startDate, false)) {
          const tick = timeAxis.getTickFromDate(startDate);
          if (tick >= 0) {
            startDate = timeAxis.getDateFromTick(tick);
          }
        }
        endDate = startDate && DateHelper.add(startDate, totalDurationMS);
      } else if (!dd.endsOutsideView) {
        startDate = endDate && DateHelper.add(endDate, -totalDurationMS);
      }
    }
    return {
      startDate,
      endDate
    };
  }
  //endregion
  //region Dragtip
  /**
   * Gets html to display in tooltip while dragging event. Uses clockTemplate to display start & end dates.
   */
  getTipHtml() {
    const me = this, { dragData, client, tooltipTemplate } = me, { startDate, endDate, draggedEntities } = dragData, startText = client.getFormattedDate(startDate), endText = client.getFormattedEndDate(endDate, startDate), { valid, message, element, dragProxy } = dragData.context, tipTarget = dragProxy ? dragProxy.firstChild : element, dragged = draggedEntities[0], timeSpanRecord = dragged.isTask ? dragged : dragged.event;
    me.tip.lastAlignSpec.target = tipTarget;
    return tooltipTemplate({
      valid,
      startDate,
      endDate,
      startText,
      endText,
      dragData,
      message: message || "",
      [client.scheduledEventName + "Record"]: timeSpanRecord,
      startClockHtml: me.clockTemplate.template({
        date: startDate,
        text: startText,
        cls: "b-sch-tooltip-startdate"
      }),
      endClockHtml: timeSpanRecord.isMilestone ? "" : me.clockTemplate.template({
        date: endDate,
        text: endText,
        cls: "b-sch-tooltip-enddate"
      })
    });
  }
  //endregion
  //region Configurable
  // Constrain to time slot means lockX if we're horizontal, otherwise lockY
  updateConstrainDragToTimeSlot(value) {
    const axis = this.client.isHorizontal ? "lockX" : "lockY";
    if (this.drag) {
      this.drag[axis] = value;
    }
  }
  // Constrain to resource means lockY if we're horizontal, otherwise lockX
  updateConstrainDragToResource(constrainDragToResource) {
    const me = this;
    if (me.drag) {
      const { constrainDragToTimeSlot } = me, { isHorizontal } = me.client;
      if (constrainDragToResource) {
        me.constrainDragToTimeline = true;
      }
      me.drag.lockY = isHorizontal ? constrainDragToResource : constrainDragToTimeSlot;
      me.drag.lockX = isHorizontal ? constrainDragToTimeSlot : constrainDragToResource;
    }
  }
  updateConstrainDragToTimeline(constrainDragToTimeline) {
    if (!this.isConfiguring) {
      Object.assign(this.drag, {
        cloneTarget: !constrainDragToTimeline,
        dragWithin: constrainDragToTimeline ? null : document.body,
        scrollManager: constrainDragToTimeline ? this.client.scrollManager : null
      });
    }
  }
  constrainStartDate(startDate) {
    const { dragData } = this, { dateConstraints } = dragData, scheduleableRecord = dragData.eventRecord || dragData.taskRecord || dragData.draggedEntities[0];
    if (dateConstraints == null ? void 0 : dateConstraints.start) {
      startDate = DateHelper.max(dateConstraints.start, startDate);
    }
    if (dateConstraints == null ? void 0 : dateConstraints.end) {
      startDate = DateHelper.min(new Date(dateConstraints.end - scheduleableRecord.durationMS), startDate);
    }
    return startDate;
  }
  //endregion
  //region Product specific, implemented in subclasses
  getElementFromContext(context) {
    return context.grabbed || context.dragProxy || context.element;
  }
  // Provide your custom implementation of this to allow additional selected records to be dragged together with the original one.
  getRelatedRecords(record) {
    return [];
  }
  getMinimalDragData(info, event) {
    return {};
  }
  // Check if element can be dropped at desired location
  isValidDrop(dragData) {
    throw new Error("Implement in subclass");
  }
  // Similar to the fn above but also calls validatorFn
  checkDragValidity(dragData) {
    throw new Error("Implement in subclass");
  }
  // Update records being dragged
  updateRecords(context) {
    throw new Error("Implement in subclass");
  }
  // Determine if an element can be dragged
  isElementDraggable(el, event) {
    throw new Error("Implement in subclass");
  }
  // Get coordinate for correct axis
  getCoordinate(record, element, coord) {
    throw new Error("Implement in subclass");
  }
  // Product specific drag data
  setupProductDragData(info) {
    throw new Error("Implement in subclass");
  }
  // Product specific data in drag context
  getProductDragContext(dd) {
    throw new Error("Implement in subclass");
  }
  getRecordElement(record) {
    throw new Error("Implement in subclass");
  }
  //endregion
};
DragBase._$name = "DragBase";

// ../Scheduler/lib/Scheduler/feature/EventResize.js
var tipAlign = {
  top: "b-t",
  right: "b100-t100",
  bottom: "t-b",
  left: "b0-t0"
};
var EventResize = class extends InstancePlugin.mixin(Draggable_default, Droppable_default) {
  //region Events
  /**
   * Fired on the owning Scheduler before resizing starts. Return `false` to prevent the action.
   * @event beforeEventResize
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord Event record being resized
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the resize starts within
   * @param {MouseEvent} event Browser event
   */
  /**
   * Fires on the owning Scheduler when event resizing starts
   * @event eventResizeStart
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord Event record being resized
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the resize starts within
   * @param {MouseEvent} event Browser event
   */
  /**
   * Fires on the owning Scheduler on each resize move event
   * @event eventPartialResize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord Event record being resized
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {HTMLElement} element
   */
  /**
   * Fired on the owning Scheduler to allow implementer to prevent immediate finalization by setting
   * `data.context.async = true` in the listener, to show a confirmation popup etc
   *
   * ```javascript
   *  scheduler.on('beforeeventresizefinalize', ({context}) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   *
   * @event beforeEventResizeFinalize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Object} context
   * @param {Scheduler.model.EventModel} context.eventRecord Event record being resized
   * @param {Date} context.startDate New startDate (changed if resizing start side)
   * @param {Date} context.endDate New endDate (changed if resizing end side)
   * @param {Date} context.originalStartDate Start date before resize
   * @param {Date} context.originalEndDate End date before resize
   * @param {Boolean} context.async Set true to handle resize asynchronously (e.g. to wait for user confirmation)
   * @param {Function} context.finalize Call this method to finalize resize. This method accepts one argument:
   *                   pass `true` to update records, or `false`, to ignore changes
   * @param {Event} event Browser event
   */
  /**
   * Fires on the owning Scheduler after the resizing gesture has finished.
   * @event eventResizeEnd
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Boolean} changed Shows if the record has been changed by the resize action
   * @param {Scheduler.model.EventModel} eventRecord Event record being resized
   */
  //endregion
  //region Config
  static get $name() {
    return "EventResize";
  }
  static get configurable() {
    return {
      draggingItemCls: "b-sch-event-wrap-resizing",
      resizingItemInnerCls: "b-sch-event-resizing",
      /**
       * Use left handle when resizing. Only applies when owning client's `direction` is 'horizontal'
       * @config {Boolean}
       * @default
       */
      leftHandle: true,
      /**
       * Use right handle when resizing. Only applies when owning client's `direction` is 'horizontal'
       * @config {Boolean}
       * @default
       */
      rightHandle: true,
      /**
       * Use top handle when resizing. Only applies when owning client's direction` is 'vertical'
       * @config {Boolean}
       * @default
       */
      topHandle: true,
      /**
       * Use bottom handle when resizing. Only applies when owning client's `direction` is 'vertical'
       * @config {Boolean}
       * @default
       */
      bottomHandle: true,
      /**
       * Resizing handle size to use instead of that determined by CSS
       * @config {Number}
       * @deprecated Since 5.2.7. The handle size is determined from responsive CSS. Will be removed in 6.0
       */
      handleSize: null,
      /**
       * Automatically shrink virtual handles when available space < handleSize. The virtual handles will
       * decrease towards width/height 1, reserving space between opposite handles to for example leave room for
       * dragging. To configure reserved space, see {@link #config-reservedSpace}.
       * @config {Boolean}
       * @default false
       */
      dynamicHandleSize: true,
      /**
       * Set to true to allow resizing to a zero-duration span
       * @config {Boolean}
       * @default false
       */
      allowResizeToZero: null,
      /**
       * Room in px to leave unoccupied by handles when shrinking them dynamically (see
       * {@link #config-dynamicHandleSize}).
       * @config {Number}
       * @default
       */
      reservedSpace: 5,
      /**
       * Resizing handle size to use instead of that determined by CSS on touch devices
       * @config {Number}
       * @deprecated Since 5.2.7. The handle size is determined from responsive CSS. Will be removed in 6.0
       */
      touchHandleSize: null,
      /**
       * The amount of pixels to move pointer/mouse before it counts as a drag operation.
       * @config {Number}
       * @default
       */
      dragThreshold: 0,
      dragTouchStartDelay: 0,
      draggingClsSelector: ".b-timeline-base",
      /**
       * `false` to not show a tooltip while resizing
       * @config {Boolean}
       * @default
       */
      showTooltip: true,
      /**
       * true to see exact event length during resizing
       * @config {Boolean}
       * @default
       */
      showExactResizePosition: false,
      /**
       * An empty function by default, but provided so that you can perform custom validation on
       * the item being resized. Return true if the new duration is valid, false to signal that it is not.
       * @param {Object} context The resize context, contains the record & dates.
       * @param {Scheduler.model.TimeSpan} context.record The record being resized.
       * @param {Date} context.startDate The new start date.
       * @param {Date} context.endDate The new start date.
       * @param {Date} context.originalStartDate Start date before resize
       * @param {Date} context.originalEndDate End date before resize
       * @param {Event} event The browser Event object
       * @returns {Boolean}
       * @config {Function}
       */
      validatorFn: () => true,
      /**
       * `this` reference for the validatorFn
       * @config {Object}
       */
      validatorFnThisObj: null,
      /**
       * Setting this property may change the configuration of the {@link #config-tip}, or
       * cause it to be destroyed if `null` is passed.
       *
       * Reading this property returns the Tooltip instance.
       * @member {Core.widget.Tooltip|TooltipConfig} tip
       */
      /**
       * If a tooltip is required to illustrate the resize, specify this as `true`, or a config
       * object for the {@link Core.widget.Tooltip}.
       * @config {Core.widget.Tooltip|TooltipConfig}
       */
      tip: {
        $config: ["lazy", "nullify"],
        value: {
          autoShow: false,
          axisLock: true,
          trackMouse: false,
          updateContentOnMouseMove: true,
          hideDelay: 0
        }
      },
      /**
       * A template function returning the content to show during a resize operation.
       *
       * @config {Function} tooltipTemplate
       * @param {Object} context A context object
       * @param {Date} context.startDate New start date
       * @param {Date} context.endDate New end date
       * @param {Scheduler.model.TimeSpan} context.record The record being resized
       * @param {String} context.startClockHtml Predefined HTML to show the start time
       * @param {String} context.endClockHtml Predefined HTML to show the end time
       * @returns {String} String representing the HTML markup
       */
      tooltipTemplate: (context) => `
                <div class="b-sch-tip-${context.valid ? "valid" : "invalid"}">
                    ${context.startClockHtml}
                    ${context.endClockHtml}
                    <div class="b-sch-tip-message">${context.message}</div>
                </div>
            `,
      ignoreSelector: ".b-sch-terminal",
      dragActiveCls: "b-resizing-event",
      /**
       * Locks the layout during drag resize, overriding the default behaviour that uses the same rendering
       * pathway for drag resize as for already existing events.
       *
       * This more closely resembles the behaviour of versions prior to 4.2.0.
       *
       * Enabling this config also leads to cheaper resizing, only the resized event's resources are refreshed
       * during the operation.
       *
       * {@note}Note that this will be the default behaviour starting with version 6.0.0{/@note}
       *
       * @config {Boolean}
       */
      lockLayout: VersionHelper.checkVersion("core", "6.0", ">=")
    };
  }
  static get pluginConfig() {
    return {
      chain: ["render", "onEventDataGenerated", "isEventElementDraggable"]
    };
  }
  //endregion
  //region Init & destroy
  doDestroy() {
    var _a;
    super.doDestroy();
    (_a = this.dragging) == null ? void 0 : _a.destroy();
  }
  render() {
    const me = this, { client } = me;
    me.dragSelector = me.dragItemSelector = client.eventSelector;
    me.dragRootElement = me.dropRootElement = client.timeAxisSubGridElement;
    me.dragLock = client.isVertical ? "y" : "x";
  }
  // Prevent event dragging when it happens over a resize handle
  isEventElementDraggable(eventElement, eventRecord, el, event) {
    const me = this, eventResizable = eventRecord == null ? void 0 : eventRecord.resizable;
    if (me.disabled || !eventResizable || eventRecord.isMilestone) {
      return true;
    }
    return (eventResizable !== true && eventResizable !== "start" || !me.isOverStartHandle(event, eventElement)) && (eventResizable !== true && eventResizable !== "end" || !me.isOverEndHandle(event, eventElement));
  }
  // Called for each event during render, allows manipulation of render data.
  onEventDataGenerated({ eventRecord, wrapperCls, cls }) {
    var _a, _b;
    if (eventRecord === ((_b = (_a = this.dragging) == null ? void 0 : _a.context) == null ? void 0 : _b.eventRecord)) {
      wrapperCls["b-active"] = wrapperCls[this.draggingItemCls] = wrapperCls["b-over-resize-handle"] = cls["b-resize-handle"] = cls[this.resizingItemInnerCls] = 1;
    }
  }
  // Sneak a first peek at the drag event to put necessary date values into the context
  onDragPointerMove(event) {
    var _a;
    const {
      client,
      dragging
    } = this, {
      visibleDateRange,
      isHorizontal
    } = client, rtl = isHorizontal && client.rtl, dimension = isHorizontal ? "X" : "Y", pageScroll = globalThis[`page${dimension}Offset`], coord = event[`page${dimension}`] + (((_a = dragging.context) == null ? void 0 : _a.offset) || 0), clientRect = Rectangle.from(client.timeAxisSubGridElement, null, true), startCoord = clientRect.getStart(rtl, isHorizontal), endCoord = clientRect.getEnd(rtl, isHorizontal);
    let date = client.getDateFromCoord({ coord, local: false });
    if (rtl) {
      if (coord - pageScroll > startCoord) {
        date = visibleDateRange.startDate;
      } else if (coord < endCoord) {
        date = visibleDateRange.endDate;
      }
    } else if (coord - pageScroll < startCoord) {
      date = visibleDateRange.startDate;
    } else if (coord - pageScroll > endCoord) {
      date = visibleDateRange.endDate;
    }
    dragging.clientStartCoord = startCoord;
    dragging.clientEndCoord = endCoord;
    dragging.date = date;
    super.onDragPointerMove(event);
  }
  /**
   * Returns true if a resize operation is active
   * @property {Boolean}
   * @readonly
   */
  get isResizing() {
    return Boolean(this.dragging);
  }
  beforeDrag(drag) {
    const { client } = this, eventRecord = client.resolveTimeSpanRecord(drag.itemElement), resourceRecord = !client.isGanttBase && client.resolveResourceRecord(client.isVertical ? drag.startEvent : drag.itemElement);
    if (this.disabled || client.readOnly || (resourceRecord == null ? void 0 : resourceRecord.readOnly) || eventRecord && (eventRecord.readOnly || !(eventRecord.project || eventRecord.isOccurrence)) || super.beforeDrag(drag) === false) {
      return false;
    }
    drag.mousedownDate = drag.date = client.getDateFromCoordinate(drag.event[`page${client.isHorizontal ? "X" : "Y"}`], null, false);
    return this.triggerBeforeResize(drag);
  }
  dragStart(drag) {
    var _a, _b;
    const me = this, {
      client,
      tip
    } = me, {
      startEvent,
      itemElement
    } = drag, name = client.scheduledEventName, eventRecord = client.resolveEventRecord(itemElement), {
      isBatchUpdating,
      wrapStartDate,
      wrapEndDate
    } = eventRecord, useEventBuffer = (_a = client.features.eventBuffer) == null ? void 0 : _a.enabled, eventStartDate = isBatchUpdating ? eventRecord.get("startDate") : eventRecord.startDate, eventEndDate = isBatchUpdating ? eventRecord.get("endDate") : eventRecord.endDate, horizontal = me.dragLock === "x", rtl = horizontal && client.rtl, draggingEnd = me.isOverEndHandle(startEvent, itemElement), toSet = draggingEnd ? "endDate" : "startDate", wrapToSet = !useEventBuffer ? null : draggingEnd ? "wrapEndDate" : "wrapStartDate", otherEnd = draggingEnd ? "startDate" : "endDate", setMethod = draggingEnd ? "setEndDate" : "setStartDate", setOtherMethod = draggingEnd ? "setStartDate" : "setEndDate", elRect = Rectangle.from(itemElement), startCoord = horizontal ? startEvent.clientX : startEvent.clientY, endCoord = draggingEnd ? elRect.getEnd(rtl, horizontal) : elRect.getStart(rtl, horizontal), context = drag.context = {
      eventRecord,
      element: itemElement,
      timespanRecord: eventRecord,
      taskRecord: eventRecord,
      owner: me,
      valid: true,
      oldValue: draggingEnd ? eventEndDate : eventStartDate,
      startDate: eventStartDate,
      endDate: eventEndDate,
      offset: useEventBuffer ? 0 : endCoord - startCoord,
      edge: horizontal ? draggingEnd ? "right" : "left" : draggingEnd ? "bottom" : "top",
      finalize: me.finalize,
      event: drag.event,
      // these two are public
      originalStartDate: eventStartDate,
      originalEndDate: eventEndDate,
      wrapStartDate,
      wrapEndDate,
      draggingEnd,
      toSet,
      wrapToSet,
      otherEnd,
      setMethod,
      setOtherMethod
    };
    eventRecord.meta.isResizing = true;
    client.element.classList.add(...me.dragActiveCls.split(" "));
    if (!client.listenToBatchedUpdates) {
      client.beginListeningForBatchedUpdates();
    }
    if (!isBatchUpdating) {
      me.beginEventRecordBatch(eventRecord);
    }
    me.setupProductResizeContext(context, startEvent);
    me.triggerEventResizeStart(`${name}ResizeStart`, {
      [`${name}Record`]: eventRecord,
      event: startEvent,
      ...me.getResizeStartParams(context)
    }, context);
    context.resizedRecord = ((_b = client.resolveAssignmentRecord) == null ? void 0 : _b.call(client, context.element)) || eventRecord;
    if (tip) {
      tip.show();
      tip.align = tipAlign[context.edge];
      tip.showBy(me.getTooltipTarget(drag));
    }
  }
  // Subclasses may override this
  triggerBeforeResize(drag) {
    const { client } = this, eventRecord = client.resolveTimeSpanRecord(drag.itemElement);
    return client.trigger(
      `before${client.capitalizedEventName}Resize`,
      {
        [`${client.scheduledEventName}Record`]: eventRecord,
        event: drag.event,
        ...this.getBeforeResizeParams({ event: drag.startEvent, element: drag.itemElement })
      }
    );
  }
  // Subclasses may override this
  triggerEventResizeStart(eventType, event, context) {
    var _a, _b;
    this.client.trigger(eventType, event);
    (_b = (_a = this.client)[`after${StringHelper.capitalize(eventType)}`]) == null ? void 0 : _b.call(_a, context, event);
  }
  triggerEventResizeEnd(eventType, event) {
    this.client.trigger(eventType, event);
  }
  triggerEventPartialResize(eventType, event) {
    this.client.trigger(eventType, event);
  }
  triggerBeforeEventResizeFinalize(eventType, event) {
    this.client.trigger(eventType, event);
  }
  dragEnter(drag) {
    var _a;
    return ((_a = drag.context) == null ? void 0 : _a.owner) === this;
  }
  resizeEventPartiallyInternal(eventRecord, context) {
    var _a;
    const { client } = this, { toSet } = context;
    if ((_a = client.features.eventBuffer) == null ? void 0 : _a.enabled) {
      if (toSet === "startDate") {
        const diff = context.startDate.getTime() - context.originalStartDate.getTime();
        eventRecord.wrapStartDate = new Date(context.wrapStartDate.getTime() + diff);
      } else if (toSet === "endDate") {
        const diff = context.endDate.getTime() - context.originalEndDate.getTime();
        eventRecord.wrapEndDate = new Date(context.wrapEndDate.getTime() + diff);
      }
    }
    eventRecord.set(toSet, context[toSet]);
  }
  applyDateConstraints(date, eventRecord, context) {
    var _a, _b;
    const minDate = (_a = context.dateConstraints) == null ? void 0 : _a.start, maxDate = (_b = context.dateConstraints) == null ? void 0 : _b.end;
    if (minDate || maxDate) {
      date = DateHelper.constrain(date, minDate, maxDate);
      context.snappedDate = DateHelper.constrain(context.snappedDate, minDate, maxDate);
    }
    return date;
  }
  // Override the draggable interface so that we can update the bar while dragging outside
  // the Draggable's rootElement (by default it stops notifications when outside rootElement)
  moveDrag(drag) {
    const me = this, {
      client,
      tip
    } = me, horizontal = me.dragLock === "x", dimension = horizontal ? "X" : "Y", name = client.scheduledEventName, {
      visibleDateRange,
      enableEventAnimations,
      timeAxis,
      weekStartDay
    } = client, rtl = horizontal && client.rtl, {
      resolutionUnit,
      resolutionIncrement
    } = timeAxis, {
      event,
      context
    } = drag, {
      eventRecord,
      oldValue
    } = context, offset = context.offset * (rtl ? -1 : 1), {
      isOccurrence
    } = eventRecord, eventStart = eventRecord.get("startDate"), eventEnd = eventRecord.get("endDate"), coord = event[`client${dimension}`] + offset, clientRect = Rectangle.from(client.timeAxisSubGridElement, null, true), startCoord = clientRect.getStart(rtl, horizontal), endCoord = clientRect.getEnd(rtl, horizontal);
    context.event = event;
    if (event.isScroll) {
      drag.date = client.getDateFromCoordinate(event[`page${dimension}`] + offset, null, false);
    }
    let crossedOver, avoidedZeroSize, { date } = drag, {
      toSet,
      otherEnd,
      draggingEnd
    } = context;
    if (rtl) {
      if (coord > startCoord) {
        date = drag.date = visibleDateRange.startDate;
      } else if (coord < endCoord) {
        date = drag.date = visibleDateRange.endDate;
      }
    } else if (coord < startCoord) {
      date = drag.date = visibleDateRange.startDate;
    } else if (coord > endCoord) {
      date = drag.date = visibleDateRange.endDate;
    }
    if (toSet === "endDate") {
      if (date < eventStart) {
        crossedOver = -1;
      }
    } else {
      if (date > eventEnd) {
        crossedOver = 1;
      }
    }
    if (crossedOver && me.onDragEndSwitch) {
      me.onDragEndSwitch(context, date, crossedOver);
      otherEnd = context.otherEnd;
      toSet = context.toSet;
    }
    if (client.snapRelativeToEventStartDate) {
      date = timeAxis.roundDate(date, oldValue);
    }
    context.snappedDate = DateHelper.round(date, timeAxis.resolution, null, weekStartDay);
    const duration = DateHelper.diff(date, context[otherEnd], resolutionUnit) * (draggingEnd ? -1 : 1);
    if (me.isEventDragCreate) {
      context.tooNarrow = duration < resolutionIncrement / 2;
    } else if (duration < resolutionIncrement) {
      if (me.allowResizeToZero) {
        context.snappedDate = date = context[otherEnd];
      } else {
        const sign = otherEnd === "startDate" ? 1 : -1, snappedDate = timeAxis.roundDate(DateHelper.add(eventRecord.get(otherEnd), resolutionIncrement * sign, resolutionUnit));
        if ((snappedDate - oldValue) * sign < 0 || (date - oldValue) * sign > 0) {
          context.snappedDate = snappedDate;
        } else {
          date = sign > 0 ? DateHelper.max(date, oldValue) : DateHelper.min(date, oldValue);
          context.snappedDate = oldValue;
        }
        avoidedZeroSize = true;
      }
    }
    date = me.applyDateConstraints(date, eventRecord, context);
    if (!context.date || date - context.date || avoidedZeroSize) {
      context.date = date;
      context[toSet] = me.showExactResizePosition || client.timeAxisViewModel.snap ? context.snappedDate : date;
      context.valid = me.allowResizeToZero || context[toSet] - context[toSet === "startDate" ? "endDate" : "startDate"] !== 0;
      if (eventRecord.get(toSet) - context[toSet]) {
        context.valid = me.checkValidity(context, event);
        context.message = "";
        if (context.valid && typeof context.valid !== "boolean") {
          context.message = context.valid.message;
          context.valid = context.valid.valid;
        }
        context.valid = context.valid !== false;
        if (context.valid) {
          const partialResizeEvent = {
            [`${name}Record`]: eventRecord,
            startDate: eventStart,
            endDate: eventEnd,
            element: drag.itemElement,
            context
          };
          partialResizeEvent[toSet] = context[toSet];
          me.triggerEventPartialResize(`${name}PartialResize`, partialResizeEvent);
          if (isOccurrence) {
            eventRecord.stores.push(client.eventStore);
          }
          client.enableEventAnimations = false;
          this.resizeEventPartiallyInternal(eventRecord, context);
          client.enableEventAnimations = enableEventAnimations;
          if (isOccurrence) {
            eventRecord.stores.length = 0;
          }
        }
        if (context.tooNarrow) {
          context.valid = false;
        }
      }
    }
    if (tip) {
      tip.align = tipAlign[context.edge];
      tip.alignTo(me.getTooltipTarget(drag));
    }
    super.moveDrag(drag);
  }
  dragEnd(drag) {
    const { context } = drag;
    if (context) {
      context.event = drag.event;
    }
    if (drag.aborted) {
      context == null ? void 0 : context.finalize(false);
    } else if (!this.isEventDragCreate && !drag.started && !EventHelper.getPagePoint(drag.event).equals(EventHelper.getPagePoint(drag.startEvent))) {
      this.dragStart(drag);
      this.cleanup(drag.context, false);
    }
  }
  async dragDrop({ context, event }) {
    var _a;
    context[context.toSet] = context.snappedDate;
    const {
      client
    } = this, {
      startDate,
      endDate
    } = context;
    let modified;
    (_a = this.tip) == null ? void 0 : _a.hide();
    context.valid = startDate && endDate && (this.allowResizeToZero || endDate - startDate > 0) && // Input sanity check
    context[context.toSet] - context.oldValue && // Make sure dragged end changed
    context.valid !== false;
    if (context.valid) {
      this.triggerBeforeEventResizeFinalize(`before${client.capitalizedEventName}ResizeFinalize`, { context, event, [`${client.scheduledEventName}Record`]: context.eventRecord });
      modified = true;
    }
    if (!context.async) {
      await context.finalize(modified);
    }
  }
  // This is called with a thisObj of the context object
  // We set "me" to the owner, and "context" to the thisObj so that it
  // reads as if it were a method of this class.
  async finalize(updateRecord) {
    const me = this.owner, context = this, {
      eventRecord,
      oldValue,
      toSet
    } = context, {
      snapRelativeToEventStartDate,
      timeAxis
    } = me.client;
    let wasChanged = false;
    if (updateRecord) {
      if (snapRelativeToEventStartDate) {
        context[toSet] = context.snappedDate = timeAxis.roundDate(context.date, oldValue);
      }
      wasChanged = await me.internalUpdateRecord(context, eventRecord);
    } else {
      me.cancelEventRecordBatch(eventRecord);
      if (eventRecord.isOccurrence) {
        eventRecord.resources.forEach((resource) => me.client.repaintEventsForResource(resource));
      }
    }
    if (!me.isDestroyed) {
      me.cleanup(context, wasChanged);
    }
  }
  // This is always called on drop or abort.
  cleanup(context, changed) {
    var _a;
    const me = this, { client } = me, {
      element,
      eventRecord
    } = context, name = client.scheduledEventName;
    eventRecord.meta.isResizing = false;
    client.endListeningForBatchedUpdates();
    (_a = me.tip) == null ? void 0 : _a.hide();
    me.unHighlightHandle(element);
    client.element.classList.remove(...me.dragActiveCls.split(" "));
    me.triggerEventResizeEnd(`${name}ResizeEnd`, {
      changed,
      [`${name}Record`]: eventRecord,
      ...me.getResizeEndParams(context)
    });
  }
  async internalUpdateRecord(context, timespanRecord) {
    var _a;
    const { client } = this, { generation } = timespanRecord;
    if (timespanRecord.isOccurrence) {
      client.endListeningForBatchedUpdates();
      timespanRecord[timespanRecord.batching > 1 ? "endBatch" : "cancelBatch"]();
      timespanRecord.set(TimeSpan.prototype.inSetNormalize.call(timespanRecord, {
        startDate: context.startDate,
        endDate: context.endDate
      }));
    } else {
      const toSet = {
        [context.toSet]: context[context.toSet]
      };
      const batchChanges = Object.assign({}, timespanRecord.meta.batchChanges);
      delete batchChanges[context.toSet];
      delete batchChanges.duration;
      if (timespanRecord.isEntity) {
        const {
          startDate,
          endDate,
          draggingEnd
        } = context;
        context.duration = toSet.duration = timespanRecord.run("calculateProjectedDuration", startDate, endDate);
        toSet[context.toSet] = timespanRecord.run("calculateProjectedXDateWithDuration", draggingEnd ? startDate : endDate, draggingEnd, context.duration);
        const setOtherEnd = !timespanRecord[context.otherEnd];
        if (setOtherEnd) {
          toSet[context.otherEnd] = context[context.otherEnd];
        }
        timespanRecord.set(toSet);
        client.endListeningForBatchedUpdates();
        this.cancelEventRecordBatch(timespanRecord);
        if ((_a = client.features.eventBuffer) == null ? void 0 : _a.enabled) {
          timespanRecord[context.wrapToSet] = null;
        }
        const promisesToWait = [];
        if (setOtherEnd) {
          promisesToWait.push(timespanRecord[context.setOtherMethod](toSet[context.otherEnd], false));
        }
        promisesToWait.push(timespanRecord[context.setMethod](toSet[context.toSet], false));
        await Promise.all(promisesToWait);
      } else {
        client.endListeningForBatchedUpdates();
        this.cancelEventRecordBatch(timespanRecord);
        timespanRecord[context.setMethod](toSet[context.toSet], false);
      }
      if (Object.keys(batchChanges).length) {
        timespanRecord.set(batchChanges);
      }
    }
    await client.project.commitAsync();
    return timespanRecord.generation !== generation;
  }
  onDragItemMouseMove(event) {
    if (event.pointerType !== "touch" && !this.handleSelector) {
      this.checkResizeHandles(event);
    }
  }
  /**
   * Check if mouse is over a resize handle (virtual). If so, highlight.
   * @private
   * @param {MouseEvent} event
   */
  checkResizeHandles(event) {
    const me = this, { overItem } = me;
    if (overItem && !me.client.readOnly && (!me.allowResize || me.allowResize(overItem, event))) {
      const eventRecord = me.client.resolveTimeSpanRecord(overItem);
      if (eventRecord == null ? void 0 : eventRecord.readOnly) {
        return;
      }
      if (me.isOverAnyHandle(event, overItem)) {
        me.highlightHandle();
      } else {
        me.unHighlightHandle();
      }
    }
  }
  onDragItemMouseLeave(event, oldOverItem) {
    this.unHighlightHandle(oldOverItem);
  }
  /**
   * Highlights handles (applies css that changes cursor).
   * @private
   */
  highlightHandle() {
    var _a, _b;
    const {
      overItem: item,
      client
    } = this, handleTargetElement = (_b = (_a = item.syncIdMap) == null ? void 0 : _a[client.scheduledEventName]) != null ? _b : item.querySelector(client.eventInnerSelector);
    handleTargetElement.classList.add("b-resize-handle");
    item.classList.add("b-over-resize-handle");
  }
  /**
   * Unhighlight handles (removes css).
   * @private
   */
  unHighlightHandle(item = this.overItem) {
    var _a, _b;
    if (item) {
      const me = this, inner = (_b = (_a = item.syncIdMap) == null ? void 0 : _a[me.client.scheduledEventName]) != null ? _b : item.querySelector(me.client.eventInnerSelector);
      if (inner) {
        inner.classList.remove("b-resize-handle", me.resizingItemInnerCls);
      }
      item.classList.remove("b-over-resize-handle", me.draggingItemCls);
    }
  }
  isOverAnyHandle(event, target) {
    return this.isOverStartHandle(event, target) || this.isOverEndHandle(event, target);
  }
  isOverStartHandle(event, target) {
    var _a;
    return (_a = this.getHandleRect("start", event, target)) == null ? void 0 : _a.contains(EventHelper.getPagePoint(event));
  }
  isOverEndHandle(event, target) {
    var _a;
    return (_a = this.getHandleRect("end", event, target)) == null ? void 0 : _a.contains(EventHelper.getPagePoint(event));
  }
  getHandleRect(side, event, eventEl) {
    if (this.overItem) {
      eventEl = event.target.closest(`.${this.client.eventCls}`) || eventEl.querySelector(`.${this.client.eventCls}`);
      if (!eventEl) {
        return;
      }
      const me = this, start = side === "start", { client } = me, rtl = Boolean(client.rtl), axis = me.dragLock, horizontal = axis === "x", dim = horizontal ? "width" : "height", handleSpec = `${horizontal ? start && !rtl ? "left" : "right" : start ? "top" : "bottom"}Handle`, { offsetWidth } = eventEl, timespanRecord = client.resolveTimeSpanRecord(eventEl), resizable = timespanRecord == null ? void 0 : timespanRecord.isResizable, eventRect = Rectangle.from(eventEl), result = eventRect.clone(), handleStyle = globalThis.getComputedStyle(eventEl, ":before"), touchHandleSize = !me.handleSelector && !BrowserHelper.isHoverableDevice ? me.touchHandleSize : void 0, handleSize = touchHandleSize || me.handleSize || parseFloat(handleStyle[dim]), handleVisThresh = me.handleVisibilityThreshold || 2 * me.handleSize, centerGap = me.dynamicHandleSize ? me.reservedSpace / 2 : 0, deflateArgs = [0, 0, 0, 0];
      if (!me.disabled && me[handleSpec] && (offsetWidth >= handleVisThresh || me.dynamicHandleSize) && (resizable === true || resizable === side)) {
        const oppositeEnd = !horizontal && !start || horizontal && rtl === start;
        if (oppositeEnd) {
          result[axis] += eventRect[dim] - handleSize;
          deflateArgs[horizontal ? 3 : 0] = eventRect[dim] / 2 + centerGap;
        } else {
          deflateArgs[horizontal ? 1 : 2] = eventRect[dim] / 2 + centerGap;
        }
        eventRect.deflate(...deflateArgs);
        result[dim] = handleSize;
        result.constrainTo(eventRect);
        if (result[dim]) {
          return result;
        }
      }
    }
  }
  setupDragContext(event) {
    const me = this;
    if (me.overItem && me.isOverAnyHandle(event, me.overItem) && me.isElementResizable(me.overItem, event)) {
      const result = super.setupDragContext(event);
      result.scrollManager = me.client.scrollManager;
      return result;
    }
  }
  changeHandleSize() {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Handle size is from CSS");
  }
  changeTouchHandleSize() {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Handle size is from CSS");
  }
  changeTip(tip, oldTip) {
    var _a;
    const me = this;
    if (!me.showTooltip) {
      return null;
    }
    if (tip) {
      if (tip.isTooltip) {
        tip.owner = me;
      } else {
        tip = Tooltip.reconfigure(oldTip, Tooltip.mergeConfigs({
          id: me.tipId
        }, tip, {
          getHtml: me.getTipHtml.bind(me),
          owner: me.client
        }, me.tip), {
          owner: me,
          defaults: {
            type: "tooltip"
          }
        });
      }
      tip.ion({
        innerhtmlupdate: "updateDateIndicator",
        thisObj: me
      });
      me.clockTemplate = new ClockTemplate({
        scheduler: me.client
      });
    } else if (oldTip) {
      oldTip.destroy();
      (_a = me.clockTemplate) == null ? void 0 : _a.destroy();
    }
    return tip;
  }
  //endregion
  //region Events
  isElementResizable(element, event) {
    var _a;
    const me = this, { client } = me, timespanRecord = client.resolveTimeSpanRecord(element);
    if (client.readOnly) {
      return false;
    }
    let resizable = timespanRecord == null ? void 0 : timespanRecord.isResizable;
    const handleHoldingElement = (_a = element == null ? void 0 : element.syncIdMap[client.scheduledEventName]) != null ? _a : element, handleEl = event.target.closest('[class$="-handle"]');
    if (!resizable || handleEl && handleEl !== handleHoldingElement) {
      return false;
    }
    element = event.target.closest(me.dragSelector);
    if (!element) {
      return false;
    }
    const startsOutside = element.classList.contains("b-sch-event-startsoutside"), endsOutside = element.classList.contains("b-sch-event-endsoutside");
    if (resizable === true) {
      if (startsOutside && endsOutside) {
        return false;
      } else if (startsOutside) {
        resizable = "end";
      } else if (endsOutside) {
        resizable = "start";
      } else {
        return me.isOverStartHandle(event, element) || me.isOverEndHandle(event, element);
      }
    }
    if (startsOutside && resizable === "start" || endsOutside && resizable === "end") {
      return false;
    }
    if (me.isOverStartHandle(event, element) && resizable === "start" || me.isOverEndHandle(event, element) && resizable === "end") {
      return true;
    }
    return false;
  }
  updateDateIndicator() {
    const { clockTemplate } = this, {
      eventRecord,
      draggingEnd,
      snappedDate
    } = this.dragging.context, startDate = draggingEnd ? eventRecord.get("startDate") : snappedDate, endDate = draggingEnd ? snappedDate : eventRecord.get("endDate"), { element } = this.tip;
    clockTemplate.updateDateIndicator(element.querySelector(".b-sch-tooltip-startdate"), startDate);
    clockTemplate.updateDateIndicator(element.querySelector(".b-sch-tooltip-enddate"), endDate);
  }
  getTooltipTarget({ itemElement, context }) {
    const me = this, { rtl } = me.client, target = Rectangle.from(itemElement, null, true);
    if (me.dragLock === "x") {
      if (!rtl && context.edge === "right" || rtl && context.edge === "left") {
        target.x = target.right - 1;
      } else {
        target.x -= me.tip.anchorSize[0] / 2;
      }
      target.width = me.tip.anchorSize[0] / 2;
    } else {
      if (context.edge === "bottom") {
        target.y = target.bottom - 1;
      }
      target.height = me.tip.anchorSize[1] / 2;
    }
    return { target };
  }
  basicValidityCheck(context, event) {
    return context.startDate && (context.endDate > context.startDate || this.allowResizeToZero) && this.validatorFn.call(this.validatorFnThisObj || this, context, event);
  }
  //endregion
  //region Tooltip
  getTipHtml({ tip }) {
    const me = this, {
      startDate,
      endDate,
      toSet,
      snappedDate,
      valid,
      message = "",
      timespanRecord
    } = me.dragging.context;
    if (!startDate || !endDate) {
      return tip.html;
    }
    const tipData = {
      record: timespanRecord,
      valid,
      message,
      startDate,
      endDate,
      [toSet]: snappedDate
    };
    tipData.startText = me.client.getFormattedDate(tipData.startDate);
    tipData.endText = me.client.getFormattedDate(tipData.endDate);
    tipData.startClockHtml = me.clockTemplate.template({
      date: tipData.startDate,
      text: tipData.startText,
      cls: "b-sch-tooltip-startdate"
    });
    tipData.endClockHtml = me.clockTemplate.template({
      date: tipData.endDate,
      text: tipData.endText,
      cls: "b-sch-tooltip-enddate"
    });
    return me.tooltipTemplate(tipData);
  }
  //endregion
  //region Product specific, may be overridden in subclasses
  beginEventRecordBatch(eventRecord) {
    eventRecord.beginBatch();
  }
  cancelEventRecordBatch(eventRecord) {
    eventRecord.cancelBatch();
  }
  getBeforeResizeParams(context) {
    const { client } = this;
    return {
      resourceRecord: client.resolveResourceRecord(client.isVertical ? context.event : context.element)
    };
  }
  getResizeStartParams(context) {
    return {
      resourceRecord: context.resourceRecord
    };
  }
  getResizeEndParams(context) {
    return {
      resourceRecord: context.resourceRecord,
      event: context.event
    };
  }
  setupProductResizeContext(context, event) {
    var _a, _b, _c;
    const { client } = this, { element } = context, eventRecord = client.resolveEventRecord(element), resourceRecord = (_a = client.resolveResourceRecord) == null ? void 0 : _a.call(client, element), assignmentRecord = (_b = client.resolveAssignmentRecord) == null ? void 0 : _b.call(client, element);
    Object.assign(context, {
      eventRecord,
      taskRecord: eventRecord,
      resourceRecord,
      assignmentRecord,
      dateConstraints: (_c = client.getDateConstraints) == null ? void 0 : _c.call(client, resourceRecord, eventRecord)
    });
  }
  checkValidity({ startDate, endDate, eventRecord, resourceRecord }) {
    const { client } = this;
    if (!client.allowOverlap) {
      if (eventRecord.resources.some((resource) => !client.isDateRangeAvailable(startDate, endDate, eventRecord, resource))) {
        return {
          valid: false,
          message: this.L("L{EventDrag.eventOverlapsExisting}")
        };
      }
    }
    return this.basicValidityCheck(...arguments);
  }
  get tipId() {
    return `${this.client.id}-event-resize-tip`;
  }
  //endregion
};
EventResize._$name = "EventResize";
GridFeatureManager.registerFeature(EventResize, true, "Scheduler");
GridFeatureManager.registerFeature(EventResize, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/mixin/TaskEditTransactional.js
var TaskEditTransactional_default = (Target) => class TaskEditTransactional extends (Target || Base) {
  static get $name() {
    return "TaskEditTransactional";
  }
  captureStm(force) {
    if (this.client.transactionalFeaturesEnabled) {
      super.captureStm();
      return this.startStmTransaction(force);
    } else {
      super.captureStm(force);
    }
  }
  freeStm(commitOrReject) {
    if (this.hasStmCapture || !this.client.transactionalFeaturesEnabled) {
      return super.freeStm(commitOrReject);
    }
  }
  async startStmTransaction(startRecordingEarly) {
    if (this.client.transactionalFeaturesEnabled) {
      await this.startFeatureTransaction(startRecordingEarly);
    } else {
      super.startStmTransaction();
    }
  }
  commitStmTransaction() {
    if (this.client.transactionalFeaturesEnabled) {
      return this.finishFeatureTransaction();
    } else {
      super.commitStmTransaction();
    }
  }
  async rejectStmTransaction() {
    if (this.client.transactionalFeaturesEnabled) {
      this.rejectFeatureTransaction();
    } else {
      await super.rejectStmTransaction();
    }
  }
};

// ../Scheduler/lib/Scheduler/feature/mixin/TransactionalFeature.js
var TransactionalFeature_default = (Target) => {
  var _a;
  return _a = class extends AttachToProjectMixin_default(Target || Base) {
    //#region AttachToProjectMixin implementation
    detachFromProject(project) {
      this.rejectFeatureTransaction();
      super.detachFromProject(project);
    }
    //#endregion
    getStmCapture() {
      const result = super.getStmCapture();
      result._editorPromiseResolve = this._editorPromiseResolve;
      return result;
    }
    applyStmCapture(stmCapture) {
      super.applyStmCapture(stmCapture);
      this._editorPromiseResolve = stmCapture._editorPromiseResolve;
    }
    async startFeatureTransaction() {
      if (!this.client.transactionalFeaturesEnabled) {
        return;
      }
      const me = this, { project } = me.client, { stm } = project;
      let chainResolved;
      if (me.hasStmCapture) {
        stm.startTransaction();
      } else {
        chainResolved = project.queue(() => project.commitAsync());
      }
      project.queue(() => {
        var _a2;
        if (!me.hasStmCapture) {
          me._stmInitiallyDisabled = stm.disabled;
          me._stmInitiallyAutoRecord = stm.autoRecord;
          if (stm.isRecording) {
            stm.stopTransaction();
          } else if (me._stmInitiallyDisabled) {
            stm.enable();
          }
          stm.autoRecord = false;
        }
        if (!stm.isRecording) {
          stm.startTransaction();
        }
        (_a2 = me.trigger) == null ? void 0 : _a2.call(me, "featureTransactionStart");
        return new Promise((resolve) => me._editorPromiseResolve = resolve);
      });
      await chainResolved;
    }
    rejectFeatureTransaction() {
      var _a2;
      if (!this.client.transactionalFeaturesEnabled) {
        return;
      }
      const me = this, { stm } = me.client.project;
      (_a2 = me._editorPromiseResolve) == null ? void 0 : _a2.call(me);
      me._editorPromiseResolve = null;
      stm.isRecording && stm.rejectTransaction();
      if (!me.hasStmCapture && me._stmInitiallyDisabled != null) {
        stm.disabled = me._stmInitiallyDisabled;
        stm.autoRecord = me._stmInitiallyAutoRecord;
      }
      me.trigger("featureTransactionReject");
    }
    async finishFeatureTransaction(afterApplyStashCallback) {
      var _a2;
      if (!this.client.transactionalFeaturesEnabled) {
        return;
      }
      const me = this, { project } = me.client, { stm } = project;
      if (!project.isEngineReady()) {
        await project.commitAsync();
      }
      const transactionId = stm.stash(), {
        _stmInitiallyDisabled,
        _stmInitiallyAutoRecord
      } = me, id = IdHelper.generateId("featureTransaction");
      (_a2 = me._editorPromiseResolve) == null ? void 0 : _a2.call(me);
      me._editorPromiseResolve = null;
      if (!me.isDestroying) {
        me.trigger("featureTransactionFinalizeStart", { id });
      }
      return project.queue(async () => {
        var _a3, _b;
        stm == null ? void 0 : stm.applyStash(transactionId);
        await (afterApplyStashCallback == null ? void 0 : afterApplyStashCallback());
        await ((_a3 = project.commitAsync) == null ? void 0 : _a3.call(project));
        if (stm.isRecording) {
          stm.stopTransaction();
        }
        if (!me.hasStmCapture && stm && !stm.isDestroying && _stmInitiallyDisabled != null) {
          stm.disabled = _stmInitiallyDisabled;
          stm.autoRecord = _stmInitiallyAutoRecord;
        }
        (_b = me.trigger) == null ? void 0 : _b.call(me, "featureTransactionFinalized", { id });
      });
    }
  }, __publicField(_a, "$name", "TransactionalFeature"), _a;
};

// ../Scheduler/lib/Scheduler/feature/base/DragCreateBase.js
var getDragCreateDragDistance = function(event) {
  var _a, _b;
  if ((_b = (_a = this.source) == null ? void 0 : _a.client.features.taskEdit) == null ? void 0 : _b._canceling) {
    return false;
  }
  return EventHelper.getDistanceBetween(this.startEvent, event);
};
var DragCreateBase = class extends EventResize.mixin(
  TaskEditStm_default,
  TransactionalFeature_default,
  TaskEditTransactional_default
) {
  construct(scheduler, config) {
    if ((config == null ? void 0 : config.showTooltip) === false) {
      config.tip = null;
    }
    super.construct(...arguments);
  }
  //endregion
  changeValidatorFn(validatorFn) {
    this.createValidatorFn = validatorFn;
  }
  render() {
    const me = this, { client } = me;
    me.dragRootElement = me.dropRootElement = client.timeAxisSubGridElement;
    me.dragLock = client.isVertical ? "y" : "x";
  }
  onDragEndSwitch(context) {
    const { client } = this, { enableEventAnimations } = client, {
      eventRecord,
      draggingEnd
    } = context, horizontal = this.dragLock === "x", { initialDate } = this.dragging;
    client.enableEventAnimations = false;
    eventRecord.set({
      startDate: initialDate,
      endDate: initialDate
    });
    if (draggingEnd) {
      Object.assign(context, {
        endDate: initialDate,
        toSet: "startDate",
        otherEnd: "endDate",
        setMethod: "setStartDate",
        setOtherMethod: "setEndDate",
        edge: horizontal ? "left" : "top"
      });
    } else {
      Object.assign(context, {
        startDate: initialDate,
        toSet: "endDate",
        otherEnd: "startDate",
        setMethod: "setEndDate",
        setOtherMethod: "setStartDate",
        edge: horizontal ? "right" : "bottom"
      });
    }
    context.draggingEnd = this.draggingEnd = !draggingEnd;
    client.enableEventAnimations = enableEventAnimations;
  }
  beforeDrag(drag) {
    const me = this, result = super.beforeDrag(drag), { pan, eventDragSelect } = me.client.features;
    if (result !== false && // used by gantt to only allow one task per row
    (me.preventMultiple && !me.isRowEmpty(drag.rowRecord) || me.disabled || // If Pan is enabled, it has right of way
    pan && !pan.disabled || // If EventDragSelect is enabled, it has right of way
    eventDragSelect && !eventDragSelect.disabled)) {
      return false;
    }
    me.client.preventDragSelect = true;
    return result;
  }
  startDrag(drag) {
    const result = super.startDrag(drag);
    if (result !== false) {
      const { context } = drag;
      drag.initialDate = context.eventRecord.get(this.draggingEnd ? "startDate" : "endDate");
      this.client.trigger("dragCreateStart", {
        proxyElement: drag.element,
        eventElement: drag.element,
        eventRecord: context.eventRecord,
        resourceRecord: context.resourceRecord
      });
      drag.context.offset = 0;
      drag.context.oldValue = drag.mousedownDate;
    }
    return result;
  }
  // Used by our EventResize superclass to know whether the drag point is the end or the beginning.
  isOverEndHandle() {
    return this.draggingEnd;
  }
  setupDragContext(event) {
    var _a;
    const { client } = this;
    if (client.matchScheduleCell(event.target)) {
      const resourceRecord = (_a = client.resolveResourceRecord(event)) == null ? void 0 : _a.$original;
      if (resourceRecord && !resourceRecord.isSpecialRow) {
        const result = Draggable_default().prototype.setupDragContext.call(this, event), scrollables = [];
        if (client.isVertical) {
          scrollables.push({
            element: client.scrollable.element,
            direction: "vertical"
          });
        } else {
          scrollables.push({
            element: client.timeAxisSubGrid.scrollable.element,
            direction: "horizontal"
          });
        }
        result.scrollManager = client.scrollManager;
        result.monitoringConfig = { scrollables };
        result.resourceRecord = result.rowRecord = resourceRecord;
        result.getDistance = getDragCreateDragDistance;
        return result;
      }
    }
  }
  async dragDrop({ context, event }) {
    var _a;
    context[context.toSet] = context.snappedDate;
    const {
      client
    } = this, {
      startDate,
      endDate,
      eventRecord
    } = context, { generation } = eventRecord;
    let modified;
    (_a = this.tip) == null ? void 0 : _a.hide();
    await client.project.commitAsync();
    if (eventRecord.generation !== generation) {
      context.eventRecord[context.toSet] = context.oldValue;
      context.eventRecord[context.toSet] = context[context.toSet];
    }
    context.valid = startDate && endDate && endDate - startDate > 0 && // Input sanity check
    context[context.toSet] - context.oldValue && // Make sure dragged end changed
    context.valid !== false;
    if (context.valid) {
      client.trigger("beforeDragCreateFinalize", {
        context,
        event,
        proxyElement: context.element,
        eventElement: context.element,
        eventRecord: context.eventRecord,
        resourceRecord: context.resourceRecord
      });
      modified = true;
    }
    if (!context.async) {
      await context.finalize(modified);
    }
  }
  updateDragTolerance(dragTolerance) {
    this.dragThreshold = dragTolerance;
  }
  //region Tooltip
  changeTip(tip, oldTip) {
    return super.changeTip(!tip || tip.isTooltip ? tip : ObjectHelper.assign({
      id: `${this.client.id}-drag-create-tip`
    }, tip), oldTip);
  }
  //endregion
  //region Finalize (create EventModel)
  // this method is actually called on the `context` object,
  // so `this` object inside might not be what you think (see `me = this.owner` below)
  // not clear what was the motivation for such design
  async finalize(doCreate) {
    var _a;
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    const me = this.owner, context = this, completeFinalization = () => {
      if (!me.isDestroyed) {
        me.client.trigger("afterDragCreate", {
          proxyElement: context.element,
          eventElement: context.element,
          eventRecord: context.eventRecord,
          resourceRecord: context.resourceRecord
        });
        me.cleanup(context);
      }
    };
    if (doCreate) {
      await me.finalizeDragCreate(context);
      completeFinalization();
    } else {
      await me.cancelDragCreate(context);
      (_a = me.onAborted) == null ? void 0 : _a.call(me, context);
      completeFinalization();
    }
  }
  async cancelDragCreate(context) {
  }
  async finalizeDragCreate(context) {
    var _a, _b;
    await this.internalUpdateRecord(context, context.eventRecord);
    const stmCapture = this.getStmCapture();
    (_a = this.client) == null ? void 0 : _a.trigger("dragCreateEnd", {
      eventRecord: context.eventRecord,
      resourceRecord: context.resourceRecord,
      event: context.event,
      eventElement: context.element,
      stmCapture
    });
    (_b = this.client) == null ? void 0 : _b.trigger("eventAutoCreated", {
      eventRecord: context.eventRecord,
      resourceRecord: context.resourceRecord
    });
    return stmCapture.transferred;
  }
  cleanup(context) {
    var _a;
    const { client } = this, { eventRecord } = context;
    eventRecord.meta.isResizing = false;
    client.endListeningForBatchedUpdates();
    (_a = this.tip) == null ? void 0 : _a.hide();
    client.element.classList.remove(...this.dragActiveCls.split(" "));
    context.element.parentElement.classList.remove("b-sch-dragcreating");
  }
  //endregion
  //region Events
  /**
   * Prevent right click when drag creating
   * @returns {Boolean}
   * @private
   */
  onElementContextMenu() {
    if (this.proxy) {
      return false;
    }
  }
  prepareCreateContextForFinalization(createContext, event, finalize, async = false) {
    return {
      ...createContext,
      async,
      event,
      finalize
    };
  }
  // Apply drag create "proxy" styling
  onEventDataGenerated(renderData) {
    var _a, _b;
    if (((_b = (_a = this.dragging) == null ? void 0 : _a.context) == null ? void 0 : _b.eventRecord) === renderData.eventRecord) {
      renderData.wrapperCls["b-sch-dragcreating"] = true;
      renderData.wrapperCls["b-too-narrow"] = this.dragging.context.tooNarrow;
    }
  }
  //endregion
  //region Product specific, implemented in subclasses
  // Empty implementation here. Only base EventResize class triggers this
  triggerBeforeResize() {
  }
  // Empty implementation here. Only base EventResize class triggers this
  triggerEventResizeStart() {
  }
  checkValidity(context, event) {
    throw new Error("Implement in subclass");
  }
  handleBeforeDragCreate(dateTime, event) {
    throw new Error("Implement in subclass");
  }
  isRowEmpty(rowRecord) {
    throw new Error("Implement in subclass");
  }
  //endregion
};
//region Config
__publicField(DragCreateBase, "configurable", {
  /**
   * true to show a time tooltip when dragging to create a new event
   * @config {Boolean}
   * @default
   */
  showTooltip: true,
  /**
   * Number of pixels the drag target must be moved before dragging is considered to have started. Defaults to 2.
   * @config {Number}
   * @default
   */
  dragTolerance: 2,
  // used by gantt to only allow one task per row
  preventMultiple: false,
  dragTouchStartDelay: 300,
  /**
   * `this` reference for the validatorFn
   * @config {Object}
   */
  validatorFnThisObj: null,
  tipTemplate: (data) => `
            <div class="b-sch-tip-${data.valid ? "valid" : "invalid"}">
                ${data.startClockHtml}
                ${data.endClockHtml}
                <div class="b-sch-tip-message">${data.message}</div>
            </div>
        `,
  dragActiveCls: "b-dragcreating"
});
__publicField(DragCreateBase, "pluginConfig", {
  chain: ["render", "onEventDataGenerated"],
  before: ["onElementContextMenu"]
});
DragCreateBase._$name = "DragCreateBase";

// ../Scheduler/lib/Scheduler/feature/base/TooltipBase.js
var TooltipBase = class extends InstancePlugin {
  //region Config
  static get defaultConfig() {
    return {
      /**
       * Specify true to have tooltip updated when mouse moves, if you for example want to display date at mouse
       * position.
       * @config {Boolean}
       * @default
       * @category Misc
       */
      autoUpdate: false,
      /**
       * The amount of time to hover before showing
       * @config {Number}
       * @default
       */
      hoverDelay: 250,
      /**
       * The time (in milliseconds) for which the Tooltip remains visible when the mouse leaves the target.
       *
       * May be configured as `false` to persist visible after the mouse exits the target element. Configure it
       * as 0 to always retrigger `hoverDelay` even when moving mouse inside `fromElement`
       * @config {Number}
       * @default
       */
      hideDelay: 100,
      template: null,
      cls: null,
      align: {
        align: "b-t"
      },
      clockTemplate: null,
      // Set to true to update tooltip contents if record changes while tip is open
      monitorRecordUpdate: null,
      testConfig: {
        hoverDelay: 0
      }
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["onInternalPaint"]
    };
  }
  //endregion
  //region Events
  /**
   * Triggered before a tooltip is shown. Return `false` to prevent the action.
   * @preventable
   * @event beforeShow
   * @param {Core.widget.Tooltip} source The tooltip being shown.
   * @param {Scheduler.model.EventModel} source.eventRecord The event record.
   */
  /**
   * Triggered after a tooltip is shown.
   * @event show
   * @param {Core.widget.Tooltip} source The tooltip.
   * @param {Scheduler.model.EventModel} source.eventRecord The event record.
   */
  //endregion
  //region Init
  construct(client, config) {
    const me = this;
    config = me.processConfig(config);
    super.construct(client, config);
    if (!me.forSelector) {
      me.forSelector = `${client.eventInnerSelector}:not(.b-dragproxy,.b-iscreating)`;
    }
    me.clockTemplate = new ClockTemplate({
      scheduler: client
    });
    client.ion({
      [`before${client.scheduledEventName}drag`]: () => {
        var _a;
        (_a = me.tooltip) == null ? void 0 : _a.hide();
      }
    });
  }
  // TooltipBase feature handles special config cases, where user can supply a function to use as template
  // instead of a normal config object
  processConfig(config) {
    if (typeof config === "function") {
      return {
        template: config
      };
    }
    return config;
  }
  // override setConfig to process config before applying it (used mainly from ReactScheduler)
  setConfig(config) {
    super.setConfig(this.processConfig(config));
  }
  doDestroy() {
    this.destroyProperties("clockTemplate", "tooltip");
    super.doDestroy();
  }
  doDisable(disable) {
    if (this.tooltip) {
      this.tooltip.disabled = disable;
    }
    super.doDisable(disable);
  }
  //endregion
  onInternalPaint({ firstPaint }) {
    var _a;
    if (firstPaint) {
      const me = this, { client } = me, ignoreSelector = `:not(${[
        ".b-dragselecting",
        ".b-eventeditor-editing",
        ".b-taskeditor-editing",
        ".b-resizing-event",
        ".b-task-percent-bar-resizing-task",
        ".b-dragcreating",
        `.b-dragging-${client.scheduledEventName}`,
        ".b-creating-dependency",
        ".b-dragproxy"
      ].join()})`;
      (_a = me.tooltip) == null ? void 0 : _a.destroy();
      const tip = me.tooltip = new Tooltip({
        axisLock: "flexible",
        id: me.tipId || `${me.client.id}-event-tip`,
        cls: me.tipCls,
        forSelector: `.b-timelinebase${ignoreSelector} .b-grid-body-container:not(.b-scrolling) ${me.forSelector}`,
        scrollAction: "realign",
        forElement: client.timeAxisSubGridElement,
        showOnHover: true,
        anchorToTarget: true,
        getHtml: me.getTipHtml.bind(me),
        disabled: me.disabled,
        // on Core/mixin/Events constructor, me.config.listeners is deleted and attributed its value to me.configuredListeners
        // to then on processConfiguredListeners it set me.listeners to our TooltipBase
        // but since we need our initial config.listeners to set to our internal tooltip, we leave processConfiguredListeners empty
        // to avoid lost our listeners to apply for our internal tooltip here and force our feature has all Tooltip events firing
        ...me.config,
        internalListeners: me.configuredListeners
      });
      tip.ion({
        innerhtmlupdate: "updateDateIndicator",
        overtarget: "onOverNewTarget",
        show: "onTipShow",
        hide: "onTipHide",
        thisObj: me
      });
      Object.keys(tip.$meta.configs).forEach((name) => {
        Object.defineProperty(this, name, {
          set: (v) => tip[name] = v,
          get: () => tip[name]
        });
      });
    }
  }
  //region Listeners
  // leave configuredListeners alone until render time at which they are used on the tooltip
  processConfiguredListeners() {
  }
  addListener(...args) {
    var _a;
    const defaultDetacher = super.addListener(...args), tooltipDetacher = (_a = this.tooltip) == null ? void 0 : _a.addListener(...args);
    if (defaultDetacher || tooltipDetacher) {
      return () => {
        defaultDetacher == null ? void 0 : defaultDetacher();
        tooltipDetacher == null ? void 0 : tooltipDetacher();
      };
    }
  }
  removeListener(...args) {
    var _a;
    super.removeListener(...args);
    (_a = this.tooltip) == null ? void 0 : _a.removeListener(...args);
  }
  //endregion
  updateDateIndicator() {
    const me = this, tip = me.tooltip, endDateElement = tip.element.querySelector(".b-sch-tooltip-enddate");
    if (!me.record) {
      return;
    }
    me.clockTemplate.updateDateIndicator(tip.element, me.record.startDate);
    endDateElement && me.clockTemplate.updateDateIndicator(endDateElement, me.record.endDate);
  }
  resolveTimeSpanRecord(forElement) {
    return this.client.resolveTimeSpanRecord(forElement);
  }
  getTipHtml({ tip, activeTarget }) {
    const me = this, { client } = me, recordProp = me.recordType || `${client.scheduledEventName}Record`, timeSpanRecord = me.resolveTimeSpanRecord(activeTarget);
    if ((timeSpanRecord == null ? void 0 : timeSpanRecord.startDate) instanceof Date) {
      const { startDate, endDate } = timeSpanRecord, startText = client.getFormattedDate(startDate), endDateValue = client.getDisplayEndDate(endDate, startDate), endText = client.getFormattedDate(endDateValue);
      tip.eventRecord = timeSpanRecord;
      return me.template({
        tip,
        // eventRecord for Scheduler, taskRecord for Gantt
        [`${recordProp}`]: timeSpanRecord,
        startDate,
        endDate,
        startText,
        endText,
        startClockHtml: me.clockTemplate.template({
          date: startDate,
          text: startText,
          cls: "b-sch-tooltip-startdate"
        }),
        endClockHtml: timeSpanRecord.isMilestone ? "" : me.clockTemplate.template({
          date: endDateValue,
          text: endText,
          cls: "b-sch-tooltip-enddate"
        })
      });
    } else {
      tip.hide();
      return "";
    }
  }
  get record() {
    return this.tooltip.eventRecord;
  }
  onTipShow() {
    const me = this;
    if (me.monitorRecordUpdate && !me.updateListener) {
      me.updateListener = me.client.eventStore.ion({
        change: me.onRecordUpdate,
        buffer: 300,
        thisObj: me
      });
    }
  }
  onTipHide() {
    var _a;
    this.tooltip.eventRecord = null;
    (_a = this.updateListener) == null ? void 0 : _a.call(this);
    this.updateListener = null;
  }
  onOverNewTarget({ newTarget }) {
    const { tooltip } = this;
    if (tooltip.isVisible) {
      if (this.client.timeAxisSubGrid.scrolling || this.client.scrolling) {
        tooltip.hide(false);
      } else {
        tooltip.eventRecord = this.resolveTimeSpanRecord(newTarget);
      }
    }
  }
  onRecordUpdate({ record }) {
    const { tooltip } = this;
    if ((tooltip == null ? void 0 : tooltip.isVisible) && record === this.record) {
      tooltip.updateContent();
      if (tooltip.lastAlignSpec.aligningToElement) {
        tooltip.realign();
      } else {
        tooltip.internalOnPointerOver(this.client.lastPointerEvent);
      }
    }
  }
};
TooltipBase._$name = "TooltipBase";

// ../Scheduler/lib/Scheduler/feature/AbstractTimeRanges.js
var AbstractTimeRanges = class extends InstancePlugin.mixin(Delayable_default) {
  //region Config
  /**
   * Fired on the owning Scheduler or Gantt widget when a click happens on a time range header element
   * @event timeRangeHeaderClick
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.TimeSpan} timeRangeRecord The record
   * @param {MouseEvent} event DEPRECATED 5.3.0 Use `domEvent` instead
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler or Gantt widget when a double click happens on a time range header element
   * @event timeRangeHeaderDblClick
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.TimeSpan} timeRangeRecord The record
   * @param {MouseEvent} event DEPRECATED 5.3.0 Use `domEvent` instead
   * @param {MouseEvent} domEvent Browser event
   */
  /**
   * Fired on the owning Scheduler or Gantt widget when a right click happens on a time range header element
   * @event timeRangeHeaderContextMenu
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.TimeSpan} timeRangeRecord The record
   * @param {MouseEvent} event DEPRECATED 5.3.0 Use `domEvent` instead
   * @param {MouseEvent} domEvent Browser event
   */
  static get defaultConfig() {
    return {
      // CSS class to apply to range elements
      rangeCls: "b-sch-range",
      // CSS class to apply to line elements (0-duration time range)
      lineCls: "b-sch-line",
      /**
       * Set to `true` to enable dragging and resizing of range elements in the header. Only relevant when
       * {@link #config-showHeaderElements} is `true`.
       * @config {Boolean}
       * @default
       * @category Common
       */
      enableResizing: false,
      /**
       * A Boolean specifying whether to show tooltip while resizing range elements, or a
       * {@link Core.widget.Tooltip} config object which is applied to the tooltip
       * @config {Boolean|TooltipConfig}
       * @default
       * @category Common
       */
      showTooltip: true,
      /**
       * The Tooltip instance shown when hovering a TimeRange header element
       * @member {Core.widget.Tooltip} hoverTooltip
       * @readonly
       */
      /**
       * A {@link Core.widget.Tooltip} config object which is applied to the tooltip shown when hovering a
       * TimeRange header element
       * @config {TooltipConfig}
       * @category Common
       */
      hoverTooltip: null,
      /**
       * Template used to generate the tooltip contents when hovering a time range header element.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *   features : {
       *     timeRanges : {
       *       tooltipTemplate({ timeRange }) {
       *         return `${timeRange.name}`
       *       }
       *     }
       *   }
       * });
       * ```
       *
       * @config {Function} tooltipTemplate
       * @param {Object} data Tooltip data
       * @param {Scheduler.model.TimeSpan} data.timeRange
       * @param {String} data.startClockHtml Predefined HTML to show the start time
       * @param {String} data.endClockHtml Predefined HTML to show the end time
       * @returns {String} String representing the HTML markup
       * @category Common
       */
      tooltipTemplate: null,
      dragTipTemplate: (data) => `
                <div class="b-sch-tip-${data.valid ? "valid" : "invalid"}">
                    <div class="b-sch-tip-name">${StringHelper.encodeHtml(data.name) || ""}</div>
                    ${data.startClockHtml}
                    ${data.endClockHtml || ""}
                </div>
            `,
      baseCls: "b-sch-timerange",
      /**
       * Function used to generate the HTML content for a time range header element.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *   features : {
       *     timeRanges : {
       *       headerRenderer({ timeRange }) {
       *         return `${timeRange.name}`
       *       }
       *     }
       *   }
       * });
       * ```
       *
       * @config {Function} headerRenderer
       * @param {Object} data Render data
       * @param {Scheduler.model.TimeSpan} data.timeRange
       * @returns {String} String representing the HTML markup
       *
       * @category Common
       */
      headerRenderer: null,
      /**
       * Function used to generate the HTML content for a time range body element.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *   features : {
       *     timeRanges : {
       *       bodyRenderer({ timeRange }) {
       *         return `${timeRange.name}`
       *       }
       *     }
       *   }
       * });
       * ```
       *
       * @config {Function} bodyRenderer
       * @param {Object} data Render data
       * @param {Scheduler.model.TimeSpan} data.timeRange
       * @returns {String} String representing the HTML markup
       *
       * @category Common
       */
      bodyRenderer: null,
      // a unique cls used by subclasses to get custom styling of the elements rendered
      cls: null,
      narrowThreshold: 80
    };
  }
  //endregion
  //region Init & destroy
  construct(client, config) {
    const me = this;
    super.construct(client, config);
    if (client.isVertical) {
      client.ion({
        renderRows: me.onUIReady,
        thisObj: me,
        once: true
      });
    }
    me.cls = me.cls || `b-sch-${me.constructor.$$name.toLowerCase()}`;
    me.baseSelector = `.${me.baseCls}.${me.cls}`;
    if (me.enableResizing) {
      me.showHeaderElements = true;
    }
  }
  doDestroy() {
    var _a, _b, _c, _d;
    const me = this;
    me.detachListeners("timeAxisViewModel");
    me.detachListeners("timeAxis");
    (_a = me.clockTemplate) == null ? void 0 : _a.destroy();
    (_b = me.tip) == null ? void 0 : _b.destroy();
    (_c = me.drag) == null ? void 0 : _c.destroy();
    (_d = me.resize) == null ? void 0 : _d.destroy();
    super.doDestroy();
  }
  doDisable(disable) {
    this.renderRanges();
    super.doDisable(disable);
  }
  setupTimeAxisViewModelListeners() {
    const me = this;
    me.detachListeners("timeAxisViewModel");
    me.detachListeners("timeAxis");
    me.client.timeAxisViewModel.ion({
      name: "timeAxisViewModel",
      update: "onTimeAxisViewModelUpdate",
      thisObj: me
    });
    me.client.timeAxis.ion({
      name: "timeAxis",
      includeChange: "renderRanges",
      thisObj: me
    });
    me.updateLineBuffer();
  }
  onUIReady() {
    const me = this, { client } = me;
    client.ion({
      timeAxisViewModelChange: me.setupTimeAxisViewModelListeners,
      thisObj: me
    });
    me.setupTimeAxisViewModelListeners();
    if (!client.hideHeaders) {
      if (me.headerContainerElement) {
        EventHelper.on({
          click: me.onTimeRangeClick,
          dblclick: me.onTimeRangeClick,
          contextmenu: me.onTimeRangeClick,
          delegate: me.baseSelector,
          element: me.headerContainerElement,
          thisObj: me
        });
      }
      if (me.enableResizing) {
        me.drag = DragHelper.new({
          name: "rangeDrag",
          lockX: client.isVertical,
          lockY: client.isHorizontal,
          constrain: true,
          outerElement: me.headerContainerElement,
          targetSelector: `${me.baseSelector}`,
          isElementDraggable: (el, event) => !client.readOnly && me.isElementDraggable(el, event),
          rtlSource: client,
          internalListeners: {
            dragstart: "onDragStart",
            drag: "onDrag",
            drop: "onDrop",
            reset: "onDragReset",
            abort: "onInvalidDrop",
            thisObj: me
          }
        }, me.dragHelperConfig);
        me.resize = ResizeHelper.new({
          direction: client.mode,
          targetSelector: `${me.baseSelector}.b-sch-range`,
          outerElement: me.headerContainerElement,
          isElementResizable: (el, event) => !el.matches(".b-dragging,.b-readonly") && !event.target.matches(".b-fa"),
          internalListeners: {
            resizestart: "onResizeStart",
            resizing: "onResizeDrag",
            resize: "onResize",
            cancel: "onInvalidResize",
            reset: "onResizeReset",
            thisObj: me
          }
        }, me.resizeHelperConfig);
      }
    }
    me.renderRanges();
    if (me.tooltipTemplate) {
      me.hoverTooltip = new Tooltip(ObjectHelper.assign({
        forElement: me.headerContainerElement,
        getHtml({ activeTarget }) {
          const timeRange = me.resolveTimeRangeRecord(activeTarget);
          return me.tooltipTemplate({ timeRange });
        },
        forSelector: `.b-timelinebase:not(.b-dragging-timerange, .b-resizing-timerange) .${me.baseCls}${me.cls ? "." + me.cls : ""}`
      }, me.hoverTooltip));
    }
  }
  //endregion
  //region Draw
  refresh() {
    this._timeRanges = null;
    this.renderRanges();
  }
  getDOMConfig(startDate, endDate) {
    const me = this, bodyConfigs = [], headerConfigs = [];
    if (!me.disabled) {
      me._labelRotationMap = {};
      for (const range of me.timeRanges) {
        const result = me.renderRange(range, startDate, endDate);
        if (result) {
          bodyConfigs.push(result.bodyConfig);
          headerConfigs.push(result.headerConfig);
        }
      }
    }
    return [bodyConfigs, headerConfigs];
  }
  renderRanges() {
    const me = this, { client } = me;
    if (client.isPainted && !client.timeAxisSubGrid.collapsed) {
      const { headerContainerElement } = me, updatedBodyElements = [], [bodyConfigs, headerConfigs] = me.getDOMConfig();
      if (!me.bodyCanvas) {
        me.bodyCanvas = DomHelper.createElement({
          className: `b-timeranges-canvas b-timeranges-body-canvas ${me.cls}-canvas b-sch-canvas`,
          parent: client.timeAxisSubGridElement,
          retainElement: true
        });
      }
      DomSync.sync({
        targetElement: me.bodyCanvas,
        domConfig: {
          children: bodyConfigs,
          onlyChildren: true,
          syncOptions: {
            releaseThreshold: 0,
            syncIdField: "id"
          }
        },
        callback: me.showHeaderElements ? null : ({
          targetElement,
          action
        }) => {
          if (action === "reuseElement" || action === "newElement" || action === "reuseOwnElement") {
            updatedBodyElements.push(targetElement);
          }
        }
      });
      if (me.showHeaderElements && !me.headerCanvas) {
        me.headerCanvas = DomHelper.createElement({
          className: `b-timeranges-canvas b-timeranges-header-canvas ${me.cls}-canvas`,
          parent: headerContainerElement,
          retainElement: true
        });
      }
      if (me.headerCanvas) {
        DomSync.sync({
          targetElement: me.headerCanvas,
          domConfig: {
            onlyChildren: true,
            children: headerConfigs,
            syncOptions: {
              releaseThreshold: 0,
              syncIdField: "id"
            }
          }
        });
      }
      for (const bodyElement of updatedBodyElements) {
        me.cacheRotation(bodyElement.elementData.timeRange, bodyElement);
      }
      for (const bodyElement of updatedBodyElements) {
        me.applyRotation(bodyElement.elementData.timeRange, bodyElement);
      }
    }
  }
  // Implement in subclasses
  get timeRanges() {
    return [];
  }
  /**
   * Based on this method result the feature decides whether the provided range should
   * be rendered or not.
   * The method checks that the range intersects the current viewport.
   *
   * Override the method to implement your custom range rendering vetoing logic.
   * @param {Scheduler.model.TimeSpan} range Range to render.
   * @param {Date} [startDate] Specifies view start date. Defaults to view visible range start
   * @param {Date} [endDate] Specifies view end date. Defaults to view visible range end
   * @returns {Boolean} `true` if the range should be rendered and `false` otherwise.
   */
  shouldRenderRange(range, startDate = this.client.visibleDateRange.startDate, endDate = this.client.visibleDateRange.endDate) {
    const { timeAxis } = this.client, { startDate: rangeStart, endDate: rangeEnd, duration } = range;
    return Boolean(rangeStart && (timeAxis.isContinuous || timeAxis.isTimeSpanInAxis(range)) && DateHelper.intersectSpans(
      startDate,
      endDate,
      rangeStart,
      // Lines are included longer, to make sure label does not disappear
      duration ? rangeEnd : DateHelper.add(rangeStart, this._lineBufferDurationMS)
    ));
  }
  getRangeDomConfig(timeRange, minDate, maxDate, relativeTo = 0) {
    const me = this, { client } = me, { rtl } = client, startPos = client.getCoordinateFromDate(DateHelper.max(timeRange.startDate, minDate), {
      respectExclusion: true
    }) - relativeTo, endPos = timeRange.endDate ? client.getCoordinateFromDate(DateHelper.min(timeRange.endDate, maxDate), {
      respectExclusion: true,
      isEnd: true
    }) - relativeTo : startPos, size = Math.abs(endPos - startPos), isRange = size > 0, translateX = rtl ? `calc(${startPos}px - 100%)` : `${startPos}px`;
    return {
      className: {
        [me.baseCls]: 1,
        [me.cls]: me.cls,
        [me.rangeCls]: isRange,
        [me.lineCls]: !isRange,
        [timeRange.cls]: timeRange.cls,
        "b-narrow-range": isRange && size < me.narrowThreshold,
        "b-readonly": timeRange.readOnly,
        "b-rtl": rtl
      },
      dataset: {
        id: timeRange.id
      },
      elementData: {
        timeRange
      },
      style: client.isVertical ? `transform: translateY(${translateX}); ${isRange ? `height:${size}px` : ""};` : `transform: translateX(${translateX}); ${isRange ? `width:${size}px` : ""};`
    };
  }
  renderRange(timeRange, startDate, endDate) {
    const me = this, { client } = me, { timeAxis } = client;
    if (me.shouldRenderRange(timeRange, startDate, endDate) && timeAxis.startDate) {
      const config = me.getRangeDomConfig(timeRange, timeAxis.startDate, timeAxis.endDate), icon = timeRange.iconCls && StringHelper.xss`<i class="${timeRange.iconCls}"></i>`, name = timeRange.name && StringHelper.encodeHtml(timeRange.name), labelTpl = name || icon ? `${icon || ""}<label>${name || "&nbsp;"}</label>` : "", bodyConfig = {
        ...config,
        style: config.style + (timeRange.style || ""),
        html: me.bodyRenderer ? me.bodyRenderer({ timeRange }) : me.showHeaderElements && !me.showLabelInBody ? "" : labelTpl
      };
      let headerConfig;
      if (me.showHeaderElements) {
        headerConfig = {
          ...config,
          html: me.headerRenderer ? me.headerRenderer({ timeRange }) : me.showLabelInBody ? "" : labelTpl
        };
      }
      return { bodyConfig, headerConfig };
    }
  }
  // Cache label rotation to not have to calculate for each occurrence when using recurring timeranges
  cacheRotation(range, bodyElement) {
    if (!range.iconCls && !range.name || !range.duration) {
      return;
    }
    const label = bodyElement.firstElementChild;
    if (label && !range.recurringTimeSpan) {
      this._labelRotationMap[range.id] = this.client.isVertical ? label.offsetHeight < bodyElement.offsetHeight : label.offsetWidth > bodyElement.offsetWidth;
    }
  }
  applyRotation(range, bodyElement) {
    var _a, _b, _c;
    const rotate = this._labelRotationMap[(_b = (_a = range.recurringTimeSpan) == null ? void 0 : _a.id) != null ? _b : range.id];
    (_c = bodyElement.firstElementChild) == null ? void 0 : _c.classList.toggle("b-vertical", Boolean(rotate));
  }
  getBodyElementByRecord(idOrRecord) {
    const id = typeof idOrRecord === "string" ? idOrRecord : idOrRecord == null ? void 0 : idOrRecord.id;
    return id != null && DomSync.getChild(this.bodyCanvas, id);
  }
  // Implement in subclasses
  resolveTimeRangeRecord(el) {
  }
  get headerContainerElement() {
    const me = this, { isVertical, timeView, timeAxisColumn } = me.client;
    if (!me._headerContainerElement) {
      if (isVertical && timeView.element) {
        me._headerContainerElement = timeView.element.parentElement;
      } else if (!isVertical) {
        me._headerContainerElement = timeAxisColumn.element;
      }
    }
    return me._headerContainerElement;
  }
  //endregion
  //region Settings
  get showHeaderElements() {
    return !this.client.hideHeaders && this._showHeaderElements;
  }
  updateShowHeaderElements(show) {
    const { client } = this;
    if (!this.isConfiguring) {
      client.element.classList.toggle("b-sch-timeranges-with-headerelements", Boolean(show));
      this.renderRanges();
    }
  }
  //endregion
  //region Menu items
  /**
   * Adds menu items for the context menu, and may mutate the menu configuration.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateTimeAxisHeaderMenu({ column, items }) {
  }
  //endregion
  //region Events & hooks
  onInternalPaint({ firstPaint }) {
    if (firstPaint && this.client.isHorizontal) {
      this.onUIReady();
    }
  }
  onSchedulerHorizontalScroll() {
    this.client.isHorizontal && this.renderRanges();
  }
  afterScroll() {
    this.client.isVertical && this.renderRanges();
  }
  updateLineBuffer() {
    const { timeAxisViewModel } = this.client;
    this._lineBufferDurationMS = timeAxisViewModel.getDateFromPosition(300) - timeAxisViewModel.getDateFromPosition(0);
  }
  onInternalResize(element, newWidth, newHeight, oldWidth, oldHeight) {
    if (this.client.isVertical && oldHeight !== newHeight) {
      this.renderRanges();
    }
  }
  onTimeAxisViewModelUpdate() {
    this.updateLineBuffer();
    this.refresh();
  }
  onTimeRangeClick(event) {
    const timeRangeRecord = this.resolveTimeRangeRecord(event.target);
    this.client.trigger(`timeRangeHeader${StringHelper.capitalize(event.type)}`, { event, domEvent: event, timeRangeRecord });
  }
  //endregion
  //region Drag drop
  showTip(context) {
    const me = this;
    if (me.showTooltip) {
      me.clockTemplate = new ClockTemplate({
        scheduler: me.client
      });
      me.tip = new Tooltip(ObjectHelper.assign({
        id: `${me.client.id}-time-range-tip`,
        cls: "b-interaction-tooltip",
        align: "b-t",
        autoShow: true,
        updateContentOnMouseMove: true,
        forElement: context.element,
        getHtml: () => me.getTipHtml(context.record, context.element)
      }, me.showTooltip));
    }
  }
  destroyTip() {
    if (this.tip) {
      this.tip.destroy();
      this.tip = null;
    }
  }
  isElementDraggable(el) {
    el = el.closest(this.baseSelector + ":not(.b-resizing):not(.b-readonly)");
    return el && !el.classList.contains("b-over-resize-handle");
  }
  onDragStart({ context }) {
    const { client, drag } = this;
    if (client.isVertical) {
      drag.minY = 0;
      drag.maxY = client.timeAxisViewModel.totalSize - context.element.offsetHeight;
      drag.minX = 0;
      drag.maxX = Number.MAX_SAFE_INTEGER;
    } else {
      drag.minX = 0;
      drag.maxX = client.timeAxisViewModel.totalSize - context.element.offsetWidth;
      drag.minY = 0;
      drag.maxY = Number.MAX_SAFE_INTEGER;
    }
    client.element.classList.add("b-dragging-timerange");
  }
  onDrop({ context }) {
    this.client.element.classList.remove("b-dragging-timerange");
  }
  onInvalidDrop() {
    this.drag.reset();
    this.client.element.classList.remove("b-dragging-timerange");
    this.destroyTip();
  }
  updateDateIndicator({ startDate, endDate }) {
    const me = this, { tip } = me, endDateElement = tip.element.querySelector(".b-sch-tooltip-enddate");
    me.clockTemplate.updateDateIndicator(tip.element, startDate);
    endDateElement && me.clockTemplate.updateDateIndicator(endDateElement, endDate);
  }
  onDrag({ context }) {
    const me = this, { client } = me, box = Rectangle.from(context.element), startPos = box.getStart(client.rtl, client.isHorizontal), endPos = box.getEnd(client.rtl, client.isHorizontal), startDate = client.getDateFromCoordinate(startPos, "round", false), endDate = client.getDateFromCoordinate(endPos, "round", false);
    me.updateDateIndicator({ startDate, endDate });
  }
  onDragReset() {
  }
  // endregion
  // region Resize
  onResizeStart() {
    var _a;
    this.client.element.classList.add("b-resizing-timerange");
    (_a = this.hoverTooltip) == null ? void 0 : _a.hide();
  }
  onResizeDrag() {
  }
  onResize() {
  }
  onInvalidResize() {
  }
  onResizeReset() {
    this.client.element.classList.remove("b-resizing-timerange");
  }
  //endregion
  //region Tooltip
  /**
   * Generates the html to display in the tooltip during drag drop.
   *
   */
  getTipHtml(record, element) {
    const me = this, { client } = me, box = Rectangle.from(element), startPos = box.getStart(client.rtl, client.isHorizontal), endPos = box.getEnd(client.rtl, client.isHorizontal), startDate = client.getDateFromCoordinate(startPos, "round", false), endDate = record.endDate && client.getDateFromCoordinate(endPos, "round", false), startText = client.getFormattedDate(startDate), endText = endDate && client.getFormattedEndDate(endDate, startDate);
    return me.dragTipTemplate({
      name: record.name || "",
      startDate,
      endDate,
      startText,
      endText,
      startClockHtml: me.clockTemplate.template({
        date: startDate,
        text: startText,
        cls: "b-sch-tooltip-startdate"
      }),
      endClockHtml: endText && me.clockTemplate.template({
        date: endDate,
        text: endText,
        cls: "b-sch-tooltip-enddate"
      })
    });
  }
  //endregion
};
__publicField(AbstractTimeRanges, "configurable", {
  /**
   * Set to `false` to not render range elements into the time axis header
   * @prp {Boolean}
   * @default
   * @category Common
   */
  showHeaderElements: true
});
// Plugin configuration. This plugin chains some functions in Grid.
__publicField(AbstractTimeRanges, "pluginConfig", {
  chain: [
    "onInternalPaint",
    "populateTimeAxisHeaderMenu",
    "onSchedulerHorizontalScroll",
    "afterScroll",
    "onInternalResize"
  ]
});
AbstractTimeRanges._$name = "AbstractTimeRanges";

// ../Scheduler/lib/Scheduler/feature/ColumnLines.js
var emptyObject = Object.freeze({});
var ColumnLines = class extends InstancePlugin.mixin(AttachToProjectMixin_default, Delayable_default) {
  //region Config
  static get $name() {
    return "ColumnLines";
  }
  static get delayable() {
    return {
      refresh: {
        type: "raf",
        cancelOutstanding: true
      }
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      after: ["render", "updateCanvasSize", "internalOnVisibleDateRangeChange", "onVisibleResourceRangeChange"]
    };
  }
  //endregion
  //region Init & destroy
  attachToResourceStore(resourceStore) {
    const { client } = this;
    super.attachToResourceStore(resourceStore);
    if (client.isVertical) {
      client.resourceStore.ion({
        name: "resourceStore",
        group({ groupers }) {
          if (groupers.length === 0) {
            this.refresh();
          }
        },
        thisObj: this
      });
    }
  }
  doDisable(disable) {
    super.doDisable(disable);
    if (!this.isConfiguring) {
      this.refresh();
    }
  }
  //endregion
  //region Draw
  /**
   * Draw lines when scheduler/gantt is rendered.
   * @private
   */
  render() {
    this.refresh();
  }
  getColumnLinesDOMConfig(startDate, endDate) {
    var _a;
    const me = this, { client } = me, { rtl } = client, m = rtl ? -1 : 1, {
      timeAxisViewModel,
      isHorizontal,
      resourceStore,
      variableColumnWidths
    } = client, { columnConfig } = timeAxisViewModel;
    const linesForLevel = timeAxisViewModel.columnLinesFor, majorLinesForLevel = Math.max(linesForLevel - 1, 0), start = startDate.getTime(), end = endDate.getTime(), domConfigs = [], dates = /* @__PURE__ */ new Set(), dimension = isHorizontal ? "X" : "Y";
    if (!me.disabled) {
      const addLineConfig = (tick, isMajor) => {
        const tickStart = tick.start.getTime();
        if (tickStart > start && tickStart < end && !dates.has(tickStart)) {
          dates.add(tickStart);
          domConfigs.push({
            role: "presentation",
            className: isMajor ? "b-column-line-major" : "b-column-line",
            style: {
              transform: `translate${dimension}(${tick.coord * m}px)`
            },
            dataset: {
              line: isMajor ? `major-${tick.index}` : `line-${tick.index}`
            }
          });
        }
      };
      if (linesForLevel !== majorLinesForLevel) {
        for (let i = 1; i <= columnConfig[majorLinesForLevel].length - 1; i++) {
          addLineConfig(columnConfig[majorLinesForLevel][i], true);
        }
      }
      for (let i = 1; i <= columnConfig[linesForLevel].length - 1; i++) {
        addLineConfig(columnConfig[linesForLevel][i], false);
      }
      if (!isHorizontal && client.columnLines) {
        const { columnWidth } = client.resourceColumns;
        let {
          first: firstResource,
          last: lastResource
        } = client.currentOrientation.getResourceRange(true);
        let nbrGroupHeaders = 0;
        if (firstResource > -1) {
          for (let i = firstResource; i < lastResource + 1; i++) {
            const resourceRecord = resourceStore.getAt(i);
            if (resourceRecord.isGroupHeader) {
              lastResource++;
              nbrGroupHeaders++;
              continue;
            }
            const instanceMeta = resourceRecord.instanceMeta(resourceStore), left = variableColumnWidths ? instanceMeta.insetStart + resourceRecord.columnWidth - 1 : (i - nbrGroupHeaders + 1) * columnWidth - 1, groupParent = (_a = resourceRecord.groupParent) == null ? void 0 : _a.get(client.resourceStore.id);
            domConfigs.push({
              className: {
                "b-column-line": 1,
                "b-resource-column-line": 1,
                "b-resource-group-divider": resourceStore.isGrouped && (groupParent == null ? void 0 : groupParent.groupChildren[(groupParent == null ? void 0 : groupParent.groupChildren.length) - 1]) === resourceRecord
              },
              style: {
                transform: `translateX(${left * m}px)`
              },
              dataset: {
                line: `resource-${i}`
              }
            });
          }
        }
      }
    }
    return domConfigs;
  }
  /**
   * Draw column lines that are in view
   * @private
   */
  refresh() {
    const me = this, { client } = me, { timeAxis } = client, { startDate, endDate } = client.visibleDateRange || emptyObject, axisStart = timeAxis.startDate;
    if (!axisStart || !startDate || me.client.timeAxisSubGrid.collapsed) {
      return;
    }
    if (!me.element) {
      me.element = DomHelper.createElement({
        parent: client.timeAxisSubGridElement,
        className: "b-column-lines-canvas b-sch-canvas"
      });
    }
    const domConfigs = me.getColumnLinesDOMConfig(startDate, endDate);
    DomSync.sync({
      targetElement: me.element,
      domConfig: {
        onlyChildren: true,
        children: domConfigs,
        syncOptions: {
          // When zooming in and out we risk getting a lot of released lines if we do not limit it
          releaseThreshold: 4
        }
      },
      syncIdField: "line"
    });
  }
  //endregion
  //region Events
  // Called when visible date range changes, for example from zooming, scrolling, resizing
  internalOnVisibleDateRangeChange() {
    this.refresh();
  }
  // Called when visible resource range changes, for example on scroll and resize
  onVisibleResourceRangeChange({ firstResource, lastResource }) {
    this.refresh();
  }
  updateCanvasSize() {
    this.refresh();
  }
  //endregion
};
ColumnLines._$name = "ColumnLines";
GridFeatureManager.registerFeature(ColumnLines, true, ["Scheduler", "Gantt", "TimelineHistogram"]);

// ../Scheduler/lib/Scheduler/feature/mixin/DependencyCreation.js
var DependencyCreation_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static get $name() {
      return "DependencyCreation";
    }
    static get defaultConfig() {
      return {
        /**
         * `false` to not show a tooltip while creating a dependency
         * @config {Boolean}
         * @default
         * @category Dependency creation
         */
        showCreationTooltip: true,
        /**
         * A tooltip config object that will be applied to the dependency creation {@link Core.widget.Tooltip}
         * @config {TooltipConfig}
         * @category Dependency creation
         */
        creationTooltip: null,
        /**
         * A template function that will be called to generate the HTML contents of the dependency creation tooltip.
         * You can return either an HTML string or a {@link DomConfig} object.
         * @prp {Function} creationTooltipTemplate
         * @param {Object} data Data about the dependency being created
         * @param {Scheduler.model.TimeSpan} data.source The from event
         * @param {Scheduler.model.TimeSpan} data.target The target event
         * @param {String} data.fromSide The from side (start, end, top, bottom)
         * @param {String} data.toSide The target side (start, end, top, bottom)
         * @param {Boolean} data.valid The validity of the dependency
         * @returns {String|DomConfig}
         * @category Dependency creation
         */
        /**
         * CSS class used for terminals
         * @config {String}
         * @default
         * @category Dependency terminals
         */
        terminalCls: "b-sch-terminal",
        /**
         * Where (on event bar edges) to display terminals. The sides are `'start'`, `'top'`,
         * `'end'` and `'bottom'`
         * @config {String[]}
         * @category Dependency terminals
         */
        terminalSides: ["start", "top", "end", "bottom"],
        /**
         * Set to `false` to not allow creating dependencies
         * @config {Boolean}
         * @default
         * @category Dependency creation
         */
        allowCreate: true
      };
    }
    //endregion
    //region Init & destroy
    construct(client, config) {
      super.construct(client, config);
      const me = this;
      me.eventName = client.scheduledEventName;
      client.ion({ readOnly: () => me.updateCreateListeners() });
      me.updateCreateListeners();
      me.chain(client, "onElementTouchMove", "onElementTouchMove");
    }
    doDestroy() {
      var _a2, _b;
      const me = this;
      me.detachListeners("view");
      me.creationData = null;
      (_a2 = me.pointerUpMoveDetacher) == null ? void 0 : _a2.call(me);
      (_b = me.creationTooltip) == null ? void 0 : _b.destroy();
      super.doDestroy();
    }
    updateCreateListeners() {
      const me = this;
      if (!me.client) {
        return;
      }
      me.detachListeners("view");
      if (me.isCreateAllowed) {
        me.client.ion({
          name: "view",
          [`${me.eventName}MouseEnter`]: "onTimeSpanMouseEnter",
          [`${me.eventName}MouseLeave`]: "onTimeSpanMouseLeave",
          thisObj: me
        });
      }
    }
    set allowCreate(value) {
      this._allowCreate = value;
      this.updateCreateListeners();
    }
    get allowCreate() {
      return this._allowCreate;
    }
    get isCreateAllowed() {
      return this.allowCreate && !this.client.readOnly && !this.disabled;
    }
    //endregion
    //region Terminal settings
    updateTerminalOffset(offset) {
      this.client.whenVisible(() => {
        this.client.foregroundCanvas.style.setProperty("--scheduler-dependency-terminal-offset", `${-offset}px`);
      });
    }
    updateTerminalSize(size) {
      if (typeof size === "number") {
        size = `${size}px`;
      }
      this.client.whenVisible(() => {
        this.client.foregroundCanvas.style.setProperty("--scheduler-dependency-terminal-size", size ? `${size}` : null);
      });
    }
    //endregion
    //region Events
    /**
     * Show terminals when mouse enters event/task element
     * @private
     */
    onTimeSpanMouseEnter({
      event,
      source,
      [`${this.eventName}Record`]: record,
      [`${this.eventName}Element`]: element,
      resourceRecord
    }) {
      if (!record.isCreating && !record.readOnly) {
        const me = this, { creationData, client } = me, eventBarElement = DomHelper.down(element, source.eventInnerSelector);
        if (record !== (creationData == null ? void 0 : creationData.source)) {
          const { parent } = record;
          if (record.isEventModel && parent && !parent.isRoot && client.eventStore.includes(parent)) {
            const parentElement = client.getElementFromEventRecord(parent, resourceRecord, true);
            parentElement && me.delayHideTerminals(parentElement);
          }
          me.delayShowTerminals(record, element);
          if (creationData && event.target.closest(client.eventSelector)) {
            creationData.timeSpanElement = eventBarElement;
            me.onOverTargetEventBar(event);
          }
        }
      }
    }
    /**
     * Hide terminals when mouse leaves event/task element
     * @private
     */
    onTimeSpanMouseLeave(event) {
      var _a2, _b, _c, _d;
      const me = this, { creationData, client } = me, { eventRecord, event: domEvent } = event, toEvent = (_a2 = domEvent.relatedTarget) == null ? void 0 : _a2.closest(client.eventSelector), toEventRecord = (_d = (_b = toEvent == null ? void 0 : toEvent.elementData) == null ? void 0 : _b.eventRecord) != null ? _d : (_c = toEvent == null ? void 0 : toEvent.elementData) == null ? void 0 : _c.taskRecord, { parent } = eventRecord != null ? eventRecord : {}, element = event[`${me.eventName}Element`];
      if (!domEvent) {
        return;
      }
      if (domEvent.isTrusted || VersionHelper.isTestEnv || creationData) {
        me.delayHideTerminals(element);
      }
      if (parent && !parent.isRoot && client.eventStore.includes(parent)) {
        const parentElement = client.getElementFromEventRecord(parent);
        parentElement && me.delayShowTerminals(parent, parentElement);
      }
      if (creationData) {
        me.onOverNewTargetWhileCreating(domEvent.relatedTarget, !(toEventRecord == null ? void 0 : toEventRecord.readOnly) && !(toEventRecord == null ? void 0 : toEventRecord.isOccurence) ? toEventRecord : null, domEvent);
      }
    }
    onTerminalMouseOver(event) {
      this.clearTimeout(`hide-${event.target.closest(this.client.eventSelector).dataset.syncId}`);
      if (this.creationData) {
        this.onOverTargetEventBar(event);
      }
    }
    /**
     * Remove hover styling when mouse leaves terminal. Also hides terminals when mouse leaves one it and not creating a
     * dependency.
     * @private
     */
    onTerminalMouseOut(event) {
      var _a2, _b, _c, _d;
      const me = this, { creationData, client } = me, fromEvent = event.target.closest(client.eventSelector), toEvent = (_a2 = event.relatedTarget) == null ? void 0 : _a2.closest(client.eventSelector), toEventRecord = (_d = (_b = toEvent == null ? void 0 : toEvent.elementData) == null ? void 0 : _b.eventRecord) != null ? _d : (_c = toEvent == null ? void 0 : toEvent.elementData) == null ? void 0 : _c.taskRecord;
      if (toEvent !== fromEvent && fromEvent && !me.hasTimeout(`show-${fromEvent.dataset.syncId}`) && (!creationData || fromEvent !== creationData.timeSpanElement)) {
        me.delayHideTerminals(fromEvent);
        client.unhover(fromEvent, event);
      }
      if (creationData) {
        me.onOverNewTargetWhileCreating(event.relatedTarget, !(toEventRecord == null ? void 0 : toEventRecord.readOnly) && !(toEventRecord == null ? void 0 : toEventRecord.isOccurence) ? toEventRecord : null, event);
      }
    }
    /**
     * Start creating a dependency when mouse is pressed over terminal
     * @private
     */
    onTerminalPointerDown(event) {
      var _a2;
      const me = this;
      if (event.button === 0 && !me.creationData) {
        const { client } = me, timeAxisSubGridElement = client.timeAxisSubGridElement, terminalNode = event.target, timeSpanElement = terminalNode.closest(client.eventInnerSelector), viewBounds = Rectangle.from(client.element, document.body);
        event.stopPropagation();
        me.creationData = {
          sourceElement: timeSpanElement,
          source: client.resolveTimeSpanRecord(timeSpanElement).$original,
          fromSide: terminalNode.dataset.side,
          startPoint: Rectangle.from(terminalNode, timeAxisSubGridElement).center,
          startX: event.pageX - viewBounds.x + client.scrollLeft,
          startY: event.pageY - viewBounds.y + client.scrollTop,
          valid: false,
          sourceResource: (_a2 = client.resolveResourceRecord) == null ? void 0 : _a2.call(client, event),
          tooltip: me.creationTooltip
        };
        me.pointerUpMoveDetacher = EventHelper.on({
          pointerup: {
            element: client.element.getRootNode(),
            handler: "onMouseUp",
            passive: false
          },
          pointermove: {
            element: timeAxisSubGridElement,
            handler: "onMouseMove",
            passive: false
          },
          thisObj: me
        });
        me.documentPointerUpDetacher = EventHelper.on({
          pointerup: {
            element: document,
            handler: "onDocumentMouseUp"
          },
          keydown: {
            element: document,
            handler: ({ key }) => {
              if (key === "Escape") {
                me.abort();
              }
            }
          },
          thisObj: me
        });
      }
    }
    onElementTouchMove(event) {
      var _a2;
      (_a2 = super.onElementTouchMove) == null ? void 0 : _a2.call(this, event);
      if (this.connector) {
        event.preventDefault();
      }
    }
    /**
     * Update connector line showing dependency between source and target when mouse moves. Also check if mouse is over
     * a valid target terminal
     * @private
     */
    onMouseMove(event) {
      const me = this, { client, creationData: data } = me, viewBounds = Rectangle.from(client.element, document.body), deltaX = event.pageX - viewBounds.x + client.scrollLeft - data.startX, deltaY = event.pageY - viewBounds.y + client.scrollTop - data.startY, length = Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY)) - 3, angle = Math.atan2(deltaY, deltaX);
      let { connector } = me;
      if (!connector) {
        if (me.onRequestDragCreate(event) === false) {
          return;
        }
        connector = me.connector;
      }
      connector.style.width = `${length}px`;
      connector.style.transform = `rotate(${angle}rad)`;
      me.lastMouseMoveEvent = event;
    }
    onRequestDragCreate(event) {
      const me = this, { client, creationData: data } = me;
      if (client.trigger("beforeDependencyCreateDrag", { data, source: data.source }) === false) {
        me.abort();
        return false;
      }
      client.element.classList.add("b-creating-dependency");
      me.createConnector(data.startPoint.x, data.startPoint.y);
      client.trigger("dependencyCreateDragStart", { data, source: data.source });
      if (me.showCreationTooltip) {
        const tip = me.creationTooltip || (me.creationTooltip = me.createDragTooltip());
        me.creationData.tooltip = tip;
        tip.disabled = false;
        tip.show();
        tip.onMouseMove(event);
      }
      client.scrollManager.startMonitoring({
        scrollables: [
          {
            element: client.timeAxisSubGrid.scrollable.element,
            direction: "horizontal"
          },
          {
            element: client.scrollable.element,
            direction: "vertical"
          }
        ],
        callback: () => me.lastMouseMoveEvent && me.onMouseMove(me.lastMouseMoveEvent)
      });
    }
    onOverTargetEventBar(event) {
      const me = this, { client, creationData: data, allowDropOnEventBar } = me, { target } = event;
      let overEventRecord = client.resolveTimeSpanRecord(target).$original;
      if (overEventRecord == null ? void 0 : overEventRecord.isEventSegment) {
        overEventRecord = overEventRecord.event;
      }
      if (Objects.isPromise(data.valid) || !allowDropOnEventBar && !target.classList.contains(me.terminalCls)) {
        return;
      }
      if (overEventRecord !== data.source) {
        me.onOverNewTargetWhileCreating(target, overEventRecord, event);
      }
    }
    async onOverNewTargetWhileCreating(targetElement, overEventRecord, event) {
      var _a2, _b;
      const me = this, { client, creationData: data, allowDropOnEventBar, connector } = me;
      if (Objects.isPromise(data.valid)) {
        return;
      }
      if (data.finalizing) {
        return;
      }
      if (!connector) {
        return;
      }
      connector.classList.remove("b-valid", "b-invalid");
      data.timeSpanElement && DomHelper.removeClsGlobally(data.timeSpanElement, "b-sch-terminal-active");
      if (!overEventRecord || overEventRecord === data.source || !allowDropOnEventBar && !targetElement.classList.contains(me.terminalCls)) {
        data.target = data.toSide = null;
        data.valid = false;
        connector.classList.add("b-invalid");
      } else {
        const target = data.target = overEventRecord, { source } = data;
        let toSide = targetElement.dataset.side;
        if (allowDropOnEventBar && !targetElement.classList.contains(me.terminalCls)) {
          toSide = me.getTargetSideFromType(me.dependencyStore.modelClass.fieldMap.type.defaultValue || DependencyBaseModel.Type.EndToStart);
        }
        if (client.resolveResourceRecord) {
          data.targetResource = client.resolveResourceRecord(event);
        }
        let dependencyType;
        data.toSide = toSide;
        const fromSide = data.fromSide, updateValidity = (valid2) => {
          if (!me.isDestroyed) {
            data.valid = valid2;
            targetElement.classList.add(valid2 ? "b-valid" : "b-invalid");
            connector.classList.add(valid2 ? "b-valid" : "b-invalid");
            client.trigger("dependencyValidationComplete", {
              data,
              source,
              target,
              dependencyType
            });
          }
        };
        switch (true) {
          case (fromSide === "start" && toSide === "start"):
            dependencyType = DependencyBaseModel.Type.StartToStart;
            break;
          case (fromSide === "start" && toSide === "end"):
            dependencyType = DependencyBaseModel.Type.StartToEnd;
            break;
          case (fromSide === "end" && toSide === "start"):
            dependencyType = DependencyBaseModel.Type.EndToStart;
            break;
          case (fromSide === "end" && toSide === "end"):
            dependencyType = DependencyBaseModel.Type.EndToEnd;
            break;
        }
        client.trigger("dependencyValidationStart", {
          data,
          source,
          target,
          dependencyType
        });
        let valid = data.valid = me.dependencyStore.isValidDependency(source, target, dependencyType);
        if (Objects.isPromise(valid)) {
          valid = await valid;
          updateValidity(valid);
        } else {
          updateValidity(valid);
        }
        const validityCls = valid ? "b-valid" : "b-invalid";
        connector.classList.add(validityCls);
        (_b = (_a2 = data.timeSpanElement) == null ? void 0 : _a2.querySelector(`.${me.terminalCls}[data-side=${toSide}]`)) == null ? void 0 : _b.classList.add("b-sch-terminal-active", validityCls);
      }
      me.updateCreationTooltip();
    }
    /**
     * Create a new dependency if mouse release over valid terminal. Hides connector
     * @private
     */
    async onMouseUp() {
      var _a2;
      const me = this, data = me.creationData;
      data.finalizing = true;
      (_a2 = me.pointerUpMoveDetacher) == null ? void 0 : _a2.call(me);
      if (data.valid) {
        const result = await me.client.trigger("beforeDependencyCreateFinalize", data);
        if (result === false) {
          data.valid = false;
        } else if (Objects.isPromise(data.valid)) {
          data.valid = await data.valid;
        }
        if (data.valid) {
          let dependency = me.createDependency(data);
          if (dependency !== null) {
            if (Objects.isPromise(dependency)) {
              dependency = await dependency;
            }
            data.dependency = dependency;
            me.client.trigger("dependencyCreateDrop", { data, source: data.source, target: data.target, dependency });
            me.doAfterDependencyDrop(data);
          }
        } else {
          me.doAfterDependencyDrop(data);
        }
      } else {
        data.valid = false;
        me.doAfterDependencyDrop(data);
      }
      me.abort();
    }
    doAfterDependencyDrop(data) {
      this.client.trigger("afterDependencyCreateDrop", {
        data,
        ...data
      });
    }
    onDocumentMouseUp({ target }) {
      if (!this.client.timeAxisSubGridElement.contains(target)) {
        this.abort();
      }
    }
    /**
     * Aborts dependency creation, removes proxy and cleans up listeners
     * @category Dependency creation
     */
    abort() {
      var _a2, _b;
      const me = this, { client, creationData } = me;
      if (creationData) {
        const { source, sourceResource, target, targetResource } = creationData;
        if (source) {
          const el = client.getElementFromEventRecord(source, sourceResource);
          if (el) {
            me.hideTerminals(el);
          }
        }
        if (target) {
          const el = client.getElementFromEventRecord(target, targetResource);
          if (el) {
            me.hideTerminals(el);
          }
        }
      }
      if (me.creationTooltip) {
        me.creationTooltip.disabled = true;
      }
      me.creationData = me.lastMouseMoveEvent = null;
      (_a2 = me.pointerUpMoveDetacher) == null ? void 0 : _a2.call(me);
      (_b = me.documentPointerUpDetacher) == null ? void 0 : _b.call(me);
      me.removeConnector();
    }
    //endregion
    //region Connector
    /**
     * Creates a connector line that visualizes dependency source & target
     * @private
     */
    createConnector(x, y) {
      const me = this, { client } = me;
      me.clearTimeout(me.removeConnectorTimeout);
      me.connector = DomHelper.createElement({
        parent: client.timeAxisSubGridElement,
        className: `${me.baseCls}-connector`,
        style: `left:${x}px;top:${y}px`
      });
      client.element.classList.add("b-creating-dependency");
    }
    createDragTooltip() {
      const me = this, { client } = me;
      return me.creationTooltip = Tooltip.new({
        id: `${client.id}-dependency-drag-tip`,
        cls: "b-sch-dependency-creation-tooltip",
        loadingMsg: "",
        anchorToTarget: false,
        // Keep tip visible until drag drop operation is finalized
        forElement: client.timeAxisSubGridElement,
        trackMouse: true,
        // Do not constrain at all, want it to be able to go outside of the viewport to not get in the way
        constrainTo: null,
        header: {
          dock: "right"
        },
        internalListeners: {
          // Show initial content immediately
          beforeShow: "updateCreationTooltip",
          thisObj: me
        }
      }, me.creationTooltip);
    }
    /**
     * Remove connector
     * @private
     */
    removeConnector() {
      const me = this, { connector, client } = me;
      if (connector) {
        connector.classList.add("b-removing");
        connector.style.width = "0";
        me.removeConnectorTimeout = me.setTimeout(() => {
          connector.remove();
          me.connector = null;
        }, 200);
      }
      client.element.classList.remove("b-creating-dependency");
      me.creationTooltip && me.creationTooltip.hide();
      client.scrollManager.stopMonitoring();
    }
    //endregion
    //region Terminals
    delayShowTerminals(timeSpanRecord, element) {
      const me = this, { syncId } = element.dataset;
      me.clearTimeout(`hide-${syncId}`);
      me.clearTimeout(`show-${syncId}`);
      element.classList.remove("b-hiding-terminals");
      if (!me.terminalShowDelay) {
        me.showTerminals(timeSpanRecord, element);
      } else {
        me.setTimeout({
          fn: () => me.showTerminals(timeSpanRecord, element),
          name: `show-${syncId}`,
          args: [timeSpanRecord, element],
          delay: me.terminalShowDelay
        });
      }
    }
    delayHideTerminals(element) {
      const me = this, { syncId } = element.dataset;
      me.clearTimeout(`hide-${syncId}`);
      me.clearTimeout(`show-${syncId}`);
      element.classList.add("b-hiding-terminals");
      if (!me.terminalHideDelay) {
        me.hideTerminals(element);
      } else {
        me.setTimeout({
          fn: () => me.hideTerminals(element),
          name: `hide-${syncId}`,
          args: [element],
          delay: me.terminalHideDelay
        });
      }
    }
    /**
     * Show terminals for specified event at sides defined in #terminalSides.
     * @param {Scheduler.model.TimeSpan} timeSpanRecord Event/task to show terminals for
     * @param {HTMLElement} [element] Event/task element, defaults to using the first element found for the task
     * @category Dependency creation
     */
    showTerminals(timeSpanRecord, element = this.client.getElementFromEventRecord(timeSpanRecord)) {
      const me = this;
      if (!me.isCreateAllowed || !timeSpanRecord.project || !element) {
        return;
      }
      const { client } = me, cls = me.terminalCls, terminalsVisibleCls = `${cls}s-visible`;
      if (me.showingTerminalsFor) {
        me.hideTerminals(me.showingTerminalsFor);
      }
      element = DomHelper.down(element, me.client.eventInnerSelector);
      if (!element.classList.contains(terminalsVisibleCls) && !client.element.classList.contains("b-resizing-event") && !client.readOnly) {
        if (client.trigger("beforeShowTerminals", { source: timeSpanRecord }) === false) {
          return;
        }
        DomHelper.createElement({
          parent: element.closest(client.eventSelector),
          className: "b-sch-terminal-hover-area"
        });
        me.terminalSides.forEach((side) => {
          side = me.fixSide(side);
          const terminal = DomHelper.createElement({
            parent: element,
            className: `${cls} ${cls}-${side}`,
            dataset: {
              side,
              feature: true
            }
          });
          terminal.detacher = EventHelper.on({
            element: terminal,
            mouseover: "onTerminalMouseOver",
            mouseout: "onTerminalMouseOut",
            // Needs to be pointerdown to match DragHelper, otherwise will be preventing wrong event
            pointerdown: {
              handler: "onTerminalPointerDown",
              capture: true
            },
            thisObj: me
          });
        });
        element.classList.add(terminalsVisibleCls);
        timeSpanRecord.internalCls.add(terminalsVisibleCls);
      }
    }
    fixSide(side) {
      if (side === "left") {
        return "start";
      }
      if (side === "right") {
        return "end";
      }
      return side;
    }
    /**
     * Hide terminals for specified event
     * @param {HTMLElement} eventElement Event element
     * @category Dependency creation
     */
    hideTerminals(eventElement) {
      var _a2;
      const me = this, { client } = me, eventParams = client.getTimeSpanMouseEventParams(eventElement), timeSpanRecord = eventParams == null ? void 0 : eventParams[`${me.eventName}Record`], terminalsVisibleCls = `${me.terminalCls}s-visible`;
      (_a2 = eventElement.querySelector(".b-sch-terminal-hover-area")) == null ? void 0 : _a2.remove();
      DomHelper.forEachSelector(eventElement, `> ${client.eventInnerSelector} > .${me.terminalCls}`, (terminal) => {
        var _a3;
        (_a3 = terminal.detacher) == null ? void 0 : _a3.call(terminal);
        terminal.remove();
      });
      DomHelper.down(eventElement, client.eventInnerSelector).classList.remove(terminalsVisibleCls);
      timeSpanRecord == null ? void 0 : timeSpanRecord.internalCls.remove(terminalsVisibleCls);
      eventElement.classList.remove("b-hiding-terminals");
    }
    //endregion
    //region Dependency creation
    /**
     * Create a new dependency from source terminal to target terminal
     * @internal
     */
    createDependency(data) {
      const { source, target, fromSide, toSide } = data, type = (fromSide === "start" ? 0 : 2) + (toSide === "end" ? 1 : 0);
      const newDependency = this.dependencyStore.add({
        from: source.id,
        to: target.id,
        type,
        fromSide,
        toSide
      });
      return newDependency !== null ? newDependency[0] : null;
    }
    getTargetSideFromType(type) {
      if (type === DependencyBaseModel.Type.StartToStart || type === DependencyBaseModel.Type.EndToStart) {
        return "start";
      }
      return "end";
    }
    //endregion
    //region Tooltip
    /**
     * Update dependency creation tooltip
     * @private
     */
    updateCreationTooltip() {
      const me = this;
      if (!me.showCreationTooltip) {
        return;
      }
      const data = me.creationData, { valid } = data, tip = me.creationTooltip, { classList } = tip.element;
      if (Objects.isPromise(valid)) {
        classList.remove("b-invalid");
        classList.add("b-checking");
        return new Promise((resolve) => valid.then((valid2) => {
          data.valid = valid2;
          if (!tip.isDestroyed) {
            resolve(me.updateCreationTooltip());
          }
        }));
      }
      tip.html = me.creationTooltipTemplate(data);
    }
    creationTooltipTemplate(data) {
      var _a2, _b;
      const me = this, { tooltip, valid } = data, { classList } = tooltip.element;
      Object.assign(data, {
        fromText: StringHelper.encodeHtml(data.source.name),
        toText: StringHelper.encodeHtml((_b = (_a2 = data.target) == null ? void 0 : _a2.name) != null ? _b : ""),
        fromSide: data.fromSide,
        toSide: data.toSide || ""
      });
      let tipTitleIconClsSuffix, tipTitleText;
      classList.toggle("b-invalid", !valid);
      classList.remove("b-checking");
      if (valid === true) {
        tipTitleIconClsSuffix = "valid";
        tipTitleText = me.L("L{Dependencies.valid}");
      } else {
        tipTitleIconClsSuffix = "invalid";
        tipTitleText = me.L("L{Dependencies.invalid}");
      }
      tooltip.title = `<i class="b-icon b-icon-${tipTitleIconClsSuffix}"></i>${tipTitleText}`;
      return {
        children: [{
          className: "b-sch-dependency-tooltip",
          children: [
            { dataset: { ref: "fromLabel" }, tag: "label", text: me.L("L{Dependencies.from}") },
            { dataset: { ref: "fromText" }, text: data.fromText },
            { dataset: { ref: "fromBox" }, className: `b-sch-box b-${data.fromSide}` },
            { dataset: { ref: "toLabel" }, tag: "label", text: me.L("L{Dependencies.to}") },
            { dataset: { ref: "toText" }, text: data.toText },
            { dataset: { ref: "toBox" }, className: `b-sch-box b-${data.toSide}` }
          ]
        }]
      };
    }
    //endregion
    doDisable(disable) {
      if (!this.isConfiguring) {
        this.updateCreateListeners();
      }
      super.doDisable(disable);
    }
  }, //region Config
  __publicField(_a, "configurable", {
    /**
     * `false` to require a drop on a target event bar side circle to define the dependency type.
     * If dropped on the event bar, the `defaultValue` of the DependencyModel `type` field will be used to
     * determine the target task side.
     *
     * @prp {Boolean}
     * @default
     * @category Dependency creation
     */
    allowDropOnEventBar: true,
    /**
     * Terminal diameter in px, overrides the default CSS value for it (which might depend on theme).
     *
     * {@note}
     * Use an even number to avoid cropped terminals.
     * {/@note}
     *
     * Also accepts a string value representing a CSS size, e.g. '1.5em'.
     *
     * @prp {Number|String}
     * @category Dependency terminals
     */
    terminalSize: null,
    /**
     * Terminal offset from their initial position, in px. Positive values move terminals further away from the
     * event bar, negative values inside the event bar.
     *
     * @prp {Number}
     * @default 0
     * @category Dependency terminals
     */
    terminalOffset: null,
    /**
     * Delay in ms before showing the terminals when hovering over an event bar.
     *
     * Can be used for a more "stable" UI, where the terminals are not shown immediately when hovering over an event
     * bar and thus have fewer things moving when mouse is moved quickly over multiple event bars.
     *
     * @prp {Number}
     * @default 0
     * @category Dependency terminals
     */
    terminalShowDelay: 0,
    /**
     * Delay in ms before hiding the terminals when the mouse leaves an event bar or terminal.
     *
     * Can be used to make the UI more forgiving, accidentally leaving the event bar or terminal will not
     * immediately hide the terminals.
     *
     * Can also be used to play a hide animation, set a `terminalHideDelay` that is longer than your animation's
     * duration. The `b-hiding-terminals` CSS class is added to the event wrapper while the terminals are being
     * hidden.
     *
     * @prp {Number}
     * @default 0
     * @category Dependency terminals
     */
    terminalHideDelay: 0
  }), _a;
};

// ../Scheduler/lib/Scheduler/util/RectangularPathFinder.js
var THRESHOLD = Math.min(1 / globalThis.devicePixelRatio, 0.75);
var BOX_PROPERTIES = ["start", "end", "top", "bottom"];
var equalEnough = (a, b) => Math.abs(a - b) < 0.1;
var sideToSide = {
  l: "left",
  r: "right",
  t: "top",
  b: "bottom"
};
var RectangularPathFinder = class _RectangularPathFinder extends Base {
  static get configurable() {
    return {
      /**
       * Default start connection side: 'left', 'right', 'top', 'bottom'
       * @config {'top'|'bottom'|'left'|'right'}
       * @default
       */
      startSide: "right",
      // /**
      //  * Default start arrow size in pixels
      //  * @config {Number}
      //  * @default
      //  */
      // startArrowSize : 0,
      /**
       * Default start arrow staff size in pixels
       * @config {Number}
       * @default
       */
      startArrowMargin: 12,
      /**
       * Default starting connection point shift from box's arrow pointing side middle point
       * @config {Number}
       * @default
       */
      startShift: 0,
      /**
       * Default end arrow pointing direction, possible values are: 'left', 'right', 'top', 'bottom'
       * @config {'top'|'bottom'|'left'|'right'}
       * @default
       */
      endSide: "left",
      // /**
      //  * Default end arrow size in pixels
      //  * @config {Number}
      //  * @default
      //  */
      // endArrowSize : 0,
      /**
       * Default end arrow staff size in pixels
       * @config {Number}
       * @default
       */
      endArrowMargin: 12,
      /**
       * Default ending connection point shift from box's arrow pointing side middle point
       * @config {Number}
       * @default
       */
      endShift: 0,
      /**
       * Start / End box vertical margin, the amount of pixels from top and bottom line of a box where drawing
       * is prohibited
       * @config {Number}
       * @default
       */
      verticalMargin: 2,
      /**
       * Start / End box horizontal margin, the amount of pixels from left and right line of a box where drawing
       * @config {Number}
       * @default
       */
      horizontalMargin: 5,
      /**
       * Other rectangular areas (obstacles) to search path through
       * @config {Object[]}
       * @default
       */
      otherBoxes: null,
      /**
       * The owning Scheduler. Mandatory so that it can determin RTL state.
       * @config {Scheduler.view.Scheduler}
       * @private
       */
      client: {}
    };
  }
  /**
   * Returns list of horizontal and vertical segments connecting two boxes
   * <pre>
   *    |    | |  |    |       |
   *  --+----+----+----*-------*---
   *  --+=>Start  +----*-------*--
   *  --+----+----+----*-------*--
   *    |    | |  |    |       |
   *    |    | |  |    |       |
   *  --*----*-+-------+-------+--
   *  --*----*-+         End <=+--
   *  --*----*-+-------+-------+--
   *    |    | |  |    |       |
   * </pre>
   * Path goes by lines (-=) and turns at intersections (+), boxes depicted are adjusted by horizontal/vertical
   * margin and arrow margin, original boxes are smaller (path can't go at original box borders). Algorithm finds
   * the shortest path with minimum amount of turns. In short it's mix of "Lee" and "Dijkstra pathfinding"
   * with turns amount taken into account for distance calculation.
   *
   * The algorithm is not very performant though, it's O(N^2), where N is amount of
   * points in the grid, but since the maximum amount of points in the grid might be up to 34 (not 36 since
   * two box middle points are not permitted) that might be ok for now.
   *
   * @param {Object} lineDef An object containing any of the class configuration option overrides as well
   *                         as `startBox`, `endBox`, `startHorizontalMargin`, `startVerticalMargin`,
   *                         `endHorizontalMargin`, `endVerticalMargin` properties
   * @param {Object} lineDef.startBox An object containing `start`, `end`, `top`, `bottom` properties
   * @param {Object} lineDef.endBox   An object containing `start`, `end`, `top`, `bottom` properties
   * @param {Number} lineDef.startHorizontalMargin Horizontal margin override for start box
   * @param {Number} lineDef.startVerticalMargin   Vertical margin override for start box
   * @param {Number} lineDef.endHorizontalMargin   Horizontal margin override for end box
   * @param {Number} lineDef.endVerticalMargin     Vertical margin override for end box
   *
   *
   * @returns {Object[]|Boolean} Array of line segments or false if path cannot be found
   * @returns {Number} return.x1
   * @returns {Number} return.y1
   * @returns {Number} return.x2
   * @returns {Number} return.y2
   */
  //
  //@ignore
  //@privateparam {Function[]|Function} noPathFallbackFn
  //     A function or array of functions which will be tried in case a path can't be found
  //     Each function will be given a line definition it might try to adjust somehow and return.
  //     The new line definition returned will be tried to find a path.
  //     If a function returns false, then next function will be called if any.
  //
  findPath(lineDef, noPathFallbackFn) {
    const me = this, originalLineDef = lineDef;
    let lineDefFull, startBox, endBox, startShift, endShift, startSide, endSide, startArrowMargin, endArrowMargin, horizontalMargin, verticalMargin, startHorizontalMargin, startVerticalMargin, endHorizontalMargin, endVerticalMargin, otherHorizontalMargin, otherVerticalMargin, otherBoxes, connStartPoint, connEndPoint, pathStartPoint, pathEndPoint, gridStartPoint, gridEndPoint, startGridBox, endGridBox, grid, path, tryNum;
    noPathFallbackFn = ArrayHelper.asArray(noPathFallbackFn);
    for (tryNum = 0; lineDef && !path; ) {
      lineDefFull = Object.assign(me.config, lineDef);
      startBox = lineDefFull.startBox;
      endBox = lineDefFull.endBox;
      startShift = lineDefFull.startShift;
      endShift = lineDefFull.endShift;
      startSide = lineDefFull.startSide;
      endSide = lineDefFull.endSide;
      startArrowMargin = lineDefFull.startArrowMargin;
      endArrowMargin = lineDefFull.endArrowMargin;
      horizontalMargin = lineDefFull.horizontalMargin;
      verticalMargin = lineDefFull.verticalMargin;
      startHorizontalMargin = lineDefFull.hasOwnProperty("startHorizontalMargin") ? lineDefFull.startHorizontalMargin : horizontalMargin;
      startVerticalMargin = lineDefFull.hasOwnProperty("startVerticalMargin") ? lineDefFull.startVerticalMargin : verticalMargin;
      endHorizontalMargin = lineDefFull.hasOwnProperty("endHorizontalMargin") ? lineDefFull.endHorizontalMargin : horizontalMargin;
      endVerticalMargin = lineDefFull.hasOwnProperty("endVerticalMargin") ? lineDefFull.endVerticalMargin : verticalMargin;
      otherHorizontalMargin = lineDefFull.hasOwnProperty("otherHorizontalMargin") ? lineDefFull.otherHorizontalMargin : horizontalMargin;
      otherVerticalMargin = lineDefFull.hasOwnProperty("otherVerticalMargin") ? lineDefFull.otherVerticalMargin : verticalMargin;
      otherBoxes = lineDefFull.otherBoxes;
      startSide = me.normalizeSide(startSide);
      endSide = me.normalizeSide(endSide);
      connStartPoint = me.getConnectionCoordinatesFromBoxSideShift(startBox, startSide, startShift);
      connEndPoint = me.getConnectionCoordinatesFromBoxSideShift(endBox, endSide, endShift);
      startGridBox = me.calcGridBaseBoxFromBoxAndDrawParams(startBox, startSide, startArrowMargin, startHorizontalMargin, startVerticalMargin);
      endGridBox = me.calcGridBaseBoxFromBoxAndDrawParams(endBox, endSide, endArrowMargin, endHorizontalMargin, endVerticalMargin);
      BOX_PROPERTIES.forEach((property) => {
        if (Math.abs(startGridBox[property] - endGridBox[property]) <= THRESHOLD) {
          endGridBox[property] = startGridBox[property];
        }
      });
      if (me.shouldLookForPath(startBox, endBox, startGridBox, endGridBox)) {
        otherBoxes = otherBoxes == null ? void 0 : otherBoxes.map(
          (box) => me.calcGridBaseBoxFromBoxAndDrawParams(box, false, 0, otherHorizontalMargin, otherVerticalMargin)
        );
        pathStartPoint = me.getConnectionCoordinatesFromBoxSideShift(startGridBox, startSide, startShift);
        pathEndPoint = me.getConnectionCoordinatesFromBoxSideShift(endGridBox, endSide, endShift);
        grid = me.buildPathGrid(startGridBox, endGridBox, pathStartPoint, pathEndPoint, startSide, endSide, otherBoxes);
        gridStartPoint = me.convertDecartPointToGridPoint(grid, pathStartPoint);
        gridEndPoint = me.convertDecartPointToGridPoint(grid, pathEndPoint);
        path = me.findPathOnGrid(grid, gridStartPoint, gridEndPoint, startSide, endSide);
      }
      for (lineDef = false; !path && !lineDef && noPathFallbackFn && tryNum < noPathFallbackFn.length; tryNum++) {
        lineDef = noPathFallbackFn[tryNum](lineDefFull, originalLineDef);
      }
    }
    if (path) {
      path = me.prependPathWithArrowStaffSegment(path, connStartPoint, startSide);
      path = me.appendPathWithArrowStaffSegment(path, connEndPoint, endSide);
      path = me.optimizePath(path);
    }
    return path;
  }
  // Compares boxes relative position in the given direction.
  //  0 - 1 is to the left/top of 2
  //  1 - 1 overlaps with left/top edge of 2
  //  2 - 1 is inside 2
  // -2 - 2 is inside 1
  //  3 - 1 overlaps with right/bottom edge of 2
  //  4 - 1 is to the right/bottom of 2
  static calculateRelativePosition(box1, box2, vertical = false) {
    const startProp = vertical ? "top" : "start", endProp = vertical ? "bottom" : "end";
    let result;
    if (box1[endProp] < box2[startProp]) {
      result = 0;
    } else if (box1[endProp] <= box2[endProp] && box1[endProp] >= box2[startProp] && box1[startProp] < box2[startProp]) {
      result = 1;
    } else if (box1[startProp] >= box2[startProp] && box1[endProp] <= box2[endProp]) {
      result = 2;
    } else if (box1[startProp] < box2[startProp] && box1[endProp] > box2[endProp]) {
      result = -2;
    } else if (box1[startProp] <= box2[endProp] && box1[endProp] > box2[endProp]) {
      result = 3;
    } else {
      result = 4;
    }
    return result;
  }
  // Checks if relative position of the original and marginized boxes is the same
  static boxOverlapChanged(startBox, endBox, gridStartBox, gridEndBox, vertical = false) {
    const calculateOverlap = _RectangularPathFinder.calculateRelativePosition, originalOverlap = calculateOverlap(startBox, endBox, vertical), finalOverlap = calculateOverlap(gridStartBox, gridEndBox, vertical);
    return originalOverlap !== finalOverlap;
  }
  shouldLookForPath(startBox, endBox, gridStartBox, gridEndBox) {
    let result = true;
    if (
      // We refer to the original arrow margins because during lookup those might be nullified and we need some
      // criteria to tell if events are too narrow
      (startBox.end - startBox.start <= this.startArrowMargin || endBox.end - endBox.start <= this.endArrowMargin) && Math.abs(_RectangularPathFinder.calculateRelativePosition(startBox, endBox, true)) === 2
    ) {
      result = !_RectangularPathFinder.boxOverlapChanged(startBox, endBox, gridStartBox, gridEndBox);
    }
    return result;
  }
  getConnectionCoordinatesFromBoxSideShift(box, side, shift) {
    let coords;
    switch (side) {
      case "left":
        coords = {
          x: box.start,
          y: (box.top + box.bottom) / 2 + shift
        };
        break;
      case "right":
        coords = {
          x: box.end,
          y: (box.top + box.bottom) / 2 + shift
        };
        break;
      case "top":
        coords = {
          x: (box.start + box.end) / 2 + shift,
          y: box.top
        };
        break;
      case "bottom":
        coords = {
          x: (box.start + box.end) / 2 + shift,
          y: box.bottom
        };
        break;
    }
    return coords;
  }
  calcGridBaseBoxFromBoxAndDrawParams(box, side, arrowMargin, horizontalMargin, verticalMargin) {
    let gridBox;
    switch (this.normalizeSide(side)) {
      case "left":
        gridBox = {
          start: box.start - Math.max(
            /*arrowSize + */
            arrowMargin,
            horizontalMargin
          ),
          end: box.end + horizontalMargin,
          top: box.top - verticalMargin,
          bottom: box.bottom + verticalMargin
        };
        break;
      case "right":
        gridBox = {
          start: box.start - horizontalMargin,
          end: box.end + Math.max(
            /*arrowSize + */
            arrowMargin,
            horizontalMargin
          ),
          top: box.top - verticalMargin,
          bottom: box.bottom + verticalMargin
        };
        break;
      case "top":
        gridBox = {
          start: box.start - horizontalMargin,
          end: box.end + horizontalMargin,
          top: box.top - Math.max(
            /*arrowSize + */
            arrowMargin,
            verticalMargin
          ),
          bottom: box.bottom + verticalMargin
        };
        break;
      case "bottom":
        gridBox = {
          start: box.start - horizontalMargin,
          end: box.end + horizontalMargin,
          top: box.top - verticalMargin,
          bottom: box.bottom + Math.max(
            /*arrowSize + */
            arrowMargin,
            verticalMargin
          )
        };
        break;
      default:
        gridBox = {
          start: box.start - horizontalMargin,
          end: box.end + horizontalMargin,
          top: box.top - verticalMargin,
          bottom: box.bottom + verticalMargin
        };
    }
    return gridBox;
  }
  normalizeSide(side) {
    const { rtl } = this.client;
    (side2) => sideToSide[side2] || side2;
    if (side === "start") {
      return rtl ? "right" : "left";
    }
    if (side === "end") {
      return rtl ? "left" : "right";
    }
    return side;
  }
  buildPathGrid(startGridBox, endGridBox, pathStartPoint, pathEndPoint, startSide, endSide, otherGridBoxes) {
    let xs, ys, y, x, ix, iy, xslen, yslen, ib, blen, box, permitted, point;
    const points = {}, linearPoints = [];
    xs = [
      startGridBox.start,
      startSide === "left" || startSide === "right" ? (startGridBox.start + startGridBox.end) / 2 : pathStartPoint.x,
      startGridBox.end,
      endGridBox.start,
      endSide === "left" || endSide === "right" ? (endGridBox.start + endGridBox.end) / 2 : pathEndPoint.x,
      endGridBox.end
    ];
    ys = [
      startGridBox.top,
      startSide === "top" || startSide === "bottom" ? (startGridBox.top + startGridBox.bottom) / 2 : pathStartPoint.y,
      startGridBox.bottom,
      endGridBox.top,
      endSide === "top" || endSide === "bottom" ? (endGridBox.top + endGridBox.bottom) / 2 : pathEndPoint.y,
      endGridBox.bottom
    ];
    if (otherGridBoxes) {
      otherGridBoxes.forEach((box2) => {
        xs.push(box2.start, (box2.start + box2.end) / 2, box2.end);
        ys.push(box2.top, (box2.top + box2.bottom) / 2, box2.bottom);
      });
    }
    xs = [...new Set(xs.sort((a, b) => a - b))];
    ys = [...new Set(ys.sort((a, b) => a - b))];
    for (iy = 0, yslen = ys.length; iy < yslen; ++iy) {
      points[iy] = points[iy] || {};
      y = ys[iy];
      for (ix = 0, xslen = xs.length; ix < xslen; ++ix) {
        x = xs[ix];
        permitted = (x <= startGridBox.start || x >= startGridBox.end || y <= startGridBox.top || y >= startGridBox.bottom) && (x <= endGridBox.start || x >= endGridBox.end || y <= endGridBox.top || y >= endGridBox.bottom);
        if (otherGridBoxes) {
          for (ib = 0, blen = otherGridBoxes.length; permitted && ib < blen; ++ib) {
            box = otherGridBoxes[ib];
            permitted = x <= box.start || x >= box.end || y <= box.top || y >= box.bottom || // Allow point if it is a path start/end even if point is inside any box
            x === pathStartPoint.x && y === pathStartPoint.y || x === pathEndPoint.x && y === pathEndPoint.y;
          }
        }
        point = {
          distance: Number.MAX_SAFE_INTEGER,
          permitted,
          x,
          y,
          ix,
          iy
        };
        points[iy][ix] = point;
        linearPoints.push(point);
      }
    }
    return {
      width: xs.length,
      height: ys.length,
      xs,
      ys,
      points,
      linearPoints
    };
  }
  convertDecartPointToGridPoint(grid, point) {
    const x = grid.xs.indexOf(point.x), y = grid.ys.indexOf(point.y);
    return grid.points[y][x];
  }
  findPathOnGrid(grid, gridStartPoint, gridEndPoint, startSide, endSide) {
    const me = this;
    let path = false;
    if (gridStartPoint.permitted && gridEndPoint.permitted) {
      grid = me.waveForward(grid, gridStartPoint, 0);
      path = me.collectPath(grid, gridEndPoint, endSide);
    }
    return path;
  }
  // Returns neighbors from Von Neiman ambit (see Lee pathfinding algorithm description)
  getGridPointNeighbors(grid, gridPoint, predicateFn) {
    const ix = gridPoint.ix, iy = gridPoint.iy, result = [];
    let neighbor;
    if (iy < grid.height - 1) {
      neighbor = grid.points[iy + 1][ix];
      (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
    }
    if (iy > 0) {
      neighbor = grid.points[iy - 1][ix];
      (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
    }
    if (ix < grid.width - 1) {
      neighbor = grid.points[iy][ix + 1];
      (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
    }
    if (ix > 0) {
      neighbor = grid.points[iy][ix - 1];
      (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
    }
    return result;
  }
  waveForward(grid, gridStartPoint, distance) {
    const me = this;
    WalkHelper.preWalkUnordered(
      // Walk starting point - a node is a grid point and it's distance from the starting point
      [gridStartPoint, distance],
      // Children query function
      // NOTE: It's important to fix neighbor distance first, before waving to a neighbor, otherwise waving might
      //       get through a neighbor point setting it's distance to a value more than (distance + 1) whereas we,
      //       at the children querying moment in time, already know that the possibly optimal distance is (distance + 1)
      ([point, distance2]) => me.getGridPointNeighbors(
        grid,
        point,
        (neighborPoint) => neighborPoint.permitted && neighborPoint.distance > distance2 + 1
      ).map(
        (neighborPoint) => [neighborPoint, distance2 + 1]
        // Neighbor distance fixation
      ),
      // Walk step iterator function
      ([point, distance2]) => point.distance = distance2
      // Neighbor distance applying
    );
    return grid;
  }
  collectPath(grid, gridEndPoint, endSide) {
    const me = this, path = [];
    let pathFound = true, neighbors, lowestDistanceNeighbor, xDiff, yDiff;
    while (pathFound && gridEndPoint.distance) {
      neighbors = me.getGridPointNeighbors(
        grid,
        gridEndPoint,
        (point) => point.permitted && point.distance === gridEndPoint.distance - 1
      );
      pathFound = neighbors.length > 0;
      if (pathFound) {
        neighbors = neighbors.sort((a, b) => {
          let xDiff2, yDiff2;
          xDiff2 = a.ix - gridEndPoint.ix;
          yDiff2 = a.iy - gridEndPoint.iy;
          const resultA = (endSide === "left" || endSide === "right") && yDiff2 === 0 || (endSide === "top" || endSide === "bottom") && xDiff2 === 0 ? -1 : 1;
          xDiff2 = b.ix - gridEndPoint.ix;
          yDiff2 = b.iy - gridEndPoint.iy;
          const resultB = (endSide === "left" || endSide === "right") && yDiff2 === 0 || (endSide === "top" || endSide === "bottom") && xDiff2 === 0 ? -1 : 1;
          if (resultA > resultB)
            return 1;
          if (resultA < resultB)
            return -1;
          if (resultA === resultB)
            return a.y > b.y ? -1 : 1;
        });
        lowestDistanceNeighbor = neighbors[0];
        path.push({
          x1: lowestDistanceNeighbor.x,
          y1: lowestDistanceNeighbor.y,
          x2: gridEndPoint.x,
          y2: gridEndPoint.y
        });
        xDiff = lowestDistanceNeighbor.ix - gridEndPoint.ix;
        yDiff = lowestDistanceNeighbor.iy - gridEndPoint.iy;
        switch (true) {
          case (!yDiff && xDiff > 0):
            endSide = "left";
            break;
          case (!yDiff && xDiff < 0):
            endSide = "right";
            break;
          case (!xDiff && yDiff > 0):
            endSide = "top";
            break;
          case (!xDiff && yDiff < 0):
            endSide = "bottom";
            break;
        }
        gridEndPoint = lowestDistanceNeighbor;
      }
    }
    return pathFound && path.reverse() || false;
  }
  prependPathWithArrowStaffSegment(path, connStartPoint, startSide) {
    if (path.length > 0) {
      const firstSegment = path[0], prependSegment = {
        x2: firstSegment.x1,
        y2: firstSegment.y1
      };
      switch (startSide) {
        case "left":
          prependSegment.x1 = connStartPoint.x;
          prependSegment.y1 = firstSegment.y1;
          break;
        case "right":
          prependSegment.x1 = connStartPoint.x;
          prependSegment.y1 = firstSegment.y1;
          break;
        case "top":
          prependSegment.x1 = firstSegment.x1;
          prependSegment.y1 = connStartPoint.y;
          break;
        case "bottom":
          prependSegment.x1 = firstSegment.x1;
          prependSegment.y1 = connStartPoint.y;
          break;
      }
      path.unshift(prependSegment);
    }
    return path;
  }
  appendPathWithArrowStaffSegment(path, connEndPoint, endSide) {
    if (path.length > 0) {
      const lastSegment = path[path.length - 1], appendSegment = {
        x1: lastSegment.x2,
        y1: lastSegment.y2
      };
      switch (endSide) {
        case "left":
          appendSegment.x2 = connEndPoint.x;
          appendSegment.y2 = lastSegment.y2;
          break;
        case "right":
          appendSegment.x2 = connEndPoint.x;
          appendSegment.y2 = lastSegment.y2;
          break;
        case "top":
          appendSegment.x2 = lastSegment.x2;
          appendSegment.y2 = connEndPoint.y;
          break;
        case "bottom":
          appendSegment.x2 = lastSegment.x2;
          appendSegment.y2 = connEndPoint.y;
          break;
      }
      path.push(appendSegment);
    }
    return path;
  }
  optimizePath(path) {
    const optPath = [];
    let prevSegment, curSegment;
    if (path.length > 0) {
      prevSegment = path.shift();
      optPath.push(prevSegment);
      while (path.length > 0) {
        curSegment = path.shift();
        if (equalEnough(prevSegment.x1, curSegment.x1) && equalEnough(prevSegment.y1, curSegment.y1) && equalEnough(prevSegment.x2, curSegment.x2) && equalEnough(prevSegment.y2, curSegment.y2)) {
          prevSegment = curSegment;
        } else if (equalEnough(prevSegment.y1, prevSegment.y2) && equalEnough(curSegment.y1, curSegment.y2)) {
          prevSegment.x2 = curSegment.x2;
        } else if (equalEnough(prevSegment.x1, prevSegment.x2) && equalEnough(curSegment.x1, curSegment.x2)) {
          prevSegment.y2 = curSegment.y2;
        } else {
          optPath.push(curSegment);
          prevSegment = curSegment;
        }
      }
    }
    return optPath;
  }
};
RectangularPathFinder._$name = "RectangularPathFinder";

// ../Scheduler/lib/Scheduler/feature/mixin/DependencyTooltip.js
var fromBoxSide = [
  "start",
  "start",
  "end",
  "end"
];
var toBoxSide = [
  "start",
  "end",
  "start",
  "end"
];
var DependencyTooltip_default = (Target) => {
  var _a;
  return _a = class extends Target {
    changeTooltip(tooltip, old) {
      const me = this;
      old == null ? void 0 : old.destroy();
      if (!me.showTooltip || !tooltip) {
        return null;
      }
      return Tooltip.new({
        align: "b-t",
        id: `${me.client.id}-dependency-tip`,
        forSelector: `.b-timelinebase:not(.b-eventeditor-editing,.b-taskeditor-editing,.b-resizing-event,.b-dragcreating,.b-dragging-event,.b-creating-dependency) .${me.baseCls}`,
        forElement: me.client.timeAxisSubGridElement,
        showOnHover: true,
        hoverDelay: 0,
        hideDelay: 0,
        anchorToTarget: false,
        textContent: false,
        // Skip max-width setting
        trackMouse: false,
        getHtml: me.getHoverTipHtml.bind(me)
      }, tooltip);
    }
    /**
     * Generates DomConfig content for the tooltip shown when hovering a dependency
     * @param {Object} tooltipConfig
     * @returns {DomConfig} DomConfig used as tooltips content
     * @private
     */
    getHoverTipHtml({ activeTarget }) {
      return this.tooltipTemplate(this.resolveDependencyRecord(activeTarget));
    }
  }, __publicField(_a, "$name", "DependencyTooltip"), __publicField(_a, "configurable", {
    /**
     * Set to `true` to show a tooltip when hovering a dependency line
     * @config {Boolean}
     * @default
     * @category Dependency tooltip
     */
    showTooltip: true,
    /**
     * Set to `true` to show the lag in the tooltip
     * @config {Boolean}
     * @default
     */
    showLagInTooltip: false,
    /**
     * A template function allowing you to configure the contents of the tooltip shown when hovering a
     * dependency line. You can return either an HTML string or a {@link DomConfig} object.
     * @prp {Function} tooltipTemplate
     * @param {Scheduler.model.DependencyBaseModel} dependency The dependency record
     * @returns {String|DomConfig}
     * @category Dependency tooltip
     */
    tooltipTemplate(dependency) {
      const me = this;
      return {
        children: [{
          className: "b-sch-dependency-tooltip",
          children: [
            { tag: "label", text: me.L("L{Dependencies.from}") },
            { text: dependency.fromEvent.name },
            { className: `b-sch-box b-${dependency.fromSide || fromBoxSide[dependency.type]}` },
            { tag: "label", text: me.L("L{Dependencies.to}") },
            { text: dependency.toEvent.name },
            { className: `b-sch-box b-${dependency.toSide || toBoxSide[dependency.type]}` },
            me.showLagInTooltip && { tag: "label", text: me.L("L{DependencyEdit.Lag}") },
            me.showLagInTooltip && { text: `${dependency.lag || 0} ${DateHelper.getLocalizedNameOfUnit(dependency.lagUnit, dependency.lag !== 1)}` }
          ]
        }]
      };
    },
    /**
     * A tooltip config object that will be applied to the dependency hover tooltip. Can be used to for example
     * customize delay
     * @config {TooltipConfig}
     * @category Dependency tooltip
     */
    tooltip: {
      $config: "nullify",
      value: {}
    }
  }), _a;
};

// ../Scheduler/lib/Scheduler/feature/mixin/DependencyGridCache.js
var ROWS_PER_CELL = 25;
var DependencyGridCache_default = (Target) => {
  var _a;
  return _a = class extends Target {
    constructor() {
      super(...arguments);
      __publicField(this, "gridCache", null);
    }
    // Dependencies that might intersect the current viewport and thus should be considered for drawing
    getDependenciesToConsider(startMS, endMS, startIndex, endIndex) {
      const me = this, { gridCache } = me, { timeAxis } = me.client;
      if (gridCache) {
        const dependencies = /* @__PURE__ */ new Set(), fromMSCell = Math.floor((startMS - timeAxis.startMS) / me.MS_PER_CELL), toMSCell = Math.floor((endMS - timeAxis.startMS) / me.MS_PER_CELL), fromRowCell = Math.floor(startIndex / ROWS_PER_CELL), toRowCell = Math.floor(endIndex / ROWS_PER_CELL);
        for (let i = fromMSCell; i <= toMSCell; i++) {
          const msCell = gridCache[i];
          if (msCell) {
            for (let j = fromRowCell; j <= toRowCell; j++) {
              const intersectingDependencies = msCell[j];
              if (intersectingDependencies) {
                for (let i2 = 0; i2 < intersectingDependencies.length; i2++) {
                  dependencies.add(intersectingDependencies[i2]);
                }
              }
            }
          }
        }
        return dependencies;
      }
    }
    // A (single) dependency was drawn, we might want to store info about it in the grid cache
    afterDrawDependency(dependency, fromIndex, toIndex, fromDateMS, toDateMS) {
      var _a2, _b;
      const me = this;
      if (me.constructGridCache) {
        const { MS_PER_CELL } = me, {
          startMS: timeAxisStartMS,
          endMS: timeAxisEndMS
        } = me.client.timeAxis, timeAxisCells = Math.ceil((timeAxisEndMS - timeAxisStartMS) / MS_PER_CELL), fromMSCell = Math.floor((fromDateMS - timeAxisStartMS) / MS_PER_CELL), toMSCell = Math.floor((toDateMS - timeAxisStartMS) / MS_PER_CELL), fromRowCell = Math.floor(fromIndex / ROWS_PER_CELL), toRowCell = Math.floor(toIndex / ROWS_PER_CELL), firstMSCell = Math.min(fromMSCell, toMSCell), lastMSCell = Math.max(fromMSCell, toMSCell), firstRowCell = Math.min(fromRowCell, toRowCell), lastRowCell = Math.max(fromRowCell, toRowCell);
        if (firstMSCell < 0 && lastMSCell < 0 || firstMSCell > timeAxisCells && lastMSCell > timeAxisCells) {
          return;
        }
        const startMSCell = Math.max(firstMSCell, 0), endMSCell = Math.min(lastMSCell, timeAxisCells);
        for (let i = startMSCell; i <= endMSCell; i++) {
          const msCell = (_a2 = me.gridCache[i]) != null ? _a2 : me.gridCache[i] = {};
          for (let j = firstRowCell; j <= lastRowCell; j++) {
            const rowCell = (_b = msCell[j]) != null ? _b : msCell[j] = [];
            rowCell.push(dependency);
          }
        }
      }
    }
    // All dependencies are about to be drawn, check if we need to build the grid cache
    beforeDraw() {
      const me = this;
      if (!me.gridCache) {
        const { visibleDateRange } = me.client;
        me.constructGridCache = true;
        me.MS_PER_CELL = Math.max(visibleDateRange.endMS - visibleDateRange.startMS, 1e3);
        me.gridCache = {};
      }
    }
    // All dependencies are drawn, we no longer need to rebuild the cache
    afterDraw() {
      this.constructGridCache = false;
    }
    reset() {
      this.gridCache = null;
    }
  }, __publicField(_a, "$name", "DependencyGridCache"), _a;
};

// ../Scheduler/lib/Scheduler/feature/mixin/DependencyLineGenerator.js
function drawingDirection(pointSet) {
  if (pointSet.x1 === pointSet.x2) {
    return pointSet.y2 > pointSet.y1 ? "d" : "u";
  }
  return pointSet.x2 > pointSet.x1 ? "r" : "l";
}
function segmentLength(pointSet) {
  return pointSet.x1 === pointSet.x2 ? pointSet.y2 - pointSet.y1 : pointSet.x2 - pointSet.x1;
}
function arc(pointSet, nextPointSet, radius) {
  const corner = drawingDirection(pointSet) + drawingDirection(nextPointSet), rx = radius * (corner.includes("l") ? -1 : 1), ry = radius * (corner.includes("u") ? -1 : 1), sweep = corner === "ur" || corner === "lu" || corner === "dl" || corner === "rd" ? 1 : 0;
  return `a${rx},${ry} 0 0 ${sweep} ${rx},${ry}`;
}
function line(pointSet, nextPointSet, location, radius, prevRadius) {
  let line2 = pointSet.x1 === pointSet.x2 ? "v" : "h", useRadius = radius;
  if (radius) {
    const length = segmentLength(pointSet), nextLength = nextPointSet ? Math.abs(segmentLength(nextPointSet)) : Number.MAX_SAFE_INTEGER, sign = Math.sign(length);
    if (prevRadius == null) {
      prevRadius = radius;
    }
    if (Math.abs(length) < radius * 2 || nextLength < radius * 2) {
      useRadius = Math.min(Math.abs(length), nextLength) / 2;
    }
    const subtract = location === "single" ? 0 : location === "first" ? useRadius : location === "between" ? prevRadius + useRadius : (
      /*last*/
      prevRadius
    ), useLength = length - subtract * sign;
    line2 += Math.sign(useLength) !== sign ? 0 : useLength;
    if (location !== "last" && location !== "single" && useRadius > 0) {
      line2 += ` ${arc(pointSet, nextPointSet, useRadius)}`;
    }
  } else {
    line2 += segmentLength(pointSet);
  }
  return {
    line: line2,
    currentRadius: radius !== useRadius ? useRadius : null
  };
}
function pathMapper(radius, points) {
  const { length } = points;
  if (!length) {
    return "";
  }
  let currentRadius = null;
  return `M${points[0].x1},${points[0].y1} ${points.map((pointSet, i) => {
    const location = length === 1 ? "single" : i === length - 1 ? "last" : i === 0 ? "first" : "between", lineSpec = line(pointSet, points[i + 1], location, radius, currentRadius);
    ({ currentRadius } = lineSpec);
    return lineSpec.line;
  }).join(" ")}`;
}
var DependencyLineGenerator_default = (Target) => {
  var _a;
  return _a = class extends Target {
    constructor() {
      super(...arguments);
      __publicField(this, "lineCache", {});
    }
    onSVGReady() {
      const me = this;
      me.pathFinder = new RectangularPathFinder({
        ...me.pathFinderConfig,
        client: me.client
      });
      me.lineDefAdjusters = me.createLineDefAdjusters();
      me.createMarker();
    }
    changeRadius(radius) {
      if (radius !== null) {
        ObjectHelper.assertNumber(radius, "radius");
      }
      return radius;
    }
    resetAtRuntime() {
      if (!this.isConfiguring) {
        this.reset();
      }
    }
    updateRadius() {
      this.resetAtRuntime();
    }
    updateRenderer() {
      this.resetAtRuntime();
    }
    changeClickWidth(width) {
      if (width !== null) {
        ObjectHelper.assertNumber(width, "clickWidth");
      }
      return width;
    }
    updateClickWidth() {
      this.resetAtRuntime();
    }
    updateDrawAroundParents() {
      this.resetAtRuntime();
    }
    //region Marker
    createMarker() {
      var _a2, _b;
      const me = this, { markerDef } = me, svg = this.client.svgCanvas, markerId = markerDef ? `${me.client.id}-arrowEnd` : "arrowEnd";
      (_a2 = me.marker) == null ? void 0 : _a2.remove();
      svg.style.setProperty("--scheduler-dependency-marker", `url(#${markerId})`);
      me.marker = DomHelper.createElement({
        parent: svg,
        id: markerId,
        tag: "marker",
        className: "b-sch-dependency-arrow",
        ns: "http://www.w3.org/2000/svg",
        markerHeight: 11,
        markerWidth: 11,
        refX: 8.5,
        refY: 3,
        viewBox: "0 0 9 6",
        orient: "auto-start-reverse",
        markerUnits: "userSpaceOnUse",
        retainElement: true,
        children: [{
          tag: "path",
          ns: "http://www.w3.org/2000/svg",
          d: (_b = me.markerDef) != null ? _b : "M3,0 L3,6 L9,3 z"
        }]
      });
    }
    updateMarkerDef() {
      if (!this.isConfiguring) {
        this.createMarker();
      }
    }
    //endregion
    //region DomConfig
    getAssignmentElement(assignment) {
      var _a2, _b;
      const proxyElement = (_b = (_a2 = this.client.features.eventDrag) == null ? void 0 : _a2.getProxyElement) == null ? void 0 : _b.call(_a2, assignment);
      return proxyElement || this.client.getElementFromAssignmentRecord(assignment);
    }
    // Generate a DomConfig for a dependency line between two assignments (tasks in Gantt)
    getDomConfigs(dependency, fromAssignment, toAssignment, forceBoxes) {
      var _a2, _b;
      const me = this, key = me.getDependencyKey(dependency, fromAssignment, toAssignment), cached = me.lineCache[key];
      if (me.constructLineCache || !cached || forceBoxes || me.drawingLive && (me.getAssignmentElement(fromAssignment) || me.getAssignmentElement(toAssignment))) {
        const lineDef = me.prepareLineDef(dependency, fromAssignment, toAssignment, forceBoxes), points = lineDef && me.pathFinder.findPath(lineDef, me.lineDefAdjusters), {
          client,
          clickWidth
        } = me, { toEvent } = dependency;
        if (points) {
          const highlighted = me.highlighted.get(dependency), domConfig = {
            tag: "path",
            ns: "http://www.w3.org/2000/svg",
            d: pathMapper((_a2 = me.radius) != null ? _a2 : 0, points),
            role: "presentation",
            dataset: {
              syncId: key,
              depId: dependency.id,
              fromId: fromAssignment.id,
              toId: toAssignment.id
            },
            elementData: {
              dependency,
              points
            },
            class: {
              [me.baseCls]: 1,
              [dependency.cls]: dependency.cls,
              // Data highlight
              [dependency.highlighted]: dependency.highlighted,
              // Feature highlight
              [highlighted && [...highlighted].join(" ")]: highlighted,
              [me.noMarkerCls]: lineDef.hideMarker,
              "b-inactive": dependency.active === false,
              "b-sch-bidirectional-line": dependency.bidirectional,
              "b-readonly": dependency.readOnly,
              // If target event is outside the view add special CSS class to hide marker (arrow)
              "b-sch-dependency-ends-outside": !toEvent.milestone && (toEvent.endDate <= client.startDate || client.endDate <= toEvent.startDate) || toEvent.milestone && (toEvent.endDate < client.startDate || client.endDate < toEvent.startDate)
            }
          };
          (_b = me.renderer) == null ? void 0 : _b.call(me, {
            domConfig,
            points,
            dependencyRecord: dependency,
            fromAssignmentRecord: fromAssignment,
            toAssignmentRecord: toAssignment,
            fromBox: lineDef.startBox,
            toBox: lineDef.endBox,
            fromSide: lineDef.startSide,
            toSide: lineDef.endSide
          });
          const configs = [domConfig];
          if (clickWidth > 1) {
            configs.push({
              ...domConfig,
              // Shallow on purpose, to not waste perf cloning deeply
              class: {
                ...domConfig.class,
                "b-click-area": 1
              },
              dataset: {
                ...domConfig.dataset,
                syncId: `${domConfig.dataset.syncId}-click-area`
              },
              style: {
                strokeWidth: clickWidth
              }
            });
          }
          return me.lineCache[key] = configs;
        }
        return me.lineCache[key] = null;
      }
      return cached;
    }
    //endregion
    //region Bounds
    // Generates `otherBoxes` config for rectangular path finder, which push dependency line to the row boundary.
    // It should be enough to return single box with top/bottom taken from row top/bottom and left/right taken from source
    // box, extended by start arrow margin to both sides.
    generateBoundaryBoxes(box, side) {
      if (side === "bottom") {
        return [
          {
            start: box.left,
            end: box.left + box.width / 2,
            top: box.rowTop,
            bottom: box.rowBottom
          },
          {
            start: box.left + box.width / 2,
            end: box.right,
            top: box.rowTop,
            bottom: box.rowBottom
          }
        ];
      } else {
        return [
          {
            start: box.left - this.pathFinder.startArrowMargin,
            end: box.right + this.pathFinder.startArrowMargin,
            top: box.rowTop,
            bottom: box.rowBottom
          }
        ];
      }
    }
    // Bounding box for an assignment, uses elements bounds if rendered
    getAssignmentBounds(assignment) {
      const { client } = this, element = this.getAssignmentElement(assignment);
      if (element && !client.isExporting) {
        const rectangle = Rectangle.from(element, this.relativeTo);
        if (client.isHorizontal) {
          let row = client.getRowById(assignment.resource.id);
          if (row) {
            if (rectangle.y < row.top || rectangle.bottom > row.bottom) {
              const overRow = client.rowManager.getRowAt(rectangle.center.y, true);
              if (overRow) {
                row = overRow;
              }
            }
            rectangle.rowTop = row.top;
            rectangle.rowBottom = row.bottom;
          } else {
            return client.getAssignmentEventBox(assignment, true);
          }
        }
        return rectangle;
      }
      return client.isEngineReady && client.getAssignmentEventBox(assignment, true);
    }
    //endregion
    //region Sides
    getConnectorStartSide(timeSpanRecord) {
      return this.client.currentOrientation.getConnectorStartSide(timeSpanRecord);
    }
    getConnectorEndSide(timeSpanRecord) {
      return this.client.currentOrientation.getConnectorEndSide(timeSpanRecord);
    }
    getDependencyStartSide(dependency) {
      const { fromEvent, type, fromSide } = dependency;
      if (fromSide) {
        return fromSide;
      }
      switch (true) {
        case type === DependencyModel.Type.StartToEnd:
        case type === DependencyModel.Type.StartToStart:
          return this.getConnectorStartSide(fromEvent);
        case type === DependencyModel.Type.EndToStart:
        case type === DependencyModel.Type.EndToEnd:
          return this.getConnectorEndSide(fromEvent);
        default:
          return this.getConnectorEndSide(fromEvent);
      }
    }
    getDependencyEndSide(dependency) {
      const { toEvent, type, toSide } = dependency;
      if (toSide) {
        return toSide;
      }
      switch (true) {
        case type === DependencyModel.Type.EndToEnd:
        case type === DependencyModel.Type.StartToEnd:
          return this.getConnectorEndSide(toEvent);
        case type === DependencyModel.Type.EndToStart:
        case type === DependencyModel.Type.StartToStart:
          return this.getConnectorStartSide(toEvent);
        default:
          return this.getConnectorStartSide(toEvent);
      }
    }
    //endregion
    //region Line def
    // An array of functions used to alter path config when no path found.
    // It first tries to shrink arrow margins and secondly hides arrows entirely
    createLineDefAdjusters() {
      var _a2;
      const { client } = this;
      function shrinkArrowMargins(lineDef) {
        const { barMargin } = client;
        if (lineDef.startArrowMargin > barMargin || lineDef.endArrowMargin > barMargin) {
          lineDef.startArrowMargin = lineDef.endArrowMargin = barMargin;
          return lineDef;
        }
        return false;
      }
      function resetArrowMargins(lineDef) {
        if (lineDef.startArrowMargin > 0 || lineDef.endArrowMargin > 0) {
          lineDef.startArrowMargin = lineDef.endArrowMargin = 0;
          return lineDef;
        }
        return false;
      }
      function shrinkHorizontalMargin(lineDef, originalLineDef) {
        if (lineDef.horizontalMargin > 2) {
          lineDef.horizontalMargin = 1;
          originalLineDef.hideMarker = true;
          return lineDef;
        }
        return false;
      }
      const adjusters = [
        shrinkArrowMargins,
        resetArrowMargins,
        shrinkHorizontalMargin
      ];
      if ((_a2 = client.features.nestedEvents) == null ? void 0 : _a2.enabled) {
        adjusters.unshift((lineDef) => {
          if (lineDef.otherBoxes.length) {
            lineDef.otherBoxes.length = lineDef.otherBoxes.nestedStart;
          }
          return lineDef;
        });
      }
      return adjusters;
    }
    // Overridden in Gantt
    adjustLineDef(dependency, lineDef) {
      return lineDef;
    }
    // Prepare data to feed to the path finder
    prepareLineDef(dependency, fromAssignment, toAssignment, forceBoxes) {
      var _a2, _b, _c, _d;
      const me = this, startSide = me.getDependencyStartSide(dependency), endSide = me.getDependencyEndSide(dependency), startRectangle = (_a2 = forceBoxes == null ? void 0 : forceBoxes.from) != null ? _a2 : me.getAssignmentBounds(fromAssignment), endRectangle = (_b = forceBoxes == null ? void 0 : forceBoxes.to) != null ? _b : me.getAssignmentBounds(toAssignment), otherBoxes = [];
      if (!startRectangle || !endRectangle) {
        return null;
      }
      let {
        startArrowMargin,
        verticalMargin
      } = me.pathFinder;
      if (me.client.isHorizontal) {
        if (startRectangle.rowTop != null && startRectangle.rowTop !== endRectangle.rowTop) {
          otherBoxes.push(...me.generateBoundaryBoxes(startRectangle, startSide));
        }
        if (((_c = me.client.features.nestedEvents) == null ? void 0 : _c.enabled) && me.drawAroundParents) {
          const { resourceStore } = me.client, fromResource = fromAssignment.resource, toResource = toAssignment.resource, fromIndex = resourceStore.indexOf(fromResource), toIndex = resourceStore.indexOf(toResource), minIndex = Math.min(fromIndex, toIndex), maxIndex = Math.max(fromIndex, toIndex);
          otherBoxes.nestedStart = otherBoxes.length;
          for (const assignment of me.client.assignmentStore) {
            if (assignment !== fromAssignment && assignment !== toAssignment && ((_d = assignment.event) == null ? void 0 : _d.isParent) && fromAssignment.event.parent !== assignment.event && toAssignment.event.parent !== assignment.event) {
              const currentIndex = resourceStore.indexOf(assignment.resource);
              if (currentIndex >= minIndex && currentIndex <= maxIndex) {
                const assignmentBox = me.getAssignmentBounds(assignment).inflate(startArrowMargin);
                assignmentBox.isNestedParent = true;
                otherBoxes.push(assignmentBox);
              }
            }
          }
        }
        if (!dependency.bidirectional) {
          if (/(top|bottom)/.test(startSide)) {
            startArrowMargin = me.client.barMargin / 2;
          }
          verticalMargin = me.client.barMargin / 2;
        }
      }
      return me.adjustLineDef(dependency, {
        startBox: startRectangle,
        endBox: endRectangle,
        otherBoxes,
        startArrowMargin,
        verticalMargin,
        otherVerticalMargin: 0,
        otherHorizontalMargin: 0,
        startSide,
        endSide
      });
    }
    //endregion
    //region Cache
    // All dependencies are about to be drawn, check if we need to build the line cache
    beforeDraw() {
      super.beforeDraw();
      if (!Object.keys(this.lineCache).length) {
        this.constructLineCache = true;
      }
    }
    // All dependencies are drawn, we no longer need to rebuild the cache
    afterDraw() {
      super.afterDraw();
      this.constructLineCache = false;
    }
    reset() {
      super.reset();
      this.lineCache = {};
    }
    //endregion
  }, __publicField(_a, "$name", "DependencyLineGenerator"), _a;
};

// ../Scheduler/lib/Scheduler/feature/Dependencies.js
var eventNameMap = {
  click: "Click",
  dblclick: "DblClick",
  contextmenu: "ContextMenu"
};
var emptyObject2 = Object.freeze({});
var collectLinkedAssignments = (assignment) => {
  var _a;
  const result = [assignment];
  if ((_a = assignment.resource) == null ? void 0 : _a.hasLinks) {
    result.push(...assignment.resource.$links.map((l) => ({
      id: `${l.id}_${assignment.id}`,
      resource: l,
      event: assignment.event,
      drawDependencies: assignment.drawDependencies
    })));
  }
  return result;
};
var Dependencies = class extends InstancePlugin.mixin(
  AttachToProjectMixin_default,
  Delayable_default,
  DependencyCreation_default,
  DependencyGridCache_default,
  DependencyLineGenerator_default,
  DependencyTooltip_default
) {
  constructor() {
    super(...arguments);
    __publicField(this, "domConfigs", /* @__PURE__ */ new Map());
    __publicField(this, "drawingLive", false);
    __publicField(this, "lastScrollX", null);
    __publicField(this, "highlighted", /* @__PURE__ */ new Map());
    // Cached lookups
    __publicField(this, "visibleResources", null);
    __publicField(this, "usingLinks", null);
    __publicField(this, "visibleDateRange", null);
    __publicField(this, "relativeTo", null);
  }
  static get pluginConfig() {
    return {
      chain: ["render", "onInternalPaint", "onElementClick", "onElementDblClick", "onElementContextMenu", "onElementMouseOver", "onElementMouseOut", "bindStore"],
      assign: ["getElementForDependency", "getElementsForDependency", "resolveDependencyRecord"]
    };
  }
  //endregion
  //region Init & destroy
  construct(client, config) {
    super.construct(client, config);
    const { scheduledEventName } = client;
    client.ion({
      svgCanvasCreated: "onSVGReady",
      // These events trigger live refresh behaviour
      animationStart: "refresh",
      // eventDrag in Scheduler, taskDrag in Gantt
      [scheduledEventName + "DragStart"]: "refresh",
      [scheduledEventName + "DragAbort"]: "refresh",
      [scheduledEventName + "ResizeStart"]: "refresh",
      [scheduledEventName + "SegmentDragStart"]: "refresh",
      [scheduledEventName + "SegmentResizeStart"]: "refresh",
      // These events shift the surroundings to such extent that grid cache needs rebuilding to be sure that
      // all dependencies are considered
      timelineViewportResize: "reset",
      timeAxisViewModelUpdate: "reset",
      toggleNode: "reset",
      thisObj: this
    });
    client.rowManager.ion({
      refresh: "reset",
      // For example when changing barMargin or rowHeight
      changeTotalHeight: "reset",
      // For example when collapsing groups
      thisObj: this
    });
    this.bindStore(client.store);
  }
  doDisable(disable) {
    if (!this.isConfiguring) {
      this._isDisabling = disable;
      this.draw();
      this._isDisabling = false;
    }
    super.doDisable(disable);
  }
  //endregion
  //region RefreshTriggers
  get rowStore() {
    return this.client.isVertical ? this.client.resourceStore : this.client.store;
  }
  // React to replacing or refreshing a display store
  bindStore(store) {
    const me = this;
    if (!me.client.isVertical) {
      me.detachListeners("store");
      if (me.client.usesDisplayStore) {
        store == null ? void 0 : store.ion({
          name: "store",
          refresh: "onStoreRefresh",
          thisObj: me
        });
        me.reset();
      }
    }
  }
  onStoreRefresh() {
    this.reset();
  }
  attachToProject(project) {
    super.attachToProject(project);
    project == null ? void 0 : project.ion({
      name: "project",
      commitFinalized: "reset",
      thisObj: this
    });
  }
  attachToResourceStore(resourceStore) {
    super.attachToResourceStore(resourceStore);
    resourceStore == null ? void 0 : resourceStore.ion({
      name: "resourceStore",
      change: "onResourceStoreChange",
      refresh: "onResourceStoreChange",
      thisObj: this
    });
  }
  onResourceStoreChange() {
    this.usingLinks = null;
    this.reset();
  }
  attachToEventStore(eventStore) {
    super.attachToEventStore(eventStore);
    eventStore == null ? void 0 : eventStore.ion({
      name: "eventStore",
      refresh: "reset",
      thisObj: this
    });
  }
  attachToAssignmentStore(assignmentStore) {
    super.attachToAssignmentStore(assignmentStore);
    assignmentStore == null ? void 0 : assignmentStore.ion({
      name: "assignmentStore",
      refresh: "reset",
      thisObj: this
    });
  }
  attachToDependencyStore(dependencyStore) {
    super.attachToDependencyStore(dependencyStore);
    dependencyStore == null ? void 0 : dependencyStore.ion({
      name: "dependencyStore",
      change: "reset",
      refresh: "reset",
      thisObj: this
    });
  }
  updateDrawOnScroll(drawOnScroll) {
    const me = this;
    me.detachListeners("scroll");
    if (drawOnScroll) {
      me.client.ion({
        name: "scroll",
        scroll: "doRefresh",
        horizontalScroll: "onHorizontalScroll",
        prio: -100,
        // After Scheduler draws on scroll, since we target elements
        thisObj: me
      });
    } else {
      me.client.scrollable.ion({
        name: "scroll",
        scrollEnd: "draw",
        thisObj: me
      });
      me.client.timeAxisSubGrid.scrollable.ion({
        name: "scroll",
        scrollEnd: "draw",
        thisObj: me
      });
    }
  }
  onHorizontalScroll({ subGrid, scrollX }) {
    if (scrollX !== this.lastScrollX && subGrid === this.client.timeAxisSubGrid) {
      this.lastScrollX = scrollX;
      this.draw();
    }
  }
  onInternalPaint() {
    this.refresh();
  }
  //endregion
  //region Dependency types
  // Used by DependencyField
  static getLocalizedDependencyType(type) {
    return type ? this.L(`L{DependencyType.${type}}`) : "";
  }
  //endregion
  //region Elements
  getElementForDependency(dependency, fromAssignment, toAssignment) {
    return this.getElementsForDependency(dependency, fromAssignment, toAssignment)[0];
  }
  // NOTE: If we ever make this public we should change it to use the syncIdMap. Currently not needed since only
  // used in tests
  getElementsForDependency(dependency, fromAssignment, toAssignment) {
    let selector = `[data-dep-id="${dependency.id}"]`;
    if (fromAssignment) {
      selector += `[data-from-id="${fromAssignment.id}"]`;
    }
    if (toAssignment) {
      selector += `[data-to-id="${toAssignment.id}"]`;
    }
    return Array.from(this.client.svgCanvas.querySelectorAll(selector));
  }
  /**
   * Returns the dependency record for a DOM element
   * @param {HTMLElement} element The dependency line element
   * @returns {Scheduler.model.DependencyModel} The dependency record
   */
  resolveDependencyRecord(element) {
    var _a;
    return (_a = element.elementData) == null ? void 0 : _a.dependency;
  }
  isDependencyElement(element) {
    return element.matches(`.${this.baseCls}`);
  }
  //endregion
  //region DOM Events
  onElementClick(event) {
    const dependency = this.resolveDependencyRecord(event.target);
    if (dependency) {
      const eventName = eventNameMap[event.type];
      this.client.trigger(`dependency${eventName}`, {
        dependency,
        event
      });
    }
  }
  onElementDblClick(event) {
    return this.onElementClick(event);
  }
  onElementContextMenu(event) {
    return this.onElementClick(event);
  }
  onElementMouseOver(event) {
    const me = this, dependency = me.resolveDependencyRecord(event.target);
    if (dependency) {
      me.client.trigger("dependencyMouseOver", {
        dependency,
        event
      });
      if (me.overCls) {
        me.highlight(dependency);
      }
    }
  }
  onElementMouseOut(event) {
    const me = this, dependency = me.resolveDependencyRecord(event.target);
    if (dependency) {
      me.client.trigger("dependencyMouseOut", {
        dependency,
        event
      });
      if (me.overCls) {
        me.unhighlight(dependency);
      }
    }
  }
  //endregion
  //region Export
  // Export calls this fn to determine if a dependency should be included or not
  isDependencyVisible(dependency) {
    const me = this, { rowStore } = me, {
      fromEvent,
      toEvent
    } = dependency;
    if (!fromEvent || !toEvent) {
      return false;
    }
    const fromResource = fromEvent.resource, toResource = toEvent.resource;
    if (!rowStore.isAvailable(fromResource) || !rowStore.isAvailable(toResource)) {
      return false;
    }
    return fromEvent.isModel && !fromResource.instanceMeta(rowStore).hidden && !toResource.instanceMeta(rowStore).hidden;
  }
  //endregion
  //region Highlight
  updateHighlightDependenciesOnEventHover(enable) {
    const me = this;
    if (enable) {
      const { client } = me;
      client.ion({
        name: "highlightOnHover",
        [`${client.scheduledEventName}MouseEnter`]: (params) => me.highlightEventDependencies(params.eventRecord || params.taskRecord),
        [`${client.scheduledEventName}MouseLeave`]: (params) => me.unhighlightEventDependencies(params.eventRecord || params.taskRecord),
        thisObj: me
      });
    } else {
      me.detachListeners("highlightOnHover");
    }
  }
  highlight(dependency, cls = this.overCls) {
    let classes = this.highlighted.get(dependency);
    if (!classes) {
      this.highlighted.set(dependency, classes = /* @__PURE__ */ new Set());
    }
    classes.add(cls);
    for (const element of this.getElementsForDependency(dependency)) {
      element.classList.add(cls);
    }
  }
  unhighlight(dependency, cls = this.overCls) {
    const classes = this.highlighted.get(dependency);
    if (classes) {
      classes.delete(cls);
      if (!classes.size) {
        this.highlighted.delete(dependency);
      }
    }
    for (const element of this.getElementsForDependency(dependency)) {
      element.classList.remove(cls);
    }
  }
  highlightEventDependencies(timespan, cls) {
    timespan.dependencies.forEach((dep) => this.highlight(dep, cls));
  }
  unhighlightEventDependencies(timespan, cls) {
    timespan.dependencies.forEach((dep) => this.unhighlight(dep, cls));
  }
  //endregion
  //region Drawing
  // Implemented in DependencyGridCache to return dependencies that might intersect the current viewport and thus
  // should be considered for drawing. Fallback value here is used when there is no grid cache (which happens when it
  // is reset. Also useful in case we want to have it configurable or opt out automatically for small datasets)
  getDependenciesToConsider(startMS, endMS, startIndex, endIndex) {
    var _a, _b;
    const { eventStore } = this.project;
    return (_b = (_a = super.getDependenciesToConsider) == null ? void 0 : _a.call(this, startMS, endMS, startIndex, endIndex)) != null ? _b : (
      // Falling back to using all valid deps (fix for not trying to draw conflicted deps)
      this.project.dependencyStore.records.filter((d) => d.isValid && !eventStore.isFiltered || eventStore.isAvailable(d.fromEvent) && eventStore.isAvailable(d.toEvent))
    );
  }
  // String key used as syncId
  getDependencyKey(dependency, fromAssignment, toAssignment) {
    return `dep:${dependency.id};from:${fromAssignment.id};to:${toAssignment.id}`;
  }
  drawDependency(dependency, batch = false, forceBoxes = null) {
    var _a, _b, _c, _d;
    const me = this, {
      domConfigs,
      client,
      rowStore,
      topIndex,
      bottomIndex
    } = me, {
      useInitialAnimation
    } = client, { idMap } = rowStore, {
      startMS,
      endMS
    } = me.visibleDateRange, {
      fromEvent,
      toEvent
    } = dependency;
    let fromAssigned = fromEvent.assigned, toAssigned = toEvent.assigned;
    if (
      // No point in trying to draw dep between unscheduled/non-existing events
      fromEvent.isScheduled && toEvent.isScheduled && // Or unassigned ones
      (fromAssigned == null ? void 0 : fromAssigned.size) && (toAssigned == null ? void 0 : toAssigned.size)
    ) {
      if (me.usingLinks) {
        fromAssigned = [...fromAssigned].flatMap(collectLinkedAssignments);
        toAssigned = [...toAssigned].flatMap(collectLinkedAssignments);
      }
      for (const from of fromAssigned) {
        for (const to of toAssigned) {
          const fromIndex = (_b = idMap[(_a = from.resource) == null ? void 0 : _a.id]) == null ? void 0 : _b.index, toIndex = (_d = idMap[(_c = to.resource) == null ? void 0 : _c.id]) == null ? void 0 : _d.index, fromDateMS = Math.min(fromEvent.startDateMS, toEvent.startDateMS), toDateMS = Math.max(fromEvent.endDateMS, toEvent.endDateMS);
          if (client.isExporting || fromIndex != null && toIndex != null && (from.drawDependencies !== false && to.drawDependencies !== false) && (rowStore.isAvailable(from.resource) && rowStore.isAvailable(to.resource)) && !// Both ends above view
          (fromIndex < topIndex && toIndex < topIndex || // Both ends below view
          fromIndex > bottomIndex && toIndex > bottomIndex || // Both ends before view
          fromDateMS < startMS && toDateMS < startMS || // Both ends after view
          fromDateMS > endMS && toDateMS > endMS)) {
            const key = me.getDependencyKey(dependency, from, to), lineDomConfigs = me.getDomConfigs(dependency, from, to, forceBoxes);
            if (lineDomConfigs) {
              if (useInitialAnimation) {
                lineDomConfigs[0].style = {
                  animationDelay: `${Math.max(fromIndex, toIndex) / 20 * 1e3}ms`
                };
              }
              domConfigs.set(key, lineDomConfigs);
            } else {
              domConfigs.delete(key);
            }
          }
          me.afterDrawDependency(dependency, fromIndex, toIndex, fromDateMS, toDateMS);
        }
      }
    }
    if (!batch) {
      me.domSync();
    }
  }
  // Hooks used by grid cache, to keep code in this file readable
  afterDrawDependency(dependency, fromIndex, toIndex, fromDateMS, toDateMS) {
    var _a;
    (_a = super.afterDrawDependency) == null ? void 0 : _a.call(this, dependency, fromIndex, toIndex, fromDateMS, toDateMS);
  }
  beforeDraw() {
    var _a;
    (_a = super.beforeDraw) == null ? void 0 : _a.call(this);
  }
  afterDraw() {
    var _a;
    (_a = super.afterDraw) == null ? void 0 : _a.call(this);
  }
  // Update DOM
  domSync(targetElement = this.client.svgCanvas, batch = false) {
    DomSync.sync({
      targetElement,
      domConfig: {
        onlyChildren: true,
        children: Array.from(this.domConfigs.values()).flat()
      },
      syncIdField: "syncId",
      releaseThreshold: 0,
      strict: true,
      callback() {
      }
    });
    if (batch) {
      this.clearDomConfigs();
    }
  }
  fillDrawingCache() {
    const me = this, { client } = me;
    me.relativeTo = Rectangle.from(client.svgCanvas);
    me.visibleResources = client.visibleResources;
    me.visibleDateRange = client.visibleDateRange;
    me.topIndex = me.rowStore.indexOf(me.visibleResources.first);
    me.bottomIndex = me.rowStore.indexOf(me.visibleResources.last);
    if (me.usingLinks == null) {
      me.usingLinks = client.resourceStore.some((r) => r.hasLinks);
    }
  }
  clearDomConfigs() {
    this.domConfigs.clear();
  }
  // Draw all dependencies intersecting the current viewport immediately
  draw() {
    const me = this, { client } = me, { visibleDateRange } = client;
    if (client.refreshSuspended || !client.foregroundCanvas || !visibleDateRange || !client.isEngineReady || me.disabled && !me._isDisabling || client.isExporting) {
      return;
    }
    me.fillDrawingCache();
    me.clearDomConfigs();
    if (client.firstVisibleRow && client.lastVisibleRow && client.timeAxis.count && !me.disabled && visibleDateRange.endMS - visibleDateRange.startMS > 0) {
      const {
        topIndex,
        bottomIndex
      } = me, dependencies = me.getDependenciesToConsider(visibleDateRange.startMS, visibleDateRange.endMS, topIndex, bottomIndex);
      me.beforeDraw();
      for (const dependency of dependencies) {
        me.drawDependency(dependency, true);
      }
      me.afterDraw();
    }
    me.domSync();
    client.trigger("dependenciesDrawn");
  }
  //endregion
  //region Refreshing
  // Performs a draw on next frame, not intended to be called directly, call refresh() instead
  doRefresh() {
    var _a, _b, _c, _d, _e;
    const me = this, { client } = me, { scheduledEventName, features } = client;
    me.draw();
    me.drawingLive = client.dependencyStore.count && (client.isAnimating || client.useInitialAnimation && client.eventStore.count || ((_a = features[`${scheduledEventName}Drag`]) == null ? void 0 : _a.isActivelyDragging) || ((_b = features[`${scheduledEventName}Drag`]) == null ? void 0 : _b.isAborting) || ((_c = features[`${scheduledEventName}Resize`]) == null ? void 0 : _c.isResizing) || ((_d = features[`${scheduledEventName}SegmentDrag`]) == null ? void 0 : _d.isActivelyDragging) || ((_e = features[`${scheduledEventName}SegmentResize`]) == null ? void 0 : _e.isResizing));
    me.drawingLive && me.refresh(false, true);
  }
  rafRefresh() {
    this.doRefresh.now();
  }
  /**
   * Redraws dependencies on the next animation frame
   */
  refresh(immediateRefresh = this.immediateRefresh, rafRefresh = false) {
    const me = this, { client } = me;
    if (!client.refreshSuspended && !me.disabled && client.isPainted && !client.timeAxisSubGrid.collapsed) {
      if (immediateRefresh) {
        me.doRefresh.now();
      } else if (rafRefresh) {
        me.rafRefresh();
      } else {
        me.doRefresh();
      }
    }
  }
  // Resets grid cache and performs a draw on next frame. Conditions when it should be called:
  // * Zooming
  // * Shifting time axis
  // * Resizing window
  // * CRUD
  // ...
  reset({ source, type } = emptyObject2) {
    var _a;
    (_a = super.reset) == null ? void 0 : _a.call(this);
    this.refresh(source === this.client && type === "timelineviewportresize");
  }
  /**
   * Draws all dependencies for the specified task.
   * @deprecated 5.1 The Dependencies feature was refactored and this fn is no longer needed
   */
  drawForEvent() {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Dependencies.drawForEvent() is no longer needed");
    this.refresh();
  }
  //endregion
  //region Scheduler hooks
  render() {
    this.client.getConfig("svgCanvas");
  }
  //endregion
};
__publicField(Dependencies, "$name", "Dependencies");
/**
 * Fired when dependencies are rendered
 * @on-owner
 * @event dependenciesDrawn
 */
//region Config
__publicField(Dependencies, "configurable", {
  /**
   * The CSS class to add to a dependency line when hovering over it
   * @config {String}
   * @default
   * @private
   */
  overCls: "b-sch-dependency-over",
  /**
   * The CSS class applied to dependency lines
   * @config {String}
   * @default
   * @private
   */
  baseCls: "b-sch-dependency",
  /**
   * The CSS class applied to a too narrow dependency line (to hide markers)
   * @config {String}
   * @default
   * @private
   */
  noMarkerCls: "b-sch-dependency-markerless",
  /**
   * SVG path definition used as marker (arrow head) for the dependency lines.
   * Should fit in a viewBox that is 9 x 6.
   *
   * ```javascript
   * const scheduler = new Scheduler({
   *     features : {
   *         dependencies : {
   *             // Circular marker
   *             markerDef : 'M 2,3 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0'
   *         }
   *     }
   * });
   * ```
   *
   * @config {String}
   * @default 'M3,0 L3,6 L9,3 z'
   */
  markerDef: null,
  /**
   * Radius (in px) used to draw arcs where dependency line segments connect. Specify it to get a rounded look.
   * The radius will during drawing be reduced as needed on a per segment basis to fit lines.
   *
   * ```javascript
   * const scheduler = new Scheduler({
   *     features : {
   *         dependencies : {
   *             // Round the corner where line segments connect, similar to 'border-radius: 5px'
   *             radius : 5
   *         }
   *     }
   * });
   * ```
   *
   * <div class="note">Using a radius slightly degrades dependency rendering performance. If your app displays
   * a lot of dependencies, it might be worth taking this into account when deciding if you want to use radius
   * or not</div>
   *
   * @config {Number}
   */
  radius: null,
  /**
   * Renderer function, supply one if you want to manipulate the {@link DomConfig} object used to draw a
   * dependency line between two assignments.
   *
   * ```javascript
   * const scheduler = new Scheduler({
   *     features : {
   *         dependencies : {
   *             renderer({ domConfig, fromAssignmentRecord : from, toAssignmentRecord : to }) {
   *                 // Add a custom CSS class to dependencies between important assignments
   *                 domConfig.class.important = from.important || to.important;
   *                 domConfig.class.veryImportant = from.important && to.important;
   *             }
   *         }
   *     }
   * }
   * ```
   *
   * @prp {Function}
   * @param {Object} renderData
   * @param {DomConfig} renderData.domConfig that will be used to create the dependency line, can be manipulated by the renderer
   * @param {Scheduler.model.DependencyModel} renderData.dependencyRecord The dependency being rendered
   * @param {Scheduler.model.AssignmentModel} renderData.fromAssignmentRecord Drawing line from this assignment
   * @param {Scheduler.model.AssignmentModel} renderData.toAssignmentRecord Drawing line to this assignment
   * @param {Object[]} renderData.points A collection of points making up the line segments for the dependency line.
   *   Read-only in the renderer, any manipulation should be done to `domConfig`
   * @param {Core.helper.util.Rectangle} renderData.fromBox Bounds for the fromAssignment's element
   * @param {Core.helper.util.Rectangle} renderData.toBox Bounds for the toAssignment's element
   * @param {'top'|'right'|'bottom'|'left'} renderData.fromSide Drawn from this side of the fromAssignment
   * @param {'top'|'right'|'bottom'|'left'} renderData.toSide Drawn to this side of the fromAssignment
   * @returns {void}
   *
   * @category Rendering
   */
  renderer: null,
  /**
   * Specify `true` to highlight incoming and outgoing dependencies when hovering an event.
   * @prp {Boolean}
   */
  highlightDependenciesOnEventHover: null,
  /**
   * Specify `false` to prevent dependencies from being drawn during scroll, for smoother scrolling in schedules
   * with lots of dependencies. Dependencies will be drawn when scrolling stops instead.
   * @prp {Boolean}
   * @default
   */
  drawOnScroll: true,
  /**
   * The clickable/touchable width of the dependency line in pixels. Setting this to a number greater than 1 will
   * draw an invisible but clickable line along the same path as the dependency line, making it easier to click.
   * The tradeoff is that twice as many lines will be drawn, which can affect performance.
   * @prp {Number}
   */
  clickWidth: null,
  /**
   * By default, the refresh of dependencies is buffered by 10 milliseconds so that multiple changes
   * which may cause the dependency lines to become invalid are coalesced into one refresh. This is more
   * efficient, but may mean the dependency lines may lag behind expectations when moving a pointer.
   *
   * Set this to `true` to update dependency lines immediately upon any change which causes them
   * to require an update.
   * @prp {Boolean}
   * @default false
   * @private
   */
  immediateRefresh: null,
  /**
   * *Experimental* - This setting only applies when using dependencies with the nested events feature. In such
   * scenarios, enabling this config will cause the dependency lines to, when the algorithm determines it is
   * possible, be drawn around parent events, instead of through them.
   *
   * {@note}
   * Note that enabling this feature increases the complexity of dependency drawing, and it does have a negative
   * impact on performance.
   * {/@note}
   *
   * @prp {Boolean}
   */
  drawAroundParents: null
});
__publicField(Dependencies, "delayable", {
  doRefresh: 10,
  rafRefresh: "raf"
});
Dependencies._$name = "Dependencies";
GridFeatureManager.registerFeature(Dependencies, false, ["Scheduler", "ResourceHistogram"]);

// ../Scheduler/lib/Scheduler/feature/EventFilter.js
var EventFilter = class extends InstancePlugin {
  static get $name() {
    return "EventFilter";
  }
  static get pluginConfig() {
    return {
      chain: ["populateTimeAxisHeaderMenu"]
    };
  }
  /**
   * Populates the header context menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateTimeAxisHeaderMenu({ items }) {
    const me = this;
    items.eventsFilter = {
      text: "L{filterEvents}",
      icon: "b-fw-icon b-icon-filter",
      disabled: me.disabled,
      localeClass: me,
      weight: 100,
      menu: {
        type: "popup",
        localeClass: me,
        items: {
          nameFilter: {
            weight: 110,
            type: "textfield",
            cls: "b-eventfilter b-last-row",
            clearable: true,
            keyStrokeChangeDelay: 300,
            label: "L{byName}",
            localeClass: me,
            width: 200,
            internalListeners: {
              change: me.onEventFilterChange,
              thisObj: me
            }
          }
        },
        onBeforeShow({ source: menu }) {
          const [filterByName] = menu.items, filter = me.store.filters.getBy("property", "name");
          filterByName.value = (filter == null ? void 0 : filter.value) || "";
        }
      }
    };
  }
  onEventFilterChange({ value }) {
    if (value !== "") {
      this.store.filter("name", value);
    } else {
      this.store.removeFilter("name");
    }
  }
  get store() {
    const { client } = this;
    return client.isGanttBase ? client.store : client.eventStore;
  }
};
EventFilter.featureClass = "b-event-filter";
EventFilter._$name = "EventFilter";
GridFeatureManager.registerFeature(EventFilter, true, ["Scheduler", "Gantt"]);
GridFeatureManager.registerFeature(EventFilter, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/mixin/NonWorkingTimeMixin.js
var NonWorkingTimeMixin_default = (Target) => {
  var _a;
  return _a = class extends Target {
    getNonWorkingTimeRanges(calendar, startDate, endDate) {
      const maxRange = endDate.getTime() - startDate.getTime() + 24 * 60 * 60 * 1e3;
      if (!calendar.getNonWorkingTimeRanges) {
        const result = [];
        calendar.forEachAvailabilityInterval(
          { startDate, endDate, isForward: true, maxRange },
          (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
            for (const [entry, cache] of calendarCacheInterval.intervalGroups) {
              if (!cache.getIsWorking()) {
                result.push({
                  name: entry.name,
                  iconCls: entry.iconCls,
                  cls: entry.cls,
                  startDate: intervalStartDate,
                  endDate: intervalEndDate
                });
              }
            }
          }
        );
        return result;
      }
      return calendar.getNonWorkingTimeRanges(startDate, endDate, maxRange);
    }
    getCalendarTimeRanges(calendar, ignoreName = false) {
      const me = this, { timeAxis, fillTicks } = me.client, { unit, increment } = timeAxis, shouldPaint = !me.maxTimeAxisUnit || DateHelper.compareUnits(unit, me.maxTimeAxisUnit) <= 0;
      if (calendar && shouldPaint && timeAxis.count) {
        const allRanges = me.getNonWorkingTimeRanges(calendar, timeAxis.startDate, timeAxis.endDate), timeSpans = allRanges.map((interval) => new TimeSpan({
          name: interval.name,
          cls: `b-nonworkingtime ${interval.cls || ""}`,
          startDate: interval.startDate,
          endDate: interval.endDate
        }));
        let mergedSpans = [];
        let prevRange = null;
        for (const range of timeSpans) {
          if (prevRange && range.startDate <= prevRange.endDate && (ignoreName || range.name === prevRange.name) && range.duration > 0) {
            prevRange.endDate = range.endDate;
          } else {
            mergedSpans.push(range);
            range.setData("id", `nonworking-${mergedSpans.length}`);
            prevRange = range;
          }
        }
        if (fillTicks) {
          mergedSpans = mergedSpans.filter((span) => {
            return !DateHelper.isSameDate(span.startDate, span.endDate) && DateHelper.ceil(span.startDate, { magnitude: increment, unit }) < DateHelper.floor(span.endDate, { magnitude: increment, unit });
          });
          mergedSpans.forEach(
            (span) => span.setStartEndDate(
              DateHelper.ceil(span.startDate, { magnitude: increment, unit }),
              DateHelper.floor(span.endDate, { magnitude: increment, unit })
            )
          );
        }
        return mergedSpans;
      } else {
        return [];
      }
    }
    //region Basic scheduler calendar
    setupDefaultCalendar() {
      const { client, project } = this;
      if (
        // Might have been set up by NonWorkingTime / EventNonWorkingTime already
        !this.autoGeneratedWeekends && // For basic scheduler...
        !client.isSchedulerPro && !client.isGantt && // ...that uses the default calendar...
        project.effectiveCalendar === project.defaultCalendar && // ...and has no defined intervals
        !project.defaultCalendar.intervalStore.count
      ) {
        this.autoGeneratedWeekends = true;
        this.updateDefaultCalendar();
      }
    }
    updateDefaultCalendar() {
      if (this.autoGeneratedWeekends) {
        const calendar = this.client.project.effectiveCalendar, intervals = this.defaultNonWorkingIntervals, hasIntervals = Boolean(intervals.length);
        calendar.ignoreTimeZone = true;
        calendar.clearIntervals(hasIntervals);
        if (hasIntervals) {
          calendar.addIntervals(intervals);
        }
      }
    }
    updateLocalization() {
      var _a2;
      (_a2 = super.updateLocalization) == null ? void 0 : _a2.call(this);
      this.autoGeneratedWeekends && this.updateDefaultCalendar();
    }
    get defaultNonWorkingIntervals() {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return DateHelper.nonWorkingDaysAsArray.map((dayIndex) => ({
        recurrentStartDate: `on ${dayNames[dayIndex]} at 0:00`,
        recurrentEndDate: `on ${dayNames[(dayIndex + 1) % 7]} at 0:00`,
        isWorking: false
      }));
    }
    //endregion
  }, __publicField(_a, "$name", "NonWorkingTimeMixin"), __publicField(_a, "configurable", {
    /**
     * The maximum time axis unit to display non-working ranges for ('hour' or 'day' etc).
     * When zooming to a view with a larger unit, no non-working time elements will be rendered.
     *
     * **Note:** Be careful with setting this config to big units like 'year'. When doing this,
     * make sure the timeline {@link Scheduler/view/TimelineBase#config-startDate start} and
     * {@link Scheduler/view/TimelineBase#config-endDate end} dates are set tightly.
     * When using a long range (for example many years) with non-working time elements rendered per hour,
     * you will end up with millions of elements, impacting performance.
     * When zooming, use the {@link Scheduler/view/mixin/TimelineZoomable#config-zoomKeepsOriginalTimespan} config.
     * @config {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
     * @default
     */
    maxTimeAxisUnit: "week"
  }), _a;
};

// ../Scheduler/lib/Scheduler/feature/NonWorkingTime.js
var NonWorkingTime = class extends AbstractTimeRanges.mixin(AttachToProjectMixin_default, NonWorkingTimeMixin_default) {
  /** @hideconfigs enableResizing, store*/
  static get defaultConfig() {
    return {
      /**
       * Set to `true` to highlight non-working periods of time
       * @config {Boolean}
       * @deprecated Since 5.2.0, will be removed since the feature is pointless if set to false
       */
      highlightWeekends: null,
      /**
       * The feature by default does not render ranges smaller than the base unit used by the time axis.
       * Set this config to `false` to disable this behavior.
       *
       * <div class="note">The {@link #config-maxTimeAxisUnit} config defines a zoom level at which to bail out of
       * rendering ranges completely.</div>
       * @config {Boolean}
       * @default
       */
      hideRangesOnZooming: true,
      showHeaderElements: true,
      showLabelInBody: true,
      autoGeneratedWeekends: false
    };
  }
  //endregion
  //region Init & destroy
  doDestroy() {
    this.attachToCalendar(null);
    super.doDestroy();
  }
  set highlightWeekends(highlight) {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Deprecated in favour of disabling the feature");
    this.disabled = !highlight;
  }
  get highlightWeekends() {
    return !this.disabled;
  }
  onConfigChange({ name }) {
    if (!this.isConfiguring && name === "fillTicks") {
      this.refresh();
    }
  }
  //endregion
  //region Project
  attachToProject(project) {
    super.attachToProject(project);
    this.attachToCalendar(project.effectiveCalendar);
    if (!project.graph && !this.client.isScheduler) {
      project.ion({
        name: "project",
        dataReady: { fn: () => this.attachToCalendar(project.effectiveCalendar), once: true },
        thisObj: this
      });
    }
    project.ion({
      name: "project",
      calendarChange: () => this.attachToCalendar(project.effectiveCalendar),
      thisObj: this
    });
  }
  //endregion
  //region TimeAxisViewModel
  onTimeAxisViewModelUpdate(...args) {
    this._timeAxisUnitDurationMs = null;
    return super.onTimeAxisViewModelUpdate(...args);
  }
  //endregion
  //region Calendar
  attachToCalendar(calendar) {
    const me = this, { project, client } = me;
    me.detachListeners("calendar");
    me.autoGeneratedWeekends = false;
    if (calendar) {
      me.setupDefaultCalendar();
      calendar.intervalStore.ion({
        name: "calendar",
        change: () => me.setTimeout(() => me.refresh(), 1)
      });
    }
    if (client.isEngineReady && !client.project.isDelayingCalculation && !client.isDestroying) {
      me.refresh();
    } else if (!project.isDestroyed) {
      me.detachListeners("initialProjectListener");
      project.ion({
        name: "initialProjectListener",
        refresh({ isCalculated }) {
          if (isCalculated !== false) {
            me.refresh();
            me.detachListeners("initialProjectListener");
          }
        },
        thisObj: me
      });
    }
  }
  get calendar() {
    var _a;
    return (_a = this.project) == null ? void 0 : _a.effectiveCalendar;
  }
  //endregion
  //region Draw
  get timeAxisUnitDurationMs() {
    if (!this._timeAxisUnitDurationMs) {
      this._timeAxisUnitDurationMs = DateHelper.as("ms", 1, this.client.timeAxis.unit);
    }
    return this._timeAxisUnitDurationMs;
  }
  /**
   * Based on this method result the feature decides whether the provided non-working period should
   * be rendered or not.
   * The method checks that the range has non-zero {@link Scheduler.model.TimeSpan#field-duration},
   * lays in the visible timespan and its duration is longer or equal the base timeaxis unit
   * (if {@link #config-hideRangesOnZooming} is `true`).
   *
   * Override the method to implement your custom range rendering vetoing logic.
   * @param {Scheduler.model.TimeSpan} range Range to render.
   * @returns {Boolean} `true` if the range should be rendered and `false` otherwise.
   */
  shouldRenderRange(range) {
    return super.shouldRenderRange(range) && (!this.hideRangesOnZooming || range.durationMS >= this.timeAxisUnitDurationMs);
  }
  // Calendar intervals as TimeSpans, with adjacent intervals merged to create fewer
  get timeRanges() {
    const me = this;
    if (!me._timeRanges) {
      me._timeRanges = me.getCalendarTimeRanges(me.calendar);
    }
    return me._timeRanges;
  }
  //endregion
};
//region Default config
__publicField(NonWorkingTime, "$name", "NonWorkingTime");
__publicField(NonWorkingTime, "pluginConfig", {
  chain: [
    "onInternalPaint",
    "attachToProject",
    "updateLocalization",
    "onConfigChange",
    "onSchedulerHorizontalScroll"
  ]
});
NonWorkingTime._$name = "NonWorkingTime";
GridFeatureManager.registerFeature(NonWorkingTime, false, "Scheduler");
GridFeatureManager.registerFeature(NonWorkingTime, true, ["SchedulerPro", "Gantt", "ResourceHistogram"]);

// ../Scheduler/lib/Scheduler/feature/ScheduleTooltip.js
var ScheduleTooltip = class extends InstancePlugin {
  //region Config
  static get $name() {
    return "ScheduleTooltip";
  }
  static get configurable() {
    return {
      messageTemplate: (data) => `<div class="b-sch-hovertip-msg">${data.message}</div>`,
      /**
       * Set to `true` to hide this tooltip when hovering non-working time. Defaults to `false` for Scheduler,
       * `true` for SchedulerPro
       * @config {Boolean}
       */
      hideForNonWorkingTime: null
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["onInternalPaint"]
    };
  }
  //endregion
  //region Init
  /**
   * Set up drag and drop and hover tooltip.
   * @private
   */
  onInternalPaint({ firstPaint }) {
    if (!firstPaint) {
      return;
    }
    const me = this, { client } = me;
    if (client.isSchedulerPro && me.hideForNonWorkingTime === void 0) {
      me.hideForNonWorkingTime = true;
    }
    let reshowListener;
    const tip = me.hoverTip = new Tooltip({
      id: `${client.id}-schedule-tip`,
      cls: "b-sch-scheduletip",
      allowOver: true,
      hoverDelay: 0,
      hideDelay: 100,
      showOnHover: true,
      forElement: client.timeAxisSubGridElement,
      anchorToTarget: false,
      trackMouse: true,
      updateContentOnMouseMove: true,
      // disable text content and monitor resize for tooltip, otherwise it doesn't
      // get sized properly on first appearance
      monitorResize: false,
      textContent: false,
      forSelector: ".b-schedulerbase:not(.b-dragging-event,.b-dragcreating,.b-creating-dependency) .b-grid-body-container:not(.b-scrolling) .b-timeline-subgrid:not(.b-scrolling) > :not(.b-sch-foreground-canvas):not(.b-group-footer):not(.b-group-row) *",
      // Do not constrain at all, want it to be able to go outside of the viewport to not get in the way
      getHtml: me.getHoverTipHtml.bind(me),
      onDocumentMouseDown(event) {
        if (tip.forElement.contains(event.event.target)) {
          reshowListener = EventHelper.on({
            thisObj: me,
            element: client.timeAxisSubGridElement,
            mousemove: (e) => tip.internalOnPointerOver(e),
            capture: true
          });
        }
        const hideAnimation = tip.hideAnimation;
        tip.hideAnimation = false;
        tip.constructor.prototype.onDocumentMouseDown.call(tip, event);
        tip.hideAnimation = hideAnimation;
      },
      // on Core/mixin/Events constructor, me.config.listeners is deleted and attributed its value to me.configuredListeners
      // to then on processConfiguredListeners it set me.listeners to our TooltipBase
      // but since we need our initial config.listeners to set to our internal tooltip, we leave processConfiguredListeners empty
      // to avoid lost our listeners to apply for our internal tooltip here and force our feature has all Tooltip events firing
      ...me.config,
      internalListeners: me.configuredListeners
    });
    tip.ion({
      pointerover({ event }) {
        const buttonsPressed = "buttons" in event ? event.buttons > 0 : event.which > 0;
        if (!buttonsPressed && reshowListener) {
          reshowListener();
        }
        return !me.disabled && !buttonsPressed;
      },
      innerhtmlupdate({ source }) {
        me.clockTemplate.updateDateIndicator(source.element, me.lastTime);
      }
    });
    client.ion({
      timeAxisViewModelUpdate: "updateTip",
      thisObj: me
    });
    me.clockTemplate = new ClockTemplate({
      scheduler: client
    });
  }
  // leave configuredListeners alone until render time at which they are used on the tooltip
  processConfiguredListeners() {
  }
  updateTip() {
    if (this.hoverTip.isVisible) {
      this.hoverTip.updateContent();
    }
  }
  doDestroy() {
    this.destroyProperties("clockTemplate", "hoverTip");
    super.doDestroy();
  }
  //endregion
  //region Contents
  /**
   * @deprecated Use {@link #function-generateTipContent} instead.
   * Gets html to display in hover tooltip (tooltip displayed on empty parts of scheduler)
   * @private
   */
  getHoverTipHtml({ tip, event }) {
    const me = this, scheduler = me.client, date = event && scheduler.getDateFromDomEvent(event, "floor", true);
    let html = me.lastHtml;
    if (date && event.target) {
      const resourceRecord = scheduler.resolveResourceRecord(event);
      if (resourceRecord && (date - me.lastTime !== 0 || resourceRecord.id !== me.lastResourceId)) {
        if (me.hideForNonWorkingTime) {
          const isWorkingTime = resourceRecord.isWorkingTime(date);
          tip.element.classList.toggle("b-nonworking-time", !isWorkingTime);
        }
        me.lastResourceId = resourceRecord.id;
        html = me.lastHtml = me.generateTipContent({ date, event, resourceRecord });
      }
    } else {
      tip.hide();
      me.lastTime = null;
      me.lastResourceId = null;
    }
    return html;
  }
  /**
   * Called as mouse pointer is moved over a new resource or time block. You can override this to show
   * custom HTML in the tooltip.
   * @param {Object} context
   * @param {Date} context.date The date of the hovered point
   * @param {Event} context.event The DOM event that triggered this tooltip to show
   * @param {Scheduler.model.ResourceModel} context.resourceRecord The resource record
   * @returns {String} The HTML contents to show in the tooltip (an empty return value will hide the tooltip)
   */
  generateTipContent({ date, event, resourceRecord }) {
    const me = this, clockHtml = me.clockTemplate.generateContent({
      date,
      text: me.client.getFormattedDate(date)
    }), messageHtml = me.messageTemplate({
      message: me.getText(date, event, resourceRecord) || ""
    });
    me.lastTime = date;
    return clockHtml + messageHtml;
  }
  /**
   * Override this to render custom text to default hover tip
   * @param {Date} date
   * @param {Event} event Browser event
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @returns {String}
   */
  getText(date, event, resourceRecord) {
  }
  //endregion
};
ScheduleTooltip.featureClass = "b-scheduletip";
ScheduleTooltip._$name = "ScheduleTooltip";
GridFeatureManager.registerFeature(ScheduleTooltip, true, "Scheduler");
GridFeatureManager.registerFeature(ScheduleTooltip, false, "ResourceUtilization");

// ../Scheduler/lib/Scheduler/feature/TimeAxisHeaderMenu.js
var setTimeSpanOptions = {
  maintainVisibleStart: true
};
var TimeAxisHeaderMenu = class extends HeaderMenu {
  //region Config
  static get $name() {
    return "TimeAxisHeaderMenu";
  }
  static get defaultConfig() {
    return {
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       *   features         : {
       *       timeAxisHeaderMenu : {
       *           processItems({ items }) {
       *               // Add or hide existing items here as needed
       *               items.myAction = {
       *                   text   : 'Cool action',
       *                   icon   : 'b-fa b-fa-fw b-fa-ban',
       *                   onItem : () => console.log('Some coolness'),
       *                   weight : 300 // Move to end
       *               };
       *
       *               // Hide zoom slider
       *               items.zoomLevel.hidden = true;
       *           }
       *       }
       *   },
       * ```
       *
       * @config {Function}
       * @param {Object} context An object with information about the menu being shown
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
       * The `items` provided by this feature are listed in the intro section of this class. You can
       * configure existing items by passing a configuration object to the keyed items.
       *
       * To remove existing items, set corresponding keys `null`:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         timeAxisHeaderMenu : {
       *             items : {
       *                 eventsFilter : null
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * See the feature config in the above example for details.
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>} items
       */
      items: null,
      type: "timeAxisHeader"
    };
  }
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateTimeAxisHeaderMenu");
    return config;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning Scheduler or Gantt widget before the context menu is shown for the time axis header.
   * Allows manipulation of the items to show in the same way as in the {@link #config-processItems}.
   *
   * Returning `false` from a listener prevents the menu from being shown.
   *
   * @event timeAxisHeaderMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source The scheduler
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Time axis column
   */
  /**
   * This event fires on the owning Scheduler or Gantt widget after the context menu is shown for a header
   * @event timeAxisHeaderMenuShow
   * @on-owner
   * @param {Scheduler.view.Scheduler} source The scheduler
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Time axis column
   */
  /**
   * This event fires on the owning Scheduler or Gantt widget when an item is selected in the header context menu.
   * @event timeAxisHeaderMenuItem
   * @on-owner
   * @param {Scheduler.view.Scheduler} source The scheduler
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {Grid.column.Column} column Time axis column
   */
  //endregion
  construct() {
    super.construct(...arguments);
    if (this.triggerEvent.includes("click") && this.client.zoomOnTimeAxisDoubleClick) {
      this.client.zoomOnTimeAxisDoubleClick = false;
    }
  }
  shouldShowMenu(eventParams) {
    const { column, targetElement } = eventParams, { client } = this;
    if (client.isHorizontal) {
      return (column == null ? void 0 : column.enableHeaderContextMenu) !== false && (column == null ? void 0 : column.isTimeAxisColumn);
    }
    return targetElement.matches(".b-sch-header-timeaxis-cell");
  }
  showContextMenu(eventParams) {
    super.showContextMenu(...arguments);
    if (this.menu) {
      this.menu.scrollAction = "realign";
    }
  }
  populateTimeAxisHeaderMenu({ items }) {
    const me = this, { client } = me, dateStep = {
      magnitude: client.timeAxis.shiftIncrement,
      unit: client.timeAxis.shiftUnit
    };
    Object.assign(items, {
      zoomLevel: {
        text: "L{pickZoomLevel}",
        localeClass: me,
        icon: "b-fw-icon b-icon-search-plus",
        disabled: !client.presets.count || me.disabled,
        weight: 200,
        menu: {
          type: "popup",
          items: {
            zoomSlider: {
              weight: 210,
              type: "slider",
              minWidth: 130,
              showValue: false,
              // so that we can use the change event which is easier to inject in tests
              triggerChangeOnInput: true
            }
          },
          onBeforeShow({ source: menu }) {
            const [zoom] = menu.items;
            zoom.min = client.minZoomLevel;
            zoom.max = client.maxZoomLevel;
            zoom.value = client.zoomLevel;
            me.zoomDetatcher = zoom.ion({ change: "onZoomSliderChange", thisObj: me });
          },
          onHide() {
            if (me.zoomDetatcher) {
              me.zoomDetatcher();
              me.zoomDetatcher = null;
            }
          }
        }
      },
      dateRange: {
        text: "L{activeDateRange}",
        localeClass: me,
        icon: "b-fw-icon b-icon-calendar",
        weight: 300,
        menu: {
          type: "popup",
          cls: "b-sch-timeaxis-menu-daterange-popup",
          defaults: {
            localeClass: me
          },
          items: {
            startDateField: {
              type: "datefield",
              label: "L{startText}",
              weight: 310,
              labelWidth: "6em",
              required: true,
              step: dateStep,
              internalListeners: {
                change: me.onRangeDateFieldChange,
                thisObj: me
              }
            },
            endDateField: {
              type: "datefield",
              label: "L{endText}",
              weight: 320,
              labelWidth: "6em",
              required: true,
              step: dateStep,
              internalListeners: {
                change: me.onRangeDateFieldChange,
                thisObj: me
              }
            },
            leftShiftBtn: {
              type: "button",
              weight: 330,
              cls: "b-left-nav-btn",
              icon: "b-icon b-icon-previous",
              color: "b-blue b-raised",
              flex: 1,
              margin: 0,
              internalListeners: {
                click: me.onLeftShiftBtnClick,
                thisObj: me
              }
            },
            todayBtn: {
              type: "button",
              weight: 340,
              cls: "b-today-nav-btn",
              color: "b-blue b-raised",
              text: "L{todayText}",
              flex: 4,
              margin: "0 8",
              internalListeners: {
                click: me.onTodayBtnClick,
                thisObj: me
              }
            },
            rightShiftBtn: {
              type: "button",
              weight: 350,
              cls: "b-right-nav-btn",
              icon: "b-icon b-icon-next",
              color: "b-blue b-raised",
              flex: 1,
              internalListeners: {
                click: me.onRightShiftBtnClick,
                thisObj: me
              }
            }
          },
          internalListeners: {
            paint: me.initDateRangeFields,
            thisObj: me
          }
        }
      }
    });
  }
  onZoomSliderChange({ value }) {
    const me = this;
    me.menu.scrollAction = "realign";
    me.client.zoomLevel = value;
    me.menu.setTimeout({
      fn: () => me.menu.scrollAction = "hide",
      delay: 100,
      cancelOutstanding: true
    });
  }
  initDateRangeFields({ source: dateRange, firstPaint }) {
    if (firstPaint) {
      const { widgetMap } = dateRange;
      this.startDateField = widgetMap.startDateField;
      this.endDateField = widgetMap.endDateField;
    }
    this.initDates();
  }
  initDates() {
    const me = this;
    me.startDateField.suspendEvents();
    me.endDateField.suspendEvents();
    me.startDateField.value = me.startDateFieldInitialValue = me.client.startDate;
    me.endDateField.value = me.endDateFieldInitialValue = me.client.endDate;
    me.startDateField.resumeEvents();
    me.endDateField.resumeEvents();
  }
  onRangeDateFieldChange({ source }) {
    const me = this, startDateChanged = source === me.startDateField, { client } = me, { timeAxis } = client, startDate = me.startDateFieldInitialValue && !startDateChanged ? me.startDateFieldInitialValue : me.startDateField.value;
    let endDate = me.endDateFieldInitialValue && startDateChanged ? me.endDateFieldInitialValue : me.endDateField.value;
    if (startDateChanged) {
      me.startDateFieldInitialValue = null;
    } else {
      me.endDateFieldInitialValue = null;
    }
    if (!(endDate - startDate)) {
      endDate = DateHelper.add(endDate, timeAxis.shiftIncrement, timeAxis.shiftUnit);
    } else if (endDate < startDate) {
      endDate = DateHelper.add(startDate, timeAxis.shiftIncrement, timeAxis.shiftUnit);
    }
    client.setTimeSpan(startDate, endDate, setTimeSpanOptions);
    me.initDates();
  }
  onLeftShiftBtnClick() {
    this.client.timeAxis.shiftPrevious();
    this.initDates();
  }
  onTodayBtnClick() {
    const today = DateHelper.clearTime(/* @__PURE__ */ new Date());
    this.client.setTimeSpan(today, DateHelper.add(today, 1, "day"));
    this.initDates();
  }
  onRightShiftBtnClick() {
    this.client.timeAxis.shiftNext();
    this.initDates();
  }
};
TimeAxisHeaderMenu._$name = "TimeAxisHeaderMenu";
GridFeatureManager.registerFeature(TimeAxisHeaderMenu, true, ["Scheduler", "TimelineHistogram", "Gantt"]);

export {
  DurationColumn,
  DragBase,
  EventResize,
  TaskEditTransactional_default,
  TransactionalFeature_default,
  DragCreateBase,
  TooltipBase,
  AbstractTimeRanges,
  ColumnLines,
  DependencyCreation_default,
  RectangularPathFinder,
  DependencyTooltip_default,
  Dependencies,
  EventFilter,
  NonWorkingTimeMixin_default,
  NonWorkingTime,
  ScheduleTooltip,
  TimeAxisHeaderMenu
};
//# sourceMappingURL=chunk-PFWHNAB4.js.map
