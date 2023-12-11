import DateHelper from '../helper/DateHelper.js';

/**
 * @module Core/data/Duration
 */

/**
 * Object describing a duration.
 * @typedef {Object} DurationConfig
 * @property {Number} magnitude The magnitude of the duration
 * @property {String} unit The unit of the duration
 */

/**
 * Class which represents a duration object. A duration consists of a `magnitude` and a `unit`.
 *
 * ```javascript
 * {
 *    unit      : String,
 *    magnitude : Number
 * }
 * ```
 *
 * Valid values are:
 * - "millisecond" - Milliseconds
 * - "second" - Seconds
 * - "minute" - Minutes
 * - "hour" - Hours
 * - "day" - Days
 * - "week" - Weeks
 * - "month" - Months
 * - "quarter" - Quarters
 * - "year"- Years
 */
export default class Duration {

    /**
     * Duration constructor.
     * @param {Number|String} magnitude Duration magnitude value or a duration + magnitude string ('2h', '4d')
     * @param {String} [unit] Duration unit value
     */
    constructor(magnitude, unit) {
        // we treat `magnitude === null` specially, it indicates the user intention
        // to unschedule the task
        if (typeof magnitude === 'number' || magnitude === null) {
            this._magnitude = magnitude;
            this._unit = unit;
        }
        else {
            if (typeof magnitude === 'string') {
                Object.assign(this, DateHelper.parseDuration(magnitude));
            }
            if (typeof magnitude === 'object') {
                Object.assign(this, magnitude);
            }
        }
    }

    /**
     * Get/Set numeric magnitude `value`.
     * @property {Number}
     */
    get magnitude() {
        return this._magnitude;
    }

    set magnitude(value) {
        this._magnitude = (typeof value === 'number') && value;
    }

    /**
     * Get/Set duration unit to use with the current magnitude value.
     * Valid values are:
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
     * @member {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
     */
    get unit() {
        return this._unit;
    }

    set unit(value) {
        this._unit = DateHelper.parseTimeUnit(value);
    }

    get isValid() {
        return this._magnitude != null && Boolean(DateHelper.normalizeUnit(this._unit));
    }

    /**
     * The `milliseconds` property is a read only property which returns the number of milliseconds in this Duration
     * @property {Number}
     * @readonly
     */
    get milliseconds() {
        // There's no smaller time unit in the Date class than milliseconds, so round any divided values
        return this.isValid ? Math.round(DateHelper.asMilliseconds(this._magnitude, this._unit)) : 0;
    }

    /**
     * Returns truthy value if this Duration equals the passed value.
     * @param {Core.data.Duration} value
     * @returns {Boolean}
     */
    isEqual(value) {
        return Boolean(value) && this._magnitude != null && value._magnitude != null && this.milliseconds === value.milliseconds;
    }

    toString(useAbbreviation) {
        const
            me             = this,
            abbreviationFn = useAbbreviation ? 'getShortNameOfUnit' : 'getLocalizedNameOfUnit';
        return me.isValid ? `${me._magnitude} ${DateHelper[abbreviationFn](me._unit, me._magnitude !== 1)}` : '';
    }

    toJSON() {
        return this.toString();
    }

    valueOf() {
        return this.milliseconds;
    }

    diff(otherDuration) {
        return new Duration({
            unit      : this.unit,
            magnitude : DateHelper.as(this.unit, this.milliseconds - otherDuration.milliseconds)
        });
    }
};
