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
  RecurrenceFrequencyCombo,
  TaskEditStm_default
} from "./chunk-MS4QMERY.js";
import {
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  DateField,
  DatePicker
} from "./chunk-6ZLMCHE5.js";
import {
  RecurrenceDayRuleEncoder,
  TimeSpan
} from "./chunk-KVD75ID2.js";
import {
  ArrayHelper,
  AsyncHelper,
  Base,
  Button,
  Combo,
  Config,
  DateHelper,
  Delayable_default,
  DomHelper,
  InstancePlugin,
  List,
  Localizable_default,
  ObjectHelper,
  Objects,
  Popup,
  Store,
  StringHelper,
  VersionHelper,
  Widget
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/data/util/recurrence/RecurrenceLegend.js
var RecurrenceLegend = class extends Localizable_default() {
  static get $name() {
    return "RecurrenceLegend";
  }
  static get allDaysValueAsArray() {
    return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  }
  static get allDaysValue() {
    return this.allDaysValueAsArray.join(",");
  }
  static get workingDaysValue() {
    return this.allDaysValueAsArray.filter((day, index) => !DateHelper.nonWorkingDays[index]).join(",");
  }
  static get nonWorkingDaysValue() {
    return this.allDaysValueAsArray.filter((day, index) => DateHelper.nonWorkingDays[index]).join(",");
  }
  /**
   * Returns the provided recurrence description. The recurrence might be assigned to a timespan model,
   * in this case the timespan start date should be provided in the second argument.
   * @param {Scheduler.model.RecurrenceModel} recurrenceRecurrence model.
   * @param {Date} [timeSpanStartDate] The recurring timespan start date. Can be omitted if the recurrence is assigned
   * to a timespan model (and the timespan has {@link Scheduler.model.TimeSpan#field-startDate} filled). Then start
   * date will be retrieved from the model.
   * @returns {String} The recurrence description.
   */
  static getLegend(recurrence, timeSpanStartDate) {
    const me = this, { timeSpan, interval, days, monthDays, months, positions } = recurrence, startDate = timeSpanStartDate || timeSpan.startDate, tplData = { interval };
    let fn;
    switch (recurrence.frequency) {
      case "DAILY":
        return interval === 1 ? me.L("L{Daily}") : me.L("L{Every {0} days}", tplData);
      case "WEEKLY":
        if (days && days.length) {
          tplData.days = me.getDaysLegend(days);
        } else if (startDate) {
          tplData.days = DateHelper.getDayName(startDate.getDay());
        }
        return me.L(interval === 1 ? "L{Weekly on {1}}" : "L{Every {0} weeks on {1}}", tplData);
      case "MONTHLY":
        if (days && days.length && positions && positions.length) {
          tplData.days = me.getDaysLegend(days, positions);
        } else if (monthDays && monthDays.length) {
          monthDays.sort((a, b) => a - b);
          tplData.days = me.arrayToText(monthDays);
        } else if (startDate) {
          tplData.days = startDate.getDate();
        }
        return me.L(interval === 1 ? "L{Monthly on {1}}" : "L{Every {0} months on {1}}", tplData);
      case "YEARLY":
        if (days && days.length && positions && positions.length) {
          tplData.days = me.getDaysLegend(days, positions);
        } else {
          tplData.days = startDate.getDate();
        }
        if (months && months.length) {
          months.sort((a, b) => a - b);
          if (months.length > 2) {
            fn = (month) => DateHelper.getMonthShortName(month - 1);
          } else {
            fn = (month) => DateHelper.getMonthName(month - 1);
          }
          tplData.months = me.arrayToText(months, fn);
        } else {
          tplData.months = DateHelper.getMonthName(startDate.getMonth());
        }
        return me.L(interval === 1 ? "L{Yearly on {1} of {2}}" : "L{Every {0} years on {1} of {2}}", tplData);
    }
  }
  static getDaysLegend(days, positions) {
    const me = this, tplData = { position: "" };
    let fn;
    if (positions && positions.length) {
      tplData.position = me.arrayToText(positions, (position) => me.L(`L{position${position}}`));
    }
    if (days.length) {
      days.sort((a, b) => RecurrenceDayRuleEncoder.decodeDay(a)[0] - RecurrenceDayRuleEncoder.decodeDay(b)[0]);
      switch (days.join(",")) {
        case me.allDaysValue:
          tplData.days = me.L("L{day}");
          break;
        case me.workingDaysValue:
          tplData.days = me.L("L{weekday}");
          break;
        case me.nonWorkingDaysValue:
          tplData.days = me.L("L{weekend day}");
          break;
        default:
          if (days.length > 2) {
            fn = (day) => DateHelper.getDayShortName(RecurrenceDayRuleEncoder.decodeDay(day)[0]);
          } else {
            fn = (day) => DateHelper.getDayName(RecurrenceDayRuleEncoder.decodeDay(day)[0]);
          }
          tplData.days = me.arrayToText(days, fn);
      }
    }
    return me.L("L{daysFormat}", tplData);
  }
  // Converts array of items to a human readable list.
  // For example: [1,2,3,4]
  // to: "1, 2, 3 and 4"
  static arrayToText(array, fn) {
    if (fn) {
      array = array.map(fn);
    }
    return array.join(", ").replace(/,(?=[^,]*$)/, this.L("L{ and }"));
  }
};
RecurrenceLegend._$name = "RecurrenceLegend";

// ../Scheduler/lib/Scheduler/feature/base/EditBase.js
var DH = DateHelper;
var scheduleFields = ["startDate", "endDate", "resource", "recurrenceRule"];
var makeDate = (fields) => {
  if (fields.length === 1)
    return fields[0].value;
  else if (fields.length === 2) {
    const [date, time] = fields[0] instanceof DateField ? fields : fields.reverse(), dateValue = DH.parse(date.value);
    if (dateValue && time.value) {
      dateValue.setHours(
        time.value.getHours(),
        time.value.getMinutes(),
        time.value.getSeconds(),
        time.value.getMilliseconds()
      );
    }
    return dateValue ? DateHelper.clone(dateValue) : null;
  }
  return null;
};
var copyTime = (dateTo, dateFrom) => {
  const d = new Date(dateTo.getTime());
  d.setHours(dateFrom.getHours(), dateFrom.getMinutes());
  return d;
};
var adjustEndDate = (startDate, startTime, me) => {
  if (!me.editor.assigningValues && startDate && startTime && me.endDateField && me.endTimeField) {
    const newEndDate = DH.add(copyTime(me.startDateField.value, me.startTimeField.value), me._durationMS, "milliseconds");
    me.endDateField.value = newEndDate;
    me.endTimeField.value = DH.clone(newEndDate);
  }
};
var EditBase = class extends InstancePlugin {
  //region Config
  static get configurable() {
    return {
      /**
       * True to save and close this panel if ENTER is pressed in one of the input fields inside the panel.
       * @config {Boolean}
       * @default
       * @category Editor
       */
      saveAndCloseOnEnter: true,
      triggerEvent: null,
      /**
       * This config parameter is passed to the `startDateField` and `endDateField` constructor.
       * @config {String}
       * @default
       * @category Editor widgets
       */
      dateFormat: "L",
      // date format that uses browser locale
      /**
       * This config parameter is passed to the `startTimeField` and `endTimeField` constructor.
       * @config {String}
       * @default
       * @category Editor widgets
       */
      timeFormat: "LT",
      // date format that uses browser locale
      /**
       * Default editor configuration, which widgets it shows etc.
       *
       * This is the entry point into configuring any aspect of the editor.
       *
       * The {@link Core.widget.Container#config-items} configuration of a Container
       * is *deeply merged* with its default `items` value. This means that you can specify
       * an `editorConfig` object which configures the editor, or widgets inside the editor:
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventEdit  : {
       *             editorConfig : {
       *                 autoClose : false,
       *                 modal     : true,
       *                 cls       : 'editor-widget-cls',
       *                 items : {
       *                     resourceField : {
       *                         hidden : true
       *                     },
       *                     // Add our own event owner field at the top of the form.
       *                     // Weight -100 will make it sort top the top.
       *                     ownerField : {
       *                         weight : -100,
       *                         type   : 'usercombo',
       *                         name   : 'owner',
       *                         label  : 'Owner'
       *                     }
       *                 },
       *                 bbar : {
       *                     items : {
       *                         deleteButton : false
       *                     }
       *                 }
       *             }
       *         }
       *     }
       * });
       * ```
       * @config {PopupConfig}
       * @category Editor
       */
      editorConfig: null,
      /**
       * An object to merge with the provided items config of the editor to override the
       * configuration of provided fields, or add new fields.
       *
       * To remove existing items, set corresponding keys to `null`:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventEdit  : {
       *             items : {
       *                 // Merged with provided config of the resource field
       *                 resourceField : {
       *                     label : 'Calendar'
       *                 },
       *                 recurrenceCombo : null,
       *                 owner : {
       *                     weight : -100, // Will sort above system-supplied fields which are weight 0
       *                     type   : 'usercombo',
       *                     name   : 'owner',
       *                     label  : 'Owner'
       *                 }
       *             }
       *         }
       *     }
       * });
       *```
       *
       * The provided fields are called
       *  - `nameField`
       *  - `resourceField`
       *  - `startDateField`
       *  - `startTimeField`
       *  - `endDateField`
       *  - `endTimeField`
       *  - `recurrenceCombo`
       *  - `editRecurrenceButton`
       * @config {Object<String,ContainerItemConfig|Boolean|null>}
       * @category Editor widgets
       */
      items: null,
      /**
       * The week start day used in all date fields of the feature editor form by default.
       * 0 means Sunday, 6 means Saturday.
       * Defaults to the locale's week start day.
       * @config {Number}
       */
      weekStartDay: null
    };
  }
  //endregion
  //region Init & destroy
  construct(client, config) {
    const me = this;
    client.eventEdit = me;
    super.construct(client, ObjectHelper.assign({
      weekStartDay: client.weekStartDay
    }, config));
    me.clientListenersDetacher = client.ion({
      [me.triggerEvent]: "onActivateEditor",
      dragCreateEnd: "onDragCreateEnd",
      // Not fired at the Scheduler level.
      // Calendar, which inherits this, implements this event.
      eventAutoCreated: "onEventAutoCreated",
      thisObj: me
    });
  }
  doDestroy() {
    var _a;
    this.clientListenersDetacher();
    (_a = this._editor) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  //endregion
  //region Editing
  // Not implemented at this level.
  // Scheduler Editing relies on being called at point of event creation.
  onEventAutoCreated() {
  }
  changeEditorConfig(editorConfig) {
    const { items } = this;
    if (items) {
      editorConfig = Objects.clone(editorConfig);
      editorConfig.items = Config.merge(items, editorConfig.items);
    }
    return editorConfig;
  }
  changeItems(items) {
    this.cleanItemsConfig(items);
    return items;
  }
  // Remove any items configured as === true which just means default config options
  cleanItemsConfig(items) {
    for (const ref in items) {
      const itemCfg = items[ref];
      if (itemCfg === true) {
        delete items[ref];
      } else if (itemCfg == null ? void 0 : itemCfg.items) {
        this.cleanItemsConfig(itemCfg.items);
      }
    }
  }
  onDatesChange({ value, source }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const me = this;
    if ((source === me.endDateField || source === me.endTimeField) && me.startDateField) {
      const newEndDate = ((_a = me.endTimeField) == null ? void 0 : _a.value) && ((_b = me.endDateField) == null ? void 0 : _b.value) ? copyTime(me.endDateField.value, me.endTimeField.value) : (_c = me.endDateField) == null ? void 0 : _c.value, newStartDate = ((_d = me.startTimeField) == null ? void 0 : _d.value) && ((_e = me.startDateField) == null ? void 0 : _e.value) ? copyTime(me.startDateField.value, me.startTimeField.value) : (_f = me.startDateField) == null ? void 0 : _f.value;
      if (newEndDate && newStartDate) {
        me._durationMS = newEndDate - newStartDate;
      }
    }
    if (me.startDateField && me.endDateField) {
      me.endDateField.min = me.startDateField.value;
    }
    if (me.endTimeField) {
      if (DH.isEqual(DH.clearTime((_g = me.startDateField) == null ? void 0 : _g.value), DH.clearTime((_h = me.endDateField) == null ? void 0 : _h.value))) {
        me.endTimeField.min = me.startTimeField.value;
      } else {
        me.endTimeField.min = null;
      }
    }
    switch (source.ref) {
      case "startDateField":
        ((_i = me.startTimeField) == null ? void 0 : _i.value) && adjustEndDate(value, me.startTimeField.value, me);
        break;
      case "startTimeField":
        ((_j = me.startDateField) == null ? void 0 : _j.value) && adjustEndDate(me.startDateField.value, value, me);
        break;
    }
  }
  //endregion
  //region Save
  async save() {
    throw new Error("Implement in subclass");
  }
  get values() {
    const me = this, { editor } = me, startFields = [], endFields = [], { values } = editor;
    scheduleFields.forEach((f) => delete values[f]);
    editor.eachWidget((widget) => {
      var _a;
      const { name } = widget;
      if (!name || widget.hidden || widget.up((w) => w === me.recurrenceEditor)) {
        delete values[name];
        return;
      }
      switch (name) {
        case "startDate":
          startFields.push(widget);
          break;
        case "endDate":
          endFields.push(widget);
          break;
        case "resource":
          values[name] = widget.record;
          break;
        case "recurrenceRule":
          values[name] = ((_a = editor.widgetMap.recurrenceCombo) == null ? void 0 : _a.value) === "none" ? "" : widget.value;
          break;
      }
    }, true);
    if (values.allDay && !me.eventRecord.allDay) {
      startFields.push(me.startTimeField);
      endFields.push(me.endTimeField);
    }
    if (startFields.length) {
      values.startDate = makeDate(startFields);
    }
    if (endFields.length) {
      values.endDate = makeDate(endFields);
    }
    if ("startDate" in values && "endDate" in values) {
      values.duration = DH.diff(values.startDate, values.endDate, me.editor.record.durationUnit, true);
    }
    return values;
  }
  /**
   * Template method, intended to be overridden. Called before the event record has been updated.
   * @param {Scheduler.model.EventModel} eventRecord The event record
   *
   **/
  onBeforeSave(eventRecord) {
  }
  /**
   * Template method, intended to be overridden. Called after the event record has been updated.
   * @param {Scheduler.model.EventModel} eventRecord The event record
   *
   **/
  onAfterSave(eventRecord) {
  }
  /**
   * Updates record being edited with values from the editor
   * @private
   */
  updateRecord(record) {
    var _a;
    const { values } = this;
    if (this.assignmentStore) {
      delete values.resource;
    }
    this._durationMS = DateHelper.asMilliseconds((_a = values.duration) != null ? _a : record.duration, record.durationUnit);
    return record.set(values);
  }
  //endregion
  //region Events
  onBeforeEditorShow() {
    const { eventRecord, editor } = this.editingContext, { nameField } = editor.widgetMap;
    if (nameField && eventRecord.isCreating) {
      editor.assigningValues = true;
      nameField.value = "";
      editor.assigningValues = false;
      nameField._configuredPlaceholder = nameField.placeholder;
      nameField.placeholder = eventRecord.name;
    }
  }
  resetEditingContext() {
    var _a;
    const me = this;
    if (!me.editingContext) {
      return;
    }
    const { client } = me, { editor, eventRecord } = me.editingContext, { eventStore } = client, { nameField } = editor.widgetMap;
    if (eventRecord.isCreating) {
      if (client.isTimelineBase) {
        (_a = me.editingContext.eventElement) == null ? void 0 : _a.closest("[data-event-id]").classList.add("b-released");
      }
      eventStore.remove(eventRecord);
      eventRecord.isCreating = false;
    }
    if (nameField) {
      nameField.placeholder = nameField._configuredPlaceholder;
    }
    client.element.classList.remove("b-eventeditor-editing");
    me.targetEventElement = me.editingContext = editor._record = null;
  }
  onPopupKeyDown({ event }) {
    const me = this;
    if (!me.readOnly && event.key === "Enter" && me.saveAndCloseOnEnter && event.target.tagName.toLowerCase() === "input") {
      event.preventDefault();
      if (event.target.name === "startDate") {
        me.startTimeField && adjustEndDate(me.startDateField.value, me.startTimeField.value, me);
      }
      me.onSaveClick();
    }
  }
  async finalizeStmCapture(saved) {
  }
  async onSaveClick() {
    this.editor.focus();
    this.isFinalizingEventSave = true;
    const saved = await this.save();
    this.isFinalizingEventSave = false;
    if (saved) {
      await this.finalizeStmCapture(false);
      this.editor.close();
      this.client.trigger("afterEventEdit");
    }
    return saved;
  }
  async onDeleteClick() {
    this.isDeletingEvent = true;
    const removed = await this.deleteEvent();
    this.isDeletingEvent = false;
    if (removed) {
      await this.finalizeStmCapture(false);
      const { editor } = this;
      if (!editor.autoClose || editor.containsFocus) {
        editor.close();
      }
      this.client.trigger("afterEventEdit");
    }
  }
  async onCancelClick() {
    this.isCancelingEdit = true;
    this.editor.close();
    this.isCancelingEdit = false;
    if (this.hasStmCapture) {
      await this.finalizeStmCapture(true);
    }
    this.client.trigger("afterEventEdit");
  }
  //endregion
};
EditBase._$name = "EditBase";

// ../Scheduler/lib/Scheduler/view/EventEditor.js
var EventEditor = class extends Popup {
  // Factoryable type name
  static get type() {
    return "eventeditor";
  }
  static get $name() {
    return "EventEditor";
  }
  static get configurable() {
    return {
      items: [],
      draggable: {
        handleSelector: ":not(button,.b-field-inner)"
        // Ignore buttons and field inners
      },
      axisLock: "flexible",
      scrollable: {
        // In case editor is very tall or window is small, make it scrollable
        overflowY: true
      },
      readOnly: null,
      /**
       * A Function (or *name* of a function) which produces a customized Panel header based upon the event being edited.
       *
       * @config {Function|String}
       * @param {Scheduler.model.EventModel} eventRecord The record being edited
       * @returns {String} The Panel title.
       */
      titleRenderer: null,
      // We want to maximize on phones and tablets
      maximizeOnMobile: true
    };
  }
  updateLocalization() {
    super.updateLocalization(...arguments);
    this.initialTitle = this.title || "";
  }
  chainResourceStore() {
    return this.eventEditFeature.resourceStore.chain(
      (record) => !record.isSpecialRow,
      null,
      {
        // It doesn't need to be a Project-based Store
        storeClass: Store,
        // Need to show all records in the combo. Required in case resource store is a tree.
        excludeCollapsedRecords: false
      }
    );
  }
  processWidgetConfig(widget) {
    var _a;
    if (((_a = widget.type) == null ? void 0 : _a.includes("date")) && widget.weekStartDay == null) {
      widget.weekStartDay = this.weekStartDay;
    }
    if (widget.type === "extraItems") {
      return false;
    }
    const { eventEditFeature } = this, fieldConfig = {};
    if (widget.ref === "resourceField") {
      const { store } = widget;
      widget.store = this.chainResourceStore();
      if (store) {
        widget.store.setConfig(store);
      }
      if (!("multiSelect" in widget)) {
        widget.multiSelect = !eventEditFeature.eventStore.usesSingleAssignment;
      }
    }
    if ((widget.name === "startDate" || widget.name === "endDate") && widget.type === "date") {
      fieldConfig.format = eventEditFeature.dateFormat;
    }
    if ((widget.name === "startDate" || widget.name === "endDate") && widget.type === "time") {
      fieldConfig.format = eventEditFeature.timeFormat;
    }
    Object.assign(widget, fieldConfig);
    return super.processWidgetConfig(widget);
  }
  setupEditorButtons() {
    const { record } = this, { deleteButton } = this.widgetMap;
    if (deleteButton) {
      deleteButton.hidden = this.readOnly || record.isCreating;
    }
  }
  // This will be called if the editor is floating
  onBeforeShow(...args) {
    var _a;
    this.setupUIForEditing();
    (_a = super.onBeforeShow) == null ? void 0 : _a.call(this, ...args);
  }
  // This will be called if the editor is docked
  onBeforeToggleReveal({ reveal }) {
    if (reveal) {
      this.setupUIForEditing();
    }
  }
  setupUIForEditing() {
    const me = this, {
      record,
      titleRenderer
    } = me;
    me.setupEditorButtons();
    if (titleRenderer) {
      me.title = me.callback(titleRenderer, me, [record]);
    } else {
      me.title = me.initialTitle;
    }
  }
  onInternalKeyDown(event) {
    this.trigger("keyDown", { event });
    super.onInternalKeyDown(event);
  }
  updateReadOnly(readOnly) {
    const {
      deleteButton,
      saveButton,
      cancelButton
    } = this.widgetMap;
    super.updateReadOnly(readOnly);
    if (deleteButton) {
      deleteButton.hidden = readOnly;
    }
    if (saveButton) {
      saveButton.hidden = readOnly;
    }
    if (cancelButton) {
      cancelButton.hidden = readOnly;
    }
  }
};
EventEditor.initClass();
EventEditor._$name = "EventEditor";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceCombo.js
var RecurrenceCombo = class extends RecurrenceFrequencyCombo {
  static get $name() {
    return "RecurrenceCombo";
  }
  // Factoryable type name
  static get type() {
    return "recurrencecombo";
  }
  static get defaultConfig() {
    return {
      customValue: "custom",
      placeholder: "None",
      splitCls: "b-recurrencecombo-split",
      items: true,
      highlightExternalChange: false
    };
  }
  buildItems() {
    const me = this;
    return [
      { value: "none", text: "L{None}" },
      ...super.buildItems(),
      { value: me.customValue, text: "L{Custom}", cls: me.splitCls }
    ];
  }
  set value(value) {
    value = value || "none";
    super.value = value;
  }
  get value() {
    return super.value;
  }
  set recurrence(recurrence) {
    const me = this;
    if (recurrence) {
      me.value = me.isCustomRecurrence(recurrence) ? me.customValue : recurrence.frequency;
    } else {
      me.value = null;
    }
  }
  isCustomRecurrence(recurrence) {
    const { interval, days, monthDays, months } = recurrence;
    return Boolean(interval > 1 || days && days.length || monthDays && monthDays.length || months && months.length);
  }
};
RecurrenceCombo.initClass();
RecurrenceCombo._$name = "RecurrenceCombo";

// ../Scheduler/lib/Scheduler/view/recurrence/RecurrenceLegendButton.js
var RecurrenceLegendButton = class extends Button {
  static get $name() {
    return "RecurrenceLegendButton";
  }
  // Factoryable type name
  static get type() {
    return "recurrencelegendbutton";
  }
  static get defaultConfig() {
    return {
      localizableProperties: [],
      recurrence: null
    };
  }
  /**
   * Sets / gets the recurrence to display description for.
   * @property {Scheduler.model.RecurrenceModel}
   */
  set recurrence(recurrence) {
    this._recurrence = recurrence;
    this.updateLegend();
  }
  get recurrence() {
    return this._recurrence;
  }
  set eventStartDate(eventStartDate) {
    this._eventStartDate = eventStartDate;
    this.updateLegend();
  }
  get eventStartDate() {
    return this._eventStartDate;
  }
  updateLegend() {
    const { recurrence } = this;
    this.text = recurrence ? RecurrenceLegend.getLegend(recurrence, this.eventStartDate) : "";
  }
  onLocaleChange() {
    this.updateLegend();
  }
  updateLocalization() {
    this.onLocaleChange();
    super.updateLocalization();
  }
};
RecurrenceLegendButton.initClass();
RecurrenceLegendButton._$name = "RecurrenceLegendButton";

// ../Scheduler/lib/Scheduler/view/recurrence/RecurrenceEditor.js
var RecurrenceEditor = class extends Popup {
  static get $name() {
    return "RecurrenceEditor";
  }
  // Factoryable type name
  static get type() {
    return "recurrenceeditor";
  }
  static get configurable() {
    return {
      draggable: true,
      closable: true,
      floating: true,
      cls: "b-recurrenceeditor",
      title: "L{Repeat event}",
      autoClose: true,
      width: 470,
      items: {
        recurrenceEditorPanel: {
          type: "recurrenceeditorpanel",
          title: null
        }
      },
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          foo: {
            type: "widget",
            cls: "b-label-filler",
            weight: 100
          },
          saveButton: {
            color: "b-green",
            text: "L{Save}",
            onClick: "up.onSaveClick",
            weight: 200
          },
          cancelButton: {
            color: "b-gray",
            text: "L{Object.Cancel}",
            onClick: "up.onCancelClick",
            weight: 300
          }
        }
      },
      scrollable: {
        overflowY: true
      }
    };
  }
  updateReadOnly(readOnly) {
    super.updateReadOnly(readOnly);
    this.bbar.hidden = readOnly;
  }
  get recurrenceEditorPanel() {
    return this.widgetMap.recurrenceEditorPanel;
  }
  updateRecord(record) {
    this.recurrenceEditorPanel.record = record;
  }
  onSaveClick() {
    const me = this;
    if (me.saveHandler) {
      me.saveHandler.call(me.thisObj || me, me, me.record);
    } else {
      me.recurrenceEditorPanel.syncEventRecord();
      me.close();
    }
  }
  onCancelClick() {
    const me = this;
    if (me.cancelHandler) {
      me.cancelHandler.call(me.thisObj || me, me, me.record);
    } else {
      me.close();
    }
  }
};
RecurrenceEditor.initClass();
RecurrenceEditor._$name = "RecurrenceEditor";

