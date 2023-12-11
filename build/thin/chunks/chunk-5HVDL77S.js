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
  RowReorder,
  Summary
} from "./chunk-JZO6LOO7.js";
import {
  TransactionalFeature_default
} from "./chunk-PFWHNAB4.js";
import {
  ExportDialog,
  MultiPageExporter,
  MultiPageVerticalExporter,
  PdfExport,
  SinglePageExporter
} from "./chunk-6RG3ITZU.js";
import {
  Column,
  ColumnStore,
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  AvatarRendering
} from "./chunk-4LHHPUQ6.js";
import {
  Combo,
  DateHelper,
  DomHelper,
  DomSync,
  Editor,
  EventHelper,
  Field,
  InstancePlugin,
  ObjectHelper,
  Rectangle,
  StringHelper,
  Tooltip,
  VersionHelper,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/column/ResourceInfoColumn.js
var ResourceInfoColumn = class extends Column {
  static get $name() {
    return "ResourceInfoColumn";
  }
  static get type() {
    return "resourceInfo";
  }
  static get fields() {
    return ["showEventCount", "showRole", "showMeta", "showImage", "validNames", "autoScaleThreshold", "useNameAsImageName"];
  }
  static get defaults() {
    return {
      /** @hideconfigs renderer */
      /**
       * Show image. Looks for image name in fields on the resource in the following order: 'imageUrl', 'image',
       * 'name'. Set `showImage` to a field name to use a custom field. Set `Scheduler.resourceImagePath` to
       * specify where to load images from. If no extension found, defaults to
       * {@link Scheduler.view.mixin.SchedulerEventRendering#config-resourceImageExtension}.
       * @config {Boolean}
       * @default
       */
      showImage: true,
      /**
       * Show number of events assigned to the resource below the name.
       * @config {Boolean}
       * @default
       */
      showEventCount: true,
      /**
       * A template string to render any extra information about the resource below the name
       * @config {Function}
       * @param {Scheduler.model.ResourceModel} resourceRecord The record representing the current row
       * @returns {String|null}
       */
      showMeta: null,
      /**
       * Show resource role below the name. Specify `true` to display data from the `role` field, or specify a field
       * name to read this value from.
       * @config {Boolean|String}
       * @default
       */
      showRole: false,
      /**
       * Valid image names. Set to `null` to allow all names.
       * @deprecated This will be removed in 6.0
       * @config {String[]}
       */
      validNames: null,
      /**
       * Specify 0 to prevent the column from adapting its content according to the used row height, or specify a
       * threshold (row height) at which scaling should start.
       * @config {Number}
       * @default
       */
      autoScaleThreshold: 40,
      /**
       * Use the resource name as the image name when no `image` is specified on the resource.
       * @config {Boolean}
       * @default
       */
      useNameAsImageName: true,
      field: "name",
      htmlEncode: false,
      width: 140,
      cellCls: "b-resourceinfo-cell",
      editor: VersionHelper.isTestEnv ? false : "text"
    };
  }
  construct(...args) {
    super.construct(...args);
    this.avatarRendering = new AvatarRendering({
      element: this.grid.element
    });
  }
  doDestroy() {
    super.doDestroy();
    this.avatarRendering.destroy();
  }
  getImageURL(imageName) {
    const resourceImagePath = this.grid.resourceImagePath || "", parts = resourceImagePath.split("//"), urlPart = parts.length > 1 ? parts[1] : resourceImagePath, joined = StringHelper.joinPaths([urlPart || "", imageName || ""]);
    return parts.length > 1 ? parts[0] + "//" + joined : joined;
  }
  template(resourceRecord, value) {
    const me = this, {
      showImage,
      showRole,
      showMeta,
      showEventCount,
      grid
    } = me, {
      timeAxis,
      resourceImageExtension = "",
      defaultResourceImageName
    } = grid, roleField = typeof showRole === "string" ? showRole : "role", count = showEventCount && resourceRecord.eventStore.getEvents({
      includeOccurrences: grid.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate
    }).length;
    let imageUrl;
    if (showImage && resourceRecord.image !== false) {
      if (resourceRecord.imageUrl) {
        imageUrl = resourceRecord.imageUrl;
      } else {
        const imageName = typeof showImage === "string" ? showImage : resourceRecord.image || value && me.useNameAsImageName && value.toLowerCase() + resourceImageExtension || defaultResourceImageName || "";
        imageUrl = imageName && me.getImageURL(imageName);
        if (imageUrl && !imageName.includes(".")) {
          if (!me.validNames || me.validNames.includes(imageName)) {
            imageUrl += resourceImageExtension;
          }
        }
      }
    }
    return {
      class: "b-resource-info",
      children: [
        showImage && me.avatarRendering.getResourceAvatar({
          resourceRecord,
          initials: resourceRecord.initials,
          color: resourceRecord.eventColor,
          iconCls: resourceRecord.iconCls,
          imageUrl,
          defaultImageUrl: defaultResourceImageName && this.getImageURL(defaultResourceImageName)
        }),
        showRole || showEventCount || showMeta ? {
          tag: "dl",
          children: [
            {
              tag: "dt",
              text: value
            },
            showRole ? {
              tag: "dd",
              class: "b-resource-role",
              text: resourceRecord.getValue(roleField)
            } : null,
            showEventCount ? {
              tag: "dd",
              class: "b-resource-events",
              html: me.L("L{eventCountText}", count)
            } : null,
            showMeta ? {
              tag: "dd",
              class: "b-resource-meta",
              html: me.showMeta(resourceRecord)
            } : null
          ]
        } : value
        // This becomes a text node, no HTML encoding needed
      ]
    };
  }
  defaultRenderer({ grid, record, cellElement, value, isExport }) {
    let result;
    if (record.isSpecialRow) {
      result = "";
    } else if (isExport) {
      result = value;
    } else {
      if (this.autoScaleThreshold && grid.rowHeight < this.autoScaleThreshold) {
        cellElement.style.fontSize = grid.rowHeight / 40 + "em";
      } else {
        cellElement.style.fontSize = "";
      }
      result = this.template(record, value);
    }
    return result;
  }
};
ColumnStore.registerColumnType(ResourceInfoColumn);
ResourceInfoColumn._$name = "ResourceInfoColumn";

// ../Scheduler/lib/Scheduler/feature/Labels.js
var sides = [
  "top",
  "before",
  "after",
  "bottom"
];
var editorAlign = (side, client) => {
  switch (side) {
    case "top":
      return "b-b";
    case "after":
      return client.rtl ? "r-r" : "l-l";
    case "right":
      return "l-l";
    case "bottom":
      return "t-t";
    case "before":
      return client.rtl ? "l-l" : "r-r";
    case "left":
      return "r-r";
  }
};
var topBottom = {
  top: 1,
  bottom: 1
};
var layoutModes = {
  estimate: 1,
  measure: 1
};
var layoutSides = {
  before: 1,
  after: 1
};
var Labels = class extends InstancePlugin {
  //region Config
  static get $name() {
    return "Labels";
  }
  static get configurable() {
    return {
      /**
       * CSS class to apply to label elements
       * @config {String}
       * @default
       */
      labelCls: "b-sch-label",
      /**
       * Top label configuration object.
       * @config {SchedulerLabelConfig}
       * @default
       */
      top: null,
      /**
       * Configuration object for the label which appears *after* the event bar in the current writing direction.
       * @config {SchedulerLabelConfig}
       * @default
       */
      after: null,
      /**
       * Right label configuration object.
       * @config {SchedulerLabelConfig}
       * @default
       */
      right: null,
      /**
       * Bottom label configuration object.
       * @config {SchedulerLabelConfig}
       * @default
       */
      bottom: null,
      /**
       * Configuration object for the label which appears *before* the event bar in the current writing direction.
       * @config {SchedulerLabelConfig}
       * @default
       */
      before: null,
      /**
       * Left label configuration object.
       * @config {SchedulerLabelConfig}
       * @default
       */
      left: null,
      thisObj: null,
      /**
       * What action should be taken when focus moves leaves the cell editor, for example when clicking outside.
       * May be `'complete'` or `'cancel`'.
       * @config {'complete'|'cancel'}
       * @default
       */
      blurAction: "cancel",
      /**
       * How to handle labels during event layout. Options are:
       *
       * * default - Labels do not affect event layout, events will overlap labels
       * * estimate - Label width is estimated by multiplying text length with {@link #config-labelCharWidth}
       * * measure - Label width is determined by measuring the label, precise but slow
       *
       * Note that this only applies to the left and right labels, top and bottom labels does not take part in the
       * event layout process.
       *
       * @config {'default'|'estimate'|'measure'}
       * @default
       */
      labelLayoutMode: "default",
      /**
       * Factor representing the average char width in pixels used to determine label width when configured
       * with `labelLayoutMode: 'estimate'`.
       * @config {Number}
       * @default
       */
      labelCharWidth: 7
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["onEventDataGenerated"]
    };
  }
  //endregion
  //region Init & destroy
  construct(scheduler, config) {
    const me = this;
    if (scheduler.isVertical) {
      throw new Error("Labels feature is not supported in vertical mode");
    }
    me.scheduler = scheduler;
    super.construct(scheduler, config);
    if (me.top || me.bottom || me.before || me.after) {
      me.updateHostClasslist();
    }
  }
  updateHostClasslist() {
    const { top, bottom } = this, { classList } = this.scheduler.element;
    classList.remove("b-labels-topbottom");
    classList.remove("b-labels-top");
    classList.remove("b-labels-bottom");
    if (top || bottom) {
      classList.add("b-labels-topbottom");
      if (top) {
        classList.add("b-labels-top");
      }
      if (bottom) {
        classList.add("b-labels-bottom");
      }
    }
  }
  onLabelDblClick(event) {
    const me = this, target = event.target;
    if (target && !me.scheduler.readOnly) {
      const { side } = target.dataset, labelConfig = me[side], { editor, field } = labelConfig;
      if (editor) {
        const eventRecord = this.scheduler.resolveEventRecord(event.target);
        if (eventRecord.readOnly) {
          return;
        }
        if (!(editor instanceof Editor)) {
          labelConfig.editor = new Editor({
            blurAction: me.blurAction,
            inputField: editor,
            scrollAction: "realign"
          });
        }
        labelConfig.editor.render(me.scheduler.element);
        labelConfig.editor.startEdit({
          target,
          align: editorAlign(side, me.client),
          matchSize: false,
          record: eventRecord,
          field
        });
        event.stopImmediatePropagation();
        return false;
      }
    }
  }
  changeTop(top) {
    return this.processLabelSpec(top, "top");
  }
  updateTop() {
    this.updateHostClasslist();
  }
  changeAfter(after) {
    return this.processLabelSpec(after, "after");
  }
  updateAfter() {
    this.updateHostClasslist();
  }
  changeRight(right) {
    this[this.client.rtl ? "before" : "after"] = right;
  }
  changeBottom(bottom) {
    return this.processLabelSpec(bottom, "bottom");
  }
  updateBottom() {
    this.updateHostClasslist();
  }
  changeBefore(before) {
    return this.processLabelSpec(before, "before");
  }
  updateBefore() {
    this.updateHostClasslist();
  }
  changeLeft(left) {
    this[this.client.rtl ? "after" : "before"] = left;
  }
  processLabelSpec(labelSpec, side) {
    if (typeof labelSpec === "function") {
      labelSpec = {
        renderer: labelSpec
      };
    } else if (typeof labelSpec === "string") {
      labelSpec = {
        field: labelSpec
      };
    } else if (labelSpec) {
      labelSpec = Object.setPrototypeOf({}, labelSpec);
    } else {
      return null;
    }
    const { scheduler } = this, { eventStore, resourceStore, taskStore, id } = scheduler, { field, editor } = labelSpec;
    if (topBottom[side]) {
      scheduler.milestoneWidth = null;
    }
    if (eventStore && !taskStore) {
      labelSpec.recordType = "event";
    } else {
      labelSpec.recordType = "task";
    }
    if (field) {
      let fieldDef, fieldFound = false;
      if (eventStore && !taskStore) {
        fieldDef = eventStore.modelClass.fieldMap[field];
        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = "event";
          fieldFound = true;
        } else if (Reflect.has(eventStore.modelClass.prototype, field)) {
          labelSpec.recordType = "event";
          fieldFound = true;
        }
      }
      if (!fieldDef && taskStore) {
        fieldDef = taskStore.modelClass.fieldMap[field];
        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = "task";
          fieldFound = true;
        } else if (Reflect.has(resourceStore.modelClass.prototype, field)) {
          labelSpec.recordType = "task";
          fieldFound = true;
        }
      }
      if (!fieldDef && resourceStore) {
        fieldDef = resourceStore.modelClass.fieldMap[field];
        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = "resource";
          fieldFound = true;
        } else if (Reflect.has(resourceStore.modelClass.prototype, field)) {
          labelSpec.recordType = "resource";
          fieldFound = true;
        }
      }
      if (editor) {
        if (typeof editor === "boolean") {
          scheduler.editor = {
            type: "textfield"
          };
        } else if (typeof editor === "string") {
          scheduler.editor = {
            type: editor
          };
        }
        EventHelper.on({
          element: scheduler.timeAxisSubGrid.element,
          delegate: ".b-sch-label",
          dblclick: "onLabelDblClick",
          thisObj: this
        });
      }
    }
    return labelSpec;
  }
  doDisable(disable) {
    super.doDisable(disable);
    if (this.client.isPainted) {
      this.client.refresh();
    }
  }
  //endregion
  generateLabelConfigs(data) {
    const me = this, configs = [];
    for (const side of sides) {
      if (me[side]) {
        const {
          field,
          fieldDef,
          recordType,
          renderer,
          thisObj
        } = me[side], domConfig = {
          tag: "label",
          className: {
            [me.labelCls]: 1,
            [`${me.labelCls}-${side}`]: 1
          },
          dataset: {
            side,
            taskFeature: `label-${side}`
          }
        };
        let value;
        const eventRecordProperty = `${recordType}Record`, eventRecord = data[eventRecordProperty];
        if (renderer) {
          value = renderer.call(thisObj || me.thisObj || me, {
            [eventRecordProperty]: eventRecord,
            resourceRecord: data.resourceRecord,
            assignmentRecord: data.assignmentRecord,
            domConfig
          });
        } else {
          value = eventRecord.getValue(field);
          if ((fieldDef == null ? void 0 : fieldDef.type) === "date" && !renderer) {
            value = DateHelper.format(value, me.client.displayDateFormat);
          } else {
            value = StringHelper.encodeHtml(value);
          }
        }
        domConfig.html = value || "\xA0";
        configs.push(domConfig);
      }
    }
    return configs;
  }
  measureLabels(configs, data) {
    const me = this, pxPerMS = me.client.timeAxisViewModel.getSingleUnitInPixels("millisecond");
    for (const config of configs) {
      if (layoutSides[config.dataset.side]) {
        let { html } = config;
        let length = 0;
        if (me.labelLayoutMode === "estimate") {
          if (html.includes("<")) {
            html = DomHelper.stripTags(html);
          }
          length = html.length * me.labelCharWidth + 18;
        } else {
          const element = me.labelMeasureElement || (me.labelMeasureElement = DomHelper.createElement({
            className: "b-sch-event-wrap b-measure-label",
            parent: me.client.foregroundCanvas
          }));
          element.retainElement = true;
          DomSync.sync({
            targetElement: element,
            domConfig: {
              onlyChildren: true,
              children: [
                config
              ]
            }
          });
          length = element.firstElementChild.offsetWidth;
        }
        const ms = length / pxPerMS;
        switch (config.dataset.side) {
          case "before":
            data.startMS -= ms;
            break;
          case "after":
            data.endMS += ms;
            break;
        }
      }
    }
  }
  onEventDataGenerated(data) {
    var _a;
    if (!this.disabled && !((_a = data.eventRecord) == null ? void 0 : _a.isResourceTimeRange)) {
      const configs = this.generateLabelConfigs(data);
      if (layoutModes[this.labelLayoutMode]) {
        this.measureLabels(configs, data);
      }
      data.wrapperChildren.push(...configs);
    }
  }
  updateLabelLayoutMode() {
    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }
  updateLabelCharWidth() {
    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }
};
Labels.featureClass = "b-sch-labels";
Labels._$name = "Labels";
GridFeatureManager.registerFeature(Labels, false, "Scheduler");

