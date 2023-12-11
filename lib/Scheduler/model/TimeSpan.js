import Model from '../../Core/data/Model.js';
import TimeZonedDatesMixin from './mixin/TimeZonedDatesMixin.js';
import DomClassList from '../../Core/helper/util/DomClassList.js';
import DH from '../../Core/helper/DateHelper.js';
import VersionHelper from '../../Core/helper/VersionHelper.js';
import BrowserHelper from '../../Core/helper/BrowserHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import Duration from '../../Core/data/Duration.js';

/**
 * @module Scheduler/model/TimeSpan
 */

/**
 * This class represent a simple date range. It is being used in various subclasses and plugins which operate on date ranges.
 *
 * It's a subclass of {@link Core.data.Model}.
 * Please refer to documentation of those classes to become familiar with the base interface of this class.
 *
 * A TimeSpan has the following fields:
 *
 * - {@link #field-startDate}    - start date of the task in the ISO 8601 format
 * - {@link #field-endDate}      - end date of the task in the ISO 8601 format (not inclusive)
 * - {@link #field-duration}     - duration, time between start date and end date
 * - {@link #field-durationUnit} - unit used to express the duration
 * - {@link #field-name}         - an optional name of the range
 * - {@link #field-cls}          - an optional CSS class to be associated with the range.
 *
 * The data source of any field can be customized in the subclass. Please refer to {@link Core.data.Model} for details. To specify
 * another date format:
 *
 * ```javascript
 * class MyTimeSpan extends TimeSpan {
 *   static get fields() {
 *      { name: 'startDate', type: 'date', dateFormat: 'DD/MM/YY' }
 *   }
 * }
 * ```
 *
 * @extends Core/data/Model
 * @mixes Scheduler/model/mixin/TimeZonedDatesMixin
 */
export default class TimeSpan extends Model.mixin(TimeZonedDatesMixin) {

    static $name = 'TimeSpan';

    //region Field definitions

    static fields = [
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
            name : 'startDate',
            type : 'date'
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
            name : 'endDate',
            type : 'date'
        },

        /**
         * The numeric part of the timespan's duration (the number of units).
         * @field {Number} duration
         * @category Scheduling
         */
        {
            name      : 'duration',
            type      : 'number',
            allowNull : true,
            internal  : true
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
            type         : 'durationunit',
            name         : 'durationUnit',
            defaultValue : 'd',
            internal     : true
        },

        /**
         * Calculated field which encapsulates the duration's magnitude and unit. This field will not be persisted,
         * setting it will update the {@link #field-duration} and {@link #field-durationUnit} fields.
         *
         * @field {DurationConfig|Core.data.Duration} fullDuration
         * @category Scheduling
         */
        {
            name    : 'fullDuration',
            persist : false,
            column  : {
                type : 'duration'
            },
            useProp : true
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
            name         : 'cls',
            defaultValue : '',
            internal     : true
        },

        /**
         * CSS class specifying an icon to apply to the rendered time span element.
         * **Note**: In case event is a milestone, using `iconCls` with dependency feature might slightly decrease
         * performance because feature will refer to the DOM to get exact size of the element.
         * @field {String} iconCls
         * @category Styling
         */
        {
            name     : 'iconCls',
            internal : true
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
            name     : 'style',
            type     : 'object',
            internal : true
        },