// ../Scheduler/lib/Scheduler/feature/mixin/RecurringEventEdit.js
var RecurringEventEdit_default = (Target) => class RecurringEventEdit extends (Target || Base) {
  static get $name() {
    return "RecurringEventEdit";
  }
  static get configurable() {
    return {
      recurringEventsItems: {
        /**
         * Reference to the `Repeat` event field, if used
         * @member {Scheduler.view.recurrence.field.RecurrenceCombo} recurrenceCombo
         * @readonly
         */
        recurrenceCombo: {
          type: "recurrencecombo",
          label: "L{EventEdit.Repeat}",
          ref: "recurrenceCombo",
          weight: 700
        },
        /**
         * Reference to the button that opens the event repeat settings dialog, if used
         * @member {Scheduler.view.recurrence.RecurrenceLegendButton} editRecurrenceButton
         * @readonly
         */
        editRecurrenceButton: {
          type: "recurrencelegendbutton",
          ref: "editRecurrenceButton",
          name: "recurrenceRule",
          color: "b-gray",
          menuIcon: null,
          flex: 1,
          weight: 800,
          ignoreParentReadOnly: true
        }
      },
      /**
       * Set to `false` to hide recurring fields in event editor, even if the
       * {@link Scheduler.view.mixin.RecurringEvents#config-enableRecurringEvents Recurring Events} is `true`
       * and a recurring event is being edited.
       * @config {Boolean}
       * @category Recurring
       */
      showRecurringUI: null
    };
  }
  changeEditorConfig(editorConfig) {
    editorConfig.items = { ...editorConfig.items, ...this.recurringEventsItems };
    editorConfig = super.changeEditorConfig(editorConfig);
    return editorConfig;
  }
  doDestroy() {
    var _a, _b;
    (_a = this._recurrenceConfirmation) == null ? void 0 : _a.destroy();
    (_b = this._recurrenceEditor) == null ? void 0 : _b.destroy();
    super.doDestroy();
  }
  onEditorConstructed(editor) {
    var _a;
    const me = this;
    editor.ion({
      hide: me.onRecurringEventEditorHide,
      thisObj: me
    });
    if (me.editRecurrenceButton) {
      me.editRecurrenceButton.menu = me.recurrenceEditor;
    }
    (_a = me.recurrenceCombo) == null ? void 0 : _a.ion({
      change: me.onRecurrenceComboChange,
      thisObj: me
    });
  }
  updateReadOnly(readOnly) {
    if (this._recurrenceEditor) {
      this._recurrenceEditor.readOnly = readOnly;
    }
  }
  internalShowEditor() {
    this.toggleRecurringFieldsVisibility(this.client.enableRecurringEvents && this.showRecurringUI !== false);
  }
  toggleRecurringFieldsVisibility(show = true) {
    var _a, _b, _c, _d;
    const methodName = show ? "show" : "hide";
    (_b = (_a = this.editRecurrenceButton) == null ? void 0 : _a[methodName]) == null ? void 0 : _b.call(_a);
    (_d = (_c = this.recurrenceCombo) == null ? void 0 : _c[methodName]) == null ? void 0 : _d.call(_c);
  }
  onRecurringEventEditorHide() {
    var _a, _b;
    if ((_a = this.recurrenceEditor) == null ? void 0 : _a.isVisible) {
      this.recurrenceEditor.hide();
    }
    if ((_b = this.recurrenceConfirmation) == null ? void 0 : _b.isVisible) {
      this.recurrenceConfirmation.hide();
    }
  }
  // Builds RecurrenceModel to load into the recurrenceEditor
  // It builds the model based on either:
  // - recurrence rule string (if provided)
  // - or the event being edited recurrence (if the event is repeating)
  // - or simply make a recurrence model w/ default state (by default means: Frequency=Daily, Interval=1)
  makeRecurrence(rule) {
    const event = this.eventRecord, eventCopy = event.copy();
    let recurrence = event.recurrence;
    if (!rule && recurrence) {
      recurrence = recurrence.copy();
    } else {
      recurrence = new event.recurrenceModel(rule ? { rule } : {});
    }
    recurrence.timeSpan = eventCopy;
    eventCopy.setStartDate(this.values.startDate);
    recurrence.suspendTimeSpanNotifying();
    return recurrence;
  }
  onRecurrableEventBeforeSave({ eventRecord, context }) {
    const me = this;
    if (me.isEditing && !eventRecord.isCreating && eventRecord.supportsRecurring && (eventRecord.isRecurring || eventRecord.isOccurrence)) {
      me.recurrenceConfirmation.confirm({
        actionType: "update",
        eventRecord,
        changerFn() {
          context.finalize(true);
        },
        cancelFn() {
          context.finalize(false);
        }
      });
      context.async = true;
    }
  }
  set recurrenceConfirmation(recurrenceConfirmation) {
    this._recurrenceConfirmation = recurrenceConfirmation;
  }
  get recurrenceConfirmation() {
    const me = this;
    let recurrenceConfirmation = me._recurrenceConfirmation;
    if (!recurrenceConfirmation || !recurrenceConfirmation.$$name) {
      recurrenceConfirmation = Widget.create({
        type: "recurrenceconfirmation",
        owner: me.editor,
        ...recurrenceConfirmation
      });
      me._recurrenceConfirmation = recurrenceConfirmation;
    }
    return recurrenceConfirmation;
  }
  set recurrenceEditor(recurrenceEditor) {
    this._recurrenceEditor = recurrenceEditor;
  }
  get recurrenceEditor() {
    const me = this;
    let recurrenceEditor = me._recurrenceEditor;
    if (!recurrenceEditor || !recurrenceEditor.$$name) {
      me._recurrenceEditor = recurrenceEditor = Widget.create({
        type: "recurrenceeditor",
        autoShow: false,
        centered: true,
        modal: true,
        // It's used as the Menu of a Button which syncs the width unless it's already set
        minWidth: "auto",
        constrainTo: globalThis,
        anchor: false,
        rootElement: me.rootElement,
        saveHandler: me.recurrenceEditorSaveHandler,
        onBeforeShow: me.onBeforeShowRecurrenceEditor.bind(me),
        thisObj: me,
        ...recurrenceEditor
      });
      recurrenceEditor.readOnly = me._readOnly;
    }
    return recurrenceEditor;
  }
  onBeforeShowRecurrenceEditor() {
    const me = this, { recurrenceEditor, eventRecord } = me;
    if (recurrenceEditor && (eventRecord == null ? void 0 : eventRecord.supportsRecurring)) {
      if (!me.recurrence) {
        me.recurrence = me.makeRecurrence();
      }
      me.recurrence.timeSpan.setStartDate(me.values.startDate);
      recurrenceEditor.record = me.recurrence;
      recurrenceEditor.centered = true;
    }
  }
  loadRecurrenceData(recurrence) {
    this.recurrence = recurrence;
    this.updateRecurrenceFields(recurrence);
  }
  updateRecurrenceFields(recurrence) {
    const me = this, { editRecurrenceButton } = me;
    if (me.recurrenceCombo) {
      me.recurrenceCombo.recurrence = recurrence;
    }
    if (editRecurrenceButton) {
      editRecurrenceButton.recurrence = recurrence;
      editRecurrenceButton.value = recurrence ? recurrence.rule : null;
      if (recurrence && me.client.enableRecurringEvents && me.showRecurringUI !== false) {
        editRecurrenceButton.show();
      } else {
        editRecurrenceButton.hide();
      }
    }
  }
  onRecurrenceComboChange({ source, value, userAction }) {
    if (userAction) {
      const me = this, { recurrenceEditor } = me;
      if (value === source.customValue) {
        me.recurrenceCombo.recurrence = me.makeRecurrence();
        if (recurrenceEditor.centered) {
          recurrenceEditor.show();
        } else {
          recurrenceEditor.show((me.editRecurrenceButton || source).element);
        }
      } else {
        me.loadRecurrenceData(value && value !== "none" ? me.makeRecurrence(`FREQ=${value}`) : null);
      }
    }
  }
  recurrenceEditorSaveHandler(editor, recurrence) {
    editor.recurrenceEditorPanel.syncEventRecord(recurrence);
    this.updateRecurrenceFields(recurrence);
    editor.close();
  }
  onDatesChange(...args) {
    super.onDatesChange(...args);
    if (!this.loadingRecord && this.editRecurrenceButton) {
      const { startDate } = this.values;
      if (startDate) {
        this.editRecurrenceButton.eventStartDate = startDate;
      }
    }
  }
  internalLoadRecord(eventRecord) {
    if (eventRecord == null ? void 0 : eventRecord.supportsRecurring) {
      this.loadRecurrenceData(eventRecord.recurrence ? this.makeRecurrence() : null);
    }
  }
  updateRecord(record) {
    if (record.recurrenceRule && !this.recurrence) {
      record.recurrenceRule = null;
    }
    return super.updateRecord(record);
  }
};