// ../Scheduler/lib/Scheduler/feature/RowReorder.js
var RowReorder2 = class extends TransactionalFeature_default(RowReorder) {
  onDragStart(...args) {
    super.onDragStart(...args);
    if (this.client.transactionalFeaturesEnabled) {
      return this.startFeatureTransaction();
    }
  }
  onDrop(...args) {
    this.rejectFeatureTransaction();
    return super.onDrop(...args);
  }
  onAbort(...args) {
    this.rejectFeatureTransaction();
    return super.onAbort(...args);
  }
};
__publicField(RowReorder2, "$name", "RowReorder");
RowReorder2._$name = "RowReorder";
GridFeatureManager.registerFeature(RowReorder2, false, "Scheduler");
GridFeatureManager.registerFeature(RowReorder2, true, "Gantt");

// ../Scheduler/lib/Scheduler/feature/TimelineSummary.js
var TimelineSummary = class extends Summary {
  //region Config
  static get $name() {
    return "TimelineSummary";
  }
  static get configurable() {
    return {
      /**
       * Show tooltip containing summary values and labels
       * @config {Boolean}
       * @default
       */
      showTooltip: true
    };
  }
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["renderRows", "updateProject"]
    };
  }
  //endregion
  //region Init
  construct(client, config) {
    const me = this;
    super.construct(client, config);
    if (!me.summaries) {
      me.summaries = [{ renderer: me.renderer }];
    }
    if (client.isTimelineBase) {
      me.updateProject(client.project);
      client.ion({
        timeAxisViewModelUpdate: me.renderRows,
        thisObj: me
      });
    }
  }
  //endregion
  //region Render
  updateProject(project) {
    this.detachListeners("summaryProject");
    project.ion({
      name: "summaryProject",
      dataReady: "updateTimelineSummaries",
      thisObj: this
    });
  }
  renderRows() {
    if (this.client.isHorizontal) {
      this.client.timeAxisSubGrid.footer.element.querySelector(".b-grid-footer").classList.add("b-sch-summarybar");
    }
    super.renderRows();
    if (!this.disabled) {
      this.render();
    }
  }
  get summaryBarElement() {
    return this.client.element.querySelector(".b-sch-summarybar");
  }
  render() {
    const me = this, { client: timeline } = me, sizeProp = timeline.isHorizontal ? "width" : "height", colCfg = timeline.timeAxisViewModel.columnConfig, summaryContainer = me.summaryBarElement;
    if (summaryContainer) {
      if (!me._tip && me.showTooltip && me.summaries.some((config) => config.label)) {
        me._tip = new Tooltip({
          id: `${timeline.id}-summary-tip`,
          cls: "b-timeaxis-summary-tip",
          hoverDelay: 0,
          hideDelay: 100,
          forElement: summaryContainer,
          anchorToTarget: true,
          trackMouse: false,
          forSelector: ".b-timeaxis-tick",
          getHtml: ({ activeTarget }) => activeTarget._tipHtml
        });
      }
      summaryContainer.innerHTML = colCfg[colCfg.length - 1].map((col) => `<div class="b-timeaxis-tick" style="${sizeProp}: ${col.width}px"></div>`).join("");
      me.updateTimelineSummaries();
    }
  }
  //endregion
  /**
   * Refreshes the summaries
   */
  refresh() {
    super.refresh();
    this.updateTimelineSummaries();
  }
  doDisable(disable) {
    var _a;
    const { isConfiguring } = this.client;
    super.doDisable(disable);
    (_a = this.summaryColumn) == null ? void 0 : _a.toggle(!disable);
    if (!isConfiguring && !disable) {
      this.render();
    }
  }
  doDestroy() {
    var _a;
    (_a = this._tip) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
};
TimelineSummary._$name = "TimelineSummary";

