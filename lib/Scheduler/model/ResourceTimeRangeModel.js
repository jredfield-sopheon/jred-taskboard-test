import TimeSpan from './TimeSpan.js';
import RecurringTimeSpan from './mixin/RecurringTimeSpan.js';

/**
 * @module Scheduler/model/ResourceTimeRangeModel
 */

/**
 * This class represent a single resource time range in your schedule.
 * To style the rendered elements, use {@link Scheduler.model.TimeSpan#field-cls} or {@link #field-timeRangeColor} field.
 * The class is used by the {@link Scheduler.feature.ResourceTimeRanges} feature.
 *
 * ## Recurring ranges support
 *
 * You can also make ranges recurring by adding a `recurrenceRule` to the range data.
 *
 * ```javascript
 *
 * // Make new store that supports time ranges recurrence
 * const store = new ResourceTimeRangeStore({
 *     data : [{        {
 *         id             : 1,
 *         resourceId     : 'r1',
 *         startDate      : '2019-01-01T11:00',
 *         endDate        : '2019-01-01T13:00',
 *         name           : 'Coffee break',
 *         // this time range should repeat every day
 *         recurrenceRule : 'FREQ=DAILY'
 *     }]
 * });
 * ```
 *
 * @extends Scheduler/model/TimeSpan
 */
export default class ResourceTimeRangeModel extends TimeSpan.mixin(RecurringTimeSpan) {
    static $name = 'ResourceTimeRangeModel';

    //region Fields

    static fields = [
        /**
         * Id of the resource this time range is associated with
         * @field {String|Number} resourceId
         */
        'resourceId',

        /**
         * Controls this time range's primary color, defaults to using current themes default time range color.
         * @field {String} timeRangeColor
         */
        'timeRangeColor'
    ];

    static relations = {
        /**
         * The associated resource, retrieved using a relation to a ResourceStore determined by the value assigned
         * to `resourceId`. The relation also lets you access all time ranges on a resource through
         * `ResourceModel#timeRanges`.
         * @member {Scheduler.model.ResourceModel} resource
         */
        resource : {
            foreignKey            : 'resourceId',
            foreignStore          : 'resourceStore',
            relatedCollectionName : 'timeRanges',
            nullFieldOnRemove     : true
        }
    };

    static domIdPrefix = 'resourcetimerange';

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
}