// ../Scheduler/lib/Scheduler/widget/ResourceCombo.js
var ResourceCombo = class extends Combo {
  static get $name() {
    return "ResourceCombo";
  }
  // Factoryable type name
  static get type() {
    return "resourcecombo";
  }
  static get configurable() {
    return {
      /**
       * Show the {@link Scheduler.model.ResourceModel#field-eventColor event color} for each resource
       * @config {Boolean}
       * @default false
       */
      showEventColor: null,
      displayField: "name",
      valueField: "id",
      picker: {
        cls: "b-resourcecombo-picker",
        itemIconTpl(record) {
          if (this.owner.showEventColor) {
            const { eventColor } = record, isStyleColor = !DomHelper.isNamedColor(eventColor), style = eventColor ? isStyleColor ? ` style="color:${eventColor}"` : "" : ' style="display:none"', colorClass = !eventColor || isStyleColor ? "" : ` b-sch-foreground-${eventColor}`;
            return `<div class="b-icon b-icon-square${colorClass}"${style}></div>`;
          }
          if (this.multiSelect) {
            return `<div class="b-icon b-icon-square"></div>`;
          }
          return "";
        }
      }
    };
  }
  changeShowEventColor(showEventColor) {
    return Boolean(showEventColor);
  }
  updateShowEventColor(showEventColor) {
    var _a;
    this.element.classList.toggle("b-show-event-color", Boolean(showEventColor));
    (_a = this._picker) == null ? void 0 : _a.element.classList.toggle("b-show-event-color", Boolean(showEventColor));
  }
  changePicker(picker, oldPicker) {
    picker = super.changePicker(picker, oldPicker);
    picker == null ? void 0 : picker.element.classList.toggle("b-show-event-color", Boolean(this.showEventColor));
    return picker;
  }
  // Implementation needed at this level because it has two inner elements in its inputWrap
  get innerElements() {
    return [
      {
        class: "b-icon b-resource-icon b-icon-square b-hide-display",
        reference: "resourceIcon"
      },
      this.inputElement
    ];
  }
  syncInputFieldValue() {
    var _a, _b;
    const me = this, {
      resourceIcon,
      lastResourceIconCls
    } = me, { classList } = resourceIcon, eventColor = (_b = (_a = me.selected) == null ? void 0 : _a.eventColor) != null ? _b : "";
    super.syncInputFieldValue();
    resourceIcon.style.color = "";
    lastResourceIconCls && classList.remove(lastResourceIconCls);
    me.lastResourceIconCls = null;
    if (eventColor) {
      if (DomHelper.isNamedColor(eventColor)) {
        me.lastResourceIconCls = `b-sch-foreground-${eventColor}`;
        classList.add(me.lastResourceIconCls);
      } else {
        resourceIcon.style.color = eventColor;
      }
      classList.remove("b-hide-display");
    } else {
      classList.add("b-hide-display");
    }
  }
};
ResourceCombo.initClass();
ResourceCombo._$name = "ResourceCombo";