        /**
         * The name of the time span (or Event / Task)
         * @field {String} name
         * @category Common
         */
        {
            name         : 'name',
            type         : 'string',
            defaultValue : ''
        }
    ];

    //endregion

    //region Init

    construct(data, ...args) {
        const me = this;

        // fullDuration is a "calculated field", but convenient to allow supplying it in the data
        if (data?.fullDuration) {
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
        return DH.add(endDate, -duration, durationUnit);
    }

    internalCalculateEndDate(startDate, duration, durationUnit) {
        // Use hours to set end date in order to correctly process DST crossings???

        return DH.add(startDate, duration, durationUnit);
    }

    internalCalculateDuration(startDate, endDate, durationUnit) {
        return DH.as(durationUnit, DH.diff(startDate, endDate, 'h'), 'h');
    }

    // Separate fn to allow calling later with specific values (used by Baseline)
    internalNormalize(startDate, endDate, duration, durationUnit) {
        const
            me          = this,
            hasDuration = duration != null;

        // need to calculate duration (checking first since seemed most likely to happen)
        if (startDate && endDate && !hasDuration) {
            me.setData('duration', me.internalCalculateDuration(startDate, endDate, durationUnit));
        }
        // need to calculate endDate?
        else if (startDate && !endDate && hasDuration) {
            me.setData('endDate', me.internalCalculateEndDate(startDate, duration, durationUnit));
        }
        // need to calculate startDate
        else if (!startDate && endDate && hasDuration) {
            me.setData('startDate', me.internalCalculateStartDate(endDate, duration, durationUnit));
        }
    }

    normalize() {
        this.internalNormalize(
            this.startDate,
            this.endDate,
            this.duration,
            this.durationUnit || this.constructor.defaultValues.durationUnit // Default might not be applied yet
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
        const me = this;

        // If we are an occurrence, return our base recurring event's store
        if (me.isOccurrence) {
            return me.recurringTimeSpan.eventStore;
        }
        if (!me._eventStore) {
            me._eventStore = me.stores?.find(s => s.isEventStore);
        }
        return me._eventStore;
    }

    updateInternalCls(cls) {
        if (this._cls) {
            this._cls.value = cls;
        }
        else {
            this._cls = new DomClassList(cls);
        }
    }

    set internalCls(cls) {
        this.updateInternalCls(cls);
        this.set('cls', this._cls.value);
    }

    get internalCls() {
        const { cls } = this;
        // `cls` getter can be overriden so return `cls` value if it is DomClassList or assign it to `this._cls`
        if (cls?.isDomClassList) {
            return cls;
        }
        this.updateInternalCls(cls);
        this.setData('cls', this._cls.value);
        return this._cls;
    }

    get cls() {
        if (!this._cls) {
            this._cls = new DomClassList(super.get('cls'));
        }
        return this._cls;
    }

    set cls(cls) {
        this.internalCls = cls;
    }

    get startDate() {
        return this.get('startDate');
    }

    set startDate(date) {
        this.setStartDate(date);
    }

    get endDate() {
        return this.get('endDate');
    }

    set endDate(date) {
        this.setEndDate(date);
    }


    get endingDate() {
        const
            me = this,
            {
                endDate,
                startDate
            }  = me;

        if (endDate) {
            // Special case of startDate===endDate for allDay event:
            // if (Number(endDate) === Number(startDate) && me.allDay) {
            //     return DH.add(startDate, 1, 'd');
            // }
            // Nope... the above works fine except when the day start time is shifted. In this case we want the
            // event to appear as "all day" on the shifted day, but the above will push the endingDate beyond the
            // end of the shifted day.

            return endDate;
        }

        return DH.add(startDate, me.duration, me.durationUnit);
    }

    get duration() {
        return this.get('duration');
    }

    set duration(duration) {
        this.setDuration(duration, this.durationUnit);
    }

    get durationUnit() {
        return this.get('durationUnit');
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
        // Must be a number
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
        }
        else if (endDate) {
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
            return DH.getDurationInUnit(me.startDate, me.endDate, unit, doNotRound);
        }
        else {
            return DH.as(unit, me.duration, me.durationUnit);
        }
    }

    get fullDuration() {
        // Used for formatting during export
        return new Duration({
            unit      : this.durationUnit,
            magnitude : this.duration
        });
    }

    set fullDuration(duration) {
        if (typeof duration === 'string') {
            duration = DH.parseDuration(duration, true, this.durationUnit);
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
        const
            me    = this,
            toSet = {
                startDate : date
            };

        if (date) {
            let calcEndDate;

            if (keepDuration) {
                calcEndDate = me.duration != null;
            }
            else {
                if (me.endDate) {
                    toSet.duration = me.internalCalculateDuration(date, me.endDate, me.durationUnit);

                    if (toSet.duration < 0) {
                        throw new Error('Negative duration');
                    }
                }
                else {
                    calcEndDate = me.duration != null;
                }
            }

            if (calcEndDate) {
                toSet.endDate = me.internalCalculateEndDate(date, me.duration, me.durationUnit);
            }
        }
        else {
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
        const
            me    = this,
            toSet = {
                endDate : date
            };

        if (date) {
            let calcStartDate;

            if (keepDuration === true) {
                calcStartDate = me.duration != null;
            }
            else {
                if (me.startDate) {
                    toSet.duration = me.internalCalculateDuration(me.startDate, date, me.durationUnit);

                    if (toSet.duration < 0) throw new Error('Negative duration');
                }
                else {
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
            throw new Error('Start date must be less or equal to end date');
        }
        this.set({
            startDate : start,
            endDate   : end
        }, null, silent);
    }

    /**
     * Returns an array of dates in this range. If the range starts/ends not at the beginning of day, the whole day will be included.
     * @readonly
     * @property {Date[]}
     * @category Scheduling
     */
    get dates() {
        const
            dates     = [],
            startDate = DH.startOf(this.startDate, 'day'),
            endDate   = this.endDate;

        for (let date = startDate; date < endDate; date = DH.add(date, 1, 'day')) {
            dates.push(date);
        }

        return dates;
    }

    get startDateMS() {
        return (this.batching && this.hasBatchedChange('startDate') ? this.get('startDate') : this.startDate)?.getTime();
    }

    get endDateMS() {
        return (this.batching && this.hasBatchedChange('endDate') ? this.get('endDate') : this.endDate)?.getTime();
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
        return DH.asMilliseconds(this.duration || 0, this.durationUnit);
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
        if (typeof field !== 'string') {
            // If user is updating multiple properties in one go using an object, we help out
            // by filling out missing schedule related data

            let { startDate, endDate, duration, durationUnit = this.durationUnit } = field;

            // Conversion is usually handled in inSet, but we are normalizing prior to that and have to handle it here
            if (typeof startDate === 'string') {
                startDate = this.getFieldDefinition('startDate').convert(startDate);
            }

            if (typeof endDate === 'string') {
                endDate = this.getFieldDefinition('endDate').convert(endDate);
            }

            if ('duration' in field) {
                if (startDate && !endDate) {
                    endDate = this.internalCalculateEndDate(startDate, duration, durationUnit);
                }

                if (!startDate && endDate) {
                    startDate = this.internalCalculateStartDate(endDate, duration, durationUnit);
                }
            }
            else if (startDate && endDate) {
                // Calculate duration in hours and covert to target duration unit in order to avoid extra DST conversion
                duration = this.internalCalculateDuration(startDate, endDate, durationUnit);
            }

            // A framework (React tested) may freeze passed field object, so clone it in that case
            const fieldOrClone = Object.isFrozen(field) ? ObjectHelper.clone(field) : field;
            startDate && (fieldOrClone.startDate = startDate);
            endDate && (fieldOrClone.endDate = endDate);
            duration != null && (fieldOrClone.duration = duration);

            return fieldOrClone;
        }
    }

    fieldToKeys(field, value) {
        const result = super.fieldToKeys(field, value);

        // Replace fullDuration with duration and durationUnit in calls to `set()`
        if (result.fullDuration) {
            const { magnitude, unit } = result.fullDuration;
            result.duration     = magnitude;
            result.durationUnit = unit;
        }

        // Engine handles this for event & tasks
        if (!this.isEventModel && !this.isTaskModel) {
            // Recalculate start/end date if duration is set with only one of them
            if (('duration' in result || result.durationUnit) && !(result.startDate && result.endDate)) {
                Object.assign(
                    result,
                    this.updateDatesFromDuration(
                        result.duration ?? this.duration,
                        result.durationUnit ?? this.durationUnit,
                        result.startDate,
                        result.endDate
                    )
                );
            }
        }

        return result;
    }

    inSet(field, value, silent, fromRelationUpdate, skipAccessors, validOnly, triggerBeforeUpdate) {
        const me = this;

        if (!skipAccessors) {
            field = me.inSetNormalize(field) || field;
        }

        const result = super.inSet(field, value, silent, fromRelationUpdate, skipAccessors, validOnly, triggerBeforeUpdate);

        if (!me.project?.isWritingData && field.startDate && field.endDate) {
            let invalid;
            if (field.startDate instanceof Date && field.endDate instanceof Date) {
                invalid = field.startDate > field.endDate;
            }
            else if (me.fieldMap.startDate.convert(field.startDate) > me.fieldMap.endDate.convert(field.endDate))  {
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
        if (key === 'cls') {
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
        return !startDate || !endDate || (endDate - startDate >= 0);
    }

    /**
     * Shift the dates for the date range by the passed amount and unit
     * @param {'ms'|'s'|'m'|'h'|'d'|'w'|'M'|'y'} unit The unit to shift by, see {@link Core.helper.DateHelper}
     * for more information on valid formats.
     * @param {Number} amount The amount to shift
     */
    shift(amount, unit = this.durationUnit) {

        if (typeof amount === 'string') {
            const u = amount;

            amount = unit;
            unit = u;
        }

        return this.setStartDate(DH.add(this.startDate, amount, unit, true), true);
    }

    /**
     * Returns the WBS code of this model (e.g '2.1.3'). Only relevant when part of a tree store, as in the Gantt chart.
     * @property {String}
     * @category Parent & children
     */
    get wbsCode() {
        return this._wbsCode || this.indexPath.join('.');
    }

    set wbsCode(value) {
        // wbsCode needs to be writable to interop w/TaskModel and Baselines which copy this field value
        this._wbsCode = value;
    }

    fullCopy() {
        //NOT PORTED

        return this.copy.apply(this, arguments);
    }

    intersects(timeSpan) {
        return this.intersectsRange(timeSpan.startDate, timeSpan.endDate);
    }

    intersectsRange(start, end) {
        const
            myStart = this.startDate,
            myEnd   = this.endDate;

        return myStart && myEnd && DH.intersectSpans(myStart, myEnd, start, end);
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
        const
            me             = this,
            clone          = me.copy(),
            {
                fullDuration,
                eventStore,
                assignmentStore
            }              = me,
            oldDuration    = new Duration(fullDuration),
            cloneDuration  = new Duration(fullDuration);

        let ownNewDuration,
            unitsChanged;

        if (typeof splitPoint === 'string') {
            ownNewDuration = new Duration(splitPoint);

            // New duration specified in same time units as current duration
            if (ownNewDuration.unit === oldDuration.unit) {
                cloneDuration.magnitude -= ownNewDuration.magnitude;
            }
            // New duration is in different units, so convert clone's duration to match
            else {
                cloneDuration.magnitude = DH.as(ownNewDuration.unit, oldDuration) - ownNewDuration.magnitude;
                cloneDuration.unit = ownNewDuration.unit;
                unitsChanged = true;
            }
        }
        else {
            ownNewDuration = new Duration(splitPoint > 1 ? splitPoint : me.duration * splitPoint, me.durationUnit);
            cloneDuration.magnitude -= ownNewDuration.magnitude;
        }

        clone.startDate = DH.add(me.startDate, ownNewDuration.magnitude, ownNewDuration.unit);

        if (unitsChanged) {
            clone.fullDuration = cloneDuration;
            me.fullDuration = ownNewDuration;
        }
        else {
            clone.duration = cloneDuration.magnitude;
            me.duration = ownNewDuration.magnitude;
        }

        if (eventStore) {
            eventStore.add(clone);

            if (assignmentStore && !eventStore.usesSingleAssignment) {
                assignmentStore.add(
                    me.assignments.map(assignment => {
                        const clonedData = Object.assign({}, assignment.data, {
                            eventId  : clone.id,
                            // From engine
                            event    : null,
                            resource : null
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
            return '';
        }

        const
            {
                startDate,
                endDate
            }         = this,
            // To allow testing using a fixed timestamp value
            timestamp = icsEventConfig.DTSTAMP || DH.format(new Date(), 'uu');

        delete icsEventConfig.DTSTAMP;

        let startEnd = {};

        if (this.allDay) {
            startEnd = {
                'DTSTART;VALUE=DATE' : DH.format(startDate, 'u'),
                'DTEND;VALUE=DATE'   : DH.format(endDate, 'u')
            };
        }
        else {
            startEnd = {
                DTSTART : DH.format(startDate, 'uu'),
                DTEND   : DH.format(endDate, 'uu')
            };
        }

        const
            version       = (VersionHelper.scheduler && VersionHelper.getVersion('scheduler')) || (VersionHelper.calendar && VersionHelper.getVersion('calendar')) || '',
            icsWrapConfig = {
                BEGIN    : 'VCALENDAR',
                VERSION  : '2.0',
                CALSCALE : 'GREGORIAN',
                PRODID   : `-//Bryntum AB//Bryntum Scheduler ${version} //EN`,
                END      : 'VCALENDAR'
            },
            eventConfig   = {
                BEGIN   : 'VEVENT',
                UID     : this.id + '@bryntum.com',
                CLASS   : 'PUBLIC',
                SUMMARY : this.name,
                DTSTAMP : timestamp,
                ...startEnd,
                ...(this.recurrenceRule ? { RRULE : this.recurrenceRule } : {}),
                ...icsEventConfig,
                END     : 'VEVENT'
            },
            icsItems      = Object.keys(icsWrapConfig).map(key => `${key}:${icsWrapConfig[key]}`),
            eventItems    = Object.keys(eventConfig).map(key => `${key}:${eventConfig[key]}`);

        // Inject event details before the closing VCALENDAR entry
        icsItems.splice(icsItems.length - 1, 0, ...eventItems);

        return icsItems.join('\n');
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
            const blob = new Blob([this.toICSString(icsEventConfig)], { type : 'text/calendar' });

            BrowserHelper.downloadBlob(blob, (this.name || 'Event') + '.ics');
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
        // return undefined for unknown fields
        return this.getFieldDefinition(fieldName) ? true : undefined;
    }

    isFieldModified(fieldName) {
        if (fieldName === 'fullDuration') {
            return super.isFieldModified('duration') || super.isFieldModified('durationUnit');
        }
        return super.isFieldModified(fieldName);
    }
}