// ../Scheduler/lib/Scheduler/feature/export/Utils.js
var ScheduleRange = {
  completeview: "completeview",
  // completedata : 'completedata',
  currentview: "currentview",
  daterange: "daterange"
};

// ../Scheduler/lib/Scheduler/feature/export/exporter/SchedulerExporterMixin.js
var immediatePromise = Promise.resolve();
var SchedulerExporterMixin_default = (base) => class SchedulerExporterMixin extends base {
  async scrollRowIntoView(client, index) {
    const {
      rowManager,
      scrollable
    } = client, oldY = scrollable.y;
    if (index < client.store.count) {
      scrollable.scrollTo(null, rowManager.calculateTop(index));
      if (scrollable.y !== oldY) {
        return new Promise((resolve) => {
          const detacher = client.ion({
            scroll({ scrollTop }) {
              if (scrollTop != null && rowManager.getRow(index)) {
                detacher();
                resolve();
              }
            }
          });
        });
      }
    }
    return immediatePromise;
  }
  async scrollToDate(client, date) {
    let scrollFired = false;
    const promises = [];
    const detacher = client.timeAxisSubGrid.scrollable.ion({
      scrollStart({ x }) {
        if (x != null) {
          scrollFired = true;
        }
      }
    });
    promises.push(client.scrollToDate(date, { block: "start" }));
    detacher();
    if (scrollFired) {
      promises.push(client.timeAxisSubGrid.header.scrollable.await("scrollEnd", { checkLog: false }));
    }
    await Promise.all(promises);
  }
  cloneElement(element, target, clear) {
    super.cloneElement(element, target, clear);
    const clonedEl = this.element.querySelector(".b-schedulerbase");
    clonedEl == null ? void 0 : clonedEl.classList.remove(...["fade-in", "slide-from-left", "slide-from-top", "zoom-in"].map((name) => `b-initial-${name}`));
  }
  async prepareComponent(config) {
    const me = this, { client } = config, { currentOrientation } = client, includeTimeline = client.timeAxisSubGrid.width > 0;
    switch (config.scheduleRange) {
      case ScheduleRange.completeview:
        config.rangeStart = client.startDate;
        config.rangeEnd = client.endDate;
        break;
      case ScheduleRange.currentview: {
        const { startDate, endDate } = client.visibleDateRange;
        config.rangeStart = startDate;
        config.rangeEnd = endDate;
        break;
      }
    }
    await client.waitForAnimations();
    config.infiniteScroll = client.infiniteScroll;
    client.infiniteScroll = false;
    if (includeTimeline) {
      client.setTimeSpan(config.rangeStart, config.rangeEnd);
      if (config.scheduleRange === ScheduleRange.daterange) {
        config.rangeStart = client.startDate;
        config.rangeEnd = client.endDate;
      }
      client.svgCanvas;
    }
    me._oldEnableEventAnimations = client.enableEventAnimations;
    client.enableEventAnimations = false;
    if (currentOrientation.isHorizontalRendering) {
      me._oldScrollBuffer = currentOrientation.scrollBuffer;
      me._oldVerticalBuffer = currentOrientation.verticalBufferSize;
      currentOrientation.scrollBuffer = 100;
      currentOrientation.verticalBufferSize = -1;
    }
    client.ignoreViewBox = true;
    await super.prepareComponent(config);
    const { exportMeta, element } = me, fgCanvasEl = element.querySelector(".b-sch-foreground-canvas"), timeAxisEl = element.querySelector(".b-horizontaltimeaxis");
    exportMeta.includeTimeline = includeTimeline;
    if (includeTimeline && config.scheduleRange !== ScheduleRange.completeview) {
      exportMeta.totalWidth -= exportMeta.subGrids.normal.width;
      exportMeta.totalWidth += exportMeta.subGrids.normal.width = client.timeAxisViewModel.getDistanceBetweenDates(config.rangeStart, config.rangeEnd);
      const horizontalPages = Math.ceil(exportMeta.totalWidth / exportMeta.pageWidth), totalPages = horizontalPages * exportMeta.verticalPages;
      exportMeta.horizontalPages = horizontalPages;
      exportMeta.totalPages = totalPages;
      exportMeta.subGrids.normal.scrollLeft = client.getCoordinateFromDate(config.rangeStart);
    }
    exportMeta.timeAxisHeaders = [];
    exportMeta.timeAxisPlaceholders = [];
    exportMeta.headersColleted = false;
    DomHelper.forEachSelector(timeAxisEl, ".b-sch-header-row", (headerRow) => {
      exportMeta.timeAxisPlaceholders.push(me.createPlaceholder(headerRow));
      exportMeta.timeAxisHeaders.push(/* @__PURE__ */ new Map());
    });
    exportMeta.subGrids.normal.eventsPlaceholder = me.createPlaceholder(fgCanvasEl, false);
    DomHelper.removeEachSelector(fgCanvasEl, ".b-sch-event-wrap,.b-sch-resourcetimerange");
    DomHelper.removeEachSelector(me.element, ".b-released");
    exportMeta.eventsBoxes = /* @__PURE__ */ new Map();
    exportMeta.client = client;
    const columnLinesCanvas = element.querySelector(".b-column-lines-canvas"), timeRangesHeaderCanvas = element.querySelector(".b-sch-timeaxiscolumn .b-sch-timeranges-canvas"), timeRangesBodyCanvas = element.querySelector(".b-timeaxissubgrid .b-sch-timeranges-canvas");
    if (client.hasActiveFeature("columnLines") && columnLinesCanvas) {
      exportMeta.columnLinesPlaceholder = me.createPlaceholder(columnLinesCanvas);
      exportMeta.columnLines = { lines: /* @__PURE__ */ new Map(), majorLines: /* @__PURE__ */ new Map() };
    }
    if (client.hasActiveFeature("timeRanges") && timeRangesBodyCanvas) {
      exportMeta.timeRanges = {};
      if (timeRangesHeaderCanvas) {
        exportMeta.timeRanges.header = config.enableDirectRendering ? "" : {};
        exportMeta.timeRangesHeaderPlaceholder = me.createPlaceholder(timeRangesHeaderCanvas);
      }
      exportMeta.timeRanges.body = config.enableDirectRendering ? "" : {};
      exportMeta.timeRangesBodyPlaceholder = me.createPlaceholder(timeRangesBodyCanvas);
    }
    if (client.hasActiveFeature("dependencies")) {
      client.features.dependencies.fillDrawingCache();
      const svgCanvasEl = element.querySelector(`[id="${client.svgCanvas.getAttribute("id")}"]`);
      if (svgCanvasEl) {
        exportMeta.dependencyCanvasEl = svgCanvasEl;
        exportMeta.dependenciesPlaceholder = me.createPlaceholder(svgCanvasEl, false, {
          ns: "http://www.w3.org/2000/svg",
          tag: "path"
        });
        DomHelper.removeEachSelector(svgCanvasEl, ".b-sch-dependency");
      }
    }
    if (includeTimeline && !DateHelper.betweenLesser(config.rangeStart, client.startDate, client.endDate)) {
      await me.scrollToDate(client, config.rangeStart);
    }
  }
  async restoreState(config) {
    let waitForHorizontalScroll = false;
    const { client } = config, promises = [];
    const detacher = client.timeAxisSubGrid.scrollable.ion({
      scrollStart({ x }) {
        if (this.element.scrollLeft !== x) {
          waitForHorizontalScroll = true;
        }
      }
    });
    promises.push(super.restoreState(config));
    detacher();
    if (waitForHorizontalScroll) {
      promises.push(client.timeAxisSubGrid.header.scrollable.await("scrollEnd", { checkLog: false }));
    }
    await Promise.all(promises);
  }
  async restoreComponent(config) {
    const { client } = config, { currentOrientation } = client;
    client.ignoreViewBox = false;
    client.infiniteScroll = config.infiniteScroll;
    client.enableEventAnimations = this._oldEnableEventAnimations;
    if (currentOrientation.isHorizontalRendering) {
      currentOrientation.scrollBuffer = this._oldScrollBuffer;
      currentOrientation.verticalBufferSize = this._oldVerticalBuffer;
    }
    await super.restoreComponent(config);
  }
  async onRowsCollected(rows, config) {
    const me = this;
    await super.onRowsCollected(rows, config);
    if (me.exportMeta.includeTimeline) {
      const { client, enableDirectRendering } = config, { timeView } = client, { pageRangeStart, pageRangeEnd } = me.getCurrentPageDateRange(config);
      if (enableDirectRendering) {
        if (pageRangeStart && pageRangeEnd) {
          me.renderHeaders(config, pageRangeStart, pageRangeEnd);
          me.renderLines(config, pageRangeStart, pageRangeEnd);
          me.renderRanges(config, pageRangeStart, pageRangeEnd);
          me.renderEvents(config, rows, pageRangeStart, pageRangeEnd);
        }
      } else {
        if (pageRangeStart) {
          let rangeProcessed = false;
          await me.scrollToDate(client, pageRangeStart);
          while (!rangeProcessed) {
            me.collectLines(config);
            me.collectHeaders(config);
            me.collectRanges(config);
            me.collectEvents(rows, config);
            if (DateHelper.timeSpanContains(timeView.startDate, timeView.endDate, pageRangeStart, pageRangeEnd)) {
              rangeProcessed = true;
            } else if (timeView.endDate.getTime() >= pageRangeEnd.getTime()) {
              rangeProcessed = true;
            } else {
              const endDate = timeView.endDate;
              await me.scrollToDate(client, timeView.endDate);
              if (endDate.getTime() === timeView.endDate.getTime()) {
                throw new Error("Could not scroll to date");
              }
            }
          }
        }
        await me.scrollToDate(client, config.rangeStart);
      }
    }
  }
  getCurrentPageDateRange({ rangeStart, rangeEnd, enableDirectRendering, client }) {
    const me = this, { exportMeta } = me, { horizontalPages, horizontalPosition, pageWidth, subGrids } = exportMeta;
    let pageRangeStart, pageRangeEnd;
    if (horizontalPages > 1) {
      const pageStartX = horizontalPosition * pageWidth, pageEndX = (horizontalPosition + 1) * pageWidth, normalGridX = subGrids.locked.width + subGrids.locked.splitterWidth;
      if (pageEndX <= normalGridX) {
        pageRangeEnd = pageRangeStart = null;
      } else {
        const { scrollLeft = 0 } = subGrids.normal;
        pageRangeStart = client.getDateFromCoordinate(Math.max(pageStartX - normalGridX + scrollLeft, 0));
        const multiplier = enableDirectRendering ? 1 : 1.2;
        pageRangeEnd = client.getDateFromCoordinate((pageEndX - normalGridX + scrollLeft) * multiplier) || rangeEnd;
      }
    } else {
      pageRangeStart = rangeStart;
      pageRangeEnd = rangeEnd;
    }
    return {
      pageRangeStart,
      pageRangeEnd
    };
  }
  prepareExportElement() {
    const { element, exportMeta } = this, { id, headerId, footerId, scrollLeft } = exportMeta.subGrids.normal, el = element.querySelector(`[id="${id}"]`);
    el.querySelectorAll(".b-sch-canvas").forEach((canvasEl) => {
      if (exportMeta.lastExportedRowBottom) {
        canvasEl.style.height = `${exportMeta.lastExportedRowBottom}px`;
      } else {
        canvasEl.style.height = "";
      }
      if (scrollLeft) {
        canvasEl.style.marginLeft = `-${scrollLeft}px`;
      }
    });
    if (scrollLeft) {
      [headerId, footerId].forEach((id2) => {
        const el2 = element.querySelector(`[id="${id2}"] .b-widget-scroller`);
        if (el2) {
          el2.style.marginLeft = `-${scrollLeft}px`;
        }
      });
    }
    return super.prepareExportElement();
  }
  collectHeaders(config) {
    const me = this, { client } = config, { exportMeta } = me;
    if (!exportMeta.headersCollected) {
      const timeAxisEl = client.timeView.element, timeAxisHeaders = exportMeta.timeAxisHeaders;
      DomHelper.forEachSelector(timeAxisEl, ".b-sch-header-row", (headerRow, index, headerRows) => {
        const headersMap = timeAxisHeaders[index];
        DomHelper.forEachSelector(headerRow, ".b-sch-header-timeaxis-cell", (el) => {
          if (!headersMap.has(el.dataset.tickIndex)) {
            headersMap.set(el.dataset.tickIndex, el.outerHTML);
          }
        });
        if (index === headerRows.length - 1 && headersMap.has(String(client.timeAxis.count - 1))) {
          exportMeta.headersCollected = true;
        }
      });
    }
  }
  collectRanges(config) {
    const me = this, { client } = config, { exportMeta } = me, { timeRanges } = exportMeta;
    if (!exportMeta.headersCollected && timeRanges) {
      const { headerCanvas, bodyCanvas } = client.features.timeRanges;
      if (headerCanvas) {
        DomHelper.forEachSelector(headerCanvas, ".b-sch-timerange", (el) => {
          timeRanges.header[el.dataset.id] = el.outerHTML;
        });
      }
      DomHelper.forEachSelector(bodyCanvas, ".b-sch-timerange", (el) => {
        timeRanges.body[el.dataset.id] = el.outerHTML;
      });
    }
  }
  collectLines(config) {
    const me = this, { client } = config, { exportMeta } = me, { columnLines } = exportMeta;
    if (!exportMeta.headersCollected && columnLines) {
      client.timeAxisSubGridElement.querySelectorAll(".b-column-line, .b-column-line-major").forEach((lineEl) => {
        if (lineEl.classList.contains("b-column-line")) {
          const lineIndex = Number(lineEl.dataset.line.replace(/line-/, ""));
          columnLines.lines.set(lineIndex, lineEl.outerHTML);
        } else {
          const lineIndex = Number(lineEl.dataset.line.replace(/major-/, ""));
          columnLines.majorLines.set(lineIndex, lineEl.outerHTML);
        }
      });
    }
  }
  collectEvents(rows, config) {
    const me = this, addedRows = rows.length, { client } = config, normalRows = me.exportMeta.subGrids.normal.rows;
    rows.forEach((row, index) => {
      var _a, _b;
      const rowConfig = normalRows[normalRows.length - addedRows + index], resource = client.store.getAt(row.dataIndex), eventsMap = rowConfig[3];
      (_a = resource.events) == null ? void 0 : _a.forEach((event) => {
        if (event.isScheduled) {
          let el = client.getElementFromEventRecord(event, resource);
          if (el && (el = el.parentElement) && !eventsMap.has(event.id)) {
            eventsMap.set(event.id, [el.outerHTML, Rectangle.from(el, el.offsetParent)]);
          }
        }
      });
      (_b = resource.timeRanges) == null ? void 0 : _b.forEach((timeRange) => {
        var _a2;
        const elId = ((_a2 = client.features.resourceTimeRanges) == null ? void 0 : _a2.generateElementId(timeRange)) || "", el = client.foregroundCanvas.syncIdMap[elId];
        if (el && !eventsMap.has(elId)) {
          eventsMap.set(elId, [el.outerHTML, Rectangle.from(el, el.offsetParent)]);
        }
      });
    });
  }
  //#region Direct rendering
  renderHeaders(config, start, end) {
    const me = this, { exportMeta } = me, { client } = config, timeAxisHeaders = exportMeta.timeAxisHeaders, { timeAxisView } = client.timeAxisColumn, domConfig = timeAxisView.buildCells(start, end), targetElement = document.createElement("div");
    DomSync.sync({
      targetElement,
      domConfig
    });
    DomHelper.forEachSelector(targetElement, ".b-sch-header-row", (headerRow, index) => {
      const headersMap = timeAxisHeaders[index];
      DomHelper.forEachSelector(headerRow, ".b-sch-header-timeaxis-cell", (el) => {
        if (!headersMap.has(el.dataset.tickIndex)) {
          headersMap.set(el.dataset.tickIndex, el.outerHTML);
        }
      });
    });
  }
  renderEvents(config, rows, start, end) {
    const me = this, { client } = config, normalRows = me.exportMeta.subGrids.normal.rows;
    rows.forEach((row, index) => {
      const rowConfig = normalRows[index], eventsMap = rowConfig[3], resource = client.store.getAt(row.dataIndex), resourceLayout = client.currentOrientation.getResourceLayout(resource), left = client.getCoordinateFromDate(start), right = client.getCoordinateFromDate(end), eventDOMConfigs = client.currentOrientation.getEventDOMConfigForCurrentView(resourceLayout, row, left, right), targetElement = document.createElement("div");
      eventDOMConfigs.forEach((domConfig) => {
        const { eventId } = domConfig.dataset, { left: left2, top, width, height } = domConfig.style;
        DomSync.sync({
          targetElement,
          domConfig
        });
        eventsMap.set(eventId, [targetElement.outerHTML, new Rectangle(left2, top, width, height)]);
      });
    });
  }
  renderLines(config, start, end) {
    const me = this, { client } = config, { exportMeta } = me, { columnLines } = exportMeta;
    if (columnLines) {
      const domConfigs = client.features.columnLines.getColumnLinesDOMConfig(start, end), targetElement = document.createElement("div");
      DomSync.sync({
        targetElement,
        domConfig: {
          onlyChildren: true,
          children: domConfigs
        }
      });
      columnLines.lines.set(0, targetElement.innerHTML);
    }
  }
  renderRanges(config, start, end) {
    const me = this, { client } = config, { exportMeta } = me, { timeRanges } = exportMeta;
    if (timeRanges) {
      const domConfigs = client.features.timeRanges.getDOMConfig(start, end), targetElement = document.createElement("div");
      domConfigs.forEach((children, i) => {
        DomSync.sync({
          targetElement,
          domConfig: {
            children,
            onlyChildren: true
          }
        });
        if (i === 0) {
          timeRanges.body = targetElement.innerHTML;
        } else {
          timeRanges.header = targetElement.innerHTML;
        }
      });
    }
  }
  //#endregion
  buildPageHtml(config) {
    const me = this, {
      subGrids,
      timeAxisHeaders,
      timeAxisPlaceholders,
      columnLines,
      columnLinesPlaceholder,
      timeRanges,
      timeRangesHeaderPlaceholder,
      timeRangesBodyPlaceholder
    } = me.exportMeta, { enableDirectRendering } = config;
    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({ placeHolder, eventsPlaceholder, rows, mergedCellsHtml }) => {
      const placeHolderText = placeHolder.outerHTML, { resources, events } = me.positionRows(rows, config);
      let contentHtml = resources.join("");
      if (mergedCellsHtml == null ? void 0 : mergedCellsHtml.length) {
        contentHtml += `<div class="b-grid-merged-cells-container">${mergedCellsHtml.join("")}</div>`;
      }
      html = html.replace(placeHolderText, contentHtml);
      if (eventsPlaceholder) {
        html = html.replace(eventsPlaceholder.outerHTML, events.join(""));
      }
    });
    timeAxisHeaders.forEach((headers, index) => {
      html = html.replace(timeAxisPlaceholders[index].outerHTML, Array.from(headers.values()).join(""));
    });
    if (columnLines) {
      const lineElements = Array.from(columnLines.lines.values()).concat(Array.from(columnLines.majorLines.values()));
      html = html.replace(columnLinesPlaceholder.outerHTML, lineElements.join(""));
      if (enableDirectRendering) {
        me.exportMeta.columnLines.lines.clear();
        me.exportMeta.columnLines.majorLines.clear();
      }
    }
    if (timeRanges) {
      if (enableDirectRendering) {
        html = html.replace(timeRangesBodyPlaceholder.outerHTML, timeRanges.body);
        if (timeRangesHeaderPlaceholder) {
          html = html.replace(timeRangesHeaderPlaceholder.outerHTML, timeRanges.header);
        }
        me.exportMeta.timeRanges = {};
      } else {
        html = html.replace(timeRangesBodyPlaceholder.outerHTML, Object.values(timeRanges.body).join(""));
        if (timeRangesHeaderPlaceholder) {
          html = html.replace(timeRangesHeaderPlaceholder.outerHTML, Object.values(timeRanges.body).join(""));
        }
      }
    }
    html = me.buildDependenciesHtml(html);
    return html;
  }
  getEventBox(event) {
    const me = this, {
      eventsBoxes,
      enableDirectRendering
    } = me.exportMeta;
    const box = event && eventsBoxes.get(String(event.id));
    if (enableDirectRendering && box && event.isMilestone) {
      box.translate(-box.width / 2, 0);
    }
    return box;
  }
  renderDependencies() {
    const me = this, {
      client,
      eventsBoxes
    } = me.exportMeta, { dependencies } = client, dependencyFeature = client.features.dependencies, targetElement = DomHelper.createElement();
    let draw = false;
    dependencies.forEach((dependency) => {
      if (!eventsBoxes.has(String(dependency.from)) && !eventsBoxes.has(String(dependency.to)) || !dependencyFeature.isDependencyVisible(dependency)) {
        return;
      }
      const fromBox = me.getEventBox(dependency.fromEvent), toBox = me.getEventBox(dependency.toEvent);
      dependencyFeature.drawDependency(dependency, true, { from: fromBox == null ? void 0 : fromBox.clone(), to: toBox == null ? void 0 : toBox.clone() });
      draw = true;
    });
    if (draw) {
      dependencyFeature.domSync(targetElement, true);
    }
    return targetElement.innerHTML;
  }
  buildDependenciesHtml(html) {
    const { dependenciesPlaceholder, includeTimeline } = this.exportMeta;
    if (dependenciesPlaceholder && includeTimeline) {
      const placeholder = dependenciesPlaceholder.outerHTML;
      html = html.replace(placeholder, this.renderDependencies());
    }
    return html;
  }
};

