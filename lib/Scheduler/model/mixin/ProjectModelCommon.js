import Model from '../../../Core/data/Model.js';

/**
 * @module Scheduler/model/mixin/ProjectModelCommon
 */

/**
 * Mixin that provides helpful methods and properties for a `ProjectModel`. This mixin applies to all Bryntum products.
 * @mixin
 * @internal
 */
export default Target => class ProjectModelCommon extends (Target || Model) {
    static $name = 'ProjectModelCommon';

    static get configurable() {
        return {


            // Documented in Gantt/Scheduler/SchedulerPro version of ./model/ProjectModel since types differ
            assignments  : null,
            dependencies : null,
            resources    : null,
            timeRanges   : null
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
        const
            store = this.timeRangeStore,
            ret = [];

        for (const timeSpan of store) {
            // Collect occurrences for the recurring events in the record set
            if (timeSpan.isRecurring) {
                ret.push(...timeSpan.getOccurrencesForDateRange(startDate, endDate));
            }
            else if (timeSpan.startDate < endDate && startDate < timeSpan.endDate) {
                ret.push(timeSpan);
            }
        }

        return ret;
    }

    updateTimeRanges(timeRanges) {
        this.timeRangeStore.data = timeRanges;
    }

    getResourceTimeRanges(startDate, endDate) {
        const
            store = this.resourceTimeRangeStore,
            ret = [];

        for (const timeSpan of store) {
            // Collect occurrences for the recurring events in the record set
            if (timeSpan.isRecurring) {
                ret.push(...timeSpan.getOccurrencesForDateRange(startDate, endDate));
            }
            // A timerange may consist of just a startDate if it is intended to be a line.
            else if (timeSpan.startDate < endDate && (!timeSpan.endDate || startDate < timeSpan.endDate)) {
                ret.push(timeSpan);
            }
        }

        return ret;
    }

    //endregion
};
