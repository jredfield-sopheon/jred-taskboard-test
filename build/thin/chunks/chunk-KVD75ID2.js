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
  StateTrackingManager
} from "./chunk-4LHHPUQ6.js";
import {
  GridRowModel
} from "./chunk-4NB7OJYA.js";
import {
  AjaxHelper,
  AjaxStore,
  ArrayHelper,
  Base,
  BrowserHelper,
  DateHelper,
  DayTime,
  Delayable_default,
  DomClassList,
  Duration,
  Events_default,
  FunctionHelper,
  InstancePlugin,
  LoadMaskable_default,
  Mask,
  Model,
  ObjectHelper,
  Objects,
  Store,
  StringHelper,
  TimeZoneHelper,
  VersionHelper,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Scheduler/lib/Scheduler/model/mixin/TimeZonedDatesMixin.js
var dateFieldsToConvert = {
  startDate: 1,
  endDate: 1,
  constraintDate: 1,
  deadlineDate: 1
};
var TimeZonedDatesMixin_default = (Target) => {
  var _a;
  return _a = class extends Target {
    get timeZone() {
      return this.getData("timeZone");
    }
    set timeZone(timeZone) {
      this.setData("timeZone", timeZone);
    }
    setLocalDate(field, date) {
      const me = this;
      me.set(field, me.timeZone != null ? TimeZoneHelper.toTimeZone(date, me.timeZone) : date, true);
      me.setData(field, me[field]);
    }
    getLocalDate(field) {
      if (this.timeZone != null && this[field]) {
        return TimeZoneHelper.fromTimeZone(this[field], this.timeZone);
      }
      return this[field];
    }
    applyChangeset(rawChanges) {
      if (this.timeZone != null) {
        for (const field in dateFieldsToConvert) {
          if (rawChanges[field]) {
            this.setLocalDate(field, new Date(rawChanges[field]));
            delete rawChanges[field];
          }
        }
      }
      return super.applyChangeset(...arguments);
    }
    getFieldPersistentValue(field) {
      var _a2, _b;
      if (this.timeZone != null) {
        const fieldName = (_b = (_a2 = field == null ? void 0 : field.field) != null ? _a2 : field == null ? void 0 : field.name) != null ? _b : field;
        if (dateFieldsToConvert[fieldName]) {
          return this.getLocalDate(fieldName);
        }
      }
      return super.getFieldPersistentValue(field);
    }
    // Converts current record into a timeZone
    convertToTimeZone(timeZone) {
      const me = this, metaModified = { ...me.meta.modified }, convertFields = { ...dateFieldsToConvert };
      if (me.isTask && !me.manuallyScheduled) {
        delete convertFields.startDate;
        delete convertFields.endDate;
      }
      for (const field in convertFields) {
        if (me[field] != null) {
          convertFields[field] = me[field];
          if (me.timeZone != null) {
            convertFields[field] = me.getLocalDate(field);
            if (metaModified[field]) {
              metaModified[field] = TimeZoneHelper.fromTimeZone(metaModified[field], me.timeZone);
            }
          }
        } else {
          delete convertFields[field];
        }
      }
      me.timeZone = timeZone;
      for (const field in convertFields) {
        me.setLocalDate(field, convertFields[field], false);
        convertFields[field] = 1;
        if (me.timeZone != null && metaModified[field]) {
          metaModified[field] = TimeZoneHelper.toTimeZone(metaModified[field], me.timeZone);
        }
      }
      me.clearChanges(true, true, convertFields);
      if (!ObjectHelper.isEmpty(metaModified)) {
        me.meta.modified = metaModified;
        me.stores.forEach((store) => store.modified.add(me));
      }
    }
  }, __publicField(_a, "$name", "TimeZonedDatesMixin"), __publicField(_a, "fields", [
    /**
     * The current timeZone this record is converted to. Used internally to keep track of time zone conversions.
     *
     * Can also be used to create a new record with dates in a specific non-local timezone. That is useful for
     * example when replacing a store dataset. That would be interpreted as a new load, and all dates would be
     * converted to the configured timezone.
     *
     * If specifically set to `null` when adding a new record to a Store, the new record's dates will be converted
     * to the Project's configured timezone.
     *
     * For more information about timezone conversion, se {@link Scheduler.model.ProjectModel#config-timeZone}.
     *
     * This field will not {@link Core.data.field.DataField#config-persist} by default.
     *
     * @field {String|Number|null} timeZone
     * @category Advanced
     */
    {
      name: "timeZone",
      persist: false
    }
  ]), _a;
};

// ../Scheduler/lib/Scheduler/model/TimeSpan.js
var TimeSpan = class extends Model.mixin(TimeZonedDatesMixin_default) {
  //endregion
  //region Init
  construct(data, ...args) {
    const me = this;
    if (data == null ? void 0 : data.fullDuration) {
      const { magnitude, unit } = data.fullDuration;
      data.duration = magnitude;
      data.unit = unit;
      delete data.fullDuration;
    }
    super.construct(data, ...args);
    me.normalize();
    if (me.startDateMS && me.endDateMS && me.startDateMS > me.endDateMS) {
      console.error(`startDate > endDate for ${me.constructor.$name} record with id: ${me.id}`);
    }
  }
  //endregion
  //region Date normalization
  internalCalculateStartDate(endDate, duration, durationUnit) {
    return DateHelper.add(endDate, -duration, durationUnit);
  }
  internalCalculateEndDate(startDate, duration, durationUnit) {
    return DateHelper.add(startDate, duration, durationUnit);
  }
  internalCalculateDuration(startDate, endDate, durationUnit) {
    return DateHelper.as(durationUnit, DateHelper.diff(startDate, endDate, "h"), "h");
  }
  // Separate fn to allow calling later with specific values (used by Baseline)
  internalNormalize(startDate, endDate, duration, durationUnit) {
    const me = this, hasDuration = duration != null;
    if (startDate && endDate && !hasDuration) {
      me.setData("duration", me.internalCalculateDuration(startDate, endDate, durationUnit));
    } else if (startDate && !endDate && hasDuration) {
      me.setData("endDate", me.internalCalculateEndDate(startDate, duration, durationUnit));
    } else if (!startDate && endDate && hasDuration) {
      me.setData("startDate", me.internalCalculateStartDate(endDate, duration, durationUnit));
    }
  }
  normalize() {
    this.internalNormalize(
      this.startDate,
      this.endDate,
      this.duration,
      this.durationUnit || this.constructor.defaultValues.durationUnit
      // Default might not be applied yet
    );
  }
  //endregion
  //region Getters & Setters
  /**
   * Returns the event store this event is part of, if any.
   *
   * @property {Scheduler.data.EventStore}
   * @readonly
   * @category Misc
   * @typings ignore
   */
  get eventStore() {
    var _a;
    const me = this;
    if (me.isOccurrence) {
      return me.recurringTimeSpan.eventStore;
    }
    if (!me._eventStore) {
      me._eventStore = (_a = me.stores) == null ? void 0 : _a.find((s) => s.isEventStore);
    }
    return me._eventStore;
  }
  updateInternalCls(cls) {
    if (this._cls) {
      this._cls.value = cls;
    } else {
      this._cls = new DomClassList(cls);
    }
  }
  set internalCls(cls) {
    this.updateInternalCls(cls);
    this.set("cls", this._cls.value);
  }
  get internalCls() {
    const { cls } = this;
    if (cls == null ? void 0 : cls.isDomClassList) {
      return cls;
    }
    this.updateInternalCls(cls);
    this.setData("cls", this._cls.value);
    return this._cls;
  }
  get cls() {
    if (!this._cls) {
      this._cls = new DomClassList(super.get("cls"));
    }
    return this._cls;
  }
  set cls(cls) {
    this.internalCls = cls;
  }
  get startDate() {
    return this.get("startDate");
  }
  set startDate(date) {
    this.setStartDate(date);
  }
  get endDate() {
    return this.get("endDate");
  }
  set endDate(date) {
    this.setEndDate(date);
  }
  get endingDate() {
    const me = this, {
      endDate,
      startDate
    } = me;
    if (endDate) {
      return endDate;
    }
    return DateHelper.add(startDate, me.duration, me.durationUnit);
  }
  get duration() {
    return this.get("duration");
  }
  set duration(duration) {
    this.setDuration(duration, this.durationUnit);
  }
  get durationUnit() {
    return this.get("durationUnit");
  }
  /**
   * Sets duration and durationUnit in one go. Only allowed way to change durationUnit, the durationUnit field is
   * readonly after creation
   * @param {Number} duration Duration value
   * @param {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'} durationUnit Unit for
   * specified duration value, see {@link #field-durationUnit} for valid values
   * @category Scheduling
   */
  setDuration(duration, durationUnit = this.durationUnit) {
    duration = parseFloat(duration);
    this.set({
      duration,
      durationUnit,
      ...this.updateDatesFromDuration(duration, durationUnit)
    });
  }
  updateDatesFromDuration(magnitude, unit, startDate = this.startDate, endDate = this.endDate) {
    const result = {};
    if (startDate) {
      result.endDate = this.internalCalculateEndDate(startDate, magnitude, unit);
    } else if (endDate) {
      result.startDate = this.internalCalculateStartDate(endDate, magnitude, unit);
    }
    return result;
  }
  /**
   * Returns duration of the event in given unit. This is a wrapper for {@link Core.helper.DateHelper#function-getDurationInUnit-static}
   * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} unit
   * @param {Boolean} [doNotRound]
   * @private
   * @returns {Number}
   */
  getDurationInUnit(unit, doNotRound) {
    const me = this;
    if (me.startDate && me.endDate) {
      return DateHelper.getDurationInUnit(me.startDate, me.endDate, unit, doNotRound);
    } else {
      return DateHelper.as(unit, me.duration, me.durationUnit);
    }
  }
  get fullDuration() {
    return new Duration({
      unit: this.durationUnit,
      magnitude: this.duration
    });
  }
  set fullDuration(duration) {
    if (typeof duration === "string") {
      duration = DateHelper.parseDuration(duration, true, this.durationUnit);
    }
    this.setDuration(duration.magnitude, duration.unit);
  }
  /**
   * Sets the range start date
   *
   * @param {Date} date The new start date
   * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
   * Defaults to `true`
   * @category Scheduling
   */
  setStartDate(date, keepDuration = true) {
    const me = this, toSet = {
      startDate: date
    };
    if (date) {
      let calcEndDate;
      if (keepDuration) {
        calcEndDate = me.duration != null;
      } else {
        if (me.endDate) {
          toSet.duration = me.internalCalculateDuration(date, me.endDate, me.durationUnit);
          if (toSet.duration < 0) {
            throw new Error("Negative duration");
          }
        } else {
          calcEndDate = me.duration != null;
        }
      }
      if (calcEndDate) {
        toSet.endDate = me.internalCalculateEndDate(date, me.duration, me.durationUnit);
      }
    } else {
      toSet.duration = null;
    }
    me.set(toSet);
  }
  /**
   * Sets the range end date
   *
   * @param {Date} date The new end date
   * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
   * Defaults to `false`
   * @category Scheduling
   */
  setEndDate(date, keepDuration = false) {
    const me = this, toSet = {
      endDate: date
    };
    if (date) {
      let calcStartDate;
      if (keepDuration === true) {
        calcStartDate = me.duration != null;
      } else {
        if (me.startDate) {
          toSet.duration = me.internalCalculateDuration(me.startDate, date, me.durationUnit);
          if (toSet.duration < 0)
            throw new Error("Negative duration");
        } else {
          calcStartDate = this.duration != null;
        }
      }
      if (calcStartDate) {
        toSet.startDate = me.internalCalculateStartDate(date, me.duration, me.durationUnit);
      }
    }
    me.set(toSet);
  }
  /**
   * Sets the event start and end dates
   *
   * @param {Date} start The new start date
   * @param {Date} end The new end date
   * @param {Boolean} [silent] Pass `true` to not trigger events
   * @category Scheduling
   */
  setStartEndDate(start, end, silent) {
    if (start > end) {
      throw new Error("Start date must be less or equal to end date");
    }
    this.set({
      startDate: start,
      endDate: end
    }, null, silent);
  }
  /**
   * Returns an array of dates in this range. If the range starts/ends not at the beginning of day, the whole day will be included.
   * @readonly
   * @property {Date[]}
   * @category Scheduling
   */
  get dates() {
    const dates = [], startDate = DateHelper.startOf(this.startDate, "day"), endDate = this.endDate;
    for (let date = startDate; date < endDate; date = DateHelper.add(date, 1, "day")) {
      dates.push(date);
    }
    return dates;
  }
  get startDateMS() {
    var _a;
    return (_a = this.batching && this.hasBatchedChange("startDate") ? this.get("startDate") : this.startDate) == null ? void 0 : _a.getTime();
  }
  get endDateMS() {
    var _a;
    return (_a = this.batching && this.hasBatchedChange("endDate") ? this.get("endDate") : this.endDate) == null ? void 0 : _a.getTime();
  }
  /**
   * Returns the duration of this Event in milliseconds.
   * @readonly
   * @property {Number}
   * @category Scheduling
   */
  get durationMS() {
    const { endDateMS, startDateMS } = this;
    if (endDateMS && startDateMS) {
      return endDateMS - startDateMS;
    }
    return DateHelper.asMilliseconds(this.duration || 0, this.durationUnit);
  }
  /**
   * Returns true if record is a milestone.
   * @readonly
   * @property {Boolean}
   * @category Scheduling
   */
  get isMilestone() {
    return this.duration === 0;
  }
  inSetNormalize(field) {
    if (typeof field !== "string") {
      let { startDate, endDate, duration, durationUnit = this.durationUnit } = field;
      if (typeof startDate === "string") {
        startDate = this.getFieldDefinition("startDate").convert(startDate);
      }
      if (typeof endDate === "string") {
        endDate = this.getFieldDefinition("endDate").convert(endDate);
      }
      if ("duration" in field) {
        if (startDate && !endDate) {
          endDate = this.internalCalculateEndDate(startDate, duration, durationUnit);
        }
        if (!startDate && endDate) {
          startDate = this.internalCalculateStartDate(endDate, duration, durationUnit);
        }
      } else if (startDate && endDate) {
        duration = this.internalCalculateDuration(startDate, endDate, durationUnit);
      }
      const fieldOrClone = Object.isFrozen(field) ? ObjectHelper.clone(field) : field;
      startDate && (fieldOrClone.startDate = startDate);
      endDate && (fieldOrClone.endDate = endDate);
      duration != null && (fieldOrClone.duration = duration);
      return fieldOrClone;
    }
  }
  fieldToKeys(field, value) {
    var _a, _b;
    const result = super.fieldToKeys(field, value);
    if (result.fullDuration) {
      const { magnitude, unit } = result.fullDuration;
      result.duration = magnitude;
      result.durationUnit = unit;
    }
    if (!this.isEventModel && !this.isTaskModel) {
      if (("duration" in result || result.durationUnit) && !(result.startDate && result.endDate)) {
        Object.assign(
          result,
          this.updateDatesFromDuration(
            (_a = result.duration) != null ? _a : this.duration,
            (_b = result.durationUnit) != null ? _b : this.durationUnit,
            result.startDate,
            result.endDate
          )
        );
      }
    }
    return result;
  }
  inSet(field, value, silent, fromRelationUpdate, skipAccessors, validOnly, triggerBeforeUpdate) {
    var _a;
    const me = this;
    if (!skipAccessors) {
      field = me.inSetNormalize(field) || field;
    }
    const result = super.inSet(field, value, silent, fromRelationUpdate, skipAccessors, validOnly, triggerBeforeUpdate);
    if (!((_a = me.project) == null ? void 0 : _a.isWritingData) && field.startDate && field.endDate) {
      let invalid;
      if (field.startDate instanceof Date && field.endDate instanceof Date) {
        invalid = field.startDate > field.endDate;
      } else if (me.fieldMap.startDate.convert(field.startDate) > me.fieldMap.endDate.convert(field.endDate)) {
        invalid = true;
      }
      if (invalid) {
        console.error(`startDate > endDate for ${me.constructor.$name} record with id: ${me.id}`);
      }
    }
    return result;
  }
  // Cls requires special handling since it is converted to a DomClassList
  applyValue(useProp, key, value, skipAccessors, field) {
    if (key === "cls") {
      this.updateInternalCls(value);
    }
    super.applyValue(useProp, key, value, skipAccessors, field);
  }
  //endregion
  //region Iteration
  /**
   * Iterates over the {@link #property-dates}
   * @param {Function} func The function to call for each date
   * @param {Object} thisObj `this` reference for the function
   * @category Scheduling
   */
  forEachDate(func, thisObj) {
    return this.dates.forEach(func.bind(thisObj));
  }
  //endregion
  /**
   * Checks if the range record has both start and end dates set and start <= end
   *
   * @property {Boolean}
   * @category Scheduling
   */
  get isScheduled() {
    const { startDateMS, endDateMS } = this;
    return endDateMS - startDateMS >= 0;
  }
  // Simple check if end date is greater than start date
  get isValid() {
    const { startDate, endDate } = this;
    return !startDate || !endDate || endDate - startDate >= 0;
  }
  /**
   * Shift the dates for the date range by the passed amount and unit
   * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} unit The unit to shift by, see {@link Core.helper.DateHelper}
   * for more information on valid formats.
   * @param {Number} amount The amount to shift
   */
  shift(amount, unit = this.durationUnit) {
    if (typeof amount === "string") {
      const u = amount;
      amount = unit;
      unit = u;
    }
    return this.setStartDate(DateHelper.add(this.startDate, amount, unit, true), true);
  }
  /**
   * Returns the WBS code of this model (e.g '2.1.3'). Only relevant when part of a tree store, as in the Gantt chart.
   * @property {String}
   * @category Parent & children
   */
  get wbsCode() {
    return this._wbsCode || this.indexPath.join(".");
  }
  set wbsCode(value) {
    this._wbsCode = value;
  }
  fullCopy() {
    return this.copy.apply(this, arguments);
  }
  intersects(timeSpan) {
    return this.intersectsRange(timeSpan.startDate, timeSpan.endDate);
  }
  intersectsRange(start, end) {
    const myStart = this.startDate, myEnd = this.endDate;
    return myStart && myEnd && DateHelper.intersectSpans(myStart, myEnd, start, end);
  }
  /**
   * Splits this event into two pieces at the desired position.
   *
   * @param {Number|String} splitPoint The duration point at which to split this event.
   *
   * If less then `1`, this indicates the relative position at which it will be split.
   * 0.5 means cut it in half.
   *
   * If greater than `1`, this indicates the new duration in the current duration units of this event before the split.
   *
   * If this is a string, it will be a duration description as described in
   * {@link Core.helper.DateHelper#function-parseDuration-static}, for example `'15 min'`
   *
   * @returns {Scheduler.model.TimeSpan} The newly created split section of the timespan
   * @category Scheduling
   */
  split(splitPoint = 0.5) {
    const me = this, clone = me.copy(), {
      fullDuration,
      eventStore,
      assignmentStore
    } = me, oldDuration = new Duration(fullDuration), cloneDuration = new Duration(fullDuration);
    let ownNewDuration, unitsChanged;
    if (typeof splitPoint === "string") {
      ownNewDuration = new Duration(splitPoint);
      if (ownNewDuration.unit === oldDuration.unit) {
        cloneDuration.magnitude -= ownNewDuration.magnitude;
      } else {
        cloneDuration.magnitude = DateHelper.as(ownNewDuration.unit, oldDuration) - ownNewDuration.magnitude;
        cloneDuration.unit = ownNewDuration.unit;
        unitsChanged = true;
      }
    } else {
      ownNewDuration = new Duration(splitPoint > 1 ? splitPoint : me.duration * splitPoint, me.durationUnit);
      cloneDuration.magnitude -= ownNewDuration.magnitude;
    }
    clone.startDate = DateHelper.add(me.startDate, ownNewDuration.magnitude, ownNewDuration.unit);
    if (unitsChanged) {
      clone.fullDuration = cloneDuration;
      me.fullDuration = ownNewDuration;
    } else {
      clone.duration = cloneDuration.magnitude;
      me.duration = ownNewDuration.magnitude;
    }
    if (eventStore) {
      eventStore.add(clone);
      if (assignmentStore && !eventStore.usesSingleAssignment) {
        assignmentStore.add(
          me.assignments.map((assignment) => {
            const clonedData = Object.assign({}, assignment.data, {
              eventId: clone.id,
              // From engine
              event: null,
              resource: null
            });
            delete clonedData.id;
            return clonedData;
          })
        );
      }
    }
    return clone;
  }
  toICSString(icsEventConfig = {}) {
    if (!this.isScheduled) {
      return "";
    }
    const {
      startDate,
      endDate
    } = this, timestamp = icsEventConfig.DTSTAMP || DateHelper.format(/* @__PURE__ */ new Date(), "uu");
    delete icsEventConfig.DTSTAMP;
    let startEnd = {};
    if (this.allDay) {
      startEnd = {
        "DTSTART;VALUE=DATE": DateHelper.format(startDate, "u"),
        "DTEND;VALUE=DATE": DateHelper.format(endDate, "u")
      };
    } else {
      startEnd = {
        DTSTART: DateHelper.format(startDate, "uu"),
        DTEND: DateHelper.format(endDate, "uu")
      };
    }
    const version = VersionHelper.scheduler && VersionHelper.getVersion("scheduler") || VersionHelper.calendar && VersionHelper.getVersion("calendar") || "", icsWrapConfig = {
      BEGIN: "VCALENDAR",
      VERSION: "2.0",
      CALSCALE: "GREGORIAN",
      PRODID: `-//Bryntum AB//Bryntum Scheduler ${version} //EN`,
      END: "VCALENDAR"
    }, eventConfig = {
      BEGIN: "VEVENT",
      UID: this.id + "@bryntum.com",
      CLASS: "PUBLIC",
      SUMMARY: this.name,
      DTSTAMP: timestamp,
      ...startEnd,
      ...this.recurrenceRule ? { RRULE: this.recurrenceRule } : {},
      ...icsEventConfig,
      END: "VEVENT"
    }, icsItems = Object.keys(icsWrapConfig).map((key) => `${key}:${icsWrapConfig[key]}`), eventItems = Object.keys(eventConfig).map((key) => `${key}:${eventConfig[key]}`);
    icsItems.splice(icsItems.length - 1, 0, ...eventItems);
    return icsItems.join("\n");
  }
  /**
   * Triggers a download of this time span in ICS format (for import in Outlook etc.)
   *
   * ```javascript
   * timeSpan.downloadAsICS({
   *      LOCATION : timeSpan.location
   *  });
   * ```
   * @param {Object<String,String>} [icsEventConfig] A config object with properties to be added in to `BEGIN:VEVENT`
   * section of the exported event.
   * @category Misc
   */
  exportToICS(icsEventConfig) {
    if (this.isScheduled) {
      const blob = new Blob([this.toICSString(icsEventConfig)], { type: "text/calendar" });
      BrowserHelper.downloadBlob(blob, (this.name || "Event") + ".ics");
    }
  }
  /**
   * Defines if the given event field should be manually editable in UI.
   * You can override this method to provide your own logic.
   *
   * By default the method defines all the event fields as editable.
   *
   * @param {String} fieldName Name of the field
   * @returns {Boolean} Returns `true` if the field is editable, `false` if it is not and `undefined` if the model has no such field.
   */
  isEditable(fieldName) {
    return this.getFieldDefinition(fieldName) ? true : void 0;
  }
  isFieldModified(fieldName) {
    if (fieldName === "fullDuration") {
      return super.isFieldModified("duration") || super.isFieldModified("durationUnit");
    }
    return super.isFieldModified(fieldName);
  }
};
__publicField(TimeSpan, "$name", "TimeSpan");
//region Field definitions
__publicField(TimeSpan, "fields", [
  /**
   * The start date of a time span (or Event / Task).
   *
   * Uses {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat} to convert a
   * supplied string to a Date. To specify another format, either change that setting or subclass TimeSpan and
   * change the dateFormat for this field.
   *
   * Note that the field always returns a `Date`.
   *
   * @field {Date} startDate
   * @accepts {String|Date}
   * @category Scheduling
   */
  {
    name: "startDate",
    type: "date"
  },
  /**
   * The end date of a time span (or Event / Task).
   *
   * Uses {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat} to convert a
   * supplied string to a Date. To specify another format, either change that setting or subclass TimeSpan and
   * change the dateFormat for this field.
   *
   * Note that the field always returns a `Date`.
   *
   * @field {Date} endDate
   * @accepts {String|Date}
   * @category Scheduling
   */
  {
    name: "endDate",
    type: "date"
  },
  /**
   * The numeric part of the timespan's duration (the number of units).
   * @field {Number} duration
   * @category Scheduling
   */
  {
    name: "duration",
    type: "number",
    allowNull: true,
    internal: true
  },
  /**
   * The unit part of the TimeSpan duration, defaults to "d" (days). Valid values are:
   *
   * - "millisecond" - Milliseconds
   * - "second" - Seconds
   * - "minute" - Minutes
   * - "hour" - Hours
   * - "day" - Days
   * - "week" - Weeks
   * - "month" - Months
   * - "quarter" - Quarters
   * - "year"- Years
   *
   * This field is readonly after creation, to change durationUnit use #setDuration().
   * @field {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'} durationUnit
   * @category Scheduling
   */
  {
    type: "durationunit",
    name: "durationUnit",
    defaultValue: "d",
    internal: true
  },
  /**
   * Calculated field which encapsulates the duration's magnitude and unit. This field will not be persisted,
   * setting it will update the {@link #field-duration} and {@link #field-durationUnit} fields.
   *
   * @field {DurationConfig|Core.data.Duration} fullDuration
   * @category Scheduling
   */
  {
    name: "fullDuration",
    persist: false,
    column: {
      type: "duration"
    },
    useProp: true
  },
  /**
   * An encapsulation of the CSS classes to add to the rendered time span element.
   *
   * Always returns a {@link Core.helper.util.DomClassList}, but may still be treated as a string. For
   * granular control of adding and removing individual classes, it is recommended to use the
   * {@link Core.helper.util.DomClassList} API.
   *
   * @field {Core.helper.util.DomClassList} cls
   * @accepts {Core.helper.util.DomClassList|String|String[]|Object}
   *
   * @category Styling
   */
  {
    name: "cls",
    defaultValue: "",
    internal: true
  },
  /**
   * CSS class specifying an icon to apply to the rendered time span element.
   * **Note**: In case event is a milestone, using `iconCls` with dependency feature might slightly decrease
   * performance because feature will refer to the DOM to get exact size of the element.
   * @field {String} iconCls
   * @category Styling
   */
  {
    name: "iconCls",
    internal: true
  },
  /**
   * A CSS style string (applied to `style.cssText`) or object (applied to `style`)
   * ```
   * record.style = 'color: red;font-weight: 800';
   * ```
   *
   * @field {String} style
   * @category Styling
   */
  {
    name: "style",
    type: "object",
    internal: true
  },
  /**
   * The name of the time span (or Event / Task)
   * @field {String} name
   * @category Common
   */
  {
    name: "name",
    type: "string",
    defaultValue: ""
  }
]);
TimeSpan._$name = "TimeSpan";

// ../Scheduler/lib/Scheduler/data/mixin/ResourceStoreMixin.js
var ResourceStoreMixin_default = (Target) => class ResourceStoreMixin extends (Target || Base) {
  static get $name() {
    return "ResourceStoreMixin";
  }
  get isResourceStore() {
    return true;
  }
  /**
   * Add resources to the store.
   *
   * NOTE: References (events, assignments) on the resources are determined async by a calculation engine. Thus they
   * cannot be directly accessed after using this function.
   *
   * For example:
   *
   * ```javascript
   * const [resource] = resourceStore.add({ id });
   * // resource.events is not yet available
   * ```
   *
   * To guarantee references are set up, wait for calculations for finish:
   *
   * ```javascript
   * const [resource] = resourceStore.add({ id });
   * await resourceStore.project.commitAsync();
   * // resource.events is available (assuming EventStore is loaded and so on)
   * ```
   *
   * Alternatively use `addAsync()` instead:
   *
   * ```javascript
   * const [resource] = await resourceStore.addAsync({ id });
   * // resource.events is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.ResourceModel|Scheduler.model.ResourceModel[]|ResourceModelConfig|ResourceModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.ResourceModel[]} Added records
   * @function add
   * @category CRUD
   */
  /**
   * Add resources to the store and triggers calculations directly after. Await this function to have up to date
   * references on the added resources.
   *
   * ```javascript
   * const [resource] = await resourceStore.addAsync({ id });
   * // resource.events is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.ResourceModel|Scheduler.model.ResourceModel[]|ResourceModelConfig|ResourceModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.ResourceModel[]} Added records
   * @function addAsync
   * @category CRUD
   * @async
   */
  /**
   * Applies a new dataset to the ResourceStore. Use it to plug externally fetched data into the store.
   *
   * NOTE: References (events, assignments) on the resources are determined async by a calculation engine. Thus
   * they cannot be directly accessed after assigning the new dataset.
   *
   * For example:
   *
   * ```javascript
   * resourceStore.data = [{ id }];
   * // resourceStore.first.events is not yet available
   * ```
   *
   * To guarantee references are available, wait for calculations for finish:
   *
   * ```javascript
   * resourceStore.data = [{ id }];
   * await resourceStore.project.commitAsync();
   * // resourceStore.first.events is available
   * ```
   *
   * Alternatively use `loadDataAsync()` instead:
   *
   * ```javascript
   * await resourceStore.loadDataAsync([{ id }]);
   * // resourceStore.first.events is available
   * ```
   *
   * @member {ResourceModelConfig[]} data
   * @category Records
   */
  /**
   * Applies a new dataset to the ResourceStore and triggers calculations directly after. Use it to plug externally
   * fetched data into the store.
   *
   * ```javascript
   * await resourceStore.loadDataAsync([{ id }]);
   * // resourceStore.first.events is available
   * ```
   *
   * @param {ResourceModelConfig[]} data Array of ResourceModel data objects
   * @function loadDataAsync
   * @category CRUD
   * @async
   */
  static get defaultConfig() {
    return {
      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 200,
      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 100,
      storeId: "resources",
      autoTree: true
    };
  }
  construct(config) {
    super.construct(config);
    if (!this.modelClass.isResourceModel) {
      throw new Error("Model for ResourceStore must subclass ResourceModel");
    }
  }
  removeAll() {
    const result = super.removeAll(...arguments);
    result && this.assignmentStore.removeAll();
    return result;
  }
  // Apply id changes also to assignments (used to be handled automatically by relations earlier, but engine does not
  // care about ids so needed now)
  // problems:
  // 1. orientation/HorizontalRendering listens to assignment store changes and is trying to refresh view
  // When we update resource id on assignment, listener will be invoked and view will try to refresh. And it will
  // fail, because row is not updated yet. Flag is raised on resource store to make HorizontalRendering to skip
  // refreshing view in this particular case of resource id changing
  onRecordIdChange({ record, oldValue, value }) {
    super.onRecordIdChange({ record, oldValue, value });
    if (record.isFieldModified("id")) {
      this.isChangingId = true;
      record.updateAssignmentResourceIds();
      this.isChangingId = false;
    }
  }
  // Cache used by VerticalRendering, reset from there
  get allResourceRecords() {
    return this._allResourceRecords || (this._allResourceRecords = this.getAllDataRecords());
  }
  /**
   * Returns all resources that have no events assigned during the specified time range.
   * @param {Date} startDate Time range start date
   * @param {Date} endDate Time range end date
   * @returns {Scheduler.model.ResourceModel[]} Resources without events
   */
  getAvailableResources({ startDate, endDate }) {
    return this.query((resource) => this.eventStore.isDateRangeAvailable(startDate, endDate, null, resource));
  }
};

// ../Scheduler/lib/Scheduler/data/mixin/PartOfProject.js
var PartOfProject_default = (Target) => class PartOfProject extends (Target || Base) {
  /**
   * Returns the project this entity belongs to.
   *
   * @member {Scheduler.model.ProjectModel} project
   * @readonly
   * @category Project
   */
  /**
   * Returns the event store of the project this entity belongs to.
   *
   * @member {Scheduler.data.EventStore} eventStore
   * @readonly
   * @category Project
   */
  /**
   * Returns the dependency store of the project this entity belongs to.
   *
   * @member {Scheduler.data.DependencyStore} dependencyStore
   * @readonly
   * @category Project
   */
  /**
   * Returns the assignment store of the project this entity belongs to.
   *
   * @member {Scheduler.data.AssignmentStore} assignmentStore
   * @readonly
   * @category Project
   */
  /**
   * Returns the resource store of the project this entity belongs to.
   *
   * @member {Scheduler.data.ResourceStore} resourceStore
   * @readonly
   * @category Project
   */
  static get $name() {
    return "PartOfProject";
  }
};

// ../Scheduler/lib/Scheduler/model/mixin/ResourceModelMixin.js
var ResourceModelMixin_default = (Target) => class ResourceModelMixin extends Target {
  static get $name() {
    return "ResourceModelMixin";
  }
  // Flag checked by ResourceStore to make sure it uses a valid subclass
  static get isResourceModel() {
    return true;
  }
  /**
   * Set value for the specified field(s), triggering engine calculations immediately. See
   * {@link Core.data.Model#function-set Model#set()} for arguments.
   *
   * This does not matter much on the resource itself, but is of importance when manipulating its references:
   *
   * ```javascript
   * assignment.set('resourceId', 2);
   * // resource.assignments is not yet up to date
   *
   * await assignment.setAsync('resourceId', 2);
   * // resource.assignments is up to date
   * ```
   *
   * @param {String|Object} field The field to set value for, or an object with multiple values to set in one call
   * @param {*} [value] Value to set
   * @param {Boolean} [silent=false] Set to true to not trigger events
   * automatically.
   * @function setAsync
   * @category Editing
   * @async
   */
  //region Fields
  static get fields() {
    return [
      /**
       * Unique identifier
       * @field {String|Number} id
       * @category Common
       */
      /**
       * Get or set resource name
       * @field {String} name
       * @category Common
       */
      { name: "name", type: "string", persist: true },
      /**
       * Controls the primary color used for events assigned to this resource. Can be overridden per event using
       * EventModels {@link Scheduler.model.mixin.EventModelMixin#field-eventColor eventColor config}. Also, see
       * Schedulers {@link Scheduler.view.mixin.TimelineEventRendering#config-eventColor eventColor config}.
       *
       * For available standard colors, see
       * {@link Scheduler.model.mixin.EventModelMixin#typedef-EventColor}.
       *
       * @field {EventColor} eventColor
       * @category Styling
       */
      "eventColor",
      /**
       * Controls the style used for events assigned to this resource. Can be overridden per event using
       * EventModels {@link Scheduler/model/mixin/EventModelMixin#field-eventStyle eventStyle config}. See Schedulers
       * {@link Scheduler.view.mixin.TimelineEventRendering#config-eventStyle eventStyle config} for available
       * options.
       * @field {String} eventStyle
       * @category Styling
       */
      "eventStyle",
      /**
       * Fully qualified image URL, used by `ResourceInfoColumn` and vertical modes `ResourceHeader` to display a miniature image
       * for the resource.
       * @field {String} imageUrl
       * @category Styling
       */
      "imageUrl",
      /**
       * Image name relative to {@link Scheduler/view/mixin/SchedulerEventRendering#config-resourceImagePath},
       * used by `ResourceInfoColumn` and vertical modes `ResourceHeader` to display a miniature image
       * for the resource.
       * Set value to `false` to disable image display.
       * @field {String|Boolean} image
       * @category Styling
       */
      "image",
      /**
       * Control how much space to leave between the first event/last event and the resources edge (top/bottom
       * margin within the resource row in horizontal mode, left/right margin within the resource column in
       * vertical mode), in px.
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
       * @field {Number|ResourceMarginConfig} resourceMargin
       * @category Layout
       */
      "resourceMargin",
      /**
       * Margin between stacked event bars for this resource, in px.
       * @field {Number} barMargin
       * @category Layout
       */
      { name: "barMargin", type: "number" },
      /**
       * Base height of this resource, in px. When unset, Schedulers configured rowHeight is used.
       *
       * This value is used in horizontal mode to determine row height. When stacking, it is used as input for
       * calculating the actual row height:
       *
       * ```javascript
       * row.height = (resource.rowHeight - (resourceMargin.start + resourceMargin.end)) * overlap count - barMargin * (overlap count - 1)
       * ```
       *
       * When packing or overlapping, it is used as the actual row height.
       *
       * @field {Number} rowHeight
       * @category Layout
       */
      /**
       * Base width of this resource, in px. If not set, the `columnWidth` specified in
       * the Scheduler's configured {@link Scheduler.view.Scheduler#config-resourceColumns} is used.
       *
       * This value is used in vertical mode to determine column width.
       *
       * @field {Number} columnWidth
       * @category Layout
       */
      /**
       * Specify this to use a resource specific event layout in horizontal mode, see
       * {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventLayout} for options.
       *
       * When unset (the default) Schedulers setting is used.
       *
       * @field {'stack'|'pack'|'mixed'|'none'} eventLayout
       * @category Layout
       */
      "eventLayout"
    ];
  }
  //endregion
  //region Id change
  updateAssignmentResourceIds() {
    this.assigned.forEach((assignment) => {
      assignment.resourceId = this.id;
    });
  }
  syncId(value) {
    super.syncId(value);
    this.updateAssignmentResourceIds();
  }
  //endregion
  //region Getters
  // Documented in Scheduler.model.ResourceModel, SchedulerPro.model.ResourceModel, Gantt.model.ResourceModel
  get events() {
    return this.assignments.reduce((events, assignment) => {
      if (assignment.event) {
        events.push(assignment.event);
      }
      return events;
    }, []);
  }
  /**
   * Returns all assignments for the resource
   *
   * @property {Scheduler.model.AssignmentModel[]}
   * @category Common
   */
  get assignments() {
    return this.assigned ? [...this.assigned] : [];
  }
  set assignments(assignments) {
    this.assignmentStore.remove(this.assignments);
    assignments.forEach((assignment) => {
      assignment.resource = this;
    });
  }
  /**
   * Returns an array of events, associated with this resource
   *
   * @deprecated 5.3.6 Use the events property instead
   *
   * @returns {Scheduler.model.EventModel[]}
   */
  getEvents() {
    VersionHelper.deprecate("scheduler", "6.0.0", "getEvents() is deprecated, use the events property instead");
    return this.events;
  }
  /**
   * Returns `true` if the resource can be persisted.
   * In a flat store, a resource is always considered persistable. In a tree store, a resource is considered
   * persistable if its parent node is persistable.
   *
   * @property {Boolean}
   * @readonly
   * @category Editing
   */
  get isPersistable() {
    return super.isPersistable && (!this.parent || this.parent.isPersistable);
  }
  //endregion
  /**
   * Unassigns this Resource from all its Events
   */
  unassignAll() {
    this.assignments && this.assignmentStore.remove(this.assignments);
  }
  /**
   * Returns the initials (first letter of the first & last space-separated word in the name) or an empty string
   * if this resource has no name. You can override this method in a ResourceModel subclass to provide your own implementation
   *
   * @property {String}
   * @readonly
   * @category Common
   */
  get initials() {
    const { name = "" } = this;
    if (!name) {
      return "";
    }
    const names = name.split(" "), firstInitial = names[0][0], lastInitial = names.length > 1 ? names[names.length - 1][0] : "";
    return firstInitial + lastInitial;
  }
  isWorkingTime(date) {
    var _a, _b;
    const calendar = this.effectiveCalendar || ((_a = this.project) == null ? void 0 : _a.calendar);
    return !calendar || ((_b = calendar.isWorkingTime) == null ? void 0 : _b.call(calendar, date));
  }
};

// ../chronograph/src/collection/Iterator.js
function split(iterable) {
  const gen1Pending = [];
  const gen2Pending = [];
  let iterator;
  const gen1 = function* () {
    if (!iterator)
      iterator = iterable[Symbol.iterator]();
    while (true) {
      if (gen1Pending.length) {
        yield* gen1Pending;
        gen1Pending.length = 0;
      }
      if (!iterator)
        break;
      const { value, done } = iterator.next();
      if (done) {
        iterator = null;
        iterable = null;
        break;
      }
      gen2Pending.push(value);
      yield value;
    }
  };
  const gen2 = function* () {
    if (!iterator)
      iterator = iterable[Symbol.iterator]();
    while (true) {
      if (gen2Pending.length) {
        yield* gen2Pending;
        gen2Pending.length = 0;
      }
      if (!iterator)
        break;
      const { value, done } = iterator.next();
      if (done) {
        iterator = null;
        iterable = null;
        break;
      }
      gen1Pending.push(value);
      yield value;
    }
  };
  return [gen1(), gen2()];
}
function* inBatchesBySize(iterator, batchSize) {
  if (batchSize < 0)
    throw new Error("Batch size needs to a natural number");
  batchSize = batchSize | 0;
  const runningBatch = [];
  for (const el of iterator) {
    if (runningBatch.length === batchSize) {
      yield runningBatch;
      runningBatch.length = 0;
    }
    runningBatch.push(el);
  }
  if (runningBatch.length > 0)
    yield runningBatch;
}
function* filter(iterator, func) {
  let i = 0;
  for (const el of iterator) {
    if (func(el, i++))
      yield el;
  }
}
function* drop(iterator, howMany) {
  let i = 0;
  for (const el of iterator) {
    if (++i > howMany)
      yield el;
  }
}
function every(iterator, func) {
  let i = 0;
  for (const el of iterator) {
    if (!func(el, i++))
      return false;
  }
  return true;
}
function some(iterator, func) {
  let i = 0;
  for (const el of iterator) {
    if (func(el, i++))
      return true;
  }
  return false;
}
function* map(iterator, func) {
  let i = 0;
  for (const el of iterator)
    yield func(el, i++);
}
function reduce(iterator, func, initialAcc) {
  let i = 0;
  let acc = initialAcc;
  for (const el of iterator) {
    acc = func(acc, el, i++);
  }
  return acc;
}
function* uniqueOnly(iterator) {
  const seen = /* @__PURE__ */ new Set();
  for (const el of iterator) {
    if (!seen.has(el)) {
      seen.add(el);
      yield el;
    }
  }
}
function* uniqueOnlyBy(iterator, func) {
  const seen = /* @__PURE__ */ new Set();
  for (const el of iterator) {
    const uniqueBy = func(el);
    if (!seen.has(uniqueBy)) {
      seen.add(uniqueBy);
      yield el;
    }
  }
}
function* takeWhile(iterator, func) {
  let i = 0;
  for (const el of iterator) {
    if (func(el, i++))
      yield el;
    else
      return;
  }
}
function* concat(...iterators) {
  for (let i = 0; i < iterators.length; i++)
    yield* iterators[i];
}
function* concatIterable(iteratorsProducer) {
  for (const iterator of iteratorsProducer)
    yield* iterator;
}
var ChainedIteratorClass = class _ChainedIteratorClass {
  constructor(iterable) {
    this.iterable = void 0;
    if (!iterable)
      throw new Error("Require an iterable instance for chaining");
    this.iterable = iterable;
  }
  derive(iterable) {
    this.iterable = void 0;
    return new _ChainedIteratorClass(iterable);
  }
  copy() {
    const [iter1, iter2] = split(this.iterable);
    this.iterable = iter2;
    return new _ChainedIteratorClass(iter1);
  }
  split() {
    const [iter1, iter2] = split(this.iterable);
    return [new _ChainedIteratorClass(iter1), this.derive(iter2)];
  }
  inBatchesBySize(batchSize) {
    return this.derive(inBatchesBySize(this.iterable, batchSize));
  }
  filter(func) {
    return this.derive(filter(this.iterable, func));
  }
  drop(howMany) {
    return this.derive(drop(this.iterable, howMany));
  }
  map(func) {
    return this.derive(map(this.iterable, func));
  }
  reduce(func, initialAcc) {
    return reduce(this, func, initialAcc);
  }
  concat() {
    return this.derive(concatIterable(this.iterable));
  }
  uniqueOnly() {
    return this.derive(uniqueOnly(this.iterable));
  }
  uniqueOnlyBy(func) {
    return this.derive(uniqueOnlyBy(this.iterable, func));
  }
  every(func) {
    return every(this, func);
  }
  some(func) {
    return some(this, func);
  }
  takeWhile(func) {
    return this.derive(takeWhile(this.iterable, func));
  }
  *[Symbol.iterator]() {
    let iterable = this.iterable;
    if (!iterable)
      throw new Error("Chained iterator already exhausted or used to derive the new one");
    this.iterable = void 0;
    yield* iterable;
    iterable = void 0;
  }
  toArray() {
    return Array.from(this);
  }
  sort(order) {
    return Array.from(this).sort(order);
  }
  toSet() {
    return new Set(this);
  }
  toMap() {
    return new Map(this);
  }
  // toMap<K, V> () : T extends [ K, V ] ? Map<K, V> : never  {
  //     return new Map<K, V>(this.iterable as (T extends [ K, V ] ? Iterable<T> : never)) as (T extends [ K, V ] ? Map<K, V> : never)
  // }
  flush() {
    for (const element of this) {
    }
  }
  memoize() {
    return new MemoizedIteratorClass(this);
  }
};
var ChainedIterator = (iterator) => new ChainedIteratorClass(iterator);
var CI = ChainedIterator;
var MemoizedIteratorClass = class extends ChainedIteratorClass {
  constructor() {
    super(...arguments);
    this.elements = [];
    this.$iterator = void 0;
  }
  set iterable(iterable) {
    this.$iterable = iterable;
  }
  get iterable() {
    return this;
  }
  derive(iterable) {
    return new ChainedIteratorClass(iterable);
  }
  *[Symbol.iterator]() {
    const elements = this.elements;
    if (this.$iterable) {
      if (!this.$iterator)
        this.$iterator = this.$iterable[Symbol.iterator]();
      let iterator = this.$iterator;
      let alreadyConsumed = elements.length;
      if (alreadyConsumed > 0)
        yield* elements;
      while (true) {
        if (elements.length > alreadyConsumed) {
          for (let i = alreadyConsumed; i < elements.length; i++)
            yield elements[i];
          alreadyConsumed = elements.length;
        }
        if (!iterator)
          break;
        const { value, done } = iterator.next();
        if (done) {
          iterator = this.$iterator = null;
          this.$iterable = null;
        } else {
          elements.push(value);
          alreadyConsumed++;
          yield value;
        }
      }
    } else {
      yield* elements;
    }
  }
};
var MemoizedIterator = (iterator) => new MemoizedIteratorClass(iterator);
var MI = MemoizedIterator;

// ../chronograph/src/class/Mixin.js
var MixinInstanceOfProperty = Symbol("MixinIdentity");
var MixinStateProperty = Symbol("MixinStateProperty");
var MixinWalkDepthState = class {
  constructor() {
    this.baseEl = void 0;
    this.sourceEl = void 0;
    this.$elementsByTopoLevel = void 0;
    this.$topoLevels = void 0;
    this.linearizedByTopoLevelsSource = MI(this.linearizedByTopoLevels());
  }
  static new(props) {
    const me = new this();
    props && Object.assign(me, props);
    return me;
  }
  get topoLevels() {
    if (this.$topoLevels !== void 0)
      return this.$topoLevels;
    return this.$topoLevels = this.buildTopoLevels();
  }
  buildTopoLevels() {
    return Array.from(this.elementsByTopoLevel.keys()).sort((level1, level2) => level1 - level2);
  }
  get elementsByTopoLevel() {
    if (this.$elementsByTopoLevel !== void 0)
      return this.$elementsByTopoLevel;
    return this.$elementsByTopoLevel = this.buildElementsByTopoLevel();
  }
  getOrCreateLevel(map2, topoLevel) {
    let elementsAtLevel = map2.get(topoLevel);
    if (!elementsAtLevel) {
      elementsAtLevel = [];
      map2.set(topoLevel, elementsAtLevel);
    }
    return elementsAtLevel;
  }
  buildElementsByTopoLevel() {
    let maxTopoLevel = 0;
    const baseElements = this.baseEl ? CI(this.baseEl.walkDepthState.elementsByTopoLevel.values()).concat().toSet() : /* @__PURE__ */ new Set();
    const map2 = CI(this.sourceEl.requirements).map((mixin2) => mixin2.walkDepthState.elementsByTopoLevel).concat().reduce((elementsByTopoLevel, [topoLevel, mixins]) => {
      if (topoLevel > maxTopoLevel)
        maxTopoLevel = topoLevel;
      this.getOrCreateLevel(elementsByTopoLevel, topoLevel).push(mixins);
      return elementsByTopoLevel;
    }, /* @__PURE__ */ new Map());
    this.getOrCreateLevel(map2, maxTopoLevel + 1).push([this.sourceEl]);
    return CI(map2).map(([level, elements]) => {
      return [level, CI(elements).concat().uniqueOnly().filter((mixin2) => !baseElements.has(mixin2)).sort((mixin1, mixin2) => mixin1.id - mixin2.id)];
    }).toMap();
  }
  *linearizedByTopoLevels() {
    yield* CI(this.topoLevels).map((level) => this.elementsByTopoLevel.get(level)).concat();
  }
};
var MIXIN_ID = 1;
var identity = (a) => class extends a {
};
var ZeroBaseClass = class {
};
var MixinState = class {
  constructor() {
    this.id = MIXIN_ID++;
    this.requirements = [];
    this.baseClass = ZeroBaseClass;
    this.identitySymbol = void 0;
    this.mixinLambda = identity;
    this.walkDepthState = void 0;
    this.$minimalClass = void 0;
    this.name = "";
  }
  static new(props) {
    const me = new this();
    props && Object.assign(me, props);
    me.walkDepthState = MixinWalkDepthState.new({ sourceEl: me, baseEl: getMixinState(me.baseClass) });
    const mixinLambda = me.mixinLambda;
    const symbol = me.identitySymbol = Symbol(mixinLambda.name);
    const mixinLambdaWrapper = Object.assign(function(base) {
      const extendedClass = mixinLambda(base);
      extendedClass.prototype[symbol] = true;
      return extendedClass;
    }, {
      [MixinInstanceOfProperty]: symbol,
      [MixinStateProperty]: me
    });
    Object.defineProperty(mixinLambdaWrapper, Symbol.hasInstance, { value: isInstanceOfStatic });
    me.mixinLambda = mixinLambdaWrapper;
    return me;
  }
  get minimalClass() {
    if (this.$minimalClass !== void 0)
      return this.$minimalClass;
    return this.$minimalClass = this.buildMinimalClass();
  }
  // get hash () : MixinHash {
  //     if (this.$hash !== '') return this.$hash
  //
  //     return this.$hash = this.buildHash()
  // }
  // buildHash () : MixinHash {
  //     return String.fromCharCode(...this.walkDepthState.linearizedByTopoLevelsSource.map(mixin => mixin.id))
  // }
  getBaseClassMixinId(baseClass) {
    const constructor = this.constructor;
    const mixinId = constructor.baseClassesIds.get(baseClass);
    if (mixinId !== void 0)
      return mixinId;
    const newId = MIXIN_ID++;
    constructor.baseClassesIds.set(baseClass, newId);
    return newId;
  }
  buildMinimalClass() {
    const self = this.constructor;
    let baseCls = this.baseClass;
    const minimalClassConstructor = this.walkDepthState.linearizedByTopoLevelsSource.reduce((acc, mixin2) => {
      const { cls, hash } = acc;
      const nextHash = hash + String.fromCharCode(mixin2.id);
      let wrapperCls = self.minimalClassesByLinearHash.get(nextHash);
      if (!wrapperCls) {
        wrapperCls = mixin2.mixinLambda(cls);
        mixin2.name = wrapperCls.name;
        self.minimalClassesByLinearHash.set(nextHash, wrapperCls);
      }
      acc.cls = wrapperCls;
      acc.hash = nextHash;
      return acc;
    }, { cls: baseCls, hash: String.fromCharCode(this.getBaseClassMixinId(baseCls)) }).cls;
    const minimalClass = Object.assign(minimalClassConstructor, {
      [MixinInstanceOfProperty]: this.identitySymbol,
      [MixinStateProperty]: this,
      mix: this.mixinLambda,
      derive: (base) => Mixin([minimalClass, base], (base2) => class extends base2 {
      }),
      $: this,
      toString: this.toString.bind(this)
    });
    Object.defineProperty(minimalClass, Symbol.hasInstance, { value: isInstanceOfStatic });
    return minimalClass;
  }
  toString() {
    return this.walkDepthState.linearizedByTopoLevelsSource.reduce((acc, mixin2) => `${mixin2.name}(${acc})`, this.baseClass.name);
  }
};
MixinState.minimalClassesByLinearHash = /* @__PURE__ */ new Map();
MixinState.baseClassesIds = /* @__PURE__ */ new Map();
var isMixinClass = (func) => {
  return Object.getPrototypeOf(func.prototype).constructor.hasOwnProperty(MixinStateProperty);
};
var getMixinState = (func) => {
  return Object.getPrototypeOf(func.prototype).constructor[MixinStateProperty];
};
var mixin = (required, mixinLambda) => {
  let baseClass;
  if (required.length > 0) {
    const lastRequirement = required[required.length - 1];
    if (!isMixinClass(lastRequirement) && lastRequirement !== ZeroBaseClass)
      baseClass = lastRequirement;
  }
  const requirements = [];
  required.forEach((requirement, index) => {
    const mixinState2 = requirement[MixinStateProperty];
    if (mixinState2 !== void 0) {
      const currentBaseClass = mixinState2.baseClass;
      if (currentBaseClass !== ZeroBaseClass) {
        if (baseClass) {
          if (baseClass !== currentBaseClass) {
            const currentIsSub = currentBaseClass.prototype.isPrototypeOf(baseClass.prototype);
            const currentIsSuper = baseClass.prototype.isPrototypeOf(currentBaseClass.prototype);
            if (!currentIsSub && !currentIsSuper)
              throw new Error("Base class mismatch");
            baseClass = currentIsSuper ? currentBaseClass : baseClass;
          }
        } else
          baseClass = currentBaseClass;
      }
      requirements.push(mixinState2);
    } else {
      if (index !== required.length - 1)
        throw new Error("Base class should be provided as the last element of the requirements array");
    }
  });
  const mixinState = MixinState.new({
    requirements,
    mixinLambda,
    baseClass: baseClass || ZeroBaseClass
  });
  return mixinState.minimalClass;
};
var isInstanceOfStatic = function(instance) {
  return Boolean(instance && instance[this[MixinInstanceOfProperty]]);
};
var isInstanceOf = (instance, func) => {
  return Boolean(instance && instance[func[MixinInstanceOfProperty]]);
};
var Mixin = mixin;
var MixinAny = mixin;

// ../chronograph/src/class/Base.js
var Base2 = class {
  /**
   * This method applies its 1st argument (if any) to the current instance using `Object.assign()`.
   *
   * Supposed to be overridden in the subclasses to customize the instance creation process.
   *
   * @param props
   */
  initialize(props) {
    props && Object.assign(this, props);
  }
  /**
   * This is a type-safe static constructor method, accepting a single argument, with the object, corresponding to the
   * class properties. It will generate a compilation error, if unknown property is provided.
   *
   * For example:
   *
   * ```ts
   * class MyClass extends Base {
   *     prop     : string
   * }
   *
   * const instance : MyClass = MyClass.new({ prop : 'prop', wrong : 11 })
   * ```
   *
   * will produce:
   *
   * ```plaintext
   * TS2345: Argument of type '{ prop: string; wrong: number; }' is not assignable to parameter of type 'Partial<MyClass>'.
   * Object literal may only specify known properties, and 'wrong' does not exist in type 'Partial<MyClass>'
   * ```
   *
   * The only thing this constructor does is create an instance and call the [[initialize]] method on it, forwarding
   * the first argument. The customization of instance is supposed to be performed in that method.
   *
   * @param props
   */
  static new(props) {
    const instance = new this();
    instance.initialize(props);
    return instance;
  }
};

// ../Engine/lib/Engine/quark/AbstractPartOfProjectGenericMixin.js
var AbstractPartOfProjectGenericMixin = class extends Mixin([], (base) => {
  const superProto = base.prototype;
  class AbstractPartOfProjectGenericMixin2 extends base {
    async commitAsync() {
      return this.project.commitAsync();
    }
    set project(project) {
      this.$project = project;
    }
    get project() {
      return this.$project;
    }
    calculateProject() {
      throw new Error("Implement me");
    }
    /**
     * The method to set the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    setProject(project) {
      return this.project = project;
    }
    /**
     * The method to get the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getProject() {
      if (this.project)
        return this.project;
      return this.setProject(this.calculateProject());
    }
    /**
     * Convenience method to get the instance of the assignment store in the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getAssignmentStore() {
      const project = this.getProject();
      return project == null ? void 0 : project.assignmentStore;
    }
    /**
     * Convenience method to get the instance of the dependency store in the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getDependencyStore() {
      const project = this.getProject();
      return project == null ? void 0 : project.dependencyStore;
    }
    /**
     * Convenience method to get the instance of the event store in the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getEventStore() {
      const project = this.getProject();
      return project == null ? void 0 : project.eventStore;
    }
    /**
     * Convenience method to get the instance of the resource store in the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getResourceStore() {
      const project = this.getProject();
      return project == null ? void 0 : project.resourceStore;
    }
    /**
     * Convenience method to get the instance of the calendar manager store in the [[AbstractProjectMixin|project]] instance, this entity belongs to.
     */
    getCalendarManagerStore() {
      const project = this.getProject();
      return project == null ? void 0 : project.calendarManagerStore;
    }
  }
  return AbstractPartOfProjectGenericMixin2;
}) {
};

// ../Engine/lib/Engine/quark/CorePartOfProjectGenericMixin.js
var CorePartOfProjectGenericMixin = class extends Mixin([AbstractPartOfProjectGenericMixin], (base) => {
  const superProto = base.prototype;
  class CorePartOfProjectGenericMixin2 extends base {
    //region Store getters
    get eventStore() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.eventStore;
    }
    get resourceStore() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.resourceStore;
    }
    get assignmentStore() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.assignmentStore;
    }
    get dependencyStore() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.dependencyStore;
    }
    get calendarManagerStore() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.calendarManagerStore;
    }
    //endregion
    //region Entity getters
    /**
     * Convenience method to get the instance of event by its id.
     */
    getEventById(id) {
      var _a;
      return (_a = this.eventStore) == null ? void 0 : _a.getById(id);
    }
    /**
     * Convenience method to get the instance of dependency by its id.
     */
    getDependencyById(id) {
      var _a;
      return (_a = this.dependencyStore) == null ? void 0 : _a.getById(id);
    }
    /**
     * Convenience method to get the instance of resource by its id.
     */
    getResourceById(id) {
      var _a;
      return (_a = this.resourceStore) == null ? void 0 : _a.getById(id);
    }
    /**
     * Convenience method to get the instance of assignment by its id.
     */
    getAssignmentById(id) {
      var _a;
      return (_a = this.assignmentStore) == null ? void 0 : _a.getById(id);
    }
    /**
     * Convenience method to get the instance of calendar by its id.
     */
    getCalendarById(id) {
      var _a;
      return (_a = this.calendarManagerStore) == null ? void 0 : _a.getById(id);
    }
  }
  return CorePartOfProjectGenericMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/mixin/AbstractPartOfProjectStoreMixin.js
var AbstractPartOfProjectStoreMixin = class extends Mixin([
  AbstractPartOfProjectGenericMixin,
  Store
], (base) => {
  const superProto = base.prototype;
  class AbstractPartOfProjectStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.isLoadingData = false;
      this.disableHasLoadedDataToCommitFlag = false;
    }
    static get $name() {
      return "AbstractPartOfProjectStoreMixin";
    }
    //region Async event triggering
    // NOTE: Tested in Scheduler (EventStore.t.js)
    construct(config = {}) {
      config.asyncEvents = {
        add: true,
        remove: true,
        removeAll: true,
        change: true,
        refresh: true,
        replace: true,
        move: true,
        update: true
      };
      return superProto.construct.call(this, config);
    }
    // Override for event triggering, to allow triggering events before and after some async operation.
    // The "before" events are prefix, the "after" are not.
    trigger(eventName, param) {
      const me = this, { asyncEvents, project } = me, asyncEvent = asyncEvents == null ? void 0 : asyncEvents[eventName], asyncAction = asyncEvent && (asyncEvent === true || asyncEvent[param.action]);
      if (!asyncAction) {
        return superProto.trigger.call(me, eventName, param);
      }
      superProto.trigger.call(me, `${eventName}PreCommit`, { ...param });
      if (!project || project.isEngineReady() && !project.isWritingData) {
        superProto.trigger.call(me, eventName, param);
      } else if (!me.eventsSuspended && project) {
        if (!project.dataReadyDetacher) {
          project.queuedDataReadyEvents = [];
          project.dataReadyDetacher = project.ion({
            dataReady() {
              this.queuedDataReadyEvents.forEach(([superProto2, scope, eventName2, param2]) => {
                superProto2.trigger.call(scope, eventName2, param2);
              });
              project.queuedDataReadyEvents = null;
              project.dataReadyDetacher();
              project.dataReadyDetacher = null;
            },
            once: true
          });
        }
        project.queuedDataReadyEvents.push([superProto, me, eventName, param]);
      }
      return true;
    }
    //endregion
    calculateProject() {
      return this.project;
    }
    setStoreData(data) {
      var _a;
      if (this.project && !(this.syncDataOnLoad || this.disableHasLoadedDataToCommitFlag)) {
        this.project.hasLoadedDataToCommit = true;
      }
      this.isLoadingData = true;
      superProto.setStoreData.call(this, data);
      this.isLoadingData = false;
      (_a = this.project) == null ? void 0 : _a.trigger("storeRefresh", { store: this });
    }
    // Override to postpone auto commits to after project commit, makes sure records are unmodified after commit
    async doAutoCommit() {
      if (this.suspendCount <= 0 && this.project && !this.project.isEngineReady()) {
        await this.project.commitAsync();
      }
      superProto.doAutoCommit.call(this);
    }
    async addAsync(records, silent) {
      const result = this.add(records, silent);
      await this.project.commitAsync();
      return result;
    }
    async insertAsync(index, records, silent) {
      const result = this.insert(index, records, silent);
      await this.project.commitAsync();
      return result;
    }
    async loadDataAsync(data) {
      this.data = data;
      await this.project.commitAsync();
    }
    performFilter() {
      var _a;
      if (this.project && (this.isLoadingData || ((_a = this.rootNode) == null ? void 0 : _a.isLoading))) {
        this.project.commitAsync().then(() => this.filter());
      }
      return super.performFilter(...arguments);
    }
  }
  return AbstractPartOfProjectStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/mixin/AbstractPartOfProjectModelMixin.js
var AbstractPartOfProjectModelMixin = class extends Mixin([AbstractPartOfProjectGenericMixin, Model], (base) => {
  const superProto = base.prototype;
  class AbstractPartOfProjectModelMixin2 extends base {
    joinStore(store) {
      let joinedProject = null;
      if (isInstanceOf(store, AbstractPartOfProjectStoreMixin)) {
        const project = store.getProject();
        if (project && !this.getProject()) {
          this.setProject(project);
          joinedProject = project;
        }
      }
      superProto.joinStore.call(this, store);
      if (joinedProject && !joinedProject.isRepopulatingStores)
        this.joinProject();
    }
    unjoinStore(store, isReplacing = false) {
      superProto.unjoinStore.call(this, store, isReplacing);
      const { project } = this;
      const isLeavingProjectStore = isInstanceOf(store, AbstractPartOfProjectStoreMixin) && !store.isFillingFromMaster && project === (store.isChained && store.project ? store.masterStore.project : store.project);
      if (project && !project.isDestroying && !project.isRepopulatingStores && isLeavingProjectStore) {
        this.leaveProject(isReplacing);
        this.setProject(null);
      }
      if (isLeavingProjectStore)
        this.graph = null;
    }
    /**
     * Template method, which is called when model is joining the project (through joining some store that
     * has already joined the project)
     */
    joinProject() {
    }
    /**
     * Template method, which is called when model is leaving the project (through leaving some store usually)
     */
    leaveProject(isReplacing = false) {
    }
    calculateProject() {
      const store = this.stores.find((s) => isInstanceOf(s, AbstractPartOfProjectStoreMixin) && !!s.getProject());
      return store == null ? void 0 : store.getProject();
    }
    async setAsync(fieldName, value, silent) {
      var _a;
      const result = this.set(fieldName, value, silent);
      await ((_a = this.project) == null ? void 0 : _a.commitAsync());
      return result;
    }
    async getAsync(fieldName) {
      var _a;
      await ((_a = this.project) == null ? void 0 : _a.commitAsync());
      return this.get(fieldName);
    }
    get isStmRestoring() {
      const project = this.getProject();
      return (project == null ? void 0 : project.isRestoringData) || (project == null ? void 0 : project.stm.isRestoring) || false;
    }
  }
  return AbstractPartOfProjectModelMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/mixin/CorePartOfProjectModelMixin.js
var CorePartOfProjectModelMixin = class extends Mixin([
  AbstractPartOfProjectModelMixin,
  CorePartOfProjectGenericMixin,
  Model
], (base) => {
  const superProto = base.prototype;
  class CorePartOfProjectModelMixin2 extends base {
    constructor() {
      super(...arguments);
      this.$isCalculating = false;
      this.$changed = {};
      this.$beforeChange = {};
    }
    get isInActiveTransaction() {
      return true;
    }
    // Invalidate record upon joining project, leads to a buffered commit
    joinProject() {
      this.invalidate();
    }
    // Trigger a buffered commit when leaving the project
    leaveProject(isReplacing = false) {
      var _a;
      superProto.leaveProject.call(this, isReplacing);
      (_a = this.project) == null ? void 0 : _a.bufferedCommitAsync();
    }
    /**
     * Invalidates this record, queueing it for calculation on project commit.
     */
    invalidate() {
      var _a;
      (_a = this.project) == null ? void 0 : _a.invalidate(this);
    }
    /**
     * Used to retrieve the proposed (before 'dataReady') or current (after 'dataReady') value for a field.
     * If there is no proposed change, it is functionally equal to a normal `record.get()` call.
     */
    getCurrentOrProposed(fieldName) {
      var _a;
      if (fieldName in this.$changed && this.$changed[fieldName] !== true) {
        return this.$changed[fieldName];
      }
      return (_a = this.get(fieldName)) != null ? _a : null;
    }
    /**
     * Determines if the specified field has a value or not, value can be either current or proposed.
     */
    hasCurrentOrProposed(fieldName) {
      return fieldName in this.$changed && this.$changed[fieldName] != true || this.get(fieldName) != null;
    }
    /**
     * Propose changes, to be considered during calculation. Also invalidates the record.
     */
    propose(changes) {
      var _a;
      if (this.project || ((_a = this.recurringTimeSpan) == null ? void 0 : _a.project)) {
        const keys = Object.keys(changes);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          this.$changed[key] = changes[key];
        }
        this.invalidate();
      } else {
        this.set(changes);
      }
    }
    /**
     * Similar to propose, but with more options. Mostly used by buckets, since they need data to update early.
     */
    setChanged(field, value, invalidate = true, setData = false) {
      const me = this;
      me.$changed[field] = value;
      if (setData) {
        if (!(field in me.$beforeChange)) {
          me.$beforeChange[field] = me.get(field);
        }
        me.setData(field, value);
      }
      invalidate && me.invalidate();
    }
    /**
     * Hook called before project refresh, override and calculate required changes in subclasses
     */
    calculateInvalidated() {
    }
    /**
     * Called after project refresh, before dataReady. Announce updated data
     */
    finalizeInvalidated(silent = false) {
      const me = this;
      me.$isCalculating = true;
      if (!silent) {
        me.setData(me.$beforeChange);
        me.set(me.$changed);
      } else {
        me.setData(me.$changed);
      }
      me.$changed = {};
      me.$beforeChange = {};
      me.$isCalculating = false;
    }
  }
  return CorePartOfProjectModelMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreResourceMixin.js
var CoreResourceMixin = class extends Mixin([CorePartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CoreResourceMixin2 extends base {
    get assigned() {
      var _a;
      return (_a = this.project) == null ? void 0 : _a.assignmentStore.getResourcesAssignments(this);
    }
    joinProject() {
      var _a;
      if (this.resourceStore && !this.resourceStore.isLoadingData) {
        (_a = this.assignmentStore) == null ? void 0 : _a.query((a) => a.get("resource") === this.id).forEach((unresolved) => unresolved.setChanged("resource", this));
      }
      superProto.joinProject.call(this);
    }
    leaveProject(isReplacing = false) {
      var _a;
      if (this.assigned && !isReplacing && !((_a = this.resourceStore) == null ? void 0 : _a.isLoadingData)) {
        const resourceStore = this.resourceStore;
        this.assigned.forEach((assignment) => resourceStore.assignmentsForRemoval.add(assignment));
      }
      superProto.leaveProject.call(this);
    }
    applyValue(useProp, key, value, skipAccessor, field) {
      if ((field == null ? void 0 : field.name) === "id") {
        this.assigned.forEach((assignment) => {
          assignment.set("resourceId", value);
        });
      }
      superProto.applyValue.call(this, useProp, key, value, skipAccessor, field);
    }
  }
  return CoreResourceMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/model/ResourceModel.js
var EngineMixin = CoreResourceMixin;
var ResourceModel = class extends ResourceModelMixin_default(PartOfProject_default(EngineMixin.derive(GridRowModel))) {
};
/**
 * Get associated events
 *
 * @member {Scheduler.model.EventModel[]} events
 * @readonly
 * @category Common
 */
__publicField(ResourceModel, "$name", "ResourceModel");
ResourceModel.exposeProperties();
ResourceModel._$name = "ResourceModel";

// ../Scheduler/lib/Scheduler/data/mixin/PartOfBaseProject.js
var PartOfBaseProject_default = (Target) => class PartOfBaseProject extends Target {
  static get $name() {
    return "PartOfBaseProject";
  }
  get assignmentStore() {
    return this.project.assignmentStore;
  }
  get calendarManagerStore() {
    return this.project.calendarManagerStore;
  }
  get dependencyStore() {
    return this.project.dependencyStore;
  }
  get eventStore() {
    return this.project.eventStore;
  }
  get resourceStore() {
    return this.project.resourceStore;
  }
};

// ../Engine/lib/Engine/quark/store/mixin/CorePartOfProjectStoreMixin.js
var CorePartOfProjectStoreMixin = class extends Mixin([
  AbstractPartOfProjectStoreMixin,
  CorePartOfProjectGenericMixin,
  Store
], (base) => {
  const superProto = base.prototype;
  class CorePartOfProjectStoreMixin2 extends base {
    setProject(project) {
      const result = superProto.setProject.call(this, project);
      if (project)
        this.joinProject(project);
      return result;
    }
    joinProject(project) {
    }
    onCommitAsync() {
    }
  }
  return CorePartOfProjectStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/AbstractResourceStoreMixin.js
var dataAddRemoveActions = {
  splice: 1,
  clear: 1
};
var AbstractResourceStoreMixin = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class AbstractResourceStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.assignmentsForRemoval = /* @__PURE__ */ new Set();
    }
    // we need `onDataChange` for `syncDataOnLoad` option to work
    onDataChange(event) {
      var _a;
      const isAddRemove = dataAddRemoveActions[event.action];
      super.onDataChange(event);
      if (isAddRemove && ((_a = event.removed) == null ? void 0 : _a.length))
        this.afterResourceRemoval();
    }
    // it seems `onDataChange` is not triggered for `remove` with `silent` flag
    remove(records, silent) {
      const res = superProto.remove.call(this, records, silent);
      this.afterResourceRemoval();
      return res;
    }
    // it seems `onDataChange` is not triggered for `TreeStore#removeAll()`
    removeAll(silent) {
      const res = superProto.removeAll.call(this, silent);
      this.afterResourceRemoval();
      return res;
    }
    afterResourceRemoval() {
      const assignmentStore = this.getAssignmentStore();
      if (assignmentStore && !assignmentStore.allAssignmentsForRemoval) {
        const assignmentsForRemoval = [...this.assignmentsForRemoval].filter((assignment) => !assignmentStore.assignmentsForRemoval.has(assignment));
        assignmentsForRemoval.length > 0 && assignmentStore.remove(assignmentsForRemoval);
      }
      this.assignmentsForRemoval.clear();
    }
    processRecord(resourceRecord, isDataset = false) {
      const existingRecord = this.getById(resourceRecord.id);
      const isReplacing = existingRecord && existingRecord !== resourceRecord;
      if (isReplacing) {
        for (const assignment of existingRecord.assigned || []) {
          assignment.resource = resourceRecord;
        }
      }
      return resourceRecord;
    }
  }
  return AbstractResourceStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/CoreResourceStoreMixin.js
var CoreResourceStoreMixin = class extends Mixin([AbstractResourceStoreMixin, CorePartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CoreResourceStoreMixin2 extends base {
    static get defaultConfig() {
      return {
        modelClass: CoreResourceMixin
      };
    }
    joinProject() {
      var _a;
      (_a = this.assignmentStore) == null ? void 0 : _a.linkAssignments(this, "resource");
    }
    afterLoadData() {
      var _a;
      (_a = this.assignmentStore) == null ? void 0 : _a.linkAssignments(this, "resource");
    }
    clear(removing) {
      var _a;
      superProto.clear.call(this, removing);
      (_a = this.assignmentStore) == null ? void 0 : _a.unlinkAssignments("resource");
    }
  }
  return CoreResourceStoreMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/data/ResourceStore.js
var EngineMixin2 = PartOfProject_default(CoreResourceStoreMixin.derive(AjaxStore));
var ResourceStore = class extends ResourceStoreMixin_default(EngineMixin2) {
  static get defaultConfig() {
    return {
      modelClass: ResourceModel
    };
  }
};
ResourceStore._$name = "ResourceStore";

// ../Scheduler/lib/Scheduler/data/mixin/EventStoreMixin.js
var EventStoreMixin_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    /**
     * Add events to the store.
     *
     * NOTE: Dates, durations and references (assignments, resources) on the events are determined async by a calculation
     * engine. Thus they cannot be directly accessed after using this function.
     *
     * For example:
     *
     * ```javascript
     * eventStore.add({ startDate, duration });
     * // endDate is not yet calculated
     * ```
     *
     * To guarantee data is in a calculated state, wait for calculations for finish:
     *
     * ```javascript
     * eventStore.add({ startDate, duration });
     * await eventStore.project.commitAsync();
     * // endDate is calculated
     * ```
     *
     * Alternatively use `addAsync()` instead:
     *
     * ```javascript
     * await eventStore.addAsync({ startDate, duration });
     * // endDate is calculated
     * ```
     *
     * @param {Scheduler.model.EventModel|Scheduler.model.EventModel[]|EventModelConfig|EventModelConfig[]} records
     * Array of records/data or a single record/data to add to store
     * @param {Boolean} [silent] Specify `true` to suppress events
     * @returns {Scheduler.model.EventModel[]} Added records
     * @function add
     * @category CRUD
     */
    /**
     * Add events to the store and triggers calculations directly after. Await this function to have up to date data on
     * the added events.
     *
     * ```javascript
     * await eventStore.addAsync({ startDate, duration });
     * // endDate is calculated
     * ```
     *
     * @param {Scheduler.model.EventModel|Scheduler.model.EventModel[]|EventModelConfig|EventModelConfig[]} records
     * Array of records/data or a single record/data to add to store
     * @param {Boolean} [silent] Specify `true` to suppress events
     * @returns {Scheduler.model.EventModel[]} Added records
     * @function addAsync
     * @category CRUD
     * @async
     */
    /**
     * Applies a new dataset to the EventStore. Use it to plug externally fetched data into the store.
     *
     * NOTE: Dates, durations and relations (assignments, resources) on the events are determined async by a calculation
     * engine. Thus they cannot be directly accessed after assigning the new dataset.
     *
     * For example:
     *
     * ```javascript
     * eventStore.data = [{ startDate, duration }];
     * // eventStore.first.endDate is not yet calculated
     * ```
     *
     * To guarantee data is in a calculated state, wait for calculations for finish:
     *
     * ```javascript
     * eventStore.data = [{ startDate, duration }];
     * await eventStore.project.commitAsync();
     * // eventStore.first.endDate is calculated
     * ```
     *
     * Alternatively use `loadDataAsync()` instead:
     *
     * ```javascript
     * await eventStore.loadDataAsync([{ startDate, duration }]);
     * // eventStore.first.endDate is calculated
     * ```
     *
     * @member {EventModelConfig[]} data
     * @category Records
     */
    /**
     * Applies a new dataset to the EventStore and triggers calculations directly after. Use it to plug externally
     * fetched data into the store.
     *
     * ```javascript
     * await eventStore.loadDataAsync([{ startDate, duration }]);
     * // eventStore.first.endDate is calculated
     * ```
     *
     * @param {EventModelConfig[]} data Array of EventModel data objects
     * @function loadDataAsync
     * @category CRUD
     * @async
     */
    /**
     * Class used to represent records. Defaults to class EventModel.
     * @member {Scheduler.model.EventModel} modelClass
     * @typings {typeof EventModel}
     * @category Records
     */
    static get defaultConfig() {
      return {
        /**
         * CrudManager must load stores in the correct order. Lowest first.
         * @private
         */
        loadPriority: 100,
        /**
         * CrudManager must sync stores in the correct order. Lowest first.
         * @private
         */
        syncPriority: 200,
        storeId: "events",
        /**
         * Configure with `true` to also remove the event when removing the last assignment from the linked
         * AssignmentStore. This config has not effect when using EventStore in legacy `resourceId`-mode.
         * @config {Boolean}
         * @default
         * @category Common
         */
        removeUnassignedEvent: true,
        /**
         * Configure with `true` to force single-resource mode, an event can only be assigned to a single resource.
         * If not provided, the mode will be inferred from
         *
         * 1. presence of an assignment store (i.e. multi-assignment)
         * 2. presence of `resourceId` in the event store data (i.e. single assignment mode)
         * @config {Boolean}
         * @category Common
         */
        singleAssignment: null
      };
    }
    //region Init & destroy
    construct(config) {
      super.construct(config);
      this.autoTree = true;
      if (this.singleAssignment) {
        this.usesSingleAssignment = true;
      }
      if (!this.modelClass.isEventModel) {
        throw new Error("The model for the EventStore must subclass EventModel");
      }
    }
    //endregion
    //region Events records, iteration etc.
    set filtersFunction(filtersFunction) {
      super.filtersFunction = filtersFunction;
    }
    get filtersFunction() {
      const result = super.filtersFunction;
      if (result && result !== FunctionHelper.returnTrue) {
        return (r) => r.isCreating || result(r);
      }
      return result;
    }
    /**
     * Returns a `Map`, keyed by `YYYY-MM-DD` date keys containing event counts for all the days
     * between the passed `startDate` and `endDate`. Occurrences of recurring events are included.
     *
     * Example:
     *
     * ```javascript
     *  eventCounts = eventStore.getEventCounts({
     *      startDate : scheduler.timeAxis.startDate,
     *      endDate   : scheduler.timeAxis.endDate
     *  });
     * ```
     *
     * @param {Object} options An options object determining which events to return
     * @param {Date} options.startDate The start date for the range of events to include.
     * @param {Date} [options.endDate] The end date for the range of events to include.
     * @category Events
     */
    getEventCounts(options) {
      const me = this, {
        filtersFunction,
        added
      } = me, result = me.getEvents({
        ...options,
        storeFilterFn: me.isFiltered ? me.reapplyFilterOnAdd ? filtersFunction : (eventRecord) => added.includes(eventRecord) ? me.indexOf(eventRecord) > -1 : filtersFunction(eventRecord) : null,
        dateMap: options.dateMap || true
      });
      result.forEach((value, key) => result.set(key, value.length));
      return result;
    }
    /**
     * Calls the supplied iterator function once for every scheduled event, providing these arguments
     * - event : the event record
     * - startDate : the event start date
     * - endDate : the event end date
     *
     * Returning false cancels the iteration.
     *
     * @param {Function} fn iterator function
     * @param {Object} [thisObj] `this` reference for the function
     * @category Events
     */
    forEachScheduledEvent(fn2, thisObj = this) {
      this.forEach((event) => {
        const { startDate, endDate } = event;
        if (startDate && endDate) {
          return fn2.call(thisObj, event, startDate, endDate);
        }
      });
    }
    /**
     * Returns an object defining the earliest start date and the latest end date of all the events in the store.
     *
     * @returns {Object} An object with 'startDate' and 'endDate' properties (or null values if data is missing).
     * @category Events
     */
    getTotalTimeSpan() {
      let earliest = new Date(9999, 0, 1), latest = /* @__PURE__ */ new Date(0);
      this.forEach((event) => {
        if (event.startDate) {
          earliest = DateHelper.min(event.startDate, earliest);
        }
        if (event.endDate) {
          latest = DateHelper.max(event.endDate, latest);
        }
      });
      earliest = earliest < new Date(9999, 0, 1) ? earliest : null;
      latest = latest > /* @__PURE__ */ new Date(0) ? latest : null;
      return this.lastTotalTimeSpan = {
        startDate: earliest || null,
        endDate: latest || earliest || null
      };
    }
    /**
     * Checks if given event record is persistable. By default it always is, override EventModels `isPersistable` if you
     * need custom logic.
     *
     * @param {Scheduler.model.EventModel} event
     * @returns {Boolean}
     * @category Events
     */
    isEventPersistable(event) {
      return event.isPersistable;
    }
    //endregion
    //region Resource
    /**
     * Checks if a date range is allocated or not for a given resource.
     *
     * Note that when asked to check a 0 duration range, any 0 duration events at the same point in time will be
     * considered overlapping.
     *
     * @param {Date} start The start date
     * @param {Date} end The end date
     * @param {Scheduler.model.EventModel|null} excludeEvent An event to exclude from the check (or null)
     * @param {Scheduler.model.ResourceModel} resource The resource
     * @returns {Boolean} True if the timespan is available for the resource
     * @category Resource
     */
    isDateRangeAvailable(start, end, excludeEvent, resource) {
      if (resource.data.generatedParent) {
        return false;
      }
      const allEvents = new Set(this.getEventsForResource(resource));
      if (excludeEvent == null ? void 0 : excludeEvent.isAssignment) {
        const currentEvent = excludeEvent.event, resources = currentEvent.resources;
        resources.forEach((resource2) => {
          if (resource2.id !== excludeEvent.resourceId) {
            this.getEventsForResource(resource2).forEach((event) => allEvents.add(event));
          }
        });
      }
      if (excludeEvent) {
        const eventToRemove = excludeEvent.isAssignment ? excludeEvent.event : excludeEvent;
        allEvents.delete(eventToRemove);
      }
      const all = Array.from(allEvents);
      if (start.getTime() === end.getTime()) {
        return !all.some(
          (event) => event.isScheduled && (event.duration === 0 ? event.startDate.getTime() === start.getTime() : DateHelper.intersectSpans(start, end, event.startDate, event.endDate))
        );
      }
      return !all.some((event) => event.isScheduled && DateHelper.intersectSpans(start, end, event.startDate, event.endDate));
    }
    /**
     * Filters the events associated with a resource, based on the function provided. An array will be returned for those
     * events where the passed function returns true.
     * @param {Scheduler.model.ResourceModel} resource
     * @param {Function} fn The function
     * @param {Object} [thisObj] `this` reference for the function
     * @returns {Scheduler.model.EventModel[]} the events in the time span
     * @private
     * @category Resource
     */
    filterEventsForResource(resource, fn2, thisObj = this) {
      return resource.getEvents(this).filter(fn2.bind(thisObj));
    }
    /**
     * Returns all resources assigned to an event.
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @returns {Scheduler.model.ResourceModel[]}
     * @category Resource
     */
    getResourcesForEvent(event) {
      if (event.isOccurrence) {
        event = event.recurringTimeSpan;
      }
      return this.assignmentStore.getResourcesForEvent(event);
    }
    /**
     * Returns all events assigned to a resource.
     * *NOTE:* this does not include occurrences of recurring events. Use the
     * {@link Scheduler/data/mixin/GetEventsMixin#function-getEvents} API to include occurrences of recurring events.
     * @param {Scheduler.model.ResourceModel|String|Number} resource Resource or resource id.
     * @returns {Scheduler.model.EventModel[]}
     * @category Resource
     */
    getEventsForResource(resource) {
      return this.assignmentStore.getEventsForResource(resource);
    }
    //endregion
    //region Assignment
    /**
     * Returns all assignments for a given event.
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @returns {Scheduler.model.AssignmentModel[]}
     * @category Assignment
     */
    getAssignmentsForEvent(event) {
      return this.assignmentStore.getAssignmentsForEvent(event) || [];
    }
    /**
     * Returns all assignments for a given resource.
     *
     * @param {Scheduler.model.ResourceModel|String|Number} resource
     * @returns {Scheduler.model.AssignmentModel[]}
     * @category Assignment
     */
    getAssignmentsForResource(resource) {
      return this.assignmentStore.getAssignmentsForResource(resource) || [];
    }
    /**
     * Creates and adds assignment record for a given event and a resource.
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @param {Scheduler.model.ResourceModel|String|Number|Scheduler.model.ResourceModel[]|String[]|Number[]} resource The resource(s) to assign to the event
     * @param {Boolean} [removeExistingAssignments] `true` to first remove existing assignments
     * @returns {Scheduler.model.AssignmentModel[]} An array with the created assignment(s)
     * @category Assignment
     */
    assignEventToResource(event, resource, removeExistingAssignments = false) {
      return this.assignmentStore.assignEventToResource(event, resource, void 0, removeExistingAssignments);
    }
    /**
     * Removes assignment record for a given event and a resource.
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @param {Scheduler.model.ResourceModel|String|Number} resource
     * @category Assignment
     */
    unassignEventFromResource(event, resource) {
      this.assignmentStore.unassignEventFromResource(event, resource);
    }
    /**
     * Reassigns an event from an old resource to a new resource
     *
     * @param {Scheduler.model.EventModel}    event    An event or id of the event to reassign
     * @param {Scheduler.model.ResourceModel|Scheduler.model.ResourceModel[]} oldResource A resource or id to unassign from
     * @param {Scheduler.model.ResourceModel|Scheduler.model.ResourceModel[]} newResource A resource or id to assign to
     * @category Assignment
     */
    reassignEventFromResourceToResource(event, oldResource, newResource) {
      const me = this, newResourceId = Model.asId(newResource), assignment = me.assignmentStore.getAssignmentForEventAndResource(event, oldResource);
      if (assignment) {
        assignment.resourceId = newResourceId;
      } else {
        me.assignmentStore.assignEventToResource(event, newResource);
      }
    }
    /**
     * Checks whether an event is assigned to a resource.
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @param {Scheduler.model.ResourceModel|String|Number} resource
     * @returns {Boolean}
     * @category Assignment
     */
    isEventAssignedToResource(event, resource) {
      return this.assignmentStore.isEventAssignedToResource(event, resource);
    }
    /**
     * Removes all assignments for given event
     *
     * @param {Scheduler.model.EventModel|String|Number} event
     * @category Assignment
     */
    removeAssignmentsForEvent(event) {
      this.assignmentStore.removeAssignmentsForEvent(event);
    }
    /**
     * Removes all assignments for given resource
     *
     * @param {Scheduler.model.ResourceModel|String|Number} resource
     * @category Assignment
     */
    removeAssignmentsForResource(resource) {
      this.assignmentStore.removeAssignmentsForResource(resource);
    }
    //endregion
    /**
     * Appends a new record to the store
     * @param {Scheduler.model.EventModel} record The record to append to the store
     * @category CRUD
     */
    append(record) {
      return this.add(record);
    }
    //region Project
    get project() {
      return super.project;
    }
    set project(project) {
      var _a2;
      super.project = project;
      this.detachListeners("project");
      if (project) {
        if ((_a2 = project.assignmentStore) == null ? void 0 : _a2.isAssignmentStore) {
          this.attachToAssignmentStore(project.assignmentStore);
        }
        project.ion({
          name: "project",
          assignmentStoreChange: "onProjectAssignmentStoreChange",
          thisObj: this,
          prio: 200
          // Before UI updates
        });
      }
    }
    //endregion
    //region resource ids
    get usesResourceIds() {
      var _a2, _b;
      return (_b = (_a2 = this.modelClass.fieldMap) == null ? void 0 : _a2.resourceIds.persist) != null ? _b : false;
    }
    //endregion
    //region Single assignment
    get usesSingleAssignment() {
      if (this.isChained) {
        return this.masterStore.usesSingleAssignment;
      }
      return this._usesSingleAssignment;
    }
    set usesSingleAssignment(value) {
      this._usesSingleAssignment = value;
      const { assignmentStore } = this;
      if ((assignmentStore == null ? void 0 : assignmentStore.isStore) && !assignmentStore.hasGenerateIdOverride) {
        assignmentStore.modelClass.generateId = function() {
          if (this.singleAssignmentIdCounter == null) {
            this.singleAssignmentIdCounter = 0;
          }
          return `a-${++this.singleAssignmentIdCounter}`;
        };
        assignmentStore.hasGenerateIdOverride = true;
      }
    }
    processRecords(eventRecords) {
      var _a2;
      const { assignmentStore } = this, assignmentsToAdd = [];
      if (assignmentStore) {
        assignmentStore.skipInvalidateIndices = true;
      }
      eventRecords = super.processRecords(eventRecords, assignmentStore && !((_a2 = this.stm) == null ? void 0 : _a2.isRestoring) && ((eventRecord) => {
        const resourceId = eventRecord.get("resourceId");
        if (!eventRecord.reassignedFromReplace && resourceId != null) {
          if (!assignmentStore.includesAssignment(eventRecord.id, resourceId)) {
            assignmentsToAdd.push({
              id: assignmentStore.modelClass.generateId(""),
              resourceId,
              eventId: eventRecord.id
            });
          }
        }
        eventRecord.reassignedFromReplace = false;
      }) || void 0);
      if (assignmentStore) {
        assignmentStore.storage.invalidateIndices();
        assignmentStore.skipInvalidateIndices = false;
        assignmentStore.add(assignmentsToAdd);
      }
      return eventRecords;
    }
    joinRecordsToStore(records) {
      const { assignmentStore } = this;
      if (assignmentStore) {
        assignmentStore.skipInvalidateIndices = true;
        super.joinRecordsToStore(records);
        assignmentStore.storage.invalidateIndices();
        assignmentStore.skipInvalidateIndices = false;
      } else {
        super.joinRecordsToStore(records);
      }
    }
    processRecord(eventRecord, isDataset = false) {
      var _a2, _b;
      eventRecord = super.processRecord(eventRecord, isDataset);
      const me = this, assignmentStore = (_b = me.assignmentStore) != null ? _b : (_a2 = me.crudManager) == null ? void 0 : _a2.assignmentStore, resourceId = eventRecord.get("resourceId"), { resourceIds } = eventRecord;
      if ((resourceIds == null ? void 0 : resourceIds.length) && eventRecord.meta.skipEnforcingSingleAssignment !== false && me.usesResourceIds) {
        if (assignmentStore) {
          assignmentStore.add(resourceIds.filter((resourceId2) => !assignmentStore.some((a) => a.eventId === eventRecord.id && a.resourceId === resourceId2)).map((resourceId2) => ({ resource: resourceId2, event: eventRecord })));
        } else {
          me.$processResourceIds = true;
        }
      } else if (resourceId != null && !eventRecord.meta.skipEnforcingSingleAssignment) {
        const existingRecord = me.getById(eventRecord.id), isReplacing = existingRecord && existingRecord !== eventRecord && !isDataset;
        if (isReplacing) {
          const assignmentSet = assignmentStore.storage.findItem("eventId", eventRecord.id);
          if (assignmentSet == null ? void 0 : assignmentSet.size) {
            const assignment = assignmentSet.values().next().value;
            assignment.resource = resourceId;
            eventRecord.reassignedFromReplace = true;
          }
        } else {
          me.$processResourceIds = true;
        }
        me.usesSingleAssignment = true;
      }
      return eventRecord;
    }
    processResourceIds() {
      var _a2, _b, _c;
      const me = this, assignmentStore = (_b = me.assignmentStore) != null ? _b : (_a2 = me.crudManager) == null ? void 0 : _a2.assignmentStore;
      if (me.$processResourceIds && (assignmentStore == null ? void 0 : assignmentStore.isAssignmentStore) && !(((_c = me.project) == null ? void 0 : _c.isSharingAssignmentStore) && me.isChained)) {
        const assignments = [];
        me.forEach((eventRecord) => {
          const { resourceId, resourceIds, id: eventId } = eventRecord;
          if (resourceId != null) {
            assignments.push({
              id: assignmentStore.modelClass.generateId(""),
              resourceId,
              eventId
            });
          } else if (resourceIds == null ? void 0 : resourceIds.length) {
            resourceIds.forEach((rId) => {
              assignments.push({
                id: assignmentStore.modelClass.generateId(""),
                resourceId: rId,
                eventId
              });
            });
          }
        }, me, { includeFilteredOutRecords: true });
        assignmentStore.useRawData = {
          disableDefaultValue: true,
          disableDuplicateIdCheck: true,
          disableTypeConversion: true
        };
        assignmentStore.usesSingleAssignment = false;
        assignmentStore.verifyNoGeneratedIds = false;
        assignmentStore.data = assignments;
        assignmentStore.usesSingleAssignment = true;
        me.$processResourceIds = false;
      }
    }
    loadData() {
      super.loadData(...arguments);
      this.processResourceIds();
    }
    // Optionally remove unassigned events
    onBeforeRemoveAssignment({ records }) {
      var _a2;
      const me = this;
      if (me.removeUnassignedEvent && !me.isRemoving && !me.isSettingData && !((_a2 = me.stm) == null ? void 0 : _a2.isRestoring) && !me.usesSingleAssignment && // Do not remove unassigned events when syncing data, new assignments etc. might be synced afterwards
      !me.assignmentStore.isSyncingDataOnLoad && !me.resourceStore.isSyncingDataOnLoad) {
        const toRemove = /* @__PURE__ */ new Set();
        records.forEach((assignmentRecord) => {
          const { event } = assignmentRecord;
          if (event && !event.isRemoved && event.assignments.every((a) => records.includes(a))) {
            toRemove.add(event);
          }
        });
        if (toRemove.size) {
          me.remove([...toRemove]);
        }
      }
    }
    onProjectAssignmentStoreChange({ store }) {
      this.attachToAssignmentStore(store);
    }
    attachToAssignmentStore(assignmentStore) {
      const me = this;
      me.detachListeners("assignmentStore");
      if (assignmentStore) {
        me.processResourceIds();
        assignmentStore.ion({
          name: "assignmentStore",
          // Adding an assignment in single assignment mode should set events resourceId if needed,
          // otherwise it should set events resourceIds (if persistable)
          addPreCommit({ records }) {
            if (!me.isSettingData && !me.isAssigning) {
              if (me.usesSingleAssignment) {
                records.forEach((assignment) => {
                  const { event } = assignment;
                  if ((event == null ? void 0 : event.isEvent) && event.resourceId !== assignment.resourceId) {
                    event.meta.isAssigning = true;
                    event.set("resourceId", assignment.resourceId);
                    event.meta.isAssigning = false;
                  }
                });
              } else if (me.usesResourceIds) {
                records.forEach((assignment) => {
                  var _a2;
                  const { event } = assignment;
                  if (event == null ? void 0 : event.isEvent) {
                    event.meta.isAssigning = true;
                    const resourceIds = (_a2 = event.resourceIds) != null ? _a2 : [];
                    if (!resourceIds.includes(assignment.resourceId)) {
                      event.resourceIds = [...resourceIds, assignment.resourceId];
                    }
                    event.meta.isAssigning = false;
                  }
                });
              }
            }
          },
          // Called both for remove and removeAll
          beforeRemove: "onBeforeRemoveAssignment",
          // Removing an assignment in single assignment mode should set events resourceId to null,
          // otherwise it should set events resourceIds to an empty array
          removePreCommit({ records }) {
            if (!me.isSettingData && !me.isAssigning) {
              if (me.usesSingleAssignment) {
                records.forEach((assignment) => {
                  var _a2;
                  (_a2 = me.getById(assignment.eventId)) == null ? void 0 : _a2.set("resourceId", null);
                });
              } else if (me.usesResourceIds) {
                records.forEach(({ event, resourceId }) => {
                  const resourceIds = event.resourceIds.slice(), indexToRemove = resourceIds == null ? void 0 : resourceIds.indexOf(resourceId);
                  if (indexToRemove >= 0) {
                    resourceIds.splice(indexToRemove, 1);
                    event.resourceIds = resourceIds;
                  }
                });
              }
            }
          },
          removeAllPreCommit() {
            if (!me.isSettingData && !me.isAssigning) {
              if (me.usesSingleAssignment) {
                me.allRecords.forEach((eventRecord) => eventRecord.set("resourceId", null));
              } else if (me.usesResourceIds) {
                me.allRecords.forEach((eventRecord) => {
                  eventRecord.resourceIds = [];
                });
              }
            }
          },
          // Keep events resourceId and resourceIds in sync with assignment on changes
          update({ record, changes }) {
            if ("resourceId" in changes) {
              const { event } = record;
              if (me.usesSingleAssignment) {
                event.meta.isAssigning = true;
                event.set("resourceId", changes.resourceId.value);
                event.meta.isAssigning = false;
              } else if (me.usesResourceIds) {
                event.meta.isAssigning = true;
                const resourceIds = event.resourceIds.slice(), indexToRemove = resourceIds == null ? void 0 : resourceIds.indexOf(changes.resourceId.oldValue);
                if (indexToRemove >= 0) {
                  resourceIds.splice(indexToRemove, 1);
                }
                if (!(resourceIds == null ? void 0 : resourceIds.includes(changes.resourceId.value))) {
                  resourceIds.push(changes.resourceId.value);
                  event.resourceIds = resourceIds;
                }
                event.meta.isAssigning = false;
              }
            }
          },
          // Keep events resourceIds in sync with assignment on dataset loading
          change({ action, records }) {
            if (action === "dataset" && me.usesResourceIds) {
              records.forEach(({ event, resourceId }) => {
                var _a2;
                const resourceIds = (_a2 = event.resourceIds) != null ? _a2 : [];
                if (!resourceIds.includes(resourceId)) {
                  resourceIds.push(resourceId);
                  event.meta.isAssigning = true;
                  event.setData("resourceIds", resourceIds);
                  event.meta.isAssigning = false;
                }
              });
            }
          },
          thisObj: me
        });
      }
    }
    set data(data) {
      this.isSettingData = true;
      if (this.usesSingleAssignment && !this.syncDataOnLoad && !this.isChained) {
        this.assignmentStore.removeAll(true);
      }
      super.data = data;
      this.isSettingData = false;
    }
    // Override trigger to decorate update/change events with a flag if resourceId was the only thing changed, in which
    // case the change most likely can be ignored since the assignment will also change
    trigger(eventName, params) {
      var _a2;
      const { changes } = params || {};
      if (changes && "resourceId" in changes && Object.keys(changes).length === 1 && !((_a2 = this.stm) == null ? void 0 : _a2.isRestoring)) {
        params.isAssign = true;
      }
      return super.trigger(...arguments);
    }
    remove(records, ...args) {
      var _a2, _b;
      const result = super.remove(records, ...args);
      if (result.length && this.usesSingleAssignment) {
        for (const eventRecord of result) {
          if (!eventRecord.isOccurrence) {
            (_b = this.assignmentStore || ((_a2 = this.crudManager) == null ? void 0 : _a2.assignmentStore)) == null ? void 0 : _b.remove(eventRecord.assignments, true);
          }
        }
      }
      return result;
    }
    //endregion
  }, __publicField(_a, "$name", "EventStoreMixin"), _a;
};

// ../Scheduler/lib/Scheduler/data/mixin/GetEventsMixin.js
var returnTrue = () => true;
var notRecurring = (event) => !event.isRecurring;
var GetEventsMixin_default = (Target) => {
  var _a;
  return _a = class extends Target {
    /**
     * Returns an array of events for the date range specified by the `startDate` and `endDate` options.
     *
     * By default, for any date, this includes any event which *intersects* that date.
     *
     * To only include events that are fully contained *within* the date range, pass the `allowPartial`
     * option as `false`.
     *
     * By default, any occurrences of recurring events are included in the resulting array (not applicable in Gantt). If
     * that is not required, pass the `includeOccurrences` option as `false`. **Note that if `includeOccurrences` is
     * `true`, the start date and end date options are mandatory. The method must know what range of occurrences needs
     * to be generated and returned.**
     *
     * Example:
     *
     * ```javascript
     *  visibleEvents = eventStore.getEvents({
     *      resourceRecord : myResource,
     *      startDate      : scheduler.timeAxis.startDate,
     *      endDate        : scheduler.timeAxis.endDate
     *  });
     * ```
     *
     * @param {Object} options An options object determining which events to return
     * @param {Date} [options.date] If only one date is required, pass this option instead of the
     * `startDate` and `endDate` options.
     * @param {Date} options.startDate The start date for the range of events to include.
     * @param {Date} [options.endDate] The end date for the range of events to include.
     * @param {Scheduler.model.ResourceModel} [options.resourceRecord] Pass a resource to only return events assigned to
     *   this resource. Not supported when using the `dateMap` option (see below)
     * @param {Function} [options.filter] A function to filter out events which are not required.
     * @param {Boolean} [options.ignoreFilters] By default, store filters are honoured. Pass this
     * as `true` to include filtered out events.
     * @param {Boolean} [options.includeOccurrences=true] Occurrences of recurring events are included by default.
     * @param {Boolean} [options.allowPartial=true] Events which start before or after the range, but *intersect* the
     *   range are included by default.
     * @param {Boolean} [options.startOnly] Pass `true` to only include events which *start on* each date in the range.
     * @param {Boolean} [options.onlyAssigned] Pass `true` to only include events that are assigned to a resource
     * @param {Boolean|Map} [options.dateMap] Populates the passed `Map`, or if passed as `true`, creates and
     * returns a new `Map`. The keys are `YYYY-MM-DD` date strings and the entries are arrays of
     * {@link Scheduler.model.EventModel EventModel}s.
     * @returns {Scheduler.model.EventModel[]|Map} Events which match the passed configuration.
     * @category Events
     */
    getEvents({
      filter: filter2,
      date,
      startDate,
      // Events which intersect the startDate/endDate
      endDate,
      // will be returned
      startOnly,
      // Only events which start on each date will be returned
      includeOccurrences,
      // Interpolate occurrences into the returned event set
      allowPartial,
      // Include events which *intersect* the date range
      onlyAssigned = false,
      // Only include events that are assigned to a resource
      dateMap = false,
      // Return a Map keyed by date each value being an array of events
      dayTime = null,
      // Private option. Select which date index to look up events in depending on the date
      // we are examining in the date iteration process. Some callers may want to use
      // different indices depending on the stage through the date iteration.
      // See Calendar package for usage.
      getDateIndex
    }) {
      const me = this, options = arguments[0], {
        lastDateRange,
        added,
        filtersFunction
      } = me, passedFilter = filter2;
      if (onlyAssigned) {
        options.filter = passedFilter ? (e) => passedFilter(e) && e.resources.length : (e) => e.resources.length;
      }
      if (!("startDate" in options)) {
        startDate = options.startDate = date;
      }
      if (!("includeOccurrences" in options)) {
        includeOccurrences = options.includeOccurrences = true;
      }
      if (!("allowPartial" in options)) {
        allowPartial = options.allowPartial = !startOnly;
      }
      options.storeFilterFn = me.isFiltered && !options.ignoreFilters ? me.reapplyFilterOnAdd ? filtersFunction : (eventRecord) => added.includes(eventRecord) ? me.indexOf(eventRecord) > -1 : filtersFunction(eventRecord) : null;
      if (!endDate) {
        if (startDate) {
          endDate = options.endDate = DateHelper.clearTime(startDate);
          endDate.setDate(endDate.getDate() + 1);
        } else {
          if (includeOccurrences) {
            throw new Error("getEvents MUST be passed startDate and endDate if recurring occurrences are requested");
          }
          options.dateFilter = returnTrue;
        }
      }
      if (!options.dateFilter) {
        if (startOnly) {
          options.dateFilter = (e) => {
            const eventStartDate = e.hasBatchedChange("startDate") ? e.get("startDate") : e.startDate;
            return eventStartDate && !(DateHelper.clearTime(eventStartDate) - startDate);
          };
        } else if (allowPartial) {
          options.dateFilter = (e) => {
            const eventStartDate = e.hasBatchedChange("startDate") ? e.get("startDate") : e.startDate, eventEndDate = e.hasBatchedChange("endDate") ? e.get("endDate") : e.endDate || eventStartDate, isMilestone = !(eventStartDate - eventEndDate);
            return eventStartDate && (isMilestone ? DateHelper.betweenLesserEqual(eventStartDate, startDate, endDate) : DateHelper.intersectSpans(eventStartDate, eventEndDate, startDate, endDate));
          };
        } else {
          options.dateFilter = (e) => {
            const eventStartDate = e.hasBatchedChange("startDate") ? e.get("startDate") : e.startDate, eventEndDate = e.hasBatchedChange("endDate") ? e.get("endDate") : e.endDate || eventStartDate;
            return eventStartDate && eventStartDate >= startDate && eventEndDate <= endDate;
          };
        }
      }
      const newDateRange = {
        startDate,
        endDate
      };
      me.processConfiguredListeners();
      me.trigger("loadDateRange", {
        old: lastDateRange || {},
        new: Objects.clone(newDateRange),
        changed: Boolean(!lastDateRange || (lastDateRange.startDate - newDateRange.startDate || lastDateRange.endDate - newDateRange.endDate))
      });
      me.lastDateRange = Objects.clone(newDateRange);
      return dateMap ? me.getEventsAsMap(options) : me.getEventsAsArray(options);
    }
    /**
     * Internal implementation for {@link #function-getEvents} to use when not using dateMap.
     * @private
     */
    getEventsAsArray({
      filter: filter2,
      date,
      resourceRecord,
      startDate = date,
      // Events which intersect the startDate/endDate
      endDate,
      // will be returned
      startOnly,
      // Only events which start on each date will be returned
      includeOccurrences = true,
      // Interpolate occurrences into the returned event set
      dayTime = null,
      // Injected by the getEvents master method
      dateFilter,
      storeFilterFn,
      // Private option. Select which date index to look up events in depending on the date
      // we are examining in the date iteration process. Some callers may want to use
      // different indices depending on the stage through the date iteration.
      // See Calendar package for usage.
      getDateIndex
    }) {
      const me = this, events = [], count = storeFilterFn ? me.count : me.allCount;
      if (count) {
        let candidateEvents = resourceRecord ? me.getEventsForResource(resourceRecord) : null;
        if (!resourceRecord) {
          const dateIndex = me.useDayIndex(dayTime), eventSet = /* @__PURE__ */ new Set(), indexName = startOnly ? "startDate" : "date";
          me.recurringEvents.forEach((e) => {
            if (dateIndex.dayTime.startOfDay(e.startDate) <= startDate) {
              eventSet.add(e);
            }
          });
          for (const date2 = new Date(startDate); date2 < endDate; date2.setDate(date2.getDate() + 1)) {
            const coincidingEvents = dateIndex.get(getDateIndex ? getDateIndex(date2) : indexName, date2);
            coincidingEvents == null ? void 0 : coincidingEvents.forEach((e) => eventSet.add(e));
          }
          candidateEvents = [...eventSet];
        }
        if (storeFilterFn) {
          candidateEvents = candidateEvents.filter(storeFilterFn);
        }
        for (let i = 0, { length } = candidateEvents; i < length; i++) {
          const e = candidateEvents[i];
          if (includeOccurrences && e.isRecurring) {
            events.push.apply(events, e.getOccurrencesForDateRange(startDate, endDate).filter(dateFilter));
          } else if (dateFilter(e)) {
            events.push(e);
          }
        }
      }
      return filter2 ? events.filter(filter2) : events;
    }
    /**
     * Internal implementation for {@link #function-getEvents} to use when using dateMap.
     * @private
     */
    getEventsAsMap({
      filter: passedFilter,
      date,
      resourceRecord,
      // Not supported yet. Will add if ever requested.
      startDate = date,
      // Events which intersect the startDate/endDate
      endDate,
      // will be returned
      startOnly,
      // Only events which start on each date will be returned
      includeOccurrences = true,
      // Interpolate occurrences into the returned event set
      dateMap,
      // Return a Map keyed by date each value being an array of events
      dayTime = null,
      storeFilterFn,
      // Private option. Select which date index to look up events in depending on the date
      // we are examining in the date iteration process. Some callers may want to use
      // different indices depending on the stage through the date iteration.
      // See Calendar package for usage.
      getDateIndex
    }) {
      var _a2;
      const me = this;
      if (dateMap == null ? void 0 : dateMap.clear) {
        dateMap.clear();
      } else {
        dateMap = /* @__PURE__ */ new Map();
      }
      if (me.count) {
        const dateIndex = me.useDayIndex(dayTime), indexName = startOnly ? "startDate" : "date", recurringEvents = [], filter2 = (e) => (!passedFilter || passedFilter(e)) && (!storeFilterFn || storeFilterFn(e)), baseEventFilter = (e) => notRecurring(e) && filter2(e);
        dayTime = dateIndex.dayTime;
        if (resourceRecord) {
          throw new Error("Querying for events for a resource and returning a date-keyed Map is not supported");
        } else {
          (_a2 = me.recurringEvents) == null ? void 0 : _a2.forEach((e) => {
            if (dayTime.startOfDay(e.startDate) < endDate) {
              recurringEvents.push(e);
            }
          });
          for (const date2 = new Date(startDate); date2 < endDate; date2.setDate(date2.getDate() + 1)) {
            let [coincidingEvents, key] = dateIndex.get(getDateIndex ? getDateIndex(date2) : indexName, date2, true);
            if (coincidingEvents == null ? void 0 : coincidingEvents.size) {
              coincidingEvents = [...coincidingEvents].filter(baseEventFilter);
              if (coincidingEvents.length) {
                (dateMap.get(key) || dateMap.set(key, []).get(key)).push(...coincidingEvents);
              }
            }
          }
        }
        for (let i = 0, { length } = recurringEvents; i < length; i++) {
          const e = recurringEvents[i], occurrences = (includeOccurrences ? e.getOccurrencesForDateRange(startDate, endDate) : [e]).filter(filter2), lastDate = DateHelper.add(endDate, 1, "day");
          for (let bucket, i2 = 0, { length: length2 } = occurrences; i2 < length2; i2++) {
            const occurrence = occurrences[i2], date2 = dayTime.startOfDay(occurrence.startDate), indexName2 = getDateIndex ? getDateIndex(date2) : startOnly ? "startDate" : "date", lastIntersectingDate = indexName2 === "startDate" || !occurrence.durationMS ? DateHelper.add(date2, 1, "day") : DateHelper.min(occurrence.endDate || DateHelper.add(occurrence.startDate, occurrence.duration, occurrence.durationUnit), lastDate);
            for (; date2 < lastIntersectingDate; date2.setDate(date2.getDate() + 1)) {
              const key = dayTime.dateKey(date2);
              (bucket = dateMap.get(key)) || dateMap.set(key, bucket = []);
              bucket.push(occurrence);
            }
          }
        }
      }
      return dateMap;
    }
  }, __publicField(_a, "$name", "GetEventsMixin"), _a;
};

// ../Scheduler/lib/Scheduler/data/util/EventDayIndex.js
var indexNameMap = {
  date: "_dateIndex",
  startDate: "_startDateIndex"
};
var indexProps = Object.values(indexNameMap);
var emptyArray = Object.freeze([]);
var { MILLIS_PER_DAY } = DayTime;
var EventDayIndex = class {
  constructor(store, dayTime) {
    this.dayTime = dayTime || DayTime.MIDNIGHT;
    this.store = store;
    this.users = [this.dayTime];
  }
  /**
   * Adds an event record to the specified index (either "startDate" or "date") for a given `date`.
   * @param {String} indexName The index to which the event record is to be added (either "startDate" or "date").
   * @param {Date|Number} date A date for which the event record overlaps. The {@link Core.util.DayTime#function-dateKey}
   * method is used to convert this date to a "YYYY-MM-DD" key for the index.
   * @param {Scheduler.model.EventModel} eventRecord The event record.
   * @private
   */
  add(indexName, date, eventRecord) {
    const index = this[indexNameMap[indexName]], key = this.dayTime.dateKey(date), entry = index[key] || (index[key] = /* @__PURE__ */ new Set());
    entry.add(eventRecord);
  }
  /**
   * Adds an event record to all indexes for all dates which the event overlaps.
   * @param {Scheduler.model.EventModel} eventRecord The event record.
   * @private
   */
  addEvent(eventRecord) {
    var _a, _b, _c;
    let dateMS = (_a = this.dayTime.startOfDay(eventRecord.startDate)) == null ? void 0 : _a.getTime(), endDateMS;
    if (dateMS) {
      endDateMS = (_c = (_b = eventRecord.endDate) == null ? void 0 : _b.getTime()) != null ? _c : dateMS;
      this.add("startDate", dateMS, eventRecord);
      do {
        this.add("date", dateMS, eventRecord);
        dateMS += MILLIS_PER_DAY;
      } while (dateMS < endDateMS);
    }
  }
  /**
   * Clear this index.
   */
  clear() {
    indexProps.forEach((name) => this[name] = /* @__PURE__ */ Object.create(null));
  }
  /**
   * Returns an object that has properties named by the {@link Core.util.DayTime#function-dateKey} method, or the
   * array of event records if a `date` is specified, or the event record array and the date key in a 2-element array
   * if `returnKey` is `true`.
   * @param {String} indexName The name of the desired index (either 'date' or 'startDate').
   * @param {Number|Date} date The date as a `Date` or the millisecond UTC epoch. When passed, this method will return
   * the array of event records for this date.
   * @param {Boolean} [returnKey] Specify `true` to return the date key along with the event record array.
   * @returns {Object|Scheduler.model.EventModel[]}
   */
  get(indexName, date, returnKey) {
    !this.initialized && this.initialize();
    let ret = this[indexNameMap[indexName]], key;
    if (date) {
      key = this.dayTime.dateKey(date);
      ret = returnKey ? [ret[key], key] : ret[key];
    }
    return ret;
  }
  /**
   * Called when this index is first used. Once called, further store changes will be used to maintain this index.
   * @private
   */
  initialize() {
    this.initialized = true;
    this.clear();
    this.sync("splice", this.store.storage.allValues);
  }
  invalidate() {
    this.initialized = false;
    indexProps.forEach((name) => this[name] = null);
  }
  /**
   * Returns `true` if the given `dayTime` matches this index.
   * @param {Core.util.DayTime} dayTime
   * @returns {Boolean}
   */
  matches(dayTime) {
    return this.dayTime.startShift === dayTime.startShift;
  }
  /**
   * Removes an event record from the specified index (either "startDate" or "date") for a given `date`.
   * @param {String} indexName The index to which the event record is to be removed (either "startDate" or "date").
   * @param {Date|Number} date A date for which the event record overlaps. The {@link Core.util.DayTime#function-dateKey}
   * method is used to convert this date to a "YYYY-MM-DD" key for the index.
   * @param {Scheduler.model.EventModel} eventRecord The event record.
   * @private
   */
  remove(indexName, date, eventRecord) {
    const index = this[indexNameMap[indexName]], key = this.dayTime.dateKey(date), entry = index[key];
    if (entry) {
      entry.delete(eventRecord);
    }
  }
  /**
   * Removes an event record from all indexes for all dates which the event overlaps.
   * @param {Scheduler.model.EventModel} eventRecord The event record.
   * @param {Date} startDate The start date for the event. This may be different from the `startDate` of the given
   * `eventRecord` when the event is rescheduled.
   * @param {Date} endDate The end date for the event. This may be different from the `endDate` of the given
   * `eventRecord` when the event is rescheduled.
   * @private
   */
  removeEvent(eventRecord, startDate, endDate) {
    var _a, _b;
    let dateMS = (_a = this.dayTime.startOfDay(startDate)) == null ? void 0 : _a.getTime(), endDateMS;
    if (dateMS) {
      endDateMS = (_b = endDate == null ? void 0 : endDate.getTime()) != null ? _b : dateMS;
      this.remove("startDate", dateMS, eventRecord);
      do {
        this.remove("date", dateMS, eventRecord);
        dateMS += MILLIS_PER_DAY;
      } while (dateMS < endDateMS);
    }
  }
  sync(action, added, removed, replaced, wasSet) {
    var _a, _b;
    added = added || emptyArray;
    removed = removed || emptyArray;
    const me = this, addedCount = added.length, removedCount = removed.length, replacedCount = replaced == null ? void 0 : replaced.length;
    let i, newEvent, outgoingEvent;
    if (!me.initialized) {
      return;
    }
    switch (action) {
      case "clear":
        me.clear();
        break;
      case "splice":
        if (replacedCount) {
          added = added.slice();
          removed = removed.slice();
          for (i = 0; i < replacedCount; i++) {
            removed.push(replaced[i][0]);
            added.push(replaced[i][1]);
          }
        }
        if (removedCount) {
          for (i = 0; i < removedCount; i++) {
            outgoingEvent = removed[i];
            me.removeEvent(outgoingEvent, outgoingEvent.startDate, outgoingEvent.endDate);
          }
        }
        if (addedCount) {
          for (i = 0; i < addedCount; i++) {
            newEvent = added[i];
            if (newEvent.isScheduled && !newEvent.isParent) {
              me.addEvent(newEvent);
            }
          }
        }
        break;
      case "reschedule":
        outgoingEvent = added[0];
        me.removeEvent(
          outgoingEvent,
          ((_a = wasSet.startDate) == null ? void 0 : _a.oldValue) || outgoingEvent.startDate,
          ((_b = wasSet.endDate) == null ? void 0 : _b.oldValue) || outgoingEvent.endDate
        );
        me.sync("splice", added);
        break;
    }
  }
  /**
   * This method registers a `dayTime` instance with this index in the `users` array.
   * @param {Core.util.DayTime} dayTime The instance to register.
   */
  register(dayTime) {
    this.users.push(dayTime);
  }
  /**
   * This method unregisters a `dayTime` instance, removing it from the `users` array. This method returns `true` if
   * this was the last registered instance and this index is no longer needed.
   * @param {Core.util.DayTime} dayTime The instance to register.
   * @returns {Boolean}
   */
  unregister(dayTime) {
    const { users } = this, i = users.indexOf(dayTime);
    if (i > -1) {
      users.splice(i, 1);
    }
    return !users.length;
  }
};
var proto = EventDayIndex.prototype;
indexProps.forEach((name) => proto[name] = null);
proto.initialized = false;
EventDayIndex._$name = "EventDayIndex";

// ../Scheduler/lib/Scheduler/data/mixin/RecurringTimeSpansMixin.js
var emptyArray2 = Object.freeze([]);
var RecurringTimeSpansMixin_default = (Target) => class RecurringTimeSpansMixin extends (Target || Base) {
  static get $name() {
    return "RecurringTimeSpansMixin";
  }
  construct(...args) {
    const me = this;
    me.globalOccurrences = /* @__PURE__ */ new Map();
    me.recurringEvents = /* @__PURE__ */ new Set();
    super.construct(...args);
  }
  // Override to refreshRecurringEventsCache on initial load
  afterLoadData() {
    this.globalOccurrences.clear();
    this.refreshRecurringEventsCache("clear");
    this.refreshRecurringEventsCache("splice", this.storage.allValues);
    super.afterLoadData && super.afterLoadData();
  }
  /**
   * Responds to mutations of the underlying storage Collection.
   *
   * Maintain indices for fast finding of events by date.
   * @param {Object} event
   * @private
   */
  onDataChange({ action, added, removed, replaced }) {
    this.refreshRecurringEventsCache(action, added, removed, replaced);
    super.onDataChange(...arguments);
  }
  refreshRecurringEventsCache(action, added = emptyArray2, removed = emptyArray2, replaced) {
    const me = this, { recurringEvents } = me, replacedCount = replaced == null ? void 0 : replaced.length;
    switch (action) {
      case "clear":
        recurringEvents.clear();
        break;
      case "splice": {
        if (replacedCount) {
          added = added.slice();
          removed = removed.slice();
          for (let i = 0; i < replacedCount; i++) {
            removed.push(replaced[i][0]);
            added.push(replaced[i][1]);
          }
        }
        const addedCount = added.length, removedCount = removed.length;
        if (removedCount && recurringEvents.size) {
          for (let i = 0; i < removedCount; i++) {
            recurringEvents.delete(removed[i]);
          }
        }
        if (addedCount) {
          for (let i = 0; i < addedCount; i++) {
            const newEvent = added[i];
            if (newEvent.isRecurring) {
              recurringEvents.add(newEvent);
            }
          }
        }
        break;
      }
    }
  }
  getById(id) {
    let result = super.getById(id);
    if (!result) {
      result = this.globalOccurrences.get(this.modelClass.asId(id));
    }
    return result;
  }
  onModelChange(record, toSet, wasSet, silent, fromRelationUpdate) {
    const isRecurrenceRelatedFieldChange = !silent && this.isRecurrenceRelatedFieldChange(record, wasSet);
    if (isRecurrenceRelatedFieldChange) {
      record.removeOccurrences();
    }
    super.onModelChange(...arguments);
    if (isRecurrenceRelatedFieldChange) {
      const event = { action: "batch", records: this.storage.values };
      this.trigger("refresh", event);
      this.trigger("change", event);
    }
  }
  /**
   * The method restricts which field modifications should trigger timespan occurrences building.
   * By default, any field change of a recurring timespan causes the rebuilding.
   * @param  {Scheduler.model.TimeSpan} timeSpan The modified timespan.
   * @param  {Object} wasSet Object containing the change set.
   * @returns {Boolean} `True` if the fields modification should trigger the timespan occurrences rebuilding.
   * @internal
   * @category Recurrence
   */
  isRecurrenceRelatedFieldChange(timeSpan, wasSet) {
    return timeSpan.isRecurring || "recurrenceRule" in wasSet;
  }
  /**
   * Builds occurrences for the provided timespan across the provided date range.
   * @private
   * @category Recurrence
   */
  getOccurrencesForTimeSpan(timeSpan, startDate, endDate) {
    const result = [];
    if (timeSpan.isRecurring) {
      timeSpan.recurrence.forEachOccurrence(startDate, endDate, (r) => result.push(r));
    }
    return result;
  }
  set data(data) {
    this.globalOccurrences.clear();
    super.data = data;
  }
  /**
   * Returns all the recurring timespans.
   * @returns {Scheduler.model.TimeSpan[]} Array of recurring events.
   * @category Recurrence
   */
  getRecurringTimeSpans() {
    return [...this.recurringEvents];
  }
};

// ../Scheduler/lib/Scheduler/data/mixin/RecurringEventsMixin.js
var RecurringEventsMixin_default = (Target) => class RecurringEventsMixin extends RecurringTimeSpansMixin_default(Target || Base) {
  static get $name() {
    return "RecurringEventsMixin";
  }
  /**
   * Returns all the recurring events.
   *
   * **An alias for ** {@link Scheduler.data.mixin.RecurringTimeSpansMixin#function-getRecurringTimeSpans} method.
   *
   * @returns {Scheduler.model.EventModel[]} Array of recurring events.
   * @category Recurrence
   */
  getRecurringEvents() {
    return this.getRecurringTimeSpans();
  }
  isEventPersistable(event) {
    return super.isEventPersistable(event) && (!event.supportsRecurring || !event.isOccurrence);
  }
};

// ../Scheduler/lib/Scheduler/data/util/recurrence/RecurrenceDayRuleEncoder.js
var dayParseRegExp = /^([+-]?[0-9])?(SU|MO|TU|WE|TH|FR|SA)$/;
var days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
var RecurrenceDayRuleEncoder = class extends Base {
  static decodeDay(rawDay) {
    let parsedDay, result;
    if (parsedDay = dayParseRegExp.exec(rawDay)) {
      result = [days.indexOf(parsedDay[2])];
      if (parsedDay[1]) {
        parsedDay[1] = parseInt(parsedDay[1], 10);
        result.push(parsedDay[1]);
      }
    }
    return result;
  }
  static encodeDay(day) {
    let position;
    if (Array.isArray(day)) {
      [day, position] = day;
    }
    return (position ? position.toString() : "") + days[day];
  }
  // Turns days values provided as an array of strings (like [`-1MO`, `SU`, `+3FR`])
  // into an array of [ dayIndex, position ] elements, where:
  //
  // - `dayIndex` - zero-based week day index value (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
  // - `position` - (optional) 1-based position of the day (integer value (can be both positive and negative))
  static decode(rawDays) {
    const result = [];
    let parsedDay;
    if (rawDays) {
      for (let i = 0; i < rawDays.length; i++) {
        if (parsedDay = this.decodeDay(rawDays[i])) {
          result.push(parsedDay);
        }
      }
    }
    return result;
  }
  static encode(days2) {
    const result = [];
    let day;
    if (days2) {
      for (let i = 0; i < days2.length; i++) {
        if (day = this.encodeDay(days2[i])) {
          result.push(day);
        }
      }
    }
    return result;
  }
};
RecurrenceDayRuleEncoder._$name = "RecurrenceDayRuleEncoder";

// ../Scheduler/lib/Scheduler/data/util/recurrence/AbstractRecurrenceIterator.js
var frequencyToUnitRe = /ly$/i;
var frequencyToUnit = (frequency) => {
  const result = frequency.replace(frequencyToUnitRe, "");
  return result === "DAI" ? "DAY" : result;
};
var fn = (date, counter, isFirst, timeSpan) => timeSpan.buildOccurrence(date, isFirst);
var captureLastOccurrence = (date) => lastOccurrenceDate = date;
var lastOccurrenceDate;
var AbstractRecurrenceIterator = class extends Base {
  static processIterationConfig(config) {
    const { recurrence } = config, {
      frequency,
      interval,
      timeSpan,
      endDate: until,
      count
    } = recurrence;
    if (!config.syncingStartDate && !timeSpan.meta.isSyncedWithRule) {
      const intervalEndDate = DateHelper.add(timeSpan.startDate, interval, frequencyToUnit(frequency)), endDate2 = DateHelper.min(
        intervalEndDate,
        config.endDate || intervalEndDate
      );
      this.forEachDate({
        syncingStartDate: true,
        startDate: timeSpan.startDate,
        endDate: endDate2,
        recurrence,
        fn
      });
    }
    const timeSpanStart = timeSpan.startDate;
    let {
      startDate = timeSpanStart,
      endDate = until
    } = config;
    if (startDate < timeSpanStart) {
      startDate = timeSpanStart;
    }
    if (until) {
      if (!endDate || endDate > until) {
        endDate = until;
      }
    } else if (count && startDate > timeSpanStart) {
      this.forEachDate({
        recurrence,
        fn: captureLastOccurrence
      });
      if (!endDate || endDate > lastOccurrenceDate) {
        endDate = new Date(lastOccurrenceDate.getTime() + 1);
      }
    }
    const earliestVisibleDate = startDate;
    if (!config.startOnly) {
      startDate = new Date(DateHelper.max(DateHelper.add(startDate, -interval, frequencyToUnit(frequency)), timeSpanStart));
    }
    return Object.assign({
      extraArgs: [],
      // Only check start date for time spans with 0 duration
      startOnly: !Boolean(timeSpan.durationMS)
    }, config, {
      startDate,
      endDate,
      timeSpan,
      timeSpanStart,
      earliestVisibleDate,
      endDateMS: endDate == null ? void 0 : endDate.getTime(),
      timeSpanStartMS: timeSpanStart.getTime(),
      earliestVisibleDateMS: earliestVisibleDate.getTime(),
      durationMS: timeSpan.durationMS,
      spansStart: startDate <= timeSpanStart && endDate > timeSpanStart
    });
  }
  static getOccurrenceIndex(event) {
    if (event.isOccurrence) {
      return DateHelper.diff(event.recurringTimeSpan.startDate, event.startDate, frequencyToUnit(event.recurringTimeSpan.recurrence.frequency));
    }
  }
  /**
   * Returns Nth occurrence of a week day in the provided period of time.
   * @param  {Date} startDate Period start date.
   * @param  {Date} endDate   Period end date.
   * @param  {Number} day    Week day (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
   * @param  {Number} index  Index to find.
   * @returns {Date}           Returns the found date or null if there is no `index`th entry.
   * @private
   */
  static getNthDayInPeriod(startDate, endDate, day, index) {
    let result, sign, borderDate;
    if (index) {
      if (index > 0) {
        sign = 1;
        borderDate = startDate;
      } else {
        sign = -1;
        borderDate = endDate;
      }
      const delta = day - borderDate.getDay();
      if (sign * delta < 0) {
        index += sign;
      }
      result = new Date(borderDate);
      result.setDate(borderDate.getDate() + (index - sign) * 7 + delta);
      if (result < startDate || result > endDate) {
        result = null;
      }
    }
    return result;
  }
  static buildDate(year, month, date) {
    const dt = new Date(year, month, date);
    if (dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === date) {
      return dt;
    }
  }
  static isValidPosition(position) {
    return Boolean(position);
  }
  static forEachDateAtPositions(dates, positions, fn2, scope) {
    const datesLength = dates.length, processed = {};
    for (let i = 0; i < positions.length; i++) {
      const index = positions[i];
      if (this.isValidPosition(index)) {
        const date = index > 0 ? dates[index - 1] : dates[datesLength + index];
        if (date && !processed[date.getTime()]) {
          processed[date.getTime()] = true;
          if (fn2.call(scope, date) === false) {
            return false;
          }
        }
      }
    }
  }
  static isInView(startOnly, occurrenceDate, earliestVisibleDate, durationMS, timeSpan) {
    return (startOnly ? occurrenceDate >= earliestVisibleDate : occurrenceDate.valueOf() + durationMS > earliestVisibleDate) && !timeSpan.hasException(occurrenceDate);
  }
  // Slightly faster version of ^, used by Daily & Weekly iterators
  static isInViewMS(startOnly, occurenceDate, occurrenceDateMS, earliestVisibleDateMS, durationMS, timeSpan) {
    return (startOnly ? occurrenceDateMS >= earliestVisibleDateMS : occurrenceDateMS + durationMS > earliestVisibleDateMS) && !timeSpan.hasException(occurenceDate);
  }
};
__publicField(AbstractRecurrenceIterator, "frequency", "NONE");
__publicField(AbstractRecurrenceIterator, "MAX_OCCURRENCES_COUNT", 1e6);
AbstractRecurrenceIterator._$name = "AbstractRecurrenceIterator";

// ../Scheduler/lib/Scheduler/data/util/recurrence/DailyRecurrenceIterator.js
var DailyRecurrenceIterator = class extends AbstractRecurrenceIterator {
  /**
   * Iterates over the passed date range, calling the passed callback on each date on which
   * starts a recurring event which matches the passed recurrence rule and overlaps the start and end dates
   * and is not an {@link Scheduler.model.mixin.RecurringTimeSpan#field-exceptionDates exceptionDate}
   * in the recurring event.
   * @param {Object} config An object which describes how to iterate.
   * @param {Date} config.startDate The point in time to begin iteration.
   * @param {Date} config.endDate The point in time to end iteration.
   * @param {Boolean} [config.startOnly] By default, all occurrences which intersect the date range
   * will be visited. Pass `true` to only visit occurrences which *start* in the date range.
   * @param {Scheduler.model.RecurrenceModel} config.recurrence The point in time to end iteration.
   * @param {Function} config.fn The function to call for each date which matches the recurrence in the date range.
   * @param {Date} config.fn.date The occurrence date.
   * @param {Number} config.fn.counter A counter of how many dates have been visited in this iteration.
   * @param {Boolean} config.fn.isFirst A flag which is `true` if the date is the first occurrence in the specified recurrence rule.
   * @param {Array} [config.extraArgs] Extra arguments to pass to the callback after the `isFirst` argument.
   */
  static forEachDate(config) {
    const {
      startOnly,
      startDate,
      endDate,
      endDateMS,
      timeSpan,
      timeSpanStart,
      earliestVisibleDateMS,
      durationMS,
      spansStart,
      recurrence,
      fn: fn2,
      extraArgs,
      scope = this
    } = this.processIterationConfig(config), { interval } = recurrence, delay2 = startDate - timeSpanStart, intervalDuration = interval * 864e5, delayInIntervals = Math.floor(delay2 / intervalDuration);
    let { count } = recurrence, counter = 0, occurrenceDate = DateHelper.add(timeSpanStart, delayInIntervals * interval, "day"), occurrenceDateMS = occurrenceDate.getTime();
    if (!endDate && !count) {
      count = this.MAX_OCCURRENCES_COUNT;
    }
    while (!endDateMS || occurrenceDateMS < endDateMS) {
      const inView = this.isInViewMS(startOnly, occurrenceDate, occurrenceDateMS, earliestVisibleDateMS, durationMS, timeSpan);
      counter++;
      if (inView && (endDateMS && occurrenceDateMS > endDateMS || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
        break;
      }
      occurrenceDate = DateHelper.add(occurrenceDate, interval, "day");
      occurrenceDateMS = occurrenceDate.getTime();
    }
  }
};
__publicField(DailyRecurrenceIterator, "frequency", "DAILY");
DailyRecurrenceIterator._$name = "DailyRecurrenceIterator";

// ../Scheduler/lib/Scheduler/data/util/recurrence/WeeklyRecurrenceIterator.js
var WeeklyRecurrenceIterator = class extends AbstractRecurrenceIterator {
  /**
   * Iterates over the passed date range, calling the passed callback on each date on which
   * starts an event which matches the passed recurrence rule and overlaps the start and end dates.
   * @param {Object} config An object which describes how to iterate.
   * @param {Date} config.startDate The point in time to begin iteration.
   * @param {Date} config.endDate The point in time to end iteration.
   * @param {Boolean} [config.startOnly] By default, all occurrences which intersect the date range
   * will be visited. Pass `true` to only visit occurrences which *start* in the date range.
   * @param {Scheduler.model.RecurrenceModel} config.recurrence The point in time to end iteration.
   * @param {Function} config.fn The function to call for each date which matches the recurrence in the date range.
   * @param {Date} config.fn.date The occurrence date.
   * @param {Number} config.fn.counter A counter of how many dates have been visited in this iteration.
   * @param {Boolean} config.fn.isFirst A flag which is `true` if the date is the first occurrence in the specified recurrence rule.
   * @param {Array} [config.extraArgs] Extra arguments to pass to the callback after the `isFirst` argument.
   */
  static forEachDate(config) {
    const {
      startOnly,
      startDate,
      endDateMS,
      timeSpan,
      timeSpanStart,
      timeSpanStartMS,
      earliestVisibleDateMS,
      durationMS,
      spansStart,
      recurrence,
      fn: fn2,
      extraArgs,
      scope = this
    } = this.processIterationConfig(config), {
      interval,
      days: days2
    } = recurrence, { weekStartDay } = DateHelper, startHours = timeSpanStart.getHours(), startMinutes = timeSpanStart.getMinutes(), startSeconds = timeSpanStart.getSeconds(), startMS = timeSpanStart.getMilliseconds();
    let counter = 0, { count } = recurrence, weekDays = RecurrenceDayRuleEncoder.decode(days2), weekStartDate, occurrenceDate;
    if (!(weekDays == null ? void 0 : weekDays.length)) {
      weekDays = [[timeSpanStart.getDay()]];
    }
    if (weekStartDay > 0) {
      for (let i = 0; i < weekDays.length; i++) {
        if (weekStartDay > weekDays[i][0]) {
          weekDays[i][0] = 7 - weekStartDay - weekDays[i][0];
        } else {
          weekDays[i][0] -= weekStartDay;
        }
      }
    }
    weekDays.sort((a, b) => a[0] - b[0]);
    weekStartDate = DateHelper.getNext(count || interval > 1 ? timeSpanStart : startDate, "week", 0);
    if (!endDateMS && !count) {
      count = this.MAX_OCCURRENCES_COUNT;
    }
    while (!endDateMS || weekStartDate.getTime() < endDateMS) {
      for (let i = 0; i < weekDays.length; i++) {
        occurrenceDate = new Date(
          weekStartDate.getFullYear(),
          weekStartDate.getMonth(),
          weekStartDate.getDate() + weekDays[i][0],
          startHours,
          startMinutes,
          startSeconds,
          startMS
        );
        const occurrenceDateMS = occurrenceDate.getTime();
        if (occurrenceDateMS >= timeSpanStartMS) {
          const inView = this.isInViewMS(startOnly, occurrenceDate, occurrenceDateMS, earliestVisibleDateMS, durationMS, timeSpan);
          counter++;
          if (inView && (endDateMS && occurrenceDateMS >= endDateMS || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
            return;
          }
        }
      }
      weekStartDate = DateHelper.getNext(weekStartDate, "week", interval);
    }
  }
};
__publicField(WeeklyRecurrenceIterator, "frequency", "WEEKLY");
WeeklyRecurrenceIterator._$name = "WeeklyRecurrenceIterator";

// ../Scheduler/lib/Scheduler/data/util/recurrence/MonthlyRecurrenceIterator.js
var MonthlyRecurrenceIterator = class extends AbstractRecurrenceIterator {
  static getNthDayOfMonth(date, dayNum) {
    const daysInMonth = DateHelper.daysInMonth(date);
    let result = null;
    if (dayNum && Math.abs(dayNum) <= daysInMonth) {
      result = new Date(date.getFullYear(), date.getMonth(), dayNum < 0 ? daysInMonth + dayNum + 1 : dayNum);
    }
    return result;
  }
  static isValidPosition(position) {
    return position && Math.abs(position) > 0 && Math.abs(position) <= 31;
  }
  /**
   * Iterates over the passed date range, calling the passed callback on each date on which
   * starts an event which matches the passed recurrence rule and overlaps the start and end dates.
   * @param {Object} config An object which describes how to iterate.
   * @param {Date} config.startDate The point in time to begin iteration.
   * @param {Date} config.endDate The point in time to end iteration.
   * @param {Boolean} [config.startOnly] By default, all occurrences which intersect the date range
   * will be visited. Pass `true` to only visit occurrences which *start* in the date range.
   * @param {Scheduler.model.RecurrenceModel} config.recurrence The point in time to end iteration.
   * @param {Function} config.fn The function to call for each date which matches the recurrence in the date range.
   * @param {Date} config.fn.date The occurrence date.
   * @param {Number} config.fn.counter A counter of how many dates have been visited in this iteration.
   * @param {Boolean} config.fn.isFirst A flag which is `true` if the date is the first occurrence in the specified recurrence rule.
   * @param {Array} [config.extraArgs] Extra arguments to pass to the callback after the `isFirst` argument.
   */
  static forEachDate(config) {
    const {
      startOnly,
      startDate,
      endDate,
      timeSpan,
      timeSpanStart,
      earliestVisibleDate,
      durationMS,
      spansStart,
      recurrence,
      fn: fn2,
      extraArgs,
      scope = this
    } = this.processIterationConfig(config), {
      interval,
      days: days2,
      count,
      positions
    } = recurrence, weekDays = RecurrenceDayRuleEncoder.decode(days2), hasPositions = positions && positions.length, processedDate = {};
    let { monthDays } = recurrence, counter = 0, weekDayPosition, monthStartDate, monthEndDate, dates, occurrenceDate, i;
    monthStartDate = DateHelper.startOf(count || interval > 1 ? timeSpanStart : startDate, "month");
    monthEndDate = new Date(DateHelper.getNext(monthStartDate, "month", 1) - 1);
    if (!(monthDays && monthDays.length) && !(weekDays && weekDays.length)) {
      monthDays = [timeSpanStart.getDate()];
    }
    if (weekDays && weekDays.length) {
      weekDays.forEach((day) => {
        if (day[1]) {
          weekDayPosition = weekDayPosition || {};
          weekDayPosition[day[0]] = day[1];
        }
      });
    }
    while ((!endDate || endDate > monthStartDate) && (!count || counter < count)) {
      dates = [];
      if (weekDays && weekDays.length) {
        weekDays.forEach((day) => {
          const weekDay = day[0];
          let from = 1, till = 53;
          if (day[1]) {
            from = till = day[1];
          }
          for (i = from; i <= till; i++) {
            if (occurrenceDate = this.getNthDayInPeriod(monthStartDate, monthEndDate, weekDay, i)) {
              occurrenceDate = DateHelper.copyTimeValues(occurrenceDate, timeSpanStart);
              if (!processedDate[occurrenceDate.getTime()]) {
                processedDate[occurrenceDate.getTime()] = true;
                dates.push(occurrenceDate);
              }
            }
          }
        });
        dates.sort((a, b) => a - b);
        if (!hasPositions) {
          for (i = 0; i < dates.length; i++) {
            occurrenceDate = dates[i];
            if (occurrenceDate >= timeSpanStart) {
              const inView = this.isInView(startOnly, occurrenceDate, earliestVisibleDate, durationMS, timeSpan);
              counter++;
              if (inView && (endDate && occurrenceDate >= endDate || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
                return false;
              }
            }
          }
        }
      } else {
        const sortedMonthDates = [];
        for (i = 0; i < monthDays.length; i++) {
          if ((occurrenceDate = this.getNthDayOfMonth(monthStartDate, monthDays[i])) && !processedDate[occurrenceDate.getTime()]) {
            processedDate[occurrenceDate.getTime()] = true;
            sortedMonthDates.push(occurrenceDate);
          }
        }
        sortedMonthDates.sort((a, b) => a - b);
        for (i = 0; i < sortedMonthDates.length; i++) {
          occurrenceDate = DateHelper.copyTimeValues(sortedMonthDates[i], timeSpanStart);
          if (hasPositions) {
            dates.push(occurrenceDate);
          } else if (occurrenceDate >= timeSpanStart) {
            const inView = this.isInView(startOnly, occurrenceDate, earliestVisibleDate, durationMS, timeSpan);
            counter++;
            if (inView && (endDate && occurrenceDate > endDate || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
              return;
            }
          }
        }
      }
      if (hasPositions && dates.length) {
        this.forEachDateAtPositions(dates, positions, (occurrenceDate2) => {
          if (occurrenceDate2 >= timeSpanStart) {
            const inView = startOnly ? occurrenceDate2 >= earliestVisibleDate : occurrenceDate2.valueOf() + durationMS > earliestVisibleDate && !timeSpan.hasException(occurrenceDate2);
            counter++;
            if (inView && (!endDate || occurrenceDate2 <= endDate) && // return false if it's time to stop recurring
            (fn2.apply(scope, [occurrenceDate2, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
              return false;
            }
          }
        });
      }
      monthStartDate = DateHelper.getNext(monthStartDate, "month", interval);
      monthEndDate = new Date(DateHelper.getNext(monthStartDate, "month", 1) - 1);
    }
  }
};
__publicField(MonthlyRecurrenceIterator, "frequency", "MONTHLY");
MonthlyRecurrenceIterator._$name = "MonthlyRecurrenceIterator";

// ../Scheduler/lib/Scheduler/data/util/recurrence/YearlyRecurrenceIterator.js
var YearlyRecurrenceIterator = class extends AbstractRecurrenceIterator {
  /**
   * Iterates over the passed date range, calling the passed callback on each date on which
   * starts an event which matches the passed recurrence rule and overlaps the start and end dates.
   * @param {Object} config An object which describes how to iterate.
   * @param {Date} config.startDate The point in time to begin iteration.
   * @param {Date} config.endDate The point in time to end iteration.
   * @param {Boolean} [config.startOnly] By default, all occurrences which intersect the date range
   * will be visited. Pass `true` to only visit occurrences which *start* in the date range.
   * @param {Scheduler.model.RecurrenceModel} config.recurrence The point in time to end iteration.
   * @param {Function} config.fn The function to call for each date which matches the recurrence in the date range.
   * @param {Date} config.fn.date The occurrence date.
   * @param {Number} config.fn.counter A counter of how many dates have been visited in this iteration.
   * @param {Boolean} config.fn.isFirst A flag which is `true` if the date is the first occurrence in the specified recurrence rule.
   * @param {Array} [config.extraArgs] Extra arguments to pass to the callback after the `isFirst` argument.
   */
  static forEachDate(config) {
    const {
      startOnly,
      startDate,
      endDate,
      timeSpan,
      timeSpanStart,
      earliestVisibleDate,
      durationMS,
      spansStart,
      recurrence,
      fn: fn2,
      extraArgs,
      scope = this
    } = this.processIterationConfig(config), {
      interval,
      days: days2,
      count,
      positions
    } = recurrence, weekDays = RecurrenceDayRuleEncoder.decode(days2), hasPositions = positions && positions.length, processedDate = {};
    let { months } = recurrence, counter = 0, i, occurrenceDate, dates, yearStartDate, yearEndDate, weekDayPosition;
    yearStartDate = DateHelper.startOf(count || interval > 1 ? timeSpanStart : startDate, "year");
    yearEndDate = new Date(DateHelper.getNext(yearStartDate, "year", 1) - 1);
    months && months.sort((a, b) => a - b);
    if (!(months && months.length) && !(weekDays && weekDays.length)) {
      months = [timeSpanStart.getMonth() + 1];
    }
    if (weekDays && weekDays.length) {
      weekDays.forEach((day) => {
        if (day[1]) {
          weekDayPosition = weekDayPosition || {};
          weekDayPosition[day[0]] = day[1];
        }
      });
    }
    while ((!endDate || endDate > yearStartDate) && (!count || counter < count)) {
      dates = [];
      if (weekDays && weekDays.length) {
        weekDays.forEach((day) => {
          const weekDay = day[0];
          let from = 1, till = 53;
          if (day[1]) {
            from = till = day[1];
          }
          for (i = from; i <= till; i++) {
            if (occurrenceDate = this.getNthDayInPeriod(yearStartDate, yearEndDate, weekDay, i)) {
              occurrenceDate = DateHelper.copyTimeValues(occurrenceDate, timeSpanStart);
              if (!processedDate[occurrenceDate.getTime()]) {
                processedDate[occurrenceDate.getTime()] = true;
                dates.push(occurrenceDate);
              }
            }
          }
        });
        dates.sort((a, b) => a - b);
        if (!hasPositions) {
          for (i = 0; i < dates.length; i++) {
            occurrenceDate = dates[i];
            if (occurrenceDate >= timeSpanStart) {
              const inView = this.isInView(startOnly, occurrenceDate, earliestVisibleDate, durationMS, timeSpan);
              counter++;
              if (inView && (endDate && occurrenceDate >= endDate || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
                return;
              }
            }
          }
        }
      } else {
        for (i = 0; i < months.length; i++) {
          if (occurrenceDate = this.buildDate(yearStartDate.getFullYear(), months[i] - 1, timeSpanStart.getDate())) {
            occurrenceDate = DateHelper.copyTimeValues(occurrenceDate, timeSpanStart);
            if (!processedDate[occurrenceDate.getTime()]) {
              processedDate[occurrenceDate.getTime()] = true;
              if (hasPositions) {
                dates.push(occurrenceDate);
              } else if (occurrenceDate >= timeSpanStart) {
                const inView = startOnly ? occurrenceDate >= earliestVisibleDate : occurrenceDate.valueOf() + durationMS > earliestVisibleDate && !timeSpan.hasException(occurrenceDate);
                counter++;
                if (inView && (endDate && occurrenceDate >= endDate || fn2.apply(scope, [occurrenceDate, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count)) {
                  return;
                }
              }
            }
          }
        }
      }
      if (hasPositions && dates.length) {
        this.forEachDateAtPositions(dates, positions, (occurrenceDate2) => {
          if (occurrenceDate2 >= timeSpanStart) {
            const inView = startOnly ? occurrenceDate2 >= earliestVisibleDate : occurrenceDate2.valueOf() + durationMS > earliestVisibleDate && !timeSpan.hasException(occurrenceDate2);
            counter++;
            if (inView && (!endDate || occurrenceDate2 < endDate)) {
              if (fn2.apply(scope, [occurrenceDate2, counter, counter === 1 && spansStart, timeSpan, ...extraArgs]) === false || count && counter >= count) {
                return false;
              }
            }
          }
        });
      }
      yearStartDate = DateHelper.getNext(yearStartDate, "year", interval);
      yearEndDate = new Date(DateHelper.getNext(yearStartDate, "year", 1) - 1);
    }
  }
};
__publicField(YearlyRecurrenceIterator, "frequency", "YEARLY");
YearlyRecurrenceIterator._$name = "YearlyRecurrenceIterator";

// ../Scheduler/lib/Scheduler/model/RecurrenceModel.js
var recurrenceIterators = {};
[DailyRecurrenceIterator, WeeklyRecurrenceIterator, MonthlyRecurrenceIterator, YearlyRecurrenceIterator].forEach((it) => {
  recurrenceIterators[it.frequency] = it;
});
function convertStringOfIntegerItemsValue(value) {
  if (value) {
    if (typeof value == "string") {
      value = value.split(",").map((item) => parseInt(item, 10));
    }
  } else {
    value = null;
  }
  return value;
}
function convertStringOfItemsValue(value) {
  if (value) {
    if (typeof value == "string") {
      value = value.split(",");
    }
  } else {
    value = null;
  }
  return value;
}
function isEqualAsString(value1, value2) {
  return String(value1) === String(value2);
}
function convertInteger(value) {
  if (this.defaultValue && value === void 0) {
    return this.defaultValue;
  }
  if (this.allowNull && value == null) {
    return null;
  }
  value = parseInt(value);
  return isNaN(value) ? void 0 : value;
}
var RecurrenceModel = class extends Model {
  static get $name() {
    return "RecurrenceModel";
  }
  /**
   * Indicates that this is a `RecurrenceModel` class instance
   * (allows to avoid using `instanceof`).
   * @property {Boolean}
   * @readonly
   */
  get isRecurrenceModel() {
    return true;
  }
  //region Fields
  static get fields() {
    return [
      /**
       * Field defines the recurrence frequency. Supported values are: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
       * @field {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} frequency
       */
      { name: "frequency", defaultValue: "DAILY" },
      /**
       * Field defines how often the recurrence repeats.
       * For example, if the recurrence is weekly its interval is 2, then the timespan repeats every two weeks.
       * @field {Number} interval
       */
      { name: "interval", defaultValue: 1, convert: convertInteger },
      /**
       * End date of the recurrence. Specifies when the recurrence ends.
       * The value is optional, the recurrence can as well be stopped using {@link #field-count} field value.
       * @field {Date} endDate
       */
      { name: "endDate", type: "date" },
      /**
       * Specifies the number of occurrences after which the recurrence ends.
       * The value includes the associated timespan itself so values less than 2 make no sense.
       * The field is optional, the recurrence as well can be stopped using {@link #field-endDate} field value.
       * @field {Number} count
       */
      { name: "count", allowNull: true, convert: convertInteger },
      /**
       * Specifies days of the week on which the timespan should occur.
       * An array of string values `SU`, `MO`, `TU`, `WE`, `TH`, `FR`, `SA`
       * corresponding to Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday days of the week.
       * Each value can also be preceded by a positive (+n) or negative (-n) integer.
       * If present, this indicates the nth occurrence of a specific day within the monthly or yearly recurrence.
       *
       * **Not applicable** for daily {@link #field-frequency}.
       * @field {String[]} days
       */
      {
        name: "days",
        convert: convertStringOfItemsValue,
        isEqual: isEqualAsString
      },
      /**
       * Specifies days of the month on which the timespan should occur.
       * An array of integer values (-31..-1 - +1..+31, negative values mean counting backwards from the month end).
       * **Applicable only** for monthly {@link #field-frequency}.
       * @field {Number[]} monthDays
       */
      {
        name: "monthDays",
        convert: convertStringOfIntegerItemsValue,
        isEqual: isEqualAsString
      },
      /**
       * Specifies months of the year on which the timespan should occur.
       * An array of integer values (1 - 12).
       * **Applicable only** for yearly {@link #field-frequency}.
       * @field {Number[]} months
       */
      {
        name: "months",
        convert: convertStringOfIntegerItemsValue,
        isEqual: isEqualAsString
      },
      /**
       * The positions to include in the recurrence. The values operate on a set of recurrence instances **in one interval** of the recurrence rule.
       * An array of integer values (valid values are 1 to 366 or -366 to -1, negative values mean counting backwards from the end of the built list of occurrences).
       * **Not applicable** for daily {@link #field-frequency}.
       * @field {Number} positions
       */
      {
        name: "positions",
        convert: convertStringOfIntegerItemsValue,
        isEqual: isEqualAsString
      }
    ];
  }
  get dateFormat() {
    return this._dateFormat || "YYYYMMDDTHHmmss";
  }
  set dateFormat(format2) {
    this._dateFormat = format2;
  }
  get recurrenceIterator() {
    return recurrenceIterators[this.frequency];
  }
  /**
   * The timespan this recurrence is associated with.
   * @property {Scheduler.model.TimeSpan}
   */
  get timeSpan() {
    return this._timeSpan;
  }
  set timeSpan(value) {
    this._timeSpan = value;
  }
  /**
   * The recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format
   * ("RRULE" expression).
   * @property {String}
   */
  get rule() {
    const me = this, result = [];
    if (me.frequency) {
      result.push(`FREQ=${me.frequency}`);
      if (me.interval > 1) {
        result.push(`INTERVAL=${me.interval}`);
      }
      if (me.days && me.days.length) {
        result.push("BYDAY=" + me.days.join(","));
      }
      if (me.monthDays && me.monthDays.length) {
        result.push("BYMONTHDAY=" + me.monthDays.join(","));
      }
      if (me.months && me.months.length) {
        result.push("BYMONTH=" + me.months.join(","));
      }
      if (me.count) {
        result.push(`COUNT=${me.count}`);
      }
      if (me.endDate) {
        result.push("UNTIL=" + DateHelper.format(me.endDate, me.dateFormat));
      }
      if (me.positions && me.positions.length) {
        result.push("BYSETPOS=" + me.positions.join(","));
      }
    }
    return result.join(";");
  }
  set rule(rule) {
    const me = this, values = {
      frequency: null,
      interval: null,
      count: null,
      endDate: null,
      days: null,
      monthDays: null,
      months: null,
      positions: null
    };
    me.beginBatch();
    if (rule) {
      const parts = rule.split(";");
      for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i].split("="), value = part[1];
        switch (part[0]) {
          case "FREQ":
            values.frequency = value;
            break;
          case "INTERVAL":
            values.interval = value;
            break;
          case "COUNT":
            values.count = value;
            values.until = null;
            break;
          case "UNTIL":
            if (value) {
              values.endDate = DateHelper.parse(value, me.dateFormat);
            } else {
              values.endDate = null;
            }
            values.count = null;
            break;
          case "BYDAY":
            values.days = value;
            break;
          case "BYMONTHDAY":
            values.monthDays = value;
            break;
          case "BYMONTH":
            values.months = value;
            break;
          case "BYSETPOS":
            values.positions = value;
            break;
        }
      }
    }
    me.set(values);
    if (rule) {
      me.sanitize();
    }
    me.endBatch();
  }
  construct(data = {}) {
    const me = this, { rule, timeSpan } = data;
    me._suspendedTimeSpanNotifying = 0;
    delete data.timeSpan;
    delete data.rule;
    super.construct(...arguments);
    if (rule) {
      me.suspendTimeSpanNotifying();
      me.rule = rule;
      me.resumeTimeSpanNotifying();
    }
    me.timeSpan = timeSpan;
  }
  /**
   * Iterate occurrences for the owning timespan across the specified date range. This method can be called even
   * if the timespan is not yet a member of a store, however, the occurrences returned will not be cached across
   * subsequent calls to this method.
   * @param {Date} startDate The start date of the iteration.
   * @param {Date} endDate The end date of the iteration.
   * @param {Function} fn The function to call for each occurrence.
   * @param {Scheduler.model.TimeSpan} fn.occurrence The occurrence.
   * @param {Boolean} fn.first A flag which is `true` for the first occurrence of this recurrence.
   * @param {Number} fn.counter A counter of how many dates have been visited in this iteration.
   * @param {Date} fn.date The occurrence date.
   * @internal
   */
  forEachOccurrence(startDate, endDate, fn2) {
    if (this.timeSpan.startDate) {
      this.recurrenceIterator.forEachDate({
        recurrence: this,
        startDate,
        endDate,
        fn(date, counter, first, timeSpan) {
          return fn2(timeSpan.buildOccurrence(date, first), first, counter, date);
        }
      });
    }
  }
  /**
   * Cleans up fields that do not makes sense for the current {@link #field-frequency} value.
   * @private
   */
  sanitize() {
    var _a, _b;
    const me = this, timeSpanStartDate = (_a = me.timeSpan) == null ? void 0 : _a.startDate, values = {};
    me.isSanitizing = true;
    switch (me.frequency) {
      case "DAILY":
        values.positions = null;
        values.days = null;
        values.monthDays = null;
        values.months = null;
        break;
      case "WEEKLY": {
        values.positions = null;
        values.monthDays = null;
        values.months = null;
        const { days: days2 } = me;
        if (timeSpanStartDate && (days2 == null ? void 0 : days2.length) === 1 && days2[0] === RecurrenceDayRuleEncoder.encodeDay(timeSpanStartDate.getDay())) {
          values.days = null;
        }
        break;
      }
      case "MONTHLY": {
        if ((_b = me.monthDays) == null ? void 0 : _b.length) {
          values.positions = null;
          values.days = null;
        }
        values.months = null;
        const { monthDays } = me;
        if (timeSpanStartDate && (monthDays == null ? void 0 : monthDays.length) === 1 && monthDays[0] === timeSpanStartDate.getDate()) {
          values.monthDays = null;
        }
        break;
      }
      case "YEARLY": {
        values.monthDays = null;
        const { months } = me;
        if (timeSpanStartDate && (months == null ? void 0 : months.length) === 1 && months[0] === timeSpanStartDate.getMonth() + 1) {
          values.months = null;
        }
        break;
      }
    }
    me.set(values);
    me.isSanitizing = false;
  }
  copy(...args) {
    const result = super.copy(...args);
    result.dateFormat = this.dateFormat;
    result.timeSpan = this.timeSpan;
    return result;
  }
  afterChange(toSet, wasSet, silent) {
    const result = super.afterChange(toSet, wasSet, silent), { timeSpan } = this;
    if (!this.isSanitizing) {
      this.sanitize();
    }
    if (timeSpan) {
      timeSpan.sanitizeRecurrenceData(this);
      if (!this.isTimeSpanNotifyingSuspended) {
        timeSpan.onRecurrenceChanged();
      }
    }
    return result;
  }
  set(field, value, ...args) {
    const values = typeof field === "object" ? field : { [field]: value };
    if (values.count) {
      values.endDate = null;
    } else if (values.endDate) {
      values.count = null;
    }
    super.set(values, void 0, ...args);
  }
  get isTimeSpanNotifyingSuspended() {
    return Boolean(this._suspendedTimeSpanNotifying);
  }
  suspendTimeSpanNotifying() {
    this._suspendedTimeSpanNotifying++;
  }
  resumeTimeSpanNotifying() {
    if (this._suspendedTimeSpanNotifying)
      this._suspendedTimeSpanNotifying--;
  }
};
RecurrenceModel._$name = "RecurrenceModel";

// ../Scheduler/lib/Scheduler/model/mixin/RecurringTimeSpan.js
function convertExceptionDatesValue(value) {
  const result = {}, { dateFormat } = this;
  if (value) {
    value = typeof value == "string" ? value.split(",") : ArrayHelper.asArray(value);
    value.forEach((item) => {
      if (typeof item == "string") {
        item = DateHelper.parse(item, dateFormat);
      }
      if (!isNaN(item)) {
        result[DateHelper.makeKey(item)] = 1;
      }
    });
  }
  return result;
}
function serializeExceptionDatesValue(value) {
  const result = [], { dateFormat } = this;
  for (const date in value) {
    if (value[date]) {
      result.push(DateHelper.format(DateHelper.parseKey(date), dateFormat));
    }
  }
  return result;
}
var emptyArray3 = [];
var RecurringTimeSpan_default = (Target) => class RecurringTimeSpan extends (Target || TimeSpan) {
  static get $name() {
    return "RecurringTimeSpan";
  }
  /**
   * Returns `true` if this timespan supports recurring.
   * @property {Boolean}
   * @category Recurrence
   */
  get supportsRecurring() {
    return true;
  }
  static get fields() {
    return [
      /**
       * The timespan recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10)
       * described format ("RRULE" expression).
       * @field {String} recurrenceRule
       * @category Scheduling
       */
      {
        name: "recurrenceRule",
        internal: true
      },
      /**
       * A string (either a single date or multiple dates separated by comma) or an array of strings containing
       * the timespan exception dates. The dates that must be skipped when generating occurrences for a repeating
       * timespan. This is used to modify only individual occurrences of the timespan so the further regenerations
       * won't create another copy of this occurrence again.
       *
       * ```javascript
       * {
       *     id: 7,
       *     startDate: '2021-10-12T14:00:00',
       *     endDate: '2021-10-12T15:00:00',
       *     name: 'Lunch',
       *     resourceId: 'hotel',
       *     recurrenceRule: 'FREQ=DAILY;COUNT=5',
       *     exceptionDates: ['2021-10-14']
       * }
       * ```
       *
       * Use {@link #function-addExceptionDate} method to add an individual entry to the dates array:
       *
       * ```javascript
       * // Break the link between the occurrence and its base.
       * // This also adds the occurrence date as an exception date
       * // so that the base timespan knows that this date should be skipped when regenerating its occurrences.
       * occurrence.recurringTimeSpan = null;
       *
       * // now the occurrence is an individual record that can be changed & persisted freely
       * occurrence.setStartEndDate(new Date(2018, 6, 2), new Date(2018, 6, 3));
       * ```
       * **Note:** The dates in this field get automatically removed when the event changes its {@link Scheduler.model.TimeSpan#field-startDate start date}.
       *
       * @field {String|String[]} exceptionDates
       * @category Scheduling
       */
      {
        name: "exceptionDates",
        convert: convertExceptionDatesValue,
        serialize: serializeExceptionDatesValue,
        internal: true
      }
    ];
  }
  /**
   * Override of {@link Core/data/Model}'s method. If an {@link #property-isOccurrence}
   * is passed, it is detached from its parent recurring event. If it still has a recurrence
   * then the recurring event is changed to stop at the occurrence date. If it has no recurrence
   * an exception is added at the occurrence date.
   * @category Recurrence
   */
  remove() {
    if (this.isOccurrence) {
      const me = this, { recurringTimeSpan } = me;
      me.cancelBatch();
      recurringTimeSpan.beginBatch();
      me.detachFromRecurringEvent();
      recurringTimeSpan.endBatch();
    } else {
      return super.remove(...arguments);
    }
  }
  get eventStore() {
    var _a, _b;
    let result = this.isOccurrence && ((_a = this.recurringEvent) == null ? void 0 : _a.eventStore) || super.eventStore;
    if (!result && ((_b = this.firstStore) == null ? void 0 : _b.isRecurringTimeSpansMixin)) {
      result = this.firstStore;
    }
    return result;
  }
  /**
   * Name of the class representing the recurrence model, defaults to {@link Scheduler.model.RecurrenceModel}
   * @property {String}
   * @category Recurrence
   */
  get recurrenceModel() {
    return this._recurrenceModel || RecurrenceModel;
  }
  set recurrenceModel(model) {
    this._recurrenceModel = model;
  }
  /**
   * Sets a recurrence for the timespan with a given frequency, interval, and end.
   * @param {RecurrenceModelConfig|String|Scheduler.model.RecurrenceModel} recurrence A data object for an instance of
   * {@link Scheduler.model.RecurrenceModel}. May also be the frequency string: `DAILY`, `WEEKLY`, `MONTHLY`, or
   * `YEARLY`.
   *
   * ```javascript
   * // repeat the event every other week till Jan 2 2039
   * event.setRecurrence({
   *     frequency : "WEEKLY",
   *     interval  : 2,
   *     endDate   : new Date(2039, 0, 2)
   * });
   * ```
   *
   * Also a {@link Scheduler.model.RecurrenceModel recurrence model} can be provided as the only argument for this
   * method:
   *
   * ```javascript
   * const recurrence = new RecurrenceModel({ frequency : 'DAILY', interval : 5 });
   *
   * event.setRecurrence(recurrence);
   * ```
   *
   * or
   *
   * ```javascript
   * event.setRecurrence("WEEKLY", 2, new Date(2039, 0, 2));
   * ```
   * @param {Number} [interval] The interval between occurrences (instances of this recurrence). For example, a daily
   * recurrence with an interval of 2 occurs every other day. Must be greater than 0.
   * @param {Number|Date} [recurrenceEnd] The end of the recurrence. The value can be specified by a date or by a
   * maximum count of occurrences (has to greater than 1, since 1 means the event itself).
   * @category Recurrence
   */
  setRecurrence(recurrence, interval, recurrenceEnd) {
    const me = this;
    let recurrenceRule;
    if (recurrence) {
      if (!recurrence.isRecurrenceModel) {
        if (typeof recurrence === "string") {
          recurrence = {
            frequency: recurrence
          };
          if (interval) {
            recurrence.interval = interval;
          }
          if (recurrenceEnd) {
            if (recurrenceEnd instanceof Date) {
              recurrence.endDate = recurrenceEnd;
            } else {
              recurrence.count = recurrenceEnd;
            }
          }
        }
        recurrence = new me.recurrenceModel(recurrence);
      }
      recurrence.timeSpan = me;
      recurrenceRule = recurrence.rule;
    }
    me.recurrence = recurrence;
    me.recurrenceRule = recurrenceRule;
  }
  /**
   * The recurrence model used for the timespan.
   * @property {Scheduler.model.RecurrenceModel}
   * @category Recurrence
   */
  get recurrence() {
    const me = this, rule = me.recurrenceRule;
    if (!me._recurrence && rule) {
      me._recurrence = new me.recurrenceModel({ rule, timeSpan: me, id: `${me.id}-recurrence` });
    }
    return me._recurrence;
  }
  set recurrence(recurrence) {
    const me = this;
    me._recurrence = recurrence;
    if (recurrence) {
      recurrence.timeSpan = me;
      me.recurrenceRule = recurrence.rule;
    } else {
      if (me.isOccurrence) {
        me.setData("recurrenceRule", null);
      } else {
        me.recurrenceRule = null;
      }
    }
  }
  /**
   * Indicates if the timespan is recurring.
   * @property {Boolean}
   * @readonly
   * @category Recurrence
   */
  get isRecurring() {
    return Boolean(!this.isOccurrence && this.recurrence);
  }
  /**
   * Indicates if the timespan is an occurrence of another recurring timespan.
   * @property {Boolean}
   * @readonly
   * @category Recurrence
   */
  get isOccurrence() {
    return Boolean(this.recurringTimeSpan);
  }
  /**
   * The "main" timespan this model is an occurrence of. For non-occurrences returns `null`.
   * @property {Scheduler.model.TimeSpan}
   * @readonly
   * @internal
   * @category Recurrence
   */
  get recurringTimeSpan() {
    return this._recurringTimeSpan;
  }
  get isPersistable() {
    return super.isPersistable && (!this.supportsRecurring || !this.isOccurrence);
  }
  set recurringTimeSpan(recurringTimeSpan) {
    this._recurringTimeSpan = recurringTimeSpan;
  }
  /**
   * Returns the occurrences of this event over the specified time range. If the first
   * occurrence is in the time range `*this*` record is included in that position.
   * @param {Date} startDate The start date of the range for which to include occurrences.
   * @param {Date} [endDate] The end date of the range for which to include occurrences.
   * Defaults to the startDate.
   * @returns {Scheduler.model.TimeSpan[]} The array of occurrences which occur over the specified range.
   * @category Recurrence
   */
  getOccurrencesForDateRange(startDate, endDate = startDate) {
    return this.eventStore.getOccurrencesForTimeSpan(this, startDate, endDate);
  }
  /**
   * Array of this recurring timespan's cached occurrences. __Not including the owning recurring
   * event__.
   *
   * Empty if the timespan is not recurring.
   *
   * __Note that this is an internal accessor and is cleared whenever changes are made to the
   * owning recurring event__.
   * @property {Scheduler.model.TimeSpan[]}
   * @readonly
   * @internal
   * @category Recurrence
   */
  get occurrences() {
    if (this.isRecurring) {
      const result = [];
      this.occurrenceMap.forEach((occurrence) => {
        if (occurrence !== this) {
          result.push(occurrence);
        }
      });
      return result;
    }
    return emptyArray3;
  }
  /**
   * A Map, keyed by each date an occurrence intersects, of occurrences of this event.
   * @property {Map}
   * @readonly
   * @internal
   * @category Recurrence
   */
  get occurrenceMap() {
    return this._occurrencesMap || (this._occurrencesMap = /* @__PURE__ */ new Map());
  }
  /**
   * Removes an occurrence from this recurring timespan's cached occurrences.
   * @param dateOrTimeSpan occurrence date or occurrence TimeSpan
   * @internal
   * @category Recurrence
   */
  removeOccurrence(dateOrTimeSpan, eventStore = this.eventStore) {
    const date = dateOrTimeSpan.isTimeSpan ? dateOrTimeSpan.occurrenceDate : dateOrTimeSpan;
    eventStore == null ? void 0 : eventStore.globalOccurrences.delete(this.createRecurrenceKey(date));
    this.occurrenceMap.delete(DateHelper.makeKey(date));
  }
  /**
   * Removes all cached occurrences on or after the passed date from this recurring timespan's cached occurrences.
   * @internal
   * @category Recurrence
   */
  removeOccurrencesFrom(date) {
    this.occurrenceMap.forEach((occurrence, dateKey) => {
      if (DateHelper.parseKey(dateKey) >= date) {
        this.removeOccurrence(occurrence);
      }
    });
  }
  /**
   * Removes this recurring timespan's cached occurrences.
   * @internal
   * @category Recurrence
   */
  removeOccurrences(eventStore) {
    [this, ...this.occurrences].forEach((occurrence) => this.removeOccurrence(occurrence, eventStore));
  }
  /**
   * The method is triggered when the timespan recurrence settings get changed.
   * It updates the {@link #field-recurrenceRule} field in this case.
   * @internal
   * @category Recurrence
   */
  onRecurrenceChanged() {
    var _a;
    this.recurrenceRule = ((_a = this.recurrence) == null ? void 0 : _a.rule) || null;
  }
  sanitizeRecurrenceData(recurrence = this.recurrence) {
    if (recurrence.endDate) {
      const endDate = DateHelper.clearTime(recurrence.endDate), { exceptionDates } = this;
      this.removeOccurrencesFrom(endDate);
      if (exceptionDates) {
        for (const dateKey in exceptionDates) {
          const exceptionDate = DateHelper.parseKey(dateKey);
          if (exceptionDate >= endDate) {
            delete exceptionDates[dateKey];
          }
        }
      }
    }
  }
  /**
   * The original {@lScheduler.model.TimeSpan#field-startDate startDate} of this event before any modifications
   * took place. Used by {@link #function-removeOccurrence} and {@link #function-detachFromRecurringEvent}
   * @internal
   * @readonly
   * @category Recurrence
   */
  get occurrenceDate() {
    var _a;
    return ((_a = this.meta.modified) == null ? void 0 : _a.startDate) || this.startDate;
  }
  /**
   * If this event is an {@link #property-isOccurrence occurrence} of a recurring event, then this
   * property yields its zero-based occurrence index in the sequence.
   * @property {Number}
   * @readonly
   * @category Recurrence
   */
  get occurrenceIndex() {
    return AbstractRecurrenceIterator.getOccurrenceIndex(this);
  }
  /**
   * Builds an occurrence of this recurring event by cloning the timespan data.
   * The method is used internally by the __RecurringTimeSpans__ mixin.
   * Override it if you need to customize the generated occurrences.
   *
   * If the date requested is the start date of the event sequence, `this`
   * record is returned. All runs of recurring events begin with the base record.
   * @param  {Date} occurrenceDate The occurrence start date.
   * @param  {Boolean} isFirst `true` if this is the first occurrence.
   * @returns {Scheduler.model.TimeSpan} The occurrence.
   * @internal
   * @category Recurrence
   */
  buildOccurrence(occurrenceDate, isFirst) {
    var _a;
    const me = this, {
      occurrenceMap,
      recurrence,
      meta
    } = me, globalOccurrences = (_a = me.eventStore) == null ? void 0 : _a.globalOccurrences, occurrenceKey = DateHelper.makeKey(occurrenceDate), id = me.createRecurrenceKey(occurrenceDate, occurrenceKey), onStartDate = !(occurrenceDate - me.startDate), { fieldMap } = me.constructor;
    let occurrence = globalOccurrences == null ? void 0 : globalOccurrences.get(id), { duration } = me;
    if (me.endDate && (me.allDay || !duration)) {
      duration = DateHelper.as(me.durationUnit, me.endDate.getTime() - me.startDate.getTime());
    }
    const occurrenceEndDate = duration !== void 0 ? DateHelper.add(occurrenceDate, duration, me.durationUnit) : void 0;
    if (!occurrence) {
      if (isFirst || onStartDate) {
        occurrence = me;
        if (!onStartDate) {
          me.setStartEndDate(occurrenceDate, occurrenceEndDate, true);
          recurrence.suspendTimeSpanNotifying();
          recurrence.sanitize();
          recurrence.resumeTimeSpanNotifying();
        }
        meta.isSyncedWithRule = true;
      } else {
        occurrence = me.copy(
          {
            [fieldMap.id.dataSource]: id,
            [fieldMap.startDate.dataSource]: occurrenceDate,
            [fieldMap.endDate.dataSource]: occurrenceEndDate,
            [fieldMap.duration.dataSource]: duration,
            constraintDate: null,
            constraintType: null
          },
          { creatingOccurrence: true }
        );
        occurrence.recurringTimeSpan = me;
      }
      globalOccurrences == null ? void 0 : globalOccurrences.set(id, occurrence);
      occurrenceMap.set(occurrenceKey, occurrence);
    }
    return occurrence;
  }
  createRecurrenceKey(date = this.startDate, dateKey = null) {
    return `_generated:${this.id}:${dateKey || DateHelper.makeKey(date)}`;
  }
  // Converts this occurrence to a new "master" event
  convertToRealEvent(wasSet, silent) {
    var _a;
    if (!this.isOccurrence) {
      return;
    }
    const me = this, {
      recurringTimeSpan,
      resource,
      occurrenceIndex,
      recurrence
    } = me, count = recurrence && recurringTimeSpan.recurrence.count, newResource = ((_a = wasSet == null ? void 0 : wasSet.resourceRecords) == null ? void 0 : _a.value) || me.data.newResource;
    recurringTimeSpan.beginBatch();
    me.detachFromRecurringEvent();
    me.clearChanges();
    me.setData("id", me.generateId(recurringTimeSpan.eventStore));
    if (newResource) {
      delete me.data.resourceId;
    }
    recurringTimeSpan.eventStore.add(me, silent);
    if (count) {
      me.recurrence.count = count - occurrenceIndex;
    }
    if (newResource || resource) {
      me.assign(newResource || resource);
    }
    if (newResource) {
      delete me.data.resourceRecords;
    }
    if (wasSet) {
      delete wasSet.resourceRecords;
    }
    recurringTimeSpan.endBatch();
  }
  afterChange(toSet, wasSet, silent, ...args) {
    const me = this, { eventStore } = me;
    if ("recurrenceRule" in wasSet) {
      me._recurrence = null;
      eventStore == null ? void 0 : eventStore.recurringEvents[wasSet.recurrenceRule.value ? "add" : "delete"](me);
    }
    if (me.isOccurrence) {
      me.convertToRealEvent(wasSet, silent);
    } else if ("newExceptionDate" in wasSet) {
      me.meta.modified.exceptionDates = true;
      delete me.meta.modified.newExceptionDate;
      me.removeOccurrence(wasSet.newExceptionDate.value);
    }
    return super.afterChange(toSet, wasSet, silent, ...args);
  }
  /**
   * Detaches an occurrence from its owning recurring event so that it can be added to the eventStore
   * either as an exception, or as the start of a new recurring sequence.
   * @internal
   * @category Recurrence
   */
  detachFromRecurringEvent() {
    const me = this, { recurringTimeSpan, occurrenceDate, startDate } = me;
    me.recurringTimeSpan = null;
    recurringTimeSpan.addExceptionDate(occurrenceDate);
    if (me.recurrenceRule) {
      recurringTimeSpan.recurrence.endDate = DateHelper.add(startDate, -1, "minute");
    }
  }
  /**
   * The setter used by Model#inSet when {@link #function-addExceptionDate} is called.
   * Adding an exception must trigger change processing in a recurring event, so it must
   * be changed through a {@link Core.data.Model#function-set} call. Also, the change must be batchable
   * with other changes.
   * @private
   * @readonly
   * @category Recurrence
   */
  set newExceptionDate(date) {
    if (date) {
      const exceptionDates = this.exceptionDates || (this.exceptionDates = {});
      exceptionDates[DateHelper.makeKey(date)] = 1;
    }
  }
  /**
   * Adds an exception date that should be skipped when generating occurrences for the timespan.
   * The methods adds an entry to the array kept in {@link #field-exceptionDates} field.
   * @param {Date} date Exception date.
   * @internal
   * @category Recurrence
   */
  addExceptionDate(newExceptionDate) {
    return this.set({
      newExceptionDate
    });
  }
  /**
   * Does this recurring event have an exception on the passed date.
   * @param {Date} date The date to find an exception for.
   * @returns {Boolean} `true` if the event has an exception starting on the passed date.
   * @category Recurrence
   */
  hasException(date) {
    var _a;
    return (_a = this.exceptionDates) == null ? void 0 : _a[DateHelper.makeKey(date)];
  }
};

// ../Scheduler/lib/Scheduler/model/mixin/EventModelMixin.js
var oneDayMS = 1e3 * 60 * 60 * 24;
var EventModelMixin_default = (Target) => class EventModelMixin extends Target {
  static get $name() {
    return "EventModelMixin";
  }
  // Flag checked by EventStore to make sure it uses a valid subclass
  static get isEventModel() {
    return true;
  }
  /**
   * Set value for the specified field(s), triggering engine calculations immediately. See
   * {@link Core.data.Model#function-set Model#set()} for arguments.
   *
   * ```javascript
   * eventRecord.set('duration', 4);
   * // eventRecord.endDate is not yet calculated
   *
   * await eventRecord.setAsync('duration', 4);
   * // eventRecord.endDate is calculated
   * ```
   *
   * @param {String|Object} field The field to set value for, or an object with multiple values to set in one call
   * @param {*} [value] Value to set
   * @param {Boolean} [silent=false] Set to true to not trigger events. If event is recurring, occurrences won't be updated
   * automatically.
   * @function setAsync
   * @category Editing
   * @async
   */
  //region Fields
  static get fields() {
    return [
      /**
       * The start date of a time span (or Event / Task).
       *
       * Uses {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat} to convert a
       * supplied string to a Date. To specify another format, either change that setting or subclass TimeSpan and
       * change the dateFormat for this field.
       *
       * UI fields representing this data field are disabled for summary tasks. See {@link #function-isEditable}
       * for details.
       *
       * Note that the field always returns a `Date`.
       *
       * Also note that modifying the `startDate` at runtime will move the event in time, without affecting its
       * duration (with reservation for other scheduling logic affecting the duration). If you want to change the
       * `startDate` and `duration`, use {@link Scheduler/model/TimeSpan#function-setStartDate} instead (passing
       * `false` as the second argument).
       *
       * @field {Date} startDate
       * @accepts {String|Date}
       * @category Scheduling
       */
      /**
       * The end date of a time span (or Event / Task).
       *
       * Uses {@link Core/helper/DateHelper#property-defaultFormat-static DateHelper.defaultFormat} to convert a
       * supplied string to a Date. To specify another format, either change that setting or subclass TimeSpan and
       * change the dateFormat for this field.
       *
       * UI fields representing this data field are disabled for summary tasks. See {@link #function-isEditable} for details.
       *
       * Note that the field always returns a `Date`.
       *
       * @field {Date} endDate
       * @accepts {String|Date}
       * @category Scheduling
       */
      /**
       * The numeric part of the timespan's duration (the number of units).
       *
       * UI fields representing this data field are disabled for summary tasks. See {@link #function-isEditable}
       * for details.
       *
       * @field {Number} duration
       * @category Scheduling
       */
      /**
       * Calculated field which encapsulates the duration's magnitude and unit. This field will not be persisted,
       * setting it will update the {@link #field-duration} and
       * {@link Scheduler.model.TimeSpan#field-durationUnit} fields.
       *
       * UI fields representing this data field are disabled for summary tasks. See {@link #function-isEditable}
       * for details.
       *
       * @field {DurationConfig|Core.data.Duration} fullDuration
       * @category Scheduling
       */
      /**
       * The unique identifier of a task (mandatory)
       * @field {String|Number} id
       * @category Common
       */
      /**
       * Id of the resource this event is associated with (only usable for single assignments). We recommend
       * using assignments in an AssignmentStore over this approach. Internally any Event using `resourceId`
       * will have an assignment in AssignmentStore generated.
       * @field {String|Number} resourceId
       * @category Common
       */
      {
        name: "resourceId",
        internal: true
      },
      /**
       * Ids of the resources this event is associated with (can be used for for multiple assignments).
       * Any event using `resourceIds` will have assignments in AssignmentStore generated automatically.
       * It only applies if is configured with `perist: true`.
       * ```javascript
       *   class CustomEventModel extends EventModel {
       *       static get $name() {
       *           return 'CustomEventModel';
       *       }
       *
       *       static get fields() {
       *           return [
       *               { name : 'resourceIds', persist : true }
       *           ];
       *       }
       *   };
       *
       *   const
       *       resources   = [
       *           { id : 'r1', name : 'Celia' },
       *           { id : 'r2', name : 'Lee' },
       *           { id : 'r3', name : 'Macy' },
       *           { id : 'r4', name : 'Madison' }
       *       ],
       *       events      = [
       *           {
       *               id          : 1,
       *               resourceIds : ['r1', 'r2']
       *               ...
       *           },
       *           {
       *               id          : 2,
       *               resourceIds : ['r3', 'r4']
       *               ...
       *           }
       *       ];
       *
       *   const scheduler = new Scheduler({
       *       ...
       *       eventStore : {
       *           modelClass : CustomEventModel,
       *           data       : events
       *       },
       *       ...
       *   });
       * ```
       * @field {String[]|Number[]} resourceIds
       * @category Common
       */
      {
        name: "resourceIds",
        type: "array",
        persist: false,
        internal: true
      },
      /**
       * The array of {@link Scheduler.model.ResourceModel resources} which are assigned to this event.
       * @field {Scheduler.model.ResourceModel[]} resources
       * @category Common
       */
      {
        name: "resources",
        column: {
          type: "resourceassignment"
        },
        persist: false,
        internal: true,
        useProp: true
      },
      /**
       * Specify false to prevent the event from being dragged (if EventDrag feature is used)
       * @field {Boolean} draggable
       * @default true
       * @category Interaction
       */
      {
        name: "draggable",
        type: "boolean",
        persist: false,
        defaultValue: true,
        internal: true
      },
      /**
       * Specify `false` to prevent the event from being resized (if EventResize feature is used). You can also
       * specify `'start'` or `'end'` to only allow resizing in one direction
       * @field {Boolean|String} resizable
       * @default true
       * @category Interaction
       */
      {
        name: "resizable",
        persist: false,
        defaultValue: true,
        internal: true
      },
      // true, false, 'start' or 'end'
      /**
       * A field marking event as all day(s) spanning event.
       * For example, a holiday day may be represented by a `startDate`, and the `allDay` flag.
       * @field {Boolean} allDay
       * @category Scheduling
       */
      {
        name: "allDay",
        type: "boolean",
        defaultValue: false
      },
      /**
       * Controls this events appearance, see Schedulers
       * {@link Scheduler.view.mixin.TimelineEventRendering#config-eventStyle eventStyle config} for
       * available options.
       * @field {'plain'|'border'|'colored'|'hollow'|'line'|'dashed'|'minimal'|'rounded'|'calendar'|'interday'|null} eventStyle
       * @category Styling
       */
      {
        name: "eventStyle",
        internal: true
      },
      /**
       * Controls the primary color of the event. For available standard colors, see
       * {@link #typedef-EventColor}.
       * @field {EventColor|String|null} eventColor
       * @category Styling
       */
      {
        name: "eventColor",
        internal: true
      },
      /**
       * Width (in px) to use for this milestone when using Scheduler#milestoneLayoutMode 'data'.
       * @field {Number} milestoneWidth
       * @category Styling
       */
      {
        name: "milestoneWidth",
        internal: true
      },
      /**
       * Set this field to `false` to opt out of {@link Scheduler.feature.StickyEvents sticky event content}
       * (keeping event text in view while scrolling).
       * @field {Boolean} stickyContents
       * @category Styling
       */
      {
        name: "stickyContents",
        internal: true
      }
    ];
  }
  //endregion
  //region Id change
  updateAssignmentEventIds() {
    this.assigned.forEach((assignment) => {
      assignment.eventId = this.id;
    });
  }
  syncId(value) {
    super.syncId(value);
    this.updateAssignmentEventIds();
  }
  //endregion
  // This method is used by the `autoUpdateRecord` mode of the resource assignment field
  // here we route the resources update to the correct setter
  setValue(fieldName, value) {
    var _a;
    if (fieldName === "resource" && !this.usesSingleAssignment) {
      this.resources = (_a = ArrayHelper.asArray(value)) != null ? _a : [];
    } else {
      return super.setValue(fieldName, value);
    }
  }
  //region Resources
  /**
   * Returns all resources assigned to an event.
   *
   * @property {Scheduler.model.ResourceModel[]}
   * @category Assignments & Resources
   * @readonly
   */
  get resources() {
    return this.assignments.reduce((resources, { resource }) => {
      resource && resources.push(resource.$original);
      return resources;
    }, []);
  }
  set resources(resources) {
    var _a;
    resources = ArrayHelper.asArray(resources);
    const me = this, newResourceIds = resources.map(me.constructor.asId);
    if (me.usesSingleAssignment) {
      me.set("resourceId", newResourceIds[0]);
    } else if ((_a = me.fieldMap) == null ? void 0 : _a.resourceIds.persist) {
      me.resourceIds = newResourceIds;
    } else {
      const existingResourceIds = me.assignments.map((a) => a.resource.id), { onlyInA: toAdd, onlyInB: toRemove } = ArrayHelper.delta(newResourceIds, existingResourceIds);
      me.assignmentStore.add(toAdd.map((resourceId) => ({ resource: resourceId, event: me })));
      me.assignmentStore.remove(toRemove.map((resourceId) => me.assignments.find((a) => a.resource.id === resourceId)));
    }
  }
  /**
   * Iterate over all associated resources
   * @private
   * @category Assignments & Resources
   */
  forEachResource(fn2, thisObj = this) {
    for (const resource of this.resources) {
      if (fn2.call(thisObj, resource) === false) {
        return;
      }
    }
  }
  /**
   * Returns either the resource associated with this event (when called w/o `resourceId`) or resource
   * with specified id.
   *
   * @param {String} [resourceId] To retrieve a specific resource
   * @returns {Scheduler.model.ResourceModel}
   * @category Assignments & Resources
   */
  getResource(resourceId) {
    if (resourceId == null) {
      return this.resource;
    }
    return this.resourceStore ? this.resourceStore.getById(resourceId) : null;
  }
  //endregion
  //region Dates
  get startDate() {
    var _a;
    let dt;
    if (this.isOccurrence) {
      dt = this.get("startDate");
    } else {
      dt = (_a = this._startDate) != null ? _a : super.startDate;
    }
    if (this.allDay) {
      dt = this.constructor.getAllDayStartDate(dt);
    }
    return dt;
  }
  set startDate(startDate) {
    if (this.batching) {
      this._startDate = startDate;
      this.set({ startDate });
    } else {
      super.startDate = startDate;
    }
  }
  get endDate() {
    var _a;
    let dt;
    if (this.isOccurrence) {
      dt = this.get("endDate");
    } else {
      dt = (_a = this._endDate) != null ? _a : super.endDate;
    }
    if (this.allDay) {
      dt = this.constructor.getAllDayEndDate(dt);
    }
    return dt;
  }
  set endDate(endDate) {
    if (this.batching) {
      this._endDate = endDate;
      this.set({ endDate });
    } else {
      super.endDate = endDate;
    }
  }
  // Cannot use `convert` method because it might be disabled by `useRawData : true` and we always need to calculate
  // that value
  get wrapStartDate() {
    return this.startDate;
  }
  set wrapStartDate(value) {
  }
  get wrapEndDate() {
    return this.endDate;
  }
  set wrapEndDate(value) {
  }
  /**
   * Shift the dates for the date range by the passed amount and unit
   * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} unit The unit to shift by, see {@link Core.helper.DateHelper}
   * for more information on valid formats.
   * @param {Number} amount The amount to shift
   * @returns {Promise} A promise which is resolved when shift calculations are done
   * @async
   * @method shift
   * @category Scheduling
   */
  //endregion
  //region Is
  // Used internally to differentiate between Event and ResourceTimeRange
  get isEvent() {
    return true;
  }
  /**
   * Returns true if event can be drag and dropped
   * @property {Boolean}
   * @category Editing
   */
  get isDraggable() {
    return !this.readOnly && this.draggable;
  }
  /**
   * Returns true if event can be resized, but can additionally return 'start' or 'end' indicating how this event can
   * be resized.
   *
   * Milestones and parent events (that are not manuallyScheduled) cannot be resized.
   *
   * @property {Boolean|String}
   * @readonly
   * @category Editing
   */
  get isResizable() {
    return !this.isMilestone && (!this.isParent || this.manuallyScheduled) && this.resizable;
  }
  /**
   * Returns false if the event is not persistable. By default it always is, override this getter if you need
   * custom logic.
   *
   * @property {Boolean}
   * @readonly
   * @category Editing
   */
  get isPersistable() {
    return super.isPersistable && !this.isCreating;
  }
  endBatch(silent, skipAccessors, triggerBeforeUpdate) {
    const me = this, wasPersistable = me.isPersistable;
    super.endBatch(silent, skipAccessors, triggerBeforeUpdate);
    if (me.isPersistable && !wasPersistable && !me.ignoreBag && me.assigned) {
      for (const assignment of me.assigned) {
        assignment.stores.forEach(
          (s) => s.updateModifiedBagForRecord(assignment)
        );
      }
    }
  }
  get isCreating() {
    return super.isCreating;
  }
  set isCreating(value) {
    var _a, _b;
    super.isCreating = value;
    (_a = this.assignmentStore) == null ? void 0 : _a.suspendAutoCommit();
    this.assignments.forEach((record) => record.isCreating = value);
    (_b = this.assignmentStore) == null ? void 0 : _b.resumeAutoCommit();
  }
  //endregion
  //region Single assignment compatibility
  get usesSingleAssignment() {
    return !this.eventStore || this.eventStore.usesSingleAssignment;
  }
  copy(...args) {
    const copy = super.copy(...args);
    if (!this.usesSingleAssignment) {
      copy.resourceId = null;
    }
    return copy;
  }
  /**
   * Override persistable getter to prevent sending resourceId when using multiple resource assignment mode
   * https://github.com/bryntum/support/issues/1345
   * @private
   */
  get persistableData() {
    const data = super.persistableData;
    if (!this.usesSingleAssignment) {
      delete data.resourceId;
    }
    return data;
  }
  /**
   * Returns the first assigned resource, or assigns a resource
   * @member {Scheduler.model.ResourceModel} resource
   * @category Assignments & Resources
   */
  get resource() {
    const { resources } = this;
    return resources.length ? resources[0] : null;
  }
  set resource(resourceRecord) {
    this.resourceId = this.constructor.asId(resourceRecord);
  }
  get resourceId() {
    var _a;
    return this.usesSingleAssignment ? this.get("resourceId") : (_a = this.assignments[0]) == null ? void 0 : _a.resourceId;
  }
  set resourceId(resourceId) {
    this.applyResourceId(resourceId);
  }
  get resourceIds() {
    var _a, _b, _c;
    if ((_a = this.fieldMap) == null ? void 0 : _a.resourceIds.persist) {
      return this.get("resourceIds");
    } else {
      return (_c = (_b = this.resources) == null ? void 0 : _b.map((r) => r.id)) != null ? _c : [];
    }
  }
  set resourceIds(ids) {
    this.set("resourceIds", ids);
  }
  // Resources + any links to any of them
  get $linkedResources() {
    var _a, _b;
    return (_b = (_a = this.resources) == null ? void 0 : _a.flatMap((resourceRecord) => [
      resourceRecord,
      ...resourceRecord.$links
    ])) != null ? _b : [];
  }
  applyResourceId(resourceId, fromApplyValue = false) {
    var _a, _b;
    const me = this, { eventStore, assignments } = me;
    if (eventStore) {
      const assignmentStore = eventStore.assignmentStore || ((_a = eventStore.crudManager) == null ? void 0 : _a.assignmentStore);
      if (resourceId != null) {
        if (!me.meta.skipEnforcingSingleAssignment) {
          eventStore.usesSingleAssignment = true;
        }
        if ((assignments == null ? void 0 : assignments.length) && resourceId !== assignments[0].resourceId) {
          const eventsSuspended = Boolean(eventStore.eventsSuspended);
          eventsSuspended && assignmentStore.suspendEvents();
          assignments[0].resource = resourceId;
          eventsSuspended && assignmentStore.resumeEvents();
        } else {
          assignmentStore.assignEventToResource(me, resourceId);
        }
      } else if (me.usesSingleAssignment || ((_b = me.resourceIds) == null ? void 0 : _b.length)) {
        assignmentStore.remove(assignments);
      }
    } else if (!fromApplyValue) {
      me.set({ resourceId });
    }
  }
  applyResourceIds(resourceIds, fromApplyValue = false) {
    var _a;
    const me = this, { eventStore, assignments } = me;
    if (me.fieldMap["resourceIds"].persist === false) {
      return false;
    }
    resourceIds = [...new Set(resourceIds)];
    if (eventStore) {
      const assignmentStore = eventStore.assignmentStore || ((_a = eventStore.crudManager) == null ? void 0 : _a.assignmentStore);
      if (resourceIds == null ? void 0 : resourceIds.length) {
        if (assignments == null ? void 0 : assignments.length) {
          const eventsSuspended = Boolean(eventStore.eventsSuspended);
          eventsSuspended && assignmentStore.suspendEvents();
          assignments.forEach((assignment) => {
            const resourceIdToUpdate = resourceIds.find((resourceId) => !assignments.some((a) => a.resourceId === resourceId));
            if (resourceIdToUpdate) {
              assignment.resource = resourceIdToUpdate;
            }
          });
          const { onlyInA: toAdd, onlyInB: toRemove } = ArrayHelper.delta(resourceIds, assignments.map((assignment) => assignment.resourceId));
          assignmentStore.add(toAdd.map((resourceId) => ({ resource: resourceId, event: me })));
          assignmentStore.remove(toRemove.map((resourceId) => assignments.find((a) => a.resource.id === resourceId)));
          eventsSuspended && assignmentStore.resumeEvents();
        } else {
          assignmentStore.add(resourceIds.map((resourceId) => ({ resource: resourceId, event: me })));
        }
      } else {
        assignmentStore.remove(assignments);
      }
    } else if (!fromApplyValue) {
      me.set({ resourceIds });
    }
  }
  // Special handling of setting resourceId and resourceIds, creates assignment
  applyValue(useProp, mapping, value, skipAccessors, field) {
    if (field && !this.meta.isAssigning) {
      const { eventStore } = this;
      switch (field.name) {
        case "resourceId":
          eventStore && (eventStore.isAssigning = true);
          this.applyResourceId(value, true);
          break;
        case "resourceIds":
          eventStore && (eventStore.isAssigning = true);
          this.applyResourceIds(value, true);
          break;
      }
      eventStore && (eventStore.isAssigning = false);
    }
    super.applyValue(useProp, mapping, value, skipAccessors, field);
  }
  //endregion
  //region Assignment
  /**
   * Returns all assignments for the event. Event must be part of the store for this method to work.
   * @property {Scheduler.model.AssignmentModel[]}
   * @readonly
   * @category Assignments & Resources
   */
  get assignments() {
    return [...this.assigned || []];
  }
  /**
   * Assigns this event to the specified resource.
   *
   * *Note:* The event must be part of an EventStore for this to work. If the EventStore uses single assignment
   * (loaded using resourceId) existing assignments will always be removed.
   *
   * @param {Scheduler.model.ResourceModel|String|Number|Scheduler.model.ResourceModel[]|String[]|Number[]} resource A new resource for this event, either as a full
   *        Resource record or an id (or an array of such).
   * @param {Boolean} [removeExistingAssignments] `true` to first remove existing assignments
   * @typings removeExistingAssignments -> {Boolean||Number}
   * @category Assignments & Resources
   * @typings async
   */
  assign(resource, removeExistingAssignments = false) {
    const { eventStore } = this;
    if (eventStore && !eventStore.usesSingleAssignment) {
      eventStore.assignEventToResource(this, resource, removeExistingAssignments);
    } else {
      this.resourceId = this.constructor.asId(resource);
      if (!eventStore) {
        this.meta.skipEnforcingSingleAssignment = true;
      }
    }
  }
  /**
   * Unassigns this event from the specified resource
   *
   * @param {Scheduler.model.ResourceModel|String|Number} [resource] The resource to unassign from.
   * @category Assignments & Resources
   * @typings async
   */
  unassign(resource, removingResource = false) {
    var _a;
    const me = this;
    resource = me.constructor.asId(resource);
    me.meta.removingResource = removingResource;
    (_a = me.eventStore) == null ? void 0 : _a.unassignEventFromResource(me, resource);
    me.meta.removingResource = null;
  }
  /**
   * Reassigns an event from an old resource to a new resource
   *
   * @param {Scheduler.model.ResourceModel|String|Number} oldResourceId A resource to unassign from or its id
   * @param {Scheduler.model.ResourceModel|String|Number} newResourceId A resource to assign to or its id
   * @category Assignments & Resources
   */
  reassign(oldResourceId, newResourceId) {
    this.eventStore && this.eventStore.reassignEventFromResourceToResource(this, oldResourceId, newResourceId);
  }
  /**
   * Returns true if this event is assigned to a certain resource.
   *
   * @param {Scheduler.model.ResourceModel|String|Number} resource The resource to query for
   * @returns {Boolean}
   * @category Assignments & Resources
   */
  isAssignedTo(resource) {
    const resourceId = this.constructor.asId(resource);
    return this.assignments.some((assignment) => assignment.resourceId === resourceId);
  }
  //endregion
  //region Dependencies
  /**
   * Returns all predecessor dependencies of this event
   *
   * @readonly
   * @property {Scheduler.model.DependencyBaseModel[]}
   * @category Dependencies
   */
  get predecessors() {
    var _a;
    return [...(_a = this.incomingDeps) != null ? _a : []];
  }
  /**
   * Returns all successor dependencies of this event
   *
   * @readonly
   * @property {Scheduler.model.DependencyBaseModel[]}
   * @category Dependencies
   *
   */
  get successors() {
    var _a;
    return [...(_a = this.outgoingDeps) != null ? _a : []];
  }
  get dependencies() {
    var _a, _b;
    return [...(_a = this.incomingDeps) != null ? _a : [], ...(_b = this.outgoingDeps) != null ? _b : []];
  }
  //endregion
  normalize() {
  }
  inSetNormalize() {
  }
  /**
   * The "main" event this model is an occurrence of.
   * Returns `null` for non-occurrences.
   * @property {Scheduler.model.EventModel}
   * @alias #Scheduler.model.mixin.RecurringTimeSpan#property-recurringTimeSpan
   * @readonly
   * @category Scheduling
   */
  get recurringEvent() {
    return this.recurringTimeSpan;
  }
  /**
   * Flag which indicates that this event is an interday event. This means that it spans
   * an entire day or multiple days.
   *
   * This is essentially used by the Calendar package to determine if an event should
   * go into the all day zone of a DayView.
   *
   * @property {Boolean}
   * @readonly
   * @category Scheduling
   */
  get isInterDay() {
    const { durationMS } = this;
    if (durationMS >= oneDayMS || !durationMS && this.allDay) {
      return true;
    }
    const {
      endDate,
      startDate
    } = this, eventStartMidnight = DateHelper.clearTime(startDate);
    if (startDate && endDate) {
      eventStartMidnight.setDate(eventStartMidnight.getDate() + 1);
      return (endDate || DateHelper.add(startDate, durationMS)) > eventStartMidnight;
    }
  }
  //region All day statics
  static getAllDayStartDate(dt) {
    if (dt && dt.isEvent) {
      dt = dt.get("startDate");
    }
    if (dt) {
      dt = DateHelper.clearTime(dt, true);
    }
    return dt;
  }
  static getAllDayEndDate(dt) {
    if (dt && dt.isEvent) {
      dt = dt.get("endDate");
    }
    if (dt && (dt.getHours() > 0 || dt.getMinutes() > 0 || dt.getSeconds() > 0 || dt.getMilliseconds() > 0)) {
      dt = DateHelper.getNext(dt, "d", 1);
    }
    return dt;
  }
  static getAllDayDisplayStartDate(dt) {
    if (dt && dt.isEvent) {
      dt = dt.get("startDate");
    }
    return DateHelper.clearTime(dt, true);
  }
  static getAllDayDisplayEndDate(startDate, endDate) {
    if (startDate && startDate.isEvent) {
      endDate = startDate.get("endDate");
      startDate = startDate.get("startDate");
    }
    if (endDate) {
      startDate = this.constructor.getAllDayDisplayStartDate(startDate);
      if (DateHelper.clearTime(endDate, true).valueOf() === endDate.valueOf()) {
        endDate = DateHelper.add(endDate, DateHelper.DAY, -1);
      } else if (startDate.valueOf() !== endDate.valueOf()) {
        endDate = DateHelper.clearTime(endDate, true);
      }
    }
    return endDate;
  }
  /**
   * Defines if the given event field should be manually editable in UI.
   * You can override this method to provide your own logic.
   *
   * By default, the method defines {@link #field-endDate}, {@link #field-duration} and {@link #field-fullDuration}
   * fields editable for leaf events only (in case the event is part of a tree store) and all other fields as
   * editable.
   *
   * @param {String} fieldName Name of the field
   * @returns {Boolean} Returns `true` if the field is editable, `false` if it is not and `undefined` if the event has
   * no such field.
   * @category Editing
   */
  isEditable(fieldName) {
    switch (fieldName) {
      case "endDate":
      case "duration":
      case "fullDuration":
        return this.isLeaf;
    }
    return super.isEditable(fieldName);
  }
  //endregion
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreEventMixin.js
var CoreEventMixin = class extends Mixin([CorePartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CoreEventMixin2 extends base {
    constructor() {
      super(...arguments);
      this._startDate = null;
      this._endDate = null;
      this._duration = null;
    }
    // Proper engine defines these fields since they enter graph, thus we need them
    static get fields() {
      return [
        { name: "startDate", type: "date" },
        { name: "endDate", type: "date" },
        { name: "duration", type: "number" },
        { name: "durationUnit", type: "durationunit", defaultValue: "day" }
      ];
    }
    // Getters return current or proposed value
    get startDate() {
      var _a, _b;
      return (_b = (_a = this._startDate) != null ? _a : this.get("startDate")) != null ? _b : null;
    }
    get endDate() {
      var _a, _b;
      return (_b = (_a = this._endDate) != null ? _a : this.get("endDate")) != null ? _b : null;
    }
    get duration() {
      var _a, _b;
      return (_b = (_a = this._duration) != null ? _a : this.get("duration")) != null ? _b : null;
    }
    // Route all setting through applyXX (setStartDate, startDate = , set('startDate'), batching)
    set startDate(value) {
      this.proposeStartDate(value);
    }
    set endDate(value) {
      this.proposeEndDate(value);
    }
    set duration(value) {
      this.proposeDuration(value);
    }
    //region Edge case normalization
    inSet(field, value, silent, fromRelationUpdate, skipAccessors) {
      const me = this;
      if (me.project && !me.project.isWritingData && typeof field !== "string" && !skipAccessors) {
        if ("startDate" in field && !("startDate" in me.$changed)) {
          me.$changed.startDate = true;
          me.invalidate();
        }
        if ("endDate" in field && !("endDate" in me.$changed)) {
          me.$changed.endDate = true;
          me.invalidate();
        }
      }
      return superProto.inSet.call(me, field, value, silent, fromRelationUpdate, skipAccessors);
    }
    //endregion
    //region StartDate
    getStartDate() {
      return this.startDate;
    }
    proposeStartDate(startDate, keepDuration = !("endDate" in this.$changed)) {
      var _a;
      if (this.inSetting || (startDate == null ? void 0 : startDate.getTime()) !== ((_a = this.startDate) == null ? void 0 : _a.getTime())) {
        this._startDate = startDate;
        this.propose({ startDate, keepDuration });
      }
    }
    async setStartDate(startDate, keepDuration = true) {
      var _a;
      this.proposeStartDate(startDate, keepDuration);
      return (_a = this.project) == null ? void 0 : _a.commitAsync();
    }
    //endregion
    //region EndDate
    getEndDate() {
      return this.endDate;
    }
    proposeEndDate(endDate, keepDuration = false) {
      var _a;
      if (this.inSetting || (endDate == null ? void 0 : endDate.getTime()) !== ((_a = this.endDate) == null ? void 0 : _a.getTime())) {
        this._endDate = endDate;
        this.propose({ endDate, keepDuration });
      }
    }
    async setEndDate(endDate, keepDuration = false) {
      var _a;
      this.proposeEndDate(endDate, keepDuration);
      return (_a = this.project) == null ? void 0 : _a.commitAsync();
    }
    //endregion
    //region Duration
    getDuration() {
      return this.duration;
    }
    proposeDuration(duration, unit, keepStart = true) {
      this._duration = duration;
      this.propose({ duration, keepStart });
      if (unit)
        this.propose({ durationUnit: unit });
    }
    async setDuration(duration, unit, keepStart = true) {
      var _a;
      this.proposeDuration(duration, unit, keepStart);
      return (_a = this.project) == null ? void 0 : _a.commitAsync();
    }
    getDurationUnit() {
      return this.durationUnit;
    }
    //endregion
    // When joining as part of inline data, store is available. If joining through load, it is passed
    joinProject() {
      var _a, _b;
      const me = this;
      const changed = me.$changed;
      const startDate = me.getCurrentOrProposed("startDate");
      const endDate = me.getCurrentOrProposed("endDate");
      const duration = me.getCurrentOrProposed("duration");
      if (startDate != null)
        changed.startDate = me._startDate = startDate;
      if (endDate != null)
        changed.endDate = me._endDate = endDate;
      if (duration != null)
        changed.duration = me._duration = duration;
      if (me.eventStore && !me.eventStore.isLoadingData) {
        const unresolved = (_a = me.assignmentStore) == null ? void 0 : _a.storage.findItem("event", null);
        if (unresolved) {
          const cachedAssignments = (_b = me.assignmentStore) == null ? void 0 : _b.storage.findItem("eventId", me.id);
          if (cachedAssignments) {
            for (const assignment of cachedAssignments) {
              assignment.setChanged("event", me);
            }
          } else {
            for (const assignment of unresolved) {
              if (assignment.getCurrentOrProposed("event") === me.id) {
                assignment.setChanged("event", me);
              }
            }
          }
        }
      }
      superProto.joinProject.call(me);
    }
    // Mimic how proper engine applies values
    applyValue(useProp, key, value, skipAccessors, field) {
      var _a;
      if ((this.project || ((_a = this.recurringTimeSpan) == null ? void 0 : _a.project)) && field) {
        const { name } = field;
        if (name === "startDate" || name == "duration" || name === "endDate") {
          useProp = true;
          this["_" + name] = value;
        }
        if (skipAccessors) {
          useProp = false;
        }
      }
      superProto.applyValue.call(this, useProp, key, value, skipAccessors, field);
    }
    // Catch changes from batches etc. In which case it is sometimes expected for data to be available directly
    afterChange(toSet, wasSet, silent, fromRelationUpdate, skipAccessors) {
      if (!this.$isCalculating && !skipAccessors) {
        this.setData({
          startDate: this.getCurrentOrProposed("startDate"),
          endDate: this.getCurrentOrProposed("endDate"),
          duration: this.getCurrentOrProposed("duration"),
          durationUnit: this.getCurrentOrProposed("durationUnit")
        });
      }
      superProto.afterChange.call(this, toSet, wasSet, silent, fromRelationUpdate, skipAccessors);
    }
    // Normalizes dates & duration
    calculateInvalidated() {
      var _a, _b;
      const me = this;
      const changed = me.$changed;
      const changedStart = "startDate" in changed;
      const changedEnd = "endDate" in changed;
      const changedDuration = "duration" in changed;
      const { startDate, endDate, duration, keepDuration, keepStart } = changed;
      let calculate = null;
      if (changedStart && !changedEnd && !changedDuration) {
        if (startDate === null) {
          changed.endDate = null;
        } else if (me.hasCurrentOrProposed("endDate") && startDate > me.getCurrentOrProposed("endDate") && !keepDuration) {
          changed.endDate = startDate;
          changed.duration = 0;
        } else if (me.hasCurrentOrProposed("duration") && (keepDuration || !me.hasCurrentOrProposed("endDate"))) {
          calculate = "endDate";
        } else if (me.hasCurrentOrProposed("endDate")) {
          calculate = "duration";
        }
      } else if (!changedStart && changedEnd && !changedDuration) {
        if (endDate === null) {
          changed.startDate = null;
        } else if (me.hasCurrentOrProposed("startDate") && !keepDuration && endDate !== true && endDate < me.getCurrentOrProposed("startDate")) {
          changed.startDate = endDate;
          changed.duration = 0;
        } else if (me.hasCurrentOrProposed("duration") && (keepDuration || !me.hasCurrentOrProposed("startDate"))) {
          calculate = "startDate";
        } else if (me.hasCurrentOrProposed("startDate")) {
          calculate = "duration";
        }
      } else if (!changedStart && !changedEnd && changedDuration) {
        if (duration === null) {
          changed.endDate = null;
        } else if (me.hasCurrentOrProposed("startDate") && (keepStart || !me.hasCurrentOrProposed("endDate"))) {
          if (keepStart && changed.duration < 0) {
            changed.duration = 0;
          }
          calculate = "endDate";
        } else if (me.hasCurrentOrProposed("endDate")) {
          calculate = "startDate";
        }
      } else if (changedStart && changedEnd && !changedDuration) {
        if (startDate === null && endDate === null) {
          changed.duration = null;
        } else {
          calculate = "duration";
        }
      } else if (changedStart && !changedEnd && changedDuration) {
        calculate = "endDate";
      } else if (!changedStart && changedEnd && changedDuration) {
        calculate = "startDate";
      } else if (changedStart && changedEnd && changedDuration) {
        if (duration == null) {
          calculate = "duration";
        } else if (startDate == null) {
          calculate = "startDate";
        } else {
          calculate = "endDate";
        }
      }
      const currentOrProposedStartDate = me.getCurrentOrProposed("startDate");
      const currentOrProposedEndDate = me.getCurrentOrProposed("endDate");
      const currentOrProposedDuration = me.getCurrentOrProposed("duration");
      const currentOrProposedDurationUnit = me.getCurrentOrProposed("durationUnit");
      const adjustDurationToDST = (_b = (_a = me.getProject()) == null ? void 0 : _a.adjustDurationToDST) != null ? _b : false;
      switch (calculate) {
        case "startDate":
          const newStartDate = DateHelper.add(currentOrProposedEndDate, -currentOrProposedDuration, currentOrProposedDurationUnit);
          if (adjustDurationToDST) {
            const dstDiff = currentOrProposedEndDate.getTimezoneOffset() - newStartDate.getTimezoneOffset();
            newStartDate.setTime(newStartDate.getTime() - dstDiff * 60 * 1e3);
          }
          changed.startDate = newStartDate;
          break;
        case "endDate":
          const newEndDate = DateHelper.add(currentOrProposedStartDate, currentOrProposedDuration, currentOrProposedDurationUnit);
          if (adjustDurationToDST) {
            const dstDiff = currentOrProposedStartDate.getTimezoneOffset() - newEndDate.getTimezoneOffset();
            newEndDate.setTime(newEndDate.getTime() - dstDiff * 60 * 1e3);
          }
          changed.endDate = newEndDate;
          break;
        case "duration":
          let newDuration = DateHelper.diff(currentOrProposedStartDate, currentOrProposedEndDate, "millisecond");
          if (adjustDurationToDST) {
            const dstDiff = currentOrProposedStartDate.getTimezoneOffset() - currentOrProposedEndDate.getTimezoneOffset();
            newDuration += dstDiff * 60 * 1e3;
          }
          changed.duration = DateHelper.as(currentOrProposedDurationUnit, newDuration, "millisecond");
          break;
      }
      if ("startDate" in changed && changed.startDate !== true)
        this._startDate = changed.startDate;
      if ("endDate" in changed && changed.endDate !== true)
        this._endDate = changed.endDate;
      if ("duration" in changed && changed.duration !== true)
        this._duration = changed.duration;
      if (changed.startDate === true)
        delete changed.startDate;
      if (changed.endDate === true)
        delete changed.endDate;
      delete changed.keepDuration;
      delete changed.keepStart;
    }
  }
  return CoreEventMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/AbstractHasAssignmentsMixin.js
var AbstractHasAssignmentsMixin = class extends Mixin([AbstractPartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class HasAssignmentsMixin extends base {
    /**
     * If a given resource is assigned to this task, returns a [[BaseAssignmentMixin]] instance for it.
     * Otherwise returns `null`
     */
    getAssignmentFor(resource) {
      var _a;
      for (const assignment of (_a = this.assigned) != null ? _a : []) {
        if (assignment.resource === resource)
          return assignment;
      }
      return null;
    }
    isAssignedTo(resource) {
      return Boolean(this.getAssignmentFor(resource));
    }
    /**
     * A method which assigns a resource to the current event
     */
    async assign(resource) {
      const assignmentCls = this.project.assignmentStore.modelClass;
      this.addAssignment(new assignmentCls({
        event: this,
        resource
      }));
      return this.commitAsync();
    }
    /**
     * A method which unassigns a resource from the current event
     */
    async unassign(resource) {
      const assignment = this.getAssignmentFor(resource);
      this.removeAssignment(assignment);
      return this.commitAsync();
    }
    leaveProject() {
      if (this.isInActiveTransaction && this.assigned) {
        const eventStore = this.getEventStore();
        this.assigned.forEach((assignment) => eventStore.assignmentsForRemoval.add(assignment));
      }
      superProto.leaveProject.call(this, ...arguments);
    }
    remove() {
      if (this.parent) {
        const eventStore = this.getEventStore();
        superProto.remove.call(this);
        eventStore && eventStore.afterEventRemoval();
      } else {
        return superProto.remove.call(this);
      }
    }
    // template methods, overridden in scheduling modes mixins
    // should probably be named something like "onEventAssignmentAdded"
    // should be a listener for the `add` event of the assignment store instead
    addAssignment(assignment) {
      this.getProject().assignmentStore.add(assignment);
      return assignment;
    }
    // should be a listener for the `remove` event of the assignment store instead
    removeAssignment(assignment) {
      this.getProject().assignmentStore.remove(assignment);
      return assignment;
    }
  }
  return HasAssignmentsMixin;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreHasAssignmentsMixin.js
var CoreHasAssignmentsMixin = class extends Mixin([CoreEventMixin, AbstractHasAssignmentsMixin], (base) => {
  const superProto = base.prototype;
  class CoreHasAssignmentsMixin2 extends base {
    get assigned() {
      var _a, _b;
      return (_b = (_a = this.project) == null ? void 0 : _a.assignmentStore.getEventsAssignments(this)) != null ? _b : this.$cachedAssignments;
    }
    leaveProject(isReplacing = false) {
      this.$cachedAssignments = this.assigned;
      super.leaveProject(isReplacing);
    }
    applyValue(useProp, key, value, skipAccessor, field) {
      var _a;
      if (key === "id") {
        (_a = this.assigned) == null ? void 0 : _a.forEach((assignment) => assignment.set("eventId", value));
      }
      superProto.applyValue.call(this, useProp, key, value, skipAccessor, field);
    }
    copy(newId = null, deep = null) {
      const copy = superProto.copy.call(this, newId, deep);
      if (ObjectHelper.isObject(deep) && !deep.skipFieldIdentifiers || !ObjectHelper.isObject(deep)) {
        copy.$cachedAssignments = this.assigned;
      }
      return copy;
    }
  }
  return CoreHasAssignmentsMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreHasDependenciesMixin.js
var CoreHasDependenciesMixin = class extends Mixin([CoreEventMixin], (base) => {
  const superProto = base.prototype;
  class CoreHasDependenciesMixin2 extends base {
    get outgoingDeps() {
      return this.project.dependencyStore.getOutgoingDepsForEvent(this);
    }
    get incomingDeps() {
      return this.project.dependencyStore.getIncomingDepsForEvent(this);
    }
    leaveProject() {
      const eventStore = this.eventStore;
      if (this.outgoingDeps) {
        this.outgoingDeps.forEach((dependency) => eventStore.dependenciesForRemoval.add(dependency));
      }
      if (this.incomingDeps) {
        this.incomingDeps.forEach((dependency) => eventStore.dependenciesForRemoval.add(dependency));
      }
      superProto.leaveProject.call(this);
    }
  }
  return CoreHasDependenciesMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/SchedulerCoreEvent.js
var SchedulerCoreEvent = class extends Mixin([
  CoreEventMixin,
  CoreHasAssignmentsMixin,
  CoreHasDependenciesMixin
], (base) => {
  const superProto = base.prototype;
  class SchedulerCoreEvent2 extends base {
  }
  return SchedulerCoreEvent2;
}) {
};

// ../Scheduler/lib/Scheduler/model/EventModel.js
var EngineMixin3 = SchedulerCoreEvent;
var EventModel = class extends EngineMixin3.derive(TimeSpan).mixin(
  RecurringTimeSpan_default,
  PartOfProject_default,
  EventModelMixin_default
) {
  static get $name() {
    return "EventModel";
  }
};
EventModel.exposeProperties();
EventModel._$name = "EventModel";

// ../Scheduler/lib/Scheduler/data/mixin/DayIndexMixin.js
var { MIDNIGHT } = DayTime;
var DayIndexMixin_default = (Target) => {
  var _a;
  return _a = class extends Target {
    construct(config) {
      super.construct(config);
      this.dayIndices = null;
    }
    //region Keeping index in sync
    // Override to syncIndices on initial load
    afterLoadData() {
      var _a2;
      this.syncIndices("splice", this.storage.allValues);
      (_a2 = super.afterLoadData) == null ? void 0 : _a2.call(this);
    }
    /**
     * Responds to mutations of the underlying storage Collection.
     *
     * Maintain indices for fast finding of events by date.
     * @param {Object} event
     * @private
     */
    onDataChange({ action, added, removed, replaced }) {
      this.syncIndices(action, added, removed, replaced);
      super.onDataChange(...arguments);
    }
    onDataReplaced(action, data) {
      this.syncIndices("clear");
      this.syncIndices("splice", this.storage.values);
      super.onDataReplaced(action, data);
    }
    onModelChange(record, toSet, wasSet, silent, fromRelationUpdate) {
      if ("startDate" in wasSet || "endDate" in wasSet) {
        this.syncIndices("reschedule", [record], null, null, wasSet);
      }
      super.onModelChange(...arguments);
    }
    //endregion
    //region Index
    /**
     * Invalidates associated day indices.
     * @internal
     */
    invalidateDayIndices() {
      var _a2;
      (_a2 = this.dayIndices) == null ? void 0 : _a2.forEach((dayIndex) => dayIndex.invalidate());
    }
    /**
     * Registers a `DayTime` instance, creating an `EventDayIndex` for each distinct `startShift`. This index is
     * maintained until all instances with a matching `startShift` are {@link #function-unregisterDayIndex unregistered}.
     * @param {Core.util.DayTime} dayTime The instance to register.
     * @internal
     * @category Indexing
     */
    registerDayIndex(dayTime) {
      const me = this, dayIndices = me.dayIndices || (me.dayIndices = []);
      let dayIndex, i;
      for (i = 0; !dayIndex && i < dayIndices.length; ++i) {
        if (dayIndices[i].matches(dayTime)) {
          (dayIndex = dayIndices[i]).register(dayTime);
        }
      }
      !dayIndex && dayIndices.push(dayIndex = new EventDayIndex(me, dayTime));
      return dayIndex;
    }
    syncIndices(...args) {
      var _a2;
      (_a2 = this.dayIndices) == null ? void 0 : _a2.forEach((dayIndex) => dayIndex.sync(...args));
    }
    /**
     * Removes a registered `DayTime` instance. If this is the last instance registered to an `EventDayIndex`, that
     * index is removed.
     * @param {Core.util.DayTime} dayTime The instance to unregister.
     * @internal
     * @category Indexing
     */
    unregisterDayIndex(dayTime) {
      const me = this, { dayIndices } = me;
      for (let i = dayIndices == null ? void 0 : dayIndices.length; i-- > 0; ) {
        if (dayIndices[i].matches(dayTime)) {
          if (dayIndices[i].unregister(dayTime)) {
            dayIndices.splice(i, 1);
          }
          break;
        }
      }
    }
    /**
     * Returns the `EventDayIndex` to use for the given `DayTime` instance. This may be the primary instance or a
     * child instance created by {@link #function-registerDayIndex}.
     * @param {Core.util.DayTime} dayTime The `DayTime` of the desired index.
     * @returns {Scheduler.data.util.EventDayIndex}
     * @private
     * @category Indexing
     */
    useDayIndex(dayTime) {
      const me = this, { dayIndices } = me;
      dayTime = dayTime || MIDNIGHT;
      for (let i = 0; dayIndices && i < dayIndices.length; ++i) {
        if (dayIndices[i].matches(dayTime)) {
          return dayIndices[i];
        }
      }
      if (dayTime.startShift) {
        throw new Error(`No day index registered for ${dayTime} on ${me.id}`);
      }
      return me.registerDayIndex(MIDNIGHT);
    }
    //endregion
  }, __publicField(_a, "$name", "DayIndexMixin"), _a;
};

// ../Engine/lib/Engine/quark/store/AbstractEventStoreMixin.js
var dataAddRemoveActions2 = {
  splice: 1,
  clear: 1
};
var AbstractEventStoreMixin = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class AbstractEventStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.assignmentsForRemoval = /* @__PURE__ */ new Set();
      this.dependenciesForRemoval = /* @__PURE__ */ new Set();
    }
    // we need `onDataChange` for `syncDataOnLoad` option to work
    onDataChange(event) {
      var _a;
      const isAddRemove = dataAddRemoveActions2[event.action];
      super.onDataChange(event);
      if (isAddRemove && ((_a = event.removed) == null ? void 0 : _a.length))
        this.afterEventRemoval();
    }
    // it seems `onDataChange` is not triggered for `remove` with `silent` flag
    remove(records, silent) {
      const res = superProto.remove.call(this, records, silent);
      this.afterEventRemoval();
      return res;
    }
    // it seems `onDataChange` is not triggered for `TreeStore#removeAll()`
    removeAll(silent) {
      const res = superProto.removeAll.call(this, silent);
      this.afterEventRemoval();
      return res;
    }
    onNodeRemoveChild(parent, children, index, flags) {
      const removed = superProto.onNodeRemoveChild.call(this, ...arguments);
      this.afterEventRemoval();
      return removed;
    }
    afterEventRemoval() {
      const { assignmentsForRemoval, dependenciesForRemoval } = this;
      if (!assignmentsForRemoval)
        return;
      const assignmentStore = this.getAssignmentStore();
      if (assignmentStore && !assignmentStore.allAssignmentsForRemoval && assignmentsForRemoval.size) {
        const toRemove = [...assignmentsForRemoval].filter((assignment) => !assignmentStore.assignmentsForRemoval.has(assignment));
        toRemove.length > 0 && assignmentStore.remove(toRemove);
      }
      assignmentsForRemoval.clear();
      const dependencyStore = this.getDependencyStore();
      if (dependencyStore && !dependencyStore.allDependenciesForRemoval && dependenciesForRemoval.size) {
        const toRemove = [...dependenciesForRemoval].filter((dependency) => !dependencyStore.dependenciesForRemoval.has(dependency));
        toRemove.length > 0 && dependencyStore.remove(toRemove);
      }
      dependenciesForRemoval.clear();
    }
    processRecord(eventRecord, isDataset = false) {
      var _a;
      if (!((_a = this.project) == null ? void 0 : _a.isRepopulatingStores)) {
        const existingRecord = this.getById(eventRecord.id);
        const isReplacing = existingRecord && existingRecord !== eventRecord;
        if (isReplacing && existingRecord.assigned) {
          for (const assignment of existingRecord.assigned) {
            assignment.event = eventRecord;
          }
        }
      }
      return eventRecord;
    }
  }
  return AbstractEventStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/CoreEventStoreMixin.js
var CoreEventStoreMixin = class extends Mixin([AbstractEventStoreMixin, CorePartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CoreEventStoreMixin2 extends base {
    static get defaultConfig() {
      return {
        modelClass: SchedulerCoreEvent
      };
    }
    joinProject() {
      var _a;
      (_a = this.assignmentStore) == null ? void 0 : _a.linkAssignments(this, "event");
    }
    afterLoadData() {
      var _a;
      this.afterEventRemoval();
      (_a = this.assignmentStore) == null ? void 0 : _a.linkAssignments(this, "event");
    }
  }
  return CoreEventStoreMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/data/EventStore.js
var EngineMixin4 = PartOfProject_default(CoreEventStoreMixin.derive(AjaxStore));
var EventStore = class extends EngineMixin4.mixin(
  RecurringEventsMixin_default,
  EventStoreMixin_default,
  DayIndexMixin_default,
  GetEventsMixin_default
) {
  static get defaultConfig() {
    return {
      /**
       * Class used to represent records
       * @config {Scheduler.model.EventModel}
       * @typings {typeof EventModel}
       * @default
       * @category Common
       */
      modelClass: EventModel
    };
  }
};
__publicField(EventStore, "$name", "EventStore");
EventStore._$name = "EventStore";

// ../Scheduler/lib/Scheduler/model/mixin/AssignmentModelMixin.js
var AssignmentModelMixin_default = (Target) => class AssignmentModelMixin extends Target {
  static get $name() {
    return "AssignmentModelMixin";
  }
  /**
   * Set value for the specified field(s), triggering engine calculations immediately. See
   * {@link Core.data.Model#function-set Model#set()} for arguments.
   *
   * ```javascript
   * assignment.set('resourceId', 2);
   * // assignment.resource is not yet resolved
   *
   * await assignment.setAsync('resourceId', 2);
   * // assignment.resource is resolved
   * ```
   *
   * @param {String|Object} field The field to set value for, or an object with multiple values to set in one call
   * @param {*} [value] Value to set
   * @param {Boolean} [silent=false] Set to true to not trigger events
   * automatically.
   * @function setAsync
   * @category Editing
   * @async
   */
  //region Fields
  static get fields() {
    return [
      /**
       * Id for the resource to assign to
       * @field {String|Number} resourceId
       * @category Common
       */
      "resourceId",
      /**
       * Id for the event to assign
       * @field {String|Number} eventId
       * @category Common
       */
      "eventId",
      /**
       * Specify `false` to opt out of drawing dependencies from/to this assignment
       * @field {Boolean} drawDependencies
       * @category Common
       */
      { name: "drawDependencies", type: "boolean" },
      "event",
      "resource"
    ];
  }
  //endregion
  construct(data, ...args) {
    data = data || {};
    const { fieldMap } = this, eventIdField = fieldMap.eventId.dataSource, resourceIdField = fieldMap.resourceId.dataSource, eventField = fieldMap.event.dataSource, resourceField = fieldMap.resource.dataSource, eventId = data[eventIdField], resourceId = data[resourceIdField], event = data[eventField], resource = data[resourceField];
    if (eventId != null) {
      data[eventField] = eventId;
    } else if (event != null) {
      data[eventIdField] = event.isModel ? event.id : event;
    }
    if (resourceId != null) {
      data[resourceField] = resourceId;
    } else if (resource != null) {
      data[resourceIdField] = resource.isModel ? resource.id : resource;
    }
    super.construct(data, ...args);
  }
  //region Event & resource
  /**
   * A key made up from the event id and the id of the resource assigned to.
   * @property eventResourceKey
   * @readonly
   * @internal
   */
  get eventResourceKey() {
    return this.buildEventResourceKey(this.event, this.resource);
  }
  buildEventResourceKey(event, resource) {
    let eventKey, resourceKey;
    if (event) {
      eventKey = event.isModel ? event.id : event;
    } else {
      eventKey = this.internalId;
    }
    if (resource) {
      resourceKey = resource.isModel ? resource.id : resource;
    } else {
      resourceKey = this.internalId;
    }
    return `${eventKey}-${resourceKey}`;
  }
  buildIndexKey({ event, resource }) {
    return this.buildEventResourceKey(event, resource);
  }
  set(field, value, ...args) {
    var _a, _b;
    const toSet = this.fieldToKeys(field, value);
    if ("resource" in toSet) {
      if (((_a = toSet.resource) == null ? void 0 : _a.id) !== void 0) {
        toSet.resourceId = toSet.resource.id;
      }
    } else if ("resourceId" in toSet && this.constructor.isProAssignmentModel) {
      toSet.resource = toSet.resourceId;
    }
    if ("event" in toSet) {
      if (((_b = toSet.event) == null ? void 0 : _b.id) !== void 0) {
        toSet.eventId = toSet.event.id;
      }
    } else if ("eventId" in toSet && this.constructor.isProAssignmentModel) {
      toSet.event = toSet.eventId;
    }
    return super.set(toSet, null, ...args);
  }
  afterChange(toSet, wasSet, silent, fromRelationUpdate, skipAccessors) {
    var _a, _b;
    const me = this;
    if (!me.constructor.isProAssignmentModel && (wasSet == null ? void 0 : wasSet.resourceId) && ((_a = me.resource) == null ? void 0 : _a.id) !== wasSet.resourceId.value) {
      me.resource = wasSet.resourceId.value;
    } else if (me.constructor.isProAssignmentModel && ((_b = me.project) == null ? void 0 : _b.propagatingSyncChanges) && (wasSet == null ? void 0 : wasSet.eventId) && !(wasSet == null ? void 0 : wasSet.event) && (toSet.event.value === wasSet.eventId.value || toSet.event.value.id === wasSet.eventId.value)) {
      delete wasSet.eventId;
      delete me.meta.modified.eventId;
    }
    return super.afterChange(...arguments);
  }
  // Settings resourceId relays to `resource`. Underlying data will be updated in `afterChange()` above
  set resourceId(value) {
    const { resource } = this;
    if ((resource == null ? void 0 : resource.isModel) && resource.id === value) {
      this.set("resourceId", value);
    } else {
      this.resource = value;
    }
  }
  get resourceId() {
    var _a, _b;
    return (_b = (_a = this.resource) == null ? void 0 : _a.id) != null ? _b : this.get("resourceId");
  }
  // Same for event as for resourceId
  set eventId(value) {
    const { event } = this;
    if ((event == null ? void 0 : event.isModel) && event.id === value) {
      this.set("eventId", value);
    } else {
      this.event = value;
    }
  }
  get eventId() {
    var _a, _b;
    return (_b = (_a = this.event) == null ? void 0 : _a.id) != null ? _b : this.get("eventId");
  }
  /**
   * Convenience property to get the name of the associated event.
   * @property {String}
   * @readonly
   */
  get eventName() {
    var _a;
    return (_a = this.event) == null ? void 0 : _a.name;
  }
  /**
   * Convenience property to get the name of the associated resource.
   * @property {String}
   * @readonly
   */
  get resourceName() {
    var _a;
    return (_a = this.resource) == null ? void 0 : _a.name;
  }
  /**
   * Returns the resource associated with this assignment.
   *
   * @returns {Scheduler.model.ResourceModel} Instance of resource
   */
  getResource() {
    return this.resource;
  }
  //endregion
  // Convenience getter to not have to check `instanceof AssignmentModel`
  get isAssignment() {
    return true;
  }
  /**
   * Returns true if the Assignment can be persisted (e.g. task and resource are not 'phantoms')
   *
   * @property {Boolean}
   */
  get isPersistable() {
    var _a;
    const {
      event,
      resource,
      unjoinedStores,
      assignmentStore
    } = this, crudManager = assignmentStore == null ? void 0 : assignmentStore.crudManager;
    let result;
    if (assignmentStore) {
      result = this.isValid && event.isPersistable && (crudManager || !event.hasGeneratedId && !resource.hasGeneratedId);
    } else {
      result = !this.isPhantom && Boolean(unjoinedStores[0]);
    }
    return result && super.isPersistable && !((_a = this.event) == null ? void 0 : _a.isCreating);
  }
  get isValid() {
    return this.resource != null && this.event != null;
  }
  /**
   * Returns a textual representation of this assignment (e.g. Mike 50%).
   * @returns {String}
   */
  toString() {
    if (this.resourceName) {
      return `${this.resourceName} ${Math.round(this.units)}%`;
    }
    return "";
  }
  //region STM hooks
  shouldRecordFieldChange(fieldName, oldValue, newValue) {
    var _a, _b;
    if (!super.shouldRecordFieldChange(fieldName, oldValue, newValue)) {
      return false;
    }
    if (fieldName === "event" || fieldName === "eventId") {
      const eventStore = (_a = this.project) == null ? void 0 : _a.eventStore;
      if (eventStore && eventStore.oldIdMap[oldValue] === eventStore.getById(newValue)) {
        return false;
      }
    }
    if (fieldName === "resource" || fieldName === "resourceId") {
      const resourceStore = (_b = this.project) == null ? void 0 : _b.resourceStore;
      if (resourceStore && resourceStore.oldIdMap[oldValue] === resourceStore.getById(newValue)) {
        return false;
      }
    }
    return true;
  }
  //endregion
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreAssignmentMixin.js
function asId(recordOrId) {
  return (recordOrId == null ? void 0 : recordOrId.isModel) ? recordOrId.id : recordOrId;
}
var CoreAssignmentMixin = class extends Mixin([CorePartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CoreAssignmentMixin2 extends base {
    // Fields declared in the Model way, existing decorators all assume ChronoGraph is used
    static get fields() {
      return [
        // isEqual required to properly detect changed resource / event
        { name: "resource", isEqual: (a, b) => a === b, persist: false },
        { name: "event", isEqual: (a, b) => a === b, persist: false }
      ];
    }
    // Resolve early + update indices to have buckets ready before commit
    setChanged(field, value, invalidate) {
      const { assignmentStore, eventStore, resourceStore, project } = this;
      let update = false;
      if (field === "event") {
        const event = isInstanceOf(value, CoreEventMixin) ? value : eventStore == null ? void 0 : eventStore.$master.getById(value);
        if (event)
          update = true;
        value = event || value;
      }
      if (field === "resource") {
        const resource = isInstanceOf(value, CoreResourceMixin) ? value : resourceStore == null ? void 0 : resourceStore.$master.getById(value);
        if (resource)
          update = true;
        value = resource || value;
      }
      superProto.setChanged.call(this, field, value, invalidate, true);
      if (assignmentStore && update && !project.isPerformingCommit && !assignmentStore.isLoadingData && !(resourceStore == null ? void 0 : resourceStore.isLoadingData) && !assignmentStore.skipInvalidateIndices) {
        assignmentStore.invalidateIndices();
      }
    }
    // Resolve event and resource when joining project
    joinProject() {
      superProto.joinProject.call(this);
      this.setChanged("event", this.get("event"));
      this.setChanged("resource", this.get("resource"));
    }
    // Resolved resource & event as part of commit
    // Normally done earlier in setChanged, but stores might not have been available yet at that point
    calculateInvalidated() {
      var _a, _b;
      let { event = this.event, resource = this.resource } = this.$changed;
      if (event !== null && !isInstanceOf(event, CoreEventMixin)) {
        const resolved = (_a = this.eventStore) == null ? void 0 : _a.getById(event);
        if (resolved)
          this.setChanged("event", resolved, false);
      }
      if (resource !== null && !isInstanceOf(resource, CoreResourceMixin)) {
        const resolved = (_b = this.resourceStore) == null ? void 0 : _b.getById(resource);
        if (resolved)
          this.setChanged("resource", resolved, false);
      }
    }
    // resourceId and eventId required to be available for new datasets
    finalizeInvalidated(silent) {
      const changed = this.$changed;
      if ("resource" in changed) {
        changed.resourceId = asId(changed.resource);
      }
      if ("event" in changed) {
        changed.eventId = asId(changed.event);
      }
      superProto.finalizeInvalidated.call(this, silent);
    }
    //region Event
    set event(event) {
      this.setChanged("event", event);
      this.setChanged("eventId", asId(event));
    }
    get event() {
      const event = this.get("event");
      return (event == null ? void 0 : event.id) != null ? event : null;
    }
    //endregion
    //region Resource
    set resource(resource) {
      this.setChanged("resource", resource);
      this.setChanged("resourceId", asId(resource));
    }
    get resource() {
      const resource = this.get("resource");
      return (resource == null ? void 0 : resource.id) != null ? resource : null;
    }
  }
  return CoreAssignmentMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/model/AssignmentModel.js
var EngineMixin5 = CoreAssignmentMixin;
var AssignmentModel = class extends AssignmentModelMixin_default(PartOfProject_default(EngineMixin5.derive(Model))) {
  // NOTE: Leave field defs at top to be picked up by jsdoc
  /**
   * Id for event to assign. Can be used as an alternative to `eventId`, but please note that after
   * load it will be populated with the actual event and not its id. This field is not persistable.
   * @field {Scheduler.model.EventModel} event
   * @accepts {String|Number|Scheduler.model.EventModel}
   * @typings {String||Number||Scheduler.model.EventModel||Scheduler.model.TimeSpan}
   * @category Common
   */
  /**
   * Id for resource to assign to. Can be used as an alternative to `resourceId`, but please note that after
   * load it will be populated with the actual resource and not its id. This field is not persistable.
   * @field {Scheduler.model.ResourceModel} resource
   * @accepts {String|Number|Scheduler.model.ResourceModel}
   * @category Common
   */
  static get $name() {
    return "AssignmentModel";
  }
};
AssignmentModel.exposeProperties();
AssignmentModel._$name = "AssignmentModel";

// ../Scheduler/lib/Scheduler/data/mixin/AssignmentStoreMixin.js
var AssignmentStoreMixin_default = (Target) => class AssignmentStoreMixin extends Target {
  static get $name() {
    return "AssignmentStoreMixin";
  }
  /**
   * Add assignments to the store.
   *
   * NOTE: References (event, resource) on the assignments are determined async by a calculation engine. Thus they
   * cannot be directly accessed after using this function.
   *
   * For example:
   *
   * ```javascript
   * const [assignment] = assignmentStore.add({ eventId, resourceId });
   * // assignment.event is not yet available
   * ```
   *
   * To guarantee references are set up, wait for calculations for finish:
   *
   * ```javascript
   * const [assignment] = assignmentStore.add({ eventId, resourceId });
   * await assignmentStore.project.commitAsync();
   * // assignment.event is available (assuming EventStore is loaded and so on)
   * ```
   *
   * Alternatively use `addAsync()` instead:
   *
   * ```javascript
   * const [assignment] = await assignmentStore.addAsync({ eventId, resourceId });
   * // assignment.event is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.AssignmentModel|Scheduler.model.AssignmentModel[]|AssignmentModelConfig|AssignmentModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.AssignmentModel[]} Added records
   * @function add
   * @category CRUD
   */
  /**
   * Add assignments to the store and triggers calculations directly after. Await this function to have up to date
   * references on the added assignments.
   *
   * ```javascript
   * const [assignment] = await assignmentStore.addAsync({ eventId, resourceId });
   * // assignment.event is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.AssignmentModel|Scheduler.model.AssignmentModel[]|AssignmentModelConfig|AssignmentModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.AssignmentModel[]} Added records
   * @function addAsync
   * @category CRUD
   * @async
   */
  /**
   * Applies a new dataset to the AssignmentStore. Use it to plug externally fetched data into the store.
   *
   * NOTE: References (assignments, resources) on the assignments are determined async by a calculation engine. Thus
   * they cannot be directly accessed after assigning the new dataset.
   *
   * For example:
   *
   * ```javascript
   * assignmentStore.data = [{ eventId, resourceId }];
   * // assignmentStore.first.event is not yet available
   * ```
   *
   * To guarantee references are available, wait for calculations for finish:
   *
   * ```javascript
   * assignmentStore.data = [{ eventId, resourceId  }];
   * await assignmentStore.project.commitAsync();
   * // assignmentStore.first.event is available
   * ```
   *
   * Alternatively use `loadDataAsync()` instead:
   *
   * ```javascript
   * await assignmentStore.loadDataAsync([{ eventId, resourceId }]);
   * // assignmentStore.first.event is available
   * ```
   *
   * @member {AssignmentModelConfig[]} data
   * @category Records
   */
  /**
   * Applies a new dataset to the AssignmentStore and triggers calculations directly after. Use it to plug externally
   * fetched data into the store.
   *
   * ```javascript
   * await assignmentStore.loadDataAsync([{ eventId, resourceId }]);
   * // assignmentStore.first.event is available
   * ```
   *
   * @param {AssignmentModelConfig[]} data Array of AssignmentModel data objects
   * @function loadDataAsync
   * @category CRUD
   * @async
   */
  static get defaultConfig() {
    return {
      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 300,
      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 300,
      storeId: "assignments"
    };
  }
  add(newAssignments, ...args) {
    var _a;
    newAssignments = ArrayHelper.asArray(newAssignments);
    for (let i = 0; i < newAssignments.length; i++) {
      let assignment = newAssignments[i];
      if (!(assignment instanceof Model)) {
        newAssignments[i] = assignment = this.createRecord(assignment);
      }
      if (!this.isSyncingDataOnLoad && this.storage.findIndex("eventResourceKey", assignment.eventResourceKey, true) !== -1) {
        throw new Error(`Duplicate assignment Event: ${assignment.eventId} to resource: ${assignment.resourceId}`);
      }
      if ((_a = assignment.event) == null ? void 0 : _a.isCreating) {
        assignment.isCreating = true;
      }
    }
    return super.add(newAssignments, ...args);
  }
  includesAssignment(eventId, resourceId) {
    return this.storage.findIndex("eventResourceKey", `${eventId}-${resourceId}`, true) !== -1;
  }
  setStoreData(data) {
    if (this.usesSingleAssignment) {
      throw new Error("Data loading into AssignmentStore (multi-assignment mode) cannot be combined EventStore data containing resourceId (single-assignment mode)");
    }
    super.setStoreData(data);
  }
  //region Init & destroy
  // This index fixes poor performance when you add large number of events to an event store with large number of
  // events - if cache is missing existing records are iterated n² times.
  // https://github.com/bryntum/support/issues/3154#issuecomment-881336588
  set storage(storage) {
    super.storage = storage;
    this.storage.addIndex({
      property: "eventResourceKey",
      dependentOn: { event: true, resource: true },
      onDuplicate(assignment) {
        console.warn(`Duplicate assignment of event ${assignment.eventId} to resource ${assignment.resourceId}`);
      }
    });
  }
  get storage() {
    return this._storage || super.storage;
  }
  //endregion
  //region Stores
  // To not have to do instanceof checks
  get isAssignmentStore() {
    return true;
  }
  //endregion
  //region Recurrence
  /**
   * Returns a "fake" assignment used to identify a certain occurrence of a recurring event.
   * If passed the original event, it returns `originalAssignment`.
   * @param {Scheduler.model.AssignmentModel} originalAssignment
   * @param {Scheduler.model.EventModel} occurrence
   * @returns {Object} Temporary assignment
   * @internal
   */
  getOccurrence(originalAssignment, occurrence) {
    if (!originalAssignment || !(occurrence == null ? void 0 : occurrence.isOccurrence)) {
      return originalAssignment;
    }
    const me = this;
    return {
      id: `${occurrence.id}:a${originalAssignment.id}`,
      event: occurrence,
      resource: originalAssignment.resource,
      eventId: occurrence.id,
      resourceId: originalAssignment.resource.id,
      isAssignment: true,
      // This field is required to distinguish this fake assignment when event is being removed from UI
      isOccurrenceAssignment: true,
      // Not being an actual record, instanceMeta is stored on the store instead
      instanceMeta(instanceOrId) {
        return me.occurrenceInstanceMeta(this, instanceOrId);
      }
    };
  }
  // Per fake assignment instance meta, stored on store since fakes are always generated on demand
  occurrenceInstanceMeta(occurrenceAssignment, instanceOrId) {
    const me = this, instanceId = instanceOrId.id || instanceOrId, { id } = occurrenceAssignment;
    let { occurrenceMeta } = me;
    if (!occurrenceMeta) {
      occurrenceMeta = me.occurrenceMeta = {};
    }
    if (!occurrenceMeta[id]) {
      occurrenceMeta[id] = {};
    }
    return occurrenceMeta[id][instanceId] || (occurrenceMeta[id][instanceId] = {});
  }
  //endregion
  //region Mapping
  /**
   * Maps over event assignments.
   *
   * @param {Scheduler.model.EventModel} event
   * @param {Function} [fn]
   * @param {Function} [filterFn]
   * @returns {Scheduler.model.EventModel[]|Array}
   * @category Assignments
   */
  mapAssignmentsForEvent(event, fn2, filterFn) {
    event = this.eventStore.getById(event);
    const fnSet = Boolean(fn2), filterFnSet = Boolean(filterFn);
    if (fnSet || filterFnSet) {
      return event.assignments.reduce((result, assignment) => {
        const mapResult = fnSet ? fn2(assignment) : assignment;
        if (!filterFnSet || filterFn(mapResult)) {
          result.push(mapResult);
        }
        return result;
      }, []);
    }
    return event.assignments;
  }
  /**
   * Maps over resource assignments.
   *
   * @param {Scheduler.model.ResourceModel|Number|String} resource
   * @param {Function} [fn]
   * @param {Function} [filterFn]
   * @returns {Scheduler.model.ResourceModel[]|Array}
   * @category Assignments
   */
  mapAssignmentsForResource(resource, fn2, filterFn) {
    resource = this.resourceStore.getById(resource);
    const fnSet = Boolean(fn2), filterFnSet = Boolean(filterFn);
    if (fnSet || filterFnSet) {
      return resource.assignments.reduce((result, assignment) => {
        const mapResult = fnSet ? fn2(assignment) : assignment;
        if (!filterFnSet || filterFn(mapResult)) {
          result.push(mapResult);
        }
        return result;
      }, []);
    }
    return resource.assignments;
  }
  /**
   * Returns all assignments for a given event.
   *
   * @param {Scheduler.model.TimeSpan} event
   * @returns {Scheduler.model.AssignmentModel[]}
   * @category Assignments
   */
  getAssignmentsForEvent(event) {
    return event.assignments;
  }
  /**
   * Removes all assignments for given event
   *
   * @param {Scheduler.model.TimeSpan} event
   * @category Assignments
   */
  removeAssignmentsForEvent(event) {
    return this.remove(event.assignments);
  }
  /**
   * Returns all assignments for a given resource.
   *
   * @param {Scheduler.model.ResourceModel} resource
   * @returns {Scheduler.model.AssignmentModel[]}
   * @category Assignments
   */
  getAssignmentsForResource(resource) {
    resource = this.resourceStore.getById(resource);
    return resource.assignments;
  }
  /**
   * Removes all assignments for given resource
   *
   * @param {Scheduler.model.ResourceModel|*} resource
   * @category Assignments
   */
  removeAssignmentsForResource(resource) {
    this.remove(this.getAssignmentsForResource(resource));
  }
  /**
   * Returns all resources assigned to an event.
   *
   * @param {Scheduler.model.EventModel} event
   * @returns {Scheduler.model.ResourceModel[]}
   * @category Assignments
   */
  getResourcesForEvent(event) {
    return event.resources;
  }
  /**
   * Returns all events assigned to a resource
   *
   * @param {Scheduler.model.ResourceModel|String|Number} resource
   * @returns {Scheduler.model.TimeSpan[]}
   * @category Assignments
   */
  getEventsForResource(resource) {
    resource = this.resourceStore.getById(resource);
    return resource == null ? void 0 : resource.events;
  }
  /**
   * Creates and adds assignment record(s) for a given event and resource(s).
   *
   * @param {Scheduler.model.TimeSpan} event
   * @param {Scheduler.model.ResourceModel|Scheduler.model.ResourceModel[]} resources The resource(s) to assign to the event
   * @param {Function} [assignmentSetupFn] A hook function which takes an assignment as its argument and must return an assignment.
   * @param {Boolean} [removeExistingAssignments] `true` to remove assignments for other resources
   * @returns {Scheduler.model.AssignmentModel[]} An array with the created assignment(s)
   * @category Assign
   */
  assignEventToResource(event, resources, assignmentSetupFn = null, removeExistingAssignments = false) {
    var _a, _b, _c;
    const me = this, toRemove = removeExistingAssignments ? new Set(event.assignments) : null;
    resources = ArrayHelper.asArray(resources).map((r) => {
      var _a2;
      return (_a2 = r.$original) != null ? _a2 : r;
    });
    if ((_a = me.eventStore) == null ? void 0 : _a.usesSingleAssignment) {
      if ((_b = event.assignments) == null ? void 0 : _b.length) {
        if (!me.isEventAssignedToResource(event, resources[0])) {
          event.resource = resources[0];
        }
        return [];
      } else {
        event.resourceId = (_c = resources[0]) == null ? void 0 : _c.id;
      }
    }
    let newAssignments = [];
    me.suspendAutoCommit();
    resources.forEach((resource) => {
      var _a2;
      const existingAssignment = me.getAssignmentForEventAndResource(event, resource);
      if (!existingAssignment) {
        const assignment = {
          event,
          resource
        };
        newAssignments.push((_a2 = assignmentSetupFn == null ? void 0 : assignmentSetupFn(assignment)) != null ? _a2 : assignment);
      } else if (removeExistingAssignments) {
        toRemove.delete(existingAssignment);
      }
    });
    newAssignments = me.add(newAssignments);
    if (removeExistingAssignments) {
      me.remove(Array.from(toRemove));
    }
    me.resumeAutoCommit();
    return newAssignments;
  }
  /**
   * Removes assignment record for a given event and resource.
   *
   * @param {Scheduler.model.TimeSpan|String|Number} event
   * @param {Scheduler.model.ResourceModel|String|Number} [resources] The resource to unassign the event from. If omitted, all resources of the events will be unassigned
   * @returns {Scheduler.model.AssignmentModel|Scheduler.model.AssignmentModel[]}
   * @category Assign
   */
  unassignEventFromResource(event, resources) {
    const me = this, assignmentsToRemove = [];
    if (!resources) {
      return me.removeAssignmentsForEvent(event);
    }
    resources = ArrayHelper.asArray(resources);
    for (let i = 0; i < resources.length; i++) {
      if (me.isEventAssignedToResource(event, resources[i])) {
        assignmentsToRemove.push(me.getAssignmentForEventAndResource(event, resources[i]));
      }
    }
    return me.remove(assignmentsToRemove);
  }
  /**
   * Checks whether an event is assigned to a resource.
   *
   * @param {Scheduler.model.EventModel|String|Number} event Event record or id
   * @param {Scheduler.model.ResourceModel|String|Number} resource Resource record or id
   * @returns {Boolean}
   * @category Assignments
   */
  isEventAssignedToResource(event, resource) {
    return Boolean(this.getAssignmentForEventAndResource(event, resource));
  }
  /**
   * Returns an assignment record for a given event and resource
   *
   * @param {Scheduler.model.EventModel|String|Number} event The event or its id
   * @param {Scheduler.model.ResourceModel|String|Number} resource The resource or its id
   * @returns {Scheduler.model.AssignmentModel}
   * @category Assignments
   */
  getAssignmentForEventAndResource(event, resource) {
    let assignments;
    if (!(event = this.eventStore.getById(event)) || !(assignments = event.assignments) || // Also note that resources are looked for in the master store if chained, to handle dragging between
    // schedulers using chained versions of the same resource store. Needed since assignmentStore is shared and
    // might point to wrong resourceStore (can only point to one)
    !(resource = this.resourceStore.$master.getById(resource))) {
      return null;
    }
    return this.getOccurrence(assignments.find((a) => {
      var _a;
      return ((_a = a.resource) == null ? void 0 : _a.$original) === resource.$original;
    }), event);
  }
  //endregion
};

// ../Engine/lib/Engine/util/Functions.js
var isNotNumber = (value) => Number(value) !== value;
var CIFromSetOrArrayOrValue = (value) => {
  if (value instanceof Set || value instanceof Array)
    return CI(value);
  return CI([value]);
};
var delay = (value) => new Promise((resolve) => setTimeout(resolve, value));
var format = (format2, ...values) => {
  return format2.replace(/{(\d+)}/g, (match, number) => typeof values[number] !== "undefined" ? values[number] : match);
};

// ../Engine/lib/Engine/quark/store/AbstractAssignmentStoreMixin.js
var AbstractAssignmentStoreMixin = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class AbstractAssignmentStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.assignmentsForRemoval = /* @__PURE__ */ new Set();
      this.allAssignmentsForRemoval = false;
    }
    remove(records, silent) {
      this.assignmentsForRemoval = CIFromSetOrArrayOrValue(records).toSet();
      const res = superProto.remove.call(this, records, silent);
      this.assignmentsForRemoval.clear();
      return res;
    }
    removeAll(silent) {
      this.allAssignmentsForRemoval = true;
      const res = superProto.removeAll.call(this, silent);
      this.allAssignmentsForRemoval = false;
      return res;
    }
  }
  return AbstractAssignmentStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/CoreAssignmentStoreMixin.js
var emptySet = /* @__PURE__ */ new Set();
var CoreAssignmentStoreMixin = class extends Mixin([AbstractAssignmentStoreMixin, CorePartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CoreAssignmentStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.skipInvalidateIndices = false;
    }
    static get defaultConfig() {
      return {
        modelClass: CoreAssignmentMixin,
        storage: {
          extraKeys: [
            { property: "event", unique: false },
            { property: "resource", unique: false },
            { property: "eventId", unique: false }
          ]
        }
      };
    }
    set data(value) {
      this.allAssignmentsForRemoval = true;
      super.data = value;
      this.allAssignmentsForRemoval = false;
    }
    getEventsAssignments(event) {
      return this.storage.findItem("event", event, true) || emptySet;
    }
    getResourcesAssignments(resource) {
      return this.storage.findItem("resource", resource.$original, true) || emptySet;
    }
    updateIndices() {
      this.storage.rebuildIndices();
    }
    invalidateIndices() {
      this.storage.invalidateIndices();
    }
    afterLoadData() {
      this.eventStore && this.linkAssignments(this.eventStore, "event");
      this.resourceStore && this.linkAssignments(this.resourceStore, "resource");
    }
    // Link events/resources to assignments, called when those stores are populated or joined to project
    linkAssignments(store, modelName) {
      store = store.masterStore || store;
      const unresolved = this.count && this.storage.findItem(modelName, null, true);
      if (unresolved) {
        for (const assignment of unresolved) {
          const record = store.getById(assignment.getCurrentOrProposed(modelName));
          if (record)
            assignment.setChanged(modelName, record);
        }
        this.invalidateIndices();
      }
    }
    // Unlink events/resources from assignments, called when those stores are cleared
    unlinkAssignments(modelName) {
      this.forEach((assignment) => {
        var _a, _b, _c;
        return assignment.setChanged(modelName, (_c = (_b = (_a = assignment[modelName]) == null ? void 0 : _a.id) != null ? _b : assignment == null ? void 0 : assignment.getData(modelName)) != null ? _c : assignment[modelName + "Id"]);
      });
      this.invalidateIndices();
    }
    onCommitAsync() {
      this.updateIndices();
    }
  }
  return CoreAssignmentStoreMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/data/AssignmentStore.js
var EngineMixin6 = PartOfProject_default(CoreAssignmentStoreMixin.derive(AjaxStore));
var AssignmentStore = class extends AssignmentStoreMixin_default(EngineMixin6) {
  static get defaultConfig() {
    return {
      modelClass: AssignmentModel
    };
  }
};
__publicField(AssignmentStore, "$name", "AssignmentStore");
AssignmentStore._$name = "AssignmentStore";

// ../Scheduler/lib/Scheduler/model/DependencyBaseModel.js
var canonicalDependencyTypes = [
  "SS",
  "SF",
  "FS",
  "FF"
];
var DependencyBaseModel = class _DependencyBaseModel extends Model {
  static get $name() {
    return "DependencyBaseModel";
  }
  /**
   * Set value for the specified field(s), triggering engine calculations immediately. See
   * {@link Core.data.Model#function-set Model#set()} for arguments.
   **
   * ```javascript
   * dependency.set('from', 2);
   * // dependency.fromEvent is not yet up to date
   *
   * await dependency.setAsync('from', 2);
   * // dependency.fromEvent is up to date
   * ```
   *
   * @param {String|Object} field The field to set value for, or an object with multiple values to set in one call
   * @param {*} [value] Value to set
   * @param {Boolean} [silent=false] Set to true to not trigger events
   * automatically.
   * @function setAsync
   * @category Editing
   * @async
   */
  //region Fields
  /**
   * An enumerable object, containing names for the dependency types integer constants.
   * - 0 StartToStart
   * - 1 StartToEnd
   * - 2 EndToStart
   * - 3 EndToEnd
   * @property {Object}
   * @readonly
   * @category Dependency
   */
  static get Type() {
    return {
      StartToStart: 0,
      StartToEnd: 1,
      EndToStart: 2,
      EndToEnd: 3
    };
  }
  static get fields() {
    return [
      // 3 mandatory fields
      /**
       * From event, id of source event
       * @field {String|Number} from
       * @category Dependency
       */
      { name: "from" },
      /**
       * To event, id of target event
       * @field {String|Number} to
       * @category Dependency
       */
      { name: "to" },
      /**
       * Dependency type, see static property {@link #property-Type-static}
       * @field {Number} type=2
       * @category Dependency
       */
      { name: "type", type: "int", defaultValue: 2 },
      /**
       * CSS class to apply to lines drawn for the dependency
       * @field {String} cls
       * @category Styling
       */
      { name: "cls", defaultValue: "" },
      /**
       * Bidirectional, drawn with arrows in both directions
       * @field {Boolean} bidirectional
       * @category Dependency
       */
      { name: "bidirectional", type: "boolean" },
      /**
       * Start side on source (top, left, bottom, right)
       * @field {'top'|'left'|'bottom'|'right'} fromSide
       * @category Dependency
       */
      { name: "fromSide", type: "string" },
      /**
       * End side on target (top, left, bottom, right)
       * @field {'top'|'left'|'bottom'|'right'} toSide
       * @category Dependency
       */
      { name: "toSide", type: "string" },
      /**
       * The magnitude of this dependency's lag (the number of units).
       * @field {Number} lag
       * @category Dependency
       */
      { name: "lag", type: "number", allowNull: true, defaultValue: 0 },
      /**
       * The units of this dependency's lag, defaults to "d" (days). Valid values are:
       *
       * - "ms" (milliseconds)
       * - "s" (seconds)
       * - "m" (minutes)
       * - "h" (hours)
       * - "d" (days)
       * - "w" (weeks)
       * - "M" (months)
       * - "y" (years)
       *
       * This field is readonly after creation, to change `lagUnit` use {@link #function-setLag setLag()}.
       * @field {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} lagUnit
       * @category Dependency
       * @readonly
       */
      {
        name: "lagUnit",
        type: "string",
        defaultValue: "d"
      },
      { name: "highlighted", persist: false, internal: true }
    ];
  }
  // fromEvent/toEvent defined in CoreDependencyMixin in engine
  /**
   * Gets/sets the source event of the dependency.
   *
   * Accepts multiple formats but always returns an {@link Scheduler.model.EventModel}.
   *
   * **NOTE:** This is not a proper field but rather an alias, it will be serialized but cannot be remapped. If you
   * need to remap, consider using {@link #field-from} instead.
   *
   * @field {Scheduler.model.EventModel} fromEvent
   * @accepts {String|Number|Scheduler.model.EventModel}
   * @category Dependency
   */
  /**
   * Gets/sets the target event of the dependency.
   *
   * Accepts multiple formats but always returns an {@link Scheduler.model.EventModel}.
   *
   * **NOTE:** This is not a proper field but rather an alias, it will be serialized but cannot be remapped. If you
   * need to remap, consider using {@link #field-to} instead.
   *
   * @field {Scheduler.model.EventModel} toEvent
   * @accepts {String|Number|Scheduler.model.EventModel}
   * @category Dependency
   */
  //endregion
  //region Init
  construct(data) {
    const from = data[this.fieldMap.from.dataSource], to = data[this.fieldMap.to.dataSource];
    if (from != null) {
      data.fromEvent = from;
    }
    if (to != null) {
      data.toEvent = to;
    }
    super.construct(...arguments);
  }
  //endregion
  get eventStore() {
    var _a;
    return this.eventStore || ((_a = this.unjoinedStores[0]) == null ? void 0 : _a.eventStore);
  }
  set from(value) {
    const { fromEvent } = this;
    if ((fromEvent == null ? void 0 : fromEvent.isModel) && fromEvent.id === value) {
      this.set("from", value);
    } else {
      this.fromEvent = value;
    }
  }
  get from() {
    return this.get("from");
  }
  set to(value) {
    const { toEvent } = this;
    if ((toEvent == null ? void 0 : toEvent.isModel) && toEvent.id === value) {
      this.set("to", value);
    } else {
      this.toEvent = value;
    }
  }
  get to() {
    return this.get("to");
  }
  /**
   * Alias to dependency type, but when set resets {@link #field-fromSide} & {@link #field-toSide} to null as well.
   *
   * @property {Number}
   * @category Dependency
   */
  get hardType() {
    return this.getHardType();
  }
  set hardType(type) {
    this.setHardType(type);
  }
  /**
   * Returns dependency hard type, see {@link #property-hardType}.
   *
   * @returns {Number}
   * @category Dependency
   */
  getHardType() {
    return this.get("type");
  }
  /**
   * Sets dependency {@link #field-type} and resets {@link #field-fromSide} and {@link #field-toSide} to null.
   *
   * @param {Number} type
   * @category Dependency
   */
  setHardType(type) {
    let result;
    if (type !== this.hardType) {
      result = this.set({
        type,
        fromSide: null,
        toSide: null
      });
    }
    return result;
  }
  get lag() {
    return this.get("lag");
  }
  set lag(lag) {
    this.setLag(lag);
  }
  /**
   * Sets lag and lagUnit in one go. Only allowed way to change lagUnit, the lagUnit field is readonly after creation
   * @param {Number|String|Object} lag The lag value. May be just a numeric magnitude, or a full string descriptor eg '1d'
   * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} [lagUnit] Unit for numeric lag value, see
   * {@link #field-lagUnit} for valid values
   * @category Dependency
   */
  setLag(lag, lagUnit = this.lagUnit) {
    if (arguments.length === 1) {
      if (typeof lag === "number") {
        this.lag = lag;
      } else {
        lag = DateHelper.parseDuration(lag);
        this.set({
          lag: lag.magnitude,
          lagUnit: lag.unit
        });
      }
      return;
    }
    lag = parseFloat(lag);
    this.set({
      lag,
      lagUnit
    });
  }
  getLag() {
    if (this.lag) {
      return `${this.lag < 0 ? "-" : "+"}${Math.abs(this.lag)}${DateHelper.getShortNameOfUnit(this.lagUnit)}`;
    }
    return "";
  }
  /**
   * Property which encapsulates the lag's magnitude and units. An object which contains two properties:
   * @property {Core.data.Duration}
   * @property {Number} fullLag.magnitude The magnitude of the duration
   * @property {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} fullLag.unit The unit in which the duration is measured, eg
   * `'d'` for days
   * @category Dependency
   */
  get fullLag() {
    return new Duration({
      unit: this.lagUnit,
      magnitude: this.lag
    });
  }
  set fullLag(lag) {
    if (typeof lag === "string") {
      this.setLag(lag);
    } else {
      this.setLag(lag.magnitude, lag.unit);
    }
  }
  /**
   * Returns true if the linked events have been persisted (e.g. neither of them are 'phantoms')
   *
   * @property {Boolean}
   * @readonly
   * @category Editing
   */
  get isPersistable() {
    const me = this, { stores, unjoinedStores } = me, store = stores[0];
    let result;
    if (store) {
      const { fromEvent, toEvent } = me, crudManager = store.crudManager;
      result = fromEvent && (crudManager || !fromEvent.hasGeneratedId) && toEvent && (crudManager || !toEvent.hasGeneratedId);
    } else {
      result = Boolean(unjoinedStores[0]);
    }
    return result && super.isPersistable;
  }
  getDateRange() {
    const { fromEvent, toEvent } = this;
    if ((fromEvent == null ? void 0 : fromEvent.isScheduled) && (toEvent == null ? void 0 : toEvent.isScheduled)) {
      const Type = _DependencyBaseModel.Type;
      let sourceDate, targetDate;
      switch (this.type) {
        case Type.StartToStart:
          sourceDate = fromEvent.startDateMS;
          targetDate = toEvent.startDateMS;
          break;
        case Type.StartToEnd:
          sourceDate = fromEvent.startDateMS;
          targetDate = toEvent.endDateMS;
          break;
        case Type.EndToEnd:
          sourceDate = fromEvent.endDateMS;
          targetDate = toEvent.endDateMS;
          break;
        case Type.EndToStart:
          sourceDate = fromEvent.endDateMS;
          targetDate = toEvent.startDateMS;
          break;
        default:
          throw new Error("Invalid dependency type: " + this.type);
      }
      return {
        start: Math.min(sourceDate, targetDate),
        end: Math.max(sourceDate, targetDate)
      };
    }
    return null;
  }
  /**
   * Applies given CSS class to dependency, the value doesn't persist
   *
   * @param {String} cls
   * @category Dependency
   */
  highlight(cls) {
    var _a, _b;
    const classes = (_b = (_a = this.highlighted) == null ? void 0 : _a.split(" ")) != null ? _b : [];
    if (!classes.includes(cls)) {
      this.highlighted = classes.concat(cls).join(" ");
    }
  }
  /**
   * Removes given CSS class from dependency if applied, the value doesn't persist
   *
   * @param {String} cls
   * @category Dependency
   */
  unhighlight(cls) {
    const { highlighted } = this;
    if (highlighted) {
      const classes = highlighted.split(" "), index = classes.indexOf(cls);
      if (index >= 0) {
        classes.splice(index, 1);
        this.highlighted = classes.join(" ");
      }
    }
  }
  /**
   * Checks if the given CSS class is applied to dependency.
   *
   * @param {String} cls
   * @returns {Boolean}
   * @category Dependency
   */
  isHighlightedWith(cls) {
    return this.highlighted && this.highlighted.split(" ").includes(cls);
  }
  getConnectorString(raw) {
    const rawValue = canonicalDependencyTypes[this.type];
    if (raw) {
      return rawValue;
    }
    if (this.type === _DependencyBaseModel.Type.EndToStart) {
      return "";
    }
    return rawValue;
  }
  // getConnectorStringFromType(type, raw) {
  //     const rawValue = canonicalDependencyTypes[type];
  //
  //     if (raw) {
  //         return rawValue;
  //     }
  //
  //     // FS => empty string; it's the default
  //     if (type === DependencyBaseModel.Type.EndToStart) {
  //         return '';
  //     }
  //
  //     const locale = LocaleManager.locale;
  //
  //     // See if there is a local version of SS, SF or FF
  //     if (locale) {
  //         const localized = locale.Scheduler && locale.Scheduler[rawValue];
  //         if (localized) {
  //             return localized;
  //         }
  //     }
  //
  //     return rawValue;
  // }
  // getConnectorString(raw) {
  //     return this.getConnectorStringFromType(this.type);
  // }
  // * getConnectorStringGenerator(raw) {
  //     return this.getConnectorStringFromType(yield this.$.type);
  // }
  toString() {
    return `${this.from}${this.getConnectorString()}${this.getLag()}`;
  }
  /**
   * Returns `true` if the dependency is valid. It is considered valid if it has a valid type and both from and to
   * events are set and pointing to different events.
   *
   * @property {Boolean}
   * @typings ignore
   * @category Editing
   */
  get isValid() {
    const { fromEvent, toEvent, type } = this;
    return typeof type === "number" && fromEvent && toEvent && fromEvent !== toEvent;
  }
  get fromEventName() {
    var _a;
    return ((_a = this.fromEvent) == null ? void 0 : _a.name) || "";
  }
  get toEventName() {
    var _a;
    return ((_a = this.toEvent) == null ? void 0 : _a.name) || "";
  }
  //region STM hooks
  shouldRecordFieldChange(fieldName, oldValue, newValue) {
    var _a;
    if (!super.shouldRecordFieldChange(fieldName, oldValue, newValue)) {
      return false;
    }
    if (fieldName === "from" || fieldName === "to" || fieldName === "fromEvent" || fieldName === "toEvent") {
      const eventStore = (_a = this.project) == null ? void 0 : _a.eventStore;
      if (eventStore && eventStore.oldIdMap[oldValue] === eventStore.getById(newValue)) {
        return false;
      }
    }
    return true;
  }
  //endregion
};
DependencyBaseModel.exposeProperties();
DependencyBaseModel._$name = "DependencyBaseModel";

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreDependencyMixin.js
var CoreDependencyMixin = class extends Mixin([CorePartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CoreDependencyMixin2 extends base {
    static get fields() {
      return [
        { name: "fromEvent", isEqual: (a, b) => a === b, persist: false },
        { name: "toEvent", isEqual: (a, b) => a === b, persist: false }
      ];
    }
    // Resolve early + update indices to have buckets ready before commit
    setChanged(field, value, invalidate) {
      var _a, _b, _c;
      let update = false;
      if (field === "fromEvent" || field === "toEvent") {
        const event = isInstanceOf(value, CoreEventMixin) ? value : (_a = this.eventStore) == null ? void 0 : _a.getById(value);
        if (event)
          update = true;
        value = event || value;
      }
      superProto.setChanged.call(this, field, value, invalidate, true);
      if (update && !this.project.isPerformingCommit && !((_b = this.dependencyStore) == null ? void 0 : _b.isLoadingData)) {
        (_c = this.dependencyStore) == null ? void 0 : _c.invalidateIndices();
      }
    }
    // Resolve events when joining project
    joinProject() {
      superProto.joinProject.call(this);
      this.setChanged("fromEvent", this.get("fromEvent"));
      this.setChanged("toEvent", this.get("toEvent"));
    }
    // Resolved events as part of commit
    // Normally done earlier in setChanged, but stores might not have been available yet at that point
    calculateInvalidated() {
      var _a, _b;
      let { fromEvent, toEvent } = this.$changed;
      if (fromEvent !== null && !isInstanceOf(fromEvent, CoreEventMixin)) {
        const resolved = (_a = this.eventStore) == null ? void 0 : _a.getById(fromEvent);
        if (resolved)
          this.$changed.fromEvent = resolved;
      }
      if (toEvent !== null && !isInstanceOf(toEvent, CoreEventMixin)) {
        const resolved = (_b = this.eventStore) == null ? void 0 : _b.getById(toEvent);
        if (resolved)
          this.$changed.toEvent = resolved;
      }
    }
    //region Events
    // Not using "propose" mechanism from CoreEventMixin, because buckets are expected to be up to date right away
    set fromEvent(fromEvent) {
      this.setChanged("fromEvent", fromEvent);
    }
    get fromEvent() {
      const fromEvent = this.get("fromEvent");
      return (fromEvent == null ? void 0 : fromEvent.id) != null ? fromEvent : null;
    }
    set toEvent(toEvent) {
      this.setChanged("toEvent", toEvent);
    }
    get toEvent() {
      const toEvent = this.get("toEvent");
      return (toEvent == null ? void 0 : toEvent.id) != null ? toEvent : null;
    }
  }
  return CoreDependencyMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/model/DependencyModel.js
var EngineMixin7 = CoreDependencyMixin;
var DependencyModel = class extends PartOfProject_default(EngineMixin7.derive(DependencyBaseModel)) {
  static get $name() {
    return "DependencyModel";
  }
  // Determines the type of dependency based on fromSide and toSide
  getTypeFromSides(fromSide, toSide, rtl) {
    const types = DependencyBaseModel.Type, startSide = rtl ? "right" : "left", endSide = rtl ? "left" : "right";
    if (fromSide === startSide) {
      return toSide === startSide ? types.StartToStart : types.StartToEnd;
    }
    return toSide === endSide ? types.EndToEnd : types.EndToStart;
  }
};
DependencyModel.exposeProperties();
DependencyModel._$name = "DependencyModel";

// ../Scheduler/lib/Scheduler/data/mixin/DependencyStoreMixin.js
var DependencyStoreMixin_default = (Target) => class DependencyStoreMixin extends Target {
  static get $name() {
    return "DependencyStoreMixin";
  }
  /**
   * Add dependencies to the store.
   *
   * NOTE: References (fromEvent, toEvent) on the dependencies are determined async by a calculation engine. Thus they
   * cannot be directly accessed after using this function.
   *
   * For example:
   *
   * ```javascript
   * const [dependency] = dependencyStore.add({ from, to });
   * // dependency.fromEvent is not yet available
   * ```
   *
   * To guarantee references are set up, wait for calculations for finish:
   *
   * ```javascript
   * const [dependency] = dependencyStore.add({ from, to });
   * await dependencyStore.project.commitAsync();
   * // dependency.fromEvent is available (assuming EventStore is loaded and so on)
   * ```
   *
   * Alternatively use `addAsync()` instead:
   *
   * ```javascript
   * const [dependency] = await dependencyStore.addAsync({ from, to });
   * // dependency.fromEvent is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.DependencyModel|Scheduler.model.DependencyModel[]|DependencyModelConfig|DependencyModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.DependencyModel[]} Added records
   * @function add
   * @category CRUD
   */
  /**
   * Add dependencies to the store and triggers calculations directly after. Await this function to have up to date
   * references on the added dependencies.
   *
   * ```javascript
   * const [dependency] = await dependencyStore.addAsync({ from, to });
   * // dependency.fromEvent is available (assuming EventStore is loaded and so on)
   * ```
   *
   * @param {Scheduler.model.DependencyModel|Scheduler.model.DependencyModel[]|DependencyModelConfig|DependencyModelConfig[]} records
   * Array of records/data or a single record/data to add to store
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Scheduler.model.DependencyModel[]} Added records
   * @function addAsync
   * @category CRUD
   * @async
   */
  /**
   * Applies a new dataset to the DependencyStore. Use it to plug externally fetched data into the store.
   *
   * NOTE: References (fromEvent, toEvent) on the dependencies are determined async by a calculation engine. Thus
   * they cannot be directly accessed after assigning the new dataset.
   *
   * For example:
   *
   * ```javascript
   * dependencyStore.data = [{ from, to }];
   * // dependencyStore.first.fromEvent is not yet available
   * ```
   *
   * To guarantee references are available, wait for calculations for finish:
   *
   * ```javascript
   * dependencyStore.data = [{ from, to }];
   * await dependencyStore.project.commitAsync();
   * // dependencyStore.first.fromEvent is available
   * ```
   *
   * Alternatively use `loadDataAsync()` instead:
   *
   * ```javascript
   * await dependencyStore.loadDataAsync([{ from, to }]);
   * // dependencyStore.first.fromEvent is available
   * ```
   *
   * @member {DependencyModelConfig[]} data
   * @category Records
   */
  /**
   * Applies a new dataset to the DependencyStore and triggers calculations directly after. Use it to plug externally
   * fetched data into the store.
   *
   * ```javascript
   * await dependencyStore.loadDataAsync([{ from, to }]);
   * // dependencyStore.first.fromEvent is available
   * ```
   *
   * @param {DependencyModelConfig[]} data Array of DependencyModel data objects
   * @function loadDataAsync
   * @category CRUD
   * @async
   */
  static get defaultConfig() {
    return {
      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 400,
      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 400,
      storeId: "dependencies"
    };
  }
  reduceEventDependencies(event, reduceFn, result, flat = true, depsGetterFn) {
    depsGetterFn = depsGetterFn || ((event2) => this.getEventDependencies(event2));
    event = ArrayHelper.asArray(event);
    event.reduce((result2, event2) => {
      if (event2.children && !flat) {
        event2.traverse((evt) => {
          result2 = depsGetterFn(evt).reduce(reduceFn, result2);
        });
      } else {
        result2 = depsGetterFn(event2).reduce(reduceFn, result2);
      }
    }, result);
    return result;
  }
  mapEventDependencies(event, fn2, filterFn, flat, depsGetterFn) {
    return this.reduceEventDependencies(event, (result, dependency) => {
      filterFn(dependency) && result.push(dependency);
      return result;
    }, [], flat, depsGetterFn);
  }
  mapEventPredecessors(event, fn2, filterFn, flat) {
    return this.reduceEventPredecessors(event, (result, dependency) => {
      filterFn(dependency) && result.push(dependency);
      return result;
    }, [], flat);
  }
  mapEventSuccessors(event, fn2, filterFn, flat) {
    return this.reduceEventSuccessors(event, (result, dependency) => {
      filterFn(dependency) && result.push(dependency);
      return result;
    }, [], flat);
  }
  /**
   * Returns all dependencies for a certain event (both incoming and outgoing)
   *
   * @param {Scheduler.model.EventModel} event
   * @returns {Scheduler.model.DependencyModel[]}
   */
  getEventDependencies(event) {
    return [].concat(event.predecessors || [], event.successors || []);
  }
  removeEventDependencies(event) {
    this.remove(this.getEventDependencies(event));
  }
  removeEventPredecessors(event) {
    this.remove(event.predecessors);
  }
  removeEventSuccessors(event, flat) {
    this.remove(event.successors);
  }
  getBySourceTargetId(key) {
    return this.records.find(
      (r) => key == this.constructor.makeDependencySourceTargetCompositeKey(r.from, r.to)
    );
  }
  /**
   * Returns dependency model instance linking tasks with given ids. The dependency can be forward (from 1st
   * task to 2nd) or backward (from 2nd to 1st).
   *
   * @param {Scheduler.model.EventModel|String} sourceEvent 1st event
   * @param {Scheduler.model.EventModel|String} targetEvent 2nd event
   * @returns {Scheduler.model.DependencyModel}
   */
  getDependencyForSourceAndTargetEvents(sourceEvent, targetEvent) {
    sourceEvent = Model.asId(sourceEvent);
    targetEvent = Model.asId(targetEvent);
    return this.getBySourceTargetId(this.constructor.makeDependencySourceTargetCompositeKey(sourceEvent, targetEvent));
  }
  /**
   * Returns a dependency model instance linking given events if such dependency exists in the store.
   * The dependency can be forward (from 1st event to 2nd) or backward (from 2nd to 1st).
   *
   * @param {Scheduler.model.EventModel|String} sourceEvent
   * @param {Scheduler.model.EventModel|String} targetEvent
   * @returns {Scheduler.model.DependencyModel}
   */
  getEventsLinkingDependency(sourceEvent, targetEvent) {
    return this.getDependencyForSourceAndTargetEvents(sourceEvent, targetEvent) || this.getDependencyForSourceAndTargetEvents(targetEvent, sourceEvent);
  }
  /**
   * Validation method used to validate a dependency. Override and return `true` to indicate that an
   * existing dependency between two tasks is valid. For a new dependency being created please see
   * {@link #function-isValidDependencyToCreate}.
   *
   * @param {Scheduler.model.DependencyModel|Scheduler.model.TimeSpan|Number|String} dependencyOrFromId The dependency
   * model, the from task/event or the id of the from task/event
   * @param {Scheduler.model.TimeSpan|Number|String} [toId] To task/event or id thereof if the first parameter is not
   * a dependency record
   * @param {Number} [type] Dependency {@link Scheduler.model.DependencyBaseModel#property-Type-static} if the first
   * parameter is not a dependency model instance.
   * @returns {Boolean}
   */
  async isValidDependency(dependencyOrFromId, toId, type) {
    let fromEvent = dependencyOrFromId, toEvent = toId;
    if (dependencyOrFromId == null) {
      return false;
    }
    if (dependencyOrFromId.isDependencyModel) {
      ({ fromEvent, toEvent } = dependencyOrFromId);
    }
    fromEvent = this.eventStore.getById(fromEvent);
    toEvent = this.eventStore.getById(toEvent);
    if (fromEvent && toEvent) {
      if (!fromEvent.project || !toEvent.project) {
        return false;
      }
      return this.project.isValidDependency(fromEvent, toEvent, type);
    }
    return dependencyOrFromId !== toId;
  }
  /**
   * Validation method used to validate a dependency while creating. Override and return `true` to indicate that
   * a new dependency is valid to be created.
   *
   * @param {Scheduler.model.TimeSpan|Number|String} fromId From event/task or id
   * @param {Scheduler.model.TimeSpan|Number|String} toId To event/task or id
   * @param {Number} type Dependency {@link Scheduler.model.DependencyBaseModel#property-Type-static}
   * @returns {Boolean}
   */
  isValidDependencyToCreate(fromId, toId, type) {
    return this.isValidDependency(fromId, toId, type);
  }
  /**
   * Returns all dependencies highlighted with the given CSS class
   *
   * @param {String} cls
   * @returns {Scheduler.model.DependencyBaseModel[]}
   */
  getHighlightedDependencies(cls) {
    return this.records.reduce((result, dep) => {
      if (dep.isHighlightedWith(cls))
        result.push(dep);
      return result;
    }, []);
  }
  static makeDependencySourceTargetCompositeKey(from, to) {
    return `source(${from})-target(${to})`;
  }
  //region Product neutral
  getTimeSpanDependencies(record) {
    return this.getEventDependencies(record);
  }
  //endregion
};

// ../Engine/lib/Engine/quark/store/AbstractDependencyStoreMixin.js
var AbstractDependencyStoreMixin = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class AbstractDependencyStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.dependenciesForRemoval = /* @__PURE__ */ new Set();
      this.allDependenciesForRemoval = false;
    }
    remove(records, silent) {
      this.dependenciesForRemoval = CIFromSetOrArrayOrValue(records).toSet();
      const res = superProto.remove.call(this, records, silent);
      this.dependenciesForRemoval.clear();
      return res;
    }
    removeAll(silent) {
      this.allDependenciesForRemoval = true;
      const res = superProto.removeAll.call(this, silent);
      this.allDependenciesForRemoval = false;
      return res;
    }
  }
  return AbstractDependencyStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/CoreDependencyStoreMixin.js
var emptySet2 = /* @__PURE__ */ new Set();
var CoreDependencyStoreMixin = class extends Mixin([AbstractDependencyStoreMixin, CorePartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CoreDependencyStoreMixin2 extends base {
    constructor() {
      super(...arguments);
      this.dependenciesForRemoval = /* @__PURE__ */ new Set();
      this.allDependenciesForRemoval = false;
    }
    static get defaultConfig() {
      return {
        modelClass: CoreDependencyMixin,
        storage: {
          extraKeys: [
            { property: "fromEvent", unique: false },
            { property: "toEvent", unique: false }
          ]
        }
      };
    }
    getIncomingDepsForEvent(event) {
      return this.storage.findItem("toEvent", event) || emptySet2;
    }
    getOutgoingDepsForEvent(event) {
      return this.storage.findItem("fromEvent", event) || emptySet2;
    }
    set data(value) {
      this.allDependenciesForRemoval = true;
      super.data = value;
      this.allDependenciesForRemoval = false;
    }
    updateIndices() {
      this.storage.rebuildIndices();
    }
    invalidateIndices() {
      this.storage.invalidateIndices();
    }
    onCommitAsync() {
      this.updateIndices();
    }
  }
  return CoreDependencyStoreMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/data/DependencyStore.js
var EngineMixin8 = PartOfProject_default(CoreDependencyStoreMixin.derive(AjaxStore));
var DependencyStore = class extends DependencyStoreMixin_default(EngineMixin8.derive(AjaxStore)) {
  static get defaultConfig() {
    return {
      modelClass: DependencyModel
    };
  }
};
DependencyStore._$name = "DependencyStore";

// ../Scheduler/lib/Scheduler/crud/mixin/AbstractCrudManagerValidation.js
var AbstractCrudManagerValidation_default = (Target) => class AbstractCrudManagerValidation extends Target {
  static get $name() {
    return "AbstractCrudManagerValidation";
  }
  static get configurable() {
    return {
      /**
       * This config validates the response structure for requests made by the Crud Manager.
       * When `true`, the Crud Manager checks every parsed response structure for errors
       * and if the response format is invalid, a warning is logged to the browser console.
       *
       * The config is intended to help developers implementing backend integration.
       *
       * @config {Boolean}
       * @default
       * @category CRUD
       */
      validateResponse: true,
      /**
       * When `true` treats parsed responses without `success` property as successful.
       * In this mode a parsed response is treated as invalid if it has explicitly set `success : false`.
       * @config {Boolean}
       * @default
       * @category CRUD
       */
      skipSuccessProperty: true,
      crudLoadValidationWarningPrefix: "CrudManager load response error(s):",
      crudSyncValidationWarningPrefix: "CrudManager sync response error(s):",
      supportShortSyncResponseNote: 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/products/scheduler/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-supportShortSyncResponse)',
      disableValidationNote: 'Note: To disable this validation please set the "validateResponse" config to false'
    };
  }
  get crudLoadValidationMandatoryStores() {
    return [];
  }
  getStoreLoadResponseWarnings(storeInfo, responded, expectedResponse) {
    const messages = [], { storeId } = storeInfo, mandatoryStores = this.crudLoadValidationMandatoryStores, result = { [storeId]: {} };
    if (responded) {
      if (!responded.rows) {
        messages.push(`- "${storeId}" store section should have a "rows" property with an array of the store records.`);
        result[storeId].rows = ["..."];
      }
    } else if (mandatoryStores == null ? void 0 : mandatoryStores.includes(storeId)) {
      messages.push(`- No "${storeId}" store section found. It should contain the store data.`);
      result[storeId].rows = ["..."];
    }
    if (messages.length) {
      Object.assign(expectedResponse, result);
    }
    return messages;
  }
  getLoadResponseWarnings(response) {
    const messages = [], expectedResponse = {};
    if (!this.skipSuccessProperty) {
      expectedResponse.success = true;
    }
    this.forEachCrudStore((store, storeId, storeInfo) => {
      messages.push(...this.getStoreLoadResponseWarnings(storeInfo, response == null ? void 0 : response[storeId], expectedResponse));
    });
    if (messages.length) {
      messages.push("Please adjust your response to look like this:\n" + JSON.stringify(expectedResponse, null, 4).replace(/"\.\.\."/g, "..."));
      messages.push(this.disableValidationNote);
    }
    return messages;
  }
  validateLoadResponse(response) {
    const messages = this.getLoadResponseWarnings(response);
    if (messages.length) {
      console.warn(this.crudLoadValidationWarningPrefix + "\n" + messages.join("\n"));
    }
  }
  getStoreSyncResponseWarnings(storeInfo, requested, responded, expectedResponse) {
    const messages = [], missingRows = [], missingRemoved = [], { storeId } = storeInfo, result = { [storeId]: {} }, phantomIdField = storeInfo.phantomIdField || this.phantomIdField, { modelClass } = storeInfo.store, { idField } = modelClass, respondedRows = (responded == null ? void 0 : responded.rows) || [], respondedRemoved = (responded == null ? void 0 : responded.removed) || [];
    let showSupportShortSyncResponseNote = false;
    if (requested == null ? void 0 : requested.added) {
      missingRows.push(
        ...requested.added.filter((record) => {
          return !respondedRows.find((row) => row[phantomIdField] == record[phantomIdField]) && !respondedRemoved.find((row) => row[phantomIdField] == record[phantomIdField] || row[idField] == record[phantomIdField]);
        }).map((record) => ({ [phantomIdField]: record[phantomIdField], [idField]: "..." }))
      );
      if (missingRows.length) {
        const missingIds = missingRows.map((row) => "#" + row[phantomIdField]).join(", ");
        messages.push(`- "${storeId}" store "rows" section should mention added record(s) ${missingIds} sent in the request. It should contain the added records identifiers (both phantom and "real" ones assigned by the backend).`);
      }
    }
    if (this.supportShortSyncResponse) {
      if (!missingRows.length && responded) {
        if (typeof responded !== "object" || Array.isArray(responded)) {
          messages.push(`- "${storeId}" store section should be an Object.`);
          result[storeId]["..."] = "...";
        }
        if (responded.rows && !Array.isArray(responded.rows)) {
          messages.push(`- "${storeId}" store "rows" section should be an array`);
          missingRows.push("...");
        }
        if (responded.removed && !Array.isArray(responded.removed)) {
          messages.push(`- "${storeId}" store "removed" section should be an array:`);
          missingRemoved.push("...");
        }
      }
    } else {
      if (requested == null ? void 0 : requested.updated) {
        const missingUpdatedRows = requested.updated.filter((record) => !respondedRows.find((row) => row[idField] == record[idField])).map((record) => ({ [idField]: record[idField] }));
        missingRows.push(...missingUpdatedRows);
        if (missingUpdatedRows.length) {
          const missingIds = missingUpdatedRows.map((row) => "#" + row[idField]).join(", ");
          messages.push(`- "${storeId}" store "rows" section should mention updated record(s) ${missingIds} sent in the request. It should contain the updated record identifiers.`);
          showSupportShortSyncResponseNote = true;
        }
      }
      if (missingRows.length) {
        missingRows.push("...");
      }
      if (requested == null ? void 0 : requested.removed) {
        missingRemoved.push(
          ...requested.removed.filter((record) => !respondedRows.find((row) => row[idField] == record[idField])).map((record) => ({ [idField]: record[idField] }))
        );
        if (missingRemoved.length) {
          const missingIds = missingRemoved.map((row) => "#" + row[idField]).join(", ");
          messages.push(`- "${storeId}" store "removed" section should mention removed record(s) ${missingIds} sent in the request. It should contain the removed record identifiers.`);
          result[storeId].removed = missingRemoved;
          missingRemoved.push("...");
          showSupportShortSyncResponseNote = true;
        }
      }
    }
    if (missingRows.length) {
      result[storeId].rows = missingRows;
    }
    if (!messages.length) {
      delete result[storeId];
    }
    Object.assign(expectedResponse, result);
    return { messages, showSupportShortSyncResponseNote };
  }
  getSyncResponseWarnings(response, requestDesc) {
    const messages = [], expectedResponse = {}, request = requestDesc.pack;
    if (!this.skipSuccessProperty) {
      expectedResponse.success = true;
    }
    let showSupportShortSyncResponseNote = false;
    this.forEachCrudStore((store, storeId, storeInfo) => {
      const warnings = this.getStoreSyncResponseWarnings(storeInfo, request == null ? void 0 : request[storeId], response[storeId], expectedResponse);
      showSupportShortSyncResponseNote = showSupportShortSyncResponseNote || warnings.showSupportShortSyncResponseNote;
      messages.push(...warnings.messages);
    });
    if (messages.length) {
      messages.push("Please adjust your response to look like this:\n" + JSON.stringify(expectedResponse, null, 4).replace(/"\.\.\.":\s*"\.\.\."/g, ",,,").replace(/"\.\.\."/g, "..."));
      if (showSupportShortSyncResponseNote) {
        messages.push(this.supportShortSyncResponseNote);
      }
      messages.push(this.disableValidationNote);
    }
    return messages;
  }
  validateSyncResponse(response, request) {
    const messages = this.getSyncResponseWarnings(response, request);
    if (messages.length) {
      console.warn(this.crudSyncValidationWarningPrefix + "\n" + messages.join("\n"));
    }
  }
};

// ../Scheduler/lib/Scheduler/crud/AbstractCrudManagerMixin.js
var AbstractCrudManagerError = class extends Error {
};
var CrudManagerRequestError = class extends AbstractCrudManagerError {
  constructor(cfg = {}) {
    var _a, _b;
    super(cfg.message || cfg.request && StringHelper.capitalize((_a = cfg.request) == null ? void 0 : _a.type) + " failed" || "Crud Manager request failed");
    Object.assign(this, cfg);
    this.action = (_b = this.request) == null ? void 0 : _b.type;
  }
};
var storeSortFn = function(lhs, rhs, sortProperty) {
  if (lhs.store) {
    lhs = lhs.store;
  }
  if (rhs.store) {
    rhs = rhs.store;
  }
  lhs = lhs[sortProperty] || 0;
  rhs = rhs[sortProperty] || 0;
  return lhs < rhs ? -1 : lhs > rhs ? 1 : 0;
};
var storeLoadSortFn = function(lhs, rhs) {
  return storeSortFn(lhs, rhs, "loadPriority");
};
var storeSyncSortFn = function(lhs, rhs) {
  return storeSortFn(lhs, rhs, "syncPriority");
};
var AbstractCrudManagerMixin_default = (Target) => {
  var _a;
  Target.$$meta = Target.$meta;
  const mixins = [];
  if (!Target.isEvents) {
    mixins.push(Events_default);
  }
  if (!Target.isDelayable) {
    mixins.push(Delayable_default);
  }
  mixins.push(AbstractCrudManagerValidation_default);
  return _a = class extends (Target || Base).mixin(...mixins) {
    /**
     * Fires before server response gets applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @event beforeResponseApply
     * @param {Scheduler.crud.AbstractCrudManager} source The CRUD manager.
     * @param {'sync'|'load'} requestType The request type (`sync` or `load`).
     * @param {Object} response The decoded server response object.
     */
    /**
     * Fires before loaded data get applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @event beforeLoadApply
     * @param {Scheduler.crud.AbstractCrudManager} source The CRUD manager.
     * @param {Object} response The decoded server response object.
     * @param {Object} options Options provided to the {@link #function-load} method.
     */
    /**
     * Fires before sync response data get applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @event beforeSyncApply
     * @param {Scheduler.crud.AbstractCrudManager} source The CRUD manager.
     * @param {Object} response The decoded server response object.
     */
    static get $name() {
      return "AbstractCrudManagerMixin";
    }
    //region Default config
    static get defaultConfig() {
      return {
        /**
         * The server revision stamp.
         * The _revision stamp_ is a number which should be incremented after each server-side change.
         * This property reflects the current version of the data retrieved from the server and gets updated
         * after each {@link #function-load} and {@link #function-sync} call.
         * @property {Number}
         * @readonly
         * @category CRUD
         */
        crudRevision: null,
        /**
         * A list of registered stores whose server communication will be collected into a single batch.
         * Each store is represented by a _store descriptor_.
         * @member {CrudManagerStoreDescriptor[]} crudStores
         * @category CRUD
         */
        /**
         * Sets the list of stores controlled by the CRUD manager.
         *
         * When adding a store to the CrudManager, make sure the server response format is correct for `load`
         * and `sync` requests. Learn more in the
         * [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
         *
         * Store can be provided by itself, its storeId or as a _store descriptor_.
         * @config {Core.data.Store[]|String[]|CrudManagerStoreDescriptor[]}
         * @category CRUD
         */
        crudStores: [],
        /**
         * Name of a store property to retrieve store identifiers from. Make sure you have an instance of a
         * store to use it by id. Store identifier is used as a container name holding corresponding store data
         * while transferring them to/from the server. By default, `storeId` property is used. And in case a
         * container identifier has to differ this config can be used:
         *
         * ```javascript
         * class CatStore extends Store {
         *     static configurable = {
         *         // store id is "meow" but for sending/receiving store data
         *         // we want to have "cats" container in JSON, so we create a new property "storeIdForCrud"
         *         id             : 'meow',
         *         storeIdForCrud : 'cats'
         *     }
         * });
         *
         * // create an instance to use a store by id
         * new CatStore();
         *
         * class MyCrudManager extends CrudManager {
         *     ...
         *     crudStores           : ['meow'],
         *     // crud manager will get store identifier from "storeIdForCrud" property
         *     storeIdProperty  : 'storeIdForCrud'
         * });
         * ```
         * The `storeIdProperty` property can also be specified directly on a store:
         *
         * ```javascript
         * class CatStore extends Store {
         *     static configurable = {
         *         // storeId is "meow" but for sending/receiving store data
         *         // we want to have "cats" container in JSON
         *         id              : 'meow',
         *         // so we create a new property "storeIdForCrud"..
         *         storeIdForCrud  : 'cats',
         *         // and point CrudManager to use it as the store identifier source
         *         storeIdProperty  : 'storeIdForCrud'
         *     }
         * });
         *
         * class DogStore extends Store {
         *     static configurable = {
         *         // storeId is "dogs" and it will be used as a container name for the store data
         *         storeId : 'dogs',
         *         // id is set to get a store by identifier
         *         id      : 'dogs'
         *     }
         * });
         *
         * // create an instance to use a store by id
         * new CatStore();
         * new DogStore();
         *
         * class MyCrudManager extends CrudManager {
         *     ...
         *     crudStores : ['meow', 'dogs']
         * });
         * ```
         * @config {String}
         * @category CRUD
         */
        storeIdProperty: "storeId",
        crudFilterParam: "filter",
        /**
         * Sends request to the server.
         * @function sendRequest
         * @param {Object} request The request to send. An object having following properties:
         * @param {'load'|'sync'} request.type Request type, can be either `load` or `sync`
         * @param {String} request.data {@link #function-encode Encoded} request.
         * @param {Function} request.success Callback to be started on successful request transferring
         * @param {Function} request.failure Callback to be started on request transfer failure
         * @param {Object} request.thisObj `this` reference for the above `success` and `failure` callbacks
         * @returns {Promise} The request promise.
         * @abstract
         */
        /**
         * Cancels request to the server.
         * @function cancelRequest
         * @param {Promise} promise The request promise to cancel (a value returned by corresponding
         * {@link #function-sendRequest} call).
         * @param {Function} reject Reject handle of the corresponding promise
         * @abstract
         */
        /**
         * Encodes request to the server.
         * @function encode
         * @param {Object} request The request to encode.
         * @returns {String} The encoded request.
         * @abstract
         */
        /**
         * Decodes response from the server.
         * @function decode
         * @param {String} response The response to decode.
         * @returns {Object} The decoded response.
         * @abstract
         */
        transport: {},
        /**
         * When `true` forces the CRUD manager to process responses depending on their `type` attribute.
         * So `load` request may be responded with `sync` response for example.
         * Can be used for smart server logic allowing the server to decide when it's better to respond with a
         * complete data set (`load` response) or it's enough to return just a delta (`sync` response).
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        trackResponseType: false,
        /**
         * When `true` the Crud Manager does not require all updated and removed records to be mentioned in the
         * *sync* response. In this case response should include only server side changes.
         *
         * **Please note that added records should still be mentioned in response to provide real identifier
         * instead of the phantom one.**
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        supportShortSyncResponse: true,
        /**
         * Field name to be used to transfer a phantom record identifier.
         * @config {String}
         * @default
         * @category CRUD
         */
        phantomIdField: "$PhantomId",
        /**
         * Field name to be used to transfer a phantom parent record identifier.
         * @config {String}
         * @default
         * @category CRUD
         */
        phantomParentIdField: "$PhantomParentId",
        /**
         * Specify `true` to automatically call {@link #function-load} method on the next frame after creation.
         *
         * Called on the next frame to allow a Scheduler (or similar) linked to a standalone CrudManager to
         * register its stores before loading starts.
         *
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        autoLoad: false,
        /**
         * The timeout in milliseconds to wait before persisting changes to the server.
         * Used when {@link #config-autoSync} is set to `true`.
         * @config {Number}
         * @default
         * @category CRUD
         */
        autoSyncTimeout: 100,
        /**
         * `true` to automatically persist store changes after edits are made in any of the stores monitored.
         * Please note that sync request will not be invoked immediately but only after
         * {@link #config-autoSyncTimeout} interval.
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        autoSync: false,
        /**
         * `True` to reset identifiers (defined by `idField` config) of phantom records before submitting them
         * to the server.
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        resetIdsBeforeSync: true,
        /**
         * @member {CrudManagerStoreDescriptor[]} syncApplySequence
         * An array of stores presenting an alternative sync responses apply order.
         * Each store is represented by a _store descriptor_.
         * @category CRUD
         */
        /**
         * An array of store identifiers sets an alternative sync responses apply order.
         * By default, the order in which sync responses are applied to the stores is the same as they
         * registered in. But in case of some tricky dependencies between stores this order can be changed:
         *
         *```javascript
         * class MyCrudManager extends CrudManager {
         *     // register stores (will be loaded in this order: 'store1' then 'store2' and finally 'store3')
         *     crudStores : ['store1', 'store2', 'store3'],
         *     // but we apply changes from server to them in an opposite order
         *     syncApplySequence : ['store3', 'store2', 'store1']
         * });
         *```
         * @config {String[]}
         * @category CRUD
         */
        syncApplySequence: [],
        orderedCrudStores: [],
        /**
         * `true` to write all fields from the record to the server.
         * If set to `false` it will only send the fields that were modified.
         * Note that any fields that have {@link Core/data/field/DataField#config-persist} set to `false` will
         * still be ignored and fields having {@link Core/data/field/DataField#config-alwaysWrite} set to `true`
         * will always be included.
         * @config {Boolean}
         * @default
         * @category CRUD
         */
        writeAllFields: false,
        crudIgnoreUpdates: 0,
        autoSyncSuspendCounter: 0,
        // Flag that shows if crud manager performed successful load request
        crudLoaded: false,
        applyingLoadResponse: false,
        applyingSyncResponse: false,
        callOnFunctions: true
      };
    }
    get isCrudManager() {
      return true;
    }
    //endregion
    //region Init
    construct(config = {}) {
      this._requestId = 0;
      this.activeRequests = {};
      this.crudStoresIndex = {};
      super.construct(config);
    }
    afterConstruct() {
      super.afterConstruct();
      if (this.autoLoad) {
        this._autoLoadPromise = this.doAutoLoad();
      }
    }
    //endregion
    //region Configs
    get loadUrl() {
      var _a2, _b;
      return (_b = (_a2 = this.transport) == null ? void 0 : _a2.load) == null ? void 0 : _b.url;
    }
    updateLoadUrl(url) {
      ObjectHelper.setPath(this, "transport.load.url", url);
    }
    get syncUrl() {
      var _a2, _b;
      return (_b = (_a2 = this.transport) == null ? void 0 : _a2.sync) == null ? void 0 : _b.url;
    }
    updateSyncUrl(url) {
      ObjectHelper.setPath(this, "transport.sync.url", url);
    }
    //endregion
    //region Store descriptors & index
    /**
     * Returns a registered store descriptor.
     * @param {String|Core.data.Store} storeId The store identifier or registered store instance.
     * @returns {CrudManagerStoreDescriptor} The descriptor of the store.
     * @category CRUD
     */
    getStoreDescriptor(storeId) {
      if (!storeId)
        return null;
      if (storeId instanceof Store)
        return this.crudStores.find((storeDesc) => storeDesc.store === storeId);
      if (typeof storeId === "object")
        return this.crudStoresIndex[storeId.storeId];
      return this.crudStoresIndex[storeId] || this.getStoreDescriptor(Store.getStore(storeId));
    }
    fillStoreDescriptor(descriptor) {
      const { store } = descriptor, {
        storeIdProperty = this.storeIdProperty,
        modelClass
      } = store;
      if (!descriptor.storeId) {
        descriptor.storeId = store[storeIdProperty] || store.id;
      }
      if (!descriptor.idField) {
        descriptor.idField = modelClass.idField;
      }
      if (!descriptor.phantomIdField) {
        descriptor.phantomIdField = modelClass.phantomIdField;
      }
      if (!descriptor.phantomParentIdField) {
        descriptor.phantomParentIdField = modelClass.phantomParentIdField;
      }
      if (!("writeAllFields" in descriptor)) {
        descriptor.writeAllFields = store.writeAllFields;
      }
      return descriptor;
    }
    updateCrudStoreIndex() {
      const crudStoresIndex = this.crudStoresIndex = {};
      this.crudStores.forEach((store) => store.storeId && (crudStoresIndex[store.storeId] = store));
    }
    //endregion
    //region Store collection (add, remove, get & iterate)
    /**
     * Returns a registered store.
     * @param {String} storeId Store identifier.
     * @returns {Core.data.Store} Found store instance.
     * @category CRUD
     */
    getCrudStore(storeId) {
      const storeDescriptor = this.getStoreDescriptor(storeId);
      return storeDescriptor == null ? void 0 : storeDescriptor.store;
    }
    forEachCrudStore(fn2, thisObj = this) {
      if (!fn2) {
        throw new Error("Iterator function must be provided");
      }
      this.crudStores.every(
        (store) => fn2.call(thisObj, store.store, store.storeId, store) !== false
      );
    }
    set crudStores(stores) {
      this._crudStores = [];
      this.addCrudStore(stores);
      for (const store of this._crudStores) {
        store.loadPriority = store.syncPriority = 0;
      }
    }
    get crudStores() {
      return this._crudStores;
    }
    get orderedCrudStores() {
      return this._orderedCrudStores;
    }
    set orderedCrudStores(stores) {
      return this._orderedCrudStores = stores;
    }
    set syncApplySequence(stores) {
      this._syncApplySequence = [];
      this.addStoreToApplySequence(stores);
    }
    get syncApplySequence() {
      return this._syncApplySequence;
    }
    internalAddCrudStore(store) {
      const me = this;
      let storeInfo;
      if (store instanceof Store) {
        storeInfo = { store };
      } else if (typeof store === "object") {
        if (!store.store) {
          store = {
            storeId: store.id,
            store: new Store(store)
          };
        }
        storeInfo = store;
      } else {
        storeInfo = { store: Store.getStore(store) };
      }
      me.fillStoreDescriptor(storeInfo);
      store = storeInfo.store;
      if (store.setCrudManager) {
        store.setCrudManager(me);
      } else {
        store.crudManager = me;
      }
      store.pageSize = null;
      if (me.loadUrl || me.syncUrl) {
        store.autoCommit = false;
        store.autoLoad = false;
        if (store.createUrl || store.updateUrl || store.deleteUrl || store.readUrl) {
          console.warn("You have configured an URL on a Store that is handled by a CrudManager that is also configured with an URL. The Store URL's should be removed.");
        }
      }
      me.bindCrudStoreListeners(store);
      return storeInfo;
    }
    /**
     * Adds a store to the collection.
     *
     *```javascript
     * // append stores to the end of collection
     * crudManager.addCrudStore([
     *     store1,
     *     // storeId
     *     'bar',
     *     // store descriptor
     *     {
     *         storeId : 'foo',
     *         store   : store3
     *     },
     *     {
     *         storeId         : 'bar',
     *         store           : store4,
     *         // to write all fields of modified records
     *         writeAllFields  : true
     *     }
     * ]);
     *```
     *
     * **Note:** Order in which stores are kept in the collection is very essential sometimes.
     * Exactly in this order the loaded data will be put into each store.
     *
     * When adding a store to the CrudManager, make sure the server response format is correct for `load` and `sync`
     * requests. Learn more in the [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
     *
     * @param {Core.data.Store|String|CrudManagerStoreDescriptor|Core.data.Store[]|String[]|CrudManagerStoreDescriptor[]} store
     * A store or list of stores. Each store might be specified by its instance, `storeId` or _descriptor_.
     * @param {Number} [position] The relative position of the store. If `fromStore` is specified the position
     * will be taken relative to it. If not specified then store(s) will be appended to the end of collection.
     * Otherwise, it will be just a position in stores collection.
     *
     * ```javascript
     * // insert stores store4, store5 to the start of collection
     * crudManager.addCrudStore([ store4, store5 ], 0);
     * ```
     *
     * @param {String|Core.data.Store|CrudManagerStoreDescriptor} [fromStore] The store relative to which position
     * should be calculated. Can be defined as a store identifier, instance or descriptor (the result of
     * {@link #function-getStoreDescriptor} call).
     *
     * ```javascript
     * // insert store6 just before a store having storeId equal to 'foo'
     * crudManager.addCrudStore(store6, 0, 'foo');
     *
     * // insert store7 just after store3 store
     * crudManager.addCrudStore(store7, 1, store3);
     * ```
     * @category CRUD
     */
    addCrudStore(store, position, fromStore) {
      store = ArrayHelper.asArray(store);
      if (!(store == null ? void 0 : store.length)) {
        return;
      }
      const me = this, stores = store.map(me.internalAddCrudStore, me);
      if (typeof position === "undefined") {
        me.crudStores.push(...stores);
      } else {
        if (fromStore) {
          if (fromStore instanceof Store || typeof fromStore !== "object")
            fromStore = me.getStoreDescriptor(fromStore);
          position += me.crudStores.indexOf(fromStore);
        }
        me.crudStores.splice(position, 0, ...stores);
      }
      me.orderedCrudStores.push(...stores);
      me.updateCrudStoreIndex();
    }
    // Adds configured scheduler stores to the store collection ensuring correct order
    // unless they're already registered.
    addPrioritizedStore(store) {
      const me = this;
      if (!me.hasCrudStore(store)) {
        me.addCrudStore(store, ArrayHelper.findInsertionIndex(store, me.crudStores, storeLoadSortFn));
      }
      if (!me.hasApplySequenceStore(store)) {
        me.addStoreToApplySequence(store, ArrayHelper.findInsertionIndex(store, me.syncApplySequence, storeSyncSortFn));
      }
    }
    hasCrudStore(store) {
      var _a2;
      return (_a2 = this.crudStores) == null ? void 0 : _a2.some((s) => s === store || s.store === store || s.storeId === store);
    }
    /**
     * Removes a store from collection. If the store was registered in alternative sync sequence list
     * it will be removed from there as well.
     *
     * ```javascript
     * // remove store having storeId equal to "foo"
     * crudManager.removeCrudStore("foo");
     *
     * // remove store3
     * crudManager.removeCrudStore(store3);
     * ```
     *
     * @param {CrudManagerStoreDescriptor|String|Core.data.Store} store The store to remove. Either the store
     * descriptor, store identifier or store itself.
     * @category CRUD
     */
    removeCrudStore(store) {
      const me = this, stores = me.crudStores, foundStore = stores.find((s) => s === store || s.store === store || s.storeId === store);
      if (foundStore) {
        me.unbindCrudStoreListeners(foundStore.store);
        delete me.crudStoresIndex[foundStore.storeId];
        ArrayHelper.remove(stores, foundStore);
        if (me.syncApplySequence) {
          me.removeStoreFromApplySequence(store);
        }
      } else {
        throw new Error("Store not found in stores collection");
      }
    }
    //endregion
    //region Store listeners
    bindCrudStoreListeners(store) {
      store.ion({
        name: store.id,
        // When a tentatively added record gets confirmed as permanent, this signals a change
        addConfirmed: "onCrudStoreChange",
        change: "onCrudStoreChange",
        destroy: "onCrudStoreDestroy",
        thisObj: this
      });
    }
    unbindCrudStoreListeners(store) {
      this.detachListeners(store.id);
    }
    //endregion
    //region Apply sequence
    /**
     * Adds a store to the alternative sync responses apply sequence.
     * By default, the order in which sync responses are applied to the stores is the same as they registered in.
     * But this order can be changes either on construction step using {@link #config-syncApplySequence} option
     * or by calling this method.
     *
     * **Please note**, that if the sequence was not initialized before this method call then
     * you will have to do it yourself like this for example:
     *
     * ```javascript
     * // alternative sequence was not set for this crud manager
     * // so let's fill it with existing stores keeping the same order
     * crudManager.addStoreToApplySequence(crudManager.crudStores);
     *
     * // and now we can add our new store
     *
     * // we will load its data last
     * crudManager.addCrudStore(someNewStore);
     * // but changes to it will be applied first
     * crudManager.addStoreToApplySequence(someNewStore, 0);
     * ```
     * add registered stores to the sequence along with the store(s) you want to add
     *
     * @param {Core.data.Store|CrudManagerStoreDescriptor|Core.data.Store[]|CrudManagerStoreDescriptor[]} store The
     * store to add or its _descriptor_ (or array of stores or descriptors).
     * @param {Number} [position] The relative position of the store. If `fromStore` is specified the position
     * will be taken relative to it. If not specified then store(s) will be appended to the end of collection.
     * Otherwise, it will be just a position in stores collection.
     *
     * ```javascript
     * // insert stores store4, store5 to the start of sequence
     * crudManager.addStoreToApplySequence([ store4, store5 ], 0);
     * ```
     * @param {String|Core.data.Store|CrudManagerStoreDescriptor} [fromStore] The store relative to which position
     * should be calculated. Can be defined as a store identifier, instance or its descriptor (the result of
     * {@link #function-getStoreDescriptor} call).
     *
     * ```javascript
     * // insert store6 just before a store having storeId equal to 'foo'
     * crudManager.addStoreToApplySequence(store6, 0, 'foo');
     *
     * // insert store7 just after store3 store
     * crudManager.addStoreToApplySequence(store7, 1, store3);
     * ```
     * @category CRUD
     */
    addStoreToApplySequence(store, position, fromStore) {
      if (!store) {
        return;
      }
      store = ArrayHelper.asArray(store);
      const me = this, data = store.reduce((collection, store2) => {
        const s = me.getStoreDescriptor(store2);
        s && collection.push(s);
        return collection;
      }, []);
      if (typeof position === "undefined") {
        me.syncApplySequence.push(...data);
      } else {
        let pos = position;
        if (fromStore) {
          if (fromStore instanceof Store || typeof fromStore !== "object")
            fromStore = me.getStoreDescriptor(fromStore);
          pos += me.syncApplySequence.indexOf(fromStore);
        }
        me.syncApplySequence.splice(pos, 0, ...data);
      }
      const sequenceKeys = me.syncApplySequence.map(({ storeId }) => storeId);
      me.orderedCrudStores = [...me.syncApplySequence];
      me.crudStores.forEach((storeDesc) => {
        if (!sequenceKeys.includes(storeDesc.storeId)) {
          me.orderedCrudStores.push(storeDesc);
        }
      });
    }
    /**
     * Removes a store from the alternative sync sequence.
     *
     * ```javascript
     * // remove store having storeId equal to "foo"
     * crudManager.removeStoreFromApplySequence("foo");
     * ```
     *
     * @param {CrudManagerStoreDescriptor|String|Core.data.Store} store The store to remove. Either the store
     * descriptor, store identifier or store itself.
     * @category CRUD
     */
    removeStoreFromApplySequence(store) {
      const index = this.syncApplySequence.findIndex((s) => s === store || s.store === store || s.storeId === store);
      if (index > -1) {
        this.syncApplySequence.splice(index, 1);
        this.orderedCrudStores.splice(index, 1);
      }
    }
    hasApplySequenceStore(store) {
      return this.syncApplySequence.some((s) => s === store || s.store === store || s.storeId === store);
    }
    //endregion
    //region Events
    // Remove stores that are destroyed, to not try and apply response changes etc. to them
    onCrudStoreDestroy({ source: store }) {
      this.removeCrudStore(store);
    }
    onCrudStoreChange(event) {
      const me = this;
      if (me.crudIgnoreUpdates) {
        return;
      }
      if (me.crudStoreHasChanges(event == null ? void 0 : event.source)) {
        me.trigger("hasChanges");
        if (me.autoSync) {
          me.scheduleAutoSync();
        }
      } else {
        me.trigger("noChanges");
      }
    }
    /**
     * Suspends automatic sync upon store changes. Can be called multiple times (it uses an internal counter).
     * @category CRUD
     */
    suspendAutoSync() {
      this.autoSyncSuspendCounter++;
    }
    /**
     * Resumes automatic sync upon store changes. Will schedule a sync if the internal counter is 0.
     * @param {Boolean} [doSync=true] Pass `true` to schedule a sync after resuming (if there are pending
     * changes) and `false` to not persist the changes.
     * @category CRUD
     */
    resumeAutoSync(doSync = true) {
      const me = this;
      me.autoSyncSuspendCounter--;
      if (me.autoSyncSuspendCounter <= 0) {
        me.autoSyncSuspendCounter = 0;
        if (doSync && me.autoSync && me.crudStoreHasChanges()) {
          me.scheduleAutoSync();
        }
      }
    }
    get isAutoSyncSuspended() {
      return this.autoSyncSuspendCounter > 0;
    }
    scheduleAutoSync() {
      const me = this;
      if (!me.hasTimeout("autoSync") && !me.isAutoSyncSuspended) {
        me.setTimeout({
          name: "autoSync",
          fn: () => {
            me.sync().catch((error) => {
            });
          },
          delay: me.autoSyncTimeout
        });
      }
    }
    async triggerFailedRequestEvents(request, response, responseText, fetchOptions) {
      const { options, type: requestType } = request;
      this.trigger("requestFail", { requestType, response, responseText, responseOptions: fetchOptions });
      this.trigger(requestType + "Fail", { response, responseOptions: fetchOptions, responseText, options });
    }
    async internalOnResponse(request, responseText, fetchOptions) {
      const me = this, response = responseText ? me.decode(responseText) : null, { options, type: requestType } = request;
      if (responseText && !response) {
        console.error("Failed to parse response: " + responseText);
      }
      if (!response || (me.skipSuccessProperty ? response.success === false : !response.success)) {
        me.triggerFailedRequestEvents(request, response, responseText, fetchOptions);
      } else if (me.trigger("beforeResponseApply", { requestType, response }) !== false && me.trigger(`before${StringHelper.capitalize(requestType)}Apply`, { response, options }) !== false) {
        me.crudRevision = response.revision;
        await me.applyResponse(request, response, options);
        if (me.isDestroyed) {
          return;
        }
        me.trigger("requestDone", { requestType, response, responseOptions: fetchOptions });
        me.trigger(requestType, { response, responseOptions: fetchOptions, options });
        if (requestType === "load" || !me.crudStoreHasChanges()) {
          me.trigger("noChanges");
          if (requestType === "load") {
            me.emitCrudStoreEvents(request.pack.stores, "afterRequest");
          }
        }
      }
      return response;
    }
    //endregion
    //region Changes tracking
    /**
     * Suspends {@link #event-hasChanges} and {@link #event-noChanges} events.
     * @category CRUD
     */
    suspendChangeTracking() {
      this.crudIgnoreUpdates++;
    }
    /**
     * Resumes {@link #event-hasChanges} and {@link #event-noChanges} events. By default, it will check for changes
     * and if there are any, `hasChanges` or `noChanges` event will be triggered.
     * @param {Boolean} [skipChangeCheck]
     * @category CRUD
     */
    resumeChangeTracking(skipChangeCheck) {
      if (this.crudIgnoreUpdates && !--this.crudIgnoreUpdates && !skipChangeCheck) {
        this.onCrudStoreChange();
      }
    }
    /**
     * Returns `true` if changes tracking is suspended
     * @property {Boolean}
     * @readonly
     * @category CRUD
     */
    get isChangeTrackingSuspended() {
      return this.crudIgnoreUpdates > 0;
    }
    /**
     * Returns `true` if any of registered stores (or some particular store) has non persisted changes.
     *
     * ```javascript
     * // if we have any unsaved changes
     * if (crudManager.crudStoreHasChanges()) {
     *     // persist them
     *     crudManager.sync();
     * // otherwise
     * } else {
     *     alert("There are no unsaved changes...");
     * }
     * ```
     *
     * @param {String|Core.data.Store} [storeId] The store identifier or store instance to check changes for.
     * If not specified then will check changes for all of the registered stores.
     * @returns {Boolean} `true` if there are not persisted changes.
     * @category CRUD
     */
    crudStoreHasChanges(storeId) {
      return storeId ? this.isCrudStoreDirty(this.getCrudStore(storeId)) : this.crudStores.some((config) => this.isCrudStoreDirty(config.store));
    }
    isCrudStoreDirty(store) {
      return Boolean(store.changes);
    }
    //endregion
    //region Load
    doAutoLoad() {
      return this.load().catch((error) => {
      });
    }
    emitCrudStoreEvents(stores, eventName, eventParams) {
      const event = { action: "read" + eventName, ...eventParams };
      for (const store of this.crudStores) {
        if (stores.includes(store.storeId)) {
          store.store.trigger(eventName, event);
        }
      }
    }
    getLoadPackage(options) {
      const pack = {
        type: "load",
        requestId: this.requestId
      }, stores = this.crudStores, optionsCopy = Object.assign({}, options);
      delete optionsCopy.request;
      pack.stores = stores.map((store) => {
        var _a2;
        const opts = optionsCopy == null ? void 0 : optionsCopy[store.storeId], pageSize = store.pageSize || ((_a2 = store.store) == null ? void 0 : _a2.pageSize);
        if (opts || pageSize) {
          const params = Object.assign({
            storeId: store.storeId,
            page: 1
          }, opts);
          if (pageSize) {
            params.pageSize = pageSize;
          }
          store.currentPage = params.page;
          if (opts) {
            delete optionsCopy[store.storeId];
          }
          return params;
        }
        return store.storeId;
      });
      Object.assign(pack, optionsCopy);
      return pack;
    }
    loadCrudStore(store, data, options) {
      const rows = data == null ? void 0 : data.rows;
      if ((options == null ? void 0 : options.append) || (data == null ? void 0 : data.append)) {
        store.add(rows, false, { clean: true });
      } else {
        store.data = rows;
      }
      store.trigger("load", { data: rows });
    }
    loadDataToCrudStore(storeDesc, data, options) {
      const store = storeDesc.store, rows = data == null ? void 0 : data.rows;
      store.__loading = true;
      if (rows) {
        this.loadCrudStore(store, data, options, storeDesc);
      }
      store.__loading = false;
    }
    /**
     * Loads data to the Crud Manager
     * @param {Object} response A simple object representing the data.
     * The object structure matches the decoded `load` response structure:
     *
     * ```js
     * // load static data into crudManager
     * crudManager.loadCrudManagerData({
     *     success   : true,
     *     resources : {
     *         rows : [
     *             { id : 1, name : 'John' },
     *             { id : 2, name : 'Abby' }
     *         ]
     *     }
     * });
     * ```
     * @param {Object} [options] Extra data loading options.
     * @category CRUD
     */
    loadCrudManagerData(response, options = {}) {
      const me = this;
      me.trigger("beforeLoadCrudManagerData");
      me.suspendChangeTracking();
      me.crudStores.forEach((storeDesc) => {
        const storeId = storeDesc.storeId, data = response[storeId];
        if (data) {
          me.loadDataToCrudStore(storeDesc, data, options[storeId]);
        }
      });
      me.resumeChangeTracking(true);
      me.trigger("loadCrudManagerData");
    }
    /**
     * Returns true if the crud manager is currently loading data
     * @property {Boolean}
     * @readonly
     * @category CRUD
     */
    get isCrudManagerLoading() {
      return Boolean(this.activeRequests.load || this.applyingLoadResponse);
    }
    /**
     * Returns true if the crud manager is currently syncing data
     * @property {Boolean}
     * @readonly
     * @category CRUD
     */
    get isCrudManagerSyncing() {
      return Boolean(this.activeRequests.sync || this.applyingSyncResponse);
    }
    get isLoadingOrSyncing() {
      return Boolean(this.isCrudManagerLoading || this.isCrudManagerSyncing);
    }
    /**
     * Loads data to the stores registered in the crud manager. For example:
     *
     * ```javascript
     * crudManager.load(
     *     // here are request parameters
     *     {
     *         store1 : { append : true, page : 3, smth : 'foo' },
     *         store2 : { page : 2, bar : '!!!' }
     *     }
     * ).then(
     *     () => alert('OMG! It works!'),
     *     ({ response, cancelled }) => console.log(`Error: ${cancelled ? 'Cancelled' : response.message}`)
     * );
     * ```
     *
     * ** Note: ** If there is an incomplete load request in progress then system will try to cancel it by calling {@link #function-cancelRequest}.
     * @param {Object|String} [options] The request parameters or a URL.
     * @param {Object} [options.request] An object which contains options to merge
     * into the options which are passed to {@link Scheduler/crud/transport/AjaxTransport#function-sendRequest}.
     * ```javascript
     * {
     *     store1 : { page : 3, append : true, smth : 'foo' },
     *     store2 : { page : 2, bar : '!!!' },
     *     request : {
     *         params : {
     *             startDate : '2021-01-01'
     *         }
     *     }
     * },
     * ```
     *
     * Omitting request arg:
     * ```javascript
     * crudManager.load().then(
     *     () => alert('OMG! It works!'),
     *     ({ response, cancelled }) => console.log(`Error: ${cancelled ? 'Cancelled' : response.message}`)
     * );
     * ```
     *
     * When presented it should be an object where keys are store Ids and values are, in turn, objects
     * of parameters related to the corresponding store. These parameters will be transferred in each
     * store's entry in the `stores` property of the POST data.
     *
     * Additionally, for flat stores `append: true` can be specified to add loaded records to the existing records,
     * default is to remove corresponding store's existing records first.
     * **Please note** that for delta loading you can also use an {@link #config-trackResponseType alternative approach}.
     * @param {'sync'|'load'} [options.request.type] The request type. Either `load` or `sync`.
     * @param {String} [options.request.url] The URL for the request. Overrides the URL defined in the `transport`
     * object
     * @param {String} [options.request.data] The encoded _Crud Manager_ request data.
     * @param {Object} [options.request.params] An object specifying extra HTTP params to send with the request.
     * @param {Function} [options.request.success] A function to be started on successful request transferring.
     * @param {String} [options.request.success.rawResponse] `Response` object returned by the
     * [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
     * @param {Function} [options.request.failure] A function to be started on request transfer failure.
     * @param {String} [options.request.failure.rawResponse] `Response` object returned by the
     * [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
     * @param {Object} [options.request.thisObj] `this` reference for the above `success` and `failure` functions.
     * @returns {Promise} Promise, which is resolved if request was successful.
     * Both the resolve and reject functions are passed a `state` object. State object has following structure:
     *
     * ```
     * {
     *     cancelled       : Boolean, // **optional** flag, which is present when promise was rejected
     *     rawResponse     : String,  // raw response from ajax request, either response xml or text
     *     rawResponseText : String,  // raw response text as String from ajax request
     *     response        : Object,  // processed response in form of object
     *     options         : Object   // options, passed to load request
     * }
     * ```
     *
     * If promise was rejected by {@link #event-beforeLoad} event, `state` object will have the following structure:
     *
     * ```
     * {
     *     cancelled : true
     * }
     * ```
     * @category CRUD
     * @async
     */
    load(options) {
      if (typeof options === "string") {
        options = {
          request: {
            url: options
          }
        };
      }
      const me = this, pack = me.getLoadPackage(options);
      me._autoLoadPromise = null;
      return new Promise((resolve, reject) => {
        if (me.trigger("beforeLoad", { pack }) !== false) {
          const { load } = me.activeRequests;
          if (load) {
            me.cancelRequest(load.desc, load.reject);
            me.trigger("loadCanceled", { pack });
          }
          const request = Objects.assign({
            id: pack.requestId,
            data: me.encode(pack),
            type: "load",
            success: me.onCrudRequestSuccess,
            failure: me.onCrudRequestFailure,
            thisObj: me
          }, options == null ? void 0 : options.request);
          me.activeRequests.load = {
            type: "load",
            options,
            pack,
            resolve,
            reject(...args) {
              request.success = request.failure = null;
              reject(...args);
            },
            id: pack.requestId,
            desc: me.sendRequest(request)
          };
          me.emitCrudStoreEvents(pack.stores, "loadStart");
          me.trigger("loadStart", { pack });
        } else {
          me.trigger("loadCanceled", { pack });
          reject({ cancelled: true });
        }
      });
    }
    getActiveCrudManagerRequest(requestType) {
      let request = this.activeRequests[requestType];
      if (!request && this.trackResponseType) {
        request = Object.values(this.activeRequests)[0];
      }
      return request;
    }
    //endregion
    //region Changes (prepare, process, get)
    prepareAddedRecordData(record, storeInfo) {
      const me = this, { store } = storeInfo, { isTree } = store, phantomIdField = storeInfo.phantomIdField || me.phantomIdField, phantomParentIdField = storeInfo.phantomParentIdField || me.phantomParentIdField, subStoreFields = store.modelClass.allFields.filter((field) => field.subStore), cls = record.constructor, data = Object.assign(record.persistableData, {
        [phantomIdField]: record.id
      });
      if (isTree) {
        const { parent } = record;
        if (parent && !parent.isRoot && parent.isPhantom) {
          data[phantomParentIdField] = parent.id;
        }
      }
      if (me.resetIdsBeforeSync) {
        ObjectHelper.deletePath(data, cls.idField);
      }
      subStoreFields.forEach((field) => {
        const subStore = record.get(field.name);
        if (subStore.allCount) {
          data[field.dataSource] = {
            added: subStore.getRange().map((record2) => me.prepareAddedRecordData(record2, { store: subStore }))
          };
        }
      });
      return data;
    }
    prepareAdded(list, storeInfo) {
      return list.filter((record) => record.isValid).map((record) => this.prepareAddedRecordData(record, storeInfo));
    }
    prepareUpdated(list, storeInfo) {
      const { store } = storeInfo, { isTree } = store, writeAllFields = storeInfo.writeAllFields || storeInfo.writeAllFields !== false && this.writeAllFields, phantomParentIdField = storeInfo.phantomParentIdField || this.phantomParentIdField, subStoreFields = store.modelClass.allFields.filter((field) => field.subStore);
      if (storeInfo.store.tree) {
        const rootNode = storeInfo.store.rootNode;
        list = list.filter((record) => record !== rootNode);
      }
      return list.filter((record) => record.isValid).reduce((data, record) => {
        let recordData;
        if (writeAllFields) {
          recordData = record.persistableData;
        } else {
          recordData = record.modificationDataToWrite;
        }
        if (isTree) {
          const { parent } = record;
          if (parent && !parent.isRoot && parent.isPhantom) {
            recordData[phantomParentIdField] = parent.id;
          }
        }
        subStoreFields.forEach((field) => {
          const subStore = record.get(field.name);
          recordData[field.dataSource] = this.getCrudStoreChanges({ store: subStore });
        });
        if (!ObjectHelper.isEmpty(recordData)) {
          data.push(recordData);
        }
        return data;
      }, []);
    }
    prepareRemoved(list) {
      return list.map((record) => {
        const cls = record.constructor;
        return ObjectHelper.setPath({}, cls.idField, record.id);
      });
    }
    getCrudStoreChanges(storeDescriptor) {
      const { store } = storeDescriptor;
      let { added = [], modified: updated = [], removed = [] } = store.changes || {}, result;
      if (added.length)
        added = this.prepareAdded(added, storeDescriptor);
      if (updated.length)
        updated = this.prepareUpdated(updated, storeDescriptor);
      if (removed.length)
        removed = this.prepareRemoved(removed);
      if (added.length || updated.length || removed.length) {
        result = {};
        if (added.length)
          result.added = added;
        if (updated.length)
          result.updated = updated;
        if (removed.length)
          result.removed = removed;
      }
      return result;
    }
    getChangesetPackage() {
      const { changes } = this;
      return changes || this.forceSync ? {
        type: "sync",
        requestId: this.requestId,
        revision: this.crudRevision,
        ...changes
      } : null;
    }
    //endregion
    //region Apply
    /**
     * Returns current changes as an object consisting of added/modified/removed arrays of records for every
     * managed store, keyed by each store's `id`. Returns `null` if no changes exist. Format:
     *
     * ```javascript
     * {
     *     resources : {
     *         added    : [{ name : 'New guy' }],
     *         modified : [{ id : 2, name : 'Mike' }],
     *         removed  : [{ id : 3 }]
     *     },
     *     events : {
     *         modified : [{  id : 12, name : 'Cool task' }]
     *     },
     *     ...
     * }
     * ```
     *
     * @property {Object}
     * @readonly
     * @category CRUD
     */
    get changes() {
      const data = {};
      this.crudStores.forEach((store) => {
        const changes = this.getCrudStoreChanges(store);
        if (changes) {
          data[store.storeId] = changes;
        }
      });
      return Object.keys(data).length > 0 ? data : null;
    }
    getRowsToApplyChangesTo({ store, storeId }, storeResponse, storePack) {
      var _a2, _b;
      const me = this, { modelClass } = store, idDataSource = modelClass.idField, {
        updated: requestUpdated,
        removed: requestRemoved
      } = storePack || {};
      let rows, removed, remote;
      if (storeResponse) {
        remote = true;
        const respondedIds = {};
        rows = ((_a2 = storeResponse.rows) == null ? void 0 : _a2.slice()) || [];
        removed = ((_b = storeResponse.removed) == null ? void 0 : _b.slice()) || [];
        [...rows, ...removed].forEach((responseRecord) => {
          const id = ObjectHelper.getPath(responseRecord, idDataSource);
          respondedIds[id] = true;
        });
        if (me.supportShortSyncResponse) {
          requestUpdated == null ? void 0 : requestUpdated.forEach((data) => {
            const id = ObjectHelper.getPath(data, idDataSource);
            if (!respondedIds[id]) {
              rows.push({ [idDataSource]: id });
            }
          });
          requestRemoved == null ? void 0 : requestRemoved.forEach((data) => {
            const id = ObjectHelper.getPath(data, idDataSource);
            if (!respondedIds[id]) {
              removed.push({ [idDataSource]: id });
            }
          });
        }
      } else if (requestUpdated || requestRemoved) {
        remote = false;
        rows = requestUpdated;
        removed = requestRemoved;
      }
      rows = (rows == null ? void 0 : rows.length) ? rows : null;
      removed = (removed == null ? void 0 : removed.length) ? removed : null;
      return {
        rows,
        removed,
        remote
      };
    }
    applyChangesToStore(storeDesc, storeResponse, storePack) {
      var _a2;
      const me = this, phantomIdField = storeDesc.phantomIdField || me.phantomIdField, { store } = storeDesc, idField = store.modelClass.getFieldDataSource("id"), subStoreFields = store.modelClass.allFields.filter((field) => field.subStore), { rows, removed, remote } = me.getRowsToApplyChangesTo(storeDesc, storeResponse, storePack), added = [], updated = [];
      if (rows) {
        for (const data of rows) {
          if (store.getById((_a2 = data[phantomIdField]) != null ? _a2 : data[idField])) {
            updated.push(data);
          } else {
            added.push(data);
          }
        }
      }
      const extraLogEntries = [];
      if (updated.length && subStoreFields.length) {
        updated.forEach((updateData) => {
          var _a3, _b, _c;
          const record = store.getById((_a3 = updateData[phantomIdField]) != null ? _a3 : updateData[idField]), recordRequest = ((_b = storePack.added) == null ? void 0 : _b.find((t) => t[phantomIdField] == updateData[phantomIdField])) || ((_c = storePack.updated) == null ? void 0 : _c.find((t) => t[idField] == updateData[idField]));
          const extraLogInfo = {};
          subStoreFields.forEach((field) => {
            const store2 = record.get(field.name);
            me.applyChangesToStore(
              { store: store2 },
              updateData[field.dataSource],
              recordRequest == null ? void 0 : recordRequest[field.dataSource]
            );
            extraLogInfo[field.dataSource] = "foo";
            delete updateData[field.dataSource];
          });
          extraLogEntries.push([record, extraLogInfo]);
        });
      }
      const log = store.applyChangeset({ removed, added, updated }, null, phantomIdField, remote, true);
      extraLogEntries.forEach(([record, logEntry]) => Object.assign(log.get(record.id), logEntry));
      return log;
    }
    applySyncResponse(response, request) {
      var _a2;
      const me = this, stores = me.orderedCrudStores;
      me.applyingChangeset = me.applyingSyncResponse = true;
      me.suspendChangeTracking();
      for (const store of stores) {
        me.applyChangesToStore(store, response[store.storeId], (_a2 = request == null ? void 0 : request.pack) == null ? void 0 : _a2[store.storeId]);
      }
      me.resumeChangeTracking(true);
      me.applyingChangeset = me.applyingSyncResponse = false;
    }
    applyLoadResponse(response, options) {
      this.applyingLoadResponse = true;
      this.loadCrudManagerData(response, options);
      this.applyingLoadResponse = false;
    }
    async applyResponse(request, response, options) {
      const me = this, responseType = me.trackResponseType && response.type || request.type;
      switch (responseType) {
        case "load":
          if (me.validateResponse) {
            me.validateLoadResponse(response);
          }
          me.applyLoadResponse(response, options);
          break;
        case "sync":
          if (me.validateResponse) {
            me.validateSyncResponse(response, request);
          }
          me.applySyncResponse(response, request);
          break;
      }
    }
    /**
     * Applies a set of changes, as an object keyed by store id, to the affected stores. This function is intended
     * to use in apps that handle their own data syncing, it is not needed when using the CrudManager approach.
     *
     * Example of a changeset:
     * ```javascript
     * project.applyChangeset({
     *     events : {
     *         added : [
     *             { id : 10, name : 'Event 10', startDate : '2022-06-07' }
     *         ],
     *         updated : [
     *             { id : 5, name : 'Changed' }
     *         ],
     *         removed : [
     *             { id : 1 }
     *         ]
     *     },
     *     resources : { ... },
     *     ...
     * });
     * ```
     *
     * Optionally accepts a `transformFn` to convert an incoming changeset to the expected format.
     * See {@link Core/data/Store#function-applyChangeset} for more details.
     *
     * @param {Object} changes Changeset to apply, an object keyed by store id where each value follows the
     * format described in {@link Core/data/Store#function-applyChangeset}
     * @param {Function} [transformFn] Optional function used to preprocess a changeset per store in a different
     * format, should return an object with the format expected by {@link Core/data/Store#function-applyChangeset}
     * @param {String} [phantomIdField] Field used by the backend when communicating a record being assigned a
     * proper id instead of a phantom id
     */
    applyChangeset(changes, transformFn = null, phantomIdField, logChanges = false) {
      const me = this, log = logChanges ? /* @__PURE__ */ new Map() : void 0;
      me.suspendAutoSync();
      me.suspendChangeTracking();
      for (const { store, phantomIdField: phantomIdField2 } of me.orderedCrudStores) {
        if (changes[store.id]) {
          const storeLog = store.applyChangeset(
            changes[store.id],
            transformFn,
            phantomIdField2 || me.phantomIdField,
            // mark this changeset as remote to enforce it
            true,
            logChanges
          );
          if (storeLog) {
            log.set(store.id, storeLog);
          }
        }
      }
      me.resumeChangeTracking(true);
      me.resumeAutoSync(false);
      return log;
    }
    //endregion
    /**
     * Generates unique request identifier.
     * @internal
     * @template
     * @returns {Number} The request identifier.
     * @category CRUD
     */
    get requestId() {
      return Number.parseInt(`${Date.now()}${this._requestId++}`);
    }
    /**
     * Persists changes made on the registered stores to the server and/or receives changes made on the backend.
     * Usage:
     *
     * ```javascript
     * // persist and run a callback on request completion
     * crud.sync().then(
     *     () => console.log("Changes saved..."),
     *     ({ response, cancelled }) => console.log(`Error: ${cancelled ? 'Cancelled' : response.message}`)
     * );
     * ```
     *
     * ** Note: ** If there is an incomplete sync request in progress then system will queue the call and delay it
     * until previous request completion.
     * In this case {@link #event-syncDelayed} event will be fired.
     *
     * ** Note: ** Please take a look at {@link #config-autoSync} config. This option allows to persist changes
     * automatically after any data modification.
     *
     * ** Note: ** By default a sync request is only sent if there are any local {@link #property-changes}. To
     * always send a request when calling this function, configure {@link #config-forceSync} as `true`.
     *
     * @returns {Promise} Promise, which is resolved if request was successful.
     * Both the resolve and reject functions are passed a `state` object. State object has the following structure:
     * ```
     * {
     *     cancelled       : Boolean, // **optional** flag, which is present when promise was rejected
     *     rawResponse     : String,  // raw response from ajax request, either response xml or text
     *     rawResponseText : String,  // raw response text as String from ajax request
     *     response        : Object,  // processed response in form of object
     * }
     * ```
     * If promise was rejected by the {@link #event-beforeSync} event, `state` object will have this structure:
     * ```
     * {
     *     cancelled : true
     * }
     * ```
     * @category CRUD
     * @async
     */
    sync() {
      const me = this;
      me.clearTimeout("autoSync");
      if (me.activeRequests.sync) {
        me.trigger("syncDelayed");
        return me.activeSyncPromise = me.activeSyncPromise.finally(() => me.sync());
      }
      return me.activeSyncPromise = new Promise((resolve, reject) => {
        const pack = me.getChangesetPackage();
        if (!pack) {
          resolve(null);
          return;
        }
        if (me.trigger("beforeSync", { pack }) !== false) {
          me.trigger("syncStart", { pack });
          me.activeRequests.sync = {
            type: "sync",
            pack,
            resolve,
            reject,
            id: pack.requestId,
            desc: me.sendRequest({
              id: pack.requestId,
              data: me.encode(pack),
              type: "sync",
              success: me.onCrudRequestSuccess,
              failure: me.onCrudRequestFailure,
              thisObj: me
            })
          };
        } else {
          me.trigger("syncCanceled", { pack });
          reject({ cancelled: true });
        }
      }).catch((error) => {
        if (error && !error.cancelled) {
          throw error;
        }
        return error;
      });
    }
    async onCrudRequestSuccess(rawResponse, fetchOptions, request) {
      const me = this, {
        type: requestType,
        id: requestId
      } = request;
      if (me.isDestroyed)
        return;
      let responseText = "";
      request = me.activeRequests[requestType];
      try {
        responseText = await rawResponse.text();
      } catch (e) {
      }
      if (me.isDestroyed)
        return;
      if ((request == null ? void 0 : request.id) !== requestId) {
        throw new Error(`Interleaved ${requestType} operation detected`);
      }
      me.activeRequests[requestType] = null;
      const response = await me.internalOnResponse(request, responseText, fetchOptions);
      if (me.isDestroyed)
        return;
      if (!response || (me.skipSuccessProperty ? (response == null ? void 0 : response.success) === false : !(response == null ? void 0 : response.success))) {
        const error = {
          rawResponse,
          response,
          request
        };
        if (response == null ? void 0 : response.message) {
          error.message = response.message;
        }
        request.reject(new CrudManagerRequestError(error));
      }
      me["crud" + StringHelper.capitalize(request.type) + "ed"] = true;
      request.resolve({ response, rawResponse, responseText, request });
    }
    async onCrudRequestFailure(rawResponse, fetchOptions, request) {
      var _a2;
      const me = this;
      if (me.isDestroyed)
        return;
      request = me.activeRequests[request.type];
      const signal = (_a2 = fetchOptions == null ? void 0 : fetchOptions.abortController) == null ? void 0 : _a2.signal, wasAborted = Boolean(signal == null ? void 0 : signal.aborted);
      if (!wasAborted) {
        let response, responseText = "";
        try {
          responseText = await rawResponse.text();
          response = me.decode(responseText);
        } catch (e) {
        }
        if (me.isDestroyed)
          return;
        me.triggerFailedRequestEvents(request, response, responseText, fetchOptions);
        if (me.isDestroyed)
          return;
        request.reject(new CrudManagerRequestError({
          rawResponse,
          request
        }));
      }
      me.activeRequests[request.type] = null;
    }
    /**
     * Accepts all changes in all stores, resets the modification tracking:
     * * Clears change tracking for all records
     * * Clears added
     * * Clears modified
     * * Clears removed
     * Leaves the store in an "unmodified" state.
     * @category CRUD
     */
    acceptChanges() {
      this.crudStores.forEach((store) => store.store.acceptChanges());
    }
    /**
     * Reverts all changes in all stores and re-inserts any records that were removed locally. Any new uncommitted
     * records will be removed.
     * @category CRUD
     */
    revertChanges() {
      this.revertCrudStoreChanges();
    }
    revertCrudStoreChanges() {
      const { usesSingleAssignment } = this.eventStore;
      this.orderedCrudStores.forEach(({ store }) => (!store.isAssignmentStore || !usesSingleAssignment) && store.revertChanges());
    }
    /**
     * Removes all stores and cancels active requests.
     * @category CRUD
     * @internal
     */
    doDestroy() {
      const me = this, { load, sync } = me.activeRequests;
      load && me.cancelRequest(load.desc, load.reject);
      sync && me.cancelRequest(sync.desc, sync.reject);
      while (me.crudStores.length > 0) {
        me.removeCrudStore(me.crudStores[0]);
      }
      super.doDestroy && super.doDestroy();
    }
  }, __publicField(_a, "configurable", {
    /**
     * Convenience shortcut to set only the url to load from, when you do not need to supply any other config
     * options in the `load` section of the `transport` config.
     *
     * Using `loadUrl`:
     * ```javascript
     * {
     *     loadUrl : 'read.php
     * }
     * ```
     *
     * Equals the following `transport` config:
     * ```javascript
     * {
     *     transport : {
     *         load : {
     *             url : 'read.php'
     *         }
     *     }
     * }
     * ```
     *
     * When read at runtime, it will return the value from `transport.load.url`.
     *
     * @prp {String}
     */
    loadUrl: null,
    /**
     * Convenience shortcut to set only the url to sync to, when you do not need to supply any other config
     * options in the `sync` section of the `transport` config.
     *
     * Using `loadUrl`:
     * ```javascript
     * {
     *     syncUrl : 'sync.php
     * }
     * ```
     *
     * Equals the following `transport` config:
     * ```javascript
     * {
     *     transport : {
     *         load : {
     *             url : 'sync.php'
     *         }
     *     }
     * }
     * ```
     *
     * When read at runtime, it will return the value from `transport.sync.url`.
     *
     * @prp {String}
     */
    syncUrl: null,
    /**
     * Specify as `true` to force sync requests to be sent when calling `sync()`, even if there are no local
     * changes. Useful in a polling scenario, to keep client up to date with the backend.
     * @prp {Boolean}
     */
    forceSync: null
  }), __publicField(_a, "delayable", {
    // Postponed to next frame, to allow Scheduler created after CrudManager to inject its stores
    // (timeRanges, resourceTimeRanges)
    doAutoLoad: "raf"
  }), _a;
};

// ../Scheduler/lib/Scheduler/crud/transport/AjaxTransport.js
var AjaxTransport_default = (Target) => class AjaxTransport extends (Target || Base) {
  static get $name() {
    return "AjaxTransport";
  }
  /**
   * Configuration of the AJAX requests used by _Crud Manager_ to communicate with a server-side.
   *
   * ```javascript
   * transport : {
   *     load : {
   *         url       : 'http://mycool-server.com/load.php',
   *         // HTTP request parameter used to pass serialized "load"-requests
   *         paramName : 'data',
   *         // pass extra HTTP request parameter
   *         params    : {
   *             foo : 'bar'
   *         }
   *     },
   *     sync : {
   *         url     : 'http://mycool-server.com/sync.php',
   *         // specify Content-Type for requests
   *         headers : {
   *             'Content-Type' : 'application/json'
   *         }
   *     }
   * }
   *```
   * Since the class uses Fetch API you can use
   * any its [Request interface](https://developer.mozilla.org/en-US/docs/Web/API/Request) options:
   *
   * ```javascript
   * transport : {
   *     load : {
   *         url         : 'http://mycool-server.com/load.php',
   *         // HTTP request parameter used to pass serialized "load"-requests
   *         paramName   : 'data',
   *         // pass few Fetch API options
   *         method      : 'GET',
   *         credentials : 'include',
   *         cache       : 'no-cache'
   *     },
   *     sync : {
   *         url         : 'http://mycool-server.com/sync.php',
   *         // specify Content-Type for requests
   *         headers     : {
   *             'Content-Type' : 'application/json'
   *         },
   *         credentials : 'include'
   *     }
   * }
   *```
   *
   * An object where you can set the following possible properties:
   * @config {Object} transport
   * @property {Object} [transport.load] Load requests configuration:
   * @property {String} [transport.load.url] URL to request for data loading.
   * @property {String} [transport.load.method='GET'] HTTP method to be used for load requests.
   * @property {String} [transport.load.paramName='data'] Name of the parameter that will contain a serialized `load`
   * request. The value is mandatory for requests using `GET` method (default for `load`) so if the value is not
   * provided `data` string is used as default.
   * This value is optional for HTTP methods like `POST` and `PUT`, the request body will be used for data
   * transferring in these cases.
   * @property {Object} [transport.load.params] An object containing extra HTTP parameters to pass to the server when
   * sending a `load` request.
   *
   * ```javascript
   * transport : {
   *     load : {
   *         url       : 'http://mycool-server.com/load.php',
   *         // HTTP request parameter used to pass serialized "load"-requests
   *         paramName : 'data',
   *         // pass extra HTTP request parameter
   *         // so resulting URL will look like: http://mycool-server.com/load.php?userId=123456&data=...
   *         params    : {
   *             userId : '123456'
   *         }
   *     },
   *     ...
   * }
   * ```
   * @property {Object<String,String>} [transport.load.headers] An object containing headers to pass to each server request.
   *
   * ```javascript
   * transport : {
   *     load : {
   *         url       : 'http://mycool-server.com/load.php',
   *         // HTTP request parameter used to pass serialized "load"-requests
   *         paramName : 'data',
   *         // specify Content-Type for "load" requests
   *         headers   : {
   *             'Content-Type' : 'application/json'
   *         }
   *     },
   *     ...
   * }
   * ```
   * @property {Object} [transport.load.fetchOptions] **DEPRECATED:** Any Fetch API options can be simply defined on
   * the upper configuration level:
   * ```javascript
   * transport : {
   *     load : {
   *         url          : 'http://mycool-server.com/load.php',
   *         // HTTP request parameter used to pass serialized "load"-requests
   *         paramName    : 'data',
   *         // Fetch API options
   *         method       : 'GET',
   *         credentials  : 'include'
   *     },
   *     ...
   * }
   * ```
   * @property {Object} [transport.load.requestConfig] **DEPRECATED:** The config options can be defined on the upper
   * configuration level.
   * @property {Object} [transport.sync] Sync requests (`sync` in further text) configuration:
   * @property {String} [transport.sync.url] URL to request for `sync`.
   * @property {String} [transport.sync.method='POST'] HTTP request method to be used for `sync`.
   * @property {String} [transport.sync.paramName=undefined] Name of the parameter in which `sync` data will be
   * transferred. This value is optional for requests using methods like `POST` and `PUT`, the request body will be
   * used for data transferring in this case (default for `sync`). And the value is mandatory for requests using `GET`
   * method (if the value is not provided `data` string will be used as fallback).
   * @property {Object} [transport.sync.params] HTTP parameters to pass with an HTTP request handling `sync`.
   *
   * ```javascript
   * transport : {
   *     sync : {
   *         url    : 'http://mycool-server.com/sync.php',
   *         // extra HTTP request parameter
   *         params : {
   *             userId : '123456'
   *         }
   *     },
   *     ...
   * }
   * ```
   * @property {Object<String,String>} [transport.sync.headers] HTTP headers to pass with an HTTP request handling `sync`.
   *
   * ```javascript
   * transport : {
   *     sync : {
   *         url     : 'http://mycool-server.com/sync.php',
   *         // specify Content-Type for "sync" requests
   *         headers : {
   *             'Content-Type' : 'application/json'
   *         }
   *     },
   *     ...
   * }
   * ```
   * @property {Object} [transport.sync.fetchOptions] **DEPRECATED:** Any Fetch API options can be simply defined on
   * the upper configuration level:
   * ```javascript
   * transport : {
   *     sync : {
   *         url         : 'http://mycool-server.com/sync.php',
   *         credentials : 'include'
   *     },
   *     ...
   * }
   * ```
   * @property {Object} [transport.sync.requestConfig] **DEPRECATED:** The config options can be defined on the upper
   * configuration level.
   * @category CRUD
   */
  static get defaultMethod() {
    return {
      load: "GET",
      sync: "POST"
    };
  }
  /**
   * Cancels a sent request.
   * @param {Promise} requestPromise The Promise object wrapping the Request to be cancelled.
   * The _requestPromise_ is the value returned from the corresponding {@link #function-sendRequest} call.
   * @category CRUD
   */
  cancelRequest(requestPromise, reject) {
    var _a;
    (_a = requestPromise.abort) == null ? void 0 : _a.call(requestPromise);
    if (!this.isDestroying) {
      reject({ cancelled: true });
    }
  }
  shouldUseBodyForRequestData(packCfg, method, paramName) {
    return !(method === "HEAD" || method === "GET") && !paramName;
  }
  /**
   * Sends a _Crud Manager_ request to the server.
   * @param {Object} request The request configuration object having following properties:
   * @param {'load'|'sync'} request.type The request type. Either `load` or `sync`.
   * @param {String} request.url The URL for the request. Overrides the URL defined in the `transport` object
   * @param {String} request.data The encoded _Crud Manager_ request data.
   * @param {Object} request.params An object specifying extra HTTP params to send with the request.
   * @param {Function} request.success A function to be started on successful request transferring.
   * @param {String} request.success.rawResponse `Response` object returned by the [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   * @param {Function} request.failure A function to be started on request transfer failure.
   * @param {String} request.failure.rawResponse `Response` object returned by the [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   * @param {Object} request.thisObj `this` reference for the above `success` and `failure` functions.
   * @returns {Promise} The fetch Promise object.
   * @fires beforeSend
   * @async
   * @category CRUD
   */
  sendRequest(request) {
    const me = this, { data } = request, transportConfig = me.transport[request.type] || {}, requestConfig = Objects.assign({}, transportConfig, transportConfig.requestConfig);
    if (request.url) {
      requestConfig.url = request.url;
    }
    requestConfig.method = requestConfig.method || AjaxTransport.defaultMethod[request.type];
    requestConfig.params = Objects.assign(requestConfig.params || {}, request.params);
    let { paramName } = requestConfig;
    if (me.shouldUseBodyForRequestData(transportConfig, requestConfig.method, paramName)) {
      requestConfig.body = data;
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers["Content-Type"] = requestConfig.headers["Content-Type"] || "application/json";
    } else {
      paramName = paramName || "data";
      requestConfig.params[paramName] = data;
    }
    if (!requestConfig.url) {
      throw new Error("Trying to request without URL specified");
    }
    delete requestConfig.requestConfig;
    delete requestConfig.paramName;
    let ajaxPromise, resultPromise;
    function performSend() {
      requestConfig.queryParams = requestConfig.params;
      delete requestConfig.params;
      let cancelled = false;
      const fetchOptions = Objects.assign({}, requestConfig, requestConfig.fetchOptions);
      ajaxPromise = AjaxHelper.fetch(requestConfig.url, fetchOptions);
      return ajaxPromise.catch((error) => {
        var _a, _b;
        ajaxPromise.done = true;
        (_a = me.trigger) == null ? void 0 : _a.call(me, "responseReceived", { success: false });
        const signal = (_b = fetchOptions.abortController) == null ? void 0 : _b.signal;
        if (signal) {
          cancelled = signal.aborted;
          if (!cancelled) {
            console.warn(error);
          }
        }
        return { error, cancelled };
      }).then((response) => {
        var _a;
        ajaxPromise.done = true;
        (_a = me.trigger) == null ? void 0 : _a.call(me, "responseReceived", { success: Boolean(response == null ? void 0 : response.ok) });
        const callback = (response == null ? void 0 : response.ok) ? request.success : request.failure;
        return callback == null ? void 0 : callback.call(request.thisObj || me, response, fetchOptions, request);
      });
    }
    const beforeSendResult = me.trigger("beforeSend", {
      params: requestConfig.params,
      requestType: request.type,
      requestConfig,
      config: request
    });
    if (Objects.isPromise(beforeSendResult)) {
      resultPromise = beforeSendResult.then(performSend);
    } else {
      resultPromise = performSend();
    }
    resultPromise.abort = () => {
      var _a;
      if (!ajaxPromise.done) {
        (_a = ajaxPromise.abort) == null ? void 0 : _a.call(ajaxPromise);
      }
    };
    return resultPromise;
  }
};

// ../Scheduler/lib/Scheduler/crud/encoder/JsonEncoder.js
var JsonEncoder_default = (Target) => class JsonEncoder extends (Target || Base) {
  static get $name() {
    return "JsonEncoder";
  }
  static get defaultConfig() {
    return {
      /**
       * Configuration of the JSON encoder used by the _Crud Manager_.
       *
       * @config {Object}
       * @property {Object} encoder.requestData Static data to send with the data request.
       *
       * ```js
       * new CrudManager({
       *     // add static "foo" property to all requests data
       *     encoder : {
       *         requestData : {
       *             foo : 'Bar'
       *         }
       *     },
       *     ...
       * });
       * ```
       *
       * The above snippet will result adding "foo" property to all requests data:
       *
       * ```json
       *     {
       *         "requestId"   : 756,
       *         "type"        : "load",
       *
       *         "foo"         : "Bar",
       *
       *         "stores"      : [
       *             ...
       * ```
       * @category CRUD
       */
      encoder: {}
    };
  }
  /**
   * Encodes a request object to _JSON_ encoded string. If encoding fails (due to circular structure), it returns null.
   * Supposed to be overridden in case data provided by the _Crud Manager_ has to be transformed into format requested by server.
   * @param {Object} requestData The request to encode.
   * @returns {String} The encoded request.
   * @category CRUD
   */
  encode(requestData) {
    var _a;
    requestData = Object.assign({}, (_a = this.encoder) == null ? void 0 : _a.requestData, requestData);
    return StringHelper.safeJsonStringify(requestData);
  }
  /**
   * Decodes (parses) a _JSON_ response string to an object. If parsing fails, it returns null.
   * Supposed to be overridden in case data provided by server has to be transformed into format requested by the _Crud Manager_.
   * @param {String} responseText The response text to decode.
   * @returns {Object} The decoded response.
   * @category CRUD
   */
  decode(responseText) {
    return StringHelper.safeJsonParse(responseText);
  }
};

// ../Scheduler/lib/Scheduler/data/mixin/ProjectCrudManager.js
var ProjectCrudManager_default = (Target) => class ProjectCrudManager extends (Target || Base).mixin(AbstractCrudManagerMixin_default, AjaxTransport_default, JsonEncoder_default) {
  //region Config
  static get defaultConfig() {
    return {
      project: null
    };
  }
  startConfigure(config) {
    this.getConfig("project");
    super.startConfigure(config);
    this._changesToClear = /* @__PURE__ */ new Map();
  }
  async doAutoLoad() {
    const { project } = this;
    if (project) {
      await project.commitAsync();
    }
    return super.doAutoLoad();
  }
  applyProjectResponse(response) {
    const me = this, { project } = me;
    me.applyingProjectResponse = true;
    const startDateField = project.fieldMap.startDate, endDateField = project.fieldMap.endDate, startDate = ObjectHelper.getPath(response, startDateField.dataSource), endDate = ObjectHelper.getPath(response, endDateField.dataSource);
    if (typeof startDate === "string") {
      ObjectHelper.setPath(response, startDateField.dataSource, startDateField.convert(startDate));
    }
    if (typeof endDate === "string") {
      ObjectHelper.setPath(response, endDateField.dataSource, endDateField.convert(endDate));
    }
    project.setByDataSource(response);
    me._changesToClear.set(me, response);
    me.applyingProjectResponse = false;
  }
  loadCrudManagerData(response, options = {}) {
    const me = this, { project } = me;
    me.suspendChangeTracking();
    super.loadCrudManagerData(...arguments);
    if (response == null ? void 0 : response.project) {
      if (project.delayEnteringReplica && project.hasDataInStores) {
        project.ion({
          recordsUnlinked: () => {
            me.suspendChangeTracking();
            me.applyProjectResponse(response.project);
            me.resumeChangeTracking();
          },
          once: true
        });
      } else {
        me.applyProjectResponse(response.project);
      }
    }
    me.resumeChangeTracking();
  }
  async sync() {
    const { project } = this;
    this.suspendAutoSync();
    if (project) {
      await project.commitAsync();
    }
    if (this.isDestroying) {
      return;
    }
    this.resumeAutoSync(false);
    return super.sync();
  }
  async applyResponse(request, response, options) {
    var _a, _b, _c, _d, _e, _f;
    const me = this;
    if (me.isDestroyed || ((_a = me.project) == null ? void 0 : _a.isDestroyed)) {
      return;
    }
    me.trigger("beforeApplyResponse");
    await super.applyResponse(request, response, options);
    if ((response == null ? void 0 : response.project) || me.supportShortSyncResponse && ((_b = request == null ? void 0 : request.pack) == null ? void 0 : _b.project)) {
      me.applyProjectResponse(response.project || ((_c = request == null ? void 0 : request.pack) == null ? void 0 : _c.project));
    }
    if (me.project) {
      let requestType = request.type;
      if (me.trackResponseType) {
        requestType = response.type || requestType;
      }
      const propagationFlag = `propagating${StringHelper.capitalize(requestType)}Changes`;
      me.suspendAutoSync();
      me[propagationFlag] = true;
      const loud = me.project.isInitialCommit && !me.project.silenceInitialCommit;
      await me.project.commitAsync();
      me[propagationFlag] = false;
      (_d = me.resumeAutoSync) == null ? void 0 : _d.call(me, loud);
      (_e = me.commitRespondedChanges) == null ? void 0 : _e.call(me);
    }
    (_f = me.trigger) == null ? void 0 : _f.call(me, "applyResponse");
  }
  applySyncResponse(...args) {
    var _a;
    const me = this, stmDisabled = (_a = me.project) == null ? void 0 : _a.stm.disabled;
    if (stmDisabled === false && me.ignoreRemoteChangesInSTM) {
      me.project.stm.disable();
    }
    super.applySyncResponse(...args);
    if (stmDisabled === false) {
      me.project.stm.enable();
    }
  }
  shouldClearRecordFieldChange(record, field, value) {
    const oldValue = record.getValue(field);
    field = record.getFieldDefinition(field);
    return (field == null ? void 0 : field.isEqual) ? field.isEqual(oldValue, value) : ObjectHelper.isEqual(oldValue, value);
  }
  commitRespondedChanges() {
    this._changesToClear.forEach((changes, record) => {
      Object.entries(changes).forEach(([key, value]) => {
        if (this.shouldClearRecordFieldChange(record, key, value)) {
          delete record.meta.modified[key];
        }
      });
    });
    this._changesToClear.clear();
  }
  applyChangesToStore(storeDesc, storeResponse, storePack, ...rest) {
    const changesMap = super.applyChangesToStore(storeDesc, storeResponse, storePack, ...rest);
    if (changesMap.size && this.project) {
      for (const [id, changes] of changesMap) {
        const record = storeDesc.store.getById(id);
        record && this._changesToClear.set(record, changes);
      }
    }
    return changesMap;
  }
};

// ../Scheduler/lib/Scheduler/crud/AbstractCrudManager.js
var AbstractCrudManager = class extends Base.mixin(AbstractCrudManagerMixin_default) {
  //region Default config
  /**
   * The server revision stamp.
   * The _revision stamp_ is a number which should be incremented after each server-side change.
   * This property reflects the current version of the data retrieved from the server and gets updated after each
   * {@link Scheduler/crud/AbstractCrudManagerMixin#function-load} and {@link Scheduler/crud/AbstractCrudManagerMixin#function-sync} call.
   * @property {Number}
   * @readonly
   */
  get revision() {
    return this.crudRevision;
  }
  set revision(value) {
    this.crudRevision = value;
  }
  /**
   * Get or set data of {@link #property-crudStores} as a JSON string.
   *
   * Get a JSON string:
   * ```javascript
   *
   * const jsonString = scheduler.crudManager.json;
   *
   * // returned jsonString:
   * '{"eventsData":[...],"resourcesData":[...],...}'
   *
   * // object representation of the returned jsonString:
   * {
   *     resourcesData    : [...],
   *     eventsData       : [...],
   *     assignmentsData  : [...],
   *     dependenciesData : [...],
   *     timeRangesData   : [...],
   *     // data from other stores
   * }
   * ```
   *
   * Set a JSON string (to populate the CrudManager stores):
   *
   * ```javascript
   * scheduler.crudManager.json = '{"eventsData":[...],"resourcesData":[...],...}'
   * ```
   *
   * @property {String}
   */
  get json() {
    return StringHelper.safeJsonStringify(this);
  }
  set json(json) {
    if (typeof json === "string") {
      json = StringHelper.safeJsonParse(json);
    }
    this.forEachCrudStore((store) => {
      const dataName = `${store.storeId}Data`;
      if (json[dataName]) {
        store.data = json[dataName];
      }
    });
  }
  static get defaultConfig() {
    return {
      /**
       * Sets the list of stores controlled by the CRUD manager.
       *
       * When adding a store to the CrudManager, make sure the server response format is correct for `load` and `sync` requests.
       * Learn more in the [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
       *
       * Store can be provided as in instance, using its `storeId` or as an {@link #typedef-CrudManagerStoreDescriptor}
       * object.
       * @config {Core.data.Store[]|String[]|CrudManagerStoreDescriptor[]}
       */
      stores: null
      /**
       * Encodes request to the server.
       * @function encode
       * @param {Object} request The request to encode.
       * @returns {String} The encoded request.
       * @abstract
       */
      /**
       * Decodes response from the server.
       * @function decode
       * @param {String} response The response to decode.
       * @returns {Object} The decoded response.
       * @abstract
       */
    };
  }
  //endregion
  //region Init
  construct(config = {}) {
    if (config.stores) {
      config.crudStores = config.stores;
      delete config.stores;
    }
    super.construct(config);
  }
  //endregion
  //region inline data
  /**
   * Returns the data from all CrudManager `crudStores` in a format that can be consumed by `inlineData`.
   *
   * Used by JSON.stringify to correctly convert this CrudManager to json.
   *
   * The returned data is identical to what {@link Scheduler/crud/AbstractCrudManager#property-inlineData} contains.
   *
   * ```javascript
   *
   * const json = scheduler.crudManager.toJSON();
   *
   * // json:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...],
   *     timeRangesData : [...],
   *     resourceTimeRangesData : [...],
   *     // ... other stores data
   * }
   * ```
   *
   * Output can be consumed by `inlineData`.
   *
   * ```javascript
   * const json = scheduler.crudManager.toJSON();
   *
   * // Plug it back in later
   * scheduler.crudManager.inlineData = json;
   * ```
   *
   * @function toJSON
   * @returns {Object}
   * @category JSON
   */
  toJSON() {
    const result = {};
    this.forEachCrudStore((store, storeId) => result[`${storeId}Data`] = store.toJSON());
    return result;
  }
  /**
   * Get or set data of CrudManager stores. The returned data is identical to what
   * {@link Scheduler/crud/AbstractCrudManager#function-toJSON} returns:
   *
   * ```javascript
   *
   * const data = scheduler.crudManager.inlineData;
   *
   * // data:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...],
   *     timeRangesData : [...],
   *     resourceTimeRangesData : [...],
   *     ... other stores data
   * }
   *
   *
   * // Plug it back in later
   * scheduler.crudManager.inlineData = data;
   * ```
   *
   * @property {Object}
   */
  get inlineData() {
    return this.toJSON();
  }
  set inlineData(data) {
    this.json = data;
  }
  //endregion
  //region Store collection (add, remove, get & iterate)
  set stores(stores) {
    if (stores !== this.crudStores) {
      this.crudStores = stores;
    }
  }
  /**
   * A list of registered stores whose server communication will be collected into a single batch.
   * Each store is represented by a _store descriptor_.
   * @member {CrudManagerStoreDescriptor[]} stores
   */
  get stores() {
    return this.crudStores;
  }
  //endregion
  /**
   * Returns true if the crud manager is currently loading data
   * @property {Boolean}
   * @readonly
   * @category CRUD
   */
  get isLoading() {
    return this.isCrudManagerLoading;
  }
  /**
   * Adds a store to the collection.
   *
   *```javascript
   * // append stores to the end of collection
   * crudManager.addStore([
   *     store1,
   *     // storeId
   *     'bar',
   *     // store descriptor
   *     {
   *         storeId : 'foo',
   *         store   : store3
   *     },
   *     {
   *         storeId         : 'bar',
   *         store           : store4,
   *         // to write all fields of modified records
   *         writeAllFields  : true
   *     }
   * ]);
   *```
   *
   * **Note:** Order in which stores are kept in the collection is very essential sometimes.
   * Exactly in this order the loaded data will be put into each store.
   *
   * When adding a store to the CrudManager, make sure the server response format is correct for `load` and `sync`
   * requests. Learn more in the [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
   *
   * @param {Core.data.Store|String|CrudManagerStoreDescriptor|Core.data.Store[]|String[]|CrudManagerStoreDescriptor[]} store
   * A store or list of stores. Each store might be specified by its instance, `storeId` or _descriptor_.
   * @param {Number} [position] The relative position of the store. If `fromStore` is specified the position will be
   * taken relative to it.
   * If not specified then store(s) will be appended to the end of collection.
   * Otherwise, it will be an index in stores collection.
   *
   * ```javascript
   * // insert stores store4, store5 to the start of collection
   * crudManager.addStore([ store4, store5 ], 0);
   * ```
   *
   * @param {String|Core.data.Store|CrudManagerStoreDescriptor} [fromStore] The store relative to which position
   * should be calculated. Can be defined as a store identifier, instance or descriptor (the result of
   * {@link Scheduler/crud/AbstractCrudManagerMixin#function-getStoreDescriptor} call).
   *
   * ```javascript
   * // insert store6 just before a store having storeId equal to 'foo'
   * crudManager.addStore(store6, 0, 'foo');
   *
   * // insert store7 just after store3 store
   * crudManager.addStore(store7, 1, store3);
   * ```
   */
  addStore(...args) {
    return this.addCrudStore(...args);
  }
  removeStore(...args) {
    return this.removeCrudStore(...args);
  }
  getStore(...args) {
    return this.getCrudStore(...args);
  }
  hasChanges(...args) {
    return this.crudStoreHasChanges(...args);
  }
  loadData(...args) {
    return this.loadCrudManagerData(...args);
  }
};
AbstractCrudManager._$name = "AbstractCrudManager";

// ../Scheduler/lib/Scheduler/model/mixin/ProjectModelCommon.js
var ProjectModelCommon_default = (Target) => {
  var _a;
  return _a = class extends (Target || Model) {
    static get configurable() {
      return {
        // Documented in Gantt/Scheduler/SchedulerPro version of ./model/ProjectModel since types differ
        assignments: null,
        dependencies: null,
        resources: null,
        timeRanges: null
      };
    }
    // Project is a Model which triggers events, therefore it can define event handlers using `onEvent` syntax. Event
    // handler can be a string (for another instance property), or a function. Therefore, it is impossible to tell them
    // apart and project model can not expose fields.
    // https://github.com/bryntum/support/issues/7457
    static get autoExposeFields() {
      return false;
    }
    //region Inline data
    get assignments() {
      return this.assignmentStore.allRecords;
    }
    updateAssignments(assignments) {
      this.assignmentStore.data = assignments;
    }
    get dependencies() {
      return this.dependencyStore.allRecords;
    }
    updateDependencies(dependencies) {
      this.dependencyStore.data = dependencies;
    }
    get resources() {
      return this.resourceStore.allRecords;
    }
    updateResources(resources) {
      this.resourceStore.data = resources;
    }
    get timeRanges() {
      return this.timeRangeStore.allRecords;
    }
    getTimeRanges(startDate, endDate) {
      const store = this.timeRangeStore, ret = [];
      for (const timeSpan of store) {
        if (timeSpan.isRecurring) {
          ret.push(...timeSpan.getOccurrencesForDateRange(startDate, endDate));
        } else if (timeSpan.startDate < endDate && startDate < timeSpan.endDate) {
          ret.push(timeSpan);
        }
      }
      return ret;
    }
    updateTimeRanges(timeRanges) {
      this.timeRangeStore.data = timeRanges;
    }
    getResourceTimeRanges(startDate, endDate) {
      const store = this.resourceTimeRangeStore, ret = [];
      for (const timeSpan of store) {
        if (timeSpan.isRecurring) {
          ret.push(...timeSpan.getOccurrencesForDateRange(startDate, endDate));
        } else if (timeSpan.startDate < endDate && (!timeSpan.endDate || startDate < timeSpan.endDate)) {
          ret.push(timeSpan);
        }
      }
      return ret;
    }
    //endregion
  }, __publicField(_a, "$name", "ProjectModelCommon"), _a;
};

// ../Scheduler/lib/Scheduler/model/ResourceTimeRangeModel.js
var ResourceTimeRangeModel = class extends TimeSpan.mixin(RecurringTimeSpan_default) {
  get domId() {
    return `${this.constructor.domIdPrefix}-${this.id}`;
  }
  //endregion
  // Used internally to differentiate between Event and ResourceTimeRange
  get isResourceTimeRange() {
    return true;
  }
  // To match EventModel API
  get resources() {
    return this.resource ? [this.resource] : [];
  }
  // To match EventModel API
  get $linkedResources() {
    return this.resources;
  }
};
__publicField(ResourceTimeRangeModel, "$name", "ResourceTimeRangeModel");
//region Fields
__publicField(ResourceTimeRangeModel, "fields", [
  /**
   * Id of the resource this time range is associated with
   * @field {String|Number} resourceId
   */
  "resourceId",
  /**
   * Controls this time range's primary color, defaults to using current themes default time range color.
   * @field {String} timeRangeColor
   */
  "timeRangeColor"
]);
__publicField(ResourceTimeRangeModel, "relations", {
  /**
   * The associated resource, retrieved using a relation to a ResourceStore determined by the value assigned
   * to `resourceId`. The relation also lets you access all time ranges on a resource through
   * `ResourceModel#timeRanges`.
   * @member {Scheduler.model.ResourceModel} resource
   */
  resource: {
    foreignKey: "resourceId",
    foreignStore: "resourceStore",
    relatedCollectionName: "timeRanges",
    nullFieldOnRemove: true
  }
});
__publicField(ResourceTimeRangeModel, "domIdPrefix", "resourcetimerange");
ResourceTimeRangeModel._$name = "ResourceTimeRangeModel";

// ../Scheduler/lib/Scheduler/data/ResourceTimeRangeStore.js
var ResourceTimeRangeStore = class extends AjaxStore.mixin(RecurringTimeSpansMixin_default) {
  static get defaultConfig() {
    return {
      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 500,
      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 500,
      /**
       * This store should be linked to a ResourceStore to link the time ranges to resources
       * @config {Scheduler.data.ResourceStore}
       */
      resourceStore: null,
      modelClass: ResourceTimeRangeModel,
      storeId: "resourceTimeRanges"
    };
  }
  set resourceStore(store) {
    this._resourceStore = store;
    if (!this.isConfiguring) {
      this.initRelations(true);
    }
  }
  get resourceStore() {
    return this._resourceStore;
  }
  // Matching signature in EventStore to allow reusage of SchedulerStores#onInternalEventStoreChange()
  getResourcesForEvent(resourceTimeRange) {
    return [resourceTimeRange.resource];
  }
  /**
   * Get resource time ranges intersecting the specified date range for a resource.
   *
   * The result is sorted by `startDate`.
   *
   * @param {Object} options Options
   * @param {Scheduler.model.ResourceModel} options.resourceRecord Resource record
   * @param {Date} options.startDate Start date of the range
   * @param {Date} options.endDate End date of the range
   * @returns {Scheduler.model.ResourceTimeRangeModel[]}
   */
  getRanges({ resourceRecord, startDate, endDate }) {
    const rangesInDateRange = resourceRecord.timeRanges.flatMap((range) => {
      if (range.supportsRecurring) {
        return range.getOccurrencesForDateRange(startDate, endDate);
      }
      if (range.intersectsRange(startDate, endDate)) {
        return range;
      }
      return [];
    });
    return rangesInDateRange.sort((span1, span2) => span1.startDate - span2.startDate);
  }
};
__publicField(ResourceTimeRangeStore, "$name", "ResourceTimeRangeStore");
ResourceTimeRangeStore._$name = "ResourceTimeRangeStore";

// ../Scheduler/lib/Scheduler/data/plugin/StoreTimeZonePlugin.js
var StoreTimeZonePlugin = class extends InstancePlugin {
  get timeZone() {
    return this.client.project.timeZone;
  }
  // Overrides a Store's processRecord function to be able to convert records added by a dataset
  // before they are processed by the engine
  processRecord(record, isDataSet) {
    if (isDataSet || this.client.isLoadingData || record.timeZone !== void 0) {
      this.convertRecordToTimeZone(record);
    }
  }
  convertRecordToTimeZone(record, timeZone = this.timeZone) {
    var _a, _b;
    if (record.timeZone !== timeZone) {
      record.$ignoreChange = true;
      if ((_a = record.baselines) == null ? void 0 : _a.count) {
        for (const bl of record.baselines) {
          if (record.timeZone !== bl.timeZone) {
            bl.timeZone = record.timeZone;
          }
          bl.convertToTimeZone(timeZone);
        }
      }
      if ((_b = record.occurrences) == null ? void 0 : _b.length) {
        for (const o of record.occurrences) {
          if (record.timeZone !== o.timeZone) {
            o.timeZone = record.timeZone;
          }
          o.convertToTimeZone(timeZone);
        }
      }
      record.convertToTimeZone(timeZone);
      record.$ignoreChange = false;
    }
  }
  beforeSyncRecord({ record }) {
    if (record.timeZone != null) {
      record.$restoreTimeZone = record.timeZone;
      record.convertToTimeZone();
    }
  }
  afterSyncRecord({ record }) {
    if (record.$restoreTimeZone) {
      record.convertToTimeZone(record.$restoreTimeZone);
      record.$restoreTimeZone = null;
    }
  }
};
__publicField(StoreTimeZonePlugin, "$name", "storeTimeZonePlugin");
__publicField(StoreTimeZonePlugin, "pluginConfig", {
  before: ["processRecord"],
  assign: ["beforeSyncRecord", "afterSyncRecord"]
});
StoreTimeZonePlugin._$name = "StoreTimeZonePlugin";

// ../Scheduler/lib/Scheduler/model/mixin/ProjectModelTimeZoneMixin.js
var ProjectModelTimeZoneMixin_default = (Target) => {
  var _a;
  return _a = class extends (Target || Model) {
    get _storesWithDates() {
      return [this.taskStore, this.timeRangeStore, this.resourceTimeRangeStore].filter((s) => s);
    }
    plugStore(store) {
      if (!store.hasPlugin(StoreTimeZonePlugin)) {
        store.addPlugins(StoreTimeZonePlugin);
      }
    }
    unplugStore(store) {
      var _a2;
      (_a2 = store.plugins.storeTimeZonePlugin) == null ? void 0 : _a2.destroy();
    }
    attachStore(store) {
      super.attachStore(store);
      if (store && this.timeZone != null && this._storesWithDates.includes(store)) {
        this.plugStore(store);
        this.convertStoresToTimeZone([store]);
      }
    }
    detachStore(store) {
      super.detachStore(store);
      if (store && !store.isDestroyed && this.timeZone != null) {
        this.convertStoresToTimeZone([store], null);
        this.unplugStore(store);
      }
    }
    relayStoreChange({ source, action, records, replaced }) {
      const me = this;
      if (me.timeZone != null && me._storesWithDates.includes(source)) {
        if (["add", "replace"].includes(action)) {
          if (!(records == null ? void 0 : records.length) && (replaced == null ? void 0 : replaced.length)) {
            records = replaced;
          }
          if (records.length) {
            records.forEach((record) => record.timeZone = me.timeZone);
          }
        }
      }
    }
    convertStoresToTimeZone(stores, timeZone = this.timeZone) {
      var _a2;
      const me = this, stmAutoRecord = (_a2 = me.stm) == null ? void 0 : _a2.autoRecord;
      if (stmAutoRecord) {
        me.stm.autoRecord = false;
      }
      for (const store of stores) {
        store == null ? void 0 : store.forEach((r) => store.plugins.storeTimeZonePlugin.convertRecordToTimeZone(r, timeZone));
      }
      if (stmAutoRecord) {
        me.stmAutoRecord = stmAutoRecord;
      }
    }
    updateTimeZone(timeZone, oldTimeZone) {
      const me = this, isConfiguring = me._isConfiguringTimeZone || me.isConfiguring;
      me.trigger("beforeTimeZoneChange", {
        timeZone,
        oldTimeZone,
        isConfiguring
      });
      me.calendarManagerStore.forEach((calendar) => calendar.bumpVersion());
      me._storesWithDates.forEach((store) => me.plugStore(store));
      me.convertStoresToTimeZone(me._storesWithDates);
      if (me.startDate) {
        const startDate = oldTimeZone != null ? TimeZoneHelper.fromTimeZone(me.startDate, oldTimeZone) : me.startDate;
        me.startDate = timeZone != null ? TimeZoneHelper.toTimeZone(startDate, timeZone) : startDate;
      }
      me.ignoreRecordChanges = true;
      me.commitAsync().then(() => {
        if (!me.isDestroyed) {
          me.trigger("timeZoneChange", {
            timeZone,
            oldTimeZone,
            isConfiguring
          });
        }
        delete me._isConfiguringTimeZone;
      });
    }
  }, __publicField(_a, "$name", "ProjectModelTimeZoneMixin"), __publicField(_a, "configurable", {
    /**
     * Set to a IANA time zone (i.e. `Europe/Stockholm`) or a UTC offset in minutes (i.e. `-120`). This will
     * convert all events, tasks and time ranges to the specified time zone or offset. It will also affect the
     * displayed timeline's headers as well at the start and end date of it.
     *
     * There is currently no built-in time zone support in JavaScript which means that the converted dates
     * technically still are in the local system time zone, but adjusted to match the configured time zone.
     *
     * ### DST
     * If a IANA time zone is provided, there will be support for DST. But if local system time zone has DST that
     * will affect the time zone conversion at the exact hour when the local system time zone switches DST on and
     * off.
     *
     * *For example:*
     * 1. The local system time zone is `Europe/Stockholm` (which is UTC+1 or UTC+2 when DST).
     * 2. The date `2022-03-27T07:00:00Z` (which is UTC) is converted to `America/Chicago` (which is UTC-6 or UTC-5
     *    when DST).
     * 3. The converted JS date will be created from `2022-03-27T02:00:00` which is exactly the hour when
     *    `Europe/Stockholm` adds an DST hour. This has the effect that the converted date shows up incorrectly as
     *    `2022-03-27T03:00` instead.
     *
     * If a UTC offset is provided, there is no DST support at all.
     *
     * ### Editing
     * If creating new records or editing existing record dates, the dates will be interpreted as in the selected
     * time zone.
     *
     * If you want to create new records with dates that either should be interpreted as local system time zone or
     * from any other time zone, specify the {@link Scheduler.model.mixin.TimeZonedDatesMixin#field-timeZone} field
     * on the record.
     *
     * ### Saving
     * When saving or syncing data, the dates will be restored to local system time and converted to JSON
     * ISO formatted.
     *
     * @prp {String|Number} [timeZone]
     * @category Advanced
     */
    timeZone: {
      // Don't ingest the config eagerly because it relies on project being present.
      // Lazy means it waits for ingestion until timeZone property is referenced.
      $config: "lazy",
      value: null
    }
  }), _a;
};

// ../Scheduler/lib/Scheduler/model/TimeRangeModel.js
var TimeRangeModel = class extends TimeSpan.mixin(RecurringTimeSpan_default) {
  /**
   * @hidefields children, parentId, parentIndex
   */
  afterConstruct() {
    if (!this.endDate) {
      this.endDate = this.startDate;
    }
    super.afterConstruct();
  }
};
__publicField(TimeRangeModel, "$name", "TimeRangeModel");
TimeRangeModel._$name = "TimeRangeModel";

// ../Scheduler/lib/Scheduler/data/TimeRangeStore.js
var TimeRangeStore = class extends AjaxStore.mixin(RecurringTimeSpansMixin_default) {
};
__publicField(TimeRangeStore, "$name", "TimeRangeStore");
__publicField(TimeRangeStore, "defaultConfig", {
  /**
   * CrudManager must load stores in the correct order. Lowest first.
   * @private
   */
  loadPriority: 500,
  /**
   * CrudManager must sync stores in the correct order. Lowest first.
   * @private
   */
  syncPriority: 500,
  modelClass: TimeRangeModel,
  storeId: "timeRanges"
});
TimeRangeStore._$name = "TimeRangeStore";

// ../Scheduler/lib/Scheduler/model/mixin/ProjectModelMixin.js
var ProjectModelMixin_default = (Target) => {
  var _a;
  return _a = class extends (Target || Model).mixin(
    ProjectModelCommon_default,
    ProjectModelTimeZoneMixin_default
  ) {
    static get $name() {
      return "ProjectModelMixin";
    }
    //region Config
    static get defaultConfig() {
      return {
        /**
         * State tracking manager instance the project relies on
         * @member {Core.data.stm.StateTrackingManager} stm
         * @category Advanced
         */
        /**
         * Configuration options to provide to the STM manager
         *
         * @config {StateTrackingManagerConfig|Core.data.stm.StateTrackingManager}
         * @category Advanced
         */
        stm: {},
        timeRangeModelClass: TimeRangeModel,
        resourceTimeRangeModelClass: ResourceTimeRangeModel,
        /**
         * The constructor to create a time range store instance with. Should be a class subclassing the
         * {@link Scheduler.data.TimeRangeStore}
         * @config {Scheduler.data.TimeRangeStore|Object}
         * @typings {typeof TimeRangeStore|object}
         * @category Models & Stores
         */
        timeRangeStoreClass: TimeRangeStore,
        /**
         * The constructor to create a resource time range store instance with. Should be a class subclassing the
         * {@link Scheduler.data.ResourceTimeRangeStore}
         * @config {Scheduler.data.ResourceTimeRangeStore|Object}
         * @typings {typeof ResourceTimeRangeStore|object}
         * @category Models & Stores
         */
        resourceTimeRangeStoreClass: ResourceTimeRangeStore,
        /**
         * The initial data, to fill the {@link #property-timeRangeStore timeRangeStore} with.
         * Should be an array of {@link Scheduler.model.TimeSpan TimeSpan} or its configuration objects.
         *
         * @config {Scheduler.model.TimeSpan[]} [timeRangesData]
         * @category Legacy inline data
         */
        /**
         * The initial data, to fill the {@link #property-resourceTimeRangeStore resourceTimeRangeStore} with.
         * Should be an array of {@link Scheduler.model.ResourceTimeRangeModel ResourceTimeRangeModel} or it's
         * configuration objects.
         *
         * @config {Scheduler.model.ResourceTimeRangeModel[]} [resourceTimeRangesData]
         * @category Legacy inline data
         */
        eventStore: {},
        assignmentStore: {},
        dependencyStore: {},
        resourceStore: {},
        timeRangesData: null,
        resourceTimeRangesData: null
      };
    }
    //endregion
    //region Properties
    /**
     * Get or set data of project stores. The returned data is identical to what
     * {@link #function-toJSON} returns:
     *
     * ```javascript
     *
     * const data = scheduler.project.inlineData;
     *
     * // data:
     * {
     *     eventsData             : [...],
     *     resourcesData          : [...],
     *     dependenciesData       : [...],
     *     assignmentsData        : [...],
     *     resourceTimeRangesData : [...],
     *     timeRangesData         : [...]
     * }
     *
     *
     * // Plug it back in later
     * scheduler.project.inlineData = data;
     * ```
     *
     * @property {Object}
     * @category Inline data
     */
    get inlineData() {
      return StringHelper.safeJsonParse(super.json);
    }
    set inlineData(inlineData) {
      this.json = inlineData;
    }
    //endregion
    //region Functions
    /**
     * Accepts a "data package" consisting of data for the projects stores, which is then loaded into the stores.
     *
     * The package can hold data for `EventStore`, `AssignmentStore`, `ResourceStore`, `DependencyStore`,
     * `TimeRangeStore` and `ResourceTimeRangeStore`. It uses the same format as when creating a project with inline
     * data:
     *
     * ```javascript
     * await project.loadInlineData({
     *     eventsData             : [...],
     *     resourcesData          : [...],
     *     assignmentsData        : [...],
     *     dependenciesData       : [...],
     *     resourceTimeRangesData : [...],
     *     timeRangesData         : [...]
     * });
     * ```
     *
     * After populating the stores it commits the project, starting its calculations. By awaiting `loadInlineData()` you
     * can be sure that project calculations are finished.
     *
     * @function loadInlineData
     * @param {Object} dataPackage A data package as described above
     * @fires load
     * @async
     * @category Inline data
     */
    /**
     * Project changes (CRUD operations to records in its stores) are automatically committed on a buffer to the
     * underlying graph based calculation engine. The engine performs it calculations async.
     *
     * By calling this function, the commit happens right away. And by awaiting it you are sure that project
     * calculations are finished and that references between records are up to date.
     *
     * The returned promise is resolved with an object. If that object has `rejectedWith` set, there has been a conflict and the calculation failed.
     *
     * ```javascript
     * // Move an event in time
     * eventStore.first.shift(1);
     *
     * // Trigger calculations directly and wait for them to finish
     * const result = await project.commitAsync();
     *
     * if (result.rejectedWith) {
     *     // there was a conflict during the scheduling
     * }
     * ```
     *
     * @async
     * @function commitAsync
     * @category Common
     */
    //endregion
    //region Init
    construct(config = {}) {
      super.construct(...arguments);
      if (config.timeRangesData) {
        this.timeRangeStore.data = config.timeRangesData;
      }
      if (config.resourceTimeRangesData) {
        this.resourceTimeRangeStore.data = config.resourceTimeRangesData;
      }
    }
    afterConstruct() {
      super.afterConstruct();
      const me = this;
      !me.timeRangeStore.stm && me.stm.addStore(me.timeRangeStore);
      !me.resourceTimeRangeStore.stm && me.stm.addStore(me.resourceTimeRangeStore);
    }
    //endregion
    //region Attaching stores
    // Attach to a store, relaying its change events
    attachStore(store) {
      if (store) {
        store.ion({
          name: store.$$name,
          change: "relayStoreChange",
          thisObj: this
        });
      }
      super.attachStore(store);
    }
    // Detach a store, stop relaying its change events
    detachStore(store) {
      if (store) {
        this.detachListeners(store.$$name);
        super.detachStore(store);
      }
    }
    relayStoreChange(event) {
      super.relayStoreChange(event);
      return this.trigger("change", { store: event.source, ...event, source: this });
    }
    updateTimeRangeStore(store, oldStore) {
      this.detachStore(oldStore);
      this.attachStore(store);
      if (oldStore) {
        oldStore.project = null;
      }
      if (store) {
        store.project = this;
      }
    }
    setTimeRangeStore(store) {
      this.timeRangeStore = store;
    }
    changeTimeRangeStore(store) {
      if (store && !store.isStore) {
        store = this.timeRangeStoreClass.new({
          modelClass: this.timeRangeModelClass
        }, store);
      }
      return store;
    }
    updateResourceTimeRangeStore(store, oldStore) {
      this.detachStore(oldStore);
      this.attachStore(store);
      if (oldStore) {
        oldStore.project = null;
      }
      if (store) {
        store.project = this;
      }
    }
    changeResourceTimeRangeStore(store) {
      if (store && !store.isStore) {
        store = this.resourceTimeRangeStoreClass.new({
          modelClass: this.resourceTimeRangeModelClass
        }, store);
      }
      return store;
    }
    setResourceTimeRangeStore(store) {
      this.resourceTimeRangeStore = store;
    }
    //endregion
    //region Inline data
    get events() {
      return this.eventStore.allRecords;
    }
    updateEvents(events) {
      this.eventStore.data = events;
    }
    get resourceTimeRanges() {
      return this.resourceTimeRangeStore.allRecords;
    }
    updateResourceTimeRanges(resourceTimeRanges) {
      this.resourceTimeRangeStore.data = resourceTimeRanges;
    }
    async loadInlineData(data) {
      this.isLoadingInlineData = true;
      if (data.resourceTimeRangesData) {
        this.resourceTimeRangeStore.data = data.resourceTimeRangesData;
      }
      if (data.timeRangesData) {
        this.timeRangeStore.data = data.timeRangesData;
      }
      return super.loadInlineData(data);
    }
    //endregion
    //region JSON
    /**
     * Returns the data from the records of the projects stores, in a format that can be consumed by `loadInlineData()`.
     *
     * Used by JSON.stringify to correctly convert this record to json.
     *
     *
     * ```javascript
     * const project = new ProjectModel({
     *     eventsData             : [...],
     *     resourcesData          : [...],
     *     assignmentsData        : [...],
     *     dependenciesData       : [...],
     *     resourceTimeRangesData : [...],
     *     timeRangesData         : [...]
     * });
     *
     * const json = project.toJSON();
     *
     * // json:
     * {
     *     eventsData             : [...],
     *     resourcesData          : [...],
     *     dependenciesData       : [...],
     *     assignmentsData        : [...],
     *     resourceTimeRangesData : [...],
     *     timeRangesData         : [...]
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
     * @category Inline data
     */
    toJSON() {
      const me = this, result = {
        eventsData: me.eventStore.toJSON(),
        resourcesData: me.resourceStore.toJSON(),
        dependenciesData: me.dependencyStore.toJSON(),
        timeRangesData: me.timeRangeStore.toJSON(),
        resourceTimeRangesData: me.resourceTimeRangeStore.toJSON()
      };
      if (!me.eventStore.usesSingleAssignment) {
        result.assignmentsData = me.assignmentStore.toJSON();
      }
      return result;
    }
    /**
     * Get or set project data (records from its stores) as a JSON string.
     *
     * Get a JSON string:
     *
     * ```javascript
     * const project = new ProjectModel({
     *     eventsData             : [...],
     *     resourcesData          : [...],
     *     assignmentsData        : [...],
     *     dependenciesData       : [...],
     *     resourceTimeRangesData : [...],
     *     timeRangesData         : [...]
     * });
     *
     * const jsonString = project.json;
     *
     * // jsonString:
     * '{"eventsData":[...],"resourcesData":[...],...}'
     * ```
     *
     * Set a JSON string (to populate the project stores):
     *
     * ```javascript
     * project.json = '{"eventsData":[...],"resourcesData":[...],...}'
     * ```
     *
     * @property {String}
     * @category Inline data
     */
    get json() {
      return super.json;
    }
    changeJson(json) {
      if (typeof json === "string") {
        json = StringHelper.safeJsonParse(json);
      }
      return json;
    }
    updateJson(json) {
      json && this.loadInlineData(json);
    }
    //endregion
    afterChange(toSet, wasSet) {
      super.afterChange(...arguments);
      if (wasSet.calendar) {
        this.trigger("calendarChange");
      }
    }
    doDestroy() {
      this.timeRangeStore.destroy();
      this.resourceTimeRangeStore.destroy();
      super.doDestroy();
    }
  }, __publicField(_a, "configurable", {
    /**
     * Project data as a JSON string, used to populate its stores.
     *
     * ```javascript
     * const project = new ProjectModel({
     *     json : '{"eventsData":[...],"resourcesData":[...],...}'
     * }
     * ```
     *
     * @config {String}
     * @category Inline data
     */
    json: null,
    /**
     * The {@link Core.data.Store store} holding the time ranges information.
     *
     * See also {@link Scheduler.model.TimeSpan}
     *
     * @member {Core.data.Store} timeRangeStore
     * @category Models & Stores
     */
    /**
     * A {@link Core.data.Store} instance or a config object.
     * @config {Core.data.Store|StoreConfig}
     * @category Models & Stores
     */
    timeRangeStore: {
      value: {},
      $config: "nullify"
    },
    /**
     * The {@link Scheduler.data.ResourceTimeRangeStore store} holding the resource time ranges information.
     *
     * See also {@link Scheduler.model.ResourceTimeRangeModel}
     *
     * @member {Scheduler.data.ResourceTimeRangeStore} resourceTimeRangeStore
     * @category Models & Stores
     */
    /**
     * A {@link Scheduler.data.ResourceTimeRangeStore} instance or a config object.
     * @config {Scheduler.data.ResourceTimeRangeStore|ResourceTimeRangeStoreConfig}
     * @category Models & Stores
     */
    resourceTimeRangeStore: {
      value: {},
      $config: "nullify"
    },
    // Documented in Scheduler/SchedulerPro versions of model/ProjectModel since types differ
    events: null,
    resourceTimeRanges: null
  }), _a;
};

// ../Scheduler/lib/Scheduler/model/mixin/ProjectCurrentConfig.js
var ProjectCurrentConfig_default = (Target) => class ProjectCurrentConfig extends Target {
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs/fields for the project, with special handling for inline data
  getCurrentConfig(options) {
    const me = this, result = super.getCurrentConfig(options);
    if (result) {
      for (const storeName of ["eventStore", "resourceStore", "assignmentStore", "dependencyStore", "timeRangeStore", "resourceTimeRangeStore"]) {
        const store = me[storeName];
        if (store) {
          if (store.count) {
            result[store.id + "Data"] = store.getInlineData(options);
          }
          const storeState = store.getCurrentConfig(options);
          if (storeState && Object.keys(storeState).length > 0) {
            result[storeName] = Object.assign(result[storeName] || {}, storeState);
          } else if (result[storeName] && Object.keys(result[storeName]).length === 0) {
            delete result[storeName];
          }
        }
      }
      if (me.taskStore.isTaskStore) {
        delete result.eventModelClass;
        delete result.eventStoreClass;
        delete result.children;
      }
      return result;
    }
  }
};

// ../Scheduler/lib/Scheduler/data/util/ModelPersistencyManager.js
var ModelPersistencyManager = class extends Base {
  // region Event attachers
  set eventStore(newEventStore) {
    const me = this;
    me.eventStoreDetacher && me.eventStoreDetacher();
    me._eventStore = newEventStore;
    if (newEventStore && newEventStore.autoCommit) {
      me.eventStoreDetacher = newEventStore.ion({
        beforecommit: me.onEventStoreBeforeSync,
        thisObj: me,
        detachable: true,
        // Just in case
        prio: 100
      });
    }
  }
  get eventStore() {
    return this._eventStore;
  }
  set resourceStore(newResourceStore) {
    const me = this;
    me.resourceStoreDetacher && me.resourceStoreDetacher();
    me._resourceStore = newResourceStore;
    if (newResourceStore && newResourceStore.autoCommit) {
      me.resourceStoreDetacher = newResourceStore.ion({
        beforecommit: me.onResourceStoreBeforeSync,
        thisObj: me,
        detachable: true,
        // Just in case
        prio: 100
      });
    }
  }
  get resourceStore() {
    return this._resourceStore;
  }
  set assignmentStore(newAssignmentStore) {
    const me = this;
    me.assignmentStoreDetacher && me.assignmentStoreDetacher();
    me._assignmentStore = newAssignmentStore;
    if (newAssignmentStore && newAssignmentStore.autoSync) {
      me.assignmentStoreDetacher = newAssignmentStore.ion({
        beforecommit: me.onAssignmentStoreBeforeSync,
        thisObj: me,
        detachable: true,
        // Just in case
        prio: 100
      });
    }
  }
  get assignmentStore() {
    return this._assignmentStore;
  }
  set dependencyStore(newDependencyStore) {
    const me = this;
    me.dependencyStoreDetacher && me.dependencyStoreDetacher();
    me._dependencyStore = newDependencyStore;
    if (newDependencyStore && newDependencyStore.autoSync) {
      me.dependencyStoreDetacher = newDependencyStore.ion({
        beforecommit: me.onDependencyStoreBeforeSync,
        thisObj: me,
        detachable: true,
        // Just in case
        prio: 100
      });
    }
  }
  get dependencyStore() {
    return this._dependencyStore;
  }
  // endregion
  // region Event handlers
  onEventStoreBeforeSync({ changes }) {
    const me = this;
    me.removeNonPersistableRecordsToCreate(changes);
    return me.shallContinueSync(changes);
  }
  onResourceStoreBeforeSync({ changes }) {
    const me = this;
    me.removeNonPersistableRecordsToCreate(changes);
    return me.shallContinueSync(changes);
  }
  onAssignmentStoreBeforeSync({ changes }) {
    const me = this;
    me.removeNonPersistableRecordsToCreate(changes);
    return me.shallContinueSync(changes);
  }
  onDependencyStoreBeforeSync({ changes }) {
    const me = this;
    me.removeNonPersistableRecordsToCreate(changes);
    return me.shallContinueSync(changes);
  }
  // endregion
  // region Management rules
  removeNonPersistableRecordsToCreate(changes) {
    const recordsToCreate = changes.added || [];
    let r, i;
    for (i = recordsToCreate.length - 1; i >= 0; --i) {
      r = recordsToCreate[i];
      if (!r.isPersistable) {
        recordsToCreate.splice(recordsToCreate.indexOf(r), 1);
      }
    }
    if (recordsToCreate.length === 0) {
      changes.added.length = 0;
    }
  }
  shallContinueSync(options) {
    return Boolean(options.added && options.added.length > 0 || options.modified && options.modified.length > 0 || options.removed && options.removed.length > 0);
  }
  // endregion
};
ModelPersistencyManager._$name = "ModelPersistencyManager";

// ../Engine/lib/Engine/vendor/later/later.js
var diffSecond = (date, diff) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds() + diff,
    date.getMilliseconds()
  );
};
var later = function() {
  "use strict";
  var later2 = {
    version: "1.2.0"
  };
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
      "use strict";
      if (this == null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) {
          n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }
  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }
  later2.array = {};
  later2.array.sort = function(arr, zeroIsLast) {
    arr.sort(function(a, b) {
      return +a - +b;
    });
    if (zeroIsLast && arr[0] === 0) {
      arr.push(arr.shift());
    }
  };
  later2.array.next = function(val, values, extent) {
    var cur, zeroIsLargest = extent[0] !== 0, nextIdx = 0;
    for (var i = values.length - 1; i > -1; --i) {
      cur = values[i];
      if (cur === val) {
        return cur;
      }
      if (cur > val || cur === 0 && zeroIsLargest && extent[1] > val) {
        nextIdx = i;
        continue;
      }
      break;
    }
    return values[nextIdx];
  };
  later2.array.nextInvalid = function(val, values, extent) {
    var min = extent[0], max = extent[1], len = values.length, zeroVal = values[len - 1] === 0 && min !== 0 ? max : 0, next = val, i = values.indexOf(val), start = next;
    while (next === (values[i] || zeroVal)) {
      next++;
      if (next > max) {
        next = min;
      }
      i++;
      if (i === len) {
        i = 0;
      }
      if (next === start) {
        return void 0;
      }
    }
    return next;
  };
  later2.array.prev = function(val, values, extent) {
    var cur, len = values.length, zeroIsLargest = extent[0] !== 0, prevIdx = len - 1;
    for (var i = 0; i < len; i++) {
      cur = values[i];
      if (cur === val) {
        return cur;
      }
      if (cur < val || cur === 0 && zeroIsLargest && extent[1] < val) {
        prevIdx = i;
        continue;
      }
      break;
    }
    return values[prevIdx];
  };
  later2.array.prevInvalid = function(val, values, extent) {
    var min = extent[0], max = extent[1], len = values.length, zeroVal = values[len - 1] === 0 && min !== 0 ? max : 0, next = val, i = values.indexOf(val), start = next;
    while (next === (values[i] || zeroVal)) {
      next--;
      if (next < min) {
        next = max;
      }
      i--;
      if (i === -1) {
        i = len - 1;
      }
      if (next === start) {
        return void 0;
      }
    }
    return next;
  };
  later2.day = later2.D = {
    name: "day",
    range: 86400,
    val: function(d) {
      return d.D || (d.D = later2.date.getDate.call(d));
    },
    isValid: function(d, val) {
      return later2.D.val(d) === (val || later2.D.extent(d)[1]);
    },
    extent: function(d) {
      if (d.DExtent)
        return d.DExtent;
      var month = later2.M.val(d), max = later2.DAYS_IN_MONTH[month - 1];
      if (month === 2 && later2.dy.extent(d)[1] === 366) {
        max = max + 1;
      }
      return d.DExtent = [1, max];
    },
    start: function(d) {
      return d.DStart || (d.DStart = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d)));
    },
    end: function(d) {
      return d.DEnd || (d.DEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d)));
    },
    next: function(d, val) {
      val = val > later2.D.extent(d)[1] ? 1 : val;
      var month = later2.date.nextRollover(d, val, later2.D, later2.M), DMax = later2.D.extent(month)[1];
      val = val > DMax ? 1 : val || DMax;
      return later2.date.next(later2.Y.val(month), later2.M.val(month), val);
    },
    prev: function(d, val) {
      var month = later2.date.prevRollover(d, val, later2.D, later2.M), DMax = later2.D.extent(month)[1];
      return later2.date.prev(later2.Y.val(month), later2.M.val(month), val > DMax ? DMax : val || DMax);
    }
  };
  later2.dayOfWeekCount = later2.dc = {
    name: "day of week count",
    range: 604800,
    val: function(d) {
      return d.dc || (d.dc = Math.floor((later2.D.val(d) - 1) / 7) + 1);
    },
    isValid: function(d, val) {
      return later2.dc.val(d) === val || val === 0 && later2.D.val(d) > later2.D.extent(d)[1] - 7;
    },
    extent: function(d) {
      return d.dcExtent || (d.dcExtent = [1, Math.ceil(later2.D.extent(d)[1] / 7)]);
    },
    start: function(d) {
      return d.dcStart || (d.dcStart = later2.date.next(later2.Y.val(d), later2.M.val(d), Math.max(1, (later2.dc.val(d) - 1) * 7 + 1 || 1)));
    },
    end: function(d) {
      return d.dcEnd || (d.dcEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), Math.min(later2.dc.val(d) * 7, later2.D.extent(d)[1])));
    },
    next: function(d, val) {
      val = val > later2.dc.extent(d)[1] ? 1 : val;
      var month = later2.date.nextRollover(d, val, later2.dc, later2.M), dcMax = later2.dc.extent(month)[1];
      val = val > dcMax ? 1 : val;
      var next = later2.date.next(later2.Y.val(month), later2.M.val(month), val === 0 ? later2.D.extent(month)[1] - 6 : 1 + 7 * (val - 1));
      if (next.getTime() <= d.getTime()) {
        month = later2.M.next(d, later2.M.val(d) + 1);
        return later2.date.next(later2.Y.val(month), later2.M.val(month), val === 0 ? later2.D.extent(month)[1] - 6 : 1 + 7 * (val - 1));
      }
      return next;
    },
    prev: function(d, val) {
      var month = later2.date.prevRollover(d, val, later2.dc, later2.M), dcMax = later2.dc.extent(month)[1];
      val = val > dcMax ? dcMax : val || dcMax;
      return later2.dc.end(later2.date.prev(later2.Y.val(month), later2.M.val(month), 1 + 7 * (val - 1)));
    }
  };
  later2.dayOfWeek = later2.dw = later2.d = {
    name: "day of week",
    range: 86400,
    val: function(d) {
      return d.dw || (d.dw = later2.date.getDay.call(d) + 1);
    },
    isValid: function(d, val) {
      return later2.dw.val(d) === (val || 7);
    },
    extent: function() {
      return [1, 7];
    },
    start: function(d) {
      return later2.D.start(d);
    },
    end: function(d) {
      return later2.D.end(d);
    },
    next: function(d, val) {
      val = val > 7 ? 1 : val || 7;
      return later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val - later2.dw.val(d)) + (val <= later2.dw.val(d) ? 7 : 0));
    },
    prev: function(d, val) {
      val = val > 7 ? 7 : val || 7;
      return later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val - later2.dw.val(d)) + (val >= later2.dw.val(d) ? -7 : 0));
    }
  };
  later2.dayOfYear = later2.dy = {
    name: "day of year",
    range: 86400,
    val: function(d) {
      return d.dy || (d.dy = Math.ceil(1 + (later2.D.start(d).getTime() - later2.Y.start(d).getTime()) / later2.DAY));
    },
    isValid: function(d, val) {
      return later2.dy.val(d) === (val || later2.dy.extent(d)[1]);
    },
    extent: function(d) {
      var year = later2.Y.val(d);
      return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
    },
    start: function(d) {
      return later2.D.start(d);
    },
    end: function(d) {
      return later2.D.end(d);
    },
    next: function(d, val) {
      val = val > later2.dy.extent(d)[1] ? 1 : val;
      var year = later2.date.nextRollover(d, val, later2.dy, later2.Y), dyMax = later2.dy.extent(year)[1];
      val = val > dyMax ? 1 : val || dyMax;
      return later2.date.next(later2.Y.val(year), later2.M.val(year), val);
    },
    prev: function(d, val) {
      var year = later2.date.prevRollover(d, val, later2.dy, later2.Y), dyMax = later2.dy.extent(year)[1];
      val = val > dyMax ? dyMax : val || dyMax;
      return later2.date.prev(later2.Y.val(year), later2.M.val(year), val);
    }
  };
  later2.hour = later2.h = {
    name: "hour",
    range: 3600,
    val: function(d) {
      return d.h || (d.h = later2.date.getHour.call(d));
    },
    isValid: function(d, val) {
      return later2.h.val(d) === val;
    },
    extent: function() {
      return [0, 23];
    },
    start: function(d) {
      return d.hStart || (d.hStart = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d)));
    },
    end: function(d) {
      return d.hEnd || (d.hEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d)));
    },
    next: function(d, val) {
      val = val > 23 ? 0 : val;
      var next = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val <= later2.h.val(d) ? 1 : 0), val);
      if (!later2.date.isUTC && next.getTime() <= d.getTime()) {
        next = later2.date.next(later2.Y.val(next), later2.M.val(next), later2.D.val(next), val + 1);
      }
      return next;
    },
    prev: function(d, val) {
      val = val > 23 ? 23 : val;
      return later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val >= later2.h.val(d) ? -1 : 0), val);
    }
  };
  later2.minute = later2.m = {
    name: "minute",
    range: 60,
    val: function(d) {
      return d.m || (d.m = later2.date.getMin.call(d));
    },
    isValid: function(d, val) {
      return later2.m.val(d) === val;
    },
    extent: function(d) {
      return [0, 59];
    },
    start: function(d) {
      return d.mStart || (d.mStart = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d), later2.m.val(d)));
    },
    end: function(d) {
      return d.mEnd || (d.mEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d), later2.m.val(d)));
    },
    next: function(d, val) {
      var m = later2.m.val(d), s = later2.s.val(d), inc = val > 59 ? 60 - m : val <= m ? 60 - m + val : val - m, next = new Date(d.getTime() + inc * later2.MIN - s * later2.SEC);
      if (!later2.date.isUTC && next.getTime() <= d.getTime()) {
        next = new Date(d.getTime() + (inc + 120) * later2.MIN - s * later2.SEC);
      }
      return next;
    },
    prev: function(d, val) {
      val = val > 59 ? 59 : val;
      return later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d) + (val >= later2.m.val(d) ? -1 : 0), val);
    }
  };
  later2.month = later2.M = {
    name: "month",
    range: 2629740,
    val: function(d) {
      return d.M || (d.M = later2.date.getMonth.call(d) + 1);
    },
    isValid: function(d, val) {
      return later2.M.val(d) === (val || 12);
    },
    extent: function() {
      return [1, 12];
    },
    start: function(d) {
      return d.MStart || (d.MStart = later2.date.next(later2.Y.val(d), later2.M.val(d)));
    },
    end: function(d) {
      return d.MEnd || (d.MEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d)));
    },
    next: function(d, val) {
      val = val > 12 ? 1 : val || 12;
      return later2.date.next(later2.Y.val(d) + (val > later2.M.val(d) ? 0 : 1), val);
    },
    prev: function(d, val) {
      val = val > 12 ? 12 : val || 12;
      return later2.date.prev(later2.Y.val(d) - (val >= later2.M.val(d) ? 1 : 0), val);
    }
  };
  later2.second = later2.s = {
    name: "second",
    range: 1,
    val: function(d) {
      return d.s || (d.s = later2.date.getSec.call(d));
    },
    isValid: function(d, val) {
      return later2.s.val(d) === val;
    },
    extent: function() {
      return [0, 59];
    },
    start: function(d) {
      return d;
    },
    end: function(d) {
      return d;
    },
    next: function(d, val) {
      var s = later2.s.val(d), inc = val > 59 ? 60 - s : val <= s ? 60 - s + val : val - s, next = new Date(d.getTime() + inc * later2.SEC);
      if (!later2.date.isUTC && next.getTime() <= d.getTime()) {
        next = new Date(d.getTime() + (inc + 7200) * later2.SEC);
      }
      return next;
    },
    prev: function(d, val, cache) {
      val = val > 59 ? 59 : val;
      return later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d), later2.h.val(d), later2.m.val(d) + (val >= later2.s.val(d) ? -1 : 0), val);
    }
  };
  later2.time = later2.t = {
    name: "time",
    range: 1,
    val: function(d) {
      return d.t || (d.t = later2.h.val(d) * 3600 + later2.m.val(d) * 60 + later2.s.val(d));
    },
    isValid: function(d, val) {
      return later2.t.val(d) === val;
    },
    extent: function() {
      return [0, 86399];
    },
    start: function(d) {
      return d;
    },
    end: function(d) {
      return d;
    },
    next: function(d, val) {
      val = val > 86399 ? 0 : val;
      var next = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val <= later2.t.val(d) ? 1 : 0), 0, 0, val);
      if (!later2.date.isUTC && next.getTime() < d.getTime()) {
        next = later2.date.next(later2.Y.val(next), later2.M.val(next), later2.D.val(next), later2.h.val(next), later2.m.val(next), val + 7200);
      }
      return next;
    },
    prev: function(d, val) {
      val = val > 86399 ? 86399 : val;
      return later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (val >= later2.t.val(d) ? -1 : 0), 0, 0, val);
    }
  };
  later2.weekOfMonth = later2.wm = {
    name: "week of month",
    range: 604800,
    val: function(d) {
      return d.wm || (d.wm = (later2.D.val(d) + (later2.dw.val(later2.M.start(d)) - 1) + (7 - later2.dw.val(d))) / 7);
    },
    isValid: function(d, val) {
      return later2.wm.val(d) === (val || later2.wm.extent(d)[1]);
    },
    extent: function(d) {
      return d.wmExtent || (d.wmExtent = [1, (later2.D.extent(d)[1] + (later2.dw.val(later2.M.start(d)) - 1) + (7 - later2.dw.val(later2.M.end(d)))) / 7]);
    },
    start: function(d) {
      return d.wmStart || (d.wmStart = later2.date.next(later2.Y.val(d), later2.M.val(d), Math.max(later2.D.val(d) - later2.dw.val(d) + 1, 1)));
    },
    end: function(d) {
      return d.wmEnd || (d.wmEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), Math.min(later2.D.val(d) + (7 - later2.dw.val(d)), later2.D.extent(d)[1])));
    },
    next: function(d, val) {
      val = val > later2.wm.extent(d)[1] ? 1 : val;
      var month = later2.date.nextRollover(d, val, later2.wm, later2.M), wmMax = later2.wm.extent(month)[1];
      val = val > wmMax ? 1 : val || wmMax;
      return later2.date.next(later2.Y.val(month), later2.M.val(month), Math.max(1, (val - 1) * 7 - (later2.dw.val(month) - 2)));
    },
    prev: function(d, val) {
      var month = later2.date.prevRollover(d, val, later2.wm, later2.M), wmMax = later2.wm.extent(month)[1];
      val = val > wmMax ? wmMax : val || wmMax;
      return later2.wm.end(later2.date.next(later2.Y.val(month), later2.M.val(month), Math.max(1, (val - 1) * 7 - (later2.dw.val(month) - 2))));
    }
  };
  later2.weekOfYear = later2.wy = {
    name: "week of year (ISO)",
    range: 604800,
    val: function(d) {
      if (d.wy)
        return d.wy;
      var wThur = later2.dw.next(later2.wy.start(d), 5), YThur = later2.dw.next(later2.Y.prev(wThur, later2.Y.val(wThur) - 1), 5);
      return d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later2.WEEK);
    },
    isValid: function(d, val) {
      return later2.wy.val(d) === (val || later2.wy.extent(d)[1]);
    },
    extent: function(d) {
      if (d.wyExtent)
        return d.wyExtent;
      var year = later2.dw.next(later2.wy.start(d), 5), dwFirst = later2.dw.val(later2.Y.start(year)), dwLast = later2.dw.val(later2.Y.end(year));
      return d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52];
    },
    start: function(d) {
      return d.wyStart || (d.wyStart = later2.date.next(later2.Y.val(d), later2.M.val(d), later2.D.val(d) - (later2.dw.val(d) > 1 ? later2.dw.val(d) - 2 : 6)));
    },
    end: function(d) {
      return d.wyEnd || (d.wyEnd = later2.date.prev(later2.Y.val(d), later2.M.val(d), later2.D.val(d) + (later2.dw.val(d) > 1 ? 8 - later2.dw.val(d) : 0)));
    },
    next: function(d, val) {
      val = val > later2.wy.extent(d)[1] ? 1 : val;
      var wyThur = later2.dw.next(later2.wy.start(d), 5), year = later2.date.nextRollover(wyThur, val, later2.wy, later2.Y);
      if (later2.wy.val(year) !== 1) {
        year = later2.dw.next(year, 2);
      }
      var wyMax = later2.wy.extent(year)[1], wyStart = later2.wy.start(year);
      val = val > wyMax ? 1 : val || wyMax;
      return later2.date.next(later2.Y.val(wyStart), later2.M.val(wyStart), later2.D.val(wyStart) + 7 * (val - 1));
    },
    prev: function(d, val) {
      var wyThur = later2.dw.next(later2.wy.start(d), 5), year = later2.date.prevRollover(wyThur, val, later2.wy, later2.Y);
      if (later2.wy.val(year) !== 1) {
        year = later2.dw.next(year, 2);
      }
      var wyMax = later2.wy.extent(year)[1], wyEnd = later2.wy.end(year);
      val = val > wyMax ? wyMax : val || wyMax;
      return later2.wy.end(later2.date.next(later2.Y.val(wyEnd), later2.M.val(wyEnd), later2.D.val(wyEnd) + 7 * (val - 1)));
    }
  };
  later2.year = later2.Y = {
    name: "year",
    range: 31556900,
    val: function(d) {
      return d.Y || (d.Y = later2.date.getYear.call(d));
    },
    isValid: function(d, val) {
      return later2.Y.val(d) === val;
    },
    extent: function() {
      return [1970, 2099];
    },
    start: function(d) {
      return d.YStart || (d.YStart = later2.date.next(later2.Y.val(d)));
    },
    end: function(d) {
      return d.YEnd || (d.YEnd = later2.date.prev(later2.Y.val(d)));
    },
    next: function(d, val) {
      return val > later2.Y.val(d) && val <= later2.Y.extent()[1] ? later2.date.next(val) : later2.NEVER;
    },
    prev: function(d, val) {
      return val < later2.Y.val(d) && val >= later2.Y.extent()[0] ? later2.date.prev(val) : later2.NEVER;
    }
  };
  later2.fullDate = later2.fd = {
    name: "full date",
    range: 1,
    val: function(d) {
      return d.fd || (d.fd = d.getTime());
    },
    isValid: function(d, val) {
      return later2.fd.val(d) === val;
    },
    extent: function() {
      return [0, 3250368e7];
    },
    start: function(d) {
      return d;
    },
    end: function(d) {
      return d;
    },
    next: function(d, val) {
      return later2.fd.val(d) < val ? new Date(val) : later2.NEVER;
    },
    prev: function(d, val) {
      return later2.fd.val(d) > val ? new Date(val) : later2.NEVER;
    }
  };
  later2.modifier = {};
  later2.modifier.after = later2.modifier.a = function(constraint, values) {
    var value = values[0];
    return {
      name: "after " + constraint.name,
      range: (constraint.extent(/* @__PURE__ */ new Date())[1] - value) * constraint.range,
      val: constraint.val,
      isValid: function(d, val) {
        return this.val(d) >= value;
      },
      extent: constraint.extent,
      start: constraint.start,
      end: constraint.end,
      next: function(startDate, val) {
        if (val != value)
          val = constraint.extent(startDate)[0];
        return constraint.next(startDate, val);
      },
      prev: function(startDate, val) {
        val = val === value ? constraint.extent(startDate)[1] : value - 1;
        return constraint.prev(startDate, val);
      }
    };
  };
  later2.modifier.before = later2.modifier.b = function(constraint, values) {
    var value = values[values.length - 1];
    return {
      name: "before " + constraint.name,
      range: constraint.range * (value - 1),
      val: constraint.val,
      isValid: function(d, val) {
        return this.val(d) < value;
      },
      extent: constraint.extent,
      start: constraint.start,
      end: constraint.end,
      next: function(startDate, val) {
        val = val === value ? constraint.extent(startDate)[0] : value;
        return constraint.next(startDate, val);
      },
      prev: function(startDate, val) {
        val = val === value ? value - 1 : constraint.extent(startDate)[1];
        return constraint.prev(startDate, val);
      }
    };
  };
  later2.compile = function(schedDef) {
    var constraints = [], constraintsLen = 0, tickConstraint;
    for (var key in schedDef) {
      var nameParts = key.split("_"), name = nameParts[0], mod = nameParts[1], vals = schedDef[key], constraint = mod ? later2.modifier[mod](later2[name], vals) : later2[name];
      constraints.push({
        constraint,
        vals
      });
      constraintsLen++;
    }
    constraints.sort(function(a, b) {
      var ra = a.constraint.range, rb = b.constraint.range;
      return rb < ra ? -1 : rb > ra ? 1 : 0;
    });
    tickConstraint = constraints[constraintsLen - 1].constraint;
    function compareFn(dir) {
      return dir === "next" ? function(a, b) {
        return a.getTime() > b.getTime();
      } : function(a, b) {
        return b.getTime() > a.getTime();
      };
    }
    return {
      start: function(dir, startDate) {
        var next = startDate, nextVal = later2.array[dir], maxAttempts = 1e3, done;
        while (maxAttempts-- && !done && next) {
          done = true;
          for (var i = 0; i < constraintsLen; i++) {
            var constraint2 = constraints[i].constraint, curVal = constraint2.val(next), extent = constraint2.extent(next), newVal = nextVal(curVal, constraints[i].vals, extent);
            if (!constraint2.isValid(next, newVal)) {
              next = constraint2[dir](next, newVal);
              done = false;
              break;
            }
          }
        }
        if (next !== later2.NEVER) {
          next = dir === "next" ? tickConstraint.start(next) : tickConstraint.end(next);
        }
        return next;
      },
      end: function(dir, startDate) {
        var result, nextVal = later2.array[dir + "Invalid"], compare = compareFn(dir);
        for (var i = constraintsLen - 1; i >= 0; i--) {
          var constraint2 = constraints[i].constraint, curVal = constraint2.val(startDate), extent = constraint2.extent(startDate), newVal = nextVal(curVal, constraints[i].vals, extent), next;
          if (newVal !== void 0) {
            next = constraint2[dir](startDate, newVal);
            if (next && (!result || compare(result, next))) {
              result = next;
            }
          }
        }
        return result;
      },
      tick: function(dir, date) {
        return new Date(dir === "next" ? tickConstraint.end(date).getTime() + later2.SEC : tickConstraint.start(date).getTime() - later2.SEC);
      },
      // PATCH
      tickSafe: function(dir, date) {
        return dir === "next" ? diffSecond(tickConstraint.end(date), 1) : diffSecond(tickConstraint.start(date), -1);
      },
      // EOF PATCH
      tickStart: function(date) {
        return tickConstraint.start(date);
      }
    };
  };
  later2.schedule = function(sched) {
    if (!sched)
      throw new Error("Missing schedule definition.");
    if (!sched.schedules)
      throw new Error("Definition must include at least one schedule.");
    var schedules = [], schedulesLen = sched.schedules.length, exceptions = [], exceptionsLen = sched.exceptions ? sched.exceptions.length : 0;
    for (var i = 0; i < schedulesLen; i++) {
      schedules.push(later2.compile(sched.schedules[i]));
    }
    for (var j = 0; j < exceptionsLen; j++) {
      exceptions.push(later2.compile(sched.exceptions[j]));
    }
    function getInstances(dir, count, startDate, endDate, isRange) {
      var compare = compareFn(dir), loopCount = count, maxAttempts = 1e6, schedStarts = [], exceptStarts = [], next, end, results = [], isForward = dir === "next", lastResult, rStart = isForward ? 0 : 1, rEnd = isForward ? 1 : 0;
      startDate = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      if (!startDate || !startDate.getTime())
        throw new Error("Invalid start date.");
      setNextStarts(dir, schedules, schedStarts, startDate);
      setRangeStarts(dir, exceptions, exceptStarts, startDate);
      while (maxAttempts-- && loopCount && (next = findNext(schedStarts, compare))) {
        if (endDate && compare(next, endDate)) {
          break;
        }
        if (exceptionsLen) {
          updateRangeStarts(dir, exceptions, exceptStarts, next);
          if (end = calcRangeOverlap(dir, exceptStarts, next)) {
            updateNextStarts(dir, schedules, schedStarts, end);
            continue;
          }
        }
        if (isRange) {
          var maxEndDate = calcMaxEndDate(exceptStarts, compare);
          end = calcEnd(dir, schedules, schedStarts, next, maxEndDate);
          var r = isForward ? [new Date(Math.max(startDate, next)), end ? new Date(endDate ? Math.min(end, endDate) : end) : void 0] : [end ? new Date(endDate ? Math.max(endDate, end.getTime() + later2.SEC) : end.getTime() + later2.SEC) : void 0, new Date(Math.min(startDate, next.getTime() + later2.SEC))];
          if (lastResult && r[rStart].getTime() === lastResult[rEnd].getTime()) {
            lastResult[rEnd] = r[rEnd];
            loopCount++;
          } else {
            lastResult = r;
            results.push(lastResult);
          }
          if (!end)
            break;
          updateNextStarts(dir, schedules, schedStarts, end);
        } else {
          results.push(isForward ? new Date(Math.max(startDate, next)) : getStart(schedules, schedStarts, next, endDate));
          tickStarts(dir, schedules, schedStarts, next);
        }
        loopCount--;
      }
      for (var i2 = 0, len = results.length; i2 < len; i2++) {
        var result = results[i2];
        results[i2] = Object.prototype.toString.call(result) === "[object Array]" ? [cleanDate(result[0]), cleanDate(result[1])] : cleanDate(result);
      }
      return results.length === 0 ? later2.NEVER : count === 1 ? results[0] : results;
    }
    function cleanDate(d) {
      if (d instanceof Date && !isNaN(d.valueOf())) {
        return new Date(d);
      }
      return void 0;
    }
    function setNextStarts(dir, schedArr, startsArr, startDate) {
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        startsArr[i2] = schedArr[i2].start(dir, startDate);
      }
    }
    function updateNextStarts(dir, schedArr, startsArr, startDate) {
      var compare = compareFn(dir);
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        if (startsArr[i2] && !compare(startsArr[i2], startDate)) {
          startsArr[i2] = schedArr[i2].start(dir, startDate);
        }
      }
    }
    function setRangeStarts(dir, schedArr, rangesArr, startDate) {
      var compare = compareFn(dir);
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        var nextStart = schedArr[i2].start(dir, startDate);
        if (!nextStart) {
          rangesArr[i2] = later2.NEVER;
        } else {
          rangesArr[i2] = [nextStart, schedArr[i2].end(dir, nextStart)];
        }
      }
    }
    function updateRangeStarts(dir, schedArr, rangesArr, startDate) {
      var compare = compareFn(dir);
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        if (rangesArr[i2] && !compare(rangesArr[i2][0], startDate)) {
          var nextStart = schedArr[i2].start(dir, startDate);
          if (!nextStart) {
            rangesArr[i2] = later2.NEVER;
          } else {
            rangesArr[i2] = [nextStart, schedArr[i2].end(dir, nextStart)];
          }
        }
      }
    }
    function tickStarts(dir, schedArr, startsArr, startDate) {
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        if (startsArr[i2] && startsArr[i2].getTime() === startDate.getTime()) {
          const newStart = schedArr[i2].start(dir, schedArr[i2].tick(dir, startDate));
          if (newStart !== later2.NEVER && newStart.getTime() === startsArr[i2].getTime()) {
            startsArr[i2] = schedArr[i2].start(dir, schedArr[i2].tickSafe(dir, startDate));
          } else {
            startsArr[i2] = newStart;
          }
        }
      }
    }
    function getStart(schedArr, startsArr, startDate, minEndDate) {
      var result;
      for (var i2 = 0, len = startsArr.length; i2 < len; i2++) {
        if (startsArr[i2] && startsArr[i2].getTime() === startDate.getTime()) {
          var start = schedArr[i2].tickStart(startDate);
          if (minEndDate && start < minEndDate) {
            return minEndDate;
          }
          if (!result || start > result) {
            result = start;
          }
        }
      }
      return result;
    }
    function calcRangeOverlap(dir, rangesArr, startDate) {
      var compare = compareFn(dir), result;
      for (var i2 = 0, len = rangesArr.length; i2 < len; i2++) {
        var range = rangesArr[i2];
        if (range && !compare(range[0], startDate) && (!range[1] || compare(range[1], startDate))) {
          if (!result || compare(range[1], result)) {
            result = range[1];
          }
        }
      }
      return result;
    }
    function calcMaxEndDate(exceptsArr, compare) {
      var result;
      for (var i2 = 0, len = exceptsArr.length; i2 < len; i2++) {
        if (exceptsArr[i2] && (!result || compare(result, exceptsArr[i2][0]))) {
          result = exceptsArr[i2][0];
        }
      }
      return result;
    }
    function calcEnd(dir, schedArr, startsArr, startDate, maxEndDate) {
      var compare = compareFn(dir), result;
      for (var i2 = 0, len = schedArr.length; i2 < len; i2++) {
        var start = startsArr[i2];
        if (start && start.getTime() === startDate.getTime()) {
          var end = schedArr[i2].end(dir, start);
          if (maxEndDate && (!end || compare(end, maxEndDate))) {
            return maxEndDate;
          }
          if (!result || compare(end, result)) {
            result = end;
          }
        }
      }
      return result;
    }
    function compareFn(dir) {
      return dir === "next" ? function(a, b) {
        return !b || a.getTime() > b.getTime();
      } : function(a, b) {
        return !a || b.getTime() > a.getTime();
      };
    }
    function findNext(arr, compare) {
      var next = arr[0];
      for (var i2 = 1, len = arr.length; i2 < len; i2++) {
        if (arr[i2] && compare(next, arr[i2])) {
          next = arr[i2];
        }
      }
      return next;
    }
    return {
      isValid: function(d) {
        return getInstances("next", 1, d, d) !== later2.NEVER;
      },
      next: function(count, startDate, endDate) {
        return getInstances("next", count || 1, startDate, endDate);
      },
      prev: function(count, startDate, endDate) {
        return getInstances("prev", count || 1, startDate, endDate);
      },
      nextRange: function(count, startDate, endDate) {
        return getInstances("next", count || 1, startDate, endDate, true);
      },
      prevRange: function(count, startDate, endDate) {
        return getInstances("prev", count || 1, startDate, endDate, true);
      }
    };
  };
  later2.setTimeout = function(fn2, sched) {
    var s = later2.schedule(sched), t;
    if (fn2) {
      scheduleTimeout();
    }
    function scheduleTimeout() {
      var now = Date.now(), next = s.next(2, now);
      if (!next[0]) {
        t = void 0;
        return;
      }
      var diff = next[0].getTime() - now;
      if (diff < 1e3) {
        diff = next[1] ? next[1].getTime() - now : 1e3;
      }
      if (diff < 2147483647) {
        t = setTimeout(fn2, diff);
      } else {
        t = setTimeout(scheduleTimeout, 2147483647);
      }
    }
    return {
      isDone: function() {
        return !t;
      },
      clear: function() {
        clearTimeout(t);
      }
    };
  };
  later2.setInterval = function(fn2, sched) {
    if (!fn2) {
      return;
    }
    var t = later2.setTimeout(scheduleTimeout, sched), done = t.isDone();
    function scheduleTimeout() {
      if (!done) {
        fn2();
        t = later2.setTimeout(scheduleTimeout, sched);
      }
    }
    return {
      isDone: function() {
        return t.isDone();
      },
      clear: function() {
        done = true;
        t.clear();
      }
    };
  };
  later2.date = {};
  later2.date.timezone = function(useLocalTime) {
    later2.date.build = useLocalTime ? function(Y, M, D, h, m, s) {
      return new Date(Y, M, D, h, m, s);
    } : function(Y, M, D, h, m, s) {
      return new Date(Date.UTC(Y, M, D, h, m, s));
    };
    var get = useLocalTime ? "get" : "getUTC", d = Date.prototype;
    later2.date.getYear = d[get + "FullYear"];
    later2.date.getMonth = d[get + "Month"];
    later2.date.getDate = d[get + "Date"];
    later2.date.getDay = d[get + "Day"];
    later2.date.getHour = d[get + "Hours"];
    later2.date.getMin = d[get + "Minutes"];
    later2.date.getSec = d[get + "Seconds"];
    later2.date.isUTC = !useLocalTime;
  };
  later2.date.UTC = function() {
    later2.date.timezone(false);
  };
  later2.date.localTime = function() {
    later2.date.timezone(true);
  };
  later2.date.UTC();
  later2.SEC = 1e3;
  later2.MIN = later2.SEC * 60;
  later2.HOUR = later2.MIN * 60;
  later2.DAY = later2.HOUR * 24;
  later2.WEEK = later2.DAY * 7;
  later2.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  later2.NEVER = 0;
  later2.date.next = function(Y, M, D, h, m, s) {
    return later2.date.build(Y, M !== void 0 ? M - 1 : 0, D !== void 0 ? D : 1, h || 0, m || 0, s || 0);
  };
  later2.date.nextRollover = function(d, val, constraint, period) {
    var cur = constraint.val(d), max = constraint.extent(d)[1];
    return (val || max) <= cur || val > max ? new Date(period.end(d).getTime() + later2.SEC) : period.start(d);
  };
  later2.date.prev = function(Y, M, D, h, m, s) {
    var len = arguments.length;
    M = len < 2 ? 11 : M - 1;
    D = len < 3 ? later2.D.extent(later2.date.next(Y, M + 1))[1] : D;
    h = len < 4 ? 23 : h;
    m = len < 5 ? 59 : m;
    s = len < 6 ? 59 : s;
    return later2.date.build(Y, M, D, h, m, s);
  };
  later2.date.prevRollover = function(d, val, constraint, period) {
    var cur = constraint.val(d);
    return val >= cur || !val ? period.start(period.prev(d, period.val(d) - 1)) : period.start(d);
  };
  later2.parse = {};
  later2.parse.cron = function(expr, hasSeconds) {
    var NAMES = {
      JAN: 1,
      FEB: 2,
      MAR: 3,
      APR: 4,
      MAY: 5,
      JUN: 6,
      JUL: 7,
      AUG: 8,
      SEP: 9,
      OCT: 10,
      NOV: 11,
      DEC: 12,
      SUN: 1,
      MON: 2,
      TUE: 3,
      WED: 4,
      THU: 5,
      FRI: 6,
      SAT: 7
    };
    var REPLACEMENTS = {
      "* * * * * *": "0/1 * * * * *",
      "@YEARLY": "0 0 1 1 *",
      "@ANNUALLY": "0 0 1 1 *",
      "@MONTHLY": "0 0 1 * *",
      "@WEEKLY": "0 0 * * 0",
      "@DAILY": "0 0 * * *",
      "@HOURLY": "0 * * * *"
    };
    var FIELDS = {
      s: [0, 0, 59],
      m: [1, 0, 59],
      h: [2, 0, 23],
      D: [3, 1, 31],
      M: [4, 1, 12],
      Y: [6, 1970, 2099],
      d: [5, 1, 7, 1]
    };
    function getValue(value, offset, max) {
      return isNaN(value) ? NAMES[value] || null : Math.min(+value + (offset || 0), max || 9999);
    }
    function cloneSchedule(sched) {
      var clone = {}, field;
      for (field in sched) {
        if (field !== "dc" && field !== "d") {
          clone[field] = sched[field].slice(0);
        }
      }
      return clone;
    }
    function add(sched, name, min, max, inc) {
      var i = min;
      if (!sched[name]) {
        sched[name] = [];
      }
      while (i <= max) {
        if (sched[name].indexOf(i) < 0) {
          sched[name].push(i);
        }
        i += inc || 1;
      }
      sched[name].sort(function(a, b) {
        return a - b;
      });
    }
    function addHash(schedules, curSched, value, hash) {
      if (curSched.d && !curSched.dc || curSched.dc && curSched.dc.indexOf(hash) < 0) {
        schedules.push(cloneSchedule(curSched));
        curSched = schedules[schedules.length - 1];
      }
      add(curSched, "d", value, value);
      add(curSched, "dc", hash, hash);
    }
    function addWeekday(s, curSched, value) {
      var except1 = {}, except2 = {};
      if (value === 1) {
        add(curSched, "D", 1, 3);
        add(curSched, "d", NAMES.MON, NAMES.FRI);
        add(except1, "D", 2, 2);
        add(except1, "d", NAMES.TUE, NAMES.FRI);
        add(except2, "D", 3, 3);
        add(except2, "d", NAMES.TUE, NAMES.FRI);
      } else {
        add(curSched, "D", value - 1, value + 1);
        add(curSched, "d", NAMES.MON, NAMES.FRI);
        add(except1, "D", value - 1, value - 1);
        add(except1, "d", NAMES.MON, NAMES.THU);
        add(except2, "D", value + 1, value + 1);
        add(except2, "d", NAMES.TUE, NAMES.FRI);
      }
      s.exceptions.push(except1);
      s.exceptions.push(except2);
    }
    function addRange(item, curSched, name, min, max, offset) {
      var incSplit = item.split("/"), inc = +incSplit[1], range = incSplit[0];
      if (range !== "*" && range !== "0") {
        var rangeSplit = range.split("-");
        min = getValue(rangeSplit[0], offset, max);
        max = getValue(rangeSplit[1], offset, max) || max;
      }
      add(curSched, name, min, max, inc);
    }
    function parse(item, s, name, min, max, offset) {
      var value, split2, schedules = s.schedules, curSched = schedules[schedules.length - 1];
      if (item === "L") {
        item = min - 1;
      }
      if ((value = getValue(item, offset, max)) !== null) {
        add(curSched, name, value, value);
      } else if ((value = getValue(item.replace("W", ""), offset, max)) !== null) {
        addWeekday(s, curSched, value);
      } else if ((value = getValue(item.replace("L", ""), offset, max)) !== null) {
        addHash(schedules, curSched, value, min - 1);
      } else if ((split2 = item.split("#")).length === 2) {
        value = getValue(split2[0], offset, max);
        addHash(schedules, curSched, value, getValue(split2[1]));
      } else {
        addRange(item, curSched, name, min, max, offset);
      }
    }
    function isHash(item) {
      return item.indexOf("#") > -1 || item.indexOf("L") > 0;
    }
    function itemSorter(a, b) {
      return isHash(a) && !isHash(b) ? 1 : a - b;
    }
    function parseExpr(expr2) {
      var schedule = {
        schedules: [{}],
        exceptions: []
      }, components = expr2.replace(/(\s)+/g, " ").split(" "), field, f, component, items;
      for (field in FIELDS) {
        f = FIELDS[field];
        component = components[f[0]];
        if (component && component !== "*" && component !== "?") {
          items = component.split(",").sort(itemSorter);
          var i, length = items.length;
          for (i = 0; i < length; i++) {
            parse(items[i], schedule, field, f[1], f[2], f[3]);
          }
        }
      }
      return schedule;
    }
    function prepareExpr(expr2) {
      var prepared = expr2.toUpperCase();
      return REPLACEMENTS[prepared] || prepared;
    }
    var e = prepareExpr(expr);
    return parseExpr(hasSeconds ? e : "0 " + e);
  };
  later2.parse.recur = function() {
    var schedules = [], exceptions = [], cur, curArr = schedules, curName, values, every2, modifier, applyMin, applyMax, i, last;
    function add(name, min, max) {
      name = modifier ? name + "_" + modifier : name;
      if (!cur) {
        curArr.push({});
        cur = curArr[0];
      }
      if (!cur[name]) {
        cur[name] = [];
      }
      curName = cur[name];
      if (every2) {
        values = [];
        for (i = min; i <= max; i += every2) {
          values.push(i);
        }
        last = {
          n: name,
          x: every2,
          c: curName.length,
          m: max
        };
      }
      values = applyMin ? [min] : applyMax ? [max] : values;
      var length = values.length;
      for (i = 0; i < length; i += 1) {
        var val = values[i];
        if (curName.indexOf(val) < 0) {
          curName.push(val);
        }
      }
      values = every2 = modifier = applyMin = applyMax = 0;
    }
    return {
      schedules,
      exceptions,
      on: function() {
        values = arguments[0] instanceof Array ? arguments[0] : arguments;
        return this;
      },
      every: function(x) {
        every2 = x || 1;
        return this;
      },
      after: function(x) {
        modifier = "a";
        values = [x];
        return this;
      },
      before: function(x) {
        modifier = "b";
        values = [x];
        return this;
      },
      first: function() {
        applyMin = 1;
        return this;
      },
      last: function() {
        applyMax = 1;
        return this;
      },
      time: function() {
        for (var i2 = 0, len = values.length; i2 < len; i2++) {
          var split2 = values[i2].split(":");
          if (split2.length < 3)
            split2.push(0);
          values[i2] = +split2[0] * 3600 + +split2[1] * 60 + +split2[2];
        }
        add("t");
        return this;
      },
      second: function() {
        add("s", 0, 59);
        return this;
      },
      minute: function() {
        add("m", 0, 59);
        return this;
      },
      hour: function() {
        add("h", 0, 23);
        return this;
      },
      dayOfMonth: function() {
        add("D", 1, applyMax ? 0 : 31);
        return this;
      },
      dayOfWeek: function() {
        add("d", 1, 7);
        return this;
      },
      onWeekend: function() {
        values = [1, 7];
        return this.dayOfWeek();
      },
      onWeekday: function() {
        values = [2, 3, 4, 5, 6];
        return this.dayOfWeek();
      },
      dayOfWeekCount: function() {
        add("dc", 1, applyMax ? 0 : 5);
        return this;
      },
      dayOfYear: function() {
        add("dy", 1, applyMax ? 0 : 366);
        return this;
      },
      weekOfMonth: function() {
        add("wm", 1, applyMax ? 0 : 5);
        return this;
      },
      weekOfYear: function() {
        add("wy", 1, applyMax ? 0 : 53);
        return this;
      },
      month: function() {
        add("M", 1, 12);
        return this;
      },
      year: function() {
        add("Y", 1970, 2450);
        return this;
      },
      fullDate: function() {
        for (var i2 = 0, len = values.length; i2 < len; i2++) {
          values[i2] = values[i2].getTime();
        }
        add("fd");
        return this;
      },
      customModifier: function(id, vals) {
        var custom = later2.modifier[id];
        if (!custom)
          throw new Error("Custom modifier " + id + " not recognized!");
        modifier = id;
        values = arguments[1] instanceof Array ? arguments[1] : [arguments[1]];
        return this;
      },
      customPeriod: function(id) {
        var custom = later2[id];
        if (!custom)
          throw new Error("Custom time period " + id + " not recognized!");
        add(id, custom.extent(/* @__PURE__ */ new Date())[0], custom.extent(/* @__PURE__ */ new Date())[1]);
        return this;
      },
      startingOn: function(start) {
        return this.between(start, last.m);
      },
      between: function(start, end) {
        cur[last.n] = cur[last.n].splice(0, last.c);
        every2 = last.x;
        add(last.n, start, end);
        return this;
      },
      and: function() {
        cur = curArr[curArr.push({}) - 1];
        return this;
      },
      except: function() {
        curArr = exceptions;
        cur = null;
        return this;
      }
    };
  };
  later2.parse.text = function(str) {
    var recur = later2.parse.recur, pos = 0, input = "", error;
    var TOKENTYPES = {
      eof: /^$/,
      fullDate: /^(\d\d\d\d-\d\d-\d\dt\d\d:\d\d:\d\d)\b/,
      rank: /^((\d\d\d\d)|([2-5]?1(st)?|[2-5]?2(nd)?|[2-5]?3(rd)?|(0|[1-5]?[4-9]|[1-5]0|1[1-3])(th)?))\b/,
      time: /^((([0]?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|(([0]?\d|1\d|2[0-3]):[0-5]\d))\b/,
      dayName: /^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,
      monthName: /^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,
      yearIndex: /^(\d\d\d\d)\b/,
      every: /^every\b/,
      after: /^after\b/,
      before: /^before\b/,
      second: /^(s|sec(ond)?(s)?)\b/,
      minute: /^(m|min(ute)?(s)?)\b/,
      hour: /^(h|hour(s)?)\b/,
      day: /^(day(s)?( of the month)?)\b/,
      dayInstance: /^day instance\b/,
      dayOfWeek: /^day(s)? of the week\b/,
      dayOfYear: /^day(s)? of the year\b/,
      weekOfYear: /^week(s)?( of the year)?\b/,
      weekOfMonth: /^week(s)? of the month\b/,
      weekday: /^weekday\b/,
      weekend: /^weekend\b/,
      month: /^month(s)?\b/,
      year: /^year(s)?\b/,
      between: /^between (the)?\b/,
      start: /^(start(ing)? (at|on( the)?)?)\b/,
      at: /^(at|@)\b/,
      and: /^(,|and\b)/,
      except: /^(except\b)/,
      also: /(also)\b/,
      first: /^(first)\b/,
      last: /^last\b/,
      "in": /^in\b/,
      of: /^of\b/,
      onthe: /^on the\b/,
      on: /^on\b/,
      through: /(-|^(to|through)\b)/
    };
    var NAMES = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
      sun: 1,
      mon: 2,
      tue: 3,
      wed: 4,
      thu: 5,
      fri: 6,
      sat: 7,
      "1st": 1,
      fir: 1,
      "2nd": 2,
      sec: 2,
      "3rd": 3,
      thi: 3,
      "4th": 4,
      "for": 4
    };
    function t(start, end, text, type) {
      return {
        startPos: start,
        endPos: end,
        text,
        type
      };
    }
    function peek(expected) {
      var scanTokens = expected instanceof Array ? expected : [expected], whiteSpace = /\s+/, token, curInput, m, scanToken, start, len;
      scanTokens.push(whiteSpace);
      start = pos;
      while (!token || token.type === whiteSpace) {
        len = -1;
        curInput = input.substring(start);
        token = t(start, start, input.split(whiteSpace)[0]);
        var i, length = scanTokens.length;
        for (i = 0; i < length; i++) {
          scanToken = scanTokens[i];
          m = scanToken.exec(curInput);
          if (m && m.index === 0 && m[0].length > len) {
            len = m[0].length;
            token = t(start, start + len, curInput.substring(0, len), scanToken);
          }
        }
        if (token.type === whiteSpace) {
          start = token.endPos;
        }
      }
      return token;
    }
    function scan(expectedToken) {
      var token = peek(expectedToken);
      pos = token.endPos;
      return token;
    }
    function parseThroughExpr(tokenType) {
      var start = +parseTokenValue(tokenType), end = checkAndParse(TOKENTYPES.through) ? +parseTokenValue(tokenType) : start, nums = [];
      for (var i = start; i <= end; i++) {
        nums.push(i);
      }
      return nums;
    }
    function parseRanges(tokenType) {
      var nums = parseThroughExpr(tokenType);
      while (checkAndParse(TOKENTYPES.and)) {
        nums.push.apply(nums, parseThroughExpr(tokenType));
      }
      if (tokenType === TOKENTYPES.dayName) {
        nums.sort((a, b) => a - b);
      }
      return nums;
    }
    function parseEvery(r) {
      var num, period, start, end;
      if (checkAndParse(TOKENTYPES.weekend)) {
        r.on(NAMES.sun, NAMES.sat).dayOfWeek();
      } else if (checkAndParse(TOKENTYPES.weekday)) {
        r.on(NAMES.mon, NAMES.tue, NAMES.wed, NAMES.thu, NAMES.fri).dayOfWeek();
      } else {
        num = parseTokenValue(TOKENTYPES.rank);
        r.every(num);
        period = parseTimePeriod(r);
        if (checkAndParse(TOKENTYPES.start)) {
          num = parseTokenValue(TOKENTYPES.rank);
          r.startingOn(num);
          parseToken(period.type);
        } else if (checkAndParse(TOKENTYPES.between)) {
          start = parseTokenValue(TOKENTYPES.rank);
          if (checkAndParse(TOKENTYPES.and)) {
            end = parseTokenValue(TOKENTYPES.rank);
            r.between(start, end);
          }
        }
      }
    }
    function parseOnThe(r) {
      if (checkAndParse(TOKENTYPES.first)) {
        r.first();
      } else if (checkAndParse(TOKENTYPES.last)) {
        r.last();
      } else {
        r.on(parseRanges(TOKENTYPES.rank));
      }
      parseTimePeriod(r);
    }
    function parseScheduleExpr(str2) {
      pos = 0;
      input = str2;
      error = -1;
      var r = recur();
      while (pos < input.length && error < 0) {
        var token = parseToken([TOKENTYPES.every, TOKENTYPES.after, TOKENTYPES.before, TOKENTYPES.onthe, TOKENTYPES.on, TOKENTYPES.of, TOKENTYPES["in"], TOKENTYPES.at, TOKENTYPES.and, TOKENTYPES.except, TOKENTYPES.also]);
        switch (token.type) {
          case TOKENTYPES.every:
            parseEvery(r);
            break;
          case TOKENTYPES.after:
            if (peek(TOKENTYPES.time).type !== void 0) {
              r.after(parseTokenValue(TOKENTYPES.time));
              r.time();
            } else if (peek(TOKENTYPES.fullDate).type !== void 0) {
              r.after(parseTokenValue(TOKENTYPES.fullDate));
              r.fullDate();
            } else {
              r.after(parseTokenValue(TOKENTYPES.rank));
              parseTimePeriod(r);
            }
            break;
          case TOKENTYPES.before:
            if (peek(TOKENTYPES.time).type !== void 0) {
              r.before(parseTokenValue(TOKENTYPES.time));
              r.time();
            } else if (peek(TOKENTYPES.fullDate).type !== void 0) {
              r.before(parseTokenValue(TOKENTYPES.fullDate));
              r.fullDate();
            } else {
              r.before(parseTokenValue(TOKENTYPES.rank));
              parseTimePeriod(r);
            }
            break;
          case TOKENTYPES.onthe:
            parseOnThe(r);
            break;
          case TOKENTYPES.on:
            r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek();
            break;
          case TOKENTYPES.of:
            r.on(parseRanges(TOKENTYPES.monthName)).month();
            break;
          case TOKENTYPES["in"]:
            r.on(parseRanges(TOKENTYPES.yearIndex)).year();
            break;
          case TOKENTYPES.at:
            r.on(parseTokenValue(TOKENTYPES.time)).time();
            while (checkAndParse(TOKENTYPES.and)) {
              r.on(parseTokenValue(TOKENTYPES.time)).time();
            }
            break;
          case TOKENTYPES.and:
            break;
          case TOKENTYPES.also:
            r.and();
            break;
          case TOKENTYPES.except:
            r.except();
            break;
          default:
            error = pos;
        }
      }
      return {
        schedules: r.schedules,
        exceptions: r.exceptions,
        error
      };
    }
    function parseTimePeriod(r) {
      var timePeriod = parseToken([TOKENTYPES.second, TOKENTYPES.minute, TOKENTYPES.hour, TOKENTYPES.dayOfYear, TOKENTYPES.dayOfWeek, TOKENTYPES.dayInstance, TOKENTYPES.day, TOKENTYPES.month, TOKENTYPES.year, TOKENTYPES.weekOfMonth, TOKENTYPES.weekOfYear]);
      switch (timePeriod.type) {
        case TOKENTYPES.second:
          r.second();
          break;
        case TOKENTYPES.minute:
          r.minute();
          break;
        case TOKENTYPES.hour:
          r.hour();
          break;
        case TOKENTYPES.dayOfYear:
          r.dayOfYear();
          break;
        case TOKENTYPES.dayOfWeek:
          r.dayOfWeek();
          break;
        case TOKENTYPES.dayInstance:
          r.dayOfWeekCount();
          break;
        case TOKENTYPES.day:
          r.dayOfMonth();
          break;
        case TOKENTYPES.weekOfMonth:
          r.weekOfMonth();
          break;
        case TOKENTYPES.weekOfYear:
          r.weekOfYear();
          break;
        case TOKENTYPES.month:
          r.month();
          break;
        case TOKENTYPES.year:
          r.year();
          break;
        default:
          error = pos;
      }
      return timePeriod;
    }
    function checkAndParse(tokenType) {
      var found = peek(tokenType).type === tokenType;
      if (found) {
        scan(tokenType);
      }
      return found;
    }
    function parseToken(tokenType) {
      var t2 = scan(tokenType);
      if (t2.type) {
        t2.text = convertString(t2.text, tokenType);
      } else {
        error = pos;
      }
      return t2;
    }
    function parseTokenValue(tokenType) {
      return parseToken(tokenType).text;
    }
    function convertString(str2, tokenType) {
      var output = str2;
      switch (tokenType) {
        case TOKENTYPES.time:
          var parts = str2.split(/(:|am|pm)/), hour = parts[3] === "pm" && parts[0] < 12 ? parseInt(parts[0], 10) + 12 : parts[0], min = parts[2].trim();
          output = (hour.length === 1 ? "0" : "") + hour + ":" + min;
          break;
        case TOKENTYPES.rank:
          output = parseInt(/^\d+/.exec(str2)[0], 10);
          break;
        case TOKENTYPES.monthName:
        case TOKENTYPES.dayName:
          output = NAMES[str2.substring(0, 3)];
          break;
        case TOKENTYPES.fullDate:
          output = new Date(str2.toUpperCase());
          break;
      }
      return output;
    }
    return parseScheduleExpr(str.toLowerCase());
  };
  return later2;
}();
later.date.localTime();
var later_default = later;

// ../Engine/lib/Engine/calendar/CalendarIntervalMixin.js
var CalendarIntervalMixin = class extends Mixin([AbstractPartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CalendarIntervalMixin2 extends base {
    static get fields() {
      return [
        "name",
        { name: "startDate", type: "date" },
        { name: "endDate", type: "date" },
        "recurrentStartDate",
        "recurrentEndDate",
        "cls",
        "iconCls",
        { name: "isWorking", type: "boolean", defaultValue: false },
        { name: "priority", type: "number" }
      ];
    }
    getCalendar() {
      return this.stores[0].calendar;
    }
    resetPriority() {
      this.priorityField = null;
      this.getCalendar().getDepth();
    }
    // not just `getPriority` to avoid clash with auto-generated getter in the subclasses
    getPriorityField() {
      if (this.priorityField != null)
        return this.priorityField;
      let base2 = 1e4 + this.getCalendar().getDepth() * 100;
      let priority = this.priority;
      if (priority == null) {
        priority = this.isRecurrent() ? 20 : 30;
      }
      return this.priorityField = base2 + priority;
    }
    /**
     * Whether this interval is recurrent (both [[recurrentStartDate]] and [[recurrentEndDate]] are present and parsed correctly
     * by the `later` library)
     */
    isRecurrent() {
      return Boolean(this.recurrentStartDate && this.recurrentEndDate && this.getStartDateSchedule() && this.getEndDateSchedule());
    }
    /**
     * Whether this interval is static - both [[startDate]] and [[endDate]] are present.
     */
    isStatic() {
      return Boolean(this.startDate && this.endDate);
    }
    /**
     * Helper method to parse [[recurrentStartDate]] and [[recurrentEndDate]] field values.
     * @param {Object|String} schedule Recurrence schedule
     * @returns {Object} Processed schedule ready to be used by later.schedule() method.
     * @private
     */
    parseDateSchedule(value) {
      let schedule = value;
      if (value && value !== Object(value)) {
        schedule = later_default.parse.text(value);
        if (schedule !== Object(schedule) || schedule.error >= 0) {
          try {
            schedule = JSON.parse(value);
          } catch (e) {
            return null;
          }
        }
      }
      return schedule;
    }
    getStartDateSchedule() {
      if (this.startDateSchedule)
        return this.startDateSchedule;
      const schedule = this.parseDateSchedule(this.recurrentStartDate);
      return this.startDateSchedule = later_default.schedule(schedule);
    }
    getEndDateSchedule() {
      if (this.endDateSchedule)
        return this.endDateSchedule;
      if (this.recurrentEndDate === "EOD")
        return "EOD";
      const schedule = this.parseDateSchedule(this.recurrentEndDate);
      return this.endDateSchedule = later_default.schedule(schedule);
    }
  }
  return CalendarIntervalMixin2;
}) {
};

// ../Engine/lib/Engine/calendar/CalendarIntervalStore.js
var CalendarIntervalStore = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CalendarIntervalStore2 extends base {
    constructor() {
      super(...arguments);
      this.disableHasLoadedDataToCommitFlag = true;
    }
    static get defaultConfig() {
      return {
        modelClass: CalendarIntervalMixin
      };
    }
  }
  return CalendarIntervalStore2;
}) {
};

// ../Engine/lib/Engine/scheduling/Types.js
var TimeUnit;
(function(TimeUnit2) {
  TimeUnit2["Millisecond"] = "millisecond";
  TimeUnit2["Second"] = "second";
  TimeUnit2["Minute"] = "minute";
  TimeUnit2["Hour"] = "hour";
  TimeUnit2["Day"] = "day";
  TimeUnit2["Week"] = "week";
  TimeUnit2["Month"] = "month";
  TimeUnit2["Quarter"] = "quarter";
  TimeUnit2["Year"] = "year";
})(TimeUnit || (TimeUnit = {}));
var ProjectConstraintResolution;
(function(ProjectConstraintResolution2) {
  ProjectConstraintResolution2["Honor"] = "honor";
  ProjectConstraintResolution2["Ignore"] = "ignore";
  ProjectConstraintResolution2["Conflict"] = "conflict";
})(ProjectConstraintResolution || (ProjectConstraintResolution = {}));
var ConstraintType;
(function(ConstraintType2) {
  ConstraintType2["MustStartOn"] = "muststarton";
  ConstraintType2["MustFinishOn"] = "mustfinishon";
  ConstraintType2["StartNoEarlierThan"] = "startnoearlierthan";
  ConstraintType2["StartNoLaterThan"] = "startnolaterthan";
  ConstraintType2["FinishNoEarlierThan"] = "finishnoearlierthan";
  ConstraintType2["FinishNoLaterThan"] = "finishnolaterthan";
  ConstraintType2["AsSoonAsPossible"] = "assoonaspossible";
  ConstraintType2["AsLateAsPossible"] = "aslateaspossible";
})(ConstraintType || (ConstraintType = {}));
var SchedulingMode;
(function(SchedulingMode2) {
  SchedulingMode2["Normal"] = "Normal";
  SchedulingMode2["FixedDuration"] = "FixedDuration";
  SchedulingMode2["FixedEffort"] = "FixedEffort";
  SchedulingMode2["FixedUnits"] = "FixedUnits";
})(SchedulingMode || (SchedulingMode = {}));
var DependencyValidationResult;
(function(DependencyValidationResult2) {
  DependencyValidationResult2[DependencyValidationResult2["NoError"] = 0] = "NoError";
  DependencyValidationResult2[DependencyValidationResult2["CyclicDependency"] = 1] = "CyclicDependency";
  DependencyValidationResult2[DependencyValidationResult2["DuplicatingDependency"] = 2] = "DuplicatingDependency";
})(DependencyValidationResult || (DependencyValidationResult = {}));
var DependencyType;
(function(DependencyType2) {
  DependencyType2[DependencyType2["StartToStart"] = 0] = "StartToStart";
  DependencyType2[DependencyType2["StartToEnd"] = 1] = "StartToEnd";
  DependencyType2[DependencyType2["EndToStart"] = 2] = "EndToStart";
  DependencyType2[DependencyType2["EndToEnd"] = 3] = "EndToEnd";
})(DependencyType || (DependencyType = {}));
var DependenciesCalendar;
(function(DependenciesCalendar2) {
  DependenciesCalendar2["Project"] = "Project";
  DependenciesCalendar2["FromEvent"] = "FromEvent";
  DependenciesCalendar2["ToEvent"] = "ToEvent";
})(DependenciesCalendar || (DependenciesCalendar = {}));
var ProjectType;
(function(ProjectType2) {
  ProjectType2[ProjectType2["SchedulerBasic"] = 1] = "SchedulerBasic";
  ProjectType2[ProjectType2["SchedulerPro"] = 2] = "SchedulerPro";
  ProjectType2[ProjectType2["Gantt"] = 3] = "Gantt";
})(ProjectType || (ProjectType = {}));
var Direction;
(function(Direction2) {
  Direction2["Forward"] = "Forward";
  Direction2["Backward"] = "Backward";
  Direction2["None"] = "None";
})(Direction || (Direction = {}));
var isEqualEffectiveDirection = (a, b) => {
  if (a && !b || !a && b)
    return false;
  if (!a && !b)
    return true;
  return a.direction === b.direction && (a.kind === "own" && b.kind === "own" || a.kind === "enforced" && b.kind === "enforced" && a.enforcedBy === b.enforcedBy || a.kind === "inherited" && b.kind === "inherited" && a.inheritedFrom === b.inheritedFrom);
};
var ConstraintIntervalSide;
(function(ConstraintIntervalSide2) {
  ConstraintIntervalSide2["Start"] = "Start";
  ConstraintIntervalSide2["End"] = "End";
})(ConstraintIntervalSide || (ConstraintIntervalSide = {}));

// ../Engine/lib/Engine/util/Constants.js
var MIN_DATE = /* @__PURE__ */ new Date(-864e13);
var MAX_DATE = /* @__PURE__ */ new Date(864e13);
var isDateFinite = (date) => {
  if (!date)
    return false;
  const time = date.getTime();
  return time !== MIN_DATE.getTime() && time !== MAX_DATE.getTime();
};

// ../Engine/lib/Engine/util/Types.js
var EdgeInclusion;
(function(EdgeInclusion2) {
  EdgeInclusion2[EdgeInclusion2["Left"] = 0] = "Left";
  EdgeInclusion2[EdgeInclusion2["Right"] = 1] = "Right";
})(EdgeInclusion || (EdgeInclusion = {}));

// ../Engine/lib/Engine/calendar/CalendarCache.js
var CalendarIteratorResult;
(function(CalendarIteratorResult2) {
  CalendarIteratorResult2[CalendarIteratorResult2["FullRangeIterated"] = 0] = "FullRangeIterated";
  CalendarIteratorResult2[CalendarIteratorResult2["StoppedByIterator"] = 1] = "StoppedByIterator";
  CalendarIteratorResult2[CalendarIteratorResult2["MaxCacheExtendCyclesReached"] = 2] = "MaxCacheExtendCyclesReached";
  CalendarIteratorResult2[CalendarIteratorResult2["MaxRangeReached"] = 3] = "MaxRangeReached";
})(CalendarIteratorResult || (CalendarIteratorResult = {}));
var CalendarCache = class {
  constructor(config) {
    this.cacheFilledStartDate = MAX_DATE;
    this.cacheFilledEndDate = MIN_DATE;
    this.intervalsCachingChunkDuration = 30;
    this.intervalsCachingChunkUnit = TimeUnit.Day;
    this.maxCacheExtendCycles = 1e3;
    this.maxRange = 5 * 365 * 24 * 60 * 60 * 1e3;
    config && Object.assign(this, config);
  }
  includeWrappingRangeFrom(cache, startDate, endDate) {
    cache.ensureCacheFilledForInterval(startDate, endDate);
    this.intervalCache.includeWrappingRange(cache.intervalCache, startDate, endDate);
  }
  // after this method, we guarantee, that for every point between `startDate` and `endDate` (_inclusive_)
  // we'll have a final representation of the cache, that is, we'll be able to get an interval to which this point belongs
  // _both_ for forward and backward directions
  ensureCacheFilledForInterval(startDate, endDate) {
    const cacheFilledStartDateN = this.cacheFilledStartDate.getTime();
    const cacheFilledEndDateN = this.cacheFilledEndDate.getTime();
    if (cacheFilledStartDateN !== MAX_DATE.getTime()) {
      const startDateN = startDate.getTime();
      const endDateN = endDate.getTime();
      if (cacheFilledStartDateN <= startDateN && endDateN <= cacheFilledEndDateN)
        return;
      if (endDateN <= cacheFilledStartDateN) {
        endDate = new Date(cacheFilledStartDateN - 1);
      } else if (startDateN >= cacheFilledEndDateN) {
        startDate = new Date(cacheFilledEndDateN);
      } else if (cacheFilledStartDateN <= startDateN && startDateN <= cacheFilledEndDateN) {
        startDate = new Date(cacheFilledEndDateN + 1);
      } else if (cacheFilledStartDateN <= endDateN && endDateN <= cacheFilledEndDateN) {
        endDate = new Date(cacheFilledStartDateN - 1);
      } else {
        this.ensureCacheFilledForInterval(startDate, new Date(cacheFilledStartDateN - 1));
        this.ensureCacheFilledForInterval(new Date(cacheFilledEndDateN + 1), endDate);
        return;
      }
    }
    if (cacheFilledStartDateN === MAX_DATE.getTime() || startDate.getTime() < cacheFilledEndDateN) {
      this.cacheFilledStartDate = startDate;
    }
    if (cacheFilledEndDateN === MIN_DATE.getTime() || cacheFilledEndDateN < endDate.getTime()) {
      this.cacheFilledEndDate = endDate;
    }
    this.fillCache(startDate, endDate);
  }
  fillCache(_1, _2) {
    throw new Error("Abstract method");
  }
  clear() {
    this.cacheFilledStartDate = MAX_DATE;
    this.cacheFilledEndDate = MIN_DATE;
    this.intervalCache.clear();
  }
  /**
   * The core iterator method of the calendar cache.
   *
   * @param options The options for iterator. Should contain at least one of the `startDate`/`endDate` properties
   * which indicates what timespan to examine for availability intervals. If one of boundaries is not provided
   * iterator function should return `false` at some point, to avoid infinite loops.
   *
   * Another recognized option is `isForward`, which indicates the direction in which to iterate through the timespan.
   *
   * Another recognized option is `maxRange`, which indicates the maximum timespan for this iterator (in milliseconds). When iterator
   * exceeds this timespan, the iteration is stopped and [[CalendarIteratorResult.MaxRangeReached]] value is returned.
   * Default value is 5 years.
   *
   * @param func The iterator function to call. It will be called for every distinct set of availability intervals, found
   * in the given timespan. All the intervals, which are "active" for current interval are collected in the 3rd argument
   * for this function. If iterator returns `false` (checked with `===`) the iteration stops.
   *
   * @param scope The scope (`this` value) to execute the iterator in.
   */
  forEachAvailabilityInterval(options, func, scope) {
    var _a;
    scope = scope || this;
    const startDate = options.startDate;
    const endDate = options.endDate;
    const startDateN = startDate && startDate.getTime();
    const endDateN = endDate && endDate.getTime();
    const maxRange = (_a = options.maxRange) != null ? _a : this.maxRange;
    const isForward = options.isForward !== false;
    if (isForward ? !startDate : !endDate) {
      throw new Error("At least `startDate` or `endDate` is required, depending from the `isForward` option");
    }
    const intervalCache = this.intervalCache;
    let cacheCursorDate = isForward ? startDate : endDate;
    let cursorDate = isForward ? startDate : endDate;
    const rangeStart = cursorDate.getTime();
    for (let cycle = 1; cycle < this.maxCacheExtendCycles; cycle++) {
      if (isForward) {
        this.ensureCacheFilledForInterval(cacheCursorDate, endDate || DateHelper.add(cacheCursorDate, this.intervalsCachingChunkDuration, this.intervalsCachingChunkUnit));
      } else {
        this.ensureCacheFilledForInterval(startDate || DateHelper.add(cacheCursorDate, -this.intervalsCachingChunkDuration, this.intervalsCachingChunkUnit), cacheCursorDate);
      }
      let interval = intervalCache.getIntervalOf(cursorDate, isForward ? EdgeInclusion.Left : EdgeInclusion.Right);
      while (interval) {
        const intervalStartDate = interval.startDate;
        const intervalEndDate = interval.endDate;
        if (isForward && endDateN && intervalStartDate.getTime() >= endDateN || !isForward && startDateN && intervalEndDate.getTime() <= startDateN) {
          return CalendarIteratorResult.FullRangeIterated;
        }
        if (isForward && intervalStartDate.getTime() - rangeStart >= maxRange || !isForward && rangeStart - intervalEndDate.getTime() >= maxRange) {
          return CalendarIteratorResult.MaxRangeReached;
        }
        if (isForward && intervalStartDate.getTime() >= this.cacheFilledEndDate.getTime() || !isForward && intervalEndDate.getTime() <= this.cacheFilledStartDate.getTime()) {
          break;
        }
        cursorDate = isForward ? intervalEndDate : intervalStartDate;
        const countFrom = startDateN && intervalStartDate.getTime() < startDateN ? startDate : intervalStartDate;
        const countTill = endDateN && intervalEndDate.getTime() > endDateN ? endDate : intervalEndDate;
        if (func.call(scope, countFrom, countTill, interval.cacheInterval) === false) {
          return CalendarIteratorResult.StoppedByIterator;
        }
        interval = isForward ? intervalCache.getNextInterval(interval) : intervalCache.getPrevInterval(interval);
      }
      if (isForward && cursorDate.getTime() === MAX_DATE.getTime() || !isForward && cursorDate.getTime() === MIN_DATE.getTime()) {
        return CalendarIteratorResult.FullRangeIterated;
      }
      cacheCursorDate = isForward ? this.cacheFilledEndDate : this.cacheFilledStartDate;
    }
    return CalendarIteratorResult.MaxCacheExtendCyclesReached;
  }
};

// ../Engine/lib/Engine/util/StripDuplicates.js
var stripDuplicates = (array) => Array.from(new Set(array));

// ../Engine/lib/Engine/calendar/CalendarCacheInterval.js
var CalendarCacheInterval = class _CalendarCacheInterval {
  constructor(config) {
    this.intervals = [];
    config && Object.assign(this, config);
    if (!this.calendar)
      throw new Error("Required attribute `calendar` is missing");
  }
  includeInterval(interval) {
    if (this.intervals.indexOf(interval) == -1) {
      const copy = this.intervals.slice();
      copy.push(interval);
      return new _CalendarCacheInterval({ intervals: copy, calendar: this.calendar });
    } else
      return this;
  }
  combineWith(interval) {
    return new _CalendarCacheInterval({ intervals: this.intervals.concat(interval.intervals), calendar: this.calendar });
  }
  /**
   * Returns the working status of this intervals set. It is determined as a working status
   * of the most prioritized interval (intervals are prioritized from child to parent)
   */
  getIsWorking() {
    if (this.isWorking != null)
      return this.isWorking;
    const intervals = this.intervals = this.normalizeIntervals(this.intervals);
    return this.isWorking = intervals[0].isWorking;
  }
  normalizeIntervals(intervals) {
    const filtered = stripDuplicates(intervals);
    filtered.sort((interval1, interval2) => interval2.getPriorityField() - interval1.getPriorityField());
    return filtered;
  }
};

// ../Engine/lib/Engine/util/BinarySearch.js
var binarySearch = (value, array, comparator = (a, b) => a - b) => {
  let left = 0;
  let right = array.length;
  while (left < right) {
    const mid = (left + right) / 2 | 0;
    const compare = comparator(value, array[mid]);
    if (compare === 0)
      return { found: true, index: mid };
    else if (compare < 0)
      right = mid;
    else
      left = mid + 1;
  }
  return { found: false, index: right };
};

// ../Engine/lib/Engine/calendar/SortedMap.js
var IndexPosition;
(function(IndexPosition2) {
  IndexPosition2[IndexPosition2["Exact"] = 0] = "Exact";
  IndexPosition2[IndexPosition2["Next"] = 1] = "Next";
})(IndexPosition || (IndexPosition = {}));
var SortedMap = class {
  constructor(comparator) {
    this.keys = [];
    this.values = [];
    this.comparator = comparator || ((a, b) => a - b);
  }
  set(key, value) {
    const search = binarySearch(key, this.keys, this.comparator);
    if (search.found) {
      this.values[search.index] = value;
    } else {
      this.keys.splice(search.index, 0, key);
      this.values.splice(search.index, 0, value);
    }
    return search.index;
  }
  // you need to know what you are doing when using this method
  insertAt(index, key, value) {
    this.keys.splice(index, 0, key);
    this.values.splice(index, 0, value);
  }
  setValueAt(index, value) {
    this.values[index] = value;
  }
  get(key) {
    const search = binarySearch(key, this.keys, this.comparator);
    return search.found ? this.values[search.index] : void 0;
  }
  getEntryAt(index) {
    return index < this.keys.length ? { key: this.keys[index], value: this.values[index] } : void 0;
  }
  getKeyAt(index) {
    return this.keys[index];
  }
  getValueAt(index) {
    return this.values[index];
  }
  delete(key) {
    const search = binarySearch(key, this.keys, this.comparator);
    if (search.found)
      this.deleteAt(search.index);
  }
  size() {
    return this.keys.length;
  }
  deleteAt(index) {
    this.keys.splice(index, 1);
    this.values.splice(index, 1);
  }
  indexOfKey(key) {
    const search = binarySearch(key, this.keys, this.comparator);
    return {
      found: search.found ? IndexPosition.Exact : IndexPosition.Next,
      index: search.index
    };
  }
  map(func) {
    const keys = this.keys;
    const values = this.values;
    const result = [];
    for (let i = 0; i < keys.length; i++)
      result.push(func(values[i], keys[i], i));
    return result;
  }
  getAllEntries() {
    return this.map((value, key) => {
      return { value, key };
    });
  }
  clear() {
    this.keys.length = 0;
    this.values.length = 0;
  }
};

// ../Engine/lib/Engine/calendar/IntervalCache.js
var IntervalCache = class {
  constructor(config) {
    this.points = new SortedMap((a, b) => a.getTime() - b.getTime());
    this.leftInfinityKey = MIN_DATE;
    this.rightInfinityKey = MAX_DATE;
    Object.assign(this, config);
    if (this.emptyInterval === void 0 || !this.combineIntervalsFn)
      throw new Error("All of `emptyPoint`, `combineIntervalsFn` are required");
    this.points.set(this.leftInfinityKey, this.emptyInterval);
  }
  size() {
    return this.points.size();
  }
  indexOf(date) {
    return this.points.indexOfKey(date);
  }
  getDateAt(index) {
    return this.points.getKeyAt(index);
  }
  getPointAt(index) {
    return this.points.getValueAt(index);
  }
  getIntervalOf(date, edgeInclusion = EdgeInclusion.Left) {
    let { found, index } = this.indexOf(date);
    let startDateIndex;
    if (edgeInclusion === EdgeInclusion.Left) {
      startDateIndex = found === IndexPosition.Exact ? index : index - 1;
    } else {
      startDateIndex = index - 1;
    }
    return this.getIntervalWithStartDateIndex(startDateIndex);
  }
  getPrevInterval(interval) {
    if (interval.startDateIndex === 0)
      return null;
    return this.getIntervalWithStartDateIndex(interval.startDateIndex - 1);
  }
  getNextInterval(interval) {
    if (interval.startDateIndex >= this.size() - 1)
      return null;
    return this.getIntervalWithStartDateIndex(interval.startDateIndex + 1);
  }
  getIntervalWithStartDateIndex(startDateIndex) {
    return {
      startDateIndex,
      startDate: this.getDateAt(startDateIndex),
      endDate: startDateIndex + 1 < this.size() ? this.getDateAt(startDateIndex + 1) : this.rightInfinityKey,
      cacheInterval: this.getPointAt(startDateIndex)
    };
  }
  addInterval(startDate, endDate, extendInterval) {
    const points = this.points;
    const { found, index } = points.indexOfKey(startDate);
    let curIndex;
    let lastUpdatedPoint;
    if (found == IndexPosition.Exact) {
      const inclusion = extendInterval(lastUpdatedPoint = points.getValueAt(index));
      points.setValueAt(index, inclusion);
      curIndex = index + 1;
    } else {
      const inclusion = extendInterval(lastUpdatedPoint = points.getValueAt(index - 1));
      points.insertAt(index, startDate, inclusion);
      curIndex = index + 1;
    }
    while (curIndex < points.size()) {
      const curDate = points.getKeyAt(curIndex);
      if (curDate.getTime() >= endDate.getTime())
        break;
      const inclusion = extendInterval(lastUpdatedPoint = points.getValueAt(curIndex));
      points.setValueAt(curIndex, inclusion);
      curIndex++;
    }
    if (curIndex === points.size()) {
      points.insertAt(points.size(), endDate, this.emptyInterval);
    } else {
      const curDate = points.getKeyAt(curIndex);
      if (curDate.getTime() === endDate.getTime()) {
      } else {
        points.insertAt(curIndex, endDate, lastUpdatedPoint);
      }
    }
  }
  includeWrappingRange(intervalCache, startDate, endDate) {
    let interval = intervalCache.getIntervalOf(startDate);
    while (interval) {
      this.addInterval(interval.startDate, interval.endDate, (existingInterval) => this.combineIntervalsFn(existingInterval, interval.cacheInterval));
      if (interval.endDate.getTime() > endDate.getTime())
        break;
      interval = intervalCache.getNextInterval(interval);
    }
  }
  getSummary() {
    return this.points.map((label, date) => {
      return { label, date };
    });
  }
  clear() {
    this.points.clear();
    this.points.set(this.leftInfinityKey, this.emptyInterval);
  }
};

// ../Engine/lib/Engine/calendar/CalendarCacheSingle.js
var CalendarCacheSingle = class extends CalendarCache {
  constructor(config) {
    super(config);
    this.staticIntervalsCached = false;
    if (!this.unspecifiedTimeInterval)
      throw new Error("Required attribute `unspecifiedTimeInterval` is missing");
    this.intervalCache = new IntervalCache({
      emptyInterval: new CalendarCacheInterval({
        intervals: [this.unspecifiedTimeInterval],
        calendar: this.calendar
      }),
      combineIntervalsFn: (interval1, interval2) => {
        return interval1.combineWith(interval2);
      }
    });
  }
  fillCache(startDate, endDate) {
    var _a;
    if (!this.staticIntervalsCached) {
      this.cacheStaticIntervals();
      this.staticIntervalsCached = true;
    }
    if (this.parentCache)
      this.includeWrappingRangeFrom(this.parentCache, startDate, endDate);
    const startDateN = startDate.getTime();
    const endDateN = endDate.getTime();
    const timeZone = this.calendar.ignoreTimeZone ? null : (_a = this.calendar.project) == null ? void 0 : _a.timeZone;
    if (startDateN > endDateN)
      throw new Error("Invalid cache fill interval");
    const NEVER = later_default.NEVER;
    this.forEachRecurrentInterval((interval) => {
      const startSchedule = interval.getStartDateSchedule();
      const endSchedule = interval.getEndDateSchedule();
      let wrappingStartDate = startSchedule.prev(1, startDate);
      let wrappingEndDate;
      if (endSchedule === "EOD") {
        const nextEndDate = startSchedule.next(1, endDate);
        if (nextEndDate !== NEVER) {
          wrappingEndDate = DateHelper.getStartOfNextDay(nextEndDate, true);
        } else {
          wrappingEndDate = NEVER;
        }
      } else {
        wrappingEndDate = endSchedule.next(1, endDate);
      }
      if (wrappingStartDate !== NEVER && wrappingStartDate.getTime() === startDateN) {
        const wrappingStartDates = startSchedule.prev(2, startDate);
        if (wrappingStartDates !== NEVER && wrappingStartDates.length === 2)
          wrappingStartDate = wrappingStartDates[1];
      }
      if (wrappingEndDate !== NEVER && wrappingEndDate.getTime() === endDateN) {
        const wrappingEndDates = endSchedule.next(2, endDate);
        if (wrappingEndDates !== NEVER && wrappingEndDates.length === 2)
          wrappingEndDate = wrappingEndDates[1];
      }
      const startDates = startSchedule.next(Infinity, wrappingStartDate !== NEVER ? wrappingStartDate : startDate, wrappingEndDate !== NEVER ? new Date(wrappingEndDate.getTime() - 1) : endDate);
      if (startDates === NEVER)
        return;
      const endDates = endSchedule === "EOD" ? startDates.map((date) => DateHelper.getStartOfNextDay(date, true)) : endSchedule.next(Infinity, new Date(startDates[0].getTime() + 1), wrappingEndDate !== NEVER ? wrappingEndDate : endDate);
      if (endDates === NEVER)
        return;
      if (endDates.length > startDates.length) {
        endDates.length = startDates.length;
      } else if (endDates.length < startDates.length) {
        startDates.length = endDates.length;
      }
      startDates.forEach((startDate2, index) => {
        let recStartDate = startDate2;
        let recEndDate = endDates[index];
        if (timeZone != null) {
          recStartDate = TimeZoneHelper.toTimeZone(recStartDate, timeZone);
          recEndDate = TimeZoneHelper.toTimeZone(recEndDate, timeZone);
        }
        this.intervalCache.addInterval(recStartDate, recEndDate, (existingCacheInterval) => existingCacheInterval.includeInterval(interval));
      });
    });
  }
  clear() {
    this.staticIntervalsCached = false;
    super.clear();
  }
  cacheStaticIntervals() {
    this.forEachStaticInterval((interval) => {
      var _a;
      const timeZone = (_a = this.calendar.project) == null ? void 0 : _a.timeZone;
      let { startDate, endDate } = interval;
      if (timeZone != null) {
        startDate = TimeZoneHelper.toTimeZone(startDate, timeZone);
        endDate = TimeZoneHelper.toTimeZone(endDate, timeZone);
      }
      this.intervalCache.addInterval(startDate, endDate, (existingCacheInterval) => existingCacheInterval.includeInterval(interval));
    });
  }
  forEachStaticInterval(func) {
    this.intervalStore.forEach((interval) => {
      if (interval.isStatic())
        func(interval);
    });
  }
  forEachRecurrentInterval(func) {
    this.intervalStore.forEach((interval) => {
      if (interval.isRecurrent())
        func(interval);
    });
  }
};

// ../Engine/lib/Engine/calendar/UnspecifiedTimeIntervalModel.js
var UnspecifiedTimeIntervalModel = class extends Mixin([CalendarIntervalMixin], (base) => {
  const superProto = base.prototype;
  class UnspecifiedTimeIntervalModel2 extends base {
    getCalendar() {
      return this.calendar;
    }
    // NOTE: See parent class implementation for further comments
    getPriorityField() {
      if (this.priorityField != null)
        return this.priorityField;
      return this.priorityField = this.getCalendar().getDepth();
    }
  }
  return UnspecifiedTimeIntervalModel2;
}) {
};

// ../Engine/lib/Engine/quark/model/AbstractCalendarMixin.js
var AbstractCalendarMixin = class extends Mixin([AbstractPartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CalendarMixin extends base {
    constructor() {
      super(...arguments);
      this.version = 1;
    }
    static get fields() {
      return [
        { name: "version", type: "number" },
        "name",
        { name: "unspecifiedTimeIsWorking", type: "boolean", defaultValue: true },
        { name: "intervals", type: "store", subStore: true },
        "cls",
        "iconCls"
      ];
    }
    get intervalStoreClass() {
      return CalendarIntervalStore;
    }
    get intervalStore() {
      return this.meta.intervalsStore;
    }
    // Not a typo, name is generated from the fields name = intervals
    initIntervalsStore(config) {
      config.storeClass = this.intervalStoreClass;
      config.modelClass = this.getDefaultConfiguration().calendarIntervalModelClass || this.intervalStoreClass.defaultConfig.modelClass;
      config.calendar = this;
    }
    // this method is called when the new value for the `intervals` field of this model is assigned
    // the type of the `intervals` field is "store" that's why this magic
    processIntervalsStoreData(intervals) {
      this.bumpVersion();
    }
    isDefault() {
      const project = this.getProject();
      if (project) {
        return this === project.defaultCalendar;
      }
      return false;
    }
    getDepth() {
      return this.childLevel + 1;
    }
    /**
     * The core iterator method of the calendar.
     *
     * @param options The options for iterator. Should contain at least one of the `startDate`/`endDate` properties
     * which indicates what timespan to examine for availability intervals. If one of boundaries is not provided
     * iterator function should return `false` at some point, to avoid infinite loops.
     *
     * Another recognized option is `isForward`, which indicates the direction in which to iterate through the timespan.
     *
     * @param func The iterator function to call. It will be called for every distinct set of availability intervals, found
     * in the given timespan. All the intervals, which are "active" for current interval are collected in the 3rd argument
     * for this function - [[CalendarCacheInterval|calendarCacheInterval]]. If iterator returns `false` (checked with `===`)
     * the iteration stops.
     *
     * @param scope The scope (`this` value) to execute the iterator in.
     */
    forEachAvailabilityInterval(options, func, scope) {
      var _a, _b;
      const maxRange = (_b = options.maxRange) != null ? _b : (_a = this.getProject()) == null ? void 0 : _a.maxCalendarRange;
      if (maxRange) {
        options = { ...options, maxRange };
      }
      return this.calendarCache.forEachAvailabilityInterval(options, func, scope);
    }
    /**
     * This method starts at the given `date` and moves forward or backward in time, depending on `isForward`.
     * It stops moving as soon as it accumulates the `durationMs` milliseconds of working time and returns the date
     * at which it has stopped and remaining duration - the [[AccumulateWorkingTimeResult]] object.
     *
     * Normally, the remaining duration will be 0, indicating the full `durationMs` has been accumulated.
     * However, sometimes, calendar might not be able to accumulate enough working time due to various reasons,
     * like if it does not contain enough working time - this case will be indicated with remaining duration bigger than 0.
     *
     * @param date
     * @param durationMs
     * @param isForward
     */
    accumulateWorkingTime(date, durationMs, isForward) {
      var _a, _b, _c;
      if (durationMs === 0)
        return { finalDate: new Date(date), remainingDurationInMs: 0 };
      if (isNaN(durationMs))
        throw new Error("Invalid duration");
      let finalDate = date;
      const adjustDurationToDST = (_c = (_b = (_a = this.getProject()) == null ? void 0 : _a.adjustDurationToDST) != null ? _b : this.adjustDurationToDST) != null ? _c : false;
      this.forEachAvailabilityInterval(isForward ? { startDate: date, isForward: true } : { endDate: date, isForward: false }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
        let result = true;
        if (calendarCacheInterval.getIsWorking()) {
          let diff = intervalEndDate.getTime() - intervalStartDate.getTime();
          if (durationMs <= diff) {
            if (adjustDurationToDST) {
              const dstDiff = isForward ? intervalStartDate.getTimezoneOffset() - new Date(intervalStartDate.getTime() + durationMs).getTimezoneOffset() : new Date(intervalEndDate.getTime() - durationMs).getTimezoneOffset() - intervalEndDate.getTimezoneOffset();
              durationMs -= dstDiff * 60 * 1e3;
            }
            finalDate = isForward ? new Date(intervalStartDate.getTime() + durationMs) : new Date(intervalEndDate.getTime() - durationMs);
            durationMs = 0;
            result = false;
          } else {
            if (adjustDurationToDST) {
              const dstDiff = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset();
              diff += dstDiff * 60 * 1e3;
            }
            finalDate = isForward ? intervalEndDate : intervalStartDate;
            durationMs -= diff;
          }
        }
        return result;
      });
      return { finalDate: new Date(finalDate), remainingDurationInMs: durationMs };
    }
    /**
     * Calculate the working time duration between the 2 dates, in milliseconds.
     *
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Boolean} [allowNegative] Method ignores negative values by default, returning 0. Set to true to get
     * negative duration.
     */
    calculateDurationMs(startDate, endDate, allowNegative = false) {
      var _a, _b, _c;
      let duration = 0;
      const multiplier = startDate.getTime() <= endDate.getTime() || !allowNegative ? 1 : -1;
      if (multiplier < 0) {
        [startDate, endDate] = [endDate, startDate];
      }
      const adjustDurationToDST = (_c = (_b = (_a = this.getProject()) == null ? void 0 : _a.adjustDurationToDST) != null ? _b : this.adjustDurationToDST) != null ? _c : false;
      this.forEachAvailabilityInterval({ startDate, endDate }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
        if (calendarCacheInterval.getIsWorking()) {
          duration += intervalEndDate.getTime() - intervalStartDate.getTime();
          if (adjustDurationToDST) {
            const dstDiff = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset();
            duration += dstDiff * 60 * 1e3;
          }
        }
      });
      return duration * multiplier;
    }
    /**
     * Calculate the end date of the time interval which starts at `startDate` and has `durationMs` working time duration
     * (in milliseconds).
     *
     * @param startDate
     * @param durationMs
     */
    calculateEndDate(startDate, durationMs) {
      const isForward = durationMs >= 0;
      const res = this.accumulateWorkingTime(startDate, Math.abs(durationMs), isForward);
      return res.remainingDurationInMs === 0 ? res.finalDate : null;
    }
    /**
     * Calculate the start date of the time interval which ends at `endDate` and has `durationMs` working time duration
     * (in milliseconds).
     *
     * @param endDate
     * @param durationMs
     */
    calculateStartDate(endDate, durationMs) {
      const isForward = durationMs <= 0;
      const res = this.accumulateWorkingTime(endDate, Math.abs(durationMs), isForward);
      return res.remainingDurationInMs === 0 ? res.finalDate : null;
    }
    /**
     * Returns the earliest point at which a working period of time starts, following the given date.
     * Can be the date itself, if it comes on the working time.
     *
     * @param date The date after which to skip the non-working time.
     * @param isForward Whether the "following" means forward in time or backward.
     */
    skipNonWorkingTime(date, isForward = true) {
      let workingDate;
      const res = this.forEachAvailabilityInterval(isForward ? { startDate: date, isForward: true } : { endDate: date, isForward: false }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
        if (calendarCacheInterval.getIsWorking()) {
          workingDate = isForward ? intervalStartDate : intervalEndDate;
          return false;
        }
      });
      if (res === CalendarIteratorResult.MaxRangeReached || res === CalendarIteratorResult.FullRangeIterated)
        return "empty_calendar";
      return workingDate ? new Date(workingDate) : new Date(date);
    }
    /**
     * This method adds a single [[CalendarIntervalMixin]] to the internal collection of the calendar
     */
    addInterval(interval) {
      return this.addIntervals([interval]);
    }
    /**
     * This method adds an array of [[CalendarIntervalMixin]] to the internal collection of the calendar
     */
    addIntervals(intervals) {
      this.bumpVersion();
      return this.intervalStore.add(intervals);
    }
    /**
     * This method removes a single [[CalendarIntervalMixin]] from the internal collection of the calendar
     */
    removeInterval(interval) {
      return this.removeIntervals([interval]);
    }
    /**
     * This method removes an array of [[CalendarIntervalMixin]] from the internal collection of the calendar
     */
    removeIntervals(intervals) {
      this.bumpVersion();
      return this.intervalStore.remove(intervals);
    }
    /**
     * This method removes all intervals from the internal collection of the calendar
     */
    clearIntervals(silent) {
      if (!silent) {
        this.bumpVersion();
      }
      return this.intervalStore.removeAll(silent);
    }
    bumpVersion() {
      this.clearCache();
      this.version++;
    }
    get calendarCache() {
      if (this.$calendarCache !== void 0)
        return this.$calendarCache;
      const unspecifiedTimeInterval = new UnspecifiedTimeIntervalModel({
        isWorking: this.unspecifiedTimeIsWorking
      });
      unspecifiedTimeInterval.calendar = this;
      return this.$calendarCache = new CalendarCacheSingle({
        calendar: this,
        unspecifiedTimeInterval,
        intervalStore: this.intervalStore,
        parentCache: this.parent && !this.parent.isRoot ? this.parent.calendarCache : null
      });
    }
    clearCache() {
      this.$calendarCache && this.$calendarCache.clear();
      this.$calendarCache = void 0;
    }
    resetPriorityOfAllIntervals() {
      this.traverse((calendar) => {
        calendar.intervalStore.forEach((interval) => interval.resetPriority());
      });
    }
    insertChild(child, before, silent) {
      let res = superProto.insertChild.call(this, ...arguments);
      if (!Array.isArray(res)) {
        res = [res];
      }
      res.forEach((r) => {
        r.bumpVersion();
        r.resetPriorityOfAllIntervals();
      });
      return res;
    }
    joinProject() {
      superProto.joinProject.call(this);
      this.intervalStore.setProject(this.getProject());
    }
    leaveProject() {
      superProto.leaveProject.call(this);
      this.intervalStore.setProject(null);
      this.clearCache();
    }
    doDestroy() {
      this.leaveProject();
      this.intervalStore.destroy();
      super.doDestroy();
    }
    isDayHoliday(day) {
      const startDate = DateHelper.clearTime(day), endDate = DateHelper.getNext(day, TimeUnit.Day);
      let hasWorkingTime = false;
      this.forEachAvailabilityInterval({ startDate, endDate, isForward: true }, (_intervalStartDate, _intervalEndDate, calendarCacheInterval) => {
        hasWorkingTime = calendarCacheInterval.getIsWorking();
        return !hasWorkingTime;
      });
      return !hasWorkingTime;
    }
    getDailyHolidaysRanges(startDate, endDate) {
      const result = [];
      startDate = DateHelper.clearTime(startDate);
      while (startDate < endDate) {
        if (this.isDayHoliday(startDate)) {
          result.push({
            startDate,
            endDate: DateHelper.getStartOfNextDay(startDate, true, true)
          });
        }
        startDate = DateHelper.getNext(startDate, TimeUnit.Day);
      }
      return result;
    }
    /**
     * Returns working time ranges between the provided dates.
     * @param {Date} startDate Start of the period to get ranges from.
     * @param {Date} endDate End of the period to get ranges from.
     */
    getWorkingTimeRanges(startDate, endDate, maxRange) {
      const result = [];
      this.forEachAvailabilityInterval({ startDate, endDate, isForward: true, maxRange }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
        if (calendarCacheInterval.getIsWorking()) {
          const entry = calendarCacheInterval.intervals[0];
          result.push({
            name: entry.name,
            startDate: intervalStartDate,
            endDate: intervalEndDate
          });
        }
      });
      return result;
    }
    /**
     * Returns non-working time ranges between the provided dates.
     * @param {Date} startDate Start of the period to get ranges from.
     * @param {Date} endDate End of the period to get ranges from.
     */
    getNonWorkingTimeRanges(startDate, endDate, maxRange) {
      const result = [];
      this.forEachAvailabilityInterval({ startDate, endDate, isForward: true, maxRange }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
        if (!calendarCacheInterval.getIsWorking()) {
          const entry = calendarCacheInterval.intervals[0];
          result.push({
            name: entry.name,
            iconCls: entry.iconCls,
            cls: entry.cls,
            startDate: intervalStartDate,
            endDate: intervalEndDate
          });
        }
      });
      return result;
    }
    /**
     * Checks if there is a working time interval in the provided time range (or when just startDate is provided,
     * checks if the date is contained inside a working time interval in this calendar)
     * @param startDate
     * @param [endDate]
     * @param [fullyContained] Pass true to check if the range is fully covered by a single continuous working time block
     */
    isWorkingTime(startDate, endDate, fullyContained) {
      if (fullyContained) {
        let found;
        const res = this.forEachAvailabilityInterval({ startDate, endDate, isForward: true }, (intervalStartDate, intervalEndDate, calendarCacheInterval) => {
          if (calendarCacheInterval.getIsWorking() && intervalStartDate <= startDate && intervalEndDate >= endDate) {
            found = true;
            return false;
          }
        });
        if (res === CalendarIteratorResult.MaxRangeReached || res === CalendarIteratorResult.FullRangeIterated)
          return false;
        return found;
      } else {
        const workingTimeStart = this.skipNonWorkingTime(startDate);
        return workingTimeStart && workingTimeStart !== "empty_calendar" ? endDate ? workingTimeStart < endDate : workingTimeStart.getTime() === startDate.getTime() : false;
      }
    }
  }
  return CalendarMixin;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/CoreCalendarMixin.js
var CoreCalendarMixin = class extends Mixin([AbstractCalendarMixin, CorePartOfProjectModelMixin], (base) => {
  const superProto = base.prototype;
  class CoreCalendarMixin2 extends base {
  }
  return CoreCalendarMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/AbstractCalendarManagerStoreMixin.js
var AbstractCalendarManagerStoreMixin = class extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class AbstractCalendarManagerStoreMixin2 extends base {
    // special handling to destroy calendar models as part of destroying this store
    doDestroy() {
      var _a;
      const records = [];
      if (!((_a = this.rootNode) == null ? void 0 : _a.isDestroyed)) {
        this.traverse((record) => records.push(record));
      }
      super.doDestroy();
      records.forEach((record) => record.destroy());
    }
  }
  return AbstractCalendarManagerStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/store/CoreCalendarManagerStoreMixin.js
var CoreCalendarManagerStoreMixin = class extends Mixin([AbstractCalendarManagerStoreMixin, CorePartOfProjectStoreMixin], (base) => {
  const superProto = base.prototype;
  class CoreCalendarManagerStoreMixin2 extends base {
    static get defaultConfig() {
      return {
        tree: true,
        modelClass: CoreCalendarMixin
      };
    }
  }
  return CoreCalendarManagerStoreMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/AbstractProjectMixin.js
var EventsWrapper = class extends Mixin([], Events_default) {
};
var DelayableWrapper = class extends Mixin([], Delayable_default) {
};
var AbstractProjectMixin = class extends Mixin([
  EventsWrapper,
  DelayableWrapper,
  Model
], (base) => {
  const superProto = base.prototype;
  class AbstractProjectMixin2 extends base {
    constructor() {
      super(...arguments);
      this.isRestoringData = false;
    }
    get isRepopulatingStores() {
      return false;
    }
    get isInitialCommit() {
      return !this.isInitialCommitPerformed || this.hasLoadedDataToCommit;
    }
    construct(config = {}) {
      this.isInitialCommitPerformed = false;
      this.isLoadingInlineData = false;
      this.isWritingData = false;
      this.hasLoadedDataToCommit = false;
      const silenceInitialCommit = "silenceInitialCommit" in config ? config.silenceInitialCommit : true;
      const adjustDurationToDST = "adjustDurationToDST" in config ? config.adjustDurationToDST : false;
      this.maxCalendarRange = "maxCalendarRange" in config ? config.maxCalendarRange : 15768e7;
      delete config.maxCalendarRange;
      delete config.silenceInitialCommit;
      delete config.adjustDurationToDST;
      superProto.construct.call(this, config);
      this.silenceInitialCommit = silenceInitialCommit;
      this.adjustDurationToDST = adjustDurationToDST;
    }
    // Template method called when a stores dataset is replaced. Implemented in SchedulerBasicProjectMixin
    repopulateStore(store) {
    }
    // Template method called when replica should be repopulated. Implemented in SchedulerBasicProjectMixin
    repopulateReplica() {
    }
    deferUntilRepopulationIfNeeded(deferId, func, args) {
      func(...args);
    }
    // Template method called when a store is attached to the project
    attachStore(store) {
    }
    // Template method called when a store is detached to the project
    detachStore(store) {
    }
    async commitAsync() {
      throw new Error("Abstract method called");
    }
    // Different implementations for Core and Basic engines
    isEngineReady() {
      throw new Error("Abstract method called");
    }
    getStm() {
      throw new Error("Abstract method called");
    }
  }
  return AbstractProjectMixin2;
}) {
};

// ../Engine/lib/Engine/quark/model/scheduler_core/SchedulerCoreProjectMixin.js
var DelayableWrapper2 = class extends Mixin([], Delayable_default) {
};
var SchedulerCoreProjectMixin = class extends Mixin([
  AbstractProjectMixin,
  CorePartOfProjectGenericMixin,
  DelayableWrapper2,
  Model
], (base) => {
  const superProto = base.prototype;
  class SchedulerCoreProjectMixin2 extends base {
    static get configurable() {
      return {
        stm: {},
        eventStore: {},
        assignmentStore: {},
        resourceStore: {},
        dependencyStore: {},
        calendarManagerStore: {},
        eventModelClass: SchedulerCoreEvent,
        assignmentModelClass: CoreAssignmentMixin,
        resourceModelClass: CoreResourceMixin,
        dependencyModelClass: CoreDependencyMixin,
        calendarModelClass: CoreCalendarMixin,
        eventStoreClass: CoreEventStoreMixin,
        assignmentStoreClass: CoreAssignmentStoreMixin,
        resourceStoreClass: CoreResourceStoreMixin,
        dependencyStoreClass: CoreDependencyStoreMixin,
        calendarManagerStoreClass: CoreCalendarManagerStoreMixin,
        assignmentsData: null,
        calendarsData: null,
        dependenciesData: null,
        eventsData: null,
        resourcesData: null
      };
    }
    //endregion
    //region Init
    construct(config = {}) {
      var _a;
      const me = this;
      me.$invalidated = /* @__PURE__ */ new Set();
      me.isPerformingCommit = false;
      me.silenceInitialCommit = true;
      me.ongoing = Promise.resolve();
      if (config.eventStore && !config.assignmentStore) {
        const eventStore = config.eventStore.masterStore || config.eventStore;
        const assignmentStore = eventStore.assignmentStore || ((_a = eventStore.crudManager) == null ? void 0 : _a.assignmentStore);
        if (assignmentStore == null ? void 0 : assignmentStore.isAssignmentStore) {
          config.assignmentStore = assignmentStore;
          me.isSharingAssignmentStore = true;
        }
      }
      superProto.construct.call(me, config);
      me.defaultCalendar = new me.calendarManagerStore.modelClass({
        unspecifiedTimeIsWorking: me.unspecifiedTimeIsWorking
      });
      me.defaultCalendar.project = me;
      const { calendarsData, eventsData, dependenciesData, resourcesData, assignmentsData } = me;
      const hasInlineData = Boolean(calendarsData || eventsData || dependenciesData || resourcesData || assignmentsData);
      if (hasInlineData) {
        me.loadInlineData({
          calendarsData,
          eventsData,
          dependenciesData,
          resourcesData,
          assignmentsData
        });
        delete me.calendarsData;
        delete me.eventsData;
        delete me.dependenciesData;
        delete me.resourcesData;
        delete me.assignmentsData;
      } else {
        me.bufferedCommitAsync();
      }
    }
    doDestroy() {
      var _a, _b, _c, _d, _e, _f;
      const me = this;
      (_a = me.eventStore) == null ? void 0 : _a.destroy();
      (_b = me.dependencyStore) == null ? void 0 : _b.destroy();
      (_c = me.assignmentStore) == null ? void 0 : _c.destroy();
      (_d = me.resourceStore) == null ? void 0 : _d.destroy();
      (_e = me.calendarManagerStore) == null ? void 0 : _e.destroy();
      me.defaultCalendar.destroy();
      (_f = me.stm) == null ? void 0 : _f.destroy();
      superProto.doDestroy.call(this);
    }
    /**
     * This method loads the "raw" data into the project. The loading is basically happening by
     * assigning the individual data entries to the `data` property of the corresponding store.
     *
     * @param data
     */
    async loadInlineData(data) {
      const me = this;
      me.isLoadingInlineData = true;
      if (data.calendarsData) {
        me.calendarManagerStore.data = data.calendarsData;
      }
      if (data.resourcesData) {
        me.resourceStore.data = data.resourcesData;
      }
      if (data.assignmentsData) {
        me.assignmentStore.data = data.assignmentsData;
      }
      if (data.eventsData) {
        me.eventStore.data = data.eventsData;
      }
      if (data.tasksData) {
        me.eventStore.data = data.tasksData;
      }
      if (data.dependenciesData) {
        me.dependencyStore.data = data.dependenciesData;
      }
      await me.commitLoad();
      me.isLoadingInlineData = false;
      return;
    }
    //endregion
    //region Join
    async commitLoad() {
      await this.commitAsync();
      if (!this.isDestroyed)
        this.trigger("load");
    }
    joinStoreRecords(store) {
      const fn2 = (record) => {
        record.setProject(this);
        record.joinProject();
      };
      if (store.rootNode) {
        store.rootNode.traverse(fn2);
      } else {
        store.forEach(fn2);
      }
    }
    unJoinStoreRecords(store) {
      const fn2 = (record) => {
        record.leaveProject();
        record.setProject(this);
      };
      if (store.rootNode) {
        store.rootNode.traverse((node) => {
          if (node !== store.rootNode)
            fn2(node);
        });
      } else {
        store.forEach(fn2);
      }
    }
    //endregion
    //region EventStore
    resolveStoreAndModelClass(name, config) {
      const storeClass = (config == null ? void 0 : config.storeClass) || this[`${name}StoreClass`];
      let modelClass = config == null ? void 0 : config.modelClass;
      if (!modelClass) {
        if (this.getDefaultConfiguration()[`${name}ModelClass`] !== storeClass.getDefaultConfiguration().modelClass) {
          modelClass = storeClass.getDefaultConfiguration().modelClass;
        } else {
          modelClass = this[`${name}ModelClass`];
        }
      }
      return { storeClass, modelClass };
    }
    setEventStore(eventStore) {
      this.eventStore = eventStore;
    }
    changeEventStore(eventStore, oldStore) {
      const me = this, { stm } = me;
      me.detachStore(oldStore);
      if (!(eventStore instanceof Store)) {
        const { storeClass, modelClass } = me.resolveStoreAndModelClass("event", eventStore);
        eventStore = new storeClass(ObjectHelper.assign({
          modelClass,
          project: me,
          stm
        }, eventStore));
      } else {
        eventStore.project = me;
        stm.addStore(eventStore);
        me.joinStoreRecords(eventStore);
      }
      if (oldStore && stm.hasStore(oldStore)) {
        stm.removeStore(oldStore);
        me.unJoinStoreRecords(oldStore);
        const { assignmentsForRemoval } = oldStore;
        assignmentsForRemoval.forEach((assignment) => {
          const oldEvent = assignment.event;
          if (oldEvent) {
            const newEvent = eventStore.getById(oldEvent.id);
            if (newEvent) {
              assignment.event = newEvent;
              assignmentsForRemoval.delete(assignment);
            }
          }
        });
        oldStore.afterEventRemoval();
      }
      eventStore.setProject(me);
      return eventStore;
    }
    updateEventStore(eventStore, oldStore) {
      this.attachStore(eventStore);
      this.trigger("eventStoreChange", { store: eventStore });
    }
    //endregion
    //region AssignmentStore
    setAssignmentStore(assignmentStore) {
      this.assignmentStore = assignmentStore;
    }
    changeAssignmentStore(assignmentStore, oldStore) {
      const me = this, { stm } = me;
      me.detachStore(oldStore);
      if (oldStore && stm.hasStore(oldStore)) {
        stm.removeStore(oldStore);
        me.unJoinStoreRecords(oldStore);
      }
      if (!(assignmentStore instanceof Store)) {
        const { storeClass, modelClass } = me.resolveStoreAndModelClass("assignment", assignmentStore);
        assignmentStore = new storeClass(ObjectHelper.assign({
          modelClass,
          project: me,
          stm
        }, assignmentStore));
      } else {
        assignmentStore.project = me;
        stm.addStore(assignmentStore);
        me.joinStoreRecords(assignmentStore);
      }
      assignmentStore.setProject(me);
      return assignmentStore;
    }
    updateAssignmentStore(assignmentStore, oldStore) {
      this.attachStore(assignmentStore);
      this.trigger("assignmentStoreChange", { store: assignmentStore });
    }
    //endregion
    //region ResourceStore
    setResourceStore(resourceStore) {
      this.resourceStore = resourceStore;
    }
    changeResourceStore(resourceStore, oldStore) {
      const me = this, { stm } = me;
      me.detachStore(oldStore);
      if (!(resourceStore instanceof Store)) {
        const { storeClass, modelClass } = me.resolveStoreAndModelClass("resource", resourceStore);
        resourceStore = new storeClass(ObjectHelper.assign({
          modelClass,
          project: me,
          stm
        }, resourceStore));
      } else {
        resourceStore.project = me;
        stm.addStore(resourceStore);
        me.joinStoreRecords(resourceStore);
      }
      if (oldStore && stm.hasStore(oldStore)) {
        stm.removeStore(oldStore);
        me.unJoinStoreRecords(oldStore);
        const { assignmentsForRemoval } = oldStore;
        assignmentsForRemoval.forEach((assignment) => {
          const oldResource = assignment.resource;
          if (oldResource) {
            const newResource = resourceStore.getById(oldResource.id);
            if (newResource) {
              assignment.resource = newResource;
              assignmentsForRemoval.delete(assignment);
            }
          }
        });
        oldStore.afterResourceRemoval();
      }
      resourceStore.setProject(me);
      return resourceStore;
    }
    updateResourceStore(resourceStore, oldStore) {
      this.attachStore(resourceStore);
      this.trigger("resourceStoreChange", { store: resourceStore });
    }
    //endregion
    //region DependencyStore
    setDependencyStore(dependencyStore) {
      this.dependencyStore = dependencyStore;
    }
    changeDependencyStore(dependencyStore, oldStore) {
      const me = this;
      me.detachStore(oldStore);
      if (!(dependencyStore instanceof Store)) {
        const { storeClass, modelClass } = me.resolveStoreAndModelClass("dependency", dependencyStore);
        dependencyStore = new storeClass(ObjectHelper.assign({
          modelClass,
          project: me,
          stm: me.stm
        }, dependencyStore));
      } else {
        dependencyStore.project = me;
        me.stm.addStore(dependencyStore);
        me.joinStoreRecords(dependencyStore);
      }
      return dependencyStore;
    }
    updateDependencyStore(dependencyStore, oldStore) {
      this.attachStore(dependencyStore);
      this.trigger("dependencyStoreChange", { store: dependencyStore });
    }
    //endregion
    //region CalendarManagerStore
    setCalendarManagerStore(calendarManagerStore) {
      this.calendarManagerStore = calendarManagerStore;
    }
    changeCalendarManagerStore(calendarManagerStore, oldStore) {
      const me = this;
      me.detachStore(oldStore);
      if (!(calendarManagerStore instanceof Store)) {
        const storeClass = (calendarManagerStore == null ? void 0 : calendarManagerStore.storeClass) || me.calendarManagerStoreClass;
        const modelClass = (calendarManagerStore == null ? void 0 : calendarManagerStore.modelClass) || storeClass.getDefaultConfiguration().modelClass || me.calendarModelClass;
        calendarManagerStore = new storeClass(ObjectHelper.assign({
          modelClass,
          project: me,
          stm: me.stm
        }, calendarManagerStore));
      } else {
        me.stm.addStore(calendarManagerStore);
      }
      calendarManagerStore.setProject(me);
      return calendarManagerStore;
    }
    updateCalendarManagerStore(calendarManagerStore, oldStore) {
      this.attachStore(calendarManagerStore);
      this.trigger("calendarManagerStoreChange", { store: calendarManagerStore });
    }
    //endregion
    //region Calendar
    get calendar() {
      return this.$calendar || this.defaultCalendar;
    }
    set calendar(calendar) {
      this.$calendar = calendar;
    }
    get effectiveCalendar() {
      return this.calendar;
    }
    //endregion
    //region Add records
    async addEvent(event) {
      this.eventStore.add(event);
      return this.commitAsync();
    }
    async addAssignment(assignment) {
      this.assignmentStore.add(assignment);
      return this.commitAsync();
    }
    async addResource(resource) {
      this.resourceStore.add(resource);
      return this.commitAsync();
    }
    async addDependency(dependency) {
      this.dependencyStore.add(dependency);
      return this.commitAsync();
    }
    //endregion
    //region Auto commit
    // Buffer commitAsync using setTimeout. Not using `buffer` on purpose, for performance reasons and to better
    // mimic how graph does it
    bufferedCommitAsync() {
      if (!this.hasPendingAutoCommit) {
        this.setTimeout({
          fn: "commitAsync",
          delay: 10
        });
      }
    }
    get hasPendingAutoCommit() {
      return this.hasTimeout("commitAsync");
    }
    unScheduleAutoCommit() {
      this.clearTimeout("commitAsync");
    }
    //endregion
    //region Commit
    async commitAsync() {
      if (this.isPerformingCommit)
        return this.ongoing;
      return this.ongoing = this.doCommitAsync();
    }
    async doCommitAsync() {
      const me = this;
      me.isPerformingCommit = true;
      me.unScheduleAutoCommit();
      await delay(0);
      if (!me.isDestroyed) {
        for (const record of me.$invalidated) {
          record.calculateInvalidated();
        }
        const { isInitialCommit, silenceInitialCommit } = me;
        const silenceCommit = isInitialCommit && silenceInitialCommit;
        me.assignmentStore.onCommitAsync();
        me.dependencyStore.onCommitAsync();
        me.isInitialCommitPerformed = true;
        me.hasLoadedDataToCommit = false;
        me.isPerformingCommit = false;
        const stores = [me.assignmentStore, me.dependencyStore, me.eventStore, me.resourceStore, me.calendarManagerStore];
        stores.forEach((store) => {
          var _a;
          return (_a = store.suspendAutoCommit) == null ? void 0 : _a.call(store);
        });
        me.isWritingData = true;
        me.trigger("refresh", { isInitialCommit, isCalculated: true });
        if (silenceCommit) {
          for (const record of me.$invalidated) {
            record.finalizeInvalidated(true);
          }
        } else {
          for (const record of me.$invalidated) {
            record.beginBatch(true);
            record.finalizeInvalidated();
          }
          for (const record of me.$invalidated) {
            record.endBatch(false, true);
          }
        }
        me.isWritingData = false;
        me.$invalidated.clear();
        me.trigger("dataReady");
        stores.forEach((store) => {
          var _a;
          return (_a = store.resumeAutoCommit) == null ? void 0 : _a.call(store);
        });
        me.trigger("commitFinalized");
        return true;
      }
    }
    async propagateAsync() {
      return this.commitAsync();
    }
    // Called when a record invalidates itself, queues it for calculation
    invalidate(record) {
      this.$invalidated.add(record);
      this.bufferedCommitAsync();
    }
    // this does not account for possible scheduling conflicts
    async isValidDependency() {
      return true;
    }
    //endregion
    //region STM
    getStm() {
      return this.stm;
    }
    /**
     * State tracking manager instance the project relies on
     */
    set stm(stm) {
      stm = this.$stm = new StateTrackingManager(ObjectHelper.assign({
        disabled: true
      }, stm));
      stm.ion({
        // Propagate on undo/redo
        restoringStop: async () => {
          stm.disable();
          await this.commitAsync();
          if (!this.isDestroyed) {
            stm.enable();
            this.trigger("stateRestoringDone");
          }
        }
      });
    }
    get stm() {
      return this.$stm;
    }
    //endregion
    isEngineReady() {
      return !this.hasPendingAutoCommit && !this.isPerformingCommit && this.isInitialCommitPerformed;
    }
  }
  SchedulerCoreProjectMixin2.applyConfigs = true;
  return SchedulerCoreProjectMixin2;
}) {
};

// ../Scheduler/lib/Scheduler/model/ProjectModel.js
var EngineMixin9 = SchedulerCoreProjectMixin;
var ProjectModel = class extends ProjectCurrentConfig_default(ProjectModelMixin_default(EngineMixin9)) {
  static get $name() {
    return "ProjectModel";
  }
  //region Inline data configs & properties
  /**
   * @hidefields id, readOnly, children, parentId, parentIndex
   */
  /**
   * A flag, indicating whether the dates and duration calculations should adjust the result to DST time shift.
   *
   * @config {Boolean} adjustDurationToDST
   * @default false
   */
  /**
   * Get/set {@link #property-eventStore} data.
   *
   * Always returns an array of {@link Scheduler.model.EventModel EventModels} but also accepts an array of
   * its configuration objects as input.
   *
   * @member {Scheduler.model.EventModel[]} events
   * @accepts {Scheduler.model.EventModel[]|EventModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-eventStore}. Should be an array of
   * {@link Scheduler.model.EventModel EventModels} or its configuration objects.
   *
   * @config {Scheduler.model.EventModel[]|EventModelConfig[]} events
   * @category Inline data
   */
  /**
   * Get/set {@link #property-resourceStore} data.
   *
   * Always returns an array of {@link Scheduler.model.ResourceModel ResourceModels} but also accepts an array
   * of its configuration objects as input.
   *
   * @member {Scheduler.model.ResourceModel[]} resources
   * @accepts {Scheduler.model.ResourceModel[]|ResourceModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-resourceStore}. Should be an array of
   * {@link Scheduler.model.ResourceModel ResourceModels} or its configuration objects.
   *
   * @config {Scheduler.model.ResourceModel[]|ResourceModelConfig[]} resources
   * @category Inline data
   */
  /**
   * Get/set {@link #property-assignmentStore} data.
   *
   * Always returns an array of {@link Scheduler.model.AssignmentModel AssignmentModels} but also accepts an
   * array of its configuration objects as input.
   *
   * @member {Scheduler.model.AssignmentModel[]} assignments
   * @accepts {Scheduler.model.AssignmentModel[]|AssignmentModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-assignmentStore}. Should be an array of
   * {@link Scheduler.model.AssignmentModel AssignmentModels} or its configuration objects.
   *
   * @config {Scheduler.model.AssignmentModel[]|AssignmentModelConfig[]} assignments
   * @category Inline data
   */
  /**
   * Get/set {@link #property-dependencyStore} data.
   *
   * Always returns an array of {@link Scheduler.model.DependencyModel DependencyModels} but also accepts an
   * array of its configuration objects as input.
   *
   * @member {Scheduler.model.DependencyModel[]} dependencies
   * @accepts {Scheduler.model.DependencyModel[]|DependencyModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-dependencyStore}. Should be an array of
   * {@link Scheduler.model.DependencyModel DependencyModels} or its configuration objects.
   *
   * @config {Scheduler.model.DependencyModel[]|DependencyModelConfig[]} dependencies
   * @category Inline data
   */
  /**
   * Get/set {@link #property-timeRangeStore} data.
   *
   * Always returns an array of {@link Scheduler.model.TimeRangeModel TimeRangeModels} but also accepts an
   * array of its configuration objects as input.
   *
   * @member {Scheduler.model.TimeRangeModel[]} timeRanges
   * @accepts {Scheduler.model.TimeRangeModel[]|TimeRangeModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-timeRangeStore}. Should be an array of
   * {@link Scheduler.model.TimeRangeModel TimeRangeModels} or its configuration objects.
   *
   * @config {Scheduler.model.TimeRangeModel[]|TimeRangeModelConfig[]} timeRanges
   * @category Inline data
   */
  /**
   * Get/set {@link #property-resourceTimeRangeStore} data.
   *
   * Always returns an array of {@link Scheduler.model.ResourceTimeRangeModel ResourceTimeRangeModels} but
   * also accepts an array of its configuration objects as input.
   *
   * @member {Scheduler.model.ResourceTimeRangeModel[]} resourceTimeRanges
   * @accepts {Scheduler.model.ResourceTimeRangeModel[]|ResourceTimeRangeModelConfig[]}
   * @category Inline data
   */
  /**
   * Data use to fill the {@link #property-resourceTimeRangeStore}. Should be an array
   * of {@link Scheduler.model.ResourceTimeRangeModel ResourceTimeRangeModels} or its configuration objects.
   *
   * @config {Scheduler.model.ResourceTimeRangeModel[]|ResourceTimeRangeModelConfig[]} resourceTimeRanges
   * @category Inline data
   */
  //endregion
  //region Legacy inline data configs & properties
  /**
   * The initial data, to fill the {@link #property-eventStore} with.
   * Should be an array of {@link Scheduler.model.EventModel EventModels} or its configuration objects.
   *
   * @config {Scheduler.model.EventModel[]|EventModelConfig[]} eventsData
   * @category Legacy inline data
   */
  /**
   * The initial data, to fill the {@link #property-dependencyStore} with.
   * Should be an array of {@link Scheduler.model.DependencyModel DependencyModels} or its configuration
   * objects.
   *
   * @config {Scheduler.model.DependencyModel[]|DependencyModelConfig[]} [dependenciesData]
   * @category Legacy inline data
   */
  /**
   * The initial data, to fill the {@link #property-resourceStore} with.
   * Should be an array of {@link Scheduler.model.ResourceModel ResourceModels} or its configuration objects.
   *
   * @config {Scheduler.model.ResourceModel[]|ResourceModelConfig[]} [resourcesData]
   * @category Legacy inline data
   */
  /**
   * The initial data, to fill the {@link #property-assignmentStore} with.
   * Should be an array of {@link Scheduler.model.AssignmentModel AssignmentModels} or its configuration
   * objects.
   *
   * @config {Scheduler.model.AssignmentModel[]|AssignmentModelConfig[]} [assignmentsData]
   * @category Legacy inline data
   */
  //endregion
  //region Store configs & properties
  /**
   * The {@link Scheduler.data.EventStore store} holding the events information.
   *
   * See also {@link Scheduler.model.EventModel}
   *
   * @member {Scheduler.data.EventStore} eventStore
   * @category Models & Stores
   */
  /**
   * An {@link Scheduler.data.EventStore} instance or a config object.
   * @config {Scheduler.data.EventStore|EventStoreConfig} eventStore
   * @category Models & Stores
   */
  /**
   * The {@link Scheduler.data.DependencyStore store} holding the dependencies information.
   *
   * See also {@link Scheduler.model.DependencyModel}
   *
   * @member {Scheduler.data.DependencyStore} dependencyStore
   * @category Models & Stores
   */
  /**
   * A {@link Scheduler.data.DependencyStore} instance or a config object.
   * @config {Scheduler.data.DependencyStore|DependencyStoreConfig} dependencyStore
   * @category Models & Stores
   */
  /**
   * The {@link Scheduler.data.ResourceStore store} holding the resources that can be assigned to the events in the event store.
   *
   * See also {@link Scheduler.model.ResourceModel}
   *
   * @member {Scheduler.data.ResourceStore} resourceStore
   * @category Models & Stores
   */
  /**
   * A {@link Scheduler.data.ResourceStore} instance or a config object.
   * @config {Scheduler.data.ResourceStore|ResourceStoreConfig} resourceStore
   * @category Models & Stores
   */
  /**
   * The {@link Scheduler.data.AssignmentStore store} holding the assignments information.
   *
   * See also {@link Scheduler.model.AssignmentModel}
   *
   * @member {Scheduler.data.AssignmentStore} assignmentStore
   * @category Models & Stores
   */
  /**
   * An {@link Scheduler.data.AssignmentStore} instance or a config object.
   * @config {Scheduler.data.AssignmentStore|AssignmentStoreConfig} assignmentStore
   * @category Models & Stores
   */
  //endregion
  //region Configs
  static get defaultConfig() {
    return {
      /**
       * The constructor of the event model class, to be used in the project. Will be set as the
       * {@link Core.data.Store#config-modelClass modelClass} property of the {@link #property-eventStore}
       *
       * @config {Scheduler.model.EventModel}
       * @typings {typeof EventModel}
       * @category Models & Stores
       */
      eventModelClass: EventModel,
      /**
       * The constructor of the dependency model class, to be used in the project. Will be set as the
       * {@link Core.data.Store#config-modelClass modelClass} property of the {@link #property-dependencyStore}
       *
       * @config {Scheduler.model.DependencyModel}
       * @typings {typeof DependencyModel}
       * @category Models & Stores
       */
      dependencyModelClass: DependencyModel,
      /**
       * The constructor of the resource model class, to be used in the project. Will be set as the
       * {@link Core.data.Store#config-modelClass modelClass} property of the {@link #property-resourceStore}
       *
       * @config {Scheduler.model.ResourceModel}
       * @typings {typeof ResourceModel}
       * @category Models & Stores
       */
      resourceModelClass: ResourceModel,
      /**
       * The constructor of the assignment model class, to be used in the project. Will be set as the
       * {@link Core.data.Store#config-modelClass modelClass} property of the {@link #property-assignmentStore}
       *
       * @config {Scheduler.model.AssignmentModel}
       * @typings {typeof AssignmentModel}
       * @category Models & Stores
       */
      assignmentModelClass: AssignmentModel,
      /**
       * The constructor to create an event store instance with. Should be a class, subclassing the
       * {@link Scheduler.data.EventStore}
       * @config {Scheduler.data.EventStore|Object}
       * @typings {typeof EventStore|object}
       * @category Models & Stores
       */
      eventStoreClass: EventStore,
      /**
       * The constructor to create a dependency store instance with. Should be a class, subclassing the
       * {@link Scheduler.data.DependencyStore}
       * @config {Scheduler.data.DependencyStore|Object}
       * @typings {typeof DependencyStore|object}
       * @category Models & Stores
       */
      dependencyStoreClass: DependencyStore,
      /**
       * The constructor to create a resource store instance with. Should be a class, subclassing the
       * {@link Scheduler.data.ResourceStore}
       * @config {Scheduler.data.ResourceStore|Object}
       * @typings {typeof ResourceStore|object}
       * @category Models & Stores
       */
      resourceStoreClass: ResourceStore,
      /**
       * The constructor to create an assignment store instance with. Should be a class, subclassing the
       * {@link Scheduler.data.AssignmentStore}
       * @config {Scheduler.data.AssignmentStore|Object}
       * @typings {typeof AssignmentStore|object}
       * @category Models & Stores
       */
      assignmentStoreClass: AssignmentStore
    };
  }
  //endregion
  //region Events
  /**
   * Fired when the engine has finished its calculations and the results has been written back to the records.
   *
   * ```javascript
   * scheduler.project.on({
   *     dataReady() {
   *        console.log('Calculations finished');
   *     }
   * });
   *
   * scheduler.eventStore.first.duration = 10;
   *
   * // At some point a bit later it will log 'Calculations finished'
   * ```
   *
   * @event dataReady
   * @param {Scheduler.model.ProjectModel} source The project
   * @typings source -> {Scheduler.model.ProjectModel||any}
   * @param {Boolean} isInitialCommit Flag that shows if this commit is initial
   * @param {Set} records Set of all {@link Core.data.Model}s that were modified in the completed transaction.
   * Use the {@link Core.data.Model#property-modifications} property of each Model to identify
   * modified fields.
   */
  //endregion
  /**
   * Silences propagations caused by the project loading.
   *
   * Applying the loaded data to the project occurs in two basic stages:
   *
   * 1. Data gets into the engine graph which triggers changes propagation
   * 2. The changes caused by the propagation get written to related stores
   *
   * Setting this flag to `true` makes the component perform step 2 silently without triggering events causing reactions on those changes
   * (like sending changes back to the server if `autoSync` is enabled) and keeping stores in unmodified state.
   *
   * This is safe if the loaded data is consistent so propagation doesn't really do any adjustments.
   * By default the system treats the data as consistent so this option is `true`.
   *
   * ```js
   * new Scheduler({
   *     project : {
   *         // We want scheduling engine to recalculate the data properly
   *         // so then we could save it back to the server
   *         silenceInitialCommit : false
   *     }
   *     ...
   * })
   * ```
   *
   * @config {Boolean} silenceInitialCommit
   * @default true
   * @category Advanced
   */
  construct(...args) {
    super.construct(...args);
    if (VersionHelper.isTestEnv) {
      globalThis.bryntum.testProject = this;
    }
    this.modelPersistencyManager = this.createModelPersistencyManager();
  }
  /**
   * Creates and returns model persistency manager
   *
   * @returns {Scheduler.data.util.ModelPersistencyManager}
   * @internal
   */
  createModelPersistencyManager() {
    return new ModelPersistencyManager({
      eventStore: this,
      resourceStore: this.resourceStore,
      assignmentStore: this.assignmentStore,
      dependencyStore: this.dependencyStore
    });
  }
  doDestroy() {
    this.modelPersistencyManager.destroy();
    super.doDestroy();
  }
  // To comply with TaskBoards expectations
  get taskStore() {
    return this.eventStore;
  }
};
ProjectModel.applyConfigs = true;
ProjectModel.initClass();
ProjectModel._$name = "ProjectModel";

// ../Scheduler/lib/Scheduler/data/CrudManager.js
var CrudManager = class extends AbstractCrudManager.mixin(ProjectCrudManager_default, AjaxTransport_default, JsonEncoder_default) {
  //region Config
  static get defaultConfig() {
    return {
      projectClass: ProjectModel,
      resourceStoreClass: ResourceStore,
      eventStoreClass: EventStore,
      assignmentStoreClass: AssignmentStore,
      dependencyStoreClass: DependencyStore,
      /**
       * A store with resources (or a config object).
       * @config {Scheduler.data.ResourceStore|ResourceStoreConfig}
       */
      resourceStore: {},
      /**
       * A store with events (or a config object).
       *
       * ```
       * crudManager : {
       *      eventStore {
       *          storeClass : MyEventStore
       *      }
       * }
       * ```
       * @config {Scheduler.data.EventStore|EventStoreConfig}
       */
      eventStore: {},
      /**
       * A store with assignments (or a config object).
       * @config {Scheduler.data.AssignmentStore|AssignmentStoreConfig}
       */
      assignmentStore: {},
      /**
       * A store with dependencies(or a config object).
       * @config {Scheduler.data.DependencyStore|DependencyStoreConfig}
       */
      dependencyStore: {},
      /**
       * A project that holds and links stores
       * @config {Scheduler.model.ProjectModel}
       */
      project: null
    };
  }
  //endregion
  buildProject() {
    return new this.projectClass(this.buildProjectConfig());
  }
  buildProjectConfig() {
    return ObjectHelper.cleanupProperties({
      eventStore: this.eventStore,
      resourceStore: this.resourceStore,
      assignmentStore: this.assignmentStore,
      dependencyStore: this.dependencyStore,
      resourceTimeRangeStore: this.resourceTimeRangeStore
    });
  }
  //region Stores
  set project(project) {
    const me = this;
    if (project !== me._project) {
      me.detachListeners("beforeDataReady");
      me.detachListeners("afterDataReady");
      me._project = project;
      if (project) {
        me.eventStore = project.eventStore;
        me.resourceStore = project.resourceStore;
        me.assignmentStore = project.assignmentStore;
        me.dependencyStore = project.dependencyStore;
        me.timeRangeStore = project.timeRangeStore;
        me.resourceTimeRangeStore = project.resourceTimeRangeStore;
        project.ion({
          name: "beforeDataReady",
          dataReady: () => me.suspendChangeTracking(),
          prio: 100,
          thisObj: me
        });
        project.ion({
          name: "afterDataReady",
          dataReady: () => me.resumeChangeTracking(),
          prio: -100,
          thisObj: me
        });
      }
      if (!me.eventStore) {
        me.eventStore = {};
      }
      if (!me.resourceStore) {
        me.resourceStore = {};
      }
      if (!me.assignmentStore) {
        me.assignmentStore = {};
      }
      if (!me.dependencyStore) {
        me.dependencyStore = {};
      }
    }
  }
  get project() {
    return this._project;
  }
  /**
   * Store for {@link Scheduler/feature/TimeRanges timeRanges} feature.
   * @property {Core.data.Store}
   */
  get timeRangeStore() {
    var _a;
    return (_a = this._timeRangeStore) == null ? void 0 : _a.store;
  }
  set timeRangeStore(store) {
    var _a;
    this.setFeaturedStore("_timeRangeStore", store, (_a = this.project) == null ? void 0 : _a.timeRangeStoreClass);
  }
  /**
   * Store for {@link Scheduler/feature/ResourceTimeRanges resourceTimeRanges} feature.
   * @property {Core.data.Store}
   */
  get resourceTimeRangeStore() {
    var _a;
    return (_a = this._resourceTimeRangeStore) == null ? void 0 : _a.store;
  }
  set resourceTimeRangeStore(store) {
    var _a;
    this.setFeaturedStore("_resourceTimeRangeStore", store, (_a = this.project) == null ? void 0 : _a.resourceTimeRangeStoreClass);
  }
  /**
   * Get/set the resource store bound to the CRUD manager.
   * @property {Scheduler.data.ResourceStore}
   */
  get resourceStore() {
    var _a;
    return (_a = this._resourceStore) == null ? void 0 : _a.store;
  }
  set resourceStore(store) {
    const me = this;
    me.setFeaturedStore("_resourceStore", store, me.resourceStoreClass);
  }
  /**
   * Get/set the event store bound to the CRUD manager.
   * @property {Scheduler.data.EventStore}
   */
  get eventStore() {
    var _a;
    return (_a = this._eventStore) == null ? void 0 : _a.store;
  }
  set eventStore(store) {
    const me = this;
    me.setFeaturedStore("_eventStore", store, me.eventStoreClass);
  }
  /**
   * Get/set the assignment store bound to the CRUD manager.
   * @property {Scheduler.data.AssignmentStore}
   */
  get assignmentStore() {
    var _a;
    return (_a = this._assignmentStore) == null ? void 0 : _a.store;
  }
  set assignmentStore(store) {
    this.setFeaturedStore("_assignmentStore", store, this.assignmentStoreClass);
  }
  /**
   * Get/set the dependency store bound to the CRUD manager.
   * @property {Scheduler.data.DependencyStore}
   */
  get dependencyStore() {
    var _a;
    return (_a = this._dependencyStore) == null ? void 0 : _a.store;
  }
  set dependencyStore(store) {
    this.setFeaturedStore("_dependencyStore", store, this.dependencyStoreClass);
  }
  setFeaturedStore(property, store, storeClass) {
    var _a;
    const me = this, oldStore = (_a = me[property]) == null ? void 0 : _a.store;
    if (oldStore !== store) {
      store = Store.getStore(store, (store == null ? void 0 : store.storeClass) || storeClass);
      if (oldStore) {
        me.removeStore(oldStore);
      }
      me[property] = store && { store } || null;
      me.addPrioritizedStore(me[property]);
    }
    return me[property];
  }
  getChangesetPackage() {
    var _a, _b;
    const pack = super.getChangesetPackage();
    if (pack && (this.eventStore.usesSingleAssignment || ((_b = (_a = this.eventStore.modelClass.fieldMap) == null ? void 0 : _a.resourceIds) == null ? void 0 : _b.persist))) {
      delete pack[this.assignmentStore.storeId];
      if (!this.crudStores.some((storeInfo) => pack[storeInfo.storeId])) {
        return null;
      }
    }
    return pack;
  }
  //endregion
  get crudLoadValidationMandatoryStores() {
    return [this._eventStore.storeId, this._resourceStore.storeId];
  }
};
__publicField(CrudManager, "$name", "CrudManager");
CrudManager._$name = "CrudManager";

// ../Scheduler/lib/Scheduler/crud/mixin/CrudManagerView.js
var CrudManagerView_default = (Target) => {
  var _a;
  return _a = class extends Target.mixin(LoadMaskable_default) {
    static get $name() {
      return "CrudManagerView";
    }
    //region Init
    afterConstruct() {
      super.afterConstruct();
      const { crudManager, project } = this;
      if (this.loadMask && (crudManager || project).isCrudManagerLoading) {
        this.onCrudManagerLoadStart();
      }
    }
    //endregion
    /**
     * Applies the {@link Scheduler.crud.mixin.CrudManagerView#config-syncMask} as the
     * {@link Core.widget.Widget#config-masked mask} for this widget.
     * @internal
     */
    applySyncMask() {
      const { syncMask } = this;
      if (syncMask) {
        this.masked = Mask.mergeConfigs(this.loadMaskDefaults, syncMask);
      }
    }
    /**
     * Hooks up crud manager listeners
     * @private
     * @category Store
     */
    bindCrudManager(crudManager) {
      this.detachListeners("crudManager");
      let additionalListeners = {};
      if (!this.isTaskBoardBase) {
        additionalListeners = {
          beforeApplyResponse: "onCrudManagerBeforeApplyResponse",
          applyResponse: "onCrudManagerApplyResponse",
          beforeLoadCrudManagerData: "onCrudManagerBeforeLoadCrudManagerData",
          loadCrudManagerData: "onCrudManagerLoadCrudManagerData"
        };
      }
      crudManager == null ? void 0 : crudManager.ion({
        name: "crudManager",
        loadStart: "onCrudManagerLoadStart",
        beforeSend: "onCrudManagerBeforeSend",
        load: "onCrudManagerLoad",
        loadCanceled: "onCrudManagerLoadCanceled",
        syncStart: "onCrudManagerSyncStart",
        sync: "onCrudManagerSync",
        syncCanceled: "onCrudManagerSyncCanceled",
        requestFail: "onCrudManagerRequestFail",
        responseReceived: "onAjaxTransportResponseReceived",
        ...additionalListeners,
        thisObj: this
      });
    }
    onCrudManagerBeforeSend({ params }) {
      var _a2;
      (_a2 = this.applyStartEndParameters) == null ? void 0 : _a2.call(this, params);
    }
    onCrudManagerLoadStart() {
      var _a2;
      this.applyLoadMask();
      (_a2 = this.toggleEmptyText) == null ? void 0 : _a2.call(this);
    }
    onCrudManagerSyncStart() {
      this.applySyncMask();
    }
    onCrudManagerBeforeApplyResponse() {
      this.suspendRefresh();
    }
    onCrudManagerApplyResponse() {
      this.resumeRefresh(true);
    }
    onCrudManagerBeforeLoadCrudManagerData() {
      if (!this.crudManager.applyingLoadResponse) {
        this.suspendRefresh();
      }
    }
    async onCrudManagerLoadCrudManagerData() {
      if (!this.crudManager.applyingLoadResponse) {
        await this.project.commitAsync();
        !this.isDestroyed && this.resumeRefresh(true);
      }
    }
    onCrudManagerRequestFinalize(successful = true, requestType, response) {
      var _a2;
      const me = this;
      if (successful) {
        (_a2 = me.toggleEmptyText) == null ? void 0 : _a2.call(me);
      } else {
        if (!me.masked) {
          me.applyLoadMask();
        }
        me.applyMaskError(
          `<div class="b-grid-load-failure">
                    <div class="b-grid-load-fail">${me.L(`L{GridBase.${requestType}FailedMessage}`)}</div>
                    ${response && response.message ? `<div class="b-grid-load-fail">${me.L("L{CrudManagerView.serverResponseLabel}")} ${response.message}</div>` : ""}
                </div>`
        );
      }
    }
    onCrudManagerLoadCanceled() {
      this.onCrudManagerRequestFinalize(true, "load");
    }
    onCrudManagerSyncCanceled() {
      this.onCrudManagerRequestFinalize(true, "sync");
    }
    onCrudManagerLoad() {
      this.onCrudManagerRequestFinalize(true, "load");
    }
    onCrudManagerSync() {
      this.onCrudManagerRequestFinalize(true, "sync");
    }
    onCrudManagerRequestFail({ requestType, response }) {
      this.onCrudManagerRequestFinalize(false, requestType, response);
    }
    onAjaxTransportResponseReceived() {
      const me = this;
      if (me.clearMaskDelay != null) {
        me.setTimeout(() => me.masked = null, me.clearMaskDelay);
      } else {
        me.masked = null;
      }
    }
    get widgetClass() {
    }
  }, __publicField(_a, "config", {
    clearMaskDelay: null,
    // Test environment may be in a poll wait for mask to disappear.
    // Hiding the mask immediately, before the load sequence ends releases it too early
    testConfig: {
      clearMaskDelay: 0
    }
  }), _a;
};

export {
  TimeZonedDatesMixin_default,
  TimeSpan,
  ResourceStoreMixin_default,
  PartOfProject_default,
  ResourceModelMixin_default,
  map,
  uniqueOnly,
  concat,
  concatIterable,
  CI,
  isInstanceOf,
  Mixin,
  MixinAny,
  Base2 as Base,
  AbstractPartOfProjectGenericMixin,
  AbstractPartOfProjectStoreMixin,
  AbstractPartOfProjectModelMixin,
  ResourceModel,
  AbstractResourceStoreMixin,
  PartOfBaseProject_default,
  ResourceStore,
  EventStoreMixin_default,
  GetEventsMixin_default,
  EventDayIndex,
  DayIndexMixin_default,
  RecurringTimeSpansMixin_default,
  RecurringEventsMixin_default,
  RecurrenceDayRuleEncoder,
  AbstractRecurrenceIterator,
  DailyRecurrenceIterator,
  WeeklyRecurrenceIterator,
  MonthlyRecurrenceIterator,
  YearlyRecurrenceIterator,
  RecurrenceModel,
  RecurringTimeSpan_default,
  EventModelMixin_default,
  AbstractHasAssignmentsMixin,
  EventModel,
  AbstractEventStoreMixin,
  EventStore,
  AssignmentModelMixin_default,
  AssignmentModel,
  AssignmentStoreMixin_default,
  isNotNumber,
  format,
  AbstractAssignmentStoreMixin,
  AssignmentStore,
  DependencyBaseModel,
  DependencyModel,
  DependencyStoreMixin_default,
  AbstractDependencyStoreMixin,
  DependencyStore,
  AbstractCrudManagerValidation_default,
  AbstractCrudManagerMixin_default,
  AjaxTransport_default,
  JsonEncoder_default,
  ProjectCrudManager_default,
  AbstractCrudManager,
  ProjectModelCommon_default,
  ResourceTimeRangeModel,
  ResourceTimeRangeStore,
  StoreTimeZonePlugin,
  ProjectModelTimeZoneMixin_default,
  TimeRangeModel,
  TimeRangeStore,
  ProjectModelMixin_default,
  ProjectCurrentConfig_default,
  CalendarIntervalMixin,
  CalendarIntervalStore,
  TimeUnit,
  ProjectConstraintResolution,
  ConstraintType,
  SchedulingMode,
  DependencyValidationResult,
  DependencyType,
  DependenciesCalendar,
  ProjectType,
  Direction,
  isEqualEffectiveDirection,
  ConstraintIntervalSide,
  MIN_DATE,
  MAX_DATE,
  isDateFinite,
  EdgeInclusion,
  CalendarIteratorResult,
  CalendarCache,
  stripDuplicates,
  IntervalCache,
  AbstractCalendarMixin,
  AbstractCalendarManagerStoreMixin,
  AbstractProjectMixin,
  ProjectModel,
  CrudManager,
  CrudManagerView_default
};
//# sourceMappingURL=chunk-KVD75ID2.js.map