// ../Scheduler/lib/Scheduler/feature/export/exporter/MultiPageExporter.js
var MultiPageExporter2 = class extends SchedulerExporterMixin_default(MultiPageExporter) {
  static get $name() {
    return "MultiPageExporter";
  }
  static get type() {
    return "multipage";
  }
  async stateNextPage(config) {
    await super.stateNextPage(config);
    this.exportMeta.eventsBoxes.clear();
  }
  positionRows(rows) {
    const resources = [], events = [];
    rows.forEach(([html, top, height, eventsHtml]) => {
      resources.push(html);
      eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html2, box, extras = []]]) => {
        events.push(html2 + extras.join(""));
        this.exportMeta.eventsBoxes.set(String(key), box);
      });
    });
    return { resources, events };
  }
};
MultiPageExporter2._$name = "MultiPageExporter";

// ../Scheduler/lib/Scheduler/feature/export/exporter/MultiPageVerticalExporter.js
var MultiPageVerticalExporter2 = class extends SchedulerExporterMixin_default(MultiPageVerticalExporter) {
  static get $name() {
    return "MultiPageVerticalExporter";
  }
  static get type() {
    return "multipagevertical";
  }
  async stateNextPage(config) {
    await super.stateNextPage(config);
    this.exportMeta.eventsBoxes.clear();
  }
  async prepareComponent(config) {
    await super.prepareComponent(config);
    if (config.scheduleRange !== ScheduleRange.completeview) {
      this.estimateTotalPages(config);
    }
  }
  positionRows(rows) {
    const resources = [], events = [];
    rows.forEach(([html, , , eventsHtml]) => {
      resources.push(html);
      eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html2, box, extras = []]]) => {
        events.push(html2 + extras.join(""));
        this.exportMeta.eventsBoxes.set(String(key), box);
      });
    });
    return { resources, events };
  }
};
MultiPageVerticalExporter2._$name = "MultiPageVerticalExporter";

