import TimeSpan from './TimeSpan.js';
import RecurringTimeSpan from './mixin/RecurringTimeSpan.js';

/**
 * @module Scheduler/model/TimeRangeModel
 */

/**
 * This class represents a named time range. It is used by the {@link Scheduler.feature.TimeRanges} feature.
 *
 * This class inherits most of its fields from {@link Scheduler.model.TimeSpan}. The most important of these fields are
 * the following:
 *
 * - {@link #field-name}
 * - {@link #field-startDate}
 * - {@link #field-endDate}
 * - {@link #field-iconCls}
 *
 * It's an indirect subclass of {@link Core.data.Model}. Please refer to documentation of those classes to become
 * familiar with the base interface of this class.
 * The data source of any field can be customized in the subclass. Please refer to {@link Core.data.Model} for details.
 *
 * Time ranges may recur. See the {@link #field-recurrenceRule} field.
 *
 * @extends Scheduler/model/TimeSpan
 * @mixes Scheduler/model/mixin/RecurringTimeSpan
 * @uninherit Core/data/mixin/TreeNode
 */
export default class TimeRangeModel extends TimeSpan.mixin(RecurringTimeSpan) {
    static $name = 'TimeRangeModel';

    /**
     * @hidefields children, parentId, parentIndex
     */

    afterConstruct() {
        if (!this.endDate) {
            this.endDate = this.startDate;
        }
        super.afterConstruct();
    }
}
