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
  GridBase,
  GridFeatureManager,
  Header,
  Location,
  SubGrid,
  WidgetColumn
} from "./chunk-GGOYEX2W.js";
import {
  ButtonGroup
} from "./chunk-6ZLMCHE5.js";
import {
  CrudManager,
  CrudManagerView_default,
  ProjectModel,
  RecurrenceDayRuleEncoder,
  TimeSpan
} from "./chunk-KVD75ID2.js";
import {
  AvatarRendering,
  ColorField
} from "./chunk-4LHHPUQ6.js";
import {
  ArrayHelper,
  AsyncHelper,
  Base,
  BrowserHelper,
  Collection,
  ColorPicker,
  Combo,
  ContextMenuBase,
  DateHelper,
  Delayable_default,
  DomClassList,
  DomDataStore,
  DomHelper,
  DomSync,
  EventHelper,
  Events_default,
  FunctionHelper,
  GlobalEvents_default,
  IdHelper,
  LocaleHelper,
  Localizable_default,
  Model,
  Navigator,
  ObjectHelper,
  Objects,
  Panel,
  Popup,
  Rectangle,
  ResizeMonitor,
  Scroller,
  Store,
  StringHelper,
  TimeZoneHelper,
  VersionHelper,
  Widget,
  __privateAdd,
  __privateGet,
  __privateSet,
  __publicField,
  unitMagnitudes
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/preset/ViewPreset.js
var ViewPreset = class extends Model {
  static get fields() {
    return [
      /**
       * The name of an existing view preset to extend
       * @field {String} base
       */
      { name: "base", type: "string" },
      /**
       * The name of the view preset
       * @field {String} name
       */
      { name: "name", type: "string" },
      /**
       * The height of the row in horizontal orientation
       * @field {Number} rowHeight
       * @default
       */
      {
        name: "rowHeight",
        defaultValue: 24
      },
      /**
       * The width of the time tick column in horizontal orientation
       * @field {Number} tickWidth
       * @default
       */
      {
        name: "tickWidth",
        defaultValue: 50
      },
      /**
       * The height of the time tick column in vertical orientation
       * @field {Number} tickHeight
       * @default
       */
      {
        name: "tickHeight",
        defaultValue: 50
      },
      /**
       * Defines how dates will be formatted in tooltips etc
       * @field {String} displayDateFormat
       * @default
       */
      {
        name: "displayDateFormat",
        defaultValue: "HH:mm"
      },
      /**
       * The unit to shift when calling shiftNext/shiftPrevious to navigate in the chart.
       * Valid values are "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year".
       * @field {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'} shiftUnit
       * @default
       */
      {
        name: "shiftUnit",
        defaultValue: "hour"
      },
      /**
       * The amount to shift (in shiftUnits)
       * @field {Number} shiftIncrement
       * @default
       */
      {
        name: "shiftIncrement",
        defaultValue: 1
      },
      /**
       * The amount of time to show by default in a view (in the unit defined by {@link #field-mainUnit})
       * @field {Number} defaultSpan
       * @default
       */
      {
        name: "defaultSpan",
        defaultValue: 12
      },
      /**
       * Initially set to a unit. Defaults to the unit defined by the middle header.
       * @field {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'} mainUnit
       */
      {
        name: "mainUnit"
      },
      /**
       * Note: Currently, this field only applies when changing viewPreset with the {@link Scheduler.widget.ViewPresetCombo}.
       *
       * Set to a number and that amount of {@link #field-mainUnit} will be added to the startDate. For example: A
       * start value of `5` together with the mainUnit `hours` will add 5 hours to the startDate. This can achieve
       * a "day view" that starts 5 AM.
       *
       * Set to a string unit (for example week, day, month) and the startDate will be the start of that unit
       * calculated from current startDate. A start value of `week` will result in a startDate in the first day of
       * the week.
       *
       * If set to a number or not set at all, the startDate will be calculated at the beginning of current
       * mainUnit.
       * @field {Number|String} start
       */
      {
        name: "start"
      },
      /**
       * An object containing a unit identifier and an increment variable. This value means minimal task duration
       * you can create using UI. For example when you drag create a task or drag & drop a task, if increment is 5
       * and unit is 'minute' that means that you can create a 5-minute-long task, or move it 5 min
       * forward/backward. This config maps to scheduler's
       * {@link Scheduler.view.mixin.TimelineDateMapper#property-timeResolution} config.
       *
       * ```javascript
       * timeResolution : {
       *   unit      : 'minute',  //Valid values are "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year".
       *   increment : 5
       * }
       * ```
       *
       * @field {ViewPresetTimeResolution} timeResolution
       */
      "timeResolution",
      /**
       * An array containing one or more {@link #typedef-ViewPresetHeaderRow} config objects, each of
       * which defines a level of headers for the scheduler.
       * The `main` unit will be the last header's unit, but this can be changed using the
       * {@link #field-mainHeaderLevel} field.
       * @field {ViewPresetHeaderRow[]} headers
       */
      "headers",
      /**
       * Index of the {@link #field-headers} array to define which header level is the `main` header.
       * Defaults to the bottom header.
       * @field {Number} mainHeaderLevel
       */
      "mainHeaderLevel",
      /**
       * Index of a header level in the {@link #field-headers} array for which column lines are drawn. See
       * {@link Scheduler.feature.ColumnLines}.
       * Defaults to the bottom header.
       * @field {Number} columnLinesFor
       */
      "columnLinesFor"
    ];
  }
  construct() {
    super.construct(...arguments);
    this.normalizeUnits();
  }
  generateId(owner) {
    const me = this, {
      headers
    } = me, parts = [];
    let result = Object.getPrototypeOf(me.data).id;
    if (!result) {
      for (let { length } = headers, i = length - 1; i >= 0; i--) {
        const { unit, increment } = headers[i], multiple = increment > 1;
        parts.push(`${multiple ? increment : ""}${i ? unit : StringHelper.capitalize(unit)}${multiple ? "s" : ""}`);
      }
      result = parts.join("And");
    }
    if (owner.count && owner.includes(result)) {
      result += `-${me.tickWidth}by${me.tickHeight || me.tickWidth}`;
      if (owner.includes(result)) {
        result += `-${me.bottomHeader.increment}`;
        if (owner.includes(result)) {
          result = IdHelper.generateId(`${result}-`);
        }
      }
    }
    return result;
  }
  normalizeUnits() {
    const me = this, { timeResolution, headers, shiftUnit } = me;
    if (headers) {
      for (let i = 0, { length } = headers; i < length; i++) {
        const header = headers[i];
        header.unit = DateHelper.normalizeUnit(header.unit);
        if (header.splitUnit) {
          header.splitUnit = DateHelper.normalizeUnit(header.splitUnit);
        }
        if (!("increment" in header)) {
          headers[i] = Object.assign({
            increment: 1
          }, header);
        }
      }
    }
    if (timeResolution) {
      timeResolution.unit = DateHelper.normalizeUnit(timeResolution.unit);
    }
    if (shiftUnit) {
      me.shiftUnit = DateHelper.normalizeUnit(shiftUnit);
    }
  }
  // Process legacy columnLines config into a headers array.
  static normalizeHeaderConfig(data) {
    const { headerConfig, columnLinesFor, mainHeaderLevel } = data, headers = data.headers = [];
    if (headerConfig.top) {
      if (columnLinesFor === "top") {
        data.columnLinesFor = 0;
      }
      if (mainHeaderLevel === "top") {
        data.mainHeaderLevel = 0;
      }
      headers[0] = headerConfig.top;
    }
    if (headerConfig.middle) {
      if (columnLinesFor === "middle") {
        data.columnLinesFor = headers.length;
      }
      if (mainHeaderLevel === "middle") {
        data.mainHeaderLevel = headers.length;
      }
      headers.push(headerConfig.middle);
    } else {
      throw new Error("ViewPreset.headerConfig must be configured with a middle");
    }
    if (headerConfig.bottom) {
      data.mainHeaderLevel = headers.length - 1;
      if (columnLinesFor == null) {
        data.columnLinesFor = headers.length - 1;
      } else if (columnLinesFor === "bottom") {
        data.columnLinesFor = headers.length;
      }
      if (mainHeaderLevel == null) {
        data.mainHeaderLevel = headers.length - 1;
      }
      if (mainHeaderLevel === "bottom") {
        data.mainHeaderLevel = headers.length;
      }
      headers.push(headerConfig.bottom);
    }
  }
  // These are read-only once configured.
  set() {
  }
  inSet() {
  }
  get columnLinesFor() {
    return "columnLinesFor" in this.data ? this.data.columnLinesFor : this.headers.length - 1;
  }
  get tickSize() {
    return this._tickSize || this.tickWidth;
  }
  get tickWidth() {
    return "tickWidth" in this.data ? this.data.tickWidth : 50;
  }
  get tickHeight() {
    return "tickHeight" in this.data ? this.data.tickHeight : 50;
  }
  get headerConfig() {
    if (this.data.headerConfig) {
      return this.data.headerConfig;
    }
    const result = {}, { headers } = this, { length } = headers;
    switch (length) {
      case 1:
        result.middle = headers[0];
        break;
      case 2:
        if (this.mainHeaderLevel === 0) {
          result.middle = headers[0];
          result.bottom = headers[1];
        } else {
          result.top = headers[0];
          result.middle = headers[1];
        }
        break;
      case 3:
        result.top = headers[0];
        result.middle = headers[1];
        result.bottom = headers[2];
        break;
      default:
        throw new Error("headerConfig object not supported for >3 header levels");
    }
    return result;
  }
  set mainHeaderLevel(mainHeaderLevel) {
    this.data.mainHeaderLevel = mainHeaderLevel;
  }
  get mainHeaderLevel() {
    if ("mainHeaderLevel" in this.data) {
      return this.data.mainHeaderLevel;
    }
    if (this.data.headers.length === 3) {
      return 1;
    }
    return this.headers.length - 1;
  }
  get mainHeader() {
    return this.headers[this.mainHeaderLevel];
  }
  get topHeader() {
    return this.headers[0];
  }
  get topUnit() {
    return this.topHeader.unit;
  }
  get topIncrement() {
    return this.topHeader.increment;
  }
  get bottomHeader() {
    return this.headers[this.headers.length - 1];
  }
  get leafUnit() {
    return this.bottomHeader.unit;
  }
  get leafIncrement() {
    return this.bottomHeader.increment;
  }
  get mainUnit() {
    if ("mainUnit" in this.data) {
      return this.data.mainUnit;
    }
    return this.mainHeader.unit;
  }
  get msPerPixel() {
    const { bottomHeader } = this;
    return Math.round(DateHelper.asMilliseconds(bottomHeader.increment || 1, bottomHeader.unit) / this.tickWidth);
  }
  get isValid() {
    const me = this;
    let valid = true;
    for (const header of me.headers) {
      valid = valid && Boolean(DateHelper.normalizeUnit(header.unit));
    }
    if (me.timeResolution) {
      valid = valid && DateHelper.normalizeUnit(me.timeResolution.unit);
    }
    if (me.shiftUnit) {
      valid = valid && DateHelper.normalizeUnit(me.shiftUnit);
    }
    return valid;
  }
};
__publicField(ViewPreset, "$name", "ViewPreset");
ViewPreset._$name = "ViewPreset";

// ../Scheduler/lib/Scheduler/localization/En.js
var locale = {
  localeName: "En",
  localeDesc: "English (US)",
  localeCode: "en-US",
  Object: {
    newEvent: "New event"
  },
  ResourceInfoColumn: {
    eventCountText: (data) => data + " event" + (data !== 1 ? "s" : "")
  },
  Dependencies: {
    from: "From",
    to: "To",
    valid: "Valid",
    invalid: "Invalid"
  },
  DependencyType: {
    SS: "SS",
    SF: "SF",
    FS: "FS",
    FF: "FF",
    StartToStart: "Start-to-Start",
    StartToEnd: "Start-to-Finish",
    EndToStart: "Finish-to-Start",
    EndToEnd: "Finish-to-Finish",
    short: [
      "SS",
      "SF",
      "FS",
      "FF"
    ],
    long: [
      "Start-to-Start",
      "Start-to-Finish",
      "Finish-to-Start",
      "Finish-to-Finish"
    ]
  },
  DependencyEdit: {
    From: "From",
    To: "To",
    Type: "Type",
    Lag: "Lag",
    "Edit dependency": "Edit dependency",
    Save: "Save",
    Delete: "Delete",
    Cancel: "Cancel",
    StartToStart: "Start to Start",
    StartToEnd: "Start to End",
    EndToStart: "End to Start",
    EndToEnd: "End to End"
  },
  EventEdit: {
    Name: "Name",
    Resource: "Resource",
    Start: "Start",
    End: "End",
    Save: "Save",
    Delete: "Delete",
    Cancel: "Cancel",
    "Edit event": "Edit event",
    Repeat: "Repeat"
  },
  EventDrag: {
    eventOverlapsExisting: "Event overlaps existing event for this resource",
    noDropOutsideTimeline: "Event may not be dropped completely outside the timeline"
  },
  SchedulerBase: {
    "Add event": "Add event",
    "Delete event": "Delete event",
    "Unassign event": "Unassign event",
    color: "Color"
  },
  TimeAxisHeaderMenu: {
    pickZoomLevel: "Zoom",
    activeDateRange: "Date range",
    startText: "Start date",
    endText: "End date",
    todayText: "Today"
  },
  EventCopyPaste: {
    copyEvent: "Copy event",
    cutEvent: "Cut event",
    pasteEvent: "Paste event"
  },
  EventFilter: {
    filterEvents: "Filter tasks",
    byName: "By name"
  },
  TimeRanges: {
    showCurrentTimeLine: "Show current timeline"
  },
  PresetManager: {
    secondAndMinute: {
      displayDateFormat: "ll LTS",
      name: "Seconds"
    },
    minuteAndHour: {
      topDateFormat: "ddd MM/DD, hA",
      displayDateFormat: "ll LST"
    },
    hourAndDay: {
      topDateFormat: "ddd MM/DD",
      middleDateFormat: "LST",
      displayDateFormat: "ll LST",
      name: "Day"
    },
    day: {
      name: "Day/hours"
    },
    week: {
      name: "Week/hours"
    },
    dayAndWeek: {
      displayDateFormat: "ll LST",
      name: "Week/days"
    },
    dayAndMonth: {
      name: "Month"
    },
    weekAndDay: {
      displayDateFormat: "ll LST",
      name: "Week"
    },
    weekAndMonth: {
      name: "Weeks"
    },
    weekAndDayLetter: {
      name: "Weeks/weekdays"
    },
    weekDateAndMonth: {
      name: "Months/weeks"
    },
    monthAndYear: {
      name: "Months"
    },
    year: {
      name: "Years"
    },
    manyYears: {
      name: "Multiple years"
    }
  },
  RecurrenceConfirmationPopup: {
    "delete-title": "You are deleting an event",
    "delete-all-message": "Do you want to delete all occurrences of this event?",
    "delete-further-message": "Do you want to delete this and all future occurrences of this event, or only the selected occurrence?",
    "delete-further-btn-text": "Delete All Future Events",
    "delete-only-this-btn-text": "Delete Only This Event",
    "update-title": "You are changing a repeating event",
    "update-all-message": "Do you want to change all occurrences of this event?",
    "update-further-message": "Do you want to change only this occurrence of the event, or this and all future occurrences?",
    "update-further-btn-text": "All Future Events",
    "update-only-this-btn-text": "Only This Event",
    Yes: "Yes",
    Cancel: "Cancel",
    width: 600
  },
  RecurrenceLegend: {
    " and ": " and ",
    Daily: "Daily",
    "Weekly on {1}": ({ days }) => `Weekly on ${days}`,
    "Monthly on {1}": ({ days }) => `Monthly on ${days}`,
    "Yearly on {1} of {2}": ({ days, months }) => `Yearly on ${days} of ${months}`,
    "Every {0} days": ({ interval }) => `Every ${interval} days`,
    "Every {0} weeks on {1}": ({ interval, days }) => `Every ${interval} weeks on ${days}`,
    "Every {0} months on {1}": ({ interval, days }) => `Every ${interval} months on ${days}`,
    "Every {0} years on {1} of {2}": ({ interval, days, months }) => `Every ${interval} years on ${days} of ${months}`,
    position1: "the first",
    position2: "the second",
    position3: "the third",
    position4: "the fourth",
    position5: "the fifth",
    "position-1": "the last",
    day: "day",
    weekday: "weekday",
    "weekend day": "weekend day",
    daysFormat: ({ position, days }) => `${position} ${days}`
  },
  RecurrenceEditor: {
    "Repeat event": "Repeat event",
    Cancel: "Cancel",
    Save: "Save",
    Frequency: "Frequency",
    Every: "Every",
    DAILYintervalUnit: "day(s)",
    WEEKLYintervalUnit: "week(s)",
    MONTHLYintervalUnit: "month(s)",
    YEARLYintervalUnit: "year(s)",
    Each: "Each",
    "On the": "On the",
    "End repeat": "End repeat",
    "time(s)": "time(s)"
  },
  RecurrenceDaysCombo: {
    day: "day",
    weekday: "weekday",
    "weekend day": "weekend day"
  },
  RecurrencePositionsCombo: {
    position1: "first",
    position2: "second",
    position3: "third",
    position4: "fourth",
    position5: "fifth",
    "position-1": "last"
  },
  RecurrenceStopConditionCombo: {
    Never: "Never",
    After: "After",
    "On date": "On date"
  },
  RecurrenceFrequencyCombo: {
    None: "No repeat",
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly",
    Yearly: "Yearly"
  },
  RecurrenceCombo: {
    None: "None",
    Custom: "Custom..."
  },
  Summary: {
    "Summary for": (date) => `Summary for ${date}`
  },
  ScheduleRangeCombo: {
    completeview: "Complete schedule",
    currentview: "Visible schedule",
    daterange: "Date range",
    completedata: "Complete schedule (for all events)"
  },
  SchedulerExportDialog: {
    "Schedule range": "Schedule range",
    "Export from": "From",
    "Export to": "To"
  },
  ExcelExporter: {
    "No resource assigned": "No resource assigned"
  },
  CrudManagerView: {
    serverResponseLabel: "Server response:"
  },
  DurationColumn: {
    Duration: "Duration"
  }
};
var En_default = LocaleHelper.publishLocale(locale);

// ../Scheduler/lib/Scheduler/preset/PresetStore.js
var PresetStore = class extends Localizable_default(Store) {
  static get $name() {
    return "PresetStore";
  }
  static get defaultConfig() {
    return {
      useRawData: true,
      modelClass: ViewPreset,
      /**
       * Specifies the sort order of the presets in the store.
       * By default they are in zoomed out to zoomed in order. That is
       * presets which will create widest event bars to presets
       * which will produce narrowest event bars.
       *
       * Configure this as `-1` to reverse this order.
       * @config {Number}
       * @default
       */
      zoomOrder: 1
    };
  }
  set storage(storage) {
    super.storage = storage;
    this.storage.addSorter((lhs, rhs) => {
      const leftBottomHeader = lhs.bottomHeader, rightBottomHeader = rhs.bottomHeader;
      const order = rhs.msPerPixel - lhs.msPerPixel || unitMagnitudes[leftBottomHeader.unit] - unitMagnitudes[rightBottomHeader.unit] || leftBottomHeader.increment - rightBottomHeader.increment;
      return order * this.zoomOrder;
    });
  }
  get storage() {
    return super.storage;
  }
  getById(id) {
    return super.getById(id) || !this.isPresetManager && globalThis.bryntum.PresetManager.getById(id);
  }
  createRecord(data, ...args) {
    let result;
    if (data.isViewPreset) {
      return data;
    }
    if (typeof data === "string") {
      result = this.getById(data);
    } else if (typeof data === "number") {
      result = this.getAt(data);
    } else {
      if (data.base) {
        data = this.copyBaseValues(data);
      }
      return super.createRecord(data, ...args);
    }
    if (!result) {
      throw new Error(`ViewPreset ${data} does not exist`);
    }
    return result;
  }
  updateLocalization() {
    super.updateLocalization();
    const me = this;
    let presets = me.allRecords;
    if (me.isPresetManager) {
      presets = new Set(presets.concat(Object.values(me.basePresets)));
    }
    presets.forEach((preset) => {
      let localePreset = me.optionalL(`L{PresetManager.${preset.id}}`, null, true);
      if (typeof localePreset === "string" && preset.baseId) {
        localePreset = me.optionalL(`L{PresetManager.${preset.baseId}}`, null, true);
      }
      if (localePreset && typeof localePreset === "object") {
        if (!preset.originalDisplayDateFormat) {
          preset.originalDisplayDateFormat = preset.displayDateFormat;
        }
        if (preset.mainHeaderLevel === 0 && localePreset.topDateFormat) {
          localePreset.middleDateFormat = localePreset.middleDateFormat || localePreset.topDateFormat;
        }
        preset.setData("displayDateFormat", localePreset.displayDateFormat || preset.originalDisplayDateFormat);
        ["top", "middle", "bottom"].forEach((level) => {
          const levelConfig = preset.headerConfig[level], localeLevelDateFormat = localePreset[level + "DateFormat"];
          if (levelConfig) {
            if (!levelConfig.originalDateFormat) {
              levelConfig.originalDateFormat = levelConfig.dateFormat;
            }
            if (localeLevelDateFormat && levelConfig.renderer) {
              levelConfig.renderer = null;
            }
            levelConfig.dateFormat = localeLevelDateFormat || levelConfig.originalDateFormat;
          }
        });
        if (localePreset.name) {
          if (!preset.unlocalizedName) {
            preset.unlocalizedName = preset.name;
          }
          preset.setData("name", localePreset.name);
        } else if (preset.unlocalizedName && preset.unlocalizedName !== preset.name) {
          preset.name = preset.unlocalizedName;
          preset.unlocalizedName = null;
        }
      }
    });
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // Preset config on Scheduler/Gantt expects array of presets and not store config
  getCurrentConfig(options) {
    return super.getCurrentConfig(options).data;
  }
  copyBaseValues(presetData) {
    let base = this.getById(presetData.base);
    if (!base) {
      throw new Error(`ViewPreset base '${presetData.base}' does not exist.`);
    }
    base = ObjectHelper.clone(base.data);
    delete base.id;
    if (presetData.name) {
      delete base.name;
    }
    return ObjectHelper.merge(base, presetData);
  }
  add(preset) {
    preset = Array.isArray(preset) ? preset : [preset];
    preset.forEach((preset2) => {
      if (preset2.isViewPreset && preset2.base) {
        preset2.data = this.copyBaseValues(preset2.originalData);
      }
    });
    return super.add(...arguments);
  }
};
PresetStore._$name = "PresetStore";

// ../Scheduler/lib/Scheduler/preset/PresetManager.js
var PresetManager = class extends PresetStore {
  static get $name() {
    return "PresetManager";
  }
  static get defaultConfig() {
    return {
      // To not break CSP demo
      preventSubClassingModel: true,
      basePresets: {
        secondAndMinute: {
          name: "Seconds",
          tickWidth: 30,
          // Time column width
          tickHeight: 40,
          displayDateFormat: "ll LTS",
          // Controls how dates will be displayed in tooltips etc
          shiftIncrement: 10,
          // Controls how much time to skip when calling shiftNext and shiftPrevious.
          shiftUnit: "minute",
          // Valid values are "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year".
          defaultSpan: 24,
          // By default, if no end date is supplied to a view it will show 24 hours
          timeResolution: {
            // Dates will be snapped to this resolution
            unit: "second",
            // Valid values are "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year".
            increment: 5
          },
          // This defines your header rows.
          // For each row you can define "unit", "increment", "dateFormat", "renderer", "align", and "thisObj"
          headers: [
            {
              unit: "minute",
              dateFormat: "lll"
            },
            {
              unit: "second",
              increment: 10,
              dateFormat: "ss"
            }
          ]
        },
        minuteAndHour: {
          name: "Minutes",
          tickWidth: 60,
          // Time column width
          tickHeight: 60,
          displayDateFormat: "ll LT",
          // Controls how dates will be displayed in tooltips etc
          shiftIncrement: 1,
          // Controls how much time to skip when calling shiftNext and shiftPrevious.
          shiftUnit: "hour",
          // Valid values are "MILLI", "SECOND", "minute", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
          defaultSpan: 24,
          // By default, if no end date is supplied to a view it will show 24 hours
          timeResolution: {
            // Dates will be snapped to this resolution
            unit: "minute",
            // Valid values are "MILLI", "SECOND", "minute", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
            increment: 15
          },
          headers: [
            {
              unit: "hour",
              dateFormat: "ddd MM/DD, hA"
            },
            {
              unit: "minute",
              increment: 30,
              dateFormat: "mm"
            }
          ]
        },
        hourAndDay: {
          name: "Day",
          tickWidth: 70,
          tickHeight: 40,
          displayDateFormat: "ll LT",
          shiftIncrement: 1,
          shiftUnit: "day",
          defaultSpan: 24,
          timeResolution: {
            unit: "minute",
            increment: 30
          },
          headers: [
            {
              unit: "day",
              dateFormat: "ddd DD/MM"
              //Mon 01/10
            },
            {
              unit: "hour",
              dateFormat: "LT"
            }
          ]
        },
        day: {
          name: "Day/hours",
          displayDateFormat: "LT",
          shiftIncrement: 1,
          shiftUnit: "day",
          defaultSpan: 1,
          timeResolution: {
            unit: "minute",
            increment: 30
          },
          mainHeaderLevel: 0,
          headers: [
            {
              unit: "day",
              dateFormat: "ddd DD/MM",
              // Mon 01/02
              splitUnit: "day"
            },
            {
              unit: "hour",
              renderer(value) {
                return `
                                    <div class="b-sch-calendarcolumn-ct"><span class="b-sch-calendarcolumn-hours">${DateHelper.format(value, "HH")}</span>
                                    <span class="b-sch-calendarcolumn-minutes">${DateHelper.format(value, "mm")}</span></div>
                                `;
              }
            }
          ]
        },
        week: {
          name: "Week/hours",
          displayDateFormat: "LT",
          shiftIncrement: 1,
          shiftUnit: "week",
          defaultSpan: 24,
          timeResolution: {
            unit: "minute",
            increment: 30
          },
          mainHeaderLevel: 0,
          headers: [
            {
              unit: "week",
              dateFormat: "D d",
              splitUnit: "day"
            },
            {
              unit: "hour",
              dateFormat: "LT",
              // will be overridden by renderer
              renderer(value) {
                return `
                                    <div class="sch-calendarcolumn-ct">
                                    <span class="sch-calendarcolumn-hours">${DateHelper.format(value, "HH")}</span>
                                    <span class="sch-calendarcolumn-minutes">${DateHelper.format(value, "mm")}</span>
                                    </div>
                                `;
              }
            }
          ]
        },
        dayAndWeek: {
          name: "Days & Weeks",
          tickWidth: 100,
          tickHeight: 80,
          displayDateFormat: "ll LT",
          shiftUnit: "day",
          shiftIncrement: 1,
          defaultSpan: 5,
          timeResolution: {
            unit: "hour",
            increment: 1
          },
          headers: [
            {
              unit: "week",
              renderer(start) {
                return DateHelper.getShortNameOfUnit("week") + "." + DateHelper.format(start, "WW MMM YYYY");
              }
            },
            {
              unit: "day",
              dateFormat: "dd DD"
            }
          ]
        },
        // dayAndMonth : {
        //     name              : 'Days & Months',
        //     tickWidth         : 100,
        //     tickHeight        : 80,
        //     displayDateFormat : 'll LT',
        //     shiftUnit         : 'day',
        //     shiftIncrement    : 1,
        //     defaultSpan       : 5,
        //     timeResolution    : {
        //         unit      : 'hour',
        //         increment : 1
        //     },
        //     headers : [
        //         {
        //             unit       : 'month',
        //             dateFormat : 'MMMM YYYY',
        //             align      : 'start'
        //         },
        //         {
        //             unit       : 'day',
        //             dateFormat : 'dd DD'
        //         }
        //     ]
        // },
        dayAndMonth: {
          name: "Month",
          tickWidth: 100,
          tickHeight: 80,
          displayDateFormat: "ll LT",
          shiftUnit: "month",
          shiftIncrement: 1,
          defaultSpan: 1,
          mainUnit: "month",
          timeResolution: {
            unit: "hour",
            increment: 1
          },
          headers: [
            {
              unit: "month",
              dateFormat: "MMMM YYYY"
            },
            {
              unit: "day",
              dateFormat: "DD"
            }
          ]
        },
        weekAndDay: {
          name: "Week",
          tickWidth: 100,
          tickHeight: 80,
          displayDateFormat: "ll hh:mm A",
          shiftUnit: "week",
          shiftIncrement: 1,
          defaultSpan: 1,
          timeResolution: {
            unit: "day",
            increment: 1
          },
          mainHeaderLevel: 0,
          headers: [
            {
              unit: "week",
              dateFormat: "YYYY MMMM DD"
              // 2017 January 01
            },
            {
              unit: "day",
              increment: 1,
              dateFormat: "DD MMM"
            }
          ]
        },
        weekAndMonth: {
          name: "Weeks",
          tickWidth: 100,
          tickHeight: 105,
          displayDateFormat: "ll",
          shiftUnit: "week",
          shiftIncrement: 5,
          defaultSpan: 6,
          timeResolution: {
            unit: "day",
            increment: 1
          },
          headers: [
            {
              unit: "month",
              dateFormat: "MMM YYYY"
              //Jan 2017
            },
            {
              unit: "week",
              dateFormat: "DD MMM"
            }
          ]
        },
        weekAndDayLetter: {
          name: "Weeks/weekdays",
          tickWidth: 20,
          tickHeight: 50,
          displayDateFormat: "ll",
          shiftUnit: "week",
          shiftIncrement: 1,
          defaultSpan: 10,
          timeResolution: {
            unit: "day",
            increment: 1
          },
          mainHeaderLevel: 0,
          headers: [
            {
              unit: "week",
              dateFormat: "ddd DD MMM YYYY",
              verticalColumnWidth: 115
            },
            {
              unit: "day",
              dateFormat: "d1",
              verticalColumnWidth: 25
            }
          ]
        },
        weekDateAndMonth: {
          name: "Months/weeks",
          tickWidth: 30,
          tickHeight: 40,
          displayDateFormat: "ll",
          shiftUnit: "week",
          shiftIncrement: 1,
          defaultSpan: 10,
          timeResolution: {
            unit: "day",
            increment: 1
          },
          headers: [
            {
              unit: "month",
              dateFormat: "YYYY MMMM"
            },
            {
              unit: "week",
              dateFormat: "DD"
            }
          ]
        },
        monthAndYear: {
          name: "Months",
          tickWidth: 110,
          tickHeight: 110,
          displayDateFormat: "ll",
          shiftIncrement: 3,
          shiftUnit: "month",
          defaultSpan: 12,
          timeResolution: {
            unit: "day",
            increment: 1
          },
          headers: [
            {
              unit: "year",
              dateFormat: "YYYY"
              //2017
            },
            {
              unit: "month",
              dateFormat: "MMM YYYY"
              //Jan 2017
            }
          ]
        },
        year: {
          name: "Years",
          tickWidth: 100,
          tickHeight: 100,
          resourceColumnWidth: 100,
          displayDateFormat: "ll",
          shiftUnit: "year",
          shiftIncrement: 1,
          defaultSpan: 1,
          mainHeaderLevel: 0,
          timeResolution: {
            unit: "month",
            increment: 1
          },
          headers: [
            {
              unit: "year",
              dateFormat: "YYYY"
            },
            {
              unit: "quarter",
              renderer(start, end, cfg) {
                return DateHelper.getShortNameOfUnit("quarter").toUpperCase() + (Math.floor(start.getMonth() / 3) + 1);
              }
            }
          ]
        },
        manyYears: {
          name: "Multiple years",
          tickWidth: 40,
          tickHeight: 50,
          displayDateFormat: "ll",
          shiftUnit: "year",
          shiftIncrement: 1,
          defaultSpan: 10,
          timeResolution: {
            unit: "year",
            increment: 1
          },
          mainHeaderLevel: 0,
          headers: [
            {
              unit: "year",
              increment: 5,
              renderer: (start, end) => start.getFullYear() + " - " + end.getFullYear()
            },
            {
              unit: "year",
              dateFormat: "YY",
              increment: 1
            }
          ]
        }
      },
      // This is a list of bryntum-supplied preset adjustments used to create the Scheduler's
      // default initial set of ViewPresets.
      defaultPresets: [
        // Years over years
        "manyYears",
        { width: 80, increment: 1, resolution: 1, base: "manyYears", resolutionUnit: "YEAR" },
        // Years over quarters
        "year",
        { width: 30, increment: 1, resolution: 1, base: "year", resolutionUnit: "MONTH" },
        { width: 50, increment: 1, resolution: 1, base: "year", resolutionUnit: "MONTH" },
        { width: 200, increment: 1, resolution: 1, base: "year", resolutionUnit: "MONTH" },
        // Years over months
        "monthAndYear",
        // Months over weeks
        "weekDateAndMonth",
        // Months over weeks
        "weekAndMonth",
        // Months over weeks
        "weekAndDayLetter",
        // Months over days
        "dayAndMonth",
        // Weeks over days
        "weekAndDay",
        { width: 54, increment: 1, resolution: 1, base: "weekAndDay", resolutionUnit: "HOUR" },
        // Days over hours
        "hourAndDay",
        { width: 64, increment: 6, resolution: 30, base: "hourAndDay", resolutionUnit: "MINUTE" },
        { width: 100, increment: 6, resolution: 30, base: "hourAndDay", resolutionUnit: "MINUTE" },
        { width: 64, increment: 2, resolution: 30, base: "hourAndDay", resolutionUnit: "MINUTE" },
        // Hours over minutes
        "minuteAndHour",
        { width: 60, increment: 15, resolution: 5, base: "minuteAndHour" },
        { width: 130, increment: 15, resolution: 5, base: "minuteAndHour" },
        { width: 60, increment: 5, resolution: 5, base: "minuteAndHour" },
        { width: 100, increment: 5, resolution: 5, base: "minuteAndHour" },
        // Minutes over seconds
        "secondAndMinute",
        { width: 60, increment: 10, resolution: 5, base: "secondAndMinute" },
        { width: 130, increment: 5, resolution: 5, base: "secondAndMinute" }
      ],
      internalListeners: {
        locale: "updateLocalization"
      }
    };
  }
  set basePresets(basePresets) {
    const presetCache = this._basePresets = {};
    for (const id in basePresets) {
      basePresets[id].id = id;
      presetCache[id] = this.createRecord(basePresets[id]);
    }
  }
  get basePresets() {
    return this._basePresets;
  }
  set defaultPresets(defaultPresets) {
    for (let i = 0, { length } = defaultPresets; i < length; i++) {
      const presetAdjustment = defaultPresets[i], isBase = typeof presetAdjustment === "string", baseType = isBase ? presetAdjustment : presetAdjustment.base;
      let preset;
      if (isBase) {
        preset = this.basePresets[baseType];
      } else {
        const config = Object.setPrototypeOf(ObjectHelper.clone(this.basePresets[baseType].data), { id: baseType }), { timeResolution } = config, bottomHeader = config.headers[config.headers.length - 1];
        config.id = void 0;
        if ("width" in presetAdjustment) {
          config.tickWidth = presetAdjustment.width;
        }
        if ("height" in presetAdjustment) {
          config.tickHeight = presetAdjustment.height;
        }
        if ("increment" in presetAdjustment) {
          bottomHeader.increment = presetAdjustment.increment;
        }
        if ("resolution" in presetAdjustment) {
          timeResolution.increment = presetAdjustment.resolution;
        }
        if ("resolutionUnit" in presetAdjustment) {
          timeResolution.unit = DateHelper.getUnitByName(presetAdjustment.resolutionUnit);
        }
        preset = this.createRecord(config);
        preset.baseId = baseType;
      }
      this.add(preset);
    }
  }
  getById(id) {
    return super.getById(id) || this.basePresets[id];
  }
  /**
   * Registers a new view preset base to be used by any scheduler grid or tree on the page.
   * @param {String} id The unique identifier for this preset
   * @param {ViewPresetConfig} config The configuration properties of the view preset (see
   * {@link Scheduler.preset.ViewPreset} for more information)
   * @returns {Scheduler.preset.ViewPreset} A new ViewPreset based upon the passed configuration.
   */
  registerPreset(id, config) {
    const preset = this.createRecord(Object.assign({
      id
    }, config)), existingDuplicate = this.find((p) => p.equals(preset));
    if (existingDuplicate) {
      return existingDuplicate;
    }
    if (preset.isValid) {
      this.add(preset);
    } else {
      throw new Error("Invalid preset, please check your configuration");
    }
    return preset;
  }
  getPreset(preset) {
    if (typeof preset === "number") {
      preset = this.getAt(preset);
    }
    if (typeof preset === "string") {
      preset = this.getById(preset);
    } else if (!(preset instanceof ViewPreset)) {
      preset = this.createRecord(preset);
    }
    return preset;
  }
  /**
   * Applies preset customizations or fetches a preset view preset using its name.
   * @param {String|ViewPresetConfig} presetOrId Id of a predefined preset or a preset config object
   * @returns {Scheduler.preset.ViewPreset} Resulting ViewPreset instance
   */
  normalizePreset(preset) {
    const me = this;
    if (!(preset instanceof ViewPreset)) {
      if (typeof preset === "string") {
        preset = me.getPreset(preset);
        if (!preset) {
          throw new Error("You must define a valid view preset. See PresetManager for reference");
        }
      } else if (typeof preset === "object") {
        if (preset.base) {
          const base = this.getById(preset.base);
          if (!base) {
            throw new Error(`ViewPreset base '${preset.base}' does not exist`);
          }
          preset = ObjectHelper.merge(ObjectHelper.clone(base.data), preset);
        }
        if (preset.id) {
          preset = me.createRecord(preset);
        } else {
          preset = me.createRecord(ObjectHelper.assign({}, preset));
          preset.id = preset.generateId(preset);
        }
      }
    }
    return preset;
  }
  /**
   * Deletes a view preset
   * @param {String} id The id of the preset, or the preset instance.
   */
  deletePreset(presetOrId) {
    if (typeof presetOrId === "string") {
      presetOrId = this.getById(presetOrId);
    } else if (typeof presetOrId === "number") {
      presetOrId = this.getAt(presetOrId);
    }
    if (presetOrId) {
      this.remove(presetOrId);
      delete this.basePresets[presetOrId.id];
    }
  }
};
var pm = new PresetManager();
globalThis.bryntum.PresetManager = pm;

// ../Scheduler/lib/Scheduler/data/TimeAxis.js
var Tick = class extends TimeSpan {
  // Only getters on purpose, we do not support manipulating ticks
  get startDate() {
    return this.data.startDate;
  }
  get endDate() {
    return this.data.endDate;
  }
};
var TimeAxis = class extends Store {
  //region Events
  /**
   * Fires before the timeaxis is about to be reconfigured (e.g. new start/end date or unit/increment). Return `false`
   * to abort the operation.
   * @event beforeReconfigure
   * @param {Scheduler.data.TimeAxis} source The time axis instance
   * @param {Date} startDate The new time axis start date
   * @param {Date} endDate The new time axis end date
   */
  /**
   * Event that is triggered when we end reconfiguring and everything UI-related should be done
   * @event endReconfigure
   * @private
   */
  /**
   * Fires when the timeaxis has been reconfigured (e.g. new start/end date or unit/increment)
   * @event reconfigure
   * @param {Scheduler.data.TimeAxis} source The time axis instance
   */
  /**
   * Fires if all the ticks in the timeaxis are filtered out. After firing the filter is temporarily disabled to
   * return the time axis to a valid state. A disabled filter will be re-enabled the next time ticks are regenerated
   * @event invalidFilter
   * @param {Scheduler.data.TimeAxis} source The time axis instance
   */
  //endregion
  //region Default config
  static get defaultConfig() {
    return {
      modelClass: Tick,
      /**
       * Set to false if the timeline is not continuous, e.g. the next timespan does not start where the previous ended (for example skipping weekends etc).
       * @config {Boolean}
       * @default
       */
      continuous: true,
      originalContinuous: null,
      /**
       * Include only certain hours or days in the time axis (makes it `continuous : false`). Accepts and object
       * with `day` and `hour` properties:
       * ```
       * const scheduler = new Scheduler({
       *     timeAxis : {
       *         include : {
       *              // Do not display hours after 17 or before 9 (only display 9 - 17). The `to´ value is not
       *              // included in the time axis
       *              hour : {
       *                  from : 9,
       *                  to   : 17
       *              },
       *              // Do not display sunday or saturday
       *              day : [0, 6]
       *         }
       *     }
       * }
       * ```
       * In most cases we recommend that you use Scheduler's workingTime config instead. It is easier to use and
       * makes sure all parts of the Scheduler gets updated.
       * @config {Object}
       */
      include: null,
      /**
       * Automatically adjust the timespan when generating ticks with {@link #property-generateTicks} according to
       * the `viewPreset` configuration. Setting this to false may lead to shifting time/date of ticks.
       * @config {Boolean}
       * @default
       */
      autoAdjust: true,
      //isConfigured : false,
      // in case of `autoAdjust : false`, the 1st and last ticks can be truncated, containing only part of the normal tick
      // these dates will contain adjusted start/end (like if the tick has not been truncated)
      adjustedStart: null,
      adjustedEnd: null,
      // the visible position in the first tick, can actually be > 1 because the adjustment is done by the `mainUnit`
      visibleTickStart: null,
      // the visible position in the first tick, is always ticks count - 1 < value <= ticks count, in case of autoAdjust, always = ticks count
      visibleTickEnd: null,
      tickCache: {},
      viewPreset: null,
      maxTraverseTries: 100,
      useRawData: {
        disableDuplicateIdCheck: true,
        disableDefaultValue: true,
        disableTypeConversion: true
      }
    };
  }
  static get configurable() {
    return {
      /**
       * Method generating the ticks for this time axis. Should return a **non-empty** array of ticks. Each tick
       * is an object of the following structure:
       * ```
       * {
       *    startDate : ..., // start date
       *    endDate   : ...  // end date
       * }
       * ```
       * To see it in action please check out our [TimeAxis](https://bryntum.com/products/scheduler/examples/timeaxis/)
       * example and navigate to "Compressed non-working time" tab.
       *
       * @param {Date} axisStartDate The start date of the interval
       * @param {Date} axisEndDate The end date of the interval
       * @param {String} unit The unit of the time axis
       * @param {Number} increment The increment for the unit specified.
       * @returns {TimeSpanConfig[]} ticks The ticks representing the time axis
       * @config {Function}
       */
      generateTicks: null,
      unit: null,
      increment: null,
      resolutionUnit: null,
      resolutionIncrement: null,
      mainUnit: null,
      shiftUnit: null,
      shiftIncrement: 1,
      defaultSpan: 1,
      weekStartDay: null,
      // Used to force resolution to match whole ticks, to snap accordingly when using fillTicks in the UI
      forceFullTicks: null
    };
  }
  //endregion
  //region Init
  // private
  construct(config) {
    const me = this;
    super.construct(config);
    me.originalContinuous = me.continuous;
    me.ion({
      change: ({ action }) => {
        if (action !== "filter") {
          me.trigger("reconfigure", { supressRefresh: false });
        }
      },
      refresh: () => me.trigger("reconfigure", { supressRefresh: false }),
      endreconfigure: (event) => me.trigger("reconfigure", event)
    });
    if (me.startDate) {
      me.internalOnReconfigure();
      me.trigger("reconfigure");
    } else if (me.viewPreset) {
      const range = me.getAdjustedDates(/* @__PURE__ */ new Date());
      me.startDate = range.startDate;
      me.endDate = range.endDate;
    }
  }
  get isTimeAxis() {
    return true;
  }
  //endregion
  //region Configuration (reconfigure & consumePreset)
  /**
   * Reconfigures the time axis based on the config object supplied and generates the new 'ticks'.
   * @param {Object} config
   * @param {Boolean} [suppressRefresh]
   * @private
   */
  reconfigure(config, suppressRefresh = false, preventThrow = false) {
    const me = this, normalized = me.getAdjustedDates(config.startDate, config.endDate), oldConfig = {};
    if (me.trigger("beforeReconfigure", { startDate: normalized.startDate, endDate: normalized.endDate, config }) !== false) {
      me.trigger("beginReconfigure");
      me._configuredStartDate = config.startDate;
      me._configuredEndDate = config.endDate;
      for (const propName in config) {
        oldConfig[propName] = me[propName];
      }
      const viewPresetChanged = config.viewPreset && config.viewPreset !== me.viewPreset;
      if (viewPresetChanged) {
        preventThrow = me.isFiltered;
        me.filters.forEach((f) => f.disabled = false);
      }
      Object.assign(me, config);
      if (me.internalOnReconfigure(preventThrow, viewPresetChanged) === false) {
        return false;
      }
      me.trigger("endReconfigure", { suppressRefresh, config, oldConfig });
    }
  }
  internalOnReconfigure(preventThrow = false, viewPresetChanged) {
    const me = this;
    me.isConfigured = true;
    const adjusted = me.getAdjustedDates(me.startDate, me.endDate, true), normalized = me.getAdjustedDates(me.startDate, me.endDate), start = normalized.startDate, end = normalized.endDate;
    if (start >= end) {
      throw new Error(`Invalid start/end dates. Start date must be less than end date. Start date: ${start}. End date: ${end}.`);
    }
    const { unit, increment = 1 } = me, ticks = me.generateTicks(start, end, unit, increment) || // Offer a fallback in case user did not generate any ticks at all.
    me.constructor.prototype.generateTicks.call(me, start, end, unit, increment);
    me.suspendEvents();
    me.maintainFilter = preventThrow;
    me.data = ticks;
    me.maintainFilter = false;
    const { count } = me;
    if (count === 0) {
      if (preventThrow) {
        if (viewPresetChanged) {
          me.disableFilters();
        }
        me.resumeEvents();
        return false;
      }
      throw new Error("Invalid time axis configuration or filter, please check your input data.");
    }
    me.startDate = me.first.startDate;
    me.endDate = me.last.endDate;
    me.resumeEvents();
    if (me.isContinuous) {
      me.adjustedStart = adjusted.startDate;
      me.adjustedEnd = DateHelper.getNext(count > 1 ? ticks[count - 1].startDate : adjusted.startDate, unit, increment, me.weekStartDay);
    } else {
      me.adjustedStart = me.startDate;
      me.adjustedEnd = me.endDate;
    }
    me.updateVisibleTickBoundaries();
    me.updateTickCache(true);
  }
  updateVisibleTickBoundaries() {
    const me = this, {
      count,
      unit,
      startDate,
      endDate,
      weekStartDay,
      increment = 1
    } = me;
    const startDenominator = DateHelper.getNormalizedUnitDuration(startDate, unit) * increment, endDenominator = DateHelper.getNormalizedUnitDuration(endDate, unit) * increment;
    do {
      me.visibleTickStart = (startDate - me.adjustedStart) / startDenominator;
      if (me.autoAdjust)
        me.visibleTickStart = Math.floor(me.visibleTickStart);
      if (me.visibleTickStart >= 1)
        me.adjustedStart = DateHelper.getNext(me.adjustedStart, unit, increment, weekStartDay);
    } while (me.visibleTickStart >= 1);
    do {
      me.visibleTickEnd = count - (me.adjustedEnd - endDate) / endDenominator;
      if (count - me.visibleTickEnd >= 1)
        me.adjustedEnd = DateHelper.getNext(me.adjustedEnd, unit, -1, weekStartDay);
    } while (count - me.visibleTickEnd >= 1);
    me.fullTicks = !me.visibleTickStart && me.visibleTickEnd === count;
  }
  /**
   * Get the currently used time unit for the ticks
   * @readonly
   * @member {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'} unit
   */
  /**
   * Get/set currently used preset
   * @property {Scheduler.preset.ViewPreset}
   */
  get viewPreset() {
    return this._viewPreset;
  }
  set viewPreset(preset) {
    const me = this;
    preset = pm.getPreset(preset);
    if (!preset.isViewPreset) {
      throw new Error("TimeAxis must be configured with the ViewPreset instance that the Scheduler is using");
    }
    me._viewPreset = preset;
    Object.assign(me, {
      unit: preset.bottomHeader.unit,
      increment: preset.bottomHeader.increment || 1,
      resolutionUnit: preset.timeResolution.unit,
      resolutionIncrement: preset.timeResolution.increment,
      mainUnit: preset.mainHeader.unit,
      shiftUnit: preset.shiftUnit || preset.mainHeader.unit,
      shiftIncrement: preset.shiftIncrement || 1,
      defaultSpan: preset.defaultSpan || 1,
      presetName: preset.id,
      // Weekview columns are updated upon 'datachanged' event on this object.
      // We have to pass headers in order to render them correctly (timeAxisViewModel is incorrect in required time)
      headers: preset.headers
    });
  }
  //endregion
  //region Getters & setters
  get weekStartDay() {
    var _a;
    return (_a = this._weekStartDay) != null ? _a : DateHelper.weekStartDay;
  }
  // private
  get resolution() {
    return {
      unit: this.resolutionUnit,
      increment: this.resolutionIncrement
    };
  }
  // private
  set resolution(resolution) {
    this.resolutionUnit = resolution.unit;
    this.resolutionIncrement = resolution.increment;
  }
  get resolutionUnit() {
    return this.forceFullTicks ? this.unit : this._resolutionUnit;
  }
  get resolutionIncrement() {
    return this.forceFullTicks ? this.increment : this._resolutionIncrement;
  }
  //endregion
  //region Timespan & resolution
  /**
   * Changes the time axis timespan to the supplied start and end dates.
   *
   * **Note** This does **not** preserve the temporal scroll position. You may use
   * {@link Scheduler.view.Scheduler#function-setTimeSpan} to set the time axis and
   * maintain temporal scroll position (if possible).
   * @param {Date} newStartDate The new start date
   * @param {Date} [newEndDate] The new end date
   */
  setTimeSpan(newStartDate, newEndDate, preventThrow = false) {
    if (newEndDate && newStartDate - newEndDate === 0) {
      newEndDate = null;
    }
    const me = this, { startDate, endDate } = me.getAdjustedDates(newStartDate, newEndDate);
    if (me.startDate - startDate !== 0 || me.endDate - endDate !== 0) {
      return me.reconfigure({
        startDate,
        endDate
      }, false, preventThrow);
    }
  }
  /**
   * Moves the time axis by the passed amount and unit.
   *
   * NOTE: When using a filtered TimeAxis the result of `shift()` cannot be guaranteed, it might shift into a
   * filtered out span. It tries to be smart about it by shifting from unfiltered start and end dates.
   * If that solution does not work for your filtering setup, please call {@link #function-setTimeSpan} directly
   * instead.
   *
   * @param {Number} amount The number of units to jump
   * @param {String} [unit] The unit (Day, Week etc)
   */
  shift(amount, unit = this.shiftUnit) {
    const me = this;
    let { startDate, endDate } = me;
    if (me.isFiltered) {
      startDate = me.allRecords[0].startDate;
      endDate = me.allRecords[me.allCount - 1].endDate;
    }
    let tries = 0;
    do {
      startDate = DateHelper.add(startDate, amount, unit);
      endDate = DateHelper.add(endDate, amount, unit);
    } while (tries++ < me.maxTraverseTries && me.setTimeSpan(startDate, endDate, {
      preventThrow: true
    }) === false);
  }
  /**
   * Moves the time axis forward in time in units specified by the view preset `shiftUnit`, and by the amount specified by the `shiftIncrement`
   * config of the current view preset.
   *
   * NOTE: When using a filtered TimeAxis the result of `shiftNext()` cannot be guaranteed, it might shift into a
   * filtered out span. It tries to be smart about it by shifting from unfiltered start and end dates.
   * If that solution does not work for your filtering setup, please call {@link #function-setTimeSpan} directly
   * instead.
   *
   * @param {Number} [amount] The number of units to jump forward
   */
  shiftNext(amount = this.shiftIncrement) {
    this.shift(amount);
  }
  /**
   * Moves the time axis backward in time in units specified by the view preset `shiftUnit`, and by the amount specified by the `shiftIncrement` config of the current view preset.
   *
   * NOTE: When using a filtered TimeAxis the result of `shiftPrev()` cannot be guaranteed, it might shift into a
   * filtered out span. It tries to be smart about it by shifting from unfiltered start and end dates.
   * If that solution does not work for your filtering setup, please call {@link #function-setTimeSpan} directly
   * instead.
   *
   * @param {Number} [amount] The number of units to jump backward
   */
  shiftPrevious(amount = this.shiftIncrement) {
    this.shift(-amount);
  }
  //endregion
  //region Filter & continuous
  /**
   * Filter the time axis by a function (and clears any existing filters first). The passed function will be called with each tick in time axis.
   * If the function returns `true`, the 'tick' is included otherwise it is filtered. If all ticks are filtered out
   * the time axis is considered invalid, triggering `invalidFilter` and then removing the filter.
   * @param {Function} fn The function to be called, it will receive an object with `startDate`/`endDate` properties, and `index` of the tick.
   * @param {Object} [thisObj] `this` reference for the function
   * @typings {Promise<any|null>}
   */
  filterBy(fn, thisObj = this) {
    const me = this;
    me.filters.clear();
    super.filterBy((tick, index) => fn.call(thisObj, tick.data, index));
  }
  filter() {
    const me = this, retVal = super.filter(...arguments);
    if (!me.maintainFilter && me.count === 0) {
      me.resumeEvents();
      me.trigger("invalidFilter");
      me.disableFilters();
    }
    return retVal;
  }
  disableFilters() {
    this.filters.forEach((f) => f.disabled = true);
    this.filter();
  }
  triggerFilterEvent(event) {
    const me = this;
    if (!event.filters.count) {
      me.continuous = me.originalContinuous;
    } else {
      me.continuous = false;
    }
    me.updateTickCache();
    super.triggerFilterEvent(event);
  }
  /**
   * Returns `true` if the time axis is continuous (will return `false` when filtered)
   * @property {Boolean}
   */
  get isContinuous() {
    return this.continuous !== false && !this.isFiltered;
  }
  //endregion
  //region Dates
  getAdjustedDates(startDate, endDate, forceAdjust = false) {
    const me = this;
    if (endDate && startDate - endDate === 0) {
      endDate = null;
    }
    startDate = startDate || me.startDate;
    endDate = endDate || DateHelper.add(startDate, me.defaultSpan, me.mainUnit);
    return me.autoAdjust || forceAdjust ? {
      startDate: me.floorDate(startDate, false, me.autoAdjust ? me.mainUnit : me.unit, 1),
      endDate: me.ceilDate(endDate, false, me.autoAdjust ? me.mainUnit : me.unit, 1)
    } : {
      startDate,
      endDate
    };
  }
  /**
   * Method to get the current start date of the time axis.
   * @property {Date}
   */
  get startDate() {
    return this._start || (this.first ? new Date(this.first.startDate) : null);
  }
  set startDate(start) {
    this._start = DateHelper.parse(start);
  }
  /**
   * Method to get a the current end date of the time axis
   * @property {Date}
   */
  get endDate() {
    return this._end || (this.last ? new Date(this.last.endDate) : null);
  }
  set endDate(end) {
    if (end)
      this._end = DateHelper.parse(end);
  }
  // used in performance critical code for comparisons
  get startMS() {
    return this._startMS;
  }
  // used in performance critical code for comparisons
  get endMS() {
    return this._endMS;
  }
  // Floors a date and optionally snaps it to one of the following resolutions:
  // 1. 'resolutionUnit'. If param 'resolutionUnit' is passed, the date will simply be floored to this unit.
  // 2. If resolutionUnit is not passed: If date should be snapped relative to the timeaxis start date,
  // the resolutionUnit of the timeAxis will be used, or the timeAxis 'mainUnit' will be used to snap the date
  //
  // returns a copy of the original date
  // private
  floorDate(date, relativeToStart, resolutionUnit, incr) {
    relativeToStart = relativeToStart !== false;
    const me = this, relativeTo = relativeToStart ? DateHelper.clone(me.startDate) : null, increment = incr || me.resolutionIncrement, unit = resolutionUnit || (relativeToStart ? me.resolutionUnit : me.mainUnit), snap = (value, increment2) => Math.floor(value / increment2) * increment2;
    if (relativeToStart) {
      return DateHelper.floor(date, { unit, magnitude: increment }, relativeTo);
    }
    const dt = DateHelper.clone(date);
    if (unit === "week") {
      const day = dt.getDay() || 7, startDay = me.weekStartDay || 7;
      DateHelper.add(DateHelper.startOf(dt, "day", false), day >= startDay ? startDay - day : -(7 - startDay + day), "day", false);
      if (dt.getDay() !== startDay && dt.getHours() === 23) {
        DateHelper.add(dt, 1, "hour", false);
      }
    } else {
      DateHelper.startOf(dt, unit, false);
      const modifier = ["day", "year"].includes(unit) ? 1 : 0, useUnit = unit === "day" ? "date" : unit, snappedValue = snap(DateHelper.get(dt, useUnit) - modifier, increment) + modifier;
      DateHelper.set(dt, useUnit, snappedValue);
    }
    return dt;
  }
  /**
   * Rounds the date to nearest unit increment
   * @private
   */
  roundDate(date, relativeTo, resolutionUnit = this.resolutionUnit, increment = this.resolutionIncrement || 1) {
    const me = this, dt = DateHelper.clone(date);
    relativeTo = DateHelper.clone(relativeTo || me.startDate);
    switch (resolutionUnit) {
      case "week": {
        DateHelper.startOf(dt, "day", false);
        let distanceToWeekStartDay = dt.getDay() - me.weekStartDay, toAdd;
        if (distanceToWeekStartDay < 0) {
          distanceToWeekStartDay = 7 + distanceToWeekStartDay;
        }
        if (Math.round(distanceToWeekStartDay / 7) === 1) {
          toAdd = 7 - distanceToWeekStartDay;
        } else {
          toAdd = -distanceToWeekStartDay;
        }
        return DateHelper.add(dt, toAdd, "day", false);
      }
      case "month": {
        const nbrMonths = DateHelper.diff(relativeTo, dt, "month") + DateHelper.as("month", dt.getDay() / DateHelper.daysInMonth(dt)), snappedMonths = Math.round(nbrMonths / increment) * increment;
        return DateHelper.add(relativeTo, snappedMonths, "month", false);
      }
      case "quarter":
        DateHelper.startOf(dt, "month", false);
        return DateHelper.add(dt, 3 - dt.getMonth() % 3, "month", false);
      default: {
        const duration = DateHelper.as(resolutionUnit, DateHelper.diff(relativeTo, dt)), offset = resolutionUnit === "year" ? 0 : DateHelper.as(resolutionUnit, relativeTo.getTimezoneOffset() - dt.getTimezoneOffset(), "minute"), snappedDuration = Math.round((duration + offset) / increment) * increment;
        return DateHelper.add(relativeTo, snappedDuration - offset, resolutionUnit, false);
      }
    }
  }
  // private
  ceilDate(date, relativeToStart, resolutionUnit, increment) {
    const me = this;
    relativeToStart = relativeToStart !== false;
    increment = increment || (relativeToStart ? me.resolutionIncrement : 1);
    const unit = resolutionUnit || (relativeToStart ? me.resolutionUnit : me.mainUnit), dt = DateHelper.clone(date);
    let doCall = false;
    switch (unit) {
      case "minute":
        doCall = !DateHelper.isStartOf(dt, "minute");
        break;
      case "hour":
        doCall = !DateHelper.isStartOf(dt, "hour");
        break;
      case "day":
      case "date":
        doCall = !DateHelper.isStartOf(dt, "day");
        break;
      case "week":
        DateHelper.startOf(dt, "day", false);
        doCall = dt.getDay() !== me.weekStartDay || !DateHelper.isEqual(dt, date);
        break;
      case "month":
        DateHelper.startOf(dt, "day", false);
        doCall = dt.getDate() !== 1 || !DateHelper.isEqual(dt, date);
        break;
      case "quarter":
        DateHelper.startOf(dt, "day", false);
        doCall = dt.getMonth() % 3 !== 0 || dt.getDate() !== 1 || !DateHelper.isEqual(dt, date);
        break;
      case "year":
        DateHelper.startOf(dt, "day", false);
        doCall = dt.getMonth() !== 0 || dt.getDate() !== 1 || !DateHelper.isEqual(dt, date);
        break;
    }
    if (doCall) {
      return DateHelper.getNext(dt, unit, increment, me.weekStartDay);
    }
    return dt;
  }
  //endregion
  //region Ticks
  get include() {
    return this._include;
  }
  set include(include) {
    const me = this;
    me._include = include;
    me.continuous = !include;
    if (!me.isConfiguring) {
      me.startDate = me._configuredStartDate;
      me.endDate = me._configuredEndDate;
      me.internalOnReconfigure();
      me.trigger("includeChange");
    }
  }
  // Check if a certain date is included based on timeAxis.include rules
  processExclusion(startDate, endDate, unit) {
    const { include } = this;
    if (include) {
      return Object.entries(include).some(([includeUnit, rule]) => {
        if (!rule) {
          return false;
        }
        const { from, to } = rule;
        if (DateHelper.compareUnits("day", unit) >= 0 && DateHelper.getLargerUnit(includeUnit) === unit) {
          if (from) {
            DateHelper.set(startDate, includeUnit, from);
          }
          if (to) {
            let stepUnit = unit;
            if (unit === "day") {
              stepUnit = "date";
            }
            DateHelper.set(endDate, {
              [stepUnit]: DateHelper.get(endDate, stepUnit) - 1,
              [includeUnit]: to
            });
          }
        }
        if (DateHelper.compareUnits(includeUnit, unit) >= 0) {
          const datePart = includeUnit === "day" ? startDate.getDay() : DateHelper.get(startDate, includeUnit);
          if (from && datePart < from || to && datePart >= to) {
            return true;
          }
        }
      });
    }
    return false;
  }
  // Calculate constants used for exclusion when scaling within larger ticks
  initExclusion() {
    Object.entries(this.include).forEach(([unit, rule]) => {
      if (rule) {
        const { from, to } = rule;
        rule.lengthFactor = DateHelper.getUnitToBaseUnitRatio(unit, DateHelper.getLargerUnit(unit)) / (to - from);
        rule.lengthFactorExcl = DateHelper.getUnitToBaseUnitRatio(unit, DateHelper.getLargerUnit(unit)) / (to - from - 1);
        rule.center = from + from / (rule.lengthFactor - 1);
      }
    });
  }
  /**
   * Method generating the ticks for this time axis. Should return an array of ticks . Each tick is an object of the following structure:
   * ```
   * {
   *    startDate : ..., // start date
   *    endDate   : ...  // end date
   * }
   * ```
   * Take notice, that this function either has to be called with `start`/`end` parameters, or create those variables.
   *
   * To see it in action please check out our [TimeAxis](https://bryntum.com/products/scheduler/examples/timeaxis/) example and navigate to "Compressed non-working time" tab.
   *
   * @member {Function} generateTicks
   * @param {Date} axisStartDate The start date of the interval
   * @param {Date} axisEndDate The end date of the interval
   * @param {String} unit The unit of the time axis
   * @param {Number} increment The increment for the unit specified.
   * @returns {Array|undefined} ticks The ticks representing the time axis, or no return value to use the default tick generation
   */
  updateGenerateTicks() {
    if (!this.isConfiguring) {
      this.reconfigure(this);
    }
  }
  _generateTicks(axisStartDate, axisEndDate, unit = this.unit, increment = this.increment) {
    const me = this, ticks = [], usesExclusion = Boolean(me.include);
    let intervalEnd, tickEnd, isExcluded, dstDiff = 0, { startDate, endDate } = me.getAdjustedDates(axisStartDate, axisEndDate);
    me.tickCache = {};
    if (usesExclusion) {
      me.initExclusion();
    }
    while (startDate < endDate) {
      intervalEnd = DateHelper.getNext(startDate, unit, increment, me.weekStartDay);
      if (!me.autoAdjust && intervalEnd > endDate) {
        intervalEnd = endDate;
      }
      if (unit === "hour" && increment > 1 && ticks.length > 0 && dstDiff === 0) {
        const prev = ticks[ticks.length - 1];
        dstDiff = (prev.startDate.getHours() + increment) % 24 - prev.endDate.getHours();
        if (dstDiff !== 0) {
          intervalEnd = DateHelper.add(intervalEnd, dstDiff, "hour");
        }
      }
      isExcluded = false;
      if (usesExclusion) {
        tickEnd = new Date(intervalEnd.getTime());
        isExcluded = me.processExclusion(startDate, intervalEnd, unit);
      } else {
        tickEnd = intervalEnd;
      }
      if (!isExcluded) {
        ticks.push({
          id: ticks.length + 1,
          startDate,
          endDate: intervalEnd
        });
        me.tickCache[startDate.getTime()] = ticks.length - 1;
      }
      startDate = tickEnd;
    }
    return ticks;
  }
  /**
   * How many ticks are visible across the TimeAxis.
   *
   * Usually, this is an integer because {@link #config-autoAdjust} means that the start and end
   * dates are adjusted to be on tick boundaries.
   * @property {Number}
   * @internal
   */
  get visibleTickTimeSpan() {
    const me = this;
    return me.isContinuous ? me.visibleTickEnd - me.visibleTickStart : me.count;
  }
  /**
   * Gets a tick "coordinate" representing the date position on the time scale. Returns -1 if the date is not part of the time axis.
   * @param {Date} date the date
   * @returns {Number} the tick position on the scale or -1 if the date is not part of the time axis
   */
  getTickFromDate(date) {
    var _a, _b;
    const me = this, ticks = me.records, dateMS = (_b = (_a = date.getTime) == null ? void 0 : _a.call(date)) != null ? _b : date;
    let begin = 0, end = ticks.length - 1, middle, tick, tickStart, tickEnd;
    if (!ticks.length || dateMS < ticks[0].startDateMS || dateMS > ticks[end].endDateMS) {
      return -1;
    }
    if (me.isContinuous) {
      while (begin < end) {
        middle = begin + end + 1 >> 1;
        if (dateMS > ticks[middle].endDateMS) {
          begin = middle + 1;
        } else if (dateMS < ticks[middle].startDateMS) {
          end = middle - 1;
        } else {
          begin = middle;
        }
      }
      tick = ticks[begin];
      tickStart = tick.startDateMS;
      if (dateMS > tickStart) {
        tickEnd = tick.endDateMS;
        begin += (dateMS - tickStart) / (tickEnd - tickStart);
      }
      return Math.min(Math.max(begin, me.visibleTickStart), me.visibleTickEnd);
    } else {
      for (let i = 0; i <= end; i++) {
        tickEnd = ticks[i].endDateMS;
        if (dateMS <= tickEnd) {
          tickStart = ticks[i].startDateMS;
          tick = i + (dateMS > tickStart ? (dateMS - tickStart) / (tickEnd - tickStart) : 0);
          return tick;
        }
      }
    }
  }
  getSnappedTickFromDate(date) {
    const startTickIdx = Math.floor(this.getTickFromDate(date));
    return this.getAt(startTickIdx);
  }
  /**
   * Gets the time represented by a tick "coordinate".
   * @param {Number} tick the tick "coordinate"
   * @param {'floor'|'round'|'ceil'} [roundingMethod] Rounding method to use. 'floor' to take the tick (lowest header
   * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
   * @returns {Date} The date to represented by the tick "coordinate", or null if invalid.
   */
  getDateFromTick(tick, roundingMethod) {
    const me = this;
    if (tick === me.visibleTickEnd) {
      return me.endDate;
    }
    const wholeTick = Math.floor(tick), fraction = tick - wholeTick, t = me.getAt(wholeTick);
    if (!t) {
      return null;
    }
    const start = wholeTick === 0 && me.isContinuous ? me.adjustedStart : t.startDate, end = wholeTick === me.count - 1 && me.isContinuous ? me.adjustedEnd : t.endDate;
    let date = DateHelper.add(start, fraction * (end - start), "millisecond");
    if (roundingMethod) {
      date = me[roundingMethod + "Date"](date);
    }
    return date;
  }
  /**
   * Returns the ticks of the timeaxis in an array of objects with a "startDate" and "endDate".
   * @property {Scheduler.model.TimeSpan[]}
   */
  get ticks() {
    return this.records;
  }
  /**
   * Caches ticks and start/end dates for faster processing during rendering of events.
   * @private
   */
  updateTickCache(onlyStartEnd = false) {
    const me = this;
    if (me.count) {
      me._start = me.first.startDate;
      me._end = me.last.endDate;
      me._startMS = me.startDate.getTime();
      me._endMS = me.endDate.getTime();
    } else {
      me._start = me._end = me._startMs = me._endMS = null;
    }
    if (!onlyStartEnd) {
      me.tickCache = {};
      me.forEach((tick, i) => me.tickCache[tick.startDate.getTime()] = i);
    }
  }
  //endregion
  //region Axis
  /**
   * Returns true if the passed date is inside the span of the current time axis.
   * @param {Date} date The date to query for
   * @returns {Boolean} true if the date is part of the time axis
   */
  dateInAxis(date, inclusiveEnd = false) {
    const me = this, axisStart = me.startDate, axisEnd = me.endDate;
    if (me.isContinuous) {
      return inclusiveEnd ? DateHelper.betweenLesserEqual(date, axisStart, axisEnd) : DateHelper.betweenLesser(date, axisStart, axisEnd);
    } else {
      const length = me.getCount();
      let tickStart, tickEnd, tick;
      for (let i = 0; i < length; i++) {
        tick = me.getAt(i);
        tickStart = tick.startDate;
        tickEnd = tick.endDate;
        if (inclusiveEnd && date <= tickEnd || !inclusiveEnd && date < tickEnd) {
          return date >= tickStart;
        }
      }
    }
    return false;
  }
  /**
   * Returns true if the passed timespan is part of the current time axis (in whole or partially).
   * @param {Date} start The start date
   * @param {Date} end The end date
   * @returns {Boolean} true if the timespan is part of the timeaxis
   */
  timeSpanInAxis(start, end) {
    const me = this;
    if (!end || end.getTime() === start.getTime()) {
      return this.dateInAxis(start, true);
    }
    if (me.isContinuous) {
      return DateHelper.intersectSpans(start, end, me.startDate, me.endDate);
    }
    return start < me.startDate && end > me.endDate || me.getTickFromDate(start) !== me.getTickFromDate(end);
  }
  // Accepts a TimeSpan model (uses its cached MS values to be a bit faster during rendering)
  isTimeSpanInAxis(timeSpan) {
    var _a;
    const me = this, { startMS, endMS } = me, { startDateMS } = timeSpan, endDateMS = (_a = timeSpan.endDateMS) != null ? _a : timeSpan.meta.endDateCached;
    if (!startDateMS || !endDateMS) {
      return false;
    }
    if (endDateMS === startDateMS) {
      return me.dateInAxis(timeSpan.startDate, true);
    }
    if (me.isContinuous) {
      return endDateMS > startMS && startDateMS < endMS;
    }
    const startTick = me.getTickFromDate(timeSpan.startDate), endTick = me.getTickFromDate(timeSpan.endDate);
    if (startTick === me.count && DateHelper.isEqual(timeSpan.startDate, me.last.endDate) || endTick === 0 && DateHelper.isEqual(timeSpan.endDate, me.first.startDate)) {
      return false;
    }
    return (
      // Spanning entire axis
      startDateMS < startMS && endDateMS > endMS || // Unintentionally 0 wide (ticks excluded or outside)
      startTick !== endTick
    );
  }
  //endregion
  //region Iteration
  /**
   * Calls the supplied iterator function once per interval. The function will be called with four parameters, startDate endDate, index, isLastIteration.
   * @internal
   * @param {String} unit The unit to use when iterating over the timespan
   * @param {Number} increment The increment to use when iterating over the timespan
   * @param {Function} iteratorFn The function to call
   * @param {Object} [thisObj] `this` reference for the function
   */
  forEachAuxInterval(unit, increment = 1, iteratorFn, thisObj = this) {
    const end = this.endDate;
    let dt = this.startDate, i = 0, intervalEnd;
    if (dt > end)
      throw new Error("Invalid time axis configuration");
    while (dt < end) {
      intervalEnd = DateHelper.min(DateHelper.getNext(dt, unit, increment, this.weekStartDay), end);
      iteratorFn.call(thisObj, dt, intervalEnd, i, intervalEnd >= end);
      dt = intervalEnd;
      i++;
    }
  }
  //endregion
};
TimeAxis._$name = "TimeAxis";

// ../Scheduler/lib/Scheduler/view/model/TimeAxisViewModel.js
var TimeAxisViewModel = class extends Events_default() {
  //region Default config
  static get defaultConfig() {
    return {
      /**
       * The time axis providing the underlying data to be visualized
       * @config {Scheduler.data.TimeAxis}
       * @internal
       */
      timeAxis: null,
      /**
       * The available width/height, this is normally not known by the consuming UI component using this model
       * class until it has been fully rendered. The consumer of this model should set
       * {@link #property-availableSpace} when its width has changed.
       * @config {Number}
       * @internal
       */
      availableSpace: null,
      /**
       * The "tick width" for horizontal mode or "tick height" for vertical mode, to use for the cells in the
       * bottom most header row.
       * This value is normally read from the {@link Scheduler.preset.ViewPreset viewPreset}
       * @config {Number}
       * @default
       * @internal
       */
      tickSize: 100,
      /**
       * true if there is a requirement to be able to snap events to a certain view resolution.
       * This has implications of the {@link #config-tickSize} that can be used, since all widths must be in even pixels.
       * @config {Boolean}
       * @default
       * @internal
       */
      snap: false,
      /**
       * true if cells in the bottom-most row should be fitted to the {@link #property-availableSpace available space}.
       * @config {Boolean}
       * @default
       * @internal
       */
      forceFit: false,
      headers: null,
      mode: "horizontal",
      // or 'vertical'
      //used for Exporting. Make sure the tick columns are not recalculated when resizing.
      suppressFit: false,
      // cache of the config currently used.
      columnConfig: [],
      // the view preset name to apply initially
      viewPreset: null,
      // The default header level to draw column lines for
      columnLinesFor: null,
      originalTickSize: null,
      headersDatesCache: []
    };
  }
  //endregion
  //region Init & destroy
  construct(config) {
    const me = this;
    me.unitToPixelsCache = {};
    super.construct(config);
    const viewPreset = me.timeAxis.viewPreset || me.viewPreset;
    if (viewPreset) {
      if (viewPreset instanceof ViewPreset) {
        me.consumeViewPreset(viewPreset);
      } else {
        const preset = pm.getPreset(viewPreset);
        preset && me.consumeViewPreset(preset);
      }
    }
    me.timeAxis.ion({ reconfigure: "onTimeAxisReconfigure", thisObj: me });
    me.configured = true;
  }
  doDestroy() {
    this.timeAxis.un("reconfigure", this.onTimeAxisReconfigure, this);
    super.doDestroy();
  }
  /**
   * Returns an array representing the headers of the current timeAxis. Each element is an array representing the cells for that level in the header.
   * @returns {Object[]} An array of headers, each element being an array representing each cell (with start date and end date) in the timeline representation.
   * @internal
   */
  get columnConfig() {
    return this._columnConfig;
  }
  set columnConfig(config) {
    this._columnConfig = config;
  }
  get headers() {
    return this._headers;
  }
  set headers(headers) {
    if (headers && headers.length && headers[headers.length - 1].cellGenerator) {
      throw new Error("`cellGenerator` cannot be used for the bottom level of your headers. Use TimeAxis#generateTicks() instead.");
    }
    this._headers = headers;
  }
  get isTimeAxisViewModel() {
    return true;
  }
  //endregion
  //region Events
  /**
   * Fires after the model has been updated.
   * @event update
   * @param {Scheduler.view.model.TimeAxisViewModel} source The model instance
   */
  /**
   * Fires after the model has been reconfigured.
   * @event reconfigure
   * @param {Scheduler.view.model.TimeAxisViewModel} source The model instance
   */
  //endregion
  //region Mode
  /**
   * Using horizontal mode?
   * @returns {Boolean}
   * @readonly
   * @internal
   */
  get isHorizontal() {
    return this.mode !== "vertical";
  }
  /**
   * Using vertical mode?
   * @returns {Boolean}
   * @readonly
   * @internal
   */
  get isVertical() {
    return this.mode === "vertical";
  }
  /**
   * Gets/sets the forceFit value for the model. Setting it will cause it to update its contents and fire the
   * {@link #event-update} event.
   * @property {Boolean}
   * @internal
   */
  set forceFit(value) {
    if (value !== this._forceFit) {
      this._forceFit = value;
      this.update();
    }
  }
  //endregion
  //region Reconfigure & update
  reconfigure(config) {
    this.headers = null;
    this.setConfig(config);
    this.trigger("reconfigure");
  }
  onTimeAxisReconfigure({ source: timeAxis, suppressRefresh }) {
    if (this.viewPreset !== timeAxis.viewPreset) {
      this.consumeViewPreset(timeAxis.viewPreset);
    }
    if (!suppressRefresh && timeAxis.count > 0) {
      this.update();
    }
  }
  /**
   * Updates the view model current timeAxis configuration and available space.
   * @param {Number} [availableSpace] The available space for the rendering of the axis (used in forceFit mode)
   * @param {Boolean} [silent] Pass `true` to suppress the firing of the `update` event.
   * @param {Boolean} [forceUpdate] Pass `true` to fire the `update` event even if the size has not changed.
   * @internal
   */
  update(availableSpace, silent = false, forceUpdate = false) {
    const me = this, { timeAxis, headers } = me, spaceAvailable = availableSpace !== 0;
    if (me.isConfiguring || spaceAvailable && me._availableSpace === availableSpace) {
      if (forceUpdate) {
        me.trigger("update");
      }
      return;
    }
    me._availableSpace = Math.max(availableSpace || me.availableSpace || 0, 0);
    if (typeof me.availableSpace !== "number") {
      throw new Error("Invalid available space provided to TimeAxisModel");
    }
    me.columnConfig = [];
    const tickSize = me._tickSize = me.calculateTickSize(me.originalTickSize);
    if (typeof tickSize !== "number" || tickSize <= 0) {
      throw new Error("Invalid timeAxis tick size");
    }
    me.unitToPixelsCache = {};
    me._totalSize = null;
    for (let pos = 0, { length } = headers; pos < length; pos++) {
      const header = headers[pos];
      if (header.cellGenerator) {
        const headerCells = header.cellGenerator.call(me, timeAxis.startDate, timeAxis.endDate);
        me.columnConfig[pos] = me.createHeaderRow(pos, header, headerCells);
      } else {
        me.columnConfig[pos] = me.createHeaderRow(pos, header);
      }
    }
    if (!silent) {
      me.trigger("update");
    }
  }
  //endregion
  //region Date / position mapping
  /**
   * Returns the distance in pixels for a timespan with the given start and end date.
   * @param {Date} start start date
   * @param {Date} end end date
   * @returns {Number} The length of the time span
   * @category Date mapping
   */
  getDistanceBetweenDates(start, end) {
    return this.getPositionFromDate(end) - this.getPositionFromDate(start);
  }
  /**
   * Returns the distance in pixels for a time span
   * @param {Number} durationMS Time span duration in ms
   * @returns {Number} The length of the time span
   * @category Date mapping
   */
  getDistanceForDuration(durationMs) {
    return this.getSingleUnitInPixels("millisecond") * durationMs;
  }
  /**
   * Gets the position of a date on the projected time axis or -1 if the date is not in the timeAxis.
   * @param {Date} date the date to query for.
   * @returns {Number} the coordinate representing the date
   * @category Date mapping
   */
  getPositionFromDate(date, options = {}) {
    const tick = this.getScaledTick(date, options);
    if (tick === -1) {
      return -1;
    }
    return this.tickSize * (tick - this.timeAxis.visibleTickStart);
  }
  // Translates a tick along the time axis to facilitate scaling events when excluding certain days or hours
  getScaledTick(date, { respectExclusion, snapToNextIncluded, isEnd, min, max }) {
    const { timeAxis } = this, { include, unit } = timeAxis;
    let tick = timeAxis.getTickFromDate(date);
    if (tick !== -1 && respectExclusion && include) {
      let tickChanged = false;
      if (include.hour && DateHelper.compareUnits(unit, "hour") > 0 && unit !== "day") {
        const { from, to, lengthFactor, center } = include.hour, originalHours = date.getHours(), croppedHours = Math.min(Math.max(originalHours, from), to);
        if (!snapToNextIncluded && croppedHours !== originalHours) {
          return -1;
        }
        const fractionalHours = croppedHours + date.getMinutes() / 60, hoursFromCenter = center - fractionalHours, newHours = center - hoursFromCenter * lengthFactor;
        date = DateHelper.add(date, newHours - originalHours, "h");
        tickChanged = true;
      }
      if (include.day && DateHelper.compareUnits(unit, "day") > 0) {
        const { from, to, lengthFactor, center } = include.day;
        let checkDay = date.getDay();
        if (isEnd && date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
          if (--checkDay < 0) {
            checkDay = 6;
          }
        }
        let addDays = 0;
        if (checkDay < from || checkDay >= to) {
          if (snapToNextIncluded) {
            if (isEnd) {
              addDays = (to - checkDay - 8) % 7;
            } else {
              addDays = (from - checkDay + 7) % 7;
            }
            date = DateHelper.add(date, addDays, "d");
            date = DateHelper.startOf(date, "d", false);
            if (max && date.getTime() >= max || min && date.getTime() <= min) {
              return -1;
            }
          } else {
            return -1;
          }
        }
        const { weekStartDay } = timeAxis, fixedCenter = date.getDay() === 0 ? 0 : center, fractionalDay = date.getDay() + date.getHours() / 24, daysFromCenter = fixedCenter - fractionalDay, newDay = fixedCenter - daysFromCenter * lengthFactor;
        date = DateHelper.add(date, newDay - fractionalDay + weekStartDay, "d");
        tickChanged = true;
      }
      if (tickChanged) {
        date = DateHelper.constrain(date, timeAxis.startDate, timeAxis.endDate);
        tick = timeAxis.getTickFromDate(date);
      }
    }
    return tick;
  }
  /**
   * Gets the date for a position on the time axis
   * @param {Number} position The page X or Y coordinate
   * @param {'floor'|'round'|'ceil'} [roundingMethod] Rounding method to use. 'floor' to take the tick (lowest header
   * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
   * @param {Boolean} [allowOutOfRange=false] By default, this returns `null` if the position is outside
   * of the time axis. Pass `true` to attempt to calculate a date outside of the time axis.
   * @returns {Date} the Date corresponding to the xy coordinate
   * @category Date mapping
   */
  getDateFromPosition(position, roundingMethod, allowOutOfRange = false) {
    const me = this, { timeAxis } = me, tick = me.getScaledPosition(position) / me.tickSize + timeAxis.visibleTickStart;
    if (tick < 0 || tick > timeAxis.count) {
      if (allowOutOfRange) {
        let result;
        if (tick < 0) {
          result = DateHelper.add(timeAxis.startDate, tick, timeAxis.unit);
        } else {
          result = DateHelper.add(timeAxis.endDate, tick - timeAxis.count, timeAxis.unit);
        }
        if (roundingMethod) {
          result = timeAxis[roundingMethod + "Date"](result);
        }
        return result;
      }
      return null;
    }
    return timeAxis.getDateFromTick(tick, roundingMethod);
  }
  // Translates a position along the time axis to facilitate scaling events when excluding certain days or hours
  getScaledPosition(position) {
    const { include, unit, weekStartDay } = this.timeAxis;
    if (include) {
      const dayWidth = this.getSingleUnitInPixels("day");
      if (include.day && DateHelper.compareUnits(unit, "day") > 0) {
        const { from, lengthFactor } = include.day, positionInWeek = position % (dayWidth * 7), weekStartPosition = position - positionInWeek;
        position = positionInWeek / lengthFactor + (from - weekStartDay) * dayWidth + weekStartPosition;
      }
      if (include.hour && DateHelper.compareUnits(unit, "hour") > 0 && unit !== "day") {
        const { from, lengthFactorExcl } = include.hour, hourWidth = this.getSingleUnitInPixels("hour"), positionInDay = position % dayWidth, dayStartPosition = position - positionInDay;
        position = positionInDay / lengthFactorExcl + from * hourWidth + dayStartPosition;
      }
    }
    return position;
  }
  /**
   * Returns the amount of pixels for a single unit
   * @internal
   * @returns {Number} The unit in pixel
   */
  getSingleUnitInPixels(unit) {
    const me = this;
    return me.unitToPixelsCache[unit] || (me.unitToPixelsCache[unit] = DateHelper.getUnitToBaseUnitRatio(me.timeAxis.unit, unit, true) * me.tickSize / me.timeAxis.increment);
  }
  /**
   * Returns the pixel increment for the current view resolution.
   * @internal
   * @returns {Number} The increment
   */
  get snapPixelAmount() {
    if (this.snap) {
      const { resolution } = this.timeAxis;
      return (resolution.increment || 1) * this.getSingleUnitInPixels(resolution.unit);
    }
    return 1;
  }
  //endregion
  //region Sizes
  /**
   * Get/set the current time column size (the width or height of a cell in the bottom-most time axis header row,
   * depending on mode)
   * @internal
   * @property {Number}
   */
  get tickSize() {
    return this._tickSize;
  }
  set tickSize(size) {
    this.setTickSize(size, false);
  }
  setTickSize(size, suppressEvent) {
    this._tickSize = this.originalTickSize = size;
    this.update(void 0, suppressEvent);
  }
  get timeResolution() {
    return this.timeAxis.resolution;
  }
  // Calculates the time column width/height based on the value defined viewPreset "tickWidth/tickHeight". It also
  // checks for the forceFit view option and the snap, both of which impose constraints on the time column width
  // configuration.
  calculateTickSize(proposedSize) {
    const me = this, { forceFit, timeAxis, suppressFit } = me, timelineUnit = timeAxis.unit;
    let size = 0, ratio = 1;
    if (me.snap) {
      const resolution = timeAxis.resolution;
      ratio = DateHelper.getUnitToBaseUnitRatio(timelineUnit, resolution.unit) * resolution.increment;
    }
    if (!suppressFit) {
      const fittingSize = me.availableSpace / timeAxis.visibleTickTimeSpan;
      size = forceFit || proposedSize < fittingSize ? fittingSize : proposedSize;
      if (ratio > 0 && (!forceFit || ratio < 1)) {
        size = Math.max(1, ratio * size) / ratio;
      }
    } else {
      size = proposedSize;
    }
    return size;
  }
  /**
   * Returns the total width/height of the time axis representation, depending on mode.
   * @returns {Number} The width or height
   * @internal
   * @readonly
   */
  get totalSize() {
    return this._totalSize || (this._totalSize = Math.floor(this.tickSize * this.timeAxis.visibleTickTimeSpan));
  }
  /**
   * Get/set the available space for the time axis representation. If size changes it will cause it to update its
   * contents and fire the {@link #event-update} event.
   * @internal
   * @property {Number}
   */
  get availableSpace() {
    return this._availableSpace;
  }
  set availableSpace(space) {
    const me = this;
    me._availableSpace = Math.max(0, space);
    if (me._availableSpace > 0) {
      const newTickSize = me.calculateTickSize(me.originalTickSize);
      if (newTickSize > 0 && newTickSize !== me.tickSize) {
        me.update();
      }
    }
  }
  //endregion
  //region Fitting & snapping
  /**
   * Returns start dates for ticks at the specified level in format { date, isMajor }.
   * @param {Number} level Level in headers array, `0` meaning the topmost...
   * @param {Boolean} useLowestHeader Use lowest level
   * @param getEnd
   * @returns {Array}
   * @internal
   */
  getDates(level = this.columnLinesFor, useLowestHeader = false, getEnd = false) {
    const me = this, ticks = [], linesForLevel = useLowestHeader ? me.lowestHeader : level, majorLevel = me.majorHeaderLevel, levelUnit = me.headers && me.headers[level].unit, majorUnit = majorLevel != null && me.headers && me.headers[majorLevel].unit, validMajor = majorLevel != null && DateHelper.doesUnitsAlign(majorUnit, levelUnit), hasGenerator = !!(me.headers && me.headers[linesForLevel].cellGenerator);
    if (hasGenerator) {
      const cells = me.columnConfig[linesForLevel];
      for (let i = 1, l = cells.length; i < l; i++) {
        ticks.push({ date: cells[i].startDate });
      }
    } else {
      me.forEachInterval(linesForLevel, (start, end) => {
        ticks.push({
          date: getEnd ? end : start,
          // do not want to consider tick to be major tick, hence the check for majorHeaderLevel
          isMajor: majorLevel !== level && validMajor && me.isMajorTick(getEnd ? end : start)
        });
      });
    }
    return ticks;
  }
  get forceFit() {
    return this._forceFit;
  }
  /**
   * This function fits the time columns into the available space in the time axis column.
   * @param {Boolean} suppressEvent `true` to skip firing the 'update' event.
   * @internal
   */
  fitToAvailableSpace(suppressEvent) {
    const proposedSize = Math.floor(this.availableSpace / this.timeAxis.visibleTickTimeSpan);
    this.setTickSize(proposedSize, suppressEvent);
  }
  get snap() {
    return this._snap;
  }
  /**
   * Gets/sets the snap value for the model. Setting it will cause it to update its contents and fire the
   * {@link #event-update} event.
   * @property {Boolean}
   * @internal
   */
  set snap(value) {
    if (value !== this._snap) {
      this._snap = value;
      if (this.configured) {
        this.update();
      }
    }
  }
  //endregion
  //region Headers
  // private
  createHeaderRow(position, headerRowConfig, headerCells) {
    const me = this, cells = [], { align, headerCellCls = "" } = headerRowConfig, today = DateHelper.clearTime(/* @__PURE__ */ new Date()), { timeAxis } = me, tickLevel = me.headers.length - 1, createCellContext = (start, end, i, isLast, data) => {
      let value = DateHelper.format(start, headerRowConfig.dateFormat);
      const isInteriorTick = i > 0 && !isLast, cellData = {
        align,
        start,
        end,
        value: data ? data.header : value,
        headerCellCls,
        width: tickLevel === position && me.owner && (timeAxis.fullTicks || isInteriorTick) ? me.owner.tickSize : me.getDistanceBetweenDates(start, end),
        index: i
      };
      if (cellData.width === 0) {
        return;
      }
      cellData.coord = size - 1;
      size += cellData.width;
      me.headersDatesCache[position][start.getTime()] = 1;
      if (headerRowConfig.renderer) {
        value = headerRowConfig.renderer.call(headerRowConfig.thisObj || me, start, end, cellData, i);
        cellData.value = value == null ? "" : value;
      }
      if (headerRowConfig.unit === "day" && (!headerRowConfig.increment || headerRowConfig.increment === 1)) {
        cellData.headerCellCls += " b-sch-dayheadercell-" + start.getDay();
        if (DateHelper.clearTime(start, true) - today === 0) {
          cellData.headerCellCls += " b-sch-dayheadercell-today";
        }
      }
      cells.push(cellData);
    };
    let size = 0;
    me.headersDatesCache[position] = {};
    if (headerCells) {
      headerCells.forEach((cellData, i) => createCellContext(cellData.start, cellData.end, i, i === headerCells.length - 1, cellData));
    } else {
      me.forEachInterval(position, createCellContext);
    }
    return cells;
  }
  get mainHeader() {
    return "mainHeaderLevel" in this ? this.headers[this.mainHeaderLevel] : this.bottomHeader;
  }
  get bottomHeader() {
    return this.headers[this.headers.length - 1];
  }
  get lowestHeader() {
    return this.headers.length - 1;
  }
  /**
   * This method is meant to return the level of the header which 2nd lowest.
   * It is used for {@link #function-isMajorTick} method
   * @returns {String}
   * @private
   */
  get majorHeaderLevel() {
    const { headers } = this;
    if (headers) {
      return Math.max(headers.length - 2, 0);
    }
    return null;
  }
  //endregion
  //region Ticks
  /**
   * For vertical view (and column lines plugin) we sometimes want to know if current tick starts along with the
   * upper header level.
   * @param {Date} date
   * @returns {Boolean}
   * @private
   */
  isMajorTick(date) {
    const nextLevel = this.majorHeaderLevel;
    return nextLevel != null && this.headersDatesCache[nextLevel] && this.headersDatesCache[nextLevel][date.getTime()] || false;
  }
  /**
   * Calls the supplied iterator function once per interval. The function will be called with three parameters, start date and end date and an index.
   * Return false to break the iteration.
   * @param {Number} position The index of the header in the headers array.
   * @param {Function} iteratorFn The function to call, will be called with start date, end date and "tick index"
   * @param {Object} [thisObj] `this` reference for the function
   * @internal
   */
  forEachInterval(position, iteratorFn, thisObj = this) {
    const { headers, timeAxis } = this;
    if (headers) {
      if (position === headers.length - 1) {
        timeAxis.forEach(
          (r, index) => iteratorFn.call(thisObj, r.startDate, r.endDate, index, index === timeAxis.count - 1)
        );
      } else {
        const header = headers[position];
        timeAxis.forEachAuxInterval(header.unit, header.increment, iteratorFn, thisObj);
      }
    }
  }
  /**
   * Calls the supplied iterator function once per interval. The function will be called with three parameters, start date and end date and an index.
   * Return false to break the iteration.
   * @internal
   * @param {Function} iteratorFn The function to call
   * @param {Object} [thisObj] `this` reference for the function
   */
  forEachMainInterval(iteratorFn, thisObj) {
    this.forEachInterval(this.mainHeaderLevel, iteratorFn, thisObj);
  }
  //endregion
  //region ViewPreset
  consumeViewPreset(preset) {
    const me = this;
    me.headers = null;
    me.getConfig("tickSize");
    me.viewPreset = preset;
    Object.assign(me, {
      headers: preset.headers,
      columnLinesFor: preset.columnLinesFor,
      mainHeaderLevel: preset.mainHeaderLevel,
      _tickSize: me.isHorizontal ? preset.tickWidth : preset.tickHeight
    });
    me.originalTickSize = me.tickSize;
  }
  //endregion
};
TimeAxisViewModel._$name = "TimeAxisViewModel";

// ../Scheduler/lib/Scheduler/view/mixin/TimelineDateMapper.js
var tempDate = /* @__PURE__ */ new Date();
var TimelineDateMapper_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    //region Coordinate <-> Date
    getRtlX(x) {
      if (this.rtl && this.isHorizontal) {
        x = this.timeAxisViewModel.totalSize - x;
      }
      return x;
    }
    /**
     * Gets the date for an X or Y coordinate, either local to the view element or the page based on the 3rd argument.
     * If the coordinate is not in the currently rendered view, null will be returned unless the `allowOutOfRange`
     * parameter is passed a `true`.
     * @param {Number} coordinate The X or Y coordinate
     * @param {'floor'|'round'|'ceil'} [roundingMethod] Rounding method to use. 'floor' to take the tick (lowest header
     * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
     * @param {Boolean} [local] true if the coordinate is local to the scheduler view element
     * @param {Boolean} [allowOutOfRange] By default, this returns `null` if the position is outside
     * of the time axis. Pass `true` to attempt to calculate a date outside of the time axis.
     * @returns {Date} The Date corresponding to the X or Y coordinate
     * @category Dates
     */
    getDateFromCoordinate(coordinate, roundingMethod, local = true, allowOutOfRange = false, ignoreRTL = false) {
      if (!local) {
        coordinate = this.currentOrientation.translateToScheduleCoordinate(coordinate);
      }
      if (!ignoreRTL) {
        coordinate = this.getRtlX(coordinate);
      }
      return this.timeAxisViewModel.getDateFromPosition(coordinate, roundingMethod, allowOutOfRange);
    }
    getDateFromCoord(options) {
      return this.getDateFromCoordinate(options.coord, options.roundingMethod, options.local, options.allowOutOfRange, options.ignoreRTL);
    }
    /**
     * Gets the date for an XY coordinate regardless of the orientation of the time axis.
     * @param {Array} xy The page X and Y coordinates
     * @param {'floor'|'round'|'ceil'} [roundingMethod] Rounding method to use. 'floor' to take the tick (lowest header
     * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
     * @param {Boolean} [local] true if the coordinate is local to the scheduler element
     * @param {Boolean} [allowOutOfRange] By default, this returns `null` if the position is outside
     * of the time axis. Pass `true` to attempt to calculate a date outside of the time axis.
     * @returns {Date} the Date corresponding to the xy coordinate
     * @category Dates
     */
    getDateFromXY(xy, roundingMethod, local = true, allowOutOfRange = false) {
      return this.currentOrientation.getDateFromXY(xy, roundingMethod, local, allowOutOfRange);
    }
    /**
     * Gets the time for a DOM event such as 'mousemove' or 'click' regardless of the orientation of the time axis.
     * @param {Event} e the Event instance
     * @param {'floor'|'round'|'ceil'} [roundingMethod] Rounding method to use. 'floor' to take the tick (lowest header
     * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
     * @param {Boolean} [allowOutOfRange] By default, this returns `null` if the position is outside
     * of the time axis. Pass `true` to attempt to calculate a date outside of the time axis.
     * @returns {Date} The date corresponding to the EventObject's position along the orientation of the time axis.
     * @category Dates
     */
    getDateFromDomEvent(e, roundingMethod, allowOutOfRange = false) {
      return this.getDateFromXY([e.pageX, e.pageY], roundingMethod, false, allowOutOfRange);
    }
    /**
     * Gets the start and end dates for an element Region
     * @param {Core.helper.util.Rectangle} rect The rectangle to map to start and end dates
     * @param {'floor'|'round'|'ceil'} roundingMethod Rounding method to use. 'floor' to take the tick (lowest header
     * in a time axis) start date, 'round' to round the value to nearest increment or 'ceil' to take the tick end date
     * @param {Number} duration The duration in MS of the underlying event
     * @returns {Object} an object containing start/end properties
     */
    getStartEndDatesFromRectangle(rect, roundingMethod, duration, allowOutOfRange = false) {
      const me = this, { isHorizontal } = me, startPos = isHorizontal ? rect.x : rect.top, endPos = isHorizontal ? rect.right : rect.bottom;
      let start, end;
      if (startPos >= 0 && endPos < me.timeAxisViewModel.totalSize) {
        start = me.getDateFromCoordinate(startPos, roundingMethod, true);
        end = me.getDateFromCoordinate(endPos, roundingMethod, true);
      } else if (startPos < 0) {
        end = me.getDateFromCoordinate(endPos, roundingMethod, true, allowOutOfRange);
        start = end && DateHelper.add(end, -duration, "ms");
      } else {
        start = me.getDateFromCoordinate(startPos, roundingMethod, true, allowOutOfRange);
        end = start && DateHelper.add(start, duration, "ms");
      }
      return {
        start,
        end
      };
    }
    //endregion
    //region Date display
    /**
     * Method to get a displayed end date value, see {@link #function-getFormattedEndDate} for more info.
     * @private
     * @param {Date} endDate The date to format
     * @param {Date} startDate The start date
     * @returns {Date} The date value to display
     */
    getDisplayEndDate(endDate, startDate) {
      if (
        // If time is midnight,
        endDate.getHours() === 0 && endDate.getMinutes() === 0 && // and end date is greater then start date
        (!startDate || !(endDate.getYear() === startDate.getYear() && endDate.getMonth() === startDate.getMonth() && endDate.getDate() === startDate.getDate())) && // and UI display format doesn't contain hour info (in this case we'll just display the exact date)
        !DateHelper.formatContainsHourInfo(this.displayDateFormat)
      ) {
        endDate = DateHelper.add(endDate, -1, "day");
      }
      return endDate;
    }
    /**
     * Method to get a formatted end date for a scheduled event, the grid uses the "displayDateFormat" property defined in the current view preset.
     * End dates are formatted as 'inclusive', meaning when an end date falls on midnight and the date format doesn't involve any hour/minute information,
     * 1ms will be subtracted (e.g. 2010-01-08T00:00:00 will first be modified to 2010-01-07 before being formatted).
     * @private
     * @param {Date} endDate The date to format
     * @param {Date} startDate The start date
     * @returns {String} The formatted date
     */
    getFormattedEndDate(endDate, startDate) {
      return this.getFormattedDate(this.getDisplayEndDate(endDate, startDate));
    }
    //endregion
    //region Other date functions
    /**
     * Gets the x or y coordinate relative to the scheduler element, or page coordinate (based on the 'local' flag)
     * If the coordinate is not in the currently rendered view, -1 will be returned.
     * @param {Date|Number} date the date to query for (or a date as ms)
     * @param {Boolean|Object} options true to return a coordinate local to the scheduler view element (defaults to true),
     * also accepts a config object like { local : true }.
     * @returns {Number} the x or y position representing the date on the time axis
     * @category Dates
     */
    getCoordinateFromDate(date, options = true) {
      const me = this, { timeAxisViewModel } = me, {
        isContinuous,
        startMS,
        endMS,
        startDate,
        endDate,
        unit
      } = me.timeAxis, dateMS = date.valueOf();
      if (options === true) {
        options = {
          local: true
        };
      } else if (!options) {
        options = {
          local: false
        };
      } else if (!("local" in options)) {
        options.local = true;
      }
      let pos;
      if (!(date instanceof Date)) {
        tempDate.setTime(date);
        date = tempDate;
      }
      if (isContinuous && date.getTimezoneOffset() === startDate.getTimezoneOffset() && startDate.getTimezoneOffset() === endDate.getTimezoneOffset() && DateHelper.getUnitToBaseUnitRatio(unit, "day") !== -1) {
        if (dateMS < startMS || dateMS > endMS) {
          return -1;
        }
        pos = (dateMS - startMS) / (endMS - startMS) * timeAxisViewModel.totalSize;
      } else {
        pos = timeAxisViewModel.getPositionFromDate(date, options);
      }
      if (me.rtl && me.isHorizontal && !(options == null ? void 0 : options.ignoreRTL)) {
        pos = timeAxisViewModel.totalSize - pos;
      }
      if (!options.local) {
        pos = me.currentOrientation.translateToPageCoordinate(pos);
      }
      return pos;
    }
    /**
     * Returns the distance in pixels for the time span in the view.
     * @param {Date} startDate The start date of the span
     * @param {Date} endDate The end date of the span
     * @returns {Number} The distance in pixels
     * @category Dates
     */
    getTimeSpanDistance(startDate, endDate) {
      return this.timeAxisViewModel.getDistanceBetweenDates(startDate, endDate);
    }
    /**
     * Returns the center date of the currently visible timespan of scheduler.
     *
     * @property {Date}
     * @readonly
     * @category Dates
     */
    get viewportCenterDate() {
      const { timeAxis, timelineScroller } = this;
      if (timeAxis.isContinuous) {
        const timeAxisOffset = (timelineScroller.position + timelineScroller.clientSize / 2) / timelineScroller.scrollSize;
        return new Date(timeAxis.startMS + (timeAxis.endMS - timeAxis.startMS) * timeAxisOffset);
      }
      return this.getDateFromCoordinate(timelineScroller.position + timelineScroller.clientSize / 2);
    }
    get viewportCenterDateCached() {
      return this.cachedCenterDate || (this.cachedCenterDate = this.viewportCenterDate);
    }
    //endregion
    //region TimeAxis getters/setters
    /**
     * Gets/sets the current time resolution object, which contains a unit identifier and an increment count
     * `{ unit, increment }`. This value means minimal task duration you can create using UI.
     *
     * For example when you drag create a task or drag & drop a task, if increment is 5 and unit is 'minute'
     * that means that you can create tasks in 5 minute increments, or move it in 5 minute steps.
     *
     * This value is taken from viewPreset {@link Scheduler.preset.ViewPreset#field-timeResolution timeResolution}
     * config by default. When supplying a `Number` to the setter only the `increment` is changed and the `unit` value
     * remains untouched.
     *
     * ```javascript
     * timeResolution : {
     *   unit      : 'minute',  //Valid values are "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year".
     *   increment : 5
     * }
     * ```
     *
     * <div class="note">When the {@link Scheduler/view/mixin/TimelineEventRendering#config-fillTicks} option is
     * enabled, the resolution will be in full ticks regardless of configured value.</div>
     *
     * @property {Object|Number}
     * @category Dates
     */
    get timeResolution() {
      return this.timeAxis.resolution;
    }
    set timeResolution(resolution) {
      this.timeAxis.resolution = typeof resolution === "number" ? {
        increment: resolution,
        unit: this.timeAxis.resolution.unit
      } : resolution;
    }
    //endregion
    //region Snap
    get snap() {
      var _a2, _b;
      return (_b = (_a2 = this._timeAxisViewModel) == null ? void 0 : _a2.snap) != null ? _b : this._snap;
    }
    updateSnap(snap) {
      if (!this.isConfiguring) {
        this.timeAxisViewModel.snap = snap;
        this.timeAxis.forceFullTicks = snap && this.fillTicks;
      }
    }
    //endregion
    onSchedulerHorizontalScroll(subGrid, scrollLeft, scrollX, scrollingToCenter) {
      if (!scrollingToCenter) {
        this.cachedCenterDate = null;
      }
    }
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "TimelineDateMapper"), __publicField(_a, "configurable", {
    /**
     * Set to `true` to snap to the current time resolution increment while interacting with scheduled events.
     *
     * The time resolution increment is either determined by the currently applied view preset, or it can be
     * overridden using {@link #property-timeResolution}.
     *
     * <div class="note">When the {@link Scheduler/view/mixin/TimelineEventRendering#config-fillTicks} option is
     * enabled, snapping will align to full ticks, regardless of the time resolution.</div>
     *
     * @prp {Boolean}
     * @default
     * @category Scheduled events
     */
    snap: false
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineDomEvents.js
var { eventNameMap } = EventHelper;
var TimelineDomEvents_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    constructor() {
      super(...arguments);
      // Currently hovered events (can be parent + child)
      __publicField(this, "hoveredEvents", /* @__PURE__ */ new Set());
    }
    //endregion
    //region Init
    /**
     * Adds listeners for DOM events for the scheduler and its events.
     * Which events is specified in Scheduler#schedulerEvents.
     * @private
     */
    initDomEvents() {
      const me = this, { schedulerEvents } = me;
      schedulerEvents.element = me.timeAxisSubGridElement;
      schedulerEvents.thisObj = me;
      EventHelper.on(schedulerEvents);
      EventHelper.on({
        element: me.timeAxisSubGridElement,
        mouseleave: "handleScheduleLeaveEvent",
        capture: true,
        thisObj: me
      });
      if (me.updateTimelineContextOnScroll && BrowserHelper.supportsPointerEventConstructor) {
        EventHelper.on({
          element: document,
          scroll: "onScheduleScroll",
          capture: true,
          thisObj: me
        });
      }
    }
    //endregion
    //region Event handling
    getTimeSpanMouseEventParams(eventElement, event) {
      throw new Error("Implement in subclass");
    }
    getScheduleMouseEventParams(cellData, event) {
      throw new Error("Implement in subclass");
    }
    /**
     * Wraps dom Events for the scheduler and event bars and fires as our events.
     * For example click -> scheduleClick or eventClick
     * @private
     * @param event
     */
    handleScheduleEvent(event) {
      const me = this;
      if (me.ignoreDomEventsWhileScrolling && (me.scrolling || me.timeAxisSubGrid.scrolling)) {
        return;
      }
      const timelineContext = me.getTimelineEventContext(event);
      me.lastPointerEvent = event;
      if (timelineContext) {
        me.trigger(`${timelineContext.eventElement ? me.scheduledEventName : "schedule"}${eventNameMap[event.type] || StringHelper.capitalize(event.type)}`, timelineContext);
      }
      me.timelineContext = timelineContext;
    }
    handleScheduleLeaveEvent(event) {
      if (event.target === this.timeAxisSubGridElement) {
        this.handleScheduleEvent(event);
      }
    }
    /**
     * This handles the scheduler being scrolled below the mouse by trackpad or keyboard events.
     * The context, if present needs to be recalculated.
     * @private
     */
    onScheduleScroll({ target }) {
      var _a2, _b, _c, _d, _e;
      const me = this;
      if (target && me.updateTimelineContextOnScroll && !((_a2 = me.features.pan) == null ? void 0 : _a2.isActive) && !me.partners.some((p) => {
        var _a3;
        return (_a3 = p.features.pan) == null ? void 0 : _a3.isActive;
      }) && (target.contains(me.element) || me.bodyElement.contains(target))) {
        const { timelineContext, lastPointerEvent } = me;
        if (timelineContext) {
          const targetElement = DomHelper.elementFromPoint(timelineContext.domEvent.clientX, timelineContext.domEvent.clientY), pointerEvent = new BrowserHelper.PointerEventConstructor("pointermove", lastPointerEvent), mouseEvent = new MouseEvent("mousemove", lastPointerEvent);
          Object.defineProperty(pointerEvent, "pointerId", {
            value: (_e = (_d = (_b = GlobalEvents_default.currentPointerDown) == null ? void 0 : _b.pointerId) != null ? _d : (_c = GlobalEvents_default.currentTouch) == null ? void 0 : _c.identifier) != null ? _e : 1
          });
          pointerEvent.scrollInitiated = mouseEvent.scrollInitiated = true;
          targetElement == null ? void 0 : targetElement.dispatchEvent(pointerEvent);
          targetElement == null ? void 0 : targetElement.dispatchEvent(mouseEvent);
        }
      }
    }
    updateTimelineContext(context, oldContext) {
      this.trigger("timelineContextChange", { oldContext, context });
      if (context && !oldContext) {
        this.trigger("scheduleMouseEnter", context);
      } else if (!context) {
        this.trigger("scheduleMouseLeave", { event: oldContext.event });
      }
    }
    /**
     * Gathers contextual information about the schedule contextual position of the passed event.
     *
     * Used by schedule mouse event handlers, but also by the scheduleContext feature.
     * @param {Event} domEvent The DOM event to gather context for.
     * @returns {TimelineContext} the schedule DOM event context
     * @internal
     */
    getTimelineEventContext(domEvent) {
      const me = this, eventElement = domEvent.target.closest(me.eventInnerSelector), cellElement = me.getCellElementFromDomEvent(domEvent);
      if (cellElement) {
        const date = me.getDateFromDomEvent(domEvent, "floor");
        if (!date) {
          return;
        }
        const cellData = DomDataStore.get(cellElement), mouseParams = eventElement ? me.getTimeSpanMouseEventParams(eventElement, domEvent) : me.getScheduleMouseEventParams(cellData, domEvent);
        if (!mouseParams) {
          return;
        }
        const index = me.isVertical ? me.resourceStore.indexOf(mouseParams.resourceRecord) : cellData.row.dataIndex, tickIndex = me.timeAxis.getTickFromDate(date), tick = me.timeAxis.getAt(Math.floor(tickIndex));
        if (tick) {
          return {
            isTimelineContext: true,
            domEvent,
            eventElement,
            cellElement,
            index,
            tick,
            tickIndex,
            date,
            tickStartDate: tick.startDate,
            tickEndDate: tick.endDate,
            tickParentIndex: tick.parentIndex,
            row: cellData.row,
            event: domEvent,
            ...mouseParams
          };
        }
      }
    }
    getCellElementFromDomEvent({ target, clientY, type }) {
      var _a2;
      const me = this, {
        isVertical,
        foregroundCanvas
      } = me, eventElement = target.closest(me.eventSelector);
      if (eventElement) {
        const record = !isVertical && (me.resolveRowRecord(eventElement) || me.store.getAt(me.rowManager.getRowAt(clientY, false).dataIndex));
        return me.getCell({
          [isVertical ? "row" : "record"]: isVertical ? 0 : record,
          column: me.timeAxisColumn
        });
      } else if (foregroundCanvas.contains(target)) {
        if (target === foregroundCanvas || type === "mousemove") {
          return (_a2 = me.rowManager.getRowAt(clientY, false)) == null ? void 0 : _a2.getCell(me.timeAxisColumn.id);
        }
      } else {
        return target.matches(".b-grid-row") ? target.firstElementChild : target.closest(me.timeCellSelector);
      }
    }
    // Overridden by ResourceTimeRanges to "pass events through" to the schedule
    matchScheduleCell(element) {
      return element.closest(this.timeCellSelector);
    }
    onElementMouseButtonEvent(event) {
      const targetCell = event.target.closest(".b-sch-header-timeaxis-cell");
      if (targetCell) {
        const me = this, position = targetCell.parentElement.dataset.headerPosition, headerCells = me.timeAxisViewModel.columnConfig[position], index = me.timeAxis.isFiltered ? headerCells.findIndex((cell) => cell.index == targetCell.dataset.tickIndex) : targetCell.dataset.tickIndex, cellConfig = headerCells[index], contextMenu = me.features.contextMenu;
        if (!contextMenu || event.type !== contextMenu.triggerEvent) {
          this.trigger(`timeAxisHeader${StringHelper.capitalize(event.type)}`, {
            startDate: cellConfig.start,
            endDate: cellConfig.end,
            event
          });
        }
      }
    }
    onElementMouseDown(event) {
      this.onElementMouseButtonEvent(event);
      super.onElementMouseDown(event);
    }
    onElementClick(event) {
      this.onElementMouseButtonEvent(event);
      super.onElementClick(event);
    }
    onElementDblClick(event) {
      this.onElementMouseButtonEvent(event);
      super.onElementDblClick(event);
    }
    onElementContextMenu(event) {
      this.onElementMouseButtonEvent(event);
      super.onElementContextMenu(event);
    }
    /**
     * Relays mouseover events as eventmouseenter if over rendered event.
     * Also adds Scheduler#overScheduledEventClass to the hovered element.
     * @private
     */
    onElementMouseOver(event) {
      var _a2;
      const me = this;
      if (me.ignoreDomEventsWhileScrolling && (me.scrolling || me.timeAxisSubGrid.scrolling)) {
        return;
      }
      super.onElementMouseOver(event);
      const { target } = event, { hoveredEvents } = me;
      if ((target.closest(me.eventInnerSelector) || target.matches(".b-sch-terminal-hover-area")) && !((_a2 = me.features.eventDrag) == null ? void 0 : _a2.isDragging)) {
        const eventElement = target.closest(me.eventSelector);
        if (!hoveredEvents.has(eventElement) && !me.preventOverCls) {
          hoveredEvents.add(eventElement);
          eventElement.classList.add(me.overScheduledEventClass);
          const params = me.getTimeSpanMouseEventParams(eventElement, event);
          if (params) {
            me.trigger(`${me.scheduledEventName}MouseEnter`, params);
          }
        }
      } else if (hoveredEvents.size) {
        me.unhoverAll(event);
      }
    }
    /**
     * Relays mouseout events as eventmouseleave if out from rendered event.
     * Also removes Scheduler#overScheduledEventClass from the hovered element.
     * @private
     */
    onElementMouseOut(event) {
      var _a2;
      const me = this, { features } = me, { target, relatedTarget } = event;
      if (!(relatedTarget == null ? void 0 : relatedTarget.closest(".b-sch-canvas *"))) {
        super.onElementMouseOut(event);
      }
      const eventWrap = target.closest(me.eventSelector), eventInner = eventWrap == null ? void 0 : eventWrap.querySelector(me.eventInnerSelector), timeSpanRecord = eventWrap && me.resolveTimeSpanRecord(eventWrap);
      if (eventInner && timeSpanRecord && me.hoveredEvents.has(eventWrap) && !((_a2 = features.eventDrag) == null ? void 0 : _a2.isDragging)) {
        if (relatedTarget && (DomHelper.isDescendant(eventInner, relatedTarget) || relatedTarget.matches(".b-sch-terminal-hover-area"))) {
          return;
        }
      }
      if (eventWrap) {
        me.unhover(eventWrap, event);
      }
    }
    unhover(element, event) {
      const me = this;
      element.classList.remove(me.overScheduledEventClass);
      me.trigger(`${me.scheduledEventName}MouseLeave`, me.getTimeSpanMouseEventParams(element, event));
      me.hoveredEvents.delete(element);
    }
    unhoverAll(event) {
      for (const element of this.hoveredEvents) {
        !element.isReleased && !element.classList.contains("b-released") && this.unhover(element, event);
      }
      this.hoveredEvents.clear();
    }
    //endregion
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, /**
   * Fires after a click on a time axis cell
   * @event timeAxisHeaderClick
   * @param {Scheduler.column.TimeAxisColumn|Scheduler.column.VerticalTimeAxisColumn} source The column object
   * @param {Date} startDate The start date of the header cell
   * @param {Date} endDate The end date of the header cell
   * @param {Event} event The event object
   */
  /**
   * Fires after a double click on a time axis cell
   * @event timeAxisHeaderDblClick
   * @param {Scheduler.column.TimeAxisColumn|Scheduler.column.VerticalTimeAxisColumn} source The column object
   * @param {Date} startDate The start date of the header cell
   * @param {Date} endDate The end date of the header cell
   * @param {Event} event The event object
   */
  /**
   * Fires after a right click on a time axis cell
   * @event timeAxisHeaderContextMenu
   * @param {Scheduler.column.TimeAxisColumn|Scheduler.column.VerticalTimeAxisColumn} source The column object
   * @param {Date} startDate The start date of the header cell
   * @param {Date} endDate The end date of the header cell
   * @param {Event} event The event object
   */
  __publicField(_a, "$name", "TimelineDomEvents"), //region Default config
  __publicField(_a, "configurable", {
    /**
     * The currently hovered timeline context. This is updated as the mouse or pointer moves over the timeline.
     * @member {TimelineContext} timelineContext
     * @readonly
     * @category Dates
     */
    timelineContext: {
      $config: {
        // Reject non-changes so that when set from scheduleMouseMove and EventMouseMove,
        // we only update the context and fire events when it changes.
        equal(c1, c2) {
          return (c1 == null ? void 0 : c1.index) === (c2 == null ? void 0 : c2.index) && (c1 == null ? void 0 : c1.tickParentIndex) === (c2 == null ? void 0 : c2.tickParentIndex) && !(((c1 == null ? void 0 : c1.tickStartDate) || 0) - ((c2 == null ? void 0 : c2.tickStartDate) || 0));
        }
      }
    },
    updateTimelineContextOnScroll: false,
    /**
     * Set to `true` to ignore reacting to DOM events (mouseover/mouseout etc) while scrolling. Useful if you
     * want to maximize scroll performance.
     * @config {Boolean}
     * @default false
     */
    ignoreDomEventsWhileScrolling: null
  }), __publicField(_a, "properties", {
    schedulerEvents: {
      pointermove: "handleScheduleEvent",
      mouseover: "handleScheduleEvent",
      mousedown: "handleScheduleEvent",
      mouseup: "handleScheduleEvent",
      click: "handleScheduleEvent",
      dblclick: "handleScheduleEvent",
      contextmenu: "handleScheduleEvent",
      mousemove: "handleScheduleEvent",
      mouseout: "handleScheduleEvent"
    }
  }), __publicField(_a, "delayable", {
    // Allow the scroll event to complete in its thread, and dispatch the mousemove event next AF
    onScheduleScroll: "raf"
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineViewPresets.js
var TimelineViewPresets_default = (Target) => class TimelineViewPresets extends (Target || Base) {
  static get $name() {
    return "TimelineViewPresets";
  }
  //region Default config
  static get configurable() {
    return {
      /**
       * A string key used to lookup a predefined {@link Scheduler.preset.ViewPreset} (e.g. 'weekAndDay', 'hourAndDay'),
       * managed by {@link Scheduler.preset.PresetManager}. See {@link Scheduler.preset.PresetManager} for more information.
       * Or a config object for a viewPreset.
       *
       * Options:
       * - 'secondAndMinute'
       * - 'minuteAndHour'
       * - 'hourAndDay'
       * - 'dayAndWeek'
       * - 'dayAndMonth'
       * - 'weekAndDay'
       * - 'weekAndMonth',
       * - 'monthAndYear'
       * - 'year'
       * - 'manyYears'
       * - 'weekAndDayLetter'
       * - 'weekDateAndMonth'
       * - 'day'
       * - 'week'
       *
       * If passed as a config object, the settings from the viewPreset with the provided `base` property will be used along
       * with any overridden values in your object.
       *
       * To override:
       * ```javascript
       * viewPreset : {
       *   base    : 'hourAndDay',
       *   id      : 'myHourAndDayPreset',
       *   headers : [
       *       {
       *           unit      : "hour",
       *           increment : 12,
       *           renderer  : (startDate, endDate, headerConfig, cellIdx) => {
       *               return "";
       *           }
       *       }
       *   ]
       * }
       * ```
       * or set a new valid preset config if the preset is not registered in the {@link Scheduler.preset.PresetManager}.
       *
       * When you use scheduler in weekview mode, this config is used to pick view preset. If passed view preset is not
       * supported by weekview (only 2 supported by default - 'day' and 'week') default preset will be used - 'week'.
       * @config {String|ViewPresetConfig}
       * @default
       * @category Common
       */
      viewPreset: "weekAndDayLetter",
      /**
       * Get the {@link Scheduler.preset.PresetStore} created for the Scheduler,
       * or set an array of {@link Scheduler.preset.ViewPreset} config objects.
       * @member {Scheduler.preset.PresetStore|ViewPresetConfig[]} presets
       * @category Common
       */
      /**
       * An array of {@link Scheduler.preset.ViewPreset} config objects
       * which describes the available timeline layouts for this scheduler.
       *
       * By default, a predefined set is loaded from the {@link Scheduler.preset.PresetManager}.
       *
       * A {@link Scheduler.preset.ViewPreset} describes the granularity of the
       * timeline view and the layout and subdivisions of the timeline header.
       * @config {ViewPresetConfig[]} presets
       *
       * @category Common
       */
      presets: true,
      /**
       * Defines how dates will be formatted in tooltips etc. This config has priority over similar config on the
       * view preset. For allowed values see {@link Core.helper.DateHelper#function-format-static}.
       *
       * By default, this is ingested from {@link Scheduler.preset.ViewPreset} upon change of
       * {@link Scheduler.preset.ViewPreset} (Such as when zooming in or out). But Setting this
       * to your own value, overrides that behaviour.
       * @prp {String}
       * @category Scheduled events
       */
      displayDateFormat: null
    };
  }
  //endregion
  /**
   * Get/set the current view preset
   * @member {Scheduler.preset.ViewPreset|ViewPresetConfig|String} viewPreset
   * @param [viewPreset.options]
   * @param {Date} [viewPreset.options.startDate] A new start date for the time axis
   * @param {Date} [viewPreset.options.endDate] A new end date for the time axis
   * @param {Date} [viewPreset.options.centerDate] Where to center the new time axis
   * @param {Number} [viewPreset.options.scrollPosition] The scroll position to scroll
   * the new time axis to. This takes precedence over any date-scrolling.
   * It is used when partnering two timelines which must be scroll-synced.
   * @category Common
  */
  //region Get/set
  changePresets(presets) {
    const config = {
      owner: this
    };
    let data = [];
    if (presets === true) {
      data = pm.allRecords;
    } else if (Array.isArray(presets)) {
      for (const preset of presets) {
        if (typeof preset === "string") {
          const presetRecord = pm.getById(preset);
          if (presetRecord) {
            data.push(presetRecord);
          }
        } else {
          data.push(preset);
        }
      }
    } else {
      ObjectHelper.assign(config, presets);
    }
    const presetStore = new PresetStore(config);
    presetStore.add(data);
    return presetStore;
  }
  changeViewPreset(viewPreset, oldViewPreset) {
    const me = this, { presets } = me;
    if (viewPreset) {
      viewPreset = presets.createRecord(viewPreset);
      if (!presets.includes(viewPreset)) {
        presets.add(viewPreset);
      }
    } else {
      viewPreset = presets.first;
    }
    const lastOpts = me.lastViewPresetOptions || {}, options = viewPreset.options || (viewPreset.options = {}), event = {
      ...options,
      from: oldViewPreset,
      to: viewPreset,
      preset: viewPreset
    }, presetChanged = !me._viewPreset || !me._viewPreset.equals(viewPreset);
    delete lastOpts.event;
    if (presetChanged || !ObjectHelper.isEqual(options, lastOpts)) {
      options.event = event;
      if (!presetChanged) {
        me._viewPreset = null;
      }
      if (me.isConfiguring || me.trigger("beforePresetChange", event) !== false) {
        return viewPreset;
      }
    }
  }
  get displayDateFormat() {
    return this._displayDateFormat || this.viewPreset.displayDateFormat;
  }
  updateDisplayDateFormat(format) {
    this.trigger("displayDateFormatChange", { format });
  }
  /**
   * Method to get a formatted display date
   * @private
   * @param {Date} date The date
   * @returns {String} The formatted date
   */
  getFormattedDate(date) {
    return DateHelper.format(date, this.displayDateFormat);
  }
  updateViewPreset(preset) {
    var _a;
    const me = this, { options } = preset, {
      event,
      startDate,
      endDate
    } = options, {
      isHorizontal,
      _timeAxis: timeAxis,
      // Do not tickle the getter, we are just peeking to see if it's there yet.
      _timeAxisViewModel: timeAxisViewModel
      // Ditto
    } = me, rtl = isHorizontal && me.rtl;
    let {
      centerDate,
      zoomDate,
      zoomPosition
    } = options, forceUpdate = false;
    (_a = me.syncSplits) == null ? void 0 : _a.call(me, (split) => split.viewPreset = preset);
    delete preset.options;
    me._viewPresetChanging = true;
    if (timeAxis && !me.isConfiguring) {
      const { timelineScroller } = me;
      me.lastViewPresetOptions = options;
      if (timeAxis.isConfigured) {
        me.suspendRefresh();
        const timeAxisCfg = ObjectHelper.copyProperties({}, me, [
          "weekStartDay",
          "startTime",
          "endTime"
        ]);
        if (me.infiniteScroll) {
          Object.assign(timeAxisCfg, me.calculateInfiniteScrollingDateRange(
            centerDate || (startDate && endDate ? new Date((startDate.getTime() + endDate.getTime()) / 2) : me.viewportCenterDateCached),
            true,
            preset
          ));
        } else if (startDate) {
          timeAxisCfg.startDate = startDate;
          timeAxisCfg.endDate = endDate;
          if (!centerDate && endDate) {
            centerDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
          }
        } else {
          timeAxisCfg.startDate = timeAxis.startDate;
          timeAxisCfg.endDate = endDate || timeAxis.endDate;
          if (!centerDate) {
            centerDate = me.viewportCenterDate;
          }
        }
        timeAxis.isConfigured = false;
        timeAxisCfg.viewPreset = preset;
        timeAxis.reconfigure(timeAxisCfg, true);
        timeAxisViewModel.reconfigure({
          viewPreset: preset,
          headers: preset.headers,
          // This was hardcoded to 'middle' prior to the Preset refactor.
          // In the old code, the default headers were 'top' and 'middle', which
          // meant that 'middle' meant the lowest header.
          // So this is now length - 1.
          columnLinesFor: preset.columnLinesFor != null ? preset.columnLinesFor : preset.headers.length - 1,
          tickSize: options.tickSize || (isHorizontal ? preset.tickWidth : preset.tickHeight || preset.tickWidth || 60)
        });
        if (options.tickSize) {
          me.tickSize = options.tickSize;
        }
        me.resumeRefresh(false);
      }
      me.refresh();
      if (!options.notScroll && me.isPainted) {
        if ("scrollPosition" in options) {
          forceUpdate = timelineScroller.position === options.scrollPosition;
          timelineScroller.scrollTo(options.scrollPosition);
        } else if (options.visibleDate) {
          me.visibleDate = options.visibleDate;
        } else if (zoomDate && zoomPosition) {
          const unitMagnitude = unitMagnitudes[timeAxis.resolutionUnit], unit = unitMagnitude > 3 ? "hour" : "minute", milliseconds = DateHelper.asMilliseconds(unit === "minute" ? 15 : 1, unit), targetDate = new Date(Math.round(zoomDate / milliseconds) * milliseconds);
          event.zoomDate = zoomDate;
          event.zoomPosition = zoomPosition;
          event.zoomLevel = options.zoomLevel;
          if (rtl) {
            timelineScroller.position = timelineScroller.scrollWidth - (me.getCoordinateFromDate(targetDate) + zoomPosition);
          } else {
            timelineScroller.position = me.getCoordinateFromDate(targetDate) - zoomPosition;
          }
        } else if (centerDate) {
          me.cachedCenterDate = centerDate;
          event.centerDate = centerDate;
          const viewportSize = me.timelineScroller.clientSize, centerCoord = rtl ? me.timeAxisViewModel.totalSize - me.getCoordinateFromDate(centerDate, true) : me.getCoordinateFromDate(centerDate, true), coord = Math.max(centerCoord - viewportSize / 2, 0);
          if (coord === (me.isHorizontal ? me.scrollLeft : me.scrollTop)) {
            forceUpdate = true;
          } else if (me.isHorizontal) {
            me.scrollHorizontallyTo(coord, { scrollingToCenter: true });
          } else {
            me.scrollVerticallyTo(coord, { scrollingToCenter: true });
          }
        } else {
          if ((me.isHorizontal ? me.scrollLeft : me.scrollTop) === 0) {
            forceUpdate = true;
          } else {
            me.timelineScroller.scrollTo(0);
          }
        }
      }
    }
    me.dataset.presetId = preset.id;
    me.trigger("presetChange", event);
    me._viewPresetChanging = false;
    if (forceUpdate) {
      if (me.isHorizontal) {
        me.currentOrientation.updateFromHorizontalScroll(me.scrollLeft, true);
      } else {
        me.currentOrientation.updateFromVerticalScroll(me.scrollTop);
      }
    }
  }
  //endregion
  doDestroy() {
    if (this._presets.owner === this) {
      this._presets.destroy();
    }
    super.doDestroy();
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    if (result.viewPreset && result.viewPreset.name && !result.viewPreset.base) {
      delete result.viewPreset.name;
    }
    return result;
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineZoomable.js
var TimelineZoomable_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    constructor() {
      super(...arguments);
      // We cache the last mousewheel position, so that during zooming we can
      // maintain a stable zoom point even if the mouse moves a little.
      __publicField(this, "lastWheelTime", -1);
      __publicField(this, "lastZoomPosition", -1);
    }
    construct(config) {
      const me = this;
      super.construct(config);
      if (me.zoomOnMouseWheel) {
        EventHelper.on({
          element: me.timeAxisSubGridElement,
          wheel: "onWheel",
          // Throttle zooming with the wheel a bit to have greater control of it
          throttled: {
            buffer: 100,
            // Prevent events from slipping through the throttle, causing scroll
            alt: (e) => e.ctrlKey && e.preventDefault()
          },
          thisObj: me,
          capture: true,
          passive: false
        });
      }
      if (me.zoomOnTimeAxisDoubleClick) {
        me.ion({
          timeaxisheaderdblclick: ({ startDate, endDate }) => {
            if (!me.forceFit) {
              me.zoomToSpan({
                startDate,
                endDate
              });
            }
          }
        });
      }
    }
    get maxZoomLevel() {
      return this._maxZoomLevel || this.presets.count - 1;
    }
    /**
     * Get/set the {@link #config-maxZoomLevel} value
     * @property {Number}
     * @category Zoom
     */
    set maxZoomLevel(level) {
      if (typeof level !== "number") {
        level = this.presets.count - 1;
      }
      if (level < 0 || level >= this.presets.count) {
        throw new Error("Invalid range for `maxZoomLevel`");
      }
      this._maxZoomLevel = level;
    }
    get minZoomLevel() {
      return this._minZoomLevel;
    }
    /**
     * Sets the {@link #config-minZoomLevel} value
     * @property {Number}
     * @category Zoom
     */
    set minZoomLevel(level) {
      if (typeof level !== "number") {
        level = 0;
      }
      if (level < 0 || level >= this.presets.count) {
        throw new Error("Invalid range for `minZoomLevel`");
      }
      this._minZoomLevel = level;
    }
    /**
     * Current zoom level, which is equal to the {@link Scheduler.preset.ViewPreset ViewPreset} index
     * in the provided array of {@link Scheduler.view.mixin.TimelineViewPresets#config-presets zoom levels}.
     * @property {Number}
     * @category Zoom
     */
    get zoomLevel() {
      return this.presets.indexOf(this.viewPreset);
    }
    // noinspection JSAnnotator
    set zoomLevel(level) {
      this.zoomToLevel(level);
    }
    /**
     * Returns number of milliseconds per pixel.
     * @param {Object} level Element from array of {@link Scheduler.view.mixin.TimelineViewPresets#config-presets}.
     * @param {Boolean} ignoreActualWidth If true, then density will be calculated using default zoom level settings.
     * Otherwise, density will be calculated for actual tick width.
     * @returns {Number} Return number of milliseconds per pixel.
     * @private
     */
    getMilliSecondsPerPixelForZoomLevel(preset, ignoreActualWidth) {
      const { bottomHeader } = preset, width = this.isHorizontal ? preset.tickWidth : preset.tickHeight;
      return Math.round(
        (DateHelper.add(new Date(1, 0, 1), bottomHeader.increment || 1, bottomHeader.unit) - new Date(1, 0, 1)) / // `actualWidth` is a column width after view adjustments applied to it (see `calculateTickWidth`)
        // we use it if available to return the precise index value from `getCurrentZoomLevelIndex`
        (ignoreActualWidth ? width : preset.actualWidth || width)
      );
    }
    /**
     * Zooms to passed view preset, saving center date. Method accepts config object as a first argument, which can be
     * reduced to primitive type (string,number) when no additional options required. e.g.:
     * ```javascript
     * // zooming to preset
     * scheduler.zoomTo({ preset : 'hourAndDay' })
     * // shorthand
     * scheduler.zoomTo('hourAndDay')
     *
     * // zooming to level
     * scheduler.zoomTo({ level : 0 })
     * // shorthand
     * scheduler.zoomTo(0)
     * ```
     *
     * It is also possible to zoom to a time span by omitting `preset` and `level` configs, in which case scheduler sets
     * the time frame to a specified range and applies zoom level which allows to fit all columns to this range. The
     * given time span will be centered in the scheduling view (unless `centerDate` config provided). In the same time,
     * the start/end date of the whole time axis will be extended to allow scrolling for user.
     * ```javascript
     * // zooming to time span
     * scheduler.zoomTo({
     *     startDate : new Date(..),
     *     endDate : new Date(...)
     * });
     * ```
     *
     * @param {ViewPresetConfig|Object|String|Number} config Config object, preset name or zoom level index.
     * @param {String} [config.preset] Preset name to zoom to. Ignores level config in this case
     * @param {Number} [config.level] Zoom level to zoom to. Is ignored, if preset config is provided
     * @param {VisibleDate} [config.visibleDate] A `visibleDate` specification to bring into view after the zoom.
     * @param {Date} [config.startDate] New time frame start. If provided along with end, view will be centered in this
     * time interval (unless `centerDate` is present)
     * @param {Date} [config.endDate] New time frame end
     * @param {Date} [config.centerDate] Date that should be kept in the center. Has priority over start and end params
     * @param {Date} [config.zoomDate] The date that should be positioned at the passed `datePosition` client offset.
     * @param {Number} [config.zoomPosition] The client offset at which the passed `date` should be positioned.
     * @param {Number} [config.width] Lowest tick width. Might be increased automatically
     * @param {Number} [config.leftMargin] Amount of pixels to extend span start on (used, when zooming to span)
     * @param {Number} [config.rightMargin] Amount of pixels to extend span end on (used, when zooming to span)
     * @param {Number} [config.adjustStart] Amount of units to extend span start on (used, when zooming to span)
     * @param {Number} [config.adjustEnd] Amount of units to extend span end on (used, when zooming to span)
     * @category Zoom
     */
    zoomTo(config) {
      const me = this;
      if (typeof config === "object") {
        if (config.preset) {
          me.zoomToLevel(config.preset, config);
        } else if (config.level != null) {
          me.zoomToLevel(config.level, config);
        } else {
          me.zoomToSpan(config);
        }
      } else {
        me.zoomToLevel(config);
      }
    }
    /**
     * Allows zooming to certain level of {@link Scheduler.view.mixin.TimelineViewPresets#config-presets} array.
     * Automatically limits zooming between {@link #config-maxZoomLevel} and {@link #config-minZoomLevel}. Can also set
     * time axis timespan to the supplied start and end dates.
     *
     * @param {Number} preset Level to zoom to.
     * @param {ChangePresetOptions} [options] Object containing options which affect how the new preset is applied.
     * @returns {Number|null} level Current zoom level or null if it hasn't changed.
     * @category Zoom
     */
    zoomToLevel(preset, options = {}) {
      if (this.forceFit) {
        console.warn("Warning: The forceFit setting and zooming cannot be combined");
        return;
      }
      if (typeof preset === "number") {
        preset = Math.min(Math.max(preset, this.minZoomLevel), this.maxZoomLevel);
      }
      const me = this, { presets } = me, tickSizeProp = me.isVertical ? "tickHeight" : "tickWidth", newPreset = presets.createRecord(preset), configuredTickSize = newPreset[tickSizeProp], startDate = options.startDate ? new Date(options.startDate) : null, endDate = options.endDate ? new Date(options.endDate) : null;
      presets.add(newPreset);
      let span = startDate && endDate ? { startDate, endDate } : null;
      const centerDate = options.centerDate ? new Date(options.centerDate) : span ? new Date((startDate.getTime() + endDate.getTime()) / 2) : me.viewportCenterDateCached;
      let scrollableViewportSize = me.isVertical ? me.scrollable.clientHeight : me.timeAxisSubGrid.width;
      if (scrollableViewportSize === 0) {
        const { _beforeCollapseState } = me.timeAxisSubGrid;
        if (me.isHorizontal && me.timeAxisSubGrid.collapsed && (_beforeCollapseState == null ? void 0 : _beforeCollapseState.width)) {
          scrollableViewportSize = _beforeCollapseState.width;
        } else {
          return null;
        }
      }
      if (!span) {
        span = me.calculateOptimalDateRange(centerDate, scrollableViewportSize, newPreset);
      }
      if ("width" in options) {
        newPreset.setData(tickSizeProp, options.width);
      }
      me.isZooming = true;
      newPreset.options = {
        ...options,
        startDate: span.startDate || me.startDate,
        endDate: span.endDate || me.endDate,
        centerDate
      };
      me.viewPreset = newPreset;
      newPreset.actualWidth = me.timeAxisViewModel.tickSize;
      me.isZooming = false;
      newPreset.setData(tickSizeProp, configuredTickSize);
      return me.zoomLevel;
    }
    /**
     * Changes the range of the scheduling chart to fit all the events in its event store.
     * @param {Object} [options] Options object for the zooming operation.
     * @param {Number} [options.leftMargin] Defines margin in pixel between the first event start date and first visible
     * date
     * @param {Number} [options.rightMargin] Defines margin in pixel between the last event end date and last visible
     * date
     */
    zoomToFit(options) {
      const eventStore = this.eventStore, span = eventStore.getTotalTimeSpan();
      options = {
        leftMargin: 0,
        rightMargin: 0,
        ...options,
        ...span
      };
      if (options.startDate && options.endDate) {
        if (options.endDate > options.startDate) {
          this.zoomToSpan(options);
        } else {
          this.scrollToDate(options.startDate);
        }
      }
    }
    /**
     * Sets time frame to specified range and applies zoom level which allows to fit all columns to this range.
     *
     * The given time span will be centered in the scheduling view, in the same time, the start/end date of the whole
     * time axis will be extended in the same way as {@link #function-zoomToLevel} method does, to allow scrolling for
     * user.
     *
     * @param {Object} config The time frame.
     * @param {Date} config.startDate The time frame start.
     * @param {Date} config.endDate The time frame end.
     * @param {Date} [config.centerDate] Date that should be kept in the center. Has priority over start and end params
     * @param {Number} [config.leftMargin] Amount of pixels to extend span start on
     * @param {Number} [config.rightMargin] Amount of pixels to extend span end on
     * @param {Number} [config.adjustStart] Amount of units to extend span start on
     * @param {Number} [config.adjustEnd] Amount of units to extend span end on
     *
     * @returns {Number|null} level Current zoom level or null if it hasn't changed.
     * @category Zoom
     */
    zoomToSpan(config = {}) {
      if (config.leftMargin || config.rightMargin) {
        config.adjustStart = 0;
        config.adjustEnd = 0;
      }
      if (!config.leftMargin)
        config.leftMargin = 0;
      if (!config.rightMargin)
        config.rightMargin = 0;
      if (!config.startDate || !config.endDate)
        throw new Error("zoomToSpan: must provide startDate + endDate dates");
      const me = this, { timeAxis } = me, needToAdjust = config.adjustStart >= 0 || config.adjustEnd >= 0;
      let {
        startDate,
        endDate
      } = config;
      if (needToAdjust) {
        startDate = DateHelper.add(startDate, -config.adjustStart, timeAxis.mainUnit);
        endDate = DateHelper.add(endDate, config.adjustEnd, timeAxis.mainUnit);
      }
      if (startDate <= endDate) {
        const { availableSpace } = me.timeAxisViewModel, presets = me.presets.allRecords, diffMS = endDate - startDate || 1;
        let currLevel = me.zoomLevel, inc, range;
        if (currLevel === -1)
          currLevel = 0;
        let msPerPixel = me.getMilliSecondsPerPixelForZoomLevel(presets[currLevel], true), candidateLevel = currLevel + (inc = diffMS / msPerPixel + config.leftMargin + config.rightMargin > availableSpace ? -1 : 1), zoomLevel, levelToZoom = null;
        while (candidateLevel >= 0 && candidateLevel <= presets.length - 1) {
          zoomLevel = presets[candidateLevel];
          msPerPixel = me.getMilliSecondsPerPixelForZoomLevel(zoomLevel, true);
          const spanWidth = diffMS / msPerPixel + config.leftMargin + config.rightMargin;
          if (inc === -1) {
            if (spanWidth <= availableSpace) {
              levelToZoom = candidateLevel;
              break;
            }
          } else {
            if (spanWidth <= availableSpace) {
              if (currLevel !== candidateLevel - inc) {
                levelToZoom = candidateLevel;
              }
            } else {
              break;
            }
          }
          candidateLevel += inc;
        }
        levelToZoom = levelToZoom != null ? levelToZoom : candidateLevel - inc;
        zoomLevel = presets[levelToZoom];
        const unitToZoom = zoomLevel.bottomHeader.unit;
        msPerPixel = me.getMilliSecondsPerPixelForZoomLevel(zoomLevel, true);
        if (config.leftMargin || config.rightMargin) {
          startDate = new Date(startDate.getTime() - msPerPixel * config.leftMargin);
          endDate = new Date(endDate.getTime() + msPerPixel * config.rightMargin);
        }
        const tickCount = DateHelper.getDurationInUnit(startDate, endDate, unitToZoom, true) / zoomLevel.bottomHeader.increment;
        if (tickCount === 0) {
          return null;
        }
        const customWidth = Math.floor(availableSpace / tickCount), centerDate = config.centerDate || new Date((startDate.getTime() + endDate.getTime()) / 2);
        if (needToAdjust) {
          range = {
            startDate,
            endDate
          };
        } else {
          range = me.calculateOptimalDateRange(centerDate, availableSpace, zoomLevel);
        }
        let result = me.zoomLevel;
        if (me.zoomLevel === levelToZoom) {
          timeAxis.reconfigure(range);
        } else {
          result = me.zoomToLevel(
            levelToZoom,
            Object.assign(range, {
              width: customWidth,
              centerDate
            })
          );
        }
        this.trigger("zoomToSpan", { zoomLevel: levelToZoom, startDate, endDate, centerDate });
        return result;
      }
      return null;
    }
    /**
     * Zooms in the timeline according to the array of zoom levels. If the amount of levels to zoom is given, the view
     * will zoom in by this value. Otherwise, a value of `1` will be used.
     *
     * @param {Number} [levels] (optional) amount of levels to zoom in
     * @param {ChangePresetOptions} [options] Object containing options which affect how the new preset is applied.
     * @returns {Number|null} currentLevel New zoom level of the panel or null if level hasn't changed.
     * @category Zoom
     */
    zoomIn(levels = 1, options) {
      if (typeof levels === "object") {
        options = levels;
        levels = 1;
      }
      const currentZoomLevelIndex = this.zoomLevel;
      if (currentZoomLevelIndex >= this.maxZoomLevel) {
        return null;
      }
      return this.zoomToLevel(currentZoomLevelIndex + levels, options);
    }
    /**
     * Zooms out the timeline according to the array of zoom levels. If the amount of levels to zoom is given, the view
     * will zoom out by this value. Otherwise, a value of `1` will be used.
     *
     * @param {Number} levels (optional) amount of levels to zoom out
     * @param {ChangePresetOptions} [options] Object containing options which affect how the new preset is applied.
     * @returns {Number|null} currentLevel New zoom level of the panel or null if level hasn't changed.
     * @category Zoom
     */
    zoomOut(levels = 1, options) {
      if (typeof levels === "object") {
        options = levels;
        levels = 1;
      }
      const currentZoomLevelIndex = this.zoomLevel;
      if (currentZoomLevelIndex <= this.minZoomLevel) {
        return null;
      }
      return this.zoomToLevel(currentZoomLevelIndex - levels, options);
    }
    /**
     * Zooms in the timeline to the {@link #config-maxZoomLevel} according to the array of zoom levels.
     *
     * @param {ChangePresetOptions} [options] Object containing options which affect how the new preset is applied.
     * @returns {Number|null} currentLevel New zoom level of the panel or null if level hasn't changed.
     * @category Zoom
     */
    zoomInFull(options) {
      return this.zoomToLevel(this.maxZoomLevel, options);
    }
    /**
     * Zooms out the timeline to the {@link #config-minZoomLevel} according to the array of zoom levels.
     *
     * @param {ChangePresetOptions} [options] Object containing options which affect how the new preset is applied.
     * @returns {Number|null} currentLevel New zoom level of the panel or null if level hasn't changed.
     * @category Zoom
     */
    zoomOutFull(options) {
      return this.zoomToLevel(this.minZoomLevel, options);
    }
    /*
     * Adjusts the timespan of the panel to the new zoom level. Used for performance reasons,
     * as rendering too many columns takes noticeable amount of time so their number is limited.
     * @category Zoom
     * @private
     */
    calculateOptimalDateRange(centerDate, viewportSize, viewPreset) {
      const me = this, { timeAxis } = me, { bottomHeader } = viewPreset, tickWidth = me.isHorizontal ? viewPreset.tickWidth : viewPreset.tickHeight;
      if (me.zoomKeepsOriginalTimespan) {
        return {
          startDate: timeAxis.startDate,
          endDate: timeAxis.endDate
        };
      }
      const unit = bottomHeader.unit, difference = Math.ceil(viewportSize / tickWidth * bottomHeader.increment * me.visibleZoomFactor / 2), startDate = DateHelper.add(centerDate, -difference, unit), endDate = DateHelper.add(centerDate, difference, unit);
      return {
        startDate: timeAxis.floorDate(startDate, false, unit, bottomHeader.increment),
        endDate: timeAxis.ceilDate(endDate, false, unit, bottomHeader.increment)
      };
    }
    onElementMouseMove(event) {
      const {
        isHorizontal,
        zoomContext
      } = this;
      super.onElementMouseMove(event);
      if (event.isTrusted && zoomContext) {
        if (Math.abs(event[`client${isHorizontal ? "X" : "Y"}`] - zoomContext.coordinate) > 10) {
          this.zoomContext = null;
        }
      }
    }
    async onWheel(event) {
      if (event.ctrlKey && !this.forceFit) {
        event.preventDefault();
        const me = this, {
          zoomContext,
          isHorizontal,
          timelineScroller,
          zoomLevel
        } = me, now = performance.now(), coordinate = event[`client${isHorizontal ? "X" : "Y"}`];
        let zoomPosition = coordinate - timelineScroller.viewport[`${isHorizontal ? "x" : "y"}`];
        if (isHorizontal && me.rtl) {
          zoomPosition = timelineScroller.viewport.width + timelineScroller.viewport.x - coordinate;
        }
        if (now - me.lastWheelTime > 200 || !zoomContext || Math.abs(coordinate - me.zoomContext.coordinate) > 20) {
          me.zoomContext = {
            // So we can track if we're going in (to finer resolutions)
            zoomLevel,
            // Pointer client(X|Y)
            coordinate,
            // Full TimeAxis offset position at which to place the date
            zoomPosition,
            // The date to place at the position
            zoomDate: me.getDateFromDomEvent(event)
          };
        } else {
          if (zoomLevel > zoomContext.zoomLevel) {
            zoomContext.zoomDate = me.getDateFromDomEvent(event);
            zoomContext.zoomLevel = zoomLevel;
          }
          zoomContext.zoomPosition = zoomPosition;
        }
        me.lastWheelTime = now;
        me[`zoom${event.deltaY > 0 ? "Out" : "In"}`](void 0, me.zoomContext);
      }
    }
    /**
     * Changes the time axis timespan to the supplied start and end dates.
     * @param {Date} newStartDate The new start date
     * @param {Date} [newEndDate] The new end date. If omitted or equal to startDate, the
     * {@link Scheduler.preset.ViewPreset#field-defaultSpan} property of the current view preset will be used to calculate the new end date.
     * @param {Object} [options] An object containing modifiers for the time span change operation.
     * @param {Boolean} [options.maintainVisibleStart] Specify as `true` to keep the visible start date stable.
     * @param {Date} [options.visibleDate] The date inside the range to scroll into view
     * @async
     */
    setTimeSpan(newStartDate, newEndDate, options) {
      this.timeAxis.setTimeSpan(newStartDate, newEndDate, options);
    }
    /**
     * Moves the time axis by the passed amount and unit.
     *
     * NOTE: If using a filtered time axis, see {@link Scheduler.data.TimeAxis#function-shift} for more information.
     *
     * @param {Number} amount The number of units to jump
     * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} [unit] The unit (Day, Week etc)
     */
    shift(amount, unit) {
      this.timeAxis.shift(amount, unit);
    }
    /**
     * Moves the time axis forward in time in units specified by the view preset `shiftUnit`, and by the amount
     * specified by the `shiftIncrement` config of the current view preset.
     *
     * NOTE: If using a filtered time axis, see {@link Scheduler.data.TimeAxis#function-shiftNext} for more information.
     *
     * @param {Number} [amount] The number of units to jump forward
     */
    shiftNext(amount) {
      this.timeAxis.shiftNext(amount);
    }
    /**
     * Moves the time axis backward in time in units specified by the view preset `shiftUnit`, and by the amount
     * specified by the `shiftIncrement` config of the current view preset.
     *
     * NOTE: If using a filtered time axis, see {@link Scheduler.data.TimeAxis#function-shiftPrevious} for more
     * information.
     *
     * @param {Number} [amount] The number of units to jump backward
     */
    shiftPrevious(amount) {
      this.timeAxis.shiftPrevious(amount);
    }
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "TimelineZoomable"), __publicField(_a, "defaultConfig", {
    /**
     * If true, you can zoom in and out on the time axis using CTRL-key + mouse wheel.
     * @config {Boolean}
     * @default
     * @category Zoom
     */
    zoomOnMouseWheel: true,
    /**
     * True to zoom to time span when double-clicking a time axis cell.
     * @config {Boolean}
     * @default
     * @category Zoom
     */
    zoomOnTimeAxisDoubleClick: true,
    /**
     * The minimum zoom level to which {@link #function-zoomOut} will work. Defaults to 0 (year ticks)
     * @config {Number}
     * @category Zoom
     * @default
     */
    minZoomLevel: 0,
    /**
     * The maximum zoom level to which {@link #function-zoomIn} will work. Defaults to the number of
     * {@link Scheduler.preset.ViewPreset ViewPresets} available, see {@link Scheduler/view/mixin/TimelineViewPresets#property-presets}
     * for information. Unless you have modified the collection of available presets, the max zoom level is
     * milliseconds.
     * @config {Number}
     * @category Zoom
     * @default 23
     */
    maxZoomLevel: null,
    /**
     * Integer number indicating the size of timespan during zooming. When zooming, the timespan is adjusted to make
     * the scrolling area `visibleZoomFactor` times wider than the timeline area itself. Used in
     * {@link #function-zoomToSpan} and {@link #function-zoomToLevel} functions.
     * @config {Number}
     * @default
     * @category Zoom
     */
    visibleZoomFactor: 5,
    /**
     * Whether the originally rendered timespan should be preserved while zooming. By default, it is set to `false`,
     * meaning the timeline panel will adjust the currently rendered timespan to limit the amount of HTML content to
     * render. When setting this option to `true`, be careful not to allow to zoom a big timespan in seconds
     * resolution for example. That will cause **a lot** of HTML content to be rendered and affect performance. You
     * can use {@link #config-minZoomLevel} and {@link #config-maxZoomLevel} config options for that.
     * @config {Boolean}
     * @default
     * @category Zoom
     */
    zoomKeepsOriginalTimespan: null
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/recurrence/RecurrenceConfirmationPopup.js
var RecurrenceConfirmationPopup = class extends Popup {
  static get $name() {
    return "RecurrenceConfirmationPopup";
  }
  // Factoryable type name
  static get type() {
    return "recurrenceconfirmation";
  }
  static get defaultConfig() {
    return {
      localizableProperties: [],
      align: "b-t",
      autoShow: false,
      autoClose: false,
      closeAction: "onRecurrenceClose",
      modal: true,
      centered: true,
      scrollAction: "realign",
      constrainTo: globalThis,
      draggable: true,
      closable: true,
      floating: true,
      eventRecord: null,
      cls: "b-sch-recurrenceconfirmation",
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          changeSingleButton: {
            weight: 100,
            cls: "b-raised",
            color: "b-blue",
            text: "L{update-only-this-btn-text}",
            onClick: "up.onChangeSingleButtonClick"
          },
          changeMultipleButton: {
            weight: 200,
            color: "b-green",
            text: "L{Object.Yes}",
            onClick: "up.onChangeMultipleButtonClick"
          },
          cancelButton: {
            weight: 300,
            color: "b-gray",
            text: "L{Object.Cancel}",
            onClick: "up.onCancelButtonClick"
          }
        }
      }
    };
  }
  /**
   * Reference to the "Apply changes to multiple occurrences" button, if used
   * @property {Core.widget.Button}
   * @readonly
   */
  get changeMultipleButton() {
    return this.widgetMap.changeMultipleButton;
  }
  /**
   * Reference to the button that causes changing of the event itself only, if used
   * @property {Core.widget.Button}
   * @readonly
   */
  get changeSingleButton() {
    return this.widgetMap.changeSingleButton;
  }
  /**
   * Reference to the cancel button, if used
   * @property {Core.widget.Button}
   * @readonly
   */
  get cancelButton() {
    return this.widgetMap.cancelButton;
  }
  /**
   * Handler for "Apply changes to multiple occurrences" {@link #property-changeMultipleButton button}.
   * It calls {@link #function-processMultipleRecords} and then hides the dialog.
   */
  onChangeMultipleButtonClick() {
    this.processMultipleRecords();
    this.hide();
  }
  /**
   * Handler for the {@link #property-changeSingleButton button} that causes changing of the event itself only.
   * It calls {@link #function-processSingleRecord} and then hides the dialog.
   */
  onChangeSingleButtonClick() {
    this.processSingleRecord();
    this.hide();
  }
  /**
   * Handler for {@link #property-cancelButton cancel button}.
   * It calls `cancelFn` provided to {@link #function-confirm} call and then hides the dialog.
   */
  onCancelButtonClick() {
    this.cancelFn && this.cancelFn.call(this.thisObj);
    this.hide();
  }
  onRecurrenceClose() {
    if (this.cancelFn) {
      this.cancelFn.call(this.thisObj);
    }
    this.hide();
  }
  /**
   * Displays the confirmation.
   * Usage example:
   *
   * ```javascript
   * const popup = new RecurrenceConfirmationPopup();
   *
   * popup.confirm({
   *     eventRecord,
   *     actionType : "delete",
   *     changerFn  : () => eventStore.remove(record)
   * });
   * ```
   *
   * @param {Object} config The following config options are supported:
   * @param {Scheduler.model.EventModel} config.eventRecord   Event being modified.
   * @param {'update'|'delete'} config.actionType Type of modification to be applied to the event. Can be
   * either "update" or "delete".
   * @param {Function} config.changerFn A function that should be called to apply the change to the event upon user
   * choice.
   * @param {Function} [config.thisObj] `changerFn` and `cancelFn` functions scope.
   * @param {Function} [config.cancelFn] Function called on `Cancel` button click.
   */
  confirm(config = {}) {
    const me = this;
    [
      "actionType",
      "eventRecord",
      "title",
      "html",
      "changerFn",
      "cancelFn",
      "finalizerFn",
      "thisObj"
    ].forEach((prop) => {
      if (prop in config)
        me[prop] = config[prop];
    });
    me.updatePopupContent();
    return super.show(config);
  }
  updatePopupContent() {
    const me = this, { changeMultipleButton, changeSingleButton, cancelButton } = me.widgetMap, { eventRecord, actionType = "update" } = me, isMaster = eventRecord == null ? void 0 : eventRecord.isRecurring;
    if (isMaster) {
      changeMultipleButton.text = me.L("L{Object.Yes}");
      me.html = me.L(`${actionType}-all-message`);
    } else {
      changeMultipleButton.text = me.L(`${actionType}-further-btn-text`);
      me.html = me.L(`${actionType}-further-message`);
    }
    changeSingleButton.text = me.L(`${actionType}-only-this-btn-text`);
    cancelButton.text = me.L("L{Object.Cancel}");
    me.width = me.L("L{width}");
    me.title = me.L(`${actionType}-title`);
  }
  /**
   * Applies changes to multiple occurrences as reaction on "Apply changes to multiple occurrences"
   * {@link #property-changeMultipleButton button} click.
   */
  processMultipleRecords() {
    const { eventRecord, changerFn, thisObj, finalizerFn } = this;
    eventRecord.beginBatch();
    changerFn && this.callback(changerFn, thisObj, [eventRecord]);
    eventRecord.endBatch();
    finalizerFn && this.callback(finalizerFn, thisObj, [eventRecord]);
  }
  /**
   * Applies changes to a single record by making it a "real" event and adding an exception to the recurrence.
   * The method is called as reaction on clicking the {@link #property-changeSingleButton button} that causes changing of the event itself only.
   */
  processSingleRecord() {
    const { eventRecord, changerFn, thisObj, finalizerFn } = this;
    eventRecord.beginBatch();
    let firstOccurrence;
    if (eventRecord == null ? void 0 : eventRecord.isRecurring) {
      eventRecord.recurrence.forEachOccurrence(eventRecord.startDate, null, (occurrence, isFirst, index) => {
        if (index > 1) {
          firstOccurrence = occurrence;
          return false;
        }
      });
    }
    firstOccurrence == null ? void 0 : firstOccurrence.convertToRealEvent();
    eventRecord.recurrence = null;
    changerFn && this.callback(changerFn, thisObj, [eventRecord]);
    eventRecord.recurrenceRule = null;
    eventRecord.endBatch();
    finalizerFn && this.callback(finalizerFn, thisObj, [eventRecord]);
  }
  updateLocalization() {
    this.updatePopupContent();
    super.updateLocalization();
  }
};
RecurrenceConfirmationPopup.initClass();
RecurrenceConfirmationPopup._$name = "RecurrenceConfirmationPopup";

// ../Scheduler/lib/Scheduler/view/mixin/RecurringEvents.js
var RecurringEvents_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    construct(config) {
      super.construct(config);
      this.ion({
        beforeEventDropFinalize: "onRecurrableBeforeEventDropFinalize",
        beforeEventResizeFinalize: "onRecurrableBeforeEventResizeFinalize",
        beforeAssignmentDelete: "onRecurrableAssignmentBeforeDelete"
      });
    }
    changeRecurrenceConfirmationPopup(recurrenceConfirmationPopup, oldRecurrenceConfirmationPopup) {
      const result = this.constructor.reconfigure(oldRecurrenceConfirmationPopup, recurrenceConfirmationPopup, "recurrenceconfirmation");
      result.owner = this;
      return result;
    }
    findRecurringEventToConfirmDelete(eventRecords) {
      return eventRecords.find((eventRecord) => eventRecord.supportsRecurring && (eventRecord.isRecurring || eventRecord.isOccurrence));
    }
    onRecurrableAssignmentBeforeDelete({ assignmentRecords, context }) {
      const eventRecords = assignmentRecords.map((as) => as.event), eventRecord = this.findRecurringEventToConfirmDelete(eventRecords);
      if (this.enableRecurringEvents && eventRecord) {
        this.recurrenceConfirmationPopup.confirm({
          actionType: "delete",
          eventRecord,
          changerFn() {
            context.finalize(true);
          },
          cancelFn() {
            context.finalize(false);
          }
        });
        return false;
      }
    }
    onRecurrableBeforeEventDropFinalize({ context }) {
      if (this.enableRecurringEvents) {
        const { eventRecords } = context, recurringEvents = eventRecords.filter((eventRecord) => eventRecord.supportsRecurring && (eventRecord.isRecurring || eventRecord.isOccurrence));
        if (recurringEvents.length) {
          context.async = true;
          this.recurrenceConfirmationPopup.confirm({
            actionType: "update",
            eventRecord: recurringEvents[0],
            changerFn() {
              context.finalize(true);
            },
            cancelFn() {
              context.finalize(false);
            }
          });
        }
      }
    }
    onRecurrableBeforeEventResizeFinalize({ context }) {
      if (this.enableRecurringEvents) {
        const { eventRecord } = context, isRecurring = eventRecord.supportsRecurring && (eventRecord.isRecurring || eventRecord.isOccurrence);
        if (isRecurring) {
          context.async = true;
          this.recurrenceConfirmationPopup.confirm({
            actionType: "update",
            eventRecord,
            changerFn() {
              context.finalize(true);
            },
            cancelFn() {
              context.finalize(false);
            }
          });
        }
      }
    }
    // Make sure occurrence cache is up-to-date when reassigning events
    onAssignmentChange({ action, records: assignments, changes }) {
      var _a2;
      if (action === "update" && changes.event && changes.resource && Object.keys(changes).length === 2) {
        return;
      }
      if (action !== "dataset" && Array.isArray(assignments)) {
        for (const assignment of assignments) {
          if (((_a2 = assignment.event) == null ? void 0 : _a2.isRecurring) && !assignment.event.isBatchUpdating) {
            assignment.event.removeOccurrences(this.eventStore);
          }
        }
      }
    }
    /**
     * Returns occurrences of the provided recurring event across the date range of this Scheduler.
     * @param  {Scheduler.model.TimeSpan} recurringEvent Recurring event for which occurrences should be retrieved.
     * @returns {Scheduler.model.TimeSpan[]} Array of the provided timespans occurrences.
     *
     * __Empty if the passed event is not recurring, or has no occurrences in the date range.__
     *
     * __If the date range encompasses the start point, the recurring event itself will be the first entry.__
     * @category Data
     */
    getOccurrencesFor(recurringEvent) {
      return this.eventStore.getOccurrencesForTimeSpan(recurringEvent, this.timeAxis.startDate, this.timeAxis.endDate);
    }
    /**
     * Internal utility function to remove events. Used when pressing [DELETE] or [BACKSPACE] or when clicking the
     * delete button in the event editor. Triggers a preventable `beforeEventDelete` or `beforeAssignmentDelete` event.
     * @param {Scheduler.model.EventModel[]|Scheduler.model.AssignmentModel[]} eventRecords Records to remove
     * @param {Function} [callback] Optional callback executed after triggering the event but before deletion
     * @returns {Boolean} Returns `false` if the operation was prevented, otherwise `true`
     * @internal
     * @fires beforeEventDelete
     * @fires beforeAssignmentDelete
     */
    async removeEvents(eventRecords, callback = null, popupOwner = this) {
      const me = this;
      if (!me.readOnly && eventRecords.length) {
        const context = {
          finalize(removeRecord = true) {
            if (callback) {
              callback(removeRecord);
            }
            if (removeRecord !== false) {
              if (eventRecords.some((record) => {
                var _a2;
                return record.isOccurrence || ((_a2 = record.event) == null ? void 0 : _a2.isOccurrence);
              })) {
                eventRecords.forEach((record) => record.isOccurrenceAssignment ? record.event.remove() : record.remove());
              } else {
                const store = eventRecords[0].isAssignment ? me.assignmentStore : me.eventStore;
                store.remove(eventRecords);
              }
            }
          }
        };
        let shouldFinalize;
        if (eventRecords[0].isAssignment) {
          shouldFinalize = me.trigger("beforeAssignmentDelete", { assignmentRecords: eventRecords, context });
        } else {
          shouldFinalize = await me.trigger("beforeEventDelete", { eventRecords, context });
        }
        if (shouldFinalize !== false) {
          const recurringEventRecord = eventRecords.find((eventRecord) => eventRecord.isRecurring || eventRecord.isOccurrence);
          if (recurringEventRecord) {
            me.recurrenceConfirmationPopup.owner = popupOwner;
            me.recurrenceConfirmationPopup.confirm({
              actionType: "delete",
              eventRecord: recurringEventRecord,
              changerFn() {
                context.finalize(true);
              },
              cancelFn() {
                context.finalize(false);
              }
            });
          } else {
            context.finalize(true);
          }
          return true;
        }
      }
      return false;
    }
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "RecurringEvents"), __publicField(_a, "configurable", {
    /**
     * Enables showing occurrences of recurring events across the scheduler's time axis.
     *
     * Enables extra recurrence UI fields in the system-provided event editor (not in Scheduler Pro's task editor).
     * @config {Boolean}
     * @default
     * @category Scheduled events
     */
    enableRecurringEvents: false,
    recurrenceConfirmationPopup: {
      $config: ["lazy"],
      value: {
        type: "recurrenceconfirmation"
      }
    }
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineEventRendering.js
var TimelineEventRendering_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static get $name() {
      return "TimelineEventRendering";
    }
    //region Default config
    static get defaultConfig() {
      return {
        /**
         * When `true`, events are sized and positioned based on rowHeight, resourceMargin and barMargin settings.
         * Set this to `false` if you want to control height and vertical position using CSS instead.
         *
         * Note that events always get an absolute top position, but when this setting is enabled that position
         * will match row's top. To offset within the row using CSS, use `transform : translateY(y)`.
         *
         * @config {Boolean}
         * @default
         * @category Scheduled events
         */
        managedEventSizing: true,
        /**
         * The CSS class added to an event/assignment when it is newly created
         * in the UI and unsynced with the server.
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        generatedIdCls: "b-sch-dirty-new",
        /**
         * The CSS class added to an event when it has unsaved modifications
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        dirtyCls: "b-sch-dirty",
        /**
         * The CSS class added to an event when it is currently committing changes
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        committingCls: "b-sch-committing",
        /**
         * The CSS class added to an event/assignment when it ends outside of the visible time range.
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        endsOutsideViewCls: "b-sch-event-endsoutside",
        /**
         * The CSS class added to an event/assignment when it starts outside of the visible time range.
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        startsOutsideViewCls: "b-sch-event-startsoutside",
        /**
         * The CSS class added to an event/assignment when it is not draggable.
         * @config {String}
         * @default
         * @private
         * @category CSS
         */
        fixedEventCls: "b-sch-event-fixed"
      };
    }
    //endregion
    //region Settings
    updateFillTicks(fillTicks) {
      if (!this.isConfiguring) {
        this.timeAxis.forceFullTicks = fillTicks && this.snap;
        this.refreshWithTransition();
        this.trigger("stateChange");
      }
    }
    changeBarMargin(margin) {
      ObjectHelper.assertNumber(margin, "barMargin");
      if (this._resourceMargin == null) {
        this.changeResourceMargin(margin);
      }
      if (this.isHorizontal && this.rowHeight) {
        return Math.min(Math.ceil(this.rowHeight / 2), margin);
      }
      return margin;
    }
    updateBarMargin() {
      if (this.rendered) {
        this.currentOrientation.onBeforeRowHeightChange();
        this.refreshWithTransition();
        this.trigger("stateChange");
      }
    }
    // Documented in SchedulerEventRendering to not show up in Gantt docs
    get resourceMargin() {
      return this._resourceMargin == null ? this.barMargin : this._resourceMargin;
    }
    changeResourceMargin(margin) {
      const me = this;
      if (typeof margin === "number") {
        if (me.isHorizontal && me.rowHeight) {
          margin = Math.min(Math.ceil(me.rowHeight / 2), margin);
        }
        me.resourceMarginObject = {
          start: margin,
          end: margin,
          total: margin * 2
        };
        return margin;
      }
      if (!(margin == null ? void 0 : margin.start)) {
        margin.start = 0;
      }
      if (!(margin == null ? void 0 : margin.end)) {
        margin.end = 0;
      }
      if (me.isHorizontal && me.rowHeight) {
        margin.start = me.rowHeight < margin.start + margin.end ? Math.ceil(me.rowHeight / 2) : margin.start;
        margin.end = me.rowHeight < margin.start + margin.end ? Math.ceil(me.rowHeight / 2) : margin.end;
      }
      me.resourceMarginObject = ObjectHelper.assign({
        total: margin.start + margin.end
      }, margin);
      return margin;
    }
    updateResourceMargin() {
      const me = this;
      if (me.rendered) {
        me.currentOrientation.onBeforeRowHeightChange();
        me.refreshWithTransition();
      }
    }
    changeTickSize(width) {
      ObjectHelper.assertNumber(width, "tickSize");
      return width;
    }
    updateTickSize(width) {
      this.timeAxisViewModel.tickSize = width;
    }
    get tickSize() {
      return this.timeAxisViewModel.tickSize;
    }
    /**
     * Predefined event colors, useful in combos etc.
     * @type {String[]}
     * @category Scheduled events
     */
    static get eventColors() {
      return ["red", "pink", "purple", "magenta", "violet", "indigo", "blue", "cyan", "teal", "green", "gantt-green", "lime", "yellow", "orange", "deep-orange", "gray", "light-gray"];
    }
    /**
     * Predefined event styles , useful in combos etc.
     * @type {String[]}
     * @category Scheduled events
     */
    static get eventStyles() {
      return ["plain", "border", "hollow", "colored", "line", "dashed", "minimal", "rounded"];
    }
    updateEventStyle(style) {
      if (!this.isConfiguring) {
        this.refreshWithTransition();
        this.trigger("stateChange");
      }
    }
    updateEventColor(color) {
      if (!this.isConfiguring) {
        this.refreshWithTransition();
        this.trigger("stateChange");
      }
    }
    //endregion
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "configurable", {
    /**
     * Controls how much space to leave between stacked event bars in px.
     *
     * Value will be constrained by half the row height in horizontal mode.
     *
     * @prp {Number}
     * @default
     * @category Scheduled events
     */
    barMargin: 10,
    /**
     * Specify `true` to force rendered events/tasks to fill entire ticks. This only affects rendering, start
     * and end dates retain their value on the data level.
     *
     * When enabling `fillTicks` you should consider either disabling EventDrag/TaskDrag and EventResize/TaskResize,
     * or enabling {@link Scheduler/view/mixin/TimelineDateMapper#config-snap}. Otherwise their behaviour might not
     * be what a user expects.
     *
     * @prp {Boolean}
     * @default
     * @category Scheduled events
     */
    fillTicks: false,
    resourceMargin: null,
    /**
     * Event color used by default. Events and resources can specify their own color, with priority order being:
     * Event -> Resource -> Scheduler default.
     *
     * Specify `null` to not apply a default color and take control using custom CSS (an easily overridden color
     * will be used to make sure events are still visible).
     *
     * For available standard colors, see {@link Scheduler.model.mixin.EventModelMixin#typedef-EventColor}.
     *
     * @prp {EventColor} eventColor
     * @category Scheduled events
     */
    eventColor: "green",
    /**
     * Event style used by default. Events and resources can specify their own style, with priority order being:
     * Event -> Resource -> Scheduler default. Determines the appearance of the event by assigning a CSS class
     * to it. Available styles are:
     *
     * * `'plain'` (default) - flat look
     * * `'border'` - has border in darker shade of events color
     * * `'colored'` - has colored text and wide left border in same color
     * * `'hollow'` - only border + text until hovered
     * * `'line'` - as a line with the text below it
     * * `'dashed'` - as a dashed line with the text below it
     * * `'minimal'` - as a thin line with small text above it
     * * `'rounded'` - minimalistic style with rounded corners
     * * `null` - do not apply a default style and take control using custom CSS (easily overridden basic styling will be used).
     *
     * In addition, there are two styles intended to be used when integrating with Bryntum Calendar. To match
     * the look of Calendar events, you can use:
     *
     * * `'calendar'` - a variation of the "colored" style matching the default style used by Calendar
     * * `'interday'` - a variation of the "plain" style, for interday events
     *
     * @prp {'plain'|'border'|'colored'|'hollow'|'line'|'dashed'|'minimal'|'rounded'|'calendar'|'interday'|null}
     * @default
     * @category Scheduled events
     */
    eventStyle: "plain",
    /**
     * The width/height (depending on vertical / horizontal mode) of all the time columns.
     *
     * There is a limit for the tick size value. Its minimal allowed value is calculated so ticks would fit the
     * available space. Only applicable when {@link Scheduler.view.TimelineBase#config-forceFit} is set to
     * `false`. To set `tickSize` freely skipping that limitation please set
     * {@link Scheduler.view.TimelineBase#config-suppressFit} to `true`.
     *
     * @prp {Number}
     * @category Scheduled events
     */
    tickSize: null
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineScroll.js
var maintainVisibleStart = {
  maintainVisibleStart: true
};
var defaultScrollOptions = {
  block: "nearest"
};
var TimelineScroll_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base).mixin(
    // the mixin overrides TimelineZoomable method so should be applied after it
    TimelineZoomable_default
  ) {
    //region TimelineZoomable injections
    onZoomToSpan({ startDate }) {
      if (this.infiniteScroll) {
        this.scrollToDate(startDate, { block: "start" });
      }
    }
    calculateOptimalDateRange(centerDate, viewportSize, viewPreset) {
      if (this.infiniteScroll) {
        if (this.zoomKeepsOriginalTimespan) {
          const { startDate, endDate } = this.timeAxis;
          return { startDate, endDate };
        }
        return this.calculateInfiniteScrollingDateRange(centerDate, true);
      }
      return super.calculateOptimalDateRange(...arguments);
    }
    //endregion TimelineZoomable injections
    initScroll() {
      var _a2;
      const me = this, {
        isHorizontal,
        visibleDate
      } = me;
      super.initScroll();
      const { scrollable } = isHorizontal ? me.timeAxisSubGrid : me;
      scrollable.ion({
        scroll: "onTimelineScroll",
        thisObj: me
      });
      if (me.infiniteScroll) {
        if ((_a2 = me.partneredWith) == null ? void 0 : _a2.values.some((partner) => partner.infiniteScroll)) {
          const availableSpace = scrollable.element.getBoundingClientRect()[me.isHorizontal ? "width" : "height"];
          me.timeAxisViewModel.update(availableSpace, false, true);
        } else {
          const setTimeSpanOptions = visibleDate ? { ...visibleDate, visibleDate: visibleDate.date } : { visibleDate: me.viewportCenterDate, block: "center" }, { startDate, endDate } = me.calculateInfiniteScrollingDateRange(setTimeSpanOptions.visibleDate, setTimeSpanOptions.block === "center");
          me.setTimeSpan(
            startDate,
            endDate,
            setTimeSpanOptions
          );
        }
      }
    }
    /**
     * A {@link Core.helper.util.Scroller} which scrolls the time axis in whatever {@link Scheduler.view.Scheduler#config-mode} the
     * Scheduler is configured, either `horizontal` or `vertical`.
     *
     * The width and height dimensions are replaced by `size`. So this will expose the following properties:
     *
     *    - `clientSize` The size of the time axis viewport.
     *    - `scrollSize` The full scroll size of the time axis viewport
     *    - `position` The position scrolled to along the time axis viewport
     *
     * @property {Core.helper.util.Scroller}
     * @readonly
     * @category Scrolling
     */
    get timelineScroller() {
      const me = this;
      if (!me.scrollInitialized) {
        me.initScroll();
      }
      return me._timelineScroller || (me._timelineScroller = new TimelineScroller({
        widget: me,
        scrollable: me.isHorizontal ? me.timeAxisSubGrid.scrollable : me.scrollable,
        isHorizontal: me.isHorizontal
      }));
    }
    /**
     * Used to calculate the range to extend the TimeAxis to during infinite scroll.
     * @param {Date} date
     * @param {Boolean} centered
     * @param {Scheduler.preset.ViewPreset} [preset] Optional, the preset for which to calculate the range.
     * defaults to the currently active ViewPreset
     * @returns {Object} `{ startDate, endDate }`
     * @internal
     */
    calculateInfiniteScrollingDateRange(date, centered, preset = this.timeAxisViewModel.viewPreset) {
      const {
        timeAxis,
        availableSpace
      } = this.timeAxisViewModel, {
        bufferCoef
      } = this, {
        leafUnit,
        leafIncrement,
        topUnit,
        topIncrement,
        tickSize
      } = preset, useTop = leafUnit === topUnit && Math.round(topIncrement) === topIncrement && Math.round(leafIncrement) === leafIncrement, snapSize = useTop ? topIncrement : leafIncrement, snapUnit = useTop ? topUnit : leafUnit;
      if (centered) {
        const halfSpan = Math.ceil((availableSpace * bufferCoef + availableSpace / 2) / tickSize);
        return {
          startDate: timeAxis.floorDate(DateHelper.add(date, -halfSpan * leafIncrement, leafUnit), false, snapUnit, snapSize),
          endDate: timeAxis.ceilDate(DateHelper.add(date, halfSpan * leafIncrement, leafUnit), false, snapUnit, snapSize)
        };
      } else {
        const bufferedTicks = Math.ceil(availableSpace * bufferCoef / tickSize);
        return {
          startDate: timeAxis.floorDate(DateHelper.add(date, -bufferedTicks * leafIncrement, leafUnit), false, snapUnit, snapSize),
          endDate: timeAxis.ceilDate(DateHelper.add(date, Math.ceil((availableSpace / tickSize + bufferedTicks) * leafIncrement), leafUnit), false, snapUnit, snapSize)
        };
      }
    }
    doDestroy() {
      var _a2;
      (_a2 = this._timelineScroller) == null ? void 0 : _a2.destroy();
      super.doDestroy();
    }
    onTimelineScroll({ source }) {
      if (this.infiniteScroll) {
        this.checkTimeAxisScroll(source[this.isHorizontal ? "x" : "y"]);
      }
    }
    checkTimeAxisScroll(scrollPos) {
      const me = this, scrollable = me.timelineScroller, { clientSize } = scrollable, requiredSize = clientSize * me.bufferCoef, limit = requiredSize * me.bufferThreshold, maxScroll = scrollable.maxPosition, { style } = me.timeAxisSubGrid.virtualScrollerElement;
      if (maxScroll - scrollPos < limit || scrollPos < limit) {
        style.overflow = "hidden";
        style.pointerEvents = "none";
        style.paddingBottom = `${DomHelper.scrollBarWidth}px`;
        me.setTimeout(() => {
          style.overflow = "";
          style.paddingBottom = "";
          style.pointerEvents = "";
        }, 100);
        me.shiftToDate(me.getDateFromCoordinate(scrollPos, null, true, false, true));
      }
    }
    shiftToDate(date, centered) {
      const newRange = this.calculateInfiniteScrollingDateRange(date, centered);
      this.setTimeSpan(newRange.startDate, newRange.endDate, maintainVisibleStart);
    }
    // If we change to infinite scrolling dynamically, it should create the buffer zones.
    updateInfiniteScroll(infiniteScroll) {
      if (!this.isConfiguring && infiniteScroll) {
        this.checkTimeAxisScroll(this.timelineScroller.position);
      }
    }
    //region Scroll to date
    /**
     * Scrolls the timeline "tick" encapsulating the passed `Date` into view according to the passed options.
     * @param {Date} date The date to which to scroll the timeline
     * @param {BryntumScrollOptions} [options] How to scroll.
     * @returns {Promise} A Promise which resolves when the scrolling is complete.
     * @category Scrolling
     */
    async scrollToDate(date, options = {}) {
      const me = this, {
        timeAxis,
        visibleDateRange,
        infiniteScroll
      } = me, {
        unit,
        increment
      } = timeAxis, edgeOffset = options.edgeOffset || 0, visibleWidth = DateHelper.ceil(visibleDateRange.endDate, increment + " " + unit) - DateHelper.floor(visibleDateRange.startDate, increment + " " + unit), direction = date > me.viewportCenterDate ? 1 : -1, extraScroll = (infiniteScroll ? visibleWidth * me.bufferCoef * me.bufferThreshold : options.block === "center" ? visibleWidth / 2 : edgeOffset ? me.getMilliSecondsPerPixelForZoomLevel(me.viewPreset) * edgeOffset : 0) * direction, visibleDate = new Date(date.getTime() + extraScroll), shiftDirection = visibleDate > timeAxis.endDate ? 1 : visibleDate < timeAxis.startDate ? -1 : 0;
      if (shiftDirection && me.infiniteScroll) {
        me.shiftToDate(new Date(date - extraScroll), null, true);
        await me.nextAnimationFrame();
      }
      const scrollerViewport = me.timelineScroller.viewport, localCoordinate = me.getCoordinateFromDate(date, true), width = Math.min(me.timeAxisViewModel.tickSize, me.timeAxisViewModel.availableSpace), target = me.isHorizontal ? new Rectangle(me.getCoordinateFromDate(date, false) - (me.rtl ? width : 0), scrollerViewport.y, width, scrollerViewport.height) : new Rectangle(scrollerViewport.x, me.getCoordinateFromDate(date, false), scrollerViewport.width, me.timeAxisViewModel.tickSize);
      await me.scrollToCoordinate(localCoordinate, target, date, options);
    }
    /**
     * Scrolls to current time.
     * @param {BryntumScrollOptions} [options] How to scroll.
     * @returns {Promise} A Promise which resolves when the scrolling is complete.
     * @category Scrolling
     */
    scrollToNow(options = {}) {
      return this.scrollToDate(/* @__PURE__ */ new Date(), options);
    }
    /**
     * Used by {@link #function-scrollToDate} to scroll to correct coordinate.
     * @param {Number} localCoordinate Coordinate to scroll to
     * @param {Element|Core.helper.util.Rectangle} target The target
     * @param {Date} date Date to scroll to, used for reconfiguring the time axis
     * @param {BryntumScrollOptions} [options] How to scroll.
     * @returns {Promise} A Promise which resolves when the scrolling is complete.
     * @private
     * @category Scrolling
     */
    async scrollToCoordinate(localCoordinate, target, date, options = {}) {
      const me = this;
      if (localCoordinate < 0) {
        const visibleSpan = me.endDate - me.startDate, { unit, increment } = me.timeAxis, newStartDate = DateHelper.floor(new Date(date.getTime() - visibleSpan / 2), increment + " " + unit), newEndDate = DateHelper.add(newStartDate, visibleSpan);
        if (newStartDate - me.startDate !== 0 && newEndDate - me.endDate !== 0) {
          await me.setTimeSpan(newStartDate, newEndDate);
          return me.scrollToDate(date, options);
        }
        return;
      }
      await me.timelineScroller.scrollIntoView(target, options);
      return !me.isDestroyed && me.nextAnimationFrame();
    }
    //endregion
    //region Relative scrolling
    // These methods are important to users because although they are mixed into the top level Grid/Scheduler,
    // for X scrolling the explicitly target the SubGrid that holds the scheduler.
    /**
     * Get/set the `scrollLeft` value of the SubGrid that holds the scheduler.
     *
     * This may be __negative__ when the writing direction is right-to-left.
     * @property {Number}
     * @category Scrolling
     */
    set scrollLeft(left) {
      this.timeAxisSubGrid.scrollable.element.scrollLeft = left;
    }
    get scrollLeft() {
      return this.timeAxisSubGrid.scrollable.element.scrollLeft;
    }
    /**
     * Get/set the writing direction agnostic horizontal scroll position.
     *
     * This is always the __positive__ offset from the scroll origin whatever the writing
     * direction in use.
     *
     * Applies to the SubGrid that holds the scheduler
     * @property {Number}
     * @category Scrolling
     */
    set scrollX(x) {
      this.timeAxisSubGrid.scrollable.x = x;
    }
    get scrollX() {
      return this.timeAxisSubGrid.scrollable.x;
    }
    /**
     * Get/set vertical scroll
     * @property {Number}
     * @category Scrolling
     */
    set scrollTop(top) {
      this.scrollable.y = top;
    }
    get scrollTop() {
      return this.scrollable.y;
    }
    /**
     * Horizontal scrolling. Applies to the SubGrid that holds the scheduler
     * @param {Number} x
     * @param {BryntumScrollOptions|Boolean} [options] How to scroll. May be passed as `true` to animate.
     * @returns {Promise} A promise which is resolved when the scrolling has finished.
     * @category Scrolling
     */
    scrollHorizontallyTo(coordinate, options = true) {
      return this.timeAxisSubGrid.scrollable.scrollTo(coordinate, null, options);
    }
    /**
     * Vertical scrolling
     * @param {Number} y
     * @param {BryntumScrollOptions|Boolean} [options] How to scroll. May be passed as `true` to animate.
     * @returns {Promise} A promise which is resolved when the scrolling has finished.
     * @category Scrolling
     */
    scrollVerticallyTo(y, options = true) {
      return this.scrollable.scrollTo(null, y, options);
    }
    /**
     * Scrolls the subgrid that contains the scheduler
     * @param {Number} x
     * @param {BryntumScrollOptions|Boolean} [options] How to scroll. May be passed as `true` to animate.
     * @returns {Promise} A promise which is resolved when the scrolling has finished.
     * @category Scrolling
     */
    scrollTo(x, options = true) {
      return this.timeAxisSubGrid.scrollable.scrollTo(x, null, options);
    }
    //endregion
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "TimelineScroll"), __publicField(_a, "configurable", {
    /**
     * This config defines the size of the start and end invisible parts of the timespan when {@link #config-infiniteScroll} set to `true`.
     *
     * It should be provided as a coefficient, which will be multiplied by the size of the scheduling area.
     *
     * For example, if `bufferCoef` is `5` and the panel view width is 200px then the timespan will be calculated to
     * have approximately 1000px (`5 * 200`) to the left and 1000px to the right of the visible area, resulting
     * in 2200px of totally rendered content.
     *
     * @config {Number}
     * @category Infinite scroll
     * @default
     */
    bufferCoef: 5,
    /**
     * This config defines the scroll limit, which, when exceeded will cause a timespan shift.
     * The limit is calculated as the `panelWidth * {@link #config-bufferCoef} * bufferThreshold`. During scrolling, if the left or right side
     * has less than that of the rendered content - a shift is triggered.
     *
     * For example if `bufferCoef` is `5` and the panel view width is 200px and `bufferThreshold` is 0.2, then the timespan
     * will be shifted when the left or right side has less than 200px (5 * 200 * 0.2) of content.
     * @config {Number}
     * @category Infinite scroll
     * @default
     */
    bufferThreshold: 0.2,
    /**
     * Configure as `true` to automatically adjust the panel timespan during scrolling in the time dimension,
     * when the scroller comes close to the start/end edges.
     *
     * The actually rendered timespan in this mode (and thus the amount of HTML in the DOM) is calculated based
     * on the {@link #config-bufferCoef} option, and is thus not controlled by the {@link Scheduler/view/TimelineBase#config-startDate}
     * and {@link Scheduler/view/TimelineBase#config-endDate} configs. The moment when the timespan shift
     * happens is determined by the {@link #config-bufferThreshold} value.
     *
     * To specify initial point in time to view, supply the
     * {@link Scheduler/view/TimelineBase#config-visibleDate} config.
     *
     * @config {Boolean} infiniteScroll
     * @category Infinite scroll
     * @default
     */
    infiniteScroll: false
  }), _a;
};
var TimelineScroller = class extends Scroller {
  static get configurable() {
    return {
      position: null,
      x: null,
      y: null
    };
  }
  // This class is passive about configuring the element.
  // It has no opinions about *how* the overflow is handled.
  updateOverflowX() {
  }
  updateOverflowY() {
  }
  onScroll(e) {
    super.onScroll(e);
    this._position = null;
  }
  syncPartners(force) {
    this.scrollable.syncPartners(force);
  }
  updatePosition(position) {
    this.scrollable[this.isHorizontal ? "x" : "y"] = position;
  }
  get viewport() {
    return this.scrollable.viewport;
  }
  get position() {
    return this._position = this.scrollable[this.isHorizontal ? "x" : "y"];
  }
  get clientSize() {
    return this.scrollable[`client${this.isHorizontal ? "Width" : "Height"}`];
  }
  get scrollSize() {
    return this.scrollable[`scroll${this.isHorizontal ? "Width" : "Height"}`];
  }
  get maxPosition() {
    return this.scrollable[`max${this.isHorizontal ? "X" : "Y"}`];
  }
  scrollTo(position, options) {
    return this.isHorizontal ? this.scrollable.scrollTo(position, null, options) : this.scrollable.scrollTo(null, position, options);
  }
  scrollBy(xDelta = 0, yDelta = 0, options = defaultScrollOptions) {
    return this.isHorizontal ? this.scrollable.scrollBy(xDelta || yDelta, 0, options) : this.scrollable.scrollBy(0, yDelta || xDelta, options);
  }
  scrollIntoView() {
    return this.scrollable.scrollIntoView(...arguments);
  }
  // We accommodate mistakes. Setting X and Y sets the appropriate scroll axis position
  changeX(x) {
    this.position = x;
  }
  changeY(y) {
    this.position = y;
  }
  get x() {
    return this.position;
  }
  set x(x) {
    this.scrollable[this.isHorizontal ? "x" : "y"] = x;
  }
  get y() {
    return this.position;
  }
  set y(y) {
    this.scroller[this.isHorizontal ? "x" : "y"] = y;
  }
  get clientWidth() {
    return this.clientSize;
  }
  get clientHeight() {
    return this.clientSize;
  }
  get scrollWidth() {
    return this.scrollSize;
  }
  get scrollHeight() {
    return this.scrollSize;
  }
  get maxX() {
    return this.maxPosition;
  }
  get maxY() {
    return this.maxPosition;
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/TimelineState.js
var copyProperties = [
  "barMargin"
];
var TimelineState_default = (Target) => class TimelineState extends (Target || Base) {
  static get $name() {
    return "TimelineState";
  }
  /**
   * Gets or sets timeline's state. Check out {@link Scheduler.view.mixin.TimelineState} mixin for details.
   * @member {Object} state
   * @property {Object[]} state.columns
   * @property {Number} state.rowHeight
   * @property {Object} state.scroll
   * @property {Number} state.scroll.scrollLeft
   * @property {Number} state.scroll.scrollTop
   * @property {Array} state.selectedRecords
   * @property {String} state.style
   * @property {String} state.selectedCell
   * @property {Object} state.store
   * @property {Object} state.store.sorters
   * @property {Object} state.store.groupers
   * @property {Object} state.store.filters
   * @property {Object} state.subGrids
   * @property {Number} state.barMargin
   * @property {Number} state.zoomLevel
   * @category State
   */
  /**
   * Get timeline's current state for serialization. State includes rowHeight, headerHeight, readOnly, selectedCell,
   * selectedRecordId, column states and store state etc.
   * @returns {Object} State object to be serialized
   * @private
   */
  getState() {
    const me = this, state = ObjectHelper.copyProperties(super.getState(), me, copyProperties);
    state.zoomLevel = me.zoomLevel;
    state.zoomLevelOptions = {
      startDate: me.startDate,
      endDate: me.endDate,
      // With infinite scroll reading viewportCenterDate too early will lead to exception
      centerDate: !me.infiniteScroll || me.timeAxisViewModel.availableSpace ? me.viewportCenterDate : void 0,
      width: me.tickSize
    };
    return state;
  }
  /**
   * Apply previously stored state.
   * @param {Object} state
   * @private
   */
  applyState(state) {
    var _a;
    const me = this;
    me.suspendRefresh();
    ObjectHelper.copyProperties(me, state, copyProperties);
    super.applyState(state);
    if (state.zoomLevel != null) {
      if (me.infiniteScroll) {
        if ((_a = state == null ? void 0 : state.scroll) == null ? void 0 : _a.scrollLeft) {
          state.scroll.scrollLeft = {};
        }
      }
      if (me.isPainted) {
        me.zoomToLevel(state.zoomLevel, state.zoomLevelOptions);
      } else {
        me._zoomAfterPaint = { zoomLevel: state.zoomLevel, zoomLevelOptions: state.zoomLevelOptions };
      }
    }
    me.resumeRefresh(true);
  }
  onInternalPaint(...args) {
    super.onInternalPaint(...args);
    if (this._zoomAfterPaint) {
      const { zoomLevel, zoomLevelOptions } = this._zoomAfterPaint;
      this.zoomToLevel(zoomLevel, zoomLevelOptions);
      delete this._zoomAfterPaint;
    }
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/Header.js
var Header2 = class extends Header {
  static get $name() {
    return "SchedulerHeader";
  }
  refreshContent() {
    var _a;
    if (!((_a = this.headersElement) == null ? void 0 : _a.querySelector(".b-sch-timeaxiscolumn"))) {
      super.refreshContent();
    }
  }
};
Header2._$name = "Header";

// ../Scheduler/lib/Scheduler/view/TimeAxisSubGrid.js
var TimeAxisSubGrid = class extends SubGrid {
  static get $name() {
    return "TimeAxisSubGrid";
  }
  // Factoryable type name
  static get type() {
    return "timeaxissubgrid";
  }
  static get configurable() {
    return {
      // A Scheduler's SubGrid doesn't accept external columns moving in
      sealedColumns: true,
      // Use Scheduler's Header class
      headerClass: Header2
    };
  }
  startConfigure(config) {
    const { grid: scheduler } = config;
    scheduler.timeAxisSubGrid = this;
    super.startConfigure(config);
    if (scheduler.isHorizontal) {
      config.header = {
        cls: {
          "b-sticky-headers": scheduler.stickyHeaders
        }
      };
      delete config.headerClass;
    }
    if (!("flex" in config || "width" in config)) {
      config.flex = 1;
    }
  }
  changeScrollable() {
    const me = this, scrollable = super.changeScrollable(...arguments);
    if (scrollable) {
      Object.defineProperty(scrollable, "scrollWidth", {
        get() {
          var _a, _b;
          return (_b = (_a = this.element) == null ? void 0 : _a.scrollWidth) != null ? _b : 0;
        },
        set() {
          me.grid.updateCanvasSize();
        }
      });
    }
    return scrollable;
  }
  handleHorizontalScroll(addCls = true) {
    if (!this.grid._viewPresetChanging) {
      super.handleHorizontalScroll(addCls);
    }
  }
  /**
   * This is an event handler triggered when the TimeAxisSubGrid changes size.
   * Its height changes when content height changes, and that is not what we are
   * interested in here. If the *width* changes, that means the visible viewport
   * has changed size.
   * @param {HTMLElement} element
   * @param {Number} width
   * @param {Number} height
   * @param {Number} oldWidth
   * @param {Number} oldHeight
   * @private
   */
  onInternalResize(element, width, height, oldWidth, oldHeight) {
    const me = this;
    super.onInternalResize(...arguments);
    if (me.isPainted && width !== oldWidth) {
      const scheduler = me.grid, bodyHeight = scheduler._bodyRectangle.height, shouldSuspend = me.monitorResize && DomHelper.scrollBarWidth && width < oldWidth;
      if (shouldSuspend) {
        me.monitorResize = false;
      }
      scheduler.onSchedulerViewportResize(width, bodyHeight, oldWidth, bodyHeight);
      if (shouldSuspend) {
        queueMicrotask(() => me.monitorResize = true);
      }
    }
  }
  get headerScrollWidth() {
    return this.grid.isVertical ? super.headerScrollWidth : this.grid.timeAxisViewModel.totalSize;
  }
  // When restoring state we need to update time axis size immediately, resize event is not triggered fast enough to
  // restore center date consistently
  clearWidthCache() {
    super.clearWidthCache();
    if (this.owner.isHorizontal) {
      this.owner.updateViewModelAvailableSpace(this.width);
    }
  }
  async expand() {
    const { owner } = this;
    await super.expand();
    if (owner.isPainted) {
      owner.timeAxisViewModel.update(this.width, false, true);
    }
  }
};
TimeAxisSubGrid.initClass();
TimeAxisSubGrid._$name = "TimeAxisSubGrid";

// ../Scheduler/lib/Scheduler/view/TimelineBase.js
var exitTransition = {
  fn: "exitTransition",
  delay: 0,
  cancelOutstanding: true
};
var inRange = (v, r0, r1) => r0 == null ? r1 == null || v < r1 : r1 == null ? v >= r0 : r0 < r1 ? r0 <= v && v < r1 : v < r1 || r0 <= v;
var isWorkingTime = (d, wt) => inRange(d.getDay(), wt.fromDay, wt.toDay) && inRange(d.getHours(), wt.fromHour, wt.toHour);
var emptyObject = {};
var TimelineBase = class extends GridBase.mixin(
  TimelineDateMapper_default,
  TimelineDomEvents_default,
  TimelineEventRendering_default,
  TimelineZoomable_default,
  TimelineScroll_default,
  TimelineState_default,
  TimelineViewPresets_default,
  RecurringEvents_default
) {
  constructor() {
    super(...arguments);
    __publicField(this, "timeCellSelector", null);
    __publicField(this, "_animationSuspendedCounter", 0);
  }
  static get defaultConfig() {
    return {
      /**
       * A valid JS day index between 0-6 (0: Sunday, 1: Monday etc.) to be considered the start day of the week.
       * When omitted, the week start day is retrieved from the active locale class.
       * @config {Number} weekStartDay
       * @category Time axis
       */
      /**
       * An object with format `{ fromDay, toDay, fromHour, toHour }` that describes the working days and hours.
       * This object will be used to populate TimeAxis {@link Scheduler.data.TimeAxis#config-include} property.
       *
       * Using it results in a non-continuous time axis. Any ticks not covered by the working days and hours will
       * be excluded. Events within larger ticks (for example if using week as the unit for ticks) will be
       * stretched to fill the gap otherwise left by the non working hours.
       *
       * As with end dates, `toDay` and `toHour` are exclusive. Thus `toDay : 6` means that day 6 (saturday) will
       * not be included.
       *
       *
       * **NOTE:** When this feature is enabled {@link Scheduler.view.mixin.TimelineZoomable Zooming feature} is
       * not supported. It's recommended to disable zooming controls:
       *
       * ```javascript
       * new Scheduler({
       *     zoomOnMouseWheel          : false,
       *     zoomOnTimeAxisDoubleClick : false,
       *     ...
       * });
       * ```
       *
       * @config {Object}
       * @category Time axis
       */
      workingTime: null,
      /**
       * A backing data store of 'ticks' providing the input date data for the time axis of timeline panel.
       * @member {Scheduler.data.TimeAxis} timeAxis
       * @readonly
       * @category Time axis
       */
      /**
       * A {@link Scheduler.data.TimeAxis} config object or instance, used to create a backing data store of
       * 'ticks' providing the input date data for the time axis of timeline panel. Created automatically if none
       * supplied.
       * @config {TimeAxisConfig|Scheduler.data.TimeAxis}
       * @category Time axis
       */
      timeAxis: null,
      /**
       * The backing view model for the visual representation of the time axis.
       * Either a real instance or a simple config object.
       * @private
       * @config {Scheduler.view.model.TimeAxisViewModel|TimeAxisViewModelConfig}
       * @category Time axis
       */
      timeAxisViewModel: null,
      /**
       * You can set this option to `false` to make the timeline panel start and end on the exact provided
       * {@link #config-startDate}/{@link #config-endDate} w/o adjusting them.
       * @config {Boolean}
       * @default
       * @category Time axis
       */
      autoAdjustTimeAxis: true,
      /**
       * Affects drag drop and resizing of events when {@link Scheduler/view/mixin/TimelineDateMapper#config-snap}
       * is enabled.
       *
       * If set to `true`, dates will be snapped relative to event start. e.g. for a zoom level with
       * `timeResolution = { unit: "s", increment: "20" }`, an event that starts at 10:00:03 and is dragged would
       * snap its start date to 10:00:23, 10:00:43 etc.
       *
       * When set to `false`, dates will be snapped relative to the timeAxis startDate (tick start)
       * - 10:00:03 -> 10:00:20, 10:00:40 etc.
       *
       * @config {Boolean}
       * @default
       * @category Scheduled events
       */
      snapRelativeToEventStartDate: false,
      /**
       * Set to `true` to prevent auto calculating of a minimal {@link Scheduler.view.mixin.TimelineEventRendering#property-tickSize}
       * to always fit the content to the screen size. Setting this property on `true` will disable {@link #config-forceFit} behaviour.
       * @config {Boolean}
       * @default false
       * @category Time axis
       */
      suppressFit: false,
      /**
       * CSS class to add to cells in the timeaxis column
       * @config {String}
       * @category CSS
       * @private
       */
      timeCellCls: null,
      scheduledEventName: null,
      //dblClickTime : 200,
      /**
       * A CSS class to apply to each event in the view on mouseover.
       * @config {String}
       * @category CSS
       * @private
       */
      overScheduledEventClass: null,
      // allow the panel to prevent adding the hover CSS class in some cases - during drag drop operations
      preventOverCls: false,
      /**
       * Set to `false` if you don't want event bar DOM updates to animate.
       * @prp {Boolean}
       * @default true
       * @category Scheduled events
       */
      enableEventAnimations: true,
      disableGridRowModelWarning: true,
      // does not look good with locked columns and also interferes with event animations
      animateRemovingRows: false,
      schedulerRegion: "normal",
      transitionDuration: 200,
      // internal timer id reference
      animationTimeout: null,
      /**
       * Region to which columns are added when they have none specified
       * @config {String}
       * @default
       * @category Misc
       */
      defaultRegion: "locked",
      /**
       * Decimal precision used when displaying durations, used by tooltips and DurationColumn.
       * Specify `false` to use raw value
       * @config {Number|Boolean}
       * @default
       * @category Common
       */
      durationDisplayPrecision: 1,
      asyncEventSuffix: "PreCommit"
    };
  }
  updateTimeZone(timeZone) {
    if (this.project) {
      if (this.isConfiguring) {
        this.project._isConfiguringTimeZone = true;
      }
      this.project.timeZone = timeZone;
    }
  }
  get timeZone() {
    var _a;
    return (_a = this.project) == null ? void 0 : _a.timeZone;
  }
  //endregion
  //region Feature hooks
  /**
   * Populates the event context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown.
   * @param {Scheduler.model.EventModel} options.eventRecord The context event.
   * @param {Scheduler.model.ResourceModel} options.resourceRecord The context resource.
   * @param {Scheduler.model.AssignmentModel} options.assignmentRecord The context assignment if any.
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items.
   * @internal
   */
  populateEventMenu() {
  }
  /**
   * Populates the time axis context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown.
   * @param {Scheduler.model.ResourceModel} options.resourceRecord The context resource.
   * @param {Date} options.date The Date corresponding to the mouse position in the time axis.
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items.
   * @internal
   */
  populateScheduleMenu() {
  }
  // Called when visible date range potentially changes such as when scrolling in
  // the time axis.
  internalOnVisibleDateRangeChange(range) {
    if (!this.handlingVisibleDateRangeChange) {
      const me = this, { _visibleDateRange } = me, dateRangeChange = !_visibleDateRange || (_visibleDateRange.startDate - range.startDate || _visibleDateRange.endDate - range.endDate);
      if (dateRangeChange) {
        me.timeView.range = range;
        me.handlingVisibleDateRangeChange = true;
        me.trigger("visibleDateRangeChange", {
          old: _visibleDateRange,
          new: range
        });
        me.handlingVisibleDateRangeChange = false;
        me._visibleDateRange = range;
      }
    }
  }
  // Called when visible resource range changes in vertical mode
  onVisibleResourceRangeChange() {
  }
  //endregion
  //region Init
  construct(config = {}) {
    const me = this;
    super.construct(config);
    me.$firstVerticalOverflow = true;
    me.initDomEvents();
    me.currentOrientation.init();
    me.rowManager.ion({
      refresh: () => {
        me.forceLayout = false;
      }
    });
  }
  // Override from Grid.view.GridSubGrids
  createSubGrid(region, config = {}) {
    const me = this, { stickyHeaders } = me;
    if (region === (me.schedulerRegion || "normal")) {
      config.type = "timeaxissubgrid";
    } else if (region === "locked" && stickyHeaders && me.isVertical) {
      config.scrollable = {
        overflowX: "visible",
        overflowY: "visible"
      };
      me.bodyContainer.classList.add("b-sticky-headers");
    }
    return super.createSubGrid(region, config);
  }
  doDestroy() {
    const me = this, { partneredWith, currentOrientation } = me;
    currentOrientation == null ? void 0 : currentOrientation.destroy();
    if (partneredWith) {
      partneredWith.forEach((p) => {
        me.removePartner(p);
      });
      partneredWith.destroy();
    } else {
      me.timeAxisViewModel.destroy();
      me.timeAxis.destroy();
    }
    super.doDestroy();
  }
  startConfigure(config) {
    super.startConfigure(config);
    ResizeMonitor.addResizeListener(this.bodyContainer, this.onBodyResize.bind(this));
    this.getConfig("partner");
  }
  changeStartDate(startDate) {
    if (typeof startDate === "string") {
      startDate = DateHelper.parse(startDate);
    }
    return startDate;
  }
  onInternalPaint({ firstPaint }) {
    var _a, _b;
    if (firstPaint) {
      const me = this, scrollable = me.isHorizontal ? me.timeAxisSubGrid.scrollable : me.scrollable, availableSpace = scrollable.element.getBoundingClientRect()[me.isHorizontal ? "width" : "height"];
      me.timeAxisViewModel.update(availableSpace, me.infiniteScroll, true);
      if (me.infiniteScroll) {
        (_b = (_a = me.currentOrientation).doUpdateTimeView) == null ? void 0 : _b.call(_a);
      }
      me.getConfig("hideRowHover");
    }
    super.onInternalPaint(...arguments);
  }
  onSchedulerHorizontalScroll(subGrid, scrollLeft, scrollX, scrollingToCenter) {
    this.currentOrientation.updateFromHorizontalScroll(scrollX);
    super.onSchedulerHorizontalScroll(subGrid, scrollLeft, scrollX, scrollingToCenter);
  }
  /**
   * Overrides initScroll from Grid, listens for horizontal scroll to do virtual event rendering
   * @private
   */
  initScroll() {
    const me = this;
    let frameCount = 0;
    super.initScroll();
    me.ion({
      horizontalScroll: ({ subGrid, scrollLeft, scrollX, scrollingToCenter }) => {
        if (me.isPainted && subGrid === me.timeAxisSubGrid && !me.isDestroying && !me.refreshSuspended) {
          me.onSchedulerHorizontalScroll(subGrid, scrollLeft, scrollX, scrollingToCenter);
        }
        frameCount++;
      }
    });
    if (me.testPerformance === "horizontal") {
      me.setTimeout(() => {
        const start = performance.now();
        let scrollSpeed = 5, direction = 1;
        const scrollInterval = me.setInterval(() => {
          scrollSpeed = scrollSpeed + 5;
          me.scrollX += (10 + Math.floor(scrollSpeed)) * direction;
          if (direction === 1 && me.scrollX > 5500) {
            direction = -1;
            scrollSpeed = 5;
          }
          if (direction === -1 && me.scrollX <= 0) {
            const done = performance.now(), elapsed = done - start;
            const timePerFrame = elapsed / frameCount, fps = Math.round(1e3 / timePerFrame * 10) / 10;
            clearInterval(scrollInterval);
            console.log(me.eventPositionMode, me.eventScrollMode, fps + "fps");
          }
        }, 0);
      }, 500);
    }
  }
  //endregion
  /**
   * Calls the specified function (returning its return value) and preserves the timeline center
   * point. This is a useful way of retaining the user's visual context while making updates
   * and changes to the view which require major changes or a full refresh.
   * @param {Function} fn The function to call.
   * @param {Object} thisObj The `this` context for the function.
   * @param {...*} args Parameters to the function.
   */
  preserveViewCenter(fn, thisObj = this, ...args) {
    const me = this, centerDate = me.viewportCenterDate, result = fn.apply(thisObj, args), scroller = me.timelineScroller, { clientSize } = scroller, scrollStart = Math.max(Math.floor(me.getCoordinateFromDate(centerDate, true) - clientSize / 2), 0);
    scroller.scrollTo(scrollStart, { scrollingToCenter: true });
    return result;
  }
  /**
   * Changes this Scheduler's time axis timespan to the supplied start and end dates.
   *
   * @async
   * @param {Date} newStartDate The new start date
   * @param {Date} newEndDate The new end date
   * @param {Object} [options] An object containing modifiers for the time span change operation.
   * @param {Boolean} [options.maintainVisibleStart] Specify as `true` to keep the visible start date stable.
   * @param {Date} [options.visibleDate] The date inside the range to scroll into view
   */
  setTimeSpan(newStartDate, newEndDate, options = emptyObject) {
    const me = this, { timeAxis } = me, {
      preventThrow = false,
      // Private, only used by the shift method.
      maintainVisibleStart: maintainVisibleStart2 = false,
      visibleDate
    } = options, {
      startDate,
      endDate
    } = timeAxis.getAdjustedDates(newStartDate, newEndDate), startChanged = timeAxis.startDate - startDate !== 0, endChanged = timeAxis.endDate - endDate !== 0;
    if (startChanged || endChanged) {
      if (maintainVisibleStart2) {
        const {
          timeAxisViewModel
        } = me, { totalSize } = timeAxisViewModel, oldTickSize = timeAxisViewModel.tickSize, scrollable = me.timelineScroller, currentScroll = scrollable.position, visibleStart = timeAxisViewModel.getDateFromPosition(currentScroll);
        if (visibleStart >= startDate && visibleStart < endDate) {
          timeAxisViewModel.ion({
            update() {
              const tickSizeChanged = timeAxisViewModel.tickSize !== oldTickSize;
              me.updateCanvasSize();
              if (startChanged && !endChanged && !tickSizeChanged) {
                scrollable.position += timeAxisViewModel.totalSize - totalSize;
              } else if (!startChanged && !tickSizeChanged) {
                scrollable.position = currentScroll;
              } else {
                scrollable.position = timeAxisViewModel.getPositionFromDate(visibleStart);
              }
              scrollable.syncPartners(true);
            },
            prio: 1e4,
            once: true
          });
        }
      }
      const returnValue = timeAxis.reconfigure({
        startDate,
        endDate
      }, false, preventThrow);
      if (visibleDate) {
        return me.scrollToDate(visibleDate, options).then(() => returnValue);
      }
      return returnValue;
    }
  }
  //region Config getters/setters
  /**
   * Returns `true` if any of the events/tasks or feature injected elements (such as ResourceTimeRanges) are within
   * the {@link #config-timeAxis}
   * @property {Boolean}
   * @readonly
   * @category Scheduled events
   */
  get hasVisibleEvents() {
    return !this.noFeatureElementsInAxis() || this.eventStore.storage.values.some((t) => this.timeAxis.isTimeSpanInAxis(t));
  }
  // Template function to be chained in features to determine if any elements are in time axis (needed since we cannot
  // currently chain getters). Negated to not break chain. First feature that has elements visible returns false,
  // which prevents other features from being queried.
  noFeatureElementsInAxis() {
  }
  // Private getter used to piece together event names such as beforeEventDrag / beforeTaskDrag. Could also be used
  // in templates.
  get capitalizedEventName() {
    if (!this._capitalizedEventName) {
      this._capitalizedEventName = StringHelper.capitalize(this.scheduledEventName);
    }
    return this._capitalizedEventName;
  }
  updatePartner(partner) {
    if (partner) {
      this.addPartner(partner);
    }
  }
  /**
   * Partners this Timeline with the passed Timeline in order to sync the horizontal scrolling position and zoom level.
   *
   * - To remove existing partner see {@link #function-removePartner} method.
   * - To get the list of partners see {@link #property-partners} getter.
   *
   * The following properties are imported into this component from the added partner and shared:
   *
   * - {@link #property-timeAxisViewModel}
   * - {@link #property-timeAxis}
   * - {@link #property-viewPreset}
   *
   * In a set of partnered Timelines, there will only be a single instance of the above properties.
   * The time range and scroll position in that time range are always the same among all
   * partnered timelines.
   *
   * @param {Scheduler.view.TimelineBase} otherTimeline The timeline to partner with
   */
  addPartner(partner) {
    const me = this;
    if (!me.isPartneredWith(partner)) {
      if (me._partner == null) {
        me._partner = partner;
      }
      const partneredWith = me.partneredWith || (me.partneredWith = new Collection());
      partneredWith.add(partner);
      (partner.partneredWith || (partner.partneredWith = new Collection())).add(me);
      me.getConfig("viewPreset");
      me.getConfig("infiniteScroll");
      partner.ion({
        presetchange: "onPartnerPresetChange",
        thisObj: me
      });
      partner.scrollable.ion({
        overflowChange: "onPartnerOverflowChange",
        thisObj: me
      });
      const partnerSharedConfig = me.partnerSharedConfigs.reduce((config, configName) => {
        config[configName] = partner[configName];
        return config;
      }, {});
      partnerSharedConfig.viewPreset.options = {
        scrollPosition: partner.timelineScroller.position,
        tickSize: partner.tickSize
      };
      me.setConfig(partnerSharedConfig);
      me.ion({
        presetchange: "onPartnerPresetChange",
        thisObj: partner
      });
      me.scrollable.ion({
        overflowChange: "onPartnerOverflowChange",
        thisObj: partner
      });
      if (me.isPainted) {
        partner.scrollable.addPartner(me.scrollable, me.isHorizontal ? "x" : "y");
        partner.syncPartnerSubGrids();
      } else {
        me.initScroll = FunctionHelper.createSequence(me.initScroll, () => {
          partner.scrollable.addPartner(me.scrollable, me.isHorizontal ? "x" : "y");
          partner.syncPartnerSubGrids();
        }, me);
      }
    }
  }
  /**
   * Breaks the link between current Timeline and the passed Timeline
   *
   * - To add a new partner see {@link #function-addPartner} method.
   * - To get the list of partners see {@link #property-partners} getter.
   *
   * @param {Scheduler.view.TimelineBase} otherTimeline The timeline to unlink from
   */
  removePartner(partner) {
    const me = this, { partneredWith } = me;
    if (me.isPartneredWith(partner)) {
      if (me._partner === partner) {
        me._partner = null;
      }
      partneredWith.remove(partner);
      me.scrollable.removePartner(partner.scrollable);
      me.un({
        presetchange: "onPartnerPresetChange",
        thisObj: partner
      });
      me.scrollable.un({
        overflowChange: "onPartnerOverflowChange",
        thisObj: partner
      });
      partner.removePartner(me);
    }
  }
  /**
   * Checks whether the passed timeline is partnered with the current timeline.
   * @param {Scheduler.view.TimelineBase} partner The timeline to check the partnering with
   * @returns {Boolean} Returns `true` if the timelines are partnered
   */
  isPartneredWith(partner) {
    var _a;
    return Boolean((_a = this.partneredWith) == null ? void 0 : _a.includes(partner));
  }
  /**
   * Called when a partner scheduler changes its overflowing state. The scrollable
   * of a Grid/Scheduler only handles overflowY, so this will mean the addition
   * or removal of a vertical scrollbar.
   *
   * All partners must stay in sync. If another parter has a vertical scrollbar
   * and we do not, we must set our overflowY to 'scroll' so that we show an empty
   * scrollbar to keep widths synchronized.
   * @param {Object} event A {@link Core.helper.util.Scroller#event-overflowChange} event
   * @internal
   */
  onPartnerOverflowChange({ source: otherScrollable, y }) {
    const { scrollable } = this, ourY = scrollable.hasOverflow("y") || scrollable.overflowY === "scroll";
    if (ourY !== y) {
      if (scrollable.overflowY === "scroll") {
        scrollable.overflowY = true;
        this.refreshVirtualScrollbars();
      } else if (ourY) {
        otherScrollable.overflowY = "scroll";
      } else {
        otherScrollable.overflowY = true;
        scrollable.overflowY = "scroll";
        this.refreshVirtualScrollbars();
      }
    } else {
      scrollable.overflowY = true;
    }
  }
  onPartnerPresetChange({ preset, startDate, endDate, centerDate, zoomDate, zoomPosition, zoomLevel }) {
    if (!this._viewPresetChanging && this.viewPreset !== preset) {
      preset.options = {
        startDate,
        endDate,
        centerDate,
        zoomDate,
        zoomPosition,
        zoomLevel
      };
      this.viewPreset = preset;
    }
  }
  /**
   * Returns the partnered timelines.
   *
   * - To add a new partner see {@link #function-addPartner} method.
   * - To remove existing partner see {@link #function-removePartner} method.
   *
   * @readonly
   * @member {Scheduler.view.TimelineBase[]} partners
   * @category Time axis
   */
  get partners() {
    const partners = this.partner ? [this.partner] : [];
    if (this.partneredWith) {
      partners.push.apply(partners, this.partneredWith.allValues);
    }
    return [...new Set(partners)];
  }
  get timeAxisColumn() {
    return this.columns && this._timeAxisColumn;
  }
  changeColumns(columns, currentStore) {
    const me = this;
    let timeAxisColumnIndex, timeAxisColumnConfig;
    if (columns) {
      const isArray = Array.isArray(columns);
      let cols = columns;
      if (!isArray) {
        cols = columns.data;
      }
      timeAxisColumnIndex = cols && cols.length;
      cols.some((col, index) => {
        if (col.type === "timeAxis") {
          timeAxisColumnIndex = index;
          timeAxisColumnConfig = ObjectHelper.assign(col, me.timeAxisColumn);
          return true;
        }
        return false;
      });
      if (me.isVertical) {
        cols = [
          ObjectHelper.assign({
            type: "verticalTimeAxis"
          }, me.verticalTimeAxisColumn),
          // Make space for a regular TimeAxisColumn after the VerticalTimeAxisColumn
          cols[timeAxisColumnIndex]
        ];
        timeAxisColumnIndex = 1;
      } else {
        cols = cols.slice();
      }
      cols[timeAxisColumnIndex] = this._timeAxisColumn || {
        type: "timeAxis",
        cellCls: me.timeCellCls,
        mode: me.mode,
        ...timeAxisColumnConfig
      };
      if (isArray || columns.isStore && columns.owner !== this) {
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
      const me = this, timeAxisColumn = me._timeAxisColumn = me.columns.find((c) => c.isTimeAxisColumn);
      if (me.isVertical) {
        me.verticalTimeAxisColumn = me.columns.find((c) => c.isVerticalTimeAxisColumn);
        me.verticalTimeAxisColumn.relayAll(me);
      }
      timeAxisColumn.relayAll(me);
    }
  }
  onColumnsChanged({ action, changes, record: column, records }) {
    var _a;
    const { timeAxisColumn, columns } = this;
    if ((action === "dataset" || action === "batch") && !columns.includes(timeAxisColumn)) {
      columns.add(timeAxisColumn, true);
    } else if (column === timeAxisColumn && "width" in changes) {
      this.updateCanvasSize();
    }
    column && ((_a = this.partneredWith) == null ? void 0 : _a.forEach((partner) => {
      const partnerColumn = partner.columns.getAt(column.allIndex);
      if (partnerColumn == null ? void 0 : partnerColumn.shouldSync(column)) {
        const partnerChanges = {};
        for (const k in changes) {
          partnerChanges[k] = changes[k].value;
        }
        partnerColumn.set(partnerChanges);
      }
    }));
    super.onColumnsChanged(...arguments);
  }
  get timeView() {
    var _a, _b;
    const me = this;
    return me.columns && me.isVertical ? (_a = me.verticalTimeAxisColumn) == null ? void 0 : _a.view : (_b = me.timeAxisColumn) == null ? void 0 : _b.timeAxisView;
  }
  updateEventCls(eventCls) {
    const me = this;
    if (!me.eventSelector) {
      me.unreleasedEventSelector = me.eventSelector = `.${eventCls}-wrap`;
    }
    if (!me.eventInnerSelector) {
      me.eventInnerSelector = `.${eventCls}`;
    }
  }
  set timeAxisViewModel(timeAxisViewModel) {
    const me = this, currentModel = me._timeAxisViewModel, tavmListeners = {
      name: "timeAxisViewModel",
      update: "onTimeAxisViewModelUpdate",
      prio: 100,
      thisObj: me
    };
    if (me.partner && !timeAxisViewModel || currentModel && currentModel === timeAxisViewModel) {
      return;
    }
    if ((currentModel == null ? void 0 : currentModel.owner) === me) {
      currentModel.destroy();
    }
    me.detachListeners("timeAxisViewModel");
    if (timeAxisViewModel == null ? void 0 : timeAxisViewModel.isTimeAxisViewModel) {
      timeAxisViewModel.ion(tavmListeners);
    } else {
      timeAxisViewModel = TimeAxisViewModel.new({
        mode: me._mode,
        snap: me.snap,
        forceFit: me.forceFit,
        timeAxis: me.timeAxis,
        suppressFit: me.suppressFit,
        internalListeners: tavmListeners,
        owner: me
      }, timeAxisViewModel);
    }
    if (!me.isConfiguring) {
      if (me.isHorizontal) {
        me.timeAxisColumn.timeAxisViewModel = timeAxisViewModel;
      } else {
        me.verticalTimeAxisColumn.view.model = timeAxisViewModel;
      }
    }
    me._timeAxisViewModel = timeAxisViewModel;
    me.relayEvents(timeAxisViewModel, ["update"], "timeAxisViewModel");
    if (currentModel && timeAxisViewModel) {
      me.trigger("timeAxisViewModelChange", { timeAxisViewModel });
    }
  }
  /**
   * The internal view model, describing the visual representation of the time axis.
   * @property {Scheduler.view.model.TimeAxisViewModel}
   * @readonly
   * @category Time axis
   */
  get timeAxisViewModel() {
    if (!this._timeAxisViewModel) {
      this.timeAxisViewModel = null;
    }
    return this._timeAxisViewModel;
  }
  get suppressFit() {
    var _a, _b;
    return (_b = (_a = this._timeAxisViewModel) == null ? void 0 : _a.suppressFit) != null ? _b : this._suppressFit;
  }
  set suppressFit(value) {
    if (this._timeAxisViewModel) {
      this.timeAxisViewModel.suppressFit = value;
    } else {
      this._suppressFit = value;
    }
  }
  set timeAxis(timeAxis) {
    const me = this, currentTimeAxis = me._timeAxis, timeAxisListeners = {
      name: "timeAxis",
      reconfigure: "onTimeAxisReconfigure",
      thisObj: me
    };
    if (me.partner && !timeAxis || currentTimeAxis && currentTimeAxis === timeAxis) {
      return;
    }
    if (currentTimeAxis) {
      if (currentTimeAxis.owner === me) {
        currentTimeAxis.destroy();
      }
    }
    me.detachListeners("timeAxis");
    if (!(timeAxis == null ? void 0 : timeAxis.isTimeAxis)) {
      timeAxis = ObjectHelper.assign({
        owner: me,
        viewPreset: me.viewPreset,
        autoAdjust: me.autoAdjustTimeAxis,
        weekStartDay: me.weekStartDay,
        forceFullTicks: me.fillTicks && me.snap
      }, timeAxis);
      if (me.startDate) {
        timeAxis.startDate = me.startDate;
      }
      if (me.endDate) {
        timeAxis.endDate = me.endDate;
      }
      if (me.workingTime) {
        me.applyWorkingTime(timeAxis);
      }
      timeAxis = new TimeAxis(timeAxis);
    }
    timeAxis.ion(timeAxisListeners);
    me._timeAxis = timeAxis;
  }
  onTimeAxisReconfigure({ config, oldConfig }) {
    if (config) {
      const dateRangeChange = !oldConfig || (oldConfig.startDate - config.startDate || oldConfig.endDate - config.endDate);
      if (dateRangeChange) {
        this.trigger("dateRangeChange", {
          old: {
            startDate: oldConfig.startDate,
            endDate: oldConfig.endDate
          },
          new: {
            startDate: config.startDate,
            endDate: config.endDate
          }
        });
      }
    }
    this.trigger("timeAxisChange", { config });
  }
  get timeAxis() {
    if (!this._timeAxis) {
      this.timeAxis = null;
    }
    return this._timeAxis;
  }
  updateForceFit(value) {
    if (this._timeAxisViewModel) {
      this._timeAxisViewModel.forceFit = value;
    }
  }
  /**
   * Get/set working time. Assign `null` to stop using working time. See {@link #config-workingTime} config for details.
   * @property {Object}
   * @category Scheduled events
   */
  set workingTime(config) {
    this._workingTime = config;
    if (!this.isConfiguring) {
      this.applyWorkingTime(this.timeAxis);
    }
  }
  get workingTime() {
    return this._workingTime;
  }
  // Translates the workingTime configs into TimeAxis#include rules, applies them and then refreshes the header and
  // redraws the events
  applyWorkingTime(timeAxis) {
    var _a;
    const me = this, config = me._workingTime;
    if (config) {
      let hour = null;
      if (config.fromHour >= 0 && config.fromHour < 24 && config.toHour > config.fromHour && config.toHour <= 24 && config.toHour - config.fromHour < 24) {
        hour = { from: config.fromHour, to: config.toHour };
      }
      let day = null;
      if (config.fromDay >= 0 && config.fromDay < 7 && config.toDay > config.fromDay && config.toDay <= 7 && config.toDay - config.fromDay < 7) {
        day = { from: config.fromDay, to: config.toDay };
      }
      if (hour || day) {
        timeAxis.include = {
          hour,
          day
        };
      } else {
        timeAxis.include = null;
      }
    } else {
      timeAxis.include = null;
    }
    if (me.isPainted) {
      me.timeAxisColumn.refreshHeader();
      (_a = me.features.columnLines) == null ? void 0 : _a.refresh();
      me.refreshWithTransition();
    }
  }
  updateStartDate(date) {
    this.setStartDate(date);
  }
  /**
   * Sets the timeline start date.
   *
   * **Note:**
   * - If you need to set start and end date at the same time, use the {@link #function-setTimeSpan} method.
   * - If keepDuration is false and new start date is greater than end date, it will throw an exception.
   *
   * @param {Date} date The new start date
   * @param {Boolean} keepDuration Pass `true` to keep the duration of the timeline ("move" the timeline),
   * `false` to change the duration ("resize" the timeline). Defaults to `true`.
   */
  setStartDate(date, keepDuration = true) {
    const me = this, ta = me._timeAxis, {
      startDate,
      endDate,
      mainUnit
    } = ta || emptyObject;
    if (typeof date === "string") {
      date = DateHelper.parse(date);
    }
    if (ta && endDate) {
      if (date) {
        let calcEndDate = endDate;
        if (keepDuration && startDate) {
          const diff = DateHelper.diff(startDate, endDate, mainUnit, true);
          calcEndDate = DateHelper.add(date, diff, mainUnit);
        }
        me.setTimeSpan(date, calcEndDate);
      }
    } else {
      me._tempStartDate = date;
    }
  }
  get startDate() {
    var _a;
    let ret = ((_a = this._timeAxis) == null ? void 0 : _a.startDate) || this._tempStartDate;
    if (!ret) {
      ret = /* @__PURE__ */ new Date();
      const { workingTime } = this;
      if (workingTime) {
        while (!isWorkingTime(ret, workingTime)) {
          ret.setHours(ret.getHours() + 1);
        }
      }
      this._tempStartDate = ret;
    }
    return ret;
  }
  changeEndDate(date) {
    if (typeof date === "string") {
      date = DateHelper.parse(date);
    }
    this.setEndDate(date);
  }
  /**
   * Sets the timeline end date
   *
   * **Note:**
   * - If you need to set start and end date at the same time, use the {@link #function-setTimeSpan} method.
   * - If keepDuration is false and new end date is less than start date, it will throw an exception.
   *
   * @param {Date} date The new end date
   * @param {Boolean} keepDuration Pass `true` to keep the duration of the timeline ("move" the timeline),
   * `false` to change the duration ("resize" the timeline). Defaults to `false`.
   */
  setEndDate(date, keepDuration = false) {
    const me = this, ta = me._timeAxis, {
      startDate,
      endDate,
      mainUnit
    } = ta || emptyObject;
    if (typeof date === "string") {
      date = DateHelper.parse(date);
    }
    if (ta && startDate) {
      if (date) {
        let calcStartDate = startDate;
        if (keepDuration && endDate) {
          const diff = DateHelper.diff(startDate, endDate, mainUnit, true);
          calcStartDate = DateHelper.add(date, -diff, mainUnit);
        }
        me.setTimeSpan(calcStartDate, date);
      }
    } else {
      me._tempEndDate = date;
    }
  }
  get endDate() {
    const me = this;
    if (me._timeAxis) {
      return me._timeAxis.endDate;
    }
    return me._tempEndDate || DateHelper.add(me.startDate, me.viewPreset.defaultSpan, me.viewPreset.mainHeader.unit);
  }
  changeVisibleDate(options) {
    if (options instanceof Date) {
      return { date: options, block: this.isConfiguring ? "start" : "nearest" };
    }
    if (options instanceof Object) {
      return {
        date: options.date,
        block: options.block || this.isConfiguring ? "start" : "nearest",
        ...options
      };
    }
  }
  updateVisibleDate(options) {
    const me = this;
    if (!(me.infiniteScroll && me.isConfiguring)) {
      if (me.isPainted) {
        me.scrollToDate(options.date, options);
      } else {
        me.ion({
          paint: () => me.scrollToDate(options.date, options),
          once: true
        });
      }
    }
  }
  get features() {
    return super.features;
  }
  // add region resize by default
  set features(features) {
    features = features === true ? {} : features;
    if (!("regionResize" in features)) {
      features.regionResize = true;
    }
    super.features = features;
  }
  //endregion
  //region Event handlers
  onLocaleChange() {
    super.onLocaleChange();
    const oldAutoAdjust = this.timeAxis.autoAdjust;
    this.timeAxis.reconfigure({
      autoAdjust: false
    });
    this.timeAxis.autoAdjust = oldAutoAdjust;
  }
  /**
   * Called when the element which encapsulates the Scheduler's visible height changes size.
   * We only respond to *height* changes here. The TimeAxisSubGrid monitors its own width.
   * @param {HTMLElement} element
   * @param {DOMRect} oldRect
   * @param {DOMRect} newRect
   * @private
   */
  onBodyResize(element, oldRect, { width, height }) {
    if (this.isVertical && oldRect && width !== oldRect.width) {
      delete this.timeAxisSubGrid._width;
    }
    const newWidth = this.timeAxisSubGrid.element.offsetWidth;
    if (this._bodyRectangle && oldRect && height !== oldRect.height) {
      this.onSchedulerViewportResize(newWidth, height, newWidth, oldRect.height);
    }
  }
  onSchedulerViewportResize(width, height, oldWidth, oldHeight) {
    if (this.isPainted) {
      const me = this, {
        isHorizontal,
        partneredWith
      } = me;
      me.currentOrientation.onViewportResize(width, height, oldWidth, oldHeight);
      me.updateViewModelAvailableSpace(isHorizontal ? width : Math.floor(height));
      if (partneredWith && !me.isSyncingFromPartner) {
        me.syncPartnerSubGrids();
      }
      me.trigger("timelineViewportResize", { width, height, oldWidth, oldHeight });
    }
  }
  updateViewModelAvailableSpace(space) {
    this.timeAxisViewModel.availableSpace = space;
  }
  onTimeAxisViewModelUpdate() {
    if (!this._viewPresetChanging && !this.timeAxisSubGrid.collapsed) {
      this.updateCanvasSize();
      this.currentOrientation.onTimeAxisViewModelUpdate();
    }
  }
  syncPartnerSubGrids() {
    this.partneredWith.forEach((partner) => {
      if (!partner.isSyncingFromPartner) {
        partner.isSyncingFromPartner = true;
        this.eachSubGrid((subGrid) => {
          const partnerSubGrid = partner.subGrids[subGrid.region];
          if (partnerSubGrid.width !== subGrid.width) {
            if (subGrid.collapsed) {
              partnerSubGrid.collapse();
            } else {
              if (partnerSubGrid.collapsed) {
                partnerSubGrid.expand();
              }
              if (subGrid.flex) {
                if (subGrid.flex !== partnerSubGrid.flex) {
                  partnerSubGrid.flex = subGrid.flex;
                }
              } else {
                partnerSubGrid.width = subGrid.width;
              }
            }
          }
        });
        partner.isSyncingFromPartner = false;
      }
    });
  }
  //endregion
  //region Mode
  get currentOrientation() {
    throw new Error("Implement in subclass");
  }
  // Horizontal is the default, overridden in scheduler
  get isHorizontal() {
    return true;
  }
  //endregion
  //region Canvases and elements
  get foregroundCanvas() {
    return this._foregroundCanvas;
  }
  get svgCanvas() {
    const me = this;
    if (!me._svgCanvas) {
      const svg = me._svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", IdHelper.generateId("svg"));
      svg.classList.add("b-sch-canvas", "b-sch-dependencies-canvas");
      svg.retainElement = true;
      me.timeAxisSubGridElement.appendChild(svg);
      me.trigger("svgCanvasCreated", { svg });
    }
    return me._svgCanvas;
  }
  /**
   * Returns the subGrid containing the time axis
   * @member {Grid.view.SubGrid} timeAxisSubGrid
   * @readonly
   * @category Time axis
   */
  /**
   * Returns the html element for the subGrid containing the time axis
   * @property {HTMLElement}
   * @readonly
   * @category Time axis
   */
  get timeAxisSubGridElement() {
    var _a;
    if (!this._timeAxisSubGridElement) {
      this.getConfig("regions");
      this._timeAxisSubGridElement = (_a = this.timeAxisColumn) == null ? void 0 : _a.subGridElement;
    }
    return this._timeAxisSubGridElement;
  }
  updateCanvasSize() {
    const me = this;
    let result = false;
    if (me.isVertical) {
      const { totalSize } = me.timeAxisViewModel;
      if (me.isPainted) {
        me.refreshTotalHeight(totalSize + me._rowBorderHeight, true);
      }
      if (me.suppressFit) {
        DomHelper.setLength(me.foregroundCanvas, "height", totalSize);
      }
      result = true;
    }
    return result;
  }
  /**
   * A chainable function which Features may hook to add their own content to the timeaxis header.
   * @param {Array} configs An array of domConfigs, append to it to have the config applied to the header
   */
  getHeaderDomConfigs(configs) {
  }
  /**
   * A chainable function which Features may hook to add their own content to the foreground canvas
   * @param {Array} configs An array of domConfigs, append to it to have the config applied to the foreground canvas
   */
  getForegroundDomConfigs(configs) {
  }
  //endregion
  //region Grid overrides
  async onStoreDataChange({ action }) {
    var _a;
    const me = this;
    if (me.isVisible) {
      if (action === "dataset" && ((_a = me.project) == null ? void 0 : _a.isRepopulatingStores)) {
        await me.project.await("refresh", false);
      }
      super.onStoreDataChange(...arguments);
    } else {
      me.whenVisible("refresh", me, [true]);
    }
  }
  refresh(forceLayout = true) {
    const me = this;
    if (me.isPainted && !me.refreshSuspended) {
      if (me.isVertical || me.hasVisibleEvents || me.timeAxisSubGridElement.querySelector(me.eventSelector)) {
        if (!me.project || me.isEngineReady) {
          me.refreshRows(false, forceLayout);
        } else {
          me.refreshAfterProjectRefresh = true;
          me.currentOrientation.refreshAllWhenReady = true;
        }
      } else {
        me.rowManager.trigger("refresh");
      }
    }
  }
  render() {
    const me = this, { total } = me.resourceMarginObject, schedulerEl = me.timeAxisSubGridElement;
    const fgCanvas = me._foregroundCanvas = DomHelper.createElement({
      className: "b-sch-canvas b-sch-foreground-canvas",
      style: `font-size:${me.rowHeight - total}px`,
      parent: schedulerEl
    });
    me.timeAxisSubGrid.insertRowsBefore = fgCanvas;
    if (me.isVertical && me.suppressFit) {
      me.updateCanvasSize();
    }
    super.render(...arguments);
  }
  refreshRows(returnToTop = false, reLayoutEvents = true) {
    const me = this;
    if (me.isConfiguring) {
      return;
    }
    me.currentOrientation.refreshRows(reLayoutEvents);
    super.refreshRows(returnToTop);
  }
  updateHideHeaders(hide) {
    const me = this, scrollLeft = me.isPainted ? me.scrollLeft : 0;
    super.updateHideHeaders(hide);
    if (me.isPainted) {
      if (!hide) {
        me.timeAxisColumn.refreshHeader(null, true);
      }
      me.nextAnimationFrame().then(() => me.scrollLeft = scrollLeft);
    }
  }
  updateHideRowHover(hideRowHover) {
    this.timeAxisSubGridElement.classList.toggle("b-hide-row-hover", hideRowHover);
  }
  getCellDataFromEvent(event, includeSingleAxisMatch) {
    if (includeSingleAxisMatch) {
      includeSingleAxisMatch = !Boolean(event.target.closest(".b-sch-foreground-canvas"));
    }
    return super.getCellDataFromEvent(event, includeSingleAxisMatch);
  }
  // This GridSelection override disables drag-selection in timeaxis column for scheduler and gantt
  onCellNavigate(me, from, to) {
    var _a, _b;
    const toTarget = to.target;
    if (((_a = to.cell) == null ? void 0 : _a.classList.contains("b-timeaxis-cell")) && !((_b = GlobalEvents_default.currentMouseDown) == null ? void 0 : _b.target.classList.contains("b-grid-cell"))) {
      this.preventDragSelect = true;
    }
    if ((!(toTarget == null ? void 0 : toTarget.matches(this.eventSelector)) || this.selectResourceOnEventNavigate !== false) && (!(toTarget == null ? void 0 : toTarget.matches(".b-timeaxis-cell")) || this.selectResourceOnScheduleClick !== false)) {
      super.onCellNavigate(...arguments);
    }
  }
  //endregion
  //region Other
  /**
   * Runs a function with transitions enabled (row height, event size etc.). Useful if you want to alter the UI
   * state with a transition.
   *
   * @param {Function} fn The function to run
   */
  runWithTransition(fn, duration = this.transitionDuration) {
    const me = this;
    if (me.isVisible && me._animationSuspendedCounter === 0) {
      if (duration == null || duration === true) {
        duration = me.transitionDuration;
      }
      if (duration && me.enableEventAnimations) {
        if (!me.hasTimeout("exitTransition")) {
          me.isAnimating = true;
        }
        exitTransition.delay = duration + 50;
        me.setTimeout(exitTransition);
      }
    }
    fn();
  }
  /**
   * Suspends CSS transitions after a row / event has been updated
   *
   * Multiple calls to `suspendAnimations` stack up, and will require an equal number of `resumeAnimations` calls to
   * actually resume animations.
   */
  suspendAnimations() {
    this._animationSuspendedCounter++;
  }
  /**
   * Resumes CSS transitions after a row / event has been updated
   */
  resumeAnimations() {
    this._animationSuspendedCounter--;
  }
  exitTransition() {
    this.isAnimating = false;
    this.trigger("transitionend");
  }
  // Awaited by CellEdit to make sure that the editor is not moved until row heights have transitioned, to avoid it
  // ending up misaligned
  async waitForAnimations() {
    if (!this.isEngineReady && this.project) {
      await this.project.await("dataReady", false);
    }
    await super.waitForAnimations();
  }
  /**
   * Refreshes the grid with transitions enabled.
   */
  refreshWithTransition(forceLayout, duration) {
    const me = this;
    if (!me.refreshSuspended && me.isPainted) {
      if (!me.rowManager.topRow) {
        me.rowManager.reinitialize();
      } else {
        me.runWithTransition(() => me.refresh(forceLayout), duration);
      }
    }
  }
  /**
   * Returns an object representing the visible date range
   * @property {Object}
   * @property {Date} visibleDateRange.startDate
   * @property {Date} visibleDateRange.endDate
   * @readonly
   * @category Dates
   */
  get visibleDateRange() {
    return this.currentOrientation.visibleDateRange;
  }
  // This override will force row selection on timeaxis column selection, effectively disabling cell selection there
  isRowNumberSelecting(...selectors) {
    return super.isRowNumberSelecting(...selectors) || selectors.some((cs) => {
      var _a;
      return cs.column ? cs.column.isTimeAxisColumn : (_a = cs.cell) == null ? void 0 : _a.closest(".b-timeaxis-cell");
    });
  }
  //endregion
  /**
   * Returns a rounded duration value to be displayed in UI (tooltips, labels etc)
   * @param {Number} duration The raw duration value
   * @param {Number} [nbrDecimals] The number of decimals, defaults to {@link #config-durationDisplayPrecision}
   * @returns {Number} The rounded duration
   */
  formatDuration(duration, nbrDecimals = this.durationDisplayPrecision) {
    const multiplier = Math.pow(10, nbrDecimals);
    return Math.round(duration * multiplier) / multiplier;
  }
  beginListeningForBatchedUpdates() {
    var _a;
    this.listenToBatchedUpdates = (this.listenToBatchedUpdates || 0) + 1;
    (_a = this.syncSplits) == null ? void 0 : _a.call(this, (other) => other.beginListeningForBatchedUpdates());
  }
  endListeningForBatchedUpdates() {
    var _a;
    if (this.listenToBatchedUpdates) {
      this.listenToBatchedUpdates -= 1;
    }
    (_a = this.syncSplits) == null ? void 0 : _a.call(this, (other) => other.endListeningForBatchedUpdates());
  }
  onConnectedCallback(connected, initialConnect) {
    if (connected && !initialConnect) {
      this.timeAxisSubGrid.scrollable.x += 0.5;
    }
  }
  updateRtl(rtl) {
    const me = this, { isConfiguring } = me;
    let visibleDateRange;
    if (!isConfiguring) {
      visibleDateRange = me.visibleDateRange;
    }
    super.updateRtl(rtl);
    if (!isConfiguring) {
      me.currentOrientation.clearAll();
      if (me.infiniteScroll) {
        me.shiftToDate(visibleDateRange.startDate);
        me.scrollToDate(visibleDateRange.startDate, { block: "start" });
      } else {
        me.timelineScroller.position += 0.5;
      }
    }
  }
  /**
   * Applies the start and end date to each event store request (formatted in the same way as the start date field,
   * defined in the EventStore Model class).
   * @category Data
   * @private
   */
  applyStartEndParameters(params) {
    const me = this, field = me.eventStore.modelClass.fieldMap.startDate;
    if (me.passStartEndParameters) {
      params[me.startParamName] = field.print(me.startDate);
      params[me.endParamName] = field.print(me.endDate);
    }
  }
};
//region Config
/**
 * @prp animateTreeNodeToggle
 * @hide
 */
__publicField(TimelineBase, "$name", "TimelineBase");
// Factoryable type name
__publicField(TimelineBase, "type", "timelinebase");
__publicField(TimelineBase, "configurable", {
  // Not yet supported
  animateTreeNodeToggle: false,
  partnerSharedConfigs: {
    value: ["timeAxisViewModel", "timeAxis", "viewPreset", "infiniteScroll"],
    $config: {
      merge: "distinct"
    }
  },
  /**
   * Get/set startDate. Defaults to current date if none specified.
   *
   * When using {@link #config-infiniteScroll}, use {@link #config-visibleDate} to control initially visible date
   * instead.
   *
   * **Note:** If you need to set start and end date at the same time, use {@link #function-setTimeSpan} method.
   * @member {Date} startDate
   * @category Common
   */
  /**
   * The start date of the timeline (if not configure with {@link #config-infiniteScroll}).
   *
   * If omitted, and a TimeAxis has been set, the start date of the provided {@link Scheduler.data.TimeAxis} will
   * be used. If no TimeAxis has been configured, it'll use the start/end dates of the loaded event dataset. If no
   * date information exists in the event data set, it defaults to the current date and time.
   *
   * If a string is supplied, it will be parsed using
   * {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat}.
   *
   * When using {@link #config-infiniteScroll}, use {@link #config-visibleDate} to control initially visible date
   * instead.
   *
   * **Note:** If you need to set start and end date at the same time, use the {@link #function-setTimeSpan} method.
   * @config {Date|String}
   * @category Common
   */
  startDate: {
    $config: {
      equal: "date"
    },
    value: null
  },
  /**
   * Get/set endDate. Defaults to startDate + default span of the used ViewPreset.
   *
   * **Note:** If you need to set start and end date at the same time, use {@link #function-setTimeSpan} method.
   * @member {Date} endDate
   * @category Common
   */
  /**
   * The end date of the timeline (if not configure with {@link #config-infiniteScroll}).
   *
   * If omitted, it will be calculated based on the {@link #config-startDate} setting and the 'defaultSpan'
   * property of the current {@link #config-viewPreset}.
   *
   * If a string is supplied, it will be parsed using
   * {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat}.
   *
   * **Note:** If you need to set start and end date at the same time, use the {@link #function-setTimeSpan} method.
   * @config {Date|String}
   * @category Common
   */
  endDate: {
    $config: {
      equal: "date"
    },
    value: null
  },
  /**
   * Partners this Timeline panel with another Timeline in order to sync their region sizes (sub-grids like locked, normal will get the same width),
   * start and end dates, view preset, zoom level and scrolling position. All these values will be synced with the timeline defined as the `partner`.
   *
   * - To add a new partner dynamically see {@link #function-addPartner} method.
   * - To remove existing partner see {@link #function-removePartner} method.
   * - To check if timelines are partners see {@link #function-isPartneredWith} method.
   *
   * Column widths and hide/show state are synced between partnered schedulers when the column set is identical.
   * @config {Scheduler.view.TimelineBase}
   * @category Time axis
   */
  partner: null,
  /**
   * When set, the text in the major time axis header sticks in the scrolling viewport as long as possible.
   * @config {Boolean}
   * @default
   * @category Time axis
   */
  stickyHeaders: true,
  /**
   * A scrolling `options` object describing the scroll action, including a `date` option
   * which references a `Date`. See {@link #function-scrollToDate} for details about scrolling options.
   *
   * ```javascript
   *     // The date we want in the center of the Scheduler viewport
   *     myScheduler.visibleDate = {
   *         date    : new Date(2023, 5, 17, 12),
   *         block   : 'center',
   *         animate : true
   *     };
   * ```
   * @member {Object} visibleDate
   * @category Common
   */
  /**
   * A date to bring into view initially on the scrollable timeline.
   *
   * This may be configured as either a `Date` or a scrolling `options` object describing
   * the scroll action, including a `date` option which references a `Date`.
   *
   * See {@link #function-scrollToDate} for details about scrolling options.
   *
   * Note that if a naked `Date` is passed, it will be stored internally as a scrolling options object
   * using the following defaults:
   *
   * ```javascript
   * {
   *     date  : <The Date object>,
   *     block : 'nearest'
   * }
   * ```
   *
   * This moves the date into view by the shortest scroll, so that it just appears at an edge.
   *
   * To bring your date of interest to the center of the viewport, configure your
   * Scheduler thus:
   *
   * ```javascript
   *     visibleDate : {
   *         date  : new Date(2023, 5, 17, 12),
   *         block : 'center'
   *     }
   * ```
   * @config {Date|VisibleDate}
   * @category Common
   */
  visibleDate: null,
  /**
   * CSS class to add to rendered events
   * @config {String}
   * @category CSS
   * @private
   */
  eventCls: null,
  /**
   * Set to `true` to force the time columns to fit to the available space (horizontal or vertical depends on mode).
   * Note that setting {@link #config-suppressFit} to `true`, will disable `forceFit` functionality. Zooming
   * cannot be used when `forceFit` is set.
   * @prp {Boolean}
   * @default
   * @category Time axis
   */
  forceFit: false,
  /**
   * Set to a time zone or a UTC offset. This will set the projects
   * {@link Scheduler.model.ProjectModel#config-timeZone} config accordingly. As this config is only a referer,
   * please se project's config {@link Scheduler.model.ProjectModel#config-timeZone documentation} for more
   * information.
   *
   * ```javascript
   * new Calendar(){
   *   timeZone : 'America/Chicago'
   * }
   * ```
   * @prp {String|Number} timeZone
   * @category Misc
   */
  timeZone: null,
  /**
   * By default the row hover effect is not visible in the Scheduler part of the grid.
   *
   * Set this to `false` to show the hover effect in Scheduler rows.
   * @prp {Boolean} hideRowHover
   * @default true
   * @category Misc
   */
  hideRowHover: {
    $config: "lazy",
    value: true
  }
});
TimelineBase.initClass();
VersionHelper.setVersion("scheduler", "5.6.2");
TimelineBase._$name = "TimelineBase";

// ../Scheduler/lib/Scheduler/view/mixin/Describable.js
var arrayify = (format) => !format || Array.isArray(format) ? format : [format];
var pickFormat = (formats, index, defaultFormat) => formats && formats[index] !== true ? formats[index] : defaultFormat;
var Describable_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    /**
     * Returns the date or ranges of included dates as an array. If there is only one significant date, the array will
     * have only one element. Otherwise, a range of dates is returned as a two-element array with `[0]` being the
     * `startDate` and `[1]` the `lastDate`.
     * @member {Date[]}
     * @internal
     */
    get dateBounds() {
      return [this.date];
    }
    /**
     * The textual description generated by the {@link #config-descriptionRenderer} if present, or by the
     * view's date (or date *range* if it has a range) and the {@link #config-descriptionFormat}.
     * @property {String}
     * @readonly
     */
    get description() {
      const me = this, { descriptionRenderer } = me;
      return descriptionRenderer ? me.callback(descriptionRenderer, me, [me]) : me.formattedDescription;
    }
    get formattedDescription() {
      var _a2;
      const me = this, { dateBounds, dateFormat } = me, descriptionFormat = (_a2 = me.descriptionFormat) != null ? _a2 : arrayify(me.defaultDescriptionFormat), format0 = pickFormat(descriptionFormat, 0, dateFormat), end = dateBounds.length > 1 && (descriptionFormat == null ? void 0 : descriptionFormat.length) > 1 && DateHelper.format(dateBounds[0], format0) !== DateHelper.format(dateBounds[1], format0);
      let ret = DateHelper.format(dateBounds[0], format0);
      if (end) {
        ret = DateHelper.formatRange(
          dateBounds,
          pickFormat(descriptionFormat, 1, `S${dateFormat}${me.dateSeparator}E${dateFormat}`)
        );
      }
      return ret;
    }
    changeDescriptionFormat(format) {
      return arrayify(format);
    }
    get widgetClass() {
    }
    // no b-describable class
  }, __publicField(_a, "$name", "Describable"), __publicField(_a, "configurable", {
    /**
     * A {@link Core.helper.DateHelper} format string to use to create date output for view descriptions.
     * @prp {String}
     * @default
     */
    dateFormat: "MMMM d, YYYY",
    /**
     * A string used to separate start and end dates in the {@link #config-descriptionFormat}.
     * @prp {String}
     * @default
     */
    dateSeparator: " - ",
    /**
     * The date format used by the default {@link #config-descriptionRenderer} for rendering the view's description.
     * If this value is `null`, the {@link #config-dateFormat} (and potentially {@link #config-dateSeparator}) will
     * be used.
     *
     * For views that can span a range of dates, this can be a 2-item array with the following interpretation:
     *
     * - `descriptionFormat[0]` is either a date format string or `true` (to use {@link #config-dateFormat}). The
     *   result of formatting the `startDate` with this format specification is used when the formatting both the
     *   `startDate` and `endDate` with this specification produces the same result. For example, a week view
     *   displays only the month and year components of the date, so this will be used unless the end of the week
     *   crosses into the next month.
     *
     * - `descriptionFormat[1]` is used with {@link Core.helper.DateHelper#function-formatRange-static} when the
     *  `startDate` and `endDate` format differently using `descriptionFormat[0]` (as described above). This one
     *  format string produces a result for both dates. If this value is `true`, the {@link #config-dateFormat} and
     *  {@link #config-dateSeparator} are combined to produce the range format.
     *
     * @prp {String|String[]|Boolean[]}
     * @default
     */
    descriptionFormat: null,
    /**
     * A function that provides the textual description for this view. If provided, this function overrides the
     * {@link #config-descriptionFormat}.
     *
     * ```javascript
     *  descriptionRenderer() {
     *      const
     *          eventsInView = this.eventStore.records.filter(
     *              eventRec => DateHelper.intersectSpans(
     *                  this.startDate, this.endDate,
     *                  eventRec.startDate, eventRec.endDate)).length,
     *          sd = DateHelper.format(this.startDate, 'DD/MM/YYY'),
     *          ed = DateHelper.format(this.endDate, 'DD/MM/YYY');
     *
     *     return `${sd} - ${ed}, ${eventsInView} event${eventsInView === 1 ? '' : 's'}`;
     * }
     * ```
     * @config {Function} descriptionRenderer
     * @param {Core.widget.Widget} view The active view in case the function is in another scope.
     * @returns {String} Description string
     */
    descriptionRenderer: null
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerDom.js
var SchedulerDom_default = (Target) => class SchedulerDom extends (Target || Base) {
  static get $name() {
    return "SchedulerDom";
  }
  //region Get
  /**
   * Returns a single HTMLElement representing an event record assigned to a specific resource.
   * @param {Scheduler.model.AssignmentModel} assignmentRecord An assignment record
   * @returns {HTMLElement} The element representing the event record
   * @category DOM
   */
  getElementFromAssignmentRecord(assignmentRecord, returnWrapper = false, checkReleased = false) {
    var _a, _b, _c, _d, _e, _f;
    if (this.isPainted && assignmentRecord) {
      let wrapper = (_a = this.foregroundCanvas.syncIdMap) == null ? void 0 : _a[assignmentRecord.id];
      if (!wrapper && ((_b = assignmentRecord.resource) == null ? void 0 : _b.hasLinks)) {
        for (const link of assignmentRecord.resource.$links) {
          wrapper = (_c = this.foregroundCanvas.syncIdMap) == null ? void 0 : _c[`${assignmentRecord.id}_${link.id}`];
          if (!wrapper) {
            if (checkReleased) {
              wrapper = (_d = this.foregroundCanvas.releasedIdMap) == null ? void 0 : _d[`${assignmentRecord.id}_${link.id}`];
              if (wrapper) {
                break;
              }
            }
          } else {
            break;
          }
        }
      }
      if (!wrapper && checkReleased) {
        wrapper = (_e = this.foregroundCanvas.releasedIdMap) == null ? void 0 : _e[assignmentRecord.id];
      }
      return returnWrapper ? wrapper : (_f = wrapper == null ? void 0 : wrapper.syncIdMap) == null ? void 0 : _f.event;
    }
    return null;
  }
  /**
   * Returns a single HTMLElement representing an event record assigned to a specific resource.
   * @param {Scheduler.model.EventModel} eventRecord An event record
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record
   * @returns {HTMLElement} The element representing the event record
   * @category DOM
   */
  getElementFromEventRecord(eventRecord, resourceRecord = ((_a) => (_a = eventRecord.resources) == null ? void 0 : _a[0])(), returnWrapper = false, checkReleased = false) {
    var _a2;
    if (eventRecord.isResourceTimeRange) {
      const wrapper = (_a2 = this.foregroundCanvas.syncIdMap) == null ? void 0 : _a2[eventRecord.domId];
      return returnWrapper ? wrapper : wrapper == null ? void 0 : wrapper.syncIdMap.event;
    }
    const assignmentRecord = this.assignmentStore.getAssignmentForEventAndResource(eventRecord, resourceRecord);
    return this.getElementFromAssignmentRecord(assignmentRecord, returnWrapper, checkReleased);
  }
  /**
   * Returns all the HTMLElements representing an event record.
   *
   * @param {Scheduler.model.EventModel} eventRecord An event record
   * @param {Scheduler.model.ResourceModel} [resourceRecord] A resource record
   *
   * @returns {HTMLElement[]} The element(s) representing the event record
   * @category DOM
   */
  getElementsFromEventRecord(eventRecord, resourceRecord, returnWrapper = false, checkReleased = false) {
    if (resourceRecord) {
      return [this.getElementFromEventRecord(eventRecord, resourceRecord, returnWrapper, checkReleased)];
    } else {
      return eventRecord.resources.reduce((result, resourceRecord2) => {
        const el = this.getElementFromEventRecord(eventRecord, resourceRecord2, returnWrapper, checkReleased);
        el && result.push(el);
        return result;
      }, []);
    }
  }
  //endregion
  //region Resolve
  /**
   * Resolves the resource based on a dom element or event. In vertical mode, if resolving from an element higher up in
   * the hierarchy than event elements, then it is required to supply an coordinates since resources are virtual
   * columns.
   * @param {HTMLElement|Event} elementOrEvent The HTML element or DOM event to resolve a resource from
   * @param {Number[]} [xy] X and Y coordinates, required in some cases in vertical mode, disregarded in horizontal
   * @returns {Scheduler.model.ResourceModel} The resource corresponding to the element, or null if not found.
   * @category DOM
   */
  resolveResourceRecord(elementOrEvent, xy) {
    return this.currentOrientation.resolveRowRecord(elementOrEvent, xy);
  }
  /**
   * Product agnostic method which yields the {@link Scheduler.model.ResourceModel} record which underpins the row which
   * encapsulates the passed element. The element can be a grid cell, or an event element, and the result
   * will be a {@link Scheduler.model.ResourceModel}
   * @param {HTMLElement|Event} elementOrEvent The HTML element or DOM event to resolve a record from
   * @returns {Scheduler.model.ResourceModel} The resource corresponding to the element, or null if not found.
   * @category DOM
   */
  resolveRowRecord(elementOrEvent) {
    return this.resolveResourceRecord(elementOrEvent);
  }
  /**
   * Returns the event record for a DOM element
   * @param {HTMLElement|Event} elementOrEvent The DOM node to lookup
   * @returns {Scheduler.model.EventModel} The event record
   * @category DOM
   */
  resolveEventRecord(elementOrEvent) {
    if (elementOrEvent instanceof Event) {
      elementOrEvent = elementOrEvent.target;
    }
    const element = elementOrEvent == null ? void 0 : elementOrEvent.closest(this.eventSelector);
    if (element) {
      if (element.dataset.eventId) {
        return this.eventStore.getById(element.dataset.eventId);
      }
      if (element.dataset.assignmentId) {
        return this.assignmentStore.getById(element.dataset.assignmentId).event;
      }
    }
    return null;
  }
  // Used by shared features to resolve an event or task
  resolveTimeSpanRecord(element) {
    return this.resolveEventRecord(element);
  }
  /**
   * Returns an assignment record for a DOM element
   * @param {HTMLElement} element The DOM node to lookup
   * @privateparam {Boolean} allowReleased Whether to allow resolving from a released event
   * @returns {Scheduler.model.AssignmentModel} The assignment record
   * @category DOM
   */
  resolveAssignmentRecord(element, allowReleased = false) {
    const eventElement = element.closest(allowReleased ? "[data-assignment-id][data-event-id]" : this.eventSelector), assignmentRecord = eventElement && this.assignmentStore.getById(eventElement.dataset.assignmentId), eventRecord = eventElement && this.eventStore.getById(eventElement.dataset.eventId);
    return this.assignmentStore.getOccurrence(assignmentRecord, eventRecord);
  }
  //endregion
  // Decide if a record is inside a collapsed tree node, or inside a collapsed group (using grouping feature)
  isRowVisible(resourceRecord) {
    return this.store.indexOf(resourceRecord) >= 0;
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerDomEvents.js
var SchedulerDomEvents_default = (Target) => class SchedulerDomEvents extends (Target || Base) {
  static get $name() {
    return "SchedulerDomEvents";
  }
  //region Events
  /**
   * Triggered when user mousedowns over an empty area in the schedule.
   * @event scheduleMouseDown
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when mouse enters an empty area in the schedule.
   * @event scheduleMouseEnter
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when mouse leaves an empty area in the schedule.
   * @event scheduleMouseLeave
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when user mouseups over an empty area in the schedule.
   * @event scheduleMouseUp
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when user moves mouse over an empty area in the schedule.
   * @event scheduleMouseMove
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Scheduler.model.TimeSpan} tick A record which encapsulates the time axis tick clicked on.
   * @param {Number} tickIndex The index of the time axis tick clicked on.
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when user clicks an empty area in the schedule.
   * @event scheduleClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Scheduler.model.TimeSpan} tick A record which encapsulates the time axis tick clicked on.
   * @param {Number} tickIndex The index of the time axis tick clicked on.
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when user double-clicks an empty area in the schedule.
   * @event scheduleDblClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Scheduler.model.TimeSpan} tick A record which encapsulates the time axis tick clicked on.
   * @param {Number} tickIndex The index of the time axis tick clicked on.
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Index of double-clicked resource
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when user right-clicks an empty area in the schedule.
   * @event scheduleContextMenu
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Date} date Date at mouse position
   * @param {Scheduler.model.TimeSpan} tick A record which encapsulates the time axis tick clicked on.
   * @param {Number} tickIndex The index of the time axis tick clicked on.
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Row under the mouse (in horizontal mode only)
   * @param {Number} index Resource index
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for mouse down on an event.
   * @event eventMouseDown
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for mouse up on an event.
   * @event eventMouseUp
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for click on an event.
   * @event eventClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for double-click on an event.
   * @event eventDblClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for right-click on an event.
   * @event eventContextMenu
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when the mouse enters an event bar.
   * @event eventMouseEnter
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered when the mouse leaves an event bar.
   * @event eventMouseLeave
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for mouse over events when moving into and within an event bar.
   *
   * Note that `mouseover` events bubble, therefore this event will fire while moving from
   * element to element *within* an event bar.
   *
   * _If only an event when moving into the event bar is required, use the {@link #event-eventMouseEnter} event._
   * @event eventMouseOver
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  /**
   * Triggered for mouse out events within and when moving out of an event bar.
   *
   * Note that `mouseout` events bubble, therefore this event will fire while moving from
   * element to element *within* an event bar.
   *
   * _If only an event when moving out of the event bar is required, use the {@link #event-eventMouseLeave} event._
   * @event eventMouseOut
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  //endregion
  //region Event handling
  getTimeSpanMouseEventParams(eventElement, event) {
    const eventRecord = this.resolveEventRecord(eventElement);
    return eventRecord && {
      eventRecord,
      resourceRecord: this.resolveResourceRecord(eventElement),
      assignmentRecord: this.resolveAssignmentRecord(eventElement),
      eventElement,
      event
    };
  }
  getScheduleMouseEventParams(cellData, event) {
    const resourceRecord = this.isVertical ? this.resolveResourceRecord(event) : this.store.getById(cellData.id);
    return { resourceRecord };
  }
  /**
   * Relays keydown events as eventkeydown if we have a selected task.
   * @private
   */
  onElementKeyDown(event) {
    const result = super.onElementKeyDown(event), me = this;
    if (me.selectedEvents.length) {
      me.trigger(me.scheduledEventName + "KeyDown", {
        eventRecords: me.selectedEvents,
        assignmentRecords: me.selectedAssignments,
        event,
        eventRecord: me.selectedEvents,
        assignmentRecord: me.selectedAssignments
      });
    }
    return result;
  }
  /**
   * Relays keyup events as eventkeyup if we have a selected task.
   * @private
   */
  onElementKeyUp(event) {
    super.onElementKeyUp(event);
    const me = this;
    if (me.selectedEvents.length) {
      me.trigger(me.scheduledEventName + "KeyUp", {
        eventRecords: me.selectedEvents,
        assignmentRecords: me.selectedAssignments,
        event,
        eventRecord: me.selectedEvents,
        assignmentRecord: me.selectedAssignments
      });
    }
  }
  //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/eventlayout/HorizontalLayout.js
var HorizontalLayout = class extends Base {
  static get defaultConfig() {
    return {
      nbrOfBandsByResource: {},
      bandIndexToPxConvertFn: null,
      bandIndexToPxConvertThisObj: null
    };
  }
  clearCache(resource) {
    if (resource) {
      delete this.nbrOfBandsByResource[resource.id];
    } else {
      this.nbrOfBandsByResource = {};
    }
  }
  /**
   * This method performs layout on an array of event render data and returns amount of _bands_. Band is a multiplier of a
   * configured {@link Scheduler.view.Scheduler#config-rowHeight} to calculate total row height required to fit all
   * events.
   * This method should not be used directly, it is called by the Scheduler during the row rendering process.
   * @param {EventRenderData[]} events Unordered array of event render data, sorting may be required
   * @param {Scheduler.model.ResourceModel} resource The resource for which the events are being laid out.
   * @returns {Number}
   */
  applyLayout(events, resource) {
    return this.nbrOfBandsByResource[resource.id] = this.layoutEventsInBands(events, resource);
  }
  /**
   * This method iterates over events and calculates top position for each of them. Default layouts calculate
   * positions to avoid events overlapping horizontally (except for the 'none' layout). Pack layout will squeeze events to a single
   * row by reducing their height, Stack layout will increase the row height and keep event height intact.
   * This method should not be used directly, it is called by the Scheduler during the row rendering process.
   * @param {EventRenderData[]} events Unordered array of event render data, sorting may be required
   * @param {Scheduler.model.ResourceModel} resource The resource for which the events are being laid out.
   */
  layoutEventsInBands(events, resource) {
    throw new Error("Implement in subclass");
  }
};
HorizontalLayout._$name = "HorizontalLayout";

// ../Scheduler/lib/Scheduler/eventlayout/HorizontalLayoutStack.js
var HorizontalLayoutStack = class extends HorizontalLayout {
  static get $name() {
    return "HorizontalLayoutStack";
  }
  static get configurable() {
    return {
      type: "stack"
    };
  }
  // Input: Array of event layout data
  // heightRun is used when pre-calculating row heights, taking a cheaper path
  layoutEventsInBands(events, resource, heightRun = false) {
    let verticalPosition = 0;
    do {
      let eventIndex = 0, event = events[0];
      while (event) {
        if (!heightRun) {
          event.top = this.bandIndexToPxConvertFn.call(
            this.bandIndexToPxConvertThisObj || this,
            verticalPosition,
            event.eventRecord,
            event.resourceRecord
          );
        }
        events.splice(eventIndex, 1);
        eventIndex = this.findClosestSuccessor(event, events);
        event = events[eventIndex];
      }
      verticalPosition++;
    } while (events.length > 0);
    return verticalPosition;
  }
  findClosestSuccessor(eventRenderData, events) {
    var _a, _b;
    const { endMS, group } = eventRenderData, isMilestone = ((_a = eventRenderData.eventRecord) == null ? void 0 : _a.duration) === 0;
    let minGap = Infinity, closest, gap, event, eventIsMilestone;
    for (let i = 0, l = events.length; i < l; i++) {
      event = events[i];
      gap = event.startMS - endMS;
      eventIsMilestone = event.endMS - event.startMS === 0 && !((_b = event.eventRecord) == null ? void 0 : _b.meta.isDragCreating);
      if (gap >= 0 && gap < minGap && // Two milestones should not overlap
      (gap > 0 || !eventIsMilestone || !isMilestone) && // Milestone at events endDate goes on next band
      !(gap === 0 && eventIsMilestone && !isMilestone)) {
        if (this.grouped && group !== event.group) {
          break;
        }
        closest = i;
        minGap = gap;
      }
    }
    return closest;
  }
};
HorizontalLayoutStack._$name = "HorizontalLayoutStack";

// ../Scheduler/lib/Scheduler/eventlayout/PackMixin.js
var rangesIntersect = (range1Start, range1End, range2Start, range2End) => {
  return range2Start <= range1Start && range1Start < range2End || range1Start <= range2Start && range2Start < range1End;
};
var PackMixin_default = (Target) => class PackMixin extends (Target || Base) {
  static get $name() {
    return "PackMixin";
  }
  static get defaultConfig() {
    return {
      coordProp: "top",
      sizeProp: "height",
      inBandCoordProp: "inBandTop",
      inBandSizeProp: "inBandHeight"
    };
  }
  isSameGroup(a, b) {
    return this.grouped ? a.group === b.group : true;
  }
  // Packs the events to consume as little space as possible
  packEventsInBands(events, applyClusterFn) {
    const me = this, { coordProp, sizeProp } = me;
    let slot, firstInCluster, cluster, j;
    for (let i = 0, l = events.length; i < l; i++) {
      firstInCluster = events[i];
      slot = me.findStartSlot(events, firstInCluster);
      cluster = me.getCluster(events, i);
      if (cluster.length > 1) {
        firstInCluster[coordProp] = slot.start;
        firstInCluster[sizeProp] = slot.end - slot.start;
        j = 1;
        while (j < cluster.length - 1 && cluster[j + 1].start - firstInCluster.start === 0) {
          j++;
        }
        const nextSlot = me.findStartSlot(events, cluster[j]);
        if (nextSlot && nextSlot.start < 0.8) {
          cluster.length = j;
        }
      }
      const clusterSize = cluster.length, slotSize = (slot.end - slot.start) / clusterSize;
      for (j = 0; j < clusterSize; j++) {
        applyClusterFn(cluster[j], j, slot, slotSize);
      }
      i += clusterSize - 1;
    }
    return 1;
  }
  findStartSlot(events, event) {
    const {
      inBandSizeProp,
      inBandCoordProp,
      coordProp,
      sizeProp
    } = this, priorOverlappers = this.getPriorOverlappingEvents(events, event);
    let i;
    if (priorOverlappers.length === 0) {
      return {
        start: 0,
        end: 1
      };
    }
    for (i = 0; i < priorOverlappers.length; i++) {
      const item = priorOverlappers[i], COORD_PROP = inBandCoordProp in item ? inBandCoordProp : coordProp, SIZE_PROP = inBandSizeProp in item ? inBandSizeProp : sizeProp;
      if (i === 0 && item[COORD_PROP] > 0) {
        return {
          start: 0,
          end: item[COORD_PROP]
        };
      } else {
        if (item[COORD_PROP] + item[SIZE_PROP] < (i < priorOverlappers.length - 1 ? priorOverlappers[i + 1][COORD_PROP] : 1)) {
          return {
            start: item[COORD_PROP] + item[SIZE_PROP],
            end: i < priorOverlappers.length - 1 ? priorOverlappers[i + 1][COORD_PROP] : 1
          };
        }
      }
    }
    return false;
  }
  getPriorOverlappingEvents(events, event) {
    const { startMS, endMS } = event, overlappers = [];
    for (let i = 0, l = events.indexOf(event); i < l; i++) {
      const item = events[i];
      if (this.isSameGroup(item, event) && rangesIntersect(startMS, endMS, item.startMS, item.endMS)) {
        overlappers.push(item);
      }
    }
    overlappers.sort(this.sortOverlappers.bind(this));
    return overlappers;
  }
  sortOverlappers(e1, e2) {
    const { coordProp } = this;
    return e1[coordProp] - e2[coordProp];
  }
  getCluster(events, startIndex) {
    const startEvent = events[startIndex], result = [startEvent];
    if (startIndex >= events.length - 1) {
      return result;
    }
    let { startMS, endMS } = startEvent;
    for (let i = startIndex + 1, l = events.length; i < l; i++) {
      const item = events[i];
      if (!this.isSameGroup(item, startEvent) || !rangesIntersect(startMS, endMS, item.startMS, item.endMS)) {
        break;
      }
      result.push(item);
      startMS = Math.max(startMS, item.startMS);
      endMS = Math.min(item.endMS, endMS);
    }
    return result;
  }
};

// ../Scheduler/lib/Scheduler/eventlayout/HorizontalLayoutPack.js
var HorizontalLayoutPack = class extends HorizontalLayout.mixin(PackMixin_default) {
  static get $name() {
    return "HorizontalLayoutPack";
  }
  static get configurable() {
    return {
      type: "pack"
    };
  }
  // Packs the events to consume as little space as possible
  layoutEventsInBands(events) {
    const result = this.packEventsInBands(events, (event, j, slot, slotSize) => {
      event.height = slotSize;
      event.top = slot.start + j * slotSize;
    });
    events.forEach((event) => {
      Object.assign(
        event,
        this.bandIndexToPxConvertFn.call(
          this.bandIndexToPxConvertThisObj || this,
          event.top,
          event.height,
          event.eventRecord,
          event.resourceRecord
        )
      );
    });
    return result;
  }
};
HorizontalLayoutPack._$name = "HorizontalLayoutPack";

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerResourceRendering.js
var SchedulerResourceRendering_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    //endregion
    //region Resource header/columns
    // NOTE: The configs below are initially applied to the resource header in `TimeAxisColumn#set mode`
    /**
     * Use it to manipulate resource column properties at runtime.
     * @property {Scheduler.view.ResourceHeader}
     * @readonly
     */
    get resourceColumns() {
      var _a2;
      return ((_a2 = this.timeAxisColumn) == null ? void 0 : _a2.resourceColumns) || this._resourceColumns;
    }
    /**
     * Get resource column width. Only applies to vertical mode. To set it, assign to
     * `scheduler.resourceColumns.columnWidth`.
     * @property {Number}
     * @readonly
     */
    get resourceColumnWidth() {
      var _a2;
      return ((_a2 = this.resourceColumns) == null ? void 0 : _a2.columnWidth) || null;
    }
    //endregion
    //region Event rendering
    // Returns a resource specific resourceMargin, falling back to Schedulers setting
    // This fn could be made public to allow hooking it as an alternative to only setting this in data
    getResourceMarginObject(resourceRecord) {
      var _a2;
      if (resourceRecord == null ? void 0 : resourceRecord.resourceMargin) {
        const margin = (_a2 = resourceRecord == null ? void 0 : resourceRecord.resourceMargin) != null ? _a2 : this.resourceMargin;
        if (typeof margin === "number") {
          return {
            start: margin,
            end: margin,
            total: margin * 2
          };
        } else {
          margin.total = margin.start + margin.end;
          return margin;
        }
      } else {
        return this.resourceMarginObject;
      }
    }
    // Returns a resource specific barMargin, falling back to Schedulers setting
    // This fn could be made public to allow hooking it as an alternative to only setting this in data
    getBarMargin(resourceRecord) {
      var _a2;
      return (_a2 = resourceRecord == null ? void 0 : resourceRecord.barMargin) != null ? _a2 : this.barMargin;
    }
    // Returns a resource specific rowHeight, falling back to Schedulers setting
    // Prio order: Height from record, configured height
    // This fn could be made public to allow hooking it as an alternative to only setting this in data
    getResourceHeight(resourceRecord) {
      var _a2;
      return (_a2 = resourceRecord.rowHeight) != null ? _a2 : this.isHorizontal ? this.rowHeight : this.getResourceWidth(resourceRecord);
    }
    getResourceWidth(resourceRecord) {
      var _a2;
      return (_a2 = resourceRecord.columnWidth) != null ? _a2 : this.resourceColumnWidth;
    }
    // Similar to getResourceHeight(), but for usage later in the process to take height set by renderers into account.
    // Cant be used earlier in the process because then the row will grow
    // Prio order: Height requested by renderer, height from record, configured height
    getAppliedResourceHeight(resourceRecord) {
      var _a2;
      const row = this.getRowById(resourceRecord);
      return (_a2 = row == null ? void 0 : row.maxRequestedHeight) != null ? _a2 : this.getResourceHeight(resourceRecord);
    }
    // Combined convenience getter for destructuring on calling side
    // Second arg only passed for nested events, handled by NestedEvent feature
    getResourceLayoutSettings(resourceRecord, parentEventRecord = null) {
      const resourceMarginObject = this.getResourceMarginObject(resourceRecord, parentEventRecord), rowHeight = this.getAppliedResourceHeight(resourceRecord, parentEventRecord);
      return {
        barMargin: this.getBarMargin(resourceRecord, parentEventRecord),
        contentHeight: Math.max(rowHeight - resourceMarginObject.total, 1),
        rowHeight,
        resourceMarginObject
      };
    }
    //endregion
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "SchedulerResourceRendering"), //region Default config
  __publicField(_a, "configurable", {
    /**
     * Control how much space to leave between the first event/last event and the resources edge (top/bottom
     * margin within the resource row in horizontal mode, left/right margin within the resource column in
     * vertical mode), in px. Defaults to the value of {@link Scheduler.view.Scheduler#config-barMargin}.
     *
     * Can be configured per resource by setting {@link Scheduler.model.ResourceModel#field-resourceMargin
     * resource.resourceMargin}.
     *
     * It's also possible to set different values for top/left and bottom/right
     * by assigning  an object to `resourceMargin` with `start` (margin top in horizontal mode,
     * margin left in vertical mode) and `end` (margin bottom / margin right) properties:
     * ```javascript
     * scheduler = new Scheduler({
     *     resourceMargin : {
     *         start : 15,
     *         end   : 1
     *     }
     * });
     * ```
     *
     * @prp {Number|ResourceMarginConfig}
     * @category Scheduled events
     */
    resourceMargin: null,
    /**
     * A config object used to configure the resource columns in vertical mode.
     * See {@link Scheduler.view.ResourceHeader} for more details on available properties.
     *
     * ```javascript
     * new Scheduler({
     *     resourceColumns : {
     *         columnWidth    : 100,
     *         headerRenderer : ({ resourceRecord }) => `${resourceRecord.id} - ${resourceRecord.name}`
     *     }
     * })
     * ```
     * @config {ResourceHeaderConfig}
     * @category Resources
     */
    resourceColumns: null,
    /**
     * Path to load resource images from. Used by the resource header in vertical mode and the
     * {@link Scheduler.column.ResourceInfoColumn} in horizontal mode. Set this to display miniature
     * images for each resource using their `image` or `imageUrl` fields.
     *
     * * `image` represents image name inside the specified `resourceImagePath`,
     * * `imageUrl` represents fully qualified image URL.
     *
     *  If set and a resource has no `imageUrl` or `image` specified it will try show miniature using
     *  the resource's name with {@link #config-resourceImageExtension} appended.
     *
     * **NOTE**: The path should end with a `/`:
     *
     * ```
     * new Scheduler({
     *   resourceImagePath : 'images/resources/'
     * });
     * ```
     * @config {String}
     * @category Resources
     */
    resourceImagePath: null,
    /**
     * Generic resource image, used when provided `imageUrl` or `image` fields or path calculated from resource
     * name are all invalid. If left blank, resource name initials will be shown when no image can be loaded.
     * @default
     * @config {String}
     * @category Resources
     */
    defaultResourceImageName: null,
    /**
     * Resource image extension, used when creating image path from resource name.
     * @default
     * @config {String}
     * @category Resources
     */
    resourceImageExtension: ".jpg"
  }), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerEventRendering.js
var SchedulerEventRendering_default = (Target) => class SchedulerEventRendering extends SchedulerResourceRendering_default(Target || Base) {
  static get $name() {
    return "SchedulerEventRendering";
  }
  //region Default config
  static get configurable() {
    return {
      /**
       * Position of the milestone text:
       * * 'inside' - for short 1-char text displayed inside the diamond, not applicable when using
       *   {@link #config-milestoneLayoutMode})
       * * 'outside' - for longer text displayed outside the diamond, but inside it when using
       *   {@link #config-milestoneLayoutMode}
       * * 'always-outside' - outside even when combined with {@link #config-milestoneLayoutMode}
       *
       * @prp {'inside'|'outside'|'always-outside'}
       * @default
       * @category Milestones
       */
      milestoneTextPosition: "outside",
      /**
       * How to align milestones in relation to their startDate. Only applies when using a `milestoneLayoutMode`
       * other than `default`. Valid values are:
       * * start
       * * center (default)
       * * end
       * @prp {'start'|'center'|'end'}
       * @default
       * @category Milestones
       */
      milestoneAlign: "center",
      /**
       * Factor representing the average char width in pixels used to determine milestone width when configured
       * with `milestoneLayoutMode: 'estimate'`.
       * @prp {Number}
       * @default
       * @category Milestones
       */
      milestoneCharWidth: 10,
      /**
       * How to handle milestones during event layout. How the milestones are displayed when part of the layout
       * are controlled using {@link #config-milestoneTextPosition}.
       *
       * Options are:
       * * default - Milestones do not affect event layout
       * * estimate - Milestone width is estimated by multiplying text length with Scheduler#milestoneCharWidth
       * * data - Milestone width is determined by checking EventModel#milestoneWidth
       * * measure - Milestone width is determined by measuring label width
       * Please note that currently text width is always determined using EventModel#name.
       * Also note that only 'default' is supported by eventStyles line, dashed and minimal.
       * @prp {'default'|'estimate'|'data'|'measure'}
       * @default
       * @category Milestones
       */
      milestoneLayoutMode: "default",
      /**
       * Defines how to handle overlapping events. Valid values are:
       * - `stack`, adjusts row height (only horizontal)
       * - `pack`, adjusts event height
       * - `mixed`, allows two events to overlap, more packs (only vertical)
       * - `none`, allows events to overlap
       *
       * This config can also accept an object:
       *
       * ```javascript
       * new Scheduler({
       *     eventLayout : { type : 'stack' }
       * })
       * ```
       *
       * @prp {'stack'|'pack'|'mixed'|'none'|Object}
       * @default
       * @category Scheduled events
       */
      eventLayout: "stack",
      /**
       * Override this method to provide a custom sort function to sort any overlapping events. See {@link
       * #config-overlappingEventSorter} for more details.
       *
       * @param  {Scheduler.model.EventModel} a First event
       * @param  {Scheduler.model.EventModel} b Second event
       * @returns {Number} Return -1 to display `a` above `b`, 1 for `b` above `a`
       * @member {Function} overlappingEventSorter
       * @category Misc
       */
      /**
       * Override this method to provide a custom sort function to sort any overlapping events. This only applies
       * to the horizontal mode, where the order the events are sorted in determines their vertical placement
       * within a resource.
       *
       * By default, overlapping events are laid out based on the start date. If the start date is equal, events
       * with earlier end date go first. And lastly the name of events is taken into account.
       *
       * Here's a sample sort function, sorting on start- and end date. If this function returns -1, then event
       * `a` is placed above event `b`:
       *
       * ```javascript
       * overlappingEventSorter(a, b) {
       *
       *   const startA = a.startDate, endA = a.endDate;
       *   const startB = b.startDate, endB = b.endDate;
       *
       *   const sameStart = (startA - startB === 0);
       *
       *   if (sameStart) {
       *     return endA > endB ? -1 : 1;
       *   } else {
       *     return (startA < startB) ? -1 : 1;
       *   }
       * }
       * ```
       *
       * NOTE: The algorithms (stack, pack) that lay the events out expects them to be served in chronological
       * order, be sure to first sort by `startDate` to get predictable results.
       *
       * @param  {Scheduler.model.EventModel} a First event
       * @param  {Scheduler.model.EventModel} b Second event
       * @returns {Number} Return -1 to display `a` above `b`, 1 for `b` above `a`
       * @config {Function}
       * @category Misc
       */
      overlappingEventSorter: null,
      /**
       * Deprecated, to be removed in version 6.0. Replaced by {@link #config-overlappingEventSorter}.
       * @deprecated Since 5.0. Use {@link #config-overlappingEventSorter} instead.
       * @config {Function}
       * @category Misc
       */
      horizontalEventSorterFn: null,
      /**
       * By default, scheduler fade events in on load. Specify `false` to prevent this animation or specify one
       * of the available animation types to use it (`true` equals `'fade-in'`):
       * * fade-in (default)
       * * slide-from-left
       * * slide-from-top
       * ```
       * // Slide events in from the left on load
       * scheduler = new Scheduler({
       *     useInitialAnimation : 'slide-from-left'
       * });
       * ```
       * @prp {Boolean|'fade-in'|'slide-from-left'|'slide-from-top'|String}
       * @default
       * @category Misc
       */
      useInitialAnimation: true,
      /**
       * An empty function by default, but provided so that you can override it. This function is called each time
       * an event is rendered into the schedule to render the contents of the event. It's called with the event,
       * its resource and a `renderData` object which allows you to populate data placeholders inside the event
       * template. **IMPORTANT** You should never modify any data on the EventModel inside this method.
       *
       * By default, the DOM markup of an event bar includes placeholders for 'cls' and 'style'. The cls property
       * is a {@link Core.helper.util.DomClassList} which will be added to the event element. The style property
       * is an inline style declaration for the event element.
       *
       * IMPORTANT: When returning content, be sure to consider how that content should be encoded to avoid XSS
       * (Cross-Site Scripting) attacks. This is especially important when including user-controlled data such as
       * the event's `name`. The function {@link Core.helper.StringHelper#function-encodeHtml-static} as well as
       * {@link Core.helper.StringHelper#function-xss-static} can be helpful in these cases.
       *
       * ```javascript
       *  eventRenderer({ eventRecord, resourceRecord, renderData }) {
       *      renderData.style = 'color:white';                 // You can use inline styles too.
       *
       *      // Property names with truthy values are added to the resulting elements CSS class.
       *      renderData.cls.isImportant = this.isImportant(eventRecord);
       *      renderData.cls.isModified = eventRecord.isModified;
       *
       *      // Remove a class name by setting the property to false
       *      renderData.cls[scheduler.generatedIdCls] = false;
       *
       *      // Or, you can treat it as a string, but this is less efficient, especially
       *      // if your renderer wants to *remove* classes that may be there.
       *      renderData.cls += ' extra-class';
       *
       *      return StringHelper.xss`${DateHelper.format(eventRecord.startDate, 'YYYY-MM-DD')}: ${eventRecord.name}`;
       *  }
       * ```
       *
       * @param {Object} detail An object containing the information needed to render an Event.
       * @param {Scheduler.model.EventModel} detail.eventRecord The event record.
       * @param {Scheduler.model.ResourceModel} detail.resourceRecord The resource record.
       * @param {Scheduler.model.AssignmentModel} detail.assignmentRecord The assignment record.
       * @param {Object} detail.renderData An object containing details about the event rendering.
       * @param {Scheduler.model.EventModel} detail.renderData.event The event record.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.cls An object whose property names
       * represent the CSS class names to be added to the event bar element. Set a property's value to truthy or
       * falsy to add or remove the class name based on the property name. Using this technique, you do not have
       * to know whether the class is already there, or deal with concatenation.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.wrapperCls An object whose property names
       * represent the CSS class names to be added to the event wrapper element. Set a property's value to truthy
       * or falsy to add or remove the class name based on the property name. Using this technique, you do not
       * have to know whether the class is already there, or deal with concatenation.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.iconCls An object whose property names
       * represent the CSS class names to be added to an event icon element.
       *
       * Note that an element carrying this icon class is injected into the event element *after*
       * the renderer completes, *before* the renderer's created content.
       *
       * To disable this if the renderer takes full control and creates content using the iconCls,
       * you can set `renderData.iconCls = null`.
       * @param {Number} detail.renderData.left Vertical offset position (in pixels) on the time axis.
       * @param {Number} detail.renderData.width Width in pixels of the event element.
       * @param {Number} detail.renderData.height Height in pixels of the event element.
       * @param {String|Object<String,String>} detail.renderData.style Inline styles for the event bar DOM element.
       * Use either 'border: 1px solid black' or `{ border: '1px solid black' }`
       * @param {String|Object<String,String>} detail.renderData.wrapperStyle Inline styles for wrapper of the
       * event bar DOM element. Use either 'border: 1px solid green' or `{ border: '1px solid green' }`
       * @param {String} detail.renderData.eventStyle The `eventStyle` of the event. Use this to apply custom
       * styles to the event DOM element
       * @param {String} detail.renderData.eventColor The `eventColor` of the event. Use this to set a custom
       * color for the rendered event
       * @param {DomConfig[]} detail.renderData.children An array of DOM configs used as children to the
       * `b-sch-event` element. Can be populated with additional DOM configs to have more control over contents.
       * @returns {String|Object|DomConfig|DomConfig[]} A simple string, or a custom object which will be applied to the
       * {@link #config-eventBodyTemplate}, creating the actual HTML
       * @config {Function}
       * @category Scheduled events
       */
      eventRenderer: null,
      /**
       * `this` reference for the {@link #config-eventRenderer} function
       * @config {Object}
       * @category Scheduled events
       */
      eventRendererThisObj: null,
      /**
       * Field from EventModel displayed as text in the bar when rendering
       * @config {String}
       * @default
       * @category Scheduled events
       */
      eventBarTextField: "name",
      /**
       * The template used to generate the markup of your events in the scheduler. To 'populate' the
       * eventBodyTemplate with data, use the {@link #config-eventRenderer} method.
       * @config {Function}
       * @param {*} data Data passed from {@link #config-eventRenderer} method.
       * @returns {DomConfig|String|null}
       * @deprecated Since 5.6.2. Return markup/DomConfigs from {@link #config-eventRenderer} instead, will be
       * removed in 6.0.0
       * @category Scheduled events
       */
      eventBodyTemplate: null,
      /**
       * The class responsible for the packing horizontal event layout process.
       * Override this to take control over the layout process.
       * @config {Scheduler.eventlayout.HorizontalLayout}
       * @typings {typeof HorizontalLayout}
       * @default
       * @private
       * @category Misc
       */
      horizontalLayoutPackClass: HorizontalLayoutPack,
      /**
       * The class name responsible for the stacking horizontal event layout process.
       * Override this to take control over the layout process.
       * @config {Scheduler.eventlayout.HorizontalLayout}
       * @typings {typeof HorizontalLayout}
       * @default
       * @private
       * @category Misc
       */
      horizontalLayoutStackClass: HorizontalLayoutStack,
      /**
       * Controls how much space to leave between stacked event bars in px.
       *
       * Can be configured per resource by setting {@link Scheduler.model.ResourceModel#field-barMargin
       * resource.barMargin}.
       *
       * @config {Number} barMargin
       * @default
       * @category Scheduled events
       */
      // Used to animate events on first render
      isFirstRender: true,
      initialAnimationDuration: 2e3,
      /**
       * When an event bar has a width less than this value, it gets the CSS class `b-sch-event-narrow`
       * added. You may apply custom CSS rules using this class.
       *
       * In vertical mode, this class causes the text to be rotated so that it runs vertically.
       * @default
       * @config {Number}
       * @category Scheduled events
       */
      narrowEventWidth: 10,
      internalEventLayout: null,
      eventPositionMode: "translate",
      eventScrollMode: "move"
    };
  }
  //endregion
  //region Settings
  changeEventLayout(eventLayout) {
    this.internalEventLayout = eventLayout;
    return this.internalEventLayout.type;
  }
  changeInternalEventLayout(eventLayout) {
    return this.getEventLayout(eventLayout);
  }
  updateInternalEventLayout(eventLayout, oldEventLayout) {
    const me = this;
    if (oldEventLayout) {
      me.element.classList.remove(`b-eventlayout-${oldEventLayout.type}`);
    }
    me.element.classList.add(`b-eventlayout-${eventLayout.type}`);
    if (!me.isConfiguring) {
      me.refreshWithTransition();
      me.trigger("stateChange");
    }
  }
  changeHorizontalEventSorterFn(fn) {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Replaced by overlappingEventSorter()");
    this.overlappingEventSorter = fn;
  }
  updateOverlappingEventSorter(fn) {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  }
  updateEventBodyTemplate() {
    VersionHelper.deprecate("Scheduler", "6.0.0", "Return markup/DomConfigs from eventRenderer() instead");
  }
  //endregion
  //region Layout helpers
  // Wraps string config to object with type
  getEventLayout(value) {
    if (value == null ? void 0 : value.isModel) {
      value = value.eventLayout || this.internalEventLayout;
    }
    if (typeof value === "string") {
      value = { type: value };
    }
    return value;
  }
  /**
   * Get event layout handler. The handler decides the vertical placement of events within a resource.
   * Returns null if no eventLayout is used (if {@link #config-eventLayout} is set to "none")
   * @internal
   * @returns {Scheduler.eventlayout.HorizontalLayout}
   * @readonly
   * @category Scheduled events
   */
  getEventLayoutHandler(eventLayout) {
    const me = this;
    if (!me.isHorizontal) {
      return null;
    }
    const { timeAxisViewModel, horizontal } = me, { type } = eventLayout;
    if (!me.layouts) {
      me.layouts = {};
    }
    switch (type) {
      case "stack": {
        if (!me.layouts.horizontalStack) {
          me.layouts.horizontalStack = new me.horizontalLayoutStackClass(ObjectHelper.assign({
            scheduler: me,
            timeAxisViewModel,
            bandIndexToPxConvertFn: horizontal.layoutEventVerticallyStack,
            bandIndexToPxConvertThisObj: horizontal
          }, eventLayout));
        }
        return me.layouts.horizontalStack;
      }
      case "pack": {
        if (!me.layouts.horizontalPack) {
          me.layouts.horizontalPack = new me.horizontalLayoutPackClass(ObjectHelper.assign({
            scheduler: me,
            timeAxisViewModel,
            bandIndexToPxConvertFn: horizontal.layoutEventVerticallyPack,
            bandIndexToPxConvertThisObj: horizontal
          }, eventLayout));
        }
        return me.layouts.horizontalPack;
      }
      default:
        return null;
    }
  }
  //endregion
  //region Event rendering
  // Chainable function called with the events to render for a specific resource. Allows features to add/remove.
  // Chained by ResourceTimeRanges
  getEventsToRender(resource, events) {
    return events;
  }
  /**
   * Rerenders events for specified resource (by rerendering the entire row).
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @category Rendering
   */
  repaintEventsForResource(resourceRecord) {
    this.currentOrientation.repaintEventsForResource(resourceRecord);
  }
  /**
   * Rerenders the events for all resources connected to the specified event
   * @param {Scheduler.model.EventModel} eventRecord
   * @private
   */
  repaintEvent(eventRecord) {
    const resources = this.eventStore.getResourcesForEvent(eventRecord);
    resources.forEach((resourceRecord) => this.repaintEventsForResource(resourceRecord));
  }
  getEventStyle(eventRecord, resourceRecord) {
    return eventRecord.eventStyle || resourceRecord.eventStyle || this.eventStyle;
  }
  getEventColor(eventRecord, resourceRecord) {
    var _a, _b;
    return eventRecord.eventColor || ((_a = eventRecord.event) == null ? void 0 : _a.eventColor) || ((_b = eventRecord.parent) == null ? void 0 : _b.eventColor) || resourceRecord.eventColor || this.eventColor;
  }
  //endregion
  //region Template
  /**
   * Generates data used in the template when rendering an event. For example which css classes to use. Also applies
   * #eventBodyTemplate and calls the {@link #config-eventRenderer}.
   * @private
   * @param {Scheduler.model.EventModel} eventRecord Event to generate data for
   * @param {Scheduler.model.ResourceModel} resourceRecord Events resource
   * @param {Boolean|Object} includeOutside Specify true to get boxes for timespans outside the rendered zone in both
   * dimensions. This option is used when calculating dependency lines, and we need to include routes from timespans
   * which may be outside the rendered zone.
   * @param {Boolean} includeOutside.timeAxis Pass as `true` to include timespans outside the TimeAxis's bounds
   * @param {Boolean} includeOutside.viewport Pass as `true` to include timespans outside the vertical timespan viewport's bounds.
   * @returns {Object} Data to use in event template, or `undefined` if the event is outside the rendered zone.
   */
  generateRenderData(eventRecord, resourceRecord, includeOutside = { viewport: true }) {
    var _a, _b;
    const me = this, renderData = me.currentOrientation.getTimeSpanRenderData(eventRecord, resourceRecord, includeOutside), { isEvent } = eventRecord, { eventResize } = me.features, isMilestone = !eventRecord.meta.isDragCreating && eventRecord.isMilestone, assignmentRecord = isEvent && eventRecord.assignments.find((a) => a.resourceId === resourceRecord.$originalId), eventContent = {
      className: "b-sch-event-content",
      role: "presentation",
      dataset: {
        taskBarFeature: "content"
      }
    };
    if (renderData) {
      renderData.tabIndex = "0";
      let resizable = eventRecord.isResizable;
      if (eventResize && resizable) {
        if (renderData.startsOutsideView) {
          if (resizable === true) {
            resizable = "end";
          } else if (resizable === "start") {
            resizable = false;
          }
        }
        if (renderData.endsOutsideView) {
          if (resizable === true) {
            resizable = "start";
          } else if (resizable === "end") {
            resizable = false;
          }
        }
        if (resizable) {
          if (me.isHorizontal) {
            if (!me.rtl && !eventResize.leftHandle || me.rtl && !eventResize.rightHandle) {
              resizable = resizable === "start" ? false : "end";
            } else if (!me.rtl && !eventResize.rightHandle || me.rtl && !eventResize.leftHandle) {
              resizable = resizable === "end" ? false : "start";
            }
          } else {
            if (!eventResize.topHandle) {
              resizable = resizable === "start" ? false : "end";
            } else if (!eventResize.bottomHandle) {
              resizable = resizable === "end" ? false : "start";
            }
          }
        }
      }
      const isDirty = Boolean(
        eventRecord.hasPersistableChanges || (assignmentRecord == null ? void 0 : assignmentRecord.hasPersistableChanges)
      ), clsListObj = {
        [resourceRecord.cls]: resourceRecord.cls,
        [me.generatedIdCls]: !eventRecord.isOccurrence && eventRecord.hasGeneratedId,
        [me.dirtyCls]: isDirty,
        [me.committingCls]: eventRecord.isCommitting,
        [me.endsOutsideViewCls]: renderData.endsOutsideView,
        [me.startsOutsideViewCls]: renderData.startsOutsideView,
        "b-clipped-start": renderData.clippedStart,
        "b-clipped-end": renderData.clippedEnd,
        "b-iscreating": eventRecord.isCreating,
        "b-rtl": me.rtl
      }, wrapperClsListObj = {
        [`${me.eventCls}-parent`]: resourceRecord.isParent,
        "b-readonly": eventRecord.readOnly || (assignmentRecord == null ? void 0 : assignmentRecord.readOnly),
        "b-linked-resource": resourceRecord.isLinked,
        "b-original-resource": resourceRecord.hasLinks
      }, clsList = eventRecord.isResourceTimeRange ? new DomClassList() : eventRecord.internalCls.clone(), wrapperClsList = eventRecord.isResourceTimeRange ? eventRecord.internalCls.clone() : new DomClassList();
      renderData.wrapperStyle = "";
      renderData.isWrap = true;
      if (isEvent) {
        const selected = assignmentRecord && me.isAssignmentSelected(assignmentRecord);
        ObjectHelper.assign(clsListObj, {
          [me.eventCls]: 1,
          "b-milestone": isMilestone,
          "b-sch-event-narrow": !isMilestone && renderData.width < me.narrowEventWidth,
          [me.fixedEventCls]: eventRecord.isDraggable === false,
          [`b-sch-event-resizable-${resizable}`]: Boolean(eventResize && !eventRecord.readOnly),
          [me.eventSelectedCls]: selected,
          [me.eventAssignHighlightCls]: me.eventAssignHighlightCls && !selected && me.isEventSelected(eventRecord),
          "b-recurring": eventRecord.isRecurring,
          "b-occurrence": eventRecord.isOccurrence,
          "b-inactive": eventRecord.inactive
        });
        renderData.eventId = eventRecord.id;
        const eventStyle2 = me.getEventStyle(eventRecord, resourceRecord), eventColor2 = me.getEventColor(eventRecord, resourceRecord), hasAnimation = me.isFirstRender && me.useInitialAnimation && globalThis.bryntum.noAnimations !== true;
        ObjectHelper.assign(wrapperClsListObj, {
          [`${me.eventCls}-wrap`]: 1,
          "b-milestone-wrap": isMilestone,
          [me.navigator.focusCls]: eventRecord.assignments.some((a) => a === me.activeAssignment)
        });
        if (hasAnimation) {
          const index = renderData.row ? renderData.row.index : (renderData.top - me.scrollTop) / me.tickSize, delayMS = index / 20 * 1e3;
          renderData.wrapperStyle = `animation-delay: ${delayMS}ms;`;
          me.maxDelay = Math.max(me.maxDelay || 0, delayMS);
          if (!me.initialAnimationDetacher) {
            me.initialAnimationDetacher = EventHelper.on({
              element: me.foregroundCanvas,
              delegate: me.eventSelector,
              // Just listen for the first animation end fired by our event els
              once: true,
              animationend: () => me.setTimeout({
                fn: "stopInitialAnimation",
                delay: me.maxDelay,
                cancelOutstanding: true
              }),
              // Fallback in case animation is interrupted
              expires: {
                alt: "stopInitialAnimation",
                delay: me.initialAnimationDuration + me.maxDelay
              },
              thisObj: me
            });
          }
        }
        renderData.eventColor = eventColor2;
        renderData.eventStyle = eventStyle2;
        renderData.assignmentRecord = renderData.assignment = assignmentRecord;
      }
      renderData.wrapperCls = ObjectHelper.assign(wrapperClsList, wrapperClsListObj);
      renderData.cls = ObjectHelper.assign(clsList, clsListObj);
      renderData.iconCls = new DomClassList(eventRecord.getValue(me.eventBarIconClsField) || eventRecord.iconCls);
      if (eventRecord.isResourceTimeRange) {
        renderData.style = "";
        renderData.wrapperStyle += eventRecord.style || "";
      } else {
        renderData.style = eventRecord.style || "";
      }
      renderData.resource = renderData.resourceRecord = resourceRecord;
      renderData.resourceId = renderData.rowId;
      if (isEvent) {
        let childContent = null, milestoneLabelConfig = null, value;
        if (me.eventRenderer) {
          const rendererValue = me.eventRenderer.call(me.eventRendererThisObj || me, {
            eventRecord,
            resourceRecord,
            assignmentRecord: renderData.assignmentRecord,
            renderData
          });
          if (typeof renderData.cls === "string") {
            renderData.cls = new DomClassList(renderData.cls);
          }
          if (typeof renderData.wrapperCls === "string") {
            renderData.wrapperCls = new DomClassList(renderData.wrapperCls);
          }
          if (typeof renderData.iconCls === "string") {
            renderData.iconCls = new DomClassList(renderData.iconCls);
          }
          if (me.eventBodyTemplate) {
            value = me.eventBodyTemplate(rendererValue);
          } else {
            value = rendererValue;
          }
        } else if (me.eventBodyTemplate) {
          value = me.eventBodyTemplate(eventRecord);
        } else if (me.eventBarTextField) {
          value = StringHelper.encodeHtml(eventRecord.getValue(me.eventBarTextField) || "");
        }
        if (!me.eventBodyTemplate || Array.isArray(value)) {
          eventContent.children = [];
          if (isMilestone && (me.milestoneLayoutMode === "default" || me.milestoneTextPosition === "always-outside") && value != null && value !== "") {
            eventContent.children.unshift(milestoneLabelConfig = {
              tag: "label",
              children: []
            });
          }
          if ((_a = renderData.iconCls) == null ? void 0 : _a.length) {
            eventContent.children.unshift({
              tag: "i",
              className: renderData.iconCls
            });
          }
          if (Array.isArray(value)) {
            (milestoneLabelConfig || eventContent).children.push(...value);
          } else if (StringHelper.isHtml(value)) {
            if (eventContent.children.length) {
              childContent = {
                tag: "span",
                class: "b-event-text-wrap",
                html: value
              };
            } else {
              eventContent.children = null;
              eventContent.html = value;
            }
          } else if (typeof value === "string" || typeof value === "object") {
            childContent = value;
          } else if (value != null) {
            childContent = String(value);
          }
          if (childContent != null) {
            (milestoneLabelConfig || eventContent).children.push(childContent);
            renderData.cls.add("b-has-content");
          }
          if (eventContent.html != null || eventContent.children.length) {
            renderData.children.push(eventContent);
          }
        } else {
          eventContent.html = value;
          renderData.children.push(eventContent);
        }
      }
      const { eventStyle, eventColor, wrapperCls } = renderData;
      wrapperCls[`b-sch-style-${eventStyle || "none"}`] = 1;
      if (DomHelper.isNamedColor(eventColor)) {
        wrapperCls[`b-sch-color-${eventColor}`] = eventColor;
      } else if (eventColor) {
        const colorProp = eventStyle ? "color" : "background-color", style = `${colorProp}:${eventColor};`;
        renderData.style = style + renderData.style;
        wrapperCls["b-sch-custom-color"] = 1;
        renderData._customColorStyle = style;
      } else {
        wrapperCls[`b-sch-color-none`] = 1;
      }
      if (renderData.style && isMilestone && eventContent) {
        eventContent.style = renderData.style;
        delete renderData.style;
      }
      renderData.cls["b-sch-event-withicon"] = (_b = renderData.iconCls) == null ? void 0 : _b.length;
      renderData.eventContent = eventContent;
      renderData.wrapperChildren = [];
      me.onEventDataGenerated(renderData);
    }
    return renderData;
  }
  /**
   * A method which may be chained by features. It is called when an event's render
   * data is calculated so that features may update the style, class list or body.
   * @param {Object} eventData
   * @internal
   */
  onEventDataGenerated(eventData) {
  }
  //endregion
  //region Initial animation
  changeUseInitialAnimation(name) {
    return name === true ? "fade-in" : name;
  }
  updateUseInitialAnimation(name, old) {
    const { classList } = this.element;
    if (old) {
      classList.remove(`b-initial-${old}`);
    }
    if (name) {
      classList.add(`b-initial-${name}`);
      if (BrowserHelper.isFirefox) {
        classList.add("b-prevent-event-transitions");
      }
    }
  }
  /**
   * Restarts initial events animation with new value {@link #config-useInitialAnimation}.
   * @param {Boolean|String} initialAnimation new initial animation value
   * @category Misc
   */
  restartInitialAnimation(initialAnimation) {
    var _a;
    const me = this;
    (_a = me.initialAnimationDetacher) == null ? void 0 : _a.call(me);
    me.initialAnimationDetacher = null;
    me.useInitialAnimation = initialAnimation;
    me.isFirstRender = true;
    me.refresh();
  }
  stopInitialAnimation() {
    const me = this;
    me.initialAnimationDetacher();
    me.isFirstRender = false;
    me.useInitialAnimation = false;
    if (BrowserHelper.isFirefox) {
      me.setTimeout(() => me.element.classList.remove("b-prevent-event-transitions"), 100);
    }
  }
  //endregion
  //region Milestones
  /**
   * Determines width of a milestones label. How width is determined is decided by configuring
   * {@link #config-milestoneLayoutMode}. Please note that text width is always determined using the events
   * {@link Scheduler/model/EventModel#field-name}.
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @returns {Number}
   * @category Milestones
   */
  getMilestoneLabelWidth(eventRecord, resourceRecord) {
    const me = this, mode = me.milestoneLayoutMode, size = me.getResourceLayoutSettings(resourceRecord).contentHeight;
    if (mode === "measure") {
      const html = StringHelper.encodeHtml(eventRecord.name), color = me.getEventColor(eventRecord, resourceRecord), style = me.getEventStyle(eventRecord, resourceRecord), element = me.milestoneMeasureElement || (me.milestoneMeasureElement = DomHelper.createElement({
        className: {
          "b-sch-event-wrap": 1,
          "b-milestone-wrap": 1,
          "b-measure": 1,
          [`b-sch-color-${color}`]: color,
          [`b-sch-style-${style}`]: style
        },
        children: [
          {
            className: "b-sch-event b-milestone",
            children: [
              {
                className: "b-sch-event-content",
                children: [
                  { tag: "label" }
                ]
              }
            ]
          }
        ],
        parent: me.foregroundCanvas
      }));
      element.retainElement = true;
      element.style.fontSize = `${size}px`;
      if (me.milestoneTextPosition === "always-outside") {
        const label = element.firstElementChild.firstElementChild.firstElementChild;
        label.innerHTML = html;
        const bounds = Rectangle.from(label, label.parentElement);
        return bounds.left + bounds.width + 2;
      } else {
        element.firstElementChild.firstElementChild.innerHTML = `<label></label>${html}`;
        return element.firstElementChild.offsetWidth;
      }
    }
    if (mode === "estimate") {
      return eventRecord.name.length * me.milestoneCharWidth + (me.milestoneTextPosition === "always-outside" ? size : 0);
    }
    if (mode === "data") {
      return eventRecord.milestoneWidth;
    }
    return 0;
  }
  updateMilestoneLayoutMode(mode) {
    const me = this, alwaysOutside = me.milestoneTextPosition === "always-outside";
    me.element.classList.toggle("b-sch-layout-milestones", mode !== "default" && !alwaysOutside);
    me.element.classList.toggle("b-sch-layout-milestone-labels", mode !== "default" && alwaysOutside);
    if (!me.isConfiguring) {
      me.refreshWithTransition();
    }
  }
  updateMilestoneTextPosition(position) {
    this.element.classList.toggle("b-sch-layout-milestone-text-position-inside", position === "inside");
    this.updateMilestoneLayoutMode(this.milestoneLayoutMode);
  }
  updateMilestoneAlign() {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  }
  updateMilestoneCharWidth() {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  }
  // endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/data/mixin/ProjectConsumer.js
var engineStoreNames = [
  "assignmentStore",
  "dependencyStore",
  "eventStore",
  "resourceStore"
];
var ProjectConsumer_default = (Target) => {
  var _suspendedByRestore, _a;
  return _a = class extends (Target || Base) {
    constructor() {
      super(...arguments);
      __privateAdd(this, _suspendedByRestore, void 0);
    }
    static get $name() {
      return "ProjectConsumer";
    }
    //region Default config
    static get declarable() {
      return ["projectStores"];
    }
    static get configurable() {
      return {
        projectModelClass: ProjectModel,
        /**
         * A {@link Scheduler.model.ProjectModel} instance or a config object. The project holds all Scheduler data.
         * Can be omitted in favor of individual store configs or {@link Scheduler.view.mixin.SchedulerStores#config-crudManager} config.
         *
         * **Note:** In SchedulerPro the project is instance of SchedulerPro.model.ProjectModel class.
         * @prp {Scheduler.model.ProjectModel|ProjectModelConfig} project
         * @typings {ProjectModel|ProjectModelConfig}
         * @category Data
         */
        project: {},
        /**
         * Configure as `true` to destroy the Project and stores when `this` is destroyed.
         * @config {Boolean}
         * @category Data
         */
        destroyStores: null,
        // Will be populated by AttachToProjectMixin which features mix in
        projectSubscribers: []
      };
    }
    //endregion
    startConfigure(config) {
      this.getConfig("project");
      super.startConfigure(config);
    }
    //region Project
    // This is where all the ingestion happens.
    // At config time, the changers inject incoming values into the project config object
    // that we are building. At the end we instantiate the project with all incoming
    // config values filled in.
    changeProject(project, oldProject) {
      const me = this, {
        projectStoreNames,
        projectDataNames
      } = me.constructor;
      me.projectCallbacks = /* @__PURE__ */ new Set();
      if (project) {
        me.buildingProjectConfig = true;
        if (!project.isModel) {
          if (me.isConfiguring) {
            me._project = project;
            const { crudManager } = me;
            if (crudManager) {
              const { isCrudManager } = crudManager;
              for (const storeName of projectStoreNames) {
                if (crudManager[storeName]) {
                  me[storeName] = crudManager[storeName];
                  if (!isCrudManager) {
                    delete crudManager[storeName];
                  }
                }
              }
            }
            me.getConfig("projectStores");
            for (const dataName of projectDataNames) {
              me.getConfig(dataName);
            }
          }
          const { eventStore } = project;
          let { _sharedProject: sharedProject } = me;
          if (eventStore && !eventStore.isEventStoreMixin && eventStore.autoLoad && !eventStore.count) {
            eventStore.autoLoad = false;
            me.delayAutoLoad = true;
          }
          if (sharedProject && engineStoreNames.some((store) => project[store] && project[store] !== sharedProject[store])) {
            for (const store of engineStoreNames) {
              if (project[store] && project[store] === sharedProject[store]) {
                project[store] = project[store].chain();
              }
            }
            sharedProject = null;
          }
          project = sharedProject || new me.projectModelClass(project);
          delete me._project;
        }
        me.buildingProjectConfig = false;
      }
      return project;
    }
    /**
     * Implement in subclass to take action when project is replaced.
     *
     * __`super.updateProject(...arguments)` must be called first.__
     *
     * @param {Scheduler.model.ProjectModel} project
     * @category Data
     */
    updateProject(project, oldProject) {
      var _a2;
      const me = this, {
        projectListeners,
        crudManager
      } = me;
      me.detachListeners("projectConsumer");
      delete me._crudManager;
      if (project) {
        projectListeners.thisObj = me;
        project.ion(projectListeners);
        if (project.isCrudManager) {
          me.crudManager = project;
        } else if (crudManager) {
          crudManager.project = project;
          me.crudManager = crudManager;
        }
        me.projectSubscribers.forEach((subscriber) => {
          subscriber.detachFromProject(oldProject);
          subscriber.attachToProject(project);
        });
        for (const storeName of me.constructor.projectStoreNames) {
          me[storeName] = project[storeName];
        }
        if (me.delayAutoLoad) {
          project.eventStore.autoLoad = true;
          project.eventStore.load();
        }
        (_a2 = project.stm) == null ? void 0 : _a2.ion({
          name: "projectConsumer",
          restoringStart: "onProjectRestoringStart",
          restoringStop: "onProjectRestoringStop",
          thisObj: me
        });
      }
      me.trigger("projectChange", { project });
    }
    // Implementation here because we need to get first look at it to adopt its stores
    changeCrudManager(crudManager) {
      if (this.buildingProjectConfig) {
        this._crudManager = crudManager.isCrudManager ? crudManager : Object.assign({}, crudManager);
      } else {
        return super.changeCrudManager(crudManager);
      }
    }
    // Called when project changes are committed, after data is written back to records
    onProjectDataReady() {
      const me = this;
      me.whenVisible(() => {
        if (me.projectCallbacks.size) {
          me.projectCallbacks.forEach((callback) => callback());
          me.projectCallbacks.clear();
        }
      }, null, null, "onProjectDataReady");
    }
    onProjectRestoringStart({ stm }) {
      const { rawQueue } = stm;
      if (rawQueue.length && rawQueue[rawQueue.length - 1].length > 1) {
        __privateSet(this, _suspendedByRestore, true);
        this.suspendRefresh();
      }
    }
    onProjectRestoringStop() {
      if (__privateGet(this, _suspendedByRestore)) {
        __privateSet(this, _suspendedByRestore, false);
        this.resumeRefresh(true);
      }
    }
    // Overridden in CalendarStores.js
    onBeforeTimeZoneChange() {
    }
    // When project changes time zone, change start and end dates
    onTimeZoneChange({ timeZone, oldTimeZone }) {
      const me = this;
      if (me.startDate && me.timeAxis.timeZone !== timeZone) {
        const startDate = oldTimeZone != null ? TimeZoneHelper.fromTimeZone(me.startDate, oldTimeZone) : me.startDate;
        me.startDate = timeZone != null ? TimeZoneHelper.toTimeZone(startDate, timeZone) : startDate;
        me.timeAxis.timeZone = timeZone;
      }
    }
    onStartApplyChangeset() {
      this.suspendRefresh();
    }
    onEndApplyChangeset() {
      this.resumeRefresh(true);
    }
    /**
     * Accepts a callback that will be called when the underlying project is ready (no commit pending and current commit
     * finalized)
     * @param {Function} callback
     * @category Data
     */
    whenProjectReady(callback) {
      if (this.isEngineReady) {
        callback();
      } else {
        this.projectCallbacks.add(callback);
      }
    }
    /**
     * Returns `true` if engine is in a stable calculated state, `false` otherwise.
     * @property {Boolean}
     * @category Misc
     */
    get isEngineReady() {
      var _a2, _b;
      return Boolean((_b = (_a2 = this.project).isEngineReady) == null ? void 0 : _b.call(_a2));
    }
    //endregion
    //region Destroy
    // Cleanup, destroys stores if this.destroyStores is true.
    doDestroy() {
      super.doDestroy();
      if (this.destroyStores) {
        !this.project.isDestroyed && this.project.destroy();
      }
    }
    //endregion
    get projectStores() {
      const { projectStoreNames } = this.constructor;
      return projectStoreNames.map((storeName) => this[storeName]);
    }
    static get projectStoreNames() {
      return Object.keys(this.projectStores);
    }
    static get projectDataNames() {
      return this.projectStoreNames.reduce((result, storeName) => {
        const { dataName } = this.projectStores[storeName];
        if (dataName) {
          result.push(dataName);
        }
        return result;
      }, []);
    }
    static setupProjectStores(cls, meta) {
      const { projectStores } = cls;
      if (projectStores) {
        const projectListeners = {
          name: "projectConsumer",
          dataReady: "onProjectDataReady",
          change: "relayProjectDataChange",
          beforeTimeZoneChange: "onBeforeTimeZoneChange",
          timeZoneChange: "onTimeZoneChange",
          startApplyChangeset: "onStartApplyChangeset",
          endApplyChangeset: "onEndApplyChangeset"
        }, storeConfigs = {
          projectListeners
        };
        let previousDataName;
        for (const storeName in projectStores) {
          const { dataName } = projectStores[storeName];
          storeConfigs[storeName] = storeConfigs[dataName] = null;
          if (dataName) {
            Object.defineProperty(meta.class.prototype, dataName, {
              configurable: true,
              // So that Config can add its setter.
              get() {
                var _a2;
                return (_a2 = this.project[storeName]) == null ? void 0 : _a2.records;
              }
            });
            this.createDataUpdater(storeName, dataName, previousDataName, meta);
          }
          this.createStoreDescriptor(meta, storeName, projectStores[storeName], projectListeners);
          previousDataName = dataName;
        }
        this.setupConfigs(meta, storeConfigs);
      }
    }
    static createDataUpdater(storeName, dataName, previousDataName, meta) {
      meta.class.prototype[`update${StringHelper.capitalize(dataName)}`] = function(data) {
        const { project } = this;
        previousDataName && this.getConfig(previousDataName);
        if (this.buildingProjectConfig) {
          project[`${dataName}Data`] = data;
        } else {
          project[storeName].data = data;
        }
      };
    }
    // eslint-disable-next-line bryntum/no-listeners-in-lib
    static createStoreDescriptor(meta, storeName, { listeners }, projectListeners) {
      const { prototype: clsProto } = meta.class, storeNameCap = StringHelper.capitalize(storeName);
      projectListeners[`${storeName}Change`] = function({ store }) {
        this[storeName] = store;
      };
      clsProto[`change${storeNameCap}`] = function(store, oldStore) {
        const me = this, { project } = me, storeProject = store == null ? void 0 : store.project;
        if (me.buildingProjectConfig) {
          if (storeProject == null ? void 0 : storeProject.isProjectModel) {
            me._sharedProject = storeProject;
          }
          project[storeName] = store;
          return;
        }
        if (!me.initializingProject) {
          if (project[storeName] !== store) {
            project[`set${storeNameCap}`](store);
            store = project[storeName];
          }
        }
        if (store !== oldStore) {
          if (listeners) {
            listeners.thisObj = me;
            listeners.name = `${storeName}Listeners`;
            listeners.startApplyChangeset = "onProjectStoreStartApplyChangeset";
            listeners.endApplyChangeset = "onProjectStoreEndApplyChangeset";
            me.detachListeners(listeners.name);
            store.ion(listeners);
          }
          me[`_${storeName}`] = store;
          me.projectSubscribers.forEach((subscriber) => {
            var _a2;
            (_a2 = subscriber[`attachTo${storeNameCap}`]) == null ? void 0 : _a2.call(subscriber, store);
          });
          me[`_${storeName}`] = null;
        }
        return store;
      };
    }
    onProjectStoreStartApplyChangeset() {
      this.suspendRefresh();
    }
    onProjectStoreEndApplyChangeset() {
      this.resumeRefresh(true);
    }
    relayProjectDataChange(event) {
      if ((event.isExpand || event.isCollapse) && !event.records[0].fieldMap.expanded.persist) {
        return;
      }
      return this.trigger("dataChange", { project: event.source, ...event, source: this });
    }
    //region WidgetClass
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
    //endregion
  }, _suspendedByRestore = new WeakMap(), _a;
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerStores.js
var SchedulerStores_default = (Target) => class SchedulerStores extends ProjectConsumer_default(Target || Base) {
  static get $name() {
    return "SchedulerStores";
  }
  //region Default config
  // This is the static definition of the Stores we consume from the project, and
  // which we must provide *TO* the project if we or our CrudManager is configured
  // with them.
  // The property name is the store name, and within that there is the dataName which
  // is the property which provides static data definition. And there is a listeners
  // definition which specifies the listeners *on this object* for each store.
  //
  // To process incoming stores, implement an updateXxxxxStore method such
  // as `updateEventStore(eventStore)`.
  //
  // To process an incoming Project implement `updateProject`. __Note that
  // `super.updateProject(...arguments)` must be called first.__
  static get projectStores() {
    return {
      resourceStore: {
        dataName: "resources"
      },
      eventStore: {
        dataName: "events",
        // eslint-disable-next-line bryntum/no-listeners-in-lib
        listeners: {
          batchedUpdate: "onEventStoreBatchedUpdate",
          changePreCommit: "onInternalEventStoreChange",
          commitStart: "onEventCommitStart",
          commit: "onEventCommit",
          exception: "onEventException",
          idchange: "onEventIdChange",
          beforeLoad: "onBeforeLoad"
        }
      },
      assignmentStore: {
        dataName: "assignments",
        // eslint-disable-next-line bryntum/no-listeners-in-lib
        listeners: {
          changePreCommit: "onAssignmentChange",
          // In EventSelection.js
          commitStart: "onAssignmentCommitStart",
          commit: "onAssignmentCommit",
          exception: "onAssignmentException",
          beforeRemove: {
            fn: "onAssignmentBeforeRemove",
            // We must go last in case an app vetoes a remove
            // by returning false from a handler.
            prio: -1e3
          }
        }
      },
      dependencyStore: {
        dataName: "dependencies"
      },
      calendarManagerStore: {},
      timeRangeStore: {},
      resourceTimeRangeStore: {}
    };
  }
  static get configurable() {
    return {
      /**
       * Overridden to *not* auto create a store at the Scheduler level.
       * The store is the {@link Scheduler.data.ResourceStore} of the backing project
       * @config {Core.data.Store}
       * @private
       */
      store: null,
      /**
       * The name of the start date parameter that will be passed to in every `eventStore` load request.
       * @config {String}
       * @category Data
       */
      startParamName: "startDate",
      /**
       * The name of the end date parameter that will be passed to in every `eventStore` load request.
       * @config {String}
       * @category Data
       */
      endParamName: "endDate",
      /**
       * Set to true to include `startDate` and `endDate` params indicating the currently viewed date range.
       * Dates are formatted using the same format as the `startDate` field on the EventModel
       * (e.g. 2023-03-08T00:00:00+01:00).
       *
       * Enabled by default in version 6.0 and above.
       *
       * @config {Boolean}
       */
      passStartEndParameters: VersionHelper.checkVersion("core", "6.0", ">="),
      /**
       * Class that should be used to instantiate a CrudManager in case it's provided as a simple object to
       * {@link #config-crudManager} config.
       * @config {Scheduler.data.CrudManager}
       * @typings {typeof CrudManager}
       * @category Data
       */
      crudManagerClass: null,
      /**
       * Get/set the CrudManager instance
       * @member {Scheduler.data.CrudManager} crudManager
       * @category Data
       */
      /**
       * Supply a {@link Scheduler.data.CrudManager} instance or a config object if you want to use
       * CrudManager for handling data.
       * @config {CrudManagerConfig|Scheduler.data.CrudManager}
       * @category Data
       */
      crudManager: null
    };
  }
  //endregion
  //region Project
  updateProject(project, oldProject) {
    super.updateProject(project, oldProject);
    this.detachListeners("schedulerStores");
    project.ion({
      name: "schedulerStores",
      refresh: "onProjectRefresh",
      thisObj: this
    });
  }
  // Called when project changes are committed, before data is written back to records (but still ready to render
  // since data is fetched from engine)
  onProjectRefresh({ isInitialCommit }) {
    const me = this;
    if (me.isVisible) {
      if (isInitialCommit) {
        if (me.isVertical) {
          me.refreshAfterProjectRefresh = false;
          me.refreshWithTransition();
        }
      }
      if (me.refreshAfterProjectRefresh) {
        me.refreshWithTransition(false, !isInitialCommit);
        me.refreshAfterProjectRefresh = false;
      }
      if (me.navigateToAfterRefresh) {
        me.navigateTo(me.navigateToAfterRefresh, {
          scrollIntoView: false
        });
        me.navigateToAfterRefresh = null;
      }
    } else {
      me.whenVisible("refresh", me, [true]);
    }
  }
  //endregion
  //region CrudManager
  changeCrudManager(crudManager) {
    const me = this;
    if (crudManager && !crudManager.isCrudManager) {
      crudManager = me.crudManagerClass.new({
        scheduler: me
      }, crudManager);
    }
    me._crudManager = crudManager;
    me.bindCrudManager(crudManager);
  }
  //endregion
  //region Row store
  get store() {
    if (!this._store && this.isVertical) {
      this._store = new Store({
        data: [
          {
            id: "verticalTimeAxisRow",
            cls: "b-verticaltimeaxis-row"
          }
        ]
      });
    }
    return super.store;
  }
  set store(store) {
    super.store = store;
  }
  // Wrap w/ transition refreshFromRowOnStoreAdd() inherited from Grid
  refreshFromRowOnStoreAdd(row, { isExpand, records }) {
    const args = arguments;
    this.runWithTransition(() => {
      this.currentOrientation.suspended = !isExpand && !records.some((r) => r.isLinked);
      super.refreshFromRowOnStoreAdd(row, ...args);
      this.currentOrientation.suspended = false;
    }, !isExpand);
  }
  onStoreAdd(event) {
    super.onStoreAdd(event);
    if (this.isPainted) {
      this.calculateRowHeights(event.records);
    }
  }
  onStoreUpdateRecord({ source: store, record, changes }) {
    let ignoreCount = 0;
    if ("assigned" in changes) {
      ignoreCount++;
    }
    if ("calendar" in changes) {
      ignoreCount++;
    }
    if (ignoreCount !== Object.keys(changes).length) {
      super.onStoreUpdateRecord(...arguments);
    }
  }
  //endregion
  //region ResourceStore
  updateResourceStore(resourceStore) {
    if (resourceStore && this.isHorizontal) {
      resourceStore.metaMapId = this.id;
      this.store = resourceStore;
    }
  }
  get usesDisplayStore() {
    return this.store !== this.resourceStore;
  }
  //endregion
  //region Events
  onEventIdChange(params) {
    this.currentOrientation.onEventStoreIdChange && this.currentOrientation.onEventStoreIdChange(params);
  }
  /**
   * Listener to the batchedUpdate event which fires when a field is changed on a record which
   * is batch updating. Occasionally UIs must keep in sync with batched changes.
   * For example, the EventResize feature performs batched updating of the startDate/endDate
   * and it tells its client to listen to batchedUpdate.
   * @private
   */
  onEventStoreBatchedUpdate(event) {
    if (this.listenToBatchedUpdates) {
      return this.onInternalEventStoreChange(event);
    }
  }
  /**
   * Calls appropriate functions for current event layout when the event store is modified.
   * @private
   */
  // Named as Internal to avoid naming collision with wrappers that relay events
  onInternalEventStoreChange(params) {
    if (!this.isPainted || !this._mode || params.isAssign || this.assignmentStore.isRemovingAssignment) {
      return;
    }
    if (this.isVisible) {
      this.currentOrientation.onEventStoreChange(params);
    } else {
      this.whenVisible(this.onInternalEventStoreChange, this, [params]);
    }
  }
  /**
   * Refreshes committed events, to remove dirty/committing flag.
   * CSS is added
   * @private
   */
  onEventCommit({ changes }) {
    let resourcesToRepaint = [...changes.added, ...changes.modified].map(
      (eventRecord) => this.eventStore.getResourcesForEvent(eventRecord)
    );
    resourcesToRepaint = Array.prototype.concat.apply([], resourcesToRepaint);
    new Set(resourcesToRepaint).forEach(
      (resourceRecord) => this.repaintEventsForResource(resourceRecord)
    );
  }
  /**
   * Adds the committing flag to changed events before commit.
   * @private
   */
  onEventCommitStart({ changes }) {
    const { currentOrientation, committingCls } = this;
    [...changes.added, ...changes.modified].forEach(
      (eventRecord) => eventRecord.assignments.forEach(
        (assignmentRecord) => currentOrientation.toggleCls(assignmentRecord, committingCls, true)
      )
    );
  }
  // Clear committing flag
  onEventException({ action }) {
    if (action === "commit") {
      const { changes } = this.eventStore;
      [...changes.added, ...changes.modified, ...changes.removed].forEach(
        (eventRecord) => this.repaintEvent(eventRecord)
      );
    }
  }
  onAssignmentCommit({ changes }) {
    this.repaintEventsForAssignmentChanges(changes);
  }
  onAssignmentCommitStart({ changes }) {
    const { currentOrientation, committingCls } = this;
    [...changes.added, ...changes.modified].forEach((assignmentRecord) => {
      currentOrientation.toggleCls(assignmentRecord, committingCls, true);
    });
  }
  // Clear committing flag
  onAssignmentException({ action }) {
    if (action === "commit") {
      this.repaintEventsForAssignmentChanges(this.assignmentStore.changes);
    }
  }
  repaintEventsForAssignmentChanges(changes) {
    const resourcesToRepaint = [...changes.added, ...changes.modified, ...changes.removed].map(
      (assignmentRecord) => assignmentRecord.getResource()
    );
    new Set(resourcesToRepaint).forEach(
      (resourceRecord) => this.repaintEventsForResource(resourceRecord)
    );
  }
  onAssignmentBeforeRemove({ records, removingAll }) {
    if (removingAll) {
      return;
    }
    const me = this, { activeAssignment } = me, deletingActiveAssignment = records.includes(activeAssignment);
    let moveTo;
    if (!me.isConfiguring && // If we have current active assignment or we scheduled navigating to an assignment, we should check
    // if we're removing that assignment in order to avoid navigating to it
    (me.navigateToAfterRefresh || activeAssignment && deletingActiveAssignment)) {
      if (records.includes(me.navigateToAfterRefresh)) {
        me.navigateToAfterRefresh = null;
      }
      const fromEl = me.getElementFromAssignmentRecord(activeAssignment, true);
      if (deletingActiveAssignment && fromEl) {
        const viewport = me.timeAxisSubGrid.rectangle().intersect(me._bodyRectangle), fromRect = Rectangle.from(fromEl), fromCenter = fromRect.center, resourceDim = me.isHorizontal ? "y" : "x", distanceSort = ({ element: e1, distance: d1, center: c1, edgeDistance: ed1 }, { element: e2, distance: d2, center: c2, edgeDistance: ed2 }) => {
          if (e1.dataset.resourceId !== e2.dataset.resourceId) {
            if (Math.abs(c1[resourceDim] - fromCenter[resourceDim]) < Math.abs(c2[resourceDim] - fromCenter[resourceDim])) {
              return -1;
            }
            if (Math.abs(c1[resourceDim] - fromCenter[resourceDim]) > Math.abs(c2[resourceDim] - fromCenter[resourceDim])) {
              return 1;
            }
          }
          return Math.min(ed1, d1) - Math.min(ed2, d2) || c2[resourceDim] - c1[resourceDim];
        }, to = Array.from(me.foregroundCanvas.querySelectorAll(me.navigator.itemSelector)).reduce((result, element) => {
          if (element !== fromEl) {
            const rectangle = Rectangle.from(element).intersect(viewport), assignment = rectangle && me.resolveAssignmentRecord(element);
            if (assignment) {
              const { center } = rectangle, d = fromCenter.getDelta(center), vertGap = center.y < fromCenter.y ? fromRect.y - rectangle.bottom : center.y > fromCenter.y ? rectangle.y - fromRect.bottom : 0, horizGap = center.x < fromCenter.x ? fromRect.x - rectangle.right : center.x > fromCenter.x ? rectangle.x - fromRect.right : 0;
              result.push({
                element,
                assignment,
                center,
                distance: Math.sqrt(d[0] ** 2 + d[1] ** 2),
                edgeDistance: Math.max(
                  vertGap,
                  horizGap
                )
              });
            }
          }
          return result;
        }, []).sort(distanceSort)[0];
        if (to) {
          moveTo = to.assignment;
        }
      }
      if (moveTo) {
        me.navigateTo(moveTo, {
          scrollIntoView: false
        });
        me.navigateToAfterRefresh = moveTo;
      } else {
        DomHelper.focusWithoutScrolling(me.focusElement);
      }
    }
  }
  //endregion
  //region TimeRangeStore & TimeRanges
  /**
   * Inline time ranges, will be loaded into an internally created store if {@link Scheduler.feature.TimeRanges}
   * is enabled.
   * @config {Scheduler.model.TimeSpan[]|TimeSpanConfig[]} timeRanges
   * @category Data
   */
  /**
   * Get/set time ranges, applies to the backing project's TimeRangeStore.
   * @member {Scheduler.model.TimeSpan[]} timeRanges
   * @accepts {Scheduler.model.TimeSpan[]|TimeSpanConfig[]}
   * @category Data
   */
  /**
   * Get/set the time ranges store instance or config object for {@link Scheduler.feature.TimeRanges} feature.
   * @member {Core.data.Store} timeRangeStore
   * @accepts {Core.data.Store|StoreConfig}
   * @category Data
   */
  /**
   * The time ranges store instance for {@link Scheduler.feature.TimeRanges} feature.
   * @config {Core.data.Store|StoreConfig} timeRangeStore
   * @category Data
   */
  set timeRanges(timeRanges) {
    this.project.timeRanges = timeRanges;
  }
  get timeRanges() {
    return this.project.timeRanges;
  }
  //endregion
  //region ResourceTimeRangeStore
  /**
   * Inline resource time ranges, will be loaded into an internally created store if
   * {@link Scheduler.feature.ResourceTimeRanges} is enabled.
   * @prp {Scheduler.model.ResourceTimeRangeModel[]} resourceTimeRanges
   * @accepts {Scheduler.model.ResourceTimeRangeModel[]|ResourceTimeRangeModelConfig[]}
   * @category Data
   */
  /**
   * Get/set the resource time ranges store instance for {@link Scheduler.feature.ResourceTimeRanges} feature.
   * @member {Scheduler.data.ResourceTimeRangeStore} resourceTimeRangeStore
   * @accepts {Scheduler.data.ResourceTimeRangeStore|ResourceTimeRangeStoreConfig}
   * @category Data
   */
  /**
   * Resource time ranges store instance or config object for {@link Scheduler.feature.ResourceTimeRanges} feature.
   * @config {Scheduler.data.ResourceTimeRangeStore|ResourceTimeRangeStoreConfig} resourceTimeRangeStore
   * @category Data
   */
  set resourceTimeRanges(resourceTimeRanges) {
    this.project.resourceTimeRanges = resourceTimeRanges;
  }
  get resourceTimeRanges() {
    return this.project.resourceTimeRanges;
  }
  //endregion
  //region Other functions
  onBeforeLoad({ params }) {
    this.applyStartEndParameters(params);
  }
  /**
   * Get events grouped by timeAxis ticks from resources array
   * @category Data
   * @param {Scheduler.model.ResourceModel[]} resources An array of resources to process. If not passed, all resources
   * will be used.
   * @param {Function} filterFn filter function to filter events if required. Optional.
   * @private
   */
  getResourcesEventsPerTick(resources, filterFn) {
    const { timeAxis, resourceStore } = this, eventsByTick = [];
    resources = resources || resourceStore.records;
    resources.forEach((resource) => {
      resource.events.forEach((event) => {
        if (!timeAxis.isTimeSpanInAxis(event) || filterFn && !filterFn.call(this, { resource, event })) {
          return;
        }
        let startTick = Math.floor(timeAxis.getTickFromDate(event.startDate)), endTick = Math.ceil(timeAxis.getTickFromDate(event.endDate));
        if (startTick == -1) {
          startTick = 0;
        }
        if (endTick === -1) {
          endTick = timeAxis.ticks.length;
        }
        do {
          if (!eventsByTick[startTick]) {
            eventsByTick[startTick] = [event];
          } else {
            eventsByTick[startTick].push(event);
          }
        } while (++startTick < endTick);
      });
    });
    return eventsByTick;
  }
  //endregion
  //region WidgetClass
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
  //endregion
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerScroll.js
var defaultScrollOptions2 = {
  block: "nearest",
  edgeOffset: 20
};
var SchedulerScroll_default = (Target) => class SchedulerScroll extends (Target || Base) {
  static get $name() {
    return "SchedulerScroll";
  }
  //region Scroll to event
  /**
   * Scrolls an event record into the viewport.
   * If the resource store is a tree store, this method will also expand all relevant parent nodes to locate the event.
   *
   * This function is not applicable for events with multiple assignments, please use #scrollResourceEventIntoView instead.
   *
   * @param {Scheduler.model.EventModel} eventRecord the event record to scroll into view
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   * @async
   * @category Scrolling
   */
  async scrollEventIntoView(eventRecord, options = defaultScrollOptions2) {
    const me = this, resources = eventRecord.resources || [eventRecord];
    if (resources.length > 1) {
      throw new Error("scrollEventIntoView() is not applicable for events with multiple assignments, please use scrollResourceEventIntoView() instead.");
    }
    if (!resources.length) {
      console.warn("You have asked to scroll to an event which is not assigned to a resource");
    }
    await me.scrollResourceEventIntoView(resources[0], eventRecord, options);
  }
  /**
   * Scrolls an assignment record into the viewport.
   *
   * If the resource store is a tree store, this method will also expand all relevant parent nodes
   * to locate the event.
   *
   * @param {Scheduler.model.AssignmentModel} assignmentRecord A resource record an event record is assigned to
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   * @category Scrolling
   */
  scrollAssignmentIntoView(assignmentRecord, ...args) {
    return this.scrollResourceEventIntoView(assignmentRecord.resource, assignmentRecord.event, ...args);
  }
  /**
   * Scrolls a resource event record into the viewport.
   *
   * If the resource store is a tree store, this method will also expand all relevant parent nodes
   * to locate the event.
   *
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record an event record is assigned to
   * @param {Scheduler.model.EventModel} eventRecord An event record to scroll into view
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   * @category Scrolling
   * @async
   */
  async scrollResourceEventIntoView(resourceRecord, eventRecord, options = defaultScrollOptions2) {
    var _a, _b;
    const me = this, eventStart = eventRecord.startDate, eventEnd = eventRecord.endDate, eventIsOutside = eventRecord.isScheduled && eventStart < me.timeAxis.startDate | (eventEnd > me.timeAxis.endDate) << 1;
    if (arguments.length > 3) {
      options = arguments[3];
    }
    let el;
    if (options.edgeOffset == null) {
      options.edgeOffset = 20;
    }
    if (eventIsOutside && options.extendTimeAxis !== false) {
      const currentTimeSpanRange = me.timeAxis.endDate - me.timeAxis.startDate;
      if (eventIsOutside === 3) {
        await me.setTimeSpan(
          new Date(eventStart.getTime() - currentTimeSpanRange / 2),
          new Date(eventEnd.getTime() + currentTimeSpanRange / 2)
        );
      } else if (me.infiniteScroll) {
        const { visibleDateRange } = me, visibleMS = visibleDateRange.endMS - visibleDateRange.startMS, sign = eventIsOutside & 1 ? 1 : -1;
        await me.setTimeSpan(
          new Date(eventStart.getTime() - currentTimeSpanRange / 2),
          new Date(eventStart.getTime() + currentTimeSpanRange / 2),
          {
            visibleDate: new Date(eventEnd.getTime() + sign * visibleMS)
          }
        );
      } else {
        if (eventIsOutside & 1) {
          await me.setTimeSpan(
            new Date(eventStart),
            new Date(eventStart.getTime() + currentTimeSpanRange)
          );
        } else {
          await me.setTimeSpan(
            new Date(eventEnd.getTime() - currentTimeSpanRange),
            new Date(eventEnd)
          );
        }
      }
    }
    if (me.isDestroyed) {
      return;
    }
    if (me.store.tree) {
      await ((_a = me.expandTo) == null ? void 0 : _a.call(me, resourceRecord));
    }
    if (((_b = me.features.nestedEvents) == null ? void 0 : _b.enabled) && eventRecord.parent && !eventRecord.parent.isRoot) {
      await me.scrollEventIntoView(eventRecord.parent);
    }
    el = me.getElementFromEventRecord(eventRecord, resourceRecord);
    if (el) {
      if (!DomHelper.isFocusable(el)) {
        el = el.parentNode;
      }
      const scroller = me.timeAxisSubGrid.scrollable;
      await scroller.scrollIntoView(el, options);
      if (me.isDestroyed) {
        return;
      }
      let element;
      do {
        element = me.getElementFromEventRecord(eventRecord, resourceRecord);
        if (!element) {
          await AsyncHelper.animationFrame();
        }
        if (me.isDestroyed) {
          return;
        }
      } while (!element);
    } else if (eventIsOutside === 3 && options.extendTimeAxis === false) {
      console.warn("You have asked to scroll to an event which is outside the current view and extending timeaxis is disabled");
    } else if (!eventRecord.isOccurrence && !me.eventStore.isAvailable(eventRecord)) {
      console.warn("You have asked to scroll to an event which is not available");
    } else if (eventRecord.isScheduled) {
      await me.scrollUnrenderedEventIntoView(resourceRecord, eventRecord, options);
    } else {
      await me.scrollResourceIntoView(resourceRecord, options);
    }
  }
  /**
   * Scrolls an unrendered event into view. Internal function used from #scrollResourceEventIntoView.
   * @private
   * @category Scrolling
   */
  scrollUnrenderedEventIntoView(resourceRec, eventRec, options = defaultScrollOptions2) {
    return new Promise(async (resolve) => {
      const me = this, scroller = me.timeAxisSubGrid.scrollable, scrollerViewport = scroller.viewport, { rowManager } = me, initialY = scroller.y;
      if (!scrollerViewport) {
        resolve();
        return;
      }
      let eventElement, delta, counter = 0;
      do {
        if (++counter >= 50) {
          throw new Error(`Too many preparational scrolls during 'scrollIntoView' for event id = ${eventRec.id}`);
        }
        const box = me.getResourceEventBox(eventRec, resourceRec);
        if (!box) {
          resolve();
          return;
        }
        box.x = Math.ceil(box.x);
        box.y = Math.ceil(box.y);
        if (me.rtl) {
          box.translate(-me.timeAxisViewModel.totalSize + scrollerViewport.width, 0);
        }
        box.translate(scrollerViewport.x - scroller.scrollLeft, scrollerViewport.y - scroller.y);
        const instantScrollOptions = Object.assign({}, defaultScrollOptions2);
        if (delta === void 0) {
          delta = scroller.getDeltaTo(box, instantScrollOptions);
        }
        const scrollPromise = scroller.scrollIntoView(box, instantScrollOptions);
        await scrollPromise;
        if (scrollPromise.cancelled || me.isDestroyed) {
          resolve();
          return true;
        }
        await AsyncHelper.animationFrame();
        if (me.isDestroyed) {
          resolve();
          return true;
        }
        eventElement = me.getElementFromEventRecord(eventRec, resourceRec);
      } while (!eventElement);
      scroller.suspendEvents();
      if (delta.yDelta >= 0) {
        scroller.y = Math.max(rowManager.topRow.top - scroller.viewport.height, initialY);
      } else {
        scroller.y = Math.min(rowManager.bottomRow.bottom, initialY);
      }
      me.fixElementHeights();
      scroller.resumeEvents();
      const scrollPromise2 = scroller.scrollIntoView(
        eventElement,
        Object.assign({}, options, { elementAfterScroll: () => me.getElementFromEventRecord(eventRec, resourceRec) })
      );
      await scrollPromise2;
      if (scrollPromise2.canceled || me.isDestroyed) {
        resolve();
        return true;
      }
      await AsyncHelper.animationFrame();
      resolve();
    });
  }
  /**
   * Scrolls the specified resource into view, works for both horizontal and vertical modes.
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record an event record is assigned to
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} A promise which is resolved when the scrolling has finished.
   * @category Scrolling
   */
  scrollResourceIntoView(resourceRecord, options = defaultScrollOptions2) {
    if (this.isVertical) {
      return this.currentOrientation.scrollResourceIntoView(resourceRecord, options);
    }
    return this.scrollRowIntoView(resourceRecord, options);
  }
  //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerRegions.js
var SchedulerRegions_default = (Target) => class SchedulerRegions extends (Target || Base) {
  static get $name() {
    return "SchedulerRegions";
  }
  //region Orientation dependent regions
  /**
   * Gets the region represented by the schedule and optionally only for a single resource. The view will ask the
   * scheduler for the resource availability by calling getResourceAvailability. By overriding that method you can
   * constrain events differently for different resources.
   * @param {Scheduler.model.ResourceModel} resourceRecord (optional) The resource record
   * @param {Scheduler.model.EventModel} eventRecord (optional) The event record
   * @returns {Core.helper.util.Rectangle} The region of the schedule
   */
  getScheduleRegion(resourceRecord, eventRecord, local = true, dateConstraints) {
    return this.currentOrientation.getScheduleRegion(...arguments);
  }
  /**
   * Gets the region, relative to the timeline view element, representing the passed resource and optionally just for a certain date interval.
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Date} startDate A start date constraining the region
   * @param {Date} endDate An end date constraining the region
   * @returns {Core.helper.util.Rectangle} A Rectangle which encapsulates the resource time span
   */
  getResourceRegion(resourceRecord, startDate, endDate) {
    return this.currentOrientation.getRowRegion(...arguments);
  }
  //endregion
  //region ResourceEventBox
  getAssignmentEventBox(assignmentRecord, includesOutside) {
    return this.getResourceEventBox(assignmentRecord.event, assignmentRecord.resource, includesOutside);
  }
  /**
   * Get the region for a specified resources specified event.
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Boolean} includeOutside Specify true to get boxes for events outside of the rendered zone in both
   *   dimensions. This option is used when calculating dependency lines, and we need to include routes from events
   *   which may be outside the rendered zone.
   * @returns {Core.helper.util.Rectangle}
   */
  getResourceEventBox(eventRecord, resourceRecord, includeOutside = false, roughly = false) {
    return this.currentOrientation.getResourceEventBox(...arguments);
  }
  //endregion
  //region Item box
  /**
   * Gets box for displayed item designated by the record. If several boxes are displayed for the given item
   * then the method returns all of them. Box coordinates are in view coordinate system.
   *
   * Boxes outside scheduling view timeaxis timespan and inside collapsed rows (if row defining store is a tree store)
   * will not be returned. Boxes outside scheduling view vertical visible area (i.e. boxes above currently visible
   * top row or below currently visible bottom row) will be calculated approximately.
   *
   * @param {Scheduler.model.EventModel} event
   * @returns {Object|Object[]}
   * @returns {Boolean} return.isPainted Whether the box was calculated for the rendered scheduled record or was
   *    approximately calculated for the scheduled record outside of the current vertical view area.
   * @returns {Number} return.top
   * @returns {Number} return.bottom
   * @returns {Number} return.start
   * @returns {Number} return.end
   * @returns {'before'|'after'} return.relPos if the item is not rendered then provides a view relative
   * position one of 'before', 'after'
   * @internal
   */
  getItemBox(event, includeOutside = false) {
    return event.resources.map((resource) => this.getResourceEventBox(event, resource, includeOutside));
  }
  //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/SchedulerState.js
var copyProperties2 = [
  "eventLayout",
  "mode",
  "eventColor",
  "eventStyle",
  "tickSize",
  "fillTicks"
];
var SchedulerState_default = (Target) => class SchedulerState extends (Target || Base) {
  static get $name() {
    return "SchedulerState";
  }
  /**
   * Gets or sets scheduler's state. Check out {@link Scheduler.view.mixin.SchedulerState} mixin
   * and {@link Grid.view.mixin.GridState} for more details.
   * @member {Object} state
   * @property {String} state.eventLayout
   * @property {String} state.eventStyle
   * @property {String} state.eventColor
   * @property {Number} state.barMargin
   * @property {Number} state.tickSize
   * @property {Boolean} state.fillTicks
   * @property {Number} state.zoomLevel
   * @property {'horizontal'|'vertical'} state.mode
   * @property {Object[]} state.columns
   * @property {Boolean} state.readOnly
   * @property {Number} state.rowHeight
   * @property {Object} state.scroll
   * @property {Number} state.scroll.scrollLeft
   * @property {Number} state.scroll.scrollTop
   * @property {Array} state.selectedRecords
   * @property {String} state.selectedCell
   * @property {String} state.style
   * @property {Object} state.subGrids
   * @property {Object} state.store
   * @property {Object} state.store.sorters
   * @property {Object} state.store.groupers
   * @property {Object} state.store.filters
   * @category State
   */
  /**
   * Get scheduler's current state for serialization. State includes rowHeight, headerHeight, readOnly, selectedCell,
   * selectedRecordId, column states and store state etc.
   * @returns {Object} State object to be serialized
   * @private
   */
  getState() {
    return ObjectHelper.copyProperties(super.getState(), this, copyProperties2);
  }
  /**
   * Apply previously stored state.
   * @param {Object} state
   * @private
   */
  applyState(state) {
    var _a;
    this.suspendRefresh();
    let propsToCopy = copyProperties2.slice();
    if ((state == null ? void 0 : state.eventLayout) === "layoutFn") {
      delete state.eventLayout;
      propsToCopy.splice(propsToCopy.indexOf("eventLayout"), 1);
    }
    if ((_a = state == null ? void 0 : state.zoomLevelOptions) == null ? void 0 : _a.width) {
      propsToCopy = propsToCopy.filter((p) => p !== "tickSize");
    }
    ObjectHelper.copyProperties(this, state, propsToCopy);
    super.applyState(state);
    this.resumeRefresh(true, false);
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/EventSelection.js
var EventSelection_default = (Target) => class EventSelection extends (Target || Base) {
  static get $name() {
    return "EventSelection";
  }
  //region Default config
  static get configurable() {
    return {
      /**
       * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      highlightPredecessors: false,
      /**
       * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      highlightSuccessors: false,
      /**
       * Configure as `true` to deselect a selected event upon click.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      deselectOnClick: false,
      /**
       * Configure as `false` to preserve selection when clicking the empty schedule area.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      deselectAllOnScheduleClick: true,
      /**
       * Set to `false` to not select the resource of the event when clicking an event bar.
       * @prp {Boolean}
       * @default
       * @category Selection
       */
      selectResourceOnEventNavigate: true,
      /**
       * Set to `false` to not select the row/resource when clicking the empty area in a time axis cell.
       * @prp {Boolean}
       * @default
       * @category Selection
       */
      selectResourceOnScheduleClick: true,
      /**
       * Collection to store selection.
       * @config {Core.util.Collection}
       * @private
       */
      selectedCollection: {}
    };
  }
  static get defaultConfig() {
    return {
      /**
       * Configure as `true` to allow `CTRL+click` to select multiple events in the scheduler.
       * @config {Boolean}
       * @category Selection
       */
      multiEventSelect: false,
      /**
       * Configure as `true`, or set property to `true` to disable event selection.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      eventSelectionDisabled: false,
      /**
       * CSS class to add to selected events.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      eventSelectedCls: "b-sch-event-selected",
      /**
       * Configure as `true` to trigger `selectionChange` when removing a selected event/assignment.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      triggerSelectionChangeOnRemove: false,
      /**
       * This flag controls whether Scheduler should preserve its selection of events when loading a new dataset
       * (if selected event ids are included in the newly loaded dataset).
       * @config {Boolean}
       * @default
       * @category Selection
       */
      maintainSelectionOnDatasetChange: true,
      /**
       * CSS class to add to other instances of a selected event, to highlight them.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      eventAssignHighlightCls: "b-sch-event-assign-selected"
    };
  }
  //endregion
  //region Events
  /**
   * Fired any time there is a change to the events selected in the Scheduler.
   * @event eventSelectionChange
   * @param {'select'|'deselect'|'update'|'clear'} action One of the actions 'select', 'deselect', 'update',
   * 'clear'
   * @param {Scheduler.model.EventModel[]} selected An array of the Events added to the selection.
   * @param {Scheduler.model.EventModel[]} deselected An array of the Event removed from the selection.
   * @param {Scheduler.model.EventModel[]} selection The new selection.
   */
  /**
   * Fired any time there is going to be a change to the events selected in the Scheduler.
   * Returning `false` prevents the change
   * @event beforeEventSelectionChange
   * @preventable
   * @param {String} action One of the actions 'select', 'deselect', 'update', 'clear'
   * @param {Scheduler.model.EventModel[]} selected An array of events that will be added to the selection.
   * @param {Scheduler.model.EventModel[]} deselected An array of events that will be removed from the selection.
   * @param {Scheduler.model.EventModel[]} selection The currently selected events, before applying `selected` and `deselected`.
   */
  /**
   * Fired any time there is a change to the assignments selected in the Scheduler.
   * @event assignmentSelectionChange
   * @param {'select'|'deselect'|'update'|'clear'} action One of the actions 'select', 'deselect', 'update',
   * 'clear'
   * @param {Scheduler.model.AssignmentModel[]} selected An array of the Assignments added to the selection.
   * @param {Scheduler.model.AssignmentModel[]} deselected An array of the Assignments removed from the selection.
   * @param {Scheduler.model.AssignmentModel[]} selection The new selection.
   */
  /**
   * Fired any time there is going to be a change to the assignments selected in the Scheduler.
   * Returning `false` prevents the change
   * @event beforeAssignmentSelectionChange
   * @preventable
   * @param {String} action One of the actions 'select', 'deselect', 'update', 'clear'
   * @param {Scheduler.model.EventModel[]} selected An array of assignments that will be added to the selection.
   * @param {Scheduler.model.EventModel[]} deselected An array of assignments that will be removed from the selection.
   * @param {Scheduler.model.EventModel[]} selection The currently selected assignments, before applying `selected` and `deselected`.
   */
  //endregion
  //region Init
  afterConstruct() {
    var _a;
    super.afterConstruct();
    (_a = this.navigator) == null ? void 0 : _a.ion({
      navigate: "onEventNavigate",
      thisObj: this
    });
  }
  //endregion
  //region Selected Collection
  changeSelectedCollection(selectedCollection) {
    if (!selectedCollection.isCollection) {
      selectedCollection = new Collection(selectedCollection);
    }
    return selectedCollection;
  }
  updateSelectedCollection(selectedCollection) {
    const me = this;
    if (!selectedCollection.owner) {
      selectedCollection.owner = me;
    }
    selectedCollection.ion({
      change: (...args) => me.project.deferUntilRepopulationIfNeeded(
        "onSelectedCollectionChange",
        (...args2) => !me.isDestroying && me.onSelectedCollectionChange(...args2),
        args
      ),
      // deferring this handler breaks the UI
      beforeSplice: "onBeforeSelectedCollectionSplice",
      thisObj: me
    });
  }
  get selectedCollection() {
    return this._selectedCollection;
  }
  getActionType(selection, selected, deselected, before) {
    if (before && selection.length > 0 && deselected.length === selection.length && selected.length === 0 || !before && selection.length === 0 && deselected.length > 0) {
      return "clear";
    }
    return selected.length > 0 && deselected.length > 0 ? "update" : selected.length > 0 ? "select" : "deselect";
  }
  //endregion
  //region Modify selection
  getEventsFromAssignments(assignments) {
    return ArrayHelper.unique(assignments.map((assignment) => assignment.event));
  }
  /**
   * The {@link Scheduler.model.EventModel events} which are selected.
   * @property {Scheduler.model.EventModel[]}
   * @category Selection
   */
  get selectedEvents() {
    return this.getEventsFromAssignments(this.selectedCollection.values);
  }
  set selectedEvents(events) {
    const assignments = [];
    events = ArrayHelper.asArray(events);
    events == null ? void 0 : events.forEach((event) => {
      if (this.isEventSelectable(event) !== false) {
        if (event.isOccurrence) {
          event.assignments.forEach((as) => {
            assignments.push(this.assignmentStore.getOccurrence(as, event));
          });
        } else {
          assignments.push(...event.assignments);
        }
      }
    });
    this.selectedCollection.splice(0, this.selectedCollection.count, assignments);
  }
  /**
   * The {@link Scheduler.model.AssignmentModel events} which are selected.
   * @property {Scheduler.model.AssignmentModel[]}
   * @category Selection
   */
  get selectedAssignments() {
    return this.selectedCollection.values;
  }
  set selectedAssignments(assignments) {
    this.selectedCollection.splice(0, this.selectedCollection.count, assignments || []);
  }
  /**
   * Returns `true` if the {@link Scheduler.model.EventModel event} is selected.
   * @param {Scheduler.model.EventModel} event The event
   * @returns {Boolean} Returns `true` if the event is selected
   * @category Selection
   */
  isEventSelected(event) {
    const { selectedCollection } = this;
    return Boolean(selectedCollection.count && selectedCollection.includes(event.assignments));
  }
  /**
   * A template method (empty by default) allowing you to control if an event can be selected or not.
   *
   * ```javascript
   * new Scheduler({
   *     isEventSelectable(event) {
   *         return event.startDate >= Date.now();
   *     }
   * })
   * ```
   *
   * This selection process is applicable to calendar too:
   *
   * ```javascript
   * new Calendar({
   *     isEventSelectable(event) {
   *         return event.startDate >= Date.now();
   *     }
   * })
   * ```
   *
   * @param {Scheduler.model.EventModel} event The event record
   * @returns {Boolean} true if event can be selected, otherwise false
   * @prp {Function}
   * @category Selection
   */
  isEventSelectable(event) {
  }
  /**
   * Returns `true` if the {@link Scheduler.model.AssignmentModel assignment} is selected.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment
   * @returns {Boolean} Returns `true` if the assignment is selected
   * @category Selection
   */
  isAssignmentSelected(assignment) {
    return this.selectedCollection.includes(assignment);
  }
  /**
   * Selects the passed {@link Scheduler.model.EventModel event} or {@link Scheduler.model.AssignmentModel assignment}
   * *if it is not selected*. Selecting events results in all their assignments being selected.
   * @param {Scheduler.model.EventModel|Scheduler.model.AssignmentModel} eventOrAssignment The event or assignment to select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events or assignments
   * @category Selection
   */
  select(eventOrAssignment, preserveSelection = false) {
    if (eventOrAssignment.isAssignment) {
      this.selectAssignment(eventOrAssignment, preserveSelection);
    } else {
      this.selectEvent(eventOrAssignment, preserveSelection);
    }
  }
  /**
   * Selects the passed {@link Scheduler.model.EventModel event} *if it is not selected*. Selecting an event will
   * select all its assignments.
   * @param {Scheduler.model.EventModel} event The event to select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events
   * @category Selection
   */
  selectEvent(event, preserveSelection = false) {
    if (!this.isEventSelected(event)) {
      this.selectEvents([event], preserveSelection);
    }
  }
  /**
   * Selects the passed {@link Scheduler.model.AssignmentModel assignment} *if it is not selected*.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment to select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected assignments
   * @param {Event} [event] If this method was invoked as a result of a user action, this is the DOM event that triggered it
   * @category Selection
   */
  selectAssignment(assignment, preserveSelection = false, event) {
    if (!this.isAssignmentSelected(assignment)) {
      preserveSelection ? this.selectedCollection.add(assignment) : this.selectedAssignments = assignment;
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.EventModel event} or {@link Scheduler.model.AssignmentModel assignment}
   * *if it is selected*.
   * @param {Scheduler.model.EventModel|Scheduler.model.AssignmentModel} eventOrAssignment The event or assignment to deselect.
   * @category Selection
   */
  deselect(eventOrAssignment) {
    if (eventOrAssignment.isAssignment) {
      this.deselectAssignment(eventOrAssignment);
    } else {
      this.deselectEvent(eventOrAssignment);
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.EventModel event} *if it is selected*.
   * @param {Scheduler.model.EventModel} event The event to deselect.
   * @category Selection
   */
  deselectEvent(event) {
    if (this.isEventSelected(event)) {
      this.selectedCollection.remove(...event.assignments);
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.AssignmentModel assignment} *if it is selected*.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment to deselect
   * @param {Event} [event] If this method was invoked as a result of a user action, this is the DOM event that triggered it
   * @category Selection
   */
  deselectAssignment(assignment) {
    if (this.isAssignmentSelected(assignment)) {
      this.selectedCollection.remove(assignment);
    }
  }
  /**
   * Adds {@link Scheduler.model.EventModel events} to the selection.
   * @param {Scheduler.model.EventModel[]} events Events to be selected
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events
   * @category Selection
   */
  selectEvents(events, preserveSelection = false) {
    if (preserveSelection) {
      const assignments = events.reduce((assignments2, event) => {
        if (this.isEventSelectable(event) !== false) {
          assignments2.push(...event.assignments);
        }
        return assignments2;
      }, []);
      this.selectedCollection.add(assignments);
    } else {
      this.selectedEvents = events;
    }
  }
  /**
   * Removes {@link Scheduler.model.EventModel events} from the selection.
   * @param {Scheduler.model.EventModel[]} events Events or assignments  to be deselected
   * @category Selection
   */
  deselectEvents(events) {
    this.selectedCollection.remove(events.reduce((assignments, event) => {
      assignments.push(...event.assignments);
      return assignments;
    }, []));
  }
  /**
   * Adds {@link Scheduler.model.AssignmentModel assignments} to the selection.
   * @param {Scheduler.model.AssignmentModel[]} assignments Assignments to be selected
   * @category Selection
   */
  selectAssignments(assignments) {
    this.selectedCollection.add(assignments);
  }
  /**
   * Removes {@link Scheduler.model.AssignmentModel assignments} from the selection.
   * @param {Scheduler.model.AssignmentModel[]} assignments Assignments  to be deselected
   * @category Selection
   */
  deselectAssignments(assignments) {
    this.selectedCollection.remove(assignments);
  }
  /**
   * Deselects all {@link Scheduler.model.EventModel events} and {@link Scheduler.model.AssignmentModel assignments}.
   * @category Selection
   */
  clearEventSelection() {
    this.selectedAssignments = [];
  }
  //endregion
  //region Events
  /**
   * Responds to mutations of the underlying selection Collection.
   * Keeps the UI synced, eventSelectionChange and assignmentSelectionChange event is fired when `me.silent` is falsy.
   * @private
   */
  onBeforeSelectedCollectionSplice({ toAdd, toRemove, index }) {
    const me = this, selection = me._selectedCollection.values, selected = toAdd, deselected = toRemove > 0 ? selection.slice(index, toRemove + index) : [], action = me.getActionType(selection, selected, deselected, true);
    if (toAdd.length === 0 && toRemove === 0) {
      return;
    }
    if (me.trigger("beforeEventSelectionChange", {
      action,
      selection: me.getEventsFromAssignments(selection) || [],
      selected: me.getEventsFromAssignments(selected) || [],
      deselected: me.getEventsFromAssignments(deselected) || []
    }) === false) {
      return false;
    }
    if (me.trigger("beforeAssignmentSelectionChange", {
      action,
      selection,
      selected,
      deselected
    }) === false) {
      return false;
    }
  }
  onSelectedCollectionChange({ added, removed }) {
    const me = this, selection = me.selectedAssignments, selected = added || [], deselected = removed || [];
    function updateSelection(assignmentRecord, select) {
      const eventRecord = assignmentRecord.event;
      if (eventRecord) {
        const returnWrapper = false, checkReleased = true, { eventAssignHighlightCls } = me, element = me.getElementFromAssignmentRecord(assignmentRecord, returnWrapper, checkReleased);
        me.currentOrientation.toggleCls(assignmentRecord, me.eventSelectedCls, select, returnWrapper, checkReleased);
        eventAssignHighlightCls && me.getElementsFromEventRecord(eventRecord, null, returnWrapper, checkReleased).forEach((el) => {
          if (el !== element) {
            const otherAssignmentRecord = me.resolveAssignmentRecord(el, checkReleased);
            me.currentOrientation.toggleCls(otherAssignmentRecord, eventAssignHighlightCls, select, returnWrapper, checkReleased);
            if (select && !el.parentElement.isReleased) {
              el.style.animation = "none";
              el.offsetHeight;
              el.style.animation = "";
            }
            el.classList.toggle(eventAssignHighlightCls, select);
          }
        });
      }
    }
    deselected.forEach((record) => updateSelection(record, false));
    selected.forEach((record) => updateSelection(record, true));
    if (me.highlightSuccessors || me.highlightPredecessors) {
      me.highlightLinkedEvents(me.selectedEvents);
    }
    me.$selectedAssignments = selection.map((assignment) => ({
      eventId: assignment.eventId,
      resourceId: assignment.resourceId
    }));
    if (!me.silent) {
      const action = this.getActionType(selection, selected, deselected);
      me.trigger("assignmentSelectionChange", {
        action,
        selection,
        selected,
        deselected
      });
      me.trigger("eventSelectionChange", {
        action,
        selection: me.selectedEvents,
        selected: me.getEventsFromAssignments(selected),
        deselected: me.getEventsFromAssignments(deselected)
      });
    }
  }
  /**
   * Assignment change listener to remove events from selection which are no longer in the assignments.
   * @private
   */
  onAssignmentChange(event) {
    super.onAssignmentChange(event);
    const me = this, { action, records: assignments } = event;
    me.silent = !me.triggerSelectionChangeOnRemove;
    if (action === "remove") {
      me.deselectAssignments(assignments);
    } else if (action === "removeall" && !me.eventStore.isSettingData) {
      me.clearEventSelection();
    } else if (action === "dataset" && me.$selectedAssignments) {
      if (!me.maintainSelectionOnDatasetChange) {
        me.clearEventSelection();
      } else {
        const newAssignments = me.$selectedAssignments.map(
          (selector) => assignments.find(
            (a) => a.eventId === selector.eventId && a.resourceId === selector.resourceId
          )
        );
        me.selectedAssignments = ArrayHelper.clean(newAssignments);
      }
    }
    me.silent = false;
  }
  onInternalEventStoreChange({ source, action, records }) {
    if (!source.isResourceTimeRangeStore && action === "dataset" && !records.length) {
      this.clearEventSelection();
    }
    super.onInternalEventStoreChange(...arguments);
  }
  /**
   * Mouse listener to update selection.
   * @private
   */
  onAssignmentSelectionClick(event, clickedRecord) {
    const me = this;
    if (me.isAssignmentSelected(clickedRecord)) {
      if (me.deselectOnClick || event.ctrlKey) {
        me.deselectAssignment(clickedRecord, me.multiEventSelect, event);
      }
    } else if (this.isEventSelectable(clickedRecord.event) !== false) {
      me.selectAssignment(clickedRecord, event.ctrlKey && me.multiEventSelect, event);
    }
  }
  /**
   * Navigation listener to update selection.
   * @private
   */
  onEventNavigate({ event, item }) {
    if (!this.eventSelectionDisabled) {
      const assignment = item && (item.nodeType === Element.ELEMENT_NODE ? this.resolveAssignmentRecord(item) : item);
      if (assignment) {
        this.onAssignmentSelectionClick(event, assignment);
      } else if (this.deselectAllOnScheduleClick) {
        this.clearEventSelection();
      }
    }
  }
  changeHighlightSuccessors(value) {
    return this.changeLinkedEvents(value);
  }
  changeHighlightPredecessors(value) {
    return this.changeLinkedEvents(value);
  }
  changeLinkedEvents(value) {
    const me = this;
    if (value) {
      me.highlighted = me.highlighted || /* @__PURE__ */ new Set();
      me.highlightLinkedEvents(me.selectedEvents);
    } else if (me.highlighted) {
      me.highlightLinkedEvents();
    }
    return value;
  }
  // Function that highlights/unhighlights events in a dependency chain
  highlightLinkedEvents(eventRecords = []) {
    const me = this, {
      highlighted,
      eventStore
    } = me, dependenciesFeature = me.features.dependencies;
    highlighted.forEach((eventRecord) => {
      if (!eventRecords.includes(eventRecord)) {
        eventRecord.meta.highlight = false;
        highlighted.delete(eventRecord);
        if (eventStore.includes(eventRecord)) {
          eventRecord.dependencies.forEach((dep) => dependenciesFeature.unhighlight(dep, "b-highlight"));
        }
      }
    });
    eventRecords.forEach((eventRecord) => {
      const toWalk = [eventRecord];
      while (toWalk.length) {
        const record = toWalk.pop();
        highlighted.add(record);
        if (me.highlightSuccessors) {
          record.outgoingDeps.forEach((outgoing) => {
            dependenciesFeature.highlight(outgoing, "b-highlight");
            !highlighted.has(outgoing.toEvent) && toWalk.push(outgoing.toEvent);
          });
        }
        if (me.highlightPredecessors) {
          record.incomingDeps.forEach((incoming) => {
            dependenciesFeature.highlight(incoming, "b-highlight");
            !highlighted.has(incoming.fromEvent) && toWalk.push(incoming.fromEvent);
          });
        }
      }
      highlighted.forEach((record) => record.meta.highlight = true);
    });
    me.element.classList.toggle("b-highlighting", eventRecords.length > 0);
    me.refreshWithTransition();
  }
  onEventDataGenerated(renderData) {
    if (this.highlightSuccessors || this.highlightPredecessors) {
      renderData.cls["b-highlight"] = renderData.eventRecord.meta.highlight;
    }
    super.onEventDataGenerated(renderData);
  }
  updateProject(project, old) {
    this.clearEventSelection();
    super.updateProject(project, old);
  }
  //endregion
  doDestroy() {
    var _a;
    ((_a = this._selectedCollection) == null ? void 0 : _a.owner) === this && this._selectedCollection.destroy();
    super.doDestroy();
  }
  //region Getters/Setters
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
  //endregion
};

// ../Scheduler/lib/Scheduler/view/mixin/EventNavigation.js
var preventDefault = (e) => e.preventDefault();
var isArrowKey = {
  ArrowRight: 1,
  ArrowLeft: 1,
  ArrowUp: 1,
  ArrowDown: 1
};
var animate100 = {
  animate: 100
};
var emptyObject2 = Object.freeze({});
var EventNavigation_default = (Target) => class EventNavigation extends Delayable_default(Target || Base) {
  static get $name() {
    return "EventNavigation";
  }
  //region Default config
  static get configurable() {
    return {
      /**
       * A config object to use when creating the {@link Core.helper.util.Navigator}
       * to use to perform keyboard navigation in the timeline.
       * @config {NavigatorConfig}
       * @default
       * @category Misc
       * @internal
       */
      navigator: {
        allowCtrlKey: true,
        scrollSilently: true,
        keys: {
          Space: "onEventSpaceKey",
          Enter: "onEventEnterKey",
          Delete: "onDeleteKey",
          Backspace: "onDeleteKey",
          ArrowUp: "onArrowUpKey",
          ArrowDown: "onArrowDownKey",
          Escape: "onEscapeKey",
          // These are processed by GridNavigation's handlers
          Tab: "onTab",
          "SHIFT+Tab": "onShiftTab"
        }
      },
      isNavigationKey: {
        ArrowDown: 1,
        ArrowUp: 1,
        ArrowLeft: 1,
        ArrowRight: 1
      }
    };
  }
  static get defaultConfig() {
    return {
      /**
       * A CSS class name to add to focused events.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      focusCls: "b-active",
      /**
       * Allow using [Delete] and [Backspace] to remove events/assignments
       * @config {Boolean}
       * @default
       * @category Misc
       */
      enableDeleteKey: true,
      // Number in milliseconds to buffer handlers execution. See `Delayable.throttle` function docs.
      onDeleteKeyBuffer: 500,
      navigatePreviousBuffer: 200,
      navigateNextBuffer: 200,
      testConfig: {
        onDeleteKeyBuffer: 1
      }
    };
  }
  //endregion
  //region Events
  /**
   * Fired when a user gesture causes the active item to change.
   * @event navigate
   * @param {Event} event The browser event which instigated navigation. May be a click or key or focus event.
   * @param {HTMLElement|null} item The newly active item, or `null` if focus moved out.
   * @param {HTMLElement|null} oldItem The previously active item, or `null` if focus is moving in.
   */
  //endregion
  construct(config) {
    const me = this;
    me.isInTimeAxis = me.isInTimeAxis.bind(me);
    me.onDeleteKey = me.throttle(me.onDeleteKey, me.onDeleteKeyBuffer, me);
    super.construct(config);
  }
  changeNavigator(navigator) {
    const me = this;
    me.getConfig("subGridConfigs");
    return new Navigator(me.constructor.mergeConfigs({
      ownerCmp: me,
      target: me.timeAxisSubGridElement,
      processEvent: me.processEvent,
      itemSelector: `.${me.eventCls}-wrap`,
      focusCls: me.focusCls,
      navigatePrevious: me.throttle(me.navigatePrevious, { delay: me.navigatePreviousBuffer, throttled: preventDefault }),
      navigateNext: me.throttle(me.navigateNext, { delay: me.navigateNextBuffer, throttled: preventDefault })
    }, navigator));
  }
  doDestroy() {
    this.navigator.destroy();
    super.doDestroy();
  }
  isInTimeAxis(record) {
    return !record.instanceMeta(this).excluded && this.timeAxis.isTimeSpanInAxis(record);
  }
  onElementKeyDown(keyEvent) {
    var _a, _b, _c;
    const me = this, { navigator } = me;
    if (((_a = me.focusedCell) == null ? void 0 : _a.rowIndex) !== -1 && ((_b = me.focusedCell) == null ? void 0 : _b.column) === me.timeAxisColumn && !keyEvent.target.closest(navigator.itemSelector) && keyEvent.key === "Enter") {
      const firstAssignment = me.getFirstVisibleAssignment();
      if (firstAssignment) {
        me.navigateTo(firstAssignment, {
          uiEvent: keyEvent
        });
        return false;
      }
    } else {
      (_c = super.onElementKeyDown) == null ? void 0 : _c.call(this, keyEvent);
    }
  }
  getFirstVisibleAssignment(location = this.focusedCell) {
    var _a, _b, _c;
    const me = this, {
      currentOrientation,
      rowManager,
      eventStore
    } = me;
    if (me.isHorizontal) {
      let renderedEvents = currentOrientation.rowMap.get(rowManager.getRow(location.rowIndex));
      if (renderedEvents == null ? void 0 : renderedEvents.length) {
        return (_a = renderedEvents[0]) == null ? void 0 : _a.elementData.assignmentRecord;
      } else {
        renderedEvents = (_b = currentOrientation.resourceMap.get(location.id)) == null ? void 0 : _b.eventsData;
        if (renderedEvents == null ? void 0 : renderedEvents.length) {
          return (_c = renderedEvents.filter((e) => eventStore.isAvailable(e.eventRecord))[0]) == null ? void 0 : _c.assignmentRecord;
        }
      }
    } else {
      const firstResource = [...currentOrientation.resourceMap.values()][0], renderedEvents = firstResource && Object.values(firstResource);
      if (renderedEvents == null ? void 0 : renderedEvents.length) {
        return renderedEvents.filter((e) => eventStore.isAvailable(e.renderData.eventRecord))[0].renderData.assignmentRecord;
      }
    }
  }
  onGridBodyFocusIn(focusEvent) {
    var _a;
    const isGridCellFocus = focusEvent.target.closest(this.focusableSelector);
    if (this.timeAxisSubGridElement.contains(focusEvent.target)) {
      const me = this, { navigationEvent } = me, { target } = focusEvent, eventFocus = target.closest(me.navigator.itemSelector), destinationCell = eventFocus ? me.normalizeCellContext({
        rowIndex: me.isVertical ? 0 : me.resourceStore.indexOf(me.resolveResourceRecord(target)),
        column: me.timeAxisColumn,
        target
      }) : new Location(target);
      if (eventFocus) {
        const { _focusedCell } = me;
        me._focusedCell = destinationCell;
        (_a = me.onCellNavigate) == null ? void 0 : _a.call(me, me, _focusedCell, destinationCell, navigationEvent, true);
        return;
      }
      if (isGridCellFocus && (!navigationEvent || isArrowKey[navigationEvent.key])) {
        const firstAssignment = me.getFirstVisibleAssignment(destinationCell);
        if (firstAssignment) {
          me.navigateTo(firstAssignment, {
            // Only change scroll if focus came from key press
            scrollIntoView: Boolean(navigationEvent && navigationEvent.type !== "mousedown"),
            uiEvent: navigationEvent || focusEvent
          });
          return;
        }
      }
    }
    if (isGridCellFocus) {
      super.onGridBodyFocusIn(focusEvent);
    }
  }
  /*
   * Override of GridNavigation#focusCell method to handle the TimeAxisColumn.
   * Not needed until we implement full keyboard accessibility.
   */
  accessibleFocusCell(cellSelector, options) {
    const me = this;
    cellSelector = me.normalizeCellContext(cellSelector);
    if (cellSelector.columnId === me.timeAxisColumn.id) {
    } else {
      return super.focusCell(cellSelector, options);
    }
  }
  // Interface method to extract the navigated to record from a populated 'navigate' event.
  // Gantt, Scheduler and Calendar handle event differently, adding different properties to it.
  // This method is meant to be overridden to return correct target from event
  normalizeTarget(event) {
    return event.assignmentRecord;
  }
  getPrevious(assignmentRecord, isDelete) {
    const me = this, { resourceStore } = me, { eventSorter } = me.currentOrientation, { startDate, endDate } = me.timeAxis, eventRecord = assignmentRecord.event, resourceEvents = me.eventStore.getEvents({
      resourceRecord: assignmentRecord.resource,
      startDate,
      endDate
    }).filter(this.isInTimeAxis).sort(eventSorter);
    let resourceRecord = assignmentRecord.resource, previousEvent = resourceEvents[resourceEvents.indexOf(eventRecord) - 1];
    if (!previousEvent) {
      for (let rowIdx = resourceStore.indexOf(resourceRecord) - 1; (!previousEvent || isDelete && previousEvent === eventRecord) && rowIdx >= 0; rowIdx--) {
        resourceRecord = resourceStore.getAt(rowIdx);
        const events = me.eventStore.getEvents({
          resourceRecord,
          startDate,
          endDate
        }).filter(me.isInTimeAxis).sort(eventSorter);
        previousEvent = events.length && events[events.length - 1];
      }
    }
    return me.assignmentStore.getAssignmentForEventAndResource(previousEvent, resourceRecord);
  }
  navigatePrevious(keyEvent) {
    const me = this, previousAssignment = me.getPrevious(me.normalizeTarget(keyEvent));
    keyEvent.preventDefault();
    if (previousAssignment) {
      if (!keyEvent.ctrlKey) {
        me.clearEventSelection();
      }
      return me.navigateTo(previousAssignment, {
        uiEvent: keyEvent
      });
    }
    return me.doGridNavigation(keyEvent);
  }
  getNext(assignmentRecord, isDelete) {
    const me = this, { resourceStore } = me, { eventSorter } = me.currentOrientation, { startDate, endDate } = me.timeAxis, eventRecord = assignmentRecord.event, resourceEvents = me.eventStore.getEvents({
      resourceRecord: assignmentRecord.resource,
      // start/end are required to limit time
      startDate,
      endDate
    }).filter(this.isInTimeAxis).sort(eventSorter);
    let resourceRecord = assignmentRecord.resource, nextEvent = resourceEvents[resourceEvents.indexOf(eventRecord) + 1];
    if (!nextEvent) {
      for (let rowIdx = resourceStore.indexOf(resourceRecord) + 1; (!nextEvent || isDelete && nextEvent === eventRecord) && rowIdx < resourceStore.count; rowIdx++) {
        resourceRecord = resourceStore.getAt(rowIdx);
        const events = me.eventStore.getEvents({
          resourceRecord,
          startDate,
          endDate
        }).filter(me.isInTimeAxis).sort(eventSorter);
        nextEvent = events[0];
      }
    }
    return me.assignmentStore.getAssignmentForEventAndResource(nextEvent, resourceRecord);
  }
  navigateNext(keyEvent) {
    const me = this, nextAssignment = me.getNext(me.normalizeTarget(keyEvent));
    keyEvent.preventDefault();
    if (nextAssignment) {
      if (!keyEvent.ctrlKey) {
        me.clearEventSelection();
      }
      return me.navigateTo(nextAssignment, {
        uiEvent: keyEvent
      });
    }
    return me.doGridNavigation(keyEvent);
  }
  doGridNavigation(keyEvent) {
    if (!keyEvent.handled && keyEvent.key.indexOf("Arrow") === 0) {
      this[`navigate${keyEvent.key.substring(5)}ByKey`](keyEvent);
    }
  }
  async navigateTo(targetAssignment, {
    scrollIntoView = true,
    uiEvent = {}
  } = emptyObject2) {
    const me = this, { navigator } = me, { skipScrollIntoView } = navigator;
    if (targetAssignment) {
      if (scrollIntoView) {
        navigator.disabled = true;
        await me.scrollAssignmentIntoView(targetAssignment, animate100);
        navigator.disabled = false;
      } else {
        navigator.skipScrollIntoView = true;
      }
      if (!me.isDestroyed && this.getElementFromAssignmentRecord(targetAssignment)) {
        me.activeAssignment = targetAssignment;
        navigator.skipScrollIntoView = skipScrollIntoView;
        navigator.trigger("navigate", {
          event: uiEvent,
          item: me.getElementFromAssignmentRecord(targetAssignment).closest(navigator.itemSelector)
        });
      }
    }
  }
  set activeAssignment(assignmentRecord) {
    const assignmentEl = this.getElementFromAssignmentRecord(assignmentRecord, true);
    if (assignmentEl) {
      this.navigator.activeItem = assignmentEl;
    }
  }
  get activeAssignment() {
    const { activeItem } = this.navigator;
    if (activeItem) {
      return this.resolveAssignmentRecord(activeItem);
    }
  }
  get previousActiveEvent() {
    const { previousActiveItem } = this.navigator;
    if (previousActiveItem) {
      return this.resolveEventRecord(previousActiveItem);
    }
  }
  processEvent(keyEvent) {
    const me = this, eventElement = keyEvent.target.closest(me.eventSelector);
    if (!me.navigator.disabled && eventElement) {
      keyEvent.assignmentRecord = me.resolveAssignmentRecord(eventElement);
      keyEvent.eventRecord = me.resolveEventRecord(eventElement);
      keyEvent.resourceRecord = me.resolveResourceRecord(eventElement);
    }
    return keyEvent;
  }
  onDeleteKey(keyEvent) {
    const me = this;
    if (!me.readOnly && me.enableDeleteKey) {
      const records = me.eventStore.usesSingleAssignment ? me.selectedEvents : me.selectedAssignments;
      me.removeEvents(records.filter((r) => !r.readOnly));
    }
  }
  onArrowUpKey(keyEvent) {
    this.focusCell({
      rowIndex: this.focusedCell.rowIndex - 1,
      column: this.timeAxisColumn
    });
    keyEvent.handled = true;
  }
  onArrowDownKey(keyEvent) {
    if (this.focusedCell.rowIndex < this.resourceStore.count - 1) {
      this.focusCell({
        rowIndex: this.focusedCell.rowIndex + 1,
        column: this.timeAxisColumn
      });
      keyEvent.handled = true;
    }
  }
  onEscapeKey(keyEvent) {
    if (!keyEvent.target.closest(".b-dragging")) {
      this.focusCell({
        rowIndex: this.focusedCell.rowIndex,
        column: this.timeAxisColumn
      });
      keyEvent.handled = true;
    }
  }
  onEventSpaceKey(keyEvent) {
  }
  onEventEnterKey(keyEvent) {
  }
  get isActionableLocation() {
    if (!this.navigator.activeItem) {
      return super.isActionableLocation;
    }
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/mixin/TransactionalFeatureMixin.js
var TransactionalFeatureMixin_default = (Target) => {
  var _a;
  return _a = class extends Target {
    static get $name() {
      return "TransactionalFeatureMixin";
    }
    get widgetClass() {
    }
    /**
     * Returns `true` if queue is supported and enabled
     * @member {Boolean}
     * @internal
     * @readonly
     */
    get transactionalFeaturesEnabled() {
      var _a2;
      return this.enableTransactionalFeatures && ((_a2 = this.project) == null ? void 0 : _a2.queue);
    }
  }, __publicField(_a, "configurable", {
    /**
     * When true, some features will start a project transaction, blocking the project queue, suspending
     * store events and preventing UI from updates. It behaves similar to
     * {@link Grid.column.Column#config-instantUpdate} set to `false`.
     * Set `false` to not use project queue.
     * @config {Boolean}
     * @internal
     * @default
     */
    enableTransactionalFeatures: false,
    testConfig: {
      enableTransactionalFeatures: false
    }
  }), _a;
};

// ../Scheduler/lib/Scheduler/data/mixin/AttachToProjectMixin.js
var AttachToProjectMixin_default = (Target) => class AttachToProjectMixin extends Target {
  static get $name() {
    return "AttachToProjectMixin";
  }
  async afterConstruct() {
    var _a;
    super.afterConstruct();
    const me = this, projectHolder = me.client || me.grid, { project } = projectHolder;
    (_a = projectHolder.projectSubscribers) == null ? void 0 : _a.push(me);
    if (project) {
      me.attachToProject(project);
      me.attachToResourceStore(project.resourceStore);
      me.attachToEventStore(project.eventStore);
      me.attachToAssignmentStore(project.assignmentStore);
      me.attachToDependencyStore(project.dependencyStore);
      me.attachToCalendarManagerStore(project.calendarManagerStore);
    }
  }
  /**
   * Override to take action when the project instance is replaced.
   *
   * @param {Scheduler.model.ProjectModel} project
   */
  attachToProject(project) {
    var _a;
    this.detachListeners("project");
    this._project = project;
    (_a = super.attachToProject) == null ? void 0 : _a.call(this, project);
  }
  detachFromProject(project) {
    var _a;
    (_a = super.detachFromProject) == null ? void 0 : _a.call(this, project);
  }
  /**
   * Override to take action when the EventStore instance is replaced, either from being replaced on the project or
   * from assigning a new project.
   *
   * @param {Scheduler.data.EventStore} store
   */
  attachToEventStore(store) {
    var _a;
    this.detachListeners("eventStore");
    (_a = super.attachToEventStore) == null ? void 0 : _a.call(this, store);
  }
  /**
   * Override to take action when the ResourceStore instance is replaced, either from being replaced on the project
   * or from assigning a new project.
   *
   * @param {Scheduler.data.ResourceStore} store
   */
  attachToResourceStore(store) {
    var _a;
    this.detachListeners("resourceStore");
    (_a = super.attachToResourceStore) == null ? void 0 : _a.call(this, store);
  }
  /**
   * Override to take action when the AssignmentStore instance is replaced, either from being replaced on the project
   * or from assigning a new project.
   *
   * @param {Scheduler.data.AssignmentStore} store
   */
  attachToAssignmentStore(store) {
    var _a;
    this.detachListeners("assignmentStore");
    (_a = super.attachToAssignmentStore) == null ? void 0 : _a.call(this, store);
  }
  /**
   * Override to take action when the DependencyStore instance is replaced, either from being replaced on the project
   * or from assigning a new project.
   *
   * @param {Scheduler.data.DependencyStore} store
   */
  attachToDependencyStore(store) {
    var _a;
    this.detachListeners("dependencyStore");
    (_a = super.attachToDependencyStore) == null ? void 0 : _a.call(this, store);
  }
  /**
   * Override to take action when the CalendarManagerStore instance is replaced, either from being replaced on the
   * project or from assigning a new project.
   *
   * @param {Core.data.Store} store
   */
  attachToCalendarManagerStore(store) {
    var _a;
    this.detachListeners("calendarManagerStore");
    (_a = super.attachToCalendarManagerStore) == null ? void 0 : _a.call(this, store);
  }
  get project() {
    return this._project;
  }
  get calendarManagerStore() {
    return this.project.calendarManagerStore;
  }
  get assignmentStore() {
    return this.project.assignmentStore;
  }
  get resourceStore() {
    return this.project.resourceStore;
  }
  get eventStore() {
    return this.project.eventStore;
  }
  get dependencyStore() {
    return this.project.dependencyStore;
  }
};

// ../Scheduler/lib/Scheduler/view/orientation/HorizontalRendering.js
var releaseEventActions = {
  releaseElement: 1,
  // Not used at all at the moment
  reuseElement: 1
  // Used by some other element
};
var renderEventActions = {
  newElement: 1,
  reuseOwnElement: 1,
  reuseElement: 1
};
var MAX_WIDTH = 9999999;
var heightEventSorter = ({ startDateMS: lhs }, { startDateMS: rhs }) => lhs - rhs;
var chronoFields = {
  startDate: 1,
  endDate: 1,
  duration: 1
};
function getStartEnd(scheduler, eventRecord, useEnd, fieldName, useEventBuffer) {
  var _a, _b;
  const { timeAxis } = scheduler, date = eventRecord.isBatchUpdating && !useEventBuffer ? eventRecord.get(fieldName) : eventRecord[fieldName], hasBatchedChange = (_a = eventRecord.hasBatchedChange) == null ? void 0 : _a.call(eventRecord, fieldName), useTickDates = scheduler.fillTicks && (!((_b = eventRecord.meta) == null ? void 0 : _b.isResizing) || !hasBatchedChange);
  if (useTickDates) {
    let tick = timeAxis.getTickFromDate(date);
    if (tick >= 0) {
      if (useEnd && tick === Math.round(tick) && tick > 0) {
        tick--;
      }
      const tickIndex = Math.floor(tick), tickRecord = timeAxis.getAt(tickIndex);
      return tickRecord[fieldName].getTime();
    }
  }
  return date == null ? void 0 : date.getTime();
}
var HorizontalRendering = class extends Base.mixin(AttachToProjectMixin_default) {
  static get configurable() {
    return {
      /**
       * Amount of pixels to extend the current visible range at both ends with when deciding which events to
       * render. Only applies when using labels or for milestones
       * @config {Number}
       * @default
       */
      bufferSize: 150,
      verticalBufferSize: 150
    };
  }
  static get properties() {
    return {
      // Map with event DOM configs, keyed by resource id
      resourceMap: /* @__PURE__ */ new Map(),
      // Map with visible events DOM configs, keyed by row instance
      rowMap: /* @__PURE__ */ new Map(),
      eventConfigs: [],
      // Flag to avoid transitioning on first refresh
      isFirstRefresh: true,
      toDrawOnProjectRefresh: /* @__PURE__ */ new Set(),
      toDrawOnDataReady: /* @__PURE__ */ new Set()
    };
  }
  construct(scheduler) {
    const me = this;
    me.client = me.scheduler = scheduler;
    me.eventSorter = me.eventSorter.bind(scheduler);
    me.scrollBuffer = scheduler.scrollBuffer;
    scheduler.scrollable.ion({
      scroll: "onEarlyScroll",
      prio: 1,
      thisObj: me
    });
    scheduler.rowManager.ion({
      name: "rowManager",
      renderDone: "onRenderDone",
      removeRows: "onRemoveRows",
      translateRow: "onTranslateRow",
      offsetRows: "onOffsetRows",
      beforeRowHeight: "onBeforeRowHeightChange",
      thisObj: me
    });
    super.construct({});
  }
  init() {
  }
  updateVerticalBufferSize() {
    const { rowManager } = this.scheduler;
    if (this.scheduler.isPainted) {
      rowManager.renderRows(rowManager.rows);
    }
  }
  //endregion
  //region Region, dates & coordinates
  get visibleDateRange() {
    return this._visibleDateRange;
  }
  getDateFromXY(xy, roundingMethod, local, allowOutOfRange = false) {
    const { scheduler } = this;
    let coord = xy[0];
    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }
    coord = scheduler.getRtlX(coord);
    return scheduler.timeAxisViewModel.getDateFromPosition(coord, roundingMethod, allowOutOfRange);
  }
  translateToScheduleCoordinate(x) {
    const { scheduler } = this, { scrollable } = scheduler.timeAxisSubGrid;
    let result = x - scheduler.timeAxisSubGridElement.getBoundingClientRect().left - globalThis.scrollX;
    if (scheduler.rtl) {
      result += scrollable.maxX - Math.abs(scheduler.scrollLeft);
    } else {
      result += scheduler.scrollLeft;
    }
    return result;
  }
  translateToPageCoordinate(x) {
    const { scheduler } = this, { scrollable } = scheduler.timeAxisSubGrid;
    let result = x + scheduler.timeAxisSubGridElement.getBoundingClientRect().left;
    if (scheduler.rtl) {
      result -= scrollable.maxX - Math.abs(scheduler.scrollLeft);
    } else {
      result -= scheduler.scrollLeft;
    }
    return result;
  }
  /**
   * Gets the region, relative to the page, represented by the schedule and optionally only for a single resource.
   * This method will call getDateConstraints to allow for additional resource/event based constraints. By overriding
   * that method you can constrain events differently for different resources.
   * @param {Scheduler.model.ResourceModel} [resourceRecord] (optional) The row record
   * @param {Scheduler.model.EventModel} [eventRecord] (optional) The event record
   * @returns {Core.helper.util.Rectangle} The region of the schedule
   */
  getScheduleRegion(resourceRecord, eventRecord, local = true, dateConstraints, stretch = false) {
    var _a;
    const me = this, { scheduler } = me, { timeAxisSubGridElement, timeAxis } = scheduler, { start, end } = (!stretch || resourceRecord) && scheduler.getResourceMarginObject(resourceRecord) || { start: 0, end: 0 };
    let region;
    if (resourceRecord) {
      const row = scheduler.getRowById(resourceRecord.id), eventElement = eventRecord && scheduler.getElementsFromEventRecord(eventRecord, resourceRecord)[0];
      region = row ? Rectangle.from(row.getElement("normal"), timeAxisSubGridElement) : scheduler.getRecordCoords(resourceRecord, true);
      if (eventElement) {
        const eventRegion = Rectangle.from(eventElement, timeAxisSubGridElement);
        region.y = eventRegion.y;
        region.bottom = eventRegion.bottom;
      } else {
        region.y = region.y + start;
        region.bottom = region.bottom - end;
      }
    } else {
      region = Rectangle.from(timeAxisSubGridElement).moveTo(null, 0);
      region.width = timeAxisSubGridElement.scrollWidth;
      region.y = region.y + start;
      region.bottom = region.bottom - end;
    }
    const taStart = timeAxis.startDate, taEnd = timeAxis.endDate;
    dateConstraints = (dateConstraints == null ? void 0 : dateConstraints.start) && dateConstraints || ((_a = scheduler.getDateConstraints) == null ? void 0 : _a.call(scheduler, resourceRecord, eventRecord)) || {
      start: taStart,
      end: taEnd
    };
    let startX = scheduler.getCoordinateFromDate(dateConstraints.start ? DateHelper.max(taStart, dateConstraints.start) : taStart), endX = scheduler.getCoordinateFromDate(dateConstraints.end ? DateHelper.min(taEnd, dateConstraints.end) : taEnd);
    if (!local) {
      startX = me.translateToPageCoordinate(startX);
      endX = me.translateToPageCoordinate(endX);
    }
    region.left = Math.min(startX, endX);
    region.right = Math.max(startX, endX);
    return region;
  }
  /**
   * Gets the Region, relative to the timeline view element, representing the passed row and optionally just for a
   * certain date interval.
   * @param {Core.data.Model} rowRecord The row record
   * @param {Date} startDate A start date constraining the region
   * @param {Date} endDate An end date constraining the region
   * @returns {Core.helper.util.Rectangle} The Rectangle which encapsulates the row
   */
  getRowRegion(rowRecord, startDate, endDate) {
    const { scheduler } = this, { timeAxis } = scheduler, row = scheduler.getRowById(rowRecord.id);
    if (!row) {
      return null;
    }
    const taStart = timeAxis.startDate, taEnd = timeAxis.endDate, start = startDate ? DateHelper.max(taStart, startDate) : taStart, end = endDate ? DateHelper.min(taEnd, endDate) : taEnd, startX = scheduler.getCoordinateFromDate(start), endX = scheduler.getCoordinateFromDate(end, true, true), y = row.top, x = Math.min(startX, endX), bottom = y + row.offsetHeight;
    return new Rectangle(x, y, Math.max(startX, endX) - x, bottom - y);
  }
  getResourceEventBox(eventRecord, resourceRecord, includeOutside, roughly = false) {
    var _a;
    const { scheduler } = this, resourceData = this.resourceMap.get(resourceRecord.id);
    let eventLayout = null, approx = false;
    if (resourceData) {
      eventLayout = resourceData.eventsData.find((d) => d.eventRecord === eventRecord);
    }
    if (!eventLayout) {
      eventLayout = this.getTimeSpanRenderData(
        eventRecord,
        resourceRecord,
        { viewport: true, timeAxis: includeOutside }
      );
      approx = true;
    }
    if (eventLayout) {
      const boxHeight = (_a = eventLayout.height) != null ? _a : scheduler.getResourceLayoutSettings(resourceRecord).contentHeight, rowBox = scheduler.rowManager.getRecordCoords(resourceRecord, true, roughly), absoluteTop = eventLayout.top + rowBox.top, box = new Rectangle(eventLayout.left, absoluteTop, eventLayout.width, boxHeight);
      box.layout = !approx;
      box.rowTop = rowBox.top;
      box.rowBottom = rowBox.bottom;
      box.resourceId = resourceRecord.id;
      return box;
    }
    return null;
  }
  //endregion
  //region Element <-> Record mapping
  resolveRowRecord(elementOrEvent) {
    const me = this, { scheduler } = me, element = elementOrEvent.nodeType ? elementOrEvent : elementOrEvent.target, el = element.nodeType === Element.TEXT_NODE ? element.parentElement : element, eventNode = el.closest(scheduler.eventSelector);
    if (eventNode) {
      return me.resourceStore.getById(eventNode.dataset.resourceId);
    }
    if (!el.closest(".b-grid-row") && el.dataset.resourceId) {
      return me.resourceStore.getById(el.dataset.resourceId);
    }
    return scheduler.getRecordFromElement(el);
  }
  //endregion
  //region Project
  attachToProject(project) {
    super.attachToProject(project);
    this.refreshAllWhenReady = true;
    if (!this.scheduler.isConfiguring) {
      this.clearAll({ clearDom: true });
    }
    project == null ? void 0 : project.ion({
      name: "project",
      refresh: "onProjectRefresh",
      commitFinalized: "onProjectCommitFinalized",
      thisObj: this
    });
  }
  onProjectCommitFinalized() {
    const { scheduler, toDrawOnDataReady, project } = this;
    if (scheduler.isVisible) {
      if (scheduler.isPainted && !scheduler.refreshSuspended) {
        if (!toDrawOnDataReady.size && project.timeZone != null && project.ignoreRecordChanges) {
          project.resourceStore.forEach((r) => toDrawOnDataReady.add(r.id));
        }
        if (toDrawOnDataReady.size) {
          this.clearResources(toDrawOnDataReady);
          this.refreshResources(toDrawOnDataReady);
        }
        toDrawOnDataReady.clear();
      }
    } else {
      scheduler.whenVisible("refreshRows");
    }
  }
  onProjectRefresh({ isCalculated, isInitialCommit }) {
    const me = this, { scheduler, toDrawOnProjectRefresh } = me;
    if (scheduler.isVisible) {
      if (scheduler.isPainted && !scheduler.isConfiguring && !scheduler.refreshSuspended) {
        if (me.refreshAllWhenReady || isInitialCommit && isCalculated) {
          scheduler.calculateAllRowHeights(true);
          const { rowManager } = scheduler;
          if (rowManager.topRow) {
            me.clearAll();
            if (!scheduler.refreshAfterProjectRefresh) {
              if (rowManager.topRow.dataIndex >= scheduler.store.count) {
                scheduler.renderRows(false);
              } else {
                scheduler.refreshWithTransition(false, !me.isFirstRefresh && isCalculated && !isInitialCommit);
              }
            }
            me.isFirstRefresh = false;
          } else {
            rowManager.reinitialize();
          }
          me.refreshAllWhenReady = false;
        } else if (toDrawOnProjectRefresh.size) {
          me.refreshResources(toDrawOnProjectRefresh);
        }
        toDrawOnProjectRefresh.clear();
      }
    } else {
      scheduler.whenVisible("refresh", scheduler, [true]);
    }
  }
  //endregion
  //region AssignmentStore
  attachToAssignmentStore(assignmentStore) {
    this.refreshAllWhenReady = true;
    super.attachToAssignmentStore(assignmentStore);
    if (assignmentStore) {
      assignmentStore.ion({
        name: "assignmentStore",
        changePreCommit: "onAssignmentStoreChange",
        refreshPreCommit: "onAssignmentStoreRefresh",
        thisObj: this
      });
    }
  }
  onAssignmentStoreChange({ source, action, records: assignmentRecords = [], replaced, changes }) {
    const me = this, { scheduler } = me, resourceIds = new Set(assignmentRecords.flatMap((assignmentRecord) => {
      var _a, _b, _c;
      return [
        assignmentRecord.resourceId,
        // Also include any linked resources (?. twice since resource might not be resolved and point to id)
        ...(_c = (_b = (_a = assignmentRecord.resource) == null ? void 0 : _a.$links) == null ? void 0 : _b.map((link) => link.id)) != null ? _c : []
      ];
    }));
    if (me.resourceStore.isRemoving || me.resourceStore.isChangingId) {
      return;
    }
    switch (action) {
      case "dataset": {
        if (!me.eventStore.usesSingleAssignment) {
          if (resourceIds.size) {
            me.refreshResourcesWhenReady(resourceIds);
          } else {
            me.clearAll();
            scheduler.refreshWithTransition();
          }
        }
        return;
      }
      case "add":
      case "remove":
      case "updateMultiple":
        me.refreshResourcesWhenReady(resourceIds);
        return;
      case "removeall":
        me.refreshAllWhenReady = true;
        return;
      case "replace":
        replaced.forEach(([oldAssignment, newAssignment]) => {
          resourceIds.add(oldAssignment.resourceId);
          resourceIds.add(newAssignment.resourceId);
        });
        me.refreshResourcesWhenReady(resourceIds);
        return;
      case "filter":
        me.clearAll();
        scheduler.calculateAllRowHeights(true);
        scheduler.refreshWithTransition();
        return;
      case "update": {
        if ("eventId" in changes || "resourceId" in changes || "id" in changes) {
          if ("resourceId" in changes) {
            resourceIds.add(changes.resourceId.oldValue);
          }
          if (source === scheduler.project.assignmentStore) {
            me.refreshResourcesOnDataReady(resourceIds);
          } else {
            me.refreshResources(resourceIds);
          }
        }
        break;
      }
      case "clearchanges": {
        const { added, modified, removed } = changes;
        if (modified.length) {
          scheduler.refreshWithTransition();
        } else {
          added.forEach((r) => resourceIds.add(r.resourceId));
          removed.forEach((r) => resourceIds.add(r.resourceId));
          me.refreshResourcesOnDataReady(resourceIds);
        }
      }
    }
  }
  onAssignmentStoreRefresh({ action, records }) {
    if (action === "batch") {
      this.clearAll();
      this.scheduler.refreshWithTransition();
    }
  }
  //endregion
  //region EventStore
  attachToEventStore(eventStore) {
    this.refreshAllWhenReady = true;
    super.attachToEventStore(eventStore);
    if (eventStore) {
      eventStore.ion({
        name: "eventStore",
        addConfirmed: "onEventStoreAddConfirmed",
        refreshPreCommit: "onEventStoreRefresh",
        thisObj: this
      });
    }
  }
  onEventStoreAddConfirmed({ record }) {
    for (const element of this.client.getElementsFromEventRecord(record)) {
      element.classList.remove("b-iscreating");
    }
  }
  onEventStoreRefresh({ action }) {
    if (action === "batch") {
      const { scheduler } = this;
      if (scheduler.isEngineReady && scheduler.isPainted) {
        this.clearAll();
        scheduler.refreshWithTransition();
      }
    }
  }
  onEventStoreChange({ action, records: eventRecords = [], record, replaced, changes, source }) {
    var _a, _b;
    const me = this, { scheduler } = me, isResourceTimeRange = source.isResourceTimeRangeStore, resourceIds = /* @__PURE__ */ new Set();
    if (!scheduler.isPainted) {
      return;
    }
    eventRecords.forEach((eventRecord) => {
      var _a2;
      const renderedEventResources = (_a2 = eventRecord.$linkedResources) == null ? void 0 : _a2.filter((r) => me.resourceStore.includes(r));
      renderedEventResources == null ? void 0 : renderedEventResources.forEach((resourceRecord) => resourceIds.add(resourceRecord.id));
    });
    if (isResourceTimeRange) {
      switch (action) {
        case "removeall":
        case "dataset":
          me.clearAll();
          scheduler.refreshWithTransition();
          return;
      }
      me.refreshResources(resourceIds);
    } else {
      switch (action) {
        case "batch":
        case "sort":
        case "group":
        case "move":
          return;
        case "remove":
          return;
        case "clearchanges":
          me.clearAll();
          scheduler.refreshWithTransition();
          return;
        case "dataset": {
          me.clearAll();
          if (scheduler.isEngineReady) {
            scheduler.refreshWithTransition();
          } else {
            me.refreshAllWhenReady = true;
          }
          return;
        }
        case "add":
        case "updateMultiple":
          break;
        case "replace":
          replaced.forEach(([, newEvent]) => {
            newEvent.resources.map((resourceRecord) => resourceIds.add(resourceRecord.id));
          });
          break;
        case "removeall":
        case "filter":
          if (!scheduler.isEngineReady) {
            me.refreshAllWhenReady = true;
            return;
          }
          me.clearAll();
          scheduler.calculateAllRowHeights(true);
          scheduler.refreshWithTransition();
          return;
        case "update": {
          const allChrono = record.$entity ? !Object.keys(changes).some((name) => !record.$entity.getField(name)) : !Object.keys(changes).some((name) => !chronoFields[name]);
          let dateChanges = 0;
          "startDate" in changes && dateChanges++;
          "endDate" in changes && dateChanges++;
          "duration" in changes && dateChanges++;
          if ("resourceId" in changes) {
            resourceIds.add(changes.resourceId.oldValue);
          }
          if (resourceIds.size && (!allChrono || // Skip case when changed "duration" only (w/o start/end affected)
          dateChanges && !("duration" in changes && dateChanges === 1) || "percentDone" in changes || "inactive" in changes || "constraintDate" in changes || "constraintType" in changes || "segments" in changes)) {
            const { eventResize, eventDragCreate } = scheduler.features;
            if (record.isBatchUpdating && ((eventResize == null ? void 0 : eventResize.isResizing) && eventResize.lockLayout || (eventDragCreate == null ? void 0 : eventDragCreate.isResizing) && eventDragCreate.lockLayout)) {
              for (const id of resourceIds) {
                me.refreshEventsForResource(scheduler.resourceStore.getById(id), void 0, false);
              }
              me.onRenderDone();
            } else if (((_a = me.project) == null ? void 0 : _a.propagatingLoadChanges) || ((_b = me.project) == null ? void 0 : _b.isWritingData)) {
              me.refreshResourcesOnDataReady(resourceIds);
            } else {
              me.refreshResources(resourceIds);
            }
          }
          return;
        }
      }
      me.refreshResourcesWhenReady(resourceIds);
    }
  }
  //endregion
  //region ResourceStore
  attachToResourceStore(resourceStore) {
    this.refreshAllWhenReady = true;
    super.attachToResourceStore(resourceStore);
    if (resourceStore) {
      this.clearAll({ clearLayoutCache: true });
      resourceStore.ion({
        name: "resourceStore",
        changePreCommit: "onResourceStoreChange",
        thisObj: this
      });
    }
  }
  get resourceStore() {
    return this.client.store;
  }
  onResourceStoreChange({ action, isExpand, records, changes }) {
    const me = this, resourceIds = records == null ? void 0 : records.flatMap((r) => r.isLinked ? [r.id, r.$originalId] : [r.id]);
    if (!me.scheduler.isPainted) {
      return;
    }
    switch (action) {
      case "add":
        if (!isExpand) {
          if (records.every((r) => r.isLinked)) {
            me.refreshResources(resourceIds);
          } else {
            me.refreshResourcesWhenReady(resourceIds);
          }
        }
        return;
      case "update": {
        if (!me.project.isChangeTrackingSuspended && !changes.isLeaf) {
          me.refreshResources(resourceIds);
        }
        return;
      }
      case "filter":
        return;
      case "removeall":
        me.clearAll({ clearLayoutCache: true });
        return;
      case "dataset":
        return;
    }
    resourceIds && me.clearResources(resourceIds);
  }
  //endregion
  //region RowManager
  onTranslateRow({ row }) {
    if (row.id != null) {
      this.refreshEventsForResource(row, false);
    }
  }
  // RowManager error correction, cached layouts will no longer match.
  // Redraw to have events correctly positioned for dependency feature to draw to their elements
  onOffsetRows() {
    this.clearAll();
    this.doUpdateTimeView();
  }
  // Used to pre-calculate row heights
  calculateRowHeight(resourceRecord) {
    var _a, _b;
    const { scheduler } = this, rowHeight = scheduler.getResourceHeight(resourceRecord), eventLayout = scheduler.getEventLayout(resourceRecord), layoutType = eventLayout.type, lockLayout = (_a = scheduler.features.eventResize) == null ? void 0 : _a.lockLayout;
    if (layoutType === "stack" && scheduler.isEngineReady && !resourceRecord.isSpecialRow && // Generated parents when TreeGrouping do not have assigned bucket
    ((_b = resourceRecord.assigned) == null ? void 0 : _b.size) > 1) {
      const {
        assignmentStore,
        eventStore,
        timeAxis
      } = scheduler, {
        barMargin,
        resourceMarginObject: { total },
        contentHeight
      } = scheduler.getResourceLayoutSettings(resourceRecord), eventFilter = (eventStore.isFiltered || assignmentStore.isFiltered) && ((eventRecord) => eventRecord.assignments.some((a) => a.resource === resourceRecord.$original && assignmentStore.includes(a))), events = eventStore.getEvents({
        resourceRecord,
        includeOccurrences: scheduler.enableRecurringEvents,
        startDate: timeAxis.startDate,
        endDate: timeAxis.endDate,
        filter: eventFilter
      }).sort(heightEventSorter).map((eventRecord) => {
        var _a2;
        const useCurrent = eventRecord.isBatchUpdating && !(lockLayout && ((_a2 = eventRecord.meta) == null ? void 0 : _a2.isResizing)), startDate = useCurrent ? eventRecord.get("startDate") : eventRecord.startDate, endDate = useCurrent ? eventRecord.get("endDate") : eventRecord.endDate || startDate;
        return {
          eventRecord,
          resourceRecord,
          startMS: startDate.getTime(),
          endMS: endDate.getTime()
        };
      }), layoutHandler = scheduler.getEventLayoutHandler(eventLayout), nbrOfBandsRequired = layoutHandler.layoutEventsInBands(events, resourceRecord, true);
      if (layoutHandler.type === "layoutFn") {
        return nbrOfBandsRequired;
      }
      return nbrOfBandsRequired * contentHeight + (nbrOfBandsRequired - 1) * barMargin + total;
    }
    return rowHeight;
  }
  //endregion
  //region TimeAxis
  doUpdateTimeView() {
    const { scrollable } = this.scheduler.timeAxisSubGrid;
    this.updateFromHorizontalScroll(scrollable.x, true);
  }
  onTimeAxisViewModelUpdate() {
    const me = this, { scheduler } = me;
    me.clearAll();
    if (scheduler.refreshSuspended) {
      me.detachListeners("renderingSuspend");
      scheduler.ion({
        name: "renderingSuspend",
        resumeRefresh({ trigger }) {
          if (scheduler.isEngineReady && trigger) {
            me.doUpdateTimeView();
          }
        },
        thisObj: me,
        once: true
      });
    }
    me.doUpdateTimeView();
  }
  //endregion
  //region Dependency connectors
  /**
   * Gets displaying item start side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @returns {'start'|'end'|'top'|'bottom'} 'start' / 'end' / 'top' / 'bottom'
   */
  getConnectorStartSide(eventRecord) {
    return "start";
  }
  /**
   * Gets displaying item end side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @returns {'start'|'end'|'top'|'bottom'} 'start' / 'end' / 'top' / 'bottom'
   */
  getConnectorEndSide(eventRecord) {
    return "end";
  }
  //endregion
  //region Scheduler hooks
  refreshRows(reLayoutEvents) {
    if (reLayoutEvents) {
      this.clearAll();
    }
  }
  // Clear events in case they use date as part of displayed info
  onLocaleChange() {
    this.clearAll();
  }
  // Called when viewport size changes
  onViewportResize(width, height, oldWidth, oldHeight) {
    if (height > oldHeight) {
      this.onRenderDone();
    }
  }
  // Called from EventDrag
  onDragAbort({ context, dragData }) {
    if (this.resourceStore.indexOf(dragData.record.resource) < this.scheduler.topRow.dataIndex) {
      context.element.remove();
    }
  }
  // Called from EventSelection
  toggleCls(assignmentRecord, cls, add = true, useWrapper = false, checkReleased = false) {
    const element = this.client.getElementFromAssignmentRecord(assignmentRecord, useWrapper, checkReleased), resourceData = this.resourceMap.get(assignmentRecord.isModel ? assignmentRecord.get("resourceId") : assignmentRecord.resourceId), eventData = resourceData == null ? void 0 : resourceData.eventsData.find((d) => d.eventId === assignmentRecord.eventId);
    if (eventData) {
      eventData[useWrapper ? "wrapperCls" : "cls"][cls] = add;
    }
    if (element) {
      element.classList.toggle(cls, add);
      element.lastDomConfig.className[cls] = add;
    }
  }
  // React to rows being removed, refreshes view without any relayouting needed since layout is cached relative to row
  onRemoveRows({ rows }) {
    rows.forEach((row) => this.rowMap.delete(row));
    this.onRenderDone();
  }
  // Reset renderer flag before any renderers are called
  onEarlyScroll() {
    this.rendererCalled = false;
  }
  // If vertical scroll did not cause a renderer to be called we still want to update since we only draw events in
  // view, "independent" from their rows
  updateFromVerticalScroll() {
    this.fromScroll = true;
    if (!this.rendererCalled) {
      this.onRenderDone();
    }
  }
  // Update header range on horizontal scroll. No need to draw any tasks, Gantt only cares about vertical scroll
  updateFromHorizontalScroll(scrollX, force) {
    var _a, _b;
    const me = this, {
      scheduler,
      scrollBuffer
    } = me, renderAll = scrollBuffer === -1, {
      timeAxisSubGrid,
      timeAxis,
      rtl
    } = scheduler, { width } = timeAxisSubGrid, { totalSize } = scheduler.timeAxisViewModel, start = scrollX, returnEnd = timeAxisSubGrid.scrollable.maxX !== 0 && Math.abs(timeAxisSubGrid.scrollable.maxX) <= Math.round(start) + 5, startDate = renderAll ? timeAxis.startDate : scheduler.getDateFromCoord({ coord: Math.max(0, start - scrollBuffer), ignoreRTL: true }), endDate = returnEnd || renderAll ? timeAxis.endDate : scheduler.getDateFromCoord({ coord: start + width + scrollBuffer, ignoreRTL: true }) || timeAxis.endDate;
    if (startDate && !scheduler._viewPresetChanging && // If rendering all, no action needed if scrolling horizontally unless start/end/tick size etc changes
    (!renderAll || force || startDate - (((_a = me._visibleDateRange) == null ? void 0 : _a.startDate) || 0) || endDate - (((_b = me._visibleDateRange) == null ? void 0 : _b.endDate) || 0))) {
      me._visibleDateRange = { startDate, endDate, startMS: startDate.getTime(), endMS: endDate.getTime() };
      me.viewportCoords = renderAll ? { left: 0, right: totalSize } : rtl ? { left: totalSize - scrollX - width + scrollBuffer, right: totalSize - scrollX - scrollBuffer } : { left: scrollX - scrollBuffer, right: scrollX + width + scrollBuffer };
      const range = scheduler.timeView.range = { startDate, endDate };
      scheduler.internalOnVisibleDateRangeChange(range);
      if (!scheduler.refreshSuspended && scheduler.rowManager.rows.length) {
        if (scheduler.rowManager.rows[0].id === null) {
          return;
        }
        me.fromScroll = true;
        scheduler.rowManager.rows.forEach((row) => me.refreshEventsForResource(row, false, false));
        me.onRenderDone();
      }
    }
  }
  // Called from SchedulerEventRendering
  repaintEventsForResource(resourceRecord) {
    this.refreshResources([resourceRecord.id]);
  }
  onBeforeRowHeightChange() {
    this.clearAll();
  }
  //endregion
  //region Refresh resources
  refreshResourcesOnDataReady(resourceIds) {
    resourceIds.forEach((id) => this.toDrawOnDataReady.add(id));
  }
  /**
   * Clears resources directly and redraws them on next project refresh
   * @param {Number[]|String[]} resourceIds
   * @private
   */
  refreshResourcesWhenReady(resourceIds) {
    this.clearResources(resourceIds);
    resourceIds.forEach((id) => this.toDrawOnProjectRefresh.add(id));
  }
  /**
   * Clears and redraws resources directly. Respects schedulers refresh suspension
   * @param {Number[]|String[]} ids Resource ids
   * @param {Boolean} [transition] Use transition or not
   * @private
   */
  refreshResources(ids, transition = true) {
    const me = this, { scheduler } = me;
    me.clearResources(ids);
    if (!scheduler.refreshSuspended) {
      const rows = [], noRows = [];
      ids.forEach((id) => {
        const row = scheduler.getRowById(id);
        if (row) {
          rows.push(row);
        } else {
          noRows.push(row);
        }
      });
      scheduler.runWithTransition(() => {
        scheduler.calculateRowHeights(noRows.map((id) => this.resourceStore.getById(id)), true);
        scheduler.rowManager.renderRows(rows);
      }, transition);
    }
  }
  //endregion
  //region Stack & pack
  layoutEventVerticallyStack(bandIndex, eventRecord, resourceRecord) {
    const {
      barMargin,
      resourceMarginObject: { start },
      contentHeight
    } = this.scheduler.getResourceLayoutSettings(resourceRecord, eventRecord.parent);
    return bandIndex === 0 ? start : start + bandIndex * contentHeight + bandIndex * barMargin;
  }
  layoutEventVerticallyPack(topFraction, heightFraction, eventRecord, resourceRecord) {
    const {
      barMargin,
      resourceMarginObject: { start },
      contentHeight
    } = this.scheduler.getResourceLayoutSettings(resourceRecord, eventRecord.parent), count = 1 / heightFraction, bandIndex = topFraction * count, height = (contentHeight - (count - 1) * barMargin) * heightFraction, top = start + bandIndex * height + bandIndex * barMargin;
    return {
      top,
      height
    };
  }
  //endregion
  //region Render
  /**
   * Used by event drag features to bring into existence event elements that are outside of the rendered block.
   * @param {Scheduler.model.TimeSpan} eventRecord The event to render
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The event to render
   * @private
   */
  addTemporaryDragElement(eventRecord, resourceRecord = eventRecord.resource) {
    const { scheduler } = this, renderData = scheduler.generateRenderData(eventRecord, resourceRecord, {
      timeAxis: true,
      viewport: true
    });
    renderData.absoluteTop = renderData.row ? renderData.top + renderData.row.top : scheduler.getResourceEventBox(eventRecord, resourceRecord, true).top;
    const domConfig = this.renderEvent(renderData), { dataset } = domConfig;
    delete domConfig.tabIndex;
    delete dataset.eventId;
    delete dataset.resourceId;
    delete dataset.assignmentId;
    delete dataset.syncId;
    dataset.transient = true;
    domConfig.parent = this.scheduler.foregroundCanvas;
    domConfig.retainElement = true;
    const result = DomHelper.createElement(domConfig);
    result.innerElement = result.firstChild;
    eventRecord.instanceMeta(scheduler).hasTemporaryDragElement = true;
    return result;
  }
  // Earlier start dates are above later tasks
  // If same start date, longer tasks float to top
  // If same start + duration, sort by name
  // Fn can be called with layout date or event records (from EventNavigation)
  eventSorter(a, b) {
    if (this.overlappingEventSorter) {
      return this.overlappingEventSorter(a.eventRecord || a, b.eventRecord || b);
    }
    const startA = a.isModel ? a.startDateMS : a.dataStartMS || a.startMS, endA = a.isModel ? a.endDateMS : a.dataEndMS || a.endMS, startB = b.isModel ? b.startDateMS : b.dataStartMS || b.startMS, endB = b.isModel ? b.endDateMS : b.dataEndMS || b.endMS, nameA = a.isModel ? a.name : a.eventRecord.name, nameB = b.isModel ? b.name : b.eventRecord.name;
    return startA - startB || endB - endA || (nameA < nameB ? -1 : nameA == nameB ? 0 : 1);
  }
  /**
   * Converts a start/endDate into a MS value used when rendering the event. If scheduler is configured with
   * `fillTicks: true` the value returned will be snapped to tick start/end.
   * @private
   * @param {Scheduler.model.TimeSpan} eventRecord
   * @param {String} startDateField
   * @param {String} endDateField
   * @param {Boolean} useEventBuffer
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @returns {Object} Object of format { startMS, endMS, durationMS }
   */
  calculateMS(eventRecord, startDateField, endDateField, useEventBuffer, resourceRecord) {
    var _a, _b;
    const me = this, { scheduler } = me, { timeAxisViewModel } = scheduler;
    let startMS = getStartEnd(scheduler, eventRecord, false, startDateField, useEventBuffer), endMS = getStartEnd(scheduler, eventRecord, true, endDateField, useEventBuffer), durationMS = endMS - startMS;
    if (scheduler.milestoneLayoutMode !== "default" && durationMS === 0) {
      const pxPerMinute = timeAxisViewModel.getSingleUnitInPixels("minute"), lengthInPx = scheduler.getMilestoneLabelWidth(eventRecord, resourceRecord), duration = lengthInPx * (1 / pxPerMinute);
      durationMS = duration * 60 * 1e3;
      if (scheduler.milestoneTextPosition === "always-outside") {
        const diamondSize = scheduler.getResourceLayoutSettings(resourceRecord, eventRecord.parent).contentHeight, diamondMS = diamondSize * (1 / pxPerMinute) * 60 * 1e3;
        startMS -= diamondMS / 2;
        endMS = startMS + durationMS;
      } else {
        switch (scheduler.milestoneAlign) {
          case "start":
          case "left":
            endMS = startMS + durationMS;
            break;
          case "end":
          case "right":
            endMS = startMS;
            startMS = endMS - durationMS;
            break;
          default:
            endMS = startMS + durationMS / 2;
            startMS = endMS - durationMS;
            break;
        }
      }
    }
    const elementStartMS = startMS, elementEndMS = endMS, elementDurationMS = durationMS;
    if (((_a = eventRecord.meta) == null ? void 0 : _a.isResizing) && ((_b = scheduler.features.eventResize) == null ? void 0 : _b.lockLayout)) {
      startMS = eventRecord.startDate.getTime();
      endMS = eventRecord.endDate.getTime();
      durationMS = elementEndMS - elementStartMS;
    }
    return {
      startMS,
      endMS,
      durationMS,
      elementStartMS,
      elementEndMS,
      elementDurationMS
    };
  }
  /**
   * Returns event render data except actual position information.
   * @param timeSpan
   * @param rowRecord
   * @returns {HorizontalRenderData}
   * @private
   */
  setupRenderData(timeSpan, rowRecord) {
    var _a;
    const me = this, { scheduler } = me, {
      timeAxis,
      timeAxisViewModel
    } = scheduler, {
      preamble,
      postamble
    } = timeSpan, useEventBuffer = me.isProHorizontalRendering && ((_a = scheduler.features.eventBuffer) == null ? void 0 : _a.enabled) && (preamble || postamble) && !timeSpan.isMilestone, pxPerMinute = timeAxisViewModel.getSingleUnitInPixels("minute"), { isBatchUpdating } = timeSpan, startDateField = useEventBuffer ? "wrapStartDate" : "startDate", endDateField = useEventBuffer ? "wrapEndDate" : "endDate", timespanStart = isBatchUpdating && !useEventBuffer ? timeSpan.get(startDateField) : timeSpan[startDateField], timespanEnd = isBatchUpdating && !useEventBuffer ? timeSpan.get(endDateField) : timeSpan[endDateField] || timespanStart, viewStartMS = timeAxis.startMS, viewEndMS = timeAxis.endMS, msValues = me.calculateMS(timeSpan, startDateField, endDateField, useEventBuffer, rowRecord), {
      startMS,
      endMS,
      durationMS
    } = msValues, startsOutsideView = startMS < viewStartMS | (startMS > viewEndMS) << 1, endsOutsideView = endMS > viewEndMS | (endMS <= viewStartMS) << 1, durationMinutes = durationMS / (1e3 * 60), width = endsOutsideView ? pxPerMinute * durationMinutes : null, row = scheduler.getRowById(rowRecord);
    return {
      eventRecord: timeSpan,
      taskRecord: timeSpan,
      // Helps with using Gantt projects in Scheduler Pro
      start: timespanStart,
      end: timespanEnd,
      rowId: rowRecord.id,
      children: [],
      startsOutsideView,
      endsOutsideView,
      width,
      row,
      useEventBuffer,
      ...msValues
    };
  }
  /**
   * Populates render data with information about width and horizontal position of the wrap.
   * @param {HorizontalRenderData} renderData
   * @returns {Boolean}
   * @private
   */
  fillTimeSpanHorizontalPosition(renderData) {
    const { elementStartMS: startMS, elementEndMS: endMS, elementDurationMS: durationMS } = renderData, result = startMS != null && endMS != null && this.calculateHorizontalPosition(renderData, startMS, endMS, durationMS);
    if (result) {
      Object.assign(renderData, result);
      return true;
    }
    return false;
  }
  /**
   * Fills render data with `left` and `width` properties
   * @param {HorizontalRenderData} renderData
   * @param {Number} startMS
   * @param {Number} endMS
   * @param {Number} durationMS
   * @returns {{left: number, width: number, clippedStart: boolean, clippedEnd: boolean}|null}
   * @private
   */
  calculateHorizontalPosition(renderData, startMS, endMS, durationMS) {
    const { scheduler } = this, {
      timeAxis,
      timeAxisViewModel
    } = scheduler, {
      startsOutsideView,
      endsOutsideView,
      eventRecord
    } = renderData, viewStartMS = timeAxis.startMS, pxPerMinute = timeAxisViewModel.getSingleUnitInPixels("minute");
    let width = null, endX = scheduler.getCoordinateFromDate(endMS, {
      local: true,
      respectExclusion: true,
      isEnd: true
    }), startX, clippedStart = false, clippedEnd = false;
    if (startsOutsideView) {
      startX = (startMS - viewStartMS) / (1e3 * 60) * pxPerMinute;
      if (scheduler.rtl) {
        startX = timeAxisViewModel.totalSize - startX;
      }
    } else {
      startX = scheduler.getCoordinateFromDate(startMS, {
        local: true,
        respectExclusion: true,
        isEnd: false,
        snapToNextIncluded: endX !== -1
      });
      clippedStart = startX === -1;
    }
    if (endsOutsideView) {
      const distanceToTimeAxisEnd = timeAxisViewModel.totalSize - startX, overflowDurationMS = endMS - timeAxis.endMS, overflowDurationMinutes = overflowDurationMS / (1e3 * 60);
      width = scheduler.rtl ? pxPerMinute * durationMS / (1e3 * 60) : distanceToTimeAxisEnd + pxPerMinute * overflowDurationMinutes;
      if (BrowserHelper.isSafari && scheduler.features.stickyEvents && timeAxis.endMS) {
        endX = scheduler.getCoordinateFromDate(timeAxis.endMS);
      } else {
        endX = startX + width * (scheduler.rtl ? -1 : 1);
      }
    } else {
      clippedEnd = endX === -1;
    }
    if (clippedEnd && !clippedStart) {
      endX = scheduler.getCoordinateFromDate(endMS, {
        local: true,
        respectExclusion: true,
        isEnd: true,
        snapToNextIncluded: true
      });
    }
    if (width > MAX_WIDTH) {
      if (startsOutsideView === 1) {
        if (endsOutsideView === 1) {
          startX = -100;
          endX = scheduler.timeAxisColumn.width + 100;
        } else {
          startX = endX - MAX_WIDTH;
        }
      } else if (endsOutsideView === 1) {
        endX = startX + MAX_WIDTH;
      }
    }
    if (clippedStart && clippedEnd) {
      startX = scheduler.getCoordinateFromDate(startMS, {
        local: true,
        respectExclusion: true,
        isEnd: false,
        snapToNextIncluded: true,
        max: endMS
      });
      endX = scheduler.getCoordinateFromDate(endMS, {
        local: true,
        respectExclusion: true,
        isEnd: true,
        snapToNextIncluded: true,
        min: startMS
      });
      if (startX === endX) {
        eventRecord.instanceMeta(scheduler).excluded = true;
        return null;
      }
    }
    return {
      left: Math.min(startX, endX),
      // Use min width 5 for normal events, 0 for milestones (won't have width specified at all in the
      // end). During drag create a normal event can get 0 duration, in this case we still want it to
      // get a min width of 5 (6px for wrapper, -1 px for event element
      width: Math.abs(endX - startX) || (eventRecord.isMilestone && !eventRecord.meta.isDragCreating ? 0 : 6),
      clippedStart,
      clippedEnd
    };
  }
  fillTimeSpanVerticalPosition(renderData, rowRecord) {
    const { scheduler } = this, { start, end } = renderData, {
      resourceMarginObject: { start: resourceMarginStart },
      contentHeight
    } = scheduler.getResourceLayoutSettings(rowRecord);
    if (scheduler.fillTicks) {
      renderData.dataStartMS = start.getTime();
      renderData.dataEndMS = end.getTime();
    }
    renderData.top = Math.max(0, resourceMarginStart);
    if (scheduler.managedEventSizing) {
      renderData.height = contentHeight;
    }
  }
  /**
   * Gets timespan coordinates etc. Relative to containing row. If the timespan is outside of the zone in
   * which timespans are rendered, that is outside of the TimeAxis, or outside of the vertical zone in which timespans
   * are rendered, then `undefined` is returned.
   * @private
   * @param {Scheduler.model.TimeSpan} timeSpan TimeSpan record
   * @param {Core.data.Model} rowRecord Row record
   * @param {Boolean|Object} includeOutside Specify true to get boxes for timespans outside of the rendered zone in both
   * dimensions. This option is used when calculating dependency lines, and we need to include routes from timespans
   * which may be outside the rendered zone.
   * @param {Boolean} includeOutside.timeAxis Pass as `true` to include timespans outside of the TimeAxis's bounds
   * @param {Boolean} includeOutside.viewport Pass as `true` to include timespans outside of the vertical timespan viewport's bounds.
   * @returns {{event/task: *, left: number, width: number, start: (Date), end: (Date), startMS: number, endMS: number, startsOutsideView: boolean, endsOutsideView: boolean}}
   */
  getTimeSpanRenderData(timeSpan, rowRecord, includeOutside = false) {
    const data = this.setupRenderData(timeSpan, rowRecord);
    if (!this.fillTimeSpanHorizontalPosition(data)) {
      return null;
    }
    this.fillTimeSpanVerticalPosition(data, rowRecord);
    return data;
  }
  // Layout a set of events, code shared by normal event render path and nested events
  layoutEvents(resourceRecord, allEvents, includeOutside = false, parentEventRecord, eventSorter) {
    const me = this, { scheduler } = me, { timeAxis } = scheduler, eventsData = allEvents.reduce((result, eventRecord) => {
      if (includeOutside || timeAxis.isTimeSpanInAxis(eventRecord)) {
        const eventBox = scheduler.generateRenderData(eventRecord, resourceRecord, includeOutside);
        if (eventBox) {
          result.push(eventBox);
        }
      }
      return result;
    }, []);
    eventsData.sort(eventSorter != null ? eventSorter : me.eventSorter);
    let rowHeight = scheduler.getAppliedResourceHeight(resourceRecord, parentEventRecord);
    const layoutEventData = eventsData.filter(({ eventRecord }) => eventRecord.isEvent && !eventRecord.meta.excludeFromLayout), eventLayout = scheduler.getEventLayout(resourceRecord, parentEventRecord), layoutHandler = scheduler.getEventLayoutHandler(eventLayout);
    if (layoutHandler) {
      const {
        barMargin,
        resourceMarginObject: { total },
        contentHeight
      } = scheduler.getResourceLayoutSettings(resourceRecord, parentEventRecord), bandsRequired = layoutHandler.applyLayout(layoutEventData, resourceRecord) || 1;
      if (layoutHandler.type === "layoutFn") {
        rowHeight = bandsRequired;
      } else {
        rowHeight = bandsRequired * contentHeight + (bandsRequired - 1) * barMargin + total;
      }
    } else if (layoutEventData.length > 0) {
      for (let i = 0; i < layoutEventData.length; i++) {
        const data = layoutEventData[i];
        data.wrapperStyle += `;z-index:${i + 5}`;
      }
    }
    return { rowHeight, eventsData };
  }
  // Lay out events within a resource, relative to the resource
  layoutResourceEvents(resourceRecord, includeOutside = false) {
    const me = this, { scheduler } = me, {
      eventStore,
      assignmentStore,
      timeAxis
    } = scheduler, resourceEvents = eventStore.getEvents({
      includeOccurrences: scheduler.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate,
      filter: (assignmentStore.isFiltered || eventStore.isFiltered) && ((eventRecord) => eventRecord.assignments.some((a) => a.resource === resourceRecord.$original && assignmentStore.includes(a)))
    }), allEvents = scheduler.getEventsToRender(resourceRecord, resourceEvents) || [];
    return me.layoutEvents(resourceRecord, allEvents, includeOutside);
  }
  // Generates a DOMConfig for an EventRecord
  renderEvent(data, rowHeight) {
    const { scheduler } = this, { resourceRecord, assignmentRecord, eventRecord } = data, syncId = assignmentRecord ? this.assignmentStore.getOccurrence(assignmentRecord, eventRecord).id : data.eventId, eventElementConfig = {
      className: data.cls,
      style: data.style || "",
      children: data.children,
      role: "presentation",
      dataset: {
        // Each feature putting contents in the event wrap should have this to simplify syncing and
        // element retrieval after sync
        taskFeature: "event"
      },
      syncOptions: {
        syncIdField: "taskBarFeature"
      }
    }, elementConfig = {
      className: data.wrapperCls,
      tabIndex: "tabIndex" in data ? data.tabIndex : -1,
      children: [
        eventElementConfig,
        ...data.wrapperChildren
      ],
      style: {
        top: data.absoluteTop,
        left: data.left,
        // ResourceTimeRanges fill row height, cannot be done earlier than this since row height is not
        // known initially
        height: data.fillSize ? rowHeight : data.height,
        // DomHelper appends px to dimensions when using numbers.
        width: data.width,
        style: data.wrapperStyle,
        fontSize: data.height + "px"
      },
      dataset: {
        // assignmentId is set in this function conditionally
        resourceId: resourceRecord.id,
        eventId: data.eventId,
        // Not using eventRecord.id to distinguish between Event and ResourceTimeRange
        syncId: resourceRecord.isLinked ? `${syncId}_${resourceRecord.id}` : syncId
      },
      // Will not be part of DOM, but attached to the element
      elementData: data,
      // Dragging etc. flags element as retained, to not reuse/release it during that operation. Events
      // always use assignments, but ResourceTimeRanges does not
      retainElement: (assignmentRecord == null ? void 0 : assignmentRecord.instanceMeta(scheduler).retainElement) || eventRecord.instanceMeta(scheduler).retainElement,
      // Options for this level of sync, lower levels can have their own
      syncOptions: {
        syncIdField: "taskFeature",
        // Remove instead of release when a feature is disabled
        releaseThreshold: 0
      }
    };
    if (data.fillSize) {
      data.height = rowHeight;
    }
    if (data.zIndex) {
      elementConfig.zIndex = data.zIndex;
    }
    if (assignmentRecord) {
      elementConfig.dataset.assignmentId = assignmentRecord.id;
    }
    data.elementConfig = elementConfig;
    scheduler.afterRenderEvent({ renderData: data, rowHeight, domConfig: elementConfig });
    return elementConfig;
  }
  /**
   * Refresh events for resource record (or Row), clearing its cache and forcing DOM refresh.
   * @param {Scheduler.model.ResourceModel} recordOrRow Record or row to refresh
   * @param {Boolean} [force] Specify `false` to prevent clearing cache and forcing DOM refresh
   * @internal
   */
  refreshEventsForResource(recordOrRow, force = true, draw = true) {
    const me = this, record = me.scheduler.store.getById(recordOrRow.isRow ? recordOrRow.id : recordOrRow), row = me.scheduler.rowManager.getRowFor(record);
    if (force) {
      me.clearResources([record]);
    }
    if (row && record) {
      me.renderer({ row, record });
      if (force && draw) {
        me.onRenderDone();
      }
    }
  }
  // Returns layout for the current resource. Used by the renderer and exporter
  getResourceLayout(resourceRecord) {
    const me = this;
    let resourceLayout = me.resourceMap.get(resourceRecord.id);
    if (!resourceLayout || resourceLayout.invalid) {
      if (me.suspended) {
        return;
      }
      resourceLayout = me.layoutResourceEvents(resourceRecord, false);
      me.resourceMap.set(resourceRecord.id, resourceLayout);
    }
    return resourceLayout;
  }
  getEventDOMConfigForCurrentView(resourceLayout, row, left, right) {
    const me = this, { bufferSize, scheduler } = me, { labels, eventBuffer } = scheduler.features, usesLabels = (eventBuffer == null ? void 0 : eventBuffer.enabled) || (labels == null ? void 0 : labels.enabled) && (labels.left || labels.right || labels.before || labels.after), { eventsData } = resourceLayout, reusableDOMConfigs = me.fromScroll ? me.rowMap.get(row) : null, eventDOMConfigs = [];
    let useLeft, useRight;
    for (let i = 0; i < eventsData.length; i++) {
      const layout = eventsData[i];
      useLeft = left;
      useRight = right;
      if (usesLabels || layout.width === 0) {
        useLeft -= bufferSize;
        useRight += bufferSize;
      }
      if (layout.left + layout.width >= useLeft && layout.left <= useRight) {
        layout.absoluteTop = layout.top + row.top;
        const prevDomConfig = reusableDOMConfigs == null ? void 0 : reusableDOMConfigs.find((config) => config.elementData.eventId === layout.eventId && config.elementData.resourceId === layout.resourceId);
        eventDOMConfigs.push(prevDomConfig != null ? prevDomConfig : me.renderEvent(layout, resourceLayout.rowHeight));
      }
    }
    return eventDOMConfigs;
  }
  // Called per row in "view", collect configs
  renderer({ row, record: resourceRecord, size = {} }) {
    const me = this;
    if (resourceRecord.isSpecialRow) {
      me.rowMap.delete(row);
      return;
    }
    const { left, right } = me.viewportCoords, resourceLayout = me.getResourceLayout(resourceRecord);
    if (!resourceLayout) {
      return;
    }
    size.height = resourceLayout.rowHeight;
    size.transient = true;
    const eventDOMConfigs = me.getEventDOMConfigForCurrentView(resourceLayout, row, left, right);
    me.rowMap.set(row, eventDOMConfigs);
    me.rendererCalled = true;
  }
  // Called when the current row rendering "pass" is complete, sync collected configs to DOM
  onRenderDone() {
    var _a;
    const { scheduler, rowMap, verticalBufferSize } = this, visibleEventDOMConfigs = [], bodyTop = (_a = scheduler._scrollTop) != null ? _a : 0, viewTop = bodyTop - verticalBufferSize, viewBottom = bodyTop + scheduler._bodyRectangle.height + verticalBufferSize, unbuffered = verticalBufferSize < 0, unmanagedSize = !scheduler.managedEventSizing;
    rowMap.forEach((eventDOMConfigs, row) => {
      if (unbuffered || row.bottom > viewTop && row.top < viewBottom) {
        for (let i = 0; i < eventDOMConfigs.length; i++) {
          const config = eventDOMConfigs[i], data = config.elementData, {
            absoluteTop,
            eventRecord
          } = data;
          if (unbuffered || unmanagedSize || eventRecord.meta.isDragCreating || eventRecord.meta.isResizing || absoluteTop + data.height > viewTop && absoluteTop < viewBottom) {
            visibleEventDOMConfigs.push(config);
          }
        }
      }
      for (let i = 0; i < eventDOMConfigs.length; i++) {
        eventDOMConfigs[i] = { ...eventDOMConfigs[i] };
      }
    });
    this.fromScroll = false;
    this.visibleEventDOMConfigs = visibleEventDOMConfigs;
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: visibleEventDOMConfigs
      },
      targetElement: scheduler.foregroundCanvas,
      syncIdField: "syncId",
      // Called by DomSync when it creates, releases or reuses elements
      callback({ action, domConfig, lastDomConfig, targetElement, jsx }) {
        var _a2, _b, _c;
        const { reactComponent } = scheduler, isRelease = releaseEventActions[action], isRender = renderEventActions[action];
        !isRelease && ((_a2 = scheduler.processEventContent) == null ? void 0 : _a2.call(scheduler, {
          jsx,
          action,
          domConfig,
          targetElement,
          isRelease,
          reactComponent
        }));
        if (action === "none" || !((_b = domConfig == null ? void 0 : domConfig.elementData) == null ? void 0 : _b.isWrap)) {
          return;
        }
        if (isRelease && (lastDomConfig == null ? void 0 : lastDomConfig.elementData)) {
          const { eventRecord, resourceRecord, assignmentRecord } = lastDomConfig.elementData, event = {
            renderData: lastDomConfig.elementData,
            element: targetElement,
            eventRecord,
            resourceRecord,
            assignmentRecord
          };
          (_c = scheduler.processEventContent) == null ? void 0 : _c.call(scheduler, {
            isRelease,
            targetElement,
            reactComponent,
            assignmentRecord
          });
          if (targetElement === DomHelper.getActiveElement(targetElement)) {
            scheduler.focusElement.focus();
          }
          scheduler.trigger("releaseEvent", event);
        }
        if (isRender) {
          const { eventRecord, resourceRecord, assignmentRecord } = domConfig.elementData, event = {
            renderData: domConfig.elementData,
            element: targetElement,
            isReusingElement: action === "reuseElement",
            isRepaint: action === "reuseOwnElement",
            eventRecord,
            resourceRecord,
            assignmentRecord
          };
          if (action === "reuseElement" && scheduler.isAnimating) {
            DomHelper.addTemporaryClass(targetElement, "b-reusing-own", 50, scheduler, `b-reusing-own-${(assignmentRecord || eventRecord).id}`);
          }
          scheduler.trigger("renderEvent", event);
        }
      }
    });
  }
  //endregion
  //region Cache
  // Clears cached resource layout
  clearResources(recordsOrIds) {
    recordsOrIds = ArrayHelper.asArray(recordsOrIds);
    const resourceIds = recordsOrIds.map(Model.asId);
    resourceIds.forEach((resourceId) => {
      const cached = this.resourceMap.get(resourceId);
      if (cached) {
        cached.invalid = true;
      }
      const row = this.scheduler.getRowById(resourceId);
      row && this.rowMap.delete(row);
    });
  }
  clearAll({ clearDom = false, clearLayoutCache = false } = {}) {
    const me = this, { layouts, foregroundCanvas } = me.scheduler;
    if (clearLayoutCache && layouts) {
      for (const layout in layouts) {
        layouts[layout].clearCache();
      }
    }
    if (foregroundCanvas && clearDom) {
      foregroundCanvas.syncIdMap = foregroundCanvas.lastDomConfig = foregroundCanvas.releasedIdMap = null;
      for (const child of foregroundCanvas.children) {
        child.lastDomConfig = child.elementData = null;
      }
    }
    me.resourceMap.clear();
    me.rowMap.clear();
  }
  //endregion
};
//region Config & Init
__publicField(HorizontalRendering, "$name", "HorizontalRendering");
HorizontalRendering._$name = "HorizontalRendering";

// ../Scheduler/lib/Scheduler/eventlayout/VerticalLayout.js
var VerticalLayout = class extends PackMixin_default() {
  static get defaultConfig() {
    return {
      coordProp: "leftFactor",
      sizeProp: "widthFactor"
    };
  }
  // Try to pack the events to consume as little space as possible
  applyLayout(events, columnWidth, resourceMarginStart, resourceMarginTotal, barMargin, columnIndex, eventLayout) {
    const me = this, layoutType = eventLayout.type;
    return me.packEventsInBands(events, (tplData, clusterIndex, slot, slotSize) => {
      if (layoutType === "none") {
        tplData.width = columnWidth - resourceMarginTotal;
        tplData.left += resourceMarginStart;
      } else {
        tplData.widthFactor = slotSize;
        const leftFactor = tplData.leftFactor = slot.start + clusterIndex * slotSize, packColumnCount = Math.round(1 / slotSize), packColumnIndex = leftFactor / slotSize, availableWidth = columnWidth - resourceMarginTotal - barMargin * (packColumnCount - 1);
        if (layoutType === "mixed" && packColumnCount === 2) {
          tplData.left += leftFactor * columnWidth / 5 + barMargin;
          tplData.width = columnWidth - leftFactor * columnWidth / 5 - barMargin * 2;
          tplData.zIndex = 5 + packColumnIndex;
        } else {
          tplData.width = slotSize * availableWidth;
          tplData.left += leftFactor * availableWidth + resourceMarginStart + barMargin * packColumnIndex;
        }
      }
      tplData.cls["b-sch-event-narrow"] = tplData.width < me.scheduler.narrowEventWidth;
    });
  }
};
VerticalLayout._$name = "VerticalLayout";

// ../Scheduler/lib/Scheduler/view/orientation/VerticalRendering.js
var releaseEventActions2 = {
  releaseElement: 1,
  // Not used at all at the moment
  reuseElement: 1
  // Used by some other element
};
var renderEventActions2 = {
  newElement: 1,
  reuseOwnElement: 1,
  reuseElement: 1
};
var chronoFields2 = {
  startDate: 1,
  endDate: 1,
  duration: 1
};
var emptyObject3 = Object.freeze({});
var VerticalRendering = class extends Base.mixin(Delayable_default, AttachToProjectMixin_default) {
  //region Config & Init
  static get properties() {
    return {
      eventMap: /* @__PURE__ */ new Map(),
      resourceMap: /* @__PURE__ */ new Map(),
      releasedElements: {},
      toDrawOnProjectRefresh: /* @__PURE__ */ new Set(),
      resourceBufferSize: 1
    };
  }
  construct(scheduler) {
    this.client = this.scheduler = scheduler;
    this.verticalLayout = new VerticalLayout({ scheduler });
    super.construct({});
  }
  init() {
    const me = this, { scheduler, resourceColumns } = me;
    resourceColumns.resourceStore = me.resourceStore;
    resourceColumns.ion({
      name: "resourceColumns",
      columnWidthChange: "onResourceColumnWidthChange",
      thisObj: me
    });
    me.initialized = true;
    if (scheduler.isPainted) {
      me.renderer();
    }
    resourceColumns.availableWidth = scheduler.timeAxisSubGridElement.offsetWidth;
  }
  //endregion
  //region Elements <-> Records
  resolveRowRecord(elementOrEvent, xy) {
    const me = this, { scheduler } = me, event = elementOrEvent.nodeType ? null : elementOrEvent, element = event ? event.target : elementOrEvent, coords = event ? [event.borderOffsetX, event.borderOffsetY] : xy, el = element.nodeType === Element.TEXT_NODE ? element.parentElement : element, eventElement = el.closest(scheduler.eventSelector);
    if (eventElement) {
      return scheduler.resourceStore.getById(eventElement.dataset.resourceId);
    }
    if (!element.closest(".b-sch-timeaxis-cell")) {
      return null;
    }
    if (!coords) {
      throw new Error(`Vertical mode needs coordinates to resolve this element. Can also be called with a browser
                event instead of element to extract element and coordinates from`);
    }
    if (scheduler.variableColumnWidths || scheduler.resourceStore.isGrouped) {
      let totalWidth = 0;
      for (const col of me.resourceStore) {
        if (!col.isSpecialRow) {
          totalWidth += col.columnWidth || me.resourceColumns.columnWidth;
        }
        if (totalWidth >= coords[0]) {
          return col;
        }
      }
      return null;
    }
    const index = Math.floor(coords[0] / me.resourceColumns.columnWidth);
    return me.allResourceRecords[index];
  }
  toggleCls(assignmentRecord, cls, add = true, useWrapper = false) {
    var _a;
    const eventData = (_a = this.eventMap.get(assignmentRecord.eventId)) == null ? void 0 : _a[assignmentRecord.resourceId];
    if (eventData) {
      eventData.renderData[useWrapper ? "wrapperCls" : "cls"][cls] = add;
      const element = this.client.getElementFromAssignmentRecord(assignmentRecord, useWrapper);
      if (element) {
        element.classList[add ? "add" : "remove"](cls);
      }
    }
  }
  //endregion
  //region Coordinate <-> Date
  getDateFromXY(xy, roundingMethod, local, allowOutOfRange = false) {
    let coord = xy[1];
    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }
    return this.scheduler.timeAxisViewModel.getDateFromPosition(coord, roundingMethod, allowOutOfRange);
  }
  translateToScheduleCoordinate(y) {
    return y - this.scheduler.timeAxisSubGridElement.getBoundingClientRect().top - globalThis.scrollY;
  }
  translateToPageCoordinate(y) {
    return y + this.scheduler.timeAxisSubGridElement.getBoundingClientRect().top + globalThis.scrollY;
  }
  //endregion
  //region Regions
  getResourceEventBox(event, resource) {
    var _a, _b, _c;
    const eventId = event.id, resourceId = resource.id;
    let { renderData } = ((_a = this.eventMap.get(eventId)) == null ? void 0 : _a[resourceId]) || emptyObject3;
    if (!renderData) {
      this.layoutResourceEvents(this.scheduler.resourceStore.getById(resourceId));
      renderData = (_c = (_b = this.eventMap.get(eventId)) == null ? void 0 : _b[resourceId]) == null ? void 0 : _c.renderData;
    }
    return renderData ? new Rectangle(renderData.left, renderData.top, renderData.width, renderData.bottom - renderData.top) : null;
  }
  getScheduleRegion(resourceRecord, eventRecord, local) {
    var _a;
    const me = this, { scheduler } = me, region = Rectangle.from(scheduler.timeAxisSubGridElement, scheduler.timeAxisSubGridElement);
    if (resourceRecord) {
      region.left = me.allResourceRecords.indexOf(resourceRecord) * scheduler.resourceColumnWidth;
      region.right = region.left + scheduler.resourceColumnWidth;
    }
    const start = scheduler.timeAxis.startDate, end = scheduler.timeAxis.endDate, dateConstraints = ((_a = scheduler.getDateConstraints) == null ? void 0 : _a.call(scheduler, resourceRecord, eventRecord)) || {
      start,
      end
    }, startY = scheduler.getCoordinateFromDate(DateHelper.max(start, dateConstraints.start)), endY = scheduler.getCoordinateFromDate(DateHelper.min(end, dateConstraints.end));
    if (!local) {
      region.top = me.translateToPageCoordinate(startY);
      region.bottom = me.translateToPageCoordinate(endY);
    } else {
      region.top = startY;
      region.bottom = endY;
    }
    return region;
  }
  getRowRegion(resourceRecord, startDate, endDate) {
    const me = this, { scheduler } = me, x = me.allResourceRecords.indexOf(resourceRecord) * scheduler.resourceColumnWidth, taStart = scheduler.timeAxis.startDate, taEnd = scheduler.timeAxis.endDate, start = startDate ? DateHelper.max(taStart, startDate) : taStart, end = endDate ? DateHelper.min(taEnd, endDate) : taEnd, startY = scheduler.getCoordinateFromDate(start), endY = scheduler.getCoordinateFromDate(end, true, true), y = Math.min(startY, endY), height = Math.abs(startY - endY);
    return new Rectangle(x, y, scheduler.resourceColumnWidth, height);
  }
  get visibleDateRange() {
    const scheduler = this.scheduler, scrollPos = scheduler.scrollable.y, height = scheduler.scrollable.clientHeight, startDate = scheduler.getDateFromCoordinate(scrollPos) || scheduler.timeAxis.startDate, endDate = scheduler.getDateFromCoordinate(scrollPos + height) || scheduler.timeAxis.endDate;
    return {
      startDate,
      endDate,
      startMS: startDate.getTime(),
      endMS: endDate.getTime()
    };
  }
  //endregion
  //region Events
  // Column width changed, rerender fully
  onResourceColumnWidthChange({ width, oldWidth }) {
    const me = this, { scheduler } = me;
    me.resourceColumns.width = scheduler.timeAxisColumn.width = me.allResourceRecords.length * width;
    me.clearAll();
    me.refresh(Math.abs(width - oldWidth) > 30);
  }
  //endregion
  //region Project
  attachToProject(project) {
    super.attachToProject(project);
    if (project) {
      project.ion({
        name: "project",
        refresh: "onProjectRefresh",
        thisObj: this
      });
    }
  }
  onProjectRefresh() {
    const me = this, { scheduler, toDrawOnProjectRefresh } = me;
    if (scheduler.isVisible) {
      if (scheduler.rendered && !scheduler.refreshSuspended) {
        if (me.refreshAllWhenReady) {
          me.clearAll();
          me.refresh();
          me.refreshAllWhenReady = false;
        } else if (toDrawOnProjectRefresh.size) {
          me.refresh();
        }
        toDrawOnProjectRefresh.clear();
      }
    } else {
      scheduler.whenVisible("refresh", scheduler, [true]);
    }
  }
  //endregion
  //region EventStore
  attachToEventStore(eventStore) {
    super.attachToEventStore(eventStore);
    this.refreshAllWhenReady = true;
    if (eventStore) {
      eventStore.ion({
        name: "eventStore",
        addConfirmed: "onEventStoreAddConfirmed",
        refreshPreCommit: "onEventStoreRefresh",
        thisObj: this
      });
    }
  }
  onEventStoreAddConfirmed({ record }) {
    for (const element of this.client.getElementsFromEventRecord(record)) {
      element.classList.remove("b-iscreating");
    }
  }
  onEventStoreRefresh({ action }) {
    if (action === "batch") {
      this.refreshAllWhenReady = true;
    }
  }
  onEventStoreChange({ action, records: eventRecords = [], record, replaced, changes, isAssign }) {
    const me = this, resourceIds = /* @__PURE__ */ new Set();
    eventRecords.forEach((eventRecord) => {
      var _a;
      const renderedEventResources = (_a = eventRecord.$linkedResources) == null ? void 0 : _a.filter((r) => me.resourceStore.includes(r));
      renderedEventResources == null ? void 0 : renderedEventResources.forEach((resourceRecord) => resourceIds.add(resourceRecord.id));
    });
    switch (action) {
      case "sort":
      case "group":
      case "move":
      case "remove":
      case "batch":
        return;
      case "dataset":
        me.refreshAllResourcesWhenReady();
        return;
      case "add":
      case "updateMultiple":
        break;
      case "replace":
        replaced.forEach(([, newEvent]) => {
          newEvent.resources.map((resourceRecord) => resourceIds.add(resourceRecord.id));
        });
        me.clearResources(resourceIds);
        break;
      case "removeall":
      case "filter":
        me.clearAll();
        me.refresh();
        return;
      case "update": {
        const allChrono = record.$entity ? !Object.keys(changes).some((name) => !record.$entity.getField(name)) : !Object.keys(changes).some((name) => !chronoFields2[name]);
        let changeCount = 0;
        if ("startDate" in changes)
          changeCount++;
        if ("endDate" in changes)
          changeCount++;
        if ("duration" in changes)
          changeCount++;
        if (!allChrono || changeCount || "percentDone" in changes || "inactive" in changes || "segments" in changes) {
          if (me.shouldWaitForInitializeAndEngineReady) {
            me.refreshResourcesWhenReady(resourceIds);
          } else {
            me.clearResources(resourceIds);
            me.refresh();
          }
        }
        return;
      }
    }
    me.refreshResourcesWhenReady(resourceIds);
  }
  //endregion
  //region ResourceStore
  attachToResourceStore(resourceStore) {
    const me = this;
    super.attachToResourceStore(resourceStore);
    me.refreshAllWhenReady = true;
    if (me.resourceColumns) {
      me.resourceColumns.resourceStore = resourceStore;
    }
    resourceStore.ion({
      name: "resourceStore",
      changePreCommit: "onResourceStoreChange",
      refreshPreCommit: "onResourceStoreRefresh",
      // In vertical, resource store is not the row store but should toggle the load mask
      load: () => me.scheduler.unmaskBody(),
      thisObj: me,
      prio: 1
      // Call before others to clear cache before redraw
    });
    if (me.initialized && me.scheduler.isPainted) {
      me.firstResource = me.lastResource = null;
      me.clearAll();
      me.renderer();
    }
  }
  onResourceStoreChange({ source: resourceStore, action, records = [], record, replaced, changes }) {
    const me = this, resourceRecords = replaced ? replaced.map((r) => r[1]) : records, resourceIds = new Set(resourceRecords.map((resourceRecord) => resourceRecord.id));
    me.firstResource = me.lastResource = null;
    resourceStore._allResourceRecords = null;
    const { allResourceRecords } = resourceStore;
    if (me.scheduler.isEngineReady) {
      switch (action) {
        case "update":
          if (changes == null ? void 0 : changes.id) {
            me.clearResources([changes.id.oldValue, changes.id.value]);
          } else {
            me.clearResources([record.id]);
          }
          break;
        case "filter":
          me.clearAll();
          break;
      }
      if (changes && "columnWidth" in changes) {
        me.clearAll();
      }
      me.refresh(true);
    } else {
      switch (action) {
        case "dataset":
        case "remove":
        case "removeall":
          me.refreshAllResourcesWhenReady();
          return;
        case "replace":
        case "add": {
          if (!resourceStore.isGrouped) {
            const firstIndex = resourceRecords.reduce(
              (index, record2) => Math.min(index, allResourceRecords.indexOf(record2)),
              allResourceRecords.length
            );
            for (let i = firstIndex; i < allResourceRecords.length; i++) {
              resourceIds.add(allResourceRecords[i].id);
            }
          }
        }
      }
      me.refreshResourcesWhenReady(resourceIds);
    }
  }
  onResourceStoreRefresh({ action }) {
    const me = this;
    if (action === "sort" || action === "group") {
      me.firstResource = me.lastResource = me.resourceStore._allResourceRecords = null;
      me.clearAll();
      me.refresh();
    }
  }
  //endregion
  //region AssignmentStore
  attachToAssignmentStore(assignmentStore) {
    super.attachToAssignmentStore(assignmentStore);
    this.refreshAllWhenReady = true;
    if (assignmentStore) {
      assignmentStore.ion({
        name: "assignmentStore",
        changePreCommit: "onAssignmentStoreChange",
        refreshPreCommit: "onAssignmentStoreRefresh",
        thisObj: this
      });
    }
  }
  onAssignmentStoreChange({ action, records: assignmentRecords = [], replaced, changes }) {
    const me = this, resourceIds = new Set(assignmentRecords.map((assignmentRecord) => assignmentRecord.resourceId));
    if (me.scheduler.isEngineReady) {
      switch (action) {
        case "remove":
          me.clearResources(resourceIds);
          break;
        case "filter":
          me.clearAll();
          break;
        case "update": {
          if ("resourceId" in changes) {
            resourceIds.add(changes.resourceId.oldValue);
          }
          if (!Object.keys(changes).filter((field) => field !== "resource" && field !== "event").length) {
            return;
          }
          me.clearResources(resourceIds);
        }
      }
      me.refresh(true);
    } else {
      if (changes && "resourceId" in changes) {
        resourceIds.add(changes.resourceId.oldValue);
      }
      switch (action) {
        case "removeall":
          me.refreshAllResourcesWhenReady();
          return;
        case "replace":
          replaced.forEach(([oldAssignment, newAssignment]) => {
            resourceIds.add(oldAssignment.resourceId);
            resourceIds.add(newAssignment.resourceId);
          });
      }
      me.refreshResourcesWhenReady(resourceIds);
    }
  }
  onAssignmentStoreRefresh({ action, records }) {
    if (action === "batch") {
      this.clearAll();
      this.refreshAllResourcesWhenReady();
    }
  }
  //endregion
  //region View hooks
  refreshRows(reLayoutEvents) {
    if (reLayoutEvents) {
      this.clearAll();
      this.scheduler.refreshFromRerender = false;
    }
  }
  // Called from SchedulerEventRendering
  repaintEventsForResource(resourceRecord) {
    this.renderResource(resourceRecord);
  }
  updateFromHorizontalScroll(scrollX) {
    if (scrollX !== this.prevScrollX) {
      this.renderer();
      this.prevScrollX = scrollX;
    }
  }
  updateFromVerticalScroll() {
    this.renderer();
  }
  scrollResourceIntoView(resourceRecord, options) {
    const { scheduler } = this, x = this.allResourceRecords.indexOf(resourceRecord) * scheduler.resourceColumnWidth;
    return scheduler.scrollHorizontallyTo(x, options);
  }
  get allResourceRecords() {
    return this.scheduler.resourceStore.allResourceRecords;
  }
  // Called when viewport size changes
  onViewportResize(width) {
    this.resourceColumns.availableWidth = width;
    this.renderer();
  }
  get resourceColumns() {
    var _a;
    return (_a = this.scheduler.timeAxisColumn) == null ? void 0 : _a.resourceColumns;
  }
  // Clear events in case they use date as part of displayed info
  onLocaleChange() {
    this.clearAll();
  }
  // No need to do anything special
  onDragAbort() {
  }
  onBeforeRowHeightChange() {
  }
  onTimeAxisViewModelUpdate() {
  }
  updateElementId() {
  }
  releaseTimeSpanDiv() {
  }
  //endregion
  //region Dependency connectors
  /**
   * Gets displaying item start side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @returns {'top'|'left'|'bottom'|'right'} 'left' / 'right' / 'top' / 'bottom'
   */
  getConnectorStartSide(eventRecord) {
    return "top";
  }
  /**
   * Gets displaying item end side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @returns {'top'|'left'|'bottom'|'right'} 'left' / 'right' / 'top' / 'bottom'
   */
  getConnectorEndSide(eventRecord) {
    return "bottom";
  }
  //endregion
  //region Refresh resources
  /**
   * Clears resources directly and redraws them on next project refresh
   * @param {Number[]|String[]} resourceIds
   * @private
   */
  refreshResourcesWhenReady(resourceIds) {
    this.clearResources(resourceIds);
    resourceIds.forEach((id) => this.toDrawOnProjectRefresh.add(id));
  }
  /**
   * Clears all resources directly and redraws them on next project refresh
   * @private
   */
  refreshAllResourcesWhenReady() {
    this.clearAll();
    this.refreshAllWhenReady = true;
  }
  //region Rendering
  // Resources in view + buffer
  get resourceRange() {
    return this.getResourceRange(true);
  }
  // Resources strictly in view
  get visibleResources() {
    const { first, last } = this.getResourceRange();
    return {
      first: this.allResourceRecords[first],
      last: this.allResourceRecords[last]
    };
  }
  getResourceRange(withBuffer) {
    const {
      scheduler,
      resourceStore
    } = this, {
      resourceColumnWidth,
      scrollX
    } = scheduler, {
      scrollWidth
    } = scheduler.timeAxisSubGrid.scrollable, resourceBufferSize = withBuffer ? this.resourceBufferSize : 0, viewportStart = scrollX - resourceBufferSize, viewportEnd = scrollX + scrollWidth + resourceBufferSize;
    if (!(resourceStore == null ? void 0 : resourceStore.count)) {
      return { first: -1, last: -1 };
    }
    if (scheduler.variableColumnWidths) {
      let first, last = 0, start, end = 0;
      this.allResourceRecords.forEach((resource, i) => {
        resource.instanceMeta(scheduler).insetStart = start = end;
        end = start + resource.columnWidth;
        if (start > viewportEnd) {
          return false;
        }
        if (end > viewportStart && first == null) {
          first = i;
        } else if (start < viewportEnd) {
          last = i;
        }
      });
      return { first, last };
    } else {
      return {
        first: Math.max(Math.floor(scrollX / resourceColumnWidth) - resourceBufferSize, 0),
        last: Math.min(
          Math.floor((scrollX + scheduler.timeAxisSubGrid.width) / resourceColumnWidth) + resourceBufferSize,
          this.allResourceRecords.length - 1
        )
      };
    }
  }
  // Dates in view + buffer
  get dateRange() {
    const { scheduler } = this;
    let bottomDate = scheduler.getDateFromCoordinate(
      Math.min(
        scheduler.scrollTop + scheduler.bodyHeight + scheduler.tickSize - 1,
        (scheduler.virtualScrollHeight || scheduler.scrollable.scrollHeight) - 1
      )
    );
    if (!bottomDate) {
      bottomDate = scheduler.timeAxis.last.endDate;
    }
    let topDate = scheduler.getDateFromCoordinate(Math.max(scheduler.scrollTop - scheduler.tickSize, 0));
    if (!topDate) {
      topDate = scheduler.timeAxis.first.startDate;
      bottomDate = scheduler.getDateFromCoordinate(scheduler.bodyHeight + scheduler.tickSize - 1);
    }
    return {
      topDate,
      bottomDate
    };
  }
  getTimeSpanRenderData(eventRecord, resourceRecord, includeOutside = false) {
    var _a;
    const me = this, {
      scheduler
    } = me, {
      preamble,
      postamble
    } = eventRecord, {
      variableColumnWidths
    } = scheduler, useEventBuffer = ((_a = scheduler.features.eventBuffer) == null ? void 0 : _a.enabled) && me.isProVerticalRendering && (preamble || postamble) && !eventRecord.isMilestone, startDateField = useEventBuffer ? "wrapStartDate" : "startDate", endDateField = useEventBuffer ? "wrapEndDate" : "endDate", startDate = eventRecord.isBatchUpdating && eventRecord.hasBatchedChange(startDateField) && !useEventBuffer ? eventRecord.get(startDateField) : eventRecord[startDateField], endDate = eventRecord.isBatchUpdating && eventRecord.hasBatchedChange(endDateField) && !useEventBuffer ? eventRecord.get(endDateField) : eventRecord[endDateField], {
      resourceMarginObject: { total }
    } = scheduler.getResourceLayoutSettings(resourceRecord), top = scheduler.getCoordinateFromDate(startDate), instanceMeta = resourceRecord.instanceMeta(scheduler), left = variableColumnWidths ? instanceMeta.insetStart : me.allResourceRecords.indexOf(resourceRecord) * scheduler.resourceColumnWidth, resourceWidth = scheduler.getResourceWidth(resourceRecord), width = resourceWidth - total, startDateMS = startDate.getTime(), endDateMS = endDate.getTime();
    let bottom = scheduler.getCoordinateFromDate(endDate), height = bottom - top;
    if (bottom === -1) {
      height = Math.round((endDateMS - startDateMS) * scheduler.timeAxisViewModel.getSingleUnitInPixels("millisecond"));
      bottom = top + height;
    }
    return {
      eventRecord,
      resourceRecord,
      left,
      top,
      bottom,
      resourceWidth,
      width,
      height,
      startDate,
      endDate,
      startDateMS,
      endDateMS,
      useEventBuffer,
      children: [],
      start: startDate,
      end: endDate,
      startMS: startDateMS,
      endMS: endDateMS
    };
  }
  // Earlier start dates are above later tasks
  // If same start date, longer tasks float to top
  // If same start + duration, sort by name
  eventSorter(a, b) {
    const startA = a.dataStartMs || a.startDateMS, endA = a.dataEndMs || a.endDateMS, startB = b.dataStartMs || b.startDateMS, endB = b.dataEndMs || b.endDateMS, nameA = a.isModel ? a.name : a.eventRecord.name, nameB = b.isModel ? b.name : b.eventRecord.name;
    return startA - startB || endB - endA || (nameA < nameB ? -1 : nameA == nameB ? 0 : 1);
  }
  layoutEvents(resourceRecord, allEvents, includeOutside = false, parentEventRecord, eventSorter) {
    const me = this, { scheduler } = me, {
      variableColumnWidths
    } = scheduler, { id: resourceId } = resourceRecord, instanceMeta = resourceRecord.instanceMeta(scheduler), cacheKey = parentEventRecord ? `${resourceId}-${parentEventRecord.id}` : resourceId, cache = me.resourceMap.set(cacheKey, {}).get(cacheKey), resourceIndex = me.allResourceRecords.indexOf(resourceRecord), {
      barMargin,
      resourceMarginObject: { start, total }
    } = scheduler.getResourceLayoutSettings(resourceRecord, parentEventRecord);
    const layoutData = allEvents.reduce((toLayout, eventRecord) => {
      if (eventRecord.isScheduled) {
        const renderData = scheduler.generateRenderData(eventRecord, resourceRecord, false), eventData = { renderData }, eventResources = ObjectHelper.getMapPath(me.eventMap, renderData.eventId, {});
        eventResources[resourceId] = eventData;
        cache[renderData.eventId] = eventData;
        if (renderData.fillSize) {
          renderData.left = variableColumnWidths ? instanceMeta.insetStart : resourceIndex * scheduler.resourceColumnWidth;
          renderData.width = scheduler.getResourceWidth(resourceRecord);
        } else {
          toLayout.push(renderData);
        }
      }
      return toLayout;
    }, []);
    layoutData.sort(eventSorter != null ? eventSorter : me.eventSorter);
    me.verticalLayout.applyLayout(
      layoutData,
      scheduler.getResourceWidth(resourceRecord, parentEventRecord),
      start,
      total,
      barMargin,
      resourceIndex,
      scheduler.getEventLayout(resourceRecord, parentEventRecord)
    );
    return cache;
  }
  // Calculate the layout for all events assigned to a resource. Since we are never stacking, the layout of one
  // resource will never affect the others
  layoutResourceEvents(resourceRecord) {
    const me = this, { scheduler } = me, {
      assignmentStore,
      eventStore,
      timeAxis
    } = scheduler;
    let events = eventStore.getEvents({
      includeOccurrences: scheduler.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate,
      filter: (assignmentStore.isFiltered || eventStore.isFiltered) && ((eventRecord) => eventRecord.assignments.some((a) => a.resource === resourceRecord && assignmentStore.includes(a)))
    });
    events = scheduler.getEventsToRender(resourceRecord, events);
    return me.layoutEvents(resourceRecord, events);
  }
  /**
   * Used by event drag features to bring into existence event elements that are outside of the rendered block.
   * @param {Scheduler.model.TimeSpan} eventRecord The event to render
   * @private
   */
  addTemporaryDragElement(eventRecord) {
    const { scheduler } = this, renderData = scheduler.generateRenderData(
      eventRecord,
      eventRecord.resource,
      { timeAxis: true, viewport: true }
    );
    renderData.top = renderData.row ? renderData.top + renderData.row.top : scheduler.getResourceEventBox(eventRecord, eventRecord.resource, true).top;
    const domConfig = this.renderEvent({ renderData }), { dataset } = domConfig;
    delete domConfig.tabIndex;
    delete dataset.eventId;
    delete dataset.resourceId;
    delete dataset.assignmentId;
    delete dataset.syncId;
    dataset.transient = true;
    domConfig.parent = this.scheduler.foregroundCanvas;
    domConfig.retainElement = true;
    const result = DomHelper.createElement(domConfig);
    result.innerElement = result.firstChild;
    eventRecord.instanceMeta(scheduler).hasTemporaryDragElement = true;
    return result;
  }
  // To update an event, first release its element and then render it again.
  // The element will be reused and updated. Keeps code simpler
  renderEvent(eventData) {
    const { scheduler } = this, data = eventData.renderData, {
      resourceRecord,
      assignmentRecord,
      eventRecord
    } = data, elementConfig = {
      className: data.wrapperCls,
      tabIndex: -1,
      children: [
        {
          role: "presentation",
          className: data.cls,
          style: (data.internalStyle || "") + (data.style || ""),
          children: data.children,
          dataset: {
            // Each feature putting contents in the event wrap should have this to simplify syncing and
            // element retrieval after sync
            taskFeature: "event"
          },
          syncOptions: {
            syncIdField: "taskBarFeature"
          }
        },
        ...data.wrapperChildren
      ],
      style: {
        top: data.top,
        [scheduler.rtl ? "right" : "left"]: data.left,
        // DomHelper appends px to dimensions when using numbers
        height: eventRecord.isMilestone ? "1em" : data.height,
        width: data.width,
        style: data.wrapperStyle || "",
        fontSize: eventRecord.isMilestone ? Math.min(data.width, 40) : null
      },
      dataset: {
        // assignmentId is set in this function conditionally
        resourceId: resourceRecord.id,
        eventId: data.eventId,
        // Not using eventRecord.id to distinguish between Event and ResourceTimeRange
        // Sync using assignment id for events and event id for ResourceTimeRanges
        syncId: assignmentRecord ? this.assignmentStore.getOccurrence(assignmentRecord, eventRecord).id : data.eventId
      },
      // Will not be part of DOM, but attached to the element
      elementData: eventData,
      // Dragging etc. flags element as retained, to not reuse/release it during that operation. Events
      // always use assignments, but ResourceTimeRanges does not
      retainElement: (assignmentRecord || eventRecord).instanceMeta(this.scheduler).retainElement,
      // Options for this level of sync, lower levels can have their own
      syncOptions: {
        syncIdField: "taskFeature",
        // Remove instead of release when a feature is disabled
        releaseThreshold: 0
      }
    };
    elementConfig.className["b-sch-vertical"] = 1;
    if (data.zIndex) {
      elementConfig.zIndex = data.zIndex;
    }
    if (assignmentRecord) {
      elementConfig.dataset.assignmentId = assignmentRecord.id;
    }
    data.elementConfig = eventData.elementConfig = elementConfig;
    scheduler.afterRenderEvent({ renderData: data, domConfig: elementConfig });
    return elementConfig;
  }
  renderResource(resourceRecord) {
    var _a;
    const me = this, { topDateMS, bottomDateMS } = me, eventDOMConfigs = [];
    let resourceEntry = me.resourceMap.get(resourceRecord.id);
    if (!resourceEntry) {
      resourceEntry = me.layoutResourceEvents(resourceRecord);
    }
    for (const eventId in resourceEntry) {
      const eventData = resourceEntry[eventId], { endDateMS, startDateMS, eventRecord } = eventData.renderData;
      if (
        // Only collect configs for those actually in view
        endDateMS >= topDateMS && startDateMS <= bottomDateMS && // And not being dragged, those have a temporary element already
        !eventRecord.instanceMeta(me.scheduler).hasTemporaryDragElement
      ) {
        const domConfig = ((_a = eventData.elementConfig) == null ? void 0 : _a.className) !== "b-released" && eventData.elementConfig || me.renderEvent(eventData);
        eventDOMConfigs.push(domConfig);
      }
    }
    return eventDOMConfigs;
  }
  isEventElement(domConfig) {
    const className = domConfig && domConfig.className;
    return className && className[this.scheduler.eventCls + "-wrap"];
  }
  get shouldWaitForInitializeAndEngineReady() {
    return !this.initialized || !this.scheduler.isEngineReady && !this.scheduler.isCreating;
  }
  // Single cell so only one call to this renderer, determine which events are in view and draw them.
  // Drawing on scroll is triggered by `updateFromVerticalScroll()` and `updateFromHorizontalScroll()`
  renderer() {
    const me = this, { scheduler } = me, { first: firstResource, last: lastResource } = me.resourceRange, { topDate, bottomDate } = me.dateRange, syncConfigs = [], featureDomConfigs = [];
    if (me.shouldWaitForInitializeAndEngineReady) {
      return;
    }
    if (!DateHelper.isEqual(topDate, me.topDate) || !DateHelper.isEqual(bottomDate, me.bottomDate)) {
      me.topDate = topDate;
      me.bottomDate = bottomDate;
      me.topDateMS = topDate.getTime();
      me.bottomDateMS = bottomDate.getTime();
      const range = me.timeView.range = { startDate: topDate, endDate: bottomDate };
      scheduler.internalOnVisibleDateRangeChange(range);
    }
    if (firstResource !== -1 && lastResource !== -1) {
      for (let i = firstResource; i <= lastResource; i++) {
        syncConfigs.push.apply(syncConfigs, me.renderResource(me.allResourceRecords[i]));
      }
    }
    scheduler.getForegroundDomConfigs(featureDomConfigs);
    syncConfigs.push.apply(syncConfigs, featureDomConfigs);
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: syncConfigs
      },
      targetElement: scheduler.foregroundCanvas,
      syncIdField: "syncId",
      // Called by DomHelper when it creates, releases or reuses elements
      callback({ action, domConfig, lastDomConfig, targetElement, jsx }) {
        var _a, _b, _c;
        const { reactComponent } = scheduler;
        if (me.isEventElement(domConfig) || jsx || ((_a = domConfig == null ? void 0 : domConfig.elementData) == null ? void 0 : _a.jsx)) {
          const isRelease = releaseEventActions2[action], isRender = renderEventActions2[action];
          if ((_b = scheduler.processEventContent) == null ? void 0 : _b.call(scheduler, {
            action,
            domConfig,
            isRelease: false,
            targetElement,
            reactComponent,
            jsx
          }))
            return;
          if (isRelease && me.isEventElement(lastDomConfig) && !lastDomConfig.isReleased) {
            const data = lastDomConfig.elementData.renderData, event = {
              renderData: data,
              assignmentRecord: data.assignmentRecord,
              eventRecord: data.eventRecord,
              resourceRecord: data.resourceRecord,
              element: targetElement
            };
            (_c = scheduler.processEventContent) == null ? void 0 : _c.call(scheduler, {
              isRelease,
              targetElement,
              reactComponent,
              assignmentRecord: data.assignmentRecord
            });
            if (targetElement === DomHelper.getActiveElement(targetElement)) {
              scheduler.focusElement.focus();
            }
            scheduler.trigger("releaseEvent", event);
          }
          if (isRender) {
            const data = domConfig.elementData.renderData, event = {
              renderData: data,
              assignmentRecord: data.assignmentRecord,
              eventRecord: data.eventRecord,
              resourceRecord: data.resourceRecord,
              element: targetElement,
              isReusingElement: action === "reuseElement",
              isRepaint: action === "reuseOwnElement"
            };
            event.reusingElement = action === "reuseElement";
            scheduler.trigger("renderEvent", event);
          }
        }
      }
    });
    if (me.firstResource !== firstResource || me.lastResource !== lastResource) {
      const range = me.resourceColumns.visibleResources = { firstResource, lastResource };
      me.firstResource = firstResource;
      me.lastResource = lastResource;
      scheduler.onVisibleResourceRangeChange(range);
      scheduler.trigger("resourceRangeChange", range);
    }
  }
  refresh(transition) {
    this.scheduler.runWithTransition(() => this.renderer(), transition);
  }
  // To match horizontals API, used from EventDrag
  refreshResources(resourceIds) {
    this.clearResources(resourceIds);
    this.refresh();
  }
  // To match horizontals API, used from EventDrag
  refreshEventsForResource(recordOrRow, force = true, draw = true) {
    this.refreshResources([recordOrRow.id]);
  }
  onRenderDone() {
  }
  //endregion
  //region Other
  get timeView() {
    return this.scheduler.timeView;
  }
  //endregion
  //region Cache
  // Clears cached resource layout
  clearResources(resourceIds) {
    const { resourceMap, eventMap } = this;
    resourceIds.forEach((resourceId) => {
      if (resourceMap.has(resourceId)) {
        Object.values(resourceMap.get(resourceId)).forEach(({ renderData: { eventId } }) => {
          delete eventMap.get(eventId)[resourceId];
        });
        resourceMap.delete(resourceId);
      }
    });
  }
  clearAll() {
    this.resourceMap.clear();
    this.eventMap.clear();
  }
  //endregion
};
VerticalRendering._$name = "VerticalRendering";

// ../Scheduler/lib/Scheduler/view/TimeAxisBase.js
function isLastLevel(level, levels) {
  return level === levels.length - 1;
}
function isLastCell(level, cell) {
  return cell === level.cells[level.cells.length - 1];
}
var TimeAxisBase = class extends Widget {
  constructor() {
    super(...arguments);
    __publicField(this, "startDate", null);
    __publicField(this, "endDate", null);
    __publicField(this, "levels", []);
    __publicField(this, "size", null);
  }
  // Set visible date range
  set range({ startDate, endDate }) {
    var _a;
    const me = this;
    if (me.startDate - startDate || me.endDate - endDate) {
      const { client } = me;
      me.startDate = startDate;
      me.endDate = endDate;
      if (me.sizeProperty === "width" && (client == null ? void 0 : client.hideHeaders) || me.sizeProperty === "height" && ((_a = client == null ? void 0 : client.verticalTimeAxisColumn) == null ? void 0 : _a.hidden)) {
        return;
      }
      me.refresh();
    }
  }
  //endregion
  //region Html & rendering
  // Generates element configs for all levels defined by the current ViewPreset
  buildCells(start = this.startDate, end = this.endDate) {
    var _a;
    const me = this, { sizeProperty } = me, {
      stickyHeaders,
      isVertical
    } = me.client || {}, featureHeaderConfigs = [], { length } = me.levels;
    const cellConfigs = me.levels.map((level, i) => {
      var _a2;
      const stickyHeader = stickyHeaders && (isVertical || i < length - 1);
      return {
        className: {
          "b-sch-header-row": 1,
          [`b-sch-header-row-${level.position}`]: 1,
          "b-sch-header-row-main": i === me.model.viewPreset.mainHeaderLevel,
          "b-lowest": isLastLevel(i, me.levels),
          "b-sticky-header": stickyHeader
        },
        syncOptions: {
          // Keep a maximum of 5 released cells. Might be fine with fewer since ticks are fixed width.
          // Prevents an unnecessary amount of cells from sticking around when switching from narrow to
          // wide tickSizes
          releaseThreshold: 5,
          syncIdField: "tickIndex"
        },
        dataset: {
          headerFeature: `headerRow${i}`,
          headerPosition: level.position
        },
        // Only include cells in view
        children: (_a2 = level.cells) == null ? void 0 : _a2.filter((cell) => cell.start < end && cell.end > start).map((cell, j) => ({
          role: "presentation",
          className: {
            "b-sch-header-timeaxis-cell": 1,
            [cell.headerCellCls]: cell.headerCellCls,
            [`b-align-${cell.align}`]: cell.align,
            "b-last": isLastCell(level, cell)
          },
          dataset: {
            tickIndex: cell.index,
            // Used in export tests to resolve dates from tick elements
            ...globalThis.DEBUG && { date: cell.start.getTime() }
          },
          style: {
            // DomHelper appends px to numeric dimensions
            [me.positionProperty]: cell.coord,
            [sizeProperty]: cell.width,
            [`min-${sizeProperty}`]: cell.width
          },
          children: [
            {
              tag: "span",
              role: "presentation",
              className: {
                "b-sch-header-text": 1,
                "b-sticky-header": stickyHeader
              },
              html: cell.value
            }
          ]
        }))
      };
    });
    (_a = me.client) == null ? void 0 : _a.getHeaderDomConfigs(featureHeaderConfigs);
    cellConfigs.push(...featureHeaderConfigs);
    return {
      onlyChildren: true,
      syncOptions: {
        // Do not keep entire levels no longer used, for example after switching view preset
        releaseThreshold: 0
      },
      children: cellConfigs
    };
  }
  render(targetElement) {
    super.render(targetElement);
    this.refresh(true);
  }
  /**
   * Refresh the UI
   * @param {Boolean} [rebuild] Specify `true` to force a rebuild of the underlying header level definitions
   */
  refresh(rebuild = !this.levels.length) {
    const me = this, { columnConfig } = me.model, { levels } = me, oldLevelsCount = levels.length;
    if (rebuild) {
      levels.length = 0;
      columnConfig.forEach((cells, position) => levels[position] = {
        position,
        cells
      });
      me.size = levels[0].cells.reduce((sum, cell) => sum + cell.width, 0);
      const { parentElement } = me.element;
      if (parentElement && (levels.length !== oldLevelsCount || rebuild)) {
        parentElement.classList.remove(`b-sch-timeaxiscolumn-levels-${oldLevelsCount}`);
        parentElement.classList.add(`b-sch-timeaxiscolumn-levels-${levels.length}`);
      }
    }
    if (!me.startDate || !me.endDate) {
      return;
    }
    DomSync.sync({
      domConfig: me.buildCells(),
      targetElement: me.element,
      syncIdField: "headerFeature"
    });
    me.trigger("refresh");
  }
  //endregion
  // Our widget class doesn't include "base".
  get widgetClass() {
    return "b-timeaxis";
  }
};
__publicField(TimeAxisBase, "$name", "TimeAxisBase");
//region Config
__publicField(TimeAxisBase, "configurable", {
  /**
   * The minimum width for a bottom row header cell to be considered 'compact', which adds a special CSS class
   * to the row (for special styling). Copied from Scheduler/Gantt.
   * @config {Number}
   * @default
   */
  compactCellWidthThreshold: 15,
  // TimeAxisViewModel
  model: null,
  cls: null,
  /**
   * Style property to use as cell size. Either width or height depending on orientation
   * @config {'width'|'height'}
   * @private
   */
  sizeProperty: null,
  /**
   * Style property to use as cells position. Either left or top depending on orientation
   * @config {'left'|'top'}
   * @private
   */
  positionProperty: null
});
TimeAxisBase._$name = "TimeAxisBase";

// ../Scheduler/lib/Scheduler/view/HorizontalTimeAxis.js
var HorizontalTimeAxis = class extends TimeAxisBase {
  //endregion
  get positionProperty() {
    var _a;
    return ((_a = this.owner) == null ? void 0 : _a.rtl) ? "right" : "left";
  }
  get width() {
    return this.size;
  }
  onModelUpdate() {
    var _a;
    if (!((_a = this.owner) == null ? void 0 : _a.hideHeaders) && this.model.availableSpace > 0 && this.model.availableSpace !== this.width) {
      this.refresh(true);
    }
  }
  updateModel(timeAxisViewModel) {
    this.detachListeners("tavm");
    timeAxisViewModel == null ? void 0 : timeAxisViewModel.ion({
      name: "tavm",
      update: "onModelUpdate",
      thisObj: this
    });
  }
};
//region Config
__publicField(HorizontalTimeAxis, "$name", "HorizontalTimeAxis");
__publicField(HorizontalTimeAxis, "type", "horizontaltimeaxis");
__publicField(HorizontalTimeAxis, "configurable", {
  model: null,
  sizeProperty: "width"
});
HorizontalTimeAxis._$name = "HorizontalTimeAxis";

// ../Scheduler/lib/Scheduler/view/ResourceHeader.js
var ResourceHeader = class extends Widget {
  constructor() {
    super(...arguments);
    /**
     * An index of the first visible resource in vertical mode
     * @property {Number}
     * @readonly
     * @private
     */
    __publicField(this, "firstResource", -1);
    /**
     * An index of the last visible resource in vertical mode
     * @property {Number}
     * @readonly
     * @private
     */
    __publicField(this, "lastResource", -1);
  }
  //endregion
  //region Init
  construct(config) {
    const me = this;
    config.scheduler._resourceColumns = me;
    super.construct(config);
    if (me.imagePath != null) {
      me.element.classList.add("b-has-images");
    }
    EventHelper.on({
      element: me.element,
      delegate: ".b-resourceheader-cell",
      capture: true,
      click: "onResourceMouseEvent",
      dblclick: "onResourceMouseEvent",
      contextmenu: "onResourceMouseEvent",
      thisObj: me
    });
  }
  changeShowAvatars(show) {
    var _a;
    (_a = this.avatarRendering) == null ? void 0 : _a.destroy();
    if (show) {
      this.avatarRendering = new AvatarRendering({
        element: this.element
      });
    }
    return show;
  }
  updateShowAvatars() {
    if (!this.isConfiguring) {
      this.refresh();
    }
  }
  //endregion
  //region ResourceStore
  updateResourceStore(store) {
    const me = this;
    me.detachListeners("resourceStore");
    if (store) {
      store.ion({
        name: "resourceStore",
        changePreCommit: "onResourceStoreDataChange",
        thisObj: me
      });
      if (store.count) {
        me.onResourceStoreDataChange({});
      }
    }
  }
  // Redraw resource headers on any data change
  onResourceStoreDataChange({ action }) {
    const me = this;
    me.getConfig("fillWidth");
    me.getConfig("fitWidth");
    me.updateWidthCache();
    const {
      element
    } = me, width = me.totalWidth;
    if (me.scheduler.variableColumnWidths) {
      me._fillWidth = me._fitWidth = false;
    } else {
      me._fillWidth = me.configuredFillWidth;
      me._fitWidth = me.configuredFitWidth;
    }
    if (width !== me.width) {
      DomHelper.setLength(element, "width", width);
      me.column.set("width", width, me.column.grid.isConfiguring);
    }
    if (action === "removeall") {
      element.innerHTML = "";
    }
    if (action === "remove" || action === "add" || action === "filter" || me.fitWidth || me.fillWidth) {
      me.refreshWidths();
    }
    me.column.grid.toggleEmptyText();
  }
  get totalWidth() {
    return this.updateWidthCache();
  }
  updateWidthCache() {
    let result = 0;
    const { scheduler } = this;
    scheduler.variableColumnWidths = false;
    scheduler.resourceStore.forEach((resource) => {
      resource.instanceMeta(scheduler).insetStart = result;
      resource.instanceMeta(scheduler).insetEnd = result + (resource.columnWidth || scheduler.resourceColumnWidth);
      if (resource.columnWidth == null) {
        result += scheduler.resourceColumnWidth;
      } else {
        result += resource.columnWidth;
        scheduler.variableColumnWidths = true;
      }
    });
    return result;
  }
  //endregion
  //region Properties
  changeColumnWidth(columnWidth) {
    if (!this.refreshingWidths) {
      this.configuredColumnWidth = columnWidth;
    }
    return columnWidth;
  }
  updateColumnWidth(width, oldWidth) {
    const me = this;
    if (!me.refreshingWidths) {
      me.refreshWidths();
    }
    if (!me.isConfiguring) {
      if (me.resourceStore.isGrouped) {
        me.updateWidthCache();
      }
      me.refresh();
      me.trigger("columnWidthChange", { width, oldWidth });
    }
  }
  changeFillWidth(fillWidth) {
    return this.configuredFillWidth = fillWidth;
  }
  updateFillWidth() {
    if (!this.isConfiguring) {
      this.refreshWidths();
    }
  }
  changeFitWidth(fitWidth) {
    return this.configuredFitWidth = fitWidth;
  }
  updateFitWidth() {
    if (!this.isConfiguring) {
      this.refreshWidths();
    }
  }
  getImageURL(imageName) {
    return StringHelper.joinPaths([this.imagePath || "", imageName || ""]);
  }
  updateImagePath() {
    if (!this.isConfiguring) {
      this.refresh();
    }
  }
  //endregion
  //region Fit to width
  updateAvailableWidth(width) {
    this.refreshWidths();
  }
  // Updates the column widths according to fill and fit settings
  refreshWidths() {
    var _a;
    const me = this, {
      availableWidth,
      configuredColumnWidth
    } = me, count = (_a = me.resourceStore) == null ? void 0 : _a.count;
    if (!availableWidth || !count || me.scheduler.variableColumnWidths) {
      return;
    }
    me.refreshingWidths = true;
    const fit = me.fitWidth || me.fillWidth && configuredColumnWidth * count < availableWidth, useWidth = fit ? Math.floor(availableWidth / count) : configuredColumnWidth, shouldAnimate = me.column.grid.enableEventAnimations && Math.abs(me._columnWidth - useWidth) > 30;
    DomHelper.addTemporaryClass(me.element, "b-animating", shouldAnimate ? 300 : 0, me);
    me.columnWidth = useWidth;
    me.refreshingWidths = false;
  }
  //endregion
  //region Rendering
  // Visual resource range, set by VerticalRendering + its buffer
  set visibleResources({ firstResource, lastResource }) {
    this.firstResource = firstResource;
    this.lastResource = lastResource;
    this.updateWidthCache();
    this.refresh();
  }
  /**
   * Refreshes the visible headers
   */
  refresh() {
    var _a, _b;
    const me = this, {
      firstResource,
      scheduler,
      resourceStore,
      lastResource
    } = me, {
      variableColumnWidths
    } = scheduler, groupField = resourceStore.isGrouped && resourceStore.groupers[0].field, configs = [];
    me.element.classList.toggle("b-grouped", Boolean(groupField));
    if (!me.column.grid.isConfiguring && firstResource > -1 && lastResource > -1 && lastResource < resourceStore.count) {
      let currentGroup;
      for (let i = firstResource; i <= lastResource; i++) {
        const resourceRecord = resourceStore.allResourceRecords[i], groupRecord = (_a = resourceRecord.groupParent) == null ? void 0 : _a.get(resourceStore.id), groupChildren = groupRecord == null ? void 0 : groupRecord.groupChildren;
        if (groupField && groupRecord.id !== (currentGroup == null ? void 0 : currentGroup.dataset.resourceId)) {
          const groupLeft = groupChildren[0].instanceMeta(scheduler).insetStart, groupWidth = groupChildren[groupChildren.length - 1].instanceMeta(scheduler).insetEnd - groupLeft;
          currentGroup = {
            className: "b-resourceheader-group-cell",
            dataset: {
              resourceId: groupRecord.id
            },
            style: {
              left: groupLeft,
              width: groupWidth
            },
            children: [
              {
                tag: "span",
                html: StringHelper.encodeHtml(groupChildren[0][groupField])
              },
              {
                className: "b-resourceheader-group-children",
                children: []
              }
            ]
          };
          configs.push(currentGroup);
        }
        const instanceMeta = resourceRecord.instanceMeta(scheduler), width = resourceRecord.columnWidth || me.columnWidth, position = groupField ? instanceMeta.insetStart - currentGroup.style.left : variableColumnWidths ? instanceMeta.insetStart : i * me.columnWidth, elementConfig = {
          // Might look like overkill to use DomClassList here, but can be used in headerRenderer
          className: new DomClassList({
            "b-resourceheader-cell": 1
          }),
          dataset: {
            resourceId: resourceRecord.id
          },
          style: {
            [scheduler.rtl ? "right" : "left"]: position,
            width
          },
          children: []
        };
        if (me.headerRenderer) {
          const value = me.headerRenderer({ elementConfig, resourceRecord });
          if (value) {
            if (typeof value === "string") {
              elementConfig.html = value;
            } else if (typeof value === "object") {
              elementConfig.children = [value];
            }
          }
        } else {
          let imageUrl;
          if (resourceRecord.imageUrl) {
            imageUrl = resourceRecord.imageUrl;
          } else {
            if (me.imagePath != null) {
              if (resourceRecord.image !== false) {
                const imageName = resourceRecord.image || ((_b = resourceRecord.name) == null ? void 0 : _b.toLowerCase()) + me.imageExtension;
                imageUrl = me.getImageURL(imageName);
              }
            }
          }
          elementConfig.children.push(
            me.showAvatars && me.avatarRendering.getResourceAvatar({
              resourceRecord,
              initials: resourceRecord.initials,
              color: resourceRecord.eventColor,
              iconCls: resourceRecord.iconCls,
              defaultImageUrl: me.defaultImageName && me.getImageURL(me.defaultImageName),
              imageUrl
            }),
            {
              tag: "span",
              className: "b-resource-name",
              html: StringHelper.encodeHtml(resourceRecord.name)
            }
          );
        }
        if (groupField) {
          currentGroup.children[1].children.push(elementConfig);
        } else {
          configs.push(elementConfig);
        }
      }
    }
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: configs
      },
      targetElement: me.element,
      syncIdField: "resourceId",
      callback: ({ jsx, targetElement, domConfig }) => {
        var _a2;
        (_a2 = scheduler.processResourceHeader) == null ? void 0 : _a2.call(scheduler, { jsx, targetElement, domConfig });
      }
    });
  }
  //endregion
  onResourceMouseEvent(event) {
    const resourceCell = event.target.closest(".b-resourceheader-cell"), resourceRecord = this.resourceStore.getById(resourceCell.dataset.resourceId);
    this.trigger("resourceHeader" + StringHelper.capitalize(event.type), {
      resourceRecord,
      event
    });
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs for the header, removing irrelevant ones
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    delete result.resourceStore;
    delete result.column;
    delete result.type;
    return result;
  }
};
//region Config
__publicField(ResourceHeader, "$name", "ResourceHeader");
__publicField(ResourceHeader, "type", "resourceheader");
__publicField(ResourceHeader, "configurable", {
  /**
   * Resource store used to render resource headers. Assigned from Scheduler.
   * @config {Scheduler.data.ResourceStore}
   * @private
   */
  resourceStore: null,
  /**
   * Custom header renderer function. Can be used to manipulate the element config used to create the element
   * for the header:
   *
   * ```javascript
   * new Scheduler({
   *   resourceColumns : {
   *     headerRenderer({ elementConfig, resourceRecord }) {
   *       elementConfig.dataset.myExtraData = 'extra';
   *       elementConfig.style.fontWeight = 'bold';
   *     }
   *   }
   * });
   * ```
   *
   * See {@link DomConfig} for more information.
   * Please take care to not break the default configs :)
   *
   * Or as a template by returning HTML from the function:
   *
   * ```javascript
   * new Scheduler({
   *   resourceColumns : {
   *     headerRenderer : ({ resourceRecord }) => `
   *       <div class="my-custom-template">
   *       ${resourceRecord.firstName} {resourceRecord.surname}
   *       </div>
   *     `
   *   }
   * });
   * ```
   *
   * NOTE: When using `headerRenderer` no default internal markup is applied to the resource header cell,
   * `iconCls` and {@link Scheduler.model.ResourceModel#field-imageUrl} or {@link Scheduler.model.ResourceModel#field-image}
   * will have no effect unless you supply custom markup for them.
   *
   * @config {Function}
   * @param {Object} params Object containing the params below
   * @param {Scheduler.model.ResourceModel} params.resourceRecord Resource whose header is being rendered
   * @param {DomConfig} params.elementConfig A config object used to create the element for the resource
   * @returns {void}
   */
  headerRenderer: null,
  /**
   * Set to `false` to render just the resource name, `true` to render an avatar (or initials if no image exists)
   * @config {Boolean}
   * @default true
   */
  showAvatars: {
    value: true,
    $config: "nullify"
  },
  /**
   * Assign to toggle resource columns **fill* mode. `true` means they will stretch (grow) to fill viewport, `false`
   * that they will respect their configured `columnWidth`.
   *
   * This is ignored if *any* resources are loaded with {@link Scheduler.model.ResourceModel#field-columnWidth}.
   * @member {Boolean} fillWidth
   */
  /**
   * Automatically resize resource columns to **fill** available width. Set to `false` to always respect the
   * configured `columnWidth`.
   *
   * This is ignored if *any* resources are loaded with {@link Scheduler.model.ResourceModel#field-columnWidth}.
   * @config {Boolean}
   * @default
   */
  fillWidth: true,
  /**
   * Assign to toggle resource columns **fit* mode. `true` means they will grow or shrink to always fit viewport,
   * `false` that they will respect their configured `columnWidth`.
   *
   * This is ignored if *any* resources are loaded with {@link Scheduler.model.ResourceModel#field-columnWidth}.
   * @member {Boolean} fitWidth
   */
  /**
   * Automatically resize resource columns to always **fit** available width.
   *
   * This is ignored if *any* resources are loaded with {@link Scheduler.model.ResourceModel#field-columnWidth}.
   * @config {Boolean}
   * @default
   */
  fitWidth: false,
  /**
   * Width for each resource column.
   *
   * This is used for resources which are not are loaded with a {@link Scheduler.model.ResourceModel#field-columnWidth}.
   * @config {Number}
   */
  columnWidth: 150,
  // Copied from Scheduler#resourceImagePath on creation in TimeAxisColumn.js
  imagePath: null,
  // Copied from Scheduler#resourceImageExtension on creation in TimeAxisColumn.js
  imageExtension: null,
  // Copied from Scheduler#defaultResourceImageName on creation in TimeAxisColumn.js
  defaultImageName: null,
  availableWidth: null
});
ResourceHeader._$name = "ResourceHeader";

// ../Scheduler/lib/Scheduler/column/TimeAxisColumn.js
var TimeAxisColumn = class extends Events_default(WidgetColumn) {
  constructor() {
    super(...arguments);
    //region Config
    __publicField(this, "headerHoverable", false);
  }
  static get fields() {
    return [
      // Exclude some irrelevant fields from getCurrentConfig()
      { name: "locked", persist: false },
      { name: "flex", persist: false },
      { name: "width", persist: false },
      { name: "cellCls", persist: false },
      { name: "field", persist: false },
      "mode"
    ];
  }
  static get defaults() {
    return {
      /**
       * Set to false to prevent this column header from being dragged.
       * @config {Boolean} draggable
       * @category Interaction
       * @default false
       */
      draggable: false,
      /**
       * Set to false to prevent grouping by this column.
       * @config {Boolean} groupable
       * @category Interaction
       * @default false
       */
      groupable: false,
      /**
       * Allow column visibility to be toggled through UI.
       * @config {Boolean} hideable
       * @default false
       * @category Interaction
       */
      hideable: false,
      /**
       * Show column picker for the column.
       * @config {Boolean} showColumnPicker
       * @default false
       * @category Menu
       */
      showColumnPicker: false,
      /**
       * Allow filtering data in the column (if Filter feature is enabled)
       * @config {Boolean} filterable
       * @default false
       * @category Interaction
       */
      filterable: false,
      /**
       * Allow sorting of data in the column
       * @config {Boolean} sortable
       * @category Interaction
       * @default false
       */
      sortable: false,
      /**
       * Set to `false` to prevent the column from being drag-resized when the ColumnResize plugin is enabled.
       * @config {Boolean} resizable
       * @default false
       * @category Interaction
       */
      resizable: false,
      /**
       * Allow searching in the column (respected by QuickFind and Search features)
       * @config {Boolean} searchable
       * @default false
       * @category Interaction
       */
      searchable: false,
      /**
       * @config {String} editor
       * @hide
       */
      editor: false,
      /**
       * Set to `true` to show a context menu on the cell elements in this column
       * @config {Boolean} enableCellContextMenu
       * @default false
       * @category Menu
       */
      enableCellContextMenu: false,
      /**
       * @config {Function|Boolean} tooltipRenderer
       * @hide
       */
      tooltipRenderer: false,
      /**
       * CSS class added to the header of this column
       * @config {String} cls
       * @category Rendering
       * @default 'b-sch-timeaxiscolumn'
       */
      cls: "b-sch-timeaxiscolumn",
      // needs to have width specified, flex-basis messes measurements up
      needWidth: true,
      mode: null,
      region: "normal",
      exportable: false,
      htmlEncode: false
    };
  }
  static get type() {
    return "timeAxis";
  }
  //region Init
  construct(config) {
    const me = this;
    super.construct(...arguments);
    me.thisObj = me;
    me.grid._timeAxisColumn = me;
    me.timeAxisViewModel = me.grid.timeAxisViewModel;
    me.mode = me.mode;
    me.grid.ion({
      paint: "onTimelinePaint",
      thisObj: me,
      once: true
    });
  }
  static get autoExposeFields() {
    return true;
  }
  // endregion
  doDestroy() {
    var _a, _b;
    (_a = this.resourceColumns) == null ? void 0 : _a.destroy();
    (_b = this.timeAxisView) == null ? void 0 : _b.destroy();
    super.doDestroy();
  }
  set mode(mode) {
    const me = this, { grid } = me;
    me.set("mode", mode);
    if (mode === "horizontal") {
      me.timeAxisView = new HorizontalTimeAxis({
        model: me.timeAxisViewModel,
        compactCellWidthThreshold: me.compactCellWidthThreshold,
        owner: grid,
        client: grid
      });
    } else if (mode === "vertical") {
      me.resourceColumns = ResourceHeader.new({
        column: me,
        scheduler: grid,
        resourceStore: grid.resourceStore,
        imagePath: grid.resourceImagePath,
        imageExtension: grid.resourceImageExtension,
        defaultImageName: grid.defaultResourceImageName
      }, grid.resourceColumns || {});
      me.relayEvents(me.resourceColumns, [
        "resourceheaderclick",
        "resourceheaderdblclick",
        "resourceheadercontextmenu"
      ]);
    }
  }
  get mode() {
    return this.get("mode");
  }
  //region Events
  onViewModelUpdate({ source: viewModel }) {
    const me = this;
    if (me.grid.timeAxisSubGrid.collapsed) {
      return;
    }
    if (me.mode === "horizontal") {
      me.refreshHeader(true);
      me.width = viewModel.totalSize;
      me.grid.refresh();
      me.subGrid.refreshFakeScroll();
    } else if (me.mode === "vertical") {
      me.grid.refreshRows();
    }
  }
  // Called on paint. SubGrid has its width so this is the earliest time to configure the TimeAxisViewModel with
  // correct width
  onTimelinePaint({ firstPaint }) {
    var _a;
    const me = this;
    if (!me.subGrid.insertRowsBefore) {
      return;
    }
    if (firstPaint) {
      me.subGridElement.classList.add("b-timeline-subgrid");
      if (me.mode === "vertical") {
        me.refreshHeader();
        (_a = me.grid) == null ? void 0 : _a.onHeightChange();
      }
    }
  }
  //endregion
  //region Rendering
  /**
   * Refreshes the columns header contents (which is either a HorizontalTimeAxis or a ResourceHeader). Useful if you
   * have rendered some extra meta data that depends on external data such as the EventStore or ResourceStore.
   */
  refreshHeader(internal) {
    const me = this, { element } = me;
    if (element) {
      if (me.mode === "horizontal") {
        !internal && me.timeAxisViewModel.update(void 0, void 0, true);
        if (!me.timeAxisView.rendered) {
          element.innerHTML = "";
          me.timeAxisView.render(element);
        } else {
          me.timeAxisView.refresh(true);
        }
      } else if (me.mode === "vertical") {
        if (!me.resourceColumns.currentElement) {
          element.innerHTML = "";
          me.resourceColumns.render(element);
        } else {
          me.resourceColumns.refresh();
        }
      }
    }
  }
  internalRenderer(renderData) {
    const { grid } = this;
    if (grid.project.isInitialCommitPerformed || grid.project.isDelayingCalculation) {
      grid.currentOrientation.renderer(renderData);
      return super.internalRenderer(renderData);
    }
    return "";
  }
  //endregion
  get timeAxisViewModel() {
    return this._timeAxisViewModel;
  }
  set timeAxisViewModel(timeAxisViewModel) {
    const me = this;
    me.detachListeners("tavm");
    timeAxisViewModel == null ? void 0 : timeAxisViewModel.ion({
      name: "tavm",
      update: "onViewModelUpdate",
      prio: -1e4,
      thisObj: me
    });
    me._timeAxisViewModel = timeAxisViewModel;
    if (me.timeAxisView) {
      me.timeAxisView.model = timeAxisViewModel;
    }
  }
  // Width of the time axis column is solely determined by the zoom level. We should not keep it part of the state
  // otherwise restoring the state might break the normal zooming process.
  // Covered by SchedulerState.t
  // https://github.com/bryntum/support/issues/5545
  getState() {
    const state = super.getState();
    delete state.width;
    delete state.flex;
    return state;
  }
};
__publicField(TimeAxisColumn, "$name", "TimeAxisColumn");
ColumnStore.registerColumnType(TimeAxisColumn);
TimeAxisColumn._$name = "TimeAxisColumn";

// ../Scheduler/lib/Scheduler/view/VerticalTimeAxis.js
var VerticalTimeAxis = class extends TimeAxisBase {
  static get $name() {
    return "VerticalTimeAxis";
  }
  static get configurable() {
    return {
      cls: "b-verticaltimeaxis",
      sizeProperty: "height",
      positionProperty: "top",
      wrapText: true
    };
  }
  // All cells overlayed in the same space.
  // For future use.
  buildHorizontalCells() {
    const me = this, { client } = me, stickyHeaders = client == null ? void 0 : client.stickyHeaders, featureHeaderConfigs = [], cellConfigs = me.levels.reduce((result, level, i) => {
      var _a;
      if (level.cells) {
        result.push(...(_a = level.cells) == null ? void 0 : _a.filter((cell) => cell.start < me.endDate && cell.end > me.startDate).map((cell, j, cells) => ({
          role: "presentation",
          className: {
            "b-sch-header-timeaxis-cell": 1,
            [cell.headerCellCls]: cell.headerCellCls,
            [`b-align-${cell.align}`]: cell.align,
            "b-last": j === cells.length - 1,
            "b-lowest": i === me.levels.length - 1
          },
          dataset: {
            tickIndex: cell.index,
            cellId: `${i}-${cell.index}`,
            headerPosition: i,
            // Used in export tests to resolve dates from tick elements
            ...globalThis.DEBUG && { date: cell.start.getTime() }
          },
          style: {
            // DomHelper appends px to numeric dimensions
            top: cell.coord,
            height: cell.width,
            minHeight: cell.width
          },
          children: [
            {
              role: "presentation",
              className: {
                "b-sch-header-text": 1,
                "b-sticky-header": stickyHeaders
              },
              html: cell.value
            }
          ]
        })));
      }
      return result;
    }, []);
    client == null ? void 0 : client.getHeaderDomConfigs(featureHeaderConfigs);
    cellConfigs.push(...featureHeaderConfigs);
    return {
      className: me.widgetClassList,
      dataset: {
        headerFeature: `headerRow0`,
        headerPosition: 0
      },
      syncOptions: {
        // Keep a maximum of 5 released cells. Might be fine with fewer since ticks are fixed width.
        // Prevents an unnecessary amount of cells from sticking around when switching from narrow to
        // wide tickSizes
        releaseThreshold: 5,
        syncIdField: "cellId"
      },
      children: cellConfigs
    };
  }
  get height() {
    return this.size;
  }
};
VerticalTimeAxis._$name = "VerticalTimeAxis";

// ../Scheduler/lib/Scheduler/column/VerticalTimeAxisColumn.js
var VerticalTimeAxisColumn = class extends Column {
  static get type() {
    return "verticalTimeAxis";
  }
  static get defaults() {
    return {
      /**
       * @hideconfigs autoWidth, autoHeight
       */
      /**
       * Set to false to prevent this column header from being dragged.
       * @config {Boolean} draggable
       * @category Interaction
       * @default false
       * @hide
       */
      draggable: false,
      /**
       * Set to false to prevent grouping by this column.
       * @config {Boolean} groupable
       * @category Interaction
       * @default false
       * @hide
       */
      groupable: false,
      /**
       * Allow column visibility to be toggled through UI.
       * @config {Boolean} hideable
       * @default false
       * @category Interaction
       * @hide
       */
      hideable: false,
      /**
       * Show column picker for the column.
       * @config {Boolean} showColumnPicker
       * @default false
       * @category Menu
       * @hide
       */
      showColumnPicker: false,
      /**
       * Allow filtering data in the column (if Filter feature is enabled)
       * @config {Boolean} filterable
       * @default false
       * @category Interaction
       * @hide
       */
      filterable: false,
      /**
       * Allow sorting of data in the column
       * @config {Boolean} sortable
       * @category Interaction
       * @default false
       * @hide
       */
      sortable: false,
      // /**
      //  * Set to `false` to prevent the column from being drag-resized when the ColumnResize plugin is enabled.
      //  * @config {Boolean} resizable
      //  * @default false
      //  * @category Interaction
      //  * @hide
      //  */
      // resizable : false,
      /**
       * Allow searching in the column (respected by QuickFind and Search features)
       * @config {Boolean} searchable
       * @default false
       * @category Interaction
       * @hide
       */
      searchable: false,
      /**
       * Specifies if this column should be editable, and define which editor to use for editing cells in the column (if CellEdit feature is enabled)
       * @config {String} editor
       * @default false
       * @category Interaction
       * @hide
       */
      editor: false,
      /**
       * Set to `true` to show a context menu on the cell elements in this column
       * @config {Boolean} enableCellContextMenu
       * @default false
       * @category Menu
       * @hide
       */
      enableCellContextMenu: false,
      /**
       * @config {Function|Boolean} tooltipRenderer
       * @hide
       */
      tooltipRenderer: false,
      /**
       * Column minimal width. If value is Number then minimal width is in pixels
       * @config {Number|String} minWidth
       * @default 0
       * @category Layout
       */
      minWidth: 0,
      resizable: false,
      cellCls: "b-verticaltimeaxiscolumn",
      locked: true,
      flex: 1,
      alwaysClearCell: false
    };
  }
  get isFocusable() {
    return false;
  }
  construct(data) {
    super.construct(...arguments);
    this.view = new VerticalTimeAxis({
      model: this.grid.timeAxisViewModel,
      client: this.grid
    });
  }
  renderer({ cellElement, size }) {
    this.view.render(cellElement);
    size.height = this.view.height;
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, removing irrelevant ones
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    delete result.id;
    delete result.region;
    delete result.type;
    delete result.field;
    delete result.ariaLabel;
    delete result.cellAriaLabel;
    return result;
  }
};
__publicField(VerticalTimeAxisColumn, "$name", "VerticalTimeAxisColumn");
ColumnStore.registerColumnType(VerticalTimeAxisColumn);
VerticalTimeAxisColumn._$name = "VerticalTimeAxisColumn";

// ../Scheduler/lib/Scheduler/view/mixin/CurrentConfig.js
var stores = [
  "eventStore",
  "taskStore",
  "assignmentStore",
  "resourceStore",
  "dependencyStore",
  "timeRangeStore",
  "resourceTimeRangeStore"
];
var inlineProperties = [
  "events",
  "tasks",
  "resources",
  "assignments",
  "dependencies",
  "timeRanges",
  "resourceTimeRanges"
];
var CurrentConfig_default = (Target) => class CurrentConfig extends Target {
  static get $name() {
    return "CurrentConfig";
  }
  preProcessCurrentConfigs(configs) {
    for (const prop of inlineProperties) {
      delete configs[prop];
    }
    super.preProcessCurrentConfigs(configs);
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  getCurrentConfig(options) {
    const project = this.project.getCurrentConfig(options), result = super.getCurrentConfig(options);
    if (project) {
      result.project = project;
      const { crudManager } = result;
      if (crudManager) {
        for (const store of stores) {
          if (crudManager[store]) {
            project[store] = crudManager[store];
          }
        }
      }
      if (Object.keys(project).length === 0) {
        delete result.project;
      }
    }
    delete result.data;
    delete result.crudManager;
    return result;
  }
  get widgetClass() {
  }
};

// ../Scheduler/lib/Scheduler/view/SchedulerBase.js
var descriptionFormats = {
  month: "MMMM, YYYY",
  week: ["MMMM YYYY (Wp)", "S{MMM} - E{MMM YYYY} (S{Wp})"],
  day: "MMMM D, YYYY"
};
var SchedulerBase = class extends TimelineBase.mixin(
  CrudManagerView_default,
  Describable_default,
  SchedulerDom_default,
  SchedulerDomEvents_default,
  SchedulerStores_default,
  SchedulerScroll_default,
  SchedulerState_default,
  SchedulerEventRendering_default,
  SchedulerRegions_default,
  EventSelection_default,
  EventNavigation_default,
  CurrentConfig_default,
  TransactionalFeatureMixin_default
) {
  constructor() {
    super(...arguments);
    __publicField(this, "timeCellSelector", ".b-sch-timeaxis-cell");
    __publicField(this, "resourceTimeRangeSelector", ".b-sch-resourcetimerange");
  }
  static get defaultConfig() {
    return {
      /**
       * Scheduler mode. Supported values: horizontal, vertical
       * @config {'horizontal'|'vertical'} mode
       * @default
       * @category Common
       */
      mode: "horizontal",
      /**
       * CSS class to add to rendered events
       * @config {String}
       * @category CSS
       * @private
       * @default
       */
      eventCls: "b-sch-event",
      /**
       * CSS class to add to cells in the timeaxis column
       * @config {String}
       * @category CSS
       * @private
       * @default
       */
      timeCellCls: "b-sch-timeaxis-cell",
      /**
       * A CSS class to apply to each event in the view on mouseover (defaults to 'b-sch-event-hover').
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      overScheduledEventClass: "b-sch-event-hover",
      /**
       * Set to `false` if you don't want to allow events overlapping times for any one resource (defaults to `true`).
       * <div class="note">Note that toggling this at runtime won't affect already overlapping events.</div>
       *
       * @prp {Boolean}
       * @default
       * @category Scheduled events
       */
      allowOverlap: true,
      /**
       * The height in pixels of Scheduler rows.
       * @config {Number}
       * @default
       * @category Common
       */
      rowHeight: 60,
      /**
       * Scheduler overrides Grids default implementation of {@link Grid.view.GridBase#config-getRowHeight} to
       * pre-calculate row heights based on events in the rows.
       *
       * The amount of rows that are pre-calculated is limited for performance reasons. The limit is configurable
       * by specifying the {@link Scheduler.view.SchedulerBase#config-preCalculateHeightLimit} config.
       *
       * The results of the calculation are cached internally.
       *
       * @config {Function} getRowHeight
       * @param {Scheduler.model.ResourceModel} getRowHeight.record Resource record to determine row height for
       * @returns {Number} Desired row height
       * @category Layout
       */
      /**
       * Maximum number of resources for which height is pre-calculated. If you have many events per
       * resource you might want to lower this number to gain some initial rendering performance.
       *
       * Specify a falsy value to opt out of row height pre-calculation.
       *
       * @config {Number}
       * @default
       * @category Layout
       */
      preCalculateHeightLimit: 1e4,
      crudManagerClass: CrudManager,
      testConfig: {
        loadMaskError: {
          autoClose: 10,
          showDelay: 0
        }
      }
    };
  }
  //endregion
  //region Store & model docs
  // Documented here instead of in SchedulerStores since SchedulerPro uses different types
  // Configs
  /**
   * Inline events, will be loaded into an internally created EventStore.
   * @config {Scheduler.model.EventModel[]|Scheduler.model.EventModelConfig[]} events
   * @category Data
   */
  /**
   * The {@link Scheduler.data.EventStore} holding the events to be rendered into the scheduler (required).
   * @config {Scheduler.data.EventStore|Scheduler.data.EventStoreConfig} eventStore
   * @category Data
   */
  /**
   * Inline resources, will be loaded into an internally created ResourceStore.
   * @config {Scheduler.model.ResourceModel[]|Scheduler.model.ResourceModelConfig[]} resources
   * @category Data
   */
  /**
   * The {@link Scheduler.data.ResourceStore} holding the resources to be rendered into the scheduler (required).
   * @config {Scheduler.data.ResourceStore|Scheduler.data.ResourceStoreConfig} resourceStore
   * @category Data
   */
  /**
   * Inline assignments, will be loaded into an internally created AssignmentStore.
   * @config {Scheduler.model.AssignmentModel[]|Object[]} assignments
   * @category Data
   */
  /**
   * The optional {@link Scheduler.data.AssignmentStore}, holding assignments between resources and events.
   * Required for multi assignments.
   * @config {Scheduler.data.AssignmentStore|Scheduler.data.AssignmentStoreConfig} assignmentStore
   * @category Data
   */
  /**
   * Inline dependencies, will be loaded into an internally created DependencyStore.
   * @config {Scheduler.model.DependencyModel[]|Scheduler.model.DependencyModelConfig[]} dependencies
   * @category Data
   */
  /**
   * The optional {@link Scheduler.data.DependencyStore}.
   * @config {Scheduler.data.DependencyStore|Scheduler.model.DependencyStoreConfig} dependencyStore
   * @category Data
   */
  // Properties
  /**
   * Get/set events, applies to the backing project's EventStore.
   * @member {Scheduler.model.EventModel[]} events
   * @accepts {Scheduler.model.EventModel[]|Scheduler.model.EventModelConfig[]}
   * @category Data
   */
  /**
   * Get/set the event store instance of the backing project.
   * @member {Scheduler.data.EventStore} eventStore
   * @category Data
   */
  /**
   * Get/set resources, applies to the backing project's ResourceStore.
   * @member {Scheduler.model.ResourceModel[]} resources
   * @accepts {Scheduler.model.ResourceModel[]|Scheduler.model.ResourceModelConfig[]}
   * @category Data
   */
  /**
   * Get/set the resource store instance of the backing project
   * @member {Scheduler.data.ResourceStore} resourceStore
   * @category Data
   */
  /**
   * Get/set assignments, applies to the backing project's AssignmentStore.
   * @member {Scheduler.model.AssignmentModel[]} assignments
   * @accepts {Scheduler.model.AssignmentModel[]|Object[]}
   * @category Data
   */
  /**
   * Get/set the event store instance of the backing project.
   * @member {Scheduler.data.AssignmentStore} assignmentStore
   * @category Data
   */
  /**
   * Get/set dependencies, applies to the backing projects DependencyStore.
   * @member {Scheduler.model.DependencyModel[]} dependencies
   * @accepts {Scheduler.model.DependencyModel[]|Scheduler.model.DependencyModelConfig[]}
   * @category Data
   */
  /**
   * Get/set the dependencies store instance of the backing project.
   * @member {Scheduler.data.DependencyStore} dependencyStore
   * @category Data
   */
  //endregion
  //region Events
  /**
   * Fired after rendering an event, when its element is available in DOM.
   * @event renderEvent
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord The event record
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment record
   * @param {Object} renderData An object containing details about the event rendering, see
   *   {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventRenderer} for details
   * @param {Boolean} isRepaint `true` if this render is a repaint of the event, updating its existing element
   * @param {Boolean} isReusingElement `true` if this render lead to the event reusing a released events element
   * @param {HTMLElement} element The event bar element
   */
  /**
   * Fired after releasing an event, useful to cleanup of custom content added on `renderEvent` or in `eventRenderer`.
   * @event releaseEvent
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord The event record
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment record
   * @param {Object} renderData An object containing details about the event rendering
   * @param {HTMLElement} element The event bar element
   */
  /**
   * Fired when clicking a resource header cell
   * @event resourceHeaderClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */
  /**
   * Fired when double clicking a resource header cell
   * @event resourceHeaderDblclick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */
  /**
   * Fired when activating context menu on a resource header cell
   * @event resourceHeaderContextmenu
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */
  /**
   * Triggered when a keydown event is observed if there are selected events.
   * @event eventKeyDown
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel[]} eventRecords The selected event records
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords The selected assignment records
   * @param {KeyboardEvent} event Browser event
   */
  /**
   * Triggered when a keyup event is observed if there are selected events.
   * @event eventKeyUp
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel[]} eventRecords The selected event records
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords The selected assignment records
   * @param {KeyboardEvent} event Browser event
   */
  //endregion
  //region Functions injected by features
  // For documentation & typings purposes
  /**
   * Opens an editor UI to edit the passed event.
   *
   * *NOTE: Only available when the {@link Scheduler/feature/EventEdit EventEdit} feature is enabled.*
   *
   * @function editEvent
   * @param {Scheduler.model.EventModel} eventRecord Event to edit
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The Resource record for the event.
   * This parameter is needed if the event is newly created for a resource and has not been assigned, or when using
   * multi assignment.
   * @param {HTMLElement} [element] Element to anchor editor to (defaults to events element)
   * @category Feature shortcuts
   */
  /**
   * Returns the dependency record for a DOM element
   *
   * *NOTE: Only available when the {@link Scheduler/feature/Dependencies Dependencies} feature is enabled.*
   *
   * @function resolveDependencyRecord
   * @param {HTMLElement} element The dependency line element
   * @returns {Scheduler.model.DependencyModel} The dependency record
   * @category Feature shortcuts
   */
  //endregion
  //region Init
  afterConstruct() {
    const me = this;
    super.afterConstruct();
    me.ion({ scroll: "onVerticalScroll", thisObj: me });
    if (me.createEventOnDblClick) {
      me.ion({ scheduledblclick: me.onTimeAxisCellDblClick });
    }
  }
  //endregion
  //region Overrides
  onPaintOverride() {
  }
  //endregion
  //region Config getters/setters
  // Placeholder getter/setter for mixins, please make any changes needed to SchedulerStores#store instead
  get store() {
    return super.store;
  }
  set store(store) {
    super.store = store;
  }
  /**
   * Returns an object defining the range of visible resources
   * @property {Object}
   * @property {Scheduler.model.ResourceModel} visibleResources.first First visible resource
   * @property {Scheduler.model.ResourceModel} visibleResources.last Last visible resource
   * @readonly
   * @category Resources
   */
  get visibleResources() {
    var _a, _b;
    const me = this;
    if (me.isVertical) {
      return me.currentOrientation.visibleResources;
    }
    return {
      first: me.store.getById((_a = me.firstVisibleRow) == null ? void 0 : _a.id),
      last: me.store.getById((_b = me.lastVisibleRow) == null ? void 0 : _b.id)
    };
  }
  //endregion
  //region Event handlers
  onLocaleChange() {
    this.currentOrientation.onLocaleChange();
    super.onLocaleChange();
  }
  onTimeAxisCellDblClick({ date: startDate, resourceRecord, row }) {
    this.createEvent(startDate, resourceRecord, row);
  }
  onVerticalScroll({ scrollTop }) {
    this.currentOrientation.updateFromVerticalScroll(scrollTop);
  }
  /**
   * Called when new event is created.
   * Сan be overridden to supply default record values etc.
   * @param {Scheduler.model.EventModel} eventRecord Newly created event
   * @category Scheduled events
   */
  onEventCreated(eventRecord) {
  }
  //endregion
  //region Mode
  /**
   * Checks if scheduler is in horizontal mode
   * @returns {Boolean}
   * @readonly
   * @category Common
   * @private
   */
  get isHorizontal() {
    return this.mode === "horizontal";
  }
  /**
   * Checks if scheduler is in vertical mode
   * @returns {Boolean}
   * @readonly
   * @category Common
   * @private
   */
  get isVertical() {
    return this.mode === "vertical";
  }
  /**
   * Get mode (horizontal/vertical)
   * @property {'horizontal'|'vertical'}
   * @readonly
   * @category Common
   */
  get mode() {
    return this._mode;
  }
  set mode(mode) {
    const me = this;
    me._mode = mode;
    if (!me[mode]) {
      me.element.classList.add(`b-sch-${mode}`);
      if (mode === "horizontal") {
        me.horizontal = new HorizontalRendering(me);
        if (me.isPainted) {
          me.horizontal.init();
        }
      } else if (mode === "vertical") {
        me.vertical = new VerticalRendering(me);
        if (me.rendered) {
          me.vertical.init();
        }
      }
    }
  }
  get currentOrientation() {
    return this[this.mode];
  }
  //endregion
  //region Dom event dummies
  // this is ugly, but needed since super cannot be called from SchedulerDomEvents mixin...
  onElementKeyDown(event) {
    return super.onElementKeyDown(event);
  }
  onElementKeyUp(event) {
    return super.onElementKeyUp(event);
  }
  onElementMouseOver(event) {
    return super.onElementMouseOver(event);
  }
  onElementMouseOut(event) {
    return super.onElementMouseOut(event);
  }
  //endregion
  //region Feature hooks
  // Called for each event during drop
  processEventDrop() {
  }
  processCrossSchedulerEventDrop() {
  }
  // Called before event drag starts
  beforeEventDragStart() {
  }
  // Called after event drag starts
  afterEventDragStart() {
  }
  // Called after aborting a drag
  afterEventDragAbortFinalized() {
  }
  // Called during event drag validation
  checkEventDragValidity() {
  }
  // Called after event resizing starts
  afterEventResizeStart() {
  }
  // Called after generating a DomConfig for an event
  afterRenderEvent() {
  }
  //endregion
  //region Scheduler specific date mapping functions
  get hasEventEditor() {
    return Boolean(this.eventEditingFeature);
  }
  get eventEditingFeature() {
    const {
      eventEdit,
      taskEdit,
      simpleEventEdit
    } = this.features;
    return (eventEdit == null ? void 0 : eventEdit.enabled) ? eventEdit : (taskEdit == null ? void 0 : taskEdit.enabled) ? taskEdit : (simpleEventEdit == null ? void 0 : simpleEventEdit.enabled) ? simpleEventEdit : null;
  }
  // Method is chained by event editing features. Ensure that the event is in the store.
  editEvent(eventRecord, resourceRecord, element) {
    const me = this, {
      eventStore,
      assignmentStore
    } = me;
    if (!me.hasEventEditor) {
      return false;
    }
    if (eventRecord.eventStore !== eventStore) {
      const { enableEventAnimations } = me, resourceRecords = [];
      eventRecord.isCreating = true;
      let assignmentRecords = [];
      if (resourceRecord) {
        resourceRecords.push(resourceRecord);
        assignmentRecords = assignmentStore.assignEventToResource(eventRecord, resourceRecord);
      }
      if (me.trigger("beforeEventAdd", { eventRecord, resourceRecords, assignmentRecords }) === false) {
        assignmentStore == null ? void 0 : assignmentStore.remove(assignmentRecords);
        return false;
      }
      me.enableEventAnimations = false;
      eventStore.add(eventRecord);
      me.project.commitAsync().then(() => me.enableEventAnimations = enableEventAnimations);
      me.refreshRows();
    }
  }
  /**
   * Creates an event on the specified date (and scrolls it into view), for the specified resource which conforms to
   * this scheduler's {@link #config-createEventOnDblClick} setting.
   *
   * NOTE: If the scheduler is readonly, or resource type is invalid (group header), or if `allowOverlap` is `false`
   * and slot is already occupied - no event is created.
   *
   * This method may be called programmatically by application code if the `createEventOnDblClick` setting
   * is `false`, in which case the default values for `createEventOnDblClick` will be used.
   *
   * If the {@link Scheduler.feature.EventEdit} feature is active, the new event
   * will be displayed in the event editor.
   * @param {Date} date The date to add the event at.
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource to create the event for.
   * @category Scheduled events
   */
  async createEvent(startDate, resourceRecord) {
    var _a, _b;
    const me = this, {
      enableEventAnimations,
      eventStore,
      assignmentStore,
      hasEventEditor
    } = me, resourceRecords = [resourceRecord], useEventModelDefaults = me.createEventOnDblClick.useEventModelDefaults, defaultDuration = useEventModelDefaults ? eventStore.modelClass.defaultValues.duration : 1, defaultDurationUnit = useEventModelDefaults ? eventStore.modelClass.defaultValues.durationUnit : me.timeAxis.unit, eventRecord = eventStore.createRecord({
      startDate,
      endDate: DateHelper.add(startDate, defaultDuration, defaultDurationUnit),
      duration: defaultDuration,
      durationUnit: defaultDurationUnit,
      name: me.L("L{Object.newEvent}")
    });
    if (me.readOnly || resourceRecord.isSpecialRow || resourceRecord.readOnly || !me.allowOverlap && !me.isDateRangeAvailable(
      eventRecord.startDate,
      eventRecord.endDate,
      null,
      resourceRecord
    )) {
      return;
    }
    (_a = me.eventEditingFeature) == null ? void 0 : _a.captureStm(true);
    eventRecord.isCreating = hasEventEditor;
    me.onEventCreated(eventRecord);
    const assignmentRecords = assignmentStore == null ? void 0 : assignmentStore.assignEventToResource(eventRecord, resourceRecord);
    if (me.trigger("beforeEventAdd", { eventRecord, resourceRecords, assignmentRecords }) === false) {
      assignmentStore == null ? void 0 : assignmentStore.remove(assignmentRecords);
      (_b = me.eventEditingFeature) == null ? void 0 : _b.freeStm(false);
      return;
    }
    me.enableEventAnimations = false;
    eventStore.add(eventRecord);
    me.project.commitAsync().then(() => me.enableEventAnimations = enableEventAnimations);
    me.isCreating = true;
    me.refreshRows();
    me.isCreating = false;
    await me.scrollEventIntoView(eventRecord);
    me.trigger("eventAutoCreated", {
      eventRecord,
      resourceRecord
    });
    if (hasEventEditor) {
      me.editEvent(eventRecord, resourceRecord, me.getEventElement(eventRecord));
    }
  }
  /**
   * Checks if a date range is allocated or not for a given resource.
   * @param {Date} start The start date
   * @param {Date} end The end date
   * @param {Scheduler.model.EventModel|null} excludeEvent An event to exclude from the check (or null)
   * @param {Scheduler.model.ResourceModel} resource The resource
   * @returns {Boolean} True if the timespan is available for the resource
   * @category Dates
   */
  isDateRangeAvailable(start, end, excludeEvent, resource) {
    return this.eventStore.isDateRangeAvailable(start, end, excludeEvent, resource);
  }
  //endregion
  /**
   * Suspends UI refresh on store operations.
   *
   * Multiple calls to `suspendRefresh` stack up, and will require an equal number of `resumeRefresh` calls to
   * actually resume UI refresh.
   *
   * @function suspendRefresh
   * @category Rendering
   */
  /**
   * Resumes UI refresh on store operations.
   *
   * Multiple calls to `suspendRefresh` stack up, and will require an equal number of `resumeRefresh` calls to
   * actually resume UI refresh.
   *
   * Specify `true` as the first param to trigger a refresh if this call unblocked the refresh suspension.
   * If the underlying project is calculating changes, the refresh will be postponed until it is done.
   *
   * @param {Boolean} [trigger] `true` to trigger a refresh, if this resume unblocks suspension
   * @privateparam {Boolean} [useTransitions] `false` to block transitions
   * @category Rendering
   */
  async resumeRefresh(trigger = VersionHelper.checkVersion("core", "6.0", ">="), useTransitions = true) {
    super.resumeRefresh(false);
    const me = this;
    if (!me.refreshSuspended && trigger) {
      if (!me.isEngineReady) {
        me.currentOrientation.refreshAllWhenReady = true;
        return me.project.commitAsync();
      }
      if (!me.isDestroyed) {
        if (useTransitions) {
          me.refreshWithTransition();
        } else {
          me.refresh();
        }
      }
    }
  }
  //region Appearance
  // Overrides grid to take crudManager loading into account
  toggleEmptyText() {
    var _a;
    const me = this;
    if (me.bodyContainer) {
      DomHelper.toggleClasses(me.bodyContainer, "b-grid-empty", !(me.resourceStore.count > 0 || ((_a = me.crudManager) == null ? void 0 : _a.isLoading)));
    }
  }
  // Overrides Grids base implementation to return a correctly calculated height for the row. Also stores it in
  // RowManagers height map, which is used to calculate total height etc.
  getRowHeight(resourceRecord) {
    if (this.isHorizontal) {
      const height = this.currentOrientation.calculateRowHeight(resourceRecord);
      this.rowManager.storeKnownHeight(resourceRecord.id, height);
      return height;
    }
  }
  // Calculates the height for specified rows. Call when changes potentially makes its height invalid
  calculateRowHeights(resourceRecords, silent = false) {
    const { store } = this;
    for (const resourceRecord of resourceRecords) {
      if (resourceRecord && store.isAvailable(resourceRecord)) {
        this.getRowHeight(resourceRecord);
      }
    }
    if (!silent) {
      this.rowManager.estimateTotalHeight(true);
    }
  }
  // Calculate heights for all rows (up to the preCalculateHeightLimit)
  calculateAllRowHeights(silent = false) {
    const { store, rowManager } = this, count = Math.min(store.count, this.preCalculateHeightLimit);
    if (count) {
      rowManager.clearKnownHeights();
      for (let i = 0; i < count; i++) {
        this.getRowHeight(store.getAt(i));
      }
      if (!silent) {
        rowManager.estimateTotalHeight(true);
      }
    }
  }
  //endregion
  //region Calendar Mode Interface
  // These are all internal and match up w/CalendarMixin
  /**
   * Returns the date or ranges of included dates as an array. If only the {@link #config-startDate} is significant,
   * the array will have that date as its only element. Otherwise, a range of dates is returned as a two-element
   * array with `[0]` is the {@link #config-startDate} and `[1]` is the {@link #property-lastDate}.
   * @member {Date[]}
   * @internal
   */
  get dateBounds() {
    const me = this, ret = [me.startDate];
    if (me.range === "week") {
      ret.push(me.lastDate);
    }
    return ret;
  }
  get defaultDescriptionFormat() {
    return descriptionFormats[this.range];
  }
  /**
   * The last day that is included in the date range. This is different than {@link #config-endDate} since that date
   * is not inclusive. For example, an `endDate` of 2022-07-21 00:00:00 indicates that the time range ends at that
   * time, and so 2022-07-21 is _not_ in the range. In this example, `lastDate` would be 2022-07-20 since that is the
   * last day included in the range.
   * @member {Date}
   * @internal
   */
  get lastDate() {
    const lastDate = this.endDate;
    return lastDate && DateHelper.add(lastDate, -1, "day");
  }
  getEventRecord(target) {
    target = DomHelper.getEventElement(target);
    return this.resolveEventRecord(target);
  }
  getResourceRecord(domEvent) {
    return this.resolveResourceRecord(domEvent);
  }
  getEventElement(eventRecord) {
    return this.getElementFromEventRecord(eventRecord);
  }
  changeRange(unit) {
    return DateHelper.normalizeUnit(unit);
  }
  updateRange(unit) {
    if (!this.isConfiguring) {
      const currentDate = this.date, newDate = this.date = DateHelper.startOf(currentDate, unit);
      if (currentDate.getTime() === newDate.getTime()) {
        this.updateDate(newDate);
      }
    }
  }
  changeStepUnit(unit) {
    return DateHelper.normalizeUnit(unit);
  }
  updateDate(newDate) {
    const me = this, start = DateHelper.startOf(newDate, me.range);
    me.setTimeSpan(start, DateHelper.add(start, 1, me.range));
    me.visibleDate = {
      date: DateHelper.max(newDate, me.timeAxis.startDate),
      block: "start",
      animate: true
    };
    me.trigger("descriptionChange");
  }
  updateScrollBuffer(value) {
    if (!this.isConfiguring) {
      this.currentOrientation.scrollBuffer = value;
    }
  }
  previous() {
    this.date = DateHelper.add(this.date, -1, this.stepUnit);
  }
  next() {
    this.date = DateHelper.add(this.date, 1, this.stepUnit);
  }
  //endregion
  /**
   * Assigns and schedules an unassigned event record (+ adds it to this Scheduler's event store unless already in it).
   * @param {Object} config The config containing data about the event record to schedule
   * @param {Date} config.startDate The start date
   * @param {Scheduler.model.EventModel|EventModelConfig} config.eventRecord Event (or data for it) to assign and schedule
   * @param {Scheduler.model.EventModel} [config.parentEventRecord] Parent event to add the event to (to nest it),
   * only applies when using the NestedEvents feature
   * @param {Scheduler.model.ResourceModel} config.resourceRecord Resource to assign the event to
   * @param {HTMLElement} [config.element] The element if you are dragging an element from outside the scheduler
   * @category Scheduled events
   */
  async scheduleEvent({ startDate, eventRecord, resourceRecord, element }) {
    const me = this;
    if (!me.eventStore.includes(eventRecord)) {
      [eventRecord] = me.eventStore.add(eventRecord);
    }
    eventRecord.startDate = startDate;
    eventRecord.assign(resourceRecord);
    if (element) {
      const eventRect = Rectangle.from(element, me.foregroundCanvas);
      DomHelper.setTranslateXY(element, 0, 0);
      DomHelper.setTopLeft(element, eventRect.y, eventRect.x);
      DomSync.addChild(me.foregroundCanvas, element, eventRecord.assignments[0].id);
    }
    await me.project.commitAsync();
  }
};
//region Config
__publicField(SchedulerBase, "$name", "SchedulerBase");
// Factoryable type name
__publicField(SchedulerBase, "type", "schedulerbase");
__publicField(SchedulerBase, "configurable", {
  /**
   * Get/set the scheduler's read-only state. When set to `true`, any UIs for modifying data are disabled.
   * @member {Boolean} readOnly
   * @category Misc
   */
  /**
   * Configure as `true` to make the scheduler read-only, by disabling any UIs for modifying data.
   *
   * __Note that checks MUST always also be applied at the server side.__
   * @config {Boolean} readOnly
   * @default false
   * @category Misc
   */
  /**
   * The date to display when used as a component of a Calendar.
   *
   * This is required by the Calendar Mode Interface.
   *
   * @config {Date}
   * @category Calendar integration
   */
  date: {
    value: null,
    $config: {
      equal: "date"
    }
  },
  /**
   * Unit used to control how large steps to take when clicking the previous and next buttons in the Calendar
   * UI. Only applies when used as a component of a Calendar.
   *
   * Suitable units depend on configured {@link #config-range}, a smaller or equal unit is recommended.
   *
   * @config {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
   * @default
   * @category Calendar integration
   */
  stepUnit: "week",
  /**
   * Unit used to set the length of the time axis when used as a component of a Calendar. Suitable units are
   * `'month'`, `'week'` and `'day'`.
   *
   * @config {'day'|'week'|'month'}
   * @category Calendar integration
   * @default
   */
  range: "week",
  /**
   * When the scheduler is used in a Calendar, this function provides the textual description for the
   * Calendar's toolbar.
   *
   * ```javascript
   *  descriptionRenderer : scheduler => {
   *      const
   *          count = scheduler.eventStore.records.filter(
   *              eventRec => DateHelper.intersectSpans(
   *                  scheduler.startDate, scheduler.endDate,
   *                  eventRec.startDate, eventRec.endDate)).length,
   *          startDate = DateHelper.format(scheduler.startDate, 'DD/MM/YYY'),
   *          endData = DateHelper.format(scheduler.endDate, 'DD/MM/YYY');
   *
   *      return `${startDate} - ${endData}, ${count} event${count === 1 ? '' : 's'}`;
   *  }
   * ```
   * @config {Function}
   * @param {Scheduler.view.SchedulerBase} view The active view.
   * @returns {String}
   * @category Calendar integration
   */
  /**
   * A method allowing you to define date boundaries that will constrain resize, create and drag drop
   * operations. The method will be called with the Resource record, and the Event record.
   *
   * ```javascript
   *  new Scheduler({
   *      getDateConstraints(resourceRecord, eventRecord) {
   *          // Assuming you have added these extra fields to your own EventModel subclass
   *          const { minStartDate, maxEndDate } = eventRecord;
   *
   *          return {
   *              start : minStartDate,
   *              end   : maxEndDate
   *          };
   *      }
   *  });
   * ```
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The resource record
   * @param {Scheduler.model.EventModel} [eventRecord] The event record
   * @returns {Object} Constraining object containing `start` and `end` constraints. Omitting either
   * will mean that end is not constrained. So you can prevent a resize or move from moving *before*
   * a certain time while not constraining the end date.
   * @returns {Date} [return.start] Start date
   * @returns {Date} [return.end] End date
   * @config {Function}
   * @category Scheduled events
   */
  getDateConstraints: null,
  /**
   * The time axis column config for vertical {@link Scheduler.view.SchedulerBase#config-mode}.
   *
   * Object with {@link Scheduler.column.VerticalTimeAxisColumn} configuration.
   *
   * This object will be used to configure the vertical time axis column instance.
   *
   * The config allows configuring the `VerticalTimeAxisColumn` instance used in vertical mode with any Column options that apply to it.
   *
   * Example:
   *
   * ```javascript
   * new Scheduler({
   *     mode     : 'vertical',
   *     features : {
   *         filterBar : true
   *     },
   *     verticalTimeAxisColumn : {
   *         text  : 'Filter by event name',
   *         width : 180,
   *         filterable : {
   *             // add a filter field to the vertical column access header
   *             filterField : {
   *                 type        : 'text',
   *                 placeholder : 'Type to search',
   *                 onChange    : ({ value }) => {
   *                     // filter event by name converting to lowerCase to be equal comparison
   *                     scheduler.eventStore.filter({
   *                         filters : event => event.name.toLowerCase().includes(value.toLowerCase()),
   *                         replace : true
   *                     });
   *                 }
   *             }
   *         }
   *     },
   *     ...
   * });
   * ```
   *
   * @config {VerticalTimeAxisColumnConfig}
   * @category Time axis
   */
  verticalTimeAxisColumn: {},
  /**
   * See {@link Scheduler.view.Scheduler#keyboard-shortcuts Keyboard shortcuts} for details
   * @config {Object<String,String>} keyMap
   * @category Common
   */
  /**
   * If true, a new event will be created when user double-clicks on a time axis cell (if scheduler is not in
   * read only mode).
   *
   * The duration / durationUnit of the new event will be 1 time axis tick (default), or it can be read from
   * the {@link Scheduler.model.EventModel#field-duration} and
   * {@link Scheduler.model.EventModel#field-durationUnit} fields.
   *
   * Set to `false` to not create events on double click.
   * @config {Boolean|Object} createEventOnDblClick
   * @param {Boolean} [createEventOnDblClick.useEventModelDefaults] set to `true` to set default duration
   * based on the defaults specified by the {@link Scheduler.model.EventModel#field-duration} and
   * {@link Scheduler.model.EventModel#field-durationUnit} fields.
   * @default
   * @category Scheduled events
   */
  createEventOnDblClick: true,
  /**
       * Number of pixels to horizontally extend the visible render zone by, controlling the events that will be
       * rendered. You can use this to increase or reduce the amount of event rendering happening when scrolling
       * along a horizontal time axis. This can be useful if you render huge amount of events.
       *
       * To force the scheduler to render all events within the TimeAxis start & end dates, set this to -1.
       * The initial render will take slightly longer but no extra event rendering will take place when scrolling.
       *
       * NOTE: This is an experimental API which might change in future releases.
       * @config {Number}
       * @default
       * @internal
       * @category Experimental
       */
  scrollBuffer: 0,
  // A CSS class identifying areas where events can be scheduled using drag-create, double click etc.
  schedulableAreaSelector: ".b-sch-timeaxis-cell",
  scheduledEventName: "event",
  sortFeatureStore: "resourceStore",
  /**
   * If set to `true` this will show a color field in the {@link Scheduler.feature.EventEdit} editor and also a
   * picker in the {@link Scheduler.feature.EventMenu}. Both enables the user to choose a color which will be
   * applied to the event bar's background. See EventModel's
   * {@link Scheduler.model.mixin.EventModelMixin#field-eventColor} config.
   * config.
   * @config {Boolean}
   * @default false
   * @category Misc
   */
  showEventColorPickers: null,
  /**
   * By default, scrolling the schedule will update the {@link #property-timelineContext} to reflect the new
   * currently hovered context. When displaying a large number of events on screen at the same time, this will
   * have a slight impact on scrolling performance. In such scenarios, opt out of this behavior by setting
   * this config to `false`.
   * @default
   * @prp {Boolean}
   * @category Misc
   */
  updateTimelineContextOnScroll: true
});
SchedulerBase.initClass();
SchedulerBase._$name = "SchedulerBase";

// ../Scheduler/lib/Scheduler/widget/EventColorPicker.js
var EventColorPicker = class extends ColorPicker {
  colorSelected({ color }) {
    if (this.record) {
      this.record.eventColor = color;
    }
  }
};
__publicField(EventColorPicker, "$name", "EventColorPicker");
__publicField(EventColorPicker, "type", "eventcolorpicker");
__publicField(EventColorPicker, "configurable", {
  colorClasses: SchedulerBase.eventColors,
  colorClassPrefix: "b-sch-",
  /**
   * @hideconfigs colors
   */
  colors: null,
  /**
   * Provide a {@link Scheduler.model.EventModel} instance to update it's
   * {@link Scheduler.model.mixin.EventModelMixin#field-eventColor} field
   * @config {Scheduler.model.EventModel}
   */
  record: null
});
EventColorPicker.initClass();
EventColorPicker._$name = "EventColorPicker";

// ../Scheduler/lib/Scheduler/tooltip/ClockTemplate.js
var ClockTemplate = class extends Base {
  static get defaultConfig() {
    return {
      minuteHeight: 8,
      minuteTop: 2,
      hourHeight: 8,
      hourTop: 2,
      handLeft: 10,
      div: document.createElement("div"),
      scheduler: null,
      // may be passed to the constructor if needed
      // `b-sch-clock-day` for calendar icon
      // `b-sch-clock-hour` for clock icon
      template(data) {
        return `<div class="b-sch-clockwrap b-sch-clock-${data.mode || this.mode} ${data.cls || ""}">
                    <div class="b-sch-clock">
                        <div class="b-sch-hour-indicator">${DateHelper.format(data.date, "MMM")}</div>
                        <div class="b-sch-minute-indicator">${DateHelper.format(data.date, "D")}</div>
                        <div class="b-sch-clock-dot"></div>
                    </div>
                    <span class="b-sch-clock-text">${StringHelper.encodeHtml(data.text)}</span>
                </div>`;
      }
    };
  }
  generateContent(data) {
    return this.div.innerHTML = this.template(data);
  }
  updateDateIndicator(el, date) {
    const hourIndicatorEl = el == null ? void 0 : el.querySelector(".b-sch-hour-indicator"), minuteIndicatorEl = el == null ? void 0 : el.querySelector(".b-sch-minute-indicator");
    if (date && hourIndicatorEl && minuteIndicatorEl && BrowserHelper.isBrowserEnv) {
      if (this.mode === "hour") {
        hourIndicatorEl.style.transform = `rotate(${date.getHours() % 12 * 30}deg)`;
        minuteIndicatorEl.style.transform = `rotate(${date.getMinutes() * 6}deg)`;
      } else {
        hourIndicatorEl.style.transform = "none";
        minuteIndicatorEl.style.transform = "none";
      }
    }
  }
  set mode(mode) {
    this._mode = mode;
  }
  // `day` mode for calendar icon
  // `hour` mode for clock icon
  get mode() {
    if (this._mode) {
      return this._mode;
    }
    const unitLessThanDay = DateHelper.compareUnits(this.scheduler.timeAxisViewModel.timeResolution.unit, "day") < 0, formatContainsHourInfo = DateHelper.formatContainsHourInfo(this.scheduler.displayDateFormat);
    return unitLessThanDay && formatContainsHourInfo ? "hour" : "day";
  }
  set template(template) {
    this._template = template;
  }
  /**
   * Get the clock template, which accepts an object of format { date, text }
   * @property {Function}
   * @param {*} Format object
   * @returns {String}
   */
  get template() {
    return this._template;
  }
};
ClockTemplate._$name = "ClockTemplate";

// ../Scheduler/lib/Scheduler/feature/mixin/TaskEditStm.js
var TaskEditStm_default = (Target) => class TaskEditStm extends (Target || Base) {
  static get $name() {
    return "TaskEditStm";
  }
  getStmCapture() {
    return {
      stmInitiallyAutoRecord: this.stmInitiallyAutoRecord,
      stmInitiallyDisabled: this.stmInitiallyDisabled,
      // this flag indicates whether the STM capture has been transferred to
      // another feature, which will be responsible for finalizing the STM transaction
      // (otherwise we'll do it ourselves)
      transferred: false
    };
  }
  applyStmCapture(stmCapture) {
    this.stmInitiallyAutoRecord = stmCapture.stmInitiallyAutoRecord;
    this.stmInitiallyDisabled = stmCapture.stmInitiallyDisabled;
  }
  captureStm(startTransaction = false) {
    const me = this, project = me.project, stm = project.getStm();
    if (me.hasStmCapture) {
      return;
    }
    me.hasStmCapture = true;
    me.stmInitiallyDisabled = stm.disabled;
    me.stmInitiallyAutoRecord = stm.autoRecord;
    if (me.stmInitiallyDisabled) {
      stm.enable();
      stm.autoRecord = false;
    } else {
      if (me.stmInitiallyAutoRecord) {
        stm.autoRecord = false;
      }
      if (stm.isRecording) {
        stm.stopTransaction();
      }
    }
    if (startTransaction) {
      this.startStmTransaction();
    }
  }
  startStmTransaction() {
    this.project.getStm().startTransaction();
  }
  commitStmTransaction() {
    const me = this, stm = me.project.getStm();
    if (!me.hasStmCapture) {
      throw new Error("Does not have STM capture, no transaction to commit");
    }
    if (stm.enabled) {
      stm.stopTransaction();
      if (me.stmInitiallyDisabled) {
        stm.resetQueue();
      }
    }
  }
  async rejectStmTransaction() {
    var _a;
    const stm = this.project.getStm(), { client } = this;
    if (!this.hasStmCapture) {
      throw new Error("Does not have STM capture, no transaction to reject");
    }
    if (stm.enabled) {
      if ((_a = stm.transaction) == null ? void 0 : _a.length) {
        client.suspendRefresh();
        stm.rejectTransaction();
        await client.resumeRefresh(true);
      } else {
        stm.stopTransaction();
      }
    }
  }
  enableStm() {
    this.project.getStm().enable();
  }
  disableStm() {
    this.project.getStm().disable();
  }
  async freeStm(commitOrReject = null) {
    const me = this, stm = me.project.getStm(), {
      stmInitiallyDisabled,
      stmInitiallyAutoRecord
    } = me;
    if (!me.hasStmCapture) {
      return;
    }
    let promise;
    me.rejectingStmTransaction = true;
    if (commitOrReject === true) {
      promise = me.commitStmTransaction();
    } else if (commitOrReject === false) {
      promise = me.rejectStmTransaction();
    }
    await promise;
    if (!stm.isDestroying) {
      stm.disabled = stmInitiallyDisabled;
      stm.autoRecord = stmInitiallyAutoRecord;
    }
    if (!me.isDestroying) {
      me.rejectingStmTransaction = true;
      me.hasStmCapture = false;
    }
  }
};

// ../Scheduler/lib/Scheduler/feature/base/TimeSpanMenuBase.js
var TimeSpanMenuBase = class extends ContextMenuBase {
};
TimeSpanMenuBase._$name = "TimeSpanMenuBase";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceFrequencyCombo.js
var RecurrenceFrequencyCombo = class extends Combo {
  buildItems() {
    return [
      ...this.addNone ? [{ text: "L{None}", value: "NONE" }] : [],
      { value: "DAILY", text: "L{Daily}" },
      { value: "WEEKLY", text: "L{Weekly}" },
      { value: "MONTHLY", text: "L{Monthly}" },
      { value: "YEARLY", text: "L{Yearly}" }
    ];
  }
};
__publicField(RecurrenceFrequencyCombo, "$name", "RecurrenceFrequencyCombo");
// Factoryable type name
__publicField(RecurrenceFrequencyCombo, "type", "recurrencefrequencycombo");
__publicField(RecurrenceFrequencyCombo, "configurable", {
  editable: false,
  displayField: "text",
  valueField: "value",
  localizeDisplayFields: true,
  addNone: false
});
RecurrenceFrequencyCombo.initClass();
RecurrenceFrequencyCombo._$name = "RecurrenceFrequencyCombo";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceDaysCombo.js
var RecurrenceDaysCombo = class extends Combo {
  static get $name() {
    return "RecurrenceDaysCombo";
  }
  // Factoryable type name
  static get type() {
    return "recurrencedayscombo";
  }
  static get defaultConfig() {
    const allDaysValueAsArray = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], allDaysValue = allDaysValueAsArray.join(",");
    return {
      allDaysValue,
      editable: false,
      defaultValue: allDaysValue,
      workingDaysValue: allDaysValueAsArray.filter((day, index) => !DateHelper.nonWorkingDays[index]).join(","),
      nonWorkingDaysValue: allDaysValueAsArray.filter((day, index) => DateHelper.nonWorkingDays[index]).join(","),
      splitCls: "b-recurrencedays-split",
      displayField: "text",
      valueField: "value"
    };
  }
  buildItems() {
    const me = this;
    me._weekDays = null;
    return me.weekDays.concat([
      { value: me.allDaysValue, text: me.L("L{day}"), cls: me.splitCls },
      { value: me.workingDaysValue, text: me.L("L{weekday}") },
      { value: me.nonWorkingDaysValue, text: me.L("L{weekend day}") }
    ]);
  }
  get weekDays() {
    const me = this;
    if (!me._weekDays) {
      const weekStartDay = DateHelper.weekStartDay;
      const dayNames = DateHelper.getDayNames().map((text, index) => ({ text, value: RecurrenceDayRuleEncoder.encodeDay(index) }));
      me._weekDays = dayNames.slice(weekStartDay).concat(dayNames.slice(0, weekStartDay));
    }
    return me._weekDays;
  }
  set value(value) {
    const me = this;
    if (value && Array.isArray(value)) {
      value = value.join(",");
    }
    if (!value || !me.store.findRecord("value", value)) {
      value = me.defaultValue;
    }
    super.value = value;
  }
  get value() {
    let value = super.value;
    if (value && Array.isArray(value)) {
      value = value.join(",");
    }
    return value;
  }
};
RecurrenceDaysCombo.initClass();
RecurrenceDaysCombo._$name = "RecurrenceDaysCombo";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceDaysButtonGroup.js
var RecurrenceDaysButtonGroup = class extends ButtonGroup {
  static get $name() {
    return "RecurrenceDaysButtonGroup";
  }
  // Factoryable type name
  static get type() {
    return "recurrencedaysbuttongroup";
  }
  static get defaultConfig() {
    return {
      defaults: {
        cls: "b-raised",
        toggleable: true
      }
    };
  }
  construct(config = {}) {
    const me = this;
    config.columns = 7;
    config.items = me.buildItems();
    super.construct(config);
  }
  updateItemText(item) {
    const day = RecurrenceDayRuleEncoder.decodeDay(item.value)[0];
    item.text = DateHelper.getDayName(day).substring(0, 3);
  }
  buildItems() {
    const me = this;
    if (!me.__items) {
      const weekStartDay = DateHelper.weekStartDay;
      const dayNames = DateHelper.getDayNames().map((text, index) => ({
        text: text.substring(0, 3),
        value: RecurrenceDayRuleEncoder.encodeDay(index)
      }));
      me.__items = dayNames.slice(weekStartDay).concat(dayNames.slice(0, weekStartDay));
    }
    return me.__items;
  }
  set value(value) {
    if (value && Array.isArray(value)) {
      value = value.join(",");
    }
    super.value = value;
  }
  get value() {
    let value = super.value;
    if (value && Array.isArray(value)) {
      value = value.join(",");
    }
    return value;
  }
  onLocaleChange() {
    this.items.forEach(this.updateItemText, this);
  }
  updateLocalization() {
    this.onLocaleChange();
    super.updateLocalization();
  }
  get widgetClassList() {
    const classList = super.widgetClassList;
    classList.push("b-field");
    return classList;
  }
};
RecurrenceDaysButtonGroup.initClass();
RecurrenceDaysButtonGroup._$name = "RecurrenceDaysButtonGroup";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceMonthDaysButtonGroup.js
var RecurrenceMonthDaysButtonGroup = class extends ButtonGroup {
  static get $name() {
    return "RecurrenceMonthDaysButtonGroup";
  }
  // Factoryable type name
  static get type() {
    return "recurrencemonthdaysbuttongroup";
  }
  static get defaultConfig() {
    return {
      defaults: {
        toggleable: true,
        cls: "b-raised"
      }
    };
  }
  get minValue() {
    return 1;
  }
  get maxValue() {
    return 31;
  }
  construct(config = {}) {
    const me = this;
    config.columns = 7;
    config.items = me.buildItems();
    super.construct(config);
  }
  buildItems() {
    const me = this, items = [];
    for (let value = me.minValue; value <= me.maxValue; value++) {
      items.push({
        text: value + "",
        value
      });
    }
    return items;
  }
  get widgetClassList() {
    const classList = super.widgetClassList;
    classList.push("b-field");
    return classList;
  }
};
RecurrenceMonthDaysButtonGroup.initClass();
RecurrenceMonthDaysButtonGroup._$name = "RecurrenceMonthDaysButtonGroup";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceMonthsButtonGroup.js
var RecurrenceMonthsButtonGroup = class extends ButtonGroup {
  static get $name() {
    return "RecurrenceMonthsButtonGroup";
  }
  // Factoryable type name
  static get type() {
    return "recurrencemonthsbuttongroup";
  }
  static get defaultConfig() {
    return {
      defaults: {
        toggleable: true,
        cls: "b-raised"
      }
    };
  }
  construct(config = {}) {
    const me = this;
    config.columns = 4;
    config.items = me.buildItems();
    super.construct(config);
  }
  buildItems() {
    return DateHelper.getMonthNames().map((item, index) => ({
      text: item.substring(0, 3),
      value: index + 1
      // 1-based
    }));
  }
  updateItemText(item) {
    item.text = DateHelper.getMonthName(item.value - 1).substring(0, 3);
  }
  onLocaleChange() {
    this.items.forEach(this.updateItemText, this);
  }
  updateLocalization() {
    this.onLocaleChange();
    super.updateLocalization();
  }
  get widgetClassList() {
    const classList = super.widgetClassList;
    classList.push("b-field");
    return classList;
  }
};
RecurrenceMonthsButtonGroup.initClass();
RecurrenceMonthsButtonGroup._$name = "RecurrenceMonthsButtonGroup";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrenceStopConditionCombo.js
var RecurrenceStopConditionCombo = class extends Combo {
  static get $name() {
    return "RecurrenceStopConditionCombo";
  }
  // Factoryable type name
  static get type() {
    return "recurrencestopconditioncombo";
  }
  static get defaultConfig() {
    return {
      editable: false,
      placeholder: "Never",
      displayField: "text",
      valueField: "value"
    };
  }
  buildItems() {
    return [
      { value: "never", text: this.L("L{Never}") },
      { value: "count", text: this.L("L{After}") },
      { value: "date", text: this.L("L{On date}") }
    ];
  }
  set value(value) {
    value = value || "never";
    super.value = value;
  }
  get value() {
    return super.value;
  }
  get recurrence() {
    return this._recurrence;
  }
  set recurrence(recurrence) {
    let value = null;
    if (recurrence.endDate) {
      value = "date";
    } else if (recurrence.count) {
      value = "count";
    }
    this._recurrence = recurrence;
    this.value = value;
  }
};
RecurrenceStopConditionCombo.initClass();
RecurrenceStopConditionCombo._$name = "RecurrenceStopConditionCombo";

// ../Scheduler/lib/Scheduler/view/recurrence/field/RecurrencePositionsCombo.js
var RecurrencePositionsCombo = class extends Combo {
  static get $name() {
    return "RecurrencePositionsCombo";
  }
  // Factoryable type name
  static get type() {
    return "recurrencepositionscombo";
  }
  static get defaultConfig() {
    return {
      editable: false,
      splitCls: "b-sch-recurrencepositions-split",
      displayField: "text",
      valueField: "value",
      defaultValue: 1,
      maxPosition: 5
    };
  }
  buildItems() {
    return this.buildDayNumbers().concat([
      { value: "-1", text: this.L("L{position-1}"), cls: this.splitCls }
    ]);
  }
  buildDayNumbers() {
    return ArrayHelper.populate(this.maxPosition, (i) => ({ value: i + 1, text: this.L(`position${i + 1}`) }));
  }
  set value(value) {
    const me = this;
    if (value && Array.isArray(value)) {
      value = value.join(",");
    }
    if (!value || !me.store.findRecord("value", value)) {
      value = me.defaultValue;
    }
    super.value = value;
  }
  get value() {
    const value = super.value;
    return value ? `${value}`.split(",").map((item) => parseInt(item, 10)) : [];
  }
};
RecurrencePositionsCombo.initClass();
RecurrencePositionsCombo._$name = "RecurrencePositionsCombo";

// ../Scheduler/lib/Scheduler/view/recurrence/RecurrenceEditorPanel.js
var RecurrenceEditorPanel = class extends Panel {
  setupWidgetConfig(widgetConfig) {
    if (BrowserHelper.isMobile && !("editable" in widgetConfig)) {
      widgetConfig.editable = false;
    }
    return super.setupWidgetConfig(...arguments);
  }
  updateRecord(record) {
    super.updateRecord(record);
    const me = this, {
      frequencyField,
      daysButtonField,
      monthDaysButtonField,
      monthsButtonField,
      monthDaysRadioField,
      positionAndDayRadioField,
      stopRecurrenceField
    } = me.widgetMap;
    if (record) {
      const event = record.timeSpan, startDate = event == null ? void 0 : event.startDate;
      if (startDate) {
        if (!record.days || !record.days.length) {
          daysButtonField.value = [RecurrenceDayRuleEncoder.encodeDay(startDate.getDay())];
        }
        if (!record.monthDays || !record.monthDays.length) {
          monthDaysButtonField.value = startDate.getDate();
        }
        if (!record.months || !record.months.length) {
          monthsButtonField.value = startDate.getMonth() + 1;
        }
      }
      if (record.days && record.positions) {
        positionAndDayRadioField.check();
        if (!me.isPainted) {
          monthDaysRadioField.uncheck();
        }
      } else {
        monthDaysRadioField.check();
        if (!me.isPainted) {
          positionAndDayRadioField.uncheck();
        }
      }
      stopRecurrenceField.recurrence = record;
    } else {
      frequencyField.value = "NONE";
    }
  }
  /**
   * Updates the provided recurrence model with the contained form data.
   * If recurrence model is not provided updates the last loaded recurrence model.
   * @internal
   */
  syncEventRecord(recurrence) {
    const values = this.getValues((w) => w.name in recurrence && !w.disabled);
    if (!("endDate" in values)) {
      values.endDate = null;
    }
    if (!("count" in values)) {
      values.count = null;
    }
    recurrence.set(values);
  }
  toggleStopFields() {
    const me = this, { countField, endDateField } = me.widgetMap;
    switch (me.widgetMap.stopRecurrenceField.value) {
      case "count":
        countField.show();
        countField.enable();
        endDateField.hide();
        endDateField.disable();
        break;
      case "date":
        countField.hide();
        countField.disable();
        endDateField.show();
        endDateField.enable();
        break;
      default:
        countField.hide();
        endDateField.hide();
        countField.disable();
        endDateField.disable();
    }
  }
  onMonthDaysRadioFieldChange({ checked }) {
    const { monthDaysButtonField } = this.widgetMap;
    monthDaysButtonField.disabled = !checked || !this.isWidgetAvailableForFrequency(monthDaysButtonField);
  }
  onPositionAndDayRadioFieldChange({ checked }) {
    const { daysCombo, positionsCombo } = this.widgetMap;
    daysCombo.disabled = positionsCombo.disabled = !checked || !this.isWidgetAvailableForFrequency(daysCombo);
  }
  onStopRecurrenceFieldChange() {
    this.toggleStopFields();
  }
  isWidgetAvailableForFrequency(widget, frequency = this.widgetMap.frequencyField.value) {
    return !widget.forFrequency || widget.forFrequency.includes(frequency);
  }
  onFrequencyFieldChange({ value, oldValue, valid }) {
    const me = this, items = me.queryAll((w) => "forFrequency" in w), {
      intervalField,
      stopRecurrenceField
    } = me.widgetMap;
    if (valid && value) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (me.isWidgetAvailableForFrequency(item, value)) {
          item.show();
          item.enable();
        } else {
          item.hide();
          item.disable();
        }
      }
      intervalField.hidden = stopRecurrenceField.hidden = value === "NONE";
      if (value !== "NONE") {
        intervalField.hint = me.L(`L{RecurrenceEditor.${value}intervalUnit}`);
      }
      if (oldValue === "NONE" && intervalField.value == null) {
        intervalField.value = 1;
      }
      me.toggleFieldsState();
    }
  }
  toggleFieldsState() {
    const me = this, { widgetMap } = me;
    me.onMonthDaysRadioFieldChange({ checked: widgetMap.monthDaysRadioField.checked });
    me.onPositionAndDayRadioFieldChange({ checked: widgetMap.positionAndDayRadioField.checked });
    me.onStopRecurrenceFieldChange();
  }
  updateLocalization() {
    const { countField, intervalField, frequencyField } = this.widgetMap;
    countField.hint = this.L("L{RecurrenceEditor.time(s)}");
    if (frequencyField.value && frequencyField.value !== "NONE") {
      intervalField.hint = this.L(`L{RecurrenceEditor.${frequencyField.value}intervalUnit}`);
    }
    super.updateLocalization();
  }
};
__publicField(RecurrenceEditorPanel, "$name", "RecurrenceEditorPanel");
__publicField(RecurrenceEditorPanel, "type", "recurrenceeditorpanel");
__publicField(RecurrenceEditorPanel, "configurable", {
  cls: "b-recurrenceeditor",
  record: false,
  addNone: false,
  items: {
    frequencyField: {
      type: "recurrencefrequencycombo",
      name: "frequency",
      label: "L{RecurrenceEditor.Frequency}",
      weight: 10,
      onChange: "up.onFrequencyFieldChange",
      addNone: "up.addNone"
    },
    intervalField: {
      type: "numberfield",
      weight: 15,
      name: "interval",
      label: "L{RecurrenceEditor.Every}",
      min: 1,
      required: true
    },
    daysButtonField: {
      type: "recurrencedaysbuttongroup",
      weight: 20,
      name: "days",
      forFrequency: "WEEKLY"
    },
    // the radio button enabling "monthDaysButtonField" in MONTHLY mode
    monthDaysRadioField: {
      type: "checkbox",
      weight: 30,
      toggleGroup: "radio",
      forFrequency: "MONTHLY",
      label: "L{RecurrenceEditor.Each}",
      checked: true,
      onChange: "up.onMonthDaysRadioFieldChange"
    },
    monthDaysButtonField: {
      type: "recurrencemonthdaysbuttongroup",
      weight: 40,
      name: "monthDays",
      forFrequency: "MONTHLY"
    },
    monthsButtonField: {
      type: "recurrencemonthsbuttongroup",
      weight: 50,
      name: "months",
      forFrequency: "YEARLY"
    },
    // the radio button enabling positions & days combos in MONTHLY & YEARLY modes
    positionAndDayRadioField: {
      type: "checkbox",
      weight: 60,
      toggleGroup: "radio",
      forFrequency: "MONTHLY|YEARLY",
      label: "L{RecurrenceEditor.On the}",
      onChange: "up.onPositionAndDayRadioFieldChange"
    },
    positionsCombo: {
      type: "recurrencepositionscombo",
      weight: 80,
      name: "positions",
      forFrequency: "MONTHLY|YEARLY"
    },
    daysCombo: {
      type: "recurrencedayscombo",
      weight: 90,
      name: "days",
      forFrequency: "MONTHLY|YEARLY",
      flex: 1
    },
    stopRecurrenceField: {
      type: "recurrencestopconditioncombo",
      weight: 100,
      label: "L{RecurrenceEditor.End repeat}",
      onChange: "up.onStopRecurrenceFieldChange"
    },
    countField: {
      type: "numberfield",
      weight: 110,
      name: "count",
      min: 2,
      required: true,
      disabled: true,
      label: " "
    },
    endDateField: {
      type: "datefield",
      weight: 120,
      name: "endDate",
      hidden: true,
      disabled: true,
      label: " ",
      required: true
    }
  }
});
RecurrenceEditorPanel.initClass();
RecurrenceEditorPanel._$name = "RecurrenceEditorPanel";

// ../Scheduler/lib/Scheduler/widget/EventColorField.js
var EventColorField = class extends ColorField {
};
__publicField(EventColorField, "$name", "EventColorField");
__publicField(EventColorField, "type", "eventcolorfield");
__publicField(EventColorField, "configurable", {
  picker: {
    type: "eventcolorpicker"
  },
  name: "eventColor"
});
EventColorField.initClass();
EventColorField._$name = "EventColorField";

// ../Scheduler/lib/Scheduler/feature/EventMenu.js
var EventMenu = class extends TimeSpanMenuBase {
  //region Config
  static get $name() {
    return "EventMenu";
  }
  /**
   * @member {Object} menuContext
   * An informational object containing contextual information about the last activation
   * of the context menu. The base properties are listed below.
   * @property {Event} menuContext.domEvent The initiating event.
   * @property {Event} menuContext.event DEPRECATED: The initiating event.
   * @property {Number[]} menuContext.point The client `X` and `Y` position of the initiating event.
   * @property {HTMLElement} menuContext.targetElement The target to which the menu is being applied.
   * @property {Object<String,MenuItemConfig>} menuContext.items The context menu **configuration** items.
   * @property {Core.data.Model[]} menuContext.selection The record selection in the client (Grid, Scheduler, Gantt or Calendar).
   * @property {Scheduler.model.EventModel} menuContext.eventRecord The event record clicked on.
   * @property {Scheduler.model.ResourceModel} menuContext.resourceRecord The resource record clicked on.
   * @property {Scheduler.model.AssignmentModel} menuContext.assignmentRecord The assignment record clicked on.
   * @readonly
   */
  static get configurable() {
    return {
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features         : {
       *    eventMenu : {
       *         processItems({ items, eventRecord, assignmentRecord, resourceRecord }) {
       *             // Add or hide existing items here as needed
       *             items.myAction = {
       *                 text   : 'Cool action',
       *                 icon   : 'b-fa b-fa-fw b-fa-ban',
       *                 onItem : () => console.log(`Clicked ${eventRecord.name}`),
       *                 weight : 1000 // Move to end
       *             };
       *
       *            if (!eventRecord.allowDelete) {
       *                 items.deleteEvent.hidden = true;
       *             }
       *         }
       *     }
       * },
       * ```
       *
       * @config {Function}
       * @param {Object} context An object with information about the menu being shown
       * @param {Scheduler.model.EventModel} context.eventRecord The record representing the current event
       * @param {Scheduler.model.ResourceModel} context.resourceRecord The record representing the current resource
       * @param {Scheduler.model.AssignmentModel} context.assignmentRecord The assignment record
       * @param {Object<String,MenuItemConfig|Boolean>} context.items An object containing the
       *   {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
       * @preventable
       */
      processItems: null,
      type: "event"
      /**
       * This is a preconfigured set of items used to create the default context menu. The default options are
       * listed at the top of the page.
       *
       * To remove existing items, set corresponding keys `null`:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventMenu : {
       *             items : {
       *                 deleteEvent   : null,
       *                 unassignEvent : null
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
    };
  }
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateEventMenu");
    return config;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning Scheduler before the context menu is shown for an event. Allows manipulation of the items
   * to show in the same way as in `processItems`. Returning `false` from a listener prevents the menu from
   * being shown.
   * @event eventMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   * @param {MouseEvent} [event] Pointer event which triggered the context menu (if any)
   */
  /**
   * This event fires on the owning Scheduler when an item is selected in the context menu.
   * @event eventMenuItem
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.MenuItem} item
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */
  /**
   * This event fires on the owning Scheduler after showing the context menu for an event
   * @event eventMenuShow
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.Menu} menu The menu
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */
  //endregion
  get resourceStore() {
    return this.client.isHorizontal ? this.client.store : this.client.resourceStore;
  }
  getDataFromEvent(event) {
    var _a;
    const data = super.getDataFromEvent(event), eventElement = data.targetElement, { client } = this, eventRecord = client.resolveEventRecord(eventElement), resourceRecord = eventRecord && ((_a = client.resolveResourceRecord(eventElement) || this.resourceStore.last) == null ? void 0 : _a.$original), assignmentRecord = eventRecord && client.resolveAssignmentRecord(eventElement);
    return Object.assign(data, {
      date: client.getDateFromXY([event.pageX, event.pageY], null, false),
      eventElement,
      eventRecord,
      resourceRecord,
      assignmentRecord
    });
  }
  getTargetElementFromEvent({ target }) {
    return target.closest(this.client.eventSelector) || target;
  }
  shouldShowMenu(eventParams) {
    return eventParams.eventRecord;
  }
  /**
   * Shows context menu for the provided event. If record is not rendered (outside of time span/filtered)
   * menu won't appear.
   * @param {Scheduler.model.EventModel} eventRecord Event record to show menu for.
   * @param {Object} [options]
   * @param {HTMLElement} options.targetElement Element to align context menu to.
   * @param {MouseEvent} options.event Browser event.
   * If provided menu will be aligned according to clientX/clientY coordinates.
   * If omitted, context menu will be centered to event element.
   */
  showContextMenuFor(eventRecord, { targetElement, event } = {}) {
    if (this.disabled) {
      return;
    }
    if (!targetElement) {
      targetElement = this.getElementFromRecord(eventRecord);
      if (!targetElement) {
        return;
      }
    }
    DomHelper.triggerMouseEvent(targetElement, this.triggerEvent);
  }
  getElementFromRecord(record) {
    return this.client.getElementsFromEventRecord(record)[0];
  }
  populateEventMenu({ items, eventRecord, assignmentRecord }) {
    const { client } = this;
    items.deleteEvent = {
      disabled: eventRecord.readOnly || (assignmentRecord == null ? void 0 : assignmentRecord.readOnly),
      hidden: client.readOnly
    };
    items.unassignEvent = {
      disabled: eventRecord.readOnly || (assignmentRecord == null ? void 0 : assignmentRecord.readOnly),
      hidden: client.readOnly || client.eventStore.usesSingleAssignment
    };
    if (client.showEventColorPickers || client.showTaskColorPickers) {
      items.eventColor = {
        disabled: eventRecord.readOnly,
        hidden: client.readOnly
      };
    } else {
      items.eventColor = {
        hidden: true
      };
    }
  }
  populateItemsWithData({ items, eventRecord }) {
    var _a;
    super.populateItemsWithData(...arguments);
    const { client } = this;
    if ((client.showEventColorPickers || client.isSchedulerPro && client.showTaskColorPickers) && ((_a = items.eventColor) == null ? void 0 : _a.menu)) {
      Objects.merge(items.eventColor.menu.colorMenu, {
        value: eventRecord.eventColor,
        record: eventRecord
      });
    }
  }
  // This generates the fixed, unchanging part of the items and is only called once
  // to generate the baseItems of the feature.
  // The dynamic parts which are set by populateEventMenu have this merged into them.
  changeItems(items) {
    const { client } = this;
    return Objects.merge({
      deleteEvent: {
        text: "L{SchedulerBase.Delete event}",
        icon: "b-icon b-icon-trash",
        weight: 200,
        onItem({ menu, eventRecord }) {
          var _a;
          const revertTarget = (_a = menu.focusInEvent) == null ? void 0 : _a.relatedTarget;
          if (revertTarget) {
            revertTarget.focus();
            client.navigator.activeItem = revertTarget;
          }
          client.removeEvents(client.isEventSelected(eventRecord) ? client.selectedEvents : [eventRecord]);
        }
      },
      unassignEvent: {
        text: "L{SchedulerBase.Unassign event}",
        icon: "b-icon b-icon-unassign",
        weight: 300,
        onItem({ menu, eventRecord, resourceRecord }) {
          var _a;
          const revertTarget = (_a = menu.focusInEvent) == null ? void 0 : _a.relatedTarget;
          if (revertTarget) {
            revertTarget.focus();
            client.navigator.activeItem = revertTarget;
          }
          if (client.isEventSelected(eventRecord)) {
            client.assignmentStore.remove(client.selectedAssignments);
          } else {
            eventRecord.unassign(resourceRecord);
          }
        }
      },
      eventColor: {
        text: "L{SchedulerBase.color}",
        icon: "b-icon b-icon-palette",
        separator: true,
        menu: {
          colorMenu: {
            type: "eventcolorpicker"
          }
        }
      }
    }, items);
  }
};
EventMenu.featureClass = "";
EventMenu._$name = "EventMenu";
GridFeatureManager.registerFeature(EventMenu, true, "Scheduler");
GridFeatureManager.registerFeature(EventMenu, false, "ResourceHistogram");

// ../Scheduler/lib/Scheduler/feature/ScheduleMenu.js
var ScheduleMenu = class extends TimeSpanMenuBase {
  //region Config
  static get $name() {
    return "ScheduleMenu";
  }
  static get defaultConfig() {
    return {
      type: "schedule",
      /**
       * This is a preconfigured set of items used to create the default context menu.
       *
       * The `items` provided by this feature are listed below. These are the predefined property names which you may
       * configure:
       *
       * - `addEvent` Add an event for at the resource and time indicated by the `contextmenu` event.
       *
       * To remove existing items, set corresponding keys `null`:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         scheduleMenu : {
       *             items : {
       *                 addEvent : null
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>} items
       */
      items: null,
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features         : {
       *    scheduleMenu : {
       *         processItems({ items, date, resourceRecord }) {
       *            // Add or hide existing items here as needed
       *            items.myAction = {
       *                text   : 'Cool action',
       *                icon   : 'b-fa b-fa-cat',
       *                onItem : () => console.log(`Clicked on ${resourceRecord.name} at ${date}`),
       *                weight : 1000 // Move to end
       *            };
       *
       *            if (!resourceRecord.allowAdd) {
       *                items.addEvent.hidden = true;
       *            }
       *        }
       *    }
       * },
       * ```
       *
       * @config {Function}
       * @param {Object} context An object with information about the menu being shown
       * @param {Scheduler.model.ResourceModel} context.resourceRecord The record representing the current resource
       * @param {Date} context.date The clicked date
       * @param {Object<String,MenuItemConfig|Boolean>} context.items An object containing the
       *   {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
       * @preventable
       */
      processItems: null
    };
  }
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateScheduleMenu");
    return config;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning Scheduler or Gantt widget before the context menu is shown for the schedule. Allows manipulation of the items
   * to show in the same way as in `processItems`. Returning `false` from a listener prevents the menu from
   * being shown.
   * @event scheduleMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Date} date Clicked date, rounded according to viewPreset's settings
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */
  /**
   * This event fires on the owning Scheduler or Gantt widget when an item is selected in the context menu.
   * @event scheduleMenuItem
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.MenuItem} item
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Date} date Clicked date, rounded according to viewPreset's settings
   * @param {HTMLElement} element
   */
  /**
   * This event fires on the owning Scheduler or Gantt widget after showing the context menu for the schedule.
   * @event scheduleMenuShow
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Core.widget.Menu} menu The menu
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Date} date Clicked date, rounded according to viewPreset's settings
   * @param {HTMLElement} targetElement
   */
  //endregion
  shouldShowMenu(eventParams) {
    const { client } = this, {
      targetElement,
      resourceRecord
    } = eventParams, isTimeAxisColumn = client.timeAxisSubGridElement.contains(targetElement);
    return !targetElement.closest(client.eventSelector) && isTimeAxisColumn && !(resourceRecord && resourceRecord.isSpecialRow);
  }
  getDataFromEvent(event) {
    var _a, _b;
    if (DomHelper.isDOMEvent(event)) {
      const { client } = this, cellData = (_a = client.getCellDataFromEvent) == null ? void 0 : _a.call(client, event), date = (_b = client.getDateFromDomEvent) == null ? void 0 : _b.call(client, event, "floor"), resourceRecord = client.resolveResourceRecord(event) || client.isVertical && client.resourceStore.last;
      return ObjectHelper.assign(super.getDataFromEvent(event), cellData, { date, resourceRecord });
    }
    return event;
  }
  populateScheduleMenu({ items, resourceRecord, date }) {
    const { client } = this;
    if (!client.readOnly && client.eventStore) {
      items.addEvent = {
        text: "L{SchedulerBase.Add event}",
        icon: "b-icon b-icon-add",
        disabled: !resourceRecord || resourceRecord.readOnly || !resourceRecord.isWorkingTime(date),
        weight: 100,
        onItem() {
          client.createEvent(date, resourceRecord, client.getRowFor(resourceRecord));
        }
      };
    }
  }
};
ScheduleMenu.featureClass = "";
ScheduleMenu._$name = "ScheduleMenu";
GridFeatureManager.registerFeature(ScheduleMenu, true, "Scheduler");

export {
  ViewPreset,
  PresetStore,
  pm,
  TimeAxis,
  TimeAxisViewModel,
  TimelineDateMapper_default,
  TimelineDomEvents_default,
  TimelineViewPresets_default,
  TimelineZoomable_default,
  RecurrenceConfirmationPopup,
  RecurringEvents_default,
  TimelineEventRendering_default,
  TimelineScroll_default,
  TimelineState_default,
  TimeAxisSubGrid,
  TimelineBase,
  CurrentConfig_default,
  Describable_default,
  SchedulerDom_default,
  SchedulerDomEvents_default,
  HorizontalLayoutStack,
  PackMixin_default,
  HorizontalLayoutPack,
  SchedulerResourceRendering_default,
  SchedulerEventRendering_default,
  ProjectConsumer_default,
  SchedulerStores_default,
  SchedulerScroll_default,
  SchedulerRegions_default,
  SchedulerState_default,
  EventSelection_default,
  EventNavigation_default,
  TransactionalFeatureMixin_default,
  AttachToProjectMixin_default,
  HorizontalRendering,
  VerticalRendering,
  HorizontalTimeAxis,
  ResourceHeader,
  TimeAxisColumn,
  VerticalTimeAxisColumn,
  SchedulerBase,
  EventColorPicker,
  ClockTemplate,
  TaskEditStm_default,
  TimeSpanMenuBase,
  RecurrenceFrequencyCombo,
  RecurrenceDaysCombo,
  RecurrenceDaysButtonGroup,
  RecurrenceMonthDaysButtonGroup,
  RecurrenceMonthsButtonGroup,
  RecurrenceStopConditionCombo,
  RecurrencePositionsCombo,
  RecurrenceEditorPanel,
  EventColorField,
  EventMenu,
  ScheduleMenu
};
//# sourceMappingURL=chunk-MS4QMERY.js.map