// ../Scheduler/lib/Scheduler/view/export/field/ScheduleRangeCombo.js
var ScheduleRangeCombo = class extends Combo {
  static get $name() {
    return "ScheduleRangeCombo";
  }
  // Factoryable type name
  static get type() {
    return "schedulerangecombo";
  }
  static get defaultConfig() {
    return {
      editable: false,
      localizeDisplayFields: true,
      displayField: "text",
      buildItems() {
        return Object.entries(ScheduleRange).map(([id, text]) => ({ value: id, text: "L{" + text + "}" }));
      }
    };
  }
};
ScheduleRangeCombo.initClass();
ScheduleRangeCombo._$name = "ScheduleRangeCombo";

// ../Scheduler/lib/Scheduler/view/export/SchedulerExportDialog.js
var SchedulerExportDialog = class extends ExportDialog {
  //region Config
  static get $name() {
    return "SchedulerExportDialog";
  }
  static get type() {
    return "schedulerexportdialog";
  }
  static get configurable() {
    return {
      defaults: {
        localeClass: this
      },
      items: {
        scheduleRangeField: {
          type: "schedulerangecombo",
          label: "L{Schedule range}",
          name: "scheduleRange",
          value: "completeview",
          weight: 150,
          onChange({ value }) {
            this.parent.widgetMap.rangesContainer.hidden = value !== ScheduleRange.daterange;
          }
        },
        rangesContainer: {
          type: "container",
          flex: "1 0 100%",
          weight: 151,
          hidden: true,
          defaults: {
            localeClass: this
          },
          items: {
            filler: {
              // Filler widget to align date fields
              weight: 0,
              type: "widget",
              style: "margin-inline-end: -1em;"
            },
            rangeStartField: {
              type: "datefield",
              label: "L{Export from}",
              name: "rangeStart",
              labelWidth: "3em",
              flex: "1 0 25%",
              weight: 10,
              onChange({ value }) {
                this.parent.widgetMap.rangeEndField.min = DateHelper.add(value, 1, "d");
              }
            },
            rangeEndField: {
              type: "datefield",
              label: "L{Export to}",
              name: "rangeEnd",
              labelWidth: "1em",
              flex: "1 0 25%",
              weight: 30,
              onChange({ value }) {
                this.parent.widgetMap.rangeStartField.max = DateHelper.add(value, -1, "d");
              }
            }
          }
        }
      }
    };
  }
  //endregion
  onLocaleChange() {
    const labelWidth = this.L("labelWidth");
    this.width = this.L("L{width}");
    this.items.forEach((widget) => {
      if (widget instanceof Field) {
        widget.labelWidth = labelWidth;
      } else if (widget.ref === "rangesContainer") {
        widget.items[0].width = labelWidth;
      }
    });
  }
  applyInitialValues(config) {
    super.applyInitialValues(config);
    const me = this, {
      client,
      scheduleRange
    } = config, items = config.items = config.items || {}, scheduleRangeField = items.scheduleRangeField = items.scheduleRangeField || {}, rangesContainer = items.rangesContainer = items.rangesContainer || {}, rangesContainerItems = rangesContainer.items = rangesContainer.items || {}, filler = rangesContainerItems.filler = rangesContainerItems.filler || {}, rangeStartField = rangesContainerItems.rangeStartField = rangesContainerItems.rangeStartField || {}, rangeEndField = rangesContainerItems.rangeEndField = rangesContainerItems.rangeEndField || {};
    filler.width = me.L("labelWidth");
    scheduleRangeField.value = scheduleRangeField.value || scheduleRange;
    if (scheduleRangeField.value === ScheduleRange.daterange) {
      rangesContainer.hidden = false;
    }
    const rangeStart = rangeStartField.value = rangeStartField.value || client.startDate;
    rangeStartField.max = DateHelper.max(client.startDate, DateHelper.add(client.endDate, -1, "d"));
    let rangeEnd = rangeEndField.value || client.endDate;
    if (rangeEnd <= rangeStart) {
      rangeEnd = DateHelper.add(rangeStart, 1, "d");
    }
    rangeEndField.value = rangeEnd;
    rangeEndField.min = DateHelper.min(client.endDate, DateHelper.add(client.startDate, 1, "d"));
  }
};
SchedulerExportDialog._$name = "SchedulerExportDialog";

