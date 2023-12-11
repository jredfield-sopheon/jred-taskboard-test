import AjaxStore from '../../Core/data/AjaxStore.js';
import TimeRangeModel from '../model/TimeRangeModel.js';
import RecurringTimeSpansMixin from './mixin/RecurringTimeSpansMixin.js';

/**
 * @module Scheduler/data/TimeRangeStore
 */

/**
 * A class representing a collection of time ranges.
 * Contains a collection of {@link Scheduler.model.TimeRangeModel} records.
 * The class is used by the {@link Scheduler.feature.TimeRanges} feature.
 *
 * ## Recurring ranges support
 *
 * This class supports recurrence:
 *
 * ```javascript
 * const store = new TimeRangeStore({
 *     data : [{        {
 *         id             : 1,
 *         startDate      : '2019-01-01T11:00',
 *         endDate        : '2019-01-01T13:00',
 *         name           : 'Coffee break',
 *         // this time range should repeat every day
 *         recurrenceRule : 'FREQ=DAILY'
 *     }]
 * });
 * ```
 *
 * @mixes Scheduler/data/mixin/RecurringTimeSpansMixin
 * @extends Core/data/AjaxStore
 */
export default class TimeRangeStore extends AjaxStore.mixin(RecurringTimeSpansMixin) {
    static $name = 'TimeRangeStore';

    static defaultConfig = {
        /**
         * CrudManager must load stores in the correct order. Lowest first.
         * @private
         */
        loadPriority : 500,

        /**
         * CrudManager must sync stores in the correct order. Lowest first.
         * @private
         */
        syncPriority : 500,

        modelClass : TimeRangeModel,
        storeId    : 'timeRanges'
    };
}
