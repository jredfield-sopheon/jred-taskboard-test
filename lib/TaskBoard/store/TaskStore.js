import EventStore from '../../Scheduler/data/EventStore.js';
import TaskModel from '../model/TaskModel.js';

/**
 * @module TaskBoard/data/TaskStore
 */

/**
 * Store that holds the tasks of a TaskBoard. By default configured to use {@link TaskBoard.model.TaskModel} for its
 * records.
 *
 * Loaded and handled as a part of a {@link TaskBoard.model.ProjectModel project}. For example using inline data:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     project : {
 *         // Data to load into the TaskStore
 *         tasksData : [
 *             { id : 1, name : 'Some task', status : 'todo', prio : 'low' }
 *         ]
 *     }
 * }
 * ```
 *
 * When loaded using the {@link Scheduler.data.mixin.ProjectCrudManager CrudManager} functionality of the project, it
 * is populated from the `'tasks'` property in the
 * response:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     project : {
 *         transport : {
 *             load : {
 *                 url : 'load.php'
 *             }
 *         },
 *
 *         autoLoad : true
 *     }
 * }
 * ```
 *
 * Expected response format to populate the TaskStore:
 *
 * ```json
 * {
 *     "success"     : true,
 *     "tasks"       : {
 *         "rows" : [
 *             {
 *                 "id"     : 1,
 *                 "name"   : "Important task",
 *                 "status" : "todo",
 *                 "prio"   : "high"
 *             },
 *             ...
 *         ]
 *     }
 * }
 * ```
 *
 * @extends Scheduler/data/EventStore
 */
export default class TaskStore extends EventStore {
    static configurable = {

        autoAssignWeight : true,

        storeId : 'tasks',

        /**
         * Class used to represent records, defaults to {@link TaskBoard.model.TaskModel}
         * @config {TaskBoard.model.TaskModel}
         * @typings {typeof TaskModel}
         * @category Common
         */
        modelClass : TaskModel,

        /**
         * Configure with `true` to also remove the event when removing the last assignment from the linked
         * AssignmentStore.
         *
         * Defaults to `false` for TaskBoard since it is unexpected that a tasks disappears when unassigning the last
         * resource from it.
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        removeUnassignedEvent : false,

        /**
         * Initial sorters, format is `[{ field: 'name', ascending: false }, ...]`.
         *
         * By default the TaskStore is sorted by `weight`, tasks with higher weights are displayed further down.
         *
         * @config {Sorter[]|String[]}
         * @category Common
         */
        sorters : [
            { field : 'weight', ascending : true }
        ]
    };

    afterLoadData() {
        const { records } = this;

        if (this.autoAssignWeight && !records.some(r => r.weight != null)) {
            for (let i = 0; i < records.length; i++) {
                records[i].setData('weight', (i + 1) * 100);
            }
        }
    }
}