// ../Scheduler/lib/Scheduler/feature/export/exporter/SinglePageExporter.js
var SinglePageExporter2 = class extends SchedulerExporterMixin_default(SinglePageExporter) {
  static get $name() {
    return "SinglePageExporter";
  }
  static get type() {
    return "singlepage";
  }
  // We should not collect dependencies per each page, instead we'd render them once
  collectDependencies() {
  }
  positionRows(rows, config) {
    const resources = [], events = [], translateRe = /translate\((\d+.?\d*)px, (\d+.?\d*)px\)/, topRe = /top:.+?px/;
    if (config.enableDirectRendering) {
      rows.forEach(([html, , , eventsHtml]) => {
        resources.push(html);
        eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html2, box, extras = []]]) => {
          this.exportMeta.eventsBoxes.set(String(key), box);
          events.push(html2 + extras.join(""));
        });
      });
    } else {
      let currentTop = 0;
      rows.forEach(([html, top, height, eventsHtml]) => {
        resources.push(html.replace(translateRe, `translate($1px, ${currentTop}px)`));
        const rowTopDelta = currentTop - top;
        eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html2, box]]) => {
          box.translate(0, rowTopDelta);
          this.exportMeta.eventsBoxes.set(String(key), box);
          events.push(html2.replace(topRe, `top: ${box.y}px`));
        });
        currentTop += height;
      });
    }
    return { resources, events };
  }
};
SinglePageExporter2._$name = "SinglePageExporter";