// ../Scheduler/lib/Scheduler/feature/EventEdit.js
var punctuation = /[^\w\d]/g;
var EventEdit = class extends EditBase.mixin(TaskEditStm_default, RecurringEventEdit_default, Delayable_default) {
  //region Config
  static get $name() {
    return "EventEdit";
  }
  static get configurable() {
    return {
      /**
       * The event that shall trigger showing the editor. Defaults to `eventdblclick`, set to `''` or null to
       * disable editing of existing events.
       * @config {String}
       * @default
       * @category Editor
       */
      triggerEvent: "eventdblclick",
      /**
       * The data field in the model that defines the eventType.
       * Applied as class (b-eventtype-xx) to the editors element, to allow showing/hiding fields depending on
       * eventType. Dynamic toggling of fields in the editor is activated by adding an `eventTypeField` field to
       * your widget:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *    features : {
       *       eventEdit : {
       *           items : {
       *               eventTypeField : {
       *                  type  : 'combo',
       *                  name  : 'eventType',
       *                  label : 'Type',
       *                  items : ['Appointment', 'Internal', 'Meeting']
       *               }
       *           }
       *        }
       *     }
       * });
       * ```
       * Note, your event model class also must declare this field:
       * ```javascript
       *  class MyEvent extends EventModel {
       *      static get fields() {
       *          return [
       *              { name : 'eventType' }
       *          ];
       *      }
       *  }
       * ```
       * @config {String}
       * @default
       * @category Editor
       */
      typeField: "eventType",
      /**
       * The current {@link Scheduler.model.EventModel} record, which is being edited by the event editor.
       * @property {Scheduler.model.EventModel}
       * @readonly
       */
      eventRecord: null,
      /**
       * Specify `true` to put the editor in read only mode.
       * @config {Boolean}
       * @default false
       */
      readOnly: null,
      /**
       * The configuration for the internal editor widget. With this config you can control the *type*
       * of editor (defaults to `Popup`) and which widgets to show,
       * change the items in the `bbar`, or change whether the popup should be modal etc.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventEdit  : {
       *             editorConfig : {
       *                 modal  : true,
       *                 cls    : 'my-editor' // A CSS class,
       *                 items  : {
       *                     owner : {
       *                         weight : -100, // Will sort above system-supplied fields which are weight 100 to 800
       *                         type   : 'usercombo',
       *                         name   : 'owner',
       *                         label  : 'Owner'
       *                     },
       *                     agreement : {
       *                         weight : 1000, // Will sort below system-supplied fields which are weight 100 to 800
       *                         type   : 'checkbox',
       *                         name   : 'agreement',
       *                         label  : 'Agree to terms'
       *                     },
       *                     resourceField : {
       *                         // Apply a special filter to limit the Combo's access
       *                         // to resources.
       *                         store  {
       *                             filters : [{
       *                                 filterBy(resource) {
       *                                     return shouldShowResource(record);
       *                                 }
       *                             }]
       *                         }
       *                     }
       *                 },
       *                 bbar : {
       *                     items : {
       *                         deleteButton : {
       *                             hidden : true
       *                         }
       *                     }
       *                 }
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * Or to use your own custom editor:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventEdit  : {
       *             editorConfig : {
       *                 type : 'myCustomEditorType'
       *             }
       *         }
       *     }
       * });
       * ```
       * @config {Object}
       * @category Editor
       */
      editorConfig: {
        type: "eventeditor",
        title: "L{EventEdit.Edit event}",
        closable: true,
        localeClass: this,
        defaults: {
          localeClass: this
        },
        items: {
          /**
           * Reference to the name field, if used
           * @member {Core.widget.TextField} nameField
           * @readonly
           */
          nameField: {
            type: "text",
            label: "L{Name}",
            clearable: true,
            name: "name",
            weight: 100,
            required: true
          },
          /**
           * Reference to the resource field, if used
           * @member {Core.widget.Combo} resourceField
           * @readonly
           */
          resourceField: {
            type: "resourcecombo",
            label: "L{Resource}",
            name: "resource",
            editable: true,
            valueField: "id",
            displayField: "name",
            highlightExternalChange: false,
            destroyStore: true,
            weight: 200
          },
          /**
           * Reference to the start date field, if used
           * @member {Core.widget.DateField} startDateField
           * @readonly
           */
          startDateField: {
            type: "date",
            clearable: false,
            required: true,
            label: "L{Start}",
            name: "startDate",
            validateDateOnly: true,
            weight: 300
          },
          /**
           * Reference to the start time field, if used
           * @member {Core.widget.TimeField} startTimeField
           * @readonly
           */
          startTimeField: {
            type: "time",
            clearable: false,
            required: true,
            name: "startDate",
            cls: "b-match-label",
            weight: 400
          },
          /**
           * Reference to the end date field, if used
           * @member {Core.widget.DateField} endDateField
           * @readonly
           */
          endDateField: {
            type: "date",
            clearable: false,
            required: true,
            label: "L{End}",
            name: "endDate",
            validateDateOnly: true,
            weight: 500
          },
          /**
           * Reference to the end time field, if used
           * @member {Core.widget.TimeField} endTimeField
           * @readonly
           */
          endTimeField: {
            type: "time",
            clearable: false,
            required: true,
            name: "endDate",
            cls: "b-match-label",
            weight: 600
          },
          colorField: {
            label: "L{SchedulerBase.color}",
            type: "eventColorField",
            name: "eventColor",
            weight: 700
          }
        },
        bbar: {
          // When readOnly, child buttons are hidden
          hideWhenEmpty: true,
          defaults: {
            localeClass: this
          },
          items: {
            /**
             * Reference to the save button, if used
             * @member {Core.widget.Button} saveButton
             * @readonly
             */
            saveButton: {
              color: "b-blue",
              cls: "b-raised",
              text: "L{Save}",
              weight: 100
            },
            /**
             * Reference to the delete button, if used
             * @member {Core.widget.Button} deleteButton
             * @readonly
             */
            deleteButton: {
              text: "L{Delete}",
              weight: 200
            },
            /**
             * Reference to the cancel button, if used
             * @member {Core.widget.Button} cancelButton
             * @readonly
             */
            cancelButton: {
              text: "L{Object.Cancel}",
              weight: 300
            }
          }
        }
      },
      targetEventElement: null
    };
  }
  static get pluginConfig() {
    return {
      chain: [
        "populateEventMenu",
        "onEventEnterKey",
        "editEvent"
      ]
    };
  }
  //endregion
  //region Init & destroy
  construct(scheduler, config) {
    this.readOnly = scheduler.readOnly;
    super.construct(scheduler, config);
    scheduler.ion({
      projectChange: "onChangeProject",
      readOnly: "onClientReadOnlyToggle",
      thisObj: this
    });
  }
  get scheduler() {
    return this.client;
  }
  get project() {
    return this.client.project;
  }
  //endregion
  //region Editing
  /**
   * Get/set readonly state
   * @property {Boolean}
   */
  get readOnly() {
    return this._editor ? this.editor.readOnly : this._readOnly;
  }
  updateReadOnly(readOnly) {
    super.updateReadOnly(readOnly);
    if (this._editor) {
      this.editor.readOnly = readOnly;
    }
  }
  onClientReadOnlyToggle({ readOnly }) {
    this.readOnly = readOnly;
  }
  /**
   * Returns the editor widget representing this feature
   * @member {Core.widget.Popup}
   */
  get editor() {
    var _a, _b, _c, _d, _e;
    const me = this, editorListeners = {
      beforehide: "resetEditingContext",
      beforeshow: "onBeforeEditorShow",
      keydown: "onPopupKeyDown",
      thisObj: me
    };
    let { _editor: editor } = me;
    if (editor) {
      return editor;
    }
    editor = me._editor = Widget.create(me.getEditorConfig());
    const {
      startDateField,
      startTimeField,
      endDateField,
      endTimeField
    } = editor.widgetMap;
    if (!startDateField && startTimeField) {
      startTimeField.keepDate = true;
      startTimeField.label = me.L("Start");
      startTimeField.flex = "1 0 100%";
    }
    if (!endDateField && endTimeField) {
      endTimeField.keepDate = true;
      endTimeField.label = me.L("End");
      endTimeField.flex = "1 0 100%";
    }
    if (!editor.floating && !editor.positioned) {
      if (!editor.element.parentNode) {
        me.client.add(editor);
      }
      delete editorListeners.beforehide;
      delete editorListeners.beforeshow;
      editorListeners.beforeToggleReveal = "onBeforeEditorToggleReveal";
    }
    editor.readOnly = me._readOnly;
    if (editor.items.length === 0) {
      console.warn("Event Editor configured without any `items`");
    }
    editor.ion(editorListeners);
    me.scheduler.relayEvents(editor, ["beforeSetRecord"], "eventEdit");
    Object.values(editor.widgetMap).forEach((widget) => {
      const ref = widget.ref || widget.id;
      if (ref && !me[ref]) {
        me[ref] = widget;
        switch (widget.name) {
          case "startDate":
          case "endDate":
            widget.ion({ change: "onDatesChange", thisObj: me });
            break;
        }
      }
    });
    (_a = me.onEditorConstructed) == null ? void 0 : _a.call(me, editor);
    (_b = me.eventTypeField) == null ? void 0 : _b.ion({ change: "onEventTypeChange", thisObj: me });
    (_c = me.saveButton) == null ? void 0 : _c.ion({ click: "onSaveClick", thisObj: me });
    (_d = me.deleteButton) == null ? void 0 : _d.ion({ click: "onDeleteClick", thisObj: me });
    (_e = me.cancelButton) == null ? void 0 : _e.ion({ click: "onCancelClick", thisObj: me });
    return editor;
  }
  getEditorConfig() {
    const me = this, { cls, scheduler } = me, result = ObjectHelper.assign({
      owner: scheduler,
      eventEditFeature: me,
      weekStartDay: me.weekStartDay,
      align: "b-t",
      id: `${scheduler.id}-event-editor`,
      autoShow: false,
      anchor: true,
      scrollAction: "realign",
      constrainTo: globalThis,
      cls
    }, me.editorConfig);
    if (Widget.prototype.getRenderContext(result)[0]) {
      result.floating = false;
    }
    if (result.floating === false && !result.positioned) {
      result.collapsible = {
        type: "overlay",
        direction: "right",
        autoClose: false,
        tool: null,
        recollapseTool: null
      };
      result.collapsed = true;
      result.hidden = result.anchor = false;
      result.hide = function() {
        this.collapsible.toggleReveal(false);
      };
    }
    if (!scheduler.showEventColorPickers && result.items.colorField) {
      result.items.colorField.hidden = true;
    }
    result.onElementCreated = me.updateCSSVars.bind(this);
    return result;
  }
  updateCSSVars({ element }) {
    const time = new Date(2e3, 12, 31, 23, 55, 55), dateLength = DateHelper.format(time, this.dateFormat).replace(punctuation, "").length, timeLength = DateHelper.format(time, this.timeFormat).replace(punctuation, "").length, dateTimeLength = dateLength + timeLength;
    element.style.setProperty("--date-time-length", `${dateTimeLength}em`);
    element.style.setProperty("--date-width-difference", `${(dateLength - timeLength) / 2}em`);
  }
  // Called from editEvent() to actually show the editor
  async internalShowEditor(eventRecord, resourceRecord, align = null) {
    var _a, _b;
    const me = this, { scheduler } = me, { useInitialAnimation } = scheduler, eventElement = ((_a = align == null ? void 0 : align.target) == null ? void 0 : _a.nodeType) === Element.ELEMENT_NODE ? align.target : scheduler.getElementFromEventRecord(eventRecord, resourceRecord), isPartOfStore = eventRecord.isPartOfStore(scheduler.eventStore);
    align = align != null ? align : {
      // Align to the element (b-sch-event) and not the wrapper
      target: eventElement,
      anchor: true
    };
    if (align.target || (!isPartOfStore || eventRecord.resources.length === 0) || eventRecord.isCreating) {
      scheduler.element.classList.add("b-eventeditor-editing");
      me.resourceRecord = resourceRecord;
      const { editor } = me;
      me.editingContext = {
        eventRecord,
        resourceRecord,
        eventElement,
        editor,
        isPartOfStore
      };
      (_b = super.internalShowEditor) == null ? void 0 : _b.call(this, eventRecord, resourceRecord, align);
      if (me.typeField) {
        me.toggleEventType(eventRecord.getValue(me.typeField));
      }
      me.loadRecord(eventRecord, resourceRecord);
      if (editor.collapsed) {
        await AsyncHelper.sleep(100);
        await editor.collapsible.toggleReveal(true);
        editor.focus();
      } else if (editor.centered || !editor.anchor || !editor.floating) {
        editor.show();
      } else if (eventElement && (!eventRecord.isCreating || !useInitialAnimation || useInitialAnimation === true || useInitialAnimation === "fade-in")) {
        me.targetEventElement = eventElement;
        editor.showBy(align);
      } else {
        editor.show();
        editor.updateCentered(true);
      }
      const timeResolution = scheduler.timeAxisViewModel.timeResolution;
      if (timeResolution.unit === "hour" || timeResolution.unit === "minute") {
        const step = `${timeResolution.increment}${timeResolution.unit}`;
        if (me.startTimeField) {
          me.startTimeField.step = step;
        }
        if (me.endTimeField) {
          me.endTimeField.step = step;
        }
      }
      me.detachListeners("changesWhileEditing");
      scheduler.eventStore.ion({
        change: me.onChangeWhileEditing,
        refresh: me.onChangeWhileEditing,
        thisObj: me,
        name: "changesWhileEditing"
      });
    }
  }
  onChangeWhileEditing() {
    const me = this;
    if (!me.editor.autoUpdateRecord && !me.isFinalizingEventSave && me.isEditing && me.editingContext.isPartOfStore && !me.eventRecord.isPartOfStore(me.scheduler.eventStore)) {
      me.onCancelClick();
    }
  }
  // Fired in a listener so that it's after the auto-called onBeforeShow listeners so that
  // subscribers to the beforeEventEditShow are called at exactly the correct lifecycle point.
  onBeforeEditorShow() {
    super.onBeforeEditorShow(...arguments);
    this.scheduler.trigger("beforeEventEditShow", {
      eventEdit: this,
      ...this.editingContext
    });
  }
  updateTargetEventElement(targetEventElement, oldTargetEventElement) {
    targetEventElement == null ? void 0 : targetEventElement.classList.add("b-editing");
    oldTargetEventElement == null ? void 0 : oldTargetEventElement.classList.remove("b-editing");
  }
  /**
   * Opens an editor for the passed event. This function is exposed on Scheduler and can be called as
   * `scheduler.editEvent()`.
   * @param {Scheduler.model.EventModel} eventRecord Event to edit
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The Resource record for the event.
   * This parameter is needed if the event is newly created for a resource and has not been assigned, or when using
   * multi assignment.
   * @param {HTMLElement} [element] Element to anchor editor to (defaults to events element)
   * @on-owner
   */
  editEvent(eventRecord, resourceRecord, element = null, stmCapture = null) {
    var _a;
    const me = this, { client } = me, { simpleEventEdit } = client.features;
    if (me.isEditing) {
      me.resetEditingContext();
    }
    if (me.disabled || eventRecord.readOnly || eventRecord.isCreating && (simpleEventEdit == null ? void 0 : simpleEventEdit.enabled)) {
      return;
    }
    if (client.trigger("beforeEventEdit", {
      eventEdit: me,
      eventRecord,
      resourceRecord,
      eventElement: ((_a = client.getElementFromEventRecord) == null ? void 0 : _a.call(client, eventRecord, resourceRecord)) || element
    }) === false) {
      client.element.classList.remove("b-eventeditor-editing");
      return false;
    }
    if (stmCapture) {
      me.applyStmCapture(stmCapture);
      me.hasStmCapture = true;
      stmCapture.transferred = true;
    } else if (stmCapture !== false && !client.isCalendar && !me.hasStmCapture) {
      me.captureStm(true);
    }
    return me.doEditEvent(...arguments).then((result) => {
      if (!me.isDestroying) {
        if (!me.isEditing && !client.isCalendar && !me.rejectingStmTransaction) {
          if (result !== false && me.hasStmCapture) {
            return me.freeStm(false);
          } else {
            return me.freeStm();
          }
        }
      }
    });
  }
  /**
   * Returns true if the editor is currently active
   * @readonly
   * @property {Boolean}
   */
  get isEditing() {
    const { _editor } = this;
    return Boolean(
      // Editor is not visible if it is collapsed and not expanded
      (_editor == null ? void 0 : _editor.isVisible) && !(_editor.collapsed && !_editor.revealed)
    );
  }
  // editEvent is the single entry point in the base class.
  // Subclass implementations of the action may differ, so are implemented in doEditEvent
  async doEditEvent(eventRecord, resourceRecord, element = null) {
    const me = this, { scheduler } = me, isNewRecord = eventRecord.isCreating;
    if (!resourceRecord) {
      resourceRecord = eventRecord.resource || me.resourceStore.getById(eventRecord.resourceId);
    }
    if (isNewRecord) {
      TimeSpan.prototype.normalize.call(eventRecord);
    }
    if (element || isNewRecord || eventRecord.resources.length === 0) {
      return me.internalShowEditor(eventRecord, resourceRecord, element ? {
        target: element
      } : null);
    } else {
      await scheduler.scrollResourceEventIntoView(resourceRecord, eventRecord, {
        animate: true,
        edgeOffset: 0,
        extendTimeAxis: false
      });
      if (!scheduler.isDestroyed) {
        await me.internalShowEditor(eventRecord, resourceRecord);
        if (!scheduler.isDestroyed) {
          scheduler.element.classList.remove("b-eventeditor-editing");
        }
      }
    }
  }
  /**
   * Sets fields values from record being edited
   * @private
   */
  loadRecord(eventRecord, resourceRecord) {
    this.loadingRecord = true;
    this.internalLoadRecord(eventRecord, resourceRecord);
    this.loadingRecord = false;
  }
  get eventRecord() {
    var _a;
    return (_a = this._editor) == null ? void 0 : _a.record;
  }
  internalLoadRecord(eventRecord, resourceRecord) {
    var _a;
    const me = this, { eventStore } = me.client, { editor, resourceField } = me;
    me.resourceRecord = resourceRecord;
    if (resourceField && ((_a = resourceField.store) == null ? void 0 : _a.masterStore) !== me.resourceStore) {
      resourceField.store = editor.chainResourceStore();
    }
    editor.record = eventRecord;
    if (resourceField) {
      const resources = eventStore.assignmentStore.getResourcesForEvent(eventRecord);
      editor.assigningValues = true;
      if (!eventRecord.isOccurrence && !eventStore.storage.includes(eventRecord, true) && resourceRecord) {
        me.resourceField.value = resourceRecord.getValue(me.resourceField.valueField);
      } else if (me.assignmentStore) {
        me.resourceField.value = resources.map((resource) => resource.getValue(me.resourceField.valueField));
      }
      editor.assigningValues = false;
    }
    super.internalLoadRecord(eventRecord, resourceRecord);
  }
  toggleEventType(eventType) {
    this.editor.element.dataset.eventType = eventType || "";
    this.editor.eachWidget((widget) => {
      var _a;
      ((_a = widget.dataset) == null ? void 0 : _a.eventType) && (widget.hidden = widget.dataset.eventType !== eventType);
    });
  }
  //endregion
  //region Save
  async finalizeEventSave(eventRecord, resourceRecords, resolve, reject) {
    const me = this, {
      scheduler,
      assignmentStore
    } = me;
    const aborted = false;
    assignmentStore.suspendAutoCommit();
    scheduler.suspendRefresh();
    me.onBeforeSave(eventRecord);
    eventRecord.beginBatch();
    me.updateRecord(eventRecord);
    eventRecord.endBatch();
    if (!eventRecord.isOccurrence) {
      if (me.resourceField) {
        assignmentStore.assignEventToResource(eventRecord, resourceRecords, null, true);
      }
    } else if (resourceRecords) {
      eventRecord.set("resourceRecords", resourceRecords);
    }
    eventRecord.isCreating = false;
    if (!aborted) {
      await scheduler.project.commitAsync();
    }
    assignmentStore.resumeAutoCommit();
    scheduler.resumeRefresh(true);
    if (!aborted) {
      scheduler.trigger("afterEventSave", { eventRecord });
      me.onAfterSave(eventRecord);
    }
    resolve(aborted ? false : eventRecord);
  }
  /**
   * Saves the changes (applies them to record if valid, if invalid editor stays open)
   * @private
   * @fires beforeEventSave
   * @fires beforeEventAdd
   * @fires afterEventSave
   * @async
   */
  save() {
    return new Promise((resolve, reject) => {
      var _a;
      const me = this, { scheduler, eventRecord } = me;
      if (!eventRecord || !me.editor.isValid) {
        resolve(false);
        return;
      }
      const { eventStore, values } = me, resourceRecords = ((_a = me.resourceField) == null ? void 0 : _a.records) || (me.resourceRecord ? [me.resourceRecord] : []);
      if (!me.scheduler.allowOverlap && eventStore) {
        let { startDate, endDate } = values;
        if (!endDate) {
          if ("duration" in values) {
            endDate = DateHelper.add(startDate, values.duration, values.durationUnit || eventRecord.durationUnit);
          } else if ("fullDuration" in values) {
            endDate = DateHelper.add(startDate, values.fullDuration);
          } else {
            endDate = eventRecord.endDate;
          }
        }
        const abort = resourceRecords.some((resource) => {
          return !eventStore.isDateRangeAvailable(startDate, endDate, eventRecord, resource);
        });
        if (abort) {
          resolve(false);
          return;
        }
      }
      const context = {
        finalize(saveEvent) {
          try {
            if (saveEvent !== false) {
              me.finalizeEventSave(eventRecord, resourceRecords, resolve, reject);
            } else {
              resolve(false);
            }
          } catch (e) {
            reject(e);
          }
        }
      };
      const triggerResult = scheduler.trigger("beforeEventSave", { eventRecord, resourceRecords, values, context });
      function handleEventResult(result, eventRecord2, context2) {
        if (result === false) {
          resolve(false);
        } else {
          me.onRecurrableEventBeforeSave({ eventRecord: eventRecord2, context: context2 });
          if (!context2.async) {
            context2.finalize();
          }
        }
      }
      if (ObjectHelper.isPromise(triggerResult)) {
        triggerResult.then((result) => handleEventResult(result, eventRecord, context));
      } else {
        handleEventResult(triggerResult, eventRecord, context);
      }
    });
  }
  //endregion
  //region Delete
  /**
   * Delete event being edited
   * @fires beforeEventDelete
   * @private
   * @async
   */
  deleteEvent() {
    this.detachListeners("changesWhileEditing");
    return new Promise((resolve, reject) => {
      const me = this, { eventRecord, editor } = me;
      me.scheduler.removeEvents([eventRecord], (removeRecord) => {
        if (removeRecord && editor.containsFocus) {
          editor.revertFocus();
        }
        resolve(removeRecord);
      }, editor);
    });
  }
  //endregion
  //region Stores
  onChangeProject() {
    if (this.resourceField) {
      this.resourceField.store = {};
    }
  }
  get eventStore() {
    return this.scheduler.project.eventStore;
  }
  get resourceStore() {
    return this.scheduler.project.resourceStore;
  }
  get assignmentStore() {
    return this.scheduler.project.assignmentStore;
  }
  //endregion
  //endregion
  //region Events
  onActivateEditor({ eventRecord, resourceRecord, eventElement }) {
    this.editEvent(eventRecord, resourceRecord, eventElement);
  }
  onDragCreateEnd({ eventRecord, resourceRecord, proxyElement, stmCapture }) {
    this.editEvent(eventRecord, resourceRecord, proxyElement, stmCapture);
  }
  // chained from EventNavigation
  onEventEnterKey({ assignmentRecord, eventRecord, target }) {
    const { client } = this, element = target[target.matches(client.eventSelector) ? "querySelector" : "closest"](client.eventInnerSelector);
    if (assignmentRecord) {
      this.editEvent(eventRecord, assignmentRecord.resource, element);
    } else if (eventRecord) {
      this.editEvent(eventRecord, eventRecord.resource, element);
    }
  }
  // Toggle fields visibility when changing eventType
  onEventTypeChange({ value }) {
    this.toggleEventType(value);
  }
  //endregion
  //region Context menu
  populateEventMenu({ eventRecord, resourceRecord, items }) {
    if (!this.scheduler.readOnly && !this.disabled) {
      items.editEvent = {
        text: "L{EventEdit.Edit event}",
        localeClass: this,
        icon: "b-icon b-icon-edit",
        weight: 100,
        disabled: eventRecord.readOnly,
        onItem: () => {
          this.editEvent(eventRecord, resourceRecord);
        }
      };
    }
  }
  //endregion
  onBeforeEditorToggleReveal({ reveal }) {
    if (reveal) {
      this.editor.setupEditorButtons();
    }
    this[reveal ? "onBeforeEditorShow" : "resetEditingContext"]();
  }
  async resetEditingContext() {
    const me = this;
    me.detachListeners("changesWhileEditing");
    super.resetEditingContext();
    if (me.hasStmCapture && !me.isDeletingEvent && !me.isCancelingEdit) {
      await me.freeStm(false);
    }
    me.resourceRecord = null;
  }
  finalizeStmCapture(shouldReject) {
    return this.freeStm(!shouldReject);
  }
  updateLocalization() {
    if (this._editor) {
      this.updateCSSVars({ element: this._editor.element });
    }
    super.updateLocalization(...arguments);
  }
};
EventEdit._$name = "EventEdit";
GridFeatureManager.registerFeature(EventEdit, true, "Scheduler");
GridFeatureManager.registerFeature(EventEdit, false, ["SchedulerPro", "ResourceHistogram"]);
EventEdit.initClass();

