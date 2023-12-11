import AjaxStore from '../../Core/data/AjaxStore.js';
import ResourceTimeRangeModel from '../model/ResourceTimeRangeModel.js';
import RecurringTimeSpansMixin from './mixin/RecurringTimeSpansMixin.js';

/**
 * @module Scheduler/data/ResourceTimeRangeStore
 */

/**
 * A class representing a collection of resource time ranges.
 * Contains a collection of {@link Scheduler.model.ResourceTimeRangeModel} records.
 * The class is used by the {@link Scheduler.feature.ResourceTimeRanges} feature.
 *
 * ## Recurring ranges support
 *
 * This class supports recurrence:
 *
 * ```javascript
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
 * @mixes Scheduler/data/mixin/RecurringTimeSpansMixin
 * @extends Core/data/AjaxStore
 */
export default class ResourceTimeRangeStore extends AjaxStore.mixin(RecurringTimeSpansMixin) {

    static $name = 'ResourceTimeRangeStore';

    static get defaultConfig() {
        return {
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

            /**
             * This store should be linked to a ResourceStore to link the time ranges to resources
             * @config {Scheduler.data.ResourceStore}
             */
            resourceStore : null,

            modelClass : ResourceTimeRangeModel,
            storeId    : 'resourceTimeRanges'
        };
    }

    set resourceStore(store) {
        this._resourceStore = store;

        // If store is assigned after configuration we need to init relations
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
        const rangesInDateRange = resourceRecord.timeRanges.flatMap(range => {
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
}