// ../Scheduler/lib/Scheduler/feature/export/PdfExport.js
var PdfExport2 = class extends PdfExport {
  static get $name() {
    return "PdfExport";
  }
  static get defaultConfig() {
    return {
      exporters: [SinglePageExporter2, MultiPageExporter2, MultiPageVerticalExporter2],
      dialogClass: SchedulerExportDialog,
      /**
       * Specifies how to export time span.
       *  * completeview - Complete configured time span, from scheduler start date to end date
       *  * currentview  - Currently visible time span
       *  * daterange    - Use specific date range, provided additionally in config. See {@link #config-rangeStart}/
       *  {@link #config-rangeEnd}
       * @config {'completeview'|'currentview'|'daterange'}
       * @default
       * @category Export file config
       */
      scheduleRange: "completeview",
      /**
       * Exported time span range start. Used with `daterange` config of the {@link #config-scheduleRange}
       * @config {Date}
       * @category Export file config
       */
      rangeStart: null,
      /**
       * Returns the instantiated export dialog widget as configured by {@link #config-exportDialog}
       * @member {Scheduler.view.export.SchedulerExportDialog} exportDialog
       */
      /**
       * A config object to apply to the {@link Scheduler.view.export.SchedulerExportDialog} widget.
       * @config {SchedulerExportDialogConfig} exportDialog
       */
      /**
       * Exported time span range end. Used with `daterange` config of the {@link #config-scheduleRange}
       * @config {Date}
       * @category Export file config
       */
      rangeEnd: null
    };
  }
  get defaultExportDialogConfig() {
    return ObjectHelper.copyProperties(super.defaultExportDialogConfig, this, ["scheduleRange"]);
  }
  buildExportConfig(config) {
    config = super.buildExportConfig(config);
    const {
      scheduleRange,
      rangeStart,
      rangeEnd
    } = this;
    if (config.columns && !config.columns.find((col) => col.type === "timeAxis")) {
      config.columns.push(config.client.timeAxisColumn.id);
    }
    return ObjectHelper.assign({
      scheduleRange,
      rangeStart,
      rangeEnd
    }, config);
  }
};
PdfExport2._$name = "PdfExport";
GridFeatureManager.registerFeature(PdfExport2, false, "Scheduler");

export {
  ResourceInfoColumn,
  Labels,
  RowReorder2 as RowReorder,
  TimelineSummary,
  ScheduleRange,
  MultiPageExporter2 as MultiPageExporter,
  MultiPageVerticalExporter2 as MultiPageVerticalExporter,
  ScheduleRangeCombo,
  SchedulerExportDialog,
  SinglePageExporter2 as SinglePageExporter,
  PdfExport2 as PdfExport
};
//# sourceMappingURL=chunk-5HVDL77S.js.map
