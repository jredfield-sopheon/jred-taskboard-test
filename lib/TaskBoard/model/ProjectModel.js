import SchedulerProjectModel from '../../Scheduler/model/ProjectModel.js';
import ProjectCrudManager from '../../Scheduler/data/mixin/ProjectCrudManager.js';
import TaskStore from '../store/TaskStore.js';
import TaskModel from './TaskModel.js';

/**
 * @module TaskBoard/model/ProjectModel
 */

/**
 * This class represents a global project of your TaskBoard - a central place for all data.
 *
 * It holds and links the stores usually used by TaskBoard:
 *
 * - {@link TaskBoard.store.TaskStore}
 * - {@link Scheduler.data.ResourceStore}
 * - {@link Scheduler.data.AssignmentStore}
 *
 * ## Loading remote data
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     project : {
 *         // Project configuration
 *     }
 * });
 * ```
 *
 * ## Loading inline data
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     project : {
 *         // Project configuration
 *     }
 * });
 * ```
 *
 * ## Getting modifications
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     project : {
 *         // Project configuration
 *     }
 * });
 * ```
 *
 * ## Built-in StateTrackingManager
 *
 * The project also has a built-in {@link Core.data.stm.StateTrackingManager StateTrackingManager} (STM for short), that
 * handles undo/redo for the project stores (additional stores can also be added). You can enable it to track all
 * project store changes:
 *
 * ```javascript
 * // Turn on auto recording when you create your TaskBoard:
 * const taskBoard = new TaskBoard({
 *     project : {
 *         stm : {
 *             autoRecord : true
 *         }
 *     }
 * });
 *
 * // Undo a transaction
 * project.stm.undo();
 *
 * // Redo
 * project.stm.redo();
 * ```
 *
 * @extends Scheduler/model/ProjectModel
 * @mixes Scheduler/data/mixin/ProjectCrudManager
 *
 * @typings Scheduler.model.ProjectModel -> Scheduler.model.SchedulerProjectModel
 */
export default class ProjectModel extends SchedulerProjectModel.mixin(ProjectCrudManager) {

    static configurable = {
        /**
         * Get/set {@link #property-taskStore} data.
         *
         * Always returns an array of {@link TaskBoard.model.TaskModel} but also accepts an array of
         * its configuration objects as input.
         *
         * @member {TaskBoard.model.TaskModel[]} tasks
         * @accepts {TaskBoard.model.TaskModel[]|TaskModelConfig[]}
         * @category Inline data
         */

        /**
         * The initial data, to fill the {@link #property-taskStore} with. Should be an array of
         * {@link TaskBoard.model.TaskModel} or its configuration objects.
         *
         * @config {TaskBoard.model.TaskModel[]|TaskModelConfig[]} tasks
         * @category Inline data
         */

        /**
         * The initial data, to fill the {@link #property-taskStore} with.
         * Should be an array of {@link TaskBoard.model.TaskModel} instances or its configuration objects.
         *
         * @config {TaskBoard.model.TaskModel[]|TaskModelConfig[]} tasksData
         * @category Legacy inline data
         */

        /**
         * The {@link TaskBoard.store.TaskStore store} holding the tasks information.
         *
         * See also {@link TaskBoard.model.TaskModel}
         *
         * @member {TaskBoard.store.TaskStore} taskStore
         * @category Models & Stores
         */

        /**
         * An {@link TaskBoard.store.TaskStore} instance or a config object.
         * @config {TaskStoreConfig|TaskBoard.store.TaskStore} taskStore
         * @category Models & Stores
         */

        /**
         * @hideconfigs timeRanges
         *              timeRangeStore,
         *              timeRangesData,
         *              timeRangeStoreClass,
         *              resourceTimeRanges,
         *              resourceTimeRangeStore,
         *              resourceTimeRangesData,
         *              resourceTimeRangeStoreClass,
         *              eventStoreClass,
         *              eventModelClass
         */

        /**
         * @hideproperties timeRangeStore,
         *                 resourceTimeRangeStore
         */

        eventStoreClass : TaskStore,
        eventModelClass : TaskModel,

        /**
         * The constructor to create a task store instance with.
         * Should be a class, subclassing the {@link TaskBoard.store.TaskStore}.
         * @config {TaskBoard.store.TaskStore}
         * @typings {typeof TaskStore}
         * @category Models & Stores
         */
        taskStoreClass : TaskStore,

        /**
         * The constructor of the task model class, to be used in the project.
         * Will be set as the {@link Core.data.Store#config-modelClass modelClass}
         * property of the {@link #property-taskStore}.
         * @config {TaskBoard.model.TaskModel}
         * @typings {typeof TaskModel}
         * @category Models & Stores
         */
        taskModelClass : TaskModel
    };

    construct(config) {
        if (config.tasks) {
            config.eventsData = config.tasks;
        }

        if (config.tasksData) {
            config.eventsData = config.tasksData;
        }

        if (config.taskStore) {
            config.eventStore = config.taskStore;
        }

        if (config.taskModelClass) {
            config.eventModelClass = config.taskModelClass;
        }

        if (config.taskStoreClass) {
            config.eventStoreClass = config.taskStoreClass;
        }

        super.construct(config);

        const me = this;

        me.addPrioritizedStore(me.assignmentStore);
        me.addPrioritizedStore(me.resourceStore);
        me.addPrioritizedStore(me.taskStore);
    }

    get taskStore() {
        return this.eventStore;
    }

    set taskStore(store) {
        this.eventStore = store;
    }

    get tasksData() {
        return this.eventsData;
    }

    set tasksData(data) {
        this.eventsData = data;
    }

    get tasks() {
        return this.eventsData;
    }

    set tasks(data) {
        this.events = data;
    }

    /**
     * Returns the data from the records of the projects stores, in a format that can be consumed by `loadInlineData()`.
     *
     * Used by JSON.stringify to correctly convert this project to json.
     *
     * ```javascript
     * const project = new ProjectModel({
     *     tasksData       : [...],
     *     resourcesData   : [...],
     *     assignmentsData : [...]
     * });
     *
     * const json = project.toJSON();
     *
     * // Result:
     * {
     *     taskData : [...],
     *     resourcesData : [...],
     *     assignmentsData : [...]
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
     * @category JSON
     */
    toJSON() {
        const
            { taskStore, assignmentStore, resourceStore } = this,
            result = {
                tasksData : taskStore.toJSON()
            };

        if (assignmentStore?.count) {
            result.assignmentsData = assignmentStore.toJSON();
        }

        if (resourceStore?.count) {
            result.resourcesData = resourceStore.toJSON();
        }

        return result;
    }
}