// ../Scheduler/lib/Scheduler/widget/ResourceFilter.js
var ResourceFilter = class extends List {
  static get $name() {
    return "ResourceFilter";
  }
  // Factoryable type name
  static get type() {
    return "resourcefilter";
  }
  static get delayable() {
    return {
      applyFilters: "raf"
    };
  }
  static get configurable() {
    return {
      /**
       * The {@link Scheduler.data.EventStore EventStore} to filter.
       * Events for resources which are deselected in this List will be filtered out.
       * @config {Scheduler.data.EventStore}
       */
      eventStore: null,
      multiSelect: true,
      toggleAllIfCtrlPressed: true,
      collapsibleGroups: true,
      itemTpl: (record) => StringHelper.encodeHtml(record.name || ""),
      /**
       * An optional filter function to apply when loading resources from the project's
       * resource store. Defaults to loading all resources.
       *
       * **This is called using this `ResourceFilter` as the `this` object.**
       *
       * @config {Function|String}
       * @param {Scheduler.model.ResourceModel} resource Resorce for filtering
       * @returns {Boolean} Returns `true` to include the passed resource
       * @default
       */
      masterFilter: (resource) => true,
      /**
       * By default, deselecting list items filters only the {@link #config-eventStore} so that
       * events for the deselected resources are hidden from view. The `resourceStore` is __not__
       * filtered.
       *
       * Configure this as `true` to also filter the `resourceStore` so that deselected resources
       * are also hidden from view (They will remain in this `List`)
       * @config {Boolean}
       * @default false
       */
      filterResources: null
    };
  }
  itemIconTpl(record, i) {
    const { eventColor } = record, cls = DomHelper.isNamedColor(eventColor) ? ` b-sch-foreground-${eventColor}` : "", style = !cls && eventColor ? ` style="color:${eventColor}"` : "";
    return this.multiSelect ? `<div class="b-selected-icon b-icon${cls}"${style}></div>` : "";
  }
  changeStore(store) {
    if (this.eventStore) {
      return super.changeStore(...arguments);
    } else {
      this._storeConfig = store;
    }
  }
  changeEventStore(eventStore) {
    this.getConfig("store");
    return eventStore;
  }
  updateEventStore(eventStore) {
    const me = this, chainedStoreConfig = me._storeConfig || {}, { resourceStore } = eventStore, store = me.store = resourceStore.chain(me.masterFilter, null, {
      ...chainedStoreConfig,
      syncOrder: true
    }), changeListeners = {
      change: "onStoreChange",
      thisObj: me
    };
    store.un(changeListeners);
    resourceStore.ion(changeListeners);
    if (!resourceStore.count) {
      resourceStore.project.ion({
        name: "project",
        refresh: "initFilter",
        thisObj: me
      });
    } else {
      me.initFilter();
    }
  }
  changeMasterFilter(masterFilter) {
    const me = this;
    if (!me.filterResources) {
      return function(r) {
        return me.callback(masterFilter, me, [r]);
      };
    }
  }
  initFilter() {
    var _a;
    const me = this;
    if (me.eventStore.resourceStore.count) {
      const { selected } = me;
      if (!selected.count) {
        if (((_a = me.initialConfig.selected) == null ? void 0 : _a.length) === 0) {
          me.onInternalSelectionChange({ source: selected, added: [], removed: [] });
        } else {
          selected.add(me.store.allRecords.filter((r) => !r.isGroupHeader));
        }
      }
      me.detachListeners("project");
    }
  }
  onStoreRefresh({ source: store, action }) {
    if (action === "filter" && this.eventStoreFilter) {
      const { eventStoreFilter } = this, { disabled } = eventStoreFilter, newDisabled = !store.isFiltered && this.allSelected;
      if (newDisabled !== disabled) {
        eventStoreFilter.disabled = newDisabled;
        this.applyFilters();
      }
    }
    super.onStoreRefresh(...arguments);
  }
  onInternalSelectionChange({ source: selected, added, removed }) {
    const me = this, disabled = !me.store.isFiltered && me.allSelected;
    super.onInternalSelectionChange(...arguments);
    let filtersAdded = false;
    if (!me.eventStoreFilter) {
      me.eventStoreFilter = me.eventStore.addFilter({
        id: `${me.id}-filter-instance`,
        filterBy: (e) => !e.resource || me.selected.includes(e.resources),
        disabled
      }, (added == null ? void 0 : added.length) === me.store.count);
      filtersAdded = true;
    }
    if (me.filterResources && !me.resourceStoreFilter) {
      me.resourceStoreFilter = me.eventStore.resourceStore.addFilter({
        id: `${me.id}-filter-instance`,
        filterBy: (r) => me.selected.includes(r),
        disabled
      }, (added == null ? void 0 : added.length) === me.store.count);
      filtersAdded = true;
    }
    if (filtersAdded) {
      return;
    }
    me.eventStoreFilter.disabled = disabled;
    me.resourceStoreFilter && (me.resourceStoreFilter.disabled = disabled);
    me.applyFilters();
    if (me.eventListeners.change) {
      const value = selected.values, oldValue = value.concat(removed);
      ArrayHelper.remove(oldValue, ...added);
      me.triggerFieldChange({
        value,
        oldValue
      });
    }
  }
  /**
   * An array encapsulating the currently selected resources.
   * @member {Scheduler.model.ResourceModel[]}
   * @readonly
   */
  get value() {
    return this.selected.values;
  }
  applyFilters() {
    this.eventStore.filter();
    this.filterResources && this.eventStore.resourceStore.filter();
  }
  doDestroy() {
    var _a;
    (_a = this.store) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
};
ResourceFilter.initClass();
ResourceFilter._$name = "ResourceFilter";

// ../Scheduler/lib/Scheduler/widget/SchedulerDatePicker.js
var SchedulerDatePicker = class _SchedulerDatePicker extends DatePicker {
  static get $name() {
    return "SchedulerDatePicker";
  }
  static get type() {
    return "datepicker";
  }
  static get configurable() {
    return {
      /**
       * How to show presence of events in the configured {@link #config-eventStore} in the
       * day cells. Values may be:
       *
       * * `false` - Do not show events in cells.
       * * `true` - Show a themeable bullet to indicate the presence of events for a date.
       * * `'count'` - Show a themeable badge containing the event count for a date.
       * @config {Boolean|'count'}
       * @default false
       */
      showEvents: null,
      /**
       * The {@link Scheduler.data.EventStore event store} from which the in-cell event presence
       * indicators are drawn.
       * @config {Scheduler.data.EventStore}
       */
      eventStore: null,
      /**
       * A function, or the name of a function in the ownership hierarchy to filter which events
       * are collected into the day cell data blocks.
       *
       * Return `true` to include the passed event, or a *falsy* value to exclude the event.
       *
       * @config {Function|String}
       * @param {Scheduler.model.EventModel} event Event for filtering
       * @returns {Boolean} Return `true` to include the passed event
       */
      eventFilter: {
        $config: "lazy",
        value: null
      }
    };
  }
  construct(config) {
    if ("events" in config) {
      config = {
        ...config,
        showEvents: config.events
      };
      delete config.events;
      VersionHelper.deprecate(VersionHelper["calendar"] ? "Calendar" : "Scheduler", "6.0.0", "DatePicker#events should be configured as showEvents");
    }
    super.construct(config);
  }
  changeEventFilter(eventFilter) {
    if (typeof eventFilter === "string") {
      const { handler, thisObj } = this.resolveCallback(eventFilter);
      eventFilter = handler.bind(thisObj);
    }
    return eventFilter;
  }
  doRefresh() {
    if (this.isVisible || !this.showEvents) {
      this.refreshEventsMap();
      return super.doRefresh(...arguments);
    } else {
      this.whenVisible("doRefresh");
    }
  }
  updateShowEvents(showEvents, oldShowEvents) {
    const me = this, { classList } = me.contentElement;
    let { eventStore } = me;
    me.requestAnimationFrame(() => {
      var _a;
      me.element.classList.toggle("b-datepicker-with-events", Boolean(showEvents));
      (_a = me.owner) == null ? void 0 : _a.element.classList.toggle("b-datepicker-with-events", Boolean(showEvents));
      showEvents && classList.add(`b-show-events-${showEvents}`);
      classList.remove(`b-show-events-${oldShowEvents}`);
    });
    if (showEvents) {
      if (!eventStore) {
        const eventStoreOwner = me.up((w) => w.eventStore);
        if (eventStoreOwner) {
          eventStore = eventStoreOwner.eventStore;
        } else {
          throw new Error("DatePicker configured with events but no eventStore");
        }
      }
    } else {
      me.eventsMap = null;
    }
    if (!me.isConfiguring) {
      me.updateEventStore(eventStore);
      me.doRefresh();
    }
  }
  refreshEventsMap() {
    const me = this;
    if (me.showEvents) {
      me.eventsMap = me.eventStore.getEventCounts({
        startDate: me.startDate,
        endDate: me.endDate,
        dateMap: me.eventsMap,
        filter: me.eventFilter
      });
    }
  }
  updateEventStore(eventStore) {
    var _a;
    if (eventStore.findListener("change", "refresh", this) === -1) {
      (_a = eventStore == null ? void 0 : eventStore[this.showEvents ? "on" : "un"]) == null ? void 0 : _a.call(eventStore, {
        change: "refresh",
        thisObj: this
      });
    }
  }
  cellRenderer({ cell, date }) {
    var _a, _b;
    const { showEvents } = this, count = (_b = (_a = this.eventCounts) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, DateHelper.makeKey(date)), isCount = showEvents === "count";
    delete cell.dataset.btip;
    if (count) {
      if (!isCount && this.eventCountTip) {
        cell.dataset.btip = this.L("L{ResourceInfoColumn.eventCountText}", count);
      }
      DomHelper.createElement({
        dataset: {
          count
        },
        class: {
          [isCount ? "b-cell-events-badge" : "b-icon b-icon-circle"]: 1,
          [_SchedulerDatePicker.getEventCountClass(count)]: 1
        },
        parent: cell,
        [isCount ? "text" : ""]: count
      });
    }
  }
  static getEventCountClass(count) {
    if (count) {
      if (count < 4) {
        return "b-datepicker-1-to-3-events";
      }
      if (count < 7) {
        return "b-datepicker-4-to-6-events";
      }
      return "b-calendar-7-or-more-events";
    }
    return "";
  }
  static setupClass(meta) {
    meta.replaceType = true;
    super.setupClass(meta);
  }
};
SchedulerDatePicker.initClass();
SchedulerDatePicker._$name = "SchedulerDatePicker";

export {
  RecurrenceLegend,
  EditBase,
  EventEditor,
  RecurrenceCombo,
  RecurrenceLegendButton,
  RecurrenceEditor,
  RecurringEventEdit_default,
  ResourceCombo,
  EventEdit,
  ResourceFilter,
  SchedulerDatePicker
};
//# sourceMappingURL=chunk-SELTHR7K.js.map
